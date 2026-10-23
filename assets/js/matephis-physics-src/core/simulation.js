/**
 * Simulation: time for a scene.
 *
 * Motion is written two ways, freely mixed:
 *   analytic  positions as expressions of t:  "at": ["v0*cos(a)*t", "..."]
 *   ODE       "state": {"x": 1, "v": 0}, "ode": {"x": "v", "v": "-k/m*x"},
 *             "events": [{"when": "y < 0", "set": {"vy": "-e*vy"}}]
 * `t` and the state variables are params, so any expression can read them.
 *
 * Everything is precomputed for [0, max] when the page loads and whenever a
 * param changes: the ODE run (every step stored), the paths of bodies that
 * are traced, and the ghosts. Playing and scrubbing then only move t.
 * Velocities and accelerations of bodies come from their positions (central
 * differences), so analytic and ODE motion work the same way.
 */
import { integrate, stateAt } from './integrator.js';
import { energyValues, mechanicalEnergy, totalEnergy } from '../objects/energy.js';

const DEFAULT_DT = 1 / 240;
const TRACK_DT = 1 / 60;
const DIFF_H = 1e-3;

/** Default time span for scenes without "time" (static motion diagrams). */
const STATIC_SPAN = 2;

/** Instants sampled over the run for scales; graphs and energy bars take more (per second, at most). */
const BASE_SAMPLES = 40;
const SAMPLES_PER_SECOND = 60;
const MAX_SAMPLES = 600;

export class Simulation {
    /**
     * @param {object} scene - the MatephisPhysics instance (config, params, compiler, resolver)
     * @param {string[]} names - state variable names
     * @param {object} [opts]
     * @param {boolean} [opts.graphs=true] - sample the scene's graphs (not for "compare" copies)
     */
    constructor(scene, names, { graphs = true } = {}) {
        this.scene = scene;
        this.withGraphs = graphs;
        this.cfg = scene.config;
        this.time = this.cfg.time && typeof this.cfg.time === 'object' ? this.cfg.time : {};
        this.names = names;
        this.hasClock = this.cfg.time !== undefined;
        this.t = 0;
        this.signature = null;
        this.run = null;
        this.tEnd = 0;
        this._compile();
    }

    _warn(msg) {
        this.scene._addWarning(msg);
    }

    _fn(src, where) {
        try {
            return this.scene.compiler.fn(String(src), []);
        } catch (e) {
            this._warn(`${where}: ${e.message}`);
            return null;
        }
    }

    /** Compiles derivatives, events and the stop condition once. */
    _compile() {
        const ode = this.cfg.ode && typeof this.cfg.ode === 'object' ? this.cfg.ode : {};
        this.derivs = this.names.map(n => {
            if (ode[n] === undefined) {
                this._warn(`ode: no derivative for state variable '${n}' (it stays constant)`);
                return () => 0;
            }
            return this._fn(ode[n], `ode ${n}`) || (() => NaN);
        });
        Object.keys(ode).forEach(n => {
            if (!this.names.includes(n)) this._warn(`ode: '${n}' is not a state variable`);
        });
        this.events = (Array.isArray(this.cfg.events) ? this.cfg.events : []).map((e, i) => {
            const when = this._fn(e.when, `events[${i}] when`);
            if (!when) return null;
            const set = e.set && typeof e.set === 'object' ? Object.entries(e.set).map(([k, v]) => {
                if (!this.names.includes(k)) this._warn(`events[${i}] set: '${k}' is not a state variable`);
                return [this.names.indexOf(k), this._fn(v, `events[${i}] set ${k}`)];
            }).filter(([k, f]) => k >= 0 && f) : [];
            return {
                when: (y, t) => { this._scope(y, t); return !!when(); },
                apply: set.length ? (y, t) => {
                    this._scope(y, t);
                    // All new values are computed from the state before the event
                    const vals = set.map(([k, f]) => [k, f()]);
                    const out = y.slice();
                    vals.forEach(([k, v]) => { out[k] = v; });
                    return out;
                } : null,
                stop: e.stop === true, once: e.once === true, label: e.label,
            };
        }).filter(Boolean);
        const sw = this.time.stopWhen !== undefined ? this._fn(this.time.stopWhen, 'time stopWhen') : null;
        this.stopWhen = sw ? (y, t) => { this._scope(y, t); return !!sw(); } : null;
    }

    /** Puts a state and a time into the params, where expressions read them. */
    _scope(y, t) {
        const p = this.scene.params;
        p.t = t;
        this.names.forEach((n, i) => { p[n] = y[i]; });
    }

    get dt() {
        const v = this.time.dt !== undefined ? this.scene._num(this.time.dt, 'time dt') : DEFAULT_DT;
        return v > 0 ? v : DEFAULT_DT;
    }

