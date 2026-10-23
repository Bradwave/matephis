/**
 * Matephis Plotting Library
 *
 * A lightweight SVG-based plotting library for mathematical visualizations.
 * Supports functions, parametric/polar/implicit curves, points, vectors,
 * angles, interactive pan/zoom, sliders and selections, configured via JSON.
 *
 * This file holds the plot lifecycle (construction, layout, resize, theme,
 * draw orchestration, lightbox, destroy). Rendering and interaction live in
 * mixins:
 *   renderers/grid-renderer.js  grid, axes, numbers
 *   renderers/data-renderer.js  data series, labels, legend
 *   interaction/selection.js    point / slope / tangent selection
 *   interaction/pointer.js      mouse, touch, wheel, keyboard
 *   ui/plot-toolbar.js          toolbar
 */
import { createPalettes, validateConfig, parseAspectRatio, cssLength, adaptColorForTheme } from './config.js';
import { CoordinateSystem } from './coordinate-system.js';
import { ExpressionCompiler, substituteLabel } from '../parser/expression-parser.js';
import { SVG_NS } from '../renderers/svg-factory.js';
import { renderMathJaxLabel } from '../renderers/mathjax-bridge.js';
import { GridMixin } from '../renderers/grid-renderer.js';
import { DataMixin } from '../renderers/data-renderer.js';
import { SelectionMixin } from '../interaction/selection.js';
import { PointerMixin } from '../interaction/pointer.js';
import { ToolbarMixin } from '../ui/plot-toolbar.js';
import { SliderManager } from '../ui/slider-manager.js';
import { LightboxBridge } from '../ui/lightbox-bridge.js';

let uidCounter = 0;

export class MatephisPlot {
    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * @param {HTMLElement} container - element to render into
     * @param {string|object} source - JSON configuration (string or object)
     * @param {object} [options]
     * @param {boolean} [options.observeResize=true]
     * @param {object} [options.params] - live params owned by a host (a physics scene),
     *   read by expressions; the host changes them and calls draw()
     */
    constructor(container, source, options = {}) {
        this.container = container;
        this.config = typeof source === 'string' ? JSON.parse(source) : source;
        this.options = options;
        this.container.innerHTML = "";
        this.container.setAttribute('data-processed', 'true');
        this.uid = `mp${++uidCounter}`;

        const cfg = this.config;

        this.wrapper = document.createElement("div");
        this.wrapper.className = "matephis-plot-container";
        if (cfg.border) this.wrapper.classList.add('bordered');
        if (cfg.interactive) this.wrapper.classList.add('interactive');
        this.wrapper.matephisPlot = this;
        this.container.appendChild(this.wrapper);

        // State
        this.params = options.params || {};
        this.freePoints = {};
        this.vectorState = {};
        this.resolvedPoints = {};
        this.plotData = [];
        this.handles = [];
        this.derivativeTrace = [];
        this.warnings = [];
        this.view = { xMin: null, xMax: null, yMin: null, yMax: null };
        this.interactions = { isDragging: false, draggingSelection: null, draggingHandle: null, currentSelection: null, slopeP1: null, slopeP2: null };
        this.selectionMode = null;
        this.isSnapping = true;
        this.isTracing = false;
        this._listeners = [];

        this.compiler = new ExpressionCompiler({
            getParams: () => this.params,
            getPoints: () => this.resolvedPoints,
            paramNames: [...Object.keys(cfg.params || {}), ...Object.keys(options.params || {})],
            pointNames: (Array.isArray(cfg.data) ? cfg.data : []).map(d => d.name).filter(Boolean),
            complex: cfg.complexMode === true,
        });
        this._initParams();

        this._hasFreePoints = Array.isArray(cfg.data) && cfg.data.some(d =>
            (d.freeCoordinates === true && d.name) || ((d.vector || d.type === 'vector') && d.draggable));

        this._applyLayout();
        this.palettes = createPalettes(this._isDark());
        this._listen(window, 'matephis-theme-change', () => {
            this.palettes = createPalettes(this._isDark());
            this.draw();
        });

        this._initSVG();

        const hasSelection = cfg.pointSelection || cfg.slopeSelection || cfg.tangentSelection || cfg.draggablePoints;
        this.isStatic = !cfg.interactive && !hasSelection && !this._hasFreePoints && !cfg.derivativeToggle;

        if (!this.isStatic) {
            this._initControlsOverlay();
            this._initInteractions();
            this.wrapper.classList.add('interactive');
            this.svg.classList.add('interactive');
            this.svg.classList.remove('static');
            if (!cfg.interactive) this.wrapper.classList.add('no-pan');
        }
        if (cfg.params && cfg.showSliders !== false) {
            this.sliders = new SliderManager(this);
            this.sliders.init();
            this.paramUIs = this.sliders.paramUIs;
        }

        this.lightbox = new LightboxBridge(this);
        // Static plots (and plots that only have sliders) open fullscreen on click
        if (!cfg.interactive && !hasSelection && !this._hasFreePoints && !options.noLightbox) {
            this.svg.classList.add('zoomable');
            this.svg.addEventListener('click', () => { if (!this.inLightbox) this.toggleLightbox(); });
        }

        if (cfg.caption) {
            const cap = document.createElement('div');
            cap.className = 'matephis-plot-caption';
            cap.textContent = cfg.caption;
            this.wrapper.appendChild(cap);
        }

        this.warnings = validateConfig(cfg, this.palettes);
        this.draw();
        this._renderWarnings();

        if (options.observeResize !== false) this._initResizeObserver();
        if (cfg.addDerivativePlot) this._initDerivativePlot();
    }

