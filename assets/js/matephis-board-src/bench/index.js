/**
 * Matephis Board benchmark (/board/bench/).
 *
 * Runs the real board pieces (ink surface, input, widgets with the plot and physics engines)
 * in a full-screen stage and replays fixed scenarios, measuring what the device actually
 * shows: intervals between animation frames (which include painting and compositing, the part
 * script timing cannot see) and the script time of each frame. The same page runs in headless
 * Chrome with CPU throttling (tools/bench/run-headless.mjs), so the board's numbers give a
 * calibrated slowdown factor for everyday development.
 *
 * Nothing is saved: the board's own storage is never touched.
 */

import { HistoryStack } from '../ink/history.js';
import { InkSurface } from '../ink/surface.js';
import { InputController } from '../ink/input.js';
import { BoardScene } from '../model/scene.js';
import { BoardOverlay } from '../ui/overlay.js';
import { EngineLoader } from '../ui/engine-loader.js';
import { WidgetManager } from '../ui/widgets.js';
import { PHYSICS_PRESET_SECTIONS } from '../ui/physics-presets.js';
import { ExpressionCompiler } from '../../matephis-plot-src/parser/expression-parser.js';

const VERSION = 1;
const SCENARIO_MS = 3000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

function preset(id) {
    for (const s of PHYSICS_PRESET_SECTIONS) for (const it of s.items) if (it.id === id) return it.data;
    return null;
}

function stats(list) {
    if (!list.length) return null;
    const s = [...list].sort((a, b) => a - b);
    const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
    const mean = list.reduce((a, b) => a + b, 0) / list.length;
    return { n: list.length, mean: +mean.toFixed(2), med: +q(0.5).toFixed(2), p95: +q(0.95).toFixed(2), max: +s[s.length - 1].toFixed(2) };
}

// =========================================================================
// DEVICE
// =========================================================================

function deviceInfo() {
    const ua = navigator.userAgent;
    const chrome = (ua.match(/Chrome\/([\d.]+)/) || [])[1] || null;
    const android = (ua.match(/Android ([\d.]+)/) || [])[1] || null;
    let gpu = null;
    try {
        const gl = document.createElement('canvas').getContext('webgl');
        const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
        gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : (gl ? gl.getParameter(gl.RENDERER) : null);
    } catch (_) { /* no WebGL */ }
    let desync = null;
    try {
        const ctx = document.createElement('canvas').getContext('2d', { desynchronized: true });
        desync = ctx && ctx.getContextAttributes ? !!ctx.getContextAttributes().desynchronized : null;
    } catch (_) { /* old browser */ }
    return {
        userAgent: ua,
        chrome,
        android,
        screen: `${screen.width}×${screen.height}`,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio || 1,
        devicePixels: `${Math.round(window.innerWidth * (window.devicePixelRatio || 1))}×${Math.round(window.innerHeight * (window.devicePixelRatio || 1))}`,
        cores: navigator.hardwareConcurrency || null,
        memoryGB: navigator.deviceMemory || null,
        touchPoints: navigator.maxTouchPoints || 0,
        gpu,
        desynchronizedCanvas: desync,
    };
}

// =========================================================================
// FRAME LOOP
// =========================================================================

/**
 * Calls `step(i, elapsedMs)` once per animation frame for `ms`, and measures the intervals
 * between frames and the script time of each step. Long tasks are counted when supported.
 */
async function measureFrames(ms, step) {
    const intervals = [];
    const work = [];
    let longTasks = 0;
    let po = null;
    try {
        po = new PerformanceObserver((list) => { longTasks += list.getEntries().length; });
        po.observe({ entryTypes: ['longtask'] });
    } catch (_) { po = null; }
    await nextFrame();
    const t0 = performance.now();
    let last = t0;
    let i = 0;
    await new Promise((resolve) => {
        const loop = (ts) => {
            intervals.push(ts - last);
            last = ts;
            const w0 = performance.now();
            try { step(i++, ts - t0); } catch (e) { console.error(e); }
            work.push(performance.now() - w0);
            if (performance.now() - t0 < ms) requestAnimationFrame(loop);
            else resolve();
        };
        requestAnimationFrame(loop);
    });
    if (po) po.disconnect();
    intervals.shift(); // the first interval includes the setup
    const fr = stats(intervals);
    return {
        fps: fr ? +(1000 / fr.mean).toFixed(1) : null,
        frameMs: fr,
        scriptMs: stats(work),
        over33ms: intervals.filter((d) => d > 34).length,
        longTasks: po ? longTasks : null,
    };
}

