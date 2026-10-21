import { describe, it, expect } from 'vitest';
import { Resolver } from '../assets/js/matephis-physics-src/core/resolver.js';
import { OBJECT_TYPES } from '../assets/js/matephis-physics-src/objects/index.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

const g = 9.81;
const deg = Math.PI / 180;

/** Resolves a scene config without any DOM. */
function scene(config, params = {}) {
    const warnings = [];
    const p = { g, ...params };
    let resolver;
    const objects = config.objects.filter(o => OBJECT_TYPES[o.type]);
    const compiler = new ExpressionCompiler({
        getParams: () => p, getPoints: () => resolver.resolved,
        paramNames: Object.keys(p), pointNames: objects.map(o => o.id).filter(Boolean),
    });
    resolver = new Resolver({ objects, types: OBJECT_TYPES, compiler, angleUnit: 'deg', config, warn: (m) => warnings.push(m) });
    resolver.resolveAll({ xMin: 0, xMax: 10, yMin: 0, yMax: 6 });
    const forces = (body) => resolver.objects.filter(o => o.on === body && o.type === 'force').map(o => o.id);
    return { r: resolver, warnings, st: (id) => resolver.state(id), at: (ref) => resolver.point(ref), forces };
}

const close = (a, b, digits = 9) => {
    expect(a.x).toBeCloseTo(b.x, digits);
    expect(a.y).toBeCloseTo(b.y, digits);
};

const incline = (body = {}, root = {}) => scene({
    ...root,
    objects: [
        { id: 's', type: 'slope', at: [1, 0], angle: 30, length: 6 },
        { id: 'A', type: 'block', on: 's', size: [0.8, 0.5], mass: 2, forces: 'auto', ...body },
    ],
});

describe('Forze automatiche su un piano inclinato', () => {
    it('genera peso e reazione normale con le direzioni del piano', () => {
        const { forces, st, at } = incline();
        expect(forces('A')).toEqual(['A.P', 'A.N']);
        close(st('A.P').vec, { x: 0, y: -2 * g });
        close(st('A.P').pos, st('A').pos);
        // N = m g cos α, perpendicular to the slope, at the contact point
        expect(st('A.N').mag).toBeCloseTo(2 * g * Math.cos(30 * deg), 9);
        close(st('A.N').vec, { x: -2 * g * Math.cos(30 * deg) * Math.sin(30 * deg), y: 2 * g * Math.cos(30 * deg) ** 2 });
        close(st('A.N').pos, at('A.bottom'));
    });

    it('applica tutto al centro con applyAt "center"', () => {
        const { st } = incline({}, { applyAt: 'center' });
        close(st('A.N').pos, st('A').pos);
        const { st: st2 } = incline({ applyAt: 'center' });
        close(st2('A.N').pos, st2('A').pos);
    });

    it('aggiunge l\'attrito statico verso l\'alto quando c\'è mu', () => {
        const { forces, st } = incline({ mu: 0.8 });
        expect(forces('A')).toContain('A.f');
        const f = st('A.f');
        // Holds the block: m g sin α (below μN = 0.8 · m g cos α), up the slope
        expect(f.mag).toBeCloseTo(2 * g * Math.sin(30 * deg), 9);
        expect(f.vec.x).toBeGreaterThan(0);
        expect(f.vec.y).toBeGreaterThan(0);
    });

    it('limita l\'attrito statico a μN', () => {
        const { st } = incline({ mu: 0.2 });
        expect(st('A.f').mag).toBeCloseTo(0.2 * 2 * g * Math.cos(30 * deg), 9);
    });

    it('usa l\'attrito dinamico μN, opposto al moto dichiarato', () => {
        const { st } = incline({ mu: 0.3, moving: 'up' });
        const f = st('A.f');
        expect(f.mag).toBeCloseTo(0.3 * 2 * g * Math.cos(30 * deg), 9);
        expect(f.vec.y).toBeLessThan(0);
    });

    it('chiede la direzione del moto su una superficie orizzontale', () => {
        const { warnings, st } = scene({ objects: [
            { id: 'g', type: 'ground', mu: 0.4 },
            { id: 'A', type: 'block', on: 'g', forces: 'auto' },
        ] });
        expect(st('A.f')).toBeNull();
        expect(warnings.some(w => /moving.*tendency/.test(w))).toBe(true);
    });

    it('esclude, modifica e aggiunge forze', () => {
        const { forces, r, st } = incline({
            mu: 0.5, exclude: ['f'],
            override: { N: { label: 'R' }, '*': { hidden: true } },
            add: [{ id: 'F', dir: 'tangent', mag: 5, label: 'F' }],
        });
        expect(forces('A')).toEqual(['A.P', 'A.N', 'A.F']);
        expect(r.objectById('A.N').label).toBe('R');
        expect(r.objectById('A.P').hidden).toBe(true);
        expect(st('A.F').mag).toBe(5);
    });

    it('si scompone con l\'id della forza', () => {
        const { r } = scene({ objects: [
            { id: 's', type: 'slope', at: [1, 0], angle: 30, length: 6 },
            { id: 'A', type: 'block', on: 's', mass: 2, forces: 'auto' },
            { id: 'd', type: 'decompose', vector: 'A.P', frame: 's' },
        ] });
        expect(r.state('d').comps[0].value).toBeCloseTo(-2 * g * 0.5, 9);
    });

    it('usa mag dell\'override per il valore esatto', () => {
        const { st } = incline({ override: { N: { mag: 7 } } });
        expect(st('A.N').mag).toBeCloseTo(7, 12);
    });
});

