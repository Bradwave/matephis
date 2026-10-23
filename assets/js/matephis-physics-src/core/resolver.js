/**
 * Scene resolver: from configuration to world geometry, with no DOM.
 *
 * Resolves every object once per draw, lazily and in dependency order
 * (an object referring to "A" resolves A first; cycles are reported).
 * Object types receive this resolver to read numbers, angles, points,
 * directions and frames, and to place bodies on surfaces. After all objects
 * are resolved it computes the vector scales and the connection graph.
 */
import { angleValue, angleLiteralWarning } from './angles.js';
import { parseRef } from './anchors.js';
import { add, sub, scale, norm, perp, fromAngle, angleOf, len, rotate } from './vec.js';
import { expandAutoForces } from '../objects/autoforces.js';
import { aliasId } from './compiler.js';

const WORLD_FRAME = { t: { x: 1, y: 0, z: 0 }, n: { x: 0, y: 1, z: 0 }, labels: ['x', 'y'] };
const DIR_WORDS = ['up', 'down', 'left', 'right', 'tangent', '-tangent', 'normal', '-normal', 'toward', 'away', 'along'];
const VECTOR_KINDS = ['force', 'velocity', 'acceleration', 'momentum', 'vector'];

/** Fraction of the shorter side of the view that the largest vector of a kind spans. */
const AUTO_VECTOR_SPAN = 0.28;

export class Resolver {
    /**
     * @param {object} opts
     * @param {object[]} opts.objects - object configs (unknown types already filtered out)
     * @param {object} opts.types - object type registry
     * @param {import('../../matephis-plot-src/parser/expression-parser.js').ExpressionCompiler} opts.compiler
     * @param {"deg"|"rad"} [opts.angleUnit]
     * @param {object} [opts.config] - scene root config (forceScale, vectorScale)
     * @param {(msg: string) => void} [opts.warn]
     */
    constructor({ objects, types, compiler, angleUnit = 'deg', config = {}, warn = () => {} }) {
        this.types = types;
        this.compiler = compiler;
        this.angleUnit = angleUnit;
        this.config = config;
        this.warn = warn;
        this.objects = expandShortcuts(expandAutoForces(objects));
        this.byId = new Map();
        this.objects.forEach(o => { if (o.id && !this.byId.has(o.id)) this.byId.set(o.id, o); });
        this.ids = [...this.byId.keys()];
        this._idPattern = this.ids.length
            ? new RegExp(`(?<![A-Za-z0-9_.])(${[...this.ids].sort((a, b) => b.length - a.length).map(id => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\.`, 'g')
            : null;
        this.resolved = {};
        this.view = { xMin: 0, xMax: 10, yMin: 0, yMax: 5 };
        /** Set by the scene when it has time: current t, kinematics, tracks, ghosts. */
        this.timeline = null;
    }

    /**
     * Resolves only some objects (and what they depend on), for positions at
     * other times. Leaves scales and graph untouched.
     * @returns {Map<string, object>} id -> state
     */
    resolveSome(view, ids) {
        if (view) this.view = view;
        this.states = new Map();
        this.visiting = new Set();
        this.resolved = {};
        this.faded = new Set();
        this.pairIndex = new Map();
        this._resolving = true;
        const out = new Map();
        try {
            ids.forEach(id => out.set(id, this.state(id)));
        } finally {
            this._resolving = false;
        }
        return out;
    }

    /**
     * Resolves all objects for the given visible window (metres).
     * @returns {Map<object, object>} config object -> state (null when it could not be resolved)
     */
    resolveAll(view) {
        if (view) this.view = view;
        this.states = new Map();
        this.visiting = new Set();
        this.resolved = {};
        this.faded = new Set();
        this.pairIndex = new Map();
        this._resolving = true;
        try {
            this.objects.forEach(o => this._resolveObject(o));
        } finally {
            this._resolving = false;
        }
        this.scales = this._computeScales();
        this.graph = this._buildGraph();
        return this.states;
    }

    // =========================================================================
    // VALUES
    // =========================================================================

