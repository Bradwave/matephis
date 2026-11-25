/**
 * Popovers for Matephis Board features:
 * - Quick Cartesian Axes / Matephis Plot
 * - Matephis Diagrams (physics and sets presets by topic; circuits hidden for now)
 * - Exercise sheet (tap-only: subject → topic → note → section → number, live preview)
 * - Cloud Session & QR Sync (Phase 4 stub)
 */

import { BoardIcons } from './icons.js';
import { sanitizeHtmlToFragment } from '../model/sanitize-html.js';
import {
    hydrateEmbeddedEngines,
    shortNoteTitle,
} from './exercise-picker.js';
import {
    ENGINE_STARTER_CONFIGS,
    createQuickPlotConfig,
} from './widgets.js';

/**
 * The physics and sets presets (about 30 KB) load on their own, after start-up: only the
 * diagram editor needs them. index.js starts the load when the board is idle.
 */
let presetsPromise = null;
export function loadPresets() {
    if (!presetsPromise) {
        presetsPromise = Promise.all([import('./physics-presets.js'), import('./sets-presets.js')])
            .then(([p, s]) => ({ physics: p.PHYSICS_PRESET_SECTIONS, sets: s.SETS_PRESET_SECTIONS }))
            .catch((err) => { presetsPromise = null; throw err; });
    }
    return presetsPromise;
}
import {
    MAX_PLOT_FNS,
    PLOT_PALETTE_IDS,
    PLOT_SWATCHES,
    PLOT_TEMPLATES,
    PLOT_WINDOWS,
    buildFunctionEditor,
    defaultParam,
    detectParams,
    cloneJson,
    exprUsesName,
    formatNum,
    instantiateTemplate,
    niceStep,
    presetSliderLabels,
    prettyExpr,
    roundTo,
    sameView,
    snapTo,
} from './plot-editor.js';

export class FutureMenus {
    constructor(hostEl, {
        engineLoader = null,
        exercisePicker = null,
        onInsertPlot = null,
        onInsertDiagram = null,
        onInsertExercise = null,
        onUpdateWidget = null,
        getWidget = null,
        onClose = null,
    } = {}) {
        this.hostEl = hostEl;
        this.engineLoader = engineLoader;
        this.exercisePicker = exercisePicker;
        this.onInsertPlot = onInsertPlot;
        this.onInsertDiagram = onInsertDiagram;
        this.onInsertExercise = onInsertExercise;
        this.onUpdateWidget = onUpdateWidget;
        this.getWidget = getWidget;
        this.onClose = onClose;

        this.activePopover = null; // null | 'plot' | 'diagrams' | 'exercises' | 'cloud'
        this._exState = { previewInstances: [] }; // replaced by the exercise sheet's state

        this.popovers = {
            plot: this._buildPlotPopover(),
            diagrams: this._buildDiagramsPopover(),
            exercises: this._buildExercisesPopover(),
            cloud: this._buildCloudPopover(),
        };

        for (const el of Object.values(this.popovers)) {
            el.addEventListener('pointerdown', (e) => e.stopPropagation());
            this.hostEl.appendChild(el);
        }
    }

    toggle(name) {
        if (this.activePopover === name) {
            this.hideAll();
            return null;
        }
        this.show(name);
        return name;
    }

    show(name) {
        this._destroyAllPreviews();
        this.activePopover = this.popovers[name] ? name : null;
        for (const [key, el] of Object.entries(this.popovers)) {
            el.hidden = key !== this.activePopover;
        }
        if (this.activePopover === 'exercises' && this._exerciseSheet) {
            this._exerciseSheet.open();
        }
        // Opened from the toolbar: a new item, not the last edited one.
        if (this.activePopover === 'plot' && this._plotEditor) this._plotEditor.reset();
        if (this.activePopover === 'diagrams' && this._diagramEditor) this._diagramEditor.reset();
    }

    hideAll() {
        this.activePopover = null;
        this._destroyAllPreviews();
        for (const el of Object.values(this.popovers)) {
            el.hidden = true;
        }
    }

    _closeMenu() {
        this.hideAll();
        if (this.onClose) this.onClose();
    }

    // =========================================================================
    // Live previews: a real engine instance inside a popover, replaced on change.
    // =========================================================================

    /**
     * Render `cfg` with the `kind` engine into `box` (debounced by the caller).
     * One preview per `slot`; a newer call wins over a slower older one.
     */
    async _renderPreview(slot, box, kind, cfg) {
        this._previews = this._previews || {};
        const prev = this._previews[slot] || { seq: 0, inst: null };
        const seq = prev.seq + 1;
        this._destroyPreview(slot);
        this._previews[slot] = { seq, inst: null };
        if (!this.engineLoader || !box) return;
        box.classList.add('is-loading');
        try {
            const Engine = await this.engineLoader.loadEngine(kind);
            if ((kind === 'physics' && cfg.graphs) || (kind === 'sets' && cfg.plot)) {
                await this.engineLoader.loadEngine('plot');
            }
            if (!this._previews[slot] || this._previews[slot].seq !== seq) return;
            box.innerHTML = '';
            const c = cloneJson(cfg);
            c.cssWidth = '100%';
            c.fullWidth = true;
            c.border = false;
            const width = Math.max(200, Math.round(box.clientWidth - 2));
            const inst = Engine.render(box, c, { noLightbox: true, observeResize: false, width });
            this._previews[slot].inst = inst || null;
        } catch (err) {
            if (!this._previews[slot] || this._previews[slot].seq !== seq) return;
            box.innerHTML = '';
            const msg = document.createElement('div');
            msg.className = 'board-preview-msg';
            msg.textContent = `Anteprima non disponibile: ${err && err.message ? err.message : err}`;
            box.appendChild(msg);
        } finally {
            box.classList.remove('is-loading');
        }
    }

