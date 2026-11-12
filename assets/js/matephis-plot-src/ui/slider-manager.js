/**
 * Parameter Sliders & Animation Loop Manager
 *
 * A param may declare a unit: "unit": "deg" keeps min/max/step/val and the
 * slider in degrees but stores radians in params, so sin(alpha) is always
 * right; any other unit string ("kg", "m/s") is only shown after the value.
 *
 * Labels may contain TeX ("label": "$\\theta_0$"), typeset once by MathJax.
 *
 * Layout: the sliders share one grid, so labels, values and tracks line up.
 * "sliderLayout": "inline" keeps each slider on one line, "stacked" puts the
 * label and value above the track, and "auto" (default) stacks every slider
 * when a label would leave the tracks too little room.
 *
 * Every column whose text changes while dragging (value, dynamic bounds) has
 * a reserved width that only grows: if the text changed the track's width,
 * the thumb would move under the pointer and the value would flicker.
 */
import { MatephisIcons } from './icons.js';
import { whenMathJaxReady } from '../renderers/mathjax-bridge.js';

/** "2*PI" -> "2π", "PI/16" -> "π/16" for slider bound labels. */
function prettyBound(src, value) {
    if (typeof src === 'string' && /pi/i.test(src)) {
        return src.replace(/\s*\*\s*(?=pi)/gi, '').replace(/pi/gi, 'π');
    }
    return String(value);
}

export function decimalsOf(step) {
    const s = String(step);
    if (s.includes('e-')) return parseInt(s.split('e-')[1], 10);
    return s.includes('.') ? s.split('.')[1].length : 0;
}

/** Factor from slider units to stored units (degrees -> radians for "deg"). */
export function paramScale(def) {
    return def && def.unit === 'deg' ? Math.PI / 180 : 1;
}

/** Text shown after a slider value: "°" for degrees, " kg" for other units. */
function unitSuffix(def) {
    if (!def || !def.unit) return '';
    return def.unit === 'deg' ? '°' : ` ${def.unit}`;
}

/**
 * The value on the slider's grid (min + k·step) nearest to v, inside [min, max],
 * without float noise: 0.1 + 2·0.1 is 0.3, not 0.30000000000000004.
 */
export function snapToStep(v, min, max, step) {
    if (!isFinite(v)) return v;
    if (v <= min) return min;
    if (v >= max) v = max;
    if (!(step > 0)) return v;
    let k = Math.round((v - min) / step);
    if (min + k * step > max + step * 1e-9) k -= 1;
    const places = Math.min(12, Math.max(decimalsOf(+step.toPrecision(12)), decimalsOf(+min.toPrecision(12))));
    return Math.min(max, parseFloat((min + k * step).toFixed(places)));
}

/** Fixed decimals, so the text keeps its length while the value changes; never "-0.00". */
export function formatValue(v, decimals, suffix = '') {
    if (!isFinite(v)) return `–${suffix}`;
    if (Math.abs(v) < 0.5 * 10 ** -decimals) v = 0;
    return `${v.toFixed(decimals)}${suffix}`;
}

/**
 * Characters needed by the longest value between min and max: negatives reach
 * at most |min| and positives at most max, so the two ends are the widest.
 */
export function valueWidth(min, max, decimals, suffix = '') {
    return Math.max(formatValue(min, decimals, suffix).length, formatValue(max, decimals, suffix).length);
}

/** Label text with "$...$" left out, for aria-label. */
function plainText(s) {
    return String(s).replace(/\$([^$]*)\$/g, '$1').replace(/\\[a-zA-Z]+\s*/g, '').replace(/[{}^_]/g, '').trim();
}

/** Slider fill (min to thumb) as a CSS variable read by the track's gradient. */
export function paintRange(input) {
    const lo = parseFloat(input.min), hi = parseFloat(input.max), v = parseFloat(input.value);
    const f = hi > lo ? Math.min(1, Math.max(0, (v - lo) / (hi - lo))) : 0;
    input.style.setProperty('--fill', `${(f * 100).toFixed(3)}%`);
}

/**
 * Fixed width in ch that only ever grows (see the header comment). A fixed
 * width, not min-width: bold glyphs can be a fraction of a pixel wider than
 * 1ch, and even that would nudge the track.
 */
function reserveCh(el, chars) {
    const now = parseFloat(el.style.width) || 0;
    if (chars > now) el.style.width = `${chars}ch`;
}

