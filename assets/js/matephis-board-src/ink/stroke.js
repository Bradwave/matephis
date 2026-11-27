/**
 * Vector stroke model, compact delta serialization, and Canvas 2D rendering.
 */

import { computeBBox } from './geometry.js';
import { resolveInkColor } from './palette.js';

let strokeCounter = 1;

export function nextStrokeId() {
    return `s${Date.now().toString(36)}_${(strokeCounter++).toString(36)}`;
}

export function createStroke({
    id = nextStrokeId(),
    tool = 'pen',
    color = 0,
    width = 0.45,
    style = 'solid',
    points = [],
}) {
    return {
        id,
        tool,
        color,
        width,
        style,
        points,
        bbox: computeBBox(points, width * 0.6),
    };
}

export function refreshStrokeBBox(stroke) {
    stroke.bbox = computeBBox(stroke.points, stroke.width * 0.6);
    pathCache.delete(stroke);
    return stroke;
}

/**
 * Compact JSON encoding: quantize coordinates to 0.1 mm integers and delta-encode.
 * Format: { id, t, c, w, s, p: [x0, y0, dx1, dy1, ...] }
 */
export function encodeStroke(stroke) {
    const pts = stroke.points || [];
    const flat = new Array(pts.length * 2);
    let prevX = 0;
    let prevY = 0;
    for (let i = 0; i < pts.length; i++) {
        const qx = Math.round(pts[i].x * 10);
        const qy = Math.round(pts[i].y * 10);
        if (i === 0) {
            flat[0] = qx;
            flat[1] = qy;
        } else {
            flat[i * 2] = qx - prevX;
            flat[i * 2 + 1] = qy - prevY;
        }
        prevX = qx;
        prevY = qy;
    }

    const out = {
        id: stroke.id,
        t: stroke.tool === 'highlighter' ? 'h' : 'p',
        c: stroke.color,
        w: Math.round(stroke.width * 100) / 100,
        p: flat,
    };
    if (stroke.style && stroke.style !== 'solid') {
        out.s = stroke.style === 'dashed' ? 'da' : stroke.style === 'dotted' ? 'do' : stroke.style;
    }
    return out;
}

export function decodeStroke(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const flat = Array.isArray(raw.p) ? raw.p : [];
    const count = Math.floor(flat.length / 2);
    const points = [];
    let qx = 0;
    let qy = 0;
    for (let i = 0; i < count; i++) {
        const dx = Number(flat[i * 2]);
        const dy = Number(flat[i * 2 + 1]);
        if (!Number.isFinite(dx) || !Number.isFinite(dy)) continue;
        if (points.length === 0) {
            qx = dx;
            qy = dy;
        } else {
            qx += dx;
            qy += dy;
        }
        points.push({ x: qx / 10, y: qy / 10 });
    }

    let style = 'solid';
    if (raw.s === 'da' || raw.s === 'dashed') style = 'dashed';
    else if (raw.s === 'do' || raw.s === 'dotted') style = 'dotted';

    const parsedW = Number(raw.w);
    const width = Number.isFinite(parsedW) && parsedW > 0 ? Math.min(parsedW, 100) : 0.75;

    return createStroke({
        id: typeof raw.id === 'string' && raw.id ? raw.id : nextStrokeId(),
        tool: raw.t === 'h' || raw.t === 'highlighter' ? 'highlighter' : 'pen',
        color: raw.c ?? 0,
        width,
        style,
        points,
    });
}

/**
 * In-memory outline cache: the smoothed path of each committed stroke is built once and
 * reused on every redraw. Keyed by stroke object; rebuilt if its points array is replaced
 * or grows. Never serialized (file size unchanged).
 */
const pathCache = new WeakMap();
const HAS_PATH2D = typeof Path2D === 'function';

export const SHARP_COS_THRESHOLD = 0.75;
export const MAX_PULL_MM = 2.2;

/**
 * Trace the stroke's smoothed outline into `sink` (a 2D context or a Path2D).
 * Uses corner-aware quadratic midpoint smoothing so fast handwriting looks crisp.
 */
