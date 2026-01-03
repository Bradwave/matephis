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

### Opzioni globali

| Opzione | Tipo | Default | Descrizione |
| :--- | :--- | :--- | :--- |
| `width` | Number | 600 | Larghezza interna SVG (coordinate). |
| `height` | Number | - | Calcolata automaticamente da `aspectRatio` o uguale a `width`. |
| `aspectRatio` | String/Number | `"1:1"` | Rapporto larghezza:altezza (es. `"16:9"`, `2`). |
| `xlim` | `[min, max]` | `[-9.9, 9.9]` | Limiti asse X. |
| `ylim` | `[min, max]` | `[-9.9, 9.9]` | Limiti asse Y. |
| `fullWidth` | Boolean | `false` | Se `true`, il grafico occupa il 100% della larghezza container e adatta la risoluzione. |
| `interactive` | Boolean | `false` | Se `true`, abilita zoom, pan e controlli overlay. |
| `theme` | String | `"accent"` | Tema colori: `"accent"`, `"grayscale"`, `"default"`. |
| `legend` | Boolean | `false` | Mostra la legenda in alto a destra. |
| `align` | String | `"left"` | Allineamento contenitore (`"center"`, `"left"`). |
| `marginLeft` | String | `0` | Margine sinistro CSS personalizzato (es. `"-25px"`). |
| `marginRight` | String | `auto` | Margine destro CSS personalizzato. |
| `border` | Boolean | `false` | Aggiunge un bordo al contenitore del grafico. |
| `sliderBorder` | Boolean | `false` | Aggiunge un bordo e padding agli slider. |
| `fontSize` | Number | 18 | Dimensione base font. |
| `renderOrder` | String | `"numbers-bottom"` | `"numbers-top"` per disegnare numeri sopra i dati. |

### Griglia e assi

| Opzione | Tipo | Default | Descrizione |
| :--- | :--- | :--- | :--- |
| `grid` | Boolean | `true` | Mostra/Nascondi la griglia. |
| `gridOpacity` | Number | `0.8` | Opacità griglia principale. |
| `axisArrows` | Boolean | `false` | Disegna frecce sugli assi. |
| `axisLabels` | `[x, y]` | `null` | Etichette assi (es. `["Tempo (s)", "Posizione (m)"]`). |
| `xStep` / `yStep` | Number | Auto | Passo griglia principale. Se omesso, calcolato automaticamente. |
| `showXNumbers` | Boolean | `true` | Mostra i numeri sugli assi. |
| `showXTicks` | Boolean | `false` | Mostra le tacche sugli assi. |

### Serie dati (`data: [...]`)

| Proprietà | Tipo | Descrizione |
| :--- | :--- | :--- |
| `fn` | String | Funzione `y = f(x)` (es. `"sin(x)"`, `"x^2"`). |
| `implicit` | String | Equazione implicita (es. `"x^2 + y^2 = 25"`). |
| `points` | Array | Lista di punti `[[x,y], ...]`. |
| `color` | String | Colore (Hex o nome tema). |
| `opacity` | Number | Opacità (0.0 - 1.0). |
| `width` | Number | Spessore linea o raggio bordo punto. |
| `dash` | String | Pattern tratteggio (es. `"5,5"`). |
| `label` | String | Etichetta (mostrata sul grafico o in legenda). |

---

## 1. Esempi base e layout

### Grafico semplice (seno e coseno)
Usa il tema di default (`accent`) e dimensioni standard.

```json
{
  "xlim": [-7, 7],
  "ylim": [-1.5, 1.5],
  "legend": true,
  "data": [
    { "fn": "sin(x)", "label": "sin(x)" },
    { "fn": "cos(x)", "label": "cos(x)", "dash": "5,5" }
  ]
}
```

```matephis
{
  "xlim": [-7, 7],
  "ylim": [-1.5, 1.5],
  "legend": true,
  "data": [
    { "fn": "sin(x)", "label": "sin(x)" },
    { "fn": "cos(x)", "label": "cos(x)", "dash": "5,5" }
  ]
}
```

### Full width & aspect ratio
Usa `fullWidth: true` per grafici responsive che occupano tutta la larghezza, con un rapporto aspetto specifico (es. `3:1`).

