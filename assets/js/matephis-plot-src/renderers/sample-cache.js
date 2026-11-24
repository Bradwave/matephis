/**
 * Cache of sampled curves between draws.
 *
 * A draw rebuilds every item, but most of the work (sampling curves, marching squares) only
 * changes when something the item reads changes: the visible window and size, the item's own
 * settings, and the parameters and named points its expressions use. A slider that moves one
 * curve of five, a selection or a physics graph's cursor should not resample the other four.
 *
 * The names an expression reads are taken from its generated code (the compiler writes a
 * parameter as $p["a"] and a point property as $R.pt($pt,"A","x")); expressions are pure,
 * so the same inputs always give the same polylines. Entries not used by a draw are dropped
 * at the next one, so the cache holds at most one draw's curves.
 */

const PARAM_RE = /\$p\["((?:[^"\\]|\\.)*)"\]/g;
const POINT_RE = /\$R\.pt\(\$pt,"((?:[^"\\]|\\.)*)"/g;

const readsByCode = new Map();

/** Parameter and point names a compiled function reads (from its generated code). */
export function readsOf(fn) {
    const code = fn && fn.code;
    if (typeof code !== 'string') return null;
    let r = readsByCode.get(code);
    if (!r) {
        const params = new Set(), points = new Set();
        for (const m of code.matchAll(PARAM_RE)) params.add(JSON.parse(`"${m[1]}"`));
        for (const m of code.matchAll(POINT_RE)) points.add(JSON.parse(`"${m[1]}"`));
        r = { params: [...params].sort(), points: [...points].sort() };
        if (readsByCode.size > 2000) readsByCode.clear();
        readsByCode.set(code, r);
    }
    return r;
}

/** Exact text of a value for a key (keeps -0 apart from 0). */
function valueKey(v) {
    if (typeof v === 'number') return Object.is(v, -0) ? '-0' : String(v);
    if (v === undefined) return 'u';
    try { return JSON.stringify(v); } catch (_) { return '?'; }
}

export class SampleCache {
    constructor() {
        this.prev = new Map();
        this.next = new Map();
        this.frame = '';
    }

    /** Start of a draw: `frame` is everything the screen mapping depends on. */
    begin(frame) {
        this.prev = this.next;
        this.next = new Map();
        this.frame = frame;
    }

    /**
     * The value of `compute()` for these inputs, from the previous draw when they did not change.
     * @param {string} what - the item's own settings (kind, expressions, ranges, options)
     * @param {Function[]} fns - compiled functions the sampling calls
     * @param {object} params - live parameter values
     * @param {object} points - live named points
     * @param {() => any} compute
     */
    get(what, fns, params, points, compute) {
        let deps = '';
        for (const fn of fns) {
            const r = readsOf(fn);
            if (!r) return compute(); // not a compiled expression: cannot tell what it reads
            for (const n of r.params) deps += `|${n}=${valueKey(params ? params[n] : undefined)}`;
            for (const n of r.points) deps += `|@${n}=${valueKey(points ? points[n] : undefined)}`;
        }
        const key = `${this.frame}#${what}#${deps}`;
        if (this.next.has(key)) return this.next.get(key);
        let v = this.prev.get(key);
        if (v === undefined) v = compute();
        this.next.set(key, v);
        return v;
    }
}
