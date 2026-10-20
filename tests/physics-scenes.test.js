import { describe, it, expect } from 'vitest';
import { Resolver } from '../assets/js/matephis-physics-src/core/resolver.js';
import { OBJECT_TYPES } from '../assets/js/matephis-physics-src/objects/index.js';
import { parseRef } from '../assets/js/matephis-physics-src/core/anchors.js';
import { tangentSegment, ropePath, wrapSide, springPoints } from '../assets/js/matephis-physics-src/core/geometry.js';
import { dot, sub, len, dist } from '../assets/js/matephis-physics-src/core/vec.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

const VIEW = { xMin: 0, xMax: 10, yMin: 0, yMax: 5 };

/** Resolves a scene config without any DOM; returns helpers to inspect it. */
function scene(config, { params = {}, view = VIEW } = {}) {
    const warnings = [];
    const p = { g: 9.81, ...params };
    let resolver;
    const objects = config.objects.filter(o => OBJECT_TYPES[o.type]);
    const compiler = new ExpressionCompiler({
        getParams: () => p,
        getPoints: () => resolver.resolved,
        paramNames: Object.keys(p),
        pointNames: objects.map(o => o.id).filter(Boolean),
    });
    resolver = new Resolver({
        objects, types: OBJECT_TYPES, compiler, angleUnit: config.angleUnit || 'deg', config,
        warn: (m) => warnings.push(m),
    });
    resolver.resolveAll(view);
    return { r: resolver, warnings, st: (id) => resolver.state(id), at: (ref) => resolver.point(ref) };
}

const close = (a, b, digits = 9) => {
    expect(a.x).toBeCloseTo(b.x, digits);
    expect(a.y).toBeCloseTo(b.y, digits);
};

describe('Riferimenti agli ancoraggi', () => {
    it('legge id, ancoraggio e argomento', () => {
        expect(parseRef('A')).toEqual({ id: 'A', anchor: null, arg: null });
        expect(parseRef('A.top')).toEqual({ id: 'A', anchor: 'top', arg: null });
        expect(parseRef('s.surface(0.6)')).toEqual({ id: 's', anchor: 'surface', arg: '0.6' });
        expect(parseRef('p.rim(alpha + 90°)')).toEqual({ id: 'p', anchor: 'rim', arg: 'alpha + 90°' });
        expect(parseRef('1A')).toBeNull();
    });
});

describe('Geometria delle funi', () => {
    it('trova la tangente da un punto a una carrucola', () => {
        // From the left, level with the top, wrapping clockwise: touches the top
        const s = tangentSegment({ x: -3, y: 0.2 }, 0, { x: 0, y: 0 }, -0.2);
        close(s.b, { x: 0, y: 0.2 });
    });

    it('avvolge la carrucola sul lato giusto', () => {
        expect(wrapSide({ x: -3, y: 0.2 }, { x: 0, y: 0 }, { x: 0.2, y: -3 })).toBe('cw');
        expect(wrapSide({ x: 3, y: 0.2 }, { x: 0, y: 0 }, { x: -0.2, y: -3 })).toBe('ccw');
    });

    it('calcola tavolo e massa appesa: orizzontale, quarto di giro, verticale', () => {
        const p = ropePath({ x: -3, y: 0.2 }, { x: 0.2, y: -3 }, [{ center: { x: 0, y: 0 }, radius: 0.2 }]);
        close(p.segments[0].b, { x: 0, y: 0.2 });
        close(p.segments[1].a, { x: 0.2, y: 0 });
        expect(p.arcs[0].sweep).toBeCloseTo(Math.PI / 2, 9);
        expect(p.length).toBeCloseTo(3 + Math.PI / 2 * 0.2 + 3, 9);
    });

    it('calcola la macchina di Atwood: mezzo giro', () => {
        const p = ropePath({ x: -0.3, y: -2 }, { x: 0.3, y: -3 }, [{ center: { x: 0, y: 0 }, radius: 0.3 }]);
        close(p.segments[0].b, { x: -0.3, y: 0 });
        close(p.segments[1].a, { x: 0.3, y: 0 });
        expect(p.arcs[0].sweep).toBeCloseTo(Math.PI, 9);
    });

    it('disegna la molla tra i due estremi', () => {
        const pts = springPoints({ x: 0, y: 0 }, { x: 2, y: 0 }, 5, 0.1);
        expect(pts[0]).toEqual({ x: 0, y: 0 });
        expect(pts.at(-1)).toEqual({ x: 2, y: 0 });
        expect(Math.max(...pts.map(p => Math.abs(p.y)))).toBeCloseTo(0.1, 12);
    });
});

