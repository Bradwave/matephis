/**
 * Motion over time: stroboscopic ghosts (motion diagrams) and traces.
 *
 *   { "type": "ghosts", "of": "B", "every": 0.2, "from": 0, "to": 1.4,
 *     "vectors": ["velocity"], "labels": "t" }
 *   { "type": "trace", "of": "B", "window": 1.5 }
 *
 * Both read the precomputed timeline, so they also work in a scene without a
 * clock: a static motion diagram of analytic or ODE motion. With a clock,
 * ghosts and traces appear as time runs ("upTo": "now", the default there).
 */
import { len } from '../core/vec.js';
import { polyline } from '../core/draw.js';
import { drawVector } from './annotations.js';
import { formatNumber } from '../../matephis-plot-src/parser/expression-parser.js';

/** Up to now with a clock, the whole span without one; "upTo" decides. */
const untilNow = (obj, tl) => (obj.upTo !== undefined ? obj.upTo === 'now' : tl.live);

const ghosts = {
    keys: ['of', 'every', 'from', 'to', 'upTo', 'vectors', 'labels', 'scale'],
    layer: 'annotations',
    anchorNames: [],
    resolve(obj, r) {
        const tl = r.timeline;
        const body = r.objectById(obj.of);
        if (!body) {
            r.warn(`ghosts: 'of' must be the id of a body`);
            return null;
        }
        const list = tl && tl.ghosts.get(obj);
        if (!list || !list.length) return null;
        const shown = untilNow(obj, tl) ? list.filter(g => g.t <= tl.t + 1e-9) : list;
        return { pos: list[0].state.pos, items: shown, body };
    },
    render(obj, st, ctx, g) {
        const r = ctx.r;
        const type = ctx.types[st.body.type];
        const copy = { ...st.body, label: undefined, drag: undefined, angleLabel: undefined };
        const vectors = Array.isArray(obj.vectors) ? obj.vectors : obj.vectors ? [obj.vectors] : [];
        // Vector scale: as the scene's vectors of that kind, else the fastest ghost spans a sixth of the view
        const v = r.view, span = Math.min(v.xMax - v.xMin, v.yMax - v.yMin) / 6;
        const kFor = (kind) => {
            if (obj.scale !== undefined) return r.num(obj.scale, 'ghosts scale');
            const key = kind === 'velocity' ? 'v' : 'a';
            const max = Math.max(0, ...st.items.map(i => (i[key] ? len(i[key]) : 0)));
            return r.scaleSet.has(kind) || !(max > 0) ? r.scales[kind] : span / max;
        };
        st.items.forEach(item => {
            const gg = ctx.svg('g', { opacity: obj.opacity !== undefined ? r.num(obj.opacity, 'ghosts opacity') : 0.45 }, g);
            type.render(copy, item.state, ctx, gg);
            const at = item.state.com || item.state.pos;
            vectors.forEach(kind => {
                const vec = kind === 'velocity' ? item.v : kind === 'acceleration' ? item.a : null;
                if (!vec || len(vec) < 1e-9) return;
                drawVector(ctx, at, vec, kFor(kind), { color: ctx.kindColor(kind), head: kind === 'velocity' ? 'open' : 'double', width: 1.6 }, g);
            });
            if (obj.labels === 't' || Array.isArray(obj.labels)) {
                const text = Array.isArray(obj.labels) ? obj.labels[st.items.indexOf(item)] : `${formatNumber(item.t, 2)} s`;
                if (text === undefined) return;
                const c = ctx.map(at);
                ctx.placeText(String(text), [
                    { x: c.x, y: c.y + 18, anchor: 'middle', baseline: 'hanging' }, { x: c.x, y: c.y - 18, anchor: 'middle', baseline: 'auto' },
                    { x: c.x + 16, y: c.y, anchor: 'start', baseline: 'middle' },
                ], { color: ctx.ink, size: 12, parent: g });
            }
        });
    },
};

const trace = {
    keys: ['of', 'window', 'upTo', 'width'],
    layer: 'connections',
    anchorNames: [],
    resolve(obj, r) {
        const tl = r.timeline;
        if (!r.objectById(obj.of)) {
            r.warn(`trace: 'of' must be the id of a body`);
            return null;
        }
        const track = tl && tl.tracks.get(obj.of);
        if (!track || track.length < 2) return null;
        const now = untilNow(obj, tl) ? tl.t : tl.tEnd;
        const from = obj.window !== undefined ? now - r.num(obj.window, 'trace window') : -Infinity;
        const pts = track.filter(s => s.t <= now + 1e-9 && s.t >= from - 1e-9).map(s => s.pos);
        return pts.length >= 2 ? { pos: pts[pts.length - 1], points: pts } : null;
    },
    render(obj, st, ctx, g) {
        const color = obj.color ? ctx.color(obj.color) : ctx.ink;
        const width = obj.width !== undefined ? ctx.r.num(obj.width, 'trace width') : 1.4;
        polyline(ctx, st.points, { fill: 'none', stroke: color, 'stroke-width': width, 'stroke-dasharray': obj.dash !== undefined ? obj.dash : '5 4', 'stroke-linejoin': 'round', opacity: 0.8 }, g);
    },
};

export const MOTION_TYPES = { ghosts, trace };
