/**
 * Canvas Options popover menu (theme, A4 crop marks, pen-only, palm-to-erase + sensitivity,
 * 1x DPR fast mode, Perf/Input HUD, export/import .mboard.json / .svg / .pdf, clear board).
 */

import { BoardIcons } from './icons.js';
import { extractBoardDataFromSVG } from '../export/svg-export.js';

export class OptionsMenu {
    constructor(hostEl, {
        scene,
        getTheme,
        onToggleTheme,
        onSettingChange,
        onPageBackgroundChange = null,
        onExportJSON,
        onImportJSON,
        onExportSVG = null,
        onExportPDF = null,
        onClearBoard,
        onDeletePage,
    }) {
        this.hostEl = hostEl;
        this.scene = scene;
        this.getTheme = getTheme;
        this.onToggleTheme = onToggleTheme;
        this.onSettingChange = onSettingChange;
        this.onPageBackgroundChange = onPageBackgroundChange;
        this.onExportJSON = onExportJSON;
        this.onImportJSON = onImportJSON;
        this.onExportSVG = onExportSVG;
        this.onExportPDF = onExportPDF;
        this.onClearBoard = onClearBoard;
        this.onDeletePage = onDeletePage;

        this.open = false;

        this.el = document.createElement('div');
        this.el.className = 'board-popover board-options-popover';
        this.el.hidden = true;
        this.el.innerHTML = `
            <div class="board-popover-title">Opzioni lavagna</div>
            <button type="button" class="board-action-btn board-fullscreen-btn" data-fullscreen hidden></button>
            <div class="board-seg-row" role="tablist" aria-label="Sezioni delle opzioni">
                <button type="button" class="board-seg-btn" role="tab" data-tab="page">Pagina</button>
                <button type="button" class="board-seg-btn" role="tab" data-tab="touch">Tocco</button>
                <button type="button" class="board-seg-btn" role="tab" data-tab="ui">Barra</button>
                <button type="button" class="board-seg-btn" role="tab" data-tab="perf">Velocità</button>
                <button type="button" class="board-seg-btn" role="tab" data-tab="file">File</button>
            </div>
            <div class="board-opt-panels">
            <div class="board-options-list" role="tabpanel" data-tab-panel="page">
                <div class="board-opt-bg-row">
                    <span>Sfondo pagina</span>
                    <div class="board-bg-seg" data-page-bg>
                        <button type="button" class="board-bg-btn" data-bg="blank">Vuoto</button>
                        <button type="button" class="board-bg-btn" data-bg="grid">Quadretti</button>
                        <button type="button" class="board-bg-btn" data-bg="dots">Puntini</button>
                        <button type="button" class="board-bg-btn" data-bg="ruled">Righe</button>
                    </div>
                </div>
                <label class="board-opt-row">
                    <span>Bordi pagina A4</span>
                    <input type="checkbox" data-opt="showCropMarks" />
                </label>
                <label class="board-opt-row">
                    <span>Tema scuro</span>
                    <input type="checkbox" data-opt="darkTheme" />
                </label>
            </div>
            <div class="board-options-list" role="tabpanel" data-tab-panel="touch" hidden>
                <label class="board-opt-row">
                    <span>Solo stilo (1 dito sposta)</span>
                    <input type="checkbox" data-opt="penOnly" />
                </label>
                <label class="board-opt-row" title="Blocca lo zoom con le dita: due dita spostano soltanto la lavagna senza zoomare">
                    <span>Blocca zoom (2 dita solo pan)</span>
                    <input type="checkbox" data-opt="zoomLock" />
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
                    <span>Menu rapido (tocco con due dita)</span>
                    <input type="checkbox" data-opt="quickMenu" />
                </label>
                <label class="board-opt-row" title="Saltando da un connettore all'altro la vista scorre fino al gemello invece di cambiare di colpo">
                    <span>Scorri tra i connettori</span>
                    <input type="checkbox" data-opt="connectorGlide" />
                </label>
            </div>
            <div class="board-options-list" role="tabpanel" data-tab-panel="ui" hidden>
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
            </div>
            <div class="board-options-list" role="tabpanel" data-tab-panel="perf" hidden>
                <label class="board-opt-row">
                    <span>Modalità veloce (1× DPR)</span>
                    <input type="checkbox" data-opt="lowDpr" />
                </label>
                <label class="board-opt-row" title="Durante pan e zoom sposta un'immagine della lavagna e la ridisegna nitida alla fine: fluido anche con molti tratti">
                    <span>Pan e zoom fluidi</span>
                    <input type="checkbox" data-opt="fastPan" />
                </label>
                <!-- EXPERIMENT: pixelated gesture; delete this row to remove it -->
                <div class="board-opt-bg-row">
                    <span>Effetto durante pan e zoom</span>
                    <div class="board-bg-seg" data-seg="gestureEffect">
                        <button type="button" class="board-bg-btn" data-val="dim">Attenuato</button>
                        <button type="button" class="board-bg-btn" data-val="pixel">Pixel</button>
                    </div>
                </div>
                <!-- EXPERIMENT: when the pan/zoom pictures are freed; delete this row to remove it -->
                <div class="board-opt-bg-row" title="Dopo quanto tempo fermo la lavagna libera la memoria delle immagini usate per pan e zoom. Più breve: meno memoria, ma il pan successivo deve ricrearle">
                    <span>Libera memoria pan dopo</span>
                    <div class="board-bg-seg" data-seg="snapRelease">
                        <button type="button" class="board-bg-btn" data-val="2000">2 s</button>
                        <button type="button" class="board-bg-btn" data-val="30000">30 s</button>
                        <button type="button" class="board-bg-btn" data-val="never">Mai</button>
                    </div>
                </div>
                <label class="board-opt-row">
                    <span>HUD prestazioni e input</span>
                    <input type="checkbox" data-opt="showHud" />
                </label>
            </div>
            <div class="board-options-actions" role="tabpanel" data-tab-panel="file" hidden>
                <button type="button" class="board-action-btn" data-action="export">
                    ${BoardIcons.download}<span>Esporta JSON</span>
                </button>
                <button type="button" class="board-action-btn" data-action="import" title="Importa .mboard.json o .svg">
                    ${BoardIcons.upload}<span>Importa</span>
                </button>
                <button type="button" class="board-action-btn" data-action="export-svg" title="Esporta SVG con metadati modificabili">
                    ${BoardIcons.download}<span>Esporta SVG</span>
                </button>
                <button type="button" class="board-action-btn" data-action="export-pdf" title="Esporta PDF vettoriale">
                    ${BoardIcons.download}<span>Esporta PDF</span>
                </button>
                <button type="button" class="board-action-btn is-danger" data-action="clear">
                    ${BoardIcons.delete}<span>Pulisci pagina</span>
                </button>
                <button type="button" class="board-action-btn is-danger" data-action="delete-page">
                    ${BoardIcons.close}<span>Elimina pagina</span>
                </button>
            </div>
            </div>
            <input type="file" accept=".json,.mboard.json,.svg" class="board-file-input" hidden />
        `;

        this.fileInput = this.el.querySelector('.board-file-input');
        // Sections as tabs. All panels share one grid cell, so the menu is always as tall as
        // its tallest tab: switching tabs never resizes it or pushes it off-screen, and on a
        // short screen only the panel area scrolls under the fixed title and tabs.
        this.tab = 'page';
        this.el.querySelectorAll('[data-tab]').forEach((btn) => {
            btn.addEventListener('click', () => this._showTab(btn.dataset.tab));
        });
        this._showTab(this.tab);
        this._bindFullscreen();
        this._bindEvents();
        this.syncFromState();
        this.hostEl.appendChild(this.el);
    }

