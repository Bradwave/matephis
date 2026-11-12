/**
 * Real intervals: parsing, membership, TeX, and the image of a continuous
 * function computed by sampling.
 *
 * An interval as written in a config is a string: "[0,1]", "(0,1]", "[0,+inf)",
 * "(-inf, pi)", "R" (or "\\mathbb{R}"). Endpoints may be expressions ("pi",
 * "a/2"), so parsing keeps them as source strings and `evalInterval` turns
 * them into numbers with an evaluator.
 */

const INF_RE = /^\s*([+-]?)\s*(inf|infinity|∞|\\infty)\s*$/i;
const REALS_RE = /^\s*(R|ℝ|\\mathbb\s*\{?\s*R\s*\}?)\s*$/;

/**
 * "[0, 1)" -> { lo: "0", hi: "1", loClosed: true, hiClosed: false }.
 * Returns null when the string is not an interval.
 */
export function parseInterval(src) {
    if (typeof src !== 'string') return null;
    if (REALS_RE.test(src)) return { lo: '-inf', hi: '+inf', loClosed: false, hiClosed: false };
    const s = src.trim();
    const open = s[0], close = s[s.length - 1];
    if (!'[('.includes(open) || !'])'.includes(close)) return null;
    const body = s.slice(1, -1);
    // Split on the comma that is not inside parentheses (endpoints like "max(a, b)")
    let depth = 0, cut = -1;
    for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if (c === '(' || c === '[') depth++;
        else if (c === ')' || c === ']') depth--;
        else if ((c === ',' || c === ';') && depth === 0) {
            if (cut !== -1) return null;
            cut = i;
        }
    }
    if (cut === -1) return null;
    const lo = body.slice(0, cut).trim(), hi = body.slice(cut + 1).trim();
    if (!lo || !hi) return null;
    return { lo, hi, loClosed: open === '[', hiClosed: close === ']' };
}

/** Value of one endpoint: "+inf" -> Infinity, otherwise the evaluator's number. */
export function endpointValue(src, evaluate) {
    if (typeof src === 'number') return src;
    const m = INF_RE.exec(String(src));
    if (m) return m[1] === '-' ? -Infinity : Infinity;
    const v = evaluate(src);
    return typeof v === 'number' ? v : NaN;
}

/**
 * Numeric interval { lo, hi, loClosed, hiClosed, loSrc, hiSrc } from a parsed
 * one. An infinite endpoint is always open.
 */
export function evalInterval(parsed, evaluate = Number) {
    const lo = endpointValue(parsed.lo, evaluate), hi = endpointValue(parsed.hi, evaluate);
    return {
        lo, hi,
        loClosed: parsed.loClosed && isFinite(lo),
        hiClosed: parsed.hiClosed && isFinite(hi),
        loSrc: parsed.lo, hiSrc: parsed.hi,
    };
}

/** Interval straight from numbers (closed by default). */
export function interval(lo, hi, loClosed = true, hiClosed = true) {
    return { lo, hi, loClosed: loClosed && isFinite(lo), hiClosed: hiClosed && isFinite(hi) };
}

export function isEmpty(I) {
    return !(I.lo < I.hi) && !(I.lo === I.hi && I.loClosed && I.hiClosed);
}

export function contains(I, x, eps = 0) {
    if (!(typeof x === 'number') || isNaN(x)) return false;
    const aboveLo = I.loClosed ? x >= I.lo - eps : x > I.lo + eps;
    const belowHi = I.hiClosed ? x <= I.hi + eps : x < I.hi - eps;
    return aboveLo && belowHi;
}

/** Is J a subset of I? Endpoints are compared within `eps`. */
export function isSubset(J, I, eps = 1e-9) {
    if (isEmpty(J)) return true;
    const loOk = J.lo > I.lo + eps || (Math.abs(J.lo - I.lo) <= eps && (I.loClosed || !J.loClosed)) || (J.lo === -Infinity && I.lo === -Infinity);
    const hiOk = J.hi < I.hi - eps || (Math.abs(J.hi - I.hi) <= eps && (I.hiClosed || !J.hiClosed)) || (J.hi === Infinity && I.hi === Infinity);
    return loOk && hiOk;
}

