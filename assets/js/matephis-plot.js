/**
 * Matephis Plotting Library
 */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener("DOMContentLoaded", () => {
        MatephisPlot.init();
    });
}

class MatephisPlot {
    static init() {
        // 1. Explicit Divs
        const plots = document.querySelectorAll('.matephis-plot');
        plots.forEach(container => {
            try {
                if (container.getAttribute('data-processed')) return;
                const source = container.textContent;
                container.innerHTML = "";
                new MatephisPlot(container, source);
                container.setAttribute('data-processed', 'true');
            } catch (e) {
                console.error("Plot Error", e);
                container.innerHTML = `<div style="color:red; border:1px solid red; padding:5px;">Error: ${e.message}</div>`;
            }
        });

        // 2. Markdown Code Blocks
        const codeBlocks = document.querySelectorAll('code.language-matephis');
        codeBlocks.forEach(code => {
            try {
                const source = code.textContent;
                let target = code.closest('div.language-matephis') || code.closest('pre');
                if (!target) target = code.parentElement;

                if (target.getAttribute('data-processed')) return;

                const container = document.createElement('div');
                container.className = 'matephis-plot';
                target.parentNode.insertBefore(container, target);
                target.style.display = 'none';

                new MatephisPlot(container, source);
                target.setAttribute('data-processed', 'true');
            } catch (e) { console.error("Code Block Plot Error", e); }
        });
    }

    constructor(container, source) {
        this.container = container;
        this.config = JSON.parse(source);
        this.container.innerHTML = ""; // Clear JSON

        // Wrap
        this.wrapper = document.createElement("div");
        this.wrapper.className = "matephis-plot-container";
        this.container.appendChild(this.wrapper);

        // Param State
        this.params = {};
        if (this.config.params) {
            for (let key in this.config.params) {
                this.params[key] = this.config.params[key].val || 0;
            }
        }
        
        // Layout Options
        if (this.config.fullWidth) this.config.cssWidth = "100%";
        if (this.config.cssWidth) {
            this.wrapper.style.maxWidth = this.config.cssWidth;
            this.wrapper.style.width = "100%"; // Ensure it scales
        }

        // Alignment
        if (this.config.align === 'center') {
            this.wrapper.style.marginLeft = "auto";
            this.wrapper.style.marginRight = "auto";
        } else if (this.config.align === 'left') {
            this.wrapper.style.marginLeft = "0";
            this.wrapper.style.marginRight = "auto";
        }
        // Default (from CSS) matches images (usually left with small margin)

        // Palettes
        this.palettes = {
            grayscale: ["#000000", "#363636", "#6e6e6e", "#929292", "#b6b6b6", "#dadada"],
            brand: ["#9a2b17", "#b01a00", "#c43818", "#d65231", "#e66c4b", "#f58666"], // Dark to light red
            default: ["#007bff", "#dc3545", "#28a745", "#fd7e14", "#6f42c1"]
        };
        // Granular maps
        this.palettes.grayscale.forEach((c, i) => this.palettes[`grayscale${i + 1}`] = c);
        this.palettes.brand.forEach((c, i) => this.palettes[`brand${i + 1}`] = c);

        this.initSVG();
        if (this.config.params) this.initSliders();

        // Initial Draw
        this.draw();

        // Lightbox
        this.svg.addEventListener('click', () => this.openLightbox());
    }

