/**
 * A plot of the graphs of the maps, beside or under a sets diagram ("plot").
 *
 *   "plot": { "maps": ["f", "g", "gf"], "position": "right", "probe": true,
 *             "construction": true, "xlim": [-3, 3] }
 *
 * The graphs come from the maps themselves (exprString in the model), so a
 * formula is written once. The plot is drawn by the plot engine
 * (window.MatephisPlot: the site loads it on pages whose sets blocks have a
 * "plot", see _plugins/asset_injector.rb); its params are
 * the diagram's params, kept in sync both ways: moving the probe on the sets
 * moves the points on the graphs, dragging a point on a graph moves the probe.
 *
 *   probe          points (x, f(x)) on the graphs for the diagram's probe
 *                  (default true), with a dashed line down to the x axis
 *   construction   for a composition: from x up to the graph of f, across to
 *                  the line y = x, up to the graph of g, and back to x
 *   identity       draw the line y = x (default: with construction)
 * Any other key goes to the plot (xlim, ylim, aspectRatio, grid, …).
 */
import { PLOT_KEYS } from '../core/config.js';
import { substituteX } from '../core/model.js';
import { paramScale } from '../../matephis-plot-src/ui/slider-manager.js';

/** Highlights drawn on the graph too, and how many points and bands each may have. */
const MIRROR_OPS = ['image', 'preimage', 'domain', 'fixed'];
const POINT_SLOTS = 12;
/** Points of a probe on an inverse (a relation can have several values). */
const INVERSE_SLOTS = 4;
const BAND_SLOTS = 6;
/** Where unused slots go: far outside the plot (the plot skips points out of view). */
const OFF = 1e9;

/** Colours given to maps without one, when they are plotted (arrows and graph match). */
export const PLOT_COLORS = ['blue', 'orange', 'green', 'purple', 'red', 'navy'];

/** Maps that can be drawn as a graph y = f(x): numbers in, numbers out. */
export function plottable(model, map) {
    const numeric = (set) => set.kind === 'interval' || (set.kind === 'finite' && set.elements.every(e => e.num !== null));
    return !!map && model.dim(map.from) < 2 && model.dim(map.to) < 2 && numeric(map.from) && numeric(map.to)
        && (map.kind === 'inverse' ? model.exprString(map.base) !== null && map.base.from.kind === 'interval'
            : map.from.kind === 'finite' || model.exprString(map) !== null);
}

/** Range of the numbers of a set: its window, or its elements' values. */
function rangeOf(set) {
    if (set.kind === 'interval') return set.window.slice();
    const nums = set.elements.map(e => e.num).filter(v => v !== null);
    return nums.length ? [Math.min(...nums), Math.max(...nums)] : [0, 1];
}

function pad([a, b]) {
    const d = (b - a) || 1;
    return [a - 0.08 * d, b + 0.08 * d];
}

export class LinkedPlot {
    /**
     * @param {object} scene - MatephisSets
     * @param {HTMLElement} host - where the plot goes
     */
    constructor(scene, host) {
        this.scene = scene;
        this.host = host;
        this.def = scene.config.plot;
        const { model } = scene;
        const ids = Array.isArray(this.def.maps) ? this.def.maps.map(String) : model.maps.filter(m => plottable(model, m)).map(m => m.id);
        this.maps = [];
        ids.forEach(id => {
            const m = model.mapById.get(id);
            if (!m) scene._addWarning(`plot: no map '${id}'`);
            else if (!plottable(model, m)) scene._addWarning(`plot: '${id}' cannot be drawn as a graph (it needs numbers in and out, and a formula)`);
            else this.maps.push(m);
        });
        // Plotted maps without a colour get one, used by their arrows too
        let k = 0;
        this.maps.forEach(m => {
            if (!m.color) m.color = PLOT_COLORS[k++ % PLOT_COLORS.length];
        });
    }

    /** Builds the plot (after the diagram's params exist). */
    mount() {
        const Plot = typeof window !== 'undefined' && window.MatephisPlot;
        if (!Plot) {
            this.scene._addWarning('plot: the plot engine is not loaded on this page (add "plot: true" to the front matter)');
            return;
        }
        if (!this.maps.length) return;
        this.plot = Plot.render(this.host, this.config(), { noLightbox: true });
        // The plot's sliders are the diagram's: hide them, keep them for dragging points
        const sl = this.plot.sliders;
        if (sl && sl.controls) sl.controls.style.display = 'none';
        if (sl) {
            const orig = sl.setValue.bind(sl);
            sl.setValue = (key, v, redraw) => {
                orig(key, v, redraw);
                if (!this._syncing && this.scene.config.params && this.scene.config.params[key]) this.scene.setParam(key, v);
            };
        }
    }

