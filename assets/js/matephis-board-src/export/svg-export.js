/**
 * Self-contained vector SVG export & lossless metadata re-import for Matephis Board.
 * Pure JS: works identically in headless Node (tests) and live browser DOM.
 */

import { A4_W, A4_H } from '../ink/geometry.js';
import { resolveInkColor } from '../ink/palette.js';
import { traceStrokeCommands } from '../ink/stroke.js';

function fmt(n) {
    const rounded = Math.round(n * 1000) / 1000;
    return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function unescapeXml(str) {
    return String(str).replace(/&(#x[0-9a-fA-F]+|#\d+|lt|gt|quot|apos|amp);/g, (full, ent) => {
        if (ent === 'lt') return '<';
        if (ent === 'gt') return '>';
        if (ent === 'quot') return '"';
        if (ent === 'apos') return "'";
        if (ent === 'amp') return '&';
        if (ent.startsWith('#x')) return String.fromCodePoint(parseInt(ent.slice(2), 16));
        if (ent.startsWith('#')) return String.fromCodePoint(parseInt(ent.slice(1), 10));
        return full;
    });
}

/**
 * Parse `#hex`, `rgb(...)`, or `rgba(...)` into `{ hex, r, g, b, alpha }`.
 */
export function parseColorWithAlpha(colorStr) {
    const str = String(colorStr || '#111111').trim();
    if (str.startsWith('#')) {
        let hex = str.slice(1);
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map((c) => c + c).join('');
        }
        const r = parseInt(hex.slice(0, 2), 16) || 0;
        const g = parseInt(hex.slice(2, 4), 16) || 0;
        const b = parseInt(hex.slice(4, 6), 16) || 0;
        const alpha = hex.length === 8 ? Math.round((parseInt(hex.slice(6, 8), 16) / 255) * 1000) / 1000 : 1;
        return {
            hex: `#${hex.slice(0, 6).padStart(6, '0').toLowerCase()}`,
            r,
            g,
            b,
            alpha,
        };
    }

    const m = str.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (m) {
        const r = Math.max(0, Math.min(255, Math.round(Number(m[1]))));
        const g = Math.max(0, Math.min(255, Math.round(Number(m[2]))));
        const b = Math.max(0, Math.min(255, Math.round(Number(m[3]))));
        const alpha = m[4] !== undefined ? Math.max(0, Math.min(1, Number(m[4]))) : 1;
        const toHex = (v) => v.toString(16).padStart(2, '0');
        return {
            hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
            r,
            g,
            b,
            alpha,
        };
    }

    return { hex: '#111111', r: 17, g: 17, b: 17, alpha: 1 };
}

function isLightColor(r, g, b) {
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.65;
}

