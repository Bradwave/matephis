/**
 * Lasso & Rectangle selection controller + pure hit-testing helpers for Matephis Board.
 *
 * Supports:
 * - Freehand polygon (`lasso`) and axis-aligned rectangle (`rect`) stroke selection
 * - Drag-to-move translation committed atomically as `{ type: 'move-strokes', ids, dx, dy }`
 * - Selection actions: Duplicate (`batch-add`), Recolor (`recolor-strokes`), Delete (`replace`)
 */

import { bboxIntersects, computeBBox, distSqPointToSegment } from './geometry.js';
import { createStroke, nextStrokeId, refreshStrokeBBox } from './stroke.js';

const EPS = 1e-9;

function orient(ax, ay, bx, by, cx, cy) {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function onCollinearSegment(ax, ay, bx, by, px, py) {
    return (
        px >= Math.min(ax, bx) - EPS &&
        px <= Math.max(ax, bx) + EPS &&
        py >= Math.min(ay, by) - EPS &&
        py <= Math.max(ay, by) + EPS
    );
}

/**
 * Returns true if segment AB intersects segment CD (including endpoints & collinear overlap).
 */
export function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
    // Fast AABB reject
    if (
        Math.max(ax, bx) < Math.min(cx, dx) - EPS ||
        Math.min(ax, bx) > Math.max(cx, dx) + EPS ||
        Math.max(ay, by) < Math.min(cy, dy) - EPS ||
        Math.min(ay, by) > Math.max(cy, dy) + EPS
    ) {
        return false;
    }

    const o1 = orient(ax, ay, bx, by, cx, cy);
    const o2 = orient(ax, ay, bx, by, dx, dy);
    const o3 = orient(cx, cy, dx, dy, ax, ay);
    const o4 = orient(cx, cy, dx, dy, bx, by);

    if (((o1 > EPS && o2 < -EPS) || (o1 < -EPS && o2 > EPS)) &&
        ((o3 > EPS && o4 < -EPS) || (o3 < -EPS && o4 > EPS))) {
        return true;
    }

    if (Math.abs(o1) <= EPS && onCollinearSegment(ax, ay, bx, by, cx, cy)) return true;
    if (Math.abs(o2) <= EPS && onCollinearSegment(ax, ay, bx, by, dx, dy)) return true;
    if (Math.abs(o3) <= EPS && onCollinearSegment(cx, cy, dx, dy, ax, ay)) return true;
    if (Math.abs(o4) <= EPS && onCollinearSegment(cx, cy, dx, dy, bx, by)) return true;

    return false;
}

/**
 * Ray-casting point-in-polygon check (inclusive of boundary edges).
 */
export function pointInPolygon(px, py, poly) {
    if (!poly || poly.length < 3) return false;
    const n = poly.length;

    // Boundary check first so exact edge/vertex hits are deterministic
    for (let i = 0, j = n - 1; i < n; j = i++) {
        if (distSqPointToSegment(px, py, poly[j].x, poly[j].y, poly[i].x, poly[i].y) <= EPS) {
            return true;
        }
    }

    let inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = poly[i].x;
        const yi = poly[i].y;
        const xj = poly[j].x;
        const yj = poly[j].y;

        const intersects = (yi > py) !== (yj > py) &&
            px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
        if (intersects) inside = !inside;
    }
    return inside;
}

export function normalizeRect(rect) {
    const x0 = rect.minX ?? rect.x0 ?? 0;
    const y0 = rect.minY ?? rect.y0 ?? 0;
    const x1 = rect.maxX ?? rect.x1 ?? 0;
    const y1 = rect.maxY ?? rect.y1 ?? 0;
    return {
        minX: Math.min(x0, x1),
        minY: Math.min(y0, y1),
        maxX: Math.max(x0, x1),
        maxY: Math.max(y0, y1),
    };
}

/**
 * Liang-Barsky segment vs axis-aligned rectangle intersection.
 */
