#!/usr/bin/env node
/**
 * Builds the board as an ES module with code splitting: assets/js/matephis-board/board.js plus
 * chunks/ for the parts loaded on first use (presets, exercise picker, PDF export). Chunk names
 * carry a content hash, so they never need a ?v=; the folder is emptied first, so no stale
 * chunk stays behind (CI compares it with the committed copy).
 *
 *   node tools/build/board.mjs [--watch]
 */
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'assets/js/matephis-board');
rmSync(OUT, { recursive: true, force: true });

const options = {
    entryPoints: { board: join(ROOT, 'assets/js/matephis-board-src/index.js') },
    outdir: OUT,
    chunkNames: 'chunks/[name]-[hash]',
    bundle: true,
    splitting: true,
    format: 'esm',
    target: 'es2019',
    loader: { '.svg': 'text' },
    minify: true,
    sourcemap: true,
    logLevel: 'info',
};
if (process.argv.includes('--watch')) {
    await (await esbuild.context(options)).watch();
} else {
    await esbuild.build(options);
}
