/**
 * Building the blocks of a page in the background, shared by the three engines.
 *
 * On page load the engines do not build every block at once (a heavy page
 * would freeze the phone for seconds). Each block gets a placeholder of about
 * its final size right away. Once MathJax has typeset the page:
 *   - the blocks on screen (and the one a link points to) are built first;
 *   - then all the others, top to bottom, in idle time (requestIdleCallback),
 *     so the page is complete after a few seconds without any scrolling;
 *   - a block that comes within about 1.5 screens while the reader scrolls
 *     moves to the front of that queue (IntersectionObserver).
 * Work is done in batches of about BUDGET ms, with a yield in between. In a
 * batch the widths of the blocks are read first, in one layout, then the
 * blocks are built and drawn without reading the layout again.
 *
 * The three bundles are separate scripts, so the scheduler lives on window
 * and the first bundle to load creates it:
 *
 *   window.MatephisLazy.flush()        builds every block still waiting, now
 *   window.MatephisLazy.flush(root)    only the ones inside root
 *   window.MATEPHIS_EAGER = true       (before the scripts) no lazy building
 *
 * Blocks of the same group (sets blocks with the same "sync") are built
 * together, in document order, so they start from the same values as when
 * every block was built at load.
 */
import { whenMathJaxReady } from '../renderers/mathjax-bridge.js';

const VERSION = 1;
/** Blocks this far above and below the screen go to the front of the queue (1.5 screens). */
const MARGIN = '150% 0px 150% 0px';
/** Work in one batch before yielding to the browser (ms): a long task is 50 ms. */
const BUDGET = 40;
/** Blocks whose widths are read together at the start of a batch. */
const AHEAD = 8;
/** Idle time is asked for with this timeout (ms), so a busy page still gets built. */
const IDLE_TIMEOUT = 1000;
/** The page counts as being scrolled until this long after the last scroll event (ms). */
const SCROLL_QUIET = 300;

/** Should the auto-init of the page build lazily? */
export function lazyEnabled() {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
        && !window.MATEPHIS_EAGER && typeof IntersectionObserver === 'function';
}

/** The page's scheduler (created by the first bundle that asks). */
export function lazyScheduler() {
    const KEY = `__matephisLazy${VERSION}`;
    if (!window[KEY]) {
        window[KEY] = createScheduler();
        if (!window.MatephisLazy) window.MatephisLazy = window[KEY];
    }
    return window[KEY];
}

/** Yields to the browser: scheduler.yield() where there is one, else a task. */
function yieldToBrowser() {
    const sch = typeof window !== 'undefined' && window.scheduler;
    if (sch && typeof sch.yield === 'function') return sch.yield();
    return new Promise(resolve => setTimeout(resolve, 0));
}

/** Does the browser keep the page still when content above the screen changes size? */
function nativeAnchoring() {
    try {
        return !!(window.CSS && CSS.supports && CSS.supports('overflow-anchor', 'auto'));
    } catch (e) {
        return false;
    }
}

/** Waits for idle time: requestIdleCallback where there is one (not Safari), else a short timer. */
function idle() {
    return new Promise(resolve => {
        if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(resolve, { timeout: IDLE_TIMEOUT });
        } else {
            setTimeout(() => resolve({ didTimeout: true, timeRemaining: () => BUDGET }), 30);
        }
    });
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function byDocumentOrder(a, b) {
    if (a === b) return 0;
    // eslint-disable-next-line no-bitwise
    return a.el.compareDocumentPosition(b.el) & 4 /* FOLLOWING */ ? -1 : 1;
}

/**
 * @typedef {object} LazyJob
 * @property {HTMLElement} el - the placeholder, in the page where the block goes
 * @property {() => number} [measure] - reads the width the block will have (layout read only)
 * @property {(width: number) => void} build - builds the block (no layout reads needed)
 * @property {string} [group] - jobs of a group are built together
 */
