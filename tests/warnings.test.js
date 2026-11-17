/**
 * Warnings that clear (ui/warnings.js, shared by plot, sets and physics):
 * warnings raised while drawing last only until the next draw; warnings from
 * the config stay.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WarningsMixin } from '../assets/js/matephis-plot-src/ui/warnings.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';
import { SetsModel } from '../assets/js/matephis-sets-src/core/model.js';

// A minimal DOM: enough for the warnings box
function fakeElement(tag) {
    return {
        tag, className: '', textContent: '', children: [],
        appendChild(c) { this.children.push(c); c.parent = this; return c; },
        remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); },
        querySelector(sel) { return this.children.find(c => `.${c.className}` === sel) || null; },
    };
}
let savedDocument;
beforeAll(() => {
    savedDocument = globalThis.document;
    globalThis.document = { createElement: fakeElement };
});
afterAll(() => { globalThis.document = savedDocument; });

/** An object with the mixin; `box()` is the list shown under it (null: no box). */
function scene(title = 'Sets') {
    const s = Object.assign({ wrapper: fakeElement('div'), renders: 0 }, WarningsMixin);
    const render = s._renderWarnings;
    s._renderWarnings = function () { this.renders++; return render.call(this); };
    s._initWarnings(title);
    s.box = () => {
        const div = s.wrapper.querySelector('.matephis-plot-warnings');
        return div ? div.children[1].children.map(li => li.textContent) : null;
    };
    return s;
}

describe('Avvisi che si cancellano', () => {
    it('un avviso del disegno sparisce al disegno dopo', () => {
        const s = scene();
        s._drawingWarnings(() => s._addWarning('empty interval'));
        expect(s.warnings).toEqual(['empty interval']);
        expect(s.box()).toEqual(['empty interval']);
        expect(s.wrapper.children[0].children[0].textContent).toBe('⚠️ Sets Warnings:');
        s._drawingWarnings(() => {});
        expect(s.warnings).toEqual([]);
        expect(s.box()).toBeNull();
    });

    it('gli avvisi della configurazione restano, prima degli altri', () => {
        const s = scene('Plot');
        s._addWarning("Unknown global option: 'xlin'");
        s._drawingWarnings(() => { s._addWarning('point 1: NaN'); s._addWarning("Unknown global option: 'xlin'"); });
        expect(s.box()).toEqual(["Unknown global option: 'xlin'", 'point 1: NaN']);
        s._drawingWarnings(() => {});
        expect(s.box()).toEqual(["Unknown global option: 'xlin'"]);
    });

    it('il riquadro si ridisegna solo quando la lista cambia', () => {
        const s = scene();
        s._drawingWarnings(() => s._addWarning('a'));
        const n = s.renders;
        s._drawingWarnings(() => s._addWarning('a'));
        s._drawingWarnings(() => s._addWarning('a'));
        expect(s.renders).toBe(n);
        s._drawingWarnings(() => s._addWarning('b'));
        expect(s.renders).toBe(n + 1);
        expect(s.box()).toEqual(['b']);
    });

    it('un disegno dentro un disegno conta come uno', () => {
        const s = scene();
        s._drawingWarnings(() => {
            s._addWarning('outer');
            s._drawingWarnings(() => s._addWarning('inner'));
            expect(s.box()).toBeNull(); // nothing shown halfway through
        });
        expect(s.box()).toEqual(['outer', 'inner']);
    });

    it('un errore nel disegno non blocca il conteggio', () => {
        const s = scene();
        expect(() => s._drawingWarnings(() => { s._addWarning('x'); throw new Error('boom'); })).toThrow('boom');
        expect(s.box()).toEqual(['x']);
        s._drawingWarnings(() => {});
        expect(s.box()).toBeNull();
    });

    it('esercizi-sulle-funzioni: a oltre b e ritorno (insiemi)', () => {
        // The slider diagram for x² from [a, b] to [c, d]: a passes b, then comes back
        const params = { a: -1, b: 2, c: 0, d: 4 };
        const compiler = new ExpressionCompiler({ getParams: () => params, getPoints: () => ({}), paramNames: Object.keys(params) });
        const s = scene();
        const model = new SetsModel({
            sets: [{ id: 'A', interval: '[a, b]' }, { id: 'B', interval: '[c, d]' }],
            maps: [{ id: 'f', from: 'A', to: 'B', expr: 'x^2' }],
        }, {
            evaluate: (v) => (typeof v === 'number' ? v : compiler.eval(String(v))),
            compile: (src, vars) => compiler.fn(src, vars),
            warn: (m) => s._addWarning(m),
        });
        const draw = () => s._drawingWarnings(() => model.refresh());
        draw();
        expect(s.box()).toBeNull();
        params.a = 2.5;
        draw();
        expect(s.box()).toEqual(["set 'A': the interval is empty or its endpoints are not numbers"]);
        params.a = 1;
        draw();
        expect(s.box()).toBeNull();
    });
});
