/**
 * The mathematics of a sets diagram, without any drawing: sets (finite,
 * intervals, rectangles, disks), maps between them (pairs, expressions,
 * piecewise expressions, compositions, inverses), and what can be computed
 * from them: images, preimages, collisions, injectivity, surjectivity,
 * whether a map is defined everywhere and lands in its codomain.
 *
 * Points of continuous sets are numbers (intervals) or [x, y] (rectangles and
 * disks). Elements of finite sets are referred to by id.
 *
 * The model is built once from the config; `refresh()` re-evaluates the parts
 * that depend on params (interval endpoints) after a slider moves.
 */
import {
    parseInterval, evalInterval, interval, contains, isSubset, sameInterval, isEmpty, isPoint,
    samplePositions, searchPositions, imageFromSamples, strictlyMonotone, unionIntervals, overlaps,
} from './interval.js';
import { isSimplePolyline, insidePolygon } from './geometry.js';
import { parseArgument, parseSelector } from './selectors.js';
import { replaceNotAfter } from '../../matephis-plot-src/parser/not-after.js';
import { substituteVariable } from '../../matephis-plot-src/parser/expression-parser.js';

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
    constructor(cfg, { evaluate, compile, warn = () => {}, isExpression = null }) {
        this.evaluate = evaluate;
        this.isExpression = isExpression;
        this.compile = compile;
        this.warn = warn;
        /** Names of the params: they decide how a name such as "ax" splits (substitute) */
        this.paramNames = cfg && cfg.params && typeof cfg.params === 'object' ? Object.keys(cfg.params) : [];
        this.sets = [];
        this.setById = new Map();
        this.maps = [];
        this.mapById = new Map();
        // A dynagraph with "scale": "shared" draws every line with the same window
        const dg = cfg.dynagraph;
        this.sharedWindow = !!dg && !(typeof dg === 'object' && dg.scale === 'own');
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
        if (def.integers !== undefined) {
            // Integers (ℕ, ℤ, 2ℕ, a range): a finite set of the integers in the
            // window, drawn as a number line; values beyond the window still belong to it
            const rule = parseIntegers(def.integers);
            if (!rule) {
                this.warn(`set '${id}': "integers" must be "N", "N*", "Z", "2N", "2N+1", "3Z" or a range like "[-3, 5]" (got '${def.integers}')`);
                return;
            }
            set.intRule = rule;
            set.intLine = true;
            set.elements = [];
            set.elementById = new Map();
            if (set.label === undefined) set.label = rule.tex;
            this.sets.push(set);
            this.setById.set(id, set);
            return;
        }
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
            } else if (set.intRule) {
                this._fillIntegers(set);
            } else if (set.kind === 'finite') {
                set.elements.forEach(el => {
                    const v = el.value !== undefined ? this.evaluate(el.value) : Number(el.id);
                    el.num = typeof v === 'number' && isFinite(v) ? v : null;
                });
            }
        });
        if (this.sharedWindow) {
            // Number lines of integers share the scale too (their dots stay in their own window)
            const lines = this.sets.filter(st => st.kind === 'interval' || st.intLine);
            if (lines.length > 1) {
                const w = [Math.min(...lines.map(st => st.window[0])), Math.max(...lines.map(st => st.window[1]))];
                lines.forEach(st => { st.window = w.slice(); });
            }
        }
        this.maps.forEach(map => {
            if (map.iterate) this._setIterateCount(map);
            if (map.kind !== 'piecewise') return;
            map.pieces.forEach(pc => { pc.I = pc.on ? evalInterval(pc.on, ev) : null; });
            const withI = map.pieces.filter(pc => pc.I);
            withI.forEach((a, i) => withI.slice(i + 1).forEach(b => {
                if (overlaps(a.I, b.I)) this.warn(`map '${map.id}': pieces ${a.index + 1} and ${b.index + 1} overlap; where they do, the first one is used`);
            }));
        });
        this._cache = new Map();
    }

    /** The integers of a set in its window become its elements. */
    _fillIntegers(set) {
        const r = set.intRule;
        let w = Array.isArray(set.def.window) && set.def.window.length === 2 ? set.def.window.map(v => this.evaluate(v)) : null;
        if (!w || !(w[0] < w[1])) {
            if (w) this.warn(`"window" must be [min, max] with min < max`);
            const lo = isFinite(r.lo) ? r.lo : isFinite(r.hi) ? r.hi - 10 * r.step : -5 * r.step;
            const hi = isFinite(r.hi) ? r.hi : lo + 10 * r.step;
            w = isFinite(r.lo) || isFinite(r.hi) ? [lo, hi] : [-5 * r.step, 5 * r.step];
        }
        set.window = w.slice();
        set.ownWindow = w.slice();
        set.elements = [];
        set.elementById = new Map();
        const start = Math.ceil(w[0] - 1e-9) || 0, end = Math.floor(w[1] + 1e-9);
        for (let n = start; n <= end && set.elements.length < 400; n++) {
            if (!intMember(r, n)) continue;
            const el = { id: String(n), label: String(n), num: n };
            set.elements.push(el);
            set.elementById.set(el.id, el);
        }
    }

    /**
     * Where a map of an interval has a value: a union of intervals (for an
     * expression, its natural domain inside the set; for a composition,
     * dom(g ∘ f) = {x : f(x) ∈ dom g}). Found by sampling and bisection; an
     * end that reaches the edge of the window of an unbounded set is ±∞.
     */
    domainOf(map) {
        const set = map.from;
        if (set.kind !== 'interval') return [];
        const key = `dom|${map.id}`;
        if (this._cache.has(key)) return this._cache.get(key);
        const ok = (t) => {
            const ys = this.apply(map, t);
            const y = ys[0];
            return ys.length > 0 && (typeof y === 'string' || SetsModel.validPoint(y) || (!!y && typeof y === 'object' && 'outside' in y));
        };
        const I = set.I, w = set.window;
        const inside = (t) => !!(contains(I, t, 0) && ok(t));
        // Past the window at an infinite end, when the map is defined at all the
        // far samples there or at none of them (sqrt(x - 7) on ℝ: [7, +∞));
        // otherwise only in the window, and the result says so
        const all = searchPositions(I, SAMPLES_1D, w);
        const core = all.filter(p => !p.far);
        const side = (sgn) => all.filter(p => p.far && (sgn < 0 ? p.t < core[0].t : p.t > core[core.length - 1].t));
        const uniform = (ps) => ps.every(p => inside(p.t)) || ps.every(p => !inside(p.t));
        const left = side(-1), right = side(1);
        const useL = uniform(left), useR = uniform(right);
        const ts = [...(useL ? left : []), ...core, ...(useR ? right : [])].map(p => p.t);
        const n = ts.length - 1;
        const lo = isFinite(I.lo) ? I.lo : ts[0], hi = isFinite(I.hi) ? I.hi : ts[n];
        const edge = (a, b, inA) => {
            for (let it = 0; it < 60; it++) {
                const m = (a + b) / 2;
                if (inside(m) === inA) a = m; else b = m;
            }
            return inA ? a : b;
        };
        const parts = [];
        let start = null;
        for (let i = 0; i <= n; i++) {
            const t = ts[i];
            const inT = inside(t);
            if (inT && start === null) start = i === 0 ? lo : edge(ts[i - 1], t, false);
            if (!inT && start !== null) {
                parts.push([start, edge(ts[i - 1], t, true)]);
                start = null;
            }
        }
        if (start !== null) parts.push([start, hi]);
        const snap = (v) => (Math.abs(v - Math.round(v)) < 1e-7 ? Math.round(v) : v);
        const out = parts.map(([a, b]) => {
            a = snap(a);
            b = snap(b);
            const loInf = a <= lo && !isFinite(I.lo), hiInf = b >= hi && !isFinite(I.hi);
            return {
                lo: loInf ? -Infinity : a, hi: hiInf ? Infinity : b,
                loClosed: !loInf && contains(I, a, 0) && ok(a), hiClosed: !hiInf && contains(I, b, 0) && ok(b),
            };
        });
        if (!useL || !useR) out.inWindow = true;
        this._cache.set(key, out);
        return out;
    }

    /**
     * Fixed points of a map: where f(x) = x. On numbers (intervals, or sets
     * of numbers) the solutions of f(x) - x = 0, by sign changes and
     * bisection (a touching zero is found where |f(x) - x| is tiny); on a
     * finite set of a map into itself, the elements with f(a) = a.
     * @returns {{ points: number[], ids: string[], all: boolean }}
     *   all: f(x) = x on the whole set (the identity)
     */
    fixedPoints(map) {
        const key = `fix|${map.id}`;
        if (this._cache.has(key)) return this._cache.get(key);
        const out = { points: [], ids: [], all: false };
        const { from } = map;
        if (from.kind === 'finite') {
            from.elements.forEach(e => {
                const ys = this.apply(map, e.id);
                const same = ys.some(y => (typeof y === 'string' ? y === e.id && (map.to === from || this.elementNumber(map.to, y) === e.num)
                    : typeof y === 'number' && e.num !== null && Math.abs(y - e.num) < 1e-9));
                if (same) out.ids.push(e.id);
            });
        } else if (from.kind === 'interval' && this.dim(map.to) === 1) {
            const g = (t) => this._raw1(map, t) - t;
            const I = from.I, w = from.window;
            const lo = isFinite(I.lo) ? I.lo : w[0], hi = isFinite(I.hi) ? I.hi : w[1];
            // Past the window where f(x) - x settles (x^2 - 42 on ℝ: -6 and 7);
            // where it oscillates, only in the window, and the result says so
            const far = this._searchEnds(map, I, g, 'fix');
            if (far.inWindow) out.inWindow = true;
            const ts = searchPositions(I, SAMPLES_1D, w, far).map(p => p.t);
            const n = ts.length - 1;
            const gs = ts.map(g);
            const scale = Math.max(1, Math.abs(lo), Math.abs(hi));
            const tiny = 1e-9 * scale;
            if (gs.every(v => isFinite(v) && Math.abs(v) < tiny)) out.all = true;
            else {
                const add = (t) => {
                    if (!contains(I, t, 1e-12)) return;
                    const r = Math.abs(t - Math.round(t)) < 1e-9 ? Math.round(t) : t;
                    if (!out.points.some(p => Math.abs(p - r) < 1e-7 * scale)) out.points.push(r);
                };
                for (let i = 0; i <= n; i++) {
                    if (!isFinite(gs[i])) continue;
                    if (Math.abs(gs[i]) < tiny) {
                        add(ts[i]);
                        continue;
                    }
                    if (i > 0 && isFinite(gs[i - 1]) && Math.abs(gs[i - 1]) >= tiny && gs[i - 1] * gs[i] < 0) {
                        // A sign change; a jump of a piecewise map changes sign too: keep it only if g is small there
                        let a = ts[i - 1], b = ts[i], ga = gs[i - 1];
                        for (let it = 0; it < 80; it++) {
                            const m = (a + b) / 2, gm = g(m);
                            if (!isFinite(gm)) break;
                            if (ga * gm <= 0) b = m; else { a = m; ga = gm; }
                        }
                        const t = (a + b) / 2;
                        if (Math.abs(g(t)) < 1e-6 * scale) add(t);
                    } else if (i > 0 && i < n && isFinite(gs[i - 1]) && isFinite(gs[i + 1])
                        && Math.abs(gs[i]) < Math.abs(gs[i - 1]) && Math.abs(gs[i]) <= Math.abs(gs[i + 1]) && gs[i - 1] * gs[i + 1] > 0) {
                        // A touching zero (no sign change): refine the minimum of |g|
                        let a = ts[i - 1], b = ts[i + 1];
                        const r = (Math.sqrt(5) - 1) / 2;
                        for (let it = 0; it < 80; it++) {
                            const c = b - r * (b - a), d = a + r * (b - a);
                            if (Math.abs(g(c)) < Math.abs(g(d))) b = d; else a = c;
                        }
                        const t = (a + b) / 2;
                        if (Math.abs(g(t)) < 1e-9 * scale) add(t);
                    }
                }
                out.points.sort((a, b) => a - b);
            }
        }
        this._cache.set(key, out);
        return out;
    }

    /** Is the set infinite (integers without one of the bounds)? Its checks are made in the window. */
    isInfinite(set) {
        return !!(set && set.intRule && !(isFinite(set.intRule.lo) && isFinite(set.intRule.hi)));
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
        if (set.intRule) return typeof p === 'number' && intMember(set.intRule, p);
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
        // "name" is the function's name in formulas and readouts (f(3) = 6); "label"
        // is the caption of its arrow. The name defaults to the label, as before
        Object.defineProperty(map, 'name', {
            get() { return def.name !== undefined ? String(def.name) : String(this.label); },
            enumerable: true,
        });

        if (def.inverse !== undefined) {
            if (this._readInverse(map, def)) {
                this.maps.push(map);
                this.mapById.set(id, map);
            }
            return;
        }

        if (def.iterate !== undefined) {
            if (this._readIterate(map, def)) {
                this.maps.push(map);
                this.mapById.set(id, map);
            }
            return;
        }

        if (Array.isArray(def.compose)) {
            const parts = def.compose.map(m => this.mapById.get(String(m)));
            if (parts.length < 2 || parts.some(p => !p)) {
                this.warn(`map '${id}': "compose" needs at least two maps defined before it (unknown: ${def.compose.filter(m => !this.mapById.has(String(m))).join(', ') || 'none'})`);
                return;
            }
            for (let k = 1; k < parts.length; k++) {
                // Between lines the sets may differ: the composition is then
                // defined where each value lands in the next domain (dom(g ∘ f) = f^{-1}(dom g))
                const a = parts[k - 1].to, b = parts[k].from;
                const lines = (s) => s.kind === 'interval';
                if (a !== b && !(lines(a) && lines(b))) {
                    this.warn(`map '${id}': cannot compose, the codomain of '${parts[k - 1].id}' (${a.id}) is not the domain of '${parts[k].id}' (${b.id})`);
                    return;
                }
            }
            map.kind = 'compose';
            map.parts = parts;
            map.from = parts[0].from;
            map.to = parts[parts.length - 1].to;
            if (def.label === undefined) map.label = parts.slice().reverse().map(p => p.name).join(' \\circ ');
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
        if (def.where !== undefined) {
            // A relation given by a condition on (x, y): the pairs that satisfy it
            map.kind = 'where';
            try {
                map.cond = this.compile(String(def.where), ['x', 'y']);
            } catch (e) {
                this.warn(`map '${id}': "where" ${e.message}`);
                return;
            }
            if (!['finite', 'integers'].includes(map.to.kind)) {
                this.warn(`map '${id}': "where" needs a codomain whose elements can be listed (a finite set, or integers)`);
                return;
            }
        } else if (def.pairs !== undefined) {
            map.kind = 'pairs';
            this._readPairs(map, def.pairs);
        } else if (def.piecewise !== undefined) {
            map.kind = 'piecewise';
            if (def.expr !== undefined) this.warn(`map '${id}': has both "piecewise" and "expr"; "expr" is ignored`);
            this._readPiecewise(map, def.piecewise);
        } else if (def.expr !== undefined) {
            map.kind = 'expr';
            this._readExpr(map, def.expr);
        } else {
            this.warn(`map '${id}': needs "pairs", "expr", "piecewise", "where", "compose" or "inverse"`);
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
                        this.warn(`map '${map.id}': ${map.name}(${aId}) = ${tId}, but '${tId}' is not an element of ${to.id}`);
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
        map.fns = this._compileExprs(map, expr);
        map.outDim = map.fns.length;
    }

    /** One expression (or two, into the plane) in x (and y, from the plane) -> functions. */
    _compileExprs(map, expr, where = '') {
        const { from, to } = map;
        const dIn = this.dim(from), dOut = this.dim(to);
        const srcs = Array.isArray(expr) ? expr.map(String) : [String(expr)];
        const outDim = srcs.length;
        if (dOut > 0 && outDim !== dOut) {
            this.warn(`map '${map.id}'${where}: ${to.id} is ${dOut === 1 ? 'an interval: "expr" needs one expression' : 'in the plane: "expr" needs two expressions, ["...", "..."]'}`);
        }
        if (dOut === 0 && outDim !== 1) this.warn(`map '${map.id}'${where}: a finite codomain needs one expression`);
        const vars = dIn === 2 ? ['x', 'y'] : ['x'];
        try {
            return srcs.map(s => this.compile(s, vars));
        } catch (e) {
            this.warn(`map '${map.id}'${where}: ${e.message}`);
            return srcs.map(() => () => NaN);
        }
    }

    /**
     * "piecewise": [{ "on": "(-inf, 0)", "expr": "-x" }, { "on": "[0, +inf)", "expr": "x^2" }]
     * A piece applies on an interval ("on", a number for a single point) or
     * where a condition holds ("if": "x^2 + y^2 < 1"); a piece with neither
     * applies everywhere else. The first piece that applies is used; where
     * none does, the map is not defined.
     */
    _readPiecewise(map, pieces) {
        map.pieces = [];
        if (!Array.isArray(pieces) || !pieces.length) {
            this.warn(`map '${map.id}': "piecewise" needs a list of pieces, like [{ "on": "(-inf, 0)", "expr": "-x" }, { "on": "[0, +inf)", "expr": "x^2" }]`);
            return;
        }
        const dIn = this.dim(map.from);
        const vars = dIn === 2 ? ['x', 'y'] : ['x'];
        pieces.forEach((pc, k) => {
            const where = `, piece ${k + 1}`;
            if (!pc || typeof pc !== 'object') {
                this.warn(`map '${map.id}'${where}: expected an object like { "on": "[0, 1]", "expr": "x" }`);
                return;
            }
            for (const key in pc) {
                if (!['on', 'if', 'expr'].includes(key)) this.warn(`map '${map.id}'${where}: unknown option '${key}' (use "on", "if", "expr")`);
            }
            if (pc.expr === undefined) {
                this.warn(`map '${map.id}'${where}: needs "expr"`);
                return;
            }
            const piece = { index: k, fns: this._compileExprs(map, pc.expr, where), src: pc };
            if (pc.on !== undefined) {
                if (dIn === 2) {
                    this.warn(`map '${map.id}'${where}: "on" takes an interval of numbers; in the plane use "if"`);
                } else {
                    const parsed = typeof pc.on === 'string' ? parseInterval(pc.on) : null;
                    piece.on = parsed || { lo: String(pc.on), hi: String(pc.on), loClosed: true, hiClosed: true };
                }
            }
            if (pc.if !== undefined) {
                try {
                    piece.cond = this.compile(String(pc.if), vars);
                } catch (e) {
                    this.warn(`map '${map.id}'${where}: ${e.message}`);
                    piece.cond = () => false;
                }
            }
            map.pieces.push(piece);
        });
        map.outDim = map.pieces.length ? map.pieces[0].fns.length : 1;
    }

    /**
     * "inverse": "f" — the inverse of f, from its codomain to its domain: each
     * value goes to the points where f takes it (none, one or several, so the
     * inverse of a map that is not bijective is a relation, and the engine
     * says so). For maps between finite sets and intervals.
     */
    /**
     * f^n, from "iterate": ["f", 3] (or a param, ["f", "n"]): a composition of
     * n copies of f, which must map a set into itself. f^0 is the identity.
     * The number is read again on every refresh, so a slider can change it.
     */
    _readIterate(map, def) {
        const it = def.iterate;
        const [baseId, nSrc] = Array.isArray(it) ? it : [it, 2];
        const base = this.mapById.get(String(baseId));
        if (!base) {
            this.warn(`map '${map.id}': "iterate" needs a map defined before it, like ["f", 3] (unknown: '${baseId}')`);
            return false;
        }
        if (base.from !== base.to) {
            this.warn(`map '${map.id}': cannot iterate '${base.id}', it does not map a set into itself (${base.from.id} → ${base.to.id})`);
            return false;
        }
        map.kind = 'compose';
        map.iterate = { base, src: nSrc === undefined ? 2 : nSrc };
        map.from = base.from;
        map.to = base.to;
        this._setIterateCount(map);
        return true;
    }

    /** Number of copies of f in f^n (0 to 50), from its source; the label follows it. */
    _setIterateCount(map) {
        const { base, src } = map.iterate;
        let n = Math.round(this.evaluate(src));
        if (!isFinite(n) || n < 0) {
            if (!map.iterate.warned) this.warn(`map '${map.id}': the number of times in "iterate" must be 0, 1, 2, … (got '${src}')`);
            map.iterate.warned = true;
            n = 0;
        }
        n = Math.min(n, 50);
        if (map.iterate.n === n && map.parts) return;
        map.iterate.n = n;
        map.parts = Array.from({ length: n }, () => base);
        if (map.def.label === undefined) {
            const b = String(base.name);
            const wrapped = /^[A-Za-z]$|^\\?[A-Za-z]+(_\{?\w+\}?)?$/.test(b) ? b : `\\left(${b}\\right)`;
            map.label = n === 0 ? `\\mathrm{id}_{${this._setLabel(map.from)}}` : `${wrapped}^{${n}}`;
        }
    }

    _setLabel(set) {
        return set.label !== undefined ? String(set.label) : set.id;
    }

    /**
     * The orbit of a point under a map of a set into itself: x0, f(x0),
     * f(f(x0)), … up to `steps` steps. Stops where f has no value (or a value
     * outside the set), and when a value comes back: then `cycle` says where
     * the cycle starts and its period (1: a fixed point).
     * @returns {{ values: any[], cycle: {start: number, period: number}|null, stop: string|null }}
     */
    orbit(map, x0, steps) {
        const values = [x0];
        let cycle = null, stop = null;
        const same = (a, b) => (typeof a === 'number' && typeof b === 'number'
            ? Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) : sameValue(a, b));
        for (let k = 0; k < steps; k++) {
            const next = this.apply(map, values[k]);
            const v = next[0];
            const valid = typeof v === 'string' || SetsModel.validPoint(v);
            if (next.length !== 1 || !valid || (map.to.kind !== 'finite' && !this.containsPoint(map.to, v, 1e-9))) {
                stop = next.length > 1 ? 'many' : (v && typeof v === 'object' && 'outside' in v) || (valid && map.to.kind !== 'finite') ? 'outside' : 'undefined';
                if (stop === 'outside') values.push(v && typeof v === 'object' && 'outside' in v ? v.outside : v);
                break;
            }
            values.push(v);
            let j = -1;
            for (let i = values.length - 2; i >= 0 && j < 0; i--) if (same(values[i], v)) j = i;
            // Numbers converging to a fixed point come close to an earlier value
            // before the last one: a cycle of numbers needs points well apart
            const apart = (a, b) => Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(a));
            const real = j < 0 || typeof v !== 'number' || values.slice(j, -1).every((u, i, arr) => i === 0 || apart(u, arr[i - 1]));
            if (j >= 0 && real) {
                cycle = { start: j, period: values.length - 1 - j };
                break;
            }
        }
        return { values, cycle, stop };
    }

    _readInverse(map, def) {
        const base = this.mapById.get(String(def.inverse));
        if (!base) {
            this.warn(`map '${map.id}': "inverse" needs a map defined before it (unknown: '${def.inverse}')`);
            return false;
        }
        if (this.dim(base.from) === 2 || this.dim(base.to) === 2) {
            this.warn(`map '${map.id}': the inverse of a map from or into the plane is not supported yet`);
            return false;
        }
        map.kind = 'inverse';
        map.base = base;
        map.from = base.to;
        map.to = base.from;
        if ((def.from !== undefined && String(def.from) !== map.from.id) || (def.to !== undefined && String(def.to) !== map.to.id)) {
            this.warn(`map '${map.id}': the inverse of '${base.id}' goes from ${map.from.id} to ${map.to.id}; "from"/"to" are ignored`);
        }
        if (def.label === undefined) {
            const l = String(base.name);
            map.label = /^[A-Za-z](_\{?[A-Za-z0-9]+\}?)?$/.test(l) ? `${l}^{-1}` : `\left(${l}\right)^{-1}`;
        }
        return true;
    }

    // =====================================================================
    // EVALUATION
    // =====================================================================

    /**
     * Value of an expression map at a point (number or [x, y]); for a
     * piecewise map, of the piece that applies there, or null where none does.
     */
    _evalExpr(map, p, piece = null) {
        let fns = map.fns;
        if (map.kind === 'piecewise') {
            const k = piece !== null ? piece : this._pieceAt(map, p);
            if (k < 0) return null;
            fns = map.pieces[k].fns;
        }
        const args = Array.isArray(p) ? p : [p];
        const vals = fns.map(fn => {
            try {
                const v = fn(...args);
                return typeof v === 'number' ? v : NaN;
            } catch (e) {
                return NaN;
            }
        });
        return vals.length === 1 ? vals[0] : vals;
    }

    /** Index of the piece of a piecewise map that applies at p, or -1. */
    _pieceAt(map, p) {
        const args = Array.isArray(p) ? p : [p];
        for (let k = 0; k < map.pieces.length; k++) {
            const pc = map.pieces[k];
            if (pc.I && !(typeof p === 'number' && contains(pc.I, p, 1e-12 * Math.max(1, Math.abs(p))))) continue;
            if (pc.cond) {
                let ok;
                try {
                    ok = pc.cond(...args);
                } catch (e) {
                    ok = false;
                }
                if (!ok || (typeof ok === 'number' && isNaN(ok))) continue;
            }
            return k;
        }
        return -1;
    }

    /** Number of an element (its "value", or its id read as a number), or null. */
    elementNumber(set, id) {
        const el = set.elementById && set.elementById.get(id);
        if (el) return el.num;
        // An integer beyond the window still belongs to its set
        if (set.intRule) {
            const n = Number(id);
            return intMember(set.intRule, n) ? n : null;
        }
        return null;
    }

    /** Element of a finite set whose number is v, or null. */
    _elementWithNumber(set, v) {
        if (typeof v !== 'number' || !isFinite(v)) return null;
        if (set.intRule) return intMember(set.intRule, v) ? String(Math.round(v) || 0) : null;
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
        if (map.kind === 'inverse') return this._applyInverse(map, x);
        if (map.kind === 'compose') {
            let current = [x];
            map.parts.forEach((part, k) => {
                const next = [];
                // A value that is not in the next map's domain (when the sets differ) stops the chain
                const check = k > 0 && map.parts[k - 1].to !== part.from;
                current.forEach(c => {
                    if (c && typeof c === 'object' && !Array.isArray(c) && 'outside' in c) next.push(c);
                    else if (check && !this.containsPoint(part.from, c, 1e-12)) return;
                    else this.apply(part, c).forEach(v => next.push(v));
                });
                current = next;
            });
            return current;
        }
        if (map.kind === 'where') {
            const xv = map.from.kind === 'finite' ? this.elementNumber(map.from, String(x)) : x;
            if (xv === null) return [];
            const ys = map.to.kind === 'finite' ? map.to.elements.filter(e => e.num !== null).map(e => [e.id, e.num]) : (map.to.points || []).map(n => [n, n]);
            return ys.filter(([, yv]) => {
                const r = map.cond(xv, yv);
                return r === true || (typeof r === 'number' && r !== 0 && !isNaN(r));
            }).map(([id]) => id);
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
        if (v === null) return [];
        if (map.to.kind === 'finite') {
            const id = this._elementWithNumber(map.to, v);
            return [id !== null ? id : { outside: v }];
        }
        return [v];
    }

    /** Points where the base map of an inverse takes the value y. */
    _applyInverse(map, y) {
        const base = map.base;
        if (base.from.kind === 'finite') {
            return base.from.elements.map(e => e.id).filter(a => this.apply(base, a).some(v => sameValue(v, y)));
        }
        let yv = y;
        if (base.to.kind === 'finite') {
            yv = this.elementNumber(base.to, String(y));
            if (yv === null) return [];
        }
        if (typeof yv !== 'number' || !isFinite(yv)) return [];
        // A value taken on a whole interval (a constant piece): its middle stands for it
        return this._preimage1D(base, interval(yv, yv)).map(P => (isPoint(P) ? P.lo
            : isFinite(P.lo) && isFinite(P.hi) ? (P.lo + P.hi) / 2 : isFinite(P.lo) ? P.lo + 1 : isFinite(P.hi) ? P.hi - 1 : 0));
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
        const v1 = this._raw1(map, t + inward * 1e-7 * scale);
        const v2 = this._raw1(map, t + inward * 1e-9 * scale);
        if (!isFinite(v2) || (Math.abs(v2) > 1e6 && Math.abs(v2) > 10 * Math.abs(v1))) return v2 > 0 || v1 > 0 ? Infinity : -Infinity;
        // A slow blow-up (log(4 - x^2) at 2): as the distance shrinks tenfold the
        // value keeps moving the same way by steps that do not shrink
        const vs = [3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => this._raw1(map, t + inward * Math.pow(10, -k) * scale));
        if (vs.every(isFinite)) {
            const d = vs.slice(1).map((v, i) => v - vs[i]).slice(-5);
            const same = d.every(x => x > 0) || d.every(x => x < 0);
            if (same && d.slice(1).every((x, i) => Math.abs(x) >= 0.75 * Math.abs(d[i]))) return d[0] > 0 ? Infinity : -Infinity;
        }
        // The formula used just inside, evaluated at t (for a piecewise map, the
        // piece at t itself may be another one)
        let exact;
        if (map.kind === 'piecewise') {
            const k = this._pieceAt(map, t + inward * 1e-9 * scale);
            const v = k < 0 ? NaN : this._evalExpr(map, t, k);
            exact = typeof v === 'number' ? v : NaN;
        } else {
            exact = this._raw1(map, t);
        }
        // The value at t is the limit when it continues the trend of the last
        // samples (√(1 - x) at 1 moves by 3·10⁻⁵ over the last 10⁻⁹)
        if (isFinite(exact) && Math.abs(exact - v2) <= Math.max(1e-5 * Math.max(1, Math.abs(exact)), 2 * Math.abs(v1 - v2))) return exact;
        // Otherwise (a jump at t: x < 1 ? x : x + 1 at 1) the samples extended
        // to t, exact for a straight line, and snapped to a round value
        let L = v2 - (v1 - v2) * 1e-9 / (1e-7 - 1e-9);
        if (!isFinite(L) || !isFinite(v1)) L = v2;
        const r = Math.round(L * 1e6) / 1e6;
        return Math.abs(L - r) < 1e-9 * Math.max(1, Math.abs(L)) ? r : L;
    }

    /**
     * How a function behaves as t → sign·∞:
     *   { kind: 'limit', v }            a finite limit
     *   { kind: 'infinite', v }         v = ±Infinity
     *   { kind: 'none', above, below }  no limit (it oscillates); above / below:
     *                                   it also grows without bound on that side
     *   { kind: 'undefined' }           no value far out (sqrt(x) at -∞)
     * Sampled at t = ±φ·10^k. For k = 1…15 the values must end up monotone,
     * or there is no limit (φ keeps the samples off a period, as of x mod 2).
     * Then k = 2, 4, …, 256 tell a limit (steps that shrink: Aitken's estimate)
     * from ±∞ (steps that do not shrink: ln x, √x).
     */
    _atInfinity(fn, sign) {
        const PHI = 1.6180339887498949;
        const seq = (ks) => {
            const vs = [];
            for (const k of ks) {
                const v = fn(sign * PHI * Math.pow(10, k));
                if (v === Infinity || v === -Infinity) return { inf: v, vs };
                if (typeof v !== 'number' || isNaN(v)) break;
                vs.push(v);
            }
            return { inf: null, vs };
        };
        const steps = (vs) => vs.slice(1).map((v, i) => v - vs[i]);
        const A = seq(Array.from({ length: 15 }, (_, i) => i + 1));
        if (A.inf !== null) return { kind: 'infinite', v: A.inf };
        const a = A.vs;
        if (!a.length) return { kind: 'undefined' };
        if (a.length < 8) return { kind: 'none', above: false, below: false };
        const last = a[a.length - 1];
        const settled = (x) => Math.abs(x) <= 1e-12 * Math.max(1, Math.abs(last));
        const d = steps(a);
        if (d.slice(-3).every(settled)) return { kind: 'limit', v: snapLimit(last) };
        const tail = d.slice(-6).filter(x => !settled(x));
        const up = tail.every(x => x > 0), down = tail.every(x => x < 0);
        if (!up && !down) {
            const big = 1e6 * Math.max(1, ...a.slice(0, 3).map(Math.abs));
            return { kind: 'none', above: a.some(v => v > big), below: a.some(v => v < -big) };
        }
        const B = seq([2, 4, 8, 16, 32, 64, 128, 256]);
        if (B.inf !== null) return { kind: 'infinite', v: B.inf };
        const b = B.vs;
        if (b.length < 4) return { kind: 'none', above: false, below: false };
        const e = steps(b), m = e.length;
        const bl = b[b.length - 1];
        if (Math.abs(e[m - 1]) <= 1e-12 * Math.max(1, Math.abs(bl))) return { kind: 'limit', v: snapLimit(bl) };
        const r1 = Math.abs(e[m - 1] / e[m - 2]), r2 = Math.abs(e[m - 2] / e[m - 3]);
        if (r1 < 0.75 && r2 < 0.75) {
            let L = bl - e[m - 1] * e[m - 1] / (e[m - 1] - e[m - 2]);
            if (!isFinite(L)) L = bl;
            // The estimate is rough for slow sequences (1/ln x): an integer within
            // a thousandth of the range the values covered is the limit
            if (Math.abs(L - Math.round(L)) <= 1e-3 * Math.abs(b[0] - bl)) L = Math.round(L);
            return { kind: 'limit', v: snapLimit(L) };
        }
        return { kind: 'infinite', v: up ? Infinity : -Infinity };
    }

    /** _atInfinity at the infinite ends of an interval (null at a finite end), cached per map and function. */
    _ends(map, I, fn = (t) => this._raw1(map, t), kind = 'value') {
        const end = (sign) => {
            const key = `inf|${map.id}|${kind}|${sign}`;
            if (!this._cache.has(key)) this._cache.set(key, this._atInfinity(fn, sign));
            return this._cache.get(key);
        };
        return { lo: isFinite(I.lo) ? null : end(-1), hi: isFinite(I.hi) ? null : end(1) };
    }

    /**
     * At which infinite ends of I a search goes past the window: where fn has
     * a limit, tends to ±∞ or has no value far out, so that it crosses a value
     * finitely often there. Where it oscillates the search stays in the window
     * (`inWindow`).
     */
    _searchEnds(map, I, fn, kind) {
        const ends = this._ends(map, I, fn, kind);
        const go = (b) => !!b && b.kind !== 'none';
        return { lo: go(ends.lo), hi: go(ends.hi), inWindow: (!!ends.lo && !go(ends.lo)) || (!!ends.hi && !go(ends.hi)) };
    }

    /**
     * Value of a map at a point as a number (NaN where it is not defined).
     * Into a finite set this is the value of the expression, before it is
     * matched with an element.
     */
    _raw1(map, p) {
        if (map.kind === 'expr' || map.kind === 'piecewise') {
            const v = this._evalExpr(map, p);
            return typeof v === 'number' ? v : NaN;
        }
        const v = this.apply(map, p)[0];
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
            const n = this.elementNumber(map.to, v);
            return n === null ? NaN : n;
        }
        if (v && typeof v === 'object' && !Array.isArray(v) && 'outside' in v) return v.outside;
        return NaN;
    }

    /**
     * Parts of an interval of the domain where a map is given by one formula:
     * the whole interval, or for a piecewise map its pieces (where no piece
     * applies, there is no part). Each part is an interval with `piece`.
     */
    _segments(map, I) {
        const parts = this._pieceSegments(map, I);
        if (map.from.kind !== 'interval' || this.dim(map.to) !== 1) return parts;
        const key = `segj|${map.id}|${I.lo}|${I.hi}|${I.loClosed}|${I.hiClosed}`;
        if (this._cache.has(key)) return this._cache.get(key);
        const out = [].concat(...parts.map(S => this._splitAtJumps(map, S)));
        this._cache.set(key, out);
        return out;
    }

    /**
     * A part of the domain cut where the formula jumps (floor(x) at 1) or has a
     * pole (tan(x) at π/2), so that each part is continuous, as images and
     * properties assume. At a jump the point goes with the side its value
     * belongs to; a pole belongs to no part (the map has no value there).
     */
    _splitAtJumps(map, S) {
        const cuts = this._jumps(map, S);
        if (!cuts.length) return [S];
        const out = [];
        const add = (P) => { if (!isEmpty(P)) out.push(S.piece === undefined ? P : { ...P, piece: S.piece }); };
        const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
        let lo = S.lo, loClosed = S.loClosed;
        cuts.forEach(c => {
            const v = this._raw1(map, c);
            // One-sided limits; at an end of S only the side inside S
            const left = c > S.lo ? this._limitAt(map, c, -1) : NaN;
            const right = c < S.hi ? this._limitAt(map, c, 1) : NaN;
            const pole = (c > S.lo && !isFinite(left)) || (c < S.hi && !isFinite(right));
            const inS = contains(S, c) && isFinite(v) && !pole;
            // The value at c continues the right side, the left side, or stands alone (sign(0) = 0)
            const withRight = inS && c < S.hi && near(v, right);
            const withLeft = inS && !withRight && c > S.lo && near(v, left);
            if (c > S.lo) add(interval(lo, c, loClosed, withLeft));
            if (inS && !withLeft && !withRight) add(interval(c, c));
            lo = c;
            loClosed = withRight;
        });
        if (lo < S.hi) add(interval(lo, S.hi, loClosed, S.hiClosed));
        return out;
    }

    /**
     * Where a map jumps inside S: a sample step much larger than its
     * neighbours, followed by bisection into the half that changes more. A
     * continuous function (even a steep one, atan(1000x)) shrinks to nothing;
     * a jump or a pole keeps its size. Only in the window of an unbounded S.
     */
    _jumps(map, S) {
        if (isPoint(S)) return [];
        const f = (t) => this._raw1(map, t);
        const ts = searchPositions(S, SAMPLES_1D, map.from.window, { lo: false, hi: false }).map(p => p.t);
        const vs = ts.map(f);
        const step = (i) => (i >= 0 && i + 1 < vs.length ? vs[i + 1] - vs[i] : NaN);
        const size = (x) => (isFinite(x) ? Math.abs(x) : 0);
        const out = [];
        for (let i = 0; i + 1 < ts.length; i++) {
            const d = step(i);
            if (!isFinite(d)) continue;
            // Much larger than the smaller neighbouring step (two big steps side
            // by side, as sign(x) sampled at 0, still count); bisection decides
            if (!(Math.abs(d) > 2 * Math.min(size(step(i - 1)), size(step(i + 1))))) continue;
            if (Math.abs(d) <= 1e-9 * Math.max(1, Math.abs(vs[i]), Math.abs(vs[i + 1]))) continue;
            let a = ts[i], b = ts[i + 1], fa = vs[i], fb = vs[i + 1];
            for (let k = 0; k < 64 && b - a > 1e-15 * Math.max(1, Math.abs(a)); k++) {
                const m = (a + b) / 2, fm = f(m);
                if (!isFinite(fm)) break;
                if (Math.abs(fm - fa) > Math.abs(fb - fm)) { b = m; fb = fm; } else { a = m; fa = fm; }
            }
            if (!(Math.abs(fb - fa) > 1e-7 * Math.max(1, Math.abs(fa), Math.abs(fb)))) continue;
            let c = (a + b) / 2;
            const r = Math.round(c * 1e6) / 1e6;
            if (Math.abs(c - r) < 1e-9 * Math.max(1, Math.abs(c))) c = r;
            if (c === 0) c = 0; // not -0
            // A jump at a closed end leaves the end value on its own (floor(x) on [0, 3] at 3)
            [S.lo, S.hi].forEach(e => { if (isFinite(e) && Math.abs(c - e) < 1e-9 * Math.max(1, Math.abs(e))) c = e; });
            const atEnd = (c === S.lo && S.loClosed) || (c === S.hi && S.hiClosed);
            if ((atEnd || (c > S.lo && c < S.hi)) && !out.some(x => Math.abs(x - c) < 1e-9 * Math.max(1, Math.abs(c)))) out.push(c);
        }
        return out.sort((x, y) => x - y);
    }

    /** Parts of I where a piecewise map is given by one piece (the whole I otherwise). */
    _pieceSegments(map, I) {
        if (map.kind !== 'piecewise' || map.from.kind !== 'interval') return isEmpty(I) ? [] : [I];
        const key = `seg|${map.id}|${I.lo}|${I.hi}|${I.loClosed}|${I.hiClosed}`;
        if (this._cache.has(key)) return this._cache.get(key);
        const at = (t) => this._pieceAt(map, t);
        const inside = (t) => t > I.lo && t < I.hi;
        const cuts = [];
        map.pieces.forEach(pc => {
            if (pc.I) [pc.I.lo, pc.I.hi].forEach(b => { if (isFinite(b) && inside(b)) cuts.push(b); });
        });
        // Where an "if" condition changes, found by sampling and bisection
        if (map.pieces.some(pc => pc.cond)) {
            const ts = samplePositions(I, SAMPLES_1D, map.from.window).map(s => s.t);
            let prev = at(ts[0]);
            for (let i = 1; i < ts.length; i++) {
                const k = at(ts[i]);
                if (k === prev) continue;
                let a = ts[i - 1], b = ts[i];
                for (let it = 0; it < 60; it++) {
                    const m = (a + b) / 2;
                    if (at(m) === prev) a = m; else b = m;
                }
                if (inside(b)) cuts.push(b);
                prev = k;
            }
        }
        cuts.sort((a, b) => a - b);
        const bounds = [I.lo];
        cuts.forEach(b => { if (Math.abs(b - bounds[bounds.length - 1]) > 1e-12 * Math.max(1, Math.abs(b))) bounds.push(b); });
        bounds.push(I.hi);
        const segs = [];
        for (let j = 0; j + 1 < bounds.length; j++) {
            const a = bounds[j], b = bounds[j + 1];
            const mid = isFinite(a) && isFinite(b) ? (a + b) / 2 : isFinite(a) ? a + 1 : isFinite(b) ? b - 1 : 0;
            const k = at(mid);
            if (k < 0) continue;
            const loIn = isFinite(a) && (j > 0 || I.loClosed) && at(a) === k;
            const hiIn = isFinite(b) && (j + 2 < bounds.length || I.hiClosed) && at(b) === k;
            segs.push({ ...interval(a, b, loIn, hiIn), piece: k });
        }
        // Points that belong to another piece than the parts on both sides
        const ends = [...bounds.slice(1, -1)];
        if (I.loClosed && isFinite(I.lo)) ends.push(I.lo);
        if (I.hiClosed && isFinite(I.hi)) ends.push(I.hi);
        ends.forEach(b => {
            const k = at(b);
            if (k >= 0 && !segs.some(S => contains(S, b))) segs.push({ ...interval(b, b), piece: k });
        });
        segs.sort((a, b) => a.lo - b.lo || (isPoint(a) ? -1 : 1));
        // Join neighbours given by the same piece
        const out = [];
        segs.forEach(S => {
            const last = out[out.length - 1];
            if (last && last.piece === S.piece && last.hi === S.lo && (last.hiClosed || S.loClosed)) {
                last.hi = S.hi;
                last.hiClosed = S.hiClosed;
            } else {
                out.push({ ...S });
            }
        });
        this._cache.set(key, out);
        return out;
    }

    /**
     * The map as one expression in x, for the plot engine: an expression as
     * written, pieces as nested "cond ? expr : …" (NaN where no piece
     * applies), a composition by substitution. Null when it cannot be one
     * (an inverse, pairs, the plane).
     */
    /** An expression with x replaced by another one (substituteX with this diagram's params). */
    substitute(src, by) {
        return substituteX(src, by, this.paramNames);
    }

    exprString(map) {
        if (!map || this.dim(map.from) === 2) return null;
        if (map.kind === 'expr') return typeof map.def.expr === 'string' || typeof map.def.expr === 'number' ? `(${map.def.expr})` : null;
        if (map.kind === 'piecewise') {
            if (map.pieces.some(pc => Array.isArray(pc.src.expr))) return null;
            let out = '(0/0)';
            for (let k = map.pieces.length - 1; k >= 0; k--) {
                const pc = map.pieces[k];
                const conds = [];
                if (pc.on) {
                    const { lo, hi, loClosed, hiClosed } = pc.on;
                    const inf = (e) => /inf|∞/i.test(String(e));
                    if (lo === hi) conds.push(`x == (${lo})`);
                    else {
                        if (!inf(lo)) conds.push(`x ${loClosed ? '>=' : '>'} (${lo})`);
                        if (!inf(hi)) conds.push(`x ${hiClosed ? '<=' : '<'} (${hi})`);
                    }
                }
                if (pc.src.if !== undefined) conds.push(`(${pc.src.if})`);
                out = conds.length ? `(${conds.join(' && ')}) ? (${pc.src.expr}) : ${out}` : `(${pc.src.expr})`;
            }
            return `(${out})`;
        }
        if (map.kind === 'compose') {
            let e = 'x';
            for (const part of map.parts) {
                const pe = this.exprString(part);
                if (pe === null) return null;
                e = this.substitute(pe, e);
            }
            return e;
        }
        return null;
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
        const res = this._spread(arg, (a) => this._image(map, a), map.to);
        this._cache.set(key, res);
        return res;
    }

    _image(map, arg) {
        const { from, to } = map;
        if (map.kind === 'inverse') {
            // The image of an inverse is a preimage under its base map
            const whole = from.kind === 'finite' ? { kind: 'elements', ids: from.elements.map(e => e.id) } : { kind: 'interval', I: from.I };
            const res = this.preimage(map.base, arg || whole);
            if (res && res.kind === 'intervals' && res.parts.length === 1 && !isPoint(res.parts[0])) return { kind: 'interval', set: res.set, I: res.parts[0] };
            return res;
        }
        if (from.kind === 'finite') {
            let ids = from.elements.map(e => e.id);
            if (arg && arg.kind === 'elements') ids = arg.ids.filter(id => from.elementById.has(id));
            else if (arg && arg.kind === 'element') ids = from.elementById.has(String(arg.id)) ? [String(arg.id)] : [];
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
        const dIn = this.dim(from), dOut = this.dim(to);
        let D = from.kind === 'interval' ? from.I : null;
        if (arg && arg.kind === 'interval' && from.kind === 'interval') {
            const J = this._argInterval(arg);
            if (J) D = intersect(from.I, J);
        }
        // The image of a single point (a value from another selector)
        if (arg && arg.kind === 'element' && arg.value !== undefined) {
            const vs = this.containsPoint(from, arg.value) ? this.apply(map, arg.value) : [];
            if (to.kind === 'finite') return { kind: 'elements', set: to, ids: to.elements.map(e => e.id).filter(id => vs.includes(id)), outside: [] };
            return { kind: 'points', set: to, points: vs.filter(v => SetsModel.validPoint(v)) };
        }
        if (dIn === 1) {
            if (dOut === 1) {
                const parts = this._image1(map, D);
                if (!parts.length) return null;
                return parts.length === 1 ? { kind: 'interval', set: to, I: parts[0] } : { kind: 'intervals', set: to, parts };
            }
            if (dOut === 0) {
                const ids = to.elements.filter(el => el.num !== null && this._preimage1D(map, interval(el.num, el.num), D).length).map(el => el.id);
                return { kind: 'elements', set: to, ids, outside: [] };
            }
            // Into the plane: a curve, one line per piece
            const lines = this._segments(map, D).map(S => samplePositions(S, 160, from.window)
                .map(s => this.apply(map, s.t)[0]).filter(v => SetsModel.validPoint(v)));
            return { kind: 'curve', set: to, points: [].concat(...lines), lines };
        }
        // From the plane
        if (dOut === 1) {
            const values = this._denseSamples(from).map(s => ({ v: this._raw1(map, s.p), nearOpen: s.nearOpen }));
            const img = imageFromSamples(values, []);
            return img ? { kind: 'interval', set: to, I: img } : null;
        }
        if (dOut === 2) {
            if (map.kind === 'piecewise') {
                this.warn(`map '${map.id}': the image of a piecewise map in the plane is not computed yet`);
                return null;
            }
            const pts = this.boundary(from).map(p => this.apply(map, p)[0]).filter(v => SetsModel.validPoint(v));
            return { kind: 'region', set: to, polygon: pts };
        }
        return null;
    }

    /**
     * Runs an image or preimage on an argument that may be another selector
     * ("image(g, image(f))"): its result becomes the argument; a union of
     * intervals or a list of values is done piece by piece and joined.
     */
    _spread(arg, run, set) {
        const a = this._resolveArg(arg);
        if (a === undefined) return null;
        if (a && a.kind === 'intervals') return mergeResults(a.parts.map(I => run(isPoint(I) ? { kind: 'element', value: I.lo } : { kind: 'interval', I })), set);
        if (a && a.kind === 'values') return mergeResults(a.values.map(v => run({ kind: 'element', value: v })), set);
        return run(a);
    }

    /** A selector used as an argument -> the argument it stands for (undefined when it fails). */
    _resolveArg(arg) {
        if (!arg || arg.kind !== 'selector') return arg;
        const sel = parseSelector(arg.src);
        const inner = sel && this.mapById.get(sel.map);
        if (!inner || !['image', 'preimage'].includes(sel.op)) {
            this.warn(`'${arg.src}': only image(…) and preimage(…) of a map can be used as an argument`);
            return undefined;
        }
        const res = sel.op === 'image' ? this.image(inner, sel.arg) : this.preimage(inner, sel.arg);
        if (!res) return undefined;
        if (res.kind === 'elements') return { kind: 'elements', ids: res.ids };
        if (res.kind === 'interval') return { kind: 'interval', I: res.I };
        if (res.kind === 'intervals') return { kind: 'intervals', parts: res.parts };
        if (res.kind === 'points') return { kind: 'values', values: res.points };
        this.warn(`'${arg.src}': a region of the plane cannot be used as an argument yet`);
        return undefined;
    }

    /** Image of a part D of an interval domain, into an interval: a union of intervals (one per piece). */
    _image1(map, D) {
        const parts = [].concat(...this._segments(map, D).map(S => this._definedParts(map, S)));
        return unionIntervals(parts.map(S => this._imageOfSegment(map, S)).filter(Boolean));
    }

    /**
     * The parts of a segment where the map has a value: an open end inside the
     * segment then gets its limit (log(4 - x^2) on ℝ tends to -∞ at ±2).
     */
    _definedParts(map, S) {
        if (map.from.kind !== 'interval' || isPoint(S)) return [S];
        return this.domainOf(map).map(P => intersect(P, S)).filter(P => !isEmpty(P));
    }

    /** Image of a part of the domain where the map is given by one (continuous) formula. */
    _imageOfSegment(map, S) {
        if (isPoint(S)) {
            const v = this._raw1(map, S.lo);
            return isFinite(v) ? interval(v, v) : null;
        }
        // Past the window too, at an infinite end: a maximum beyond the window is found
        const samples = searchPositions(S, SAMPLES_1D, map.from.window);
        const values = samples.map(s => ({ v: this._raw1(map, s.t), nearOpen: s.nearOpen }));
        // A minimum or maximum inside the segment usually falls between two
        // samples: find it, so that x^2 on [-1, 2] reaches 0 exactly
        values.push(...this._refineExtrema(map, samples, values));
        const limits = [];
        if (!S.loClosed && isFinite(S.lo)) limits.push({ v: this._limitAt(map, S.lo, 1) });
        if (!S.hiClosed && isFinite(S.hi)) limits.push({ v: this._limitAt(map, S.hi, -1) });
        // At an infinite end, its limit (e^x: 0 at -∞, +∞ at +∞): approached, not reached
        const ends = this._ends(map, S);
        [ends.lo, ends.hi].forEach(b => {
            if (!b) return;
            if (b.kind === 'limit' || b.kind === 'infinite') limits.push({ v: b.v });
            if (b.kind === 'none' && b.above) limits.push({ v: Infinity });
            if (b.kind === 'none' && b.below) limits.push({ v: -Infinity });
        });
        return imageFromSamples(values, limits);
    }

    /**
     * The smallest and largest sampled values, when they are at an inner
     * sample, refined by golden-section search between its neighbours.
     */
    _refineExtrema(map, samples, values) {
        const out = [];
        const n = values.length;
        [1, -1].forEach(sign => {
            let best = -1;
            for (let i = 0; i < n; i++) {
                const v = values[i].v;
                if (typeof v === 'number' && isFinite(v) && (best < 0 || sign * v < sign * values[best].v)) best = i;
            }
            if (best <= 0 || best >= n - 1 || (values[best].nearOpen && !samples[best].far)) return;
            const g = (t) => sign * this._raw1(map, t);
            let a = samples[best - 1].t, b = samples[best + 1].t;
            const r = (Math.sqrt(5) - 1) / 2;
            let c = b - r * (b - a), d = a + r * (b - a), gc = g(c), gd = g(d);
            for (let k = 0; k < 80 && b - a > 1e-15 * Math.max(1, Math.abs(a)); k++) {
                if (gc < gd) { b = d; d = c; gd = gc; c = b - r * (b - a); gc = g(c); }
                else { a = c; c = d; gc = gd; d = a + r * (b - a); gd = g(d); }
            }
            const t = (a + b) / 2, v = this._raw1(map, t);
            // (equal counts too: the extreme may sit on a far sample, which only approaches)
            if (isFinite(v) && sign * v <= sign * values[best].v) out.push({ v, nearOpen: false });
        });
        return out;
    }

    /** Interval of a selector argument ("[0, 1/2]"), or one already computed. */
    _argInterval(arg) {
        if (arg.I) return arg.I;
        const p = parseInterval(arg.src);
        return p ? evalInterval(p, (s) => this.evaluate(s)) : null;
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
        const res = this._spread(arg, (a) => this._preimage(map, a), map.from);
        this._cache.set(key, res);
        return res;
    }

    _preimage(map, arg) {
        const { from, to } = map;
        if (!arg) return null;
        // The preimage under an inverse is an image under its base map
        if (map.kind === 'inverse') return this.image(map.base, arg);
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
        const dOut = this.dim(to);
        // Values asked for, as intervals (a single value is [y, y])
        const values = () => {
            if (arg.kind === 'interval') {
                const J = this._argInterval(arg);
                return J ? [J] : [];
            }
            const ids = arg.kind === 'elements' ? arg.ids : [arg.value !== undefined ? arg.value : arg.id];
            const out = [];
            ids.forEach(t => {
                let y;
                if (typeof t === 'number' || Array.isArray(t)) {
                    y = t;
                } else if (dOut === 0) {
                    // An element of the codomain wins; otherwise an expression (a param)
                    if (to.elementById.has(t)) y = this.elementNumber(to, t);
                    else if (this._isExpression(t)) y = this.evaluate(t);
                    else {
                        this.warn(`preimage(${map.id}, …): '${t}' is not an element of ${to.id}`);
                        return;
                    }
                } else {
                    y = this.evaluate(t);
                }
                if (typeof y === 'number' && isFinite(y)) out.push(interval(y, y));
                else this.warn(`preimage(${map.id}, …): '${t}' is not a number`);
            });
            return out;
        };
        if (from.kind === 'interval' && dOut < 2) {
            const lists = values().map(J => this._preimage1D(map, J));
            const parts = unionIntervals([].concat(...lists));
            const res = parts.every(isPoint) ? { kind: 'points', set: from, points: parts.map(P => P.lo) } : { kind: 'intervals', set: from, parts };
            if (lists.some(l => l.inWindow)) res.inWindow = true;
            return res;
        }
        if (this.dim(from) === 2 && dOut === 1) {
            const Js = values();
            if (Js.length !== 1) {
                if (Js.length > 1) this.warn(`preimage(${map.id}, …): in the plane, one value or one interval at a time`);
                return null;
            }
            return this._preimage2D(map, Js[0]);
        }
        this.warn(`preimage(${map.id}, …): not available for maps ${dOut === 2 ? 'into the plane' : 'from the plane into a finite set'}, for now`);
        return null;
    }

    /**
     * Points of a part D of an interval domain where the map takes values in
     * J: a union of intervals (single points are [t, t]). Each piece of the
     * map is assumed continuous.
     */
    _preimage1D(map, J, D = map.from.I) {
        const out = [];
        const f = (t) => this._raw1(map, t);
        const scale = Math.max(1, isFinite(J.lo) ? Math.abs(J.lo) : 0, isFinite(J.hi) ? Math.abs(J.hi) : 0);
        const tol = 1e-12 * scale;
        const inJ = (t) => contains(J, f(t), tol);
        const single = isPoint(J);
        // Where "in J" changes between a and b: the point, and whether it belongs
        const edge = (a, b) => {
            const sa = inJ(a);
            for (let it = 0; it < 60; it++) {
                const m = (a + b) / 2;
                if (inJ(m) === sa) a = m; else b = m;
            }
            const t = (a + b) / 2, v = f(t);
            const closed = single || (Math.abs(v - J.lo) <= Math.abs(v - J.hi) ? J.loClosed : J.hiClosed);
            return { t, closed };
        };
        // Where f = y between a and b, if f - y changes sign there (not across a jump)
        const root = (a, b, y) => {
            let ga = f(a) - y;
            for (let it = 0; it < 60; it++) {
                const m = (a + b) / 2, gm = f(m) - y;
                if (Math.sign(gm) === Math.sign(ga)) {
                    a = m;
                    ga = gm;
                } else {
                    b = m;
                }
            }
            const t = (a + b) / 2;
            return Math.abs(f(t) - y) <= 1e-6 * Math.max(1, Math.abs(y)) ? t : null;
        };
        let inWindow = false;
        this._segments(map, D).forEach(S => {
            if (isPoint(S)) {
                if (inJ(S.lo)) out.push(interval(S.lo, S.lo));
                return;
            }
            // Past the window at an infinite end where f settles (x^2 = 49 on ℝ: ±7);
            // where it oscillates only in the window, and the result says so
            const far = this._searchEnds(map, S, f, 'value');
            if (far.inWindow) inWindow = true;
            const ts = searchPositions(S, SAMPLES_1D * 2, map.from.window, far).map(s => s.t);
            const vs = ts.map(f);
            const ok = vs.map(v => contains(J, v, tol));
            // A part that reaches the last sample reaches the end of S, unless the search stopped at the window
            const first = !isFinite(S.lo) && !far.lo ? { t: ts[0], closed: true } : { t: S.lo, closed: S.loClosed };
            const lastEnd = !isFinite(S.hi) && !far.hi ? { t: ts[ts.length - 1], closed: true } : { t: S.hi, closed: S.hiClosed };
            let start = null;
            for (let i = 0; i < ts.length; i++) {
                if (ok[i] && start === null) start = i === 0 ? first : edge(ts[i], ts[i - 1]);
                if (!ok[i] && start !== null) {
                    const e = edge(ts[i - 1], ts[i]);
                    out.push(interval(start.t, e.t, start.closed, e.closed));
                    start = null;
                }
                // J crossed between two samples that are both outside it
                if (i > 0 && !ok[i] && !ok[i - 1] && isFinite(vs[i]) && isFinite(vs[i - 1])) {
                    const lo = Math.min(vs[i - 1], vs[i]), hi = Math.max(vs[i - 1], vs[i]);
                    if (lo < J.lo && hi > J.hi) {
                        const r1 = root(ts[i - 1], ts[i], J.lo), r2 = single ? r1 : root(ts[i - 1], ts[i], J.hi);
                        if (r1 !== null && r2 !== null) {
                            out.push(r1 <= r2 ? interval(r1, r2, J.loClosed, J.hiClosed) : interval(r2, r1, J.hiClosed, J.loClosed));
                        }
                    }
                }
            }
            if (start !== null) out.push(interval(start.t, lastEnd.t, start.closed, lastEnd.closed));
        });
        // Tiny parts are single points (a value taken at one point, seen through the tolerance)
        const tiny = (P) => isFinite(P.lo) && P.hi - P.lo <= (single ? 1e-6 : 1e-12) * Math.max(1, Math.abs(P.lo));
        const res = unionIntervals(out.map(P => (tiny(P) ? interval((P.lo + P.hi) / 2, (P.lo + P.hi) / 2) : P)));
        if (inWindow) res.inWindow = true;
        return res;
    }

    /**
     * Preimage of J under a map from the plane to the line: the cells of a
     * grid where the value is in J (`cells`, as horizontal runs
     * [x0, y0, x1, y1]); for a single value, also the level curve (`segments`,
     * by marching squares).
     */
    _preimage2D(map, J) {
        const set = map.from;
        const K = 80;
        const [wx, wy] = set.kind === 'rect' ? set.windows
            : [[set.disk.cx - set.disk.r, set.disk.cx + set.disk.r], [set.disk.cy - set.disk.r, set.disk.cy + set.disk.r]];
        const xs = Array.from({ length: K + 1 }, (_, i) => wx[0] + (wx[1] - wx[0]) * i / K);
        const ys = Array.from({ length: K + 1 }, (_, j) => wy[0] + (wy[1] - wy[0]) * j / K);
        const f = (x, y) => this._raw1(map, [x, y]);
        const tol = 1e-9 * Math.max(1, isFinite(J.lo) ? Math.abs(J.lo) : 0, isFinite(J.hi) ? Math.abs(J.hi) : 0);
        const inSet = (x, y) => this.containsPoint(set, [x, y], 1e-9);
        const cells = [];
        for (let j = 0; j < K; j++) {
            let run = null;
            for (let i = 0; i < K; i++) {
                const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
                if (inSet(cx, cy) && contains(J, f(cx, cy), tol)) {
                    if (run) run[2] = xs[i + 1];
                    else run = [xs[i], ys[j], xs[i + 1], ys[j + 1]];
                } else if (run) {
                    cells.push(run);
                    run = null;
                }
            }
            if (run) cells.push(run);
        }
        if (!isPoint(J)) return { kind: 'cells', set, cells };
        const y0 = J.lo;
        const g = ys.map(y => xs.map(x => f(x, y) - y0));
        const lerp = (p, q, gp, gq) => {
            const t = gp / (gp - gq);
            return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
        };
        const segments = [];
        for (let j = 0; j < K; j++) {
            for (let i = 0; i < K; i++) {
                const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
                if (!inSet(cx, cy)) continue;
                // Corners counterclockwise from bottom-left; edge k joins corner k and k + 1
                const c = [[xs[i], ys[j]], [xs[i + 1], ys[j]], [xs[i + 1], ys[j + 1]], [xs[i], ys[j + 1]]];
                const v = [g[j][i], g[j][i + 1], g[j + 1][i + 1], g[j + 1][i]];
                if (!v.every(isFinite)) continue;
                const pos = v.map(x => x >= 0);
                const cross = [];
                for (let k = 0; k < 4; k++) {
                    const k2 = (k + 1) % 4;
                    if (pos[k] !== pos[k2]) cross.push(lerp(c[k], c[k2], v[k], v[k2]));
                }
                if (cross.length === 2) {
                    segments.push([cross[0], cross[1]]);
                } else if (cross.length === 4) {
                    // Saddle: the centre decides which corners are cut off
                    if ((f(cx, cy) - y0 >= 0) === pos[0]) segments.push([cross[0], cross[1]], [cross[2], cross[3]]);
                    else segments.push([cross[3], cross[0]], [cross[1], cross[2]]);
                }
            }
        }
        return { kind: 'level', set, segments, cells };
    }

    /** Test for a value of a continuous codomain: a number or an interval. */
    /** Can a string be read as a number (a param, "2*k")? Asked without warnings. */
    _isExpression(src) {
        if (!this.isExpression) return false;
        return this.isExpression(String(src));
    }

    _valueTest(arg) {
        if (arg.kind === 'interval') {
            const J = this._argInterval(arg);
            if (!J) return null;
            return (v) => typeof v === 'number' && contains(J, v, 1e-12);
        }
        const y = arg.value !== undefined ? arg.value : this.evaluate(arg.id);
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
        // A relation that is not a function is neither injective nor
        // surjective (those words are about functions), nor a bijection
        if (res.isFunction === false && !res.claimed) res.injective = res.surjective = null;
        res.bijective = res.isFunction === false ? false
            : res.injective === true && res.surjective === true ? true
                : res.injective === false || res.surjective === false ? false : null;
        this._cache.set(key, res);
        return res;
    }

    _properties(map) {
        const { from, to } = map;
        const problems = [];
        const res = { isFunction: true, into: true, injective: null, surjective: null, exact: from.kind === 'finite', problems };
        if (map.kind === 'inverse' && !(from.kind === 'finite' && map.base.from.kind === 'finite')) return this._inverseProperties(map, res);

        if (from.kind === 'finite') {
            const images = new Map();
            from.elements.forEach(e => {
                const vs = this.apply(map, e.id);
                const outside = vs.filter(v => v && typeof v === 'object' && !Array.isArray(v) && 'outside' in v);
                if (outside.length) {
                    res.into = false;
                    problems.push(`${map.name}(${e.label}) non appartiene a ${to.label || to.id}`);
                }
                if (to.kind !== 'finite') {
                    vs.filter(v => SetsModel.validPoint(v) && !this.containsPoint(to, v)).forEach(() => {
                        res.into = false;
                        problems.push(`${map.name}(${e.label}) non appartiene a ${to.label || to.id}`);
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
            // ℕ, ℤ: the checks are made in the window (a collision found there is real)
            if (this.isInfinite(from) || this.isInfinite(to)) {
                res.exact = false;
                res.window = true;
            }
            if (this.isInfinite(to)) {
                // Onto an infinite set a window cannot tell (unless "claims" says)
                res.surjective = null;
            } else if (to.kind === 'finite') {
                const hit = new Set([].concat(...images.values()));
                res.surjective = to.elements.every(b => hit.has(b.id));
            } else {
                // Finitely many points never cover an interval or a region with interior
                res.surjective = false;
            }
            return res;
        }

        const dIn = this.dim(from), dOut = this.dim(to);
        const fromL = from.label || from.id, toL = to.label || to.id;
        if (dIn === 1) {
            // Defined at every point of the domain: no gaps between pieces, no NaN
            const segs = this._segments(map, from.I);
            const cover = unionIntervals(segs);
            let undefinedSomewhere = !(cover.length === 1 && sameInterval(cover[0], from.I, 1e-9));
            if (!undefinedSomewhere) {
                undefinedSomewhere = segs.some(S => samplePositions(S, SAMPLES_1D, from.window).some(s => !s.nearOpen
                    && !SetsModel.validPoint(dOut === 2 ? this.apply(map, s.t)[0] : this._raw1(map, s.t))));
            }
            // Past the window too (sqrt(x + 7) on ℝ is not defined everywhere)
            if (!undefinedSomewhere && dOut < 2) {
                const dom = this.domainOf(map);
                undefinedSomewhere = !(dom.length === 1 && sameInterval(dom[0], from.I, 1e-9));
            }
            if (undefinedSomewhere) {
                res.isFunction = false;
                problems.push(`${map.name} non è definita in tutto ${fromL}`);
            }
        }
        if (dOut === 1) {
            const img = this.image(map);
            const parts = !img ? [] : img.kind === 'interval' ? [img.I] : img.kind === 'intervals' ? img.parts : [];
            if (parts.length) {
                res.into = parts.every(P => isSubset(P, to.I, 1e-7));
                if (!res.into) problems.push(`l'immagine non è contenuta in ${toL}`);
                const merged = unionIntervals(parts);
                res.surjective = res.into && merged.length === 1 && sameInterval(merged[0], to.I, 1e-7);
            }
            // From the plane to the line a continuous map is never injective
            res.injective = dIn === 1 ? this._injective1(map) : false;
        } else if (dOut === 0) {
            // From an interval into a finite set
            const img = this.image(map);
            const nums = to.elements.map(e => e.num).filter(v => v !== null);
            const outside = this._segments(map, from.I).some(S => samplePositions(S, SAMPLES_1D, from.window).some(s => {
                const v = this._raw1(map, s.t);
                return isFinite(v) && !nums.some(n => Math.abs(n - v) <= 1e-9 * Math.max(1, Math.abs(v)));
            }));
            res.into = !outside;
            if (outside) problems.push(`${map.name} assume valori che non stanno in ${toL}`);
            res.surjective = !!img && img.ids.length === to.elements.length;
            // Infinitely many points, finitely many values
            res.injective = isPoint(from.I);
        } else if (dOut === 2) {
            if (dIn === 1) {
                const img = this.image(map);
                res.into = (img ? img.points : []).every(p => this.containsPoint(to, p, 1e-7));
                res.injective = map.kind === 'piecewise' ? null : this._simpleCurve(map);
                // A curve does not fill a region
                res.surjective = false;
            } else {
                const pts = this._denseSamples(from).map(s => this.apply(map, s.p)[0]).filter(v => SetsModel.validPoint(v));
                res.into = pts.every(p => this.containsPoint(to, p, 1e-7));
                if (map.kind !== 'piecewise') {
                    res.injective = this._injective2(map);
                    res.surjective = this._surjective2(map, pts, res.injective);
                }
            }
            if (!res.into) problems.push(`l'immagine non è contenuta in ${toL}`);
        }
        return res;
    }

    /**
     * Properties of an inverse from those of its base map f: it is a function
     * when f is bijective; it is injective because f is a function, and
     * surjective when f is defined everywhere and lands in its codomain.
     */
    _inverseProperties(map, res) {
        const base = map.base;
        const bp = this.properties(base);
        const fromL = map.from.label || map.from.id;
        res.exact = bp.exact;
        res.into = true;
        res.isFunction = !(bp.injective === false || bp.surjective === false);
        if (bp.surjective === false) res.problems.push(`alcuni elementi di ${fromL} non hanno immagine: ${base.name} non è suriettiva`);
        if (bp.injective === false) res.problems.push(`alcuni elementi di ${fromL} hanno più immagini: ${base.name} non è iniettiva`);
        res.injective = bp.isFunction ? true : null;
        res.surjective = bp.into === false ? false : bp.isFunction ? true : null;
        return res;
    }

    /** Injective on an interval: each piece strictly monotone, and the images of the pieces disjoint. */
    _injective1(map) {
        const segs = this._segments(map, map.from.I);
        for (const S of segs) {
            if (isPoint(S)) continue;
            if (!strictlyMonotone(samplePositions(S, SAMPLES_1D, map.from.window).map(s => this._raw1(map, s.t)))) return false;
        }
        const imgs = segs.map(S => this._imageOfSegment(map, S)).filter(Boolean);
        for (let i = 0; i < imgs.length; i++) {
            for (let j = i + 1; j < imgs.length; j++) if (overlaps(imgs[i], imgs[j])) return false;
        }
        return true;
    }

    /** A curve (interval -> plane) is injective when it never meets itself. */
    _simpleCurve(map) {
        const pts = samplePositions(map.from.I, 300, map.from.window).map(s => this.apply(map, s.t)[0]).filter(v => SetsModel.validPoint(v));
        if (pts.length < 2) return true;
        return isSimplePolyline(pts, { tol: 1e-9 * bboxDiagonal(pts) });
    }

    /**
     * Plane -> plane: injective when the Jacobian keeps its sign (a change of
     * sign is a fold) and the boundary goes to a curve that does not meet
     * itself (for a continuous map of a disk or a rectangle these two together
     * give injectivity).
     */
    _injective2(map) {
        const set = map.from;
        const F = (p) => this.apply(map, p)[0];
        const h = 1e-5 * Math.max(1e-9, bboxDiagonal(this.boundary(set, 16)));
        const dets = [];
        this._grid(set, 24).forEach(([x, y]) => {
            const ex = [F([x + h, y]), F([x - h, y])], ey = [F([x, y + h]), F([x, y - h])];
            if (![...ex, ...ey].every(v => SetsModel.validPoint(v))) return;
            const a = (ex[0][0] - ex[1][0]) / (2 * h), c = (ex[0][1] - ex[1][1]) / (2 * h);
            const b = (ey[0][0] - ey[1][0]) / (2 * h), d = (ey[0][1] - ey[1][1]) / (2 * h);
            dets.push(a * d - b * c);
        });
        const maxAbs = dets.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
        if (!(maxAbs > 0)) return false;
        const tiny = 1e-6 * maxAbs;
        if (dets.some(v => v > tiny) && dets.some(v => v < -tiny)) return false;
        const bd = this.boundary(set, 240).map(F).filter(v => SetsModel.validPoint(v));
        return isSimplePolyline(bd, { closed: true, tol: 1e-9 * bboxDiagonal(bd) });
    }

    /**
     * Plane -> plane, surjective: for an injective map the image is the
     * inside of the mapped boundary, which must contain a grid of points of
     * the codomain. Otherwise the values at dense samples must come close to
     * every point of that grid.
     */
    _surjective2(map, pts, injective) {
        const to = map.to;
        const target = this._grid(to, 12);
        const box = bbox(this.boundary(to, 64));
        const diag = Math.hypot(box[2] - box[0], box[3] - box[1]);
        const imgBox = bbox(pts);
        const tol = 1e-3 * diag;
        if (imgBox[0] > box[0] + tol || imgBox[1] > box[1] + tol || imgBox[2] < box[2] - tol || imgBox[3] < box[3] - tol) return false;
        if (injective === true) {
            const img = this.image(map);
            if (!img || img.kind !== 'region') return null;
            return target.every(q => insidePolygon(img.polygon, q));
        }
        // Distance from each point of the grid to the nearest value: a clear gap
        // says no, values close to every grid point say yes
        const gaps = target.map(q => pts.reduce((m, p) => Math.min(m, Math.hypot(p[0] - q[0], p[1] - q[1])), Infinity));
        const worst = Math.max(...gaps);
        if (worst > 0.05 * diag) return false;
        if (worst <= 0.02 * diag) return true;
        return null;
    }

    /** Centres of a k × k grid over a plane set, those inside it. */
    _grid(set, k) {
        const [wx, wy] = set.kind === 'rect' ? set.windows
            : [[set.disk.cx - set.disk.r, set.disk.cx + set.disk.r], [set.disk.cy - set.disk.r, set.disk.cy + set.disk.r]];
        const out = [];
        for (let j = 0; j < k; j++) {
            for (let i = 0; i < k; i++) {
                const p = [wx[0] + (wx[1] - wx[0]) * (i + 0.5) / k, wy[0] + (wy[1] - wy[0]) * (j + 0.5) / k];
                if (this.containsPoint(set, p)) out.push(p);
            }
        }
        return out;
    }
}

/**
 * Replaces the variable x in an expression with another expression:
 * "x^2 + 2x" with "(t+1)" -> "(t+1)^2 + 2(t+1)". Names that contain an x
 * (exp, max) are left alone.
 */
export function substituteX(src, by, params = []) {
    // On the parsed expression, so juxtaposed factors count: "ax" with x = x^2
    // is a·(x^2) (review: sets finding 2); the plot reads it the same way
    try {
        return substituteVariable(String(src), 'x', by, { params });
    } catch (e) {
        // Not an expression the parser knows (a name of the plot's own): by text.
        // Not after a letter or "_" (no lookbehind: a regex literal with one is a
        // SyntaxError on Safari before 16.4, and the whole bundle would not load)
        return replaceNotAfter(String(src), /x(?![A-Za-z0-9_])/g, /[A-Za-z_]/, () => `(${by})`);
    }
}

/** Joins results of the same kind (pieces of one image or preimage). */
function mergeResults(list, set) {
    const rs = list.filter(Boolean);
    if (!rs.length) return null;
    if (rs.every(r => r.kind === 'elements')) {
        const ids = new Set([].concat(...rs.map(r => r.ids)));
        const all = rs[0].set.elements.map(e => e.id).filter(id => ids.has(id));
        return { kind: 'elements', set: rs[0].set, ids: all, outside: [].concat(...rs.map(r => r.outside || [])) };
    }
    const parts = [];
    let ok = true;
    rs.forEach(r => {
        if (r.kind === 'interval') parts.push(r.I);
        else if (r.kind === 'intervals') parts.push(...r.parts);
        else if (r.kind === 'points') r.points.forEach(v => (typeof v === 'number' ? parts.push(interval(v, v)) : (ok = false)));
        else ok = false;
    });
    if (!ok) return rs[0];
    const u = unionIntervals(parts);
    const res = !u.length ? { kind: 'points', set: rs[0].set || set, points: [] }
        : u.every(isPoint) ? { kind: 'points', set: rs[0].set, points: u.map(P => P.lo) }
            : u.length === 1 ? { kind: 'interval', set: rs[0].set, I: u[0] } : { kind: 'intervals', set: rs[0].set, parts: u };
    if (rs.some(r => r.inWindow)) res.inWindow = true;
    return res;
}

/** A computed limit: tiny values are 0, values next to an integer are that integer. */
function snapLimit(v) {
    if (Math.abs(v) < 1e-9) return 0;
    const r = Math.round(v);
    return Math.abs(v - r) < 1e-9 * Math.max(1, Math.abs(v)) ? r : v;
}

/** Bounding box [x0, y0, x1, y1] of points. */
function bbox(pts) {
    const b = [Infinity, Infinity, -Infinity, -Infinity];
    pts.forEach(p => {
        b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]);
        b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]);
    });
    return b;
}

function bboxDiagonal(pts) {
    const b = bbox(pts);
    return pts.length ? Math.hypot(b[2] - b[0], b[3] - b[1]) : 0;
}

/** Same value of a map: same element id, or (nearly) the same number or point. */
function sameValue(v, y) {
    if (typeof v === 'string' || typeof y === 'string') return String(v) === String(y);
    const close = (a, b) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
    if (Array.isArray(v) && Array.isArray(y)) return v.length === y.length && v.every((c, i) => close(c, y[i]));
    return close(v, y);
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

/**
 * "N", "N*", "Z", "2N", "2N+1", "3Z", "[-3, 5]" -> { step, offset, lo, hi, tex }:
 * the integers n = step·k + offset between lo and hi.
 */
export function parseIntegers(src) {
    const s = String(src).replace(/\s+/g, '').replace(/ℕ/g, 'N').replace(/ℤ/g, 'Z');
    const m = /^(\d*)([NZ])(\*|\+(?![\d]))?(?:([+-])(\d+))?$/.exec(s);
    if (m) {
        const step = m[1] ? Number(m[1]) : 1;
        const offset = m[5] ? (m[4] === '-' ? -1 : 1) * Number(m[5]) : 0;
        if (!(step >= 1)) return null;
        const nat = m[2] === 'N';
        const lo = nat ? (m[3] ? step + offset : offset) : -Infinity;
        const base = nat ? '\\mathbb{N}' : '\\mathbb{Z}';
        const tex = `${step > 1 ? step : ''}${base}${m[3] && nat ? '^*' : ''}${offset ? `${offset > 0 ? '+' : '-'}${Math.abs(offset)}` : ''}`;
        return { step, offset, lo, hi: Infinity, tex };
    }
    const r = /^([[(])(-?\d+),(-?\d+)([\])])$/.exec(s);
    if (r) {
        const lo = Number(r[2]) + (r[1] === '(' ? 1 : 0), hi = Number(r[3]) - (r[4] === ')' ? 1 : 0);
        if (!(lo <= hi)) return null;
        return { step: 1, offset: 0, lo, hi, tex: `\\{${lo},\\dots,${hi}\\}` };
    }
    return null;
}

/** Does an integer rule contain n? */
export function intMember(r, n) {
    if (typeof n !== 'number' || !isFinite(n) || Math.abs(n - Math.round(n)) > 1e-9) return false;
    const k = Math.round(n);
    if (k < r.lo - 1e-9 || k > r.hi + 1e-9) return false;
    return ((k - r.offset) % r.step + r.step) % r.step === 0;
}
