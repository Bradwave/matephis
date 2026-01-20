---
title: Box Plot Test
plot: true
---

# Box Plot Test

## Full Box
```matephis
{
    "boxPlot": true,
    "boxPlotPartial": false,
    "xlim": [-5, 5],
    "ylim": [-5, 5],
    "showXNumbers": true,
    "showYNumbers": true,
    "showXTicks": true,
    "showYTicks": true,
    "axisLabels": ["x", "y"],
    "data": [
        { "fn": "sin(x)", "color": "blue" }
    ]
}
```

## Partial Box
```matephis
{
    "boxPlot": true,
    "boxPlotPartial": true,
    "xlim": [-5, 5],
    "ylim": [-5, 5],
    "showXNumbers": true,
    "showYNumbers": true,
    "showXTicks": true,
    "showYTicks": true,
    "axisLabels": ["Time", "Value"],
    "data": [
        { "fn": "cos(x)", "color": "red" }
    ]
}
```
