/**
 * The mathematics of a sets diagram, without any drawing: sets (finite,
 * intervals, rectangles, disks), maps between them (pairs, expressions,
 * compositions), and what can be computed from them: images, preimages,
 * collisions, injectivity, surjectivity, whether a map lands in its codomain.
 *
 * Points of continuous sets are numbers (intervals) or [x, y] (rectangles and
 * disks). Elements of finite sets are referred to by id.
 *
 * The model is built once from the config; `refresh()` re-evaluates the parts
 * that depend on params (interval endpoints) after a slider moves.
 */
import {
    parseInterval, evalInterval, interval, contains, isSubset, sameInterval,
    samplePositions, imageFromSamples, strictlyMonotone,
} from './interval.js';
import { parseArgument } from './selectors.js';

export const SET_KINDS = ['finite', 'interval', 'rect', 'disk'];

const SAMPLES_1D = 400;
const SAMPLES_2D = 60;

/** Kind of a set config. */
function setKind(def) {
    if (def.interval !== undefined) return 'interval';
    if (def.rect !== undefined) return 'rect';
    if (def.disk !== undefined) return 'disk';
    return 'finite';
}

/** Element config -> { id, label, color, value }. A string is both id and label. */
function normalizeElement(e, i) {
    if (typeof e === 'string' || typeof e === 'number') return { id: String(e), label: String(e) };
    if (e && typeof e === 'object') {
        const id = e.id !== undefined ? String(e.id) : e.label !== undefined ? String(e.label) : `e${i + 1}`;
        return { id, label: e.label !== undefined ? String(e.label) : id, color: e.color, value: e.value };
    }
    return null;
}

export class SetsModel {
    /**
     * @param {object} cfg - scene config ("sets", "maps")
     * @param {object} env
     * @param {(src: any) => number} env.evaluate - constant expression -> number
     * @param {(src: string, vars: string[]) => Function} env.compile - expression -> function of vars
     * @param {(msg: string) => void} [env.warn]
     */
    constructor(cfg, { evaluate, compile, warn = () => {} }) {
        this.evaluate = evaluate;
        this.compile = compile;
        this.warn = warn;
        this.sets = [];
        this.setById = new Map();
        this.maps = [];
        this.mapById = new Map();
        (Array.isArray(cfg.sets) ? cfg.sets : []).forEach((def, i) => this._addSet(def, i));
        (Array.isArray(cfg.maps) ? cfg.maps : []).forEach((def, i) => this._addMap(def, i));
        this.refresh();
    }

    // =====================================================================
    // SETS
    // =====================================================================

    _addSet(def, i) {
        if (!def || typeof def !== 'object') {
            this.warn(`sets[${i}]: expected an object`);
            return;
        }
        const id = def.id !== undefined ? String(def.id) : `S${i + 1}`;
        if (this.setById.has(id)) {
            this.warn(`sets[${i}]: id '${id}' is used twice`);
            return;
        }
        const kind = setKind(def);
        const set = { id, kind, def, label: def.label, color: def.color, index: i };
        if (kind === 'finite') {
            const raw = Array.isArray(def.elements) ? def.elements : [];
            if (!Array.isArray(def.elements)) this.warn(`set '${id}': needs "elements" (or "interval", "rect", "disk")`);
            set.elements = [];
            set.elementById = new Map();
            raw.forEach((e, j) => {
                const el = normalizeElement(e, j);
                if (!el) return;
                if (set.elementById.has(el.id)) {
                    this.warn(`set '${id}': element '${el.id}' is listed twice`);
                    return;
                }
                set.elements.push(el);
                set.elementById.set(el.id, el);
            });
            if (set.label === undefined) set.label = id;
        } else if (kind === 'interval') {
            set.parsed = parseInterval(String(def.interval));
            if (!set.parsed) {
                this.warn(`set '${id}': interval '${def.interval}' is not an interval like "[0,1]" or "(0,+inf)"`);
                set.parsed = { lo: '0', hi: '1', loClosed: true, hiClosed: true };
            }
        } else if (kind === 'rect') {
            const sides = Array.isArray(def.rect) ? def.rect : [];
            set.parsedSides = [0, 1].map(k => {
                const s = sides[k];
                if (typeof s === 'string') return parseInterval(s);
                if (Array.isArray(s) && s.length === 2) return { lo: String(s[0]), hi: String(s[1]), loClosed: true, hiClosed: true };
                return null;
            });
            if (set.parsedSides.some(s => !s)) {
                this.warn(`set '${id}': "rect" needs two sides, like ["[0,1]", "[0,1]"] or [[0,1],[0,1]]`);
                set.parsedSides = set.parsedSides.map(s => s || { lo: '0', hi: '1', loClosed: true, hiClosed: true });
            }
        } else if (kind === 'disk') {
            const d = def.disk && typeof def.disk === 'object' ? def.disk : {};
            set.diskDef = { center: Array.isArray(d.center) ? d.center : [0, 0], radius: d.radius !== undefined ? d.radius : 1, open: d.open === true };
        }
        this.sets.push(set);
        this.setById.set(id, set);
    }

