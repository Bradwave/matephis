/**
 * Annotations: vectors, frames, decomposition, angles, dimensions, labels,
 * centre of mass and paths.
 *
 * Vectors carry physical magnitudes (N, m/s, …); the resolver turns them into
 * lengths with one scale per kind ("auto": the largest of a kind spans just
 * over a quarter of the view), so forces in one figure stay comparable.
 */
import { add, sub, scale, len, dot, norm, angleOf, fromAngle, perp, lerp, dist, wrapAngle } from '../core/vec.js';
import { pointAlong, polylineLength } from '../core/geometry.js';
import { arrow, polyline, anchorFor, colorStyle } from '../core/draw.js';
import { formatNumber } from '../../matephis-plot-src/parser/expression-parser.js';
import { argNum, labelSymbol, massOf } from './shared.js';
import { normalizeLabel } from '../core/labels.js';
import { resolveAutoForce } from './autoforces.js';

export const VECTOR_KINDS = ['force', 'velocity', 'acceleration', 'momentum', 'vector'];

const UNITS = { force: 'N', velocity: 'm/s', acceleration: 'm/s²', momentum: 'kg·m/s', vector: '' };
const HEADS = { force: 'filled', velocity: 'open', acceleration: 'double', momentum: 'filled', vector: 'filled' };

/** "17.3 N" */
function valueText(mag, obj, kind, r) {
    const digits = obj.digits !== undefined ? r.num(obj.digits, 'digits') : 1;
    const unit = obj.unit !== undefined ? obj.unit : UNITS[kind];
    return `${formatNumber(mag, digits)}${unit ? ` ${unit}` : ''}`;
}

/** Label next to a vector: "$\vec F$", "$\vec F$ = 17.3 N" or "17.3 N". */
function vectorLabel(label, value) {
    // The label is math, the value is text: "$\vec F$ = 17.3 N"
    if (label && value) return `${normalizeLabel(label)} = ${value}`;
    return label || value || null;
}

/**
 * Draws a vector of physical components `v` from world point `p`, at `k`
 * metres per unit. `tail: "tip"` ends the arrow at p (a push).
 */
export function drawVector(ctx, p, v, k, opts, g) {
    const w = scale(v, k);
    const from = opts.tail === 'tip' ? sub(p, w) : p;
    const to = opts.tail === 'tip' ? p : add(p, w);
    const s0 = ctx.map(from), s1 = ctx.map(to);
    if (!opts.label) {
        arrow(ctx, s0, s1, opts, g);
        return;
    }
    const a = angleOf(v);
    const off = Array.isArray(opts.labelOffset) ? opts.labelOffset : [0, 0];
    if (off[0] || off[1] || opts.labelAt === 'tip') {
        // Explicit placement: just past the tip, shifted by labelOffset (px, y up)
        arrow(ctx, s0, s1, opts, g);
        ctx.text(s1.x + Math.cos(a) * 8 + off[0], s1.y - Math.sin(a) * 8 - off[1], opts.label, { ...anchorFor(a), color: opts.color, parent: g });
        return;
    }
    // Candidates: past the tip, beside the tip on either side, beside the shaft.
    // Near-vertical arrows try the sides first: past the tip is usually a rope or a string.
    const n = perp(norm(v));
    const side = Math.abs(n.x) > 0.3 ? (n.x > 0 ? 1 : -1) : (n.y > 0 ? 1 : -1);
    const nA = { x: n.x * side, y: n.y * side }, nB = { x: -nA.x, y: -nA.y };
    const tipBack = { x: s1.x - Math.cos(a) * 10, y: s1.y + Math.sin(a) * 10 };
    const at = (p, d, dist) => ({ x: p.x + d.x * dist, y: p.y - d.y * dist, ...anchorFor(angleOf(d)) });
    const mid = { x: (s0.x + s1.x) / 2, y: (s0.y + s1.y) / 2 };
    const ahead = { x: s1.x + Math.cos(a) * 8, y: s1.y - Math.sin(a) * 8, ...anchorFor(a) };
    const sides = [at(tipBack, nA, 10), at(tipBack, nB, 10)];
    const vertical = Math.abs(Math.cos(a)) < 0.4;
    const candidates = opts.labelAt === 'middle'
        ? [at(mid, nA, 10), at(mid, nB, 10), ahead]
        : [...(vertical ? [...sides, ahead] : [ahead, ...sides]), at(mid, nA, 10), at(mid, nB, 10),
            // Further out, for arrows running along a spring or a rope
            at(tipBack, nA, 24), at(tipBack, nB, 24), { ...ahead, x: ahead.x + Math.cos(a) * 14, y: ahead.y - Math.sin(a) * 14 }];
    // Drawn first (so the label is on top) but registered after its own label,
    // which may sit next to it
    arrow(ctx, s0, s1, { ...opts, noObstacle: true }, g);
    ctx.placeText(opts.label, candidates, { color: opts.color, parent: g });
    ctx.obstacle(s0, s1);
}