    num(v, where = 'value') {
        if (typeof v === 'number') return v;
        if (typeof v === 'boolean') return Number(v);
        if (typeof v !== 'string' || v.trim() === '') {
            this.warn(`${where}: expected a number or an expression`);
            return NaN;
        }
        try {
            this._resolveReferencedIds(v);
            const r = this.compiler.eval(v);
            return typeof r === 'number' ? r : NaN;
        } catch (e) {
            this.warn(`${where}: ${e.message}`);
            return NaN;
        }
    }

    /** Angle field in radians: bare numbers follow angleUnit, strings are expressions. */
    angle(v, where = 'angle') {
        const w = angleLiteralWarning(v, this.angleUnit, where);
        if (w) this.warn(w);
        return angleValue(v, this.angleUnit, (e) => this.num(e, where));
    }

    /** Resolves objects named in "A.x"-style references before evaluating. */
    _resolveReferencedIds(src) {
        if (!this._idPattern || !this._resolving) return;
        this._idPattern.lastIndex = 0;
        let m;
        while ((m = this._idPattern.exec(src)) !== null) this.state(m[1]);
    }

    // =========================================================================
    // OBJECTS
    // =========================================================================

    /** State of the object with this id (resolving it if needed), or null. */
    state(id) {
        const obj = this.byId.get(id);
        if (!obj) return null;
        if (this.states.has(obj)) return this.states.get(obj);
        if (this.visiting.has(obj)) {
            this.warn(`Reference cycle through '${id}'`);
            return null;
        }
        return this._resolveObject(obj);
    }

    objectById(id) {
        return this.byId.get(id) || null;
    }

    /** State of an object given by its config (for objects without an id, like an unnamed rope). */
    stateOf(obj) {
        if (this.states.has(obj)) return this.states.get(obj);
        if (this.visiting.has(obj)) {
            this.warn(`Reference cycle through ${describe(obj)}`);
            return null;
        }
        return this._resolveObject(obj);
    }

    _resolveObject(obj) {
        if (this.states.has(obj)) return this.states.get(obj);
        this.visiting.add(obj);
        let state = null;
        try {
            state = this.types[obj.type].resolve(obj, this) || null;
        } catch (e) {
            this.warn(`${describe(obj)}: ${e.message}`);
        }
        this.visiting.delete(obj);
        this.states.set(obj, state);
        if (obj.id && state) this.resolved[aliasId(obj.id)] = this._values(obj, state);
        return state;
    }

    /** What expressions read of an object: A.x, A.angle, A.speed, F.mag... */
    _values(obj, state) {
        if (state.vec) {
            const a = angleOf(state.vec);
            return { x: state.vec.x, y: state.vec.y, mag: len(state.vec), angle: a, rad: a, deg: a * 180 / Math.PI };
        }
        const a = state.angle || 0;
        const out = { x: state.pos.x, y: state.pos.y, angle: a, rad: a, deg: a * 180 / Math.PI };
        const k = this.timeline && this.timeline.kin.get(obj.id);
        if (k) {
            Object.assign(out, {
                vx: k.v.x, vy: k.v.y, speed: Math.hypot(k.v.x, k.v.y),
                ax: k.a.x, ay: k.a.y, acc: Math.hypot(k.a.x, k.a.y),
            });
        }
        return out;
    }

    // =========================================================================
    // POINTS, ANCHORS
    // =========================================================================

    /**
     * A point in world coordinates: [x, y] or [x, y, z] (numbers or
     * expressions), an anchor reference ("A", "A.top", "s.surface(0.6)"), or
     * { "from": <point>, "offset": [dx, dy], "local": true } with the offset in
     * metres, in the referenced object's frame when local is true.
     * @returns {{x: number, y: number, z: number}|null}
     */
    point(v, where = 'point') {
        if (Array.isArray(v) && (v.length === 2 || v.length === 3)) {
            const x = this.num(v[0], `${where} x`), y = this.num(v[1], `${where} y`);
            const z = v.length === 3 ? this.num(v[2], `${where} z`) : 0;
            return isFinite(x) && isFinite(y) ? { x, y, z: isFinite(z) ? z : 0 } : null;
        }
        if (typeof v === 'string') return this.anchor(v, where);
        if (v && typeof v === 'object' && v.from !== undefined) {
            const base = this.point(v.from, where);
            if (!base) return null;
            const off = Array.isArray(v.offset) ? v.offset : [0, 0];
            let d = { x: this.num(off[0], `${where} offset`), y: this.num(off[1], `${where} offset`), z: 0 };
            if (v.local) {
                const ref = typeof v.from === 'string' ? parseRef(v.from) : null;
                const st = ref ? this.state(ref.id) : null;
                if (st && st.frame) d = add(scale(st.frame.t, d.x), scale(st.frame.n, d.y));
            }
            return add(base, d);
        }
        this.warn(`${where}: expected [x, y], an anchor like "A.top" or { "from", "offset" }`);
        return null;
    }

