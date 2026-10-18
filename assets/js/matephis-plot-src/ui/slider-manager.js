/**
 * Parameter Sliders & Animation Loop Manager
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

export class SliderManager {
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

    /** Sets a parameter programmatically and syncs its slider. */
    setValue(key, v, redraw = true) {
        const ui = this.paramUIs[key];
        const { params } = this.plot;
        params[key] = v;
        if (ui) {
            ui.input.value = v;
            ui.valSpan.textContent = parseFloat(v.toFixed(ui.decimals));
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
            label.textContent = `${key} = `;
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

            const minLabel = document.createElement("span");
            minLabel.className = "matephis-slider-min";
            minLabel.textContent = prettyBound(p.min, parseFloat(initMin.toFixed(decimals)));

            const input = document.createElement("input");
            input.type = "range";
            input.min = initMin;
            input.max = initMax;
            input.step = initStep;
            input.value = params[key];
            input.setAttribute("aria-label", `${key}`);

            const maxLabel = document.createElement("span");
            maxLabel.className = "matephis-slider-max";
            maxLabel.textContent = prettyBound(p.max, parseFloat(initMax.toFixed(decimals)));

            valSpan.textContent = parseFloat(Number(params[key]).toFixed(decimals));

            const updateBounds = () => {
                if (typeof p.min === 'string') {
                    const eMin = evalNum(p.min, `slider ${key} min`);
                    if (!isNaN(eMin) && parseFloat(input.min) !== eMin) {
                        input.min = eMin;
                        minLabel.textContent = prettyBound(p.min, parseFloat(eMin.toFixed(decimals)));
                        if (params[key] < eMin) { params[key] = eMin; input.value = eMin; valSpan.textContent = parseFloat(eMin.toFixed(decimals)); }
                    }
                }
                if (typeof p.max === 'string') {
                    const eMax = evalNum(p.max, `slider ${key} max`);
                    if (!isNaN(eMax) && parseFloat(input.max) !== eMax) {
                        input.max = eMax;
                        maxLabel.textContent = prettyBound(p.max, parseFloat(eMax.toFixed(decimals)));
                        if (params[key] > eMax) { params[key] = eMax; input.value = eMax; valSpan.textContent = parseFloat(eMax.toFixed(decimals)); }
                    }
                }
            };
            this.sliderUpdaters.push(updateBounds);

            input.addEventListener("input", (e) => {
                const v = parseFloat(e.target.value);
                params[key] = v;
                valSpan.textContent = parseFloat(v.toFixed(decimals));
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
                            let v = params[key] + speed * anim.dir;
                            if (p.loop === 'bounce') {
                                if (v > hi) { v = hi; anim.dir = -1; }
                                if (v < lo) { v = lo; anim.dir = 1; }
                            } else if (v > hi + 1e-12) {
                                v = lo;
                            }
                            // Rounding prevents float drift (0.30000000000000004)
                            params[key] = round(v);
                            input.value = params[key];
                            valSpan.textContent = parseFloat(params[key].toFixed(decimals));
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

            this.paramUIs[key] = { input, valSpan, updateBounds, decimals };
        }

        this.plot.wrapper.appendChild(this.controls);
    }

    destroy() {
        this.animations.forEach(a => a.stop());
        this.animations.clear();
    }
}