function vectorType(kind) {
    return {
        keys: ['on', 'dir', 'mag', 'vec', 'scale', 'showValue', 'unit', 'digits', 'tail', 'width', 'decompose', 'labelAt', 'by'],
        layer: 'annotations',
        anchorNames: ['tail', 'tip'],
        resolve(obj, r) {
            const where = `${kind}${obj.id ? ` '${obj.id}'` : ''}`;
            const owner = obj.on !== undefined ? r.state(obj.on) : null;
            if (obj.on !== undefined && !owner) {
                if (!r.objectById(obj.on)) r.warn(`${where}: no object with id '${obj.on}'`);
                return null;
            }
            const p = obj.at !== undefined ? r.point(obj.at, `${where} at`) : owner ? (owner.com || owner.pos) : null;
            if (!p) {
                if (obj.at === undefined) r.warn(`${where}: needs 'on' (a body) or 'at' (a point)`);
                return null;
            }
            let v;
            if (obj.__auto && obj.vec === undefined && obj.dir === undefined) {
                // Automatic force: geometry from the connection; "mag" and "at" may override it
                const a = resolveAutoForce(obj, r);
                if (!a) return null;
                let vec = a.vec;
                if (obj.mag !== undefined) vec = scale(norm(vec), r.num(obj.mag, `${where} mag`));
                const pos = obj.at !== undefined ? r.point(obj.at, `${where} at`) : a.pos;
                if (!pos || !isFinite(vec.x) || !isFinite(vec.y)) return null;
                return { pos, vec, mag: len(vec), kind, frame: owner && owner.frame ? owner.frame : null };
            }
            if (obj.vec !== undefined) {
                if (!Array.isArray(obj.vec)) { r.warn(`${where}: 'vec' must be [vx, vy]`); return null; }
                v = { x: r.num(obj.vec[0], `${where} vec`), y: r.num(obj.vec[1], `${where} vec`), z: 0 };
            } else {
                if (obj.dir === undefined) { r.warn(`${where}: needs 'dir' and 'mag', or 'vec'`); return null; }
                const d = r.dir(obj.dir, owner, p, `${where} dir`);
                const m = obj.mag !== undefined ? r.num(obj.mag, `${where} mag`) : 1;
                if (!d) return null;
                v = scale(d, m);
            }
            if (!isFinite(v.x) || !isFinite(v.y)) return null;
            return { pos: p, vec: v, mag: len(v), kind, frame: owner && owner.frame ? owner.frame : null };
        },
        anchor(st, name, arg, r, obj) {
            const k = obj.scale !== undefined ? r.num(obj.scale, 'scale') : r.scales[kind];
            if (name === 'tail') return obj.tail === 'tip' ? sub(st.pos, scale(st.vec, k)) : st.pos;
            if (name === 'tip') return obj.tail === 'tip' ? st.pos : add(st.pos, scale(st.vec, k));
            return null;
        },
        render(obj, st, ctx, g) {
            const r = ctx.r;
            if (st.mag < 1e-9) return;
            const k = obj.scale !== undefined ? r.num(obj.scale, 'scale') : r.scales[kind];
            const pair = r.pairIndex ? r.pairIndex.get(obj) : undefined;
            const color = obj.color ? ctx.color(obj.color) : pair !== undefined ? ctx.pairColor(pair) : ctx.kindColor(kind);
            const value = obj.showValue ? valueText(st.mag, obj, kind, r) : null;
            const off = ctx.vectorOffset ? ctx.vectorOffset(obj) : 0;
            const pos = off ? add(st.pos, scale(perp(norm(st.vec)), off / ctx.pxPerMetre)) : st.pos;
            drawVector(ctx, pos, st.vec, k, {
                color, head: HEADS[kind], tail: obj.tail,
                width: obj.width !== undefined ? r.num(obj.width, 'width') : kind === 'momentum' ? 3 : 2,
                dash: obj.dash, opacity: r.faded.has(obj) ? 0.35 : undefined,
                label: vectorLabel(obj.label, value), labelAt: obj.labelAt, labelOffset: obj.labelOffset,
            }, g);
        },
    };
}

