import { describe, it, expect } from 'vitest';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';
import { SetsModel, intersect, substituteX } from '../assets/js/matephis-sets-src/core/model.js';
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
        // Injective and surjective are not claimed for a relation
        expect(p.injective).toBe(null);
        expect(p.surjective).toBe(null);
        expect(p.bijective).toBe(false);
    });

    it('un minimo all\'interno del dominio: x^2 da [-1, 2] su [0, 4] è suriettiva', () => {
        const { m, map } = model({
            sets: [{ id: 'D', interval: '[-1, 2]' }, { id: 'C', interval: '[0, 4]' }],
            maps: [{ id: 'f', from: 'D', to: 'C', expr: 'x^2' }],
        });
        const img = m.image(map('f'));
        expect(img.I.lo).toBeCloseTo(0, 12);
        expect(img.I.loClosed).toBe(true);
        expect(m.properties(map('f'))).toMatchObject({ into: true, injective: false, surjective: true, bijective: false });
    });

    it('un massimo all\'interno: sin su [0, 3] su [0, 1]', () => {
        const { m, map } = model({
            sets: [{ id: 'D', interval: '[0, 3]' }, { id: 'C', interval: '[0, 1]' }],
            maps: [{ id: 'f', from: 'D', to: 'C', expr: 'sin(x)' }],
        });
        expect(m.properties(map('f')).surjective).toBe(true);
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
        expect(parts[0].lo).toBeCloseTo(-0.5, 6);
        expect(parts[0].hi).toBeCloseTo(0.5, 6);
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

describe('Funzioni a tratti', () => {
    const props = (m, f) => {
        const p = m.properties(f);
        return { isFunction: p.isFunction, into: p.into, injective: p.injective, surjective: p.surjective };
    };

    it('la funzione segno: tratti, immagine e controimmagini in un insieme finito', () => {
        const { m, map, warnings } = model({
            sets: [{ id: 'R', interval: 'R', window: [-3, 3] }, { id: 'S', elements: ['-1', '0', '1'] }],
            maps: [{ id: 'sgn', from: 'R', to: 'S', piecewise: [
                { on: '(-inf, 0)', expr: '-1' }, { on: 0, expr: '0' }, { on: '(0, +inf)', expr: '1' },
            ] }],
        });
        expect(warnings).toEqual([]);
        expect(m.apply(map('sgn'), -2)).toEqual(['-1']);
        expect(m.apply(map('sgn'), 0)).toEqual(['0']);
        expect(m.image(map('sgn')).ids).toEqual(['-1', '0', '1']);
        expect(props(m, map('sgn'))).toEqual({ isFunction: true, into: true, injective: false, surjective: true });
        expect(m.preimage(map('sgn'), parseArgument('0'))).toMatchObject({ kind: 'points', points: [0] });
        const pos = m.preimage(map('sgn'), parseArgument('1'));
        expect(pos.kind).toBe('intervals');
        expect(pos.parts).toEqual([{ lo: 0, hi: Infinity, loClosed: false, hiClosed: false }]);
    });

    const onTwo = (pieces, extra = {}) => model({
        sets: [{ id: 'I', interval: '[0,2]' }, { id: 'J', interval: '[0,2]' }],
        maps: [{ id: 'f', from: 'I', to: 'J', piecewise: pieces, ...extra }],
    });

    it('una biiezione non continua: i tratti si uniscono in [0, 2]', () => {
        const { m, map } = onTwo([{ on: '[0,1)', expr: 'x' }, { on: '[1,2]', expr: '3 - x' }]);
        const img = m.image(map('f'));
        expect(img.kind).toBe('interval');
        expect(img.I).toMatchObject({ lo: 0, hi: 2, loClosed: true, hiClosed: true });
        expect(props(m, map('f'))).toEqual({ isFunction: true, into: true, injective: true, surjective: true });
    });

    it('i limiti a un salto usano il tratto da cui si arriva', () => {
        // x + 1 su [0, 1) arriva a 2 senza toccarlo; g(0) = g(2) = 1
        const { m, map } = onTwo([{ on: '[0,1)', expr: 'x + 1' }, { on: '[1,2]', expr: 'x - 1' }]);
        expect(m.image(map('f')).I).toMatchObject({ lo: 0, hi: 2, loClosed: true, hiClosed: false });
        expect(props(m, map('f'))).toMatchObject({ injective: false, surjective: false });
    });

    it('immagine come unione di intervalli', () => {
        const { m, map } = onTwo([{ on: '[0,1)', expr: 'x' }, { on: '[1,2]', expr: 'x/4 + 3/2' }]);
        const img = m.image(map('f'));
        expect(img.kind).toBe('intervals');
        expect(img.parts.map(P => [P.lo, P.hi, P.loClosed, P.hiClosed])).toEqual([[0, 1, true, false], [1.75, 2, true, true]]);
        expect(props(m, map('f'))).toMatchObject({ injective: true, surjective: false });
    });

    it('tratti che si sovrappongono nell\'immagine non danno una funzione iniettiva', () => {
        const { m, map } = onTwo([{ on: '[0,1]', expr: 'x' }, { on: '(1,2]', expr: 'x - 1/2' }]);
        expect(props(m, map('f')).injective).toBe(false);
    });

    it('un buco tra i tratti: la funzione non è definita ovunque', () => {
        const { m, map } = onTwo([{ on: '[0,1)', expr: 'x' }, { on: '(1,2]', expr: 'x' }]);
        const p = m.properties(map('f'));
        expect(p.isFunction).toBe(false);
        expect(p.bijective).toBe(false);
        expect(p.problems[0]).toMatch(/non è definita/);
        expect(m.apply(map('f'), 1)).toEqual([]);
    });

    it('anche un\'espressione può non essere definita ovunque', () => {
        const { m, map } = onTwo(undefined, { piecewise: undefined, expr: 'sqrt(x - 1)' });
        expect(m.properties(map('f')).isFunction).toBe(false);
    });

    it('tratti dati da una condizione', () => {
        const { m, map } = onTwo([{ if: 'x < 1', expr: '2 - x' }, { expr: 'x - 1' }]);
        expect(m.image(map('f')).I).toMatchObject({ lo: 0, hi: 2, loClosed: true, hiClosed: true });
        expect(props(m, map('f'))).toEqual({ isFunction: true, into: true, injective: true, surjective: true });
    });

    it('avvisa di tratti sovrapposti e di opzioni sconosciute', () => {
        const { warnings } = onTwo([{ on: '[0,1]', expr: 'x' }, { on: '[1,2]', expr: 'x', when: 1 }]);
        expect(warnings.some(w => /overlap/.test(w))).toBe(true);
        expect(warnings.some(w => /unknown option 'when'/.test(w))).toBe(true);
    });
});

describe('Inverse', () => {
    it('l\'inversa di una funzione tra insiemi finiti è una relazione', () => {
        const { m, map } = model({
            sets: [{ id: 'A', elements: ['a', 'b', 'c'] }, { id: 'B', elements: ['1', '2', '3'] }],
            maps: [{ id: 'f', from: 'A', to: 'B', pairs: { a: '1', b: '1', c: '2' } }, { id: 'g', inverse: 'f' }],
        });
        const g = map('g');
        expect(g.label).toBe('f^{-1}');
        expect([g.from.id, g.to.id]).toEqual(['B', 'A']);
        expect(['1', '2', '3'].map(y => m.apply(g, y))).toEqual([['a', 'b'], ['c'], []]);
        const p = m.properties(g);
        expect(p.isFunction).toBe(false);
        expect(p.bijective).toBe(false);
        expect(p.problems).toEqual(['1 ha 2 immagini', '3 non ha immagine']);
        // Image of the inverse = preimage under f, and the other way round
        expect(m.image(g, parseArgument('{1}')).ids).toEqual(['a', 'b']);
        expect(m.preimage(g, parseArgument('{c}')).ids).toEqual(['2']);
    });

    it('l\'inversa di x^2 su [-1, 1]: due controimmagini', () => {
        const { m, map } = model({
            sets: [{ id: 'I', interval: '[-1,1]' }, { id: 'J', interval: '[0,1]' }],
            maps: [{ id: 's', from: 'I', to: 'J', expr: 'x^2' }, { id: 'r', inverse: 's' }],
        });
        expect(m.apply(map('r'), 0.25)).toEqual([-0.5, 0.5]);
        const p = m.properties(map('r'));
        expect(p).toMatchObject({ isFunction: false, injective: null, surjective: null, bijective: false });
        expect(m.image(map('r')).I).toMatchObject({ lo: -1, hi: 1 });
    });

    it('l\'inversa di una biiezione è una biiezione, e la composizione è l\'identità', () => {
        const { m, map } = model({
            sets: [{ id: 'I', interval: '[0,1]' }, { id: 'J', interval: '[0,2]' }],
            maps: [{ id: 's', from: 'I', to: 'J', expr: '2x' }, { id: 'r', inverse: 's' }, { id: 'id', compose: ['s', 'r'] }],
        });
        expect(m.apply(map('r'), 0.5)).toEqual([0.25]);
        expect(m.properties(map('r'))).toMatchObject({ isFunction: true, bijective: true });
        expect(m.apply(map('id'), 0.3)[0]).toBeCloseTo(0.3, 9);
        expect(m.properties(map('id'))).toMatchObject({ injective: true, surjective: true });
        expect(map('id').label).toBe('s^{-1} \\circ s');
    });

    it('avvisa se la funzione di base manca o è nel piano', () => {
        const { warnings } = model({
            sets: [{ id: 'Q', rect: ['[0,1]', '[0,1]'] }],
            maps: [{ id: 'c', from: 'Q', to: 'Q', expr: ['x', 'y'] }, { id: 'a', inverse: 'c' }, { id: 'b', inverse: 'zz' }],
        });
        expect(warnings.some(w => /inverse of a map from or into the plane/.test(w))).toBe(true);
        expect(warnings.some(w => /unknown: 'zz'/.test(w))).toBe(true);
    });
});

describe('Verifiche nel piano', () => {
    const { m, map } = model({
        sets: [
            { id: 'Q', rect: ['[0,1]', '[0,1]'] }, { id: 'R', rect: ['[0,1]', '[0,1]'] },
            { id: 'D', disk: { center: [0, 0], radius: 1 } },
            { id: 'T', interval: '[0, 2*pi]' }, { id: 'U', interval: '[0, 2*pi)' }, { id: 'L', interval: '[0,2]' },
        ],
        maps: [
            { id: 'c', from: 'Q', to: 'R', expr: ['x/2 + 1/4', 'y/2 + 1/4'] },
            { id: 'sw', from: 'Q', to: 'R', expr: ['y', 'x'] },
            { id: 'fold', from: 'Q', to: 'R', expr: ['4x(1-x)', 'y'] },
            { id: 'sq', from: 'D', to: 'D', expr: ['x^2 - y^2', '2x*y'] },
            { id: 'closed', from: 'T', to: 'D', expr: ['cos(x)', 'sin(x)'] },
            { id: 'open', from: 'U', to: 'D', expr: ['cos(x)', 'sin(x)'] },
            { id: 'F', from: 'Q', to: 'L', expr: 'x^2 + y^2' },
        ],
    });
    const p = (id) => { const r = m.properties(map(id)); return [r.injective, r.surjective]; };

    it('dal piano nel piano: jacobiano e bordo', () => {
        expect(p('c')).toEqual([true, false]);
        expect(p('sw')).toEqual([true, true]);
        expect(p('fold')).toEqual([false, true]);
        expect(p('sq')).toEqual([false, true]);
    });

    it('una curva chiusa non è iniettiva, una aperta sì', () => {
        expect(p('closed')).toEqual([false, false]);
        expect(p('open')).toEqual([true, false]);
    });

    it('dal piano in un intervallo: mai iniettiva; curve e regioni di livello', () => {
        expect(p('F')).toEqual([false, true]);
        const level = m.preimage(map('F'), parseArgument('1'));
        expect(level.kind).toBe('level');
        expect(level.segments.length).toBeGreaterThan(20);
        // Every point of the level curve is at distance 1 from the origin
        level.segments.forEach(([a]) => expect(Math.hypot(a[0], a[1])).toBeCloseTo(1, 2));
        const region = m.preimage(map('F'), parseArgument('[0, 1/4]'));
        expect(region.kind).toBe('cells');
        const area = region.cells.reduce((s, [x0, y0, x1, y1]) => s + (x1 - x0) * (y1 - y0), 0);
        expect(area).toBeCloseTo(Math.PI / 16, 1);
    });
});

describe('Selettori annidati', () => {
    it('image(g, image(f)) è g(f(X)), come image(g ∘ f)', () => {
        const { m, map } = model({
            sets: [{ id: 'X', interval: '[-2,2]' }, { id: 'Y', interval: '[-2,2]' }, { id: 'Z', interval: '[-2,2]' }],
            maps: [
                { id: 'f', from: 'X', to: 'Y', expr: 'x/2 + 1/2' },
                { id: 'g', from: 'Y', to: 'Z', expr: 'x^2 - 1' },
                { id: 'gf', compose: ['f', 'g'] },
            ],
        });
        const nested = m.image(map('g'), parseArgument('image(f)'));
        const direct = m.image(map('gf'));
        expect(nested.kind).toBe('interval');
        expect(nested.I.lo).toBeCloseTo(-1, 6);
        expect(nested.I.hi).toBeCloseTo(1.25, 6);
        expect(direct.I.lo).toBeCloseTo(nested.I.lo, 6);
        expect(direct.I.hi).toBeCloseTo(nested.I.hi, 6);
    });

    it('tra insiemi finiti, e con una controimmagine dentro', () => {
        const { m, map } = model({
            sets: [{ id: 'A', elements: ['1', '2', '3'] }, { id: 'B', elements: ['x', 'y'] }, { id: 'C', elements: ['p', 'q'] }],
            maps: [
                { id: 'f', from: 'A', to: 'B', pairs: { 1: 'x', 2: 'x', 3: 'y' } },
                { id: 'g', from: 'B', to: 'C', pairs: { x: 'p', y: 'q' } },
            ],
        });
        expect(m.image(map('g'), parseArgument('image(f, {1})')).ids).toEqual(['p']);
        expect(m.preimage(map('f'), parseArgument('preimage(g, {p})')).ids).toEqual(['1', '2']);
    });

    it('un\'unione di intervalli come argomento', () => {
        const { m, map } = model({
            sets: [{ id: 'I', interval: '[-2,2]' }, { id: 'J', interval: '[0,4]' }, { id: 'K', interval: '[0,4]' }],
            maps: [{ id: 's', from: 'I', to: 'J', expr: 'x^2' }, { id: 'h', from: 'J', to: 'K', expr: 'x' }],
        });
        // s^{-1}([1, 4]) = [-2, -1] ∪ [1, 2]; its image under s is [1, 4] again
        const back = m.image(map('s'), parseArgument('preimage(s, [1, 4])'));
        expect(back.kind).toBe('interval');
        expect(back.I.lo).toBeCloseTo(1, 6);
        expect(back.I.hi).toBeCloseTo(4, 6);
    });
});

describe('Espressioni per il grafico', () => {
    const { m, map } = model({
        sets: [{ id: 'X', interval: '[-2,2]' }, { id: 'Y', interval: '[-2,2]' }, { id: 'Z', interval: '[-2,2]' }],
        maps: [
            { id: 'f', from: 'X', to: 'Y', expr: 'x/2 + 1/2' },
            { id: 'g', from: 'Y', to: 'Z', expr: 'x^2 - 1' },
            { id: 'gf', compose: ['f', 'g'] },
            { id: 'p', from: 'X', to: 'Y', piecewise: [{ on: '[-2, 0)', expr: '-x - 1' }, { on: 0, expr: '0' }, { if: 'x > 0', expr: 'x^2/2' }] },
            { id: 'r', inverse: 'f' },
        ],
    });
    const compiler = new ExpressionCompiler({ getParams: () => ({}), getPoints: () => ({}), paramNames: [] });
    const at = (src, x) => compiler.fn(src, ['x'])(x);

    it('sostituisce x senza toccare exp o max', () => {
        expect(substituteX('x^2 + 2x - exp(x) + max(x, 1)', 'p')).toBe('(p)^2 + 2(p) - exp((p)) + max((p), 1)');
    });

    it('una composizione e una funzione a tratti diventano una formula sola', () => {
        expect(at(m.exprString(map('gf')), 1)).toBeCloseTo(0, 12);
        expect(at(m.exprString(map('gf')), 3)).toBeCloseTo(3, 12);
        const e = m.exprString(map('p'));
        expect(at(e, -1)).toBe(0);
        expect(at(e, 0)).toBe(0);
        expect(at(e, 2)).toBe(2);
        expect(m.exprString(map('r'))).toBe(null);
    });
});

describe('Dynagraph', () => {
    it('con la scala condivisa tutte le rette hanno la stessa finestra', () => {
        const sets = [{ id: 'X', interval: '[0,1]' }, { id: 'Y', interval: '[-2,3]' }];
        const shared = model({ dynagraph: true, sets }).m;
        expect(shared.setById.get('X').window).toEqual([-2, 3]);
        expect(shared.setById.get('Y').window).toEqual([-2, 3]);
        const own = model({ dynagraph: { scale: 'own' }, sets }).m;
        expect(own.setById.get('X').window).toEqual([0, 1]);
    });
});
