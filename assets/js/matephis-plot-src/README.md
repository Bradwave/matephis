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
`DOMContentLoaded`, after MathJax) and via `require()` (returns the `MatephisPlot` class).
Set `window.MATEPHIS_NO_AUTO_INIT = true` before loading to disable auto-rendering.

## Layout

```
index.js                      entry: globals + auto-init
core/
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
  mathjax-bridge.js           cached tex2svg labels
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
- **Implicit curves** use a pixel-sized grid, reject sign changes through poles and stitch
  segments into polylines (dash patterns render correctly).
- **Geometry cache.** Every line-like item stores its screen polylines in `plotData`
  (snapping, selection, slopes); draggable things are registered in `handles`.
- **Redraws are coalesced** with `requestDraw()` (one per animation frame).

## Adding an icon

Drop a Material Symbols `.svg` (with `fill="currentColor"`) in `ui/icons/` and add one import
line to `ui/icons.js`. esbuild's text loader inlines it into the bundle.

## Host API (Obsidian etc.)

```js
const plot = MatephisPlot.render(element, jsonStringOrObject); // plot or group
plot.destroy();                                                 // on unload
```