/** A reference frame drawn as two short axes. `of` copies another object's frame. */
const frame = {
    keys: ['origin', 'of', 'labels', 'length'],
    layer: 'annotations',
    anchorNames: ['origin'],
    resolve(obj, r) {
        const origin = obj.origin !== undefined ? r.point(obj.origin, 'frame origin') : obj.at !== undefined ? r.point(obj.at, 'frame at') : null;
        if (!origin) {
            r.warn(`frame${obj.id ? ` '${obj.id}'` : ''}: needs 'origin'`);
            return null;
        }
        let t;
        if (obj.of !== undefined) {
            const f = r.frame(obj.of, origin, 'frame of');
            if (!f) return null;
            t = f.t;
        } else {
            t = fromAngle(obj.angle !== undefined ? r.angle(obj.angle, 'frame angle') : 0);
        }
        const labels = Array.isArray(obj.labels) ? obj.labels : ["x'", "y'"];
        return { pos: origin, angle: angleOf(t), frame: { t, n: perp(t), labels } };
    },
    anchor(st, name) {
        return name === 'origin' ? st.pos : null;
    },
    render(obj, st, ctx, g) {
        if (obj.show === false) return;
        const v = ctx.r.view;
        const L = obj.length !== undefined ? ctx.r.num(obj.length, 'frame length') : 0.16 * Math.min(v.xMax - v.xMin, v.yMax - v.yMin);
        const color = obj.color ? ctx.color(obj.color) : ctx.ink;
        const o = ctx.map(st.pos);
        [st.frame.t, st.frame.n].forEach((axis, i) => {
            const tip = ctx.map(add(st.pos, scale(axis, L)));
            arrow(ctx, o, tip, { color, width: 1.3, head: 'filled' }, g);
            const label = st.frame.labels[i];
            if (label) {
                const a = angleOf(axis);
                ctx.text(tip.x + Math.cos(a) * 6, tip.y - Math.sin(a) * 6, label, { ...anchorFor(a), color, parent: g });
            }
        });
    },
};

/**
 * Components of a vector along a frame's axes (default: the world axes).
 * Components are dashed vectors from the same point; "projection" draws thin
 * lines from the tip to each component, "tip-to-tail" chains them.
 */
