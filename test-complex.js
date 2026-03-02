const TestClass = class {
    constructor() { this.config = { complexMode: true }; this.params = {}; }
    _makeFn(str) {
        let expr = str;
        for (let key in this.params) {
            const re = new RegExp(`(?<![a-zA-Z0-9])(${key})(?=[xyt\\(])`, 'g');
            expr = expr.replace(re, "$1*");
        }
        for (let key in this.params) {
            const re = new RegExp(`\\b${key}\\b`, 'g');
            expr = expr.replace(re, `(${this.params[key]})`);
        }
        expr = expr.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
        expr = expr.replace(/(\))([a-zA-Z0-9(])/g, "$1*$2");
        expr = expr.replace(/(^|[^a-zA-Z0-9])\-([a-z])\^(\d+)/g, "$1-($2^$3)");
        expr = expr.replace(/\^/g, "**");
        expr = expr.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|log|exp|abs|floor|ceil|round)\b/g, "Math.$1");
        expr = expr.replace(/\b(pi|PI)\b/g, "Math.PI");
        expr = expr.replace(/\b(e|E)\b/g, "Math.E");

        if (expr.includes("=") && this.config.complexMode !== true) {
            const parts = expr.split("=");
            expr = `(${parts[0]}) - (${parts[1]})`;
        }
        
        if (this.config.complexMode === true) {
            let orig = expr;
            expr = expr.replace(/([^+\-*/(]+(?:\*))?(?:Math\.E\*\*)?(?:Math\.exp)?\(\s*i\s*\*\s*(.+?)\s*\)/g, (match, r, theta) => {
                const radius = r ? r.replace('*', '') : "1";
                return `{re: (${radius}) * Math.cos(${theta}), im: (${radius}) * Math.sin(${theta})}`;
            });
            expr = expr.replace(/([^+\-*/()]+)\s*\+\s*i\s*\*\s*([^+\-*/()]+)/g, "{re: $1, im: $2}");
            expr = expr.replace(/([^+\-*/()]+)\s*\+\s*([^+\-*/()]+)\s*\*\s*i/g, "{re: $1, im: $2}");
            expr = expr.replace(/(?<!\w)i\s*\*\s*([^+\-*/()]+)/g, "{re: 0, im: $1}");
            if (orig !== expr) console.log("Complex Parsing: ", orig, " -> ", expr);
        }
        return expr;
    }
}
const t = new TestClass();
console.log("exp(i * x) =>", t._makeFn('exp(i * x)'));
console.log("e^(i * x) =>", t._makeFn('e^(i * x)'));
console.log("2*exp(i * x) =>", t._makeFn('2*exp(i * x)'));
console.log("2*e^(i * x) =>", t._makeFn('2*e^(i * x)'));
console.log("0.5 + i * x =>", t._makeFn('0.5 + i * x'));
