/**
 * Matephis Sets Scene
 *
 * Draws a diagram of sets and maps from a JSON configuration: finite sets as
 * ovals with their elements, intervals as segments, rectangles and disks as
 * regions; maps as arrows between elements (or sample points); images,
 * preimages, collisions and properties computed by the model (model.js).
 *
 * Shared with the plot and physics engines (imported, not copied): expression
 * compiler, slider manager, palettes, MathJax bridge, label helpers.
 */
import { ExpressionCompiler } from '../../matephis-plot-src/parser/expression-parser.js';
import { createPalettes, cssLength, adaptColorForTheme } from '../../matephis-plot-src/core/config.js';
import { createSvgElement } from '../../matephis-plot-src/renderers/svg-factory.js';
import { renderMathJaxLabel, hasMathJax } from '../../matephis-plot-src/renderers/mathjax-bridge.js';
import { SliderManager, paramScale } from '../../matephis-plot-src/ui/slider-manager.js';
import { toTeX, estimateTextSize } from '../../matephis-physics-src/core/labels.js';
import { validateConfig } from './config.js';
import { SetsModel } from './model.js';
import { computeLayout, elementOrder } from './layout.js';
import { parseSelector } from './selectors.js';
import { Controls } from '../ui/controls.js';
import { Interaction } from '../ui/interaction.js';
import { drawSets, drawElements, drawHeader } from '../render/sets.js';
import { drawMapArrows, drawRoutedMaps, drawProbes } from '../render/arrows.js';
import { drawLayer, renderProperties, drawPropertyMarks } from '../render/highlights.js';

let uidCounter = 0;

/** Plain colour names, mapped to the site's palette. */
const COLOR_NAMES = {
    green: 'summer7', blue: 'summer3', lightblue: 'summer4', orange: 'summer6', yellow: 'summer5',
    red: 'red1', navy: 'summer2', purple: 'default5', gray: 'black3', grey: 'black3', black: 'black1',
};

/** Default colours of the computed layers. */
export const ROLE_COLORS = { image: 'green', preimage: 'blue', collisions: 'red', probe: 'orange', highlight: 'orange' };

/** A label is math unless it already mixes text and "$...$". */
export function mathLabel(str) {
    const s = String(str);
    return s.includes('$') ? s : `$${s}$`;
}

export class MatephisSets {
    /**
     * @param {HTMLElement} container
     * @param {string|object} source - JSON configuration
     * @param {object} [options]
     * @param {boolean} [options.observeResize=true]
     */
    constructor(container, source, options = {}) {
        this.container = container;
        this.config = typeof source === 'string' ? JSON.parse(source) : source;
        this.options = options;
        this.container.innerHTML = '';
        this.container.setAttribute('data-processed', 'true');
        this.uid = `mps${++uidCounter}`;
        this.params = {};
        this.warnings = [];
        this._listeners = [];
        const cfg = this.config;

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'matephis-plot-container matephis-sets-container';
        if (cfg.border) this.wrapper.classList.add('bordered');
        this.wrapper.matephisSets = this;
        this.container.appendChild(this.wrapper);
        this._applyLayout();

        validateConfig(cfg).forEach(w => this._addWarning(w));

        const paramNames = Object.keys(cfg.params || {});
        this.compiler = new ExpressionCompiler({
            getParams: () => this.params, getPoints: () => ({}), paramNames,
        });
        SliderManager.initValues(cfg.params || {}, this.params, (v, ctx) => this._eval(v, ctx));
        this.model = new SetsModel(cfg, {
            evaluate: (v) => this._num(v, 'value'),
            compile: (src, vars) => this.compiler.fn(src, vars),
            warn: (m) => this._addWarning(m),
        });

        this.palettes = createPalettes(this._isDark());
        this._listen(window, 'matephis-theme-change', () => {
            this.palettes = createPalettes(this._isDark());
            this.draw();
        });

        this._initLayers();
        this._initSVG();

        this.propsEl = document.createElement('div');
        this.propsEl.className = 'matephis-sets-properties';
        this.wrapper.appendChild(this.propsEl);

        if (cfg.caption) {
            const cap = document.createElement('div');
            cap.className = 'matephis-plot-caption';
            cap.textContent = cfg.caption;
            this.wrapper.appendChild(cap);
        }

        if (Array.isArray(cfg.controls) && cfg.controls.length) {
            this.controls = new Controls(this, cfg.controls);
            this.wrapper.appendChild(this.controls.el);
        }
        if (cfg.params && cfg.showSliders !== false) {
            this.sliders = new SliderManager(this);
            this.sliders.init();
        }

        this.interaction = new Interaction(this);
        this.draw();
        if (options.observeResize !== false) this._initResizeObserver();
    }

