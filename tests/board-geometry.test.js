import { describe, it, expect } from 'vitest';
import {
    A4_W,
    A4_H,
    worldToScreen,
    screenToWorld,
    createInitialCamera,
    simplifyRDP,
    eraseCircleFromStroke,
    circleHitsStroke,
    computeA4Footprint,
} from '../assets/js/matephis-board-src/ink/geometry.js';
import {
    createStroke,
    encodeStroke,
    decodeStroke,
} from '../assets/js/matephis-board-src/ink/stroke.js';
import { resolveInkColor } from '../assets/js/matephis-board-src/ink/palette.js';

describe('board geometry & coordinate transforms', () => {
    it('round-trips worldToScreen and screenToWorld', () => {
        const cam = createInitialCamera(1920, 1080);
        expect(cam.x).toBeLessThan(0);
        expect(cam.y).toBeLessThan(0);
        expect(cam.scale).toBeGreaterThan(2);

        const s = worldToScreen(120, 85, cam);
        const w = screenToWorld(s.x, s.y, cam);
        expect(w.x).toBeCloseTo(120, 6);
        expect(w.y).toBeCloseTo(85, 6);
    });

    it('simplifies collinear points via RDP while keeping corners', () => {
        const pts = [];
        for (let i = 0; i <= 20; i++) pts.push({ x: i * 5, y: 0 });
        for (let i = 1; i <= 20; i++) pts.push({ x: 100, y: i * 5 });

        const out = simplifyRDP(pts, 0.2);
        expect(out.length).toBe(3);
        expect(out[0]).toEqual({ x: 0, y: 0 });
        expect(out[1]).toEqual({ x: 100, y: 0 });
        expect(out[2]).toEqual({ x: 100, y: 100 });
    });

    it('splits a horizontal stroke cleanly with partial/segment eraser', () => {
        const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
        const res = eraseCircleFromStroke(pts, 50, 0, 10);

        expect(res.changed).toBe(true);
        expect(res.pieces.length).toBe(2);
        expect(res.pieces[0][0]).toEqual({ x: 0, y: 0 });
        expect(res.pieces[0][res.pieces[0].length - 1].x).toBeCloseTo(40, 3);
        expect(res.pieces[1][0].x).toBeCloseTo(60, 3);
        expect(res.pieces[1][res.pieces[1].length - 1]).toEqual({ x: 100, y: 0 });
    });

    it('erases an entire stroke or single dot completely when covered', () => {
        const shortLine = [{ x: 10, y: 10 }, { x: 14, y: 10 }];
        const resLine = eraseCircleFromStroke(shortLine, 12, 10, 10);
        expect(resLine.changed).toBe(true);
        expect(resLine.pieces.length).toBe(0);

        const dot = [{ x: 5, y: 5 }];
        const resDot = eraseCircleFromStroke(dot, 6, 5, 3);
        expect(resDot.changed).toBe(true);
        expect(resDot.pieces.length).toBe(0);
    });

    it('leaves untouched strokes unmodified', () => {
        const pts = [{ x: 0, y: 0 }, { x: 50, y: 0 }];
        expect(circleHitsStroke(pts, 25, 20, 5)).toBe(false);
        const res = eraseCircleFromStroke(pts, 25, 20, 5);
        expect(res.changed).toBe(false);
        expect(res.pieces.length).toBe(1);
    });

    it('computes landscape A4 footprint and flags wide/tall overflow', () => {
        const s1 = createStroke({ points: [{ x: 10, y: 10 }, { x: 100, y: 50 }] });
        const fp1 = computeA4Footprint([s1]);
        expect(fp1.cols).toBe(1);
        expect(fp1.rows).toBe(1);
        expect(fp1.warning).toBe(false);

        const s2 = createStroke({ points: [{ x: A4_W + 25, y: A4_H + 30 }, { x: A4_W + 60, y: A4_H + 50 }] });
        const fp2 = computeA4Footprint([s1, s2]);
        expect(fp2.cols).toBe(2);
        expect(fp2.rows).toBe(2);
        expect(fp2.wideOverflow).toBe(true);
        expect(fp2.warning).toBe(true);
    });
});

describe('stroke delta codec & semantic palette', () => {
    it('round-trips strokes at 0.1 mm precision with compact delta encoding', () => {
        const orig = createStroke({
            tool: 'pen',
            color: 1,
            width: 0.75,
            style: 'dashed',
            points: [
                { x: 12.34, y: 45.67 },
                { x: 15.81, y: 48.12 },
                { x: 22.04, y: 49.99 },
            ],
        });

        const encoded = encodeStroke(orig);
        expect(encoded.s).toBe('da');
        expect(encoded.p.length).toBe(6);

        const decoded = decodeStroke(encoded);
        expect(decoded.tool).toBe('pen');
        expect(decoded.color).toBe(1);
        expect(decoded.style).toBe('dashed');
        expect(decoded.points[0].x).toBeCloseTo(12.3, 1);
        expect(decoded.points[2].y).toBeCloseTo(50.0, 1);
    });

    it('resolves high-contrast semantic colors in light and dark themes', () => {
        expect(resolveInkColor(0, 'light')).toBe('#111111');
        expect(resolveInkColor(0, 'dark')).toBe('#f0f0f0');
        expect(resolveInkColor(1, 'light')).toBe('#B01A00');
        expect(resolveInkColor(1, 'dark')).toBe('#ff523d');
    });
});
