/**
 * Matephis Circuit Plotting Library
 * 
 * A lightweight SVG-based plotting library for drawing and simulating electrical circuits.
 * Supports series/parallel layouts, interactive switches, and visual feedback for voltage and current.
 * 
 * @version 1.0
 */

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener("DOMContentLoaded", () => {
        MatephisCircuit.init();
    });
}

class MatephisCircuit {
    static _render(container, source) {
        const config = JSON.parse(source);

        // Multi-circuit mode: { "circuits": [...], "gap": 6 }
        if (config.circuits && Array.isArray(config.circuits)) {
            const row = document.createElement('div');
            row.className = 'matephis-circuit-multi';
            // Optional gap override (px)
            if (config.gap !== undefined) row.style.gap = config.gap + 'px';
            container.appendChild(row);

            config.circuits.forEach(entry => {
                const col = document.createElement('div');
                col.className = 'matephis-circuit-multi-item';

                const circuitDiv = document.createElement('div');
                col.appendChild(circuitDiv);

                if (entry.label) {
                    const caption = document.createElement('p');
                    caption.className = 'matephis-circuit-caption';
                    caption.textContent = entry.label;
                    if (entry.boldLabel) caption.style.fontWeight = 'bold';
                    col.appendChild(caption);
                }

                row.appendChild(col);

                // Merge entry-level options (padding, cssWidth, etc.) into the circuit config.
                const circuitConfig = Object.assign({}, entry.circuit);
                if (entry.padding       !== undefined) circuitConfig.padding       = entry.padding;
                if (entry.paddingTop    !== undefined) circuitConfig.paddingTop    = entry.paddingTop;
                if (entry.paddingBottom !== undefined) circuitConfig.paddingBottom = entry.paddingBottom;
                if (entry.paddingLeft   !== undefined) circuitConfig.paddingLeft   = entry.paddingLeft;
                if (entry.paddingRight  !== undefined) circuitConfig.paddingRight  = entry.paddingRight;
                if (entry.cssWidth      !== undefined) circuitConfig.cssWidth      = entry.cssWidth;
                new MatephisCircuit(circuitDiv, JSON.stringify(circuitConfig));
            });
        } else {
            // Single-circuit mode
            new MatephisCircuit(container, source);
        }
    }

    static init() {
        document.querySelectorAll('.matephis-circuit').forEach(container => {
            try {
                if (container.getAttribute('data-processed')) return;
                const source = container.textContent;
                container.innerHTML = "";
                MatephisCircuit._render(container, source);
                container.setAttribute('data-processed', 'true');
            } catch (e) {
                console.error("Circuit Error", e);
                container.innerHTML = `<div style="color:red; border:1px solid red; padding:5px;">Error: ${e.message}</div>`;
            }
        });

        document.querySelectorAll('code.language-circuit').forEach(code => {
            let container;
            let target;
            try {
                target = code.closest('div.language-circuit') || code.closest('pre');
                if (!target) target = code.parentElement;
                if (target.getAttribute('data-processed')) return;

                const source = code.textContent;
                container = document.createElement('div');
                container.className = 'matephis-circuit';

                target.parentNode.insertBefore(container, target);
                target.style.display = 'none';

                MatephisCircuit._render(container, source);
                target.setAttribute('data-processed', 'true');
            } catch (e) {
                console.error("Code Block Circuit Error", e);
                if (container) {
                    container.innerHTML = `<div style="color:red; border:1px solid red; padding:5px;">Error: ${e.message}</div>`;
                } else if (target) {
                    const errorDiv = document.createElement('div');
                    errorDiv.innerHTML = `<div style="color:red; border:1px solid red; padding:5px;">Error: ${e.message}</div>`;
                    target.parentNode.insertBefore(errorDiv, target);
                }
            }
        });
    }

    constructor(container, source) {
        this.container = container;
        try {
            this.config = JSON.parse(source);
        } catch (e) {
            this.config = { type: "series", components: [] };
            console.error("Invalid JSON:", e);
        }

        this.nodes = [];
        this.branches = [];
        this.components = []; // Flat list of renderable components
        
        this.uid = Math.random().toString(36).substr(2, 9);
        
        this.wrapper = document.createElement("div");
        this.wrapper.className = "matephis-circuit-container";
        this.container.appendChild(this.wrapper);

        this.gridSize = 50; // Base unit length

        // UI Config
        if (this.config.cssWidth) {
            this.wrapper.style.maxWidth = this.config.cssWidth;
            this.wrapper.style.width = "100%";
        }
        if (this.config.align === 'center') this.wrapper.classList.add('align-center');
        else if (this.config.align === 'left') this.wrapper.classList.add('align-left');
        if (this.config.border) this.wrapper.classList.add('bordered');
        if (this.simulate) this.wrapper.classList.add('interactive');

        this._parseAndLayout();
        this._initSVG();
        
        this.draw();
    }

