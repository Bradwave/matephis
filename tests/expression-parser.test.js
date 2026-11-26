import { describe, it, expect } from 'vitest';
import { ExpressionCompiler, compileExpression, evalValue, substituteLabel, parseExpression, printExpression, substituteVariable } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

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

describe('ExpressionParser: nomi accostati e potenze', () => {
    // "ax" is one token, split into a·x: a following ^ must apply to x only, as in "2x^2"
    it('ax^2 = a·x², non (a·x)²', () => {
        const params = { a: -2, b: 1, c: 1, k: 3 };
        const c = compiler(params);
        expect(c.fn('ax^2')(3)).toBe(-18);
        expect(c.fn('kx^2')(2)).toBe(12);
        expect(c.fn('2ax^2')(3)).toBe(-36);
        expect(c.fn('ax^3')(-2)).toBe(16);
        expect(c.fn('ax^2+bx+c')(2)).toBe(-8 + 2 + 1);
        expect(c.fn('ax^-1')(4)).toBe(-0.5);
        expect(c.fn('ax^2^2')(2)).toBe(-32);
        params.a = 1;
        expect(c.fn('ax^2')(3)).toBe(9);
    });

    it('xe^x = x·eˣ', () => {
        expect(compiler().fn('xe^x')(2)).toBeCloseTo(2 * Math.exp(2), 12);
        expect(compiler().fn('pix^2')(2)).toBeCloseTo(4 * Math.PI, 12);
    });

    it('xy^2 = x·y² nelle curve implicite', () => {
        const F = compiler().fn('xy^2 = 1', ['x', 'y']);
        expect(F(2, 3)).toBe(17);
    });

    it('le parentesi elevano tutto il prodotto', () => {
        const c = compiler({ a: -2 });
        expect(c.fn('(ax)^2')(3)).toBe(36);
        expect(c.fn('a(x)^2')(3)).toBe(-18);
    });

    it('un esponente accostato resta intero: e^kx = e^(kx)', () => {
        expect(compiler({ k: 2 }).fn('e^kx')(1)).toBeCloseTo(Math.exp(2), 12);
        expect(compiler({ a: 2 }).fn('e^ax^2')(3)).toBeCloseTo(Math.exp(18), 6);
    });

    it('! e ° valgono per l\'ultimo fattore', () => {
        expect(compiler({ a: 2 }).fn('ax!')(3)).toBe(12);
        expect(compiler({ a: 2 }).eval('a30°')).toBeCloseTo(Math.PI / 3, 12);
    });

    it('le funzioni non cambiano', () => {
        const c = compiler({ a: 2 });
        expect(c.fn('sinx^2')(1)).toBeCloseTo(Math.sin(1) ** 2, 12);
        expect(c.fn('sin x^2')(1.5)).toBeCloseTo(Math.sin(2.25), 12);
        expect(c.fn('2sinx^2')(1)).toBeCloseTo(2 * Math.sin(1) ** 2, 12);
        expect(c.fn('asinx')(0.5)).toBeCloseTo(Math.asin(0.5), 12);
        expect(c.fn('exp(x)^2')(1)).toBeCloseTo(Math.exp(2), 12);
        expect(c.fn('aexp(x)')(1)).toBeCloseTo(2 * Math.E, 12);
        expect(c.fn('acos(x)^2')(0)).toBeCloseTo((Math.PI / 2) ** 2, 12);
        expect(c.fn('2x^2')(3)).toBe(18);
    });

    it('vale anche per i prefissi dei punti: 2aP.x^2 = 2a·(P.x)²', () => {
        const c = new ExpressionCompiler({
            getParams: () => ({ a: 3 }), getPoints: () => ({ P: { x: 2, y: 0 } }), paramNames: ['a'], pointNames: ['P'],
        });
        expect(c.eval('2aP.x^2')).toBe(24);
    });
});