export function sameInterval(A, B, eps = 1e-9) {
    return isSubset(A, B, eps) && isSubset(B, A, eps);
}

/**
 * A number as TeX: integers, simple fractions (denominator up to 12), multiples
 * of π, otherwise at most 3 decimals with a decimal comma (Italian style).
 */
export function niceNumber(v) {
    if (v === Infinity) return '+\\infty';
    if (v === -Infinity) return '-\\infty';
    if (typeof v !== 'number' || isNaN(v)) return '?';
    const sign = v < 0 ? '-' : '';
    const a = Math.abs(v);
    if (Math.abs(a - Math.round(a)) < 1e-9) return `${sign}${Math.round(a)}`;
    for (let d = 2; d <= 12; d++) {
        const n = a * d;
        if (Math.abs(n - Math.round(n)) < 1e-9) return `${sign}\\tfrac{${Math.round(n)}}{${d}}`;
    }
    for (let d = 1; d <= 6; d++) {
        const n = a / Math.PI * d;
        if (Math.abs(n - Math.round(n)) < 1e-9) {
            const k = Math.round(n);
            const num = k === 1 ? '\\pi' : `${k}\\pi`;
            return d === 1 ? `${sign}${num}` : `${sign}\\tfrac{${num}}{${d}}`;
        }
    }
    return sign + String(+a.toFixed(3)).replace('.', '{,}');
}

/** TeX of an interval: "\left[0, \tfrac{1}{2}\right)". Uses ";" when an endpoint has a decimal comma. */
export function intervalTeX(I) {
    if (I.lo === -Infinity && I.hi === Infinity) return '\\mathbb{R}';
    if (isPoint(I)) return `\\{${niceNumber(I.lo)}\\}`;
    const lo = niceNumber(I.lo), hi = niceNumber(I.hi);
    const sep = lo.includes('{,}') || hi.includes('{,}') ? ';\\,' : ',\\,';
    return `\\left${I.loClosed ? '[' : '('}${lo}${sep}${hi}\\right${I.hiClosed ? ']' : ')'}`;
}

/**
 * Sample positions inside an interval, for drawing and for numeric checks.
 * Closed endpoints are included; open ones are approached but not reached.
 * Infinite ends are cut at `window` (the part of the line that is drawn).
 * @returns {{t: number, nearOpen: boolean}[]}
 */
export function samplePositions(I, n = 400, window = null) {
    const lo = isFinite(I.lo) ? I.lo : (window ? window[0] : -10);
    const hi = isFinite(I.hi) ? I.hi : (window ? window[1] : 10);
    if (!(hi > lo)) return I.loClosed && I.hiClosed && lo === hi ? [{ t: lo, nearOpen: false }] : [];
    const out = [];
    const h = (hi - lo) / n;
    const loOpen = !I.loClosed, hiOpen = !I.hiClosed;
    for (let i = 0; i <= n; i++) {
        let t = lo + h * i;
        if (i === 0 && loOpen) t = lo + h * 1e-3;
        if (i === n && hiOpen) t = hi - h * 1e-3;
        out.push({ t, nearOpen: (loOpen && i <= 2) || (hiOpen && i >= n - 2) });
    }
    return out;
}

/**
 * Image of a set of sampled values: the smallest and largest value, each
 * closed when it is reached at a point of the domain away from its open
 * boundary, open when it is only approached there. Assumes the function is
 * continuous on a connected domain (the image is then an interval).
 *
 * @param {{v: number, nearOpen: boolean}[]} values - function values at the samples
 * @param {{v: number}[]} [limits] - values at open boundary points (limits there);
 *   non-finite values make the image unbounded on that side
 * @returns {{lo, hi, loClosed, hiClosed}|null}
 */
