/**
 * Random values for exercises: a param with "random" gets a new value on
 * each load, from a seeded generator, so a variant can be seen again.
 *
 *   "params": { "m": { "min": 1, "max": 5, "step": 0.5, "random": true } }
 *   "random": [2, 4]          a narrower range (slider units)
 *   "random": [1, 2, 5, 10]   one of these values (any length but two)
 *
 * The seed: "seed" in the scene, else ?seed=N in the address (the same for
 * everyone who opens that link: each scene of the page gets its own variant
 * from it), else a random one. It is shown under the scene with a button for
 * new values.
 */

/** Mulberry32: a small, good enough generator for exercise values. */
export function rng(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** A seed from a number and the place of the scene on the page. */
export function mixSeed(seed, index) {
    let h = (seed >>> 0) ^ Math.imul(index + 1, 0x9E3779B1);
    h = Math.imul(h ^ (h >>> 16), 0x85EBCA6B);
    h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35);
    return (h ^ (h >>> 16)) >>> 0;
}

/** The seed in the address (?seed=42), or null. */
export function urlSeed() {
    if (typeof window === 'undefined' || !window.location) return null;
    const m = /[?&]seed=(\d+)/.exec(window.location.search || '');
    return m ? Number(m[1]) : null;
}

const round = (v, step) => Math.round(v / step) * step;

/**
 * A value for each random param (slider units), from the seed.
 * @returns {object} name -> value
 */
export function randomValues(params, seed, warn = () => {}) {
    const next = rng(seed);
    const out = {};
    Object.entries(params || {}).forEach(([name, def]) => {
        if (!def || typeof def !== 'object' || def.random === undefined || def.random === false) return;
        const r = def.random;
        if (Array.isArray(r) && r.length !== 2) {
            if (!r.length || r.some(v => typeof v !== 'number')) { warn(`params ${name} random: a list of numbers`); return; }
            out[name] = r[Math.floor(next() * r.length)];
            return;
        }
        const [lo, hi] = Array.isArray(r) ? r : [def.min, def.max];
        if (typeof lo !== 'number' || typeof hi !== 'number' || !(hi >= lo)) {
            warn(`params ${name} random: needs numeric "min" and "max" (or "random": [from, to])`);
            return;
        }
        const step = typeof def.step === 'number' && def.step > 0 ? def.step : (hi - lo) / 20 || 1;
        const n = Math.floor((hi - lo) / step + 1e-9);
        // A whole number of steps from the start of the range, rounded to the step's digits
        const v = lo + Math.floor(next() * (n + 1)) * step;
        out[name] = Number(round(v, step).toFixed(Math.max(0, -Math.floor(Math.log10(step)) + 2)));
    });
    return out;
}
