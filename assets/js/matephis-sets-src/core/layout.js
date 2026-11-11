/**
 * Layout of a sets diagram in screen pixels, without DOM.
 *
 * Sets are placed side by side ("row", the default: A, B, C from left to
 * right, elements in columns) or one under the other ("column"). The code
 * works in two abstract directions:
 *   u: across the sets (x in a row, y in a column)
 *   v: along a set     (y in a row, x in a column)
 * and converts to screen coordinates at the end.
 *
 * Above the sets (row) or on their left (column) is the "header": set names
 * and the arrows A --f--> B between consecutive sets. Maps between sets that
 * are not next to each other (compositions) go on the other side, the
 * "footer".
 */

const MARGIN = 16;

/**
 * Display order of the elements of each finite set. A codomain is sorted by
 * the mean position of its preimages (fewer crossing arrows); elements nobody
 * maps to go last, so the image is one block that a single loop can circle.
 * A set with "order": "given" (or the root option "reorder": false) keeps the
 * order of its config.
 */
export function elementOrder(model, { reorder = true } = {}) {
    const order = new Map();
    model.sets.forEach(set => {
        if (set.kind === 'finite') order.set(set.id, set.elements.map(e => e.id));
    });
    if (!reorder) return order;
    // Sets in the order they are drawn: a set's order depends on the sets before it
    model.sets.forEach(set => {
        if (set.kind !== 'finite' || set.def.order === 'given') return;
        const incoming = model.maps.filter(m => m.kind !== 'compose' && m.to === set && m.from.kind === 'finite' && m.from.index < set.index);
        if (!incoming.length) return;
        const scores = new Map();
        incoming.forEach(map => {
            const src = order.get(map.from.id);
            src.forEach((aId, i) => {
                model.apply(map, aId).forEach(b => {
                    if (typeof b !== 'string') return;
                    const s = scores.get(b) || { sum: 0, n: 0 };
                    s.sum += i / Math.max(1, src.length - 1);
                    s.n += 1;
                    scores.set(b, s);
                });
            });
        });
        const given = set.elements.map(e => e.id);
        const key = (id) => {
            const s = scores.get(id);
            return s ? s.sum / s.n : 2 + given.indexOf(id) / given.length;
        };
        order.set(set.id, given.slice().sort((a, b) => key(a) - key(b) || given.indexOf(a) - given.indexOf(b)));
    });
    return order;
}

/**
 * @param {object} model - SetsModel
 * @param {object} opts
 * @param {number} opts.width - available width in px
 * @param {'row'|'column'} [opts.orient]
 * @param {number} [opts.fontSize]
 * @param {(label: string) => {w: number, h: number}} opts.measure - size of a label
 * @param {Map} [opts.order] - from elementOrder
 * @param {boolean} [opts.footer] - leave room under (row) / beside (column) the sets for routed maps
 * @param {number} [opts.spacing] - distance between consecutive elements
 * @param {number} [opts.height] - fixed height (row only)
 */
