/**
 * Pointer, Touch, Wheel and Keyboard Interaction (mixed into MatephisPlot)
 *
 * Mouse / pen (Pointer Events):
 *   drag handles and selections, drag background to pan,
 *   Ctrl/⌘ + wheel (or trackpad pinch) to zoom; plain wheel zooms only after
 *   the plot has been clicked, so scrolling the page is never hijacked.
 *
 * Touch (Touch Events + CSS touch-action: pan-y):
 *   - a vertical swipe scrolls the page as usual
 *   - a horizontal swipe, or press-and-hold then drag, pans the plot
 *   - two fingers pinch-zoom and pan
 *   - handles (free points, vector tips, selection dots) grab immediately
 *   - in selection modes a tap places the selection on the nearest curve
 *   Inside the fullscreen lightbox one finger always pans.
 *
 * Keyboard (focused plot): arrows pan, + / - zoom, 0 resets, Esc clears.
 */
import { CoordinateSystem, constrainRange } from '../core/coordinate-system.js';

const HOLD_MS = 350;
const SLOP_PX = 8;
const SCROLL_GUARD_MS = 150;

// One shared scroll timestamp for all plots
let lastScrollTime = 0;
let scrollListening = false;
function listenScroll() {
    if (scrollListening || typeof window === 'undefined') return;
    scrollListening = true;
    window.addEventListener('scroll', () => { lastScrollTime = Date.now(); }, { passive: true, capture: true });
}