    _resolveCoordinate(coord, currentPos) {
        if (coord === undefined || coord === null) {
            return currentPos ? [...currentPos] : [0, 0];
        }
        if (Array.isArray(coord) && coord.length === 2) {
            return [...coord];
        }
        if (typeof coord === 'string' && this.anchors[coord]) {
            return [...this.anchors[coord]];
        }
        return [0, 0];
    }

    _parseAndLayout() {
        this.anchors = {};
        this.renderElements = [];
        this.nodeMarkers = [];
        
        const PADDING = (this.config.padding !== undefined) ? this.config.padding : 1;
        const PAD_TOP = (this.config.paddingTop !== undefined) ? this.config.paddingTop : PADDING;
        const PAD_BOTTOM = (this.config.paddingBottom !== undefined) ? this.config.paddingBottom : PADDING;
        const PAD_LEFT = (this.config.paddingLeft !== undefined) ? this.config.paddingLeft : PADDING;
        const PAD_RIGHT = (this.config.paddingRight !== undefined) ? this.config.paddingRight : PADDING;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const expandBounds = (x, y) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        };

        // 1. Process Nodes and build Anchors
        if (this.config.nodes && Array.isArray(this.config.nodes)) {
            this.config.nodes.forEach(node => {
                const nx = node.pos ? node.pos[0] : 0;
                const ny = node.pos ? node.pos[1] : 0;
                
                expandBounds(nx, ny);
                this.nodeMarkers.push(node);

                if (node.id) {
                    this.anchors[node.id] = [nx, ny];
                    
                    if (node.type && node.type.startsWith('transistor')) {
                        // Dummy anchor calculations for testing. We will refine this.
                        // Standardize physical terminal locations relative to pos.
                        let dir = node.direction || 'up'; // up, down, left, right
                        let bCoord, cCoord, eCoord;
                        
                        // Let's assume the node pos is the center of the transistor.
                        // Grid distance for terminals (e.g., 0.5 units away)
                        const td = 1.0; 
                        
                        if (dir === 'up') {
                            bCoord = [nx - td, ny];
                            cCoord = [nx + td, ny - td];
                            eCoord = [nx + td, ny + td];
                        } else if (dir === 'right') {
                            bCoord = [nx, ny + td];
                            cCoord = [nx + td, ny - td];
                            eCoord = [nx - td, ny - td];
                        } else if (dir === 'down') {
                            bCoord = [nx + td, ny];
                            cCoord = [nx - td, ny + td];
                            eCoord = [nx - td, ny - td];
                        } else if (dir === 'left') {
                            bCoord = [nx, ny - td];
                            cCoord = [nx - td, ny + td];
                            eCoord = [nx + td, ny + td];
                        }

                        this.anchors[`${node.id}.B`] = bCoord;
                        this.anchors[`${node.id}.C`] = cCoord;
                        this.anchors[`${node.id}.E`] = eCoord;
                        
                        expandBounds(bCoord[0], bCoord[1]);
                        expandBounds(cCoord[0], cCoord[1]);
                        expandBounds(eCoord[0], eCoord[1]);

                        // Push the component to be rendered
                        this.renderElements.push({
                            type: node.type,
                            startX: nx,
                            startY: ny,
                            direction: dir,
                            label: node.label,
                            id: node.id
                        });
                    }
                }
            });
        }

        // 2. Process Segments
        let currentPos = [0, 0];
        
