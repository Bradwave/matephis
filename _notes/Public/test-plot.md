---
title: Matephis Plotting System
feed: hide
tags:
  - test
  - grafici
code: true
plot: true
---


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
| `padding` | Number | 30 | Padding interno (spazio vuoto) attorno al grafico in pixel. |
| `interactive` | Boolean | `false` | Se `true`, abilita zoom, pan e controlli overlay. |
| `theme` | String | `"red"` | Tema colori: `"red"`, `"black"`, `"sunburst"`, `"coastal"`, `"seaside"`, `"default"`. |
| `legend` | Boolean | `false` | Mostra la legenda in alto a destra. |
| `legendWidth` | Number | Auto | Larghezza fissa della legenda in pixel. |
| `align` | String | `"left"` | Allineamento contenitore (`"center"`, `"left"`). |
| `marginLeft` | String | `0` | Margine sinistro CSS personalizzato (es. `"-25px"`). |
| `marginRight` | String | `auto` | Margine destro CSS personalizzato. |
| `border` | Boolean | `false` | Aggiunge un bordo al contenitore del grafico. |
| `sliderBorder` | Boolean | `false` | Aggiunge un bordo e padding agli slider. |
| `boxPlot` | Boolean | `false` | Racchiude il grafico in un box con assi sui bordi. |
| `boxNumbersInside` | Boolean | `false` | Se `true` e `boxPlot` attivo, mostra i numeri all'interno del box (più piccoli). |
| `sampleStep` | Number | 2 | Passo di campionamento in pixel. Valori più bassi (es. 1) migliorano la qualità ma riducono le performance. |
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
| `xStepSecondary` / `yStepSecondary` | Number | Auto | Passo griglia secondaria. Default 1/5 del principale. |
| `xNumberStep` / `yNumberStep` | Number | Auto | Passo numerazione sugli assi. Default uguale a `xStep`. |
| `showXNumbers` / `showYNumbers` | Boolean | `true` | Mostra i numeri sugli assi. |
| `showXTicks` / `showYTicks` | Boolean | `false` | Mostra le tacche sugli assi. |
| `secondaryGridOpacity` | Number | Auto | Opacità griglia secondaria (default 50% della principale). |

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

### Tema black e frecce assi
Utile per stampe o stili minimali. `axisArrows: true` aggiunge le frecce.

```json
{
  "theme": "red",
  "axisArrows": true,
  "xlim": [-5, 5],
  "data": [
    { "fn": "x^2", "label": "Parabola" },
    { "fn": "-x^2", "label": "Parabola Inv." },
  ]
}
```

```matephis
{
  "theme": "black",
  "axisArrows": true,
  "xlim": [-5, 5],
  "data": [
    { "fn": "x^2", "label": "Parabola" },
    { "fn": "-x^2", "label": "Parabola Inv." }
  ]
}
```

### Tema Sunburst
Uno dei nuovi temi disponibili.

```json
{
  "theme": "sunburst",
  "xlim": [-5, 5],
  "data": [
    { "fn": "sin(x)", "label": "Seno" },
    { "fn": "cos(x)", "label": "Coseno" },
    { "fn": "sin(2*x)", "label": "Seno 2x" }
  ]
}
```

