/**
 * Low-level SVG Construction Primitives
 */

export const SVG_NS = "http://www.w3.org/2000/svg";

/** Creates an SVG element, skipping null/undefined attributes. */
export function createSvgElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, val] of Object.entries(attrs)) {
        if (val !== undefined && val !== null) el.setAttribute(key, val);
    }
    return el;
}
