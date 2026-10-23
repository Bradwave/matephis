/**
 * Dragging objects to change a param ("drag" on an object).
 *
 *   "drag": "u"                                   shorthand: along the surface for a body
 *                                                 resting on one, the angle for a pendulum
 *   "drag": { "param": "u", "along": "s" }        position along a surface (0–1, or metres
 *                                                 with "posUnit": "m" on the body)
 *   "drag": { "param": "x", "axis": "x" }         world x (or "y") in metres
 *   "drag": { "param": ["px", "py"] }             both coordinates
 *   "drag": { "param": "theta", "angle": true }   angle: pendulum swing, rod around its pivot,
 *                                                 disk rotation
 * "min" / "max" (slider units) limit the value; otherwise the slider's range does.
 * The param changes as if its slider moved, so everything that depends on it follows.
 */
import { sub, dot, angleOf } from './vec.js';
import { paramScale } from '../../matephis-plot-src/ui/slider-manager.js';

/** Normalised drag spec of an object, or null with a warning. */
export function dragSpec(obj, scene) {
    let d = obj.drag;
    if (typeof d === 'string' || Array.isArray(d)) d = { param: d };
    if (!d || typeof d !== 'object' || d.param === undefined) return null;
    const params = [].concat(d.param);
    const missing = params.filter(p => !scene.config.params || !scene.config.params[p]);
    if (missing.length) {
        scene._addWarning(`${obj.type}${obj.id ? ` '${obj.id}'` : ''} drag: no param '${missing[0]}'`);
        return null;
    }
    let mode = d.angle ? 'angle' : d.axis ? 'axis' : d.along ? 'along' : Array.isArray(d.param) ? 'xy' : null;
    if (!mode) mode = obj.type === 'pendulum' ? 'angle' : obj.on !== undefined ? 'along' : null;
    if (!mode) {
        scene._addWarning(`${obj.type}${obj.id ? ` '${obj.id}'` : ''} drag: say how it moves ("along", "axis" or "angle")`);
        return null;
    }
    return { ...d, mode, params, along: d.along || obj.on };
}

export class DragController {
    constructor(scene) {
        this.scene = scene;
        this.active = null;
        const svg = scene.svg;
        this._down = (e) => this.start(e);
        this._move = (e) => this.move(e);
        this._up = () => this.end();
        svg.addEventListener('pointerdown', this._down);
        svg.addEventListener('pointermove', this._move);
        svg.addEventListener('pointerup', this._up);
        svg.addEventListener('pointercancel', this._up);
    }

    /** Pointer position in world coordinates. */
    world(e) {
        const s = this.scene, rect = s.svg.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (s.width / rect.width);
        const y = (e.clientY - rect.top) * (s.height / rect.height);
        return { x: s.transform.unmapX(x), y: s.transform.unmapY(y), z: 0 };
    }

    start(e) {
        // Only draggable groups take pointer events (see matephis-physics.css)
        const g = e.target.closest && e.target.closest('[data-drag]');
        if (!g) return;
        const s = this.scene;
        const obj = s.resolver.objects[Number(g.getAttribute('data-drag'))];
        const spec = obj && dragSpec(obj, s);
        const st = obj && s.resolver.states.get(obj);
        if (!spec || !st) return;
        e.preventDefault();
        s.svg.setPointerCapture(e.pointerId);
        s.svg.classList.add('dragging');
        const p = this.world(e);
        this.active = {
            obj, spec, startPointer: p, startState: st,
            startValues: spec.params.map(k => s.params[k] / paramScale(s.config.params[k])),
        };
        if (spec.mode === 'angle') this.active.startAngle = this.pointerAngle(obj, st, p);
    }

    /** Angle of the pointer as the object measures it (radians). */
    pointerAngle(obj, st, p) {
        if (obj.type === 'pendulum') {
            const d = sub(p, st.pivot);
            return Math.atan2(d.x, -d.y);
        }
        const c = obj.type === 'rod' ? (st.pivot || st.a) : st.pos;
        return angleOf(sub(p, c));
    }

    move(e) {
        const a = this.active;
        if (!a) return;
        e.preventDefault();
        const s = this.scene, { spec, startPointer, startState, startValues } = a;
        const p = this.world(e);
        const d = sub(p, startPointer);
        let values;
        switch (spec.mode) {
            case 'along': {
                const sup = s.resolver.state(spec.along);
                if (!sup || !sup.surface) return;
                const t = startState.frame.t;
                const per = a.obj.posUnit === 'm' ? 1 : 1 / sup.surfaceLength;
                values = [startValues[0] + dot(d, t) * per];
                break;
            }
            case 'axis':
                values = [startValues[0] + (spec.axis === 'y' ? d.y : d.x)];
                break;
            case 'xy':
                values = [startValues[0] + d.x, startValues[1] + d.y];
                break;
            case 'angle': {
                const k = paramScale(s.config.params[spec.params[0]]);
                let da = this.pointerAngle(a.obj, startState, p) - a.startAngle;
                da = Math.atan2(Math.sin(da), Math.cos(da));
                values = [startValues[0] + da / k];
                break;
            }
        }
        spec.params.forEach((key, i) => {
            const def = s.config.params[key];
            let v = values[i];
            const lo = spec.min !== undefined ? spec.min : typeof def.min === 'number' ? def.min : -Infinity;
            const hi = spec.max !== undefined ? spec.max : typeof def.max === 'number' ? def.max : Infinity;
            v = Math.min(hi, Math.max(lo, v));
            s.setParam(key, v, false);
        });
        s.requestDraw();
    }

    end() {
        if (!this.active) return;
        this.active = null;
        this.scene.svg.classList.remove('dragging');
    }

    destroy() {
        const svg = this.scene.svg;
        svg.removeEventListener('pointerdown', this._down);
        svg.removeEventListener('pointermove', this._move);
        svg.removeEventListener('pointerup', this._up);
        svg.removeEventListener('pointercancel', this._up);
    }
}
