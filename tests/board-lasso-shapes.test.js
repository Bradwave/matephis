import { describe, it, expect, vi } from 'vitest';
import {
    pointInPolygon,
    segmentsIntersect,
    segmentIntersectsRect,
    strokeIntersectsPolygon,
    strokeIntersectsRect,
    findStrokesInPolygon,
    findStrokesInRect,
    computeSelectionBBox,
    LassoController,
} from '../assets/js/matephis-board-src/ink/lasso.js';
import {
    SHAPE_KINDS,
    generateShapePoints,
    createShapeStroke,
} from '../assets/js/matephis-board-src/ink/shapes.js';
import { createStroke, decodeStroke, encodeStroke } from '../assets/js/matephis-board-src/ink/stroke.js';
import { eraseCircleFromStroke } from '../assets/js/matephis-board-src/ink/geometry.js';
import { HistoryStack } from '../assets/js/matephis-board-src/ink/history.js';
import { InputController } from '../assets/js/matephis-board-src/ink/input.js';
import { BoardScene } from '../assets/js/matephis-board-src/model/scene.js';

describe('Track 2A — Lasso & Rectangle pure hit-testing', () => {
    const lShapePoly = [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 40, y: 20 },
        { x: 20, y: 20 },
        { x: 20, y: 40 },
        { x: 0, y: 40 },
    ];

    it('detects points inside, outside, and on boundary of concave polygons', () => {
        expect(pointInPolygon(10, 10, lShapePoly)).toBe(true);
        expect(pointInPolygon(10, 30, lShapePoly)).toBe(true);
        expect(pointInPolygon(30, 10, lShapePoly)).toBe(true);
        // Inside the concave cutout -> outside
        expect(pointInPolygon(30, 30, lShapePoly)).toBe(false);
        expect(pointInPolygon(-5, 10, lShapePoly)).toBe(false);
        // Boundary edge hit
        expect(pointInPolygon(20, 30, lShapePoly)).toBe(true);
        // Degenerate polygon
        expect(pointInPolygon(5, 5, [{ x: 0, y: 0 }, { x: 10, y: 10 }])).toBe(false);
    });

    it('detects segment-segment and segment-rect intersections accurately', () => {
        expect(segmentsIntersect(0, 0, 10, 10, 0, 10, 10, 0)).toBe(true);
        expect(segmentsIntersect(0, 0, 10, 0, 5, 0, 15, 0)).toBe(true); // collinear overlap
        expect(segmentsIntersect(0, 0, 4, 0, 6, 0, 10, 0)).toBe(false); // collinear disjoint
        expect(segmentsIntersect(0, 0, 10, 0, 0, 5, 10, 5)).toBe(false); // parallel

        const rect = { minX: 10, minY: 10, maxX: 30, maxY: 20 };
        // Both endpoints outside, crosses straight through rect
        expect(segmentIntersectsRect(0, 15, 40, 15, rect)).toBe(true);
        // Diagonal crossing corner
        expect(segmentIntersectsRect(5, 15, 15, 5, rect)).toBe(true);
        // Completely outside
        expect(segmentIntersectsRect(0, 5, 40, 5, rect)).toBe(false);
    });

    it('selects 1-point dots, 2-point pass-through lines, and multi-point strokes in polygon and rect', () => {
        const dotInside = createStroke({ id: 'dot-in', points: [{ x: 10, y: 10 }] });
        const dotOutside = createStroke({ id: 'dot-out', points: [{ x: 30, y: 30 }] });
        const crossLine = createStroke({ id: 'cross', points: [{ x: -10, y: 10 }, { x: 60, y: 10 }] });
        const outsideLine = createStroke({ id: 'out', points: [{ x: 50, y: 50 }, { x: 80, y: 80 }] });

        const strokes = [dotInside, dotOutside, crossLine, outsideLine];

        const polyHits = findStrokesInPolygon(strokes, lShapePoly).map((s) => s.id);
        expect(polyHits).toEqual(['dot-in', 'cross']);

        // Reversed rect drag coordinates (max < min) are normalized cleanly
        const rectHits = findStrokesInRect(strokes, { minX: 35, minY: 35, maxX: 25, maxY: 25 }).map((s) => s.id);
        expect(rectHits).toEqual(['dot-out']);

        expect(strokeIntersectsPolygon(dotInside, lShapePoly)).toBe(true);
        expect(strokeIntersectsRect(crossLine, { minX: 5, minY: 5, maxX: 20, maxY: 15 })).toBe(true);
        expect(strokeIntersectsRect(outsideLine, { minX: 5, minY: 5, maxX: 20, maxY: 15 })).toBe(false);

        const bb = computeSelectionBBox(strokes, ['dot-in', 'cross']);
        expect(bb).not.toBeNull();
        expect(bb.minX).toBeLessThanOrEqual(-10);
        expect(bb.maxX).toBeGreaterThanOrEqual(60);
        expect(computeSelectionBBox(strokes, [])).toBeNull();
    });
});

