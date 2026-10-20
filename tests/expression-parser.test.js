import { describe, it, expect } from 'vitest';
import { ExpressionCompiler, compileExpression, evalValue, substituteLabel } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

const compiler = (params = {}, points = {}, complex = false) => new ExpressionCompiler({
    getParams: () => params,
    getPoints: () => points,
    paramNames: Object.keys(params),
    complex,
});

describe('ExpressionParser', () => {
    it('trasforma potenze e moltiplicazioni implicite', () => {
        const f = compiler().fn('3x^2 + 2x - 5');
        expect(f(2)).toBe(11);
        expect(compiler().fn('2(x+1)(x-1)')(3)).toBe(16);
        expect(compiler().fn('x sin(x)')(Math.PI / 2)).toBeCloseTo(Math.PI / 2);
    });

    it('rispetta le precedenze del meno unario e delle potenze', () => {
        expect(compiler().eval('-2^2')).toBe(-4);
        expect(compiler().eval('2^-1')).toBe(0.5);
        expect(compiler().eval('2^3^2')).toBe(512);
        expect(compiler().fn('-x^2')(3)).toBe(-9);
        expect(compiler().fn('1/2x')(4)).toBe(2);
    });

    it('supporta funzioni trigonometriche e costanti pi', () => {
        const f = compiler().fn('sin(pi * x)');
        expect(f(0.5)).toBeCloseTo(1, 5);
        expect(compiler().eval('2pi')).toBeCloseTo(2 * Math.PI);
        expect(compiler().fn('sinx')(1)).toBeCloseTo(Math.sin(1));
    });

    it('supporta valore assoluto, log in base e funzioni a tratti', () => {
        expect(compiler().fn('|x - 1| + 2')(-3)).toBe(6);
        expect(compiler().eval('log(8, 2)')).toBeCloseTo(3);
        const f = compiler().fn('x < 0 ? -x : x^2');
        expect(f(-2)).toBe(2);
        expect(f(3)).toBe(9);
    });

    it('legge i parametri al momento della chiamata (nessuna ricompilazione)', () => {
        const params = { a: 2, b: 3 };
        const c = compiler(params);
        const f = c.fn('a x^2 + b');
        expect(f(2)).toBe(11);
        params.a = 1;
        expect(f(2)).toBe(7);
        expect(c.fn('a x^2 + b')).toBe(f); // cached
    });

    it('non si rompe con valori in notazione esponenziale', () => {
        const points = { P: { x: 1e-17, y: 2 } };
        expect(compiler({}, points).eval('3P.x + P.y')).toBeCloseTo(2);
    });

    it('legge le proprietà dei punti, anche .rad e .deg degli angoli', () => {
        const points = { A: { x: 3, y: 4 }, B: { rad: 0.5, deg: 30 } };
        const c = compiler({}, points);
        expect(c.eval('A.r')).toBe(5);
        expect(c.eval('A.theta')).toBeCloseTo(Math.atan2(4, 3));
        expect(c.eval('B.rad + B.deg')).toBe(30.5);
    });

    it('supporta i numeri complessi', () => {
        const c = compiler({}, {}, true);
        const z = c.fn('exp(i * x)')(Math.PI);
        expect(z.re).toBeCloseTo(-1, 5);
        expect(z.im).toBeCloseTo(0, 5);
        expect(c.eval('-1+i')).toEqual({ re: -1, im: 1 });
        expect(c.eval('(1+i)^2')).toEqual({ re: 0, im: 2 });
        expect(c.eval('abs(3+4i)')).toBe(5);
        expect(c.eval('1.5*e^(i*PI)').re).toBeCloseTo(-1.5);
        expect(c.eval('sqrt(-4)')).toEqual({ re: 0, im: 2 });
    });

    it('trasforma le equazioni implicite in F(x, y) = lhs - rhs', () => {
        const F = compiler().fn('x^2 + y^2 = 25', ['x', 'y']);
        expect(F(3, 4)).toBe(0);
        expect(F(0, 0)).toBe(-25);
    });

    it('segnala simboli sconosciuti', () => {
        expect(() => compileExpression('foo(x)')).toThrow(/Unknown symbol/);
        expect(() => compileExpression('2 +')).toThrow();
    });

    it('evalValue valuta espressioni scalari', () => {
        expect(evalValue(5)).toBe(5);
        expect(evalValue('2 * pi')).toBeCloseTo(2 * Math.PI, 5);
        expect(evalValue('a + 1', { params: { a: 2 } })).toBe(3);
    });

    it('substituteLabel non confonde .r con .rad né A con BA', () => {
        const pts = { A: { x: 3, y: 4, rad: 0.52 }, BA: { x: 1, y: 1 } };
        expect(substituteLabel('A.rad / A.r / A.x / BA.x', pts)).toBe('0.52 / 5 / 3 / 1');
    });
});

describe('ExpressionParser: prefissi sui punti', () => {
    it('legge "iP.y" come i·P.y (numeri complessi scritti come P.x + iP.y)', () => {
        const c = new ExpressionCompiler({ getParams: () => ({}), getPoints: () => ({ P: { x: 2, y: 3 } }), pointNames: ['P'], complex: true });
        expect(c.eval('P.x + iP.y')).toEqual({ re: 2, im: 3 });
        expect(substituteLabel('z = P.x + iP.y', { P: { x: 2, y: 3 } })).toBe('z = 2 + i3');
    });
});

describe('Gradi e radianti', () => {
    it('interpreta il ° come operatore postfisso', () => {
        expect(compiler().eval('30°')).toBeCloseTo(Math.PI / 6, 12);
        expect(compiler().eval('sin(30°)')).toBeCloseTo(0.5, 12);
        expect(compiler().eval('sin 90°')).toBeCloseTo(1, 12);
        expect(compiler().eval('-45°')).toBeCloseTo(-Math.PI / 4, 12);
        expect(compiler().eval('(30 + 15)°')).toBeCloseTo(Math.PI / 4, 12);
        expect(compiler().eval('30°^2')).toBeCloseTo((Math.PI / 6) ** 2, 12);
        expect(compiler().eval('2*30°')).toBeCloseTo(Math.PI / 3, 12);
    });

    it('accetta il simbolo º al posto di °', () => {
        expect(compiler().eval('cos(60º)')).toBeCloseTo(0.5, 12);
    });

    it('applica il ° a parametri e variabili', () => {
        expect(compiler({ alpha: 30 }).eval('sin(alpha°)')).toBeCloseTo(0.5, 12);
        expect(compiler().fn('x°')(180)).toBeCloseTo(Math.PI, 12);
    });

    it('converte con deg() e rad()', () => {
        expect(compiler().eval('deg(pi)')).toBeCloseTo(180, 12);
        expect(compiler().eval('rad(180)')).toBeCloseTo(Math.PI, 12);
        expect(compiler().eval('deg(30°)')).toBeCloseTo(30, 12);
    });

    it('lascia usabili parametri chiamati deg o rad', () => {
        expect(compiler({ rad: 2 }).eval('3rad')).toBe(6);
        expect(compiler({ deg: 4 }).eval('deg + 1')).toBe(5);
    });

    it('funziona anche in modalità complessa', () => {
        expect(compiler({}, {}, true).eval('cos(60°)')).toBeCloseTo(0.5, 12);
    });
});
