/**
 * Static pictures (canvas bitmaps) of board widgets.
 *
 * Widgets are live DOM, so anything drawn on a canvas — the pinned reference strip,
 * the pixelated pan/zoom picture — needs a bitmap of them. This cache builds one per
 * widget: from the live element when the widget is on the current page, otherwise by
 * rendering the engine off-screen once. Pictures are static (sliders as they were) and
 * leave out HTML parts (slider rows, readouts); exercises become a plain text card.
 */

import { OVERLAY_PX_PER_MM } from './overlay.js';
import { cloneStyledWidgetSVG } from '../export/svg-export.js';
import { renderDomPicture } from './dom-picture.js';
import { exerciseSteps, revealLevel, revealSteps } from './exercise-steps.js';

const PICTURE_SCALE = 1.5;        // bitmap pixels per layout pixel (memory: ~3 MB per large widget)
const MAX_SIDE_PX = 2400;
const LIVE_SETTLE_MS = 800;       // a live widget is re-pictured once it has been still this long

function signatureOf(widget, theme) {
    return `${theme}|${widget.kind}|${widget.w}|${JSON.stringify(widget.data || {})}`;
}

function svgToImage(svgEl, w, h) {
    return new Promise((resolve, reject) => {
        const clone = cloneStyledWidgetSVG(svgEl);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', String(w));
        clone.setAttribute('height', String(h));
        if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${w} ${h}`);
        const xml = new XMLSerializer().serializeToString(clone);
        const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
        img.src = url;
    });
}

/** Wrap `text` into lines no wider than `maxW` on `ctx`. */
function wrapLines(ctx, text, maxW) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const w of words) {
        const next = line ? `${line} ${w}` : w;
        if (ctx.measureText(next).width > maxW && line) {
            lines.push(line);
            line = w;
        } else {
            line = next;
        }
    }
    if (line) lines.push(line);
    return lines;
}

export class WidgetPictureCache {
    constructor({ engineLoader, getTheme, getMountedElement, onUpdate = null, isWanted = null }) {
        this.engineLoader = engineLoader;
        this.getTheme = getTheme || (() => 'light');
        this.getMountedElement = getMountedElement || (() => null);
        this.onUpdate = onUpdate;
        // Pictures cost memory (~3 MB per large widget): only widgets someone will draw
        // (pixel effect on the current page, the pinned page) get one.
        this.isWanted = isWanted || (() => true);
        this.entries = new Map(); // widgetId -> { sig, canvas, building, liveAt }
        this._offscreen = null;
    }

    /** The picture of `widget` if it is ready and current; schedules one otherwise. */
    get(widget) {
        const sig = signatureOf(widget, this.getTheme());
        const e = this.entries.get(widget.id);
        if (e && e.canvas && e.sig === sig) return e.canvas;
        this.request(widget);
        return e && e.canvas && e.sig.split('|')[0] === sig.split('|')[0] ? e.canvas : null;
    }

    /** Pictures for every widget of a page, or null while one of them is missing. */
    picturesFor(widgets) {
        const out = [];
        for (const w of widgets || []) {
            const canvas = this.get(w);
            if (!canvas) return null;
            out.push({ x: w.x, y: w.y, w: w.w, h: w.h, canvas });
        }
        return out;
    }

    /** Pictures that are ready (the others are requested): for previews that can fill in later. */
    availableFor(widgets) {
        const out = [];
        for (const w of widgets || []) {
            const canvas = this.get(w);
            if (canvas) out.push({ x: w.x, y: w.y, w: w.w, h: w.h, canvas });
        }
        return out;
    }

    /**
     * A live widget changed (slider, animation): refresh its picture once it has been
     * still for a moment, so a running animation does not re-picture every frame.
     */
    touch(widget) {
        if (!this.isWanted(widget.id)) return;
        let e = this.entries.get(widget.id);
        if (!e) {
            this.request(widget);
            return;
        }
        clearTimeout(e.touchTimer);
        e.touchTimer = setTimeout(() => this.request(widget, true), LIVE_SETTLE_MS);
    }

    request(widget, force = false) {
        const sig = signatureOf(widget, this.getTheme());
        let e = this.entries.get(widget.id);
        if (!e) {
            e = { sig: null, canvas: null, building: null, touchTimer: null };
            this.entries.set(widget.id, e);
        }
        if (e.building && e.buildingSig === sig && !force) return;
        if (!force && e.sig === sig && e.canvas) return;
        const run = async () => {
            try {
                const canvas = await this._build(widget);
                if (canvas) {
                    e.canvas = canvas;
                    e.sig = sig;
                    if (this.onUpdate) this.onUpdate(widget);
                }
            } catch (_) { /* keep the previous picture */ }
            if (e.building === promise) e.building = null;
        };
        const idle = typeof requestIdleCallback === 'function'
            ? (fn) => requestIdleCallback(fn, { timeout: 600 })
            : (fn) => setTimeout(fn, 60);
        const promise = new Promise((resolve) => idle(() => run().then(resolve)));
        e.building = promise;
        e.buildingSig = sig;
    }

    /** Drop every picture whose widget is not in `ids` (a Set): frees their bitmaps. */
    retain(ids) {
        for (const [id, e] of this.entries) {
            if (ids.has(id)) continue;
            clearTimeout(e.touchTimer);
            e.canvas = null;
            this.entries.delete(id);
        }
    }

    forget(id) {
        const e = this.entries.get(id);
        if (e) clearTimeout(e.touchTimer);
        this.entries.delete(id);
    }

    async _build(widget) {
        const live = this.getMountedElement(widget.id);
        if (live && live.isConnected && live.offsetWidth > 0) {
            return this._picture(live, widget);
        }
        if (widget.kind === 'exercise') return this._offscreenExercise(widget);
        return this._offscreenRender(widget);
    }

    /** Whole widget, HTML included; the SVG-only drawing is the fallback. */
    async _picture(el, widget) {
        const width = el.offsetWidth || widget.w * OVERLAY_PX_PER_MM;
        const height = el.offsetHeight || widget.h * OVERLAY_PX_PER_MM;
        try {
            return await renderDomPicture(el, {
                width,
                height,
                scale: Math.min(PICTURE_SCALE, MAX_SIDE_PX / Math.max(width, height, 1)),
                theme: this.getTheme(),
                strip: ['.board-widget-grip', '.board-widget-resize'],
                classesOff: ['is-editing', 'is-canvas-interactive'],
            });
        } catch (_) {
            if (widget.kind === 'exercise') return this._exerciseCard(widget);
            return this._fromElement(el, widget);
        }
    }

    _offscreenHost() {
        if (!this._offscreen) {
            this._offscreen = document.createElement('div');
            this._offscreen.className = 'board-picture-host';
            this._offscreen.setAttribute('aria-hidden', 'true');
            document.body.appendChild(this._offscreen);
        }
        return this._offscreen;
    }

    /** An exercise of another page: same card markup as the widget, typeset, pictured. */
    async _offscreenExercise(widget) {
        const data = widget.data || {};
        const host = document.createElement('div');
        host.className = 'board-widget';
        host.dataset.widgetKind = 'exercise';
        host.style.width = `${Math.round(widget.w * OVERLAY_PX_PER_MM)}px`;
        host.innerHTML = `<div class="board-widget-body"><div class="board-widget-exercise">`
            + '<div class="board-widget-ex-header"><div class="board-widget-ex-meta"></div></div>'
            + '<div class="board-widget-ex-content"></div></div></div>';
        host.querySelector('.board-widget-ex-meta').textContent = [data.noteTitle || 'Esercizio', data.section, data.label].filter(Boolean).join(' · ');
        const content = host.querySelector('.board-widget-ex-content');
        content.innerHTML = data.html || '';
        const steps = exerciseSteps(content);
        revealSteps(steps, revealLevel(data, steps));
        this._offscreenHost().appendChild(host);
        try {
            if (this.engineLoader && typeof this.engineLoader.typeset === 'function') {
                try { await this.engineLoader.typeset([content]); } catch (_) { /* text only */ }
            }
            return await this._picture(host, widget);
        } finally {
            host.remove();
        }
    }

    _newCanvas(widthPx, heightPx) {
        const scale = Math.min(PICTURE_SCALE, MAX_SIDE_PX / Math.max(widthPx, heightPx, 1));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(widthPx * scale));
        canvas.height = Math.max(1, Math.round(heightPx * scale));
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        return { canvas, ctx };
    }

    _paintCard(ctx, w, h) {
        const dark = this.getTheme() === 'dark';
        ctx.fillStyle = dark ? '#121212' : '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = dark ? '#3f3f46' : '#d4d4d8';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    }

    /** Draw the SVGs and canvases inside `root` at their layout positions. */
    async _fromElement(root, widget) {
        const rootRect = root.getBoundingClientRect();
        const layoutW = root.offsetWidth || widget.w * OVERLAY_PX_PER_MM;
        const layoutH = root.offsetHeight || widget.h * OVERLAY_PX_PER_MM;
        const k = rootRect.width / layoutW || 1;
        const { canvas, ctx } = this._newCanvas(layoutW, layoutH);
        this._paintCard(ctx, layoutW, layoutH);

        const nodes = Array.from(root.querySelectorAll('svg, canvas')).filter((n) => {
            if (n.tagName.toLowerCase() === 'svg' && n.parentElement && n.parentElement.closest('svg')) return false;
            if (n.closest('.mjx-container, .board-widget-grip, .board-widget-resize')) return false;
            return true;
        });
        for (const node of nodes) {
            const r = node.getBoundingClientRect();
            const x = (r.left - rootRect.left) / k;
            const y = (r.top - rootRect.top) / k;
            const w = r.width / k;
            const h = r.height / k;
            if (w < 2 || h < 2) continue;
            try {
                if (node.tagName.toLowerCase() === 'canvas') {
                    ctx.drawImage(node, x, y, w, h);
                } else {
                    const img = await svgToImage(node, Math.round(w), Math.round(h));
                    ctx.drawImage(img, x, y, w, h);
                }
            } catch (_) { /* skip a part that will not rasterize */ }
        }
        return canvas;
    }

    /** Render the engine once in a hidden host, picture it, throw it away. */
    async _offscreenRender(widget) {
        if (!this.engineLoader) return null;
        const Engine = await this.engineLoader.loadEngine(widget.kind);
        if ((widget.kind === 'physics' && widget.data && widget.data.graphs)
            || (widget.kind === 'sets' && widget.data && widget.data.plot)) {
            await this.engineLoader.loadEngine('plot');
        }
        if (!Engine) return null;
        this._offscreenHost();
        const host = document.createElement('div');
        host.className = 'board-widget';
        const widthPx = Math.round(widget.w * OVERLAY_PX_PER_MM);
        host.style.width = `${widthPx}px`;
        const body = document.createElement('div');
        body.className = 'board-widget-body';
        host.appendChild(body);
        this._offscreen.appendChild(host);
        let inst = null;
        try {
            const cfg = JSON.parse(JSON.stringify(widget.data || {}));
            cfg.cssWidth = '100%';
            if (widget.kind === 'circuit') {
                if (typeof Engine._render === 'function') Engine._render(body, JSON.stringify(cfg));
            } else {
                if (cfg.fullWidth === undefined) cfg.fullWidth = true;
                cfg.border = false;
                inst = Engine.render(body, cfg, { noLightbox: true, observeResize: false, width: Math.max(160, widthPx) });
            }
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            return await this._picture(host, widget);
        } finally {
            if (inst && typeof inst.destroy === 'function') {
                try { inst.destroy(); } catch (_) { /* ignore */ }
            }
            host.remove();
        }
    }

    /** Exercises: title and text on a card (MathJax and images are left out). */
    _exerciseCard(widget) {
        const data = widget.data || {};
        const layoutW = widget.w * OVERLAY_PX_PER_MM;
        const layoutH = Math.max(60, widget.h * OVERLAY_PX_PER_MM);
        const { canvas, ctx } = this._newCanvas(layoutW, layoutH);
        this._paintCard(ctx, layoutW, layoutH);
        const dark = this.getTheme() === 'dark';
        ctx.fillStyle = dark ? '#a1a1aa' : '#71717a';
        ctx.font = '11.5px "Space Mono", monospace';
        ctx.fillText([data.noteTitle || 'Esercizio', data.section, data.label].filter(Boolean).join(' · '), 10, 20);
        const tmp = document.createElement('div');
        tmp.innerHTML = data.html || '';
        for (const sol of tmp.querySelectorAll('.solution-text, .hint-text, details')) sol.remove();
        ctx.fillStyle = dark ? '#e4e4e7' : '#27272a';
        ctx.font = '14.5px "Noto Sans", sans-serif';
        const lines = wrapLines(ctx, tmp.textContent || '', layoutW - 20);
        let y = 44;
        for (const line of lines) {
            if (y > layoutH - 8) break;
            ctx.fillText(line, 10, y);
            y += 20;
        }
        return canvas;
    }
}
