/**
 * Dual-canvas low-latency renderer for Matephis Board.
 *
 * Layer 1 (committed): background crop marks + highlighter underlay + pen strokes.
 *   Redrawn ONLY on stroke commit, erase, camera pan/zoom, undo/redo, or theme change.
 * Layer 2 (active): desynchronized low-latency overlay for the single in-flight stroke,
 *   eraser cursor ring, and fading laser pointer trail.
 */

import {
    A4_W,
    A4_H,
    bboxIntersects,
    clamp,
    worldToScreen,
} from './geometry.js';
import { drawStroke } from './stroke.js';

const LASER_LIFETIME_MS = 1250;

// Image-based pan/zoom (setting `fastPan`): while fingers move, the last sharp picture of
// the board is moved/scaled instead of redrawing every stroke each frame.
export const GESTURE_DIM = 0.6;           // ink and widget opacity while moving (reads as "moving", hides softness)
const SNAP_MARGIN = 0.15;          // extra picture around the screen so a pan rarely shows an edge
const REFRESH_ZOOM_RATIO = 1.2;    // re-render a sharp picture once zoom drifts more than this
const REFRESH_MIN_MS = 150;        // ...but at most this often,
const REFRESH_COST_FACTOR = 8;     // ...and spaced by 8× the measured redraw cost on heavy pages
const SETTLE_MS = 120;             // soft → sharp fade when the gesture ends
export const PIXEL_BLOCK_PX = 6;          // EXPERIMENT: block size of the pixelated gesture effect
const PIXEL_SETTLE_MS = 160;       // EXPERIMENT: blocks shrink to sharp over this time
const SNAP_RELEASE_DEFAULT_MS = 30000; // idle time before the gesture pictures are freed

/**
 * Idle time before the pan/zoom pictures are freed (setting `snapRelease`):
 * '2000' | '30000' ms, or 'never' to keep them like before. Returns null for never.
 */
export function snapReleaseDelay(settings) {
    const v = settings && settings.snapRelease;
    if (v === 'never') return null;
    const ms = Number(v);
    return Number.isFinite(ms) && ms > 0 ? ms : SNAP_RELEASE_DEFAULT_MS;
}

const canvasBytes = (c) => (c ? c.width * c.height * 4 : 0);

/**
 * Shared helper: draws faint landscape A4 borders + subtle corner ticks.
 */
export function drawA4Borders(ctx, cam, viewBox, theme = 'light', showLabels = true) {
    const minCol = Math.floor(viewBox.minX / A4_W);
    const maxCol = Math.ceil(viewBox.maxX / A4_W);
    const minRow = Math.floor(viewBox.minY / A4_H);
    const maxRow = Math.ceil(viewBox.maxY / A4_H);

    // Guard against extreme zoom-out drawing too many grid lines
    if ((maxCol - minCol) * (maxRow - minRow) > 200) return;

    const isDark = theme === 'dark';
    const armPx = clamp(cam.scale * 5.0, 5, 14);

    ctx.save();

    // 1. Subtle continuous dashed A4 page borders
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();

    const topPt = worldToScreen(0, minRow * A4_H, cam);
    const botPt = worldToScreen(0, maxRow * A4_H, cam);
    for (let col = minCol; col <= maxCol; col++) {
        const x = Math.round(worldToScreen(col * A4_W, 0, cam).x) + 0.5;
        ctx.moveTo(x, topPt.y);
        ctx.lineTo(x, botPt.y);
    }

    const leftPt = worldToScreen(minCol * A4_W, 0, cam);
    const rightPt = worldToScreen(maxCol * A4_W, 0, cam);
    for (let row = minRow; row <= maxRow; row++) {
        const y = Math.round(worldToScreen(0, row * A4_H, cam).y) + 0.5;
        ctx.moveTo(leftPt.x, y);
        ctx.lineTo(rightPt.x, y);
    }
    ctx.stroke();

    // 2. Slightly crisper solid corner crosshairs at A4 intersections
    ctx.setLineDash([]);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            const pt = worldToScreen(col * A4_W, row * A4_H, cam);
            const sx = Math.round(pt.x) + 0.5;
            const sy = Math.round(pt.y) + 0.5;
            ctx.moveTo(sx - armPx, sy);
            ctx.lineTo(sx + armPx, sy);
            ctx.moveTo(sx, sy - armPx);
            ctx.lineTo(sx, sy + armPx);
        }
    }
    ctx.stroke();

    // 3. Quiet tile label at top-left of each A4 tile (hidden in pinned strip preview)
    if (showLabels) {
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.24)';
        ctx.font = '500 10px "Space Mono", monospace';
        for (let row = minRow; row < maxRow; row++) {
            for (let col = minCol; col < maxCol; col++) {
                const pt = worldToScreen(col * A4_W, row * A4_H, cam);
                const label = col === 0 && row === 0 ? 'A4' : `${row + 1}·${col + 1}`;
                ctx.fillText(label, Math.round(pt.x) + 6, Math.round(pt.y) + 14);
            }
        }
    }

    ctx.restore();
}

/**
 * Shared helper: draws page background pattern (grid / dots / ruled) in world mm units.
 * Automatically coarsens spacing when zoomed far out so patterns never turn muddy.
 */