```matephis
{
  "theme": "sunburst",
  "xlim": [-5, 5],
  "data": [
    { "fn": "sin(x)", "label": "Seno" },
    { "fn": "cos(x)", "label": "Coseno" },
    { "fn": "sin(2*x)", "label": "Seno 2x" }
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

## 6. Qualità e performance

### Alta definizione (sampleStep)
Per funzioni ad alta frequenza o dettagli fini, usa `sampleStep: 1` per forzare il campionamento pixel-per-pixel. Di default è 2.

```json
{
  "sampleStep": 1,
  "xlim": [-5, 5],
  "ylim": [-1.5, 1.5],
  "fullWidth": true,
  "aspectRatio": "4:1",
  "data": [
    { "fn": "sin(30*x)", "label": "Alta Frequenza (1px step)", "width": 1 }
  ]
}
```


## 7. Interattività Avanzata e Nuove Funzioni

### Selezione Punti, Pendenze e Tangenti
Nuove modalità per esplorare le funzioni. Le modalità sono mutuamente esclusive.

*   `pointSelection`: Abilita il trascinamento di un punto sulla curva.
*   `slopeSelection`: Calcola la pendenza media tra due punti (triangolo).
*   `tangentSelection`: Calcola la retta tangente e la derivata in un punto.
*   `specifySlope`: Se `true`, mostra la formula completa (es. $\Delta y / \Delta x$).

```json
{
  "interactive": true,
  "pointSelection": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "specifySlope": true,
  "slopeLabel": "m",
  "axisLabels": ["t", "s"],
  "axisUnitMeasures": ["sec", "m"],
  "data": [{ "fn": "0.5*x^2" }]
}
```

```matephis
{
  "interactive": true,
  "pointSelection": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "specifySlope": true,
  "slopeLabel": "m",
  "axisLabels": ["t", "s"],
  "axisUnitMeasures": ["sec", "m"],
  "data": [{ "fn": "0.5*x^2" }]
}
```

### Interpolazione (Smoothing)
Il tipo `interpolation` permette di disegnare curve che passano per una serie di punti.
*   `smoothness`: `0` (linee spezzate) fino a `1` (curve morbide, Catmull-Rom).

```json
{
  "legend": true,
  "data": [
    { 
      "type": "interpolation", 
      "points": [[-2,0], [-1,1], [0,0], [1,1], [2,0]], 
      "smoothness": 1, 
      "color": "red", 
      "label": "Smooth (1.0)" 
    },
    { 
      "type": "interpolation", 
      "points": [[-2,-1], [-1,0], [0,-1], [1,0], [2,-1]], 
      "smoothness": 0, 
      "color": "blue", 
      "label": "Linear (0.0)" 
    }
  ]
}
```

```matephis
{
  "legend": true,
  "data": [
    { 
      "type": "interpolation", 
      "points": [[-2,0], [-1,1], [0,0], [1,1], [2,0]], 
      "smoothness": 1, 
      "color": "red", 
      "label": "Smooth (Default Sampling)",
      "showPoints": true
    },
    { 
      "type": "interpolation", 
      "points": [[-2,-1.5], [-1,-0.5], [0,-1.5], [1,-0.5], [2,-1.5]], 
      "smoothness": 1, 
      "sampling": 3,
      "color": "orange", 
      "label": "Low Sampling (3)",
      "showPoints": true,
      "pointColor": "black",
      "pointRadius": 6
    },
    { 
      "type": "interpolation", 
      "points": [[-2,-3], [-1,-2], [0,-3], [1,-2], [2,-3]], 
      "smoothness": 0, 
      "color": "blue", 
      "label": "Linear (0.0)",
      "showPoints": true,
      "pointStroke": "blue",
      "pointStrokeWidth": 2,
      "pointColor": "white"
    }
  ]
}
```

#### Opzioni Interpolazione Avanzate
*   `sampling`: (Default `10`) Controlla la risoluzione della curva spline (segmenti per coppia di punti). Valori bassi (`2-5`) per performance, valori alti (`20+`) per curve perfette.
*   `showPoints`: Se `true`, disegna i punti originali sopra la curva.
*   `pointColor`, `pointRadius`, `pointOpacity`: Stile dei punti.
*   `pointStroke`, `pointStrokeWidth`: Bordo dei punti.

### Vincoli di Navigazione
*   `constrainView`: Se `true`, impedisce di zoomare o traslare oltre i limiti definiti da `xlim` e `ylim`.

```json
{
  "interactive": true, 
  "constrainView": true,
  "xlim": [-5, 5],
  "ylim": [-5, 5],
  "data": [{ "fn": "sin(x)" }]
}
```

```

## 8. Analisi Derivata

