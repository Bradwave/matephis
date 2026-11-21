import { describe, it, expect } from 'vitest';
import { createStroke } from '../assets/js/matephis-board-src/ink/stroke.js';
import { HistoryStack } from '../assets/js/matephis-board-src/ink/history.js';
import { EraseGesture } from '../assets/js/matephis-board-src/ink/eraser.js';
import { BoardScene } from '../assets/js/matephis-board-src/model/scene.js';

describe('board history & multi-frame atomic erase gesture', () => {
    it('undoes and redoes multi-frame partial erasing (including erasing split pieces) as one atomic step', () => {
        const s0 = createStroke({ id: 's0', points: [{ x: 0, y: 0 }, { x: 20, y: 0 }] });
        const s1 = createStroke({ id: 's1', points: [{ x: 0, y: 40 }, { x: 100, y: 40 }] });
        const s2 = createStroke({ id: 's2', points: [{ x: 0, y: 80 }, { x: 20, y: 80 }] });

        const strokes = [s0, s1, s2];
        const history = new HistoryStack();

        const gesture = new EraseGesture(strokes, 'partial');
        // Frame 1: split s1 around x=50 into left [0..40] and right [60..100]
        expect(gesture.applyAt(50, 40, 10)).toBe(true);
        expect(strokes.length).toBe(4);

        // Frame 2 (same swipe): erase the entire right piece [60..100]
        expect(gesture.applyAt(80, 40, 25)).toBe(true);
        expect(strokes.length).toBe(3);

        const cmd = gesture.finish();
        expect(cmd).not.toBeNull();
        expect(cmd.removed.length).toBe(1);
        expect(cmd.removed[0].stroke.id).toBe('s1');
        expect(cmd.added.length).toBe(1);

        history.push(cmd);

        // Single undo must restore exact original order [s0, s1, s2]
        expect(history.undo(strokes)).toBe(true);
        expect(strokes.map((s) => s.id)).toEqual(['s0', 's1', 's2']);

        // Single redo reapplies the whole gesture
        expect(history.redo(strokes)).toBe(true);
        expect(strokes.length).toBe(3);
        expect(strokes.some((s) => s.id === 's1')).toBe(false);
    });

    it('supports whole-stroke erase mode and undo/redo', () => {
        const s0 = createStroke({ id: 'a', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] });
        const strokes = [s0];
        const history = new HistoryStack();

        const gesture = new EraseGesture(strokes, 'stroke');
        expect(gesture.applyAt(50, 0, 5)).toBe(true);
        expect(strokes.length).toBe(0);

        history.push(gesture.finish());
        history.undo(strokes);
        expect(strokes.length).toBe(1);
        expect(strokes[0].id).toBe('a');
    });

    it('serializes and restores BoardScene including 200 stress strokes compactly', () => {
        const scene = new BoardScene(1920, 1080);
        const batch = scene.generateStressStrokes(200);
        for (const s of batch) scene.strokes.push(s);

        const payload = scene.toJSON();
        const jsonStr = JSON.stringify(payload);
        // 200 realistic handwriting strokes should easily stay under 50 KB uncompressed
        expect(jsonStr.length).toBeLessThan(50 * 1024);

        const restored = new BoardScene(1920, 1080);
        expect(restored.loadJSON(JSON.parse(jsonStr))).toBe(true);
        expect(restored.strokes.length).toBe(200);
    });

    it('manages multiple pages, navigation, deletion, and JSON round-trip', () => {
        const scene = new BoardScene(1920, 1080);
        expect(scene.pageCount).toBe(1);

        const s1 = createStroke({ id: 'p1_s1', points: [{ x: 10, y: 10 }, { x: 40, y: 10 }] });
        scene.strokes.push(s1);

        // Add Page 2 and draw on it
        scene.addPage(true);
        expect(scene.pageCount).toBe(2);
        expect(scene.currentPageIndex).toBe(1);
        expect(scene.strokes.length).toBe(0);

        const s2 = createStroke({ id: 'p2_s1', points: [{ x: 20, y: 20 }, { x: 60, y: 20 }] });
        scene.strokes.push(s2);

        // Navigate back to Page 1 -> strokes stay isolated
        expect(scene.goToPage(0)).toBe(true);
        expect(scene.strokes.map((s) => s.id)).toEqual(['p1_s1']);

        // Round-trip multi-page JSON
        const payload = scene.toJSON();
        expect(payload.pages.length).toBe(2);

        const restored = new BoardScene(1920, 1080);
        expect(restored.loadJSON(payload)).toBe(true);
        expect(restored.pageCount).toBe(2);
        expect(restored.currentPageIndex).toBe(0);
        expect(restored.getPage(1).strokes.map((s) => s.id)).toEqual(['p2_s1']);

        // Delete Page 1 -> Page 2 becomes current
        expect(restored.deleteCurrentPage()).toBe(true);
        expect(restored.pageCount).toBe(1);
        expect(restored.strokes.map((s) => s.id)).toEqual(['p2_s1']);
        // Cannot delete the last remaining page
        expect(restored.deleteCurrentPage()).toBe(false);
    });
});
