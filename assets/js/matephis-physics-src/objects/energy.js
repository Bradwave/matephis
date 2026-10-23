/**
 * Energy bars for one body or a system of bodies, in a panel under the scene.
 *
 *   { "type": "energy", "of": "A", "bars": ["K", "Ug", "Uel", "Q"], "total": true,
 *     "zero": "h0", "drag": "h0" }
 *
 *   K    kinetic, ½ m v² (v from the motion over time)
 *   Ug   gravitational, m g (y − zero), y of the centre of mass
 *   Uel  elastic, ½ k (L − rest)², springs attached to the bodies (or listed in "of")
 *   Q    energy lost since t = 0: E(0) − E(t); it is the work of friction
 *        and drag when nothing else does work
 * E, the mechanical energy, adds up K, Ug and Uel among the bars shown (all
 * three when none is): a block on a horizontal spring needs no Ug.
 *   { "label": "W", "value": "...", "color": "purple" }   any other bar
 *
 * All bars share one scale, the largest value over the whole motion, so they
 * grow and shrink as time runs. "total": true adds E as an outline bar.
 * "zero" is the reference level of Ug, drawn as a dashed line in the scene;
 * with "drag" on a param the student moves it and sees that only differences
 * of Ug matter.
 */
import { len, sub } from '../core/vec.js';
import { formatNumber } from '../../matephis-plot-src/parser/expression-parser.js';
import { createSvgElement } from '../../matephis-plot-src/renderers/svg-factory.js';
import { massOf } from './shared.js';
import { ownerId } from './autoforces.js';

const BUILT_IN = ['K', 'Ug', 'Uel', 'Q'];
const TEX = { K: 'K', Ug: 'U_g', Uel: 'U_{el}', Q: 'Q', E: 'E' };
const PANEL_H = 200;

const listOf = (v) => (Array.isArray(v) ? v : v !== undefined ? [v] : []);

/** Reference level of Ug: "zero", else the param dragged, else 0. */
function zeroLevel(obj, r) {
    if (obj.zero !== undefined) return r.num(obj.zero, 'energy zero');
    const d = typeof obj.drag === 'string' ? obj.drag : obj.drag && typeof obj.drag.param === 'string' ? obj.drag.param : null;
    return d ? r.num(d, 'energy zero') : 0;
}

/** Springs whose energy counts: listed in "of", or attached to a body in it. */
function springsOf(obj, r, ids) {
    return r.objects.filter(o => o.type === 'spring'
        && ((o.id && ids.includes(o.id)) || ids.includes(ownerId(o.from)) || ids.includes(ownerId(o.to))));
}

/**
 * Mechanical energies now: { K, Ug, Uel, zero }. Speeds come from the
 * timeline's kinematics (the simulation computes them for every "of" body).
 */
export function mechanicalEnergy(obj, r) {
    const ids = listOf(obj.of).map(String);
    const g = r.num('g', 'g');
    const zero = zeroLevel(obj, r);
    let K = 0, Ug = 0, Uel = 0;
    ids.forEach(id => {
        const o = r.objectById(id);
        if (!o || o.type === 'spring') return;
        const st = r.state(id);
        if (!st) return;
        const m = massOf(o, r);
        const k = r.timeline && r.timeline.kin.get(id);
        if (k) K += 0.5 * m * (k.v.x * k.v.x + k.v.y * k.v.y);
        Ug += m * g * ((st.com || st.pos).y - zero);
    });
    springsOf(obj, r, ids).forEach(sp => {
        const ss = r.stateOf(sp);
        if (!ss || sp.k === undefined || sp.rest === undefined) return;
        const ext = len(sub(ss.b, ss.a)) - r.num(sp.rest, 'spring rest');
        Uel += 0.5 * r.num(sp.k, 'spring k') * ext * ext;
    });
    return { K, Ug, Uel, zero };
}

/** The bars asked for, as [{ key, label, color? , value? }] (value only for custom bars). */
function barSpecs(obj, r, ids) {
    let bars = obj.bars;
    if (bars === undefined) {
        bars = ['K', 'Ug'];
        if (springsOf(obj, r, ids).length) bars.push('Uel');
    }
    return listOf(bars).map((b, i) => {
        if (typeof b === 'string' && BUILT_IN.includes(b)) return { key: b, label: TEX[b] };
        if (b && typeof b === 'object' && b.value !== undefined) return { key: `custom${i}`, label: b.label !== undefined ? String(b.label) : `#${i + 1}`, value: b.value, color: b.color };
        r.warn(`energy bars[${i}]: use "K", "Ug", "Uel", "Q" or { "label": ..., "value": ... }`);
        return null;
    }).filter(Boolean);
}

/** Mechanical energy: K, Ug and Uel among the bars shown (all three when none is). */
export function totalEnergy(obj, mech) {
    const shown = listOf(obj.bars).filter(b => b === 'K' || b === 'Ug' || b === 'Uel');
    return (shown.length ? shown : ['K', 'Ug', 'Uel']).reduce((s, k) => s + mech[k], 0);
}

/**
 * Values of all bars now (Q needs E at t = 0, which the simulation keeps).
 * @returns {{ bars: {key, label, value, color}[], E: number, zero: number }}
 */