    /** Scans the document for ```sets code blocks and .matephis-sets divs. */
    static init(root = document) {
        const showError = (el, e) => {
            const div = document.createElement('div');
            div.className = 'matephis-plot-error';
            div.textContent = `Errore nel diagramma: ${e.message}`;
            el.appendChild(div);
        };
        root.querySelectorAll('.matephis-sets').forEach(container => {
            if (container.getAttribute('data-processed')) return;
            const source = container.textContent;
            container.setAttribute('data-processed', 'true');
            try {
                container.innerHTML = '';
                new MatephisSets(container, source);
            } catch (e) {
                console.error('Sets Error', e);
                showError(container, e);
            }
        });
        root.querySelectorAll('code.language-sets').forEach(code => {
            const target = code.closest('div.language-sets') || code.closest('pre') || code.parentElement;
            if (target.getAttribute('data-processed')) return;
            target.setAttribute('data-processed', 'true');
            const container = document.createElement('div');
            container.className = 'matephis-sets';
            container.setAttribute('data-processed', 'true');
            target.parentNode.insertBefore(container, target);
            target.style.display = 'none';
            try {
                new MatephisSets(container, code.textContent);
            } catch (e) {
                console.error('Code Block Sets Error', e);
                showError(container, e);
            }
        });
    }

    /** Renders one diagram into an element (Obsidian, playground). Call .destroy() on unload. */
    static render(el, source, options = {}) {
        return new MatephisSets(el, source, options);
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
        if (cfg.fullWidth) cfg.cssWidth = '100%';
        if (cfg.cssWidth) {
            w.style.maxWidth = cssLength(cfg.cssWidth);
            w.style.width = '100%';
        }
        if (cfg.align === 'center') w.classList.add('align-center');
        else if (cfg.align === 'left') w.classList.add('align-left');
        if (cfg.marginBottom !== undefined) w.style.marginBottom = cssLength(cfg.marginBottom);
        if (cfg.marginLeft !== undefined) w.style.marginLeft = cssLength(cfg.marginLeft);
        if (cfg.marginRight !== undefined) w.style.marginRight = cssLength(cfg.marginRight);
    }

    _initSVG() {
        const cfg = this.config;
        let targetWidth = cfg.width || 600;
        if (cfg.fullWidth) {
            const cw = this.wrapper.clientWidth;
            targetWidth = cw > 50 ? cw : Math.min(window.innerWidth || 600, 600);
        }
        this.width = Math.max(160, targetWidth);
        this.height = 200;
        this.plotStage = document.createElement('div');
        this.plotStage.className = 'matephis-plot-stage';
        this.wrapper.appendChild(this.plotStage);
        this.svg = createSvgElement('svg', {
            width: this.width, height: this.height, viewBox: `0 0 ${this.width} ${this.height}`,
            class: 'matephis-plot-svg matephis-sets-svg', role: 'img',
            'aria-label': cfg.ariaLabel || cfg.title || 'Diagramma di insiemi',
        });
        this.plotStage.appendChild(this.svg);
        const g = (cls) => {
            const el = createSvgElement('g', { class: cls });
            this.svg.appendChild(el);
            return el;
        };
        this.groups = {
            under: g('mps-under'), sets: g('mps-sets'), arrows: g('mps-arrows'), over: g('mps-over'),
            elements: g('mps-elements'), header: g('mps-header'), labels: g('mps-labels'), probe: g('mps-probe'),
        };
    }

