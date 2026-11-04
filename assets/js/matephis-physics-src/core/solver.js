/**
 * Newton's second law for the bodies of a scene ("magnitudes": "solve").
 *
 * Bodies with "forces": "auto" whose position is not already an expression
 * of time move by themselves, each along one direction:
 *   along  resting on a straight surface (ground, slope, table): its tangent
 *   hang   hanging from one rope: along the rope, away from it
 * Ropes are inextensible and taut (a rope that would push goes slack). At
 * each instant a small linear system gives the accelerations, the tensions
 * and the static friction of bodies at rest; N balances the forces
 * perpendicular to the surface. If static friction would exceed μs N the
 * body slips and friction is μk N against the motion. Springs follow the
 * bodies; other hand-written forces on them are evaluated as time runs.
 *
 * The displacements and velocities are state variables of the simulation
 * (named __q_<id>, __v_<id>), integrated with the rest; the resolver moves
 * the bodies by them (Resolver.drive), and automatic forces take their
 * values from the solution (Resolver.solution). The run stops when a body
 * reaches the end of its surface or its pulley.
 */
import { add, sub, scale, norm, dot, len } from './vec.js';
import { aliasId } from './compiler.js';
import { massOf } from '../objects/shared.js';
import { ownerId } from '../objects/autoforces.js';

const SURFACES = ['ground', 'slope', 'table'];
const MOVABLE = ['particle', 'block', 'ball', 'cart', 'car'];
/** Below this speed (m/s) a body is at rest: static friction may hold it. */
const V_REST = 0.02;

/** Solves A x = b (Gaussian elimination with partial pivoting); null if singular. */
export function solveLinear(A, b) {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let c = 0; c < n; c++) {
        let p = c;
        for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
        if (Math.abs(M[p][c]) < 1e-12) return null;
        [M[c], M[p]] = [M[p], M[c]];
        for (let r = 0; r < n; r++) {
            if (r === c) continue;
            const k = M[r][c] / M[c][c];
            if (k) for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
        }
    }
    return M.map((row, i) => row[n] / row[i]);
}

/** Does an expression read the time or a state variable? Then the motion is given, not solved. */
function prescribed(v, names) {
    if (typeof v !== 'string') return Array.isArray(v) ? v.some(e => prescribed(e, names)) : false;
    return [...names, 't'].some(n => new RegExp(`(?<![A-Za-z0-9_.])${n}(?![A-Za-z0-9_])`).test(v));
}

export class Solver {
    /**
     * @param {object} scene - the MatephisPhysics instance
     * @param {string[]} userNames - the scene's own state variables
     */
    constructor(scene, userNames) {
        this.scene = scene;
        const cfg = scene.config;
        const objects = Array.isArray(cfg.objects) ? cfg.objects : [];
        const on = (o) => o.magnitudes !== undefined ? o.magnitudes === 'solve' : cfg.magnitudes === 'solve';
        this.ids = objects.filter(o => o && o.id && MOVABLE.includes(o.type) && o.forces === 'auto' && on(o)
            && !prescribed(o.pos, userNames) && !prescribed(o.at, userNames) && o.follow === undefined).map(o => o.id);
        this.names = this.ids.flatMap(id => [`__q_${aliasId(id)}`, `__v_${aliasId(id)}`]);
        this.model = null;
    }

    _warn(msg) {
        this.scene._addWarning(msg);
    }

    /** Initial state of the solver's variables: no displacement, the bodies' "v0". */
    initial() {
        const r = this.scene.resolver;
        return this.ids.flatMap(id => {
            const o = r.objectById(id);
            return [0, o.v0 !== undefined ? r.num(o.v0, `${id} v0`) : 0];
        });
    }

    /** Where the resolver moves each body: id -> displacement (m) along its direction. */
    drive(y) {
        if (!this.model) return null;
        const m = new Map();
        this.model.bodies.forEach((b, i) => m.set(b.id, { q: y[2 * b.k], v: y[2 * b.k + 1], e: b.e, kind: b.kind }));
        return m;
    }

