/**
 * World-space Matephis Engine & Exercise Widget Manager (/board/).
 *
 * Renders `page.widgets` inside `overlay.widgetsLayer` (`OVERLAY_PX_PER_MM = 4`).
 * - The body is write-through (`pointer-events: none`): pens write over it, while
 *   explicit controls (sliders, buttons, "Mostra soluzione") stay live.
 * - A grip tab above each widget moves it (with the ink written on it) and, when
 *   tapped, selects it: a screen-space toolbar in `overlay.chromeLayer` offers
 *   Modifica, Interagisci, lock, JSON, delete. A right-edge handle sets the width;
 *   the height always follows the content, so nothing is clipped.
 */

import { OVERLAY_PX_PER_MM } from './overlay.js';
import { BoardIcons } from './icons.js';
import { hydrateEmbeddedEngines } from './exercise-picker.js';
import { exerciseSteps, revealLevel, revealSteps } from './exercise-steps.js';
import { nextWidgetId } from '../model/scene.js';
import { worldToScreen } from '../ink/geometry.js';
import { refreshStrokeBBox } from '../ink/stroke.js';

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

/** Short Italian names shown on each widget's grip. */
export const WIDGET_KIND_LABELS = {
    plot: 'Grafico',
    physics: 'Fisica',
    sets: 'Insiemi',
    circuit: 'Circuito',
    exercise: 'Esercizio',
};

const GRIP_DRAG_THRESHOLD_PX = 6;
const MIN_WIDGET_W = 60;

/**
 * Strokes that sit on a widget: their bounding-box centre is inside the widget and
 * the box does not reach more than `margin` mm outside it. These move with the widget,
 * so notes written on a plot stay on the plot.
 */
export function findStrokesOnWidget(strokes, widget, margin = 4) {
    const out = [];
    if (!Array.isArray(strokes) || !widget) return out;
    const x0 = widget.x;
    const y0 = widget.y;
    const x1 = widget.x + widget.w;
    const y1 = widget.y + widget.h;
    for (const s of strokes) {
        const b = s && s.bbox;
        if (!b) continue;
        const cx = (b.minX + b.maxX) / 2;
        const cy = (b.minY + b.maxY) / 2;
        if (cx < x0 || cx > x1 || cy < y0 || cy > y1) continue;
        if (b.minX < x0 - margin || b.maxX > x1 + margin || b.minY < y0 - margin || b.maxY > y1 + margin) continue;
        out.push(s);
    }
    return out;
}

function translateStrokeList(list, dx, dy) {
    for (const s of list) {
        // A new points array invalidates the stroke's cached outline
        s.points = s.points.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
        refreshStrokeBBox(s);
    }
}

export class WidgetManager {
    constructor(overlay, {
        scene,
        history,
        surface,
        engineLoader,
        getTheme,
        onSceneMutated = null,
        onEditWidget = null,
        onWidgetVisualChange = null,
    }) {
        this.overlay = overlay;
        this.scene = scene;
        this.history = history;
        this.surface = surface;
        this.engineLoader = engineLoader;
        this.getTheme = getTheme || (() => 'light');
        this.onSceneMutated = onSceneMutated;
        this.onEditWidget = onEditWidget;
        this.onWidgetVisualChange = onWidgetVisualChange;

        this.mounted = new Map(); // widgetId -> entry
        this.editingId = null;     // the selected widget (its toolbar is shown)
        this.interactiveIds = new Set();
        this.jsonEditorOpen = false;
        this._chromeEl = null;

        this._unsubCamera = this.overlay.onCameraSync((cam) => this._syncChromePosition(cam));
    }

    insertWidget(kind, data, sizeOpts = {}) {
        const def = DEFAULT_WIDGET_SIZES[kind] || { w: 135, h: 90 };
        const w = Math.max(MIN_WIDGET_W, Number(sizeOpts.w) || def.w);
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
        // Select the new widget, so its toolbar shows where it can be moved or changed.
        this.editingId = widget.id;
        this.jsonEditorOpen = false;
        this.syncFromScene();
        if (this.onSceneMutated) this.onSceneMutated();
        return widget;
    }

