import { describe, it, expect } from 'vitest';
import { createStroke } from '../assets/js/matephis-board-src/ink/stroke.js';
import { HistoryStack } from '../assets/js/matephis-board-src/ink/history.js';
import {
    BoardScene,
    nextWidgetId,
    nextConnectorId,
} from '../assets/js/matephis-board-src/model/scene.js';

describe('Board Phase 2 foundation — scene v2 schema & footprint', () => {
    it('serializes and restores v2 pages with widgets, connectors, and backgrounds compactly', () => {
        const scene = new BoardScene(1920, 1080);
        scene.pageBackground = 'grid';
        scene.strokes.push(createStroke({ id: 's1', points: [{ x: 10, y: 10 }, { x: 40, y: 20 }] }));
        scene.widgets.push({
            id: nextWidgetId(),
            kind: 'plot',
            x: 20,
            y: 30,
            w: 120,
            h: 85,
            lockedControls: true,
            data: { xMin: -5, xMax: 5, yMin: -4, yMax: 4, fn: 'sin(x)' },
        });
        scene.connectors.push({
            id: nextConnectorId(),
            pairId: 'pair-a',
            series: 'alpha',
            label: 'A',
            x: 150,
            y: 60,
            color: 1,
        });

        // Page 2 inherits background and stays blank of widgets/connectors
        scene.addPage(true);
        expect(scene.pageBackground).toBe('grid');
        scene.pageBackground = 'blank';

        const json = scene.toJSON();
        expect(json.v).toBe(2);
        expect(json.pages[0].bg).toBe('grid');
        expect(json.pages[0].widgets).toHaveLength(1);
        expect(json.pages[0].connectors).toHaveLength(1);
        // Compactness: omit empty optional fields on page 2
        expect(json.pages[1].bg).toBeUndefined();
        expect(json.pages[1].widgets).toBeUndefined();
        expect(json.pages[1].connectors).toBeUndefined();

        const restored = new BoardScene(1920, 1080);
        expect(restored.loadJSON(json)).toBe(true);
        expect(restored.pageCount).toBe(2);
        expect(restored.getPage(0).background).toBe('grid');
        expect(restored.getPage(0).widgets[0].kind).toBe('plot');
        expect(restored.getPage(0).widgets[0].lockedControls).toBe(true);
        expect(restored.getPage(0).widgets[0].data.fn).toBe('sin(x)');
        expect(restored.getPage(0).connectors[0].label).toBe('A');
        expect(restored.getPage(1).background).toBe('blank');
        expect(restored.getPage(1).widgets).toEqual([]);
        expect(restored.getPage(1).connectors).toEqual([]);
    });

    it('includes widgets and connectors in A4 footprint and isPageEmpty checks', () => {
        const scene = new BoardScene(1920, 1080);
        expect(scene.isPageEmpty()).toBe(true);
        expect(scene.getFootprint().cols).toBe(1);
        expect(scene.getFootprint().rows).toBe(1);

        // Widget spilling into column 1 (x > 297)
        scene.widgets.push({ id: 'w1', kind: 'plot', x: 250, y: 20, w: 100, h: 80, data: {} });
        expect(scene.isPageEmpty()).toBe(false);
        const fp = scene.getFootprint();
        expect(fp.cols).toBe(2);
        expect(fp.wideOverflow).toBe(true);

        // Connector in row 1 (y > 210)
        scene.connectors.push({ id: 'c1', pairId: 'p1', series: 'num', label: '1', x: 50, y: 250, color: 2 });
        const fp2 = scene.getFootprint();
        expect(fp2.rows).toBe(2);
        expect(fp2.occupied.has('0,1')).toBe(true);
    });

    it('finds matching connectors across pages and generates next alpha/num labels', () => {
        const scene = new BoardScene(1920, 1080);
        expect(scene.getNextConnectorLabel('alpha')).toBe('A');
        expect(scene.getNextConnectorLabel('num')).toBe('1');

        scene.connectors.push({ id: 'c1', pairId: 'pa', series: 'alpha', label: 'A', x: 10, y: 10, color: 1 });
        scene.addPage(true);
        scene.connectors.push({ id: 'c2', pairId: 'pa', series: 'alpha', label: 'A', x: 30, y: 40, color: 1 });
        scene.connectors.push({ id: 'c3', pairId: 'p1', series: 'num', label: '1', x: 50, y: 50, color: 2 });

        const matches = scene.findMatchingConnectors('pa');
        expect(matches).toHaveLength(2);
        expect(matches.map((m) => m.pageIndex)).toEqual([0, 1]);
        expect(scene.getNextConnectorLabel('alpha')).toBe('B');
        expect(scene.getNextConnectorLabel('num')).toBe('2');
    });
});

