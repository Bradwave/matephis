import { describe, it, expect } from 'vitest';
import { SliderManager, paramScale, snapToStep, formatValue, valueWidth } from '../assets/js/matephis-plot-src/ui/slider-manager.js';
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

describe('Valori degli slider', () => {
    it('aggancia i valori al passo senza rumore numerico', () => {
        expect(snapToStep(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
        expect(snapToStep(0.7000000000000001, 0.1, 5, 0.1)).toBe(0.7);
        expect(snapToStep(2.26, -1, 10, 0.25)).toBe(2.25);
        expect(snapToStep(-0.04, -1, 1, 0.1)).toBe(0);
        expect(Object.is(snapToStep(-0.04, -1, 1, 0.1), -0)).toBe(false);
    });

    it('resta dentro [min, max] anche quando max non è sulla griglia', () => {
        expect(snapToStep(-5, 0, 1, 0.1)).toBe(0);
        expect(snapToStep(9.9, 0, 9.85, 0.1)).toBe(9.8);
        expect(snapToStep(3.3, 0, Math.PI, Math.PI / 16)).toBeLessThanOrEqual(Math.PI);
    });

    it('mostra sempre lo stesso numero di decimali, senza "-0"', () => {
        expect(formatValue(1, 2)).toBe('1.00');
        expect(formatValue(1.1, 2)).toBe('1.10');
        expect(formatValue(-0.001, 2)).toBe('0.00');
        expect(formatValue(30, 1, '°')).toBe('30.0°');
        expect(formatValue(2.5, 2, ' kg')).toBe('2.50 kg');
    });

    it('riserva lo spazio del valore più lungo dell\'intervallo', () => {
        expect(valueWidth(0, 10, 1)).toBe(4);           // "10.0"
        expect(valueWidth(-1, 10, 2)).toBe(5);          // "-1.00" e "10.00"
        expect(valueWidth(-10, 5, 0)).toBe(3);          // "-10"
        expect(valueWidth(0, 90, 0, '°')).toBe(3);      // "90°"
        for (let v = -1; v <= 10; v += 0.37) {
            expect(formatValue(v, 2).length).toBeLessThanOrEqual(valueWidth(-1, 10, 2));
        }
    });
});
