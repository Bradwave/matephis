# Plots and diagrams on slow hardware: how they render, and what to change

Review of 24 November 2026, written after the first test on the school smartboard (Dabliu E8/E8X: Android 8, 2× Cortex-A73 + 2× Cortex-A53, Mali-G51, 4 GB, 4K panel). It covers the plot, physics and sets engines, on note pages and on the board. Circuits are left out: they are a prototype.

Measurements were taken in headless Chrome on the Mac, at 1920×1080, with DevTools CPU throttling at 1×, 4× and 8×. **They measure JavaScript, style and layout only; pixel drawing and compositing are not slowed by CPU throttling.** On the board, those are the main unknown (see §6).

---

## 1. Your request, reviewed

**The four priorities don't quite fit together as written.**
- "Don't lose accuracy if the hardware can handle it" and "optimized at the core" are not in tension. Most of the gains below are pure wins: the same picture, computed with less work. Those should come first on every device, not only on slow ones.
- What does need care is the second kind of gain, where quality drops temporarily. I suggest defining accuracy as: **the picture at rest is always exact.** Only frames drawn *while* a slider or point is moving may be coarser, and full quality returns within a few hundred milliseconds of letting go. A fast machine should never even enter the coarse path, because it is switched on by measured frame times, not by device model. If that definition is acceptable, almost all the "slow hardware" work becomes safe.

**"Small file size" matters less than it seems, except in one place.**
- All engines together are about 240 KB brotli-compressed. MathJax alone is **515 KB brotli (2.1 MB uncompressed)**, loaded from jsDelivr on every page with maths and on the board whenever a widget has a formula. On a 2018 chip, *parsing* 2 MB of JavaScript costs more than downloading it. Trimming engine bytes is worth doing (§5), but MathJax is the big lever.

**"As wide a range of hardware as possible" needs a measurement on the real board.**
- Throttling the Mac only reproduces the CPU side. A Mali-G51 driving a 4K panel may be limited by pixel work instead, which no amount of JavaScript optimisation fixes. Until the board is measured, a part of this plan is a well-informed guess. The benchmark page that was paused is the way to settle it (§6).

**A correction to what I told you earlier.** I said rebuilding the grid and axes on every frame was the main cost of a plot redraw. The measurements say it isn't: grid and axes take 0.1 ms at 1× and 0.5 ms at 8×. The real costs are below.

**Two more corrections, found while implementing step 1** (details in §9):
- "Resolve only what is needed" (4.1) saves little on the heavy scenes, because nearly every object in them is needed at every instant.
- Keeping SVG nodes between frames (4.5) saves only about 12% of the style and layout time, because the browser re-lays out the whole diagram either way.

The exact, CPU-side headroom is therefore smaller than this report first suggested. That makes the measurement on the board (§6) more important, not less.

**On server-side rendering, from your earlier question.** It still doesn't help moving plots. But there is one form of it that does pay: typesetting *static* maths at build time (§5.3). That would let most pages skip MathJax entirely.

---

## 2. How rendering works today

### Plot engine (`matephis-plot-src`)
- **Output:** one SVG per plot, split into eight groups: background, grid, secondary grid, data, axes, numbers, labels, legend.
- **Each draw** (`core/plot.js:605`) empties all eight groups and rebuilds every node from scratch. Draws are coalesced to one per frame (`requestDraw`).
- **Expressions** are parsed and compiled to JavaScript functions once, then cached. Moving a slider never recompiles.
- **Explicit and parametric curves** use an adaptive sampler working in screen space (`renderers/curve-sampler.js`): about one starting sample every 2 px, then subdivision until the error is under 0.3 px, with proper handling of jumps and domain edges. This is accurate and already efficient.
- **Implicit curves** use marching squares on a grid with 4 px cells, capped at 40,000 cells (`renderers/implicit-sampler.js`).
- **MathJax labels** are cached by their TeX source, so a redraw reuses them. HTML labels are typeset in one batch per frame.
- **On note pages,** blocks are built lazily as they approach the screen (`core/lazy-init.js`).

### Physics engine (`matephis-physics-src`)
- **The whole motion is precomputed.** RK4 with a fixed `dt = 1/240`, from 0 to the end time, whenever a parameter changes. Playback then only looks up the state at time `t`, so playback timing is real-time and identical on any hardware. This is a good design.
- **After integrating,** `_sample` resolves the *whole scene* at up to 600 instants (`core/simulation.js:216`). This gives the largest vector of each kind (so arrows keep a fixed scale), the range of each energy chart, and the samples for the graphs.
- **Each frame** of playback rebuilds the scene SVG. It then rebuilds every visible graph, which is a full plot draw, with its data series rebuilt by `slice().map()` (`core/graphs.js:282`).

