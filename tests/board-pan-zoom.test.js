import { describe, it, expect, vi } from 'vitest';
import { InputController } from '../assets/js/matephis-board-src/ink/input.js';
import { BoardScene } from '../assets/js/matephis-board-src/model/scene.js';
import { HistoryStack } from '../assets/js/matephis-board-src/ink/history.js';

function createHarness({ tool = 'pen', settings = {}, initialScale = 4, baseScale = 4 } = {}) {
    const listeners = new Map();
    const container = {
        addEventListener: (type, fn) => {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(fn);
        },
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 }),
        setPointerCapture: vi.fn(),
    };
    const scene = new BoardScene(1920, 1080, settings);
    Object.assign(scene.camera, { x: 0, y: 0, scale: initialScale, baseScale });
    const history = new HistoryStack();
    const surface = {
        container,
        overviewMode: false,
        setActiveStroke: vi.fn(),
        setActiveShape: vi.fn(),
        setLassoOverlay: vi.fn(),
        setEraserCursor: vi.fn(),
        setZoomIndicator: vi.fn(),
        appendStroke: vi.fn((s) => s),
        commitActiveStroke: vi.fn((s) => s),
        renderCommittedNow: vi.fn(),
        renderActiveNow: vi.fn(),
        requestCommittedRedraw: vi.fn(),
        beginGesture: vi.fn(),
        endGesture: vi.fn(),
        stopGlide: vi.fn(),
    };

    let nowMs = 1000;
    const origWindow = globalThis.window;
    const origPerf = globalThis.performance;
    globalThis.window = { addEventListener: vi.fn() };
    globalThis.performance = { now: () => nowMs };

    let toolState = {
        tool,
        penColor: 0,
        penWidth: 0.45,
        penStyle: 'solid',
        eraserRadius: 10,
        eraserMode: 'partial',
        highlighterColor: 'yellow',
        highlighterWidth: 5,
    };

    const onTwoFingerTap = vi.fn();
    const input = new InputController(surface, {
        scene,
        history,
        getToolState: () => toolState,
        onTwoFingerTap,
    });

    const dispatch = (type, evt) => {
        const handlers = listeners.get(type) || [];
        const e = {
            pointerId: 1,
            pointerType: 'touch',
            button: 0,
            buttons: 1,
            clientX: 0,
            clientY: 0,
            preventDefault: vi.fn(),
            ...evt,
        };
        for (const fn of handlers) fn(e);
    };

    return {
        scene,
        surface,
        input,
        onTwoFingerTap,
        advance(ms) { nowMs += ms; },
        setTool(nextTool) { toolState = { ...toolState, tool: nextTool }; },
        dispatch,
        restore() {
            if (origWindow === undefined) delete globalThis.window;
            else globalThis.window = origWindow;
            if (origPerf === undefined) delete globalThis.performance;
            else globalThis.performance = origPerf;
        },
    };
}

/** Move two fingers from `from` to `to` in `frames` steps of 16 ms, as a real touch stream does. */
function stream(h, ids, from, to, frames) {
    for (let i = 1; i <= frames; i++) {
        h.advance(16);
        const f = i / frames;
        for (let k = 0; k < 2; k++) {
            h.dispatch('pointermove', {
                pointerId: ids[k],
                clientX: from[k][0] + (to[k][0] - from[k][0]) * f,
                clientY: from[k][1] + (to[k][1] - from[k][1]) * f,
            });
        }
    }
}

