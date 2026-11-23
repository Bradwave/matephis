/**
 * Explicit geometry shape generators for Matephis Board (no hold-to-snap).
 * Generates standard vector Stroke point arrays so shapes work seamlessly with
 * partial erasing, lasso selection, undo/redo, light/dark themes, and SVG/PDF export.
 */

import { clamp } from './geometry.js';
import { createStroke } from './stroke.js';

export const SHAPE_KINDS = ['line', 'arrow', 'rect', 'ellipse', 'triangle'];

const ARROW_WING_ANGLE_RAD = (28 * Math.PI) / 180;
const ARROW_COS = Math.cos(ARROW_WING_ANGLE_RAD);
const ARROW_SIN = Math.sin(ARROW_WING_ANGLE_RAD);

/**
 * Generate world-mm polyline points for a geometric shape between `startWorld` and `endWorld`.
 */
export function generateShapePoints(startWorld, endWorld, shapeKind = 'line') {
    const sx = Number(startWorld?.x) || 0;
    const sy = Number(startWorld?.y) || 0;
    const ex = Number(endWorld?.x) || 0;
    const ey = Number(endWorld?.y) || 0;

    if (shapeKind === 'arrow') {
        const dx = ex - sx;
        const dy = ey - sy;
        const dist = Math.hypot(dx, dy);
        if (dist < 1e-4) {
            return [{ x: sx, y: sy }, { x: ex, y: ey }];
        }
        const ux = dx / dist;
        const uy = dy / dist;
        // Normal perpendicular to shaft
        const nx = -uy;
        const ny = ux;
        const wingLen = Math.min(dist * 0.45, Math.max(2.5, Math.min(9.0, dist * 0.24)));

        const left = {
            x: ex - wingLen * (ux * ARROW_COS - nx * ARROW_SIN),
            y: ey - wingLen * (uy * ARROW_COS - ny * ARROW_SIN),
        };
        const right = {
            x: ex - wingLen * (ux * ARROW_COS + nx * ARROW_SIN),
            y: ey - wingLen * (uy * ARROW_COS + ny * ARROW_SIN),
        };
        return [
            { x: sx, y: sy },
            { x: ex, y: ey },
            left,
            { x: ex, y: ey },
            right,
        ];
    }

    if (shapeKind === 'rect') {
        const minX = Math.min(sx, ex);
        const maxX = Math.max(sx, ex);
        const minY = Math.min(sy, ey);
        const maxY = Math.max(sy, ey);
        return [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY },
            { x: minX, y: minY },
        ];
    }

    if (shapeKind === 'ellipse') {
        const cx = (sx + ex) * 0.5;
        const cy = (sy + ey) * 0.5;
        const rx = Math.abs(ex - sx) * 0.5;
        const ry = Math.abs(ey - sy) * 0.5;
        if (rx < 1e-4 && ry < 1e-4) {
            return [{ x: cx, y: cy }, { x: cx, y: cy }];
        }
        const steps = clamp(Math.ceil((2 * Math.PI * Math.max(rx, ry)) / 1.8), 36, 96);
        const pts = new Array(steps + 1);
        for (let i = 0; i < steps; i++) {
            const theta = (i / steps) * Math.PI * 2;
            pts[i] = {
                x: cx + rx * Math.cos(theta),
                y: cy + ry * Math.sin(theta),
            };
        }
        pts[steps] = { x: pts[0].x, y: pts[0].y };
        return pts;
    }

    if (shapeKind === 'triangle') {
        const minX = Math.min(sx, ex);
        const maxX = Math.max(sx, ex);
        const minY = Math.min(sy, ey);
        const maxY = Math.max(sy, ey);
        const apexX = (minX + maxX) * 0.5;
        return [
            { x: apexX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY },
            { x: apexX, y: minY },
        ];
    }

    // Default: 'line'
    return [{ x: sx, y: sy }, { x: ex, y: ey }];
}

/**
 * Create a full Stroke object for the given shape and pen style options.
 */
export function createShapeStroke(startWorld, endWorld, shapeKind = 'line', styleOpts = {}) {
    const points = generateShapePoints(startWorld, endWorld, shapeKind);
    return createStroke({
        id: styleOpts.id,
        tool: styleOpts.tool === 'highlighter' ? 'highlighter' : 'pen',
        color: styleOpts.color ?? 0,
        width: styleOpts.width ?? 0.45,
        style: styleOpts.style || 'solid',
        points,
    });
}
