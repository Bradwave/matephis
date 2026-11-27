/**
 * Pieces of the board's plot editor that need no typing: window presets,
 * function templates whose coefficients become sliders, and an on-screen math keypad.
 */

import { BoardIcons } from './icons.js';

export const MAX_PLOT_FNS = 4;

/** Plot colour ids (matephis-plot "summer" palette) and their light-theme swatches. */
export const PLOT_PALETTE_IDS = ['summer1', 'summer2', 'summer7', 'summer6', 'summer3', 'summer5'];
export const PLOT_SWATCHES = ['#B01A00', '#2e4a9e', '#4ebf62', '#ff912a', '#257fbe', '#d1b854'];

const TWO_PI = Math.round(2 * Math.PI * 1000) / 1000;

export const PLOT_WINDOWS = [
    { label: '±5', view: { xMin: -5, xMax: 5, yMin: -4, yMax: 4 } },
    { label: '±10', view: { xMin: -10, xMax: 10, yMin: -8, yMax: 8 } },
    { label: '±20', view: { xMin: -20, xMax: 20, yMin: -15, yMax: 15 } },
    { label: '1° quadrante', view: { xMin: -1, xMax: 10, yMin: -1, yMax: 8 } },
    { label: 'Trigonometria', view: { xMin: -TWO_PI, xMax: TWO_PI, yMin: -2, yMax: 2 } },
];

const p = (val, min, max, step, label) => ({ val, min, max, step, label });

/**
 * Templates: `fn` uses the names in `params`, which become sliders.
 * Names are renamed (a → a2…) when another function already uses them.
 */
export const PLOT_TEMPLATES = [
    { id: 'line', label: 'Retta', display: 'mx + q', fn: 'm*x + q', params: { m: p(1, -5, 5, 0.1, 'm'), q: p(0, -5, 5, 0.5, 'q') } },
    { id: 'parabola', label: 'Parabola', display: 'ax² + bx + c', fn: 'a*x^2 + b*x + c', params: { a: p(1, -3, 3, 0.1, 'a'), b: p(0, -5, 5, 0.5, 'b'), c: p(0, -5, 5, 0.5, 'c') } },
    { id: 'sine', label: 'Seno', display: 'A sin(kx)', fn: 'A*sin(k*x)', params: { A: p(1, 0, 4, 0.1, 'A'), k: p(1, 0.1, 4, 0.1, 'k') } },
    { id: 'exp', label: 'Esponenziale', display: 'aˣ', fn: 'a^x', params: { a: p(2, 0.1, 5, 0.1, 'a') } },
    { id: 'log', label: 'Logaritmo', display: 'logₐ x', fn: 'log(x, a)', params: { a: p(2, 1.1, 10, 0.1, 'a') } },
    { id: 'abs', label: 'Valore assoluto', display: '|x − h| + k', fn: 'abs(x - h) + k', params: { h: p(0, -5, 5, 0.5, 'h'), k: p(0, -5, 5, 0.5, 'k') } },
    { id: 'hyperbola', label: 'Iperbole', display: 'k / x', fn: 'k/x', params: { k: p(1, -5, 5, 0.5, 'k') } },
    { id: 'sqrt', label: 'Radice', display: 'a√x', fn: 'a*sqrt(x)', params: { a: p(1, -3, 3, 0.1, 'a') } },
];

const SUBSCRIPTS = { 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function exprUsesName(expr, name) {
    if (!name) return false;
    return new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(name)}(?![A-Za-z0-9_])`).test(String(expr || ''));
}

function renameInExpr(expr, from, to) {
    if (!from) return String(expr);
    return String(expr).replace(new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(from)}(?![A-Za-z0-9_])`, 'g'), `$1${to}`);
}

/** A template's fn and slider params, with names that do not clash with `taken`. */
export function instantiateTemplate(tpl, taken = new Set()) {
    let fn = tpl.fn;
    const params = {};
    for (const [name, def] of Object.entries(tpl.params)) {
        let key = name;
        let n = 2;
        while (taken.has(key) || params[key]) {
            key = `${name}${n}`;
            n++;
        }
        if (key !== name) fn = renameInExpr(fn, name, key);
        const suffix = key.slice(name.length);
        params[key] = { ...def, label: `${def.label}${suffix.split('').map((d) => SUBSCRIPTS[d] || d).join('')}` };
    }
    return { fn, params };
}

