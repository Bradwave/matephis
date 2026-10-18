/**
 * Data Series Rendering (mixed into MatephisPlot)
 *
 * Every drawable item type has its own method returning the default label
 * position. Line-like items register their screen polylines in `plotData`
 * for snapping/selection; draggable things register in `handles`.
 */
import { SVG_NS } from './svg-factory.js';
import { sampleCurve, polylinesToPath } from './curve-sampler.js';
import { sampleImplicit } from './implicit-sampler.js';
import { hasMathJax } from './mathjax-bridge.js';

const TAU = 2 * Math.PI;
const POLAR_VARS = ['x', 't', 'θ', 'theta'];

/** "4,4", [4, 4] or 4 -> SVG dasharray string. */
function dashString(d) {
    if (d === undefined || d === null || d === false || d === '') return '';
    return Array.isArray(d) ? d.join(',') : String(d);
}

/** Last point of the polylines that lies inside the view (for labels). */
function lastPoint(lines, view) {
    let fallback = null;
    for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i];
        for (let k = l.length - 2; k >= 0; k -= 2) {
            const x = l[k], y = l[k + 1];
            if (!fallback) fallback = { x, y };
            if (!view || (x >= view.x0 && x <= view.x1 && y >= view.y0 && y <= view.y1)) return { x, y };
        }
    }
    return fallback;
}

const isArr = Array.isArray;

