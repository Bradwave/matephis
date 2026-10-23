/**
 * Automatic forces ("forces": "auto" on a body).
 *
 * From the configuration alone, each auto body gets one force object per
 * connection, with ids "<body>.<name>":
 *   P    weight                      always, at the centre of mass
 *   N    normal force                resting `on` a surface: balances the other forces
 *                                     perpendicular to it (zero if they pull the body off)
 *   N_B  reaction of a body B on it  when B rests on this body
 *   f    friction                    with `friction`, `mu` (body or surface), `moving` or `tendency`:
 *                                     static balances the other forces along the surface, up
 *                                     to μN; kinetic is μN against `moving`
 *   T    tension (T1, T2, …)         one per rope attached to the body; a pendulum's string
 *   Fel  elastic force (Fel1, …)     one per spring attached to the body (needs k and rest)
 *
 * These are ordinary force objects, so they are drawn, labelled, decomposed
 * ("vector": "A.P") and hidden like hand-written ones. The body controls them:
 *   "exclude": ["f"]                       leave some out
 *   "override": { "N": {...}, "*": {...} }  change any option ("*": all of them)
 *   "add": [ {...} ]                        extra forces on the same body
 *   "applyAt": "physical" | "center"        contact / attachment points, or the centre of mass
 *
 * Directions come from the geometry. The normal force and static friction are
 * exact for a body at rest on its surface (they balance the other forces);
 * tensions use a simple textbook rule, not a solution of Newton's laws. Give
 * "mag" in an override for exact values.
 */
import { sub, scale, norm, dot, len } from '../core/vec.js';
import { parseRef } from '../core/anchors.js';
import { massOf } from './shared.js';

/** Body options that control automatic forces (added to every body type's keys). */
export const AUTO_KEYS = ['forces', 'exclude', 'override', 'add', 'friction', 'moving', 'tendency', 'applyAt', 'mu'];

const LABELS = { P: '\\vec P', N: '\\vec N', f: '\\vec f', T: '\\vec T', Fel: '\\vec F_{el}' };
const ENVIRONMENT = ['ground', 'ceiling', 'wall', 'slope', 'table'];
/** Types whose `on` means "rests on" (for vectors it means "acts on"). */
const RESTING = ['particle', 'block', 'ball', 'cart'];

/** Id of the object a point spec refers to, from the configuration only. */
export function ownerId(v) {
    if (typeof v === 'string') {
        const ref = parseRef(v);
        return ref ? ref.id : null;
    }
    if (v && typeof v === 'object' && !Array.isArray(v) && v.from !== undefined) return ownerId(v.from);
    return null;
}

/** Names with a running number when there is more than one: T, or T1, T2. */
const numbered = (base, i, n) => (n > 1 ? `${base}${i + 1}` : base);

/**
 * Adds the automatic force objects after each body with "forces": "auto".
 * @param {object[]} objects - object configs
 * @returns {object[]} the list with the generated forces inserted
 */
