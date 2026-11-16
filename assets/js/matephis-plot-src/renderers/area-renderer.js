/**
 * Areas under curves (mixin): filled regions and Riemann sums.
 *
 *   { "fn": "x^2", "fill": true }
 *   { "fn": "sin(x)", "fill": { "range": [0, "b"], "signed": true, "hatch": true } }
 *   { "fn": "f", "fill": { "to": "x/2" } }                    area between two curves
 *   { "series": [[0, 0], ...], "fill": { "range": [1, 3] } }  sampled data (physics graphs)
 *   { "fn": "x^2", "riemann": { "n": "n", "range": [0, 2], "rule": "mid", "showValue": true } }
 *
 * Fill options: "to" (the other edge: a number, or an expression in x for
 * "fn" items; default 0, the x axis), "range" [a, b] (expressions; default
 * the drawn domain), "color", "opacity", "hatch" (diagonal lines instead of
 * a flat tint), "signed" (the parts below "to" in "negColor").
 *
 * Riemann options: "n" (number of strips, an expression, so a slider can
 * drive it), "range" [a, b], "rule" ("left", "right", "mid", "trapezoid"),
 * "color", "negColor", "opacity", "signed" (default true), "showValue"
 * (writes the sum in a corner), "valueLabel" (TeX name of the sum, "S_n").
 *
 * Regions are drawn before the curve of their item, so the curve stays on top.
 */
import { formatNumber } from '../parser/expression-parser.js';

const SVG_NS = "http://www.w3.org/2000/svg";
const isArr = Array.isArray;
const finite = (v) => typeof v === 'number' && isFinite(v);

/** Splits samples [[x, y, b], ...] into polygons above (sign 1) or below (-1) the base. */
export function areaPolygons(samples, sign = 0) {
    const polys = [];
    let cur = null;
    const close = () => { if (cur && cur.top.length >= 2) polys.push(cur); cur = null; };
    samples.forEach(s => {
        if (!s || !finite(s[0]) || !finite(s[1]) || !finite(s[2])) { close(); return; }
        const [x, y, b] = s;
        const top = sign > 0 ? Math.max(y, b) : sign < 0 ? Math.min(y, b) : y;
        if (!cur) cur = { top: [], base: [] };
        cur.top.push([x, top]);
        cur.base.push([x, b]);
    });
    close();
    return polys;
}

/** Riemann sum of f over [a, b] with n strips and the given rule. */
export function riemannSum(f, a, b, n, rule = 'left') {
    n = Math.max(1, Math.round(n));
    const dx = (b - a) / n;
    let s = 0;
    for (let i = 0; i < n; i++) {
        const x0 = a + i * dx, x1 = x0 + dx;
        if (rule === 'trapezoid') s += (f(x0) + f(x1)) / 2 * dx;
        else s += f(rule === 'right' ? x1 : rule === 'mid' ? (x0 + x1) / 2 : x0) * dx;
    }
    return s;
}