    /**
     * Geometry and constants, from the scene resolved at the start (bodies not
     * displaced). Directions stay fixed while the bodies move: straight
     * surfaces, and ropes hanging straight from pulleys.
     */
    build(view) {
        const r = this.scene.resolver;
        r.drive = null;
        r.solveNow = null;
        r._solution = undefined;
        // Only what the solver reads (resolving everything would ask for velocities not computed yet)
        const needed = new Set(this.ids);
        r.objects.forEach(o => {
            if (!o.id) return;
            if (['rope', 'spring', 'ground', 'pulley'].includes(o.type)) needed.add(o.id);
            if (this.ids.includes(o.id) && o.on !== undefined) needed.add(o.on);
        });
        r.resolveSome(view, [...needed]);
        const g = r.num('g', 'g');
        const bodies = [];
        this.ids.forEach((id, k) => {
            const o = r.objectById(id), st = r.state(id);
            if (!st) return;
            const ropes = r.objects.filter(x => x.type === 'rope' && (ownerId(x.from) === id || ownerId(x.to) === id));
            const b = { id, k, obj: o, m: massOf(o, r), weight: { x: 0, y: -massOf(o, r) * g, z: 0 } };
            if (o.on !== undefined) {
                const supObj = r.objectById(o.on), sup = r.state(o.on);
                if (!supObj || !SURFACES.includes(supObj.type) || !sup || !sup.surface) {
                    this._warn(`solve: '${id}' rests on ${supObj ? `a ${supObj.type}` : `'${o.on}'`}; only ground, slopes and tables are solved: its forces stay schematic`);
                    return;
                }
                const s0 = sup.surface(0), s1 = sup.surface(1);
                b.kind = 'along';
                b.e = norm(s0.tangent);
                b.n = norm(s0.normal);
                if (Math.abs(dot(norm(s1.tangent), b.e) - 1) > 1e-6) {
                    this._warn(`solve: the surface under '${id}' is not straight: its forces stay schematic`);
                    return;
                }
                // How far it can slide either way before its edge leaves the surface
                const L = sup.surfaceLength;
                const u0 = dot(sub(st.contact || st.pos, s0.point), b.e);
                const half = (st.w || 2 * (st.radius || 0)) / 2;
                b.range = [half - u0, L - half - u0];
                const muSrc = o.mu !== undefined ? o.mu : supObj.mu;
                b.friction = r.objectById(`${id}.f`) && o.friction !== 'none' ? {
                    s: muSrc !== undefined ? r.num(muSrc, `${id} mu`) : 0.3,
                    k: o.muK !== undefined ? r.num(o.muK, `${id} muK`) : muSrc !== undefined ? r.num(muSrc, `${id} mu`) : 0.3,
                } : null;
            } else if (ropes.length === 1) {
                const rs = r.stateOf(ropes[0]);
                if (!rs || !rs.points) return;
                const atStart = ownerId(ropes[0].from) === id;
                const pts = atStart ? rs.points : rs.points.slice().reverse();
                const u = norm(sub(pts[1], pts[0]));
                b.kind = 'hang';
                b.e = scale(u, -1);
                // It stops before reaching the pulley (or the end of the rope): a body as wide as the
                // pulley would run into it, so half its width is kept free too
                const clear = 0.05 + (st.w || 2 * (st.radius || 0)) / 2;
                b.range = [-Math.max(0, len(sub(pts[1], pts[0])) - clear), Infinity];
                // ...and when its bottom reaches the ground below it (or the bottom of the view)
                if (b.e.y < -0.5) {
                    const half = (st.h || 2 * (st.radius || 0)) / 2;
                    const grounds = r.objects.filter(x => x.type === 'ground').map(x => r.stateOf(x))
                        .filter(gs => gs && gs.surface).map(gs => gs.surface(0.5).point.y).filter(y => y < st.pos.y - half + 1e-9);
                    const floor = Math.max(view.yMin, ...grounds);
                    b.range[1] = (st.pos.y - half - floor) / -b.e.y;
                }
                b.friction = null;
            } else {
                this._warn(`solve: '${id}' is neither on a straight surface nor hanging from one rope: its forces stay schematic`);
                return;
            }
            b.manual = r.objects.filter(x => x.type === 'force' && x.on === id && !x.__auto);
            bodies.push(b);
        });
        const index = new Map(bodies.map((b, i) => [b.id, i]));
        // Ropes: each end on a solved body (u: direction along the rope, away from the body)
        const ropes = [];
        r.objects.filter(x => x.type === 'rope').forEach(rope => {
            const rs = r.stateOf(rope);
            if (!rs || !rs.points || rs.points.length < 2) return;
            const ends = [];
            [[ownerId(rope.from), rs.points[0], rs.points[1]], [ownerId(rope.to), rs.points[rs.points.length - 1], rs.points[rs.points.length - 2]]]
                .forEach(([id, p, next]) => {
                    if (index.has(id)) ends.push({ i: index.get(id), u: norm(sub(next, p)) });
                });
            if (ends.length) ropes.push({ obj: rope, ends });
        });
        // Springs on solved bodies: their ends move with them
        const springs = r.objects.filter(x => x.type === 'spring' && x.k !== undefined && x.rest !== undefined).map(sp => {
            const ss = r.stateOf(sp);
            if (!ss) return null;
            const ia = index.get(ownerId(sp.from)), ib = index.get(ownerId(sp.to));
            if (ia === undefined && ib === undefined) return null;
            return { obj: sp, a: ss.a, b: ss.b, ia, ib, k: r.num(sp.k, 'spring k'), rest: r.num(sp.rest, 'spring rest') };
        }).filter(Boolean);
        this.model = { bodies, ropes, springs, dt: this.scene.sim ? this.scene.sim.dt : 1 / 240 };
    }