// =========================================================================
// STAGE: the real board pieces, without toolbar or storage
// =========================================================================

class Stage {
    constructor(host, { lowDpr = false, fastPan = true } = {}) {
        this.root = document.createElement('div');
        this.root.className = 'board-root bench-stage';
        this.stageEl = document.createElement('div');
        this.stageEl.className = 'board-stage';
        this.root.appendChild(this.stageEl);
        host.appendChild(this.root);

        const rect = this.stageEl.getBoundingClientRect();
        this.scene = new BoardScene(rect.width || window.innerWidth, rect.height || window.innerHeight, { lowDpr, fastPan });
        this.history = new HistoryStack(150);
        this.overlay = new BoardOverlay(this.stageEl);
        this.surface = new InkSurface(this.stageEl, { scene: this.scene, overlay: this.overlay });
        this.surface.setOverlay(this.overlay);
        this.engineLoader = new EngineLoader();
        this.widgets = new WidgetManager(this.overlay, {
            scene: this.scene, history: this.history, surface: this.surface,
            engineLoader: this.engineLoader, getTheme: () => 'light',
        });
        this.tool = { tool: 'pen', penColor: 0, penWidth: 0.45, penStyle: 'solid', highlighterColor: 0, highlighterWidth: 4, eraserMode: 'stroke', eraserRadius: 4 };
        this.input = new InputController(this.surface, {
            scene: this.scene, history: this.history, overlay: this.overlay, getToolState: () => this.tool,
        });
        this.canvas = this.surface.activeCanvas;
    }

    get rect() { return this.canvas.getBoundingClientRect(); }

    pointer(type, id, x, y, kind = 'touch') {
        const r = this.rect;
        this.canvas.dispatchEvent(new PointerEvent(type, {
            pointerId: id, clientX: r.left + x, clientY: r.top + y, pointerType: kind, isPrimary: id === 1,
            bubbles: true, cancelable: true, width: 6, height: 6, pressure: 0.5,
            button: 0, buttons: type === 'pointerup' ? 0 : 1,
        }));
    }

    addStrokes(n) {
        const strokes = this.scene.generateStressStrokes(n);
        for (const s of strokes) this.scene.strokes.push(s);
        this.surface.renderCommittedNow();
    }

    async addWidget(kind, data, w = 135) {
        const widget = this.widgets.insertWidget(kind, data, { w });
        this.widgets.clearSelection();
        // Wait for the engine to load and the widget to draw
        for (let i = 0; i < 100; i++) {
            const entry = this.widgets.mounted.get(widget.id);
            if (entry && entry.instance) { await sleep(300); return entry.instance; }
            await sleep(100);
        }
        throw new Error(`widget ${kind} did not mount`);
    }

    destroy() {
        this.root.remove();
    }
}

// =========================================================================
// SCENARIOS
// =========================================================================

/** A handwriting-like path: lines of small loops, in stage pixels. */
function scribble(i, w, h) {
    const line = Math.floor(i / 120) % 6;
    const k = i % 120;
    return { x: w * 0.15 + k * (w * 0.6 / 120) + 12 * Math.cos(k * 0.7), y: h * 0.2 + line * h * 0.1 + 14 * Math.sin(k * 0.7) };
}

