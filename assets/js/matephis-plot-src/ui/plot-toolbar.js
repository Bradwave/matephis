/**
 * Plot toolbar: zoom, reset, fullscreen, selection modes, derivative tools
 * (mixed into MatephisPlot)
 */
import { createButton, createSeparator, setActive } from './toolbar.js';

export const ToolbarMixin = {
    _initControlsOverlay() {
        const cfg = this.config;
        if (cfg.showToolbar === false) return;

        const bar = document.createElement("div");
        bar.className = "matephis-plot-toolbar";
        bar.setAttribute("role", "toolbar");
        const add = (el) => { bar.appendChild(el); return el; };

        this.toggleTrace = () => {
            this.isTracing = !this.isTracing;
            setActive(this.btnTrace, this.isTracing);
        };
        this.clearTrace = () => {
            this.derivativeTrace = [];
            if (this.derivativePlot && this.derivativePlot.config.data) {
                const trace = this.derivativePlot.config.data.find(d => d.id === 'derivative-trace');
                if (trace) { trace.points = []; this.derivativePlot.draw(); }
            }
            this._updateSelectionVisuals(this.interactions.currentSelection);
        };
        this.toggleSnapping = () => {
            this.isSnapping = !this.isSnapping;
            setActive(this.btnSnap, this.isSnapping);
        };

        const zoom = (factor) => {
            const cs = this.transform;
            if (cs) this._zoomAt(cs.padL + cs.plotW / 2, cs.padT + cs.plotH / 2, factor);
        };

        if (cfg.derivativeToggle) {
            // With a derivative plot the toggle shows/hides f' there (shown by default),
            // otherwise it overlays f' on the main plot (hidden by default)
            const usesDP = !!cfg.addDerivativePlot;
            const isOn = () => usesDP ? cfg.showDerivativeFunction !== false : cfg.showDerivative === true;
            const btnDeriv = add(createButton("chart", "Mostra/nascondi derivata", () => {
                if (usesDP) {
                    cfg.showDerivativeFunction = !isOn();
                    if (this.derivativePlot) {
                        this.derivativePlot.config.showDerivative = cfg.showDerivativeFunction;
                        this.derivativePlot.draw();
                    }
                } else {
                    cfg.showDerivative = !isOn();
                    this.draw();
                }
                setActive(btnDeriv, isOn());
            }, { toggle: true }));
            setActive(btnDeriv, isOn());
            if (cfg.interactive) add(createSeparator());
        }

        if (cfg.interactive) {
            add(createButton("add", "Zoom avanti", () => zoom(0.8)));
            add(createButton("remove", "Zoom indietro", () => zoom(1.25)));
            add(createButton("reset", "Ripristina vista", () => this.resetView()));
            add(createButton("fullscreen", "Schermo intero", () => this.toggleLightbox()));
        }
        if (cfg.download) {
            add(createButton("download", "Scarica SVG", () => this.downloadSVG()));
        }

        let btnPoint, btnSlope, btnTangent;
        const setMode = (mode) => {
            this.selectionMode = mode;
            setActive(btnPoint, mode === 'point');
            setActive(btnSlope, mode === 'slope');
            setActive(btnTangent, mode === 'tangent');
            this.interactions.slopeP1 = null;
            this.interactions.slopeP2 = null;
            this.interactions.draggingSelection = null;
            if (mode !== 'tangent' && mode !== 'point') this.interactions.currentSelection = null;
            const showTrace = mode === 'tangent';
            [this.btnTrace, this.btnClean, this.traceSep].forEach(el => el && el.classList.toggle('matephis-hidden', !showTrace));
            this._updateSelectionVisuals(null);
            this.svg.classList.toggle('selecting', !!mode);
        };
        const toggleMode = (mode) => setMode(this.selectionMode === mode ? null : mode);

        if (cfg.pointSelection || cfg.slopeSelection || cfg.tangentSelection) {
            add(createSeparator());
            this.btnSnap = add(createButton("snap", "Aggancia ai punti", () => this.toggleSnapping(), { toggle: true }));
            this.btnSnap.classList.add('matephis-snap-btn');
            setActive(this.btnSnap, this.isSnapping);
        }
        if (cfg.pointSelection) {
            btnPoint = add(createButton(cfg.pointSelectionIcon || "point", "Seleziona punto", () => toggleMode('point'), { toggle: true }));
        }
        if (cfg.slopeSelection) {
            btnSlope = add(createButton(cfg.slopeSelectionIcon || "slope", "Pendenza tra due punti", () => toggleMode('slope'), { toggle: true }));
        }
        if (cfg.tangentSelection) {
            btnTangent = add(createButton(cfg.tangentSelectionIcon || "tangent", "Retta tangente", () => toggleMode('tangent'), { toggle: true }));
            if (cfg.traceDerivative) {
                this.traceSep = add(createSeparator());
                this.btnTrace = add(createButton("trace", "Traccia la derivata", () => this.toggleTrace(), { toggle: true }));
                this.btnClean = add(createButton("eraser", "Cancella traccia", () => this.clearTrace()));
                [this.traceSep, this.btnTrace, this.btnClean].forEach(el => el.classList.add('matephis-hidden'));
            }
        }
        if (cfg.pointSelection === true) setMode('point');

        if (bar.children.length) this.wrapper.appendChild(bar);
        this.toolbar = bar;
    },
};
