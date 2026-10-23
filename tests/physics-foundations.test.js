import { describe, it, expect } from 'vitest';
import { angleValue, angleLiteralWarning, angleParamWarning, formatAngle, DEG } from '../assets/js/matephis-physics-src/core/angles.js';
import { validateConfig, defaultLimits, suggest } from '../assets/js/matephis-physics-src/core/config.js';
import { fitView, gridValues } from '../assets/js/matephis-physics-src/core/world.js';
import { OBJECT_TYPES } from '../assets/js/matephis-physics-src/objects/index.js';
import { toTeX } from '../assets/js/matephis-physics-src/core/labels.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

const evalIn = (params = {}) => {
    const c = new ExpressionCompiler({ getParams: () => params, getPoints: () => ({}), paramNames: Object.keys(params) });
    return (e) => c.eval(e);
};

describe('Campi angolo', () => {
    it('legge i numeri nell\'unità della scena', () => {
        expect(angleValue(30, 'deg', evalIn())).toBeCloseTo(Math.PI / 6, 12);
        expect(angleValue(0.5, 'rad', evalIn())).toBe(0.5);
    });

    it('valuta le stringhe come espressioni in radianti', () => {
        expect(angleValue('pi/6', 'deg', evalIn())).toBeCloseTo(Math.PI / 6, 12);
        expect(angleValue('30°', 'rad', evalIn())).toBeCloseTo(Math.PI / 6, 12);
        expect(angleValue('alpha + 90°', 'deg', evalIn({ alpha: Math.PI / 6 }))).toBeCloseTo(2 * Math.PI / 3, 12);
    });

    it('avvisa per letterali sospetti in radianti', () => {
        expect(angleLiteralWarning(30, 'rad', 'slope angle')).toMatch(/30°/);
        expect(angleLiteralWarning(1.2, 'rad', 'slope angle')).toBeNull();
        expect(angleLiteralWarning(30, 'deg', 'slope angle')).toBeNull();
        expect(angleLiteralWarning('30', 'rad', 'slope angle')).toBeNull();
    });

    it('avvisa per parametri-angolo in gradi senza unit', () => {
        expect(angleParamWarning('alpha', { min: 0, max: 90 })).toMatch(/unit/);
        expect(angleParamWarning('theta2', { min: 0, max: 180 })).toMatch(/unit/);
        expect(angleParamWarning('alpha', { min: 0, max: 90, unit: 'deg' })).toBeNull();
        expect(angleParamWarning('alpha', { min: 0, max: 3.14 })).toBeNull();
        expect(angleParamWarning('m', { min: 0, max: 90 })).toBeNull();
    });

    it('formatta gradi e frazioni di π', () => {
        expect(formatAngle(30 * DEG)).toBe('30°');
        expect(formatAngle(-1e-12)).toBe('0°');
        expect(formatAngle(Math.PI / 6, 'rad')).toBe('π/6');
        expect(formatAngle(2 * Math.PI / 3, 'rad')).toBe('2π/3');
        expect(formatAngle(-Math.PI / 4, 'rad')).toBe('−π/4');
        expect(formatAngle(Math.PI, 'rad')).toBe('π');
        expect(formatAngle(1, 'rad')).toBe('1 rad');
    });
});

describe('Validazione della scena', () => {
    const warnings = (cfg) => validateConfig(cfg, OBJECT_TYPES);

    it('accetta una scena corretta senza avvisi', () => {
        expect(warnings({
            xlim: [0, 10], grid: true, axes: true, angleUnit: 'rad',
            params: { alpha: { min: 0, max: 90, val: 30, unit: 'deg' } },
            objects: [{ id: 'A', type: 'particle', at: [1, 2], label: 'A' }, { type: 'label', at: 'A', text: 'ciao' }],
        })).toEqual([]);
    });

    it('suggerisce le chiavi scritte male', () => {
        expect(warnings({ xlin: [0, 1] })[0]).toMatch(/'xlim'/);
        expect(warnings({ objects: [{ type: 'particle', at: [0, 0], raduis: 3 }] })[0]).toMatch(/'radius'/);
        expect(warnings({ objects: [{ type: 'partcle', at: [0, 0] }] })[0]).toMatch(/'particle'/);
    });

    it('segnala opzioni e tipi non ancora implementati', () => {
        expect(warnings({ graphs: [] })[0]).toMatch(/not implemented yet/);
        expect(warnings({ objects: [{ type: 'energy' }] })[0]).toMatch(/not implemented yet/);
    });

    it('segnala id duplicati, tipi mancanti e unità errate', () => {
        const w = warnings({
            angleUnit: 'gradi',
            objects: [{ id: 'A', type: 'particle', at: [0, 0] }, { id: 'A', type: 'particle', at: [1, 0] }, { at: [0, 0] }],
        });
        expect(w.some(m => /angleUnit/.test(m))).toBe(true);
        expect(w.some(m => /Duplicate id 'A'/.test(m))).toBe(true);
        expect(w.some(m => /no 'type'/.test(m))).toBe(true);
    });

    it('trova il suggerimento più vicino solo se è davvero vicino', () => {
        expect(suggest('lenght', ['length', 'width'])).toBe('length');
        expect(suggest('zzz', ['length', 'width'])).toBeNull();
    });
});

describe('Finestra del mondo', () => {
    it('usa limiti di default dal rapporto d\'aspetto', () => {
        expect(defaultLimits({}, 2)).toEqual({ xlim: [0, 10], ylim: [0, 5] });
        expect(defaultLimits({ xlim: [-2, 6] }, 2)).toEqual({ xlim: [-2, 6], ylim: [0, 4] });
        expect(defaultLimits({ ylim: [0, 3] }, 2)).toEqual({ xlim: [0, 6], ylim: [0, 3] });
    });

    it('mantiene la stessa scala sui due assi e tutta la finestra visibile', () => {
        // 10 m × 2 m in 600 × 300 px: x decides (60 px/m), y grows to 5 m centred on 1 m
        const v = fitView([0, 10], [0, 2], 600, 300);
        expect(v.scale).toBeCloseTo(60, 12);
        expect(v.xMin).toBeCloseTo(0, 12);
        expect(v.xMax).toBeCloseTo(10, 12);
        expect(v.yMin).toBeCloseTo(-1.5, 12);
        expect(v.yMax).toBeCloseTo(3.5, 12);

        // 2 m × 10 m in the same box: y decides (30 px/m), x grows
        const w = fitView([0, 2], [0, 10], 600, 300);
        expect(w.scale).toBeCloseTo(30, 12);
        expect(w.yMax - w.yMin).toBeCloseTo(10, 12);
        expect(w.xMax - w.xMin).toBeCloseTo(20, 12);
    });

    it('calcola i valori della griglia senza errori di arrotondamento', () => {
        expect(gridValues(-1.2, 2.1, 1)).toEqual([-1, 0, 1, 2]);
        expect(gridValues(0, 1, 0.1)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
        expect(gridValues(0, 1, 0)).toEqual([]);
    });
});

describe('Etichette', () => {
    it('unisce testo e formule in un solo TeX', () => {
        expect(toTeX('$x = R\\cos\\alpha$, $y = R\\sin\\alpha$')).toBe('x = R\\cos\\alpha\\text{, }y = R\\sin\\alpha');
        expect(toTeX('$\\vec F$')).toBe('\\vec F');
        expect(toTeX('forza $F$ in N')).toBe('\\text{forza }F\\text{ in N}');
        expect(toTeX('50% di $m$')).toBe('\\text{50\\% di }m');
    });
});
