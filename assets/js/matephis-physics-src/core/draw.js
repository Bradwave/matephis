/**
 * SVG drawing helpers for object types.
 *
 * World points go through ctx.map(); angles are world angles (counter-clockwise,
 * y up) unless a name says "screen". Base colours come from CSS classes
 * (mp-ink, mp-body, mp-surface, mp-hatch) so light and dark themes work without
 * redrawing; a user colour is applied as an inline style, which wins over them.
 */
import { sub, norm, len, perp } from './vec.js';

/** Inline style for an explicit stroke/fill colour, or undefined. */
export function colorStyle(color, { stroke = true, fill = false } = {}) {
    if (!color) return undefined;
    const parts = [];
    if (stroke) parts.push(`stroke: ${color}`);
    if (fill) parts.push(`fill: ${color}`);
    return parts.join('; ');
}

/** Path through world points. */
export function polyline(ctx, pts, attrs, g, close = false) {
    const d = pts.map((p, i) => {
        const s = ctx.map(p);
        return `${i ? 'L' : 'M'}${s.x.toFixed(2)} ${s.y.toFixed(2)}`;
    }).join('') + (close ? 'Z' : '');
    return ctx.svg('path', { d, ...attrs }, g);
}

/**
 * Hatching on the material side of a segment a→b (world), as on textbook
 * drawings of fixed surfaces. `inward` is the unit normal (world) pointing into the material.
 */
export function hatch(ctx, a, b, inward, g, { spacing = 9, size = 9 } = {}) {
    const sa = ctx.map(a), sb = ctx.map(b);
    const d = { x: sb.x - sa.x, y: sb.y - sa.y };
    const L = Math.hypot(d.x, d.y);
    if (L < 1) return;
    const u = { x: d.x / L, y: d.y / L };
    // Inward normal in screen space (y flipped)
    const ni = { x: inward.x, y: -inward.y };
    // Strokes go into the material at 45°, leaning back along the segment
    const sx = (ni.x - u.x) * Math.SQRT1_2 * size, sy = (ni.y - u.y) * Math.SQRT1_2 * size;
    let dd = '';
    for (let s = spacing / 2; s <= L; s += spacing) {
        const x = sa.x + u.x * s, y = sa.y + u.y * s;
        dd += `M${x.toFixed(2)} ${y.toFixed(2)}l${sx.toFixed(2)} ${sy.toFixed(2)}`;
    }
    ctx.svg('path', { d: dd, class: 'mp-hatch', 'stroke-width': 1 }, g);
}

/**
 * Arrow between two screen points.
 * @param {object} opts
 * @param {string} opts.color
 * @param {number} [opts.width=2]
 * @param {"filled"|"open"|"double"} [opts.head="filled"]
 * @param {string} [opts.dash]
 * @param {number} [opts.opacity]
 * @param {boolean} [opts.noObstacle] - do not register the arrow for label placement
 */
export function arrow(ctx, s0, s1, opts = {}, g) {
    const { color, width = 2, head = 'filled', dash, opacity } = opts;
    const dx = s1.x - s0.x, dy = s1.y - s0.y;
    const L = Math.hypot(dx, dy);
    const grp = ctx.svg('g', opacity !== undefined ? { opacity } : {}, g);
    if (L < 0.5) return grp;
    const ux = dx / L, uy = dy / L;
    const hl = Math.min(8 + 2 * width, L * 0.6);
    const hw = hl * 0.42;
    // Shaft stops inside the head so its square end never pokes out of the tip
    const shaftEnd = head === 'open' ? L : L - hl * 0.7;
    ctx.svg('line', {
        x1: s0.x, y1: s0.y, x2: s0.x + ux * shaftEnd, y2: s0.y + uy * shaftEnd,
        stroke: color, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-linecap': head === 'open' ? 'round' : 'butt',
    }, grp);
    const headAt = (tipX, tipY) => {
        const bx = tipX - ux * hl, by = tipY - uy * hl;
        const p1 = `${(bx - uy * hw).toFixed(2)},${(by + ux * hw).toFixed(2)}`;
        const p2 = `${(bx + uy * hw).toFixed(2)},${(by - ux * hw).toFixed(2)}`;
        if (head === 'open') {
            ctx.svg('polyline', { points: `${p1} ${tipX.toFixed(2)},${tipY.toFixed(2)} ${p2}`, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp);
        } else {
            ctx.svg('polygon', { points: `${tipX.toFixed(2)},${tipY.toFixed(2)} ${p1} ${p2}`, fill: color, stroke: color, 'stroke-width': 1, 'stroke-linejoin': 'round' }, grp);
        }
    };
    headAt(s1.x, s1.y);
    if (head === 'double' && L > 2.2 * hl) headAt(s1.x - ux * hl * 0.9, s1.y - uy * hl * 0.9);
    if (ctx.obstacle && !opts.noObstacle) ctx.obstacle(s0, s1);
    return grp;
}

/** Screen point at world angle `a` and `r` pixels from screen point `c`. */
export const polar = (c, a, r) => ({ x: c.x + r * Math.cos(a), y: c.y - r * Math.sin(a) });

/**
 * Arc for an angle at screen vertex `c`, counter-clockwise (world) from a1 to a2,
 * or the right-angle square when the angle is 90°.
 * @returns {number} the bisector's world angle (for the label)
 */
export function angleArc(ctx, c, a1, a2, r, { color, width = 1.4, rightAngle = true, fill } = {}, g) {
    let sweep = ((a2 - a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const mid = a1 + sweep / 2;
    if (rightAngle && Math.abs(sweep - Math.PI / 2) < 1e-6) {
        const k = r * 0.55;
        const p1 = polar(c, a1, k), p3 = polar(c, a2, k);
        const p2 = { x: p1.x + p3.x - c.x, y: p1.y + p3.y - c.y };
        ctx.svg('path', { d: `M${p1.x} ${p1.y}L${p2.x} ${p2.y}L${p3.x} ${p3.y}`, fill: 'none', stroke: color, 'stroke-width': width }, g);
        ctx.svg('circle', { cx: c.x + (p2.x - c.x) * 0.45, cy: c.y + (p2.y - c.y) * 0.45, r: 1.4, fill: color }, g);
        return mid;
    }
    const p1 = polar(c, a1, r), p2 = polar(c, a2, r);
    const large = sweep > Math.PI ? 1 : 0;
    // Counter-clockwise in the world is counter-clockwise on screen: sweep-flag 0
    const d = `M${p1.x.toFixed(2)} ${p1.y.toFixed(2)}A${r} ${r} 0 ${large} 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    if (fill) ctx.svg('path', { d: `M${c.x} ${c.y}L${d.slice(1)}Z`, fill, stroke: 'none' }, g);
    ctx.svg('path', { d, fill: 'none', stroke: color, 'stroke-width': width }, g);
    return mid;
}

/**
 * Text anchor and baseline that keep a label clear of something pointing in
 * world direction `a` from the label position.
 */
export function anchorFor(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return {
        anchor: c > 0.38 ? 'start' : c < -0.38 ? 'end' : 'middle',
        baseline: s > 0.38 ? 'auto' : s < -0.38 ? 'hanging' : 'middle',
    };
}

/** Direction (screen) and length from world segment; used to orient strokes. */
export function screenDir(ctx, a, b) {
    const s = sub(ctx.map(b), ctx.map(a));
    return { u: norm(s), len: len(s), n: perp(norm(s)) };
}