const decompose = {
    keys: ['vector', 'frame', 'style', 'labels', 'showAngle', 'angleLabel', 'fadeOriginal', 'showValue', 'showAxes', 'signed', 'digits', 'unit'],
    layer: 'annotations',
    anchorNames: [],
    resolve(obj, r) {
        const where = `decompose${obj.vector ? ` '${obj.vector}'` : ''}`;
        const parent = r.objectById(obj.vector);
        if (!parent || !VECTOR_KINDS.includes(parent.type)) {
            r.warn(`${where}: 'vector' must be the id of a force or vector`);
            return null;
        }
        const ps = r.state(obj.vector);
        if (!ps) return null;
        const f = r.frame(obj.frame !== undefined ? obj.frame : 'xy', ps.pos, `${where} frame`);
        if (!f) return null;
        if (obj.fadeOriginal) r.faded.add(parent);
        const c1 = dot(ps.vec, f.t), c2 = dot(ps.vec, f.n);
        return {
            pos: ps.pos, parent, parentState: ps, frame: f,
            comps: [{ vec: scale(f.t, c1), value: c1, axis: f.t }, { vec: scale(f.n, c2), value: c2, axis: f.n }],
        };
    },
    render(obj, st, ctx, g) {
        const r = ctx.r;
        const { parent, parentState: ps } = st;
        const kind = ps.kind;
        const k = parent.scale !== undefined ? r.num(parent.scale, 'scale') : r.scales[kind];
        const color = obj.color ? ctx.color(obj.color) : parent.color ? ctx.color(parent.color) : ctx.kindColor(kind);
        const eps = 1e-9 * Math.max(1, ps.mag);
        const P = st.pos;
        const tip = add(P, scale(ps.vec, k));
        const style = obj.style || 'projection';

        if (obj.showAxes) {
            const L = Math.max(ps.mag * k * 1.25, 0.5);
            [st.frame.t, st.frame.n].forEach((axis, i) => {
                polyline(ctx, [sub(P, scale(axis, L)), add(P, scale(axis, L))], { class: 'mp-ink', 'stroke-width': 0.9, 'stroke-dasharray': '2 4', opacity: 0.7 }, g);
                const end = ctx.map(add(P, scale(axis, L)));
                const a = angleOf(axis);
                if (st.frame.labels[i]) ctx.text(end.x + Math.cos(a) * 6, end.y - Math.sin(a) * 6, axisLabel(st.frame.labels[i]), { ...anchorFor(a), color: ctx.ink, size: 13, parent: g });
            });
        }

        const sym = labelSymbol(parent.label);
        const labels = Array.isArray(obj.labels) ? obj.labels
            : sym ? st.frame.labels.map(ax => `$\\vec{${sym}}_{${ax}}$`) : [null, null];

        let start = P;
        st.comps.forEach((c, i) => {
            if (Math.abs(c.value) <= eps) return;
            const value = obj.showValue ? `${obj.signed ? formatNumber(c.value, obj.digits ?? 1) : formatNumber(Math.abs(c.value), obj.digits ?? 1)}${(obj.unit ?? UNITS[kind]) ? ` ${obj.unit ?? UNITS[kind]}` : ''}` : null;
            const from = style === 'tip-to-tail' ? start : P;
            drawVector(ctx, from, c.vec, k, {
                color, head: HEADS[kind], width: 1.8, dash: '6 4', opacity: 0.95,
                label: vectorLabel(labels[i], value),
            }, g);
            if (style !== 'tip-to-tail') {
                polyline(ctx, [tip, add(P, scale(c.vec, k))], { fill: 'none', stroke: color, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.6 }, g);
            }
            start = add(start, scale(c.vec, k));
        });

        if (obj.showAngle) {
            // Angle between the vector and one component's direction: "x", "y", or the closer one
            const pick = obj.showAngle === 'x' ? 0 : obj.showAngle === 'y' ? 1
                : (Math.abs(st.comps[0].value) >= Math.abs(st.comps[1].value) ? 0 : 1);
            const c = st.comps[pick];
            if (Math.abs(c.value) > eps && ps.mag > eps) {
                const a1 = angleOf(c.vec), a2 = angleOf(ps.vec);
                const spec = wrapAngle(a2 - a1) >= 0 ? { vertex: P, a1, a2 } : { vertex: P, a1: a2, a2: a1 };
                ctx.angleMark(spec, { label: obj.angleLabel, showValue: obj.angleLabel === undefined, radius: 30, color: ctx.ink }, g);
            }
        }
    },
};

/** "\parallel" -> "$\parallel$" for axis labels written as TeX commands. */
function axisLabel(s) {
    return s.startsWith('\\') ? `$${s}$` : s;
}

/**
 * Angle mark. Vertex and sides from:
 *   "of": <object>             an object's own angle (slope inclination, pendulum swing)
 *   "points": [A, V, B]        the angle AVB
 *   "at" + "from" + "to"       a vertex and two directions (direction specs)
 * The smaller of the two angles is marked unless "reflex": true.
 */