    /** Dimension of the points of a set: 0 (finite), 1 (interval), 2 (rect, disk). */
    dim(set) {
        return set.kind === 'finite' ? 0 : set.kind === 'interval' ? 1 : 2;
    }

    /** Re-evaluates what depends on params. */
    refresh() {
        const ev = (s) => this.evaluate(s);
        this.sets.forEach(set => {
            if (set.kind === 'interval') {
                set.I = evalInterval(set.parsed, ev);
                if (!(set.I.lo <= set.I.hi)) this.warn(`set '${set.id}': the interval is empty or its endpoints are not numbers`);
                set.window = this._window(set.I, set.def.window);
            } else if (set.kind === 'rect') {
                set.sides = set.parsedSides.map(p => evalInterval(p, ev));
                set.windows = set.sides.map(I => this._window(I, null));
            } else if (set.kind === 'disk') {
                const c = set.diskDef.center.map(v => this.evaluate(v));
                set.disk = { cx: c[0], cy: c[1], r: this.evaluate(set.diskDef.radius), open: set.diskDef.open };
            } else if (set.kind === 'finite') {
                set.elements.forEach(el => {
                    const v = el.value !== undefined ? this.evaluate(el.value) : Number(el.id);
                    el.num = typeof v === 'number' && isFinite(v) ? v : null;
                });
            }
        });
        this._cache = new Map();
    }

    /** The part of the line drawn for an interval: its endpoints, or a cut where it is unbounded. */
    _window(I, explicit) {
        if (Array.isArray(explicit) && explicit.length === 2) {
            const w = explicit.map(v => this.evaluate(v));
            if (w[0] < w[1]) return w;
            this.warn(`"window" must be [min, max] with min < max`);
        }
        const lo = isFinite(I.lo) ? I.lo : null, hi = isFinite(I.hi) ? I.hi : null;
        if (lo !== null && hi !== null) return [lo, hi];
        if (lo !== null) return [lo, lo + 10];
        if (hi !== null) return [hi - 10, hi];
        return [-5, 5];
    }

    /** Is a point inside a continuous set? */
    containsPoint(set, p, eps = 1e-9) {
        if (set.kind === 'interval') return contains(set.I, p, eps);
        if (set.kind === 'rect') return Array.isArray(p) && contains(set.sides[0], p[0], eps) && contains(set.sides[1], p[1], eps);
        if (set.kind === 'disk') {
            if (!Array.isArray(p)) return false;
            const d = Math.hypot(p[0] - set.disk.cx, p[1] - set.disk.cy);
            return set.disk.open ? d < set.disk.r - eps : d <= set.disk.r + eps;
        }
        return false;
    }

    // =====================================================================
    // MAPS
    // =====================================================================

