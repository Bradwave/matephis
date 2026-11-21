/**
 * Multi-page board document model, camera state, settings, and compact .mboard.json codec.
 * Each page has its own unbounded landscape-A4 canvas (strokes + camera).
 */

import {
    A4_W,
    A4_H,
    computeA4Footprint,
    computeBaseScale,
    createInitialCamera,
} from '../ink/geometry.js';
import { createStroke, decodeStroke, encodeStroke } from '../ink/stroke.js';

export const DEFAULT_SETTINGS = {
    showCropMarks: true, // controls A4 page borders & corner marks
    penOnly: false,
    palmErase: false,
    palmThreshold: 42,
    lowDpr: false,
    showHud: false,
};

let pageCounter = 1;

function nextPageId() {
    return `p${Date.now().toString(36)}_${(pageCounter++).toString(36)}`;
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

    _createPage(viewportW = this.viewportW, viewportH = this.viewportH) {
        return {
            id: nextPageId(),
            strokes: [],
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

    get camera() {
        return this.currentPage.camera;
    }

    get pageCount() {
        return this.pages.length;
    }

    getPage(index) {
        return this.pages[index] || null;
    }

    addPage(switchToNew = true) {
        const page = this._createPage(this.viewportW, this.viewportH);
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
        return computeA4Footprint(page.strokes);
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
            v: 1,
            id: this.id,
            title: this.title,
            createdAt: this.createdAt,
            updatedAt: Math.floor(Date.now() / 1000),
            geometry: { tile: 'A4-landscape', w: A4_W, h: A4_H },
            currentPageIndex: this.currentPageIndex,
            pages: this.pages.map((page) => ({
                id: page.id,
                camera: {
                    x: Math.round(page.camera.x * 10) / 10,
                    y: Math.round(page.camera.y * 10) / 10,
                    scale: Math.round(page.camera.scale * 1000) / 1000,
                },
                strokes: page.strokes.map(encodeStroke),
            })),
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
                    camera: initCam,
                    strokes: Array.isArray(rawPage.strokes) ? rawPage.strokes.map(decodeStroke) : [],
                };
            });
            const idx = Number(data.currentPageIndex) || 0;
            this.currentPageIndex = Math.max(0, Math.min(this.pages.length - 1, idx));
            return true;
        }

        // Backwards-compatible fallback for early single-page JSON
        const page = this._createPage(this.viewportW, this.viewportH);
        page.strokes = Array.isArray(data.strokes) ? data.strokes.map(decodeStroke) : [];
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
                width: 0.75,
                style: styles[i % styles.length],
                points: pts,
            }));
        }
        return generated;
    }
}
