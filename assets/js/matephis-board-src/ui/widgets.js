/**
 * World-space Matephis Engine & Exercise Widget Manager (/board/).
 *
 * Renders `page.widgets` inside `overlay.widgetsLayer` (`OVERLAY_PX_PER_MM = 4`)
 * with zone-based pointer pass-through:
 * - Default: `.board-widget-body` is write-through (`pointer-events: none`), while
 *   explicit controls (sliders, buttons, switches, "Mostra soluzione") and the
 *   unified corner handle (`.board-widget-handle`) stay live.
 * - Edit mode (`.is-editing`): shows screen-space `.board-widget-chrome` in
 *   `overlay.chromeLayer` (drag-move, corner resize, edit JSON/config, lock
 *   controls, interact-canvas toggle, delete) recorded in `HistoryStack`.
 */

import { OVERLAY_PX_PER_MM } from './overlay.js';
import { BoardIcons } from './icons.js';
import { hydrateEmbeddedEngines } from './exercise-picker.js';
import { nextWidgetId } from '../model/scene.js';
import { worldToScreen } from '../ink/geometry.js';

export const DEFAULT_WIDGET_SIZES = {
    plot: { w: 135, h: 95 },
    physics: { w: 145, h: 98 },
    sets: { w: 135, h: 92 },
    circuit: { w: 130, h: 85 },
    exercise: { w: 155, h: 96 },
};

const PLOT_PALETTE_CYCLE = ['summer1', 'summer2', 'summer3', 'summer4', 'summer5', 'summer6', 'summer7'];

/**
 * Split comma/semicolon-separated math expressions without breaking calls like `max(x, 0)`.
 */
export function splitFunctionList(rawText) {
    const src = String(rawText || '').trim();
    if (!src) return [];
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
        else if ((ch === ',' || ch === ';') && depth === 0) {
            const seg = src.slice(start, i).trim();
            if (seg) parts.push(seg);
            start = i + 1;
        }
    }
    const tail = src.slice(start).trim();
    if (tail) parts.push(tail);
    return parts;
}

export function createQuickPlotConfig({ xMin = -5, xMax = 5, yMin = -4, yMax = 4, fnText = '' } = {}) {
    const x0 = Number.isFinite(Number(xMin)) ? Number(xMin) : -5;
    const x1 = Number.isFinite(Number(xMax)) && Number(xMax) > x0 ? Number(xMax) : x0 + 10;
    const y0 = Number.isFinite(Number(yMin)) ? Number(yMin) : -4;
    const y1 = Number.isFinite(Number(yMax)) && Number(yMax) > y0 ? Number(yMax) : y0 + 8;
    const fns = splitFunctionList(fnText);

    return {
        xlim: [x0, x1],
        ylim: [y0, y1],
        grid: true,
        axisArrows: true,
        fullWidth: true,
        cssWidth: '100%',
        border: true,
        data: fns.map((fn, idx) => ({
            fn,
            color: PLOT_PALETTE_CYCLE[idx % PLOT_PALETTE_CYCLE.length],
        })),
    };
}

