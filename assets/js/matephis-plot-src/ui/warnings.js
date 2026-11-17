/**
 * The warnings box under a plot, a sets diagram or a physics scene, shared by
 * the three engines (mixed into their classes).
 *
 * Two kinds of warning:
 * - fixed: raised outside a draw (the config, a param that does not evaluate,
 *   the setup of the scene); they stay until the page is reloaded;
 * - per draw: raised while drawing (an interval made empty by a slider, an
 *   expression undefined at the current values); collected afresh at every
 *   draw, so they go away when a slider brings the values back.
 *
 * `warnings` is the list shown, fixed ones first. The class sets
 * `_warningsTitle` ("Plot", "Sets", "Physics") and wraps its draw in
 * `_drawingWarnings(() => …)`.
 */
export const WarningsMixin = {
    _initWarnings(title) {
        this._warningsTitle = title;
        this._fixedWarnings = [];
        this._drawWarnings = [];
        this._drawDepth = 0;
        this.warnings = [];
        this._warningsDirty = false;
    },

    _addWarning(msg) {
        if (this._drawDepth > 0) {
            if (!this._drawWarnings.includes(msg)) this._drawWarnings.push(msg);
            return;
        }
        if (!this._fixedWarnings.includes(msg)) this._fixedWarnings.push(msg);
        this._updateWarnings();
    },

    /**
     * Runs a draw: the warnings raised inside it replace those of the previous
     * draw; the box is redrawn only when the list changes. Nested draws count
     * as one.
     */
    _drawingWarnings(draw) {
        if (this._drawDepth++ === 0) this._drawWarnings = [];
        try {
            return draw();
        } finally {
            if (--this._drawDepth === 0) {
                this._updateWarnings();
                if (this._warningsDirty) this._renderWarnings();
            }
        }
    },

    _updateWarnings() {
        const next = [...this._fixedWarnings, ...this._drawWarnings.filter(w => !this._fixedWarnings.includes(w))];
        if (next.length !== this.warnings.length || next.some((w, i) => w !== this.warnings[i])) {
            this.warnings = next;
            this._warningsDirty = true;
        }
    },

    _renderWarnings() {
        this._warningsDirty = false;
        const old = this.wrapper.querySelector('.matephis-plot-warnings');
        if (old) old.remove();
        if (this.warnings.length === 0) return;
        const div = document.createElement('div');
        div.className = 'matephis-plot-warnings';
        const title = document.createElement('strong');
        title.textContent = `⚠️ ${this._warningsTitle} Warnings:`;
        div.appendChild(title);
        const ul = document.createElement('ul');
        this.warnings.forEach(w => {
            const li = document.createElement('li');
            li.textContent = w;
            ul.appendChild(li);
        });
        div.appendChild(ul);
        this.wrapper.appendChild(div);
    },
};