export function energyValues(obj, r) {
    const ids = listOf(obj.of).map(String);
    const mech = mechanicalEnergy(obj, r);
    const E = totalEnergy(obj, mech);
    const tl = r.timeline;
    const E0 = tl && tl.energy && tl.energy.get(obj) ? tl.energy.get(obj).E0 : E;
    const bars = barSpecs(obj, r, ids).map(b => ({
        ...b,
        value: b.key === 'Q' ? E0 - E : b.value !== undefined ? r.num(b.value, `energy ${b.label}`) : mech[b.key],
    }));
    return { bars, E, zero: mech.zero };
}

const energy = {
    keys: ['of', 'bars', 'total', 'zero', 'unit', 'digits', 'size'],
    layer: 'annotations',
    anchorNames: [],
    panel: true,
    resolve(obj, r) {
        const ids = listOf(obj.of);
        if (!ids.length || ids.some(id => !r.objectById(id))) {
            r.warn(`energy: 'of' must be the id of a body (or a list of ids)`);
            return null;
        }
        const v = energyValues(obj, r);
        const tl = r.timeline && r.timeline.energy && r.timeline.energy.get(obj);
        return { pos: { x: 0, y: v.zero, z: 0 }, ...v, maxPos: tl ? tl.maxPos : 0, maxNeg: tl ? tl.maxNeg : 0 };
    },
    /** The reference level of Ug, dashed across the scene, when it is set or dragged. */
    render(obj, st, ctx, g) {
        if (obj.zero === undefined && obj.drag === undefined) return;
        const v = ctx.r.view;
        const a = ctx.map({ x: v.xMin, y: st.zero }), b = ctx.map({ x: v.xMax, y: st.zero });
        ctx.svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'mp-ink', 'stroke-width': 1.2, 'stroke-dasharray': '6 5', opacity: 0.7 }, g);
        // A wide transparent line is easier to grab
        if (obj.drag !== undefined) ctx.svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'transparent', 'stroke-width': 14 }, g);
        ctx.text(a.x + 6, a.y - 4, '$U_g = 0$', { anchor: 'start', baseline: 'auto', color: ctx.ink, size: 13, parent: g });
    },
    /** Bar chart in its own panel; one scale over the whole motion. */
    renderPanel(obj, st, ctx, host) {
        const r = ctx.r;
        const bars = st.bars.slice();
        if (obj.total === true) bars.push({ key: 'E', label: TEX.E, value: st.E, outline: true });
        const n = bars.length;
        const barW = 30, gap = 18, padX = 18;
        const W = Math.max(150, padX * 2 + n * barW + (n - 1) * gap);
        const H = obj.size !== undefined ? r.num(obj.size, 'energy size') : PANEL_H;
        const top = 24, bottom = 30;
        const values = bars.map(b => b.value).filter(isFinite);
        // The range of the whole run, so bars keep one scale while time runs
        const up = Math.max(st.maxPos || 0, ...values, 0);
        const down = Math.max(st.maxNeg || 0, ...values.map(v => -v), 0);
        const k = (H - top - bottom) / Math.max(up + down, 1e-9);
        const base = top + up * k;

        const panel = document.createElement('figure');
        panel.className = 'matephis-physics-fbd matephis-physics-energy';
        const svg = createSvgElement('svg', {
            width: W, height: H, viewBox: `0 0 ${W} ${H}`,
            class: 'matephis-plot-svg matephis-physics-svg', role: 'img', 'aria-label': 'Grafico a barre delle energie',
        });
        svg.style.fontFamily = 'var(--font-plot, monospace)';
        panel.appendChild(svg);
        host.appendChild(panel);
        const g = createSvgElement('g', {});
        svg.appendChild(g);

        const unit = obj.unit !== undefined ? String(obj.unit) : 'J';
        const digits = obj.digits !== undefined ? r.num(obj.digits, 'energy digits') : 1;
        const colors = { K: ctx.paletteColor(0), Ug: ctx.paletteColor(2), Uel: ctx.paletteColor(3), Q: ctx.paletteColor(1) };
        ctx.svg('line', { x1: padX / 2, y1: base, x2: W - padX / 2, y2: base, class: 'mp-ink', 'stroke-width': 1.2 }, g);
        bars.forEach((b, i) => {
            const x = padX + i * (barW + gap);
            const v = isFinite(b.value) ? b.value : 0;
            const h = Math.abs(v) * k;
            const y = v >= 0 ? base - h : base;
            const color = b.outline ? ctx.ink : b.color ? ctx.color(b.color) : colors[b.key] || ctx.paletteColor(4);
            ctx.svg('rect', b.outline
                ? { x, y, width: barW, height: Math.max(h, 0.5), fill: 'none', stroke: color, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }
                : { x, y, width: barW, height: Math.max(h, 0.5), fill: color, opacity: 0.85 }, g);
            ctx.text(x + barW / 2, H - bottom + 8, `$${b.label}$`, { anchor: 'middle', baseline: 'hanging', color: b.outline ? ctx.ink : color, size: 14, parent: g });
            const vy = v >= 0 ? y - 4 : y + h + 4;
            ctx.text(x + barW / 2, vy, formatNumber(v, digits), { anchor: 'middle', baseline: v >= 0 ? 'auto' : 'hanging', color: ctx.ink, size: 11, parent: g });
        });
        const cap = document.createElement('figcaption');
        cap.textContent = obj.label !== undefined ? `${obj.label} (${unit})` : `Energia (${unit})`;
        panel.appendChild(cap);
    },
};

export const ENERGY_TYPES = { energy };