export const WIDGET_PRESETS = {
    'piano-inclinato': {
        id: 'piano-inclinato',
        label: 'Piano inclinato',
        kind: 'physics',
        data: {
            preset: { name: 'incline', with: { angle: 30, mu: 0.25, mass: 2, solve: true } },
            fullWidth: true,
            cssWidth: '100%',
            border: true,
        },
    },
    forze: {
        id: 'forze',
        label: 'Forze',
        kind: 'physics',
        data: {
            xlim: [-2.5, 4.5],
            ylim: [-1.2, 4.0],
            grid: true,
            fullWidth: true,
            cssWidth: '100%',
            border: true,
            forceScale: 0.08,
            params: {
                F: { val: 25, min: 0, max: 50, step: 1, unit: 'N', label: 'F' },
                alpha: { val: 30, min: 0, max: 80, step: 5, unit: 'deg', label: 'α' },
            },
            objects: [
                { id: 'ground', type: 'ground', y: 0 },
                { id: 'A', type: 'block', on: 'ground', pos: 0.45, size: [1.3, 0.8], mass: 2, label: 'm' },
                { id: 'Fp', type: 'force', on: 'A', dir: 'down', mag: '2 * 9.81', label: '\\vec P', showValue: true, color: 'blue' },
                { id: 'Fn', type: 'force', on: 'A', dir: 'up', mag: 'max(0, 2 * 9.81 - F * sin(alpha))', label: '\\vec N', showValue: true, color: 'green' },
                { id: 'Ft', type: 'force', on: 'A', dir: 'alpha', mag: 'F', label: '\\vec F', showValue: true, color: 'red' },
            ],
        },
    },
    'circuito-rc': {
        id: 'circuito-rc',
        label: 'Circuito RC',
        kind: 'circuit',
        data: {
            cssWidth: '100%',
            border: true,
            padding: 1,
            segments: [
                { start: [0, 0], end: [0, 3], components: [{ type: 'voltage_source', label: 'V₀' }] },
                { end: [4, 3], components: [{ type: 'switch', state: 'open', label: 'S' }, { type: 'resistor', label: 'R' }] },
                { end: [4, 0], components: [{ type: 'capacitor', label: 'C' }] },
                { end: [0, 0] },
            ],
        },
    },
    venn: {
        id: 'venn',
        label: 'Venn',
        kind: 'sets',
        data: {
            fullWidth: true,
            cssWidth: '100%',
            border: true,
            sets: [
                { id: 'A', label: 'A', elements: ['1', '2', '3', '4'], order: 'given' },
                { id: 'B', label: 'B', elements: ['3', '4', '5', '6'], order: 'given' },
            ],
            maps: [
                { id: 'f', label: 'f', from: 'A', to: 'B', pairs: { '1': '3', '2': '4', '3': '5', '4': '6' } },
            ],
            show: ['image(f)', 'properties(f)'],
        },
    },
};

export const ENGINE_STARTER_CONFIGS = {
    physics: WIDGET_PRESETS['piano-inclinato'].data,
    sets: WIDGET_PRESETS.venn.data,
    circuit: WIDGET_PRESETS['circuito-rc'].data,
    plot: createQuickPlotConfig({ xMin: -5, xMax: 5, yMin: -4, yMax: 4, fnText: 'sin(x)' }),
};

function cloneData(obj) {
    return obj && typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : {};
}

function widgetSignature(w) {
    return `${w.kind}::${JSON.stringify(w.data || {})}`;
}

export class WidgetManager {
    constructor(overlay, { scene, history, surface, engineLoader, getTheme, onSceneMutated = null }) {
        this.overlay = overlay;
        this.scene = scene;
        this.history = history;
        this.surface = surface;
        this.engineLoader = engineLoader;
        this.getTheme = getTheme || (() => 'light');
        this.onSceneMutated = onSceneMutated;

        this.mounted = new Map(); // widgetId -> { widget, el, bodyEl, handleEl, resizeEl, instance, embeddedInstances, signature, mountSeq }
        this.editingId = null;
        this.interactiveIds = new Set();
        this.jsonEditorOpen = false;
        this._chromeEl = null;

        this._unsubCamera = this.overlay.onCameraSync((cam) => this._syncChromePosition(cam));
    }

    insertWidget(kind, data, sizeOpts = {}) {
        const def = DEFAULT_WIDGET_SIZES[kind] || { w: 135, h: 90 };
        const w = Math.max(40, Number(sizeOpts.w) || def.w);
        const h = Math.max(28, Number(sizeOpts.h) || def.h);

        const cam = this.scene.camera;
        const viewW = (this.surface ? this.surface.width : 1280) / cam.scale;
        const viewH = (this.surface ? this.surface.height : 720) / cam.scale;
        const offset = (this.scene.widgets.length % 5) * 6;
        const x = Math.round((cam.x + viewW * 0.5 - w * 0.5 + offset) * 10) / 10;
        const y = Math.round((cam.y + viewH * 0.5 - h * 0.5 + offset) * 10) / 10;

        const widget = {
            id: nextWidgetId(),
            kind,
            x,
            y,
            w,
            h,
            lockedControls: false,
            data: cloneData(data),
        };

        this.scene.widgets.push(widget);
        this.history.push({ type: 'widget-add', widget });
        this.editingId = null;
        this.jsonEditorOpen = false;
        this.syncFromScene();
        if (this.onSceneMutated) this.onSceneMutated();
        return widget;
    }

    clearSelection() {
        if (!this.editingId && !this.jsonEditorOpen) return;
        this.editingId = null;
        this.jsonEditorOpen = false;
        this._updateWidgetClasses();
        this._renderChrome();
    }

    getElement(id) {
        const entry = this.mounted.get(id);
        return entry ? entry.el : null;
    }

