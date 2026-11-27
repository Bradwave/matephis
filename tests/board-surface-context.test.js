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

describe('InkSurface context, GPU recovery & incremental active ink', () => {
    let saved;
    let raf;
    let contextCalls;
    let clearRectCalls;

    beforeEach(() => {
        saved = {
            document: globalThis.document,
            window: globalThis.window,
            raf: globalThis.requestAnimationFrame,
            caf: globalThis.cancelAnimationFrame,
        };
        raf = [];
        contextCalls = [];
        clearRectCalls = [];
        globalThis.document = {
            documentElement: fakeEl('html', contextCalls),
            createElement: (t) => {
                const el = fakeEl(t, contextCalls);
                const origGetCtx = el.getContext.bind(el);
                el.getContext = (type, opts) => {
                    const ctx = origGetCtx(type, opts);
                    ctx.clearRect = (...args) => clearRectCalls.push({ className: el.className, args });
                    return ctx;
                };
                return el;
            },
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

    it('always creates activeCanvas with standard composited { alpha: true } (no desynchronized)', () => {
        const scene = new BoardScene(412, 915);
        new InkSurface(fakeEl('div', contextCalls), { scene });

        const activeCall = contextCalls.find((c) => c.className.includes('board-canvas-active'));
        expect(activeCall).toBeDefined();
        expect(activeCall.opts).toEqual({ alpha: true });
    });

    it('redraws committed and active layers on GPU contextrestored', () => {
        const scene = new BoardScene(412, 915);
        const surface = new InkSurface(fakeEl('div', contextCalls), { scene });
        const committedSpy = vi.spyOn(surface, 'renderCommittedNow');
        const activeSpy = vi.spyOn(surface, 'renderActiveNow');

        surface.committedCanvas.dispatch('contextrestored');
        surface.bgCanvas.dispatch('contextrestored');
        expect(committedSpy).toHaveBeenCalledTimes(2);

        surface.activeCanvas.dispatch('contextrestored');
        expect(activeSpy).toHaveBeenCalledTimes(1);
    });

    it('draws solid pen stroke progress incrementally without clearing the full activeCanvas', () => {
        const scene = new BoardScene(412, 915);
        const surface = new InkSurface(fakeEl('div', contextCalls), { scene });
        const stroke = {
            id: 's1',
            tool: 'pen',
            color: 0,
            width: 0.45,
            style: 'solid',
            points: [{ x: 10, y: 10 }],
        };
        clearRectCalls.length = 0;

        surface.setActiveStroke(stroke);
        const clearsAfterStart = clearRectCalls.filter((c) => c.className.includes('board-canvas-active')).length;
        expect(clearsAfterStart).toBe(1);

        stroke.points.push({ x: 12, y: 11 }, { x: 15, y: 13 });
        surface.drawActiveStrokeProgress();
        stroke.points.push({ x: 18, y: 14 });
        surface.drawActiveStrokeProgress();

        // Incremental tail draws must not clear the full activeCanvas again
        const clearsAfterProgress = clearRectCalls.filter((c) => c.className.includes('board-canvas-active')).length;
        expect(clearsAfterProgress).toBe(1);
    });

    it('keeps OptionsMenu toggle list aligned with its rendered HTML markup', async () => {
        const fs = await import('node:fs');
        const src = fs.readFileSync(new URL('../assets/js/matephis-board-src/ui/options.js', import.meta.url), 'utf8');
        const m = src.match(/const OPTION_TOGGLES = \[([\s\S]*?)\];/);
        expect(m).not.toBeNull();
        const keys = Array.from(m[1].matchAll(/'([^']+)'/g), (x) => x[1]);
        expect(keys.length).toBeGreaterThan(5);
        for (const key of keys) {
            expect(src).toContain(`data-opt="${key}"`);
        }
    });
});