    /** Diagram -> plot: copies param values that changed. */
    sync() {
        const sl = this.plot && this.plot.sliders;
        if (!sl) return;
        const defs = this.scene.config.params || {};
        let changed = false;
        this._syncing = true;
        for (const key in defs) {
            const v = this.scene.params[key] / paramScale(defs[key]);
            const cur = this.plot.params[key] / paramScale(defs[key]);
            if (!(Math.abs(v - cur) <= 1e-12 * Math.max(1, Math.abs(v)))) {
                sl.setValue(key, v, false);
                changed = true;
            }
        }
        // The cobwebs follow the orbits (their steps and their start)
        this.cobwebItems().forEach(c => c.keys.forEach((key, i) => {
            const v = c.values[i];
            if (this.plot.params[key] !== v) {
                sl.setValue(key, v, false);
                changed = true;
            }
        }));
        // Highlights mirrored on the graph (they follow params and reveal buttons), probes on inverses
        const mv = { ...this.mirrorValues(), ...this.inverseProbeValues() };
        for (const key in mv) {
            if (this.plot.params[key] !== mv[key] && !(isNaN(this.plot.params[key]) && isNaN(mv[key]))) {
                sl.setValue(key, mv[key], false);
                changed = true;
            }
        }
        this._syncing = false;
        if (changed) this.plot.requestDraw();
    }

    /**
     * Graph of a piecewise map, piece by piece: a curve over each part of the
     * domain where one piece applies, and a dot at each end inside the window,
     * filled when the end belongs to that piece, hollow when it does not. The
     * values are expressions, so they follow the params. Null when a piece is
     * not a single expression.
     */
    pieceItems(m, color, label) {
        const { model } = this.scene;
        const w = m.from.window;
        const bg = this.scene._isDark() ? '#181818' : '#ffffff';
        const segs = model._segments(m, m.from.I);
        const lines = [], dots = [];
        for (const S of segs) {
            const pc = m.pieces[S.piece];
            if (!pc || typeof pc.src.expr !== 'string' && typeof pc.src.expr !== 'number') return null;
            const e = `(${pc.src.expr})`;
            const at = (t) => substituteX(e, `(${t})`);
            const dot = (t, closed) => dots.push({ points: [[t, at(t)]], radius: 4.5, fillColor: closed ? color : bg, strokeColor: color, strokeWidth: 2, color });
            if (S.lo === S.hi) {
                dot(S.lo, true);
                continue;
            }
            const lo = Math.max(S.lo, w[0]), hi = Math.min(S.hi, w[1]);
            if (!(hi > lo)) continue;
            lines.push({ fn: e, domain: [lo, hi], color, width: 2.2, label: lines.length ? undefined : label });
            if (isFinite(S.lo) && S.lo >= w[0]) dot(S.lo, S.loClosed);
            if (isFinite(S.hi) && S.hi <= w[1]) dot(S.hi, S.hiClosed);
        }
        return { lines, dots };
    }

    /**
     * The table's rows on the graphs: for each plotted map of the table, the
     * points (input, value) of the rows, and a ring that marks the row under
     * the pointer (hidden params _r<k>x, _r<k>y).
     */
    tableItems() {
        const t = this.scene.table;
        if (!t || t.maps[0].from.kind !== 'interval') return [];
        const { model } = this.scene;
        const items = [];
        t.maps.forEach((m, k) => {
            if (!this.maps.includes(m)) return;
            const color = this.scene.color(m.color);
            const pts = [];
            t.inputs().forEach(x => {
                // The value after k steps, as an expression (it follows the params)
                let e = `(${x})`;
                for (let j = 0; j < k; j++) {
                    const pe = model.exprString(t.maps[j]);
                    if (pe === null) return;
                    e = substituteX(pe, e);
                }
                const me = model.exprString(m);
                if (me === null) return;
                pts.push([e, substituteX(me, e)]);
            });
            if (pts.length) items.push({ points: pts, radius: 4, fillColor: color, color });
            items.push({ points: [[`_r${k}x`, `_r${k}y`]], radius: 8, fillColor: 'none', strokeColor: color, strokeWidth: 2.5, color });
        });
        return items;
    }

