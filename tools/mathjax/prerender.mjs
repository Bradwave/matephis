#!/usr/bin/env node
/**
 * Typesets the maths of the built site at build time, so pages need no MathJax in the browser.
 *
 *   node tools/mathjax/prerender.mjs [_site] [--check]
 *
 * Runs after `jekyll build`: every HTML page with $…$, $$…$$, \(…\) or \[…\] gets its formulas
 * as SVG, exactly as the browser's MathJax 3.2.2 (tex-svg component, the same configuration as
 * _layouts/Post.html) would draw them: the same TeX packages (the component's defaults plus the
 * extensions it would load on demand), a global font cache, and the hidden MathML that screen
 * readers read. The page is marked with data-mathjax="prerendered" on <html>; Post.html then
 * does not load MathJax (the plot, physics and sets engines load it when a label needs TeX:
 * renderers/mathjax-bridge.js). Pages without maths are not touched.
 *
 * --check: typeset but do not write; report what would change.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AssistiveMmlHandler } from 'mathjax-full/js/a11y/assistive-mml.js';
import 'mathjax-full/js/input/tex/AllPackages.js'; // registers every TeX package configuration

// The tex-svg component's packages, without the loaders (require, autoload) ...
const BASE_PACKAGES = ['base', 'ams', 'newcommand', 'noundefined', 'configmacros'];
// ... plus what its autoload would load the first time one of their macros appears
const AUTOLOADED = ['action', 'amscd', 'bbox', 'boldsymbol', 'braket', 'bussproofs', 'cancel', 'color',
    'enclose', 'extpfeil', 'html', 'mhchem', 'unicode', 'verb'];

const TEX_OPTIONS = {
    packages: [...BASE_PACKAGES, ...AUTOLOADED],
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
};

const DELIMS = /\$|\\\(|\\\[/;

const adaptor = liteAdaptor();
AssistiveMmlHandler(RegisterHTMLHandler(adaptor));

/*
 * The browser measures the font around each formula (its size and x-height), and the x-height
 * sets the smallest size of second-level scripts (MathJax keeps them at 8 px at least): fraction
 * exponents, root indices. The lite DOM cannot measure, so it is given the values the browser
 * measures on this site (desktop, 1280 px wide; tools/mathjax/README.md says how to re-measure
 * them after a change of fonts or sizes in assets/css/style.css). The nearest listed element
 * around a formula decides. Phones (15 px text) differ by a fraction of a pixel in those
 * scripts, as they already did between devices.
 */
const METRICS = [
    { match: (tag, cls) => cls.includes('solution-tag') || cls.includes('hint-tag'), em: 12.6, ex: 6.167 },
    { match: (tag) => tag === 'th', em: 13.3, ex: 6.5 },
    { match: (tag) => tag === 'em', em: 11.9, ex: 6.383 },
    { match: (tag) => tag === 'summary', em: 14, ex: 6.85 },
];
const TEXT = { em: 14, ex: 7.5 };

function metricsFor(node) {
    for (let n = node; n && n.kind && n.kind !== '#document'; n = n.parent) {
        const tag = String(n.kind).toLowerCase();
        const cls = ((n.attributes && n.attributes.class) || '').split(/\s+/);
        const m = METRICS.find((r) => r.match(tag, cls));
        if (m) return m;
    }
    return TEXT;
}
/** Typesets one HTML page; returns the new HTML, or null when it has no maths. */
export function prerenderPage(html) {
    if (!DELIMS.test(html)) return null;
    // A fresh TeX per page: \newcommand and \def apply within a page, as in the browser
    const svg = new SVG({ fontCache: 'global' });
    // What the browser would measure around each formula (see METRICS); the container width
    // stays "unlimited", as the lite DOM reports it (no line breaking in MathJax 3)
    svg.measureMetrics = (node) => {
        const { em, ex } = metricsFor(node);
        return { em, ex, containerWidth: 1000000, lineWidth: 1000000, scale: 1, family: '' };
    };
    const doc = mathjax.document(html, {
        InputJax: new TeX(TEX_OPTIONS),
        OutputJax: svg,
    });
    doc.render();
    const count = Array.from(doc.math).length;
    if (count === 0) return null;
    const head = adaptor.head(doc.document);
    const style = adaptor.node('style', { id: 'MJX-SVG-styles' }, [adaptor.text(adaptor.textContent(doc.outputJax.styleSheet(doc)))]);
    adaptor.append(head, style);
    adaptor.setAttribute(adaptor.root(doc.document), 'data-mathjax', 'prerendered');
    return { html: adaptor.doctype(doc.document) + adaptor.outerHTML(adaptor.root(doc.document)), count };
}

function* htmlFiles(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) yield* htmlFiles(p);
        else if (name.endsWith('.html')) yield p;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const root = args.find((a) => !a.startsWith('--')) || '_site';
    const check = args.includes('--check');
    const t0 = Date.now();
    let pages = 0, formulas = 0, errors = 0;
    for (const file of htmlFiles(root)) {
        let res;
        try {
            res = prerenderPage(readFileSync(file, 'utf8'));
        } catch (e) {
            errors++;
            console.error(`${relative(root, file)}: ${e.message}`);
            continue;
        }
        if (!res) continue;
        pages++;
        formulas += res.count;
        if (!check) writeFileSync(file, res.html);
    }
    console.log(`MathJax: ${formulas} formulas in ${pages} pages${check ? ' (check only)' : ''}, ${errors} errors, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    if (errors) process.exitCode = 1;
}
