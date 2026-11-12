/**
 * Computed layers drawn over the sets: images, preimages, collisions,
 * highlights of chosen elements or sub-intervals; and the properties badge
 * (injective / surjective / bijective) under the diagram.
 */
import { roundedHullPath, convexHull, insideHull } from '../core/geometry.js';
import { pointPx, setLabelText } from '../core/layout.js';
import { parseInterval, evalInterval, intervalTeX } from '../core/interval.js';
import { intersect } from '../core/model.js';
import { parseSelector } from '../core/selectors.js';

const f2 = (v) => +v.toFixed(2);

/** Draws one layer (it is visible). */
export function drawLayer(scene, layer) {
    const { model } = scene;
    if (layer.sel) {
        const map = model.mapById.get(layer.sel.map);
        const def = layer.def || {};
        const { op, arg } = layer.sel;
        if (op === 'image') {
            const res = model.image(map, arg);
            const label = def.label !== undefined ? def.label : imageLabel(scene, map, arg, res);
            drawResult(scene, res, scene.color(def.color, def.of ? 'highlight' : 'image'), label, layer.key);
        } else if (op === 'preimage') {
            const res = model.preimage(map, arg);
            const label = def.label !== undefined ? def.label : `${map.label}^{-1}\\left(${argTeX(arg, model)}\\right)`;
            drawResult(scene, res, scene.color(def.color, def.of ? 'highlight' : 'preimage'), label, layer.key);
        } else if (op === 'collisions') {
            drawCollisions(scene, map, scene.color(def.color, 'collisions'), def.label);
        }
        return;
    }
    // Highlight of chosen elements or of a sub-interval of a set
    const h = layer.def, set = layer.set;
    const color = scene.color(h.color, 'highlight');
    if (set.kind === 'finite') {
        const ids = (Array.isArray(h.elements) ? h.elements : []).map(String).filter(id => {
            if (set.elementById.has(id)) return true;
            scene._addWarning(`highlight '${layer.key}': '${id}' is not an element of ${set.id}`);
            return false;
        });
        drawResult(scene, { kind: 'elements', set, ids }, color, h.label, layer.key);
    } else if (set.kind === 'interval' && h.interval !== undefined) {
        const p = parseInterval(String(h.interval));
        if (!p) {
            scene._addWarning(`highlight '${layer.key}': '${h.interval}' is not an interval`);
            return;
        }
        const I = intersect(set.I, evalInterval(p, (s) => scene._num(s)));
        drawResult(scene, { kind: 'interval', set, I }, color, h.label, layer.key);
    } else {
        scene._addWarning(`highlight '${layer.key}': needs "elements" (finite set) or "interval"`);
    }
}

/** "f(A)", "f(\{a_1\})", "f([0, 1/2])" for the label of an image. */
function imageLabel(scene, map, arg, res) {
    const of = arg ? argTeX(arg, scene.model) : setLabelText(scene.model, map.from);
    let s = `${map.label}\\left(${of}\\right)`;
    if (res && res.kind === 'interval' && !res.given) s += ` = ${intervalTeX(res.I)}`;
    if (res && res.kind === 'intervals' && res.parts.length <= 3) s += ` = ${res.parts.map(intervalTeX).join(' \\cup ')}`;
    return s;
}

function argTeX(arg, model) {
    if (!arg) return '';
    if (arg.kind === 'selector') {
        // image(f) -> f(A), preimage(f, …) -> f^{-1}(…)
        const sel = parseSelector(arg.src);
        const m = sel && model.mapById.get(sel.map);
        if (!m) return arg.src;
        const inner = sel.arg ? argTeX(sel.arg, model) : setLabelText(model, m.from);
        return sel.op === 'image' ? `${m.label}\\left(${inner}\\right)` : `${m.label}^{-1}\\left(${inner}\\right)`;
    }
    if (arg.kind === 'elements') return `\\{${arg.ids.join(',\\,')}\\}`;
    if (arg.kind === 'interval') return arg.src.replace(/inf(inity)?/gi, '\\infty');
    return arg.id;
}