    /** Values of the hidden params of probes on inverses: (b, a) for each value a of f^{-1}(b). */
    inverseProbeValues() {
        const out = {};
        const pv = this.scene.probeValues || [];
        (this._inverseProbes || []).forEach(({ i, keys }) => {
            const o = pv[i];
            const ys = o && typeof o.x === 'number' ? o.ys.filter(y => typeof y === 'number' && isFinite(y)) : [];
            keys.forEach(([x, y], j) => {
                out[x] = j < ys.length ? o.x : OFF;
                out[y] = j < ys.length ? ys[j] : OFF;
            });
        });
        return out;
    }

    /** Ring positions for the row with hover key `key` (none: out of sight). */
    rowValues(key) {
        const t = this.scene.table;
        const out = {};
        if (!t) return out;
        let vals = null;
        if (key) {
            const inputs = t.inputs();
            const i = inputs.findIndex((x, j) => t.rowKey(x, j) === key);
            if (i >= 0) vals = t.chain(inputs[i]);
        }
        t.maps.forEach((m, k) => {
            const ok = vals && typeof vals[k] === 'number' && typeof vals[k + 1] === 'number';
            out[`_r${k}x`] = ok ? vals[k] : OFF;
            out[`_r${k}y`] = ok ? vals[k + 1] : OFF;
        });
        return out;
    }

    /** Hover on the diagram or the table: the row's points on the graphs. */
    focusRow(key) {
        const sl = this.plot && this.plot.sliders;
        if (!sl || !this.scene.table) return;
        const v = this.rowValues(key);
        let changed = false;
        this._syncing = true;
        for (const k in v) {
            if (this.plot.params[k] !== v[k]) {
                sl.setValue(k, v[k], false);
                changed = true;
            }
        }
        this._syncing = false;
        if (changed) this.plot.requestDraw();
    }

    /** "lines": [{ "y": "k" }, { "x": "p", "dash": true, "color": "blue" }]: lines driven by params. */
    lineItems() {
        const { scene } = this;
        const lines = Array.isArray(this.def.lines) ? this.def.lines : [];
        const out = [];
        lines.forEach((l, i) => {
            if (!l || typeof l !== 'object' || (l.y === undefined && l.x === undefined)) {
                scene._addWarning(`plot.lines[${i}]: expected { "y": "k" } or { "x": "p" }`);
                return;
            }
            const color = scene.color(l.color || 'gray');
            const dash = l.dash === false ? undefined : l.dash === true || l.dash === undefined ? '6,4' : l.dash;
            if (l.y !== undefined) out.push({ fn: String(l.y), color, dash, width: 1.6, label: l.label });
            else out.push({ x: String(l.x), color, dash, width: 1.6, label: l.label });
        });
        return out;
    }

    /**
     * The diagram's highlights that live on a line (preimages, images, and
     * later domain and fixed points), drawn on the graph: points (x, f(x))
     * with a dashed line to the x axis, bands on the x axis (where) or on the
     * y axis (values). The plot is built once with a fixed number of slots,
     * whose corners are hidden params; unused slots are put out of sight.
     */
    mirrorLayers() {
        if (this.def.highlights === false) return [];
        const { scene } = this;
        return scene.layers.filter(l => l.sel && MIRROR_OPS.includes(l.sel.op)
            && this.maps.some(m => m.id === l.sel.map) && scene.model.mapById.get(l.sel.map).from.kind === 'interval');
    }

    mirrorItems() {
        const { scene } = this;
        return this.mirrorLayers().map((l, j) => {
            const def = l.def || {};
            const op = l.sel.op;
            const color = scene.color(def.color, op === 'image' ? 'image' : op === 'preimage' ? (def.of ? 'highlight' : 'preimage') : 'highlight');
            const items = [];
            for (let i = 0; i < POINT_SLOTS; i++) {
                const x = `_m${j}p${i}x`, y = `_m${j}p${i}y`;
                items.push({ vector: [[x, 0], [x, y]], arrow: false, dash: '3,3', color, width: 1.2 });
                items.push({ points: [[x, y]], radius: 5, fillColor: color, color });
            }
            for (let i = 0; i < BAND_SLOTS; i++) {
                const a = `_m${j}b${i}a`, b = `_m${j}b${i}b`, c = `_m${j}b${i}c`, d = `_m${j}b${i}d`;
                items.push({ vector: [[a, b], [c, d]], arrow: false, color, width: 6, opacity: 0.55 });
            }
            return { items };
        });
    }