    _addMap(def, i) {
        if (!def || typeof def !== 'object') {
            this.warn(`maps[${i}]: expected an object`);
            return;
        }
        const id = def.id !== undefined ? String(def.id) : `f${i + 1}`;
        if (this.mapById.has(id)) {
            this.warn(`maps[${i}]: id '${id}' is used twice`);
            return;
        }
        const map = { id, def, index: i, label: def.label !== undefined ? def.label : id, color: def.color };

        if (Array.isArray(def.compose)) {
            const parts = def.compose.map(m => this.mapById.get(String(m)));
            if (parts.length < 2 || parts.some(p => !p)) {
                this.warn(`map '${id}': "compose" needs at least two maps defined before it (unknown: ${def.compose.filter(m => !this.mapById.has(String(m))).join(', ') || 'none'})`);
                return;
            }
            for (let k = 1; k < parts.length; k++) {
                if (parts[k - 1].to !== parts[k].from) {
                    this.warn(`map '${id}': cannot compose, the codomain of '${parts[k - 1].id}' (${parts[k - 1].to.id}) is not the domain of '${parts[k].id}' (${parts[k].from.id})`);
                    return;
                }
            }
            map.kind = 'compose';
            map.parts = parts;
            map.from = parts[0].from;
            map.to = parts[parts.length - 1].to;
            if (def.label === undefined) map.label = parts.slice().reverse().map(p => p.label).join(' \\circ ');
            this.maps.push(map);
            this.mapById.set(id, map);
            return;
        }

        map.from = this.setById.get(String(def.from));
        map.to = this.setById.get(String(def.to));
        if (!map.from || !map.to) {
            this.warn(`map '${id}': unknown set in "from"/"to" ('${def.from}', '${def.to}')`);
            return;
        }
        if (def.pairs !== undefined) {
            map.kind = 'pairs';
            this._readPairs(map, def.pairs);
        } else if (def.expr !== undefined) {
            map.kind = 'expr';
            this._readExpr(map, def.expr);
        } else {
            this.warn(`map '${id}': needs "pairs", "expr" or "compose"`);
            return;
        }
        this.maps.push(map);
        this.mapById.set(id, map);
    }

    _readPairs(map, pairs) {
        const { from, to } = map;
        if (from.kind !== 'finite') {
            this.warn(`map '${map.id}': "pairs" needs a finite domain; use "expr" for '${from.id}'`);
            map.pairs = new Map();
            return;
        }
        const entries = Array.isArray(pairs) ? pairs.filter(p => Array.isArray(p) && p.length === 2) : Object.entries(pairs || {});
        map.pairs = new Map();
        entries.forEach(([a, b]) => {
            const aId = String(a);
            if (!from.elementById.has(aId)) {
                this.warn(`map '${map.id}': '${aId}' is not an element of ${from.id}`);
                return;
            }
            const targets = Array.isArray(b) ? b : [b];
            const list = map.pairs.get(aId) || [];
            targets.forEach(t => {
                if (to.kind === 'finite') {
                    const tId = String(t);
                    if (!to.elementById.has(tId)) {
                        this.warn(`map '${map.id}': ${map.label}(${aId}) = ${tId}, but '${tId}' is not an element of ${to.id}`);
                        return;
                    }
                    list.push(tId);
                } else {
                    list.push({ src: t });
                }
            });
            map.pairs.set(aId, list);
        });
    }

    _readExpr(map, expr) {
        const { from, to } = map;
        const dIn = this.dim(from), dOut = this.dim(to);
        const srcs = Array.isArray(expr) ? expr.map(String) : [String(expr)];
        const outDim = srcs.length;
        if (dOut > 0 && outDim !== dOut) {
            this.warn(`map '${map.id}': ${to.id} is ${dOut === 1 ? 'an interval: "expr" needs one expression' : 'in the plane: "expr" needs two expressions, ["...", "..."]'}`);
        }
        if (dOut === 0 && outDim !== 1) this.warn(`map '${map.id}': a finite codomain needs one expression`);
        const vars = dIn === 2 ? ['x', 'y'] : ['x'];
        try {
            map.fns = srcs.map(s => this.compile(s, vars));
        } catch (e) {
            this.warn(`map '${map.id}': ${e.message}`);
            map.fns = srcs.map(() => () => NaN);
        }
        map.outDim = outDim;
    }

    // =====================================================================
    // EVALUATION
    // =====================================================================

    /** Value of an expression map at a point (number or [x, y]). */
    _evalExpr(map, p) {
        const args = Array.isArray(p) ? p : [p];
        const vals = map.fns.map(fn => {
            try {
                const v = fn(...args);
                return typeof v === 'number' ? v : NaN;
            } catch (e) {
                return NaN;
            }
        });
        return vals.length === 1 ? vals[0] : vals;
    }

