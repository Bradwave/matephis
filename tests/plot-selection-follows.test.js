/**
 * A selected point follows the curve when a slider changes it
 * (plot.md finding 2): after a redraw, a selection on a function is computed
 * again at its x.
 */
import { describe, it, expect } from 'vitest';
import { SelectionMixin } from '../assets/js/matephis-plot-src/interaction/selection.js';
import { DataMixin } from '../assets/js/matephis-plot-src/renderers/data-renderer.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

const cs = { mapX: (x) => 200 + x * 40, mapY: (y) => 150 - y * 10, unmapX: (px) => (px - 200) / 40, unmapY: (py) => (150 - py) / 10 };

/** The parts of a plot that selections use, with the real mixins; `shown` is what the last redraw displayed. */
function plot(data, params = {}, extra = {}) {
    const p = {
        config: { data, ...extra }, params, transform: cs, isSnapping: true,
        interactions: { currentSelection: null, draggingSelection: null, slopeP1: null, slopeP2: null },
        plotData: data.map((d, index) => ({ index, type: d.type === 'interpolation' ? 'interpolation' : 'fn', lines: [] })),
        shown: undefined,
        _eval(v) { return typeof v === 'number' ? v : this.compiler.eval(v); },
        _updateSelectionVisuals(m) { this.shown = m; },
    };
    p.compiler = new ExpressionCompiler({ getParams: () => p.params, getPoints: () => ({}), paramNames: Object.keys(params), complex: !!extra.complexMode });
    Object.assign(p, { _itemFn: DataMixin._itemFn, _domainOf: DataMixin._domainOf }, SelectionMixin);
    // The drawing itself needs a DOM: record what would be shown instead
    p._updateSelectionVisuals = function (m) { this.shown = m; };
    return p;
}

/** A selection as the pointer makes it: at screen x, with valX/valY read back from the screen. */
const pick = (p, x) => {
    const m = p._getPointAtGraphX(x, 0, false);
    delete m.argX; // as from a click on the drawn curve (_fillVal)
    return m;
};

describe('La selezione segue la curva', () => {
    it('tangente su a·x²: il punto resta sulla curva quando a cambia', () => {
        const p = plot([{ fn: 'a*x^2' }], { a: 1 });
        p.interactions.currentSelection = pick(p, 2);
        p.params.a = -1;
        p._restoreSelectionVisuals();
        const s = p.interactions.currentSelection;
        expect([s.valX, s.valY]).toEqual([2, -4]);
        expect([s.x, s.y]).toEqual([cs.mapX(2), cs.mapY(-4)]);
        expect(p.shown).toBe(s);
    });

    it('anche durante un trascinamento (stesso oggetto)', () => {
        const p = plot([{ fn: 'a*x^2' }], { a: 1 });
        const m = pick(p, 1);
        p.interactions.currentSelection = m;
        p.interactions.draggingSelection = m;
        p.params.a = 3;
        p._restoreSelectionVisuals();
        expect(p.interactions.draggingSelection.valY).toBe(3);
    });

    it('pendenza: entrambi i punti seguono la curva', () => {
        const p = plot([{ fn: 'a*x^2' }], { a: 1 });
        p.interactions.slopeP1 = pick(p, 1);
        p.interactions.slopeP2 = pick(p, 3);
        p.params.a = 2;
        p._restoreSelectionVisuals();
        expect(p.interactions.slopeP1.valY).toBe(2);
        expect(p.interactions.slopeP2.valY).toBe(18);
    });

    it('dove la funzione non è più definita la selezione sparisce', () => {
        const p = plot([{ fn: 'sqrt(x - a)' }], { a: 0 });
        p.interactions.currentSelection = pick(p, 1);
        p.params.a = 2;
        p._restoreSelectionVisuals();
        expect(p.interactions.currentSelection).toBeNull();
        expect(p.shown).toBeNull();

        const q = plot([{ fn: 'sqrt(x - a)' }], { a: 0 });
        q.interactions.slopeP1 = pick(q, 4);
        q.interactions.slopeP2 = pick(q, 1);
        q.params.a = 2;
        q._restoreSelectionVisuals();
        expect([q.interactions.slopeP1, q.interactions.slopeP2]).toEqual([null, null]);
    });

    it('senza cambi resta dov\'era (solo la vista)', () => {
        const p = plot([{ fn: 'x^2' }]);
        const m = pick(p, 1.5);
        p.interactions.currentSelection = m;
        p._restoreSelectionVisuals();
        expect([m.valX, m.valY]).toEqual([1.5, 2.25]);
    });

    it('modo complesso: segue solo una x nota', () => {
        const p = plot([{ fn: 'a*x' }], { a: 1 }, { complexMode: true });
        const known = p._getPointAtGraphX(2, 0, false); // argX = 2
        p.interactions.currentSelection = known;
        p.params.a = 3;
        p._restoreSelectionVisuals();
        // The point drawn is the value (re, im) = (6, 0); the x stays 2
        expect([known.valX, known.valY, known.argX]).toEqual([6, 0, 2]);

        const clicked = pick(p, 1); // no argX: valX is the real part 3, not an x: left alone
        p.interactions.currentSelection = clicked;
        p.params.a = 5;
        p._restoreSelectionVisuals();
        expect([clicked.valX, clicked.valY]).toEqual([3, 0]);
    });
});
