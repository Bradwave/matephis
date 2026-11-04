/**
 * Presets and macros: whole scenes (or pieces of them) from a name.
 *
 *   "preset": "atwood"
 *   "preset": { "name": "incline", "with": { "angle": 25, "mu": 0.4, "solve": true } }
 *   "use": { "macro": "incline-fbd", "with": { "alpha": 25 } }      (or a list of them)
 *
 * A preset is built in; a macro is written in the same JSON as a scene, with
 * ${name} placeholders, in _data/physics-macros.json (the layout puts them in
 * the page as window.MatephisPhysicsMacros); its "defaults" fill the
 * placeholders "with" leaves out, and "description" is for whoever reads it. Both expand into params, state,
 * ode, time, objects... and whatever the scene writes itself wins:
 *   - root keys replace the expanded ones ("xlim", "time", ...);
 *   - params are merged by name, "params": { "m1": { "val": 4 } } changes one key;
 *   - objects are merged by id, so { "id": "A", "mass": 5 } changes the block
 *     of the preset; { "id": "A", "remove": true } takes it away; objects with
 *     a new id (or none) are added.
 * In "with", a number is the starting value of the slider the preset makes;
 * a string is an expression used in its place (no slider): "angle": "alpha".
 */

/** Presets the spec lists that need features of a later phase. */
const LATER = ['conical-pendulum', 'collision-1d', 'relative-motion'];

/**
 * A quantity of a preset: a slider (numbers, or nothing given) or an
 * expression (a string in "with"). Returns the name or expression to write
 * in the preset's expressions, and adds the slider to `params`.
 */
function quantity(params, opts, name, def) {
    const v = opts[name];
    if (typeof v === 'string') return `(${v})`;
    const val = typeof v === 'number' ? v : def.val;
    params[name] = { ...def, val, min: Math.min(def.min, val), max: Math.max(def.max, val) };
    return name;
}

const flag = (opts, name, dflt) => (opts[name] === undefined ? dflt : opts[name] !== false);

