/**
 * Matephis Plot Configuration, Palettes & Validation
 */

export const VALID_ROOT_KEYS = [
    "width", "height", "aspectRatio", "cssWidth", "fullWidth", "align",
    "marginLeft", "marginRight", "border", "sliderBorder",
    "xlim", "ylim", "interactive", "theme", "legend", "legendWidth", "legendPosition",
    "padding", "marginBottom", "grid", "gridOpacity", "axisArrows", "axisLabels",
    "xStep", "yStep", "xStepSecondary", "yStepSecondary", "showSecondaryGrid", "showGrid",
    "xNumberStep", "yNumberStep", "showXNumbers", "showYNumbers",
    "showXAxis", "showYAxis",
    "showXTicks", "showYTicks", "secondaryGridOpacity",
    "sampleStep", "fontSize", "renderOrder", "params", "showSliders", "data", "labelWeight",
    "numberSize", "labelSize", "legendSize",
    "axisLabelWeight", "axisLabelStyle", "labelStyle", "axisLabelOffset", "axisUnitMeasures",
    "boxPlot", "boxPlotPartial", "constrainView", "boxNumbersInside",
    "pointSelection", "slopeSelection", "tangentSelection", "slopeLabel", "specifySlope", "showCoordinates",
    "derivativeTitle", "derivativeAutoY", "hideFunctions", "derivativeYScale", "showDerivative", "traceDerivative",
    "addDerivativePlot", "showDerivativeFunction", "showToolbar", "showDerivativeToolbar", "showPoints",
    "derivativeToggle", "derivativeYLim", "showDerivativePoint", "derivativeAspectRatio",
    "animate", "isDerivativePlot", "slopeUnitMeasure",
    "polar", "polarUnits", "polarStep", "xScale", "yScale",
    "complexMode", "draggablePoints", "equalAspect",
    "selectionColor", "selectionRadius", "selectionOutlineColor", "selectionOutlineWidth",
    "snapToPoints", "pointSelectionIcon", "slopeSelectionIcon", "tangentSelectionIcon",
    "title", "caption", "ariaLabel", "download", "sampleTolerance", "implicitResolution", "labelHalo"
];

export const VALID_DATA_KEYS = [
    "type", "fn", "implicit", "points", "x", "vector", "angle", "range", "domain",
    "parametric", "r",
    "color", "width", "strokeWidth", "dash", "opacity", "fillColor", "strokeColor", "radius",
    "label", "labelAt", "labelOffset", "labelAnchor", "derivativeColor",
    "smoothness", "sampling", "showPoints", "pointColor", "pointRadius", "pointOpacity", "pointStroke", "pointStrokeWidth", "param",
    "freeCoordinates", "name", "from", "to", "arrow", "arrowSize",
    "components", "componentColor", "draggable", "snap", "showValue", "rightAngle",
    "fill", "fillOpacity", "id"
];

/** Keys of a multi-plot group block ({ "plots": [...] }). */
export const VALID_GROUP_KEYS = [
    "plots", "layout", "columns", "mobileColumns", "labels", "gap", "shared", "align", "cssWidth", "fullWidth",
    "marginBottom", "caption"
];

const LIGHT_PALETTES = {
    black: ["#000000", "#444444", "#6e6e6e", "#929292", "#b6b6b6", "#dadada"],
    red: ["#B01A00", "#8b2e1bff", "#ce452aff", "#e64b2cff", "#fd5a35ff", "#fa7a5d"],
    sunburst: ["#4f000b", "#720026", "#ce4257", "#ff7f51", "#ff9b54"],
    coastal: ["#2b2d42", "#2b2d42", "#edf2f4", "#ef233c", "#d90429"],
    seaside: ["#2B3A67", "#496A81", "#66999B", "#B3AF8F", "#FFC482"],
    default: ["#007bff", "#dc3545", "#28a745", "#fd7e14", "#6f42c1"],
    summer: ["#B01A00", "#2e4a9e", "#257fbe", "#0dacc2", "#d1b854", "#ff912a", "#4ebf62"]
};

