import { describe, it, expect } from 'vitest';
import {
    normalizeManifest,
    normalizeSearchData,
    extractTopicsFromManifest,
    parseExerciseQuery,
    findMatchingNotes,
    rewriteRelativeUrl,
    extractExercisesFromHtml,
} from '../assets/js/matephis-board-src/ui/exercise-picker.js';
import {
    WIDGET_PRESETS,
    ENGINE_STARTER_CONFIGS,
    createQuickPlotConfig,
    splitFunctionList,
} from '../assets/js/matephis-board-src/ui/widgets.js';

import { validateConfig as validatePlotConfig, createPalettes } from '../assets/js/matephis-plot-src/core/config.js';
import { validateConfig as validatePhysicsConfig } from '../assets/js/matephis-physics-src/core/config.js';
import { expandScene } from '../assets/js/matephis-physics-src/core/presets.js';
import { OBJECT_TYPES } from '../assets/js/matephis-physics-src/objects/index.js';
import { validateConfig as validateSetsConfig } from '../assets/js/matephis-sets-src/core/config.js';
import { SetsModel } from '../assets/js/matephis-sets-src/core/model.js';
import { ExpressionCompiler } from '../assets/js/matephis-plot-src/parser/expression-parser.js';

const SAMPLE_MANIFEST = [
    { title: 'Esercizi di dinamica', slug: 'esercizi-dinamica', url: '/notes/esercizi-dinamica', tags: ['esercizi', 'dinamica'] },
    { title: 'Esercizi sui limiti', slug: 'esercizi-limiti', url: '/notes/esercizi-limiti', tags: ['esercizi', 'limiti'] },
    { title: 'Esercizi sui circuiti', slug: 'esercizi-circuiti', url: '/notes/esercizi-circuiti', tags: ['elettrodinamica', 'circuiti'] },
    { title: 'Esercizi di elettrostatica (campo)', slug: 'esercizi-elettrostatica-2', url: '/notes/esercizi-elettrostatica-2', tags: ['esercizi'] },
    { title: 'Scala di difficoltà degli esercizi', slug: 'scala-difficolta', url: '/notes/scala-difficoltà', tags: ['esercizi'] },
    { title: 'Soluzioni degli esercizi di dinamica', slug: 'soluzioni-dinamica', url: '/notes/soluzioni-dinamica', tags: ['dinamica'] },
    { title: 'Facsimile di una prova di verifica di dinamica', slug: 'facsimile-dinamica', url: '/notes/facsimile-dinamica', tags: ['esercizi'] },
];

const SAMPLE_SEARCH_DATA = {
    '0': {
        doc: 'Esercizi di dinamica',
        title: 'Esercizi di dinamica',
        content: 'Quesiti | 4. Cruise control a 70 km/h | forza centripeta lungo la curva',
        url: '/notes/esercizi-dinamica',
    },
    '1': {
        doc: 'Esercizi sui limiti',
        title: 'Esercizi sui limiti',
        content: 'Calcola i seguenti limiti con forme di indecisione',
        url: '/notes/esercizi-limiti',
    },
};

