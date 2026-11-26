/**
 * Pure geometry helpers for Matephis Board.
 * World coordinates are in millimeters; 1 landscape A4 tile = 297 x 210 mm.
 */

export const A4_W = 297;
export const A4_H = 210;

export const MIN_SCALE = 0.6;   // px per mm (zoomed way out for huge boards)
export const MAX_SCALE = 28.0;  // px per mm (detailed subscripts / diagrams)

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/** Median of a short list of numbers (pinch spread filtering). */
export function median(values) {
    const v = values.slice().sort((a, b) => a - b);
    const m = v.length >> 1;
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) * 0.5;
}

export function worldToScreen(wx, wy, cam) {
    return {
        x: (wx - cam.x) * cam.scale,
        y: (wy - cam.y) * cam.scale,
    };
}

export function screenToWorld(sx, sy, cam) {
    return {
        x: sx / cam.scale + cam.x,
        y: sy / cam.scale + cam.y,
    };
}

/**
 * Default writing scale and top-left camera on landscape A4 (0, 0).
 * Slightly zoomed in (~80% of A4 width visible across the viewport)
 * so handwriting feels natural right away.
 */
export function computeBaseScale(viewportW, viewportH) {
    if (!viewportW || !viewportH) return 5.0;
    const byWidth = viewportW / (A4_W * 0.84);
    const byHeight = viewportH / (A4_H * 0.84);
    // Favor width on standard landscape smartboards, capped so ultrawide/tiny screens stay sane
    const ideal = Math.min(byWidth, byHeight * 1.15);
    return clamp(ideal, 2.2, 10.0);
}

export function createInitialCamera(viewportW, viewportH) {
    const scale = computeBaseScale(viewportW, viewportH);
    const padMm = 6;
    return {
        x: -padMm,
        y: -padMm,
        scale,
        baseScale: scale,
    };
}

export function computeBBox(points, pad = 0) {
    if (!points || points.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    return {
        minX: minX - pad,
        minY: minY - pad,
        maxX: maxX + pad,
        maxY: maxY + pad,
    };
}

export function bboxIntersects(a, b) {
    return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

export function distSqPointToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) {
        const ex = px - ax;
        const ey = py - ay;
        return ex * ex + ey * ey;
    }
    const t = clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
    const projX = ax + t * dx;
    const projY = ay + t * dy;
    const ex = px - projX;
    const ey = py - projY;
    return ex * ex + ey * ey;
}

/**
 * Ramer-Douglas-Peucker polyline simplification.
 * Reduces point count while keeping handwriting curves accurate.
 */
export function simplifyRDP(points, epsilon = 0.14) {
    if (!points || points.length <= 2) return points ? points.slice() : [];
    const epsSq = epsilon * epsilon;

    const keep = new Uint8Array(points.length);
    keep[0] = 1;
    keep[points.length - 1] = 1;

    const stack = [[0, points.length - 1]];
    while (stack.length > 0) {
        const [start, end] = stack.pop();
        let maxDistSq = 0;
        let maxIdx = -1;
        const a = points[start];
        const b = points[end];

        for (let i = start + 1; i < end; i++) {
            const dSq = distSqPointToSegment(points[i].x, points[i].y, a.x, a.y, b.x, b.y);
            if (dSq > maxDistSq) {
                maxDistSq = dSq;
                maxIdx = i;
            }
        }

        if (maxDistSq > epsSq && maxIdx !== -1) {
            keep[maxIdx] = 1;
            stack.push([start, maxIdx], [maxIdx, end]);
        }
    }

    const out = [];
    for (let i = 0; i < points.length; i++) {
        if (keep[i]) out.push(points[i]);
    }
    return out;
}

/**
 * Returns true if any segment or dot of `points` intersects the circle (cx, cy, r).
 */
export function circleHitsStroke(points, cx, cy, r) {
    if (!points || points.length === 0) return false;
    const rSq = r * r;
    if (points.length === 1) {
        const dx = points[0].x - cx;
        const dy = points[0].y - cy;
        return dx * dx + dy * dy <= rSq;
    }
    for (let i = 0; i < points.length - 1; i++) {
        if (distSqPointToSegment(cx, cy, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y) <= rSq) {
            return true;
        }
    }
    return false;
}

function polylineLength(pts) {
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
        total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    }
    return total;
}

/**
 * True vector partial/segment eraser.
 * Subtracts the disk (cx, cy, r) from a polyline stroke and returns:
 *   { changed: boolean, pieces: Array<Array<{x, y}>> }
 * Only surviving pieces strictly outside the disk are kept.
 */
