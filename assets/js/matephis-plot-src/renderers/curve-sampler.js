/**
 * Adaptive Curve Sampler
 *
 * Samples any curve t -> screen point (explicit functions, parametric curves,
 * polar curves, complex-valued functions) and returns polylines in screen
 * coordinates. Refinement happens in screen space, so the result is accurate
 * to a fraction of a pixel regardless of axis scale (linear or log).
 *
 *  - subdivides where the midpoint deviates from the chord (2D distance)
 *  - locates domain edges (valid <-> invalid) by bisection
 *  - detects jump discontinuities / vertical asymptotes and breaks the line
 *  - skips refinement where the curve is entirely outside the viewport
 */

/**
 * @param {object} o
 * @param {(t:number) => ([number, number] | null)} o.point - screen point for t, or null if undefined
 * @param {number} o.t0 - start of the parameter range
 * @param {number} o.t1 - end of the parameter range
 * @param {number} o.steps - number of initial uniform samples
 * @param {{x0:number, y0:number, x1:number, y1:number}} o.view - visible screen rectangle
 * @param {number} [o.tolerance=0.3] - max deviation from chord in px
 * @param {number} [o.maxDepth=10] - max recursion depth per initial interval
 * @param {boolean} [o.connectJumps=false] - never break on large jumps (parametric curves)
 * @returns {number[][]} polylines as flat arrays [x0, y0, x1, y1, ...]
 */