describe('Exercise Picker — manifest filtering & smart query parsing', () => {
    it('filters out helper pages (scala-difficoltà, soluzioni-, facsimile-) from manifest', () => {
        const cleaned = normalizeManifest({ exercises: SAMPLE_MANIFEST });
        const slugs = cleaned.map((e) => e.slug);
        expect(slugs).toEqual([
            'esercizi-dinamica',
            'esercizi-limiti',
            'esercizi-circuiti',
            'esercizi-elettrostatica-2',
        ]);
    });

    it('enriches topic chips dynamically from manifest while keeping defaults', () => {
        const manifest = normalizeManifest(SAMPLE_MANIFEST);
        const topics = extractTopicsFromManifest(manifest);
        const labels = topics.map((t) => t.label);
        expect(labels).toContain('Dinamica');
        expect(labels).toContain('Limiti');
        expect(labels).toContain('Elettrostatica');
        expect(labels).toContain('Onde');
        expect(labels).toContain('Ottica');
        expect(labels.some((l) => l.toLowerCase().includes('elettrodinamica') || l.toLowerCase().includes('circuiti'))).toBe(true);
    });

    it('parses smart queries: "dinamica quesiti 4", "limiti 2.7", "elettrostatica 2 quiz 3", and keyword search', () => {
        const manifest = normalizeManifest(SAMPLE_MANIFEST);

        const q1 = parseExerciseQuery('dinamica quesiti 4', manifest);
        expect(q1.topic).toBe('dinamica');
        expect(q1.section).toBe('quesiti');
        expect(q1.itemNumber).toBe(4);
        expect(q1.subItemNumber).toBeNull();

        const q2 = parseExerciseQuery('limiti 2.7', manifest);
        expect(q2.topic).toBe('limiti');
        expect(q2.section).toBeNull();
        expect(q2.itemNumber).toBe(2);
        expect(q2.subItemNumber).toBe(7);

        const q3 = parseExerciseQuery('elettrostatica 2 quiz 3', manifest);
        expect(q3.topic).toBe('elettrostatica');
        expect(q3.section).toBe('quiz');
        expect(q3.itemNumber).toBe(3);

        const q4 = parseExerciseQuery('forza centripeta', manifest);
        expect(q4.itemNumber).toBeNull();
        expect(q4.keywords).toEqual(['forza', 'centripeta']);

        const search = normalizeSearchData(SAMPLE_SEARCH_DATA);
        const notes = findMatchingNotes(manifest, q4, search);
        expect(notes[0].url).toBe('/notes/esercizi-dinamica');
        expect(notes[0].snippet).toContain('centripeta');
    });
});

