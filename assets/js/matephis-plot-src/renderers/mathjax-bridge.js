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

/** Calls cb once MathJax is ready (or right away when the page does not load it). */
export function whenMathJaxReady(cb) {
    if (!document.getElementById('MathJax-script')) { cb(); return; }
    const started = Date.now();
    const check = () => {
        const mj = window.MathJax;
        if (mj && mj.startup && mj.startup.promise) { mj.startup.promise.then(cb, cb); return; }
        if (mj && mj.tex2svg) { cb(); return; }
        // Never block rendering forever if MathJax fails to load
        if (Date.now() - started > 8000) { cb(); return; }
        setTimeout(check, 50);
    };
    check();
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
 * Outline under the glyphs, like the halo of plain SVG text: a stroke in the
 * background colour painted before the fill (paint-order). Glyph coordinates
 * are in the formula's viewBox units, so the width in pixels is converted with
 * the scale between the viewBox and the rendered width.
 */
function applyHalo(svgNode, widthPx, halo) {
    const vb = (svgNode.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const root = svgNode.querySelector('g');
    if (vb.length !== 4 || !(vb[2] > 0) || !root) return;
    const units = (halo.width || 2.5) * vb[2] / widthPx;
    root.style.stroke = halo.color;
    root.style.strokeWidth = String(units);
    root.style.strokeLinejoin = 'round';
    root.style.paintOrder = 'stroke';
    // The outline extends past the formula's box: do not clip it
    svgNode.style.overflow = 'visible';
}

/**
 * Renders "$...$" text as MathJax SVG at (x, y).
 * @param {Function} fallback - called with no args when MathJax is unavailable or fails
 * @param {object} [opts]
 * @param {{color: string, width?: number}} [opts.halo] - outline under the glyphs (width in px)
 * @returns {SVGElement|null}
 */
export function renderMathJaxLabel(text, x, y, baseSize, color, anchor, baseline, parent, fallback, opts = {}) {
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
        if (opts.halo) applyHalo(svgNode, w, opts.halo);
        svgNode.classList.add('matephis-plot-math');

        parent.appendChild(svgNode);
        return svgNode;
    } catch (e) {
        console.warn('MathJax Render Error', e);
        return fallback ? fallback() : null;
    }
}