```json
{
  "fullWidth": true,
  "aspectRatio": "3:1",
  "xlim": [-20, 20],
  "ylim": [-2, 2],
  "data": [
    { "fn": "sin(x)/x", "label": "Sinc(x)" }
  ]
}
```

```matephis
{
  "fullWidth": true,
  "aspectRatio": "3:1",
  "xlim": [-20, 20],
  "ylim": [-2, 2],
  "data": [
    { "fn": "sin(x)/x", "label": "Sinc(x)" }
  ]
}
```

## 2. Temi e stili

### Tema grayscale e frecce assi
Utile per stampe o stili minimali. `axisArrows: true` aggiunge le frecce.

```json
{
  "theme": "grayscale",
  "axisArrows": true,
  "xlim": [-5, 5],
  "data": [
    { "fn": "x^2", "label": "Parabola" },
    { "fn": "-x^2", "label": "Parabola Inv." }
  ]
}
```

```matephis
{
  "theme": "grayscale",
  "axisArrows": true,
  "xlim": [-5, 5],
  "data": [
    { "fn": "x^2", "label": "Parabola" },
    { "fn": "-x^2", "label": "Parabola Inv." }
  ]
}
```

### Colori personalizzati e opacità
Dimostra come sovrascrivere i colori del tema e usare l'opacità per sovrapposizioni.

```json
{
  "xlim": [-3, 3],
  "ylim": [-2, 2],
  "gridOpacity": 0.3,
  "data": [
    { "fn": "sin(x)", "width": 8, "color": "red", "opacity": 0.3, "label": "Opaco 30%" },
    { "fn": "cos(x)", "width": 8, "color": "blue", "opacity": 0.7, "label": "Opaco 70%" }
  ]
}
```

```matephis
{
  "xlim": [-3, 3],
  "ylim": [-2, 2],
  "gridOpacity": 0.3,
  "data": [
    { "fn": "sin(x)", "width": 8, "color": "red", "opacity": 0.3, "label": "Opaco 30%" },
    { "fn": "cos(x)", "width": 8, "color": "blue", "opacity": 0.7, "label": "Opaco 70%" }
  ]
}
```

## 3. Tipi di dati avanzati

### Equazioni implicite (cerchi e coniche)
Usa `implicit` per equazioni non funzioni. `equalAspect` (o un `aspectRatio` corretto) è raccomandato per non distorcere le forme.

```json
{
  "xlim": [-6, 6],
  "aspectRatio": "1:1",
  "data": [
    { "implicit": "x^2 + y^2 = 16", "color": "purple", "label": "r=4" },
    { "implicit": "x^2/9 - y^2/4 = 1", "color": "orange", "label": "Iperbole" }
  ]
}
```

```matephis
{
  "xlim": [-6, 6],
  "aspectRatio": "1:1",
  "data": [
    { "implicit": "x^2 + y^2 = 16", "color": "purple", "label": "r=4" },
    { "implicit": "x^2/9 - y^2/4 = 1", "color": "orange", "label": "Iperbole" }
  ]
}
```

### Punti e linee verticali
Disegna punti specifici e rette verticali (`x: val`).

```json
{
  "xlim": [-2, 5],
  "data": [
    { "points": [[1,1], [2,4], [3,9]], "radius": 4, "fillColor": "black" },
    { "x": 2.5, "color": "green", "dash": "2,2", "label": "x=2.5" }
  ]
}
```

```matephis
{
  "xlim": [-2, 5],
  "data": [
    { "points": [[1,1], [2,4], [3,9]], "radius": 4, "fillColor": "black" },
    { "x": 2.5, "color": "green", "dash": "2,2", "label": "x=2.5" }
  ]
}
```

## 4. Interattività

Il sistema supporta due livelli di interattività: **Manipolazione Vista** (Zoom/Pan) e **Parametri Dinamici** (Slider).

### Grafico zoomabile e riorientabile
Imposta `"interactive": true`.
*   **Zoom**: Rotella del mouse, o pulsanti (+/-) in basso a sinistra. Pinch su mobile.
*   **Pan**: Trascina con il mouse o dito.
*   **Reset**: Pulsante (↺) per tornare alla vista iniziale.

