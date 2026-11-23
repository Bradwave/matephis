/**
 * Pure-JS zero-dependency vector PDF writer for Matephis Board.
 * Generates multi-page / multi-tile landscape A4 PDFs (841.89 x 595.28 pt; 1 mm = 72/25.4 pt)
 * with true vector paths, highlighter ExtGState alpha, connector badges, and optional
 * high-DPI widget image XObjects.
 */

import { A4_W, A4_H, bboxIntersects, computeA4Footprint } from '../ink/geometry.js';
import { resolveInkColor } from '../ink/palette.js';
import { traceStrokeCommands } from '../ink/stroke.js';
import { parseColorWithAlpha } from './svg-export.js';

export const MM_TO_PT = 72 / 25.4;
export const PDF_A4_W = 841.89;
export const PDF_A4_H = 595.28;

const CIRCLE_KAPPA = 0.5522847498;

function fmt(n) {
    const rounded = Math.round(n * 1000) / 1000;
    return Object.is(rounded, -0) ? '0' : String(rounded);
}

function rgbOp(r, g, b) {
    return `${fmt(r / 255)} ${fmt(g / 255)} ${fmt(b / 255)}`;
}

function escapePdfString(str) {
    return String(str || '')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/[^\x00-\xff]/g, '?')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[\r\n]/g, ' ');
}

function strToBytes(str) {
    const len = str.length;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        out[i] = str.charCodeAt(i) & 0xff;
    }
    return out;
}

function appendCirclePath(ops, cx, cy, r) {
    const k = r * CIRCLE_KAPPA;
    ops.push(`${fmt(cx + r)} ${fmt(cy)} m`);
    ops.push(`${fmt(cx + r)} ${fmt(cy + k)} ${fmt(cx + k)} ${fmt(cy + r)} ${fmt(cx)} ${fmt(cy + r)} c`);
    ops.push(`${fmt(cx - k)} ${fmt(cy + r)} ${fmt(cx - r)} ${fmt(cy + k)} ${fmt(cx - r)} ${fmt(cy)} c`);
    ops.push(`${fmt(cx - r)} ${fmt(cy - k)} ${fmt(cx - k)} ${fmt(cy - r)} ${fmt(cx)} ${fmt(cy - r)} c`);
    ops.push(`${fmt(cx + k)} ${fmt(cy - r)} ${fmt(cx + r)} ${fmt(cy - k)} ${fmt(cx + r)} ${fmt(cy)} c`);
}

function normalizeSnapshotMap(widgetSnapshots) {
    const map = new Map();
    if (!widgetSnapshots) return map;
    if (widgetSnapshots instanceof Map) {
        for (const [k, v] of widgetSnapshots.entries()) map.set(String(k), v);
        return map;
    }
    if (Array.isArray(widgetSnapshots)) {
        for (const snap of widgetSnapshots) {
            if (!snap || !snap.widgetId) continue;
            const key = snap.pageIndex !== undefined ? `${snap.pageIndex}:${snap.widgetId}` : String(snap.widgetId);
            map.set(key, snap);
        }
    }
    return map;
}

function getOrderedTiles(page) {
    const fp = computeA4Footprint(page.strokes || [], page.widgets || [], page.connectors || []);
    const tiles = [];
    for (let row = fp.minRow; row <= fp.maxRow; row++) {
        for (let col = fp.minCol; col <= fp.maxCol; col++) {
            if (fp.occupied.has(`${col},${row}`)) {
                tiles.push({ col, row });
            }
        }
    }
    if (tiles.length === 0) tiles.push({ col: 0, row: 0 });
    return tiles;
}

/**
 * Generate a complete binary PDF (`Uint8Array`) for all pages and occupied A4 tiles of `scene`.
 * Pure JS, zero external dependencies, deterministic in Node without DOM.
 */