### Tracciamento e Grafico Derivata
Nuovi strumenti per visualizzare la derivata.
*   `traceDerivative`: Se `true` e lo strumento pendenza è attivo, apparirà un pulsante "Trace" che lascia una scia di punti $(x, f'(x))$.
*   `addDerivativePlot`: Aggiunge un secondo grafico sincronizzato sotto il principale per mostrare la derivata.
*   `derivativeYLim`: Limiti Y opzionali per il grafico derivata.
*   `derivativeAutoY`: Se `true`, adatta automaticamente l'asse Y della derivata in base ai dati tracciati.

```json
{
  "xlim": [-4, 4],
  "ylim": [-5, 10],
  "interactive": true,
  "tangentSelection": true,
  "traceDerivative": true,
  "addDerivativePlot": true,
  "derivativeAutoY": true,
  "data": [{ "fn": "x^2", "label": "Parabola" }]
}
```

```matephis
{
  "xlim": [-4, 4],
  "ylim": [-5, 10],
  "interactive": true,
  "tangentSelection": true,
  "traceDerivative": true,
  "addDerivativePlot": true,
  "derivativeAutoY": true,
  "derivativeTitle": "Analisi Pendenza (Derivata)",
  "data": [{ "fn": "x^2", "label": "Parabola" }]
}
```

### Curva Derivata (Ghost)
*   `showDerivative`: Mostra la curva della derivata analitica (calcolata numericamente) in background con opacità ridotta.
*   **Trace UI**: Quando la modalità "Tangente" è attiva, appaiono i pulsanti:
    *   **Trace**: Attiva/Disattiva il tracciamento dei punti $(x, f'(x))$.
    *   **Eraser**: Cancella la traccia corrente.

```json
{
  "xlim": [-7, 7],
  "slopeSelection": true,
  "addDerivativePlot": true,
  "showDerivative": true,
  "data": [{ "fn": "sin(x)", "label": "sin(x)" }]
}
```

```matephis
{
  "xlim": [-7, 7],
  "slopeSelection": true,
  "addDerivativePlot": true,
  "showDerivative": true,
  "data": [{ "fn": "sin(x)", "label": "sin(x)" }]
}
```

## 9. Nuove Funzionalità Sperimentali

### Animazione Parametri e Limiti Dinamici
Aggiungi `animate: true` alla configurazione per abilitare un pulsante play/pause accanto agli slider. Cliccando play, il parametro verrà incrementato automaticamente in base al suo `step`.
Inoltre, i bordi `min` e `max` dei parametri possono ora essere definiti come espressioni matematiche, permettendo dipendenze dinamiche tra slider, che si aggiornano in tempo reale.

```json
{
  "aspectRatio": "2:1",
  "xlim": [-10, 10],
  "ylim": [-3, 3],
  "animate": true,
  "params": {
    "A": { "min": 0.5, "max": 2.5, "step": 0.1, "val": 1 },
    "t": { "min": "-A*2", "max": "A*5", "step": 0.05, "val": 0 }
  },
  "data": [
    { "fn": "A * sin(x - t)", "label": "Onda Propagante" }
  ]
}
```

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-10, 10],
  "ylim": [-3, 3],
  "animate": true,
  "params": {
    "A": { "min": 0.5, "max": 2.5, "step": 0.1, "val": 1 },
    "t": { "min": "-A*2", "max": "A*5", "step": 0.05, "val": 0 }
  },
  "data": [
    { "fn": "A * sin(x - t)", "label": "Onda Propagante" }
  ]
}
```

### Griglia Polare
Imposta `polar: true` per disegnare una griglia radiale e concentrica al posto di quella cartesiana standard. `polarUnits` può essere impostato su `"deg"` per i gradi (mostrerà gradi numerici) o lasciato di default / `"rad"` per etichette in radianti proporzionali a `π`. Utile per mostrare equazioni in coordinate polari e complessi!

```json
{
  "polar": true,
  "polarUnits": "rad",
  "xlim": [-5, 5],
  "ylim": [-5, 5],
  "aspectRatio": 1,
  "params": {
    "k": { "min": 1, "max": 10, "step": 1, "val": 4 },
    "t": { "min": 0, "max": "2*PI", "step": 0.1, "val": "2*PI" }
  },
  "data": [
    { "fn": "4 * cos(k * x)", "domain": [0, "t"], "label": "Rosa Polare" }
  ]
}
```

```matephis
{
  "polar": true,
  "polarUnits": "rad",
  "xlim": [-5, 5],
  "ylim": [-5, 5],
  "aspectRatio": 1,
  "params": {
    "k": { "min": 1, "max": 10, "step": 1, "val": 4 },
    "t": { "min": 0, "max": "2*PI", "step": 0.05, "val": "2*PI" }
  },
  "data": [
    { "fn": "4 * cos(k * x)", "domain": [0, "t"], "label": "Rosa Polare" }
  ]
}
```

### Supporto Numeri Complessi (Base)
Aggiungi `complexMode: true` per valutare le funzioni nel campo complesso in modo semplificato. Scrivendo funzioni f(x) e calcolando ad esempio `exp(i * x)`, x viene usato come parametro per muoversi sul piano complesso (Asse X = Reale, Asse Y = Immaginario).

```json
{
  "complexMode": true,
  "xlim": [-2, 2],
  "ylim": [-2, 2],
  "data": [
    { "fn": "exp(i * x)", "domain": [0, "2*pi"] }
  ]
}
```

```matephis
{
  "complexMode": true,
  "xlim": [-2, 2],
  "ylim": [-2, 2],
  "data": [
    { "fn": "exp(i * x)", "domain": [0, "2*pi"] }
  ]
}
```

Puoi anche definire punti singoli e discreti utilizzando espressioni complesse, sia in forma algebrica `a+ib` che in forma polare `r*exp(i*θ)` o `r*e^(i*θ)`.

```json
{
  "complexMode": true,
  "xlim": [-3, 3],
  "ylim": [-3, 3],
  "data": [
    { "fn": "2*exp(i*x)", "domain": [0, "6.28"], "color": "blue" },
    {
      "points": [
        ["1+0.5i", "", "1+0.5i"],
        ["-1+1i", "", "-1+i"],
        ["2*exp(i*PI/2)", "", "2*exp(i*PI/2)"],
        ["1.5*e^(i*PI)", "", "1.5*e^(i*PI)"]
      ],
      "radius": 5,
      "fillColor": "red"
    }
  ]
}
```

```matephis
{
  "complexMode": true,
  "xlim": [-3, 3],
  "ylim": [-3, 3],
  "data": [
    { "fn": "2*exp(i*x)", "domain": [0, "6.28"], "color": "blue" },
    {
      "points": [
        ["1+0.5i", "", "1+0.5i"],
        ["-1+1i", "", "-1+i"],
        ["2*exp(i*PI/2)", "", "2*exp(i*PI/2)"],
        ["1.5*e^(i*PI)", "", "1.5*e^(i*PI)"]
      ],
      "radius": 5,
      "fillColor": "red"
    }
  ]
}
```

### Parametri Interni (Curve Parametriche)
Puoi limitare il dominio di valutazione di una funzione e svincolarlo dall'asse X globale specificando un parametro interno con i suoi limiti.
Questo approccio, unito a `complexMode: true`, rende molto facile tracciare curve parametriche e percorsi chiusi (come i cerchi).

```json
{
  "complexMode": true,
  "xlim": [-2, 2],
  "ylim": [-2, 2],
  "data": [
    { 
      "fn": "1.5*exp(i*T)", 
      "param": [["T", 0, "2*PI"]],
      "color": "purple"
    }
  ]
}
```

```matephis
{
  "complexMode": true,
  "xlim": [-2, 2],
  "ylim": [-2, 2],
  "data": [
    { 
      "fn": "1.5*exp(i*T)", 
      "param": [["T", 0, "2*PI"]],
      "color": "purple"
    }
  ]
}
```

### Drag di Punti Parametrici
Se hai un grafico interattivo con dei parametri definiti in `params` e imposti `draggablePoints: true`, i punti che dipendono da quel parametro potranno essere trascinati!
Questo cambierà sia la posizione del punto sia il valore del parametro nello slider in modo collegato.

```json
{
  "interactive": true,
  "draggablePoints": true,
  "sliderBorder": true,
  "aspectRatio": 1,
  "xlim": [-2, 2],
  "ylim": [-2, 2],
  "params": {
  "T": { "min": 0, "max": "2*PI", "step": "PI/16", "val": 0, "round": 2 }
  },
  "data": [
    { "fn": "cos(x)", "color": "#ccc", "dash": "5,5" },
    { "points": [["cos(T)", "sin(T)"]], "radius": 6, "fillColor": "red", "label": "Drag me!" },
    { "implicit": "x^2 + y^2 = 1", "color": "blue" }
  ]
}
```

```matephis
{
  "interactive": true,
  "draggablePoints": true,
  "sliderBorder": true,
  "aspectRatio": 1,
  "xlim": [-2, 2],
  "ylim": [-2, 2],
  "params": {
    "T": { "min": 0, "max": "2*PI", "step": "PI/16", "val": 0, "round": 2 }
  },
  "data": [
    { "fn": "cos(x)", "color": "#ccc", "dash": "5,5" },
    { "points": [["cos(T)", "sin(T)"]], "radius": 6, "fillColor": "red", "label": "Drag me!" },
    { "implicit": "x^2 + y^2 = 1", "color": "blue" }
  ]
}
```

### Parametri Trascinabili (Draggable Points)
Se definisci le coordinate di un punto come espressioni matematiche dipendenti da un parametro globale (es. `t`), puoi trascinare liberamente quel punto lungo il grafico. Il parametro si aggiornerà in tempo reale in base alla posizione più vicina del cursore.

```json
{
  "complexMode": true,
  "xlim": [-2, 2],
  "ylim": [-2, 2],
  "params": {
    "t": { "min": 0, "max": "2*PI", "step": 0.05, "val": 0, "round": 2 }
  },
  "draggablePoints": true,
  "data": [
    { 
      "fn": "1.5*exp(i*T)", 
      "param": [["T", 0, "2*PI"]],
      "color": "gray",
      "dash": "5,5"
    },
    {
      "points": [
        ["1.5*exp(i*t)", "", "Trascina"]
      ],
      "radius": 6,
      "fillColor": "blue"
    }
  ]
}
```

```matephis
{
  "complexMode": true,
  "xlim": [-2, 2],
  "ylim": [-2, 2],
  "params": {
    "t": { "min": 0, "max": "2PI", "step": 0.05, "val": 0, "round": 2 }
  },
  "draggablePoints": true,
  "data": [
    { 
      "fn": "1.5*exp(i*T)", 
      "param": [["T", 0, "2*PI"]],
      "color": "gray",
      "dash": "5,5"
    },
    {
      "points": [
        ["1.5*exp(i*t)", "", "Trascina"]
      ],
      "radius": 6,
      "fillColor": "blue"
    }
  ]
}