    setTheme(_theme) {
        // Engines listen to `matephis-theme-change` on window; circuit & exercise use CSS tokens.
        this._updateWidgetClasses();
    }

    syncFromScene() {
        const widgets = this.scene.widgets || [];
        const activeIds = new Set(widgets.map((w) => w.id));

        // Destroy stale widget DOM & engine instances
        for (const [id, entry] of this.mounted.entries()) {
            if (!activeIds.has(id)) {
                this._destroyEntry(entry);
                this.mounted.delete(id);
                this.interactiveIds.delete(id);
                if (this.editingId === id) {
                    this.editingId = null;
                    this.jsonEditorOpen = false;
                }
            }
        }

        // Mount new or re-mount modified widgets
        for (const w of widgets) {
            let entry = this.mounted.get(w.id);
            const sig = widgetSignature(w);
            if (!entry) {
                entry = this._createEntry(w);
                this.mounted.set(w.id, entry);
                this._mountEngine(w, entry);
            } else {
                entry.widget = w;
                this._applyGeometry(w, entry);
                if (entry.signature !== sig) {
                    entry.signature = sig;
                    entry.lastWidthMm = w.w;
                    this._unmountInstances(entry);
                    this._mountEngine(w, entry);
                } else {
                    if (w.w !== entry.lastWidthMm) {
                        entry.lastWidthMm = w.w;
                        if (entry.instance && typeof entry.instance.resize === 'function') {
                            try { entry.instance.resize(Math.round(w.w * OVERLAY_PX_PER_MM)); } catch (_) { /* ignore */ }
                        }
                    }
                    if (w.kind === 'exercise') {
                        this._syncExerciseSolutionUI(w, entry);
                    }
                }
            }
        }

        this._updateWidgetClasses();
        this._renderChrome();
        if (this.engineLoader && widgets.length > 0) {
            this.engineLoader.ensureForPage(this.scene.currentPage);
        }
    }