export function drawPageBackground(ctx, cam, viewBox, background = 'blank', theme = 'light') {
    if (!background || background === 'blank') return;

    const isDark = theme === 'dark';

    if (background === 'grid') {
        let stepMm = 5;
        if (stepMm * cam.scale < 8) stepMm = 10;
        if (stepMm * cam.scale < 6) return;

        const minX = Math.floor(viewBox.minX / stepMm) * stepMm;
        const maxX = Math.ceil(viewBox.maxX / stepMm) * stepMm;
        const minY = Math.floor(viewBox.minY / stepMm) * stepMm;
        const maxY = Math.ceil(viewBox.maxY / stepMm) * stepMm;
        if ((maxX - minX) / stepMm > 300 || (maxY - minY) / stepMm > 300) return;

        const topPt = worldToScreen(0, minY, cam);
        const botPt = worldToScreen(0, maxY, cam);
        const leftPt = worldToScreen(minX, 0, cam);
        const rightPt = worldToScreen(maxX, 0, cam);

        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.075)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let wx = minX; wx <= maxX; wx += stepMm) {
            const x = Math.round(worldToScreen(wx, 0, cam).x) + 0.5;
            ctx.moveTo(x, topPt.y);
            ctx.lineTo(x, botPt.y);
        }
        for (let wy = minY; wy <= maxY; wy += stepMm) {
            const y = Math.round(worldToScreen(0, wy, cam).y) + 0.5;
            ctx.moveTo(leftPt.x, y);
            ctx.lineTo(rightPt.x, y);
        }
        ctx.stroke();
        ctx.restore();
        return;
    }

    if (background === 'dots') {
        let stepMm = 5;
        if (stepMm * cam.scale < 10) stepMm = 10;
        if (stepMm * cam.scale < 7) return;

        const minX = Math.floor(viewBox.minX / stepMm) * stepMm;
        const maxX = Math.ceil(viewBox.maxX / stepMm) * stepMm;
        const minY = Math.floor(viewBox.minY / stepMm) * stepMm;
        const maxY = Math.ceil(viewBox.maxY / stepMm) * stepMm;
        const nx = (maxX - minX) / stepMm;
        const ny = (maxY - minY) / stepMm;
        if (nx * ny > 18000) return;

        const r = clamp(cam.scale * 0.22, 0.9, 1.8);
        ctx.save();
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.20)';
        ctx.beginPath();
        for (let wy = minY; wy <= maxY; wy += stepMm) {
            const sy = worldToScreen(0, wy, cam).y;
            for (let wx = minX; wx <= maxX; wx += stepMm) {
                const sx = worldToScreen(wx, 0, cam).x;
                ctx.moveTo(sx + r, sy);
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
            }
        }
        ctx.fill();
        ctx.restore();
        return;
    }

    if (background === 'ruled') {
        let stepMm = 8;
        if (stepMm * cam.scale < 10) stepMm = 16;
        if (stepMm * cam.scale < 6) return;

        const minY = Math.floor(viewBox.minY / stepMm) * stepMm;
        const maxY = Math.ceil(viewBox.maxY / stepMm) * stepMm;
        if ((maxY - minY) / stepMm > 300) return;

        const leftPt = worldToScreen(viewBox.minX, 0, cam);
        const rightPt = worldToScreen(viewBox.maxX, 0, cam);

        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let wy = minY; wy <= maxY; wy += stepMm) {
            const y = Math.round(worldToScreen(0, wy, cam).y) + 0.5;
            ctx.moveTo(leftPt.x, y);
            ctx.lineTo(rightPt.x, y);
        }
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * Shared vector renderer for rendering any page's strokes into a target canvas
 * (reused by PinnedStrip for crisp zoomable/pannable vector previews).
 */
/**
 * Connector badges drawn like the DOM ones (28px square, 2px border, bold label;
 * dashed when unpaired), in screen space for camera `cam`.
 */
function drawConnectorShapes(ctx, shapes, cam, width, height, theme) {
    const bg = theme === 'dark' ? '#121212' : '#ffffff';
    ctx.save();
    ctx.font = '700 13px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const c of shapes || []) {
        const sx = (c.x - cam.x) * cam.scale;
        const sy = (c.y - cam.y) * cam.scale;
        if (sx < -40 || sy < -40 || sx > width + 40 || sy > height + 40) continue;
        const w = Math.max(28, ctx.measureText(c.label).width + 16);
        const h = 28;
        ctx.fillStyle = bg;
        ctx.fillRect(sx - w / 2, sy - h / 2, w, h);
        ctx.setLineDash(c.paired ? [] : [4, 3]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = c.color;
        ctx.strokeRect(sx - w / 2 + 1, sy - h / 2 + 1, w - 2, h - 2);
        ctx.fillStyle = c.color;
        ctx.fillText(c.label, sx, sy + 1);
    }
    ctx.restore();
}

/** Draw widget pictures ({x, y, w, h, canvas} in mm) in world coordinates. */
export function drawWidgetPictures(ctx, pictures, viewBox = null) {
    for (const p of pictures || []) {
        if (!p || !p.canvas) continue;
        if (viewBox && (p.x > viewBox.maxX || p.y > viewBox.maxY || p.x + p.w < viewBox.minX || p.y + p.h < viewBox.minY)) continue;
        ctx.drawImage(p.canvas, p.x, p.y, p.w, p.h);
    }
}

export function renderPageToContext(
    ctx,
    width,
    height,
    dpr,
    strokes,
    cam,
    theme = 'light',
    showBorders = true,
    background = 'blank',
    pictures = null
) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = theme === 'dark' ? '#121212' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const viewBox = {
        minX: cam.x - 10,
        minY: cam.y - 10,
        maxX: cam.x + width / cam.scale + 10,
        maxY: cam.y + height / cam.scale + 10,
    };

    if (background && background !== 'blank') {
        drawPageBackground(ctx, cam, viewBox, background, theme);
    }

    if (showBorders) {
        drawA4Borders(ctx, cam, viewBox, theme, false);
    }

    ctx.save();
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.x, -cam.y);

    // Widgets as static pictures, under the ink
    if (pictures) drawWidgetPictures(ctx, pictures, viewBox);

    for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        if (s.tool !== 'highlighter') continue;
        if (!bboxIntersects(s.bbox, viewBox)) continue;
        drawStroke(ctx, s, theme);
    }
    for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        if (s.tool === 'highlighter') continue;
        if (!bboxIntersects(s.bbox, viewBox)) continue;
        drawStroke(ctx, s, theme);
    }

    ctx.restore();
    ctx.restore();
}

export class InkSurface {
    constructor(container, { scene, overlay = null, onPerfSample = null, onCameraChange = null }) {
        this.container = container;
        this.scene = scene;
        this.overlay = overlay;
        this.onPerfSample = onPerfSample;
        this.onCameraChange = onCameraChange;

        this.width = 0;
        this.height = 0;
        this.dpr = 1;
        this.theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

        this.overviewMode = false;
        this.savedCamera = null;
        this.cameraAnim = null;

        // Active-layer transient state
        this.activeStroke = null;
        this.activeShape = null;
        this.lassoOverlay = null; // { selectedStrokes, selectionBBox, marquee, drag }
        this.eraserCursor = null; // { x, y, radius } in world coords
        this.zoomIndicator = null; // { sx, sy, pct, snapped } while touch pinch-zoom is active
        this.laserPoints = [];    // [{ x, y, t }]
        this.laserRaf = null;

        this.lastCommittedRedrawMs = 0;
        this._committedDirty = true;
        this._rafPending = false;

        // Image-based pan/zoom state (ink layer only; bgCanvas & overlay stay crisp)
        this.gesture = null;      // { lastRefresh, refreshTimer } while a pan/zoom gesture runs
        this.snap = null;         // { canvas, cam, margin, cssW, cssH }: transparent ink picture
        this._snapCanvases = [document.createElement('canvas'), document.createElement('canvas')];
        this._settleRaf = null;
        this._snapReleaseTimer = null;
        this._snapReleaseAt = 0;  // when the pending release fires (performance.now() clock)
        this.gestureStats = null; // last gesture: picture costs and whether canvases were allocated

        this._createCanvases();
        this.resize();
    }

