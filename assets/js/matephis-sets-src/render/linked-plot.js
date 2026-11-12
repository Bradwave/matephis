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
        this._syncing = false;
        if (changed) this.plot.requestDraw();
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
        if (def.identity === true || (construction && def.identity !== false)) {
            data.push({ fn: 'x', color: scene.color('gray'), dash: '4,4', width: 1.2 });
        }
        this.maps.forEach(m => {
            const label = `$${m.label}$`;
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
            data.push({ fn: model.exprString(m), domain: w.slice(), color: color(m), width: 2.2, label });
        });
        if (def.probe !== false) data.push(...this.probeItems(construction));

        const own = {};
        for (const key in def) if (!PLOT_KEYS.includes(key)) own[key] = def[key];
        const xr = [Infinity, -Infinity], yr = [Infinity, -Infinity];
        this.maps.forEach(m => {
            const a = rangeOf(m.from), b = rangeOf(m.to);
            xr[0] = Math.min(xr[0], a[0]); xr[1] = Math.max(xr[1], a[1]);
            yr[0] = Math.min(yr[0], b[0]); yr[1] = Math.max(yr[1], b[1]);
        });
        // The construction moves between the axes through y = x: same range on both
        const both = [Math.min(xr[0], yr[0]), Math.max(xr[1], yr[1])];
        const params = {};
        const defs = scene.config.params || {};
        for (const key in defs) params[key] = { ...defs[key], val: scene.params[key] / paramScale(defs[key]) };
        return {
            xlim: pad(construction ? both : xr),
            ylim: pad(construction ? both : yr),
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
        probes.forEach(p => {
            if (!p || typeof p !== 'object') return;
            const m = model.mapById.get(String(p.map));
            const at = Array.isArray(p.at) ? p.at[0] : p.at;
            if (!m || m.from.kind !== 'interval' || typeof at !== 'string' || !(cfg.params && cfg.params[at])) return;
            const chain = m.kind === 'compose' ? m.parts : [m];
            if (chain.some(part => model.exprString(part) === null)) return;
            // v[k]: the value after k steps, as an expression in the param
            const v = [at];
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