    // =========================================================================
    // STATIC INITIALIZATION
    // =========================================================================

    /**
     * Scans the document (or `root`) for plot containers and initializes them.
     * Handles explicit `.matephis-plot` divs and `language-matephis` code blocks.
     * Blocks with a "plots" array become a MatephisPlotGroup.
     */
    static init(root = document) {
        const create = (container, source) => {
            const cfg = JSON.parse(source);
            if (Array.isArray(cfg.plots) && MatephisPlot.Group) return new MatephisPlot.Group(container, cfg);
            return new MatephisPlot(container, cfg);
        };
        const showError = (el, e) => {
            const div = document.createElement('div');
            div.className = 'matephis-plot-error';
            div.textContent = `Errore nel grafico: ${e.message}`;
            el.appendChild(div);
        };

        root.querySelectorAll('.matephis-plot').forEach(container => {
            if (container.getAttribute('data-processed')) return;
            const source = container.textContent;
            container.setAttribute('data-processed', 'true');
            try {
                container.innerHTML = "";
                create(container, source);
            } catch (e) {
                console.error("Plot Error", e);
                showError(container, e);
            }
        });

        root.querySelectorAll('code.language-matephis').forEach(code => {
            const target = code.closest('div.language-matephis') || code.closest('pre') || code.parentElement;
            if (target.getAttribute('data-processed')) return;
            target.setAttribute('data-processed', 'true');
            const container = document.createElement('div');
            container.className = 'matephis-plot';
            container.setAttribute('data-processed', 'true');
            target.parentNode.insertBefore(container, target);
            target.style.display = 'none';
            try {
                create(container, code.textContent);
            } catch (e) {
                console.error("Code Block Plot Error", e);
                showError(container, e);
            }
        });
    }

    /**
     * Renders one plot (or group) into an element: the entry point for hosts
     * such as an Obsidian plugin. Returns the instance (call .destroy() on unload).
     */
    static render(el, source, options = {}) {
        const cfg = typeof source === 'string' ? JSON.parse(source) : source;
        if (Array.isArray(cfg.plots) && MatephisPlot.Group) return new MatephisPlot.Group(el, cfg, options);
        return new MatephisPlot(el, cfg, options);
    }

    // =========================================================================
    // SETUP
    // =========================================================================

    _listen(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        this._listeners.push([target, type, fn, opts]);
    }

