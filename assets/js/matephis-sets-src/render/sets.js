/**
 * Drawing of the sets themselves: ovals (finite sets), segments (intervals),
 * boxes and disks (plane regions), their elements, and the header with the
 * set names and the arrows A --f--> B between them.
 */
import { niceNumber } from '../core/interval.js';
import { setLabelText } from '../core/layout.js';
import { arrowHeadPoints } from '../core/geometry.js';

const f2 = (v) => +v.toFixed(2);

export function drawSets(scene) {
    const { model, layout, groups } = scene;
    model.sets.forEach(set => {
        const P = layout.sets.get(set.id);
        if (!P) return;
        const color = set.color ? scene.color(set.color) : null;
        const g = scene.svgEl('g', { class: `mps-set mps-set-${set.kind}`, 'data-set': set.id }, groups.sets);
        if (set.kind === 'finite') {
            const el = scene.svgEl('ellipse', { cx: f2(P.cx), cy: f2(P.cy), rx: f2(P.rx), ry: f2(P.ry), class: 'mps-outline' }, g);
            if (color) el.style.stroke = color;
        } else if (set.kind === 'interval') {
            drawInterval(scene, set, P, g, color);
        } else if (set.kind === 'rect') {
            drawRect(scene, set, P, g, color);
        } else {
            const { cx, cy, r, open } = set.disk;
            const [px, py] = P.toPx([cx, cy]);
            const el = scene.svgEl('circle', { cx: f2(px), cy: f2(py), r: f2(r * P.scale), class: 'mps-region' }, g);
            if (open) el.setAttribute('stroke-dasharray', '6 4');
            if (color) el.style.stroke = color;
        }
    });
}

/** Endpoint marker: filled dot (closed), hollow dot (open), arrow (infinite). */
function endpoint(scene, g, x, y, closed, color) {
    const c = scene.svgEl('circle', { cx: f2(x), cy: f2(y), r: 4.2, class: closed ? 'mps-end-closed' : 'mps-end-open' }, g);
    if (color) c.style[closed ? 'fill' : 'stroke'] = color;
    if (color && closed) c.style.stroke = color;
    return c;
}

function drawInterval(scene, set, P, g, color) {
    const I = set.I, w = set.window;
    const ink = color || scene.ink;
    // Thin axis over the whole window, bold over the interval itself
    const axis = scene.svgEl('line', { x1: f2(P.start[0]), y1: f2(P.start[1]), x2: f2(P.end[0]), y2: f2(P.end[1]), class: 'mps-axis' }, g);
    if (color) axis.style.stroke = color;
    const lo = Math.max(isFinite(I.lo) ? I.lo : w[0], w[0]), hi = Math.min(isFinite(I.hi) ? I.hi : w[1], w[1]);
    if (!(hi >= lo)) return;
    const a = P.toPx(lo), b = P.toPx(hi);
    const line = scene.svgEl('line', { x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), class: 'mps-interval' }, g);
    if (color) line.style.stroke = color;
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const ends = [
        { t: I.lo, px: a, closed: I.loClosed, inf: !isFinite(I.lo) || I.lo < w[0], dir: ang + Math.PI },
        { t: I.hi, px: b, closed: I.hiClosed, inf: !isFinite(I.hi) || I.hi > w[1], dir: ang },
    ];
    // A dynagraph has ticks with numbers; the endpoints then need no number of their own
    const ticks = scene.dynagraph && scene.dynagraph.ticks !== false;
    if (ticks) drawTicks(scene, set, P, g);
    const tickDraw = set.def.endpoints !== false && !ticks;
    ends.forEach(e => {
        if (e.inf) {
            const head = scene.svgEl('polygon', { points: arrowHeadPoints(e.px[0] + 6 * Math.cos(e.dir), e.px[1] + 6 * Math.sin(e.dir), e.dir, 9) }, g);
            head.style.fill = ink;
        } else {
            endpoint(scene, g, e.px[0], e.px[1], e.closed, color);
        }
        if (!tickDraw || e.inf) return;
        const [x, y] = e.px;
        const size = scene.fontSize * 0.85;
        const opts = { size, parent: scene.groups.labels, color: scene.ink };
        if (P.orient === 'row') {
            const before = P.tickSide === 'before';
            scene.text(x + (before ? -20 : 20), y, niceNumber(e.t), { ...opts, anchor: before ? 'end' : 'start' });
        } else {
            const before = P.tickSide === 'before';
            scene.text(x, y + (before ? -22 : 24), niceNumber(e.t), { ...opts, baseline: 'middle' });
        }
    });
}