    /** End of the time span: "max", or the latest "to" of ghosts and traces in a static scene. */
    _tMax(objects) {
        if (this.time.max !== undefined) return Math.max(0, this.scene._num(this.time.max, 'time max'));
        if (this.hasClock) return 10;
        let m = 0;
        objects.forEach(o => {
            if ((o.type === 'ghosts' || o.type === 'trace') && o.to !== undefined) m = Math.max(m, this.scene._num(o.to, `${o.type} to`));
        });
        return m || STATIC_SPAN;
    }

    /** Params that the motion depends on (everything but t and the state). */
    _signature() {
        const p = this.scene.params;
        return JSON.stringify(Object.keys(p).filter(k => k !== 't' && !this.names.includes(k)).sort().map(k => [k, p[k]]));
    }

    /** Integrates and precomputes paths and ghosts if a param changed since last time. */
    prepare(view) {
        const sig = this._signature();
        if (sig !== this.signature) {
            this.signature = sig;
            this._compute(view);
        }
        this.setTime(this.t);
        this._kinematicsNow(view);
        // setTime again: the kinematics moved t back and forth
        this.setTime(this.t);
    }

    _compute(view) {
        const r = this.scene.resolver;
        const tMax = this._tMax(r.objects);
        const p = this.scene.params;
        p.t = 0;
        const y0 = this.names.map(n => this.scene._num(this.cfg.state[n], `state ${n}`));
        const f = (y, t) => {
            this._scope(y, t);
            return this.derivs.map(d => d());
        };
        this.run = integrate({ y0, f, dt: this.dt, tMax, events: this.events, stopWhen: this.stopWhen });
        if (this.run.stopped === 'too many events') this._warn('events: too many in a short time (a bounce that never ends?): stopped');
        if (this.run.stopped === 'not finite') this._warn('ode: the state is not finite any more: stopped');
        this.tEnd = this.run.tEnd;
        if (this.t > this.tEnd) this.t = this.tEnd;

        // Paths of traced bodies and ghost states, from partial resolutions at other times
        this.tracks = new Map();
        const traced = [...new Set(r.objects.filter(o => o.type === 'trace' && o.of).map(o => o.of))];
        if (traced.length) {
            const n = Math.max(1, Math.ceil(this.tEnd / TRACK_DT));
            traced.forEach(id => this.tracks.set(id, []));
            for (let i = 0; i <= n; i++) {
                const t = Math.min(this.tEnd, i * TRACK_DT);
                const states = this._statesAt(t, traced, view);
                traced.forEach(id => {
                    const st = states.get(id);
                    if (st) this.tracks.get(id).push({ t, pos: st.com || st.pos });
                });
            }
        }
        this.ghosts = new Map();
        r.objects.filter(o => o.type === 'ghosts' && o.of).forEach(o => this.ghosts.set(o, this._ghosts(o, view)));
        this._sample(view);
    }

    /**
     * One pass over the run, resolving the whole scene at evenly spaced
     * instants, for what must stay fixed while time runs:
     *   - the largest magnitude of each vector kind (automatic scales: a vector
     *     that grows must look longer, not be rescaled frame by frame);
     *   - the range of each energy chart, and E at t = 0 for Q;
     *   - the samples of the graphs.
     */
    _sample(view) {
        const r = this.scene.resolver;
        const graphs = this.withGraphs ? this.scene.graphs : null;
        const energies = r.objects.filter(o => o.type === 'energy');
        const fine = (graphs && graphs.count) || energies.length;
        const n = fine ? Math.min(MAX_SAMPLES, Math.max(BASE_SAMPLES, Math.ceil(this.tEnd * SAMPLES_PER_SECOND))) : BASE_SAMPLES;
        const max = {};
        const energy = new Map(energies.map(o => [o, { E0: NaN, maxPos: 0, maxNeg: 0 }]));
        this.energy = energy;
        if (graphs) graphs.beginSamples();
        for (let i = 0; i <= n; i++) {
            const t = this.tEnd * i / n;
            this.setTime(t);
            this._kinematicsAt(t, view);
            this.setTime(t);
            r.timeline = { ...this.timeline(), t };
            const states = r.resolveAll(view);
            states.forEach((st, obj) => {
                if (!st || !st.vec || st.isResultant || st.outOfPlane || obj.scale !== undefined) return;
                max[st.kind] = Math.max(max[st.kind] || 0, st.mag);
            });
            energy.forEach((e, obj) => {
                const E = totalEnergy(obj, mechanicalEnergy(obj, r));
                if (i === 0) e.E0 = E;
                const vals = energyValues(obj, r).bars.map(b => (b.key === 'Q' ? e.E0 - E : b.value));
                if (obj.total === true) vals.push(E);
                vals.filter(isFinite).forEach(v => {
                    e.maxPos = Math.max(e.maxPos, v);
                    e.maxNeg = Math.max(e.maxNeg, -v);
                });
            });
            if (graphs) graphs.addSample(t);
            if (this.tEnd <= 0) break;
        }
        if (graphs) graphs.endSamples();
        this.maxMag = max;
    }