const SCENARIOS = [
    {
        id: 'cpu',
        label: 'Calcolo (CPU)',
        what: 'Espressioni compilate valutate 300 000 volte: misura solo il processore.',
        async run() {
            const p = { a: 1.3 };
            const c = new ExpressionCompiler({ getParams: () => p, getPoints: () => ({}), paramNames: ['a'] });
            const f = c.fn('a*sin(x)*exp(-x^2/10) + x^3/50 - sqrt(abs(x))');
            const times = [];
            for (let r = 0; r < 5; r++) {
                const t = performance.now();
                let s = 0;
                for (let i = 0; i < 300000; i++) s += f((i % 2000) / 100 - 10);
                times.push(performance.now() - t);
                if (!Number.isFinite(s)) throw new Error('bad sum');
                await sleep(0);
            }
            return { ms: stats(times) };
        },
    },
    {
        id: 'fill',
        label: 'Riempimento (GPU)',
        what: 'Tela a schermo intero, 20 rettangoli trasparenti per fotogramma: misura disegno e composizione.',
        async run(host) {
            const out = {};
            for (const dprCap of [null, 1]) {
                const c = document.createElement('canvas');
                c.className = 'bench-fill';
                host.appendChild(c);
                const dpr = dprCap || window.devicePixelRatio || 1;
                c.width = Math.round(window.innerWidth * dpr);
                c.height = Math.round(window.innerHeight * dpr);
                const ctx = c.getContext('2d');
                const r = await measureFrames(SCENARIO_MS / 1.5, (i) => {
                    ctx.clearRect(0, 0, c.width, c.height);
                    for (let k = 0; k < 20; k++) {
                        ctx.fillStyle = `rgba(${(i * 7 + k * 40) % 255}, 80, 160, 0.08)`;
                        ctx.fillRect(0, 0, c.width, c.height);
                    }
                });
                out[dprCap ? 'dpr1' : 'device'] = { dpr, ...r };
                c.remove();
            }
            return out;
        },
    },
    {
        id: 'ink',
        label: 'Scrittura',
        what: 'Tratti a mano libera disegnati dall\'input della lavagna, su una pagina con 300 tratti.',
        async run(host) {
            const st = new Stage(host);
            st.addStrokes(300);
            await sleep(200);
            const w = st.rect.width, h = st.rect.height;
            let down = false;
            const r = await measureFrames(SCENARIO_MS, (i) => {
                const k = i % 40;
                const p = scribble(i, w, h);
                if (k === 0) { st.pointer('pointerdown', 1, p.x, p.y); down = true; }
                else if (k === 39) { st.pointer('pointerup', 1, p.x, p.y); down = false; }
                else st.pointer('pointermove', 1, p.x, p.y);
            });
            if (down) st.pointer('pointerup', 1, 0, 0);
            r.committedRedrawMs = +st.surface.lastCommittedRedrawMs.toFixed(2);
            // Check that the replayed input really drew (else the numbers mean nothing)
            r.strokesDrawn = st.scene.strokes.length - 300;
            st.destroy();
            return r;
        },
    },
    {
        id: 'pan',
        label: 'Spostamento e zoom',
        what: 'Due dita che spostano e ingrandiscono una pagina con 600 tratti, un grafico e una scena di fisica.',
        async run(host) {
            const out = {};
            for (const [key, opts] of [['fastPan', { fastPan: true }], ['fullRedraw', { fastPan: false }], ['fastPanDpr1', { fastPan: true, lowDpr: true }]]) {
                const st = new Stage(host, opts);
                st.addStrokes(600);
                await st.addWidget('plot', { data: [{ fn: 'sin(x)' }, { fn: 'x^2/8' }], xlim: [-6, 6], ylim: [-2, 4] });
                await st.addWidget('physics', preset('mrua'));
                const w = st.rect.width, h = st.rect.height;
                const cx = w / 2, cy = h / 2;
                st.pointer('pointerdown', 11, cx - 120, cy);
                st.pointer('pointerdown', 12, cx + 120, cy);
                const cam = st.scene.camera;
                const seen = { minScale: cam.scale, maxScale: cam.scale, minX: cam.x, maxX: cam.x };
                const r = await measureFrames(SCENARIO_MS, (i) => {
                    seen.minScale = Math.min(seen.minScale, cam.scale); seen.maxScale = Math.max(seen.maxScale, cam.scale);
                    seen.minX = Math.min(seen.minX, cam.x); seen.maxX = Math.max(seen.maxX, cam.x);
                    const t = i / 60;
                    const dx = 140 * Math.sin(t * 2), dy = 80 * Math.sin(t * 1.3);
                    const spread = 120 * (1 + 0.35 * Math.sin(t * 1.7)); // pans, and zooms past the lock
                    st.pointer('pointermove', 11, cx - spread + dx, cy + dy);
                    st.pointer('pointermove', 12, cx + spread + dx, cy + dy);
                });
                st.pointer('pointerup', 11, cx, cy);
                st.pointer('pointerup', 12, cx, cy);
                await sleep(300);
                r.dpr = st.surface.dpr;
                // Check that the gesture really panned and zoomed
                r.zoomRange = +(seen.maxScale / seen.minScale).toFixed(2);
                r.panRangeMm = +(seen.maxX - seen.minX).toFixed(1);
                r.committedRedrawMs = +st.surface.lastCommittedRedrawMs.toFixed(2);
                out[key] = r;
                st.destroy();
            }
            return out;
        },
    },
    {
        id: 'plot',
        label: 'Grafico con cursore',
        what: 'Un cursore che muove un grafico sulla lavagna a ogni fotogramma: 5 funzioni, poi 2 curve implicite.',
        async run(host) {
            const out = {};
            const cases = {
                functions: { data: [{ fn: 'a*sin(x)' }, { fn: 'x^2/4 - a' }, { fn: 'a*exp(-x^2)' }, { fn: 'tan(x)/a' }, { fn: 'sqrt(abs(x))*cos(a*x)' }], params: { a: { val: 1, min: 0.5, max: 3, step: 0.01 } } },
                implicit: { data: [{ implicit: 'x^2 + a*y^2 = 16' }, { implicit: 'sin(x*y) = a/4' }], params: { a: { val: 1, min: 0.5, max: 3, step: 0.01 } }, xlim: [-5, 5], ylim: [-5, 5], aspectRatio: '1:1' },
            };
            for (const [key, cfg] of Object.entries(cases)) {
                const st = new Stage(host);
                const plot = await st.addWidget('plot', cfg, 160);
                let drawMs = 0, draws = 0;
                const r = await measureFrames(SCENARIO_MS, (i) => {
                    plot.sliders.setValue('a', 0.5 + 2.5 * (0.5 + 0.5 * Math.sin(i / 20)), false);
                    const t = performance.now(); plot.draw(); drawMs += performance.now() - t; draws++;
                });
                r.drawMs = +(drawMs / Math.max(1, draws)).toFixed(2);
                out[key] = r;
                st.destroy();
            }
            return out;
        },
    },
    {
        id: 'physics',
        label: 'Fisica',
        what: 'Una scena di fisica sulla lavagna: riproduzione con grafici, poi un cursore trascinato (ricalcolo del moto).',
        async run(host) {
            const out = {};
            {
                const st = new Stage(host);
                const sc = await st.addWidget('physics', preset('urto-1d'), 180);
                if (sc.clock) { sc.clock.seek(0); sc.clock.play(); }
                out.playback = await measureFrames(SCENARIO_MS, () => {});
                if (sc.clock) sc.clock.pause();
                st.destroy();
            }
            {
                const st = new Stage(host);
                const cfg = preset('urto-1d');
                const sc = await st.addWidget('physics', cfg, 180);
                if (sc.clock) sc.clock.pause();
                const d = cfg.params.m1;
                let drawMs = 0, draws = 0;
                out.slider = await measureFrames(SCENARIO_MS, (i) => {
                    sc.setParam('m1', d.min + (d.max - d.min) * (0.5 + 0.5 * Math.sin(i / 15)), false);
                    const t = performance.now(); sc.draw(); drawMs += performance.now() - t; draws++;
                });
                out.slider.drawMs = +(drawMs / Math.max(1, draws)).toFixed(2);
                st.destroy();
            }
            return out;
        },
    },
];

