/**
 * Roads and cars.
 *
 *   { "id": "r", "type": "road", "width": 7, "lanes": 2, "mu": 0.8,
 *     "path": { "arc": { "center": [0, 0], "radius": 20 } } }
 *   { "id": "C", "type": "car", "follow": "r", "s": "v*t", "orient": "tangent", "offset": -1.75 }
 *
 * A road is a path with a width (the path keys can also sit on the road
 * itself): bodies follow it like a path, along its centre line ("offset"
 * moves them into a lane), and a car on it takes the road's "mu".
 * A car is drawn from above in a "plane": "horizontal" scene (size =
 * [length, width]) and from the side otherwise (size = [length, height],
 * on two wheels like a cart).
 */
import { add, sub, scale, norm, perp, fromLocal } from '../core/vec.js';
import { polyline } from '../core/draw.js';
import { pathGeometry, ANNOTATION_TYPES } from './annotations.js';
import { BODY_TYPES } from './bodies.js';
import { AUTO_KEYS } from './autoforces.js';
import { BOX_ANCHORS } from '../core/anchors.js';

/** A polyline moved sideways by d metres (positive: to the left of its direction). */
function offsetPolyline(points, d, closed) {
    const n = points.length;
    return points.map((p, i) => {
        const prev = i > 0 ? points[i - 1] : closed ? points[n - 2] : null;
        const next = i < n - 1 ? points[i + 1] : closed ? points[1] : null;
        const t = norm(add(prev ? norm(sub(p, prev)) : { x: 0, y: 0 }, next ? norm(sub(next, p)) : { x: 0, y: 0 }));
        return add(p, scale(perp(t), d));
    });
}