export function segmentIntersectsRect(ax, ay, bx, by, rawRect) {
    const rect = normalizeRect(rawRect);
    const dx = bx - ax;
    const dy = by - ay;
    let t0 = 0;
    let t1 = 1;

    const checks = [
        [-dx, ax - rect.minX],
        [dx, rect.maxX - ax],
        [-dy, ay - rect.minY],
        [dy, rect.maxY - ay],
    ];

    for (let i = 0; i < 4; i++) {
        const p = checks[i][0];
        const q = checks[i][1];
        if (Math.abs(p) <= EPS) {
            if (q < -EPS) return false;
        } else {
            const r = q / p;
            if (p < 0) {
                if (r > t1 + EPS) return false;
                if (r > t0) t0 = r;
            } else {
                if (r < t0 - EPS) return false;
                if (r < t1) t1 = r;
            }
        }
    }
    return t0 <= t1 + EPS;
}

export function strokeIntersectsPolygon(stroke, poly, polyBBox = null) {
    if (!stroke || !stroke.points || stroke.points.length === 0 || !poly || poly.length < 3) {
        return false;
    }
    const pBox = polyBBox || computeBBox(poly, 0);
    if (stroke.bbox && !bboxIntersects(stroke.bbox, pBox)) {
        return false;
    }

    const pts = stroke.points;
    if (pts.length === 1) {
        return pointInPolygon(pts[0].x, pts[0].y, poly);
    }

    for (let i = 0; i < pts.length; i++) {
        if (pointInPolygon(pts[i].x, pts[i].y, poly)) {
            return true;
        }
    }

    const n = poly.length;
    for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        for (let j = 0, k = n - 1; j < n; k = j++) {
            if (segmentsIntersect(a.x, a.y, b.x, b.y, poly[k].x, poly[k].y, poly[j].x, poly[j].y)) {
                return true;
            }
        }
    }

    return false;
}

export function strokeIntersectsRect(stroke, rawRect) {
    if (!stroke || !stroke.points || stroke.points.length === 0) return false;
    const rect = normalizeRect(rawRect);
    if (stroke.bbox && !bboxIntersects(stroke.bbox, rect)) {
        return false;
    }

    const pts = stroke.points;
    if (pts.length === 1) {
        const p = pts[0];
        return p.x >= rect.minX - EPS && p.x <= rect.maxX + EPS &&
            p.y >= rect.minY - EPS && p.y <= rect.maxY + EPS;
    }

    for (let i = 0; i < pts.length - 1; i++) {
        if (segmentIntersectsRect(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, rect)) {
            return true;
        }
    }
    return false;
}

export function findStrokesInPolygon(strokes, poly) {
    if (!strokes || strokes.length === 0 || !poly || poly.length < 3) return [];
    const polyBBox = computeBBox(poly, 0);
    const out = [];
    for (let i = 0; i < strokes.length; i++) {
        if (strokeIntersectsPolygon(strokes[i], poly, polyBBox)) {
            out.push(strokes[i]);
        }
    }
    return out;
}

export function findStrokesInRect(strokes, rawRect) {
    if (!strokes || strokes.length === 0) return [];
    const rect = normalizeRect(rawRect);
    const out = [];
    for (let i = 0; i < strokes.length; i++) {
        if (strokeIntersectsRect(strokes[i], rect)) {
            out.push(strokes[i]);
        }
    }
    return out;
}

export function computeSelectionBBox(strokes, selectedIds) {
    if (!strokes || strokes.length === 0 || !selectedIds) return null;
    const idSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
    if (idSet.size === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let found = false;

    for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        if (!idSet.has(s.id)) continue;
        const bb = s.bbox || computeBBox(s.points, (s.width || 0.45) * 0.6);
        found = true;
        if (bb.minX < minX) minX = bb.minX;
        if (bb.minY < minY) minY = bb.minY;
        if (bb.maxX > maxX) maxX = bb.maxX;
        if (bb.maxY > maxY) maxY = bb.maxY;
    }

    return found ? { minX, minY, maxX, maxY } : null;
}

export class LassoController {
    constructor({ scene, history, surface = null, onSceneMutated = null, onSelectionChange = null }) {
        this.scene = scene;
        this.history = history;
        this.surface = surface;
        this.onSceneMutated = onSceneMutated;
        this.onSelectionChange = onSelectionChange;

        this.selectedIds = new Set();
        this.marquee = null; // { kind: 'lasso', points } | { kind: 'rect', start, end }
        this.drag = null;    // { startX, startY, dx, dy }
    }

