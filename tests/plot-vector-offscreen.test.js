import { describe, it, expect } from 'vitest';
import { DataMixin } from '../assets/js/matephis-plot-src/renderers/data-renderer.js';

/** Safari drops a whole clip-path when a clipped child's box is huge: vectors parked
 *  at 1e9 (the sets engine's "unused slot") must not reach the SVG at all. */
describe('_drawVector: far off the view', () => {
    const cs = { mapX: (x) => 20 + x * 60, mapY: (y) => 250 - y * 60 };
    const draw = (ends) => {
        const added = [];
        const ctx = { _vectorEnds: () => ends, dataGroup: { appendChild: (n) => added.push(n) } };
        const st = { item: {}, idx: 0, cs, color: 'red' };
        return { out: DataMixin._drawVector.call(ctx, st), added };
    };
    it('draws nothing for a vector at 1e9', () => {
        const { out, added } = draw({ fx: 1e9, fy: 0, tx: 1e9, ty: 1e9 });
        expect(out).toBeNull();
        expect(added).toHaveLength(0);
    });
    it('draws nothing for non-finite ends', () => {
        expect(draw({ fx: 0, fy: 0, tx: NaN, ty: 1 }).out).toBeNull();
        expect(draw({ fx: 0, fy: 0, tx: Infinity, ty: 1 }).out).toBeNull();
    });
});