describe('Track 2A — LassoController selection, drag-move, duplicate, recolor, delete & HistoryStack', () => {
    it('supports marquee selection, drag-move, duplicate, recolor, and delete with atomic undo/redo', () => {
        const scene = new BoardScene(1920, 1080);
        const history = new HistoryStack();
        const surface = {
            renderCommittedNow: vi.fn(),
            setLassoOverlay: vi.fn(),
        };
        const onSceneMutated = vi.fn();
        const onSelectionChange = vi.fn();

        const sPen1 = createStroke({ id: 's1', tool: 'pen', color: 0, points: [{ x: 10, y: 10 }, { x: 20, y: 10 }] });
        const sPen2 = createStroke({ id: 's2', tool: 'pen', color: 1, points: [{ x: 15, y: 15 }, { x: 25, y: 20 }] });
        const sHl = createStroke({ id: 'h1', tool: 'highlighter', color: 'h0', width: 7, points: [{ x: 12, y: 12 }, { x: 22, y: 12 }] });
        const sFar = createStroke({ id: 's3', tool: 'pen', color: 0, points: [{ x: 120, y: 120 }, { x: 140, y: 120 }] });

        scene.strokes.push(sPen1, sPen2, sHl, sFar);

        const lasso = new LassoController({
            scene,
            history,
            surface,
            onSceneMutated,
            onSelectionChange,
        });

        // 1. Rect marquee selects s1, s2, h1 (not s3)
        expect(lasso.beginInteraction(5, 5, 'rect')).toBe('marquee');
        lasso.updateInteraction(30, 30);
        lasso.endInteraction();

        expect(Array.from(lasso.selectedIds)).toEqual(['s1', 's2', 'h1']);
        expect(onSelectionChange).toHaveBeenLastCalledWith(3);

        // 2. Drag-move inside selection bbox translates selected strokes and replaces points array
        const origPtsRef = sPen1.points;
        expect(lasso.beginInteraction(15, 15, 'rect')).toBe('drag');
        lasso.updateInteraction(25, 35); // dx = +10, dy = +20
        lasso.endInteraction();

        expect(sPen1.points).not.toBe(origPtsRef);
        expect(sPen1.points[0]).toEqual({ x: 20, y: 30 });
        expect(sPen2.points[1]).toEqual({ x: 35, y: 40 });
        expect(sFar.points[0]).toEqual({ x: 120, y: 120 });

        // Undo & redo move
        expect(history.undo(scene.currentPage)).toBe(true);
        expect(sPen1.points[0]).toEqual({ x: 10, y: 10 });
        expect(history.redo(scene.currentPage)).toBe(true);
        expect(sPen1.points[0]).toEqual({ x: 20, y: 30 });

        // 3. Recolor with pen color 2: updates s1 & s2, skips highlighter h1 gracefully
        expect(lasso.recolorSelection(2)).toBe(true);
        expect(sPen1.color).toBe(2);
        expect(sPen2.color).toBe(2);
        expect(sHl.color).toBe('h0');

        expect(history.undo(scene.currentPage)).toBe(true);
        expect(sPen1.color).toBe(0);
        expect(sPen2.color).toBe(1);
        expect(history.redo(scene.currentPage)).toBe(true);
        expect(sPen1.color).toBe(2);

        // 4. Duplicate adds +6,+6 mm clones and selects them
        const clones = lasso.duplicateSelection(6, 6);
        expect(clones).toHaveLength(3);
        expect(scene.strokes).toHaveLength(7);
        expect(clones[0].id).not.toBe('s1');
        expect(clones[0].points[0]).toEqual({ x: 26, y: 36 });
        expect(Array.from(lasso.selectedIds)).toEqual(clones.map((c) => c.id));

        // Undo duplicate removes clones
        expect(history.undo(scene.currentPage)).toBe(true);
        expect(scene.strokes).toHaveLength(4);
        lasso.syncWithScene();
        expect(lasso.hasSelection).toBe(false);

        // Redo duplicate restores clones
        expect(history.redo(scene.currentPage)).toBe(true);
        expect(scene.strokes).toHaveLength(7);

        // 5. Delete selected clones and verify exact index restoration on undo
        lasso.setSelection(['s1', 's3']);
        expect(lasso.deleteSelection()).toBe(true);
        expect(scene.strokes.map((s) => s.id)).not.toContain('s1');
        expect(scene.strokes.map((s) => s.id)).not.toContain('s3');
        expect(lasso.hasSelection).toBe(false);

        expect(history.undo(scene.currentPage)).toBe(true);
        expect(scene.strokes[0].id).toBe('s1');
        expect(scene.strokes[3].id).toBe('s3');

        // 6. Tap outside selection clears it
        lasso.setSelection(['s1']);
        expect(lasso.hasSelection).toBe(true);
        expect(lasso.beginInteraction(250, 250, 'lasso')).toBe('marquee');
        lasso.endInteraction();
        expect(lasso.hasSelection).toBe(false);
    });
});