describe('Corpi su superfici', () => {
    const incline = (extra = []) => scene({
        objects: [
            { id: 's', type: 'slope', at: [1, 0], angle: 30, length: 6 },
            { id: 'A', type: 'block', on: 's', pos: 0.5, size: [0.8, 0.5], mass: 2 },
            ...extra,
        ],
    });

    it('appoggia il blocco sul piano inclinato, ruotato come il piano', () => {
        const { st, at, r } = incline();
        const s = st('s'), A = st('A');
        expect(A.angle).toBeCloseTo(Math.PI / 6, 12);
        // The bottom face's midpoint is the surface point at pos, the centre is h/2 above it
        close(at('A.bottom'), at('s.surface(0.5)'));
        expect(dot(sub(A.pos, at('s.surface(0.5)')), s.frame.n)).toBeCloseTo(0.25, 12);
        expect(r.resolved.A.deg).toBeCloseTo(30, 9);
    });

    it('espone base, cima e piede del piano', () => {
        const { at } = incline();
        close(at('s.base'), { x: 1, y: 0 });
        close(at('s.foot'), { x: 1 + 6 * Math.cos(Math.PI / 6), y: 0 });
        close(at('s.apex'), { x: 1 + 6 * Math.cos(Math.PI / 6), y: 3 });
    });

    it('capovolge il piano con flip', () => {
        const { at, st } = scene({ objects: [{ id: 's', type: 'slope', at: [8, 0], angle: 45, height: 2, flip: true }] });
        close(at('s.apex'), { x: 6, y: 2 });
        // Normal points away from the triangle: up and to the right
        expect(st('s').frame.n.x).toBeGreaterThan(0);
        expect(st('s').frame.n.y).toBeGreaterThan(0);
    });

    it('accetta pos in metri', () => {
        const { at } = scene({ objects: [{ id: 'g', type: 'ground', from: [0, 0], to: [10, 0] }, { id: 'b', type: 'ball', on: 'g', pos: 3, posUnit: 'm', radius: 0.5 }] });
        close(at('b'), { x: 3, y: 0.5 });
    });

    it('impila un blocco su un altro', () => {
        const { at } = scene({ objects: [
            { id: 'g', type: 'ground' },
            { id: 'A', type: 'block', on: 'g', pos: 0.5, size: [2, 1] },
            { id: 'B', type: 'block', on: 'A', size: [1, 0.5] },
        ] });
        close(at('B.bottom'), at('A.top'));
    });

    it('mette le ruote del carrello sul piano', () => {
        const { st, at } = scene({ objects: [{ id: 'g', type: 'ground', y: 0 }, { id: 'c', type: 'cart', on: 'g', size: [1.2, 0.5], wheel: 0.15 }] });
        expect(st('c').axles[0].y).toBeCloseTo(0.15, 12);
        expect(at('c.bottom').y).toBeCloseTo(0.15, 12);
    });
});

