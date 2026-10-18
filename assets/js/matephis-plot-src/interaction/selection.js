/**
 * Point / Slope / Tangent Selection (mixed into MatephisPlot)
 */
import { SVG_NS } from '../renderers/svg-factory.js';
import { closestOnPolylines } from '../renderers/curve-sampler.js';

export const SelectionMixin = {
    /**
     * Finds the closest point of any drawn item to screen point (x, y).
     * @param {number} x
     * @param {number} y
     * @param {number} [limitToIndex] - restrict the search to one data item
     * @param {number} [threshold=40] - max distance in px
     */
    _getClosestPointOnGraph(x, y, limitToIndex, threshold = 40) {
        if (!this.plotData || this.plotData.length === 0 || !this.transform) return null;
        const cs = this.transform;
        let minDist = Infinity;
        let match = null;

        // Snapping: near a point's x coordinate, use exactly that x
        let targetX = x;
        if (this.isSnapping && this.config.snapToPoints !== false) {
            targetX = cs.mapX(this._getSnappingX(cs.unmapX(x), 15));
        }
        const snapped = targetX !== x;

        this.plotData.forEach(item => {
            if (limitToIndex !== undefined && item.index !== limitToIndex) return;

            let dist = Infinity, candX = null, candY = null;
            if (item.type === 'point') {
                dist = Math.hypot(x - item.cx, y - item.cy);
                candX = item.cx; candY = item.cy;
            } else {
                if (snapped && item.type === 'fn') {
                    const p = this._getPointAtGraphX(cs.unmapX(targetX), item.index, false);
                    if (p) { candX = p.x; candY = p.y; dist = Math.hypot(x - candX, y - candY); }
                } else if (snapped && item.type === 'interpolation') {
                    const p = this._interpolationAt(item.polyline, cs.unmapX(targetX));
                    if (p) { candX = targetX; candY = cs.mapY(p.valY); dist = Math.hypot(x - candX, y - candY); }
                }
                if (candX === null && item.lines) {
                    const res = closestOnPolylines(item.lines, x, y);
                    if (res) { dist = res.dist; candX = res.x; candY = res.y; }
                }
            }
            if (candX === null || !(dist < threshold)) return;

            // Points win over curves when the distances are comparable
            let replace = false;
            if (dist < minDist) {
                replace = !(match && match.type === 'point' && item.type !== 'point' && (minDist - dist) < 15);
            } else if (match && match.type !== 'point' && item.type === 'point' && (dist - minDist) < 15) {
                replace = true;
            }
            if (replace) {
                minDist = dist;
                match = { ...item, x: candX, y: candY, dist };
                delete match.valX; delete match.valY;
                if (item.type === 'point') { match.valX = item.valX; match.valY = item.valY; }
            }
        });
        return match;
    },

    /** Snaps valX to the x coordinate of a nearby point (within thresholdPx). */
    _getSnappingX(valX, thresholdPx = 15) {
        const cs = this.transform;
        if (!cs) return valX;
        const mousePx = cs.mapX(valX);
        let bestX = valX;
        let bestDist = thresholdPx;
        const consider = (ptX) => {
            if (typeof ptX !== 'number' || isNaN(ptX)) return;
            const d = Math.abs(cs.mapX(ptX) - mousePx);
            if (d < bestDist) { bestDist = d; bestX = ptX; }
        };

        (this.config.data || []).forEach(item => {
            if (item.points && !item.freeCoordinates) {
                item.points.forEach(pt => {
                    if (!pt) return;
                    const v = this._eval(pt[0], "snap check");
                    consider(v && typeof v === 'object' ? v.re : v);
                });
            }
            if (item.x !== undefined) consider(this._eval(item.x, "snap check x"));
        });
        for (const label in this.freePoints) consider(this.freePoints[label].x);
        return bestX;
    },

    _interpolationAt(polyline, valX) {
        for (let i = 0; i < polyline.length - 1; i++) {
            const p1 = polyline[i], p2 = polyline[i + 1];
            if (valX >= Math.min(p1.valX, p2.valX) && valX <= Math.max(p1.valX, p2.valX)) {
                const t = Math.abs(p2.valX - p1.valX) > 1e-12 ? (valX - p1.valX) / (p2.valX - p1.valX) : 0;
                return { valY: p1.valY + t * (p2.valY - p1.valY) };
            }
        }
        return null;
    },

    /** Point on data item `index` at abscissa valX (explicit functions and interpolations). */
    _getPointAtGraphX(valX, index, snap = true) {
        const item = this.config.data && this.config.data[index];
        const cs = this.transform;
        if (!item || !cs) return null;
        if (snap && this.isSnapping && this.config.snapToPoints !== false) valX = this._getSnappingX(valX, 15);

        const plotItem = this.plotData ? this.plotData.find(pi => pi.index === index) : null;
        if (plotItem && plotItem.type === 'interpolation') {
            const p = this._interpolationAt(plotItem.polyline, valX);
            if (!p) return null;
            return { type: 'interpolation', index, x: cs.mapX(valX), y: cs.mapY(p.valY), valX, valY: p.valY, dist: 0, polyline: plotItem.polyline, lines: plotItem.lines };
        }
        if (!item.fn) return null;

        try {
            const domain = this._domainOf(item);
            if (domain) valX = Math.min(domain[1], Math.max(domain[0], valX));
            const valY = this._itemFn(item)(valX);

            if (valY !== null && typeof valY === 'object') {
                if (!isFinite(valY.re) || !isFinite(valY.im)) return null;
                return { type: 'fn', index, x: cs.mapX(valY.re), y: cs.mapY(valY.im), valX: valY.re, valY: valY.im, dist: 0, complex: true };
            }
            if (!isFinite(valY)) return null;
            return { type: 'fn', index, x: cs.mapX(valX), y: cs.mapY(valY), valX, valY, dist: 0 };
        } catch (e) { return null; }
    },

    /** Slope dy/dx (math units) of the item under `match`. */
    _getSlopeAt(match) {
        if (!match || !this.transform) return NaN;
        const cs = this.transform;
        const item = this.config.data[match.index];

        if (match.type === 'fn' && !match.complex) {
            const gx = match.valX !== undefined ? match.valX : cs.unmapX(match.x);
            const f = this._itemFn(item);
            const h = 1e-5 * Math.max(1, Math.abs(gx));
            try {
                const y1 = f(gx - h), y2 = f(gx + h);
                if (!isFinite(y1) || !isFinite(y2)) return NaN;
                return (y2 - y1) / (2 * h);
            } catch (e) { return NaN; }
        }
        if (match.type === 'implicit') {
            const gx = cs.unmapX(match.x), gy = cs.unmapY(match.y);
            const F = this.compiler.fn(item.implicit, ['x', 'y'], { complex: false });
            const h = 1e-5 * Math.max(1, Math.abs(gx), Math.abs(gy));
            try {
                const fx = (F(gx + h, gy) - F(gx - h, gy)) / (2 * h);
                const fy = (F(gx, gy + h) - F(gx, gy - h)) / (2 * h);
                if (Math.abs(fy) < 1e-12) return Infinity;
                return -fx / fy;
            } catch (e) { return NaN; }
        }
        if (match.type === 'vertical') return Infinity;

        // Polyline-based items: slope of the closest segment, converted to math units
        if (match.lines) {
            const res = closestOnPolylines(match.lines, match.x, match.y);
            if (!res) return NaN;
            const l = match.lines[res.line];
            const k = res.seg * 2;
            const dxPx = l[k + 2] - l[k], dyPx = l[k + 3] - l[k + 1];
            const dx = dxPx / cs.scaleX, dy = -dyPx / cs.scaleY;
            return Math.abs(dx) < 1e-12 ? Infinity : dy / dx;
        }
        return NaN;
    },

    /** Decimal places that make sense at the current zoom level. */
    _selectionPrecision() {
        const cs = this.transform;
        if (!cs || cs.isXLog) return 2;
        return Math.min(10, Math.max(2, Math.ceil(-Math.log10((cs.xMax - cs.xMin) / cs.plotW))));
    },

    _updateSelectionVisuals(match) {
        this.selectionGroup.innerHTML = "";
        const cs = this.transform;
        if (!cs) return;
        const prec = this._selectionPrecision();
        const cfg = this.config;

        const selColor = cfg.selectionColor;
        const defaultColor = this._adaptColorForTheme(selColor || "#B01A00");
        const selRadius = cfg.selectionRadius || 5;
        const selOutline = cfg.selectionOutlineColor || (this._isDark() ? "#181818" : "white");
        const selOutlineWidth = cfg.selectionOutlineWidth || 2;
        const xName = (cfg.axisLabels && cfg.axisLabels[0]) || "x";
        const yName = (cfg.axisLabels && cfg.axisLabels[1]) || "y";

        const drawDot = (m, color) => {
            if (!m) return;
            const c = document.createElementNS(SVG_NS, "circle");
            c.setAttribute("cx", m.x); c.setAttribute("cy", m.y); c.setAttribute("r", selRadius);
            c.setAttribute("fill", color || defaultColor);
            c.setAttribute("stroke", selOutline); c.setAttribute("stroke-width", selOutlineWidth);
            this.selectionGroup.appendChild(c);
        };
        const drawLabel = (x, y, txt, col) => {
            // Keep labels inside the plot
            const ax = x > this.width - 120 ? "end" : "start";
            const lx = ax === "end" ? x - 20 : x;
            this._text(lx, Math.max(this.padT + 14, y), txt, ax, "alphabetic", col, "bold", "normal", this.selectionGroup, 14);
        };
        const colorFor = (m) => {
            if (m && m.index !== undefined && cfg.data[m.index] && cfg.data[m.index].derivativeColor) {
                return this._getColor(m.index, cfg.data[m.index].derivativeColor);
            }
            return defaultColor;
        };
        const valOf = (m) => ({
            x: m.valX !== undefined ? m.valX : cs.unmapX(m.x),
            y: m.valY !== undefined ? m.valY : cs.unmapY(m.y)
        });
        const fmt = (v) => parseFloat(v.toFixed(prec));

        if (this.selectionMode === 'slope') {
            const p1 = this.interactions.slopeP1;
            const p2 = this.interactions.slopeP2;
            const mainColor = colorFor(p1);

            if (p1 && p2) {
                const cx = p2.x, cy = p1.y;
                this._line(p1.x, p1.y, cx, cy, mainColor, 1, "5,3", this.selectionGroup);
                this._line(p2.x, p2.y, cx, cy, mainColor, 1, "5,3", this.selectionGroup);
                this._line(p1.x, p1.y, p2.x, p2.y, mainColor, 2, "", this.selectionGroup);

                const a = valOf(p1), b = valOf(p2);
                const dx = b.x - a.x, dy = b.y - a.y;
                const m = dx !== 0 ? dy / dx : Infinity;

                this._text((p1.x + cx) / 2, cy + 15, `Δ${xName}=${fmt(dx)}`, "middle", "hanging", mainColor, "normal", "normal", this.selectionGroup, 12);
                this._text(cx + 5, (p2.y + cy) / 2, `Δ${yName}=${fmt(dy)}`, "start", "middle", mainColor, "normal", "normal", this.selectionGroup, 12);

                const sName = cfg.slopeLabel || "m";
                const mStr = isFinite(m) ? fmt(m) : "∞";
                const slopeLbl = cfg.specifySlope ? `${sName}=Δ${yName}/Δ${xName}=${mStr}` : `${sName}=${mStr}`;
                drawLabel((p1.x + p2.x) / 2 + 10, (p1.y + p2.y) / 2 - 10, slopeLbl, mainColor);
                drawLabel(p1.x + 10, p1.y - 10, `(${fmt(a.x)}, ${fmt(a.y)})`, mainColor);
                drawLabel(p2.x + 10, p2.y - 10, `(${fmt(b.x)}, ${fmt(b.y)})`, mainColor);
            } else if (p1) {
                const a = valOf(p1);
                drawLabel(p1.x + 10, p1.y - 10, `(${fmt(a.x)}, ${fmt(a.y)})`, mainColor);
            }
            if (p1) drawDot(p1, mainColor);
            if (p2) drawDot(p2, mainColor);
            return;
        }

        if (this.selectionMode === 'tangent') {
            if (!match) {
                if (this.derivativePlot) {
                    const idx = this.derivativePlot.config.data.findIndex(d => d.id === 'current-derivative-point');
                    if (idx >= 0) {
                        this.derivativePlot.config.data.splice(idx, 1);
                        this.derivativePlot.draw();
                    }
                }
                return;
            }
            const mainColor = colorFor(match);
            const v = valOf(match);
            const m = this._getSlopeAt(match);

            if (!isNaN(m)) {
                this._updateDerivativeTrace(v.x, m, mainColor);

                // Tangent segment of constant screen length
                const screenSlope = m === Infinity ? Infinity : -m * (cs.scaleY / cs.scaleX);
                const len = 60;
                let dx, dy;
                if (!isFinite(screenSlope)) { dx = 0; dy = len; }
                else { const ang = Math.atan(screenSlope); dx = Math.cos(ang) * len; dy = Math.sin(ang) * len; }
                this._line(match.x - dx, match.y - dy, match.x + dx, match.y + dy, mainColor, 2, "", this.selectionGroup);

                const sName = cfg.slopeLabel || "m";
                const mStr = isFinite(m) ? String(fmt(m)) : "∞";
                drawLabel(match.x + 10, match.y - 10, cfg.specifySlope ? `${sName}=d${yName}/d${xName}=${mStr}` : `${sName}=${mStr}`, mainColor);
            }
            drawDot(match, mainColor);
            drawLabel(match.x + 10, match.y + 20, `(${fmt(v.x)}, ${fmt(v.y)})`, mainColor);
            return;
        }

        // Point mode
        if (!match) return;
        // The draggable point itself is already drawn
        if (!(cfg.draggablePoints && match.type === 'point')) drawDot(match);
        if (cfg.showCoordinates !== false) {
            const v = valOf(match);
            if (isFinite(v.x) && isFinite(v.y)) drawLabel(match.x + 10, match.y - 10, `(${fmt(v.x)}, ${fmt(v.y)})`, defaultColor);
        }
    },

    /** Moves the live point on the derivative plot and extends the trace. */
    _updateDerivativeTrace(gx, m, mainColor) {
        const dp = this.derivativePlot;
        if (dp && isFinite(m)) {
            let dot = dp.config.data.find(d => d.id === 'current-derivative-point');
            const show = this.config.showDerivativePoint !== false || this.isTracing;
            if (show) {
                if (!dot) {
                    dot = { id: 'current-derivative-point', type: 'points', points: [[gx, m]], color: mainColor, radius: 4 };
                    dp.config.data.push(dot);
                } else {
                    dot.points = [[gx, m]];
                }
            } else if (dot) {
                dp.config.data = dp.config.data.filter(d => d.id !== 'current-derivative-point');
            }
        }

        if (this.isTracing && isFinite(m)) {
            const last = this.derivativeTrace[this.derivativeTrace.length - 1];
            if (!last || Math.abs(last.x - gx) > 1e-6 || Math.abs(last.y - m) > 1e-6) {
                this.derivativeTrace.push({ x: gx, y: m });
                if (dp) {
                    let trace = dp.config.data.find(d => d.id === 'derivative-trace');
                    if (!trace) {
                        trace = { id: 'derivative-trace', type: 'points', points: [], color: mainColor, radius: 2 };
                        dp.config.data.push(trace);
                    }
                    trace.points.push([gx, m]);
                    if (this.config.derivativeAutoY) {
                        let [yMin, yMax] = dp.config.ylim || [1000, -1000];
                        if (m < yMin) yMin = m - 1;
                        if (m > yMax) yMax = m + 1;
                        dp.config.ylim = [yMin, yMax];
                        if (dp.view) { dp.view.yMin = yMin; dp.view.yMax = yMax; }
                    }
                }
            }
        }

        // During a main-plot draw, _syncDerivativePlot redraws it right after
        if (dp && !this._inDraw) dp.draw();

        // Without a derivative plot the trace is drawn on the main plot
        if (!dp && this.derivativeTrace.length > 0) {
            const cs = this.transform;
            const lines = [];
            let cur = null;
            this.derivativeTrace.forEach(pt => {
                if (!pt) { cur = null; return; }
                const px = cs.mapX(pt.x), py = cs.mapY(pt.y);
                if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
                    if (!cur) { cur = []; lines.push(cur); }
                    cur.push(px, py);
                } else {
                    cur = null;
                }
            });
            const path = this._path(lines.filter(l => l.length >= 4), mainColor, 2, "", 0.5, this.selectionGroup);
            this.selectionGroup.insertBefore(path, this.selectionGroup.firstChild);
        }
    },

    /** Re-projects stored selections after the view changed. */
    _restoreSelectionVisuals() {
        const cs = this.transform;
        const reproject = (p) => {
            if (p && p.valX !== undefined && p.valY !== undefined) {
                p.x = cs.mapX(p.valX);
                p.y = cs.mapY(p.valY);
            }
        };
        const sel = this.interactions.currentSelection ||
            (typeof this.interactions.draggingSelection === 'object' ? this.interactions.draggingSelection : null);
        reproject(sel);
        reproject(this.interactions.slopeP1);
        reproject(this.interactions.slopeP2);
        // Keep the selection's geometry in sync with the redrawn curve
        if (sel && sel.index !== undefined) {
            const fresh = this.plotData.find(pd => pd.index === sel.index && pd.type === sel.type);
            if (fresh && fresh.lines) sel.lines = fresh.lines;
        }
        this._updateSelectionVisuals(this.interactions.currentSelection || null);
    },
};