describe('Track 2A — Explicit geometry shapes (line, arrow, rect, ellipse, triangle)', () => {
    it('generates exact vector geometry for all 5 shape kinds', () => {
        expect(SHAPE_KINDS).toEqual(['line', 'arrow', 'rect', 'ellipse', 'triangle']);

        // Line
        const linePts = generateShapePoints({ x: 10, y: 20 }, { x: 50, y: 60 }, 'line');
        expect(linePts).toEqual([{ x: 10, y: 20 }, { x: 50, y: 60 }]);

        // Arrow: shaft + two symmetric wings meeting at end tip
        const arrowPts = generateShapePoints({ x: 0, y: 0 }, { x: 40, y: 0 }, 'arrow');
        expect(arrowPts).toHaveLength(5);
        expect(arrowPts[0]).toEqual({ x: 0, y: 0 });
        expect(arrowPts[1]).toEqual({ x: 40, y: 0 });
        expect(arrowPts[3]).toEqual({ x: 40, y: 0 });
        const leftWing = arrowPts[2];
        const rightWing = arrowPts[4];
        expect(leftWing.x).toBeCloseTo(rightWing.x, 6);
        expect(leftWing.y).toBeCloseTo(-rightWing.y, 6);
        expect(Math.hypot(40 - leftWing.x, leftWing.y)).toBeGreaterThan(2);

        // Rect (including reversed drag coordinates)
        const rectPts = generateShapePoints({ x: 50, y: 40 }, { x: 10, y: 20 }, 'rect');
        expect(rectPts).toEqual([
            { x: 10, y: 20 },
            { x: 50, y: 20 },
            { x: 50, y: 40 },
            { x: 10, y: 40 },
            { x: 10, y: 20 },
        ]);

        // Ellipse: closed curve whose samples lie on (x-cx)^2/rx^2 + (y-cy)^2/ry^2 = 1
        const ellipsePts = generateShapePoints({ x: 10, y: 20 }, { x: 50, y: 40 }, 'ellipse');
        expect(ellipsePts.length).toBeGreaterThanOrEqual(37);
        expect(ellipsePts[0]).toEqual(ellipsePts[ellipsePts.length - 1]);
        const cx = 30;
        const cy = 30;
        const rx = 20;
        const ry = 10;
        for (const p of ellipsePts) {
            const norm = ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2;
            expect(norm).toBeCloseTo(1, 6);
        }

        // Triangle: closed upright isosceles triangle inside box
        const triPts = generateShapePoints({ x: 10, y: 50 }, { x: 30, y: 10 }, 'triangle');
        expect(triPts).toEqual([
            { x: 20, y: 10 },
            { x: 30, y: 50 },
            { x: 10, y: 50 },
            { x: 20, y: 10 },
        ]);
    });

    it('creates standard Stroke objects compatible with delta codec, partial eraser, and lasso', () => {
        const rectStroke = createShapeStroke(
            { x: 10, y: 10 },
            { x: 50, y: 30 },
            'rect',
            { color: 2, width: 0.7, style: 'dashed' }
        );
        expect(rectStroke.tool).toBe('pen');
        expect(rectStroke.color).toBe(2);
        expect(rectStroke.width).toBe(0.7);
        expect(rectStroke.style).toBe('dashed');
        expect(rectStroke.points).toHaveLength(5);

        // Delta encode/decode round-trip preserves exact corners
        const decoded = decodeStroke(encodeStroke(rectStroke));
        expect(decoded.points).toEqual(rectStroke.points);
        expect(decoded.style).toBe('dashed');

        // Partial eraser splits a shape stroke cleanly
        const erased = eraseCircleFromStroke(rectStroke.points, 30, 10, 5);
        expect(erased.changed).toBe(true);
        expect(erased.pieces.length).toBeGreaterThanOrEqual(1);

        // Lasso rect hit-tests the shape stroke
        expect(findStrokesInRect([rectStroke], { minX: 25, minY: 5, maxX: 35, maxY: 15 })).toHaveLength(1);
    });
});