export function computeLayout(model, opts) {
    const orient = opts.orient === 'column' ? 'column' : 'row';
    const fs = opts.fontSize || 16;
    const measure = opts.measure;
    const order = opts.order || elementOrder(model);
    const sets = model.sets;
    const n = Math.max(1, sets.length);
    const W = Math.max(120, opts.width);
    const labelH = fs * 1.3;

    // Widest element label, for the thickness of the ovals
    let maxEl = 0;
    sets.forEach(s => {
        if (s.kind === 'finite') s.elements.forEach(e => { maxEl = Math.max(maxEl, measure(e.label).w); });
    });
    const maxCount = Math.max(1, ...sets.filter(s => s.kind === 'finite').map(s => s.elements.length));

    const out = { orient, sets: new Map(), width: W, height: 0, fontSize: fs };

    if (orient === 'row') {
        const slot = (W - 2 * MARGIN) / n;
        const spacing = opts.spacing || Math.max(fs * 2.1, 30);
        const header = labelH + 30;
        const footer = opts.footer ? 54 : 14;
        // Ovals: same height for all, wide enough for a dot and its label
        // Continuous sets need room for the arrows from sample points to spread out
        const continuous = sets.some(st => st.kind !== 'finite');
        const ry = Math.max(continuous ? 115 : 64, (maxCount - 1) * spacing / 2 + 34);
        const rx = Math.min(slot * 0.36, Math.max(40, maxEl + 26));
        let extent = 2 * ry;
        if (opts.height) extent = Math.max(80, opts.height - header - footer);
        const H = header + extent + footer;
        const cy = header + extent / 2;
        sets.forEach((set, i) => {
            const cx = MARGIN + slot * (i + 0.5);
            out.sets.set(set.id, placeSet(model, set, { orient, cx, cy, slot, rx, ry: extent / 2, spacing, order, fs, measure, labelH }));
        });
        out.height = H;
        out.header = { v: header - 12 - labelH / 2 };
        out.footer = { v: header + extent + 22 };
        return out;
    }

    // Column: sets one under the other, elements in rows
    const left = 0;
    const spacing = opts.spacing || Math.max(maxEl + 24, 44);
    const headerW = Math.max(...sets.map(s => measure(setLabelText(model, s)).w), 20) + 34;
    const footerW = opts.footer ? 54 : 8;
    const along = W - 2 * MARGIN - headerW - footerW;
    const gap = Math.max(70, fs * 4.5);
    let y = MARGIN + 6;
    sets.forEach((set, i) => {
        const thick = set.kind === 'finite' ? 2 * (labelH + 18) : set.kind === 'interval' ? labelH * 2 + 20 : Math.min(along, 220);
        const cx = left + MARGIN + headerW + along / 2;
        const cy = y + thick / 2;
        out.sets.set(set.id, placeSet(model, set, {
            orient, cx, cy, slot: along, rx: thick / 2, ry: along / 2, spacing, order, fs, measure, labelH, alongMax: along,
        }));
        y += thick + (i < sets.length - 1 ? gap : 0);
    });
    // Footer: also a line under the last set (labels of collisions)
    out.height = y + MARGIN + (opts.footer ? 20 : 0);
    out.header = { v: MARGIN + headerW - 16 };
    out.footer = { v: W - MARGIN - footerW + 26 };
    return out;
}

/** Text of a set's name label (its "label", or the interval it is). */
export function setLabelText(model, set) {
    if (set.label !== undefined) return String(set.label);
    if (set.kind === 'interval') return set.def.interval !== undefined ? String(set.def.interval) : set.id;
    return set.id;
}

/** Converts abstract (u, v) to screen [x, y]. */
const toXY = (orient, u, v) => (orient === 'row' ? [u, v] : [v, u]);

