/**
 * Unified PointerEvent input controller for Matephis Board.
 *
 * - Default: 1 pointer draws, 2 fingers pan & pinch-zoom (works on IR smartboards)
 * - Toggleable Pen-Only mode: pointerType === 'pen' draws, 1-finger touch pans
 * - Toggleable Palm-to-Erase: broad touch (max(width, height) >= threshold) temporarily erases
 * - Uses getCoalescedEvents() for high-frequency stylus capture
 * - Cancels accidental micro-dots when transitioning from 1 finger -> 2-finger pan or palm
 */

import {
    MAX_SCALE,
    MIN_SCALE,
    clamp,
    screenToWorld,
    simplifyRDP,
    median,
} from './geometry.js';
import { createStroke, refreshStrokeBBox } from './stroke.js';
import { EraseGesture } from './eraser.js';
import { createShapeStroke } from './shapes.js';

const GESTURE_CANCEL_MS = 95;
// Two-finger tap (opens the quick menu): both fingers down and up quickly, barely moving.
const TAP_MAX_MS = 350;
const TAP_MAX_MOVE_PX = 14;
// A first-finger dot committed just before the second finger landed is undone on a tap.
const TAP_DOT_MS = 250;
// A press that closed a menu becomes a stroke once it moves this far; less is a tap.
const DISMISS_TAP_MOVE_PX = 6;
// Two-finger gesture classifier (touch / IR smartboards; trackpad wheel is unaffected):
// - Wait briefly on touchdown so IR contact bloom does not corrupt the starting spread.
// - Require both an absolute px floor and a relative spread change (and non-parallel motion)
//   to unlock zoom; otherwise once the midpoint clearly translates, hard-lock to pan-only.
const PINCH_SETTLE_MS = 35;
const PINCH_SETTLE_MOVE_PX = 10;
const PINCH_PAN_COMMIT_PX = 34;
const PINCH_ZOOM_MIN_PX = 28;
const PINCH_ZOOM_MIN_REL = 0.11;
// When 1-finger pan is already active (Hand tool or penOnly), 2 fingers can zoom more eagerly.
const PINCH_EAGER_MIN_PX = 12;
const PINCH_EAGER_MIN_REL = 0.07;
// Low-pass smoothing on finger spread once zooming (tames IR quantization steps).
const PINCH_DIST_SMOOTH = 0.55;
// Pan or zoom is decided on the median of the last few spread readings: IR boards send
// single-frame outliers that would otherwise unlock zoom in the middle of a pan.
const PINCH_SPREAD_MEDIAN_N = 5;
// Keep the gesture alive briefly if an IR frame drops one finger mid-pan due to axis occlusion.
const PINCH_DROP_GRACE_MS = 120;
// Magnetic detent at 100% writing scale (baseScale) when pinching back toward 100%.
const ZOOM_DETENT_ENTER = 0.045;
const ZOOM_DETENT_EXIT = 0.075;
const ZOOM_DETENT_ARM = 0.08;

export class InputController {
    constructor(surface, {
        scene,
        history,
        overlay = null,
        lasso = null,
        getToolState,
        onCanvasTouch = null,
        onSceneMutated = null,
        onCameraChange = null,
        onOverviewPick = null,
        onTelemetry = null,
        onTwoFingerTap = null,
        onConnectorPlace = null,
    }) {
        this.surface = surface;
        this.scene = scene;
        this.history = history;
        this.overlay = overlay;
        this.lasso = lasso;
        this.getToolState = getToolState;
        this.onCanvasTouch = onCanvasTouch;
        this.onSceneMutated = onSceneMutated;
        this.onCameraChange = onCameraChange;
        this.onOverviewPick = onOverviewPick;
        this.onTelemetry = onTelemetry;
        this.onTwoFingerTap = onTwoFingerTap;
        this.onConnectorPlace = onConnectorPlace;
        this.tapCandidate = null;

        this.el = surface.container;
        this.pointers = new Map(); // pointerId -> { sx, sy, type, w, h }
        this.mode = 'idle';        // 'idle' | 'draw' | 'erase' | 'laser' | 'lasso' | 'shape' | 'pan' | 'pinch'
        this.activePointerId = null;
        this.strokeStartTime = 0;
        this.currentStroke = null;
        this.currentErase = null;
        this.shapeAnchor = null;
        this.palmActive = false;
        this.spaceHeld = false;

        this.panAnchor = null;
        this.pinchAnchor = null;
        this.pinchDropTimer = null;
        this.lastPinchIntent = null;
        this._cachedRect = null;

        this._bindEvents();
    }

    invalidateRect() {
        this._cachedRect = null;
    }

    cancelActive() {
        if (this.pinchDropTimer) {
            clearTimeout(this.pinchDropTimer);
            this.pinchDropTimer = null;
        }
        if (this.wheelEndTimer) {
            clearTimeout(this.wheelEndTimer);
            this.wheelEndTimer = null;
        }
        if (this.mode === 'draw') this._cancelUncommittedDraw();
        else if (this.mode === 'shape') this._cancelUncommittedShape();
        else if (this.mode === 'erase') {
            this.currentErase = null;
            this.surface.setEraserCursor(null);
        } else if (this.mode === 'lasso' && this.lasso) {
            this.lasso.cancelInteraction();
        } else if (this.mode === 'pan' || this.mode === 'pinch' || this.mode === 'pinch-cooldown') {
            this.surface.endGesture();
        }
        if (this.surface.setZoomIndicator) this.surface.setZoomIndicator(null);
        this.pointers.clear();
        this.mode = 'idle';
        this.activePointerId = null;
        this.panAnchor = null;
        this.pinchAnchor = null;
        this.lastPinchIntent = null;
        this.tapCandidate = null;
        this.dismissPress = null;
        this.palmActive = false;
    }