    /** In a scrolling tab row, bring the active tab into view (no page scroll). */
    _revealActiveTab(row) {
        if (!row) return;
        // A fade marks the side where more tabs are hidden.
        const syncFade = () => {
            row.classList.toggle('has-more-left', row.scrollLeft > 2);
            row.classList.toggle('has-more-right', row.scrollLeft + row.clientWidth < row.scrollWidth - 2);
        };
        if (!row.dataset.fadeBound) {
            row.dataset.fadeBound = '1';
            row.addEventListener('scroll', syncFade, { passive: true });
        }
        requestAnimationFrame(syncFade);
        const active = row.querySelector('.active');
        if (!active) return;
        const left = active.offsetLeft - row.offsetLeft;
        if (left < row.scrollLeft) row.scrollLeft = left - 8;
        else if (left + active.offsetWidth > row.scrollLeft + row.clientWidth) {
            row.scrollLeft = left + active.offsetWidth - row.clientWidth + 8;
        }
    }

    _destroyPreview(slot) {
        const p = this._previews && this._previews[slot];
        if (p && p.inst && typeof p.inst.destroy === 'function') {
            try { p.inst.destroy(); } catch (_) { /* ignore */ }
        }
        if (p) p.inst = null;
    }

    _destroyAllPreviews() {
        for (const slot of Object.keys(this._previews || {})) this._destroyPreview(slot);
    }

    // =========================================================================
    // 1. Plot sheet: live preview on top; window presets and steppers, function
    //    templates whose coefficients become sliders, and a small function editor.
    // =========================================================================

