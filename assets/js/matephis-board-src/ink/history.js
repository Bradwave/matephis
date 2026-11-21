/**
 * Command-based Undo / Redo history for Matephis Board.
 * Atomic erase gestures (multiple split/deleted strokes in one swipe)
 * are recorded as a single 'replace' command.
 */

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
     * Undo the most recent command on `strokes` array (mutated in place).
     * Returns true if a command was undone.
     */
    undo(strokes) {
        if (!this.canUndo) return false;
        const cmd = this.undoStack.pop();
        this._applyInverse(cmd, strokes);
        this.redoStack.push(cmd);
        return true;
    }

    /**
     * Redo the most recently undone command on `strokes` array (mutated in place).
     * Returns true if a command was redone.
     */
    redo(strokes) {
        if (!this.canRedo) return false;
        const cmd = this.redoStack.pop();
        this._applyForward(cmd, strokes);
        this.undoStack.push(cmd);
        return true;
    }

    _applyForward(cmd, strokes) {
        if (cmd.type === 'add') {
            strokes.push(cmd.stroke);
            return;
        }
        if (cmd.type === 'clear') {
            strokes.length = 0;
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
        }
    }

    _applyInverse(cmd, strokes) {
        if (cmd.type === 'add') {
            const idx = strokes.findIndex((s) => s.id === cmd.stroke.id);
            if (idx !== -1) strokes.splice(idx, 1);
            return;
        }
        if (cmd.type === 'clear') {
            strokes.length = 0;
            for (const s of cmd.strokes) strokes.push(s);
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
        }
    }
}