export function createScheduler() {
    const pending = new Set();
    let io = null;

    const hashTarget = () => {
        try {
            const id = decodeURIComponent((window.location.hash || '').slice(1));
            return id ? document.getElementById(id) : null;
        } catch (e) {
            return null;
        }
    };

    /**
     * The element a link points to (#id) stays where the browser put it while
     * blocks are built around it, until the reader scrolls or types: the
     * browser scrolls to it once (on load, or smoothly after a click on a
     * link of the page), before the blocks around it have their final height.
     */
    let held = null;
    let smooth = false;
    function hold(fromLink) {
        const t = hashTarget();
        held = t && typeof t.scrollIntoView === 'function' ? t : null;
        smooth = fromLink;
    }
    function release() {
        held = null;
    }
    function realign() {
        if (!held || !held.isConnected) return;
        let margin = 0;
        try {
            margin = parseFloat(getComputedStyle(held).scrollMarginTop) || 0;
        } catch (e) { /* no styles: no margin */ }
        // After a link of the page: the page's own scroll behaviour (smooth), which
        // retargets the scroll under way; on load: at once, as the browser did
        if (Math.abs(held.getBoundingClientRect().top - margin) > 1) {
            held.scrollIntoView({ block: 'start', behavior: smooth ? 'auto' : 'instant' });
        }
    }

    function observer() {
        if (!io) {
            io = new IntersectionObserver(entries => {
                const h = window.innerHeight || document.documentElement.clientHeight;
                entries.forEach(e => {
                    if (!e.isIntersecting) return;
                    const r = e.boundingClientRect;
                    want(e.target.__matephisJob, r.bottom > 0 && r.top < h ? 0 : 1);
                });
                firstLook = true;
                run();
            }, { rootMargin: MARGIN });
        }
        return io;
    }

    /** Moves a job to the front of the queue; priority 0 (on screen) goes before 1 (near it). */
    function want(job, priority) {
        if (!job || !pending.has(job)) return;
        if (job.priority !== undefined && job.priority <= priority) return;
        job.priority = priority;
        if (job.group) pending.forEach(j => { if (j.group === job.group) want(j, priority); });
    }

    function take(job) {
        pending.delete(job);
        if (io) io.unobserve(job.el);
        delete job.el.__matephisJob;
    }

    /** Jobs in the order they are built: wanted ones (by priority), then the rest top to bottom. */
    function queue() {
        return [...pending].sort((a, b) => ((a.priority === undefined ? 9 : a.priority) - (b.priority === undefined ? 9 : b.priority))
            || byDocumentOrder(a, b));
    }

    /** The next units of work (a group is one unit): up to AHEAD jobs. */
    function nextUnits(urgentOnly) {
        const units = [];
        const seen = new Set();
        let count = 0;
        for (const j of queue()) {
            if (seen.has(j)) continue;
            if (urgentOnly && j.priority === undefined) break;
            const unit = j.group ? queue().filter(o => o.group === j.group) : [j];
            unit.forEach(o => seen.add(o));
            units.push(unit);
            count += unit.length;
            if (count >= AHEAD) break;
        }
        return units;
    }

    /** Average time to build one block (ms), to tell whether one more fits in a batch. */
    let cost = 15;

    /**
     * One batch: the widths of the next blocks read in one pass (one layout),
     * then blocks built while the time allows (at least one unit). Blocks not
     * reached stay in the queue.
     */
    function batch(units, limit) {
        const jobs = units.flat();
        const anchor = !nativeAnchoring();
        const before = new Map();
        jobs.forEach(j => {
            try {
                before.set(j, {
                    width: j.measure ? j.measure() : 0,
                    rect: anchor ? j.el.getBoundingClientRect() : null,
                });
            } catch (e) {
                before.set(j, { width: 0, rect: null });
            }
        });
        const start = now();
        const built = [];
        for (const unit of units) {
            if (built.length && now() - start + cost * unit.length > limit) break;
            unit.forEach(j => {
                take(j);
                const t = now();
                try {
                    j.build(before.get(j).width);
                } catch (e) {
                    console.error('Matephis: build failed', e);
                }
                cost = 0.7 * cost + 0.3 * (now() - t);
                built.push(j);
            });
        }
        // Without scroll anchoring (Safari): a block built above the screen would move what is read
        if (anchor) {
            let shift = 0;
            built.forEach(j => {
                const r = before.get(j).rect;
                if (r && r.height > 0 && r.bottom <= 0) shift += j.el.getBoundingClientRect().height - r.height;
            });
            if (Math.abs(shift) >= 1 && !held) window.scrollBy(0, shift);
        }
        realign();
        return built.length;
    }

    let running = false;
    let firstLook = false;
    let lastScroll = -Infinity;
    let mathReady = null;

    async function run() {
        if (running || !pending.size) return;
        running = true;
        try {
            if (!mathReady) mathReady = new Promise(resolve => whenMathJaxReady(resolve));
            await mathReady;
            while (pending.size) {
                // Blocks on screen or near it: now, with a yield after each batch
                const urgent = nextUnits(true);
                if (urgent.length) {
                    batch(urgent, BUDGET);
                    await yieldToBrowser();
                    continue;
                }
                // The first look of the observer tells what is on screen: wait for it
                if (!firstLook) break;
                // The rest: in idle time, as much as fits. While the reader scrolls, idle
                // time is short: wait (blocks near the screen still come first, above)
                const deadline = await idle();
                if (nextUnits(true).length) continue;
                const scrolling = now() - lastScroll < SCROLL_QUIET;
                const forced = deadline.didTimeout && !scrolling;
                const left = forced ? BUDGET : Math.min(BUDGET, deadline.timeRemaining());
                if (left < Math.min(cost, BUDGET) && !forced) {
                    if (scrolling) await new Promise(r => setTimeout(r, SCROLL_QUIET));
                    continue;
                }
                batch(nextUnits(false), Math.max(left, 1));
            }
        } finally {
            running = false;
        }
        if (pending.size && firstLook) run();
    }

    const s = {
        version: VERSION,

        /** Adds a job; it is built when its placeholder comes near the screen. */
        add(job) {
            pending.add(job);
            job.el.__matephisJob = job;
            const target = hashTarget();
            observer().observe(job.el);
            if (target && (job.el === target || job.el.contains(target))) {
                want(job, 0);
                run();
            }
            return job;
        },

        /** Builds now every job still waiting (inside root, if given), in document order. */
        flush(root) {
            const jobs = [...pending].filter(j => !root || root === j.el || (root.contains && root.contains(j.el)));
            // The rest of a group goes too
            const groups = new Set(jobs.map(j => j.group).filter(Boolean));
            pending.forEach(j => { if (j.group && groups.has(j.group) && !jobs.includes(j)) jobs.push(j); });
            jobs.sort(byDocumentOrder);
            if (jobs.length) batch(jobs.map(j => [j]), Infinity);
        },

        /** Jobs not built yet (for tests). */
        get size() {
            return pending.size;
        },
    };

    if (typeof window !== 'undefined' && window.addEventListener) {
        // Printing shows every block
        window.addEventListener('beforeprint', () => s.flush());
        window.addEventListener('scroll', () => { lastScroll = now(); }, { passive: true });
        // A click on a link of the page (mousedown) holds its target again on hashchange
        ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(e => window.addEventListener(e, release, { capture: true, passive: true }));
        window.addEventListener('hashchange', () => hold(true));
        hold(false);
    }
    return s;
}

