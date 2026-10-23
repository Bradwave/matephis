/**
 * Matephis Playground
 *
 * JSON editor with a live preview for ```physics and ```matephis blocks.
 * Re-renders shortly after each edit, shows JSON errors with their line, and
 * copies the finished block (with its fence) for a note. Drafts are kept per
 * engine in localStorage when the browser allows it.
 */
(function () {
    var EXAMPLES = {
        physics: {
            'Griglia e assi': {
                xlim: [-1, 9], ylim: [-1, 4], grid: true, axes: { labels: ['x (m)', 'y (m)'], numbers: true },
                objects: [
                    { id: 'A', type: 'particle', at: [2, 1], label: 'A' },
                    { id: 'B', type: 'particle', at: ['A.x + 4', 'A.y + 1.5'], label: 'B', color: 'blue' },
                    { type: 'label', at: { from: 'B', offset: [0, 0.7] }, text: 'B = A + (4 m, 1.5 m)' }
                ]
            },
            'Angolo in gradi (slider)': {
                xlim: [-3, 3], ylim: [-3, 3], aspectRatio: '1:1', grid: true, axes: true,
                params: { alpha: { min: 0, max: 360, step: 5, val: 30, unit: 'deg' }, R: { min: 0.5, max: 2.5, step: 0.1, val: 2, unit: 'm' } },
                objects: [
                    { id: 'P', type: 'particle', at: ['R*cos(alpha)', 'R*sin(alpha)'], label: 'P' },
                    { type: 'label', at: [0, -2.6], text: '$x = R\\cos\\alpha$, $y = R\\sin\\alpha$' }
                ]
            },
            'Moto (animate)': {
                xlim: [0, 10], ylim: [0, 5], grid: true, axes: true, animate: ['t'],
                params: { t: { min: 0, max: 1.4, step: 0.01, val: 0, unit: 's', loop: 'bounce' }, v0: { min: 5, max: 12, val: 9, unit: 'm/s' }, a: { min: 10, max: 80, val: 45, unit: 'deg' } },
                objects: [
                    { id: 'B', type: 'particle', at: ['v0*cos(a)*t', 'v0*sin(a)*t - g*t^2/2'], radius: 7, show: 'v0*sin(a)*t - g*t^2/2 >= 0' }
                ]
            },
            'Piano inclinato': {
                xlim: [0, 9], ylim: [0, 5], forceScale: 0.11,
                objects: [
                    { type: 'ground', y: 0.3 },
                    { id: 's', type: 'slope', at: [0.4, 0.3], angle: 30, length: 8.6 },
                    { id: 'A', type: 'block', on: 's', pos: 0.5, size: [1.6, 0.9] },
                    { id: 'P', type: 'force', on: 'A', dir: 'down', mag: 20, label: '\\vec P' },
                    { type: 'force', on: 'A', dir: 'normal', mag: '20*cos(30°)', label: '\\vec N' },
                    { type: 'decompose', vector: 'P', frame: 's', showAngle: 'y', angleLabel: '\\alpha' },
                    { type: 'angle', of: 's', label: '\\alpha' }
                ]
            },
            'Tavolo e carrucola': {
                xlim: [0, 7], ylim: [0, 4],
                objects: [
                    { type: 'ground', y: 0.2 },
                    { id: 't', type: 'table', at: [0.5, 2.5], width: 4.5, height: 2.3 },
                    { id: 'A', type: 'block', on: 't', pos: 0.45, size: [1, 0.6], label: '$m_1$' },
                    { id: 'p', type: 'pulley', at: { from: 't.edge', offset: [0.3, 0] }, radius: 0.3, hangFrom: 't.edge' },
                    { id: 'B', type: 'block', at: [5.6, 1.5], size: [0.6, 0.6], label: '$m_2$' },
                    { id: 'rope', type: 'rope', from: 'A.right', to: 'B.top', over: ['p'] },
                    { type: 'force', on: 'A', at: 'A.right', dir: 'along:rope', mag: 8, label: '\\vec T' },
                    { type: 'force', on: 'B', at: 'B.top', dir: 'along:rope', mag: 8, label: '\\vec T' }
                ]
            },
            'Forze automatiche e pulsanti': {
                xlim: [0, 9], ylim: [0, 5], forceScale: 0.09,
                params: { u: { min: 0.25, max: 0.85, step: 0.01, val: 0.5, label: 'posizione' }, alpha: { min: 10, max: 40, val: 25, unit: 'deg', label: 'α' } },
                controls: [
                    { type: 'reveal', label: 'Mostra forze', targets: ['A.*'] },
                    { type: 'reveal', label: 'Mostra risultante', targets: ['R'] }
                ],
                objects: [
                    { type: 'ground', y: 0.3 },
                    { id: 's', type: 'slope', at: [0.4, 0.3], angle: 'alpha', length: 7.2 },
                    { id: 'A', type: 'block', on: 's', pos: 'u', size: [1.4, 0.8], mass: 2, mu: 0.6, forces: 'auto', override: { '*': { hidden: true } }, drag: 'u' },
                    { id: 'R', type: 'resultant', on: 'A', hidden: true },
                    { type: 'fbd', of: 'A', label: 'Corpo libero' }
                ]
            },
            'Avvisi': {
                xlin: [0, 10], graphs: [],
                objects: [{ type: 'partcle', at: [1, 1] }, { type: 'trace', of: 'A' }, { id: 'A', type: 'block', at: [3, 1] }, { type: 'label', at: 'A.tpo', text: '?' }, { type: 'particle', at: [5, 2], raduis: 4 }]
            }
        },
        matephis: {
            'Seno in gradi': {
                xlim: [0, 360], ylim: [-1.5, 1.5], aspectRatio: '2:1', xStep: 30,
                params: { phi: { min: 0, max: 360, step: 5, val: 0, unit: 'deg' } },
                data: [{ fn: 'sin(x° + phi)', label: 'sin(x° + φ)' }]
            }
        }
    };

    var root = document.getElementById('playground');
    if (!root) return;
    var engineSel = document.getElementById('pg-engine');
    var exampleSel = document.getElementById('pg-example');
    var source = document.getElementById('pg-source');
    var preview = document.getElementById('pg-preview');
    var status = document.getElementById('pg-status');
    var copyBtn = document.getElementById('pg-copy');
    var instance = null;
    var timer = null;

    function store(key, value) {
        try {
            if (value === undefined) return window.localStorage.getItem(key);
            window.localStorage.setItem(key, value);
        } catch (e) { /* private mode, blocked storage */ }
        return null;
    }

    function setStatus(text, isError) {
        status.textContent = text;
        status.classList.toggle('error', !!isError);
    }

    /** "Unexpected token } in JSON at position 42" -> "riga 3, colonna 7". */
    function jsonErrorPlace(text, err) {
        var m = /position (\d+)/.exec(err.message);
        if (!m || /line \d+/.test(err.message)) return '';
        var pos = Math.min(+m[1], text.length);
        var before = text.slice(0, pos).split('\n');
        return ' (riga ' + before.length + ', colonna ' + (before[before.length - 1].length + 1) + ')';
    }

    function render() {
        var text = source.value;
        var engine = engineSel.value;
        store('matephis-playground-' + engine, text);
        var cfg;
        try {
            cfg = JSON.parse(text);
        } catch (e) {
            setStatus('JSON non valido' + jsonErrorPlace(text, e) + ': ' + e.message, true);
            return;
        }
        if (instance && instance.destroy) instance.destroy();
        instance = null;
        preview.innerHTML = '';
        var host = document.createElement('div');
        preview.appendChild(host);
        try {
            if (engine === 'physics') instance = window.MatephisPhysics.render(host, cfg, { noLightbox: true });
            else instance = window.MatephisPlot.render(host, cfg, { noLightbox: true });
            var n = instance && instance.warnings ? instance.warnings.length : 0;
            setStatus(n ? n + (n === 1 ? ' avviso' : ' avvisi') + ' (sotto il diagramma)' : 'OK', false);
        } catch (e) {
            setStatus('Errore: ' + e.message, true);
        }
    }

    function scheduleRender() {
        clearTimeout(timer);
        timer = setTimeout(render, 300);
    }

    function fillExamples() {
        exampleSel.innerHTML = '<option value="">—</option>';
        Object.keys(EXAMPLES[engineSel.value]).forEach(function (name) {
            var o = document.createElement('option');
            o.value = name;
            o.textContent = name;
            exampleSel.appendChild(o);
        });
    }

    /** JSON with two-space indent, but arrays of plain values on one line: [0, 10]. */
    function pretty(value) {
        return JSON.stringify(value, null, 2).replace(/\[\s*([^\[\]{}]*?)\s*\]/g, function (m, inner) {
            return '[' + inner.split(/,\s*/).join(', ') + ']';
        });
    }

    function loadExample(name) {
        var ex = EXAMPLES[engineSel.value][name];
        if (!ex) return;
        source.value = pretty(ex);
        render();
    }

    function loadEngine() {
        fillExamples();
        var saved = store('matephis-playground-' + engineSel.value);
        if (saved) {
            source.value = saved;
            render();
        } else {
            loadExample(Object.keys(EXAMPLES[engineSel.value])[0]);
        }
    }

    engineSel.addEventListener('change', function () {
        store('matephis-playground-engine', engineSel.value);
        loadEngine();
    });
    exampleSel.addEventListener('change', function () {
        loadExample(exampleSel.value);
        exampleSel.value = '';
    });
    source.addEventListener('input', scheduleRender);
    source.addEventListener('keydown', function (e) {
        // Tab inserts two spaces instead of leaving the editor
        if (e.key !== 'Tab' || e.shiftKey) return;
        e.preventDefault();
        var s = source.selectionStart, end = source.selectionEnd;
        source.value = source.value.slice(0, s) + '  ' + source.value.slice(end);
        source.selectionStart = source.selectionEnd = s + 2;
        scheduleRender();
    });
    copyBtn.addEventListener('click', function () {
        var block = '```' + engineSel.value + '\n' + source.value.trim() + '\n```\n';
        var done = function () { setStatus('Blocco copiato', false); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(block).then(done, function () { setStatus('Copia non riuscita', true); });
        } else {
            source.select();
            document.execCommand('copy');
            done();
        }
    });

    var start = function () {
        var savedEngine = store('matephis-playground-engine');
        if (savedEngine && EXAMPLES[savedEngine]) engineSel.value = savedEngine;
        loadEngine();
    };
    // Like the libraries: render once MathJax is ready, so "$...$" labels are typeset
    var whenReady = function () {
        var started = Date.now();
        var check = function () {
            var mj = window.MathJax;
            if (!document.getElementById('MathJax-script') || (mj && mj.tex2svg) || Date.now() - started > 8000) { start(); return; }
            if (mj && mj.startup && mj.startup.promise) { mj.startup.promise.then(start, start); return; }
            setTimeout(check, 50);
        };
        check();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', whenReady);
    else whenReady();
})();