/** Draws a computed result (see SetsModel.image / preimage) in a colour, with a label. */
function drawResult(scene, res, color, label, key) {
    if (!res) return;
    const { layout, groups } = scene;
    const g = scene.svgEl('g', { class: 'mps-layer', 'data-layer': key }, groups.over);
    const P = layout.sets.get(res.set.id);
    if (!P) return;
    const row = layout.orient === 'row';
    let anchorPt = null;

    if (res.kind === 'elements') {
        const pts = res.ids.map(id => pointPx(layout, res.set, id)).filter(Boolean);
        if (!pts.length) return;
        anchorPt = loops(scene, g, res.set, P, pts, color);
    } else if (res.kind === 'points') {
        const pts = res.points.map(p => pointPx(layout, res.set, p)).filter(Boolean);
        pts.forEach(([x, y]) => {
            const c = scene.svgEl('circle', { cx: f2(x), cy: f2(y), r: 7, class: 'mps-ring' }, g);
            c.style.stroke = color;
        });
        if (pts.length) anchorPt = farthest(pts, P, row);
    } else if (res.kind === 'interval' || res.kind === 'intervals') {
        const parts = res.kind === 'interval' ? [res.I] : res.parts;
        parts.forEach(I => { anchorPt = band(scene, g, res.set, P, I, color) || anchorPt; });
    } else if (res.kind === 'cells' || res.kind === 'level') {
        // Preimage in the plane: grid cells (a region), and for a single value its level curve
        const toPt = (x, y) => P.toPx([x, y]).map(f2).join(',');
        const cells = res.cells.map(([x0, y0, x1, y1]) => `M${toPt(x0, y0)}L${toPt(x1, y0)}L${toPt(x1, y1)}L${toPt(x0, y1)}Z`).join('');
        if (cells) {
            const path = scene.svgEl('path', { d: cells, class: 'mps-cells-highlight' }, g);
            path.style.fill = color;
        }
        if (res.kind === 'level' && res.segments.length) {
            const d = res.segments.map(([a, b]) => `M${toPt(a[0], a[1])}L${toPt(b[0], b[1])}`).join('');
            const path = scene.svgEl('path', { d, class: 'mps-level-highlight' }, g);
            path.style.stroke = color;
        }
        // The label goes next to the drawing: at the middle of the level curve, or of the region
        if (res.kind === 'level' && res.segments.length) {
            const m = res.segments[Math.floor(res.segments.length / 2)][0];
            const q = P.toPx(m);
            anchorPt = [q[0] + 6, q[1] - 8];
        } else if (res.cells.length) {
            let A = 0, cx = 0, cy = 0;
            res.cells.forEach(([x0, y0, x1, y1]) => {
                const a = (x1 - x0) * (y1 - y0);
                A += a;
                cx += a * (x0 + x1) / 2;
                cy += a * (y0 + y1) / 2;
            });
            anchorPt = P.toPx([cx / A, cy / A]);
        } else {
            anchorPt = [P.box.x + 6, P.box.y + 14];
        }
    } else if (res.kind === 'region') {
        const pts = res.polygon.map(p => P.toPx(p));
        if (pts.length < 3) return;
        const poly = scene.svgEl('polygon', { points: pts.map(p => `${f2(p[0])},${f2(p[1])}`).join(' '), class: 'mps-region-highlight' }, g);
        poly.style.fill = color;
        poly.style.stroke = color;
        anchorPt = [P.box.x + 6, P.box.y + 14];
    } else if (res.kind === 'curve') {
        (res.lines || [res.points]).forEach(line => {
            const pts = line.map(p => P.toPx(p));
            const pl = scene.svgEl('polyline', { points: pts.map(p => `${f2(p[0])},${f2(p[1])}`).join(' '), class: 'mps-curve-highlight' }, g);
            pl.style.stroke = color;
        });
        anchorPt = [P.box.x + 6, P.box.y + 14];
    }
    if (label && anchorPt) layerLabel(scene, g, P, anchorPt, label, color, res.kind);
}

/**
 * Loops around elements, as drawn on a blackboard. One loop when no other
 * element falls inside it, otherwise one per element. Returns where the
 * label goes.
 */