    _buildPlotPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-sheet board-editor-sheet board-plot-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title"><span data-plot-title>Nuovo grafico</span></div>
            <div class="board-preview" data-plot-preview></div>
            <div class="board-sheet-scroll">
                <div data-plot-main>
                    <div class="board-chip-section">
                        <div class="board-micro-label">Finestra</div>
                        <div class="board-chip-row" data-plot-windows></div>
                        <div class="board-range-grid" data-plot-ranges></div>
                    </div>
                    <div class="board-chip-section">
                        <div class="board-micro-label">Funzioni</div>
                        <div class="board-fn-list" data-plot-fns></div>
                        <div class="board-fn-editor-wrap" data-plot-keypad hidden></div>
                        <div class="board-micro-label board-micro-sub">Aggiungi</div>
                        <div class="board-fn-templates" data-plot-templates></div>
                    </div>
                </div>
                <div data-plot-json hidden>
                    <textarea class="board-json-textarea" rows="14" spellcheck="false"></textarea>
                </div>
                <div class="board-popover-error" hidden></div>
            </div>
            <div class="board-popover-footer">
                <button type="button" class="board-action-btn" data-plot-json-toggle title="Configurazione JSON (avanzata)">
                    ${BoardIcons.code}<span>JSON</span>
                </button>
                <span class="board-footer-spacer"></span>
                <button type="button" class="board-action-btn" data-plot-cancel>Annulla</button>
                <button type="button" class="board-action-btn board-action-primary" data-plot-submit>
                    ${BoardIcons.axes}<span>Inserisci</span>
                </button>
            </div>
        `;

        const titleEl = el.querySelector('[data-plot-title]');
        const previewBox = el.querySelector('[data-plot-preview]');
        const mainPane = el.querySelector('[data-plot-main]');
        const jsonPane = el.querySelector('[data-plot-json]');
        const jsonArea = jsonPane.querySelector('textarea');
        const jsonToggle = el.querySelector('[data-plot-json-toggle]');
        const errBox = el.querySelector('.board-popover-error');
        const windowsRow = el.querySelector('[data-plot-windows]');
        const rangesEl = el.querySelector('[data-plot-ranges]');
        const fnsEl = el.querySelector('[data-plot-fns]');
        const templatesEl = el.querySelector('[data-plot-templates]');
        const keypadWrap = el.querySelector('[data-plot-keypad]');
        const submitBtn = el.querySelector('[data-plot-submit]');

        // Editor state: `base` keeps whatever the edited widget had that the editor does not show.
        let st = null;
        const fresh = () => ({
            editId: null,
            base: {},
            extraData: [],
            view: { ...PLOT_WINDOWS[0].view },
            fns: [],
            showJson: false,
            editIndex: null,   // index of the function open in the editor (null: a new one)
            draft: '',         // what the editor holds now, previewed live
        });

        for (const win of PLOT_WINDOWS) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'board-chip';
            b.textContent = win.label;
            b.addEventListener('click', () => {
                st.view = { ...win.view };
                render();
            });
            windowsRow.appendChild(b);
        }

        const stepper = (label, onDec, onInc, valueText) => {
            const row = document.createElement('div');
            row.className = 'board-stepper';
            const lab = document.createElement('span');
            lab.className = 'board-stepper-label';
            lab.textContent = label;
            const dec = document.createElement('button');
            dec.type = 'button';
            dec.className = 'board-stepper-btn';
            dec.innerHTML = BoardIcons.remove;
            dec.setAttribute('aria-label', `${label}: diminuisci`);
            dec.addEventListener('click', onDec);
            const val = document.createElement('span');
            val.className = 'board-stepper-value';
            val.textContent = valueText;
            const inc = document.createElement('button');
            inc.type = 'button';
            inc.className = 'board-stepper-btn';
            inc.innerHTML = BoardIcons.add;
            inc.setAttribute('aria-label', `${label}: aumenta`);
            inc.addEventListener('click', onInc);
            row.append(lab, dec, val, inc);
            return row;
        };

        const nudge = (key, dir) => {
            const v = st.view;
            const axis = key[0];
            const span = axis === 'x' ? v.xMax - v.xMin : v.yMax - v.yMin;
            const step = niceStep(span);
            const next = roundTo(snapTo(v[key], step) + dir * step, 6);
            const minKey = `${axis}Min`;
            const maxKey = `${axis}Max`;
            if (key === minKey && next >= v[maxKey]) return;
            if (key === maxKey && next <= v[minKey]) return;
            v[key] = next;
            render();
        };

        const zoom = (factor) => {
            const v = st.view;
            const cx = (v.xMin + v.xMax) / 2;
            const cy = (v.yMin + v.yMax) / 2;
            const hx = ((v.xMax - v.xMin) / 2) * factor;
            const hy = ((v.yMax - v.yMin) / 2) * factor;
            st.view = {
                xMin: roundTo(cx - hx, 4), xMax: roundTo(cx + hx, 4),
                yMin: roundTo(cy - hy, 4), yMax: roundTo(cy + hy, 4),
            };
            render();
        };

        const renderRanges = () => {
            rangesEl.innerHTML = '';
            const v = st.view;
            rangesEl.append(
                stepper('x min', () => nudge('xMin', -1), () => nudge('xMin', 1), formatNum(v.xMin)),
                stepper('x max', () => nudge('xMax', -1), () => nudge('xMax', 1), formatNum(v.xMax)),
                stepper('y min', () => nudge('yMin', -1), () => nudge('yMin', 1), formatNum(v.yMin)),
                stepper('y max', () => nudge('yMax', -1), () => nudge('yMax', 1), formatNum(v.yMax)),
            );
            const zoomRow = document.createElement('div');
            zoomRow.className = 'board-range-zoom';
            const zOut = document.createElement('button');
            zOut.type = 'button';
            zOut.className = 'board-action-btn';
            zOut.innerHTML = `${BoardIcons.remove}<span>Allarga</span>`;
            zOut.title = 'Finestra due volte più ampia';
            zOut.addEventListener('click', () => zoom(2));
            const zIn = document.createElement('button');
            zIn.type = 'button';
            zIn.className = 'board-action-btn';
            zIn.innerHTML = `${BoardIcons.add}<span>Stringi</span>`;
            zIn.title = 'Finestra due volte più stretta';
            zIn.addEventListener('click', () => zoom(0.5));
            zoomRow.append(zOut, zIn);
            rangesEl.appendChild(zoomRow);
        };

        // `seed`: a template's expression and sliders, opened for editing before it is added.
        const openEditor = (index, seed = null) => {
            st.editIndex = index;
            st.seedParams = seed ? seed.params : null;
            const f = index === null ? seed : st.fns[index];
            st.draft = f ? f.fn : '';
            fnEditor.setValue(f ? f.fn : '');
            keypadWrap.hidden = false;
            render();
            fnEditor.focus();
        };

        const closeEditor = () => {
            st.editIndex = null;
            st.seedParams = null;
            st.draft = '';
            keypadWrap.hidden = true;
            render();
        };

        const renderFns = () => {
            fnsEl.innerHTML = '';
            if (st.fns.length === 0 && keypadWrap.hidden) {
                const empty = document.createElement('div');
                empty.className = 'board-fn-empty';
                empty.textContent = 'Solo assi: scegli una funzione qui sotto o scrivila.';
                fnsEl.appendChild(empty);
            }
            st.fns.forEach((f, idx) => {
                const row = document.createElement('div');
                row.className = `board-fn-row${st.editIndex === idx && !keypadWrap.hidden ? ' is-editing' : ''}`;
                const sw = document.createElement('span');
                sw.className = 'board-fn-swatch';
                sw.style.background = PLOT_SWATCHES[idx % PLOT_SWATCHES.length];
                const txt = document.createElement('button');
                txt.type = 'button';
                txt.className = 'board-fn-expr';
                txt.title = 'Tocca per modificare';
                const main = document.createElement('span');
                main.textContent = `y = ${prettyExpr(f.fn)}`;
                txt.appendChild(main);
                const params = Object.keys(f.params || {});
                if (params.length) {
                    const hint = document.createElement('span');
                    hint.className = 'board-fn-params';
                    hint.textContent = `cursori: ${params.map((k) => f.params[k].label || k).join(', ')}`;
                    txt.appendChild(hint);
                }
                txt.addEventListener('click', () => openEditor(idx));
                const rm = document.createElement('button');
                rm.type = 'button';
                rm.className = 'board-fn-remove';
                rm.innerHTML = BoardIcons.close;
                rm.setAttribute('aria-label', 'Rimuovi funzione');
                rm.addEventListener('click', () => {
                    st.fns.splice(idx, 1);
                    if (st.editIndex === idx) closeEditor();
                    else if (st.editIndex !== null && st.editIndex > idx) st.editIndex--;
                    render();
                });
                row.append(sw, txt, rm);
                fnsEl.appendChild(row);
            });
        };

        const usedParamNames = (exceptIndex = null) => {
            const names = new Set(Object.keys(st.base.params || {}));
            st.fns.forEach((f, i) => {
                if (i !== exceptIndex) for (const k of Object.keys(f.params || {})) names.add(k);
            });
            return names;
        };

        // One tap adds a template as it is; tapping it in the list opens it in the editor.
        const addTemplate = (tpl) => {
            if (st.fns.length >= MAX_PLOT_FNS) return;
            const { fn, params } = instantiateTemplate(tpl, usedParamNames());
            st.fns.push({ fn, params });
            render();
        };

        for (const tpl of PLOT_TEMPLATES) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'board-fn-template';
            b.innerHTML = `<strong>${tpl.label}</strong><span>${tpl.display}</span>`;
            b.addEventListener('click', () => addTemplate(tpl));
            templatesEl.appendChild(b);
        }
        const customBtn = document.createElement('button');
        customBtn.type = 'button';
        customBtn.className = 'board-fn-template is-custom';
        customBtn.innerHTML = `<strong>Scrivi…</strong><span>x, a, b, sin…</span>`;
        customBtn.addEventListener('click', () => {
            if (!keypadWrap.hidden && st.editIndex === null) closeEditor();
            else openEditor(null);
        });
        templatesEl.appendChild(customBtn);

        /** Params for an expression typed in the editor: known ones kept, new letters become sliders. */
        const paramsFor = (expr, ownIndex) => {
            const own = ownIndex === null ? (st.seedParams || {}) : (st.fns[ownIndex].params || {});
            const known = { ...(st.base.params || {}) };
            st.fns.forEach((f, i) => { if (i !== ownIndex) Object.assign(known, f.params || {}); });
            const out = {};
            for (const name of detectParams(expr)) {
                if (known[name]) continue;              // shared with another function: keep it there
                out[name] = own[name] || defaultParam(name);
            }
            return out;
        };

        const fnEditor = buildFunctionEditor({
            onChange: (expr) => {
                st.draft = expr;
                const names = detectParams(expr);
                fnEditor.setHint(names.length
                    ? `Cursori: ${names.join(', ')}`
                    : 'Usa lettere come a, b, k per avere dei cursori.');
                schedulePreview();
            },
            onSubmit: (expr) => {
                const clean = String(expr || '').trim();
                if (!clean) return;
                const entry = { fn: clean, params: paramsFor(clean, st.editIndex) };
                if (st.editIndex === null) {
                    if (st.fns.length >= MAX_PLOT_FNS) return;
                    st.fns.push(entry);
                } else {
                    st.fns[st.editIndex] = entry;
                }
                closeEditor();
            },
            onCancel: () => closeEditor(),
        });
        keypadWrap.appendChild(fnEditor.el);

        const buildConfig = ({ withDraft = false } = {}) => {
            const v = st.view;
            const fns = st.fns.map((f) => ({ ...f }));
            if (withDraft && !keypadWrap.hidden && st.draft.trim()) {
                const draft = { fn: st.draft.trim(), params: paramsFor(st.draft.trim(), st.editIndex) };
                if (st.editIndex === null) fns.push(draft);
                else fns[st.editIndex] = draft;
            }
            const params = {};
            const keepParam = (k) => fns.some((f) => exprUsesName(f.fn, k))
                || st.extraData.some((d) => JSON.stringify(d).includes(k));
            for (const [k, p] of Object.entries(st.base.params || {})) if (keepParam(k)) params[k] = p;
            for (const f of fns) Object.assign(params, f.params || {});
            const cfg = {
                grid: true,
                axisArrows: true,
                ...st.base,
                xlim: [v.xMin, v.xMax],
                ylim: [v.yMin, v.yMax],
                data: [
                    ...fns.map((f, idx) => ({ fn: f.fn, color: PLOT_PALETTE_IDS[idx % PLOT_PALETTE_IDS.length] })),
                    ...st.extraData,
                ],
            };
            if (Object.keys(params).length) cfg.params = params;
            else delete cfg.params;
            delete cfg.border;
            return cfg;
        };

        let previewTimer = null;
        const schedulePreview = () => {
            clearTimeout(previewTimer);
            previewTimer = setTimeout(() => {
                if (el.hidden) return;
                let cfg;
                if (st.showJson) {
                    try { cfg = JSON.parse(jsonArea.value); } catch (_) { return; }
                } else {
                    cfg = buildConfig({ withDraft: true });
                }
                this._renderPreview('plot', previewBox, 'plot', cfg);
            }, 220);
        };
        jsonArea.addEventListener('input', schedulePreview);

        const render = () => {
            errBox.hidden = true;
            const editing = Boolean(st.editId);
            titleEl.textContent = editing ? 'Modifica grafico' : 'Nuovo grafico';
            submitBtn.querySelector('span').textContent = editing ? 'Aggiorna' : 'Inserisci';
            mainPane.hidden = st.showJson;
            jsonPane.hidden = !st.showJson;
            jsonToggle.classList.toggle('active', st.showJson);
            schedulePreview();
            if (st.showJson) return;
            for (const b of windowsRow.children) {
                const win = PLOT_WINDOWS.find((w) => w.label === b.textContent);
                b.classList.toggle('active', Boolean(win) && sameView(win.view, st.view));
            }
            renderRanges();
            renderFns();
            const full = st.fns.length >= MAX_PLOT_FNS;
            for (const b of templatesEl.children) b.disabled = full && !(b.classList.contains('is-custom') && st.editIndex !== null);
            customBtn.classList.toggle('active', !keypadWrap.hidden && st.editIndex === null);
        };

        jsonToggle.addEventListener('click', () => {
            if (!st.showJson) {
                jsonArea.value = JSON.stringify(buildConfig(), null, 2);
                st.showJson = true;
                render();
                return;
            }
            try {
                loadConfig(JSON.parse(jsonArea.value), st.editId);
            } catch (err) {
                errBox.hidden = false;
                errBox.textContent = `JSON non valido: ${err.message}`;
            }
        });

        const loadConfig = (cfg, editId) => {
            st = fresh();
            st.editId = editId || null;
            keypadWrap.hidden = true;
            const data = cfg && typeof cfg === 'object' ? cloneJson(cfg) : {};
            const xl = Array.isArray(data.xlim) ? data.xlim : [-5, 5];
            const yl = Array.isArray(data.ylim) ? data.ylim : [-4, 4];
            st.view = { xMin: Number(xl[0]), xMax: Number(xl[1]), yMin: Number(yl[0]), yMax: Number(yl[1]) };
            const params = data.params || {};
            const claimed = new Set();
            for (const d of Array.isArray(data.data) ? data.data : []) {
                if (d && typeof d.fn === 'string' && Object.keys(d).every((k) => k === 'fn' || k === 'color')) {
                    const own = {};
                    for (const [k, p] of Object.entries(params)) {
                        if (!claimed.has(k) && exprUsesName(d.fn, k)) { own[k] = p; claimed.add(k); }
                    }
                    st.fns.push({ fn: d.fn, params: own });
                } else {
                    st.extraData.push(d);
                }
            }
            const base = { ...data };
            delete base.xlim; delete base.ylim; delete base.data;
            base.params = Object.fromEntries(Object.entries(params).filter(([k]) => !claimed.has(k)));
            st.base = base;
            render();
        };

        submitBtn.addEventListener('click', () => {
            errBox.hidden = true;
            let cfg;
            if (st.showJson) {
                try {
                    cfg = JSON.parse(jsonArea.value);
                    if (!cfg || typeof cfg !== 'object') throw new Error('Oggetto JSON richiesto');
                } catch (err) {
                    errBox.hidden = false;
                    errBox.textContent = `JSON non valido: ${err.message}`;
                    return;
                }
            } else {
                // A function still open in the editor is part of what the teacher sees: keep it.
                cfg = buildConfig({ withDraft: true });
            }
            if (st.editId) {
                if (this.onUpdateWidget) this.onUpdateWidget(st.editId, cfg);
            } else if (this.onInsertPlot) {
                this.onInsertPlot(cfg);
            }
            this._closeMenu();
        });
        el.querySelector('[data-plot-cancel]').addEventListener('click', () => this._closeMenu());

        this._plotEditor = {
            reset: () => {
                loadConfig(createQuickPlotConfig({ xMin: -5, xMax: 5, yMin: -4, yMax: 4 }), null);
                fnEditor.setValue('');
            },
            load: (widget) => {
                loadConfig(widget.data, widget.id);
                fnEditor.setValue('');
            },
        };
        loadConfig(createQuickPlotConfig({ xMin: -5, xMax: 5, yMin: -4, yMax: 4 }), null);
        return el;
    }

    // =========================================================================
    // 2. Diagrams sheet: topic list on top, live preview below, one Inserisci.
    //    Quantities are sliders inside the widget; JSON stays as an escape hatch.
    // =========================================================================

    _buildDiagramsPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-sheet board-editor-sheet board-diagrams-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span data-diag-title>Diagrammi</span>
                <div class="board-seg-row board-seg-compact" data-diag-kinds>
                    <button type="button" class="board-seg-btn" data-kind="physics">Fisica</button>
                    <button type="button" class="board-seg-btn" data-kind="sets">Insiemi</button>
                </div>
            </div>
            <div class="board-seg-row board-diag-sections" data-diag-sections></div>
            <div class="board-preset-list" data-diag-items></div>
            <div class="board-diag-json" data-diag-json hidden>
                <textarea class="board-json-textarea" rows="10" spellcheck="false"></textarea>
            </div>
            <div class="board-preview board-preview-diagram" data-diag-preview></div>
            <div class="board-popover-error" hidden></div>
            <div class="board-popover-footer">
                <button type="button" class="board-action-btn" data-diag-json-toggle title="Configurazione JSON (avanzata)">
                    ${BoardIcons.code}<span>JSON</span>
                </button>
                <span class="board-footer-spacer"></span>
                <button type="button" class="board-action-btn" data-diag-cancel>Annulla</button>
                <button type="button" class="board-action-btn board-action-primary" data-diag-insert>
                    ${BoardIcons.add}<span>Inserisci</span>
                </button>
            </div>
        `;