describe('ExpressionParser: scritture che prima cambiavano significato', () => {
    it('|| dentro un valore assoluto sono due barre', () => {
        const c = compiler();
        expect(c.fn('|x||x|')(-3)).toBe(9);
        expect(c.fn('|x-1||x+1|')(3)).toBe(8);
        expect(c.fn('||x|-1|')(-0.5)).toBe(0.5);
        expect(c.fn('||x|-1|')(-3)).toBe(2);
        expect(c.fn('||x||+1')(-2)).toBe(3);
        expect(c.fn('|x || 1|')(-2)).toBe(2); // |x|·|1|
    });

    it('|| fuori dalle barre resta l\'oppure', () => {
        const c = compiler();
        expect(c.fn('x < 0 || x > 1 ? 1 : 0')(-1)).toBe(1);
        expect(c.fn('x < 0 || x > 1 ? 1 : 0')(0.5)).toBe(0);
        expect(c.fn('|x| > 2 || x == 0 ? 1 : 0')(-3)).toBe(1);
        expect(c.fn('|x| > 2 || x == 0 ? 1 : 0')(1)).toBe(0);
        expect(c.fn('(|x| < 1 || |x| > 2) ? 1 : 0')(1.5)).toBe(0);
    });

    it('i confronti in catena si leggono come in matematica', () => {
        const f = compiler().fn('0 < x < 1 ? 1 : 0');
        expect(f(0.5)).toBe(1);
        expect(f(2)).toBe(0);
        expect(f(-1)).toBe(0);
        const g = compiler().fn('-1 <= x < 0 ? 1 : 0');
        expect(g(-1)).toBe(1);
        expect(g(0)).toBe(0);
        expect(compiler().fn('3 > x > 1 > 0 ? 1 : 0')(2)).toBe(1);
        expect(compiler().fn('x < 0 ? -x : x^2')(-2)).toBe(2); // un confronto solo non cambia
    });

    it('mod tra due operandi', () => {
        const c = compiler({ n: 3 });
        expect(c.fn('x mod 2')(5)).toBe(1);
        expect(c.fn('x mod 2')(-1)).toBe(1);
        expect(c.fn('2x mod 3 + 1')(2)).toBe(2);
        expect(c.fn('x mod n')(7)).toBe(1);
        expect(c.fn('x mod(2)')(5)).toBe(1);
        expect(c.fn('xmod2')(5)).toBe(1);
        expect(c.fn('mod(x, 2)')(5)).toBe(1);
        expect(c.fn('x mod(x, 4)')(6)).toBe(12); // chiamata con due argomenti: x·mod(x, 4)
    });

    it('sin 2x = sin(2x), come sin2x e sin(2x)', () => {
        const c = compiler();
        expect(c.fn('sin 2x')(0.3)).toBeCloseTo(Math.sin(0.6), 12);
        expect(c.fn('sin 2x^2')(0.5)).toBeCloseTo(Math.sin(0.5), 12);
        expect(c.fn('cos 2πx')(0.1)).toBeCloseTo(Math.cos(0.2 * Math.PI), 12);
        expect(c.fn('sin2x')(0.3)).toBeCloseTo(Math.sin(0.6), 12);
    });

    it('una funzione senza parentesi si ferma alla funzione successiva', () => {
        const c = compiler();
        const sc = Math.sin(0.7) * Math.cos(0.7);
        expect(c.fn('sinxcosx')(0.7)).toBeCloseTo(sc, 12);
        expect(c.fn('sin x cos x')(0.7)).toBeCloseTo(sc, 12);
        expect(c.fn('sin 2 cos x')(0.7)).toBeCloseTo(Math.sin(2) * Math.cos(0.7), 12);
        expect(c.fn('sinsinx')(0.7)).toBeCloseTo(Math.sin(Math.sin(0.7)), 12);
    });

    it('una funzione senza parentesi non prende i nomi dopo una variabile', () => {
        const c = compiler({ a: 2 });
        expect(c.fn('sin x e^x')(0.5)).toBeCloseTo(Math.sin(0.5) * Math.exp(0.5), 12);
        expect(c.fn('sin x a')(0.5)).toBeCloseTo(Math.sin(0.5) * 2, 12);
        expect(c.fn('sin(2)x')(0.5)).toBeCloseTo(Math.sin(2) * 0.5, 12);
        expect(c.fn('sin x^2')(1.5)).toBeCloseTo(Math.sin(2.25), 12);
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

describe('Proprietà aggiuntive dei punti', () => {
    it('legge le proprietà dichiarate dall\'ospite e rifiuta le altre', () => {
        const pts = { A: { x: 1, y: 2, speed: 3 } };
        const c = new ExpressionCompiler({ getParams: () => ({}), getPoints: () => pts, pointNames: ['A'], pointProps: ['speed', 'mag'] });
        expect(c.eval('2*A.speed + A.x')).toBe(7);
        // Declared but missing on this point: NaN, not an error
        expect(c.eval('A.mag')).toBeNaN();
        expect(() => c.fn('A.spede', [])).toThrow(/Unknown property/);
    });
});

describe('ExpressionParser: riscrittura di un\'espressione', () => {
    const SRC = [
        'x', '3x^2 + 2x - 5', 'ax^2 + bx + c', '-x^2', '2^-x', '2^x^2', '1/2x', 'x/(1+x^2)', 'sin 2x', 'sinxcosx', '2sinx^2',
        'e^x', 'E^-x^2', 'pi x', 'tau/4 + x', '|x||x - 1|', '||x| - 1|', 'x < 0 ? -x : x^2', '0 < x < 1 ? 1 : 0',
        'x < 0 || x > 1 ? 1 : 0', '!(x > 0) ? 2 : 3', 'x mod 2', 'xmod2 + 1', 'log(x, 2)', 'max(x, 1, -x)', 'floor(x)/2',
        '30° + x', '(x+1)!', 'ax!', 'sqrt(x^2 + 1) - x', 'e^ax', 'x == 1 ? 5 : x != 2 ? 6 : 7', 'inf > x ? 1 : 0', '1e-3x + 2.5e2',
    ];
    const params = { a: 1.5, b: -2, c: 0.25 };
    const XS = [-2.5, -1, -0.3, 0, 0.4, 1, 1.7, 3];
    const same = (u, v) => (Number.isNaN(u) && Number.isNaN(v)) || u === v || Math.abs(u - v) <= 1e-12 * Math.max(1, Math.abs(u));

    it('stampata e riletta dà la stessa funzione', () => {
        const opts = { vars: ['x'], params: Object.keys(params) };
        for (const src of SRC) {
            const printed = printExpression(parseExpression(src, opts));
            const f = compileExpression(src, opts), g = compileExpression(printed, opts);
            XS.forEach(x => expect(same(f(params, {}, x), g(params, {}, x)), `${src} -> ${printed} at ${x}`).toBe(true));
        }
    });

    it('sostituisce una variabile come composizione', () => {
        const opts = { vars: ['x'], params: Object.keys(params) };
        for (const src of SRC) {
            const by = 'x^2 - 1';
            const composed = compileExpression(substituteVariable(src, 'x', by, { params: Object.keys(params) }), opts);
            const f = compileExpression(src, opts), inner = compileExpression(by, opts);
            XS.forEach(x => expect(same(composed(params, {}, x), f(params, {}, inner(params, {}, x))), `${src} at ${x}`).toBe(true));
        }
    });
});

describe('Variable names from configs cannot inject code', () => {
    const attacks = ['{a=globalThis.__pwn=1}', '[a=globalThis.__pwn=1]', 'a=globalThis.__pwn=1', 't){globalThis.__pwn=1}//', '...a', ''];
    it.each(attacks)('rejects %j', (name) => {
        globalThis.__pwn = 0;
        expect(() => compileExpression('1', { vars: [name] })).toThrow(/Invalid variable name/);
        expect(globalThis.__pwn).toBe(0);
    });
    it('rejects them through ExpressionCompiler (a curve "param") too', () => {
        globalThis.__pwn = 0;
        expect(() => compiler().fn('1', ['{b=globalThis.__pwn=2}'])).toThrow(/Invalid variable name/);
        expect(globalThis.__pwn).toBe(0);
    });
    it('still accepts ordinary names', () => {
        for (const v of ['x', 't', 'theta', 'θ', 'u_1', 'T2']) {
            expect(compileExpression(`2*${v}`, { vars: [v] })({}, {}, 3)).toBe(6);
        }
    });
});
