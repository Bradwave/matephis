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
 *
 * "position" places each graph: "below" the scene (default), "right" of it
 * (in a column beside the scene; under it again on narrow screens), or in
 * "tabs" under the scene, one graph at a time.
 */
import { niceStep } from '../../matephis-plot-src/renderers/grid-renderer.js';
import { parseAspectRatio } from '../../matephis-plot-src/core/config.js';

const GRAPH_KEYS = ['y', 'x', 'label', 'legend', 'axisLabels', 'xlim', 'ylim', 'aspectRatio', 'cursor', 'progressive', 'colors', 'plot', 'position'];
const POSITIONS = ['below', 'right', 'tabs'];

/** Where a graph goes ("below" when missing or unknown). */
export function graphPosition(d) {
    return d && POSITIONS.includes(d.position) ? d.position : 'below';
}
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
        // The column beside the scene; the scene puts it in place (see MatephisPhysics)
        this.sideEl = document.createElement('div');
        this.sideEl.className = 'matephis-physics-graphs matephis-physics-graphs-side';
        this.items = defs.map((d, i) => this._item(d, i)).filter(Boolean);
        this.count = this.items.length;
        this._initTabs();
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
        if (d.position !== undefined && !POSITIONS.includes(d.position)) {
            s._addWarning(`graphs[${i}]: position must be "below", "right" or "tabs"`);
        }
        const position = graphPosition(d);
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
        // In tabs the tab names the graph
        if (d.label !== undefined && position !== 'tabs') {
            const title = document.createElement('figcaption');
            title.textContent = d.label;
            box.appendChild(title);
        }
        // Legend as a line of text above the plot: inside it would cover the curves of a small graph
        let legendEl = null;
        if (Array.isArray(d.legend) && d.legend.length) {
            legendEl = document.createElement('div');
            legendEl.className = 'matephis-physics-graph-legend';
            d.legend.forEach(name => {
                const item = document.createElement('span');
                const swatch = document.createElement('span');
                swatch.className = 'matephis-physics-graph-swatch';
                item.append(swatch, document.createTextNode(String(name)));
                legendEl.appendChild(item);
            });
            box.appendChild(legendEl);
            const mj = typeof window !== 'undefined' && window.MathJax;
            if (d.legend.some(n => /\$/.test(String(n))) && mj && mj.typesetPromise) mj.typesetPromise([legendEl]).catch(() => {});
        }
        const host = document.createElement('div');
        box.appendChild(host);
        if (position === 'right') this.sideEl.appendChild(box);
        else if (position === 'below') this.el.appendChild(box);
        return {
            def: d, host, box, legendEl, position, index: i, hidden: false, overTime: xSrc === 't',
            fx: compile(xSrc, 'x'), fys: ySrcs.map((y, k) => compile(y, `y[${k}]`)),
            xSrc, ySrcs, plot: null, ts: [], xs: [], ys: [],
        };
    }

    /**
     * Tab bar for the graphs with "position": "tabs", where the first of them
     * would be. Only the open tab is drawn; the others are created when opened,
     * so their size is measured while they are visible.
     */
    _initTabs() {
        const tabbed = this.items.filter(it => it.position === 'tabs');
        if (!tabbed.length) return;
        const wrap = document.createElement('div');
        wrap.className = 'matephis-physics-tabs';
        const bar = document.createElement('div');
        bar.className = 'matephis-physics-tablist';
        bar.setAttribute('role', 'tablist');
        wrap.appendChild(bar);
        const id = `${this.scene.uid}-graph`;
        const buttons = tabbed.map((it, k) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'matephis-physics-tab';
            b.id = `${id}-tab${k}`;
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-controls', `${id}-panel${k}`);
            b.textContent = it.def.label !== undefined ? String(it.def.label) : `Grafico ${k + 1}`;
            it.box.id = `${id}-panel${k}`;
            it.box.setAttribute('role', 'tabpanel');
            it.box.setAttribute('aria-labelledby', b.id);
            bar.appendChild(b);
            wrap.appendChild(it.box);
            return b;
        });
        const open = (k, focus = false) => {
            tabbed.forEach((it, j) => {
                it.hidden = j !== k;
                it.box.hidden = it.hidden;
                buttons[j].setAttribute('aria-selected', String(j === k));
                buttons[j].tabIndex = j === k ? 0 : -1;
            });
            if (focus) buttons[k].focus();
            this.update();
        };
        buttons.forEach((b, k) => {
            b.addEventListener('click', () => open(k));
            b.addEventListener('keydown', (e) => {
                const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                open((k + step + buttons.length) % buttons.length, true);
            });
        });
        // In the flow of the graphs below the scene, where the first tabbed graph is listed
        const after = this.items.filter(it => it.position === 'below' && it.index < tabbed[0].index).pop();
        if (after) after.box.after(wrap);
        else this.el.prepend(wrap);
        tabbed.forEach((it, j) => { it.hidden = j !== 0; it.box.hidden = it.hidden; });
        buttons.forEach((b, j) => { b.setAttribute('aria-selected', String(j === 0)); b.tabIndex = j === 0 ? 0 : -1; });
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
        // Wide and low on a page, taller in a narrow column or on a phone, so curves and numbers keep some room
        const w = it.host.clientWidth || 600;
        const aspect = d.aspectRatio !== undefined ? d.aspectRatio : w < 520 ? 1.6 : 2.5;
        const plotCfg = {
            fullWidth: true, aspectRatio: aspect, grid: true,
            // Axes on the edges of a box, numbers and labels outside: curves are never covered
            boxPlot: true, padding: 'auto',
            xlim: it.xlim, ylim: it.ylim, showToolbar: false,
            // A grid line about every 60 px across and 40 px up in the drawing area (the box
            // plot's margins taken off), denser than the plot's default of one per 100 px
            xStep: niceStep(it.xlim[1] - it.xlim[0], Math.max(60, w - 100), 60),
            yStep: niceStep(it.ylim[1] - it.ylim[0], Math.max(40, w / (parseAspectRatio(aspect) || 2.5) - 75), 40),
            axisLabels: Array.isArray(d.axisLabels) ? d.axisLabels : [it.overTime ? 't (s)' : it.xSrc, it.ySrcs.length === 1 ? it.ySrcs[0] : ''],
            data: [],
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
            if (it.hidden) return;
            if (!it.plot) this._create(it);
            const d = it.def;
            const colors = listOf(d.colors);
            const upTo = d.progressive === true ? it.ts.findIndex(tt => tt > t + 1e-9) : -1;
            const n = upTo < 0 ? it.ts.length : upTo;
            const data = it.ys.map((ys, k) => ({
                series: ys.slice(0, n).map((y, j) => [it.xs[j], y]),
                color: colors[k] || COLORS[k % COLORS.length], width: 2.5,
            }));
            if (it.legendEl) {
                // Same colours as the curves, as the plot resolves them (palette names, theme)
                [...it.legendEl.children].forEach((item, k) => {
                    const c = it.plot._getColor(k, colors[k] || COLORS[k % COLORS.length]);
                    if (item.dataset.color !== c) { item.dataset.color = c; item.firstChild.style.background = c; }
                });
            }
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
