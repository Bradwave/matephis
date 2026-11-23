/**
 * On-demand lazy loader for Matephis diagram engines and MathJax.
 *
 * Keeps /board/ zero-script on initial load: CSS and JS bundles are injected
 * only when a widget or exercise is inserted (or restored from storage).
 * Sets `window.MATEPHIS_NO_AUTO_INIT = true` so engines never auto-scan the DOM.
 */

const ENGINE_SPECS = {
    plot: {
        css: ['/assets/css/matephis-plot.css?v=2.4'],
        js: ['/assets/js/matephis-plot.js'],
        globalName: 'MatephisPlot',
    },
    physics: {
        deps: ['plot'],
        css: ['/assets/css/matephis-physics.css?v=0.9'],
        js: ['/assets/js/matephis-physics.js'],
        globalName: 'MatephisPhysics',
    },
    sets: {
        deps: ['plot'],
        css: ['/assets/css/matephis-sets.css?v=0.8'],
        js: ['/assets/js/matephis-sets.js'],
        globalName: 'MatephisSets',
    },
    circuit: {
        css: ['/assets/css/matephis-circuit.css?v=1.1'],
        js: ['/assets/js/matephis-circuit.js'],
        globalName: 'MatephisCircuit',
    },
};

const MATHJAX_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';

export class EngineLoader {
    constructor(baseurl = null) {
        this.baseurl = baseurl !== null ? baseurl : this._detectBaseurl();
        this._cssPromises = new Map();
        this._scriptPromises = new Map();
        this._enginePromises = new Map();
        this._mathJaxPromise = null;
    }

    _detectBaseurl() {
        if (typeof document === 'undefined') return '';
        const bodyBase = document.body && document.body.dataset && document.body.dataset.baseurl;
        const rootEl = document.getElementById('matephis-board');
        const rootBase = rootEl && rootEl.dataset && rootEl.dataset.baseurl;
        const raw = bodyBase || rootBase || '';
        return raw.endsWith('/') ? raw.slice(0, -1) : raw;
    }

    resolveUrl(path) {
        if (/^https?:\/\//.test(path)) return path;
        const normalized = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseurl}${normalized}`;
    }

    loadCss(path) {
        const href = this.resolveUrl(path);
        if (this._cssPromises.has(href)) return this._cssPromises.get(href);

        const promise = new Promise((resolve) => {
            if (typeof document === 'undefined') {
                resolve();
                return;
            }
            if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
                resolve();
                return;
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve();
            link.onerror = () => resolve(); // non-fatal
            document.head.appendChild(link);
        });
        this._cssPromises.set(href, promise);
        return promise;
    }

    loadScript(path) {
        const src = this.resolveUrl(path);
        if (this._scriptPromises.has(src)) return this._scriptPromises.get(src);

        const promise = new Promise((resolve, reject) => {
            if (typeof document === 'undefined') {
                resolve();
                return;
            }
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
        this._scriptPromises.set(src, promise);
        return promise;
    }

    async loadEngine(kind) {
        const spec = ENGINE_SPECS[kind];
        if (!spec) return null;

        if (typeof window !== 'undefined' && window[spec.globalName]) {
            await Promise.all((spec.css || []).map((c) => this.loadCss(c)));
            return window[spec.globalName];
        }

        if (this._enginePromises.has(kind)) {
            return this._enginePromises.get(kind);
        }

        const promise = (async () => {
            if (typeof window !== 'undefined') {
                window.MATEPHIS_NO_AUTO_INIT = true;
            }
            if (spec.deps) {
                for (const dep of spec.deps) {
                    await this.loadEngine(dep);
                }
            }
            await Promise.all((spec.css || []).map((c) => this.loadCss(c)));
            for (const js of spec.js || []) {
                await this.loadScript(js);
            }
            return typeof window !== 'undefined' ? window[spec.globalName] || null : null;
        })();

        this._enginePromises.set(kind, promise);
        try {
            return await promise;
        } catch (err) {
            this._enginePromises.delete(kind);
            throw err;
        }
    }

    loadMathJax() {
        if (typeof window === 'undefined') return Promise.resolve(null);
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            return Promise.resolve(window.MathJax);
        }
        if (this._mathJaxPromise) return this._mathJaxPromise;

        this._mathJaxPromise = (async () => {
            if (!window.MathJax) {
                window.MathJax = {
                    tex: {
                        inlineMath: [['$', '$'], ['\\(', '\\)']],
                        displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    },
                    svg: { fontCache: 'global' },
                    startup: { typeset: false },
                };
            }
            await this.loadScript(MATHJAX_SRC);
            if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
                await window.MathJax.startup.promise;
            }
            return window.MathJax || null;
        })();

        return this._mathJaxPromise.catch(() => {
            this._mathJaxPromise = null;
            return null;
        });
    }

    async typeset(elements) {
        const list = Array.isArray(elements) ? elements : [elements];
        const valid = list.filter(Boolean);
        if (valid.length === 0) return;
        const mj = await this.loadMathJax();
        if (mj && typeof mj.typesetPromise === 'function') {
            await mj.typesetPromise(valid);
        }
    }

    /**
     * Preload only the engines / MathJax required by widgets on `page`.
     */
    async ensureForPage(page) {
        if (!page || !Array.isArray(page.widgets) || page.widgets.length === 0) return;
        const kinds = new Set(page.widgets.map((w) => w.kind));
        const tasks = [];
        for (const kind of kinds) {
            if (ENGINE_SPECS[kind]) tasks.push(this.loadEngine(kind));
        }
        if (kinds.has('exercise') || kinds.has('plot') || kinds.has('physics') || kinds.has('sets')) {
            tasks.push(this.loadMathJax());
        }
        await Promise.allSettled(tasks);
    }
}