## 10. Punti Liberi e Vettori

### Punto a Coordinate Libere
Aggiungi `"freeCoordinates": true` e un `"name"` a un oggetto `points` per renderlo trascinabile liberamente. Non richiede parametri: il punto si muove dove lo trascini.

```json
{
  "aspectRatio": 1,
  "xlim": [-5, 5],
  "ylim": [-5, 5],
  "data": [
    {
      "points": [[2, 1]],
      "freeCoordinates": true,
      "name": "P",
      "label": "P",
      "fillColor": "#d00",
      "radius": 7
    }
  ]
}
```

```matephis
{
  "aspectRatio": 1,
  "xlim": [-5, 5],
  "ylim": [-5, 5],
  "data": [
    {
      "points": [[2, 1]],
      "freeCoordinates": true,
      "name": "P",
      "label": "P",
      "fillColor": "#d00",
      "radius": 7
    }
  ]
}
```

### Variabili del Punto nelle Espressioni
Se e' presente un punto libero col nome `"A"`, puoi usare `A.x`, `A.y`, `A.r` e `A.theta` in qualunque espressione matematica. Trascina il punto per vedere gli altri elementi aggiornarsi in tempo reale!

```json
{
  "aspectRatio": 1,
  "xlim": [-5, 5],
  "ylim": [-5, 5],
  "data": [
    {
      "points": [[3, 0]],
      "freeCoordinates": true,
      "name": "A",
      "label": "A",
      "fillColor": "blue",
      "radius": 7
    },
    { "implicit": "(x - A.x)^2 + (y - A.y)^2 = 4", "color": "#888", "dash": "4,4" },
    { "fn": "A.y + (A.theta / PI) * x", "color": "orange", "label": "linea" }
  ]
}
```

