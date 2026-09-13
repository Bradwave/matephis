/**
 * Matephis Plot Configuration & Palettes
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
    "derivativeTitle", "derivativeAutoY", "hideFunctions", "derivativeYScale", "showDerivative", "traceDerivative", "addDerivativePlot", "showDerivativeFunction", "showToolbar", "showDerivativeToolbar", "showPoints", "derivativeToggle", "derivativeYLim", "showDerivativePoint",
    "animate", "isDerivativePlot", "slopeUnitMeasure",
    "polar", "polarUnits", "xScale", "yScale",
    "complexMode", "draggablePoints", "equalAspect"
];

export const VALID_DATA_KEYS = [
    "type", "fn", "implicit", "points", "x", "vector", "angle", "range", "domain",
    "color", "width", "strokeWidth", "dash", "opacity", "fillColor", "strokeColor", "radius",
    "label", "labelAt", "labelOffset", "labelAnchor", "derivativeColor",
    "smoothness", "sampling", "showPoints", "pointColor", "pointRadius", "pointOpacity", "pointStroke", "pointStrokeWidth", "param",
    "freeCoordinates", "name", "from", "to", "arrow" // interpolation
];

export function createPalettes() {
    const palettes = {
        black: ["#000000", "#444444", "#6e6e6e", "#929292", "#b6b6b6", "#dadada"],
        red: ["#B01A00", "#8b2e1bff", "#ce452aff", "#e64b2cff", "#fd5a35ff", "#fa7a5d"],
        sunburst: ["#4f000b", "#720026", "#ce4257", "#ff7f51", "#ff9b54"],
        coastal: ["#2b2d42", "#2b2d42", "#edf2f4", "#ef233c", "#d90429"],
        seaside: ["#2B3A67", "#496A81", "#66999B", "#B3AF8F", "#FFC482"],
        default: ["#007bff", "#dc3545", "#28a745", "#fd7e14", "#6f42c1"],
        summer: ["#B01A00", "#2e4a9e", "#257fbe", "#0dacc2", "#d1b854", "#ff912a", "#4ebf62"]
    };

    // Create granular color accessors (e.g., red1, red2, ...)
    Object.keys(palettes).forEach(key => {
        if (Array.isArray(palettes[key])) {
            palettes[key].forEach((c, i) => {
                palettes[`${key}${i + 1}`] = c;
            });
        }
    });

    return palettes;
}

export function validateConfig(config) {
    const warnings = [];

    // 1. Root Keys
    for (let key in config) {
        if (!VALID_ROOT_KEYS.includes(key)) {
            warnings.push(`Unknown global option: '${key}'`);
        }
    }

    // 2. Data Items
    if (config.data && Array.isArray(config.data)) {
        config.data.forEach((item, i) => {
            for (let key in item) {
                if (!VALID_DATA_KEYS.includes(key)) {
                    warnings.push(`Unknown data option in item ${i + 1}: '${key}'`);
                }
            }
            if (!item.fn && !item.implicit && !item.points && item.x === undefined && !item.vector && item.type !== 'vector' && !item.angle) {
                warnings.push(`Data item ${i + 1} has no content (missing 'fn', 'points', 'implicit', 'x', 'vector', or 'angle').`);
            }
        });
    }

    return warnings;
}