/**
 * Puts MathJax formulas in a label on the text baseline. Browsers disagree on
 * where an inline SVG sits (Safari draws it about 1px high), so each formula
 * is compared with a zero-size marker on the baseline right before it and
 * moved by the difference, which is 0 where the browser already gets it right.
 */
export function alignTexBaseline(label) {
    if (typeof document === 'undefined') return;
    label.querySelectorAll('mjx-container > svg').forEach(svg => {
        svg.style.position = '';
        svg.style.top = '';
        const container = svg.parentNode;
        const marker = document.createElement('span');
        marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        container.parentNode.insertBefore(marker, container);
        const baseline = marker.getBoundingClientRect().top;
        marker.remove();
        // MathJax's vertical-align (in ex) is the formula's depth under the baseline;
        // 1ex in px comes from the SVG's own height, also given in ex
        const rect = svg.getBoundingClientRect();
        const va = svg.style.verticalAlign || '0';
        const exPx = rect.height / (parseFloat(svg.getAttribute('height')) || 1);
        const depth = -(parseFloat(va) || 0) * (/ex$/.test(va) ? exPx : 1);
        const delta = baseline + depth - rect.bottom;
        if (Math.abs(delta) > 0.25) {
            svg.style.position = 'relative';
            svg.style.top = `${delta.toFixed(2)}px`;
        }
    });
}

/** Auto layout: stack when the tracks get less than this share of the panel. */
const MIN_TRACK_SHARE = 0.4;

export class SliderManager {
    /**
     * Initial stored values of the params: `val` (or `value`, default 0) in slider units,
     * converted with paramScale. Params may refer to earlier params.
     * @param {object} defs - the "params" config block
     * @param {object} params - target object, filled in place
     * @param {(v: any, ctx: string) => any} evalFn
     */
    static initValues(defs, params, evalFn) {
        for (const key in defs) params[key] = 0;
        for (const key in defs) {
            const v = defs[key].val !== undefined ? defs[key].val : defs[key].value;
            const r = v === undefined ? 0 : evalFn(v, `param ${key}`);
            params[key] = typeof r === 'number' && !isNaN(r) ? r * paramScale(defs[key]) : 0;
        }
    }

    constructor(plot) {
        this.plot = plot;
        this.controls = document.createElement("div");
        this.controls.className = "matephis-plot-controls";
        this.paramUIs = {};
        this.sliderUpdaters = [];
        this.animations = new Set();
        this._layoutWidth = -1;
    }

    /** Re-evaluates dynamic bounds ("max": "2*a") after any parameter change. */
    updateAllBounds() {
        this.sliderUpdaters.forEach(fn => fn());
    }

    /** Sets a parameter programmatically (value in slider units) and syncs its slider. */
    setValue(key, v, redraw = true) {
        const ui = this.paramUIs[key];
        const { params } = this.plot;
        params[key] = ui ? v * ui.scale : v;
        if (ui) ui.sync(v);
        this.updateAllBounds();
        if (redraw) this.plot.requestDraw();
    }