    _createEntry(w) {
        const el = document.createElement('div');
        el.className = 'board-widget';
        el.dataset.widgetId = w.id;
        el.dataset.widgetKind = w.kind;

        const bodyEl = document.createElement('div');
        bodyEl.className = 'board-widget-body';

        const handleEl = document.createElement('button');
        handleEl.type = 'button';
        handleEl.className = 'board-widget-handle';
        handleEl.title = 'Modifica / sposta blocco';
        handleEl.setAttribute('aria-label', 'Modifica / sposta blocco');
        handleEl.innerHTML = BoardIcons.tune;
        handleEl.addEventListener('pointerdown', (e) => e.stopPropagation());
        handleEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.editingId === w.id) {
                this.editingId = null;
                this.jsonEditorOpen = false;
            } else {
                this.editingId = w.id;
                this.jsonEditorOpen = false;
            }
            this._updateWidgetClasses();
            this._renderChrome();
        });

        const resizeEl = document.createElement('div');
        resizeEl.className = 'board-widget-resize';
        resizeEl.title = 'Ridimensiona blocco';
        this._bindResizeDrag(resizeEl, w.id);

        this._bindBodyDrag(el, w.id);

        el.append(bodyEl, handleEl, resizeEl);
        this.overlay.widgetsLayer.appendChild(el);

        const entry = {
            widget: w,
            el,
            bodyEl,
            handleEl,
            resizeEl,
            instance: null,
            embeddedInstances: [],
            signature: widgetSignature(w),
            lastWidthMm: w.w,
            mountSeq: 0,
        };
        this._applyGeometry(w, entry);
        return entry;
    }

    _applyGeometry(w, entry) {
        entry.el.style.left = `${(w.x * OVERLAY_PX_PER_MM).toFixed(2)}px`;
        entry.el.style.top = `${(w.y * OVERLAY_PX_PER_MM).toFixed(2)}px`;
        entry.el.style.width = `${(w.w * OVERLAY_PX_PER_MM).toFixed(2)}px`;
        entry.el.style.height = `${(w.h * OVERLAY_PX_PER_MM).toFixed(2)}px`;
    }

    _updateWidgetClasses() {
        for (const [id, entry] of this.mounted.entries()) {
            const w = entry.widget;
            entry.el.classList.toggle('is-editing', this.editingId === id);
            entry.el.classList.toggle('is-controls-locked', Boolean(w.lockedControls));
            entry.el.classList.toggle('is-canvas-interactive', this.interactiveIds.has(id));
        }
    }

    async _mountEngine(w, entry) {
        const seq = ++entry.mountSeq;
        const body = entry.bodyEl;
        body.innerHTML = '';

        if (w.kind === 'exercise') {
            this._mountExercise(w, entry, seq);
            return;
        }

        const loading = document.createElement('div');
        loading.className = 'board-widget-loading';
        loading.textContent = 'Caricamento…';
        body.appendChild(loading);

        try {
            const Engine = await this.engineLoader.loadEngine(w.kind);
            if (seq !== entry.mountSeq || !this.mounted.has(w.id)) return;

            const cfg = cloneData(w.data);
            if ((w.kind === 'physics' && cfg.graphs) || (w.kind === 'sets' && cfg.plot)) {
                await this.engineLoader.loadEngine('plot');
                if (seq !== entry.mountSeq || !this.mounted.has(w.id)) return;
            }

            body.innerHTML = '';
            cfg.cssWidth = '100%';

            if (w.kind === 'circuit') {
                if (!Engine || typeof Engine._render !== 'function') {
                    throw new Error('MatephisCircuit non disponibile');
                }
                Engine._render(body, JSON.stringify(cfg));
                return;
            }

            if (cfg.fullWidth === undefined) cfg.fullWidth = true;
            if (!Engine || typeof Engine.render !== 'function') {
                throw new Error(`Motore ${w.kind} non disponibile`);
            }
            const pxWidth = Math.max(160, Math.round(w.w * OVERLAY_PX_PER_MM));
            const inst = Engine.render(body, cfg, {
                noLightbox: true,
                observeResize: false,
                width: pxWidth,
            });
            entry.instance = inst || null;
            entry.lastWidthMm = w.w;
        } catch (err) {
            if (seq !== entry.mountSeq) return;
            body.innerHTML = `<div class="board-widget-error">Errore widget: ${String(err && err.message ? err.message : err)}</div>`;
        }
    }

    async _mountExercise(w, entry, seq) {
        const body = entry.bodyEl;
        const data = w.data || {};

        const card = document.createElement('div');
        card.className = 'board-widget-exercise';
        if (data.hideSolution !== false && data.hideSolution !== undefined ? Boolean(data.hideSolution) : false) {
            card.classList.add('is-solution-hidden');
        }
        if (data.hideSolution) {
            card.classList.add('is-solution-hidden');
        }

        const header = document.createElement('div');
        header.className = 'board-widget-ex-header';

        const meta = document.createElement('div');
        meta.className = 'board-widget-ex-meta';
        const parts = [data.noteTitle || 'Esercizio', data.section, data.label].filter(Boolean);
        meta.textContent = parts.join(' · ');
        header.appendChild(meta);

        const content = document.createElement('div');
        content.className = 'board-widget-ex-content';
        content.innerHTML = data.html || '<p>Nessun contenuto.</p>';

        const hasSol = Boolean(data.hasSolution) || Boolean(content.querySelector('.solution-tag, .solution-text, .hint-tag, details.details'));
        if (hasSol) {
            const solBtn = document.createElement('button');
            solBtn.type = 'button';
            solBtn.className = 'board-widget-sol-toggle';
            solBtn.textContent = data.hideSolution ? 'Mostra soluzione' : 'Nascondi soluzione';
            solBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
            solBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const prevData = cloneData(w.data);
                w.data = { ...cloneData(w.data), hideSolution: !w.data.hideSolution };
                const nextData = cloneData(w.data);
                this.history.push({ type: 'widget-update', id: w.id, prev: { data: prevData }, next: { data: nextData } });
                entry.signature = widgetSignature(w);
                this._syncExerciseSolutionUI(w, entry);
                if (this.onSceneMutated) this.onSceneMutated();
            });
            header.appendChild(solBtn);
            entry.solBtn = solBtn;
        } else {
            entry.solBtn = null;
        }

        entry.exCard = card;
        card.append(header, content);
        body.appendChild(card);

        // Hydrate any embedded Matephis blocks and typeset MathJax
        try {
            const embedded = await hydrateEmbeddedEngines(content, this.engineLoader);
            if (seq !== entry.mountSeq || !this.mounted.has(w.id)) {
                for (const inst of embedded) if (inst && typeof inst.destroy === 'function') inst.destroy();
                return;
            }
            entry.embeddedInstances.push(...embedded);
        } catch (_) { /* ignore */ }

        try {
            await this.engineLoader.typeset([content]);
        } catch (_) { /* ignore */ }

        if (seq !== entry.mountSeq || !this.mounted.has(w.id)) return;

        // Auto-expand height on initial insert if content overflows default height
        if (!w.data._heightFitted && content.scrollHeight > 0) {
            const totalPx = card.scrollHeight + 12;
            const neededMm = Math.min(205, Math.ceil(totalPx / OVERLAY_PX_PER_MM));
            if (neededMm > w.h) {
                w.h = neededMm;
                this._applyGeometry(w, entry);
            }
            w.data._heightFitted = true;
            entry.signature = widgetSignature(w);
        }
    }

    _syncExerciseSolutionUI(w, entry) {
        if (!entry || !entry.exCard) return;
        const hidden = Boolean(w.data && w.data.hideSolution);
        entry.exCard.classList.toggle('is-solution-hidden', hidden);
        if (entry.solBtn) {
            entry.solBtn.textContent = hidden ? 'Mostra soluzione' : 'Nascondi soluzione';
        }
    }

    _unmountInstances(entry) {
        if (entry.instance && typeof entry.instance.destroy === 'function') {
            try { entry.instance.destroy(); } catch (_) { /* ignore */ }
        }
        entry.instance = null;
        for (const inst of entry.embeddedInstances || []) {
            if (inst && typeof inst.destroy === 'function') {
                try { inst.destroy(); } catch (_) { /* ignore */ }
            }
        }
        entry.embeddedInstances = [];
        entry.exCard = null;
        entry.solBtn = null;
    }

    _destroyEntry(entry) {
        entry.mountSeq++;
        this._unmountInstances(entry);
        if (entry.el && entry.el.parentNode) entry.el.parentNode.removeChild(entry.el);
    }

    _bindBodyDrag(el, widgetId) {
        let drag = null;
        el.addEventListener('pointerdown', (e) => {
            if (this.editingId !== widgetId) return;
            if (e.target.closest('.board-widget-handle, .board-widget-resize, input, button, select, textarea, summary')) return;
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            e.stopPropagation();
            e.preventDefault();
            try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            drag = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                origX: entry.widget.x,
                origY: entry.widget.y,
                moved: false,
            };
        });
        el.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            const scale = this.scene.camera.scale;
            const dx = (e.clientX - drag.startX) / scale;
            const dy = (e.clientY - drag.startY) / scale;
            if (Math.abs(e.clientX - drag.startX) > 2 || Math.abs(e.clientY - drag.startY) > 2) {
                drag.moved = true;
            }
            entry.widget.x = Math.round((drag.origX + dx) * 10) / 10;
            entry.widget.y = Math.round((drag.origY + dy) * 10) / 10;
            this._applyGeometry(entry.widget, entry);
            this._syncChromePosition(this.scene.camera);
        });
        const finish = (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            const cur = drag;
            drag = null;
            if (entry && cur.moved) {
                this.history.push({
                    type: 'widget-update',
                    id: widgetId,
                    prev: { x: cur.origX, y: cur.origY },
                    next: { x: entry.widget.x, y: entry.widget.y },
                });
                if (this.onSceneMutated) this.onSceneMutated();
            }
        };
        el.addEventListener('pointerup', finish);
        el.addEventListener('pointercancel', finish);
    }

    _bindResizeDrag(resizeEl, widgetId) {
        let drag = null;
        resizeEl.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            try { resizeEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            drag = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                origW: entry.widget.w,
                origH: entry.widget.h,
                moved: false,
            };
        });
        resizeEl.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            const scale = this.scene.camera.scale;
            const dw = (e.clientX - drag.startX) / scale;
            const dh = (e.clientY - drag.startY) / scale;
            if (Math.abs(e.clientX - drag.startX) > 2 || Math.abs(e.clientY - drag.startY) > 2) {
                drag.moved = true;
            }
            entry.widget.w = Math.max(50, Math.round((drag.origW + dw) * 10) / 10);
            entry.widget.h = Math.max(32, Math.round((drag.origH + dh) * 10) / 10);
            entry.lastWidthMm = entry.widget.w;
            this._applyGeometry(entry.widget, entry);
            if (entry.instance && typeof entry.instance.resize === 'function') {
                try { entry.instance.resize(Math.round(entry.widget.w * OVERLAY_PX_PER_MM)); } catch (_) { /* ignore */ }
            }
            this._syncChromePosition(this.scene.camera);
        });
        const finish = (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            const cur = drag;
            drag = null;
            if (entry && cur.moved) {
                entry.lastWidthMm = entry.widget.w;
                if (entry.instance && typeof entry.instance.resize === 'function') {
                    try { entry.instance.resize(Math.round(entry.widget.w * OVERLAY_PX_PER_MM)); } catch (_) { /* ignore */ }
                }
                this.history.push({
                    type: 'widget-update',
                    id: widgetId,
                    prev: { w: cur.origW, h: cur.origH },
                    next: { w: entry.widget.w, h: entry.widget.h },
                });
                if (this.onSceneMutated) this.onSceneMutated();
            }
        };
        resizeEl.addEventListener('pointerup', finish);
        resizeEl.addEventListener('pointercancel', finish);
    }

    _renderChrome() {
        const layer = this.overlay.chromeLayer;
        layer.innerHTML = '';
        this._chromeEl = null;
        if (!this.editingId) return;

        const entry = this.mounted.get(this.editingId);
        if (!entry) return;
        const w = entry.widget;

        const chrome = document.createElement('div');
        chrome.className = 'board-widget-chrome';
        chrome.addEventListener('pointerdown', (e) => e.stopPropagation());

        const bar = document.createElement('div');
        bar.className = 'board-widget-chrome-bar';

        const moveBtn = document.createElement('button');
        moveBtn.type = 'button';
        moveBtn.className = 'board-widget-chrome-btn is-drag';
        moveBtn.textContent = 'Sposta';
        moveBtn.title = 'Trascina per spostare il blocco';
        this._bindChromeMove(moveBtn, w.id);
        bar.appendChild(moveBtn);

        if (w.kind !== 'exercise') {
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = `board-widget-chrome-btn${this.jsonEditorOpen ? ' active' : ''}`;
            editBtn.textContent = 'Config';
            editBtn.title = 'Modifica configurazione JSON';
            editBtn.addEventListener('click', () => {
                this.jsonEditorOpen = !this.jsonEditorOpen;
                this._renderChrome();
            });
            bar.appendChild(editBtn);
        }

        const lockBtn = document.createElement('button');
        lockBtn.type = 'button';
        lockBtn.className = `board-widget-chrome-btn${w.lockedControls ? ' active' : ''}`;
        lockBtn.textContent = w.lockedControls ? 'Sblocca ctrl' : 'Blocca ctrl';
        lockBtn.title = 'Blocca o sblocca controlli interni';
        lockBtn.addEventListener('click', () => {
            const prev = Boolean(w.lockedControls);
            const next = !prev;
            w.lockedControls = next;
            this.history.push({
                type: 'widget-update',
                id: w.id,
                prev: { lockedControls: prev },
                next: { lockedControls: next },
            });
            this._updateWidgetClasses();
            this._renderChrome();
            if (this.onSceneMutated) this.onSceneMutated();
        });
        bar.appendChild(lockBtn);

        const interactBtn = document.createElement('button');
        interactBtn.type = 'button';
        const isInter = this.interactiveIds.has(w.id);
        interactBtn.className = `board-widget-chrome-btn${isInter ? ' active' : ''}`;
        interactBtn.textContent = isInter ? 'Scrivi sopra' : 'Interagisci';
        interactBtn.title = 'Attiva/disattiva interazione diretta sul diagramma';
        interactBtn.addEventListener('click', () => {
            if (this.interactiveIds.has(w.id)) this.interactiveIds.delete(w.id);
            else this.interactiveIds.add(w.id);
            this._updateWidgetClasses();
            this._renderChrome();
        });
        bar.appendChild(interactBtn);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'board-widget-chrome-btn is-danger';
        delBtn.innerHTML = BoardIcons.delete;
        delBtn.title = 'Elimina blocco';
        delBtn.addEventListener('click', () => {
            const idx = this.scene.widgets.findIndex((item) => item.id === w.id);
            if (idx !== -1) {
                this.scene.widgets.splice(idx, 1);
                this.history.push({ type: 'widget-remove', widget: w, index: idx });
                this.editingId = null;
                this.jsonEditorOpen = false;
                this.syncFromScene();
                if (this.onSceneMutated) this.onSceneMutated();
            }
        });
        bar.appendChild(delBtn);

        const doneBtn = document.createElement('button');
        doneBtn.type = 'button';
        doneBtn.className = 'board-widget-chrome-btn';
        doneBtn.innerHTML = BoardIcons.close;
        doneBtn.title = 'Chiudi modifica';
        doneBtn.addEventListener('click', () => this.clearSelection());
        bar.appendChild(doneBtn);

        chrome.appendChild(bar);

        if (this.jsonEditorOpen && w.kind !== 'exercise') {
            const editor = document.createElement('div');
            editor.className = 'board-widget-json-editor';

            const ta = document.createElement('textarea');
            ta.rows = 7;
            ta.spellcheck = false;
            ta.value = JSON.stringify(w.data || {}, null, 2);

            const errEl = document.createElement('div');
            errEl.className = 'board-widget-json-err';
            errEl.hidden = true;

            const actions = document.createElement('div');
            actions.className = 'board-widget-json-actions';
            const applyBtn = document.createElement('button');
            applyBtn.type = 'button';
            applyBtn.className = 'board-action-btn board-action-primary';
            applyBtn.textContent = 'Applica';
            applyBtn.addEventListener('click', () => {
                try {
                    const parsed = JSON.parse(ta.value);
                    if (!parsed || typeof parsed !== 'object') throw new Error('Config non valida');
                    const prevData = cloneData(w.data);
                    const nextData = cloneData(parsed);
                    w.data = nextData;
                    this.history.push({
                        type: 'widget-update',
                        id: w.id,
                        prev: { data: prevData },
                        next: { data: nextData },
                    });
                    this.jsonEditorOpen = false;
                    this.syncFromScene();
                    if (this.onSceneMutated) this.onSceneMutated();
                } catch (err) {
                    errEl.hidden = false;
                    errEl.textContent = `JSON non valido: ${err.message}`;
                }
            });
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'board-action-btn';
            cancelBtn.textContent = 'Annulla';
            cancelBtn.addEventListener('click', () => {
                this.jsonEditorOpen = false;
                this._renderChrome();
            });
            actions.append(cancelBtn, applyBtn);
            editor.append(ta, errEl, actions);
            chrome.appendChild(editor);
        }

        layer.appendChild(chrome);
        this._chromeEl = chrome;
        this._syncChromePosition(this.scene.camera);
    }

    _bindChromeMove(btn, widgetId) {
        let drag = null;
        btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            try { btn.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            drag = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                origX: entry.widget.x,
                origY: entry.widget.y,
                moved: false,
            };
        });
        btn.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            const scale = this.scene.camera.scale;
            const dx = (e.clientX - drag.startX) / scale;
            const dy = (e.clientY - drag.startY) / scale;
            if (Math.abs(e.clientX - drag.startX) > 2 || Math.abs(e.clientY - drag.startY) > 2) {
                drag.moved = true;
            }
            entry.widget.x = Math.round((drag.origX + dx) * 10) / 10;
            entry.widget.y = Math.round((drag.origY + dy) * 10) / 10;
            this._applyGeometry(entry.widget, entry);
            this._syncChromePosition(this.scene.camera);
        });
        const finish = (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            const cur = drag;
            drag = null;
            if (entry && cur.moved) {
                this.history.push({
                    type: 'widget-update',
                    id: widgetId,
                    prev: { x: cur.origX, y: cur.origY },
                    next: { x: entry.widget.x, y: entry.widget.y },
                });
                if (this.onSceneMutated) this.onSceneMutated();
            }
        };
        btn.addEventListener('pointerup', finish);
        btn.addEventListener('pointercancel', finish);
    }

    _syncChromePosition(cam) {
        if (!this._chromeEl || !this.editingId) return;
        const entry = this.mounted.get(this.editingId);
        if (!entry) return;
        const w = entry.widget;
        const pt = worldToScreen(w.x, w.y, cam);
        const vw = this.surface ? this.surface.width : window.innerWidth;
        const x = Math.max(8, Math.min(vw - 280, pt.x));
        const y = Math.max(8, pt.y - 44);
        this._chromeEl.style.left = `${Math.round(x)}px`;
        this._chromeEl.style.top = `${Math.round(y)}px`;
    }

    destroy() {
        if (this._unsubCamera) this._unsubCamera();
        for (const entry of this.mounted.values()) {
            this._destroyEntry(entry);
        }
        this.mounted.clear();
        this.interactiveIds.clear();
        this.editingId = null;
        if (this.overlay && this.overlay.chromeLayer) {
            this.overlay.chromeLayer.innerHTML = '';
        }
    }
}
