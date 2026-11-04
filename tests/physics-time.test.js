import { describe, it, expect } from 'vitest';
import { Resolver } from '../assets/js/matephis-physics-src/core/resolver.js';
import { Simulation } from '../assets/js/matephis-physics-src/core/simulation.js';
import { PhysicsCompiler, kinematicIds } from '../assets/js/matephis-physics-src/core/compiler.js';
import { arcLengthMap } from '../assets/js/matephis-physics-src/core/geometry.js';
import { energyValues } from '../assets/js/matephis-physics-src/objects/energy.js';
import { OBJECT_TYPES } from '../assets/js/matephis-physics-src/objects/index.js';
import { parseFrames, parseViews, viewTransform, transformStates, frameMap } from '../assets/js/matephis-physics-src/core/views.js';
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
    s.frameDefs = parseFrames(config, (m) => warnings.push(m));
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

describe('Risolutore delle equazioni di Newton ("magnitudes": "solve")', () => {
    const atwood = (m1, m2) => timed({
        magnitudes: 'solve', time: { max: 1 },
        objects: [
            { id: 'p', type: 'pulley', at: [0, 3], radius: 0.4 },
            { id: 'A', type: 'block', at: [-0.4, 0], size: [0.5, 0.5], mass: m1, forces: 'auto' },
            { id: 'B', type: 'block', at: [0.4, 1], size: [0.5, 0.5], mass: m2, forces: 'auto' },
            { id: 'rope', type: 'rope', from: 'A.top', to: 'B.top', over: ['p'] },
        ],
    });

    it('macchina di Atwood: a = (m1 − m2) g / (m1 + m2), T = 2 m1 m2 g / (m1 + m2)', () => {
        const s = atwood(3, 2).at(0.5);
        const a = g / 5;
        expect(s.num('A.ay')).toBeCloseTo(-a, 3);
        expect(s.num('B.ay')).toBeCloseTo(a, 3);
        expect(s.num('A.T.mag')).toBeCloseTo(2.4 * g, 6);
        // Moved by a t²/2
        expect(s.resolver.state('A').pos.y).toBeCloseTo(-a * 0.125, 6);
    });

    const tablePulley = (mu) => timed({
        magnitudes: 'solve', time: { max: 2 },
        objects: [
            { id: 't', type: 'table', at: [0.5, 2.5], width: 4.5, height: 2.3 },
            { id: 'A', type: 'block', on: 't', pos: 0.45, size: [1, 0.6], mass: 2, mu, forces: 'auto' },
            { id: 'p', type: 'pulley', at: { from: 't.edge', offset: [0.3, 0] }, radius: 0.3, hangFrom: 't.edge' },
            { id: 'B', type: 'block', at: [5.6, 1.5], size: [0.6, 0.6], mass: 1, forces: 'auto' },
            { type: 'rope', from: 'A.right', to: 'B.top', over: ['p'] },
        ],
    });

    it('tavolo e carrucola con attrito dinamico: a = (mB − μ mA) g / (mA + mB)', () => {
        const s = tablePulley(0.2).at(0.4);
        const a = (1 - 0.2 * 2) * g / 3;
        expect(s.num('A.ax')).toBeCloseTo(a, 3);
        expect(s.num('B.ay')).toBeCloseTo(-a, 3);
        expect(s.num('A.T.mag')).toBeCloseTo(1 * (g - a), 6);
        expect(s.num('A.f.mag')).toBeCloseTo(0.2 * 2 * g, 6);
        expect(s.num('A.N.mag')).toBeCloseTo(2 * g, 6);
    });

    it('con attrito statico sufficiente resta fermo: T = mB g, f = mB g', () => {
        const s = tablePulley(0.6).at(1);
        expect(Math.abs(s.num('A.ax'))).toBeLessThan(1e-6);
        expect(s.num('A.T.mag')).toBeCloseTo(g, 6);
        expect(s.num('A.f.mag')).toBeCloseTo(g, 6);
        expect(s.resolver.state('A').pos.x).toBeCloseTo(0.5 + 0.45 * 4.5, 6);
    });

    const incline = (mu, v0) => timed({
        magnitudes: 'solve', time: { max: 1.5 },
        objects: [
            { id: 's', type: 'slope', at: [-4, -3], angle: 30, length: 8 },
            { id: 'A', type: 'block', on: 's', pos: 0.5, size: [0.6, 0.4], mass: 2, mu, forces: 'auto', ...(v0 ? { v0 } : {}) },
        ],
    });

    it('piano inclinato: scivola con a = g (sin α − μ cos α), oppure resta fermo', () => {
        const a = g * (Math.sin(Math.PI / 6) - 0.2 * Math.cos(Math.PI / 6));
        const s = incline(0.2).at(0.5);
        expect(s.num('A.acc')).toBeCloseTo(a, 3);
        expect(s.num('A.f.mag')).toBeCloseTo(0.2 * 2 * g * Math.cos(Math.PI / 6), 6);
        const still = incline(0.7).at(0.5);
        expect(still.num('A.acc')).toBeLessThan(1e-6);
        expect(still.num('A.f.mag')).toBeCloseTo(2 * g * 0.5, 6);
    });

    it('lanciato in salita rallenta, si ferma e resta fermo se l\'attrito statico basta', () => {
        // Up the slope at 2 m/s with μ = 0.7: a = −g (sin α + μ cos α) until it stops, then it holds
        const s = incline(0.7, 2).at(1.2);
        const dec = g * (0.5 + 0.7 * Math.cos(Math.PI / 6));
        expect(s.num('A.speed')).toBeLessThan(1e-3);
        // Up by v0² / (2 dec) along the slope (a few mm of slack around the stop)
        const C = s.resolver.state('A');
        const start = timed({ objects: [{ id: 's', type: 'slope', at: [-4, -3], angle: 30, length: 8 }, { id: 'A', type: 'block', on: 's', pos: 0.5, size: [0.6, 0.4] }] }).at(0).resolver.state('A');
        expect(Math.hypot(C.pos.x - start.pos.x, C.pos.y - start.pos.y)).toBeCloseTo(4 / (2 * dec), 2);
    });

    it('molla e blocco senza equazioni del moto: periodo 2π √(m/k)', () => {
        const s = timed({
            magnitudes: 'solve', time: { max: 3 },
            objects: [
                { id: 'gr', type: 'ground', y: 0, from: [-5, 0], to: [5, 0] },
                { id: 'A', type: 'block', on: 'gr', pos: 6, posUnit: 'm', size: [0.6, 0.4], mass: 1, forces: 'auto' },
                { type: 'spring', from: [-5, 0.2], to: 'A.left', k: 4, rest: 4.7 },
            ],
        });
        // Stretched by 1 m at the start; after half a period (π/2 s) it is compressed by 1 m
        const x = (t) => s.at(t).resolver.state('A').pos.x;
        expect(x(0)).toBeCloseTo(1, 6);
        expect(x(Math.PI / 2)).toBeCloseTo(-1, 3);
    });

    it('una fune verticale tiene fermo il corpo appeso: T = mg', () => {
        const s = timed({
            magnitudes: 'solve',
            objects: [
                { id: 'c', type: 'ceiling', y: 4 },
                { id: 'B', type: 'block', at: [0, 2], size: [0.5, 0.5], mass: 3, forces: 'auto' },
                { type: 'rope', from: [0, 4], to: 'B.top' },
            ],
        }).at(0);
        expect(s.num('B.T.mag')).toBeCloseTo(3 * g, 6);
    });
});

