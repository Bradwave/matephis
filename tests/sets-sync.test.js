import { describe, it, expect, beforeEach } from 'vitest';
import { SyncGroup } from '../assets/js/matephis-sets-src/core/sync.js';

/** A stand-in for a scene: params, setParam, orbits, interaction. */
function fake(params, { orbitMaps = null, k = 0 } = {}) {
    const defs = {};
    Object.keys(params).forEach(key => { defs[key] = { min: -10, max: 10 }; });
    const s = {
        config: { params: defs },
        params: { ...params },
        draws: 0,
        focused: [],
        setParam(key, v) { this.params[key] = v; this.draws++; },
        interaction: { focus(key, o) { s.focused.push([key, o && o.remote]); } },
    };
    if (orbitMaps) {
        s.orbits = {
            k, mapIds: orbitMaps,
            setStep(v, o) { this.k = v; this.broadcast = o && o.broadcast; },
        };
    }
    return s;
}

describe('Blocchi collegati ("sync")', () => {
    beforeEach(() => SyncGroup.reset());

    it('un blocco che entra prende i valori del gruppo', () => {
        const a = fake({ p: 1, q: 2 });
        SyncGroup.join('g', a);
        const b = fake({ p: 5, r: 3 });
        SyncGroup.join('g', b);
        expect(b.params).toEqual({ p: 1, r: 3 });
    });

    it('un parametro cambiato passa agli altri blocchi che lo hanno', () => {
        const a = fake({ p: 1 }), b = fake({ p: 1 }), c = fake({ q: 0 });
        const g = SyncGroup.join('g', a);
        SyncGroup.join('g', b);
        SyncGroup.join('g', c);
        a.params.p = 1.5;
        g.publish(a);
        expect(b.params.p).toBe(1.5);
        expect(c.params).toEqual({ q: 0 });
        // b redraws and publishes: nothing goes back to a
        a.draws = 0;
        g.publish(b);
        expect(a.draws).toBe(0);
    });

    it('gruppi diversi non si toccano', () => {
        const a = fake({ p: 1 }), b = fake({ p: 1 });
        const g = SyncGroup.join('g', a);
        SyncGroup.join('h', b);
        a.params.p = 2;
        g.publish(a);
        expect(b.params.p).toBe(1);
    });

    it('evidenziazione e passi delle orbite', () => {
        const a = fake({}, { orbitMaps: ['f'] }), b = fake({}, { orbitMaps: ['f'] }), c = fake({}, { orbitMaps: ['g'] });
        const g = SyncGroup.join('g', a);
        SyncGroup.join('g', b);
        SyncGroup.join('g', c);
        g.focus(a, 'A|1');
        expect(b.focused).toEqual([['A|1', true]]);
        expect(a.focused).toEqual([]);
        g.step(a, ['f'], 3);
        expect(b.orbits.k).toBe(3);
        expect(b.orbits.broadcast).toBe(false);
        expect(c.orbits.k).toBe(0);
    });

    it('chi lascia il gruppo non riceve più nulla', () => {
        const a = fake({ p: 1 }), b = fake({ p: 1 });
        const g = SyncGroup.join('g', a);
        SyncGroup.join('g', b);
        g.leave(b);
        a.params.p = 4;
        g.publish(a);
        expect(b.params.p).toBe(1);
    });
});
