/**
 * Mathematical Expression Compiler
 *
 * Tokenizes and parses user expressions ("3x^2 + a sin(x)", "x^2 + y^2 = 1",
 * "1.5 e^(i t)") into an AST and generates a JavaScript function once.
 * Parameters and named points are read from scope objects at call time,
 * so moving a slider or dragging a point never recompiles anything.
 *
 * Supported syntax:
 *  - numbers (1, .5, 1e-3), constants pi/PI/π, e/E, tau, inf, i (complex mode)
 *  - + - * / ^ (or **), unary minus (-x^2 = -(x^2)), implicit multiplication
 *    (2x, 2(x+1), (x+1)(x-1), ax when "a" is a parameter, 2pi)
 *  - function calls sin(x), log(x, 2), and |x| for absolute value
 *  - comparisons (< > <= >=) and the ternary operator: x < 0 ? -x : x^2
 *  - "lhs = rhs" (top level) becomes lhs - rhs, for implicit curves
 *  - point properties A.x, A.y, A.r, A.theta (and A.rad, A.deg for angles)
 *  - degrees: postfix ° (30° = 30·π/180), deg(x) radians -> degrees, rad(x) degrees -> radians
 */

// =========================================================================
// COMPLEX RUNTIME
// =========================================================================

const isC = (v) => v !== null && typeof v === 'object';
const re = (v) => (isC(v) ? v.re : v);
const im = (v) => (isC(v) ? v.im : 0);
const mk = (r, i) => (i === 0 ? r : { re: r, im: i });

export const Complex = {
    of: (r, i) => ({ re: r, im: i }),
    /** Always returns a {re, im} object (used for complex-mode results). */
    toC: (v) => (isC(v) ? v : { re: v, im: 0 }),
    add: (a, b) => (isC(a) || isC(b) ? mk(re(a) + re(b), im(a) + im(b)) : a + b),
    sub: (a, b) => (isC(a) || isC(b) ? mk(re(a) - re(b), im(a) - im(b)) : a - b),
    mul: (a, b) => {
        if (!isC(a) && !isC(b)) return a * b;
        const ar = re(a), ai = im(a), br = re(b), bi = im(b);
        return mk(ar * br - ai * bi, ar * bi + ai * br);
    },
    div: (a, b) => {
        if (!isC(a) && !isC(b)) return a / b;
        const ar = re(a), ai = im(a), br = re(b), bi = im(b);
        const d = br * br + bi * bi;
        return mk((ar * br + ai * bi) / d, (ai * br - ar * bi) / d);
    },
    neg: (a) => (isC(a) ? { re: -a.re, im: -a.im } : -a),
    abs: (a) => (isC(a) ? Math.hypot(a.re, a.im) : Math.abs(a)),
    arg: (a) => Math.atan2(im(a), re(a)),
    conj: (a) => (isC(a) ? { re: a.re, im: -a.im } : a),
    re: (a) => re(a),
    im: (a) => im(a),
    exp: (a) => {
        if (!isC(a)) return Math.exp(a);
        const m = Math.exp(a.re);
        return mk(m * Math.cos(a.im), m * Math.sin(a.im));
    },
    log: (a) => {
        if (!isC(a) && a >= 0) return Math.log(a);
        return mk(Math.log(Complex.abs(a)), Complex.arg(a));
    },
    pow: (a, b) => {
        if (!isC(a) && !isC(b)) {
            if (a >= 0 || Number.isInteger(b)) return Math.pow(a, b);
        }
        // Integer powers by repeated multiplication (exact for i^2, (1+i)^3, ...)
        if (!isC(b) && Number.isInteger(b) && Math.abs(b) <= 64) {
            let result = 1, base = a, n = Math.abs(b);
            while (n > 0) {
                if (n & 1) result = Complex.mul(result, base);
                base = Complex.mul(base, base);
                n >>= 1;
            }
            return b < 0 ? Complex.div(1, result) : result;
        }
        if (re(a) === 0 && im(a) === 0) return 0;
        return Complex.exp(Complex.mul(b, Complex.log(a)));
    },
    sqrt: (a) => {
        if (!isC(a)) return a >= 0 ? Math.sqrt(a) : { re: 0, im: Math.sqrt(-a) };
        const r = Complex.abs(a), t = Complex.arg(a) / 2;
        return mk(Math.sqrt(r) * Math.cos(t), Math.sqrt(r) * Math.sin(t));
    },
    sin: (a) => (isC(a) ? mk(Math.sin(a.re) * Math.cosh(a.im), Math.cos(a.re) * Math.sinh(a.im)) : Math.sin(a)),
    cos: (a) => (isC(a) ? mk(Math.cos(a.re) * Math.cosh(a.im), -Math.sin(a.re) * Math.sinh(a.im)) : Math.cos(a)),
    tan: (a) => (isC(a) ? Complex.div(Complex.sin(a), Complex.cos(a)) : Math.tan(a)),
    sinh: (a) => (isC(a) ? mk(Math.sinh(a.re) * Math.cos(a.im), Math.cosh(a.re) * Math.sin(a.im)) : Math.sinh(a)),
    cosh: (a) => (isC(a) ? mk(Math.cosh(a.re) * Math.cos(a.im), Math.sinh(a.re) * Math.sin(a.im)) : Math.cosh(a)),
    cis: (t) => Complex.exp(Complex.mul({ re: 0, im: 1 }, t)),
};