/** Builds now the blocks still waiting inside root (an explicit init() call wants them built). */
export function flushPending(root) {
    if (typeof window === 'undefined') return;
    const s = window[`__matephisLazy${VERSION}`];
    if (s) s.flush(root && root !== document ? root : undefined);
}

/**
 * A placeholder of about the block's final size, until it is built: an empty
 * box with the block's own classes and layout (so its width is the block's),
 * and the height of the drawing (CSS aspect-ratio, so no layout read) plus
 * what goes under it (sliders, captions...).
 * @param {object} opts
 * @param {string} opts.className - the block's box classes
 * @param {(box: HTMLElement) => void} [opts.layout] - applies the block's layout options to the box
 * @param {number|null} [opts.aspect] - width / height of the drawing
 * @param {number} [opts.height] - fixed height of the drawing (px), without an aspect
 * @param {number} [opts.extra] - px under the drawing
 */
export function placeholder({ className, layout, aspect, height, extra = 0 }) {
    const box = document.createElement('div');
    box.className = `${className} matephis-placeholder`;
    box.setAttribute('aria-hidden', 'true');
    if (layout) layout(box);
    const drawing = document.createElement('div');
    drawing.style.width = '100%';
    if (aspect > 0) drawing.style.aspectRatio = String(aspect);
    else drawing.style.height = `${Math.max(50, height || 300)}px`;
    box.appendChild(drawing);
    if (extra > 0) {
        const more = document.createElement('div');
        more.style.width = '100%';
        more.style.height = `${Math.round(extra)}px`;
        box.appendChild(more);
    }
    return box;
}

/** Height of a block of sliders (px): calibrated on the site's styles. */
export function slidersHeight(cfg) {
    const n = cfg && cfg.params && cfg.showSliders !== false ? Object.keys(cfg.params).length : 0;
    return n ? 29 + 28 * n : 0;
}

/**
 * Places one block of a page: built now, or (lazy) a placeholder now and the
 * block when it comes near the screen.
 * @param {HTMLElement} container - the block's element, emptied
 * @param {string} source - the block's JSON
 * @param {object} p
 * @param {boolean} p.lazy
 * @param {(container: HTMLElement, source: string, width?: number) => void} p.build
 * @param {(cfg: object) => HTMLElement} p.placeholder
 * @param {(cfg: object) => string|null} [p.group]
 * @param {(container: HTMLElement, e: Error) => void} p.fail
 */
export function placeBlock(container, source, p) {
    /** Waits for idle time: requestIdleCallback where there is one (not Safari), else a short timer. */
function idle() {
    return new Promise(resolve => {
        if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(resolve, { timeout: IDLE_TIMEOUT });
        } else {
            setTimeout(() => resolve({ didTimeout: true, timeRemaining: () => BUDGET }), 30);
        }
    });
}

const now = () => {
        try {
            p.build(container, source);
        } catch (e) {
            p.fail(container, e);
        }
    };
    if (!p.lazy) return now();
    let cfg;
    try {
        cfg = JSON.parse(source);
    } catch (e) {
        // Shown now: the error is the block
        return now();
    }
    let stub = null;
    try {
        stub = p.placeholder(cfg);
    } catch (e) { /* no placeholder: an empty box */ }
    container.innerHTML = '';
    if (stub) container.appendChild(stub);
    lazyScheduler().add({
        el: container,
        group: p.group ? p.group(cfg) : null,
        measure: () => (stub ? stub.clientWidth : 0),
        build: (width) => {
            try {
                // The placeholder goes (not every constructor empties its container)
                container.innerHTML = '';
                p.build(container, source, width);
            } catch (e) {
                container.innerHTML = '';
                p.fail(container, e);
            }
        },
    });
}
