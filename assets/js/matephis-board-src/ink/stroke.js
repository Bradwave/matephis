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
    const flat = raw.p || [];
    const count = Math.floor(flat.length / 2);
    const points = new Array(count);
    let qx = 0;
    let qy = 0;
    for (let i = 0; i < count; i++) {
        if (i === 0) {
            qx = flat[0];
            qy = flat[1];
        } else {
            qx += flat[i * 2];
            qy += flat[i * 2 + 1];
        }
        points[i] = { x: qx / 10, y: qy / 10 };
    }

    let style = 'solid';
    if (raw.s === 'da' || raw.s === 'dashed') style = 'dashed';
    else if (raw.s === 'do' || raw.s === 'dotted') style = 'dotted';

    return createStroke({
        id: raw.id || nextStrokeId(),
        tool: raw.t === 'h' || raw.t === 'highlighter' ? 'highlighter' : 'pen',
        color: raw.c ?? 0,
        width: Number(raw.w) || 0.75,
        style,
        points,
    });
}

/**
 * Draw a single stroke in world coordinates (ctx must already have camera transform applied).
 * Uses quadratic midpoint smoothing so fast handwriting looks crisp without jagged corners.
 */
export function drawStroke(ctx, stroke, theme = 'light') {
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

    if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, width * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    if (pts.length === 2) {
        ctx.lineTo(pts[1].x, pts[1].y);
    } else {
        // Corner-aware clamped quadratic smoothing:
        // - Sharp turns (> ~41°, cos < 0.75) hit the exact vertex so letters like "t", "v", "z", "7"
        //   stay razor-sharp even after RDP simplification (zero extra points needed).
        // - Gentle curves smooth smoothly with tangent pull clamped to <= 2.2 mm so long straight
        //   segments never warp into wide arcs.
        const SHARP_COS_THRESHOLD = 0.75;
        const MAX_PULL_MM = 2.2;

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
                ctx.lineTo(curr.x, curr.y);
                continue;
            }

            const cosTheta = (ax * bx + ay * by) / (lenA * lenB);
            if (cosTheta < SHARP_COS_THRESHOLD) {
                ctx.lineTo(curr.x, curr.y);
            } else {
                const pull = Math.min(lenA * 0.45, lenB * 0.45, MAX_PULL_MM);
                const inX = curr.x - (ax / lenA) * pull;
                const inY = curr.y - (ay / lenA) * pull;
                const outX = curr.x + (bx / lenB) * pull;
                const outY = curr.y + (by / lenB) * pull;
                ctx.lineTo(inX, inY);
                ctx.quadraticCurveTo(curr.x, curr.y, outX, outY);
            }
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
    }

    ctx.stroke();
    ctx.restore();
}
