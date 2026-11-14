/**
 * A × B as a grid ("layout": "product"): a relation or a function as a set
 * of pairs.
 *
 *   "layout": "product",
 *   "product": { "map": "r", "x": "A", "y": "B" }
 *
 * Every pair (a, b) is a faint dot; the pairs of the map are marked. The
 * first set runs along x (columns), the second along y (rows), unless "x"
 * and "y" say otherwise. Hovering a column (or its label) outlines it: in
 * the map's colour when it has exactly one mark (a function there), in red
 * when it has none or more than one. Rows light up too. Columns and rows
 * have the hover keys of the elements ("A|a"), so "sync" with an arrow
 * diagram of the same sets lights the same element in both.
 * Highlights of elements (and images, preimages) shade columns or rows.
 */
import { setLabelText } from '../core/layout.js';

const f2 = (v) => +v.toFixed(2);

export class Product {
    constructor(scene, def) {
        this.scene = scene;
        const d = def && typeof def === 'object' ? def : {};
        const { model } = scene;
        this.map = d.map !== undefined ? model.mapById.get(String(d.map)) : model.maps[0];
        if (!this.map) scene._addWarning(d.map !== undefined ? `product: no map '${d.map}'` : 'product: needs a map ("product": { "map": "r" })');
        const pick = (id, fallback) => (id !== undefined ? model.setById.get(String(id)) : fallback);
        this.xSet = pick(d.x, this.map ? this.map.from : model.sets[0]);
        this.ySet = pick(d.y, this.map ? this.map.to : model.sets[1]);
        [['x', this.xSet], ['y', this.ySet]].forEach(([k, set]) => {
            if (!set) scene._addWarning(`product: no set for "${k}"`);
            else if (!enumerable(set)) scene._addWarning(`product: '${set.id}' has no list of elements (use a finite set, or integers with a window)`);
        });
        // The map goes from x to y; with "x" and "y" swapped, its pairs are read the other way
        this.swapped = !!(this.map && this.xSet === this.map.to && this.ySet === this.map.from && this.xSet !== this.ySet);
    }

    get ok() {
        return !!(this.xSet && this.ySet && enumerable(this.xSet) && enumerable(this.ySet));
    }

    /** Ids (or numbers) along an axis. */
    ids(set) {
        return set.kind === 'finite' ? set.elements.map(e => e.id) : (set.points || []);
    }

    label(set, id) {
        if (set.kind === 'finite') return String((set.elementById.get(id) || { label: id }).label);
        return String(id);
    }

    /** Is (a, b) a pair of the map? */
    has(a, b) {
        if (!this.map) return false;
        const [x, y] = this.swapped ? [b, a] : [a, b];
        return this.scene.model.apply(this.map, x).some(v => String(v) === String(y));
    }

    /** Lays out the grid in the scene's width. */
    layout() {
        const { scene } = this;
        const xs = this.ids(this.xSet), ys = this.ids(this.ySet);
        const fs = scene.fontSize;
        const labelW = Math.max(24, ...ys.map(id => scene.measure(this.label(this.ySet, id)).w)) + 14;
        const left = 16 + labelW + fs * 1.6;
        const top = fs * 1.6;
        const room = scene.width - left - 24;
        const cell = Math.max(18, Math.min(52, room / Math.max(1, xs.length)));
        const gridW = cell * xs.length, gridH = cell * ys.length;
        const x0 = left + Math.max(0, (room - gridW) / 2);
        const cols = new Map(), rows = new Map();
        xs.forEach((id, i) => cols.set(String(id), x0 + cell * (i + 0.5)));
        // Rows from the bottom up, as on the y axis
        ys.forEach((id, j) => rows.set(String(id), top + gridH - cell * (j + 0.5)));
        return { orient: 'product', sets: new Map(), x0, top, cell, gridW, gridH, cols, rows, height: top + gridH + fs * 3.2, width: scene.width };
    }

