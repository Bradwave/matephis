/**
 * Popovers for Matephis Board features:
 * - Quick Cartesian Axes / Matephis Plot
 * - Matephis Diagrams (physics / sets / circuit / deferred LaTeX text)
 * - Exercise Picker (search + topic/section browse + live MathJax preview)
 * - Cloud Session & QR Sync (Phase 4 stub)
 */

import { BoardIcons } from './icons.js';
import {
    DEFAULT_TOPICS,
    DEFAULT_SECTIONS,
    hydrateEmbeddedEngines,
} from './exercise-picker.js';
import {
    WIDGET_PRESETS,
    ENGINE_STARTER_CONFIGS,
    createQuickPlotConfig,
} from './widgets.js';

export class FutureMenus {
    constructor(hostEl, {
        engineLoader = null,
        exercisePicker = null,
        onInsertPlot = null,
        onInsertDiagram = null,
        onInsertExercise = null,
        onClose = null,
    } = {}) {
        this.hostEl = hostEl;
        this.engineLoader = engineLoader;
        this.exercisePicker = exercisePicker;
        this.onInsertPlot = onInsertPlot;
        this.onInsertDiagram = onInsertDiagram;
        this.onInsertExercise = onInsertExercise;
        this.onClose = onClose;

        this.activePopover = null; // null | 'plot' | 'diagrams' | 'exercises' | 'cloud'
        this._exState = {
            topic: null,
            section: null,
            noteUrl: null,
            currentResult: null,
            selectedItem: null,
            previewInstances: [],
            searchSeq: 0,
            topicsEnriched: false,
        };

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
        this.activePopover = this.popovers[name] ? name : null;
        for (const [key, el] of Object.entries(this.popovers)) {
            el.hidden = key !== this.activePopover;
        }
        if (this.activePopover === 'exercises') {
            this._openExercisesPopover();
        }
    }

    hideAll() {
        this.activePopover = null;
        for (const el of Object.values(this.popovers)) {
            el.hidden = true;
        }
    }

    _closeMenu() {
        this.hideAll();
        if (this.onClose) this.onClose();
    }

    // =========================================================================
    // 1. Plot / Cartesian Axes Popover
    // =========================================================================

