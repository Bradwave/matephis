/**
 * Live values under a scene ("readouts"):
 *
 *   "readouts": [ "t", { "label": "v", "value": "A.speed", "unit": "m/s", "digits": 2 } ]
 *
 * A plain string is an expression, shown with itself as the label. Items
 * take "hidden" (revealed by a button, with an "id" or "type:readout" as the
 * target) and "show" like objects do.
 */
import { KIN_PROPS } from './compiler.js';

/** Unit guessed from an expression that is a single property: "A.speed" -> "m/s". */
function guessUnit(src) {
    const s = String(src).trim();
    if (s === 't') return 's';
    const m = /\.([A-Za-z]+)$/.exec(s);
    if (!m || !/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s)) return '';
    if (KIN_PROPS.slice(0, 3).includes(m[1])) return 'm/s';
    if (KIN_PROPS.slice(3).includes(m[1])) return 'm/s²';
    return '';
}

export class Readouts {
    constructor(scene, defs) {
        this.scene = scene;
        this.el = document.createElement('div');
        this.el.className = 'matephis-physics-readouts';
        this.items = defs.map((d, i) => {
            const item = typeof d === 'string' || typeof d === 'number' ? { value: String(d) } : d;
            if (!item || typeof item !== 'object' || item.value === undefined) {
                scene._addWarning(`readouts[${i}]: a string expression or { "label": ..., "value": ... }`);
                return null;
            }
            const out = { ...item, type: 'readout' };
            const span = document.createElement('span');
            span.className = 'matephis-physics-readout';
            const label = document.createElement('span');
            label.className = 'matephis-physics-readout-label';
            label.textContent = `${item.label !== undefined ? item.label : item.value}`;
            const eq = document.createTextNode(' = ');
            const value = document.createElement('span');
            value.className = 'matephis-physics-readout-value';
            span.append(label, eq, value);
            this.el.appendChild(span);
            out.span = span;
            out.valueEl = value;
            out.unit = item.unit !== undefined ? String(item.unit) : guessUnit(item.value);
            out.digits = item.digits !== undefined ? Math.max(0, Math.min(8, Number(item.digits) || 0)) : 2;
            return out;
        }).filter(Boolean);
        // "$...$" labels are typeset once
        const mj = window.MathJax;
        if (this.items.some(i => /\$/.test(i.span.textContent)) && mj && mj.typesetPromise) {
            mj.typesetPromise([this.el]).catch(() => {});
        }
    }

    /** New values, after the scene was resolved at the current time. */
    update() {
        const s = this.scene;
        this.items.forEach(item => {
            const shown = s._isShown(item);
            item.span.hidden = !shown;
            if (!shown) return;
            let v = s._num(item.value, `readout ${item.label !== undefined ? item.label : item.value}`);
            if (Math.abs(v) < 0.5 * 10 ** -item.digits) v = 0; // no "-0.00"
            item.valueEl.textContent = isFinite(v) ? `${v.toFixed(item.digits)}${item.unit ? ` ${item.unit}` : ''}` : '–';
        });
    }
}
