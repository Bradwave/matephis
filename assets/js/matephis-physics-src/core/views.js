/**
 * Views and reference frames.
 *
 *   "views": [ { "view": "front", "title": "Davanti" },
 *              { "view": "top", "title": "Dall'alto", "xlim": [-2, 2], "ylim": [-2, 2] } ]
 *   "frames": { "terreno": null, "treno": "T", "giostra": { "of": "D", "rotate": true } }
 *   "views": [ { "frame": "terreno" }, { "frame": "treno" } ]
 *
 * A view draws the same scene as an orthographic projection:
 *   front  x right, y up (looking along −z): the usual drawing
 *   side   −z right, y up (looking along −x)
 *   top    x right, −z up (looking down, along −y)
 * Objects take [x, y, z] points; "views": ["top"] on an object draws it only
 * there. Surfaces of the environment (ground, slopes...) are not drawn from
 * above unless an object asks for it.
 *
 * A frame is attached to a body (null: the ground). A view in a frame keeps
 * that body where it is at t = 0 (and, with "rotate": true, turned as it was):
 * the rest moves around it. Velocities and accelerations are measured in the
 * frame; traces and ghosts are where the bodies were in it at each instant.
 * "fictitious": true adds −m a of the frame to each body with automatic forces
 * (translating frames only).
 */
import { add, sub, rotate, outOfPlane } from './vec.js';

export const VIEW_NAMES = ['front', 'side', 'top'];
const VIEW_KEYS = ['view', 'id', 'frame', 'title', 'xlim', 'ylim', 'aspectRatio', 'grid', 'axes'];
const FRAME_KEYS = ['of', 'rotate', 'fictitious', 'label'];

/** Keys whose {x, y, z} values are directions or rates (rotated, never moved). */
const VECTOR_KEYS = new Set(['vec', 't', 'n', 'tangent', 'normal', 'v', 'a', 'e']);

/** Projections: world point -> view coordinates (x right, y up, z towards the viewer). */
const PROJECT = {
    front: (p) => ({ x: p.x, y: p.y, z: p.z || 0 }),
    side: (p) => ({ x: -(p.z || 0), y: p.y, z: p.x }),
    top: (p) => ({ x: p.x, y: -(p.z || 0), z: p.y }),
};

/** "frames" as { name: { of, rotate, fictitious, label } } (of: null for the ground). */
export function parseFrames(cfg, warn) {
    const raw = cfg.frames;
    if (raw === undefined) return null;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        warn('frames: an object of named frames, like { "terreno": null, "treno": "T" }');
        return null;
    }
    const out = {};
    Object.entries(raw).forEach(([name, v]) => {
        const def = v === null ? { of: null } : typeof v === 'string' ? { of: v } : v && typeof v === 'object' ? { ...v } : null;
        if (!def) { warn(`frames '${name}': null (the ground), a body id, or { "of": ..., "rotate": true }`); return; }
        Object.keys(def).filter(k => !FRAME_KEYS.includes(k)).forEach(k => warn(`frames '${name}': unknown key '${k}'`));
        if (def.of === undefined) def.of = null;
        if (def.rotate === true && def.fictitious === true) warn(`frames '${name}': fictitious forces in a rotating frame are not drawn (only in translating ones)`);
        out[name] = { name, of: def.of, rotate: def.rotate === true, fictitious: def.fictitious === true, label: def.label !== undefined ? String(def.label) : name };
    });
    return out;
}

/** "views" as a list of { view, id, frame, title, overrides }, or null for a single view. */
export function parseViews(cfg, frames, warn) {
    const raw = cfg.views;
    if (raw === undefined) return null;
    if (!Array.isArray(raw) || !raw.length) {
        warn('views: a list of views, like [{ "view": "front" }, { "view": "top" }]');
        return null;
    }
    return raw.map((v, i) => {
        const d = v && typeof v === 'object' ? v : typeof v === 'string' ? { view: v } : {};
        Object.keys(d).filter(k => !VIEW_KEYS.includes(k)).forEach(k => warn(`views[${i}]: unknown key '${k}'`));
        const view = d.view !== undefined ? d.view : 'front';
        if (!VIEW_NAMES.includes(view)) warn(`views[${i}]: view must be "front", "side" or "top", not '${view}'`);
        if (d.frame !== undefined && !(frames && frames[d.frame])) warn(`views[${i}]: no frame called '${d.frame}' in "frames"`);
        const overrides = {};
        ['xlim', 'ylim', 'aspectRatio', 'grid', 'axes'].forEach(k => { if (d[k] !== undefined) overrides[k] = d[k]; });
        return {
            index: i, view: VIEW_NAMES.includes(view) ? view : 'front', id: d.id, title: d.title,
            frame: d.frame !== undefined && frames ? frames[d.frame] || null : null, overrides,
        };
    });
}