    init() {
        const { config, params } = this.plot;
        if (!config.params) return;

        const evalNum = (v, ctx) => {
            const r = this.plot._eval(v, ctx);
            return typeof r === 'number' ? r : NaN;
        };

        // "slider": false keeps the param (a button or a drag sets it) without a slider
        const keys = Object.keys(config.params).filter(k => !(config.params[k] && config.params[k].slider === false));
        const animatedKey = (key) => config.animate === true || (Array.isArray(config.animate) && config.animate.includes(key));
        if (keys.some(animatedKey)) this.controls.classList.add('has-play');
        if (config.sliderBorder) this.controls.classList.add('slider-bordered');
        this.layoutMode = ['inline', 'stacked'].includes(config.sliderLayout) ? config.sliderLayout : 'auto';
        if (this.layoutMode === 'stacked') this.controls.classList.add('stacked');

        const texLabels = [];

        for (const key of keys) {
            const p = config.params[key];
            const row = document.createElement("div");
            row.className = "matephis-slider-row";

            const labelText = p.label !== undefined ? String(p.label) : key;
            const label = document.createElement("span");
            label.className = "matephis-slider-label";
            label.textContent = labelText;
            if (labelText.includes('$')) texLabels.push(label);

            const valBox = document.createElement("span");
            valBox.className = "matephis-slider-val";
            const eq = document.createElement("span");
            eq.className = "matephis-slider-eq";
            eq.textContent = "=";
            const valSpan = document.createElement("span");
            valSpan.className = "matephis-slider-num";
            valBox.append(eq, valSpan);

            let initMin = evalNum(p.min !== undefined ? p.min : -10, `slider ${key} min`);
            let initMax = evalNum(p.max !== undefined ? p.max : 10, `slider ${key} max`);
            let initStep = p.step !== undefined ? evalNum(p.step, `slider ${key} step`) : 0.1;
            if (!(initStep > 0)) initStep = 0.1;
            if (isNaN(initMin)) initMin = -10;
            if (isNaN(initMax)) initMax = 10;

            let decimals = 2;
            if (p.round !== undefined) decimals = parseInt(p.round, 10);
            else if (p.step !== undefined) decimals = Math.min(10, decimalsOf(+initStep.toPrecision(12)));
            if (!(decimals >= 0)) decimals = 2;

            const round = (v) => parseFloat(v.toFixed(Math.max(decimals, 6)));
            // Slider, labels and animation work in slider units; params store v * scale
            const scale = paramScale(p);
            const suffix = unitSuffix(p);
            const show = (v) => formatValue(v, decimals, suffix);
            const boundSuffix = p.unit === 'deg' ? '°' : '';
            // Expression bounds ("A*5") change while other sliders move: fixed decimals keep their length
            const boundText = (src, v) => (typeof src === 'string' && isNaN(Number(src)) && !/pi/i.test(src)
                ? formatValue(v, decimals)
                : prettyBound(src, parseFloat(v.toFixed(decimals)))) + boundSuffix;

            const minLabel = document.createElement("span");
            minLabel.className = "matephis-slider-min";
            minLabel.textContent = boundText(p.min, initMin);

            const input = document.createElement("input");
            input.type = "range";
            input.min = initMin;
            input.max = initMax;
            input.step = initStep;
            input.setAttribute("aria-label", plainText(labelText) || key);

            const maxLabel = document.createElement("span");
            maxLabel.className = "matephis-slider-max";
            maxLabel.textContent = boundText(p.max, initMax);

            // Expression bounds may gain a digit later: start with one character spare
            let spare = typeof p.min === 'string' || typeof p.max === 'string' ? 1 : 0;
            const reserve = () => {
                const lo = parseFloat(input.min), hi = parseFloat(input.max);
                reserveCh(valSpan, valueWidth(lo, hi, decimals, suffix) + spare);
                reserveCh(minLabel, minLabel.textContent.length + (typeof p.min === 'string' ? spare : 0));
                reserveCh(maxLabel, maxLabel.textContent.length + (typeof p.max === 'string' ? spare : 0));
                spare = 0;
            };

            /** Shows v (slider units) on the slider, the value text and the fill. */
            const sync = (v) => {
                input.value = v;
                const text = show(v);
                valSpan.textContent = text;
                input.setAttribute("aria-valuetext", text);
                paintRange(input);
            };
            sync(Number(params[key]) / scale);
            reserve();

            const updateBounds = () => {
                let changed = false;
                if (typeof p.min === 'string') {
                    const eMin = evalNum(p.min, `slider ${key} min`);
                    if (!isNaN(eMin) && parseFloat(input.min) !== eMin) {
                        input.min = eMin;
                        minLabel.textContent = boundText(p.min, eMin);
                        if (params[key] / scale < eMin) params[key] = eMin * scale;
                        changed = true;
                    }
                }
                if (typeof p.max === 'string') {
                    const eMax = evalNum(p.max, `slider ${key} max`);
                    if (!isNaN(eMax) && parseFloat(input.max) !== eMax) {
                        input.max = eMax;
                        maxLabel.textContent = boundText(p.max, eMax);
                        if (params[key] / scale > eMax) params[key] = eMax * scale;
                        changed = true;
                    }
                }
                if (changed) {
                    reserve();
                    sync(params[key] / scale);
                }
            };
            this.sliderUpdaters.push(updateBounds);

            input.addEventListener("input", () => {
                const v = snapToStep(parseFloat(input.value), parseFloat(input.min), parseFloat(input.max), parseFloat(input.step));
                params[key] = v * scale;
                const text = show(v);
                valSpan.textContent = text;
                input.setAttribute("aria-valuetext", text);
                paintRange(input);
                this.updateAllBounds();
                this.plot.requestDraw();
            });

            if (animatedKey(key)) {
                const playBtn = document.createElement("button");
                playBtn.type = "button";
                playBtn.className = "matephis-plot-play-btn";
                playBtn.innerHTML = MatephisIcons.play;
                playBtn.setAttribute("aria-label", `Play ${key}`);

                const anim = { playing: false, frame: null, dir: 1 };
                const stop = () => {
                    anim.playing = false;
                    if (anim.frame) cancelAnimationFrame(anim.frame);
                    anim.frame = null;
                    playBtn.innerHTML = MatephisIcons.play;
                    playBtn.setAttribute("aria-label", `Play ${key}`);
                };
                anim.stop = stop;
                this.animations.add(anim);

                playBtn.addEventListener("click", () => {
                    if (anim.playing) { stop(); return; }
                    anim.playing = true;
                    playBtn.innerHTML = MatephisIcons.pause;
                    playBtn.setAttribute("aria-label", `Pause ${key}`);

                    const speed = p.speed !== undefined ? evalNum(p.speed, 'speed') : initStep;
                    const interval = 1000 / (p.fps || 60);
                    let lastTime = 0;

                    const loop = (timestamp) => {
                        if (!anim.playing) return;
                        if (!lastTime) lastTime = timestamp;
                        if (timestamp - lastTime >= interval) {
                            const lo = parseFloat(input.min), hi = parseFloat(input.max);
                            let v = params[key] / scale + speed * anim.dir;
                            if (p.loop === 'bounce') {
                                if (v > hi) { v = hi; anim.dir = -1; }
                                if (v < lo) { v = lo; anim.dir = 1; }
                            } else if (v > hi + 1e-12) {
                                v = lo;
                            }
                            // Rounding prevents float drift (0.30000000000000004)
                            v = round(v);
                            params[key] = v * scale;
                            sync(v);
                            this.updateAllBounds();
                            this.plot.draw();
                            lastTime = timestamp;
                        }
                        anim.frame = requestAnimationFrame(loop);
                    };
                    anim.frame = requestAnimationFrame(loop);
                });
                row.appendChild(playBtn);
            }

            row.append(label, valBox, minLabel, input, maxLabel);
            this.controls.appendChild(row);

            this.paramUIs[key] = { input, valSpan, label, updateBounds, decimals, scale, show, sync };
        }

        this.plot.wrapper.appendChild(this.controls);

        if (texLabels.length) this._typeset(texLabels);
        this._watchLayout();
    }

