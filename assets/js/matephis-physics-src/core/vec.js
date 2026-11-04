/**
 * 2D vector helpers on {x, y} objects (world coordinates, y up).
 * Points may carry a z coordinate; these helpers keep it when they return a point.
 */

export const vec = (x, y, z = 0) => ({ x, y, z });
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: (a.z || 0) + (b.z || 0) });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) });
export const scale = (a, k) => ({ x: a.x * k, y: a.y * k, z: (a.z || 0) * k });
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const cross = (a, b) => a.x * b.y - a.y * b.x;
export const len = (a) => Math.hypot(a.x, a.y);
/** Length counting z: a force out of the drawing plane (weight seen from above). */
export const len3 = (a) => Math.hypot(a.x, a.y, a.z || 0);
/** Points into (−1) or out of (+1) the drawing plane, with nothing in it? 0 otherwise. */
export const outOfPlane = (a) => (Math.abs(a.z || 0) > 1e-12 && Math.hypot(a.x, a.y) <= 1e-6 * Math.abs(a.z) ? Math.sign(a.z) : 0);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const angleOf = (a) => Math.atan2(a.y, a.x);
export const fromAngle = (a, r = 1) => ({ x: r * Math.cos(a), y: r * Math.sin(a), z: 0 });
/** Left perpendicular (rotated +90°). */
export const perp = (a) => ({ x: -a.y, y: a.x, z: 0 });
export const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: (a.z || 0) + ((b.z || 0) - (a.z || 0)) * t });

export function norm(a) {
    const l = len(a);
    return l > 1e-12 ? { x: a.x / l, y: a.y / l, z: 0 } : { x: 0, y: 0, z: 0 };
}

export function rotate(a, ang) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return { x: a.x * c - a.y * s, y: a.x * s + a.y * c, z: a.z || 0 };
}

/** A point given in a local frame (origin, rotation angle) in world coordinates. */
export function fromLocal(origin, ang, local) {
    return add(origin, rotate({ x: local[0], y: local[1] }, ang));
}

/** Angle in (−π, π]. */
export function wrapAngle(a) {
    let r = a % (2 * Math.PI);
    if (r <= -Math.PI) r += 2 * Math.PI;
    if (r > Math.PI) r -= 2 * Math.PI;
    return r;
}