    _buildPlotPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-plot-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Assi cartesiani e grafici</span>
            </div>
            <div class="board-tab-row">
                <button type="button" class="board-tab-btn active" data-plot-tab="quick">Assi rapidi</button>
                <button type="button" class="board-tab-btn" data-plot-tab="json">Funzioni / JSON</button>
            </div>
            <div class="board-plot-quick-pane">
                <div class="board-limits-grid">
                    <label class="board-field">
                        <span>x min</span>
                        <input type="text" data-plot-field="xMin" value="-5" />
                    </label>
                    <label class="board-field">
                        <span>x max</span>
                        <input type="text" data-plot-field="xMax" value="5" />
                    </label>
                    <label class="board-field">
                        <span>y min</span>
                        <input type="text" data-plot-field="yMin" value="-4" />
                    </label>
                    <label class="board-field">
                        <span>y max</span>
                        <input type="text" data-plot-field="yMax" value="4" />
                    </label>
                </div>
                <label class="board-field board-field-full">
                    <span>Funzione (opzionale)</span>
                    <input type="text" data-plot-field="fn" placeholder="es. sin(x), x^2 - 2x" />
                </label>
            </div>
            <div class="board-plot-json-pane" hidden>
                <label class="board-field board-field-full">
                    <span>Configurazione MatephisPlot (JSON)</span>
                    <textarea class="board-json-textarea" rows="7" spellcheck="false"></textarea>
                </label>
            </div>
            <div class="board-popover-error" hidden></div>
            <div class="board-popover-footer">
                <button type="button" class="board-action-btn board-action-primary" data-plot-submit>
                    ${BoardIcons.axes}<span>Inserisci assi</span>
                </button>
            </div>
        `;

        let activeTab = 'quick';
        const quickPane = el.querySelector('.board-plot-quick-pane');
        const jsonPane = el.querySelector('.board-plot-json-pane');
        const jsonArea = el.querySelector('.board-json-textarea');
        const errBox = el.querySelector('.board-popover-error');
        const xMinIn = el.querySelector('[data-plot-field="xMin"]');
        const xMaxIn = el.querySelector('[data-plot-field="xMax"]');
        const yMinIn = el.querySelector('[data-plot-field="yMin"]');
        const yMaxIn = el.querySelector('[data-plot-field="yMax"]');
        const fnIn = el.querySelector('[data-plot-field="fn"]');
        const submitBtn = el.querySelector('[data-plot-submit]');
        const tabBtns = Array.from(el.querySelectorAll('[data-plot-tab]'));

        const buildQuickFromInputs = () => createQuickPlotConfig({
            xMin: xMinIn.value,
            xMax: xMaxIn.value,
            yMin: yMinIn.value,
            yMax: yMaxIn.value,
            fnText: fnIn.value,
        });

        for (const btn of tabBtns) {
            btn.addEventListener('click', () => {
                const next = btn.dataset.plotTab;
                if (next === activeTab) return;
                errBox.hidden = true;
                activeTab = next;
                for (const b of tabBtns) b.classList.toggle('active', b.dataset.plotTab === activeTab);
                quickPane.hidden = activeTab !== 'quick';
                jsonPane.hidden = activeTab !== 'json';
                if (activeTab === 'json') {
                    jsonArea.value = JSON.stringify(buildQuickFromInputs(), null, 2);
                }
            });
        }

        const handleSubmit = () => {
            errBox.hidden = true;
            let cfg;
            if (activeTab === 'json') {
                try {
                    cfg = JSON.parse(jsonArea.value);
                    if (!cfg || typeof cfg !== 'object') throw new Error('Oggetto JSON richiesto');
                } catch (err) {
                    errBox.hidden = false;
                    errBox.textContent = `JSON non valido: ${err.message}`;
                    return;
                }
            } else {
                const x0 = Number(xMinIn.value);
                const x1 = Number(xMaxIn.value);
                const y0 = Number(yMinIn.value);
                const y1 = Number(yMaxIn.value);
                if (!Number.isFinite(x0) || !Number.isFinite(x1) || x0 >= x1 || !Number.isFinite(y0) || !Number.isFinite(y1) || y0 >= y1) {
                    errBox.hidden = false;
                    errBox.textContent = 'Intervalli non validi: controlla x min < x max e y min < y max.';
                    return;
                }
                cfg = buildQuickFromInputs();
            }
            if (this.onInsertPlot) this.onInsertPlot(cfg);
            this._closeMenu();
        };

        submitBtn.addEventListener('click', handleSubmit);
        for (const input of [xMinIn, xMaxIn, yMinIn, yMaxIn, fnIn]) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                }
            });
        }

        return el;
    }

    // =========================================================================
    // 2. Diagrams Popover (Physics, Sets, Circuit, Presets, deferred LaTeX)
    // =========================================================================

    _buildDiagramsPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-diagrams-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Blocchi Matephis</span>
            </div>
            <div class="board-engine-grid">
                <button type="button" class="board-engine-card" data-engine-card="physics">
                    <strong>Fisica</strong>
                    <span>matephis-physics</span>
                </button>
                <button type="button" class="board-engine-card" data-engine-card="sets">
                    <strong>Insiemi</strong>
                    <span>matephis-sets</span>
                </button>
                <button type="button" class="board-engine-card" data-engine-card="circuit">
                    <strong>Circuiti</strong>
                    <span>matephis-circuit</span>
                </button>
                <button type="button" class="board-engine-card is-stub" title="In arrivo">
                    <strong>Testo / LaTeX</strong>
                    <span>nota o formula</span>
                </button>
            </div>
            <div class="board-chip-section">
                <div class="board-micro-label">Preset rapidi</div>
                <div class="board-chip-row">
                    <button type="button" class="board-chip" data-preset="piano-inclinato">Piano inclinato</button>
                    <button type="button" class="board-chip" data-preset="forze">Forze</button>
                    <button type="button" class="board-chip" data-preset="circuito-rc">Circuito RC</button>
                    <button type="button" class="board-chip" data-preset="venn">Venn</button>
                </div>
            </div>
            <div class="board-diagram-editor" hidden>
                <label class="board-field board-field-full">
                    <span class="board-diagram-editor-label">Configurazione JSON</span>
                    <textarea class="board-json-textarea" rows="7" spellcheck="false"></textarea>
                </label>
                <div class="board-popover-error" hidden></div>
                <div class="board-popover-footer">
                    <button type="button" class="board-action-btn" data-diagram-cancel>Chiudi</button>
                    <button type="button" class="board-action-btn board-action-primary" data-diagram-insert>
                        ${BoardIcons.add}<span>Inserisci blocco</span>
                    </button>
                </div>
            </div>
        `;

