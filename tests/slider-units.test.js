import { describe, it, expect } from 'vitest';
import { SliderManager, paramScale } from '../assets/js/matephis-plot-src/ui/slider-manager.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

const initParams = (defs) => {
    const params = {};
    const c = new ExpressionCompiler({ getParams: () => params, getPoints: () => ({}), paramNames: Object.keys(defs) });
    SliderManager.initValues(defs, params, (v) => c.eval(v));
    return { params, c };
};

describe('Unità dei parametri', () => {
    it('converte in radianti i parametri con unit "deg"', () => {
        expect(paramScale({ unit: 'deg' })).toBeCloseTo(Math.PI / 180, 15);
        expect(paramScale({ unit: 'kg' })).toBe(1);
        expect(paramScale({})).toBe(1);

        const { params, c } = initParams({ alpha: { min: 0, max: 90, val: 30, unit: 'deg' } });
        expect(params.alpha).toBeCloseTo(Math.PI / 6, 12);
        expect(c.eval('sin(alpha)')).toBeCloseTo(0.5, 12);
    });

    it('lascia invariati gli altri parametri e accetta espressioni', () => {
        const { params } = initParams({
            m: { min: 1, max: 10, val: 2, unit: 'kg' },
            k: { min: 0, max: 20, val: '3m' },
        });
        expect(params.m).toBe(2);
        expect(params.k).toBe(6);
    });
});
