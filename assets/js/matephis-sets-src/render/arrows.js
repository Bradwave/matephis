/**
 * Arrows of maps: from each element (or sample point) to its image, curves
 * for compositions and maps between sets that are not next to each other,
 * and probes (a point of a continuous domain, draggable, with its image).
 */
import { curvedArrow, arrowHeadPoints } from '../core/geometry.js';
import { pointPx, setLabelText } from '../core/layout.js';
import { niceNumber } from '../core/interval.js';
import { SetsModel } from '../core/model.js';

const f2 = (v) => +v.toFixed(2);

/** Key of an arrow target, as collisions store it. */
const targetKey = (t) => (typeof t === 'string' ? t : JSON.stringify(t));

/** Screen direction pointing to the footer (where routed maps go). */
const footerDir = (layout) => (layout.orient === 'row' ? [0, 1] : [1, 0]);

/**
 * One arrow; returns its parts so hover can light them up.
 * @param {object} o - { from, to, color, bend, trimStart, trimEnd, dash, width, cls }
 */
export function arrow(scene, parent, o) {
    const { d, end, angle, mid } = curvedArrow(o.from, o.to, { bend: o.bend || 0, trimStart: o.trimStart || 0, trimEnd: o.trimEnd || 0 });
    const g = scene.svgEl('g', { class: o.cls || 'mps-arrow' }, parent);
    g.mid = mid;
    const path = scene.svgEl('path', { d, fill: 'none', class: 'mps-arrow-line' }, g);
    path.style.stroke = o.color;
    if (o.width) path.style.strokeWidth = `${o.width}px`;
    if (o.dash) path.setAttribute('stroke-dasharray', o.dash === true ? '5 4' : o.dash);
    const head = scene.svgEl('polygon', { points: arrowHeadPoints(end[0], end[1], angle, o.head || 8), class: 'mps-arrow-head' }, g);
    head.style.fill = o.color;
    return g;
}

/** Where the arcs of a map of a set into itself bulge: before the set (up in a column, left in a row). */
const beforeDir = (layout) => (layout.orient === 'row' ? [-1, 0] : [0, -1]);

/**
 * An arrow between two points of the same set (a map into itself): an arc
 * bulging before the set, no higher than the room the layout left for it,
 * or a small loop when the two points are the same (a fixed point).
 */
export function selfArrow(scene, parent, set, a, b, o) {
    const P = scene.layout.sets.get(set.id);
    const dir = beforeDir(scene.layout);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 3) return loopArrow(scene, parent, a, dir, o);
    const room = P && P.selfRoom ? P.selfRoom : 60;
    // Height of the arc: grows with the distance, never flat, never past the room
    const h = Math.min(room, 14 + 0.3 * L);
    const size = (2 * h) / L;
    // The side of the chord that faces "before"
    const nx = (b[1] - a[1]) / L, ny = -(b[0] - a[0]) / L;
    const bend = nx * dir[0] + ny * dir[1] >= 0 ? size : -size;
    const g = arrow(scene, parent, { ...o, from: a, to: b, bend });
    g.out = dir;
    return g;
}

/** A loop out of a point and back to it (x -> x), on the side `dir`. */
function loopArrow(scene, parent, p, dir, o) {
    const R = o.loop || 26;
    const rot = (d, deg) => {
        const t = deg * Math.PI / 180;
        return [d[0] * Math.cos(t) - d[1] * Math.sin(t), d[0] * Math.sin(t) + d[1] * Math.cos(t)];
    };
    const at = (d, r) => [p[0] + d[0] * r, p[1] + d[1] * r];
    const d1 = rot(dir, -28), d2 = rot(dir, 28);
    const s = at(d1, 6), e = at(d2, 7), c1 = at(rot(dir, -50), R * 1.5), c2 = at(rot(dir, 50), R * 1.5);
    const g = scene.svgEl('g', { class: o.cls || 'mps-arrow' }, parent);
    const path = scene.svgEl('path', { d: `M${f2(s[0])},${f2(s[1])}C${f2(c1[0])},${f2(c1[1])} ${f2(c2[0])},${f2(c2[1])} ${f2(e[0])},${f2(e[1])}`, fill: 'none', class: 'mps-arrow-line' }, g);
    path.style.stroke = o.color;
    if (o.width) path.style.strokeWidth = `${o.width}px`;
    if (o.dash) path.setAttribute('stroke-dasharray', o.dash === true ? '5 4' : o.dash);
    const angle = Math.atan2(e[1] - c2[1], e[0] - c2[0]);
    const head = scene.svgEl('polygon', { points: arrowHeadPoints(e[0], e[1], angle, o.head || 8), class: 'mps-arrow-head' }, g);
    head.style.fill = o.color;
    g.mid = at(dir, R * 1.15);
    g.out = dir;
    return g;
}