/** A step of 1, 2 or 5 times a power of ten, giving about `n` ticks over a span. */
export function niceStep(span, n = 8) {
    const raw = span / n;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/** Ticks and numbers along an interval of a dynagraph, at multiples of a step. */
function drawTicks(scene, set, P, g) {
    const w = set.window;
    const given = scene.dynagraph.ticks;
    // About one number every 48 px, so fractions fit side by side
    const room = Math.max(2, Math.floor(P.length / 48));
    const step = typeof given === 'number' && given > 0 && (w[1] - w[0]) / given <= 60 ? given : niceStep(w[1] - w[0], Math.min(8, room));
    const size = scene.fontSize * 0.8;
    const before = P.tickSide === 'before';
    for (let k = Math.ceil(w[0] / step - 1e-9); k * step <= w[1] + 1e-9; k++) {
        const t = k * step;
        const [x, y] = P.toPx(t);
        scene.svgEl('line', { x1: f2(x), y1: f2(y - 5), x2: f2(x), y2: f2(y + 5), class: 'mps-tick' }, g);
        scene.text(x, y + (before ? -18 : 19), niceNumber(Math.abs(t) < 1e-12 ? 0 : t), { size, parent: scene.groups.labels, color: scene.ink });
    }
}

function drawRect(scene, set, P, g, color) {
    const { x, y, w, h } = P.box;
    const [sx, sy] = set.sides;
    scene.svgEl('rect', { x: f2(x), y: f2(y), width: f2(w), height: f2(h), class: 'mps-region-fill' }, g);
    // Each side solid when it belongs to the set, dashed when it does not
    const sides = [
        { a: [x, y + h], b: [x + w, y + h], closed: sy.loClosed },   // bottom: y = min
        { a: [x + w, y + h], b: [x + w, y], closed: sx.hiClosed },   // right: x = max
        { a: [x + w, y], b: [x, y], closed: sy.hiClosed },           // top: y = max
        { a: [x, y], b: [x, y + h], closed: sx.loClosed },           // left: x = min
    ];
    sides.forEach(s => {
        const l = scene.svgEl('line', { x1: f2(s.a[0]), y1: f2(s.a[1]), x2: f2(s.b[0]), y2: f2(s.b[1]), class: 'mps-region-side' }, g);
        if (!s.closed) l.setAttribute('stroke-dasharray', '6 4');
        if (color) l.style.stroke = color;
    });
    if (set.def.endpoints === false) return;
    const size = scene.fontSize * 0.8;
    const opts = { size, parent: scene.groups.labels, color: scene.ink };
    const [wx, wy] = set.windows;
    scene.text(x, y + h + 13, niceNumber(wx[0]), opts);
    scene.text(x + w, y + h + 13, niceNumber(wx[1]), opts);
    scene.text(x - 8, y + h, niceNumber(wy[0]), { ...opts, anchor: 'end' });
    scene.text(x - 8, y, niceNumber(wy[1]), { ...opts, anchor: 'end' });
}

/** Dots and labels of the elements of finite sets (on top of the arrows). */
export function drawElements(scene) {
    const { model, layout, groups } = scene;
    const fs = scene.fontSize;
    model.sets.forEach(set => {
        if (set.kind !== 'finite') return;
        const P = layout.sets.get(set.id);
        P.elements.forEach((pos, id) => {
            const el = set.elementById.get(id);
            const color = el.color ? scene.color(el.color) : null;
            const g = scene.svgEl('g', {
                class: 'mps-el', 'data-node': `${set.id}|${id}`, tabindex: 0,
                'aria-label': `${el.label.replace(/[\\{}$]/g, '')} in ${String(setLabelText(model, set)).replace(/[\\{}$]/g, '')}`,
            }, groups.elements);
            // A wider transparent target makes hovering easy
            scene.svgEl('circle', { cx: f2(pos.x), cy: f2(pos.y), r: 12, class: 'mps-hit' }, g);
            const dot = scene.svgEl('circle', { cx: f2(pos.x), cy: f2(pos.y), r: 3.6, class: 'mps-dot' }, g);
            if (color) dot.style.fill = color;
            const opts = { parent: g, color: color || scene.ink };
            if (pos.side === 'across') {
                if (P.orient === 'row') scene.text(pos.x, pos.y - fs * 0.8, el.label, opts);
                else scene.text(pos.x + 8, pos.y - fs * 0.55, el.label, { ...opts, anchor: 'start' });
            } else if (P.orient === 'row') {
                const before = pos.side === 'before';
                scene.text(pos.x + (before ? -9 : 9), pos.y, el.label, { ...opts, anchor: before ? 'end' : 'start' });
            } else {
                const before = pos.side === 'before';
                scene.text(pos.x, pos.y + (before ? -fs * 0.85 : fs * 0.85), el.label, opts);
            }
            scene.interaction.addNode(`${set.id}|${id}`, g);
        });
    });
}

/**
 * Header: set names, and an arrow labelled with the map's name between two
 * consecutive sets (A --f--> B). Several maps between the same sets share
 * one arrow ("f, g").
 */
export function drawHeader(scene, maps) {
    const { model, layout, groups } = scene;
    const row = layout.orient === 'row';
    const hv = layout.header.v;
    const names = new Map();
    model.sets.forEach(set => {
        const P = layout.sets.get(set.id);
        const label = setLabelText(model, set);
        const size = scene.measure(label);
        const [x, y] = row ? [P.u, hv] : [hv, P.u];
        scene.text(x, y, label, { parent: groups.header, anchor: row ? 'middle' : 'end', color: set.color ? scene.color(set.color) : scene.ink });
        names.set(set.id, { u: P.u, half: row ? size.w / 2 : size.h / 2, w: size.w });
    });
    if (scene.config.mapLabels === false) return;
    const pairs = new Map();
    maps.forEach(m => {
        const key = `${m.from.id}>${m.to.id}`;
        if (!pairs.has(key)) pairs.set(key, []);
        pairs.get(key).push(m);
    });
    pairs.forEach((list, key) => {
        const { from, to } = list[0];
        if (from === to) {
            // A map into itself: its name beside the arcs (left of the set in a
            // row, over the set's name in a column)
            const P = layout.sets.get(from.id);
            // Only the maps drawn (or iterated): a hidden f under f^2 is not named
            const named = list.filter(m => scene.layers.some(l => l.arrows && l.map === m && scene.isVisible(l))
                || (scene.orbits && scene.orbits.items.some(it => it.map === m)));
            if (!named.length) return;
            const label = named.map(m => m.label).join(',\\ ');
            const color = named.length === 1 && named[0].color ? scene.color(named[0].color) : scene.ink;
            if (row) {
                const reach = from.kind === 'finite' ? P.rx : Math.min(P.selfRoom || 40, 60);
                scene.text(P.cx - reach - 10, P.cy, label, { parent: groups.header, color, anchor: 'end' });
            } else {
                scene.text(hv, P.u - scene.fontSize * 1.5, label, { parent: groups.header, color, anchor: 'end' });
            }
            return;
        }
        // Maps both ways (f and its inverse): two parallel arrows, the way back
        // under (row) or left of (column) the way there, each with its label
        const back = pairs.has(`${to.id}>${from.id}`) ? (from.index < to.index ? 0 : 1) : -1;
        const A = names.get(from.id), B = names.get(to.id);
        const dir = Math.sign(B.u - A.u) || 1;
        const u1 = A.u + dir * (A.half + 10), u2 = B.u - dir * (B.half + 10);
        if ((u2 - u1) * dir < 16) return;
        const color = list.length === 1 && list[0].color ? scene.color(list[0].color) : scene.ink;
        // Row: a horizontal arrow between the names. Column: a vertical one
        // under the names (right-aligned at hv), its label on the left
        const shift = back === 0 ? -3 : back === 1 ? 3 : 0;
        const ax = hv - 8 - (row ? 0 : shift);
        const hy = hv + (row ? shift : 0);
        const [x1, y1] = row ? [u1, hy] : [ax, u1];
        const [x2, y2] = row ? [u2, hy] : [ax, u2];
        const g = scene.svgEl('g', { class: 'mps-map-header' }, groups.header);
        const line = scene.svgEl('line', { x1: f2(x1), y1: f2(y1), x2: f2(x2), y2: f2(y2), class: 'mps-header-arrow' }, g);
        line.style.stroke = color;
        const head = scene.svgEl('polygon', { points: arrowHeadPoints(x2, y2, Math.atan2(y2 - y1, x2 - x1), 8) }, g);
        head.style.fill = color;
        const label = list.map(m => m.label).join(',\\ ');
        if (row) scene.text((x1 + x2) / 2, back === 1 ? hy + 16 : hy - 14, label, { parent: g, color });
        else scene.text(back === -1 ? ax - 8 : hv - 22, (y1 + y2) / 2 + (back === 0 ? -10 : back === 1 ? 10 : 0), label, { parent: g, color, anchor: 'end' });
    });
}
