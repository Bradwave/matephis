---
title: Matephis Physics System
feed: hide
tags:
  - test
code: true
---

Questa pagina serve come test e documentazione per il sistema di diagrammi di fisica generati via codice (JSON). Tutti i diagrammi sono renderizzati da `matephis-physics.js`. Per provare una configurazione mentre la scrivi usa il [playground](/playground/).

**Stato: fase 1 (fondamenta).** Sono disponibili la finestra del mondo in metri, griglia e assi, i parametri con slider, gli angoli in gradi e radianti e due oggetti di prova (`particle` e `label`). Corpi, piani inclinati, forze, simulazione e viste arrivano nelle fasi successive: le opzioni già previste ma non ancora implementate producono un avviso invece di essere ignorate in silenzio.

## Documentazione opzioni JSON

### Opzioni globali

| Opzione | Tipo | Default | Descrizione |
| :--- | :--- | :--- | :--- |
| `xlim`, `ylim` | `[min, max]` | `[0, 10]`, altezza dal rapporto | Finestra del mondo in metri. Resta sempre tutta visibile. |
| `aspectRatio` | String/Number | `"16:9"` | Rapporto larghezza:altezza del diagramma. |
| `width`, `fullWidth`, `cssWidth`, `align`, `border`, `padding`, `caption` | | | Come nei grafici. |
| `grid` | Boolean/Number | `false` | Griglia ogni 1 m, oppure ogni N metri. |
| `axes` | Boolean/Object | `false` | Assi con frecce. Oggetto: `labels` (`["x (m)", "y (m)"]`), `numbers` (`true` o passo). |
| `angleUnit` | `"deg"`/`"rad"` | `"deg"` | Unità dei **numeri** scritti nei campi angolo. |
| `g` | Number | `9.81` | Accelerazione di gravità, usabile in tutte le espressioni. |
| `params` | Object | | Slider, come nei grafici, più `unit` e `label` (vedi sotto). |
| `animate` | Boolean/Array | | Pulsante play per gli slider, come nei grafici. |
| `objects` | Array | `[]` | Gli oggetti della scena. |
| `debug` | Boolean | `false` | Mostra id e coordinate degli oggetti e la scala (1 m = N px). |

### Oggetti (fase 1)

| Tipo | Opzioni | Descrizione |
| :--- | :--- | :--- |
| `particle` | `at`, `radius` (px), `label`, `labelOffset` (px), `color`, `fill` | Punto materiale. |
| `label` | `at`, `text`, `anchor` (`left`/`center`/`right`), `size`, `weight`, `color` | Testo; `$...$` per LaTeX. |

