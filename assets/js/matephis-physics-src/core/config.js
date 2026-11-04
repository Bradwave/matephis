/**
 * Matephis Physics Configuration & Validation
 *
 * Root keys follow the spec ("Scene root keys"). Keys that are planned but not
 * implemented yet produce a warning instead of being silently ignored.
 */
import { angleParamWarning } from './angles.js';

/** Root keys implemented now. */
export const ROOT_KEYS = [
    "xlim", "ylim", "aspectRatio", "width", "fullWidth", "cssWidth", "align", "border", "padding",
    "marginBottom", "marginLeft", "marginRight", "theme", "title", "caption", "ariaLabel",
    "grid", "axes", "plane", "angleUnit", "g", "params", "animate", "showSliders", "sliderBorder",
    "objects", "debug", "fontSize", "forceScale", "vectorScale", "labelHalo", "applyAt", "controls",
    "time", "state", "ode", "events", "graphs", "readouts", "outOfPlane", "compare",
];

/** Root keys from the spec that later phases implement. */
export const PLANNED_ROOT_KEYS = [
    "styles", "preset", "use",
    "frames", "views", "interactive", "magnitudes", "seed",
];

/** Keys every object accepts. */
export const COMMON_OBJECT_KEYS = [
    "id", "type", "at", "on", "pos", "posUnit", "angle", "label", "labelAt", "labelOffset", "color", "fill",
    "opacity", "dash", "mass", "show", "hidden", "views", "layer", "drag", "follow", "s", "orient", "offset",
];

/** Object and annotation types from the spec's catalogue that later phases implement. */
export const PLANNED_TYPES = [
    "person", "moment", "lever-arm",
];

export const DEFAULT_ASPECT_RATIO = 16 / 9;
export const DEFAULT_G = 9.81;

/** Levenshtein distance, for "did you mean" suggestions. */
function distance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
    }
    return d[a.length][b.length];
}

/** Closest candidate within a small edit distance, or null. */
export function suggest(word, candidates) {
    let best = null, bestD = Infinity;
    const w = String(word).toLowerCase();
    for (const c of candidates) {
        const dd = distance(w, c.toLowerCase());
        if (dd < bestD) { bestD = dd; best = c; }
    }
    return bestD <= Math.max(1, Math.floor(w.length / 3)) ? best : null;
}

const didYouMean = (word, candidates) => {
    const s = suggest(word, candidates);
    return s ? ` (did you mean '${s}'?)` : '';
};

/**
 * Validates a scene configuration. Returns a list of warning strings.
 * @param {object} config
 * @param {object} objectTypes - registry of implemented object types ({ type: { keys } })
 */
export function validateConfig(config, objectTypes = {}) {
    const warnings = [];

    for (const key in config) {
        if (ROOT_KEYS.includes(key)) continue;
        if (PLANNED_ROOT_KEYS.includes(key)) warnings.push(`Option '${key}' is not implemented yet and is ignored`);
        else warnings.push(`Unknown global option: '${key}'${didYouMean(key, [...ROOT_KEYS, ...PLANNED_ROOT_KEYS])}`);
    }

    if (config.angleUnit !== undefined && config.angleUnit !== 'deg' && config.angleUnit !== 'rad') {
        warnings.push(`angleUnit must be "deg" or "rad", not '${config.angleUnit}'`);
    }
    if (config.outOfPlane !== undefined && !['symbols', 'hide', 'note'].includes(config.outOfPlane)) {
        warnings.push(`outOfPlane must be "symbols", "hide" or "note", not '${config.outOfPlane}'`);
    }
    if (config.compare !== undefined && !Array.isArray(config.compare)) {
        warnings.push(`compare must be a list of param sets: [{ "mu": 0 }, { "mu": 0.3 }]`);
    }
    if (config.plane !== undefined && config.plane !== 'vertical' && config.plane !== 'horizontal') {
        warnings.push(`plane must be "vertical" or "horizontal", not '${config.plane}'`);
    }

    if (config.params && typeof config.params === 'object') {
        for (const name in config.params) {
            const w = angleParamWarning(name, config.params[name]);
            if (w) warnings.push(w);
        }
    }

    if (config.objects !== undefined && !Array.isArray(config.objects)) {
        warnings.push(`'objects' must be an array`);
    } else if (Array.isArray(config.objects)) {
        const types = Object.keys(objectTypes);
        const ids = new Set();
        config.objects.forEach((obj, i) => {
            const where = `object ${i + 1}${obj && obj.id ? ` ('${obj.id}')` : ''}`;
            if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
                warnings.push(`${where} is not an object`);
                return;
            }
            if (obj.id !== undefined) {
                if (ids.has(obj.id)) warnings.push(`Duplicate id '${obj.id}' in ${where}`);
                ids.add(obj.id);
            }
            if (!obj.type) {
                warnings.push(`${where} has no 'type'`);
                return;
            }
            const def = objectTypes[obj.type];
            if (!def) {
                if (PLANNED_TYPES.includes(obj.type)) warnings.push(`Object type '${obj.type}' is not implemented yet (${where})`);
                else warnings.push(`Unknown object type '${obj.type}' in ${where}${didYouMean(obj.type, [...types, ...PLANNED_TYPES])}`);
                return;
            }
            const valid = [...COMMON_OBJECT_KEYS, ...(def.keys || [])];
            for (const key in obj) {
                if (!valid.includes(key)) warnings.push(`Unknown option '${key}' in ${where}${didYouMean(key, valid)}`);
            }
        });
    }

    return warnings;
}

/**
 * World window shown when xlim / ylim are missing: 10 m wide from the origin,
 * height from the aspect ratio. With only one of them, the other follows the ratio.
 */
export function defaultLimits(config, ratio) {
    const xlim = Array.isArray(config.xlim) ? config.xlim : null;
    const ylim = Array.isArray(config.ylim) ? config.ylim : null;
    if (xlim && ylim) return { xlim, ylim };
    if (xlim) return { xlim, ylim: [0, (xlim[1] - xlim[0]) / ratio] };
    if (ylim) return { xlim: [0, (ylim[1] - ylim[0]) * ratio], ylim };
    return { xlim: [0, 10], ylim: [0, 10 / ratio] };
}
