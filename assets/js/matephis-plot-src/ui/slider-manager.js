/**
 * Parameter Sliders & Animation Loop Manager
 */
import { MatephisIcons } from './toolbar.js';
import { evalValue } from '../parser/expression-parser.js';

export class SliderManager {
    constructor(plot) {
        this.plot = plot;
        this.controls = document.createElement("div");
        this.controls.className = "matephis-plot-controls";
        this.paramUIs = {};
        this.sliderUpdaters = [];
    }

    init() {
        const { config, params } = this.plot;
        if (!config.params) return;

        for (let key in config.params) {
            if (params[key] === undefined) {
                params[key] = config.params[key].val !== undefined ? config.params[key].val : 0;
            }
        }

        for (let key in config.params) {
            const p = config.params[key];
            const row = document.createElement("div");
            row.className = "matephis-slider-row";
            if (config.sliderBorder) row.classList.add('slider-bordered');

            const labelGroup = document.createElement("div");
            labelGroup.className = "matephis-slider-label-group";

            const label = document.createElement("span");
            label.innerText = `${key} = `;
            label.className = "matephis-slider-label";

            const valSpan = document.createElement("span");
            valSpan.className = "matephis-slider-val";
            valSpan.innerText = p.val;

            labelGroup.appendChild(label);
            labelGroup.appendChild(valSpan);

            let initMin = p.min;
            if (typeof p.min === 'string') {
                const eMin = parseFloat(evalValue(p.min, { params: this.plot.params, resolvedPoints: this.plot.resolvedPoints }));
                if (!isNaN(eMin)) initMin = eMin;
            }
            let initMax = p.max;
            if (typeof p.max === 'string') {
                const eMax = parseFloat(evalValue(p.max, { params: this.plot.params, resolvedPoints: this.plot.resolvedPoints }));
                if (!isNaN(eMax)) initMax = eMax;
            }

            let initStep = p.step !== undefined ? p.step : 0.1;
            if (typeof p.step === 'string') {
                const eStep = parseFloat(evalValue(p.step, { params: this.plot.params, resolvedPoints: this.plot.resolvedPoints }));
                if (!isNaN(eStep)) initStep = eStep;
            }

            let decimals = 2;
            if (p.round !== undefined) {
                decimals = parseInt(p.round);
            } else if (p.step !== undefined) {
                const stepStr = initStep.toString();
                decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
            }

            if (typeof initMin === 'number') initMin = parseFloat(initMin.toFixed(decimals));
            if (typeof initMax === 'number') initMax = parseFloat(initMax.toFixed(decimals));

            const minLabel = document.createElement("span");
            minLabel.innerHTML = typeof p.min === 'string' && p.min.includes('PI') ? p.min.replace(/PI/g, '&pi;') : initMin;
            minLabel.className = "matephis-slider-min";

            const input = document.createElement("input");
            input.type = "range";
            input.min = initMin;
            input.max = initMax;
            input.step = initStep;
            input.value = p.val;

            const maxLabel = document.createElement("span");
            maxLabel.innerHTML = typeof p.max === 'string' && p.max.includes('PI') ? p.max.replace(/PI/g, '&pi;') : initMax;
            maxLabel.className = "matephis-slider-max";

            const updateBounds = () => {
                if (typeof p.min === 'string') {
                    let eMin = parseFloat(evalValue(p.min, { params: this.plot.params, resolvedPoints: this.plot.resolvedPoints }));
                    if (!isNaN(eMin)) {
                        eMin = parseFloat(eMin.toFixed(decimals));
                        if (input.min != eMin) {
                            input.min = eMin;
                            minLabel.innerText = eMin;
                            if (this.plot.params[key] < eMin) {
                                this.plot.params[key] = eMin;
                                input.value = eMin;
                                valSpan.innerText = eMin;
                            }
                        }
                    }
                }
                if (typeof p.max === 'string') {
                    let eMax = parseFloat(evalValue(p.max, { params: this.plot.params, resolvedPoints: this.plot.resolvedPoints }));
                    if (!isNaN(eMax)) {
                        eMax = parseFloat(eMax.toFixed(decimals));
                        if (input.max != eMax) {
                            input.max = eMax;
                            maxLabel.innerText = eMax;
                            if (this.plot.params[key] > eMax) {
                                this.plot.params[key] = eMax;
                                input.value = eMax;
                                valSpan.innerText = eMax;
                            }
                        }
                    }
                }
            };
            this.sliderUpdaters.push(updateBounds);

            input.addEventListener("input", (e) => {
                const v = parseFloat(e.target.value);
                this.plot.params[key] = v;
                valSpan.innerText = parseFloat(v.toFixed(decimals));
                this.sliderUpdaters.forEach(fn => fn());
                this.plot.draw();
            });

            if (config.animate === true) {
                const playBtn = document.createElement("button");
                playBtn.className = "matephis-plot-play-btn";
                playBtn.innerHTML = MatephisIcons.play;

                let isPlaying = false;
                let animFrame = null;

                playBtn.onclick = () => {
                    isPlaying = !isPlaying;
                    playBtn.innerHTML = isPlaying ? MatephisIcons.pause : MatephisIcons.play;

                    if (isPlaying) {
                        const speed = p.speed !== undefined ? p.speed : initStep;
                        let lastTime = 0;
                        const fps = p.fps || 60;
                        const interval = 1000 / fps;

                        const loop = (timestamp) => {
                            if (!isPlaying) return;
                            if (!lastTime) lastTime = timestamp;
                            if (timestamp - lastTime >= interval) {
                                let v = this.plot.params[key] + speed;
                                let currentMax = parseFloat(input.max);
                                let currentMin = parseFloat(input.min);
                                if (v > currentMax) v = currentMin;

                                this.plot.params[key] = v;
                                input.value = v;
                                const currentDecimals = (initStep.toString().split('.')[1] || '').length || 2;
                                valSpan.innerText = parseFloat(v.toFixed(currentDecimals));
                                this.sliderUpdaters.forEach(fn => fn());
                                this.plot.draw();
                                lastTime = timestamp;
                            }
                            animFrame = requestAnimationFrame(loop);
                        };
                        animFrame = requestAnimationFrame(loop);
                    } else {
                        if (animFrame) cancelAnimationFrame(animFrame);
                    }
                };
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
}
