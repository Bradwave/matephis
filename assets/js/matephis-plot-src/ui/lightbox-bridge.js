/**
 * Fullscreen Lightbox for plots.
 *
 * The live plot wrapper (SVG + toolbar + sliders) is moved into an overlay
 * owned by the library and moved back on close, so interactive plots stay
 * interactive and nothing has to be cloned or re-rendered by the page.
 * Being self-contained, it works the same on the site and in Obsidian.
 */
import { MatephisIcons } from './icons.js';

let overlay = null;

function getOverlay() {
    if (overlay && document.body.contains(overlay.root)) return overlay;

    const root = document.createElement('div');
    root.className = 'matephis-lightbox';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.hidden = true;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'matephis-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Chiudi');
    closeBtn.title = 'Chiudi (Esc)';
    closeBtn.innerHTML = MatephisIcons.close;

    const stage = document.createElement('div');
    stage.className = 'matephis-lightbox-stage';

    root.appendChild(closeBtn);
    root.appendChild(stage);
    document.body.appendChild(root);

    overlay = { root, stage, closeBtn, active: null };
    return overlay;
}

export class LightboxBridge {
    constructor(plot) {
        this.plot = plot;
        this.isOpen = false;
        this.placeholder = null;
        this._onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); this.close(); } };
        this._onBackdrop = (e) => { if (e.target === this._ov.root || e.target === this._ov.stage) this.close(); };
        this._onCloseBtn = (e) => { e.stopPropagation(); this.close(); };
        this._onResize = () => this._fit();
    }

    open() {
        if (this.isOpen) return;
        const ov = getOverlay();
        if (ov.active && ov.active !== this) ov.active.close();
        this._ov = ov;
        ov.active = this;

        const wrapper = this.plot.wrapper;
        this.isOpen = true;
        this._returnFocus = document.activeElement;
        this._saved = { width: wrapper.style.width, maxWidth: wrapper.style.maxWidth, margin: wrapper.style.margin };

        this.placeholder = document.createComment('matephis-plot-placeholder');
        wrapper.parentNode.insertBefore(this.placeholder, wrapper);
        ov.stage.appendChild(wrapper);
        wrapper.classList.add('matephis-in-lightbox');
        wrapper.style.margin = '0';
        wrapper.style.maxWidth = 'none';

        ov.root.hidden = false;
        document.documentElement.classList.add('matephis-lightbox-open');

        ov.root.addEventListener('click', this._onBackdrop);
        ov.closeBtn.addEventListener('click', this._onCloseBtn);
        document.addEventListener('keydown', this._onKey);
        window.addEventListener('resize', this._onResize);

        this._fit();
        ov.closeBtn.focus({ preventScroll: true });
        this.plot._onLightboxChange(true);
    }

    /** Sizes the plot to the largest box that fits the viewport. */
    _fit() {
        if (!this.isOpen) return;
        const wrapper = this.plot.wrapper;
        const stageH = this.plot.plotStage.offsetHeight || 1;
        const extra = Math.max(0, wrapper.offsetHeight - stageH); // toolbar + sliders
        const aspect = this.plot.width / this.plot.height;
        const availW = window.innerWidth * 0.94;
        const availH = window.innerHeight * 0.92 - extra - 24;
        const w = Math.max(200, Math.min(availW, availH * aspect, 1600));
        wrapper.style.width = `${Math.round(w)}px`;
    }

    close() {
        if (!this.isOpen) return;
        const ov = this._ov;
        const wrapper = this.plot.wrapper;

        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.parentNode.insertBefore(wrapper, this.placeholder);
            this.placeholder.remove();
        }
        this.placeholder = null;

        wrapper.classList.remove('matephis-in-lightbox');
        wrapper.style.width = this._saved.width;
        wrapper.style.maxWidth = this._saved.maxWidth;
        wrapper.style.margin = this._saved.margin;

        ov.root.hidden = true;
        ov.active = null;
        document.documentElement.classList.remove('matephis-lightbox-open');
        ov.root.removeEventListener('click', this._onBackdrop);
        ov.closeBtn.removeEventListener('click', this._onCloseBtn);
        document.removeEventListener('keydown', this._onKey);
        window.removeEventListener('resize', this._onResize);

        this.isOpen = false;
        if (this._returnFocus && this._returnFocus.focus) this._returnFocus.focus({ preventScroll: true });
        this.plot._onLightboxChange(false);
    }
}
