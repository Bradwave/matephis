import { describe, it, expect } from 'vitest';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';
import { SetsModel, intersect } from '../assets/js/matephis-sets-src/core/model.js';
import {
    parseInterval, evalInterval, intervalTeX, niceNumber, isSubset, sameInterval, contains,
    imageFromSamples, strictlyMonotone,
} from '../assets/js/matephis-sets-src/core/interval.js';
import { parseSelector, parseArgument, matchesTarget } from '../assets/js/matephis-sets-src/core/selectors.js';

/** Builds a model with the plot engine's compiler, as the scene does. */
function model(cfg, params = {}) {
    const warnings = [];
    const compiler = new ExpressionCompiler({
        getParams: () => params, getPoints: () => ({}), paramNames: Object.keys(params),
    });
    const m = new SetsModel(cfg, {
        evaluate: (v) => (typeof v === 'number' ? v : compiler.eval(String(v))),
        compile: (src, vars) => compiler.fn(src, vars),
        warn: (msg) => warnings.push(msg),
    });
    return { m, warnings, map: (id) => m.mapById.get(id) };
}

const I = (src) => evalInterval(parseInterval(src), Number);

describe('Intervalli', () => {
    it('legge estremi aperti, chiusi e infiniti', () => {
        expect(parseInterval('[0,1)')).toEqual({ lo: '0', hi: '1', loClosed: true, hiClosed: false });
        expect(parseInterval('( -inf , 2 ]')).toEqual({ lo: '-inf', hi: '2', loClosed: false, hiClosed: true });
        expect(parseInterval('R')).toEqual({ lo: '-inf', hi: '+inf', loClosed: false, hiClosed: false });
        expect(parseInterval('[max(0, 1), 3]')).toEqual({ lo: 'max(0, 1)', hi: '3', loClosed: true, hiClosed: true });
        expect(parseInterval('0,1')).toBeNull();
        expect(parseInterval('a_1')).toBeNull();
    });

    it('un estremo infinito è sempre aperto', () => {
        const J = evalInterval(parseInterval('[0, +inf]'), Number);
        expect(J.hi).toBe(Infinity);
        expect(J.hiClosed).toBe(false);
    });

    it('appartenenza e inclusione rispettano gli estremi', () => {
        expect(contains(I('[0,1)'), 0)).toBe(true);
        expect(contains(I('[0,1)'), 1)).toBe(false);
        expect(isSubset(I('[0.25,0.75]'), I('(0,1)'))).toBe(true);
        expect(isSubset(I('[0,1]'), I('(0,1)'))).toBe(false);
        expect(isSubset(I('(0,1)'), I('[0,1]'))).toBe(true);
        expect(sameInterval(I('[0,1]'), I('[0,1]'))).toBe(true);
    });

    it('scrive numeri e intervalli in TeX', () => {
        expect(niceNumber(0.25)).toBe('\\tfrac{1}{4}');
        expect(niceNumber(-2)).toBe('-2');
        expect(niceNumber(Math.PI / 2)).toBe('\\tfrac{\\pi}{2}');
        expect(niceNumber(0.1234)).toBe('0{,}123');
        expect(intervalTeX(I('[0.25,0.75]'))).toBe('\\left[\\tfrac{1}{4},\\,\\tfrac{3}{4}\\right]');
        expect(intervalTeX(I('(-inf,+inf)'))).toBe('\\mathbb{R}');
    });

    it('intersezione', () => {
        expect(intersect(I('[0,1]'), I('(0.5,2)'))).toEqual({ lo: 0.5, hi: 1, loClosed: false, hiClosed: true });
    });

    it('immagine da campioni: estremi raggiunti o solo avvicinati', () => {
        const img = imageFromSamples([{ v: 0.1, nearOpen: true }, { v: 0.5, nearOpen: false }, { v: 0.9, nearOpen: false }], [{ v: 0 }]);
        expect(img).toEqual({ lo: 0, hi: 0.9, loClosed: false, hiClosed: true });
    });

    it('monotonia stretta', () => {
        expect(strictlyMonotone([1, 2, 3])).toBe(true);
        expect(strictlyMonotone([3, 2, 1])).toBe(true);
        expect(strictlyMonotone([1, 2, 2])).toBe(false);
        expect(strictlyMonotone([1, 3, 2])).toBe(false);
    });
});

describe('Selettori', () => {
    it('riconosce operazioni e argomenti', () => {
        expect(parseSelector('image(f)')).toMatchObject({ op: 'image', map: 'f', arg: null });
        expect(parseSelector('preimage(f, b_1)')).toMatchObject({ op: 'preimage', map: 'f', arg: { kind: 'element', id: 'b_1' } });
        expect(parseSelector('image(h, [0, 1/2])').arg).toEqual({ kind: 'interval', src: '[0, 1/2]' });
        expect(parseArgument('{a_1, a_2}')).toEqual({ kind: 'elements', ids: ['a_1', 'a_2'] });
        expect(parseSelector('h1')).toBeNull();
    });

    it('i bersagli dei pulsanti accettano * e ignorano gli spazi', () => {
        expect(matchesTarget('image(f)', 'image( f )')).toBe(true);
        expect(matchesTarget('collisions(f)', '*(f)')).toBe(true);
        expect(matchesTarget('image(g)', 'image(f)')).toBe(false);
    });
});

