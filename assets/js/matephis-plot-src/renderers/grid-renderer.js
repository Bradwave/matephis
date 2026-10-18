/**
 * Grid, Axes, Tick Numbers and Axis Labels (mixed into MatephisPlot)
 */
import { SVG_NS } from './svg-factory.js';

const MAX_LINES = 2000;

/** "Nice" step (1, 2, 5 x 10^k) giving about one line every 100px. */
export function niceStep(range, pixelSize, minPxPerStep = 100) {
    const targetSteps = Math.max(2, pixelSize / minPxPerStep);
    const rawStep = range / targetSteps;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const n = rawStep / mag;
    if (n < 1.5) return mag;
    if (n < 3) return 2 * mag;
    if (n < 7) return 5 * mag;
    return 10 * mag;
}

/** Tick label for multiples of π: π, -π, 2π, π/2, 3π/4 ... */
export function formatPi(val) {
    const v = val / Math.PI;
    if (Math.abs(v) < 1e-6) return "0";
    if (Math.abs(v - 1) < 1e-6) return "π";
    if (Math.abs(v + 1) < 1e-6) return "-π";
    if (Math.abs(v - Math.round(v)) < 1e-6) return Math.round(v) + "π";
    for (const den of [2, 3, 4, 6, 8, 12]) {
        const num = v * den;
        if (Math.abs(num - Math.round(num)) < 1e-6) {
            const n = Math.round(num);
            return (n === 1 ? "" : n === -1 ? "-" : n) + "π/" + den;
        }
    }
    return v.toFixed(2) + "π";
}

/** Tick label with as many decimals as the step needs. */
export function formatTick(val, isPi, step) {
    if (isPi) return formatPi(val);
    let s = step || 1, p = 0, e = 1;
    while (Math.abs(Math.round(s * e) / e - s) > 1e-9 && p < 10) { e *= 10; p++; }
    const r = parseFloat(val.toFixed(p));
    return String(Object.is(r, -0) ? 0 : r);
}

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

/** Log-axis label: plain numbers in a readable range, 10ⁿ otherwise. */
export function formatLogTick(v) {
    const k = Math.round(Math.log10(v));
    if (k >= -3 && k <= 4) return String(parseFloat(v.toPrecision(6)));
    return '10' + String(k).split('').map(c => SUP[c]).join('');
}

/** Keeps every k-th decade label so labels stay at least `minPx` apart. */
function thinDecades(values, map, minPx) {
    if (values.length < 2) return values;
    const spacing = Math.abs(map(values[1]) - map(values[0])) || 1;
    const stride = Math.max(1, Math.ceil(minPx / spacing));
    // Anchor the stride on 10^0 so 1 is kept when visible
    return values.filter(v => Math.round(Math.log10(v)) % stride === 0);
}

/** Integer-indexed multiples of `step` inside [min, max] (no float drift). */
function multiples(min, max, step, pad = 0) {
    if (!(step > 0) || !isFinite(min) || !isFinite(max)) return [];
    const k0 = Math.ceil((min - pad) / step - 1e-9);
    const k1 = Math.floor((max + pad) / step + 1e-9);
    if (k1 - k0 > MAX_LINES) return [];
    const out = [];
    for (let k = k0; k <= k1; k++) out.push(k * step);
    return out;
}

/** Decades (major) and 2..9 multiples (minor) inside [min, max] for log axes. */
function logTicks(min, max) {
    const major = [], minor = [];
    const k0 = Math.floor(Math.log10(min)), k1 = Math.ceil(Math.log10(max));
    if (k1 - k0 > 300) return { major, minor };
    for (let k = k0; k <= k1; k++) {
        const base = Math.pow(10, k);
        if (base >= min * (1 - 1e-9) && base <= max * (1 + 1e-9)) major.push(base);
        for (let m = 2; m <= 9; m++) {
            const v = m * base;
            if (v >= min && v <= max) minor.push(v);
        }
    }
    return { major, minor };
}