export function traceStroke(sink, pts, width) {
    if (!pts || pts.length === 0) return;

    if (pts.length === 1) {
        sink.moveTo(pts[0].x + width * 0.5, pts[0].y);
        sink.arc(pts[0].x, pts[0].y, width * 0.5, 0, Math.PI * 2);
        return;
    }

    sink.moveTo(pts[0].x, pts[0].y);

    if (pts.length === 2) {
        sink.lineTo(pts[1].x, pts[1].y);
        return;
    }

    // Corner-aware clamped quadratic smoothing:
    // - Sharp turns (> ~41°, cos < 0.75) hit the exact vertex so letters like "t", "v", "z", "7"
    //   stay razor-sharp even after RDP simplification (zero extra points needed).
    // - Gentle curves smooth smoothly with tangent pull clamped to <= 2.2 mm so long straight
    //   segments never warp into wide arcs.
    for (let i = 1; i < pts.length - 1; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const next = pts[i + 1];

        const ax = curr.x - prev.x;
        const ay = curr.y - prev.y;
        const bx = next.x - curr.x;
        const by = next.y - curr.y;
        const lenA = Math.hypot(ax, ay);
        const lenB = Math.hypot(bx, by);

        if (lenA < 1e-4 || lenB < 1e-4) {
            sink.lineTo(curr.x, curr.y);
            continue;
        }

        const cosTheta = (ax * bx + ay * by) / (lenA * lenB);
        if (cosTheta < SHARP_COS_THRESHOLD) {
            sink.lineTo(curr.x, curr.y);
        } else {
            const pull = Math.min(lenA * 0.45, lenB * 0.45, MAX_PULL_MM);
            const inX = curr.x - (ax / lenA) * pull;
            const inY = curr.y - (ay / lenA) * pull;
            const outX = curr.x + (bx / lenB) * pull;
            const outY = curr.y + (by / lenB) * pull;
            sink.lineTo(inX, inY);
            sink.quadraticCurveTo(curr.x, curr.y, outX, outY);
        }
    }
    const last = pts[pts.length - 1];
    sink.lineTo(last.x, last.y);
}

/**
 * Pure path-command generator sharing exact corner-aware quadratic smoothing with `traceStroke`.
 * Returns an array of `{ type: 'M'|'L', x, y }`, `{ type: 'Q', cx, cy, x, y }`,
 * or `{ type: 'CIRCLE', cx, cy, r }`.
 */
export function traceStrokeCommands(pts, width = 0.45) {
    if (!pts || pts.length === 0) return [];
    const cmds = [];
    traceStroke({
        moveTo(x, y) { cmds.push({ type: 'M', x, y }); },
        lineTo(x, y) { cmds.push({ type: 'L', x, y }); },
        quadraticCurveTo(cx, cy, x, y) { cmds.push({ type: 'Q', cx, cy, x, y }); },
        arc(cx, cy, r) {
            if (cmds.length === 1 && cmds[0].type === 'M') {
                cmds[0] = { type: 'CIRCLE', cx, cy, r };
            } else {
                cmds.push({ type: 'CIRCLE', cx, cy, r });
            }
        },
    }, pts, width);
    return cmds;
}

/**
 * Convert a stroke (or point array) to an SVG `d` path string.
 */
export function strokeToSVGPath(stroke, precision = 3) {
    const pts = Array.isArray(stroke) ? stroke : (stroke && stroke.points);
    const width = Array.isArray(stroke) ? 0.45 : (stroke && stroke.width) || 0.45;
    const cmds = traceStrokeCommands(pts, width);
    if (cmds.length === 0) return '';
    const f = (n) => {
        const s = Number(n).toFixed(precision);
        const trimmed = precision > 0 ? s.replace(/\.?0+$/, '') : s;
        return !trimmed || trimmed === '-0' ? '0' : trimmed;
    };
    const parts = new Array(cmds.length);
    for (let i = 0; i < cmds.length; i++) {
        const c = cmds[i];
        if (c.type === 'M') parts[i] = `M ${f(c.x)} ${f(c.y)}`;
        else if (c.type === 'L') parts[i] = `L ${f(c.x)} ${f(c.y)}`;
        else if (c.type === 'Q') parts[i] = `Q ${f(c.cx)} ${f(c.cy)} ${f(c.x)} ${f(c.y)}`;
        else if (c.type === 'CIRCLE') {
            const x0 = f(c.cx + c.r);
            const x1 = f(c.cx - c.r);
            const cy = f(c.cy);
            const r = f(c.r);
            parts[i] = `M ${x0} ${cy} A ${r} ${r} 0 1 0 ${x1} ${cy} A ${r} ${r} 0 1 0 ${x0} ${cy} Z`;
        }
    }
    return parts.join(' ');
}