### Sets engine
- Same model: one full layout and rebuild per draw, coalesced to one per frame.

### Board
- **Ink** is drawn on canvases: background, committed ink and live stroke, each the size of the screen.
- **Widgets** (plots, physics, sets) are live engine instances inside one world-space DOM layer. That layer is moved by a single CSS `translate3d … scale` transform (`ui/overlay.js:84`). During pan or zoom it gets `will-change: transform` and is moved as one cached picture; at the end it is redrawn sharp.
- **Engines are loaded on demand** (`ui/engine-loader.js`). Physics and sets also load the plot engine, as a dependency.
- **Static bitmaps of widgets** (`ui/widget-pictures.js`, `ui/dom-picture.js`) are made by cloning the DOM into an SVG `foreignObject`, together with all the page's CSS and the board fonts inlined as base64. They are only made when needed: for the pinned page and for the experimental pixel effect.

---

## 3. Measurements

Each draw was triggered by a parameter change, 25 times, with forced layout included. Times are the median in ms, with the 95th percentile after the slash.

| Scenario | CPU 1× | CPU 4× | CPU 8× | Where the time goes |
|---|---|---|---|---|
| Plot, 4 functions (incl. `tan`) + legend | 1.2 / 1.5 | 5.2 / 7.1 | 8.7 / 12.6 | grid 0.5, sampling 3.0, **the rest (≈5) outside the drawing code**: DOM creation, style and layout |
| Plot, 2 implicit curves | 2.5 / 3.9 | 11.5 / 12.7 | **20.1 / 24.2** | marching squares 18.6 |
| Physics *mrua*, one frame | 1.0 | 4.5 | 8.8 | graphs 2.3 |
| Physics *urto 1D*, one frame | 2.1 | 6.8 | 14.5 | graphs 3.0 |
| Physics *mrua*, slider change | 3.9 | 9.6 | 17.2 | — |
| Physics *urto 1D*, slider change | 6.5 | 24.9 | **53.0** | see below |

Breakdown of one slider change, at 1×:

| Scene | Total | Integration (ODE) | `_sample` (whole scene at up to 600 instants) | Traces (`_statesAt`) |
|---|---|---|---|---|
| mrua | 5.6 | ≈0.5 | **3.9** | 2.3 |
| urto 1D | 9.6 | ≈1.2 | **7.5** | 3.7 |
| esplosione | 7.1 | ≈2.8 | 3.4 | 0.9 |
| urto 2D | 4.6 | ≈2.9 | 1.1 | 1.1 |

The traces column overlaps with `_sample`, because both resolve the scene. Integration is estimated as `_compute` minus `_sample`.

SVG sizes stay small: 37–275 nodes per diagram. So the node *count* is not the problem, and switching from SVG to canvas is not justified (§7).

**What this means.** At 60 fps a frame has 16.7 ms. If the board is around 8× slower than this Mac's CPU, then dragging a physics slider (17–53 ms), moving an implicit plot (20 ms) and playing a scene with graphs (9–15 ms) all miss that budget *before* any drawing of pixels. That matches what you saw.

---

## 4. Findings in the code, most important first

Each finding is marked:
- ✅ no change to any picture;
- ⏱ coarse only while moving, exact at rest.

### 4.1 Physics: a slider change re-resolves the whole scene up to 600 times ✅⏱
`_sample` takes 40–80% of a slider change (§3). It calls `resolver.resolveAll()` on the whole scene at every instant: every body, vector, label and annotation. It needs only three things:
- **graph samples:** most graph expressions only read state variables (`v1`, `m1*v1`) and don't need resolved objects at all;
- **largest vector of each kind:** needs only the vectors;
- **energy ranges:** need only the energy objects.

Fixes:
- **✅ Resolve only what is needed.** Evaluate graph expressions directly when they don't reference object properties (like `A.speed`), and resolve only vectors and energy objects for the maxima. Expected: the cost of `_sample` falls by several times.
- **⏱ While a slider is dragged, sample coarsely,** for example 60 instants instead of 600, then do the full pass once the slider has been still for about 150 ms. Arrow scales must not jump in the meantime, so keep the previous maxima until the full pass.
- Traces (`_statesAt` at every `TRACK_DT`) resolve the scene in the same way and get the same treatment.