export const PRESETS = {
    /** Block on an inclined plane, automatic forces, weight decomposed on the slope. */
    incline(o) {
        const params = {};
        const a = quantity(params, o, 'angle', { min: 5, max: 60, step: 1, val: 30, unit: 'deg', label: 'α' });
        const mu = quantity(params, o, 'mu', { min: 0, max: 1, step: 0.05, val: 0.3, label: 'μ' });
        const m = quantity(params, o, 'mass', { min: 0.5, max: 10, step: 0.5, val: 2, unit: 'kg', label: 'm' });
        const solve = flag(o, 'solve', false);
        return {
            xlim: [0, 9], ylim: [0, 5.5], forceScale: 0.07, params,
            ...(solve ? { magnitudes: 'solve', time: { max: 4 } } : {}),
            objects: [
                { id: 'ground', type: 'ground', y: 0.3 },
                { id: 's', type: 'slope', at: [0.4, 0.3], angle: a, length: 8.2 },
                { id: 'A', type: 'block', on: 's', pos: o.pos !== undefined ? o.pos : 0.55, size: [1.3, 0.8], mass: m, mu, forces: 'auto',
                    ...(o.v0 !== undefined ? { v0: o.v0 } : {}) },
                ...(flag(o, 'decompose', !solve) ? [{ id: 'decP', type: 'decompose', vector: 'A.P', frame: 's', showAngle: 'y', angleLabel: '\\alpha' }] : []),
                { id: 'alpha', type: 'angle', of: 's', label: '\\alpha' },
            ],
            ...(solve ? { readouts: [{ label: 'a', value: 'A.acc', unit: 'm/s²' }, { label: 'f', value: 'A.f.mag', unit: 'N', digits: 1 }] } : {}),
        };
    },

    /** Block on a spring along the ground, with optional damping; the equations of motion. */
    'spring-mass'(o) {
        const params = {};
        const k = quantity(params, o, 'k', { min: 2, max: 40, step: 1, val: 12, unit: 'N/m' });
        const m = quantity(params, o, 'm', { min: 0.5, max: 4, step: 0.1, val: 1, unit: 'kg' });
        const b = quantity(params, o, 'b', { min: 0, max: 3, step: 0.1, val: 0, unit: 'kg/s' });
        return {
            xlim: [0, 7], ylim: [0, 2], params,
            state: { x: o.x0 !== undefined ? o.x0 : 1, v: 0 },
            ode: { x: 'v', v: `-${k}/${m}*x - ${b}/${m}*v` },
            time: { max: o.time !== undefined ? o.time : 10 },
            objects: [
                { id: 'ground', type: 'ground', from: [0.5, 0.4], to: [7, 0.4] },
                { id: 'wall', type: 'wall', at: [0.5, 0.4], height: 1.3 },
                { id: 'A', type: 'block', on: 'ground', pos: '3 + x', posUnit: 'm', size: [0.8, 0.6], mass: m },
                { id: 'spring', type: 'spring', from: [0.5, 0.7], to: 'A.left', coils: 9, k, rest: 2.6 },
                { id: 'vA', type: 'velocity', on: 'A', label: '\\vec v' },
                ...(flag(o, 'energy', true) ? [{ id: 'E', type: 'energy', of: 'A', bars: ['K', 'Uel', ...(o.b ? ['Q'] : [])], total: true }] : []),
            ],
            ...(flag(o, 'graph', true) ? { graphs: [{ y: 'x', label: 'Posizione', axisLabels: ['t (s)', 'x (m)'] }] } : {}),
        };
    },

    /** Pendulum with the large-angle equation; optionally the small-angle one, faded. */
    pendulum(o) {
        const params = {};
        const L = quantity(params, o, 'length', { min: 0.5, max: 3, step: 0.1, val: 2, unit: 'm', label: 'L' });
        const th0 = quantity(params, o, 'theta0', { min: 5, max: 170, step: 5, val: 40, unit: 'deg', label: 'θ₀' });
        const small = flag(o, 'smallAngle', false);
        return {
            xlim: [-2.8, 2.8], ylim: [-2.6, 0.6], params,
            state: { th: th0, w: 0 },
            ode: { th: 'w', w: `-g/${L}*sin(th)` },
            time: { max: o.time !== undefined ? o.time : 10, loop: true },
            objects: [
                ...(small ? [{ id: 'small', type: 'pendulum', pivot: [0, 0], length: L, theta: `${th0}*cos(sqrt(g/${L})*t)`, opacity: 0.35, support: false, showVertical: false }] : []),
                { id: 'P', type: 'pendulum', pivot: [0, 0], length: L, theta: 'th', mass: o.mass !== undefined ? o.mass : 1, angleLabel: '\\theta',
                    ...(flag(o, 'forces', false) ? { forces: 'auto' } : {}) },
            ],
            ...(flag(o, 'forces', false) ? { magnitudes: 'solve' } : {}),
            readouts: [{ label: 'θ', value: 'deg(th)', unit: '°', digits: 1 }],
        };
    },

    /** Projectile on flat ground: analytic motion, trace, velocity with its components. */
    projectile(o) {
        const params = {};
        const v0 = quantity(params, o, 'v0', { min: 4, max: 20, step: 0.5, val: 12, unit: 'm/s', label: 'v₀' });
        const a = quantity(params, o, 'angle', { min: 5, max: 85, step: 1, val: 45, unit: 'deg', label: 'α' });
        const h = o.h !== undefined ? o.h : 0;
        const x = `${v0}*cos(${a})*t`, y = `${h} + ${v0}*sin(${a})*t - g*t^2/2`;
        return {
            xlim: [0, 16], ylim: [0, 9], params,
            time: { max: 6, stopWhen: `${y} < 0` },
            objects: [
                { id: 'ground', type: 'ground', y: 0 },
                { id: 'B', type: 'particle', at: [x, y], radius: 6 },
                { id: 'trace', type: 'trace', of: 'B' },
                { id: 'vB', type: 'velocity', on: 'B', label: '\\vec v', ...(flag(o, 'components', true) ? { decompose: true } : {}) },
                ...(flag(o, 'ghosts', false) ? [{ id: 'ghosts', type: 'ghosts', of: 'B', every: 0.25, upTo: 'now' }] : []),
            ],
        };
    },

    /** Atwood machine, solved. */
    atwood(o) {
        const params = {};
        const m1 = quantity(params, o, 'm1', { min: 0.5, max: 5, step: 0.1, val: 3, unit: 'kg', label: 'm₁' });
        const m2 = quantity(params, o, 'm2', { min: 0.5, max: 5, step: 0.1, val: 2, unit: 'kg', label: 'm₂' });
        return {
            xlim: [0, 6], ylim: [0, 5], magnitudes: 'solve', forceScale: 0.035, params, time: { max: 3 },
            objects: [
                { id: 'ground', type: 'ground', y: 0.3 },
                { id: 'ceiling', type: 'ceiling', y: 4.9, from: [2.2, 4.9], to: [3.8, 4.9] },
                { id: 'p', type: 'pulley', at: [3, 4.3], radius: 0.4, hangFrom: [3, 4.9] },
                { id: 'A', type: 'block', at: [2.6, 2.4], size: [0.6, 0.6], mass: m1, label: '$m_1$', forces: 'auto' },
                { id: 'B', type: 'block', at: [3.4, 2.4], size: [0.6, 0.6], mass: m2, label: '$m_2$', forces: 'auto' },
                { id: 'rope', type: 'rope', from: 'A.top', to: 'B.top', over: ['p'] },
            ],
            readouts: [{ label: 'a', value: 'abs(A.ay)', unit: 'm/s²' }, { label: 'T', value: 'A.T.mag', unit: 'N', digits: 1 }],
        };
    },

    /** Block on a table pulled by a hanging mass over a pulley, solved. */
    'table-pulley'(o) {
        const params = {};
        const m1 = quantity(params, o, 'm1', { min: 0.5, max: 5, step: 0.1, val: 2, unit: 'kg', label: 'm₁' });
        const m2 = quantity(params, o, 'm2', { min: 0.2, max: 5, step: 0.1, val: 1, unit: 'kg', label: 'm₂' });
        const mu = quantity(params, o, 'mu', { min: 0, max: 0.9, step: 0.05, val: 0.2, label: 'μ' });
        return {
            xlim: [0, 7], ylim: [0, 4], magnitudes: 'solve', forceScale: 0.07, params, time: { max: 3 },
            objects: [
                { id: 'ground', type: 'ground', y: 0.2 },
                { id: 't', type: 'table', at: [0.5, 2.5], width: 4.5, height: 2.3 },
                { id: 'A', type: 'block', on: 't', pos: 0.3, size: [1, 0.6], mass: m1, mu, label: '$m_1$', forces: 'auto' },
                { id: 'p', type: 'pulley', at: { from: 't.edge', offset: [0.3, 0] }, radius: 0.3, hangFrom: 't.edge' },
                { id: 'B', type: 'block', at: [5.6, 1.6], size: [0.6, 0.6], mass: m2, label: '$m_2$', forces: 'auto' },
                { id: 'rope', type: 'rope', from: 'A.right', to: 'B.top', over: ['p'] },
            ],
            readouts: [{ label: 'a', value: 'A.ax', unit: 'm/s²' }, { label: 'T', value: 'A.T.mag', unit: 'N' }, { label: 'f', value: 'A.f.mag', unit: 'N' }],
        };
    },

    /** Car on a bend seen from above: friction as the centripetal force, skidding. */
    'car-curve'(o) {
        const params = {};
        const v = quantity(params, o, 'v', { min: 5, max: 25, step: 0.5, val: 12, unit: 'm/s' });
        const mu = quantity(params, o, 'mu', { min: 0.1, max: 1, step: 0.05, val: 0.8, label: 'μ' });
        const R = o.radius !== undefined ? o.radius : 14;
        const lim = R + 8;
        return {
            plane: 'horizontal', xlim: [-lim, lim], ylim: [-lim, lim], aspectRatio: '1:1', params,
            time: { max: 12, loop: true },
            objects: [
                { id: 'r', type: 'road', width: 7, lanes: 2, mu, path: { arc: { center: [0, 0], radius: R } } },
                { id: 'center', type: 'particle', at: [0, 0], radius: 3 },
                { id: 'C', type: 'car', follow: 'r', s: `${v}*t`, orient: 'tangent', mass: 1200, forces: 'auto', skid: flag(o, 'skid', true) },
                { id: 'vC', type: 'velocity', on: 'C', label: '\\vec v' },
                { id: 'trace', type: 'trace', of: 'C', dash: '2 4' },
            ],
            readouts: [{ label: 'f', value: 'C.f.mag', unit: 'N', digits: 0 }, { label: 'μmg', value: `${mu}*1200*g`, unit: 'N', digits: 0 }],
        };
    },
};