describe('Exercise Picker — HTML extraction & URL rewriting (pure Node)', () => {
    const NOTE_HTML = `
        <html><body><main>
            <h1>Esercizi sui limiti</h1>
            <div class="content">
                <h2>Quesiti</h2>
                <ol>
                    <li><span class="difficulty-tag diff-ee">EE</span> Primo quesito.</li>
                    <li>
                        <span class="difficulty-tag diff-ee">EE/F</span> Calcola i seguenti limiti:
                        <ol>
                            <li>Sub 1</li><li>Sub 2</li><li>Sub 3</li><li>Sub 4</li><li>Sub 5</li><li>Sub 6</li>
                            <li>$\\lim_{x \\to +\\infty} \\frac{x^2}{2x^4}$ <span class="solution-tag">Soluzione: <span class="solution-text" tabindex="0">$0$</span></span></li>
                        </ol>
                    </li>
                </ol>
                <h3>Grafici</h3>
                <ol start="5">
                    <li><img src="../../images/limiti-10.svg" alt="limiti-10" /></li>
                    <li>Quesito numero sei con suggerimento <span class="solution-tag hint-tag">Suggerimento: <span class="solution-text hint-text" tabindex="0">Usa Hopital</span></span></li>
                </ol>
                <h2>Quiz</h2>
                <ol>
                    <li>Un quiz <details class="details" open><summary>Soluzione</summary><div class="details-content">(a)</div></details></li>
                </ol>
                <h2>Problemi</h2>
                <p><strong>Decrescita infelice <span class="difficulty-tag diff-ee">EE</span></strong> Popolazione $p(t)$.</p>
                <ol><li>Quanto vale $p(0)$?</li></ol>
                <p><strong>Il bosco incantato <span class="difficulty-tag diff-pd">PD-</span></strong> Sentiero frattale.</p>
                <p><img src="../../images/limiti-13.jpg" alt="limiti-13" /></p>
                <ol><li>Quanta strada?</li></ol>
            </div>
        </main></body></html>
    `;

    it('extracts nested <ol> sub-item 2.7 with parent stem and detects solution markup', () => {
        const res = extractExercisesFromHtml(NOTE_HTML, {
            noteUrl: '/notes/esercizi-limiti',
            itemNumber: 2,
            subItemNumber: 7,
        });
        expect(res.noteTitle).toBe('Esercizi sui limiti');
        expect(res.match).not.toBeNull();
        expect(res.match.itemNumber).toBe(2);
        expect(res.match.subItemNumber).toBe(7);
        expect(res.match.label).toBe('#2.7');
        expect(res.match.hasSolution).toBe(true);
        expect(res.match.html).toContain('Calcola i seguenti limiti');
        expect(res.match.html).toContain('2.7)');
        expect(res.match.html).toContain('solution-text');
    });

    it('respects <ol start="5"> and rewrites relative <img src> URLs', () => {
        const res = extractExercisesFromHtml(NOTE_HTML, {
            noteUrl: '/notes/esercizi-limiti',
            section: 'quesiti',
            itemNumber: 5,
        });
        expect(res.match.itemNumber).toBe(5);
        expect(res.match.html).toContain('src="/images/limiti-10.svg"');
        expect(res.match.html).not.toContain('../../images');

        const res6 = extractExercisesFromHtml(NOTE_HTML, {
            noteUrl: '/notes/esercizi-limiti',
            section: 'quesiti',
            itemNumber: 6,
        });
        expect(res6.match.itemNumber).toBe(6);
        expect(res6.match.hasSolution).toBe(true);

        expect(rewriteRelativeUrl('../../images/limiti-1.svg', '/notes/esercizi-limiti')).toBe('/images/limiti-1.svg');
        expect(rewriteRelativeUrl('../../images/limiti-1.svg', '/sub/notes/esercizi-limiti', '/sub')).toBe('/sub/images/limiti-1.svg');
        expect(rewriteRelativeUrl('https://cdn.example.com/a.png', '/notes/x')).toBe('https://cdn.example.com/a.png');
    });

    it('strips open attribute from <details> and extracts unnumbered Problemi blocks with rewritten images', () => {
        const quiz = extractExercisesFromHtml(NOTE_HTML, {
            noteUrl: '/notes/esercizi-limiti',
            section: 'quiz',
            itemNumber: 1,
        });
        expect(quiz.match.hasSolution).toBe(true);
        expect(quiz.match.html).not.toMatch(/\sopen\b/);

        const prob2 = extractExercisesFromHtml(NOTE_HTML, {
            noteUrl: '/notes/esercizi-limiti',
            section: 'problemi',
            itemNumber: 2,
        });
        expect(prob2.match).not.toBeNull();
        expect(prob2.match.sectionKey).toBe('problemi');
        expect(prob2.match.html).toContain('Il bosco incantato');
        expect(prob2.match.html).toContain('src="/images/limiti-13.jpg"');
        expect(prob2.match.html).toContain('Quanta strada?');
    });

    it('supports an injected DOMParser implementation when provided', () => {
        let called = false;
        class FakeParser {
            parseFromString(html) {
                called = true;
                return {
                    querySelector: (sel) => (sel === 'h1' ? { textContent: 'Injected Note' } : null),
                    body: {
                        children: [
                            {
                                tagName: 'H2',
                                textContent: 'Quesiti',
                                children: [],
                            },
                            {
                                tagName: 'OL',
                                getAttribute: () => null,
                                children: [
                                    {
                                        tagName: 'LI',
                                        textContent: 'Esercizio test',
                                        innerHTML: 'Esercizio test',
                                        childNodes: [],
                                        children: [],
                                        querySelector: () => null,
                                        querySelectorAll: () => [],
                                        cloneNode() { return this; },
                                    },
                                ],
                            },
                        ],
                    },
                };
            }
        }

        const res = extractExercisesFromHtml('<p>ignored</p>', { DOMParserImpl: FakeParser });
        expect(called).toBe(true);
        expect(res.noteTitle).toBe('Injected Note');
        expect(res.match.text).toBe('Esercizio test');
    });

    it('handles non-Array HTMLCollection-like children without .filter/.map on nested <ol> extraction (2.7)', () => {
        function htmlCollectionOf(arr) {
            const col = {
                length: arr.length,
                [Symbol.iterator]: function* () {
                    for (let i = 0; i < arr.length; i++) yield arr[i];
                },
            };
            for (let i = 0; i < arr.length; i++) col[i] = arr[i];
            // Explicitly lacks .filter / .map / .find like browser HTMLCollection
            return col;
        }

        function makeDomNode(tagName, { text = '', html = '', attrs = {}, childNodes = [], children = [] } = {}) {
            const node = {
                nodeType: 1,
                tagName: tagName.toUpperCase(),
                textContent: text,
                innerHTML: html,
                outerHTML: `<${tagName.toLowerCase()}>${html || text}</${tagName.toLowerCase()}>`,
                childNodes: htmlCollectionOf(childNodes),
                children: htmlCollectionOf(children),
                getAttribute: (k) => (Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null),
                setAttribute: (k, v) => { attrs[k] = String(v); },
                removeAttribute: (k) => { delete attrs[k]; },
                querySelector: () => null,
                querySelectorAll: () => htmlCollectionOf([]),
                cloneNode() { return node; },
            };
            return node;
        }

        const subLis = Array.from({ length: 7 }, (_, idx) => makeDomNode('li', {
            text: `Sub ${idx + 1}`,
            html: idx === 6 ? 'Limite 2.7' : `Sub ${idx + 1}`,
        }));
        const nestedOl = makeDomNode('ol', {
            text: subLis.map((n) => n.textContent).join(' '),
            children: subLis,
            childNodes: subLis,
        });
        const stemText = { nodeType: 3, data: 'Calcola i seguenti limiti:', textContent: 'Calcola i seguenti limiti:' };
        const li1 = makeDomNode('li', { text: 'Primo', html: 'Primo' });
        const li2 = makeDomNode('li', {
            text: 'Calcola i seguenti limiti: Limite 2.7',
            html: 'Calcola i seguenti limiti:<ol>...</ol>',
            childNodes: [stemText, nestedOl],
            children: [nestedOl],
        });
        const topOl = makeDomNode('ol', { children: [li1, li2], childNodes: [li1, li2] });
        const h2 = makeDomNode('h2', { text: 'Quesiti' });
        const body = makeDomNode('body', { children: [h2, topOl], childNodes: [h2, topOl] });

        class BrowserLikeParser {
            parseFromString() {
                return {
                    querySelector: (sel) => (sel === 'h1' ? { textContent: 'Esercizi sui limiti' } : null),
                    body,
                };
            }
        }

        const res = extractExercisesFromHtml('<html></html>', {
            noteUrl: '/notes/esercizi-limiti',
            itemNumber: 2,
            subItemNumber: 7,
            DOMParserImpl: BrowserLikeParser,
        });
        expect(res.match).not.toBeNull();
        expect(res.match.itemNumber).toBe(2);
        expect(res.match.subItemNumber).toBe(7);
        expect(res.match.label).toBe('#2.7');
        expect(res.match.html).toContain('Calcola i seguenti limiti:');
        expect(res.match.html).toContain('2.7)');
        expect(res.match.html).toContain('Limite 2.7');
    });
});