```matephis
{
  "aspectRatio": 1,
  "xlim": [-5, 5],
  "ylim": [-5, 5],
  "data": [
    {
      "points": [[3, 0]],
      "freeCoordinates": true,
      "name": "A",
      "label": "A",
      "fillColor": "blue",
      "radius": 7
    },
    { "implicit": "(x - A.x)^2 + (y - A.y)^2 = 4", "color": "#888", "dash": "4,4" },
    { "fn": "A.y + (A.theta / PI) * x", "color": "orange", "label": "linea" }
  ]
}
```

### Vettori
Usa `"vector": [[da_x, da_y], [a_x, a_y]]` (entrambi possono contenere espressioni, incluse variabili di punti liberi). Trascina il punto `P` per animare il vettore! Puoi anche usare `"arrow": false` e `"dash": "val"` per segmenti.

```json
{
  "aspectRatio": 1,
  "xlim": [-4, 4],
  "ylim": [-4, 4],
  "data": [
    {
      "points": [[2, 2]],
      "freeCoordinates": true,
      "name": "P",
      "label": "P.x + iP.y",
      "fillColor": "#c00",
      "radius": 7
    },
    { "vector": [[0, 0], ["P.x", "P.y"]], "color": "#c00", "width": 2, "label": "v" },
    { "vector": [["P.x", "P.y"], ["-P.y + P.x", "P.x + P.y"]], "color": "blue", "width": 2, "label": "v perp" },
    { "vector": [[0, 2], [2, 0]], "color": "green", "arrow": false, "dash": "4,4", "label": "no arrow" }
  ]
}
```