    initSVG() {
        this.width = this.config.width || 600;

        // Aspect Ratio
        if (this.config.aspectRatio) {
            let ratio = 1;
            if (typeof this.config.aspectRatio === 'string' && this.config.aspectRatio.includes(":")) {
                const parts = this.config.aspectRatio.split(":");
                ratio = parseFloat(parts[0]) / parseFloat(parts[1]);
            } else {
                ratio = parseFloat(this.config.aspectRatio);
            }
            this.height = this.width / ratio;
        } else {
            // Default 1:1 if explicit height not set
            this.height = this.config.height || this.width; // Default square (600x600)
        }

        this.padding = 35;

        const ns = "http://www.w3.org/2000/svg";
        this.svg = document.createElementNS(ns, "svg");
        this.svg.setAttribute("width", this.width);
        this.svg.setAttribute("height", this.height);
        this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
        this.svg.style.maxWidth = "100%";
        this.svg.style.height = "auto";
        this.svg.style.fontFamily = "var(--font-code, monospace)";
        this.svg.style.cursor = "zoom-in";
        this.svg.style.userSelect = "none"; // Request: prevent selection
        this.svg.style.webkitUserSelect = "none";

        // Groups
        this.bgGroup = document.createElementNS(ns, "g");
        this.secondaryGridGroup = document.createElementNS(ns, "g");
        this.gridGroup = document.createElementNS(ns, "g");
        this.axesGroup = document.createElementNS(ns, "g"); // Axes Lines & Ticks (Always below data)
        this.numbersGroup = document.createElementNS(ns, "g"); // Numbers (Configurable)
        this.dataGroup = document.createElementNS(ns, "g");
        this.labelGroup = document.createElementNS(ns, "g");
        this.legendGroup = document.createElementNS(ns, "g");

        // Layer Order
        // 1. Backgrounds
        this.svg.appendChild(this.bgGroup);
        this.svg.appendChild(this.secondaryGridGroup);
        this.svg.appendChild(this.gridGroup);
        this.svg.appendChild(this.axesGroup); // Grid & Notches/Axes always below plots

        // 2. Data vs Numbers
        if (this.config.renderOrder === 'numbers-top') {
            this.svg.appendChild(this.dataGroup);
            this.svg.appendChild(this.numbersGroup);
        } else {
            // Default: Numbers Below Data
            this.svg.appendChild(this.numbersGroup);
            this.svg.appendChild(this.dataGroup);
        }

        this.svg.appendChild(this.labelGroup);
        this.svg.appendChild(this.legendGroup);

        this.wrapper.appendChild(this.svg);
    }

    initSliders() {
        const controls = document.createElement("div");
        controls.className = "matephis-plot-controls";

        for (let key in this.config.params) {
            const p = this.config.params[key];
            const row = document.createElement("div");
            row.className = "matephis-slider-row";

            const label = document.createElement("label");
            label.innerText = `${key} = `;

            const valSpan = document.createElement("span");
            valSpan.className = "matephis-slider-val";
            valSpan.innerText = p.val;

            const input = document.createElement("input");
            input.type = "range";
            input.min = p.min;
            input.max = p.max;
            input.step = p.step || 0.1;
            input.value = p.val;

            input.addEventListener("input", (e) => {
                const v = parseFloat(e.target.value);
                this.params[key] = v;
                valSpan.innerText = v; // Update number
                this.draw(); // Re-render plot
            });

            row.appendChild(label);
            row.appendChild(valSpan);
            row.appendChild(input);
            controls.appendChild(row);
        }
        this.wrapper.appendChild(controls);
    }

    getColor(index, explicit) {
        if (explicit) {
            // check if it is a theme key
            if (this.palettes[explicit]) return this.palettes[explicit];
            if (typeof this.palettes[explicit] === 'string') return this.palettes[explicit]; // brand1 etc
            return explicit; // hex
        }
        const theme = this.config.theme || "brand";
        const palette = this.palettes[theme] || this.palettes.default;
        return palette[index % palette.length];
    }

