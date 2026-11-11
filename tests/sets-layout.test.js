import { describe, it, expect } from 'vitest';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';
import { SetsModel } from '../assets/js/matephis-sets-src/core/model.js';
import { computeLayout, elementOrder, pointPx } from '../assets/js/matephis-sets-src/core/layout.js';
import { convexHull, roundedHullPath, insideHull, curvedArrow } from '../assets/js/matephis-sets-src/core/geometry.js';
import { validateConfig } from '../assets/js/matephis-sets-src/core/config.js';

function model(cfg) {
    const compiler = new ExpressionCompiler({ getParams: () => ({}), getPoints: () => ({}) });
    return new SetsModel(cfg, {
        evaluate: (v) => (typeof v === 'number' ? v : compiler.eval(String(v))),
        compile: (src, vars) => compiler.fn(src, vars),
    });
}

const measure = (s) => ({ w: String(s).length * 9, h: 18 });

const LAVAGNA = {
    sets: [
        { id: 'A', elements: ['a_1', 'a_2', 'a_3'] },
        { id: 'B', elements: ['b_1', 'b_2', 'b_3'] },
    ],
    maps: [{ id: 'f', from: 'A', to: 'B', pairs: { a_1: 'b_1', a_2: 'b_3', a_3: 'b_1' } }],
};

describe('Ordine degli elementi', () => {
    it('il codominio segue le controimmagini; gli elementi senza controimmagine vanno in fondo', () => {
        const order = elementOrder(model(LAVAGNA));
        expect(order.get('A')).toEqual(['a_1', 'a_2', 'a_3']);
        // b_1 (from a_1 and a_3, mean 0.5) and b_3 (from a_2, 0.5) keep their order; b_2 has no preimage
        expect(order.get('B')).toEqual(['b_1', 'b_3', 'b_2']);
    });

    it('riduce gli incroci di una permutazione', () => {
        const m = model({
            sets: [{ id: 'A', elements: ['1', '2', '3'] }, { id: 'B', elements: ['x', 'y', 'z'] }],
            maps: [{ id: 'f', from: 'A', to: 'B', pairs: { 1: 'z', 2: 'x', 3: 'y' } }],
        });
        expect(elementOrder(m).get('B')).toEqual(['z', 'x', 'y']);
    });

    it('"order": "given" e reorder: false mantengono l\'ordine scritto', () => {
        const cfg = { ...LAVAGNA, sets: [LAVAGNA.sets[0], { ...LAVAGNA.sets[1], order: 'given' }] };
        expect(elementOrder(model(cfg)).get('B')).toEqual(['b_1', 'b_2', 'b_3']);
        expect(elementOrder(model(LAVAGNA), { reorder: false }).get('B')).toEqual(['b_1', 'b_2', 'b_3']);
    });
});

