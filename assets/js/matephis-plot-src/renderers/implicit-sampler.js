/**
 * Implicit Curve Sampler (F(x, y) = 0)
 *
 * Marching squares on a grid sized in screen pixels, with:
 *  - saddle disambiguation using the cell centre value
 *  - rejection of sign changes caused by poles (e.g. y = 1/x written as y - 1/x)
 *  - stitching of cell segments into continuous polylines, so dash patterns
 *    and line joins render correctly and the path stays compact
 */

/**
 * @param {object} o
 * @param {(x:number, y:number) => number} o.f
 * @param {number} o.xMin @param {number} o.xMax @param {number} o.yMin @param {number} o.yMax
 * @param {(x:number) => number} o.mapX @param {(y:number) => number} o.mapY
 * @param {number} o.pxWidth - plot width in px
 * @param {number} o.pxHeight - plot height in px
 * @param {number} [o.cellPx=4] - target cell size in px
 * @param {number} [o.maxCells=40000] - cap on the number of cells
 * @returns {number[][]} polylines in screen coordinates
 */
export function sampleImplicit(o) {
    const { f, xMin, xMax, yMin, yMax, mapX, mapY } = o;
    const cellPx = o.cellPx || 4;
    let nx = Math.max(8, Math.ceil(o.pxWidth / cellPx));
    let ny = Math.max(8, Math.ceil(o.pxHeight / cellPx));
    const maxCells = o.maxCells || 40000;
    if (nx * ny > maxCells) {
        const s = Math.sqrt(maxCells / (nx * ny));
        nx = Math.max(8, Math.floor(nx * s));
        ny = Math.max(8, Math.floor(ny * s));
    }

    const dx = (xMax - xMin) / nx;
    const dy = (yMax - yMin) / ny;

    const ev = (x, y) => {
        let v;
        try { v = f(x, y); } catch (e) { v = NaN; }
        if (typeof v === 'boolean') v = v ? 1 : -1;
        return typeof v === 'number' ? v : NaN;
    };

    // Grid values, row-major: g[j * (nx + 1) + i]
    const W = nx + 1;
    const g = new Float64Array(W * (ny + 1));
    for (let j = 0; j <= ny; j++) {
        const y = yMin + j * dy;
        for (let i = 0; i <= nx; i++) g[j * W + i] = ev(xMin + i * dx, y);
    }

    // Edge crossing points are computed once per edge so neighbouring cells
    // share bit-identical coordinates (needed for stitching).
    const edgeCache = new Map();
    const crossing = (i0, j0, i1, j1) => {
        const key = i0 < i1 || j0 < j1 ? `${i0},${j0},${i1},${j1}` : `${i1},${j1},${i0},${j0}`;
        let p = edgeCache.get(key);
        if (p) return p;
        const v0 = g[j0 * W + i0], v1 = g[j1 * W + i1];
        let t = v0 / (v0 - v1);
        if (!Number.isFinite(t)) t = 0.5;
        const x = xMin + (i0 + (i1 - i0) * t) * dx;
        const y = yMin + (j0 + (j1 - j0) * t) * dy;
        // Pole rejection: a real root has a small |F| at the crossing,
        // a sign change through infinity does not.
        const fv = Math.abs(ev(x, y));
        const bound = Math.max(Math.abs(v0), Math.abs(v1));
        const pole = !(fv <= bound * 1.5 + 1e-12);
        p = { x: Math.round(mapX(x) * 100) / 100, y: Math.round(mapY(y) * 100) / 100, pole };
        p.k = `${p.x},${p.y}`;
        edgeCache.set(key, p);
        return p;
    };

    const segs = [];
    const add = (a, b) => {
        if (a.pole || b.pole || a.k === b.k) return;
        segs.push([a, b]);
    };

    for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
            const v0 = g[j * W + i], v1 = g[j * W + i + 1];
            const v2 = g[(j + 1) * W + i + 1], v3 = g[(j + 1) * W + i];
            if (Number.isNaN(v0) || Number.isNaN(v1) || Number.isNaN(v2) || Number.isNaN(v3)) continue;

            let c = 0;
            if (v0 > 0) c |= 1;
            if (v1 > 0) c |= 2;
            if (v2 > 0) c |= 4;
            if (v3 > 0) c |= 8;
            if (c === 0 || c === 15) continue;

            const B = () => crossing(i, j, i + 1, j);         // bottom edge
            const R = () => crossing(i + 1, j, i + 1, j + 1); // right edge
            const T = () => crossing(i, j + 1, i + 1, j + 1); // top edge
            const L = () => crossing(i, j, i, j + 1);         // left edge

            switch (c) {
                case 1: case 14: add(L(), B()); break;
                case 2: case 13: add(B(), R()); break;
                case 3: case 12: add(L(), R()); break;
                case 4: case 11: add(T(), R()); break;
                case 6: case 9: add(B(), T()); break;
                case 7: case 8: add(L(), T()); break;
                case 5: case 10: {
                    // Saddle: decide with the centre value
                    const centre = ev(xMin + (i + 0.5) * dx, yMin + (j + 0.5) * dy);
                    const centrePos = centre > 0;
                    if ((c === 5) === centrePos) { add(L(), T()); add(B(), R()); }
                    else { add(L(), B()); add(T(), R()); }
                    break;
                }
            }
        }
    }

    return stitch(segs);
}

/** Joins segments sharing endpoints into polylines. */
function stitch(segs) {
    const byPoint = new Map();
    const push = (k, idx) => {
        const l = byPoint.get(k);
        if (l) l.push(idx); else byPoint.set(k, [idx]);
    };
    segs.forEach((s, idx) => { push(s[0].k, idx); push(s[1].k, idx); });

    const used = new Uint8Array(segs.length);
    const lines = [];

    const nextFrom = (k) => {
        const l = byPoint.get(k);
        if (!l) return -1;
        for (const idx of l) if (!used[idx]) return idx;
        return -1;
    };

    for (let s = 0; s < segs.length; s++) {
        if (used[s]) continue;
        used[s] = 1;
        const chain = [segs[s][0], segs[s][1]];

        // Extend forward
        for (;;) {
            const tail = chain[chain.length - 1];
            const n = nextFrom(tail.k);
            if (n < 0) break;
            used[n] = 1;
            chain.push(segs[n][0].k === tail.k ? segs[n][1] : segs[n][0]);
        }
        // Extend backward
        for (;;) {
            const head = chain[0];
            const n = nextFrom(head.k);
            if (n < 0) break;
            used[n] = 1;
            chain.unshift(segs[n][0].k === head.k ? segs[n][1] : segs[n][0]);
        }

        const flat = new Array(chain.length * 2);
        chain.forEach((p, idx) => { flat[idx * 2] = p.x; flat[idx * 2 + 1] = p.y; });
        lines.push(flat);
    }
    return lines;
}
