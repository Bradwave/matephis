/**
 * Connections: pulleys, ropes, springs, pendulums, hinges.
 *
 * A rope runs taut from `from` to `to` over the pulleys listed in `over`, in
 * order; each pulley is wrapped on the side that keeps it inside the bend
 * ("p1:cw" / "p1:ccw" forces a side). Ropes and springs become edges of the
 * connection graph, which the automatic forces use.
 */
import { add, sub, lerp, fromAngle, perp, norm, angleOf } from '../core/vec.js';
import { roundAnchor, ROUND_ANCHORS } from '../core/anchors.js';
import { ropePath, springPoints, pointAlong } from '../core/geometry.js';
import { polyline, hatch, colorStyle } from '../core/draw.js';
import { argNum, argAngle, massOf, circlePoints } from './shared.js';

const pulley = {
    keys: ['radius', 'hangFrom', 'fixed'],
    layer: 'bodies',
    anchorNames: [...ROUND_ANCHORS, 'axle'],
    resolve(obj, r) {
        const c = r.point(obj.at, 'pulley at');
        const rad = obj.radius !== undefined ? r.num(obj.radius, 'pulley radius') : 0.2;
        if (!c || !(rad > 0)) return null;
        const hang = obj.hangFrom !== undefined ? r.point(obj.hangFrom, 'pulley hangFrom') : null;
        return { pos: c, com: c, angle: 0, radius: rad, hang, frame: { t: { x: 1, y: 0, z: 0 }, n: { x: 0, y: 1, z: 0 }, labels: ['x', 'y'] }, mass: massOf(obj, r) };
    },
    anchor(st, name, arg, r) {
        if (name === 'rim') {
            const a = argAngle(arg, r, 'rim(angle)');
            return isFinite(a) ? add(st.pos, fromAngle(a, st.radius)) : null;
        }
        if (name === 'axle') return st.pos;
        return roundAnchor(st.pos, 0, st.radius, name);
    },
    render(obj, st, ctx, g) {
        const c = ctx.map(st.pos);
        const style = colorStyle(obj.color && ctx.color(obj.color));
        if (st.hang) polyline(ctx, [st.hang, st.pos], { class: 'mp-ink', 'stroke-width': 2.2, style }, g);
        ctx.svg('circle', { cx: c.x, cy: c.y, r: st.radius * ctx.pxPerMetre, class: 'mp-body', 'stroke-width': 1.6, style }, g);
        ctx.svg('circle', { cx: c.x, cy: c.y, r: 3, class: 'mp-pin' }, g);
        ctx.obstaclePath(circlePoints(st.pos, st.radius));
        if (obj.label) ctx.text(c.x + st.radius * ctx.pxPerMetre + 8, c.y, obj.label, { anchor: 'start', color: ctx.ink, parent: g });
    },
};

/** "p1" or "p1:cw" -> { id, side } */
function parseOver(item) {
    if (typeof item !== 'string') return null;
    const [id, side] = item.split(':').map(s => s.trim());
    return { id, side: side === 'cw' || side === 'ccw' ? side : undefined };
}

