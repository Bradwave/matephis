/**
 * Environment: fixed surfaces drawn with textbook hatching.
 *   ground, ceiling  horizontal (or slanted) lines; default: across the whole view
 *   wall             vertical line with the material on one side
 *   slope            right triangle; the body side is its hypotenuse
 *   table            top and legs; `edge` names the corner for a pulley
 */
import { add, sub, scale, lerp } from '../core/vec.js';
import { polyline, hatch, colorStyle } from '../core/draw.js';
import { straightSurface, normalTowards, argNum } from './shared.js';

const SURFACE_ANCHORS = ['start', 'end', 'center', 'surface(u)'];

/** Anchor of a straight surface state (start/end/center/surface(u)). */
function lineAnchor(st, name, arg, r) {
    switch (name) {
        case 'start': return st.a;
        case 'end': return st.b;
        case 'center': return lerp(st.a, st.b, 0.5);
        case 'surface': {
            const u = argNum(arg, r, 'surface(u)');
            return isFinite(u) ? st.surface(u).point : null;
        }
    }
    return null;
}

/** Ground / ceiling: from–to, or the full view width at height `y`. */
function horizontal(isCeiling) {
    return {
        keys: ['from', 'to', 'y', 'hatch', 'mu'],
        layer: 'environment',
        anchorNames: SURFACE_ANCHORS,
        resolve(obj, r) {
            let a, b;
            if (obj.from !== undefined || obj.to !== undefined) {
                a = r.point(obj.from, `${obj.type} from`);
                b = r.point(obj.to, `${obj.type} to`);
            } else {
                const v = r.view;
                const y = obj.y !== undefined ? r.num(obj.y, `${obj.type} y`) : (isCeiling ? v.yMax - (v.yMax - v.yMin) * 0.04 : 0);
                const pad = (v.xMax - v.xMin) * 0.05;
                a = { x: v.xMin - pad, y, z: 0 };
                b = { x: v.xMax + pad, y, z: 0 };
            }
            if (!a || !b) return null;
            const n = normalTowards(a, b, { x: 0, y: isCeiling ? -1 : 1 });
            const s = straightSurface(a, b, n);
            return { pos: lerp(a, b, 0.5), angle: Math.atan2(b.y - a.y, b.x - a.x), a, b, n, ...s };
        },
        anchor: lineAnchor,
        render(obj, st, ctx, g) {
            const style = colorStyle(obj.color && ctx.color(obj.color));
            if (obj.hatch !== false) hatch(ctx, st.a, st.b, scale(st.n, -1), g);
            polyline(ctx, [st.a, st.b], { class: 'mp-ink', 'stroke-width': 1.6, style }, g);
        },
    };
}

const wall = {
    keys: ['height', 'side', 'hatch', 'mu'],
    layer: 'environment',
    anchorNames: SURFACE_ANCHORS,
    resolve(obj, r) {
        const a = r.point(obj.at, 'wall at');
        if (!a) return null;
        const h = obj.height !== undefined ? r.num(obj.height, 'wall height') : Math.max(0.5, r.view.yMax - a.y);
        const b = add(a, { x: 0, y: h, z: 0 });
        // side: where the material is; the free side faces the other way
        const n = { x: obj.side === 'right' ? -1 : 1, y: 0, z: 0 };
        return { pos: lerp(a, b, 0.5), angle: Math.PI / 2, a, b, n, ...straightSurface(a, b, n) };
    },
    anchor: lineAnchor,
    render(obj, st, ctx, g) {
        if (obj.hatch !== false) hatch(ctx, st.b, st.a, scale(st.n, -1), g);
        polyline(ctx, [st.a, st.b], { class: 'mp-ink', 'stroke-width': 1.6, style: colorStyle(obj.color && ctx.color(obj.color)) }, g);
    },
};

/**
 * Slope: `at` is the corner with the angle (base), `angle` its inclination,
 * size from `length` (hypotenuse), `height` or `width`. `flip` rises to the left.
 */
