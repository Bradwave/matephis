#!/usr/bin/env node
// Exactness check for engine changes: renders every physics scene or every plot of the notes
// (and the board's physics presets) with a given bundle, in headless Chrome, and records what
// they compute: for physics everything the simulation precomputes, for plots the SVG markup.
// Each scene is fingerprinted at load and after changing up to three parameters (plots also
// after a pan and on a redraw with nothing changed). Random parameters are seeded.
//
//   node tools/bench/fingerprint.mjs --engine physics|plot [--bundle assets/js/matephis-physics.js]
//        [--url http://localhost:4000/notes/cinematica-ripasso.html] --out before.json
//   node tools/bench/compare.mjs before.json after.json
//
// The page at --url must load MathJax and the plot engine (and physics, for physics); the
// bundle is then evaluated on top of it, so an old and a new build can be compared.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from './cdp.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
}, []));
const engine = args.engine;
if (engine !== 'physics' && engine !== 'plot') { console.error('--engine physics|plot'); process.exit(2); }
if (!args.out) { console.error('--out file.json'); process.exit(2); }
const bundle = readFileSync(args.bundle || join(ROOT, `assets/js/matephis-${engine}.js`), 'utf8');
const url = args.url || 'http://localhost:4000/notes/cinematica-ripasso.html';

/** Every ```<lang> block of the notes, plus (physics) the board presets. */
function collect() {
    const lang = engine === 'physics' ? 'physics' : 'matephis';
    const out = [];
    const walk = (d) => {
        for (const f of readdirSync(d)) {
            const p = join(d, f);
            if (statSync(p).isDirectory()) walk(p);
            else if (p.endsWith('.md')) {
                const re = new RegExp('```' + lang + '\\s*\\n([\\s\\S]*?)```', 'g');
                const src = readFileSync(p, 'utf8');
                let m, i = 0;
                while ((m = re.exec(src))) {
                    i++;
                    try { out.push({ name: `${basename(p)}#${i}`, cfg: JSON.parse(m[1]) }); } catch (_) { /* not JSON */ }
                }
            }
        }
    };
    walk(join(ROOT, '_notes'));
    if (engine === 'physics') {
        const s = readFileSync(join(ROOT, 'assets/js/matephis-board-src/ui/physics-presets.js'), 'utf8');
        const sections = JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf(']') + 1));
        sections.flatMap((x) => x.items).forEach((it) => out.push({ name: `preset:${it.id}`, cfg: it.data }));
    }
    return out;
}

const SEED = `{ let seed = 12345; Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); }`;

const PHYSICS = `async (scenes) => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const host = document.createElement('div'); host.style.cssText = 'width:700px'; document.querySelector('article, main, body').prepend(host);
  const plain = (v, depth = 0) => {
    if (v === null || typeof v !== 'object') return typeof v === 'number' ? (Number.isFinite(v) ? v : String(v)) : v;
    if (depth > 6) return '…';
    if (v instanceof Map) return [...v.entries()].map(([k, x]) => [typeof k === 'object' ? (k.id || k.type || '?') : k, plain(x, depth + 1)]);
    if (v instanceof Set) return [...v].map(x => plain(x, depth + 1));
    if (Array.isArray(v)) return v.map(x => plain(x, depth + 1));
    if (v.nodeType) return 'node';
    const o = {}; for (const k of Object.keys(v)) { if (typeof v[k] !== 'function') o[k] = plain(v[k], depth + 1); } return o;
  };
  const fp = (sc) => {
    const sim = sc.sim; if (!sim) return null;
    return plain({ tEnd: sim.tEnd, kin: sim.kin, tracks: sim.tracks, ghosts: sim.ghosts, maxMag: sim.maxMag, energy: sim.energy, skids: sim.skids,
      graphs: sc.graphs ? sc.graphs.items.map(it => ({ ts: it.ts, xs: it.xs, ys: it.ys, extra: it.extra, xlim: it.xlim, ylim: it.ylim })) : null,
      run: sim.run ? { n: sim.run.times.length, last: sim.run.states[sim.run.states.length - 1] } : null });
  };
  const out = {};
  for (const { name, cfg } of scenes) {
    host.innerHTML = '';
    ${SEED}
    let sc;
    try { sc = window.MatephisPhysics.render(host, JSON.parse(JSON.stringify(cfg)), { width: 700, observeResize: false, noLightbox: true }); }
    catch (e) { out[name] = { error: String(e) }; continue; }
    await sleep(30);
    if (sc.clock) sc.clock.pause();
    const rec = { initial: fp(sc), changes: [], ms: [] };
    const keys = Object.keys(cfg.params || {});
    for (let i = 0; i < Math.min(3, keys.length); i++) {
      const d = cfg.params[keys[i]]; if (typeof d !== 'object' || typeof d.min !== 'number' || typeof d.max !== 'number') continue;
      for (const f of [0.3, 0.7]) {
        const t = performance.now(); sc.setParam(keys[i], d.min + (d.max - d.min) * f, false); sc.draw(); rec.ms.push(performance.now() - t);
        rec.changes.push(fp(sc));
      }
    }
    if (sc.sim) { sc.sim.seek(sc.sim.tEnd * 0.4); sc.draw(); rec.at40 = fp(sc); }
    out[name] = rec;
    try { sc.destroy && sc.destroy(); } catch (_) {}
  }
  return out;
}`;

