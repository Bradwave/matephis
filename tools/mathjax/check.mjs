#!/usr/bin/env node
/**
 * Checks the build-time typesetting against MathJax in the browser, formula by formula.
 *
 *   bundle exec jekyll build -d /tmp/site && node tools/mathjax/check.mjs /tmp/site
 *
 * Copies the built site (not yet pre-rendered), pre-renders the copy, serves both, and in
 * headless Chrome compares every formula of the page text (engine labels are left to the
 * browser in both): the SVG markup (attribute order and "0px" normalised), the size on screen,
 * the hidden MathML. It also prints the font metrics the browser measured around formulas,
 * which is what prerender.mjs's METRICS table must hold after a change of fonts or sizes.
 */
import { cpSync, mkdtempSync, readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, relative } from 'node:path';
import { launch, sleep } from '../bench/cdp.mjs';
import { prerenderPage } from './prerender.mjs';
import { writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src || !existsSync(src)) { console.error('usage: node tools/mathjax/check.mjs <built site, not pre-rendered>'); process.exit(2); }
const work = mkdtempSync(join(tmpdir(), 'mathjax-check-'));
const raw = join(work, 'raw'), pre = join(work, 'pre');
cpSync(src, raw, { recursive: true });
cpSync(src, pre, { recursive: true });

const pages = [];
const walk = (d) => {
    for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p);
        else if (n.endsWith('.html')) {
            const res = prerenderPage(readFileSync(p, 'utf8'));
            if (res) { writeFileSync(p, res.html); pages.push(relative(pre, p)); }
        }
    }
};
walk(pre);

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const serve = (root, port) => new Promise((resolve) => {
    const server = createServer((req, res) => {
        let p = normalize(join(root, decodeURIComponent(req.url.split('?')[0])));
        if (!p.startsWith(root)) { res.writeHead(403); res.end(); return; }
        if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
        if (!existsSync(p)) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' });
        res.end(readFileSync(p));
    });
    server.listen(port, () => resolve(server));
});
const servers = [await serve(raw, 4511), await serve(pre, 4512)];

const COLLECT = `(async () => {
  const mj = window.MathJax;
  if (mj && mj.startup && mj.startup.promise) { try { await mj.startup.promise; } catch (_) {} }
  await new Promise(r => setTimeout(r, 300));
  const items = mj && mj.startup && mj.startup.document ? Array.from(mj.startup.document.math) : [];
  const metrics = new Map(items.map(m => [m.typesetRoot, m.metrics]));
  return [...document.querySelectorAll('mjx-container')].filter(el => !el.closest('[class*="matephis-"]') && !el.closest('svg')).map(el => {
    const svg = el.querySelector('svg'); const r = el.getBoundingClientRect(); const m = metrics.get(el);
    let where = []; for (let n = el.parentElement, i = 0; n && i < 3; n = n.parentElement, i++) where.push(n.tagName.toLowerCase() + (typeof n.className === 'string' && n.className ? '.' + n.className.split(' ')[0] : ''));
    return { svg: svg ? svg.outerHTML : '', w: r.width, h: r.height, mml: !!el.querySelector('mjx-assistive-mml'),
      metrics: m ? 'em ' + m.em.toFixed(2) + ', ex ' + m.ex.toFixed(3) : null, where: where.join(' < ') };
  });
})()`;
const canon = (s) => s.replace(/\b0px\b/g, '0').replace(/<([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>/g, (m, tag, attrs, sl) => {
    const list = (attrs.match(/[^\s=>/]+(?:="[^"]*")?/g) || []).sort();
    return `<${tag}${list.length ? ' ' + list.join(' ') : ''}${sl}>`;
});

const chrome = await launch({ width: 1280, height: 900 });
let total = 0, same = 0, sized = 0, noMml = 0;
const counted = [], differing = [], metrics = {};
try {
    await chrome.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const p of pages) {
        const get = async (port) => { await chrome.send('Page.navigate', { url: `http://localhost:${port}/${p}` }); await sleep(1500); return chrome.evaluate(COLLECT); };
        const a = await get(4511), b = await get(4512);
        if (a.length !== b.length) { counted.push(`${p}: ${a.length} formulas in the browser, ${b.length} pre-rendered`); continue; }
        a.forEach((x, i) => {
            total++;
            const y = b[i];
            if (canon(x.svg) === canon(y.svg)) same++;
            else differing.push(`${p} #${i} (${x.where})`);
            if (Math.abs(x.w - y.w) > 0.5 || Math.abs(x.h - y.h) > 0.5) sized++;
            if (x.mml && !y.mml) noMml++;
            if (x.metrics) { const k = `${x.metrics}  ${x.where}`; metrics[k] = (metrics[k] || 0) + 1; }
        });
    }
} finally {
    chrome.close();
    servers.forEach((s) => s.close());
}
console.log(`${pages.length} pages, ${total} formulas: ${same} identical, ${total - same} differing, ${sized} differ on screen by more than 0.5 px, ${noMml} without hidden MathML`);
counted.forEach((l) => console.log('  count:', l));
differing.slice(0, 30).forEach((l) => console.log('  differs:', l));
console.log('\nFont metrics measured by the browser (count, metrics, nearest elements):');
Object.entries(metrics).sort((x, y) => y[1] - x[1]).slice(0, 25).forEach(([k, v]) => console.log(`  ${v}\t${k}`));
process.exitCode = counted.length ? 1 : 0;