    /** Number of an element (its "value", or its id read as a number), or null. */
    elementNumber(set, id) {
        const el = set.elementById && set.elementById.get(id);
        return el ? el.num : null;
    }

    /** Element of a finite set whose number is v, or null. */
    _elementWithNumber(set, v) {
        if (typeof v !== 'number' || !isFinite(v)) return null;
        const el = set.elements.find(e => e.num !== null && Math.abs(e.num - v) <= 1e-9 * Math.max(1, Math.abs(v)));
        return el ? el.id : null;
    }

    /**
     * Images of a point of the domain of `map`:
     *   finite codomain -> element ids (possibly none or several: a relation)
     *   continuous codomain -> points (one for a function)
     * Values that fall outside a finite codomain come back as { outside: v }.
     */
    apply(map, x) {
        if (map.kind === 'compose') {
            let current = [x];
            for (const part of map.parts) {
                const next = [];
                current.forEach(c => {
                    if (c && typeof c === 'object' && !Array.isArray(c) && 'outside' in c) next.push(c);
                    else this.apply(part, c).forEach(v => next.push(v));
                });
                current = next;
            }
            return current;
        }
        if (map.kind === 'pairs') {
            const list = map.pairs.get(String(x)) || [];
            return list.map(t => (typeof t === 'object' && t !== null && 'src' in t ? this._pointOf(map.to, t.src) : t));
        }
        // Expression: the argument is a point, or an element read as a number
        let p = x;
        if (map.from.kind === 'finite') {
            p = this.elementNumber(map.from, String(x));
            if (p === null) return [];
        }
        const v = this._evalExpr(map, p);
        if (map.to.kind === 'finite') {
            const id = this._elementWithNumber(map.to, v);
            return [id !== null ? id : { outside: v }];
        }
        return [v];
    }

    /** A point given in a config ("1/2", [0, "a"]) as numbers. */
    _pointOf(set, src) {
        if (Array.isArray(src)) return src.map(v => this.evaluate(v));
        return this.evaluate(src);
    }

    /** Point -> is it a valid (finite) value? */
    static validPoint(v) {
        if (Array.isArray(v)) return v.every(c => typeof c === 'number' && isFinite(c));
        return typeof v === 'number' && isFinite(v);
    }

    // =====================================================================
    // SAMPLES (continuous domains)
    // =====================================================================

    /**
     * Points of a continuous set used for the arrows: `n` evenly spaced (closed
     * endpoints included, open ones avoided) or the given list.
     */
    arrowSamples(set, spec) {
        if (Array.isArray(spec)) return spec.map(s => this._pointOf(set, s)).filter(p => this.containsPoint(set, p));
        if (set.kind === 'interval') {
            const n = Math.max(1, Math.round(typeof spec === 'number' ? spec : 5));
            const I = set.I;
            const [lo, hi] = [isFinite(I.lo) ? I.lo : set.window[0], isFinite(I.hi) ? I.hi : set.window[1]];
            if (n === 1) return [(lo + hi) / 2];
            const a = I.loClosed ? 0 : 1, b = I.hiClosed ? 0 : 1;
            return Array.from({ length: n }, (_, i) => lo + (hi - lo) * (i + a) / (n - 1 + a + b));
        }
        const n = Math.max(1, Math.round(typeof spec === 'number' ? spec : 9));
        const k = Math.max(1, Math.round(Math.sqrt(n)));
        if (set.kind === 'rect') {
            const coords = set.sides.map((I, j) => {
                const w = set.windows[j];
                return Array.from({ length: k }, (_, i) => w[0] + (w[1] - w[0]) * (i + 0.5) / k);
            });
            const out = [];
            coords[1].slice().reverse().forEach(y => coords[0].forEach(x => out.push([x, y])));
            return out;
        }
        // Disk: centre and rings
        const { cx, cy, r } = set.disk;
        const out = [[cx, cy]];
        const ring = Math.max(0, n - 1);
        for (let i = 0; i < ring; i++) {
            const a = Math.PI / 2 + 2 * Math.PI * i / ring;
            out.push([cx + 0.6 * r * Math.cos(a), cy + 0.6 * r * Math.sin(a)]);
        }
        return out;
    }

