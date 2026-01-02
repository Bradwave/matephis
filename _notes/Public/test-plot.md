---
title: Test Nuove Funzionalità Grafici
feed: show
tags:
  - test
---
<link rel="stylesheet" href="/assets/css/syntax.css">

# Matephis Plotting System v2

Questa pagina serve come test e documentazione per il sistema di grafici generati via codice (JSON).
Tutti i grafici sono renderizzati da `matephis-plot.js`.

## 0. Obsidian Live Preview Check
Questo blocco usa la sintassi ` ```matephis ` e dovrebbe funzionare in Editing Mode (Live Preview):

```matephis
{
  "xlim": [-4, 4],
  "theme": "brand",
  "data": [
    { "fn": "sin(x)/x", "label": "Sinc(x)" }
  ]
}
```

## 1. Temi (Grayscale vs Brand)

È possibile scegliere tra temi predefiniti.

### Grayscale
`theme: "grayscale"` assegna automaticamente tonalità di grigio.

```matephis
{
  "xlim": [0, 10],
  "theme": "grayscale",
  "legend": true,
  "data": [
    { "fn": "sin(x)", "label": "Seno" },
    { "fn": "cos(x)", "label": "Coseno" },
    { "fn": "sin(x/2)", "label": "Lenta" }
  ]
}
```

```json
{
  "xlim": [0, 10],
  "theme": "grayscale",
  "legend": true,
  "data": [
    { "fn": "sin(x)", "label": "Seno" },
    { "fn": "cos(x)", "label": "Coseno" }
  ]
}
```

### Brand Color
`theme: "brand"` usa sfumature del colore principale (Rosso).

```matephis
{
  "xlim": [-5, 5],
  "theme": "brand",
  "legend": true,
  "data": [
    { "fn": "x^2", "label": "Quadrata" },
    { "fn": "abs(x)", "label": "Valore Assoluto", "dash": "5,5" }
  ]
}
```

## 2. Etichette Intelligenti
Il sistema posiziona automaticamente le etichette. Puoi forzare la posizione con `labelAt` (coordinate grafico) o `labelOffset` (pixel). Le etichette vengono rappresentate in grassetto se specificato con `labelWeight: "bold"`.

```matephis
{
  "xlim": [-5, 5],
  "ylim": [-2, 10],
  "gridOpacity": 0.8,
  "data": [
    { "fn": "x^2", "label": "Auto (Fine)", "color": "blue" },
    { "fn": "2*x", "label": "Forzata su [2,4]", "labelAt": [2, 4], "color": "red", "labelWeight": "bold"},
    { "x": -3, "label": "Spostata (+10px, 0)", "labelOffset": [10, 0], "color": "green" }
  ]
}
```

```json
{
  "data": [
    { "fn": "2*x", "label": "Forzata", "labelAt": [2, 4] },
    { "x": -3, "label": "Offset", "labelOffset": [10, 0] }
  ]
}
```

## 3. Controllo Assi (Tacche vs Numeri)
Puoi nascondere i numeri ma tenere le tacche (`showXTicks: true`, `showXNumbers: false`).

```matephis
{
  "xlim": [-3, 3],
  "ylim": [-5, 5],
  "xStep": 0.5,
  "showYNumbers": false,
  "showYTicks": true,
  "data": [
    { "fn": "x^3", "color": "#444" }
  ]
}
```

```json
{
  "xStep": 0.5,
  "showYNumbers": false,
  "showYTicks": true
}
```

## 4. Trigonometria (Step PI)
Imposta `xStep: "PI/2"` per avere etichette in radianti ($\pi/2$, $\pi$).

```matephis
{
  "xlim": [-7, 7],
  "ylim": [-1.2, 1.2],
  "xStep": "PI/2",
  "theme": "grayscale",
  "data": [
    { "fn": "sin(x)", "label": "sin(x)" }
  ]
}
```

## 5. Grafici Impliciti (Cerchi, Curve)
Supporta equazioni implicite come `x^2 + y^2 = r^2`. Usa `equalAspect: true` per mantenere le proporzioni.

```matephis
{
  "xlim": [-6, 6],
  "equalAspect": true,
  "grid": true,
  "data": [
    { "implicit": "x^2 + y^2 = 25", "color": "purple", "label": "r=5" },
    { "implicit": "x^2 - y^2 = 9", "color": "orange", "label": "Iperbole" }
  ]
}
```

```json
{
  "equalAspect": true,
  "data": [
    { "implicit": "x^2 + y^2 = 25" }
  ]
}
```

## 6. Interattività (Slider)
Definisci parametri in `params` per creare slider.

```matephis
{
  "xlim": [-5, 5],
  "ylim": [-2, 2],
  "theme": "brand",
  "params": {
    "k": { "min": 0.5, "max": 5, "step": 0.01, "val": 1 },
    "f": { "min": 0, "max": 6.28, "step": 0.1, "val": 0 }
  },
  "data": [
    { "fn": "sin(k * x + f)", "label": "Onda", "width": 3 }
  ]
}
```

```json
{
  "params": {
    "k": { "min": 0.5, "max": 5, "val": 1 }
  },
  "data": [
    { "fn": "sin(k * x)" }
  ]
}
```
## 7. Axis Arrows & Grid Opacity

Grid set to `0.3` opacity (lighter than default) and arrows enabled on both axes. Secondary grid lines set to `0.2` step.

```matephis
{
  "xlim": [-5, 5],
  "ylim": [-5, 5],
  "gridOpacity": 1,
  "axisArrows": true,
  "xStepSecondary": 0.2,
  "yStepSecondary": 0.2,
  "data": [
    { "fn": "sin(x)", "color": "red", "width": 3 }
  ]
}
```

```json
{
  "axisArrows": true,
  "xStepSecondary": 0.2,
  "yStepSecondary": 0.2,
  "data": []
}
```

## 8. Render Order: Numbers on Top

`renderOrder` set to `"numbers-top"`. The axis lines and numbers should appear *above* the filled area (simulated by a thick line here for visibility) or intersecting graphs.

```matephis
{
  "xlim": [-4, 4],
  "ylim": [-4, 4],
  "renderOrder": "numbers-top",
  "axisArrows": true,
  "data": [
    { "fn": "-0.3", "color": "blue", "width": 15, "label": "Thick Line Behind Axis" }
  ]
}
```

## 9. Default Behavior (Numbers Below)

Standard rendering. The thick line should cover the axis numbers.

```matephis
{
  "xlim": [-4, 4],
  "ylim": [-4, 4],
  "axisArrows": false,
  "data": [
    { "fn": "-0.3", "color": "green", "width": 15, "label": "Thick Line Covers Axis" }
  ]
}
```