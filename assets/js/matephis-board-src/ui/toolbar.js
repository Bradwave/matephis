/**
 * Matephis Board chrome: two groups that are laid out per device.
 *
 * - Tool rail (`.board-rail`): Minimal toggle, Options | Pen, Highlighter, Eraser, Lasso, Laser,
 *   Insert (+) | 5 quick colours | Undo / Redo.
 *   On touch screens ("rail" layout) it is a 2-column vertical rail on the side where the
 *   teacher stands (right by default; moved from the quick menu or Options), low enough to reach on a wall board.
 *   With a mouse ("bar" layout) the same groups form one horizontal bottom bar.
 * - Navigation pill (`.board-nav`): pages ‹ 1/N › + | zoom % | overview footprint | Pin | Cloud.
 *   Bottom-centre in the rail layout, part of the single bottom bar in the bar layout.
 *
 * Minimal mode (`toolbarMinimal`) keeps only pen, quick colours, eraser and undo/redo.
 * Trays (pen, eraser, highlighter, lasso, shapes, connectors, insert, pin) and the popovers
 * opened from the chrome are placed next to their trigger by `placeFloating()`.
 * Every size derives from the `--bu` CSS token (see matephis-board.css).
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
import { clearFloating, placeFloating } from './floating.js';

const INSERT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"/></svg>';
const SIDE_TAB_ICON = (edge) => (edge === 'left'
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4v16M19 12H9M13 8l-4 4 4 4"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 4v16M5 12h10M11 8l4 4-4 4"/></svg>');
const MINIMIZE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M3 21l7-7M20 10h-6V4M21 3l-7 7"/></svg>';
const EXPAND_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/></svg>';

export class BoardToolbar {
    constructor(hostEl, {
        getTheme,
        getSettings,
        onSettingChange,
        onToolChange,
        onUndo,
        onRedo,
        onPinTop,
        onPinLeft,
        onToggleOverview,
        onToggleOptions,
        onToggleFuturePopover,
        onResetZoom,
        onPrevPage,
        onNextPage,
        onAddPage,
    }) {
        this.hostEl = hostEl;
        this.getTheme = getTheme;
        this.getSettings = getSettings || (() => ({}));
        this.onSettingChange = onSettingChange;
        this.onToolChange = onToolChange;
        this.onUndo = onUndo;
        this.onRedo = onRedo;
        this.onPinTop = onPinTop;
        this.onPinLeft = onPinLeft;
        this.onToggleOverview = onToggleOverview;
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
            eraserRadius: ERASER_SIZES[2].radius,
            eraserMode: 'partial', // 'partial' | 'stroke'
            highlighterColor: HIGHLIGHTER_COLORS[0].id,
            highlighterWidth: HIGHLIGHTER_SIZES[1].width,
        };

        this.layout = 'bar';  // 'rail' | 'bar'
        this.side = 'right';  // rail side: 'right' | 'left'
        // null | 'pen' | 'eraser' | 'highlighter' | 'lasso' | 'shapes' | 'connectors' | 'insert' | 'pin'
        this.openTray = null;
        this.activeFuturePopover = null; // null | 'plot' | 'diagrams' | 'exercises' | 'cloud'
        this.anchoredPopover = null;     // { el, name } of the open popover, re-placed on relayout
        this.overviewActive = false;

        this._buildDOM();
        this.relayout();
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
        const insertOpen = this.activeFuturePopover === 'plot'
            || this.activeFuturePopover === 'diagrams'
            || this.activeFuturePopover === 'exercises';
        this.insertBtn.classList.toggle('active', insertOpen || this.openTray === 'insert'
            || this.openTray === 'shapes' || this.openTray === 'connectors');
        this.cloudBtn.classList.toggle('active', this.activeFuturePopover === 'cloud');
        this._syncPressed();
    }

    /** Trigger element a popover should be anchored to. */
    getPopoverAnchor(name) {
        if (name === 'options') return this.optionsBtn;
        if (name === 'cloud') return this.cloudBtn;
        return this.insertBtn; // plot, diagrams, exercises
    }

    /**
     * Place an open popover next to its trigger (or clear placement for side sheets).
     * Pass `el = null` when the popover closes.
     */
    anchorPopover(el, name) {
        if (!el || el.hidden) {
            this.anchoredPopover = null;
            this.optionsBtn.classList.toggle('active', false);
            this._syncPressed();
            return;
        }
        this.anchoredPopover = { el, name };
        this.optionsBtn.classList.toggle('active', name === 'options');
        this._syncPressed();
        this._placePopover();
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
        this.footprintBtn.setAttribute('aria-pressed', String(this.overviewActive));
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

    /** Quick-menu actions (two-finger tap). */
    setPenColor(id) {
        this.state.penColor = id;
        this.selectTool('pen');
    }

    cyclePenStyle() {
        const ids = PEN_STYLES.map((s) => s.id);
        this.state.penStyle = ids[(ids.indexOf(this.state.penStyle) + 1) % ids.length];
        this.selectTool('pen');
    }

    /** Move the side rail to 'left' or 'right' (only meaningful in the rail layout). */
    setSide(side) {
        if (this.onSettingChange) this.onSettingChange('toolbarSide', side);
        this.relayout();
    }

    /**
     * Re-read layout settings and viewport, then re-place whatever is open.
     * Called on construction, on resize and when a layout setting changes.
     */
    relayout() {
        const s = this.getSettings() || {};
        let mode = s.toolbarLayout;
        if (mode !== 'rail' && mode !== 'bar') {
            const coarse = window.matchMedia && window.matchMedia('(any-pointer: coarse)').matches;
            mode = coarse && window.innerWidth >= 700 && window.innerHeight >= 500 ? 'rail' : 'bar';
        }
        this.layout = mode;
        this.side = s.toolbarSide === 'left' ? 'left' : 'right';

        const root = this.hostEl;
        root.classList.toggle('is-rail', mode === 'rail');
        root.classList.toggle('is-bar', mode === 'bar');
        root.classList.toggle('is-side-left', this.side === 'left');
        root.classList.toggle('is-side-right', this.side === 'right');
        root.dataset.uiSize = s.uiSize === 's' || s.uiSize === 'l' ? s.uiSize : 'm';

        this.minimal = !!s.toolbarMinimal;
        root.classList.toggle('is-minimal', this.minimal);
        this.minimalBtn.innerHTML = this.minimal ? EXPAND_ICON : MINIMIZE_ICON;
        this.minimalBtn.title = this.minimal
            ? 'Mostra la barra completa'
            : 'Barra essenziale: solo penna, colori, gomma e annulla';
        this.minimalBtn.setAttribute('aria-label', this.minimalBtn.title);
        this.minimalBtn.setAttribute('aria-pressed', String(this.minimal));

        // Tab on the opposite edge: one tap brings the rail to that side.
        const other = this.side === 'right' ? 'left' : 'right';
        this.sideTabEl.innerHTML = SIDE_TAB_ICON(other);
        this.sideTabEl.title = other === 'left' ? 'Porta qui la barra (sinistra)' : 'Porta qui la barra (destra)';
        this.sideTabEl.setAttribute('aria-label', this.sideTabEl.title);

        this.railEl.setAttribute('aria-orientation', mode === 'rail' ? 'vertical' : 'horizontal');
        this._placeTray();
        this._placePopover();
    }

    /**
     * Essential toolbar: pen + quick colours, eraser, undo/redo and the toggle back.
     * Leaving a tool that is hidden in this mode falls back to the pen.
     */
    setMinimal(on) {
        if (on && this.state.tool !== 'pen' && this.state.tool !== 'eraser') {
            this.state.tool = 'pen';
            if (this.onToolChange) this.onToolChange(this.state);
        }
        this.openTray = null;
        this._closePopovers();
        if (this.onSettingChange) this.onSettingChange('toolbarMinimal', !!on);
        this.render();
        this.relayout();
    }

    _buildDOM() {
        const stop = (e) => e.stopPropagation();

        // Wrapper: one bottom bar in the "bar" layout, `display: contents` in the "rail" layout.
        this.chromeEl = document.createElement('div');
        this.chromeEl.className = 'board-chrome';
        this.chromeEl.addEventListener('pointerdown', stop);

        // ---------- Navigation pill ----------
        this.navEl = document.createElement('div');
        this.navEl.className = 'board-nav';
        this.navEl.setAttribute('role', 'toolbar');
        this.navEl.setAttribute('aria-label', 'Pagine e vista');

        this.pageNavEl = document.createElement('div');
        this.pageNavEl.className = 'board-page-nav';
        this.pageNavEl.innerHTML = `
            <button type="button" class="board-page-btn board-page-prev" title="Pagina precedente (PageUp)" aria-label="Pagina precedente">${BoardIcons.chevronLeft}</button>
            <span class="board-page-indicator" aria-live="polite">1/1</span>
            <button type="button" class="board-page-btn board-page-next" title="Pagina successiva (PageDown)" aria-label="Pagina successiva">${BoardIcons.chevronRight}</button>
            <button type="button" class="board-page-btn board-page-add" title="Nuova pagina" aria-label="Nuova pagina">${BoardIcons.add}</button>
        `;
        this.prevPageBtn = this.pageNavEl.querySelector('.board-page-prev');
        this.nextPageBtn = this.pageNavEl.querySelector('.board-page-next');
        this.addPageBtn = this.pageNavEl.querySelector('.board-page-add');
        this.pageIndicatorEl = this.pageNavEl.querySelector('.board-page-indicator');
        this.prevPageBtn.addEventListener('click', () => { if (this.onPrevPage) this.onPrevPage(); });
        this.nextPageBtn.addEventListener('click', () => { if (this.onNextPage) this.onNextPage(); });
        this.addPageBtn.addEventListener('click', () => { if (this.onAddPage) this.onAddPage(); });

        this.zoomBtn = document.createElement('button');
        this.zoomBtn.type = 'button';
        this.zoomBtn.className = 'board-dock-mono-btn board-zoom-btn';
        this.zoomBtn.textContent = '100%';
        this.zoomBtn.title = 'Torna allo zoom di scrittura (100%)';
        this.zoomBtn.addEventListener('click', () => {
            if (this.onResetZoom) this.onResetZoom();
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

        this.pinBtn = this._makeToolBtn('Fissa un riferimento (in alto o a sinistra)', BoardIcons.pinTop, () => {
            this._toggleTray('pin');
        });
        this.pinBtn.classList.add('board-pin-btn');

        this.cloudBtn = this._makeToolBtn('Sessione cloud QR / R2 (in arrivo)', BoardIcons.cloud, () => {
            this.closeTrays();
            if (this.onToggleFuturePopover) this.onToggleFuturePopover('cloud');
        }, true);

        this.navEl.append(
            this.pageNavEl,
            this._makeDivider(),
            this.zoomBtn,
            this.footprintBtn,
            this.pinBtn,
            this._makeDivider(),
            this.cloudBtn
        );

        // ---------- Tool rail ----------
        this.railEl = document.createElement('div');
        this.railEl.className = 'board-rail';
        this.railEl.setAttribute('role', 'toolbar');
        this.railEl.setAttribute('aria-label', 'Strumenti');

        // System group: minimal toggle + options (top of the rail: least used)
        this.optionsBtn = this._makeToolBtn('Opzioni lavagna', BoardIcons.tune, () => {
            this.closeTrays();
            if (this.onToggleFuturePopover) this.onToggleFuturePopover(null);
            if (this.onToggleOptions) this.onToggleOptions();
        });
        this.minimalBtn = this._makeToolBtn('', MINIMIZE_ICON, () => this.setMinimal(!this.minimal));
        this.minimalBtn.classList.add('board-minimal-btn');
        this.optionsBtn.classList.add('board-full-only');
        const sysGroup = this._makeGroup('is-sys', this.minimalBtn, this.optionsBtn);

        // Drawing tools
        this.penBtn = this._makeToolBtn('Penna (P) — stile, spessore e colori', BoardIcons.pen, () => {
            this._activateToolWithTray('pen');
        });
        this.highlighterBtn = this._makeToolBtn('Evidenziatore (H)', BoardIcons.highlighter, () => {
            this._activateToolWithTray('highlighter');
        });
        this.eraserBtn = this._makeToolBtn('Gomma (E)', BoardIcons.eraser, () => {
            this._activateToolWithTray('eraser');
        });
        this.lassoBtn = this._makeToolBtn('Selezione lazo (in arrivo)', BoardIcons.lasso, () => {
            this._toggleTray('lasso');
        }, true);
        this.laserBtn = this._makeToolBtn('Puntatore laser (L)', BoardIcons.laser, () => {
            this.state.tool = 'laser';
            this.openTray = null;
            this._closePopovers();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });
        this.insertBtn = this._makeToolBtn('Inserisci: forme, connettori, assi, diagrammi, esercizi', INSERT_ICON, () => {
            this._toggleTray('insert');
        });
        this.insertBtn.setAttribute('aria-haspopup', 'true');
        for (const btn of [this.highlighterBtn, this.lassoBtn, this.laserBtn, this.insertBtn]) {
            btn.classList.add('board-full-only');
        }
        const toolsGroup = this._makeGroup('is-tools',
            this.penBtn, this.highlighterBtn,
            this.eraserBtn, this.lassoBtn,
            this.laserBtn, this.insertBtn);

        // Quick colours
        this.quickSwatchBtns = [];
        const colorsGroup = this._makeGroup('is-colors');
        colorsGroup.setAttribute('aria-label', 'Colori rapidi');
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
            colorsGroup.appendChild(btn);
        }

        // History (bottom of the rail: closest to the hand)
        this.undoBtn = this._makeToolBtn('Annulla (Ctrl+Z)', BoardIcons.undo, () => {
            if (this.onUndo) this.onUndo();
        });
        this.redoBtn = this._makeToolBtn('Ripristina (Ctrl+Y)', BoardIcons.redo, () => {
            if (this.onRedo) this.onRedo();
        });
        const historyGroup = this._makeGroup('is-history', this.undoBtn, this.redoBtn);

        this.railEl.append(sysGroup, toolsGroup, colorsGroup, historyGroup);
        this.sideTabEl = document.createElement('button');
        this.sideTabEl.type = 'button';
        this.sideTabEl.className = 'board-side-tab';
        this.sideTabEl.addEventListener('pointerdown', stop);
        this.sideTabEl.addEventListener('click', () => {
            this.closeTrays();
            this._closePopovers();
            this.setSide(this.side === 'right' ? 'left' : 'right');
        });

        this.chromeEl.append(this.navEl, this.railEl, this.sideTabEl);
        this.hostEl.appendChild(this.chromeEl);

        // ---------- Trays (fixed, anchored to their trigger) ----------
        this.penTray = this._buildPenTray();
        this.eraserTray = this._buildEraserTray();
        this.highlighterTray = this._buildHighlighterTray();
        this.lassoTray = this._buildLassoTray();
        this.shapesTray = this._buildShapesTray();
        this.connectorsTray = this._buildConnectorsTray();
        this.insertTray = this._buildInsertTray();
        this.pinTray = this._buildPinTray();

        this.trays = {
            pen: { el: this.penTray, anchor: this.penBtn },
            eraser: { el: this.eraserTray, anchor: this.eraserBtn },
            highlighter: { el: this.highlighterTray, anchor: this.highlighterBtn },
            lasso: { el: this.lassoTray, anchor: this.lassoBtn },
            shapes: { el: this.shapesTray, anchor: this.insertBtn },
            connectors: { el: this.connectorsTray, anchor: this.insertBtn },
            insert: { el: this.insertTray, anchor: this.insertBtn },
            pin: { el: this.pinTray, anchor: this.pinBtn },
        };
        for (const { el } of Object.values(this.trays)) {
            el.addEventListener('pointerdown', stop);
            this.hostEl.appendChild(el);
        }
    }

    _activateToolWithTray(tool) {
        if (this.state.tool === tool) {
            this.openTray = this.openTray === tool ? null : tool;
        } else {
            this.state.tool = tool;
            this.openTray = tool;
        }
        this._closePopovers();
        this.render();
        if (this.onToolChange) this.onToolChange(this.state);
    }

    _toggleTray(name) {
        this.openTray = this.openTray === name ? null : name;
        this._closePopovers();
        this.render();
    }

    _closePopovers() {
        if (this.onToggleOptions) this.onToggleOptions(false);
        if (this.onToggleFuturePopover) this.onToggleFuturePopover(null);
    }

    /** Where a floating element opened from `anchor` goes, and which edge it clears. */
    _floatingPlacement(anchor) {
        if (this.layout === 'rail' && this.railEl.contains(anchor)) {
            return { side: this.side === 'right' ? 'left' : 'right', edge: this.railEl };
        }
        if (this.layout === 'rail') return { side: 'top', edge: this.navEl };
        return { side: 'top', edge: this.chromeEl };
    }

    _placeTray() {
        const entry = this.openTray && this.trays && this.trays[this.openTray];
        if (!entry) return;
        const { side, edge } = this._floatingPlacement(entry.anchor);
        placeFloating(entry.el, entry.anchor, side, edge);
    }

    _placePopover() {
        if (!this.anchoredPopover) return;
        const { el, name } = this.anchoredPopover;
        if (el.hidden) { this.anchoredPopover = null; return; }
        if (el.classList.contains('board-sheet')) { clearFloating(el); return; }
        const anchor = this.getPopoverAnchor(name);
        const { side, edge } = this._floatingPlacement(anchor);
        placeFloating(el, anchor, side, edge);
    }

    _makeGroup(modifier, ...children) {
        const g = document.createElement('div');
        g.className = `board-rail-group ${modifier}`;
        g.append(...children);
        return g;
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
        btn.setAttribute('aria-label', name);
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
     * Insert menu: one button for everything that adds content, so the rail does not grow
     * as Phase 2 engines land. Items are stubs that open their preview tray / popover.
     */
    _buildInsertTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-insert-tray';
        tray.hidden = true;
        const items = [
            { id: 'shapes', label: 'Forme', icon: BoardIcons.shapes, stub: true },
            { id: 'connectors', label: 'Connettori', icon: BoardIcons.connector, stub: true },
            { id: 'plot', label: 'Assi e grafici', icon: BoardIcons.axes, stub: false },
            { id: 'diagrams', label: 'Diagrammi', icon: BoardIcons.diagram, stub: false },
            { id: 'exercises', label: 'Esercizio', icon: BoardIcons.exercise, stub: false },
        ];
        const grid = document.createElement('div');
        grid.className = 'board-insert-grid';
        for (const it of items) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = it.stub ? 'board-insert-item is-stub' : 'board-insert-item';
            btn.title = it.stub ? `${it.label} (in arrivo)` : it.label;
            btn.innerHTML = `${it.icon}<span>${it.label}</span>`;
            btn.addEventListener('click', () => {
                if (it.id === 'shapes' || it.id === 'connectors') {
                    this.openTray = it.id;
                    this._closePopovers();
                    this.render();
                } else {
                    this.openTray = null;
                    this.render();
                    if (this.onToggleFuturePopover) this.onToggleFuturePopover(it.id);
                }
            });
            grid.appendChild(btn);
        }
        tray.appendChild(grid);
        return tray;
    }

    _buildPinTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-pin-tray';
        tray.hidden = true;
        const group = document.createElement('div');
        group.className = 'board-tray-group';
        for (const it of [
            { label: 'In alto', title: 'Fissa in alto e scorri sotto', icon: BoardIcons.pinTop, fn: () => this.onPinTop && this.onPinTop() },
            { label: 'A sinistra', title: 'Fissa a sinistra e scorri a destra', icon: BoardIcons.pinLeft, fn: () => this.onPinLeft && this.onPinLeft() },
        ]) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn board-tray-text-btn board-tray-icon-text';
            btn.title = it.title;
            btn.innerHTML = `${it.icon}<span>${it.label}</span>`;
            btn.addEventListener('click', () => {
                this.closeTrays();
                this._closePopovers();
                it.fn();
            });
            group.appendChild(btn);
        }
        tray.appendChild(group);
        return tray;
    }

    _buildPenTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-pen-tray';
        tray.hidden = true;

        // Compact panel (colours 5×2, sizes, styles stacked) instead of one long strip,
        // so every option stays within a short reach of the pen button.
        const colorsWrap = document.createElement('div');
        colorsWrap.className = 'board-pen-section is-colors';
        this.penTraySwatches = [];
        for (let i = 0; i < PEN_COLORS.length; i++) {
            const c = PEN_COLORS[i];
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
        stylesWrap.className = 'board-pen-section is-styles';
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
            btn.innerHTML = `<svg viewBox="0 0 28 10" class="board-style-svg"><line x1="2" y1="5" x2="26" y2="5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ${dashAttr}/></svg>`;
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
        sizesWrap.className = 'board-pen-section is-sizes';
        this.penSizeBtns = [];
        for (let i = 0; i < PEN_SIZES.length; i++) {
            const sz = PEN_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn';
            btn.title = `${sz.label} (${sz.width} mm)`;
            btn.dataset.sizeWidth = String(sz.width);
            const dotPx = 3 + i * 2.2;
            btn.innerHTML = `<span class="board-size-dot" style="--d:${(dotPx / 34).toFixed(3)};"></span>`;
            btn.addEventListener('click', () => {
                this.state.penWidth = sz.width;
                this.state.tool = 'pen';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.penSizeBtns.push(btn);
            sizesWrap.appendChild(btn);
        }

        tray.append(colorsWrap, sizesWrap, stylesWrap);
        return tray;
    }

    _buildEraserTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-stack-tray board-eraser-tray';
        tray.hidden = true;

        const sizesWrap = document.createElement('div');
        sizesWrap.className = 'board-stack-section';
        this.eraserSizeBtns = [];
        for (let i = 0; i < ERASER_SIZES.length; i++) {
            const sz = ERASER_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn';
            btn.title = `Gomma ${sz.label}`;
            btn.dataset.eraserRadius = String(sz.radius);
            const dotPx = 3 + i * 4.5;
            btn.innerHTML = `<span class="board-eraser-dot" style="--d:${(dotPx / 34).toFixed(3)};"></span>`;
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
        modeWrap.className = 'board-stack-section';
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

        tray.append(sizesWrap, modeWrap);
        return tray;
    }

    _buildHighlighterTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-stack-tray board-highlighter-tray';
        tray.hidden = true;

        const colorsWrap = document.createElement('div');
        colorsWrap.className = 'board-stack-section';
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
        sizesWrap.className = 'board-stack-section';
        this.hlSizeBtns = [];
        for (let i = 0; i < HIGHLIGHTER_SIZES.length; i++) {
            const sz = HIGHLIGHTER_SIZES[i];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn';
            btn.title = sz.label;
            btn.dataset.hlWidth = String(sz.width);
            const hPx = 5 + i * 3.5;
            btn.innerHTML = `<span class="board-hl-bar" style="--d:${(hPx / 34).toFixed(3)};"></span>`;
            btn.addEventListener('click', () => {
                this.state.highlighterWidth = sz.width;
                this.state.tool = 'highlighter';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.hlSizeBtns.push(btn);
            sizesWrap.appendChild(btn);
        }

        tray.append(colorsWrap, sizesWrap);
        return tray;
    }

    /**
     * Phase 2 stub tray: Lasso / Rectangle selection & actions.
     */
    _buildLassoTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-stack-tray board-lasso-tray';
        tray.hidden = true;
        tray.innerHTML = `
            <div class="board-stack-section">
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Lazo</button>
                <button type="button" class="board-tray-btn board-tray-text-btn is-stub">Rettangolo</button>
            </div>
            <div class="board-stack-section">
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
                    <svg viewBox="0 0 20 20" class="board-shape-svg"><line x1="3" y1="17" x2="17" y2="3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </button>
                <button type="button" class="board-tray-btn is-stub" title="Vettore / Freccia (in arrivo)">
                    <svg viewBox="0 0 20 20" class="board-shape-svg"><line x1="3" y1="17" x2="16" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><polyline points="9,4 16,4 16,11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="board-tray-btn is-stub" title="Rettangolo (in arrivo)">
                    <svg viewBox="0 0 20 20" class="board-shape-svg"><rect x="3" y="4.5" width="14" height="11" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                </button>
                <button type="button" class="board-tray-btn is-stub" title="Cerchio / Ellisse (in arrivo)">
                    <svg viewBox="0 0 20 20" class="board-shape-svg"><circle cx="10" cy="10" r="6.8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                </button>
                <button type="button" class="board-tray-btn is-stub" title="Triangolo (in arrivo)">
                    <svg viewBox="0 0 20 20" class="board-shape-svg"><polygon points="10,3.5 17,16.5 3,16.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
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
        for (const [name, { el }] of Object.entries(this.trays)) {
            const open = this.openTray === name;
            if (!open && !el.hidden) clearFloating(el);
            el.hidden = !open;
        }
        this.lassoBtn.classList.toggle('active', this.openTray === 'lasso');
        this.pinBtn.classList.toggle('active', this.openTray === 'pin');
        this.setActiveFuturePopover(this.activeFuturePopover);
        this._placeTray();
    }

    /** Mirror visual state into ARIA so screen readers and tests can read it. */
    _syncPressed() {
        const toggles = [
            this.penBtn, this.highlighterBtn, this.eraserBtn, this.laserBtn, this.lassoBtn,
            this.insertBtn, this.pinBtn, this.optionsBtn, this.cloudBtn,
        ];
        for (const btn of toggles) {
            btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
        }
        this.insertBtn.setAttribute('aria-expanded', String(this.openTray === 'insert'));
        this.pinBtn.setAttribute('aria-expanded', String(this.openTray === 'pin'));
    }

    render() {
        const theme = this.getTheme();

        this.penBtn.classList.toggle('active', this.state.tool === 'pen');
        this.eraserBtn.classList.toggle('active', this.state.tool === 'eraser');
        this.highlighterBtn.classList.toggle('active', this.state.tool === 'highlighter');
        this.laserBtn.classList.toggle('active', this.state.tool === 'laser');

        for (const btn of [...this.quickSwatchBtns, ...this.penTraySwatches]) {
            const id = Number(btn.dataset.colorId);
            const active = this.state.tool === 'pen' && this.state.penColor === id;
            btn.style.setProperty('--swatch-color', resolveInkColor(id, theme));
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
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
        this._syncPressed();
    }
}