        const titleEl = el.querySelector('[data-diag-title]');
        const kindsRow = el.querySelector('[data-diag-kinds]');
        const sectionsRow = el.querySelector('[data-diag-sections]');
        const itemsEl = el.querySelector('[data-diag-items]');
        const jsonPane = el.querySelector('[data-diag-json]');
        const jsonArea = jsonPane.querySelector('textarea');
        const jsonToggle = el.querySelector('[data-diag-json-toggle]');
        const insertBtn = el.querySelector('[data-diag-insert]');
        const previewBox = el.querySelector('[data-diag-preview]');
        const errBox = el.querySelector('.board-popover-error');

        const catalog = { physics: [], sets: [] };
        let ready = false;
        const st = { kind: 'physics', section: {}, selected: {}, editId: null, showJson: false };
        // The presets arrive after start-up; opened before that, the editor waits for them
        const whenReady = () => loadPresets().then((c) => {
            catalog.physics = c.physics;
            catalog.sets = c.sets;
            ready = true;
            if (!el.hidden) render();
        }, () => {
            if (!el.hidden) { itemsEl.textContent = 'Impossibile caricare i diagrammi: controlla la connessione.'; }
        });

        const currentSection = () => {
            const sections = catalog[st.kind];
            return sections.find((s) => s.id === st.section[st.kind]) || sections[0];
        };
        const currentItem = () => {
            const sec = currentSection();
            return sec.items.find((i) => i.id === st.selected[st.kind]) || sec.items[0];
        };