const LAVAGNA = {
    sets: [
        { id: 'A', elements: ['a_1', 'a_2', 'a_3'] },
        { id: 'B', elements: ['b_1', 'b_2', 'b_3'] },
    ],
    maps: [{ id: 'f', from: 'A', to: 'B', pairs: { a_1: 'b_1', a_2: 'b_3', a_3: 'b_1' } }],
};

describe('Insiemi finiti', () => {
    it('immagine, controimmagine e collisioni', () => {
        const { m, map, warnings } = model(LAVAGNA);
        const f = map('f');
        expect(warnings).toEqual([]);
        expect(m.image(f).ids).toEqual(['b_1', 'b_3']);
        expect(m.image(f, parseArgument('{a_2}')).ids).toEqual(['b_3']);
        expect(m.preimage(f, parseArgument('b_1')).ids).toEqual(['a_1', 'a_3']);
        expect(m.preimage(f, parseArgument('b_2')).ids).toEqual([]);
        expect(m.collisions(f)).toEqual([{ target: 'b_1', sources: ['a_1', 'a_3'] }]);
    });

    it('proprietà esatte', () => {
        const { m, map } = model(LAVAGNA);
        expect(m.properties(map('f'))).toMatchObject({ isFunction: true, into: true, injective: false, surjective: false, bijective: false });
        const { m: m2, map: map2 } = model({
            sets: LAVAGNA.sets,
            maps: [{ id: 'g', from: 'A', to: 'B', pairs: { a_1: 'b_2', a_2: 'b_3', a_3: 'b_1' } }],
        });
        expect(m2.properties(map2('g'))).toMatchObject({ injective: true, surjective: true, bijective: true });
    });

    it('una relazione che non è una funzione', () => {
        const { m, map } = model({
            sets: LAVAGNA.sets,
            maps: [{ id: 'r', from: 'A', to: 'B', pairs: { a_1: ['b_1', 'b_2'], a_2: 'b_3' } }],
        });
        const p = m.properties(map('r'));
        expect(p.isFunction).toBe(false);
        expect(p.problems).toContain('a_1 ha 2 immagini');
        expect(p.problems).toContain('a_3 non ha immagine');
    });

    it('avvisa per elementi sconosciuti', () => {
        const { warnings } = model({ sets: LAVAGNA.sets, maps: [{ id: 'f', from: 'A', to: 'B', pairs: { a_1: 'c' } }] });
        expect(warnings[0]).toMatch(/'c' is not an element of B/);
    });

    it('espressione su elementi numerici, con valori fuori dal codominio', () => {
        const { m, map } = model({
            sets: [{ id: 'A', elements: ['-1', '0', '1', '2'] }, { id: 'B', elements: ['0', '1', '2'] }],
            maps: [{ id: 'q', from: 'A', to: 'B', expr: 'x^2' }],
        });
        const q = map('q');
        expect(m.apply(q, '-1')).toEqual(['1']);
        const p = m.properties(q);
        expect(p.into).toBe(false);
        expect(p.injective).toBe(false);
        expect(m.collisions(q)).toEqual([{ target: '1', sources: ['-1', '1'] }]);
    });

    it('composizione', () => {
        const { m, map, warnings } = model({
            sets: [...LAVAGNA.sets, { id: 'C', elements: ['c_1', 'c_2'] }],
            maps: [
                LAVAGNA.maps[0],
                { id: 'g', from: 'B', to: 'C', pairs: { b_1: 'c_2', b_2: 'c_1', b_3: 'c_1' } },
                { id: 'gf', compose: ['f', 'g'] },
            ],
        });
        expect(warnings).toEqual([]);
        const gf = map('gf');
        expect(gf.label).toBe('g \\circ f');
        expect(gf.from.id).toBe('A');
        expect(gf.to.id).toBe('C');
        expect(m.apply(gf, 'a_2')).toEqual(['c_1']);
        expect(m.image(gf).ids).toEqual(['c_1', 'c_2']);
        expect(m.properties(gf)).toMatchObject({ injective: false, surjective: true });
    });

    it('la composizione controlla dominio e codominio', () => {
        const { warnings } = model({
            sets: [...LAVAGNA.sets, { id: 'C', elements: ['c'] }],
            maps: [LAVAGNA.maps[0], { id: 'g', from: 'C', to: 'A', pairs: { c: 'a_1' } }, { id: 'x', compose: ['f', 'g'] }],
        });
        expect(warnings.some(w => /cannot compose/.test(w))).toBe(true);
    });
});