    /** Typesets "$...$" labels once MathJax is ready, then re-checks the layout. */
    _typeset(els) {
        if (typeof window === 'undefined') return;
        const run = () => {
            const mj = window.MathJax;
            if (!mj || !mj.typesetPromise) return;
            mj.typesetPromise(els).then(() => {
                const align = () => els.forEach(alignTexBaseline);
                align();
                // Font metrics change once the webfont arrives
                if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
                this._layoutWidth = -1;
                this.updateLayout();
            }).catch(() => {});
        };
        if (window.MathJax && window.MathJax.typesetPromise) run();
        else whenMathJaxReady(run);
    }

    _watchLayout() {
        if (this.layoutMode !== 'auto') return;
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(() => this.updateLayout());
            this._resizeObserver.observe(this.controls);
        } else {
            requestAnimationFrame(() => this.updateLayout());
        }
    }

    /**
     * "auto" layout: measures the sliders inline and stacks them all when a
     * label wraps or a track gets less than MIN_TRACK_SHARE of the panel.
     * Every row switches together, so the sliders keep lining up.
     */
    updateLayout() {
        if (this.layoutMode !== 'auto') return;
        const panel = this.controls;
        const width = panel.clientWidth;
        if (!width || width === this._layoutWidth) return;
        this._layoutWidth = width;

        panel.classList.remove('stacked');
        const uis = Object.values(this.paramUIs);
        const lineHeight = (el) => parseFloat(getComputedStyle(el).lineHeight) || 20;
        const tooTight = uis.some(ui => {
            if (ui.input.getBoundingClientRect().width < width * MIN_TRACK_SHARE) return true;
            // A label taller than one line has wrapped
            return ui.label.getBoundingClientRect().height > lineHeight(ui.label) * 1.8;
        });
        if (tooTight) panel.classList.add('stacked');
    }

    destroy() {
        this.animations.forEach(a => a.stop());
        this.animations.clear();
        if (this._resizeObserver) this._resizeObserver.disconnect();
    }
}
