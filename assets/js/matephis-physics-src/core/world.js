/**
 * World window: metres on both axes at the same scale.
 *
 * The requested window (xlim × ylim) always stays fully visible; the axis with
 * spare room is widened symmetrically, so 1 m is the same length horizontally
 * and vertically and nothing the author placed is cut off.
 */

/**
 * @param {[number, number]} xlim
 * @param {[number, number]} ylim
 * @param {number} plotW - drawing area width (px)
 * @param {number} plotH - drawing area height (px)
 * @returns {{xMin: number, xMax: number, yMin: number, yMax: number, scale: number}} scale in px per metre
 */
export function fitView(xlim, ylim, plotW, plotH) {
    const dx = Math.max(1e-9, xlim[1] - xlim[0]);
    const dy = Math.max(1e-9, ylim[1] - ylim[0]);
    const scale = Math.min(plotW / dx, plotH / dy);
    const w = plotW / scale, h = plotH / scale;
    const cx = (xlim[0] + xlim[1]) / 2, cy = (ylim[0] + ylim[1]) / 2;
    return { xMin: cx - w / 2, xMax: cx + w / 2, yMin: cy - h / 2, yMax: cy + h / 2, scale };
}

/** Multiples of `step` inside [lo, hi] (grid lines, ticks). */
export function gridValues(lo, hi, step) {
    if (!(step > 0) || !isFinite(lo) || !isFinite(hi)) return [];
    const out = [];
    const first = Math.ceil(lo / step - 1e-9);
    for (let k = first; k * step <= hi + 1e-9 && out.length < 1000; k++) {
        const v = +(k * step).toPrecision(12);
        out.push(Object.is(v, -0) ? 0 : v);
    }
    return out;
}
