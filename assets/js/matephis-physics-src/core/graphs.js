/**
 * Graphs of a scene's quantities over time ("graphs"), drawn by the plot
 * engine (matephis-plot.js must be on the page; notes with graphs load it).
 *
 *   "graphs": [
 *     { "y": "x", "label": "x(t)", "axisLabels": ["t (s)", "x (m)"] },
 *     { "y": ["0.5*m*v^2", "0.5*k*x^2"], "legend": ["K", "U"] },
 *     { "x": "x", "y": "v", "label": "Piano delle fasi" }
 *   ]
 *
 * The expressions are evaluated over the precomputed run (the simulation
 * samples them together with everything else), so they can read the state,
 * params and object values ("A.speed", "A.N.mag"). While time runs a cursor
 * marks the current instant: a vertical line (graphs over t) and a point on
 * each curve. "progressive": true draws the curves only up to now.
 */
import { niceStep } from '../../matephis-plot-src/renderers/grid-renderer.js';

const GRAPH_KEYS = ['y', 'x', 'label', 'legend', 'axisLabels', 'xlim', 'ylim', 'aspectRatio', 'cursor', 'progressive', 'colors', 'plot'];
const COLORS = ['summer1', 'summer2', 'summer4', 'summer6', 'summer7', 'summer5'];

const listOf = (v) => (Array.isArray(v) ? v : v !== undefined ? [v] : []);

/** [min, max] of the finite values, padded; 0 included when it is close. */
function autoRange(values, pad = 0.08) {
    let lo = Infinity, hi = -Infinity;
    values.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    if (!isFinite(lo)) return [-1, 1];
    if (lo >= 0 && lo < 0.25 * hi) lo = 0;
    if (hi <= 0 && hi > 0.25 * lo) hi = 0;
    if (hi - lo < 1e-9) return [lo - 1, hi + 1];
    const d = (hi - lo) * pad;
    return [lo === 0 ? 0 : lo - d, hi === 0 ? 0 : hi + d];
}

export class Graphs {
    constructor(scene, defs) {
        this.scene = scene;
        this.el = document.createElement('div');
        this.el.className = 'matephis-physics-graphs';
        this.items = defs.map((d, i) => this._item(d, i)).filter(Boolean);
        this.count = this.items.length;
        if (this.count && typeof window !== 'undefined' && !window.MatephisPlot) {
            scene._addWarning('graphs: the plot engine (matephis-plot.js) is not on the page');
        }
    }

    _item(d, i) {
        const s = this.scene;
        if (!d || typeof d !== 'object' || d.y === undefined) {
            s._addWarning(`graphs[${i}]: needs "y" (an expression or a list of them)`);
            return null;
        }
        Object.keys(d).filter(k => !GRAPH_KEYS.includes(k)).forEach(k => s._addWarning(`graphs[${i}]: unknown key '${k}'`));
        const compile = (src, where) => {
            try {
                return s.compiler.fn(String(src), []);
            } catch (e) {
                s._addWarning(`graphs[${i}] ${where}: ${e.message}`);
                return () => NaN;
            }
        };
        const xSrc = d.x !== undefined ? String(d.x) : 't';
        const ySrcs = listOf(d.y).map(String);
        const box = document.createElement('figure');
        box.className = 'matephis-physics-graph';
        if (d.label !== undefined) {
            const title = document.createElement('figcaption');
            title.textContent = d.label;
            box.appendChild(title);
        }
        const host = document.createElement('div');
        box.appendChild(host);
        this.el.appendChild(box);
        return {
            def: d, host, overTime: xSrc === 't',
            fx: compile(xSrc, 'x'), fys: ySrcs.map((y, k) => compile(y, `y[${k}]`)),
            xSrc, ySrcs, plot: null, ts: [], xs: [], ys: [],
        };
    }

    beginSamples() {
        this.items.forEach(it => { it.ts = []; it.xs = []; it.ys = it.fys.map(() => []); });
    }

