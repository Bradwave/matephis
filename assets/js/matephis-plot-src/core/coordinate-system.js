/**
 * Coordinate System & Scale Transformations (linear and log10 axes)
 */

export class CoordinateSystem {
    constructor(options = {}) {
        // Bound so callers can destructure: const { mapX } = cs
        this.mapX = this.mapX.bind(this);
        this.mapY = this.mapY.bind(this);
        this.unmapX = this.unmapX.bind(this);
        this.unmapY = this.unmapY.bind(this);
        this.update(options);
    }

    update(options) {
        const {
            width = 600,
            height = 600,
            padL = 30,
            padR = 30,
            padT = 30,
            padB = 30,
            xlim = [-9.9, 9.9],
            ylim = [-9.9, 9.9],
            view = null,
            equalAspect = false,
            xScale = 'linear',
            yScale = 'linear'
        } = options;

        this.width = width;
        this.height = height;
        this.padL = padL;
        this.padR = padR;
        this.padT = padT;
        this.padB = padB;
        this.xScale = xScale;
        this.yScale = yScale;

        const has = (v) => v !== null && v !== undefined;
        let xMin = (view && has(view.xMin)) ? view.xMin : (xlim ? xlim[0] : -9.9);
        let xMax = (view && has(view.xMax)) ? view.xMax : (xlim ? xlim[1] : 9.9);
        let yMin = (view && has(view.yMin)) ? view.yMin : (ylim ? ylim[0] : -9.9);
        let yMax = (view && has(view.yMax)) ? view.yMax : (ylim ? ylim[1] : 9.9);

        const isXLog = xScale === 'log';
        const isYLog = yScale === 'log';

        if (isXLog && xMin <= 0) {
            xMin = 1e-10;
            if (xMax <= xMin) xMax = 10;
        }
        if (isYLog && yMin <= 0) {
            yMin = 1e-10;
            if (yMax <= yMin) yMax = 10;
        }

        // Equal aspect (1 unit on x = 1 unit on y), only meaningful on linear axes
        if (equalAspect && !isXLog && !isYLog) {
            const plotW = width - padL - padR;
            const plotH = height - padT - padB;
            const ppU = plotW / (xMax - xMin);
            const reqH = plotH / ppU;
            const yc = (yMin + yMax) / 2;
            yMin = yc - reqH / 2;
            yMax = yc + reqH / 2;
        }

        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.isXLog = isXLog;
        this.isYLog = isYLog;
        this.plotW = width - padL - padR;
        this.plotH = height - padT - padB;

        this._lx0 = isXLog ? Math.log10(xMin) : xMin;
        this._lx1 = isXLog ? Math.log10(xMax) : xMax;
        this._ly0 = isYLog ? Math.log10(yMin) : yMin;
        this._ly1 = isYLog ? Math.log10(yMax) : yMax;
    }

    /** Value -> internal linear coordinate (log10 on log axes). */
    toLinX(x) { return this.isXLog ? (x > 0 ? Math.log10(x) : NaN) : x; }
    toLinY(y) { return this.isYLog ? (y > 0 ? Math.log10(y) : NaN) : y; }
    fromLinX(u) { return this.isXLog ? Math.pow(10, u) : u; }
    fromLinY(v) { return this.isYLog ? Math.pow(10, v) : v; }

    mapX(x) {
        if (this.isXLog && x <= 0) return -30000;
        return this.padL + ((this.toLinX(x) - this._lx0) / (this._lx1 - this._lx0)) * this.plotW;
    }

    mapY(y) {
        if (this.isYLog && y <= 0) return 30000;
        return this.height - this.padB - ((this.toLinY(y) - this._ly0) / (this._ly1 - this._ly0)) * this.plotH;
    }

    unmapX(px) {
        return this.fromLinX(this._lx0 + ((px - this.padL) / this.plotW) * (this._lx1 - this._lx0));
    }

    unmapY(py) {
        return this.fromLinY(this._ly0 + ((this.height - this.padB - py) / this.plotH) * (this._ly1 - this._ly0));
    }

    /** Pixels per unit (linear axes) — used for slopes and polar radii. */
    get scaleX() { return this.plotW / (this._lx1 - this._lx0); }
    get scaleY() { return this.plotH / (this._ly1 - this._ly0); }

    /** Visible plot rectangle in screen coordinates. */
    get viewRect() {
        return { x0: this.padL, y0: this.padT, x1: this.width - this.padR, y1: this.height - this.padB };
    }

    /**
     * New limits after panning by (dxPx, dyPx) screen pixels. Works in the
     * internal linear space, so log axes pan by constant ratios.
     */
    panned(dxPx, dyPx) {
        const du = -(dxPx / this.plotW) * (this._lx1 - this._lx0);
        const dv = (dyPx / this.plotH) * (this._ly1 - this._ly0);
        return {
            xMin: this.fromLinX(this._lx0 + du), xMax: this.fromLinX(this._lx1 + du),
            yMin: this.fromLinY(this._ly0 + dv), yMax: this.fromLinY(this._ly1 + dv)
        };
    }

    /** New limits after zooming by `factor` (>1 zooms out) around screen point (px, py). */
    zoomedAt(px, py, factor, factorY = factor) {
        const u = this._lx0 + ((px - this.padL) / this.plotW) * (this._lx1 - this._lx0);
        const v = this._ly0 + ((this.height - this.padB - py) / this.plotH) * (this._ly1 - this._ly0);
        return {
            xMin: this.fromLinX(u - (u - this._lx0) * factor), xMax: this.fromLinX(u + (this._lx1 - u) * factor),
            yMin: this.fromLinY(v - (v - this._ly0) * factorY), yMax: this.fromLinY(v + (this._ly1 - v) * factorY)
        };
    }
}

/**
 * Shifts a [min, max] window so it stays inside [lo, hi] (and shrinks it if wider).
 * Used by the constrainView option.
 */
export function constrainRange(min, max, lo, hi) {
    const w = max - min;
    if (w >= hi - lo) return [lo, hi];
    if (min < lo) return [lo, lo + w];
    if (max > hi) return [hi - w, hi];
    return [min, max];
}