/** An arrow from a point of one set to a point of another, or an arc when the set is the same. */
export function linkArrow(scene, parent, fromSet, toSet, o) {
    return fromSet === toSet ? selfArrow(scene, parent, fromSet, o.from, o.to, o) : arrow(scene, parent, o);
}

/** Bend (sign and size) that makes an arrow from a to b bulge towards the footer. */
function bendTowardsFooter(layout, a, b, size) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = dy / L, ny = -dx / L;
    const [fx, fy] = footerDir(layout);
    return nx * fx + ny * fy >= 0 ? size : -size;
}

/** Where values outside a finite codomain are drawn: just past the oval, away from the domain. */
function outsideSpot(scene, map, k, n) {
    const P = scene.layout.sets.get(map.to.id), Q = scene.layout.sets.get(map.from.id);
    // Beyond the far side of the oval, in its lower part (labels of collisions sit higher up)
    const dir = Math.sign(P.u - Q.u) || 1;
    const u = P.u + dir * (P.ru * 0.75 + 30);
    const v = P.v + P.rv * 0.75 + (k - (n - 1)) * scene.fontSize * 1.6;
    return scene.layout.orient === 'row' ? [u, v] : [v, u];
}

/** Arrows of a map between sets that are drawn next to each other. */
export function drawMapArrows(scene, map, { routed = false } = {}) {
    const { model, layout, groups } = scene;
    const base = map.color ? scene.color(map.color) : scene.ink;
    const g = scene.svgEl('g', { class: `mps-map${scene.dynagraph ? ' mps-thin' : ''}`, 'data-map': map.id }, groups.arrows);
    // An inverse runs back along its base map's arrows: when those are drawn, it bends away from them
    const baseShown = map.kind === 'inverse' && scene.layers.some(l => l.arrows && l.map === map.base && scene.isVisible(l));
    // On a dynagraph the arrows of a composition go straight across the middle line
    const bendSize = map.def.bend !== undefined ? Number(map.def.bend) : routed ? (scene.dynagraph ? 0 : 0.28) : baseShown ? 0.2 : 0;
    const dash = map.def.dash !== undefined ? map.def.dash : routed;
    const outside = [];
    const draw = (src, srcKey, srcPx, t, trimStart) => {
        let toPx, toKey = null, color = base, trimEnd = 7;
        if (t && typeof t === 'object' && !Array.isArray(t) && 'outside' in t) {
            outside.push({ src, srcPx, value: t.outside, key: srcKey });
            return;
        }
        if (typeof t === 'string') {
            toPx = pointPx(layout, map.to, t);
            toKey = `${map.to.id}|${t}`;
        } else if (SetsModel.validPoint(t)) {
            toPx = pointPx(layout, map.to, t);
            trimEnd = 4;
            if (!inWindow(map.to, t)) return;
        }
        if (!toPx) return;
        const style = scene.arrowStyle.get(`${map.id}|${src}|${targetKey(t)}`);
        if (style) color = style;
        const bend = bendSize && map.from !== map.to ? bendTowardsFooter(layout, srcPx, toPx, bendSize) : 0;
        const a = linkArrow(scene, g, map.from, map.to, { from: srcPx, to: toPx, color, bend, trimStart, trimEnd, dash, head: scene.dynagraph ? 6 : undefined });
        if (typeof t !== 'string') {
            const dot = scene.svgEl('circle', { cx: f2(toPx[0]), cy: f2(toPx[1]), r: 2.6, class: 'mps-sample' }, a);
            dot.style.fill = color;
        }
        if (srcKey) scene.interaction.addLink(srcKey, toKey, a);
    };

    if (map.from.kind === 'finite') {
        const P = layout.sets.get(map.from.id);
        P.elements.forEach((pos, id) => {
            model.apply(map, id).forEach(t => draw(id, `${map.from.id}|${id}`, [pos.x, pos.y], t, 7));
        });
    } else {
        const spec = map.def.samples !== undefined ? map.def.samples : scene.dynagraph ? scene.dynagraph.arrows : undefined;
        model.arrowSamples(map.from, spec).forEach(p => {
            const srcPx = pointPx(layout, map.from, p);
            if (!srcPx) return;
            const dot = scene.svgEl('circle', { cx: f2(srcPx[0]), cy: f2(srcPx[1]), r: 2.6, class: 'mps-sample' }, g);
            dot.style.fill = base;
            model.apply(map, p).forEach(t => draw(p, null, srcPx, t, 4));
        });
    }

    // Values that are not in a finite codomain: an arrow out of the oval, and the value crossed out
    if (outside.length) {
        const red = scene.color(null, 'collisions');
        outside.forEach((o, k) => {
            const spot = outsideSpot(scene, map, k, outside.length);
            const a = arrow(scene, g, { from: o.srcPx, to: spot, color: red, trimStart: 7, trimEnd: 10, dash: '4 3' });
            const label = `${niceNumber(o.value)}\\notin ${setLabelText(model, map.to)}`;
            const row = layout.orient === 'row';
            scene.text(spot[0] + (row ? 0 : 0), spot[1], label, { parent: a, color: red, anchor: row ? 'start' : 'middle', size: scene.fontSize * 0.85 });
            scene.interaction.addLink(o.key, null, a);
        });
    }
}

