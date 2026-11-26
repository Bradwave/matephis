/**
 * Multi-page board document model, camera state, settings, and compact .mboard.json codec.
 * Each page has its own unbounded landscape-A4 canvas (strokes, widgets, connectors, background, camera).
 */

import {
    A4_W,
    A4_H,
    computeA4Footprint,
    computeBaseScale,
    createInitialCamera,
} from '../ink/geometry.js';
import { createStroke, decodeStroke, encodeStroke } from '../ink/stroke.js';

export const PAGE_BACKGROUNDS = ['blank', 'grid', 'dots', 'ruled'];

export const DEFAULT_SETTINGS = {
    showCropMarks: true, // controls A4 page borders & corner marks
    penOnly: false,
    palmErase: false,
    palmThreshold: 42,
    lowDpr: false,
    showHud: false,
    uiSize: 'm',            // 's' | 'm' | 'l' — multiplier on the auto-sized --bu token
    toolbarLayout: 'auto',  // 'auto' | 'rail' | 'bar'
    toolbarSide: 'right',   // rail side: 'right' | 'left'
    toolbarMinimal: false,  // essential toolbar: pen, quick colours, eraser, undo/redo
    quickMenu: true,        // two-finger tap opens the quick menu where you tap
    zoomLock: false,        // lock pinch/wheel zoom so 2-finger touch only pans
    fastPan: true,          // pan/zoom moves a picture of the board, sharp redraw at the end
    connectorGlide: false,  // jumping to a connector's twin glides the camera (off: instant)
    gestureEffect: 'dim',   // EXPERIMENT: 'dim' | 'pixel' look of the picture while moving
    snapRelease: '30000',   // EXPERIMENT: free the pan/zoom pictures after this idle time: '2000' | '30000' | 'never'
};

let pageCounter = 1;
let widgetCounter = 1;
let connectorCounter = 1;

function nextPageId() {
    return `p${Date.now().toString(36)}_${(pageCounter++).toString(36)}`;
}

export function nextWidgetId() {
    return `w${Date.now().toString(36)}_${(widgetCounter++).toString(36)}`;
}

export function nextConnectorId() {
    return `c${Date.now().toString(36)}_${(connectorCounter++).toString(36)}`;
}

function normalizeBackground(bg) {
    return PAGE_BACKGROUNDS.includes(bg) ? bg : 'blank';
}

function normalizeWidget(raw) {
    if (!raw || typeof raw !== 'object') return null;
    return {
        id: raw.id || nextWidgetId(),
        kind: String(raw.kind || 'plot'),
        x: Number(raw.x) || 0,
        y: Number(raw.y) || 0,
        w: Math.max(20, Number(raw.w) || 120),
        h: Math.max(16, Number(raw.h) || 85),
        lockedControls: Boolean(raw.lockedControls),
        data: raw.data && typeof raw.data === 'object' ? JSON.parse(JSON.stringify(raw.data)) : {},
    };
}

function normalizeConnector(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const series = raw.series === 'num' ? 'num' : 'alpha';
    return {
        id: raw.id || nextConnectorId(),
        pairId: String(raw.pairId || raw.id || nextConnectorId()),
        series,
        label: String(raw.label || (series === 'num' ? '1' : 'A')),
        x: Number(raw.x) || 0,
        y: Number(raw.y) || 0,
        color: typeof raw.color === 'number' ? raw.color : 1,
    };
}

function alphaLabelFromIndex(n) {
    // 0 -> A, 25 -> Z, 26 -> AA, ...
    let idx = n;
    let out = '';
    while (idx >= 0) {
        out = String.fromCharCode(65 + (idx % 26)) + out;
        idx = Math.floor(idx / 26) - 1;
    }
    return out;
}

export class BoardScene {
    constructor(viewportW = 1280, viewportH = 720, savedSettings = {}) {
        this.id = `b_${Date.now().toString(36)}`;
        this.title = 'Lavagna';
        this.createdAt = Math.floor(Date.now() / 1000);
        this.updatedAt = this.createdAt;
        this.viewportW = viewportW;
        this.viewportH = viewportH;
        this.settings = { ...DEFAULT_SETTINGS, ...savedSettings };

        this.pages = [this._createPage(viewportW, viewportH)];
        this.currentPageIndex = 0;
    }

    _createPage(viewportW = this.viewportW, viewportH = this.viewportH, background = 'blank') {
        return {
            id: nextPageId(),
            background: normalizeBackground(background),
            strokes: [],
            widgets: [],
            connectors: [],
            camera: createInitialCamera(viewportW, viewportH),
        };
    }

    get currentPage() {
        return this.pages[this.currentPageIndex];
    }

    get strokes() {
        return this.currentPage.strokes;
    }