const slope = {
    keys: ['length', 'height', 'width', 'flip', 'hatch', 'mu'],
    layer: 'environment',
    anchorNames: ['base', 'apex', 'foot', 'center', 'surface(u)'],
    resolve(obj, r) {
        const base = r.point(obj.at, 'slope at');
        if (!base) return null;
        const alpha = r.angle(obj.angle !== undefined ? obj.angle : 30, 'slope angle');
        if (!(alpha > 0 && alpha < Math.PI / 2)) {
            r.warn(`slope${obj.id ? ` '${obj.id}'` : ''}: angle must be between 0° and 90°`);
            return null;
        }
        let L = 4;
        if (obj.length !== undefined) L = r.num(obj.length, 'slope length');
        else if (obj.height !== undefined) L = r.num(obj.height, 'slope height') / Math.sin(alpha);
        else if (obj.width !== undefined) L = r.num(obj.width, 'slope width') / Math.cos(alpha);
        if (!(L > 0)) return null;
        const s = obj.flip ? -1 : 1;
        const foot = add(base, { x: s * L * Math.cos(alpha), y: 0, z: 0 });
        const apex = add(foot, { x: 0, y: L * Math.sin(alpha), z: 0 });
        const centroid = scale(add(add(base, foot), apex), 1 / 3);
        const n = normalTowards(base, apex, sub(scale(sub(apex, base), 0.5), sub(centroid, base)));
        const surf = straightSurface(base, apex, n);
        return {
            pos: centroid, angle: Math.atan2(apex.y - base.y, apex.x - base.x), alpha, base, foot, apex, ...surf,
            /** For { "type": "angle", "of": <slope> }: the inclination at the base. */
            angleSpec: { vertex: base, a1: Math.atan2(foot.y - base.y, foot.x - base.x), a2: Math.atan2(apex.y - base.y, apex.x - base.x) },
        };
    },
    anchor(st, name, arg, r) {
        switch (name) {
            case 'base': return st.base;
            case 'apex': return st.apex;
            case 'foot': return st.foot;
            case 'center': return st.pos;
            case 'surface': {
                const u = argNum(arg, r, 'surface(u)');
                return isFinite(u) ? st.surface(u).point : null;
            }
        }
        return null;
    },
    render(obj, st, ctx, g) {
        const color = obj.color && ctx.color(obj.color);
        polyline(ctx, [st.base, st.foot, st.apex], {
            class: 'mp-surface', 'stroke-width': 1.6, 'stroke-linejoin': 'round',
            style: [colorStyle(color), obj.fill ? `fill: ${ctx.color(obj.fill)}` : null].filter(Boolean).join('; ') || undefined,
        }, g, true);
        if (obj.hatch) hatch(ctx, st.foot, st.base, { x: 0, y: -1 }, g);
        if (obj.label) {
            const c = ctx.map(st.pos);
            ctx.text(c.x, c.y, obj.label, { color: ctx.ink, parent: g });
        }
    },
};

/** Table: `at` is the top-left corner; `edge` ("right" default) is where a pulley goes. */
const table = {
    keys: ['width', 'height', 'edge', 'mu'],
    layer: 'environment',
    anchorNames: ['left', 'right', 'edge', 'center', 'surface(u)'],
    resolve(obj, r) {
        const tl = r.point(obj.at, 'table at');
        if (!tl) return null;
        const w = obj.width !== undefined ? r.num(obj.width, 'table width') : 3;
        const h = obj.height !== undefined ? r.num(obj.height, 'table height') : 1;
        if (!(w > 0 && h > 0)) return null;
        const tr = add(tl, { x: w, y: 0, z: 0 });
        const surf = straightSurface(tl, tr, { x: 0, y: 1, z: 0 });
        return { pos: lerp(tl, tr, 0.5), angle: 0, tl, tr, w, h, ...surf };
    },
    anchor(st, name, arg, r, obj) {
        switch (name) {
            case 'left': return st.tl;
            case 'right': return st.tr;
            case 'edge': return obj.edge === 'left' ? st.tl : st.tr;
            case 'center': return st.pos;
            case 'surface': {
                const u = argNum(arg, r, 'surface(u)');
                return isFinite(u) ? st.surface(u).point : null;
            }
        }
        return null;
    },
    render(obj, st, ctx, g) {
        const style = colorStyle(obj.color && ctx.color(obj.color));
        const th = Math.min(0.12, st.h * 0.12);
        const leg = Math.min(0.12, st.w * 0.05);
        const down = (p, d) => add(p, { x: 0, y: -d, z: 0 });
        polyline(ctx, [st.tl, st.tr, down(st.tr, th), down(st.tl, th)], { class: 'mp-surface', 'stroke-width': 1.6, style }, g, true);
        [0.06, 0.94 - leg / st.w].forEach(f => {
            const x0 = lerp(st.tl, st.tr, f);
            const a = down(x0, th), b = add(a, { x: leg, y: 0, z: 0 });
            polyline(ctx, [a, b, down(b, st.h - th), down(a, st.h - th)], { class: 'mp-surface', 'stroke-width': 1.4, style }, g, true);
        });
    },
};

export const ENVIRONMENT_TYPES = { ground: horizontal(false), ceiling: horizontal(true), wall, slope, table };