// =========================================================================
// FUNCTION TABLES
// =========================================================================

const sec = (x) => 1 / Math.cos(x);
const csc = (x) => 1 / Math.sin(x);
const cot = (x) => 1 / Math.tan(x);

/** Real-mode functions: name -> JS expression prefix. */
const REAL_FUNCTIONS = {
    sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan',
    asin: 'Math.asin', acos: 'Math.acos', atan: 'Math.atan', atan2: 'Math.atan2',
    arcsin: 'Math.asin', arccos: 'Math.acos', arctan: 'Math.atan',
    sinh: 'Math.sinh', cosh: 'Math.cosh', tanh: 'Math.tanh',
    asinh: 'Math.asinh', acosh: 'Math.acosh', atanh: 'Math.atanh',
    sec: '$R.sec', csc: '$R.csc', cot: '$R.cot',
    sqrt: 'Math.sqrt', cbrt: 'Math.cbrt', exp: 'Math.exp',
    log: '$R.log', ln: 'Math.log', log10: 'Math.log10', log2: 'Math.log2',
    abs: 'Math.abs', floor: 'Math.floor', ceil: 'Math.ceil', round: 'Math.round',
    sign: 'Math.sign', sgn: 'Math.sign', min: 'Math.min', max: 'Math.max',
    pow: 'Math.pow', hypot: 'Math.hypot', mod: '$R.mod',
    deg: '$R.deg', rad: '$R.rad',
};

/** Complex-mode functions (also accept plain numbers). */
const COMPLEX_FUNCTIONS = {
    sin: '$C.sin', cos: '$C.cos', tan: '$C.tan', sinh: '$C.sinh', cosh: '$C.cosh',
    exp: '$C.exp', log: '$C.log', ln: '$C.log', sqrt: '$C.sqrt', pow: '$C.pow',
    abs: '$C.abs', arg: '$C.arg', conj: '$C.conj', re: '$C.re', Re: '$C.re', im: '$C.im', Im: '$C.im',
    cis: '$C.cis',
};

const CONSTANTS = {
    pi: 'Math.PI', PI: 'Math.PI', 'π': 'Math.PI', tau: '(2*Math.PI)',
    e: 'Math.E', E: 'Math.E', inf: 'Infinity', infinity: 'Infinity', Infinity: 'Infinity',
};

const POINT_PROPS = ['x', 'y', 'r', 'theta', 'rad', 'deg', 'len'];

/** Helpers referenced by generated code as `$R.*`. */
export const Runtime = {
    sec, csc, cot,
    log: (x, b) => (b === undefined ? Math.log(x) : Math.log(x) / Math.log(b)),
    mod: (a, b) => ((a % b) + b) % b,
    deg: (x) => x * 180 / Math.PI,
    rad: (x) => x * Math.PI / 180,
    /** Reads a property of a named point / vector / angle. */
    pt: (pts, name, prop) => {
        const p = pts && pts[name];
        if (!p) return NaN;
        switch (prop) {
            case 'x': return p.x;
            case 'y': return p.y;
            case 'r': case 'len': return Math.hypot(p.x, p.y);
            case 'theta': return Math.atan2(p.y, p.x);
            case 'rad': return p.rad;
            case 'deg': return p.deg;
        }
        return NaN;
    },
};

