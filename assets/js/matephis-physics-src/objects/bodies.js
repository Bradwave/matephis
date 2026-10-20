/**
 * Bodies: things forces act on. Each one is placed `at` a point (with an
 * optional `angle`) or rests `on` a surface at `pos`, and exposes anchors in
 * its own rotated frame plus a frame (tangent / normal) used by directions
 * like "normal" and by decomposition. Lengths are metres.
 */
import { add, sub, lerp, fromLocal, fromAngle, perp, norm, dist, angleOf } from '../core/vec.js';
import { boxAnchor, roundAnchor, BOX_ANCHORS, ROUND_ANCHORS } from '../core/anchors.js';
import { polyline, colorStyle } from '../core/draw.js';
import { argNum, argAngle, SURFACE_LABELS, massOf, circlePoints } from './shared.js';

/** Frame of a placed body: the surface frame when it rests on one. */
function bodyFrame(place) {
    return { t: place.frame.t, n: place.frame.n, labels: place.support ? SURFACE_LABELS : ["x'", "y'"] };
}

function bodyStyle(obj, ctx) {
    const parts = [];
    if (obj.color) parts.push(`stroke: ${ctx.color(obj.color)}`);
    if (obj.fill) parts.push(`fill: ${ctx.color(obj.fill)}`);
    return parts.length ? parts.join('; ') : undefined;
}

function centerLabel(obj, st, ctx, g) {
    if (!obj.label) return;
    const c = ctx.map(st.pos);
    ctx.text(c.x, c.y, obj.label, { color: ctx.ink, parent: g });
}

/** Particle: a point with an optional label. `radius` is in pixels (drawing only). */
const particle = {
    keys: ['radius'],
    layer: 'bodies',
    anchorNames: ['center', 'com'],
    resolve(obj, r) {
        const p = r.place(obj, 0);
        if (!p) return null;
        return { pos: p.pos, com: p.pos, angle: p.angle, frame: bodyFrame(p), support: p.support, mass: massOf(obj, r) };
    },
    anchor(st, name) {
        return name === 'center' || name === 'com' ? st.pos : null;
    },
    render(obj, st, ctx, g) {
        const c = ctx.map(st.pos);
        const color = ctx.color(obj.color);
        const rad = obj.radius !== undefined ? ctx.r.num(obj.radius, 'radius') : 5;
        ctx.svg('circle', { cx: c.x, cy: c.y, r: rad, fill: obj.fill ? ctx.color(obj.fill) : color, stroke: color, 'stroke-width': 1.5 }, g);
        if (obj.label) {
            const off = Array.isArray(obj.labelOffset) ? obj.labelOffset : [rad + 4, rad + 4];
            ctx.text(c.x + off[0], c.y - off[1], obj.label, { anchor: 'start', baseline: 'auto', color, parent: g });
        }
    },
};

/** Block: a w × h rectangle. On a surface, its bottom face lies on it. */
const block = {
    keys: ['size'],
    layer: 'bodies',
    anchorNames: [...BOX_ANCHORS, 'surface(u)'],
    resolve(obj, r) {
        const size = Array.isArray(obj.size) ? obj.size : [1, 0.6];
        const w = r.num(size[0], 'block size'), h = r.num(size[1], 'block size');
        if (!(w > 0 && h > 0)) return null;
        const p = r.place(obj, h / 2);
        if (!p) return null;
        const tl = boxAnchor(p.pos, p.angle, w, h, 'tl'), tr = boxAnchor(p.pos, p.angle, w, h, 'tr');
        const t = norm(sub(tr, tl));
        return {
            pos: p.pos, com: p.pos, angle: p.angle, w, h, frame: bodyFrame(p), support: p.support, mass: massOf(obj, r),
            // Another body can rest on the top face
            surface: (u) => ({ point: lerp(tl, tr, u), tangent: t, normal: perp(t) }),
            surfaceLength: w,
        };
    },
    anchor(st, name, arg, r) {
        if (name === 'surface') {
            const u = argNum(arg, r, 'surface(u)');
            return isFinite(u) ? st.surface(u).point : null;
        }
        return boxAnchor(st.pos, st.angle, st.w, st.h, name);
    },
    render(obj, st, ctx, g) {
        const corners = ['bl', 'br', 'tr', 'tl'].map(k => boxAnchor(st.pos, st.angle, st.w, st.h, k));
        polyline(ctx, corners, { class: 'mp-body', 'stroke-width': 1.6, 'stroke-linejoin': 'round', style: bodyStyle(obj, ctx) }, g, true);
        ctx.obstaclePath([...corners, corners[0]]);
        centerLabel(obj, st, ctx, g);
    },
};

