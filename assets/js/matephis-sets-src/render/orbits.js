/**
 * Orbits ("iterate"): x0, f(x0), f(f(x0)), … one step at a time.
 *
 *   "iterate": { "map": "f", "start": "a", "steps": 6, "step": 0, "color": "orange" }
 *
 *   map      a map of a set into itself
 *   start    an element, a number, or a param (the orbit follows its slider)
 *   steps    the most steps shown (default 10)
 *   step     steps shown at first (default 0)
 *   label    name of the terms in the readout (default "x": x_0, x_1, …)
 *   showValue  false: no readout line
 * Several orbits: an array. They move together, with buttons «Indietro»,
 * «Passo successivo», «Da capo» (no animation, as in the rest of the site).
 * Each step adds an arrow x_k -> x_{k+1}, numbered; when a value comes back
 * the orbit stops and the readout says it is a cycle (or a fixed point).
 */
import { pointPx, setLabelText } from '../core/layout.js';
import { niceNumber } from '../core/interval.js';
import { paramScale } from '../../matephis-plot-src/ui/slider-manager.js';
import { linkArrow } from './arrows.js';

const f2 = (v) => +v.toFixed(2);
const MAX_STEPS = 100;

export class Orbits {
    constructor(scene, defs) {
        this.scene = scene;
        this.items = [];
        (Array.isArray(defs) ? defs : [defs]).forEach((def, i) => {
            if (!def || typeof def !== 'object') return;
            const map = scene.model.mapById.get(String(def.map));
            if (!map) {
                scene._addWarning(`iterate[${i}]: no map '${def.map}'`);
                return;
            }
            if (map.from !== map.to) {
                scene._addWarning(`iterate[${i}]: '${map.id}' does not map a set into itself (${map.from.id} → ${map.to.id}), so it cannot be iterated`);
                return;
            }
            if (map.from.kind === 'rect' || map.from.kind === 'disk') {
                scene._addWarning(`iterate[${i}]: orbits in the plane are not drawn yet`);
                return;
            }
            if (def.start === undefined) {
                scene._addWarning(`iterate[${i}]: needs "start" (an element, a number or a param)`);
                return;
            }
            const steps = Math.max(1, Math.min(MAX_STEPS, Math.round(Number(def.steps !== undefined ? def.steps : 10)) || 10));
            this.items.push({ def, map, steps, index: i });
        });
        const first = this.items[0];
        this.k = first ? Math.max(0, Math.min(MAX_STEPS, Math.round(Number(first.def.step) || 0))) : 0;
        this.el = document.createElement('div');
        this.el.className = 'matephis-physics-buttons matephis-sets-buttons matephis-sets-orbit-buttons';
        if (!this.items.length) return;
        const button = (label, fn) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'matephis-physics-button';
            b.textContent = label;
            b.addEventListener('click', fn);
            this.el.appendChild(b);
            return b;
        };
        this.back = button('Indietro', () => this.setStep(this.k - 1));
        this.next = button('Passo successivo', () => this.setStep(this.k + 1));
        this.reset = button('Da capo', () => this.setStep(0));
    }

    /** Ids of the maps whose orbits are shown (for "sync"). */
    get mapIds() {
        return this.items.map(it => it.map.id);
    }

    /** Moves to step k (kept within the steps there are), redraws, tells the sync group. */
    setStep(k, { broadcast = true } = {}) {
        const max = this.maxStep();
        const v = Math.max(0, Math.min(max, k));
        if (v === this.k) return;
        this.k = v;
        this.scene.requestDraw();
        if (broadcast && this.scene.syncGroup) this.scene.syncGroup.step(this.scene, this.mapIds, v);
    }

    /** The point an orbit starts from, as the model wants it (element id or number). */
    startOf(it) {
        const { scene } = this;
        const s = it.def.start;
        const set = it.map.from;
        if (set.kind === 'finite') {
            const id = String(s);
            if (set.elementById.has(id)) return id;
            // A number (or a param): the element with that value
            const v = this._number(s);
            const el = set.elements.find(e => e.num !== null && Math.abs(e.num - v) < 1e-9);
            if (!el && !it.warned) {
                scene._addWarning(`iterate[${it.index}]: '${s}' is not an element of ${set.id}`);
                it.warned = true;
            }
            return el ? el.id : null;
        }
        const v = this._number(s);
        return typeof v === 'number' && isFinite(v) ? v : null;
    }

    _number(s) {
        const { scene } = this;
        const defs = scene.config.params || {};
        if (typeof s === 'string' && defs[s]) return scene.params[s] / paramScale(defs[s]);
        return scene._num(s, 'iterate.start');
    }

    /** Orbits as computed now: values, cycle, how many steps are shown. */
    compute() {
        return this.items.map(it => {
            const x0 = this.startOf(it);
            if (x0 === null) return { it, values: [], shown: 0 };
            const o = this.scene.model.orbit(it.map, x0, it.steps);
            // A value outside the set is shown as the last step, without an arrow
            const avail = o.values.length - 1;
            return { it, ...o, shown: Math.min(this.k, avail), avail };
        });
    }

    maxStep() {
        return Math.max(0, ...this.compute().map(o => o.avail || 0));
    }

    /** Draws the orbits; returns their readout lines. */
    draw() {
        const { scene } = this;
        const readouts = [];
        const orbits = this.compute();
        this.current = orbits;
        orbits.forEach((o, n) => {
            const { it } = o;
            const map = it.map, set = map.from;
            const color = scene.color(it.def.color || (n === 0 ? 'orange' : ['purple', 'blue', 'green'][(n - 1) % 3]));
            const g = scene.svgEl('g', { class: 'mps-orbit', 'data-map': map.id }, scene.groups.probe);
            if (!o.values.length) {
                if (it.def.showValue !== false) readouts.push({ tex: null, color });
                return;
            }
            const px = (v) => (typeof v === 'string' || inWindow(set, v) ? pointPx(scene.layout, set, v) : null);
            const outsideLast = o.stop === 'outside' && o.shown === o.avail && o.shown > 0;
            const arrowsUpTo = outsideLast ? o.shown - 1 : o.shown;
            const fs = scene.fontSize;
            for (let i = 1; i <= arrowsUpTo; i++) {
                const a = px(o.values[i - 1]), b = px(o.values[i]);
                if (!a || !b) continue;
                const last = i === arrowsUpTo;
                const ar = linkArrow(scene, g, set, set, {
                    from: a, to: b, color, trimStart: 7, trimEnd: 6, width: last ? 2.4 : 1.8, head: last ? 10 : 8,
                    cls: 'mps-arrow mps-orbit-step',
                });
                // The number of the step, at the top of the arc
                const span = Math.hypot(b[0] - a[0], b[1] - a[1]);
                if (ar.mid && (set.kind === 'finite' || span > 28)) {
                    scene.text(ar.mid[0] + ar.out[0] * 10, ar.mid[1] + ar.out[1] * 10, String(i), {
                        parent: g, color, size: fs * 0.72, math: false, weight: 'bold',
                    });
                }
            }
            // The points reached, the last one bigger
            for (let i = 0; i <= o.shown; i++) {
                if (outsideLast && i === o.shown) break;
                const p = px(o.values[i]);
                if (!p) continue;
                const cur = i === o.shown;
                const dot = scene.svgEl('circle', { cx: f2(p[0]), cy: f2(p[1]), r: cur ? 6 : i === 0 ? 5 : 4, class: cur ? 'mps-orbit-current' : 'mps-orbit-point' }, g);
                dot.style.fill = color;
                if (i === 0 && !cur) {
                    dot.style.fill = 'var(--bg, #fff)';
                    dot.style.stroke = color;
                    dot.style.strokeWidth = '2px';
                }
            }
            if (it.def.showValue !== false) readouts.push({ tex: this.readout(o), color });
        });
        this._updateButtons();
        return readouts;
    }

    /** "a ↦ b ↦ c" on a finite set; "x_3 = f(x_2) = 0.62" on a line; with a note at the end. */
    readout(o) {
        const { it } = o;
        const { scene } = this;
        const map = it.map, set = map.from;
        const x = it.def.label !== undefined ? String(it.def.label) : 'x';
        const term = (v) => (typeof v === 'string' ? String((set.elementById.get(v) || { label: v }).label) : niceNumber(v));
        let tex;
        const k = o.shown;
        if (set.kind === 'finite') {
            tex = o.values.slice(0, k + 1).map(term).join(' \\mapsto ');
            if (o.stop === 'outside' && k === o.avail && k > 0) {
                const parts = o.values.slice(0, k).map(term);
                tex = `${parts.join(' \\mapsto ')} \\mapsto ${niceNumber(o.values[k])} \\notin ${setLabelText(scene.model, set)}`;
            }
        } else if (k === 0) {
            tex = `${x}_{0} = ${term(o.values[0])}`;
        } else {
            const v = o.values[k];
            const rel = o.stop === 'outside' && k === o.avail ? `= ${niceNumber(v)} \\notin ${setLabelText(scene.model, set)}` : `= ${term(v)}`;
            tex = `${x}_{${k}} = ${map.label}\\left(${x}_{${k - 1}}\\right) ${rel}`;
        }
        // At the end: what happened
        if (k === o.avail) {
            if (o.cycle) {
                tex += o.cycle.period === 1 ? '\\quad\\text{punto fisso}' : `\\quad\\text{ciclo di periodo } ${o.cycle.period}`;
            } else if (o.stop === 'undefined') {
                tex += `\\quad ${map.label}\\left(${term(o.values[k])}\\right)\\ \\text{non definita}`;
            }
        }
        return tex;
    }

    _updateButtons() {
        if (!this.next) return;
        const max = Math.max(0, ...(this.current || []).map(o => o.avail || 0));
        if (this.k > max) this.k = max;
        this.back.disabled = this.k <= 0;
        this.reset.disabled = this.k <= 0;
        this.next.disabled = this.k >= max;
    }
}

function inWindow(set, v) {
    if (set.kind !== 'interval') return true;
    const w = set.window, s = (w[1] - w[0]) * 0.02;
    return typeof v === 'number' && v >= w[0] - s && v <= w[1] + s;
}
