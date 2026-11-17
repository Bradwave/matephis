/**
 * A negative lookbehind of one character (a pattern that may not follow some
 * character), without writing it in a regex: Safari before 16.4 has no
 * lookbehind and throws a SyntaxError (for a regex literal, when the whole
 * file is parsed, so nothing in the bundle runs).
 *
 * `re` is the pattern without the lookbehind; `before` is a regex for the one
 * character that must not come just before a match. A match after such a
 * character is retried one character later, as the regex engine does with the
 * lookbehind, so the matches are the same.
 *
 * Shared by the plot, sets and physics engines; tests/not-after.test.js checks
 * the matches against the lookbehind versions.
 */

/** Global copy of a regex (exec needs lastIndex). */
const globalCopy = (re) => new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);

/** All matches of `re` in `str` not preceded by a character matching `before`. */
export function matchesNotAfter(str, re, before) {
    const g = globalCopy(re);
    const out = [];
    let m;
    while ((m = g.exec(str)) !== null) {
        if (m.index > 0 && before.test(str[m.index - 1])) {
            g.lastIndex = m.index + 1;
            continue;
        }
        out.push(m);
        if (m[0] === '') g.lastIndex++;
    }
    return out;
}

/** Is there a match of `re` in `str` not preceded by a character matching `before`? */
export function testNotAfter(str, re, before) {
    const g = globalCopy(re);
    let m;
    while ((m = g.exec(str)) !== null) {
        if (!(m.index > 0 && before.test(str[m.index - 1]))) return true;
        g.lastIndex = m.index + 1;
    }
    return false;
}

/** str.replace(re, fn) for the matches of matchesNotAfter: fn(match, ...groups). */
export function replaceNotAfter(str, re, before, fn) {
    let out = '', last = 0;
    for (const m of matchesNotAfter(str, re, before)) {
        out += str.slice(last, m.index) + fn(...m);
        last = m.index + m[0].length;
    }
    return out + str.slice(last);
}