export function imageFromSamples(values, limits = []) {
    const finite = values.filter(s => typeof s.v === 'number' && isFinite(s.v));
    if (!finite.length) return null;
    let lo = Infinity, hi = -Infinity;
    finite.forEach(s => { lo = Math.min(lo, s.v); hi = Math.max(hi, s.v); });
    // Unbounded near an open end: a non-finite limit, or samples that blow up
    const unboundedBelow = limits.some(l => l.v === -Infinity) || values.some(s => s.v === -Infinity);
    const unboundedAbove = limits.some(l => l.v === Infinity) || values.some(s => s.v === Infinity);
    limits.forEach(l => {
        if (typeof l.v === 'number' && isFinite(l.v)) { lo = Math.min(lo, l.v); hi = Math.max(hi, l.v); }
    });
    const tol = 1e-9 * Math.max(1, Math.abs(lo), Math.abs(hi)) + 1e-12;
    // Reached at a sample that is not just next to an open boundary point
    const reached = (target) => finite.some(s => !s.nearOpen && Math.abs(s.v - target) <= Math.max(tol, 1e-7 * Math.max(1, Math.abs(hi - lo))));
    return {
        lo: unboundedBelow ? -Infinity : lo,
        hi: unboundedAbove ? Infinity : hi,
        loClosed: !unboundedBelow && reached(lo),
        hiClosed: !unboundedAbove && reached(hi),
    };
}

/**
 * Is a sampled function strictly monotone (hence injective, when continuous)?
 * @param {number[]} vs - values in order of the samples
 */
export function strictlyMonotone(vs) {
    const f = vs.filter(v => typeof v === 'number' && isFinite(v));
    if (f.length < 2) return true;
    let sign = 0;
    for (let i = 1; i < f.length; i++) {
        const d = f[i] - f[i - 1];
        const scale = 1e-12 * Math.max(1, Math.abs(f[i]));
        if (Math.abs(d) <= scale) return false;
        const s = Math.sign(d);
        if (sign === 0) sign = s;
        else if (s !== sign) return false;
    }
    return true;
}

/** Is an interval a single point [a, a]? */
export function isPoint(I) {
    return I.lo === I.hi && I.loClosed && I.hiClosed;
}

/**
 * Union of intervals, as a sorted list of disjoint intervals. Two intervals
 * that touch are joined when the common endpoint belongs to one of them.
 */
export function unionIntervals(list, eps = 1e-9) {
    const parts = list.filter(I => I && !isEmpty(I)).map(I => ({ ...I })).sort((a, b) => a.lo - b.lo || (b.loClosed ? 1 : 0) - (a.loClosed ? 1 : 0));
    const out = [];
    parts.forEach(I => {
        const last = out[out.length - 1];
        const tol = eps * Math.max(1, Math.abs(I.lo));
        if (last && (I.lo < last.hi - tol || (Math.abs(I.lo - last.hi) <= tol && (I.loClosed || last.hiClosed)))) {
            if (I.hi > last.hi + tol) {
                last.hi = I.hi;
                last.hiClosed = I.hiClosed;
            } else if (Math.abs(I.hi - last.hi) <= tol) {
                last.hiClosed = last.hiClosed || I.hiClosed;
            }
            if (Math.abs(I.lo - last.lo) <= tol) last.loClosed = last.loClosed || I.loClosed;
        } else {
            out.push(I);
        }
    });
    return out;
}

/** Do two intervals have a point in common? */
export function overlaps(A, B, eps = 1e-9) {
    if (isEmpty(A) || isEmpty(B)) return false;
    const lo = Math.max(A.lo, B.lo), hi = Math.min(A.hi, B.hi);
    const tol = eps * Math.max(1, isFinite(lo) ? Math.abs(lo) : 0);
    if (hi < lo - tol) return false;
    if (hi > lo + tol) return true;
    // They meet at one point: it must belong to both
    return contains(A, lo, tol) && contains(B, lo, tol);
}
