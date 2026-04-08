---
title: Attività sulla derivata
feed: hide
plot: true
draw: true
slides: true
---
## 1. Comprendere attraverso i punti di una funzione quando essa cresce o decresce

In figura è rappresentato il grafico del volume d'aria presente nei polmoni di una persona durante una respirazione regolare.

```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "xlim": [0,5],
  "ylim": [2,3],
  "boxPlot": true,
  "boxNumbersInside": true,
  "aspectRatio": "3:2",
  "axisLabels": ["t","V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "showXTicks": true,
  "showYTicks": true,
  "interactive": true,
  "constrainView": true,
  "pointSelection": true,
  "padding": 55,
  "data": [
    { "fn": "0.6*sin(pi*x/2.5)^4+2.2", "color": "red1", "domain": [0,6], "derivativeColor": "black1" },
    { "points": [[0.25,"0.6*sin(pi*0.25/2.5)^4+2.2"],[0.75,"0.6*sin(pi*0.75/2.5)^4+2.2"],[1,"0.6*sin(pi*1/2.5)^4+2.2"],[1.25,"0.6*sin(pi*1.25/2.5)^4+2.2"],[1.5,"0.6*sin(pi*1.5/2.5)^4+2.2"],[1.75,"0.6*sin(pi*1.75/2.5)^4+2.2"],[2,"0.6*sin(pi*2/2.5)^4+2.2"],[2.25,"0.6*sin(pi*2.25/2.5)^4+2.2"]], "fillColor": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

---

## 2. Retta secante, retta tangente, sua pendenza

```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "xlim": [0,5],
  "ylim": [2,3],
  "boxPlot": true,
  "boxNumbersInside": true,
  "aspectRatio": "3:2",
  "axisLabels": ["t","V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "showXTicks": true,
  "showYTicks": true,
  "interactive": true,
  "constrainView": true,
  "pointSelection": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "padding": 55,
  "data": [
    { "fn": "0.6*sin(pi*x/2.5)^4+2.2", "color": "red1", "domain": [0,6], "derivativeColor": "black1" },
    { "points": [[0.25,"0.6*sin(pi*0.25/2.5)^4+2.2"],[0.75,"0.6*sin(pi*0.75/2.5)^4+2.2"],[1,"0.6*sin(pi*1/2.5)^4+2.2"],[1.25,"0.6*sin(pi*1.25/2.5)^4+2.2"],[1.5,"0.6*sin(pi*1.5/2.5)^4+2.2"],[1.75,"0.6*sin(pi*1.75/2.5)^4+2.2"],[2,"0.6*sin(pi*2/2.5)^4+2.2"],[2.25,"0.6*sin(pi*2.25/2.5)^4+2.2"]], "fillColor": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

---

## 3. Costruzione della funzione derivata di funzioni polinomiali

```matephis
{
  "aspectRatio": "3:2",
  "cssWidth": "95%",
  "align": "center",
  "marginBottom": 10,
  "interactive": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "derivativeToggle": true,
  "showDerivativePoint": false,
  "legend": true,
  "data": [
    { "fn": "3x", "label": "$y = 3x$", "derivativeColor": "summer3" },
    { "points": [[-3,-9],[-1,-3],[0,0],[1,3],[3,9]], "color": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

> [!DETAILS] Derivata:
> 
> $$y = 3$$

---

```matephis
{
  "aspectRatio": "3:2",
  "cssWidth": "95%",
  "align": "center",
  "marginBottom": 10,
  "ylim": [-1.9,17.9],
  "interactive": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "derivativeToggle": true,
  "showDerivativePoint": false,
  "derivativeYLim": [-9.9,9.9],
  "legend": true,
  "data": [
    { "fn": "x^2", "label": "$y = x^2$", "derivativeColor": "summer3" },
    { "points": [[-3,9],[-2,4],[-1,1],[0,0],[1,1],[2,4],[3,9]], "color": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

> [!DETAILS] Derivata:
> 
> $$y = 2x$$

---

```matephis
{
  "aspectRatio": "3:2",
  "cssWidth": "95%",
  "align": "center",
  "marginBottom": 10,
  "ylim": [-9.9,9.9],
  "interactive": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "derivativeToggle": true,
  "showDerivativePoint": false,
  "derivativeYLim": [-9.9,9.9],
  "legend": true,
  "data": [
    { "fn": "x^3", "label": "$y = x^3$", "derivativeColor": "summer3" },
    { "points": [[-2,-8],[-1,-1],[0,0],[1,1],[2,8]], "color": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

> [!DETAILS] Derivata:
> 
> $$y = 3x^2$$

---

```matephis
{
  "aspectRatio": "3:2",
  "cssWidth": "95%",
  "align": "center",
  "marginBottom": 0,
  "xlim": [-8,8],
  "ylim": [-3.9,3.9],
  "xStep": "pi/2",
  "interactive": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "derivativeToggle": true,
  "showDerivativePoint": false,
  "derivativeYLim": [-4.9,4.9],
  "legend": true,
  "data": [
    { "fn": "sin(x)", "label": "$y = \\sin(x)$", "derivativeColor": "summer3" },
    { "points": [["-2*pi","sin(-2*pi)"],[-1,"sin(-1)"],[0,0],[1,"sin(1)"],["1.5*pi","sin(1.5*pi)"],["pi",0]], "color": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

> [!DETAILS] Derivata:
> 
> $$y = cos(x)$$

---

```matephis
{
  "aspectRatio": "3:2",
  "cssWidth": "95%",
  "align": "center",
  "marginBottom": 10,
  "xlim": [-9.9,4.9],
  "ylim": [-0.9,9.9],
  "interactive": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "derivativeToggle": true,
  "showDerivativePoint": false,
  "derivativeYLim": [-9.9,9.9],
  "legend": true,
  "data": [
    { "fn": "e^x", "label": "$y = e^x$", "derivativeColor": "summer3" },
    { "points": [[-5,"e^(-5)"],[-2,"e^(-2)"],[0,1],[1,"e"],[2,"e^2"]], "color": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

> [!DETAILS] Derivata:
> 
> $$y = e^x$$

---

## 4. Mettiti alla prova

```matephis
{
  "aspectRatio": "3:2",
  "cssWidth": "95%",
  "align": "center",
  "marginBottom": 10,
  "xlim": [-3.4,3.4],
  "ylim": [-1.9,1.9],
  "interactive": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "derivativeToggle": true,
  "showDerivativePoint": false,
  "derivativeYLim": [-2.9,2.9],
  "legend": true,
  "data": [
    { "fn": "0.5*sin(0.5*pi*x)^2+0.5*cos(0.75*pi*x)", "derivativeColor": "summer3" },
    { "points": [[-2.8,0.927782507],[-2,0],[-1.6,-0.231762746],[-0.8,0.297745751],[0,0.5],[0.8,0.297745751],[1.6,-0.231762746],[2,0],[2.8,0.927782507]], "color": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```