describe('Forze automatiche con funi, corpi appoggiati e molle', () => {
    it('tavolo e massa appesa: tensione lungo la fune, pari al peso appeso', () => {
        const { forces, st, at } = scene({ objects: [
            { id: 't', type: 'table', at: [0, 2], width: 4 },
            { id: 'A', type: 'block', on: 't', pos: 0.4, size: [0.8, 0.4], mass: 2, forces: 'auto' },
            { id: 'p', type: 'pulley', at: [4.2, 2.0], radius: 0.2 },
            { id: 'B', type: 'block', at: [4.4, 0.5], size: [0.4, 0.4], mass: 3, forces: 'auto' },
            { type: 'rope', from: 'A.right', to: 'B.top', over: ['p'] },
        ] });
        expect(forces('A')).toEqual(['A.P', 'A.N', 'A.T']);
        expect(forces('B')).toEqual(['B.P', 'B.T']);
        close(st('A.T').vec, { x: 3 * g, y: 0 });
        close(st('A.T').pos, at('A.right'));
        close(st('B.T').vec, { x: 0, y: 3 * g });
    });

    it('macchina di Atwood: la stessa tensione sui due lati', () => {
        const { st } = scene({ objects: [
            { id: 'p', type: 'pulley', at: [3, 4], radius: 0.3 },
            { id: 'A', type: 'block', at: [2.7, 2], size: [0.4, 0.4], mass: 2, forces: 'auto' },
            { id: 'B', type: 'block', at: [3.3, 1.5], size: [0.4, 0.4], mass: 4, forces: 'auto' },
            { type: 'rope', from: 'A.top', to: 'B.top', over: ['p'] },
        ] });
        expect(st('A.T').mag).toBeCloseTo(3 * g, 9);
        expect(st('B.T').mag).toBeCloseTo(3 * g, 9);
    });

    it('blocchi impilati: il corpo sotto riceve la spinta di quello sopra', () => {
        const { forces, st, at } = scene({ objects: [
            { id: 'g', type: 'ground' },
            { id: 'A', type: 'block', on: 'g', size: [2, 1], mass: 5, forces: 'auto' },
            { id: 'B', type: 'block', on: 'A', size: [1, 0.5], mass: 2, forces: 'auto' },
        ] });
        expect(forces('A')).toEqual(['A.P', 'A.N', 'A.N_B']);
        close(st('A.N_B').vec, { x: 0, y: -2 * g });
        close(st('A.N_B').pos, at('A.top'));
        close(st('B.N').vec, { x: 0, y: 2 * g });
    });

    it('molla: la forza elastica tira se allungata, spinge se compressa', () => {
        const spring = (x) => scene({ objects: [
            { id: 'g', type: 'ground', from: [0, 0], to: [10, 0] },
            { id: 'w', type: 'wall', at: [0, 0], height: 2 },
            { id: 'A', type: 'block', on: 'g', pos: 'x0 + x', posUnit: 'm', size: [1, 0.6], forces: 'auto' },
            { type: 'spring', from: [0, 0.3], to: 'A.left', k: 10, rest: 3 },
        ] }, { x, x0: 3.5 });
        close(spring(0.5).st('A.Fel').vec, { x: -5, y: 0 });
        close(spring(-1).st('A.Fel').vec, { x: 10, y: 0 });
    });

    it('chiede k e rest per la molla', () => {
        const { warnings } = scene({ objects: [
            { id: 'g', type: 'ground' },
            { id: 'A', type: 'block', on: 'g', forces: 'auto' },
            { type: 'spring', from: [0, 0.3], to: 'A.left' },
        ] });
        expect(warnings.some(w => /needs "k".*"rest"/.test(w))).toBe(true);
    });

    it('pendolo: tensione verso il perno, m g cos θ', () => {
        const { st, forces } = scene({ objects: [
            { id: 'p', type: 'pendulum', pivot: [5, 5], length: 2, theta: 30, mass: 2, forces: 'auto' },
        ] });
        expect(forces('p')).toEqual(['p.P', 'p.T']);
        expect(st('p.T').mag).toBeCloseTo(2 * g * Math.cos(30 * deg), 9);
        close(st('p.T').vec, { x: -2 * g * Math.cos(30 * deg) * 0.5, y: 2 * g * Math.cos(30 * deg) ** 2 });
    });
});