const angle = {
    keys: ['of', 'points', 'from', 'to', 'radius', 'showValue', 'reflex', 'digits'],
    layer: 'annotations',
    anchorNames: ['vertex'],
    resolve(obj, r) {
        let spec = null;
        if (obj.of !== undefined) {
            const st = r.state(obj.of);
            if (!r.objectById(obj.of)) { r.warn(`angle: no object with id '${obj.of}'`); return null; }
            if (!st || !st.angleSpec) { r.warn(`angle: '${obj.of}' has no angle to mark`); return null; }
            spec = { ...st.angleSpec };
        } else if (Array.isArray(obj.points) && obj.points.length === 3) {
            const [A, V, B] = obj.points.map((p, i) => r.point(p, `angle points[${i}]`));
            if (!A || !V || !B) return null;
            spec = { vertex: V, a1: angleOf(sub(A, V)), a2: angleOf(sub(B, V)) };
        } else {
            const V = r.point(obj.at, 'angle at');
            if (!V) return null;
            const d1 = r.dir(obj.from !== undefined ? obj.from : 'right', null, V, 'angle from');
            const d2 = r.dir(obj.to, null, V, 'angle to');
            if (!d1 || !d2) return null;
            spec = { vertex: V, a1: angleOf(d1), a2: angleOf(d2) };
        }
        let sweep = wrapAngle(spec.a2 - spec.a1);
        if ((sweep < 0) !== !!obj.reflex) { const t = spec.a1; spec.a1 = spec.a2; spec.a2 = t; }
        sweep = ((spec.a2 - spec.a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        return { pos: spec.vertex, spec, value: sweep };
    },
    anchor(st, name) {
        return name === 'vertex' ? st.pos : null;
    },
    render(obj, st, ctx, g) {
        ctx.angleMark(st.spec, {
            label: obj.label,
            showValue: obj.showValue === true || (obj.label === undefined && obj.showValue !== false),
            radius: obj.radius !== undefined ? ctx.r.num(obj.radius, 'angle radius') : 30,
            color: obj.color ? ctx.color(obj.color) : ctx.ink,
            digits: obj.digits,
        }, g);
    },
};

/** Dimension line between two points, offset to one side, with its length. */
const dimension = {
    keys: ['from', 'to', 'offset', 'digits', 'unit'],
    layer: 'annotations',
    anchorNames: ['start', 'end', 'center'],
    resolve(obj, r) {
        const a = r.point(obj.from, 'dimension from'), b = r.point(obj.to, 'dimension to');
        if (!a || !b || dist(a, b) < 1e-12) return null;
        const off = obj.offset !== undefined ? r.num(obj.offset, 'dimension offset') : 0.35;
        const n = perp(norm(sub(b, a)));
        return { pos: lerp(a, b, 0.5), a, b, n, off, value: dist(a, b) };
    },
    anchor(st, name) {
        return name === 'start' ? st.a : name === 'end' ? st.b : name === 'center' ? st.pos : null;
    },
    render(obj, st, ctx, g) {
        const color = obj.color ? ctx.color(obj.color) : ctx.ink;
        const o = scale(st.n, st.off);
        const extra = scale(norm(o), 0.08 * Math.sign(st.off || 1));
        const A = add(st.a, o), B = add(st.b, o);
        [[st.a, A], [st.b, B]].forEach(([p, q]) => polyline(ctx, [p, add(q, extra)], { stroke: color, 'stroke-width': 0.9, opacity: 0.7 }, g));
        const sA = ctx.map(A), sB = ctx.map(B);
        const mid = { x: (sA.x + sB.x) / 2, y: (sA.y + sB.y) / 2 };
        arrow(ctx, mid, sA, { color, width: 1, head: 'filled' }, g);
        arrow(ctx, mid, sB, { color, width: 1, head: 'filled' }, g);
        const digits = obj.digits !== undefined ? ctx.r.num(obj.digits, 'digits') : 2;
        const text = obj.label !== undefined ? obj.label : `${formatNumber(st.value, digits)} ${obj.unit !== undefined ? obj.unit : 'm'}`.trim();
        const side = norm(o.x || o.y ? o : st.n);
        const a = angleOf(side);
        ctx.text(mid.x + Math.cos(a) * 8, mid.y - Math.sin(a) * 8, text, { ...anchorFor(a), color, size: 14, parent: g });
    },
};

/** Text at a point. */
const ANCHORS = { left: 'start', start: 'start', center: 'middle', middle: 'middle', right: 'end', end: 'end' };
const label = {
    keys: ['text', 'anchor', 'size', 'weight'],
    layer: 'annotations',
    anchorNames: [],
    resolve(obj, r) {
        const p = r.point(obj.at, 'label at');
        return p ? { pos: p } : null;
    },
    render(obj, st, ctx, g) {
        const text = obj.text !== undefined ? obj.text : obj.label;
        if (text === undefined) { ctx.r.warn(`label${obj.id ? ` '${obj.id}'` : ''} has no 'text'`); return; }
        const c = ctx.map(st.pos);
        const off = Array.isArray(obj.labelOffset) ? obj.labelOffset : [0, 0];
        ctx.text(c.x + off[0], c.y - off[1], String(text), {
            anchor: ANCHORS[obj.anchor] || 'middle', baseline: 'middle',
            color: obj.color ? ctx.color(obj.color) : ctx.ink,
            size: obj.size !== undefined ? ctx.r.num(obj.size, 'size') : undefined, weight: obj.weight, parent: g,
        });
    },
};

/** Centre of mass of one body or of several (weighted by `mass`). */
const com = {
    keys: ['of'],
    layer: 'annotations',
    anchorNames: [],
    resolve(obj, r) {
        const ids = Array.isArray(obj.of) ? obj.of : [obj.of];
        let m = 0, x = 0, y = 0;
        for (const id of ids) {
            const st = r.state(id), o = r.objectById(id);
            if (!st || !o) { r.warn(`com: no body with id '${id}'`); return null; }
            const mi = massOf(o, r), p = st.com || st.pos;
            m += mi; x += mi * p.x; y += mi * p.y;
        }
        return m > 0 ? { pos: { x: x / m, y: y / m, z: 0 } } : null;
    },
    render(obj, st, ctx, g) {
        const c = ctx.map(st.pos), R = 6;
        const ink = obj.color ? ctx.color(obj.color) : ctx.ink;
        ctx.svg('circle', { cx: c.x, cy: c.y, r: R, fill: 'none', stroke: ink, 'stroke-width': 1.3 }, g);
        ctx.svg('path', { d: `M${c.x} ${c.y}L${c.x + R} ${c.y}A${R} ${R} 0 0 0 ${c.x} ${c.y - R}ZM${c.x} ${c.y}L${c.x - R} ${c.y}A${R} ${R} 0 0 0 ${c.x} ${c.y + R}Z`, fill: ink }, g);
        if (obj.label) {
            const d = 9;
            ctx.placeText(obj.label, [
                { x: c.x + d, y: c.y - d, anchor: 'start', baseline: 'auto' }, { x: c.x - d, y: c.y - d, anchor: 'end', baseline: 'auto' },
                { x: c.x + d, y: c.y + d, anchor: 'start', baseline: 'hanging' }, { x: c.x - d, y: c.y + d, anchor: 'end', baseline: 'hanging' },
            ], { color: ink, parent: g });
        }
    },
};

/**
 * Path (drawing; later also a track to follow):
 *   "points": [[x, y], ...]
 *   "arc": { "center", "radius", "from", "to" }   angles follow angleUnit
 *   "parametric": { "x": "...", "y": "...", "t": [t0, t1] }
 */
const path = {
    keys: ['points', 'arc', 'parametric', 'samples', 'arrow', 'width'],
    layer: 'connections',
    anchorNames: ['start', 'end', 'point(u)'],
    resolve(obj, r) {
        let pts = null;
        if (Array.isArray(obj.points)) {
            pts = obj.points.map((p, i) => r.point(p, `path points[${i}]`));
            if (pts.some(p => !p)) return null;
        } else if (obj.arc && typeof obj.arc === 'object') {
            const c = r.point(obj.arc.center, 'path arc center');
            const R = r.num(obj.arc.radius, 'path arc radius');
            const a0 = obj.arc.from !== undefined ? r.angle(obj.arc.from, 'path arc from') : 0;
            const a1 = obj.arc.to !== undefined ? r.angle(obj.arc.to, 'path arc to') : 2 * Math.PI;
            if (!c || !(R > 0)) return null;
            const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) / (Math.PI / 60)));
            pts = Array.from({ length: n + 1 }, (_, i) => add(c, fromAngle(a0 + (a1 - a0) * i / n, R)));
        } else if (obj.parametric && typeof obj.parametric === 'object') {
            const pm = obj.parametric;
            const t = Array.isArray(pm.t) ? pm.t.map(v => r.num(v, 'path t')) : [0, 1];
            const n = obj.samples !== undefined ? r.num(obj.samples, 'path samples') : 200;
            try {
                const fx = r.compiler.fn(String(pm.x), ['t'], { exclude: 't' }), fy = r.compiler.fn(String(pm.y), ['t'], { exclude: 't' });
                pts = Array.from({ length: n + 1 }, (_, i) => {
                    const tt = t[0] + (t[1] - t[0]) * i / n;
                    return { x: fx(tt), y: fy(tt), z: 0 };
                }).filter(p => isFinite(p.x) && isFinite(p.y));
            } catch (e) {
                r.warn(`path parametric: ${e.message}`);
                return null;
            }
        } else {
            r.warn(`path${obj.id ? ` '${obj.id}'` : ''}: needs 'points', 'arc' or 'parametric'`);
            return null;
        }
        if (pts.length < 2) return null;
        return { pos: pts[0], points: pts, length: polylineLength(pts) };
    },
    anchor(st, name, arg, r) {
        if (name === 'start') return st.points[0];
        if (name === 'end') return st.points[st.points.length - 1];
        if (name === 'point') {
            const u = argNum(arg, r, 'point(u)');
            return isFinite(u) ? pointAlong(st.points, u).point : null;
        }
        return null;
    },
    render(obj, st, ctx, g) {
        const color = obj.color ? ctx.color(obj.color) : null;
        const width = obj.width !== undefined ? ctx.r.num(obj.width, 'width') : 1.6;
        polyline(ctx, st.points, { fill: 'none', class: color ? undefined : 'mp-ink', stroke: color || undefined, 'stroke-width': width, 'stroke-dasharray': obj.dash, 'stroke-linejoin': 'round', style: colorStyle(color) }, g);
        if (obj.arrow) {
            const n = st.points.length;
            const end = ctx.map(st.points[n - 1]), before = ctx.map(st.points[Math.max(0, n - 3)]);
            arrow(ctx, before, end, { color: color || ctx.ink, width, head: 'filled' }, g);
        }
    },
};