export const DataMixin = {
    // =====================================================================
    // NAMED OBJECTS (points, vectors, angles) — resolved before drawing so
    // expressions may reference names defined later in the data list.
    // =====================================================================

    _resolveNamedObjects() {
        const data = this.config.data || [];
        for (let pass = 0; pass < 2; pass++) {
            data.forEach((item, idx) => {
                if (!item.name) return;
                try {
                    if (item.points && item.type !== 'interpolation') {
                        const pos = this._pointPosition(item, item.points[0]);
                        if (pos) this.resolvedPoints[item.name] = { x: pos.x, y: pos.y };
                    } else if (item.vector || item.type === 'vector') {
                        const v = this._vectorEnds(item, idx);
                        if (v) this.resolvedPoints[item.name] = { x: v.tx - v.fx, y: v.ty - v.fy };
                    } else if (item.angle) {
                        const a = this._angleValues(item);
                        if (a) this.resolvedPoints[item.name] = Object.assign(this.resolvedPoints[item.name] || {}, { rad: a.rad, deg: a.deg });
                    }
                } catch (e) { /* reported when the item is drawn */ }
            });
        }
    },

    /** Math position of a point entry ([x, y, label]) of an item, or null. */
    _pointPosition(item, pt) {
        if (!pt) return null;
        if (item.freeCoordinates === true && item.name) {
            if (!this.freePoints[item.name]) {
                let sx = this._eval(pt[0], 'free point x');
                let sy = this._eval(pt[1] !== undefined ? pt[1] : 0, 'free point y');
                if (typeof sx !== 'number' || isNaN(sx)) sx = 0;
                if (typeof sy !== 'number' || isNaN(sy)) sy = 0;
                this.freePoints[item.name] = { x: sx, y: sy };
            }
            return { ...this.freePoints[item.name], free: true };
        }
        const vx = this._eval(pt[0], 'point x');
        if (vx && typeof vx === 'object') return { x: vx.re, y: vx.im, complex: true };
        let vy = pt.length > 1 ? this._eval(pt[1], 'point y') : 0;
        // Complex mode: ["2", "", "label"] is the real number 2
        if (this.config.complexMode === true && typeof vx === 'number' && (pt[1] === '' || pt[1] === undefined)) vy = 0;
        if (typeof vx !== 'number' || typeof vy !== 'number' || isNaN(vx) || isNaN(vy)) return null;
        return { x: vx, y: vy };
    },

    // =====================================================================
    // MAIN LOOP
    // =====================================================================

    _drawData(cs) {
        const data = this.config.data || [];
        const legendItems = [];

        data.forEach((item, idx) => {
            const color = this._getColor(idx, item.color);
            const width = item.width || item.strokeWidth || 3;
            const dash = dashString(item.dash);
            const st = { item, idx, cs, color, width, dash };

            if (item.label && this.config.legend) {
                let type = 'line';
                if (item.points && item.type !== 'interpolation') type = 'point';
                else if (item.type === 'interpolation') type = 'interpolation';
                else if (item.vector || item.type === 'vector') type = 'vector';
                legendItems.push({ color, label: this._substituteLabel(item.label), type, dash });
            }

            let pos = null;
            const keep = (p) => { if (p) pos = p; };
            try {
                if (item.type === 'interpolation' && isArr(item.points)) keep(this._drawInterpolation(st));
                if (item.fn) keep(this._drawFunction(st));
                if (item.parametric) keep(this._drawParametric(st));
                if (item.r) keep(this._drawPolarCurve(st, item.r));
                if (item.implicit) keep(this._drawImplicit(st));
                if (item.x !== undefined) keep(this._drawVertical(st));
                if (item.points && item.type !== 'interpolation') keep(this._drawPoints(st));
                if (item.vector || item.type === 'vector') keep(this._drawVector(st));
                if (item.angle) keep(this._drawAngle(st));
            } catch (e) {
                this._addWarning(`Item ${idx + 1}: ${e.message}`);
            }

            if (item.labelAt) {
                const lx = this._eval(item.labelAt[0], "labelAt x");
                const ly = this._eval(item.labelAt[1], "labelAt y");
                pos = (typeof lx === 'number' && typeof ly === 'number' && !isNaN(lx) && !isNaN(ly))
                    ? { x: cs.mapX(lx), y: cs.mapY(ly) } : pos;
            }
            if (item.label && pos && !pos.labelDrawn && !this.config.legend) this._drawItemLabel(item, pos, color);
        });

        if (this.config.legend && legendItems.length > 0) this._drawLegend(legendItems);
    },

    _path(lines, color, width, dash, opacity, parent = this.dataGroup) {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", polylinesToPath(lines));
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", width);
        path.setAttribute("stroke-linejoin", "round");
        if (dash) path.setAttribute("stroke-dasharray", dash);
        if (opacity !== undefined) path.setAttribute("opacity", opacity);
        parent.appendChild(path);
        return path;
    },

    _domainOf(item) {
        if (!isArr(item.domain)) return null;
        const a = this._eval(item.domain[0], "domain min");
        const b = this._eval(item.domain[1], "domain max");
        if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) return null;
        return [Math.min(a, b), Math.max(a, b)];
    },

    _sampleSteps(extra = 1) {
        const step = this.config.sampleStep || 2;
        return Math.max(50, (this.transform.plotW / step) * extra);
    },

    // =====================================================================
    // FUNCTIONS y = f(x)
    // =====================================================================

    /** Compiled f for a data item (honours internal "param" variable). */
    _itemFn(item) {
        const pv = (item.param && isArr(item.param[0])) ? item.param[0][0] : null;
        return this.compiler.fn(item.fn, [pv || 'x'], { exclude: pv });
    },

    _drawFunction(st) {
        const { item, idx, cs, color, width, dash } = st;

        // In polar plots "fn" is r(θ)
        if (this.config.polar === true && !item.param && this.config.complexMode !== true) {
            return this._drawPolarCurve(st, item.fn);
        }

        const f = this._itemFn(item);
        const complex = this.config.complexMode === true;
        const isParam = item.param && isArr(item.param[0]);
        const domain = this._domainOf(item);

        let t0 = cs.xMin, t1 = cs.xMax;
        if (isParam) {
            const a = this._eval(item.param[0][1], "param min");
            const b = this._eval(item.param[0][2], "param max");
            if (typeof a === 'number' && typeof b === 'number' && !isNaN(a) && !isNaN(b)) { t0 = Math.min(a, b); t1 = Math.max(a, b); }
            else { t0 = 0; t1 = TAU; }
        } else if (domain) {
            if (complex) { t0 = domain[0]; t1 = domain[1]; }
            else { t0 = Math.max(t0, domain[0]); t1 = Math.min(t1, domain[1]); }
        }
        if (!(t1 > t0)) return null;

        const inDomain = (t) => !domain || (t >= domain[0] - 1e-12 && t <= domain[1] + 1e-12);
        const curveLike = complex || isParam;

        // Explicit functions on a log x axis are sampled uniformly in log space
        const logX = cs.isXLog && !curveLike;
        const u0 = logX ? Math.log10(Math.max(t0, cs.xMin)) : t0;
        const u1 = logX ? Math.log10(t1) : t1;
        const toX = logX ? (u) => Math.pow(10, u) : (u) => u;

        const tasks = [];
        if (this.config.hideFunctions !== true) tasks.push({ derivative: false, color, width, dash, opacity: item.opacity });
        if (this.config.showDerivative === true && !curveLike) {
            tasks.push({
                derivative: true,
                color: item.derivativeColor ? this._getColor(idx, item.derivativeColor) : color,
                width: 2, dash: "5,5", opacity: 0.5
            });
        }

        let labelPos = null;
        tasks.forEach(task => {
            let point;
            if (complex) {
                point = (t) => {
                    if (!inDomain(t)) return null;
                    const v = f(t);
                    return v ? [cs.mapX(v.re), cs.mapY(v.im)] : null;
                };
            } else {
                const g = task.derivative ? (x) => {
                    const h = 1e-5 * Math.max(1, Math.abs(x));
                    return (f(x + h) - f(x - h)) / (2 * h);
                } : f;
                point = (u) => {
                    const x = toX(u);
                    if (!inDomain(x)) return null;
                    const y = g(x);
                    if (typeof y !== 'number' || !isFinite(y)) return null;
                    return [cs.mapX(x), cs.mapY(y)];
                };
            }

            const lines = sampleCurve({
                point, t0: u0, t1: u1, view: cs.viewRect,
                steps: this._sampleSteps(curveLike ? 1.5 : 1),
                tolerance: this.config.sampleTolerance || 0.3,
            });
            this._path(lines, task.color, task.width, task.dash, task.opacity);

            if (!task.derivative) {
                this.plotData.push({ type: curveLike ? 'curve' : 'fn', index: idx, lines, domain });
                labelPos = lastPoint(lines, cs.viewRect);
            }
        });
        return labelPos;
    },

    // =====================================================================
    // PARAMETRIC & POLAR CURVES
    // =====================================================================

    _curveRange(item, def = [0, TAU]) {
        if (item.param && isArr(item.param[0])) {
            const a = this._eval(item.param[0][1], 'param min'), b = this._eval(item.param[0][2], 'param max');
            if (typeof a === 'number' && typeof b === 'number') return [a, b];
        }
        return this._domainOf(item) || def;
    },

    /** { "parametric": ["cos(t)", "sin(t)"], "domain": [0, "2pi"] } */
    _drawParametric(st) {
        const { item, idx, cs, color, width, dash } = st;
        if (!isArr(item.parametric) || item.parametric.length !== 2) throw new Error("'parametric' needs [x(t), y(t)]");
        const pv = (item.param && isArr(item.param[0])) ? item.param[0][0] : 't';
        const fx = this.compiler.fn(String(item.parametric[0]), [pv], { exclude: pv, complex: false });
        const fy = this.compiler.fn(String(item.parametric[1]), [pv], { exclude: pv, complex: false });
        const [t0, t1] = this._curveRange(item);

        const lines = sampleCurve({
            point: (t) => {
                const x = fx(t), y = fy(t);
                return (isFinite(x) && isFinite(y)) ? [cs.mapX(x), cs.mapY(y)] : null;
            },
            t0, t1, view: cs.viewRect, steps: this._sampleSteps(1.5),
        });
        this._path(lines, color, width, dash, item.opacity);
        this.plotData.push({ type: 'curve', index: idx, lines });
        return lastPoint(lines, cs.viewRect);
    },

    /** Polar curve r(θ); θ can be written as x, t, θ or theta. */
    _drawPolarCurve(st, expr) {
        const { item, idx, cs, color, width, dash } = st;
        const f = this.compiler.fn(String(expr), POLAR_VARS, { complex: false });
        const [t0, t1] = this._curveRange(item);

        const lines = sampleCurve({
            point: (t) => {
                const r = f(t, t, t, t);
                return isFinite(r) ? [cs.mapX(r * Math.cos(t)), cs.mapY(r * Math.sin(t))] : null;
            },
            t0, t1, view: cs.viewRect, steps: this._sampleSteps(2),
        });
        this._path(lines, color, width, dash, item.opacity);
        this.plotData.push({ type: 'curve', index: idx, lines });
        return lastPoint(lines, cs.viewRect);
    },

    // =====================================================================
    // IMPLICIT CURVES F(x, y) = 0
    // =====================================================================

    _drawImplicit(st) {
        const { item, idx, cs, color, width, dash } = st;
        const F = this.compiler.fn(item.implicit, ['x', 'y'], { complex: false });
        const lines = sampleImplicit({
            // Sampled in the axes' linear space, so log axes work too
            f: (u, v) => F(cs.fromLinX(u), cs.fromLinY(v)),
            xMin: cs._lx0, xMax: cs._lx1, yMin: cs._ly0, yMax: cs._ly1,
            mapX: (u) => cs.mapX(cs.fromLinX(u)), mapY: (v) => cs.mapY(cs.fromLinY(v)),
            pxWidth: cs.plotW, pxHeight: cs.plotH,
            cellPx: this.config.implicitResolution || 4,
        });
        this._path(lines, color, width, dash, item.opacity);
        this.plotData.push({ type: 'implicit', index: idx, lines });

        // Label at the right-most point of the curve
        let best = null;
        lines.forEach(l => { for (let k = 0; k < l.length; k += 2) if (!best || l[k] > best.x) best = { x: l[k], y: l[k + 1] }; });
        return best;
    },

    // =====================================================================
    // VERTICAL LINES x = c
    // =====================================================================

    _drawVertical(st) {
        const { item, idx, cs, color, width, dash } = st;
        const valX = this._eval(item.x, "vertical line x");
        if (typeof valX !== 'number' || isNaN(valX)) return null;
        const px = cs.mapX(valX);
        const top = this.padT, bottom = this.height - this.padB;
        if (px < this.padL || px > this.width - this.padR) return null;

        let yStart = top, yEnd = bottom;
        if (isArr(item.range)) {
            const r0 = this._eval(item.range[0], "vertical line range start");
            const r1 = this._eval(item.range[1], "vertical line range end");
            if (typeof r0 === 'number' && typeof r1 === 'number' && !isNaN(r0) && !isNaN(r1)) {
                const y1 = cs.mapY(r0), y2 = cs.mapY(r1);
                yStart = Math.max(top, Math.min(y1, y2));
                yEnd = Math.min(bottom, Math.max(y1, y2));
            }
        }
        if (yEnd <= yStart) return null;

        const l = this._line(px, yStart, px, yEnd, color, width, dash, this.dataGroup);
        if (item.opacity !== undefined) l.setAttribute("opacity", item.opacity);
        this.plotData.push({ type: 'vertical', index: idx, lines: [[px, yStart, px, yEnd]], val: valX });
        return { x: px, y: yStart + 15 };
    },

    // =====================================================================
    // INTERPOLATION (polyline / cardinal spline through points)
    // =====================================================================

    _drawInterpolation(st) {
        const { item, idx, cs, color, width, dash } = st;
        const rawPoints = [];
        item.points.forEach(pt => {
            if (!pt) return;
            const vx = this._eval(pt[0], "interp x");
            if (vx && typeof vx === 'object') { rawPoints.push([vx.re, vx.im]); return; }
            const vy = pt.length > 1 ? this._eval(pt[1], "interp y") : 0;
            if (typeof vx === 'number' && typeof vy === 'number' && !isNaN(vx) && !isNaN(vy)) rawPoints.push([vx, vy]);
        });
        if (rawPoints.length < 2) return null;

        const smoothness = item.smoothness !== undefined ? item.smoothness : 0;
        const sampling = item.sampling !== undefined ? item.sampling : 10;
        let labelPos = null;

        const tasks = [];
        if (this.config.hideFunctions !== true) tasks.push({ derivative: false, color, width, dash, opacity: item.opacity });
        if (this.config.showDerivative === true) {
            tasks.push({ derivative: true, color: item.derivativeColor ? this._getColor(idx, item.derivativeColor) : color, width: 2, dash: "5,5", opacity: 0.8 });
        }

        tasks.forEach(task => {
            let pts = [];
            if (task.derivative) {
                const src = smoothness > 0 ? this._getCurvePoints(rawPoints, smoothness, sampling) : rawPoints;
                for (let i = 0; i < src.length - 1; i++) {
                    const p1 = src[i], p2 = src[i + 1];
                    const dx = p2[0] - p1[0];
                    const m = Math.abs(dx) < 1e-12 ? 0 : (p2[1] - p1[1]) / dx;
                    if (smoothness > 0) {
                        pts.push([cs.mapX(p1[0]), cs.mapY(m)]);
                        if (i === src.length - 2) pts.push([cs.mapX(p2[0]), cs.mapY(m)]);
                    } else {
                        pts.push([cs.mapX(p1[0]), cs.mapY(m)], [cs.mapX(p2[0]), cs.mapY(m)]);
                    }
                }
            } else {
                const mapped = rawPoints.map(p => [cs.mapX(p[0]), cs.mapY(p[1])]);
                pts = smoothness > 0 ? this._getCurvePoints(mapped, smoothness, sampling) : mapped;
            }
            if (!pts.length) return;
            const flat = [];
            pts.forEach(p => flat.push(Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100));
            this._path([flat], task.color, task.width, task.dash, task.opacity);

            if (task.derivative) return;
            const polyline = pts.map(p => ({ x: p[0], y: p[1], valX: cs.unmapX(p[0]), valY: cs.unmapY(p[1]) }));
            this.plotData.push({ type: 'interpolation', index: idx, polyline, lines: [flat] });

            if (item.showPoints !== false) {
                const pColor = item.pointColor ? this._getColor(0, item.pointColor) : color;
                const pRadius = item.pointRadius || 4;
                const pOpacity = item.pointOpacity !== undefined ? item.pointOpacity : (item.opacity !== undefined ? item.opacity : 1);
                rawPoints.forEach(rp => {
                    const c = this._dot(cs.mapX(rp[0]), cs.mapY(rp[1]), pRadius, pColor);
                    if (pOpacity !== 1) c.setAttribute("opacity", pOpacity);
                    if (item.pointStroke) {
                        c.setAttribute("stroke", this._getColor(0, item.pointStroke));
                        c.setAttribute("stroke-width", item.pointStrokeWidth || 1);
                    }
                });
            }
            labelPos = { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] };
        });
        return labelPos;
    },

    // =====================================================================
    // POINTS
    // =====================================================================

    _dot(cx, cy, r, fill, parent = this.dataGroup) {
        const c = document.createElementNS(SVG_NS, "circle");
        c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", r);
        c.setAttribute("fill", fill);
        parent.appendChild(c);
        return c;
    },

    _drawPoints(st) {
        const { item, idx, cs, color } = st;
        const forceShow = item.id === 'current-derivative-point' || item.id === 'derivative-trace';
        if (!forceShow && this.config.showPoints === false) return null;

        const isFree = item.freeCoordinates === true && item.name;
        let labelPos = null;

        item.points.forEach((pt) => {
            if (!pt) return;
            const pos = this._pointPosition(item, pt);
            if (!pos) return;
            const px = cs.mapX(pos.x), py = cs.mapY(pos.y);
            if (!(px >= -50 && px <= this.width + 50 && py >= -50 && py <= this.height + 50)) return;

            const fillColor = item.fillColor ? this._getColor(0, item.fillColor) : color;

            if (isFree) {
                const r = item.radius || 7;
                const strokeColor = item.strokeColor ? this._getColor(0, item.strokeColor) : fillColor;
                // Drag hint ring
                const ring = document.createElementNS(SVG_NS, 'circle');
                ring.setAttribute('cx', px); ring.setAttribute('cy', py); ring.setAttribute('r', r + 4);
                ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', fillColor);
                ring.setAttribute('stroke-width', 1.5); ring.setAttribute('stroke-dasharray', '3,3');
                ring.setAttribute('opacity', 0.6);
                this.dataGroup.appendChild(ring);

                const c = this._dot(px, py, r, fillColor);
                c.setAttribute('stroke', strokeColor);
                c.setAttribute('stroke-width', item.strokeWidth || 1.5);
                if (item.opacity !== undefined) c.setAttribute('opacity', item.opacity);

                const label = (pt[2] && typeof pt[2] === 'string') ? pt[2] : item.label;
                if (label) this._drawPointLabel(label, px + r + 6, py - r - 2, fillColor, this.config.labelWeight || 'bold');

                this.plotData.push({ type: 'point', index: idx, cx: px, cy: py, valX: pos.x, valY: pos.y, isFreePoint: true, fpLabel: item.name });
                this.handles.push({ kind: 'freePoint', key: item.name, px, py, r: Math.max(20, r + 8), snap: item.snap });
                // The label is already drawn next to the point
                labelPos = { x: px, y: py, labelDrawn: !!label };
                return;
            }

            const c = this._dot(px, py, item.radius !== undefined ? item.radius : 4, fillColor);
            c.setAttribute("stroke", item.strokeColor ? this._getColor(0, item.strokeColor) : "none");
            c.setAttribute("stroke-width", item.strokeWidth || 0);
            if (item.opacity !== undefined) c.setAttribute("opacity", item.opacity);

            // Per-point label: [x, y, "label"] (complex points: ["a+ib", "", "label"])
            const label = pos.complex ? (typeof pt[1] === 'string' && pt[1] !== '' ? pt[1] : pt[2]) : pt[2];
            const hasOwnLabel = label && typeof label === 'string';
            if (hasOwnLabel) this._drawPointLabel(label, px + 8, py - 8, this._adaptColorForTheme("#333"), this.config.labelWeight || "normal");

            this.plotData.push({
                type: 'point', index: idx, cx: px, cy: py, valX: pos.x, valY: pos.y,
                rawExpressions: [pt[0], pt.length > 1 ? pt[1] : null].filter(v => v !== null && v !== undefined && v !== '')
            });
            labelPos = { x: px, y: py, labelDrawn: item.label === label && hasOwnLabel };
        });
        return labelPos;
    },

    _drawPointLabel(text, x, y, color, weight) {
        const label = this._substituteLabel(text);
        const fs = this._getConfigSize('labelSize');
        if (hasMathJax() && label.includes('$')) {
            this._renderMathJax(label, x, y, fs, color, 'start', 'alphabetic', this.labelGroup);
        } else {
            this._text(x, y, label, 'start', 'alphabetic', color, weight, this.config.labelStyle || 'normal', this.labelGroup, fs);
        }
    },

    // =====================================================================
    // VECTORS
    // =====================================================================

    /** Accepts [x, y] arrays or the name of a point ("A"). */
    _vecPoint(spec, what) {
        if (typeof spec === 'string' && this.resolvedPoints[spec] && !/[.()+\-*/^]/.test(spec)) {
            const p = this.resolvedPoints[spec];
            return [p.x, p.y];
        }
        if (!isArr(spec) || spec.length < 2) {
            // Complex mode: a single "a+ib" expression
            const v = this._eval(spec, what);
            if (v && typeof v === 'object') return [v.re, v.im];
            return null;
        }
        const x = this._eval(spec[0], `${what} x`), y = this._eval(spec[1], `${what} y`);
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) return null;
        return [x, y];
    },

    /**
     * Resolves tail/tip of a vector item. Accepted forms:
     *   "vector": [[x0, y0], [x1, y1]]      tail and tip
     *   "vector": ["A", "B"]                from point A to point B
     *   "vector": [vx, vy]                  components, from the origin or from "from"
     *   "from": [x0, y0] | "A", "to": [x1, y1] | "B"
     */
    _vectorEnds(item, idx) {
        if (item.draggable && this.vectorState[idx]) {
            const s = this.vectorState[idx];
            return { fx: s.from[0], fy: s.from[1], tx: s.to[0], ty: s.to[1] };
        }

        let from = null, to = null;
        const v = item.vector;
        const isPointName = (s) => typeof s === 'string' && Object.prototype.hasOwnProperty.call(this.resolvedPoints, s);

        if (isArr(v) && v.length === 2 && (isArr(v[0]) || isArr(v[1]) || (isPointName(v[0]) && isPointName(v[1])))) {
            from = this._vecPoint(v[0], 'vector from');
            to = this._vecPoint(v[1], 'vector to');
        } else if (isArr(v) && v.length === 2) {
            const comp = this._vecPoint(v, 'vector components');
            from = item.from !== undefined ? this._vecPoint(item.from, 'vector from') : [0, 0];
            if (comp && from) to = [from[0] + comp[0], from[1] + comp[1]];
        } else if (v !== undefined && !isArr(v)) {
            // Complex mode: "vector": "2+i"
            const comp = this._vecPoint(v, 'vector');
            from = item.from !== undefined ? this._vecPoint(item.from, 'vector from') : [0, 0];
            if (comp && from) to = [from[0] + comp[0], from[1] + comp[1]];
        } else {
            from = this._vecPoint(item.from !== undefined ? item.from : [0, 0], 'vector from');
            to = this._vecPoint(item.to !== undefined ? item.to : [1, 1], 'vector to');
        }
        if (!from || !to) return null;

        if (item.draggable) this.vectorState[idx] = { from: from.slice(), to: to.slice() };
        return { fx: from[0], fy: from[1], tx: to[0], ty: to[1] };
    },

    /**
     * Arrowhead polygon with its tip at (tx, ty), pointing along (ux, uy).
     */
    _arrowHead(tx, ty, ux, uy, len, color, parent) {
        const half = len * 0.42;
        const bx = tx - ux * len, by = ty - uy * len;
        const nx = -uy, ny = ux;
        const p = document.createElementNS(SVG_NS, 'polygon');
        const r = (v) => Math.round(v * 100) / 100;
        p.setAttribute('points', `${r(tx)},${r(ty)} ${r(bx + nx * half)},${r(by + ny * half)} ${r(bx - nx * half)},${r(by - ny * half)}`);
        p.setAttribute('fill', color);
        p.setAttribute('stroke', color);
        p.setAttribute('stroke-width', 1);
        p.setAttribute('stroke-linejoin', 'round');
        parent.appendChild(p);
        return p;
    },

    _drawVector(st) {
        const { item, idx, cs, color, dash } = st;
        const ends = this._vectorEnds(item, idx);
        if (!ends) return null;
        const { fx, fy, tx, ty } = ends;
        const w = item.width || item.strokeWidth || 2;

        const pfx = cs.mapX(fx), pfy = cs.mapY(fy), ptx = cs.mapX(tx), pty = cs.mapY(ty);
        const dx = ptx - pfx, dy = pty - pfy;
        const len = Math.hypot(dx, dy);

        // One group, so opacity applies once to line + head (no darker overlap)
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', 'matephis-vector');
        if (item.opacity !== undefined) g.setAttribute('opacity', item.opacity);
        this.dataGroup.appendChild(g);

        // Component projections (dashed): tail -> (tip.x, tail.y) -> tip
        if (item.components) {
            const cc = item.componentColor ? this._getColor(0, item.componentColor) : color;
            const cxp = cs.mapX(tx), cyp = cs.mapY(fy);
            const cg = document.createElementNS(SVG_NS, 'g');
            cg.setAttribute('opacity', 0.7);
            g.appendChild(cg);
            this._line(pfx, pfy, cxp, cyp, cc, Math.max(1, w * 0.6), "4,3", cg);
            this._line(cxp, cyp, ptx, pty, cc, Math.max(1, w * 0.6), "4,3", cg);
        }

        const arrow = item.arrow === undefined ? true : item.arrow;
        const atEnd = arrow === true || arrow === 'end' || arrow === 'both';
        const atStart = arrow === 'start' || arrow === 'both';

        if (len < 0.5) {
            // Zero vector: a dot, an arrowhead would have no direction
            this._dot(pfx, pfy, Math.max(2, w), color, g);
        } else {
            const ux = dx / len, uy = dy / len;
            let head = item.arrowSize || Math.min(22, Math.max(8, 4 + 3 * w));
            const heads = (atEnd ? 1 : 0) + (atStart ? 1 : 0);
            if (heads && head * heads > len * 0.8) head = (len * 0.8) / heads;

            // Shorten the shaft so the square line end never pokes out of the head
            const inset = head * 0.8;
            const x1 = atStart ? pfx + ux * inset : pfx, y1 = atStart ? pfy + uy * inset : pfy;
            const x2 = atEnd ? ptx - ux * inset : ptx, y2 = atEnd ? pty - uy * inset : pty;
            this._line(x1, y1, x2, y2, color, w, dash, g);
            if (atEnd) this._arrowHead(ptx, pty, ux, uy, head, color, g);
            if (atStart) this._arrowHead(pfx, pfy, -ux, -uy, head, color, g);
        }

        this.plotData.push({ type: 'vector', index: idx, lines: [[pfx, pfy, ptx, pty]] });

        if (item.draggable) {
            const mode = item.draggable === true ? 'tip' : item.draggable;
            const r = Math.max(18, w * 4);
            if (mode === 'tip' || mode === 'both') this.handles.push({ kind: 'vectorTip', index: idx, px: ptx, py: pty, r, snap: item.snap });
            if (mode === 'tail' || mode === 'both') this.handles.push({ kind: 'vectorTail', index: idx, px: pfx, py: pfy, r, snap: item.snap });
            // Visible affordance on draggable ends
            if (mode === 'tip' || mode === 'both') this._handleHint(ptx, pty, color, g);
            if (mode === 'tail' || mode === 'both') this._handleHint(pfx, pfy, color, g);
        }

        // Label beside the midpoint, on the side of the left normal (screen space)
        if (len < 0.5) return { x: pfx + 6, y: pfy - 6 };
        let nx = dy / len, ny = -dx / len;
        // Mostly vertical vectors: label on the right; otherwise above
        if (Math.abs(ny) < 0.5 ? nx < 0 : ny > 0) { nx = -nx; ny = -ny; }
        const off = 10 + w;
        return {
            x: (pfx + ptx) / 2 + nx * off,
            y: (pfy + pty) / 2 + ny * off,
            anchor: nx > 0.35 ? 'start' : nx < -0.35 ? 'end' : 'middle',
            baseline: ny < -0.35 ? 'auto' : 'middle',
            exact: true
        };
    },

    _handleHint(px, py, color, parent) {
        const ring = document.createElementNS(SVG_NS, 'circle');
        ring.setAttribute('cx', px); ring.setAttribute('cy', py); ring.setAttribute('r', 9);
        ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', color);
        ring.setAttribute('stroke-width', 1.5); ring.setAttribute('stroke-dasharray', '3,3');
        ring.setAttribute('opacity', 0.6);
        parent.appendChild(ring);
    },

    // =====================================================================
    // ANGLES
    // =====================================================================

    _angleValues(item) {
        if (!isArr(item.angle) || item.angle.length !== 3) return null;
        const pts = item.angle.map((p, k) => this._vecPoint(p, `angle point ${k + 1}`));
        if (pts.some(p => !p)) return null;
        const [p1, v, p2] = pts;
        let d = Math.atan2(p2[1] - v[1], p2[0] - v[0]) - Math.atan2(p1[1] - v[1], p1[0] - v[0]);
        while (d <= -Math.PI) d += TAU;
        while (d > Math.PI) d -= TAU;
        const rad = Math.abs(d);
        return { p1, v, p2, rad, deg: rad * 180 / Math.PI };
    },

    /** { "angle": [[x1, y1], [vx, vy], [x2, y2]] } — points may also be names ("A") */
    _drawAngle(st) {
        const { item, cs, color, dash } = st;
        const a = this._angleValues(item);
        if (!a) return null;
        const { p1, v, p2 } = a;

        const pvx = cs.mapX(v[0]), pvy = cs.mapY(v[1]);
        const s1 = Math.atan2(cs.mapY(p1[1]) - pvy, cs.mapX(p1[0]) - pvx);
        const s2 = Math.atan2(cs.mapY(p2[1]) - pvy, cs.mapX(p2[0]) - pvx);
        let sd = s2 - s1;
        while (sd <= -Math.PI) sd += TAU;
        while (sd > Math.PI) sd -= TAU;

        const r = item.radius || 20;
        const strokeW = item.strokeWidth || item.width || 1.5;
        const fill = item.fillColor ? this._getColor(0, item.fillColor) : "none";
        const stroke = item.strokeColor === undefined ? color : (item.strokeColor ? this._getColor(0, item.strokeColor) : "none");

        const path = document.createElementNS(SVG_NS, 'path');
        const rightAngle = item.rightAngle !== false && Math.abs(a.deg - 90) < 1e-6;
        let d;
        if (rightAngle) {
            // Square marker for right angles
            const q = r * 0.7;
            const ax = pvx + q * Math.cos(s1), ay = pvy + q * Math.sin(s1);
            const bx = pvx + q * Math.cos(s2), by = pvy + q * Math.sin(s2);
            d = `M ${ax} ${ay} L ${ax + bx - pvx} ${ay + by - pvy} L ${bx} ${by}`;
            if (fill !== 'none') d = `M ${pvx} ${pvy} L ${ax} ${ay} L ${ax + bx - pvx} ${ay + by - pvy} L ${bx} ${by} Z`;
        } else {
            const sx = pvx + r * Math.cos(s1), sy = pvy + r * Math.sin(s1);
            const ex = pvx + r * Math.cos(s2), ey = pvy + r * Math.sin(s2);
            const arc = `A ${r} ${r} 0 0 ${sd > 0 ? 1 : 0} ${ex} ${ey}`;
            // Filled angles are sectors (vertex included), not chord segments
            d = fill !== 'none' ? `M ${pvx} ${pvy} L ${sx} ${sy} ${arc} Z` : `M ${sx} ${sy} ${arc}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('fill', fill);
        if (item.fillOpacity !== undefined) path.setAttribute('fill-opacity', item.fillOpacity);
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', strokeW);
        if (dash) path.setAttribute('stroke-dasharray', dash);
        if (item.opacity !== undefined) path.setAttribute('opacity', item.opacity);
        this.dataGroup.appendChild(path);

        // "showValue": true | "deg" | "rad" draws the measure as the label
        if (item.showValue && !item.label) {
            const useRad = item.showValue === 'rad';
            const txt = useRad ? `${+a.rad.toFixed(2)} rad` : `${+a.deg.toFixed(1)}°`;
            const mid = s1 + sd / 2;
            const lx = pvx + (r + 12) * Math.cos(mid), ly = pvy + (r + 12) * Math.sin(mid);
            this._text(lx, ly, txt, Math.cos(mid) > 0.3 ? 'start' : Math.cos(mid) < -0.3 ? 'end' : 'middle', 'middle',
                color, this.config.labelWeight || 'normal', 'normal', this.labelGroup, this._getConfigSize('labelSize') * 0.9);
        }

        const mid = s1 + sd / 2;
        return { x: pvx + (r + 10) * Math.cos(mid), y: pvy + (r + 10) * Math.sin(mid) };
    },

    // =====================================================================
    // LABELS & LEGEND
    // =====================================================================

    _drawItemLabel(item, pos, color) {
        let anchor = pos.anchor || "start";
        let baseline = pos.baseline || "auto";
        let dx = 0, dy = 0;
        if (!pos.exact) {
            // Smart position near the end of the curve
            dx = 5; dy = -5;
            if (pos.x > this.width - 60) { anchor = "end"; dx = -5; }
            if (pos.y < 30) dy = 15;
            if (pos.x < 60) { anchor = "start"; dx = 5; }
        }
        if (item.labelOffset) { dx += item.labelOffset[0]; dy += item.labelOffset[1]; }
        if (item.labelAnchor) anchor = item.labelAnchor;

        const lx = Math.max(10, Math.min(this.width - 10, pos.x + dx));
        const ly = Math.max(10, Math.min(this.height - 10, pos.y + dy));
        const label = this._substituteLabel(item.label);
        const fs = this._getConfigSize('labelSize');

        if (hasMathJax() && label.includes("$")) {
            this._renderMathJax(label, lx, ly, fs, color, anchor, baseline === 'middle' ? 'middle' : 'auto', this.labelGroup);
        } else {
            this._text(lx, ly, label.replace(/\*/g, '·'), anchor, baseline, color,
                this.config.labelWeight || "normal", this.config.labelStyle || "normal", this.labelGroup, fs);
        }
    },

    _drawLegend(items) {
        const { padL, padR, padT, padB } = this;
        const fs = this._getConfigSize('legendSize');
        const pos = this.config.legendPosition || 'top-right';

        let w = this.config.legendWidth;
        if (!w) {
            const maxLen = items.reduce((m, it) => Math.max(m, it.label.replace(/\$|\\[a-z]+|[{}^_]/g, '').length), 0);
            w = Math.max(50, 30 + maxLen * fs * 0.5 + 15);
        }

        const rowHeights = items.map(item => {
            if (item.label.includes("$")) {
                if (item.label.includes("\\frac")) return fs * 2.5;
                if (item.label.includes("\\sum") || item.label.includes("\\int")) return fs * 2.2;
            }
            return fs * 1.5;
        });
        const totalH = 10 + rowHeights.reduce((a, b) => a + b, 0) + 10;

        const left = pos.endsWith('left') ? padL + 10 : this.width - padR - 10 - w;
        const top = pos.startsWith('bottom') ? this.height - padB - 10 - totalH : padT + 10;

        const isDark = this._isDark();
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", left); rect.setAttribute("y", top);
        rect.setAttribute("width", w); rect.setAttribute("height", totalH);
        rect.setAttribute("fill", isDark ? "#181818" : "white");
        rect.setAttribute("fill-opacity", "0.9");
        rect.setAttribute("stroke", isDark ? "#333" : "#eee");
        rect.setAttribute("class", "matephis-plot-legend-bg");
        this.legendGroup.appendChild(rect);

        const textColor = this._adaptColorForTheme("#333");
        let y = top + 10;
        items.forEach((item, i) => {
            const h = rowHeights[i];
            const cy = y + h / 2;
            const lx = left + 10;
            if (item.type === 'point') {
                this._dot(lx + 5, cy, 4, item.color, this.legendGroup);
            } else if (item.type === 'vector') {
                this._line(lx, cy, lx + 9, cy, item.color, 2, "", this.legendGroup);
                this._arrowHead(lx + 16, cy, 1, 0, 8, item.color, this.legendGroup);
            } else {
                this._line(lx, cy, lx + 15, cy, item.color, 2, item.dash, this.legendGroup);
            }
            const baselineY = cy + fs * 0.35;
            if (hasMathJax() && item.label.includes("$")) {
                this._renderMathJax(item.label, lx + 25, baselineY - 1, fs, textColor, "start", "alphabetic", this.legendGroup);
            } else {
                this._text(lx + 20, baselineY, item.label.replace(/\*/g, '·'), "start", "alphabetic", textColor,
                    this.config.labelWeight || "normal", this.config.labelStyle || "normal", this.legendGroup, fs);
            }
            y += h;
        });
    },

    /**
     * Cardinal spline through points (smoothness 0..1 -> tension 0..0.5).
     * @returns {number[][]}
     */
    _getCurvePoints(points, tension, numOfSegments) {
        const pts = [points[0].slice(), ...points.map(p => p.slice()), points[points.length - 1].slice()];
        const k = tension * 0.5;
        const res = [];
        for (let i = 1; i < pts.length - 2; i++) {
            const t1x = (pts[i + 1][0] - pts[i - 1][0]) * k, t1y = (pts[i + 1][1] - pts[i - 1][1]) * k;
            const t2x = (pts[i + 2][0] - pts[i][0]) * k, t2y = (pts[i + 2][1] - pts[i][1]) * k;
            // Skip the first sample of every segment after the first (it repeats the previous end)
            for (let t = i === 1 ? 0 : 1; t <= numOfSegments; t++) {
                const s = t / numOfSegments, s2 = s * s, s3 = s2 * s;
                const c1 = 2 * s3 - 3 * s2 + 1, c2 = -2 * s3 + 3 * s2, c3 = s3 - 2 * s2 + s, c4 = s3 - s2;
                res.push([
                    c1 * pts[i][0] + c2 * pts[i + 1][0] + c3 * t1x + c4 * t2x,
                    c1 * pts[i][1] + c2 * pts[i + 1][1] + c3 * t1y + c4 * t2y
                ]);
            }
        }
        return res;
    },
};
