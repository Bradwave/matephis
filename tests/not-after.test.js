/**
 * Lookbehind-free regexes (Safari before 16.4 has no lookbehind).
 *
 * The old regexes are built here at run time (Node has lookbehind) and their
 * matches compared with the new code on the same inputs; and no built bundle
 * may contain a lookbehind again.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { matchesNotAfter, testNotAfter, replaceNotAfter } from '../assets/js/matephis-plot-src/parser/not-after.js';
import { substituteLabel } from '../assets/js/matephis-plot-src/parser/expression-parser.js';
import { substituteX } from '../assets/js/matephis-sets-src/core/model.js';
import { PhysicsCompiler, kinematicIds, aliasId } from '../assets/js/matephis-physics-src/core/compiler.js';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const alt = (names) => [...names].sort((a, b) => b.length - a.length).map(esc).join('|');
/** The old regex: the one-character class as a negative lookbehind in front of the pattern. */
const withLookbehind = (cls, src, flags = 'g') => new RegExp(`(?<!${cls})${src}`, flags);
const plain = (re) => [...re].map(m => [m.index, ...m]);

/** Same matches (positions, text, groups), same test(), same replace as the lookbehind regex. */
function same(cls, src, inputs) {
    const before = new RegExp(cls);
    for (const s of inputs) {
        const old = withLookbehind(cls, src);
        const re = new RegExp(src, 'g');
        expect(plain(matchesNotAfter(s, re, before)), s).toEqual(plain(s.matchAll(old)));
        expect(testNotAfter(s, new RegExp(src), before), s).toBe(withLookbehind(cls, src, '').test(s));
        const mark = (...m) => `<${m.slice(0, 3).filter(x => x !== undefined).join('|')}>`;
        expect(replaceNotAfter(s, re, before, mark), s).toBe(s.replace(old, (...m) => mark(...m.slice(0, -2))));
    }
}

// Inputs with every kind of neighbour: start and end of the string, letters,
// digits, "_", ".", operators, and ids that overlap
const EXPR = [
    '', 'x', 'x^2 + 2x', 'exp(x) + max(x, 1)', '2x', 'x_1 + x', 'ax + bx', '(x)(x)', 'xx', '.x', '_x', 'x.y',
    'A.x + B.y', 'BA.x', 'iP.y', '2P.x', 'P.x+P.y', 'A.rad / A.r / A.x / BA.x', 'A.x.y', '_A.x', '.A.x', 'AB.x', 'B.xA.x',
    'A.N.mag + A.N.x', 'xA.N.mag', 'B.A.N.x', 'A.speed > 2 && B.vx < 0', 'C.speed', 'tA.vx', 'A.ax*A.acc', '"A.vy":"B.speed"',
    't', 't + 1', 'theta*t', 'st', 'x1 + v1*t', 'v1*t1', 'q.t', 'a-b.x', 'b.x', 'a-b.x + b.x',
];

