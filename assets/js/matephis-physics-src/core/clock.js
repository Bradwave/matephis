/**
 * Time controls for a scene with "time": play / pause, back to the start,
 * a time slider for scrubbing, the current time and the playback speed.
 *
 *   "time": { "max": 10, "speed": 1, "loop": true | "bounce", "autoplay": true }
 *
 * Playback stops while the scene is off screen and when the page is hidden.
 */
import { MatephisIcons } from '../../matephis-plot-src/ui/icons.js';

const SPEEDS = [0.25, 0.5, 1, 2];

export class Clock {
    /**
     * @param {object} scene - the MatephisPhysics instance
     * @param {import('./simulation.js').Simulation} sim
     */
    constructor(scene, sim) {
        this.scene = scene;
        this.sim = sim;
        const cfg = sim.time;
        this.speed = cfg.speed !== undefined ? scene._num(cfg.speed, 'time speed') : 1;
        if (!(this.speed > 0)) this.speed = 1;
        this.loop = cfg.loop === true || cfg.loop === 'bounce' ? cfg.loop : false;
        this.dir = 1;
        this.playing = false;
        this.visible = true;
        this._frame = null;

        const el = this.el = document.createElement('div');
        el.className = 'matephis-slider-row matephis-physics-clock';
        const button = (icon, label, onClick) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'matephis-plot-play-btn';
            b.innerHTML = icon;
            b.setAttribute('aria-label', label);
            b.title = label;
            b.addEventListener('click', onClick);
            el.appendChild(b);
            return b;
        };
        this.playBtn = button(MatephisIcons.play, 'Avvia', () => (this.playing ? this.pause() : this.play()));
        button(MatephisIcons.replay, 'Ricomincia', () => { this.pause(); this.dir = 1; this.seek(0); });

        this.readout = document.createElement('span');
        this.readout.className = 'matephis-slider-label-group matephis-physics-time';
        el.appendChild(this.readout);

        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.min = 0;
        this.slider.step = 'any';
        this.slider.setAttribute('aria-label', 'Tempo');
        this.slider.addEventListener('input', () => { this.pause(); this.seek(parseFloat(this.slider.value)); });
        el.appendChild(this.slider);

        this.speedSel = document.createElement('select');
        this.speedSel.className = 'matephis-physics-speed';
        this.speedSel.setAttribute('aria-label', 'Velocità di riproduzione');
        [...new Set([...SPEEDS, this.speed])].sort((a, b) => a - b).forEach(s => {
            const o = document.createElement('option');
            o.value = s;
            o.textContent = `${s}×`;
            if (s === this.speed) o.selected = true;
            this.speedSel.appendChild(o);
        });
        this.speedSel.addEventListener('change', () => { this.speed = parseFloat(this.speedSel.value); });
        el.appendChild(this.speedSel);

        // Pause off screen; autoplay the first time the scene is seen
        this._autoplay = cfg.autoplay === true;
        if (typeof IntersectionObserver !== 'undefined') {
            this.observer = new IntersectionObserver(entries => {
                this.visible = entries.some(e => e.isIntersecting);
                if (!this.visible && this.playing) { this.pause(); this._resume = true; }
                else if (this.visible && (this._resume || this._autoplay)) { this._resume = false; this._autoplay = false; this.play(); }
            });
            this.observer.observe(scene.wrapper);
        } else if (this._autoplay) {
            this.play();
        }
        this._onHidden = () => { if (document.hidden) this.pause(); };
        document.addEventListener('visibilitychange', this._onHidden);
        this.update();
    }

    /** Syncs the slider and the readout with the simulation. */
    update() {
        const { t, clockEnd: tEnd } = this.sim;
        this.slider.max = tEnd;
        this.slider.value = t;
        this.readout.textContent = `t = ${t.toFixed(2)} s`;
    }

    seek(t) {
        this.sim.seek(t);
        this.update();
        this.scene.requestDraw();
    }

    play() {
        if (this.playing || !(this.sim.clockEnd > 0)) return;
        if (this.sim.t >= this.sim.clockEnd - 1e-9 && !this.loop) this.sim.seek(0);
        this.playing = true;
        this.playBtn.innerHTML = MatephisIcons.pause;
        this.playBtn.setAttribute('aria-label', 'Pausa');
        this.playBtn.title = 'Pausa';
        let last = null;
        const step = (now) => {
            if (!this.playing) return;
            if (last !== null) {
                const dt = Math.min(0.1, (now - last) / 1000) * this.speed * this.dir;
                let t = this.sim.t + dt;
                const end = this.sim.clockEnd;
                if (t >= end) {
                    if (this.loop === 'bounce') { t = end; this.dir = -1; }
                    else if (this.loop) t = 0;
                    else { t = end; this.pause(); }
                } else if (t <= 0 && this.dir < 0) {
                    t = 0; this.dir = 1;
                }
                this.sim.seek(t);
                this.update();
                this.scene.draw();
            }
            last = now;
            if (this.playing) this._frame = requestAnimationFrame(step);
        };
        this._frame = requestAnimationFrame(step);
    }

    pause() {
        this.playing = false;
        if (this._frame) cancelAnimationFrame(this._frame);
        this._frame = null;
        this.playBtn.innerHTML = MatephisIcons.play;
        this.playBtn.setAttribute('aria-label', 'Avvia');
        this.playBtn.title = 'Avvia';
    }

    destroy() {
        this.pause();
        if (this.observer) this.observer.disconnect();
        document.removeEventListener('visibilitychange', this._onHidden);
    }
}