function renderBackgroundSVG(bounds, background, theme, showCropMarks) {
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#121212' : '#ffffff';
    const vbW = bounds.maxX - bounds.minX;
    const vbH = bounds.maxY - bounds.minY;
    const defs = [];
    const layers = [
        `<rect x="${fmt(bounds.minX)}" y="${fmt(bounds.minY)}" width="${fmt(vbW)}" height="${fmt(vbH)}" fill="${bgColor}" />`,
    ];

    if (background === 'grid') {
        const stroke = isDark ? '#ffffff' : '#000000';
        const op = isDark ? '0.08' : '0.075';
        defs.push(
            `<pattern id="board-bg-grid" width="5" height="5" patternUnits="userSpaceOnUse">`
            + `<path d="M 5 0 L 0 0 0 5" fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="0.2" />`
            + `</pattern>`
        );
        layers.push(
            `<rect x="${fmt(bounds.minX)}" y="${fmt(bounds.minY)}" width="${fmt(vbW)}" height="${fmt(vbH)}" fill="url(#board-bg-grid)" />`
        );
    } else if (background === 'dots') {
        const fill = isDark ? '#ffffff' : '#000000';
        const op = isDark ? '0.22' : '0.20';
        defs.push(
            `<pattern id="board-bg-dots" x="-2.5" y="-2.5" width="5" height="5" patternUnits="userSpaceOnUse">`
            + `<circle cx="2.5" cy="2.5" r="0.25" fill="${fill}" fill-opacity="${op}" />`
            + `</pattern>`
        );
        layers.push(
            `<rect x="${fmt(bounds.minX)}" y="${fmt(bounds.minY)}" width="${fmt(vbW)}" height="${fmt(vbH)}" fill="url(#board-bg-dots)" />`
        );
    } else if (background === 'ruled') {
        const stroke = isDark ? '#ffffff' : '#000000';
        const op = isDark ? '0.11' : '0.10';
        defs.push(
            `<pattern id="board-bg-ruled" x="0" y="-4" width="8" height="8" patternUnits="userSpaceOnUse">`
            + `<line x1="0" y1="4" x2="8" y2="4" stroke="${stroke}" stroke-opacity="${op}" stroke-width="0.22" />`
            + `</pattern>`
        );
        layers.push(
            `<rect x="${fmt(bounds.minX)}" y="${fmt(bounds.minY)}" width="${fmt(vbW)}" height="${fmt(vbH)}" fill="url(#board-bg-ruled)" />`
        );
    }

    if (showCropMarks) {
        const minCol = Math.round(bounds.minX / A4_W);
        const maxCol = Math.round(bounds.maxX / A4_W);
        const minRow = Math.round(bounds.minY / A4_H);
        const maxRow = Math.round(bounds.maxY / A4_H);
        const borderColor = isDark ? '#ffffff' : '#000000';
        const borderLines = [];
        for (let col = minCol; col <= maxCol; col++) {
            const x = col * A4_W;
            borderLines.push(`M ${fmt(x)} ${fmt(bounds.minY)} L ${fmt(x)} ${fmt(bounds.maxY)}`);
        }
        for (let row = minRow; row <= maxRow; row++) {
            const y = row * A4_H;
            borderLines.push(`M ${fmt(bounds.minX)} ${fmt(y)} L ${fmt(bounds.maxX)} ${fmt(y)}`);
        }
        if (borderLines.length > 0) {
            layers.push(
                `<path d="${borderLines.join(' ')}" fill="none" stroke="${borderColor}" stroke-opacity="0.11" stroke-width="0.25" stroke-dasharray="1.5 2" />`
            );
        }
    }

    return {
        defsXml: defs.length ? `<defs>\n    ${defs.join('\n    ')}\n  </defs>` : '',
        bgXml: `<g id="board-background" data-background="${escapeXml(background || 'blank')}">\n    ${layers.join('\n    ')}\n  </g>`,
    };
}

function renderStrokeSVG(stroke, theme) {
    const cmds = traceStrokeCommands(stroke.points, stroke.width);
    if (cmds.length === 0) return '';

    const color = parseColorWithAlpha(resolveInkColor(stroke.color, theme));
    const width = stroke.width || 0.45;

    if (cmds.length === 1 && cmds[0].type === 'CIRCLE') {
        const c = cmds[0];
        const opAttr = color.alpha < 1 ? ` fill-opacity="${fmt(color.alpha)}"` : '';
        return `<circle cx="${fmt(c.cx)}" cy="${fmt(c.cy)}" r="${fmt(c.r)}" fill="${color.hex}"${opAttr} />`;
    }

    const dParts = new Array(cmds.length);
    for (let i = 0; i < cmds.length; i++) {
        const c = cmds[i];
        if (c.type === 'M') dParts[i] = `M ${fmt(c.x)} ${fmt(c.y)}`;
        else if (c.type === 'L') dParts[i] = `L ${fmt(c.x)} ${fmt(c.y)}`;
        else if (c.type === 'Q') dParts[i] = `Q ${fmt(c.cx)} ${fmt(c.cy)} ${fmt(c.x)} ${fmt(c.y)}`;
    }

    let dashAttr = '';
    if (stroke.style === 'dashed') {
        dashAttr = ` stroke-dasharray="${fmt(width * 3.4)} ${fmt(width * 2.4)}"`;
    } else if (stroke.style === 'dotted') {
        dashAttr = ` stroke-dasharray="0.01 ${fmt(width * 2.35)}"`;
    }
    const opAttr = color.alpha < 1 ? ` stroke-opacity="${fmt(color.alpha)}"` : '';

    return `<path d="${dParts.join(' ')}" fill="none" stroke="${color.hex}" stroke-width="${fmt(width)}" stroke-linecap="round" stroke-linejoin="round"${dashAttr}${opAttr} />`;
}

