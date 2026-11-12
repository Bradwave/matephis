/**
 * Selectors: the strings that name what a highlight, "show" or a reveal
 * button refers to.
 *
 *   "image(f)"                 f(A)
 *   "image(f, {a_1, a_2})"     image of a subset of the domain
 *   "image(h, [0, 1/2])"       image of a sub-interval
 *   "preimage(f, b_1)"         f^{-1}(b_1)
 *   "preimage(f, {b_1, b_2})"  preimage of a subset
 *   "preimage(h, 1/2)"         points where h = 1/2
 *   "preimage(h, [0, 1/2])"    where h takes values in [0, 1/2]
 *   "collisions(f)"            elements with the same image (f not injective)
 *   "properties(f)"            injective / surjective / bijective badge
 *   "arrows(f)"                the arrows of a map (to hide or reveal them)
 */

export const OPS = ['image', 'preimage', 'collisions', 'properties', 'arrows'];

const CALL_RE = /^\s*([A-Za-z]+)\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:,\s*([\s\S]+?))?\s*\)\s*$/;

/**
 * "{a_1, a_2}" -> { kind: 'elements', ids: ['a_1', 'a_2'] }
 * "[0, 1/2]"   -> { kind: 'interval', src: '[0, 1/2]' }
 * "b_1"        -> { kind: 'element', id: 'b_1' } (or a number: { kind: 'value', src })
 */
export function parseArgument(arg) {
    if (arg === undefined || arg === null) return null;
    const s = String(arg).trim();
    if (s.startsWith('{') && s.endsWith('}')) {
        const inner = s.slice(1, -1).trim();
        return { kind: 'elements', ids: inner ? inner.split(',').map(x => x.trim()).filter(Boolean) : [] };
    }
    if (/^[[(]/.test(s) && /[\])]$/.test(s) && /[,;]/.test(s)) return { kind: 'interval', src: s };
    return { kind: 'element', id: s };
}

/**
 * Parses a selector. Returns { op, map, arg, key } or null when the string is
 * not a call (it may then be the id of a highlight or a map).
 */
export function parseSelector(str) {
    if (typeof str !== 'string') return null;
    const m = CALL_RE.exec(str);
    if (!m) return null;
    const op = m[1];
    if (!OPS.includes(op)) return { op, map: m[2], arg: null, key: normalizeKey(str), unknown: true };
    return { op, map: m[2], arg: parseArgument(m[3]), key: normalizeKey(str) };
}

/** Same selector written with different spaces -> same key. */
export function normalizeKey(str) {
    return String(str).replace(/\s+/g, '');
}

/** "A.*" -> /^A\..*$/ (same globs as physics reveal targets). */
export function globToRegExp(glob) {
    return new RegExp(`^${String(glob).split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
}

/** Does a layer key ("image(f)", a highlight id) match a target ("image(*)", "h1")? */
export function matchesTarget(key, target) {
    if (typeof target !== 'string' || typeof key !== 'string') return false;
    return globToRegExp(normalizeKey(target)).test(normalizeKey(key));
}
