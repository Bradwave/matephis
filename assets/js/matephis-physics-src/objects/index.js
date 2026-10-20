/**
 * Object type registry.
 *
 * Each type declares its own keys (validated on top of the common ones), the
 * layer it is drawn in, and two functions:
 *   resolve(obj, ctx) -> state      world position and anything other objects may refer to
 *   render(obj, state, ctx, group)  SVG for that state
 *
 * Phase 1 ships `particle` and `label`; the catalogue in the spec fills this in.
 */

/** Draw order, bottom to top. */
export const LAYERS = ['environment', 'bodies', 'connections', 'annotations'];

const particle = {
    keys: ['radius'],
    layer: 'bodies',
    resolve(obj, ctx) {
        const p = ctx.point(obj.at, 'at');
        return p ? { x: p.x, y: p.y } : null;
    },
    render(obj, s, ctx, g) {
        const c = ctx.map(s);
        const color = ctx.color(obj.color);
        const r = obj.radius !== undefined ? ctx.num(obj.radius, 'radius') : 5;
        ctx.svg('circle', { cx: c.x, cy: c.y, r, fill: obj.fill ? ctx.color(obj.fill) : color, stroke: color, 'stroke-width': 1.5 }, g);
        if (obj.label) {
            const off = Array.isArray(obj.labelOffset) ? obj.labelOffset : [r + 4, r + 4];
            ctx.text(c.x + off[0], c.y - off[1], obj.label, { anchor: 'start', baseline: 'auto', color, parent: g });
        }
    },
};

const ANCHORS = { left: 'start', start: 'start', center: 'middle', middle: 'middle', right: 'end', end: 'end' };

const label = {
    keys: ['text', 'anchor', 'size', 'weight'],
    layer: 'annotations',
    resolve(obj, ctx) {
        const p = ctx.point(obj.at, 'at');
        return p ? { x: p.x, y: p.y } : null;
    },
    render(obj, s, ctx, g) {
        const text = obj.text !== undefined ? obj.text : obj.label;
        if (text === undefined) { ctx.warn(`label${obj.id ? ` '${obj.id}'` : ''} has no 'text'`); return; }
        const c = ctx.map(s);
        const off = Array.isArray(obj.labelOffset) ? obj.labelOffset : [0, 0];
        ctx.text(c.x + off[0], c.y - off[1], String(text), {
            anchor: ANCHORS[obj.anchor] || 'middle',
            baseline: 'middle',
            color: ctx.color(obj.color || 'black1'),
            size: obj.size !== undefined ? ctx.num(obj.size, 'size') : undefined,
            weight: obj.weight,
            parent: g,
        });
    },
};

export const OBJECT_TYPES = { particle, label };