        let selectedKind = null;
        const editorWrap = el.querySelector('.board-diagram-editor');
        const editorLabel = el.querySelector('.board-diagram-editor-label');
        const jsonArea = el.querySelector('.board-json-textarea');
        const errBox = el.querySelector('.board-popover-error');
        const cards = Array.from(el.querySelectorAll('[data-engine-card]'));

        for (const card of cards) {
            card.addEventListener('click', () => {
                const kind = card.dataset.engineCard;
                if (!kind) return;
                selectedKind = kind;
                for (const c of cards) c.classList.toggle('active', c.dataset.engineCard === kind);
                editorLabel.textContent = `Configurazione ${kind} (JSON)`;
                jsonArea.value = JSON.stringify(ENGINE_STARTER_CONFIGS[kind] || {}, null, 2);
                errBox.hidden = true;
                editorWrap.hidden = false;
            });
        }

        el.querySelector('[data-diagram-cancel]').addEventListener('click', () => {
            selectedKind = null;
            for (const c of cards) c.classList.remove('active');
            editorWrap.hidden = true;
        });

        el.querySelector('[data-diagram-insert]').addEventListener('click', () => {
            if (!selectedKind) return;
            errBox.hidden = true;
            try {
                const cfg = JSON.parse(jsonArea.value);
                if (!cfg || typeof cfg !== 'object') throw new Error('Oggetto JSON richiesto');
                if (this.onInsertDiagram) this.onInsertDiagram(selectedKind, cfg);
                editorWrap.hidden = true;
                selectedKind = null;
                for (const c of cards) c.classList.remove('active');
                this._closeMenu();
            } catch (err) {
                errBox.hidden = false;
                errBox.textContent = `JSON non valido: ${err.message}`;
            }
        });

        for (const btn of el.querySelectorAll('[data-preset]')) {
            btn.addEventListener('click', () => {
                const preset = WIDGET_PRESETS[btn.dataset.preset];
                if (!preset) return;
                if (this.onInsertDiagram) {
                    this.onInsertDiagram(preset.kind, JSON.parse(JSON.stringify(preset.data)));
                }
                this._closeMenu();
            });
        }

