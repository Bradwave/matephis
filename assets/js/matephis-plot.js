(() => {
  // assets/js/matephis-plot-src/core/plot.js
  var MatephisIcons = {
    add: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>`,
    remove: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-440v-80h560v80H200Z"/></svg>`,
    reset: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M120-120v-240h80v160h160v80H120Zm480 0v-80h160v-160h80v240H600ZM120-600v-240h240v80H200v160h-80Zm640 0v-160H600v-80h240v240h-80ZM480-320q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Zm0-80Z"/></svg>`,
    fullscreen: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M120-120v-320h80v184l504-504H520v-80h320v320h-80v-184L256-200h184v80H120Z"/></svg>`,
    chart: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m140-220-60-60 300-300 160 160 284-320 56 56-340 384-160-160-240 240Z"/></svg>`,
    point: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M800-80H361L107-403l64-67 129 78v-368h81v512l-97-60 116 148h320v-280H461v-80h339v440ZM167-620q-13-22-20-47.5t-7-52.5q0-83 58.5-141.5T340-920q83 0 141.5 58.5T540-720q0 27-7 52.5T513-620l-69-40q8-14 12-28.5t4-31.5q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 17 4 31.5t12 28.5l-69 40Zm393 320Z"/></svg>`,
    slope: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M120-120v-742l164 164-54 54 28 28 54-54 104 104-54 54 28 28 54-54 104 104-54 54 28 28 54-54 104 104-54 54 28 28 54-54 104 104-54 54 28 28 54-54 154 154H120Zm120-120h332L240-572v332Z"/></svg>`,
    tangent: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M751-60q-9 0-18.5-1T714-64L209-172q-44-9-76.5-35.5T83-272q-2-4-2-18 3-12 13-19t23-5q7 2 12 6.5t8 10.5q12 25 33.5 43t50.5 24l19 4 140-94-39-172 117-188h-94l-76 122-68-42 100-160h228q27 0 43.5 15t22.5 28l21 48q20 48 64.5 78.5T800-560v80q-70 0-128-33.5T579-602l-72 115 133 107 40 248 46 9q6 2 12.5 2.5t12.5.5q24 0 43-8t36-22q5-5 26-6 13 2 19.5 13t4.5 22q-1 5-3.5 9t-6.5 8q-25 22-56 33t-63 11Zm-155-90-30-186-114-81 18 133-121 81 247 53Zm44-610q-33 0-56.5-23.5T560-840q0-33 23.5-56.5T640-920q33 0 56.5 23.5T720-840q0 33-23.5 56.5T640-760Z"/></svg>`,
    trace: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M115-395q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35Zm113.5-56.5Q240-463 240-480t-11.5-28.5Q217-520 200-520t-28.5 11.5Q160-497 160-480t11.5 28.5Q183-440 200-440t28.5-11.5ZM395-395q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35Zm113.5-56.5Q520-463 520-480t-11.5-28.5Q497-520 480-520t-28.5 11.5Q440-497 440-480t11.5 28.5Q463-440 480-440t28.5-11.5ZM675-395q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35Z"/></svg>`,
    eraser: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M690-240h190v80H610l80-80Zm-500 80L48-302l552-572 312 312-392 402H190Zm296-80 314-322-198-198-442 456 64 64h262Zm-6-240Z"/></svg>`,
    play: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>`,
    pause: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>`,
    snap: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-40v-167l-44 43-56-56 140-140 140 140-56 56-44-43v167h-80ZM220-340l-56-56 43-44H40v-80h167l-43-44 56-56 140 140-140 140Zm520 0L600-480l140-140 56 56-43 44h167v80H753l43 44-56 56Zm-260-80q-25 0-42.5-17.5T420-480q0-25 17.5-42.5T480-540q25 0 42.5 17.5T540-480q0 25-17.5 42.5T480-420Zm0-180L340-740l56-56 44 43v-167h80v167l44-43 56 56-140 140Z"/></svg>`
  };
  var MatephisPlot = class _MatephisPlot {
    // =========================================================================
    // STATIC INITIALIZATION
    // =========================================================================
    /**
     * Scans the document for plot containers and initializes them.
     * Handles both explicit `.matephis-plot` divs and `language-matephis` code blocks.
     */
    static init() {
      document.querySelectorAll(".matephis-plot").forEach((container) => {
        try {
          if (container.getAttribute("data-processed")) return;
          const source = container.textContent;
          container.innerHTML = "";
          new _MatephisPlot(container, source);
          container.setAttribute("data-processed", "true");
        } catch (e) {
          console.error("Plot Error", e);
          container.innerHTML = `<div style="color:red; border:1px solid red; padding:5px;">Error: ${e.message}</div>`;
        }
      });
      document.querySelectorAll("code.language-matephis").forEach((code) => {
        let container;
        let target;
        try {
          target = code.closest("div.language-matephis") || code.closest("pre");
          if (!target) target = code.parentElement;
          if (target.getAttribute("data-processed")) return;
          const source = code.textContent;
          container = document.createElement("div");
          container.className = "matephis-plot";
          target.parentNode.insertBefore(container, target);
          target.style.display = "none";
          new _MatephisPlot(container, source);
          target.setAttribute("data-processed", "true");
        } catch (e) {
          console.error("Code Block Plot Error", e);
          if (container) {
            container.innerHTML = `<div style="color:red; border:1px solid red; padding:5px;">Error: ${e.message}</div>`;
          } else if (target) {
            const errorDiv = document.createElement("div");
            errorDiv.innerHTML = `<div style="color:red; border:1px solid red; padding:5px;">Error: ${e.message}</div>`;
            target.parentNode.insertBefore(errorDiv, target);
          }
        }
      });
    }
    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================
    /**
     * Creates a new plot instance.
     * @param {HTMLElement} container - The DOM element to render the plot into.
     * @param {string} source - JSON configuration string for the plot.
     */
    constructor(container, source) {
      this.container = container;
      this.config = JSON.parse(source);
      this.container.innerHTML = "";
      this.uid = Math.random().toString(36).substr(2, 9);
      this.wrapper = document.createElement("div");
      this.wrapper.className = "matephis-plot-container";
      if (this.config.border) this.wrapper.classList.add("bordered");
      if (this.config.interactive) this.wrapper.classList.add("interactive");
      this.container.appendChild(this.wrapper);
      this.params = {};
      if (this.config.params) {
        for (let key in this.config.params) {
          this.params[key] = this.config.params[key].val || 0;
        }
      }
      this.freePoints = {};
      this._hasFreePoints = Array.isArray(this.config.data) && this.config.data.some((d) => d.freeCoordinates === true && d.name);
      this.view = { xMin: null, xMax: null, yMin: null, yMax: null };
      this.interactions = { isDragging: false, startX: 0, startY: 0, hasMoved: false, draggingSelection: null, slopeP1: null, slopeP2: null, draggingFreePoint: null };
      this.selectionMode = null;
      this.isSnapping = true;
      this.lastScrollTime = 0;
      window.addEventListener("scroll", () => {
        this.lastScrollTime = Date.now();
      }, { passive: true });
      if (this.config.fullWidth) this.config.cssWidth = "100%";
      if (this.config.cssWidth) {
        this.wrapper.style.maxWidth = this.config.cssWidth;
        this.wrapper.style.width = "100%";
      }
      if (this.config.align === "center") this.wrapper.classList.add("align-center");
      else if (this.config.align === "left") this.wrapper.classList.add("align-left");
      if (this.config.marginBottom) {
        this.wrapper.style.marginBottom = typeof this.config.marginBottom === "number" ? `${this.config.marginBottom}px` : this.config.marginBottom;
      }
      const isDarkThemeInit = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "dark" || this.config && this.config.theme === "dark");
      const getBasePalettes = (isDark) => {
        if (isDark) {
          return {
            black: ["#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155"],
            red: ["#ff523d", "#f87171", "#fb7185", "#fda4af", "#ff6b6b", "#ffa39e"],
            sunburst: ["#ff7f51", "#ff9b54", "#ce4257", "#f472b6", "#fb923c"],
            coastal: ["#60a5fa", "#38bdf8", "#edf2f4", "#f87171", "#fb7185"],
            seaside: ["#38bdf8", "#67e8f9", "#93c5fd", "#fde047", "#FFC482"],
            default: ["#60a5fa", "#f87171", "#34d399", "#fbbf24", "#c084fc"],
            summer: ["#ff523d", "#60a5fa", "#38bdf8", "#22d3ee", "#fde047", "#fb923c", "#4ade80"]
          };
        }
        return {
          black: ["#000000", "#444444", "#6e6e6e", "#929292", "#b6b6b6", "#dadada"],
          red: ["#B01A00", "#8b2e1bff", "#ce452aff", "#e64b2cff", "#fd5a35ff", "#fa7a5d"],
          sunburst: ["#4f000b", "#720026", "#ce4257", "#ff7f51", "#ff9b54"],
          coastal: ["#2b2d42", "#2b2d42", "#edf2f4", "#ef233c", "#d90429"],
          seaside: ["#2B3A67", "#496A81", "#66999B", "#B3AF8F", "#FFC482"],
          default: ["#007bff", "#dc3545", "#28a745", "#fd7e14", "#6f42c1"],
          summer: ["#B01A00", "#2e4a9e", "#257fbe", "#0dacc2", "#d1b854", "#ff912a", "#4ebf62"]
        };
      };
      const updatePalettes = (isDark) => {
        this.palettes = getBasePalettes(isDark);
        Object.keys(this.palettes).forEach((key) => {
          if (Array.isArray(this.palettes[key])) {
            this.palettes[key].forEach((c, i) => this.palettes[`${key}${i + 1}`] = c);
          }
        });
      };
      updatePalettes(isDarkThemeInit);
      if (typeof window !== "undefined") {
        window.addEventListener("matephis-theme-change", () => {
          const dark = document.documentElement.getAttribute("data-theme") === "dark";
          updatePalettes(dark);
          this.render();
        });
      }
      this._initSVG();
      const hasSelection = this.config.pointSelection || this.config.slopeSelection || this.config.tangentSelection || this.config.draggablePoints;
      if (this.config.interactive || hasSelection || this._hasFreePoints || this.config.derivativeToggle) {
        this._initControlsOverlay();
        this._initInteractions();
        if (!this.config.interactive) {
          this.wrapper.classList.add("interactive");
          this.svg.classList.add("interactive");
          this.svg.classList.remove("static");
          this.svg.onclick = null;
        }
      }
      if (this.config.params && this.config.showSliders !== false) this._initSliders();
      this.warnings = [];
      this._validateConfig();
      this.draw();
      this._renderWarnings();
      if (!this.config.interactive && !hasSelection && !this.config.draggablePoints && !this._hasFreePoints) {
        this.svg.onclick = () => this._openLightbox();
      }
      this._initResizeObserver();
      this.derivativeTrace = [];
      if (this.config.addDerivativePlot) {
        this._initDerivativePlot();
      }
    }
    // =========================================================================
    // PRIVATE: SVG INITIALIZATION
    // =========================================================================
    /**
     * Creates the SVG element and all layer groups.
     * @private
     */
    _initSVG() {
      let targetWidth = this.config.width || 600;
      if (this.config.fullWidth) {
        const cw = this.wrapper.clientWidth;
        if (cw > 50) targetWidth = cw;
        else targetWidth = window.innerWidth && window.innerWidth > 0 ? window.innerWidth : 1e3;
      }
      this.width = Math.max(50, targetWidth);
      if (this.config.aspectRatio) {
        let ratio = 1;
        if (typeof this.config.aspectRatio === "string" && this.config.aspectRatio.includes(":")) {
          const parts = this.config.aspectRatio.split(":");
          ratio = parseFloat(parts[0]) / parseFloat(parts[1]);
        } else {
          ratio = parseFloat(this.config.aspectRatio);
        }
        this.height = this.width / ratio;
      } else {
        this.height = this.config.height || this.width;
      }
      this.height = Math.max(50, this.height);
      const noNumbers = this.config.showXNumbers === false && this.config.showYNumbers === false;
      const noLabels = !this.config.axisLabels;
      const defaultPad = noNumbers && noLabels ? 10 : 20;
      if (this.config.padding !== void 0 && this.config.padding !== "auto") {
        this.padding = this.config.padding;
      } else {
        this.padding = defaultPad;
      }
      this.padL = this.padR = this.padT = this.padB = this.padding;
      if (this.config.padding === "auto") {
        const hasXLab = this.config.axisLabels && this.config.axisLabels[0];
        const hasYLab = this.config.axisLabels && this.config.axisLabels[1] || this.config.isDerivativePlot && this.config.slopeLabel;
        const hasXUnit = this.config.axisUnitMeasures && this.config.axisUnitMeasures[0];
        const hasYUnit = this.config.axisUnitMeasures && this.config.axisUnitMeasures[1] || this.config.isDerivativePlot && this.config.slopeUnitMeasure;
        if (this.config.boxPlot && !this.config.boxNumbersInside) this.padL = 45;
        if (this.config.boxPlot && !this.config.boxNumbersInside) this.padB = 40;
        if (hasYLab || hasYUnit) {
          this.padT = this.config.boxPlot ? 45 : 35;
        }
        if (hasXLab || hasXUnit) {
          this.padR = 55;
        }
      }
      const ns = "http://www.w3.org/2000/svg";
      this.svg = document.createElementNS(ns, "svg");
      this.svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      this.svg.setAttribute("width", this.width);
      this.svg.setAttribute("height", this.height);
      this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
      this.svg.setAttribute("class", "matephis-plot-svg");
      if (this.config.interactive) this.svg.classList.add("interactive");
      else this.svg.classList.add("static");
      this.svg.style.fontFamily = "var(--font-plot, monospace)";
      this.bgGroup = document.createElementNS(ns, "g");
      this.secondaryGridGroup = document.createElementNS(ns, "g");
      this.gridGroup = document.createElementNS(ns, "g");
      this.axesGroup = document.createElementNS(ns, "g");
      this.numbersGroup = document.createElementNS(ns, "g");
      this.dataGroup = document.createElementNS(ns, "g");
      this.dataGroup.setAttribute("clip-path", `url(#clip_${this.uid})`);
      this.selectionGroup = document.createElementNS(ns, "g");
      this.selectionGroup.setAttribute("clip-path", `url(#clip_${this.uid})`);
      this.labelGroup = document.createElementNS(ns, "g");
      this.legendGroup = document.createElementNS(ns, "g");
      const defs = document.createElementNS(ns, "defs");
      const clipPath = document.createElementNS(ns, "clipPath");
      clipPath.setAttribute("id", `clip_${this.uid}`);
      this.clipRect = document.createElementNS(ns, "rect");
      this.clipRect.setAttribute("x", this.padL);
      this.clipRect.setAttribute("y", this.padT);
      this.clipRect.setAttribute("width", Math.max(0, this.width - this.padL - this.padR));
      this.clipRect.setAttribute("height", Math.max(0, this.height - this.padT - this.padB));
      clipPath.appendChild(this.clipRect);
      defs.appendChild(clipPath);
      this._arrowMarkerId = `arrow_${this.uid}`;
      this.svg.appendChild(defs);
      this._svgDefs = defs;
      this.svg.appendChild(this.bgGroup);
      this.svg.appendChild(this.secondaryGridGroup);
      this.svg.appendChild(this.gridGroup);
      this.svg.appendChild(this.axesGroup);
      if (this.config.renderOrder === "numbers-top") {
        this.svg.appendChild(this.dataGroup);
        this.svg.appendChild(this.numbersGroup);
      } else {
        this.svg.appendChild(this.numbersGroup);
        this.svg.appendChild(this.dataGroup);
        this.svg.appendChild(this.selectionGroup);
      }
      this.svg.appendChild(this.labelGroup);
      this.svg.appendChild(this.legendGroup);
      this.plotStage = document.createElement("div");
      this.plotStage.className = "matephis-plot-stage";
      this.plotStage.appendChild(this.svg);
      this.wrapper.appendChild(this.plotStage);
    }
    /**
     * Initializes the secondary derivative plot.
     * @private
     */
    _initDerivativePlot() {
      const div = document.createElement("div");
      div.className = "matephis-derivative-plot";
      div.style.marginTop = "10px";
      this.wrapper.appendChild(div);
      const cfg = JSON.parse(JSON.stringify(this.config));
      delete cfg.addDerivativePlot;
      delete cfg.traceDerivative;
      delete cfg.title;
      delete cfg.slopeSelection;
      delete cfg.tangentSelection;
      delete cfg.pointSelection;
      cfg.params = JSON.parse(JSON.stringify(this.config.params || {}));
      if (cfg.data && Array.isArray(cfg.data)) {
        cfg.data = cfg.data.filter((item) => item.fn || item.type === "interpolation");
      }
      cfg.legend = false;
      cfg.showSliders = false;
      cfg.showToolbar = false;
      cfg.showPoints = false;
      cfg.width = this.width;
      cfg.cssWidth = "100%";
      delete cfg.fullWidth;
      delete cfg.height;
      delete cfg.align;
      delete cfg.marginLeft;
      delete cfg.marginRight;
      delete cfg.marginBottom;
      delete cfg.border;
      cfg.showDerivative = this.config.showDerivativeFunction !== false;
      cfg.hideFunctions = true;
      cfg.isDerivativePlot = true;
      cfg.aspectRatio = cfg.derivativeAspectRatio !== void 0 ? cfg.derivativeAspectRatio : 2.5;
      cfg.height = cfg.width / cfg.aspectRatio;
      if (cfg.derivativeYLim) cfg.ylim = cfg.derivativeYLim;
      else if (cfg.derivativeAutoY) {
        cfg.ylim = [-10, 10];
      }
      if (this.config.derivativeTitle) {
        const titleDiv = document.createElement("div");
        titleDiv.className = "matephis-derivative-title";
        titleDiv.textContent = this.config.derivativeTitle;
        titleDiv.style.textAlign = "center";
        titleDiv.style.fontFamily = "sans-serif";
        titleDiv.style.fontSize = "14px";
        titleDiv.style.color = "#666";
        titleDiv.style.marginBottom = "5px";
        div.appendChild(titleDiv);
      }
      cfg.showXAxis = true;
      cfg.showYAxis = true;
      this.derivativePlot = new _MatephisPlot(div, JSON.stringify(cfg));
    }
    /**
     * Syncs the derivative plot view with the main plot.
     * @private
     */
    _syncDerivativePlot() {
      if (!this.derivativePlot) return;
      if (this.params) {
        this.derivativePlot.params = Object.assign({}, this.params);
        this.derivativePlot.config.params = this.derivativePlot.config.params || {};
        for (let k in this.params) {
          if (!this.derivativePlot.config.params[k]) this.derivativePlot.config.params[k] = {};
          this.derivativePlot.config.params[k].val = this.params[k];
        }
      }
      const currentXMin = this.view && this.view.xMin !== null ? this.view.xMin : this.config.xlim ? this.config.xlim[0] : -9.9;
      const currentXMax = this.view && this.view.xMax !== null ? this.view.xMax : this.config.xlim ? this.config.xlim[1] : 9.9;
      if (!this.derivativePlot.view) this.derivativePlot.view = {};
      this.derivativePlot.view.xMin = currentXMin;
      this.derivativePlot.view.xMax = currentXMax;
      this.derivativePlot.draw();
    }
    // =========================================================================
    // PRIVATE: PARAMETER SLIDERS
    // =========================================================================
    /**
     * Creates slider controls for adjustable parameters.
     * @private
     */
    _initSliders() {
      const controls = document.createElement("div");
      controls.className = "matephis-plot-controls";
      let basePath = _MatephisPlot.basePath || "";
      if (!basePath && _MatephisPlot.scriptUrl) {
        const src = _MatephisPlot.scriptUrl;
        const idx = src.indexOf("assets/js/matephis-plot.js");
        if (idx !== -1) basePath = src.substring(0, idx);
        else {
          const idx2 = src.indexOf("js/matephis-plot.js");
          if (idx2 !== -1) basePath = src.substring(0, idx2);
        }
      }
      for (let key in this.config.params) {
        if (this.params[key] === void 0) this.params[key] = this.config.params[key].val;
      }
      const sliderUpdaters = [];
      this.paramUIs = {};
      for (let key in this.config.params) {
        const p = this.config.params[key];
        const row = document.createElement("div");
        row.className = "matephis-slider-row";
        if (this.config.sliderBorder) row.classList.add("slider-bordered");
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
        if (typeof p.min === "string") {
          const eMin = parseFloat(this._eval(p.min, `slider ${key} min`));
          if (!isNaN(eMin)) initMin = eMin;
        }
        let initMax = p.max;
        if (typeof p.max === "string") {
          const eMax = parseFloat(this._eval(p.max, `slider ${key} max`));
          if (!isNaN(eMax)) initMax = eMax;
        }
        let initStep = p.step !== void 0 ? p.step : 0.1;
        if (typeof p.step === "string") {
          const eStep = parseFloat(this._eval(p.step, `slider ${key} step`));
          if (!isNaN(eStep)) initStep = eStep;
        }
        let decimals = 2;
        if (p.round !== void 0) {
          decimals = parseInt(p.round);
        } else if (p.step !== void 0) {
          const stepStr = initStep.toString();
          decimals = stepStr.includes(".") ? stepStr.split(".")[1].length : 0;
        }
        if (typeof initMin === "number") initMin = parseFloat(initMin.toFixed(decimals));
        if (typeof initMax === "number") initMax = parseFloat(initMax.toFixed(decimals));
        const minLabel = document.createElement("span");
        minLabel.innerHTML = typeof p.min === "string" && p.min.includes("PI") ? p.min.replace(/PI/g, "&pi;") : initMin;
        minLabel.className = "matephis-slider-min";
        const input = document.createElement("input");
        input.type = "range";
        input.min = initMin;
        input.max = initMax;
        input.step = initStep;
        input.value = p.val;
        const maxLabel = document.createElement("span");
        maxLabel.innerHTML = typeof p.max === "string" && p.max.includes("PI") ? p.max.replace(/PI/g, "&pi;") : initMax;
        maxLabel.className = "matephis-slider-max";
        const updateBounds = () => {
          if (typeof p.min === "string") {
            let eMin = parseFloat(this._eval(p.min, `slider ${key} min`));
            if (!isNaN(eMin)) {
              eMin = parseFloat(eMin.toFixed(decimals));
              if (input.min != eMin) {
                input.min = eMin;
                minLabel.innerText = eMin;
                if (this.params[key] < eMin) {
                  this.params[key] = eMin;
                  input.value = eMin;
                  valSpan.innerText = eMin;
                }
              }
            }
          }
          if (typeof p.max === "string") {
            let eMax = parseFloat(this._eval(p.max, `slider ${key} max`));
            if (!isNaN(eMax)) {
              eMax = parseFloat(eMax.toFixed(decimals));
              if (input.max != eMax) {
                input.max = eMax;
                maxLabel.innerText = eMax;
                if (this.params[key] > eMax) {
                  this.params[key] = eMax;
                  input.value = eMax;
                  valSpan.innerText = eMax;
                }
              }
            }
          }
        };
        sliderUpdaters.push(updateBounds);
        this.paramUIs[key] = { input, updateBounds, valSpan, decimals };
        input.addEventListener("input", (e) => {
          const v = parseFloat(e.target.value);
          this.params[key] = v;
          valSpan.innerText = parseFloat(v.toFixed(decimals));
          sliderUpdaters.forEach((fn) => fn());
          this.draw();
        });
        if (this.config.animate === true) {
          const playBtn = document.createElement("button");
          playBtn.className = "matephis-plot-play-btn";
          playBtn.innerHTML = MatephisIcons.play;
          let isPlaying = false;
          let animFrame = null;
          playBtn.onclick = () => {
            isPlaying = !isPlaying;
            playBtn.innerHTML = isPlaying ? MatephisIcons.pause : MatephisIcons.play;
            if (isPlaying) {
              const speed = p.speed !== void 0 ? p.speed : initStep;
              let lastTime = 0;
              const fps = p.fps || 60;
              const interval = 1e3 / fps;
              const loop = (timestamp) => {
                if (!isPlaying) return;
                if (!lastTime) lastTime = timestamp;
                if (timestamp - lastTime >= interval) {
                  let v = this.params[key] + speed;
                  let currentMax = parseFloat(input.max);
                  let currentMin = parseFloat(input.min);
                  if (v > currentMax) v = currentMin;
                  this.params[key] = v;
                  input.value = v;
                  const currentDecimals = (initStep.toString().split(".")[1] || "").length || 2;
                  valSpan.innerText = parseFloat(v.toFixed(currentDecimals));
                  sliderUpdaters.forEach((fn) => fn());
                  this.draw();
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
        controls.appendChild(row);
        if (!this.paramUIs) this.paramUIs = {};
        this.paramUIs[key] = {
          input,
          valSpan,
          updateBounds,
          decimals
        };
      }
      this.wrapper.appendChild(controls);
    }
    // =========================================================================
    // PRIVATE: CONTROLS OVERLAY
    // =========================================================================
    /**
     * Creates the zoom/pan control overlay buttons.
     * @private
     */
    _initControlsOverlay() {
      if (this.config.showToolbar === false) return;
      const overlay = document.createElement("div");
      overlay.className = "matephis-plot-toolbar";
      let basePath = _MatephisPlot.basePath || "";
      if (!basePath && _MatephisPlot.scriptUrl) {
        const src = _MatephisPlot.scriptUrl;
        const idx = src.indexOf("assets/js/matephis-plot.js");
        if (idx !== -1) basePath = src.substring(0, idx);
        else {
          const idx2 = src.indexOf("js/matephis-plot.js");
          if (idx2 !== -1) basePath = src.substring(0, idx2);
        }
      }
      const mkBtn = (iconOrName, title, cb) => {
        const b = document.createElement("button");
        b.className = "matephis-plot-btn";
        b.title = title;
        let iconCode = iconOrName;
        if (MatephisIcons[iconOrName]) {
          iconCode = MatephisIcons[iconOrName];
        } else if (iconOrName.includes("assets/img/")) {
          const nameMap = {
            "show_chart": "chart",
            "add": "add",
            "remove": "remove",
            "center_focus_weak": "reset",
            "open_in_full": "fullscreen",
            "touch_app": "point",
            "square_foot": "slope",
            "snowboarding": "tangent",
            "steppers": "trace",
            "eraser": "eraser"
          };
          for (let key in nameMap) {
            if (iconOrName.includes(key)) {
              iconCode = MatephisIcons[nameMap[key]];
              break;
            }
          }
        }
        if (iconCode.startsWith("<svg")) {
          b.innerHTML = iconCode;
          const svg = b.querySelector("svg");
          if (svg) {
            svg.style.width = "20px";
            svg.style.height = "20px";
            svg.style.pointerEvents = "none";
          }
        } else {
          const img = document.createElement("img");
          if (iconCode.startsWith("http") || iconCode.startsWith("/") || iconCode.startsWith("data:")) {
            img.src = iconCode;
          } else {
            let finalPath = basePath;
            if (finalPath && !finalPath.endsWith("/")) finalPath += "/";
            img.src = finalPath + iconCode;
          }
          img.style.width = "20px";
          img.style.height = "20px";
          img.draggable = false;
          b.appendChild(img);
        }
        b.onclick = (e) => {
          e.stopPropagation();
          cb();
        };
        return b;
      };
      this.toggleTrace = () => {
        this.isTracing = !this.isTracing;
        if (this.btnTrace) {
          this.btnTrace.classList.toggle("active", this.isTracing);
        }
      };
      this.clearTrace = () => {
        this.derivativeTrace = [];
        if (this.derivativePlot && this.derivativePlot.config.data) {
          const traceItem = this.derivativePlot.config.data.find((d) => d.id === "derivative-trace");
          if (traceItem) {
            traceItem.points = [];
            this.derivativePlot.draw();
          }
        }
        this._updateSelectionVisuals(this.interactions.currentSelection);
      };
      this.toggleSnapping = () => {
        this.isSnapping = !this.isSnapping;
        if (this.btnSnap) {
          this.btnSnap.classList.toggle("active", this.isSnapping);
        }
      };
      const zoom = (factor) => {
        if (!this.transform) return;
        const { xMin, xMax, yMin, yMax } = this.transform;
        const cx = (xMin + xMax) / 2;
        const cy = (yMin + yMax) / 2;
        const viewW = (xMax - xMin) * factor;
        const viewH = (yMax - yMin) * factor;
        this.view = {
          xMin: cx - viewW / 2,
          xMax: cx + viewW / 2,
          yMin: cy - viewH / 2,
          yMax: cy + viewH / 2
        };
        this.draw();
      };
      if (this.config.derivativeToggle) {
        const btnDeriv = mkBtn("assets/img/show_chart_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg", "Toggle Derivative", () => {
          const targetPlot = this.derivativePlot || this;
          const configKey = this.derivativePlot ? "showDerivativeFunction" : "showDerivative";
          this.config[configKey] = !this.config[configKey];
          if (this.derivativePlot) {
            this.derivativePlot.config.showDerivative = this.config.showDerivativeFunction;
            this.derivativePlot.draw();
          } else {
            this.draw();
          }
          btnDeriv.classList.toggle("active", this.config[configKey]);
        });
        const initialActive = this.derivativePlot ? this.config.showDerivativeFunction : this.config.showDerivative;
        if (initialActive) {
          btnDeriv.classList.add("active");
        }
        overlay.appendChild(btnDeriv);
        if (this.config.interactive) {
          const sep = document.createElement("div");
          sep.className = "matephis-plot-separator";
          overlay.appendChild(sep);
        }
      }
      if (this.config.interactive) {
        const btnPlus = mkBtn("assets/img/add.svg", "Zoom In", () => zoom(0.9));
        const btnMinus = mkBtn("assets/img/remove.svg", "Zoom Out", () => zoom(1.1));
        const btnReset = mkBtn("assets/img/center_focus_weak.svg", "Reset View", () => {
          if (this.config.xlim) {
            this.view.xMin = this.config.xlim[0];
            this.view.xMax = this.config.xlim[1];
          } else {
            this.view.xMin = -9.9;
            this.view.xMax = 9.9;
          }
          if (this.config.ylim) {
            this.view.yMin = this.config.ylim[0];
            this.view.yMax = this.config.ylim[1];
          } else {
            this.view.yMin = -9.9;
            this.view.yMax = 9.9;
          }
          this.draw();
        });
        overlay.appendChild(btnPlus);
        overlay.appendChild(btnMinus);
        overlay.appendChild(btnReset);
        const btnFull = mkBtn("assets/img/open_in_full.svg", "Full Screen", () => this._openLightbox());
        overlay.appendChild(btnFull);
      }
      let btnPoint, btnSlope, btnTangent;
      if (this.config.pointSelection || this.config.slopeSelection || this.config.tangentSelection) {
        const sep = document.createElement("div");
        sep.className = "matephis-plot-separator";
        overlay.appendChild(sep);
        this.btnSnap = mkBtn("snap", "Toggle Snapping", () => this.toggleSnapping());
        this.btnSnap.classList.add("matephis-snap-btn");
        if (this.isSnapping) this.btnSnap.classList.add("active");
        overlay.appendChild(this.btnSnap);
      }
      if (this.config.pointSelection) {
        btnPoint = mkBtn(this.config.pointSelectionIcon || "assets/img/touch_app.svg", "Point Selection", () => {
          if (this.selectionMode === "point") {
            this.selectionMode = null;
            btnPoint.classList.remove("active");
            this.interactions.draggingSelection = null;
            this.interactions.currentSelection = null;
            this._updateSelectionVisuals(null);
          } else {
            this.selectionMode = "point";
            btnPoint.classList.add("active");
            if (typeof btnSlope !== "undefined") btnSlope.classList.remove("active");
            if (typeof btnTangent !== "undefined") btnTangent.classList.remove("active");
            this.interactions.slopeP1 = null;
            this.interactions.slopeP2 = null;
            this._updateSelectionVisuals(null);
          }
        });
        overlay.appendChild(btnPoint);
        if (this.config.pointSelection === true) {
          this.selectionMode = "point";
          btnPoint.classList.add("active");
        }
      }
      if (this.config.slopeSelection) {
        const slopeIcon = this.config.slopeSelectionIcon || "assets/img/square_foot.svg";
        btnSlope = mkBtn(slopeIcon, "Slope Selection", () => {
          if (this.selectionMode === "slope") {
            this.selectionMode = null;
            btnSlope.classList.remove("active");
            this.interactions.slopeP1 = null;
            this.interactions.slopeP2 = null;
            this._updateSelectionVisuals(null);
            if (this.btnTrace) this.btnTrace.classList.add("matephis-hidden");
          } else {
            this.selectionMode = "slope";
            btnSlope.classList.add("active");
            if (btnTangent) btnTangent.classList.remove("active");
            if (btnPoint) btnPoint.classList.remove("active");
            this._updateSelectionVisuals(null);
            if (this.btnTrace) {
              this.btnTrace.classList.add("matephis-hidden");
            }
          }
        });
        overlay.appendChild(btnSlope);
      }
      if (this.config.tangentSelection) {
        const tangentIcon = this.config.tangentSelectionIcon || "assets/img/snowboarding.svg";
        btnTangent = mkBtn(tangentIcon, "Tangent Selection", () => {
          if (this.selectionMode === "tangent") {
            this.selectionMode = null;
            btnTangent.classList.remove("active");
            this._updateSelectionVisuals(null);
            if (this.btnTrace) this.btnTrace.classList.add("matephis-hidden");
            if (this.btnClean) this.btnClean.classList.add("matephis-hidden");
            if (this.traceSep) this.traceSep.classList.add("matephis-hidden");
          } else {
            this.selectionMode = "tangent";
            btnTangent.classList.add("active");
            if (btnSlope) btnSlope.classList.remove("active");
            if (btnPoint) btnPoint.classList.remove("active");
            this.interactions.slopeP1 = null;
            this.interactions.slopeP2 = null;
            this._updateSelectionVisuals(null);
            if (this.btnTrace) this.btnTrace.classList.remove("matephis-hidden");
            if (this.btnClean) this.btnClean.classList.remove("matephis-hidden");
            if (this.traceSep) this.traceSep.classList.remove("matephis-hidden");
          }
        });
        overlay.appendChild(btnTangent);
        if (this.config.traceDerivative) {
          this.traceSep = document.createElement("div");
          this.traceSep.className = "matephis-plot-separator matephis-hidden";
          overlay.appendChild(this.traceSep);
          this.btnTrace = mkBtn("assets/img/steppers.svg", "Trace Derivative", () => this.toggleTrace());
          this.btnTrace.classList.add("matephis-hidden");
          overlay.appendChild(this.btnTrace);
          this.btnClean = mkBtn("assets/img/eraser.svg", "Clear Trace", () => this.clearTrace());
          this.btnClean.classList.add("matephis-hidden");
          overlay.appendChild(this.btnClean);
        }
      }
      this.wrapper.appendChild(overlay);
    }
    // =========================================================================
    // PRIVATE: RESIZE OBSERVER
    // =========================================================================
    /**
     * Sets up ResizeObserver for responsive full-width plots.
     * @private
     */
    _initResizeObserver() {
      if (!window.ResizeObserver) return;
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newW = entry.contentRect.width;
          if (newW > 10 && Math.abs(newW - this.width) > 5) {
            this.width = newW;
            if (this.config.aspectRatio) {
              let ratio = 1;
              if (typeof this.config.aspectRatio === "string" && this.config.aspectRatio.includes(":")) {
                const parts = this.config.aspectRatio.split(":");
                ratio = parseFloat(parts[0]) / parseFloat(parts[1]);
              } else {
                ratio = parseFloat(this.config.aspectRatio);
              }
              this.height = this.width / ratio;
            } else {
              this.height = this.width;
            }
            this.svg.setAttribute("width", this.width);
            this.svg.setAttribute("height", this.height);
            this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
            if (this.clipRect) {
              this.clipRect.setAttribute("width", Math.max(0, this.width - this.padding * 2));
              this.clipRect.setAttribute("height", Math.max(0, this.height - this.padding * 2));
            }
            if (this.transform) {
              this.transform.width = this.width;
              this.transform.height = this.height;
            }
            this.draw();
          }
        }
      });
      this.resizeObserver.observe(this.wrapper);
    }
    // =========================================================================
    // PRIVATE: INTERACTION HANDLERS
    // =========================================================================
    /**
     * Projects point (px, py) onto segment (x1,y1)-(x2,y2).
     */
    _projectPointOnSegment(px, py, x1, y1, x2, y2) {
      const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
      if (l2 === 0) return { x: x1, y: y1, dist: Math.hypot(px - x1, py - y1) };
      let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      return { x: projX, y: projY, dist: Math.hypot(px - projX, py - projY) };
    }
    /**
     * Finds the closest point on the graph to (x, y).
     * @param {number} x
     * @param {number} y
     * @param {number} [limitToIndex] - Optional index to restrict search to specific function
     */
    _getClosestPointOnGraph(x, y, limitToIndex) {
      if (!this.plotData || this.plotData.length === 0) return null;
      let minDist = Infinity;
      let match = null;
      const threshold = 40;
      let targetX = x;
      if (this.isSnapping && this.config.snapToPoints !== false) {
        const snappedXVal = this._getSnappingX(this.transform.unmapX(x), 15);
        targetX = this.transform.mapX(snappedXVal);
      }
      this.plotData.forEach((item) => {
        if (limitToIndex !== void 0 && item.index !== limitToIndex) return;
        let dist = Infinity, candX = 0, candY = 0;
        if (item.type === "point") {
          dist = Math.hypot(x - item.cx, y - item.cy);
          candX = item.cx;
          candY = item.cy;
        } else if (item.type === "interpolation" && item.polyline) {
          if (targetX !== x) {
            for (let i = 0; i < item.polyline.length - 1; i++) {
              const p1 = item.polyline[i];
              const p2 = item.polyline[i + 1];
              const minX = Math.min(p1.valX, p2.valX);
              const maxX = Math.max(p1.valX, p2.valX);
              const valX = this.transform.unmapX(targetX);
              if (valX >= minX && valX <= maxX) {
                candX = targetX;
                if (Math.abs(p2.valX - p1.valX) > 1e-9) {
                  const t = (valX - p1.valX) / (p2.valX - p1.valX);
                  candY = p1.y + t * (p2.y - p1.y);
                } else {
                  candY = p1.y;
                }
                dist = Math.hypot(x - candX, y - candY);
                break;
              }
            }
          }
          if (candX === 0) {
            for (let i = 0; i < item.polyline.length - 1; i++) {
              const p1 = item.polyline[i];
              const p2 = item.polyline[i + 1];
              const res = this._projectPointOnSegment(x, y, p1.x, p1.y, p2.x, p2.y);
              if (res.dist < dist) {
                dist = res.dist;
                candX = res.x;
                candY = res.y;
              }
            }
          }
        } else {
          if (item.type === "fn" && targetX !== x) {
            const valX = this.transform.unmapX(targetX);
            if (!item.domain || valX >= item.domain[0] && valX <= item.domain[1]) {
              const f = new Function("x", `return ${this._makeFn(this.config.data[item.index].fn)};`);
              try {
                const valY = f(valX);
                if (isFinite(valY)) {
                  candX = targetX;
                  candY = this.safeMapY ? this.safeMapY(valY) : this.transform.mapY(valY);
                  dist = Math.hypot(x - candX, y - candY);
                }
              } catch (e) {
              }
            }
          }
          if (candX === 0) {
            const res = this._projectPointOnSegment(x, y, item.x1, item.y1, item.x2, item.y2);
            dist = res.dist;
            candX = res.x;
            candY = res.y;
          }
        }
        if (dist < threshold) {
          let replace = false;
          if (dist < minDist) {
            if (match && match.type === "point" && item.type !== "point" && minDist - dist < 15) {
              replace = false;
            } else {
              replace = true;
            }
          } else if (match && match.type !== "point" && item.type === "point" && dist - minDist < 15) {
            replace = true;
          } else if (dist === minDist && item.type === "point" && match && match.type !== "point") {
            replace = true;
          }
          if (replace) {
            minDist = dist;
            match = {
              ...item,
              x: candX,
              y: candY,
              dist
            };
          }
        }
      });
      return match;
    }
    /**
     * Snap valX to the X-coordinate of any existing point if within pixel threshold.
     * @private
     */
    _getSnappingX(valX, thresholdPx = 15) {
      if (!this.config.data) return valX;
      const mousePx = this.transform.mapX(valX);
      let bestX = valX;
      let bestDist = thresholdPx;
      this.config.data.forEach((item) => {
        if ((item.type === "points" || item.type === "interpolation" || item.points) && item.points) {
          item.points.forEach((pt) => {
            const ptX = this._eval(pt[0], "snap check");
            if (!isNaN(ptX)) {
              const px = this.transform.mapX(ptX);
              const dist = Math.abs(px - mousePx);
              if (dist < bestDist) {
                bestDist = dist;
                bestX = ptX;
              }
            }
          });
        }
        if (item.x !== void 0) {
          const ptX = this._eval(item.x, "snap check x");
          if (!isNaN(ptX)) {
            const px = this.transform.mapX(ptX);
            const dist = Math.abs(px - mousePx);
            if (dist < bestDist) {
              bestDist = dist;
              bestX = ptX;
            }
          }
        }
      });
      if (this.freePoints) {
        for (let label in this.freePoints) {
          const ptX = this.freePoints[label].x;
          const px = this.transform.mapX(ptX);
          const dist = Math.abs(px - mousePx);
          if (dist < bestDist) {
            bestDist = dist;
            bestX = ptX;
          }
        }
      }
      return bestX;
    }
    _getPointAtGraphX(valX, index) {
      if (!this.config.data || !this.config.data[index]) return null;
      if (this.isSnapping && this.config.snapToPoints !== false) {
        valX = this._getSnappingX(valX, 15);
      }
      const item = this.config.data[index];
      const plotItem = this.plotData ? this.plotData.find((pi) => pi.index === index) : null;
      if (plotItem && plotItem.type === "interpolation" && plotItem.polyline) {
        for (let i = 0; i < plotItem.polyline.length - 1; i++) {
          const p1 = plotItem.polyline[i];
          const p2 = plotItem.polyline[i + 1];
          const minX = Math.min(p1.valX, p2.valX);
          const maxX = Math.max(p1.valX, p2.valX);
          if (valX >= minX && valX <= maxX) {
            let valY = p1.valY;
            if (Math.abs(p2.valX - p1.valX) > 1e-9) {
              const t = (valX - p1.valX) / (p2.valX - p1.valX);
              valY = p1.valY + t * (p2.valY - p1.valY);
            }
            const px = this.transform.mapX(valX);
            const py = this.safeMapY ? this.safeMapY(valY) : this.transform.mapY(valY);
            return { type: "interpolation", index, x: px, y: py, valX, valY, dist: 0, polyline: plotItem.polyline };
          }
        }
        return null;
      }
      if (!item.fn) return null;
      try {
        if (item.domain) {
          const dMin = this._eval(item.domain[0], "domain min");
          const dMax = this._eval(item.domain[1], "domain max");
          if (!isNaN(dMin) && !isNaN(dMax)) {
            if (valX < dMin) valX = dMin;
            if (valX > dMax) valX = dMax;
          }
        }
        const f = new Function("x", `return ${this._makeFn(item.fn)};`);
        const valY = f(valX);
        if (this.config.complexMode === true && valY !== null && typeof valY === "object" && "re" in valY && "im" in valY) {
          if (!isFinite(valY.re) || !isFinite(valY.im)) return null;
          const px2 = this.transform.mapX(valY.re);
          const py2 = this.safeMapY ? this.safeMapY(valY.im) : this.transform.mapY(valY.im);
          return {
            type: "fn",
            index,
            x: px2,
            y: py2,
            valX,
            valY: valY.im,
            // To maintain structure, real is on X axis structurally, but evaluated with parameter x
            dist: 0,
            complex: true
          };
        }
        if (!isFinite(valY)) return null;
        const px = this.transform.mapX(valX);
        const py = this.safeMapY ? this.safeMapY(valY) : this.transform.mapY(valY);
        return {
          type: "fn",
          index,
          x: px,
          y: py,
          valX,
          valY,
          dist: 0
        };
      } catch (e) {
        return null;
      }
    }
    _getSlopeAt(match) {
      if (!match) return NaN;
      if (match.type === "fn") {
        const item = this.config.data[match.index];
        const gx = this.transform.unmapX(match.x);
        const eps = 1e-4;
        const f = new Function("x", `return ${this._makeFn(item.fn)};`);
        try {
          const y1 = f(gx - eps);
          const y2 = f(gx + eps);
          if (!isFinite(y1) || !isFinite(y2)) return NaN;
          return (y2 - y1) / (2 * eps);
        } catch (e) {
          return NaN;
        }
      }
      if (match.type === "implicit") {
        const item = this.config.data[match.index];
        const gx = this.transform.unmapX(match.x);
        const gy = this.transform.unmapY(match.y);
        const eps = 1e-4;
        const F = new Function("x", "y", `return ${this._makeFn(item.implicit)};`);
        try {
          const fx = (F(gx + eps, gy) - F(gx - eps, gy)) / (2 * eps);
          const fy = (F(gx, gy + eps) - F(gx, gy - eps)) / (2 * eps);
          if (Math.abs(fy) < 1e-9) return Infinity;
          return -fx / fy;
        } catch (e) {
          return NaN;
        }
      }
      if (match.type === "vertical") {
        return Infinity;
      }
      if (match.type === "interpolation" && match.polyline) {
        let bestM = NaN;
        let minDist = Infinity;
        for (let i = 0; i < match.polyline.length - 1; i++) {
          const p1 = match.polyline[i];
          const p2 = match.polyline[i + 1];
          const res = this._projectPointOnSegment(match.x, match.y, p1.x, p1.y, p2.x, p2.y);
          if (res.dist < minDist) {
            minDist = res.dist;
            const dy = p2.valY - p1.valY;
            const dx = p2.valX - p1.valX;
            bestM = Math.abs(dx) < 1e-9 ? Infinity : dy / dx;
          }
        }
        return bestM;
      }
      return NaN;
    }
    _updateSelectionVisuals(match) {
      this.selectionGroup.innerHTML = "";
      let prec = 2;
      if (this.transform) {
        const { xMin, xMax, padL, padR } = this.transform;
        const range = xMax - xMin;
        const pxSize = this.width - padL - padR;
        if (pxSize > 0) {
          prec = Math.min(10, Math.max(2, Math.ceil(-Math.log10(range / pxSize))));
        }
      }
      const selColor = this.config.selectionColor;
      const selRadius = this.config.selectionRadius || 5;
      const selOutline = this.config.selectionOutlineColor || "white";
      const selOutlineWidth = this.config.selectionOutlineWidth || 2;
      const drawDot = (m, color) => {
        if (!m) return;
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", m.x);
        c.setAttribute("cy", m.y);
        c.setAttribute("r", selRadius);
        c.setAttribute("fill", color);
        c.setAttribute("stroke", selOutline);
        c.setAttribute("stroke-width", selOutlineWidth);
        this.selectionGroup.appendChild(c);
      };
      const drawLabel = (x, y, txt, col) => {
        this._text(x, y, txt, "start", "alphabetic", col, "bold", "normal", this.selectionGroup, 14);
      };
      if (this.selectionMode === "slope") {
        const p1 = this.interactions.slopeP1;
        const p2 = this.interactions.slopeP2;
        let mainColor = selColor || "#B01A00";
        if (p1 && p1.index !== void 0 && this.config.data[p1.index]) {
          const item = this.config.data[p1.index];
          if (item.derivativeColor) mainColor = this._getColor(p1.index, item.derivativeColor);
        }
        if (p1 && p2) {
          const cx = p2.x, cy = p1.y;
          this._line(p1.x, p1.y, cx, cy, mainColor, 1, "5,3", this.selectionGroup);
          this._line(p2.x, p2.y, cx, cy, mainColor, 1, "5,3", this.selectionGroup);
          this._line(p1.x, p1.y, p2.x, p2.y, mainColor, 2, "", this.selectionGroup);
          const gx1 = p1.valX !== void 0 ? p1.valX : this.transform.unmapX(p1.x);
          const gy1 = p1.valY !== void 0 ? p1.valY : this.transform.unmapY(p1.y);
          const gx2 = p2.valX !== void 0 ? p2.valX : this.transform.unmapX(p2.x);
          const gy2 = p2.valY !== void 0 ? p2.valY : this.transform.unmapY(p2.y);
          const dx = gx2 - gx1;
          const dy = gy2 - gy1;
          const m = dx !== 0 ? dy / dx : Infinity;
          const xLbl = this.config.axisLabels && this.config.axisLabels[0] ? `\u0394${this.config.axisLabels[0]}` : "\u0394x";
          const yLbl = this.config.axisLabels && this.config.axisLabels[1] ? `\u0394${this.config.axisLabels[1]}` : "\u0394y";
          const lblSize = 12;
          this._text((p1.x + cx) / 2, cy + 15, `${xLbl}=${dx.toFixed(prec)}`, "middle", "top", mainColor, "normal", "normal", this.selectionGroup, lblSize);
          this._text(cx + 5, (p2.y + cy) / 2, `${yLbl}=${dy.toFixed(prec)}`, "start", "middle", mainColor, "normal", "normal", this.selectionGroup, lblSize);
          const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
          let slopeLbl = "";
          const sName = this.config.slopeLabel || "m";
          if (this.config.specifySlope) {
            const xL = this.config.axisLabels && this.config.axisLabels[0] ? this.config.axisLabels[0] : "x";
            const yL = this.config.axisLabels && this.config.axisLabels[1] ? this.config.axisLabels[1] : "y";
            slopeLbl = `${sName}=\u0394${yL}/\u0394${xL}=${m.toFixed(prec)}`;
          } else {
            slopeLbl = `${sName}=${m.toFixed(prec)}`;
          }
          drawLabel(mx + 10, my - 10, slopeLbl, mainColor);
          drawLabel(p1.x + 10, p1.y - 10, `(${gx1.toFixed(prec)}, ${gy1.toFixed(prec)})`, mainColor);
          drawLabel(p2.x + 10, p2.y - 10, `(${gx2.toFixed(prec)}, ${gy2.toFixed(prec)})`, mainColor);
        } else if (p1) {
          const gx = p1.valX !== void 0 ? p1.valX : this.transform.unmapX(p1.x);
          const gy = p1.valY !== void 0 ? p1.valY : this.transform.unmapY(p1.y);
          drawLabel(p1.x + 10, p1.y - 10, `(${gx.toFixed(prec)}, ${gy.toFixed(prec)})`, mainColor);
        }
        if (p1) drawDot(p1, mainColor);
        if (p2) drawDot(p2, mainColor);
        return;
      }
      if (this.selectionMode === "tangent") {
        if (!match) {
          if (this.derivativePlot) {
            const idx = this.derivativePlot.config.data.findIndex((d) => d.id === "current-derivative-point");
            if (idx >= 0) {
              this.derivativePlot.config.data.splice(idx, 1);
              this.derivativePlot.draw();
            }
          }
          return;
        }
        let mainColor = selColor || "#B01A00";
        if (match && match.index !== void 0 && this.config.data[match.index]) {
          const item = this.config.data[match.index];
          if (item.derivativeColor) mainColor = this._getColor(match.index, item.derivativeColor);
        }
        const gx = match.valX !== void 0 ? match.valX : this.transform.unmapX(match.x);
        const gy = match.valY !== void 0 ? match.valY : this.transform.unmapY(match.y);
        const m = this._getSlopeAt(match);
        if (!isNaN(m)) {
          if (this.derivativePlot && isFinite(m)) {
            let dotItem = this.derivativePlot.config.data.find((d) => d.id === "current-derivative-point");
            const shouldShowDerivativePoint = this.config.showDerivativePoint !== false || this.isTracing;
            if (shouldShowDerivativePoint) {
              if (!dotItem) {
                dotItem = {
                  id: "current-derivative-point",
                  type: "points",
                  points: [[gx, m]],
                  color: mainColor,
                  radius: 4
                };
                this.derivativePlot.config.data.push(dotItem);
              } else {
                dotItem.points = [[gx, m]];
              }
            } else if (dotItem) {
              this.derivativePlot.config.data = this.derivativePlot.config.data.filter((d) => d.id !== "current-derivative-point");
            }
          }
          if (this.isTracing && isFinite(m)) {
            const tx = gx;
            const ty = m;
            const lastPt = this.derivativeTrace[this.derivativeTrace.length - 1];
            if (!lastPt || Math.abs(lastPt.x - tx) > 1e-6 || Math.abs(lastPt.y - ty) > 1e-6) {
              this.derivativeTrace.push({ x: tx, y: ty });
              if (this.derivativePlot) {
                let traceItem = this.derivativePlot.config.data.find((d) => d.id === "derivative-trace");
                if (!traceItem) {
                  traceItem = {
                    id: "derivative-trace",
                    type: "points",
                    points: [],
                    color: mainColor,
                    radius: 2
                  };
                  this.derivativePlot.config.data.push(traceItem);
                }
                traceItem.points.push([tx, ty]);
                if (this.config.derivativeAutoY) {
                  let yMin2 = this.derivativePlot.config.ylim ? this.derivativePlot.config.ylim[0] : 1e3;
                  let yMax2 = this.derivativePlot.config.ylim ? this.derivativePlot.config.ylim[1] : -1e3;
                  if (ty < yMin2) yMin2 = ty - 1;
                  if (ty > yMax2) yMax2 = ty + 1;
                  this.derivativePlot.config.ylim = [yMin2, yMax2];
                  if (this.derivativePlot.view) {
                    this.derivativePlot.view.yMin = yMin2;
                    this.derivativePlot.view.yMax = yMax2;
                  }
                }
              }
            }
          }
          if (this.derivativePlot) {
            this.derivativePlot.draw();
          }
          if (!this.derivativePlot && this.derivativeTrace.length > 0) {
            let d = "";
            let started = false;
            this.derivativeTrace.forEach((pt) => {
              if (!pt) {
                started = false;
                return;
              }
              const px = this.transform.mapX(pt.x);
              const py = this.safeMapY ? this.safeMapY(pt.y) : this.transform.mapY(pt.y);
              if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
                if (!started) {
                  d += `M ${px} ${py}`;
                  started = true;
                } else d += ` L ${px} ${py}`;
              } else {
                started = false;
              }
            });
            if (d) {
              const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
              path.setAttribute("d", d);
              path.setAttribute("fill", "none");
              path.setAttribute("stroke", mainColor);
              path.setAttribute("stroke-width", 2);
              path.setAttribute("opacity", 0.5);
              this.selectionGroup.insertBefore(path, this.selectionGroup.firstChild);
            }
          }
          const { xMin, xMax, yMin, yMax, width, height, padL, padR, padT, padB } = this.transform;
          const scaleX = (width - padL - padR) / (xMax - xMin);
          const scaleY = -(height - padT - padB) / (yMax - yMin);
          const screenSlope = m === Infinity ? Infinity : m * (scaleY / scaleX);
          let dx, dy;
          const len = 60;
          if (!isFinite(screenSlope)) {
            dx = 0;
            dy = len;
          } else {
            const angle = Math.atan(screenSlope);
            dx = Math.cos(angle) * len;
            dy = Math.sin(angle) * len;
          }
          this._line(match.x - dx, match.y - dy, match.x + dx, match.y + dy, mainColor, 2, "", this.selectionGroup);
          const sName = this.config.slopeLabel || "m";
          const mStr = isFinite(m) ? m.toFixed(prec) : "\u221E";
          let label = "";
          if (this.config.specifySlope) {
            const xL = this.config.axisLabels && this.config.axisLabels[0] ? this.config.axisLabels[0] : "x";
            const yL = this.config.axisLabels && this.config.axisLabels[1] ? this.config.axisLabels[1] : "y";
            label = `${sName}=d${yL}/d${xL}=${mStr}`;
          } else {
            label = `${sName}=${mStr}`;
          }
          drawLabel(match.x + 10, match.y - 10, label, mainColor);
        }
        drawDot(match, mainColor);
        drawLabel(match.x + 10, match.y + 20, `(${gx.toFixed(prec)}, ${gy.toFixed(prec)})`, mainColor);
        return;
      }
      if (!match) return;
      const isDraggablePoint = this.config.draggablePoints && match.type === "point";
      if (!isDraggablePoint) {
        drawDot(match);
      }
      if (this.config.showCoordinates !== false) {
        let valX, valY;
        if (this.transform) {
          valX = match.valX !== void 0 ? match.valX : this.transform.unmapX(match.x);
          valY = match.valY !== void 0 ? match.valY : this.transform.unmapY(match.y);
        }
        if (valX !== void 0) {
          const lbl = `(${parseFloat(valX.toFixed(prec))}, ${parseFloat(valY.toFixed(prec))})`;
          const mainColor = selColor || "#B01A00";
          drawLabel(match.x + 10, match.y - 10, lbl, mainColor);
        }
      }
    }
    _restoreSelectionVisuals() {
      if (this.interactions.currentSelection) {
        const sel = this.interactions.currentSelection;
        if (sel.valX !== void 0 && sel.valY !== void 0) {
          const nx = this.transform.mapX(sel.valX);
          const ny = this.safeMapY ? this.safeMapY(sel.valY) : this.transform.mapY(sel.valY);
          sel.x = nx;
          sel.y = ny;
          this._updateSelectionVisuals(sel);
        }
      } else if (this.interactions.draggingSelection && typeof this.interactions.draggingSelection === "object") {
        const sel = this.interactions.draggingSelection;
        if (sel.valX !== void 0 && sel.valY !== void 0) {
          const nx = this.transform.mapX(sel.valX);
          const ny = this.safeMapY ? this.safeMapY(sel.valY) : this.transform.mapY(sel.valY);
          sel.x = nx;
          sel.y = ny;
          this._updateSelectionVisuals(sel);
        }
      }
      if (this.interactions.slopeP1) {
        const p = this.interactions.slopeP1;
        p.x = this.transform.mapX(p.valX);
        p.y = this.transform.mapY(p.valY);
      }
      if (this.interactions.slopeP2) {
        const p = this.interactions.slopeP2;
        p.x = this.transform.mapX(p.valX);
        p.y = this.transform.mapY(p.valY);
      }
      this._updateSelectionVisuals(this.interactions.currentSelection || null);
    }
    /**
     * Sets up mouse and touch event handlers for pan/zoom interactions.
     * @private
     */
    _initInteractions() {
      const allowSelection = this.config.pointSelection || this.config.slopeSelection || this.config.tangentSelection || this.config.draggablePoints;
      if (this.config.interactive === false && !allowSelection && !this._hasFreePoints) return;
      const svg = this.svg;
      let lastX, lastY;
      let isPinching = false;
      const getDist = (e) => Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      svg.onpointerdown = (e) => {
        if (Date.now() - this.lastScrollTime < 150) return;
        if (e.pointerType === "touch" && !e.isPrimary) return;
        const checkProx = (pt, mx, my) => pt ? Math.hypot(pt.x - mx, pt.y - my) < 30 : false;
        if (this._hasFreePoints) {
          const rect = svg.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          for (const pd of this.plotData) {
            if (pd.isFreePoint && Math.hypot(pd.cx - mx, pd.cy - my) < 20) {
              this.interactions.draggingFreePoint = pd;
              svg.setPointerCapture(e.pointerId);
              e.preventDefault();
              return;
            }
          }
        }
        if (this.config.draggablePoints || this.config.pointSelection || this.selectionMode) {
          const rect = svg.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          if (this.config.draggablePoints) {
            const match = this._getClosestPointOnGraph(mx, my);
            if (match && match.type === "point") {
              match.valX = this.transform.unmapX(match.x);
              match.valY = this.transform.unmapY(match.y);
              this.interactions.draggingSelection = match;
              this.interactions.currentSelection = match;
              svg.setPointerCapture(e.pointerId);
              e.preventDefault();
              return;
            }
          }
          if (this.selectionMode === "slope") {
            if (checkProx(this.interactions.slopeP1, mx, my)) {
              this.interactions.draggingSelection = "slopeP1";
              svg.setPointerCapture(e.pointerId);
              e.preventDefault();
              return;
            }
            if (checkProx(this.interactions.slopeP2, mx, my)) {
              this.interactions.draggingSelection = "slopeP2";
              svg.setPointerCapture(e.pointerId);
              e.preventDefault();
              return;
            }
            const match = this._getClosestPointOnGraph(mx, my);
            if (match) {
              match.valX = this.transform.unmapX(match.x);
              match.valY = this.transform.unmapY(match.y);
              this.interactions.slopeP1 = match;
              this.interactions.slopeP2 = { ...match };
              this.interactions.draggingSelection = "slopeP2";
              this._updateSelectionVisuals(null);
              svg.setPointerCapture(e.pointerId);
              e.preventDefault();
              return;
            }
          } else if (this.selectionMode === "tangent") {
            const match = this._getClosestPointOnGraph(mx, my);
            if (match) {
              match.valX = this.transform.unmapX(match.x);
              match.valY = this.transform.unmapY(match.y);
              this.interactions.draggingSelection = match;
              this.interactions.currentSelection = match;
              this._updateSelectionVisuals(match);
              svg.setPointerCapture(e.pointerId);
              e.preventDefault();
              return;
            }
          } else if (this.selectionMode === "point") {
            const match = this._getClosestPointOnGraph(mx, my);
            if (match) {
              match.valX = this.transform.unmapX(match.x);
              match.valY = this.transform.unmapY(match.y);
              this.interactions.draggingSelection = match;
              this.interactions.currentSelection = match;
              this._updateSelectionVisuals(match);
              svg.setPointerCapture(e.pointerId);
              e.preventDefault();
              return;
            }
          }
        }
        if (this.config.interactive) {
          if (!this.interactions.draggingSelection) {
            this.interactions.isDragging = true;
            this.interactions.startX = e.clientX;
            this.interactions.startY = e.clientY;
            this.interactions.hasMoved = false;
            lastX = e.clientX;
            lastY = e.clientY;
            svg.setPointerCapture(e.pointerId);
          }
          e.preventDefault();
        }
      };
      svg.onpointermove = (e) => {
        if (this.interactions.draggingFreePoint) {
          const rect = svg.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const newX = this.transform.unmapX(mx);
          const newY = this.transform.unmapY(my);
          const pd = this.interactions.draggingFreePoint;
          this.freePoints[pd.fpLabel] = { x: newX, y: newY };
          this.draw();
          e.preventDefault();
          return;
        }
        if (this.interactions.draggingSelection) {
          const rect = svg.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          let match = null;
          const ds = this.interactions.draggingSelection;
          let targetType = null;
          let targetIdx = null;
          let currentObj = null;
          if (typeof ds === "string") {
            currentObj = this.interactions[ds];
          } else {
            currentObj = ds;
          }
          if (currentObj && currentObj.type === "point" && currentObj.rawExpressions) {
            let bestDist = Infinity;
            let bestParamKey = null;
            let bestParamVal = null;
            const targetX = this.transform.unmapX(mx);
            const targetY = this.transform.unmapY(my);
            const evalAtParam = (key, t) => {
              const oldVal = this.params[key];
              this.params[key] = t;
              let evalX, evalY;
              try {
                const rawValX = this._eval(currentObj.rawExpressions[0], "drag eval x");
                if (this.config.complexMode && rawValX && typeof rawValX === "object") {
                  evalX = rawValX.re;
                  evalY = rawValX.im;
                } else {
                  evalX = rawValX;
                  evalY = currentObj.rawExpressions.length > 1 ? this._eval(currentObj.rawExpressions[1], "drag eval y") : 0;
                }
              } catch (e2) {
                evalX = void 0;
                evalY = void 0;
              }
              this.params[key] = oldVal;
              return { evalX, evalY };
            };
            for (let key in this.params) {
              const rx = new RegExp(`(?<![a-zA-Z0-9_])(${key})(?![a-zA-Z0-9_])`);
              const isParametric = currentObj.rawExpressions.some((expr) => rx.test(expr));
              if (isParametric && this.paramUIs && this.paramUIs[key]) {
                const pMin = parseFloat(this.paramUIs[key].input.min);
                const pMax = parseFloat(this.paramUIs[key].input.max);
                const rawStep = parseFloat(this.paramUIs[key].input.step) || 0;
                const pStep = rawStep > 0 ? rawStep : (pMax - pMin) / 100;
                const stepsCount = rawStep > 0 ? Math.floor((pMax - pMin) / pStep) : 100;
                for (let i = 0; i <= stepsCount; i++) {
                  const t = pMin + i * pStep;
                  const clamped = Math.min(t, pMax);
                  const { evalX, evalY } = evalAtParam(key, clamped);
                  if (evalX !== void 0 && evalY !== void 0) {
                    const distSq = (evalX - targetX) ** 2 + (evalY - targetY) ** 2;
                    if (distSq < bestDist) {
                      bestDist = distSq;
                      bestParamKey = key;
                      bestParamVal = clamped;
                    }
                  }
                }
              }
            }
            if (bestParamKey !== null && bestParamVal !== null) {
              const ui = this.paramUIs[bestParamKey];
              const cleanVal = parseFloat(bestParamVal.toFixed(ui.decimals));
              this.params[bestParamKey] = cleanVal;
              ui.input.value = cleanVal;
              ui.valSpan.innerText = parseFloat(cleanVal.toFixed(ui.decimals));
              if (this.paramUIs) {
                for (let uk in this.paramUIs) {
                  this.paramUIs[uk].updateBounds();
                }
              }
              this.draw();
              const freshMatch = this._getClosestPointOnGraph(mx, my, currentObj.index);
              if (freshMatch) {
                freshMatch.valX = this.transform.unmapX(freshMatch.x);
                freshMatch.valY = this.transform.unmapY(freshMatch.y);
                this.interactions.draggingSelection = freshMatch;
                this.interactions.currentSelection = freshMatch;
              }
              e.preventDefault();
              return;
            }
          }
          if (currentObj && currentObj.type === "fn") {
            const valX = this.transform.unmapX(mx);
            match = this._getPointAtGraphX(valX, currentObj.index);
          } else {
            const limitIndex = currentObj && currentObj.index !== void 0 ? currentObj.index : void 0;
            match = this._getClosestPointOnGraph(mx, my, limitIndex);
            if (match) {
              match.valX = this.transform.unmapX(match.x);
              match.valY = this.transform.unmapY(match.y);
            }
          }
          if (match) {
            if (ds === "slopeP1") {
              this.interactions.slopeP1 = match;
              this._updateSelectionVisuals(null);
            } else if (ds === "slopeP2") {
              this.interactions.slopeP2 = match;
              this._updateSelectionVisuals(null);
            } else {
              this.interactions.draggingSelection = match;
              this.interactions.currentSelection = match;
              this._updateSelectionVisuals(match);
            }
          }
          return;
        }
        if (!this.interactions.isDragging || isPinching) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.interactions.hasMoved = true;
        if (this.transform && this.interactions.hasMoved) {
          const { xMin, xMax, yMin, yMax, width, height, padL, padR, padT, padB } = this.transform;
          const viewW = xMax - xMin;
          const viewH = yMax - yMin;
          const plotW = width - padL - padR;
          const plotH = height - padT - padB;
          const dxUnits = dx / plotW * viewW;
          const dyUnits = dy / plotH * viewH;
          this._updateRange(-dxUnits, dyUnits);
        }
      };
      svg.onpointerup = (e) => {
        if (this.isTracing && this.derivativeTrace.length > 0) {
          const lastIdx = this.derivativeTrace.length - 1;
          if (this.derivativeTrace[lastIdx] !== null) {
            this.derivativeTrace.push(null);
            if (this.derivativePlot) {
              const traceItem = this.derivativePlot.config.data.find((d) => d.id === "derivative-trace");
              if (traceItem) traceItem.points.push(null);
            }
          }
        }
        if (!this.interactions.hasMoved && !this.interactions.draggingSelection) {
          if (this.interactions.currentSelection || this.interactions.slopeP1 || this.interactions.slopeP2) {
            this.interactions.currentSelection = null;
            this.interactions.slopeP1 = null;
            this.interactions.slopeP2 = null;
            this._updateSelectionVisuals(null);
          }
        }
        this.interactions.isDragging = false;
        this.interactions.draggingSelection = null;
        this.interactions.draggingFreePoint = null;
        svg.releasePointerCapture(e.pointerId);
      };
      svg.onwheel = (e) => {
        if (Date.now() - this.lastScrollTime < 150) return;
        if (!this.config.interactive) return;
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95;
        if (this.transform) {
          const rect = svg.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const { unmapX, unmapY, xMin, xMax, yMin, yMax } = this.transform;
          const mouseX = unmapX(mx);
          const mouseY = unmapY(my);
          const viewW = xMax - xMin;
          const viewH = yMax - yMin;
          let newW = viewW * zoomFactor;
          let newH = viewH * zoomFactor;
          if (this.config.constrainView) {
            if (this.config.xlim) {
              const maxW = this.config.xlim[1] - this.config.xlim[0];
              if (newW > maxW) newW = maxW;
            }
            if (this.config.ylim) {
              const maxH = this.config.ylim[1] - this.config.ylim[0];
              if (newH > maxH) newH = maxH;
            }
          }
          const xFrac = (mouseX - xMin) / viewW;
          const yFrac = (mouseY - yMin) / viewH;
          let newXMin = mouseX - xFrac * newW;
          let newXMax = newXMin + newW;
          let newYMin = mouseY - yFrac * newH;
          let newYMax = newYMin + newH;
          if (this.config.constrainView) {
            if (this.config.xlim) {
              if (newXMin < this.config.xlim[0]) {
                const diff = this.config.xlim[0] - newXMin;
                newXMin += diff;
                newXMax += diff;
              }
              if (newXMax > this.config.xlim[1]) {
                const diff = this.config.xlim[1] - newXMax;
                newXMin += diff;
                newXMax += diff;
              }
            }
            if (this.config.ylim) {
              if (newYMin < this.config.ylim[0]) {
                const diff = this.config.ylim[0] - newYMin;
                newYMin += diff;
                newYMax += diff;
              }
              if (newYMax > this.config.ylim[1]) {
                const diff = this.config.ylim[1] - newYMax;
                newYMin += diff;
                newYMax += diff;
              }
            }
          }
          this.view = { xMin: newXMin, xMax: newXMax, yMin: newYMin, yMax: newYMax };
          this.draw();
        }
      };
      let touchStartView = null;
      let touchStartCenter = null;
      let touchStartDist = 0;
      let isTouchActive = false;
      const getTouchCenter = (e) => {
        if (e.touches.length === 0) return null;
        if (e.touches.length === 1) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        let sx = 0, sy = 0;
        for (let i = 0; i < e.touches.length; i++) {
          sx += e.touches[i].clientX;
          sy += e.touches[i].clientY;
        }
        return { x: sx / e.touches.length, y: sy / e.touches.length };
      };
      const getTouchDist = (e) => {
        if (e.touches.length < 2) return 1;
        return Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      };
      const handleTouchStart = (e) => {
        if (Date.now() - this.lastScrollTime < 150) {
          return;
        }
        if (e.touches.length > 0) {
          if (this.config.interactive && e.cancelable) e.preventDefault();
          isTouchActive = true;
          if (this.transform) {
            const { xMin, xMax, yMin, yMax } = this.transform;
            touchStartView = { xMin, xMax, yMin, yMax, width: xMax - xMin, height: yMax - yMin };
          }
          touchStartCenter = getTouchCenter(e);
          touchStartDist = getTouchDist(e);
          isPinching = e.touches.length > 1;
        }
      };
      const handleTouchMove = (e) => {
        if (!isTouchActive) return;
        if (this.interactions.isDragging || this.interactions.draggingSelection) {
          if (e.cancelable) e.preventDefault();
          return;
        }
        if (!this.config.interactive) return;
        if (e.cancelable) e.preventDefault();
        if (!this.transform || !touchStartView || !touchStartCenter) return;
        const currentCenter = getTouchCenter(e);
        if (!currentCenter) return;
        const currentDist = getTouchDist(e);
        let scale = 1;
        if (e.touches.length > 1 && touchStartDist > 0) {
          scale = touchStartDist / currentDist;
        }
        const dxPx = currentCenter.x - touchStartCenter.x;
        const dyPx = currentCenter.y - touchStartCenter.y;
        const newW = touchStartView.width * scale;
        const newH = touchStartView.height * scale;
        const rect = svg.getBoundingClientRect();
        const pW = rect.width;
        const pH = rect.height;
        const dxUnits = dxPx / pW * newW;
        const dyUnits = dyPx / pH * newH;
        const dxGraph = -dxUnits;
        const dyGraph = dyUnits;
        const cx = (touchStartView.xMin + touchStartView.xMax) / 2;
        const cy = (touchStartView.yMin + touchStartView.yMax) / 2;
        let nXMin = cx - newW / 2;
        let nXMax = cx + newW / 2;
        let nYMin = cy - newH / 2;
        let nYMax = cy + newH / 2;
        if (this.config.constrainView) {
          if (this.config.xlim) {
            if (nXMin < this.config.xlim[0]) {
              const diff = this.config.xlim[0] - nXMin;
              nXMin += diff;
              nXMax += diff;
            }
            if (nXMax > this.config.xlim[1]) {
              const diff = this.config.xlim[1] - nXMax;
              nXMin += diff;
              nXMax += diff;
            }
          }
          if (this.config.ylim) {
            if (nYMin < this.config.ylim[0]) {
              const diff = this.config.ylim[0] - nYMin;
              nYMin += diff;
              nYMax += diff;
            }
            if (nYMax > this.config.ylim[1]) {
              const diff = this.config.ylim[1] - nYMax;
              nYMin += diff;
              nYMax += diff;
            }
          }
        }
        this.view = { xMin: nXMin, xMax: nXMax, yMin: nYMin, yMax: nYMax };
        this.draw();
      };
      const handleTouchEnd = (e) => {
        if (e.touches.length === 0) {
          isTouchActive = false;
          isPinching = false;
        } else {
          touchStartCenter = getTouchCenter(e);
          if (this.transform) {
            const { xMin, xMax, yMin, yMax } = this.transform;
            touchStartView = { xMin, xMax, yMin, yMax, width: xMax - xMin, height: yMax - yMin };
          }
          touchStartDist = getTouchDist(e);
        }
      };
      svg.addEventListener("touchstart", handleTouchStart, { passive: false });
      svg.addEventListener("touchmove", handleTouchMove, { passive: false });
      svg.addEventListener("touchend", handleTouchEnd);
      svg.addEventListener("touchcancel", handleTouchEnd);
    }
    /**
     * Updates the view range by the given deltas.
     * @private
     */
    _updateRange(dx, dy) {
      if (!this.view.xMin && this.transform) {
        this.view.xMin = this.transform.xMin;
        this.view.xMax = this.transform.xMax;
        this.view.yMin = this.transform.yMin;
        this.view.yMax = this.transform.yMax;
      }
      if (this.view.xMin !== null) {
        let nextXMin = this.view.xMin + dx;
        let nextXMax = this.view.xMax + dx;
        let nextYMin = this.view.yMin + dy;
        let nextYMax = this.view.yMax + dy;
        if (this.config.constrainView) {
          if (this.config.xlim) {
            if (nextXMin < this.config.xlim[0]) {
              const shift = this.config.xlim[0] - nextXMin;
              nextXMin += shift;
              nextXMax += shift;
            }
            if (nextXMax > this.config.xlim[1]) {
              const shift = this.config.xlim[1] - nextXMax;
              nextXMin += shift;
              nextXMax += shift;
            }
          }
          if (this.config.ylim) {
            if (nextYMin < this.config.ylim[0]) {
              const shift = this.config.ylim[0] - nextYMin;
              nextYMin += shift;
              nextYMax += shift;
            }
            if (nextYMax > this.config.ylim[1]) {
              const shift = this.config.ylim[1] - nextYMax;
              nextYMin += shift;
              nextYMax += shift;
            }
          }
        }
        this.view.xMin = nextXMin;
        this.view.xMax = nextXMax;
        this.view.yMin = nextYMin;
        this.view.yMax = nextYMax;
        this.draw();
      }
    }
    // =========================================================================
    // PRIVATE: UTILITY METHODS
    // =========================================================================
    /**
     * Adapts dark/low-luminance colors for dark mode to ensure high contrast.
     * @private
     */
    _adaptColorForTheme(color) {
      if (!color || typeof color !== "string") return color;
      const isDark = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "dark" || this.config && this.config.theme === "dark");
      if (!isDark) return color;
      const cLower = color.toLowerCase().trim();
      if (cLower === "#000" || cLower === "#000000" || cLower === "black") {
        return "#e2e8f0";
      }
      let hex = cLower;
      if (hex.startsWith("#")) {
        hex = hex.slice(1);
        if (hex.length === 3) {
          hex = hex.split("").map((c) => c + c).join("");
        }
        if (hex.length === 6) {
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          if (lum < 0.42) {
            const rN = r / 255, gN = g / 255, bN = b / 255;
            const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                case rN:
                  h = (gN - bN) / d + (gN < bN ? 6 : 0);
                  break;
                case gN:
                  h = (bN - rN) / d + 2;
                  break;
                case bN:
                  h = (rN - gN) / d + 4;
                  break;
              }
              h /= 6;
            }
            const targetL = Math.max(0.68, l * 2);
            const targetS = Math.min(0.9, Math.max(0.65, s));
            const hue2rgb = (p2, q2, t) => {
              let tc = t;
              if (tc < 0) tc += 1;
              if (tc > 1) tc -= 1;
              if (tc < 1 / 6) return p2 + (q2 - p2) * 6 * tc;
              if (tc < 1 / 2) return q2;
              if (tc < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - tc) * 6;
              return p2;
            };
            const q = targetL < 0.5 ? targetL * (1 + targetS) : targetL + targetS - targetL * targetS;
            const p = 2 * targetL - q;
            const newR = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
            const newG = Math.round(hue2rgb(p, q, h) * 255);
            const newB = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
            return `rgb(${newR}, ${newG}, ${newB})`;
          }
        }
      }
      return color;
    }
    /**
     * Gets the color for a data item by index or explicit value.
     * @private
     */
    _getColor(index, explicit) {
      if (explicit) {
        if (this.palettes[explicit]) return this._adaptColorForTheme(this.palettes[explicit]);
        if (typeof this.palettes[explicit] === "string") return this._adaptColorForTheme(this.palettes[explicit]);
        return this._adaptColorForTheme(explicit);
      }
      const theme = this.config.theme || "red";
      const palette = this.palettes[theme] || this.palettes.default;
      return this._adaptColorForTheme(palette[index % palette.length]);
    }
    /**
     * Parses a mathematical expression string into JavaScript.
     * Handles parameter substitution, implicit multiplication, and math functions.
     * @param {string} str - The mathematical expression
     * @param {string} [internalParamName=null] - Optional local parameter to avoid substituting as a global
     * @private
     */
    _makeFn(str, internalParamName = null) {
      let expr = str;
      const pointsSource = this.resolvedPoints || this.freePoints;
      for (const name in pointsSource) {
        const fp = pointsSource[name];
        const fpR = Math.sqrt(fp.x * fp.x + fp.y * fp.y);
        const fpTheta = Math.atan2(fp.y, fp.x);
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        expr = expr.replace(new RegExp(esc + "\\.theta", "g"), `(${fpTheta})`);
        expr = expr.replace(new RegExp(esc + "\\.r", "g"), `(${fpR})`);
        expr = expr.replace(new RegExp(esc + "\\.x", "g"), `(${fp.x})`);
        expr = expr.replace(new RegExp(esc + "\\.y", "g"), `(${fp.y})`);
        if (fp.rad !== void 0) expr = expr.replace(new RegExp(esc + "\\.rad", "g"), `(${fp.rad})`);
        if (fp.deg !== void 0) expr = expr.replace(new RegExp(esc + "\\.deg", "g"), `(${fp.deg})`);
      }
      for (let key in this.params) {
        if (internalParamName && key === internalParamName) continue;
        const re = new RegExp(`(?<![a-zA-Z0-9])(${key})(?=[xyt\\(])`, "g");
        expr = expr.replace(re, "$1*");
      }
      for (let key in this.params) {
        if (internalParamName && key === internalParamName) continue;
        const re = new RegExp(`\\b${key}\\b`, "g");
        expr = expr.replace(re, `(${this.params[key]})`);
      }
      expr = expr.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
      expr = expr.replace(/(\))([a-zA-Z0-9(])/g, "$1*$2");
      expr = expr.replace(/(^|[^a-zA-Z0-9])\-([a-z])\^(\d+)/g, "$1-($2^$3)");
      expr = expr.replace(/\^/g, "**");
      expr = expr.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|log|exp|abs|floor|ceil|round)\b/g, "Math.$1");
      expr = expr.replace(/\b(pi|PI)\b/g, "Math.PI");
      expr = expr.replace(/\b(e|E)\b/g, "Math.E");
      if (expr.includes("=") && this.config.complexMode !== true) {
        const parts = expr.split("=");
        expr = `(${parts[0]}) - (${parts[1]})`;
      }
      if (this.config.complexMode === true) {
        expr = expr.replace(/([^+\-*/(]+(?:\*))?(?:Math\.E\*\*)?(?:Math\.exp)?\(\s*i\s*\*\s*((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+)\s*\)/g, (match, r, theta) => {
          const radius = r ? r.replace("*", "") : "1";
          return `{re: (${radius}) * Math.cos(${theta}), im: (${radius}) * Math.sin(${theta})}`;
        });
        expr = expr.replace(/([^+\-*/()]+)\s*\+\s*i\s*\*\s*([^+\-*/()]+)/g, "{re: $1, im: $2}");
        expr = expr.replace(/([^+\-*/()]+)\s*\+\s*([^+\-*/()]+)\s*\*\s*i/g, "{re: $1, im: $2}");
        expr = expr.replace(/(?<!\w)i\s*\*\s*([^+\-*/()]+)/g, "{re: 0, im: $1}");
      }
      return expr;
    }
    /**
     * Safely evaluates a math expression or returns the number.
     * @private
     */
    _eval(val, context = "value") {
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        let subVal = val;
        const pointsSource = this.resolvedPoints || this.freePoints;
        for (const name in pointsSource) {
          const fp = pointsSource[name];
          const r = Math.sqrt(fp.x * fp.x + fp.y * fp.y);
          const theta = Math.atan2(fp.y, fp.x);
          const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          subVal = subVal.replace(new RegExp(esc + "\\.theta", "g"), `(${theta})`);
          subVal = subVal.replace(new RegExp(esc + "\\.r", "g"), `(${r})`);
          subVal = subVal.replace(new RegExp(esc + "\\.x", "g"), `(${fp.x})`);
          subVal = subVal.replace(new RegExp(esc + "\\.y", "g"), `(${fp.y})`);
          if (fp.rad !== void 0) subVal = subVal.replace(new RegExp(esc + "\\.rad", "g"), `(${fp.rad})`);
          if (fp.deg !== void 0) subVal = subVal.replace(new RegExp(esc + "\\.deg", "g"), `(${fp.deg})`);
        }
        try {
          const fnStr = this._makeFn(subVal);
          const fn = new Function(`return ${fnStr}`);
          const res = fn();
          if (this.config.complexMode === true && res && typeof res === "object" && "re" in res) {
            return res;
          }
          return res;
        } catch (e) {
          console.warn(`Error evaluating ${context}: ${val}`, e);
          return NaN;
        }
      }
      return NaN;
    }
    _substituteLabel(str) {
      if (!str || typeof str !== "string") return str;
      let res = str;
      const pointsSource = this.resolvedPoints || this.freePoints;
      for (const [name, pt] of Object.entries(pointsSource)) {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const rx = new RegExp(esc + "\\.x", "g");
        const ry = new RegExp(esc + "\\.y", "g");
        const rr = new RegExp(esc + "\\.r", "g");
        const rth = new RegExp(esc + "\\.theta", "g");
        res = res.replace(rx, (+pt.x.toFixed(2)).toString());
        res = res.replace(ry, (+pt.y.toFixed(2)).toString());
        res = res.replace(rr, (+Math.sqrt(pt.x * pt.x + pt.y * pt.y).toFixed(2)).toString());
        res = res.replace(rth, (+Math.atan2(pt.y, pt.x).toFixed(2)).toString());
        if (pt.rad !== void 0) {
          const rrad = new RegExp(esc + "\\.rad", "g");
          res = res.replace(rrad, (+pt.rad.toFixed(2)).toString());
        }
        if (pt.deg !== void 0) {
          const rdeg = new RegExp(esc + "\\.deg", "g");
          res = res.replace(rdeg, (+pt.deg.toFixed(2)).toString());
        }
      }
      return res;
    }
    draw() {
      const padL = this.padL, padR = this.padR, padT = this.padT, padB = this.padB;
      this.gridGroup.innerHTML = "";
      this.dataGroup.innerHTML = "";
      this.axesGroup.innerHTML = "";
      this.numbersGroup.innerHTML = "";
      this.labelGroup.innerHTML = "";
      this.legendGroup.innerHTML = "";
      this.bgGroup.innerHTML = "";
      this.plotData = [];
      this.resolvedPoints = Object.assign({}, this.freePoints);
      if (this.config.gridOpacity !== void 0) {
        this.gridGroup.setAttribute("opacity", this.config.gridOpacity);
      } else {
        this.gridGroup.setAttribute("opacity", 0.8);
      }
      let xMin = this.config.xlim ? this.config.xlim[0] : -9.9;
      let xMax = this.config.xlim ? this.config.xlim[1] : 9.9;
      let yMin = this.config.ylim ? this.config.ylim[0] : -9.9;
      let yMax = this.config.ylim ? this.config.ylim[1] : 9.9;
      if (this.view && this.view.xMin !== null) {
        xMin = this.view.xMin;
        xMax = this.view.xMax;
        yMin = this.view.yMin;
        yMax = this.view.yMax;
      } else if (this.view) {
        this.view.xMin = xMin;
        this.view.xMax = xMax;
        this.view.yMin = yMin;
        this.view.yMax = yMax;
      }
      if (this.config.equalAspect) {
        const plotW = this.width - padL - padR;
        const plotH = this.height - padT - padB;
        const ppU = plotW / (xMax - xMin);
        const reqH = plotH / ppU;
        const yc = (yMin + yMax) / 2;
        yMin = yc - reqH / 2;
        yMax = yc + reqH / 2;
      }
      const isXLog = this.config.xScale === "log";
      const isYLog = this.config.yScale === "log";
      if (isXLog && xMin <= 0) {
        xMin = 1e-10;
        if (xMax <= xMin) xMax = 10;
      }
      if (isYLog && yMin <= 0) {
        yMin = 1e-10;
        if (yMax <= yMin) yMax = 10;
      }
      const mapX = (x) => {
        if (isXLog) {
          if (x <= 0) return -3e4;
          const lMin = Math.log10(xMin);
          const lMax = Math.log10(xMax);
          return padL + (Math.log10(x) - lMin) / (lMax - lMin) * (this.width - padL - padR);
        }
        return padL + (x - xMin) / (xMax - xMin) * (this.width - padL - padR);
      };
      const mapY = (y) => {
        if (isYLog) {
          if (y <= 0) return 3e4;
          const lMin = Math.log10(yMin);
          const lMax = Math.log10(yMax);
          return this.height - padB - (Math.log10(y) - lMin) / (lMax - lMin) * (this.height - padB - padT);
        }
        return this.height - padB - (y - yMin) / (yMax - yMin) * (this.height - padB - padT);
      };
      const fixedUnmapX = (px) => {
        if (isXLog) {
          const lMin = Math.log10(xMin);
          const lMax = Math.log10(xMax);
          const lVal = lMin + (px - padL) / (this.width - padL - padR) * (lMax - lMin);
          return Math.pow(10, lVal);
        }
        return xMin + (px - padL) / (this.width - padL - padR) * (xMax - xMin);
      };
      const unmapY = (py) => {
        if (isYLog) {
          const lMin = Math.log10(yMin);
          const lMax = Math.log10(yMax);
          const lVal = lMin + (this.height - padB - py) / (this.height - padB - padT) * (lMax - lMin);
          return Math.pow(10, lVal);
        }
        return yMin + (this.height - padB - py) / (this.height - padB - padT) * (yMax - yMin);
      };
      this.transform = {
        mapX,
        mapY,
        unmapX: fixedUnmapX,
        unmapY,
        xMin,
        xMax,
        yMin,
        yMax,
        width: this.width,
        height: this.height,
        padL,
        padR,
        padT,
        padB
      };
      const ns = "http://www.w3.org/2000/svg";
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", 0);
      rect.setAttribute("y", 0);
      rect.setAttribute("width", this.width);
      rect.setAttribute("height", this.height);
      rect.setAttribute("fill", "none");
      rect.setAttribute("class", "matephis-plot-bg");
      this.bgGroup.appendChild(rect);
      const isDark = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "dark" || this.config && this.config.theme === "dark");
      const gridColor = isDark ? "#404040" : "#808080";
      const axisColor = isDark ? "#e2e8f0" : "#333";
      const calculateNiceStep = (range, pixelSize) => {
        const minPxPerStep = 100;
        const targetSteps = Math.max(2, pixelSize / minPxPerStep);
        const rawStep = range / targetSteps;
        const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalized = rawStep / mag;
        let step;
        if (normalized < 1.5) step = 1 * mag;
        else if (normalized < 3) step = 2 * mag;
        else if (normalized < 7) step = 5 * mag;
        else step = 10 * mag;
        return step;
      };
      const autoXStep = calculateNiceStep(xMax - xMin, this.width - padL - padR);
      const autoYStep = calculateNiceStep(yMax - yMin, this.height - padT - padB);
      const parseStep = (val, def) => {
        if (val === void 0) return { val: def, isPi: false };
        if (typeof val === "number") return { val, isPi: false };
        const isPi = /pi/i.test(val);
        let num = def;
        try {
          const expr = val.replace(/pi/gi, "Math.PI");
          num = new Function("return " + expr)();
        } catch (e) {
        }
        return { val: num, isPi };
      };
      const xStepObj = parseStep(this.config.xStep, autoXStep);
      const yStepObj = parseStep(this.config.yStep, autoYStep);
      const xNumStepObj = this.config.xNumberStep !== void 0 ? parseStep(this.config.xNumberStep, xStepObj.val) : xStepObj;
      const yNumStepObj = this.config.yNumberStep !== void 0 ? parseStep(this.config.yNumberStep, yStepObj.val) : yStepObj;
      const formatTick = (val, isPi, step) => {
        if (!isPi) {
          let s = step || 1;
          let p = 0;
          let e = 1;
          while (Math.abs(Math.round(s * e) / e - s) > 1e-9 && p < 10) {
            e *= 10;
            p++;
          }
          return parseFloat(val.toFixed(p));
        }
        const v = val / Math.PI;
        if (Math.abs(v) < 1e-6) return "0";
        if (Math.abs(v - 1) < 1e-6) return "\u03C0";
        if (Math.abs(v + 1) < 1e-6) return "-\u03C0";
        if (Math.abs(v - Math.round(v)) < 1e-6) return Math.round(v) + "\u03C0";
        const d2 = v * 2;
        if (Math.abs(d2 - Math.round(d2)) < 1e-6) {
          const n = Math.round(d2);
          return (n === 1 ? "" : n === -1 ? "-" : n) + "\u03C0/2";
        }
        const d4 = v * 4;
        if (Math.abs(d4 - Math.round(d4)) < 1e-6) {
          const n = Math.round(d4);
          return (n === 1 ? "" : n === -1 ? "-" : n) + "\u03C0/4";
        }
        return v.toFixed(2) + "\u03C0";
      };
      const xStep = xStepObj.val;
      const yStep = yStepObj.val;
      this.secondaryGridGroup.innerHTML = "";
      const mainOpacity = this.config.gridOpacity !== void 0 ? this.config.gridOpacity : 0.5;
      this.secondaryGridGroup.setAttribute("opacity", this.config.secondaryGridOpacity !== void 0 ? this.config.secondaryGridOpacity : mainOpacity * 0.5);
      if (this.config.polar === true) {
        const isDeg = this.config.polarUnits === "deg";
        const rStep = xStep;
        const maxR = Math.sqrt(Math.max(xMin * xMin, xMax * xMax) + Math.max(yMin * yMin, yMax * yMax));
        for (let r = rStep; r <= maxR; r += rStep) {
          const pxR = r / (xMax - xMin) * (this.width - padL - padR);
          this._circle(mapX(0), mapY(0), pxR, gridColor, 1.5, "", this.gridGroup);
          if (this.config.showXNumbers !== false) {
            const px = mapX(r);
            if (px >= padL && px <= this.width - padR) {
              this._text(px, mapY(0) + 12, formatTick(r, false, rStep), "middle", "hanging", "#666", "normal", "normal", this.numbersGroup, this._getConfigSize("numberSize"));
            }
          }
        }
        const aStep = isDeg ? 30 : Math.PI / 6;
        const maxA = isDeg ? 360 : 2 * Math.PI;
        for (let a = 0; a < maxA - 1e-9; a += aStep) {
          const rad = isDeg ? a * Math.PI / 180 : a;
          const endX = mapX(maxR * Math.cos(rad));
          const endY = mapY(maxR * Math.sin(rad));
          this._line(mapX(0), mapY(0), endX, endY, gridColor, 1, "4,4", this.gridGroup);
          let lx = maxR * Math.cos(rad);
          let ly = maxR * Math.sin(rad);
          let scale = 1;
          if (lx > xMax) scale = Math.min(scale, xMax / lx);
          if (lx < xMin) scale = Math.min(scale, Math.abs(xMin / lx));
          if (ly > yMax) scale = Math.min(scale, yMax / ly);
          if (ly < yMin) scale = Math.min(scale, Math.abs(yMin / ly));
          const pxLabel = mapX(lx * scale);
          const pyLabel = mapY(ly * scale);
          let align = "middle";
          let baseline = "middle";
          if (Math.abs(Math.cos(rad)) > 0.1) align = Math.cos(rad) > 0 ? "start" : "end";
          if (Math.abs(Math.sin(rad)) > 0.1) baseline = Math.sin(rad) > 0 ? "bottom" : "hanging";
          const offX = Math.cos(rad) * 10;
          const offY = -Math.sin(rad) * 10;
          let lblTxt = isDeg ? `${Math.round(a)}\xB0` : formatTick(a, true, aStep) + " rad";
          if (a === 0) lblTxt = "0" + (isDeg ? "\xB0" : " rad");
          if (pxLabel + offX >= padL && pxLabel + offX <= this.width - padR && pyLabel + offY >= padT && pyLabel + offY <= this.height - padB) {
            this._text(pxLabel + offX, pyLabel + offY, lblTxt, align, baseline, "#666", "normal", "normal", this.numbersGroup, this._getConfigSize("numberSize"));
          }
        }
      } else {
        this.secondaryGridGroup.setAttribute("opacity", this.config.secondaryGridOpacity !== void 0 ? this.config.secondaryGridOpacity : mainOpacity * 0.5);
        const defaultSecX = xStep / 5;
        const defaultSecY = yStep / 5;
        const showSec = this.config.showSecondaryGrid !== false;
        if (showSec && (this.config.xStepSecondary !== void 0 || defaultSecX)) {
          const sxStepObj = parseStep(this.config.xStepSecondary, defaultSecX);
          const sxStep = sxStepObj.val;
          const startSX = Math.ceil(xMin / sxStep) * sxStep;
          for (let x = startSX; x <= xMax + 1e-9; x += sxStep) {
            const px = mapX(x);
            if (px < padL || px > this.width - padR) continue;
            this._line(px, padT, px, this.height - padB, gridColor, 1.5, "", this.secondaryGridGroup);
          }
        }
        if (showSec && (this.config.yStepSecondary !== void 0 || defaultSecY)) {
          const syStepObj = parseStep(this.config.yStepSecondary, defaultSecY);
          const syStep = syStepObj.val;
          const startSY = Math.ceil(yMin / syStep) * syStep;
          for (let y = startSY; y <= yMax + 1e-9; y += syStep) {
            const py = mapY(y);
            if (py < padT || py > this.height - padB) continue;
            this._line(padL, py, this.width - padR, py, gridColor, 1.5, "", this.secondaryGridGroup);
          }
        }
        if (isXLog) {
          const startK = Math.floor(Math.log10(xMin));
          const endK = Math.ceil(Math.log10(xMax));
          const showSec2 = this.config.showSecondaryGrid !== false;
          if (showSec2) {
            for (let k = startK; k <= endK; k++) {
              for (let m = 2; m <= 9; m++) {
                const x = m * Math.pow(10, k);
                if (x < xMin || x > xMax) continue;
                const px = mapX(x);
                if (px < this.padding || px > this.width - this.padding) continue;
                this._line(px, this.padding, px, this.height - this.padding, gridColor, 1.5, "", this.secondaryGridGroup);
              }
            }
          }
          for (let k = startK; k <= endK; k++) {
            const x = Math.pow(10, k);
            if (x < xMin || x > xMax) continue;
            const px = mapX(x);
            if (px < padL || px > this.width - padR) continue;
            if (this.config.grid !== false) this._line(px, padT, px, this.height - padB, gridColor, 1.5, "", this.gridGroup);
            if (this.config.showXTicks === true) {
              if (this.config.boxPlot) {
                this._line(px, this.height - padB, px, this.height - padB - 5, axisColor, 2, "", this.axesGroup);
                if (!this.config.boxPlotPartial) {
                  this._line(px, padT, px, padT + 5, axisColor, 2, "", this.axesGroup);
                }
              } else {
                const axisY = isYLog ? yMin <= 1 && yMax >= 1 ? mapY(1) : this.height - padB : mapY(0);
                const tickDir = axisY === this.height - padB ? -5 : 5;
                this._line(px, axisY, px, axisY + tickDir, axisColor, 2, "", this.axesGroup);
              }
            }
          }
        } else {
          const startX = Math.ceil(xMin / xStep) * xStep;
          for (let x = startX; x <= xMax + 1e-9; x += xStep) {
            const px = mapX(x);
            if (px < padL || px > this.width - padR) continue;
            if (this.config.grid !== false) this._line(px, padT, px, this.height - padB, gridColor, 1.5, "", this.gridGroup);
            if (this.config.showXTicks === true) {
              if (this.config.boxPlot) {
                this._line(px, this.height - padB, px, this.height - padB - 5, axisColor, 2, "", this.axesGroup);
                if (!this.config.boxPlotPartial) {
                  this._line(px, padT, px, padT + 5, axisColor, 2, "", this.axesGroup);
                }
              } else if (Math.abs(x) > 1e-9) {
                this._line(px, mapY(0), px, mapY(0) + 5, axisColor, 2, "", this.axesGroup);
              }
            }
          }
        }
        if (this.config.showXNumbers !== false) {
          let xVals = [];
          if (isXLog) {
            const startK = Math.floor(Math.log10(xMin));
            const endK = Math.ceil(Math.log10(xMax));
            for (let k = startK; k <= endK; k++) {
              const x = Math.pow(10, k);
              if (x >= xMin && x <= xMax) xVals.push(x);
            }
          } else {
            const xNumStep = xNumStepObj.val;
            const startNX = Math.ceil((xMin - xNumStep * 0.5) / xNumStep) * xNumStep;
            for (let x = startNX; x <= xMax + xNumStep * 0.5; x += xNumStep) {
              if (Math.abs(x) >= 1e-9) xVals.push(x);
            }
          }
          let axisY = isYLog ? yMin <= 1 && yMax >= 1 ? mapY(1) : this.height - this.padding : mapY(0);
          let numY = axisY + 15;
          let numBaseline = "top";
          let isStickyX = false;
          if (this.config.boxPlot) {
            if (this.config.boxNumbersInside) {
              numY = this.height - this.padding - 2;
              numBaseline = "bottom";
              isStickyX = true;
            } else {
              numY = this.height - this.padding + 12;
              numBaseline = "hanging";
            }
          } else {
            if (axisY < this.padding) {
              numY = this.padding + 5;
              numBaseline = "hanging";
              isStickyX = true;
            } else if (axisY > this.height - this.padding) {
              numY = this.height - this.padding - 5;
              numBaseline = "bottom";
              isStickyX = true;
            }
          }
          for (let i = 0; i < xVals.length; i++) {
            const x = xVals[i];
            let px = mapX(x);
            let align = "middle";
            if (Math.abs(px - padL) < 4) {
              px = padL;
              align = "start";
            } else if (Math.abs(px - (this.width - padR)) < 4) {
              px = this.width - padR;
              align = "end";
            }
            if (px < padL || px > this.width - padR) continue;
            const baseFs = this._getConfigSize("numberSize");
            const fsVal = isStickyX ? baseFs * 0.85 : baseFs;
            const colVal = isStickyX ? "#999" : "#666";
            if (x < -1e-9 && align === "middle") {
              px -= fsVal * 0.3;
            }
            const tickStr = isXLog ? x >= 1e6 || x <= 1e-4 ? x.toExponential() : x.toString() : formatTick(x, xNumStepObj.isPi, xNumStepObj.val);
            this._text(px, numY, tickStr, align, numBaseline, colVal, "normal", "normal", this.numbersGroup, fsVal);
          }
        }
        if (isYLog) {
          const startK = Math.floor(Math.log10(yMin));
          const endK = Math.ceil(Math.log10(yMax));
          const showSec2 = this.config.showSecondaryGrid !== false;
          if (showSec2) {
            for (let k = startK; k <= endK; k++) {
              for (let m = 2; m <= 9; m++) {
                const y = m * Math.pow(10, k);
                if (y < yMin || y > yMax) continue;
                const py = mapY(y);
                if (py < padT || py > this.height - padB) continue;
                this._line(padL, py, this.width - padR, py, gridColor, 1.5, "", this.secondaryGridGroup);
              }
            }
          }
          for (let k = startK; k <= endK; k++) {
            const y = Math.pow(10, k);
            if (y < yMin || y > yMax) continue;
            const py = mapY(y);
            if (py < padT || py > this.height - padB) continue;
            if (this.config.grid !== false) this._line(padL, py, this.width - padR, py, gridColor, 1.5, "", this.gridGroup);
            if (this.config.showYTicks === true) {
              if (this.config.boxPlot) {
                this._line(padL, py, padL + 5, py, axisColor, 2, "", this.axesGroup);
                if (!this.config.boxPlotPartial) {
                  this._line(this.width - padR, py, this.width - padR - 5, py, axisColor, 2, "", this.axesGroup);
                }
              } else {
                const axisX = isXLog ? xMin <= 1 && xMax >= 1 ? mapX(1) : padL : mapX(0);
                const tickDir = axisX === padL ? 5 : -5;
                this._line(axisX + tickDir, py, axisX, py, axisColor, 2, "", this.axesGroup);
              }
            }
          }
        } else {
          const startY = Math.ceil(yMin / yStep) * yStep;
          for (let y = startY; y <= yMax + 1e-9; y += yStep) {
            const py = mapY(y);
            if (py < padT || py > this.height - padB) continue;
            if (this.config.grid !== false) this._line(padL, py, this.width - padR, py, gridColor, 1.5, "", this.gridGroup);
            if (this.config.showYTicks === true) {
              if (this.config.boxPlot) {
                this._line(padL, py, padL + 5, py, axisColor, 2, "", this.axesGroup);
                if (!this.config.boxPlotPartial) {
                  this._line(this.width - padR, py, this.width - padR - 5, py, axisColor, 2, "", this.axesGroup);
                }
              } else if (Math.abs(y) > 1e-9) {
                this._line(mapX(0) - 5, py, mapX(0), py, axisColor, 2, "", this.axesGroup);
              }
            }
          }
        }
        if (this.config.showYNumbers !== false) {
          let yVals = [];
          if (isYLog) {
            const startK = Math.floor(Math.log10(yMin));
            const endK = Math.ceil(Math.log10(yMax));
            for (let k = startK; k <= endK; k++) {
              const y = Math.pow(10, k);
              if (y >= yMin && y <= yMax) yVals.push(y);
            }
          } else {
            const yNumStep = yNumStepObj.val;
            const startNY = Math.ceil((yMin - yNumStep * 0.5) / yNumStep) * yNumStep;
            for (let y = startNY; y <= yMax + yNumStep * 0.5; y += yNumStep) {
              if (Math.abs(y) >= 1e-9) yVals.push(y);
            }
          }
          let axisX = isXLog ? xMin <= 1 && xMax >= 1 ? mapX(1) : padL : mapX(0);
          let numX = axisX - 5;
          let numAlign = "end";
          let isStickyY = false;
          if (this.config.boxPlot) {
            if (this.config.boxNumbersInside) {
              numX = padL + 4;
              numAlign = "start";
              isStickyY = true;
            } else {
              numX = padL - 8;
              numAlign = "end";
            }
          } else {
            if (axisX < padL) {
              numX = padL + 5;
              numAlign = "start";
              isStickyY = true;
            } else if (axisX > this.width - padR) {
              numX = this.width - padR - 5;
              numAlign = "end";
              isStickyY = true;
            }
          }
          for (let i = 0; i < yVals.length; i++) {
            const y = yVals[i];
            let py = mapY(y);
            let baseline = "middle";
            if (Math.abs(py - (this.height - this.padding)) < 2) {
              py = this.height - this.padding - 5;
              baseline = "auto";
            } else if (Math.abs(py - this.padding) < 2) {
              py = this.padding + 5;
            }
            if (py < this.padding || py > this.height - this.padding) continue;
            const baseFs = this._getConfigSize("numberSize");
            const fsVal = isStickyY ? baseFs * 0.85 : baseFs;
            const colVal = isStickyY ? "#999" : "#666";
            const tickStr = isYLog ? y >= 1e6 || y <= 1e-4 ? y.toExponential() : y.toString() : formatTick(y, yNumStepObj.isPi, yNumStepObj.val);
            this._text(numX, py, tickStr, numAlign, baseline, colVal, "normal", "normal", this.numbersGroup, fsVal);
          }
        }
      }
      if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
        if (this.config.showXNumbers !== false || this.config.showYNumbers !== false) {
          const px = mapX(0) - 5;
          const py = mapY(0) + 15;
          this._text(px, py, "0", "end", "top", "#666", "normal", "normal", this.numbersGroup, this._getConfigSize("numberSize"));
        }
      }
      const x0 = mapX(0), y0 = mapY(0);
      if (this.config.boxPlot) {
        this._line(padL, this.height - padB, this.width - padR, this.height - padB, axisColor, 2, "", this.axesGroup);
        this._line(padL, padT, padL, this.height - padB, axisColor, 2, "", this.axesGroup);
        if (!this.config.boxPlotPartial) {
          this._line(padL, padT, this.width - padR, padT, axisColor, 2, "", this.axesGroup);
          this._line(this.width - padR, padT, this.width - padR, this.height - padB, axisColor, 2, "", this.axesGroup);
        }
      } else {
        const showY = this.config.showYAxis !== false;
        const showX = this.config.showXAxis !== false;
        if (showY && x0 >= padL && x0 <= this.width - padR) this._line(x0, padT, x0, this.height - padB, axisColor, 2, "", this.axesGroup);
        if (showX && y0 >= padT && y0 <= this.height - padB) this._line(padL, y0, this.width - padR, y0, axisColor, 2, "", this.axesGroup);
      }
      if (this.config.axisArrows && !this.config.boxPlot) {
        const defs = document.createElementNS(ns, "defs");
        const markerW = 10, markerH = 10;
        const arrowPath = `M 0 0 L 10 5 L 0 10 z`;
        const mkX = document.createElementNS(ns, "marker");
        mkX.setAttribute("id", "arrowX");
        mkX.setAttribute("viewBox", "0 0 10 10");
        mkX.setAttribute("refX", "0");
        mkX.setAttribute("refY", "5");
        mkX.setAttribute("markerWidth", 6);
        mkX.setAttribute("markerHeight", 6);
        mkX.setAttribute("orient", "auto");
        const pX = document.createElementNS(ns, "path");
        pX.setAttribute("d", arrowPath);
        pX.setAttribute("fill", axisColor);
        mkX.appendChild(pX);
        const mkY = document.createElementNS(ns, "marker");
        mkY.setAttribute("id", "arrowY");
        mkY.setAttribute("viewBox", "0 0 10 10");
        mkY.setAttribute("refX", "0");
        mkY.setAttribute("refY", "5");
        mkY.setAttribute("markerWidth", 6);
        mkY.setAttribute("markerHeight", 6);
        mkY.setAttribute("orient", "auto");
        const pY = document.createElementNS(ns, "path");
        pY.setAttribute("d", arrowPath);
        pY.setAttribute("fill", axisColor);
        mkY.appendChild(pY);
        defs.appendChild(mkX);
        defs.appendChild(mkY);
        this.axesGroup.appendChild(defs);
        if (this.config.showXAxis !== false && y0 >= padT && y0 <= this.height - padB) {
          const axX = this.width - padR + 5;
          const axY = y0;
          const arrowXPoly = document.createElementNS(ns, "polygon");
          arrowXPoly.setAttribute("points", `${axX},${axY} ${axX - 8},${axY - 4} ${axX - 8},${axY + 4}`);
          arrowXPoly.setAttribute("fill", axisColor);
          arrowXPoly.setAttribute("class", "matephis-plot-arrow");
          this.axesGroup.appendChild(arrowXPoly);
        }
        if (this.config.showYAxis !== false && x0 >= padL && x0 <= this.width - padR) {
          const ayX = x0;
          const ayY = padT - 5;
          const arrowYPoly = document.createElementNS(ns, "polygon");
          arrowYPoly.setAttribute("points", `${ayX},${ayY} ${ayX - 4},${ayY + 8} ${ayX + 4},${ayY + 8}`);
          arrowYPoly.setAttribute("fill", axisColor);
          arrowYPoly.setAttribute("class", "matephis-plot-arrow");
          this.axesGroup.appendChild(arrowYPoly);
        }
      }
      if (this.config.axisLabels || this.config.axisUnitMeasures || this.config.isDerivativePlot) {
        const lblSize = this._getConfigSize("labelSize");
        const axisWeight = this.config.axisLabelWeight || "bold";
        const axisStyle = this.config.axisLabelStyle || "normal";
        const axisLabelOffset = this.config.axisLabelOffset || 5;
        const xL = this.config.axisLabels ? this.config.axisLabels[0] || "" : "";
        let yL = this.config.axisLabels ? this.config.axisLabels[1] || "" : "";
        const xU = this.config.axisUnitMeasures ? this.config.axisUnitMeasures[0] || "" : "";
        let yU = this.config.axisUnitMeasures ? this.config.axisUnitMeasures[1] || "" : "";
        if (this.config.isDerivativePlot) {
          if (this.config.slopeLabel) yL = this.config.slopeLabel;
          else if (!this.config.axisLabels) yL = "y'";
          if (this.config.slopeUnitMeasure) yU = this.config.slopeUnitMeasure;
        }
        let xText = xL;
        if (xU) xText = xL ? `${xL} (${xU})` : xU;
        let yText = yL;
        if (yU) yText = yL ? `${yL} (${yU})` : yU;
        if (this.config.boxPlot) {
          if (xText) this._text(this.width - padR + 10, this.height - padB, xText, "start", "middle", axisColor, axisWeight, axisStyle, this.axesGroup, lblSize, false);
          if (yText) this._text(padL, padT - axisLabelOffset - 10, yText, "start", "bottom", axisColor, axisWeight, axisStyle, this.axesGroup, lblSize, false);
        } else {
          if (xText) this._text(this.width - padR + axisLabelOffset, y0, xText, "start", "middle", axisColor, axisWeight, axisStyle, this.axesGroup, lblSize, false);
          if (yText) this._text(x0, padT - axisLabelOffset, yText, "middle", "bottom", axisColor, axisWeight, axisStyle, this.axesGroup, lblSize, false);
        }
      }
      const data = this.config.data || [];
      const legendItems = [];
      data.forEach((item, idx) => {
        const color = this._getColor(idx, item.color);
        const width = item.width || item.strokeWidth || 3;
        const dash = item.dash || "";
        let labelPos = null;
        if (item.labelAt) {
          const lx = this._eval(item.labelAt[0], "labelAt x");
          const ly = this._eval(item.labelAt[1], "labelAt y");
          if (!isNaN(lx) && !isNaN(ly)) {
            labelPos = { x: mapX(lx), y: mapY(ly) };
          }
        }
        if (item.label && this.config.legend) {
          legendItems.push({ color, label: item.label, type: item.points ? "point" : item.type === "interpolation" ? "interpolation" : "line", dash });
        }
        if (item.type === "interpolation" && item.points && Array.isArray(item.points)) {
          try {
            const rawPoints = [];
            item.points.forEach((pt) => {
              const vx = this._eval(pt[0], "interp x");
              if (this.config.complexMode === true && vx && typeof vx === "object" && vx.re !== void 0) {
                rawPoints.push([vx.re, vx.im]);
                return;
              }
              const vy = pt.length > 1 ? this._eval(pt[1], "interp y") : 0;
              if (!isNaN(vx) && !isNaN(vy)) rawPoints.push([vx, vy]);
            });
            if (rawPoints.length > 1) {
              const smoothness = item.smoothness !== void 0 ? item.smoothness : 0;
              const sampling = item.sampling !== void 0 ? item.sampling : 10;
              const tasks = [];
              if (this.config.hideFunctions !== true) {
                tasks.push({
                  isDerivative: false,
                  color,
                  width,
                  dash,
                  opacity: item.opacity
                });
              }
              if (this.config.showDerivative === true) {
                tasks.push({
                  isDerivative: true,
                  color: item.derivativeColor ? this._getColor(idx, item.derivativeColor) : color,
                  width: 2,
                  dash: "5,5",
                  opacity: 0.8
                  // fainer but visible
                });
              }
              tasks.forEach((task) => {
                let plotPoints = [];
                if (task.isDerivative) {
                  if (smoothness > 0) {
                    const mathSpline = this._getCurvePoints(rawPoints, smoothness, sampling);
                    for (let i = 0; i < mathSpline.length - 1; i++) {
                      const p1 = mathSpline[i], p2 = mathSpline[i + 1];
                      const dx = p2[0] - p1[0];
                      const dy = p2[1] - p1[1];
                      const m = Math.abs(dx) < 1e-12 ? 0 : dy / dx;
                      plotPoints.push([mapX(p1[0]), mapY(m)]);
                      if (i === mathSpline.length - 2) plotPoints.push([mapX(p2[0]), mapY(m)]);
                    }
                  } else {
                    for (let i = 0; i < rawPoints.length - 1; i++) {
                      const p1 = rawPoints[i], p2 = rawPoints[i + 1];
                      const dx = p2[0] - p1[0];
                      const dy = p2[1] - p1[1];
                      const m = Math.abs(dx) < 1e-12 ? 0 : dy / dx;
                      plotPoints.push([mapX(p1[0]), mapY(m)]);
                      plotPoints.push([mapX(p2[0]), mapY(m)]);
                    }
                  }
                } else {
                  const mappedPoints = rawPoints.map((p) => [mapX(p[0]), mapY(p[1])]);
                  if (smoothness > 0) {
                    plotPoints = this._getCurvePoints(mappedPoints, smoothness, sampling);
                  } else {
                    plotPoints = mappedPoints;
                  }
                }
                if (plotPoints.length > 0) {
                  const d = "M " + plotPoints.map((p) => `${p[0]},${p[1]}`).join(" L ");
                  const path = document.createElementNS(ns, "path");
                  path.setAttribute("d", d);
                  path.setAttribute("fill", "none");
                  path.setAttribute("stroke", task.color);
                  path.setAttribute("stroke-width", task.width);
                  if (task.dash) path.setAttribute("stroke-dasharray", task.dash);
                  if (task.opacity !== void 0) path.setAttribute("opacity", task.opacity);
                  this.dataGroup.appendChild(path);
                  if (!task.isDerivative) {
                    const cachedPoly = plotPoints.map((p) => ({
                      x: p[0],
                      y: p[1],
                      valX: this.transform.unmapX(p[0]),
                      valY: this.transform.unmapY(p[1])
                    }));
                    this.plotData.push({ type: "interpolation", isInterpolation: true, index: idx, polyline: cachedPoly });
                    if (item.showPoints !== false) {
                      rawPoints.forEach((rp) => {
                        const px = mapX(rp[0]), py = mapY(rp[1]);
                        const pColor = item.pointColor ? this._getColor(0, item.pointColor) : color;
                        const pRadius = item.pointRadius || 4;
                        const pOpacity = item.pointOpacity !== void 0 ? item.pointOpacity : item.opacity !== void 0 ? item.opacity : 1;
                        const c = document.createElementNS(ns, "circle");
                        c.setAttribute("cx", px);
                        c.setAttribute("cy", py);
                        c.setAttribute("r", pRadius);
                        c.setAttribute("fill", pColor);
                        if (pOpacity !== 1) c.setAttribute("opacity", pOpacity);
                        if (item.pointStroke) {
                          c.setAttribute("stroke", this._getColor(0, item.pointStroke));
                          c.setAttribute("stroke-width", item.pointStrokeWidth || 1);
                        } else {
                          c.setAttribute("stroke", "none");
                        }
                        this.dataGroup.appendChild(c);
                      });
                    }
                    if (!item.labelAt) {
                      const last = plotPoints[plotPoints.length - 1];
                      labelPos = { x: last[0], y: last[1] };
                    }
                  }
                }
              });
            }
          } catch (e) {
            console.warn("Interp Error", e);
          }
        }
        if (item.fn) {
          const tasks = [];
          if (this.config.hideFunctions !== true) {
            let fnExpr;
            if (item.param && Array.isArray(item.param[0])) {
              const pName = item.param[0][0];
              fnExpr = this._makeFn(item.fn, pName);
            } else {
              fnExpr = this._makeFn(item.fn);
            }
            tasks.push({
              fnExpr,
              color: this._getColor(idx, item.color),
              width: item.width || item.strokeWidth || 3,
              dash: item.dash || "",
              opacity: item.opacity,
              isDerivative: false
            });
          }
          if (this.config.showDerivative === true) {
            let fnExpr;
            if (item.param && Array.isArray(item.param[0])) {
              const pName = item.param[0][0];
              fnExpr = this._makeFn(item.fn, pName);
            } else {
              fnExpr = this._makeFn(item.fn);
            }
            tasks.push({
              fnExpr,
              color: item.derivativeColor ? this._getColor(idx, item.derivativeColor) : this._getColor(idx, item.color),
              width: 2,
              // thinner?
              dash: "5,5",
              // dashed
              opacity: 0.5,
              // fainter
              isDerivative: true
            });
          }
          tasks.forEach((task) => {
            try {
              let domain = null;
              if (item.domain && Array.isArray(item.domain)) {
                const dMin = this._eval(item.domain[0], "domain min");
                const dMax = this._eval(item.domain[1], "domain max");
                if (!isNaN(dMin) && !isNaN(dMax)) {
                  domain = [dMin, dMax];
                }
              }
              let d = "";
              let started = false;
              let f;
              const paramVar = item.param && Array.isArray(item.param[0]) ? item.param[0][0] : "x";
              if (task.isDerivative) {
                const baseExpr = task.fnExpr;
                const baseF = new Function(paramVar, `return ${baseExpr};`);
                f = (val) => {
                  const eps = 1e-4;
                  const y1 = baseF(val - eps);
                  const y2 = baseF(val + eps);
                  if (!isFinite(y1) || !isFinite(y2)) return NaN;
                  return (y2 - y1) / (2 * eps);
                };
              } else {
                f = new Function(paramVar, `return ${task.fnExpr};`);
              }
              if (!task.isDerivative) {
                try {
                  const testVal = f(0);
                  if (this.config.complexMode === true && testVal && typeof testVal === "object" && "re" in testVal) {
                  } else if (!isFinite(testVal) && testVal !== void 0 && testVal !== null && isNaN(testVal) && typeof testVal !== "number") {
                  }
                } catch (e) {
                  throw new Error(`Function '${item.fn}' error: ${e.message}`);
                }
              }
              const MAX_DEPTH = 8;
              const TOLERANCE = 0.2;
              const safeMapY = (y) => {
                const py = mapY(y);
                if (py < -3e4) return -3e4;
                if (py > 3e4) return 3e4;
                return py;
              };
              const rawDomain = domain;
              const isValid = (x, y) => {
                if (domain && (x < domain[0] || x > domain[1])) return false;
                if (this.config.complexMode === true && y && typeof y === "object") {
                  return isFinite(y.re) && isFinite(y.im);
                }
                if (!isFinite(y)) return false;
                return true;
              };
              const plotSegment = (x1, y1, x2, y2, depth) => {
                const xm = (x1 + x2) / 2;
                let ym;
                try {
                  ym = f(xm);
                } catch (e) {
                  ym = NaN;
                }
                let p1X, p1Y, p2X, p2Y, pmX, pmY;
                let v1 = isValid(x1, y1);
                let v2 = isValid(x2, y2);
                let vm = isValid(xm, ym);
                if (this.config.complexMode === true) {
                  if (v1 && y1 && typeof y1 === "object") {
                    p1X = mapX(y1.re);
                    p1Y = safeMapY(y1.im);
                  }
                  if (v2 && y2 && typeof y2 === "object") {
                    p2X = mapX(y2.re);
                    p2Y = safeMapY(y2.im);
                  }
                  if (vm && ym && typeof ym === "object") {
                    pmX = mapX(ym.re);
                    pmY = safeMapY(ym.im);
                  }
                } else {
                  p1X = mapX(x1);
                  p1Y = safeMapY(y1);
                  p2X = mapX(x2);
                  p2Y = safeMapY(y2);
                  pmX = mapX(xm);
                  pmY = safeMapY(ym);
                }
                if (depth < MAX_DEPTH) {
                  let split = false;
                  if (v1 !== v2) split = true;
                  else if (v1 && v2 && !vm) split = true;
                  else if (v1 && v2 && vm) {
                    const linY = p1Y + (p2Y - p1Y) * 0.5;
                    const error = Math.abs(pmY - linY);
                    if (error > TOLERANCE) split = true;
                    if (Math.abs(p2Y - p1Y) > this.height) split = true;
                  } else if (!v1 && !v2 && vm) split = true;
                  if (split) {
                    plotSegment(x1, y1, xm, ym, depth + 1);
                    plotSegment(xm, ym, x2, y2, depth + 1);
                    return;
                  }
                }
                if (v1 && v2) {
                  const jump = Math.abs(p2Y - p1Y);
                  if (jump < Math.max(100, this.height * 0.8)) {
                    if (!started) {
                      d += `M ${p1X} ${p1Y}`;
                      started = true;
                    }
                    d += ` L ${p2X} ${p2Y}`;
                    if (!task.isDerivative) {
                      this.plotData.push({ type: "fn", index: idx, x1: p1X, y1: p1Y, x2: p2X, y2: p2Y, domain: rawDomain });
                      if (!item.labelAt) labelPos = { x: p2X, y: p2Y };
                    }
                  } else {
                    started = false;
                  }
                } else if (v1 && v2 && !vm) {
                  const jump = Math.abs(p2Y - p1Y);
                  if (jump < 50) {
                    if (!started) {
                      d += `M ${p1X} ${p1Y}`;
                      started = true;
                    }
                    d += ` L ${p2X} ${p2Y}`;
                    if (!task.isDerivative) {
                      this.plotData.push({ type: "fn", index: idx, x1: p1X, y1: p1Y, x2: p2X, y2: p2Y, domain: rawDomain });
                      if (!item.labelAt) labelPos = { x: p2X, y: p2Y };
                    }
                  } else {
                    started = false;
                  }
                } else if (!v1 && v2) {
                  let tX = x2;
                  let tY = y2;
                  let left = x1;
                  let right = x2;
                  for (let i = 0; i < 15; i++) {
                    const midX = (left + right) / 2;
                    let midY;
                    try {
                      midY = f(midX);
                    } catch (e) {
                      midY = NaN;
                    }
                    if (isValid(midX, midY)) {
                      tX = midX;
                      tY = midY;
                      right = midX;
                      const py = safeMapY(tY);
                      if (py <= -1e4 || py >= 1e4) break;
                    } else {
                      left = midX;
                    }
                  }
                  let ptX, ptY;
                  if (this.config.complexMode === true && tY && typeof tY === "object") {
                    ptX = mapX(tY.re);
                    ptY = safeMapY(tY.im);
                  } else {
                    ptX = mapX(tX);
                    ptY = safeMapY(tY);
                  }
                  if (!started) {
                    d += `M ${ptX} ${ptY}`;
                    started = true;
                  }
                  d += ` L ${p2X} ${p2Y}`;
                  if (!task.isDerivative) {
                    this.plotData.push({ type: "fn", index: idx, x1: ptX, y1: ptY, x2: p2X, y2: p2Y, domain: rawDomain });
                    if (!item.labelAt) labelPos = { x: p2X, y: p2Y };
                  }
                } else if (v1 && !v2) {
                  let tX = x1;
                  let tY = y1;
                  let left = x1;
                  let right = x2;
                  for (let i = 0; i < 15; i++) {
                    const midX = (left + right) / 2;
                    let midY;
                    try {
                      midY = f(midX);
                    } catch (e) {
                      midY = NaN;
                    }
                    if (isValid(midX, midY)) {
                      tX = midX;
                      tY = midY;
                      left = midX;
                      const py = safeMapY(tY);
                      if (py <= -1e4 || py >= 1e4) break;
                    } else {
                      right = midX;
                    }
                  }
                  let ptX, ptY;
                  if (this.config.complexMode === true && tY && typeof tY === "object") {
                    ptX = mapX(tY.re);
                    ptY = safeMapY(tY.im);
                  } else {
                    ptX = mapX(tX);
                    ptY = safeMapY(tY);
                  }
                  if (!started) {
                    d += `M ${p1X} ${p1Y}`;
                    started = true;
                  }
                  d += ` L ${ptX} ${ptY}`;
                  started = false;
                  if (!task.isDerivative) {
                    this.plotData.push({ type: "fn", index: idx, x1: p1X, y1: p1Y, x2: ptX, y2: ptY, domain: rawDomain });
                    if (!item.labelAt) labelPos = { x: ptX, y: ptY };
                  }
                } else {
                  started = false;
                }
              };
              let rMin = xMin, rMax = xMax;
              if (item.param && Array.isArray(item.param[0])) {
                const pMinRaw = item.param[0][1];
                const pMaxRaw = item.param[0][2];
                const pMin = parseFloat(this._eval(pMinRaw, "param min"));
                const pMax = parseFloat(this._eval(pMaxRaw, "param max"));
                if (!isNaN(pMin) && !isNaN(pMax)) {
                  rMin = Math.min(pMin, pMax);
                  rMax = Math.max(pMin, pMax);
                } else {
                  rMin = 0;
                  rMax = 2 * Math.PI;
                }
              } else if (domain) {
                rMin = Math.max(rMin, domain[0]);
                rMax = Math.min(rMax, domain[1]);
              }
              const evalEdge = (x, isMin, isMax) => {
                let val;
                try {
                  val = f(x);
                } catch (e) {
                }
                if (this.config.complexMode === true && val && typeof val === "object" && isFinite(val.re) && isFinite(val.im)) return val;
                if (isFinite(val)) return val;
                const eps = 1e-6;
                if (isMin) {
                  try {
                    val = f(x + eps);
                  } catch (e) {
                  }
                }
                if (isMax) {
                  try {
                    val = f(x - eps);
                  } catch (e) {
                  }
                }
                return val;
              };
              if (rMin < rMax) {
                let coarseSteps = this.width / (this.config.sampleStep || 2);
                if (item.param) {
                  coarseSteps = Math.max(150, coarseSteps);
                }
                const dx = (rMax - rMin) / coarseSteps;
                let curr = rMin;
                while (curr < rMax - 1e-9) {
                  let next = curr + dx;
                  if (next > rMax) next = rMax;
                  if (Math.abs(next - rMax) < 1e-9) next = rMax;
                  const isDomainMin = domain && Math.abs(curr - domain[0]) < 1e-9;
                  let yStart = evalEdge(curr, isDomainMin, false);
                  const isDomainMax = domain && Math.abs(next - domain[1]) < 1e-9;
                  let yEnd = evalEdge(next, false, isDomainMax);
                  let yMid;
                  const xMid = (curr + next) / 2;
                  try {
                    yMid = f(xMid);
                  } catch (e) {
                  }
                  const v1 = isValid(curr, yStart);
                  const v2 = isValid(next, yEnd);
                  const vm = isValid(xMid, yMid);
                  if (v1 || v2 || vm) {
                    if (v1 && !started) {
                      let pSX, pSY;
                      if (this.config.complexMode === true && yStart && typeof yStart === "object") {
                        pSX = mapX(yStart.re);
                        pSY = safeMapY(yStart.im);
                      } else {
                        pSX = mapX(curr);
                        pSY = safeMapY(yStart);
                      }
                      d += `M ${pSX} ${pSY}`;
                      started = true;
                    }
                    plotSegment(curr, yStart, next, yEnd, 0);
                  } else {
                    started = false;
                  }
                  curr = next;
                }
              }
              const path = document.createElementNS(ns, "path");
              path.setAttribute("d", d);
              path.setAttribute("fill", "none");
              path.setAttribute("stroke", task.color);
              path.setAttribute("stroke-width", task.width);
              if (task.dash) path.setAttribute("stroke-dasharray", task.dash);
              if (task.opacity !== void 0) path.setAttribute("opacity", task.opacity);
              this.dataGroup.appendChild(path);
            } catch (e) {
              this._addWarning(`Error rendering function '${item.fn}': ${e.message}`);
            }
          });
        }
        if (item.implicit) {
          const f = new Function("x", "y", `return ${this._makeFn(item.implicit)};`);
          const res = 60;
          const dx = (xMax - xMin) / res, dy = (yMax - yMin) / res;
          const grid = [];
          for (let i = 0; i <= res; i++) {
            grid[i] = [];
            for (let j = 0; j <= res; j++) grid[i][j] = f(xMin + i * dx, yMin + j * dy);
          }
          const paths = [];
          const lerp = (v0, v1) => Math.abs(v0) / (Math.abs(v0) + Math.abs(v1));
          for (let i = 0; i < res; i++) {
            for (let j = 0; j < res; j++) {
              const v0 = grid[i][j], v1 = grid[i + 1][j], v2 = grid[i + 1][j + 1], v3 = grid[i][j + 1];
              let c = 0;
              if (v0 > 0) c |= 1;
              if (v1 > 0) c |= 2;
              if (v2 > 0) c |= 4;
              if (v3 > 0) c |= 8;
              if (c === 0 || c === 15) continue;
              const xl = xMin + i * dx, xr = xl + dx, yb = yMin + j * dy, yt = yb + dy;
              const pB = [xl + dx * lerp(v0, v1), yb], pR = [xr, yb + dy * lerp(v1, v2)];
              const pT = [xl + dx * lerp(v3, v2), yt], pL = [xl, yb + dy * lerp(v0, v3)];
              const seg = (P1, P2) => {
                const X1 = mapX(P1[0]), Y1 = mapY(P1[1]), X2 = mapX(P2[0]), Y2 = mapY(P2[1]);
                this.plotData.push({ type: "implicit", index: idx, x1: X1, y1: Y1, x2: X2, y2: Y2 });
                return `M ${X1} ${Y1} L ${X2} ${Y2}`;
              };
              switch (c) {
                case 1:
                case 14:
                  paths.push(seg(pL, pB));
                  break;
                case 2:
                case 13:
                  paths.push(seg(pB, pR));
                  break;
                case 3:
                case 12:
                  paths.push(seg(pL, pR));
                  break;
                case 4:
                case 11:
                  paths.push(seg(pT, pR));
                  break;
                case 5:
                  paths.push(seg(pL, pT) + seg(pB, pR));
                  break;
                case 6:
                case 9:
                  paths.push(seg(pB, pT));
                  break;
                case 7:
                case 8:
                  paths.push(seg(pL, pT));
                  break;
                case 10:
                  paths.push(seg(pL, pB) + seg(pT, pR));
                  break;
              }
              if (paths.length && !item.labelAt) labelPos = { x: mapX(pR[0]), y: mapY(pR[1]) };
            }
          }
          const path = document.createElementNS(ns, "path");
          path.setAttribute("d", paths.join(" "));
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", color);
          path.setAttribute("stroke-width", width);
          if (dash) path.setAttribute("stroke-dasharray", dash);
          if (item.opacity !== void 0) path.setAttribute("opacity", item.opacity);
          this.dataGroup.appendChild(path);
        }
        if (item.x !== void 0) {
          const valX = this._eval(item.x, "vertical line x");
          if (!isNaN(valX)) {
            const px = mapX(valX);
            if (px >= this.padding && px <= this.width - this.padding) {
              let yStart = this.padding;
              let yEnd = this.height - this.padding;
              if (item.range && Array.isArray(item.range)) {
                const r0 = this._eval(item.range[0], "vertical line range start");
                const r1 = this._eval(item.range[1], "vertical line range end");
                if (!isNaN(r0) && !isNaN(r1)) {
                  const y1 = mapY(r0);
                  const y2 = mapY(r1);
                  const rawYMin = Math.min(y1, y2);
                  const rawYMax = Math.max(y1, y2);
                  yStart = Math.max(this.padding, rawYMin);
                  yEnd = Math.min(this.height - this.padding, rawYMax);
                }
              }
              if (yEnd > yStart) {
                const l = this._line(px, yStart, px, yEnd, color, width, dash, this.dataGroup);
                if (item.opacity !== void 0) l.setAttribute("opacity", item.opacity);
                if (!item.labelAt) labelPos = { x: px, y: yStart + 15 };
                this.plotData.push({
                  type: "vertical",
                  index: idx,
                  x1: px,
                  y1: yStart,
                  x2: px,
                  y2: yEnd,
                  val: valX
                });
              }
            }
          }
        }
        if (item.points && item.type !== "interpolation") {
          const forceShow = item.id === "current-derivative-point" || item.id === "derivative-trace";
          const isFree = item.freeCoordinates === true && item.name;
          if (forceShow || this.config.showPoints !== false) {
            item.points.forEach((pt, ptIdx) => {
              if (!pt) return;
              if (isFree) {
                if (!this.freePoints[item.name]) {
                  let startX = this._eval(pt[0], "free point x");
                  let startY = this._eval(pt[1] !== void 0 ? pt[1] : 0, "free point y");
                  if (isNaN(startX)) startX = 0;
                  if (isNaN(startY)) startY = 0;
                  this.freePoints[item.name] = { x: startX, y: startY };
                }
                const fpPos = this.freePoints[item.name];
                const px = mapX(fpPos.x), py = mapY(fpPos.y);
                const r = item.radius || 7;
                const fillColor = item.fillColor ? this._getColor(0, item.fillColor) : color;
                const strokeColor = item.strokeColor ? this._getColor(0, item.strokeColor) : color;
                const ring = document.createElementNS(ns, "circle");
                ring.setAttribute("cx", px);
                ring.setAttribute("cy", py);
                ring.setAttribute("r", r + 4);
                ring.setAttribute("fill", "none");
                ring.setAttribute("stroke", fillColor);
                ring.setAttribute("stroke-width", 1.5);
                ring.setAttribute("stroke-dasharray", "3,3");
                ring.setAttribute("opacity", 0.6);
                this.dataGroup.appendChild(ring);
                const c = document.createElementNS(ns, "circle");
                c.setAttribute("cx", px);
                c.setAttribute("cy", py);
                c.setAttribute("r", r);
                c.setAttribute("fill", fillColor);
                c.setAttribute("stroke", strokeColor);
                c.setAttribute("stroke-width", item.strokeWidth || 1.5);
                c.style.cursor = "grab";
                if (item.opacity !== void 0) c.setAttribute("opacity", item.opacity);
                this.dataGroup.appendChild(c);
                const pLabel = this._substituteLabel(pt[2] && typeof pt[2] === "string" ? pt[2] : item.label);
                if (pLabel) {
                  const lx = px + r + 6;
                  const ly = py - r - 2;
                  const fs = this._getConfigSize("labelSize");
                  const lw = this.config.labelWeight || "bold";
                  const ls = this.config.labelStyle || "normal";
                  if (window.MathJax && pLabel.includes("$")) {
                    this._renderMathJax(pLabel, lx, ly, fs, fillColor, "start", "alphabetic", this.labelGroup);
                  } else {
                    this._text(lx, ly, pLabel, "start", "alphabetic", fillColor, lw, ls, this.labelGroup, fs);
                  }
                }
                if (!item.labelAt) labelPos = { x: px, y: py };
                this.plotData.push({
                  type: "point",
                  index: idx,
                  cx: px,
                  cy: py,
                  valX: fpPos.x,
                  valY: fpPos.y,
                  isFreePoint: true,
                  fpLabel: item.name
                });
                return;
              }
              let valX = this._eval(pt[0], "point x");
              if (this.config.complexMode === true && valX && typeof valX === "object" && valX.re !== void 0) {
                if (item.name) this.resolvedPoints[item.name] = { x: valX.re, y: valX.im };
                const px = mapX(valX.re);
                const py = mapY(valX.im);
                const c = document.createElementNS(ns, "circle");
                c.setAttribute("cx", px);
                c.setAttribute("cy", py);
                c.setAttribute("r", item.radius || 4);
                const fillColor = item.fillColor ? this._getColor(0, item.fillColor) : color;
                const strokeColor = item.strokeColor ? this._getColor(0, item.strokeColor) : "none";
                c.setAttribute("fill", fillColor);
                c.setAttribute("stroke", strokeColor);
                c.setAttribute("stroke-width", item.strokeWidth || 0);
                if (item.opacity !== void 0) c.setAttribute("opacity", item.opacity);
                this.dataGroup.appendChild(c);
                if (pt[1] && typeof pt[1] === "string") {
                  const pLabel = this._substituteLabel(pt[1]);
                  const lx = px + 8;
                  const ly = py - 8;
                  const fs = this._getConfigSize("labelSize");
                  const lw = this.config.labelWeight || "normal";
                  const ls = this.config.labelStyle || "normal";
                  if (window.MathJax && pLabel.includes("$")) {
                    this._renderMathJax(pLabel, lx, ly, fs, "#333", "start", "alphabetic", this.labelGroup);
                  } else {
                    this._text(lx, ly, pLabel, "start", "alphabetic", "#333", lw, ls, this.labelGroup, fs);
                  }
                }
                if (!item.labelAt) labelPos = { x: px, y: py };
                this.plotData.push({ type: "point", index: idx, cx: px, cy: py, valX: valX.re, valY: valX.im });
                return;
              }
              let valY = pt.length > 1 ? this._eval(pt[1], "point y") : 0;
              if (!isNaN(valX) && !isNaN(valY)) {
                if (item.name) this.resolvedPoints[item.name] = { x: valX, y: valY };
                const px = mapX(valX), py = mapY(valY);
                if (px >= -50 && px <= this.width + 50 && py >= -50 && py <= this.height + 50) {
                  const c = document.createElementNS(ns, "circle");
                  c.setAttribute("cx", px);
                  c.setAttribute("cy", py);
                  c.setAttribute("r", item.radius || 4);
                  const fillColor = item.fillColor ? this._getColor(0, item.fillColor) : color;
                  const strokeColor = item.strokeColor ? this._getColor(0, item.strokeColor) : "none";
                  c.setAttribute("fill", fillColor);
                  c.setAttribute("stroke", strokeColor);
                  c.setAttribute("stroke-width", item.strokeWidth || 0);
                  if (item.opacity !== void 0) c.setAttribute("opacity", item.opacity);
                  this.dataGroup.appendChild(c);
                  if (pt[2] && typeof pt[2] === "string") {
                    const pLabel = this._substituteLabel(pt[2]);
                    const lx = px + 8;
                    const ly = py - 8;
                    const fs = this._getConfigSize("labelSize");
                    const lw = this.config.labelWeight || "normal";
                    const ls = this.config.labelStyle || "normal";
                    if (window.MathJax && pLabel.includes("$")) {
                      this._renderMathJax(pLabel, lx, ly, fs, "#333", "start", "alphabetic", this.labelGroup);
                    } else {
                      this._text(lx, ly, pLabel, "start", "alphabetic", "#333", lw, ls, this.labelGroup, fs);
                    }
                  }
                  if (!item.labelAt) labelPos = { x: px, y: py };
                  this.plotData.push({
                    type: "point",
                    index: idx,
                    cx: px,
                    cy: py,
                    valX,
                    valY,
                    rawExpressions: [pt[0], pt.length > 1 ? pt[1] : null].filter(Boolean)
                  });
                }
              }
            });
          }
        }
        if (item.vector || item.type === "vector") {
          try {
            const fromRaw = item.vector ? item.vector[0] : item.from || [0, 0];
            const toRaw = item.vector ? item.vector[1] : item.to || [1, 1];
            const fx = this._eval(fromRaw[0], "vector from x");
            const fy = this._eval(fromRaw[1], "vector from y");
            const tx = this._eval(toRaw[0], "vector to x");
            const ty = this._eval(toRaw[1], "vector to y");
            if (!isNaN(fx) && !isNaN(fy) && !isNaN(tx) && !isNaN(ty)) {
              const pfx = mapX(fx), pfy = mapY(fy);
              const ptx = mapX(tx), pty = mapY(ty);
              const strokeW = item.width || item.strokeWidth || 2;
              const arrowColor = color;
              const markerId = `arrowhead_${this.uid}_${idx}`;
              const oldMarker = this._svgDefs.querySelector(`#${markerId}`);
              if (oldMarker) oldMarker.remove();
              const hasArrow = item.arrow !== false;
              if (hasArrow) {
                const marker = document.createElementNS(ns, "marker");
                marker.setAttribute("id", markerId);
                marker.setAttribute("markerWidth", "8");
                marker.setAttribute("markerHeight", "6");
                marker.setAttribute("refX", "2");
                marker.setAttribute("refY", "3");
                marker.setAttribute("orient", "auto-start-reverse");
                const arrowPoly = document.createElementNS(ns, "polygon");
                arrowPoly.setAttribute("points", "0 0, 8 3, 0 6");
                arrowPoly.setAttribute("fill", arrowColor);
                if (item.opacity !== void 0) arrowPoly.setAttribute("opacity", item.opacity);
                marker.appendChild(arrowPoly);
                this._svgDefs.appendChild(marker);
              }
              const dx = ptx - pfx, dy = pty - pfy;
              const len = Math.sqrt(dx * dx + dy * dy);
              const shortenPx = hasArrow && len > 0 ? Math.min(6 * strokeW, len * 0.95) : 0;
              const endX = len > 0 ? ptx - dx / len * shortenPx : ptx;
              const endY = len > 0 ? pty - dy / len * shortenPx : pty;
              const line = document.createElementNS(ns, "line");
              line.setAttribute("x1", pfx);
              line.setAttribute("y1", pfy);
              line.setAttribute("x2", endX);
              line.setAttribute("y2", endY);
              line.setAttribute("stroke", arrowColor);
              line.setAttribute("stroke-width", strokeW);
              if (item.dash) line.setAttribute("stroke-dasharray", item.dash);
              if (item.opacity !== void 0) line.setAttribute("opacity", item.opacity);
              if (hasArrow) line.setAttribute("marker-end", `url(#${markerId})`);
              this.dataGroup.appendChild(line);
              labelPos = { x: (pfx + ptx) / 2, y: (pfy + pty) / 2 };
            }
          } catch (e) {
            this._addWarning(`Vector render error: ${e.message}`);
          }
        }
        if (item.angle && Array.isArray(item.angle) && item.angle.length === 3) {
          try {
            const p1x = this._eval(item.angle[0][0], "angle p1 x");
            const p1y = this._eval(item.angle[0][1], "angle p1 y");
            const vx = this._eval(item.angle[1][0], "angle v x");
            const vy = this._eval(item.angle[1][1], "angle v y");
            const p2x = this._eval(item.angle[2][0], "angle p2 x");
            const p2y = this._eval(item.angle[2][1], "angle p2 y");
            if (!isNaN(p1x) && !isNaN(p1y) && (!isNaN(vx) && !isNaN(vy)) && (!isNaN(p2x) && !isNaN(p2y))) {
              const th1 = Math.atan2(p1y - vy, p1x - vx);
              const th2 = Math.atan2(p2y - vy, p2x - vx);
              let dTheta = th2 - th1;
              while (dTheta <= -Math.PI) dTheta += 2 * Math.PI;
              while (dTheta > Math.PI) dTheta -= 2 * Math.PI;
              let radAngle = Math.abs(dTheta);
              let degAngle = radAngle * 180 / Math.PI;
              if (item.name) {
                if (!this.resolvedPoints[item.name]) this.resolvedPoints[item.name] = {};
                this.resolvedPoints[item.name].rad = radAngle;
                this.resolvedPoints[item.name].deg = degAngle;
              }
              const pvx = mapX(vx), pvy = mapY(vy);
              const sth1 = Math.atan2(mapY(p1y) - pvy, mapX(p1x) - pvx);
              const sth2 = Math.atan2(mapY(p2y) - pvy, mapX(p2x) - pvx);
              let sdTheta = sth2 - sth1;
              while (sdTheta <= -Math.PI) sdTheta += 2 * Math.PI;
              while (sdTheta > Math.PI) sdTheta -= 2 * Math.PI;
              const r = item.radius || 20;
              const startX = pvx + r * Math.cos(sth1);
              const startY = pvy + r * Math.sin(sth1);
              const endX = pvx + r * Math.cos(sth2);
              const endY = pvy + r * Math.sin(sth2);
              const largeArc = Math.abs(sdTheta) > Math.PI ? 1 : 0;
              const sweep = sdTheta > 0 ? 1 : 0;
              const path = document.createElementNS(ns, "path");
              const d = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} ${sweep} ${endX} ${endY}`;
              path.setAttribute("d", d);
              const strokeW = item.strokeWidth || item.width || 1.5;
              const fillColor = item.fillColor ? this._getColor(0, item.fillColor) : "none";
              const strokeColor = item.strokeColor === void 0 ? color : item.strokeColor ? this._getColor(0, item.strokeColor) : "none";
              path.setAttribute("fill", fillColor);
              path.setAttribute("stroke", strokeColor);
              path.setAttribute("stroke-width", strokeW);
              if (item.dash) path.setAttribute("stroke-dasharray", item.dash);
              if (item.opacity !== void 0) path.setAttribute("opacity", item.opacity);
              this.dataGroup.appendChild(path);
              const midTh = sth1 + sdTheta / 2;
              labelPos = { x: pvx + (r + 10) * Math.cos(midTh), y: pvy + (r + 10) * Math.sin(midTh) };
            }
          } catch (e) {
            this._addWarning(`Angle render error: ${e.message}`);
          }
        }
        if (item.label && labelPos && !this.config.legend) {
          let anchor = "start";
          let dx = 5, dy = -5;
          if (labelPos.x > this.width - 60) {
            anchor = "end";
            dx = -5;
          }
          if (labelPos.y < 30) {
            dy = 15;
          }
          if (labelPos.x < 60) {
            anchor = "start";
            dx = 5;
          }
          if (item.labelOffset) {
            dx += item.labelOffset[0];
            dy += item.labelOffset[1];
          }
          if (item.labelAnchor) {
            anchor = item.labelAnchor;
          }
          const lx = Math.max(10, Math.min(this.width - 10, labelPos.x + dx));
          const ly = Math.max(10, Math.min(this.height - 10, labelPos.y + dy));
          const labelWeight = this.config.labelWeight || "normal";
          const labelStyle = this.config.labelStyle || "normal";
          const displayLabel = this._substituteLabel(item.label);
          if (window.MathJax && displayLabel.includes("$")) {
            this._renderMathJax(displayLabel, lx, ly, this._getConfigSize("labelSize"), color, anchor, "bottom", this.labelGroup);
          } else {
            const cleanLabel = displayLabel.replace(/\*/g, "\xB7");
            this._text(lx, ly, cleanLabel, anchor, "bottom", color, labelWeight, labelStyle, this.labelGroup, this._getConfigSize("labelSize"));
          }
        }
      });
      if (this.config.legend && legendItems.length > 0) {
        this._drawLegend(legendItems);
      }
      this._restoreSelectionVisuals();
      if (this.derivativePlot) {
        this._syncDerivativePlot();
      }
    }
    _drawLegend(items) {
      const padL = this.padL, padR = this.padR, padT = this.padT, padB = this.padB;
      let x = this.width - padR - 10;
      let y = padT + 10;
      const pos = this.config.legendPosition || "top-right";
      let w;
      if (this.config.legendWidth) {
        w = this.config.legendWidth;
      } else {
        let maxLen = 0;
        const fs2 = this._getConfigSize("legendSize");
        items.forEach((it) => maxLen = Math.max(maxLen, it.label.length));
        w = 30 + maxLen * (fs2 * 0.5) + 15;
        if (w < 50) w = 50;
      }
      const fs = this._getConfigSize("legendSize");
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", w);
      rect.setAttribute("fill", "white");
      rect.setAttribute("fill-opacity", "0.9");
      rect.setAttribute("stroke", "#eee");
      this.legendGroup.appendChild(rect);
      let totalH = 10;
      const RowH = fs * 1.5;
      const rowHeights = items.map((item) => {
        if (window.MathJax && item.label.includes("$")) {
          if (item.label.includes("\\frac")) return fs * 2.5;
          if (item.label.includes("\\sum") || item.label.includes("\\int")) return fs * 2.2;
          return fs * 1.5;
        } else if (item.type === "interpolation") {
          return fs * 1.5;
        }
        return fs * 1.5;
      });
      totalH = 10 + rowHeights.reduce((a, b) => a + b, 0) + 10;
      if (pos === "top-left") {
        x = padL + 10 + w;
        y = padT + 10;
      } else if (pos === "bottom-right") {
        x = this.width - padR - 10;
        y = this.height - padB - 10 - totalH;
      } else if (pos === "bottom-left") {
        x = padL + 10 + w;
        y = this.height - padB - 10 - totalH;
      }
      rect.setAttribute("x", x - w);
      rect.setAttribute("y", y);
      rect.setAttribute("height", totalH);
      let currentY = y + 10;
      items.forEach((item, i) => {
        const h = rowHeights[i];
        const ly = currentY + h / 2;
        const lx = x - w + 10;
        const symbolY = ly;
        if (item.type === "point") {
          const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          c.setAttribute("cx", lx + 5);
          c.setAttribute("cy", symbolY);
          c.setAttribute("r", 4);
          c.setAttribute("fill", item.color);
          this.legendGroup.appendChild(c);
        } else {
          this._line(lx, symbolY, lx + 15, symbolY, item.color, 2, item.dash, this.legendGroup);
        }
        const textBaseline = ly + fs * 0.35;
        if (window.MathJax && item.label.includes("$")) {
          this._renderMathJax(item.label, lx + 25, textBaseline - 1, fs, "#333", "start", "alphabetic", this.legendGroup);
        } else {
          this._text(lx + 20, textBaseline, item.label.replace(/\*/g, "\xB7"), "start", "alphabetic", "#333", this.config.labelWeight || "normal", this.config.labelStyle || "normal", this.legendGroup, fs);
        }
        currentY += h;
      });
    }
    /**
     * Renders MathJax into the SVG.
     * @private
     */
    _renderMathJax(text, x, y, baseSize, color, anchor, baseline, parent) {
      try {
        const tex = text.replace(/^\$|\$$/g, "").replace(/\\$/g, "");
        const mjNode = MathJax.tex2svg(tex);
        const mjSvg = mjNode.querySelector("svg");
        if (mjSvg) {
          const svgNode = mjSvg.cloneNode(true);
          svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/2000/xlink");
          const wAttr = svgNode.getAttribute("width") || "1ex";
          const hAttr = svgNode.getAttribute("height") || "1ex";
          const valign = svgNode.style.verticalAlign || "0ex";
          const ex2px = baseSize * 0.5;
          const wIdx = parseFloat(wAttr) * ex2px;
          const hIdx = parseFloat(hAttr) * ex2px;
          const vShift = parseFloat(valign) * ex2px;
          svgNode.setAttribute("width", wIdx + "px");
          svgNode.setAttribute("height", hIdx + "px");
          let finalX = x;
          if (anchor === "end") finalX = x - wIdx;
          else if (anchor === "middle") finalX = x - wIdx / 2;
          let finalY = y;
          if (baseline === "middle") {
            finalY = y - hIdx / 2;
          } else {
            finalY = y - hIdx - vShift;
          }
          svgNode.setAttribute("x", finalX);
          svgNode.setAttribute("y", finalY);
          const uses = svgNode.querySelectorAll("use");
          let defs = svgNode.querySelector("defs");
          if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svgNode.prepend(defs);
          }
          uses.forEach((use) => {
            const href = use.getAttribute("xlink:href") || use.getAttribute("href");
            if (href && href.startsWith("#")) {
              const id = href.substring(1);
              if (!svgNode.querySelector(`[id="${id}"]`)) {
                const globalDef = document.getElementById(id);
                if (globalDef) {
                  const clone = globalDef.cloneNode(true);
                  defs.appendChild(clone);
                }
              }
            }
          });
          svgNode.setAttribute("fill", color);
          svgNode.style.color = color;
          svgNode.querySelectorAll("path").forEach((p) => p.setAttribute("fill", color));
          parent.appendChild(svgNode);
        } else {
          this._text(x, y, text, anchor, baseline, color, "normal", "normal", parent, baseSize);
        }
      } catch (e) {
        console.warn("MathJax Render Error", e);
        this._text(x, y, text, anchor, baseline, color, "normal", "normal", parent, baseSize);
      }
    }
    /**
     * Resolves font size from config, with fallback chain.
     * @private
     */
    _getConfigSize(specificKey) {
      if (this.config[specificKey]) {
        return typeof this.config[specificKey] === "number" ? this.config[specificKey] : parseInt(this.config[specificKey]);
      }
      if (this.config.fontSize) {
        return typeof this.config.fontSize === "number" ? this.config.fontSize : parseInt(this.config.fontSize);
      }
      return 14;
    }
    /**
     * Creates an SVG circle element.
     * @private
     */
    _circle(cx, cy, r, color, width, dash, parent) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", cx);
      c.setAttribute("cy", cy);
      c.setAttribute("r", r);
      c.setAttribute("stroke", color || "#000");
      c.setAttribute("stroke-width", width !== void 0 ? width : 1);
      c.setAttribute("fill", "none");
      if (dash) c.setAttribute("stroke-dasharray", dash);
      parent.appendChild(c);
      return c;
    }
    /**
     * Creates an SVG line element.
     * @private
     */
    _line(x1, y1, x2, y2, color, width, dash, parent) {
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", x1);
      l.setAttribute("y1", y1);
      l.setAttribute("x2", x2);
      l.setAttribute("y2", y2);
      l.setAttribute("stroke", color);
      l.setAttribute("stroke-width", width);
      if (dash) l.setAttribute("stroke-dasharray", dash);
      if (parent === this.axesGroup) {
        l.setAttribute("class", "matephis-plot-axis");
      } else if (parent === this.gridGroup) {
        l.setAttribute("class", "matephis-plot-grid-line");
      }
      parent.appendChild(l);
      return l;
    }
    /**
     * Creates an SVG text element with white halo effect.
     * @private
     */
    _text(x, y, str, anchor, baseline, color, weight = "normal", style = "normal", parent = this.axesGroup, size = null, outline = true) {
      const isDarkTheme = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "dark" || this.config && this.config.theme === "dark");
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", x);
      t.setAttribute("y", y);
      t.setAttribute("class", "matephis-plot-text");
      if (parent === this.numbersGroup) {
        t.setAttribute("class", "matephis-plot-number matephis-plot-text");
        if (color === "#666" || color === "#333") {
          color = isDarkTheme ? "#e2e8f0" : color;
        }
      }
      t.setAttribute("text-anchor", anchor);
      t.setAttribute("dominant-baseline", baseline);
      t.setAttribute("fill", color);
      const fSize = size !== null ? size + "px" : "18px";
      t.setAttribute("font-size", fSize);
      t.setAttribute("font-weight", weight);
      t.setAttribute("font-style", style);
      t.textContent = str;
      if (outline) {
        t.style.paintOrder = "stroke";
        t.style.stroke = isDarkTheme ? "#181818" : "#fff";
        t.style.strokeWidth = "2.5px";
      }
      parent.appendChild(t);
      return t;
    }
    // =========================================================================
    // PRIVATE: ERROR HANDLING / VALIDATION
    // =========================================================================
    _validateConfig() {
      const VALID_ROOT_KEYS = [
        "width",
        "height",
        "aspectRatio",
        "cssWidth",
        "fullWidth",
        "align",
        "marginLeft",
        "marginRight",
        "border",
        "sliderBorder",
        "xlim",
        "ylim",
        "interactive",
        "theme",
        "legend",
        "legendWidth",
        "legendPosition",
        "padding",
        "marginBottom",
        "grid",
        "gridOpacity",
        "axisArrows",
        "axisLabels",
        "xStep",
        "yStep",
        "xStepSecondary",
        "yStepSecondary",
        "showSecondaryGrid",
        "showGrid",
        "xNumberStep",
        "yNumberStep",
        "showXNumbers",
        "showYNumbers",
        "showXAxis",
        "showYAxis",
        "showXTicks",
        "showYTicks",
        "secondaryGridOpacity",
        "sampleStep",
        "fontSize",
        "renderOrder",
        "params",
        "showSliders",
        "data",
        "labelWeight",
        "numberSize",
        "labelSize",
        "legendSize",
        "axisLabelWeight",
        "axisLabelStyle",
        "labelStyle",
        "axisLabelOffset",
        "axisUnitMeasures",
        "boxPlot",
        "boxPlotPartial",
        "constrainView",
        "boxNumbersInside",
        "pointSelection",
        "slopeSelection",
        "tangentSelection",
        "slopeLabel",
        "specifySlope",
        "showCoordinates",
        "derivativeTitle",
        "derivativeAutoY",
        "hideFunctions",
        "derivativeYScale",
        "showDerivative",
        "traceDerivative",
        "addDerivativePlot",
        "showDerivativeFunction",
        "showToolbar",
        "showDerivativeToolbar",
        "showPoints",
        "derivativeToggle",
        "derivativeYLim",
        "showDerivativePoint",
        "animate",
        "isDerivativePlot",
        "slopeUnitMeasure",
        "polar",
        "polarUnits",
        "xScale",
        "yScale",
        "complexMode",
        "draggablePoints"
      ];
      const VALID_DATA_KEYS = [
        "type",
        "fn",
        "implicit",
        "points",
        "x",
        "vector",
        "angle",
        "range",
        "domain",
        "color",
        "width",
        "strokeWidth",
        "dash",
        "opacity",
        "fillColor",
        "strokeColor",
        "radius",
        "label",
        "labelAt",
        "labelOffset",
        "labelAnchor",
        "derivativeColor",
        "smoothness",
        "sampling",
        "showPoints",
        "pointColor",
        "pointRadius",
        "pointOpacity",
        "pointStroke",
        "pointStrokeWidth",
        "param",
        "freeCoordinates",
        "name",
        "from",
        "to",
        "arrow"
        // interpolation
      ];
      for (let key in this.config) {
        if (!VALID_ROOT_KEYS.includes(key)) {
          this._addWarning(`Unknown global option: '${key}'`);
        }
      }
      if (this.config.data) {
        this.config.data.forEach((item, i) => {
          for (let key in item) {
            if (!VALID_DATA_KEYS.includes(key)) {
              this._addWarning(`Unknown data option in item ${i + 1}: '${key}'`);
            }
          }
          if (!item.fn && !item.implicit && !item.points && item.x === void 0 && !item.vector && item.type !== "vector" && !item.angle) {
            this._addWarning(`Data item ${i + 1} has no content (missing 'fn', 'points', 'implicit', 'x', 'vector', or 'angle').`);
          }
        });
      }
    }
    _addWarning(msg) {
      if (!this.warnings.includes(msg)) {
        this.warnings.push(msg);
      }
    }
    _renderWarnings() {
      const old = this.wrapper.querySelector(".matephis-plot-warnings");
      if (old) old.remove();
      if (this.warnings.length === 0) return;
      const div = document.createElement("div");
      div.className = "matephis-plot-warnings";
      div.style.borderTop = "1px solid #ffcc00";
      div.style.backgroundColor = "#fffbe6";
      div.style.color = "#5c4b00";
      div.style.padding = "10px";
      div.style.fontSize = "0.85em";
      div.style.width = "100%";
      div.style.marginTop = "0";
      const title = document.createElement("strong");
      title.innerText = "\u26A0\uFE0F Plot Warnings:";
      div.appendChild(title);
      const ul = document.createElement("ul");
      ul.style.margin = "5px 0 0 20px";
      ul.style.padding = "0";
      this.warnings.forEach((w) => {
        const li = document.createElement("li");
        li.innerText = w;
        ul.appendChild(li);
      });
      div.appendChild(ul);
      this.wrapper.appendChild(div);
    }
    // Add visuals restore at end of draw loop
    _restoreSelectionVisualsCheck() {
      this._restoreSelectionVisuals();
    }
    /**
     * Generates points for a Cardinal Spline passing through the given data points.
     * @param {Array} points - Array of [x, y] coordinates
     * @param {number} tension - Smoothness factor (0 to 1), mapped to tension
     * @param {number} numOfSegments - Number of segments between two points
     * @returns {Array} - Array of [x, y] coordinates for the spline
     * @private
     */
    _getCurvePoints(points, tension, numOfSegments) {
      let _pts = [], res = [], x, y, t1x, t2x, t1y, t2y, c1, c2, c3, c4, st, t, i;
      for (i = 0; i < points.length; i++) _pts.push(points[i].slice());
      _pts.unshift(points[0].slice());
      _pts.push(points[points.length - 1].slice());
      const k = tension * 0.5;
      for (i = 1; i < _pts.length - 2; i++) {
        for (t = 0; t <= numOfSegments; t++) {
          const s = t / numOfSegments;
          t1x = (_pts[i + 1][0] - _pts[i - 1][0]) * k;
          t1y = (_pts[i + 1][1] - _pts[i - 1][1]) * k;
          t2x = (_pts[i + 2][0] - _pts[i][0]) * k;
          t2y = (_pts[i + 2][1] - _pts[i][1]) * k;
          c1 = 2 * Math.pow(s, 3) - 3 * Math.pow(s, 2) + 1;
          c2 = -2 * Math.pow(s, 3) + 3 * Math.pow(s, 2);
          c3 = Math.pow(s, 3) - 2 * Math.pow(s, 2) + s;
          c4 = Math.pow(s, 3) - Math.pow(s, 2);
          x = c1 * _pts[i][0] + c2 * _pts[i + 1][0] + c3 * t1x + c4 * t2x;
          y = c1 * _pts[i][1] + c2 * _pts[i + 1][1] + c3 * t1y + c4 * t2y;
          res.push([x, y]);
        }
      }
      return res;
    }
    // =========================================================================
    // PRIVATE: LIGHTBOX
    // =========================================================================
    /**
     * Opens the plot in a lightbox overlay.
     * @private
     */
    _openLightbox() {
      const lb = document.getElementById("lightbox");
      const img = document.getElementById("lightbox-img");
      const svgContainer = document.getElementById("lightbox-svg");
      const caption = document.getElementById("lightbox-caption");
      if (lb && svgContainer) {
        svgContainer.innerHTML = "";
        if (img) img.style.display = "none";
        svgContainer.style.display = "flex";
        lb.style.display = "flex";
        if (caption) caption.innerHTML = "";
        const clone = this.svg.cloneNode(true);
        const maxWidth = Math.min(1200, window.innerWidth * 0.9);
        const maxHeight = window.innerHeight * 0.85;
        const scaleW = maxWidth / this.width;
        const scaleH = maxHeight / this.height;
        const scale = Math.min(scaleW, scaleH);
        const finalW = Math.round(this.width * scale);
        const finalH = Math.round(this.height * scale);
        svgContainer.style.width = `${finalW}px`;
        svgContainer.style.height = `${finalH}px`;
        clone.setAttribute("width", "100%");
        clone.setAttribute("height", "100%");
        clone.style.width = "100%";
        clone.style.height = "100%";
        if (!clone.hasAttribute("viewBox")) {
          clone.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
        }
        svgContainer.onclick = (e) => e.stopPropagation();
        clone.onclick = (e) => e.stopPropagation();
        const isDarkLb = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";
        const bgRect = clone.querySelector(".matephis-plot-bg");
        if (bgRect) {
          bgRect.setAttribute("fill", isDarkLb ? "#121212" : "#fff");
        }
        svgContainer.appendChild(clone);
      }
    }
  };
  MatephisPlot.scriptUrl = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : "";

  // assets/js/matephis-plot-src/index.js
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    window.MatephisPlot = MatephisPlot;
    document.addEventListener("DOMContentLoaded", () => {
      if (document.getElementById("MathJax-script")) {
        const checkMathJax = () => {
          if (window.MathJax && (window.MathJax.tex2svg || window.MathJax.startup && window.MathJax.startup.promise)) {
            if (window.MathJax.startup && window.MathJax.startup.promise) {
              window.MathJax.startup.promise.then(() => MatephisPlot.init());
            } else {
              MatephisPlot.init();
            }
          } else {
            setTimeout(checkMathJax, 50);
          }
        };
        checkMathJax();
      } else {
        MatephisPlot.init();
      }
    });
  }
  var matephis_plot_src_default = MatephisPlot;
})();
//# sourceMappingURL=matephis-plot.js.map
