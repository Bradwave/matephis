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