        return el;
    }

    // =========================================================================
    // 3. Exercise Picker Side Sheet
    // =========================================================================

    _buildExercisesPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-sheet board-exercises-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Inserisci esercizio</span>
            </div>
            <div class="board-search-box">
                ${BoardIcons.search}
                <input type="text" data-ex-search placeholder="dinamica quesiti 4 · limiti 2.7 · parole..." />
            </div>
            <div class="board-chip-section">
                <div class="board-micro-label">Argomento</div>
                <div class="board-chip-row" data-ex-topics>
                    ${DEFAULT_TOPICS.map((t) => `<button type="button" class="board-chip" data-topic="${t.toLowerCase()}">${t}</button>`).join('')}
                </div>
            </div>
            <div class="board-chip-section">
                <div class="board-micro-label">Sezione</div>
                <div class="board-chip-row" data-ex-sections>
                    ${DEFAULT_SECTIONS.map((s) => `<button type="button" class="board-chip" data-section="${s.toLowerCase()}">${s}</button>`).join('')}
                </div>
            </div>
            <div class="board-ex-notes-row" data-ex-notes hidden></div>
            <div class="board-ex-items-row" data-ex-items hidden></div>
            <div class="board-ex-preview">
                <div class="board-ex-preview-meta">Seleziona un argomento o cerca un esercizio…</div>
                <div class="board-ex-preview-body"></div>
            </div>
            <div class="board-popover-footer">
                <label class="board-inline-check">
                    <input type="checkbox" data-ex-hide-sol checked />
                    <span>Nascondi soluzione</span>
                </label>
                <button type="button" class="board-action-btn board-action-primary" data-ex-insert disabled>
                    ${BoardIcons.add}<span>Inserisci</span>
                </button>
            </div>
        `;

        const searchInput = el.querySelector('[data-ex-search]');
        const topicsRow = el.querySelector('[data-ex-topics]');
        const sectionsRow = el.querySelector('[data-ex-sections]');
        const hideSolCheck = el.querySelector('[data-ex-hide-sol]');
        const insertBtn = el.querySelector('[data-ex-insert]');
        const previewEl = el.querySelector('.board-ex-preview');

        let debounceTimer = null;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            this._exState.noteUrl = null;
            debounceTimer = setTimeout(() => this._runExerciseSearch(), 170);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(debounceTimer);
                this._exState.noteUrl = null;
                this._runExerciseSearch();
            }
        });

        topicsRow.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-topic]');
            if (!btn) return;
            const next = btn.dataset.topic;
            this._exState.topic = this._exState.topic === next ? null : next;
            this._exState.noteUrl = null;
            this._syncExChipState();
            this._runExerciseSearch();
        });

        sectionsRow.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-section]');
            if (!btn) return;
            const next = btn.dataset.section;
            this._exState.section = this._exState.section === next ? null : next;
            this._syncExChipState();
            this._runExerciseSearch();
        });

        hideSolCheck.addEventListener('change', () => {
            previewEl.classList.toggle('is-solution-hidden', hideSolCheck.checked);
        });
        previewEl.classList.toggle('is-solution-hidden', hideSolCheck.checked);

        insertBtn.addEventListener('click', () => {
            const item = this._exState.selectedItem;
            const res = this._exState.currentResult;
            if (!item || !res || !res.activeNote) return;
            if (this.onInsertExercise) {
                this.onInsertExercise({
                    noteTitle: res.extracted ? res.extracted.noteTitle : res.activeNote.title,
                    noteUrl: res.activeNote.url,
                    section: item.section,
                    subsection: item.subsection || '',
                    label: item.label,
                    difficulty: item.difficulty || '',
                    hasSolution: Boolean(item.hasSolution),
                    hideSolution: Boolean(hideSolCheck.checked),
                    html: item.html,
                });
            }
            this._closeMenu();
        });

        return el;
    }

    _syncExChipState() {
        const pop = this.popovers.exercises;
        for (const btn of pop.querySelectorAll('[data-topic]')) {
            btn.classList.toggle('active', btn.dataset.topic === this._exState.topic);
        }
        for (const btn of pop.querySelectorAll('[data-section]')) {
            btn.classList.toggle('active', btn.dataset.section === this._exState.section);
        }
    }

    async _openExercisesPopover() {
        if (!this.exercisePicker) return;
        const pop = this.popovers.exercises;
        await this.exercisePicker.ensureLoaded();

        if (!this._exState.topicsEnriched) {
            this._exState.topicsEnriched = true;
            const topics = this.exercisePicker.getTopics();
            const topicsRow = pop.querySelector('[data-ex-topics]');
            topicsRow.innerHTML = topics
                .slice(0, 12)
                .map((t) => `<button type="button" class="board-chip" data-topic="${t.query}">${t.label}</button>`)
                .join('');
            this._syncExChipState();
        }

        if (!this._exState.currentResult) {
            await this._runExerciseSearch();
        }
        const searchInput = pop.querySelector('[data-ex-search]');
        if (searchInput) searchInput.focus({ preventScroll: true });
    }

    async _runExerciseSearch() {
        if (!this.exercisePicker) return;
        const pop = this.popovers.exercises;
        const searchInput = pop.querySelector('[data-ex-search]');
        const metaEl = pop.querySelector('.board-ex-preview-meta');
        const bodyEl = pop.querySelector('.board-ex-preview-body');
        const notesRow = pop.querySelector('[data-ex-notes]');
        const itemsRow = pop.querySelector('[data-ex-items]');
        const insertBtn = pop.querySelector('[data-ex-insert]');

        const seq = ++this._exState.searchSeq;
        const rawQuery = searchInput ? searchInput.value : '';

        metaEl.textContent = 'Ricerca…';
        insertBtn.disabled = true;

        try {
            const res = await this.exercisePicker.resolveQuery(rawQuery, {
                topicChip: this._exState.topic,
                sectionChip: this._exState.section,
                noteUrl: this._exState.noteUrl,
            });
            if (seq !== this._exState.searchSeq) return;

            this._exState.currentResult = res;

            // Render note tabs when multiple notes match
            if (res.notes.length > 1) {
                notesRow.hidden = false;
                notesRow.innerHTML = '';
                for (const n of res.notes.slice(0, 5)) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = `board-chip${res.activeNote && n.url === res.activeNote.url ? ' active' : ''}`;
                    b.textContent = n.title.replace(/^Esercizi\s+(?:di|su|sui|sulle|sulla)\s+/i, '');
                    b.title = n.title;
                    b.addEventListener('click', () => {
                        this._exState.noteUrl = n.url;
                        this._runExerciseSearch();
                    });
                    notesRow.appendChild(b);
                }
            } else {
                notesRow.hidden = true;
                notesRow.innerHTML = '';
            }

            const candidates = res.extracted ? (res.extracted.candidates || []) : [];
            const topItems = candidates.filter((it) => it.subItemNumber === null || (res.parsed && res.parsed.subItemNumber !== null));

            if (topItems.length > 1) {
                itemsRow.hidden = false;
                itemsRow.innerHTML = '';
                for (const it of topItems.slice(0, 24)) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    const isSel = res.extracted.match === it;
                    b.className = `board-chip board-ex-item-pill${isSel ? ' active' : ''}`;
                    b.textContent = `${it.section ? it.section.slice(0, 3) + ' ' : ''}${it.label}`;
                    b.title = `${it.section} ${it.label}`;
                    b.addEventListener('click', () => {
                        this._renderExercisePreview(res.extracted.noteTitle, it, itemsRow, b);
                    });
                    itemsRow.appendChild(b);
                }
            } else {
                itemsRow.hidden = true;
                itemsRow.innerHTML = '';
            }

            if (res.extracted && res.extracted.match) {
                await this._renderExercisePreview(res.extracted.noteTitle, res.extracted.match, itemsRow);
            } else {
                this._clearPreviewInstances();
                metaEl.textContent = res.activeNote ? res.activeNote.title : 'Nessun risultato';
                bodyEl.innerHTML = res.activeNote && res.activeNote.snippet
                    ? `<p>${res.activeNote.snippet}</p>`
                    : '<p>Nessun esercizio trovato per questa ricerca.</p>';
                insertBtn.disabled = true;
            }
        } catch (err) {
            if (seq !== this._exState.searchSeq) return;
            metaEl.textContent = 'Errore nel caricamento';
            bodyEl.innerHTML = `<p>${String(err && err.message ? err.message : err)}</p>`;
            insertBtn.disabled = true;
        }
    }

    _clearPreviewInstances() {
        for (const inst of this._exState.previewInstances) {
            if (inst && typeof inst.destroy === 'function') {
                try { inst.destroy(); } catch (_) { /* ignore */ }
            }
        }
        this._exState.previewInstances = [];
    }

    async _renderExercisePreview(noteTitle, item, itemsRow, activeBtn = null) {
        const pop = this.popovers.exercises;
        const metaEl = pop.querySelector('.board-ex-preview-meta');
        const bodyEl = pop.querySelector('.board-ex-preview-body');
        const previewEl = pop.querySelector('.board-ex-preview');
        const hideSolCheck = pop.querySelector('[data-ex-hide-sol]');
        const insertBtn = pop.querySelector('[data-ex-insert]');

        if (activeBtn && itemsRow) {
            for (const b of itemsRow.querySelectorAll('.board-ex-item-pill')) {
                b.classList.toggle('active', b === activeBtn);
            }
        }

        this._clearPreviewInstances();
        this._exState.selectedItem = item;
        const parts = [noteTitle, item.section, item.subsection, item.label].filter(Boolean);
        metaEl.textContent = parts.join(' · ');
        bodyEl.innerHTML = item.html;
        previewEl.classList.toggle('is-solution-hidden', Boolean(hideSolCheck && hideSolCheck.checked));
        insertBtn.disabled = false;

        if (this.engineLoader) {
            try {
                const insts = await hydrateEmbeddedEngines(bodyEl, this.engineLoader);
                this._exState.previewInstances.push(...insts);
            } catch (_) { /* ignore */ }
            try {
                await this.engineLoader.typeset([bodyEl]);
            } catch (_) { /* ignore */ }
        }
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