    /** Values of the slots of the mirrored highlights (see mirrorItems). */
    mirrorValues() {
        const { scene } = this;
        const { model } = scene;
        const out = {};
        this.mirrorLayers().forEach((l, j) => {
            const map = model.mapById.get(l.sel.map);
            const shown = scene.isVisible(l);
            const pts = [], bands = [];
            if (shown) {
                const res = this.mirrorResult(l, map);
                if (res) {
                    (res.points || []).forEach(x => {
                        const y = model._raw1(map, x);
                        if (isFinite(y)) pts.push([x, res.onDiagonal ? x : y]);
                    });
                    (res.xBands || []).forEach(I => bands.push([I.lo, 0, I.hi, 0]));
                    (res.yBands || []).forEach(I => {
                        const x0 = this._yAxisX();
                        bands.push([x0, I.lo, x0, I.hi]);
                    });
                }
            }
            for (let i = 0; i < POINT_SLOTS; i++) {
                const p = pts[i];
                out[`_m${j}p${i}x`] = p ? p[0] : OFF;
                out[`_m${j}p${i}y`] = p ? p[1] : OFF;
            }
            for (let i = 0; i < BAND_SLOTS; i++) {
                const b = bands[i];
                const clip = (v, w) => (isFinite(v) ? v : v > 0 ? w[1] : w[0]);
                const xw = this._xlim, yw = this._ylim;
                out[`_m${j}b${i}a`] = b ? clip(b[0], xw) : OFF;
                out[`_m${j}b${i}b`] = b ? clip(b[1], yw) : OFF;
                out[`_m${j}b${i}c`] = b ? clip(b[2], xw) : OFF;
                out[`_m${j}b${i}d`] = b ? clip(b[3], yw) : OFF;
            }
        });
        return out;
    }

    /** Where the y axis is drawn: x = 0 when it is in view, else the left edge. */
    _yAxisX() {
        const w = this._xlim || [0, 1];
        return w[0] <= 0 && w[1] >= 0 ? 0 : w[0];
    }

    /** What a highlight puts on the graph: { points, xBands, yBands, onDiagonal }. */
    mirrorResult(layer, map) {
        const { model } = this.scene;
        const { op, arg } = layer.sel;
        const parts = (res) => (!res ? [] : res.kind === 'interval' ? [res.I] : res.kind === 'intervals' ? res.parts : []);
        if (op === 'preimage') {
            const res = model.preimage(map, arg);
            if (!res) return null;
            if (res.kind === 'points') return { points: res.points };
            const ps = parts(res);
            return { xBands: ps.filter(I => I.lo !== I.hi), points: ps.filter(I => I.lo === I.hi).map(I => I.lo) };
        }
        if (op === 'image') {
            const res = model.image(map, arg);
            return { yBands: parts(res).filter(I => I.lo !== I.hi) };
        }
        if (op === 'domain' && model.domainOf) return { xBands: model.domainOf(map) };
        if (op === 'fixed' && model.fixedPoints) {
            const fx = model.fixedPoints(map);
            return { points: fx.points || [], onDiagonal: true };
        }
        return null;
    }

    /**
     * The cobweb of each orbit on a line: from (x0, 0) up to the graph, across
     * to y = x, up to the graph again… one corner per step. The corners are
     * params _c<n>_<i> (x_i) and _c<n>_b (where the first segment starts:
     * on the axis once a step is shown); the steps not shown yet collapse onto
     * the last point, so the plot is built once and only its params change.
     */
    cobwebItems() {
        const orbits = this.scene.orbits;
        if (!orbits || !orbits.items.length) return [];
        const { model } = this.scene;
        const current = orbits.current || orbits.compute();
        const out = [];
        current.forEach((o, n) => {
            const { it } = o;
            if (it.map.from.kind !== 'interval' || !this.maps.some(m => m === it.map || (it.map.iterate && m === it.map.iterate.base))) return;
            if (model.exprString(it.map) === null) return;
            const S = it.steps;
            const xs = Array.from({ length: S + 1 }, (_, i) => `_c${n}_${i}`);
            const b = `_c${n}_b`;
            const k = o.values.length ? o.shown : 0;
            const vals = xs.map((_, i) => (o.values.length ? Number(o.values[Math.min(i, k)]) : 0));
            const color = this.scene.color(it.def.color || (n === 0 ? 'orange' : ['purple', 'blue', 'green'][(n - 1) % 3]));
            const items = [];
            for (let i = 1; i <= S; i++) {
                items.push({ vector: [[xs[i - 1], i === 1 ? b : xs[i - 1]], [xs[i - 1], xs[i]]], arrow: false, color, width: 1.6 });
                items.push({ vector: [[xs[i - 1], xs[i]], [xs[i], xs[i]]], arrow: false, color, width: 1.6 });
            }
            // The start on the x axis: draggable when it is a param
            const start = it.def.start;
            const defs = this.scene.config.params || {};
            items.push({ points: [[typeof start === 'string' && defs[start] ? start : vals[0], 0]], radius: 6, fillColor: color, color });
            out.push({ items, keys: [...xs, b], values: [...vals, k >= 1 ? 0 : vals[0]] });
        });
        return out;
    }

