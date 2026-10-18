/**
 * Multiple small plots side by side (e.g. multiple-choice questions).
 *
 * ```matephis
 * {
 *   "layout": "grid",          // "row" (one line) or "grid"
 *   "columns": 2,              // grid columns (row: number of plots)
 *   "mobileColumns": 2,        // columns on narrow screens (default: min(columns, 2))
 *   "labels": "A",             // "A" | "a" | "1" | "i" | ["…", …] | false -> "A)", "B)", …
 *   "shared": { "xlim": [-5, 5], "ylim": [-5, 5] },   // merged into every plot
 *   "plots": [ { "data": [ … ] }, { "data": [ … ], "label": "custom" } ]
 * }
 * ```
 */
import { MatephisPlot } from './plot.js';
import { cssLength } from './config.js';

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];

/** Caption for the k-th plot. */
function labelFor(style, k, plot) {
    if (plot && typeof plot.label === 'string') return plot.label;
    if (style === false || style === null) return null;
    if (Array.isArray(style)) return style[k] !== undefined ? String(style[k]) : null;
    switch (style === undefined ? 'A' : String(style)) {
        case 'a': return `${String.fromCharCode(97 + k)})`;
        case '1': return `${k + 1})`;
        case 'i': return `${ROMAN[k] || k + 1})`;
        case 'A':
        default: return `${String.fromCharCode(65 + k)})`;
    }
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Deep merge for plain objects; arrays and primitives from `b` win. */
function merge(a, b) {
    const out = { ...a };
    for (const k in b) out[k] = isObj(a[k]) && isObj(b[k]) ? merge(a[k], b[k]) : b[k];
    return out;
}

/** Defaults that make small plots readable. */
const SMALL_PLOT_DEFAULTS = {
    cssWidth: "100%",
    padding: 14,
    numberSize: 12,
    labelSize: 13,
};

export class MatephisPlotGroup {
    constructor(container, config, options = {}) {
        this.container = container;
        this.config = config;
        this.plots = [];

        const layout = config.layout === 'row' ? 'row' : 'grid';
        const n = config.plots.length;
        const cols = layout === 'row' ? n : Math.max(1, Math.min(n, config.columns || 2));
        const mobileCols = config.mobileColumns || Math.min(cols, 2);

        const root = document.createElement('div');
        root.className = `matephis-plot-group layout-${layout}`;
        root.style.setProperty('--mp-cols', cols);
        root.style.setProperty('--mp-cols-mobile', mobileCols);
        if (config.gap !== undefined) root.style.setProperty('--mp-gap', cssLength(config.gap));
        if (config.cssWidth || config.fullWidth) root.style.maxWidth = config.fullWidth ? '100%' : cssLength(config.cssWidth);
        if (config.align === 'center') root.classList.add('align-center');
        if (config.marginBottom !== undefined) root.style.marginBottom = cssLength(config.marginBottom);
        container.appendChild(root);
        this.root = root;

        config.plots.forEach((plotCfg, k) => {
            const cell = document.createElement('figure');
            cell.className = 'matephis-plot-cell';

            const caption = labelFor(config.labels, k, plotCfg);
            if (caption) {
                const cap = document.createElement('figcaption');
                cap.className = 'matephis-plot-cell-label';
                cap.textContent = caption;
                cell.appendChild(cap);
            }

            const host = document.createElement('div');
            host.className = 'matephis-plot';
            cell.appendChild(host);
            root.appendChild(cell);

            const cfg = merge(merge(SMALL_PLOT_DEFAULTS, config.shared || {}), plotCfg);
            delete cfg.label;
            delete cfg.align;
            try {
                this.plots.push(new MatephisPlot(host, cfg, options));
            } catch (e) {
                console.error('Plot Group Error', e);
                host.textContent = `Errore nel grafico ${caption || k + 1}: ${e.message}`;
                host.classList.add('matephis-plot-error');
            }
        });

        if (config.caption) {
            const cap = document.createElement('div');
            cap.className = 'matephis-plot-group-caption';
            cap.textContent = config.caption;
            root.appendChild(cap);
        }
    }

    destroy() {
        this.plots.forEach(p => p.destroy());
        this.container.innerHTML = '';
    }
}

MatephisPlot.Group = MatephisPlotGroup;