export function expandAutoForces(objects) {
    const byId = new Map(objects.filter(o => o.id).map(o => [o.id, o]));
    const out = [];
    objects.forEach(body => {
        out.push(body);
        if (body.forces !== 'auto' || !body.id) return;
        const id = body.id;
        const list = [];
        list.push({ name: 'P', auto: { kind: 'weight' } });
        if (body.type === 'pendulum') list.push({ name: 'T', auto: { kind: 'string' } });
        if (body.on !== undefined) {
            list.push({ name: 'N', auto: { kind: 'normal' } });
            const support = byId.get(body.on);
            const mu = body.mu !== undefined || (support && support.mu !== undefined);
            if (body.friction !== 'none' && (body.friction || body.moving || body.tendency || mu)) {
                list.push({ name: 'f', auto: { kind: 'friction' } });
            }
        }
        // Bodies resting on this one push on it
        objects.filter(o => o.on === id && o.id && RESTING.includes(o.type)).forEach(top => {
            list.push({ name: `N_${top.id}`, auto: { kind: 'reaction', from: top.id }, label: `\\vec N'_{${top.id}}` });
        });
        const ropes = objects.filter(o => o.type === 'rope' && (ownerId(o.from) === id || ownerId(o.to) === id));
        ropes.forEach((rope, i) => {
            list.push({ name: numbered('T', i, ropes.length), auto: { kind: 'tension', rope, end: ownerId(rope.from) === id ? 'from' : 'to' } });
        });
        const springs = objects.filter(o => o.type === 'spring' && (ownerId(o.from) === id || ownerId(o.to) === id));
        springs.forEach((spring, i) => {
            list.push({ name: numbered('Fel', i, springs.length), auto: { kind: 'elastic', spring, end: ownerId(spring.from) === id ? 'from' : 'to' } });
        });

        const exclude = Array.isArray(body.exclude) ? body.exclude : body.exclude ? [body.exclude] : [];
        const override = body.override && typeof body.override === 'object' ? body.override : {};
        list.forEach(f => {
            const base = f.name.replace(/\d+$/, '').replace(/_.*$/, '');
            if (exclude.includes(f.name) || exclude.includes(base)) return;
            const label = f.label || (LABELS[base] && (f.name === base ? LABELS[base] : `${LABELS[base]}_${f.name.slice(base.length)}`));
            out.push({
                type: 'force', id: `${id}.${f.name}`, on: id, label,
                ...(override['*'] || {}), ...(override[base] || {}), ...(override[f.name] || {}),
                __auto: f.auto,
            });
        });
        (Array.isArray(body.add) ? body.add : []).forEach((f, i) => {
            out.push({ type: 'force', on: id, ...f, id: `${id}.${f.id || `F${i + 1}`}` });
        });
    });
    return out;
}

/** Where a force is applied: the physical point, or the centre of mass with applyAt "center". */
function applyPoint(body, r, bs, physical) {
    const mode = body.applyAt !== undefined ? body.applyAt : r.config.applyAt;
    return mode === 'center' ? (bs.com || bs.pos) : (physical || bs.com || bs.pos);
}

/**
 * Sum of the other forces on a body (hand-written and automatic), leaving out
 * its normal force and friction, which are computed from this sum.
 */
function otherForces(r, obj) {
    let sum = { x: 0, y: 0, z: 0 };
    r.objects.forEach(o => {
        if (o === obj || o.type !== 'force' || o.on !== obj.on) return;
        if (o.__auto && (o.__auto.kind === 'normal' || o.__auto.kind === 'friction')) return;
        const st = r.stateOf(o);
        if (st) sum = { x: sum.x + st.vec.x, y: sum.y + st.vec.y, z: 0 };
    });
    return sum;
}

/** Normal force magnitude: balances the other forces perpendicular to the surface, never pulls. */
function normalMagnitude(r, obj, n) {
    return Math.max(0, -dot(otherForces(r, obj), n));
}