    /**
     * Layers that can be drawn over the sets: the "show" list (always on),
     * highlights (on unless "hidden"), and selectors that only reveal buttons
     * name (off until pressed). Map arrows are layers too ("arrows(f)").
     */
    _initLayers() {
        const cfg = this.config;
        const layers = [];
        const seen = new Set();
        const add = (layer) => {
            if (seen.has(layer.key)) {
                const old = layers.find(l => l.key === layer.key);
                if (layer.always) old.always = true;
                return;
            }
            seen.add(layer.key);
            layers.push(layer);
        };
        // The arrows of each map, element by element. A composition is drawn
        // as one curve; its element arrows only with "arrows": true or a button
        this.model.maps.forEach(m => {
            const always = m.kind === 'compose' ? m.def.arrows === true : m.def.hidden !== true;
            add({ key: `arrows(${m.id})`, map: m, arrows: true, always });
        });
        const fromSelector = (str, always, where, extra = {}) => {
            const sel = parseSelector(str);
            if (!sel) return false;
            if (sel.unknown) {
                this._addWarning(`${where}: unknown operation in '${str}' (use image, preimage, collisions, properties or arrows)`);
                return true;
            }
            if (!this.model.mapById.has(sel.map)) {
                this._addWarning(`${where}: no map '${sel.map}' in '${str}'`);
                return true;
            }
            // "arrows(f)" names the map's own layer
            if (sel.op === 'arrows') {
                if (always) layers.find(l => l.key === `arrows(${sel.map})`).always = true;
                return true;
            }
            add({ key: extra.id !== undefined ? String(extra.id) : sel.key, sel, always, ...extra });
            return true;
        };
        (Array.isArray(cfg.show) ? cfg.show : cfg.show !== undefined ? [cfg.show] : []).forEach((s, i) => {
            if (!fromSelector(String(s), true, `show[${i}]`)) this._addWarning(`show[${i}]: '${s}' is not a selector like "image(f)"`);
        });
        (Array.isArray(cfg.highlights) ? cfg.highlights : []).forEach((h, i) => {
            if (!h || typeof h !== 'object') return;
            const always = h.hidden !== true;
            if (h.of !== undefined) {
                if (!fromSelector(String(h.of), always, `highlights[${i}]`, { id: h.id, def: h })) {
                    this._addWarning(`highlights[${i}]: "of" must be a selector like "preimage(f, b_1)"`);
                }
                return;
            }
            const set = this.model.setById.get(String(h.set));
            if (!set) {
                this._addWarning(`highlights[${i}]: needs "of", or "set" with "elements" or "interval"`);
                return;
            }
            add({ key: h.id !== undefined ? String(h.id) : `highlight${i + 1}`, set, def: h, always });
        });
        Controls.targetsOf(cfg.controls).forEach(t => {
            if (!t.includes('*') && parseSelector(t)) fromSelector(t, false, 'controls');
        });
        this.layers = layers;
    }

    /** Is a layer visible now (always on, or revealed by a button)? */
    isVisible(layer) {
        return layer.always || (this.controls ? this.controls.isRevealed(layer.key) : false);
    }

