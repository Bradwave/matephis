---
title: Test Box Plot
feed: hide
plot: true
---

## Box Plot Test

### Default Box Plot (Numbers Outside)

```json
{
  "boxPlot": true,
  "xlim": [-10, 10],
  "ylim": [-5, 5],
  "data": [
    { "fn": "sin(x)" }
  ]
}
```

```matephis
{
  "boxPlot": true,
  "xlim": [-10, 10],
  "ylim": [-5, 5],
  "data": [
    { "fn": "sin(x)" }
  ]
}
```

### Box Plot with Numbers Inside (Proposed)

Currently this will look same as above until implemented.

```json
{
  "boxPlot": true,
  "boxNumbersInside": true,
  "xlim": [-10, 10],
  "ylim": [-5, 5],
  "data": [
    { "fn": "cos(x)", "color": "blue" }
  ]
}
```

```matephis
{
  "boxPlot": true,
  "boxNumbersInside": true,
  "xlim": [-10, 10],
  "ylim": [-5, 5],
  "data": [
    { "fn": "cos(x)", "color": "blue" }
  ]
}
```