const PLOT = `async (plots) => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const host = document.createElement('div'); host.style.width = '700px'; document.querySelector('article, main, body').prepend(host);
  const svgs = () => [...host.querySelectorAll('svg')].filter(s => !s.closest('mjx-container')).map(s => s.outerHTML.replace(/\\s+id="[^"]*"/g, '')).join('\\n');
  const all = (inst) => inst && inst.plots ? inst.plots : [inst];
  const out = {};
  for (const { name, cfg } of plots) {
    host.innerHTML = '';
    ${SEED}
    let inst;
    try { inst = window.MatephisPlot.render(host, JSON.parse(JSON.stringify(cfg)), { width: 700, observeResize: false, noLightbox: true }); }
    catch (e) { out[name] = { error: String(e) }; continue; }
    await sleep(20);
    const rec = { initial: svgs(), changes: [], ms: [] };
    for (const p of all(inst)) {
      if (!p || !p.config) continue;
      for (const k of Object.keys(p.config.params || {}).slice(0, 3)) {
        const d = p.config.params[k]; const min = Number(d.min), max = Number(d.max);
        if (!isFinite(min) || !isFinite(max) || !p.sliders) continue;
        for (const f of [0.3, 0.7]) {
          const t = performance.now(); p.sliders.setValue(k, min + (max - min) * f, false); p.draw(); rec.ms.push(performance.now() - t);
          rec.changes.push(svgs());
        }
      }
      if (p.view && p.view.xMin !== null) {
        const v = p.view, dx = (v.xMax - v.xMin) * 0.1;
        p.view = { xMin: v.xMin + dx, xMax: v.xMax + dx, yMin: v.yMin, yMax: v.yMax };
        const t = performance.now(); p.draw(); rec.ms.push(performance.now() - t);
        rec.changes.push(svgs());
      }
      const t = performance.now(); p.draw(); rec.ms.push(performance.now() - t);
      rec.changes.push(svgs());
    }
    out[name] = rec;
    try { inst.destroy && inst.destroy(); } catch (_) {}
  }
  return out;
}`;

const scenes = collect();
const chrome = await launch({ width: 1280, height: 900 });
try {
    await chrome.send('Page.navigate', { url });
    await sleep(4000);
    await chrome.evaluate(`${bundle}\n;0`);
    const res = await chrome.evaluate(`(${engine === 'physics' ? PHYSICS : PLOT})(${JSON.stringify(scenes)})`);
    writeFileSync(args.out, JSON.stringify(res));
    const ms = Object.values(res).flatMap((r) => r.ms || []);
    const errors = Object.values(res).filter((r) => r.error).length;
    console.log(`${engine}: ${Object.keys(res).length} scenes, ${errors} errors, ${ms.length} redraws in ${ms.reduce((a, b) => a + b, 0).toFixed(0)} ms -> ${args.out}`);
} finally {
    chrome.close();
}