/** Ball: radius in metres; on a surface it touches it at one point. */
const ball = {
    keys: ['radius'],
    layer: 'bodies',
    anchorNames: ROUND_ANCHORS,
    resolve(obj, r) {
        const rad = obj.radius !== undefined ? r.num(obj.radius, 'ball radius') : 0.25;
        if (!(rad > 0)) return null;
        const p = r.place(obj, rad);
        if (!p) return null;
        return { pos: p.pos, com: p.pos, angle: p.angle, radius: rad, frame: bodyFrame(p), support: p.support, mass: massOf(obj, r) };
    },
    anchor(st, name, arg, r) {
        if (name === 'rim') {
            const a = argAngle(arg, r, 'rim(angle)');
            return isFinite(a) ? add(st.pos, fromAngle(a, st.radius)) : null;
        }
        return roundAnchor(st.pos, st.angle, st.radius, name);
    },
    render(obj, st, ctx, g) {
        const c = ctx.map(st.pos);
        ctx.svg('circle', { cx: c.x, cy: c.y, r: st.radius * ctx.pxPerMetre, class: 'mp-body', 'stroke-width': 1.6, style: bodyStyle(obj, ctx) }, g);
        ctx.obstaclePath(circlePoints(st.pos, st.radius));
        centerLabel(obj, st, ctx, g);
    },
};

/** Cart: a box on two wheels; on a surface the wheels touch it. */
const cart = {
    keys: ['size', 'wheel'],
    layer: 'bodies',
    anchorNames: [...BOX_ANCHORS, 'axle(i)', 'surface(u)'],
    resolve(obj, r) {
        const size = Array.isArray(obj.size) ? obj.size : [1.2, 0.5];
        const w = r.num(size[0], 'cart size'), h = r.num(size[1], 'cart size');
        const wr = obj.wheel !== undefined ? r.num(obj.wheel, 'cart wheel') : h * 0.35;
        if (!(w > 0 && h > 0 && wr > 0)) return null;
        // Wheel centres sit on the body's bottom edge, a wheel radius above the surface
        const p = r.place(obj, wr + h / 2);
        if (!p) return null;
        const axles = [-0.3, 0.3].map(f => fromLocal(p.pos, p.angle, [f * w, -h / 2]));
        const tl = boxAnchor(p.pos, p.angle, w, h, 'tl'), tr = boxAnchor(p.pos, p.angle, w, h, 'tr');
        const t = norm(sub(tr, tl));
        return {
            pos: p.pos, com: p.pos, angle: p.angle, w, h, wr, axles, frame: bodyFrame(p), support: p.support, mass: massOf(obj, r),
            surface: (u) => ({ point: lerp(tl, tr, u), tangent: t, normal: perp(t) }),
            surfaceLength: w,
        };
    },
    anchor(st, name, arg, r) {
        if (name === 'axle') {
            const i = argNum(arg, r, 'axle(i)');
            return st.axles[i === 2 ? 1 : 0];
        }
        if (name === 'surface') {
            const u = argNum(arg, r, 'surface(u)');
            return isFinite(u) ? st.surface(u).point : null;
        }
        return boxAnchor(st.pos, st.angle, st.w, st.h, name);
    },
    render(obj, st, ctx, g) {
        const corners = ['bl', 'br', 'tr', 'tl'].map(k => boxAnchor(st.pos, st.angle, st.w, st.h, k));
        const style = bodyStyle(obj, ctx);
        polyline(ctx, corners, { class: 'mp-body', 'stroke-width': 1.6, 'stroke-linejoin': 'round', style }, g, true);
        ctx.obstaclePath([...corners, corners[0]]);
        st.axles.forEach(a => {
            const c = ctx.map(a);
            ctx.svg('circle', { cx: c.x, cy: c.y, r: st.wr * ctx.pxPerMetre, class: 'mp-body', 'stroke-width': 1.6, style }, g);
            ctx.svg('circle', { cx: c.x, cy: c.y, r: 1.8, class: 'mp-ink-fill' }, g);
        });
        centerLabel(obj, st, ctx, g);
    },
};

/**
 * Rod: from–to, or `at` (centre) + `length` + `angle`. `pivot` ("start",
 * "center", "end" or a fraction 0–1) draws a hinge pin there.
 */
