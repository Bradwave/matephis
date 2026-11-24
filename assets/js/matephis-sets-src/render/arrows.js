/**
 * Arrows of maps: from each element (or sample point) to its image, curves
 * for compositions and maps between sets that are not next to each other,
 * and probes (a point of a continuous domain, draggable, with its image).
 */
import { curvedArrow, arrowHeadPoints } from '../core/geometry.js';
import { pointPx, setLabelText } from '../core/layout.js';
import { niceNumber } from '../core/interval.js';
import { SetsModel } from '../core/model.js';
import { TexNodes, texReady, onNextFrame } from '../../matephis-plot-src/renderers/mathjax-bridge.js';

const f2 = (v) => +v.toFixed(2);

/** A map's name before an argument or an exponent: "f", "T_1" stay, "g \circ f", "n + 1" get brackets. */
export function fnTeX(label) {
    const s = String(label);
    return /^\\?[A-Za-z]+('*)(_\{?[A-Za-z0-9]+\}?)?(\^\{?[^{}]*\}?)?$/.test(s) && !/\^/.test(s) ? s : `\\left(${s}\\right)`;
}


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
        // The inputs of a table get their arrows too, with the row's hover key
        const samples = model.arrowSamples(map.from, spec).map(p => ({ p, key: null }));
        (scene.table ? scene.table.samplesFor(map) : []).forEach(e => {
            const same = samples.find(s => typeof s.p === 'number' && Math.abs(s.p - e.p) <= 1e-9 * Math.max(1, Math.abs(e.p)));
            if (same) same.key = e.key;
            else if (model.containsPoint(map.from, e.p, 1e-9)) samples.push(e);
        });
        samples.forEach(({ p, key }) => {
            const srcPx = pointPx(layout, map.from, p);
            if (!srcPx) return;
            const dot = scene.svgEl('circle', { cx: f2(srcPx[0]), cy: f2(srcPx[1]), r: 2.6, class: 'mps-sample' }, g);
            dot.style.fill = base;
            model.apply(map, p).forEach(t => draw(p, key, srcPx, t, 4));
            // An input of the table: its point lights the row (and the row lights it)
            if (key) {
                const hit = scene.svgEl('circle', { cx: f2(srcPx[0]), cy: f2(srcPx[1]), r: 9, class: 'mps-hit mps-sample-hit' }, g);
                hit.style.pointerEvents = 'all';
                scene.interaction.addNode(key, hit);
            }
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
        if (map.from.kind === 'finite' && !map.from.intLine) {
            scene._addWarning(`probe[${i}]: '${map.id}' has a finite domain; probes are for intervals, integers and regions`);
            return;
        }
        const two = map.from.kind !== 'interval' && !map.from.intLine;
        const atList = two ? (Array.isArray(p.at) ? p.at : [p.at, p.at]) : [Array.isArray(p.at) ? p.at[0] : p.at];
        const params = atList.map(a => (typeof a === 'string' && cfg.params && cfg.params[a] ? a : null));
        const values = atList.map((a, k) => (params[k] ? scene.params[params[k]] / paramScaleOf(cfg, params[k]) : scene._num(a, `probe[${i}].at`)));
        // "at": "-p" (an expression of one param): dragging moves that param
        const exprParams = atList.map((a, k) => {
            if (params[k] || typeof a !== 'string') return null;
            const names = Object.keys(cfg.params || {}).filter(n => scene.mentionsParam(a) && new RegExp(`(^|[^A-Za-z0-9_])${n}($|[^A-Za-z0-9_])`).test(a));
            return names.length === 1 ? names[0] : null;
        });
        if (values.some(v => typeof v !== 'number' || isNaN(v))) return;
        // On integers the point is an integer of the set (the nearest one)
        const x = two ? values : map.from.intLine ? snapInt(map.from, values[0]) : values[0];
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
            map.parts.forEach((part, k) => {
                const prev = vals[vals.length - 1];
                // Not in the next map's domain (when the sets differ): the chain stops
                const out = k > 0 && map.parts[k - 1].to !== part.from && prev !== undefined && !scene.model.containsPoint(part.from, prev, 1e-12);
                const next = prev === undefined || out ? [] : scene.model.apply(part, prev);
                const v = next.length ? next[0] : undefined;
                vals.push(v !== undefined && (typeof v === 'string' || SetsModel.validPoint(v)) ? v : undefined);
            });
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
                // The chain stops where a value is not in the next domain: a cross there
                if (!faint) {
                    const stop = vals.findIndex((v, k) => k > 0 && v === undefined);
                    if (stop > 1) {
                        const prevSet = map.parts[stop - 2].to;
                        const at = vals[stop - 1];
                        const px = visible(prevSet, at) ? pointPx(scene.layout, prevSet, at) : null;
                        if (px) {
                            const red = scene.color(null, 'collisions');
                            const c = scene.svgEl('g', { class: 'mps-cross' }, parent);
                            [[-1, -1, 1, 1], [-1, 1, 1, -1]].forEach(([a, b, c2, d]) => {
                                const l = scene.svgEl('line', { x1: f2(px[0] + 6 * a), y1: f2(px[1] + 6 * b), x2: f2(px[0] + 6 * c2), y2: f2(px[1] + 6 * d) }, c);
                                l.style.stroke = red;
                                l.style.strokeWidth = '2.2px';
                            });
                            const row = scene.layout.orient === 'row';
                            scene.text(px[0] + (row ? 0 : 12), px[1] + (row ? -16 : -14), `\\notin \\mathrm{dom}\\, ${map.parts[stop - 1].name}`, {
                                parent: c, color: red, size: scene.fontSize * 0.8, anchor: row ? 'middle' : 'start',
                            });
                        }
                    }
                }
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
        // With several probes their values would overlap in the drawing: lines under it
        // On a dynagraph (and on narrow diagrams) the sample arrows fill the space
        // between the lines: the value goes under the diagram too
        const below = two || map.to.kind !== 'interval' || multi || isCompose || map.from === map.to || probes.length > 1
            || !!scene.dynagraph || scene.width < 480;
        if (p.showValue !== false && !inside && below) readouts.push({ tex: null, color });
        if (inside && p.showValue !== false) {
            const fmt = (v) => (Array.isArray(v) ? `\\left(${v.map(niceNumber).join(';\\,')}\\right)` : niceNumber(v));
            const valueTeX = (y, set = map.to) => (typeof y === 'string' ? String((set.elementById.get(y) || { label: y }).label)
                : y && typeof y === 'object' && !Array.isArray(y) && 'outside' in y ? `${niceNumber(y.outside)} \\notin ${setLabelText(scene.model, map.to)}`
                    : fmt(y));
            const name = p.label !== undefined ? String(p.label) : map.name;
            const valid = ys.filter(y => typeof y === 'string' || SetsModel.validPoint(y) || (y && typeof y === 'object' && 'outside' in y));
            const rhs = valid.length === 0 ? '\\text{non definita}'
                : valid.length === 1 ? `= ${valueTeX(valid[0])}` : `= \\left\\{${valid.map(v => valueTeX(v)).join(',\\,')}\\right\\}`;
            let tex = `${name}\\left(${fmt(x)}\\right) ${rhs}`;
            if (isCompose && p.label === undefined && valid.length === 1 && map.parts.length > 1) {
                // (h ∘ f ∘ d)(x) = h(f(d(x))) = h(f(v1)) = h(v2) = value: one step at a time
                const vals = steps(x);
                const val = (v, set) => (typeof v === 'string' ? valueTeX(v, set) : fmt(v));
                const terms = [];
                for (let k = 0; k < map.parts.length; k++) {
                    const inner = k === 0 ? fmt(x) : val(vals[k], map.parts[k - 1].to);
                    terms.push(map.parts.slice(k).reduce((acc, part) => `${part.name}\\left(${acc}\\right)`, inner));
                }
                tex = `${fnTeX(map.name)}\\left(${fmt(x)}\\right) = ${terms.join(' = ')} ${rhs}`;
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
        if (!scene.probeValues) scene.probeValues = [];
        scene.probeValues[i] = { x, ys: inside ? ys : [], map, at: p.at, label: p.label };
        const draggable = p.drag !== false && (params.some(Boolean) || exprParams.some(Boolean));
        if (!draggable) return;
        handle.classList.add('mps-draggable');
        handle.setAttribute('tabindex', '0');
        handle.setAttribute('role', 'slider');
        handle.setAttribute('aria-label', `Punto di ${String(map.name).replace(/[\\{}$]/g, '')}: trascina`);
        const P = scene.layout.sets.get(map.from.id);
        scene.interaction.addDrag(handle, (px, py) => {
            let q = P.fromPx(px, py);
            q = clampToSet(map.from, q);
            const qs = two ? q : [q];
            atList.forEach((src, k) => {
                const name = params[k] || exprParams[k];
                if (!name) return;
                const def = cfg.params[name];
                let v = params[k] ? qs[k] : solveParam(scene, src, name, qs[k]);
                if (!isFinite(v)) return;
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
 * The heights are read in the next frame, for every line of every diagram
 * at once: a read right after each line is drawn would make the browser lay
 * out the page again for each one.
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
    // A formula that has not changed since the last draw is the same node again
    const pool = scene._readoutTex || (scene._readoutTex = new TexNodes(scene));
    items.forEach(({ tex, color }, k) => {
        const line = document.createElement('div');
        line.className = 'matephis-sets-readout';
        line.style.color = color;
        if (scene.readoutHeights[k]) line.style.minHeight = `${scene.readoutHeights[k]}px`;
        if (tex === null) {
            // No value now (the point is outside the set): keep the line's place
            el.appendChild(line);
            keepHeight(scene, k, line);
            return;
        }
        if (texReady(scene)) {
            const node = pool.get(tex);
            if (node) line.appendChild(node);
            else line.textContent = tex;
        } else {
            line.textContent = tex.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\left|\\right|\\,/g, '').replace(/\\tfrac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2');
        }
        el.appendChild(line);
        keepHeight(scene, k, line);
    });
    pool.done();
}

/** Readout lines whose height is read in the next frame. */
const toMeasure = [];

export function keepHeight(scene, k, line) {
    toMeasure.push({ scene, k, line });
    if (toMeasure.length === 1) onNextFrame(measureReadouts);
}

/** All the reads, then all the writes: one layout. Lines redrawn since are gone from the page and skipped. */
export function measureReadouts() {
    const batch = toMeasure.splice(0).filter(m => m.line.isConnected);
    const heights = batch.map(m => m.line.getBoundingClientRect().height);
    batch.forEach(({ scene, k, line }, i) => {
        const kept = scene.readoutHeights;
        if (heights[i] > (kept[k] || 0)) kept[k] = heights[i];
        if (kept[k]) line.style.minHeight = `${kept[k]}px`;
    });
}

/**
 * The value of a param that makes an expression of it equal to a target
 * (for "at": "-p", "2*p + 1"): secant steps from the current value. Exact
 * for linear expressions; NaN when it does not converge.
 */
function solveParam(scene, src, name, target) {
    const k = paramScaleOf(scene.config, name);
    const saved = scene.params[name];
    const f = (v) => {
        scene.params[name] = v * k;
        return scene._num(src) - target;
    };
    let a = saved / k, b = a + 1;
    let fa = f(a), fb = f(b);
    for (let it = 0; it < 30 && Math.abs(fb) > 1e-12; it++) {
        if (fb === fa) break;
        const c = b - fb * (b - a) / (fb - fa);
        a = b; fa = fb;
        b = c; fb = f(b);
    }
    scene.params[name] = saved;
    return Math.abs(fb) < 1e-9 ? b : NaN;
}

/**
 * "compare": [0, 1] (or { "probes": [0, 1], "mode": "parity" }): a line on
 * two probes. Order: "p < q ⇒ f(p) < f(q)", order kept or reversed. Parity:
 * f(-p) = f(p), f(-p) = -f(p), or neither.
 */
export function compareReadout(scene) {
    const c = scene.config.compare;
    if (c === undefined) return null;
    const spec = Array.isArray(c) ? { probes: c } : c && typeof c === 'object' ? c : null;
    const ids = spec && Array.isArray(spec.probes) ? spec.probes : [0, 1];
    const color = scene.color(spec && spec.color ? spec.color : 'gray');
    const pv = scene.probeValues || [];
    const A = pv[ids[0]], B = pv[ids[1]];
    const num = (o) => (o && o.ys.length === 1 && typeof o.ys[0] === 'number' ? o.ys[0] : null);
    const ya = num(A), yb = num(B);
    if (!A || !B || ya === null || yb === null || typeof A.x !== 'number' || typeof B.x !== 'number') return { tex: null, color };
    const name = (o) => (typeof o.at === 'string' ? o.at.replace(/\*/g, '') : niceNumber(o.x));
    const fx = (o) => `${fnTeX(o.map.name)}\\left(${name(o)}\\right)`;
    const close = (u, v) => Math.abs(u - v) <= 1e-9 * Math.max(1, Math.abs(u), Math.abs(v));
    if (spec && spec.mode === 'parity') {
        // Probe 0 at p, probe 1 at -p
        if (close(yb, ya)) return { tex: `${fx(B)} = ${fx(A)}`, color };
        if (close(yb, -ya)) return { tex: `${fx(B)} = -${fx(A)}`, color };
        return { tex: `${fx(B)} \\ne \\pm ${fx(A)}`, color };
    }
    if (close(A.x, B.x)) return { tex: `${name(A)} = ${name(B)}`, color };
    const [L, R, yl, yr] = A.x < B.x ? [A, B, ya, yb] : [B, A, yb, ya];
    const rel = close(yl, yr) ? '=' : yl < yr ? '<' : '>';
    const note = rel === '<' ? '\\text{ordine conservato}' : rel === '>' ? '\\text{ordine invertito}' : '';
    return { tex: `${name(L)} < ${name(R)} \\Rightarrow ${fx(L)} ${rel} ${fx(R)}${note ? `\\quad ${note}` : ''}`, color };
}

function paramScaleOf(cfg, name) {
    const def = cfg.params && cfg.params[name];
    return def && def.unit === 'deg' ? Math.PI / 180 : 1;
}

/** The integer of a set nearest to q, in its window. */
function snapInt(set, q) {
    const r = set.intRule, w = set.ownWindow || set.window;
    const lo = Math.max(r.lo, w[0]), hi = Math.min(r.hi, w[1]);
    let n = r.offset + r.step * Math.round((q - r.offset) / r.step);
    while (n < lo - 1e-9) n += r.step;
    while (n > hi + 1e-9) n -= r.step;
    return n || 0;
}

/** Nearest point of the drawn part of a set. */
function clampToSet(set, q) {
    if (set.intLine) return snapInt(set, q);
    if (set.kind === 'interval') {
        const lo = isFinite(set.I.lo) ? set.I.lo : set.window[0], hi = isFinite(set.I.hi) ? set.I.hi : set.window[1];
        return Math.min(hi, Math.max(lo, q));
    }
    if (set.kind === 'rect') return q.map((v, i) => Math.min(set.windows[i][1], Math.max(set.windows[i][0], v)));
    const { cx, cy, r } = set.disk;
    const d = Math.hypot(q[0] - cx, q[1] - cy);
    return d <= r ? q : [cx + (q[0] - cx) * r / d, cy + (q[1] - cy) * r / d];
}
