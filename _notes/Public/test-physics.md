---
title: Matephis Physics System
feed: hide
tags:
  - test
code: true
---

Questa pagina serve come test e documentazione per il sistema di diagrammi di fisica generati via codice (JSON). Tutti i diagrammi sono renderizzati da `matephis-physics.js`. Per provare una configurazione mentre la scrivi usa il [playground](/playground/).

**Stato: fase 2 (scene statiche).** Oltre alle fondamenta (finestra in metri, griglia e assi, parametri con slider, gradi e radianti) sono disponibili ambiente, corpi, collegamenti, vettori, riferimenti, scomposizioni, angoli e quote, posizionati gli uni rispetto agli altri con gli ancoraggi. Forze automatiche, simulazione nel tempo e viste dall'alto arrivano nelle fasi successive: le opzioni già previste ma non ancora implementate producono un avviso invece di essere ignorate in silenzio.

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

### Oggetti

Tutte le lunghezze sono in metri, salvo dove è indicato «px».

| Tipo | Opzioni principali | Ancoraggi |
| :--- | :--- | :--- |
| `ground`, `ceiling` | `from`, `to` (default: tutta la larghezza, a quota `y`), `hatch`, `mu` | `start`, `end`, `center`, `surface(u)` |
| `wall` | `at` (piede), `height`, `side` (`left`/`right`: lato del materiale) | `start`, `end`, `center`, `surface(u)` |
| `slope` | `at` (vertice con l'angolo), `angle`, `length` o `height` o `width`, `flip`, `hatch` | `base`, `apex`, `foot`, `center`, `surface(u)` |
| `table` | `at` (spigolo in alto a sinistra), `width`, `height`, `edge` (`right`/`left`) | `left`, `right`, `edge`, `center`, `surface(u)` |
| `particle` | `at` o `on`, `radius` (px), `label` | `center` |
| `block` | `at` o `on` + `pos`, `size` `[w, h]`, `angle`, `label`, `mass` | `center`, `top`, `bottom`, `left`, `right`, `tl`, `tr`, `bl`, `br`, `surface(u)` |
| `ball` | `at` o `on` + `pos`, `radius`, `label`, `mass` | come `block` + `rim(angolo)` |
| `cart` | come `block` + `wheel` (raggio ruote) | come `block` + `axle(1)`, `axle(2)` |
| `rod` | `from` + `to`, oppure `at` + `length` + `angle`; `pivot` (`start`/`center`/`end`/0–1), `width` (px) | `start`, `end`, `center`, `pivot`, `point(u)` |
| `disk` | `at`, `radius`, `rotation` | `center`, `axle`, `rim(angolo)`, `top`, … |
| `pulley` | `at`, `radius`, `hangFrom` (punto a cui è fissata) | `axle`, `rim(angolo)`, `top`, … |
| `rope` | `from`, `to`, `over` (carrucole in ordine; `"p:cw"` forza il lato) | `start`, `end`, `point(u)` |
| `spring` | `from`, `to`, `coils`, `width` | `start`, `end`, `point(u)` |
| `pendulum` | `pivot`, `length`, `theta` (dalla verticale), `bob` (raggio), `angleLabel`, `support` | `pivot`, `bob`, `point(u)` |
| `hinge` | `at` | `center` |
| `force`, `velocity`, `acceleration`, `momentum`, `vector` | `on` (corpo), `at`, `dir` + `mag` oppure `vec`, `scale`, `showValue`, `tail: "tip"`, `decompose` | `tail`, `tip` |
| `frame` | `origin`, `angle` oppure `of` (id), `labels`, `length` | `origin` |
| `decompose` | `vector` (id), `frame`, `style` (`projection`/`tip-to-tail`), `labels`, `showAngle` (`x`/`y`/`true`), `angleLabel`, `fadeOriginal`, `showValue`, `showAxes` | |
| `angle` | `of` (piano, pendolo) oppure `points: [A, V, B]` oppure `at` + `from` + `to`; `radius` (px), `label`, `showValue` | `vertex` |
| `dimension` | `from`, `to`, `offset`, `label` (default: la distanza) | `start`, `end`, `center` |
| `com` | `of` (id o lista di id, pesati con `mass`) | |
| `path` | `points`, oppure `arc` `{center, radius, from, to}`, oppure `parametric` `{x, y, t: [t0, t1]}`; `arrow` | `start`, `end`, `point(u)` |
| `label` | `at`, `text`, `anchor`, `size` | |

Opzioni comuni: `id`, `label`, `color`, `fill`, `opacity`, `show` (espressione: l'oggetto compare solo se è vera), `hidden`, `layer`.

### Punti e ancoraggi

Un punto (`at`, `from`, `to`, `pivot`, …) può essere:

- `[x, y]` con numeri o espressioni: `["R*cos(alpha)", "R*sin(alpha)"]`;
- un ancoraggio: `"A"` (posizione di `A`), `"A.top"`, `"s.surface(0.6)"` (al 60% del piano), `"p.rim(90)"`;
- `{ "from": "A.top", "offset": [0, 0.5] }`: spostato di un vettore in metri; con `"local": true` lo spostamento è nel riferimento di `A`.

Un corpo con `"on": "s"` si appoggia alla superficie `s` (suolo, piano, tavolo o la faccia superiore di un altro blocco) in posizione `pos` (0–1 lungo la superficie, oppure metri con `"posUnit": "m"`) ed è ruotato come la superficie. L'ordine degli oggetti nella lista non conta.

Nelle espressioni `A.x` e `A.y` leggono la posizione di `A`, `A.deg` e `A.rad` la sua rotazione; per un vettore `F.x`, `F.y` sono le componenti e `F.len` il modulo.

### Direzioni (`dir`)

| Valore | Direzione |
| :--- | :--- |
| `"up"`, `"down"`, `"left"`, `"right"` | assi del mondo |
| `"normal"`, `"-normal"`, `"tangent"`, `"-tangent"` | riferimento del corpo: perpendicolare e parallela alla superficie su cui poggia (`tangent` sale lungo il piano) |
| `"tangent:F1"` | riferimento di un altro oggetto |
| `"toward:B"`, `"away:B"` | verso un punto / in direzione opposta |
| `"along:rope"` | lungo la fune, a partire dal corpo |
| `30`, `"alpha + 90°"`, `"pi/2"` | angolo dall'asse x (numeri in `angleUnit`, espressioni in radianti) |
| `[vx, vy]` | direzione di un vettore |

I vettori hanno moduli fisici (N, m/s, …): la scala è automatica per ogni tipo (il più lungo occupa poco più di un quarto della vista), oppure `forceScale` (m per N), `vectorScale: { "velocity": 0.2 }` o `scale` sul singolo vettore. Le etichette con un comando TeX (`"\\vec F"`) sono scritte in LaTeX anche senza `$`.

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

`"debug": true` mostra per ogni oggetto con `id` la posizione, il riferimento (`t`, `n`) e la scala in basso a destra; passando sopra il punto compare l'elenco degli ancoraggi disponibili.

```json
{
  "xlim": [0, 8], "ylim": [0, 4.5], "debug": true,
  "objects": [
    { "id": "s", "type": "slope", "at": [0.5, 0.3], "angle": 30, "length": 7 },
    { "id": "A", "type": "block", "on": "s", "pos": 0.5, "size": [1, 0.6] },
    { "id": "c", "type": "cart", "at": [1.5, 3.5], "size": [1.2, 0.5] }
  ]
}
```

```physics
{
  "xlim": [0, 8], "ylim": [0, 4.5], "debug": true,
  "objects": [
    { "id": "s", "type": "slope", "at": [0.5, 0.3], "angle": 30, "length": 7 },
    { "id": "A", "type": "block", "on": "s", "pos": 0.5, "size": [1, 0.6] },
    { "id": "c", "type": "cart", "at": [1.5, 3.5], "size": [1.2, 0.5] }
  ]
}
```

## 7. Piano inclinato e diagramma di corpo libero

Il blocco è appoggiato sul piano con `on` e `pos`; le forze usano le direzioni del piano (`normal`, `-tangent`). Il peso è scomposto lungo il piano con `decompose`, che mostra anche l'angolo tra il peso e la sua componente perpendicolare.

```physics
{
  "xlim": [0, 9], "ylim": [0, 5], "forceScale": 0.11,
  "objects": [
    { "type": "ground", "y": 0.3 },
    { "id": "s", "type": "slope", "at": [0.4, 0.3], "angle": 30, "length": 8.6 },
    { "id": "A", "type": "block", "on": "s", "pos": 0.5, "size": [1.6, 0.9] },
    { "id": "P", "type": "force", "on": "A", "dir": "down", "mag": 20, "label": "\\vec P" },
    { "id": "N", "type": "force", "on": "A", "dir": "normal", "mag": "20*cos(30°)", "label": "\\vec N" },
    { "id": "f", "type": "force", "on": "A", "at": "A.bottom", "dir": "-tangent", "mag": 6, "label": "\\vec f_a" },
    { "type": "decompose", "vector": "P", "frame": "s", "showAngle": "y", "angleLabel": "\\alpha" },
    { "type": "angle", "of": "s", "label": "\\alpha" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 9], "ylim": [0, 5], "forceScale": 0.11,
>   "objects": [
>     { "type": "ground", "y": 0.3 },
>     { "id": "s", "type": "slope", "at": [0.4, 0.3], "angle": 30, "length": 8.6 },
>     { "id": "A", "type": "block", "on": "s", "pos": 0.5, "size": [1.6, 0.9] },
>     { "id": "P", "type": "force", "on": "A", "dir": "down", "mag": 20, "label": "\\vec P" },
>     { "id": "N", "type": "force", "on": "A", "dir": "normal", "mag": "20*cos(30°)", "label": "\\vec N" },
>     { "id": "f", "type": "force", "on": "A", "at": "A.bottom", "dir": "-tangent", "mag": 6, "label": "\\vec f_a" },
>     { "type": "decompose", "vector": "P", "frame": "s", "showAngle": "y", "angleLabel": "\\alpha" },
>     { "type": "angle", "of": "s", "label": "\\alpha" }
>   ]
> }
> ```

## 8. Tavolo e carrucola

La fune parte dal lato destro del blocco, passa sulla carrucola (`over`) e scende fino al secondo blocco: i tratti sono tangenti alla carrucola. Le tensioni usano `along:rope`, cioè la direzione della fune a partire dal corpo.

```physics
{
  "xlim": [0, 7], "ylim": [0, 4],
  "objects": [
    { "type": "ground", "y": 0.2 },
    { "id": "t", "type": "table", "at": [0.5, 2.5], "width": 4.5, "height": 2.3 },
    { "id": "A", "type": "block", "on": "t", "pos": 0.45, "size": [1, 0.6], "label": "$m_1$" },
    { "id": "p", "type": "pulley", "at": { "from": "t.edge", "offset": [0.3, 0] }, "radius": 0.3, "hangFrom": "t.edge" },
    { "id": "B", "type": "block", "at": [5.6, 1.5], "size": [0.6, 0.6], "label": "$m_2$" },
    { "id": "rope", "type": "rope", "from": "A.right", "to": "B.top", "over": ["p"] },
    { "type": "force", "on": "A", "at": "A.right", "dir": "along:rope", "mag": 8, "label": "\\vec T" },
    { "type": "force", "on": "B", "at": "B.top", "dir": "along:rope", "mag": 8, "label": "\\vec T" },
    { "type": "force", "on": "B", "dir": "down", "mag": 12, "label": "\\vec P_2" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 7], "ylim": [0, 4],
>   "objects": [
>     { "type": "ground", "y": 0.2 },
>     { "id": "t", "type": "table", "at": [0.5, 2.5], "width": 4.5, "height": 2.3 },
>     { "id": "A", "type": "block", "on": "t", "pos": 0.45, "size": [1, 0.6], "label": "$m_1$" },
>     { "id": "p", "type": "pulley", "at": { "from": "t.edge", "offset": [0.3, 0] }, "radius": 0.3, "hangFrom": "t.edge" },
>     { "id": "B", "type": "block", "at": [5.6, 1.5], "size": [0.6, 0.6], "label": "$m_2$" },
>     { "id": "rope", "type": "rope", "from": "A.right", "to": "B.top", "over": ["p"] },
>     { "type": "force", "on": "A", "at": "A.right", "dir": "along:rope", "mag": 8, "label": "\\vec T" },
>     { "type": "force", "on": "B", "at": "B.top", "dir": "along:rope", "mag": 8, "label": "\\vec T" },
>     { "type": "force", "on": "B", "dir": "down", "mag": 12, "label": "\\vec P_2" }
>   ]
> }
> ```

## 9. Macchina di Atwood

La carrucola è appesa al soffitto con `hangFrom`; la fune la avvolge per mezzo giro.

```physics
{
  "xlim": [0, 6], "ylim": [0, 5], "aspectRatio": "6:5", "forceScale": 0.14,
  "objects": [
    { "type": "ceiling", "from": [1.8, 4.8], "to": [4.2, 4.8] },
    { "id": "p", "type": "pulley", "at": [3, 4.0], "radius": 0.35, "hangFrom": [3, 4.8] },
    { "id": "A", "type": "block", "at": [2.65, 2.7], "size": [0.6, 0.6], "label": "$m_1$" },
    { "id": "B", "type": "block", "at": [3.35, 2.0], "size": [0.6, 0.8], "label": "$m_2$" },
    { "type": "rope", "from": "A.top", "to": "B.top", "over": ["p"] },
    { "type": "force", "on": "A", "at": "A.top", "dir": "up", "mag": 7, "label": "\\vec T" },
    { "type": "force", "on": "A", "at": "A.bottom", "dir": "down", "mag": 6, "label": "\\vec P_1" },
    { "type": "force", "on": "B", "at": "B.top", "dir": "up", "mag": 7, "label": "\\vec T" },
    { "type": "force", "on": "B", "at": "B.bottom", "dir": "down", "mag": 8, "label": "\\vec P_2" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 6], "ylim": [0, 5], "aspectRatio": "6:5", "forceScale": 0.14,
>   "objects": [
>     { "type": "ceiling", "from": [1.8, 4.8], "to": [4.2, 4.8] },
>     { "id": "p", "type": "pulley", "at": [3, 4.0], "radius": 0.35, "hangFrom": [3, 4.8] },
>     { "id": "A", "type": "block", "at": [2.65, 2.7], "size": [0.6, 0.6], "label": "$m_1$" },
>     { "id": "B", "type": "block", "at": [3.35, 2.0], "size": [0.6, 0.8], "label": "$m_2$" },
>     { "type": "rope", "from": "A.top", "to": "B.top", "over": ["p"] },
>     { "type": "force", "on": "A", "at": "A.top", "dir": "up", "mag": 7, "label": "\\vec T" },
>     { "type": "force", "on": "A", "at": "A.bottom", "dir": "down", "mag": 6, "label": "\\vec P_1" },
>     { "type": "force", "on": "B", "at": "B.top", "dir": "up", "mag": 7, "label": "\\vec T" },
>     { "type": "force", "on": "B", "at": "B.bottom", "dir": "down", "mag": 8, "label": "\\vec P_2" }
>   ]
> }
> ```

## 10. Pendolo con slider

`theta` si misura dalla verticale (positivo: massa a destra). Il riferimento del pendolo è tangente (`t`) e radiale verso il perno (`n`): la tensione usa `normal` e il peso è scomposto in quel riferimento.

```physics
{
  "xlim": [0, 8], "ylim": [0, 5],
  "params": { "theta": { "min": -60, "max": 60, "step": 1, "val": 30, "unit": "deg", "label": "θ" } },
  "objects": [
    { "id": "p", "type": "pendulum", "pivot": [4, 4.7], "length": 3, "theta": "theta", "angleLabel": "\\theta" },
    { "id": "P", "type": "force", "on": "p", "dir": "down", "mag": 10, "label": "\\vec P" },
    { "type": "force", "on": "p", "dir": "normal", "mag": "10*cos(theta)", "label": "\\vec T" },
    { "type": "decompose", "vector": "P", "frame": "p" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 8], "ylim": [0, 5],
>   "params": { "theta": { "min": -60, "max": 60, "step": 1, "val": 30, "unit": "deg", "label": "θ" } },
>   "objects": [
>     { "id": "p", "type": "pendulum", "pivot": [4, 4.7], "length": 3, "theta": "theta", "angleLabel": "\\theta" },
>     { "id": "P", "type": "force", "on": "p", "dir": "down", "mag": 10, "label": "\\vec P" },
>     { "type": "force", "on": "p", "dir": "normal", "mag": "10*cos(theta)", "label": "\\vec T" },
>     { "type": "decompose", "vector": "P", "frame": "p" }
>   ]
> }
> ```

## 11. Molla e forza elastica

Il blocco si sposta con lo slider `x` (posizione in metri lungo il suolo con `posUnit`); la forza elastica è data per componenti con `vec`. La quota misura lo spostamento dalla posizione di equilibrio.

```physics
{
  "xlim": [0, 7], "ylim": [0, 2.6],
  "params": { "x": { "min": -1.2, "max": 1.2, "step": 0.05, "val": 0.8, "unit": "m" }, "k": { "min": 5, "max": 20, "val": 10, "unit": "N/m" } },
  "objects": [
    { "id": "g", "type": "ground", "from": [0.5, 0.5], "to": [7, 0.5] },
    { "id": "w", "type": "wall", "at": [0.5, 0.5], "height": 1.8 },
    { "id": "A", "type": "block", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [0.8, 0.6], "label": "$m$" },
    { "type": "spring", "from": [0.5, 0.8], "to": "A.left", "coils": 9 },
    { "type": "force", "on": "A", "vec": ["-k*x", 0], "label": "\\vec F_{el}", "showValue": true, "show": "abs(x) > 0.01" },
    { "type": "path", "points": [[3.5, 0.5], [3.5, 2.2]], "dash": "4 4" },
    { "type": "dimension", "from": [3.5, 1.7], "to": ["3.5 + x", 1.7], "offset": 0.25, "label": "$x$", "show": "abs(x) > 0.05" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 7], "ylim": [0, 2.6],
>   "params": { "x": { "min": -1.2, "max": 1.2, "step": 0.05, "val": 0.8, "unit": "m" }, "k": { "min": 5, "max": 20, "val": 10, "unit": "N/m" } },
>   "objects": [
>     { "id": "g", "type": "ground", "from": [0.5, 0.5], "to": [7, 0.5] },
>     { "id": "w", "type": "wall", "at": [0.5, 0.5], "height": 1.8 },
>     { "id": "A", "type": "block", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [0.8, 0.6], "label": "$m$" },
>     { "type": "spring", "from": [0.5, 0.8], "to": "A.left", "coils": 9 },
>     { "type": "force", "on": "A", "vec": ["-k*x", 0], "label": "\\vec F_{el}", "showValue": true, "show": "abs(x) > 0.01" },
>     { "type": "path", "points": [[3.5, 0.5], [3.5, 2.2]], "dash": "4 4" },
>     { "type": "dimension", "from": [3.5, 1.7], "to": ["3.5 + x", 1.7], "offset": 0.25, "label": "$x$", "show": "abs(x) > 0.05" }
>   ]
> }
> ```

## 12. Asta incernierata e disco

L'asta ha il perno all'inizio (`pivot`); le forze si applicano a punti dell'asta (`r.end`, `r.point(0.5)`). Il disco mostra la rotazione con un raggio marcato.

```physics
{
  "xlim": [0, 9], "ylim": [0, 4],
  "objects": [
    { "type": "hinge", "at": [1, 2] },
    { "id": "r", "type": "rod", "from": [1, 2], "to": [5, 2.8], "pivot": "start" },
    { "type": "force", "on": "r", "at": "r.end", "dir": "down", "mag": 5, "label": "\\vec F" },
    { "type": "force", "on": "r", "at": "r.point(0.5)", "dir": "down", "mag": 8, "label": "\\vec P" },
    { "type": "angle", "at": "r.start", "from": "right", "to": "toward:r.end", "radius": 46 },
    { "id": "d", "type": "disk", "at": [7.3, 2], "radius": 0.9, "rotation": 40, "label": "disco" },
    { "type": "velocity", "at": "d.rim(130)", "dir": 220, "mag": 1, "label": "\\vec v" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 9], "ylim": [0, 4],
>   "objects": [
>     { "type": "hinge", "at": [1, 2] },
>     { "id": "r", "type": "rod", "from": [1, 2], "to": [5, 2.8], "pivot": "start" },
>     { "type": "force", "on": "r", "at": "r.end", "dir": "down", "mag": 5, "label": "\\vec F" },
>     { "type": "force", "on": "r", "at": "r.point(0.5)", "dir": "down", "mag": 8, "label": "\\vec P" },
>     { "type": "angle", "at": "r.start", "from": "right", "to": "toward:r.end", "radius": 46 },
>     { "id": "d", "type": "disk", "at": [7.3, 2], "radius": 0.9, "rotation": 40, "label": "disco" },
>     { "type": "velocity", "at": "d.rim(130)", "dir": 220, "mag": 1, "label": "\\vec v" }
>   ]
> }
> ```

## 13. Moto parabolico: traiettoria e componenti

La traiettoria è un `path` parametrico in `t`; le velocità in tre istanti sono scomposte sugli assi con la scorciatoia `"decompose": true`.

```physics
{
  "xlim": [0, 10], "ylim": [0, 4.2], "grid": true,
  "params": { "v0": { "min": 6, "max": 11, "val": 9, "unit": "m/s", "label": "v₀" }, "a": { "min": 20, "max": 70, "val": 45, "unit": "deg" } },
  "objects": [
    { "type": "ground", "from": [0, 0], "to": [10, 0] },
    { "type": "path", "parametric": { "x": "v0*cos(a)*t", "y": "v0*sin(a)*t - g*t^2/2", "t": [0, "2*v0*sin(a)/g"] }, "dash": "5 4" },
    { "type": "velocity", "at": [0, 0], "vec": ["v0*cos(a)", "v0*sin(a)"], "label": "\\vec v_0", "decompose": true, "scale": 0.16 },
    { "type": "velocity", "at": ["v0*cos(a)*0.9", "v0*sin(a)*0.9 - g*0.81/2"], "vec": ["v0*cos(a)", "v0*sin(a) - g*0.9"], "scale": 0.16 },
    { "type": "particle", "at": ["v0*cos(a)*0.9", "v0*sin(a)*0.9 - g*0.81/2"], "radius": 4 }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 10], "ylim": [0, 4.2], "grid": true,
>   "params": { "v0": { "min": 6, "max": 11, "val": 9, "unit": "m/s", "label": "v₀" }, "a": { "min": 20, "max": 70, "val": 45, "unit": "deg" } },
>   "objects": [
>     { "type": "ground", "from": [0, 0], "to": [10, 0] },
>     { "type": "path", "parametric": { "x": "v0*cos(a)*t", "y": "v0*sin(a)*t - g*t^2/2", "t": [0, "2*v0*sin(a)/g"] }, "dash": "5 4" },
>     { "type": "velocity", "at": [0, 0], "vec": ["v0*cos(a)", "v0*sin(a)"], "label": "\\vec v_0", "decompose": true, "scale": 0.16 },
>     { "type": "velocity", "at": ["v0*cos(a)*0.9", "v0*sin(a)*0.9 - g*0.81/2"], "vec": ["v0*cos(a)", "v0*sin(a) - g*0.9"], "scale": 0.16 },
>     { "type": "particle", "at": ["v0*cos(a)*0.9", "v0*sin(a)*0.9 - g*0.81/2"], "radius": 4 }
>   ]
> }
> ```

## 14. Riferimenti personalizzati, angoli e centro di massa

Un `frame` disegna una coppia di assi ruotati; `decompose` usa quegli assi. L'angolo tra tre punti si indica con `points`; `com` segna il centro di massa pesato.

```physics
{
  "xlim": [0, 9], "ylim": [0, 4],
  "objects": [
    { "id": "F1", "type": "frame", "origin": [2, 1.2], "angle": 20, "labels": ["x'", "y'"], "length": 1.9 },
    { "id": "F", "type": "force", "at": [2, 1.2], "dir": 65, "mag": 10, "label": "\\vec F" },
    { "type": "decompose", "vector": "F", "frame": "F1", "showAngle": "x", "angleLabel": "\\varphi" },
    { "id": "A", "type": "ball", "at": [5.5, 1], "radius": 0.35, "mass": 1, "label": "1" },
    { "id": "B", "type": "ball", "at": [8, 2.8], "radius": 0.5, "mass": 3, "label": "3" },
    { "type": "com", "of": ["A", "B"], "label": "CM" },
    { "type": "angle", "points": ["B", "A", [8, 1]], "showValue": true }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 9], "ylim": [0, 4],
>   "objects": [
>     { "id": "F1", "type": "frame", "origin": [2, 1.2], "angle": 20, "labels": ["x'", "y'"], "length": 1.9 },
>     { "id": "F", "type": "force", "at": [2, 1.2], "dir": 65, "mag": 10, "label": "\\vec F" },
>     { "type": "decompose", "vector": "F", "frame": "F1", "showAngle": "x", "angleLabel": "\\varphi" },
>     { "id": "A", "type": "ball", "at": [5.5, 1], "radius": 0.35, "mass": 1, "label": "1" },
>     { "id": "B", "type": "ball", "at": [8, 2.8], "radius": 0.5, "mass": 3, "label": "3" },
>     { "type": "com", "of": ["A", "B"], "label": "CM" },
>     { "type": "angle", "points": ["B", "A", [8, 1]], "showValue": true }
>   ]
> }
> ```

## 15. Avvisi

Chiavi scritte male (con suggerimento), opzioni e tipi non ancora implementati, riferimenti e ancoraggi inesistenti e angoli sospetti finiscono nel riquadro sotto il diagramma.

```physics
{
  "xlin": [0, 10],
  "graphs": [],
  "params": { "theta": { "min": 0, "max": 90, "val": 30 } },
  "objects": [
    { "type": "partcle", "at": [1, 1] },
    { "type": "trace", "of": "s" },
    { "id": "A", "type": "block", "at": [3, 1] },
    { "type": "label", "at": "A.tpo", "text": "?" },
    { "type": "particle", "at": [5, 2], "raduis": 4 },
    { "type": "label", "at": "Z", "text": "?" }
  ]
}
```

## 16. Errore nel JSON

Un JSON non valido mostra un errore al posto del diagramma.

```physics
{
  "xlim": [0, 10],
  "objects": [ { "type": "particle", "at": [1, 1] }, ]
}
```