        if (this.config.segments && Array.isArray(this.config.segments)) {
            this.config.segments.forEach(seg => {
                let startPos = this._resolveCoordinate(seg.start, currentPos);
                let endPos = this._resolveCoordinate(seg.end, startPos);
                
                expandBounds(startPos[0], startPos[1]);
                expandBounds(endPos[0], endPos[1]);

                currentPos = [...endPos];

                const dx = endPos[0] - startPos[0];
                const dy = endPos[1] - startPos[1];
                const length = Math.sqrt(dx*dx + dy*dy);
                const angle = Math.atan2(dy, dx);
                
                const components = seg.components || [];
                const n = components.length;

                if (n === 0) {
                    this.renderElements.push({ type: 'pure_wire', path: [[...startPos], [...endPos]] });
                } else {
                    // We need to place components along the segment.
                    // Adapt component anchor distance if many comps are crammed on a small segment
                    const COMP_SIZE = Math.min(2, (length / Math.max(1, n)) * 0.85); 
                    
                    // Sort components by specified position if available
                    let placedComps = components.map((comp, i) => {
                        let frac = comp.position !== undefined ? comp.position : (i + 1) / (n + 1);
                        return { comp, frac };
                    }).sort((a, b) => a.frac - b.frac);

                    let lastPoint = [...startPos];

                    placedComps.forEach(pc => {
                        let centerDist = pc.frac * length;
                        let cx = startPos[0] + (dx / length) * centerDist;
                        let cy = startPos[1] + (dy / length) * centerDist;
                        
                        // Component bounds on the line
                        let compStartX = cx - (dx / length) * (COMP_SIZE/2);
                        let compStartY = cy - (dy / length) * (COMP_SIZE/2);
                        
                        let compEndX = cx + (dx / length) * (COMP_SIZE/2);
                        let compEndY = cy + (dy / length) * (COMP_SIZE/2);

                        // If there is space before the component, draw a pure wire
                        // Ensure it's moving forward along the segment
                        let wireVx = compStartX - lastPoint[0];
                        let wireVy = compStartY - lastPoint[1];
                        let proj1 = wireVx * (dx / length) + wireVy * (dy / length);
                        
                        if (proj1 > 0.01) {
                            this.renderElements.push({ type: 'pure_wire', path: [[...lastPoint], [compStartX, compStartY]] });
                        }

                        // Add the actual component
                        this.renderElements.push({
                            ...pc.comp,
                            type: pc.comp.type,
                            startX: compStartX,
                            startY: compStartY,
                            endX: compEndX,
                            endY: compEndY,
                            angle: angle * 180 / Math.PI
                        });

                        lastPoint = [compEndX, compEndY];
                    });

                    // Draw final wire to endPos if moving forward
                    let finalVx = endPos[0] - lastPoint[0];
                    let finalVy = endPos[1] - lastPoint[1];
                    let proj2 = finalVx * (dx / length) + finalVy * (dy / length);
                    
                    if (proj2 > 0.01) {
                         this.renderElements.push({ type: 'pure_wire', path: [[...lastPoint], [...endPos]] });
                    }
                }
            });
        }

        if (minX === Infinity) { minX = 0; minY = 0; maxX = 4; maxY = 4; }

        this.gridWidth = (maxX - minX) + PAD_LEFT + PAD_RIGHT;
        this.gridHeight = (maxY - minY) + PAD_TOP + PAD_BOTTOM;
        
        this.renderOffset = {
            x: PAD_LEFT - minX,
            y: PAD_TOP - minY
        };

        // Convert grid coords to pixel coords
        this.width  = this.gridWidth  * this.gridSize;
        this.height = this.gridHeight * this.gridSize;
        
        // Shift all elements
        this.renderElements.forEach(el => {
            if (el.type === 'pure_wire') {
                el.path[0][0] += this.renderOffset.x;
                el.path[0][1] += this.renderOffset.y;
                el.path[1][0] += this.renderOffset.x;
                el.path[1][1] += this.renderOffset.y;
            } else {
                el.startX += this.renderOffset.x;
                el.startY += this.renderOffset.y;
                if (el.endX !== undefined) el.endX += this.renderOffset.x;
                if (el.endY !== undefined) el.endY += this.renderOffset.y;
            }
        });
        