/** Fills ${name} placeholders: a whole-string "${x}" takes the value as it is (a number stays a number). */
function fill(value, vars, missing) {
    if (typeof value === 'string') {
        const whole = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/.exec(value);
        if (whole) {
            if (vars[whole[1]] === undefined) { missing.add(whole[1]); return value; }
            return vars[whole[1]];
        }
        return value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (m, n) => {
            if (vars[n] === undefined) { missing.add(n); return m; }
            return String(vars[n]);
        });
    }
    if (Array.isArray(value)) return value.map(v => fill(v, vars, missing));
    if (value && typeof value === 'object') {
        const out = {};
        Object.keys(value).forEach(k => { out[k] = fill(value[k], vars, missing); });
        return out;
    }
    return value;
}

/** Writes `top` over `base`: params by name, objects by id, everything else replaced. */
export function mergeScene(base, top) {
    const out = { ...base };
    Object.keys(top).forEach(k => {
        if (k === 'params' && base.params && top.params && typeof top.params === 'object') {
            const p = { ...base.params };
            Object.entries(top.params).forEach(([name, def]) => {
                p[name] = p[name] && def && typeof def === 'object' ? { ...p[name], ...def } : def;
            });
            out.params = p;
        } else if (k === 'objects' && Array.isArray(base.objects) && Array.isArray(top.objects)) {
            const objs = base.objects.slice();
            top.objects.forEach(o => {
                const i = o && o.id !== undefined ? objs.findIndex(b => b && b.id === o.id) : -1;
                if (i < 0) { if (!(o && o.remove === true)) objs.push(o); return; }
                if (o.remove === true) objs.splice(i, 1);
                else objs[i] = { ...objs[i], ...o };
            });
            out.objects = objs;
        } else {
            out[k] = top[k];
        }
    });
    return out;
}