    /** Forces known before solving, per body: weight, springs, hand-written forces. */
    _known(y, view, fresh) {
        const r = this.scene.resolver;
        const { bodies, springs } = this.model;
        const F = bodies.map(b => ({ ...b.weight }));
        springs.forEach(sp => {
            const pa = sp.ia !== undefined ? add(sp.a, scale(bodies[sp.ia].e, y[2 * bodies[sp.ia].k])) : sp.a;
            const pb = sp.ib !== undefined ? add(sp.b, scale(bodies[sp.ib].e, y[2 * bodies[sp.ib].k])) : sp.b;
            const d = sub(pb, pa), L = len(d);
            if (L < 1e-9) return;
            const f = scale(d, sp.k * (L - sp.rest) / L); // on the "from" end, towards the other
            if (sp.ia !== undefined) F[sp.ia] = add(F[sp.ia], f);
            if (sp.ib !== undefined) F[sp.ib] = add(F[sp.ib], scale(f, -1));
        });
        const manual = bodies.flatMap(b => b.manual);
        if (manual.length && !fresh) {
            // Asked while the scene is being resolved (for the forces drawn): read them from it
            bodies.forEach((b, i) => b.manual.forEach(o => {
                const st = r.stateOf(o);
                if (st && st.vec) F[i] = add(F[i], st.vec);
            }));
        } else if (manual.length) {
            // Their size or direction may change with time or with the bodies' positions
            r.drive = this.drive(y);
            const states = r.resolveSome(view, manual.map(o => o.id).filter(Boolean));
            bodies.forEach((b, i) => b.manual.forEach(o => {
                const st = o.id ? states.get(o.id) : r.stateOf(o);
                if (st && st.vec) F[i] = add(F[i], st.vec);
            }));
        }
        return F;
    }