```matephis
{
  "aspectRatio": 1,
  "xlim": [-4, 4],
  "ylim": [-4, 4],
  "data": [
    {
      "points": [[2, 2]],
      "freeCoordinates": true,
      "name": "P",
      "label": "P.x + iP.y",
      "fillColor": "#c00",
      "radius": 7
    },
    { "vector": [[0, 0], ["P.x", "P.y"]], "color": "#c00", "width": 2, "label": "v" },
    { "vector": [["P.x", "P.y"], ["-P.y + P.x", "P.x + P.y"]], "color": "blue", "width": 2, "label": "v perp" },
    { "vector": [[0, 2], [2, 0]], "color": "green", "arrow": false, "dash": "4,4", "label": "no arrow" }
  ]
}
```

## 11. Scale Logaritmiche

### Log Scale (Assi X/Y)
Impostando `xScale: "log"` o `yScale: "log"` la trasformazione delle coordinate usa esponenti in base 10. `xMin` e `yMin` sono vincolati a essere maggiori di 0. Il rendering della griglia e numerazione si adatta ai multipli di 10.

```json
{
  "aspectRatio": "3:1",
  "xlim": [1, 1000],
  "ylim": [-3, 3],
  "xScale": "log",
  "data": [
    {
      "fn": "log(x)",
      "color": "blue",
      "label": "log_e(x)"
    },
    {
      "fn": "sin(x)",
      "color": "red",
      "label": "sin(x) on log"
    }
  ]
}
```

```matephis
{
  "aspectRatio": "3:1",
  "xlim": [1, 1000],
  "ylim": [-3, 3],
  "xScale": "log",
  "data": [
    {
      "fn": "log(x)",
      "color": "blue",
      "label": "log_e(x)"
    },
    {
      "fn": "sin(x)",
      "color": "red",
      "label": "sin(x) on log"
    }
  ]
}
```

```json
{
  "aspectRatio": "1:1",
  "xlim": [1, 1000],
  "ylim": [1, 1000000],
  "xScale": "log",
  "yScale": "log",
  "data": [
    {
      "fn": "x^2",
      "color": "purple",
      "label": "y = x^2"
    }
  ]
}
```

```matephis
{
  "aspectRatio": "1:1",
  "xlim": [1, 1000],
  "ylim": [1, 1000000],
  "xScale": "log",
  "yScale": "log",
  "data": [
    {
      "fn": "x^2",
      "color": "purple",
      "label": "y = x^2"
    }
  ]
}
```


## 12. Nuove funzionalità

