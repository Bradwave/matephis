/**
 * MathJax for the engines: tex2svg labels inside SVG drawings, formulas in
 * HTML around them (readouts, tables), and typesetting of HTML elements
 * (slider labels, captions).
 *
 * The three engines are separate bundles, each with its own copy of this
 * module, so what they share (the caches, the typeset queue) lives on window.
 *
 * SVG labels are cached by TeX source, so labels that are redrawn on every
 * frame (sliders, dragging) do not hit MathJax again: a call to MathJax costs
 * the conversion and also adds to its global font cache, which makes the
 * browser restyle the page.
 */
import { SVG_NS } from './svg-factory.js';

const CACHE_LIMIT = 500;

/** State shared by the three bundles; `v` changes when its shape does. */
function shared() {
    const KEY = '__matephisMath';
    const VERSION = 1;
    let s = window[KEY];
    if (!s || s.v !== VERSION) {
        s = window[KEY] = { v: VERSION, labels: new Map(), queue: [], scheduled: false };
    }
    return s;
}

function remember(map, key, value) {
    if (map.size >= CACHE_LIMIT) map.delete(map.keys().next().value);
    map.set(key, value);
}

/** Runs fn once on the next animation frame, or after a timer in a background tab (no frames there). */
export function onNextFrame(fn) {
    let done = false;
    const run = () => {
        if (done) return;
        done = true;
        fn();
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
    setTimeout(run, 100);
}

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

/**
 * One TeX string for a label that mixes text and math, so MathJax can
 * typeset it as a single piece: "asse fisso $x = 2$" -> "\text{asse fisso }x = 2".
 * A label without "$" is returned as it is (callers pass bare TeX too).
 */
export function toTeX(str) {
    const s = String(str);
    if (!s.includes('$')) return s;
    return s.split('$').map((part, i) => {
        if (i % 2 === 1) return part;
        return part ? `\\text{${part.replace(/[\\{}#%&]/g, '\\$&')}}` : '';
    }).join('');
}

/**
 * Typesets "$...$" in HTML elements (captions, slider labels) with
 * MathJax.typesetPromise, one typeset at a time and after the page's own
 * startup typeset, as MathJax advises: two typesets of the same nodes at once
 * leave math raw, and one that runs during the startup pass can break it.
 *
 * Requests from every block (and every engine) made in the same frame go
 * into one queue and are typeset together, with one call to MathJax.
 * @returns {Promise<boolean>} true once typeset, false without MathJax
 */
export function typesetElements(els) {
    if (typeof window === 'undefined' || !els || !els.length) return Promise.resolve(false);
    return new Promise(resolve => {
        const s = shared();
        s.queue.push({ els: Array.from(els), resolve });
        if (s.scheduled) return;
        s.scheduled = true;
        whenMathJaxReady(() => onNextFrame(() => flushTypeset(s)));
    });
}

/** Elements that are not inside another one of the list (MathJax would find their math twice). */
export function outermost(els) {
    const list = [...new Set(els)];
    return list.filter(el => !list.some(other => other !== el && other.contains && other.contains(el)));
}

function flushTypeset(s) {
    s.scheduled = false;
    const batch = s.queue.splice(0);
    if (!batch.length) return;
    const mj = window.MathJax;
    if (!mj || !mj.typesetPromise) {
        batch.forEach(b => b.resolve(false));
        return;
    }
    const run = (els) => mj.typesetPromise(outermost(els));
    const queued = (mj.startup && mj.startup.promise ? mj.startup.promise : Promise.resolve())
        .then(() => run(batch.flatMap(b => b.els)))
        .then(
            () => batch.forEach(b => b.resolve(true)),
            // One bad formula fails the whole call: each request again on its own
            () => batch.reduce((p, b) => p.then(() => run(b.els)).then(() => b.resolve(true), () => b.resolve(false)), Promise.resolve()));
    if (mj.startup) mj.startup.promise = queued.catch(() => {});
}

/**
 * Formulas for HTML (readouts, map names) that are drawn again on every
 * redraw: a formula that has not changed since the last draw is the same node
 * again, so MathJax is not called and the node keeps what MathJax attached to
 * it (its menu). Not clones of a cache: clones lose the menu.
 *
 *   const pool = scene._readoutTex || (scene._readoutTex = new TexNodes());
 *   line.appendChild(pool.get(tex));   // null without MathJax or on an error
 *   pool.done();                       // after the draw: unused formulas go
 */
export class TexNodes {
    constructor() {
        this.prev = new Map();
        this.next = new Map();
    }

    get(tex, display = false) {
        if (!hasMathJax()) return null;
        const key = `${display ? 'D' : 'I'}${tex}`;
        const reuse = this.prev.get(key);
        let node = reuse && reuse.pop();
        if (!node) {
            try {
                node = window.MathJax.tex2svg(tex, { display });
            } catch (e) {
                return null;
            }
            if (!node) return null;
        }
        if (!this.next.has(key)) this.next.set(key, []);
        this.next.get(key).push(node);
        return node;
    }

    done() {
        this.prev = this.next;
        this.next = new Map();
    }
}

/** Typesets TeX once and returns a detached, self-contained <svg> to clone. */
function typeset(tex) {
    const cache = shared().labels;
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

    remember(cache, tex, node);
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
        // "$x$" -> "x"; "text $x$" -> "\text{text }x"; bare TeX is kept
        const t = String(text).trim();
        const single = /^\$+[^$]*\$+$/.test(t);
        const tex = single ? t.replace(/^\$+|\$+$/g, '') : toTeX(t);
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
