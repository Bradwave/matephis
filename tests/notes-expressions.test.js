/**
 * Every ```matephis, ```sets and ```physics block under _notes/ must parse:
 * the block is valid JSON and every expression in it compiles.
 *
 * - matephis (plot): the expression keys are compiled with the variables the
 *   plot uses for them (fn: x, implicit: x and y, parametric: t, polar: x, t, θ).
 * - sets: the block goes through SetsModel, as the scene does; any warning fails.
 * - physics: preset and macros are expanded and the objects go through the
 *   Resolver, as the scene does; any warning about an expression fails. The
 *   expressions outside objects (state, stopWhen, graphs, readouts) are
 *   compiled by key.
 *
 * Blocks written to show an error on purpose are listed in EXPECTED_BROKEN.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';
import { SetsModel } from '../assets/js/matephis-sets-src/core/model.js';
import { expandScene } from '../assets/js/matephis-physics-src/core/presets.js';
import { PhysicsCompiler } from '../assets/js/matephis-physics-src/core/compiler.js';
import { Resolver } from '../assets/js/matephis-physics-src/core/resolver.js';
import { OBJECT_TYPES } from '../assets/js/matephis-physics-src/objects/index.js';

const NOTES = path.resolve(__dirname, '../_notes');
const PHYSICS_MACROS = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../_data/physics-macros.json'), 'utf8'));

/** "file:engine:n" (n counts blocks of that engine in the file, from 1) for demonstrations of errors. */
const EXPECTED_BROKEN = new Set([
    'Public/test-physics.md:physics:49', // "50. Errore nel JSON": a trailing comma, on purpose
]);

function markdownFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return markdownFiles(p);
        return e.name.endsWith('.md') ? [p] : [];
    });
}

function blocks() {
    const out = [];
    for (const file of markdownFiles(NOTES)) {
        const text = fs.readFileSync(file, 'utf8');
        const count = { matephis: 0, sets: 0, physics: 0 };
        const re = /^```(matephis|sets|physics)[ \t]*\n([\s\S]*?)^```/gm;
        let m;
        while ((m = re.exec(text)) !== null) {
            const engine = m[1];
            count[engine]++;
            const line = text.slice(0, m.index).split('\n').length;
            const rel = path.relative(NOTES, file);
            out.push({ engine, source: m[2], where: `${rel}:${line}`, key: `${rel}:${engine}:${count[engine]}` });
        }
    }
    return out;
}

const isNum = (v) => typeof v === 'number';
const isExpr = (v) => typeof v === 'string' && v.trim() !== '';

/** Starting values of the params, evaluated in order like SliderManager.initValues. */
function paramValues(defs, compiler) {
    const params = {};
    for (const key in defs) params[key] = 0;
    for (const key in defs) {
        const d = defs[key] || {};
        const v = d.val !== undefined ? d.val : d.value;
        try {
            const r = v === undefined ? 0 : compiler.eval(v);
            if (isNum(r)) params[key] = r;
        } catch (e) { /* reported by the params check below */ }
    }
    return params;
}

/** Compiles src, collecting the error message instead of throwing. */
function tryCompile(errors, where, compiler, src, vars = [], opts) {
    try {
        compiler.fn(String(src), vars, opts);
    } catch (e) {
        errors.push(`${where}: ${JSON.stringify(src)}: ${e.message}`);
    }
}

function checkParams(errors, cfg, compiler) {
    for (const [name, d] of Object.entries(cfg.params || {})) {
        if (!d || typeof d !== 'object') continue;
        for (const k of ['val', 'value', 'min', 'max', 'step']) {
            if (isExpr(d[k])) tryCompile(errors, `params.${name}.${k}`, compiler, d[k]);
        }
    }
}

// ---------------------------------------------------------------------------
// matephis (plot)
// ---------------------------------------------------------------------------

const POLAR_VARS = ['x', 't', 'θ', 'theta'];

/** Named points, vectors and angles of a plot: items with "name". */
function plotPointNames(cfg) {
    return (cfg.data || []).map(item => item.name).filter(isExpr);
}

