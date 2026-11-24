/**
 * World-space DOM/SVG overlay for Matephis Board widgets and explanation connectors.
 *
 * Layering inside `.board-stage`:
 *   z-index 0: bgCanvas        (opaque page fill, grid/dots/ruled pattern, A4 borders)
 *   z-index 1: overlay         (world-space widgets — bodies are write-through `pointer-events: none`)
 *   z-index 2: committedCanvas (transparent ink layer — renders ink ABOVE widgets)
 *   z-index 3: activeCanvas    (desynchronized in-flight stroke / lasso / shape / laser)
 *   z-index 4: topOverlay      (screen-space connector badges & active widget edit chrome)
 *
 * Because committedCanvas and activeCanvas both carry `pointer-events: none`,
 * explicit interactive controls inside widgets (sliders, switches, "Mostra soluzione",
 * corner edit handle) stay immediately clickable while the graph/diagram body remains
 * write-through for drawing and 2-finger pan/zoom.
 */

export const OVERLAY_PX_PER_MM = 4;

const INTERACTIVE_SELECTOR = [
    '.board-overlay-interactive',
    '.board-widget-grip',
    '.board-widget-resize',
    '.board-widget-chrome',
    '.board-connector',
    '.board-widget.is-canvas-interactive',
    '.board-widget:not(.is-controls-locked) input',
    '.board-widget:not(.is-controls-locked) button',
    '.board-widget:not(.is-controls-locked) select',
    '.board-widget:not(.is-controls-locked) textarea',
    '.board-widget:not(.is-controls-locked) summary',
    '.board-widget:not(.is-controls-locked) [data-board-interactive]',
    '.board-widget:not(.is-controls-locked) .matephis-slider',
    '.board-widget:not(.is-controls-locked) .matephis-controls',
    '.board-widget:not(.is-controls-locked) .matephis-plot-controls',
    '.board-widget:not(.is-controls-locked) .matephis-plot-play-btn',
    '.board-widget:not(.is-controls-locked) .matephis-plot-btn',
    '.board-widget:not(.is-controls-locked) .matephis-physics-button',
    '.board-widget:not(.is-controls-locked) .matephis-physics-speed-btn',
    '.board-widget:not(.is-controls-locked) .mp-draggable',
    '.board-widget:not(.is-controls-locked) .mp-clickable',
    '.board-widget:not(.is-controls-locked) .mps-draggable',
    '.board-widget:not(.is-controls-locked) .matephis-circuit-switch',
    '.board-widget:not(.is-controls-locked) .matephis-circuit-comp',
    '.board-widget:not(.is-controls-locked) .board-widget-sol-toggle',
].join(', ');

export class BoardOverlay {
    constructor(stageEl) {
        this.stageEl = stageEl;
        this._cameraListeners = new Set();

        // Layer 1: world-space widgets (sits below ink canvases)
        this.el = document.createElement('div');
        this.el.className = 'board-overlay';

        this.worldEl = document.createElement('div');
        this.worldEl.className = 'board-overlay-world';

        this.widgetsLayer = document.createElement('div');
        this.widgetsLayer.className = 'board-overlay-widgets';

        this.worldEl.appendChild(this.widgetsLayer);
        this.el.appendChild(this.worldEl);

        // Layer 4: screen-space overlay above ink (connector badges, edit chrome)
        this.topEl = document.createElement('div');
        this.topEl.className = 'board-overlay-top';

        this.connectorsLayer = document.createElement('div');
        this.connectorsLayer.className = 'board-overlay-connectors';

        this.chromeLayer = document.createElement('div');
        this.chromeLayer.className = 'board-overlay-chrome';

        this.topEl.append(this.connectorsLayer, this.chromeLayer);

        this.stageEl.append(this.el, this.topEl);
    }

    /**
     * Sync world-space CSS transform with the board camera.
     * World (wx, wy) mm maps to element CSS (wx * OVERLAY_PX_PER_MM, wy * OVERLAY_PX_PER_MM) px.
     */
    syncCamera(cam) {
        if (!cam) return;
        const k = cam.scale / OVERLAY_PX_PER_MM;
        const tx = -cam.x * cam.scale;
        const ty = -cam.y * cam.scale;
        this.worldEl.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${k.toFixed(5)})`;
        // Widget grips and handles keep a constant on-screen size at any zoom.
        if (Math.abs(k - (this._lastK || 0)) > 1e-6) {
            this._lastK = k;
            this.worldEl.style.setProperty('--ov-inv', (1 / k).toFixed(5));
        }

        for (const fn of this._cameraListeners) {
            fn(cam);
        }
    }

    /**
     * Register a lightweight callback invoked whenever camera transform updates
     * (used by screen-space connector badges & edit handles).
     */
    onCameraSync(fn) {
        this._cameraListeners.add(fn);
        return () => this._cameraListeners.delete(fn);
    }

    /**
     * Pan/zoom gesture state, mirroring the ink's image-based gesture: the world layer
     * becomes a cached GPU picture (`will-change: transform`) moved without re-rendering,
     * dimmed like the ink in the fade effect; it is re-rendered sharp when the gesture ends.
     */
    setGesture(active, effect = null, dim = 0.6, { hideWidgets = false } = {}) {
        this.stageEl.classList.toggle('is-gesturing', Boolean(active));
        // Pixel effect: the widgets are drawn (pixelated) into the ink picture instead.
        this.stageEl.classList.toggle('is-widgets-pictured', Boolean(active && hideWidgets));
        if (active) {
            this.setGestureAlpha(effect === 'pixel' ? 1 : dim);
        } else if (effect === null) {
            this.setGestureAlpha(1);
        }
    }

    setGestureAlpha(alpha) {
        const a = Math.max(0, Math.min(1, Number(alpha)));
        if (this._gestureAlpha === a) return;
        this._gestureAlpha = a;
        if (a >= 1) this.stageEl.style.removeProperty('--gesture-alpha');
        else this.stageEl.style.setProperty('--gesture-alpha', a.toFixed(3));
    }

    setOverviewMode(active) {
        this.stageEl.classList.toggle('is-overview', Boolean(active));
    }

    /**
     * Returns true if `target` is a live interactive control inside the overlay
     * that should handle a single-pointer event instead of starting a drawing stroke.
     */
    isInteractiveTarget(target) {
        if (!target || typeof target.closest !== 'function') return false;
        if (this.stageEl.classList.contains('is-overview')) return false;
        return Boolean(target.closest(INTERACTIVE_SELECTOR));
    }
}