export function generatePDFBytes(scene, options = {}) {
    const theme = options.theme === 'dark' ? 'dark' : 'light';
    const isDark = theme === 'dark';
    const showCropMarks = options.showCropMarks !== undefined
        ? Boolean(options.showCropMarks)
        : Boolean(scene.settings && scene.settings.showCropMarks);
    const snapMap = normalizeSnapshotMap(options.widgetSnapshots);

    // Object registry: index 0 unused (PDF objects are 1-based)
    const objects = [null];
    const allocObj = (chunks) => {
        const id = objects.length;
        objects.push(chunks);
        return id;
    };

    const catalogId = allocObj([]); // 1
    const pagesId = allocObj([]);   // 2
    const fontId = allocObj([       // 3
        strToBytes('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'),
    ]);

    // ExtGState registry keyed by quantized alpha (0..1000)
    const extGStates = new Map();
    const getGsName = (alpha) => {
        const q = Math.max(0, Math.min(1000, Math.round(alpha * 1000)));
        if (!extGStates.has(q)) {
            const aStr = fmt(q / 1000);
            const id = allocObj([strToBytes(`<< /Type /ExtGState /CA ${aStr} /ca ${aStr} >>`)]);
            extGStates.set(q, { name: `GS${q}`, id });
        }
        return extGStates.get(q).name;
    };
    const gsOpaque = getGsName(1);

    // Pre-allocate image XObjects from valid widgetSnapshots
    const imageObjects = new Map();
    let imgCounter = 1;
    for (const [key, snap] of snapMap.entries()) {
        if (!snap || !snap.rgbBytes || !(snap.widthPx > 0) || !(snap.heightPx > 0)) continue;
        const wPx = Math.round(snap.widthPx);
        const hPx = Math.round(snap.heightPx);
        const rgb = snap.rgbBytes instanceof Uint8Array ? snap.rgbBytes : new Uint8Array(snap.rgbBytes);
        if (rgb.length < wPx * hPx * 3) continue;

        let smaskRef = '';
        if (snap.alphaBytes) {
            const alpha = snap.alphaBytes instanceof Uint8Array ? snap.alphaBytes : new Uint8Array(snap.alphaBytes);
            if (alpha.length >= wPx * hPx) {
                const alphaSlice = alpha.subarray(0, wPx * hPx);
                const smaskId = allocObj([
                    strToBytes(`<< /Type /XObject /Subtype /Image /Width ${wPx} /Height ${hPx} /ColorSpace /DeviceGray /BitsPerComponent 8 /Length ${alphaSlice.length} >>\nstream\n`),
                    alphaSlice,
                    strToBytes('\nendstream'),
                ]);
                smaskRef = ` /SMask ${smaskId} 0 R`;
            }
        }

        const rgbSlice = rgb.subarray(0, wPx * hPx * 3);
        const imId = allocObj([
            strToBytes(`<< /Type /XObject /Subtype /Image /Width ${wPx} /Height ${hPx} /ColorSpace /DeviceRGB /BitsPerComponent 8${smaskRef} /Length ${rgbSlice.length} >>\nstream\n`),
            rgbSlice,
            strToBytes('\nendstream'),
        ]);
        imageObjects.set(key, { name: `Im${imgCounter++}`, id: imId });
    }

    const pageObjIds = [];
    const pages = (scene && Array.isArray(scene.pages) && scene.pages.length > 0)
        ? scene.pages
        : [{ background: 'blank', strokes: [], widgets: [], connectors: [] }];

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        const tiles = getOrderedTiles(page);

        for (let tIdx = 0; tIdx < tiles.length; tIdx++) {
            const { col, row } = tiles[tIdx];
            const tileMinX = col * A4_W;
            const tileMinY = row * A4_H;
            const tileBox = {
                minX: tileMinX - 10,
                minY: tileMinY - 10,
                maxX: tileMinX + A4_W + 10,
                maxY: tileMinY + A4_H + 10,
            };

            const toPdfX = (wx) => (wx - tileMinX) * MM_TO_PT;
            const toPdfY = (wy) => PDF_A4_H - (wy - tileMinY) * MM_TO_PT;

            const ops = [];
            const pageImages = new Map();
            const pageGsNames = new Set([gsOpaque]);

            const useGs = (alpha) => {
                const name = getGsName(alpha);
                pageGsNames.add(name);
                return name;
            };

            // 1. Background fill
            ops.push(`/${gsOpaque} gs`);
            ops.push(isDark ? '0.071 0.071 0.071 rg' : '1 1 1 rg');
            ops.push(`0 0 ${PDF_A4_W} ${PDF_A4_H} re f`);

            // 2. Page background pattern
            const bg = page.background || 'blank';
            if (bg === 'grid') {
                const gsBg = useGs(isDark ? 0.08 : 0.075);
                ops.push(`/${gsBg} gs ${isDark ? '1 1 1' : '0 0 0'} RG 0.5 w`);
                for (let x = 0; x <= A4_W + 0.001; x += 5) {
                    const px = fmt(x * MM_TO_PT);
                    ops.push(`${px} 0 m ${px} ${PDF_A4_H} l S`);
                }
                for (let y = 0; y <= A4_H + 0.001; y += 5) {
                    const py = fmt(PDF_A4_H - y * MM_TO_PT);
                    ops.push(`0 ${py} m ${PDF_A4_W} ${py} l S`);
                }
            } else if (bg === 'dots') {
                const gsBg = useGs(isDark ? 0.22 : 0.20);
                ops.push(`/${gsBg} gs ${isDark ? '1 1 1' : '0 0 0'} rg`);
                const rPt = 0.25 * MM_TO_PT;
                for (let y = 5; y < A4_H; y += 5) {
                    const py = PDF_A4_H - y * MM_TO_PT;
                    for (let x = 5; x < A4_W; x += 5) {
                        appendCirclePath(ops, x * MM_TO_PT, py, rPt);
                    }
                }
                ops.push('f');
            } else if (bg === 'ruled') {
                const gsBg = useGs(isDark ? 0.11 : 0.10);
                ops.push(`/${gsBg} gs ${isDark ? '1 1 1' : '0 0 0'} RG 0.55 w`);
                for (let y = 8; y < A4_H; y += 8) {
                    const py = fmt(PDF_A4_H - y * MM_TO_PT);
                    ops.push(`0 ${py} m ${PDF_A4_W} ${py} l S`);
                }
            }

            if (showCropMarks) {
                const gsCrop = useGs(0.14);
                ops.push(`/${gsCrop} gs ${isDark ? '1 1 1' : '0 0 0'} RG 0.6 w [4 5] 0 d`);
                ops.push(`0 0 ${PDF_A4_W} ${PDF_A4_H} re S [] 0 d`);
            }

            // Clip tile contents cleanly to page bounds
            ops.push(`q 0 0 ${PDF_A4_W} ${PDF_A4_H} re W n`);
            ops.push(`/${gsOpaque} gs`);

            // 3. Widgets (under ink)
            const widgets = page.widgets || [];
            for (let i = 0; i < widgets.length; i++) {
                const w = widgets[i];
                const wBox = { minX: w.x, minY: w.y, maxX: w.x + w.w, maxY: w.y + w.h };
                if (!bboxIntersects(wBox, tileBox)) continue;

                const img = imageObjects.get(`${pageIndex}:${w.id}`) || imageObjects.get(String(w.id));
                const xPt = toPdfX(w.x);
                const yBotPt = toPdfY(w.y + w.h);
                const wPt = w.w * MM_TO_PT;
                const hPt = w.h * MM_TO_PT;

                if (img) {
                    pageImages.set(img.name, img.id);
                    ops.push(`q ${fmt(wPt)} 0 0 ${fmt(hPt)} ${fmt(xPt)} ${fmt(yBotPt)} cm /${img.name} Do Q`);
                } else {
                    const fillStr = isDark ? '0.11 0.11 0.12 rg' : '1 1 1 rg';
                    const strokeStr = isDark ? '0.24 0.24 0.26 RG' : '0.83 0.83 0.85 RG';
                    const textStr = isDark ? '0.7 0.7 0.74 rg' : '0.35 0.35 0.38 rg';
                    const summary = (w.data && (w.data.title || w.data.fn || w.data.preset || w.data.slug)) || '';
                    const label = summary ? `${w.kind}: ${String(summary).slice(0, 36)}` : String(w.kind || 'widget');
                    ops.push(`${fillStr} ${strokeStr} 0.8 w ${fmt(xPt)} ${fmt(yBotPt)} ${fmt(wPt)} ${fmt(hPt)} re B`);
                    ops.push(`BT /F1 9 Tf ${textStr} ${fmt(xPt + 10)} ${fmt(yBotPt + hPt - 16)} Td (${escapePdfString(label)}) Tj ET`);
                }
            }

            // 4. Strokes (Pass 1: highlighters; Pass 2: pen/shapes)
            const strokes = page.strokes || [];
            ops.push('1 J 1 j');
            for (let pass = 0; pass < 2; pass++) {
                const wantHighlighter = pass === 0;
                for (let i = 0; i < strokes.length; i++) {
                    const s = strokes[i];
                    if ((s.tool === 'highlighter') !== wantHighlighter) continue;
                    if (!s.points || s.points.length === 0) continue;
                    if (s.bbox && !bboxIntersects(s.bbox, tileBox)) continue;

                    const cmds = traceStrokeCommands(s.points, s.width);
                    if (cmds.length === 0) continue;

                    const color = parseColorWithAlpha(resolveInkColor(s.color, theme));
                    const gsName = useGs(color.alpha);
                    const cRgb = rgbOp(color.r, color.g, color.b);
                    const wPt = (s.width || 0.45) * MM_TO_PT;

                    ops.push(`/${gsName} gs`);
                    if (cmds.length === 1 && cmds[0].type === 'CIRCLE') {
                        const c = cmds[0];
                        ops.push(`${cRgb} rg`);
                        appendCirclePath(ops, toPdfX(c.cx), toPdfY(c.cy), c.r * MM_TO_PT);
                        ops.push('f');
                        continue;
                    }

                    let dashOp = '[] 0 d';
                    if (s.style === 'dashed') dashOp = `[${fmt(wPt * 3.4)} ${fmt(wPt * 2.4)}] 0 d`;
                    else if (s.style === 'dotted') dashOp = `[0.01 ${fmt(wPt * 2.35)}] 0 d`;

                    ops.push(`${cRgb} RG ${fmt(wPt)} w ${dashOp}`);

                    let curX = 0;
                    let curY = 0;
                    for (let k = 0; k < cmds.length; k++) {
                        const cmd = cmds[k];
                        if (cmd.type === 'M') {
                            ops.push(`${fmt(toPdfX(cmd.x))} ${fmt(toPdfY(cmd.y))} m`);
                            curX = cmd.x;
                            curY = cmd.y;
                        } else if (cmd.type === 'L') {
                            ops.push(`${fmt(toPdfX(cmd.x))} ${fmt(toPdfY(cmd.y))} l`);
                            curX = cmd.x;
                            curY = cmd.y;
                        } else if (cmd.type === 'Q') {
                            const c1x = curX + (2 / 3) * (cmd.cx - curX);
                            const c1y = curY + (2 / 3) * (cmd.cy - curY);
                            const c2x = cmd.x + (2 / 3) * (cmd.cx - cmd.x);
                            const c2y = cmd.y + (2 / 3) * (cmd.cy - cmd.y);
                            ops.push(
                                `${fmt(toPdfX(c1x))} ${fmt(toPdfY(c1y))} `
                                + `${fmt(toPdfX(c2x))} ${fmt(toPdfY(c2y))} `
                                + `${fmt(toPdfX(cmd.x))} ${fmt(toPdfY(cmd.y))} c`
                            );
                            curX = cmd.x;
                            curY = cmd.y;
                        }
                    }
                    ops.push('S');
                }
            }

            // 5. Connector badges (above ink)
            const connectors = page.connectors || [];
            if (connectors.length > 0) {
                ops.push(`/${gsOpaque} gs [] 0 d`);
                const rBadgePt = 4 * MM_TO_PT;
                const borderRgb = isDark ? '0.071 0.071 0.071' : '1 1 1';
                for (let i = 0; i < connectors.length; i++) {
                    const c = connectors[i];
                    const cBox = { minX: c.x - 4, minY: c.y - 4, maxX: c.x + 4, maxY: c.y + 4 };
                    if (!bboxIntersects(cBox, tileBox)) continue;

                    const color = parseColorWithAlpha(resolveInkColor(c.color, theme));
                    const px = toPdfX(c.x);
                    const py = toPdfY(c.y);
                    const label = String(c.label || '');
                    const lum = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
                    const textRgb = lum > 0.65 ? '0.067 0.067 0.067' : '1 1 1';

                    ops.push(`${rgbOp(color.r, color.g, color.b)} rg ${borderRgb} RG 1.5 w`);
                    appendCirclePath(ops, px, py, rBadgePt);
                    ops.push('B');
                    const tx = px - label.length * 3.2;
                    const ty = py - 3.4;
                    ops.push(`BT /F1 10 Tf ${textRgb} rg ${fmt(tx)} ${fmt(ty)} Td (${escapePdfString(label)}) Tj ET`);
                }
            }

            ops.push('Q');

            const streamBytes = strToBytes(ops.join('\n'));
            const contentId = allocObj([
                strToBytes(`<< /Length ${streamBytes.length} >>\nstream\n`),
                streamBytes,
                strToBytes('\nendstream'),
            ]);

            const gsEntries = Array.from(pageGsNames)
                .map((name) => {
                    const q = Number(name.slice(2));
                    const gs = extGStates.get(q);
                    return `/${name} ${gs.id} 0 R`;
                })
                .join(' ');
            const xobjEntries = Array.from(pageImages.entries())
                .map(([name, id]) => `/${name} ${id} 0 R`)
                .join(' ');
            const xobjDict = xobjEntries ? ` /XObject << ${xobjEntries} >>` : '';

            const pageObjId = allocObj([
                strToBytes(
                    `<< /Type /Page /Parent ${pagesId} 0 R `
                    + `/MediaBox [0 0 ${PDF_A4_W} ${PDF_A4_H}] `
                    + `/Resources << /Font << /F1 ${fontId} 0 R >> /ExtGState << ${gsEntries} >>${xobjDict} >> `
                    + `/Contents ${contentId} 0 R >>`
                ),
            ]);
            pageObjIds.push(pageObjId);
        }
    }

    // Finalize Catalog & Pages
    objects[catalogId] = [strToBytes(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)];
    objects[pagesId] = [
        strToBytes(`<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >>`),
    ];

    // Assemble PDF binary stream with exact xref byte offsets
    const chunks = [];
    let offset = 0;
    const pushBytes = (bytes) => {
        chunks.push(bytes);
        offset += bytes.length;
    };

    pushBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

    const objOffsets = new Array(objects.length);
    for (let id = 1; id < objects.length; id++) {
        objOffsets[id] = offset;
        pushBytes(strToBytes(`${id} 0 obj\n`));
        const bodyChunks = objects[id];
        for (let j = 0; j < bodyChunks.length; j++) {
            pushBytes(bodyChunks[j]);
        }
        pushBytes(strToBytes('\nendobj\n'));
    }

    const xrefOffset = offset;
    const xrefLines = [`xref\n0 ${objects.length}\n0000000000 65535 f \n`];
    for (let id = 1; id < objects.length; id++) {
        xrefLines.push(`${String(objOffsets[id]).padStart(10, '0')} 00000 n \n`);
    }
    pushBytes(strToBytes(xrefLines.join('')));
    pushBytes(strToBytes(
        `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
    ));

    const out = new Uint8Array(offset);
    let pos = 0;
    for (let i = 0; i < chunks.length; i++) {
        out.set(chunks[i], pos);
        pos += chunks[i].length;
    }
    return out;
}

function findWidgetDomElement(widget, overlay, widgetManager) {
    if (widgetManager) {
        if (typeof widgetManager.getElement === 'function') {
            const el = widgetManager.getElement(widget.id);
            if (el) return el;
        }
        if (widgetManager.elements && typeof widgetManager.elements.get === 'function') {
            const el = widgetManager.elements.get(widget.id);
            if (el) return el;
        }
        if (widgetManager.widgets && typeof widgetManager.widgets.get === 'function') {
            const entry = widgetManager.widgets.get(widget.id);
            if (entry && entry.el) return entry.el;
        }
    }
    const layer = (overlay && overlay.widgetsLayer) || (widgetManager && widgetManager.overlay && widgetManager.overlay.widgetsLayer);
    if (layer && layer.children) {
        for (let i = 0; i < layer.children.length; i++) {
            const child = layer.children[i];
            const wid = (child.dataset && child.dataset.widgetId)
                || (typeof child.getAttribute === 'function' && child.getAttribute('data-widget-id'));
            if (wid === widget.id) return child;
        }
    }
    return null;
}

async function rasterizeWidgetElement(el, widget, dpi = 150, theme = 'light') {
    if (typeof document === 'undefined' || typeof Image === 'undefined' || typeof XMLSerializer === 'undefined') {
        return null;
    }
    const maxPx = 2048;
    const widthPx = Math.max(16, Math.min(maxPx, Math.round((widget.w / 25.4) * dpi)));
    const heightPx = Math.max(16, Math.min(maxPx, Math.round((widget.h / 25.4) * dpi)));
    const body = (typeof el.querySelector === 'function' && el.querySelector('.board-widget-body')) || el;

    let svgMarkup = null;
    if (widget.kind !== 'exercise' && typeof body.querySelectorAll === 'function') {
        const svgs = body.querySelectorAll('svg');
        for (let i = 0; i < svgs.length; i++) {
            const svgEl = svgs[i];
            if (typeof svgEl.closest === 'function' && svgEl.closest('.mjx-container, .board-widget-handle, .board-widget-chrome')) {
                continue;
            }
            const clone = svgEl.cloneNode(true);
            clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            if (!clone.getAttribute('width')) clone.setAttribute('width', String(widthPx));
            if (!clone.getAttribute('height')) clone.setAttribute('height', String(heightPx));
            svgMarkup = new XMLSerializer().serializeToString(clone);
            break;
        }
    }

    if (!svgMarkup) {
        const bg = theme === 'dark' ? '#1c1c1e' : '#ffffff';
        const fg = theme === 'dark' ? '#e4e4e7' : '#18181b';
        const cssW = Math.max(80, Math.round(widget.w * 4));
        const cssH = Math.max(60, Math.round(widget.h * 4));
        const serialized = new XMLSerializer().serializeToString(body);
        svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${cssW}" height="${cssH}" viewBox="0 0 ${cssW} ${cssH}">`
            + `<foreignObject width="100%" height="100%">`
            + `<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;box-sizing:border-box;padding:10px;background:${bg};color:${fg};font-family:sans-serif;font-size:14px;overflow:hidden;">${serialized}</div>`
            + `</foreignObject></svg>`;
    }

    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    try {
        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Widget rasterization failed'));
            image.src = dataUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
        const imgData = ctx.getImageData(0, 0, widthPx, heightPx);
        const rgba = imgData.data;
        const n = widthPx * heightPx;
        const rgbBytes = new Uint8Array(n * 3);
        const alphaBytes = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
            rgbBytes[i * 3] = rgba[i * 4];
            rgbBytes[i * 3 + 1] = rgba[i * 4 + 1];
            rgbBytes[i * 3 + 2] = rgba[i * 4 + 2];
            alphaBytes[i] = rgba[i * 4 + 3];
        }
        return { widthPx, heightPx, rgbBytes, alphaBytes };
    } catch (_) {
        return null;
    }
}

