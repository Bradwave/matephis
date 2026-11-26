/**
 * An exercise reveals its aids in steps: each hint, then the solutions, then the working.
 * Same markup and `.is-revealed` class as the notes (_plugins/solution_styler.rb, style.css).
 * Cards stored before the new markup still work: their hints were `.solution-tag.hint-tag`.
 */
const HINTS = '.hint-tag';
const SOLUTIONS = '.solution-tag:not(.hint-tag)';
const WORKING = 'details.work, details.details';

/** Any aid at all; plain selectors, since the picker's own small parser reads them too. */
export const AIDS_SELECTOR = `${HINTS}, .solution-tag, ${WORKING}`;

/** @returns {{ label: string, els: Element[] }[]} */
export function exerciseSteps(root) {
    const hints = [...root.querySelectorAll(HINTS)];
    const steps = hints.map((el, i) => ({ label: hints.length > 1 ? `Sugg. ${i + 1}` : 'Suggerimento', els: [el] }));
    const solutions = [...root.querySelectorAll(SOLUTIONS)];
    if (solutions.length) steps.push({ label: 'Soluzione', els: solutions });
    const working = [...root.querySelectorAll(WORKING)];
    if (working.length) steps.push({ label: 'Svolgimento', els: working });
    return steps;
}

/** The last step shown; boards saved before steps only knew "hide the solution" or not. */
export function revealLevel(data, steps) {
    if (Number.isInteger(data && data.reveal)) return Math.min(data.reveal, steps.length - 1);
    return data && data.hideSolution ? -1 : steps.length - 1;
}

/** Shows steps 0…level and hides the rest (−1 hides them all). */
export function revealSteps(steps, level) {
    steps.forEach((step, i) => {
        for (const el of step.els) {
            el.classList.toggle('is-revealed', i <= level);
            if (el.tagName === 'DETAILS') el.open = i <= level;
        }
    });
}
