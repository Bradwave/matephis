/**
 * Buttons under a sets diagram ("controls"):
 *   { "type": "reveal", "label": "Mostra immagine", "targets": ["image(f)", "h1"] }
 *       shows hidden layers whose key matches a target (selectors such as
 *       "image(f)", "collisions(*)", ids of highlights, "arrows(f)"); pressed
 *       again, hides them. A label starting with "Mostra" becomes "Nascondi".
 *   { "type": "toggle", "label": "…", "param": "a", "on": 1, "off": 0 }
 *       switches a param between two values.
 * Same look and behaviour as the buttons of physics scenes.
 */
import { paramScale } from '../../matephis-plot-src/ui/slider-manager.js';
import { matchesTarget } from '../core/selectors.js';

const pressedLabel = (label) => (/^Mostra\b/.test(label) ? label.replace(/^Mostra/, 'Nascondi') : label);

export class Controls {
    constructor(scene, defs) {
        this.scene = scene;
        this.active = new Set();
        this.reveals = [];
        this.toggles = [];
        this.el = document.createElement('div');
        this.el.className = 'matephis-physics-buttons matephis-sets-buttons';
        defs.forEach((def, i) => this._button(def, i));
    }

    /** Selector strings named by reveal buttons (the scene draws them as hidden layers). */
    static targetsOf(defs) {
        const out = [];
        (Array.isArray(defs) ? defs : []).forEach(d => {
            if (!d || d.type !== 'reveal') return;
            const t = Array.isArray(d.targets) ? d.targets : d.targets !== undefined ? [d.targets] : [];
            t.forEach(x => { if (typeof x === 'string') out.push(x); });
        });
        return out;
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
        this.toggles.push(sync);
        btn.addEventListener('click', () => {
            const on = btn.getAttribute('aria-pressed') !== 'true';
            scene.setParam(key, on ? onV : offV);
            sync();
        });
    }

    /** Is a layer (by key) revealed by a pressed button? */
    isRevealed(key) {
        return this.reveals.some(r => this.active.has(r.i) && r.targets.some(t => matchesTarget(key, t)));
    }

    /** Keeps toggle buttons in step with sliders. */
    update() {
        this.toggles.forEach(fn => fn());
    }
}
