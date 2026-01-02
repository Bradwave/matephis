---
title: Matephis Plotting System
feed: show
tags:
  - test
  - grafici
---
<link rel="stylesheet" href="/assets/css/syntax.css">

Questa pagina serve come test e documentazione per il sistema di grafici generati via codice (JSON). Tutti i grafici sono renderizzati da `matephis-plot.js`.

## Documentazione opzioni JSON

Ecco una lista completa delle opzioni disponibili per configurare i grafici:

### Globali

| Opzione | Tipo | Default | Descrizione |
| :--- | :--- | :--- | :--- |
| `width` | Number | 600 | Larghezza interna SVG/coordinate. |
| `height` | Number | - | Altezza interna. Calcolata da `aspectRatio` se presente. |
| `aspectRatio` | String/Number | `"1:1"` | Rapporto larghezza:altezza (es. `"16:9"`, `1`). |
| `xlim` | `[min, max]` | `[-9.9, 9.9]` | Limiti dell'asse X. |
| `ylim` | `[min, max]` | `[-9.9, 9.9]` | Limiti dell'asse Y. |
| `axisLabels` | `[x, y]` | `null` | Etichette per gli assi (es. `["t (s)", "v (m/s)"]`). |
| `theme` | String | `"brand"` | Tema colori: `"grayscale"`, `"brand"`, `"default"`. |
| `legend` | Boolean | `false` | Se `true`, mostra la legenda in alto a destra. |
| `renderOrder` | String | `"numbers-bottom"` | `"numbers-top"` per disegnare numeri sopra i grafici. |
| `labelWeight` | String | `"normal"` | Peso font etichette. |
| `fontSize` | Number/String | `"18px"` | Dimensione font generale (default). |
| `numberSize` | Number/String | `=` `fontSize` | Dimensione font numeri assi. |
| `labelSize` | Number/String | `=` `fontSize` | Dimensione font etichette assi/grafici. |
| `legendSize` | Number/String | `=` `fontSize` | Dimensione font legenda. |
| `cssWidth` | String | `"70%"` | Larghezza CSS contenitore (es. `"100%"`). |
| `fullWidth` | Boolean | `false` | Se `true`, imposta `cssWidth: "100%"`. |
| `align` | String | `"left"` | Allineamento contenitore (`"center"`, `"left"`). |

### Griglia e assi

| Opzione | Tipo | Default | Descrizione |
| :--- | :--- | :--- | :--- |
| `grid` | Boolean | `true` | Se `false`, nasconde completamente la griglia. |
| `gridOpacity` | Number | `0.8` | Opacità della griglia principale. |
| `xStep` | Number/String | `5` | Passo griglia X. |
| `yStep` | Number/String | `5` | Passo griglia Y. |
| `xNumberStep` | Number | `=` `xStep` | Passo numeri asse X (indipendente da griglia). |
| `yNumberStep` | Number | `=` `yStep` | Passo numeri asse Y. |
| `xStepSecondary` | Number | `1` | Passo griglia secondaria X. |
| `yStepSecondary` | Number | `1` | Passo griglia secondaria Y. |
| `secondaryGridOpacity` | Number | `gridOpacity/2` | Opacità griglia secondaria. |
| `axisArrows` | Boolean | `false` | Se `true`, disegna frecce alle estremità positive degli assi. |
| `showXTicks` | Boolean | `false` | Mostra tacche sull'asse X. |
| `showYTicks` | Boolean | `false` | Mostra tacche sull'asse Y. |
| `showXNumbers` | Boolean | `true` | Mostra numeri sull'asse X. |
| `showYNumbers` | Boolean | `true` | Mostra numeri sull'asse Y. |
| `equalAspect` | Boolean | `false` | Se `true`, forza proporzioni assi (deprecato, usa `aspectRatio`). |

### Data Items (`data: [...]`)

Ogni oggetto nell'array `data` può avere:

| Proprietà | Tipo | Descrizione |
| :--- | :--- | :--- |
| `fn` | String | Funzione esplicita `y = f(x)` (es. `"sin(x)"`). |
| `implicit` | String | Equazione implicita (es. `"x^2 + y^2 = 9"`). |
| `points` | Array | Array di punti `[[x1,y1], [x2,y2]]`. |
| `x` | Number | Linea verticale a `x = val`. |
| `color` | String | Colore (Hex o nome tema). Default automatico. |
| `width` | Number | Spessore linea. |
| `dash` | String | Pattern tratteggio (es. `"5,5"`). |
| `label` | String | Etichetta del grafico. |
| `labelAt` | `[x, y]` | Posizione forzata etichetta. |
| `labelOffset` | `[dx, dy]` | Spostamento in pixel dell'etichetta. |
| `labelAnchor` | String | Ancoraggio testo (`"start"`, `"middle"`, `"end"`). |
| `radius` | Number | Raggio punti (solo per `points`). |
| `fillColor` | String | Colore riempimento punti. |
| `opacity` | Number | Opacità (0.0 - 1.0) della linea o dei punti. |