    get hasSelection() {
        return this.selectedIds.size > 0;
    }

    getSelectedStrokes() {
        if (this.selectedIds.size === 0) return [];
        return this.scene.strokes.filter((s) => this.selectedIds.has(s.id));
    }

    getSelectionBBox() {
        return computeSelectionBBox(this.scene.strokes, this.selectedIds);
    }

    setSelection(ids) {
        this.selectedIds = new Set(ids);
        this.syncWithScene();
    }

    clearSelection() {
        const had = this.selectedIds.size > 0 || this.marquee !== null || this.drag !== null;
        this.selectedIds.clear();
        this.marquee = null;
        this.drag = null;
        if (had) {
            this._syncSurface();
            this._notifySelectionChange();
        }
    }

    /**
     * Prune selectedIds against current page strokes (e.g. after undo/redo).
     */
    syncWithScene() {
        const existing = new Set(this.scene.strokes.map((s) => s.id));
        let changed = false;
        for (const id of this.selectedIds) {
            if (!existing.has(id)) {
                this.selectedIds.delete(id);
                changed = true;
            }
        }
        this._syncSurface();
        if (changed || this.selectedIds.size >= 0) {
            this._notifySelectionChange();
        }
    }

    hitTestSelectionBBox(wx, wy, pad = 2) {
        const bb = this.getSelectionBBox();
        if (!bb) return false;
        return (
            wx >= bb.minX - pad &&
            wx <= bb.maxX + pad &&
            wy >= bb.minY - pad &&
            wy <= bb.maxY + pad
        );
    }

    beginInteraction(wx, wy, mode = 'lasso', hitPad = 2) {
        if (this.hasSelection && this.hitTestSelectionBBox(wx, wy, hitPad)) {
            this.drag = { startX: wx, startY: wy, dx: 0, dy: 0 };
            this.marquee = null;
            this._syncSurface();
            return 'drag';
        }

        const hadSelection = this.selectedIds.size > 0;
        this.selectedIds.clear();
        this.drag = null;
        this.marquee = mode === 'rect'
            ? { kind: 'rect', start: { x: wx, y: wy }, end: { x: wx, y: wy } }
            : { kind: 'lasso', points: [{ x: wx, y: wy }] };
        this._syncSurface();
        if (hadSelection) this._notifySelectionChange();
        return 'marquee';
    }

