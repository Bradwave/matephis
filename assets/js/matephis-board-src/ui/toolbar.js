/**
 * Bottom-centered Matephis-styled dock with the complete Phase 1–4 UI shell:
 * - Always-visible: Page nav (< 1/N > +) | Pen + 5 minimal color dots | Eraser | Lasso (stub) |
 *   Undo/Redo | Pin Top & Left + A4 Overview (1x1) + Zoom % | Expand (...)
 * - Contextual single-row trays matching the exact bottom bar grammar:
 *   Pen, Eraser, Highlighter (working) + Lasso, Shapes, Connectors (stub UI)
 * - Horizontal dock expansion revealing Highlighter, Laser, Shapes (stub), Connectors (stub) |
 *   Plot/Axes (stub), Diagrams (stub), Exercises (stub) | Cloud Session (stub) | Theme, Options
 */

import {
    ERASER_SIZES,
    HIGHLIGHTER_COLORS,
    HIGHLIGHTER_SIZES,
    PEN_COLORS,
    PEN_SIZES,
    PEN_STYLES,
    resolveInkColor,
} from '../ink/palette.js';
import { BoardIcons } from './icons.js';

export class BoardToolbar {
    constructor(hostEl, {
        getTheme,
        onToolChange,
        onUndo,
        onRedo,
        onPinTop,
        onPinLeft,
        onToggleOverview,
        onToggleTheme,
        onToggleOptions,
        onToggleFuturePopover,
        onResetZoom,
        onPrevPage,
        onNextPage,
        onAddPage,
    }) {
        this.hostEl = hostEl;
        this.getTheme = getTheme;
        this.onToolChange = onToolChange;
        this.onUndo = onUndo;
        this.onRedo = onRedo;
        this.onPinTop = onPinTop;
        this.onPinLeft = onPinLeft;
        this.onToggleOverview = onToggleOverview;
        this.onToggleTheme = onToggleTheme;
        this.onToggleOptions = onToggleOptions;
        this.onToggleFuturePopover = onToggleFuturePopover;
        this.onResetZoom = onResetZoom;
        this.onPrevPage = onPrevPage;
        this.onNextPage = onNextPage;
        this.onAddPage = onAddPage;

        this.state = {
            tool: 'pen',           // 'pen' | 'eraser' | 'highlighter' | 'laser'
            penColor: 0,
            penWidth: PEN_SIZES[1].width,
            penStyle: 'solid',     // 'solid' | 'dashed' | 'dotted'
            eraserRadius: ERASER_SIZES[1].radius,
            eraserMode: 'partial', // 'partial' | 'stroke'
            highlighterColor: HIGHLIGHTER_COLORS[0].id,
            highlighterWidth: HIGHLIGHTER_SIZES[1].width,
        };

        this.expanded = false;
        this.openTray = null; // null | 'pen' | 'eraser' | 'highlighter' | 'lasso' | 'shapes' | 'connectors'
        this.activeFuturePopover = null; // null | 'plot' | 'diagrams' | 'exercises' | 'cloud'
        this.overviewActive = false;

        this._buildDOM();
        this.render();
    }

    getToolState() {
        return this.state;
    }

    closeTrays() {
        if (this.openTray !== null) {
            this.openTray = null;
            this._renderTrays();
        }
    }

    setActiveFuturePopover(name) {
        this.activeFuturePopover = name || null;
        this.plotBtn.classList.toggle('active', this.activeFuturePopover === 'plot');
        this.diagramsBtn.classList.toggle('active', this.activeFuturePopover === 'diagrams');
        this.exercisesBtn.classList.toggle('active', this.activeFuturePopover === 'exercises');
        this.cloudBtn.classList.toggle('active', this.activeFuturePopover === 'cloud');
    }

    setHistoryState(canUndo, canRedo) {
        this.undoBtn.disabled = !canUndo;
        this.redoBtn.disabled = !canRedo;
    }

