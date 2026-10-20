/**
 * Matephis Physics Scene
 *
 * Draws a physics diagram from a JSON configuration: a world window in metres
 * (same scale on both axes), an optional grid and axes, and a list of named
 * objects. Params get sliders through the plot engine's SliderManager, so a
 * scene and a plot behave the same way (expressions, "unit": "deg", animate).
 *
 * Shared with the plot engine (imported, not copied): expression compiler,
 * coordinate system, slider manager, palettes, MathJax bridge, lightbox.
 */
import { ExpressionCompiler } from '../../matephis-plot-src/parser/expression-parser.js';
import { CoordinateSystem } from '../../matephis-plot-src/core/coordinate-system.js';
import { createPalettes, parseAspectRatio, cssLength, adaptColorForTheme } from '../../matephis-plot-src/core/config.js';
import { createSvgElement } from '../../matephis-plot-src/renderers/svg-factory.js';
import { renderMathJaxLabel, hasMathJax } from '../../matephis-plot-src/renderers/mathjax-bridge.js';
import { SliderManager } from '../../matephis-plot-src/ui/slider-manager.js';
import { LightboxBridge } from '../../matephis-plot-src/ui/lightbox-bridge.js';
import { validateConfig, defaultLimits, DEFAULT_ASPECT_RATIO, DEFAULT_G } from './config.js';
import { angleValue, angleLiteralWarning } from './angles.js';
import { fitView, gridValues } from './world.js';
import { toTeX } from './labels.js';
import { OBJECT_TYPES, LAYERS } from '../objects/index.js';

let uidCounter = 0;

export class MatephisPhysics {
    /**
     * @param {HTMLElement} container - element to render into
     * @param {string|object} source - JSON configuration (string or object)
     * @param {object} [options]
     * @param {boolean} [options.observeResize=true]
     * @param {boolean} [options.noLightbox=false]
     */
    constructor(container, source, options = {}) {
        this.container = container;
        this.config = typeof source === 'string' ? JSON.parse(source) : source;
        this.options = options;
        this.container.innerHTML = "";
        this.container.setAttribute('data-processed', 'true');
        this.uid = `mph${++uidCounter}`;

        const cfg = this.config;
        this.angleUnit = cfg.angleUnit === 'rad' ? 'rad' : 'deg';
        this.params = {};
        this.resolved = {};
        this.warnings = [];
        this._listeners = [];

        this.wrapper = document.createElement("div");
        this.wrapper.className = "matephis-plot-container matephis-physics-container";
        if (cfg.border) this.wrapper.classList.add('bordered');
        this.wrapper.matephisPhysics = this;
        this.container.appendChild(this.wrapper);
        this._applyLayout();

        const objects = Array.isArray(cfg.objects) ? cfg.objects : [];
        this.objects = objects.filter(o => o && typeof o === 'object' && OBJECT_TYPES[o.type]);
        this.ids = objects.map(o => o && o.id).filter(id => typeof id === 'string' && id !== '');
        this._idPattern = this.ids.length
            ? new RegExp(`(?<![A-Za-z0-9_.])(${this.ids.map(id => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\.`, 'g')
            : null;

        // g is always in scope; a param called g overrides it (and gets a slider)
        const paramNames = Object.keys(cfg.params || {});
        this.compiler = new ExpressionCompiler({
            getParams: () => this.params,
            getPoints: () => this.resolved,
            paramNames: [...new Set(['g', ...paramNames])],
            pointNames: this.ids,
        });
        this.params.g = DEFAULT_G;
        if (cfg.g !== undefined) this.params.g = this._num(cfg.g, 'g');
        SliderManager.initValues(cfg.params || {}, this.params, (v, ctx) => this._eval(v, ctx));

        this.palettes = createPalettes(this._isDark());
        this._listen(window, 'matephis-theme-change', () => {
            this.palettes = createPalettes(this._isDark());
            this.draw();
        });

        this._initSVG();

        if (cfg.params && cfg.showSliders !== false) {
            this.sliders = new SliderManager(this);
            this.sliders.init();
        }

        this.lightbox = new LightboxBridge(this);
        if (!options.noLightbox) {
            this.svg.classList.add('zoomable');
            this.svg.addEventListener('click', () => this.toggleLightbox());
        }

        if (cfg.caption) {
            const cap = document.createElement('div');
            cap.className = 'matephis-plot-caption';
            cap.textContent = cfg.caption;
            this.wrapper.appendChild(cap);
        }

        validateConfig(cfg, OBJECT_TYPES).forEach(w => this._addWarning(w));
        this.draw();
        this._renderWarnings();

        if (options.observeResize !== false) this._initResizeObserver();
    }