    updateInteraction(wx, wy) {
        if (this.drag) {
            this.drag.dx = wx - this.drag.startX;
            this.drag.dy = wy - this.drag.startY;
            this._syncSurface();
            return;
        }
        if (!this.marquee) return;

        if (this.marquee.kind === 'rect') {
            this.marquee.end = { x: wx, y: wy };
            this._syncSurface();
            return;
        }

        const pts = this.marquee.points;
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(wx - last.x, wy - last.y) >= 0.4) {
            pts.push({ x: wx, y: wy });
            this._syncSurface();
        }
    }

    endInteraction() {
        if (this.drag) {
            const { dx, dy } = this.drag;
            this.drag = null;
            if (Math.hypot(dx, dy) > 0.05) {
                this.moveSelection(dx, dy);
            } else {
                this._syncSurface();
            }
            return;
        }

        if (!this.marquee) return;
        const marquee = this.marquee;
        this.marquee = null;

        let matched = [];
        if (marquee.kind === 'rect') {
            const rect = normalizeRect({
                minX: marquee.start.x,
                minY: marquee.start.y,
                maxX: marquee.end.x,
                maxY: marquee.end.y,
            });
            const w = rect.maxX - rect.minX;
            const h = rect.maxY - rect.minY;
            if (w >= 0.8 || h >= 0.8) {
                matched = findStrokesInRect(this.scene.strokes, rect);
            }
        } else if (marquee.points.length >= 3) {
            const bb = computeBBox(marquee.points, 0);
            if (bb.maxX - bb.minX >= 0.8 || bb.maxY - bb.minY >= 0.8) {
                matched = findStrokesInPolygon(this.scene.strokes, marquee.points);
            }
        }

        this.selectedIds = new Set(matched.map((s) => s.id));
        this._syncSurface();
        this._notifySelectionChange();
    }

    cancelInteraction() {
        if (!this.drag && !this.marquee) return;
        this.drag = null;
        this.marquee = null;
        this._syncSurface();
    }

    moveSelection(dx, dy) {
        if (this.selectedIds.size === 0 || (dx === 0 && dy === 0)) return false;
        const ids = [];
        const strokes = this.scene.strokes;
        for (let i = 0; i < strokes.length; i++) {
            const s = strokes[i];
            if (!this.selectedIds.has(s.id)) continue;
            ids.push(s.id);
            // Replace points array so stroke.js Path2D cache invalidates
            s.points = s.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
            refreshStrokeBBox(s);
        }
        if (ids.length === 0) return false;

        this.history.push({ type: 'move-strokes', ids, dx, dy });
        if (this.surface) this.surface.renderCommittedNow();
        this._syncSurface();
        if (this.onSceneMutated) this.onSceneMutated();
        return true;
    }

    duplicateSelection(offsetX = 6, offsetY = 6) {
        const selected = this.getSelectedStrokes();
        if (selected.length === 0) return [];

        const clones = selected.map((s) => createStroke({
            id: nextStrokeId(),
            tool: s.tool,
            color: s.color,
            width: s.width,
            style: s.style,
            points: s.points.map((p) => ({ x: p.x + offsetX, y: p.y + offsetY })),
        }));

        for (let i = 0; i < clones.length; i++) {
            this.scene.strokes.push(clones[i]);
        }
        this.history.push({ type: 'batch-add', strokes: clones });
        this.selectedIds = new Set(clones.map((c) => c.id));

        if (this.surface) this.surface.renderCommittedNow();
        this._syncSurface();
        this._notifySelectionChange();
        if (this.onSceneMutated) this.onSceneMutated();
        return clones;
    }

    recolorSelection(colorId) {
        const selected = this.getSelectedStrokes();
        if (selected.length === 0) return false;

        const isHighlighterColor = typeof colorId === 'string' && colorId.startsWith('h');
        const changes = [];
        for (let i = 0; i < selected.length; i++) {
            const s = selected[i];
            // Keep pen and highlighter color spaces separate so highlighters never become opaque bars
            if (s.tool === 'highlighter' && !isHighlighterColor) continue;
            if (s.tool !== 'highlighter' && isHighlighterColor) continue;
            if (s.color === colorId) continue;
            changes.push({ id: s.id, prevColor: s.color, nextColor: colorId });
            s.color = colorId;
        }
        if (changes.length === 0) return false;

        this.history.push({ type: 'recolor-strokes', changes });
        if (this.surface) this.surface.renderCommittedNow();
        this._syncSurface();
        if (this.onSceneMutated) this.onSceneMutated();
        return true;
    }

    deleteSelection() {
        if (this.selectedIds.size === 0) return false;
        const strokes = this.scene.strokes;
        const removed = [];
        const indices = [];

        for (let i = 0; i < strokes.length; i++) {
            if (this.selectedIds.has(strokes[i].id)) {
                removed.push({ index: i, stroke: strokes[i] });
                indices.push(i);
            }
        }
        if (removed.length === 0) {
            this.selectedIds.clear();
            this._syncSurface();
            this._notifySelectionChange();
            return false;
        }

        for (let i = indices.length - 1; i >= 0; i--) {
            strokes.splice(indices[i], 1);
        }

        this.history.push({ type: 'replace', removed, added: [] });
        this.selectedIds.clear();
        if (this.surface) this.surface.renderCommittedNow();
        this._syncSurface();
        this._notifySelectionChange();
        if (this.onSceneMutated) this.onSceneMutated();
        return true;
    }

    getRenderState() {
        const selectedStrokes = this.getSelectedStrokes();
        const selectionBBox = computeSelectionBBox(this.scene.strokes, this.selectedIds);
        if (!selectionBBox && !this.marquee) return null;
        return {
            selectedIds: this.selectedIds,
            selectedStrokes,
            selectionBBox,
            marquee: this.marquee,
            drag: this.drag,
        };
    }

    _syncSurface() {
        if (this.surface && typeof this.surface.setLassoOverlay === 'function') {
            this.surface.setLassoOverlay(this.getRenderState());
        }
    }

    _notifySelectionChange() {
        if (this.onSelectionChange) {
            this.onSelectionChange(this.selectedIds.size);
        }
    }
}