    /** Evaluates initial parameter values (they may be expressions: "2*PI"). */
    _initParams() {
        SliderManager.initValues(this.config.params || {}, this.params, (v, ctx) => this._eval(v, ctx));
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

    /** Height for a given width, from aspectRatio / height / square default. */
    _heightFor(width) {
        const ratio = parseAspectRatio(this.config.aspectRatio);
        if (ratio) return width / ratio;
        if (this.config.height && this.config.width) return width * (this.config.height / this.config.width);
        if (this.config.height) return this.config.height;
        return width;
    }

    _computePadding() {
        const cfg = this.config;
        const noNumbers = cfg.showXNumbers === false && cfg.showYNumbers === false;
        const defaultPad = (noNumbers && !cfg.axisLabels) ? 10 : 20;
        this.padding = (cfg.padding !== undefined && cfg.padding !== 'auto') ? cfg.padding : defaultPad;
        this.padL = this.padR = this.padT = this.padB = this.padding;

        if (cfg.padding === 'auto') {
            const hasXLab = cfg.axisLabels && cfg.axisLabels[0];
            const hasYLab = (cfg.axisLabels && cfg.axisLabels[1]) || (cfg.isDerivativePlot && cfg.slopeLabel);
            const hasXUnit = cfg.axisUnitMeasures && cfg.axisUnitMeasures[0];
            const hasYUnit = (cfg.axisUnitMeasures && cfg.axisUnitMeasures[1]) || (cfg.isDerivativePlot && cfg.slopeUnitMeasure);
            if (cfg.boxPlot && !cfg.boxNumbersInside) { this.padL = 45; this.padB = 40; }
            if (hasYLab || hasYUnit) this.padT = cfg.boxPlot ? 45 : 35;
            if (hasXLab || hasXUnit) this.padR = 55;
        }
    }

    _initSVG() {
        const cfg = this.config;
        let targetWidth = cfg.width || 600;
        if (cfg.fullWidth) {
            const cw = this.wrapper.clientWidth;
            targetWidth = cw > 50 ? cw : (window.innerWidth > 0 ? window.innerWidth : 1000);
        }
        this.width = Math.max(50, targetWidth);
        this.height = Math.max(50, this._heightFor(this.width));
        this._computePadding();

        const el = (tag) => document.createElementNS(SVG_NS, tag);
        this.svg = el("svg");
        this.svg.setAttribute("width", this.width);
        this.svg.setAttribute("height", this.height);
        this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
        this.svg.setAttribute("class", "matephis-plot-svg static");
        this.svg.setAttribute("role", "img");
        this.svg.setAttribute("aria-label", cfg.ariaLabel || cfg.title || this._describe());
        this.svg.style.fontFamily = "var(--font-plot, monospace)";

        this.bgGroup = el("g");
        this.secondaryGridGroup = el("g");
        this.gridGroup = el("g");
        this.axesGroup = el("g");
        this.numbersGroup = el("g");
        this.dataGroup = el("g");
        this.selectionGroup = el("g");
        this.labelGroup = el("g");
        this.legendGroup = el("g");
        this.gridGroup.setAttribute("class", "matephis-plot-grid");
        this.axesGroup.setAttribute("class", "matephis-plot-axes");
        this.numbersGroup.setAttribute("class", "matephis-plot-numbers");

        // Clip data and selections to the plot area
        const defs = el("defs");
        const clipPath = el("clipPath");
        clipPath.setAttribute("id", `clip_${this.uid}`);
        this.clipRect = el("rect");
        clipPath.appendChild(this.clipRect);
        defs.appendChild(clipPath);
        this.svg.appendChild(defs);
        this._svgDefs = defs;
        this.dataGroup.setAttribute("clip-path", `url(#clip_${this.uid})`);
        this.selectionGroup.setAttribute("clip-path", `url(#clip_${this.uid})`);
        this._updateClip();

        [this.bgGroup, this.secondaryGridGroup, this.gridGroup, this.axesGroup].forEach(g => this.svg.appendChild(g));
        if (cfg.renderOrder === 'numbers-top') {
            this.svg.appendChild(this.dataGroup);
            this.svg.appendChild(this.numbersGroup);
        } else {
            this.svg.appendChild(this.numbersGroup);
            this.svg.appendChild(this.dataGroup);
        }
        this.svg.appendChild(this.selectionGroup);
        this.svg.appendChild(this.labelGroup);
        this.svg.appendChild(this.legendGroup);

        this.plotStage = document.createElement("div");
        this.plotStage.className = "matephis-plot-stage";
        this.plotStage.appendChild(this.svg);
        this.hintEl = document.createElement("div");
        this.hintEl.className = "matephis-plot-hint";
        this.hintEl.setAttribute("aria-hidden", "true");
        this.plotStage.appendChild(this.hintEl);
        this.wrapper.appendChild(this.plotStage);
    }

    _updateClip() {
        this.clipRect.setAttribute("x", this.padL);
        this.clipRect.setAttribute("y", this.padT);
        this.clipRect.setAttribute("width", Math.max(0, this.width - this.padL - this.padR));
        this.clipRect.setAttribute("height", Math.max(0, this.height - this.padT - this.padB));
    }

    /** Short automatic description for screen readers. */
    _describe() {
        const items = (this.config.data || []).map(d => d.label || d.fn || d.implicit || (d.parametric && 'curva parametrica') || (d.vector && 'vettore') || (d.points && 'punti')).filter(Boolean);
        return items.length ? `Grafico: ${items.slice(0, 5).join(', ')}` : 'Grafico';
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
        this.height = Math.max(50, this._heightFor(newW));
        this.svg.setAttribute("width", this.width);
        this.svg.setAttribute("height", this.height);
        this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
        this._updateClip();
        this.draw();
        if (this.lightbox && this.lightbox.isOpen) this.lightbox._fit();
    }

    // =========================================================================
    // DERIVATIVE PLOT
    // =========================================================================

    _initDerivativePlot() {
        const div = document.createElement("div");
        div.className = "matephis-derivative-plot";
        this.wrapper.appendChild(div);

        const cfg = JSON.parse(JSON.stringify(this.config));
        ['addDerivativePlot', 'traceDerivative', 'title', 'slopeSelection', 'tangentSelection', 'pointSelection',
            'fullWidth', 'height', 'align', 'marginLeft', 'marginRight', 'marginBottom', 'border', 'derivativeToggle', 'download']
            .forEach(k => delete cfg[k]);

        // Only functions and interpolations carry over
        if (Array.isArray(cfg.data)) cfg.data = cfg.data.filter(item => item.fn || item.type === 'interpolation');

        Object.assign(cfg, {
            legend: false, showSliders: false, showToolbar: false, showPoints: false,
            width: this.width, cssWidth: "100%",
            showDerivative: this.config.showDerivativeFunction !== false,
            hideFunctions: true, isDerivativePlot: true,
            aspectRatio: this.config.derivativeAspectRatio !== undefined ? this.config.derivativeAspectRatio : 2.5,
            showXAxis: true, showYAxis: true,
        });
        if (this.config.derivativeYLim) cfg.ylim = this.config.derivativeYLim;
        else if (this.config.derivativeAutoY) cfg.ylim = [-10, 10];
        // Interactive only through the main plot
        delete cfg.interactive;

        if (this.config.derivativeTitle) {
            const titleDiv = document.createElement("div");
            titleDiv.className = "matephis-derivative-title";
            titleDiv.textContent = this.config.derivativeTitle;
            div.appendChild(titleDiv);
        }
        const host = document.createElement("div");
        div.appendChild(host);
        this.derivativePlot = new MatephisPlot(host, cfg, { noLightbox: true });
        // Share the live parameter values with the main plot (its compiler reads them lazily)
        this.derivativePlot.params = this.params;
        this._syncDerivativePlot();
    }

    _syncDerivativePlot() {
        const dp = this.derivativePlot;
        if (!dp) return;
        dp.view.xMin = this.transform.xMin;
        dp.view.xMax = this.transform.xMax;
        dp.draw();
    }

    // =========================================================================
    // EXPRESSIONS, COLORS, THEME
    // =========================================================================

    /** Evaluates a value or expression; reports problems once as warnings. */
    _eval(val, context = "value") {
        if (typeof val === 'number') return val;
        try {
            return this.compiler.eval(val);
        } catch (e) {
            this._addWarning(`${context}: ${e.message}`);
            return NaN;
        }
    }

    _substituteLabel(str) {
        return substituteLabel(str, this.resolvedPoints);
    }

    /** Dark theme? Hosts can override with MatephisPlot.isDarkHook = () => boolean. */
    _isDark() {
        if (this.config.theme === 'dark') return true;
        if (typeof MatephisPlot.isDarkHook === 'function') return !!MatephisPlot.isDarkHook();
        return typeof document !== 'undefined' && (
            document.documentElement.getAttribute('data-theme') === 'dark' || this.config.theme === 'dark');
    }

    /** Lightens dark colors in dark mode so they stay readable. */
    _adaptColorForTheme(color) {
        return adaptColorForTheme(color, this._isDark());
    }

    _getColor(index, explicit) {
        if (explicit) {
            const named = this.palettes[explicit];
            if (typeof named === 'string') return this._adaptColorForTheme(named);
            if (Array.isArray(named)) return this._adaptColorForTheme(named[0]);
            return this._adaptColorForTheme(explicit);
        }
        const palette = this.palettes[this.config.theme || "red"] || this.palettes.default;
        return this._adaptColorForTheme(palette[index % palette.length]);
    }

    _getConfigSize(specificKey) {
        const v = this.config[specificKey] || this.config.fontSize;
        if (v) return typeof v === 'number' ? v : parseInt(v, 10);
        return 14;
    }

    // =========================================================================
    // SVG PRIMITIVES
    // =========================================================================

    _circle(cx, cy, r, color, width, dash, parent) {
        const c = document.createElementNS(SVG_NS, "circle");
        c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", r);
        c.setAttribute("stroke", color || "#000");
        c.setAttribute("stroke-width", width !== undefined ? width : 1);
        c.setAttribute("fill", "none");
        if (dash) c.setAttribute("stroke-dasharray", dash);
        parent.appendChild(c);
        return c;
    }

    _line(x1, y1, x2, y2, color, width, dash, parent) {
        const l = document.createElementNS(SVG_NS, "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        l.setAttribute("stroke", color);
        l.setAttribute("stroke-width", width);
        if (dash) l.setAttribute("stroke-dasharray", dash);
        if (parent === this.axesGroup) l.setAttribute("class", "matephis-plot-axis");
        else if (parent === this.gridGroup) l.setAttribute("class", "matephis-plot-grid-line");
        parent.appendChild(l);
        return l;
    }

    /** SVG text with a halo (paint-order stroke) for readability over the grid. */
    _text(x, y, str, anchor, baseline, color, weight = "normal", style = "normal", parent = this.axesGroup, size = null, outline = true) {
        const dark = this._isDark();
        const t = document.createElementNS(SVG_NS, "text");
        t.setAttribute("x", x);
        t.setAttribute("y", y);
        t.setAttribute("class", parent === this.numbersGroup ? "matephis-plot-number matephis-plot-text" : "matephis-plot-text");
        if (parent === this.numbersGroup && dark && (color === "#666" || color === "#333")) color = "#e2e8f0";
        t.setAttribute("text-anchor", anchor);
        // "top"/"bottom" are not valid dominant-baseline values; browsers used "auto"
        t.setAttribute("dominant-baseline", baseline === 'top' || baseline === 'bottom' ? 'auto' : baseline);
        t.setAttribute("fill", color);
        t.setAttribute("font-size", size !== null ? `${size}px` : "18px");
        t.setAttribute("font-weight", weight);
        t.setAttribute("font-style", style);
        t.textContent = str;
        if (outline) {
            t.style.paintOrder = "stroke";
            t.style.stroke = dark ? "#181818" : "#fff";
            t.style.strokeWidth = "2.5px";
        }
        parent.appendChild(t);
        return t;
    }

    _renderMathJax(text, x, y, baseSize, color, anchor, baseline, parent) {
        // "labelHalo": true outlines formulas like plain labels (off by default in plots)
        const halo = this.config.labelHalo === true ? { color: this._isDark() ? "#181818" : "#fff" } : null;
        return renderMathJaxLabel(text, x, y, baseSize, color, anchor, baseline, parent,
            () => this._text(x, y, text, anchor, baseline, color, "normal", "normal", parent, baseSize), { halo });
    }

    // =========================================================================
    // DRAWING
    // =========================================================================

    /** Coalesces redraws to one per animation frame (pointer moves, sliders). */
    requestDraw() {
        if (this._drawQueued) return;
        this._drawQueued = true;
        requestAnimationFrame(() => {
            this._drawQueued = false;
            if (!this._destroyed) this.draw();
        });
    }

    _computeTransform() {
        const cfg = this.config;
        if (this.view.xMin === null) {
            this.view = {
                xMin: cfg.xlim ? cfg.xlim[0] : -9.9, xMax: cfg.xlim ? cfg.xlim[1] : 9.9,
                yMin: cfg.ylim ? cfg.ylim[0] : -9.9, yMax: cfg.ylim ? cfg.ylim[1] : 9.9
            };
        }
        return new CoordinateSystem({
            width: this.width, height: this.height,
            padL: this.padL, padR: this.padR, padT: this.padT, padB: this.padB,
            view: this.view, equalAspect: cfg.equalAspect,
            xScale: cfg.xScale, yScale: cfg.yScale,
        });
    }

    draw() {
        if (this._destroyed) return;
        [this.gridGroup, this.secondaryGridGroup, this.dataGroup, this.axesGroup, this.numbersGroup,
            this.labelGroup, this.legendGroup, this.bgGroup].forEach(g => { g.textContent = ""; });

        this.plotData = [];
        this.handles = [];
        this.resolvedPoints = Object.assign({}, this.freePoints);

        const cs = this._computeTransform();
        this.transform = cs;

        const bg = document.createElementNS(SVG_NS, "rect");
        bg.setAttribute("x", 0); bg.setAttribute("y", 0);
        bg.setAttribute("width", this.width); bg.setAttribute("height", this.height);
        bg.setAttribute("fill", "none");
        bg.setAttribute("class", "matephis-plot-bg");
        this.bgGroup.appendChild(bg);

        this._inDraw = true;
        try {
            this._resolveNamedObjects();
            this._drawGridAndAxes(cs);
            this._drawData(cs);
            this._restoreSelectionVisuals();
        } finally {
            this._inDraw = false;
        }

        // Redraws the derivative plot once, after selections updated its data
        if (this.derivativePlot) this._syncDerivativePlot();
        if (this._warningsDirty) this._renderWarnings();
    }

    // =========================================================================
    // LIGHTBOX, EXPORT, LIFECYCLE
    // =========================================================================

    get inLightbox() {
        return !!(this.lightbox && this.lightbox.isOpen);
    }

    toggleLightbox() {
        if (this.inLightbox) this.lightbox.close();
        else this.lightbox.open();
    }

    /** Kept for backwards compatibility. */
    _openLightbox() {
        this.lightbox.open();
    }

    _onLightboxChange(open) {
        this.svg.classList.toggle('zoomable', !open && !this.config.interactive && !this._hasFreePoints);
    }

    /** Standalone SVG markup (fonts and colors inlined) for download / print. */
    toSVGString() {
        const clone = this.svg.cloneNode(true);
        clone.removeAttribute('class');
        clone.setAttribute('font-family', getComputedStyle(this.svg).fontFamily || 'monospace');
        const bg = clone.querySelector('.matephis-plot-bg');
        if (bg) bg.setAttribute('fill', this._isDark() ? '#181818' : '#fff');
        return new XMLSerializer().serializeToString(clone);
    }

    downloadSVG(filename = 'grafico.svg') {
        const blob = new Blob([this.toSVGString()], { type: 'image/svg+xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    /** Removes listeners, observers and animations (hosts that re-render: Obsidian). */
    destroy() {
        this._destroyed = true;
        if (this.lightbox && this.lightbox.isOpen) this.lightbox.close();
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.sliders) this.sliders.destroy();
        this._listeners.forEach(([t, type, fn, opts]) => t.removeEventListener(type, fn, opts));
        this._listeners = [];
        if (this.derivativePlot) this.derivativePlot.destroy();
        this.container.innerHTML = "";
    }

    // =========================================================================
    // WARNINGS
    // =========================================================================

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
        title.textContent = "⚠️ Plot Warnings:";
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

Object.assign(MatephisPlot.prototype, GridMixin, DataMixin, SelectionMixin, PointerMixin, ToolbarMixin);

export default MatephisPlot;
