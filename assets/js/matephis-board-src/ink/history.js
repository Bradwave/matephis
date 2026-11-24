/**
 * Command-based Undo / Redo history for Matephis Board.
 *
 * Accepts either a plain `strokes` array (backwards-compatible) or a full `page`
 * object `{ strokes, widgets, connectors }` so strokes, lasso transforms,
 * widgets, and explanation connectors share one atomic Undo/Redo timeline per page.
 */

import { refreshStrokeBBox } from './stroke.js';

function resolveTarget(target) {
    if (Array.isArray(target)) {
        return { strokes: target, widgets: null, connectors: null };
    }
    return {
        strokes: target.strokes,
        widgets: target.widgets || null,
        connectors: target.connectors || null,
    };
}

function translateStrokes(strokes, idSet, dx, dy) {
    for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        if (!idSet.has(s.id)) continue;
        // Replace points array so stroke.js Path2D cache invalidates automatically
        s.points = s.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        refreshStrokeBBox(s);
    }
}

/** A widget moved together with the ink written on it (`sign` -1 undoes it). */
function moveWidget(widgets, strokes, cmd, sign) {
    const dx = cmd.dx * sign;
    const dy = cmd.dy * sign;
    const w = widgets.find((item) => item.id === cmd.id);
    if (w) {
        w.x = Math.round((w.x + dx) * 10) / 10;
        w.y = Math.round((w.y + dy) * 10) / 10;
    }
    if (Array.isArray(cmd.strokeIds) && cmd.strokeIds.length) {
        translateStrokes(strokes, new Set(cmd.strokeIds), dx, dy);
    }
}

export class HistoryStack {
    constructor(maxDepth = 150) {
        this.maxDepth = maxDepth;
        this.undoStack = [];
        this.redoStack = [];
    }

    get canUndo() {
        return this.undoStack.length > 0;
    }

    get canRedo() {
        return this.redoStack.length > 0;
    }