    setPageState(currentIndex, totalPages) {
        this.pageIndicatorEl.textContent = `${currentIndex + 1}/${totalPages}`;
        this.prevPageBtn.disabled = currentIndex <= 0;
        this.nextPageBtn.disabled = currentIndex >= totalPages - 1;
    }

    setOverviewActive(active) {
        this.overviewActive = Boolean(active);
        this.footprintBtn.classList.toggle('active', this.overviewActive);
    }

    updateFootprint(fp) {
        const label = `${fp.cols}×${fp.rows}`;
        this.footprintBtn.textContent = label;
        this.footprintBtn.classList.toggle('is-warning', Boolean(fp.warning));
        this.footprintBtn.title = fp.warning
            ? `Vista generale (O) — lavagna estesa (${label} A4)`
            : `Vista generale (O) — ${label} A4`;
    }

    updateZoom(camera) {
        const base = camera.baseScale || 1;
        const pct = Math.round((camera.scale / base) * 100);
        this.zoomBtn.textContent = `${pct}%`;
        this.zoomBtn.classList.toggle('is-zoomed', Math.abs(pct - 100) >= 4);
    }

    selectTool(tool, openTray = false) {
        this.state.tool = tool;
        if (openTray && (tool === 'pen' || tool === 'eraser' || tool === 'highlighter')) {
            this.openTray = tool;
        } else {
            this.openTray = null;
        }
        this._closePopovers();
        this.render();
        if (this.onToolChange) this.onToolChange(this.state);
    }

