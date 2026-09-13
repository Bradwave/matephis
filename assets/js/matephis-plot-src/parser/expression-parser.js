/**
 * Mathematical Expression Parser and Evaluator
 */

export function makeFn(str, options = {}) {
    const {
        params = {},
        resolvedPoints = {},
        internalParamName = null,
        complexMode = false
    } = options;

    let expr = str;

    // 0. Substitute free-point variables: Name.x, Name.y, Name.r, Name.theta
    for (const name in resolvedPoints) {
        const fp = resolvedPoints[name];
        const fpR = Math.sqrt(fp.x * fp.x + fp.y * fp.y);
        const fpTheta = Math.atan2(fp.y, fp.x);
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        expr = expr.replace(new RegExp(esc + '\\.theta', 'g'), `(${fpTheta})`);
        expr = expr.replace(new RegExp(esc + '\\.r', 'g'), `(${fpR})`);
        expr = expr.replace(new RegExp(esc + '\\.x', 'g'), `(${fp.x})`);
        expr = expr.replace(new RegExp(esc + '\\.y', 'g'), `(${fp.y})`);
        if (fp.rad !== undefined) expr = expr.replace(new RegExp(esc + '\\.rad', 'g'), `(${fp.rad})`);
        if (fp.deg !== undefined) expr = expr.replace(new RegExp(esc + '\\.deg', 'g'), `(${fp.deg})`);
    }

    // 1. Implicit Multiplication for Parameters (e.g., "ax" -> "a*x")
    for (let key in params) {
        if (internalParamName && key === internalParamName) continue;
        const re = new RegExp(`(?<![a-zA-Z0-9])(${key})(?=[xyt\\(])`, 'g');
        expr = expr.replace(re, "$1*");
    }

    // Replace parameters with their values
    for (let key in params) {
        if (internalParamName && key === internalParamName) continue;
        const re = new RegExp(`\\b${key}\\b`, 'g');
        expr = expr.replace(re, `(${params[key]})`);
    }

    // Implicit multiplication: "3x" -> "3*x", ")x" -> ")*x"
    expr = expr.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
    expr = expr.replace(/(\))([a-zA-Z0-9(])/g, "$1*$2");

    // Negative power fix: "-x^2" -> "-(x^2)"
    expr = expr.replace(/(^|[^a-zA-Z0-9])\-([a-z])\^(\d+)/g, "$1-($2^$3)");

    // Convert to JavaScript math
    expr = expr.replace(/\^/g, "**");
    expr = expr.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|log|exp|abs|floor|ceil|round)\b/g, "Math.$1");
    expr = expr.replace(/\b(pi|PI)\b/g, "Math.PI");
    expr = expr.replace(/\b(e|E)\b/g, "Math.E");

    // Convert implicit equations (e.g., "x^2 + y^2 = 1")
    if (expr.includes("=") && complexMode !== true) {
        const parts = expr.split("=");
        expr = `(${parts[0]}) - (${parts[1]})`;
    }

    // Complex Mode
    if (complexMode === true) {
        expr = expr.replace(/([^+\-*/(]+(?:\*))?(?:Math\.E\*\*)?(?:Math\.exp)?\(\s*i\s*\*\s*((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+)\s*\)/g, (match, r, theta) => {
            const radius = r ? r.replace('*', '') : "1";
            return `{re: (${radius}) * Math.cos(${theta}), im: (${radius}) * Math.sin(${theta})}`;
        });
        expr = expr.replace(/([^+\-*/()]+)\s*\+\s*i\s*\*\s*([^+\-*/()]+)/g, "{re: $1, im: $2}");
        expr = expr.replace(/([^+\-*/()]+)\s*\+\s*([^+\-*/()]+)\s*\*\s*i/g, "{re: $1, im: $2}");
        expr = expr.replace(/(?<!\w)i\s*\*\s*([^+\-*/()]+)/g, "{re: 0, im: $1}");
    }

    return expr;
}

export function evalValue(val, options = {}, context = "value") {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const { resolvedPoints = {}, complexMode = false } = options;
        let subVal = val;
        for (const name in resolvedPoints) {
            const fp = resolvedPoints[name];
            const r = Math.sqrt(fp.x * fp.x + fp.y * fp.y);
            const theta = Math.atan2(fp.y, fp.x);
            const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            subVal = subVal.replace(new RegExp(esc + '\\.theta', 'g'), `(${theta})`);
            subVal = subVal.replace(new RegExp(esc + '\\.r', 'g'), `(${r})`);
            subVal = subVal.replace(new RegExp(esc + '\\.x', 'g'), `(${fp.x})`);
            subVal = subVal.replace(new RegExp(esc + '\\.y', 'g'), `(${fp.y})`);
            if (fp.rad !== undefined) subVal = subVal.replace(new RegExp(esc + '\\.rad', 'g'), `(${fp.rad})`);
            if (fp.deg !== undefined) subVal = subVal.replace(new RegExp(esc + '\\.deg', 'g'), `(${fp.deg})`);
        }
        try {
            const fnStr = makeFn(subVal, options);
            const fn = new Function(`return ${fnStr}`);
            const res = fn();
            if (complexMode === true && res && typeof res === 'object' && 're' in res) {
                return res;
            }
            return res;
        } catch (e) {
            console.warn(`Error evaluating ${context}: ${val}`, e);
            return NaN;
        }
    }
    return NaN;
}

export function substituteLabel(str, resolvedPoints = {}) {
    if (!str || typeof str !== 'string') return str;
    let res = str;
    for (const [name, pt] of Object.entries(resolvedPoints)) {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        res = res.replace(new RegExp(esc + '\\.x', 'g'), (+pt.x.toFixed(2)).toString());
        res = res.replace(new RegExp(esc + '\\.y', 'g'), (+pt.y.toFixed(2)).toString());
        res = res.replace(new RegExp(esc + '\\.r', 'g'), (+Math.sqrt(pt.x * pt.x + pt.y * pt.y).toFixed(2)).toString());
        res = res.replace(new RegExp(esc + '\\.theta', 'g'), (+Math.atan2(pt.y, pt.x).toFixed(2)).toString());
        if (pt.rad !== undefined) {
            res = res.replace(new RegExp(esc + '\\.rad', 'g'), (+pt.rad.toFixed(2)).toString());
        }
        if (pt.deg !== undefined) {
            res = res.replace(new RegExp(esc + '\\.deg', 'g'), (+pt.deg.toFixed(2)).toString());
        }
    }
    return res;
}