function loops(scene, g, set, P, pts, color) {
    const r = 15;
    const others = [];
    P.elements.forEach(pos => {
        if (!pts.some(p => Math.abs(p[0] - pos.x) < 0.5 && Math.abs(p[1] - pos.y) < 0.5)) others.push([pos.x, pos.y]);
    });
    const hull = convexHull(pts);
    const groupsOf = others.some(o => insideHull(hull.length ? hull : pts, o, r - 2)) ? pts.map(p => [p]) : [pts];
    groupsOf.forEach(grp => {
        const d = roundedHullPath(grp, r);
        const path = scene.svgEl('path', { d, class: 'mps-loop' }, g);
        path.style.stroke = color;
        path.style.fill = color;
    });
    // The label goes at the middle of the group (layerLabel moves it outside the oval)
    return [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
}

/** The point of a group farthest from the centre of its set (where the label sits). */
function farthest(pts, P, row) {
    // The label goes beside the group, on the side of the element labels
    return pts.reduce((best, p) => (row ? (p[1] < best[1] ? p : best) : (p[0] > best[0] ? p : best)), pts[0]);
}

/**
 * A thick band along an interval set, over the part I (cut to the window),
 * with dots for its endpoints: filled when they belong to I, hollow when not.
 */
function band(scene, g, set, P, I, color) {
    const w = set.window;
    const lo = Math.max(isFinite(I.lo) ? I.lo : w[0], w[0]), hi = Math.min(isFinite(I.hi) ? I.hi : w[1], w[1]);
    if (!(hi >= lo)) return null;
    const row = scene.layout.orient === 'row';
    // Beside the segment, away from the arrows (on the side of the end labels);
    // on a dynagraph that side has the tick numbers: the band goes on the line itself
    const side = P.tickSide === 'after' ? 1 : -1;
    const off = scene.dynagraph ? 0 : 9 * side;
    const shift = (p) => (row ? [p[0] + off, p[1]] : [p[0], p[1] + off]);
    const a = shift(P.toPx(lo)), b = shift(P.toPx(hi));
    const line = scene.svgEl('line', { x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), class: 'mps-band' }, g);
    line.style.stroke = color;
    [[a, I.loClosed && isFinite(I.lo) && I.lo >= w[0], isFinite(I.lo) && I.lo >= w[0]], [b, I.hiClosed && isFinite(I.hi) && I.hi <= w[1], isFinite(I.hi) && I.hi <= w[1]]]
        .forEach(([p, closed, finite]) => {
            if (!finite) return;
            const c = scene.svgEl('circle', { cx: f2(p[0]), cy: f2(p[1]), r: 4, class: closed ? 'mps-end-closed' : 'mps-end-open' }, g);
            c.style.stroke = color;
            if (closed) c.style.fill = color;
        });
    // Label next to the middle of the band
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const away = scene.dynagraph ? -side : side;
    return row ? [m[0] + 10 * away, m[1]] : [m[0], m[1] + 12 * away];
}

/** Label of a layer, beside its group, in the layer's colour. */
function layerLabel(scene, g, P, at, label, color, kind) {
    const row = scene.layout.orient === 'row';
    const size = scene.fontSize * 0.9;
    if (P.kind === 'interval') {
        // On a dynagraph the label goes on the side without tick numbers
        const side = (P.tickSide === 'after' ? 1 : -1) * (scene.dynagraph ? -1 : 1);
        if (kind === 'points') {
            // Next to the outermost ring, on the side of the end labels
            if (row) scene.text(at[0] + 16 * side, at[1], label, { parent: g, color, size, anchor: side < 0 ? 'end' : 'start' });
            else scene.text(at[0], at[1] + 22 * side, label, { parent: g, color, size });
            return;
        }
        if (row) scene.text(at[0] + 4 * side, at[1], label, { parent: g, color, size, anchor: side < 0 ? 'end' : 'start' });
        else scene.text(at[0], at[1] + 10 * side, label, { parent: g, color, size });
        return;
    }
    if (P.kind === 'finite') {
        // Outside the oval, level with the middle of the group: on the side of the
        // element labels in a row (left for a domain), under the oval in a column
        if (row) {
            const left = P.role === 'source';
            scene.text(P.cx + (left ? -1 : 1) * (P.rx + 8), at[1], label, { parent: g, color, size, anchor: left ? 'end' : 'start' });
        } else {
            scene.text(at[0], P.cy + P.ry + size * 0.9, label, { parent: g, color, size });
        }
        return;
    }
    // Plane regions: inside the box, at its top-left corner
    scene.text(at[0], at[1], label, { parent: g, color, size: size * 0.9, anchor: 'start' });
}

/**
 * Collisions: a loop around each shared image and its label "f(a_1) = f(a_3)";
 * the arrows involved are already drawn in the same colour.
 */
function drawCollisions(scene, map, color, label) {
    const { model, layout, groups } = scene;
    const g = scene.svgEl('g', { class: 'mps-layer mps-collisions' }, groups.over);
    const P = layout.sets.get(map.to.id);
    model.collisions(map).forEach((c, k) => {
        const px = pointPx(layout, map.to, c.target);
        if (!px) return;
        const loop = scene.svgEl('path', { d: roundedHullPath([px], 13), class: 'mps-loop mps-loop-strong' }, g);
        loop.style.stroke = color;
        loop.style.fill = color;
        const from = map.from.elementById ? map.from : null;
        const names = c.sources.map(s => (from ? from.elementById.get(s).label : s));
        const text = label !== undefined ? label : names.map(n => `${map.label}(${n})`).join(' = ');
        // Under the codomain's oval, one line per shared image: there is room
        // there, also on a phone (in a column, it is the codomain's last row)
        const size = scene.fontSize * 0.85;
        scene.text(P.cx, P.cy + P.ry + size * (1 + 1.3 * k), text, { parent: g, color, size });
    });
}

