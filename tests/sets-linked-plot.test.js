import { describe, it, expect } from 'vitest';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';
import { SetsModel } from '../assets/js/matephis-sets-src/core/model.js';
import { parseSelector } from '../assets/js/matephis-sets-src/core/selectors.js';
import { LinkedPlot } from '../assets/js/matephis-sets-src/render/linked-plot.js';

/** A stand-in for a scene with a "plot": model, params, layers, colours. */
function scene(cfg, params) {
    const compiler = new ExpressionCompiler({ getParams: () => params, getPoints: () => ({}), paramNames: Object.keys(params) });
    const warnings = [];
    const model = new SetsModel(cfg, {
        evaluate: (v) => (typeof v === 'number' ? v : compiler.eval(String(v))),
        compile: (src, vars) => compiler.fn(src, vars),
        warn: (m) => warnings.push(m),
    });
    const layers = (cfg.show || []).map(s => ({ key: s, sel: parseSelector(s), always: true }));
    const sc = {
        config: { ...cfg, params: Object.fromEntries(Object.keys(params).map(k => [k, { val: params[k] }])) },
        params, model, layers, warnings,
        isVisible: (l) => l.always,
        color: (c) => c || 'black',
        _isDark: () => false,
        mentionsParam: () => false,
        _addWarning: (m) => warnings.push(m),
    };
    return sc;
}

describe('Grafico collegato', () => {
    const cfg = {
        sets: [{ id: 'X', interval: '[-2, 2]' }, { id: 'Y', interval: '[-1, 4]' }],
        maps: [{ id: 'f', from: 'X', to: 'Y', expr: 'x^2' }],
        show: ['preimage(f, k)', 'image(f, [0, 1])'],
        plot: { lines: [{ y: 'k' }, { x: 'k', dash: false }] },
    };

    it('rette guidate dai parametri', () => {
        const lp = new LinkedPlot(scene(cfg, { k: 1 }), null);
        const items = lp.lineItems();
        expect(items[0]).toMatchObject({ fn: 'k', dash: '6,4' });
        expect(items[1]).toMatchObject({ x: 'k' });
        expect(items[1].dash).toBeUndefined();
    });

    it('controimmagini e immagini sul grafico', () => {
        const params = { k: 1 };
        const sc = scene(cfg, params);
        const lp = new LinkedPlot(sc, null);
        const conf = lp.config();
        expect(conf.params._m0p0x.slider).toBe(false);
        let v = lp.mirrorValues();
        expect([v._m0p0x, v._m0p1x].map(x => +x.toFixed(6))).toEqual([-1, 1]);
        expect(v._m0p2x).toBe(1e9);
        // The image of [0, 1] is [0, 1] on the y axis (x = 0)
        expect([v._m1b0a, v._m1b0b, v._m1b0c, v._m1b0d]).toEqual([0, 0, 0, 1]);
        params.k = -1;
        sc.model.refresh();
        v = lp.mirrorValues();
        expect(v._m0p0x).toBe(1e9);
    });
});

import { compareReadout } from '../assets/js/matephis-sets-src/render/arrows.js';

describe('Confronto tra due punti', () => {
    const f = { label: 'f', name: 'f' };
    const sc = (compare, a, b) => ({
        config: { compare },
        color: (c) => c,
        probeValues: [{ x: a[0], ys: [a[1]], map: f, at: a[2] }, { x: b[0], ys: [b[1]], map: f, at: b[2] }],
    });
    it('ordine conservato e invertito', () => {
        expect(compareReadout(sc([0, 1], [0.5, 0.25, 'p'], [1.5, 2.25, 'q'])).tex).toMatch(/^p < q \\Rightarrow f\\left\(p\\right\) < f\\left\(q\\right\).*conservato/);
        expect(compareReadout(sc([0, 1], [1.5, 2.25, 'p'], [-1.6, 2.56, 'q'])).tex).toMatch(/^q < p .* > .*invertito/);
    });
    it('parità', () => {
        const par = { probes: [0, 1], mode: 'parity' };
        expect(compareReadout(sc(par, [0.6, -0.384, 'p'], [-0.6, 0.384, '-p'])).tex).toBe('f\\left(-p\\right) = -f\\left(p\\right)');
        expect(compareReadout(sc(par, [0.6, 0.36, 'p'], [-0.6, 0.36, '-p'])).tex).toBe('f\\left(-p\\right) = f\\left(p\\right)');
        expect(compareReadout(sc(par, [0.6, 1, 'p'], [-0.6, 2, '-p'])).tex).toMatch(/\\ne \\pm/);
    });
});

import { Table } from '../assets/js/matephis-sets-src/render/table.js';

