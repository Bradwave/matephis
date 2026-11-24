# Maths typeset at build time

`prerender.mjs` runs after `jekyll build` (in the deploy workflow and in CI). It turns every
`$…$`, `$$…$$`, `\(…\)` and `\[…\]` of the built pages into SVG, as MathJax 3.2.2 in the
browser would:

- **Same MathJax setup as the browser:**
  - the same configuration as `_layouts/Post.html`;
  - the tex-svg component's TeX packages, plus the extensions it would load on demand;
  - a global font cache;
  - hidden MathML for screen readers.
- **Pages get marked:** typeset pages get `data-mathjax="prerendered"` on `<html>`. `Post.html`
  then does not load MathJax: the plot, physics and sets engines load it themselves when a label
  needs TeX (`renderers/mathjax-bridge.js`), so engine pages without TeX skip it too.
- **Pages without maths are not touched.** Without the build step (`jekyll serve`), every page
  loads MathJax as before.

```bash
npm run prerender:math              # after bundle exec jekyll build
node tools/mathjax/prerender.mjs _site --check   # typeset without writing
```

## Keeping it identical to the browser

```bash
bundle exec jekyll build -d /tmp/site
node tools/mathjax/check.mjs /tmp/site
```

`check.mjs` pre-renders a copy of the build and serves both copies, then compares every formula
of the page text in headless Chrome:
- the SVG markup;
- the size on screen;
- the hidden MathML.

It also prints the font metrics the browser measured around the formulas.

At the time of writing:
- **8,137 formulas checked, 8,123 identical.**
- **12 differ only by rounding** (a tenth of a thousandth of an em).
- **2 differ by a few pixels of spacing:** they contain characters that are not in MathJax's
  fonts (`è` inside `\text{}`, `×` and `⁻⁸` typed as Unicode). The server has to estimate those
  widths.

**After changing fonts or font sizes** in `assets/css/style.css`, run `check.mjs`, then update
`METRICS` in `prerender.mjs` with the values it prints. They matter only around small text,
because they set the smallest size of second-level scripts.

Note that the browser itself varies here: it measures x-height 7.317 or 7.5 for the same text,
depending on whether the web font had loaded when MathJax ran. Phones use 15 px text instead of
14 px.