export const GridMixin = {
    /** Parses a step option: number, or string such as "pi/2". */
    _parseStep(val, def) {
        if (val === undefined || val === null) return { val: def, isPi: false };
        if (typeof val === 'number') return { val: val > 0 ? val : def, isPi: false };
        const isPi = /pi|π/i.test(val);
        const num = this._eval(val, 'step');
        return { val: typeof num === 'number' && num > 0 ? num : def, isPi };
    },

    _drawGridAndAxes(cs) {
        const { padL, padR, padT, padB } = this;
        const { xMin, xMax, yMin, yMax, isXLog, isYLog, mapX, mapY } = cs;
        const W = this.width, H = this.height;
        const right = W - padR, bottom = H - padB;
        const cfg = this.config;

        const isDark = this._isDark();
        const gridColor = isDark ? "#404040" : "#808080";
        const axisColor = isDark ? "#e2e8f0" : "#333";
        this._axisColor = axisColor;

        this.gridGroup.setAttribute("opacity", cfg.gridOpacity !== undefined ? cfg.gridOpacity : 0.8);
        const mainOpacity = cfg.gridOpacity !== undefined ? cfg.gridOpacity : 0.5;
        this.secondaryGridGroup.setAttribute("opacity", cfg.secondaryGridOpacity !== undefined ? cfg.secondaryGridOpacity : mainOpacity * 0.5);

        const xStepObj = this._parseStep(cfg.xStep, niceStep(xMax - xMin, cs.plotW));
        const yStepObj = this._parseStep(cfg.yStep, niceStep(yMax - yMin, cs.plotH));
        const xNumStepObj = cfg.xNumberStep !== undefined ? this._parseStep(cfg.xNumberStep, xStepObj.val) : xStepObj;
        const yNumStepObj = cfg.yNumberStep !== undefined ? this._parseStep(cfg.yNumberStep, yStepObj.val) : yStepObj;
        const xStep = xStepObj.val, yStep = yStepObj.val;
        const showGrid = cfg.grid !== false && cfg.showGrid !== false;
        const showSec = cfg.showSecondaryGrid !== false && showGrid;
        const numberSize = this._getConfigSize('numberSize');

        // Axis positions (log axes cross at 1 when visible, else at the border)
        const x0 = isXLog ? ((xMin <= 1 && xMax >= 1) ? mapX(1) : padL) : mapX(0);
        const y0 = isYLog ? ((yMin <= 1 && yMax >= 1) ? mapY(1) : bottom) : mapY(0);

        if (cfg.polar === true) {
            this._drawPolarGrid(cs, xStep, gridColor, numberSize);
        } else {
            // ---- Vertical lines (x) ----
            if (isXLog) {
                const { major, minor } = logTicks(xMin, xMax);
                if (showSec) minor.forEach(x => this._line(mapX(x), padT, mapX(x), bottom, gridColor, 1.5, "", this.secondaryGridGroup));
                major.forEach(x => {
                    const px = mapX(x);
                    if (showGrid) this._line(px, padT, px, bottom, gridColor, 1.5, "", this.gridGroup);
                    if (cfg.showXTicks === true) this._xTick(px, y0, axisColor);
                });
            } else {
                if (showSec) {
                    const sx = this._parseStep(cfg.xStepSecondary, xStep / 5).val;
                    multiples(xMin, xMax, sx).forEach(x => {
                        const px = mapX(x);
                        if (px >= padL && px <= right) this._line(px, padT, px, bottom, gridColor, 1.5, "", this.secondaryGridGroup);
                    });
                }
                multiples(xMin, xMax, xStep).forEach(x => {
                    const px = mapX(x);
                    if (px < padL || px > right) return;
                    if (showGrid) this._line(px, padT, px, bottom, gridColor, 1.5, "", this.gridGroup);
                    if (cfg.showXTicks === true && (cfg.boxPlot || Math.abs(x) > 1e-9)) this._xTick(px, y0, axisColor);
                });
            }

            // ---- Horizontal lines (y) ----
            if (isYLog) {
                const { major, minor } = logTicks(yMin, yMax);
                if (showSec) minor.forEach(y => this._line(padL, mapY(y), right, mapY(y), gridColor, 1.5, "", this.secondaryGridGroup));
                major.forEach(y => {
                    const py = mapY(y);
                    if (showGrid) this._line(padL, py, right, py, gridColor, 1.5, "", this.gridGroup);
                    if (cfg.showYTicks === true) this._yTick(py, x0, axisColor);
                });
            } else {
                if (showSec) {
                    const sy = this._parseStep(cfg.yStepSecondary, yStep / 5).val;
                    multiples(yMin, yMax, sy).forEach(y => {
                        const py = mapY(y);
                        if (py >= padT && py <= bottom) this._line(padL, py, right, py, gridColor, 1.5, "", this.secondaryGridGroup);
                    });
                }
                multiples(yMin, yMax, yStep).forEach(y => {
                    const py = mapY(y);
                    if (py < padT || py > bottom) return;
                    if (showGrid) this._line(padL, py, right, py, gridColor, 1.5, "", this.gridGroup);
                    if (cfg.showYTicks === true && (cfg.boxPlot || Math.abs(y) > 1e-9)) this._yTick(py, x0, axisColor);
                });
            }

            this._drawXNumbers(cs, xNumStepObj, y0, numberSize);
            this._drawYNumbers(cs, yNumStepObj, x0, numberSize);
        }

        // Origin "0" (shared by both axes)
        if (!cfg.boxPlot && !isXLog && !isYLog && cfg.polar !== true &&
            xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0 &&
            (cfg.showXNumbers !== false || cfg.showYNumbers !== false)) {
            this._text(mapX(0) - 5, mapY(0) + 15, "0", "end", "auto", "#666", "normal", "normal", this.numbersGroup, numberSize);
        }

        this._drawAxes(cs, x0, y0, axisColor);
        this._drawAxisLabels(x0, y0, axisColor);
    },

    _xTick(px, axisY, color) {
        const { padT } = this;
        const bottom = this.height - this.padB;
        if (this.config.boxPlot) {
            this._line(px, bottom, px, bottom - 5, color, 2, "", this.axesGroup);
            if (!this.config.boxPlotPartial) this._line(px, padT, px, padT + 5, color, 2, "", this.axesGroup);
        } else {
            const dir = axisY >= bottom - 0.5 ? -5 : 5;
            this._line(px, axisY, px, axisY + dir, color, 2, "", this.axesGroup);
        }
    },

    _yTick(py, axisX, color) {
        const { padL } = this;
        const right = this.width - this.padR;
        if (this.config.boxPlot) {
            this._line(padL, py, padL + 5, py, color, 2, "", this.axesGroup);
            if (!this.config.boxPlotPartial) this._line(right, py, right - 5, py, color, 2, "", this.axesGroup);
        } else {
            const dir = axisX <= padL + 0.5 ? 5 : -5;
            this._line(axisX + dir, py, axisX, py, color, 2, "", this.axesGroup);
        }
    },

    _drawXNumbers(cs, stepObj, axisY, baseFs) {
        const cfg = this.config;
        if (cfg.showXNumbers === false) return;
        const { padL, padT } = this;
        const right = this.width - this.padR, bottom = this.height - this.padB;
        const { xMin, xMax, isXLog, mapX } = cs;

        const xVals = isXLog
            ? thinDecades(logTicks(xMin, xMax).major, mapX, baseFs * 3.2)
            : multiples(xMin, xMax, stepObj.val, stepObj.val * 0.5).filter(x => cfg.boxPlot || Math.abs(x) >= 1e-9);

        let numY = axisY + 15;
        let baseline = "auto";
        let sticky = false;
        if (cfg.boxPlot) {
            if (cfg.boxNumbersInside) { numY = bottom - 2; sticky = true; }
            else { numY = bottom + 12; baseline = "hanging"; }
        } else if (axisY < padT) {
            numY = padT + 5; baseline = "hanging"; sticky = true;
        } else if (axisY > bottom) {
            numY = bottom - 5; sticky = true;
        }

        const fs = sticky ? baseFs * 0.85 : baseFs;
        const col = sticky ? "#999" : "#666";
        xVals.forEach(x => {
            let px = mapX(x);
            let align = "middle";
            if (Math.abs(px - padL) < 4) { px = padL; align = "start"; }
            else if (Math.abs(px - right) < 4) { px = right; align = "end"; }
            if (px < padL || px > right) return;
            // Centre the digits of negative numbers, not the minus sign
            if (x < -1e-9 && align === "middle") px -= fs * 0.3;
            const label = isXLog ? formatLogTick(x) : formatTick(x, stepObj.isPi, stepObj.val);
            this._text(px, numY, label, align, baseline, col, "normal", "normal", this.numbersGroup, fs);
        });
    },

    _drawYNumbers(cs, stepObj, axisX, baseFs) {
        const cfg = this.config;
        if (cfg.showYNumbers === false) return;
        const { padL, padT } = this;
        const right = this.width - this.padR, bottom = this.height - this.padB;
        const { yMin, yMax, isYLog, mapY } = cs;

        const yVals = isYLog
            ? thinDecades(logTicks(yMin, yMax).major, mapY, baseFs * 1.6)
            : multiples(yMin, yMax, stepObj.val, stepObj.val * 0.5).filter(y => cfg.boxPlot || Math.abs(y) >= 1e-9);

        let numX = axisX - 5;
        let align = "end";
        let sticky = false;
        if (cfg.boxPlot) {
            if (cfg.boxNumbersInside) { numX = padL + 4; align = "start"; sticky = true; }
            else { numX = padL - 8; }
        } else if (axisX < padL) {
            numX = padL + 5; align = "start"; sticky = true;
        } else if (axisX > right) {
            numX = right - 5; sticky = true;
        }

        const fs = sticky ? baseFs * 0.85 : baseFs;
        const col = sticky ? "#999" : "#666";
        yVals.forEach(y => {
            let py = mapY(y);
            let baseline = "middle";
            if (Math.abs(py - bottom) < 2) { py = bottom - 5; baseline = "auto"; }
            else if (Math.abs(py - padT) < 2) { py = padT + 5; }
            if (py < padT || py > bottom) return;
            const label = isYLog ? formatLogTick(y) : formatTick(y, stepObj.isPi, stepObj.val);
            this._text(numX, py, label, align, baseline, col, "normal", "normal", this.numbersGroup, fs);
        });
    },

    _drawPolarGrid(cs, rStepDefault, gridColor, numberSize) {
        const cfg = this.config;
        const { xMin, xMax, yMin, yMax, mapX, mapY } = cs;
        const { padL, padT } = this;
        const right = this.width - this.padR, bottom = this.height - this.padB;
        const isDeg = cfg.polarUnits === "deg";
        const rStep = this._parseStep(cfg.polarStep, rStepDefault).val;
        const cx = mapX(0), cy = mapY(0);
        // Farthest visible corner from the origin
        const maxR = Math.hypot(Math.max(Math.abs(xMin), Math.abs(xMax)), Math.max(Math.abs(yMin), Math.abs(yMax)));

        multiples(rStep, maxR, rStep).forEach(r => {
            // Ellipse, so circles stay correct when the axes are not equally scaled
            const e = document.createElementNS(SVG_NS, "ellipse");
            e.setAttribute("cx", cx); e.setAttribute("cy", cy);
            e.setAttribute("rx", r * cs.scaleX); e.setAttribute("ry", r * cs.scaleY);
            e.setAttribute("fill", "none"); e.setAttribute("stroke", gridColor); e.setAttribute("stroke-width", 1.5);
            e.setAttribute("class", "matephis-plot-grid-line");
            this.gridGroup.appendChild(e);

            if (cfg.showXNumbers !== false) {
                const px = mapX(r);
                if (px >= padL && px <= right && cy >= padT && cy <= bottom) {
                    this._text(px, cy + 12, formatTick(r, false, rStep), "middle", "hanging", "#666", "normal", "normal", this.numbersGroup, numberSize);
                }
            }
        });

        const steps = 12;
        for (let k = 0; k < steps; k++) {
            const rad = (k / steps) * 2 * Math.PI;
            const ex = mapX(maxR * Math.cos(rad)), ey = mapY(maxR * Math.sin(rad));
            this._line(cx, cy, ex, ey, gridColor, 1, "4,4", this.gridGroup);

            // Label where the ray leaves the visible box
            let lx = maxR * Math.cos(rad), ly = maxR * Math.sin(rad);
            let scale = 1;
            if (lx > xMax) scale = Math.min(scale, xMax / lx);
            if (lx < xMin) scale = Math.min(scale, xMin / lx);
            if (ly > yMax) scale = Math.min(scale, yMax / ly);
            if (ly < yMin) scale = Math.min(scale, yMin / ly);
            if (!(scale > 0)) continue;
            const px = mapX(lx * scale) - Math.cos(rad) * 14;
            const py = mapY(ly * scale) + Math.sin(rad) * 10;

            let align = "middle", baseline = "middle";
            if (Math.abs(Math.cos(rad)) > 0.1) align = Math.cos(rad) > 0 ? "end" : "start";
            if (Math.abs(Math.sin(rad)) > 0.1) baseline = Math.sin(rad) > 0 ? "hanging" : "auto";

            const label = isDeg ? `${Math.round(k * 360 / steps)}°` : `${k === 0 ? "0" : formatPi(rad)} rad`;
            if (px >= padL && px <= right && py >= padT && py <= bottom) {
                this._text(px, py, label, align, baseline, "#666", "normal", "normal", this.numbersGroup, numberSize);
            }
        }
    },

    _drawAxes(cs, x0, y0, axisColor) {
        const cfg = this.config;
        const { padL, padT } = this;
        const right = this.width - this.padR, bottom = this.height - this.padB;

        if (cfg.boxPlot) {
            this._line(padL, bottom, right, bottom, axisColor, 2, "", this.axesGroup);
            this._line(padL, padT, padL, bottom, axisColor, 2, "", this.axesGroup);
            if (!cfg.boxPlotPartial) {
                this._line(padL, padT, right, padT, axisColor, 2, "", this.axesGroup);
                this._line(right, padT, right, bottom, axisColor, 2, "", this.axesGroup);
            }
            return;
        }

        const showY = cfg.showYAxis !== false && x0 >= padL && x0 <= right;
        const showX = cfg.showXAxis !== false && y0 >= padT && y0 <= bottom;
        if (showY) this._line(x0, padT, x0, bottom, axisColor, 2, "", this.axesGroup);
        if (showX) this._line(padL, y0, right, y0, axisColor, 2, "", this.axesGroup);

        if (cfg.axisArrows) {
            const tri = (pts) => {
                const p = document.createElementNS(SVG_NS, "polygon");
                p.setAttribute("points", pts);
                p.setAttribute("fill", axisColor);
                p.setAttribute("class", "matephis-plot-arrow");
                this.axesGroup.appendChild(p);
            };
            if (showX) { const ax = right + 5; tri(`${ax},${y0} ${ax - 8},${y0 - 4} ${ax - 8},${y0 + 4}`); }
            if (showY) { const ay = padT - 5; tri(`${x0},${ay} ${x0 - 4},${ay + 8} ${x0 + 4},${ay + 8}`); }
        }
    },

    _drawAxisLabels(x0, y0, axisColor) {
        const cfg = this.config;
        if (!cfg.axisLabels && !cfg.axisUnitMeasures && !cfg.isDerivativePlot) return;
        const { padL, padT } = this;
        const right = this.width - this.padR, bottom = this.height - this.padB;

        const lblSize = this._getConfigSize('labelSize');
        const weight = cfg.axisLabelWeight || "bold";
        const style = cfg.axisLabelStyle || "normal";
        const offset = cfg.axisLabelOffset || 5;

        const xL = cfg.axisLabels ? (cfg.axisLabels[0] || "") : "";
        let yL = cfg.axisLabels ? (cfg.axisLabels[1] || "") : "";
        const xU = cfg.axisUnitMeasures ? (cfg.axisUnitMeasures[0] || "") : "";
        let yU = cfg.axisUnitMeasures ? (cfg.axisUnitMeasures[1] || "") : "";

        if (cfg.isDerivativePlot) {
            if (cfg.slopeLabel) yL = cfg.slopeLabel;
            else if (!cfg.axisLabels) yL = "y'";
            if (cfg.slopeUnitMeasure) yU = cfg.slopeUnitMeasure;
        }

        const xText = xU ? (xL ? `${xL} (${xU})` : xU) : xL;
        const yText = yU ? (yL ? `${yL} (${yU})` : yU) : yL;

        const put = (x, y, text, anchor, baseline) => {
            if (!text) return;
            if (text.includes('$')) this._renderMathJax(text, x, y, lblSize, axisColor, anchor, baseline === 'middle' ? 'middle' : 'auto', this.axesGroup);
            else this._text(x, y, text, anchor, baseline, axisColor, weight, style, this.axesGroup, lblSize, false);
        };

        if (cfg.boxPlot) {
            put(right + 10, bottom, xText, "start", "middle");
            put(padL, padT - offset - 10, yText, "start", "auto");
        } else {
            // Keep labels attached to the axes, clamped to the plot box when an axis is off-screen
            const ly = Math.min(bottom, Math.max(padT, y0));
            const lx = Math.min(right, Math.max(padL, x0));
            put(right + offset, ly, xText, "start", "middle");
            put(lx, padT - offset, yText, "middle", "auto");
        }
    },
};