Opzioni comuni: `id`, `show` (espressione: l'oggetto compare solo se è vera), `hidden`, `opacity`, `layer`.

Un punto (`at`) può essere:

- `[x, y]` con numeri o espressioni: `["R*cos(alpha)", "R*sin(alpha)"]`;
- l'`id` di un altro oggetto: `"A"`;
- `{ "from": "A", "offset": [0, 0.5] }`: spostato di un vettore in metri.

Nelle espressioni `A.x` e `A.y` leggono la posizione dell'oggetto `A`.

### Gradi e radianti

Dentro il programma gli angoli sono sempre in radianti, e ogni espressione è valutata in radianti:

- `30°` vale `30·π/180` in qualunque espressione (anche nei grafici): `sin(30°) = 0.5`. Funziona anche `º`.
- `deg(x)` converte da radianti a gradi, `rad(x)` da gradi a radianti.
- Un parametro con `"unit": "deg"` ha lo slider in gradi (`min`, `max`, `val` in gradi) ma vale in radianti nelle espressioni: `sin(alpha)` è giusto senza conversioni.
- `angleUnit` vale solo per i numeri scritti direttamente in un campo angolo (`"angle": 30`). Le stringhe sono espressioni: `"pi/6"`, `"30°"`, `"alpha"`.
- Un parametro che sembra un angolo (`alpha`, `theta`, …) con `max` oltre 7 e senza `unit` produce un avviso.

---

## 1. Griglia, assi e finestra del mondo

La finestra `xlim` × `ylim` è sempre tutta visibile e 1 m ha la stessa lunghezza sui due assi: l'asse con spazio in più viene allargato.

```json
{
  "xlim": [-1, 9],
  "ylim": [-1, 4],
  "grid": true,
  "axes": { "labels": ["x (m)", "y (m)"], "numbers": true }
}
```

```physics
{
  "xlim": [-1, 9],
  "ylim": [-1, 4],
  "grid": true,
  "axes": { "labels": ["x (m)", "y (m)"], "numbers": true }
}
```

## 2. Oggetti e riferimenti

`B` è posizionato rispetto ad `A` con `A.x` e `A.y`; l'etichetta è posizionata rispetto a `B` con `from` e `offset`. L'ordine degli oggetti nella lista non conta.

```json
{
  "xlim": [0, 10], "ylim": [0, 4], "grid": true,
  "objects": [
    { "type": "label", "at": { "from": "B", "offset": [0, 0.7] }, "text": "B = A + (4 m, 1.5 m)" },
    { "id": "B", "type": "particle", "at": ["A.x + 4", "A.y + 1.5"], "label": "B", "color": "blue" },
    { "id": "A", "type": "particle", "at": [2, 1], "label": "A" }
  ]
}
```

```physics
{
  "xlim": [0, 10], "ylim": [0, 4], "grid": true,
  "objects": [
    { "type": "label", "at": { "from": "B", "offset": [0, 0.7] }, "text": "B = A + (4 m, 1.5 m)" },
    { "id": "B", "type": "particle", "at": ["A.x + 4", "A.y + 1.5"], "label": "B", "color": "blue" },
    { "id": "A", "type": "particle", "at": [2, 1], "label": "A" }
  ]
}
```

## 3. Angoli in gradi con lo slider

`alpha` ha `"unit": "deg"`: lo slider va da 0° a 360°, ma `cos(alpha)` riceve radianti. `R` ha un'unità solo descrittiva.

```json
{
  "xlim": [-3, 3], "ylim": [-3, 3], "aspectRatio": "1:1", "grid": true, "axes": true,
  "params": {
    "alpha": { "min": 0, "max": 360, "step": 5, "val": 30, "unit": "deg" },
    "R": { "min": 0.5, "max": 2.5, "step": 0.1, "val": 2, "unit": "m" }
  },
  "objects": [
    { "id": "P", "type": "particle", "at": ["R*cos(alpha)", "R*sin(alpha)"], "label": "P" },
    { "type": "label", "at": [0, -2.6], "text": "$x = R\\cos\\alpha$, $y = R\\sin\\alpha$" }
  ]
}
```

```physics
{
  "xlim": [-3, 3], "ylim": [-3, 3], "aspectRatio": "1:1", "grid": true, "axes": true,
  "params": {
    "alpha": { "min": 0, "max": 360, "step": 5, "val": 30, "unit": "deg" },
    "R": { "min": 0.5, "max": 2.5, "step": 0.1, "val": 2, "unit": "m" }
  },
  "objects": [
    { "id": "P", "type": "particle", "at": ["R*cos(alpha)", "R*sin(alpha)"], "label": "P" },
    { "type": "label", "at": [0, -2.6], "text": "$x = R\\cos\\alpha$, $y = R\\sin\\alpha$" }
  ]
}
```

## 4. Moto con `animate`

Finché non arriva l'orologio della simulazione, il tempo può essere un parametro animato. `g` è sempre disponibile; `show` nasconde la pallina quando sarebbe sotto il suolo.

```json
{
  "xlim": [0, 10], "ylim": [0, 5], "grid": true, "axes": true,
  "animate": ["t"],
  "params": {
    "t": { "min": 0, "max": 1.4, "step": 0.01, "val": 0, "unit": "s", "loop": "bounce" },
    "v0": { "min": 5, "max": 12, "val": 9, "unit": "m/s", "label": "v₀" },
    "a": { "min": 10, "max": 80, "val": 45, "unit": "deg" }
  },
  "objects": [
    { "type": "particle", "radius": 7,
      "at": ["v0*cos(a)*t", "v0*sin(a)*t - g*t^2/2"],
      "show": "v0*sin(a)*t - g*t^2/2 >= 0" }
  ]
}
```

```physics
{
  "xlim": [0, 10], "ylim": [0, 5], "grid": true, "axes": true,
  "animate": ["t"],
  "params": {
    "t": { "min": 0, "max": 1.4, "step": 0.01, "val": 0, "unit": "s", "loop": "bounce" },
    "v0": { "min": 5, "max": 12, "val": 9, "unit": "m/s", "label": "v₀" },
    "a": { "min": 10, "max": 80, "val": 45, "unit": "deg" }
  },
  "objects": [
    { "type": "particle", "radius": 7,
      "at": ["v0*cos(a)*t", "v0*sin(a)*t - g*t^2/2"],
      "show": "v0*sin(a)*t - g*t^2/2 >= 0" }
  ]
}
```

## 5. Gradi nei grafici

Il simbolo `°` e `"unit": "deg"` funzionano anche nei blocchi `matephis`, perché il parser e gli slider sono condivisi.

```json
{
  "xlim": [0, 360], "ylim": [-1.5, 1.5], "aspectRatio": "2:1", "xStep": 30,
  "params": { "phi": { "min": 0, "max": 360, "step": 5, "val": 0, "unit": "deg" } },
  "data": [ { "fn": "sin(x° + phi)", "label": "sin(x° + φ)" } ]
}
```

```matephis
{
  "xlim": [0, 360], "ylim": [-1.5, 1.5], "aspectRatio": "2:1", "xStep": 30,
  "params": { "phi": { "min": 0, "max": 360, "step": 5, "val": 0, "unit": "deg" } },
  "data": [ { "fn": "sin(x° + phi)", "label": "sin(x° + φ)" } ]
}
```

## 6. Modalità debug

`"debug": true` mostra l'id e le coordinate di ogni oggetto e la scala in basso a destra.

```json
{
  "xlim": [0, 6], "ylim": [0, 3], "grid": true, "debug": true,
  "objects": [
    { "id": "A", "type": "particle", "at": [1, 1] },
    { "id": "B", "type": "particle", "at": [4.5, 2] }
  ]
}
```

```physics
{
  "xlim": [0, 6], "ylim": [0, 3], "grid": true, "debug": true,
  "objects": [
    { "id": "A", "type": "particle", "at": [1, 1] },
    { "id": "B", "type": "particle", "at": [4.5, 2] }
  ]
}
```

## 7. Avvisi

Chiavi scritte male (con suggerimento), opzioni e tipi non ancora implementati, riferimenti a oggetti inesistenti e angoli sospetti finiscono nel riquadro sotto il diagramma.

```physics
{
  "xlin": [0, 10],
  "graphs": [],
  "params": { "theta": { "min": 0, "max": 90, "val": 30 } },
  "objects": [
    { "type": "partcle", "at": [1, 1] },
    { "type": "block", "on": "s" },
    { "type": "particle", "at": [5, 2], "raduis": 4 },
    { "type": "label", "at": "Z", "text": "?" }
  ]
}
```

## 8. Errore nel JSON

Un JSON non valido mostra un errore al posto del diagramma.

```physics
{
  "xlim": [0, 10],
  "objects": [ { "type": "particle", "at": [1, 1] }, ]
}
```
