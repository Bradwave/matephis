/**
 * Label text helpers.
 */

/**
 * One TeX string for a label that mixes text and math, so MathJax can
 * typeset it as a single piece: "$x = R\cos\alpha$, $y$" -> "x = R\cos\alpha\text{, }y".
 */
export function toTeX(str) {
    return String(str).split('$').map((part, i) => {
        if (i % 2 === 1) return part;
        return part ? `\\text{${part.replace(/[\\{}#%&]/g, '\\$&')}}` : '';
    }).join('');
}

/** A label with a TeX command but no "$" ("\vec F", "\alpha") is math: wrap it. */
export function normalizeLabel(str) {
    const s = String(str);
    return !s.includes('$') && /\\[A-Za-z]/.test(s) ? `$${s}$` : s;
}

/** TeX commands that print nothing (or only decorate the next symbol). */
const SILENT = /\\(vec|overrightarrow|mathbf|mathrm|boldsymbol|text|left|right|,|;|!|quad)\b/g;

/**
 * Rough size of a label in pixels, for keeping labels apart. Plain text
 * counts characters; TeX counts one character per symbol and less for
 * sub/superscripts. Good enough to tell overlapping boxes apart.
 * @returns {{w: number, h: number}}
 */
export function estimateTextSize(str, size) {
    const s = String(str);
    let n = 0;
    s.split('$').forEach((part, i) => {
        if (i % 2 === 0) { n += part.length; return; }
        const t = part.replace(SILENT, '').replace(/\\[A-Za-z]+/g, 'x').replace(/[{}\s]/g, '');
        // Characters after _ or ^ are small
        const small = (t.match(/[_^]./g) || []).length;
        n += t.replace(/[_^]/g, '').length - small * 0.35;
    });
    const tall = /\\(vec|overrightarrow)|\^/.test(s) ? 1.35 : 1.1;
    return { w: Math.max(1, n) * size * 0.62 + 4, h: size * tall };
}

/** Box {x, y, w, h} (screen) of a label placed at (x, y) with SVG anchor and baseline. */
export function labelBox(x, y, w, h, anchor = 'middle', baseline = 'middle') {
    const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
    const y0 = baseline === 'hanging' ? y : baseline === 'auto' ? y - h : y - h / 2;
    return { x: x0, y: y0, w, h };
}

export const boxesOverlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Does the segment p–q (screen) cross the box? */
export function segmentHitsBox(p, q, b) {
    const L = Math.hypot(q.x - p.x, q.y - p.y);
    const n = Math.max(1, Math.ceil(L / 3));
    for (let i = 0; i <= n; i++) {
        const x = p.x + (q.x - p.x) * i / n, y = p.y + (q.y - p.y) * i / n;
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return true;
    }
    return false;
}