describe('Board pan/zoom classifier, Hand tool, zoomLock and trackpad wheel', () => {
    it('keeps close-finger IR smartboard pan locked to pan-only even with ±15 px jitter', () => {
        const h = createHarness({ initialScale: 4, baseScale: 4 });
        try {
            // Two adjacent fingers on a 65" Dabliu board (~30 px apart)
            h.dispatch('pointerdown', { pointerId: 1, clientX: 500, clientY: 400 });
            h.advance(15);
            h.dispatch('pointerdown', { pointerId: 2, clientX: 530, clientY: 400 });

            // Touchdown settle bloom (+6 px spread) inside first 45 ms -> still no zoom
            h.advance(25);
            h.dispatch('pointermove', { pointerId: 2, clientX: 536, clientY: 402 });
            expect(h.scene.camera.scale).toBe(4);

            // Parallel pan by 40 px downward (past 28 px commit threshold) -> hard-locks pan
            h.advance(40);
            h.dispatch('pointermove', { pointerId: 1, clientX: 500, clientY: 440 });
            h.dispatch('pointermove', { pointerId: 2, clientX: 536, clientY: 442 });
            expect(h.input.pinchAnchor.intent).toBe('pan');
            expect(h.scene.camera.scale).toBe(4);

            // Rest of a long sweep with large unintentional finger drift (+25 px spread = +69%!)
            h.advance(40);
            h.dispatch('pointermove', { pointerId: 1, clientX: 500, clientY: 640 });
            h.dispatch('pointermove', { pointerId: 2, clientX: 561, clientY: 640 });
            expect(h.scene.camera.scale).toBe(4);
            expect(h.scene.camera.y).toBeLessThan(-50);
            expect(h.surface.setZoomIndicator).not.toHaveBeenCalledWith(expect.objectContaining({ pct: expect.any(Number) }), expect.anything());
        } finally {
            h.restore();
        }
    });

    it('unlocks zoom cleanly on opposing finger spread past absolute + relative threshold with no scale jump', () => {
        const h = createHarness({ initialScale: 4, baseScale: 4 });
        try {
            h.dispatch('pointerdown', { pointerId: 1, clientX: 460, clientY: 400 });
            h.advance(10);
            h.dispatch('pointerdown', { pointerId: 2, clientX: 540, clientY: 400 });

            // After settle window, spread fingers in opposite directions (80 px -> 120 px: +40 px, +50%)
            h.advance(60);
            stream(h, [1, 2], [[460, 400], [540, 400]], [[440, 400], [560, 400]], 4);
            expect(h.input.pinchAnchor.intent).toBe('zoom');
            // Zero jump on unlock frame
            expect(h.scene.camera.scale).toBeCloseTo(4, 4);

            // Continue spreading -> zooms smoothly and emits zoom indicator
            h.advance(20);
            h.dispatch('pointermove', { pointerId: 1, clientX: 400, clientY: 400 });
            h.dispatch('pointermove', { pointerId: 2, clientX: 600, clientY: 400 });
            expect(h.scene.camera.scale).toBeGreaterThan(4.2);
            const lastInd = h.surface.setZoomIndicator.mock.calls.at(-1)[0];
            expect(lastInd).toMatchObject({ pct: expect.any(Number) });
        } finally {
            h.restore();
        }
    });

    it('snaps magnetically to 100% (baseScale) when pinching back from a zoomed view', () => {
        const h = createHarness({ initialScale: 6, baseScale: 4 }); // 150%
        try {
            h.dispatch('pointerdown', { pointerId: 1, clientX: 350, clientY: 400 });
            h.advance(10);
            h.dispatch('pointerdown', { pointerId: 2, clientX: 650, clientY: 400 });

            // Pinch inward past threshold to engage zoom (300 -> 240 px)
            h.advance(60);
            stream(h, [1, 2], [[350, 400], [650, 400]], [[380, 400], [620, 400]], 4);
            // The spread is judged on a short median, so it engages a couple of frames later
            stream(h, [1, 2], [[380, 400], [620, 400]], [[380, 400], [620, 400]], 2);
            expect(h.input.pinchAnchor.intent).toBe('zoom');

            // Pinch inward toward 100% (240 * 4/6 = 160 px; converge EMA over several frames near 163 px ~ 102%)
            for (let i = 0; i < 8; i++) {
                h.advance(16);
                h.dispatch('pointermove', { pointerId: 1, clientX: 418, clientY: 400 });
                h.dispatch('pointermove', { pointerId: 2, clientX: 582, clientY: 400 });
            }
            expect(h.scene.camera.scale).toBe(4);
            expect(h.input.pinchAnchor.snappedToBase).toBe(true);
        } finally {
            h.restore();
        }
    });

    it('survives a brief IR single-finger drop mid-pan without ending the gesture or losing pan-lock', () => {
        vi.useFakeTimers();
        const h = createHarness({ initialScale: 4, baseScale: 4 });
        try {
            h.dispatch('pointerdown', { pointerId: 1, clientX: 500, clientY: 400 });
            h.advance(10);
            h.dispatch('pointerdown', { pointerId: 2, clientX: 535, clientY: 400 });
            h.advance(60);
            h.dispatch('pointermove', { pointerId: 1, clientX: 500, clientY: 440 });
            h.dispatch('pointermove', { pointerId: 2, clientX: 535, clientY: 440 });
            expect(h.input.pinchAnchor.intent).toBe('pan');

            // IR axis shadow drops finger 2 briefly
            h.dispatch('pointerup', { pointerId: 2, clientX: 535, clientY: 440 });
            expect(h.surface.endGesture).not.toHaveBeenCalled();

            // Finger 2 returns 50 ms later with a new pointerId
            vi.advanceTimersByTime(50);
            h.advance(50);
            h.dispatch('pointerdown', { pointerId: 3, clientX: 550, clientY: 445 });
            expect(h.surface.endGesture).not.toHaveBeenCalled();
            expect(h.input.pinchAnchor.intent).toBe('pan');

            // Lift both fingers -> gesture ends cleanly
            h.dispatch('pointerup', { pointerId: 1, clientX: 500, clientY: 500 });
            h.dispatch('pointerup', { pointerId: 3, clientX: 550, clientY: 505 });
            expect(h.surface.endGesture).toHaveBeenCalledTimes(1);
        } finally {
            h.restore();
            vi.useRealTimers();
        }
    });

    it('pans cleanly with 1 pointer when Hand tool (pan) is active and lets 2 fingers zoom eagerly', () => {
        const h = createHarness({ tool: 'pan', initialScale: 4, baseScale: 4 });
        try {
            h.dispatch('pointerdown', { pointerId: 1, clientX: 400, clientY: 300 });
            h.dispatch('pointermove', { pointerId: 1, clientX: 480, clientY: 340 });
            expect(h.scene.camera.x).toBeCloseTo(-20, 4);
            expect(h.scene.camera.y).toBeCloseTo(-10, 4);
            expect(h.scene.strokes).toHaveLength(0);
            h.dispatch('pointerup', { pointerId: 1, clientX: 480, clientY: 340 });
            expect(h.surface.endGesture).toHaveBeenCalledTimes(1);

            // Two fingers in Hand mode unlock zoom on smaller spread (eagerZoom)
            h.dispatch('pointerdown', { pointerId: 2, clientX: 450, clientY: 300 });
            h.advance(10);
            h.dispatch('pointerdown', { pointerId: 3, clientX: 550, clientY: 300 });
            h.advance(60);
            stream(h, [2, 3], [[450, 300], [550, 300]], [[440, 300], [560, 300]], 4);
            expect(h.input.pinchAnchor.intent).toBe('zoom');
        } finally {
            h.restore();
        }
    });

    it('keeps trackpad wheel zoom raw with zero deadzone, and respects zoomLock when enabled', () => {
        const h = createHarness({ initialScale: 4, baseScale: 4 });
        try {
            // Tiny trackpad pinch (ctrlKey + deltaY = -2) responds immediately with zero deadzone
            h.dispatch('wheel', { ctrlKey: true, deltaX: 0, deltaY: -2, clientX: 500, clientY: 400 });
            expect(h.scene.camera.scale).toBeGreaterThan(4);

            // Enable zoomLock: neither wheel pinch nor 2-finger touch can zoom, while panning still works
            const lockedScale = h.scene.camera.scale;
            h.scene.settings.zoomLock = true;
            h.dispatch('wheel', { ctrlKey: true, deltaX: 0, deltaY: -40, clientX: 500, clientY: 400 });
            expect(h.scene.camera.scale).toBe(lockedScale);

            const camXBefore = h.scene.camera.x;
            h.dispatch('wheel', { ctrlKey: false, deltaX: 40, deltaY: 0, clientX: 500, clientY: 400 });
            expect(h.scene.camera.x).toBeGreaterThan(camXBefore);

            h.dispatch('pointerdown', { pointerId: 1, clientX: 400, clientY: 400 });
            h.advance(10);
            h.dispatch('pointerdown', { pointerId: 2, clientX: 500, clientY: 400 });
            h.advance(60);
            h.dispatch('pointermove', { pointerId: 1, clientX: 250, clientY: 400 });
            h.dispatch('pointermove', { pointerId: 2, clientX: 650, clientY: 400 });
            expect(h.scene.camera.scale).toBe(lockedScale);
        } finally {
            h.restore();
        }
    });

    it('hands off smoothly from 2-finger zoom to 1-finger pan in Hand/penOnly without ending the gesture', () => {
        vi.useFakeTimers();
        const h = createHarness({ tool: 'pan', initialScale: 4, baseScale: 4 });
        try {
            h.dispatch('pointerdown', { pointerId: 1, clientX: 450, clientY: 300 });
            h.advance(10);
            h.dispatch('pointerdown', { pointerId: 2, clientX: 550, clientY: 300 });
            h.advance(60);
            stream(h, [1, 2], [[450, 300], [550, 300]], [[420, 300], [580, 300]], 5);
            expect(h.input.pinchAnchor.intent).toBe('zoom');

            // Lift finger 2, leave finger 1 down past the 120 ms grace window
            h.dispatch('pointerup', { pointerId: 2, clientX: 580, clientY: 300 });
            vi.advanceTimersByTime(150);
            h.advance(150);

            // Must hand off inside the running gesture (no endGesture mid-drag)
            expect(h.surface.endGesture).not.toHaveBeenCalled();
            expect(h.input.mode).toBe('pan');

            const camXBefore = h.scene.camera.x;
            h.dispatch('pointermove', { pointerId: 1, clientX: 500, clientY: 300 });
            expect(h.scene.camera.x).toBeLessThan(camXBefore);

            // Lifting the last finger ends the gesture once
            h.dispatch('pointerup', { pointerId: 1, clientX: 500, clientY: 300 });
            expect(h.surface.endGesture).toHaveBeenCalledTimes(1);
        } finally {
            h.restore();
            vi.useRealTimers();
        }
    });

    it('stops a running glide (zoom buttons, connector jump) when fingers start a pan or pinch', () => {
        const h = createHarness({ tool: 'pan', initialScale: 4, baseScale: 4 });
        try {
            h.dispatch('pointerdown', { pointerId: 1, clientX: 400, clientY: 300 });
            expect(h.surface.stopGlide).toHaveBeenCalledTimes(1);
            expect(h.surface.stopGlide.mock.invocationCallOrder[0])
                .toBeLessThan(h.surface.beginGesture.mock.invocationCallOrder[0]);
            h.dispatch('pointerdown', { pointerId: 2, clientX: 500, clientY: 300 });
            expect(h.surface.stopGlide).toHaveBeenCalledTimes(2);
        } finally {
            h.restore();
        }
    });

    it('cleanly tears down pinch state and gesture when palm-to-erase interrupts a 2-finger gesture', () => {
        vi.useFakeTimers();
        const h = createHarness({ settings: { palmErase: true }, initialScale: 4, baseScale: 4 });
        try {
            h.dispatch('pointerdown', { pointerId: 1, clientX: 460, clientY: 400 });
            h.advance(10);
            h.dispatch('pointerdown', { pointerId: 2, clientX: 540, clientY: 400 });
            h.advance(60);
            stream(h, [1, 2], [[460, 400], [540, 400]], [[420, 400], [580, 400]], 5);
            expect(h.input.pinchAnchor.intent).toBe('zoom');

            // 3rd finger triggers palm-to-erase while zooming
            h.dispatch('pointerdown', { pointerId: 3, clientX: 500, clientY: 420 });
            expect(h.input.mode).toBe('erase');
            expect(h.input.pinchAnchor).toBeNull();
            expect(h.input.pinchDropTimer).toBeNull();
            expect(h.surface.endGesture).toHaveBeenCalledTimes(1);
            expect(h.surface.setZoomIndicator).toHaveBeenLastCalledWith(null);
        } finally {
            h.restore();
            vi.useRealTimers();
        }
    });
});

