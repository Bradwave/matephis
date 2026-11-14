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