// =========================================================================
// TOKENIZER
// =========================================================================

function tokenize(src) {
    const tokens = [];
    let i = 0;
    const s = src
        .replace(/[−–]/g, '-')
        .replace(/[·×]/g, '*')
        .replace(/÷/g, '/')
        .replace(/º/g, '°') // masculine ordinal, often typed for the degree sign
        .replace(/\bMath\./g, ''); // tolerate JS-style "Math.sin(x)"

    while (i < s.length) {
        const c = s[i];
        if (/\s/.test(c)) { i++; continue; }

        // Number: 12, 1.5, .5, 1e-3 (but "2e" alone is 2*e)
        const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
        if (num) {
            tokens.push({ t: 'num', v: parseFloat(num[0]) });
            i += num[0].length;
            continue;
        }

        // Identifier, optionally with a ".prop" member (A.x, P.theta)
        const id = /^[A-Za-z_πθ][A-Za-z0-9_θ]*/.exec(s.slice(i));
        if (id) {
            tokens.push({ t: 'id', v: id[0] });
            i += id[0].length;
            const mem = /^\.([A-Za-z]+)/.exec(s.slice(i));
            if (mem) {
                tokens[tokens.length - 1].prop = mem[1];
                i += mem[0].length;
            }
            continue;
        }

        const two = s.substr(i, 2);
        if (two === '**') { tokens.push({ t: 'op', v: '^' }); i += 2; continue; }
        if (two === '<=' || two === '>=' || two === '==' || two === '!=' || two === '&&' || two === '||') {
            tokens.push({ t: 'op', v: two }); i += 2; continue;
        }
        if ('+-*/^(),=<>?:|!°'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue; }

        throw new Error(`Unexpected character '${c}' in "${src}"`);
    }
    return tokens;
}

// =========================================================================
// PARSER (Pratt / precedence climbing) -> AST
// =========================================================================

class Parser {
    constructor(tokens, scope, src) {
        this.tokens = tokens;
        this.pos = 0;
        this.scope = scope;
        this.src = src;
        this.absDepth = 0;
    }

    peek() { return this.tokens[this.pos]; }
    next() { return this.tokens[this.pos++]; }
    isOp(v, tok = this.peek()) { return tok && tok.t === 'op' && tok.v === v; }
    expect(v) {
        const tok = this.next();
        if (!tok || tok.t !== 'op' || tok.v !== v) throw new Error(`Expected '${v}' in "${this.src}"`);
    }

    parseTop() {
        let node = this.parseTernary();
        if (this.isOp('=')) {
            this.next();
            const rhs = this.parseTernary();
            node = { k: 'bin', op: '-', a: node, b: rhs };
        }
        if (this.pos < this.tokens.length) {
            const tok = this.peek();
            throw new Error(`Unexpected '${tok.v}' in "${this.src}"`);
        }
        return node;
    }

    parseTernary() {
        const cond = this.parseOr();
        if (this.isOp('?')) {
            this.next();
            const a = this.parseTernary();
            this.expect(':');
            const b = this.parseTernary();
            return { k: 'tern', c: cond, a, b };
        }
        return cond;
    }

    parseOr() {
        let node = this.parseAnd();
        while (this.isOp('||')) { this.next(); node = { k: 'logic', op: '||', a: node, b: this.parseAnd() }; }
        return node;
    }

    parseAnd() {
        let node = this.parseCompare();
        while (this.isOp('&&')) { this.next(); node = { k: 'logic', op: '&&', a: node, b: this.parseCompare() }; }
        return node;
    }

    parseCompare() {
        let node = this.parseAdd();
        while (this.peek() && this.peek().t === 'op' && ['<', '>', '<=', '>=', '==', '!='].includes(this.peek().v)) {
            const op = this.next().v;
            node = { k: 'cmp', op, a: node, b: this.parseAdd() };
        }
        return node;
    }

