import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { versionedPath } from '../assets/js/matephis-board-src/ui/engine-loader.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

describe('engine cache versions (#67)', () => {
    const versions = { plot: { js: '2.24', css: '2.4' } };

    it('appends the engine version to a path', () => {
        expect(versionedPath('/assets/js/matephis-plot.js', 'plot', 'js', versions)).toBe('/assets/js/matephis-plot.js?v=2.24');
        expect(versionedPath('/assets/css/matephis-plot.css', 'plot', 'css', versions)).toBe('/assets/css/matephis-plot.css?v=2.4');
    });

    it('leaves the path alone when no version is known', () => {
        expect(versionedPath('/assets/js/matephis-sets.js', 'sets', 'js', versions)).toBe('/assets/js/matephis-sets.js');
        expect(versionedPath('/assets/js/matephis-sets.js', 'sets', 'js', null)).toBe('/assets/js/matephis-sets.js');
    });

    it('keeps every engine version in _data/engines.yml only', () => {
        const yml = read('_data/engines.yml');
        for (const layout of ['_layouts/Post.html', '_layouts/Board.html', '_layouts/BoardBench.html']) {
            const html = read(layout);
            expect(html).not.toMatch(/matephis-(plot|physics|sets|circuit|slides|draw|exam)\.(js|css)\?v=\d/);
            const styleVersions = [...html.matchAll(/(?:site\.css_file|style\.css)\?v=([\d.]+)/g)].map((m) => m[1]);
            expect(new Set(styleVersions).size).toBe(1);
        }
        expect(read('assets/js/matephis-board-src/ui/engine-loader.js')).not.toMatch(/\.(js|css)\?v=/);
        for (const engine of ['plot', 'physics', 'sets', 'circuit', 'exam']) {
            expect(yml).toMatch(new RegExp(`^${engine}:\\n  js: "[\\d.]+"\\n  css: "[\\d.]+"`, 'm'));
        }
    });
});
