import { describe, it, expect } from 'vitest';
import { Resolver } from '../assets/js/matephis-physics-src/core/resolver.js';
import { Simulation } from '../assets/js/matephis-physics-src/core/simulation.js';
import { PhysicsCompiler, kinematicIds } from '../assets/js/matephis-physics-src/core/compiler.js';
import { arcLengthMap } from '../assets/js/matephis-physics-src/core/geometry.js';
import { energyValues } from '../assets/js/matephis-physics-src/objects/energy.js';
import { OBJECT_TYPES } from '../assets/js/matephis-physics-src/objects/index.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

const VIEW = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const g = 9.81;

/**
 * A scene without DOM: compiler, resolver and simulation wired as
 * MatephisPhysics wires them. `at(t)` resolves everything at time t.
 */
function timed(config, params = {}) {
    const warnings = [];
    const p = { g, ...params };
    const objects = config.objects.filter(o => OBJECT_TYPES[o.type]);
    const ids = objects.map(o => o.id).filter(Boolean);
    const stateNames = config.state ? Object.keys(config.state) : [];
    const s = { config, params: p, warnings };
    s._addWarning = (m) => warnings.push(m);
    s._num = (v, where) => {
        if (typeof v === 'number') return v;
        try { return s.compiler.eval(v); } catch (e) { warnings.push(`${where}: ${e.message}`); return NaN; }
    };
    s.compiler = new PhysicsCompiler({
        getParams: () => p, getPoints: () => s.resolver.resolved,
        paramNames: ['g', 't', ...stateNames, ...Object.keys(params)], pointNames: ids,
    });
    s.resolver = new Resolver({ objects, types: OBJECT_TYPES, compiler: s.compiler, config, warn: (m) => warnings.push(m) });
    s.compiler.setIds(s.resolver.ids);
    s.kinIds = kinematicIds(config, ids);
    s.sim = new Simulation(s, stateNames);
    s.at = (t) => {
        s.sim.prepare(VIEW); // computes the run, so t can be set within it
        s.sim.seek(t);
        s.sim.prepare(VIEW);
        s.resolver.timeline = s.sim.timeline();
        s.resolver.resolveAll(VIEW);
        return s;
    };
    s.num = (expr) => s.compiler.eval(expr);
    return s;
}

describe('Proprietà nelle espressioni', () => {
    it('il compilatore del grafico rifiuta le proprietà della fisica', () => {
        const c = new ExpressionCompiler({ getParams: () => ({}), getPoints: () => ({}), pointNames: ['A'] });
        expect(() => c.fn('A.speed', [])).toThrow(/Unknown property/);
    });

    it('legge le forze automatiche con il punto nell\'id: A.N.mag, A.P.angle', () => {
        const s = timed({
            time: { max: 1 },
            objects: [
                { id: 'gr', type: 'ground', y: 0 },
                { id: 'A', type: 'block', on: 'gr', size: [1, 1], mass: 2, forces: 'auto' },
            ],
        }).at(0);
        // Forces are resolved lazily: reading them in an expression resolves them first
        expect(s.resolver.num('A.N.mag')).toBeCloseTo(2 * g, 9);
        expect(s.resolver.num('A.P.angle')).toBeCloseTo(-Math.PI / 2, 9);
        expect(s.resolver.num('A.P.y + A.N.y')).toBeCloseTo(0, 9);
    });

    it('trova le velocità che le espressioni leggono', () => {
        expect(kinematicIds({ readouts: ['A.speed', 'B.x', 'AB.vx'] }, ['A', 'B', 'AB'])).toEqual(['A', 'AB']);
    });

    it('calcola velocità e accelerazione di un proiettile: A.speed, A.vy, A.acc', () => {
        const v0 = 10, a = Math.PI / 6;
        const s = timed({
            time: { max: 1 },
            objects: [{ id: 'A', type: 'particle', at: [`${v0 * Math.cos(a)}*t`, `${v0 * Math.sin(a)}*t - g*t^2/2`] }],
            readouts: ['A.speed'],
        }).at(0.4);
        const vx = v0 * Math.cos(a), vy = v0 * Math.sin(a) - g * 0.4;
        expect(s.num('A.vy')).toBeCloseTo(vy, 4);
        expect(s.num('A.speed')).toBeCloseTo(Math.hypot(vx, vy), 4);
        expect(s.num('A.acc')).toBeCloseTo(g, 2);
    });
});