/** Steps of 1, 2 or 5 times a power of ten, about a tenth of the span. */
export function niceStep(span) {
    const raw = Math.abs(span) / 10 || 1;
    const pow = 10 ** Math.floor(Math.log10(raw));
    const m = raw / pow;
    const nice = m < 1.5 ? 1 : (m < 3.5 ? 2 : (m < 7.5 ? 5 : 10));
    return nice * pow;
}

export function roundTo(v, digits) {
    const k = 10 ** digits;
    return Math.round(v * k) / k;
}

/** Nearest multiple of `step` when `v` is already close to one (keeps π-based limits). */
export function snapTo(v, step) {
    const snapped = Math.round(v / step) * step;
    return Math.abs(snapped - v) < step * 1e-6 ? snapped : v;
}

export function formatNum(v) {
    if (!Number.isFinite(v)) return '—';
    const r = roundTo(v, 2);
    return String(r).replace('.', ',').replace('-', '−');
}

export function sameView(a, b) {
    return ['xMin', 'xMax', 'yMin', 'yMax'].every((k) => Math.abs(a[k] - b[k]) < 1e-9);
}

/** Readable form of a plot expression for the function list. */
export function prettyExpr(expr) {
    return String(expr)
        .replace(/\*\*/g, '^')
        .replace(/\^2(?![0-9.])/g, '²')
        .replace(/\^3(?![0-9.])/g, '³')
        .replace(/\s*\*\s*/g, '·')
        .replace(/sqrt\(/g, '√(')
        .replace(/\bpi\b/g, 'π')
        .replace(/-/g, '−');
}

export function cloneJson(v) {
    return v === undefined ? undefined : JSON.parse(JSON.stringify(v));
}

/** Slider labels of a preset (params with a slider), for the preset cards. */
export function presetSliderLabels(data) {
    if (!data || typeof data !== 'object') return [];
    if (data.preset) {
        const name = typeof data.preset === 'string' ? data.preset : data.preset.name;
        const known = {
            incline: ['α', 'μ', 'm'], 'spring-mass': ['k', 'm', 'b'], pendulum: ['L', 'θ₀'],
            projectile: ['v₀', 'α'], atwood: ['m₁', 'm₂'], 'table-pulley': ['m₁', 'm₂', 'μ'], 'car-curve': ['v', 'μ'],
        };
        return known[name] || [];
    }
    const params = data.params || {};
    return Object.keys(params)
        .filter((k) => params[k] && params[k].slider !== false)
        .map((k) => {
            // A symbol reads better than a description ("attrito dell'aria" → c).
            const label = String(params[k].label || k).replace(/[$\\{}]/g, '').replace(/_([A-Za-z0-9]+)/g, '$1');
            return label.length <= 4 ? label : k.replace(/_/g, '');
        })
        .slice(0, 5);
}

/** Names the plot parser knows: they are never turned into sliders. */
const KNOWN_NAMES = new Set([
    'x', 'pi', 'e', 'i', 'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'asin', 'acos', 'atan', 'atan2',
    'sinh', 'cosh', 'tanh', 'sqrt', 'cbrt', 'ln', 'log', 'log10', 'log2', 'exp', 'abs',
    'floor', 'ceil', 'round', 'sign', 'min', 'max', 'pow', 'mod', 'deg', 'rad',
]);

export const MAX_AUTO_PARAMS = 4;

/**
 * The letters of an expression that are not x, a constant or a function: they become
 * sliders. "a*x^2 + b" → ['a', 'b']. A longer name followed by "(" is a function call.
 */
export function detectParams(expr) {
    const out = [];
    const src = String(expr || '');
    const re = /[A-Za-z_][A-Za-z0-9_]*/g;
    let m;
    while ((m = re.exec(src))) {
        const name = m[0];
        if (KNOWN_NAMES.has(name) || out.includes(name)) continue;
        const next = src.slice(re.lastIndex).trimStart();
        if (next.startsWith('(') && name.length > 1) continue;
        out.push(name);
        if (out.length >= MAX_AUTO_PARAMS) break;
    }
    return out;
}

/** Slider for a parameter typed in the editor. */
export function defaultParam(name) {
    return { val: 1, min: -5, max: 5, step: 0.1, label: name };
}

const EDITOR_KEYS = [
    ['7', '8', '9', '(', ')', ['⌫', null]],
    ['4', '5', '6', ['×', '*'], ['÷', '/'], ['xⁿ', '^']],
    ['1', '2', '3', '+', ['−', '-'], 'x'],
    ['0', '.', ['π', 'pi'], 'a', 'b', 'c'],
    [['sin', 'sin('], ['cos', 'cos('], ['√', 'sqrt('], ['ln', 'ln('], ['|x|', 'abs('], 'k'],
];

/**
 * Small function editor: a field and a keypad with x, the operations, a few functions
 * and parameter letters (a, b, c, k), which become sliders. The field is
 * `inputmode="none"` so a smartboard shows no system keyboard; the keyboard key
 * switches it on for whoever prefers typing, and a physical keyboard always works.
 */
export function buildFunctionEditor({ onChange, onSubmit, onCancel }) {
    const el = document.createElement('div');
    el.className = 'board-fn-editor';

    const top = document.createElement('div');
    top.className = 'board-keypad-top';
    const prefix = document.createElement('span');
    prefix.className = 'board-keypad-prefix';
    prefix.textContent = 'y =';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'board-keypad-input';
    input.setAttribute('inputmode', 'none');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.spellcheck = false;
    input.placeholder = 'a*x^2 + b';
    const kbd = document.createElement('button');
    kbd.type = 'button';
    kbd.className = 'board-keypad-key is-action';
    kbd.textContent = '⌨';
    kbd.title = 'Usa la tastiera del dispositivo';
    kbd.addEventListener('click', () => {
        const on = input.getAttribute('inputmode') === 'none';
        input.setAttribute('inputmode', on ? 'text' : 'none');
        kbd.classList.toggle('active', on);
        input.blur();
        input.focus();
    });
    top.append(prefix, input, kbd);

    const hint = document.createElement('div');
    hint.className = 'board-fn-editor-hint';

    const changed = () => { if (onChange) onChange(input.value); };
    const caret = () => [input.selectionStart ?? input.value.length, input.selectionEnd ?? input.value.length];
    const insert = (text) => {
        const [start, end] = caret();
        input.value = input.value.slice(0, start) + text + input.value.slice(end);
        const pos = start + text.length;
        input.setSelectionRange(pos, pos);
        changed();
    };
    const backspace = () => {
        const [start, end] = caret();
        if (start !== end) {
            input.value = input.value.slice(0, start) + input.value.slice(end);
            input.setSelectionRange(start, start);
        } else if (start > 0) {
            // A whole function name with its bracket ("sin(") goes in one press.
            const before = input.value.slice(0, start);
            const m = /(sin|cos|sqrt|ln|abs|pi)\(?$/.exec(before);
            const n = m ? m[0].length : 1;
            input.value = before.slice(0, -n) + input.value.slice(start);
            input.setSelectionRange(start - n, start - n);
        }
        changed();
    };
    input.addEventListener('input', changed);

    const grid = document.createElement('div');
    grid.className = 'board-keypad-grid';
    for (const row of EDITOR_KEYS) {
        for (const key of row) {
            const [label, text] = Array.isArray(key) ? key : [key, key];
            const k = document.createElement('button');
            k.type = 'button';
            k.className = 'board-keypad-key';
            if (/^[abck]$/.test(label)) k.classList.add('is-param');
            if (label === 'x') k.classList.add('is-var');
            k.textContent = label;
            // Keep the caret in the field: pressing a key must not blur it.
            k.addEventListener('pointerdown', (e) => e.preventDefault());
            k.addEventListener('click', () => (text === null ? backspace() : insert(text)));
            grid.appendChild(k);
        }
    }

    const actions = document.createElement('div');
    actions.className = 'board-fn-editor-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'board-action-btn';
    cancel.textContent = 'Annulla';
    cancel.addEventListener('click', () => { if (onCancel) onCancel(); });
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'board-action-btn board-action-primary';
    ok.innerHTML = `${BoardIcons.add}<span>Conferma funzione</span>`;
    ok.addEventListener('click', () => onSubmit(input.value));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); ok.click(); }
        if (e.key === 'Escape') { e.preventDefault(); cancel.click(); }
    });
    actions.append(cancel, ok);

    el.append(top, hint, grid, actions);
    return {
        el,
        setValue: (v) => { input.value = v || ''; changed(); },
        setHint: (text) => { hint.textContent = text; },
        focus: () => { try { input.focus({ preventScroll: true }); } catch (_) { /* ignore */ } },
    };
}
