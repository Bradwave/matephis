/**
 * Angles: one rule for degrees and radians.
 *
 * Everything is radians internally and every expression is evaluated in
 * radians. Only bare numeric literals in angle fields follow the scene's
 * angleUnit ("deg" by default):
 *   "angle": 30          -> 30° with angleUnit "deg", 30 rad with "rad"
 *   "angle": "30°"       -> 30°, whatever the angleUnit
 *   "angle": "pi/6"      -> π/6 rad (an expression)
 *   "angle": "alpha"     -> the param, already in radians (unit "deg" params store radians)
 */

export const DEG = Math.PI / 180;

/** Param names that usually hold angles. */
const ANGLE_NAMES = /^(alpha|beta|gamma|delta|theta|phi|psi|angle|ang|angolo|α|β|γ|δ|θ|φ|ψ)\d*$/i;

/**
 * Value of an angle field in radians.
 * @param {number|string} v
 * @param {"deg"|"rad"} angleUnit - unit of bare number literals
 * @param {(expr: string) => number} evalFn - evaluates an expression (radians)
 */
export function angleValue(v, angleUnit, evalFn) {
    if (typeof v === 'number') return angleUnit === 'rad' ? v : v * DEG;
    if (typeof v === 'string' && v.trim() !== '') return evalFn(v);
    return NaN;
}

/**
 * Warning for a numeric literal that is very likely in the wrong unit, or null.
 * @param {*} v - the raw field value
 * @param {"deg"|"rad"} angleUnit
 * @param {string} where - for the message
 */
export function angleLiteralWarning(v, angleUnit, where) {
    if (typeof v !== 'number' || angleUnit !== 'rad') return null;
    if (Math.abs(v) > 2 * Math.PI + 1e-9) {
        return `${where}: angle ${v} is read in radians (angleUnit "rad"); write "${v}°" if you meant degrees`;
    }
    return null;
}

/**
 * Warning for a param that looks like an angle in degrees but has no unit, or null.
 * The value is stored as written, so sin(alpha) would read it in radians.
 */
export function angleParamWarning(name, def) {
    if (!def || typeof def !== 'object' || def.unit !== undefined || !ANGLE_NAMES.test(name)) return null;
    const max = typeof def.max === 'number' ? def.max : NaN;
    if (max > 7) {
        return `Param '${name}' looks like an angle in degrees (max ${max}): add "unit": "deg" so expressions get radians`;
    }
    return null;
}

/** Fractions of π for multiples of π/12, e.g. "π/6", "2π/3", "−π/4". */
function piFraction(rad) {
    const n = Math.round(rad / (Math.PI / 12));
    if (Math.abs(rad - n * Math.PI / 12) > 1e-9) return null;
    if (n === 0) return '0';
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const g = gcd(Math.abs(n), 12);
    const num = n / g, den = 12 / g;
    const sign = num < 0 ? '−' : '';
    const a = Math.abs(num);
    const top = a === 1 ? 'π' : `${a}π`;
    return den === 1 ? `${sign}${top}` : `${sign}${top}/${den}`;
}

/**
 * Display text for an angle in radians: "30°" or "π/6" / "0.52 rad".
 * @param {number} rad
 * @param {"deg"|"rad"} unit
 * @param {number} [digits=1]
 */
export function formatAngle(rad, unit = 'deg', digits = 1) {
    if (typeof rad !== 'number' || !isFinite(rad)) return String(rad);
    if (unit === 'rad') {
        const frac = piFraction(rad);
        return frac !== null ? frac : `${+rad.toFixed(2)} rad`;
    }
    const d = +(rad / DEG).toFixed(digits);
    return `${Object.is(d, -0) ? 0 : d}°`;
}
