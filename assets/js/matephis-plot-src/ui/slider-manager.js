/**
 * Parameter Sliders & Animation Loop Manager
 *
 * A param may declare a unit: "unit": "deg" keeps min/max/step/val and the
 * slider in degrees but stores radians in params, so sin(alpha) is always
 * right; any other unit string ("kg", "m/s") is only shown after the value.
 */
import { MatephisIcons } from './icons.js';

/** "2*PI" -> "2π", "PI/16" -> "π/16" for slider bound labels. */
function prettyBound(src, value) {
    if (typeof src === 'string' && /pi/i.test(src)) {
        return src.replace(/\s*\*\s*(?=pi)/gi, '').replace(/pi/gi, 'π');
    }
    return String(value);
}

function decimalsOf(step) {
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
        if (ui) {
            ui.input.value = v;
            ui.valSpan.textContent = ui.show(v);
        }
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

        for (let key in config.params) {
            const p = config.params[key];
            const row = document.createElement("div");
            row.className = "matephis-slider-row";
            if (config.sliderBorder) row.classList.add('slider-bordered');

            const labelGroup = document.createElement("div");
            labelGroup.className = "matephis-slider-label-group";

            const label = document.createElement("span");
            label.textContent = `${p.label !== undefined ? p.label : key} = `;
            label.className = "matephis-slider-label";

            const valSpan = document.createElement("span");
            valSpan.className = "matephis-slider-val";

            labelGroup.appendChild(label);
            labelGroup.appendChild(valSpan);

            let initMin = evalNum(p.min !== undefined ? p.min : -10, `slider ${key} min`);
            let initMax = evalNum(p.max !== undefined ? p.max : 10, `slider ${key} max`);
            let initStep = p.step !== undefined ? evalNum(p.step, `slider ${key} step`) : 0.1;
            if (!(initStep > 0)) initStep = 0.1;
            if (isNaN(initMin)) initMin = -10;
            if (isNaN(initMax)) initMax = 10;

            let decimals = 2;
            if (p.round !== undefined) decimals = parseInt(p.round, 10);
            else if (p.step !== undefined) decimals = Math.min(10, decimalsOf(+initStep.toPrecision(12)));

            const round = (v) => parseFloat(v.toFixed(Math.max(decimals, 6)));
            // Slider, labels and animation work in slider units; params store v * scale
            const scale = paramScale(p);
            const suffix = unitSuffix(p);
            const show = (v) => `${parseFloat(v.toFixed(decimals))}${suffix}`;
            const boundSuffix = p.unit === 'deg' ? '°' : '';

            const minLabel = document.createElement("span");
            minLabel.className = "matephis-slider-min";
            minLabel.textContent = prettyBound(p.min, parseFloat(initMin.toFixed(decimals))) + boundSuffix;

            const input = document.createElement("input");
            input.type = "range";
            input.min = initMin;
            input.max = initMax;
            input.step = initStep;
            input.value = params[key] / scale;
            input.setAttribute("aria-label", `${key}`);

            const maxLabel = document.createElement("span");
            maxLabel.className = "matephis-slider-max";
            maxLabel.textContent = prettyBound(p.max, parseFloat(initMax.toFixed(decimals))) + boundSuffix;

            valSpan.textContent = show(Number(params[key]) / scale);

            const updateBounds = () => {
                if (typeof p.min === 'string') {
                    const eMin = evalNum(p.min, `slider ${key} min`);
                    if (!isNaN(eMin) && parseFloat(input.min) !== eMin) {
                        input.min = eMin;
                        minLabel.textContent = prettyBound(p.min, parseFloat(eMin.toFixed(decimals))) + boundSuffix;
                        if (params[key] / scale < eMin) { params[key] = eMin * scale; input.value = eMin; valSpan.textContent = show(eMin); }
                    }
                }
                if (typeof p.max === 'string') {
                    const eMax = evalNum(p.max, `slider ${key} max`);
                    if (!isNaN(eMax) && parseFloat(input.max) !== eMax) {
                        input.max = eMax;
                        maxLabel.textContent = prettyBound(p.max, parseFloat(eMax.toFixed(decimals))) + boundSuffix;
                        if (params[key] / scale > eMax) { params[key] = eMax * scale; input.value = eMax; valSpan.textContent = show(eMax); }
                    }
                }
            };
            this.sliderUpdaters.push(updateBounds);

            input.addEventListener("input", (e) => {
                const v = parseFloat(e.target.value);
                params[key] = v * scale;
                valSpan.textContent = show(v);
                this.updateAllBounds();
                this.plot.requestDraw();
            });

            const animated = config.animate === true || (Array.isArray(config.animate) && config.animate.includes(key));
            if (animated) {
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
                            input.value = v;
                            valSpan.textContent = show(v);
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

            row.appendChild(labelGroup);
            row.appendChild(minLabel);
            row.appendChild(input);
            row.appendChild(maxLabel);
            this.controls.appendChild(row);

            this.paramUIs[key] = { input, valSpan, updateBounds, decimals, scale, show };
        }

        this.plot.wrapper.appendChild(this.controls);
    }

    destroy() {
        this.animations.forEach(a => a.stop());
        this.animations.clear();
    }
}