/**
 * Browser helper: rasterizes mounted DOM/SVG widgets to high-DPI snapshots, builds vector PDF bytes,
 * and triggers download (`matephis-board-YYYY-MM-DD.pdf`).
 */
export async function exportSceneToPDF(scene, {
    theme = 'light',
    widgetManager = null,
    overlay = null,
    widgetSnapshots = null,
    dpi = 150,
    filename = null,
} = {}) {
    const snapshots = Array.isArray(widgetSnapshots) ? widgetSnapshots.slice() : [];

    if (typeof document !== 'undefined' && scene && Array.isArray(scene.pages)) {
        const activeIdx = scene.currentPageIndex || 0;
        const activePage = scene.pages[activeIdx];
        if (activePage && Array.isArray(activePage.widgets)) {
            for (let i = 0; i < activePage.widgets.length; i++) {
                const w = activePage.widgets[i];
                const el = findWidgetDomElement(w, overlay, widgetManager);
                if (!el) continue;
                const raster = await rasterizeWidgetElement(el, w, dpi, theme);
                if (raster) {
                    snapshots.push({
                        pageIndex: activeIdx,
                        widgetId: w.id,
                        ...raster,
                    });
                }
            }
        }
    }

    const pdfBytes = generatePDFBytes(scene, { theme, widgetSnapshots: snapshots });
    const date = new Date().toISOString().slice(0, 10);
    const outName = filename || `matephis-board-${date}.pdf`;

    if (typeof Blob === 'function' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && typeof document !== 'undefined') {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    return pdfBytes;
}
