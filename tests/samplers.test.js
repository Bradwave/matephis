import { describe, it, expect } from 'vitest';
import { sampleCurve, closestOnPolylines } from '../assets/js/matephis-plot-src/renderers/curve-sampler.js';
import { sampleImplicit } from '../assets/js/matephis-plot-src/renderers/implicit-sampler.js';

const W = 600, H = 600, lim = 10;
const mapX = x => (x + lim) / (2 * lim) * W;
const mapY = y => H - (y + lim) / (2 * lim) * H;
const view = { x0: 0, y0: 0, x1: W, y1: H };
const curve = (f) => sampleCurve({
    point: x => { const y = f(x); return Number.isFinite(y) ? [mapX(x), mapY(y)] : null; },
    t0: -lim, t1: lim, steps: 300, view,
});

describe('sampleCurve', () => {
    it('disegna una funzione continua come una sola linea', () => {
        expect(curve(x => x * x)).toHaveLength(1);
        expect(curve(x => 1000 * x)).toHaveLength(1); // ripida ma continua
        expect(curve(Math.log)).toHaveLength(1);      // asintoto al bordo del dominio
    });

    it('spezza la linea agli asintoti e ai salti', () => {
        expect(curve(x => 1 / x)).toHaveLength(2);
        expect(curve(Math.tan)).toHaveLength(7);
        expect(curve(Math.floor)).toHaveLength(20);
    });

    it('raggiunge i bordi del dominio', () => {
        const [line] = curve(x => Math.sqrt(4 - x * x));
        expect(line[0]).toBeCloseTo(mapX(-2), 0);
        expect(line[line.length - 2]).toBeCloseTo(mapX(2), 0);
    });

    it('trova il punto più vicino su una polilinea', () => {
        const res = closestOnPolylines([[0, 0, 10, 0]], 5, 3);
        expect(res.x).toBe(5);
        expect(res.dist).toBe(3);
    });
});

describe('sampleImplicit', () => {
    const run = (f) => sampleImplicit({ f, xMin: -lim, xMax: lim, yMin: -lim, yMax: lim, mapX, mapY, pxWidth: W, pxHeight: H });

    it('unisce i segmenti in una curva chiusa', () => {
        const lines = run((x, y) => x * x + y * y - 25);
        expect(lines).toHaveLength(1);
        const l = lines[0];
        expect(l[0]).toBe(l[l.length - 2]);
        expect(l[1]).toBe(l[l.length - 1]);
    });

    it('ignora i cambi di segno dovuti a poli', () => {
        expect(run((x, y) => y - 1 / x)).toHaveLength(2);
    });
});