    parseAdd() {
        let node = this.parseMul();
        while (this.isOp('+') || this.isOp('-')) {
            const op = this.next().v;
            node = { k: 'bin', op, a: node, b: this.parseMul() };
        }
        return node;
    }

    /** Can the current token start an implicitly multiplied factor? */
    startsFactor() {
        const tok = this.peek();
        if (!tok) return false;
        if (tok.t === 'num' || tok.t === 'id') return true;
        if (this.isOp('(')) return true;
        // An opening "|" only starts a factor when we are not inside |...|
        if (this.isOp('|') && this.absDepth === 0) return true;
        return false;
    }

    parseMul() {
        let node = this.parseUnary();
        for (;;) {
            if (this.isOp('*') || this.isOp('/')) {
                const op = this.next().v;
                node = { k: 'bin', op, a: node, b: this.parseUnary() };
            } else if (this.startsFactor()) {
                // Implicit multiplication binds like explicit "*": 1/2x = (1/2)*x
                node = { k: 'bin', op: '*', a: node, b: this.parsePow() };
            } else {
                break;
            }
        }
        return node;
    }

    parseUnary() {
        if (this.isOp('-')) { this.next(); return { k: 'neg', a: this.parseUnary() }; }
        if (this.isOp('+')) { this.next(); return this.parseUnary(); }
        if (this.isOp('!')) { this.next(); return { k: 'not', a: this.parseUnary() }; }
        return this.parsePow();
    }

    parsePow() {
        const base = this.parsePostfix();
        if (this.isOp('^')) {
            this.next();
            // Right associative, exponent may carry its own sign: 2^-x, 2^x^2
            const exp = this.parseUnaryExponent();
            return { k: 'pow', a: base, b: exp };
        }
        return base;
    }

    parseUnaryExponent() {
        if (this.isOp('-')) { this.next(); return { k: 'neg', a: this.parseUnaryExponent() }; }
        if (this.isOp('+')) { this.next(); return this.parseUnaryExponent(); }
        return this.parsePow();
    }

    parsePostfix() {
        let node = this.parsePrimary();
        while (this.isOp('!') || this.isOp('°')) {
            if (this.next().v === '°') node = { k: 'bin', op: '*', a: node, b: { k: 'const', v: '(Math.PI/180)' } };
            else node = { k: 'call', fn: 'factorial', args: [node] };
        }
        return node;
    }

    parsePrimary() {
        const tok = this.next();
        if (!tok) throw new Error(`Unexpected end of expression "${this.src}"`);

        if (tok.t === 'num') return { k: 'num', v: tok.v };

        if (tok.t === 'op' && tok.v === '(') {
            const saved = this.absDepth;
            this.absDepth = 0;
            const node = this.parseTernary();
            this.absDepth = saved;
            this.expect(')');
            return node;
        }

        if (tok.t === 'op' && tok.v === '|') {
            this.absDepth++;
            const node = this.parseTernary();
            this.absDepth--;
            this.expect('|');
            return { k: 'call', fn: 'abs', args: [node] };
        }

        if (tok.t === 'id') return this.parseIdentifier(tok);

        throw new Error(`Unexpected '${tok.v}' in "${this.src}"`);
    }

    parseIdentifier(tok) {
        const { scope } = this;
        const name = tok.v;

        // Point / vector property: A.x (also "iP.y" = i * P.y, "2aP.x" style prefixes)
        if (tok.prop !== undefined) {
            if (!POINT_PROPS.includes(tok.prop)) throw new Error(`Unknown property '.${tok.prop}' in "${this.src}"`);
            const pts = scope.points;
            if (pts && pts.size && !pts.has(name)) {
                const owner = [...pts].sort((a, b) => b.length - a.length).find(p => name.endsWith(p));
                const prefix = owner ? name.slice(0, -owner.length) : '';
                const parts = prefix ? (this.resolveAtom(prefix) ? [prefix] : this.splitName(prefix)) : null;
                if (parts) {
                    return { k: 'bin', op: '*', a: this.buildProduct(parts), b: { k: 'pt', name: owner, prop: tok.prop } };
                }
            }
            return { k: 'pt', name, prop: tok.prop };
        }

        // Function call: name(...)
        if (scope.functions[name] && this.isOp('(')) return this.parseCall(name);

        const atom = this.resolveAtom(name);
        if (atom) return atom;

        // Function without parentheses: "sin x" -> sin(x)
        if (scope.functions[name]) {
            return { k: 'call', fn: name, args: [this.parsePow()] };
        }

        // Juxtaposed names: "ax" -> a*x, "kx" -> k*x, "xy" -> x*y, "pix" -> pi*x, "2sinx" -> 2*sin(x)
        const parts = this.splitName(name);
        if (parts) return this.buildProduct(parts);

        throw new Error(`Unknown symbol '${name}' in "${this.src}"`);
    }