### Parametri (`params: {...}`)
Definisci slider per rendere il grafico interattivo.
```json
"params": {
  "k": { "val": 1, "min": 0, "max": 5, "step": 0.1 }
}
```

---

Questo blocco usa la sintassi `'''matephis` e dovrebbe funzionare in *editing mode (live preview)*:

```matephis
{
  "fullWidth": true,
  "xlim": [-20, 20],
  "ylim": [-2, 2],
  "xStep": "2*PI",
  "aspectRatio": "2:1",
  "secondaryGridOpacity": 0,
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

### Brand olor

`theme: "brand"` usa sfumature del colore principale (Rosso).

```matephis
{
  "xlim": [-5, 5],
  "theme": "brand",
  "legend": true,
  "data": [
    { "fn": "x^2+2", "label": "Quadrata" },
    { "fn": "abs(x)", "label": "Valore Assoluto", "dash": "5,5" }
  ]
}
```

## 2. Etichette intelligenti

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

## 3. Controllo assi (tacche vs numeri)

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

## 4. Trigonometria (step PI)

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

## 5. Grafici impliciti (cerchi, curve)

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

## 6. Interattività (slider)

Definisci parametri in `params` per creare slider.

```matephis
{
  "fullWidth": true,
  "aspectRatio": "2:1",
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
## 7. Frecce assi e opacità griglia

Griglia impostata a opacità `0.3` (più leggera del default) e frecce abilitate su entrambi gli assi. Griglia secondaria impostata con passo `0.2`.

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

## 8. Ordine di rendering

### Numeri in primo piano

`renderOrder` impostato su `"numbers-top"`. Le linee degli assi e i numeri dovrebbero apparire *sopra* l'area riempita (simulata qui da una linea spessa per visibilità) o i grafici intersecanti.

```matephis
{
  "xlim": [-4, 4],
  "ylim": [-4, 4],
  "renderOrder": "numbers-top",
  "axisArrows": true,
  "data": [
    { "fn": "-0.3", "color": "blue", "width": 15, "label": "Linea Spessa Dietro Assi" }
  ]
}
```

### Comportamento di default (numeri sotto)

Rendering standard. La linea spessa dovrebbe coprire i numeri degli assi.

```matephis
{
  "xlim": [-4, 4],
  "ylim": [-4, 4],
  "axisArrows": false,
  "data": [
    { "fn": "-0.3", "color": "green", "width": 15, "label": "Linea Spessa Copre Assi" }
  ]
}
```

## 11. Opacità Dati

Puoi impostare l'opacità per ogni elemento dati. Utile per mostrare sovrapposizioni.

```matephis
{
  "xlim": [-3, 3],
  "ylim": [-2, 2],
  "data": [
    { "fn": "sin(x)", "width": 8, "color": "red", "opacity": 0.3, "label": "Opaco 0.3" },
    { "fn": "cos(x)", "width": 8, "color": "blue", "opacity": 0.7, "label": "Opaco 0.7" },
    { "points": [[0,0]], "radius": 15, "fillColor": "black", "opacity": 0.2, "label": "Punto 0.2" }
  ]
}
```

```json
{
  "data": [
    { "fn": "sin(x)", "opacity": 0.3 },
    { "fn": "cos(x)", "opacity": 0.7 }
  ]
}
```
## 12. Nuove Funzionalità (Math & Ratio)

Questo test verifica le nuove funzionalità: parse matematico avanzato, aspect ratio, step indipendenti.

### Implicit Multiplication & Negative Power

```matephis
{
  "xlim": [-5, 5],
  "ylim": [-10, 10],
  "data": [
    { "fn": "-x^2", "label": "-x^2 (corretto)", "color": "red" },
    { "fn": "2x + 1", "label": "2x + 1", "color": "blue" },
    { "fn": "sin(3x)", "label": "sin(3x)", "color": "green" }
  ]
}
```

### Aspect Ratio & Number Steps

```matephis
{
  "xlim": [-10, 10],
  "ylim": [-5, 5],
  "aspectRatio": "3:1",
  "xStep": 1,
  "xNumberStep": 5,
  "data": [
    { "fn": "sin(x)" }
  ]
}
```
## 13. Layout & sticky labels (Configurazione avanzata)

Nuove opzioni per layout CSS e comportamento bordi.

### Sticky labels
Con limiti [-9.9, 9.9] e step 5, i numeri 10 e -10 sarebbero fuori. Ma con sticky logic (entro 0.1), vengono mostrati al bordo.

```matephis
{
  "xlim": [-9.9, 9.9],
  "showXNumbers": true,
  "xStep": 5,
  "data": [{"fn": "x"}]
}
```

### Layout CSS & typography

Opzioni: `fontSize` (es. "16px"), `cssWidth` (es. "80%", "600px"), `align` ("center" o "left").

```matephis
{
  "fontSize": 14,
  "cssWidth": "80%",
  "align": "center",
  "data": [{"fn": "sin(x)"}]
}
```
