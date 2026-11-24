#!/usr/bin/env node
/**
 * Builds the physics and sets bundles without their own copies of the plot engine's modules:
 * an import of any file in assets/js/matephis-plot-src becomes a read of
 * window.MatephisPlotModules (assets/js/matephis-plot-src/shared.js), which matephis-plot.js
 * fills. Same esbuild options as the other bundles otherwise.
 *
 *   node tools/build/engines.mjs physics|sets [--watch]
 */
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PLOT_SRC = resolve(ROOT, 'assets/js/matephis-plot-src') + sep;
const SHARED = [...readFileSync(join(PLOT_SRC, 'shared.js'), 'utf8').matchAll(/^\s*'([^']+\.js)':/gm)].map((m) => m[1]);

const ENGINES = {
    physics: { entry: 'assets/js/matephis-physics-src/index.js', out: 'assets/js/matephis-physics.js', global: 'MatephisPhysicsBundle' },
    sets: { entry: 'assets/js/matephis-sets-src/index.js', out: 'assets/js/matephis-sets.js', global: 'MatephisSetsBundle' },
};

const sharedPlot = {
    name: 'shared-plot',
    setup(build) {
        build.onResolve({ filter: /matephis-plot-src\// }, (args) => {
            const abs = resolve(args.resolveDir, args.path);
            if (!abs.startsWith(PLOT_SRC)) return undefined;
            const key = relative(PLOT_SRC, abs).split(sep).join('/');
            if (!SHARED.includes(key)) {
                return { errors: [{ text: `${key} is imported by ${relative(ROOT, args.importer)} but not listed in matephis-plot-src/shared.js` }] };
            }
            return { path: key, namespace: 'plot-shared' };
        });
        build.onLoad({ filter: /.*/, namespace: 'plot-shared' }, (args) => ({
            loader: 'js',
            contents: `var m = typeof window !== 'undefined' && window.MatephisPlotModules && window.MatephisPlotModules[${JSON.stringify(args.path)}];
if (!m) throw new Error('Matephis: load matephis-plot.js before this engine (needs ${args.path})');
module.exports = m;`,
        }));
    },
};

const name = process.argv[2];
const spec = ENGINES[name];
if (!spec) { console.error('usage: node tools/build/engines.mjs physics|sets [--watch]'); process.exit(2); }
const options = {
    entryPoints: [join(ROOT, spec.entry)],
    outfile: join(ROOT, spec.out),
    bundle: true,
    target: 'es2019',
    loader: { '.svg': 'text' },
    format: 'iife',
    globalName: spec.global,
    footer: { js: `if(typeof module==='object'&&module.exports){module.exports=${spec.global}.default;}` },
    minify: true,
    sourcemap: true,
    logLevel: 'info',
    plugins: [sharedPlot],
};
if (process.argv.includes('--watch')) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
} else {
    await esbuild.build(options);
}