    /** Replace a widget's configuration (one undo step). */
    updateWidgetData(id, nextData) {
        const w = this.scene.widgets.find((item) => item.id === id);
        if (!w) return;
        const prevData = cloneData(w.data);
        w.data = cloneData(nextData);
        this.history.push({ type: 'widget-update', id, prev: { data: prevData }, next: { data: cloneData(w.data) } });
        this.syncFromScene();
        if (this.onSceneMutated) this.onSceneMutated();
    }

    getWidget(id) {
        return this.scene.widgets.find((item) => item.id === id) || null;
    }

    clearSelection() {
        if (!this.editingId && !this.jsonEditorOpen && this.interactiveIds.size === 0) return;
        this.editingId = null;
        this.jsonEditorOpen = false;
        // "Interagisci" lasts only while the widget is selected.
        this.interactiveIds.clear();
        this._updateWidgetClasses();
        this._renderChrome();
    }

    select(id) {
        if (!this.mounted.has(id)) return;
        this.editingId = id;
        this.jsonEditorOpen = false;
        for (const other of Array.from(this.interactiveIds)) {
            if (other !== id) this.interactiveIds.delete(other);
        }
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
                        this._resizeInstance(entry);
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

        // Grip: a tab above the widget. Drag it to move (with the ink on the widget), tap it to select.
        const gripEl = document.createElement('div');
        gripEl.className = 'board-widget-grip';
        gripEl.setAttribute('role', 'button');
        gripEl.setAttribute('aria-label', `Sposta o seleziona: ${WIDGET_KIND_LABELS[w.kind] || 'blocco'}`);
        gripEl.title = 'Trascina per spostare, tocca per le opzioni';
        gripEl.innerHTML = `${BoardIcons.grip}<span class="board-widget-grip-label">${WIDGET_KIND_LABELS[w.kind] || 'Blocco'}</span>`;
        this._bindGrip(gripEl, w.id);

        const bodyEl = document.createElement('div');
        bodyEl.className = 'board-widget-body';

        // Width handle on the right edge; the height follows the content.
        const resizeEl = document.createElement('div');
        resizeEl.className = 'board-widget-resize';
        resizeEl.title = 'Trascina per cambiare la larghezza';
        this._bindResizeDrag(resizeEl, w.id);

        el.append(gripEl, bodyEl, resizeEl);
        this.overlay.widgetsLayer.appendChild(el);

        const entry = {
            widget: w,
            el,
            bodyEl,
            gripEl,
            resizeEl,
            instance: null,
            embeddedInstances: [],
            signature: widgetSignature(w),
            lastWidthMm: w.w,
            mountSeq: 0,
            resizeObserver: null,
        };
        this._applyGeometry(w, entry);
        this._observeHeight(entry);
        // Any visible change (mount, slider, animation) refreshes the widget's static picture.
        if (this.onWidgetVisualChange && typeof MutationObserver === 'function') {
            entry.mutationObserver = new MutationObserver(() => this.onWidgetVisualChange(entry.widget));
            entry.mutationObserver.observe(bodyEl, { childList: true, subtree: true, attributes: true, characterData: true });
        }
        return entry;
    }

    _applyGeometry(w, entry) {
        entry.el.style.left = `${(w.x * OVERLAY_PX_PER_MM).toFixed(2)}px`;
        entry.el.style.top = `${(w.y * OVERLAY_PX_PER_MM).toFixed(2)}px`;
        entry.el.style.width = `${(w.w * OVERLAY_PX_PER_MM).toFixed(2)}px`;
        // Height is the content's: nothing is ever clipped. `w.h` mirrors it for exports and hit tests.
    }

    /** Keep `widget.h` (mm) equal to the rendered height, which the content decides. */
    _observeHeight(entry) {
        if (typeof ResizeObserver !== 'function') return;
        entry.resizeObserver = new ResizeObserver(() => {
            const px = entry.el.offsetHeight;
            if (!px) return;
            const mm = Math.round((px / OVERLAY_PX_PER_MM) * 10) / 10;
            if (Math.abs(mm - entry.widget.h) < 0.2) return;
            entry.widget.h = mm;
            if (this.editingId === entry.widget.id) this._syncChromePosition(this.scene.camera);
            if (this.onSceneMutated) this.onSceneMutated();
        });
        entry.resizeObserver.observe(entry.el);
    }