describe('Slittamento in curva ("skid": true)', () => {
    const car = () => timed({
        plane: 'horizontal', time: { max: 14 },
        objects: [
            { id: 'r', type: 'road', mu: 0.5, path: { arc: { center: [0, 0], radius: 20 } } },
            { id: 'C', type: 'car', follow: 'r', s: 't^2/2', orient: 'tangent', mass: 1000, forces: 'auto', skid: true },
        ],
    });

    it('slitta quando a = √(aₜ² + (v²/R)²) supera μg, poi va dritto rallentando di μg', () => {
        const mu = 0.5;
        // aₜ = 1 m/s², v = t: (t²/R)² + 1 = (μg)²
        const tSkid = Math.sqrt(20 * Math.sqrt((mu * g) ** 2 - 1));
        const s = car().at(10.5);
        const sk = s.sim.timeline().skids.get('C');
        expect(sk.t).toBeCloseTo(tSkid, 3);
        // Straight on along the velocity it had, slowing down at μg (it stops about 2 s later)
        expect(s.num('C.speed')).toBeCloseTo(tSkid - mu * g * (10.5 - tSkid), 2);
        expect(s.num('C.acc')).toBeCloseTo(mu * g, 2);
        expect(Math.hypot(s.resolver.state('C').pos.x, s.resolver.state('C').pos.y)).toBeGreaterThan(20.1);
        expect(car().at(13).num('C.speed')).toBeLessThan(1e-6);
        // Friction is kinetic, μ m g against the velocity
        const f = s.resolver.state('C.f').vec, v = { x: s.num('C.vx'), y: s.num('C.vy') };
        expect(Math.hypot(f.x, f.y)).toBeCloseTo(mu * 1000 * g, 3);
        expect((f.x * v.x + f.y * v.y) / (Math.hypot(f.x, f.y) * Math.hypot(v.x, v.y))).toBeCloseTo(-1, 6);
    });

    it('senza slittamento segue la strada', () => {
        const s = car().at(5);
        expect(Math.hypot(s.resolver.state('C').pos.x, s.resolver.state('C').pos.y)).toBeCloseTo(20, 6);
    });
});

