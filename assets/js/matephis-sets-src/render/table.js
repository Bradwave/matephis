/**
 * IN/OUT table ("table"): inputs and their values, one column per map.
 *
 *   "table": { "maps": ["g", "f"], "in": [-2, -1, 0, 1, 2], "probe": true,
 *              "headers": ["IN", "OUT", "OUT_2"], "rows": 8, "position": "below" }
 *
 *   maps      in order of application: x | g(x) | f(g(x)); one map, or a
 *             composition's id (its steps become the columns)
 *   in        inputs: numbers (expressions) or elements; their arrows are drawn
 *   probe     a highlighted row that follows the probe on the first map (or
 *             on the composition of the maps)
 *   headers   column titles (TeX); default x, g(x), f(g(x))
 *   rows      most rows shown (default: all the inputs)
 *   position  "below" (default) or "right" (beside the diagram, when there is room)
 * Undefined values (outside the domain, no image) show as "—". Hovering a
 * row lights its arrows and its points on the plot; hovering an element or
 * an arrow of an input lights its row.
 */
import { niceNumber } from '../core/interval.js';
import { SetsModel } from '../core/model.js';

const DASH = '—';

export class Table {
    constructor(scene, def) {
        this.scene = scene;
        this.def = def && typeof def === 'object' ? def : {};
        const { model } = scene;
        let ids = Array.isArray(this.def.maps) ? this.def.maps.map(String) : this.def.map !== undefined ? [String(this.def.map)] : [];
        // A composition's id stands for its steps
        if (ids.length === 1) {
            const m = model.mapById.get(ids[0]);
            if (m && m.kind === 'compose' && m.parts.length) {
                this.compose = m;
                ids = m.parts.map(p => p.id);
            }
        }
        this.maps = [];
        ids.forEach(id => {
            const m = model.mapById.get(id);
            if (!m) scene._addWarning(`table: no map '${id}'`);
            else this.maps.push(m);
        });
        for (let k = 1; k < this.maps.length; k++) {
            if (!sameKind(this.maps[k - 1].to, this.maps[k].from)) {
                scene._addWarning(`table: '${this.maps[k].id}' cannot follow '${this.maps[k - 1].id}'`);
                this.maps = this.maps.slice(0, k);
                break;
            }
        }
        if (!this.maps.length) scene._addWarning('table: needs "maps", like ["f"] or ["g", "f"]');
        this.position = this.def.position === 'right' ? 'right' : 'below';
        this.el = typeof document !== 'undefined' ? document.createElement('div') : null;
        if (this.el) this.el.className = `matephis-sets-table-wrap is-${this.position}`;
        this._texCache = new Map();
    }

    /** Inputs as the model wants them: element ids, or numbers. */
    inputs() {
        if (!this.maps.length) return [];
        const set = this.maps[0].from;
        const list = Array.isArray(this.def.in) ? this.def.in : [];
        const out = list.map(v => {
            if (set.kind === 'finite') return set.elementById.has(String(v)) ? String(v) : null;
            const n = typeof v === 'number' ? v : this.scene._num(v, 'table.in');
            return typeof n === 'number' && isFinite(n) ? n : null;
        }).filter(v => v !== null);
        const rows = Number(this.def.rows);
        return rows > 0 ? out.slice(0, rows) : out;
    }

    /** The values along the maps: [x, g(x), f(g(x))], undefined where a step has no value. */
    chain(x) {
        const vals = [x];
        this.maps.forEach((m, k) => {
            const prev = vals[k];
            if (prev === undefined) {
                vals.push(undefined);
                return;
            }
            const ys = this.scene.model.apply(m, prev);
            const y = ys.length === 1 ? ys[0] : undefined;
            const ok = typeof y === 'string' ? m.to.elementById.has(y)
                : SetsModel.validPoint(y) && (m.to.kind === 'finite' || this.scene.model.containsPoint(m.to, y, 1e-9));
            vals.push(ok ? y : undefined);
        });
        return vals;
    }

