import { describe, it, expect } from 'vitest';
import { integrate, stateAt, sampleIndex } from '../assets/js/matephis-physics-src/core/integrator.js';

const g = 9.81;

describe('Integratore RK4', () => {
    it('conserva l\'energia dell\'oscillatore armonico per 100 periodi', () => {
        // x'' = -x, period 2π
        const run = integrate({ y0: [1, 0], f: ([x, v]) => [v, -x], dt: 1 / 240, tMax: 200 * Math.PI });
        const E = ([x, v]) => (x * x + v * v) / 2;
        expect(Math.abs(E(run.states.at(-1)) - 0.5) / 0.5).toBeLessThan(1e-6);
        // After whole periods it is back at the start
        const y = stateAt(run, 200 * Math.PI);
        expect(y[0]).toBeCloseTo(1, 5);
    });

    it('integra esattamente il moto uniformemente accelerato', () => {
        const run = integrate({ y0: [10, 0], f: ([, v]) => [v, -g], dt: 0.01, tMax: 1 });
        expect(stateAt(run, 1)[0]).toBeCloseTo(10 - g / 2, 10);
        expect(stateAt(run, 0.5)[0]).toBeCloseTo(10 - g / 8, 6);
    });

    it('trova l\'istante dell\'urto e fa rimbalzare la pallina', () => {
        const h = 2, e = 1;
        const run = integrate({
            y0: [h, 0], f: ([, v]) => [v, -g], dt: 1 / 240, tMax: 3,
            events: [{ when: ([y]) => y < 0, apply: ([y, v]) => [Math.max(0, y), -e * v], label: 'urto' }],
        });
        const t1 = Math.sqrt(2 * h / g);
        expect(run.events[0].t).toBeCloseTo(t1, 9);
        // Elastic: back to the same height after another t1
        expect(stateAt(run, 2 * t1)[0]).toBeCloseTo(h, 6);
        expect(run.events).toHaveLength(2);
    });

    it('si ferma con stopWhen', () => {
        const v0 = 10, a = Math.PI / 4;
        const run = integrate({
            y0: [0, 0, v0 * Math.cos(a), v0 * Math.sin(a)],
            f: ([, , vx, vy]) => [vx, vy, 0, -g], dt: 1 / 240, tMax: 10,
            stopWhen: ([, y, , vy]) => y < 0 && vy < 0,
        });
        expect(run.tEnd).toBeCloseTo(2 * v0 * Math.sin(a) / g, 9);
        expect(run.stopped).toBe('stop');
    });

    it('scatta una volta sola con once', () => {
        const run = integrate({
            y0: [0], f: () => [1], dt: 0.01, tMax: 3,
            events: [{ when: ([x]) => Math.sin(Math.PI * x) < 0, once: true, label: 'a' }],
        });
        expect(run.events).toHaveLength(1);
        expect(run.events[0].t).toBeCloseTo(1, 9);
    });

    it('non si blocca con infiniti rimbalzi in un tempo finito', () => {
        const run = integrate({
            y0: [1, 0], f: ([, v]) => [v, -g], dt: 1 / 240, tMax: 10, maxEvents: 200,
            events: [{ when: ([y]) => y < 0, apply: ([y, v]) => [Math.max(0, y), -0.5 * v] }],
        });
        expect(['too many events', null]).toContain(run.stopped);
        expect(run.events.length).toBeLessThanOrEqual(201);
    });

    it('trova il campione giusto per un istante', () => {
        expect(sampleIndex([0, 1, 2, 3], 1.5)).toBe(1);
        expect(sampleIndex([0, 1, 2, 3], -1)).toBe(0);
        expect(sampleIndex([0, 1, 2, 3], 9)).toBe(3);
    });
});