describe('Layout', () => {
    it('in riga: insiemi da sinistra a destra, elementi in colonna dentro l\'ovale', () => {
        const m = model(LAVAGNA);
        const L = computeLayout(m, { width: 500, measure });
        const A = L.sets.get('A'), B = L.sets.get('B');
        expect(A.cx).toBeLessThan(B.cx);
        expect(A.ry).toBe(B.ry);
        A.elements.forEach(p => {
            expect(((p.x - A.cx) / A.rx) ** 2 + ((p.y - A.cy) / A.ry) ** 2).toBeLessThan(1);
        });
        const ys = [...A.elements.values()].map(p => p.y);
        expect(ys).toEqual([...ys].sort((a, b) => a - b));
        // Domain labels on the left, codomain labels on the right
        expect(A.elements.get('a_1').side).toBe('before');
        expect(B.elements.get('b_1').side).toBe('after');
        expect(L.height).toBeGreaterThan(2 * A.ry);
    });

    it('in colonna: insiemi uno sotto l\'altro, elementi in riga', () => {
        const L = computeLayout(model(LAVAGNA), { width: 400, measure, orient: 'column' });
        const A = L.sets.get('A'), B = L.sets.get('B');
        expect(A.cy).toBeLessThan(B.cy);
        const xs = [...A.elements.values()].map(p => p.x);
        expect(new Set([...A.elements.values()].map(p => p.y)).size).toBe(1);
        expect(xs).toEqual([...xs].sort((a, b) => a - b));
    });

    it('un insieme in mezzo a una catena ha le etichette sopra i punti', () => {
        const m = model({
            sets: [...LAVAGNA.sets, { id: 'C', elements: ['c'] }],
            maps: [LAVAGNA.maps[0], { id: 'g', from: 'B', to: 'C', pairs: { b_1: 'c', b_2: 'c', b_3: 'c' } }],
        });
        const L = computeLayout(m, { width: 600, measure });
        expect(L.sets.get('B').elements.get('b_1').side).toBe('across');
    });

    it('intervalli: in riga lo 0 è in basso, in colonna a sinistra', () => {
        const m = model({ sets: [{ id: 'I', interval: '[0,1]' }, { id: 'J', interval: '(0,1)' }], maps: [{ id: 'h', from: 'I', to: 'J', expr: 'x/2' }] });
        const row = computeLayout(m, { width: 500, measure });
        const I = row.sets.get('I');
        expect(I.toPx(0)[1]).toBeGreaterThan(I.toPx(1)[1]);
        expect(I.fromPx(...I.toPx(0.3))).toBeCloseTo(0.3, 9);
        const col = computeLayout(m, { width: 500, measure, orient: 'column' });
        const Ic = col.sets.get('I');
        expect(Ic.toPx(0)[0]).toBeLessThan(Ic.toPx(1)[0]);
        expect(Ic.fromPx(...Ic.toPx(0.7))).toBeCloseTo(0.7, 9);
        expect(pointPx(row, m.setById.get('J'), 0.5)).toEqual(row.sets.get('J').toPx(0.5));
    });

    it('regioni del piano: stessa scala sui due assi, y verso l\'alto', () => {
        const m = model({ sets: [{ id: 'Q', rect: ['[0,2]', '[0,1]'] }] });
        const Q = computeLayout(m, { width: 500, measure }).sets.get('Q');
        expect(Q.box.w / Q.box.h).toBeCloseTo(2, 6);
        expect(Q.toPx([0, 1])[1]).toBeLessThan(Q.toPx([0, 0])[1]);
        const back = Q.fromPx(...Q.toPx([1.5, 0.25]));
        expect(back[0]).toBeCloseTo(1.5, 9);
        expect(back[1]).toBeCloseTo(0.25, 9);
    });
});

describe('Geometria', () => {
    it('inviluppo convesso', () => {
        const hull = convexHull([[0, 0], [2, 0], [1, 1], [2, 2], [0, 2]]);
        expect(hull).toHaveLength(4);
        expect(insideHull(hull, [1, 1])).toBe(true);
        expect(insideHull(hull, [3, 1])).toBe(false);
        expect(insideHull(hull, [2.5, 1], 1)).toBe(true);
    });

    it('contorno arrotondato: cerchio, capsula, poligono', () => {
        expect(roundedHullPath([[10, 10]], 5)).toMatch(/^M5,10a5,5/);
        const capsule = roundedHullPath([[0, 0], [0, 40]], 10);
        expect((capsule.match(/A/g) || []).length).toBe(2);
        const poly = roundedHullPath([[0, 0], [40, 0], [20, 30]], 10);
        expect((poly.match(/A/g) || []).length).toBe(3);
    });

    it('freccia curva accorciata agli estremi', () => {
        const a = curvedArrow([0, 0], [100, 0], { trimStart: 10, trimEnd: 10 });
        expect(a.start[0]).toBeCloseTo(10, 6);
        expect(a.end[0]).toBeCloseTo(90, 6);
        expect(a.angle).toBeCloseTo(0, 6);
        const b = curvedArrow([0, 0], [100, 0], { bend: 0.3 });
        expect(b.mid[1]).toBeLessThan(0);
    });
});

describe('Configurazione', () => {
    it('avvisa per opzioni sconosciute e per quelle delle fasi successive', () => {
        const w = validateConfig({ sets: [{ id: 'A', elements: [], colr: 'red' }], venn: true, shw: [] });
        expect(w).toContain("Option 'venn' is not implemented yet and is ignored");
        expect(w.some(x => /unknown option 'colr'.*did you mean 'color'/.test(x))).toBe(true);
        expect(w.some(x => /'shw'.*did you mean 'show'/.test(x))).toBe(true);
    });
});
