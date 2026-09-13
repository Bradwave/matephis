/**
 * Low-level SVG Construction Primitives
 */

export const SVG_NS = "http://www.w3.org/2000/svg";

export function createSvgElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, val] of Object.entries(attrs)) {
        if (val !== undefined && val !== null) {
            el.setAttribute(key, val);
        }
    }
    return el;
}

export function drawCircle(cx, cy, r, color, width, dash, parent) {
    const c = createSvgElement("circle", {
        cx,
        cy,
        r,
        stroke: color || "#000",
        "stroke-width": width !== undefined ? width : 1,
        fill: "none",
        "stroke-dasharray": dash || null
    });
    parent.appendChild(c);
    return c;
}

export function drawLine(x1, y1, x2, y2, color, width, dash, parent) {
    const l = createSvgElement("line", {
        x1,
        y1,
        x2,
        y2,
        stroke: color,
        "stroke-width": width,
        "stroke-dasharray": dash || null
    });
    parent.appendChild(l);
    return l;
}

export function drawText(x, y, str, anchor, baseline, color, weight = "normal", style = "normal", parent, size = null, outline = true) {
    const t = createSvgElement("text", {
        x,
        y,
        class: "matephis-plot-text",
        "text-anchor": anchor,
        "dominant-baseline": baseline,
        fill: color,
        "font-size": (size !== null) ? size + "px" : "18px",
        "font-weight": weight,
        "font-style": style
    });
    t.textContent = str;
    if (outline) {
        t.style.paintOrder = "stroke";
        t.style.stroke = "#fff";
        t.style.strokeWidth = "2.5px";
    }
    parent.appendChild(t);
    return t;
}

export function ensureArrowMarker(defs, id, color = "#000") {
    let marker = defs.querySelector(`#${id}`);
    if (!marker) {
        marker = createSvgElement("marker", {
            id,
            viewBox: "0 0 10 10",
            refX: 6,
            refY: 5,
            markerWidth: 6,
            markerHeight: 6,
            orient: "auto-start-reverse"
        });
        const path = createSvgElement("path", {
            d: "M 0 1.5 L 8 5 L 0 8.5 z",
            fill: color
        });
        marker.appendChild(path);
        defs.appendChild(marker);
    }
    return marker;
}