    set strokes(list) {
        this.currentPage.strokes = list;
    }

    get widgets() {
        return this.currentPage.widgets;
    }

    set widgets(list) {
        this.currentPage.widgets = list;
    }

    get connectors() {
        return this.currentPage.connectors;
    }

    set connectors(list) {
        this.currentPage.connectors = list;
    }

    get pageBackground() {
        return this.currentPage.background || 'blank';
    }

    set pageBackground(bg) {
        this.currentPage.background = normalizeBackground(bg);
    }

    get camera() {
        return this.currentPage.camera;
    }

    get pageCount() {
        return this.pages.length;
    }

    getPage(index) {
        return this.pages[index] || null;
    }

    isPageEmpty(pageIndex = this.currentPageIndex) {
        const page = this.pages[pageIndex];
        if (!page) return true;
        return page.strokes.length === 0
            && page.widgets.length === 0
            && page.connectors.length === 0;
    }

    findMatchingConnectors(pairId) {
        const matches = [];
        for (let i = 0; i < this.pages.length; i++) {
            const page = this.pages[i];
            for (let j = 0; j < page.connectors.length; j++) {
                const c = page.connectors[j];
                if (c.pairId === pairId) {
                    matches.push({ pageIndex: i, pageId: page.id, connector: c });
                }
            }
        }
        return matches;
    }

    getNextConnectorLabel(series = 'alpha') {
        const used = new Set();
        for (const page of this.pages) {
            for (const c of page.connectors) {
                if (c.series === series) used.add(c.label);
            }
        }
        if (series === 'num') {
            let n = 1;
            while (used.has(String(n))) n++;
            return String(n);
        }
        let i = 0;
        while (used.has(alphaLabelFromIndex(i))) i++;
        return alphaLabelFromIndex(i);
    }

    addPage(switchToNew = true) {
        const bg = this.currentPage ? this.currentPage.background : 'blank';
        const page = this._createPage(this.viewportW, this.viewportH, bg);
        const insertIdx = this.currentPageIndex + 1;
        this.pages.splice(insertIdx, 0, page);
        if (switchToNew) {
            this.currentPageIndex = insertIdx;
        }
        return { page, index: insertIdx };
    }

    goToPage(index) {
        if (index < 0 || index >= this.pages.length) return false;
        if (index === this.currentPageIndex) return false;
        this.currentPageIndex = index;
        return true;
    }

    deleteCurrentPage() {
        if (this.pages.length <= 1) return false;
        this.pages.splice(this.currentPageIndex, 1);
        if (this.currentPageIndex >= this.pages.length) {
            this.currentPageIndex = this.pages.length - 1;
        }
        return true;
    }

    updateViewportBaseScale(viewportW, viewportH) {
        this.viewportW = viewportW;
        this.viewportH = viewportH;
        const nextBase = computeBaseScale(viewportW, viewportH);
        for (const page of this.pages) {
            if (!page.camera.baseScale) {
                page.camera.scale = nextBase;
            }
            page.camera.baseScale = nextBase;
        }
    }

    resetCamera(viewportW = this.viewportW, viewportH = this.viewportH) {
        const init = createInitialCamera(viewportW, viewportH);
        this.camera.x = init.x;
        this.camera.y = init.y;
        this.camera.scale = init.scale;
        this.camera.baseScale = init.baseScale;
    }

    getFootprint(pageIndex = this.currentPageIndex) {
        const page = this.pages[pageIndex] || this.currentPage;
        return computeA4Footprint(page.strokes, page.widgets, page.connectors);
    }

    getPointCount(pageIndex = this.currentPageIndex) {
        const page = this.pages[pageIndex] || this.currentPage;
        let total = 0;
        for (let i = 0; i < page.strokes.length; i++) {
            total += page.strokes[i].points.length;
        }
        return total;
    }

    toJSON() {
        return {
            v: 2,
            id: this.id,
            title: this.title,
            createdAt: this.createdAt,
            updatedAt: Math.floor(Date.now() / 1000),
            geometry: { tile: 'A4-landscape', w: A4_W, h: A4_H },
            currentPageIndex: this.currentPageIndex,
            pages: this.pages.map((page) => {
                const out = {
                    id: page.id,
                    camera: {
                        x: Math.round(page.camera.x * 10) / 10,
                        y: Math.round(page.camera.y * 10) / 10,
                        scale: Math.round(page.camera.scale * 1000) / 1000,
                    },
                    strokes: page.strokes.map(encodeStroke),
                };
                if (page.background && page.background !== 'blank') {
                    out.bg = page.background;
                }
                if (page.widgets && page.widgets.length > 0) {
                    out.widgets = page.widgets.map((w) => {
                        const item = {
                            id: w.id,
                            kind: w.kind,
                            x: Math.round(w.x * 10) / 10,
                            y: Math.round(w.y * 10) / 10,
                            w: Math.round(w.w * 10) / 10,
                            h: Math.round(w.h * 10) / 10,
                            data: w.data || {},
                        };
                        if (w.lockedControls) item.lockedControls = true;
                        return item;
                    });
                }
                if (page.connectors && page.connectors.length > 0) {
                    out.connectors = page.connectors.map((c) => ({
                        id: c.id,
                        pairId: c.pairId,
                        series: c.series,
                        label: c.label,
                        x: Math.round(c.x * 10) / 10,
                        y: Math.round(c.y * 10) / 10,
                        color: c.color,
                    }));
                }
                return out;
            }),
        };
    }

