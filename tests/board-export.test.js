import { describe, it, expect, afterEach } from 'vitest';
import {
    SHARP_COS_THRESHOLD,
    MAX_PULL_MM,
    createStroke,
    traceStroke,
    traceStrokeCommands,
    strokeToSVGPath,
} from '../assets/js/matephis-board-src/ink/stroke.js';
import { BoardScene, nextWidgetId, nextConnectorId } from '../assets/js/matephis-board-src/model/scene.js';
import {
    exportPageToSVG,
    extractBoardDataFromSVG,
    parseColorWithAlpha,
    cloneStyledWidgetSVG,
} from '../assets/js/matephis-board-src/export/svg-export.js';
import {
    PDF_A4_W,
    PDF_A4_H,
    generatePDFBytes,
} from '../assets/js/matephis-board-src/export/pdf-export.js';
import { OptionsMenu } from '../assets/js/matephis-board-src/ui/options.js';

function latin1Decode(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        out += String.fromCharCode(bytes[i]);
    }
    return out;
}

describe('shared stroke path tracing (stroke.js)', () => {
    it('exports smoothing constants and matches traceStroke sink identically', () => {
        expect(SHARP_COS_THRESHOLD).toBe(0.75);
        expect(MAX_PULL_MM).toBe(2.2);

        const pts = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },     // gentle curve (angle < 41 deg)
            { x: 20, y: 3 },
            { x: 20, y: 20 },    // sharp ~73 deg turn -> exact vertex L
            { x: 30, y: 20 },
        ];

        const recorded = [];
        traceStroke({
            moveTo: (x, y) => recorded.push({ type: 'M', x, y }),
            lineTo: (x, y) => recorded.push({ type: 'L', x, y }),
            quadraticCurveTo: (cx, cy, x, y) => recorded.push({ type: 'Q', cx, cy, x, y }),
            arc: (cx, cy, r) => recorded.push({ type: 'CIRCLE', cx, cy, r }),
        }, pts, 0.5);

        const cmds = traceStrokeCommands(pts, 0.5);
        expect(cmds).toEqual(recorded);
        expect(cmds[0]).toEqual({ type: 'M', x: 0, y: 0 });
        expect(cmds.some((c) => c.type === 'Q')).toBe(true);
        // Sharp corner hits exact (20, 3) or (20, 20) via L
        expect(cmds.some((c) => c.type === 'L' && c.x === 20 && c.y === 20)).toBe(true);
    });

    it('handles 1-point dots, 2-point segments, and SVG path formatting', () => {
        const dotCmds = traceStrokeCommands([{ x: 12, y: 18 }], 1.0);
        expect(dotCmds).toEqual([{ type: 'CIRCLE', cx: 12, cy: 18, r: 0.5 }]);
        expect(strokeToSVGPath({ points: [{ x: 12, y: 18 }], width: 1.0 })).toContain('A 0.5 0.5');

        const lineCmds = traceStrokeCommands([{ x: 1, y: 2 }, { x: 9, y: 6 }], 0.45);
        expect(lineCmds).toEqual([
            { type: 'M', x: 1, y: 2 },
            { type: 'L', x: 9, y: 6 },
        ]);
        expect(strokeToSVGPath([{ x: 1, y: 2 }, { x: 9, y: 6 }])).toBe('M 1 2 L 9 6');
    });
});

