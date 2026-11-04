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
import { CoordinateSystem } from '../../matephis-plot-src/core/coordinate-system.js';
import { createPalettes, parseAspectRatio, cssLength, adaptColorForTheme } from '../../matephis-plot-src/core/config.js';
import { createSvgElement } from '../../matephis-plot-src/renderers/svg-factory.js';
import { renderMathJaxLabel, hasMathJax } from '../../matephis-plot-src/renderers/mathjax-bridge.js';
import { SliderManager, paramScale } from '../../matephis-plot-src/ui/slider-manager.js';
import { LightboxBridge } from '../../matephis-plot-src/ui/lightbox-bridge.js';
import { validateConfig, defaultLimits, DEFAULT_ASPECT_RATIO, DEFAULT_G } from './config.js';
import { formatAngle } from './angles.js';
import { fitView, gridValues } from './world.js';
import { toTeX, normalizeLabel, estimateTextSize, labelBox, boxesOverlap, segmentHitsBox } from './labels.js';
import { Resolver, describe } from './resolver.js';
import { angleArc, polar, anchorFor } from './draw.js';
import { collinearOffsets } from './geometry.js';
import { Controls, plainLabel } from './controls.js';
import { Simulation } from './simulation.js';
import { PhysicsCompiler, kinematicIds } from './compiler.js';
import { Solver } from './solver.js';
import { expandScene } from './presets.js';
import { randomValues, mixSeed, urlSeed } from './random.js';
import { parseFrames, parseViews, viewTransform, transformStates, frameMap } from './views.js';
import { massOf } from '../objects/shared.js';
import { scale as scaleVec } from './vec.js';
import { drawVector } from '../objects/annotations.js';
import { Readouts } from './readouts.js';
import { Graphs, graphPosition } from './graphs.js';
import { Clock } from './clock.js';
import { DragController } from './drag.js';
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
        // "preset" and "use" (macros) expand into the scene before anything reads it
        const expandWarnings = [];
        const macros = MatephisPhysics.macros || (typeof window !== 'undefined' && window.MatephisPhysicsMacros) || {};
        this.config = expandScene(typeof source === 'string' ? JSON.parse(source) : source, macros, (m) => expandWarnings.push(m));
        this.options = options;
        this.container.innerHTML = "";
        this.container.setAttribute('data-processed', 'true');
        this.uid = `mph${++uidCounter}`;

        const cfg = this.config;
        this.angleUnit = cfg.angleUnit === 'rad' ? 'rad' : 'deg';
        this.params = {};
        this.warnings = [];
        expandWarnings.forEach(w => this._addWarning(w));
        // Views (projections of the same scene) and reference frames (views.js)
        this.frameDefs = parseFrames(this.config, (m) => this._addWarning(m));
        this.viewDefs = parseViews(this.config, this.frameDefs, (m) => this._addWarning(m));
        const frameNames = this.frameDefs ? Object.keys(this.frameDefs) : [];
        this.frameIndex = this.config.frame !== undefined ? Math.max(0, frameNames.indexOf(this.config.frame)) : 0;
        if (this.config.frame !== undefined && !frameNames.includes(this.config.frame)) this._addWarning(`frame: no frame called '${this.config.frame}' in "frames"`);
        this._listeners = [];

        this.wrapper = document.createElement("div");
        this.wrapper.className = "matephis-plot-container matephis-physics-container";
        if (cfg.border) this.wrapper.classList.add('bordered');
        this.wrapper.matephisPhysics = this;
        this.container.appendChild(this.wrapper);
        this._applyLayout();

        const objects = (Array.isArray(cfg.objects) ? cfg.objects : []).filter(o => o && typeof o === 'object' && OBJECT_TYPES[o.type]);
        const ids = objects.map(o => o.id).filter(id => typeof id === 'string' && id !== '');

        // Time: a clock ("time"), an ODE ("state"), graphs, or anything that reads motion over
        // time (ghosts, traces, energy, velocity vectors of a body, "A.speed" in an expression)
        const stateNames = cfg.state && typeof cfg.state === 'object' && !Array.isArray(cfg.state) ? Object.keys(cfg.state) : [];
        this.kinIds = kinematicIds({ objects: cfg.objects, readouts: cfg.readouts, graphs: cfg.graphs }, ids);
        // Bodies moved by Newton's law ("magnitudes": "solve") need a simulation too
        const solved = new Solver(this, stateNames).ids.length > 0
            || (cfg.magnitudes === 'solve' && objects.some(o => o.type === 'pendulum' && o.forces === 'auto'));
        const timed = solved || cfg.time !== undefined || stateNames.length > 0 || (Array.isArray(cfg.graphs) && cfg.graphs.length > 0)
            || this.kinIds.length > 0 || objects.some(o => o.type === 'ghosts' || o.type === 'trace' || o.type === 'energy'
            || ((o.type === 'velocity' || o.type === 'acceleration') && o.on !== undefined && o.dir === undefined && o.vec === undefined));

        // g is always in scope; a param called g overrides it (and gets a slider)
        const paramNames = Object.keys(cfg.params || {});
        const timeNames = timed ? ['t', ...stateNames] : [];
        timeNames.filter(n => paramNames.includes(n)).forEach(n => {
            this._addWarning(`Param '${n}' clashes with ${n === 't' ? 'the time t' : `the state variable '${n}'`}: rename it`);
        });
        this.compiler = new PhysicsCompiler({
            getParams: () => this.params,
            getPoints: () => (this.resolver ? this.resolver.resolved : {}),
            paramNames: [...new Set(['g', ...paramNames, ...timeNames])],
            pointNames: ids,
        });
        this.resolver = new Resolver({
            objects, types: OBJECT_TYPES, compiler: this.compiler, angleUnit: this.angleUnit, config: cfg,
            warn: (msg) => this._addWarning(msg),
        });
        this.compiler.setIds(this.resolver.ids);
        this.params.g = DEFAULT_G;
        if (cfg.g !== undefined) this.params.g = this._num(cfg.g, 'g');
        this._initRandom();
        SliderManager.initValues(cfg.params || {}, this.params, (v, ctx) => this._eval(v, ctx));
        if (timed) this.sim = new Simulation(this, stateNames);
        this._initCompare(timed ? stateNames : null);

        this.palettes = createPalettes(this._isDark());
        this._listen(window, 'matephis-theme-change', () => {
            this.palettes = createPalettes(this._isDark());
            this.draw();
        });

        // Graphs on the right: the scene (with clock and readouts) and the graphs side by
        // side, in a row that wraps to a column on narrow screens
        if (Array.isArray(cfg.graphs) && cfg.graphs.some(d => graphPosition(d) === 'right')) {
            this.wrapper.classList.add('matephis-physics-has-side');
            const split = document.createElement('div');
            split.className = 'matephis-physics-split';
            this.stageHost = document.createElement('div');
            this.stageHost.className = 'matephis-physics-main';
            this.sideHost = document.createElement('div');
            this.sideHost.className = 'matephis-physics-side';
            split.append(this.stageHost, this.sideHost);
            this.wrapper.appendChild(split);
        }
        this._initSVG();

        if (this.sim && this.sim.hasClock) {
            this.clock = new Clock(this, this.sim);
            (this.stageHost || this.wrapper).appendChild(this.clock.el);
        }

        if (cfg.outOfPlane === 'note') {
            this.noteEl = document.createElement('div');
            this.noteEl.className = 'matephis-physics-note';
            (this.stageHost || this.wrapper).appendChild(this.noteEl);
        }
        if (this.compareEl) (this.stageHost || this.wrapper).appendChild(this.compareEl);
        if (Array.isArray(cfg.readouts) && cfg.readouts.length) {
            this.readouts = new Readouts(this, cfg.readouts);
            (this.stageHost || this.wrapper).appendChild(this.readouts.el);
        }
        // Graphs before the first draw: the simulation samples them
        if (Array.isArray(cfg.graphs) && cfg.graphs.length) {
            this.graphs = new Graphs(this, cfg.graphs);
            this.wrapper.appendChild(this.graphs.el);
            if (this.sideHost) this.sideHost.appendChild(this.graphs.sideEl);
        }

        // Free-body diagrams and energy charts go in panels under the scene
        this.panelHost = document.createElement('div');
        this.panelHost.className = 'matephis-physics-panels';
        this.wrapper.appendChild(this.panelHost);

        // Buttons from "controls", then the ones objects bring ("button" on a free-body diagram)
        const defs = Array.isArray(cfg.controls) ? cfg.controls.slice() : [];
        objects.filter(o => o.type === 'fbd' && o.button !== undefined && o.button !== false).forEach(o => {
            const body = objects.find(b => b.id === o.of);
            const name = body ? plainLabel(body.label !== undefined ? body.label : body.id) : o.of;
            defs.push({ type: 'reveal', label: typeof o.button === 'string' ? o.button : `Mostra corpo libero di ${name}`, objects: [o] });
        });
        if (defs.length) {
            this.controls = new Controls(this, defs);
            this.wrapper.appendChild(this.controls.el);
        }

        if (cfg.params && cfg.showSliders !== false) {
            this.sliders = new SliderManager(this);
            this.sliders.init();
        }
        if (this.seed !== undefined) this._initVariantLine();

        const draggable = objects.some(o => o.drag !== undefined);
        // Free-body diagrams that a click on their body shows and hides
        this._clicked = new Set();
        if (objects.some(o => o.type === 'fbd' && o.click === true)) {
            const toggle = (e) => {
                const g = e.target.closest && e.target.closest('[data-fbd]');
                if (!g) return false;
                const fbd = this.resolver.objects[Number(g.getAttribute('data-fbd'))];
                if (!fbd) return false;
                if (this._clicked.has(fbd)) this._clicked.delete(fbd); else this._clicked.add(fbd);
                this.requestDraw();
                return true;
            };
            this._listen(this.svg, 'click', (e) => { if (toggle(e)) e.stopPropagation(); });
            this._listen(this.svg, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && toggle(e)) {
                    e.preventDefault();
                    // The body is drawn again: give it the focus back
                    this._refocus = e.target.closest('[data-fbd]').getAttribute('data-fbd');
                }
            });
        }
        if (draggable) this.dragger = new DragController(this);

        this.lightbox = new LightboxBridge(this);
        // A click on a scene you can drag things in must not open the lightbox
        if (!options.noLightbox && !draggable) {
            this.svg.classList.add('zoomable');
            // Clicking a body that shows its free-body diagram is not a click on the scene
            this.svg.addEventListener('click', (e) => { if (!(e.target.closest && e.target.closest('[data-fbd]'))) this.toggleLightbox(); });
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
        if (cfg.fullWidth || this.viewDefs) {
            const cw = (this.stageHost || this.wrapper).clientWidth;
            targetWidth = cw > 50 ? cw : (window.innerWidth > 0 ? Math.min(window.innerWidth, cfg.width || 600) : 600);
        }
        this.padding = typeof cfg.padding === 'number' ? cfg.padding : 12;
        this.plotStage = document.createElement("div");
        this.plotStage.className = "matephis-plot-stage";
        (this.stageHost || this.wrapper).appendChild(this.plotStage);
        if (!this.viewDefs) {
            this.width = Math.max(50, targetWidth);
            this.height = Math.max(50, this.width / this.aspectRatio);
            this._useViewport(this._createViewport(null, this.width, this.height));
            this.plotStage.appendChild(this.svg);
            return;
        }
        // Several views: a grid of panels, each with its own drawing
        this.wrapper.classList.add('matephis-physics-has-views');
        const grid = document.createElement('div');
        grid.className = 'matephis-physics-views';
        this.plotStage.appendChild(grid);
        this.viewports = this.viewDefs.map(def => {
            const vp = this._createViewport(def, 100, 100);
            const fig = document.createElement('figure');
            fig.className = 'matephis-physics-view';
            fig.appendChild(vp.svg);
            if (def.title !== undefined) {
                const cap = document.createElement('figcaption');
                cap.textContent = def.title;
                fig.appendChild(cap);
            }
            grid.appendChild(fig);
            vp.figure = fig;
            return vp;
        });
        this.viewGrid = grid;
        this._layoutViews(targetWidth);
        this._useViewport(this.viewports[0]);
    }

    /**
     * Params with "random" (random.js): their starting values from the seed,
     * written into the params' "val" before the sliders are made.
     */
    _initRandom() {
        const params = this.config.params || {};
        const names = Object.keys(params).filter(n => params[n] && params[n].random !== undefined && params[n].random !== false);
        if (!names.length) {
            if (this.config.seed !== undefined) this._addWarning('seed: no param has "random"');
            return;
        }
        MatephisPhysics._randomScenes = (MatephisPhysics._randomScenes || 0) + 1;
        const index = MatephisPhysics._randomScenes - 1;
        const fromUrl = urlSeed();
        if (typeof this.config.seed === 'number') this.seed = Math.floor(this.config.seed);
        else if (fromUrl !== null) this.seed = mixSeed(fromUrl, index) % 100000;
        else this.seed = 1 + Math.floor(Math.random() * 99999);
        this._applyRandom();
    }

    _applyRandom() {
        const params = this.config.params;
        const values = randomValues(params, this.seed, (m) => this._addWarning(m));
        Object.entries(values).forEach(([name, v]) => { params[name] = { ...params[name], val: v }; });
        return values;
    }

    /** "Variante 12345" and a button for another one, under the sliders. */
    _initVariantLine() {
        const line = document.createElement('div');
        line.className = 'matephis-physics-variant';
        const text = document.createElement('span');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'matephis-physics-button';
        btn.textContent = 'Nuovi valori';
        const show = () => { text.textContent = `Variante ${this.seed}`; };
        show();
        btn.addEventListener('click', () => {
            this.seed = 1 + Math.floor(Math.random() * 99999);
            const values = this._applyRandom();
            Object.entries(values).forEach(([name, v]) => this.setParam(name, v, false));
            show();
            this.requestDraw();
        });
        line.append(text, btn);
        this.wrapper.appendChild(line);
    }

    /** Config of a view: the scene's, with the view's own limits and look. */
    _viewConfig(def) {
        if (!def) return this.config;
        const o = def.overrides;
        const cfg = { ...this.config, ...o };
        // Limits given both ways and no proportions: the drawing takes their shape
        if (o.aspectRatio === undefined && Array.isArray(o.xlim) && Array.isArray(o.ylim)) {
            const w = o.xlim[1] - o.xlim[0], h = o.ylim[1] - o.ylim[0];
            if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) cfg.aspectRatio = w / h;
        }
        return cfg;
    }

    /** An SVG with its layer groups, for one view (or the only one). */
    _createViewport(def, width, height) {
        const cfg = this._viewConfig(def);
        const svg = createSvgElement("svg", {
            width, height, viewBox: `0 0 ${width} ${height}`,
            class: "matephis-plot-svg matephis-physics-svg static", role: "img",
            "aria-label": (def && def.title) || cfg.ariaLabel || cfg.title || "Diagramma di fisica",
        });
        svg.style.fontFamily = "var(--font-plot, monospace)";
        const group = (cls) => {
            const g = createSvgElement("g", cls ? { class: cls } : {});
            svg.appendChild(g);
            return g;
        };
        const vp = { def, config: cfg, svg, width, height };
        vp.bgGroup = group();
        vp.gridGroup = group("matephis-plot-grid");
        vp.axesGroup = group();
        // "compare": the scene with other params, faded, under everything else drawn on top
        vp.compareGroup = group("matephis-physics-compare");
        vp.layerGroups = {};
        LAYERS.forEach(name => { vp.layerGroups[name] = group(`matephis-physics-${name}`); });
        vp.debugGroup = group("matephis-physics-debug");
        return vp;
    }

    /** Draws into this viewport from now on (the scene's drawing code reads these fields). */
    _useViewport(vp) {
        ['svg', 'bgGroup', 'gridGroup', 'axesGroup', 'compareGroup', 'layerGroups', 'debugGroup', 'width', 'height'].forEach(k => { this[k] = vp[k]; });
        this.viewport = vp;
    }

    /** Sizes of the views for the room there is: side by side ("columns", 2 by default), one per row when narrow. */
    _layoutViews(total) {
        const n = this.viewports.length;
        const gap = typeof this.config.gap === 'number' ? this.config.gap : 12;
        let cols = typeof this.config.columns === 'number' ? Math.max(1, Math.round(this.config.columns)) : Math.min(n, 2);
        if (total < 520) cols = 1;
        this.viewGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        this.viewGrid.style.gap = `${gap}px`;
        const w = Math.max(50, (total - gap * (cols - 1)) / cols);
        this.viewports.forEach(vp => {
            const aspect = parseAspectRatio(vp.config.aspectRatio) || DEFAULT_ASPECT_RATIO;
            vp.width = w;
            vp.height = Math.max(50, w / aspect);
            vp.svg.setAttribute('width', vp.width);
            vp.svg.setAttribute('height', vp.height);
            vp.svg.setAttribute('viewBox', `0 0 ${vp.width} ${vp.height}`);
        });
        this._layoutWidth = total;
    }

    _initResizeObserver() {
        if (!window.ResizeObserver) return;
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newW = Math.round(entry.contentRect.width);
                const current = this.viewports ? this._layoutWidth : this.width;
                if (newW > 10 && Math.abs(newW - current) > 2) this.resize(newW);
            }
        });
        // The scene's own column when graphs sit beside it
        this.resizeObserver.observe(this.stageHost || this.wrapper);
    }

    /** Re-renders at a new internal width (text keeps its pixel size). */
    resize(newW) {
        if (this.viewports) {
            this._layoutViews(newW);
            this.draw();
            return;
        }
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

    /** Sets a param in slider units (as its slider would) and redraws. */
    setParam(key, value, redraw = true) {
        if (this.sliders && this.sliders.paramUIs[key]) {
            this.sliders.setValue(key, value, false);
        } else {
            const def = this.config.params && this.config.params[key];
            this.params[key] = value * paramScale(def);
        }
        if (redraw) this.requestDraw();
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
        if (!this.viewports) {
            this._drawView(true);
            return;
        }
        // Each view in turn, the first one last: dragging and the lightbox work on it
        const base = this.config;
        try {
            for (let i = this.viewports.length - 1; i >= 0; i--) {
                const vp = this.viewports[i];
                this._useViewport(vp);
                this.config = vp.config;
                this._drawView(i === 0);
            }
        } finally {
            this.config = base;
        }
    }

    /** The frame the current drawing is seen in: its view's, or the one chosen with the frame button. */
    get currentFrame() {
        if (this.viewport && this.viewport.def) return this.viewport.def.frame;
        const names = this.frameDefs ? Object.keys(this.frameDefs) : [];
        return names.length ? this.frameDefs[names[this.frameIndex]] : null;
    }

    /** Draws the scene in the current viewport; `main` also updates what sits outside it. */
    _drawView(main) {
        [this.bgGroup, this.gridGroup, this.axesGroup, this.debugGroup, this.compareGroup, ...Object.values(this.layerGroups)]
            .forEach(g => { g.textContent = ""; });

        const cs = this._computeTransform();
        this.transform = cs;
        // Labels and lines drawn so far, so later labels can avoid them
        this._placed = { boxes: [], segs: [], w: this.width, h: this.height };

        this._svg("rect", { x: 0, y: 0, width: this.width, height: this.height, fill: "none", class: "matephis-plot-bg" }, this.bgGroup);

        this._drawGrid(cs);
        this._drawAxes(cs);
        this._notes = [];
        this._drawObjects(cs, main);
        if (!main) return;
        if (this.noteEl) {
            this.noteEl.textContent = this._notes.length ? `Perpendicolari al disegno: ${this._notes.join(', ')}` : '';
        }
        if (this.readouts) this.readouts.update();
        if (this.graphs) this.graphs.update();
        if (this.controls) this.controls.update();
        if (this.config.debug && !this._viewT) this._drawDebug(cs);

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
            if (b.x < 0 || b.y < 0 || b.x + b.w > this._placed.w || b.y + b.h > this._placed.h) return false;
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
            /** How many ⊙/⊗ symbols are already at this screen point (they go side by side). */
            oopSlot: (c) => {
                const list = this._placed.oop || (this._placed.oop = []);
                const n = list.filter(q => Math.hypot(q.x - c.x, q.y - c.y) < 3).length;
                list.push(c);
                return n;
            },
            /** With "outOfPlane": "note", vectors perpendicular to the drawing are listed under it. */
            note: (obj, st, value) => {
                const name = plainLabel(obj.label !== undefined ? obj.label : obj.id || st.kind);
                this._notes.push(`${name} = ${value} (${st.vec.z > 0 ? 'uscente' : 'entrante'})`);
            },
            types: OBJECT_TYPES,
            /** Colours for action–reaction pairs: distinct from the default force colour. */
            pairColor: (i) => {
                const d = this.palettes.default;
                return adaptColorForTheme([d[0], d[2], d[3], d[4]][i % 4], this._isDark());
            },
            /** Colour i of the default palette (blue, red, green, orange, purple). */
            paletteColor: (i) => {
                const d = this.palettes.default;
                return adaptColorForTheme(d[i % d.length], this._isDark());
            },
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

    /**
     * Is an object drawn? `ignoreHidden` skips "hidden" (a free-body diagram
     * with "forces": "all" shows forces hidden in the scene); "show" still applies.
     */
    _isShown(obj, ignoreHidden = false) {
        // A decomposition shortcut follows its vector
        if (obj.__parent && !this._isShown(obj.__parent, ignoreHidden)) return false;
        // An object with its own button starts hidden
        const hidden = obj.hidden === true || (obj.button !== undefined && obj.button !== false) || obj.click === true;
        const revealed = (this.controls && this.controls.isRevealed(obj)) || (this._clicked && this._clicked.has(obj));
        if (!ignoreHidden && hidden && !revealed) return false;
        if (obj.show === undefined) return true;
        const v = typeof obj.show === 'boolean' ? obj.show : this.resolver.num(obj.show, `${describe(obj)} show`);
        return !!v && !Number.isNaN(v);
    }

    /**
     * "compare": [{ "mu": 0 }, { "mu": 0.3, "label": "con attrito" }] draws the
     * scene again for each set of params (slider units), faded and without
     * labels, on the same clock. Each set has its own simulation.
     */
    _initCompare(stateNames) {
        const sets = Array.isArray(this.config.compare) ? this.config.compare : [];
        const defs = this.config.params || {};
        let slot = 0;
        this.compareSets = sets.map((set, i) => {
            if (!set || typeof set !== 'object') {
                this._addWarning(`compare[${i}]: a set of params, like { "mu": 0 }`);
                return null;
            }
            const values = Object.entries(set).filter(([k]) => k !== 'label');
            values.forEach(([k]) => {
                if (!defs[k] && k !== 'g') this._addWarning(`compare[${i}]: no param '${k}'`);
            });
            const text = set.label !== undefined ? String(set.label) : values.map(([k, v]) => {
                const d = defs[k] || {};
                const unit = d.unit === 'deg' ? '°' : d.unit ? ` ${d.unit}` : '';
                return `${d.label || k} = ${v}${unit}`;
            }).join(', ');
            slot += 1;
            return { values, text, sim: stateNames ? new Simulation(this, stateNames, { graphSlot: slot }) : null };
        }).filter(Boolean);
        if (!this.compareSets.length) return;
        this.compareEl = document.createElement('div');
        this.compareEl.className = 'matephis-physics-note';
        this.compareEl.textContent = `Sbiadito: ${this.compareSets.map(c => c.text).join('; ')}`;
    }

    /** Params of a compare set: the current ones with its values (slider units) on top. */
    _compareParams(c) {
        const p = { ...this.params };
        const defs = this.config.params || {};
        c.values.forEach(([k, v]) => {
            const n = this._num(v, `compare ${k}`);
            p[k] = defs[k] ? n * paramScale(defs[k]) : n;
        });
        return p;
    }

    /** Draws the compare sets, faded, with the main scene's vector scales. */
    _drawCompare(view, ctx, scales) {
        const r = this.resolver;
        const base = this.params;
        const t = this.sim ? this.sim.t : 0;
        let end = 0;
        const saved = this._placed;
        this._placed = { boxes: [], segs: [], w: this.width, h: this.height };
        try {
            this.compareSets.forEach(c => {
                this.params = this._compareParams(c);
                if (c.sim) {
                    c.sim.prepare(view);
                    c.sim.seek(t);
                    c.sim.prepare(view);
                    end = Math.max(end, c.sim.tEnd);
                    r.timeline = c.sim.timeline();
                }
                const states = r.resolveAll(view);
                r.scales = scales;
                // The readouts of this set, at its own state
                if (this.readouts) this.readouts.collect(c);
                const g = this._svg('g', { opacity: 0.35 }, this.compareGroup);
                r.objects.forEach(obj => {
                    const def = OBJECT_TYPES[obj.type];
                    const st = states.get(obj);
                    // The bodies and what moves with them; surroundings, panels and labels once
                    if (!st || def.panel || def.layer === 'environment' || ['label', 'dimension', 'angle', 'frame'].includes(obj.type)) return;
                    if (!this._isShown(obj)) return;
                    try {
                        def.render({ ...obj, label: undefined, showValue: false, angleLabel: undefined }, st, ctx, g);
                    } catch (e) { /* the main scene reports problems */ }
                });
            });
        } finally {
            this.params = base;
            this._placed = saved;
        }
        // The clock runs until the longest of the runs ends
        if (this.sim) this.sim.extraEnd = end;
    }

    _drawObjects(cs, main = true) {
        const r = this.resolver;
        const view = { xMin: cs.xMin, xMax: cs.xMax, yMin: cs.yMin, yMax: cs.yMax };
        const vdef = this.viewport ? this.viewport.def : null;
        const frame = this.currentFrame;
        const plain = (!vdef || vdef.view === 'front') && !(frame && frame.of);
        if (plain && this.compareSets && this.compareSets.length) {
            // The main scene first, for its scales; then the faded sets; then the main scene again
            if (this.sim) { this.sim.prepare(view); r.timeline = this.sim.timeline(); }
            r.resolveAll(view);
            this._drawCompare(view, this._renderContext(cs), r.scales);
        }
        if (this.sim) {
            // Recomputes the motion if a param changed, then puts t and the state into the params
            this.sim.prepare(view);
            r.timeline = this.sim.timeline();
            // In a frame: velocities and accelerations measured there (forces do not change)
            if (frame && frame.of && this.sim.frameStarts) {
                r.timeline.kinView = this.sim.kinInFrame(frame, view);
                const gf = this.sim.ghostsInFrame && this.sim.ghostsInFrame.get(frame.name);
                if (gf) r.timeline.ghosts = gf;
            }
            if (this.clock) this.clock.update();
        }
        const world = r.resolveAll({ xMin: cs.xMin, xMax: cs.xMax, yMin: cs.yMin, yMax: cs.yMax });
        // Seen from another side or from a moving frame: the states as that view sees them
        const T = this._viewTransformFor(vdef, frame, world);
        this._viewT = T;
        const states = T ? transformStates(world, T) : world;
        if (T) r.states = states;
        try {
            this._renderObjects(cs, states, main, T, frame);
        } finally {
            if (T) r.states = world;
        }
    }

    /** The transform of the current view (null for the plain front view). */
    _viewTransformFor(vdef, frame, world) {
        const view = vdef ? vdef.view : 'front';
        if (!(frame && frame.of)) return viewTransform(view, null);
        const sim = this.sim;
        const start = sim && sim.frameStarts ? sim.frameStarts.get(frame.name) : null;
        const body = this.resolver.objectById(frame.of);
        const now = body ? world.get(body) : null;
        if (!start || !now) return viewTransform(view, null);
        const frameAt = (t) => frameMap(frame, t === null ? { pos: now.com || now.pos, angle: now.angle || 0 } : sim.frameAt(frame, t), start);
        return viewTransform(view, frameAt);
    }

    /** Whether an object is drawn in the current view ("views" on it; no ground seen from above). */
    _inView(obj) {
        const vdef = this.viewport ? this.viewport.def : null;
        if (!vdef) return true;
        if (Array.isArray(obj.views)) return obj.views.includes(vdef.view) || (vdef.id !== undefined && obj.views.includes(vdef.id));
        if (vdef.view !== 'front' && obj.type === 'angle') return false;
        return !(vdef.view === 'top' && OBJECT_TYPES[obj.type].layer === 'environment');
    }

    _renderObjects(cs, states, main, T, frame) {
        const r = this.resolver;
        const ctx = this._renderContext(cs);
        // Overlapping vectors on the same line are spread sideways
        const segs = [];
        r.objects.forEach(obj => {
            const st = states.get(obj);
            if (!st || !st.vec || st.outOfPlane || !this._isShown(obj)) return;
            const k = obj.scale !== undefined ? r.num(obj.scale, 'scale') : r.scales[st.kind];
            const w = { x: st.vec.x * k, y: st.vec.y * k };
            const a = obj.tail === 'tip' ? { x: st.pos.x - w.x, y: st.pos.y - w.y } : st.pos;
            segs.push({ key: obj, a, b: { x: a.x + w.x, y: a.y + w.y } });
        });
        // Apparent forces of the frame, so they do not lie on top of the others
        const fict = frame && frame.fictitious && !frame.rotate ? this._fictitiousForces(states, frame, T) : [];
        fict.forEach(f => {
            const k = r.scales.force;
            segs.push({ key: f, a: f.pos, b: { x: f.pos.x + f.vec.x * k, y: f.pos.y + f.vec.y * k } });
        });
        const offsets = collinearOffsets(segs, this.pxPerMetre);
        ctx.vectorOffset = (obj) => offsets.get(obj) || 0;
        const panels = [];
        // Layer by layer (list order within a layer), so labels placed in upper
        // layers already see the lines drawn underneath
        const layerOf = (obj) => (LAYERS.includes(obj.layer) ? obj.layer : OBJECT_TYPES[obj.type].layer);
        const ordered = r.objects.map((obj, index) => [obj, index])
            .sort((p, q) => LAYERS.indexOf(layerOf(p[0])) - LAYERS.indexOf(layerOf(q[0])) || p[1] - q[1]);
        ordered.forEach(([obj, index]) => {
            const state = states.get(obj);
            if (!state || !this._isShown(obj) || !this._inView(obj)) return;
            const def = OBJECT_TYPES[obj.type];
            // Panel types draw beside the scene; some also mark the scene (an energy zero level)
            if (def.panel) panels.push([obj, state]);
            if (def.panel && obj.type === 'fbd') return;
            const layer = layerOf(obj);
            const g = this._svg("g", { class: `matephis-physics-${obj.type}` }, this.layerGroups[layer]);
            if (obj.opacity !== undefined) g.setAttribute("opacity", r.num(obj.opacity, `${describe(obj)} opacity`));
            if (obj.drag !== undefined && this.dragger && main && !T) {
                g.setAttribute('data-drag', index);
                g.classList.add('mp-draggable');
            }
            // A body whose free-body diagram opens with a click (fbd with "click": true)
            const fbd = main && obj.id !== undefined ? r.objects.find(o => o.type === 'fbd' && o.click === true && o.of === obj.id) : null;
            if (fbd) {
                g.setAttribute('data-fbd', r.objects.indexOf(fbd));
                g.classList.add('mp-clickable');
                g.setAttribute('tabindex', '0');
                g.setAttribute('role', 'button');
                g.setAttribute('aria-pressed', String(!!(this._clicked && this._clicked.has(fbd))));
                g.setAttribute('aria-label', `Corpo libero di ${plainLabel(obj.label !== undefined ? obj.label : obj.id)}`);
                if (this._refocus === g.getAttribute('data-fbd')) {
                    this._refocus = null;
                    g.focus({ preventScroll: true });
                }
            }
            try {
                def.render(obj, state, ctx, g);
            } catch (e) {
                this._addWarning(`${describe(obj)}: ${e.message}`);
            }
        });
        if (fict.length) this._drawFictitious(ctx, fict);
        // Panels sit outside the views: once, from the main one
        if (!main) return;
        this.panelHost.textContent = '';
        panels.filter(([obj]) => obj.type !== 'fbd').forEach(([obj, st]) => {
            try {
                OBJECT_TYPES[obj.type].renderPanel(obj, st, ctx, this.panelHost);
            } catch (e) {
                this._addWarning(`${describe(obj)}: ${e.message}`);
            }
        });
        const fbds = panels.filter(([obj]) => obj.type === 'fbd');
        if (!fbds.length) return;
        // One scale for all the panels of a scene, as large as the tightest fit allows,
        // so forces keep their proportions from one diagram to the next
        const fits = fbds.map(([obj, st]) => {
            const { box } = this._freeBodyItems(obj, st);
            const room = this._panelSize(obj) - 2 * 34;
            const span = Math.max(box.x1 - box.x0, box.y1 - box.y0);
            return span > 0 ? room / span : Infinity;
        });
        // "scale": "own" fits a panel by itself (its forces are not compared with the others')
        const shared = fits.filter((f, i) => fbds[i][0].scale !== 'own');
        let k = shared.length ? Math.min(...shared) : Infinity;
        if (!isFinite(k)) k = this.pxPerMetre;
        fbds.forEach(([obj, st], i) => this._drawFreeBody(obj, st, ctx, obj.scale === 'own' && isFinite(fits[i]) ? fits[i] : k));
    }

    /**
     * In an accelerating (not rotating) frame: −m a of the frame on each body
     * with automatic forces, as {pos, vec} in the view's coordinates.
     */
    _fictitiousForces(states, frame, T) {
        const r = this.resolver;
        const k = r.timeline && r.timeline.kin.get(frame.of);
        if (!k || Math.hypot(k.a.x, k.a.y, k.a.z || 0) < 1e-9) return [];
        return r.objects.filter(o => o.forces === 'auto' && o.id !== frame.of).map(o => {
            const st = states.get(o);
            if (!st || !this._isShown(o) || !this._inView(o)) return null;
            const F = scaleVec(k.a, -massOf(o, r));
            return { pos: st.com || st.pos, vec: T ? T.vec(F) : F };
        }).filter(Boolean);
    }

    /** The apparent forces: dashed, labelled, in the lanes worked out with the other vectors. */
    _drawFictitious(ctx, forces) {
        const g = this._svg('g', { class: 'matephis-physics-fictitious' }, this.layerGroups.annotations);
        forces.forEach(f => {
            const off = ctx.vectorOffset ? ctx.vectorOffset(f) : 0;
            const n = Math.hypot(f.vec.x, f.vec.y) || 1;
            const pos = off ? { ...f.pos, x: f.pos.x - f.vec.y / n * off / this.pxPerMetre, y: f.pos.y + f.vec.x / n * off / this.pxPerMetre } : f.pos;
            drawVector(ctx, pos, f.vec, this.resolver.scales.force, {
                color: this._kindColor('force'), head: 'filled', width: 2, dash: '6 4', label: '\\vec F_{app}',
            }, g);
        });
    }

    _panelSize(obj) {
        return obj.size !== undefined ? this.resolver.num(obj.size, 'fbd size') : 200;
    }

    /**
     * Forces drawn in a free-body panel and the box (metres, relative to the
     * body's centre) that holds them, their points and, with the shape, the body.
     */
    _freeBodyItems(obj, st) {
        const r = this.resolver;
        const shape = obj.shape === true;
        // "forces": "all" also shows the forces hidden in the scene
        const all = obj.forces === 'all';
        const items = st.forces.filter(o => this._isShown(o, all)).map(o => [o, r.states.get(o)]).filter(([, s]) => s);
        const c0 = st.pos;
        const box = { x0: 0, x1: 0, y0: 0, y1: 0 };
        const grow = (x, y) => {
            box.x0 = Math.min(box.x0, x); box.x1 = Math.max(box.x1, x);
            box.y0 = Math.min(box.y0, y); box.y1 = Math.max(box.y1, y);
        };
        items.forEach(([o, s]) => {
            const k = o.scale !== undefined ? r.num(o.scale, 'scale') : r.scales[s.kind];
            const a = shape ? { x: s.pos.x - c0.x, y: s.pos.y - c0.y } : { x: 0, y: 0 };
            grow(a.x, a.y);
            grow(a.x + s.vec.x * k, a.y + s.vec.y * k);
        });
        const half = shape && st.body.w ? Math.hypot(st.body.w, st.body.h) / 2 : shape && st.body.radius ? st.body.radius : 0;
        if (half) { grow(-half, -half); grow(half, half); }
        return { items, box };
    }

    /**
     * Free-body diagram panel: the body as a point (or its outline with
     * "shape": true) and its forces, at `k` pixels per metre.
     */
    _drawFreeBody(obj, st, baseCtx, k) {
        const r = this.resolver;
        const size = this._panelSize(obj);
        const panel = document.createElement('figure');
        panel.className = 'matephis-physics-fbd';
        const svg = createSvgElement('svg', {
            width: size, height: size, viewBox: `0 0 ${size} ${size}`,
            class: 'matephis-plot-svg matephis-physics-svg', role: 'img',
            'aria-label': `Diagramma di corpo libero${obj.label ? `: ${obj.label}` : ''}`,
        });
        svg.style.fontFamily = 'var(--font-plot, monospace)';
        panel.appendChild(svg);
        this.panelHost.appendChild(panel);

        const shape = obj.shape === true;
        const { items, box } = this._freeBodyItems(obj, st);
        // Centred on what is drawn, not on the body: forces often reach out on one side
        const c0 = st.pos;
        const mid = { x: c0.x + (box.x0 + box.x1) / 2, y: c0.y + (box.y0 + box.y1) / 2 };
        const ctx = {
            ...baseCtx, pxPerMetre: k, vectorOffset: () => 0,
            map: (p) => ({ x: size / 2 + (p.x - mid.x) * k, y: size / 2 - (p.y - mid.y) * k }),
        };
        ctx.obstaclePath = (pts) => {
            for (let i = 1; i < pts.length; i++) this._placed.segs.push([ctx.map(pts[i - 1]), ctx.map(pts[i])]);
        };

        // Forces on the same line (for instance weight and normal with the shape) go into lanes
        const segs = items.map(([o, s]) => {
            const kk = o.scale !== undefined ? r.num(o.scale, 'scale') : r.scales[s.kind];
            const a = shape ? s.pos : c0;
            return { key: o, a, b: { x: a.x + s.vec.x * kk, y: a.y + s.vec.y * kk } };
        });
        const offsets = collinearOffsets(segs, k);
        ctx.vectorOffset = (o) => offsets.get(o) || 0;

        const saved = this._placed;
        this._placed = { boxes: [], segs: [], w: size, h: size };
        try {
            const g = createSvgElement('g', {});
            svg.appendChild(g);
            const bodyDef = OBJECT_TYPES[st.bodyObj.type];
            if (shape && ['block', 'ball', 'cart', 'disk', 'particle'].includes(st.bodyObj.type)) {
                bodyDef.render({ ...st.bodyObj, label: undefined }, st.body, ctx, g);
            } else {
                const c = ctx.map(c0);
                this._svg('circle', { cx: c.x, cy: c.y, r: 4.5, class: 'mp-ink-fill' }, g);
            }
            items.forEach(([o, s]) => {
                OBJECT_TYPES[o.type].render(o, shape ? s : { ...s, pos: c0 }, ctx, g);
            });
        } finally {
            this._placed = saved;
        }
        if (obj.label) {
            const cap = document.createElement('figcaption');
            cap.textContent = obj.label;
            panel.appendChild(cap);
        }
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
        if (this.dragger) this.dragger.destroy();
        if (this.clock) this.clock.destroy();
        if (this.graphs) this.graphs.destroy();
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