    /**
     * Full screen on/off, for browsers without their own control (smartboards).
     * Hidden where the Fullscreen API is missing (e.g. iPhone Safari).
     */
    _bindFullscreen() {
        const btn = this.el.querySelector('[data-fullscreen]');
        const doc = typeof document !== 'undefined' ? document : null;
        const root = doc && doc.documentElement;
        if (!btn || !root) return;
        const request = root.requestFullscreen || root.webkitRequestFullscreen;
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
        const current = () => doc.fullscreenElement || doc.webkitFullscreenElement || null;
        if (!request || !exit) return;

        const sync = () => {
            const on = Boolean(current());
            btn.innerHTML = on
                ? `${BoardIcons.fullscreenExit}<span>Esci da schermo intero</span>`
                : `${BoardIcons.fullscreen}<span>Schermo intero</span>`;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', String(on));
        };
        btn.hidden = false;
        btn.addEventListener('click', () => {
            try {
                const res = current() ? exit.call(doc) : request.call(root, { navigationUI: 'hide' });
                if (res && typeof res.catch === 'function') res.catch(() => { /* refused by the browser */ });
            } catch (_) { /* refused by the browser */ }
        });
        doc.addEventListener('fullscreenchange', sync);
        doc.addEventListener('webkitfullscreenchange', sync);
        sync();
    }

