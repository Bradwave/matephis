import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadMathJax, texReady, sourceHasTeX, renderMathJaxLabel } from '../assets/js/matephis-plot-src/renderers/mathjax-bridge.js';

/** A page whose <head> collects the scripts added to it. */
function fakeDocument() {
    const added = [];
    return {
        added,
        head: { appendChild: (el) => added.push(el) },
        createElement: (tag) => ({ tag }),
        getElementById: (id) => added.find((el) => el.id === id) || null,
    };
}

/** What the MathJax script does once it has loaded. */
function finishLoading() {
    window.MathJax.tex2svg = () => ({ querySelector: () => null });
    window.MathJax.startup.promise = Promise.resolve();
}

describe('MathJax on demand (#68)', () => {
    const prevWindow = globalThis.window, prevDocument = globalThis.document;

    beforeEach(() => {
        globalThis.window = {};
        globalThis.document = fakeDocument();
    });
    afterEach(() => {
        globalThis.window = prevWindow;
        globalThis.document = prevDocument;
    });

    it('a block JSON with "$" or a backslash has TeX', () => {
        expect(sourceHasTeX('{"label": "$x^2$"}')).toBe(true);
        expect(sourceHasTeX('{"label": "\\\\vec F"}')).toBe(true);
        expect(sourceHasTeX('{"fn": "x^2", "label": "f"}')).toBe(false);
        expect(sourceHasTeX({ label: '$a$' })).toBe(true);
    });

    it('loads MathJax once, with the configuration of Post.html and no page typeset', async () => {
        const p1 = loadMathJax();
        const p2 = loadMathJax();
        expect(p1).toBe(p2);
        expect(document.added).toHaveLength(1);
        const script = document.added[0];
        expect(script.id).toBe('MathJax-script');
        expect(script.src).toBe('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js');
        expect(window.MathJax.tex.inlineMath).toEqual([['$', '$'], ['\\(', '\\)']]);
        expect(window.MathJax.tex.displayMath).toEqual([['$$', '$$'], ['\\[', '\\]']]);
        expect(window.MathJax.svg).toEqual({ fontCache: 'global' });
        expect(window.MathJax.startup.typeset).toBe(false);
        finishLoading();
        expect(await p1).toBe(true);
    });

    it('a label drawn before MathJax is plain, and its block draws again once MathJax is ready', async () => {
        let redraws = 0;
        const owner = { requestDraw: () => { redraws++; } };
        const gone = { requestDraw: () => { redraws += 100; }, _destroyed: true };
        const plain = () => 'plain';
        expect(renderMathJaxLabel('$S_4 = 1{,}2$', 0, 0, 16, '#000', 'start', 'auto', null, plain, { owner })).toBe('plain');
        expect(texReady(owner)).toBe(false);
        expect(texReady(gone)).toBe(false);
        expect(document.added).toHaveLength(1);
        finishLoading();
        await loadMathJax();
        await new Promise((r) => setTimeout(r, 0));
        expect(redraws).toBe(1);
        expect(texReady(owner)).toBe(true);
    });

    it('leaves MathJax to hosts that bring their own (board, Obsidian)', async () => {
        window.MATEPHIS_NO_AUTO_INIT = true;
        expect(texReady({ requestDraw() {} })).toBe(false);
        expect(await loadMathJax()).toBe(false);
        expect(document.added).toHaveLength(0);
    });

    it('waits for the page\'s own MathJax instead of loading a second one', async () => {
        const own = { id: 'MathJax-script' };
        document.added.push(own);
        window.MathJax = { startup: {} };
        const p = loadMathJax();
        expect(document.added).toEqual([own]);
        finishLoading();
        expect(await p).toBe(true);
    });

    it('stops retrying after a script load error (offline / CDN failure)', async () => {
        const p1 = loadMathJax();
        expect(document.added).toHaveLength(1);
        const script = document.added[0];
        expect(typeof script.onerror).toBe('function');
        script.onerror();
        expect(await p1).toBe(false);
        expect(texReady({ requestDraw() {} })).toBe(false);
        expect(await loadMathJax()).toBe(false);
        expect(document.added).toHaveLength(1);
    });
});
