import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { toTeX, renderMathJaxLabel } from '../assets/js/matephis-plot-src/renderers/mathjax-bridge.js';

describe('Etichette con testo e formule', () => {
    it('toTeX: il testo va in \\text{}, le formule restano TeX', () => {
        expect(toTeX('asse fisso $x = 2$')).toBe('\\text{asse fisso }x = 2');
        expect(toTeX('$x$ e $y$')).toBe('x\\text{ e }y');
        expect(toTeX('grafico di $g$, pari')).toBe('\\text{grafico di }g\\text{, pari}');
        expect(toTeX('50% & {a}')).toBe('50% & {a}'); // senza "$" resta com'è (TeX nudo)
        expect(toTeX('50% di $x$')).toBe('\\text{50\\% di }x');
    });

    describe('renderMathJaxLabel passa a MathJax il TeX giusto', () => {
        const prev = globalThis.window;
        afterEach(() => { globalThis.window = prev; });

        const texOf = (label) => {
            const calls = [];
            globalThis.window = { MathJax: { tex2svg: (tex) => { calls.push(tex); return { querySelector: () => null }; } } };
            renderMathJaxLabel(label, 0, 0, 14, '#000', 'start', 'auto', null, () => null);
            return calls[0];
        };

        it('formula intera', () => {
            expect(texOf('$x = 2$')).toBe('x = 2');
            expect(texOf('$$\\frac{1}{2}$$')).toBe('\\frac{1}{2}');
        });
        it('testo e formula insieme', () => {
            expect(texOf('asse fisso $x = 2$')).toBe('\\text{asse fisso }x = 2');
            expect(texOf('$t$ (s)')).toBe('t\\text{ (s)}');
            expect(texOf('$a$ + $b$')).toBe('a\\text{ + }b');
        });
        it('TeX senza "$" (motori sets/physics) resta com\'è', () => {
            expect(texOf('\\text{A}\\cup B')).toBe('\\text{A}\\cup B');
        });
    });
});

describe('Blocchi matephis nelle note', () => {
    const dir = join(__dirname, '../_notes/Public');
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));

    it.each(files)('%s: ogni blocco ```matephis è JSON valido', (file) => {
        const text = readFileSync(join(dir, file), 'utf8');
        const blocks = [...text.matchAll(/^```matephis[^\n]*\n([\s\S]*?)^```/gm)].map(m => m[1]);
        blocks.forEach((src, k) => {
            expect(() => JSON.parse(src), `${file}, blocco ${k + 1}`).not.toThrow();
        });
    });
});