const rod = {
    keys: ['from', 'to', 'length', 'pivot', 'width'],
    layer: 'bodies',
    anchorNames: ['start', 'end', 'center', 'com', 'pivot', 'point(u)'],
    resolve(obj, r) {
        let a, b;
        if (obj.from !== undefined && obj.to !== undefined) {
            a = r.point(obj.from, 'rod from');
            b = r.point(obj.to, 'rod to');
        } else {
            const c = r.point(obj.at, 'rod at');
            const L = obj.length !== undefined ? r.num(obj.length, 'rod length') : 2;
            const ang = obj.angle !== undefined ? r.angle(obj.angle, 'rod angle') : 0;
            if (!c) return null;
            a = add(c, fromAngle(ang + Math.PI, L / 2));
            b = add(c, fromAngle(ang, L / 2));
        }
        if (!a || !b || dist(a, b) < 1e-9) return null;
        const t = norm(sub(b, a));
        let pivot = null;
        if (obj.pivot !== undefined && obj.pivot !== false) {
            const u = obj.pivot === 'start' ? 0 : obj.pivot === 'end' ? 1 : obj.pivot === 'center' || obj.pivot === true ? 0.5 : r.num(obj.pivot, 'rod pivot');
            if (isFinite(u)) pivot = lerp(a, b, u);
        }
        return { pos: lerp(a, b, 0.5), com: lerp(a, b, 0.5), angle: angleOf(t), a, b, pivot, frame: { t, n: perp(t), labels: ["x'", "y'"] }, mass: massOf(obj, r) };
    },
    anchor(st, name, arg, r) {
        switch (name) {
            case 'start': return st.a;
            case 'end': return st.b;
            case 'center': case 'com': return st.pos;
            case 'pivot': return st.pivot;
            case 'point': {
                const u = argNum(arg, r, 'point(u)');
                return isFinite(u) ? lerp(st.a, st.b, u) : null;
            }
        }
        return null;
    },
    render(obj, st, ctx, g) {
        const width = obj.width !== undefined ? ctx.r.num(obj.width, 'rod width') : 7;
        const color = obj.color ? ctx.color(obj.color) : null;
        polyline(ctx, [st.a, st.b], { class: 'mp-ink', 'stroke-width': width + 2, 'stroke-linecap': 'round', style: colorStyle(color) }, g);
        polyline(ctx, [st.a, st.b], { class: 'mp-body-stroke', 'stroke-width': width - 1, 'stroke-linecap': 'round' }, g);
        ctx.obstaclePath([st.a, st.b]);
        if (st.pivot) {
            const c = ctx.map(st.pivot);
            ctx.svg('circle', { cx: c.x, cy: c.y, r: 3.2, class: 'mp-pin' }, g);
        }
        if (obj.label) {
            const c = ctx.map(st.pos);
            const n = perp(st.frame.t);
            ctx.text(c.x + n.x * (width + 10), c.y - n.y * (width + 10), obj.label, { color: ctx.ink, parent: g });
        }
    },
};

/** Disk: radius in metres; `rotation` turns a marker radius to show the angle turned. */
const disk = {
    keys: ['radius', 'rotation', 'pivot'],
    layer: 'bodies',
    anchorNames: [...ROUND_ANCHORS, 'axle'],
    resolve(obj, r) {
        const c = r.point(obj.at, 'disk at');
        const rad = obj.radius !== undefined ? r.num(obj.radius, 'disk radius') : 0.5;
        if (!c || !(rad > 0)) return null;
        const rot = obj.rotation !== undefined ? r.angle(obj.rotation, 'disk rotation') : 0;
        const t = fromAngle(rot);
        return { pos: c, com: c, angle: rot, radius: rad, frame: { t, n: perp(t), labels: ["x'", "y'"] }, mass: massOf(obj, r) };
    },
    anchor(st, name, arg, r) {
        if (name === 'rim') {
            const a = argAngle(arg, r, 'rim(angle)');
            return isFinite(a) ? add(st.pos, fromAngle(a, st.radius)) : null;
        }
        if (name === 'axle') return st.pos;
        // top/bottom/left/right stay fixed in the world, whatever the rotation
        return roundAnchor(st.pos, 0, st.radius, name);
    },
    render(obj, st, ctx, g) {
        const c = ctx.map(st.pos);
        const R = st.radius * ctx.pxPerMetre;
        ctx.svg('circle', { cx: c.x, cy: c.y, r: R, class: 'mp-body', 'stroke-width': 1.6, style: bodyStyle(obj, ctx) }, g);
        ctx.obstaclePath(circlePoints(st.pos, st.radius));
        const m = ctx.map(add(st.pos, fromAngle(st.angle, st.radius)));
        ctx.svg('line', { x1: c.x, y1: c.y, x2: m.x, y2: m.y, class: 'mp-ink', 'stroke-width': 1.4 }, g);
        ctx.svg('circle', { cx: c.x, cy: c.y, r: obj.pivot === false ? 2 : 3.2, class: 'mp-pin' }, g);
        if (obj.label) ctx.text(c.x, c.y + R + 14, obj.label, { color: ctx.ink, parent: g });
    },
};

export const BODY_TYPES = { particle, block, ball, cart, rod, disk };