import { expandScene, mergeScene, PRESETS } from '../assets/js/matephis-physics-src/core/presets.js';
import { validateConfig } from '../assets/js/matephis-physics-src/core/config.js';

describe('Preset e macro', () => {
    const expand = (cfg, macros) => {
        const w = [];
        return { cfg: expandScene(cfg, macros, (m) => w.push(m)), w };
    };

    it('la scena scritta vince: chiavi, parametri per nome, oggetti per id', () => {
        const base = { xlim: [0, 9], params: { m: { min: 0, max: 5, val: 2 } }, objects: [{ id: 'A', type: 'block', mass: 2 }, { id: 'B', type: 'ball' }] };
        const top = { xlim: [0, 12], params: { m: { val: 4 } }, objects: [{ id: 'A', mass: 5 }, { id: 'B', remove: true }, { type: 'label', text: 'x' }] };
        const out = mergeScene(base, top);
        expect(out.xlim).toEqual([0, 12]);
        expect(out.params.m).toEqual({ min: 0, max: 5, val: 4 });
        expect(out.objects).toEqual([{ id: 'A', type: 'block', mass: 5 }, { type: 'label', text: 'x' }]);
    });

    it('nei preset un numero è il valore dello slider, una stringa un\'espressione', () => {
        const a = expand({ preset: { name: 'atwood', with: { m1: 4 } } }).cfg;
        expect(a.params.m1.val).toBe(4);
        const b = expand({ preset: { name: 'atwood', with: { m1: 'M' } } }).cfg;
        expect(b.params.m1).toBeUndefined();
        expect(b.objects.find(o => o.id === 'A').mass).toBe('(M)');
    });

    it('le macro riempiono ${nome} con "with" o con i default, e possono usare preset', () => {
        const macros = {
            box: { defaults: { w: 1 }, objects: [{ id: 'K', type: 'block', at: [1, 1], size: ['${w}', '${h}'], label: 'm = ${w} kg' }] },
            wrap: { use: { macro: 'box', with: { w: 2, h: 3 } }, xlim: [0, 5] },
        };
        const { cfg, w } = expand({ use: 'wrap' }, macros);
        expect(cfg.xlim).toEqual([0, 5]);
        expect(cfg.objects[0].size).toEqual([2, 3]);
        expect(cfg.objects[0].label).toBe('m = 2 kg');
        expect(w).toEqual([]);
        expect(expand({ use: 'box' }, macros).w[0]).toMatch(/no value for \$\{h\}/);
    });

    it('avvisa per nomi sconosciuti, preset futuri e macro che si richiamano', () => {
        expect(expand({ preset: 'atwod' }).w[0]).toMatch(/no preset called 'atwod'/);
        expect(expand({ preset: 'conical-pendulum' }).w[0]).toMatch(/later phase/);
        expect(expand({ use: 'nope' }).w[0]).toMatch(/no macro called 'nope'/);
        expect(expand({ use: 'loop' }, { loop: { use: 'loop' } }).w[0]).toMatch(/levels of macros/);
    });

    it('ogni preset dà una scena valida e senza avvisi', () => {
        Object.keys(PRESETS).forEach(name => {
            const { cfg, w } = expand({ preset: name });
            expect(w).toEqual([]);
            const warnings = [...validateConfig(cfg, OBJECT_TYPES)];
            const s = timed(cfg, Object.fromEntries(Object.entries(cfg.params || {}).map(([k, d]) => [k, d.unit === 'deg' ? d.val * Math.PI / 180 : d.val])));
            s.at(0.3);
            expect([name, ...warnings, ...s.warnings]).toEqual([name]);
        });
    });

    it('il preset atwood si muove come la macchina di Atwood', () => {
        const { cfg } = expand({ preset: { name: 'atwood', with: { m1: 3, m2: 2 } } });
        const s = timed(cfg, { m1: 3, m2: 2 }).at(0.5);
        expect(s.num('A.ay')).toBeCloseTo(-g / 5, 3);
    });
});