function checkPlot(cfg) {
    const errors = [];
    let params = {};
    const pointNames = plotPointNames(cfg);
    const compiler = new ExpressionCompiler({
        getParams: () => params, getPoints: () => ({}),
        paramNames: Object.keys(cfg.params || {}), pointNames, complex: !!cfg.complexMode,
    });
    params = paramValues(cfg.params || {}, compiler);
    checkParams(errors, cfg, compiler);
    const value = (where, v) => { if (isExpr(v) && !pointNames.includes(v)) tryCompile(errors, where, compiler, v); };
    const range = (where, r) => { if (Array.isArray(r)) r.forEach((v, j) => value(`${where}[${j}]`, v)); };

    (cfg.data || []).forEach((item, i) => {
        const at = `data[${i}]`;
        const pv = (Array.isArray(item.param) && Array.isArray(item.param[0])) ? item.param[0][0] : null;
        if (isExpr(item.fn)) tryCompile(errors, `${at}.fn`, compiler, item.fn, [pv || 'x'], pv ? { exclude: pv } : undefined);
        if (isExpr(item.implicit)) tryCompile(errors, `${at}.implicit`, compiler, item.implicit, ['x', 'y'], { complex: false });
        if (Array.isArray(item.parametric)) {
            item.parametric.forEach((s, j) => { if (isExpr(s)) tryCompile(errors, `${at}.parametric[${j}]`, compiler, s, [pv || 't'], { exclude: pv || 't', complex: false }); });
        }
        if (isExpr(item.r)) tryCompile(errors, `${at}.r`, compiler, item.r, POLAR_VARS, { complex: false });
        if (isExpr(item.to)) tryCompile(errors, `${at}.to`, compiler, item.to, ['x'], { complex: false });
        if (Array.isArray(item.param)) item.param.forEach((p, j) => { if (Array.isArray(p)) range(`${at}.param[${j}]`, p.slice(1)); });
        range(`${at}.domain`, item.domain);
        range(`${at}.range`, item.range);
        // Points: [x, y, label]
        if (Array.isArray(item.points)) {
            item.points.forEach((p, j) => {
                if (Array.isArray(p)) p.slice(0, 2).forEach((v, k) => value(`${at}.points[${j}][${k}]`, v));
            });
        }
        if (Array.isArray(item.vector)) item.vector.forEach((v, j) => value(`${at}.vector[${j}]`, v));
        ['x', 'y', 'n'].forEach(k => value(`${at}.${k}`, item[k]));
    });
    ['xStep', 'yStep', 'xNumberStep', 'yNumberStep'].forEach(k => value(k, cfg[k]));
    return errors;
}

// ---------------------------------------------------------------------------
// sets
// ---------------------------------------------------------------------------

function checkSets(cfg) {
    const warnings = [];
    let params = {};
    const compiler = new ExpressionCompiler({
        getParams: () => params, getPoints: () => ({}), paramNames: Object.keys(cfg.params || {}),
    });
    params = paramValues(cfg.params || {}, compiler);
    checkParams(warnings, cfg, compiler);
    // eslint-disable-next-line no-new
    new SetsModel(cfg, {
        evaluate: (v) => (isNum(v) ? v : compiler.eval(String(v))),
        compile: (src, vars) => compiler.fn(src, vars),
        warn: (m) => warnings.push(m),
        isExpression: (src) => {
            try { const v = compiler.eval(src); return isNum(v) && isFinite(v); } catch (e) { return false; }
        },
    });
    return warnings;
}

// ---------------------------------------------------------------------------
// physics
// ---------------------------------------------------------------------------

/** Warnings from the resolver that come from an expression, not from layout or units. */
const EXPRESSION_WARNING = /Unknown symbol|Unexpected|Expected '|Unknown property|requires complexMode|only available in complexMode|Unsupported node/;

