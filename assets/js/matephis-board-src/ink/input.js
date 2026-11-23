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
} from './geometry.js';
import { createStroke, refreshStrokeBBox } from './stroke.js';
import { EraseGesture } from './eraser.js';

const GESTURE_CANCEL_MS = 95;
// Two-finger tap (opens the quick menu): both fingers down and up quickly, barely moving.
const TAP_MAX_MS = 350;
const TAP_MAX_MOVE_PX = 14;
// A first-finger dot committed just before the second finger landed is undone on a tap.
const TAP_DOT_MS = 250;

export class InputController {
    constructor(surface, {
        scene,
        history,
        overlay = null,
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
        this.mode = 'idle';        // 'idle' | 'draw' | 'erase' | 'laser' | 'pan' | 'pinch'
        this.activePointerId = null;
        this.strokeStartTime = 0;
        this.currentStroke = null;
        this.currentErase = null;
        this.palmActive = false;
        this.spaceHeld = false;

        this.panAnchor = null;
        this.pinchAnchor = null;

        this._bindEvents();
    }

    _bindEvents() {
        this.el.addEventListener('pointerdown', (e) => this._onPointerDown(e));
        this.el.addEventListener('pointermove', (e) => this._onPointerMove(e));
        this.el.addEventListener('pointerup', (e) => this._onPointerUp(e));
        this.el.addEventListener('pointercancel', (e) => this._onPointerUp(e));
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
    }

    _isTypingTarget(target) {
        if (!target) return false;
        const tag = target.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    }

    _getLocalPoint(e) {
        const rect = this.el.getBoundingClientRect();
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

        // Notify toolbar/popovers to auto-dismiss; swallow tap if a popover was dismissed
        if (this.onCanvasTouch && this.onCanvasTouch() === true) {
            this.pointers.delete(e.pointerId);
            return;
        }

        // Check palm-to-erase immediately
        if (this._isPalm(e) || (this.scene.settings.palmErase && this.pointers.size >= 3 && e.pointerType === 'touch')) {
            this._cancelUncommittedDraw();
            this.palmActive = true;
            this._startErase(e, sx, sy, true);
            this._emitTelemetry(e, 1);
            return;
        }

        // Transition to 2-finger pan/pinch-zoom
        if (this.pointers.size === 2 && !this.palmActive) {
            // Cancel accidental micro-dot if 2nd finger landed right after 1st
            const sinceFirst = performance.now() - this.strokeStartTime;
            let committedDot = false;
            if (this.mode === 'draw' && sinceFirst < GESTURE_CANCEL_MS) {
                this._cancelUncommittedDraw();
            } else if (this.mode === 'draw') {
                committedDot = sinceFirst < TAP_DOT_MS;
                this._commitDraw();
            } else if (this.mode === 'erase') {
                this._finishErase();
            }
            this._startPinch();
            this._startTapCandidate(committedDot);
            this._emitTelemetry(e, 1);
            return;
        }

        if (this.pointers.size > 2) {
            this.tapCandidate = null;
            return;
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
        } else if (toolState.tool === 'connector') {
            const pt = screenToWorld(sx, sy, this.scene.camera);
            if (this.onConnectorPlace) this.onConnectorPlace(pt.x, pt.y);
        } else {
            this._startDraw(e, sx, sy, toolState);
        }

        this._emitTelemetry(e, 1);
    }

    _startDraw(e, sx, sy, toolState) {
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
        this.surface.setActiveStroke(this.currentStroke);
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

    _startPinch() {
        const pts = Array.from(this.pointers.values());
        if (pts.length < 2) return;
        this.surface.beginGesture();
        this.mode = 'pinch';
        this.activePointerId = null;
        const midX = (pts[0].sx + pts[1].sx) * 0.5;
        const midY = (pts[0].sy + pts[1].sy) * 0.5;
        const dist = Math.hypot(pts[1].sx - pts[0].sx, pts[1].sy - pts[0].sy);
        this.pinchAnchor = {
            midX,
            midY,
            dist: Math.max(10, dist),
            worldMid: screenToWorld(midX, midY, this.scene.camera),
            startScale: this.scene.camera.scale,
        };
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
        if (!tc || tc.moved || !this.onTwoFingerTap) return;
        if (performance.now() - tc.t0 > TAP_MAX_MS) return;
        if (this.scene.settings.quickMenu === false) return;

        // Undo the tiny pinch drift and any dot the first finger left behind.
        Object.assign(this.scene.camera, tc.camera);
        if (tc.committedDot && this.history.undo(this.scene.strokes)) {
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
            const pts = Array.from(this.pointers.values());
            const midX = (pts[0].sx + pts[1].sx) * 0.5;
            const midY = (pts[0].sy + pts[1].sy) * 0.5;
            const dist = Math.max(10, Math.hypot(pts[1].sx - pts[0].sx, pts[1].sy - pts[0].sy));

            const newScale = clamp(
                this.pinchAnchor.startScale * (dist / this.pinchAnchor.dist),
                MIN_SCALE,
                MAX_SCALE
            );
            this.scene.camera.scale = newScale;
            this.scene.camera.x = this.pinchAnchor.worldMid.x - midX / newScale;
            this.scene.camera.y = this.pinchAnchor.worldMid.y - midY / newScale;

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
            if (added) {
                this.surface.renderActiveNow();
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
        }
    }

    _onPointerUp(e) {
        this.pointers.delete(e.pointerId);

        if (this.mode === 'pinch') {
            if (this.pointers.size < 2) {
                this._resolveTap();
                this.pinchAnchor = null;
                this.mode = 'idle';
                this.surface.endGesture();
            }
            return;
        }

        if (e.pointerId !== this.activePointerId) return;

        if (this.mode === 'draw') {
            this._commitDraw();
        } else if (this.mode === 'erase') {
            this._finishErase();
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
        this.surface.setActiveStroke(null);
        if (this.mode === 'draw') {
            this.mode = 'idle';
            this.activePointerId = null;
        }
    }

    _commitDraw() {
        const stroke = this.currentStroke;
        this.currentStroke = null;
        this.surface.setActiveStroke(null);
        if (!stroke || stroke.points.length === 0) return;

        // Simplify curve in world mm for compact storage while preserving fine handwriting hooks
        if (stroke.points.length > 3) {
            stroke.points = simplifyRDP(stroke.points, 0.09);
        }
        refreshStrokeBBox(stroke);

        this.scene.strokes.push(stroke);
        this.history.push({ type: 'add', stroke });
        this.surface.appendStroke(stroke);
        if (this.onSceneMutated) this.onSceneMutated();
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

        // Wheel / trackpad scrolling has no start or end event: the gesture ends after a pause.
        this.surface.beginGesture();
        clearTimeout(this.wheelEndTimer);
        this.wheelEndTimer = setTimeout(() => this.surface.endGesture(), 140);

        const { sx, sy } = this._getLocalPoint(e);
        if (e.ctrlKey || e.metaKey) {
            // Pinch-zoom on trackpads or Ctrl+wheel
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
