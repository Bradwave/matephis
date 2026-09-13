import { describe, it, expect } from 'vitest';
import { makeFn, evalValue } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

describe('ExpressionParser', () => {
    it('trasforma potenze e moltiplicazioni implicite', () => {
        const fnStr = makeFn('3x^2 + 2x - 5');
        const fn = new Function('x', `return ${fnStr};`);
        expect(fn(2)).toBe(3 * 4 + 4 - 5); // 11
    });

    it('supporta funzioni trigonometriche e costanti pi', () => {
        const fnStr = makeFn('sin(pi * x)');
        const fn = new Function('x', `return ${fnStr};`);
        expect(fn(0.5)).toBeCloseTo(1, 5);
        expect(fn(0)).toBeCloseTo(0, 5);
    });

    it('supporta parametri dinamici', () => {
        const fnStr = makeFn('a * x^2 + b', { params: { a: 2, b: 3 } });
        const fn = new Function('x', `return ${fnStr};`);
        expect(fn(2)).toBe(2 * 4 + 3); // 11
    });

    it('supporta numeri complessi in forma esponenziale e algebrica', () => {
        const fnStr = makeFn('exp(i * x)', { complexMode: true });
        const fn = new Function('x', `return ${fnStr};`);
        const res = fn(Math.PI);
        expect(res.re).toBeCloseTo(-1, 5);
        expect(res.im).toBeCloseTo(0, 5);
    });

    it('evalValue valuta espressioni scalari', () => {
        expect(evalValue(5)).toBe(5);
        expect(evalValue('2 * pi')).toBeCloseTo(2 * Math.PI, 5);
    });
});