/** Is a point of a continuous set inside the part that is drawn? */
function inWindow(set, p) {
    const slack = (w) => (w[1] - w[0]) * 0.02;
    if (set.kind === 'interval') return p >= set.window[0] - slack(set.window) && p <= set.window[1] + slack(set.window);
    if (set.kind === 'rect') return set.windows.every((w, i) => p[i] >= w[0] - slack(w) && p[i] <= w[1] + slack(w));
    return true;
}

/**
 * Compositions and maps between sets that are not next to each other: one
 * curve from set to set under the diagram (row) or on its right (column),
 * labelled with the map's name. With "arrows": true the element arrows are
 * drawn too, dashed and bent the same way.
 */
export function drawRoutedMaps(scene, entries) {
    const { layout, groups } = scene;
    const row = layout.orient === 'row';
    entries.forEach(({ map, arrows: withArrows }, k) => {
        if (withArrows) drawMapArrows(scene, map, { routed: true });
        const A = layout.sets.get(map.from.id), B = layout.sets.get(map.to.id);
        const color = map.color ? scene.color(map.color) : scene.ink;
        const off = 8 + k * 6;
        const va = A.v + A.halfV + off, vb = B.v + B.halfV + off;
        const vc = layout.footer.v + 18 + k * 8;
        const toXY = (u, v) => (row ? [u, v] : [v, u]);
        const s = toXY(A.u, va), e = toXY(B.u, vb), c = toXY((A.u + B.u) / 2, vc);
        const g = scene.svgEl('g', { class: 'mps-routed', 'data-map': map.id }, groups.arrows);
        const path = scene.svgEl('path', { d: `M${f2(s[0])},${f2(s[1])}Q${f2(c[0])},${f2(c[1])} ${f2(e[0])},${f2(e[1])}`, fill: 'none', class: 'mps-arrow-line' }, g);
        path.style.stroke = color;
        const ang = Math.atan2(e[1] - c[1], e[0] - c[0]);
        const head = scene.svgEl('polygon', { points: arrowHeadPoints(e[0], e[1], ang, 8) }, g);
        head.style.fill = color;
        const midV = (va + vb) / 4 + vc / 2;
        const lp = toXY((A.u + B.u) / 2, midV + (row ? 14 : 12));
        scene.text(lp[0], lp[1], map.label, { parent: g, color, anchor: row ? 'middle' : 'start' });
    });
}