describe('Direzioni, vettori e scomposizione', () => {
    const fbd = (extra = []) => scene({
        objects: [
            { id: 's', type: 'slope', at: [1, 0], angle: 30, length: 6 },
            { id: 'A', type: 'block', on: 's', size: [0.8, 0.5], mass: 2 },
            { id: 'P', type: 'force', on: 'A', dir: 'down', mag: 'A_m*g' },
            { id: 'N', type: 'force', on: 'A', dir: 'normal', mag: 'A_m*g*cos(30°)' },
            { id: 'f', type: 'force', on: 'A', dir: '-tangent', mag: 5 },
            ...extra,
        ],
    }, { params: { A_m: 2 } });

    it('orienta normale e tangente secondo il piano', () => {
        const { st } = fbd();
        const N = st('N'), f = st('f');
        expect(N.vec.x).toBeCloseTo(-2 * 9.81 * Math.cos(Math.PI / 6) * 0.5, 9);
        expect(N.mag).toBeCloseTo(2 * 9.81 * Math.cos(Math.PI / 6), 9);
        // Friction down the slope
        expect(f.vec.x).toBeLessThan(0);
        expect(f.vec.y).toBeLessThan(0);
        expect(Math.atan2(-f.vec.y, -f.vec.x)).toBeCloseTo(Math.PI / 6, 9);
    });

    it('applica la forza al centro del corpo e la espone alle espressioni', () => {
        const { st, r } = fbd();
        close(st('P').pos, st('A').pos);
        expect(r.compiler.eval('P.len')).toBeCloseTo(2 * 9.81, 9);
    });

    it('scompone il peso lungo il piano: mg sin α e mg cos α', () => {
        const { st } = fbd([{ id: 'd', type: 'decompose', vector: 'P', frame: 's' }]);
        const [par, perp] = st('d').comps;
        expect(par.value).toBeCloseTo(-2 * 9.81 * 0.5, 9);
        expect(perp.value).toBeCloseTo(-2 * 9.81 * Math.cos(Math.PI / 6), 9);
    });

    it('scompone anche con la scorciatoia decompose sul vettore', () => {
        const { r } = scene({ objects: [{ type: 'force', at: [0, 0], vec: [3, 4], decompose: true }] });
        const dec = [...r.states.entries()].find(([o]) => o.type === 'decompose')[1];
        expect(dec.comps.map(c => c.value)).toEqual([3, 4]);
    });

    it('gestisce toward, angoli in gradi e in radianti', () => {
        const { st } = scene({ angleUnit: 'deg', objects: [
            { id: 'B', type: 'particle', at: [3, 4] },
            { id: 'u', type: 'vector', at: [0, 0], dir: 'toward:B', mag: 5 },
            { id: 'v', type: 'vector', at: [0, 0], dir: 30, mag: 2 },
            { id: 'w', type: 'vector', at: [0, 0], dir: 'pi/2', mag: 1 },
        ] });
        close(st('u').vec, { x: 3, y: 4 });
        close(st('v').vec, { x: Math.sqrt(3), y: 1 });
        close(st('w').vec, { x: 0, y: 1 });
    });

    it('scala in automatico la forza maggiore a una frazione della vista', () => {
        const { r } = fbd();
        expect(r.scales.force * 2 * 9.81).toBeCloseTo(0.28 * 5, 9);
    });

    it('usa forceScale quando è dato', () => {
        const { r } = scene({ forceScale: 0.1, objects: [{ type: 'force', at: [0, 0], vec: [10, 0] }] });
        expect(r.scales.force).toBe(0.1);
    });

    it('segue la fune con along', () => {
        const { st } = scene({ objects: [
            { id: 't', type: 'table', at: [0, 1], width: 4 },
            { id: 'A', type: 'block', on: 't', pos: 0.4, size: [0.8, 0.4] },
            { id: 'p', type: 'pulley', at: [4.2, 1.0], radius: 0.2 },
            { id: 'B', type: 'block', at: [4.4, -1], size: [0.4, 0.4] },
            { id: 'rope', type: 'rope', from: 'A.right', to: 'B.top', over: ['p'] },
            { id: 'T1', type: 'force', on: 'A', dir: 'along:rope', mag: 1 },
            { id: 'T2', type: 'force', on: 'B', at: 'B.top', dir: 'along:rope', mag: 1 },
        ] });
        close(st('T1').vec, { x: 1, y: 0 });
        close(st('T2').vec, { x: 0, y: 1 });
    });
});