/** Vectors of a kind acting on a body (hand-written and automatic). */
function vectorsOn(r, body, kind) {
    return r.objects.filter(o => o.on === body && o.type === kind);
}

/**
 * Resultant of the vectors of one kind on a body (default: forces), from its
 * centre of mass. "construction": "tip-to-tail" chains the vectors that add up
 * to it. A zero resultant prints "= 0" next to the body (equilibrium).
 */
const resultant = {
    keys: ['on', 'kind', 'construction', 'showValue', 'digits', 'unit', 'width'],
    layer: 'annotations',
    anchorNames: ['tip'],
    resolve(obj, r) {
        const kind = obj.kind || 'force';
        const body = r.state(obj.on);
        if (!body) {
            r.warn(`resultant: 'on' must be the id of a body`);
            return null;
        }
        const parts = vectorsOn(r, obj.on, kind).map(o => ({ obj: o, st: r.stateOf(o) })).filter(p => p.st);
        const vec = parts.reduce((s, p) => add(s, p.st.vec), { x: 0, y: 0, z: 0 });
        const pos = obj.at !== undefined ? r.point(obj.at, 'resultant at') : (body.com || body.pos);
        if (!pos) return null;
        return { pos, vec, mag: len(vec), kind, parts, isResultant: true };
    },
    anchor(st, name, arg, r) {
        return name === 'tip' ? add(st.pos, scale(st.vec, r.scales[st.kind])) : null;
    },
    render(obj, st, ctx, g) {
        const r = ctx.r;
        const k = r.scales[st.kind];
        const color = obj.color ? ctx.color(obj.color) : ctx.ink;
        const label = obj.label !== undefined ? obj.label : '\\vec R';
        const eps = 1e-9 * Math.max(1, ...st.parts.map(p => p.st.mag));
        if (st.mag <= eps) {
            const c = ctx.map(st.pos);
            ctx.placeText(`${normalizeLabel(label)} = 0`, [
                { x: c.x + 14, y: c.y - 14, anchor: 'start', baseline: 'auto' }, { x: c.x - 14, y: c.y - 14, anchor: 'end', baseline: 'auto' },
                { x: c.x + 14, y: c.y + 14, anchor: 'start', baseline: 'hanging' },
            ], { color, parent: g });
            return;
        }
        if (obj.construction === 'tip-to-tail') {
            let start = st.pos;
            st.parts.forEach(p => {
                if (p.st.mag <= eps) return;
                const end = add(start, scale(p.st.vec, k));
                arrow(ctx, ctx.map(start), ctx.map(end), { color: ctx.kindColor(st.kind), width: 1.2, dash: '4 3', opacity: 0.55 }, g);
                start = end;
            });
        }
        const value = obj.showValue ? valueText(st.mag, obj, st.kind, r) : null;
        drawVector(ctx, st.pos, st.vec, k, {
            color, head: HEADS[st.kind], width: obj.width !== undefined ? r.num(obj.width, 'width') : 2.6,
            label: vectorLabel(label, value),
        }, g);
    },
};

