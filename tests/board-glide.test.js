import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InkSurface } from '../assets/js/matephis-board-src/ink/surface.js';
import { BoardScene } from '../assets/js/matephis-board-src/model/scene.js';

function fakeCtx() {
    return new Proxy({ measureText: () => ({ width: 20 }) }, {
        get: (t, k) => (k in t ? t[k] : () => {}),
        set: (t, k, v) => { t[k] = v; return true; },
    });
}
function fakeEl(tag = 'div') {
    return {
        tagName: tag, width: 0, height: 0, className: '', hidden: false,
        style: { setProperty() {}, removeProperty() {} },
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
        appendChild: (c) => c, addEventListener() {}, setAttribute() {}, getAttribute: () => null,
        getBoundingClientRect: () => ({ width: 1280, height: 720, left: 0, top: 0 }),
        getContext: () => fakeCtx(),
    };
}

describe('InkSurface glide handover', () => {
    let saved, raf;
    beforeEach(() => {
        saved = { document: globalThis.document, window: globalThis.window, raf: globalThis.requestAnimationFrame, caf: globalThis.cancelAnimationFrame };
        raf = [];
        globalThis.document = { documentElement: fakeEl('html'), createElement: (t) => fakeEl(t) };
        globalThis.window = { devicePixelRatio: 1 };
        globalThis.requestAnimationFrame = (cb) => { raf.push(cb); return raf.length; };
        globalThis.cancelAnimationFrame = (id) => { raf[id - 1] = null; };
    });
    afterEach(() => {
        globalThis.document = saved.document; globalThis.window = saved.window;
        globalThis.requestAnimationFrame = saved.raf; globalThis.cancelAnimationFrame = saved.caf;
    });

    it('a pan or pinch that stops a glide keeps its gesture open, without the glide ending it', () => {
        const scene = new BoardScene(1280, 720);
        const surface = new InkSurface(fakeEl(), { scene });
        const onDone = vi.fn();
        surface.glideCameraTo({ x: 50, y: 20, scale: scene.camera.scale * 1.25 }, 140, onDone, 'out');
        expect(surface.isGliding()).toBe(true);
        expect(surface.gesture).not.toBeNull();

        // Fingers land: input stops the glide, then begins its own gesture (a no-op here).
        surface.stopGlide();
        surface.beginGesture();
        expect(surface.isGliding()).toBe(false);
        expect(surface.gesture).not.toBeNull();

        // The cancelled frame never runs: no endGesture from the glide, no onDone.
        for (const cb of raf.splice(0)) if (cb) cb(performance.now() + 1000);
        expect(surface.gesture).not.toBeNull();
        expect(onDone).not.toHaveBeenCalled();

        // The fingers' gesture ends it.
        surface.endGesture();
        expect(surface.gesture).toBeNull();
    });
});