describe('Matephis Widgets — preset JSON & quick plot config validation (zero engine warnings)', () => {
    it('builds valid MatephisPlot configs with zero warnings', () => {
        expect(splitFunctionList('sin(x), max(x, 0); x^2 - 2*x')).toEqual(['sin(x)', 'max(x, 0)', 'x^2 - 2*x']);
        const cfg = createQuickPlotConfig({ xMin: -5, xMax: 5, yMin: -4, yMax: 4, fnText: 'sin(x), x^2 - 2*x' });
        const warnings = validatePlotConfig(cfg, createPalettes(false));
        expect(warnings).toEqual([]);

        const emptyAxes = createQuickPlotConfig({ xMin: -3, xMax: 3, yMin: -2, yMax: 2, fnText: '' });
        expect(emptyAxes.data).toEqual([]);
        expect(validatePlotConfig(emptyAxes, createPalettes(false))).toEqual([]);
        expect(validatePlotConfig(ENGINE_STARTER_CONFIGS.plot, createPalettes(false))).toEqual([]);
    });

    it('validates Piano inclinato and Forze physics presets with zero warnings', () => {
        for (const key of ['piano-inclinato', 'forze']) {
            const preset = WIDGET_PRESETS[key];
            expect(preset.kind).toBe('physics');
            const expandWarnings = [];
            const expanded = expandScene(JSON.parse(JSON.stringify(preset.data)), {}, (m) => expandWarnings.push(m));
            expect(expandWarnings).toEqual([]);
            const warnings = validatePhysicsConfig(expanded, OBJECT_TYPES);
            expect(warnings).toEqual([]);
        }
    });

    it('validates Venn sets preset using supported schema (no unimplemented "venn" key) with zero warnings', () => {
        const preset = WIDGET_PRESETS.venn;
        expect(preset.kind).toBe('sets');
        expect(preset.data.venn).toBeUndefined();
        expect(validateSetsConfig(preset.data)).toEqual([]);

        const warnings = [];
        const compiler = new ExpressionCompiler({ getParams: () => ({}), getPoints: () => ({}), paramNames: [] });
        new SetsModel(preset.data, {
            evaluate: (v) => (typeof v === 'number' ? v : compiler.eval(String(v))),
            compile: (src, vars) => compiler.fn(src, vars),
            warn: (m) => warnings.push(m),
        });
        expect(warnings).toEqual([]);
    });

    it('validates Circuito RC preset JSON structure for MatephisCircuit._render(el, JSON.stringify(cfg))', () => {
        const rc = WIDGET_PRESETS['circuito-rc'];
        expect(rc.kind).toBe('circuit');
        expect(rc.data.cssWidth).toBe('100%');
        expect(Array.isArray(rc.data.segments)).toBe(true);
        const serialized = JSON.stringify(rc.data);
        expect(typeof serialized).toBe('string');
        const roundTrip = JSON.parse(serialized);
        expect(roundTrip.segments.some((s) => (s.components || []).some((c) => c.type === 'switch'))).toBe(true);
        expect(roundTrip.segments.some((s) => (s.components || []).some((c) => c.type === 'capacitor'))).toBe(true);
        expect(roundTrip.segments.some((s) => (s.components || []).some((c) => c.type === 'resistor'))).toBe(true);
    });
});

