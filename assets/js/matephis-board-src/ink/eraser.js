/**
 * Atomic eraser gesture session (partial/segment or whole-stroke).
 * Supports multi-frame sweeping over already-split pieces within a single swipe,
 * producing ONE clean HistoryStack 'replace' command on pointer-up.
 */

import { bboxIntersects, circleHitsStroke, eraseCircleFromStroke } from './geometry.js';
import { createStroke } from './stroke.js';

export class EraseGesture {
    constructor(strokes, mode = 'partial') {
        this.strokes = strokes;
        this.mode = mode; // 'partial' | 'stroke'
        // Map<strokeId, { index, stroke }> for strokes that existed BEFORE this gesture
        this.originalRemoved = new Map();
        // Map<strokeId, stroke> for pieces created DURING this gesture that are still alive
        this.gestureAdded = new Map();
        // Track original index of every stroke at gesture start
        this.initialIndices = new Map();
        for (let i = 0; i < strokes.length; i++) {
            this.initialIndices.set(strokes[i].id, i);
        }
        this.dirty = false;
    }

    /**
     * Apply eraser disk (cx, cy, radius) in world mm.
     * Returns true if at least one stroke was modified or removed.
     */
    applyAt(cx, cy, radius) {
        const eraserBox = {
            minX: cx - radius,
            minY: cy - radius,
            maxX: cx + radius,
            maxY: cy + radius,
        };

        let changed = false;
        const newPieces = [];

        for (let i = this.strokes.length - 1; i >= 0; i--) {
            const s = this.strokes[i];
            if (!bboxIntersects(s.bbox, eraserBox)) continue;

            // Account for stroke half-width so grazing the visible edge erases intuitively
            const effectiveR = radius + s.width * 0.4;

            if (this.mode === 'stroke') {
                if (!circleHitsStroke(s.points, cx, cy, effectiveR)) continue;
                this._markRemoved(s);
                this.strokes.splice(i, 1);
                changed = true;
            } else {
                const res = eraseCircleFromStroke(s.points, cx, cy, effectiveR);
                if (!res.changed) continue;
                this._markRemoved(s);
                this.strokes.splice(i, 1);
                for (const pts of res.pieces) {
                    const piece = createStroke({
                        tool: s.tool,
                        color: s.color,
                        width: s.width,
                        style: s.style,
                        points: pts,
                    });
                    newPieces.push(piece);
                    this.gestureAdded.set(piece.id, piece);
                }
                changed = true;
            }
        }

        if (newPieces.length > 0) {
            for (const p of newPieces) this.strokes.push(p);
        }
        if (changed) this.dirty = true;
        return changed;
    }

    _markRemoved(stroke) {
        if (this.gestureAdded.has(stroke.id)) {
            // Intermediate piece created earlier in this same gesture
            this.gestureAdded.delete(stroke.id);
        } else if (!this.originalRemoved.has(stroke.id)) {
            this.originalRemoved.set(stroke.id, {
                index: this.initialIndices.get(stroke.id) ?? 0,
                stroke,
            });
        }
    }

    /**
     * Finalize gesture and return a HistoryStack command (or null if nothing changed).
     */
    finish() {
        if (!this.dirty || this.originalRemoved.size === 0) return null;
        return {
            type: 'replace',
            removed: Array.from(this.originalRemoved.values()),
            added: Array.from(this.gestureAdded.values()),
        };
    }
}
