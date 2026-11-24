# Bench tools

Measurement and exactness tools for the engines and the board. They drive headless Chrome over
the DevTools protocol, with no dependencies (Node 22 or newer; `CHROME=/path` if Chrome is not
in the usual place). They need the site served locally (`bundle exec jekyll serve`, port 4000).

## Board benchmark: `/board/bench/`

The page (`assets/js/matephis-board-src/bench/`) runs the real board pieces in a full-screen
stage and replays fixed scenarios. It measures frame intervals, which include painting, and the
script time of each frame:

- CPU score;
- full-screen fill;
- writing;
- pan and zoom (moving a picture of the board, full redraw, and at 1× resolution);
- a plot moved by a slider (functions, implicit curves);
- physics playback and a physics slider.

Open it on a device, run it, and copy or download the results.

```bash
node tools/bench/run-headless.mjs --cpu 1,4,8 --size 1920x1080 --out mac.json
```

This runs the same page headless with CPU throttling. The board's `cpu` score divided by the
Mac's at 1× gives the throttling factor that matches the board's processor. The other
scenarios then show what the processor explains and what is left to the graphics side.

## Exactness of engine changes

```bash
node tools/bench/fingerprint.mjs --engine physics --bundle old-physics.js --out before.json
npm run build:physics
node tools/bench/fingerprint.mjs --engine physics --out after.json
node tools/bench/compare.mjs before.json after.json
```

- **Physics** fingerprints everything a simulation precomputes, for every `physics` block of
  the notes and every board preset.
- **Plot** (`--engine plot`) fingerprints the SVG of every `matephis` block.

Each scene is checked at load and after parameter changes; plots also after a pan and on an
unchanged redraw. Random parameters are seeded. `compare.mjs` exits with 1 when any scene
differs.