    makeFn(str) {
        // Replace params
        let expr = str;
        for (let key in this.params) {
            // simple regex replacement for "k" -> value
            // boundary checks to avoid replacing "k" in "black"
            const re = new RegExp(`\\b${key}\\b`, 'g');
            expr = expr.replace(re, `(${this.params[key]})`);
        }

        // Implicit multiplication: "3x" -> "3*x", "3sin" -> "3*sin", ")x" -> ")*x"
        expr = expr.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
        expr = expr.replace(/(\))([a-zA-Z0-9(])/g, "$1*$2");

        // Negative power fix: "-x^2" -> "-(x^2)"
        // Covers start of string or following an operator/paren
        expr = expr.replace(/(^|[^a-zA-Z0-9])\-([a-z])\^(\d+)/g, "$1-($2^$3)");

        expr = expr.replace(/\^/g, "**");
        expr = expr.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|log|exp|abs|floor|ceil|round)\b/g, "Math.$1");
        expr = expr.replace(/\b(pi|PI)\b/g, "Math.PI");
        expr = expr.replace(/\b(e|E)\b/g, "Math.E");
        if (expr.includes("=")) {
            const parts = expr.split("=");
            expr = `(${parts[0]}) - (${parts[1]})`;
        }
        return expr;
    }

    draw() {
        // Clear dynamic groups
        this.gridGroup.innerHTML = "";
        this.dataGroup.innerHTML = "";
        this.axesGroup.innerHTML = "";
        this.numbersGroup.innerHTML = "";
        this.labelGroup.innerHTML = "";
        this.legendGroup.innerHTML = "";
        this.bgGroup.innerHTML = "";

        // Grid Opacity
        if (this.config.gridOpacity !== undefined) {
            this.gridGroup.setAttribute("opacity", this.config.gridOpacity);
        } else {
            // Default: 0.8
            this.gridGroup.setAttribute("opacity", 0.8);
        }

        // Bounds
        let xMin = this.config.xlim ? this.config.xlim[0] : -9.9;
        let xMax = this.config.xlim ? this.config.xlim[1] : 9.9;
        let yMin = this.config.ylim ? this.config.ylim[0] : -9.9;
        let yMax = this.config.ylim ? this.config.ylim[1] : 9.9;

        // Helper: Eval boundaries for dynamic ranges? (Skip for now, stick to fixed or equalAspect)

        // Equal Aspect
        if (this.config.equalAspect) {
            const plotW = this.width - 2 * this.padding;
            const plotH = this.height - 2 * this.padding;
            const ppU = plotW / (xMax - xMin);
            const reqH = plotH / ppU;
            const yc = (yMin + yMax) / 2;
            yMin = yc - reqH / 2;
            yMax = yc + reqH / 2;
        }

        const mapX = (x) => this.padding + ((x - xMin) / (xMax - xMin)) * (this.width - 2 * this.padding);
        const mapY = (y) => this.height - this.padding - ((y - yMin) / (yMax - yMin)) * (this.height - 2 * this.padding);

        // --- 1. Background ---
        const ns = "http://www.w3.org/2000/svg";
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", this.padding);
        rect.setAttribute("y", this.padding);
        rect.setAttribute("width", this.width - 2 * this.padding);
        rect.setAttribute("height", this.height - 2 * this.padding);
        rect.setAttribute("fill", "#fff");
        this.bgGroup.appendChild(rect);

        // --- 2. Grid/Axes ---
        const gridColor = "#808080"; // Darker Grey (was #c0c0c0)
        const axisColor = "#333";

        // Step Parsers
        const parseStep = (val, def) => {
            if (val === undefined) return { val: def, isPi: false };
            if (typeof val === 'number') return { val: val, isPi: false };
            // String check
            const isPi = /pi/i.test(val);
            let num = def;
            try {
                const expr = val.replace(/pi/gi, "Math.PI");
                num = new Function("return " + expr)();
            } catch (e) { }
            return { val: num, isPi: isPi };
        };

        const xStepObj = parseStep(this.config.xStep, 5);
        const yStepObj = parseStep(this.config.yStep, 5);

        // Number Steps (Defaults to Grid Step if not present)
        const xNumStepObj = this.config.xNumberStep !== undefined ? parseStep(this.config.xNumberStep, xStepObj.val) : xStepObj;
        const yNumStepObj = this.config.yNumberStep !== undefined ? parseStep(this.config.yNumberStep, yStepObj.val) : yStepObj;

        const formatTick = (val, isPi) => {
            if (!isPi) return parseFloat(val.toFixed(10));
            const v = val / Math.PI;
            if (Math.abs(v) < 1e-6) return "0";
            if (Math.abs(v - 1) < 1e-6) return "π";
            if (Math.abs(v + 1) < 1e-6) return "-π";

            // Integers (Check first to avoid 4pi/2)
            if (Math.abs(v - Math.round(v)) < 1e-6) return Math.round(v) + "π";

            // Halves (k * PI/2)
            const d2 = v * 2;
            if (Math.abs(d2 - Math.round(d2)) < 1e-6) {
                const n = Math.round(d2);
                // n=1 -> pi/2, n=3 -> 3pi/2
                return (n === 1 ? "" : n === -1 ? "-" : n) + "π/2";
            }
            // Quarters (k * PI/4)
            const d4 = v * 4;
            if (Math.abs(d4 - Math.round(d4)) < 1e-6) {
                const n = Math.round(d4);
                return (n === 1 ? "" : n === -1 ? "-" : n) + "π/4";
            }

            return v.toFixed(2) + "π";
        };

        const xStep = xStepObj.val;
        const yStep = yStepObj.val;

        this.secondaryGridGroup.innerHTML = "";
        // Default opacity is half of the main grid opacity (0.25 if main is 0.5)
        const mainOpacity = (this.config.gridOpacity !== undefined) ? this.config.gridOpacity : 0.5;
        this.secondaryGridGroup.setAttribute("opacity", (this.config.secondaryGridOpacity !== undefined) ? this.config.secondaryGridOpacity : mainOpacity * 0.5);

        // Secondary defaults to 1 if main is 5, otherwise main/5
        const defaultSecX = (xStep === 5) ? 1 : xStep / 5;
        const defaultSecY = (yStep === 5) ? 1 : yStep / 5;

        if (this.config.xStepSecondary !== undefined || defaultSecX) {
            const sxStepObj = parseStep(this.config.xStepSecondary, defaultSecX);
            const sxStep = sxStepObj.val;
            const startSX = Math.ceil(xMin / sxStep) * sxStep;
            for (let x = startSX; x <= xMax + 1e-9; x += sxStep) {
                const px = mapX(x);
                if (px < this.padding || px > this.width - this.padding) continue;
                this.line(px, this.padding, px, this.height - this.padding, gridColor, 1.5, "", this.secondaryGridGroup);
            }
        }

        if (this.config.yStepSecondary !== undefined || defaultSecY) {
            const syStepObj = parseStep(this.config.yStepSecondary, defaultSecY);
            const syStep = syStepObj.val;
            const startSY = Math.ceil(yMin / syStep) * syStep;
            for (let y = startSY; y <= yMax + 1e-9; y += syStep) {
                const py = mapY(y);
                if (py < this.padding || py > this.height - this.padding) continue;
                this.line(this.padding, py, this.width - this.padding, py, gridColor, 1.5, "", this.secondaryGridGroup);
            }
        }

        // X Lines
        const startX = Math.ceil(xMin / xStep) * xStep;
        for (let x = startX; x <= xMax + 1e-9; x += xStep) {
            const px = mapX(x);
            if (px < this.padding || px > this.width - this.padding) continue;

            // Grid
            if (this.config.grid !== false) this.line(px, this.padding, px, this.height - this.padding, gridColor, 1.5, "", this.gridGroup);

            // Ticks (Default False) -- To AxesGroup
            if (Math.abs(x) > 1e-9 && this.config.showXTicks === true) {
                this.line(px, mapY(0), px, mapY(0) + 5, axisColor, 2, "", this.axesGroup);
            }
        }


        // X Numbers (Independent Loop)
        const xNumStep = xNumStepObj.val;
        if (this.config.showXNumbers !== false) {
            // Extend scan range slightly to catch border items
            const startNX = Math.ceil((xMin - 0.1) / xNumStep) * xNumStep;
            for (let x = startNX; x <= xMax + 0.1; x += xNumStep) {
                if (Math.abs(x) < 1e-9) continue; // Skip zero

                let px = mapX(x);
                let align = "middle";

                // Clamping Logic
                if (Math.abs(x - xMin) <= 0.1) {
                    px = this.padding;
                    align = "start"; // Align text to right of tick (inside) ? Or start at padding
                    // Standard "start" aligns rightwards from x.
                    // But numbers are centered usually. 
                    // Let's force it to padding + nudge?
                    // Actually maybe "start" is good if it's at left edge.
                } else if (Math.abs(x - xMax) <= 0.1) {
                    px = this.width - this.padding;
                    align = "end";
                }

                if (px < this.padding || px > this.width - this.padding) continue;

                // Font size for shift calc
                const fsVal = this.getConfigSize('numberSize'); // Helper to get int value
                
                // Align negative numbers (center the number part)
                if (x < -1e-9 && align === "middle") {
                    // Shift left by half a char width approx (0.3em)
                    px -= fsVal * 0.3;
                }

                this.text(px, mapY(0) + 20, formatTick(x, xNumStepObj.isPi), align, "top", "#666", "normal", this.numbersGroup, fsVal);
            }
        }
        // Y Lines
        const startY = Math.ceil(yMin / yStep) * yStep;
        for (let y = startY; y <= yMax + 1e-9; y += yStep) {
            const py = mapY(y);
            if (py < this.padding || py > this.height - this.padding) continue;

            // Grid
            if (this.config.grid !== false) this.line(this.padding, py, this.width - this.padding, py, gridColor, 1.5, "", this.gridGroup);

            // Ticks
            if (Math.abs(y) > 1e-9 && this.config.showYTicks === true) {
                this.line(mapX(0) - 5, py, mapX(0), py, axisColor, 2, "", this.axesGroup);
            }
        }

        // Y Numbers (Independent Loop)
        const yNumStep = yNumStepObj.val;
        if (this.config.showYNumbers !== false) {
            const startNY = Math.ceil((yMin - 0.1) / yNumStep) * yNumStep;
            for (let y = startNY; y <= yMax + 0.1; y += yNumStep) {
                if (Math.abs(y) < 1e-9) continue;

                let py = mapY(y);
                let baseline = "middle";

                // Clamping Y (Inverted: Max Y is Top (low py), Min Y is Bottom (high py))
                if (Math.abs(y - yMin) <= 0.1) {
                    py = this.height - this.padding;
                    baseline = "auto"; // Bottom? "auto" is usually alphabetic. SVG uses "text-after-edge" or similar?
                    // Let's use coordinate shift.
                    py -= 5;
                    // Or just standard middle but shifted?
                } else if (Math.abs(y - yMax) <= 0.1) {
                    py = this.padding;
                    // Top edge
                    py += 5;
                }

                if (py < this.padding || py > this.height - this.padding) continue;
                this.text(mapX(0) - 5, py, formatTick(y, yNumStepObj.isPi), "end", baseline, "#666", "normal", this.numbersGroup, this.getConfigSize('numberSize'));
            }
        }
        
        // Origin "0" (Shared)
        if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
            // Check visibility config if needed, usually we want 0 if numbers are on
            if (this.config.showXNumbers !== false || this.config.showYNumbers !== false) {
                 const px = mapX(0) - 5; // Align with Y numbers (end anchor)
                 const py = mapY(0) + 20; // Align with X numbers (top baseline)
                 this.text(px, py, "0", "end", "top", "#666", "normal", this.numbersGroup, this.getConfigSize('numberSize'));
            }
        }
        // Main Axes - To AxesGroup
        const x0 = mapX(0), y0 = mapY(0);
        if (x0 >= this.padding && x0 <= this.width - this.padding) this.line(x0, this.padding, x0, this.height - this.padding, axisColor, 2, "", this.axesGroup);
        if (y0 >= this.padding && y0 <= this.height - this.padding) this.line(this.padding, y0, this.width - this.padding, y0, axisColor, 2, "", this.axesGroup);

        // Arrows - To AxesGroup (part of axes)
        if (this.config.axisArrows) {
            const defs = document.createElementNS(ns, "defs");
            const markerW = 10, markerH = 10;
            const arrowPath = `M 0 0 L 10 5 L 0 10 z`; // Basic triangle

            // X Arrow Marker
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

            // Y Arrow Marker
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

            // Draw Arrows Manually (Markers can be tricky with scaling)
            // X Arrow (Positive)
            if (y0 >= this.padding && y0 <= this.height - this.padding) {
                const axX = this.width - this.padding + 5;
                const axY = y0;
                const arrowXPoly = document.createElementNS(ns, "polygon");
                // Tip at axX, base back 8px, width 6px
                arrowXPoly.setAttribute("points", `${axX},${axY} ${axX - 8},${axY - 4} ${axX - 8},${axY + 4}`);
                arrowXPoly.setAttribute("fill", axisColor);
                this.axesGroup.appendChild(arrowXPoly);
            }

            // Y Arrow (Positive)
            if (x0 >= this.padding && x0 <= this.width - this.padding) {
                const ayX = x0;
                const ayY = this.padding - 5;
                const arrowYPoly = document.createElementNS(ns, "polygon");
                // Tip at ayY, base down 8px, width 6px
                arrowYPoly.setAttribute("points", `${ayX},${ayY} ${ayX - 4},${ayY + 8} ${ayX + 4},${ayY + 8}`);
                arrowYPoly.setAttribute("fill", axisColor);
                this.axesGroup.appendChild(arrowYPoly);
            }
        }

        // Axis Labels
        if (this.config.axisLabels) {
            const lblSize = this.getConfigSize('labelSize');
            this.text(this.width - this.padding + 10, y0, this.config.axisLabels[0], "start", "middle", axisColor, "bold", this.axesGroup, lblSize);
            this.text(x0, this.padding - 15, this.config.axisLabels[1], "middle", "bottom", axisColor, "bold", this.axesGroup, lblSize);
        }

        // --- 3. Data ---
        const data = this.config.data || [];
        const legendItems = [];

        data.forEach((item, idx) => {
            const color = this.getColor(idx, item.color);
            const width = item.width || item.strokeWidth || 3;
            const dash = item.dash || "";

            // Label Position Init
            let labelPos = null;
            if (item.labelAt) {
                labelPos = { x: mapX(item.labelAt[0]), y: mapY(item.labelAt[1]) };
            }

            if (item.label && this.config.legend) {
                legendItems.push({ color, label: item.label, type: item.points ? 'point' : 'line', dash });
            }

            // Function
            if (item.fn) {
                let d = "";
                let started = false;
                const f = new Function("x", `return ${this.makeFn(item.fn)};`);
                const res = (this.width);
                const dx = (xMax - xMin) / res;

                for (let i = 0; i <= res; i++) {
                    const x = xMin + i * dx;
                    try {
                        const y = f(x);
                        if (isFinite(y) && y >= yMin && y <= yMax) {
                            const px = mapX(x), py = mapY(y);
                            if (py < -this.height || py > this.height * 2) { started = false; continue; } // Clip
                            if (!started) { d += `M ${px} ${py}`; started = true; }
                            else d += ` L ${px} ${py}`;
                            if (!item.labelAt) labelPos = { x: px, y: py };
                        } else started = false;
                    } catch (e) { }
                }
                const path = document.createElementNS(ns, "path");
                path.setAttribute("d", d);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", color);
                path.setAttribute("stroke-width", width);
                if (dash) path.setAttribute("stroke-dasharray", dash);
                if (item.opacity !== undefined) path.setAttribute("opacity", item.opacity);
                this.dataGroup.appendChild(path);
            }

            // Implicit
            if (item.implicit) {
                const f = new Function("x", "y", `return ${this.makeFn(item.implicit)};`);
                // Use lower resolution if dragging slider (not implemented detection yet, but 60x60 is safe freq)
                const res = 60;
                const dx = (xMax - xMin) / res, dy = (yMax - yMin) / res;
                const grid = [];
                for (let i = 0; i <= res; i++) { grid[i] = []; for (let j = 0; j <= res; j++) grid[i][j] = f(xMin + i * dx, yMin + j * dy); }

                const paths = []; // separate segments
                const lerp = (v0, v1) => Math.abs(v0) / (Math.abs(v0) + Math.abs(v1));

                for (let i = 0; i < res; i++) {
                    for (let j = 0; j < res; j++) {
                        const v0 = grid[i][j], v1 = grid[i + 1][j], v2 = grid[i + 1][j + 1], v3 = grid[i][j + 1];
                        let c = 0; if (v0 > 0) c |= 1; if (v1 > 0) c |= 2; if (v2 > 0) c |= 4; if (v3 > 0) c |= 8;
                        if (c === 0 || c === 15) continue;

                        const xl = xMin + i * dx, xr = xl + dx, yb = yMin + j * dy, yt = yb + dy;
                        const pB = [xl + dx * lerp(v0, v1), yb], pR = [xr, yb + dy * lerp(v1, v2)];
                        const pT = [xl + dx * lerp(v3, v2), yt], pL = [xl, yb + dy * lerp(v0, v3)];

                        const seg = (P1, P2) => `M ${mapX(P1[0])} ${mapY(P1[1])} L ${mapX(P2[0])} ${mapY(P2[1])}`;

                        switch (c) {
                            case 1: case 14: paths.push(seg(pL, pB)); break;
                            case 2: case 13: paths.push(seg(pB, pR)); break;
                            case 3: case 12: paths.push(seg(pL, pR)); break;
                            case 4: case 11: paths.push(seg(pT, pR)); break;
                            case 5: paths.push(seg(pL, pT) + seg(pB, pR)); break;
                            case 6: case 9: paths.push(seg(pB, pT)); break;
                            case 7: case 8: paths.push(seg(pL, pT)); break;
                            case 10: paths.push(seg(pL, pB) + seg(pT, pR)); break;
                        }
                        if (paths.length && !item.labelAt) labelPos = { x: mapX(pR[0]), y: mapY(pR[1]) }; // Approx
                    }
                }
                const path = document.createElementNS(ns, "path");
                path.setAttribute("d", paths.join(" "));
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", color);
                path.setAttribute("stroke-width", width);
                if (dash) path.setAttribute("stroke-dasharray", dash);
                if (item.opacity !== undefined) path.setAttribute("opacity", item.opacity);
                this.dataGroup.appendChild(path);
            }

            // Vertical Line
            if (item.x !== undefined) {
                const px = mapX(item.x);
                if (px >= this.padding && px <= this.width - this.padding) {
                    const l = this.line(px, this.padding, px, this.height - this.padding, color, width, dash, this.dataGroup);
                    if (item.opacity !== undefined) l.setAttribute("opacity", item.opacity);
                    if (!item.labelAt) labelPos = { x: px, y: this.padding + 15 };
                }
            }

            // Points
            if (item.points) {
                item.points.forEach(pt => {
                    const px = mapX(pt[0]), py = mapY(pt[1]);
                    if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
                        const c = document.createElementNS(ns, "circle");
                        c.setAttribute("cx", px); c.setAttribute("cy", py);
                        c.setAttribute("r", item.radius || 4);
                        c.setAttribute("fill", item.fillColor || color);
                        c.setAttribute("stroke", item.strokeColor || "none");
                        c.setAttribute("stroke-width", item.strokeWidth || 0);
                        if (item.opacity !== undefined) c.setAttribute("opacity", item.opacity);
                        this.dataGroup.appendChild(c);
                        // Use last point for label if no labelAt
                        if (!item.labelAt) labelPos = { x: px, y: py };
                    }
                });
            }

            // Labels (if not legend)
            if (item.label && labelPos && !this.config.legend) {
                // Smart Position
                let anchor = "start";
                let dx = 5, dy = -5;
                if (labelPos.x > this.width - 60) { anchor = "end"; dx = -5; }
                if (labelPos.y < 30) { dy = 15; } // Shift down if too high
                if (labelPos.x < 60) { anchor = "start"; dx = 5; }

                // Manual Overrides
                if (item.labelOffset) { dx += item.labelOffset[0]; dy += item.labelOffset[1]; }
                if (item.labelAnchor) { anchor = item.labelAnchor; }

                // Clamp
                const lx = Math.max(10, Math.min(this.width - 10, labelPos.x + dx));
                const ly = Math.max(10, Math.min(this.height - 10, labelPos.y + dy));

                const labelWeight = this.config.labelWeight || "normal";
                this.text(lx, ly, item.label, anchor, "bottom", color, labelWeight, this.labelGroup, this.getConfigSize('labelSize'));
            }
        });

        // --- 4. Legend ---
        if (this.config.legend && legendItems.length > 0) {
            this.drawLegend(legendItems);
        }
    }

    drawLegend(items) {
        const x = this.width - this.padding - 10;
        const y = this.padding + 10;
        
        const fs = this.getConfigSize('legendSize');
        
        // Dynamic width calculation
        let maxLen = 0;
        items.forEach(it => maxLen = Math.max(maxLen, it.label.length));
        // Approx width: Symbol (30) + Chars * (FontSize * 0.6) + Padding (20)
        let w = 30 + (maxLen * (fs * 0.6)) + 20;
        if (w < 120) w = 120; // Min width

        const h = items.length * (fs * 1.5) + 10; // Dynamic height based on font size
        const labelWeight = this.config.labelWeight || "normal";

        // bg
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x - w);
        rect.setAttribute("y", y);
        rect.setAttribute("width", w);
        rect.setAttribute("height", h);
        rect.setAttribute("fill", "white");
        rect.setAttribute("fill-opacity", "0.9");
        rect.setAttribute("stroke", "#eee");
        // rect.setAttribute("rx", 4); // Square corners requested
        this.legendGroup.appendChild(rect);

        items.forEach((item, i) => {
            const ly = y + 15 + i * (fs * 1.5);
            const lx = x - w + 10;
            // Symbol
            const symbolY = ly + (fs / 3); // Align with text baseline shift
            if (item.type === 'point') {
                const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                c.setAttribute("cx", lx + 5); c.setAttribute("cy", symbolY); c.setAttribute("r", 4);
                c.setAttribute("fill", item.color);
                this.legendGroup.appendChild(c);
            } else {
                this.line(lx, symbolY, lx + 15, symbolY, item.color, 2, item.dash, this.legendGroup);
            }

            // Text or MathJax
            if (window.MathJax && item.label.includes("$")) {
                const tex = item.label.replace(/\$/g, "");
                const svgNode = MathJax.tex2svg(tex).querySelector("svg");
                if (svgNode) {
                    // Inject vector math
                    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    g.setAttribute("transform", `translate(${lx + 25}, ${ly - 5}) scale(0.015)`); // MathJax scale is usually huge
                    g.setAttribute("fill", "#333"); // Force color
                    // We need to copy paths deeply
                    g.innerHTML = svgNode.innerHTML;
                    // Note: MathJax SVG uses <use> refs, needs <defs>. Complicated.
                    // Simpler fallback for now: just try innerHTML or text fallback if complicated
                    // Actually, standard mathjax output relies on defs. We might break it if we don't copy defs.
                    // Let's stick to text fallback for reliability in this fast iter.
                    this.text(lx + 25, ly + (fs/3), item.label, "start", "middle", "#333", labelWeight, this.legendGroup, fs);
                }
            } else {
                this.text(lx + 20, ly + (fs/3), item.label, "start", "middle", "#333", labelWeight, this.legendGroup, fs);
            }
        });
    }

    // Helper to resolve font size
    getConfigSize(specificKey) {
        // priority: specific > general > default(18)
        if (this.config[specificKey]) return typeof this.config[specificKey] === 'number' ? this.config[specificKey] : parseInt(this.config[specificKey]);
        if (this.config.fontSize) return typeof this.config.fontSize === 'number' ? this.config.fontSize : parseInt(this.config.fontSize);
        return 18;
    }

    line(x1, y1, x2, y2, color, width, dash, parent) {
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        l.setAttribute("stroke", color); l.setAttribute("stroke-width", width);
        if (dash) l.setAttribute("stroke-dasharray", dash);
        // Note: The helper function 'line' doesn't easily accept extra attributes like opacity 
        // without changing signature. But we can access the last child of parent if needed, 
        // or just accept we might need to modify 'line' or use 'item.opacity' inside the specific call block.
        // For the Vertical Line case (which uses this.line):
        parent.appendChild(l);
        return l; // Return element so we can modify it
    }

    text(x, y, str, anchor, baseline, color, weight = "normal", parent = this.axesGroup, size = null) {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x); t.setAttribute("y", y);
        t.setAttribute("text-anchor", anchor);
        t.setAttribute("dominant-baseline", baseline);
        t.setAttribute("fill", color);
        // Configurable Font Size
        const fSize = (size !== null) ? size + "px" : "18px";
        t.setAttribute("font-size", fSize);
        t.setAttribute("font-weight", weight);
        t.textContent = str;
        t.style.paintOrder = "stroke";
        t.style.stroke = "#fff";
        t.style.strokeWidth = "3px";
        parent.appendChild(t);
    }

    openLightbox() {
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(this.svg);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        // Scale up for lightbox but maintain aspect ratio
        const maxDim = 1200;
        const scale = Math.min(maxDim / this.width, maxDim / this.height);
        const newW = Math.round(this.width * scale);
        const newH = Math.round(this.height * scale);

        source = source.replace(/width="[^"]*"/, `width="${newW}"`);
        source = source.replace(/height="[^"]*"/, `height="${newH}"`);

        const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(source)));
        const lb = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');
        if (lb && img) { lb.style.display = "flex"; img.src = url; }
    }
}

if (typeof module !== 'undefined') module.exports = MatephisPlot;