/**
 * Action–reaction pairs between two bodies: forces on A exerted by B and on B
 * exerted by A get matching colours. The source of a force is its "by" key, or
 * for automatic forces the surface or body it comes from.
 */
const pairs = {
    keys: ['between'],
    layer: 'annotations',
    anchorNames: [],
    resolve(obj, r) {
        const [a, b] = Array.isArray(obj.between) ? obj.between : [];
        if (!r.objectById(a) || !r.objectById(b)) {
            r.warn(`pairs: 'between' must list two body ids`);
            return null;
        }
        const on = (body, from) => r.objects.filter(o => VECTOR_KINDS.includes(o.type) && o.on === body && sourceOf(o, r) === from);
        const ab = on(a, b), ba = on(b, a);
        if (!r.pairIndex) r.pairIndex = new Map();
        const n = Math.min(ab.length, ba.length);
        for (let i = 0; i < n; i++) {
            const idx = r.pairIndex.size / 2;
            r.pairIndex.set(ab[i], idx);
            r.pairIndex.set(ba[i], idx);
        }
        if (!n) r.warn(`pairs: no forces between '${a}' and '${b}' (set "by" on hand-written forces)`);
        return { pos: { x: 0, y: 0, z: 0 }, count: n };
    },
    render() {},
};

/** Who exerts a force: "by", or the surface / body an automatic force comes from. */
function sourceOf(o, r) {
    if (o.by !== undefined) return o.by;
    const a = o.__auto;
    if (!a) return null;
    if (a.kind === 'reaction') return a.from;
    if (a.kind === 'normal' || a.kind === 'friction') {
        const body = r.objectById(o.on);
        return body ? body.on : null;
    }
    return null;
}

/**
 * Free-body diagram: the body alone, in a panel under the scene, with the
 * forces acting on it. As a point (default) all forces start from it; with
 * "shape": true the body's outline is drawn and forces keep their points.
 * "forces": "all" includes forces hidden in the scene; "button" (true or a
 * text) adds a button that shows and hides the panel, which starts hidden.
 */
const fbd = {
    keys: ['of', 'shape', 'size', 'kind', 'forces', 'button'],
    layer: 'annotations',
    anchorNames: [],
    panel: true,
    resolve(obj, r) {
        const body = r.state(obj.of);
        if (!body) {
            r.warn(`fbd: 'of' must be the id of a body`);
            return null;
        }
        const kinds = obj.kind ? [obj.kind] : ['force'];
        const forces = r.objects.filter(o => kinds.includes(o.type) && o.on === obj.of);
        forces.forEach(o => r.stateOf(o));
        return { pos: body.com || body.pos, body, bodyObj: r.objectById(obj.of), forces };
    },
    render() {},
};

export const ANNOTATION_TYPES = {
    ...Object.fromEntries(VECTOR_KINDS.map(k => [k, vectorType(k)])),
    frame, decompose, angle, dimension, label, com, path, resultant, pairs, fbd,
};
