/**
 * Canvas Options popover menu (theme, A4 crop marks, pen-only, palm-to-erase + sensitivity,
 * 1x DPR fast mode, Perf/Input HUD, export/import .mboard.json, clear board).
 */

import { BoardIcons } from './icons.js';

export class OptionsMenu {
    constructor(hostEl, {
        scene,
        getTheme,
        onToggleTheme,
        onSettingChange,
        onExportJSON,
        onImportJSON,
        onClearBoard,
        onDeletePage,
    }) {
        this.hostEl = hostEl;
        this.scene = scene;
        this.getTheme = getTheme;
        this.onToggleTheme = onToggleTheme;
        this.onSettingChange = onSettingChange;
        this.onExportJSON = onExportJSON;
        this.onImportJSON = onImportJSON;
        this.onClearBoard = onClearBoard;
        this.onDeletePage = onDeletePage;

        this.open = false;

        this.el = document.createElement('div');
        this.el.className = 'board-popover board-options-popover';
        this.el.hidden = true;
        this.el.innerHTML = `
            <div class="board-popover-title">Opzioni lavagna</div>
            <div class="board-options-list">
                <label class="board-opt-row">
                    <span>Tema scuro</span>
                    <input type="checkbox" data-opt="darkTheme" />
                </label>
                <label class="board-opt-row">
                    <span>Bordi pagina A4</span>
                    <input type="checkbox" data-opt="showCropMarks" />
                </label>
                <label class="board-opt-row">
                    <span>Solo stilo (1 dito sposta)</span>
                    <input type="checkbox" data-opt="penOnly" />
                </label>
                <label class="board-opt-row">
                    <span>Palmo come gomma</span>
                    <input type="checkbox" data-opt="palmErase" />
                </label>
                <div class="board-opt-slider" data-opt-wrap="palmThreshold" hidden>
                    <span>Soglia palmo: <strong data-opt-val="palmThreshold">42 px</strong></span>
                    <input type="range" min="26" max="80" step="2" data-opt="palmThreshold" />
                </div>
                <label class="board-opt-row">
                    <span>Modalità veloce (1× DPR)</span>
                    <input type="checkbox" data-opt="lowDpr" />
                </label>
                <label class="board-opt-row" title="Durante pan e zoom sposta un'immagine della lavagna e la ridisegna nitida alla fine: fluido anche con molti tratti">
                    <span>Pan e zoom fluidi</span>
                    <input type="checkbox" data-opt="fastPan" />
                </label>
                <label class="board-opt-row">
                    <span>Menu rapido (tocco con due dita)</span>
                    <input type="checkbox" data-opt="quickMenu" />
                </label>
                <label class="board-opt-row">
                    <span>HUD prestazioni e input</span>
                    <input type="checkbox" data-opt="showHud" />
                </label>
                <div class="board-opt-bg-row">
                    <span>Dimensione interfaccia</span>
                    <div class="board-bg-seg" data-seg="uiSize">
                        <button type="button" class="board-bg-btn" data-val="s">Piccola</button>
                        <button type="button" class="board-bg-btn" data-val="m">Normale</button>
                        <button type="button" class="board-bg-btn" data-val="l">Grande</button>
                    </div>
                    <span>Barra strumenti</span>
                    <div class="board-bg-seg" data-seg="toolbarLayout">
                        <button type="button" class="board-bg-btn" data-val="auto" title="Laterale sugli schermi touch, in basso con il mouse">Auto</button>
                        <button type="button" class="board-bg-btn" data-val="rail">Laterale</button>
                        <button type="button" class="board-bg-btn" data-val="bar">In basso</button>
                    </div>
                    <span>Lato barra laterale</span>
                    <div class="board-bg-seg" data-seg="toolbarSide">
                        <button type="button" class="board-bg-btn" data-val="left">Sinistra</button>
                        <button type="button" class="board-bg-btn" data-val="right">Destra</button>
                    </div>
                </div>
                <div class="board-opt-bg-row">
                    <span>Sfondo pagina</span>
                    <div class="board-bg-seg">
                        <button type="button" class="board-bg-btn active">Vuoto</button>
                        <button type="button" class="board-bg-btn is-stub">Quadretti</button>
                        <button type="button" class="board-bg-btn is-stub">Puntini</button>
                        <button type="button" class="board-bg-btn is-stub">Righe</button>
                    </div>
                </div>
            </div>
            <div class="board-options-actions">
                <button type="button" class="board-action-btn" data-action="export">
                    ${BoardIcons.download}<span>Esporta JSON</span>
                </button>
                <button type="button" class="board-action-btn" data-action="import">
                    ${BoardIcons.upload}<span>Importa JSON</span>
                </button>
                <button type="button" class="board-action-btn is-stub" title="Esporta SVG con metadati modificabili (in arrivo)">
                    ${BoardIcons.download}<span>Esporta SVG</span>
                </button>
                <button type="button" class="board-action-btn is-stub" title="Esporta PDF vettoriale (in arrivo)">
                    ${BoardIcons.download}<span>Esporta PDF</span>
                </button>
                <button type="button" class="board-action-btn is-danger" data-action="clear">
                    ${BoardIcons.delete}<span>Pulisci pagina</span>
                </button>
                <button type="button" class="board-action-btn is-danger" data-action="delete-page">
                    ${BoardIcons.close}<span>Elimina pagina</span>
                </button>
            </div>
            <input type="file" accept=".json,.mboard.json" class="board-file-input" hidden />
        `;

        this.fileInput = this.el.querySelector('.board-file-input');
        this._bindEvents();
        this.syncFromState();
        this.hostEl.appendChild(this.el);
    }