    push(command) {
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxDepth) {
            this.undoStack.shift();
        }
        this.redoStack.length = 0;
    }

    clear() {
        this.undoStack.length = 0;
        this.redoStack.length = 0;
    }

    /**
     * Undo the most recent command on `target` (`page` object or `strokes` array).
     * Returns true if a command was undone.
     */
    undo(target) {
        if (!this.canUndo) return false;
        const cmd = this.undoStack.pop();
        this._applyInverse(cmd, resolveTarget(target));
        this.redoStack.push(cmd);
        return true;
    }

    /**
     * Redo the most recently undone command on `target` (`page` object or `strokes` array).
     * Returns true if a command was redone.
     */
    redo(target) {
        if (!this.canRedo) return false;
        const cmd = this.redoStack.pop();
        this._applyForward(cmd, resolveTarget(target));
        this.undoStack.push(cmd);
        return true;
    }

    _applyForward(cmd, { strokes, widgets, connectors }) {
        if (cmd.type === 'add') {
            strokes.push(cmd.stroke);
            return;
        }
        if (cmd.type === 'clear') {
            strokes.length = 0;
            if (widgets && Array.isArray(cmd.widgets)) widgets.length = 0;
            if (connectors && Array.isArray(cmd.connectors)) connectors.length = 0;
            return;
        }
        if (cmd.type === 'batch-add') {
            for (const s of cmd.strokes) strokes.push(s);
            return;
        }
        if (cmd.type === 'replace') {
            const removedIds = new Set(cmd.removed.map((entry) => entry.stroke.id));
            for (let i = strokes.length - 1; i >= 0; i--) {
                if (removedIds.has(strokes[i].id)) strokes.splice(i, 1);
            }
            for (const s of cmd.added) strokes.push(s);
            return;
        }
        if (cmd.type === 'move-strokes') {
            translateStrokes(strokes, new Set(cmd.ids), cmd.dx, cmd.dy);
            return;
        }
        if (cmd.type === 'recolor-strokes') {
            const byId = new Map(cmd.changes.map((c) => [c.id, c.nextColor]));
            for (let i = 0; i < strokes.length; i++) {
                if (byId.has(strokes[i].id)) strokes[i].color = byId.get(strokes[i].id);
            }
            return;
        }
        if (cmd.type === 'widget-add' && widgets) {
            widgets.push(cmd.widget);
            return;
        }
        if (cmd.type === 'widget-remove' && widgets) {
            const idx = widgets.findIndex((w) => w.id === cmd.widget.id);
            if (idx !== -1) widgets.splice(idx, 1);
            return;
        }
        if (cmd.type === 'widget-update' && widgets) {
            const w = widgets.find((item) => item.id === cmd.id);
            if (w && cmd.next) Object.assign(w, cmd.next);
            return;
        }
        if (cmd.type === 'widget-move' && widgets) {
            moveWidget(widgets, strokes, cmd, 1);
            return;
        }
        if (cmd.type === 'connector-add' && connectors) {
            connectors.push(cmd.connector);
            return;
        }
        if (cmd.type === 'connector-remove' && connectors) {
            const idx = connectors.findIndex((c) => c.id === cmd.connector.id);
            if (idx !== -1) connectors.splice(idx, 1);
            return;
        }
        if (cmd.type === 'connector-move' && connectors) {
            const c = connectors.find((item) => item.id === cmd.id);
            if (c) {
                c.x = cmd.nextX;
                c.y = cmd.nextY;
            }
        }
    }

    _applyInverse(cmd, { strokes, widgets, connectors }) {
        if (cmd.type === 'add') {
            const idx = strokes.findIndex((s) => s.id === cmd.stroke.id);
            if (idx !== -1) strokes.splice(idx, 1);
            return;
        }
        if (cmd.type === 'clear') {
            strokes.length = 0;
            for (const s of cmd.strokes) strokes.push(s);
            if (widgets && Array.isArray(cmd.widgets)) {
                widgets.length = 0;
                for (const w of cmd.widgets) widgets.push(w);
            }
            if (connectors && Array.isArray(cmd.connectors)) {
                connectors.length = 0;
                for (const c of cmd.connectors) connectors.push(c);
            }
            return;
        }
        if (cmd.type === 'batch-add') {
            const ids = new Set(cmd.strokes.map((s) => s.id));
            for (let i = strokes.length - 1; i >= 0; i--) {
                if (ids.has(strokes[i].id)) strokes.splice(i, 1);
            }
            return;
        }
        if (cmd.type === 'replace') {
            const addedIds = new Set(cmd.added.map((s) => s.id));
            for (let i = strokes.length - 1; i >= 0; i--) {
                if (addedIds.has(strokes[i].id)) strokes.splice(i, 1);
            }
            // Re-insert removed strokes in original ascending index order
            const sorted = cmd.removed.slice().sort((a, b) => a.index - b.index);
            for (const entry of sorted) {
                const pos = Math.min(entry.index, strokes.length);
                strokes.splice(pos, 0, entry.stroke);
            }
            return;
        }
        if (cmd.type === 'move-strokes') {
            translateStrokes(strokes, new Set(cmd.ids), -cmd.dx, -cmd.dy);
            return;
        }
        if (cmd.type === 'recolor-strokes') {
            const byId = new Map(cmd.changes.map((c) => [c.id, c.prevColor]));
            for (let i = 0; i < strokes.length; i++) {
                if (byId.has(strokes[i].id)) strokes[i].color = byId.get(strokes[i].id);
            }
            return;
        }
        if (cmd.type === 'widget-add' && widgets) {
            const idx = widgets.findIndex((w) => w.id === cmd.widget.id);
            if (idx !== -1) widgets.splice(idx, 1);
            return;
        }
        if (cmd.type === 'widget-remove' && widgets) {
            const pos = typeof cmd.index === 'number' ? Math.min(cmd.index, widgets.length) : widgets.length;
            widgets.splice(pos, 0, cmd.widget);
            return;
        }
        if (cmd.type === 'widget-update' && widgets) {
            const w = widgets.find((item) => item.id === cmd.id);
            if (w && cmd.prev) Object.assign(w, cmd.prev);
            return;
        }
        if (cmd.type === 'widget-move' && widgets) {
            moveWidget(widgets, strokes, cmd, -1);
            return;
        }
        if (cmd.type === 'connector-add' && connectors) {
            const idx = connectors.findIndex((c) => c.id === cmd.connector.id);
            if (idx !== -1) connectors.splice(idx, 1);
            return;
        }
        if (cmd.type === 'connector-remove' && connectors) {
            const pos = typeof cmd.index === 'number' ? Math.min(cmd.index, connectors.length) : connectors.length;
            connectors.splice(pos, 0, cmd.connector);
            return;
        }
        if (cmd.type === 'connector-move' && connectors) {
            const c = connectors.find((item) => item.id === cmd.id);
            if (c) {
                c.x = cmd.prevX;
                c.y = cmd.prevY;
            }
        }
    }
}