describe('Risultante, coppie e diagramma di corpo libero', () => {
    it('somma a zero le forze di un blocco fermo sul piano (attrito statico)', () => {
        const { r } = scene({ objects: [
            { id: 's', type: 'slope', at: [1, 0], angle: 30, length: 6 },
            { id: 'A', type: 'block', on: 's', mass: 2, mu: 0.8, forces: 'auto' },
            { id: 'R', type: 'resultant', on: 'A' },
        ] });
        expect(r.state('R').mag).toBeLessThan(1e-9);
        expect(r.state('R').parts).toHaveLength(3);
    });

    it('non conta la risultante nella scala automatica', () => {
        const { r } = scene({ objects: [
            { id: 'A', type: 'particle', at: [1, 1] },
            { type: 'force', on: 'A', vec: [3, 0] },
            { type: 'force', on: 'A', vec: [0, 4] },
            { id: 'R', type: 'resultant', on: 'A' },
        ] });
        expect(r.state('R').mag).toBeCloseTo(5, 12);
        expect(r.scales.force * 4).toBeCloseTo(0.28 * 6, 9);
    });

    it('accoppia azione e reazione tra corpi impilati', () => {
        const { r } = scene({ objects: [
            { id: 'g', type: 'ground' },
            { id: 'A', type: 'block', on: 'g', size: [2, 1], mass: 5, forces: 'auto' },
            { id: 'B', type: 'block', on: 'A', size: [1, 0.5], mass: 2, forces: 'auto' },
            { type: 'pairs', between: ['A', 'B'] },
        ] });
        const idx = (id) => r.pairIndex.get(r.objectById(id));
        expect(idx('A.N_B')).toBe(0);
        expect(idx('B.N')).toBe(0);
        expect(idx('A.N')).toBeUndefined();
    });

    it('accoppia le forze scritte a mano con "by"', () => {
        const { r } = scene({ objects: [
            { id: 'A', type: 'particle', at: [1, 1] },
            { id: 'B', type: 'particle', at: [3, 1] },
            { id: 'F1', type: 'force', on: 'A', dir: 'toward:B', mag: 2, by: 'B' },
            { id: 'F2', type: 'force', on: 'B', dir: 'toward:A', mag: 2, by: 'A' },
            { type: 'pairs', between: ['A', 'B'] },
        ] });
        expect(r.pairIndex.get(r.objectById('F1'))).toBe(r.pairIndex.get(r.objectById('F2')));
    });

    it('raccoglie nel diagramma di corpo libero le forze del corpo', () => {
        const { r } = scene({ objects: [
            { id: 's', type: 'slope', at: [1, 0], angle: 30, length: 6 },
            { id: 'A', type: 'block', on: 's', mass: 2, forces: 'auto' },
            { type: 'force', on: 'A', dir: 'tangent', mag: 3, id: 'F' },
            { id: 'd', type: 'fbd', of: 'A' },
        ] });
        expect(r.state('d').forces.map(o => o.id)).toEqual(['A.P', 'A.N', 'F']);
    });
});