    destroy() {
        if (this.plot) this.plot.destroy();
        this.plot = null;
    }

    /** The plot engine's config. */
    config() {
        const { scene } = this;
        const { model } = scene;
        const def = this.def;
        const color = (m) => scene.color(m.color);
        const data = [];
        const construction = def.construction === true;
        const ends = [];
        if (def.identity === true || (construction && def.identity !== false)) {
            data.push({ fn: 'x', color: scene.color('gray'), dash: '4,4', width: 1.2 });
        }
        this.maps.forEach(m => {
            const label = `$${m.name}$`;
            if (m.from.kind === 'finite') {
                const pts = [];
                m.from.elements.forEach(e => {
                    if (e.num === null) return;
                    model.apply(m, e.id).forEach(v => {
                        const y = typeof v === 'string' ? model.elementNumber(m.to, v) : typeof v === 'number' ? v : null;
                        if (y !== null && isFinite(y)) pts.push([e.num, y]);
                    });
                });
                data.push({ points: pts, radius: 4.5, fillColor: color(m), color: color(m), label });
                return;
            }
            const w = m.from.window;
            if (m.kind === 'inverse') {
                // The graph of f reflected: (f(t), t) over the domain of f
                const e = model.exprString(m.base);
                data.push({ parametric: [substituteX(e, 't'), 't'], domain: m.base.from.window.slice(), color: color(m), width: 2.2, label });
                return;
            }
            // A piecewise map: one graph per piece (jumps are not joined), with
            // filled or hollow dots at the ends of the pieces
            if (m.kind === 'piecewise' && def.ends !== false) {
                const pieces = this.pieceItems(m, color(m), label);
                if (pieces) {
                    data.push(...pieces.lines);
                    ends.push(...pieces.dots);
                    return;
                }
            }
            data.push({ fn: model.exprString(m), domain: w.slice(), color: color(m), width: 2.2, label });
        });
        data.push(...ends);
        if (def.probe !== false) data.push(...this.probeItems(construction));
        // Orbits: the cobweb between the graph and y = x
        const cobwebs = this.cobwebItems();
        const fixedShown = this.mirrorLayers().some(l => l.sel.op === 'fixed');
        if ((cobwebs.length || fixedShown) && def.identity !== false && !data.some(d => d.fn === 'x')) {
            data.unshift({ fn: 'x', color: scene.color('gray'), dash: '4,4', width: 1.2 });
        }
        cobwebs.forEach(c => data.push(...c.items));
        // Lines driven by params, and the diagram's highlights on the graph
        data.push(...this.lineItems());
        const mirrors = this.mirrorItems();
        mirrors.forEach(m => data.push(...m.items));
        data.push(...this.tableItems());

        const own = {};
        for (const key in def) if (!PLOT_KEYS.includes(key)) own[key] = def[key];
        const xr = [Infinity, -Infinity], yr = [Infinity, -Infinity];
        this.maps.forEach(m => {
            const a = rangeOf(m.from), b = rangeOf(m.to);
            xr[0] = Math.min(xr[0], a[0]); xr[1] = Math.max(xr[1], a[1]);
            yr[0] = Math.min(yr[0], b[0]); yr[1] = Math.max(yr[1], b[1]);
        });
        // The construction (and a cobweb) moves between the axes through y = x: same range on both
        const both = [Math.min(xr[0], yr[0]), Math.max(xr[1], yr[1])];
        const square = construction || cobwebs.length > 0;
        const params = {};
        const defs = scene.config.params || {};
        for (const key in defs) params[key] = { ...defs[key], val: scene.params[key] / paramScale(defs[key]) };
        // The cobweb's corners are hidden params, set by sync() at every step
        cobwebs.forEach(c => c.keys.forEach((key, i) => { params[key] = { min: -1e9, max: 1e9, slider: false, val: c.values[i] }; }));
        const xlim = Array.isArray(def.xlim) ? def.xlim.map(Number) : pad(square ? both : xr);
        const ylim = Array.isArray(def.ylim) ? def.ylim.map(Number) : pad(square ? both : yr);
        this._xlim = xlim;
        this._ylim = ylim;
        const mv = { ...this.mirrorValues(), ...this.rowValues(null), ...this.inverseProbeValues() };
        for (const key in mv) params[key] = { min: -1e10, max: 1e10, slider: false, val: mv[key] };
        return {
            xlim,
            ylim,
            aspectRatio: '1:1',
            cssWidth: '100%',
            fullWidth: true,
            legend: this.maps.length > 1,
            draggablePoints: true,
            // The values are on the diagram already (and the plot's tag would lag behind a drag)
            showCoordinates: false,
            params,
            ...own,
            data,
        };
    }