    buildProduct(parts) {
        const { scope } = this;
        let node = null;
        for (let p = 0; p < parts.length; p++) {
            const part = parts[p];
            let factor;
            if (/^\d+$/.test(part)) {
                factor = { k: 'num', v: parseFloat(part) };
            } else if (scope.functions[part] && !this.resolveAtom(part)) {
                if (p < parts.length - 1) {
                    // "sinx" -> sin(x): the function takes the rest of the name
                    factor = { k: 'call', fn: part, args: [this.buildProduct(parts.slice(p + 1))] };
                    p = parts.length;
                } else if (this.isOp('(')) {
                    factor = this.parseCall(part);
                } else {
                    factor = { k: 'call', fn: part, args: [this.parsePow()] };
                }
            } else {
                factor = this.resolveAtom(part);
            }
            node = node ? { k: 'bin', op: '*', a: node, b: factor } : factor;
        }
        return node;
    }

    parseCall(name) {
        this.expect('(');
        const args = [];
        const saved = this.absDepth;
        this.absDepth = 0;
        if (!this.isOp(')')) {
            args.push(this.parseTernary());
            while (this.isOp(',')) { this.next(); args.push(this.parseTernary()); }
        }
        this.absDepth = saved;
        this.expect(')');
        return { k: 'call', fn: name, args };
    }

    resolveAtom(name) {
        const { scope } = this;
        if (scope.vars.includes(name)) return { k: 'var', name };
        if (scope.params.has(name)) return { k: 'param', name };
        if (scope.complex && name === 'i') return { k: 'imag' };
        if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) return { k: 'const', v: CONSTANTS[name] };
        return null;
    }

    /** Greedy left-to-right split of an unknown identifier into known atoms. */
    splitName(name) {
        const { scope } = this;
        const known = [
            ...scope.vars, ...scope.params, ...Object.keys(CONSTANTS), ...Object.keys(scope.functions),
            ...(scope.complex ? ['i'] : []),
        ].sort((a, b) => b.length - a.length);

        const out = [];
        let rest = name;
        while (rest.length) {
            const digits = /^\d+/.exec(rest);
            if (digits) { out.push(digits[0]); rest = rest.slice(digits[0].length); continue; }
            const hit = known.find(k => rest.startsWith(k));
            if (!hit) return null;
            out.push(hit);
            rest = rest.slice(hit.length);
        }
        return out.length > 1 ? out : null;
    }
}

// =========================================================================
// CODE GENERATION
// =========================================================================

function genReal(n) {
    switch (n.k) {
        case 'num': return n.v < 0 ? `(${n.v})` : String(n.v);
        case 'const': return n.v;
        case 'var': return n.name;
        case 'param': return `$p[${JSON.stringify(n.name)}]`;
        case 'pt': return `$R.pt($pt,${JSON.stringify(n.name)},${JSON.stringify(n.prop)})`;
        case 'imag': throw new Error("'i' requires complexMode");
        case 'neg': return `(-${genReal(n.a)})`;
        case 'not': return `(!${genReal(n.a)})`;
        case 'bin': return `(${genReal(n.a)}${n.op}${genReal(n.b)})`;
        case 'pow': return `Math.pow(${genReal(n.a)},${genReal(n.b)})`;
        case 'cmp': return `(${genReal(n.a)}${n.op === '==' ? '===' : n.op === '!=' ? '!==' : n.op}${genReal(n.b)})`;
        case 'logic': return `(${genReal(n.a)}${n.op}${genReal(n.b)})`;
        case 'tern': return `(${genReal(n.c)}?${genReal(n.a)}:${genReal(n.b)})`;
        case 'call': {
            if (n.fn === 'factorial') return `$R.factorial(${genReal(n.args[0])})`;
            const f = REAL_FUNCTIONS[n.fn];
            if (!f) throw new Error(`Function '${n.fn}' is only available in complexMode`);
            return `${f}(${n.args.map(genReal).join(',')})`;
        }
    }
    throw new Error(`Unsupported node ${n.k}`);
}

