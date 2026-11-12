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
    samplePositions, imageFromSamples, strictlyMonotone, unionIntervals, overlaps,
} from './interval.js';
import { isSimplePolyline, insidePolygon } from './geometry.js';
import { parseArgument, parseSelector } from './selectors.js';

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
        if (this.sharedWindow) {
            const lines = this.sets.filter(st => st.kind === 'interval');
            if (lines.length > 1) {
                const w = [Math.min(...lines.map(st => st.window[0])), Math.max(...lines.map(st => st.window[1]))];
                lines.forEach(st => { st.window = w.slice(); });
            }
        }
        this.maps.forEach(map => {
            if (map.kind !== 'piecewise') return;
            map.pieces.forEach(pc => { pc.I = pc.on ? evalInterval(pc.on, ev) : null; });
            const withI = map.pieces.filter(pc => pc.I);
            withI.forEach((a, i) => withI.slice(i + 1).forEach(b => {
                if (overlaps(a.I, b.I)) this.warn(`map '${map.id}': pieces ${a.index + 1} and ${b.index + 1} overlap; where they do, the first one is used`);
            }));
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

        if (def.inverse !== undefined) {
            if (this._readInverse(map, def)) {
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
        } else if (def.piecewise !== undefined) {
            map.kind = 'piecewise';
            if (def.expr !== undefined) this.warn(`map '${id}': has both "piecewise" and "expr"; "expr" is ignored`);
            this._readPiecewise(map, def.piecewise);
        } else if (def.expr !== undefined) {
            map.kind = 'expr';
            this._readExpr(map, def.expr);
        } else {
            this.warn(`map '${id}': needs "pairs", "expr", "piecewise", "compose" or "inverse"`);
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
            const l = String(base.label);
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
        if (map.kind === 'inverse') return this._applyInverse(map, x);
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
        return isFinite(exact) && Math.abs(exact - v2) < 1e-5 * Math.max(1, Math.abs(exact)) ? exact : v2;
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
                e = substituteX(pe, e);
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
        return unionIntervals(this._segments(map, D).map(S => this._imageOfSegment(map, S)).filter(Boolean));
    }

    /** Image of a part of the domain where the map is given by one (continuous) formula. */
    _imageOfSegment(map, S) {
        if (isPoint(S)) {
            const v = this._raw1(map, S.lo);
            return isFinite(v) ? interval(v, v) : null;
        }
        const samples = samplePositions(S, SAMPLES_1D, map.from.window);
        const values = samples.map(s => ({ v: this._raw1(map, s.t), nearOpen: s.nearOpen }));
        // A minimum or maximum inside the segment usually falls between two
        // samples: find it, so that x^2 on [-1, 2] reaches 0 exactly
        values.push(...this._refineExtrema(map, samples, values));
        const limits = [];
        if (!S.loClosed && isFinite(S.lo)) limits.push({ v: this._limitAt(map, S.lo, 1) });
        if (!S.hiClosed && isFinite(S.hi)) limits.push({ v: this._limitAt(map, S.hi, -1) });
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
            if (best <= 0 || best >= n - 1 || values[best].nearOpen) return;
            const g = (t) => sign * this._raw1(map, t);
            let a = samples[best - 1].t, b = samples[best + 1].t;
            const r = (Math.sqrt(5) - 1) / 2;
            let c = b - r * (b - a), d = a + r * (b - a), gc = g(c), gd = g(d);
            for (let k = 0; k < 80 && b - a > 1e-15 * Math.max(1, Math.abs(a)); k++) {
                if (gc < gd) { b = d; d = c; gd = gc; c = b - r * (b - a); gc = g(c); }
                else { a = c; c = d; gc = gd; d = a + r * (b - a); gd = g(d); }
            }
            const t = (a + b) / 2, v = this._raw1(map, t);
            if (isFinite(v) && sign * v < sign * values[best].v) out.push({ v, nearOpen: false });
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
                    if (!to.elementById.has(t)) {
                        this.warn(`preimage(${map.id}, …): '${t}' is not an element of ${to.id}`);
                        return;
                    }
                    y = this.elementNumber(to, t);
                } else {
                    y = this.evaluate(t);
                }
                if (typeof y === 'number' && isFinite(y)) out.push(interval(y, y));
                else this.warn(`preimage(${map.id}, …): '${t}' is not a number`);
            });
            return out;
        };
        if (from.kind === 'interval' && dOut < 2) {
            const parts = unionIntervals([].concat(...values().map(J => this._preimage1D(map, J))));
            if (parts.every(isPoint)) return { kind: 'points', set: from, points: parts.map(P => P.lo) };
            return { kind: 'intervals', set: from, parts };
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
        this._segments(map, D).forEach(S => {
            if (isPoint(S)) {
                if (inJ(S.lo)) out.push(interval(S.lo, S.lo));
                return;
            }
            const ts = samplePositions(S, SAMPLES_1D * 2, map.from.window).map(s => s.t);
            const vs = ts.map(f);
            const ok = vs.map(v => contains(J, v, tol));
            let start = null;
            for (let i = 0; i < ts.length; i++) {
                if (ok[i] && start === null) start = i === 0 ? { t: S.lo, closed: S.loClosed } : edge(ts[i], ts[i - 1]);
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
            if (start !== null) out.push(interval(start.t, S.hi, start.closed, S.hiClosed));
        });
        // Tiny parts are single points (a value taken at one point, seen through the tolerance)
        const tiny = (P) => isFinite(P.lo) && P.hi - P.lo <= (single ? 1e-6 : 1e-12) * Math.max(1, Math.abs(P.lo));
        return unionIntervals(out.map(P => (tiny(P) ? interval((P.lo + P.hi) / 2, (P.lo + P.hi) / 2) : P)));
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
            if (undefinedSomewhere) {
                res.isFunction = false;
                problems.push(`${map.label} non è definita in tutto ${fromL}`);
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
            if (outside) problems.push(`${map.label} assume valori che non stanno in ${toL}`);
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
        if (bp.surjective === false) res.problems.push(`alcuni elementi di ${fromL} non hanno immagine: ${base.label} non è suriettiva`);
        if (bp.injective === false) res.problems.push(`alcuni elementi di ${fromL} hanno più immagini: ${base.label} non è iniettiva`);
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
export function substituteX(src, by) {
    return String(src).replace(/(?<![A-Za-z_])x(?![A-Za-z0-9_])/g, `(${by})`);
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
    if (!u.length) return { kind: 'points', set: rs[0].set || set, points: [] };
    if (u.every(isPoint)) return { kind: 'points', set: rs[0].set, points: u.map(P => P.lo) };
    return u.length === 1 ? { kind: 'interval', set: rs[0].set, I: u[0] } : { kind: 'intervals', set: rs[0].set, parts: u };
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