### 4.2 Physics playback redraws every graph as if it were new ✅
On every frame, each visible graph rebuilds its series from scratch (`slice().map()` over up to 600 samples per curve). It then does a full plot draw: grid, axes, numbers, curves, legend. Usually only the cursor moved. Only curves with `progressive: true`, which grow with time, actually change.

Fix: draw the curves once per run. Each frame, only move the cursor (one line and a few dots) and the "up to now" fill. That removes about 2–3 ms per frame at 8×, and most of the DOM churn.

### 4.3 Plots resample every curve when any one thing changes ✅
A slider `a` that appears in one curve out of five causes all five to be resampled. In a physics graph, all curves are resampled when only time moved.

Fix: a **cache per data item**, keyed on what the item actually depends on: the view, the size, and the values of the parameters and points its expressions use. The parser already builds an AST, so the names an expression reads can be collected once when it's compiled. An item whose inputs didn't change reuses its polylines. This is the "core" optimisation, and it costs no accuracy.

### 4.4 Implicit curves are the most expensive item ⏱✅
Marching squares at 4 px cells costs 18.6 ms at 8× for two curves.
- **⏱ While dragging,** use 8 px cells (four times fewer evaluations), then redraw at 4 px once still.
- **✅** The cache in 4.3 means that moving an unrelated slider no longer recomputes them.
- **✅** Check that the grid values live in a `Float64Array` and that corner values shared between cells are evaluated once. The edge crossings are already shared.

### 4.5 Every draw throws away the whole SVG ✅
At 8×, about 5 of the 8.7 ms of a simple plot draw are spent outside the drawing functions. Most of that is the browser creating and styling about 100 fresh nodes, and laying them out. (A performance trace would split it exactly; the share is clear enough to act on.)

Fix: keep the grid, axes and numbers groups when view, size and theme haven't changed, which is the case for every slider move or point drag. In the data group, reuse `<path>` elements and only update `d`. This lowers style and layout work, and it's also what makes 4.2 cheap.

### 4.6 Slider animations depend on the frame rate ✅ (an accuracy bug)
`ui/slider-manager.js:351` moves the parameter by a fixed `speed` *per frame*, and only when `timestamp - lastTime >= 1000/60`:
- **On a board that manages 30 fps,** an animated parameter moves at half speed.
- **On a 60 Hz screen,** frames that arrive 16.6 ms apart instead of 16.7 ms are skipped, so even fast machines can drop to an irregular 30 fps.
- **On a 120 Hz screen,** it's capped at 60 updates per second.

Fix: advance by elapsed time (`speed × elapsed / (1000/60)`), like the physics clock already does. The animation then looks the same on all hardware, just smoother where frames allow.

### 4.7 Layout reads during drags ✅
`interaction/pointer.js:42`, `376` and `554` call `getBoundingClientRect()` on every pointer move, right after the previous frame changed the SVG. That forces a synchronous layout, and on a long note page that layout isn't limited to the plot.

Fix: measure once at the start of the gesture (and on resize).

### 4.8 Off-screen work ✅
- Physics scenes pause when off-screen (an IntersectionObserver in `core/clock.js`).
- Plot slider animations don't. They keep redrawing after being scrolled away, or when the board camera moves away from the widget.

Fix: the same observer for plot slider animations. On the board, also pause widgets outside the camera view.

### 4.9 Board: full-screen layers at device resolution, and widget pictures ✅
- **Screen-sized canvases.** The board composites three full-screen canvases plus the widget layer. At 4K, each canvas is about 33 MB of pixels. `lowDpr` (cap the resolution at 1×) exists but is off by default. A Mali-G51 at 4K may well be limited by memory bandwidth here, regardless of JavaScript.
- **`will-change: transform`** is switched on at the start of each pan (`matephis-board.css:148`). That makes the browser paint the whole widget layer into a new GPU texture right then, which is a spike at exactly the wrong moment.
- **Widget pictures** serialise all the page's CSS and inline the fonts as base64 for each picture. That's fine on a Mac, but heavy on the board. They are only built for the pinned page and the pixel effect, so keep the pixel effect off on slow devices.

### 4.10 Smaller things
- `widget-pictures.js` `signatureOf` runs `JSON.stringify` on the widget's whole data on every `get()` call.
- Physics `_signature()` stringifies all parameters on every `prepare()`, which is every frame. Both are cheap now, but become per-frame costs once everything else is fast. A version counter bumped on each change would replace them.

---

## 5. File size

### 5.1 Plot code is bundled three times
Measured from esbuild's report of what goes into each bundle:

| Bundle | Raw | Brotli | Plot engine code inside it |
|---|---|---|---|
| plot | 132 KB | 38.6 KB | — |
| physics | 204 KB | 61.1 KB | ≈ 45 KB raw (parser 14, slider manager and UI 17, core 10, renderers 4) |
| sets | 186 KB | 57.0 KB | ≈ 40 KB raw |

Physics already requires the plot engine on the board, and pages with both load both. Fix: have physics and sets use the plot bundle's exports at run time (`window.MatephisPlot` and friends) instead of bundling copies. Load `matephis-plot.js` first wherever physics or sets appear: the Jekyll asset injector on pages, and the existing dependency on the board. That saves about 25 KB brotli per page that has two or three engines, and the browser has less code to parse.

### 5.2 The board loads code most sessions never use
Measured in the board bundle (74 KB brotli). These parts can be split out and loaded on first use, the way engines already are:

| Part | Size |
|---|---|
| physics presets | 22 KB |
| sets presets | — |
| future menus, mostly stubs | 29 KB |
| exercise picker | 19 KB |
| SVG and PDF export | 23 KB |

Together that's roughly 90 KB raw, about 25 KB brotli.

### 5.3 MathJax: 515 KB brotli, the largest single cost
- **Typeset static maths at build time.** Run MathJax in Node during the Jekyll build, either as a plugin hook or a build script, and save the formulas into the HTML as SVG. This is free and works with GitHub Pages if the site is built by a GitHub Action, or locally before pushing. Pages without dynamic labels then never load MathJax. This is the one kind of "server-side rendering" from your earlier question that does pay off.
- **Labels in plots and physics** could be pre-rendered the same way when they don't depend on parameters. MathJax would then load only on the board, or on pages with labels that do depend on parameters.
- **As a smaller step,** a custom MathJax component build with only the TeX packages actually used would shrink the download without changing any output.

---

## 6. Measuring the board itself

The Mac numbers show the CPU side. The board decides what matters on the graphics side. The benchmark page from the paused task (`/board/bench`) would:
- report Chrome version, screen size, pixel ratio, cores and memory;
- replay fixed scenarios: a plot slider, an implicit plot, physics playback and a physics slider, ink strokes, and pan and zoom;
- report frame intervals.

Those frame intervals include pixel drawing on the real hardware. Comparing them with the throttled Mac runs (the script used for this report: `scratchpad/bench/cdp-bench.mjs`, to be moved into the repository) gives a calibrated slowdown factor for everyday development. It also tells whether the 4K layers (§4.9) or the JavaScript (§4.1–4.5) dominate.

---

## 7. Options considered and set aside

- **Canvas instead of SVG for plots.** The diagrams are small, 37–275 nodes, so SVG's per-node overhead isn't the bottleneck. Moving to canvas would lose crisp scaling on the board's zoom, the SVG and PDF export, MathJax labels and CSS theming. Not worth it.
- **Web Workers for physics and implicit curves.** They would keep the page responsive, but the expressions would have to be compiled again inside the worker, results copied back, and requests ordered. Worth reconsidering only if 4.1 and 4.4 aren't enough.
- **WebGL.** It's the most fragile option on old Android graphics drivers, and these scenes are far too simple to need it.
- **Server-side rendering of moving diagrams.** It adds network delay to every frame (see the earlier discussion). Only the build-time static maths in 5.3 is worth doing.

---

## 8. Proposed order

1. **Core, same output everywhere** (one PR per engine):
   - physics: 4.1 "resolve only what is needed" and 4.2;
   - plot: 4.3, 4.5, 4.6, 4.7, 4.8.

   These help every device, and some of them fix bugs.
2. **Benchmark page and one session on the board** (§6), to see what's left and whether the graphics side dominates.
3. **Coarse-while-moving, exact at rest**, switched on by measured frame time: physics sampling (4.1), implicit grid (4.4).
4. **Board low-power profile:** automatic, with a manual override. `lowDpr`, no `will-change` toggling, no pixel effect, and pausing widgets off-screen.
5. **File size:** shared plot code (5.1), lazy board parts (5.2), build-time MathJax (5.3). These are independent of the rest and can go in any time.

---

## 9. Results of step 1 (physics), and corrections

### What was done
- **Kinematics in one pass.** Velocities and accelerations of bodies come from positions at three instants around `t`. These were resolved separately for each body, and are now resolved once per instant for all bodies.
- **States remembered per run.** Precomputing asks for the same instants several times, and each time cost an RK4 sub-step; now each instant is computed once.

### Checking that nothing changed
All 97 physics scenes were fingerprinted before and after the change: every `physics` block in the notes plus all board presets, with random parameters seeded. Each fingerprint covers run length, kinematics, traces, ghosts, vector maxima, energy ranges, skids, graph samples and limits, both at load and after two changes each of up to three parameters. Result: **identical in all 97 scenes.**

