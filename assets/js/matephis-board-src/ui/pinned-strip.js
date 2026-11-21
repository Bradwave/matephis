/**
 * Approach A: Pinned Reference Strip (Split View).
 *
 * Captures a lightweight snapshot of the current viewport, docks it at the top
 * or left edge (~28%), and smoothly pans the canvas into fresh space at exact
 * 100% writing zoom so stroke thickness and handwriting ergonomics stay constant.
 */

import { BoardIcons } from './icons.js';

export class PinnedStrip {
    constructor(hostEl, { surface, scene, onCameraChange = null }) {
        this.hostEl = hostEl;
        this.surface = surface;
        this.scene = scene;
        this.onCameraChange = onCameraChange;

        this.active = false;
        this.side = 'top'; // 'top' | 'left'
        this.snapshot = null;

        this.el = document.createElement('div');
        this.el.className = 'board-pinned-strip';
        this.el.hidden = true;
        this.el.innerHTML = `
            <div class="board-pinned-preview" title="Tocca per tornare a questa vista">
                <img class="board-pinned-img" alt="Vista precedente" draggable="false" />
                <span class="board-pinned-badge">Riferimento</span>
            </div>
            <div class="board-pinned-actions">
                <button type="button" class="board-icon-btn board-pinned-refresh" title="Aggiorna riferimento con vista attuale">
                    ${BoardIcons.refresh}
                </button>
                <button type="button" class="board-icon-btn board-pinned-close" title="Chiudi riferimento">
                    ${BoardIcons.close}
                </button>
            </div>
        `;

        this.imgEl = this.el.querySelector('.board-pinned-img');
        this.previewEl = this.el.querySelector('.board-pinned-preview');
        this.refreshBtn = this.el.querySelector('.board-pinned-refresh');
        this.closeBtn = this.el.querySelector('.board-pinned-close');

        this.previewEl.addEventListener('click', () => this._jumpToPinned());
        this.refreshBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.refreshSnapshot();
        });
        this.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });

        this.hostEl.appendChild(this.el);
    }

    /**
     * Pin current viewport to `side` ('top' or 'left') and pan smoothly into fresh space
     * at the standard 100% writing scale.
     */
    pinAndContinue(side = 'top') {
        if (this.surface.overviewMode) {
            this.surface.exitOverview();
        }

        const snap = this.surface.captureViewportSnapshot();
        this.snapshot = snap;
        this.side = side === 'left' ? 'left' : 'top';
        this.active = true;

        this.imgEl.src = snap.dataUrl;
        this.el.classList.toggle('is-top', this.side === 'top');
        this.el.classList.toggle('is-left', this.side === 'left');
        this.el.hidden = false;

        // Calculate fresh-space pan keeping comfortable 100% writing zoom
        const baseScale = this.scene.camera.baseScale || this.scene.camera.scale;
        const currCam = snap.camera;
        const visibleW = this.surface.width / currCam.scale;
        const visibleH = this.surface.height / currCam.scale;

        let targetX = currCam.x;
        let targetY = currCam.y;

        if (this.side === 'top') {
            // Slide below current work; leave ~30% top margin for the strip itself
            const stripWorldH = (this.surface.height * 0.28) / baseScale;
            targetY = currCam.y + visibleH * 0.88 - stripWorldH;
        } else {
            // Slide right of current work; leave ~30% left margin for the strip
            const stripWorldW = (this.surface.width * 0.28) / baseScale;
            targetX = currCam.x + visibleW * 0.88 - stripWorldW;
        }

        this.surface.animateCameraTo({ x: targetX, y: targetY, scale: baseScale }, 240);
    }

    refreshSnapshot() {
        if (!this.active) return;
        const snap = this.surface.captureViewportSnapshot();
        this.snapshot = snap;
        this.imgEl.src = snap.dataUrl;
    }

    rerenderForTheme() {
        if (!this.active || !this.snapshot) return;
        const snap = this.surface.captureViewportSnapshot(this.snapshot.camera);
        this.snapshot = snap;
        this.imgEl.src = snap.dataUrl;
    }

    _jumpToPinned() {
        if (!this.snapshot || !this.snapshot.camera) return;
        this.surface.animateCameraTo({ ...this.snapshot.camera }, 220);
        if (this.onCameraChange) this.onCameraChange(this.scene.camera);
    }

    close() {
        this.active = false;
        this.snapshot = null;
        this.el.hidden = true;
        this.imgEl.removeAttribute('src');
    }
}