function checkPhysics(raw) {
    const errors = [];
    const cfg = expandScene(raw, PHYSICS_MACROS, (m) => errors.push(`expand: ${m}`));
    const objects = (Array.isArray(cfg.objects) ? cfg.objects : []).filter(o => o && typeof o === 'object' && OBJECT_TYPES[o.type]);
    const ids = objects.map(o => o.id).filter(id => typeof id === 'string' && id !== '');
    const stateNames = cfg.state && typeof cfg.state === 'object' && !Array.isArray(cfg.state) ? Object.keys(cfg.state) : [];
    const paramNames = Object.keys(cfg.params || {});

    let params = { g: 9.81, t: 0 };
    let resolver = null;
    const compiler = new PhysicsCompiler({
        getParams: () => params,
        getPoints: () => (resolver ? resolver.resolved : {}),
        // As in a timed scene: t and the state variables are in scope
        paramNames: [...new Set(['g', ...paramNames, 't', ...stateNames])],
        pointNames: ids,
    });
    params = { ...params, ...paramValues(cfg.params || {}, compiler) };
    stateNames.forEach(n => { if (params[n] === undefined) params[n] = 0; });
    checkParams(errors, cfg, compiler);

    resolver = new Resolver({
        objects, types: OBJECT_TYPES, compiler, angleUnit: cfg.angleUnit === 'rad' ? 'rad' : 'deg', config: cfg,
        warn: (m) => { if (EXPRESSION_WARNING.test(m)) errors.push(m); },
    });
    compiler.setIds(resolver.ids);
    resolver.resolveAll({ xMin: 0, xMax: 10, yMin: 0, yMax: 5 });

    // State: { "x": [x0, "dx/dt"] } or { "x": { "val": x0, "rate": "..." } }
    for (const [name, def] of Object.entries(cfg.state && typeof cfg.state === 'object' ? cfg.state : {})) {
        const parts = Array.isArray(def) ? def : (def && typeof def === 'object' ? Object.values(def) : [def]);
        parts.forEach((v, j) => { if (isExpr(v)) tryCompile(errors, `state.${name}[${j}]`, compiler, v); });
    }
    const keyed = (where, obj, keys) => keys.forEach(k => { if (isExpr(obj && obj[k])) tryCompile(errors, `${where}.${k}`, compiler, obj[k]); });
    keyed('root', cfg, ['stopWhen']);
    (Array.isArray(cfg.events) ? cfg.events : []).forEach((ev, i) => {
        keyed(`events[${i}]`, ev, ['when']);
        if (ev && ev.set && typeof ev.set === 'object') Object.entries(ev.set).forEach(([k, v]) => { if (isExpr(v)) tryCompile(errors, `events[${i}].set.${k}`, compiler, v); });
    });
    (Array.isArray(cfg.graphs) ? cfg.graphs : []).forEach((g, i) => {
        const series = Array.isArray(g && g.y) ? g.y : [g && g.y];
        series.forEach((s, j) => {
            const src = s && typeof s === 'object' ? s.value ?? s.expr : s;
            if (isExpr(src)) tryCompile(errors, `graphs[${i}].y[${j}]`, compiler, src);
        });
    });
    (Array.isArray(cfg.readouts) ? cfg.readouts : []).forEach((r, i) => keyed(`readouts[${i}]`, r, ['value']));
    return errors;
}

// ---------------------------------------------------------------------------

const CHECK = { matephis: checkPlot, sets: checkSets, physics: checkPhysics };

describe('Espressioni negli appunti', () => {
    const all = blocks();

    it('trova i blocchi', () => {
        expect(all.filter(b => b.engine === 'matephis').length).toBeGreaterThan(100);
        expect(all.filter(b => b.engine === 'sets').length).toBeGreaterThan(20);
        expect(all.filter(b => b.engine === 'physics').length).toBeGreaterThan(20);
    });

    it('i controlli segnalano un\'espressione sbagliata', () => {
        expect(checkPlot({ data: [{ fn: 'x^' }] })).toHaveLength(1);
        expect(checkPlot({ data: [{ fn: 'qx' }] })).toHaveLength(1);
        expect(checkPlot({ data: [{ implicit: 'x^2 + y^2 = (4' }] })).toHaveLength(1);
        expect(checkPlot({ params: { a: { val: 1 } }, data: [{ fn: 'ax^2' }] })).toEqual([]);
        expect(checkSets({ sets: [{ id: 'X', interval: '[0, 1]' }], maps: [{ id: 'f', from: 'X', to: 'X', expr: 'x^' }] }).length).toBeGreaterThan(0);
        expect(checkPhysics({ objects: [{ type: 'particle', id: 'A', at: ['1 +', 1] }] })).toHaveLength(1);
        expect(checkPhysics({ stopWhen: 'x >', state: { x: [0, '1'] }, objects: [] })).toHaveLength(1);
    });

    for (const engine of ['matephis', 'sets', 'physics']) {
        it(`ogni blocco ${engine} è JSON valido e le sue espressioni compilano`, () => {
            const failures = [];
            for (const b of all.filter(x => x.engine === engine)) {
                let problems;
                try {
                    problems = CHECK[engine](JSON.parse(b.source));
                } catch (e) {
                    problems = [e.message];
                }
                if (EXPECTED_BROKEN.has(b.key)) {
                    if (!problems.length) failures.push(`${b.where} (${b.key}) is listed as broken but parses: remove it from EXPECTED_BROKEN`);
                } else {
                    problems.forEach(p => failures.push(`${b.where}: ${p}`));
                }
            }
            expect(failures).toEqual([]);
        });
    }
});