function getCachedPath(stroke) {
    const pts = stroke.points;
    const hit = pathCache.get(stroke);
    if (hit && hit.points === pts && hit.length === pts.length && hit.width === stroke.width) {
        return hit.path;
    }
    const path = new Path2D();
    traceStroke(path, pts, stroke.width);
    pathCache.set(stroke, { points: pts, length: pts.length, width: stroke.width, path });
    return path;
}

/**
 * Draw a single stroke in world coordinates (ctx must already have camera transform applied).
 * `cache: false` for the in-flight stroke, whose points change on every move.
 */
export function drawStroke(ctx, stroke, theme = 'light', { cache = true } = {}) {
    const pts = stroke.points;
    if (!pts || pts.length === 0) return;

    const color = resolveInkColor(stroke.color, theme);
    const width = stroke.width;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (stroke.style === 'dashed') {
        ctx.setLineDash([width * 3.4, width * 2.4]);
    } else if (stroke.style === 'dotted') {
        ctx.setLineDash([0.01, width * 2.35]);
    } else {
        ctx.setLineDash([]);
    }

    const isDot = pts.length === 1;
    if (cache && HAS_PATH2D) {
        const path = getCachedPath(stroke);
        if (isDot) ctx.fill(path);
        else ctx.stroke(path);
    } else {
        ctx.beginPath();
        traceStroke(ctx, pts, width);
        if (isDot) ctx.fill();
        else ctx.stroke();
    }
    ctx.restore();
}

/**
 * Draw only the newly finalized corner-aware smooth segments of an opaque solid pen stroke
 * (up to vertex `pts.length - 2`). Because each vertex's tangent pull (<= 0.45 * len) depends
 * only on (prev, curr, next), every drawn segment is mathematically identical to `traceStroke()`
 * with zero full-canvas clearRect and zero jagged polygon residue.
 */
export function drawStrokeSmoothProgress(ctx, stroke, state, theme = 'light') {
    const pts = stroke && stroke.points;
    if (!pts || pts.length < 3) return null;
    const endVertex = pts.length - 2;
    const startVertex = state && state.vertex >= 1 ? state.vertex + 1 : 1;
    if (startVertex > endVertex) return null;

    let curX = state && Number.isFinite(state.x) ? state.x : pts[0].x;
    let curY = state && Number.isFinite(state.y) ? state.y : pts[0].y;

    const color = resolveInkColor(stroke.color, theme);
    const width = stroke.width;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(curX, curY);

    for (let i = startVertex; i <= endVertex; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const next = pts[i + 1];

        const ax = curr.x - prev.x;
        const ay = curr.y - prev.y;
        const bx = next.x - curr.x;
        const by = next.y - curr.y;
        const lenA = Math.hypot(ax, ay);
        const lenB = Math.hypot(bx, by);

        if (lenA < 1e-4 || lenB < 1e-4) {
            ctx.lineTo(curr.x, curr.y);
            curX = curr.x;
            curY = curr.y;
            continue;
        }

        const cosTheta = (ax * bx + ay * by) / (lenA * lenB);
        if (cosTheta < SHARP_COS_THRESHOLD) {
            ctx.lineTo(curr.x, curr.y);
            curX = curr.x;
            curY = curr.y;
        } else {
            const pull = Math.min(lenA * 0.45, lenB * 0.45, MAX_PULL_MM);
            const inX = curr.x - (ax / lenA) * pull;
            const inY = curr.y - (ay / lenA) * pull;
            const outX = curr.x + (bx / lenB) * pull;
            const outY = curr.y + (by / lenB) * pull;
            ctx.lineTo(inX, inY);
            ctx.quadraticCurveTo(curr.x, curr.y, outX, outY);
            curX = outX;
            curY = outY;
        }
    }
    ctx.stroke();
    ctx.restore();

    return { vertex: endVertex, x: curX, y: curY };
}
