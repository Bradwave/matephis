import { describe, it, expect } from 'vitest';
import { keepHeight, measureReadouts } from '../assets/js/matephis-sets-src/render/arrows.js';

/** A fake readout line of a given height. */
function line(h, connected = true) {
    let reads = 0;
    return {
        isConnected: connected,
        style: {},
        getBoundingClientRect() { reads++; return { height: h }; },
        get reads() { return reads; },
    };
}

describe('Letture sotto i diagrammi: altezze lette tutte insieme', () => {
    it('ogni riga tiene l’altezza massima avuta, e le righe tolte non si leggono', () => {
        const scene = { readoutHeights: [] };
        const old = line(40, false);
        const a = line(27), b = line(55);
        keepHeight(scene, 0, old);
        keepHeight(scene, 0, a);
        keepHeight(scene, 1, b);
        // Nothing is read while drawing
        expect(a.reads + b.reads).toBe(0);
        measureReadouts();
        expect(old.reads).toBe(0);
        expect(scene.readoutHeights).toEqual([27, 55]);
        expect(a.style.minHeight).toBe('27px');
        expect(b.style.minHeight).toBe('55px');

        // A shorter formula later keeps the taller height
        const c = line(20);
        keepHeight(scene, 1, c);
        measureReadouts();
        expect(scene.readoutHeights).toEqual([27, 55]);
        expect(c.style.minHeight).toBe('55px');
    });

    it('diagrammi diversi tengono le loro altezze', () => {
        const s1 = { readoutHeights: [] }, s2 = { readoutHeights: [30] };
        keepHeight(s1, 0, line(10));
        keepHeight(s2, 0, line(12));
        measureReadouts();
        expect(s1.readoutHeights).toEqual([10]);
        expect(s2.readoutHeights).toEqual([30]);
    });
});