export function eraseCircleFromStroke(points, cx, cy, r, minPieceLength = 0.25) {
    if (!points || points.length === 0) return { changed: false, pieces: [] };
    const rSq = r * r;

    // Single-point dot stroke
    if (points.length === 1) {
        const dx = points[0].x - cx;
        const dy = points[0].y - cy;
        if (dx * dx + dy * dy <= rSq) {
            return { changed: true, pieces: [] };
        }
        return { changed: false, pieces: [points] };
    }

    // Fast path: nothing in this stroke is hit
    if (!circleHitsStroke(points, cx, cy, r)) {
        return { changed: false, pieces: [points] };
    }

    const rawPieces = [];
    let current = null;

    const pushPoint = (pt) => {
        if (!current) {
            current = [pt];
            return;
        }
        const last = current[current.length - 1];
        if (Math.hypot(pt.x - last.x, pt.y - last.y) > 1e-4) {
            current.push(pt);
        }
    };

    const flushCurrent = () => {
        if (current && current.length >= 2 && polylineLength(current) >= minPieceLength) {
            rawPieces.push(current);
        }
        current = null;
    };

    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const fx = a.x - cx;
        const fy = a.y - cy;

        const A = dx * dx + dy * dy;
        const aInside = fx * fx + fy * fy <= rSq;
        const bInside = (b.x - cx) * (b.x - cx) + (b.y - cy) * (b.y - cy) <= rSq;

        if (A < 1e-10) {
            if (!aInside) pushPoint(a);
            continue;
        }

        const B = 2 * (fx * dx + fy * dy);
        const C = fx * fx + fy * fy - rSq;
        const disc = B * B - 4 * A * C;

        if (disc <= 0) {
            // Segment never enters the disk (unless completely inside, handled by disc > 0)
            if (!aInside && !bInside) {
                pushPoint(a);
                pushPoint(b);
            } else {
                flushCurrent();
            }
            continue;
        }

        const sqrtD = Math.sqrt(disc);
        const t1 = (-B - sqrtD) / (2 * A);
        const t2 = (-B + sqrtD) / (2 * A);

        // Inside interval is [t1, t2] intersected with [0, 1]
        if (t2 <= 0 || t1 >= 1) {
            // Entire segment is outside the disk
            pushPoint(a);
            pushPoint(b);
        } else if (t1 <= 0 && t2 >= 1) {
            // Entire segment is inside the disk
            flushCurrent();
        } else if (t1 > 0 && t2 < 1) {
            // Segment enters at t1 and exits at t2 -> split!
            const p1 = { x: a.x + t1 * dx, y: a.y + t1 * dy };
            const p2 = { x: a.x + t2 * dx, y: a.y + t2 * dy };
            pushPoint(a);
            pushPoint(p1);
            flushCurrent();
            pushPoint(p2);
            pushPoint(b);
        } else if (t1 > 0 && t1 < 1) {
            // Starts outside, enters at t1 and ends inside
            const p1 = { x: a.x + t1 * dx, y: a.y + t1 * dy };
            pushPoint(a);
            pushPoint(p1);
            flushCurrent();
        } else if (t2 > 0 && t2 < 1) {
            // Starts inside, exits at t2 and ends outside
            flushCurrent();
            const p2 = { x: a.x + t2 * dx, y: a.y + t2 * dy };
            pushPoint(p2);
            pushPoint(b);
        }
    }

    flushCurrent();
    return { changed: true, pieces: rawPieces };
}

/**
 * Computes occupied landscape A4 tile footprint from strokes, widgets, and connectors.
 * Always includes at least tile (0, 0).
 */
export function computeA4Footprint(strokes = [], widgets = [], connectors = []) {
    let minCol = 0;
    let maxCol = 0;
    let minRow = 0;
    let maxRow = 0;
    const occupied = new Set(['0,0']);

    let contentMinX = Infinity;
    let contentMinY = Infinity;
    let contentMaxX = -Infinity;
    let contentMaxY = -Infinity;
    let hasContent = false;

    const includeBox = (x0, y0, x1, y1) => {
        hasContent = true;
        if (x0 < contentMinX) contentMinX = x0;
        if (y0 < contentMinY) contentMinY = y0;
        if (x1 > contentMaxX) contentMaxX = x1;
        if (y1 > contentMaxY) contentMaxY = y1;

        const c0 = Math.floor(x0 / A4_W);
        const c1 = Math.floor(x1 / A4_W);
        const r0 = Math.floor(y0 / A4_H);
        const r1 = Math.floor(y1 / A4_H);

        if (c0 < minCol) minCol = c0;
        if (c1 > maxCol) maxCol = c1;
        if (r0 < minRow) minRow = r0;
        if (r1 > maxRow) maxRow = r1;

        for (let r = r0; r <= r1; r++) {
            for (let c = c0; c <= c1; c++) {
                occupied.add(`${c},${r}`);
            }
        }
    };

    for (let i = 0; i < strokes.length; i++) {
        const bb = strokes[i].bbox;
        if (!bb) continue;
        includeBox(bb.minX, bb.minY, bb.maxX, bb.maxY);
    }

    for (let i = 0; i < widgets.length; i++) {
        const w = widgets[i];
        if (!w || typeof w.x !== 'number' || typeof w.y !== 'number') continue;
        includeBox(w.x, w.y, w.x + (w.w || 0), w.y + (w.h || 0));
    }

    for (let i = 0; i < connectors.length; i++) {
        const c = connectors[i];
        if (!c || typeof c.x !== 'number' || typeof c.y !== 'number') continue;
        const pad = 4;
        includeBox(c.x - pad, c.y - pad, c.x + pad, c.y + pad);
    }

    const cols = maxCol - minCol + 1;
    const rows = maxRow - minRow + 1;
    const wideOverflow = cols > 1 || minCol < 0;
    const tallOverflow = rows > 4 || minRow < 0;

    return {
        minCol,
        maxCol,
        minRow,
        maxRow,
        cols,
        rows,
        occupied,
        wideOverflow,
        tallOverflow,
        warning: wideOverflow || tallOverflow,
        bounds: {
            minX: minCol * A4_W,
            minY: minRow * A4_H,
            maxX: (maxCol + 1) * A4_W,
            maxY: (maxRow + 1) * A4_H,
        },
        contentBounds: hasContent
            ? { minX: contentMinX, minY: contentMinY, maxX: contentMaxX, maxY: contentMaxY }
            : { minX: 0, minY: 0, maxX: A4_W, maxY: A4_H },
    };
}