const rope = {
    keys: ['from', 'to', 'over', 'width'],
    layer: 'connections',
    anchorNames: ['start', 'end', 'point(u)'],
    resolve(obj, r) {
        const a = r.point(obj.from, 'rope from');
        const b = r.point(obj.to, 'rope to');
        if (!a || !b) return null;
        const pulleys = [];
        const pulleyIds = [];
        for (const item of (Array.isArray(obj.over) ? obj.over : obj.over !== undefined ? [obj.over] : [])) {
            const o = parseOver(item);
            const st = o && r.state(o.id);
            const po = o && r.objectById(o.id);
            if (!st || !po || po.type !== 'pulley') {
                r.warn(`rope${obj.id ? ` '${obj.id}'` : ''}: '${item}' is not a pulley`);
                return null;
            }
            pulleys.push({ center: st.pos, radius: st.radius, side: o.side });
            pulleyIds.push(o.id);
        }
        const path = ropePath(a, b, pulleys);
        if (!path) {
            r.warn(`rope${obj.id ? ` '${obj.id}'` : ''}: cannot run from its start to its end over these pulleys (a point is inside a pulley?)`);
            return null;
        }
        return { pos: lerp(a, b, 0.5), angle: 0, a, b, ...path, pulleyIds };
    },
    anchor(st, name, arg, r) {
        if (name === 'start') return st.a;
        if (name === 'end') return st.b;
        if (name === 'point') {
            const u = argNum(arg, r, 'point(u)');
            return isFinite(u) ? pointAlong(st.points, u).point : null;
        }
        return null;
    },
    render(obj, st, ctx, g) {
        const m = (p) => ctx.map(p);
        let d = '';
        st.segments.forEach((s, i) => {
            const a = m(s.a), b = m(s.b);
            d += `${i === 0 ? 'M' : 'L'}${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
            const arc = st.arcs[i];
            if (arc && i < st.segments.length - 1) {
                const next = m(st.segments[i + 1].a);
                const R = arc.radius * ctx.pxPerMetre;
                // World counter-clockwise is screen counter-clockwise: sweep-flag 0
                d += `A${R.toFixed(2)} ${R.toFixed(2)} 0 ${arc.sweep > Math.PI ? 1 : 0} ${arc.side === 'ccw' ? 0 : 1} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
            }
        });
        const width = obj.width !== undefined ? ctx.r.num(obj.width, 'rope width') : 1.8;
        ctx.svg('path', { d, fill: 'none', class: 'mp-rope', 'stroke-width': width, 'stroke-linejoin': 'round', style: colorStyle(obj.color && ctx.color(obj.color)) }, g);
        ctx.obstaclePath(st.points);
    },
};

const spring = {
    keys: ['from', 'to', 'coils', 'width', 'k', 'rest'],
    layer: 'connections',
    anchorNames: ['start', 'end', 'point(u)'],
    resolve(obj, r) {
        const a = r.point(obj.from, 'spring from');
        const b = r.point(obj.to, 'spring to');
        if (!a || !b) return null;
        const coils = obj.coils !== undefined ? r.num(obj.coils, 'spring coils') : 8;
        const w = obj.width !== undefined ? r.num(obj.width, 'spring width') : 0.24;
        const points = springPoints(a, b, coils, w / 2);
        const t = norm(sub(b, a));
        return { pos: lerp(a, b, 0.5), angle: angleOf(t), a, b, points, frame: { t, n: perp(t), labels: ["x'", "y'"] } };
    },
    anchor(st, name, arg, r) {
        if (name === 'start') return st.a;
        if (name === 'end') return st.b;
        if (name === 'point') {
            const u = argNum(arg, r, 'point(u)');
            return isFinite(u) ? lerp(st.a, st.b, u) : null;
        }
        return null;
    },
    render(obj, st, ctx, g) {
        polyline(ctx, st.points, { fill: 'none', class: 'mp-ink', 'stroke-width': 1.6, 'stroke-linejoin': 'round', style: colorStyle(obj.color && ctx.color(obj.color)) }, g);
        ctx.obstaclePath([st.a, st.b]);
        if (obj.label) {
            const c = ctx.map(st.pos);
            const n = st.frame.n;
            ctx.text(c.x + n.x * 22, c.y - n.y * 22, obj.label, { color: ctx.ink, parent: g });
        }
    },
};

/**
 * Pendulum: string of `length` from `pivot`, at angle `theta` from the
 * downward vertical (positive: bob to the right). Its frame is tangential
 * (t, direction of increasing theta) and radial (n, towards the pivot).
 */
