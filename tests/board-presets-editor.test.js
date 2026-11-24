import { describe, it, expect } from 'vitest';
import { PHYSICS_PRESET_SECTIONS } from '../assets/js/matephis-board-src/ui/physics-presets.js';
import { SETS_PRESET_SECTIONS } from '../assets/js/matephis-board-src/ui/sets-presets.js';
import {
    PLOT_TEMPLATES,
    instantiateTemplate,
    niceStep,
    snapTo,
    exprUsesName,
    detectParams,
} from '../assets/js/matephis-board-src/ui/plot-editor.js';
import { findStrokesOnWidget } from '../assets/js/matephis-board-src/ui/widgets.js';
import { HistoryStack } from '../assets/js/matephis-board-src/ink/history.js';
import { validateConfig as validatePlotConfig, createPalettes } from '../assets/js/matephis-plot-src/core/config.js';
import { validateConfig as validatePhysicsConfig } from '../assets/js/matephis-physics-src/core/config.js';
import { expandScene } from '../assets/js/matephis-physics-src/core/presets.js';
import { OBJECT_TYPES } from '../assets/js/matephis-physics-src/objects/index.js';
import { validateConfig as validateSetsConfig } from '../assets/js/matephis-sets-src/core/config.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

describe('Board physics presets', () => {
    it('has the three sections with unique ids', () => {
        expect(PHYSICS_PRESET_SECTIONS.map((s) => s.id)).toEqual(['cinematica', 'dinamica', 'quantita-di-moto']);
        const ids = PHYSICS_PRESET_SECTIONS.flatMap((s) => s.items.map((i) => i.id));
        expect(new Set(ids).size).toBe(ids.length);
    });

    for (const section of PHYSICS_PRESET_SECTIONS) {
        for (const item of section.items) {
            it(`${section.id}/${item.id} expands and validates with no warnings`, () => {
                const expandWarnings = [];
                const expanded = expandScene(JSON.parse(JSON.stringify(item.data)), {}, (m) => expandWarnings.push(m));
                expect(expandWarnings).toEqual([]);
                expect(validatePhysicsConfig(expanded, OBJECT_TYPES)).toEqual([]);
            });
        }
    }
});

describe('Board sets presets', () => {
    for (const section of SETS_PRESET_SECTIONS) {
        for (const item of section.items) {
            it(`${section.id}/${item.id} validates with no warnings`, () => {
                expect(validateSetsConfig(JSON.parse(JSON.stringify(item.data)))).toEqual([]);
            });
        }
    }
});

describe('Plot editor templates', () => {
    it('renames clashing parameters and keeps the expression consistent', () => {
        const parabola = PLOT_TEMPLATES.find((t) => t.id === 'parabola');
        const first = instantiateTemplate(parabola, new Set());
        const second = instantiateTemplate(parabola, new Set(Object.keys(first.params)));
        expect(Object.keys(second.params)).toEqual(['a2', 'b2', 'c2']);
        expect(second.fn).toBe('a2*x^2 + b2*x + c2');
        expect(second.params.a2.label).toBe('a₂');
        expect(exprUsesName(second.fn, 'a')).toBe(false);
        expect(exprUsesName(second.fn, 'a2')).toBe(true);
    });

    it('produces plot configs that validate', () => {
        const compiler = new ExpressionCompiler({ getParams: () => ({}), getPoints: () => ({}), paramNames: [] });
        for (const tpl of PLOT_TEMPLATES) {
            const { fn, params } = instantiateTemplate(tpl);
            const cfg = { xlim: [-5, 5], ylim: [-4, 4], params, data: [{ fn, color: 'summer1' }] };
            expect(validatePlotConfig(cfg, createPalettes(false))).toEqual([]);
            const scope = Object.fromEntries(Object.entries(params).map(([k, p]) => [k, p.val]));
            const f = compiler.fn(fn, ['x', ...Object.keys(scope)]);
            expect(typeof f).toBe('function');
        }
    });

    it('steps window limits by 1, 2 or 5 times a power of ten', () => {
        expect(niceStep(10)).toBe(1);
        expect(niceStep(40)).toBe(5);
        expect(niceStep(4)).toBe(0.5);
        expect(snapTo(2.0000000001, 1)).toBe(2);
        expect(snapTo(6.283, 1)).toBe(6.283);
    });
});

describe('Function editor parameters', () => {
    it('turns free letters into sliders, not x, constants or functions', () => {
        expect(detectParams('a*x^2 + b*x + c')).toEqual(['a', 'b', 'c']);
        expect(detectParams('k*sin(x) + pi')).toEqual(['k']);
        expect(detectParams('sqrt(x - h) + e^x')).toEqual(['h']);
        expect(detectParams('log(x, a)')).toEqual(['a']);
        expect(detectParams('a(x - 1)')).toEqual(['a']);
        expect(detectParams('x^2')).toEqual([]);
        expect(detectParams('a+b+c+d+f+g')).toHaveLength(4);
    });
});

describe('Widget move carries the ink written on it', () => {
    const stroke = (id, minX, minY, maxX, maxY) => ({
        id,
        points: [{ x: minX, y: minY }, { x: maxX, y: maxY }],
        width: 0.5,
        bbox: { minX, minY, maxX, maxY },
    });

    it('picks strokes centred on the widget and not reaching far outside', () => {
        const widget = { x: 10, y: 10, w: 100, h: 60 };
        const strokes = [
            stroke('in', 20, 20, 40, 30),
            stroke('edge', 100, 60, 112, 68),
            stroke('far', 90, 50, 140, 80),
            stroke('out', 200, 200, 210, 210),
        ];
        expect(findStrokesOnWidget(strokes, widget).map((s) => s.id)).toEqual(['in', 'edge']);
    });

    it('undoes and redoes widget and strokes together', () => {
        const page = { strokes: [stroke('s1', 20, 20, 40, 30)], widgets: [{ id: 'w1', x: 10, y: 10, w: 100, h: 60 }], connectors: [] };
        const history = new HistoryStack();
        page.widgets[0].x = 30;
        page.widgets[0].y = 15;
        page.strokes[0].points = page.strokes[0].points.map((p) => ({ x: p.x + 20, y: p.y + 5 }));
        history.push({ type: 'widget-move', id: 'w1', dx: 20, dy: 5, strokeIds: ['s1'] });

        history.undo(page);
        expect(page.widgets[0]).toMatchObject({ x: 10, y: 10 });
        expect(page.strokes[0].points[0]).toEqual({ x: 20, y: 20 });

        history.redo(page);
        expect(page.widgets[0]).toMatchObject({ x: 30, y: 15 });
        expect(page.strokes[0].points[0]).toEqual({ x: 40, y: 25 });
    });
});

describe('Widget pictures are built only when wanted', () => {
    it('ignores changes of unwanted widgets and frees pictures nobody needs', async () => {
        const { WidgetPictureCache } = await import('../assets/js/matephis-board-src/ui/widget-pictures.js');
        const wanted = new Set(['w1']);
        const cache = new WidgetPictureCache({ engineLoader: null, isWanted: (id) => wanted.has(id) });
        cache.touch({ id: 'w2', kind: 'plot', w: 100, data: {} });
        expect(cache.entries.has('w2')).toBe(false);

        cache.entries.set('w1', { sig: 's', canvas: {}, touchTimer: null });
        cache.entries.set('w3', { sig: 's', canvas: {}, touchTimer: null });
        cache.retain(new Set(['w1']));
        expect([...cache.entries.keys()]).toEqual(['w1']);
    });
});