    _bindEvents() {
        this.el.addEventListener('pointerdown', (e) => e.stopPropagation());

        const darkCb = this.el.querySelector('[data-opt="darkTheme"]');
        darkCb.addEventListener('change', () => {
            if (this.onToggleTheme) this.onToggleTheme(darkCb.checked ? 'dark' : 'light');
        });

        for (const key of ['showCropMarks', 'penOnly', 'zoomLock', 'palmErase', 'quickMenu', 'fastPan', 'connectorGlide', 'lowDpr', 'showHud']) {
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

        for (const btn of this.el.querySelectorAll('[data-page-bg] [data-bg]')) {
            btn.addEventListener('click', () => {
                const bg = btn.dataset.bg;
                this.scene.pageBackground = bg;
                this._syncPageBackground();
                if (this.onPageBackgroundChange) this.onPageBackgroundChange(bg);
            });
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

        this.el.querySelector('[data-action="export-svg"]').addEventListener('click', () => {
            if (this.onExportSVG) this.onExportSVG();
            this.hide();
        });

        this.el.querySelector('[data-action="export-pdf"]').addEventListener('click', () => {
            if (this.onExportPDF) this.onExportPDF();
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
                    const text = String(reader.result || '');
                    const isSvg = (file.name && file.name.toLowerCase().endsWith('.svg'))
                        || file.type === 'image/svg+xml'
                        || text.trimStart().startsWith('<');
                    const parsed = isSvg ? extractBoardDataFromSVG(text) : JSON.parse(text);
                    if (parsed && this.onImportJSON) {
                        this.onImportJSON(parsed);
                        this.hide();
                    }
                } catch (_) {
                    // ignore invalid JSON/SVG
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

    _syncPageBackground() {
        const current = this.scene.pageBackground || 'blank';
        for (const btn of this.el.querySelectorAll('[data-page-bg] [data-bg]')) {
            const on = btn.dataset.bg === current;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', String(on));
        }
    }

    _syncPalmSliderVisibility() {
        const wrap = this.el.querySelector('[data-opt-wrap="palmThreshold"]');
        wrap.hidden = !this.scene.settings.palmErase;
    }

    _showTab(name) {
        this.tab = name;
        this.el.querySelectorAll('[data-tab]').forEach((btn) => {
            const on = btn.dataset.tab === name;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', String(on));
        });
        this.el.querySelectorAll('[data-tab-panel]').forEach((panel) => {
            panel.hidden = panel.dataset.tabPanel !== name;
        });
    }

    syncFromState() {
        this.el.querySelector('[data-opt="darkTheme"]').checked = this.getTheme() === 'dark';
        for (const key of ['showCropMarks', 'penOnly', 'zoomLock', 'palmErase', 'quickMenu', 'fastPan', 'connectorGlide', 'lowDpr', 'showHud']) {
            this.el.querySelector(`[data-opt="${key}"]`).checked = Boolean(this.scene.settings[key]);
        }
        const th = this.scene.settings.palmThreshold || 42;
        this.el.querySelector('[data-opt="palmThreshold"]').value = String(th);
        this.el.querySelector('[data-opt-val="palmThreshold"]').textContent = `${th} px`;
        this._syncPalmSliderVisibility();
        this._syncSegments();
        this._syncPageBackground();
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
