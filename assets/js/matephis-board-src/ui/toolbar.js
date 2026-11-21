/**
 * Bottom-centered Matephis-styled dock with:
 * - Always-visible: Page nav (< 1/N > +) | Pen + 5 minimal color dots | Eraser | Undo/Redo | Pin Top & Left + A4 Overview (1x1) + Zoom pill | Expand (...)
 * - Contextual trays (Pen, Eraser, Highlighter) matching the exact height, borderless-until-active
 *   button grammar, dividers, and minimal 12px color dots of the bottom bar
 * - Horizontal dock expansion revealing Highlighter, Laser, Theme, and Canvas Options
 * - Zero top-corner UI chrome: entire top viewport stays pure canvas
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
        const show = Math.abs(pct - 100) >= 4;
        this.zoomBtn.hidden = !show;
        if (show) {
            this.zoomBtn.textContent = `${pct}%`;
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
        // Bottom dock wrapper (contextual trays directly above + horizontal dock bar)
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

        // Compact Page Switcher inside bottom dock (< 1/N > +)
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

        // Minimal inline 5 quick color dots
        this.quickColorsEl = document.createElement('div');
        this.quickColorsEl.className = 'board-quick-colors';
        this.quickSwatchBtns = [];
        for (const c of PEN_COLORS.filter((item) => item.quick)) {
            const btn = this._makeColorDot(c.id, c.name, () => {
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

        // Eraser — immediately opens size/mode bar on selection
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

        // Spatial view controls — ALWAYS visible on dock: Pin Top, Pin Left, A4 Overview (1x1), conditional Zoom reset
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

        this.footprintBtn = document.createElement('button');
        this.footprintBtn.type = 'button';
        this.footprintBtn.className = 'board-dock-mono-btn board-footprint-btn';
        this.footprintBtn.textContent = '1×1';
        this.footprintBtn.title = 'Vista generale (O) — 1×1 A4';
        this.footprintBtn.addEventListener('click', () => {
            this.closeTrays();
            this._closeOptionsIfOpen();
            if (this.onToggleOverview) this.onToggleOverview();
        });

        this.zoomBtn = document.createElement('button');
        this.zoomBtn.type = 'button';
        this.zoomBtn.className = 'board-dock-mono-btn board-zoom-btn';
        this.zoomBtn.hidden = true;
        this.zoomBtn.textContent = '100%';
        this.zoomBtn.title = 'Torna allo zoom di scrittura (100%)';
        this.zoomBtn.addEventListener('click', () => {
            if (this.onResetZoom) this.onResetZoom();
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
            this.footprintBtn,
            this.zoomBtn,
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

    /**
     * Pen tray — matches the exact single-row height, dividers, borderless buttons,
     * and minimal 12px color dots of the bottom bar.
     */
    _buildPenTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-pen-tray';
        tray.hidden = true;

        // Extended + primary 10 colors in the exact same minimal dot style as the dock
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

        // 3 stroke styles (solid, dashed, dotted)
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

        // 4 world stroke sizes
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
            const dotPx = 3.5 + i * 3;
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

    /**
     * Eraser tray — exact same single-row height & minimal style as the bottom bar.
     */
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

    /**
     * Highlighter tray — exact same single-row height & minimal color dots as the bottom bar.
     */
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