    loadJSON(data) {
        if (!data || typeof data !== 'object') return false;
        this.id = data.id || this.id;
        this.title = data.title || 'Lavagna';
        this.createdAt = data.createdAt || Math.floor(Date.now() / 1000);
        this.updatedAt = data.updatedAt || this.createdAt;

        const baseScale = computeBaseScale(this.viewportW, this.viewportH);

        if (Array.isArray(data.pages) && data.pages.length > 0) {
            this.pages = data.pages.map((rawPage) => {
                const initCam = createInitialCamera(this.viewportW, this.viewportH);
                if (rawPage.camera && typeof rawPage.camera.x === 'number' && typeof rawPage.camera.y === 'number') {
                    initCam.x = rawPage.camera.x;
                    initCam.y = rawPage.camera.y;
                    if (typeof rawPage.camera.scale === 'number' && rawPage.camera.scale > 0.2) {
                        initCam.scale = rawPage.camera.scale;
                    }
                }
                initCam.baseScale = baseScale;
                return {
                    id: rawPage.id || nextPageId(),
                    background: normalizeBackground(rawPage.bg || rawPage.background),
                    camera: initCam,
                    strokes: Array.isArray(rawPage.strokes) ? rawPage.strokes.map(decodeStroke) : [],
                    widgets: Array.isArray(rawPage.widgets) ? rawPage.widgets.map(normalizeWidget).filter(Boolean) : [],
                    connectors: Array.isArray(rawPage.connectors) ? rawPage.connectors.map(normalizeConnector).filter(Boolean) : [],
                };
            });
            const idx = Number(data.currentPageIndex) || 0;
            this.currentPageIndex = Math.max(0, Math.min(this.pages.length - 1, idx));
            return true;
        }

        // Fallback for minimal single-page JSON
        const page = this._createPage(this.viewportW, this.viewportH, data.bg || data.background);
        page.strokes = Array.isArray(data.strokes) ? data.strokes.map(decodeStroke) : [];
        page.widgets = Array.isArray(data.widgets) ? data.widgets.map(normalizeWidget).filter(Boolean) : [];
        page.connectors = Array.isArray(data.connectors) ? data.connectors.map(normalizeConnector).filter(Boolean) : [];
        if (data.camera && typeof data.camera.x === 'number' && typeof data.camera.y === 'number') {
            page.camera.x = data.camera.x;
            page.camera.y = data.camera.y;
            if (typeof data.camera.scale === 'number' && data.camera.scale > 0.2) {
                page.camera.scale = data.camera.scale;
            }
        }
        this.pages = [page];
        this.currentPageIndex = 0;
        return true;
    }

    /**
     * Generates `count` realistic math-handwriting strokes across 2 landscape A4 tiles
     * for smartboard lag benchmarking.
     */
    generateStressStrokes(count = 200) {
        const generated = [];
        const colors = [0, 0, 0, 1, 2, 3, 4];
        const styles = ['solid', 'solid', 'solid', 'solid', 'dashed'];

        for (let i = 0; i < count; i++) {
            const line = Math.floor(i / 14);
            const col = i % 14;
            const originX = 14 + col * 19 + (Math.random() - 0.5) * 4;
            const originY = 18 + line * 16 + (Math.random() - 0.5) * 3;
            const pts = [];
            const steps = 16 + Math.floor(Math.random() * 14);
            const freq = 0.45 + Math.random() * 0.4;
            const amp = 2.0 + Math.random() * 2.8;

            for (let k = 0; k < steps; k++) {
                pts.push({
                    x: originX + k * 0.65 + Math.cos(k * freq) * 1.1,
                    y: originY + Math.sin(k * freq) * amp,
                });
            }

            generated.push(createStroke({
                tool: 'pen',
                color: colors[i % colors.length],
                width: 0.45,
                style: styles[i % styles.length],
                points: pts,
            }));
        }
        return generated;
    }
}