    _buildDOM() {
        this.dockWrap = document.createElement('div');
        this.dockWrap.className = 'board-dock-wrap';
        this.dockWrap.addEventListener('pointerdown', (e) => e.stopPropagation());

        // Single-row contextual trays above dock
        this.penTray = this._buildPenTray();
        this.eraserTray = this._buildEraserTray();
        this.highlighterTray = this._buildHighlighterTray();
        this.lassoTray = this._buildLassoTray();
        this.shapesTray = this._buildShapesTray();
        this.connectorsTray = this._buildConnectorsTray();

        this.dockWrap.append(
            this.penTray,
            this.eraserTray,
            this.highlighterTray,
            this.lassoTray,
            this.shapesTray,
            this.connectorsTray
        );

        // Main horizontal dock bar
        this.dock = document.createElement('div');
        this.dock.className = 'board-dock';

        // Compact Page Switcher (< 1/N > +)
        this.pageNavEl = document.createElement('div');
        this.pageNavEl.className = 'board-page-nav';
        this.pageNavEl.setAttribute('aria-label', 'Navigazione pagine');
        this.pageNavEl.innerHTML = `
            <button type="button" class="board-page-btn board-page-prev" title="Pagina precedente (PageUp)">${BoardIcons.chevronLeft}</button>
            <span class="board-page-indicator">1/1</span>
            <button type="button" class="board-page-btn board-page-next" title="Pagina successiva (PageDown)">${BoardIcons.chevronRight}</button>
            <button type="button" class="board-page-btn board-page-add" title="Nuova pagina">${BoardIcons.add}</button>
        `;
        this.prevPageBtn = this.pageNavEl.querySelector('.board-page-prev');
        this.nextPageBtn = this.pageNavEl.querySelector('.board-page-next');
        this.addPageBtn = this.pageNavEl.querySelector('.board-page-add');
        this.pageIndicatorEl = this.pageNavEl.querySelector('.board-page-indicator');

        this.prevPageBtn.addEventListener('click', () => { if (this.onPrevPage) this.onPrevPage(); });
        this.nextPageBtn.addEventListener('click', () => { if (this.onNextPage) this.onNextPage(); });
        this.addPageBtn.addEventListener('click', () => { if (this.onAddPage) this.onAddPage(); });

        this.penBtn = this._makeToolBtn('Penna (P) — stile, spessore e colori', BoardIcons.pen, () => {
            if (this.state.tool === 'pen') {
                this.openTray = this.openTray === 'pen' ? null : 'pen';
            } else {
                this.state.tool = 'pen';
                this.openTray = 'pen';
            }
            this._closePopovers();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });

        // Minimal inline 5 quick color dots
        this.quickColorsEl = document.createElement('div');
        this.quickColorsEl.className = 'board-quick-colors';
        this.quickSwatchBtns = [];
        for (const c of PEN_COLORS.filter((item) => item.quick)) {
            const btn = this._makeColorDot(c.id, c.name, () => {
                this.state.penColor = c.id;
                this.state.tool = 'pen';
                this.openTray = null;
                this._closePopovers();
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.quickSwatchBtns.push(btn);
            this.quickColorsEl.appendChild(btn);
        }

        this.eraserBtn = this._makeToolBtn('Gomma (E)', BoardIcons.eraser, () => {
            if (this.state.tool === 'eraser') {
                this.openTray = this.openTray === 'eraser' ? null : 'eraser';
            } else {
                this.state.tool = 'eraser';
                this.openTray = 'eraser';
            }
            this._closePopovers();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });

        // Select / Lasso (Phase 2 stub — opens tray for styling preview)
        this.lassoBtn = this._makeToolBtn('Selezione lazo (in arrivo)', BoardIcons.lasso, () => {
            this.openTray = this.openTray === 'lasso' ? null : 'lasso';
            this._closePopovers();
            this.render();
        }, true);

        this.undoBtn = this._makeToolBtn('Annulla (Ctrl+Z)', BoardIcons.undo, () => {
            if (this.onUndo) this.onUndo();
        });
        this.redoBtn = this._makeToolBtn('Ripristina (Ctrl+Y)', BoardIcons.redo, () => {
            if (this.onRedo) this.onRedo();
        });

        // Spatial view controls — ALWAYS visible
        this.pinTopBtn = this._makeToolBtn('Fissa in alto e scorri sotto', BoardIcons.pinTop, () => {
            this.closeTrays();
            this._closePopovers();
            if (this.onPinTop) this.onPinTop();
        });
        this.pinLeftBtn = this._makeToolBtn('Fissa a sinistra e scorri a destra', BoardIcons.pinLeft, () => {
            this.closeTrays();
            this._closePopovers();
            if (this.onPinLeft) this.onPinLeft();
        });

        this.footprintBtn = document.createElement('button');
        this.footprintBtn.type = 'button';
        this.footprintBtn.className = 'board-dock-mono-btn board-footprint-btn';
        this.footprintBtn.textContent = '1×1';
        this.footprintBtn.title = 'Vista generale (O) — 1×1 A4';
        this.footprintBtn.addEventListener('click', () => {
            this.closeTrays();
            this._closePopovers();
            if (this.onToggleOverview) this.onToggleOverview();
        });

        this.zoomBtn = document.createElement('button');
        this.zoomBtn.type = 'button';
        this.zoomBtn.className = 'board-dock-mono-btn board-zoom-btn';
        this.zoomBtn.textContent = '100%';
        this.zoomBtn.title = 'Torna allo zoom di scrittura (100%)';
        this.zoomBtn.addEventListener('click', () => {
            if (this.onResetZoom) this.onResetZoom();
        });

        // Horizontal expandable drawer for secondary tools, Matephis inserts & cloud sync
        this.extraGroup = document.createElement('div');
        this.extraGroup.className = 'board-dock-extra';
        this.extraGroup.hidden = true;

        this.highlighterBtn = this._makeToolBtn('Evidenziatore (H)', BoardIcons.highlighter, () => {
            if (this.state.tool === 'highlighter') {
                this.openTray = this.openTray === 'highlighter' ? null : 'highlighter';
            } else {
                this.state.tool = 'highlighter';
                this.openTray = 'highlighter';
            }
            this._closePopovers();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });

        this.laserBtn = this._makeToolBtn('Puntatore laser (L)', BoardIcons.laser, () => {
            this.state.tool = 'laser';
            this.openTray = null;
            this._closePopovers();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });

        this.shapesBtn = this._makeToolBtn('Forme geometriche (in arrivo)', BoardIcons.shapes, () => {
            this.openTray = this.openTray === 'shapes' ? null : 'shapes';
            this._closePopovers();
            this.render();
        }, true);

        this.connectorsBtn = this._makeToolBtn('Connettori spiegazione A/1 (in arrivo)', BoardIcons.connector, () => {
            this.openTray = this.openTray === 'connectors' ? null : 'connectors';
            this._closePopovers();
            this.render();
        }, true);

        // Matephis content insert buttons (Phase 2 stubs opening preview popovers)
        this.plotBtn = this._makeToolBtn('Assi cartesiani e grafici Matephis (in arrivo)', BoardIcons.axes, () => {
            this.closeTrays();
            if (this.onToggleFuturePopover) this.onToggleFuturePopover('plot');
        }, true);

        this.diagramsBtn = this._makeToolBtn('Diagrammi Matephis: fisica, insiemi, circuiti (in arrivo)', BoardIcons.diagram, () => {
            this.closeTrays();
            if (this.onToggleFuturePopover) this.onToggleFuturePopover('diagrams');
        }, true);

        this.exercisesBtn = this._makeToolBtn('Inserisci esercizio da Matephis (in arrivo)', BoardIcons.exercise, () => {
            this.closeTrays();
            if (this.onToggleFuturePopover) this.onToggleFuturePopover('exercises');
        }, true);

        // Cloud session & QR sync (Phase 4 stub opening preview popover)
        this.cloudBtn = this._makeToolBtn('Sessione cloud QR / R2 (in arrivo)', BoardIcons.cloud, () => {
            this.closeTrays();
            if (this.onToggleFuturePopover) this.onToggleFuturePopover('cloud');
        }, true);

        // Workspace controls (working)
        this.themeBtn = this._makeToolBtn('Cambia tema chiaro/scuro', BoardIcons.moon, () => {
            if (this.onToggleTheme) {
                this.onToggleTheme(this.getTheme() === 'dark' ? 'light' : 'dark');
            }
        });

        this.optionsBtn = this._makeToolBtn('Opzioni lavagna', BoardIcons.tune, () => {
            this.closeTrays();
            if (this.onToggleFuturePopover) this.onToggleFuturePopover(null);
            if (this.onToggleOptions) this.onToggleOptions();
        });

        this.extraGroup.append(
            this._makeDivider(),
            this.highlighterBtn,
            this.laserBtn,
            this.shapesBtn,
            this.connectorsBtn,
            this._makeDivider(),
            this.plotBtn,
            this.diagramsBtn,
            this.exercisesBtn,
            this._makeDivider(),
            this.cloudBtn,
            this._makeDivider(),
            this.themeBtn,
            this.optionsBtn
        );

        // Expand / collapse horizontal dock toggle
        this.expandBtn = this._makeToolBtn('Mostra altri strumenti', BoardIcons.more, () => {
            this.expanded = !this.expanded;
            this.extraGroup.hidden = !this.expanded;
            this.expandBtn.innerHTML = this.expanded ? BoardIcons.collapse : BoardIcons.more;
            this.expandBtn.title = this.expanded ? 'Comprimi barra' : 'Mostra altri strumenti';
            this.expandBtn.classList.toggle('is-expanded', this.expanded);
            if (!this.expanded) {
                if (this.openTray === 'highlighter' || this.openTray === 'shapes' || this.openTray === 'connectors') {
                    this.closeTrays();
                }
                this._closePopovers();
            }
        });

        this.dock.append(
            this.pageNavEl,
            this._makeDivider(),
            this.penBtn,
            this.quickColorsEl,
            this._makeDivider(),
            this.eraserBtn,
            this.lassoBtn,
            this._makeDivider(),
            this.undoBtn,
            this.redoBtn,
            this._makeDivider(),
            this.pinTopBtn,
            this.pinLeftBtn,
            this.footprintBtn,
            this.zoomBtn,
            this.extraGroup,
            this._makeDivider(),
            this.expandBtn
        );

        this.dockWrap.appendChild(this.dock);
        this.hostEl.appendChild(this.dockWrap);
    }

    _closePopovers() {
        if (this.onToggleOptions) this.onToggleOptions(false);
        if (this.onToggleFuturePopover) this.onToggleFuturePopover(null);
    }

    _makeToolBtn(title, iconSvg, onClick, isStub = false) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = isStub ? 'board-tool-btn is-stub' : 'board-tool-btn';
        btn.title = title;
        btn.setAttribute('aria-label', title);
        btn.innerHTML = iconSvg;
        btn.addEventListener('click', onClick);
        return btn;
    }

    _makeColorDot(colorId, name, onClick) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'board-quick-dot';
        btn.title = name;
        btn.dataset.colorId = String(colorId);
        btn.innerHTML = '<span class="board-quick-dot-fill"></span>';
        btn.addEventListener('click', onClick);
        return btn;
    }