describe('Tabella IN/OUT', () => {
    const cfg = {
        sets: [{ id: 'X', interval: '[-2, 2]' }, { id: 'Y', interval: '[-1, 3]' }, { id: 'Z', interval: '[0, 4]' }],
        maps: [{ id: 'g', from: 'X', to: 'Y', expr: 'x + 1' }, { id: 'f', from: 'Y', to: 'Z', expr: 'sqrt(x)' }, { id: 'fg', compose: ['g', 'f'] }],
    };
    it('una colonna per funzione, «—» dove manca il valore', () => {
        const sc = scene(cfg, {});
        const t = new Table(sc, { maps: ['g', 'f'], in: [-2, 0, 3] });
        expect(t.headers()).toEqual(['x', 'g\\left(x\\right)', 'f\\left(g\\left(x\\right)\\right)']);
        expect(t.inputs()).toEqual([-2, 0, 3]);
        expect(t.chain(0)).toEqual([0, 1, 1]);
        // g(-2) = -1, outside the domain of sqrt: no value
        expect(t.chain(-2)).toEqual([-2, -1, undefined]);
        // g(3) = 4 is not in Y: no value, no arrow for f
        expect(t.chain(3)).toEqual([3, undefined, undefined]);
        expect(t.samplesFor(sc.model.mapById.get('f'))).toEqual([{ p: -1, key: 'T|0' }, { p: 1, key: 'T|1' }]);
    });
    it('l\'id di una composizione dà i suoi passi', () => {
        const t = new Table(scene(cfg, {}), { maps: ['fg'], in: [3] });
        expect(t.maps.map(m => m.id)).toEqual(['g', 'f']);
    });
});

describe('Funzioni a tratti sul grafico', () => {
    it('un grafico per tratto, punti pieni e vuoti agli estremi', () => {
        const sc = scene({
            sets: [{ id: 'X', interval: '[0, 2]' }, { id: 'Y', interval: '[0, 2]' }],
            maps: [{ id: 'f', from: 'X', to: 'Y', piecewise: [{ on: '[0, 1)', expr: 'x' }, { on: '[1, 2]', expr: '3 - x' }] }],
            plot: {},
        }, {});
        const lp = new LinkedPlot(sc, null);
        const { lines, dots } = lp.pieceItems(sc.model.mapById.get('f'), 'blue', '$f$');
        expect(lines.map(l => l.domain)).toEqual([[0, 1], [1, 2]]);
        expect(lines[1].label).toBeUndefined();
        // [0, 1): 0 filled, 1 hollow; [1, 2]: both filled
        expect(dots.map(d => [d.points[0][0], d.fillColor === 'blue'])).toEqual([[0, true], [1, false], [1, true], [2, true]]);
    });
});

import { fnTeX } from '../assets/js/matephis-sets-src/render/arrows.js';

describe('Nomi nelle righe sotto il diagramma', () => {
    it('le parentesi solo per i nomi composti', () => {
        expect(fnTeX('f')).toBe('f');
        expect(fnTeX('T_1')).toBe('T_1');
        expect(fnTeX('\\cos')).toBe('\\cos');
        expect(fnTeX('g \\circ f')).toBe('\\left(g \\circ f\\right)');
        expect(fnTeX('f^{-1}')).toBe('\\left(f^{-1}\\right)');
    });
    it('il confronto mette tra parentesi una composizione', () => {
        const gf = { label: 'g \\circ f', name: 'g \\circ f' };
        const sc = { config: { compare: [0, 1] }, color: (c) => c, probeValues: [{ x: 1, ys: [4], map: gf, at: 'p' }, { x: 2, ys: [1], map: gf, at: 'q' }] };
        expect(compareReadout(sc).tex).toMatch(/^p < q \\Rightarrow \\left\(g \\circ f\\right\)\\left\(p\\right\) > \\left\(g \\circ f\\right\)\\left\(q\\right\)/);
    });
});