export const AreaMixin = {
    /** [a, b] from "range", else the item's domain, clipped to what is in view. */
    _areaRange(spec, item, cs, fallback) {
        let a = fallback[0], b = fallback[1];
        if (isArr(spec.range) && spec.range.length === 2) {
            const ra = this._eval(spec.range[0], 'fill range start');
            const rb = this._eval(spec.range[1], 'fill range end');
            if (finite(ra) && finite(rb)) { a = Math.min(ra, rb); b = Math.max(ra, rb); }
        }
        return [a, b];
    },

    /** Diagonal hatch pattern in the given colour (one per colour and plot). */
    _hatch(color) {
        const id = `hatch_${this.uid}_${String(color).replace(/[^a-z0-9]/gi, '')}`;
        if (this._svgDefs && !this._svgDefs.querySelector(`#${id}`)) {
            const p = document.createElementNS(SVG_NS, 'pattern');
            p.setAttribute('id', id);
            p.setAttribute('patternUnits', 'userSpaceOnUse');
            p.setAttribute('width', 8); p.setAttribute('height', 8);
            p.setAttribute('patternTransform', 'rotate(45)');
            const l = document.createElementNS(SVG_NS, 'line');
            l.setAttribute('x1', 0); l.setAttribute('y1', 0); l.setAttribute('x2', 0); l.setAttribute('y2', 8);
            l.setAttribute('stroke', color); l.setAttribute('stroke-width', 2.2);
            p.appendChild(l);
            this._svgDefs.appendChild(p);
        }
        return `url(#${id})`;
    },

    _polygonPath(poly, cs) {
        const pts = [...poly.top, ...poly.base.slice().reverse()];
        return pts.map((p, i) => `${i ? 'L' : 'M'}${cs.mapX(p[0]).toFixed(2)} ${cs.mapY(p[1]).toFixed(2)}`).join(' ') + ' Z';
    },

    _fillPath(d, color, opacity, hatch) {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', 'none');
        if (hatch) {
            path.setAttribute('fill', this._hatch(color));
            path.setAttribute('opacity', opacity !== undefined ? opacity : 0.75);
        } else {
            path.setAttribute('fill', color);
            path.setAttribute('fill-opacity', opacity !== undefined ? opacity : 0.25);
        }
        path.setAttribute('class', 'matephis-plot-area');
        this.dataGroup.appendChild(path);
        return path;
    },

    /** Samples [x, y, base] of the item over [a, b], or null when it cannot be filled. */
    _areaSamples(item, spec, cs, a, b) {
        const baseSrc = spec.to !== undefined ? spec.to : 0;
        if (item.fn) {
            const f = this._itemFn(item);
            const g = typeof baseSrc === 'number' ? () => baseSrc : this.compiler.fn(String(baseSrc), ['x'], { complex: false });
            const n = Math.max(80, Math.round(this._sampleSteps(1)));
            const out = [];
            for (let i = 0; i <= n; i++) {
                const x = a + (b - a) * i / n;
                out.push([x, f(x), g(x)]);
            }
            return out;
        }
        if (isArr(item.series)) {
            const base = this._eval(baseSrc, 'fill to');
            const pts = item.series.filter(p => isArr(p) && finite(p[0]) && finite(p[1]));
            const out = [];
            const lerp = (p, q, x) => p[1] + (q[1] - p[1]) * (x - p[0]) / ((q[0] - p[0]) || 1);
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i], q = pts[i + 1];
                if (p[0] >= a && p[0] <= b) out.push([p[0], p[1], base]);
                // Exact edges at a and b, between two samples
                if (q) {
                    [a, b].forEach(e => {
                        if ((p[0] < e && q[0] > e) || (p[0] > e && q[0] < e)) out.push([e, lerp(p, q, e), base]);
                    });
                }
            }
            out.sort((u, v) => u[0] - v[0]);
            return out;
        }
        return null;
    },

    /** "fill": the region between the curve of the item and "to". */
    _drawFill(st) {
        const { item, idx, cs, color } = st;
        const spec = item.fill === true ? {} : typeof item.fill === 'string' ? { color: item.fill } : item.fill;
        if (!spec || typeof spec !== 'object') return;
        let fallback = [cs.xMin, cs.xMax];
        const dom = item.fn ? this._domainOf(item) : null;
        if (dom) fallback = [Math.max(dom[0], cs.xMin), Math.min(dom[1], cs.xMax)];
        if (isArr(item.series) && item.series.length) {
            const xs = item.series.filter(p => isArr(p) && finite(p[0])).map(p => p[0]);
            if (xs.length) fallback = [Math.min(...xs), Math.max(...xs)];
        }
        const [a, b] = this._areaRange(spec, item, cs, fallback);
        if (!(b > a)) return;
        const samples = this._areaSamples(item, spec, cs, a, b);
        if (!samples || samples.length < 2) return;
        const fillColor = spec.color ? this._getColor(idx, spec.color) : color;
        if (spec.signed === true) {
            const neg = spec.negColor ? this._getColor(idx, spec.negColor) : this._getColor(idx, 'red1');
            areaPolygons(samples, 1).forEach(p => this._fillPath(this._polygonPath(p, cs), fillColor, spec.opacity, spec.hatch === true));
            areaPolygons(samples, -1).forEach(p => this._fillPath(this._polygonPath(p, cs), neg, spec.opacity, spec.hatch === true));
        } else {
            areaPolygons(samples, 0).forEach(p => this._fillPath(this._polygonPath(p, cs), fillColor, spec.opacity, spec.hatch === true));
        }
    },

    /** "riemann": rectangles (or trapezoids) under a function. */
    _drawRiemann(st) {
        const { item, idx, cs, color } = st;
        const spec = item.riemann;
        if (!item.fn) throw new Error("'riemann' needs a function ('fn')");
        if (!spec || typeof spec !== 'object') throw new Error("'riemann' needs an object: { \"n\": 10, \"range\": [a, b] }");
        const f = this._itemFn(item);
        const dom = this._domainOf(item);
        const [a, b] = this._areaRange(spec, item, cs, dom || [cs.xMin, cs.xMax]);
        let n = spec.n !== undefined ? this._eval(spec.n, 'riemann n') : 10;
        if (!finite(n) || !(b > a)) return;
        n = Math.min(2000, Math.max(1, Math.round(n)));
        const rule = ['left', 'right', 'mid', 'trapezoid'].includes(spec.rule) ? spec.rule : 'left';
        const pos = spec.color ? this._getColor(idx, spec.color) : color;
        const neg = spec.signed === false ? pos : spec.negColor ? this._getColor(idx, spec.negColor) : this._getColor(idx, 'red1');
        const opacity = spec.opacity !== undefined ? spec.opacity : 0.22;
        const dx = (b - a) / n;
        const y0 = cs.mapY(0);
        // Thin strips get no outline, or they would be a solid block
        const outline = Math.abs(cs.mapX(a + dx) - cs.mapX(a)) >= 4;
        for (let i = 0; i < n; i++) {
            const x0 = a + i * dx, x1 = x0 + dx;
            let d, h;
            if (rule === 'trapezoid') {
                const f0 = f(x0), f1 = f(x1);
                if (!finite(f0) || !finite(f1)) continue;
                h = f0 + f1;
                d = `M${cs.mapX(x0)} ${y0} L${cs.mapX(x0)} ${cs.mapY(f0)} L${cs.mapX(x1)} ${cs.mapY(f1)} L${cs.mapX(x1)} ${y0} Z`;
            } else {
                h = f(rule === 'right' ? x1 : rule === 'mid' ? (x0 + x1) / 2 : x0);
                if (!finite(h)) continue;
                d = `M${cs.mapX(x0)} ${y0} L${cs.mapX(x0)} ${cs.mapY(h)} L${cs.mapX(x1)} ${cs.mapY(h)} L${cs.mapX(x1)} ${y0} Z`;
            }
            const c = h < 0 ? neg : pos;
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', d);
            path.setAttribute('fill', c);
            path.setAttribute('fill-opacity', opacity);
            if (outline) { path.setAttribute('stroke', c); path.setAttribute('stroke-width', 1.2); path.setAttribute('stroke-opacity', 0.9); }
            path.setAttribute('class', 'matephis-plot-area');
            this.dataGroup.appendChild(path);
        }
        if (spec.showValue === true) {
            const s = riemannSum(f, a, b, n, rule);
            const name = spec.valueLabel !== undefined ? String(spec.valueLabel) : 'S_{' + n + '}';
            const digits = spec.digits !== undefined ? this._eval(spec.digits, 'riemann digits') : 3;
            this._drawRiemannValue(`$${name} = ${formatNumber(s, digits).replace('.', '{,}')}$`, pos);
        }
    },

    /** The value of a Riemann sum, in the top-left corner of the plot area. */
    _drawRiemannValue(tex, color) {
        const k = this._riemannValueCount = (this._riemannValueCount || 0) + 1;
        const x = this.padL + 36, y = this.padT + 8 + (k - 1) * 26;
        const lbl = { x, y, anchor: 'start', baseline: 'hanging' };
        if (typeof this._drawPointLabel === 'function') {
            this._drawPointLabel(tex, lbl.x, lbl.y + 14, color, 'normal');
        }
    },
};