describe('Moto lungo un percorso (follow)', () => {
    it('la parametrizzazione per lunghezza d\'arco è uniforme', () => {
        // Parabola: equal steps of s are equal distances along it
        const map = arcLengthMap((p) => ({ x: p, y: p * p }), -1, 1);
        const exact = Math.sqrt(5) + Math.asinh(2) / 2;
        expect(map.length).toBeCloseTo(exact, 4);
        const a = map.at(0.5).point, b = map.at(0.5 + 1e-3).point;
        expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(1e-3, 6);
    });

    it('moto circolare uniforme: v costante e a = v²/R verso il centro', () => {
        const R = 2, v = 3;
        const s = timed({
            time: { max: 5 },
            objects: [
                { id: 'p', type: 'path', arc: { center: [0, 0], radius: R } },
                { id: 'C', type: 'block', size: [0.4, 0.3], follow: 'p', s: `${v}*t`, orient: 'tangent' },
            ],
            readouts: ['C.speed'],
        }).at(1.3);
        expect(s.num('C.speed')).toBeCloseTo(v, 4);
        expect(s.num('C.acc')).toBeCloseTo(v * v / R, 3);
        // The acceleration points to the centre
        const C = s.resolver.state('C');
        expect(s.num('C.ax') * C.pos.x + s.num('C.ay') * C.pos.y).toBeCloseTo(-(v * v / R) * R, 2);
        // Turned with the path: its x axis is the direction of motion
        const vel = { x: s.num('C.vx'), y: s.num('C.vy') };
        expect((vel.x * C.frame.t.x + vel.y * C.frame.t.y) / v).toBeCloseTo(1, 4);
    });

    it('fa il giro su un percorso chiuso e si ferma alla fine di uno aperto', () => {
        const s = timed({
            objects: [
                { id: 'c', type: 'path', arc: { center: [0, 0], radius: 1 } },
                { id: 'l', type: 'path', points: [[0, 0], [2, 0]] },
                { id: 'A', type: 'particle', follow: 'c', s: `2*pi + pi/2` },
                { id: 'B', type: 'particle', follow: 'l', s: 5 },
            ],
        }).at(0);
        expect(s.resolver.state('A').pos.x).toBeCloseTo(0, 9);
        expect(s.resolver.state('A').pos.y).toBeCloseTo(1, 9);
        expect(s.resolver.state('B').pos.x).toBeCloseTo(2, 9);
    });

    it('avvisa se follow non è un percorso', () => {
        const s = timed({ objects: [{ id: 'A', type: 'particle', follow: 'nope' }] }).at(0);
        expect(s.warnings.join(' ')).toMatch(/'follow' must be the id of a path/);
    });
});

describe('Energie', () => {
    const fall = (extra = {}) => timed({
        time: { max: 1 },
        state: { y: 4, v: 0 },
        ode: { y: 'v', v: '-g' },
        objects: [
            { id: 'A', type: 'particle', at: [0, 'y'], mass: 2 },
            { id: 'E', type: 'energy', of: 'A', bars: ['K', 'Ug', 'Q'], total: true, ...extra },
        ],
    });

    it('in caduta libera K + Ug si conserva e Q resta zero', () => {
        const s = fall().at(0.8);
        const v = g * 0.8, y = 4 - g * 0.64 / 2;
        const [K, Ug, Q] = energyValues(s.resolver.objectById('E'), s.resolver).bars.map(b => b.value);
        expect(K).toBeCloseTo(0.5 * 2 * v * v, 2);
        expect(Ug).toBeCloseTo(2 * g * y, 6);
        expect(K + Ug).toBeCloseTo(2 * g * 4, 2);
        expect(Math.abs(Q)).toBeLessThan(0.05);
    });

    it('la scala delle barre copre tutto il moto', () => {
        const s = fall().at(0);
        const e = s.sim.timeline().energy.get(s.resolver.objectById('E'));
        expect(e.E0).toBeCloseTo(2 * g * 4, 6);
        // Largest bar over the run: K at the end (y < 0 there, so Ug goes negative)
        expect(e.maxPos).toBeGreaterThanOrEqual(2 * g * 4 - 1e-6);
        expect(e.maxNeg).toBeGreaterThan(0);
    });

    it('il livello zero sposta Ug ma non le differenze', () => {
        const a = fall().at(0.5), b = fall({ zero: 1.5 }).at(0.5);
        const ug = (s) => energyValues(s.resolver.objectById('E'), s.resolver).bars[1].value;
        expect(ug(a) - ug(b)).toBeCloseTo(2 * g * 1.5, 9);
    });

    it('con lo smorzamento Q è l\'energia persa: E + Q = E(0)', () => {
        const s = timed({
            time: { max: 6 },
            state: { x: 1, v: 0 },
            ode: { x: 'v', v: '-(k*x + b*v)/m' },
            objects: [
                { id: 'w', type: 'wall', at: [-3, 0] },
                { id: 'A', type: 'block', at: ['x', 0], size: [0.4, 0.4], mass: 'm' },
                { type: 'spring', from: [-3, 0], to: 'A.left', k: 'k', rest: 2.8 },
                { id: 'E', type: 'energy', of: 'A', bars: ['K', 'Uel', 'Q'], total: true },
            ],
        }, { k: 4, m: 1, b: 0.5 }).at(4);
        const r = s.resolver;
        const [K, Uel, Q] = energyValues(r.objectById('E'), r).bars.map(b => b.value);
        // The spring runs from -3 to the left face at x - 0.2: L = x + 2.8, so it stretches by x
        const E0 = 0.5 * 4 * 1 ** 2;
        expect(K + Uel + Q).toBeCloseTo(E0, 6);
        expect(Q).toBeGreaterThan(0.5 * E0);
    });

    it('avvisa se of non è un corpo', () => {
        const s = timed({ objects: [{ type: 'energy', of: 'X' }] }).at(0);
        expect(s.warnings.join(' ')).toMatch(/energy: 'of' must be the id of a body/);
    });
});