describe('Il grafico collegato segue gli slider (sets finding 5)', () => {
    /** A LinkedPlot with a stand-in plot that records what it is given. */
    function linked(cfg, params) {
        const sc = scene(cfg, params);
        const lp = new LinkedPlot(sc, { textContent: '' });
        const conf = lp.config();
        lp._remember(conf);
        const plot = {
            config: conf, params: Object.fromEntries(Object.entries(conf.params).map(([k, d]) => [k, d.val])),
            view: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }, draws: 0,
            requestDraw() { this.draws++; },
            destroy() {},
        };
        plot.sliders = { setValue: (k, v) => { plot.params[k] = v; } };
        lp.plot = plot;
        const move = (k, v) => { params[k] = v; sc.model.refresh(); lp.sync(); };
        return { lp, plot, sc, move };
    }
    const graph = (plot, label) => plot.config.data.find(d => d.label === label);

    it('il dominio [a, 2] segue a', () => {
        const { plot, move } = linked({
            params: { a: { val: 0 } },
            sets: [{ id: 'X', interval: '[a, 2]' }, { id: 'Y', interval: '[0, 4]' }],
            maps: [{ id: 'f', from: 'X', to: 'Y', expr: 'x^2' }],
            plot: { maps: ['f'], xlim: [-1, 3], ylim: [-1, 5] },
        }, { a: 0 });
        expect(graph(plot, '$f$').domain).toEqual([0, 2]);
        move('a', 1);
        expect(graph(plot, '$f$').domain).toEqual([1, 2]);
        expect(plot.params.a).toBe(1);
        expect(plot.draws).toBe(1);
        // Fixed limits: the view is kept
        expect(plot.view.xMin).toBe(0);
    });

    it('i limiti di default seguono la finestra', () => {
        const { plot, move } = linked({
            params: { a: { val: 0 } },
            sets: [{ id: 'X', interval: '[a, 2]' }, { id: 'Y', interval: '[0, 4]' }],
            maps: [{ id: 'f', from: 'X', to: 'Y', expr: 'x^2' }],
            plot: { maps: ['f'] },
        }, { a: 0 });
        const x0 = plot.config.xlim[0];
        move('a', -1);
        expect(plot.config.xlim[0]).toBeLessThan(x0);
        expect(plot.view.xMin).toBeNull(); // recomputed from xlim at the next draw
    });

    it('i tagli di una funzione a tratti seguono il parametro', () => {
        const { plot, move } = linked({
            params: { c: { val: 0 } },
            sets: [{ id: 'X', interval: '[-2, 2]' }, { id: 'Y', interval: '[-2, 4]' }],
            maps: [{ id: 'p', from: 'X', to: 'Y', piecewise: [{ on: '[-2, c)', expr: '-x' }, { on: '[c, 2]', expr: 'x^2' }] }],
            plot: { maps: ['p'] },
        }, { c: 0 });
        const domains = () => plot.config.data.filter(d => d.fn).map(d => d.domain);
        expect(domains()).toEqual([[-2, 0], [0, 2]]);
        move('c', 1);
        expect(domains()).toEqual([[-2, 1], [1, 2]]);
    });

    it('i punti di una funzione su un insieme finito seguono i parametri', () => {
        const { plot, move } = linked({
            params: { k: { val: 1 } },
            sets: [{ id: 'A', elements: ['1', '2', '3'] }, { id: 'Y', interval: '[0, 10]' }],
            maps: [{ id: 'f', from: 'A', to: 'Y', expr: 'k x' }],
            plot: { maps: ['f'] },
        }, { k: 1 });
        expect(graph(plot, '$f$').points).toEqual([[1, 1], [2, 2], [3, 3]]);
        move('k', 2);
        expect(graph(plot, '$f$').points).toEqual([[1, 2], [2, 4], [3, 6]]);
    });

    it('senza cambi di struttura il grafico resta quello', () => {
        const { plot, move } = linked({
            params: { k: { val: 1 } },
            sets: [{ id: 'X', interval: '[-2, 2]' }, { id: 'Y', interval: '[-1, 4]' }],
            maps: [{ id: 'f', from: 'X', to: 'Y', expr: 'x^2 + k' }],
            plot: { maps: ['f'] },
        }, { k: 1 });
        const data = plot.config.data;
        move('k', 2);
        expect(plot.config.data).toBe(data); // the formula follows k by itself
        expect(plot.params.k).toBe(2);
    });

    it('composizione con un fattore accostato: g = ax disegna a·x² (sets finding 2)', () => {
        const params = { a: 2, p: 1 };
        const { plot } = linked({
            params: { a: { val: 2 }, p: { val: 1 } },
            sets: [{ id: 'X', interval: '[-2, 2]' }, { id: 'Y', interval: '[0, 4]' }, { id: 'Z', interval: '[0, 8]' }],
            maps: [{ id: 'f', from: 'X', to: 'Y', expr: 'x^2' }, { id: 'g', from: 'Y', to: 'Z', expr: 'ax' }, { id: 'gf', compose: ['f', 'g'] }],
            probe: { map: 'gf', at: 'p' },
            plot: { maps: ['gf'] },
        }, params);
        const c = new ExpressionCompiler({ getParams: () => params, getPoints: () => ({}), paramNames: Object.keys(params) });
        expect(c.fn(graph(plot, '$g \\circ f$').fn, ['x'])(1.5)).toBe(4.5);
        // The probe point (p, g(f(p))) compiles and lands on the graph
        const pt = plot.config.data.find(d => d.points && d.radius === 6).points.at(-1);
        expect(c.eval(pt[1])).toBe(2);
    });
});