const DARK_PALETTES = {
    black: ["#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155"],
    red: ["#ff523d", "#f87171", "#fb7185", "#fda4af", "#ff6b6b", "#ffa39e"],
    sunburst: ["#ff7f51", "#ff9b54", "#ce4257", "#f472b6", "#fb923c"],
    coastal: ["#60a5fa", "#38bdf8", "#edf2f4", "#f87171", "#fb7185"],
    seaside: ["#38bdf8", "#67e8f9", "#93c5fd", "#fde047", "#FFC482"],
    default: ["#60a5fa", "#f87171", "#34d399", "#fbbf24", "#c084fc"],
    summer: ["#ff523d", "#60a5fa", "#38bdf8", "#22d3ee", "#fde047", "#fb923c", "#4ade80"]
};

/**
 * Returns palettes plus granular accessors (red1, red2, ...).
 * @param {boolean} [isDark=false]
 */
export function createPalettes(isDark = false) {
    const base = isDark ? DARK_PALETTES : LIGHT_PALETTES;
    const palettes = {};
    Object.keys(base).forEach(key => {
        palettes[key] = base[key].slice();
        base[key].forEach((c, i) => { palettes[`${key}${i + 1}`] = c; });
    });
    return palettes;
}

/**
 * Validates a plot configuration. Returns a list of warning strings.
 * @param {object} config
 * @param {object} [palettes] - used to detect misspelled palette colors ("sumemr1")
 */
export function validateConfig(config, palettes = null) {
    const warnings = [];

    for (let key in config) {
        if (!VALID_ROOT_KEYS.includes(key)) warnings.push(`Unknown global option: '${key}'`);
    }

    const checkColor = (val, where) => {
        if (!palettes || typeof val !== 'string') return;
        // Looks like a palette reference (letters + optional number) but is neither a palette nor a CSS color name
        if (/^[a-z]+\d+$/i.test(val) && !palettes[val]) {
            warnings.push(`Unknown palette color '${val}' in ${where}`);
        }
    };

    if (config.data && Array.isArray(config.data)) {
        config.data.forEach((item, i) => {
            for (let key in item) {
                if (!VALID_DATA_KEYS.includes(key)) warnings.push(`Unknown data option in item ${i + 1}: '${key}'`);
            }
            const hasContent = item.fn || item.implicit || item.points || item.x !== undefined || item.vector ||
                item.type === 'vector' || item.angle || item.parametric || item.r;
            if (!hasContent) {
                warnings.push(`Data item ${i + 1} has no content (missing 'fn', 'points', 'implicit', 'x', 'vector', 'parametric', 'r' or 'angle').`);
            }
            ['color', 'fillColor', 'strokeColor', 'pointColor', 'pointStroke', 'derivativeColor', 'componentColor']
                .forEach(k => checkColor(item[k], `item ${i + 1} (${k})`));
        });
    }

    return warnings;
}

/** Parses "16:9", "3/2" or a number into a width/height ratio. */
export function parseAspectRatio(val) {
    if (val === undefined || val === null) return null;
    if (typeof val === 'string' && /[:/]/.test(val)) {
        const [w, h] = val.split(/[:/]/).map(parseFloat);
        return w > 0 && h > 0 ? w / h : null;
    }
    const r = parseFloat(val);
    return r > 0 ? r : null;
}

/** Converts a number to a CSS length ("12" -> "12px"), strings pass through. */
export function cssLength(val) {
    return typeof val === 'number' ? `${val}px` : val;
}

/** Lightens dark colors in dark mode so they stay readable. */
export function adaptColorForTheme(color, isDark) {
    if (!color || typeof color !== 'string' || !isDark) return color;
    const c = color.toLowerCase().trim();
    if (c === '#000' || c === '#000000' || c === 'black') return '#e2e8f0';
    let hex = c;
    if (!hex.startsWith('#')) return color;
    hex = hex.slice(1);
    if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
    if (hex.length !== 6 && hex.length !== 8) return color;
    const r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum >= 0.42) return color;

    const rN = r / 255, gN = g / 255, bN = b / 255;
    const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rN) h = (gN - bN) / d + (gN < bN ? 6 : 0);
        else if (max === gN) h = (bN - rN) / d + 2;
        else h = (rN - gN) / d + 4;
        h /= 6;
    }
    const L = Math.max(0.68, l * 2.0);
    const S = Math.min(0.9, Math.max(0.65, s));
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
    const p = 2 * L - q;
    return `rgb(${Math.round(hue2rgb(p, q, h + 1 / 3) * 255)}, ${Math.round(hue2rgb(p, q, h) * 255)}, ${Math.round(hue2rgb(p, q, h - 1 / 3) * 255)})`;
}