function findWidgetElement(widget, options) {
    const id = widget.id;
    const map = options.widgetElements;
    if (map) {
        if (typeof map.get === 'function' && map.has(id)) return map.get(id);
        if (typeof map === 'object' && map[id]) return map[id];
    }

    const wm = options.widgetManager;
    if (wm) {
        if (typeof wm.getElement === 'function') {
            const el = wm.getElement(id);
            if (el) return el;
        }
        if (wm.elements && typeof wm.elements.get === 'function') {
            const el = wm.elements.get(id);
            if (el) return el;
        }
        if (wm.widgets && typeof wm.widgets.get === 'function') {
            const entry = wm.widgets.get(id);
            if (entry && entry.el) return entry.el;
        }
    }

    const layer = (options.overlay && options.overlay.widgetsLayer)
        || (wm && wm.overlay && wm.overlay.widgetsLayer);
    if (layer && layer.children) {
        for (let i = 0; i < layer.children.length; i++) {
            const child = layer.children[i];
            const wid = (child.dataset && child.dataset.widgetId)
                || (typeof child.getAttribute === 'function' && child.getAttribute('data-widget-id'));
            if (wid === id) return child;
        }
    }
    return null;
}

function serializeNode(node) {
    if (!node) return '';
    if (typeof XMLSerializer === 'function') {
        try {
            return new XMLSerializer().serializeToString(node);
        } catch (_) {
            // fallback below
        }
    }
    return node.outerHTML || '';
}

