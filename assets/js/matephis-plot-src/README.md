# matephis-plot

SVG plotting library used by the site (`assets/js/matephis-plot.js` is the built bundle).
Plots are written as JSON in ```` ```matephis ```` code blocks; see `_notes/Public/test-plot.md`
for the full option reference with live examples.

## Build & test

```bash
npm run build     # bundle -> assets/js/matephis-plot.js (+ .map)
npm run dev       # esbuild watch + jekyll serve
npm test          # vitest (parser, samplers, coordinate system)
```

The bundle works both as a `<script>` (sets `window.MatephisPlot` and auto-renders on
`DOMContentLoaded`) and via `require()` (returns the `MatephisPlot` class).
Set `window.MATEPHIS_NO_AUTO_INIT = true` before loading to disable auto-rendering.

Auto-rendering is lazy (`core/lazy-init.js`, shared by the plot, physics and sets engines):
on `DOMContentLoaded` every block gets a placeholder of about its size, and is built once
MathJax has typeset the page and the block is within about one viewport of the screen, the
ones on screen first, a few at a time with a yield in between. Sets blocks with the same
`"sync"` are built together. To build everything at once:

- `window.MATEPHIS_EAGER = true` before the scripts load (no lazy building);
- `window.MatephisLazy.flush()` (or `flush(root)`) builds what is still waiting, now;
- `MatephisPlot.init(root)` without `{ lazy: true }` builds every block in `root` now, as before;
- printing builds every block (`beforeprint`).

`MatephisPlot.render(el, source, options)` (and the same in the other engines) always builds
right away. `options.width` passes the box's width when the caller has measured it; otherwise
it is read before the first draw, so the first draw has the final width and the
ResizeObserver's first report changes nothing.

## Layout

```
index.js                      entry: globals + auto-init
shared.js                     modules physics and sets read from this bundle (window.MatephisPlotModules)
core/
  lazy-init.js                lazy building of a page's blocks (all three engines), placeholders
  plot.js                     MatephisPlot: lifecycle, layout, resize, draw orchestration, lightbox, destroy
  group.js                    MatephisPlotGroup: several small plots in a row / grid ("plots": [...])
  config.js                   valid keys, palettes, validation, small helpers
  coordinate-system.js        linear/log transforms, pan/zoom math
parser/
  expression-parser.js        tokenizer + Pratt parser + code generator (real & complex), compile cache
renderers/
  curve-sampler.js            adaptive screen-space sampler for y=f(x), parametric, polar, complex curves
  implicit-sampler.js         marching squares + stitching for F(x, y) = 0
  grid-renderer.js            grid, axes, tick numbers, axis labels        (mixin)
  data-renderer.js            data series, vectors, angles, labels, legend (mixin)
  mathjax-bridge.js           MathJax for the three engines: cached tex2svg labels, one typeset
                              queue for HTML labels (one MathJax call per frame), TexNodes
  svg-factory.js              SVG helpers
interaction/
  pointer.js                  mouse, touch, wheel, keyboard                (mixin)
  selection.js                point / slope / tangent selection            (mixin)
ui/
  plot-toolbar.js             toolbar                                       (mixin)
  toolbar.js                  button factory
  slider-manager.js           parameter sliders + animation
  lightbox-bridge.js          fullscreen overlay (moves the live plot, no cloning)
  icons.js, icons/*.svg       toolbar icons, inlined at build time
```

Mixins are plain objects merged into `MatephisPlot.prototype`, so methods keep using `this`.
Pure modules (parser, samplers, coordinate system) have no DOM dependency and are unit-tested.

## Design notes

- **Expressions are compiled once.** `ExpressionCompiler.fn(src, vars)` parses to an AST and
  generates a JS function reading parameters and named points from live scope objects;
  results are cached by source. Moving a slider or dragging a point never recompiles.
- **Curves are sampled in screen space.** Refinement uses the 2D distance of the midpoint from
  the chord, so accuracy is the same on any axis scale; jumps are told apart from steep
  continuous segments by bisection; parts far outside the view are not refined.
- **MathJax is called as little as possible.** On a page with hundreds of formulas each call
  to MathJax, and each layout read right after a DOM change, costs a restyle or relayout of
  the whole page. SVG labels are cached by TeX; HTML labels of every block (slider labels,
  captions, readouts) are typeset together, once per frame, after the page's own typeset;
  formulas redrawn unchanged are the same nodes again; heights and baselines are read in one
  pass after all the writes.
- **Implicit curves** use a pixel-sized grid, reject sign changes through poles and stitch
  segments into polylines (dash patterns render correctly).
- **Geometry cache.** Every line-like item stores its screen polylines in `plotData`
  (snapping, selection, slopes); draggable things are registered in `handles`.
- **Redraws are coalesced** with `requestDraw()` (one per animation frame).
- **One copy for all engines.** Physics and sets import the plot modules listed in `shared.js`
  from this bundle at run time instead of carrying copies (`tools/build/engines.mjs`), so this
  bundle must load first (Post.html and the board's engine loader do).
- **Sampled curves are cached between draws** (`renderers/sample-cache.js`), keyed on the visible
  window and size, the item's settings and the values of the parameters and points its
  expressions read (found in the generated code). Moving one slider resamples only the curves
  that use it; a redraw with nothing changed resamples nothing.
- **Slider animations follow the clock**, not the frame rate: `speed` per 1/fps s on any device,
  values on the grid min + k·speed; they pause while the plot is off screen.

## Adding an icon

Drop a Material Symbols `.svg` (with `fill="currentColor"`) in `ui/icons/` and add one import
line to `ui/icons.js`. esbuild's text loader inlines it into the bundle.

## Host API (Obsidian etc.)

```js
const plot = MatephisPlot.render(element, jsonStringOrObject); // plot or group
plot.destroy();                                                 // on unload
```