    _bindEvents() {
        this.el.addEventListener('pointerdown', (e) => this._onPointerDown(e));
        this.el.addEventListener('pointermove', (e) => this._onPointerMove(e));
        this.el.addEventListener('pointerup', (e) => this._onPointerUp(e));
        this.el.addEventListener('pointercancel', (e) => this._onPointerCancel(e));
        this.el.addEventListener('lostpointercapture', (e) => {
            const pid = e.pointerId;
            // Chromium/WebView may fire lostpointercapture before pointerup on normal release.
            // Wait briefly so normal pointerup commits first; if no pointerup ever arrives
            // (orphaned IR touch), commit/finish cleanly instead of discarding the stroke.
            setTimeout(() => {
                if (this.pointers.has(pid)) this._onPointerUp({ pointerId: pid });
            }, 60);
        });
        this.el.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
        this.el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // Trackpad two-finger click / right-click opens the quick menu. Touch long-presses
            // also fire contextmenu on some systems: ignore those (no press-and-hold menu).
            if (this.lastPointerType !== 'mouse' || !this.onTwoFingerTap) return;
            if (this.scene.settings.quickMenu === false || this.surface.overviewMode) return;
            this.onTwoFingerTap(e.clientX, e.clientY);
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this._isTypingTarget(e.target)) {
                this.spaceHeld = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') this.spaceHeld = false;
        });
        window.addEventListener('blur', () => {
            this.spaceHeld = false;
            if (this.mode === 'draw') this._commitDraw();
            else if (this.mode === 'erase') this._finishErase();
            else if (this.mode === 'shape') this._commitShape();
            if (this.pointers.size > 0 || this.mode !== 'idle') this.cancelActive();
        });
    }

    _isTypingTarget(target) {
        if (!target) return false;
        const tag = target.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    }

    _getLocalPoint(e) {
        const rect = this._cachedRect || (this._cachedRect = this.el.getBoundingClientRect());
        return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
    }

    _isPalm(e) {
        if (!this.scene.settings.palmErase) return false;
        if (e.pointerType !== 'touch') return false;
        const size = Math.max(e.width || 0, e.height || 0);
        return size >= (this.scene.settings.palmThreshold || 42);
    }

    _emitTelemetry(e, coalescedCount = 1, paintMs = null) {
        if (!this.onTelemetry) return;
        this.onTelemetry({
            pointerType: e.pointerType || 'unknown',
            width: Math.round(e.width || 0),
            height: Math.round(e.height || 0),
            pressure: Number((e.pressure || 0).toFixed(2)),
            touchCount: this.pointers.size,
            coalescedCount,
            paintMs,
            palmDetected: this.palmActive,
        });
    }

    _onPointerDown(e) {
        this.lastPointerType = e.pointerType;
        if (e.button === 2) return; // right-click: handled by contextmenu (quick menu)
        if (this.pointers.size === 0 && this.overlay && this.overlay.isInteractiveTarget(e.target)) {
            return;
        }
        e.preventDefault();
        try { this.el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }

        const { sx, sy } = this._getLocalPoint(e);
        this.pointers.set(e.pointerId, {
            sx,
            sy,
            type: e.pointerType,
            w: e.width || 0,
            h: e.height || 0,
        });

        // Overview mode: tap anywhere to jump back to 100% writing zoom there
        if (this.surface.overviewMode) {
            const worldPt = screenToWorld(sx, sy, this.scene.camera);
            this.pointers.clear();
            this.surface.exitOverview(worldPt);
            if (this.onOverviewPick) this.onOverviewPick();
            return;
        }

        // Notify toolbar/popovers to auto-dismiss. A single press that closed a menu still
        // draws if it moves (so starting to write is never lost), but a plain tap leaves no
        // dot; see dismissPress. Extra fingers of that press are swallowed so a two-finger
        // tap that closes a menu does not pan or reopen the quick menu.
        let dismissed = false;
        if (this.onCanvasTouch && this.onCanvasTouch() === true) {
            if (this.pointers.size > 1) {
                if (this.dismissPress) {
                    this._cancelUncommittedDraw();
                    this.pointers.clear();
                } else {
                    this.pointers.delete(e.pointerId);
                }
                return;
            }
            // Only a press that would draw carries on; erasing, panning or the laser from a
            // menu-closing press is still swallowed as before.
            const ts = this.getToolState();
            const wouldDraw = (ts.tool === 'pen' || ts.tool === 'highlighter')
                && !this.spaceHeld && e.button !== 1
                && !(this.scene.settings.penOnly && e.pointerType === 'touch')
                && !(e.pointerType === 'pen' && (e.button === 5 || (e.buttons & 32)))
                && !this._isPalm(e);
            if (!wouldDraw) {
                this.pointers.delete(e.pointerId);
                return;
            }
            dismissed = true;
        }

        // Check palm-to-erase immediately
        if (this._isPalm(e) || (this.scene.settings.palmErase && this.pointers.size >= 3 && e.pointerType === 'touch')) {
            this._cancelUncommittedDraw();
            this._cancelUncommittedShape();
            if (this.mode === 'lasso' && this.lasso) {
                this.lasso.cancelInteraction();
                this.mode = 'idle';
            }
            if (this.mode === 'pinch' || this.mode === 'pinch-cooldown' || this.pinchDropTimer) {
                this._finishPinchDrop({ allowPanHandoff: false });
            } else if (this.mode === 'pan') {
                this.panAnchor = null;
                this.mode = 'idle';
                this.surface.endGesture();
            }
            this.palmActive = true;
            this._startErase(e, sx, sy, true);
            this._emitTelemetry(e, 1);
            return;
        }

        // Transition to 2-finger pan/pinch-zoom
        if (this.pointers.size === 2 && !this.palmActive) {
            // If an IR board dropped one finger briefly mid-gesture, resume cleanly without
            // ending fastPan or forgetting a committed pan-lock.
            const resumedIntent = this.pinchDropTimer ? this.lastPinchIntent : null;
            if (this.pinchDropTimer) {
                clearTimeout(this.pinchDropTimer);
                this.pinchDropTimer = null;
                this.lastPinchIntent = null;
            }
            // Cancel accidental micro-dot if 2nd finger landed right after 1st
            const sinceFirst = performance.now() - this.strokeStartTime;
            let committedDot = false;
            if (this.mode === 'draw' && sinceFirst < GESTURE_CANCEL_MS) {
                this._cancelUncommittedDraw();
            } else if (this.mode === 'draw') {
                const pushed = this._commitDraw();
                committedDot = pushed && sinceFirst < TAP_DOT_MS;
            } else if (this.mode === 'erase') {
                this._finishErase();
            } else if (this.mode === 'shape') {
                this._cancelUncommittedShape();
            } else if (this.mode === 'lasso' && this.lasso) {
                this.lasso.cancelInteraction();
                this.mode = 'idle';
            } else if (this.mode === 'pan') {
                this.panAnchor = null;
            }
            this._startPinch(resumedIntent);
            if (!resumedIntent) this._startTapCandidate(committedDot);
            this._emitTelemetry(e, 1);
            return;
        }

        if (this.pointers.size > 2) {
            this.tapCandidate = null;
            return;
        }

        // If a previous 2-finger gesture was waiting on an IR finger-drop grace timer and a
        // fresh single pointer starts after all fingers lifted, end the old gesture cleanly.
        if (this.pinchDropTimer) {
            this._finishPinchDrop({ allowPanHandoff: false });
        }

        // Space + drag or middle-mouse button pans on desktop
        if (this.spaceHeld || e.button === 1) {
            this._startPan(e.pointerId, sx, sy);
            this._emitTelemetry(e, 1);
            return;
        }

        // Pen-only mode: non-pen touch pans instead of drawing
        if (this.scene.settings.penOnly && e.pointerType === 'touch') {
            this._startPan(e.pointerId, sx, sy);
            this._emitTelemetry(e, 1);
            return;
        }

        const toolState = this.getToolState();

        // Dedicated Hand / Pan tool: 1 pointer always pans cleanly (avoids IR multi-touch issues)
        if (toolState.tool === 'pan') {
            this._startPan(e.pointerId, sx, sy);
            this._emitTelemetry(e, 1);
            return;
        }

        // Hardware stylus eraser button (button === 5 or buttons === 32)
        if (e.pointerType === 'pen' && (e.button === 5 || (e.buttons & 32))) {
            this._startErase(e, sx, sy, false);
            this._emitTelemetry(e, 1);
            return;
        }

        if (toolState.tool === 'eraser') {
            this._startErase(e, sx, sy, false);
        } else if (toolState.tool === 'laser') {
            this.mode = 'laser';
            this.activePointerId = e.pointerId;
            const pt = screenToWorld(sx, sy, this.scene.camera);
            this.surface.addLaserPoint(pt.x, pt.y);
        } else if (toolState.tool === 'shape') {
            this._startShape(e, sx, sy, toolState);
        } else if (toolState.tool === 'lasso' && this.lasso) {
            this._startLasso(e, sx, sy, toolState);
        } else if (toolState.tool === 'connector') {
            const pt = screenToWorld(sx, sy, this.scene.camera);
            if (this.onConnectorPlace) this.onConnectorPlace(pt.x, pt.y);
        } else if (dismissed) {
            this._startDraw(e, sx, sy, toolState, true);
        } else {
            this._startDraw(e, sx, sy, toolState);
        }

        this._emitTelemetry(e, 1);
    }

    _startShape(e, sx, sy, toolState) {
        const t0 = performance.now();
        this.mode = 'shape';
        this.activePointerId = e.pointerId;
        const startWorld = screenToWorld(sx, sy, this.scene.camera);
        this.shapeAnchor = {
            startWorld,
            endWorld: startWorld,
            shapeKind: toolState.shapeKind || 'line',
            styleOpts: {
                tool: 'pen',
                color: toolState.penColor,
                width: toolState.penWidth,
                style: toolState.penStyle,
            },
        };
        const preview = createShapeStroke(
            startWorld,
            startWorld,
            this.shapeAnchor.shapeKind,
            this.shapeAnchor.styleOpts
        );
        this.surface.setActiveShape(preview);
        this._emitTelemetry(e, 1, performance.now() - t0);
    }

    _startLasso(e, sx, sy, toolState) {
        const t0 = performance.now();
        this.mode = 'lasso';
        this.activePointerId = e.pointerId;
        const wp = screenToWorld(sx, sy, this.scene.camera);
        const hitPad = Math.max(2, 8 / this.scene.camera.scale);
        this.lasso.beginInteraction(wp.x, wp.y, toolState.lassoMode || 'lasso', hitPad);
        this._emitTelemetry(e, 1, performance.now() - t0);
    }

    _startDraw(e, sx, sy, toolState, dismissing = false) {
        const t0 = performance.now();
        this.mode = 'draw';
        this.activePointerId = e.pointerId;
        this.strokeStartTime = t0;

        const pt = screenToWorld(sx, sy, this.scene.camera);
        const isHighlighter = toolState.tool === 'highlighter';
        this.currentStroke = createStroke({
            tool: isHighlighter ? 'highlighter' : 'pen',
            color: isHighlighter ? toolState.highlighterColor : toolState.penColor,
            width: isHighlighter ? toolState.highlighterWidth : toolState.penWidth,
            style: isHighlighter ? 'solid' : toolState.penStyle,
            points: [pt],
        });
        // After closing a menu the stroke stays hidden until the press moves like a stroke.
        this.dismissPress = dismissing ? { sx, sy, moved: false } : null;
        if (!dismissing) this.surface.setActiveStroke(this.currentStroke);
        this._emitTelemetry(e, 1, performance.now() - t0);
    }

    _startErase(e, sx, sy, isPalm) {
        const t0 = performance.now();
        this.mode = 'erase';
        this.activePointerId = e.pointerId;
        const toolState = this.getToolState();
        const eraseMode = isPalm ? 'partial' : toolState.eraserMode;
        const radius = isPalm
            ? clamp((Math.max(e.width || 48, e.height || 48) * 0.55) / this.scene.camera.scale, 8, 36)
            : toolState.eraserRadius;

        this.activeEraseRadius = radius;
        this.currentErase = new EraseGesture(this.scene.strokes, eraseMode);

        const pt = screenToWorld(sx, sy, this.scene.camera);
        this.surface.setEraserCursor({ x: pt.x, y: pt.y, radius });
        if (this.currentErase.applyAt(pt.x, pt.y, radius)) {
            this.surface.renderCommittedNow();
        }
        this._emitTelemetry(e, 1, performance.now() - t0);
    }

    _startPan(pointerId, sx, sy) {
        // Fingers win over a zoom-button or connector glide still running.
        if (this.surface.stopGlide) this.surface.stopGlide();
        this.surface.beginGesture();
        this.mode = 'pan';
        this.activePointerId = pointerId;
        this.panAnchor = {
            sx,
            sy,
            camX: this.scene.camera.x,
            camY: this.scene.camera.y,
        };
    }

    _startPinch(preservedIntent = null) {
        const entries = Array.from(this.pointers.entries());
        if (entries.length < 2) return;
        if (this.surface.stopGlide) this.surface.stopGlide();
        this.surface.beginGesture();
        this.mode = 'pinch';
        this.activePointerId = null;

        const [id0, p0] = entries[0];
        const [id1, p1] = entries[1];
        const midX = (p0.sx + p1.sx) * 0.5;
        const midY = (p0.sy + p1.sy) * 0.5;
        const dist = Math.max(16, Math.hypot(p1.sx - p0.sx, p1.sy - p0.sy));
        const toolState = this.getToolState ? this.getToolState() : {};
        const zoomLocked = Boolean(this.scene.settings.zoomLock);
        const eagerZoom = !zoomLocked && (toolState.tool === 'pan' || Boolean(this.scene.settings.penOnly));

        let intent = 'undecided';
        if (zoomLocked || preservedIntent === 'pan') {
            intent = 'pan';
        } else if (preservedIntent === 'zoom') {
            intent = 'zoom';
        }

        const base = this.scene.camera.baseScale || 1;
        this.pinchAnchor = {
            id0,
            id1,
            t0: performance.now(),
            settled: Boolean(preservedIntent),
            p0Start: { sx: p0.sx, sy: p0.sy },
            p1Start: { sx: p1.sx, sy: p1.sy },
            midStartX: midX,
            midStartY: midY,
            startDist: dist,
            worldMid: screenToWorld(midX, midY, this.scene.camera),
            startScale: this.scene.camera.scale,
            intent,
            eagerZoom,
            zoomStartDist: dist,
            zoomStartScale: this.scene.camera.scale,
            zoomWorldMid: screenToWorld(midX, midY, this.scene.camera),
            smoothDist: dist,
            spreadSamples: [dist],
            passedAwayFromBase: Math.abs(this.scene.camera.scale / base - 1) > 0.06,
            snappedToBase: false,
        };
        if (intent !== 'zoom' && this.surface.setZoomIndicator) {
            this.surface.setZoomIndicator(null);
        }
    }

    _finishPinchDrop({ allowPanHandoff = true } = {}) {
        if (this.pinchDropTimer) {
            clearTimeout(this.pinchDropTimer);
            this.pinchDropTimer = null;
        }
        this.lastPinchIntent = null;
        this.pinchAnchor = null;
        if (this.mode === 'pinch-cooldown' || this.mode === 'pinch') {
            this.mode = 'idle';
        }
        if (this.surface.setZoomIndicator) this.surface.setZoomIndicator(null);
        // Hand tool or pen-only touch: keep the running gesture alive and hand off straight
        // to single-finger pan (calling endGesture first would waste a sharp redraw and
        // re-snapshot the still-dimmed/pixelated canvas).
        if (allowPanHandoff && this.pointers.size === 1 && this.mode === 'idle') {
            const [id, p] = this.pointers.entries().next().value;
            const tool = this.getToolState ? this.getToolState().tool : null;
            if (tool === 'pan' || (this.scene.settings.penOnly && p.type === 'touch')) {
                this._startPan(id, p.sx, p.sy);
                return;
            }
        }
        this.surface.endGesture();
    }

    _startTapCandidate(committedDot) {
        const starts = new Map();
        for (const [id, p] of this.pointers) starts.set(id, { sx: p.sx, sy: p.sy });
        const cam = this.scene.camera;
        this.tapCandidate = {
            t0: performance.now(),
            starts,
            moved: false,
            committedDot,
            camera: { x: cam.x, y: cam.y, scale: cam.scale },
        };
    }

    _trackTapMove(pointerId, sx, sy) {
        const tc = this.tapCandidate;
        if (!tc || tc.moved) return;
        const st = tc.starts.get(pointerId);
        if (st && Math.hypot(sx - st.sx, sy - st.sy) > TAP_MAX_MOVE_PX) tc.moved = true;
    }

    /** On the first finger lift of a pinch: was it a two-finger tap? */
    _resolveTap() {
        const tc = this.tapCandidate;
        this.tapCandidate = null;
        if (!tc || tc.moved || !this.onTwoFingerTap) return false;
        if (performance.now() - tc.t0 > TAP_MAX_MS) return false;
        if (this.scene.settings.quickMenu === false) return false;

        // Undo the tiny pinch drift and any dot the first finger left behind.
        Object.assign(this.scene.camera, tc.camera);
        if (tc.committedDot && this.history.undo(this.scene.currentPage)) {
            if (this.onSceneMutated) this.onSceneMutated();
        }
        this.surface.requestCommittedRedraw();
        this.surface.renderActiveNow();
        if (this.onCameraChange) this.onCameraChange(this.scene.camera);

        const pts = [...tc.starts.values()];
        const rect = this.el.getBoundingClientRect();
        const x = rect.left + (pts[0].sx + pts[1].sx) / 2;
        const y = rect.top + (pts[0].sy + pts[1].sy) / 2;
        this.onTwoFingerTap(x, y);
        return true;
    }

    _onPointerMove(e) {
        if (!this.pointers.has(e.pointerId)) return;
        e.preventDefault();

        const { sx, sy } = this._getLocalPoint(e);
        const rec = this.pointers.get(e.pointerId);
        rec.sx = sx;
        rec.sy = sy;
        rec.w = e.width || 0;
        rec.h = e.height || 0;
        if (this.mode === 'pinch') this._trackTapMove(e.pointerId, sx, sy);

        // Mid-stroke palm detection upgrade (if touch blooms into palm)
        if (this.mode === 'draw' && this._isPalm(e) && performance.now() - this.strokeStartTime < 140) {
            this._cancelUncommittedDraw();
            this.palmActive = true;
            this._startErase(e, sx, sy, true);
            return;
        }

        if (this.mode === 'pinch' && this.pointers.size >= 2 && this.pinchAnchor) {
            let anchor = this.pinchAnchor;
            const p0 = this.pointers.get(anchor.id0);
            const p1 = this.pointers.get(anchor.id1);
            if (!p0 || !p1) {
                // One of the tracked fingers lifted while a 3rd finger remained: re-anchor cleanly.
                const prevIntent = anchor.intent === 'pan' || anchor.intent === 'zoom' ? anchor.intent : null;
                this._startPinch(prevIntent);
                anchor = this.pinchAnchor;
                if (!anchor) return;
            }
            const pts = [this.pointers.get(anchor.id0), this.pointers.get(anchor.id1)];
            const midX = (pts[0].sx + pts[1].sx) * 0.5;
            const midY = (pts[0].sy + pts[1].sy) * 0.5;
            const dist = Math.max(16, Math.hypot(pts[1].sx - pts[0].sx, pts[1].sy - pts[0].sy));

            // Recent spread readings, filtered below so a one-frame outlier neither decides
            // pan vs zoom nor jolts the zoom.
            const samples = anchor.spreadSamples;
            samples.push(dist);
            if (samples.length > PINCH_SPREAD_MEDIAN_N) samples.shift();
            let justEngaged = false;

            if (anchor.intent === 'undecided') {
                const now = performance.now();
                const d0x = pts[0].sx - anchor.p0Start.sx;
                const d0y = pts[0].sy - anchor.p0Start.sy;
                const d1x = pts[1].sx - anchor.p1Start.sx;
                const d1y = pts[1].sy - anchor.p1Start.sy;
                const m0 = Math.hypot(d0x, d0y);
                const m1 = Math.hypot(d1x, d1y);

                // Brief touchdown settle window so IR contact bloom does not poison startDist.
                if (!anchor.settled) {
                    if (now - anchor.t0 < PINCH_SETTLE_MS && Math.max(m0, m1) < PINCH_SETTLE_MOVE_PX) {
                        anchor.startDist = median(samples);
                        anchor.p0Start = { sx: pts[0].sx, sy: pts[0].sy };
                        anchor.p1Start = { sx: pts[1].sx, sy: pts[1].sy };
                        anchor.midStartX = midX;
                        anchor.midStartY = midY;
                        this.scene.camera.x = anchor.worldMid.x - midX / anchor.startScale;
                        this.scene.camera.y = anchor.worldMid.y - midY / anchor.startScale;
                        this.surface.requestCommittedRedraw();
                        this.surface.renderActiveNow();
                        if (this.onCameraChange) this.onCameraChange(this.scene.camera);
                        this._emitTelemetry(e, 1);
                        return;
                    }
                    anchor.settled = true;
                }

                const spread = median(samples);
                const midMove = Math.hypot(midX - anchor.midStartX, midY - anchor.midStartY);
                const dDist = Math.abs(spread - anchor.startDist);
                const relDist = dDist / Math.max(1, anchor.startDist);
                const cosAngle = (m0 > 4 && m1 > 4) ? (d0x * d1x + d0y * d1y) / (m0 * m1) : 0;

                const minPx = anchor.eagerZoom ? PINCH_EAGER_MIN_PX : PINCH_ZOOM_MIN_PX;
                const minRel = anchor.eagerZoom ? PINCH_EAGER_MIN_REL : PINCH_ZOOM_MIN_REL;
                const nonParallel = anchor.eagerZoom || cosAngle < 0.5 || dDist > midMove * 0.85;

                if (samples.length >= PINCH_SPREAD_MEDIAN_N && dDist >= minPx && relDist >= minRel && nonParallel) {
                    // Zoom engages from the current spread (no scale jump).
                    anchor.intent = 'zoom';
                    // From the filtered spread: a raw reading here could be an outlier and
                    // would make the whole zoom go the wrong way.
                    anchor.zoomStartDist = spread;
                    anchor.smoothDist = spread;
                    justEngaged = true;
                    anchor.zoomStartScale = this.scene.camera.scale;
                    anchor.zoomWorldMid = screenToWorld(midX, midY, this.scene.camera);
                    const base = this.scene.camera.baseScale || 1;
                    anchor.passedAwayFromBase = Math.abs(anchor.zoomStartScale / base - 1) > 0.06;
                    anchor.snappedToBase = false;
                } else if (!anchor.eagerZoom && midMove >= PINCH_PAN_COMMIT_PX
                    && dDist < PINCH_ZOOM_MIN_PX * 0.65
                    && m0 > 12 && m1 > 12 && cosAngle > 0.6
                    && midMove > dDist * 2.2) {
                    // Hard-lock this gesture to pan-only until fingers lift.
                    anchor.intent = 'pan';
                }
            }

            if (anchor.intent !== 'zoom') {
                // Pure pan: scale stays completely frozen.
                this.scene.camera.x = anchor.worldMid.x - midX / anchor.startScale;
                this.scene.camera.y = anchor.worldMid.y - midY / anchor.startScale;
                this.surface.requestCommittedRedraw();
                this.surface.renderActiveNow();
                if (this.onCameraChange) this.onCameraChange(this.scene.camera);
                this._emitTelemetry(e, 1);
                return;
            }

            // Smooth finger spread to damp IR quantization jitter (no change on the frame zoom
            // engages, so it starts without a jump).
            if (!justEngaged) {
                anchor.smoothDist += (median(samples) - anchor.smoothDist) * PINCH_DIST_SMOOTH;
            }
            const rawScale = clamp(
                anchor.zoomStartScale * (anchor.smoothDist / anchor.zoomStartDist),
                MIN_SCALE,
                MAX_SCALE
            );

            // Magnetic detent at 100% writing scale when returning toward baseScale.
            const base = this.scene.camera.baseScale || 1;
            const diffFromBase = Math.abs(rawScale / base - 1);
            if (!anchor.passedAwayFromBase && diffFromBase > ZOOM_DETENT_ARM) {
                anchor.passedAwayFromBase = true;
            }
            let newScale = rawScale;
            if (anchor.passedAwayFromBase) {
                if (anchor.snappedToBase) {
                    if (diffFromBase <= ZOOM_DETENT_EXIT) newScale = base;
                    else anchor.snappedToBase = false;
                } else if (diffFromBase <= ZOOM_DETENT_ENTER) {
                    anchor.snappedToBase = true;
                    newScale = base;
                }
            }

            this.scene.camera.scale = newScale;
            this.scene.camera.x = anchor.zoomWorldMid.x - midX / newScale;
            this.scene.camera.y = anchor.zoomWorldMid.y - midY / newScale;

            if (this.surface.setZoomIndicator) {
                const pct = Math.round((newScale / base) * 100);
                this.surface.setZoomIndicator({ sx: midX, sy: midY, pct, snapped: anchor.snappedToBase }, false);
            }
            this.surface.requestCommittedRedraw();
            this.surface.renderActiveNow();
            if (this.onCameraChange) this.onCameraChange(this.scene.camera);
            this._emitTelemetry(e, 1);
            return;
        }

        if (this.mode === 'pan' && e.pointerId === this.activePointerId && this.panAnchor) {
            const dx = sx - this.panAnchor.sx;
            const dy = sy - this.panAnchor.sy;
            this.scene.camera.x = this.panAnchor.camX - dx / this.scene.camera.scale;
            this.scene.camera.y = this.panAnchor.camY - dy / this.scene.camera.scale;
            this.surface.requestCommittedRedraw();
            this.surface.renderActiveNow();
            if (this.onCameraChange) this.onCameraChange(this.scene.camera);
            this._emitTelemetry(e, 1);
            return;
        }

        if (e.pointerId !== this.activePointerId) return;

        const t0 = performance.now();
        const samples = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
        const list = samples && samples.length > 0 ? samples : [e];

        if (this.mode === 'draw' && this.currentStroke) {
            const pts = this.currentStroke.points;
            const minStepMm = 0.25;
            let added = false;

            for (let i = 0; i < list.length; i++) {
                const lp = this._getLocalPoint(list[i]);
                const wp = screenToWorld(lp.sx, lp.sy, this.scene.camera);
                const last = pts[pts.length - 1];
                if (!last || Math.hypot(wp.x - last.x, wp.y - last.y) >= minStepMm) {
                    pts.push(wp);
                    added = true;
                }
            }
            const dp = this.dismissPress;
            if (dp && !dp.moved && Math.hypot(sx - dp.sx, sy - dp.sy) > DISMISS_TAP_MOVE_PX) {
                dp.moved = true;
                this.surface.setActiveStroke(this.currentStroke);
            } else if (added && !(dp && !dp.moved)) {
                if (typeof this.surface.drawActiveStrokeProgress === 'function') {
                    this.surface.drawActiveStrokeProgress();
                } else {
                    this.surface.renderActiveNow();
                }
            }
            this._emitTelemetry(e, list.length, performance.now() - t0);
        } else if (this.mode === 'erase' && this.currentErase) {
            let changed = false;
            let lastWp = null;
            for (let i = 0; i < list.length; i++) {
                const lp = this._getLocalPoint(list[i]);
                const wp = screenToWorld(lp.sx, lp.sy, this.scene.camera);
                lastWp = wp;
                if (this.currentErase.applyAt(wp.x, wp.y, this.activeEraseRadius)) {
                    changed = true;
                }
            }
            if (lastWp) {
                this.surface.setEraserCursor({ x: lastWp.x, y: lastWp.y, radius: this.activeEraseRadius });
            }
            if (changed) {
                this.surface.requestCommittedRedraw();
            }
            this._emitTelemetry(e, list.length, performance.now() - t0);
        } else if (this.mode === 'laser') {
            const wp = screenToWorld(sx, sy, this.scene.camera);
            this.surface.addLaserPoint(wp.x, wp.y);
            this._emitTelemetry(e, list.length, performance.now() - t0);
        } else if (this.mode === 'shape' && this.shapeAnchor) {
            const wp = screenToWorld(sx, sy, this.scene.camera);
            this.shapeAnchor.endWorld = wp;
            const preview = createShapeStroke(
                this.shapeAnchor.startWorld,
                wp,
                this.shapeAnchor.shapeKind,
                this.shapeAnchor.styleOpts
            );
            this.surface.setActiveShape(preview);
            this._emitTelemetry(e, 1, performance.now() - t0);
        } else if (this.mode === 'lasso' && this.lasso) {
            for (let i = 0; i < list.length; i++) {
                const lp = this._getLocalPoint(list[i]);
                const wp = screenToWorld(lp.sx, lp.sy, this.scene.camera);
                this.lasso.updateInteraction(wp.x, wp.y);
            }
            this._emitTelemetry(e, list.length, performance.now() - t0);
        }
    }

    _onPointerUp(e) {
        this.pointers.delete(e.pointerId);

        if (this.mode === 'pinch') {
            if (this.pointers.size < 2) {
                const openedMenu = this._resolveTap();
                const prevIntent = this.pinchAnchor ? this.pinchAnchor.intent : null;
                this.pinchAnchor = null;
                if (this.surface.setZoomIndicator) this.surface.setZoomIndicator(null);

                if (openedMenu || this.pointers.size === 0) {
                    this.mode = 'idle';
                    this.lastPinchIntent = null;
                    this.surface.endGesture();
                } else {
                    // One finger still down: keep fastPan alive briefly in case an IR board
                    // momentarily dropped the second finger due to axis shadowing.
                    this.mode = 'pinch-cooldown';
                    this.lastPinchIntent = prevIntent === 'pan' || prevIntent === 'zoom' ? prevIntent : null;
                    clearTimeout(this.pinchDropTimer);
                    this.pinchDropTimer = setTimeout(() => this._finishPinchDrop(), PINCH_DROP_GRACE_MS);
                }
            }
            return;
        }

        if (this.mode === 'pinch-cooldown') {
            if (this.pointers.size === 0) {
                this._finishPinchDrop();
            }
            return;
        }

        if (e.pointerId !== this.activePointerId) return;

        if (this.mode === 'draw') {
            this._commitDraw();
        } else if (this.mode === 'erase') {
            this._finishErase();
        } else if (this.mode === 'shape') {
            this._commitShape();
        } else if (this.mode === 'lasso' && this.lasso) {
            this.lasso.endInteraction();
        } else if (this.mode === 'pan') {
            this.surface.endGesture();
        }

        this.mode = 'idle';
        this.activePointerId = null;
        this.panAnchor = null;
        this.palmActive = false;
    }

    _onPointerCancel(e) {
        this.pointers.delete(e.pointerId);

        if (this.mode === 'pinch') {
            if (this.pointers.size < 2) {
                this.tapCandidate = null;
                const prevIntent = this.pinchAnchor ? this.pinchAnchor.intent : null;
                this.pinchAnchor = null;
                if (this.surface.setZoomIndicator) this.surface.setZoomIndicator(null);
                if (this.pointers.size === 0) {
                    this.mode = 'idle';
                    this.lastPinchIntent = null;
                    this.surface.endGesture();
                } else {
                    this.mode = 'pinch-cooldown';
                    this.lastPinchIntent = prevIntent === 'pan' || prevIntent === 'zoom' ? prevIntent : null;
                    clearTimeout(this.pinchDropTimer);
                    this.pinchDropTimer = setTimeout(() => this._finishPinchDrop(), PINCH_DROP_GRACE_MS);
                }
            }
            return;
        }

        if (this.mode === 'pinch-cooldown') {
            if (this.pointers.size === 0) {
                this._finishPinchDrop();
            }
            return;
        }

        if (e.pointerId !== this.activePointerId) return;

        if (this.mode === 'draw') {
            this._cancelUncommittedDraw();
        } else if (this.mode === 'erase') {
            this._finishErase();
        } else if (this.mode === 'shape') {
            this._cancelUncommittedShape();
        } else if (this.mode === 'lasso' && this.lasso) {
            this.lasso.cancelInteraction();
        } else if (this.mode === 'pan') {
            this.surface.endGesture();
        }

        this.mode = 'idle';
        this.activePointerId = null;
        this.panAnchor = null;
        this.palmActive = false;
    }

    _cancelUncommittedDraw() {
        this.currentStroke = null;
        this.dismissPress = null;
        this.surface.setActiveStroke(null);
        if (this.mode === 'draw') {
            this.mode = 'idle';
            this.activePointerId = null;
        }
    }

    _cancelUncommittedShape() {
        this.shapeAnchor = null;
        this.surface.setActiveShape(null);
        if (this.mode === 'shape') {
            this.mode = 'idle';
            this.activePointerId = null;
        }
    }

    _commitShape() {
        const anchor = this.shapeAnchor;
        this.shapeAnchor = null;
        this.surface.setActiveShape(null);
        if (!anchor) return;

        const dist = Math.hypot(
            anchor.endWorld.x - anchor.startWorld.x,
            anchor.endWorld.y - anchor.startWorld.y
        );
        if (dist < 0.5) return;

        // Bypass _commitDraw()'s simplifyRDP(..., 0.09) so exact corners and ellipses stay crisp
        const stroke = createShapeStroke(
            anchor.startWorld,
            anchor.endWorld,
            anchor.shapeKind,
            anchor.styleOpts
        );
        this.scene.strokes.push(stroke);
        this.history.push({ type: 'add', stroke });
        this.surface.appendStroke(stroke);
        if (this.onSceneMutated) this.onSceneMutated();
    }

    _commitDraw() {
        const stroke = this.currentStroke;
        const dismissing = this.dismissPress;
        this.currentStroke = null;
        this.dismissPress = null;
        // A tap that only closed a menu leaves no dot (a real stroke from it is kept).
        if (!stroke || stroke.points.length === 0 || (dismissing && !dismissing.moved)) {
            this.surface.setActiveStroke(null);
            return false;
        }

        // Simplify curve in world mm for compact storage while preserving fine handwriting hooks
        if (stroke.points.length > 3) {
            stroke.points = simplifyRDP(stroke.points, 0.09);
        }
        refreshStrokeBBox(stroke);

        this.scene.strokes.push(stroke);
        this.history.push({ type: 'add', stroke });
        this.surface.commitActiveStroke(stroke);
        if (this.onSceneMutated) this.onSceneMutated();
        return true;
    }

    _finishErase() {
        const gesture = this.currentErase;
        this.currentErase = null;
        this.surface.setEraserCursor(null);
        if (!gesture) return;

        const cmd = gesture.finish();
        if (cmd) {
            this.history.push(cmd);
            this.surface.renderCommittedNow();
            if (this.onSceneMutated) this.onSceneMutated();
        }
    }

    _onWheel(e) {
        if (this.surface.overviewMode) return;
        e.preventDefault();
        if ((e.ctrlKey || e.metaKey) && this.scene.settings.zoomLock) return;

        if (this.surface.stopGlide) this.surface.stopGlide();
        // Wheel / trackpad scrolling has no start or end event: the gesture ends after a pause.
        this.surface.beginGesture();
        clearTimeout(this.wheelEndTimer);
        this.wheelEndTimer = setTimeout(() => this.surface.endGesture(), 140);

        const { sx, sy } = this._getLocalPoint(e);
        if (e.ctrlKey || e.metaKey) {
            // Pinch-zoom on trackpads or Ctrl+wheel (raw & immediate — no touch deadzone)
            const worldBefore = screenToWorld(sx, sy, this.scene.camera);
            const zoomFactor = Math.exp(-e.deltaY * 0.008);
            const newScale = clamp(this.scene.camera.scale * zoomFactor, MIN_SCALE, MAX_SCALE);
            this.scene.camera.scale = newScale;
            this.scene.camera.x = worldBefore.x - sx / newScale;
            this.scene.camera.y = worldBefore.y - sy / newScale;
        } else {
            // Natural pan (scroll down or laterally!)
            this.scene.camera.x += e.deltaX / this.scene.camera.scale;
            this.scene.camera.y += e.deltaY / this.scene.camera.scale;
        }

        this.surface.requestCommittedRedraw();
        this.surface.renderActiveNow();
        if (this.onCameraChange) this.onCameraChange(this.scene.camera);
    }
}
