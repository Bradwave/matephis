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
    width = 0.75,
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
        for (let i = 1; i < pts.length - 1; i++) {
            const midX = (pts[i].x + pts[i + 1].x) * 0.5;
            const midY = (pts[i].y + pts[i + 1].y) * 0.5;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
    }

    ctx.stroke();
    ctx.restore();
}
