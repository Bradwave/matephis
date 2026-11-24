#!/usr/bin/env node
// Compares two fingerprint files (tools/bench/fingerprint.mjs): every scene must match, timings aside.
// Exits with 1 when a scene differs.
import { readFileSync } from 'node:fs';
const [pa, pb] = process.argv.slice(2);
const a = JSON.parse(readFileSync(pa, 'utf8')), b = JSON.parse(readFileSync(pb, 'utf8'));
const strip = (r) => { const { ms, ...rest } = r; return JSON.stringify(rest); };
let bad = 0;
function diff(x, y, p) {
  if (JSON.stringify(x) === JSON.stringify(y)) return false;
  if (typeof x !== 'object' || x === null || typeof y !== 'object' || y === null) { console.log('  ', p, JSON.stringify(x)?.slice(0, 100), '|', JSON.stringify(y)?.slice(0, 100)); return true; }
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) if (diff(x[k], y[k], p + '.' + k)) return true;
  return false;
}
for (const k of Object.keys(a)) {
  if (strip(a[k]) !== strip(b[k])) { bad++; if (bad <= 5) { console.log('DIFF', k); const { ms: _a, ...ra } = a[k]; const { ms: _b, ...rb } = b[k]; diff(ra, rb, k); } }
}
const sum = (r) => Object.values(r).flatMap(x => x.ms || []).reduce((s, v) => s + v, 0);
console.log(`scenes ${Object.keys(a).length}, differing ${bad}; redraw time ${sum(a).toFixed(0)} ms -> ${sum(b).toFixed(0)} ms`);
process.exitCode = bad ? 1 : 0;