    /** Values at one instant of the run (the scene is resolved there). */
    addSample(t) {
        this.items.forEach(it => {
            it.ts.push(t);
            it.xs.push(it.overTime ? t : it.fx());
            it.fys.forEach((f, k) => it.ys[k].push(f()));
        });
    }

    endSamples() {
        this.items.forEach(it => {
            const d = it.def;
            const lim = (v, where) => (Array.isArray(v) && v.length === 2 ? v.map(e => this.scene._num(e, `graphs ${where}`)) : null);
            it.xlim = lim(d.xlim, 'xlim') || (it.overTime ? [0, Math.max(it.ts[it.ts.length - 1] || 0, 1e-6)] : autoRange(it.xs, 0.05));
            it.ylim = lim(d.ylim, 'ylim') || autoRange(it.ys.flat());
            if (it.plot) it.plot.view = { xMin: it.xlim[0], xMax: it.xlim[1], yMin: it.ylim[0], yMax: it.ylim[1] };
        });
    }

    _create(it) {
        const d = it.def;
        const plotCfg = {
            // Wide and low on a page, taller on a phone so curves and numbers keep some room
            fullWidth: true, aspectRatio: d.aspectRatio !== undefined ? d.aspectRatio : (it.host.clientWidth || 600) < 520 ? 1.6 : 2.5, grid: true,
            // Axes on the edges of a box, numbers and labels outside: curves are never covered
            boxPlot: true, padding: 'auto',
            xlim: it.xlim, ylim: it.ylim, showToolbar: false,
            // Small plots: about 6 grid steps across and 4 up (the plot's default is one per 100 px)
            xStep: niceStep(it.xlim[1] - it.xlim[0], 600), yStep: niceStep(it.ylim[1] - it.ylim[0], 400),
            axisLabels: Array.isArray(d.axisLabels) ? d.axisLabels : [it.overTime ? 't (s)' : it.xSrc, it.ySrcs.length === 1 ? it.ySrcs[0] : ''],
            legend: Array.isArray(d.legend), data: [],
            ...(d.plot && typeof d.plot === 'object' ? d.plot : {}),
        };
        it.plot = new window.MatephisPlot(it.host, plotCfg, { noLightbox: true, params: this.scene.params });
        it.plot.view = { xMin: it.xlim[0], xMax: it.xlim[1], yMin: it.ylim[0], yMax: it.ylim[1] };
    }

    /** Redraws with the cursor at the current time (after the scene was resolved there). */
    update() {
        if (typeof window === 'undefined' || !window.MatephisPlot) return;
        const sim = this.scene.sim;
        const t = sim ? sim.t : 0;
        const live = !!(sim && sim.hasClock);
        this.items.forEach(it => {
            if (!it.plot) this._create(it);
            const d = it.def;
            const colors = listOf(d.colors);
            const legend = Array.isArray(d.legend) ? d.legend : [];
            const upTo = d.progressive === true ? it.ts.findIndex(tt => tt > t + 1e-9) : -1;
            const n = upTo < 0 ? it.ts.length : upTo;
            const data = it.ys.map((ys, k) => ({
                series: ys.slice(0, n).map((y, j) => [it.xs[j], y]),
                color: colors[k] || COLORS[k % COLORS.length], width: 2.5,
                ...(legend[k] !== undefined ? { label: String(legend[k]) } : {}),
            }));
            if (d.cursor !== false && live) {
                if (it.overTime) data.push({ x: t, color: 'black', width: 1, dash: '5,4', opacity: 0.6 });
                const x = it.overTime ? t : it.fx();
                it.fys.forEach((f, k) => {
                    const y = f();
                    if (isFinite(x) && isFinite(y)) data.push({ points: [[x, y]], color: colors[k] || COLORS[k % COLORS.length], radius: 4.5 });
                });
            }
            it.plot.config.data = data;
            it.plot.draw();
        });
    }

    destroy() {
        this.items.forEach(it => { if (it.plot && it.plot.destroy) it.plot.destroy(); });
    }
}