function renderWidgetSVG(widget, options, theme) {
    const isDark = theme === 'dark';
    const cardBg = isDark ? '#1c1c1e' : '#ffffff';
    const cardBorder = isDark ? '#3a3a3c' : '#d4d4d8';
    const textFill = isDark ? '#e4e4e7' : '#18181b';
    const mutedFill = isDark ? '#a1a1aa' : '#71717a';

    const el = findWidgetElement(widget, options);
    if (el) {
        const body = (typeof el.querySelector === 'function' && el.querySelector('.board-widget-body')) || el;
        if (widget.kind !== 'exercise' && typeof body.querySelectorAll === 'function') {
            const svgs = body.querySelectorAll('svg');
            for (let i = 0; i < svgs.length; i++) {
                const svgEl = svgs[i];
                if (typeof svgEl.closest === 'function' && svgEl.closest('.mjx-container, .board-widget-handle, .board-widget-chrome')) {
                    continue;
                }
                const rawSvg = serializeNode(svgEl);
                if (rawSvg && rawSvg.includes('<svg')) {
                    const innerMatch = rawSvg.match(/^<svg\b([^>]*)>([\s\S]*)<\/svg>$/i);
                    if (innerMatch) {
                        const attrs = innerMatch[1];
                        const inner = innerMatch[2];
                        const vbMatch = attrs.match(/\bviewBox\s*=\s*(['"])([^'"]+)\1/i);
                        let viewBox = vbMatch ? vbMatch[2] : '';
                        if (!viewBox) {
                            const wMatch = attrs.match(/\bwidth\s*=\s*(['"])([\d.]+)/i);
                            const hMatch = attrs.match(/\bheight\s*=\s*(['"])([\d.]+)/i);
                            const sw = wMatch ? wMatch[2] : fmt(widget.w * 4);
                            const sh = hMatch ? hMatch[2] : fmt(widget.h * 4);
                            viewBox = `0 0 ${sw} ${sh}`;
                        }
                        return `<g class="board-widget-embed" data-widget-id="${escapeXml(widget.id)}" data-widget-kind="${escapeXml(widget.kind)}">`
                            + `<rect x="${fmt(widget.x)}" y="${fmt(widget.y)}" width="${fmt(widget.w)}" height="${fmt(widget.h)}" rx="2" fill="${cardBg}" stroke="${cardBorder}" stroke-width="0.35" />`
                            + `<svg x="${fmt(widget.x)}" y="${fmt(widget.y)}" width="${fmt(widget.w)}" height="${fmt(widget.h)}" viewBox="${escapeXml(viewBox)}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`
                            + `</g>`;
                    }
                }
            }
        }

        const serializedBody = serializeNode(body);
        if (serializedBody) {
            const xhtml = serializedBody.includes('xmlns=')
                ? serializedBody
                : `<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;overflow:hidden;font-family:'Noto Sans',sans-serif;color:${textFill};background:${cardBg};">${serializedBody}</div>`;
            return `<g class="board-widget-embed" data-widget-id="${escapeXml(widget.id)}" data-widget-kind="${escapeXml(widget.kind)}">`
                + `<rect x="${fmt(widget.x)}" y="${fmt(widget.y)}" width="${fmt(widget.w)}" height="${fmt(widget.h)}" rx="2" fill="${cardBg}" stroke="${cardBorder}" stroke-width="0.35" />`
                + `<foreignObject x="${fmt(widget.x)}" y="${fmt(widget.y)}" width="${fmt(widget.w)}" height="${fmt(widget.h)}">${xhtml}</foreignObject>`
                + `</g>`;
        }
    }

    // Headless / fallback placeholder frame
    const summary = (widget.data && (widget.data.title || widget.data.fn || widget.data.preset || widget.data.slug)) || '';
    const label = summary ? `${widget.kind}: ${String(summary).slice(0, 40)}` : String(widget.kind || 'widget');
    return `<g class="board-widget-placeholder" data-widget-id="${escapeXml(widget.id)}" data-widget-kind="${escapeXml(widget.kind)}">`
        + `<rect x="${fmt(widget.x)}" y="${fmt(widget.y)}" width="${fmt(widget.w)}" height="${fmt(widget.h)}" rx="2" fill="${cardBg}" stroke="${cardBorder}" stroke-width="0.45" />`
        + `<text x="${fmt(widget.x + 4)}" y="${fmt(widget.y + 7)}" fill="${mutedFill}" font-family="Space Grotesk, Noto Sans, sans-serif" font-size="4.2" font-weight="600">${escapeXml(label)}</text>`
        + `</g>`;
}

function renderConnectorSVG(connector, theme) {
    const color = parseColorWithAlpha(resolveInkColor(connector.color, theme));
    const ringStroke = theme === 'dark' ? '#121212' : '#ffffff';
    const textFill = isLightColor(color.r, color.g, color.b) ? '#111111' : '#ffffff';
    const label = String(connector.label || '');
    return `<g class="board-connector-badge" data-connector-id="${escapeXml(connector.id)}" data-pair-id="${escapeXml(connector.pairId || '')}">`
        + `<circle cx="${fmt(connector.x)}" cy="${fmt(connector.y)}" r="4" fill="${color.hex}" stroke="${ringStroke}" stroke-width="0.6" />`
        + `<text x="${fmt(connector.x)}" y="${fmt(connector.y)}" fill="${textFill}" font-family="Space Grotesk, Noto Sans, sans-serif" font-size="4.2" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`
        + `</g>`;
}

/**
 * Export a single board page to a self-contained vector SVG string.
 * Works purely in Node without DOM; in browser, optionally embeds live widget SVGs.
 */
export function exportPageToSVG(scene, options = {}) {
    const pageIndex = typeof options.pageIndex === 'number' ? options.pageIndex : (scene.currentPageIndex || 0);
    const page = (typeof scene.getPage === 'function' ? scene.getPage(pageIndex) : scene.pages[pageIndex]) || scene.currentPage;
    const theme = options.theme === 'dark' ? 'dark' : 'light';
    const includeMetadata = options.includeMetadata !== false;
    const showCropMarks = options.showCropMarks !== undefined
        ? Boolean(options.showCropMarks)
        : Boolean(scene.settings && scene.settings.showCropMarks);

    const footprint = typeof scene.getFootprint === 'function' ? scene.getFootprint(pageIndex) : null;
    const bounds = (footprint && footprint.bounds) ? footprint.bounds : { minX: 0, minY: 0, maxX: A4_W, maxY: A4_H };
    const vbW = bounds.maxX - bounds.minX;
    const vbH = bounds.maxY - bounds.minY;

    const { defsXml, bgXml } = renderBackgroundSVG(bounds, page.background || 'blank', theme, showCropMarks);

    const widgetsXml = (page.widgets || []).map((w) => renderWidgetSVG(w, options, theme)).filter(Boolean);

    const highlighters = [];
    const strokes = [];
    for (let i = 0; i < (page.strokes || []).length; i++) {
        const s = page.strokes[i];
        const el = renderStrokeSVG(s, theme);
        if (!el) continue;
        if (s.tool === 'highlighter') highlighters.push(el);
        else strokes.push(el);
    }

    const connectorsXml = (page.connectors || []).map((c) => renderConnectorSVG(c, theme));

    const parts = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${fmt(vbW)}mm" height="${fmt(vbH)}mm" viewBox="${fmt(bounds.minX)} ${fmt(bounds.minY)} ${fmt(vbW)} ${fmt(vbH)}" data-matephis-board="2">`,
    ];

    if (defsXml) parts.push(`  ${defsXml}`);
    parts.push(`  ${bgXml}`);
    parts.push(`  <g id="board-widgets">${widgetsXml.length ? `\n    ${widgetsXml.join('\n    ')}\n  ` : ''}</g>`);
    parts.push(`  <g id="board-highlighters">${highlighters.length ? `\n    ${highlighters.join('\n    ')}\n  ` : ''}</g>`);
    parts.push(`  <g id="board-strokes">${strokes.length ? `\n    ${strokes.join('\n    ')}\n  ` : ''}</g>`);
    parts.push(`  <g id="board-connectors">${connectorsXml.length ? `\n    ${connectorsXml.join('\n    ')}\n  ` : ''}</g>`);

    if (includeMetadata && typeof scene.toJSON === 'function') {
        const payload = escapeXml(JSON.stringify(scene.toJSON()));
        parts.push(`  <metadata id="matephis-board-data">${payload}</metadata>`);
    }

    parts.push('</svg>');
    return parts.join('\n');
}

/**
 * Extract and parse the embedded `<metadata id="matephis-board-data">` JSON from an SVG string.
 * Returns `null` if no valid board metadata is found.
 */
export function extractBoardDataFromSVG(svgText) {
    if (typeof svgText !== 'string' || !svgText) return null;
    const match = svgText.match(/<metadata\b[^>]*\bid\s*=\s*(['"])matephis-board-data\1[^>]*>([\s\S]*?)<\/metadata>/i);
    if (!match) return null;

    let raw = match[2].trim();
    const cdataMatch = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
    if (cdataMatch) {
        raw = cdataMatch[1].trim();
    } else {
        raw = unescapeXml(raw).trim();
    }

    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
        return null;
    }
}

/**
 * Browser helper: export the active page as `.svg` and trigger download.
 */
export function downloadPageSVG(scene, options = {}) {
    const svg = exportPageToSVG(scene, options);
    const date = new Date().toISOString().slice(0, 10);
    const filename = options.filename || `matephis-board-${date}.svg`;

    if (typeof Blob === 'function' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && typeof document !== 'undefined') {
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    return svg;
}
