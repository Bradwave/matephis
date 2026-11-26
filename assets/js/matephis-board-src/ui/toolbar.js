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

/** Preview of a pen line style, shared by the pen tray and the toolbar's style button. */
function lineStyleSvg(styleId) {
    const dashAttr = styleId === 'dashed'
        ? 'stroke-dasharray="5 3.5"'
        : styleId === 'dotted'
            ? 'stroke-dasharray="0.5 4.5"'
            : '';
    return `<svg viewBox="0 0 28 10" class="board-style-svg"><line x1="2" y1="5" x2="26" y2="5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ${dashAttr}/></svg>`;
}

export class BoardToolbar {
    constructor(hostEl, {
        getTheme,
        getSettings,
        onSettingChange,
        onToolChange,
        onLassoAction = null,
        onUndo,
        onRedo,
        onPinTop,
        onPinLeft,
        onToggleOverview,
        onToggleOptions,
        onToggleFuturePopover,
        onResetZoom,
        onZoomStep = null,
        onPrevPage,
        onNextPage,
        onAddPage,
        onSelectOpenConnector = null,
    }) {
        this.hostEl = hostEl;
        this.getTheme = getTheme;
        this.getSettings = getSettings || (() => ({}));
        this.onSettingChange = onSettingChange;
        this.onToolChange = onToolChange;
        this.onLassoAction = onLassoAction;
        this.onUndo = onUndo;
        this.onRedo = onRedo;
        this.onPinTop = onPinTop;
        this.onPinLeft = onPinLeft;
        this.onToggleOverview = onToggleOverview;
        this.onToggleOptions = onToggleOptions;
        this.onToggleFuturePopover = onToggleFuturePopover;
        this.onResetZoom = onResetZoom;
        this.onZoomStep = onZoomStep;
        this.onPrevPage = onPrevPage;
        this.onNextPage = onNextPage;
        this.onAddPage = onAddPage;
        this.onSelectOpenConnector = onSelectOpenConnector;

        this.state = {
            tool: 'pen',           // 'pen' | 'eraser' | 'highlighter' | 'laser' | 'lasso' | 'shape' | 'connector'
            penColor: 0,
            penWidth: PEN_SIZES[1].width,
            penStyle: 'solid',     // 'solid' | 'dashed' | 'dotted'
            eraserRadius: ERASER_SIZES[2].radius,
            eraserMode: 'partial', // 'partial' | 'stroke'
            highlighterColor: HIGHLIGHTER_COLORS[0].id,
            highlighterWidth: HIGHLIGHTER_SIZES[1].width,
            lassoMode: 'lasso',    // 'lasso' | 'rect'
            shapeKind: 'line',     // 'line' | 'arrow' | 'rect' | 'ellipse' | 'triangle'
            connectorSeries: 'alpha', // 'alpha' | 'num'
            connectorMode: 'new',     // 'new' | 'link'
        };
        this._lassoSelectionCount = 0;
        this.connectorPendingLabel = null;
        this.connectorPendingPairId = null;
        this.connectorOpenPairs = [];

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
        this.insertBtn.classList.toggle('active', this.state.tool === 'shape'
            || this.state.tool === 'connector'
            || insertOpen || this.openTray === 'insert'
            || this.openTray === 'shapes' || this.openTray === 'connectors');
        this.cloudBtn.classList.toggle('active', this.activeFuturePopover === 'cloud');
        this._syncPressed();
    }

    setLassoSelectionCount(count) {
        this._lassoSelectionCount = Math.max(0, Number(count) || 0);
        if (!this.lassoActionBtns) return;
        for (const btn of this.lassoActionBtns) {
            btn.disabled = this._lassoSelectionCount === 0;
        }
    }

    setConnectorState({ mode = null, pendingPair = null, openConnectors = null, activateTool = false } = {}) {
        if (mode === 'new' || mode === 'link') {
            this.state.connectorMode = mode;
        }
        this.connectorPendingLabel = pendingPair ? pendingPair.label : null;
        this.connectorPendingPairId = pendingPair ? pendingPair.pairId : null;
        if (Array.isArray(openConnectors)) {
            this.connectorOpenPairs = openConnectors;
        }
        if (activateTool) {
            this.state.tool = 'connector';
            if (pendingPair && (pendingPair.series === 'alpha' || pendingPair.series === 'num')) {
                this.state.connectorSeries = pendingPair.series;
            }
            this._closePopovers();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
            return;
        }
        this.render();
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
        const locked = Boolean((this.getSettings() || {}).zoomLock);
        if (this.zoomPctEl) this.zoomPctEl.textContent = `${pct}%`;
        else this.zoomBtn.textContent = `${pct}%`;
        this.zoomBtn.classList.toggle('is-zoomed', Math.abs(pct - 100) >= 4);
        this.zoomBtn.classList.toggle('is-zoom-locked', locked);
        this.zoomBtn.title = locked
            ? `Zoom bloccato (${pct}%) — apri controlli zoom`
            : `Zoom (${pct}%) — apri controlli zoom`;
        this._syncZoomTray();
    }