// =========================================================================
// PAGE
// =========================================================================

function summary(id, r) {
    if (!r || r.error) return r ? `errore: ${r.error}` : '';
    const f = (x) => (x ? `${x.fps} fps (mediana ${x.frameMs.med} ms, p95 ${x.frameMs.p95} ms)` : '');
    switch (id) {
        case 'cpu': return `${r.ms.med} ms`;
        case 'fill': return `schermo: ${f(r.device)} · a 1×: ${f(r.dpr1)}`;
        case 'ink': return f(r);
        case 'pan': return `immagine: ${f(r.fastPan)} · ridisegno: ${f(r.fullRedraw)} · immagine 1×: ${f(r.fastPanDpr1)}`;
        case 'plot': return `funzioni: ${f(r.functions)}, disegno ${r.functions.drawMs} ms · implicite: ${f(r.implicit)}, disegno ${r.implicit.drawMs} ms`;
        case 'physics': return `riproduzione: ${f(r.playback)} · cursore: ${f(r.slider)}, disegno ${r.slider.drawMs} ms`;
        default: return '';
    }
}

async function runAll({ only = null, onProgress = () => {} } = {}) {
    const host = document.getElementById('bench-host');
    const results = { version: VERSION, date: new Date().toISOString(), device: deviceInfo(), scenarios: {} };
    document.body.classList.add('bench-running');
    try {
        for (const sc of SCENARIOS) {
            if (only && !only.includes(sc.id)) continue;
            onProgress(sc);
            await sleep(300);
            try {
                results.scenarios[sc.id] = await sc.run(host);
            } catch (e) {
                results.scenarios[sc.id] = { error: String(e && e.message ? e.message : e) };
            }
            host.textContent = '';
        }
    } finally {
        document.body.classList.remove('bench-running');
    }
    window.MatephisBench.results = results;
    return results;
}