export const PointerMixin = {
    _canPan() {
        return !!this.config.interactive;
    },

    /** Client coordinates -> SVG user units (robust to CSS scaling). */
    _toSvg(clientX, clientY) {
        const rect = this.svg.getBoundingClientRect();
        const sx = rect.width ? this.width / rect.width : 1;
        const sy = rect.height ? this.height / rect.height : 1;
        return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
    },

    _initInteractions() {
        listenScroll();
        const svg = this.svg;
        this._touch = null;
        this._mouse = null;

        svg.addEventListener('pointerdown', (e) => this._onPointerDown(e));
        svg.addEventListener('pointermove', (e) => this._onPointerMove(e));
        svg.addEventListener('pointerup', (e) => this._onPointerUp(e));
        svg.addEventListener('pointercancel', (e) => this._onPointerUp(e));
        svg.addEventListener('pointerleave', () => { if (!this._mouse) this._wheelActive = false; });
        svg.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });

        svg.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
        svg.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
        svg.addEventListener('touchend', (e) => this._onTouchEnd(e));
        svg.addEventListener('touchcancel', (e) => this._onTouchEnd(e, true));

        if (this._canPan()) {
            svg.setAttribute('tabindex', '0');
            svg.setAttribute('role', 'application');
            svg.setAttribute('aria-roledescription', 'grafico interattivo');
            svg.addEventListener('keydown', (e) => this._onKeyDown(e));
        }
    },

    // =====================================================================
    // VIEW CHANGES
    // =====================================================================

    /** Applies new limits (respecting constrainView) and redraws. */
    _setView(lim) {
        let { xMin, xMax, yMin, yMax } = lim;
        if (![xMin, xMax, yMin, yMax].every(Number.isFinite) || xMax <= xMin || yMax <= yMin) return;
        const cfg = this.config;
        if (cfg.constrainView) {
            if (cfg.xlim) [xMin, xMax] = constrainRange(xMin, xMax, cfg.xlim[0], cfg.xlim[1]);
            if (cfg.ylim) [yMin, yMax] = constrainRange(yMin, yMax, cfg.ylim[0], cfg.ylim[1]);
        }
        this.view = { xMin, xMax, yMin, yMax };
        this.requestDraw();
    },

    _updateRange(dxPx, dyPx) {
        if (this.transform) this._setView(this.transform.panned(dxPx, dyPx));
    },

    _zoomAt(px, py, factor) {
        if (this.transform) this._setView(this.transform.zoomedAt(px, py, factor));
    },

    resetView() {
        const cfg = this.config;
        this.view = {
            xMin: cfg.xlim ? cfg.xlim[0] : -9.9, xMax: cfg.xlim ? cfg.xlim[1] : 9.9,
            yMin: cfg.ylim ? cfg.ylim[0] : -9.9, yMax: cfg.ylim ? cfg.ylim[1] : 9.9
        };
        this.requestDraw();
    },

    _showHint(text) {
        if (!this.hintEl) return;
        this.hintEl.textContent = text;
        this.hintEl.classList.add('visible');
        clearTimeout(this._hintTimer);
        this._hintTimer = setTimeout(() => this.hintEl.classList.remove('visible'), 1400);
    },

    // =====================================================================
    // HIT TESTING & INTERACTION START (shared by mouse and touch)
    // =====================================================================

    _hitHandle(x, y, extra = 0) {
        let best = null, bestD = Infinity;
        for (const h of this.handles) {
            const d = Math.hypot(h.px - x, h.py - y);
            if (d < h.r + extra && d < bestD) { best = h; bestD = d; }
        }
        return best;
    },

    /**
     * Tries to grab something under (x, y).
     * @param {'mouse'|'touch'} input
     * @param {boolean} allowNewSelection - may start a new selection on a curve
     * @returns {boolean} true if something was grabbed
     */
    _grabAt(x, y, input, allowNewSelection = true) {
        const touchExtra = input === 'touch' ? 8 : 0;
        const threshold = input === 'touch' ? 30 : 40;
        const near = (pt) => pt && Math.hypot(pt.x - x, pt.y - y) < 30 + touchExtra;

        const handle = this._hitHandle(x, y, touchExtra);
        if (handle) {
            this.interactions.draggingHandle = handle;
            return true;
        }

        if (this.config.draggablePoints) {
            const match = this._getClosestPointOnGraph(x, y, undefined, 24 + touchExtra);
            if (match && match.type === 'point') {
                this.interactions.draggingSelection = match;
                this.interactions.currentSelection = match;
                return true;
            }
        }

        if (this.selectionMode === 'slope') {
            if (near(this.interactions.slopeP1)) { this.interactions.draggingSelection = 'slopeP1'; return true; }
            if (near(this.interactions.slopeP2)) { this.interactions.draggingSelection = 'slopeP2'; return true; }
            if (!allowNewSelection) return false;
            const match = this._getClosestPointOnGraph(x, y, undefined, threshold);
            if (match) {
                this._fillVal(match);
                this.interactions.slopeP1 = match;
                this.interactions.slopeP2 = { ...match };
                this.interactions.draggingSelection = 'slopeP2';
                this._updateSelectionVisuals(null);
                return true;
            }
        } else if (this.selectionMode === 'tangent' || this.selectionMode === 'point') {
            const cur = this.interactions.currentSelection;
            if (cur && near(cur)) { this.interactions.draggingSelection = cur; return true; }
            if (!allowNewSelection) return false;
            const match = this._getClosestPointOnGraph(x, y, undefined, threshold);
            if (match) {
                this._fillVal(match);
                this.interactions.draggingSelection = match;
                this.interactions.currentSelection = match;
                this._updateSelectionVisuals(match);
                return true;
            }
        }
        return false;
    },

    _fillVal(match) {
        if (match.valX === undefined) match.valX = this.transform.unmapX(match.x);
        if (match.valY === undefined) match.valY = this.transform.unmapY(match.y);
    },

    /** Moves whatever was grabbed to (x, y). */
    _dragTo(x, y) {
        const cs = this.transform;
        const h = this.interactions.draggingHandle;
        if (h) {
            let vx = cs.unmapX(x), vy = cs.unmapY(y);
            if (h.snap) {
                vx = Math.round(vx / h.snap) * h.snap;
                vy = Math.round(vy / h.snap) * h.snap;
            }
            if (h.kind === 'freePoint') {
                this.freePoints[h.key] = { x: vx, y: vy };
            } else if (h.kind === 'vectorTip' || h.kind === 'vectorTail') {
                const s = this.vectorState[h.index];
                if (s) s[h.kind === 'vectorTip' ? 'to' : 'from'] = [vx, vy];
            }
            this.requestDraw();
            return;
        }
        const ds = this.interactions.draggingSelection;
        if (ds) this._dragSelection(ds, x, y);
    },

    _dragSelection(ds, mx, my) {
        const currentObj = typeof ds === 'string' ? this.interactions[ds] : ds;

        // Points defined by a parameter: move the parameter
        if (currentObj && currentObj.type === 'point' && currentObj.rawExpressions && currentObj.rawExpressions.length) {
            if (this._dragParametricPoint(currentObj, mx, my)) return;
        }

        let match;
        if (currentObj && currentObj.type === 'fn' && !currentObj.complex) {
            match = this._getPointAtGraphX(this.transform.unmapX(mx), currentObj.index);
        } else {
            const limit = currentObj && currentObj.index !== undefined ? currentObj.index : undefined;
            match = this._getClosestPointOnGraph(mx, my, limit, Infinity);
            if (match) this._fillVal(match);
        }
        if (!match) return;

        if (ds === 'slopeP1' || ds === 'slopeP2') {
            this.interactions[ds] = match;
            this._updateSelectionVisuals(null);
        } else {
            this.interactions.draggingSelection = match;
            this.interactions.currentSelection = match;
            this._updateSelectionVisuals(match);
        }
    },

    /**
     * Finds the parameter value that brings a parametric point closest to the
     * pointer: coarse scan over the slider range, then golden-section refinement.
     */
    _dragParametricPoint(obj, mx, my) {
        if (!this.sliders) return false;
        const cs = this.transform;
        const exprs = obj.rawExpressions;

        const evalAt = (key, t) => {
            const old = this.params[key];
            this.params[key] = t;
            let px = NaN, py = NaN;
            try {
                const vx = this._eval(exprs[0], 'drag eval x');
                if (vx && typeof vx === 'object') { px = cs.mapX(vx.re); py = cs.mapY(vx.im); }
                else { px = cs.mapX(vx); py = cs.mapY(exprs.length > 1 ? this._eval(exprs[1], 'drag eval y') : 0); }
            } catch (e) { /* NaN */ }
            this.params[key] = old;
            // Distance in screen space, so both axes count equally
            return (px - mx) ** 2 + (py - my) ** 2;
        };

        let bestKey = null, bestVal = null, bestD = Infinity;
        for (const key in this.params) {
            const ui = this.sliders.paramUIs[key];
            if (!ui) continue;
            const rx = new RegExp(`(?<![A-Za-z0-9_])${key}(?![A-Za-z0-9_])`);
            if (!exprs.some(e => typeof e === 'string' && rx.test(e))) continue;

            const lo = parseFloat(ui.input.min), hi = parseFloat(ui.input.max);
            const N = 200;
            let kBest = 0, dBest = Infinity;
            for (let k = 0; k <= N; k++) {
                const d = evalAt(key, lo + (hi - lo) * k / N);
                if (d < dBest) { dBest = d; kBest = k; }
            }
            // Refine inside the best bracket
            let a = lo + (hi - lo) * Math.max(0, kBest - 1) / N;
            let b = lo + (hi - lo) * Math.min(N, kBest + 1) / N;
            const g = 0.6180339887;
            for (let it = 0; it < 30; it++) {
                const c = b - g * (b - a), d = a + g * (b - a);
                if (evalAt(key, c) < evalAt(key, d)) b = d; else a = c;
            }
            const t = (a + b) / 2;
            const dt = evalAt(key, t);
            if (dt < bestD) { bestD = dt; bestKey = key; bestVal = t; }
        }
        if (bestKey === null) return false;

        const ui = this.sliders.paramUIs[bestKey];
        const step = parseFloat(ui.input.step) || 0;
        let v = step > 0 ? parseFloat(ui.input.min) + Math.round((bestVal - parseFloat(ui.input.min)) / step) * step : bestVal;
        v = parseFloat(v.toFixed(Math.max(ui.decimals, 6)));
        this.sliders.setValue(bestKey, v, false);
        this.draw();

        const fresh = this._getClosestPointOnGraph(mx, my, obj.index, Infinity);
        if (fresh && fresh.type === 'point') {
            this.interactions.draggingSelection = fresh;
            this.interactions.currentSelection = fresh;
        }
        return true;
    },

    _clearSelection() {
        if (this.interactions.currentSelection || this.interactions.slopeP1 || this.interactions.slopeP2) {
            this.interactions.currentSelection = null;
            this.interactions.slopeP1 = null;
            this.interactions.slopeP2 = null;
            this._updateSelectionVisuals(null);
        }
    },

    _endDrag() {
        // Gap in the derivative trace between separate strokes
        if (this.isTracing && this.derivativeTrace.length > 0 && this.derivativeTrace[this.derivativeTrace.length - 1] !== null) {
            this.derivativeTrace.push(null);
            if (this.derivativePlot) {
                const trace = this.derivativePlot.config.data.find(d => d.id === 'derivative-trace');
                if (trace) trace.points.push(null);
            }
        }
        this.interactions.draggingSelection = null;
        this.interactions.draggingHandle = null;
        this.interactions.isDragging = false;
        this.wrapper.classList.remove('matephis-dragging');
    },

    // =====================================================================
    // MOUSE / PEN
    // =====================================================================

    _onPointerDown(e) {
        if (e.pointerType === 'touch' || e.button > 0) return;
        const { x, y } = this._toSvg(e.clientX, e.clientY);
        this._wheelActive = true;

        if (this._grabAt(x, y, 'mouse')) {
            this._mouse = { mode: 'drag', id: e.pointerId, moved: false };
            this.wrapper.classList.add('matephis-dragging');
            this.svg.setPointerCapture(e.pointerId);
            e.preventDefault();
            return;
        }
        this._mouse = { mode: this._canPan() ? 'pan' : 'click', id: e.pointerId, lastX: e.clientX, lastY: e.clientY, sx: e.clientX, sy: e.clientY, moved: false };
        if (this._canPan()) {
            this.interactions.isDragging = true;
            this.svg.setPointerCapture(e.pointerId);
            e.preventDefault();
        }
    },

    _onPointerMove(e) {
        if (e.pointerType === 'touch') return;
        const m = this._mouse;
        const { x, y } = this._toSvg(e.clientX, e.clientY);

        if (!m) {
            // Hover feedback
            const overHandle = this.handles.length && this._hitHandle(x, y);
            this.svg.classList.toggle('over-handle', !!overHandle);
            return;
        }
        if (m.mode === 'drag') {
            m.moved = true;
            this._dragTo(x, y);
            return;
        }
        if (m.mode === 'pan') {
            if (!m.moved && Math.hypot(e.clientX - m.sx, e.clientY - m.sy) < 3) return;
            m.moved = true;
            this.wrapper.classList.add('matephis-dragging');
            const scale = this.width / (this.svg.getBoundingClientRect().width || this.width);
            this._updateRange((e.clientX - m.lastX) * scale, (e.clientY - m.lastY) * scale);
            m.lastX = e.clientX;
            m.lastY = e.clientY;
        }
    },

    _onPointerUp(e) {
        if (e.pointerType === 'touch') return;
        const m = this._mouse;
        if (!m) return;
        // Click on empty background clears the selection
        if (!m.moved && m.mode !== 'drag') this._clearSelection();
        this._endDrag();
        this._mouse = null;
        try { this.svg.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
    },

    _onWheel(e) {
        if (!this._canPan()) return;
        const zoomIntent = e.ctrlKey || e.metaKey || this._wheelActive || this.inLightbox;
        if (!zoomIntent || Date.now() - lastScrollTime < SCROLL_GUARD_MS) {
            if (!zoomIntent) this._showHint('Ctrl + rotellina per lo zoom');
            return;
        }
        e.preventDefault();
        let dy = e.deltaY;
        if (e.deltaMode === 1) dy *= 16;
        else if (e.deltaMode === 2) dy *= 400;
        dy = Math.max(-100, Math.min(100, dy));
        const { x, y } = this._toSvg(e.clientX, e.clientY);
        this._zoomAt(x, y, Math.pow(1.0018, dy));
    },

    _onKeyDown(e) {
        const cs = this.transform;
        if (!cs) return;
        const cx = cs.padL + cs.plotW / 2, cy = cs.padT + cs.plotH / 2;
        const step = 0.1;
        let handled = true;
        switch (e.key) {
            case 'ArrowLeft': this._updateRange(cs.plotW * step, 0); break;
            case 'ArrowRight': this._updateRange(-cs.plotW * step, 0); break;
            case 'ArrowUp': this._updateRange(0, cs.plotH * step); break;
            case 'ArrowDown': this._updateRange(0, -cs.plotH * step); break;
            case '+': case '=': this._zoomAt(cx, cy, 0.8); break;
            case '-': case '_': this._zoomAt(cx, cy, 1.25); break;
            case '0': this.resetView(); break;
            case 'Escape': this._clearSelection(); handled = !!this.interactions.currentSelection; break;
            default: handled = false;
        }
        if (handled) e.preventDefault();
    },

    // =====================================================================
    // TOUCH
    // =====================================================================

    _touchCentroid(e) {
        let sx = 0, sy = 0;
        const n = Math.min(e.touches.length, 2);
        for (let i = 0; i < n; i++) { sx += e.touches[i].clientX; sy += e.touches[i].clientY; }
        return { x: sx / n, y: sy / n };
    },

    _touchDist(e) {
        return Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    },

    _startPinch(e) {
        const c = this._touchCentroid(e);
        const p = this._toSvg(c.x, c.y);
        // Snapshot of the transform at gesture start; the gesture is absolute
        const cs = this.transform;
        this._touch = {
            mode: 'pinch', startDist: this._touchDist(e) || 1, c0: p,
            cs0: new CoordinateSystem({
                width: cs.width, height: cs.height, padL: cs.padL, padR: cs.padR, padT: cs.padT, padB: cs.padB,
                view: { xMin: cs.xMin, xMax: cs.xMax, yMin: cs.yMin, yMax: cs.yMax },
                xScale: cs.xScale, yScale: cs.yScale
            })
        };
        this._cancelHold();
        this._endDrag();
    },

    _cancelHold() {
        if (this._touch && this._touch.holdTimer) clearTimeout(this._touch.holdTimer);
    },

    _onTouchStart(e) {
        const fullscreen = !!this.inLightbox;
        if (!fullscreen && Date.now() - lastScrollTime < SCROLL_GUARD_MS) return; // momentum scroll

        if (e.touches.length >= 2) {
            if (!this._canPan()) return;
            if (e.cancelable) e.preventDefault();
            this._startPinch(e);
            return;
        }

        const t = e.touches[0];
        const { x, y } = this._toSvg(t.clientX, t.clientY);

        // Handles and existing selections grab immediately
        if (this._grabAt(x, y, 'touch', false)) {
            if (e.cancelable) e.preventDefault();
            this._touch = { mode: 'drag' };
            this.wrapper.classList.add('matephis-dragging');
            return;
        }

        this._touch = { mode: 'pending', sx: t.clientX, sy: t.clientY, x, y, lastX: t.clientX, lastY: t.clientY, start: Date.now() };

        if (fullscreen) {
            // No page to scroll: behave like a mouse
            if (e.cancelable) e.preventDefault();
            if (this._grabAt(x, y, 'touch', true)) { this._touch.mode = 'drag'; return; }
            if (this._canPan()) this._touch.mode = 'pan';
            return;
        }

        // Press and hold activates one-finger panning (or selection dragging)
        if (this._canPan() || this.selectionMode) {
            this._touch.holdTimer = setTimeout(() => {
                const tt = this._touch;
                if (!tt || tt.mode !== 'pending') return;
                if (this.selectionMode && this._grabAt(tt.x, tt.y, 'touch', true)) tt.mode = 'drag';
                else if (this._canPan()) tt.mode = 'pan';
                else return;
                this.wrapper.classList.add('matephis-touch-active');
                if (navigator.vibrate) { try { navigator.vibrate(10); } catch (err) { /* unsupported */ } }
            }, HOLD_MS);
        }
    },

    _onTouchMove(e) {
        const tt = this._touch;
        if (!tt) return;

        if (tt.mode === 'pinch') {
            if (e.touches.length < 2) return;
            if (e.cancelable) e.preventDefault();
            const c = this._touchCentroid(e);
            const p = this._toSvg(c.x, c.y);
            const scale = tt.startDist / (this._touchDist(e) || 1);
            const z = tt.cs0.zoomedAt(tt.c0.x, tt.c0.y, scale);
            const cs1 = new CoordinateSystem({
                width: tt.cs0.width, height: tt.cs0.height, padL: tt.cs0.padL, padR: tt.cs0.padR, padT: tt.cs0.padT, padB: tt.cs0.padB,
                view: z, xScale: tt.cs0.xScale, yScale: tt.cs0.yScale
            });
            this._setView(cs1.panned(p.x - tt.c0.x, p.y - tt.c0.y));
            return;
        }

        const t = e.touches[0];
        if (tt.mode === 'drag') {
            if (e.cancelable) e.preventDefault();
            const { x, y } = this._toSvg(t.clientX, t.clientY);
            this._dragTo(x, y);
            return;
        }

        if (tt.mode === 'pending') {
            const dx = t.clientX - tt.sx, dy = t.clientY - tt.sy;
            if (Math.hypot(dx, dy) < SLOP_PX) return;
            this._cancelHold();
            // Vertical swipe: it's a page scroll, let the browser have it
            if (Math.abs(dy) >= Math.abs(dx) || !e.cancelable) { this._touch = null; return; }
            // Horizontal swipe: the page can't scroll sideways, so it's ours
            if (this.selectionMode && this._grabAt(tt.x, tt.y, 'touch', true)) tt.mode = 'drag';
            else if (this._canPan()) tt.mode = 'pan';
            else { this._touch = null; return; }
            this.wrapper.classList.add('matephis-dragging');
        }

        if (tt.mode === 'pan') {
            if (e.cancelable) e.preventDefault();
            const scale = this.width / (this.svg.getBoundingClientRect().width || this.width);
            this._updateRange((t.clientX - tt.lastX) * scale, (t.clientY - tt.lastY) * scale);
            tt.lastX = t.clientX;
            tt.lastY = t.clientY;
        }
    },

    _onTouchEnd(e, cancelled = false) {
        const tt = this._touch;
        if (!tt) return;

        if (e.touches.length > 0) {
            // Pinch -> one finger left: continue as pan from here
            if (tt.mode === 'pinch' && this._canPan()) {
                const t = e.touches[0];
                this._touch = { mode: 'pan', lastX: t.clientX, lastY: t.clientY };
            }
            return;
        }

        this._cancelHold();
        // Tap (no movement): place a selection, or clear it on empty background
        if (!cancelled && tt.mode === 'pending' && Date.now() - tt.start < HOLD_MS) {
            if (this.selectionMode) {
                if (!this._grabAt(tt.x, tt.y, 'touch', true)) this._clearSelection();
                if (e.cancelable) e.preventDefault(); // no synthetic click
            }
        }
        this._endDrag();
        this.wrapper.classList.remove('matephis-touch-active');
        this._touch = null;
    },
};
