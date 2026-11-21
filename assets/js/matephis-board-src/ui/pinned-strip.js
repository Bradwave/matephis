/**
 * Approach A: Interactive Vector Pinned Reference Strip (Split View).
 *
 * Docks a live, independently zoomable & pannable vector view of a pinned page
 * at the top or left edge (~28%) while opening fresh space on the main canvas
 * at exact 100% writing zoom. Persists seamlessly across scrolling AND page changes.
 *
 * Gestures inside the strip:
 * - 1 pointer drag: pan the pinned reference
 * - 2-finger pinch / Ctrl+wheel: zoom the pinned reference
 * - Wheel: pan the pinned reference
 * - Jump button (or double-tap): jump main board to that page & region
 */

import { MAX_SCALE, MIN_SCALE, clamp, screenToWorld } from '../ink/geometry.js';
import { renderPageToContext } from '../ink/surface.js';
import { BoardIcons } from './icons.js';

export class PinnedStrip {
    constructor(hostEl, { surface, scene, onJumpToPage = null }) {
        this.hostEl = hostEl;
        this.surface = surface;
        this.scene = scene;
        this.onJumpToPage = onJumpToPage;

        this.active = false;
        this.side = 'top'; // 'top' | 'left'
        this.pinnedPageId = null;
        this.stripCamera = { x: 0, y: 0, scale: 2.0 };
        this.topHeightPx = null;
        this.leftWidthPx = null;
        this.resizeDrag = null;

        // Pointer interaction state inside strip
        this.pointers = new Map();
        this.panAnchor = null;
        this.pinchAnchor = null;
        this.lastTapTime = 0;

        this._buildDOM();
        this._bindEvents();
    }