    selectTool(tool, openTray = false) {
        this.state.tool = tool;
        if (openTray && (tool === 'pen' || tool === 'eraser' || tool === 'highlighter' || tool === 'lasso')) {
            this.openTray = tool;
        } else if (openTray && tool === 'connector') {
            this.openTray = 'connectors';
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
        this._markLineStarts();
        this._placeTray();
        this._placePopover();
    }

    /**
     * In the wrapped bar, hide the separator of a group (or a nav divider) that
     * starts or ends a row: a separator belongs between two things on the same row.
     */
    _markLineStarts() {
        if (!this.chromeEl) return;
        const groups = Array.from(this.railEl.children).filter((el) => el.classList.contains('board-rail-group'));
        const dividers = Array.from(this.navEl.querySelectorAll('.board-dock-sep'));
        for (const el of [...groups, ...dividers]) {
            el.classList.remove('is-line-start', 'is-line-edge');
        }
        this.chromeEl.classList.remove('is-wrapped');
        if (this.layout !== 'bar') {
            this.hostEl.style.removeProperty('--board-bar-h');
            return;
        }

        // Too wide for one row? Then undo/redo moves up next to the navigation, and tools,
        // colours and the system buttons fill the next row: two rows instead of three.
        const parts = [this.navEl, ...groups].filter((el) => el.offsetParent !== null);
        const cs = getComputedStyle(this.chromeEl);
        const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 2;
        const maxW = Math.min(window.innerWidth - 24, parseFloat(cs.maxWidth) || Infinity) - pad;
        const oneRow = parts.reduce((sum, el) => {
            const m = getComputedStyle(el);
            return sum + el.getBoundingClientRect().width + parseFloat(m.marginLeft) + parseFloat(m.marginRight) + 2;
        }, 0);
        this.chromeEl.classList.toggle('is-wrapped', oneRow > maxW);
        // Side sheets stop above the bar, however many rows it has.
        this.hostEl.style.setProperty('--board-bar-h', `${Math.ceil(this.chromeEl.getBoundingClientRect().height)}px`);

        // Everything that sits in the bar's rows, with its box.
        const items = [this.navEl, ...groups]
            .filter((el) => el.offsetParent !== null)
            .map((el) => ({ el, r: el.getBoundingClientRect() }));
        const sameRow = (a, b) => Math.abs(a.top - b.top) < 4 || (a.top < b.bottom - 4 && b.top < a.bottom - 4);
        for (const it of items) {
            if (!it.el.classList.contains('board-rail-group')) continue;
            const hasLeftNeighbour = items.some((o) => o !== it && sameRow(o.r, it.r) && o.r.right <= it.r.left + 1);
            if (!hasLeftNeighbour) it.el.classList.add('is-line-start');
        }

        // Nav dividers: hidden when first or last on their row inside the nav.
        const navKids = Array.from(this.navEl.children)
            .filter((el) => el.offsetParent !== null)
            .map((el) => ({ el, r: el.getBoundingClientRect() }));
        for (const d of navKids) {
            if (!d.el.classList.contains('board-dock-sep')) continue;
            const row = navKids.filter((o) => o !== d && !o.el.classList.contains('board-dock-sep') && sameRow(o.r, d.r));
            const left = row.some((o) => o.r.right <= d.r.left + 1);
            const right = row.some((o) => o.r.left >= d.r.right - 1);
            if (!left || !right) d.el.classList.add('is-line-edge');
        }
    }

    /**
     * Essential toolbar: pen + quick colours, eraser, undo/redo and the toggle back.
     * Leaving a tool that is hidden in this mode falls back to the pen.
     */
    setMinimal(on) {
        if (on && this.state.tool !== 'pen' && this.state.tool !== 'eraser' && this.state.tool !== 'pan') {
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
        this.zoomBtn.innerHTML = `<span class="board-zoom-lock-icon" aria-hidden="true">${BoardIcons.lock}</span><span class="board-zoom-pct">100%</span>`;
        this.zoomPctEl = this.zoomBtn.querySelector('.board-zoom-pct');
        this.zoomBtn.title = 'Zoom (100%) — apri controlli zoom';
        this.zoomBtn.setAttribute('aria-haspopup', 'true');
        this.zoomBtn.addEventListener('click', () => {
            this._toggleTray('zoom');
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
        // Options stay in the compact bar too: settings must be reachable in every layout.
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
        this.lassoBtn = this._makeToolBtn('Selezione lazo', BoardIcons.lasso, () => {
            this._activateToolWithTray('lasso');
        });
        this.panBtn = this._makeToolBtn('Sposta lavagna (M · Spazio)', BoardIcons.pan, () => {
            this.state.tool = 'pan';
            this.openTray = null;
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
            this.panBtn, this.laserBtn,
            this.insertBtn);

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

        // Line style one tap away: each tap moves to the next style (continua → tratteggiata
        // → punteggiata) and picks the pen. The pen tray still lists all three.
        this.lineStyleBtn = document.createElement('button');
        this.lineStyleBtn.type = 'button';
        this.lineStyleBtn.className = 'board-tool-btn board-line-style-btn';
        this.lineStyleBtn.addEventListener('click', () => {
            const i = PEN_STYLES.findIndex((st) => st.id === this.state.penStyle);
            this.state.penStyle = PEN_STYLES[(i + 1) % PEN_STYLES.length].id;
            this.state.tool = 'pen';
            this.openTray = null;
            this._closePopovers();
            this.render();
            if (this.onToolChange) this.onToolChange(this.state);
        });
        colorsGroup.appendChild(this.lineStyleBtn);

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
        // Rows change when the bar wraps differently (resize, minimal mode, UI size).
        if (typeof ResizeObserver === 'function') {
            let raf = 0;
            new ResizeObserver(() => {
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => this._markLineStarts());
            }).observe(this.chromeEl);
        }

        // ---------- Trays (fixed, anchored to their trigger) ----------
        this.penTray = this._buildPenTray();
        this.eraserTray = this._buildEraserTray();
        this.highlighterTray = this._buildHighlighterTray();
        this.lassoTray = this._buildLassoTray();
        this.shapesTray = this._buildShapesTray();
        this.connectorsTray = this._buildConnectorsTray();
        this.insertTray = this._buildInsertTray();
        this.pinTray = this._buildPinTray();
        this.zoomTray = this._buildZoomTray();

        this.trays = {
            pen: { el: this.penTray, anchor: this.penBtn },
            eraser: { el: this.eraserTray, anchor: this.eraserBtn },
            highlighter: { el: this.highlighterTray, anchor: this.highlighterBtn },
            lasso: { el: this.lassoTray, anchor: this.lassoBtn },
            shapes: { el: this.shapesTray, anchor: this.insertBtn },
            connectors: { el: this.connectorsTray, anchor: this.insertBtn },
            insert: { el: this.insertTray, anchor: this.insertBtn },
            pin: { el: this.pinTray, anchor: this.pinBtn },
            zoom: { el: this.zoomTray, anchor: this.zoomBtn },
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
            { id: 'shapes', label: 'Forme', icon: BoardIcons.shapes, stub: false },
            { id: 'connectors', label: 'Connettori', icon: BoardIcons.connector, stub: false },
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
                if (it.id === 'shapes') {
                    this.state.tool = 'shape';
                    this.openTray = 'shapes';
                    this._closePopovers();
                    this.render();
                    if (this.onToolChange) this.onToolChange(this.state);
                } else if (it.id === 'connectors') {
                    this.state.tool = 'connector';
                    this.openTray = 'connectors';
                    this._closePopovers();
                    this.render();
                    if (this.onToolChange) this.onToolChange(this.state);
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

    _buildZoomTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-zoom-tray';
        tray.hidden = true;

        const group = document.createElement('div');
        group.className = 'board-tray-group';

        const outBtn = document.createElement('button');
        outBtn.type = 'button';
        outBtn.className = 'board-tray-btn';
        outBtn.title = 'Zoom indietro';
        outBtn.setAttribute('aria-label', 'Zoom indietro');
        outBtn.innerHTML = BoardIcons.remove;
        outBtn.addEventListener('click', () => {
            if (this.onZoomStep) this.onZoomStep(-1);
        });

        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'board-tray-btn board-tray-text-btn';
        resetBtn.textContent = '100%';
        resetBtn.title = 'Torna allo zoom di scrittura (100%)';
        resetBtn.addEventListener('click', () => {
            if (this.onResetZoom) this.onResetZoom();
            this.closeTrays();
        });

        const inBtn = document.createElement('button');
        inBtn.type = 'button';
        inBtn.className = 'board-tray-btn';
        inBtn.title = 'Zoom avanti';
        inBtn.setAttribute('aria-label', 'Zoom avanti');
        inBtn.innerHTML = BoardIcons.add;
        inBtn.addEventListener('click', () => {
            if (this.onZoomStep) this.onZoomStep(1);
        });

        const lockBtn = document.createElement('button');
        lockBtn.type = 'button';
        lockBtn.className = 'board-tray-btn board-tray-text-btn board-tray-icon-text';
        lockBtn.addEventListener('click', () => {
            const next = !Boolean((this.getSettings() || {}).zoomLock);
            if (this.onSettingChange) this.onSettingChange('zoomLock', next);
            this._syncZoomTray();
            this.render();
        });
        this.zoomLockBtn = lockBtn;

        group.append(outBtn, resetBtn, inBtn, this._makeDivider(), lockBtn);
        tray.appendChild(group);
        this._syncZoomTray();
        return tray;
    }

    _syncZoomTray() {
        if (!this.zoomLockBtn) return;
        const locked = Boolean((this.getSettings() || {}).zoomLock);
        this.zoomLockBtn.innerHTML = `${locked ? BoardIcons.lock : BoardIcons.lockOpen}<span>Blocca</span>`;
        this.zoomLockBtn.title = locked
            ? 'Zoom bloccato: 2 dita spostano soltanto (clicca per sbloccare)'
            : 'Blocca lo zoom: 2 dita spostano soltanto senza zoomare';
        this.zoomLockBtn.classList.toggle('active', locked);
        this.zoomLockBtn.setAttribute('aria-pressed', String(locked));
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
            btn.innerHTML = lineStyleSvg(st.id);
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
     * Lasso / Rectangle selection & actions tray.
     */
    _buildLassoTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-stack-tray board-lasso-tray';
        tray.hidden = true;

        const modeWrap = document.createElement('div');
        modeWrap.className = 'board-stack-section';
        this.lassoModeBtns = [];
        for (const m of [
            { id: 'lasso', label: 'Lazo', title: 'Selezione a mano libera' },
            { id: 'rect', label: 'Rettangolo', title: 'Selezione rettangolare' },
        ]) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn board-tray-text-btn';
            btn.textContent = m.label;
            btn.title = m.title;
            btn.dataset.lassoMode = m.id;
            btn.addEventListener('click', () => {
                this.state.lassoMode = m.id;
                this.state.tool = 'lasso';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.lassoModeBtns.push(btn);
            modeWrap.appendChild(btn);
        }

        const actionWrap = document.createElement('div');
        actionWrap.className = 'board-stack-section';
        this.lassoActionBtns = [];
        for (const act of [
            { id: 'duplicate', label: 'Duplica', title: 'Duplica selezione' },
            { id: 'recolor', label: 'Ricolora', title: 'Ricolora con il colore penna corrente' },
            { id: 'delete', label: 'Elimina', title: 'Elimina selezione' },
        ]) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn board-tray-text-btn';
            btn.textContent = act.label;
            btn.title = act.title;
            btn.dataset.lassoAction = act.id;
            btn.disabled = this._lassoSelectionCount === 0;
            btn.addEventListener('click', () => {
                if (this.onLassoAction) this.onLassoAction(act.id, this.state);
            });
            this.lassoActionBtns.push(btn);
            actionWrap.appendChild(btn);
        }

        tray.append(modeWrap, actionWrap);
        return tray;
    }

    /**
     * Basic geometry shapes tray (no hold-to-snap).
     */
    _buildShapesTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-shapes-tray';
        tray.hidden = true;
        const group = document.createElement('div');
        group.className = 'board-tray-group';
        const shapes = [
            {
                id: 'line',
                title: 'Linea',
                svg: '<svg viewBox="0 0 20 20" class="board-shape-svg"><line x1="3" y1="17" x2="17" y2="3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
            },
            {
                id: 'arrow',
                title: 'Vettore / Freccia',
                svg: '<svg viewBox="0 0 20 20" class="board-shape-svg"><line x1="3" y1="17" x2="16" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><polyline points="9,4 16,4 16,11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            },
            {
                id: 'rect',
                title: 'Rettangolo',
                svg: '<svg viewBox="0 0 20 20" class="board-shape-svg"><rect x="3" y="4.5" width="14" height="11" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
            },
            {
                id: 'ellipse',
                title: 'Cerchio / Ellisse',
                svg: '<svg viewBox="0 0 20 20" class="board-shape-svg"><circle cx="10" cy="10" r="6.8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
            },
            {
                id: 'triangle',
                title: 'Triangolo',
                svg: '<svg viewBox="0 0 20 20" class="board-shape-svg"><polygon points="10,3.5 17,16.5 3,16.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
            },
        ];

        this.shapeBtns = [];
        for (const sh of shapes) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-tray-btn';
            btn.title = sh.title;
            btn.setAttribute('aria-label', sh.title);
            btn.dataset.shapeKind = sh.id;
            btn.innerHTML = sh.svg;
            btn.addEventListener('click', () => {
                this.state.shapeKind = sh.id;
                this.state.tool = 'shape';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
            this.shapeBtns.push(btn);
            group.appendChild(btn);
        }

        tray.appendChild(group);
        return tray;
    }

    /**
     * Letter / Number explanation connectors tray.
     */
    _buildConnectorsTray() {
        const tray = document.createElement('div');
        tray.className = 'board-tray board-stack-tray board-connectors-tray';
        tray.hidden = true;
        tray.innerHTML = `
            <div class="board-stack-section">
                <button type="button" class="board-tray-btn board-tray-text-btn" data-conn-series="alpha" title="Etichette con lettere">A B C</button>
                <button type="button" class="board-tray-btn board-tray-text-btn" data-conn-series="num" title="Etichette con numeri">1 2 3</button>
            </div>
            <div class="board-stack-section">
                <button type="button" class="board-tray-btn board-tray-text-btn board-tray-icon-text" data-conn-mode="new" title="Piazza il primo segnaposto di una nuova coppia">${BoardIcons.add}<span>Nuova</span></button>
                <button type="button" class="board-tray-btn board-tray-text-btn board-tray-icon-text" data-conn-mode="link" title="Piazza il gemello di un segnaposto aperto">${BoardIcons.link}<span>Collega</span></button>
            </div>
            <div class="board-conn-hint" data-conn-hint></div>
            <div class="board-conn-open" hidden>
                <div class="board-conn-open-label">Da collegare</div>
                <div class="board-conn-open-list"></div>
            </div>
        `;

        this.connSeriesBtns = Array.from(tray.querySelectorAll('[data-conn-series]'));
        for (const btn of this.connSeriesBtns) {
            btn.addEventListener('click', () => {
                this.state.connectorSeries = btn.dataset.connSeries === 'num' ? 'num' : 'alpha';
                this.state.tool = 'connector';
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
        }

        this.connModeBtns = Array.from(tray.querySelectorAll('[data-conn-mode]'));
        for (const btn of this.connModeBtns) {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.connMode === 'link' ? 'link' : 'new';
                this.state.connectorMode = mode;
                this.state.tool = 'connector';
                if (mode === 'new') {
                    this.connectorPendingLabel = null;
                    this.connectorPendingPairId = null;
                }
                this.render();
                if (this.onToolChange) this.onToolChange(this.state);
            });
        }

        this.connLinkBtn = tray.querySelector('[data-conn-mode="link"]');
        this.connHintEl = tray.querySelector('[data-conn-hint]');
        this.connOpenWrap = tray.querySelector('.board-conn-open');
        this.connOpenList = tray.querySelector('.board-conn-open-list');
        return tray;
    }

    _renderTrays() {
        for (const [name, { el }] of Object.entries(this.trays)) {
            const open = this.openTray === name;
            if (!open && !el.hidden) clearFloating(el);
            el.hidden = !open;
        }
        this.lassoBtn.classList.toggle('active', this.state.tool === 'lasso' || this.openTray === 'lasso');
        this.pinBtn.classList.toggle('active', this.openTray === 'pin');
        this.zoomBtn.classList.toggle('active', this.openTray === 'zoom');
        this.setActiveFuturePopover(this.activeFuturePopover);
        this._placeTray();
    }

    /** Mirror visual state into ARIA so screen readers and tests can read it. */
    _syncPressed() {
        const toggles = [
            this.penBtn, this.highlighterBtn, this.eraserBtn, this.panBtn, this.laserBtn, this.lassoBtn,
            this.insertBtn, this.pinBtn, this.zoomBtn, this.optionsBtn, this.cloudBtn,
        ];
        for (const btn of toggles) {
            btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
        }
        this.insertBtn.setAttribute('aria-expanded', String(this.openTray === 'insert'));
        this.pinBtn.setAttribute('aria-expanded', String(this.openTray === 'pin'));
        this.zoomBtn.setAttribute('aria-expanded', String(this.openTray === 'zoom'));
    }

    render() {
        const theme = this.getTheme();

        this.penBtn.classList.toggle('active', this.state.tool === 'pen');
        this.eraserBtn.classList.toggle('active', this.state.tool === 'eraser');
        this.highlighterBtn.classList.toggle('active', this.state.tool === 'highlighter');
        this.panBtn.classList.toggle('active', this.state.tool === 'pan');
        this.laserBtn.classList.toggle('active', this.state.tool === 'laser');
        this._syncZoomTray();

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
        if (this.lineStyleBtn && this.lineStyleBtn.dataset.styleId !== this.state.penStyle) {
            const st = PEN_STYLES.find((item) => item.id === this.state.penStyle) || PEN_STYLES[0];
            const next = PEN_STYLES[(PEN_STYLES.indexOf(st) + 1) % PEN_STYLES.length];
            this.lineStyleBtn.dataset.styleId = st.id;
            this.lineStyleBtn.innerHTML = lineStyleSvg(st.id);
            const title = `Linea ${st.label.toLowerCase()} (tocca: ${next.label.toLowerCase()})`;
            this.lineStyleBtn.title = title;
            this.lineStyleBtn.setAttribute('aria-label', title);
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

        for (const btn of this.lassoModeBtns) {
            const active = btn.dataset.lassoMode === this.state.lassoMode;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        }
        for (const btn of this.shapeBtns) {
            const active = btn.dataset.shapeKind === this.state.shapeKind;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        }
        if (this.connSeriesBtns) {
            for (const btn of this.connSeriesBtns) {
                btn.classList.toggle('active', btn.dataset.connSeries === this.state.connectorSeries);
            }
        }
        if (this.connModeBtns) {
            for (const btn of this.connModeBtns) {
                btn.classList.toggle('active', btn.dataset.connMode === this.state.connectorMode);
            }
        }
        if (this.connLinkBtn) {
            const openPairs = this.connectorOpenPairs || [];
            this.connLinkBtn.disabled = openPairs.length === 0;
        }
        if (this.connHintEl) {
            // One short line saying what the next tap on the board does.
            const series = this.state.connectorSeries === 'num' ? '1, 2…' : 'A, B…';
            this.connHintEl.textContent = this.state.connectorMode === 'link'
                ? (this.connectorPendingLabel
                    ? `Tocca per il gemello di ${this.connectorPendingLabel}`
                    : 'Scegli quale collegare')
                : `Tocca per una nuova coppia (${series})`;
        }
        if (this.connOpenWrap) {
            const openPairs = this.connectorOpenPairs || [];
            this.connOpenList.innerHTML = '';
            this.connOpenWrap.hidden = openPairs.length === 0;
            for (const pair of openPairs) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'board-conn-open-row';
                if (this.connectorPendingPairId === pair.pairId && this.state.connectorMode === 'link') {
                    btn.classList.add('active');
                }
                btn.style.setProperty('--conn-color', resolveInkColor(pair.color, theme));
                const badge = document.createElement('span');
                badge.className = 'board-conn-open-badge';
                badge.textContent = pair.label;
                const page = document.createElement('span');
                page.className = 'board-conn-open-page';
                page.textContent = `pag. ${pair.pageIndex + 1}`;
                btn.append(badge, page);
                btn.title = `Collega a ${pair.label} (pagina ${pair.pageIndex + 1})`;
                btn.addEventListener('click', () => {
                    if (this.onSelectOpenConnector) this.onSelectOpenConnector(pair);
                });
                this.connOpenList.appendChild(btn);
            }
        }

        this._renderTrays();
        this._syncPressed();
    }
}
