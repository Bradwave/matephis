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
    "sliderBorder", "spacing", "mapLabels", "height",
];

/** Root keys of later phases. */
export const PLANNED_ROOT_KEYS = [
    "venn", "relations", "partition", "iterate", "dynagraph", "cd", "steps", "enumerate", "diagonal", "order",
];

export const SET_KEYS = ["id", "label", "elements", "interval", "rect", "disk", "color", "window", "order", "labelSide", "endpoints"];
export const PLANNED_SET_KEYS = ["at", "subsets", "shape"];
export const MAP_KEYS = ["id", "label", "from", "to", "pairs", "expr", "compose", "samples", "color", "image", "claims", "hidden", "route", "dash", "bend", "arrows"];
export const PLANNED_MAP_KEYS = ["preset", "sequence", "iterate", "inverse", "piecewise"];
export const HIGHLIGHT_KEYS = ["id", "of", "set", "elements", "interval", "color", "label", "hidden", "fill"];
export const PROBE_KEYS = ["map", "at", "drag", "label", "color", "showValue"];

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
    if (config.probe !== undefined) {
        const probes = Array.isArray(config.probe) ? config.probe : [config.probe];
        probes.forEach((p, i) => { if (p && typeof p === 'object') checkKeys(p, PROBE_KEYS, [], `probe[${i}]`, warnings); });
    }
    return warnings;
}
