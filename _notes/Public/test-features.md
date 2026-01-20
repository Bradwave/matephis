---
layout: Post
title: Test Features
plot: true
---

# Feature Test

## 1. Explicit Function (Parabola)
- **Point Selection**: enabled.
- **Slope Selection**: enabled.
- **Tangent Selection**: enabled.

```matephis
{
    "width": 600,
    "height": 400,
    "xlim": [-5, 5],
    "ylim": [-5, 5],
    "axisLabels": ["x", "y"],
    "pointSelection": true,
    "slopeSelection": true,
    "tangentSelection": true,
    "slopeLabel": "m",
    "data": [
        { "fn": "x^2", "color": "red" }
    ]
}
```

## 2. Implicit Function (Circle)
Testing interactions on implicit curves.

```matephis
{
    "width": 600,
    "height": 600,
    "xlim": [-5, 5],
    "ylim": [-5, 5],
    "pointSelection": true,
    "slopeSelection": true,
    "tangentSelection": true,
    "data": [
        { "implicit": "x^2 + y^2 = 9", "color": "blue" }
    ]
}
```

## 3. Vertical Line
Testing interactions on vertical lines.

```matephis
{
    "width": 600,
    "height": 400,
    "pointSelection": true,
    "slopeSelection": true,
    "tangentSelection": true,
    "data": [
        { "x": 2, "color": "green", "range": [-4, 4] }
    ]
}
```
