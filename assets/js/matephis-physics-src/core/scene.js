/**
 * Matephis Physics Scene
 *
 * Draws a physics diagram from a JSON configuration: a world window in metres
 * (same scale on both axes), an optional grid and axes, and a list of named
 * objects. Params get sliders through the plot engine's SliderManager, so a
 * scene and a plot behave the same way (expressions, "unit": "deg", animate).
 *
 * Geometry comes from the Resolver (no DOM); this class owns the layout, the
 * drawing context handed to object types, theme and lifecycle.
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
import { formatAngle } from './angles.js';
import { fitView, gridValues } from './world.js';
import { toTeX, normalizeLabel, estimateTextSize, labelBox, boxesOverlap, segmentHitsBox } from './labels.js';
import { Resolver, describe } from './resolver.js';
import { angleArc, polar, anchorFor } from './draw.js';
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
        this.warnings = [];
        this._listeners = [];

        this.wrapper = document.createElement("div");
        this.wrapper.className = "matephis-plot-container matephis-physics-container";
        if (cfg.border) this.wrapper.classList.add('bordered');
        this.wrapper.matephisPhysics = this;
        this.container.appendChild(this.wrapper);
        this._applyLayout();

        const objects = (Array.isArray(cfg.objects) ? cfg.objects : []).filter(o => o && typeof o === 'object' && OBJECT_TYPES[o.type]);
        const ids = objects.map(o => o.id).filter(id => typeof id === 'string' && id !== '');

        // g is always in scope; a param called g overrides it (and gets a slider)
        const paramNames = Object.keys(cfg.params || {});
        this.compiler = new ExpressionCompiler({
            getParams: () => this.params,
            getPoints: () => (this.resolver ? this.resolver.resolved : {}),
            paramNames: [...new Set(['g', ...paramNames])],
            pointNames: ids,
        });
        this.resolver = new Resolver({
            objects, types: OBJECT_TYPES, compiler: this.compiler, angleUnit: this.angleUnit, config: cfg,
            warn: (msg) => this._addWarning(msg),
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

    /**
     * Text with a halo; "$...$" goes through MathJax when the page loads it.
     * A label with a TeX command and no "$" ("\\vec F") is treated as math.
     */
    _text(x, y, raw, { anchor = 'middle', baseline = 'middle', color = '#000', size, weight = 'normal', parent } = {}) {
        const str = normalizeLabel(raw);
        const fontSize = size || this.config.fontSize || 16;
        if (this._placed) {
            const { w, h } = estimateTextSize(str, fontSize);
            this._placed.boxes.push(labelBox(x, y, w, h, anchor, baseline));
        }
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
            // Formulas get the same outline as plain labels unless "labelHalo": false
            const halo = this.config.labelHalo !== false ? { color: this._isDark() ? "#181818" : "#fff" } : null;
            return renderMathJaxLabel(toTeX(str), x, y, fontSize, color, anchor, baseline, parent, plain, { halo });
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
        // Labels and lines drawn so far, so later labels can avoid them
        this._placed = { boxes: [], segs: [] };

        this._svg("rect", { x: 0, y: 0, width: this.width, height: this.height, fill: "none", class: "matephis-plot-bg" }, this.bgGroup);

        this._drawGrid(cs);
        this._drawAxes(cs);
        this._drawObjects(cs);
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

    /** Theme ink for lines and text that have no colour of their own. */
    get ink() {
        return this._isDark() ? '#e2e8f0' : '#1f1f1f';
    }

    /** Default colour of a vector kind: forces in the theme colour, the others fixed hues. */
    _kindColor(kind) {
        const d = this.palettes.default;
        switch (kind) {
            case 'velocity': return adaptColorForTheme(d[0], this._isDark());
            case 'acceleration': return adaptColorForTheme(d[2], this._isDark());
            case 'momentum': return adaptColorForTheme(d[4], this._isDark());
            case 'vector': {
                const palette = this.palettes[this.config.theme || "red"] || d;
                return adaptColorForTheme(palette[1] || palette[0], this._isDark());
            }
            default: return this._color();
        }
    }

    /**
     * Places a label at the first candidate position whose box overlaps no
     * label and no registered line drawn so far; falls back to the first.
     * @param {{x, y, anchor, baseline}[]} candidates - screen positions, in order of preference
     */
    _placeText(str, candidates, opts = {}) {
        const fontSize = opts.size || this.config.fontSize || 16;
        const { w, h } = estimateTextSize(normalizeLabel(str), fontSize);
        const free = (c) => {
            const b = labelBox(c.x, c.y, w, h, c.anchor, c.baseline);
            if (b.x < 0 || b.y < 0 || b.x + b.w > this.width || b.y + b.h > this.height) return false;
            if (this._placed.boxes.some(o => boxesOverlap(o, b))) return false;
            return !this._placed.segs.some(([p, q]) => segmentHitsBox(p, q, b));
        };
        const pick = candidates.find(free) || candidates[0];
        return this._text(pick.x, pick.y, str, { ...opts, anchor: pick.anchor, baseline: pick.baseline });
    }

    /** Drawing context handed to object types (see objects/index.js). */
    _renderContext(cs) {
        const ctx = {
            r: this.resolver,
            map: (p) => ({ x: cs.mapX(p.x), y: cs.mapY(p.y) }),
            pxPerMetre: this.pxPerMetre,
            svg: (tag, attrs, parent) => this._svg(tag, attrs, parent),
            text: (x, y, str, opts) => this._text(x, y, str, opts),
            placeText: (str, candidates, opts) => this._placeText(str, candidates, opts),
            /** Registers a drawn line (screen points) that labels should not cover. */
            obstacle: (p, q) => this._placed.segs.push([p, q]),
            /** Same, for a world polyline. */
            obstaclePath: (pts) => {
                for (let i = 1; i < pts.length; i++) this._placed.segs.push([ctx.map(pts[i - 1]), ctx.map(pts[i])]);
            },
            color: (c) => this._color(c),
            kindColor: (kind) => this._kindColor(kind),
            ink: this.ink,
            angleUnit: this.angleUnit,
            /** Arc (or right-angle square) for {vertex, a1, a2}, with a label or the value. */
            angleMark: (spec, { label, showValue = false, radius = 30, color = this.ink, digits } = {}, g) => {
                const c = ctx.map(spec.vertex);
                const mid = angleArc(ctx, c, spec.a1, spec.a2, radius, { color }, g);
                const sweep = ((spec.a2 - spec.a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
                const text = label !== undefined && label !== null && label !== true ? label
                    : (showValue || label === true) ? formatAngle(sweep, this.angleUnit, digits !== undefined ? digits : 0) : null;
                if (!text) return;
                // Just outside the arc on the bisector, text running outwards; then just outside
                // either side of the angle (narrow angles), then further out
                const outside = (a, turn) => {
                    const p = polar(c, a, radius * 0.75), o = a + turn;
                    return { x: p.x + 9 * Math.cos(o), y: p.y - 9 * Math.sin(o), ...anchorFor(o) };
                };
                const cands = [
                    { ...polar(c, mid, radius + 5), ...anchorFor(mid) },
                    outside(spec.a1, -Math.PI / 2), outside(spec.a2, Math.PI / 2),
                    { ...polar(c, mid, radius + 16), ...anchorFor(mid) },
                ];
                ctx.placeText(text, cands, { color, size: 15, parent: g });
            },
        };
        return ctx;
    }

    _isShown(obj) {
        if (obj.hidden === true) return false;
        if (obj.show === undefined) return true;
        const v = typeof obj.show === 'boolean' ? obj.show : this.resolver.num(obj.show, `${describe(obj)} show`);
        return !!v && !Number.isNaN(v);
    }

    _drawObjects(cs) {
        const r = this.resolver;
        const states = r.resolveAll({ xMin: cs.xMin, xMax: cs.xMax, yMin: cs.yMin, yMax: cs.yMax });
        const ctx = this._renderContext(cs);
        r.objects.forEach(obj => {
            const state = states.get(obj);
            if (!state || !this._isShown(obj)) return;
            const def = OBJECT_TYPES[obj.type];
            const layer = LAYERS.includes(obj.layer) ? obj.layer : def.layer;
            const g = this._svg("g", { class: `matephis-physics-${obj.type}` }, this.layerGroups[layer]);
            if (obj.opacity !== undefined) g.setAttribute("opacity", r.num(obj.opacity, `${describe(obj)} opacity`));
            try {
                def.render(obj, state, ctx, g);
            } catch (e) {
                this._addWarning(`${describe(obj)}: ${e.message}`);
            }
        });
    }

    /**
     * Debug overlay: each named object's position, id and frame (t, n), with
     * its anchor names in a tooltip; the scale in the corner.
     */
    _drawDebug(cs) {
        const g = this.debugGroup;
        const color = '#7c3aed';
        const r = this.resolver;
        const k = 0.06 * Math.min(cs.xMax - cs.xMin, cs.yMax - cs.yMin);
        r.objects.forEach(obj => {
            const st = r.states.get(obj);
            if (!st || !obj.id || obj.id.startsWith('__')) return;
            const x = cs.mapX(st.pos.x), y = cs.mapY(st.pos.y);
            const grp = this._svg("g", {}, g);
            const tip = this._svg("title", {}, grp);
            const names = OBJECT_TYPES[obj.type].anchorNames || [];
            tip.textContent = `${describe(obj)}${names.length ? ` · anchors: ${names.join(', ')}` : ''}`;
            if (st.frame && !st.vec) {
                [[st.frame.t, 't'], [st.frame.n, 'n']].forEach(([a, name]) => {
                    const ex = cs.mapX(st.pos.x + a.x * k), ey = cs.mapY(st.pos.y + a.y * k);
                    this._svg("line", { x1: x, y1: y, x2: ex, y2: ey, stroke: color, "stroke-width": 1.2 }, grp);
                    this._text(ex + (ex - x) * 0.25, ey + (ey - y) * 0.25, name, { color, size: 10, parent: grp });
                });
            }
            this._svg("circle", { cx: x, cy: y, r: 2.5, fill: color }, grp);
            this._text(x + 6, y + 6, `${obj.id} (${+st.pos.x.toFixed(2)}, ${+st.pos.y.toFixed(2)})`, { anchor: 'start', baseline: 'hanging', color, size: 11, parent: grp });
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
