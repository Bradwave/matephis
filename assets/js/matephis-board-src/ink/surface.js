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
    computeA4Footprint,
    worldToScreen,
} from './geometry.js';
import { drawStroke } from './stroke.js';

const LASER_LIFETIME_MS = 1250;

/**
 * Shared helper: draws faint landscape A4 borders + subtle corner ticks.
 */
export function drawA4Borders(ctx, cam, viewBox, theme = 'light') {
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

    // 3. Quiet tile label at top-left of each A4 tile
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.24)';
    ctx.font = '500 10px "Space Mono", monospace';
    for (let row = minRow; row < maxRow; row++) {
        for (let col = minCol; col < maxCol; col++) {
            const pt = worldToScreen(col * A4_W, row * A4_H, cam);
            const label = col === 0 && row === 0 ? 'A4' : `${row + 1}·${col + 1}`;
            ctx.fillText(label, Math.round(pt.x) + 6, Math.round(pt.y) + 14);
        }
    }

    ctx.restore();
}

/**
 * Shared vector renderer for rendering any page's strokes into a target canvas
 * (reused by PinnedStrip for crisp zoomable/pannable vector previews).
 */
export function renderPageToContext(ctx, width, height, dpr, strokes, cam, theme = 'light', showBorders = true) {
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

    if (showBorders) {
        drawA4Borders(ctx, cam, viewBox, theme);
    }

    ctx.save();
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.x, -cam.y);

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
    constructor(container, { scene, onPerfSample = null, onCameraChange = null }) {
        this.container = container;
        this.scene = scene;
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
        this.eraserCursor = null; // { x, y, radius } in world coords
        this.laserPoints = [];    // [{ x, y, t }]
        this.laserRaf = null;

        this.lastCommittedRedrawMs = 0;
        this._committedDirty = true;
        this._rafPending = false;

        this._createCanvases();
        this.resize();
    }

    _createCanvases() {
        this.committedCanvas = document.createElement('canvas');
        this.committedCanvas.className = 'board-canvas board-canvas-committed';
        this.committedCtx = this.committedCanvas.getContext('2d', { alpha: false });

        this.activeCanvas = document.createElement('canvas');
        this.activeCanvas.className = 'board-canvas board-canvas-active';
        // Request desynchronized context for lowest possible pointer-to-glass latency
        this.activeCtx =
            this.activeCanvas.getContext('2d', { alpha: true, desynchronized: true }) ||
            this.activeCanvas.getContext('2d', { alpha: true });

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

        for (const c of [this.committedCanvas, this.activeCanvas]) {
            c.width = Math.round(w * dpr);
            c.height = Math.round(h * dpr);
            c.style.width = `${w}px`;
            c.style.height = `${h}px`;
        }

        this.scene.updateViewportBaseScale(w, h);
        this.renderCommittedNow();
        this.renderActiveNow();
    }

    requestCommittedRedraw() {
        this._committedDirty = true;
        if (!this._rafPending) {
            this._rafPending = true;
            requestAnimationFrame(() => {
                this._rafPending = false;
                if (this._committedDirty) {
                    this.renderCommittedNow();
                }
            });
        }
    }

    _getBgColor() {
        return this.theme === 'dark' ? '#121212' : '#ffffff';
    }

    renderCommittedNow() {
        this._committedDirty = false;
        const t0 = performance.now();
        const ctx = this.committedCtx;
        const cam = this.scene.camera;
        const dpr = this.dpr;

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear background
        ctx.fillStyle = this._getBgColor();
        ctx.fillRect(0, 0, this.width, this.height);

        // World viewport culling box
        const viewBox = {
            minX: cam.x - 10,
            minY: cam.y - 10,
            maxX: cam.x + this.width / cam.scale + 10,
            maxY: cam.y + this.height / cam.scale + 10,
        };

        // Faint A4 corner crop marks (or full overview A4 grid)
        if (this.overviewMode) {
            this._drawOverviewGrid(ctx, cam);
        } else if (this.scene.settings.showCropMarks) {
            this._drawA4CropMarks(ctx, cam, viewBox);
        }

        // Apply world transform for vector strokes
        ctx.save();
        ctx.scale(cam.scale, cam.scale);
        ctx.translate(-cam.x, -cam.y);

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

        // In overview mode, highlight the saved writing viewport on top
        if (this.overviewMode && this.savedCamera) {
            this._drawSavedViewportFrame(ctx, cam, this.savedCamera);
        }

        ctx.restore();

        this.lastCommittedRedrawMs = performance.now() - t0;
        if (this.onPerfSample) {
            this.onPerfSample({ committedRedrawMs: this.lastCommittedRedrawMs });
        }
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
        const fp = computeA4Footprint(this.scene.strokes);
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
     * Render only the lightweight active layer (current stroke, eraser ring, laser).
     */
    renderActiveNow() {
        const ctx = this.activeCtx;
        const cam = this.scene.camera;
        const dpr = this.dpr;

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, this.width, this.height);

        if (this.activeStroke) {
            ctx.save();
            ctx.scale(cam.scale, cam.scale);
            ctx.translate(-cam.x, -cam.y);
            drawStroke(ctx, this.activeStroke, this.theme);
            ctx.restore();
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

        ctx.restore();
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

    setEraserCursor(cursor) {
        this.eraserCursor = cursor;
        this.renderActiveNow();
    }

    /**
     * Smoothly animate the camera to target { x, y, scale }.
     */
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

        const fp = computeA4Footprint(this.scene.strokes);
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