describe('SVG vector export & metadata round-trip (svg-export.js)', () => {
    it('exports an empty page with default 297x210 viewBox and theme background', () => {
        const scene = new BoardScene(1280, 720);
        const svgLight = exportPageToSVG(scene, { theme: 'light' });
        expect(svgLight).toContain('<svg');
        expect(svgLight).toContain('width="297mm"');
        expect(svgLight).toContain('height="210mm"');
        expect(svgLight).toContain('viewBox="0 0 297 210"');
        expect(svgLight).toContain('fill="#ffffff"');

        const svgDark = exportPageToSVG(scene, { theme: 'dark' });
        expect(svgDark).toContain('fill="#121212"');
    });

    it('renders background patterns, highlighters with opacity, pen styles, connectors, and widgets', () => {
        const scene = new BoardScene(1280, 720);
        scene.pageBackground = 'grid';

        scene.strokes.push(
            createStroke({
                id: 'sh1',
                tool: 'highlighter',
                color: 'h0',
                width: 7.0,
                points: [{ x: 20, y: 30 }, { x: 80, y: 30 }],
            }),
            createStroke({
                id: 'sp1',
                tool: 'pen',
                color: 1,
                width: 0.7,
                style: 'dashed',
                points: [{ x: 20, y: 30 }, { x: 50, y: 40 }, { x: 80, y: 45 }],
            }),
            createStroke({
                id: 'sp_dot',
                tool: 'pen',
                color: 2,
                width: 0.8,
                points: [{ x: 15, y: 15 }],
            })
        );

        scene.connectors.push({
            id: nextConnectorId(),
            pairId: 'pair_1',
            series: 'alpha',
            label: 'A',
            x: 110,
            y: 55,
            color: 1,
        });

        // Widget spanning into second A4 tile (x=250, w=100 -> maxX=350 > 297)
        const wId = nextWidgetId();
        scene.widgets.push({
            id: wId,
            kind: 'plot',
            x: 250,
            y: 25,
            w: 100,
            h: 80,
            data: { fn: 'sin(x)' },
        });

        const parsedHl = parseColorWithAlpha('rgba(253, 224, 71, 0.48)');
        expect(parsedHl.hex).toBe('#fde047');
        expect(parsedHl.alpha).toBeCloseTo(0.48, 2);

        const svg = exportPageToSVG(scene, { theme: 'light' });
        expect(svg).toContain('viewBox="0 0 594 210"');
        expect(svg).toContain('id="board-bg-grid"');
        expect(svg).toContain('id="board-highlighters"');
        expect(svg).toContain('stroke="#fde047"');
        expect(svg).toContain('stroke-opacity="0.48"');
        expect(svg).toContain('stroke="#B01A00"'.toLowerCase());
        expect(svg).toContain('stroke-linecap="round"');
        expect(svg).toContain('stroke-linejoin="round"');
        expect(svg).toContain('stroke-dasharray="');
        expect(svg).toContain('<circle cx="15" cy="15" r="0.4"');
        expect(svg).toContain('id="board-connectors"');
        expect(svg).toContain('>A</text>');
        expect(svg).toContain(`data-widget-id="${wId}"`);

        // Also test live widget SVG embedding via mock widgetElements
        const mockSvgEl = {
            outerHTML: '<svg viewBox="0 0 400 320"><line x1="0" y1="160" x2="400" y2="160" /></svg>',
            closest: () => null,
        };
        const mockWidgetEl = {
            querySelector: () => null,
            querySelectorAll: () => [mockSvgEl],
        };
        const svgEmbedded = exportPageToSVG(scene, {
            theme: 'light',
            widgetElements: new Map([[wId, mockWidgetEl]]),
        });
        expect(svgEmbedded).toContain('<line x1="0" y1="160" x2="400" y2="160" />');
    });

    it('renders dots and ruled backgrounds', () => {
        const scene = new BoardScene(1280, 720);
        scene.pageBackground = 'dots';
        expect(exportPageToSVG(scene)).toContain('id="board-bg-dots"');

        scene.pageBackground = 'ruled';
        expect(exportPageToSVG(scene)).toContain('id="board-bg-ruled"');
    });

    it('round-trips scene JSON via <metadata id="matephis-board-data"> including XML special chars', () => {
        const scene = new BoardScene(1280, 720);
        scene.title = 'Equazioni <1 & 2> "test" \'ok\' </metadata> ]]>';
        scene.pageBackground = 'ruled';
        scene.strokes.push(createStroke({
            id: 's_rt',
            color: 3,
            width: 0.45,
            style: 'dotted',
            points: [{ x: 10, y: 20 }, { x: 40, y: 35 }, { x: 75, y: 50 }],
        }));
        scene.widgets.push({
            id: 'w_rt',
            kind: 'exercise',
            x: 30,
            y: 40,
            w: 120,
            h: 85,
            lockedControls: true,
            data: { html: '<p>f(x) &amp; g(x) < 0</p>' },
        });
        scene.connectors.push({
            id: 'c_rt',
            pairId: 'p_rt',
            series: 'num',
            label: '1',
            x: 90,
            y: 90,
            color: 2,
        });

        const svg = exportPageToSVG(scene);
        expect(svg).toContain('<metadata id="matephis-board-data">');

        const extracted = extractBoardDataFromSVG(svg);
        expect(extracted).not.toBeNull();
        expect(extracted.v).toBe(2);
        expect(extracted.title).toBe(scene.title);

        const restored = new BoardScene(1280, 720);
        expect(restored.loadJSON(extracted)).toBe(true);
        expect(restored.title).toBe(scene.title);
        expect(restored.pageBackground).toBe('ruled');
        expect(restored.strokes).toHaveLength(1);
        expect(restored.strokes[0].style).toBe('dotted');
        expect(restored.widgets[0].lockedControls).toBe(true);
        expect(restored.widgets[0].data.html).toBe('<p>f(x) &amp; g(x) < 0</p>');
        expect(restored.connectors[0].label).toBe('1');
    });

    it('returns null from extractBoardDataFromSVG on missing or malformed metadata', () => {
        expect(extractBoardDataFromSVG('')).toBeNull();
        expect(extractBoardDataFromSVG('<svg></svg>')).toBeNull();
        expect(extractBoardDataFromSVG('<svg><metadata id="matephis-board-data">{bad json</metadata></svg>')).toBeNull();
    });

    it('inlines computed presentation styles onto cloned widget <svg> nodes when window.getComputedStyle is present', () => {
        const prevWindow = globalThis.window;
        try {
            function makeMockSvgNode(tagName, attrs = {}, children = []) {
                const styleMap = {};
                const node = {
                    nodeType: 1,
                    tagName: tagName.toUpperCase(),
                    _attrs: { ...attrs },
                    children,
                    style: {
                        setProperty(k, v) { styleMap[k] = String(v); },
                        getPropertyValue(k) { return styleMap[k] || ''; },
                    },
                    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; },
                    setAttribute(k, v) { this._attrs[k] = String(v); },
                    closest: (sel) => (sel.includes('.matephis-plot-container') ? containerNode : null),
                    cloneNode(deep) {
                        const clonedChildren = deep ? this.children.map((c) => c.cloneNode(true)) : [];
                        return makeMockSvgNode(this.tagName, this._attrs, clonedChildren);
                    },
                    get outerHTML() {
                        const styleEntries = Object.entries(styleMap).map(([k, v]) => `${k}: ${v}`).join('; ');
                        const allAttrs = { ...this._attrs };
                        if (styleEntries) allAttrs.style = styleEntries;
                        const attrStr = Object.entries(allAttrs).map(([k, v]) => ` ${k}="${v}"`).join('');
                        const inner = this.children.map((c) => c.outerHTML).join('');
                        return `<${this.tagName.toLowerCase()}${attrStr}>${inner}</${this.tagName.toLowerCase()}>`;
                    },
                };
                return node;
            }

            const containerNode = { tagName: 'DIV', _class: 'matephis-plot-container' };
            const wireLine = makeMockSvgNode('line', { class: 'matephis-circuit-wire', x1: '0', y1: '0', x2: '100', y2: '0' });
            const labelText = makeMockSvgNode('text', { class: 'matephis-circuit-label', x: '20', y: '20' });
            const hiddenGroup = makeMockSvgNode('g', { class: 'hidden-layer' });
            const svgNode = makeMockSvgNode('svg', { viewBox: '0 0 200 120' }, [wireLine, labelText, hiddenGroup]);

            globalThis.window = {
                getComputedStyle(el) {
                    if (el === containerNode) return { backgroundColor: 'rgb(18, 18, 18)' };
                    if (el === wireLine) {
                        return {
                            fill: 'none',
                            fillOpacity: '1',
                            stroke: 'rgb(226, 232, 240)',
                            strokeWidth: '2px',
                            strokeOpacity: '1',
                            strokeDasharray: 'none',
                            strokeLinecap: 'square',
                            strokeLinejoin: 'miter',
                            opacity: '1',
                            visibility: 'visible',
                            display: 'inline',
                        };
                    }
                    if (el === labelText) {
                        return {
                            fill: 'rgb(201, 203, 207)',
                            fillOpacity: '1',
                            stroke: 'none',
                            strokeWidth: '1px',
                            strokeOpacity: '1',
                            strokeDasharray: 'none',
                            opacity: '1',
                            visibility: 'visible',
                            display: 'inline',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            fontWeight: '400',
                        };
                    }
                    if (el === hiddenGroup) {
                        return { display: 'none', visibility: 'hidden', opacity: '1' };
                    }
                    return {
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fill: 'rgb(0, 0, 0)',
                        stroke: 'none',
                        opacity: '1',
                        visibility: 'visible',
                        display: 'block',
                        fontFamily: 'sans-serif',
                        fontSize: '12px',
                        fontWeight: '400',
                    };
                },
            };

            const cloned = cloneStyledWidgetSVG(svgNode);
            expect(cloned).not.toBe(svgNode);
            expect(cloned.style.getPropertyValue('background-color')).toBe('rgb(18, 18, 18)');
            expect(cloned.children[0].style.getPropertyValue('fill')).toBe('none');
            expect(cloned.children[0].style.getPropertyValue('stroke')).toBe('rgb(226, 232, 240)');
            expect(cloned.children[0].style.getPropertyValue('stroke-width')).toBe('2px');
            expect(cloned.children[1].style.getPropertyValue('fill')).toBe('rgb(201, 203, 207)');
            expect(cloned.children[1].style.getPropertyValue('stroke')).toBe('none');
            expect(cloned.children[1].style.getPropertyValue('font-size')).toBe('14px');
            expect(cloned.children[2].style.getPropertyValue('display')).toBe('none');
            expect(cloned.children[2].style.getPropertyValue('visibility')).toBe('hidden');
            // Original node should remain untouched
            expect(wireLine.style.getPropertyValue('stroke')).toBe('');

            const scene = new BoardScene(1280, 720);
            scene.widgets.push({ id: 'w_circ', kind: 'circuit', x: 10, y: 10, w: 120, h: 80, data: {} });
            const svgOut = exportPageToSVG(scene, {
                theme: 'dark',
                widgetElements: new Map([['w_circ', { querySelector: () => null, querySelectorAll: () => [svgNode] }]]),
            });
            expect(svgOut).toContain('stroke: rgb(226, 232, 240)');
            expect(svgOut).toContain('fill: none');
            expect(svgOut).toContain('font-size: 14px');
        } finally {
            globalThis.window = prevWindow;
        }
    });

    it('wraps foreignObject body unless the root element itself declares xmlns=', () => {
        const scene = new BoardScene(1280, 720);
        scene.widgets.push(
            { id: 'w_nested_ns', kind: 'exercise', x: 10, y: 10, w: 100, h: 60, data: {} },
            { id: 'w_root_ns', kind: 'exercise', x: 120, y: 10, w: 100, h: 60, data: {} }
        );
        const svgOut = exportPageToSVG(scene, {
            widgetElements: new Map([
                ['w_nested_ns', { outerHTML: '<div><svg xmlns="http://www.w3.org/2000/svg"></svg></div>', querySelector: () => null }],
                ['w_root_ns', { outerHTML: '<div xmlns="http://www.w3.org/1999/xhtml"><p>OK</p></div>', querySelector: () => null }],
            ]),
        });
        expect(svgOut).toContain('<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;overflow:hidden;font-family:\'Noto Sans\',sans-serif;color:#18181b;background:#ffffff;"><div><svg xmlns="http://www.w3.org/2000/svg"></svg></div></div>');
        expect(svgOut).toContain('<foreignObject x="120" y="10" width="100" height="60"><div xmlns="http://www.w3.org/1999/xhtml"><p>OK</p></div></foreignObject>');
    });

    it('renders preset name instead of [object Object] when widget.data.preset is an object in SVG and PDF', () => {
        const scene = new BoardScene(1280, 720);
        scene.widgets.push({
            id: 'w_incline',
            kind: 'physics',
            x: 20,
            y: 20,
            w: 140,
            h: 90,
            data: { preset: { name: 'incline', with: { angle: 30, mu: 0.25 } } },
        });

        const svgOut = exportPageToSVG(scene, { theme: 'light' });
        expect(svgOut).toContain('physics: incline');
        expect(svgOut).not.toContain('[object Object]');

        const pdfText = latin1Decode(generatePDFBytes(scene, { theme: 'light' }));
        expect(pdfText).toContain('(physics: incline) Tj');
        expect(pdfText).not.toContain('[object Object]');
    });
});

