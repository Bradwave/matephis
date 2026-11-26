import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InkSurface } from '../assets/js/matephis-board-src/ink/surface.js';
import { PinnedStrip } from '../assets/js/matephis-board-src/ui/pinned-strip.js';
import { BoardScene } from '../assets/js/matephis-board-src/model/scene.js';

function makeFakeContext() {
    return {
        save() {},
        restore() {},
        setTransform() {},
        scale() {},
        translate() {},
        fillRect() {},
        clearRect() {},
        strokeRect() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        arc() {},
        stroke() {},
        fill() {},
        setLineDash() {},
        fillText() {},
        measureText: () => ({ width: 20 }),
        drawImage() {},
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        globalAlpha: 1,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'medium',
        font: '',
        textAlign: 'left',
        textBaseline: 'alphabetic',
    };
}

function makeFakeElement(tag = 'div') {
    const classes = new Set();
    const attrs = new Map();
    const styleProps = new Map();
    const children = [];
    const el = {
        tagName: tag.toUpperCase(),
        className: '',
        hidden: false,
        width: 0,
        height: 0,
        textContent: '',
        innerHTML: '',
        children,
        style: {
            width: '',
            height: '',
            setProperty(k, v) { styleProps.set(k, v); },
            removeProperty(k) { styleProps.delete(k); },
        },
        classList: {
            add(c) { classes.add(c); },
            remove(c) { classes.delete(c); },
            toggle(c, force) {
                const on = force === undefined ? !classes.has(c) : Boolean(force);
                if (on) classes.add(c); else classes.delete(c);
                return on;
            },
            contains(c) { return classes.has(c); },
        },
        setAttribute(k, v) { attrs.set(k, v); },
        getAttribute(k) { return attrs.get(k) ?? null; },
        appendChild(ch) { children.push(ch); return ch; },
        addEventListener() {},
        getBoundingClientRect: () => ({ width: 1280, height: 720, left: 0, top: 0 }),
        getContext: () => makeFakeContext(),
        querySelector(sel) {
            if (!el._qs) el._qs = new Map();
            if (!el._qs.has(sel)) el._qs.set(sel, makeFakeElement(sel.includes('canvas') ? 'canvas' : 'button'));
            return el._qs.get(sel);
        },
    };
    return el;
}

