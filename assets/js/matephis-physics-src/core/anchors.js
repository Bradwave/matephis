/**
 * Anchors: named points on objects.
 *
 * A reference string names an object and, optionally, one of its anchors,
 * with an argument for parametric anchors:
 *   "A"                 the object's position
 *   "A.top"             a named anchor
 *   "s.surface(0.6)"    a parametric anchor (0.6 along the slope)
 *   "p.rim(90°)"        argument is an expression; angle anchors follow angleUnit
 */
import { fromLocal } from './vec.js';

const REF = /^\s*([A-Za-z_][A-Za-z0-9_]*)(?:\.([A-Za-z_][A-Za-z0-9_-]*)(?:\((.*)\))?)?\s*$/;

/**
 * Parses "id", "id.anchor" or "id.anchor(arg)".
 * @returns {{id: string, anchor: string|null, arg: string|null}|null}
 */
export function parseRef(str) {
    if (typeof str !== 'string') return null;
    const m = REF.exec(str);
    if (!m) return null;
    return { id: m[1], anchor: m[2] || null, arg: m[3] !== undefined ? m[3].trim() : null };
}

/** Anchors every rectangular body has, in its own rotated frame. */
export const BOX_ANCHORS = ['center', 'com', 'top', 'bottom', 'left', 'right', 'tl', 'tr', 'bl', 'br'];

/**
 * Named anchor of a w × h box centred at `c`, rotated by `ang`.
 * @returns {object|null} world point, or null for an unknown name
 */
export function boxAnchor(c, ang, w, h, name) {
    const hw = w / 2, hh = h / 2;
    const local = {
        center: [0, 0], com: [0, 0],
        top: [0, hh], bottom: [0, -hh], left: [-hw, 0], right: [hw, 0],
        tl: [-hw, hh], tr: [hw, hh], bl: [-hw, -hh], br: [hw, -hh],
    }[name];
    return local ? fromLocal(c, ang, local) : null;
}

/** Anchors every round body has. */
export const ROUND_ANCHORS = ['center', 'com', 'top', 'bottom', 'left', 'right', 'rim(angle)'];

/** Named anchor of a circle of radius r centred at c, rotated by ang (top/bottom follow the rotation). */
export function roundAnchor(c, ang, r, name) {
    const local = {
        center: [0, 0], com: [0, 0], top: [0, r], bottom: [0, -r], left: [-r, 0], right: [r, 0],
    }[name];
    return local ? fromLocal(c, ang, local) : null;
}