const road = {
    keys: ['path', 'points', 'arc', 'parametric', 'samples', 'width', 'lanes', 'mu'],
    layer: 'environment',
    anchorNames: ['start', 'end', 'point(u)'],
    resolve(obj, r) {
        const where = `road${obj.id ? ` '${obj.id}'` : ''}`;
        const spec = obj.path && typeof obj.path === 'object' ? obj.path : obj;
        const geo = pathGeometry(spec, r, where);
        if (!geo) return null;
        const width = obj.width !== undefined ? r.num(obj.width, `${where} width`) : 7;
        const lanes = obj.lanes !== undefined ? Math.max(1, Math.round(r.num(obj.lanes, `${where} lanes`))) : 2;
        return { ...geo, width: width > 0 ? width : 7, lanes };
    },
    anchor(st, name, arg, r) {
        return ANNOTATION_TYPES.path.anchor(st, name, arg, r);
    },
    render(obj, st, ctx, g) {
        const W = st.width;
        // Asphalt, then the edges and the dashed lines between lanes
        // A closed road is drawn as a closed shape: no seam where it starts and ends
        const pts = st.closed ? st.points.slice(0, -1) : st.points;
        const lane = (d) => (st.closed ? offsetPolyline(st.points, d, true).slice(0, -1) : offsetPolyline(st.points, d, false));
        polyline(ctx, pts, { fill: 'none', class: 'mp-road', 'stroke-width': W * ctx.pxPerMetre, 'stroke-linejoin': 'round' }, g, st.closed);
        [-W / 2, W / 2].forEach(d => {
            polyline(ctx, lane(d), { fill: 'none', class: 'mp-ink', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g, st.closed);
        });
        for (let i = 1; i < st.lanes; i++) {
            polyline(ctx, lane(-W / 2 + i * W / st.lanes), { fill: 'none', class: 'mp-road-line', 'stroke-width': 1.6, 'stroke-dasharray': '10 8' }, g, st.closed);
        }
    },
};

const car = {
    keys: ['size', 'wheel', ...AUTO_KEYS],
    layer: 'bodies',
    anchorNames: [...BOX_ANCHORS, 'axle(i)', 'surface(u)'],
    resolve(obj, r) {
        const top = r.config.plane === 'horizontal';
        const size = Array.isArray(obj.size) ? obj.size : top ? [4, 1.8] : [4, 1.1];
        const st = top
            ? BODY_TYPES.block.resolve({ ...obj, size }, r)
            : BODY_TYPES.cart.resolve({ ...obj, size, wheel: obj.wheel !== undefined ? obj.wheel : size[1] * 0.3 }, r);
        return st ? { ...st, top } : null;
    },
    anchor(st, name, arg, r) {
        return (st.top ? BODY_TYPES.block : BODY_TYPES.cart).anchor(st, name, arg, r);
    },
    render(obj, st, ctx, g) {
        const L = st.w, H = st.h;
        const at = (u, v) => fromLocal(st.pos, st.angle, [u * L, v * H]);
        const style = obj.color ? `stroke: ${ctx.color(obj.color)}` : undefined;
        const fill = obj.fill ? `fill: ${ctx.color(obj.fill)}` : undefined;
        if (st.top) {
            // Seen from above, the front towards +x of the car: wheels, body with cut corners, windows
            [[0.32, 0.5], [0.32, -0.5], [-0.32, 0.5], [-0.32, -0.5]].forEach(([u, v]) => {
                polyline(ctx, [at(u - 0.08, v - 0.08), at(u + 0.08, v - 0.08), at(u + 0.08, v + 0.08), at(u - 0.08, v + 0.08)], { class: 'mp-ink-fill' }, g, true);
            });
            const c = 0.06;
            const body = [at(-0.5 + c, -0.5), at(0.5 - c * 1.6, -0.5), at(0.5, -0.5 + c * 2.4), at(0.5, 0.5 - c * 2.4), at(0.5 - c * 1.6, 0.5),
                at(-0.5 + c, 0.5), at(-0.5, 0.5 - c * 1.6), at(-0.5, -0.5 + c * 1.6)];
            polyline(ctx, body, { class: 'mp-body', 'stroke-width': 1.6, 'stroke-linejoin': 'round', style: [style, fill].filter(Boolean).join('; ') || undefined }, g, true);
            ctx.obstaclePath([...body, body[0]]);
            polyline(ctx, [at(0.08, -0.38), at(0.24, -0.42), at(0.24, 0.42), at(0.08, 0.38)], { class: 'mp-window', 'stroke-width': 1.2 }, g, true);
            polyline(ctx, [at(-0.3, -0.36), at(-0.4, -0.38), at(-0.4, 0.38), at(-0.3, 0.36)], { class: 'mp-window', 'stroke-width': 1.2 }, g, true);
        } else {
            // From the side, the front towards +x: lower body, cabin with a sloped windscreen, wheels
            const body = [at(-0.5, -0.5), at(0.5, -0.5), at(0.5, 0.05), at(0.42, 0.12), at(0.18, 0.14), at(0.02, 0.5), at(-0.3, 0.5), at(-0.42, 0.12), at(-0.5, 0.1)];
            polyline(ctx, body, { class: 'mp-body', 'stroke-width': 1.6, 'stroke-linejoin': 'round', style: [style, fill].filter(Boolean).join('; ') || undefined }, g, true);
            ctx.obstaclePath([...body, body[0]]);
            polyline(ctx, [at(0.14, 0.16), at(0.01, 0.44), at(-0.12, 0.44), at(-0.12, 0.16)], { class: 'mp-window', 'stroke-width': 1.2 }, g, true);
            polyline(ctx, [at(-0.16, 0.16), at(-0.16, 0.44), at(-0.28, 0.44), at(-0.37, 0.16)], { class: 'mp-window', 'stroke-width': 1.2 }, g, true);
            st.axles.forEach(a => {
                const p = ctx.map(a);
                ctx.svg('circle', { cx: p.x, cy: p.y, r: st.wr * ctx.pxPerMetre, class: 'mp-ink-fill' }, g);
                ctx.svg('circle', { cx: p.x, cy: p.y, r: st.wr * ctx.pxPerMetre * 0.45, class: 'mp-wheel-hub' }, g);
            });
        }
        if (obj.label) {
            const p = ctx.map(st.pos);
            ctx.text(p.x, p.y, obj.label, { color: ctx.ink, parent: g });
        }
    },
};

export const VEHICLE_TYPES = { road, car };