    /** Resolves an anchor reference string to a world point. */
    anchor(str, where = 'anchor') {
        const ref = parseRef(str);
        if (!ref) {
            this.warn(`${where}: '${str}' is not a valid reference`);
            return null;
        }
        const obj = this.byId.get(ref.id);
        if (!obj) {
            this.warn(`${where}: no object with id '${ref.id}'`);
            return null;
        }
        const st = this.state(ref.id);
        if (!st) return null;
        if (!ref.anchor) return st.pos;
        const type = this.types[obj.type];
        const p = type.anchor ? type.anchor(st, ref.anchor, ref.arg, this, obj) : null;
        if (!p) {
            const names = type.anchorNames ? type.anchorNames.join(', ') : 'none';
            this.warn(`${where}: ${describe(obj)} has no anchor '${ref.anchor}' (available: ${names})`);
            return null;
        }
        return p;
    }

    /** Id of the object a point spec refers to ("A.top" -> "A"), or null. */
    ownerOf(v) {
        if (typeof v === 'string') {
            const ref = parseRef(v);
            return ref && this.byId.has(ref.id) ? ref.id : null;
        }
        if (v && typeof v === 'object' && !Array.isArray(v) && v.from !== undefined) return this.ownerOf(v.from);
        return null;
    }

    // =========================================================================
    // PLACEMENT
    // =========================================================================

    /**
     * Position and frame of a body: either resting `on` a surface at `pos`
     * (its centre lifted by `lift` metres along the surface normal), or `at`
     * a point with an optional `angle`. `contact` is the touching point on the surface.
     * @returns {{pos, angle, frame: {t, n}, support: string|null, contact: object|null}|null}
     */
    /**
     * A body moving along a path: "follow": "<path id>", "s": arc length in
     * metres (an expression of t, or a state variable); "orient": "tangent"
     * turns it with the path. Round a closed path s wraps; on an open one the
     * body stops at the ends.
     */
    _follow(obj, extra, where) {
        const ps = this.state(obj.follow);
        if (!ps || typeof ps.at !== 'function') {
            this.warn(`${where}: 'follow' must be the id of a path`);
            return null;
        }
        let s = obj.s !== undefined ? this.num(obj.s, `${where} s`) : 0;
        if (!isFinite(s)) return null;
        const L = ps.length;
        s = ps.closed && L > 0 ? ((s % L) + L) % L : Math.min(Math.max(s, 0), L);
        const { point, tangent } = ps.at(s);
        const t = obj.orient === 'tangent' ? rotate(tangent, extra) : fromAngle(extra);
        return { pos: point, angle: angleOf(t), frame: { t, n: perp(t) }, support: null, contact: null, pathTangent: tangent };
    }

    place(obj, lift, where = describe(obj)) {
        const extra = obj.angle !== undefined ? this.angle(obj.angle, `${where} angle`) : 0;
        if (obj.follow !== undefined) return this._follow(obj, extra, where);
        if (obj.on !== undefined) {
            const sup = this.state(obj.on);
            const supObj = this.byId.get(obj.on);
            if (!supObj) {
                this.warn(`${where}: no object with id '${obj.on}' to rest on`);
                return null;
            }
            if (!sup || typeof sup.surface !== 'function') {
                this.warn(`${where}: ${describe(supObj)} is not a surface a body can rest on`);
                return null;
            }
            let u = obj.pos !== undefined ? this.num(obj.pos, `${where} pos`) : 0.5;
            if (obj.posUnit === 'm') u = sup.surfaceLength > 0 ? u / sup.surfaceLength : 0;
            const s = sup.surface(u);
            const t = rotate(s.tangent, extra), n = rotate(s.normal, extra);
            return { pos: add(s.point, scale(s.normal, lift)), angle: angleOf(t), frame: { t, n }, support: obj.on, contact: s.point };
        }
        if (obj.at === undefined) {
            this.warn(`${where}: needs 'at' or 'on'`);
            return null;
        }
        const p = this.point(obj.at, `${where} at`);
        if (!p) return null;
        const t = fromAngle(extra);
        return { pos: p, angle: extra, frame: { t, n: perp(t) }, support: null, contact: null };
    }

