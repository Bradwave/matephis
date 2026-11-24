import { describe, it, expect } from 'vitest';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';
import { SampleCache, readsOf } from '../assets/js/matephis-plot-src/renderers/sample-cache.js';

const params = { a: 1, b: 2 };
const points = { A: { x: 1, y: 2 }, B: { x: 3, y: 4 } };
const compiler = new ExpressionCompiler({
    getParams: () => params, getPoints: () => points, paramNames: ['a', 'b'], pointNames: ['A', 'B'],
});

describe('Cache dei campionamenti', () => {
    it('legge dal codice generato i parametri e i punti usati', () => {
        expect(readsOf(compiler.fn('a*sin(x) + A.y'))).toEqual({ params: ['a'], points: ['A'] });
        expect(readsOf(compiler.fn('x^2 + pi'))).toEqual({ params: [], points: [] });
        expect(readsOf(compiler.fn('b*x + B.x*A.x'))).toEqual({ params: ['b'], points: ['A', 'B'] });
        expect(readsOf(() => 1)).toBe(null);
    });

    it('ricalcola solo quando cambia ciò che la curva legge', () => {
        const c = new SampleCache();
        const f = compiler.fn('a*x');
        let runs = 0;
        const compute = () => { runs++; return [[0, 0]]; };
        const draw = () => { c.begin('frame'); return c.get('fn', [f], params, points, compute); };
        const first = draw();
        expect(draw()).toBe(first);
        params.b = 5; // not read by a*x
        expect(draw()).toBe(first);
        expect(runs).toBe(1);
        params.a = 3;
        draw();
        expect(runs).toBe(2);
        params.a = 1;
    });

    it('ricalcola quando cambia la finestra o un punto usato', () => {
        const c = new SampleCache();
        const f = compiler.fn('A.y*x');
        let runs = 0;
        const compute = () => { runs++; return []; };
        c.begin('w1'); c.get('fn', [f], params, points, compute);
        c.begin('w2'); c.get('fn', [f], params, points, compute);
        expect(runs).toBe(2);
        points.A = { x: 1, y: 7 };
        c.begin('w2'); c.get('fn', [f], params, points, compute);
        expect(runs).toBe(3);
        points.B = { x: 0, y: 0 }; // not read
        c.begin('w2'); c.get('fn', [f], params, points, compute);
        expect(runs).toBe(3);
    });

    it('tiene solo le curve dell\'ultimo disegno', () => {
        const c = new SampleCache();
        const f = compiler.fn('x');
        c.begin('w'); c.get('one', [f], params, points, () => 1);
        c.begin('w'); // "one" not drawn this time
        c.begin('w');
        let runs = 0;
        c.get('one', [f], params, points, () => { runs++; return 1; });
        expect(runs).toBe(1);
    });

    it('distingue -0 da 0', () => {
        const c = new SampleCache();
        const f = compiler.fn('a*x');
        let runs = 0;
        params.a = 0;
        c.begin('w'); c.get('fn', [f], params, points, () => { runs++; });
        params.a = -0;
        c.begin('w'); c.get('fn', [f], params, points, () => { runs++; });
        expect(runs).toBe(2);
        params.a = 1;
    });
});
