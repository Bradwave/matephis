import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InkSurface } from '../assets/js/matephis-board-src/ink/surface.js';
import { BoardScene } from '../assets/js/matephis-board-src/model/scene.js';

function fakeCtx(desynchronized = false) {
    return new Proxy({
        measureText: () => ({ width: 20 }),
        getContextAttributes: () => ({ alpha: true, desynchronized }),
    }, {
        get: (t, k) => (k in t ? t[k] : () => {}),
        set: (t, k, v) => { t[k] = v; return true; },
    });
}

function fakeEl(tag = 'div', contextCalls = []) {
    const listeners = new Map();
    const el = {
        tagName: tag,
        width: 0,
        height: 0,
        className: '',
        hidden: false,
        parentNode: null,
        style: { setProperty() {}, removeProperty() {} },
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
        appendChild(c) { c.parentNode = el; return c; },
        replaceWith(next) { next.parentNode = el.parentNode; el.parentNode = null; },
        addEventListener(type, fn) {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(fn);
        },
        dispatch(type) {
            for (const fn of listeners.get(type) || []) fn({});
        },
        setAttribute() {},
        getAttribute: () => null,
        getBoundingClientRect: () => ({ width: 412, height: 915, left: 0, top: 0 }),
        getContext(type, opts) {
            contextCalls.push({ className: el.className, type, opts });
            return fakeCtx(Boolean(opts && opts.desynchronized));
        },
    };
    return el;
}

describe('InkSurface desync toggle', () => {
    let saved;
    let raf;
    let contextCalls;

    beforeEach(() => {
        saved = {
            document: globalThis.document,
            window: globalThis.window,
            raf: globalThis.requestAnimationFrame,
            caf: globalThis.cancelAnimationFrame,
        };
        raf = [];
        contextCalls = [];
        globalThis.document = {
            documentElement: fakeEl('html', contextCalls),
            createElement: (t) => fakeEl(t, contextCalls),
        };
        globalThis.window = { devicePixelRatio: 2 };
        globalThis.requestAnimationFrame = (cb) => { raf.push(cb); return raf.length; };
        globalThis.cancelAnimationFrame = (id) => { raf[id - 1] = null; };
    });

    afterEach(() => {
        globalThis.document = saved.document;
        globalThis.window = saved.window;
        globalThis.requestAnimationFrame = saved.raf;
        globalThis.cancelAnimationFrame = saved.caf;
    });

    it('defaults to desynchronized activeCanvas and swaps context cleanly when toggled', () => {
        const scene = new BoardScene(412, 915);
        const surface = new InkSurface(fakeEl('div', contextCalls), { scene });

        const firstActive = contextCalls.find((c) => c.className.includes('board-canvas-active'));
        expect(firstActive).toBeDefined();
        expect(firstActive.opts).toEqual({ alpha: true, desynchronized: true });

        const oldCanvas = surface.activeCanvas;
        surface.setDesynchronized(false);
        expect(surface.activeCanvas).not.toBe(oldCanvas);
        expect(oldCanvas.width).toBe(0);
        const lastActive = contextCalls.filter((c) => c.className.includes('board-canvas-active')).at(-1);
        expect(lastActive.opts).toEqual({ alpha: true });

        surface.setDesynchronized(true);
        const backActive = contextCalls.filter((c) => c.className.includes('board-canvas-active')).at(-1);
        expect(backActive.opts).toEqual({ alpha: true, desynchronized: true });
    });
});
