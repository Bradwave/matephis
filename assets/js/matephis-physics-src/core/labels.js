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
