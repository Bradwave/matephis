/**
 * Buttons under a scene ("controls"):
 *   { "type": "reveal", "label": "Mostra forze", "targets": ["A.*", "type:decompose"] }
 *       shows the objects with "hidden": true that match (id patterns with *,
 *       or "type:<type>"); pressed again, hides them. A label starting with
 *       "Mostra" turns into "Nascondi" while pressed.
 *   { "type": "toggle", "label": "Attrito", "param": "mu", "on": 0.3, "off": 0 }
 *       switches a param between two values (slider units).
 * State resets on reload.
 */
import { paramScale } from '../../matephis-plot-src/ui/slider-manager.js';

/** "A.*" -> /^A\..*$/ */
export function globToRegExp(glob) {
    return new RegExp(`^${String(glob).split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
}

/** Does an object match a reveal target ("A.*", "N", "type:decompose")? */
export function matchesTarget(obj, target) {
    if (typeof target !== 'string') return false;
    if (target.startsWith('type:')) return obj.type === target.slice(5);
    return typeof obj.id === 'string' && globToRegExp(target).test(obj.id);
}

const pressedLabel = (label) => (/^Mostra\b/.test(label) ? label.replace(/^Mostra/, 'Nascondi') : label);

export class Controls {
    /**
     * @param {object} scene - the MatephisPhysics instance
     * @param {object[]} defs - the "controls" config array
     */
    constructor(scene, defs) {
        this.scene = scene;
        this.active = new Set();
        this.reveals = [];
        this.el = document.createElement('div');
        this.el.className = 'matephis-physics-buttons';
        defs.forEach((def, i) => this._button(def, i));
    }

    _button(def, i) {
        const scene = this.scene;
        if (!def || (def.type !== 'reveal' && def.type !== 'toggle')) {
            scene._addWarning(`controls[${i}]: type must be "reveal" or "toggle"`);
            return;
        }
        const label = def.label || (def.type === 'reveal' ? 'Mostra' : def.param);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'matephis-physics-button';
        btn.textContent = label;
        btn.setAttribute('aria-pressed', 'false');
        this.el.appendChild(btn);

        if (def.type === 'reveal') {
            const targets = Array.isArray(def.targets) ? def.targets : def.targets !== undefined ? [def.targets] : ['*'];
            this.reveals.push({ i, targets });
            btn.addEventListener('click', () => {
                const on = !this.active.has(i);
                if (on) this.active.add(i); else this.active.delete(i);
                btn.setAttribute('aria-pressed', String(on));
                btn.textContent = on ? pressedLabel(label) : label;
                scene.requestDraw();
            });
            return;
        }

        const key = def.param;
        const pdef = scene.config.params && scene.config.params[key];
        if (!pdef) {
            scene._addWarning(`controls[${i}]: no param '${key}'`);
            return;
        }
        const k = paramScale(pdef);
        const onV = Number(def.on !== undefined ? def.on : 1), offV = Number(def.off !== undefined ? def.off : 0);
        const sync = () => btn.setAttribute('aria-pressed', String(Math.abs(scene.params[key] / k - onV) < 1e-9));
        sync();
        btn.addEventListener('click', () => {
            const on = btn.getAttribute('aria-pressed') !== 'true';
            scene.setParam(key, on ? onV : offV);
            sync();
        });
    }

    /** Is a hidden object revealed by a pressed button? */
    isRevealed(obj) {
        return this.reveals.some(r => this.active.has(r.i) && r.targets.some(t => matchesTarget(obj, t)));
    }
}
