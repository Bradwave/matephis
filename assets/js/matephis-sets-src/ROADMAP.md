# Sets engine — roadmap

Phase 1 (sets and maps, images, preimages, collisions, properties, probes)
is done: see `_notes/Public/test-sets.md`. Options of later phases are
already reserved in `core/config.js` and only warn.

Syntax below is a proposal until it lands in `test-sets.md`. Any change to
the ```` ```sets ```` syntax must update that page: the function exercises
(`claude/esercizi-funzioni`) use these blocks.

## 1. What the function exercises need — done

- `piecewise` maps: pieces `on` an interval (or a point) or `if` a
  condition; images are unions of intervals, injectivity checks each piece
  and that their images are disjoint, gaps make the map undefined.
- `inverse`: the inverse of a map between finite sets and intervals, a
  relation when the map is not bijective (the properties badge says why;
  no warning, since showing that is often the point).
- `preimage` from an interval into a finite set, and from the plane into an
  interval (level curves and regions).
- Numeric checks into the plane: curves (self-intersection), plane → plane
  (sign of the Jacobian, simple boundary, coverage of the codomain).
- Not covered yet: inverses of maps from or into the plane, images of
  piecewise maps in the plane, preimages into the plane.

## 2. Dynagraphs, linked plots and composition — 2a–2c done, 2d open

Done (documented in `test-sets.md`): `"dynagraph"` (shared scale, ticks,
thin sample arrows), probe `"trace"`, probes that step through a
composition (with the direct dashed arrow when `arrows(gf)` is shown),
nested selectors (`image(g, image(f))`), and `"plot"` (graphs from the maps'
own formulas, params kept in sync both ways, `"construction"`). The site
loads the plot engine on pages whose sets blocks have a `"plot"`
(`_plugins/asset_injector.rb`). Inverses are drawn as reflected graphs.

Still open: 2d (`"sync"` between separate blocks; reserved, warns), which
needs a change in the plot engine's slider manager.

The original plan follows.


A dynagraph is a set of parallel number lines with arrows x → f(x). The
engine already draws most of it (intervals in `"layout": "column"`, sampled
arrows, probe), so it is a layout, not a new kind of diagram.

### 2a. Dynagraph layout

```json
{
  "dynagraph": { "scale": "shared", "ticks": 1, "arrows": 9 },
  "sets": [
    { "id": "X", "interval": "R", "window": [-3, 3] },
    { "id": "Y", "interval": "R", "window": [-3, 3] }
  ],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "x^2 - 1" }],
  "params": { "p": { "min": -3, "max": 3, "step": 0.01, "val": 1 } },
  "probe": { "map": "f", "at": "p", "trace": true }
}
```

- Parallel lines (horizontal by default), aligned so that the same number is
  at the same spot on every line (`"scale": "shared"`); ticks and numbers.
- `arrows`: how many sample arrows (the current `samples`), drawn thin; the
  probe arrow is the strong one.
- `trace`: dragging the probe leaves a faint trail of past arrows, which shows
  where f stretches, folds (non-injective) or misses values.

### 2b. Composition on a dynagraph

Three lines X, Y, Z with f: X → Y, g: Y → Z and `gf = compose(f, g)`:

- the probe on X follows p → f(p) → g(f(p)) across the three lines;
- the composition is a dashed arrow straight from X to Z (p → (g∘f)(p)),
  shown or hidden with a button (`"arrows(gf)"`), so students see that it is
  the same point reached in two steps;
- selectors already work on the chain: `image(gf)`, `preimage(gf, …)`,
  `properties(gf)`, and `image(g, image(f))` (new: a selector as argument).

### 2c. A plot inside the sets diagram

```json
"plot": { "maps": ["f", "g", "gf"], "position": "right", "probe": true, "xlim": [-3, 3] }
```

- Draws the graphs of the listed maps with the plot engine, from the same
  `expr` (one source of truth: no formula written twice).
- Shares params and the probe: dragging p on the dynagraph moves the points
  (p, f(p)), (f(p), g(f(p))) and (p, g(f(p))) on the graphs, and dragging a
  point on the graph moves the probe.
- `"construction": true` for composition: from p up to the graph of f,
  across to the line y = x, up to the graph of g; the same path as the arrows
  of the dynagraph, drawn on the plane.
- Other keys are passed to the plot (xlim, ylim, grid, …).
- Uses `window.MatephisPlot` at run time (the page needs `plot: true` too);
  the plot code is not bundled twice. A warning when it is missing.
- `"position"`: `"right"` (side by side, stacked on narrow screens) or
  `"below"`.

### 2d. Linking separate blocks

For a hand-written plot next to a sets diagram (or a physics scene):

```json
"sync": "es1"
```

on both blocks: params with the same name stay in sync between blocks of the
same group on the page. A small event bus in the shared slider manager
(`matephis-plot-src/ui/slider-manager.js`), so plot, physics and sets get it
together. This touches the plot and physics bundles: coordinate with their
branches before building them.

## 3. Venn and Euler diagrams

`venn`, `subsets`, `shape`; selectors for set operations (`A ∩ B`, `A ∪ B`,
`A ∖ B`, complement); regions shaded by selector, as images are today.

## 4. Relations and partitions

Equivalence classes and quotients, order relations (Hasse diagrams),
`relations`, `partition`, `order`.

## 5. Iteration and commutative diagrams

- `iterate`: x₀, f(x₀), f(f(x₀)), … step by step with buttons (no tweening),
  on a dynagraph (arrows on one line) and on the plot (cobweb).
- `cd`: commutative diagrams, with a check that both paths give the same map.

## Groundwork (any time)

- DOM tests of the rendering (today only model and layout are tested).
- A screen-reader summary of the properties.
- Ready-made examples in the playground.
- A "choose the answer" mode: the student says injective / surjective before
  the reveal.
