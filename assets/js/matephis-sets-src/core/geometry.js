/**
 * Plane geometry for drawing (screen pixels): convex hulls, the rounded
 * outline around a group of points (the ellipses drawn on a blackboard to
 * circle the image of a function), and curved arrows.
 */

/** Convex hull (counter-clockwise in screen coordinates, y down), Andrew's monotone chain. */
export function convexHull(points) {
    const pts = points.map(p => [p[0], p[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const uniq = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
    if (uniq.length < 3) return uniq;
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [], upper = [];
    for (const p of uniq) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
    }
    for (let i = uniq.length - 1; i >= 0; i--) {
        const p = uniq[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
}

/**
 * SVG path of the outline at distance r around a set of points: a circle for
 * one point, a capsule for two, a rounded polygon for more. With `ry` the
 * outline is stretched along y (ry / r), so a column of points gets an
 * elongated, ellipse-like loop.
 */
export function roundedHullPath(points, r) {
    if (!points.length) return '';
    const f = (v) => +v.toFixed(2);
    if (points.length === 1 || points.every(p => Math.hypot(p[0] - points[0][0], p[1] - points[0][1]) < 1e-6)) {
        const [x, y] = points[0];
        return `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1,0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1,0 ${f(-2 * r)},0Z`;
    }
    let hull = convexHull(points);
    if (hull.length < 3) {
        // Two distinct points (or collinear ones): their extremes
        const sorted = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        hull = [sorted[0], sorted[sorted.length - 1]];
    }
    const n = hull.length;
    // Outward normal of each edge i -> i+1
    const cx = hull.reduce((s, p) => s + p[0], 0) / n, cy = hull.reduce((s, p) => s + p[1], 0) / n;
    const normals = hull.map((p, i) => {
        const q = hull[(i + 1) % n];
        const dx = q[0] - p[0], dy = q[1] - p[1];
        const L = Math.hypot(dx, dy) || 1;
        let nx = dy / L, ny = -dx / L;
        // Point away from the centre
        const mx = (p[0] + q[0]) / 2 - cx, my = (p[1] + q[1]) / 2 - cy;
        if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
        return [nx, ny];
    });
    let d = '';
    for (let i = 0; i < n; i++) {
        const p = hull[i], q = hull[(i + 1) % n], nrm = normals[i];
        const a = [p[0] + nrm[0] * r, p[1] + nrm[1] * r];
        const b = [q[0] + nrm[0] * r, q[1] + nrm[1] * r];
        if (i === 0) d += `M${f(a[0])},${f(a[1])}`;
        d += `L${f(b[0])},${f(b[1])}`;
        const next = normals[(i + 1) % n];
        const c = [q[0] + next[0] * r, q[1] + next[1] * r];
        // Arc around the corner q, turning the way the outline is travelled
        // (the normal turns towards the direction of travel)
        const turn = nrm[0] * (q[1] - p[1]) - nrm[1] * (q[0] - p[0]);
        d += `A${f(r)},${f(r)} 0 0,${turn > 0 ? 1 : 0} ${f(c[0])},${f(c[1])}`;
    }
    return `${d}Z`;
}

/** Is p inside the convex polygon `hull` grown by `margin`? */
export function insideHull(hull, p, margin = 0) {
    if (hull.length === 0) return false;
    if (hull.length === 1) return Math.hypot(p[0] - hull[0][0], p[1] - hull[0][1]) <= margin;
    if (hull.length === 2) return distToSegment(p, hull[0], hull[1]) <= margin;
    const n = hull.length;
    const cx = hull.reduce((s, q) => s + q[0], 0) / n, cy = hull.reduce((s, q) => s + q[1], 0) / n;
    for (let i = 0; i < n; i++) {
        const a = hull[i], b = hull[(i + 1) % n];
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const L = Math.hypot(dx, dy) || 1;
        let nx = dy / L, ny = -dx / L;
        if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
        if ((p[0] - a[0]) * nx + (p[1] - a[1]) * ny > margin) return false;
    }
    return true;
}

export function distToSegment(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) : 0;
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/**
 * A curved arrow from a to b: quadratic Bézier whose control point is pushed
 * sideways by `bend` × length (positive: to the left of the direction of
 * travel on screen). The ends are pulled in by `trimStart` / `trimEnd` pixels.
 * Returns the path and the tip with its direction, for the arrowhead.
 */
export function curvedArrow(a, b, { bend = 0, trimStart = 0, trimEnd = 0 } = {}) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = dy / L, ny = -dx / L;
    const c = [(a[0] + b[0]) / 2 + nx * bend * L, (a[1] + b[1]) / 2 + ny * bend * L];
    const at = (t) => [
        (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
        (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
    ];
    // Arc-length trims, approximately (the curves are gentle)
    const len = L * (1 + Math.abs(bend) * Math.abs(bend) * 2.6);
    const t0 = Math.min(0.45, trimStart / len), t1 = Math.max(0.55, 1 - trimEnd / len);
    // Sub-curve between t0 and t1 (de Casteljau)
    const p0 = at(t0), p2 = at(t1);
    const lerp = (u, v, t) => [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t];
    // Tangent directions at t0 and t1
    const q0 = lerp(a, c, t0), q1 = lerp(c, b, t0);
    const dir0 = [q1[0] - q0[0], q1[1] - q0[1]];
    const r0 = lerp(a, c, t1), r1 = lerp(c, b, t1);
    const dir1 = [r1[0] - r0[0], r1[1] - r0[1]];
    // Control point of the sub-curve: intersection of the two tangents
    const ctrl = lineIntersection(p0, dir0, p2, dir1) || [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2];
    const f = (v) => +v.toFixed(2);
    return {
        d: `M${f(p0[0])},${f(p0[1])}Q${f(ctrl[0])},${f(ctrl[1])} ${f(p2[0])},${f(p2[1])}`,
        start: p0, end: p2, angle: Math.atan2(dir1[1], dir1[0]), mid: at((t0 + t1) / 2), control: ctrl,
    };
}

function lineIntersection(p, r, q, s) {
    const den = r[0] * s[1] - r[1] * s[0];
    if (Math.abs(den) < 1e-9) return null;
    const t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / den;
    return [p[0] + r[0] * t, p[1] + r[1] * t];
}

/** Points of a filled arrowhead with its tip at (x, y), pointing along angle a. */
export function arrowHeadPoints(x, y, a, size) {
    const p1 = [x - size * Math.cos(a - 0.4), y - size * Math.sin(a - 0.4)];
    const p2 = [x - size * Math.cos(a + 0.4), y - size * Math.sin(a + 0.4)];
    const f = (v) => +v.toFixed(2);
    return `${f(x)},${f(y)} ${f(p1[0])},${f(p1[1])} ${f(p2[0])},${f(p2[1])}`;
}

/** Do segments ab and cd meet (touching and overlapping included)? */
export function segmentsMeet(a, b, c, d, eps = 1e-12) {
    const cross = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
    const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
    if (((d1 > eps && d2 < -eps) || (d1 < -eps && d2 > eps)) && ((d3 > eps && d4 < -eps) || (d3 < -eps && d4 > eps))) return true;
    // Touching or collinear: an endpoint lies on the other segment
    const tol = Math.sqrt(eps);
    return distToSegment(a, c, d) <= tol || distToSegment(b, c, d) <= tol
        || distToSegment(c, a, b) <= tol || distToSegment(d, a, b) <= tol;
}

/**
 * Is a polyline simple (it never meets itself)? Consecutive pieces share an
 * endpoint and are not compared; with `closed` the last point joins the first.
 * `tol` is a distance under which two points count as the same.
 */
export function isSimplePolyline(pts, { closed = false, tol = 1e-9 } = {}) {
    const n = pts.length;
    const segs = [];
    for (let i = 0; i + 1 < n; i++) segs.push([pts[i], pts[i + 1]]);
    if (closed && n > 2) segs.push([pts[n - 1], pts[0]]);
    const m = segs.length;
    const eps = tol * tol;
    for (let i = 0; i < m; i++) {
        for (let j = i + 2; j < m; j++) {
            if (closed && i === 0 && j === m - 1) continue;
            const [a, b] = segs[i], [c, d] = segs[j];
            // Quick reject on bounding boxes
            if (Math.max(a[0], b[0]) < Math.min(c[0], d[0]) - tol || Math.max(c[0], d[0]) < Math.min(a[0], b[0]) - tol
                || Math.max(a[1], b[1]) < Math.min(c[1], d[1]) - tol || Math.max(c[1], d[1]) < Math.min(a[1], b[1]) - tol) continue;
            if (segmentsMeet(a, b, c, d, eps)) return false;
        }
    }
    return true;
}

/** Is a point inside a polygon (even-odd rule)? */
export function insidePolygon(poly, p) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}