function placeSet(model, set, o) {
    const { orient, cx, cy } = o;
    const P = { id: set.id, kind: set.kind, cx, cy, orient };
    // Abstract centre: u across, v along
    const uc = orient === 'row' ? cx : cy, vc = orient === 'row' ? cy : cx;
    const role = setRole(model, set);
    P.role = role;

    if (set.kind === 'finite') {
        const ids = o.order.get(set.id) || set.elements.map(e => e.id);
        const k = ids.length;
        let ru = o.rx, rv = o.ry;
        let spacing = o.spacing;
        if (orient === 'column') {
            // Elements along x: shrink the spacing when the row is long
            spacing = Math.min(o.spacing, (o.alongMax - 40) / Math.max(1, k));
            rv = Math.max(60, (k - 1) * spacing / 2 + spacing * 0.75);
            rv = Math.min(rv, o.alongMax / 2);
        }
        P.ru = ru;
        P.rv = rv;
        const [rx, ry] = orient === 'row' ? [ru, rv] : [rv, ru];
        P.rx = rx;
        P.ry = ry;
        P.elements = new Map();
        // Element labels: away from the arrows where possible
        // A set in the middle of a chain has arrows on both sides: its labels go across them
        // (above the dot in a row, beside it in a column)
        const side = set.def.labelSide || (role === 'source' ? 'before' : role === 'target' ? 'after' : role === 'both' ? 'across' : 'before');
        ids.forEach((id, j) => {
            const v = vc + (j - (k - 1) / 2) * spacing;
            const [x, y] = toXY(orient, uc, v);
            P.elements.set(id, { x, y, side });
        });
    } else if (set.kind === 'interval') {
        const L = Math.max(60, 2 * o.ry - 36);
        P.length = L;
        const w = set.window;
        // Row: lo at the bottom, hi at the top. Column: lo on the left
        const vAt = (t) => (orient === 'row' ? vc + L / 2 - (t - w[0]) / (w[1] - w[0]) * L : vc - L / 2 + (t - w[0]) / (w[1] - w[0]) * L);
        P.toPx = (t) => toXY(orient, uc, vAt(t));
        P.start = P.toPx(w[0]);
        P.end = P.toPx(w[1]);
        P.tickSide = role === 'source' ? 'before' : 'after';
    } else {
        // Plane regions: a box with the same scale on both axes
        let wx, wy;
        if (set.kind === 'rect') [wx, wy] = set.windows;
        else {
            const { cx: dx, cy: dy, r } = set.disk;
            wx = [dx - r, dx + r];
            wy = [dy - r, dy + r];
        }
        const maxW = orient === 'row' ? Math.min(o.slot * 0.62, 2 * o.ry) : Math.min(o.alongMax, 2 * o.rx);
        const maxH = orient === 'row' ? 2 * o.ry - 12 : 2 * o.rx;
        const sx = (wx[1] - wx[0]) || 1, sy = (wy[1] - wy[0]) || 1;
        const scale = Math.min(maxW / sx, maxH / sy);
        const bw = sx * scale, bh = sy * scale;
        P.box = { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
        P.scale = scale;
        P.toPx = (p) => [P.box.x + (p[0] - wx[0]) * scale, P.box.y + bh - (p[1] - wy[0]) * scale];
        P.fromPx = (x, y) => [wx[0] + (x - P.box.x) / scale, wy[0] + (P.box.y + bh - y) / scale];
    }

    // Abstract extent along v, for the set name and routed maps
    const halfV = set.kind === 'finite' ? P.rv : set.kind === 'interval' ? P.length / 2 + 8 : (orient === 'row' ? P.box.h : P.box.w) / 2;
    const halfU = set.kind === 'finite' ? P.ru : set.kind === 'interval' ? 10 : (orient === 'row' ? P.box.w : P.box.h) / 2;
    P.halfV = halfV;
    P.halfU = halfU;
    P.u = uc;
    P.v = vc;
    if (set.kind === 'interval') {
        P.fromPx = (x, y) => {
            const w = set.window, L = P.length;
            const along = orient === 'row' ? (vc + L / 2 - y) / L : (x - (vc - L / 2)) / L;
            return w[0] + along * (w[1] - w[0]);
        };
    }
    return P;
}

/** 'source' (only arrows out), 'target' (only arrows in), 'both' or 'none'. */
function setRole(model, set) {
    const out = model.maps.some(m => m.kind !== 'compose' && m.from === set);
    const inn = model.maps.some(m => m.kind !== 'compose' && m.to === set);
    return out && inn ? 'both' : out ? 'source' : inn ? 'target' : 'none';
}

/** Screen position of an element of a finite set, or of a point of a continuous one. */
export function pointPx(layout, set, x) {
    const P = layout.sets.get(set.id);
    if (!P) return null;
    if (set.kind === 'finite') {
        const e = P.elements.get(String(x));
        return e ? [e.x, e.y] : null;
    }
    if (set.kind === 'interval') return typeof x === 'number' && isFinite(x) ? P.toPx(x) : null;
    return Array.isArray(x) ? P.toPx(x) : null;
}