    // =========================================================================
    // DIRECTIONS AND FRAMES
    // =========================================================================

    /**
     * Unit direction (world) from a direction spec:
     *   "up" | "down" | "left" | "right"
     *   "tangent" | "-tangent" | "normal" | "-normal"  frame of `owner` (the surface it rests on)
     *   "tangent:F1"                                   frame of another object / named frame
     *   "toward:B" | "away:B"                          towards / away from a point
     *   "along:rope1"                                  along a rope, away from `owner`
     *   number (angleUnit) | expression (radians)      angle from the +x axis
     *   [vx, vy]                                       a vector (its direction)
     * @param {*} spec
     * @param {object|null} owner - state of the object the direction belongs to
     * @param {object|null} at - application point (for toward/away/radial)
     */
    dir(spec, owner, at, where = 'dir') {
        if (typeof spec === 'number') return fromAngle(this.angle(spec, where));
        if (Array.isArray(spec) && spec.length >= 2) {
            return norm({ x: this.num(spec[0], `${where} x`), y: this.num(spec[1], `${where} y`) });
        }
        if (typeof spec !== 'string') {
            this.warn(`${where}: expected a direction`);
            return null;
        }
        const i = spec.indexOf(':');
        const head = (i >= 0 ? spec.slice(0, i) : spec).trim();
        const rest = i >= 0 ? spec.slice(i + 1).trim() : null;
        if (!DIR_WORDS.includes(head)) return fromAngle(this.angle(spec, where));

        switch (head) {
            case 'up': return { x: 0, y: 1, z: 0 };
            case 'down': return { x: 0, y: -1, z: 0 };
            case 'left': return { x: -1, y: 0, z: 0 };
            case 'right': return { x: 1, y: 0, z: 0 };
            case 'toward':
            case 'away': {
                const p = this.point(rest, where);
                if (!p || !at) return null;
                const d = norm(sub(p, at));
                return head === 'toward' ? d : scale(d, -1);
            }
            case 'along': {
                const d = this.alongRope(rest, owner, at, where);
                return d;
            }
            default: {
                const f = rest ? this.frame(rest, at, where) : (owner && owner.frame) || null;
                if (!f) {
                    this.warn(`${where}: '${spec}' needs a body resting on a surface, or a frame ("${head}:F1")`);
                    return null;
                }
                const sign = head.startsWith('-') ? -1 : 1;
                return scale(head.endsWith('tangent') ? f.t : f.n, sign);
            }
        }
    }

    /** Direction along a rope, away from the end attached to `owner` (or nearest `at`). */
    alongRope(id, owner, at, where) {
        const st = this.state(id);
        const obj = this.byId.get(id);
        if (!st || !obj || !st.points || st.points.length < 2) {
            this.warn(`${where}: '${id}' is not a rope`);
            return null;
        }
        const pts = st.points;
        const ref = at || (owner && owner.pos);
        const first = pts[0], last = pts[pts.length - 1];
        const nearStart = !ref || len(sub(ref, first)) <= len(sub(ref, last));
        return nearStart ? norm(sub(pts[1], first)) : norm(sub(pts[pts.length - 2], last));
    }

    /**
     * Axes for decomposition and directions:
     *   "xy" (or true)    world axes
     *   "<id>"            the frame of an object (a slope: along / perpendicular to it)
     *   "radial:<point>"  radial and tangential with respect to a centre
     * @returns {{t, n, labels: string[]}|null}
     */
    frame(spec, at, where = 'frame') {
        if (spec === undefined || spec === null || spec === true || spec === 'xy') return WORLD_FRAME;
        if (typeof spec !== 'string') {
            this.warn(`${where}: expected "xy", an object id or "radial:<point>"`);
            return null;
        }
        if (spec.startsWith('radial:')) {
            const c = this.point(spec.slice(7).trim(), where);
            if (!c || !at) return null;
            const r = norm(sub(at, c));
            return { t: r, n: perp(r), labels: ['r', 't'] };
        }
        const obj = this.byId.get(spec);
        if (!obj) {
            this.warn(`${where}: no frame or object with id '${spec}'`);
            return null;
        }
        const st = this.state(spec);
        if (!st || !st.frame) {
            this.warn(`${where}: ${describe(obj)} has no frame`);
            return null;
        }
        return { t: st.frame.t, n: st.frame.n, labels: st.frame.labels || ["x'", "y'"] };
    }