/**
 * The frame's placement at one instant: where its body is and how it is
 * turned, against where it was at t = 0. Points p go to O0 + R(−Δθ)(p − O).
 */
export function frameMap(frame, now, start) {
    if (!frame || !frame.of || !now || !start) return null;
    const dth = frame.rotate ? (now.angle || 0) - (start.angle || 0) : 0;
    return {
        point: (p) => {
            const d = rotate(sub(p, now.pos), -dth);
            return { ...add(start.pos, d), z: (p.z || 0) - (now.pos.z || 0) + (start.pos.z || 0) };
        },
        vec: (v) => (dth ? rotate(v, -dth) : v),
        dth,
    };
}

/**
 * A transform for the states of one view: projection, after the frame. `at(t)`
 * gives the transform with the frame where it was at time t (for traces and
 * ghosts); null when nothing changes (front view, no frame).
 */
export function viewTransform(view, frameAt) {
    const project = PROJECT[view] || PROJECT.front;
    const make = (fm) => ({
        point: (p) => project(fm ? fm.point(p) : p),
        vec: (v) => project(fm ? fm.vec(v) : v),
        dth: fm ? fm.dth : 0,
    });
    const now = make(frameAt ? frameAt(null) : null);
    if (view === 'front' && (!frameAt || !frameAt(null))) return null;
    return { ...now, view, at: (t) => (frameAt ? make(frameAt(t)) : now) };
}

const isPoint = (v) => v && typeof v === 'object' && typeof v.x === 'number' && typeof v.y === 'number';

/**
 * States as a view sees them: points and directions transformed, body shapes
 * turned towards the view (from above a block shows its depth), angle marks
 * dropped outside the front view. Functions (surface(u)...) are kept as they
 * are. Samples with a time (trace points, ghosts) use the frame at that time.
 */
export function transformStates(states, T) {
    const memo = new Map();
    const xf = (value, key, tr) => {
        if (Array.isArray(value)) return value.map(e => xf(e, key, tr));
        if (isPoint(value) && !('pos' in value) && !('vec' in value)) {
            return { ...value, ...(VECTOR_KEYS.has(key) ? tr.vec(value) : tr.point(value)) };
        }
        if (!value || typeof value !== 'object') return value;
        let cache = memo.get(tr);
        if (!cache) memo.set(tr, cache = new WeakMap());
        if (cache.has(value)) return cache.get(value);
        const out = {};
        cache.set(value, out);
        // A sample of the motion: the frame where it was then
        const own = typeof value.t === 'number' && value.state ? T.at(value.t) : tr;
        Object.keys(value).forEach(k => {
            const v = value[k];
            if (typeof v === 'function') out[k] = v;
            else if (k === 'points' && Array.isArray(value.times) && value.times.length === v.length) {
                out[k] = v.map((p, i) => ({ ...p, ...T.at(value.times[i]).point(p) }));
            } else out[k] = xf(v, k, own);
        });
        // A vector seen end-on in this view becomes ⊙ / ⊗
        if (isPoint(value.vec)) out.outOfPlane = outOfPlane(out.vec) !== 0;
        if (typeof value.angle === 'number') out.angle = T.view === 'front' ? value.angle - own.dth : 0;
        if (T.view !== 'front') {
            delete out.angleSpec;
            const depth = typeof value.depth === 'number' ? value.depth : value.h;
            if (T.view === 'top' && typeof value.h === 'number') out.h = depth;
            if (T.view === 'side' && typeof value.w === 'number') out.w = depth;
        }
        return out;
    };
    const out = new Map();
    states.forEach((st, obj) => out.set(obj, st ? xf(st, null, T) : st));
    return out;
}