describe('Track 2A — InputController dispatch for shape & lasso', () => {
    function createMockInputHarness(initialToolState) {
        const listeners = new Map();
        const container = {
            addEventListener: (type, fn) => {
                if (!listeners.has(type)) listeners.set(type, []);
                listeners.get(type).push(fn);
            },
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 800 }),
            setPointerCapture: vi.fn(),
        };
        const scene = new BoardScene(1000, 800);
        Object.assign(scene.camera, { x: 0, y: 0, scale: 1, baseScale: 1 });
        const history = new HistoryStack();
        const surface = {
            container,
            overviewMode: false,
            setActiveStroke: vi.fn(),
            setActiveShape: vi.fn(),
            setLassoOverlay: vi.fn(),
            setEraserCursor: vi.fn(),
            appendStroke: vi.fn((s) => s),
            renderCommittedNow: vi.fn(),
            renderActiveNow: vi.fn(),
            requestCommittedRedraw: vi.fn(),
            beginGesture: vi.fn(),
            endGesture: vi.fn(),
        };
        const lasso = new LassoController({ scene, history, surface });
        let toolState = { ...initialToolState };

        // Minimal global window stub for InputController keydown/keyup listeners
        const origWindow = globalThis.window;
        if (typeof globalThis.window === 'undefined') {
            globalThis.window = { addEventListener: vi.fn() };
        }
        const origPerf = globalThis.performance;
        if (typeof globalThis.performance === 'undefined') {
            globalThis.performance = { now: () => Date.now() };
        }

        const input = new InputController(surface, {
            scene,
            history,
            lasso,
            getToolState: () => toolState,
        });

        const dispatch = (type, evt) => {
            const handlers = listeners.get(type) || [];
            const e = {
                pointerId: 1,
                pointerType: 'mouse',
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
            history,
            surface,
            lasso,
            input,
            setToolState: (next) => { toolState = { ...toolState, ...next }; },
            dispatch,
            restore: () => {
                if (origWindow === undefined) delete globalThis.window;
                if (origPerf === undefined) delete globalThis.performance;
            },
        };
    }

    it('previews and commits crisp rect shapes without RDP simplification and handles pointercancel', () => {
        const h = createMockInputHarness({
            tool: 'shape',
            shapeKind: 'rect',
            penColor: 1,
            penWidth: 0.45,
            penStyle: 'solid',
        });

        try {
            // Drag a rect from (10, 20) to (60, 50)
            h.dispatch('pointerdown', { clientX: 10, clientY: 20 });
            expect(h.surface.setActiveShape).toHaveBeenCalled();

            h.dispatch('pointermove', { clientX: 60, clientY: 50 });
            const previewArg = h.surface.setActiveShape.mock.calls.at(-1)[0];
            expect(previewArg.points).toHaveLength(5);

            h.dispatch('pointerup', { clientX: 60, clientY: 50 });
            expect(h.surface.setActiveShape).toHaveBeenLastCalledWith(null);
            expect(h.scene.strokes).toHaveLength(1);
            expect(h.scene.strokes[0].points).toEqual([
                { x: 10, y: 20 },
                { x: 60, y: 20 },
                { x: 60, y: 50 },
                { x: 10, y: 50 },
                { x: 10, y: 20 },
            ]);
            expect(h.surface.appendStroke).toHaveBeenCalledTimes(1);

            // Cancel mid-shape should not commit
            h.dispatch('pointerdown', { clientX: 100, clientY: 100 });
            h.dispatch('pointermove', { clientX: 140, clientY: 140 });
            h.dispatch('pointercancel', { clientX: 140, clientY: 140 });
            expect(h.scene.strokes).toHaveLength(1);
            expect(h.surface.setActiveShape).toHaveBeenLastCalledWith(null);

            // Switch to lasso rect, select shape, and drag-move it by (+15, +25)
            h.setToolState({ tool: 'lasso', lassoMode: 'rect' });
            h.dispatch('pointerdown', { clientX: 5, clientY: 15 });
            h.dispatch('pointermove', { clientX: 70, clientY: 60 });
            h.dispatch('pointerup', { clientX: 70, clientY: 60 });
            expect(h.lasso.hasSelection).toBe(true);

            h.dispatch('pointerdown', { clientX: 30, clientY: 35 });
            h.dispatch('pointermove', { clientX: 45, clientY: 60 });
            h.dispatch('pointerup', { clientX: 45, clientY: 60 });
            expect(h.scene.strokes[0].points[0]).toEqual({ x: 25, y: 45 });
        } finally {
            h.restore();
        }
    });
});