describe('Pendolo, angoli e quote', () => {
    it('posiziona la massa e il riferimento del pendolo', () => {
        const { st } = scene({ objects: [{ id: 'p', type: 'pendulum', pivot: [5, 4], length: 2, theta: 30 }] });
        const p = st('p');
        close(p.bob, { x: 5 + 2 * 0.5, y: 4 - 2 * Math.cos(Math.PI / 6) });
        // n points from the bob to the pivot
        close(p.frame.n, { x: -0.5, y: Math.cos(Math.PI / 6) });
    });

    it('misura l\'angolo del piano e l\'angolo tra tre punti', () => {
        const { st } = scene({ objects: [
            { id: 's', type: 'slope', at: [0, 0], angle: 35, length: 3 },
            { id: 'a', type: 'angle', of: 's' },
            { id: 'b', type: 'angle', points: [[1, 0], [0, 0], [0, 1]] },
        ] });
        expect(st('a').value).toBeCloseTo(35 * Math.PI / 180, 12);
        expect(st('b').value).toBeCloseTo(Math.PI / 2, 12);
    });

    it('misura l\'angolo del pendolo anche quando oscilla a sinistra', () => {
        const { st } = scene({ objects: [
            { id: 'p', type: 'pendulum', pivot: [5, 4], length: 2, theta: -30 },
            { id: 'a', type: 'angle', of: 'p' },
        ] });
        expect(st('a').value).toBeCloseTo(Math.PI / 6, 12);
        const spec = st('p').angleSpec;
        expect(((spec.a2 - spec.a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)).toBeCloseTo(Math.PI / 6, 12);
    });

    it('misura la distanza della quota', () => {
        const { st } = scene({ objects: [{ id: 'd', type: 'dimension', from: [0, 0], to: [3, 4] }] });
        expect(st('d').value).toBeCloseTo(5, 12);
    });

    it('calcola il centro di massa pesato', () => {
        const { st } = scene({ objects: [
            { id: 'A', type: 'particle', at: [0, 0], mass: 1 },
            { id: 'B', type: 'particle', at: [4, 0], mass: 3 },
            { id: 'c', type: 'com', of: ['A', 'B'] },
        ] });
        close(st('c').pos, { x: 3, y: 0 });
    });
});

describe('Grafo delle connessioni e avvisi', () => {
    it('raccoglie contatti, funi e molle', () => {
        const { r } = scene({ objects: [
            { id: 'g', type: 'ground' },
            { id: 'w', type: 'wall', at: [0, 0], height: 2 },
            { id: 'A', type: 'block', on: 'g', pos: 0.5 },
            { id: 'k', type: 'spring', from: 'w.surface(0.2)', to: 'A.left' },
        ] });
        expect(r.graph.edges).toEqual([
            { kind: 'contact', a: 'A', b: 'g' },
            { kind: 'spring', id: 'k', a: 'w', b: 'A' },
        ]);
    });

    it('elenca gli ancoraggi disponibili quando uno è sbagliato', () => {
        const { warnings } = scene({ objects: [{ id: 'A', type: 'block', at: [1, 1] }, { type: 'label', at: 'A.tpo', text: 'x' }] });
        expect(warnings[0]).toMatch(/no anchor 'tpo'.*top/);
    });

    it('segnala i riferimenti circolari', () => {
        const { warnings } = scene({ objects: [
            { id: 'A', type: 'particle', at: 'B' },
            { id: 'B', type: 'particle', at: 'A' },
        ] });
        expect(warnings.some(w => /cycle/.test(w))).toBe(true);
    });

    it('rifiuta di appoggiare un corpo su ciò che non è una superficie', () => {
        const { warnings } = scene({ objects: [{ id: 'p', type: 'particle', at: [0, 0] }, { type: 'block', on: 'p' }] });
        expect(warnings[0]).toMatch(/not a surface/);
    });

    it('risolve gli oggetti in qualunque ordine', () => {
        const { at } = scene({ objects: [
            { id: 'B', type: 'particle', at: ['A.x + 1', 'A.y'] },
            { id: 'A', type: 'block', at: [2, 3] },
        ] });
        close(at('B'), { x: 3, y: 3 });
        expect(dist(at('B'), at('A'))).toBeCloseTo(1, 12);
        expect(len({ x: 3, y: 4 })).toBe(5);
    });
});