function initPage() {
    const root = document.getElementById('matephis-bench');
    if (!root) return;
    const $ = (sel) => root.querySelector(sel);
    const info = deviceInfo();
    $('[data-device]').innerHTML = Object.entries(info).filter(([k]) => k !== 'userAgent')
        .map(([k, v]) => `<tr><th>${k}</th><td>${v === null ? '—' : String(v)}</td></tr>`).join('');

    const list = $('[data-results]');
    list.innerHTML = SCENARIOS.map((s) => `<tr data-id="${s.id}"><th>${s.label}<small>${s.what}</small></th><td>—</td></tr>`).join('');
    const out = $('[data-json]');
    const status = $('[data-status]');
    const start = $('[data-start]');

    const run = async () => {
        start.disabled = true;
        out.value = '';
        const r = await runAll({ onProgress: (sc) => { status.textContent = `In corso: ${sc.label}…`; } });
        for (const s of SCENARIOS) {
            const cell = list.querySelector(`[data-id="${s.id}"] td`);
            if (cell) cell.textContent = summary(s.id, r.scenarios[s.id]);
        }
        out.value = JSON.stringify(r, null, 1);
        status.textContent = 'Fatto. Copia i risultati e inviali.';
        start.disabled = false;
    };
    start.addEventListener('click', run);

    $('[data-copy]').addEventListener('click', async () => {
        if (!out.value) return;
        try { await navigator.clipboard.writeText(out.value); status.textContent = 'Risultati copiati.'; }
        catch (_) { out.select(); document.execCommand('copy'); status.textContent = 'Risultati copiati.'; }
    });
    $('[data-download]').addEventListener('click', () => {
        if (!out.value) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([out.value], { type: 'application/json' }));
        a.download = `matephis-bench-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('[data-fullscreen]').addEventListener('click', () => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    });

    if (new URLSearchParams(location.search).get('auto') === '1') run();
}

window.MatephisBench = { runAll, deviceInfo, scenarios: SCENARIOS.map((s) => s.id), results: null };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
else initPage();