        this.nodeMarkers.forEach(n => {
            if (n.pos) {
                n.pos[0] += this.renderOffset.x;
                n.pos[1] += this.renderOffset.y;
            }
        });
    }

    _initSVG() {
        const ns = "http://www.w3.org/2000/svg";
        this.svg = document.createElementNS(ns, "svg");
        this.svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        
        // Convert grid size to actual pixels
        this.width = this.gridWidth * this.gridSize;
        this.height = this.gridHeight * this.gridSize;
        
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
        this.svg.setAttribute("class", "matephis-circuit-svg");
        this.svg.onclick = () => this._openLightbox();
        
        // Prevent SVG from stretching to 70% of the screen if it's a small circuit
        if (!this.config.cssWidth) {
            this.wrapper.style.maxWidth = this.width + "px";
        }

        this.defs = document.createElementNS(ns, "defs");
        this.wireGroup = document.createElementNS(ns, "g");
        this.compGroup = document.createElementNS(ns, "g");
        this.animGroup = document.createElementNS(ns, "g"); // Current dots
        this.labelGroup = document.createElementNS(ns, "g");

        this.svg.appendChild(this.defs);
        this.svg.appendChild(this.wireGroup);
        this.svg.appendChild(this.compGroup);
        this.svg.appendChild(this.animGroup);
        this.svg.appendChild(this.labelGroup);

        const stage = document.createElement("div");
        stage.className = "matephis-circuit-stage";
        stage.appendChild(this.svg);
        this.wrapper.appendChild(stage);
    }
    


    draw() {
        // Clear previous
        this.wireGroup.innerHTML = "";
        this.compGroup.innerHTML = "";
        this.labelGroup.innerHTML = "";
        this.animGroup.innerHTML = "";
        this.defs.innerHTML = ""; // clear gradients

        // Fixed stroke widths in SVG user units.
        // Since maxWidth = gridWidth * gridSize = viewBox width in px, 1 user unit = 1 CSS px always.
        // This guarantees identical stroke thickness across all circuits at any size.
        const strokeW = 1.75;
        const strokeWThick = 3.5;
        
        // Path accumulator for simulation: store all D strings of pure wires
        let simPaths = [];

        const createWire = (x1, y1, x2, y2) => {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("class", "matephis-circuit-wire");
            line.setAttribute("stroke-width", strokeW);
            
            if (this.simulate) simPaths.push(`M ${x1},${y1} L ${x2},${y2}`);
            return line;
        };

        const createLabel = (x, y, text) => {
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", y);
            label.setAttribute("class", "matephis-circuit-label");
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("dominant-baseline", "central");
            label.setAttribute("font-size", this.gridSize * 0.28);
            label.textContent = text;
            return label;
        };
        
        // Helper: segment intersection. Returns intersection pt [x,y] strictly between endpoints, or null
        const getIntersection = (p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) => {
            const s1_x = p1_x - p0_x, s1_y = p1_y - p0_y;
            const s2_x = p3_x - p2_x, s2_y = p3_y - p2_y;
            const denom = (-s2_x * s1_y + s1_x * s2_y);
            if (denom === 0) return null; // Parallel or collinear
            
            const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / denom;
            const t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / denom;

            // Strict intersection (must not be at exactly the endpoints, which represents a valid physical junction)
            if (s > 0.01 && s < 0.99 && t > 0.01 && t < 0.99) {
                return [p0_x + (t * s1_x), p0_y + (t * s1_y)];
            }
            return null;
        };

        // Extract pure wires for intersection testing
        const pureWires = this.renderElements.filter(el => el.type === 'pure_wire').map((el, i) => {
            const sx = el.path[0][0] * this.gridSize;
            const sy = el.path[0][1] * this.gridSize;
            const ex = el.path[1][0] * this.gridSize;
            const ey = el.path[1][1] * this.gridSize;
            return { id: i, x1: sx, y1: sy, x2: ex, y2: ey, intersections: [] };
        });

        // Find all intersections
        for (let i = 0; i < pureWires.length; i++) {
            for (let j = i + 1; j < pureWires.length; j++) {
                const w1 = pureWires[i];
                const w2 = pureWires[j];
                const pt = getIntersection(w1.x1, w1.y1, w1.x2, w1.y2, w2.x1, w2.y1, w2.x2, w2.y2);
                if (pt) {
                    // Always jump the later wire (w2)
                    w2.intersections.push(pt);
                }
            }
        }
        
        let wireIdMap = {};
        pureWires.forEach(w => wireIdMap[w.id] = w);

        this.renderElements.forEach((el, index) => {
            if (el.type === 'pure_wire') {
                // Determine if we are drawing line directly or a path with bridge arcs
                // The later wire gets the bridge. But wait, we filtered and mapped them.
                // We need to match it up. Let's just lookup by index in our pureWires array.
                // Re-find it by coordinates is safer since index might be different.
                const sx = el.path[0][0] * this.gridSize;
                const sy = el.path[0][1] * this.gridSize;
                const ex = el.path[1][0] * this.gridSize;
                const ey = el.path[1][1] * this.gridSize;
                
                const wData = pureWires.find(w => Math.abs(w.x1-sx)<0.1 && Math.abs(w.y1-sy)<0.1 && Math.abs(w.x2-ex)<0.1 && Math.abs(w.y2-ey)<0.1);
                
                if (wData && wData.intersections.length > 0) {
                    // Sort intersections by distance from start so we draw them in order!
                    wData.intersections.sort((a, b) => {
                        const d1 = Math.pow(a[0] - sx, 2) + Math.pow(a[1] - sy, 2);
                        const d2 = Math.pow(b[0] - sx, 2) + Math.pow(b[1] - sy, 2);
                        return d1 - d2;
                    });
                    
                    const jumpR = 5; // Radius of the bridge in px
                    const dx = ex - sx;
                    const dy = ey - sy;
                    const len = Math.sqrt(dx*dx + dy*dy);
                    const nx = dx / len;
                    const ny = dy / len;
                    
                    let pathD = `M ${sx},${sy}`;
                    
                    wData.intersections.forEach(pt => {
                        const jumpStart = [pt[0] - nx*jumpR, pt[1] - ny*jumpR];
                        const jumpEnd = [pt[0] + nx*jumpR, pt[1] + ny*jumpR];
                        
                        // Line to start of jump
                        pathD += ` L ${jumpStart[0]},${jumpStart[1]}`;
                        // Arc over the crossing point
                        // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
                        pathD += ` A ${jumpR} ${jumpR} 0 0 1 ${jumpEnd[0]},${jumpEnd[1]}`;
                    });
                    
                    pathD += ` L ${ex},${ey}`;

                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", pathD);
                    path.setAttribute("fill", "none");
                    path.setAttribute("class", "matephis-circuit-wire");
                    path.setAttribute("stroke-width", strokeW);
                    this.wireGroup.appendChild(path);
                    
                    if (this.simulate) simPaths.push(pathD);
                } else {
                    this.wireGroup.appendChild(createWire(sx, sy, ex, ey));
                    if (this.simulate) simPaths.push(`M ${sx},${sy} L ${ex},${ey}`);
                }
            } else {
                // It's a component
                let elType = el.type;
                let sx = el.startX * this.gridSize;
                let sy = el.startY * this.gridSize;
                let ex = el.endX * this.gridSize;
                let ey = el.endY * this.gridSize;

                const dx = ex - sx;
                const dy = ey - sy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Use the angle calculated in the layout stage, or fallback to atan2
                const angle = el.angle !== undefined ? el.angle : (Math.atan2(dy, dx) * 180 / Math.PI);
                
                const cx = (sx + ex) / 2;
                const cy = (sy + ey) / 2;
                
                const padding = this.gridSize * 0.4;

                // Component Graphic Group
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("class", "matephis-circuit-comp");
                g.setAttribute("transform", `translate(${cx}, ${cy}) rotate(${angle})`);
                g.setAttribute("stroke-width", strokeW); // inherited by all children
                
                // For drawing logic, the component is centered at (0,0) and lies strictly along the X axis.
                // It spans from -dist/2 to +dist/2.

                // The base wire connects from the rotated endpoints to the component boundary gaps
                if (elType !== 'capacitor' && elType !== 'voltage_source' && elType !== 'switch' && elType !== 'resistor') {
                    g.appendChild(createWire(-dist/2, 0, -padding, 0));
                    g.appendChild(createWire(padding, 0, dist/2, 0));
                }

                if (elType === 'resistor') {
                    const h   = padding / 6;
                    const amp = padding * 0.35; // reduced height (less tall)
                    const x0  = -padding;
                    const d   = [
                        `M ${-dist/2},0`,
                        `L ${x0},0`,               // lead-in (horizontal)
                        `L ${x0 + h},${-amp}`,     // peak 1
                        `L ${x0 + 3*h},${amp}`,   // valley 1
                        `L ${x0 + 5*h},${-amp}`,   // peak 2
                        `L ${x0 + 7*h},${amp}`,   // valley 2
                        `L ${x0 + 9*h},${-amp}`,   // peak 3
                        `L ${x0 + 11*h},${amp}`,  // valley 3
                        `L ${x0 + 12*h},0`,        // lead-out
                        `L ${dist/2},0`        // wire end
                    ].join(' ');
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", d);
                    path.setAttribute("stroke-linejoin", "miter");
                    path.setAttribute("stroke-linecap", "butt");
                    g.appendChild(path);

                } else if (elType === 'resistor_rect') {
                    const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    box.setAttribute("x", -padding*0.8);
                    box.setAttribute("y", -padding*0.3);
                    box.setAttribute("width", padding*1.6);
                    box.setAttribute("height", padding*0.6);
                    box.setAttribute("class", "matephis-circuit-comp-fill");
                    box.setAttribute("stroke-width", strokeW);
                    
                    g.appendChild(createWire(-dist/2, 0, -padding*0.8, 0));
                    g.appendChild(createWire(padding*0.8, 0, dist/2, 0));
                    g.appendChild(box);
                } else if (elType === 'capacitor') {
                    const l1 = createWire(-padding*0.15, -padding*0.8, -padding*0.15, padding*0.8);
                    const l2 = createWire(padding*0.15, -padding*0.8, padding*0.15, padding*0.8);
                    g.appendChild(createWire(-dist/2, 0, -padding*0.15, 0));
                    g.appendChild(createWire(padding*0.15, 0, dist/2, 0));
                    g.appendChild(l1);
                    g.appendChild(l2);
                } else if (elType === 'voltage_source' || elType === 'dc_source' || elType === 'battery') {
                    let drawPlusRight = (el.direction !== 'flipped');
                    
                    const leftY = drawPlusRight ? padding*0.4 : padding*0.8; 
                    const rightY = drawPlusRight ? padding*0.8 : padding*0.4; 
                    
                    const plateGap = padding * 0.25;
                    
                    const l1 = createWire(-plateGap, -leftY, -plateGap, leftY);
                    const l2 = createWire(plateGap, -rightY, plateGap, rightY);
                    
                    if (drawPlusRight) l1.setAttribute("stroke-width", strokeWThick);
                    else l2.setAttribute("stroke-width", strokeWThick);
                    
                    g.appendChild(createWire(-dist/2, 0, -plateGap, 0));
                    g.appendChild(createWire(plateGap, 0, dist/2, 0));
                    
                    g.appendChild(l1);
                    g.appendChild(l2);
                } else if (elType === 'ac_source') {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", 0);
                    circle.setAttribute("cy", 0);
                    circle.setAttribute("r", padding*0.8);
                    circle.setAttribute("class", "matephis-circuit-comp-fill");
                    circle.setAttribute("stroke-width", strokeW);

                    // Sine wave inside
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    const sineW = padding*0.5;
                    const sineH = padding*0.3;
                    path.setAttribute("d", `M ${-sineW},0 Q ${-sineW/2},${-sineH*2} 0,0 T ${sineW},0`);
                    path.setAttribute("fill", "none");
                    path.setAttribute("stroke-width", strokeW);
                    
                    g.appendChild(createWire(-dist/2, 0, -padding*0.8, 0));
                    g.appendChild(createWire(padding*0.8, 0, dist/2, 0));
                    g.appendChild(circle);
                    g.appendChild(path);
                } else if (elType === 'amperometer' || elType === 'ammeter' || elType === 'voltmeter') {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", 0);
                    circle.setAttribute("cy", 0);
                    circle.setAttribute("r", padding*0.8);
                    circle.setAttribute("class", "matephis-circuit-comp-fill");
                    circle.setAttribute("stroke-width", strokeW);

                    const text = createLabel(0, 0, (elType === 'amperometer' || elType === 'ammeter') ? 'A' : 'V');
                    // Reset rotation for text so it reads upright
                    text.setAttribute("transform", `rotate(${-angle})`);
                    text.setAttribute("class", "matephis-circuit-label");

                    g.appendChild(createWire(-dist/2, 0, -padding*0.8, 0));
                    g.appendChild(createWire(padding*0.8, 0, dist/2, 0));
                    g.appendChild(circle);
                    g.appendChild(text);
                } else if (elType === 'switch') {
                    const isOpen = el.state !== 'closed';
                    const leadEnd = isOpen ? -padding*0.5 : 0;
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    path.setAttribute("x1", -padding*0.7);
                    path.setAttribute("y1", 0);
                    path.setAttribute("x2", padding*0.7);
                    path.setAttribute("y2", leadEnd);
                    path.setAttribute("class", "matephis-circuit-switch matephis-circuit-comp");
                    path.setAttribute("stroke-width", strokeW);
                    
                    const switchR = padding * 0.14;
                    const c1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    c1.setAttribute("cx", -padding*0.7); c1.setAttribute("cy", 0); c1.setAttribute("r", switchR);
                    c1.setAttribute("class", "matephis-circuit-comp-fill");
                    c1.setAttribute("stroke-width", strokeW);
                    const c2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    c2.setAttribute("cx", padding*0.7); c2.setAttribute("cy", 0); c2.setAttribute("r", switchR);
                    c2.setAttribute("class", "matephis-circuit-comp-fill");
                    c2.setAttribute("stroke-width", strokeW);
                    
                    g.appendChild(createWire(-dist/2, 0, -padding*0.7, 0));
                    g.appendChild(createWire(padding*0.7, 0, dist/2, 0));

                    g.appendChild(path);
                    g.appendChild(c1);
                    g.appendChild(c2);

                    g.style.cursor = "pointer";
                    g.onclick = (e) => {
                        e.stopPropagation();
                        el.state = isOpen ? 'closed' : 'open';
                        this.draw(); 
                    };
                } else if (elType === 'diode' || elType === 'led') {
                    const dw = padding * 0.6;
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                    path.setAttribute("points", `${-dw},${-dw} ${dw},0 ${-dw},${dw}`);
                    path.setAttribute("class", "matephis-circuit-comp-fill");
                    path.setAttribute("stroke-width", strokeW);
                    path.style.strokeLinejoin = "round";
                    const line = createWire(dw, -dw, dw, dw);
                    
                    g.appendChild(createWire(-padding, 0, -dw, 0));
                    g.appendChild(createWire(dw, 0, padding, 0));
                    
                    g.appendChild(path);
                    g.appendChild(line);

                    if (elType === 'led') {
                        // draw little light arrows
                        const arr1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        arr1.setAttribute("d", `M ${padding*0.3},${-padding*0.8} L ${padding*0.8},${-padding*1.3} M ${padding*0.8},${-padding*1.3} L ${padding*0.6},${-padding*1.3} M ${padding*0.8},${-padding*1.3} L ${padding*0.8},${-padding*1.1}`);
                        arr1.setAttribute("fill", "none");
                        arr1.setAttribute("stroke-width", strokeW*0.6);
                        
                        const arr2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        arr2.setAttribute("d", `M ${padding*0.7},${-padding*0.6} L ${padding*1.2},${-padding*1.1} M ${padding*1.2},${-padding*1.1} L ${padding*1.0},${-padding*1.1} M ${padding*1.2},${-padding*1.1} L ${padding*1.2},${-padding*0.9}`);
                        arr2.setAttribute("fill", "none");
                        arr2.setAttribute("stroke-width", strokeW*0.6);

                        g.appendChild(arr1);
                        g.appendChild(arr2);
                    }
                } else if (elType === 'inductor' || elType === 'inductance') {
                    // Sequence of 4 intersecting semicircles
                    const r = padding*0.3;
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    const startX = -padding*0.9;
                    const d = [
                        `M ${startX},0`,
                        `A ${r} ${r} 0 1 1 ${startX + r*1.5} 0`,
                        `A ${r} ${r} 0 1 1 ${startX + r*3.0} 0`,
                        `A ${r} ${r} 0 1 1 ${startX + r*4.5} 0`,
                        `A ${r} ${r} 0 1 1 ${startX + r*6.0} 0`
                    ].join(' ');
                    path.setAttribute("d", d);
                    path.setAttribute("fill", "none");
                    path.setAttribute("stroke-width", strokeW);
                    
                    g.appendChild(createWire(-dist/2, 0, startX, 0));
                    g.appendChild(createWire(startX + r*6.0, 0, dist/2, 0));
                    g.appendChild(path);
                } else if (elType === 'transistor_npn' || elType === 'transistor_pnp') {
                    // Draw classical transistor. Assume B corresponds to horizontal line coming in from left, C top, E bottom (for rotation 0).
                    const npn = elType === 'transistor_npn';
                    const r = padding * 1.5;
                    const tline = createWire(-padding*0.4, -padding*0.8, -padding*0.4, padding*0.8);
                    tline.setAttribute("stroke-width", strokeWThick);

                    const baseW = createWire(-dist/2, 0, -padding*0.4, 0); // Base wire
                    
                    // Collector wire (top angled line to top bound)
                    const cW1 = createWire(-padding*0.4, -padding*0.4, padding*0.4, -padding*1.0);
                    // Emitter wire (bottom angled line)
                    const eW1 = createWire(-padding*0.4, padding*0.4, padding*0.4, padding*1.0);

                    // Emitter arrow
                    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                    if (npn) {
                        // Pointing outwards
                        arrow.setAttribute("points", `${padding*0.4},${padding*1.0} ${padding*0.1},${padding*0.9} ${padding*0.3},${padding*0.7}`);
                    } else {
                        // PNP: Pointing inwards
                        arrow.setAttribute("points", `${-padding*0.4},${padding*0.4} ${-padding*0.1},${padding*0.5} ${-padding*0.3},${padding*0.7}`);
                    }
                    arrow.setAttribute("class", "matephis-circuit-comp-fill");

                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", padding*0.2);
                    circle.setAttribute("cy", 0);
                    circle.setAttribute("r", r);
                    circle.setAttribute("fill", "none");
                    circle.setAttribute("stroke-width", strokeW);

                    g.appendChild(tline);
                    g.appendChild(baseW);
                    g.appendChild(cW1);
                    g.appendChild(eW1);
                    g.appendChild(arrow);
                    g.appendChild(circle);
                } else if (elType === 'light_bulb') {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", 0);
                    circle.setAttribute("cy", 0);
                    circle.setAttribute("r", padding*0.8);
                    circle.setAttribute("class", "matephis-circuit-comp-fill");
                    circle.setAttribute("stroke-width", strokeW);
                    
                    // Simple cross inside
                    const cross1 = createWire(-padding*0.56, -padding*0.56, padding*0.56, padding*0.56);
                    const cross2 = createWire(-padding*0.56, padding*0.56, padding*0.56, -padding*0.56);
                    
                    g.appendChild(createWire(-padding, 0, -padding*0.8, 0));
                    g.appendChild(createWire(padding*0.8, 0, padding, 0));
                    
                    g.appendChild(circle);
                    g.appendChild(cross1);
                    g.appendChild(cross2);
                } else if (elType === 'wire') {
                    const line = createWire(-padding, 0, padding, 0);
                    g.appendChild(line);
                } else {
                    // Fallback box
                    const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    box.setAttribute("x", -padding);
                    box.setAttribute("y", -padding*0.6);
                    box.setAttribute("width", padding*2);
                    box.setAttribute("height", padding*1.2);
                    box.setAttribute("class", "matephis-circuit-comp-fill");
                    box.setAttribute("stroke-width", strokeW);
                    g.appendChild(box);
                }
                
                this.compGroup.appendChild(g);

                if (el.label) {
                    const isHoriz = Math.abs(dx) >= Math.abs(dy);
                    let labelDist = el.labelDistance !== undefined ? el.labelDistance : 1.3;
                    
                    // Nudge label further for big components
                    if (elType === 'transistor_npn' || elType === 'transistor_pnp') labelDist = 2.0;

                    let lx = cx, ly = cy;
                    let anchor = "middle", baseline = "auto";

                    const side = el.labelSide; // "top" | "bottom" | "left" | "right" | undefined
                    if (side === "top") {
                        ly = cy - padding * labelDist;
                        anchor = "middle"; baseline = "auto";
                    } else if (side === "bottom") {
                        ly = cy + padding * labelDist;
                        anchor = "middle"; baseline = "hanging";
                    } else if (side === "left") {
                        lx = cx - padding * labelDist;
                        anchor = "end"; baseline = "middle";
                    } else if (side === "right") {
                        lx = cx + padding * labelDist;
                        anchor = "start"; baseline = "middle";
                    } else {
                        // Auto: above wire when horizontal, to the right when vertical
                        lx = cx + (!isHoriz ? padding * labelDist : 0);
                        ly = cy + ( isHoriz ? -padding * labelDist : 0);
                        anchor    = !isHoriz ? "start"  : "middle";
                        baseline  = !isHoriz ? "middle" : "auto";
                    }

                    const labelNode = createLabel(lx, ly, el.label);
                    labelNode.setAttribute("text-anchor", anchor);
                    labelNode.setAttribute("dominant-baseline", baseline);
                    this.labelGroup.appendChild(labelNode);
                }
            }
        });

        // ── Simulation Charges ──────────────────────────────────────────────
        if (this.simulate && simPaths.length > 0) {
            const animGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.svg.appendChild(animGroup);

            simPaths.forEach((pathD, idx) => {
                const pts = pathD.match(/[M|L]\s*([-\d.]+),([-\d.]+)/g);
                if (!pts || pts.length < 2) return;
                
                let len = 0;
                let lastPt = null;
                pts.forEach(p => {
                    const match = p.match(/([-\d.]+),([-\d.]+)/);
                    if (match) {
                        const pt = [parseFloat(match[1]), parseFloat(match[2])];
                        if (lastPt) {
                            len += Math.sqrt(Math.pow(pt[0]-lastPt[0], 2) + Math.pow(pt[1]-lastPt[1], 2));
                        }
                        lastPt = pt;
                    }
                });
                
                // Density: 1 charge per 40 user units
                const numCharges = Math.max(1, Math.floor(len / 40));
                
                for (let i = 0; i < numCharges; i++) {
                    const charge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    charge.setAttribute("r", 2.5);
                    charge.setAttribute("class", "matephis-circuit-charge");
                    
                    const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
                    motion.setAttribute("path", pathD);
                    // Match the old hardcoded animation style logic, though here it goes globally based on length
                    motion.setAttribute("dur", "2s");
                    motion.setAttribute("repeatCount", "indefinite");
                    
                    // Stagger the start times
                    const beginOffset = (i / numCharges) * 2;
                    motion.setAttribute("begin", `-${beginOffset}s`);
                    
                    charge.appendChild(motion);
                    animGroup.appendChild(charge);
                }
            });
        }

        if (this.nodeMarkers && this.nodeMarkers.length > 0) {
            const gs = this.gridSize;
            const dotR   = 4;      // dot radius in SVG user units
            const dotGap = 12;     // gap between dot edge and label (user units)

            this.nodeMarkers.forEach(node => {
                let gx = node.pos ? node.pos[0] : 0;
                let gy = node.pos ? node.pos[1] : 0;

                // Pixel coords
                const px = gx * gs;
                const py = gy * gs;

                // Filled dot
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", px);
                circle.setAttribute("cy", py);
                circle.setAttribute("r", dotR);
                circle.setAttribute("fill", "#333");
                circle.setAttribute("stroke", "none");
                this.labelGroup.appendChild(circle); // draw on top

                // Optional label
                if (node.label) {
                    const labelEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    labelEl.setAttribute("class", "matephis-circuit-label");
                    labelEl.setAttribute("font-size", this.gridSize * 0.28);

                    const side = node.labelSide || 'top';

                    let lx = px, ly = py, anchor = 'middle', baseline = 'auto';
                    switch (side) {
                        case 'top':    ly = py - dotR - dotGap; anchor = 'middle'; baseline = 'auto';    break;
                        case 'bottom': ly = py + dotR + dotGap; anchor = 'middle'; baseline = 'hanging'; break;
                        case 'left':   lx = px - dotR - dotGap; anchor = 'end';    baseline = 'middle';  break;
                        case 'right':  lx = px + dotR + dotGap; anchor = 'start';  baseline = 'middle';  break;
                    }
                    labelEl.setAttribute("x", lx);
                    labelEl.setAttribute("y", ly);
                    labelEl.setAttribute("text-anchor", anchor);
                    labelEl.setAttribute("dominant-baseline", baseline);
                    labelEl.textContent = node.label;
                    this.labelGroup.appendChild(labelEl);
                }
            });
        }

    }

    _openLightbox() {
        const lb = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');
        const svgContainer = document.getElementById('lightbox-svg');
        const caption = document.getElementById('lightbox-caption');

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

            svgContainer.appendChild(clone);
        }
    }
}
window.MatephisCircuit = MatephisCircuit;
if (typeof module !== 'undefined') module.exports = MatephisCircuit;