const pendulum = {
    keys: ['pivot', 'length', 'theta', 'bob', 'support', 'showVertical', 'angleLabel'],
    layer: 'bodies',
    anchorNames: ['pivot', 'bob', 'center', 'com', 'point(u)'],
    resolve(obj, r) {
        const pivot = r.point(obj.pivot, 'pendulum pivot');
        const L = obj.length !== undefined ? r.num(obj.length, 'pendulum length') : 2;
        const th = obj.theta !== undefined ? r.angle(obj.theta, 'pendulum theta') : 0;
        if (!pivot || !(L > 0) || !isFinite(th)) return null;
        const bobCfg = obj.bob && typeof obj.bob === 'object' ? obj.bob : {};
        const br = typeof obj.bob === 'number' || typeof obj.bob === 'string' ? r.num(obj.bob, 'pendulum bob')
            : bobCfg.radius !== undefined ? r.num(bobCfg.radius, 'pendulum bob radius') : 0.15;
        const bob = add(pivot, { x: L * Math.sin(th), y: -L * Math.cos(th), z: 0 });
        const t = { x: Math.cos(th), y: Math.sin(th), z: 0 };
        return {
            pos: bob, com: bob, angle: th, pivot, bob, length: L, bobRadius: br, bobCfg,
            frame: { t, n: perp(t), labels: ['t', 'n'] }, mass: massOf(obj, r),
            // Counter-clockwise from the first side to the second: swap for a swing to the left
            angleSpec: th >= 0 ? { vertex: pivot, a1: -Math.PI / 2, a2: th - Math.PI / 2 } : { vertex: pivot, a1: th - Math.PI / 2, a2: -Math.PI / 2 },
        };
    },
    anchor(st, name, arg, r) {
        switch (name) {
            case 'pivot': return st.pivot;
            case 'bob': case 'center': case 'com': return st.bob;
            case 'point': {
                const u = argNum(arg, r, 'point(u)');
                return isFinite(u) ? lerp(st.pivot, st.bob, u) : null;
            }
        }
        return null;
    },
    render(obj, st, ctx, g) {
        const color = obj.color ? ctx.color(obj.color) : null;
        if (obj.support !== false) {
            const a = add(st.pivot, { x: -0.35, y: 0, z: 0 }), b = add(st.pivot, { x: 0.35, y: 0, z: 0 });
            hatch(ctx, a, b, { x: 0, y: 1 }, g, { spacing: 7, size: 7 });
            polyline(ctx, [a, b], { class: 'mp-ink', 'stroke-width': 1.6 }, g);
        }
        if (obj.showVertical !== false && Math.abs(st.angle) > 1e-6) {
            polyline(ctx, [st.pivot, add(st.pivot, { x: 0, y: -st.length, z: 0 })], { class: 'mp-ink', 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0.6 }, g);
        }
        polyline(ctx, [st.pivot, st.bob], { class: 'mp-rope', 'stroke-width': 1.6, style: colorStyle(color) }, g);
        ctx.obstaclePath([st.pivot, st.bob]);
        const c = ctx.map(st.bob);
        const style = [color ? `stroke: ${color}` : null, st.bobCfg.color ? `fill: ${ctx.color(st.bobCfg.color)}` : null].filter(Boolean).join('; ') || undefined;
        ctx.svg('circle', { cx: c.x, cy: c.y, r: st.bobRadius * ctx.pxPerMetre, class: 'mp-body', 'stroke-width': 1.6, style }, g);
        ctx.obstaclePath(circlePoints(st.bob, st.bobRadius));
        const p = ctx.map(st.pivot);
        ctx.svg('circle', { cx: p.x, cy: p.y, r: 3, class: 'mp-pin' }, g);
        const label = obj.label !== undefined ? obj.label : st.bobCfg.label;
        if (label) ctx.text(c.x, c.y, label, { color: ctx.ink, parent: g });
        if (obj.angleLabel && Math.abs(st.angle) > 1e-6) ctx.angleMark(st.angleSpec, { label: obj.angleLabel, radius: 34 }, g);
    },
};

/** Hinge: a pin on a small hatched support. */
const hinge = {
    keys: [],
    layer: 'environment',
    anchorNames: ['center'],
    resolve(obj, r) {
        const p = r.point(obj.at, 'hinge at');
        return p ? { pos: p, angle: 0 } : null;
    },
    anchor(st, name) {
        return name === 'center' ? st.pos : null;
    },
    render(obj, st, ctx, g) {
        const k = 0.18;
        const l = add(st.pos, { x: -k, y: -k * 1.6, z: 0 }), rr = add(st.pos, { x: k, y: -k * 1.6, z: 0 });
        polyline(ctx, [st.pos, rr, l], { class: 'mp-surface', 'stroke-width': 1.4 }, g, true);
        const base0 = add(l, { x: -k * 0.5, y: 0, z: 0 }), base1 = add(rr, { x: k * 0.5, y: 0, z: 0 });
        hatch(ctx, base0, base1, { x: 0, y: -1 }, g, { spacing: 7, size: 7 });
        polyline(ctx, [base0, base1], { class: 'mp-ink', 'stroke-width': 1.4 }, g);
        const c = ctx.map(st.pos);
        ctx.svg('circle', { cx: c.x, cy: c.y, r: 3.4, class: 'mp-pin' }, g);
    },
};

export const CONNECTION_TYPES = { pulley, rope, spring, pendulum, hinge };