describe('Pure-JS vector PDF export (pdf-export.js)', () => {
    it('emits valid %PDF-1.4 header, %%EOF trailer, landscape A4 MediaBox, and byte-accurate xref table', () => {
        const scene = new BoardScene(1280, 720);
        scene.pageBackground = 'grid';
        scene.strokes.push(
            createStroke({
                id: 'h1',
                tool: 'highlighter',
                color: 'h1',
                width: 7.0,
                points: [{ x: 15, y: 20 }, { x: 60, y: 20 }],
            }),
            createStroke({
                id: 'p1',
                tool: 'pen',
                color: 0,
                width: 0.45,
                style: 'dashed',
                points: [
                    { x: 10, y: 10 },
                    { x: 25, y: 12 },
                    { x: 40, y: 18 },
                    { x: 55, y: 40 },
                ],
            }),
            createStroke({
                id: 'p_dot',
                tool: 'pen',
                color: 1,
                width: 0.9,
                points: [{ x: 80, y: 80 }],
            })
        );
        scene.connectors.push({
            id: 'c1',
            pairId: 'pa',
            series: 'alpha',
            label: 'A',
            x: 100,
            y: 50,
            color: 1,
        });

        const bytes = generatePDFBytes(scene, { theme: 'light' });
        expect(bytes).toBeInstanceOf(Uint8Array);

        const text = latin1Decode(bytes);
        expect(text.startsWith('%PDF-1.4')).toBe(true);
        expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
        expect(text).toContain(`/MediaBox [0 0 ${PDF_A4_W} ${PDF_A4_H}]`);
        expect(text).toContain('/Count 1');

        // Verify vector operators & ExtGState alpha
        expect(text).toContain('1 J 1 j');
        expect(text).toContain(' m\n');
        expect(text).toContain(' l\n');
        expect(text).toContain(' c\n');
        expect(text).toContain('\nS\n');
        expect(text).toContain('/ExtGState');
        expect(text).toContain('/CA 0.44 /ca 0.44');
        expect(text).toContain('0 d');
        expect(text).toContain('(A) Tj');

        // Verify byte-exact xref offsets
        const startxrefMatch = text.match(/startxref\n(\d+)\n%%EOF/);
        expect(startxrefMatch).not.toBeNull();
        const xrefOffset = Number(startxrefMatch[1]);
        const xrefSection = text.slice(xrefOffset);
        expect(xrefSection.startsWith('xref\n0 ')).toBe(true);
        expect(xrefSection).toContain('0000000000 65535 f \n');

        const entryLines = xrefSection.split('\n').filter((line) => /^\d{10} \d{5} [fn] /.test(line));
        const objCountMatch = xrefSection.match(/^xref\n0 (\d+)/);
        expect(entryLines.length).toBe(Number(objCountMatch[1]));

        for (let id = 1; id < entryLines.length; id++) {
            const parts = entryLines[id].split(' ');
            expect(parts[2]).toBe('n');
            const off = Number(parts[0]);
            expect(text.slice(off, off + `${id} 0 obj`.length)).toBe(`${id} 0 obj`);
        }
    });

    it('produces one landscape A4 PDF page per occupied A4 tile across multiple board pages', () => {
        const scene = new BoardScene(1280, 720);
        // Page 0: occupies (0,0) and (1,0)
        scene.strokes.push(createStroke({ points: [{ x: 20, y: 20 }, { x: 350, y: 30 }] }));
        // Page 1: occupies (0,0) and (0,1)
        scene.addPage(true);
        scene.pageBackground = 'dots';
        scene.widgets.push({ id: 'w2', kind: 'physics', x: 10, y: 220, w: 120, h: 80, data: { preset: 'Piano inclinato' } });
        // Page 2: empty page -> still emits 1 tile (0,0)
        scene.addPage(true);
        scene.pageBackground = 'ruled';

        const bytes = generatePDFBytes(scene);
        const text = latin1Decode(bytes);
        // Total PDF pages: 2 (page 0) + 2 (page 1) + 1 (page 2) = 5
        expect(text).toContain('/Count 5');
        const pageMatches = text.match(/\/Type \/Page\b/g) || [];
        expect(pageMatches.length).toBe(5);
    });

    it('embeds high-DPI widget image /XObject with /SMask from synthetic widgetSnapshots', () => {
        const scene = new BoardScene(1280, 720);
        scene.widgets.push({
            id: 'w_img',
            kind: 'plot',
            x: 30,
            y: 40,
            w: 100,
            h: 80,
            data: { fn: 'x^2' },
        });

        const widthPx = 4;
        const heightPx = 3;
        const rgbBytes = new Uint8Array(widthPx * heightPx * 3).fill(200);
        const alphaBytes = new Uint8Array(widthPx * heightPx).fill(255);

        const bytes = generatePDFBytes(scene, {
            widgetSnapshots: [{
                pageIndex: 0,
                widgetId: 'w_img',
                widthPx,
                heightPx,
                rgbBytes,
                alphaBytes,
            }],
        });

        const text = latin1Decode(bytes);
        expect(text).toContain('/Type /XObject /Subtype /Image');
        expect(text).toContain('/Width 4 /Height 3 /ColorSpace /DeviceRGB /BitsPerComponent 8 /SMask');
        expect(text).toContain('/ColorSpace /DeviceGray');
        expect(text).toContain('/Im1 Do');

        // Verify xref still points cleanly past binary stream bytes
        const startxrefMatch = text.match(/startxref\n(\d+)\n%%EOF/);
        const xrefOffset = Number(startxrefMatch[1]);
        const xrefSection = text.slice(xrefOffset);
        const entryLines = xrefSection.split('\n').filter((line) => /^\d{10} \d{5} [fn] /.test(line));
        for (let id = 1; id < entryLines.length; id++) {
            const off = Number(entryLines[id].split(' ')[0]);
            expect(text.slice(off, off + `${id} 0 obj`.length)).toBe(`${id} 0 obj`);
        }
    });
});