/** Sign of a motion word ("up", "down", "left", "right") along the unit tangent t. */
function along(word, t) {
    const m = { up: { x: 0, y: 1 }, down: { x: 0, y: -1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[word];
    if (!m) return 0;
    const d = dot(m, t);
    return Math.abs(d) < 1e-9 ? 0 : Math.sign(d);
}

/**
 * Point of application and vector (newtons) of an automatic force, or null.
 * @param {object} obj - the generated force config (obj.__auto, obj.on)
 * @param {import('../core/resolver.js').Resolver} r
 */
export function resolveAutoForce(obj, r) {
    const a = obj.__auto;
    const body = r.objectById(obj.on);
    const bs = r.state(obj.on);
    if (!body || !bs) return null;
    const g = r.num('g', 'g');
    const m = massOf(body, r);
    const W = m * g;
    const com = bs.com || bs.pos;
    const where = `force '${obj.id}'`;

    switch (a.kind) {
        case 'weight':
            return { pos: com, vec: { x: 0, y: -W, z: 0 } };

        case 'normal': {
            // No acceleration perpendicular to the surface: N balances the rest there
            // (m g cos α alone; more with a body on top or a force pushing down)
            const n = bs.frame.n;
            return { pos: applyPoint(body, r, bs, bs.contact), vec: scale(n, normalMagnitude(r, obj, n)) };
        }

        case 'reaction': {
            // The body on top pushes on this one with the opposite of its own normal force
            const ts = r.state(a.from);
            const topN = r.objectById(`${a.from}.N`);
            if (!ts) return null;
            const n = ts.frame.n;
            let N;
            if (topN) {
                const ns = r.stateOf(topN);
                N = ns ? ns.mag : 0;
            } else {
                N = normalMagnitude(r, { on: a.from }, n);
            }
            return { pos: applyPoint(body, r, bs, ts.contact), vec: scale(n, -N) };
        }

        case 'friction': {
            const t = bs.frame.t, n = bs.frame.n;
            const support = r.objectById(body.on);
            const muSrc = body.mu !== undefined ? body.mu : support && support.mu !== undefined ? support.mu : undefined;
            const mu = muSrc !== undefined ? r.num(muSrc, `${where} mu`) : 0.3;
            // The normal force as drawn (it may be overridden), else from the balance
            const nObj = r.objectById(`${obj.on}.N`);
            const ns = nObj ? r.stateOf(nObj) : null;
            const N = ns ? ns.mag : normalMagnitude(r, obj, n);
            const pos = applyPoint(body, r, bs, bs.contact);
            const kinetic = body.friction === 'kinetic' || (body.friction === undefined && body.moving !== undefined);
            if (kinetic) {
                // Kinetic: μN against the motion, which must be declared
                const s = along(body.moving, t);
                if (s === 0) {
                    r.warn(`${where}: kinetic friction needs "moving" along the surface (up, down, left, right)`);
                    return null;
                }
                return { pos, vec: scale(t, -s * mu * N) };
            }
            // Static: holds the body, balancing the other forces along the surface, at most μN
            const along_ = dot(otherForces(r, obj), t);
            const mag = Math.min(Math.abs(along_), mu * N);
            if (body.tendency !== undefined && Math.abs(along_) < 1e-9) {
                r.warn(`${where}: no force pushes the body along the surface, so static friction is zero`);
            }
            return { pos, vec: scale(t, -Math.sign(along_) * mag) };
        }

        case 'tension': {
            const rs = r.stateOf(a.rope);
            if (!rs || !rs.points) return null;
            const pts = rs.points;
            const at = a.end === 'from' ? pts[0] : pts[pts.length - 1];
            const next = a.end === 'from' ? pts[1] : pts[pts.length - 2];
            // Schematic: the weight of what hangs on the rope (the mean, if both ends hang)
            const ends = [ownerId(a.rope.from), ownerId(a.rope.to)].map(id => r.objectById(id)).filter(Boolean);
            const hanging = ends.filter(o => o.on === undefined && !ENVIRONMENT.includes(o.type) && o.type !== 'pulley');
            const T = hanging.length ? hanging.reduce((s, o) => s + massOf(o, r) * g, 0) / hanging.length : 0.5 * W;
            return { pos: applyPoint(body, r, bs, at), vec: scale(norm(sub(next, at)), T) };
        }

        case 'elastic': {
            const sp = a.spring;
            const ss = r.stateOf(sp);
            if (!ss) return null;
            if (sp.rest === undefined || sp.k === undefined) {
                r.warn(`${where}: the spring needs "k" (N/m) and "rest" (m) for the elastic force`);
                return null;
            }
            const at = a.end === 'from' ? ss.a : ss.b, other = a.end === 'from' ? ss.b : ss.a;
            const L = len(sub(other, at));
            const ext = L - r.num(sp.rest, `${where} rest`);
            // Stretched: pulls towards the other end; compressed: pushes away
            const k = r.num(sp.k, `${where} k`);
            return { pos: applyPoint(body, r, bs, at), vec: scale(norm(sub(other, at)), k * ext) };
        }

        case 'string': {
            // Pendulum: along the string towards the pivot, m g cos θ (at rest in that position)
            return { pos: com, vec: scale(bs.frame.n, W * Math.cos(bs.angle)) };
        }
    }
    return null;
}