    // =========================================================================
    // STATIC INITIALIZATION
    // =========================================================================

    /**
     * Scans the document (or `root`) for scenes: `.matephis-physics` divs and
     * ```physics code blocks.
     */
    static init(root = document) {
        const showError = (el, e) => {
            const div = document.createElement('div');
            div.className = 'matephis-plot-error';
            div.textContent = `Errore nel diagramma: ${e.message}`;
            el.appendChild(div);
        };

        root.querySelectorAll('.matephis-physics').forEach(container => {
            if (container.getAttribute('data-processed')) return;
            const source = container.textContent;
            container.setAttribute('data-processed', 'true');
            try {
                container.innerHTML = "";
                new MatephisPhysics(container, source);
            } catch (e) {
                console.error("Physics Error", e);
                showError(container, e);
            }
        });

        root.querySelectorAll('code.language-physics').forEach(code => {
            const target = code.closest('div.language-physics') || code.closest('pre') || code.parentElement;
            if (target.getAttribute('data-processed')) return;
            target.setAttribute('data-processed', 'true');
            const container = document.createElement('div');
            container.className = 'matephis-physics';
            container.setAttribute('data-processed', 'true');
            target.parentNode.insertBefore(container, target);
            target.style.display = 'none';
            try {
                new MatephisPhysics(container, code.textContent);
            } catch (e) {
                console.error("Code Block Physics Error", e);
                showError(container, e);
            }
        });
    }

    /** Renders one scene into an element (Obsidian, playground). Call .destroy() on unload. */
    static render(el, source, options = {}) {
        return new MatephisPhysics(el, source, options);
    }

    // =========================================================================
    // SETUP
    // =========================================================================

    _listen(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        this._listeners.push([target, type, fn, opts]);
    }

    _applyLayout() {
        const cfg = this.config;
        const w = this.wrapper;
        if (cfg.fullWidth) cfg.cssWidth = "100%";
        if (cfg.cssWidth) {
            w.style.maxWidth = cssLength(cfg.cssWidth);
            w.style.width = "100%";
        }
        if (cfg.align === 'center') w.classList.add('align-center');
        else if (cfg.align === 'left') w.classList.add('align-left');
        if (cfg.marginBottom !== undefined) w.style.marginBottom = cssLength(cfg.marginBottom);
        if (cfg.marginLeft !== undefined) w.style.marginLeft = cssLength(cfg.marginLeft);
        if (cfg.marginRight !== undefined) w.style.marginRight = cssLength(cfg.marginRight);
    }

    get aspectRatio() {
        return parseAspectRatio(this.config.aspectRatio) || DEFAULT_ASPECT_RATIO;
    }

    _initSVG() {
        const cfg = this.config;
        let targetWidth = cfg.width || 600;
        if (cfg.fullWidth) {
            const cw = this.wrapper.clientWidth;
            targetWidth = cw > 50 ? cw : (window.innerWidth > 0 ? window.innerWidth : 1000);
        }
        this.width = Math.max(50, targetWidth);
        this.height = Math.max(50, this.width / this.aspectRatio);
        this.padding = typeof cfg.padding === 'number' ? cfg.padding : 12;

        this.svg = createSvgElement("svg", {
            width: this.width, height: this.height, viewBox: `0 0 ${this.width} ${this.height}`,
            class: "matephis-plot-svg matephis-physics-svg static", role: "img",
            "aria-label": cfg.ariaLabel || cfg.title || "Diagramma di fisica",
        });
        this.svg.style.fontFamily = "var(--font-plot, monospace)";

        const group = (cls) => {
            const g = createSvgElement("g", cls ? { class: cls } : {});
            this.svg.appendChild(g);
            return g;
        };
        this.bgGroup = group();
        this.gridGroup = group("matephis-plot-grid");
        this.axesGroup = group();
        this.layerGroups = {};
        LAYERS.forEach(name => { this.layerGroups[name] = group(`matephis-physics-${name}`); });
        this.debugGroup = group("matephis-physics-debug");

        this.plotStage = document.createElement("div");
        this.plotStage.className = "matephis-plot-stage";
        this.plotStage.appendChild(this.svg);
        this.wrapper.appendChild(this.plotStage);
    }