### Gain
- Slider changes on the heaviest scenes are 15–25% faster: for example test-physics #34 went from 9.1 to 7.3 ms, and the *leggero contro pesante* preset from 7.7 to 6.2 ms, at 1× CPU.
- Over all scenes the gain is 8%. Many scenes have no kinematics to compute.

### What the measurements changed in the plan
- **4.1, "resolve only what is needed":** a CPU profile of the heaviest scenes is flat, with no hotspot; the time is spread over resolving the objects themselves. In those scenes (collisions, energy charts) almost every object is needed at every instant, so skipping objects saves little. The big lever for slider drags is therefore the coarse-while-moving sampling (step 3), not an exact shortcut.
- **4.5, retained SVG:** in normal page flow, updating the attributes of *every* node of a 200-node scene costs 0.71 ms of style and layout, against 0.81 ms for rebuilding it. Keeping nodes is not worth its complexity now.
- **CSS containment** (`contain: layout style paint`) on the containers made no difference in normal page flow (0.70–0.71 ms for every variant).
- **Physics playback** at 4× CPU costs 0.6–8.4 ms per frame, about two thirds of it style and layout. At 8× the heaviest scene (*urto 1D*) is around 15 ms. That's close to the 16.7 ms frame budget but mostly within it, so if playback lags on the board, the graphics side is the more likely cause. Only the board measurement can confirm it.

---

## 10. Coarse while moving: deciding when, without hurting fast devices

**Measure the work itself, not the device.** Device model, core count (`hardwareConcurrency`) and `deviceMemory` are weak signals. A start-up micro-benchmark is noisy: it's measured before the code is optimised by the JIT, it's affected by heat throttling and background tabs, and it says nothing about *this* diagram. What matters is whether *this* diagram, at *this* size, redraws exactly within the frame budget on *this* device.

So each engine times its own exact redraws during an interaction, and the coarse path is used only when they don't fit:
- **Budget:** about 10 ms of script per frame, leaving room for the browser to style, lay out and paint.
- **Start exact.** The first frames of every drag are always exact; they are the measurement.
- **Several frames, not one.** Switch to coarse only after, for example, 3 of the last 5 exact frames are over budget. A single slow frame (garbage collection, MathJax, first run before the JIT has optimised) never triggers it.
- **Hysteresis.** Stay coarse until the drag ends. A drag is never switched back and forth.
- **Exact at rest, always.** Within about 150 ms of the last change, one exact redraw replaces the coarse picture.
- **Frame intervals as a second signal.** `requestAnimationFrame` intervals include the painting work that script timing can't see. Coarse mode is only worth it if the script time is a big part of a slow frame; if painting dominates, coarse sampling won't help, and the board profile (lower resolution) is the right tool.

**Make the estimate robust over time, not a one-off.**
- **Keep a running average per device and per kind of work** (implicit curve per 1,000 cells, physics sample per instant), stored in `localStorage` with a slow decay. A new diagram then starts with a good guess, but each drag still decides from its own frames.
- **Weigh it by work size.** A 600-sample physics scene and a 40-sample one are compared by cost per instant, not by total time.
- **Ignore outliers:** hidden tabs, the first draw after load, and frames longer than 200 ms (a stall, not a trend).
- **A manual override** on the board: *automatic / always exact / always fast*. Also a URL parameter (`?quality=exact|fast`) for testing on any device.

**On a fast machine this never switches on.** Typical exact redraws there take 1–3 ms against a 10 ms budget, so the condition is never met. The only exception is an extreme diagram that is slow even on fast hardware, where coarse-while-moving is the right behaviour anyway.

**Does it help on the board for pan, zoom and moving widgets? No, those are graphics work:**
- **Pan and zoom** move the whole widget layer with one CSS transform. No engine redraws; the browser only repaints the SVG at the new scale when the gesture ends.
- **Moving a widget** (`ui/widgets.js`, grip drag) changes its `left/top`. That causes a repaint of the layer but no engine redraw. If ink strokes are on the widget, all ink is redrawn on every move (`requestCommittedRedraw`). Cheaper: move the widget with a `transform` on its own GPU layer during the drag and set `left/top` at the end; draw the moving strokes on the live layer.
- **Resizing a widget** *does* redraw the engine on every pointer move (`_resizeInstance` → `instance.resize`). That is where coarse rendering, or at least redrawing at most once per frame with a CSS-scaled preview, would help.