describe('Lookbehind senza lookbehind', () => {
    it('le stesse corrispondenze delle sette espressioni regolari di prima', () => {
        // sets substituteX: (?<![A-Za-z_])x(?![A-Za-z0-9_])
        same('[A-Za-z_]', 'x(?![A-Za-z0-9_])', EXPR);
        // plot substituteLabel: (?<![0-9_.])(names)\.(prop)(?![A-Za-z0-9_])
        same('[0-9_.]', `(${alt(['A', 'B', 'BA', 'P'])})\\.(theta|rad|deg|len|x|y|r)(?![A-Za-z0-9_])`, EXPR);
        // plot pointer: (?<![A-Za-z0-9_])key(?![A-Za-z0-9_])
        for (const key of ['a', 't', 'x1', 'v']) same('[A-Za-z0-9_]', `${key}(?![A-Za-z0-9_])`, EXPR);
        // physics compiler rewrite: (?<![A-Za-z0-9_.])(dotted ids)(?=\.[A-Za-z])
        same('[A-Za-z0-9_.]', `(${alt(['A.N', 'B.A.N', 'A.f'])})(?=\\.[A-Za-z])`, EXPR);
        // physics kinematicIds: (?<![A-Za-z0-9_.])(ids)\.(vx|…)\b
        same('[A-Za-z0-9_.]', `(${alt(['A', 'B', 'C'])})\\.(vx|vy|speed|ax|ay|acc)\\b`, EXPR);
        // physics solver prescribed: (?<![A-Za-z0-9_.])name(?![A-Za-z0-9_])
        for (const n of ['t', 'x1', 'v1', 'q']) same('[A-Za-z0-9_.]', `${n}(?![A-Za-z0-9_])`, EXPR);
        // physics resolver: (?<![A-Za-z0-9_.])(ids)\.
        same('[A-Za-z0-9_.]', `(${alt(['A', 'B', 'A.N', 'a-b', 'b'])})\\.`, EXPR);
    });

    it('un rifiuto riprova un carattere dopo, come il motore', () => {
        // "a-b" after a letter is rejected; "b" just after it is not preceded by a letter
        const re = /(a-b|b)\./g;
        expect(matchesNotAfter('xa-b.', re, /[A-Za-z]/).map(m => [m.index, m[1]])).toEqual([[3, 'b']]);
        expect([...'xa-b.'.matchAll(/(?<![A-Za-z])(a-b|b)\./g)].map(m => [m.index, m[1]])).toEqual([[3, 'b']]);
    });

    it('le funzioni dei motori danno gli stessi risultati di prima', () => {
        const oldX = (src, by) => String(src).replace(/(?<![A-Za-z_])x(?![A-Za-z0-9_])/g, `(${by})`);
        EXPR.forEach(s => expect(substituteX(s, 't+1'), s).toBe(oldX(s, 't+1')));
        expect(substituteX('x^2 + 2x - exp(x)', 't+1')).toBe('(t+1)^2 + 2(t+1) - exp((t+1))');

        const pts = { A: { x: 3, y: 4, rad: 0.52 }, BA: { x: 1, y: 1 }, P: { x: 2, y: 3 }, B: { x: 5, y: 6 } };
        const oldLabel = (str) => {
            const re = new RegExp(`(?<![0-9_.])(${alt(Object.keys(pts))})\\.(theta|rad|deg|len|x|y|r)(?![A-Za-z0-9_])`, 'g');
            return str.replace(re, (m, name, prop) => substituteLabel(`${name}.${prop}`, pts));
        };
        EXPR.forEach(s => expect(substituteLabel(s, pts), s).toBe(oldLabel(s)));

        const ids = ['A', 'B', 'C', 'A.N'];
        const oldKin = (text) => {
            const re = new RegExp(`(?<![A-Za-z0-9_.])(${alt(ids)})\\.(vx|vy|speed|ax|ay|acc)\\b`, 'g');
            return [...new Set([...text.matchAll(re)].map(m => m[1]))];
        };
        const cfg = { objects: [{ value: 'A.speed + B.vx' }, { at: 'xC.ax' }, { show: 'A.N.vx' }], readouts: [{ value: 'C.acc' }] };
        expect(kinematicIds(cfg, ids)).toEqual(oldKin(JSON.stringify(cfg)));
        expect(kinematicIds(cfg, ids)).toEqual(['A', 'B', 'A.N', 'C']);

        const c = new PhysicsCompiler({ getParams: () => ({}), getPoints: () => ({}) });
        c.setIds(['A', 'A.N', 'B.A.N']);
        const oldRewrite = (src) => src.replace(new RegExp(`(?<![A-Za-z0-9_.])(${alt(['A.N', 'B.A.N'])})(?=\\.[A-Za-z])`, 'g'), (m) => aliasId(m));
        EXPR.forEach(s => expect(c.rewrite(s), s).toBe(oldRewrite(s)));
        expect(c.rewrite('A.N.mag + B.A.N.x')).toBe('A__N.mag + B__A__N.x');
    });

    it('nessun bundle contiene un lookbehind', () => {
        const dir = path.resolve(__dirname, '../assets/js');
        const bundles = fs.readdirSync(dir).filter(f => /^matephis-.*\.js$/.test(f));
        expect(bundles).toEqual(expect.arrayContaining(['matephis-plot.js', 'matephis-sets.js', 'matephis-physics.js']));
        const found = bundles.filter(f => /\(\?<[!=]/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
        expect(found).toEqual([]);
    });
});