// Seeded simulations of a noisy IR board: per-finger jitter plus occasional one-frame outliers.
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function trial(seed, { J = 10, spikeP = 0.04, spike = 35, slowStart = false }) {
    const r = rng(seed);
    const h = createHarness({ initialScale: 4, baseScale: 4 });
    try {
        const sep = 40 + r() * 200, ang = r() * Math.PI;
        const cx = 600 + r() * 600, cy = 300 + r() * 400;
        const base = [[cx - Math.cos(ang) * sep / 2, cy - Math.sin(ang) * sep / 2], [cx + Math.cos(ang) * sep / 2, cy + Math.sin(ang) * sep / 2]];
        const T = 120 + r() * 600, dir = r() * Math.PI * 2;
        const noise = () => (r() * 2 - 1) * J + (r() < spikeP ? (r() * 2 - 1) * spike : 0);
        h.dispatch('pointerdown', { pointerId: 1, clientX: base[0][0], clientY: base[0][1] });
        h.advance(Math.round(r() * 60));
        h.dispatch('pointerdown', { pointerId: 2, clientX: base[1][0], clientY: base[1][1] });
        const N = 40;
        for (let i = 1; i <= N; i++) {
            h.advance(16);
            let f = i / N;
            if (slowStart) f = f * f * f; // creeping start: jitter dominates early frames
            for (let k = 0; k < 2; k++) {
                h.dispatch('pointermove', { pointerId: k + 1, clientX: base[k][0] + Math.cos(dir) * T * f + noise(), clientY: base[k][1] + Math.sin(dir) * T * f + noise() });
            }
        }
        return h.scene.camera.scale;
    } finally { h.restore(); }
}
function pinchTrial(seed, { J = 10, spikeP = 0.04, spike = 35, factor = 1.6 }) {
    const r = rng(seed);
    const h = createHarness({ initialScale: 4, baseScale: 4 });
    try {
        const sep = 80 + r() * 250, ang = r() * Math.PI;
        const cx = 700 + r() * 400, cy = 400 + r() * 200;
        const ux = Math.cos(ang), uy = Math.sin(ang);
        const noise = () => (r() * 2 - 1) * J + (r() < spikeP ? (r() * 2 - 1) * spike : 0);
        h.dispatch('pointerdown', { pointerId: 1, clientX: cx - ux * sep / 2, clientY: cy - uy * sep / 2 });
        h.advance(20);
        h.dispatch('pointerdown', { pointerId: 2, clientX: cx + ux * sep / 2, clientY: cy + uy * sep / 2 });
        const N = 24; let engagedAt = -1;
        for (let i = 1; i <= N + 6; i++) {
            h.advance(16);
            const d = sep * (1 + (factor - 1) * Math.min(1, i / N));
            h.dispatch('pointermove', { pointerId: 1, clientX: cx - ux * d / 2 + noise(), clientY: cy - uy * d / 2 + noise() });
            h.dispatch('pointermove', { pointerId: 2, clientX: cx + ux * d / 2 + noise(), clientY: cy + uy * d / 2 + noise() });
            if (engagedAt < 0 && h.input.pinchAnchor.intent === 'zoom') engagedAt = i;
        }
        return { engagedAt, ratio: h.scene.camera.scale / 4 };
    } finally { h.restore(); }
}
describe('Board pan/zoom on a noisy IR board (seeded simulation)', () => {
    it('keeps two-finger pans as pans despite jitter and one-frame outliers', () => {
        let zoomed = 0;
        for (let s = 1; s <= 200; s++) if (Math.abs(trial(s, { J: 10, spikeP: 0.04 }) / 4 - 1) > 0.001) zoomed++;
        // Without the median spread, about 1 pan in 14 flipped into a zoom here.
        expect(zoomed).toBe(0);
    });

    it('keeps creeping-start pans as pans', () => {
        let zoomed = 0;
        for (let s = 1; s <= 200; s++) if (Math.abs(trial(s, { J: 10, spikeP: 0.04, slowStart: true }) / 4 - 1) > 0.001) zoomed++;
        // Without the median spread, more than 1 in 3 did.
        expect(zoomed).toBe(0);
    });

    it('still zooms on a real pinch, in or out', () => {
        for (const factor of [1.6, 0.6]) {
            let missed = 0;
            for (let s = 1; s <= 150; s++) {
                const t = pinchTrial(s, { J: 10, spikeP: 0.04, factor });
                // Zoom starts from the spread at the moment it engages (no jump), so it ends
                // short of the full pinch; it must still engage and go the right way.
                if (t.engagedAt < 0 || (factor > 1 ? t.ratio <= 1.0 : t.ratio >= 1.0)) missed++;
            }
            expect(missed).toBeLessThanOrEqual(4);
        }
    });
});