/**
 * Probes: { "map": "h", "at": "p" } puts a point at x = p in the domain of h,
 * with an arrow to h(p) and its value. "at" may be a param (then the point
 * can be dragged, and moves the slider), a number, or [x, y] in the plane.
 */
export function drawProbes(scene) {
    const cfg = scene.config;
    if (cfg.probe === undefined) return [];
    const probes = Array.isArray(cfg.probe) ? cfg.probe : [cfg.probe];
    const readouts = [];
    probes.forEach((p, i) => {
        if (!p || typeof p !== 'object') return;
        const map = scene.model.mapById.get(String(p.map));
        if (!map) {
            scene._addWarning(`probe[${i}]: no map '${p.map}'`);
            return;
        }
        if (map.from.kind === 'finite') {
            scene._addWarning(`probe[${i}]: '${map.id}' has a finite domain; probes are for intervals and regions`);
            return;
        }
        const two = map.from.kind !== 'interval';
        const atList = two ? (Array.isArray(p.at) ? p.at : [p.at, p.at]) : [Array.isArray(p.at) ? p.at[0] : p.at];
        const params = atList.map(a => (typeof a === 'string' && cfg.params && cfg.params[a] ? a : null));
        const values = atList.map((a, k) => (params[k] ? scene.params[params[k]] / paramScaleOf(cfg, params[k]) : scene._num(a, `probe[${i}].at`)));
        if (values.some(v => typeof v !== 'number' || isNaN(v))) return;
        const x = two ? values : values[0];
        const srcPx = pointPx(scene.layout, map.from, x);
        if (!srcPx) return;
        const color = scene.color(p.color, 'probe');
        const g = scene.svgEl('g', { class: 'mps-probe' }, scene.groups.probe);
        const inside = scene.model.containsPoint(map.from, x, 1e-12);
        const isCompose = map.kind === 'compose';
        // A composition is followed step by step, x -> f(x) -> g(f(x)), across the sets in between
        const steps = (x0) => {
            if (!isCompose) return null;
            const vals = [x0];
            for (const part of map.parts) {
                const prev = vals[vals.length - 1];
                const next = prev === undefined ? [] : scene.model.apply(part, prev);
                vals.push(next.length ? next[0] : undefined);
            }
            return vals;
        };
        // Values off the drawn part of a line get no arrow (the value is still written)
        const visible = (set, v) => typeof v === 'string' || inWindow(set, v);
        const drawFor = (x0, faint) => {
            const parent = faint ? scene.svgEl('g', { class: 'mps-trace' }, traceGroup) : g;
            const w = faint ? 1.4 : 2.2, head = faint ? 7 : 10;
            if (isCompose) {
                const vals = steps(x0);
                map.parts.forEach((part, k) => {
                    const a = pointPx(scene.layout, part.from, vals[k]), b = pointPx(scene.layout, part.to, vals[k + 1]);
                    if (!a || !b || vals[k + 1] === undefined || !visible(part.from, vals[k]) || !visible(part.to, vals[k + 1])) return;
                    linkArrow(scene, parent, part.from, part.to, { from: a, to: b, color, trimStart: 7, trimEnd: 5, width: w, head });
                    if (!faint) {
                        const dot = scene.svgEl('circle', { cx: f2(b[0]), cy: f2(b[1]), r: 4.5, class: 'mps-probe-target' }, parent);
                        dot.style.fill = color;
                    }
                });
                // The same point reached in one step, when the composition's arrows are shown
                const last = vals[vals.length - 1];
                const direct = scene.layers.find(l => l.arrows && l.map === map);
                const end = last !== undefined && visible(map.to, last) ? pointPx(scene.layout, map.to, last) : null;
                if (!faint && end && direct && scene.isVisible(direct)) {
                    linkArrow(scene, parent, map.from, map.to, { from: pointPx(scene.layout, map.from, x0), to: end, color, trimStart: 7, trimEnd: 5, width: 1.6, head: 9, dash: '6 4' });
                }
                return last === undefined ? [] : [last];
            }
            const vs = scene.model.apply(map, x0);
            const from = pointPx(scene.layout, map.from, x0);
            vs.forEach(y => {
                const px = typeof y === 'string' || (SetsModel.validPoint(y) && visible(map.to, y)) ? pointPx(scene.layout, map.to, y) : null;
                if (!px || !from) return;
                linkArrow(scene, parent, map.from, map.to, { from, to: px, color, trimStart: 7, trimEnd: 5, width: w, head });
                if (!faint) {
                    const dot = scene.svgEl('circle', { cx: f2(px[0]), cy: f2(px[1]), r: 4.5, class: 'mps-probe-target' }, parent);
                    dot.style.fill = color;
                }
            });
            return vs;
        };
        // "trace": the arrows of the places the point has been, faint
        const traceGroup = p.trace ? scene.svgEl('g', { class: 'mps-traces' }, g) : null;
        if (p.trace) {
            if (!scene.traces) scene.traces = new Map();
            const list = scene.traces.get(i) || [];
            const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
            if (inside && !(list.length && same(list[list.length - 1], x))) list.push(two ? x.slice() : x);
            while (list.length > 120) list.shift();
            scene.traces.set(i, list);
            list.slice(0, -1).forEach(t => drawFor(t, true));
        }
        // Several values for a relation (the inverse of a map that is not injective), none where undefined
        const ys = inside ? drawFor(x, false) : [];
        const shown = isCompose ? [] : ys.map(y => ({ y, px: typeof y === 'string' || (SetsModel.validPoint(y) && visible(map.to, y)) ? pointPx(scene.layout, map.to, y) : null })).filter(t => t.px);
        // Where the value goes is decided by the kind of map, not by the value,
        // so it never jumps between the drawing and the line under it
        const multi = map.kind === 'inverse' || (isCompose && map.parts.some(m => m.kind === 'inverse'));
        const below = two || map.to.kind !== 'interval' || multi || isCompose || map.from === map.to;
        if (p.showValue !== false && !inside && below) readouts.push({ tex: null, color });
        if (inside && p.showValue !== false) {
            const fmt = (v) => (Array.isArray(v) ? `\\left(${v.map(niceNumber).join(';\\,')}\\right)` : niceNumber(v));
            const valueTeX = (y) => (typeof y === 'string' ? String((map.to.elementById.get(y) || { label: y }).label)
                : y && typeof y === 'object' && !Array.isArray(y) && 'outside' in y ? `${niceNumber(y.outside)} \\notin ${setLabelText(scene.model, map.to)}`
                    : fmt(y));
            const name = p.label !== undefined ? String(p.label) : map.label;
            const valid = ys.filter(y => typeof y === 'string' || SetsModel.validPoint(y) || (y && typeof y === 'object' && 'outside' in y));
            const rhs = valid.length === 0 ? '\\text{non definita}'
                : valid.length === 1 ? `= ${valueTeX(valid[0])}` : `= \\left\\{${valid.map(valueTeX).join(',\\,')}\\right\\}`;
            let tex = `${name}\\left(${fmt(x)}\\right) ${rhs}`;
            if (isCompose && p.label === undefined && valid.length === 1) {
                // (g ∘ f)(x) = g(f(x)) = g(f(x) as a number) = value
                const vals = steps(x);
                const nested = map.parts.reduce((acc, part) => `${part.label}\\left(${acc}\\right)`, fmt(x));
                const lastPart = map.parts[map.parts.length - 1];
                tex = `\\left(${map.label}\\right)\\left(${fmt(x)}\\right) = ${nested} = ${lastPart.label}\\left(${fmt(vals[vals.length - 2])}\\right) ${rhs}`;
            }
            if (below) {
                // In the plane, into a finite set or with several values the drawing is crowded: the value goes in a line under it
                readouts.push({ tex, color });
            } else {
                // Over the middle of the arrow, so it never sits on the image's label (next to the point when there is no arrow)
                const toPx = shown.length ? shown[0].px : srcPx;
                const mx = (srcPx[0] + toPx[0]) / 2, my = (srcPx[1] + toPx[1]) / 2;
                const row = scene.layout.orient === 'row';
                scene.text(mx + (row ? 0 : 10), my + (row ? -14 : 0), tex, {
                    parent: g, color, anchor: row ? 'middle' : 'start', size: scene.fontSize * 0.9,
                });
            }
        }
        const handle = scene.svgEl('circle', { cx: f2(srcPx[0]), cy: f2(srcPx[1]), r: 6.5, class: 'mps-probe-handle' }, g);
        handle.style.fill = color;
        const draggable = p.drag !== false && params.some(Boolean);
        if (!draggable) return;
        handle.classList.add('mps-draggable');
        handle.setAttribute('tabindex', '0');
        handle.setAttribute('role', 'slider');
        handle.setAttribute('aria-label', `Punto di ${String(map.label).replace(/[\\{}$]/g, '')}: trascina`);
        const P = scene.layout.sets.get(map.from.id);
        scene.interaction.addDrag(handle, (px, py) => {
            let q = P.fromPx(px, py);
            q = clampToSet(map.from, q);
            const qs = two ? q : [q];
            params.forEach((name, k) => {
                if (!name) return;
                const def = cfg.params[name];
                let v = qs[k];
                const lo = scene._num(def.min !== undefined ? def.min : -Infinity), hi = scene._num(def.max !== undefined ? def.max : Infinity);
                if (isFinite(lo)) v = Math.max(lo, v);
                if (isFinite(hi)) v = Math.min(hi, v);
                if (def.step !== undefined) {
                    const st = scene._num(def.step);
                    if (st > 0) v = Math.round(v / st) * st;
                }
                scene.setParam(name, +v.toFixed(10), false);
            });
            scene.requestDraw();
        });
    });
    return readouts;
}