    _bindEvents() {
        this.el.addEventListener('pointerdown', (e) => e.stopPropagation());

        const darkCb = this.el.querySelector('[data-opt="darkTheme"]');
        darkCb.addEventListener('change', () => {
            if (this.onToggleTheme) this.onToggleTheme(darkCb.checked ? 'dark' : 'light');
        });

        for (const key of ['showCropMarks', 'penOnly', 'palmErase', 'quickMenu', 'fastPan', 'lowDpr', 'showHud']) {
            const cb = this.el.querySelector(`[data-opt="${key}"]`);
            cb.addEventListener('change', () => {
                this.scene.settings[key] = cb.checked;
                this._syncPalmSliderVisibility();
                if (this.onSettingChange) this.onSettingChange(key, cb.checked);
            });
        }

        for (const seg of this.el.querySelectorAll('[data-seg]')) {
            const key = seg.dataset.seg;
            for (const btn of seg.querySelectorAll('[data-val]')) {
                btn.addEventListener('click', () => {
                    this.scene.settings[key] = btn.dataset.val;
                    this._syncSegments();
                    if (this.onSettingChange) this.onSettingChange(key, btn.dataset.val);
                });
            }
        }

        const slider = this.el.querySelector('[data-opt="palmThreshold"]');
        const sliderVal = this.el.querySelector('[data-opt-val="palmThreshold"]');
        slider.addEventListener('input', () => {
            const v = Number(slider.value);
            this.scene.settings.palmThreshold = v;
            sliderVal.textContent = `${v} px`;
            if (this.onSettingChange) this.onSettingChange('palmThreshold', v);
        });

        this.el.querySelector('[data-action="export"]').addEventListener('click', () => {
            if (this.onExportJSON) this.onExportJSON();
            this.hide();
        });

        this.el.querySelector('[data-action="import"]').addEventListener('click', () => {
            this.fileInput.value = '';
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', () => {
            const file = this.fileInput.files && this.fileInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const parsed = JSON.parse(String(reader.result));
                    if (this.onImportJSON) this.onImportJSON(parsed);
                    this.hide();
                } catch (_) {
                    // ignore invalid JSON
                }
            };
            reader.readAsText(file);
        });

        this.el.querySelector('[data-action="clear"]').addEventListener('click', () => {
            if (this.onClearBoard) this.onClearBoard();
            this.hide();
        });

        this.deletePageBtn = this.el.querySelector('[data-action="delete-page"]');
        this.deletePageBtn.addEventListener('click', () => {
            if (this.onDeletePage) this.onDeletePage();
            this.hide();
        });
    }

    _syncSegments() {
        for (const seg of this.el.querySelectorAll('[data-seg]')) {
            const value = String(this.scene.settings[seg.dataset.seg]);
            for (const btn of seg.querySelectorAll('[data-val]')) {
                const on = btn.dataset.val === value;
                btn.classList.toggle('active', on);
                btn.setAttribute('aria-pressed', String(on));
            }
        }
    }

    _syncPalmSliderVisibility() {
        const wrap = this.el.querySelector('[data-opt-wrap="palmThreshold"]');
        wrap.hidden = !this.scene.settings.palmErase;
    }

    syncFromState() {
        this.el.querySelector('[data-opt="darkTheme"]').checked = this.getTheme() === 'dark';
        for (const key of ['showCropMarks', 'penOnly', 'palmErase', 'quickMenu', 'fastPan', 'lowDpr', 'showHud']) {
            this.el.querySelector(`[data-opt="${key}"]`).checked = Boolean(this.scene.settings[key]);
        }
        const th = this.scene.settings.palmThreshold || 42;
        this.el.querySelector('[data-opt="palmThreshold"]').value = String(th);
        this.el.querySelector('[data-opt-val="palmThreshold"]').textContent = `${th} px`;
        this._syncPalmSliderVisibility();
        this._syncSegments();
        if (this.deletePageBtn) {
            this.deletePageBtn.disabled = this.scene.pageCount <= 1;
        }
    }

    toggle() {
        if (this.open) this.hide();
        else this.show();
    }

    show() {
        this.syncFromState();
        this.open = true;
        this.el.hidden = false;
    }

    hide() {
        this.open = false;
        this.el.hidden = true;
    }
}