    _initResizeObserver() {
        if (!window.ResizeObserver) return;
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newW = Math.round(entry.contentRect.width);
                if (newW > 10 && Math.abs(newW - this.width) > 2) this.resize(newW);
            }
        });
        this.resizeObserver.observe(this.wrapper);
    }

    /** Re-renders at a new internal width (text keeps its pixel size). */
    resize(newW) {
        this.width = newW;
        this.height = Math.max(50, newW / this.aspectRatio);
        this.svg.setAttribute("width", this.width);
        this.svg.setAttribute("height", this.height);
        this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
        this.draw();
        if (this.lightbox && this.lightbox.isOpen) this.lightbox._fit();
    }

    // =========================================================================
    // EXPRESSIONS, COLORS, THEME
    // =========================================================================

    /** Evaluates a value or expression; reports problems once as warnings. */
    _eval(val, context = "value") {
        if (typeof val === 'number') return val;
        if (typeof val === 'boolean') return Number(val);
        try {
            this._resolveReferencedIds(val);
            return this.compiler.eval(val);
        } catch (e) {
            this._addWarning(`${context}: ${e.message}`);
            return NaN;
        }
    }

    _num(val, context) {
        const r = this._eval(val, context);
        return typeof r === 'number' ? r : NaN;
    }

    /** Resolves objects named in "A.x"-style references before evaluating. */
    _resolveReferencedIds(src) {
        if (!this._idPattern || !this._resolving || typeof src !== 'string') return;
        this._idPattern.lastIndex = 0;
        let m;
        while ((m = this._idPattern.exec(src)) !== null) this._ensureResolved(m[1]);
    }

    /** Dark theme? Hosts can override with MatephisPhysics.isDarkHook = () => boolean. */
    _isDark() {
        if (this.config.theme === 'dark') return true;
        if (typeof MatephisPhysics.isDarkHook === 'function') return !!MatephisPhysics.isDarkHook();
        return typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
    }

    /** Palette name ("red1", "blue"), CSS color, or the theme's first color. */
    _color(explicit) {
        if (explicit) {
            const named = this.palettes[explicit];
            if (typeof named === 'string') return adaptColorForTheme(named, this._isDark());
            if (Array.isArray(named)) return adaptColorForTheme(named[0], this._isDark());
            return adaptColorForTheme(explicit, this._isDark());
        }
        const palette = this.palettes[this.config.theme || "red"] || this.palettes.default;
        return adaptColorForTheme(palette[0], this._isDark());
    }

    // =========================================================================
    // SVG PRIMITIVES
    // =========================================================================

    _svg(tag, attrs, parent) {
        const el = createSvgElement(tag, attrs);
        if (parent) parent.appendChild(el);
        return el;
    }

    /** Text with a halo; "$...$" goes through MathJax when the page loads it. */
    _text(x, y, str, { anchor = 'middle', baseline = 'middle', color = '#000', size, weight = 'normal', parent } = {}) {
        const fontSize = size || this.config.fontSize || 16;
        const plain = () => {
            const dark = this._isDark();
            const t = this._svg("text", {
                x, y, class: "matephis-plot-text", "text-anchor": anchor,
                "dominant-baseline": baseline, fill: color, "font-size": `${fontSize}px`, "font-weight": weight,
            }, parent);
            t.textContent = str;
            t.style.paintOrder = "stroke";
            t.style.stroke = dark ? "#181818" : "#fff";
            t.style.strokeWidth = "2.5px";
            return t;
        };
        if (hasMathJax() && str.includes('$')) {
            return renderMathJaxLabel(toTeX(str), x, y, fontSize, color, anchor, baseline, parent, plain);
        }
        return plain();
    }

    /** Filled arrowhead with its tip at (x, y), pointing along angle `a` (screen radians). */
    _arrowHead(x, y, a, size, color, parent, cls) {
        const p1 = [x - size * Math.cos(a - 0.4), y - size * Math.sin(a - 0.4)];
        const p2 = [x - size * Math.cos(a + 0.4), y - size * Math.sin(a + 0.4)];
        return this._svg("polygon", {
            points: `${x},${y} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`, fill: color, stroke: color, class: cls,
        }, parent);
    }

    // =========================================================================
    // DRAWING
    // =========================================================================

    /** Coalesces redraws to one per animation frame (sliders). */
    requestDraw() {
        if (this._drawQueued) return;
        this._drawQueued = true;
        requestAnimationFrame(() => {
            this._drawQueued = false;
            if (!this._destroyed) this.draw();
        });
    }

    _computeTransform() {
        const pad = this.padding;
        const { xlim, ylim } = defaultLimits(this.config, this.aspectRatio);
        const view = fitView(xlim, ylim, this.width - 2 * pad, this.height - 2 * pad);
        this.pxPerMetre = view.scale;
        return new CoordinateSystem({
            width: this.width, height: this.height, padL: pad, padR: pad, padT: pad, padB: pad, view,
        });
    }

    draw() {
        if (this._destroyed) return;
        [this.bgGroup, this.gridGroup, this.axesGroup, this.debugGroup, ...Object.values(this.layerGroups)]
            .forEach(g => { g.textContent = ""; });

        const cs = this._computeTransform();
        this.transform = cs;

        this._svg("rect", { x: 0, y: 0, width: this.width, height: this.height, fill: "none", class: "matephis-plot-bg" }, this.bgGroup);

        this._drawGrid(cs);
        this._drawAxes(cs);
        this._drawObjects();
        if (this.config.debug) this._drawDebug(cs);

        if (this._warningsDirty) this._renderWarnings();
    }

    _drawGrid(cs) {
        const grid = this.config.grid;
        if (!grid) return;
        const step = typeof grid === 'number' && grid > 0 ? grid : 1;
        const attrs = { style: "stroke: var(--plot-grid, #d4d4d4)", "stroke-width": 1 };
        gridValues(cs.xMin, cs.xMax, step).forEach(x => {
            const px = cs.mapX(x);
            this._svg("line", { ...attrs, x1: px, y1: cs.mapY(cs.yMin), x2: px, y2: cs.mapY(cs.yMax) }, this.gridGroup);
        });
        gridValues(cs.yMin, cs.yMax, step).forEach(y => {
            const py = cs.mapY(y);
            this._svg("line", { ...attrs, x1: cs.mapX(cs.xMin), y1: py, x2: cs.mapX(cs.xMax), y2: py }, this.gridGroup);
        });
    }

    /** World axes through the origin (kept inside the window), with arrows and labels. */
    _drawAxes(cs) {
        const axes = this.config.axes;
        if (!axes) return;
        const opts = typeof axes === 'object' ? axes : {};
        const labels = Array.isArray(opts.labels) ? opts.labels : ['x', 'y'];
        const color = this._isDark() ? '#e2e8f0' : '#000';
        const g = this.axesGroup;

        const ox = Math.min(Math.max(0, cs.xMin), cs.xMax);
        const oy = Math.min(Math.max(0, cs.yMin), cs.yMax);
        const x0 = cs.mapX(cs.xMin), x1 = cs.mapX(cs.xMax) - 2;
        const y0 = cs.mapY(cs.yMin), y1 = cs.mapY(cs.yMax) + 2;
        const px = cs.mapX(ox), py = cs.mapY(oy);

        const line = (a, b, c, d) => this._svg("line", { x1: a, y1: b, x2: c, y2: d, stroke: color, "stroke-width": 1.5, class: "matephis-plot-axis" }, g);
        line(x0, py, x1, py);
        line(px, y0, px, y1);
        this._arrowHead(x1, py, 0, 10, color, g, "matephis-plot-arrow");
        this._arrowHead(px, y1, -Math.PI / 2, 10, color, g, "matephis-plot-arrow");
        if (labels[0]) this._text(x1 - 4, py - 14, String(labels[0]), { anchor: 'end', baseline: 'auto', color, parent: g });
        if (labels[1]) this._text(px + 14, y1 + 6, String(labels[1]), { anchor: 'start', baseline: 'hanging', color, parent: g });

        if (opts.numbers) {
            const step = typeof opts.numbers === 'number' ? opts.numbers : (typeof this.config.grid === 'number' ? this.config.grid : 1);
            const size = 12;
            gridValues(cs.xMin, cs.xMax, step).forEach(x => {
                if (Math.abs(x - ox) < 1e-9 || cs.mapX(x) > x1 - 24) return;
                line(cs.mapX(x), py - 3, cs.mapX(x), py + 3);
                this._text(cs.mapX(x), py + 6, String(x), { baseline: 'hanging', color, size, parent: g });
            });
            gridValues(cs.yMin, cs.yMax, step).forEach(y => {
                if (Math.abs(y - oy) < 1e-9 || cs.mapY(y) < y1 + 24) return;
                line(px - 3, cs.mapY(y), px + 3, cs.mapY(y));
                this._text(px - 6, cs.mapY(y), String(y), { anchor: 'end', color, size, parent: g });
            });
        }
    }

    /** Context handed to object types: evaluation, mapping and drawing helpers. */
    _context(obj) {
        const where = (field) => `${obj.type}${obj.id ? ` '${obj.id}'` : ''} ${field}`;
        return {
            num: (v, field) => this._num(v, where(field)),
            angle: (v, field) => {
                const w = angleLiteralWarning(v, this.angleUnit, where(field));
                if (w) this._addWarning(w);
                return angleValue(v, this.angleUnit, (e) => this._num(e, where(field)));
            },
            point: (v, field) => this._point(v, where(field)),
            map: (p) => ({ x: this.transform.mapX(p.x), y: this.transform.mapY(p.y) }),
            color: (c) => this._color(c),
            svg: (tag, attrs, parent) => this._svg(tag, attrs, parent),
            text: (x, y, str, opts) => this._text(x, y, str, opts),
            warn: (msg) => this._addWarning(msg),
            pxPerMetre: this.pxPerMetre,
            angleUnit: this.angleUnit,
        };
    }

    /**
     * A point in world coordinates: [x, y] (numbers or expressions; a third
     * coordinate z is accepted and ignored for now), an object id ("A"), or
     * { "from": <point>, "offset": [dx, dy] } in metres.
     */
    _point(v, where) {
        if (Array.isArray(v) && (v.length === 2 || v.length === 3)) {
            const x = this._num(v[0], `${where} x`), y = this._num(v[1], `${where} y`);
            return isFinite(x) && isFinite(y) ? { x, y } : null;
        }
        if (typeof v === 'string') {
            const [id, anchor] = v.split('.');
            if (!this.ids.includes(id)) {
                this._addWarning(`${where}: no object with id '${id}'`);
                return null;
            }
            if (anchor) this._addWarning(`${where}: anchors like '${v}' come with static scenes; using the position of '${id}'`);
            const s = this._ensureResolved(id);
            return s ? { x: s.x, y: s.y } : null;
        }
        if (v && typeof v === 'object' && v.from !== undefined) {
            const base = this._point(v.from, where);
            if (!base) return null;
            const off = Array.isArray(v.offset) ? v.offset : [0, 0];
            return { x: base.x + this._num(off[0], `${where} offset`), y: base.y + this._num(off[1], `${where} offset`) };
        }
        this._addWarning(`${where}: expected [x, y], an object id or { "from", "offset" }`);
        return null;
    }

    /** Resolves an object by id once per draw; detects reference cycles. */
    _ensureResolved(id) {
        if (this._state.has(id)) return this._state.get(id);
        const obj = this.objects.find(o => o.id === id);
        if (!obj) return null;
        if (this._visiting.has(id)) {
            this._addWarning(`Reference cycle through '${id}'`);
            return null;
        }
        this._visiting.add(id);
        const state = this._resolveObject(obj);
        this._visiting.delete(id);
        return state;
    }

    _resolveObject(obj) {
        const key = obj.id || obj;
        if (this._state.has(key)) return this._state.get(key);
        let state = null;
        try {
            state = OBJECT_TYPES[obj.type].resolve(obj, this._context(obj));
        } catch (e) {
            this._addWarning(`${obj.type}${obj.id ? ` '${obj.id}'` : ''}: ${e.message}`);
        }
        this._state.set(key, state);
        if (obj.id && state) this.resolved[obj.id] = { x: state.x, y: state.y };
        return state;
    }

    _isShown(obj) {
        if (obj.hidden === true) return false;
        if (obj.show === undefined) return true;
        const v = typeof obj.show === 'boolean' ? obj.show : this._num(obj.show, `${obj.type} show`);
        return !!v && !Number.isNaN(v);
    }

    _drawObjects() {
        this._state = new Map();
        this._visiting = new Set();
        this.resolved = {};
        this._resolving = true;
        try {
            this.objects.forEach(obj => this._resolveObject(obj));
            this.objects.forEach(obj => {
                const state = this._state.get(obj.id || obj);
                if (!state || !this._isShown(obj)) return;
                const def = OBJECT_TYPES[obj.type];
                const layer = LAYERS.includes(obj.layer) ? obj.layer : def.layer;
                const g = this._svg("g", { class: `matephis-physics-${obj.type}` }, this.layerGroups[layer]);
                if (obj.opacity !== undefined) g.setAttribute("opacity", this._num(obj.opacity, `${obj.type} opacity`));
                try {
                    def.render(obj, state, this._context(obj), g);
                } catch (e) {
                    this._addWarning(`${obj.type}${obj.id ? ` '${obj.id}'` : ''}: ${e.message}`);
                }
            });
        } finally {
            this._resolving = false;
        }
    }

    /** Debug overlay: object ids at their positions and the scale. */
    _drawDebug(cs) {
        const g = this.debugGroup;
        const color = '#7c3aed';
        this._state.forEach((state, key) => {
            if (!state || typeof key !== 'string') return;
            const x = cs.mapX(state.x), y = cs.mapY(state.y);
            this._svg("path", { d: `M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}`, stroke: color, "stroke-width": 1 }, g);
            this._text(x + 6, y + 6, `${key} (${+state.x.toFixed(2)}, ${+state.y.toFixed(2)})`, { anchor: 'start', baseline: 'hanging', color, size: 11, parent: g });
        });
        this._text(this.width - 6, this.height - 6, `1 m = ${+this.pxPerMetre.toFixed(1)} px`, { anchor: 'end', baseline: 'auto', color, size: 11, parent: g });
    }

    // =========================================================================
    // LIGHTBOX, LIFECYCLE, WARNINGS
    // =========================================================================

    get inLightbox() {
        return !!(this.lightbox && this.lightbox.isOpen);
    }

    toggleLightbox() {
        if (this.inLightbox) this.lightbox.close();
        else this.lightbox.open();
    }

    _onLightboxChange(open) {
        this.svg.classList.toggle('zoomable', !open);
    }

    /** Removes listeners, observers and animations (hosts that re-render: Obsidian, playground). */
    destroy() {
        this._destroyed = true;
        if (this.lightbox && this.lightbox.isOpen) this.lightbox.close();
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.sliders) this.sliders.destroy();
        this._listeners.forEach(([t, type, fn, opts]) => t.removeEventListener(type, fn, opts));
        this._listeners = [];
        this.container.innerHTML = "";
    }

    _addWarning(msg) {
        if (!this.warnings.includes(msg)) {
            this.warnings.push(msg);
            this._warningsDirty = true;
        }
    }

    _renderWarnings() {
        this._warningsDirty = false;
        const old = this.wrapper.querySelector(".matephis-plot-warnings");
        if (old) old.remove();
        if (this.warnings.length === 0) return;

        const div = document.createElement("div");
        div.className = "matephis-plot-warnings";
        const title = document.createElement("strong");
        title.textContent = "⚠️ Physics Warnings:";
        div.appendChild(title);
        const ul = document.createElement("ul");
        this.warnings.forEach(w => {
            const li = document.createElement("li");
            li.textContent = w;
            ul.appendChild(li);
        });
        div.appendChild(ul);
        this.wrapper.appendChild(div);
    }
}

export default MatephisPhysics;