describe('Track 2A — BoardToolbar Lasso & Shapes wiring (no leftover Track 2A stubs)', () => {
    it('wires lassoTray, shapesTray, and insertTray shapes without .is-stub while preserving Phase 4 cloud stub', async () => {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const toolbarSrc = fs.readFileSync(
            path.resolve(process.cwd(), 'assets/js/matephis-board-src/ui/toolbar.js'),
            'utf8'
        );

        // Verify state fields and tool active classes exist
        expect(toolbarSrc).toContain("lassoMode: 'lasso'");
        expect(toolbarSrc).toContain("shapeKind: 'line'");
        expect(toolbarSrc).toContain("this.state.tool === 'lasso'");
        expect(toolbarSrc).toContain("this.state.tool === 'shape'");

        // Verify Track 2A buttons are no longer stubs
        expect(toolbarSrc).not.toContain('Selezione lazo (in arrivo)');
        expect(toolbarSrc).not.toContain('Linea (in arrivo)');
        expect(toolbarSrc).not.toContain('Vettore / Freccia (in arrivo)');
        expect(toolbarSrc).not.toContain('Rettangolo (in arrivo)');
        expect(toolbarSrc).not.toContain('Cerchio / Ellisse (in arrivo)');
        expect(toolbarSrc).not.toContain('Triangolo (in arrivo)');
        expect(toolbarSrc).toContain("{ id: 'shapes', label: 'Forme', icon: BoardIcons.shapes, stub: false }");

        // Verify integrated Tracks 2B/2C insert items are live and Phase 4 cloud stub remains
        expect(toolbarSrc).toContain("{ id: 'connectors', label: 'Connettori', icon: BoardIcons.connector, stub: false }");
        expect(toolbarSrc).toContain("{ id: 'plot', label: 'Assi e grafici', icon: BoardIcons.axes, stub: false }");
        expect(toolbarSrc).toContain("{ id: 'diagrams', label: 'Diagrammi', icon: BoardIcons.diagram, stub: false }");
        expect(toolbarSrc).toContain("{ id: 'exercises', label: 'Esercizio', icon: BoardIcons.exercise, stub: false }");
        expect(toolbarSrc).toContain("Sessione cloud QR / R2 (in arrivo)");
    });
});
