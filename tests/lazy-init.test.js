import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createScheduler, slidersHeight } from '../assets/js/matephis-plot-src/core/lazy-init.js';

/** Fake page: elements in document order, an IntersectionObserver driven by the test. */
function fakePage({ hash = '' } = {}) {
    const observers = [];
    globalThis.IntersectionObserver = class {
        constructor(cb, opts) { this.cb = cb; this.opts = opts; this.targets = new Set(); observers.push(this); }
        observe(el) { this.targets.add(el); }
        unobserve(el) { this.targets.delete(el); }
    };
    const ids = {};
    globalThis.document = { getElementById: (id) => ids[id] || null };
    globalThis.window = {
        location: { hash },
        innerHeight: 800,
        addEventListener: () => {},
        scrollBy: () => {},
    };
    let order = 0;
    const el = (top, id) => {
        const e = { order: order++, top, children: [] };
        e.compareDocumentPosition = (o) => (o.order > e.order ? 4 : 2);
        e.contains = (o) => o === e || e.children.includes(o);
        e.getBoundingClientRect = () => ({ top: e.top, bottom: e.top + 100, height: 100 });
        if (id) ids[id] = e;
        return e;
    };
    /** The observer reports these elements as near the screen. */
    const show = (...els) => {
        observers.forEach(o => o.cb(els.filter(e => o.targets.has(e)).map(e => ({
            target: e, isIntersecting: true, boundingClientRect: e.getBoundingClientRect(),
        }))));
    };
    return { el, show, observers };
}

const settle = () => new Promise(r => setTimeout(r, 20));

describe('Costruzione pigra dei blocchi (lazy-init.js)', () => {
    const prev = { window: globalThis.window, document: globalThis.document, IO: globalThis.IntersectionObserver };
    let page, log;
    const job = (s, e, extra = {}) => s.add({
        el: e,
        measure: () => { log.push(`measure ${e.order}`); return 300 + e.order; },
        build: (w) => log.push(`build ${e.order} ${w}`),
        ...extra,
    });

    beforeEach(() => { page = fakePage(); log = []; });
    afterEach(() => {
        globalThis.window = prev.window;
        globalThis.document = prev.document;
        globalThis.IntersectionObserver = prev.IO;
    });

    /** Build log without the measures. */
    const builds = () => log.filter(l => l.startsWith('build'));
    const until = async (cond, ms = 2000) => { const t = Date.now(); while (!cond() && Date.now() - t < ms) await settle(); };

    it('prima del primo sguardo dell’observer non si costruisce niente; poi lo schermo, poi il resto dall’alto', async () => {
        const s = createScheduler();
        const a = page.el(-500), on = page.el(100), b = page.el(5000), c = page.el(9000);
        [a, on, b, c].forEach(e => job(s, e));
        await settle();
        expect(log).toEqual([]);
        expect(page.observers[0].opts.rootMargin).toBe('150% 0px 150% 0px');
        page.show(on);
        await until(() => s.size === 0);
        expect(builds()).toEqual(['build 1 301', 'build 0 300', 'build 2 302', 'build 3 303']);
    });

    it('in un lotto le larghezze si leggono tutte prima di costruire', async () => {
        const s = createScheduler();
        const on1 = page.el(100), on2 = page.el(400);
        [on1, on2].forEach(e => job(s, e));
        page.show(on1, on2);
        await until(() => s.size === 0);
        expect(log).toEqual(['measure 0', 'measure 1', 'build 0 300', 'build 1 301']);
    });

    it('i lotti si fermano dopo ~40 ms di lavoro: i blocchi lenti vanno in lotti diversi', async () => {
        const s = createScheduler();
        const els = [0, 1, 2, 3, 4].map(i => page.el(100 + i));
        const busy = (ms) => { const t = Date.now(); while (Date.now() - t < ms) { /* work */ } };
        els.forEach(e => s.add({
            el: e,
            measure: () => { log.push('measure'); return 300; },
            build: () => { log.push('build'); busy(25); },
        }));
        page.show(...els);
        await until(() => s.size === 0);
        // A new batch starts with its reads: at most 2 builds of 25 ms between two of them
        const runs = log.join(' ').split(/(?:measure ?)+/).filter(Boolean).map(r => r.trim().split(' ').length);
        expect(runs.reduce((x, y) => x + y, 0)).toBe(5);
        expect(Math.max(...runs)).toBeLessThanOrEqual(2);
    });

    it('i blocchi di un gruppo ("sync") si costruiscono insieme, in ordine', async () => {
        const s = createScheduler();
        const a = page.el(-3000), other = page.el(-2000), b = page.el(100), c = page.el(9000);
        job(s, a, { group: 'sets:g' });
        job(s, other);
        job(s, b, { group: 'sets:g' });
        job(s, c, { group: 'sets:g' });
        page.show(b);
        await until(() => s.size === 0);
        expect(builds()).toEqual(['build 0 300', 'build 2 302', 'build 3 303', 'build 1 301']);
    });

    it('flush(): tutto subito (stampa, init() esplicito), flush(root): solo dentro root', () => {
        const s = createScheduler();
        const a = page.el(0), b = page.el(9000), c = page.el(20000);
        const root = page.el(0);
        root.children.push(b);
        [a, b, c].forEach(e => job(s, e));
        s.flush(root);
        expect(log).toEqual(['measure 1', 'build 1 301']);
        s.flush();
        expect(log.slice(2)).toEqual(['measure 0', 'measure 2', 'build 0 300', 'build 2 302']);
        expect(s.size).toBe(0);
    });

    it('il blocco a cui punta l’URL (#id) si costruisce subito, prima del primo sguardo', async () => {
        page = fakePage({ hash: '#es-12' });
        const s = createScheduler();
        const first = page.el(0), target = page.el(30000, 'es-12');
        job(s, first);
        job(s, target);
        await settle();
        expect(log).toEqual(['measure 1', 'build 1 301']);
    });

    it('un blocco che non si costruisce non ferma gli altri', async () => {
        const s = createScheduler();
        const a = page.el(0), b = page.el(10);
        const err = console.error;
        console.error = () => {};
        s.add({ el: a, build: () => { throw new Error('x'); } });
        job(s, b);
        page.show(a, b);
        await until(() => s.size === 0);
        console.error = err;
        expect(builds()).toEqual(['build 1 301']);
    });

    it('altezza degli slider nel segnaposto', () => {
        expect(slidersHeight({})).toBe(0);
        expect(slidersHeight({ params: { a: {}, b: {} } })).toBe(85);
        expect(slidersHeight({ params: { a: {} }, showSliders: false })).toBe(0);
    });
});
