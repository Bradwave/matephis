/**
 * MathJax (tex2svg) label rendering for SVG plots.
 *
 * Typeset results are cached by TeX source, so labels that are redrawn on
 * every frame (sliders, dragging) do not hit MathJax again.
 */
import { SVG_NS } from './svg-factory.js';

const cache = new Map();
const CACHE_LIMIT = 500;

export function hasMathJax() {
    return typeof window !== 'undefined' && !!(window.MathJax && window.MathJax.tex2svg);
}

/** Typesets TeX once and returns a detached, self-contained <svg> to clone. */
function typeset(tex) {
    let node = cache.get(tex);
    if (node) return node;

    const mjSvg = window.MathJax.tex2svg(tex).querySelector('svg');
    if (!mjSvg) return null;
    node = mjSvg.cloneNode(true);
    node.setAttribute('xmlns', SVG_NS);

    // With fontCache: 'global' glyphs live in a shared <defs>: copy the ones we use
    let defs = node.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS(SVG_NS, 'defs');
        node.prepend(defs);
    }
    node.querySelectorAll('use').forEach(use => {
        const href = use.getAttribute('xlink:href') || use.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const id = href.substring(1);
        if (!node.querySelector(`[id="${CSS.escape(id)}"]`)) {
            const globalDef = document.getElementById(id);
            if (globalDef) defs.appendChild(globalDef.cloneNode(true));
        }
    });

    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
    cache.set(tex, node);
    return node;
}

/**
 * Renders "$...$" text as MathJax SVG at (x, y).
 * @param {Function} fallback - called with no args when MathJax is unavailable or fails
 * @returns {SVGElement|null}
 */
export function renderMathJaxLabel(text, x, y, baseSize, color, anchor, baseline, parent, fallback) {
    if (!hasMathJax()) return fallback ? fallback() : null;

    try {
        const tex = text.replace(/^\s*\$+|\$+\s*$/g, '');
        const proto = typeset(tex);
        if (!proto) return fallback ? fallback() : null;
        const svgNode = proto.cloneNode(true);

        const wAttr = svgNode.getAttribute('width') || '1ex';
        const hAttr = svgNode.getAttribute('height') || '1ex';
        const valign = svgNode.style.verticalAlign || '0ex';

        // 1ex in MathJax ~= half the font size
        const ex2px = baseSize * 0.5;
        const w = parseFloat(wAttr) * ex2px;
        const h = parseFloat(hAttr) * ex2px;
        const vShift = parseFloat(valign) * ex2px;

        svgNode.setAttribute('width', `${w}px`);
        svgNode.setAttribute('height', `${h}px`);

        let finalX = x;
        if (anchor === 'end') finalX = x - w;
        else if (anchor === 'middle') finalX = x - w / 2;

        // "middle" centres the box on y; otherwise y is the text baseline
        const finalY = baseline === 'middle' ? y - h / 2 : y - h - vShift;

        svgNode.setAttribute('x', finalX);
        svgNode.setAttribute('y', finalY);
        svgNode.setAttribute('fill', color);
        svgNode.style.color = color;
        svgNode.style.verticalAlign = '';
        svgNode.classList.add('matephis-plot-math');

        parent.appendChild(svgNode);
        return svgNode;
    } catch (e) {
        console.warn('MathJax Render Error', e);
        return fallback ? fallback() : null;
    }
}
