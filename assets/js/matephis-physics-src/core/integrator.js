/**
 * Fixed-step RK4 integrator with events, for "state" + "ode" scenes.
 *
 * Pure: the caller provides the derivatives and the event conditions as
 * functions of (state array, t), so it is testable without a scene. Every
 * step is stored, plus the exact instants of events, so the trajectory can be
 * replayed and scrubbed without integrating again.
 *
 * An event fires when its condition goes from false to true during a step:
 * the crossing time is found by bisection, the state is taken just before
 * the crossing, then `apply` changes it (a bounce) or `stop` ends the run.
 */

/** One RK4 step of size h from (y, t). */
export function rk4Step(f, y, t, h) {
    const n = y.length;
    const add = (a, b, k) => { const out = new Array(n); for (let i = 0; i < n; i++) out[i] = a[i] + k * b[i]; return out; };
    const k1 = f(y, t);
    const k2 = f(add(y, k1, h / 2), t + h / 2);
    const k3 = f(add(y, k2, h / 2), t + h / 2);
    const k4 = f(add(y, k3, h), t + h);
    const out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    return out;
}

/**
 * Integrates from t = 0 to tMax.
 * @param {object} o
 * @param {number[]} o.y0 - initial state
 * @param {(y: number[], t: number) => number[]} o.f - derivatives
 * @param {number} o.dt - step
 * @param {number} o.tMax
 * @param {{when: (y, t) => boolean, apply?: (y, t) => number[], stop?: boolean, once?: boolean, label?: string}[]} [o.events]
 * @param {(y, t) => boolean} [o.stopWhen]
 * @param {number} [o.maxEvents=2000] - guards against endless bounces in finite time
 * @returns {{times: number[], states: number[][], events: {t: number, label?: string}[], tEnd: number, stopped: string|null}}
 */
export function integrate({ y0, f, dt, tMax, events = [], stopWhen = null, maxEvents = 2000 }) {
    const times = [0], states = [y0.slice()], fired = [];
    const done = new Set();
    const conds = events.map((e, i) => ({ ...e, i }));
    if (stopWhen) conds.push({ when: stopWhen, stop: true, i: -1, label: 'stop' });
    let y = y0.slice(), t = 0, stopped = null;
    // Conditions true at the start do not fire until they become false again
    let prev = conds.map(c => !!c.when(y, t));

    while (t < tMax - 1e-12) {
        const h = Math.min(dt, tMax - t);
        let yn = rk4Step(f, y, t, h);
        if (!yn.every(Number.isFinite)) { stopped = 'not finite'; break; }
        const now = conds.map(c => !!c.when(yn, t + h));
        // The first condition that turns true in this step, at the earliest time
        let first = null;
        conds.forEach((c, k) => {
            if (prev[k] || !now[k] || (c.once && done.has(c.i))) return;
            let lo = 0, hi = h;
            for (let it = 0; it < 50 && hi - lo > 1e-12 * Math.max(1, t); it++) {
                const mid = (lo + hi) / 2;
                if (c.when(rk4Step(f, y, t, mid), t + mid)) hi = mid; else lo = mid;
            }
            if (!first || lo < first.tau) first = { c, k, tau: lo };
        });
        if (!first) {
            y = yn; t += h; prev = now;
            times.push(t); states.push(y);
            continue;
        }
        // Advance to just before the crossing
        const { c, tau } = first;
        if (tau > 0) { y = rk4Step(f, y, t, tau); t += tau; }
        times.push(t); states.push(y.slice());
        fired.push({ t, label: c.label });
        if (c.once) done.add(c.i);
        if (c.stop) { stopped = c.label || 'stop'; break; }
        if (fired.length > maxEvents) { stopped = 'too many events'; break; }
        if (c.apply) y = c.apply(y, t);
        times.push(t); states.push(y.slice());
        prev = conds.map(cc => !!cc.when(y, t));
    }
    return { times, states, events: fired, tEnd: t, stopped, f };
}

/** Index of the last sample at or before t (binary search). */
export function sampleIndex(times, t) {
    let lo = 0, hi = times.length - 1;
    if (t <= times[0]) return 0;
    if (t >= times[hi]) return hi;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (times[mid] <= t) lo = mid; else hi = mid;
    }
    return lo;
}

/**
 * State at time t: one RK4 sub-step from the last stored sample before t, so
 * values between samples are as accurate as the integration itself (a linear
 * interpolation would be off by up to a·dt²/8). The jump of an event is kept,
 * since both sides of it are stored.
 */
export function stateAt(run, t) {
    const { times, states } = run;
    let i = sampleIndex(times, t);
    // At an event instant both sides are stored: take the later one
    while (i < times.length - 1 && times[i + 1] <= t) i++;
    const dt = t - times[i];
    if (i >= times.length - 1 || dt <= 0 || !run.f) return states[i].slice();
    return rk4Step(run.f, states[i], times[i], dt);
}