function genComplex(n) {
    switch (n.k) {
        case 'num': case 'const': case 'var': case 'param': case 'pt': return genReal(n);
        case 'imag': return '$C.of(0,1)';
        case 'neg': return `$C.neg(${genComplex(n.a)})`;
        case 'not': return `(!${genComplex(n.a)})`;
        case 'bin': {
            const fn = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div' }[n.op];
            return `$C.${fn}(${genComplex(n.a)},${genComplex(n.b)})`;
        }
        case 'pow': return `$C.pow(${genComplex(n.a)},${genComplex(n.b)})`;
        case 'cmp': return `($C.re(${genComplex(n.a)})${n.op === '==' ? '===' : n.op === '!=' ? '!==' : n.op}$C.re(${genComplex(n.b)}))`;
        case 'logic': return `(${genComplex(n.a)}${n.op}${genComplex(n.b)})`;
        case 'tern': return `(${genComplex(n.c)}?${genComplex(n.a)}:${genComplex(n.b)})`;
        case 'call': {
            if (n.fn === 'factorial') return `$R.factorial($C.re(${genComplex(n.args[0])}))`;
            const cf = COMPLEX_FUNCTIONS[n.fn];
            if (cf) return `${cf}(${n.args.map(genComplex).join(',')})`;
            // Real-only functions operate on the real part
            const f = REAL_FUNCTIONS[n.fn];
            return `${f}(${n.args.map(a => `$C.re(${genComplex(a)})`).join(',')})`;
        }
    }
    throw new Error(`Unsupported node ${n.k}`);
}

Runtime.factorial = (n) => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    let r = 1;
    for (let k = 2; k <= n; k++) r *= k;
    return r;
};

// =========================================================================
// PUBLIC API
// =========================================================================

/**
 * Parses an expression into an AST (exposed for tests and tooling).
 */
export function parseExpression(src, { vars = ['x'], params = [], points = [], complex = false } = {}) {
    const scope = {
        vars,
        params: params instanceof Set ? params : new Set(params),
        points: points instanceof Set ? points : new Set(points),
        complex,
        functions: complex ? { ...REAL_FUNCTIONS, ...COMPLEX_FUNCTIONS } : REAL_FUNCTIONS,
    };
    return new Parser(tokenize(String(src)), scope, String(src)).parseTop();
}

/**
 * Compiles an expression into raw JS source and a function with the signature
 * (params, points, ...vars) => value.
 */
export function compileExpression(src, options = {}) {
    const { vars = ['x'], complex = false } = options;
    const ast = parseExpression(src, options);
    let code = complex ? genComplex(ast) : genReal(ast);
    if (complex) code = `$C.toC(${code})`;
    // eslint-disable-next-line no-new-func
    const raw = new Function('$C', '$R', '$p', '$pt', ...vars, `return ${code};`);
    const fn = (p, pt, ...args) => raw(Complex, Runtime, p, pt, ...args);
    fn.raw = raw;
    fn.code = code;
    return fn;
}

/**
 * Per-plot compiler: knows the plot's parameter names and complex mode,
 * caches compiled functions and binds them to live scope objects.
 */
export class ExpressionCompiler {
    /**
     * @param {object} opts
     * @param {() => object} opts.getParams - returns the live parameter values
     * @param {() => object} opts.getPoints - returns the live named points
     * @param {string[]} [opts.paramNames]
     * @param {string[]} [opts.pointNames] - names of points/vectors (resolves "iP.y" as i·P.y)
     * @param {boolean} [opts.complex]
     */
    constructor({ getParams, getPoints, paramNames = [], pointNames = [], complex = false }) {
        this.getParams = getParams;
        this.getPoints = getPoints;
        this.paramNames = new Set(paramNames);
        this.pointNames = new Set(pointNames);
        this.complex = complex;
        this.cache = new Map();
    }