    _initResizeObserver() {
        if (!window.ResizeObserver) return;
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const w = Math.round(entry.contentRect.width);
                if (w > 10 && Math.abs(w - this.width) > 2) this.resize(w);
            }
        });
        this.resizeObserver.observe(this.wrapper);
    }

    /** Re-lays out at a new width (text keeps its pixel size). */
    resize(w) {
        if (!this.config.fullWidth && this.config.width && w > this.config.width) w = this.config.width;
        this.width = Math.max(160, w);
        this.draw();
    }

    // =========================================================================
    // EXPRESSIONS, COLOURS, THEME
    // =========================================================================

    _eval(val, context = 'value') {
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

    setParam(key, value, redraw = true) {
        if (this.sliders && this.sliders.paramUIs[key]) this.sliders.setValue(key, value, false);
        else {
            const def = this.config.params && this.config.params[key];
            this.params[key] = value * paramScale(def);
        }
        if (redraw) this.requestDraw();
    }

    _isDark() {
        if (this.config.theme === 'dark') return true;
        if (typeof MatephisSets.isDarkHook === 'function') return !!MatephisSets.isDarkHook();
        return typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
    }

    /** Colour from a name ("green"), a palette entry ("summer3"), a CSS colour, or a role default. */
    color(explicit, role = null) {
        const name = explicit || (role && ROLE_COLORS[role]) || null;
        const dark = this._isDark();
        if (!name) return dark ? '#e2e8f0' : '#1f1f1f';
        const key = COLOR_NAMES[name] || name;
        const named = this.palettes[key];
        if (typeof named === 'string') return adaptColorForTheme(named, dark);
        if (Array.isArray(named)) return adaptColorForTheme(named[0], dark);
        return adaptColorForTheme(name, dark);
    }

    get ink() {
        return this._isDark() ? '#e2e8f0' : '#1f1f1f';
    }

    // =========================================================================
    // SVG PRIMITIVES
    // =========================================================================

    svgEl(tag, attrs, parent) {
        const el = createSvgElement(tag, attrs);
        if (parent) parent.appendChild(el);
        return el;
    }

    get fontSize() {
        return this.config.fontSize || 16;
    }

    /** Size of a label, as it will be drawn. */
    measure(label, size) {
        return estimateTextSize(mathLabel(label), size || this.fontSize);
    }

    /**
     * Text with a halo; labels are math by default ("a_1" is a₁), "$...$"
     * mixes text and math. MathJax when the page loads it, plain text otherwise.
     */
    text(x, y, raw, { anchor = 'middle', baseline = 'middle', color, size, weight = 'normal', parent, math = true } = {}) {
        const str = math ? mathLabel(raw) : String(raw);
        const fontSize = size || this.fontSize;
        const fill = color || this.ink;
        const dark = this._isDark();
        const plain = () => {
            const t = this.svgEl('text', {
                x, y, class: 'matephis-plot-text', 'text-anchor': anchor, 'dominant-baseline': baseline,
                fill, 'font-size': `${fontSize}px`, 'font-weight': weight,
            }, parent);
            t.textContent = str.replace(/\$/g, '');
            t.style.paintOrder = 'stroke';
            t.style.stroke = dark ? '#181818' : '#fff';
            t.style.strokeWidth = '2.5px';
            return t;
        };
        if (hasMathJax() && str.includes('$')) {
            const halo = this.config.labelHalo !== false ? { color: dark ? '#181818' : '#fff' } : null;
            return renderMathJaxLabel(toTeX(str), x, y, fontSize, fill, anchor, baseline, parent, plain, { halo });
        }
        return plain();
    }

    // =========================================================================
    // DRAWING
    // =========================================================================

    requestDraw() {
        if (this._drawQueued) return;
        this._drawQueued = true;
        requestAnimationFrame(() => {
            this._drawQueued = false;
            if (!this._destroyed) this.draw();
        });
    }

    draw() {
        if (this._destroyed) return;
        const cfg = this.config;
        this.model.refresh();
        // Room under the sets: curves of compositions, labels of collisions
        const footer = this.layers.some(l => (l.arrows && this._routed(l.map) && this._curveShown(l))
            || (l.sel && l.sel.op === 'collisions' && this.isVisible(l)));
        this.layout = computeLayout(this.model, {
            width: this.width, orient: cfg.layout, fontSize: this.fontSize,
            measure: (s) => this.measure(s), order: elementOrder(this.model, { reorder: cfg.reorder !== false, orient: cfg.layout === 'column' ? 'column' : 'row' }),
            footer, spacing: typeof cfg.spacing === 'number' ? cfg.spacing : undefined,
            height: typeof cfg.height === 'number' ? cfg.height : undefined,
        });
        this.height = Math.ceil(this.layout.height);
        this.svg.setAttribute('width', this.width);
        this.svg.setAttribute('height', this.height);
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        Object.values(this.groups).forEach(g => { g.textContent = ''; });
        this.interaction.reset();

        // Arrow colours of collisions are decided before the arrows are drawn
        this.arrowStyle = new Map();
        this.layers.filter(l => l.sel && l.sel.op === 'collisions' && this.isVisible(l)).forEach(l => {
            const map = this.model.mapById.get(l.sel.map);
            const color = this.color(l.def && l.def.color, 'collisions');
            this.model.collisions(map).forEach(c => c.sources.forEach(s => {
                this.arrowStyle.set(`${map.id}|${s}|${typeof c.target === 'string' ? c.target : JSON.stringify(c.target)}`, color);
            }));
        });

        const arrowLayers = this.layers.filter(l => l.arrows);
        drawSets(this);
        arrowLayers.filter(l => !this._routed(l.map) && this.isVisible(l)).forEach(l => drawMapArrows(this, l.map));
        drawRoutedMaps(this, arrowLayers.filter(l => this._routed(l.map) && this._curveShown(l)).map(l => ({ map: l.map, arrows: this.isVisible(l) })));
        drawElements(this);
        drawHeader(this, arrowLayers.filter(l => !this._routed(l.map)).map(l => l.map));
        const props = [];
        this.layers.forEach(l => {
            if (l.arrows || !this.isVisible(l)) return;
            if (l.sel && l.sel.op === 'properties') {
                props.push(l);
                drawPropertyMarks(this, this.model.mapById.get(l.sel.map));
            }
            else drawLayer(this, l);
        });
        drawProbes(this);
        renderProperties(this, props);
        if (this.controls) this.controls.update();
        this.interaction.bind();
        if (this._warningsDirty) this._renderWarnings();
    }

    /** The curve of a routed map: shown unless the map is hidden (and not revealed). */
    _curveShown(layer) {
        return layer.map.def.hidden !== true || this.isVisible(layer);
    }

    /** Maps drawn as a curve under (row) or beside (column) the diagram: compositions and non-adjacent sets. */
    _routed(map) {
        if (!map) return false;
        if (map.def.route === 'below' || map.def.route === 'side') return true;
        if (map.def.route === 'direct') return false;
        return map.kind === 'compose' || Math.abs(map.from.index - map.to.index) > 1;
    }

    // =========================================================================
    // LIFECYCLE
    // =========================================================================

    destroy() {
        this._destroyed = true;
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.sliders) this.sliders.destroy();
        if (this.interaction) this.interaction.destroy();
        this._listeners.forEach(([t, type, fn, opts]) => t.removeEventListener(type, fn, opts));
        this._listeners = [];
        this.container.innerHTML = '';
    }

    _addWarning(msg) {
        if (!this.warnings.includes(msg)) {
            this.warnings.push(msg);
            this._warningsDirty = true;
        }
    }

    _renderWarnings() {
        this._warningsDirty = false;
        const old = this.wrapper.querySelector('.matephis-plot-warnings');
        if (old) old.remove();
        if (!this.warnings.length) return;
        const div = document.createElement('div');
        div.className = 'matephis-plot-warnings';
        const title = document.createElement('strong');
        title.textContent = '⚠️ Sets Warnings:';
        div.appendChild(title);
        const ul = document.createElement('ul');
        this.warnings.forEach(w => {
            const li = document.createElement('li');
            li.textContent = w;
            ul.appendChild(li);
        });
        div.appendChild(ul);
        this.wrapper.appendChild(div);
    }
}

export default MatephisSets;
