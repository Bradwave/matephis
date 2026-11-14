/**
 * Sets diagram configuration: known keys and validation.
 *
 * Keys that later phases implement produce a warning ("not implemented yet")
 * instead of being silently ignored, as in the physics engine.
 */
import { suggest } from '../../matephis-physics-src/core/config.js';

export const ROOT_KEYS = [
    "sets", "maps", "show", "highlights", "probe", "params", "animate", "controls", "layout", "hover",
    "reorder", "width", "fullWidth", "cssWidth", "align", "border", "padding", "marginBottom", "marginLeft",
    "marginRight", "theme", "title", "caption", "ariaLabel", "fontSize", "labelHalo", "showSliders",
    "sliderBorder", "spacing", "mapLabels", "height", "dynagraph", "plot", "iterate", "sync",
];

/** Root keys of later phases. */
export const PLANNED_ROOT_KEYS = [
    "venn", "relations", "partition", "cd", "steps", "enumerate", "diagonal", "order",
];

export const SET_KEYS = ["id", "label", "elements", "interval", "rect", "disk", "color", "window", "order", "labelSide", "endpoints"];
export const PLANNED_SET_KEYS = ["at", "subsets", "shape"];
export const MAP_KEYS = [
    "id", "label", "from", "to", "pairs", "expr", "piecewise", "compose", "inverse", "samples", "color", "image",
    "claims", "hidden", "route", "dash", "bend", "arrows", "iterate",
];
export const PLANNED_MAP_KEYS = ["preset", "sequence"];
export const HIGHLIGHT_KEYS = ["id", "of", "set", "elements", "interval", "color", "label", "hidden", "fill"];
export const PROBE_KEYS = ["map", "at", "drag", "label", "color", "showValue", "trace"];
/** An orbit, step by step ("iterate" at the root). */
export const ITERATE_KEYS = ["map", "start", "steps", "step", "color", "label", "showValue"];
export const DYNAGRAPH_KEYS = ["scale", "ticks", "arrows"];
/** Keys of "plot" read by the sets engine; any other key goes to the plot itself. */
export const PLOT_KEYS = ["maps", "position", "probe", "construction", "identity"];

const didYouMean = (word, candidates) => {
    const s = suggest(word, candidates);
    return s ? ` (did you mean '${s}'?)` : '';
};

function checkKeys(obj, keys, planned, where, warnings) {
    for (const key in obj) {
        if (keys.includes(key)) continue;
        if (planned.includes(key)) warnings.push(`${where}: option '${key}' is not implemented yet and is ignored`);
        else warnings.push(`${where}: unknown option '${key}'${didYouMean(key, [...keys, ...planned])}`);
    }
}

/**
 * Validates a configuration. Returns a list of warning strings (the model
 * adds its own about sets and maps that do not fit together).
 */
export function validateConfig(config) {
    const warnings = [];
    for (const key in config) {
        if (ROOT_KEYS.includes(key)) continue;
        if (PLANNED_ROOT_KEYS.includes(key)) warnings.push(`Option '${key}' is not implemented yet and is ignored`);
        else warnings.push(`Unknown global option: '${key}'${didYouMean(key, [...ROOT_KEYS, ...PLANNED_ROOT_KEYS])}`);
    }
    if (config.layout !== undefined && !['row', 'column'].includes(config.layout)) {
        warnings.push(`layout: expected "row" or "column", got '${config.layout}'`);
    }
    if (config.sets !== undefined && !Array.isArray(config.sets)) warnings.push('"sets" must be an array');
    if (config.maps !== undefined && !Array.isArray(config.maps)) warnings.push('"maps" must be an array');
    (Array.isArray(config.sets) ? config.sets : []).forEach((s, i) => {
        if (s && typeof s === 'object') checkKeys(s, SET_KEYS, PLANNED_SET_KEYS, `set '${s.id !== undefined ? s.id : i}'`, warnings);
    });
    (Array.isArray(config.maps) ? config.maps : []).forEach((m, i) => {
        if (m && typeof m === 'object') checkKeys(m, MAP_KEYS, PLANNED_MAP_KEYS, `map '${m.id !== undefined ? m.id : i}'`, warnings);
    });
    (Array.isArray(config.highlights) ? config.highlights : []).forEach((h, i) => {
        if (h && typeof h === 'object') checkKeys(h, HIGHLIGHT_KEYS, [], `highlights[${i}]`, warnings);
    });
    if (config.dynagraph !== undefined && config.dynagraph !== true && config.dynagraph !== false) {
        if (config.dynagraph && typeof config.dynagraph === 'object') checkKeys(config.dynagraph, DYNAGRAPH_KEYS, [], 'dynagraph', warnings);
        else warnings.push('"dynagraph" must be true or an object like { "ticks": 1 }');
    }
    if (config.dynagraph && config.layout === 'row') warnings.push('a dynagraph is drawn with its lines one under the other; "layout": "row" is ignored');
    if (config.plot !== undefined && (!config.plot || typeof config.plot !== 'object')) warnings.push('"plot" must be an object like { "maps": ["f"] }');
    if (config.plot && config.plot.position !== undefined && !['right', 'below'].includes(config.plot.position)) {
        warnings.push(`plot: "position" must be "right" or "below", got '${config.plot.position}'`);
    }
    if (config.iterate !== undefined) {
        const its = Array.isArray(config.iterate) ? config.iterate : [config.iterate];
        its.forEach((it, i) => {
            if (it && typeof it === 'object') checkKeys(it, ITERATE_KEYS, [], `iterate[${i}]`, warnings);
            else warnings.push(`iterate[${i}]: expected an object like { "map": "f", "start": "a", "steps": 5 }`);
        });
    }
    if (config.sync !== undefined && (typeof config.sync !== 'string' || !config.sync)) {
        warnings.push('"sync" must be a name, the same on every block to link, like "es1"');
    }
    if (config.probe !== undefined) {
        const probes = Array.isArray(config.probe) ? config.probe : [config.probe];
        probes.forEach((p, i) => { if (p && typeof p === 'object') checkKeys(p, PROBE_KEYS, [], `probe[${i}]`, warnings); });
    }
    return warnings;
}