describe('Exercise sheet catalog', () => {
    it('joins the curated subjects with the manifest and keeps unlisted notes under Altro', async () => {
        const { buildExerciseCatalog, shortNoteTitle } = await import('../assets/js/matephis-board-src/ui/exercise-picker.js');
        const manifest = [
            { slug: 'esercizi-limiti', title: 'Esercizi sui limiti', url: '/notes/esercizi-limiti' },
            { slug: 'esercizi-onde', title: 'Esercizi sulle onde', url: '/notes/esercizi-onde' },
            { slug: 'esercizi-nuovi', title: 'Esercizi nuovi', url: '/notes/esercizi-nuovi' },
        ];
        const raw = [
            { subject: 'Matematica', topics: [{ label: 'Limiti', notes: ['esercizi-limiti', 'manca'] }, { label: 'Vuoto', notes: ['manca'] }] },
            { subject: 'Fisica', topics: [{ label: 'Onde', notes: ['esercizi-onde'] }] },
        ];
        const cat = buildExerciseCatalog(raw, manifest);
        expect(cat.map((s) => s.subject)).toEqual(['Matematica', 'Fisica', 'Altro']);
        expect(cat[0].topics.map((t) => t.label)).toEqual(['Limiti']);
        expect(cat[0].topics[0].notes.map((n) => n.slug)).toEqual(['esercizi-limiti']);
        expect(cat[2].topics[0].notes.map((n) => n.slug)).toEqual(['esercizi-nuovi']);
        expect(shortNoteTitle('Esercizi sulle disequazioni')).toBe('Disequazioni');
        expect(shortNoteTitle('Esercizi guidati sul completamento del quadrato')).toBe('Completamento del quadrato');
        expect(shortNoteTitle('Domande di elettrostatica')).toBe('Domande di elettrostatica');
        expect(shortNoteTitle('Esercizi introduttivi sulle funzioni')).toBe('Funzioni');
    });
});