        let previewTimer = null;
        const schedulePreview = () => {
            clearTimeout(previewTimer);
            previewTimer = setTimeout(() => {
                if (el.hidden) return;
                let cfg;
                if (st.showJson) {
                    try { cfg = JSON.parse(jsonArea.value); } catch (_) { return; }
                } else {
                    if (!ready) return;
                    cfg = currentItem().data;
                }
                this._renderPreview('diagram', previewBox, st.kind, cfg);
            }, 120);
        };
        jsonArea.addEventListener('input', schedulePreview);

        const render = () => {
            errBox.hidden = true;
            titleEl.textContent = st.editId ? 'Cambia diagramma' : 'Diagrammi';
            kindsRow.hidden = Boolean(st.editId);
            for (const b of kindsRow.querySelectorAll('[data-kind]')) {
                b.classList.toggle('active', b.dataset.kind === st.kind);
            }
            jsonPane.hidden = !st.showJson;
            jsonToggle.classList.toggle('active', st.showJson);
            sectionsRow.hidden = st.showJson;
            itemsEl.hidden = st.showJson;
            insertBtn.querySelector('span').textContent = st.editId ? 'Sostituisci' : 'Inserisci';

            insertBtn.disabled = !ready && !st.showJson;
            if (!st.showJson && !ready) {
                sectionsRow.innerHTML = '';
                itemsEl.textContent = 'Caricamento…';
                whenReady();
                return;
            }
            if (!st.showJson) {
                const sec = currentSection();
                const item = currentItem();
                sectionsRow.innerHTML = '';
                for (const s of catalog[st.kind]) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = `board-seg-btn${s.id === sec.id ? ' active' : ''}`;
                    b.textContent = s.label;
                    b.addEventListener('click', () => {
                        st.section[st.kind] = s.id;
                        render();
                    });
                    sectionsRow.appendChild(b);
                }
                this._revealActiveTab(sectionsRow);
                itemsEl.innerHTML = '';
                for (const it of sec.items) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = `board-preset-row${it === item ? ' active' : ''}`;
                    const name = document.createElement('span');
                    name.className = 'board-preset-name';
                    name.textContent = it.label;
                    const sliders = document.createElement('span');
                    sliders.className = 'board-preset-sliders';
                    // Physics quantities (m, α, v₀) say something; sets parameters (x, p) do not.
                    sliders.textContent = st.kind === 'physics' ? presetSliderLabels(it.data).join(' · ') : '';
                    b.append(name, sliders);
                    b.addEventListener('click', () => {
                        st.selected[st.kind] = it.id;
                        render();
                    });
                    b.addEventListener('dblclick', () => insertBtn.click());
                    itemsEl.appendChild(b);
                }
            }
            schedulePreview();
        };

        for (const b of kindsRow.querySelectorAll('[data-kind]')) {
            b.addEventListener('click', () => {
                st.kind = b.dataset.kind;
                st.showJson = false;
                render();
            });
        }

        jsonToggle.addEventListener('click', () => {
            st.showJson = !st.showJson;
            if (st.showJson) jsonArea.value = ready ? JSON.stringify(currentItem().data, null, 2) : '';
            render();
        });

        insertBtn.addEventListener('click', () => {
            let data;
            if (st.showJson) {
                try {
                    data = JSON.parse(jsonArea.value);
                    if (!data || typeof data !== 'object') throw new Error('Oggetto JSON richiesto');
                } catch (err) {
                    errBox.hidden = false;
                    errBox.textContent = `JSON non valido: ${err.message}`;
                    return;
                }
            } else {
                if (!ready) return;
                data = cloneJson(currentItem().data);
            }
            if (st.editId) {
                if (this.onUpdateWidget) this.onUpdateWidget(st.editId, data);
            } else if (this.onInsertDiagram) {
                this.onInsertDiagram(st.kind, data);
            }
            this._closeMenu();
        });
        el.querySelector('[data-diag-cancel]').addEventListener('click', () => this._closeMenu());

        this._diagramEditor = {
            reset: () => {
                st.editId = null;
                st.showJson = false;
                render();
            },
            load: (widget) => {
                st.editId = widget.id;
                st.kind = widget.kind === 'sets' ? 'sets' : 'physics';
                st.showJson = false;
                render();
            },
        };
        return el;
    }

    /**
     * Open the editor for an existing widget ("Modifica" in its toolbar).
     * Returns the popover name, so the caller can anchor it.
     */
    openEditor(widget) {
        if (!widget) return null;
        if (widget.kind === 'plot') {
            this.show('plot');
            this._plotEditor.load(widget);
            return 'plot';
        }
        if (widget.kind === 'physics' || widget.kind === 'sets') {
            this.show('diagrams');
            this._diagramEditor.load(widget);
            return 'diagrams';
        }
        return null;
    }

    // =========================================================================
    // 3. Exercise sheet: tap-only path subject → topic → note → section → number,
    //    live preview with ◀ ▶ to step through, remembers where you were.
    // =========================================================================

    _buildExercisesPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-sheet board-editor-sheet board-exercises-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Esercizi</span>
                <div class="board-seg-row board-seg-compact" data-ex-subjects></div>
            </div>
            <div class="board-sheet-scroll">
                <button type="button" class="board-ex-crumb" data-ex-crumb hidden></button>
                <div class="board-chip-section board-ex-topics-wrap">
                    <div class="board-micro-label">Argomento</div>
                    <div class="board-ex-topic-grid" data-ex-topics></div>
                </div>
                <div class="board-chip-section board-ex-notes-wrap" data-ex-notes-wrap hidden>
                    <div class="board-micro-label">Nota</div>
                    <div class="board-preset-list board-ex-note-list" data-ex-notes></div>
                </div>
                <div class="board-chip-section" data-ex-sections-wrap hidden>
                    <div class="board-micro-label">Sezione</div>
                    <div class="board-seg-row board-ex-sections" data-ex-sections></div>
                </div>
                <div class="board-chip-section" data-ex-items-wrap hidden>
                    <div class="board-micro-label">Esercizio</div>
                    <div class="board-ex-number-grid" data-ex-items></div>
                    <div class="board-ex-sub" data-ex-subs-wrap hidden>
                        <div class="board-micro-label">Parte</div>
                        <div class="board-ex-number-grid is-sub" data-ex-subs></div>
                    </div>
                </div>
                <div class="board-ex-status" data-ex-status></div>
            </div>
            <div class="board-preview board-ex-preview" data-ex-preview>
                <div class="board-ex-preview-head">
                    <button type="button" class="board-stepper-btn" data-ex-prev aria-label="Esercizio precedente">${BoardIcons.chevronLeft}</button>
                    <div class="board-ex-preview-meta">Scegli un argomento</div>
                    <button type="button" class="board-stepper-btn" data-ex-next aria-label="Esercizio successivo">${BoardIcons.chevronRight}</button>
                </div>
                <div class="board-ex-preview-body"></div>
            </div>
            <div class="board-popover-footer">
                <label class="board-inline-check">
                    <input type="checkbox" data-ex-hide-sol checked />
                    <span>Nascondi soluzione</span>
                </label>
                <span class="board-footer-spacer"></span>
                <button type="button" class="board-action-btn" data-ex-cancel>Annulla</button>
                <button type="button" class="board-action-btn board-action-primary" data-ex-insert disabled>
                    ${BoardIcons.add}<span>Inserisci</span>
                </button>
            </div>
        `;

        const q = (sel) => el.querySelector(sel);
        const subjectsRow = q('[data-ex-subjects]');
        const topicsEl = q('[data-ex-topics]');
        const notesWrap = q('[data-ex-notes-wrap]');
        const notesEl = q('[data-ex-notes]');
        const sectionsWrap = q('[data-ex-sections-wrap]');
        const sectionsEl = q('[data-ex-sections]');
        const itemsWrap = q('[data-ex-items-wrap]');
        const itemsEl = q('[data-ex-items]');
        const subsWrap = q('[data-ex-subs-wrap]');
        const subsEl = q('[data-ex-subs]');
        const statusEl = q('[data-ex-status]');
        const crumbEl = q('[data-ex-crumb]');
        const previewEl = q('[data-ex-preview]');
        const metaEl = q('.board-ex-preview-meta');
        const bodyEl = q('.board-ex-preview-body');
        const prevBtn = q('[data-ex-prev]');
        const nextBtn = q('[data-ex-next]');
        const hideSolCheck = q('[data-ex-hide-sol]');
        const insertBtn = q('[data-ex-insert]');

        const POS_KEY = 'matephis_board_exercise_pos';
        const st = this._exState = {
            catalog: null,
            subject: null,
            topic: null,
            note: null,        // { slug, title, url }
            parsed: null,      // { noteTitle, items }
            section: null,
            item: null,        // selected exercise (top-level or a part)
            loadSeq: 0,
            previewInstances: [],
        };

        const savePos = () => {
            try {
                localStorage.setItem(POS_KEY, JSON.stringify({
                    subject: st.subject,
                    topic: st.topic,
                    note: st.note ? st.note.slug : null,
                    section: st.section,
                    item: st.item ? [st.item.itemNumber, st.item.subItemNumber] : null,
                }));
            } catch (_) { /* private mode: no memory */ }
        };
        const loadPos = () => {
            try { return JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (_) { return null; }
        };

        const subjectObj = () => (st.catalog || []).find((s) => s.subject === st.subject) || null;
        const topicObj = () => {
            const s = subjectObj();
            return s ? s.topics.find((t) => t.label === st.topic) || null : null;
        };
        const sectionsOf = () => {
            const out = [];
            for (const it of (st.parsed && st.parsed.items) || []) if (!out.includes(it.section)) out.push(it.section);
            return out;
        };
        const topItems = () => ((st.parsed && st.parsed.items) || [])
            .filter((it) => it.section === st.section && it.subItemNumber === null);
        const partsOf = (num) => ((st.parsed && st.parsed.items) || [])
            .filter((it) => it.section === st.section && it.itemNumber === num && it.subItemNumber !== null);
        /** Every selectable exercise in order (parts after their parent), for ◀ ▶. */
        const sequence = () => {
            const seq = [];
            for (const it of topItems()) {
                seq.push(it);
                seq.push(...partsOf(it.itemNumber));
            }
            return seq;
        };

        const button = (cls, text, active, onClick, title = '') => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `${cls}${active ? ' active' : ''}`;
            b.textContent = text;
            if (title) b.title = title;
            b.addEventListener('click', onClick);
            return b;
        };

        // Narrow screens: once a note is open, topic and note fold into one line
        // (tap it to choose again), so the preview gets the room.
        crumbEl.addEventListener('click', () => {
            st.unfolded = true;
            render();
        });

        const render = () => {
            el.classList.toggle('is-folded', Boolean(st.note) && !st.unfolded);
            crumbEl.hidden = !st.note;
            crumbEl.textContent = st.note ? `${st.subject} › ${st.topic || ''} › ${shortNoteTitle(st.note.title)}` : '';
            // Subjects
            subjectsRow.innerHTML = '';
            for (const s of st.catalog || []) {
                subjectsRow.appendChild(button('board-seg-btn', s.subject, s.subject === st.subject, () => {
                    if (st.subject === s.subject) return;
                    st.subject = s.subject;
                    st.topic = null;
                    selectNote(null);
                }));
            }
            // Topics
            topicsEl.innerHTML = '';
            const subj = subjectObj();
            for (const t of subj ? subj.topics : []) {
                topicsEl.appendChild(button('board-ex-topic', t.label, t.label === st.topic, () => {
                    st.topic = t.label;
                    selectNote(t.notes.length === 1 ? t.notes[0] : (t.notes.find((n) => st.note && n.slug === st.note.slug) || null));
                }));
            }
            // Notes (only when a topic has several)
            const topic = topicObj();
            notesWrap.hidden = !topic || topic.notes.length < 2;
            notesEl.innerHTML = '';
            if (topic && topic.notes.length > 1) {
                for (const n of topic.notes) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = `board-preset-row${st.note && st.note.slug === n.slug ? ' active' : ''}`;
                    const name = document.createElement('span');
                    name.className = 'board-preset-name';
                    name.textContent = shortNoteTitle(n.title);
                    b.appendChild(name);
                    b.addEventListener('click', () => selectNote(n));
                    notesEl.appendChild(b);
                }
            }
            // Sections
            const sections = sectionsOf();
            sectionsWrap.hidden = sections.length < 2;
            sectionsEl.innerHTML = '';
            for (const sec of sections) {
                sectionsEl.appendChild(button('board-seg-btn', sec, sec === st.section, () => {
                    st.section = sec;
                    const first = topItems()[0] || null;
                    selectItem(first);
                }));
            }
            this._revealActiveTab(sectionsEl);
            // Numbers
            const tops = topItems();
            itemsWrap.hidden = tops.length === 0;
            itemsEl.innerHTML = '';
            for (const it of tops) {
                const isActive = st.item && st.item.itemNumber === it.itemNumber;
                const b = button('board-ex-num', String(it.itemNumber), isActive, () => selectItem(it),
                    [it.subsection, it.difficulty].filter(Boolean).join(' · '));
                if (it.difficulty) {
                    const d = document.createElement('span');
                    d.className = 'board-ex-diff';
                    d.textContent = it.difficulty;
                    b.appendChild(d);
                }
                if (partsOf(it.itemNumber).length) b.classList.add('has-parts');
                itemsEl.appendChild(b);
            }
            // Parts of the selected exercise
            const parts = st.item ? partsOf(st.item.itemNumber) : [];
            subsWrap.hidden = parts.length === 0;
            subsEl.innerHTML = '';
            if (parts.length) {
                const parent = tops.find((t) => t.itemNumber === st.item.itemNumber);
                subsEl.appendChild(button('board-ex-num is-all', 'Tutto', st.item === parent, () => selectItem(parent)));
                for (const p of parts) {
                    subsEl.appendChild(button('board-ex-num', `${p.itemNumber}.${p.subItemNumber}`, st.item === p, () => selectItem(p)));
                }
            }
            // Step buttons
            const seq = sequence();
            const idx = st.item ? seq.indexOf(st.item) : -1;
            prevBtn.disabled = idx <= 0;
            nextBtn.disabled = idx === -1 || idx >= seq.length - 1;
            insertBtn.disabled = !st.item;
        };

        const showPreview = async () => {
            this._clearPreviewInstances();
            const it = st.item;
            if (!it) {
                metaEl.textContent = st.note ? '' : 'Scegli un argomento';
                bodyEl.innerHTML = '';
                return;
            }
            metaEl.textContent = [shortNoteTitle(st.parsed.noteTitle), it.section, it.subsection, it.label].filter(Boolean).join(' · ');
            bodyEl.replaceChildren();
            const safe = sanitizeHtmlToFragment(it.html || '');
            if (safe) bodyEl.appendChild(safe);
            previewEl.classList.toggle('is-solution-hidden', hideSolCheck.checked);
            bodyEl.scrollTop = 0;
            previewEl.scrollTop = 0;
            if (this.engineLoader) {
                const shown = it;
                try {
                    const insts = await hydrateEmbeddedEngines(bodyEl, this.engineLoader);
                    if (st.item !== shown) { insts.forEach((i) => i && i.destroy && i.destroy()); return; }
                    st.previewInstances.push(...insts);
                } catch (_) { /* ignore */ }
                try { await this.engineLoader.typeset([bodyEl]); } catch (_) { /* ignore */ }
            }
        };

        const selectItem = (it) => {
            st.item = it || null;
            savePos();
            render();
            showPreview();
        };

        const selectNote = async (note, restore = null) => {
            st.note = note;
            st.unfolded = false;
            st.parsed = null;
            st.section = null;
            st.item = null;
            statusEl.textContent = '';
            render();
            showPreview();
            if (!note || !this.exercisePicker) { savePos(); return; }
            const seq = ++st.loadSeq;
            statusEl.textContent = 'Caricamento…';
            try {
                const parsed = await this.exercisePicker.loadNote(note);
                if (seq !== st.loadSeq) return;
                st.parsed = parsed;
                statusEl.textContent = parsed.items.length ? '' : 'Nessun esercizio numerato in questa nota.';
                const sections = sectionsOf();
                st.section = restore && sections.includes(restore.section) ? restore.section : (sections[0] || null);
                let item = topItems()[0] || null;
                if (restore && Array.isArray(restore.item)) {
                    const [n, sub] = restore.item;
                    item = sequence().find((x) => x.itemNumber === n && x.subItemNumber === sub) || item;
                }
                selectItem(item);
            } catch (err) {
                if (seq !== st.loadSeq) return;
                statusEl.textContent = String(err && err.message ? err.message : err);
                render();
            }
        };

        const step = (dir) => {
            const seq = sequence();
            const idx = seq.indexOf(st.item);
            const next = seq[idx + dir];
            if (next) selectItem(next);
        };
        prevBtn.addEventListener('click', () => step(-1));
        nextBtn.addEventListener('click', () => step(1));

        hideSolCheck.addEventListener('change', () => {
            previewEl.classList.toggle('is-solution-hidden', hideSolCheck.checked);
        });
        previewEl.classList.toggle('is-solution-hidden', hideSolCheck.checked);

        insertBtn.addEventListener('click', () => {
            const it = st.item;
            if (!it || !st.note || !this.onInsertExercise) return;
            this.onInsertExercise({
                noteTitle: st.parsed ? st.parsed.noteTitle : st.note.title,
                noteUrl: st.note.url,
                section: it.section,
                subsection: it.subsection || '',
                label: it.label,
                difficulty: it.difficulty || '',
                hasSolution: Boolean(it.hasSolution),
                hideSolution: Boolean(hideSolCheck.checked),
                html: it.html,
            });
            // Next time the panel opens on the following exercise: lessons go in order.
            const seq = sequence();
            const after = seq[seq.indexOf(it) + 1];
            if (after) { st.item = after; savePos(); render(); }
            this._closeMenu();
        });
        q('[data-ex-cancel]').addEventListener('click', () => this._closeMenu());

        this._exerciseSheet = {
            open: async () => {
                if (!this.exercisePicker) return;
                if (!st.catalog) {
                    statusEl.textContent = 'Caricamento…';
                    st.catalog = await this.exercisePicker.loadCatalog();
                    statusEl.textContent = st.catalog.length ? '' : 'Nessuna nota di esercizi trovata.';
                    // Back where the panel was left (or the first subject).
                    const pos = loadPos();
                    const subj = st.catalog.find((s) => pos && s.subject === pos.subject) || st.catalog[0];
                    if (!subj) { render(); return; }
                    st.subject = subj.subject;
                    const topic = subj.topics.find((t) => pos && t.label === pos.topic) || null;
                    st.topic = topic ? topic.label : null;
                    const note = topic ? (topic.notes.find((n) => n.slug === pos.note) || (topic.notes.length === 1 ? topic.notes[0] : null)) : null;
                    if (note) await selectNote(note, pos);
                    else render();
                    return;
                }
                render();
                showPreview();
            },
        };
        return el;
    }

    _clearPreviewInstances() {
        for (const inst of this._exState.previewInstances || []) {
            if (inst && typeof inst.destroy === 'function') {
                try { inst.destroy(); } catch (_) { /* ignore */ }
            }
        }
        this._exState.previewInstances = [];
    }

    // =========================================================================
    // 4. Cloud Session Popover (Phase 4 Stub — kept intact)
    // =========================================================================

    _buildCloudPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-cloud-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Sessione cloud</span>
                <span class="board-cloud-status">Locale</span>
            </div>
            <div class="board-qr-box is-stub">
                <div class="board-qr-icon">${BoardIcons.qr}</div>
                <div class="board-qr-meta">
                    <strong>Associa da smartphone</strong>
                    <span>Scansiona il QR per autorizzare il salvataggio automatico su R2 (2h).</span>
                    <span class="board-qr-code">Codice: ----</span>
                </div>
            </div>
            <div class="board-options-actions">
                <button type="button" class="board-action-btn board-action-primary is-stub">
                    ${BoardIcons.cloud}<span>Avvia sessione</span>
                </button>
                <button type="button" class="board-action-btn is-stub">
                    ${BoardIcons.upload}<span>Carica passata</span>
                </button>
                <button type="button" class="board-action-btn is-stub">
                    ${BoardIcons.jump}<span>Archivio PC</span>
                </button>
                <button type="button" class="board-action-btn is-stub">
                    ${BoardIcons.qr}<span>Condividi</span>
                </button>
                <button type="button" class="board-action-btn is-danger is-stub board-action-full">
                    ${BoardIcons.close}<span>Termina sessione</span>
                </button>
            </div>
        `;
        return el;
    }
}
