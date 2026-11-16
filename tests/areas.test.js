import { describe, it, expect } from 'vitest';
import { areaPolygons, riemannSum } from '../assets/js/matephis-plot-src/renderers/area-renderer.js';

describe('riemannSum', () => {
    const f = (x) => x * x;
    it('converges to the integral of x^2 on [0, 1]', () => {
        expect(riemannSum(f, 0, 1, 1000, 'mid')).toBeCloseTo(1 / 3, 6);
        expect(riemannSum(f, 0, 1, 1000, 'trapezoid')).toBeCloseTo(1 / 3, 6);
    });
    it('left and right sums bracket an increasing function', () => {
        const L = riemannSum(f, 0, 1, 10, 'left'), R = riemannSum(f, 0, 1, 10, 'right');
        expect(L).toBeCloseTo(0.285, 10);
        expect(R).toBeCloseTo(0.385, 10);
        expect(L).toBeLessThan(1 / 3);
        expect(R).toBeGreaterThan(1 / 3);
    });
    it('counts the area below the axis as negative', () => {
        expect(riemannSum(Math.sin, 0, 2 * Math.PI, 400, 'mid')).toBeCloseTo(0, 6);
        expect(riemannSum((x) => -2, 0, 3, 7, 'left')).toBeCloseTo(-6, 10);
    });
    it('rounds n and uses at least one strip', () => {
        expect(riemannSum((x) => 1, 0, 2, 0)).toBe(2);
        expect(riemannSum((x) => x, 0, 2, 1.6, 'left')).toBeCloseTo(0.5 * 1 + 1 * 1 - 0.5, 10);
    });
});

describe('areaPolygons', () => {
    const samples = [[0, 1, 0], [1, -1, 0], [2, 1, 0]];
    it('keeps one polygon with the curve on top when unsigned', () => {
        const p = areaPolygons(samples, 0);
        expect(p).toHaveLength(1);
        expect(p[0].top).toEqual([[0, 1], [1, -1], [2, 1]]);
        expect(p[0].base).toEqual([[0, 0], [1, 0], [2, 0]]);
    });
    it('clamps to the base for the positive and negative parts', () => {
        expect(areaPolygons(samples, 1)[0].top).toEqual([[0, 1], [1, 0], [2, 1]]);
        expect(areaPolygons(samples, -1)[0].top).toEqual([[0, 0], [1, -1], [2, 0]]);
    });
    it('breaks at values that are not finite', () => {
        const p = areaPolygons([[0, 1, 0], [1, 2, 0], [2, NaN, 0], [3, 1, 0], [4, 1, 0]], 0);
        expect(p).toHaveLength(2);
    });
});