export function sampleCurve(o) {
    const { point, t0, t1, view } = o;
    const steps = Math.max(2, Math.ceil(o.steps));
    const tol = o.tolerance !== undefined ? o.tolerance : 0.3;
    const tol2 = tol * tol;
    const maxDepth = o.maxDepth !== undefined ? o.maxDepth : 10;
    const connectJumps = o.connectJumps === true;

    const vh = view.y1 - view.y0;
    const vw = view.x1 - view.x0;
    // Coordinates are clamped so huge values never reach the SVG renderer
    const clampLo = view.y0 - 4 * vh, clampHi = view.y1 + 4 * vh;
    const clampLoX = view.x0 - 4 * vw, clampHiX = view.x1 + 4 * vw;
    // Segments longer than this at max depth are checked for a discontinuity
    const jumpLimit = 8;
    const margin = Math.max(vh, vw) * 0.5;

    const lines = [];
    let cur = null;

    const safe = (t) => {
        let p;
        try { p = point(t); } catch (e) { p = null; }
        if (!p) return null;
        const x = p[0], y = p[1];
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return p;
    };

    const emit = (p) => {
        const x = Math.round(Math.min(clampHiX, Math.max(clampLoX, p[0])) * 100) / 100;
        const y = Math.round(Math.min(clampHi, Math.max(clampLo, p[1])) * 100) / 100;
        if (!cur) { cur = [x, y]; lines.push(cur); return; }
        const n = cur.length;
        if (cur[n - 2] === x && cur[n - 1] === y) return;
        // Collapse runs along a clamp boundary (curve far outside the view)
        if (n >= 4 && (y === clampLo || y === clampHi) && cur[n - 1] === y && cur[n - 3] === y) {
            cur[n - 2] = x;
            return;
        }
        cur.push(x, y);
    };
    const lineTo = (a, b) => {
        if (!cur) emit(a);
        emit(b);
    };
    const breakLine = () => { cur = null; };

    // Same side outside the viewport (with margin): no need to refine
    const outside = (a, b, m) =>
        (a[1] < view.y0 - margin && b[1] < view.y0 - margin && m[1] < view.y0 - margin) ||
        (a[1] > view.y1 + margin && b[1] > view.y1 + margin && m[1] > view.y1 + margin) ||
        (a[0] < view.x0 - margin && b[0] < view.x0 - margin && m[0] < view.x0 - margin) ||
        (a[0] > view.x1 + margin && b[0] > view.x1 + margin && m[0] > view.x1 + margin);

    // Squared distance of m from segment a-b
    const dev2 = (a, b, m) => {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const l2 = dx * dx + dy * dy;
        if (l2 === 0) return (m[0] - a[0]) ** 2 + (m[1] - a[1]) ** 2;
        let u = ((m[0] - a[0]) * dx + (m[1] - a[1]) * dy) / l2;
        u = Math.max(0, Math.min(1, u));
        return (m[0] - a[0] - u * dx) ** 2 + (m[1] - a[1] - u * dy) ** 2;
    };

    // Follows the larger half of a long segment: a steep but continuous curve
    // shrinks below a pixel quickly, a true jump keeps its length.
    const isJump = (ta, pa, tb, pb) => {
        const d = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
        for (let k = 0; k < 40; k++) {
            if (d(pa, pb) < 1) return false;
            const tm = (ta + tb) / 2;
            const pm = safe(tm);
            if (!pm) return true;
            if (d(pa, pm) > d(pm, pb)) { tb = tm; pb = pm; } else { ta = tm; pa = pm; }
        }
        return true;
    };

    // Bisect between a valid and an invalid parameter to find the domain edge
    const edge = (tValid, tInvalid, pValid) => {
        let best = pValid, bt = tValid;
        let lo = tValid, hi = tInvalid;
        for (let k = 0; k < 24; k++) {
            const mid = (lo + hi) / 2;
            const pm = safe(mid);
            if (pm) {
                best = pm; bt = mid; lo = mid;
                // Far outside the view: further precision is invisible
                if (pm[1] < clampLo || pm[1] > clampHi) break;
            } else {
                hi = mid;
            }
        }
        return { p: best, t: bt };
    };

    const segment = (ta, pa, tb, pb, depth) => {
        const tm = (ta + tb) / 2;
        const pm = safe(tm);

        if (pa && pb) {
            if (pm) {
                const len2 = (pb[0] - pa[0]) ** 2 + (pb[1] - pa[1]) ** 2;
                if (depth < maxDepth && !outside(pa, pb, pm) && (dev2(pa, pb, pm) > tol2 || len2 > 400)) {
                    segment(ta, pa, tm, pm, depth + 1);
                    segment(tm, pm, tb, pb, depth + 1);
                    return;
                }
                // Max depth reached on a long segment: jump discontinuity / asymptote?
                if (!connectJumps && depth >= maxDepth && len2 > jumpLimit * jumpLimit && isJump(ta, pa, tb, pb)) {
                    breakLine();
                    return;
                }
                lineTo(pa, pb);
                return;
            }
            // Hole between two valid samples (e.g. sin(x)/x at 0)
            if (depth < maxDepth) {
                segment(ta, pa, tm, null, depth + 1);
                segment(tm, null, tb, pb, depth + 1);
                return;
            }
            breakLine();
            return;
        }

        if (pa && !pb) {
            // Leaving the domain
            if (pm && depth < maxDepth) {
                segment(ta, pa, tm, pm, depth + 1);
                segment(tm, pm, tb, null, depth + 1);
                return;
            }
            // Straight to the edge point: the interval is already tiny, and
            // this keeps asymptotic edges (log(x) at 0) reaching the border
            lineTo(pa, edge(ta, tb, pa).p);
            breakLine();
            return;
        }

        if (!pa && pb) {
            // Entering the domain
            if (pm && depth < maxDepth) {
                segment(ta, null, tm, pm, depth + 1);
                segment(tm, pm, tb, pb, depth + 1);
                return;
            }
            breakLine();
            lineTo(edge(tb, ta, pb).p, pb);
            return;
        }

        // Both invalid: a valid island may hide in the middle
        if (pm && depth < maxDepth) {
            segment(ta, null, tm, pm, depth + 1);
            segment(tm, pm, tb, null, depth + 1);
            return;
        }
        breakLine();
    };

    const dt = (t1 - t0) / steps;
    let tPrev = t0;
    let pPrev = safe(t0);
    for (let k = 1; k <= steps; k++) {
        const t = k === steps ? t1 : t0 + k * dt;
        const p = safe(t);
        segment(tPrev, pPrev, t, p, 0);
        tPrev = t;
        pPrev = p;
    }

    // Single isolated points are dropped (a 0-length line is invisible anyway)
    return lines.filter(l => l.length >= 4);
}

/** Converts polylines to an SVG path "d" string. */
export function polylinesToPath(lines) {
    let d = '';
    for (const l of lines) {
        d += `M${l[0]} ${l[1]}`;
        for (let k = 2; k < l.length; k += 2) d += `L${l[k]} ${l[k + 1]}`;
    }
    return d;
}

/**
 * Closest point on a set of polylines to (px, py).
 * @returns {{x:number, y:number, dist:number, seg:number, line:number} | null}
 */
export function closestOnPolylines(lines, px, py) {
    let best = null;
    let bestD2 = Infinity;
    for (let li = 0; li < lines.length; li++) {
        const l = lines[li];
        for (let k = 0; k + 3 < l.length; k += 2) {
            const x1 = l[k], y1 = l[k + 1], x2 = l[k + 2], y2 = l[k + 3];
            const dx = x2 - x1, dy = y2 - y1;
            const l2 = dx * dx + dy * dy;
            let u = l2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / l2;
            u = Math.max(0, Math.min(1, u));
            const cx = x1 + u * dx, cy = y1 + u * dy;
            const d2 = (px - cx) ** 2 + (py - cy) ** 2;
            if (d2 < bestD2) {
                bestD2 = d2;
                best = { x: cx, y: cy, seg: k / 2, line: li };
            }
        }
    }
    if (best) best.dist = Math.sqrt(bestD2);
    return best;
}