describe('Board Phase 2 foundation — page-wide HistoryStack commands', () => {
    it('undoes and redoes move-strokes (replacing points array for Path2D invalidation) and recolor-strokes', () => {
        const scene = new BoardScene(1920, 1080);
        const s1 = createStroke({ id: 's1', color: 0, points: [{ x: 10, y: 20 }, { x: 30, y: 40 }] });
        const origPtsRef = s1.points;
        scene.strokes.push(s1);

        const history = new HistoryStack();
        // Move by (+15, -5)
        const moveCmd = { type: 'move-strokes', ids: ['s1'], dx: 15, dy: -5 };
        history._applyForward(moveCmd, { strokes: scene.strokes, widgets: scene.widgets, connectors: scene.connectors });
        history.push(moveCmd);

        expect(s1.points).not.toBe(origPtsRef);
        expect(s1.points[0]).toEqual({ x: 25, y: 15 });
        expect(s1.bbox.minX).toBeCloseTo(25 - s1.width * 0.6, 5);

        // Recolor 0 -> 2
        const recolorCmd = { type: 'recolor-strokes', changes: [{ id: 's1', prevColor: 0, nextColor: 2 }] };
        s1.color = 2;
        history.push(recolorCmd);

        expect(history.undo(scene.currentPage)).toBe(true);
        expect(s1.color).toBe(0);

        expect(history.undo(scene.currentPage)).toBe(true);
        expect(s1.points[0]).toEqual({ x: 10, y: 20 });

        expect(history.redo(scene.currentPage)).toBe(true);
        expect(s1.points[0]).toEqual({ x: 25, y: 15 });

        expect(history.redo(scene.currentPage)).toBe(true);
        expect(s1.color).toBe(2);
    });

    it('undoes and redoes widget CRUD, connector CRUD, and full-page clear', () => {
        const scene = new BoardScene(1920, 1080);
        const page = scene.currentPage;
        const history = new HistoryStack();

        const w = { id: 'w1', kind: 'plot', x: 10, y: 10, w: 100, h: 70, data: {} };
        page.widgets.push(w);
        history.push({ type: 'widget-add', widget: w });

        const prev = { x: 10, y: 10 };
        const next = { x: 50, y: 40 };
        Object.assign(w, next);
        history.push({ type: 'widget-update', id: 'w1', prev, next });

        const c = { id: 'c1', pairId: 'pa', series: 'alpha', label: 'A', x: 12, y: 15, color: 1 };
        page.connectors.push(c);
        history.push({ type: 'connector-add', connector: c });

        c.x = 80;
        c.y = 90;
        history.push({ type: 'connector-move', id: 'c1', prevX: 12, prevY: 15, nextX: 80, nextY: 90 });

        // Full-page clear
        const clearCmd = {
            type: 'clear',
            strokes: page.strokes.slice(),
            widgets: page.widgets.slice(),
            connectors: page.connectors.slice(),
        };
        page.strokes.length = 0;
        page.widgets.length = 0;
        page.connectors.length = 0;
        history.push(clearCmd);

        expect(scene.isPageEmpty()).toBe(true);

        // Undo clear restores widget + connector
        expect(history.undo(page)).toBe(true);
        expect(page.widgets).toHaveLength(1);
        expect(page.connectors).toHaveLength(1);
        expect(page.connectors[0].x).toBe(80);

        // Undo connector move
        expect(history.undo(page)).toBe(true);
        expect(page.connectors[0].x).toBe(12);

        // Undo connector add
        expect(history.undo(page)).toBe(true);
        expect(page.connectors).toHaveLength(0);

        // Undo widget update
        expect(history.undo(page)).toBe(true);
        expect(page.widgets[0].x).toBe(10);

        // Undo widget add
        expect(history.undo(page)).toBe(true);
        expect(page.widgets).toHaveLength(0);

        // Redo all the way through
        while (history.canRedo) history.redo(page);
        expect(scene.isPageEmpty()).toBe(true);
    });
});
