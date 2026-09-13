import { describe, it, expect } from 'vitest';
import { CoordinateSystem } from '../assets/js/matephis-plot-src/core/coordinate-system.js';

describe('CoordinateSystem', () => {
    it('mappa linearmente le coordinate matematiche in pixel SVG', () => {
        const cs = new CoordinateSystem({
            width: 600,
            height: 600,
            padL: 0,
            padR: 0,
            padT: 0,
            padB: 0,
            xlim: [-10, 10],
            ylim: [-10, 10]
        });

        expect(cs.mapX(0)).toBe(300);
        expect(cs.mapX(-10)).toBe(0);
        expect(cs.mapX(10)).toBe(600);

        // Invertito sull'asse Y (pixel in alto è 0)
        expect(cs.mapY(0)).toBe(300);
        expect(cs.mapY(10)).toBe(0);
        expect(cs.mapY(-10)).toBe(600);
    });

    it('inverte correttamente i pixel in coordinate matematiche (unmap)', () => {
        const cs = new CoordinateSystem({
            width: 600,
            height: 600,
            padL: 0,
            padR: 0,
            padT: 0,
            padB: 0,
            xlim: [-10, 10],
            ylim: [-10, 10]
        });

        expect(cs.unmapX(300)).toBeCloseTo(0, 5);
        expect(cs.unmapY(300)).toBeCloseTo(0, 5);
    });
});