    /** States of some objects at time t (partial resolution; leaves t set). */
    _statesAt(t, ids, view) {
        this.setTime(t);
        return this.scene.resolver.resolveSome(view, ids);
    }

    /**
     * Velocity and acceleration of a body at time t, by central differences
     * (one-sided, still second order, at the start and at the end of the run).
     */
    _kinematics(id, t, view) {
        const h = Math.min(DIFF_H, this.tEnd / 4);
        if (!(h > 0)) return null;
        const pos = (tt) => {
            const st = this._statesAt(tt, [id], view).get(id);
            return st ? (st.com || st.pos) : null;
        };
        // Three instants t0, t0 + h, t0 + 2h around t, and where t is among them
        const t0 = t - h < 0 ? 0 : t + h > this.tEnd ? this.tEnd - 2 * h : t - h;
        const a = pos(t0), b = pos(t0 + h), c = pos(t0 + 2 * h);
        if (!a || !b || !c) return null;
        const k = (t - t0) / h; // 0, 1 or 2
        // Derivative of the parabola through the three points, at t
        const d = (p, q, r) => ((2 * k - 3) * p - 4 * (k - 1) * q + (2 * k - 1) * r) / (2 * h);
        return {
            v: { x: d(a.x, b.x, c.x), y: d(a.y, b.y, c.y), z: 0 },
            a: { x: (a.x - 2 * b.x + c.x) / (h * h), y: (a.y - 2 * b.y + c.y) / (h * h), z: 0 },
        };
    }

    /** Kinematics for the vectors that need it ("velocity" / "acceleration" on a body, no dir or vec). */
    _kinematicsNow(view) {
        this._kinematicsAt(Math.min(this.t, this.tEnd), view);
    }

    /** Bodies whose velocity and acceleration something reads. */
    _kinTargets() {
        if (this._kinIds) return this._kinIds;
        const r = this.scene.resolver;
        const ids = new Set(this.scene.kinIds || []);
        r.objects.forEach(o => {
            if ((o.type === 'velocity' || o.type === 'acceleration') && o.on !== undefined && o.dir === undefined && o.vec === undefined) ids.add(o.on);
            if (o.type === 'energy') [].concat(o.of).forEach(id => { if (typeof id === 'string' && r.objectById(id)) ids.add(id); });
            // Seen from above, static friction is the force the motion needs
            if (o.__auto && o.__auto.kind === 'friction' && this.cfg.plane === 'horizontal') ids.add(o.on);
        });
        this._kinIds = [...ids].filter(id => r.objectById(id));
        return this._kinIds;
    }

    _kinematicsAt(t, view) {
        const ids = this._kinTargets();
        this.kin = new Map();
        ids.forEach(id => {
            const k = this._kinematics(id, t, view);
            if (k) this.kin.set(id, k);
        });
    }

    /** Ghost copies of a body every `every` seconds in [from, to]. */
    _ghosts(o, view) {
        const s = this.scene;
        const every = o.every !== undefined ? s._num(o.every, 'ghosts every') : 0.2;
        const from = o.from !== undefined ? s._num(o.from, 'ghosts from') : 0;
        const to = Math.min(this.tEnd, o.to !== undefined ? s._num(o.to, 'ghosts to') : this.tEnd);
        if (!(every > 0) || !(to >= from)) {
            this._warn(`ghosts: "every" must be positive and "to" after "from"`);
            return [];
        }
        const vectors = Array.isArray(o.vectors) ? o.vectors : o.vectors ? [o.vectors] : [];
        const out = [];
        for (let k = 0; k < 500; k++) {
            const t = from + k * every;
            if (t > to + 1e-9) break;
            const st = this._statesAt(t, [o.of], view).get(o.of);
            if (!st) continue;
            const item = { t, state: st };
            if (vectors.length) {
                const kin = this._kinematics(o.of, t, view);
                if (kin) { item.v = kin.v; item.a = kin.a; }
            }
            out.push(item);
        }
        return out;
    }

    /** Sets t (clamped) and the state at t into the params. */
    setTime(t) {
        const tt = Math.min(Math.max(0, t), this.tEnd || 0);
        const y = this.run && this.names.length ? stateAt(this.run, tt) : [];
        this._scope(y, tt);
        return tt;
    }

    /** Current time, as the clock moves it. */
    seek(t) {
        this.t = Math.min(Math.max(0, t), this.clockEnd);
    }

    /**
     * Where the clock stops: the end of this run, or later when a "compare"
     * run lasts longer (this one then stays at its last state).
     */
    get clockEnd() {
        return Math.max(this.tEnd, this.extraEnd || 0);
    }

    /** What object types read while the scene is resolved at the current time. */
    timeline() {
        return {
            t: this.t, tEnd: this.tEnd, kin: this.kin || new Map(), tracks: this.tracks || new Map(),
            ghosts: this.ghosts || new Map(), maxMag: this.maxMag || {}, live: this.hasClock,
            energy: this.energy || new Map(),
        };
    }
}