describe('OptionsMenu export & SVG import wiring (options.js)', () => {
    const prevDoc = globalThis.document;
    const prevFileReader = globalThis.FileReader;

    afterEach(() => {
        globalThis.document = prevDoc;
        globalThis.FileReader = prevFileReader;
    });

    it('wires Esporta SVG / Esporta PDF without .is-stub and restores scene from .svg import', () => {
        // Minimal Node DOM mock capable of parsing OptionsMenu template attributes
        function makeEl(tag = 'div') {
            const listeners = {};
            const attrs = {};
            const el = {
                tagName: tag.toUpperCase(),
                className: '',
                hidden: false,
                checked: false,
                disabled: false,
                value: '',
                textContent: '',
                files: [],
                dataset: {},
                children: [],
                _innerHTML: '',
                addEventListener(ev, fn) { (listeners[ev] ||= []).push(fn); },
                dispatch(ev) { (listeners[ev] || []).forEach((fn) => fn({ stopPropagation() {} })); },
                click() { this.dispatch('click'); },
                appendChild(c) { this.children.push(c); return c; },
                setAttribute(k, v) { attrs[k] = String(v); },
                getAttribute(k) { return attrs[k] ?? null; },
                classList: {
                    toggle() {},
                    contains() { return false; },
                },
                set innerHTML(html) {
                    this._innerHTML = html;
                    this._nodes = [];
                    const tagRe = /<([a-zA-Z0-9-]+)\b([^>]*?)(\/?)>/g;
                    let m;
                    while ((m = tagRe.exec(html)) !== null) {
                        const t = m[1].toLowerCase();
                        const attrStr = m[2] || '';
                        const node = makeEl(t);
                        const attrRe = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
                        let am;
                        while ((am = attrRe.exec(attrStr)) !== null) {
                            node.setAttribute(am[1], am[2]);
                            if (am[1] === 'class') node.className = am[2];
                            if (am[1].startsWith('data-')) {
                                const camel = am[1].slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
                                node.dataset[camel] = am[2];
                            }
                        }
                        this._nodes.push(node);
                    }
                },
                get innerHTML() { return this._innerHTML; },
                querySelector(sel) {
                    return this.querySelectorAll(sel)[0] || makeEl('div');
                },
                querySelectorAll(sel) {
                    const nodes = this._nodes || [];
                    if (sel === '[data-opt="darkTheme"]') return nodes.filter((n) => n.getAttribute('data-opt') === 'darkTheme');
                    const dataAct = sel.match(/^\[data-action="([^"]+)"\]$/);
                    if (dataAct) return nodes.filter((n) => n.getAttribute('data-action') === dataAct[1]);
                    const dataOpt = sel.match(/^\[data-opt="([^"]+)"\]$/);
                    if (dataOpt) return nodes.filter((n) => n.getAttribute('data-opt') === dataOpt[1]);
                    if (sel === '.board-file-input') return nodes.filter((n) => n.className.includes('board-file-input'));
                    return [];
                },
            };
            return el;
        }

        globalThis.document = { createElement: (tag) => makeEl(tag) };

        const scene = new BoardScene(1280, 720);
        scene.title = 'SVG Import Test';
        scene.strokes.push(createStroke({ id: 's_opt', points: [{ x: 5, y: 5 }, { x: 25, y: 15 }] }));
        const exportedSvg = exportPageToSVG(scene);

        let svgExported = false;
        let pdfExported = false;
        let importedPayload = null;

        globalThis.FileReader = class {
            readAsText(file) {
                this.result = file._content;
                if (this.onload) this.onload();
            }
        };

        const host = makeEl('div');
        const menu = new OptionsMenu(host, {
            scene,
            getTheme: () => 'light',
            onToggleTheme: () => {},
            onSettingChange: () => {},
            onExportJSON: () => {},
            onExportSVG: () => { svgExported = true; },
            onExportPDF: () => { pdfExported = true; },
            onImportJSON: (data) => { importedPayload = data; },
            onClearBoard: () => {},
            onDeletePage: () => {},
        });

        const exportSvgBtn = menu.el.querySelector('[data-action="export-svg"]');
        const exportPdfBtn = menu.el.querySelector('[data-action="export-pdf"]');
        expect(exportSvgBtn.className).not.toContain('is-stub');
        expect(exportPdfBtn.className).not.toContain('is-stub');
        expect(menu.el.innerHTML).not.toContain('Esporta SVG con metadati modificabili (in arrivo)');
        expect(menu.el.innerHTML).not.toContain('Esporta PDF vettoriale (in arrivo)');
        expect(menu.fileInput.getAttribute('accept')).toBe('.json,.mboard.json,.svg');

        exportSvgBtn.click();
        exportPdfBtn.click();
        expect(svgExported).toBe(true);
        expect(pdfExported).toBe(true);

        menu.fileInput.files = [{ name: 'board.svg', type: 'image/svg+xml', _content: exportedSvg }];
        menu.fileInput.dispatch('change');

        expect(importedPayload).not.toBeNull();
        expect(importedPayload.title).toBe('SVG Import Test');
        expect(importedPayload.pages[0].strokes).toHaveLength(1);
    });
});
