/**
 * Blocks linked by "sync": "es1". Within a group on the page:
 *   - a param with the same name has the same value in every block (a slider
 *     or a dragged probe in one moves the others);
 *   - hovering an element lights up the element with the same set id and
 *     element id in the others;
 *   - orbits ("iterate") of a map with the same id are stepped together.
 * Groups live in this bundle, so they link sets blocks with each other.
 */
import { paramScale } from '../../matephis-plot-src/ui/slider-manager.js';

const groups = new Map();

const close = (a, b) => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(a), Math.abs(b));

export class SyncGroup {
    constructor(name) {
        this.name = name;
        this.scenes = new Set();
    }

    /**
     * Adds a scene to its group; the scene takes the values the group already
     * has (params, steps), so blocks start the same whatever their "val".
     */
    static join(name, scene) {
        let g = groups.get(name);
        if (!g) {
            g = new SyncGroup(name);
            groups.set(name, g);
        }
        const defs = scene.config.params || {};
        g.scenes.forEach(other => {
            for (const key in defs) {
                if (other.params[key] !== undefined && other.config.params && other.config.params[key]) {
                    scene.setParam(key, other.params[key] / paramScale(defs[key]), false);
                }
            }
            if (scene.orbits && other.orbits && other.orbits.mapIds.some(id => scene.orbits.mapIds.includes(id))) {
                scene.orbits.k = other.orbits.k;
            }
        });
        g.scenes.add(scene);
        scene._published = { ...scene.params };
        return g;
    }

    /** Only for tests: forgets every group. */
    static reset() {
        groups.clear();
    }

    leave(scene) {
        this.scenes.delete(scene);
        if (!this.scenes.size) groups.delete(this.name);
    }

    /** After a draw: params that changed since the last time go to the other blocks. */
    publish(scene) {
        const pub = scene._published || (scene._published = {});
        for (const key in scene.params) {
            const v = scene.params[key];
            if (pub[key] !== undefined && close(pub[key], v)) continue;
            pub[key] = v;
            this.scenes.forEach(other => {
                if (other === scene || other._destroyed) return;
                const def = other.config.params && other.config.params[key];
                if (!def || close(other.params[key], v)) return;
                if (other._published) other._published[key] = v;
                other.setParam(key, v / paramScale(def), true);
            });
        }
    }

    /** Hover in one block: the same element in the others. */
    focus(scene, key) {
        this.scenes.forEach(other => {
            if (other !== scene && !other._destroyed && other.interaction) other.interaction.focus(key, { remote: true });
        });
    }

    /** A step of an orbit in one block: the orbits of the same maps in the others. */
    step(scene, mapIds, k) {
        this.scenes.forEach(other => {
            if (other === scene || other._destroyed || !other.orbits) return;
            if (other.orbits.mapIds.some(id => mapIds.includes(id))) other.orbits.setStep(k, { broadcast: false });
        });
    }
}