describe('Insiemi continui', () => {
    const inj = (expr, from = '[0,1]', to = '(0,1)') => model({
        sets: [{ id: 'I', interval: from }, { id: 'J', interval: to }],
        maps: [{ id: 'h', from: 'I', to: 'J', expr }],
    });

    it('x/2 + 1/4: [0,1] -> (0,1) è iniettiva, non suriettiva', () => {
        const { m, map } = inj('x/2 + 1/4');
        const img = m.image(map('h'));
        expect(img.kind).toBe('interval');
        expect(img.I.lo).toBeCloseTo(0.25, 9);
        expect(img.I.hi).toBeCloseTo(0.75, 9);
        expect(img.I.loClosed && img.I.hiClosed).toBe(true);
        expect(m.properties(map('h'))).toMatchObject({ into: true, injective: true, surjective: false });
    });

    it('x^2 su (-1,1) ha immagine [0,1)', () => {
        const { m, map } = inj('x^2', '(-1,1)', '[0,1)');
        const { I: J } = m.image(map('h'));
        expect(J.lo).toBeCloseTo(0, 9);
        expect(J.hi).toBeCloseTo(1, 6);
        expect(J.loClosed).toBe(true);
        expect(J.hiClosed).toBe(false);
        expect(m.properties(map('h'))).toMatchObject({ into: true, injective: false, surjective: true });
    });

    it('x da [0,1] in (0,1) non è a valori nel codominio', () => {
        const { m, map } = inj('x');
        const p = m.properties(map('h'));
        expect(p.into).toBe(false);
        expect(p.surjective).toBe(false);
    });

    it('1/x su (0,1] ha immagine illimitata', () => {
        const { m, map } = inj('1/x', '(0,1]', '[1,+inf)');
        const { I: J } = m.image(map('h'));
        expect(J.lo).toBeCloseTo(1, 9);
        expect(J.loClosed).toBe(true);
        expect(J.hi).toBe(Infinity);
        expect(m.properties(map('h'))).toMatchObject({ into: true, injective: true, surjective: true });
    });

    it('controimmagine di un valore e di un intervallo', () => {
        const { m, map } = inj('x^2', '[-1,1]', '[0,1]');
        const pts = m.preimage(map('h'), parseArgument('1/4')).points;
        expect(pts.length).toBe(2);
        expect(pts[0]).toBeCloseTo(-0.5, 6);
        expect(pts[1]).toBeCloseTo(0.5, 6);
        const parts = m.preimage(map('h'), parseArgument('[0, 1/4]')).parts;
        expect(parts.length).toBe(1);
        expect(parts[0][0]).toBeCloseTo(-0.5, 6);
        expect(parts[0][1]).toBeCloseTo(0.5, 6);
    });

    it('immagine di un sotto-intervallo', () => {
        const { m, map } = inj('x/2 + 1/4');
        const { I: J } = m.image(map('h'), parseArgument('[0, 1/2]'));
        expect(J.lo).toBeCloseTo(0.25, 9);
        expect(J.hi).toBeCloseTo(0.5, 9);
    });

    it('gli estremi seguono i parametri', () => {
        const params = { a: 2 };
        const { m } = model({ sets: [{ id: 'I', interval: '[0, a]' }] }, params);
        expect(m.setById.get('I').I.hi).toBe(2);
        params.a = 3;
        m.refresh();
        expect(m.setById.get('I').I.hi).toBe(3);
    });

    it('campioni per le frecce evitano gli estremi aperti', () => {
        const { m } = model({ sets: [{ id: 'I', interval: '(0,1)' }, { id: 'K', interval: '[0,1]' }] });
        expect(m.arrowSamples(m.setById.get('I'), 3)).toEqual([0.25, 0.5, 0.75]);
        expect(m.arrowSamples(m.setById.get('K'), 3)).toEqual([0, 0.5, 1]);
    });

    it('contrazione del quadrato: immagine nel piano e dentro il codominio', () => {
        const { m, map } = model({
            sets: [{ id: 'Q', rect: ['[0,1]', '[0,1]'] }, { id: 'R', rect: ['[0,1]', '[0,1]'] }],
            maps: [{ id: 'c', from: 'Q', to: 'R', expr: ['x/2 + 1/4', 'y/2 + 1/4'] }],
        });
        const img = m.image(map('c'));
        expect(img.kind).toBe('region');
        expect(Math.min(...img.polygon.map(p => p[0]))).toBeCloseTo(0.25, 9);
        expect(m.properties(map('c')).into).toBe(true);
    });

    it('immagine forzata e proprietà dichiarate', () => {
        const { m, map } = model({
            sets: [{ id: 'I', interval: '[0,1]' }, { id: 'J', interval: '(0,1)' }],
            maps: [{ id: 'h', from: 'I', to: 'J', expr: 'x/2+1/4', image: '[1/4, 3/4]', claims: { injective: true } }],
        });
        expect(m.image(map('h')).given).toBe(true);
        expect(m.properties(map('h')).claimed).toBe(true);
    });
});