    /**
     * Points on the graphs for each probe whose "at" is a param: for a map f,
     * (p, f(p)); for a composition g ∘ f also (f(p), g(f(p))) on g and
     * (p, g(f(p))) on g ∘ f. With "construction", the path between them.
     */
    probeItems(construction) {
        const { scene } = this;
        const { model } = scene;
        const cfg = scene.config;
        const probes = cfg.probe === undefined ? [] : Array.isArray(cfg.probe) ? cfg.probe : [cfg.probe];
        const items = [];
        const pc = scene.color(null, 'probe');
        this._inverseProbes = [];
        probes.forEach((p, i) => {
            if (!p || typeof p !== 'object') return;
            const m = model.mapById.get(String(p.map));
            const at = Array.isArray(p.at) ? p.at[0] : p.at;
            // On an inverse there is no formula: its points (b, a) come from the
            // probe's values, through hidden params set at every draw
            if (m && m.kind === 'inverse' && this.maps.includes(m)) {
                const color = p.color ? scene.color(p.color) : pc;
                const keys = [];
                for (let j = 0; j < INVERSE_SLOTS; j++) {
                    const x = `_v${i}_${j}x`, y = `_v${i}_${j}y`;
                    keys.push([x, y]);
                    items.push({ vector: [[x, 0], [x, y]], arrow: false, dash: '4,3', color, width: 1.4 });
                    items.push({ points: [[x, y]], radius: 6, fillColor: color, color });
                }
                this._inverseProbes.push({ i, keys });
                return;
            }
            // "at" is a param, or an expression of params ("-p")
            if (!m || (m.from.kind !== 'interval' && !m.from.intLine) || typeof at !== 'string' || !(cfg.params && (cfg.params[at] || scene.mentionsParam(at)))) return;
            const chain = m.kind === 'compose' ? m.parts : [m];
            if (chain.some(part => model.exprString(part) === null)) return;
            // v[k]: the value after k steps, as an expression in the param
            const v = [cfg.params[at] ? at : `(${at})`];
            chain.forEach(part => v.push(substituteX(model.exprString(part), v[v.length - 1])));
            const n = chain.length;
            const color = p.color ? scene.color(p.color) : pc;
            const seg = (a, b) => items.push({ vector: [a, b], arrow: false, dash: '4,3', color, width: 1.4 });
            if (construction && n > 1) {
                chain.forEach((part, k) => {
                    seg([v[k], k === 0 ? 0 : v[k]], [v[k], v[k + 1]]);
                    if (k < n - 1) seg([v[k], v[k + 1]], [v[k + 1], v[k + 1]]);
                });
                seg([v[n - 1], v[n]], [v[0], v[n]]);
            } else {
                seg([v[0], 0], [v[0], v[1]]);
            }
            const pts = [];
            chain.forEach((part, k) => { if (this.maps.includes(part)) pts.push([v[k], v[k + 1]]); });
            if (n > 1 && this.maps.includes(m)) pts.push([v[0], v[n]]);
            if (pts.length) items.push({ points: pts, radius: 6, fillColor: color, color });
        });
        return items;
    }
}