    /** Draws the grid, the marks, and the hover targets of columns and rows. */
    draw() {
        const { scene } = this;
        const L = scene.layout;
        const g = scene.groups.sets;
        const ink = scene.ink;
        const color = scene.color(this.map && this.map.color ? this.map.color : 'blue');
        const red = scene.color(null, 'collisions');
        const fs = scene.fontSize;
        const xs = this.ids(this.xSet), ys = this.ids(this.ySet);
        const { x0, top, cell, gridW, gridH } = L;
        const bottom = top + gridH;
        // Axes with arrows, and the sets' names at their ends
        scene.svgEl('line', { x1: f2(x0 - 6), y1: f2(bottom), x2: f2(x0 + gridW + 10), y2: f2(bottom), class: 'mps-axis' }, g);
        scene.svgEl('line', { x1: f2(x0), y1: f2(bottom + 6), x2: f2(x0), y2: f2(top - 10), class: 'mps-axis' }, g);
        scene.text(x0 + gridW + 16, bottom, setLabelText(scene.model, this.xSet), { parent: scene.groups.header, anchor: 'start' });
        scene.text(x0, top - fs * 0.9, setLabelText(scene.model, this.ySet), { parent: scene.groups.header });
        // Columns and rows: hover targets (and what lights up)
        xs.forEach(a => {
            const cx = L.cols.get(String(a));
            const marks = ys.filter(b => this.has(a, b)).length;
            const col = scene.svgEl('rect', {
                x: f2(cx - cell / 2), y: f2(top), width: f2(cell), height: f2(gridH),
                class: `mps-col${marks === 1 ? '' : ' is-bad'}`, tabindex: 0,
            }, scene.groups.under);
            col.style.setProperty('--mps-col', marks === 1 ? color : red);
            const tip = scene.svgEl('title', {}, col);
            tip.textContent = marks === 1 ? `${plainLabel(this.label(this.xSet, a))}: una coppia` : marks === 0
                ? `${plainLabel(this.label(this.xSet, a))}: nessuna coppia` : `${plainLabel(this.label(this.xSet, a))}: ${marks} coppie`;
            const lab = scene.svgEl('g', { class: 'mps-axis-label' }, scene.groups.labels);
            scene.text(cx, bottom + fs * 1.1, this.label(this.xSet, a), { parent: lab, color: ink });
            scene.interaction.addNode(`${this.xSet.id}|${a}`, col);
            scene.interaction.addNode(`${this.xSet.id}|${a}`, lab);
        });
        ys.forEach(b => {
            const cy = L.rows.get(String(b));
            const row = scene.svgEl('rect', { x: f2(x0), y: f2(cy - cell / 2), width: f2(gridW), height: f2(cell), class: 'mps-row', tabindex: 0 }, scene.groups.under);
            row.style.setProperty('--mps-col', color);
            const lab = scene.svgEl('g', { class: 'mps-axis-label' }, scene.groups.labels);
            scene.text(x0 - 12, cy, this.label(this.ySet, b), { parent: lab, color: ink, anchor: 'end' });
            if (this.ySet !== this.xSet) {
                scene.interaction.addNode(`${this.ySet.id}|${b}`, row);
                scene.interaction.addNode(`${this.ySet.id}|${b}`, lab);
            }
        });
        // Every pair a faint dot, the pairs of the map filled
        xs.forEach(a => ys.forEach(b => {
            const cx = L.cols.get(String(a)), cy = L.rows.get(String(b));
            const on = this.has(a, b);
            const dot = scene.svgEl('circle', { cx: f2(cx), cy: f2(cy), r: on ? 6 : 2.4, class: on ? 'mps-pair' : 'mps-cell' }, scene.groups.elements);
            if (on) dot.style.fill = color;
        }));
    }

    /** A highlight: elements of the x set shade columns, of the y set rows. */
    drawResult(res, color, label) {
        const { scene } = this;
        const L = scene.layout;
        if (!res || res.kind !== 'elements') return;
        const g = scene.svgEl('g', { class: 'mps-layer' }, scene.groups.over);
        const { top, cell, gridW, gridH, x0 } = L;
        res.ids.forEach(id => {
            let r = null;
            if (res.set === this.xSet && L.cols.has(String(id))) r = { x: L.cols.get(String(id)) - cell / 2, y: top, w: cell, h: gridH };
            else if (res.set === this.ySet && L.rows.has(String(id))) r = { x: x0, y: L.rows.get(String(id)) - cell / 2, w: gridW, h: cell };
            if (!r) return;
            const rect = scene.svgEl('rect', { x: f2(r.x), y: f2(r.y), width: f2(r.w), height: f2(r.h), class: 'mps-band-rect' }, g);
            rect.style.fill = color;
            rect.style.stroke = color;
        });
        if (label) scene.text(x0 + gridW + 16, top + scene.fontSize * 0.6, label, { parent: g, color, anchor: 'start', size: scene.fontSize * 0.9 });
    }
}

/** Sets whose elements can be listed: finite ones, and integers in a window. */
export function enumerable(set) {
    return set && (set.kind === 'finite' || set.kind === 'integers');
}

function plainLabel(s) {
    return String(s).replace(/[\\{}$]/g, '').replace(/_/g, '');
}