/**
 * Values of probes, under the diagram (MathJax when the page has it). A
 * formula changes height with its content (fractions, braces): each line
 * keeps the tallest height it has had, so what is under it never jumps.
 */

export function renderReadouts(scene, items) {
    let el = scene.readoutEl;
    if (!el) {
        el = scene.readoutEl = document.createElement('div');
        el.className = 'matephis-sets-readouts';
        (scene.split || scene.plotStage).after(el);
    }
    el.textContent = '';
    if (!scene.readoutHeights) scene.readoutHeights = [];
    items.forEach(({ tex, color }, k) => {
        const line = document.createElement('div');
        line.className = 'matephis-sets-readout';
        line.style.color = color;
        const keep = () => {
            const h = line.getBoundingClientRect().height;
            if (h > (scene.readoutHeights[k] || 0)) scene.readoutHeights[k] = h;
            if (scene.readoutHeights[k]) line.style.minHeight = `${scene.readoutHeights[k]}px`;
        };
        if (tex === null) {
            // No value now (the point is outside the set): keep the line's place
            el.appendChild(line);
            keep();
            return;
        }
        const mj = typeof window !== 'undefined' && window.MathJax && window.MathJax.tex2svg;
        if (mj) {
            try {
                line.appendChild(window.MathJax.tex2svg(tex, { display: false }));
            } catch (e) {
                line.textContent = tex;
            }
        } else {
            line.textContent = tex.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\left|\\right|\\,/g, '').replace(/\\tfrac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2');
        }
        el.appendChild(line);
        keep();
    });
}

function paramScaleOf(cfg, name) {
    const def = cfg.params && cfg.params[name];
    return def && def.unit === 'deg' ? Math.PI / 180 : 1;
}

/** Nearest point of the drawn part of a set. */
function clampToSet(set, q) {
    if (set.kind === 'interval') {
        const lo = isFinite(set.I.lo) ? set.I.lo : set.window[0], hi = isFinite(set.I.hi) ? set.I.hi : set.window[1];
        return Math.min(hi, Math.max(lo, q));
    }
    if (set.kind === 'rect') return q.map((v, i) => Math.min(set.windows[i][1], Math.max(set.windows[i][0], v)));
    const { cx, cy, r } = set.disk;
    const d = Math.hypot(q[0] - cx, q[1] - cy);
    return d <= r ? q : [cx + (q[0] - cx) * r / d, cy + (q[1] - cy) * r / d];
}