    _buildDOM() {
        this.el = document.createElement('div');
        this.el.className = 'board-pinned-strip';
        this.el.hidden = true;
        this.el.innerHTML = `
            <canvas class="board-pinned-canvas"></canvas>
            <div class="board-pinned-bar">
                <button type="button" class="board-icon-btn board-pinned-prev" title="Mostra pagina precedente nel riferimento">
                    ${BoardIcons.chevronLeft}
                </button>
                <span class="board-pinned-badge">Pag. 1</span>
                <button type="button" class="board-icon-btn board-pinned-next" title="Mostra pagina successiva nel riferimento">
                    ${BoardIcons.chevronRight}
                </button>
                <span class="board-pinned-sep"></span>
                <button type="button" class="board-icon-btn board-pinned-jump" title="Vai a questa zona nella lavagna principale">
                    ${BoardIcons.jump}
                </button>
                <button type="button" class="board-icon-btn board-pinned-refresh" title="Aggiorna riferimento con vista attuale">
                    ${BoardIcons.refresh}
                </button>
                <button type="button" class="board-icon-btn board-pinned-close" title="Chiudi riferimento">
                    ${BoardIcons.close}
                </button>
            </div>
            <div class="board-pinned-resizer" title="Trascina per ridimensionare">
                <span class="board-pinned-grip"></span>
            </div>
        `;

        this.canvas = this.el.querySelector('.board-pinned-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.prevBtn = this.el.querySelector('.board-pinned-prev');
        this.nextBtn = this.el.querySelector('.board-pinned-next');
        this.badgeEl = this.el.querySelector('.board-pinned-badge');
        this.jumpBtn = this.el.querySelector('.board-pinned-jump');
        this.refreshBtn = this.el.querySelector('.board-pinned-refresh');
        this.closeBtn = this.el.querySelector('.board-pinned-close');
        this.resizerEl = this.el.querySelector('.board-pinned-resizer');

        this.hostEl.appendChild(this.el);

        this._ro = new ResizeObserver(() => {
            if (this.active) this.render();
        });
        this._ro.observe(this.el);
    }

    _bindEvents() {
        this.el.addEventListener('pointerdown', (e) => e.stopPropagation());

        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._stepPinnedPage(-1);
        });
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._stepPinnedPage(1);
        });
        this.jumpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._jumpToPinned();
        });
        this.refreshBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.refreshFromCurrent();
        });
        this.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });

        this.canvas.addEventListener('pointerdown', (e) => this._onPointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
        this.canvas.addEventListener('pointerup', (e) => this._onPointerUp(e));
        this.canvas.addEventListener('pointercancel', (e) => this._onPointerUp(e));
        this.canvas.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });

        this.resizerEl.addEventListener('pointerdown', (e) => this._onResizeDown(e));
        this.resizerEl.addEventListener('pointermove', (e) => this._onResizeMove(e));
        this.resizerEl.addEventListener('pointerup', (e) => this._onResizeUp(e));
        this.resizerEl.addEventListener('pointercancel', (e) => this._onResizeUp(e));
    }

    _applyStoredSize() {
        if (this.side === 'top') {
            this.el.style.width = '';
            this.el.style.height = this.topHeightPx ? `${this.topHeightPx}px` : '';
        } else {
            this.el.style.height = '';
            this.el.style.width = this.leftWidthPx ? `${this.leftWidthPx}px` : '';
        }
    }

    _onResizeDown(e) {
        e.preventDefault();
        e.stopPropagation();
        try { this.resizerEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        const rect = this.el.getBoundingClientRect();
        this.resizeDrag = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            startW: rect.width,
            startH: rect.height,
        };
    }

    _onResizeMove(e) {
        if (!this.resizeDrag || e.pointerId !== this.resizeDrag.pointerId) return;
        e.preventDefault();
        e.stopPropagation();
        if (this.side === 'top') {
            const minH = Math.max(96, Math.round(window.innerHeight * 0.12));
            const maxH = Math.round(window.innerHeight * 0.68);
            const nextH = clamp(this.resizeDrag.startH + (e.clientY - this.resizeDrag.startY), minH, maxH);
            this.topHeightPx = Math.round(nextH);
            this.el.style.height = `${this.topHeightPx}px`;
        } else {
            const minW = Math.max(150, Math.round(window.innerWidth * 0.14));
            const maxW = Math.round(window.innerWidth * 0.65);
            const nextW = clamp(this.resizeDrag.startW + (e.clientX - this.resizeDrag.startX), minW, maxW);
            this.leftWidthPx = Math.round(nextW);
            this.el.style.width = `${this.leftWidthPx}px`;
        }
        this.render();
    }

    _onResizeUp(e) {
        if (!this.resizeDrag || e.pointerId !== this.resizeDrag.pointerId) return;
        this.resizeDrag = null;
    }

    _getLocalPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
    }

    _getPinnedPageInfo() {
        if (!this.pinnedPageId) return null;
        const idx = this.scene.pages.findIndex((p) => p.id === this.pinnedPageId);
        if (idx === -1) return null;
        return { page: this.scene.pages[idx], index: idx };
    }

    /**
     * Fit the main board's visible world rectangle neatly inside the strip canvas.
     */
    _fitWorldRectInStrip(worldX, worldY, worldW, worldH) {
        const rect = this.el.getBoundingClientRect();
        const sw = Math.max(120, rect.width || (this.side === 'top' ? window.innerWidth : window.innerWidth * 0.29));
        const sh = Math.max(80, rect.height || (this.side === 'top' ? window.innerHeight * 0.27 : window.innerHeight));

        const scale = clamp(Math.min(sw / worldW, sh / worldH) * 0.96, MIN_SCALE * 0.5, MAX_SCALE);
        const x = worldX - ((sw / scale) - worldW) * 0.5;
        const y = worldY - ((sh / scale) - worldH) * 0.5;
        this.stripCamera = { x, y, scale };
    }

    /**
     * Pin current page & viewport to `side` ('top' or 'left') and pan smoothly into fresh space.
     * Smart fallback: if the current page is completely empty and a previous page exists,
     * automatically pin the previous page instead (without scrolling the blank current page).
     */
    pinAndContinue(side = 'top') {
        if (this.surface.overviewMode) {
            this.surface.exitOverview();
        }

        this.side = side === 'left' ? 'left' : 'top';
        const isBlankWithPrev = this.scene.strokes.length === 0 && this.scene.currentPageIndex > 0;
        const targetPage = isBlankWithPrev
            ? this.scene.getPage(this.scene.currentPageIndex - 1)
            : this.scene.currentPage;

        this.pinnedPageId = targetPage.id;
        this.active = true;

        const refCam = { ...targetPage.camera };
        const visibleW = this.surface.width / refCam.scale;
        const visibleH = this.surface.height / refCam.scale;

        this.el.classList.toggle('is-top', this.side === 'top');
        this.el.classList.toggle('is-left', this.side === 'left');
        this._applyStoredSize();
        this.el.hidden = false;

        this._fitWorldRectInStrip(refCam.x, refCam.y, visibleW, visibleH);
        this.render();

        if (isBlankWithPrev) return;

        // Pan main canvas into fresh space at comfortable 100% writing zoom
        const baseScale = this.scene.camera.baseScale || refCam.scale;
        let targetX = refCam.x;
        let targetY = refCam.y;

        if (this.side === 'top') {
            const stripWorldH = (this.surface.height * 0.27) / baseScale;
            targetY = refCam.y + visibleH * 0.88 - stripWorldH;
        } else {
            const stripWorldW = (this.surface.width * 0.29) / baseScale;
            targetX = refCam.x + visibleW * 0.88 - stripWorldW;
        }

        this.surface.animateCameraTo({ x: targetX, y: targetY, scale: baseScale }, 200);
    }

    _stepPinnedPage(delta) {
        const info = this._getPinnedPageInfo();
        if (!info) return;
        const nextIdx = info.index + delta;
        const targetPage = this.scene.getPage(nextIdx);
        if (!targetPage) return;

        this.pinnedPageId = targetPage.id;
        const refCam = targetPage.camera;
        const visibleW = this.surface.width / refCam.scale;
        const visibleH = this.surface.height / refCam.scale;
        this._fitWorldRectInStrip(refCam.x, refCam.y, visibleW, visibleH);
        this.render();
    }

    refreshFromCurrent() {
        if (!this.active) return;
        this.pinnedPageId = this.scene.currentPage.id;
        const currCam = this.scene.camera;
        const visibleW = this.surface.width / currCam.scale;
        const visibleH = this.surface.height / currCam.scale;
        this._fitWorldRectInStrip(currCam.x, currCam.y, visibleW, visibleH);
        this.render();
    }

    /**
     * Re-render live vector canvas (call on theme flip, pinned page edit, or page reorder).
     */
    render() {
        if (!this.active) return;
        const info = this._getPinnedPageInfo();
        if (!info) {
            this.close();
            return;
        }

        const rect = this.el.getBoundingClientRect();
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));
        const maxDpr = this.scene.settings.lowDpr ? 1 : 2;
        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

        if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
            this.canvas.width = Math.round(w * dpr);
            this.canvas.height = Math.round(h * dpr);
            this.canvas.style.width = `${w}px`;
            this.canvas.style.height = `${h}px`;
        }

        this.badgeEl.textContent = `Pag. ${info.index + 1}`;
        this.prevBtn.disabled = info.index <= 0;
        this.nextBtn.disabled = info.index >= this.scene.pageCount - 1;
        renderPageToContext(
            this.ctx,
            w,
            h,
            dpr,
            info.page.strokes,
            this.stripCamera,
            this.surface.theme,
            this.scene.settings.showCropMarks
        );
    }

    /**
     * Only re-render if the currently edited page is the one shown in the strip.
     */
    syncIfShowingPage(pageId) {
        if (this.active && this.pinnedPageId === pageId) {
            this.render();
        }
    }

    _jumpToPinned() {
        const info = this._getPinnedPageInfo();
        if (!info) return;

        const rect = this.el.getBoundingClientRect();
        const sw = Math.max(1, rect.width);
        const sh = Math.max(1, rect.height);
        const centerWx = this.stripCamera.x + (sw / this.stripCamera.scale) * 0.5;
        const centerWy = this.stripCamera.y + (sh / this.stripCamera.scale) * 0.5;
        const baseScale = this.scene.camera.baseScale || 5.0;

        const targetCam = {
            scale: baseScale,
            x: centerWx - (this.surface.width / baseScale) * 0.5,
            y: centerWy - (this.surface.height / baseScale) * 0.5,
        };

        if (this.onJumpToPage) {
            this.onJumpToPage(info.index, targetCam);
        } else {
            this.surface.animateCameraTo(targetCam, 200);
        }
    }

    _onPointerDown(e) {
        e.preventDefault();
        e.stopPropagation();
        try { this.canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }

        const { sx, sy } = this._getLocalPoint(e);
        this.pointers.set(e.pointerId, { sx, sy, startSx: sx, startSy: sy, moved: false });

        if (this.pointers.size === 1) {
            this.panAnchor = {
                sx,
                sy,
                camX: this.stripCamera.x,
                camY: this.stripCamera.y,
            };
            this.pinchAnchor = null;
        } else if (this.pointers.size === 2) {
            const pts = Array.from(this.pointers.values());
            const midX = (pts[0].sx + pts[1].sx) * 0.5;
            const midY = (pts[0].sy + pts[1].sy) * 0.5;
            const dist = Math.max(10, Math.hypot(pts[1].sx - pts[0].sx, pts[1].sy - pts[0].sy));
            this.pinchAnchor = {
                dist,
                worldMid: screenToWorld(midX, midY, this.stripCamera),
                startScale: this.stripCamera.scale,
            };
            this.panAnchor = null;
        }
    }

    _onPointerMove(e) {
        if (!this.pointers.has(e.pointerId)) return;
        e.preventDefault();
        const { sx, sy } = this._getLocalPoint(e);
        const rec = this.pointers.get(e.pointerId);
        rec.sx = sx;
        rec.sy = sy;
        if (Math.hypot(sx - rec.startSx, sy - rec.startSy) > 5) {
            rec.moved = true;
        }

        if (this.pointers.size >= 2 && this.pinchAnchor) {
            const pts = Array.from(this.pointers.values());
            const midX = (pts[0].sx + pts[1].sx) * 0.5;
            const midY = (pts[0].sy + pts[1].sy) * 0.5;
            const dist = Math.max(10, Math.hypot(pts[1].sx - pts[0].sx, pts[1].sy - pts[0].sy));

            const newScale = clamp(
                this.pinchAnchor.startScale * (dist / this.pinchAnchor.dist),
                MIN_SCALE * 0.5,
                MAX_SCALE
            );
            this.stripCamera.scale = newScale;
            this.stripCamera.x = this.pinchAnchor.worldMid.x - midX / newScale;
            this.stripCamera.y = this.pinchAnchor.worldMid.y - midY / newScale;
            this.render();
        } else if (this.pointers.size === 1 && this.panAnchor) {
            const dx = sx - this.panAnchor.sx;
            const dy = sy - this.panAnchor.sy;
            this.stripCamera.x = this.panAnchor.camX - dx / this.stripCamera.scale;
            this.stripCamera.y = this.panAnchor.camY - dy / this.stripCamera.scale;
            this.render();
        }
    }

    _onPointerUp(e) {
        const rec = this.pointers.get(e.pointerId);
        this.pointers.delete(e.pointerId);

        if (rec && !rec.moved && this.pointers.size === 0) {
            const now = performance.now();
            if (now - this.lastTapTime < 320) {
                this.lastTapTime = 0;
                this._jumpToPinned();
            } else {
                this.lastTapTime = now;
            }
        }

        if (this.pointers.size < 2) {
            this.pinchAnchor = null;
        }
        if (this.pointers.size === 0) {
            this.panAnchor = null;
        }
    }

    _onWheel(e) {
        e.preventDefault();
        e.stopPropagation();
        const { sx, sy } = this._getLocalPoint(e);

        if (e.ctrlKey || e.metaKey) {
            const worldBefore = screenToWorld(sx, sy, this.stripCamera);
            const zoomFactor = Math.exp(-e.deltaY * 0.008);
            const newScale = clamp(this.stripCamera.scale * zoomFactor, MIN_SCALE * 0.5, MAX_SCALE);
            this.stripCamera.scale = newScale;
            this.stripCamera.x = worldBefore.x - sx / newScale;
            this.stripCamera.y = worldBefore.y - sy / newScale;
        } else {
            this.stripCamera.x += e.deltaX / this.stripCamera.scale;
            this.stripCamera.y += e.deltaY / this.stripCamera.scale;
        }
        this.render();
    }

    close() {
        this.active = false;
        this.pinnedPageId = null;
        this.pointers.clear();
        this.el.hidden = true;
    }
}