    /**
     * Returns a function of the given variables, e.g. fn("x^2") -> (x) => x^2.
     * `exclude` removes a name from the parameter set (internal curve parameters).
     * Throws on syntax errors.
     */
    fn(src, vars = ['x'], { exclude = null, complex = this.complex } = {}) {
        const key = `${vars.join(',')}|${exclude || ''}|${complex ? 1 : 0}|${src}`;
        let bound = this.cache.get(key);
        if (bound) return bound;

        let params = this.paramNames;
        if (exclude || vars.some(v => params.has(v))) {
            params = new Set(params);
            params.delete(exclude);
            vars.forEach(v => params.delete(v));
        }
        const compiled = compileExpression(src, { vars, params, points: this.pointNames, complex });
        const raw = compiled.raw;
        const getP = this.getParams, getPt = this.getPoints;

        switch (vars.length) {
            case 0: bound = () => raw(Complex, Runtime, getP(), getPt()); break;
            case 1: bound = (a) => raw(Complex, Runtime, getP(), getPt(), a); break;
            case 2: bound = (a, b) => raw(Complex, Runtime, getP(), getPt(), a, b); break;
            default: bound = (...args) => raw(Complex, Runtime, getP(), getPt(), ...args);
        }
        bound.code = compiled.code;
        this.cache.set(key, bound);
        return bound;
    }

    /**
     * Evaluates a constant expression (numbers pass through).
     * Returns NaN for empty/invalid input. In complex mode a non-real result
     * is returned as {re, im}; real results are returned as numbers.
     */
    eval(val) {
        if (typeof val === 'number') return val;
        if (typeof val !== 'string' || val.trim() === '') return NaN;
        const res = this.fn(val, [])();
        if (isC(res)) return res.im === 0 ? res.re : res;
        return typeof res === 'boolean' ? Number(res) : res;
    }
}

// =========================================================================
// BACKWARDS-COMPATIBLE HELPERS
// =========================================================================

/**
 * Evaluates a value once (no caching). Kept for external callers.
 */
export function evalValue(val, options = {}, context = 'value') {
    if (typeof val === 'number') return val;
    if (typeof val !== 'string') return NaN;
    const { params = {}, resolvedPoints = {}, complexMode = false } = options;
    try {
        const c = new ExpressionCompiler({
            getParams: () => params,
            getPoints: () => resolvedPoints,
            paramNames: Object.keys(params),
            pointNames: Object.keys(resolvedPoints),
            complex: complexMode === true,
        });
        return c.eval(val);
    } catch (e) {
        console.warn(`Error evaluating ${context}: ${val}`, e);
        return NaN;
    }
}

/** Formats a number for labels: at most `digits` decimals, no trailing zeros. */
export function formatNumber(v, digits = 2) {
    if (typeof v !== 'number' || !isFinite(v)) return String(v);
    const r = +v.toFixed(digits);
    return (Object.is(r, -0) ? 0 : r).toString();
}

/**
 * Replaces "Name.prop" tokens in a label with their current values.
 * Longer property names are matched first and a token must not be part of a
 * longer word ("A.r" does not match inside "A.rad", "A.x" not inside "BA.x").
 */
export function substituteLabel(str, resolvedPoints = {}) {
    if (!str || typeof str !== 'string') return str;
    const names = Object.keys(resolvedPoints);
    if (!names.length) return str;
    const esc = names
        .sort((a, b) => b.length - a.length)
        .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    // Longest names first, so "BA.x" is not read as B + "A.x"; a letter prefix is
    // allowed on purpose ("iP.y" -> "i2", for complex numbers written as P.x + iP.y)
    const re = new RegExp(`(?<![0-9_.])(${esc})\\.(theta|rad|deg|len|x|y|r)(?![A-Za-z0-9_])`, 'g');
    return str.replace(re, (m, name, prop) => {
        const v = Runtime.pt(resolvedPoints, name, prop);
        return v === undefined || Number.isNaN(v) ? m : formatNumber(v);
    });
}