describe('Scene viste dall\'alto (plane: "horizontal")', () => {
    const curve = (extra = {}) => timed({
        plane: 'horizontal',
        time: { max: 10 },
        objects: [
            { id: 'r', type: 'road', width: 7, mu: 0.8, path: { arc: { center: [0, 0], radius: 20 } } },
            { id: 'C', type: 'car', follow: 'r', s: '15*t', orient: 'tangent', mass: 1200, forces: 'auto', ...extra },
        ],
    });

    it('peso e normale sono perpendicolari al disegno, N = mg', () => {
        const s = curve().at(2);
        const P = s.resolver.state('C.P'), N = s.resolver.state('C.N');
        expect(P.outOfPlane && N.outOfPlane).toBe(true);
        expect(P.vec.z).toBeCloseTo(-1200 * g, 6);
        expect(N.vec.z).toBeCloseTo(1200 * g, 6);
        expect(s.num('C.N.mag')).toBeCloseTo(1200 * g, 6);
    });

    it('in curva l\'attrito statico è la forza centripeta m v²/R', () => {
        const s = curve().at(2);
        const f = s.resolver.state('C.f'), C = s.resolver.state('C');
        expect(f.mag).toBeCloseTo(1200 * 15 * 15 / 20, -1);
        // Towards the centre
        expect((f.vec.x * C.pos.x + f.vec.y * C.pos.y) / (f.mag * Math.hypot(C.pos.x, C.pos.y))).toBeCloseTo(-1, 4);
    });

    it('la scala delle forze non tiene conto di quelle perpendicolari al disegno', () => {
        const s = curve().at(2);
        const f = s.resolver.state('C.f');
        // The friction is the only arrow: it spans the automatic fraction of the view
        expect(f.mag * s.resolver.scales.force).toBeCloseTo(0.28 * 10, 6);
    });

    it('offset sposta il corpo nella corsia', () => {
        const s = curve({ offset: -1.75 }).at(0);
        // Running anticlockwise, the right of the way is the outside of the curve
        expect(Math.hypot(s.resolver.state('C').pos.x, s.resolver.state('C').pos.y)).toBeCloseTo(21.75, 6);
    });

    it('in corsia s si misura lungo la corsia: la velocità è proprio v', () => {
        const s = curve({ offset: -1.75 }).at(3);
        expect(s.num('C.speed')).toBeCloseTo(15, 4);
        expect(s.resolver.state('C.f').mag).toBeCloseTo(1200 * 15 * 15 / 21.75, 0);
    });

    it('le direzioni "in" e "out" escono dal disegno', () => {
        const s = timed({
            objects: [
                { id: 'q', type: 'particle', at: [0, 0] },
                { id: 'B', type: 'vector', at: [1, 1], dir: 'in', mag: 2 },
                { id: 'F', type: 'force', on: 'q', dir: 'out', mag: 3 },
            ],
        }).at(0);
        expect(s.resolver.state('B').vec).toEqual({ x: 0, y: 0, z: -2 });
        expect(s.resolver.state('F').outOfPlane).toBe(true);
        expect(s.resolver.state('F').mag).toBe(3);
    });
});
