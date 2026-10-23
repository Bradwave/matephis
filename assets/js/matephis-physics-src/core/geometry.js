/**
 * Geometry for connections: ropes wrapped around pulleys, polylines.
 *
 * Circles carry a signed radius for the direction the rope travels around
 * them: +r when the circle is on the left of the rope (counter-clockwise
 * wrap), −r when it is on the right (clockwise wrap). A plain point is a
 * circle of radius 0, so one formula covers point→circle, circle→circle
 * and circle→point segments.
 */
import { sub, add, scale, dot, cross, len, norm, perp, dist, angleOf } from './vec.js';

/**
 * Common tangent from circle 1 to circle 2 (signed radii, see above).
 * @returns {{a: object, b: object}|null} tangent points, or null when none exists
 */
export function tangentSegment(c1, r1, c2, r2) {
    const d = sub(c2, c1);
    const D = len(d);
    if (D < 1e-12) return null;
    const k = (r2 - r1) / D;
    if (Math.abs(k) > 1) return null;
    const u = scale(d, 1 / D);
    const n = add(scale(u, k), scale(perp(u), Math.sqrt(1 - k * k)));
    return { a: sub(c1, scale(n, r1)), b: sub(c2, scale(n, r2)) };
}

/**
 * Wrap direction around a pulley at `c` for a rope coming from `prev` and
 * going to `next`: the pulley sits inside the bend. "cw" when the path turns
 * right (y up), "ccw" when it turns left.
 */
export function wrapSide(prev, c, next) {
    return cross(sub(c, prev), sub(next, c)) < 0 ? 'cw' : 'ccw';
}

/**
 * Taut rope from `from` to `to` over a list of pulleys.
 * @param {object} from - start point
 * @param {object} to - end point
 * @param {{center: object, radius: number, side?: "cw"|"ccw"}[]} pulleys - in order
 * @returns {{segments: {a: object, b: object}[], arcs: {center, radius, from, to, side}[], points: object[], length: number}|null}
 *   segments: straight parts; arcs: wrapped parts (angles in radians);
 *   points: a polyline approximation of the whole rope; length in metres
 */
