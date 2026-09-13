/**
 * Coordinate System & Scale Transformations
 */

export class CoordinateSystem {
    constructor(options = {}) {
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

        let xMin = (view && view.xMin !== null) ? view.xMin : (xlim ? xlim[0] : -9.9);
        let xMax = (view && view.xMax !== null) ? view.xMax : (xlim ? xlim[1] : 9.9);
        let yMin = (view && view.yMin !== null) ? view.yMin : (ylim ? ylim[0] : -9.9);
        let yMax = (view && view.yMax !== null) ? view.yMax : (ylim ? ylim[1] : 9.9);

        // Equal Aspect
        if (equalAspect) {
            const plotW = width - padL - padR;
            const plotH = height - padT - padB;
            const ppU = plotW / (xMax - xMin);
            const reqH = plotH / ppU;
            const yc = (yMin + yMax) / 2;
            yMin = yc - reqH / 2;
            yMax = yc + reqH / 2;
        }

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

        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.isXLog = isXLog;
        this.isYLog = isYLog;
    }

    mapX(x) {
        if (this.isXLog) {
            if (x <= 0) return -30000;
            const lMin = Math.log10(this.xMin);
            const lMax = Math.log10(this.xMax);
            return this.padL + ((Math.log10(x) - lMin) / (lMax - lMin)) * (this.width - this.padL - this.padR);
        }
        return this.padL + ((x - this.xMin) / (this.xMax - this.xMin)) * (this.width - this.padL - this.padR);
    }

    mapY(y) {
        if (this.isYLog) {
            if (y <= 0) return 30000;
            const lMin = Math.log10(this.yMin);
            const lMax = Math.log10(this.yMax);
            return this.height - this.padB - ((Math.log10(y) - lMin) / (lMax - lMin)) * (this.height - this.padB - this.padT);
        }
        return this.height - this.padB - ((y - this.yMin) / (this.yMax - this.yMin)) * (this.height - this.padB - this.padT);
    }

    unmapX(px) {
        if (this.isXLog) {
            const lMin = Math.log10(this.xMin);
            const lMax = Math.log10(this.xMax);
            const lVal = lMin + ((px - this.padL) / (this.width - this.padL - this.padR)) * (lMax - lMin);
            return Math.pow(10, lVal);
        }
        return this.xMin + ((px - this.padL) / (this.width - this.padL - this.padR)) * (this.xMax - this.xMin);
    }

    unmapY(py) {
        if (this.isYLog) {
            const lMin = Math.log10(this.yMin);
            const lMax = Math.log10(this.yMax);
            const lVal = lMin + ((this.height - this.padB - py) / (this.height - this.padB - this.padT)) * (lMax - lMin);
            return Math.pow(10, lVal);
        }
        return this.yMin + ((this.height - this.padB - py) / (this.height - this.padB - this.padT)) * (this.yMax - this.yMin);
    }
}