    // =========================================================================
    // POST-PROCESSING
    // =========================================================================

    /** Metres per physical unit, per vector kind: explicit or "auto". */
    _computeScales() {
        const max = {};
        this.states.forEach((st, obj) => {
            if (!st || !st.vec || st.isResultant || obj.scale !== undefined) return;
            max[st.kind] = Math.max(max[st.kind] || 0, st.mag);
        });
        // With time, the largest value over the whole run, so scales do not change while it plays
        const overTime = this.timeline && this.timeline.maxMag ? this.timeline.maxMag : {};
        Object.keys(overTime).forEach(kind => { max[kind] = Math.max(max[kind] || 0, overTime[kind]); });
        const span = AUTO_VECTOR_SPAN * Math.min(this.view.xMax - this.view.xMin, this.view.yMax - this.view.yMin);
        const scales = {};
        /** Kinds whose scale comes from the scene (explicit, or vectors of that kind). */
        this.scaleSet = new Set();
        VECTOR_KINDS.forEach(kind => {
            const explicit = kind === 'force' ? this.config.forceScale
                : (this.config.vectorScale && typeof this.config.vectorScale === 'object' ? this.config.vectorScale[kind] : undefined);
            if (explicit !== undefined && explicit !== 'auto') {
                scales[kind] = this.num(explicit, kind === 'force' ? 'forceScale' : `vectorScale ${kind}`);
                this.scaleSet.add(kind);
            } else {
                scales[kind] = max[kind] > 0 ? span / max[kind] : 1;
                if (max[kind] > 0) this.scaleSet.add(kind);
            }
        });
        return scales;
    }

    /** Edges between objects: contact (on), rope, spring, pivot. Used by automatic forces later. */
    _buildGraph() {
        const edges = [];
        this.objects.forEach(obj => {
            const st = this.states.get(obj);
            if (!st) return;
            if (obj.on !== undefined && this.byId.has(obj.on) && obj.id) {
                edges.push({ kind: 'contact', a: obj.id, b: obj.on });
            }
            if (obj.type === 'rope') {
                edges.push({ kind: 'rope', id: obj.id || null, a: this.ownerOf(obj.from), b: this.ownerOf(obj.to), over: st.pulleyIds || [] });
            }
            if (obj.type === 'spring') {
                edges.push({ kind: 'spring', id: obj.id || null, a: this.ownerOf(obj.from), b: this.ownerOf(obj.to) });
            }
            if ((obj.type === 'pendulum' || (obj.type === 'rod' && obj.pivot !== undefined)) && obj.id) {
                edges.push({ kind: 'pivot', a: obj.id, b: obj.type === 'pendulum' ? this.ownerOf(obj.pivot) : null });
            }
        });
        return { edges };
    }
}

/** "block 'A'" / "object of type rope", for messages. */
export function describe(obj) {
    return `${obj.type}${obj.id ? ` '${obj.id}'` : ''}`;
}

/**
 * Expands per-object shortcuts into separate objects:
 * "decompose": <frame> on a vector adds a decompose annotation.
 */
function expandShortcuts(objects) {
    const out = [];
    let auto = 0;
    objects.forEach(obj => {
        if (VECTOR_KINDS.includes(obj.type) && obj.decompose !== undefined && obj.decompose !== false) {
            // An unnamed vector gets an internal id on a copy; the config stays as written
            const v = obj.id ? obj : { ...obj, id: `__vec${++auto}` };
            // The shortcut's components are shown and hidden with their vector
            out.push(v, { type: 'decompose', vector: v.id, frame: obj.decompose === true ? 'xy' : obj.decompose, __parent: v });
        } else {
            out.push(obj);
        }
    });
    return out;
}