    _updateWidgetClasses() {
        for (const [id, entry] of this.mounted.entries()) {
            const w = entry.widget;
            entry.el.classList.toggle('is-editing', this.editingId === id);
            entry.el.classList.toggle('is-controls-locked', Boolean(w.lockedControls));
            entry.el.classList.toggle('is-canvas-interactive', this.interactiveIds.has(id));
        }
    }

    _resizeInstance(entry) {
        if (entry.instance && typeof entry.instance.resize === 'function') {
            try { entry.instance.resize(Math.round(entry.widget.w * OVERLAY_PX_PER_MM)); } catch (_) { /* ignore */ }
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
            // The widget card is the frame: a second border inside it is noise.
            cfg.border = false;
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
            body.innerHTML = '';
            const errEl = document.createElement('div');
            errEl.className = 'board-widget-error';
            errEl.textContent = `Errore: ${String(err && err.message ? err.message : err)}`;
            body.appendChild(errEl);
        }
    }

    async _mountExercise(w, entry, seq) {
        const body = entry.bodyEl;
        const data = w.data || {};

        const card = document.createElement('div');
        card.className = 'board-widget-exercise';

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

        // One button per step; tapping a step shows everything up to it, tapping it again hides it.
        entry.steps = exerciseSteps(content);
        entry.stepButtons = entry.steps.map((step, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-ex-step';
            btn.textContent = step.label;
            btn.addEventListener('pointerdown', (e) => e.stopPropagation());
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const level = revealLevel(w.data, entry.steps);
                const prevData = cloneData(w.data);
                const next = cloneData(w.data);
                delete next.hideSolution; // superseded by the step
                next.reveal = level === i ? i - 1 : i;
                w.data = next;
                this.history.push({ type: 'widget-update', id: w.id, prev: { data: prevData }, next: { data: cloneData(w.data) } });
                entry.signature = widgetSignature(w);
                this._syncExerciseSolutionUI(w, entry);
                if (this.onSceneMutated) this.onSceneMutated();
            });
            return btn;
        });

        entry.exCard = card;
        card.append(header, content);
        if (entry.stepButtons.length) {
            const bar = document.createElement('div');
            bar.className = 'board-ex-steps';
            bar.append(...entry.stepButtons);
            header.after(bar);
        }
        body.appendChild(card);
        this._syncExerciseSolutionUI(w, entry);

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
    }

    _syncExerciseSolutionUI(w, entry) {
        if (!entry || !entry.exCard) return;
        const level = revealLevel(w.data, entry.steps);
        revealSteps(entry.steps, level);
        entry.stepButtons.forEach((btn, i) => btn.setAttribute('aria-pressed', String(i <= level)));
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
        entry.steps = [];
        entry.stepButtons = [];
    }

    _destroyEntry(entry) {
        entry.mountSeq++;
        this._unmountInstances(entry);
        if (entry.resizeObserver) entry.resizeObserver.disconnect();
        if (entry.mutationObserver) entry.mutationObserver.disconnect();
        if (entry.el && entry.el.parentNode) entry.el.parentNode.removeChild(entry.el);
    }

    /**
     * Grip: tap selects / deselects, drag moves the widget together with the ink on it.
     * Moving lives only here, so the engine inside never competes for the pointer.
     */
    _bindGrip(gripEl, widgetId) {
        let drag = null;
        const finish = (e, cancelled) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const cur = drag;
            drag = null;
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            if (cur.moving) {
                const dx = Math.round((entry.widget.x - cur.origX) * 10) / 10;
                const dy = Math.round((entry.widget.y - cur.origY) * 10) / 10;
                if (dx !== 0 || dy !== 0) {
                    this.history.push({
                        type: 'widget-move',
                        id: widgetId,
                        dx,
                        dy,
                        strokeIds: cur.strokes.map((s) => s.id),
                    });
                }
                if (this.surface && cur.strokes.length) this.surface.renderCommittedNow();
                if (this.onSceneMutated) this.onSceneMutated();
                this._syncChromePosition(this.scene.camera);
                return;
            }
            if (cancelled) return;
            if (this.editingId === widgetId) this.clearSelection();
            else this.select(widgetId);
        };

        gripEl.addEventListener('pointerdown', (e) => {
            if (e.button > 0) return;
            e.stopPropagation();
            e.preventDefault();
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            try { gripEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            drag = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                origX: entry.widget.x,
                origY: entry.widget.y,
                appliedDx: 0,
                appliedDy: 0,
                moving: false,
                strokes: [],
            };
        });
        gripEl.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            if (!drag.moving) {
                if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < GRIP_DRAG_THRESHOLD_PX) return;
                drag.moving = true;
                drag.strokes = findStrokesOnWidget(this.scene.strokes, entry.widget);
            }
            const scale = this.scene.camera.scale;
            const dx = Math.round(((e.clientX - drag.startX) / scale) * 10) / 10;
            const dy = Math.round(((e.clientY - drag.startY) / scale) * 10) / 10;
            const ddx = dx - drag.appliedDx;
            const ddy = dy - drag.appliedDy;
            if (ddx === 0 && ddy === 0) return;
            drag.appliedDx = dx;
            drag.appliedDy = dy;
            entry.widget.x = Math.round((drag.origX + dx) * 10) / 10;
            entry.widget.y = Math.round((drag.origY + dy) * 10) / 10;
            this._applyGeometry(entry.widget, entry);
            if (drag.strokes.length) {
                translateStrokeList(drag.strokes, ddx, ddy);
                if (this.surface) this.surface.requestCommittedRedraw();
            }
            this._syncChromePosition(this.scene.camera);
        });
        gripEl.addEventListener('pointerup', (e) => finish(e, false));
        gripEl.addEventListener('pointercancel', (e) => finish(e, true));
        gripEl.addEventListener('lostpointercapture', (e) => finish(e, true));
    }

    _bindResizeDrag(resizeEl, widgetId) {
        let drag = null;
        const finish = (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            const cur = drag;
            drag = null;
            if (entry && cur.moved) {
                entry.lastWidthMm = entry.widget.w;
                this._resizeInstance(entry);
                this.history.push({
                    type: 'widget-update',
                    id: widgetId,
                    prev: { w: cur.origW },
                    next: { w: entry.widget.w },
                });
                if (this.onSceneMutated) this.onSceneMutated();
            }
        };
        resizeEl.addEventListener('pointerdown', (e) => {
            if (e.button > 0) return;
            e.stopPropagation();
            e.preventDefault();
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            try { resizeEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            drag = { pointerId: e.pointerId, startX: e.clientX, origW: entry.widget.w, moved: false };
        });
        resizeEl.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            const entry = this.mounted.get(widgetId);
            if (!entry) return;
            const dw = (e.clientX - drag.startX) / this.scene.camera.scale;
            if (Math.abs(e.clientX - drag.startX) > 2) drag.moved = true;
            entry.widget.w = Math.max(MIN_WIDGET_W, Math.round((drag.origW + dw) * 10) / 10);
            entry.lastWidthMm = entry.widget.w;
            this._applyGeometry(entry.widget, entry);
            this._resizeInstance(entry);
            this._syncChromePosition(this.scene.camera);
        });
        resizeEl.addEventListener('pointerup', finish);
        resizeEl.addEventListener('pointercancel', finish);
        resizeEl.addEventListener('lostpointercapture', finish);
    }

    _chromeButton(label, icon, { active = false, danger = false, title = '' } = {}) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `board-widget-chrome-btn${active ? ' active' : ''}${danger ? ' is-danger' : ''}`;
        btn.innerHTML = `${icon || ''}${label ? `<span>${label}</span>` : ''}`;
        btn.title = title || label;
        if (!label) btn.setAttribute('aria-label', title);
        return btn;
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

        if (this.onEditWidget && (w.kind === 'plot' || w.kind === 'physics' || w.kind === 'sets')) {
            const editBtn = this._chromeButton('Modifica', BoardIcons.tune, {
                title: w.kind === 'plot' ? 'Assi e funzioni' : 'Scegli un altro preset',
            });
            editBtn.addEventListener('click', () => this.onEditWidget(w));
            bar.appendChild(editBtn);
        }

        if (w.kind !== 'exercise') {
            const isInter = this.interactiveIds.has(w.id);
            const interactBtn = this._chromeButton('Interagisci', BoardIcons.interact, {
                active: isInter,
                title: isInter
                    ? 'Il diagramma risponde al tocco: tocca di nuovo per tornare a scrivere sopra'
                    : 'Trascina punti e zoom nel diagramma invece di scriverci sopra',
            });
            interactBtn.addEventListener('click', () => {
                if (this.interactiveIds.has(w.id)) this.interactiveIds.delete(w.id);
                else this.interactiveIds.add(w.id);
                this._updateWidgetClasses();
                this._renderChrome();
            });
            bar.appendChild(interactBtn);
        }

        const lockBtn = this._chromeButton('', w.lockedControls ? BoardIcons.lock : BoardIcons.lockOpen, {
            active: Boolean(w.lockedControls),
            title: w.lockedControls ? 'Sblocca cursori e pulsanti' : 'Blocca cursori e pulsanti (per scriverci sopra)',
        });
        lockBtn.addEventListener('click', () => {
            const prev = Boolean(w.lockedControls);
            w.lockedControls = !prev;
            this.history.push({
                type: 'widget-update',
                id: w.id,
                prev: { lockedControls: prev },
                next: { lockedControls: !prev },
            });
            this._updateWidgetClasses();
            this._renderChrome();
            if (this.onSceneMutated) this.onSceneMutated();
        });
        bar.appendChild(lockBtn);

        if (w.kind !== 'exercise') {
            const jsonBtn = this._chromeButton('', BoardIcons.code, {
                active: this.jsonEditorOpen,
                title: 'Configurazione JSON (avanzata)',
            });
            jsonBtn.addEventListener('click', () => {
                this.jsonEditorOpen = !this.jsonEditorOpen;
                this._renderChrome();
            });
            bar.appendChild(jsonBtn);
        }

        const sep = document.createElement('span');
        sep.className = 'board-widget-chrome-sep';
        bar.appendChild(sep);

        const delBtn = this._chromeButton('', BoardIcons.delete, { danger: true, title: 'Elimina blocco' });
        delBtn.addEventListener('click', () => {
            const idx = this.scene.widgets.findIndex((item) => item.id === w.id);
            if (idx !== -1) {
                this.scene.widgets.splice(idx, 1);
                this.history.push({ type: 'widget-remove', widget: w, index: idx });
                this.editingId = null;
                this.jsonEditorOpen = false;
                this.interactiveIds.delete(w.id);
                this.syncFromScene();
                if (this.onSceneMutated) this.onSceneMutated();
            }
        });
        bar.appendChild(delBtn);

        const doneBtn = this._chromeButton('', BoardIcons.close, { title: 'Chiudi' });
        doneBtn.addEventListener('click', () => this.clearSelection());
        bar.appendChild(doneBtn);

        chrome.appendChild(bar);

        if (this.jsonEditorOpen && w.kind !== 'exercise') {
            chrome.appendChild(this._buildJsonEditor(w));
        }

        layer.appendChild(chrome);
        this._chromeEl = chrome;
        this._syncChromePosition(this.scene.camera);
    }

    _buildJsonEditor(w) {
        const editor = document.createElement('div');
        editor.className = 'board-widget-json-editor';

        const ta = document.createElement('textarea');
        ta.rows = 9;
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
                this.jsonEditorOpen = false;
                this.updateWidgetData(w.id, parsed);
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
        return editor;
    }

    /** Place the toolbar just above the widget's grip, inside the viewport. */
    _syncChromePosition(cam) {
        if (!this._chromeEl || !this.editingId) return;
        const entry = this.mounted.get(this.editingId);
        if (!entry) return;
        const w = entry.widget;
        const pt = worldToScreen(w.x, w.y, cam);
        const vw = this.surface ? this.surface.width : window.innerWidth;
        const gripH = entry.gripEl && entry.gripEl.getBoundingClientRect
            ? entry.gripEl.getBoundingClientRect().height
            : 0;
        const barH = this._chromeEl.offsetHeight || 44;
        const chromeW = this._chromeEl.offsetWidth || 280;
        let y = pt.y - gripH - barH - 6;
        if (y < 8) {
            // No room above: show it under the widget instead.
            const bottom = worldToScreen(w.x, w.y + w.h, cam).y;
            y = bottom + 8;
        }
        const x = Math.max(8, Math.min(vw - chromeW - 8, pt.x));
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