    _makeDivider() {
        const sep = document.createElement('span');
        sep.className = 'board-dock-sep';
        return sep;
    }

    _buildPenTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-pen-tray';
        tray.hidden = true;

        const colorsWrap = document.createElement('div');
        colorsWrap.className = 'board-quick-colors';
        this.penTraySwatches = [];
        for (let i = 0; i < PEN_COLORS.length; i++) {
            const c = PEN_COLORS[i];
            if (i === 5) colorsWrap.appendChild(this._makeDivider());
            const btn = this._makeColorDot(c.id, c.name, () => {
                this.state.penColor = c.id;
                this.state.tool = 'pen';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.penTraySwatches.push(btn);
            colorsWrap.appendChild(btn);
        }

        const stylesWrap = document.createElement('div');
        stylesWrap.className = 'board-tray-group';
        this.styleBtns = [];
        for (const st of PEN_STYLES) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn board-style-btn';
            btn.title = st.label;
            btn.dataset.styleId = st.id;
            const dashAttr = st.id === 'dashed'
                ? 'stroke-dasharray="5 3.5"'
                : st.id === 'dotted'
                    ? 'stroke-dasharray="0.5 4.5"'
                    : '';
            btn.innerHTML = `<svg viewBox="0 0 28 10" width="24" height="10"><line x1="2" y1="5" x2="26" y2="5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ${dashAttr}/></svg>`;
            btn.addEventListener('click', () => {
                this.state.penStyle = st.id;
                this.state.tool = 'pen';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.styleBtns.push(btn);
            stylesWrap.appendChild(btn);
        }

        const sizesWrap = document.createElement('div');
        sizesWrap.className = 'board-tray-group';
        this.penSizeBtns = [];
        for (let i = 0; i < PEN_SIZES.length; i++) {
            const sz = PEN_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn';
            btn.title = `${sz.label} (${sz.width} mm)`;
            btn.dataset.sizeWidth = String(sz.width);
            const dotPx = 3 + i * 2.2;
            btn.innerHTML = `<span class="board-size-dot" style="width:${dotPx}px;height:${dotPx}px;"></span>`;
            btn.addEventListener('click', () => {
                this.state.penWidth = sz.width;
                this.state.tool = 'pen';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.penSizeBtns.push(btn);
            sizesWrap.appendChild(btn);
        }

        tray.append(stylesWrap, this._makeDivider(), colorsWrap, this._makeDivider(), sizesWrap);
        return tray;
    }

    _buildEraserTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-eraser-tray';
        tray.hidden = true;

        const sizesWrap = document.createElement('div');
        sizesWrap.className = 'board-tray-group';
        this.eraserSizeBtns = [];
        for (let i = 0; i < ERASER_SIZES.length; i++) {
            const sz = ERASER_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn';
            btn.title = `Gomma ${sz.label}`;
            btn.dataset.eraserRadius = String(sz.radius);
            const dotPx = 6 + i * 3.5;
            btn.innerHTML = `<span class="board-eraser-dot" style="width:${dotPx}px;height:${dotPx}px;"></span>`;
            btn.addEventListener('click', () => {
                this.state.eraserRadius = sz.radius;
                this.state.tool = 'eraser';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.eraserSizeBtns.push(btn);
            sizesWrap.appendChild(btn);
        }

        const modeWrap = document.createElement('div');
        modeWrap.className = 'board-tray-group';
        this.eraserModeBtns = [];
        for (const m of [
            { id: 'partial', label: 'Parziale' },
            { id: 'stroke',  label: 'Tratto' },
        ]) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn board-tray-text-btn';
            btn.textContent = m.label;
            btn.dataset.eraseMode = m.id;
            btn.addEventListener('click', () => {
                this.state.eraserMode = m.id;
                this.state.tool = 'eraser';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.eraserModeBtns.push(btn);
            modeWrap.appendChild(btn);
        }

        tray.append(sizesWrap, this._makeDivider(), modeWrap);
        return tray;
    }

    _buildHighlighterTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-highlighter-tray';
        tray.hidden = true;

        const colorsWrap = document.createElement('div');
        colorsWrap.className = 'board-quick-colors';
        this.hlSwatchBtns = [];
        for (const c of HIGHLIGHTER_COLORS) {
            const btn = this._makeColorDot(c.id, c.name, () => {
                this.state.highlighterColor = c.id;
                this.state.tool = 'highlighter';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.hlSwatchBtns.push(btn);
            colorsWrap.appendChild(btn);
        }

        const sizesWrap = document.createElement('div');
        sizesWrap.className = 'board-tray-group';
        this.hlSizeBtns = [];
        for (let i = 0; i < HIGHLIGHTER_SIZES.length; i++) {
            const sz = HIGHLIGHTER_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn';
            btn.title = sz.label;
            btn.dataset.hlWidth = String(sz.width);
            const hPx = 5 + i * 3.5;
            btn.innerHTML = `<span class="board-hl-bar" style="height:${hPx}px;"></span>`;
            btn.addEventListener('click', () => {
                this.state.highlighterWidth = sz.width;
                this.state.tool = 'highlighter';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.hlSizeBtns.push(btn);
            sizesWrap.appendChild(btn);
        }

        tray.append(colorsWrap, this._makeDivider(), sizesWrap);
        return tray;
    }

    /**
     * Phase 2 stub tray: Lasso / Rectangle selection & actions.
     */
    _buildLassoTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-lasso-tray';
        tray.hidden = true;
        tray.innerHTML = `
            <div class="board-tray-group">
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Lazo</button>
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Rettangolo</button>
            </div>
            <span class="board-dock-sep"></span>
            <div class="board-tray-group">
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Duplica</button>
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Ricolora</button>
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Elimina</button>
            </div>
        `;
        return tray;
    }

    /**
     * Phase 2 stub tray: Basic geometry shapes (no hold-to-snap).
     */
    _buildShapesTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-shapes-tray';
        tray.hidden = true;
        tray.innerHTML = `
            <div class="board-tray-group">
                <button type="button" class="board-tray-btn is-stub" title="Linea (in arrivo)">
                    <svg viewBox="0 0 20 20" width="17" height="17"><line x1="3" y1="17" x2="17" y2="3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </button>
                <button type="button" class="board-tray-btn is-stub" title="Vettore / Freccia (in arrivo)">
                    <svg viewBox="0 0 20 20" width="17" height="17"><line x1="3" y1="17" x2="16" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><polyline points="9,4 16,4 16,11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="board-tray-btn is-stub" title="Rettangolo (in arrivo)">
                    <svg viewBox="0 0 20 20" width="17" height="17"><rect x="3" y="4.5" width="14" height="11" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                </button>
                <button type="button" class="board-tray-btn is-stub" title="Cerchio / Ellisse (in arrivo)">
                    <svg viewBox="0 0 20 20" width="17" height="17"><circle cx="10" cy="10" r="6.8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                </button>
                <button type="button" class="board-tray-btn is-stub" title="Triangolo (in arrivo)">
                    <svg viewBox="0 0 20 20" width="17" height="17"><polygon points="10,3.5 17,16.5 3,16.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
                </button>
            </div>
        `;
        return tray;
    }

    /**
     * Phase 2 stub tray: Letter / Number explanation connectors.
     */
    _buildConnectorsTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-connectors-tray';
        tray.hidden = true;
        tray.innerHTML = `
            <div class="board-tray-group">
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub" title="Codifica lettere (A, B, C…)">A, B…</button>
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub" title="Codifica numeri (1, 2, 3…)">1, 2…</button>
            </div>
            <span class="board-dock-sep"></span>
            <div class="board-tray-group">
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Nuovo</button>
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Collega</button>
            </div>
        `;
        return tray;
    }

    _renderTrays() {
        this.penTray.hidden = this.openTray !== 'pen';
        this.eraserTray.hidden = this.openTray !== 'eraser';
        this.highlighterTray.hidden = this.openTray !== 'highlighter';
        this.lassoTray.hidden = this.openTray !== 'lasso';
        this.shapesTray.hidden = this.openTray !== 'shapes';
        this.connectorsTray.hidden = this.openTray !== 'connectors';

        this.lassoBtn.classList.toggle('active', this.openTray === 'lasso');
        this.shapesBtn.classList.toggle('active', this.openTray === 'shapes');
        this.connectorsBtn.classList.toggle('active', this.openTray === 'connectors');
    }

    render() {
        const theme = this.getTheme();

        this.penBtn.classList.toggle('active', this.state.tool === 'pen');
        this.eraserBtn.classList.toggle('active', this.state.tool === 'eraser');
        this.highlighterBtn.classList.toggle('active', this.state.tool === 'highlighter');
        this.laserBtn.classList.toggle('active', this.state.tool === 'laser');

        this.themeBtn.innerHTML = theme === 'dark' ? BoardIcons.sun : BoardIcons.moon;
        this.themeBtn.title = theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro';

        for (const btn of [...this.quickSwatchBtns, ...this.penTraySwatches]) {
            const id = Number(btn.dataset.colorId);
            btn.style.setProperty('--swatch-color', resolveInkColor(id, theme));
            btn.classList.toggle('active', this.state.tool === 'pen' && this.state.penColor === id);
        }

        for (const btn of this.styleBtns) {
            btn.classList.toggle('active', btn.dataset.styleId === this.state.penStyle);
        }
        for (const btn of this.penSizeBtns) {
            btn.classList.toggle('active', Number(btn.dataset.sizeWidth) === this.state.penWidth);
        }

        for (const btn of this.eraserSizeBtns) {
            btn.classList.toggle('active', Number(btn.dataset.eraserRadius) === this.state.eraserRadius);
        }
        for (const btn of this.eraserModeBtns) {
            btn.classList.toggle('active', btn.dataset.eraseMode === this.state.eraserMode);
        }

        for (const btn of this.hlSwatchBtns) {
            const id = btn.dataset.colorId;
            btn.style.setProperty('--swatch-color', resolveInkColor(id, theme));
            btn.classList.toggle('active', this.state.highlighterColor === id);
        }
        for (const btn of this.hlSizeBtns) {
            btn.classList.toggle('active', Number(btn.dataset.hlWidth) === this.state.highlighterWidth);
        }

        this._renderTrays();
    }
}