    /** The probe's input, when there is a probe on the first map (or on the composition). */
    probeInput() {
        if (!this.def.probe) return null;
        const pv = this.scene.probeValues || [];
        const hit = pv.find(o => o && (o.map === this.maps[0] || (this.compose && o.map === this.compose)
            || (o.map.kind === 'compose' && o.map.parts.length === this.maps.length && o.map.parts.every((p, k) => p === this.maps[k]))));
        return hit && typeof hit.x === 'number' ? hit.x : hit ? hit.x : null;
    }

    /** Hover key of a row: the element's node for finite inputs, "T|i" otherwise. */
    rowKey(x, i) {
        const set = this.maps[0].from;
        return set.kind === 'finite' ? `${set.id}|${x}` : `T|${i}`;
    }

    /** Extra arrow samples for a map (the values in its column), with their hover keys. */
    samplesFor(map) {
        const k = this.maps.indexOf(map);
        if (k < 0 || map.from.kind === 'finite') return [];
        return this.inputs().map((x, i) => ({ p: this.chain(x)[k], key: `T|${i}` })).filter(s => typeof s.p === 'number');
    }

    /** Builds the table (every draw: values follow params and the probe). */
    draw() {
        const { scene } = this;
        this.el.textContent = '';
        if (!this.maps.length) return;
        const table = document.createElement('table');
        table.className = 'matephis-sets-table';
        const head = document.createElement('tr');
        this.headers().forEach(tex => {
            const th = document.createElement('th');
            this._tex(th, tex);
            head.appendChild(th);
        });
        const thead = document.createElement('thead');
        thead.appendChild(head);
        table.appendChild(thead);
        const body = document.createElement('tbody');
        const addRow = (x, key, cls) => {
            const tr = document.createElement('tr');
            if (cls) tr.className = cls;
            if (cls === 'is-probe') tr.style.color = scene.color(null, 'probe');
            const vals = x === null ? [] : this.chain(x);
            for (let c = 0; c <= this.maps.length; c++) {
                const td = document.createElement('td');
                const v = vals[c];
                if (v === undefined) td.textContent = x === null && c === 0 ? '' : DASH;
                else this._tex(td, this._valueTeX(v, c === 0 ? this.maps[0].from : this.maps[c - 1].to));
                tr.appendChild(td);
            }
            if (key) {
                tr.setAttribute('tabindex', '0');
                scene.interaction.addNode(key, tr);
            }
            body.appendChild(tr);
        };
        this.inputs().forEach((x, i) => addRow(x, this.rowKey(x, i)));
        if (this.def.probe) {
            const x = this.probeInput();
            addRow(x === undefined ? null : x, null, 'is-probe');
        }
        table.appendChild(body);
        this.el.appendChild(table);
    }

    headers() {
        if (Array.isArray(this.def.headers)) return this.def.headers.map(String);
        const out = ['x'];
        let inner = 'x';
        this.maps.forEach(m => {
            inner = `${m.name}\\left(${inner}\\right)`;
            out.push(inner);
        });
        return out;
    }

    _valueTeX(v, set) {
        if (typeof v === 'string') return String((set && set.elementById && set.elementById.get(v) || { label: v }).label);
        if (Array.isArray(v)) return `\\left(${v.map(niceNumber).join(';\\,')}\\right)`;
        return niceNumber(v);
    }

    /** A cell's content: MathJax when the page has it, plain text otherwise. */
    _tex(el, tex) {
        const mj = typeof window !== 'undefined' && window.MathJax && window.MathJax.tex2svg;
        if (mj) {
            let node = this._texCache.get(tex);
            if (!node) {
                try {
                    node = window.MathJax.tex2svg(tex, { display: false });
                    this._texCache.set(tex, node);
                } catch (e) {
                    node = null;
                }
            }
            if (node) {
                el.appendChild(node.cloneNode(true));
                return;
            }
        }
        el.textContent = tex.replace(/\\left|\\right|\\,/g, '').replace(/\\tfrac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/[{}\\]/g, '');
    }
}

/** Can the values of one set be the inputs of a map from another (same set, or both lines)? */
function sameKind(a, b) {
    return a === b || (a.kind === 'interval' && b.kind === 'interval');
}