    setOverlay(overlay) {
        this.overlay = overlay;
        if (this.overlay) {
            this.overlay.setOverviewMode(this.overviewMode);
            this.overlay.syncCamera(this.scene.camera);
        }
    }

    _createCanvases() {
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.className = 'board-canvas board-canvas-bg';
        this.bgCtx = this.bgCanvas.getContext('2d', { alpha: false });

        this.committedCanvas = document.createElement('canvas');
        this.committedCanvas.className = 'board-canvas board-canvas-committed';
        this.committedCtx = this.committedCanvas.getContext('2d', { alpha: true });

        this.activeCanvas = document.createElement('canvas');
        this.activeCanvas.className = 'board-canvas board-canvas-active';
        // Request desynchronized context for lowest possible pointer-to-glass latency
        this.activeCtx =
            this.activeCanvas.getContext('2d', { alpha: true, desynchronized: true }) ||
            this.activeCanvas.getContext('2d', { alpha: true });

        this.container.appendChild(this.bgCanvas);
        this.container.appendChild(this.committedCanvas);
        this.container.appendChild(this.activeCanvas);
    }

    setTheme(theme) {
        this.theme = theme === 'dark' ? 'dark' : 'light';
        this.requestCommittedRedraw();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));
        const maxDpr = this.scene.settings.lowDpr ? 1 : 2;
        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

        if (w === this.width && h === this.height && dpr === this.dpr) return;

        this.width = w;
        this.height = h;
        this.dpr = dpr;

        this._activeEmpty = true; // resizing clears the canvases
        for (const c of [this.bgCanvas, this.committedCanvas, this.activeCanvas]) {
            c.width = Math.round(w * dpr);
            c.height = Math.round(h * dpr);
            c.style.width = `${w}px`;
            c.style.height = `${h}px`;
        }

        this.scene.updateViewportBaseScale(w, h);
        this.renderCommittedNow();
        this.renderActiveNow();
        if (!this.gesture && !this._settleRaf) this.releaseSnapCanvases();
    }

    requestCommittedRedraw() {
        this._committedDirty = true;
        if (!this._rafPending) {
            this._rafPending = true;
            requestAnimationFrame(() => {
                this._rafPending = false;
                if (!this._committedDirty) return;
                if (this.gesture && this.snap) {
                    this._gestureFrame();
                } else {
                    this.renderCommittedNow();
                }
            });
        }
    }

    _getBgColor() {
        return this.theme === 'dark' ? '#121212' : '#ffffff';
    }

    _renderBackground(cam = this.scene.camera) {
        this._renderBackgroundTo(this.bgCtx, this.width, this.height, this.dpr, cam);
        if (this.overlay) this.overlay.syncCamera(cam);
    }

    renderCommittedNow() {
        this._cancelSettle();
        this._committedDirty = false;
        const t0 = performance.now();
        this._renderBackground(this.scene.camera);
        this._renderInkTo(this.committedCtx, this.width, this.height, this.dpr, this.scene.camera);
        // A full redraw during a gesture (undo, resize...) becomes the new picture to move.
        if (this.gesture) this._snapFromCommitted();
        this.lastCommittedRedrawMs = performance.now() - t0;
        if (this.onPerfSample) {
            this.onPerfSample({ committedRedrawMs: this.lastCommittedRedrawMs });
        }
    }

    /**
     * Draw only a just-finished pen stroke on top of the committed layer instead of redrawing
     * every stroke. Falls back to a full redraw when the layer is not up to date or the stroke
     * is a highlighter (those sit underneath the ink).
     */
    appendStroke(stroke) {
        if (stroke.tool === 'highlighter' || this._committedDirty || this.overviewMode
            || this.gesture || this._settleRaf) {
            this.renderCommittedNow();
            return;
        }
        const t0 = performance.now();
        const ctx = this.committedCtx;
        const cam = this.scene.camera;
        ctx.save();
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.scale(cam.scale, cam.scale);
        ctx.translate(-cam.x, -cam.y);
        drawStroke(ctx, stroke, this.theme);
        ctx.restore();
        this.lastCommittedRedrawMs = performance.now() - t0;
        if (this.onPerfSample) {
            this.onPerfSample({ committedRedrawMs: this.lastCommittedRedrawMs });
        }
    }

    // ---------- Image-based pan / zoom ----------

    /** Start of a pan / pinch / wheel gesture. Re-entrant: a running gesture continues. */
    beginGesture() {
        if (this.scene.settings.fastPan === false || this.overviewMode || this.cameraAnim) return;
        if (this.gesture) return;
        if (this._committedDirty) this.renderCommittedNow();
        this._cancelSettle();
        this._cancelSnapRelease();
        this.gesture = { lastRefresh: performance.now(), refreshTimer: null };
        this.gestureStats = { startMs: null, startAlloc: false, pictureMs: null, pictureAlloc: false };
        // Widgets get the same treatment as the ink. Fade: the overlay moves as a cached
        // GPU picture, dimmed like the ink. Pixel: the widgets' pictures are drawn into the
        // ink picture (so they pixelate with it) and the live overlay is hidden meanwhile.
        const effect = this.scene.settings.gestureEffect;
        this._gesturePictures = effect === 'pixel' && this.getWidgetPictures ? this.getWidgetPictures() : null;
        this._snapFromCommitted();
        if (this.overlay) {
            this.overlay.setGesture(true, effect, GESTURE_DIM, { hideWidgets: Boolean(this._gesturePictures && this._gesturePictures.length) });
        }
    }

    /** End of the gesture: one sharp redraw, faded in while the ink returns to full strength. */
    endGesture() {
        const g = this.gesture;
        if (!g) return;
        clearTimeout(g.refreshTimer);
        this.gesture = null;
        if (!this.snap) {
            if (this.overlay) this.overlay.setGesture(false);
            this.renderCommittedNow();
            this._scheduleSnapRelease();
            return;
        }

        const t0 = performance.now();
        const sharp = this._renderPicture(0);
        this.lastCommittedRedrawMs = performance.now() - t0;
        if (this.onPerfSample) this.onPerfSample({ committedRedrawMs: this.lastCommittedRedrawMs });
        this._committedDirty = false;

        const ctx = this.committedCtx;
        const start = performance.now();
        this._renderBackground(this.scene.camera);
        // EXPERIMENT (pixelated gesture): blocks shrink step by step instead of a fade.
        if (this.scene.settings.gestureEffect === 'pixel') {
            const hadPictures = Boolean(this._gesturePictures);
            if (this.overlay && !hadPictures) this.overlay.setGesture(false);
            const pixelStep = (now) => {
                const t = clamp((now - start) / PIXEL_SETTLE_MS, 0, 1);
                const block = Math.round(PIXEL_BLOCK_PX * (1 - t));
                ctx.save();
                ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
                ctx.clearRect(0, 0, this.width, this.height);
                if (block <= 1) {
                    ctx.drawImage(sharp.canvas, 0, 0, this.width, this.height);
                } else {
                    this._drawPixelated(ctx, sharp.canvas, 0, 0, this.width, this.height, block);
                }
                ctx.restore();
                if (t < 1) {
                    this._settleRaf = requestAnimationFrame(pixelStep);
                } else {
                    this._settleRaf = null;
                    // Sharp: the live widgets come back and the ink layer drops their pictures.
                    this._endWidgetPictures();
                    this._scheduleSnapRelease();
                }
            };
            this._settleRaf = requestAnimationFrame(pixelStep);
            return;
        }

        // Widgets are re-rendered sharp now; their dimming fades out with the ink's.
        if (this.overlay) this.overlay.setGesture(false, 'fade');
        const step = (now) => {
            const t = clamp((now - start) / SETTLE_MS, 0, 1);
            if (this.overlay) this.overlay.setGestureAlpha(t < 1 ? GESTURE_DIM + (1 - GESTURE_DIM) * t : 1);
            this._drawSnap(GESTURE_DIM * (1 - t));
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = t;
            ctx.drawImage(sharp.canvas, 0, 0);
            ctx.restore();
            if (t < 1) {
                this._settleRaf = requestAnimationFrame(step);
            } else {
                this._settleRaf = null;
                this._scheduleSnapRelease();
            }
        };
        this._settleRaf = requestAnimationFrame(step);
    }

    /** Leave the pixelated-widgets state: live overlay back, ink layer without pictures. */
    _endWidgetPictures() {
        if (!this._gesturePictures) return;
        this._gesturePictures = null;
        if (this.overlay) this.overlay.setGesture(false);
        this._renderInkTo(this.committedCtx, this.width, this.height, this.dpr, this.scene.camera);
    }

    _cancelSettle() {
        if (this.overlay && !this.gesture) this.overlay.setGestureAlpha(1);
        if (!this.gesture && this._gesturePictures) {
            this._gesturePictures = null;
            if (this.overlay) this.overlay.setGesture(false);
        }
        if (this._settleRaf) {
            cancelAnimationFrame(this._settleRaf);
            this._settleRaf = null;
            if (!this.gesture) this._scheduleSnapRelease();
        }
    }

    _gestureFrame() {
        this._committedDirty = false;
        this._renderBackground(this.scene.camera);
        const uncovered = this._drawSnap(GESTURE_DIM);
        const g = this.gesture;
        const ratio = this.scene.camera.scale / this.snap.cam.scale;
        const stale = uncovered || ratio > REFRESH_ZOOM_RATIO || ratio < 1 / REFRESH_ZOOM_RATIO;
        if (!stale) return;

        // Adaptive refresh: heavy pages refresh less often so the gesture stays smooth.
        const interval = Math.max(REFRESH_MIN_MS, this.lastCommittedRedrawMs * REFRESH_COST_FACTOR);
        const wait = g.lastRefresh + interval - performance.now();
        if (wait <= 0) {
            const t0 = performance.now();
            this.snap = this._renderPicture(SNAP_MARGIN);
            this.lastCommittedRedrawMs = performance.now() - t0;
            if (this.onPerfSample) this.onPerfSample({ committedRedrawMs: this.lastCommittedRedrawMs });
            g.lastRefresh = performance.now();
            this._drawSnap(GESTURE_DIM);
        } else if (!g.refreshTimer) {
            // Fingers may stop moving while still down: refresh anyway once allowed.
            g.refreshTimer = setTimeout(() => {
                if (this.gesture !== g) return;
                g.refreshTimer = null;
                this.requestCommittedRedraw();
            }, wait);
        }
    }

    /** Draw the gesture ink picture under the current camera. Returns true if an edge shows. */
    _drawSnap(alpha) {
        const snap = this.snap;
        const cam = this.scene.camera;
        const ctx = this.committedCtx;
        const k = cam.scale / snap.cam.scale;
        const dx = -snap.margin * k + (snap.cam.x - cam.x) * cam.scale;
        const dy = -snap.margin * k + (snap.cam.y - cam.y) * cam.scale;
        const dw = (snap.cssW + snap.margin * 2) * k;
        const dh = (snap.cssH + snap.margin * 2) * k;

        ctx.save();
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.clearRect(0, 0, this.width, this.height);
        // EXPERIMENT (pixelated gesture): remove this `if` and _drawPixelated() to drop it.
        if (this.scene.settings.gestureEffect === 'pixel') {
            this._drawPixelated(ctx, snap.canvas, dx, dy, dw, dh);
            ctx.restore();
            return dx > 0.5 || dy > 0.5 || dx + dw < this.width - 0.5 || dy + dh < this.height - 0.5;
        }
        ctx.globalAlpha = alpha;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(snap.canvas, dx, dy, dw, dh);
        ctx.restore();

        return dx > 0.5 || dy > 0.5 || dx + dw < this.width - 0.5 || dy + dh < this.height - 0.5;
    }

    // ---- EXPERIMENT: pixelated gesture (setting gestureEffect: 'pixel'). Delete this
    // ---- method, the `if` blocks in _drawSnap and endGesture, PIXEL_BLOCK_PX,
    // ---- PIXEL_SETTLE_MS, the gestureEffect setting and the Options row to remove it.
    /** Draw `img` as big square blocks: shrink into a tiny canvas, enlarge without smoothing. */
    _drawPixelated(ctx, img, dx, dy, dw, dh, block = PIXEL_BLOCK_PX) {
        const tw = Math.max(1, Math.ceil(this.width / block));
        const th = Math.max(1, Math.ceil(this.height / block));
        if (!this._pixelCanvas) this._pixelCanvas = document.createElement('canvas');
        const tiny = this._pixelCanvas;
        if (tiny.width !== tw) tiny.width = tw;
        if (tiny.height !== th) tiny.height = th;
        const tctx = tiny.getContext('2d', { alpha: true });
        const f = 1 / block;
        tctx.clearRect(0, 0, tw, th);
        tctx.imageSmoothingEnabled = true;
        tctx.imageSmoothingQuality = 'high';  // average each block instead of sampling one pixel
        tctx.drawImage(img, dx * f, dy * f, dw * f, dh * f);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tiny, 0, 0, tw * block, th * block);
    }

    /** Cheap picture at gesture start: a copy of the transparent ink layer on screen now. */
    _snapFromCommitted() {
        // Pixelated gesture with widgets: the picture to move must contain them too.
        if (this._gesturePictures) {
            this.snap = this._renderPicture(SNAP_MARGIN);
            return;
        }
        const t0 = performance.now();
        const canvas = this._takeSnapCanvas();
        const alloc = canvas.width !== this.committedCanvas.width || canvas.height !== this.committedCanvas.height;
        canvas.width = this.committedCanvas.width;
        canvas.height = this.committedCanvas.height;
        const sctx = canvas.getContext('2d', { alpha: true });
        sctx.clearRect(0, 0, canvas.width, canvas.height);
        sctx.drawImage(this.committedCanvas, 0, 0);
        this.snap = { canvas, cam: { ...this.scene.camera }, margin: 0, cssW: this.width, cssH: this.height };
        const st = this.gestureStats;
        if (this.gesture && st && st.startMs === null) {
            st.startMs = performance.now() - t0;
            st.startAlloc = alloc;
        }
    }

    /** Full sharp render of the ink layer under the current camera into a spare canvas. */
    _renderPicture(marginRatio) {
        const t0 = performance.now();
        const cam = this.scene.camera;
        const margin = Math.round(Math.max(this.width, this.height) * marginRatio);
        const cssW = this.width;
        const cssH = this.height;
        const canvas = this._takeSnapCanvas();
        const pxW = Math.round((cssW + margin * 2) * this.dpr);
        const pxH = Math.round((cssH + margin * 2) * this.dpr);
        const alloc = canvas.width !== pxW || canvas.height !== pxH;
        if (canvas.width !== pxW) canvas.width = pxW;
        if (canvas.height !== pxH) canvas.height = pxH;
        const shifted = { ...cam, x: cam.x - margin / cam.scale, y: cam.y - margin / cam.scale };
        this._renderInkTo(canvas.getContext('2d', { alpha: true }), cssW + margin * 2, cssH + margin * 2, this.dpr, shifted, this._gesturePictures);
        // First sharp picture of a gesture: the frame that pays for a freed canvas.
        const st = this.gestureStats;
        if (this.gesture && st && st.pictureMs === null) {
            st.pictureMs = performance.now() - t0;
            st.pictureAlloc = alloc;
        }
        return { canvas, cam: { ...cam }, margin, cssW, cssH };
    }

    /** The snapshot canvas not currently shown (two are reused, no per-frame allocation). */
    _takeSnapCanvas() {
        this._cancelSnapRelease();
        const [a, b] = this._snapCanvases;
        return this.snap && this.snap.canvas === a ? b : a;
    }

    _cancelSnapRelease() {
        if (this._snapReleaseTimer) {
            clearTimeout(this._snapReleaseTimer);
            this._snapReleaseTimer = null;
        }
        this._snapReleaseAt = 0;
    }

    _scheduleSnapRelease() {
        this._cancelSnapRelease();
        const delay = snapReleaseDelay(this.scene.settings);
        if (delay === null || this._snapBytes() === 0) return;
        this._snapReleaseAt = performance.now() + delay;
        this._snapReleaseTimer = setTimeout(() => {
            this._snapReleaseTimer = null;
            this._snapReleaseAt = 0;
            this.releaseSnapCanvases();
        }, delay);
    }

    /** The release setting changed: restart the idle countdown under the new delay. */
    snapReleaseSettingChanged() {
        if (!this.gesture && !this._settleRaf) this._scheduleSnapRelease();
    }

    _snapBytes() {
        return this._snapCanvases.reduce((n, c) => n + canvasBytes(c), 0) + canvasBytes(this._pixelCanvas);
    }

    /** Debug info for the HUD: memory held by the gesture pictures and the last gesture's costs. */
    snapInfo() {
        return {
            bytes: this._snapBytes(),
            delayMs: snapReleaseDelay(this.scene.settings),
            releaseInMs: this._snapReleaseAt ? Math.max(0, this._snapReleaseAt - performance.now()) : null,
            gestureActive: Boolean(this.gesture),
            last: this.gestureStats,
        };
    }

    /**
     * Free the offscreen gesture pictures so they do not hold memory while idle. Kept while a
     * gesture or its settle runs, and always kept with the setting 'never'.
     */
    releaseSnapCanvases() {
        this._cancelSnapRelease();
        if (this.gesture || this._settleRaf) return;
        if (snapReleaseDelay(this.scene.settings) === null) return;
        this.snap = null;
        for (const c of this._snapCanvases) {
            if (c.width !== 0) c.width = 0;
            if (c.height !== 0) c.height = 0;
        }
        if (this._pixelCanvas) {
            this._pixelCanvas.width = 0;
            this._pixelCanvas.height = 0;
            this._pixelCanvas = null;
        }
    }

    _renderBackgroundTo(ctx, width, height, dpr, cam) {
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Opaque page fill
        ctx.fillStyle = this._getBgColor();
        ctx.fillRect(0, 0, width, height);

        const viewBox = {
            minX: cam.x - 10,
            minY: cam.y - 10,
            maxX: cam.x + width / cam.scale + 10,
            maxY: cam.y + height / cam.scale + 10,
        };

        // Page pattern (grid / dots / ruled)
        if (!this.overviewMode) {
            drawPageBackground(ctx, cam, viewBox, this.scene.pageBackground, this.theme);
        }

        // Faint A4 corner crop marks (or full overview A4 grid)
        if (this.overviewMode) {
            this._drawOverviewGrid(ctx, cam);
        } else if (this.scene.settings.showCropMarks) {
            this._drawA4CropMarks(ctx, cam, viewBox);
        }

        ctx.restore();
    }

    _renderInkTo(ctx, width, height, dpr, cam, pictures = null) {
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        // World viewport culling box
        const viewBox = {
            minX: cam.x - 10,
            minY: cam.y - 10,
            maxX: cam.x + width / cam.scale + 10,
            maxY: cam.y + height / cam.scale + 10,
        };

        // Apply world transform for vector strokes
        ctx.save();
        ctx.scale(cam.scale, cam.scale);
        ctx.translate(-cam.x, -cam.y);

        // Widget pictures under the ink (only in pictures of a pixelated gesture)
        if (pictures) drawWidgetPictures(ctx, pictures, viewBox);

        const strokes = this.scene.strokes;
        // Pass 1: Highlighters (underlay so ink remains crisp on top in light & dark mode)
        for (let i = 0; i < strokes.length; i++) {
            const s = strokes[i];
            if (s.tool !== 'highlighter') continue;
            if (!bboxIntersects(s.bbox, viewBox)) continue;
            drawStroke(ctx, s, this.theme);
        }

        // Pass 2: Pen strokes
        for (let i = 0; i < strokes.length; i++) {
            const s = strokes[i];
            if (s.tool === 'highlighter') continue;
            if (!bboxIntersects(s.bbox, viewBox)) continue;
            drawStroke(ctx, s, this.theme);
        }

        ctx.restore();

        // Pixelated gesture: connectors (screen-sized badges above the ink) join the picture.
        if (pictures && this.getConnectorShapes) {
            drawConnectorShapes(ctx, this.getConnectorShapes(), cam, width, height, this.theme);
        }

        // In overview mode, highlight the saved writing viewport on top
        if (this.overviewMode && this.savedCamera) {
            this._drawSavedViewportFrame(ctx, cam, this.savedCamera);
        }

        ctx.restore();
    }

    /**
     * Landscape A4 page borders + subtle corner ticks on the clear canvas.
     * Drawn crisp in screen space (1px) for all visible A4 tiles.
     */
    _drawA4CropMarks(ctx, cam, viewBox) {
        drawA4Borders(ctx, cam, viewBox, this.theme);
    }

    /**
     * Full A4 tile grid rendered during General View (Overview).
     */
    _drawOverviewGrid(ctx, cam) {
        const fp = this.scene.getFootprint();
        const isDark = this.theme === 'dark';

        ctx.save();
        for (let row = fp.minRow; row <= fp.maxRow; row++) {
            for (let col = fp.minCol; col <= fp.maxCol; col++) {
                const tl = worldToScreen(col * A4_W, row * A4_H, cam);
                const br = worldToScreen((col + 1) * A4_W, (row + 1) * A4_H, cam);
                const w = br.x - tl.x;
                const h = br.y - tl.y;
                const key = `${col},${row}`;
                const isOccupied = fp.occupied.has(key);

                ctx.fillStyle = isOccupied
                    ? (isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.025)')
                    : 'transparent';
                ctx.fillRect(tl.x, tl.y, w, h);

                ctx.strokeStyle = isOccupied
                    ? (isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.25)')
                    : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)');
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 4]);
                ctx.strokeRect(Math.round(tl.x) + 0.5, Math.round(tl.y) + 0.5, Math.round(w), Math.round(h));
                ctx.setLineDash([]);

                ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
                ctx.font = '600 11px "Space Mono", monospace';
                ctx.fillText(`A4 ${row + 1}·${col + 1}`, tl.x + 8, tl.y + 18);
            }
        }
        ctx.restore();
    }

    _drawSavedViewportFrame(ctx, overviewCam, savedCam) {
        const vwWorld = this.width / savedCam.scale;
        const vhWorld = this.height / savedCam.scale;
        const tl = worldToScreen(savedCam.x, savedCam.y, overviewCam);
        const br = worldToScreen(savedCam.x + vwWorld, savedCam.y + vhWorld, overviewCam);
        const accent = this.theme === 'dark' ? '#ff523d' : '#B01A00';

        ctx.save();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
        ctx.fillStyle = this.theme === 'dark' ? 'rgba(255, 82, 61, 0.08)' : 'rgba(176, 26, 0, 0.06)';
        ctx.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
        ctx.restore();
    }

    /**
     * Render only the lightweight active layer (current stroke, shape preview, lasso, eraser ring, laser).
     */
    renderActiveNow() {
        const ctx = this.activeCtx;
        const cam = this.scene.camera;
        const dpr = this.dpr;

        // Pan and zoom call this on every finger move: when the layer is already empty and
        // nothing is to be drawn, skip clearing the whole (4K on the board) canvas again.
        const hasContent = Boolean(this.activeStroke || this.activeShape || this.lassoOverlay
            || this.eraserCursor || this.laserPoints.length > 0 || this.zoomIndicator);
        if (!hasContent && this._activeEmpty) return;
        this._activeEmpty = !hasContent;

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, this.width, this.height);

        if (this.activeStroke) {
            ctx.save();
            ctx.scale(cam.scale, cam.scale);
            ctx.translate(-cam.x, -cam.y);
            drawStroke(ctx, this.activeStroke, this.theme, { cache: false });
            ctx.restore();
        }

        if (this.activeShape) {
            ctx.save();
            ctx.scale(cam.scale, cam.scale);
            ctx.translate(-cam.x, -cam.y);
            drawStroke(ctx, this.activeShape, this.theme, { cache: false });
            ctx.restore();
        }

        if (this.lassoOverlay) {
            this._drawLassoOverlay(ctx, cam, this.lassoOverlay);
        }

        if (this.eraserCursor) {
            const pt = worldToScreen(this.eraserCursor.x, this.eraserCursor.y, cam);
            const rPx = Math.max(4, this.eraserCursor.radius * cam.scale);
            ctx.save();
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, rPx, 0, Math.PI * 2);
            ctx.strokeStyle = this.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.55)';
            ctx.fillStyle = this.theme === 'dark' ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        if (this.laserPoints.length > 0) {
            this._drawLaserTrail(ctx, cam);
        }

        if (this.zoomIndicator) {
            this._drawZoomIndicator(ctx, this.zoomIndicator);
        }

        ctx.restore();
    }

    _drawZoomIndicator(ctx, ind) {
        const isDark = this.theme === 'dark';
        const label = `${ind.pct}%`;
        ctx.save();
        ctx.font = '600 13px "Space Mono", monospace';
        const textW = ctx.measureText(label).width;
        const padX = 10;
        const w = Math.max(54, Math.ceil(textW + padX * 2));
        const h = 28;
        const cx = clamp(ind.sx, w * 0.5 + 10, Math.max(w * 0.5 + 10, this.width - w * 0.5 - 10));
        const cy = clamp(ind.sy - 52, h * 0.5 + 10, Math.max(h * 0.5 + 10, this.height - h * 0.5 - 10));
        const x = Math.round(cx - w * 0.5);
        const y = Math.round(cy - h * 0.5);

        if (ind.snapped) {
            ctx.fillStyle = isDark ? '#ffffff' : '#111111';
            ctx.strokeStyle = ctx.fillStyle;
        } else {
            ctx.fillStyle = isDark ? 'rgba(24, 24, 24, 0.92)' : 'rgba(255, 255, 255, 0.94)';
            ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.24)';
        }
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

        ctx.fillStyle = ind.snapped
            ? (isDark ? '#121212' : '#ffffff')
            : (isDark ? '#f5f5f5' : '#111111');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + w * 0.5, y + h * 0.5 + 0.5);
        ctx.restore();
    }

    _drawLassoOverlay(ctx, cam, state) {
        const isDark = this.theme === 'dark';
        const accent = isDark ? '#ff523d' : '#B01A00';
        const fillTint = isDark ? 'rgba(255, 82, 61, 0.09)' : 'rgba(176, 26, 0, 0.06)';

        if (state.marquee) {
            const m = state.marquee;
            ctx.save();
            ctx.strokeStyle = accent;
            ctx.fillStyle = fillTint;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            if (m.kind === 'rect') {
                const minX = Math.min(m.start.x, m.end.x);
                const minY = Math.min(m.start.y, m.end.y);
                const maxX = Math.max(m.start.x, m.end.x);
                const maxY = Math.max(m.start.y, m.end.y);
                const tl = worldToScreen(minX, minY, cam);
                const br = worldToScreen(maxX, maxY, cam);
                ctx.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
                ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
            } else if (m.kind === 'lasso' && m.points && m.points.length >= 2) {
                ctx.beginPath();
                const s0 = worldToScreen(m.points[0].x, m.points[0].y, cam);
                ctx.moveTo(s0.x, s0.y);
                for (let i = 1; i < m.points.length; i++) {
                    const si = worldToScreen(m.points[i].x, m.points[i].y, cam);
                    ctx.lineTo(si.x, si.y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        if (state.selectionBBox) {
            const bb = state.selectionBBox;
            const dx = state.drag ? state.drag.dx : 0;
            const dy = state.drag ? state.drag.dy : 0;

            if (state.drag && (dx !== 0 || dy !== 0) && state.selectedStrokes && state.selectedStrokes.length > 0) {
                ctx.save();
                ctx.scale(cam.scale, cam.scale);
                ctx.translate(-cam.x + dx, -cam.y + dy);
                ctx.globalAlpha = 0.72;
                for (let i = 0; i < state.selectedStrokes.length; i++) {
                    drawStroke(ctx, state.selectedStrokes[i], this.theme, { cache: true });
                }
                ctx.restore();
            }

            const tl = worldToScreen(bb.minX + dx, bb.minY + dy, cam);
            const br = worldToScreen(bb.maxX + dx, bb.maxY + dy, cam);
            const padPx = 4;
            const x = tl.x - padPx;
            const y = tl.y - padPx;
            const w = (br.x - tl.x) + padPx * 2;
            const h = (br.y - tl.y) + padPx * 2;

            ctx.save();
            ctx.fillStyle = fillTint;
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(x, y, w, h);
            ctx.setLineDash([]);

            // Corner handles indicate draggable selection box
            const hs = 5;
            ctx.fillStyle = accent;
            for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
                ctx.fillRect(cx - hs * 0.5, cy - hs * 0.5, hs, hs);
            }
            ctx.restore();
        }
    }

    _drawLaserTrail(ctx, cam) {
        const now = performance.now();
        // Prune expired points
        while (this.laserPoints.length > 0 && now - this.laserPoints[0].t > LASER_LIFETIME_MS) {
            this.laserPoints.shift();
        }
        if (this.laserPoints.length === 0) return;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < this.laserPoints.length; i++) {
            const p0 = this.laserPoints[i - 1];
            const p1 = this.laserPoints[i];
            const age = (now - p1.t) / LASER_LIFETIME_MS;
            const alpha = clamp(1 - age, 0, 1);
            const s0 = worldToScreen(p0.x, p0.y, cam);
            const s1 = worldToScreen(p1.x, p1.y, cam);

            // Outer glow
            ctx.strokeStyle = `rgba(239, 68, 68, ${(alpha * 0.35).toFixed(3)})`;
            ctx.lineWidth = 10 * alpha + 2;
            ctx.beginPath();
            ctx.moveTo(s0.x, s0.y);
            ctx.lineTo(s1.x, s1.y);
            ctx.stroke();

            // Bright core
            ctx.strokeStyle = `rgba(255, 82, 61, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 3.5 * alpha + 1;
            ctx.beginPath();
            ctx.moveTo(s0.x, s0.y);
            ctx.lineTo(s1.x, s1.y);
            ctx.stroke();
        }

        // Bright head dot
        const head = this.laserPoints[this.laserPoints.length - 1];
        const headAlpha = clamp(1 - (now - head.t) / LASER_LIFETIME_MS, 0, 1);
        const sh = worldToScreen(head.x, head.y, cam);
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${headAlpha.toFixed(3)})`;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `rgba(239, 68, 68, ${headAlpha.toFixed(3)})`;
        ctx.stroke();

        ctx.restore();
    }

    addLaserPoint(wx, wy) {
        this.laserPoints.push({ x: wx, y: wy, t: performance.now() });
        this._ensureLaserLoop();
    }

    _ensureLaserLoop() {
        if (this.laserRaf) return;
        const tick = () => {
            this.renderActiveNow();
            if (this.laserPoints.length > 0) {
                this.laserRaf = requestAnimationFrame(tick);
            } else {
                this.laserRaf = null;
            }
        };
        this.laserRaf = requestAnimationFrame(tick);
    }

    setActiveStroke(stroke) {
        this.activeStroke = stroke;
        this.renderActiveNow();
    }

    /**
     * Hand a finished stroke from the live layer to the committed layer without a gap.
     * The live layer is desynchronized, so clearing it shows at once, while the committed
     * layer only shows at the browser's next frame: clearing both in the same task left a
     * frame or two (longer on slow boards) with the stroke on neither layer. The live copy
     * stays until the committed picture has been presented, then goes.
     */
    commitActiveStroke(stroke) {
        this.appendStroke(stroke);
        if (this.activeStroke === stroke) this.activeStroke = null;
        requestAnimationFrame(() => requestAnimationFrame(() => this.renderActiveNow()));
    }

    setActiveShape(stroke) {
        this.activeShape = stroke;
        this.renderActiveNow();
    }

    setLassoOverlay(state) {
        this.lassoOverlay = state;
        this.renderActiveNow();
    }

    setEraserCursor(cursor) {
        this.eraserCursor = cursor;
        this.renderActiveNow();
    }

    setZoomIndicator(indicator, redraw = true) {
        if (!indicator && !this.zoomIndicator) return;
        this.zoomIndicator = indicator;
        if (redraw) this.renderActiveNow();
    }

    /**
     * Smoothly animate the camera to target { x, y, scale }.
     */
    /**
     * Glide the camera to `target` as a pan gesture would move it: the moving picture
     * (and its fade or pixel effect) during the glide, one sharp redraw at the end.
     * Ease-in-out, so it starts and stops gently.
     */
    /**
     * Glide the camera to `target` over the fast pan/zoom picture. `easing`: 'inOut' (default,
     * connector jumps) or 'out', which suits glides restarted by repeated taps (zoom buttons).
     * A pan or pinch that starts meanwhile stops it (stopGlide) and takes over its gesture.
     */
    glideCameraTo(target, durationMs = 420, onDone = null, easing = 'inOut') {
        if (this._glideRaf) cancelAnimationFrame(this._glideRaf);
        const start = { ...this.scene.camera };
        const t0 = performance.now();
        this.beginGesture();
        const step = (now) => {
            const p = clamp((now - t0) / durationMs, 0, 1);
            const ease = easing === 'out'
                ? 1 - Math.pow(1 - p, 3)
                : (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
            this.scene.camera.x = start.x + (target.x - start.x) * ease;
            this.scene.camera.y = start.y + (target.y - start.y) * ease;
            this.scene.camera.scale = start.scale + (target.scale - start.scale) * ease;
            if (this.gesture && this.snap) this._gestureFrame();
            else this.renderCommittedNow();
            this.renderActiveNow();
            if (this.onCameraChange) this.onCameraChange(this.scene.camera);
            if (p < 1) {
                this._glideRaf = requestAnimationFrame(step);
            } else {
                this._glideRaf = null;
                this.endGesture();
                if (onDone) onDone();
            }
        };
        this._glideRaf = requestAnimationFrame(step);
    }

    isGliding() {
        return Boolean(this._glideRaf);
    }

    /**
     * Stop a running glide where it is, without its onDone. The gesture it opened stays
     * open, so a pan or pinch starting now carries on with it and ends it when it ends.
     */
    stopGlide() {
        if (!this._glideRaf) return;
        cancelAnimationFrame(this._glideRaf);
        this._glideRaf = null;
    }

    animateCameraTo(target, durationMs = 220, onDone = null) {
        if (this.cameraAnim) cancelAnimationFrame(this.cameraAnim);
        const start = { ...this.scene.camera };
        const t0 = performance.now();

        const step = (now) => {
            const p = clamp((now - t0) / durationMs, 0, 1);
            // Cubic ease-out
            const ease = 1 - Math.pow(1 - p, 3);
            this.scene.camera.x = start.x + (target.x - start.x) * ease;
            this.scene.camera.y = start.y + (target.y - start.y) * ease;
            this.scene.camera.scale = start.scale + (target.scale - start.scale) * ease;

            this.renderCommittedNow();
            this.renderActiveNow();
            if (this.onCameraChange) this.onCameraChange(this.scene.camera);

            if (p < 1) {
                this.cameraAnim = requestAnimationFrame(step);
            } else {
                this.cameraAnim = null;
                if (onDone) onDone();
            }
        };
        this.cameraAnim = requestAnimationFrame(step);
    }

    toggleOverview() {
        if (this.overviewMode) {
            this.exitOverview();
        } else {
            this.enterOverview();
        }
        return this.overviewMode;
    }

    enterOverview() {
        if (this.overviewMode) return;
        this.savedCamera = { ...this.scene.camera };
        this.overviewMode = true;
        if (this.overlay) this.overlay.setOverviewMode(true);

        const fp = this.scene.getFootprint();
        const b = fp.bounds;
        const padMm = 20;
        const bw = (b.maxX - b.minX) + padMm * 2;
        const bh = (b.maxY - b.minY) + padMm * 2;

        // Leave room at bottom for the floating dock
        const usableH = Math.max(120, this.height - 96);
        const scale = clamp(Math.min(this.width / bw, usableH / bh), 0.6, this.scene.camera.baseScale);
        const x = b.minX - padMm - ((this.width / scale) - bw) * 0.5;
        const y = b.minY - padMm - ((usableH / scale) - bh) * 0.5;

        this.animateCameraTo({ x, y, scale }, 220);
    }

    exitOverview(jumpWorldPt = null) {
        if (!this.overviewMode) return;
        this.overviewMode = false;
        if (this.overlay) this.overlay.setOverviewMode(false);
        const baseScale = this.scene.camera.baseScale;
        let target;
        if (jumpWorldPt) {
            target = {
                scale: baseScale,
                x: jumpWorldPt.x - (this.width / baseScale) * 0.5,
                y: jumpWorldPt.y - (this.height / baseScale) * 0.5,
            };
        } else if (this.savedCamera) {
            target = this.savedCamera;
        } else {
            target = { x: -6, y: -6, scale: baseScale };
        }
        this.savedCamera = null;
        this.animateCameraTo(target, 220);
    }

    /**
     * Capture a lightweight bitmap snapshot of an arbitrary camera view
     * (defaults to current camera) for Approach A Pinned Reference Strip.
     * Supports re-rendering the pinned region cleanly when switching Light/Dark theme.
     */
    captureViewportSnapshot(targetCamera = null) {
        const cam = targetCamera ? { ...targetCamera } : { ...this.scene.camera };
        const maxDim = 960;
        const ratio = Math.min(1, maxDim / Math.max(this.width, this.height));
        const sw = Math.max(1, Math.round(this.width * ratio));
        const sh = Math.max(1, Math.round(this.height * ratio));

        const snap = document.createElement('canvas');
        snap.width = sw;
        snap.height = sh;
        const sctx = snap.getContext('2d');

        if (!targetCamera) {
            if (this._committedDirty) this.renderCommittedNow();
            sctx.drawImage(this.bgCanvas, 0, 0, sw, sh);
            sctx.drawImage(this.committedCanvas, 0, 0, sw, sh);
        } else {
            // Render the pinned camera view directly with the current theme
            sctx.fillStyle = this._getBgColor();
            sctx.fillRect(0, 0, sw, sh);

            const viewBox = {
                minX: cam.x - 10,
                minY: cam.y - 10,
                maxX: cam.x + this.width / cam.scale + 10,
                maxY: cam.y + this.height / cam.scale + 10,
            };

            sctx.save();
            sctx.scale(cam.scale * ratio, cam.scale * ratio);
            sctx.translate(-cam.x, -cam.y);

            const strokes = this.scene.strokes;
            for (let i = 0; i < strokes.length; i++) {
                const s = strokes[i];
                if (s.tool !== 'highlighter') continue;
                if (!bboxIntersects(s.bbox, viewBox)) continue;
                drawStroke(sctx, s, this.theme);
            }
            for (let i = 0; i < strokes.length; i++) {
                const s = strokes[i];
                if (s.tool === 'highlighter') continue;
                if (!bboxIntersects(s.bbox, viewBox)) continue;
                drawStroke(sctx, s, this.theme);
            }
            sctx.restore();
        }

        return {
            dataUrl: snap.toDataURL('image/png'),
            camera: cam,
            aspect: this.width / Math.max(1, this.height),
        };
    }
}