### Vettori: forme abbreviate, componenti e trascinamento
`"vector"` accetta `[[x0, y0], [x1, y1]]`, i nomi di due punti (`["A", "B"]`) oppure le sole componenti `[vx, vy]` (applicate nell'origine o in `"from"`). `"components": true` disegna le proiezioni, `"arrow"` può valere `true`, `false`, `"start"`, `"end"` o `"both"`, `"draggable": true` (o `"tail"`, `"both"`) rende trascinabile la punta e `"snap"` aggancia alla griglia. Con `"name"` il vettore espone `v.x`, `v.y`, `v.r` (modulo) e `v.theta`.

```json
{
  "aspectRatio": 1,
  "xlim": [-1, 6],
  "ylim": [-1, 6],
  "align": "center",
  "data": [
    {"points": [[1, 1]], "freeCoordinates": true, "name": "A", "label": "A", "radius": 6, "snap": 0.5},
    {"points": [[4, 2]], "freeCoordinates": true, "name": "B", "label": "B", "radius": 6, "snap": 0.5},
    {"vector": ["A", "B"], "name": "u", "color": "summer2", "width": 3, "components": true, "label": "|u| = u.r"},
    {"vector": [1, 3], "from": [0.5, 0.5], "color": "summer4", "draggable": true, "snap": 0.5, "name": "w", "label": "w = (w.x, w.y)"},
    {"vector": [[3, 5], [5, 4]], "arrow": "both", "color": "black2", "width": 2, "label": "both"}
  ]
}
```

```matephis
{
  "aspectRatio": 1,
  "xlim": [-1, 6],
  "ylim": [-1, 6],
  "align": "center",
  "data": [
    {"points": [[1, 1]], "freeCoordinates": true, "name": "A", "label": "A", "radius": 6, "snap": 0.5},
    {"points": [[4, 2]], "freeCoordinates": true, "name": "B", "label": "B", "radius": 6, "snap": 0.5},
    {"vector": ["A", "B"], "name": "u", "color": "summer2", "width": 3, "components": true, "label": "|u| = u.r"},
    {"vector": [1, 3], "from": [0.5, 0.5], "color": "summer4", "draggable": true, "snap": 0.5, "name": "w", "label": "w = (w.x, w.y)"},
    {"vector": [[3, 5], [5, 4]], "arrow": "both", "color": "black2", "width": 2, "label": "both"}
  ]
}
```

### Angoli tra punti
I vertici di `"angle"` possono essere nomi di punti. `"showValue": true` (o `"rad"`) scrive l'ampiezza; un angolo retto viene disegnato col quadratino. Con `"name"` sono disponibili `nome.deg` e `nome.rad` nelle espressioni e nelle etichette.

```json
{
  "aspectRatio": 1,
  "xlim": [-1, 5],
  "ylim": [-1, 5],
  "align": "center",
  "data": [
    {"points": [[4, 1]], "freeCoordinates": true, "name": "P", "label": "P", "radius": 6},
    {"points": [[0, 0]], "name": "O", "radius": 3, "color": "black1"},
    {"points": [[4, 0]], "name": "X", "radius": 0},
    {"vector": ["O", "X"], "color": "black3", "width": 1.5},
    {"vector": ["O", "P"], "color": "summer2", "width": 2.5},
    {"angle": ["X", "O", "P"], "radius": 35, "fillColor": "summer5", "fillOpacity": 0.3, "showValue": true, "name": "alpha"},
    {"angle": [[0, 4], [0, 0], [4, 0]], "radius": 18, "color": "black3"}
  ]
}
```

```matephis
{
  "aspectRatio": 1,
  "xlim": [-1, 5],
  "ylim": [-1, 5],
  "align": "center",
  "data": [
    {"points": [[4, 1]], "freeCoordinates": true, "name": "P", "label": "P", "radius": 6},
    {"points": [[0, 0]], "name": "O", "radius": 3, "color": "black1"},
    {"points": [[4, 0]], "name": "X", "radius": 0},
    {"vector": ["O", "X"], "color": "black3", "width": 1.5},
    {"vector": ["O", "P"], "color": "summer2", "width": 2.5},
    {"angle": ["X", "O", "P"], "radius": 35, "fillColor": "summer5", "fillOpacity": 0.3, "showValue": true, "name": "alpha"},
    {"angle": [[0, 4], [0, 0], [4, 0]], "radius": 18, "color": "black3"}
  ]
}
```

### Curve parametriche e polari
`"parametric": ["x(t)", "y(t)"]` traccia una curva parametrica (dominio di `t` in `"domain"`, default `[0, 2π]`). `"r": "..."` traccia una curva polare $r(\theta)$ (la variabile si può scrivere `t`, `x`, `θ` o `theta`); nei grafici con `"polar": true` anche `"fn"` è interpretata come $r(\theta)$.

```json
{
  "aspectRatio": 1,
  "xlim": [-3.5, 3.5],
  "ylim": [-3.5, 3.5],
  "equalAspect": true,
  "legend": true,
  "align": "center",
  "params": {"k": {"min": 1, "max": 7, "step": 1, "val": 3}},
  "data": [
    {"parametric": ["2 cos(t) + cos(k t)", "2 sin(t) - sin(k t)"], "label": "epicicloide", "color": "summer2"},
    {"r": "1 + cos(θ)", "label": "cardioide", "color": "summer6", "dash": "6,4"}
  ]
}
```

```matephis
{
  "aspectRatio": 1,
  "xlim": [-3.5, 3.5],
  "ylim": [-3.5, 3.5],
  "equalAspect": true,
  "legend": true,
  "align": "center",
  "params": {"k": {"min": 1, "max": 7, "step": 1, "val": 3}},
  "data": [
    {"parametric": ["2 cos(t) + cos(k t)", "2 sin(t) - sin(k t)"], "label": "epicicloide", "color": "summer2"},
    {"r": "1 + cos(θ)", "label": "cardioide", "color": "summer6", "dash": "6,4"}
  ]
}
```

### Funzioni a tratti, valore assoluto e simboli
Le espressioni supportano l'operatore ternario e i confronti (`x < 0 ? -x : x^2`), il valore assoluto con `|x|`, `log(x, b)` in base qualunque, `!`, `mod`, `sgn` e la moltiplicazione implicita (`2x`, `3sin(x)`, `(x+1)(x-1)`, `ax` con parametro `a`). `-x^2` vale $-(x^2)$.

```json
{
  "aspectRatio": "2:1",
  "xlim": [-4, 4],
  "ylim": [-2, 5],
  "legend": true,
  "data": [
    {"fn": "x < 0 ? -x/2 : x^2", "label": "a tratti", "color": "summer2"},
    {"fn": "|x^2 - 4| / 2", "label": "|x² − 4| / 2", "color": "summer6", "dash": "5,4"},
    {"fn": "floor(x)", "label": "floor(x)", "color": "black3", "width": 2}
  ]
}
```

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-4, 4],
  "ylim": [-2, 5],
  "legend": true,
  "data": [
    {"fn": "x < 0 ? -x/2 : x^2", "label": "a tratti", "color": "summer2"},
    {"fn": "|x^2 - 4| / 2", "label": "|x² − 4| / 2", "color": "summer6", "dash": "5,4"},
    {"fn": "floor(x)", "label": "floor(x)", "color": "black3", "width": 2}
  ]
}
```

### Più grafici affiancati (domande a scelta multipla)
Un blocco con `"plots": [...]` crea una griglia di grafici piccoli. `"layout"`: `"row"` (tutti su una riga) o `"grid"` con `"columns"`; `"mobileColumns"` imposta le colonne su schermi stretti. `"labels"`: `"A"`, `"a"`, `"1"`, `"i"`, un array o `false`. Le opzioni in `"shared"` valgono per tutti i grafici; ogni grafico si apre a schermo intero con un clic.

```json
{
  "layout": "grid",
  "columns": 4,
  "mobileColumns": 2,
  "labels": "A",
  "shared": {"xlim": [-3.9, 3.9], "ylim": [-3.9, 3.9], "aspectRatio": 1, "showXNumbers": false, "showYNumbers": false},
  "plots": [
    { "data": [
      {"fn": "x^2 - 2"}
    ] },
    { "data": [
      {"fn": "-(x^2) + 2"}
    ] },
    { "data": [
      {"fn": "(x - 1)^2"}
    ] },
    { "data": [
      {"fn": "2^x - 2"}
    ] }
  ]
}
```

```matephis
{
  "layout": "grid",
  "columns": 4,
  "mobileColumns": 2,
  "labels": "A",
  "shared": {"xlim": [-3.9, 3.9], "ylim": [-3.9, 3.9], "aspectRatio": 1, "showXNumbers": false, "showYNumbers": false},
  "plots": [
    { "data": [
      {"fn": "x^2 - 2"}
    ] },
    { "data": [
      {"fn": "-(x^2) + 2"}
    ] },
    { "data": [
      {"fn": "(x - 1)^2"}
    ] },
    { "data": [
      {"fn": "2^x - 2"}
    ] }
  ]
}
```

### Scale logaritmiche: navigazione
Con `"interactive": true` pan e zoom lavorano nello spazio logaritmico (il grafico scorre per fattori costanti). Le etichette fuori dall'intervallo $[10^{-3}, 10^4]$ usano la notazione $10^n$.

```json
{
  "aspectRatio": "2:1",
  "xlim": [0.01, 100000],
  "ylim": [0.001, 1000000],
  "xScale": "log",
  "yScale": "log",
  "interactive": true,
  "data": [
    {"fn": "x", "label": "x", "color": "summer2"},
    {"fn": "x^2", "label": "x²", "color": "summer6"},
    {"fn": "sqrt(x)", "label": "√x", "color": "summer4"}
  ]
}
```

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [0.01, 100000],
  "ylim": [0.001, 1000000],
  "xScale": "log",
  "yScale": "log",
  "interactive": true,
  "data": [
    {"fn": "x", "label": "x", "color": "summer2"},
    {"fn": "x^2", "label": "x²", "color": "summer6"},
    {"fn": "sqrt(x)", "label": "√x", "color": "summer4"}
  ]
}
```