const MAX_DEPTH = 8;

/**
 * The scene with its "preset" and "use" expanded (recursively, macros may
 * use presets and other macros). Problems are reported through `warn`.
 * @param {object} cfg - the scene as written
 * @param {object} [macros] - name -> macro (a scene fragment with ${placeholders})
 */
export function expandScene(cfg, macros = {}, warn = () => {}, depth = 0) {
    if (!cfg || typeof cfg !== 'object') return cfg;
    if (cfg.preset === undefined && cfg.use === undefined) return cfg;
    if (depth >= MAX_DEPTH) {
        warn(`preset/use: more than ${MAX_DEPTH} levels of macros inside macros (a macro using itself?): stopped`);
        const { preset, use, ...rest } = cfg;
        return rest;
    }
    const { preset, use, ...own } = cfg;
    let base = {};
    if (preset !== undefined) {
        const name = typeof preset === 'string' ? preset : preset && preset.name;
        const opts = preset && typeof preset === 'object' && preset.with && typeof preset.with === 'object' ? preset.with : {};
        if (PRESETS[name]) base = PRESETS[name](opts);
        else if (LATER.includes(name)) warn(`preset '${name}' needs features of a later phase (views, collisions, frames) and is not available yet`);
        else warn(`preset: no preset called '${name}'. Presets: ${Object.keys(PRESETS).join(', ')}`);
    }
    (Array.isArray(use) ? use : use !== undefined ? [use] : []).forEach((u, i) => {
        const name = typeof u === 'string' ? u : u && u.macro;
        const macro = macros && macros[name];
        if (!macro) {
            const known = Object.keys(macros || {});
            warn(`use: no macro called '${name}'${known.length ? `. Macros: ${known.join(', ')}` : ' (macros live in _data/physics-macros.json)'}`);
            return;
        }
        const missing = new Set();
        // "defaults" in the macro give values to the placeholders "with" leaves out
        const { defaults, description, ...body } = macro;
        const vars = { ...(defaults && typeof defaults === 'object' ? defaults : {}), ...(u && typeof u === 'object' && u.with ? u.with : {}) };
        const filled = fill(body, vars, missing);
        if (missing.size) warn(`use '${name}': no value for ${[...missing].map(n => `\${${n}}`).join(', ')} (give it in "with")`);
        base = mergeScene(base, expandScene(filled, macros, warn, depth + 1));
    });
    return mergeScene(expandScene(base, macros, warn, depth + 1), own);
}