describe('Pre-rendered MathJax in board exercises', () => {
    it('inlines #MJX-SVG-global-cache glyphs into extracted items, sub-items, and Problemi without duplicate IDs', async () => {
        const { prerenderPage } = await import('../tools/mathjax/prerender.mjs');
        const rawHtml = `<!DOCTYPE html><html lang="it"><head></head><body><main>
            <h1>Esercizi sui limiti</h1>
            <div class="content">
                <h2>Quesiti</h2>
                <ol>
                    <li>Calcola $\\lim_{x \\to 0} \\frac{\\sin x}{x}$ e $x^2 + 1$.</li>
                    <li>
                        Calcola i limiti:
                        <ol>
                            <li>$\\lim_{x \\to +\\infty} \\frac{x^2}{2x^4}$</li>
                        </ol>
                    </li>
                </ol>
                <h2>Problemi</h2>
                <p><strong>Problema test <span class="difficulty-tag diff-ee">EE</span></strong> Dato $F_P = mg$, trova $a$.</p>
                <ol><li>Calcola $F_P$.</li></ol>
            </div>
        </main></body></html>`;

        const pre = prerenderPage(rawHtml);
        expect(pre).not.toBeNull();
        expect(pre.html).toContain('id="MJX-SVG-global-cache"');
        expect(pre.html).toContain('<use ');

        const res = extractExercisesFromHtml(pre.html, {
            noteUrl: '/notes/esercizi-limiti',
            itemNumber: 1,
        });
        expect(res.match).not.toBeNull();
        expect(res.match.html).toContain('<mjx-container');
        expect(res.match.html).toContain('<path ');
        expect(res.match.html).not.toContain('<use ');
        expect(res.match.html).not.toContain('xlink:href="#MJX-');
        expect(res.match.html).not.toContain('id="MJX-');
        // Preserves data-c (for stroke-width: 3) and glyph transforms (e.g. "lim", "sin")
        expect(res.match.html).toContain('data-c=');
        expect(res.match.html).toContain('transform="translate(');

        // Nested sub-item 2.1 also has self-contained <path> glyphs
        const sub = extractExercisesFromHtml(pre.html, {
            noteUrl: '/notes/esercizi-limiti',
            itemNumber: 2,
            subItemNumber: 1,
        });
        expect(sub.match.html).toContain('<path ');
        expect(sub.match.html).not.toContain('<use ');

        // Unnumbered Problemi block also has self-contained <path> glyphs
        const prob = extractExercisesFromHtml(pre.html, {
            noteUrl: '/notes/esercizi-limiti',
            section: 'problemi',
            itemNumber: 1,
        });
        expect(prob.match.html).toContain('<path ');
        expect(prob.match.html).not.toContain('<use ');
    });

    it('detects raw TeX vs pre-rendered math and serializes concurrent EngineLoader.typeset() calls', async () => {
        const {
            EngineLoader,
            elementNeedsMathJax,
            htmlNeedsMathJax,
        } = await import('../assets/js/matephis-board-src/ui/engine-loader.js');
        const { parseMiniHtml } = await import('../assets/js/matephis-board-src/ui/exercise-picker.js');

        const preHtml = '<div class="board-ex-item">Testo <mjx-container class="MathJax" jax="SVG"><svg><path data-c="78" d="M0 0"></path></svg><mjx-assistive-mml>$x$</mjx-assistive-mml></mjx-container> fine.</div>';
        const rawHtml = '<div class="board-ex-item">Calcola $x^2 + 1$.</div>';

        expect(htmlNeedsMathJax(preHtml)).toBe(false);
        expect(htmlNeedsMathJax(rawHtml)).toBe(true);
        expect(elementNeedsMathJax(parseMiniHtml(preHtml).body)).toBe(false);
        expect(elementNeedsMathJax(parseMiniHtml(rawHtml).body)).toBe(true);

        // Pre-rendered exercise skips loading MathJax; raw TeX serializes typesetPromise calls
        const prevWindow = globalThis.window;
        const order = [];
        let loadCalls = 0;
        let releaseFirst;
        try {
            let callNum = 0;
            globalThis.window = {
                MathJax: {
                    startup: { promise: Promise.resolve() },
                    typesetPromise: (els) => {
                        const n = ++callNum;
                        order.push(`start-${n}`);
                        if (n === 1) {
                            return new Promise((r) => {
                                releaseFirst = () => { order.push(`end-${n}`); r(); };
                            });
                        }
                        order.push(`end-${n}`);
                        return Promise.resolve(els);
                    },
                },
            };
            const loader = new EngineLoader('');
            const origLoad = loader.loadMathJax.bind(loader);
            loader.loadMathJax = () => { loadCalls++; return origLoad(); };

            // Pre-rendered node must not trigger MathJax
            await loader.typeset([parseMiniHtml(preHtml).body]);
            expect(loadCalls).toBe(0);
            expect(order).toEqual([]);

            // Two concurrent raw TeX typesets must run sequentially, never overlapping
            const p1 = loader.typeset([parseMiniHtml(rawHtml).body]);
            const p2 = loader.typeset([parseMiniHtml('<p>\\(y = 2\\)</p>').body]);
            await new Promise((r) => setTimeout(r, 0));
            expect(order).toEqual(['start-1']);
            releaseFirst();
            await Promise.all([p1, p2]);
            expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2']);
        } finally {
            globalThis.window = prevWindow;
        }
    });

    it('disambiguates duplicate item numbers across <h3> subsections with unique uid/parentUid and retries catalog after offline failure', async () => {
        const { ExercisePicker } = await import('../assets/js/matephis-board-src/ui/exercise-picker.js');
        const multiSubHtml = `<html><body><div class="content">
            <h2>Esercizi</h2>
            <h3>Dominio</h3>
            <ol>
                <li>Dom 1</li>
                <li>Dom 2:<ol><li>Dom 2.1</li><li>Dom 2.2</li></ol></li>
            </ol>
            <h3>Segno</h3>
            <ol>
                <li>Seg 1</li>
                <li>Seg 2:<ol><li>Seg 2.1</li></ol></li>
            </ol>
        </div></body></html>`;
        const parsed = extractExercisesFromHtml(multiSubHtml, { noteUrl: '/notes/esercizi-funzioni' });
        const parentsNamed2 = parsed.items.filter((it) => it.itemNumber === 2 && it.subItemNumber === null);
        expect(parentsNamed2).toHaveLength(2);
        expect(parentsNamed2[0].uid).not.toBe(parentsNamed2[1].uid);

        const domParts = parsed.items.filter((it) => it.parentUid === parentsNamed2[0].uid);
        const segParts = parsed.items.filter((it) => it.parentUid === parentsNamed2[1].uid);
        expect(domParts.map((p) => p.text)).toEqual(['Dom 2: Dom 2.1', 'Dom 2: Dom 2.2']);
        expect(segParts.map((p) => p.text)).toEqual(['Seg 2: Seg 2.1']);

        // Transient offline failure must not permanently lock ExercisePicker to []
        let online = false;
        const picker = new ExercisePicker({
            fetchImpl: async (url) => {
                if (!online) throw new Error('offline');
                if (url.includes('exercises-manifest')) {
                    return { ok: true, json: async () => [{ title: 'Esercizi sui limiti', slug: 'esercizi-limiti', url: '/notes/esercizi-limiti', tags: ['esercizi'] }] };
                }
                return { ok: true, json: async () => [{ subject: 'Matematica', topics: [{ label: 'Limiti', notes: ['esercizi-limiti'] }] }] };
            },
        });
        expect(await picker.loadCatalog()).toEqual([]);
        online = true;
        const recovered = await picker.loadCatalog();
        expect(recovered).toHaveLength(1);
        expect(recovered[0].subject).toBe('Matematica');
    });
});
