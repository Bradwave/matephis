/**
 * Helpers shared by object types.
 */
import { lerp, sub, norm, perp, scale, dot } from '../core/vec.js';

const NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)$/;

/** Numeric argument of a parametric anchor ("0.6", "u + 0.1"). */
export function argNum(arg, r, where) {
    if (arg === null || arg === '') return NaN;
    return r.num(NUMBER.test(arg) ? Number(arg) : arg, where);
}

/** Angle argument of a parametric anchor: "90" follows angleUnit, "pi/2" or "90°" are expressions. */
export function argAngle(arg, r, where) {
    if (arg === null || arg === '') return NaN;
    return r.angle(NUMBER.test(arg) ? Number(arg) : arg, where);
}

/** Labels of a surface frame: along and perpendicular to it. */
export const SURFACE_LABELS = ['\\parallel', '\\perp'];

/**
 * A straight surface from a to b whose free side is `normal`.
 * @returns {{surface: (u: number) => {point, tangent, normal}, surfaceLength: number, frame}}
 */
export function straightSurface(a, b, normal) {
    const t = norm(sub(b, a));
    return {
        surface: (u) => ({ point: lerp(a, b, u), tangent: t, normal }),
        surfaceLength: Math.hypot(b.x - a.x, b.y - a.y),
        frame: { t, n: normal, labels: SURFACE_LABELS },
    };
}

/** Unit normal of a→b on the side where `side` points (any vector on the free side). */
export function normalTowards(a, b, side) {
    const n = perp(norm(sub(b, a)));
    return dot(n, side) >= 0 ? n : scale(n, -1);
}

/** Polygon approximating a circle (world), for registering round bodies as label obstacles. */
export function circlePoints(c, r, n = 16) {
    return Array.from({ length: n + 1 }, (_, i) => ({ x: c.x + r * Math.cos(2 * Math.PI * i / n), y: c.y + r * Math.sin(2 * Math.PI * i / n), z: 0 }));
}

/** Mass of an object config (kg), default 1. */
export function massOf(obj, r) {
    if (obj.mass === undefined) return 1;
    const m = r.num(obj.mass, 'mass');
    return isFinite(m) ? m : 1;
}

/** "B" for "$\vec B$", "F_1" for "\vec{F_1}": the bare symbol of a vector label. */
export function labelSymbol(label) {
    if (typeof label !== 'string') return null;
    const s = label.replace(/\$/g, '').replace(/\\(vec|overrightarrow|mathbf|boldsymbol)\s*/g, '').replace(/[{}]/g, '').trim();
    return s || null;
}
