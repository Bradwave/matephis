/**
 * Board document model, camera state, settings, and compact .mboard.json codec.
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
    showCropMarks: true,
    penOnly: false,
    palmErase: false,
    palmThreshold: 42,
    lowDpr: false,
    showHud: false,
};

export class BoardScene {
    constructor(viewportW = 1280, viewportH = 720, savedSettings = {}) {
        this.id = `b_${Date.now().toString(36)}`;
        this.title = 'Lavagna';
        this.createdAt = Math.floor(Date.now() / 1000);
        this.updatedAt = this.createdAt;
        this.strokes = [];
        this.camera = createInitialCamera(viewportW, viewportH);
        this.settings = { ...DEFAULT_SETTINGS, ...savedSettings };
    }

    updateViewportBaseScale(viewportW, viewportH) {
        const nextBase = computeBaseScale(viewportW, viewportH);
        if (!this.camera.baseScale) {
            this.camera.scale = nextBase;
        }
        this.camera.baseScale = nextBase;
    }

    resetCamera(viewportW, viewportH) {
        const init = createInitialCamera(viewportW, viewportH);
        this.camera.x = init.x;
        this.camera.y = init.y;
        this.camera.scale = init.scale;
        this.camera.baseScale = init.baseScale;
    }

    getFootprint() {
        return computeA4Footprint(this.strokes);
    }

    getPointCount() {
        let total = 0;
        for (let i = 0; i < this.strokes.length; i++) {
            total += this.strokes[i].points.length;
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
            camera: {
                x: Math.round(this.camera.x * 10) / 10,
                y: Math.round(this.camera.y * 10) / 10,
                scale: Math.round(this.camera.scale * 1000) / 1000,
            },
            strokes: this.strokes.map(encodeStroke),
        };
    }

    loadJSON(data) {
        if (!data || typeof data !== 'object') return false;
        this.id = data.id || this.id;
        this.title = data.title || 'Lavagna';
        this.createdAt = data.createdAt || Math.floor(Date.now() / 1000);
        this.updatedAt = data.updatedAt || this.createdAt;

        const rawStrokes = Array.isArray(data.strokes) ? data.strokes : [];
        this.strokes = rawStrokes.map(decodeStroke);

        if (data.camera && typeof data.camera.x === 'number' && typeof data.camera.y === 'number') {
            this.camera.x = data.camera.x;
            this.camera.y = data.camera.y;
            if (typeof data.camera.scale === 'number' && data.camera.scale > 0.2) {
                this.camera.scale = data.camera.scale;
            }
        }
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