describe('Viste e sistemi di riferimento', () => {
    it('proietta i punti: di lato −z a destra, dall\'alto −z in su', () => {
        const states = new Map([['P', { pos: { x: 1, y: 2, z: 3 } }], ['F', { pos: { x: 0, y: 0, z: 0 }, vec: { x: 0, y: -5, z: 0 }, mag: 5 }]]);
        const side = transformStates(states, viewTransform('side', null));
        expect(side.get('P').pos).toEqual({ x: -3, y: 2, z: 1 });
        const top = transformStates(states, viewTransform('top', null));
        expect(top.get('P').pos).toEqual({ x: 1, y: -3, z: 2 });
        // The weight, seen from above, goes into the drawing
        expect(top.get('F').vec.z).toBe(-5);
        expect(top.get('F').outOfPlane).toBe(true);
        expect(viewTransform('front', null)).toBe(null);
    });

    it('legge viste e riferimenti e avvisa per gli errori', () => {
        const w = [];
        const frames = parseFrames({ frames: { terreno: null, treno: 'T', giostra: { of: 'D', rotate: true, fictitious: true } } }, (m) => w.push(m));
        expect(frames.treno).toMatchObject({ of: 'T', rotate: false });
        expect(w[0]).toMatch(/rotating frame are not drawn/);
        const views = parseViews({ views: [{ view: 'top', frame: 'treno' }, { view: 'back' }, { frame: 'nave' }] }, frames, (m) => w.push(m));
        expect(views[0]).toMatchObject({ view: 'top', frame: frames.treno });
        expect(w.join(' ')).toMatch(/not 'back'/);
        expect(w.join(' ')).toMatch(/no frame called 'nave'/);
    });

    const train = () => timed({
        time: { max: 1 },
        frames: { terreno: null, treno: 'T' },
        objects: [
            { id: 'T', type: 'cart', at: ['4*t', 1], size: [3, 1] },
            { id: 'B', type: 'particle', at: ['4*t', '3 - g*t^2/2'] },
            { type: 'trace', of: 'B' },
            { type: 'velocity', on: 'B' },
        ],
    });

    it('nel riferimento del treno la pallina lasciata cadere scende in verticale', () => {
        const s = train().at(0.6);
        const f = s.frameDefs.treno;
        const k = s.sim.kinInFrame(f, VIEW).get('B');
        expect(k.v.x).toBeCloseTo(0, 6);
        expect(k.v.y).toBeCloseTo(-g * 0.6, 4);
        // From the ground: the train's speed too
        expect(s.num('B.vx')).toBeCloseTo(4, 4);
        // Its trace, seen from the train, is a vertical line where it started
        const r = s.resolver;
        const world = r.resolveAll(VIEW);
        const start = s.sim.frameStarts.get('treno');
        const now = world.get(r.objectById('T'));
        const T = viewTransform('front', (t) => frameMap(f, t === null ? { pos: now.pos, angle: 0 } : s.sim.frameAt(f, t), start));
        const trace = [...transformStates(world, T).entries()].find(([o]) => o.type === 'trace')[1];
        trace.points.forEach(p => expect(p.x).toBeCloseTo(0, 6));
        expect(transformStates(world, T).get(r.objectById('T')).pos.x).toBeCloseTo(0, 9);
    });

    it('in un riferimento che ruota un corpo fermo sulla giostra è fermo', () => {
        const s = timed({
            plane: 'horizontal', time: { max: 3 },
            frames: { giostra: { of: 'D', rotate: true } },
            objects: [
                { id: 'D', type: 'disk', at: [0, 0], radius: 2, rotation: '0.8*t' },
                { id: 'P', type: 'particle', at: ['1.5*cos(0.8*t)', '1.5*sin(0.8*t)'] },
            ],
            readouts: ['P.speed'],
        }).at(1.7);
        const k = s.sim.kinInFrame(s.frameDefs.giostra, VIEW).get('P');
        expect(Math.hypot(k.v.x, k.v.y)).toBeLessThan(1e-4);
        expect(s.num('P.speed')).toBeCloseTo(1.2, 4);
    });
});
