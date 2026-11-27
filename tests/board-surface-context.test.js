import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InkSurface } from '../assets/js/matephis-board-src/ink/surface.js';
import { BoardScene } from '../assets/js/matephis-board-src/model/scene.js';

function fakeCtx() {
    return new Proxy({ measureText: () => ({ width: 20 }) }, {
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
        style: { setProperty() {}, removeProperty() {} },
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
        appendChild: (c) => c,
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
            return fakeCtx();
        },
    };
    return el;
}

describe('InkSurface canvas context options and recovery', () => {
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

    it('creates activeCanvas with alpha: true and without desynchronized: true', () => {
        const scene = new BoardScene(412, 915);
        new InkSurface(fakeEl('div', contextCalls), { scene });

        const activeCall = contextCalls.find((c) => c.className.includes('board-canvas-active'));
        expect(activeCall).toBeDefined();
        expect(activeCall.type).toBe('2d');
        expect(activeCall.opts).toEqual({ alpha: true });
        expect(activeCall.opts.desynchronized).toBeFalsy();
    });

    it('redraws when canvas contexts are restored after GPU eviction', () => {
        const scene = new BoardScene(412, 915);
        const surface = new InkSurface(fakeEl('div', contextCalls), { scene });

        const committedSpy = vi.spyOn(surface, 'requestCommittedRedraw');
        const activeSpy = vi.spyOn(surface, 'renderActiveNow');

        surface.bgCanvas.dispatch('contextrestored');
        surface.committedCanvas.dispatch('contextrestored');
        expect(committedSpy).toHaveBeenCalledTimes(2);

        surface.activeCanvas.dispatch('contextrestored');
        expect(activeSpy).toHaveBeenCalledTimes(1);
    });
});
