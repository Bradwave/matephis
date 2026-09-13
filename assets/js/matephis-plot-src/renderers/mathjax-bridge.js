/**
 * Asynchronous & Synchronous MathJax SVG Rendering Integration
 */
import { drawText } from './svg-factory.js';

export function renderMathJaxLabel(text, x, y, baseSize, color, anchor, baseline, parent) {
    if (typeof window === 'undefined' || !window.MathJax || !window.MathJax.tex2svg) {
        return drawText(x, y, text, anchor, baseline, color, "normal", "normal", parent, baseSize);
    }

    try {
        const tex = text.replace(/^\$|\$$/g, '').replace(/\\$/g, '');
        const mjNode = window.MathJax.tex2svg(tex);
        const mjSvg = mjNode.querySelector("svg");

        if (mjSvg) {
            const svgNode = mjSvg.cloneNode(true);
            svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/2000/xlink");

            const wAttr = svgNode.getAttribute("width") || "1ex";
            const hAttr = svgNode.getAttribute("height") || "1ex";
            const valign = svgNode.style.verticalAlign || "0ex";

            const ex2px = baseSize * 0.5;
            const wIdx = parseFloat(wAttr) * ex2px;
            const hIdx = parseFloat(hAttr) * ex2px;
            const vShift = parseFloat(valign) * ex2px;

            svgNode.setAttribute("width", wIdx + "px");
            svgNode.setAttribute("height", hIdx + "px");

            let finalX = x;
            if (anchor === 'end') finalX = x - wIdx;
            else if (anchor === 'middle') finalX = x - wIdx / 2;

            let finalY = y;
            if (baseline === 'middle') {
                finalY = y - (hIdx / 2);
            } else {
                finalY = y - hIdx - vShift;
            }

            svgNode.setAttribute("x", finalX);
            svgNode.setAttribute("y", finalY);

            // Copy missing defs if MathJax uses global cache
            const uses = svgNode.querySelectorAll("use");
            let defs = svgNode.querySelector("defs");
            if (!defs) {
                defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                svgNode.prepend(defs);
            }

            uses.forEach(use => {
                const href = use.getAttribute("xlink:href") || use.getAttribute("href");
                if (href && href.startsWith("#")) {
                    const id = href.substring(1);
                    if (!svgNode.querySelector(`[id="${id}"]`)) {
                        const globalDef = document.getElementById(id);
                        if (globalDef) {
                            defs.appendChild(globalDef.cloneNode(true));
                        }
                    }
                }
            });

            svgNode.setAttribute("fill", color);
            svgNode.style.color = color;
            svgNode.querySelectorAll('path').forEach(p => p.setAttribute('fill', color));

            parent.appendChild(svgNode);
            return svgNode;
        } else {
            return drawText(x, y, text, anchor, baseline, color, "normal", "normal", parent, baseSize);
        }
    } catch (e) {
        console.warn("MathJax Render Error", e);
        return drawText(x, y, text, anchor, baseline, color, "normal", "normal", parent, baseSize);
    }
}