/**
 * Elements of a finite domain that make a relation fail to be a function
 * (no image, or more than one): a dashed ring, with the reason as tooltip.
 */
export function drawPropertyMarks(scene, map) {
    const { model, layout, groups } = scene;
    if (map.from.kind !== 'finite') return;
    const color = scene.color(null, 'collisions');
    const g = scene.svgEl('g', { class: 'mps-layer mps-props-marks' }, groups.over);
    map.from.elements.forEach(e => {
        const n = model.apply(map, e.id).length;
        if (n === 1) return;
        const px = pointPx(layout, map.from, e.id);
        if (!px) return;
        const ring = scene.svgEl('circle', { cx: f2(px[0]), cy: f2(px[1]), r: 10, class: 'mps-ring' }, g);
        ring.style.stroke = color;
        ring.setAttribute('stroke-dasharray', '3 2.5');
        const tip = scene.svgEl('title', {}, ring);
        tip.textContent = n === 0 ? `${plain(e.label)} non ha immagine` : `${plain(e.label)} ha ${n} immagini`;
    });
}

/**
 * The properties badges, under the diagram: for each map
 * "f: iniettiva ✗ · suriettiva ✗ · biiettiva ✗", with the reasons in a
 * tooltip. Numeric checks (continuous sets) are marked as such.
 */
export function renderProperties(scene, layers) {
    const el = scene.propsEl;
    el.textContent = '';
    layers.forEach(l => {
        const map = scene.model.mapById.get(l.sel.map);
        if (!map) return;
        const p = scene.model.properties(map);
        const row = document.createElement('div');
        row.className = 'matephis-sets-props-row';
        const name = document.createElement('span');
        name.className = 'matephis-sets-props-name';
        const from = setLabelText(scene.model, map.from), to = setLabelText(scene.model, map.to);
        const mj = typeof window !== 'undefined' && window.MathJax && window.MathJax.tex2svg;
        let typeset = false;
        if (mj) {
            try {
                name.appendChild(window.MathJax.tex2svg(`${map.label}\\colon ${from} \\to ${to}`, { display: false }));
                typeset = true;
            } catch (e) { /* plain text below */ }
        }
        if (!typeset) name.textContent = `${plain(map.label)}: ${plain(from)} → ${plain(to)}`;
        row.appendChild(name);
        const chip = (text, ok, title) => {
            const c = document.createElement('span');
            c.className = `matephis-sets-chip ${ok === true ? 'is-yes' : ok === false ? 'is-no' : 'is-unknown'}`;
            c.textContent = `${text} ${ok === true ? '✓' : ok === false ? '✗' : '?'}`;
            if (title) c.title = title;
            row.appendChild(c);
        };
        if (!p.isFunction) chip('funzione', false, p.problems.join('; '));
        if (!p.into) chip(`a valori in ${plain(setLabelText(scene.model, map.to))}`, false, p.problems.join('; '));
        // Injective and surjective are said of functions only
        if (p.isFunction || p.claimed) {
            chip('iniettiva', p.injective);
            chip('suriettiva', p.surjective);
        }
        chip('biiettiva', p.bijective);
        if (!p.exact && !p.claimed) {
            const note = document.createElement('span');
            note.className = 'matephis-sets-props-note';
            note.textContent = 'verifica numerica';
            row.appendChild(note);
        }
        el.appendChild(row);
    });
}

/** A TeX label as plain text: "g \\circ f" -> "g ∘ f", "a_1" -> "a1". */
export function plain(label) {
    return String(label)
        .replace(/\\circ/g, '∘').replace(/\\pi/g, 'π').replace(/\\infty/g, '∞').replace(/\\mathbb\{R\}/g, 'ℝ').replace(/\\mathbb\{N\}/g, 'ℕ')
        .replace(/\\mathbb\{Z\}/g, 'ℤ').replace(/\\mathbb\{Q\}/g, 'ℚ').replace(/\\times/g, '×')
        .replace(/\^\{?(-?[0-9]+)\}?/g, (m, d) => [...d].map(c => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])).join(''))
        .replace(/\\left|\\right/g, '')
        .replace(/\$/g, '').replace(/\\[A-Za-z]+\s*/g, '').replace(/[{}_^]/g, '').trim();
}
