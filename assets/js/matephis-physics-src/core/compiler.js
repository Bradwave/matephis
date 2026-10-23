/**
 * Expressions in a physics scene: the plot engine's compiler, plus
 *   - properties of bodies and vectors beyond x, y, rad, deg:
 *       A.vx, A.vy, A.speed, A.ax, A.ay, A.acc   (bodies, while time runs)
 *       A.angle                                  (radians, bodies and vectors)
 *       F.mag                                    (vectors)
 *   - ids with dots, as automatic forces have: "A.N.mag" reads the normal
 *     force on A. They are renamed (A.N -> A__N) before compiling, and the
 *     resolver stores their values under the same name (see aliasId).
 */
import { ExpressionCompiler } from '../../matephis-plot-src/parser/expression-parser.js';

/** Kinematic properties, computed from positions over time. */
export const KIN_PROPS = ['vx', 'vy', 'speed', 'ax', 'ay', 'acc'];

const EXTRA_PROPS = [...KIN_PROPS, 'angle', 'mag'];

/** Name under which an object's values are stored for expressions. */
export function aliasId(id) {
    return id.replace(/\./g, '__');
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class PhysicsCompiler extends ExpressionCompiler {
    constructor(opts) {
        super({ ...opts, pointProps: EXTRA_PROPS });
        this._dotted = null;
    }

    /** Ids that contain dots (automatic forces), known once the resolver has expanded them. */
    setIds(ids) {
        const dotted = ids.filter(id => id.includes('.')).sort((a, b) => b.length - a.length);
        ids.forEach(id => this.pointNames.add(aliasId(id)));
        this._dotted = dotted.length ? new RegExp(`(?<![A-Za-z0-9_.])(${dotted.map(escape).join('|')})(?=\\.[A-Za-z])`, 'g') : null;
        this.cache.clear();
    }

    rewrite(src) {
        return this._dotted ? String(src).replace(this._dotted, (m) => aliasId(m)) : src;
    }

    fn(src, vars, opts) {
        return super.fn(this.rewrite(src), vars, opts);
    }
}

/**
 * Ids whose kinematics expressions read ("A.speed", "B.vx"), found in any
 * string of the config.
 */
export function kinematicIds(cfg, ids) {
    if (!ids.length) return [];
    const text = JSON.stringify(cfg);
    const re = new RegExp(`(?<![A-Za-z0-9_.])(${[...ids].sort((a, b) => b.length - a.length).map(escape).join('|')})\\.(${KIN_PROPS.join('|')})\\b`, 'g');
    const out = new Set();
    let m;
    while ((m = re.exec(text)) !== null) out.add(m[1]);
    return [...out];
}
