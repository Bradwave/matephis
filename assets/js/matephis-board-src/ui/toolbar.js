/**
 * Bottom-centered Matephis-styled dock with:
 * - Always-visible Pen + 5 inline quick color swatches + Eraser + Undo/Redo + Pin Top & Pin Left
 * - Elegantly structured Pen tray (2x5 color grid, 3 stroke styles, 4 world sizes)
 * - Instant Eraser tray (4 sizes + partial/whole-stroke toggle)
 * - Horizontal dock expansion revealing Highlighter, Laser, Overview, Theme, and Canvas Options
 * - Top-right compact Page Switcher (< 1 / N > +) + A4 footprint & zoom reset pills
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
        this.openTray = null; // null | 'pen' | 'eraser' | 'highlighter'
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
        this.overviewBtn.classList.toggle('active', this.overviewActive);
        this.footprintPill.classList.toggle('active', this.overviewActive);
    }

    updateFootprint(fp) {
        const label = `${fp.cols}×${fp.rows} A4`;
        this.footprintPill.textContent = label;
        this.footprintPill.classList.toggle('is-warning', Boolean(fp.warning));
        this.footprintPill.title = fp.warning
            ? `Lavagna estesa (${label}) — tocca per vista generale`
            : `Estensione attuale (${label}) — tocca per vista generale`;
    }

    updateZoom(camera) {
        const base = camera.baseScale || 1;
        const pct = Math.round((camera.scale / base) * 100);
        const show = Math.abs(pct - 100) >= 4;
        this.zoomPill.hidden = !show;
        if (show) {
            this.zoomPill.textContent = `${pct}%`;
        }
    }

    selectTool(tool, openTray = false) {
        this.state.tool = tool;
        if (openTray && (tool === 'pen' || tool === 'eraser' || tool === 'highlighter')) {
            this.openTray = tool;
        } else {
            this.openTray = null;
        }
        this.render();
        if (this.onToolChange) this.onToolChange(this.state);
    }

    _buildDOM() {
        // Top-right discrete status pills (only Zoom + A4 footprint)
        this.statusCluster = document.createElement('div');
        this.statusCluster.className = 'board-status-cluster';
        this.statusCluster.innerHTML = `
            <button type="button" class="board-pill board-zoom-pill" hidden title="Torna allo zoom di scrittura (100%)">100%</button>
            <button type="button" class="board-pill board-footprint-pill" title="Estensione A4 — tocca per vista generale">1×1 A4</button>
        `;
        this.zoomPill = this.statusCluster.querySelector('.board-zoom-pill');
        this.footprintPill = this.statusCluster.querySelector('.board-footprint-pill');

        this.zoomPill.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onResetZoom) this.onResetZoom();
        });
        this.footprintPill.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onToggleOverview) this.onToggleOverview();
        });
        this.statusCluster.addEventListener('pointerdown', (e) => e.stopPropagation());
        this.hostEl.appendChild(this.statusCluster);

        // Bottom dock wrapper (contextual trays above + horizontal dock bar)
        this.dockWrap = document.createElement('div');
        this.dockWrap.className = 'board-dock-wrap';
        this.dockWrap.addEventListener('pointerdown', (e) => e.stopPropagation());

        this.penTray = this._buildPenTray();
        this.eraserTray = this._buildEraserTray();
        this.highlighterTray = this._buildHighlighterTray();
        this.dockWrap.appendChild(this.penTray);
        this.dockWrap.appendChild(this.eraserTray);
        this.dockWrap.appendChild(this.highlighterTray);

        // Main horizontal dock bar
        this.dock = document.createElement('div');
        this.dock.className = 'board-dock';

        // Compact Page Switcher directly inside the bottom dock (< 1/N > +)
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

        this.prevPageBtn.addEventListener('click', () => {
            if (this.onPrevPage) this.onPrevPage();
        });
        this.nextPageBtn.addEventListener('click', () => {
            if (this.onNextPage) this.onNextPage();
        });
        this.addPageBtn.addEventListener('click', () => {
            if (this.onAddPage) this.onAddPage();
        });

        this.penBtn = this._makeToolBtn('Penna (P) — stile, spessore e colori', BoardIcons.pen, () => {
            if (this.state.tool === 'pen') {
                this.openTray = this.openTray === 'pen' ? null : 'pen';
            } else {
                this.state.tool = 'pen';
                this.openTray = 'pen';
            }
            this._closeOptionsIfOpen();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });

        // Minimal inline 5 quick color dots (always visible, compact footprint)
        this.quickColorsEl = document.createElement('div');
        this.quickColorsEl.className = 'board-quick-colors';
        this.quickSwatchBtns = [];
        for (const c of PEN_COLORS.filter((item) => item.quick)) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-quick-dot';
            btn.title = c.name;
            btn.dataset.colorId = String(c.id);
            btn.innerHTML = '<span class="board-quick-dot-fill"></span>';
            btn.addEventListener('click', () => {
                this.state.penColor = c.id;
                this.state.tool = 'pen';
                this.openTray = null;
                this._closeOptionsIfOpen();
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.quickSwatchBtns.push(btn);
            this.quickColorsEl.appendChild(btn);
        }

        // Eraser — immediately opens size selector on selection
        this.eraserBtn = this._makeToolBtn('Gomma (E)', BoardIcons.eraser, () => {
            if (this.state.tool === 'eraser') {
                this.openTray = this.openTray === 'eraser' ? null : 'eraser';
            } else {
                this.state.tool = 'eraser';
                this.openTray = 'eraser';
            }
            this._closeOptionsIfOpen();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });

        this.undoBtn = this._makeToolBtn('Annulla (Ctrl+Z)', BoardIcons.undo, () => {
            if (this.onUndo) this.onUndo();
        });
        this.redoBtn = this._makeToolBtn('Ripristina (Ctrl+Y)', BoardIcons.redo, () => {
            if (this.onRedo) this.onRedo();
        });

        // Pin strip buttons — ALWAYS visible on main dock
        this.pinTopBtn = this._makeToolBtn('Fissa in alto e scorri sotto', BoardIcons.pinTop, () => {
            this.closeTrays();
            this._closeOptionsIfOpen();
            if (this.onPinTop) this.onPinTop();
        });
        this.pinLeftBtn = this._makeToolBtn('Fissa a sinistra e scorri a destra', BoardIcons.pinLeft, () => {
            this.closeTrays();
            this._closeOptionsIfOpen();
            if (this.onPinLeft) this.onPinLeft();
        });

        // Horizontal expandable drawer for secondary tools
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
            this._closeOptionsIfOpen();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });

        this.laserBtn = this._makeToolBtn('Puntatore laser (L)', BoardIcons.laser, () => {
            this.state.tool = 'laser';
            this.openTray = null;
            this._closeOptionsIfOpen();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });

        this.overviewBtn = this._makeToolBtn('Vista generale A4 (O)', BoardIcons.overview, () => {
            this.closeTrays();
            if (this.onToggleOverview) this.onToggleOverview();
        });

        this.themeBtn = this._makeToolBtn('Cambia tema chiaro/scuro', BoardIcons.moon, () => {
            if (this.onToggleTheme) {
                this.onToggleTheme(this.getTheme() === 'dark' ? 'light' : 'dark');
            }
        });

        this.optionsBtn = this._makeToolBtn('Opzioni lavagna', BoardIcons.tune, () => {
            this.closeTrays();
            if (this.onToggleOptions) this.onToggleOptions();
        });

        this.extraGroup.append(
            this._makeDivider(),
            this.highlighterBtn,
            this.laserBtn,
            this._makeDivider(),
            this.overviewBtn,
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
                if (this.openTray === 'highlighter') this.closeTrays();
                this._closeOptionsIfOpen();
            }
        });

        this.dock.append(
            this.pageNavEl,
            this._makeDivider(),
            this.penBtn,
            this.quickColorsEl,
            this._makeDivider(),
            this.eraserBtn,
            this._makeDivider(),
            this.undoBtn,
            this.redoBtn,
            this._makeDivider(),
            this.pinTopBtn,
            this.pinLeftBtn,
            this.extraGroup,
            this._makeDivider(),
            this.expandBtn
        );

        this.dockWrap.appendChild(this.dock);
        this.hostEl.appendChild(this.dockWrap);
    }

    _closeOptionsIfOpen() {
        if (this.onToggleOptions) this.onToggleOptions(false);
    }

    _makeToolBtn(title, iconSvg, onClick) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'board-tool-btn';
        btn.title = title;
        btn.setAttribute('aria-label', title);
        btn.innerHTML = iconSvg;
        btn.addEventListener('click', onClick);
        return btn;
    }

    _makeDivider() {
        const sep = document.createElement('span');
        sep.className = 'board-dock-sep';
        return sep;
    }

    /**
     * Structured Pen tray:
     * - Section 1: COLORE (clean 2x5 color swatch grid)
     * - Section 2: TRATTO (3 equal-width style buttons: solid / dashed / dotted)
     * - Section 3: SPESSORE (4 equal-width stroke weight buttons)
     */
    _buildPenTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-pen-tray';
        tray.hidden = true;

        // Section 1: Colors (2 rows of 5)
        const colorsSection = document.createElement('div');
        colorsSection.className = 'board-tray-section';
        colorsSection.innerHTML = '<div class="board-tray-label">Colore</div>';

        const colorsGrid = document.createElement('div');
        colorsGrid.className = 'board-color-grid';
        this.penTraySwatches = [];
        for (const c of PEN_COLORS) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-swatch';
            btn.title = c.name;
            btn.dataset.colorId = String(c.id);
            btn.addEventListener('click', () => {
                this.state.penColor = c.id;
                this.state.tool = 'pen';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.penTraySwatches.push(btn);
            colorsGrid.appendChild(btn);
        }
        colorsSection.appendChild(colorsGrid);

        // Section 2 & 3 side-by-side: Style + Size
        const bottomGrid = document.createElement('div');
        bottomGrid.className = 'board-pen-meta-grid';

        const styleSection = document.createElement('div');
        styleSection.className = 'board-tray-section';
        styleSection.innerHTML = '<div class="board-tray-label">Tratto</div>';

        const stylesWrap = document.createElement('div');
        stylesWrap.className = 'board-seg-grid board-seg-grid-3';
        this.styleBtns = [];
        for (const st of PEN_STYLES) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-seg-btn';
            btn.title = st.label;
            btn.dataset.styleId = st.id;
            const dashAttr = st.id === 'dashed'
                ? 'stroke-dasharray="6 4"'
                : st.id === 'dotted'
                    ? 'stroke-dasharray="0.5 5"'
                    : '';
            btn.innerHTML = `<svg viewBox="0 0 36 12" width="32" height="12"><line x1="3" y1="6" x2="33" y2="6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" ${dashAttr}/></svg>`;
            btn.addEventListener('click', () => {
                this.state.penStyle = st.id;
                this.state.tool = 'pen';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.styleBtns.push(btn);
            stylesWrap.appendChild(btn);
        }
        styleSection.appendChild(stylesWrap);

        const sizeSection = document.createElement('div');
        sizeSection.className = 'board-tray-section';
        sizeSection.innerHTML = '<div class="board-tray-label">Spessore</div>';

        const sizesWrap = document.createElement('div');
        sizesWrap.className = 'board-seg-grid board-seg-grid-4';
        this.penSizeBtns = [];
        for (let i = 0; i < PEN_SIZES.length; i++) {
            const sz = PEN_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-size-btn';
            btn.title = `${sz.label} (${sz.width} mm)`;
            btn.dataset.sizeWidth = String(sz.width);
            const dotPx = 4 + i * 3.5;
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
        sizeSection.appendChild(sizesWrap);

        bottomGrid.append(styleSection, sizeSection);
        tray.append(colorsSection, bottomGrid);
        return tray;
    }

    _buildEraserTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-eraser-tray';
        tray.hidden = true;

        const row = document.createElement('div');
        row.className = 'board-tray-row board-tray-controls';

        const sizesWrap = document.createElement('div');
        sizesWrap.className = 'board-seg-group';
        this.eraserSizeBtns = [];
        for (let i = 0; i < ERASER_SIZES.length; i++) {
            const sz = ERASER_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-size-btn';
            btn.title = `Gomma ${sz.label}`;
            btn.dataset.eraserRadius = String(sz.radius);
            const dotPx = 7 + i * 4;
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
        modeWrap.className = 'board-seg-group';
        this.eraserModeBtns = [];
        for (const m of [
            { id: 'partial', label: 'Parziale' },
            { id: 'stroke',  label: 'Tratto' },
        ]) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-text-seg-btn';
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

        row.append(sizesWrap, this._makeDivider(), modeWrap);
        tray.appendChild(row);
        return tray;
    }

    _buildHighlighterTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-highlighter-tray';
        tray.hidden = true;

        const row = document.createElement('div');
        row.className = 'board-tray-row board-tray-controls';

        const colorsWrap = document.createElement('div');
        colorsWrap.className = 'board-seg-group';
        this.hlSwatchBtns = [];
        for (const c of HIGHLIGHTER_COLORS) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-swatch';
            btn.title = c.name;
            btn.dataset.colorId = c.id;
            btn.addEventListener('click', () => {
                this.state.highlighterColor = c.id;
                this.state.tool = 'highlighter';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.hlSwatchBtns.push(btn);
            colorsWrap.appendChild(btn);
        }

        const sizesWrap = document.createElement('div');
        sizesWrap.className = 'board-seg-group';
        this.hlSizeBtns = [];
        for (let i = 0; i < HIGHLIGHTER_SIZES.length; i++) {
            const sz = HIGHLIGHTER_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-size-btn';
            btn.title = sz.label;
            btn.dataset.hlWidth = String(sz.width);
            const hPx = 6 + i * 4;
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

        row.append(colorsWrap, this._makeDivider(), sizesWrap);
        tray.appendChild(row);
        return tray;
    }

    _renderTrays() {
        this.penTray.hidden = this.openTray !== 'pen';
        this.eraserTray.hidden = this.openTray !== 'eraser';
        this.highlighterTray.hidden = this.openTray !== 'highlighter';
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