    /** Dense samples of a continuous domain, flagged when next to an open part of its boundary. */
    _denseSamples(set, sub = null) {
        if (set.kind === 'interval') {
            return samplePositions(sub || set.I, SAMPLES_1D, set.window).map(s => ({ p: s.t, nearOpen: s.nearOpen }));
        }
        const out = [];
        const n = SAMPLES_2D;
        if (set.kind === 'rect') {
            const xs = samplePositions(set.sides[0], n, set.windows[0]);
            const ys = samplePositions(set.sides[1], n, set.windows[1]);
            xs.forEach(sx => ys.forEach(sy => out.push({ p: [sx.t, sy.t], nearOpen: sx.nearOpen || sy.nearOpen })));
            return out;
        }
        const { cx, cy, r, open } = set.disk;
        for (let i = 0; i <= n; i++) {
            const rr = r * i / n * (open && i === n ? 1 - 1e-6 : 1);
            const m = Math.max(1, Math.round(4 * i));
            for (let j = 0; j < m; j++) {
                const a = 2 * Math.PI * j / m;
                out.push({ p: [cx + rr * Math.cos(a), cy + rr * Math.sin(a)], nearOpen: open && i >= n - 2 });
            }
        }
        return out;
    }

    /** Points along the boundary of a 2D set, in order (for the image of a region). */
    boundary(set, n = 240) {
        if (set.kind === 'rect') {
            const [wx, wy] = set.windows;
            const per = Math.max(2, Math.round(n / 4));
            const pts = [];
            const edge = (a, b) => {
                for (let i = 0; i < per; i++) pts.push([a[0] + (b[0] - a[0]) * i / per, a[1] + (b[1] - a[1]) * i / per]);
            };
            edge([wx[0], wy[0]], [wx[1], wy[0]]);
            edge([wx[1], wy[0]], [wx[1], wy[1]]);
            edge([wx[1], wy[1]], [wx[0], wy[1]]);
            edge([wx[0], wy[1]], [wx[0], wy[0]]);
            return pts;
        }
        if (set.kind === 'disk') {
            const { cx, cy, r } = set.disk;
            return Array.from({ length: n }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n)]);
        }
        return [];
    }

    /** Value of a 1D map at an open endpoint, as a limit (±Infinity when it blows up). */
    _limitAt(map, t, inward) {
        const scale = Math.max(1, Math.abs(t));
        const v1 = this._evalExpr1(map, t + inward * 1e-7 * scale);
        const v2 = this._evalExpr1(map, t + inward * 1e-9 * scale);
        if (!isFinite(v2) || (Math.abs(v2) > 1e6 && Math.abs(v2) > 10 * Math.abs(v1))) return v2 > 0 || v1 > 0 ? Infinity : -Infinity;
        const exact = this._evalExpr1(map, t);
        return isFinite(exact) && Math.abs(exact - v2) < 1e-5 * Math.max(1, Math.abs(exact)) ? exact : v2;
    }

    _evalExpr1(map, p) {
        const v = this.apply(map, p)[0];
        return typeof v === 'number' ? v : NaN;
    }

    // =====================================================================
    // IMAGE, PREIMAGE, COLLISIONS, PROPERTIES
    // =====================================================================

    /**
     * Image of the domain (or of a subset given as a selector argument).
     * Returns one of:
     *   { kind: 'elements', set, ids, outside }      finite codomain
     *   { kind: 'points', set, points }              finite domain, continuous codomain
     *   { kind: 'interval', set, I }                 1D codomain, continuous domain
     *   { kind: 'region', set, polygon }             2D -> 2D (the mapped boundary)
     *   { kind: 'curve', set, points }               1D -> 2D
     * or null.
     */
    image(map, arg = null) {
        const key = `image|${map.id}|${JSON.stringify(arg)}`;
        if (this._cache.has(key)) return this._cache.get(key);
        const res = this._image(map, arg);
        this._cache.set(key, res);
        return res;
    }

    _image(map, arg) {
        const { from, to } = map;
        if (from.kind === 'finite') {
            let ids = from.elements.map(e => e.id);
            if (arg && arg.kind === 'elements') ids = arg.ids.filter(id => from.elementById.has(id));
            else if (arg && arg.kind === 'element') ids = from.elementById.has(arg.id) ? [arg.id] : [];
            const values = [];
            ids.forEach(id => this.apply(map, id).forEach(v => values.push(v)));
            if (to.kind === 'finite') {
                const set = new Set(values.filter(v => typeof v === 'string'));
                return {
                    kind: 'elements', set: to,
                    ids: to.elements.map(e => e.id).filter(id => set.has(id)),
                    outside: values.filter(v => typeof v === 'object' && v && 'outside' in v).map(v => v.outside),
                };
            }
            return { kind: 'points', set: to, points: values.filter(v => SetsModel.validPoint(v)) };
        }

        // Continuous domain
        if (map.def && map.def.image !== undefined && !arg && this.dim(to) === 1) {
            const parsed = parseInterval(String(map.def.image));
            if (parsed) return { kind: 'interval', set: to, I: evalInterval(parsed, (s) => this.evaluate(s)), given: true };
            this.warn(`map '${map.id}': "image" '${map.def.image}' is not an interval`);
        }
        let sub = null;
        if (arg && arg.kind === 'interval' && from.kind === 'interval') {
            const p = parseInterval(arg.src);
            if (p) sub = intersect(from.I, evalInterval(p, (s) => this.evaluate(s)));
        }
        const dIn = this.dim(from), dOut = this.dim(to);
        if (dOut === 1) {
            const samples = this._denseSamples(from, sub);
            const values = samples.map(s => ({ v: this._value1(map, s.p), nearOpen: s.nearOpen }));
            const limits = [];
            const I = sub || from.I;
            if (dIn === 1) {
                if (!I.loClosed && isFinite(I.lo)) limits.push({ v: this._limitAt(map, I.lo, 1) });
                if (!I.hiClosed && isFinite(I.hi)) limits.push({ v: this._limitAt(map, I.hi, -1) });
            }
            const img = imageFromSamples(values, limits);
            return img ? { kind: 'interval', set: to, I: img } : null;
        }
        if (dOut === 2 && dIn === 1) {
            const pts = samplePositions(sub || from.I, 160, from.window).map(s => this.apply(map, s.t)[0]).filter(v => SetsModel.validPoint(v));
            return { kind: 'curve', set: to, points: pts };
        }
        if (dOut === 2 && dIn === 2) {
            const pts = this.boundary(from).map(p => this.apply(map, p)[0]).filter(v => SetsModel.validPoint(v));
            return { kind: 'region', set: to, polygon: pts };
        }
        return null;
    }

    _value1(map, p) {
        const v = this.apply(map, p)[0];
        return typeof v === 'number' ? v : NaN;
    }

    /**
     * Preimage of an element, a subset, a value or an interval of the codomain.
     *   finite domain -> { kind: 'elements', set, ids }
     *   1D domain, value -> { kind: 'points', set, points }
     *   1D domain, interval -> { kind: 'intervals', set, parts: [[a, b], ...] }
     */
    preimage(map, arg) {
        const key = `pre|${map.id}|${JSON.stringify(arg)}`;
        if (this._cache.has(key)) return this._cache.get(key);
        const res = this._preimage(map, arg);
        this._cache.set(key, res);
        return res;
    }

    _preimage(map, arg) {
        const { from, to } = map;
        if (!arg) return null;
        if (from.kind === 'finite') {
            let targets;
            if (to.kind === 'finite') {
                targets = arg.kind === 'elements' ? arg.ids : arg.kind === 'element' ? [arg.id] : [];
                targets.forEach(t => { if (!to.elementById.has(t)) this.warn(`preimage(${map.id}, …): '${t}' is not an element of ${to.id}`); });
                const ids = from.elements.map(e => e.id).filter(id => this.apply(map, id).some(v => targets.includes(v)));
                return { kind: 'elements', set: from, ids };
            }
            const test = this._valueTest(arg);
            if (!test) return null;
            return { kind: 'elements', set: from, ids: from.elements.map(e => e.id).filter(id => this.apply(map, id).some(v => test(v))) };
        }
        if (from.kind !== 'interval' || this.dim(to) !== 1) {
            this.warn(`preimage(${map.id}, …): only for maps from a finite set or between intervals, for now`);
            return null;
        }
        const ts = samplePositions(from.I, SAMPLES_1D * 2, from.window).map(s => s.t);
        const f = (t) => this._value1(map, t);
        if (arg.kind === 'interval') {
            const p = parseInterval(arg.src);
            if (!p) return null;
            const J = evalInterval(p, (s) => this.evaluate(s));
            const inJ = (t) => contains(J, f(t), 1e-12);
            const ok = ts.map(inJ);
            // Boundary between a and b, where inJ changes
            const refine = (a, b) => {
                const sa = inJ(a);
                for (let i = 0; i < 50; i++) {
                    const m = (a + b) / 2;
                    if (inJ(m) === sa) a = m; else b = m;
                }
                return (a + b) / 2;
            };
            const parts = [];
            let start = null;
            for (let i = 0; i < ts.length; i++) {
                if (ok[i] && start === null) start = i === 0 ? ts[0] : refine(ts[i - 1], ts[i]);
                if (!ok[i] && start !== null) { parts.push([start, refine(ts[i - 1], ts[i])]); start = null; }
            }
            if (start !== null) parts.push([start, ts[ts.length - 1]]);
            return { kind: 'intervals', set: from, parts };
        }
        // A single value: roots of f(t) - y
        const y = this.evaluate(arg.id);
        if (typeof y !== 'number' || !isFinite(y)) return null;
        const g = (t) => f(t) - y;
        const pts = [];
        const tol = 1e-9 * Math.max(1, Math.abs(y));
        for (let i = 0; i < ts.length; i++) {
            const gi = g(ts[i]);
            if (Math.abs(gi) <= tol) { pts.push(ts[i]); continue; }
            if (i > 0) {
                const gp = g(ts[i - 1]);
                if (Math.abs(gp) > tol && isFinite(gp) && isFinite(gi) && gp * gi < 0) {
                    let a = ts[i - 1], b = ts[i];
                    for (let k = 0; k < 60; k++) {
                        const m = (a + b) / 2;
                        if (g(a) * g(m) <= 0) b = m; else a = m;
                    }
                    pts.push((a + b) / 2);
                }
            }
        }
        const uniq = pts.filter((t, i) => i === 0 || Math.abs(t - pts[i - 1]) > 1e-6 * Math.max(1, Math.abs(t)));
        return { kind: 'points', set: from, points: uniq.filter(t => contains(from.I, t, 1e-12)) };
    }

    /** Test for a value of a continuous codomain: a number or an interval. */
    _valueTest(arg) {
        if (arg.kind === 'interval') {
            const p = parseInterval(arg.src);
            if (!p) return null;
            const J = evalInterval(p, (s) => this.evaluate(s));
            return (v) => typeof v === 'number' && contains(J, v, 1e-12);
        }
        const y = this.evaluate(arg.id);
        return (v) => typeof v === 'number' && Math.abs(v - y) <= 1e-9 * Math.max(1, Math.abs(y));
    }

    /**
     * Elements of a finite domain with the same image: [{ target, sources }],
     * one entry per shared image (what makes the map not injective).
     */
    collisions(map) {
        if (map.from.kind !== 'finite') return [];
        const by = new Map();
        map.from.elements.forEach(e => {
            this.apply(map, e.id).forEach(v => {
                const key = typeof v === 'string' ? v : SetsModel.validPoint(v) ? JSON.stringify(roundPoint(v)) : null;
                if (key === null) return;
                if (!by.has(key)) by.set(key, { target: v, sources: [] });
                const entry = by.get(key);
                if (!entry.sources.includes(e.id)) entry.sources.push(e.id);
            });
        });
        return [...by.values()].filter(c => c.sources.length > 1);
    }

    /**
     * What is known about a map:
     *   isFunction  every element has exactly one image (finite domains)
     *   into        every image lies in the codomain
     *   injective, surjective, bijective: true, false or null (unknown)
     *   problems    reasons, as short Italian sentences, for the badge's tooltip
     * `claims` in the map's config override the computed values.
     */
    properties(map) {
        const key = `props|${map.id}`;
        if (this._cache.has(key)) return this._cache.get(key);
        const res = this._properties(map);
        const claims = map.def && map.def.claims;
        if (claims && typeof claims === 'object') {
            ['injective', 'surjective'].forEach(k => { if (typeof claims[k] === 'boolean') res[k] = claims[k]; });
            res.claimed = true;
        }
        res.bijective = res.injective === true && res.surjective === true ? true
            : res.injective === false || res.surjective === false ? false : null;
        this._cache.set(key, res);
        return res;
    }

    _properties(map) {
        const { from, to } = map;
        const problems = [];
        const res = { isFunction: true, into: true, injective: null, surjective: null, exact: from.kind === 'finite', problems };

        if (from.kind === 'finite') {
            const images = new Map();
            from.elements.forEach(e => {
                const vs = this.apply(map, e.id);
                const outside = vs.filter(v => v && typeof v === 'object' && !Array.isArray(v) && 'outside' in v);
                if (outside.length) {
                    res.into = false;
                    problems.push(`${map.label}(${e.label}) non appartiene a ${to.label || to.id}`);
                }
                if (to.kind !== 'finite') {
                    vs.filter(v => SetsModel.validPoint(v) && !this.containsPoint(to, v)).forEach(() => {
                        res.into = false;
                        problems.push(`${map.label}(${e.label}) non appartiene a ${to.label || to.id}`);
                    });
                }
                // A value outside the codomain is still a value: f is a function, not "into"
                const valid = vs.filter(v => typeof v === 'string' || SetsModel.validPoint(v) || (v && typeof v === 'object' && 'outside' in v));
                if (valid.length !== 1) {
                    res.isFunction = false;
                    problems.push(valid.length === 0 ? `${e.label} non ha immagine` : `${e.label} ha ${valid.length} immagini`);
                }
                images.set(e.id, valid);
            });
            res.injective = this.collisions(map).length === 0;
            if (to.kind === 'finite') {
                const hit = new Set([].concat(...images.values()));
                res.surjective = to.elements.every(b => hit.has(b.id));
            } else {
                // Finitely many points never cover an interval or a region with interior
                res.surjective = false;
            }
            return res;
        }

        const img = this.image(map);
        const dIn = this.dim(from), dOut = this.dim(to);
        if (dOut === 1 && img && img.kind === 'interval') {
            res.into = isSubset(img.I, to.I, 1e-7);
            if (!res.into) problems.push(`l'immagine non è contenuta in ${to.label || to.id}`);
            res.surjective = res.into && sameInterval(img.I, to.I, 1e-7);
            if (dIn === 1) {
                const vs = this._denseSamples(from).map(s => this._value1(map, s.p));
                res.injective = strictlyMonotone(vs);
            }
        } else if (dOut === 2 && img) {
            const pts = img.kind === 'region' ? img.polygon : img.points;
            res.into = pts.every(p => this.containsPoint(to, p, 1e-7));
            if (!res.into) problems.push(`l'immagine non è contenuta in ${to.label || to.id}`);
        }
        return res;
    }
}

/** Intersection of two intervals. */
export function intersect(A, B) {
    let lo, loClosed, hi, hiClosed;
    if (A.lo > B.lo) { lo = A.lo; loClosed = A.loClosed; } else if (B.lo > A.lo) { lo = B.lo; loClosed = B.loClosed; } else { lo = A.lo; loClosed = A.loClosed && B.loClosed; }
    if (A.hi < B.hi) { hi = A.hi; hiClosed = A.hiClosed; } else if (B.hi < A.hi) { hi = B.hi; hiClosed = B.hiClosed; } else { hi = A.hi; hiClosed = A.hiClosed && B.hiClosed; }
    return interval(lo, hi, loClosed, hiClosed);
}

function roundPoint(v) {
    const r = (x) => Math.round(x * 1e9) / 1e9;
    return Array.isArray(v) ? v.map(r) : r(v);
}

/** Resolves a selector argument (string from a config) for a map. */
export function argumentOf(raw) {
    return raw === undefined || raw === null ? null : parseArgument(raw);
}