describe('Board offscreen snap canvas release', () => {
    let origDocument;
    let origWindow;
    let origRaf;
    let origCancelRaf;
    let origResizeObserver;
    let rafQueue;

    beforeEach(() => {
        vi.useFakeTimers();
        rafQueue = [];
        origDocument = globalThis.document;
        origWindow = globalThis.window;
        origRaf = globalThis.requestAnimationFrame;
        origCancelRaf = globalThis.cancelAnimationFrame;
        origResizeObserver = globalThis.ResizeObserver;

        globalThis.document = {
            documentElement: makeFakeElement('html'),
            createElement: (tag) => makeFakeElement(tag),
        };
        globalThis.window = { devicePixelRatio: 2, innerWidth: 1280, innerHeight: 720 };
        globalThis.ResizeObserver = class {
            observe() {}
            disconnect() {}
        };
        globalThis.requestAnimationFrame = (cb) => {
            const id = rafQueue.length + 1;
            rafQueue.push({ id, cb, cancelled: false });
            return id;
        };
        globalThis.cancelAnimationFrame = (id) => {
            const item = rafQueue.find((r) => r.id === id);
            if (item) item.cancelled = true;
        };
    });

    afterEach(() => {
        vi.useRealTimers();
        globalThis.document = origDocument;
        globalThis.window = origWindow;
        globalThis.requestAnimationFrame = origRaf;
        globalThis.cancelAnimationFrame = origCancelRaf;
        globalThis.ResizeObserver = origResizeObserver;
    });

    function flushRaf(timestamp) {
        const batch = rafQueue.splice(0);
        for (const item of batch) {
            if (!item.cancelled) item.cb(timestamp);
        }
    }

    it('releases InkSurface offscreen snap canvases after idle timeout following a gesture', () => {
        const scene = new BoardScene(1280, 720);
        scene.settings.snapRelease = '2000';
        const surface = new InkSurface(makeFakeElement('div'), { scene });

        surface.beginGesture();
        // Force a margined snapshot render during pan
        surface.snap = surface._renderPicture(0.15);
        expect(surface._snapCanvases.some((c) => c.width > 0 && c.height > 0)).toBe(true);

        surface.endGesture();
        // Complete settle animation
        flushRaf(performance.now() + 500);
        expect(surface._settleRaf).toBeNull();

        // Still warm immediately after settle
        expect(surface._snapCanvases.some((c) => c.width > 0)).toBe(true);

        // Released after idle grace window
        vi.advanceTimersByTime(2100);
        expect(surface.snap).toBeNull();
        for (const c of surface._snapCanvases) {
            expect(c.width).toBe(0);
            expect(c.height).toBe(0);
        }
    });

    it('cancels pending snap release if a new gesture starts before the timeout', () => {
        const scene = new BoardScene(1280, 720);
        scene.settings.snapRelease = '2000';
        const surface = new InkSurface(makeFakeElement('div'), { scene });

        surface.beginGesture();
        surface.endGesture();
        flushRaf(performance.now() + 500);

        vi.advanceTimersByTime(1000);
        surface.beginGesture();
        vi.advanceTimersByTime(2500);

        expect(surface.gesture).not.toBeNull();
        expect(surface.snap).not.toBeNull();
        expect(surface.snap.canvas.width).toBeGreaterThan(0);
    });

    it('keeps lowDpr disabled by default', () => {
        const scene = new BoardScene(1280, 720);
        expect(scene.settings.lowDpr).toBe(false);
        const surface = new InkSurface(makeFakeElement('div'), { scene });
        expect(surface.dpr).toBe(2);
    });

    it('releases PinnedStrip snap and display canvases on idle and close', () => {
        const scene = new BoardScene(1280, 720);
        scene.settings.snapRelease = '2000';
        const surface = new InkSurface(makeFakeElement('div'), { scene });
        const strip = new PinnedStrip(makeFakeElement('div'), { surface, scene });

        strip.pinAndContinue('top');
        expect(strip.canvas.width).toBeGreaterThan(0);

        strip._beginGesture();
        expect(strip._snapCanvas.width).toBeGreaterThan(0);

        strip._endGesture();
        vi.advanceTimersByTime(2100);
        expect(strip._snapCanvas.width).toBe(0);
        expect(strip._snapCanvas.height).toBe(0);

        strip.close();
        expect(strip.canvas.width).toBe(0);
        expect(strip.canvas.height).toBe(0);
    });

    function panOnce(surface) {
        surface.beginGesture();
        surface.snap = surface._renderPicture(0.15);
        surface.endGesture();
        flushRaf(performance.now() + 500);
    }

    it('waits 30 s by default before releasing', () => {
        const scene = new BoardScene(1280, 720);
        expect(scene.settings.snapRelease).toBe('30000');
        const surface = new InkSurface(makeFakeElement('div'), { scene });
        panOnce(surface);

        vi.advanceTimersByTime(29000);
        expect(surface.snapInfo().bytes).toBeGreaterThan(0);
        expect(surface.snapInfo().releaseInMs).toBeGreaterThan(0);
        vi.advanceTimersByTime(1500);
        expect(surface.snapInfo().bytes).toBe(0);
        expect(surface.snapInfo().releaseInMs).toBeNull();
    });

    it('never releases with the setting never, not even when the page is hidden', () => {
        const scene = new BoardScene(1280, 720);
        scene.settings.snapRelease = 'never';
        const surface = new InkSurface(makeFakeElement('div'), { scene });
        panOnce(surface);

        vi.advanceTimersByTime(60000);
        surface.releaseSnapCanvases();
        expect(surface.snapInfo().bytes).toBeGreaterThan(0);
        expect(surface.snapInfo().delayMs).toBeNull();
    });

    it('restarts the countdown when the setting changes', () => {
        const scene = new BoardScene(1280, 720);
        scene.settings.snapRelease = 'never';
        const surface = new InkSurface(makeFakeElement('div'), { scene });
        panOnce(surface);

        scene.settings.snapRelease = '2000';
        surface.snapReleaseSettingChanged();
        vi.advanceTimersByTime(2100);
        expect(surface.snapInfo().bytes).toBe(0);
    });

    it('reports whether the first sharp picture of a pan had to allocate', () => {
        const scene = new BoardScene(1280, 720);
        scene.settings.snapRelease = '2000';
        const surface = new InkSurface(makeFakeElement('div'), { scene });

        panOnce(surface);
        expect(surface.gestureStats.pictureAlloc).toBe(true);   // first pan ever: new canvas

        panOnce(surface);
        expect(surface.gestureStats.pictureAlloc).toBe(false);  // still warm: reused

        vi.advanceTimersByTime(2100);
        panOnce(surface);
        expect(surface.gestureStats.pictureAlloc).toBe(true);   // after the release: new again
        expect(surface.gestureStats.pictureMs).toBeGreaterThanOrEqual(0);
    });
});