    /**
     * Accelerations, tensions, normal forces and friction for the state y
     * (the solver's own variables: q, v per body).
     */
    solve(y, view, { fresh = true } = {}) {
        if (!this.model || !this.model.bodies.length) return null;
        const { bodies, ropes, dt } = this.model;
        const F = this._known(y, view, fresh);
        const n = bodies.length;
        const v = bodies.map(b => y[2 * b.k + 1]);
        // Friction state: moving (kinetic, against v), at rest (static, to be checked), slipping from rest
        const mode = bodies.map((b, i) => (!b.friction ? 'none' : Math.abs(v[i]) > V_REST ? 'kinetic' : 'stuck'));
        const slipDir = bodies.map(() => 0);
        let active = ropes.map(() => true);
        let T = ropes.map(() => 0);
        let N = bodies.map(() => 0);
        let x = null;
        for (let iter = 0; iter < 12; iter++) {
            // Normal forces from the forces known so far (tensions included)
            N = bodies.map((b, i) => {
                if (b.kind !== 'along') return 0;
                let s = dot(F[i], b.n);
                ropes.forEach((rp, k) => rp.ends.forEach(end => { if (end.i === i) s += T[k] * dot(end.u, b.n); }));
                return Math.max(0, -s);
            });
            const stuck = bodies.map((b, i) => i).filter(i => mode[i] === 'stuck');
            const act = ropes.map((rp, k) => k).filter(k => active[k]);
            const size = n + act.length + stuck.length;
            const A = Array.from({ length: size }, () => new Array(size).fill(0));
            const rhs = new Array(size).fill(0);
            bodies.forEach((b, i) => {
                A[i][i] = b.m;
                rhs[i] = dot(F[i], b.e);
                if (mode[i] === 'kinetic') rhs[i] += -Math.sign(v[i]) * b.friction.k * N[i];
                if (mode[i] === 'slip') rhs[i] += slipDir[i] * b.friction.k * N[i];
            });
            act.forEach((k, j) => {
                const col = n + j;
                ropes[k].ends.forEach(end => {
                    const c = dot(end.u, bodies[end.i].e);
                    A[end.i][col] -= c; // m a − T (u·e) = ...
                    A[col][end.i] += c; // the rope does not stretch: Σ a (u·e) = 0
                });
            });
            stuck.forEach((i, j) => {
                const col = n + act.length + j;
                A[i][col] = -1; // m a − f = ...
                A[col][i] = 1; // a = −v/dt: at rest it stays at rest
                rhs[col] = -v[i] / dt;
            });
            x = solveLinear(A, rhs);
            if (!x) return null;
            const newT = ropes.map((rp, k) => (active[k] ? x[n + act.indexOf(k)] : 0));
            let changed = false;
            // A rope that would push goes slack
            newT.forEach((t, k) => { if (active[k] && t < -1e-9) { active[k] = false; changed = true; } });
            // Static friction above μs N: the body slips, friction kinetic in the same direction
            stuck.forEach((i, j) => {
                const f = x[n + act.length + j];
                if (Math.abs(f) > bodies[i].friction.s * N[i] + 1e-9) {
                    mode[i] = 'slip';
                    slipDir[i] = Math.sign(f);
                    changed = true;
                }
            });
            const settled = newT.every((t, k) => Math.abs(t - T[k]) < 1e-9 * (1 + Math.abs(t)));
            T = newT.map(t => Math.max(0, t));
            if (!changed && settled) break;
        }
        const stuck = bodies.map((b, i) => i).filter(i => mode[i] === 'stuck');
        const act = ropes.map((rp, k) => k).filter(k => active[k]);
        const out = { a: new Map(), N: new Map(), f: new Map(), T: new Map(), dir: new Map(), normal: new Map() };
        bodies.forEach((b, i) => {
            out.a.set(b.id, x[i]);
            out.dir.set(b.id, b.e);
            if (b.kind === 'along') { out.N.set(b.id, N[i]); out.normal.set(b.id, b.n); }
            let f = 0;
            if (mode[i] === 'stuck') f = x[n + act.length + stuck.indexOf(i)];
            else if (mode[i] === 'kinetic') f = -Math.sign(v[i]) * b.friction.k * N[i];
            else if (mode[i] === 'slip') f = slipDir[i] * b.friction.k * N[i];
            if (b.friction) out.f.set(b.id, f);
        });
        ropes.forEach((rp, k) => out.T.set(rp.obj, T[k]));
        out.accel = bodies.map((b, i) => x[i]);
        return out;
    }

    /** Derivatives of the solver's variables: (q, v)' = (v, a). */
    derivs(y, view) {
        const sol = this.solve(y, view);
        const d = new Array(this.ids.length * 2).fill(0);
        if (!sol) return d;
        this.model.bodies.forEach((b, i) => {
            d[2 * b.k] = y[2 * b.k + 1];
            d[2 * b.k + 1] = sol.accel[i];
        });
        return d;
    }

    /** Has a body reached the end of its surface or its pulley? */
    stopped(y) {
        return !!this.model && this.model.bodies.some(b => {
            const q = y[2 * b.k];
            return q < b.range[0] || q > b.range[1];
        });
    }
}
