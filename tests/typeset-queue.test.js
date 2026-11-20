import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { typesetElements, outermost, TexNodes } from '../assets/js/matephis-plot-src/renderers/mathjax-bridge.js';

/** A fake element: contains() follows `parent` links. */
function el(name, parent = null) {
    const e = { name, parent };
    e.contains = (other) => {
        for (let p = other; p; p = p.parent) if (p === e) return true;
        return false;
    };
    return e;
}

describe('Coda dei typeset dei motori (una chiamata a MathJax per frame)', () => {
    const prevWindow = globalThis.window, prevDocument = globalThis.document;
    let calls;

    beforeEach(() => {
        calls = [];
        globalThis.document = { getElementById: () => null };
        globalThis.window = {
            MathJax: {
                tex2svg: () => ({}),
                typesetPromise: (els) => {
                    calls.push(els.map(e => e.name));
                    return els.some(e => e.name === 'bad') ? Promise.reject(new Error('TeX')) : Promise.resolve();
                },
            },
        };
    });
    afterEach(() => {
        globalThis.window = prevWindow;
        globalThis.document = prevDocument;
    });

    it('le richieste dello stesso momento vanno in una sola chiamata', async () => {
        const a = el('a'), b = el('b'), c = el('c');
        const done = await Promise.all([typesetElements([a]), typesetElements([b, c])]);
        expect(done).toEqual([true, true]);
        expect(calls).toEqual([['a', 'b', 'c']]);
    });

    it('un elemento dentro un altro della coda non è passato due volte', async () => {
        const box = el('box'), inner = el('inner', box);
        await Promise.all([typesetElements([inner]), typesetElements([box]), typesetElements([box])]);
        expect(calls).toEqual([['box']]);
    });

    it('una formula sbagliata non blocca le altre richieste', async () => {
        const done = await Promise.all([typesetElements([el('a')]), typesetElements([el('bad')]), typesetElements([el('c')])]);
        expect(done).toEqual([true, false, true]);
        expect(calls).toEqual([['a', 'bad', 'c'], ['a'], ['bad'], ['c']]);
    });

    it('aspetta il typeset della pagina (startup.promise) e ne prende il posto', async () => {
        let release;
        const order = [];
        window.MathJax.startup = { promise: new Promise(r => { release = r; }).then(() => order.push('page')) };
        const p = typesetElements([el('a')]).then(() => order.push('engines'));
        await new Promise(r => setTimeout(r, 150));
        expect(calls).toEqual([]);
        release();
        await p;
        expect(order).toEqual(['page', 'engines']);
        // Later typesets of the page wait for this one
        await window.MathJax.startup.promise;
    });

    it('senza MathJax: false, e niente da fare', async () => {
        window.MathJax = {};
        expect(await typesetElements([el('a')])).toBe(false);
        expect(await typesetElements([])).toBe(false);
    });

    it('outermost: tiene solo gli elementi più esterni, una volta', () => {
        const a = el('a'), b = el('b', a), c = el('c');
        expect(outermost([b, a, c, a]).map(e => e.name)).toEqual(['a', 'c']);
    });
});

describe('TexNodes: formule HTML ridisegnate (letture, nomi delle mappe)', () => {
    const prevWindow = globalThis.window;
    let made;
    beforeEach(() => {
        made = [];
        globalThis.window = { MathJax: { tex2svg: (tex) => { const n = { tex }; made.push(tex); return n; } } };
    });
    afterEach(() => { globalThis.window = prevWindow; });

    it('una formula uguale al disegno prima è lo stesso nodo, senza chiamare MathJax', () => {
        const pool = new TexNodes();
        const x1 = pool.get('x = 1');
        const y1 = pool.get('y = 2');
        pool.done();
        expect(pool.get('x = 1')).toBe(x1);
        const y2 = pool.get('y = 3');
        pool.done();
        expect(y2).not.toBe(y1);
        expect(made).toEqual(['x = 1', 'y = 2', 'y = 3']);
        // Not used in the last draw: made again
        pool.get('y = 2');
        expect(made).toEqual(['x = 1', 'y = 2', 'y = 3', 'y = 2']);
    });

    it('la stessa formula due volte nello stesso disegno: due nodi', () => {
        const pool = new TexNodes();
        const a = pool.get('t'), b = pool.get('t');
        expect(a).not.toBe(b);
        pool.done();
        const again = [pool.get('t'), pool.get('t')];
        expect(again).toContain(a);
        expect(again).toContain(b);
        expect(made.length).toBe(2);
    });

    it('modo display e inline sono formule diverse', () => {
        const pool = new TexNodes();
        pool.get('x');
        pool.done();
        pool.get('x', true);
        expect(made).toEqual(['x', 'x']);
    });

    it('senza MathJax o con un errore: null', () => {
        const pool = new TexNodes();
        window.MathJax.tex2svg = () => { throw new Error('TeX'); };
        expect(pool.get('\\bad')).toBe(null);
        window.MathJax = {};
        expect(pool.get('x')).toBe(null);
    });
});