```json
{
  "xlim": [-10, 10],
  "ylim": [-10, 10],
  "interactive": true,
  "fullWidth": true,
  "gridOpacity": 0.5,
  "data": [
      { "fn": "sin(x)*x", "label": "x*sin(x)" },
      { "fn": "log(x)"},
      { "fn": "1/x"}
  ]
}
```

```matephis
{
  "xlim": [-10, 10],
  "ylim": [-10, 10],
  "interactive": true,
  "fullWidth": true,
  "gridOpacity": 0.5,
  "data": [
      { "fn": "sin(x)*x", "label": "x*sin(x)" },
      { "fn": "log(x)"},
      { "fn": "1/x"}
  ]
}
```

### Asintoti e domini
Esempio di funzione con asintoti (`tan(x)`) e dominio limitato (`sqrt(16-x^2)` in `[-4, 4]`).

```json
{
  "aspectRatio": "2:1",
  "xlim": [-10, 10], 
  "ylim": [-5, 5],
  "data": [
    { "fn": "tan(x)", "color": "#007bff", "label": "tan(x)" },
    { "fn": "sqrt(16 - x^2)", "domain": [-4, 4], "color": "#dc3545", "label": "Domain [-4, 4]" }
  ]
}
```

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-10, 10], 
  "ylim": [-5, 5],
  "data": [
    { "fn": "tan(x)", "color": "#007bff", "label": "tan(x)" },
    { "fn": "sqrt(16 - x^2)", "domain": [-4, 4], "color": "#dc3545", "label": "Domain [-4, 4]" }
  ]
}
```

### Slider (parametri)
Definisci `params` per creare slider. Le variabili (es. `k`) possono essere usate nelle funzioni.
Le opzioni `border` e `sliderBorder` possono essere usate per aggiungere bordi al contenitore e agli slider.

```json
{
  "cssWidth": "80%",
  "align": "left",
  "aspectRatio": "2:1",
  "xlim": [-10, 10],
  "ylim": [-2, 2],
  "interactive": true,
  "border": true,
  "sliderBorder": true,
  "params": {
    "k": { "min": 0.1, "max": 5, "step": 0.1, "val": 1 },
    "w": { "min": 0, "max": 10, "step": 0.1, "val": 0 }
  },
  "data": [
    { "fn": "sin(k*x + w)", "label": "Onda Variabile" }
  ]
}
```

```matephis
{
  "cssWidth": "80%",
  "align": "left",
  "aspectRatio": "2:1",
  "xlim": [-10, 10],
  "ylim": [-2, 2],
  "interactive": true,
  "border": true,
  "sliderBorder": true,
  "params": {
    "k": { "min": 0.1, "max": 5, "step": 0.1, "val": 1 },
    "w": { "min": 0, "max": 10, "step": 0.1, "val": 0 }
  },
  "data": [
    { "fn": "sin(k*x + w)", "label": "Onda Variabile" }
  ]
}
```

## 5. Layout avanzato

### Liste nidificate e allineamento
Usa `marginLeft` negativo per allineare visivamente un grafico all'interno di una lista puntata.

1.  Livello 1
    *   Livello 2 (Indentato)
        ```json
        {
          "width": 400,
          "height": 200,
          "marginLeft": "-25px",
          "data": [{"fn": "x", "color": "#777"}]
        }
        ```
        ```matephis
        {
          "width": 400,
          "height": 200,
          "marginLeft": "-25px",
          "data": [{"fn": "x", "color": "#777"}]
        }
        ```

### Auto steps (griglia dinamica)
Se `xStep` non è definito, viene calcolato automaticamente. Prova a zoomare nel grafico interattivo sopra per vedere la griglia adattarsi.

```json
{
  "xlim": [0.01, 0.02], 
  "ylim": [0, 0.005],
  "fullWidth": true,
  "aspectRatio": "3:1",
  "data": [{"fn": "x^2", "label": "Zoom (Auto Grid)"}]
}
```

```matephis
{
  "xlim": [0.01, 0.02], 
  "ylim": [0, 0.005],
  "fullWidth": true,
  "aspectRatio": "3:1",
  "data": [{"fn": "x^2", "label": "Zoom (Auto Grid)"}]
}
```