export function ropePath(from, to, pulleys = []) {
    const nodes = [{ center: from, r: 0 }];
    pulleys.forEach((p, i) => {
        const prev = i === 0 ? from : pulleys[i - 1].center;
        const next = i === pulleys.length - 1 ? to : pulleys[i + 1].center;
        const side = p.side || wrapSide(prev, p.center, next);
        nodes.push({ center: p.center, r: side === 'ccw' ? p.radius : -p.radius, side, radius: p.radius });
    });
    nodes.push({ center: to, r: 0 });

    const segments = [];
    for (let i = 0; i < nodes.length - 1; i++) {
        const s = tangentSegment(nodes[i].center, nodes[i].r, nodes[i + 1].center, nodes[i + 1].r);
        if (!s) return null;
        segments.push(s);
    }

    const arcs = [];
    const points = [segments[0].a];
    let length = 0;
    for (let i = 0; i < segments.length; i++) {
        points.push(segments[i].b);
        length += dist(segments[i].a, segments[i].b);
        const node = nodes[i + 1];
        if (i < segments.length - 1 && node.radius > 0) {
            const a0 = angleOf(sub(segments[i].b, node.center));
            const a1 = angleOf(sub(segments[i + 1].a, node.center));
            // Sweep in the wrap direction, always between 0 and 2π
            let sweep = node.side === 'ccw' ? a1 - a0 : a0 - a1;
            sweep = ((sweep % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            arcs.push({ center: node.center, radius: node.radius, from: a0, to: a1, side: node.side, sweep });
            length += sweep * node.radius;
            const steps = Math.max(2, Math.ceil(sweep / (Math.PI / 18)));
            for (let k = 1; k < steps; k++) {
                const t = a0 + (node.side === 'ccw' ? 1 : -1) * sweep * k / steps;
                points.push(add(node.center, { x: node.radius * Math.cos(t), y: node.radius * Math.sin(t) }));
            }
            points.push(segments[i + 1].a);
        }
    }
    return { segments, arcs, points, length };
}

/** Total length of a polyline. */
export function polylineLength(points) {
    let l = 0;
    for (let i = 1; i < points.length; i++) l += dist(points[i - 1], points[i]);
    return l;
}

/**
 * Point and unit tangent at fraction u (0–1) of a polyline's length.
 * @returns {{point: object, tangent: object}}
 */
export function pointAlong(points, u) {
    const total = polylineLength(points);
    if (points.length < 2 || total < 1e-12) return { point: points[0], tangent: { x: 1, y: 0, z: 0 } };
    let target = Math.min(Math.max(u, 0), 1) * total;
    for (let i = 1; i < points.length; i++) {
        const l = dist(points[i - 1], points[i]);
        if (target <= l || i === points.length - 1) {
            const t = l > 0 ? Math.min(target / l, 1) : 0;
            const d = sub(points[i], points[i - 1]);
            return { point: add(points[i - 1], scale(d, t)), tangent: norm(d) };
        }
        target -= l;
    }
    return { point: points[points.length - 1], tangent: { x: 1, y: 0, z: 0 } };
}

/**
 * Zig-zag spring between a and b: straight leads at both ends, `coils`
 * full waves of amplitude `amp` (metres) in between.
 */
export function springPoints(a, b, coils = 8, amp = 0.1, lead = 0.12) {
    const d = sub(b, a);
    const L = len(d);
    if (L < 1e-12) return [a, b];
    const u = scale(d, 1 / L), n = perp(u);
    const leadLen = Math.min(L * lead, L / 3);
    const body = L - 2 * leadLen;
    const pts = [a, add(a, scale(u, leadLen))];
    const k = Math.max(1, Math.round(coils)) * 2;
    for (let i = 0; i < k; i++) {
        const along = leadLen + body * (i + 0.5) / k;
        pts.push(add(add(a, scale(u, along)), scale(n, i % 2 === 0 ? amp : -amp)));
    }
    pts.push(add(a, scale(u, L - leadLen)), b);
    return pts;
}

/** Signed distance of p from the line through a with unit normal n. */
export const signedDistance = (p, a, n) => dot(sub(p, a), n);

/**
 * Sideways offsets (pixels) for vectors drawn on top of each other: segments
 * on the same line that overlap by more than a couple of pixels are spread
 * into lanes 7 px apart. Opposite vectors leaving the same point do not
 * overlap and keep their place.
 * @param {{key: any, a: object, b: object}[]} segs - world segments (tail, tip)
 * @param {number} pxPerMetre
 * @returns {Map<any, number>} key -> offset in pixels (perpendicular, left of the vector)
 */
export function collinearOffsets(segs, pxPerMetre, lane = 7) {
    const tol = 3 / pxPerMetre, minOverlap = 2 / pxPerMetre;
    const parent = segs.map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    for (let i = 0; i < segs.length; i++) {
        const A = segs[i], La = dist(A.a, A.b);
        if (La < 1e-12) continue;
        const u = scale(sub(A.b, A.a), 1 / La), n = perp(u);
        for (let j = i + 1; j < segs.length; j++) {
            const B = segs[j], Lb = dist(B.a, B.b);
            if (Lb < 1e-12) continue;
            const v = scale(sub(B.b, B.a), 1 / Lb);
            if (Math.abs(cross(u, v)) > 0.05) continue;
            if (Math.abs(dot(sub(B.a, A.a), n)) > tol) continue;
            const s0 = dot(sub(B.a, A.a), u), s1 = dot(sub(B.b, A.a), u);
            const overlap = Math.min(La, Math.max(s0, s1)) - Math.max(0, Math.min(s0, s1));
            if (overlap > minOverlap) parent[find(i)] = find(j);
        }
    }
    const groups = new Map();
    segs.forEach((s, i) => {
        const g = find(i);
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(i);
    });
    const out = new Map();
    groups.forEach(members => {
        if (members.length < 2) return;
        // Lanes measured on a common side, so a vector and an opposite one end up apart
        const ref = segs[members[0]];
        const n0 = perp(norm(sub(ref.b, ref.a)));
        members.forEach((i, k) => {
            const s = segs[i];
            const own = perp(norm(sub(s.b, s.a)));
            const sign = dot(own, n0) >= 0 ? 1 : -1;
            out.set(s.key, sign * (k - (members.length - 1) / 2) * lane);
        });
    });
    return out;
}

/**
 * Arc-length parametrisation of a curve f(p), p in [p0, p1]: `at(s)` gives
 * the point and unit tangent at distance s from the start. The parameter is
 * interpolated over s with a monotone cubic, so positions along the curve are
 * smooth and a body following it has no jumps in acceleration.
 * @param {(p: number) => {x: number, y: number}} f
 */
export function arcLengthMap(f, p0, p1, n = 400) {
    const ps = [], ss = [];
    let prev = null, s = 0;
    for (let i = 0; i <= n; i++) {
        const p = p0 + (p1 - p0) * i / n;
        const q = f(p);
        if (!q || !isFinite(q.x) || !isFinite(q.y)) continue;
        if (prev) {
            const d = Math.hypot(q.x - prev.x, q.y - prev.y);
            if (d < 1e-12) continue;
            s += d;
        }
        ps.push(p); ss.push(s); prev = q;
    }
    const m = ps.length;
    if (m < 2) return null;
    // Slopes dp/ds at the nodes (Fritsch–Carlson: no overshoot, p stays monotone)
    const sec = [];
    for (let i = 0; i < m - 1; i++) sec.push((ps[i + 1] - ps[i]) / (ss[i + 1] - ss[i]));
    const dp = ps.map((_, i) => (i === 0 ? sec[0] : i === m - 1 ? sec[m - 2]
        : sec[i - 1] * sec[i] <= 0 ? 0 : 2 / (1 / sec[i - 1] + 1 / sec[i])));
    const param = (sv) => {
        const x = Math.min(Math.max(sv, 0), ss[m - 1]);
        let lo = 0, hi = m - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (ss[mid] <= x) lo = mid; else hi = mid;
        }
        const h = ss[hi] - ss[lo], u = (x - ss[lo]) / h;
        const h00 = (1 + 2 * u) * (1 - u) * (1 - u), h10 = u * (1 - u) * (1 - u);
        const h01 = u * u * (3 - 2 * u), h11 = u * u * (u - 1);
        return h00 * ps[lo] + h10 * h * dp[lo] + h01 * ps[hi] + h11 * h * dp[hi];
    };
    const eps = Math.abs(p1 - p0) * 1e-5;
    return {
        length: ss[m - 1],
        at(sv) {
            const p = param(sv);
            const q = f(p);
            const a = f(Math.max(Math.min(p0, p1), Math.min(Math.max(p0, p1), p - eps)));
            const b = f(Math.max(Math.min(p0, p1), Math.min(Math.max(p0, p1), p + eps)));
            const d = { x: b.x - a.x, y: b.y - a.y, z: 0 };
            const l = Math.hypot(d.x, d.y) || 1;
            return { point: { x: q.x, y: q.y, z: 0 }, tangent: { x: d.x / l * Math.sign(p1 - p0 || 1), y: d.y / l * Math.sign(p1 - p0 || 1), z: 0 } };
        },
    };
}
