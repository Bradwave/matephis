---
title: Matephis Physics System
feed: hide
tags:
  - test
code: true
---

Questa pagina serve come test e documentazione per il sistema di diagrammi di fisica generati via codice (JSON). Tutti i diagrammi sono renderizzati da `matephis-physics.js`. Per provare una configurazione mentre la scrivi usa il [playground](/playground/).

**Stato: fase 5a (scene viste dall'alto e confronto).** Oltre alle fondamenta (finestra in metri, griglia e assi, parametri con slider, gradi e radianti) sono disponibili ambiente, corpi, collegamenti, vettori, riferimenti, scomposizioni, angoli e quote, posizionati gli uni rispetto agli altri con gli ancoraggi. In più: forze automatiche, risultante, coppie azione-reazione, diagramma di corpo libero, pulsanti per mostrare le soluzioni e oggetti trascinabili. In più: tempo e simulazione, con moto analitico o equazioni del moto, eventi, diagrammi del moto e traiettorie; moto lungo un percorso; grafici collegati, barre dell'energia e valori in tempo reale; scene viste dall'alto, strade e automobili, vettori perpendicolari al disegno e confronto tra scene. Più viste della stessa scena, riferimenti in moto, risolutore delle equazioni di Newton e modelli pronti arrivano nelle fasi successive: le opzioni già previste ma non ancora implementate producono un avviso invece di essere ignorate in silenzio.

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
| `labelHalo` | Boolean | `true` | Contorno attorno alle formule LaTeX, come quello dei testi semplici; `false` per toglierlo. |
| `plane` | `"vertical"`/`"horizontal"` | `"vertical"` | `"horizontal"`: la scena è vista dall'alto (vedi «Scene viste dall'alto»). |
| `outOfPlane` | `"symbols"`/`"hide"`/`"note"` | `"symbols"` | Vettori perpendicolari al disegno: simboli ⊙ ⊗, nascosti, o elencati sotto la scena. |
| `compare` | Array | | La scena ridisegnata, sbiadita, con altri valori dei parametri (vedi «Confronto»). |

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
| `energy` | `of` (corpo o lista), `bars`, `total`, `zero`, `drag`, `unit`, `digits`, `size` | (vedi «Grafici, energia e valori») |
| `road` | `path` (o le chiavi di `path`), `width` (7), `lanes` (2), `mu` | `start`, `end`, `point(u)` |
| `car` | come `block`; `size` `[lunghezza, larghezza]` vista dall'alto, `[lunghezza, altezza]` di lato; `wheel` | come `cart` |
| `label` | `at`, `text`, `anchor`, `size` | |

Opzioni comuni: `id`, `label`, `color`, `fill`, `opacity`, `show` (espressione: l'oggetto compare solo se è vera), `hidden`, `layer`.

### Punti e ancoraggi

Un punto (`at`, `from`, `to`, `pivot`, …) può essere:

- `[x, y]` con numeri o espressioni: `["R*cos(alpha)", "R*sin(alpha)"]`;
- un ancoraggio: `"A"` (posizione di `A`), `"A.top"`, `"s.surface(0.6)"` (al 60% del piano), `"p.rim(90)"`;
- `{ "from": "A.top", "offset": [0, 0.5] }`: spostato di un vettore in metri; con `"local": true` lo spostamento è nel riferimento di `A`.

Un corpo con `"on": "s"` si appoggia alla superficie `s` (suolo, piano, tavolo o la faccia superiore di un altro blocco) in posizione `pos` (0–1 lungo la superficie, oppure metri con `"posUnit": "m"`) ed è ruotato come la superficie. L'ordine degli oggetti nella lista non conta.

Nelle espressioni `A.x` e `A.y` leggono la posizione di `A`, `A.angle` (radianti), `A.deg` e `A.rad` la sua rotazione; per un vettore `F.x`, `F.y` sono le componenti, `F.mag` (o `F.len`) il modulo e `F.angle` la direzione. Le forze automatiche si leggono con il loro id: `A.N.mag` è il modulo della normale su `A`. Quando c'è il tempo, `A.vx`, `A.vy`, `A.speed` danno la velocità di un corpo e `A.ax`, `A.ay`, `A.acc` la sua accelerazione, calcolate dal suo moto.

### Direzioni (`dir`)

| Valore | Direzione |
| :--- | :--- |
| `"up"`, `"down"`, `"left"`, `"right"` | assi del mondo |
| `"in"`, `"out"` | perpendicolare al disegno: entra nel foglio (⊗) o esce verso chi guarda (⊙) |
| `"normal"`, `"-normal"`, `"tangent"`, `"-tangent"` | riferimento del corpo: perpendicolare e parallela alla superficie su cui poggia (`tangent` sale lungo il piano) |
| `"tangent:F1"` | riferimento di un altro oggetto |
| `"toward:B"`, `"away:B"` | verso un punto / in direzione opposta |
| `"along:rope"` | lungo la fune, a partire dal corpo |
| `30`, `"alpha + 90°"`, `"pi/2"` | angolo dall'asse x (numeri in `angleUnit`, espressioni in radianti) |
| `[vx, vy]` | direzione di un vettore |

I vettori hanno moduli fisici (N, m/s, …): la scala è automatica per ogni tipo (il più lungo occupa poco più di un quarto della vista), oppure `forceScale` (m per N), `vectorScale: { "velocity": 0.2 }` o `scale` sul singolo vettore. Le etichette con un comando TeX (`"\\vec F"`) sono scritte in LaTeX anche senza `$`.

### Forze automatiche

Con `"forces": "auto"` su un corpo (`particle`, `block`, `ball`, `cart`, `rod`, `disk`, `pendulum`) compaiono da sole le forze dovute ai suoi collegamenti, con id `<corpo>.<nome>`:

| Nome | Forza | Quando | Modulo (indicativo) |
| :--- | :--- | :--- | :--- |
| `P` | peso | sempre, nel centro di massa | $mg$ |
| `N` | reazione normale | il corpo è appoggiato (`on`) | bilancia le altre forze perpendicolari alla superficie: $mg\cos\alpha$ da solo, di più con un corpo sopra o una spinta verso il basso; zero se il corpo viene sollevato |
| `N_B` | spinta di un corpo `B` appoggiato sopra | `B` ha `"on"` uguale a questo corpo | opposta alla normale di `B` |
| `f` | attrito | `mu` (sul corpo o sulla superficie), `friction`, `moving` | statico: bilancia le altre forze lungo la superficie, al massimo $\mu N$; dinamico: $\mu N$ |
| `T`, `T1`, `T2` | tensione | una per ogni fune attaccata al corpo; il filo di un pendolo | peso di ciò che pende (la media se pendono entrambi i capi); pendolo: $mg\cos\theta$ |
| `Fel`, `Fel1` | forza elastica | una per ogni molla attaccata (servono `k` e `rest`) | $k\,\lvert L - L_0\rvert$ |

Le direzioni seguono la geometria. Normale e attrito statico sono esatti per un corpo fermo sulla sua superficie, perché bilanciano le altre forze; la tensione segue una regola da libro di testo, non la soluzione delle equazioni del moto: per un valore esatto si usa `mag` in `override`. Opzioni del corpo:

- `"exclude": ["f"]` toglie alcune forze; `"override": { "N": { "label": "\\vec R" }, "*": { "hidden": true } }` cambia le opzioni di una forza o di tutte (`*`); `"add": [ {...} ]` aggiunge forze scritte a mano;
- `"friction": "static"` (default) / `"kinetic"` / `"none"`; per l'attrito dinamico `"moving"` indica il verso del moto (`up`, `down`, `left`, `right`). L'attrito statico non ha bisogno di indicazioni: il verso viene dalle altre forze;
- `"applyAt": "physical"` (default) mette normale e attrito nel punto di contatto, la tensione nel punto della fune e la forza elastica nel punto della molla; `"center"` mette tutto nel centro di massa. Vale anche come opzione globale. Il peso è sempre nel centro di massa.

Le forze automatiche sono forze come le altre: si scompongono con `"vector": "A.P"` e si nascondono o si mostrano con i pulsanti.

### Risultante, coppie, corpo libero

| Tipo | Opzioni | Descrizione |
| :--- | :--- | :--- |
| `resultant` | `on`, `kind` (default `force`), `construction: "tip-to-tail"`, `showValue`, `label` | Somma dei vettori sul corpo, dal centro di massa. Se è nulla scrive $\vec R = 0$. |
| `pairs` | `between: ["A", "B"]` | Colora allo stesso modo le coppie azione e reazione tra due corpi. Per le forze scritte a mano indica chi la esercita con `"by": "B"`. |
| `fbd` | `of`, `shape` (`true`: disegna il corpo), `size` (px), `label`, `forces`, `button` | Diagramma di corpo libero in un riquadro sotto la scena, con le forze visibili del corpo. `"forces": "all"` mostra anche quelle nascoste nella scena. `"button": true` aggiunge un pulsante «Mostra corpo libero di …» (o con il testo dato) e il riquadro parte nascosto. I riquadri di una scena usano la stessa scala, così le forze restano confrontabili. |

### Pulsanti e trascinamento

`"controls"` aggiunge pulsanti sotto la scena:

- `{ "type": "reveal", "label": "Mostra forze", "targets": ["A.*"] }` mostra gli oggetti con `"hidden": true` che corrispondono ai bersagli (id con `*`, oppure `"type:decompose"`); premuto di nuovo li nasconde. «Mostra» diventa «Nascondi» mentre è premuto.
- `{ "type": "toggle", "label": "Molla rigida", "param": "k", "on": 20, "off": 8 }` alterna un parametro tra due valori.

`"drag"` su un oggetto lo rende trascinabile e cambia un parametro come farebbe il suo slider:

- `"drag": "u"`: per un corpo appoggiato, la posizione lungo la superficie (il parametro va usato in `pos`); per un pendolo, l'angolo;
- `{ "param": "x", "axis": "x" }`, `{ "param": ["px", "py"] }`, `{ "param": "theta", "angle": true }`; `min` e `max` limitano il valore.

Una scena con oggetti trascinabili non si apre a schermo intero con un clic.

### Tempo e simulazione

Con `"time"` la scena ha un orologio: pulsanti avvia/pausa e ricomincia, uno slider per spostarsi nel tempo, il tempo attuale e la velocità di riproduzione (0.25×–2×). Il moto si scrive in due modi, anche insieme nella stessa scena:

- **analitico**: posizioni e angoli in funzione di `t`, per esempio `"at": ["v0*cos(a)*t", "v0*sin(a)*t - g*t^2/2"]`;
- **numerico**: variabili di stato e loro derivate, integrate con Runge-Kutta (RK4) a passo fisso: `"state": { "x": 1, "v": 0 }`, `"ode": { "x": "v", "v": "-k/m*x" }`.

`t` e le variabili di stato si usano in tutte le espressioni come parametri. Tutto il moto viene calcolato una volta all'apertura della pagina e di nuovo quando cambia uno slider: avviare e spostarsi nel tempo è immediato.

| Chiave di `time` | Default | Significato |
| :--- | :--- | :--- |
| `max` | 10 | durata (s), anche un'espressione |
| `dt` | 1/240 | passo di integrazione (s) |
| `speed` | 1 | velocità di riproduzione iniziale |
| `loop` | `false` | `true` ricomincia, `"bounce"` torna indietro |
| `autoplay` | `false` | parte da sola la prima volta che la scena è visibile |
| `stopWhen` | | condizione che termina il moto (`"y < 0"`) |

`"events"` cambia lo stato quando una condizione diventa vera, nell'istante esatto: `{ "when": "y < r", "set": { "vy": "-e*vy" } }` è un rimbalzo; `"stop": true` termina il moto, `"once": true` scatta una volta sola. L'orologio si ferma quando la scena esce dallo schermo.

| Tipo | Opzioni | Descrizione |
| :--- | :--- | :--- |
| `velocity`, `acceleration` | `on` senza `dir` né `vec` | velocità e accelerazione del corpo, calcolate dal suo moto |
| `ghosts` | `of`, `every` (s), `from`, `to`, `vectors` (`["velocity"]`), `labels: "t"`, `opacity`, `upTo` | copie del corpo a intervalli regolari: il diagramma del moto (stroboscopico) |
| `trace` | `of`, `window` (s), `width`, `dash`, `upTo` | traiettoria percorsa |

Un corpo con `"follow": "r"` si muove lungo il percorso `r` (`path`): `"s"` è la distanza percorsa in metri, un'espressione di `t` o una variabile di stato; `"orient": "tangent"` lo fa ruotare con la curva. Su un percorso chiuso (una circonferenza) fa il giro, su uno aperto si ferma alla fine. Velocità e accelerazione sono precise anche sulle curve: per archi e curve parametriche la posizione è calcolata esattamente, non sulla spezzata disegnata.

Con l'orologio fantasmi e traccia compaiono man mano (`"upTo": "now"`); senza `"time"` la scena è statica e li mostra tutti, utile per le figure degli esercizi. Le scale automatiche dei vettori usano il valore massimo su tutto il moto, così un vettore che cresce si allunga davvero.

### Grafici, energia e valori

`"readouts"` scrive sotto la scena una riga di valori che seguono il tempo e gli slider. Una stringa è un'espressione, con sé stessa come etichetta: `"t"`, `"A.speed"` (l'unità è indovinata per `t`, velocità e accelerazioni). Un oggetto dà etichetta, unità e cifre: `{ "label": "N", "value": "A.N.mag", "unit": "N", "digits": 1 }`. Con `"hidden": true` il valore parte nascosto e compare con un pulsante `reveal` (`"targets": ["type:readout"]`, o l'`id` del valore).

`"graphs"` disegna sotto la scena grafici del moto con il motore dei grafici:

| Chiave | Default | Significato |
| :--- | :--- | :--- |
| `y` | | espressione, o lista di espressioni (più curve) |
| `x` | `"t"` | asse orizzontale; un'altra espressione dà per esempio il piano delle fasi (`"x": "x", "y": "v"`) |
| `label`, `legend`, `axisLabels` | | titolo, nomi delle curve, nomi degli assi |
| `xlim`, `ylim`, `aspectRatio` | automatici | limiti (di default contengono tutto il moto) e proporzioni |
| `cursor` | `true` | con l'orologio, linea verticale e punti nell'istante attuale |
| `progressive` | `false` | disegna le curve solo fino all'istante attuale |
| `colors` | | colori delle curve |
| `position` | `"below"` | `"below"` sotto la scena; `"right"` a destra (sotto di nuovo se lo schermo è stretto); `"tabs"` sotto la scena in schede, un grafico alla volta (il titolo è il nome della scheda) |
| `plot` | | altre opzioni del motore dei grafici, passate così come sono |

Le espressioni sono valutate su tutto il moto già calcolato, quindi leggono stato, parametri e valori degli oggetti (`A.speed`, `A.N.mag`). Nelle equazioni del moto (`ode`) invece si usano solo parametri e variabili di stato.

Un oggetto `energy` disegna in un riquadro le barre delle energie di un corpo o di un sistema (`"of": ["A", "B"]`): `K` cinetica, `Ug` potenziale gravitazionale ($mgy$ del centro di massa, rispetto a `zero`), `Uel` elastica (le molle attaccate ai corpi, con `k` e `rest`), `Q` energia persa dall'inizio (attrito, resistenza dell'aria), oppure barre libere `{ "label": "W", "value": "..." }`. `"total": true` aggiunge $E$, la somma di `K`, `Ug` e `Uel` tra quelle mostrate. Tutte le barre hanno la stessa scala, quella del valore più grande nel moto. Con `"drag": "h0"` (un parametro) il livello zero di $U_g$ è una linea tratteggiata che si trascina.

### Scene viste dall'alto

Con `"plane": "horizontal"` le coordinate sono quelle del terreno visto dall'alto e la gravità entra nel foglio. Peso e normale delle forze automatiche sono perpendicolari al disegno (⊗ e ⊙, $N = mg$); l'attrito sta nel piano: quello statico è la forza che serve al moto, $m\vec a$ meno le altre forze (in curva $mv^2/R$ verso il centro), quello dinamico (`"friction": "kinetic"`) è $\mu N$ contro la velocità. Un'automobile ha sempre l'attrito; il valore di $\mu$ viene dalla strada che segue o dal corpo. Che la forza necessaria superi $\mu m g$ si vede confrontando i valori (esempio 30): lo slittamento arriva con il risolutore.

Una strada (`road`) è un percorso con una larghezza e delle corsie. Con `"follow"` un corpo la percorre lungo la linea di mezzo; `"offset"` lo sposta di lato (metri, positivo a sinistra del verso di percorrenza) e `s` si misura lungo la corsia, così la sua derivata è la velocità del corpo. Un'automobile (`car`) vista dall'alto ha `size` `[lunghezza, larghezza]`; nelle scene di lato è disegnata di profilo, su due ruote.

### Confronto

`"compare": [{ "mu": 0 }, { "mu": 0.4, "label": "strada bagnata" }]` ridisegna la scena per ogni gruppo di valori (in unità dello slider), sbiadita e senza etichette, sotto la scena principale e con le sue stesse scale. Con il tempo ogni gruppo ha la sua simulazione e tutte seguono lo stesso orologio, che dura fino alla fine della più lunga. Sotto la scena una riga dice cosa è sbiadito (il testo di `label`, oppure i valori).

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

## 15. Forze automatiche, pulsanti e corpo libero

Il blocco ha `"forces": "auto"`: peso, normale e attrito (c'è `mu`) sono generati e nascosti con `override`. I pulsanti mostrano forze, scomposizione e risultante; il riquadro sotto è il diagramma di corpo libero. Si può trascinare il blocco lungo il piano; con un'inclinazione oltre $\arctan\mu \approx 31°$ l'attrito statico non basta più e la risultante non è nulla.

```physics
{
  "xlim": [0, 9], "ylim": [0, 5], "forceScale": 0.09,
  "params": {
    "u": { "min": 0.25, "max": 0.85, "step": 0.01, "val": 0.5, "label": "posizione" },
    "alpha": { "min": 10, "max": 40, "step": 1, "val": 25, "unit": "deg", "label": "α" }
  },
  "controls": [
    { "type": "reveal", "label": "Mostra forze", "targets": ["A.*"] },
    { "type": "reveal", "label": "Mostra scomposizione", "targets": ["type:decompose"] },
    { "type": "reveal", "label": "Mostra risultante", "targets": ["R"] }
  ],
  "objects": [
    { "type": "ground", "y": 0.3 },
    { "id": "s", "type": "slope", "at": [0.4, 0.3], "angle": "alpha", "length": 7.2 },
    { "id": "A", "type": "block", "on": "s", "pos": "u", "size": [1.4, 0.8], "mass": 2, "mu": 0.6,
      "forces": "auto", "override": { "*": { "hidden": true } }, "drag": "u" },
    { "type": "decompose", "vector": "A.P", "frame": "s", "hidden": true },
    { "id": "R", "type": "resultant", "on": "A", "hidden": true },
    { "type": "angle", "of": "s", "label": "\\alpha" },
    { "type": "fbd", "of": "A", "label": "Corpo libero del blocco" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 9], "ylim": [0, 5], "forceScale": 0.09,
>   "params": {
>     "u": { "min": 0.25, "max": 0.85, "step": 0.01, "val": 0.5, "label": "posizione" },
>     "alpha": { "min": 10, "max": 40, "step": 1, "val": 25, "unit": "deg", "label": "α" }
>   },
>   "controls": [
>     { "type": "reveal", "label": "Mostra forze", "targets": ["A.*"] },
>     { "type": "reveal", "label": "Mostra scomposizione", "targets": ["type:decompose"] },
>     { "type": "reveal", "label": "Mostra risultante", "targets": ["R"] }
>   ],
>   "objects": [
>     { "type": "ground", "y": 0.3 },
>     { "id": "s", "type": "slope", "at": [0.4, 0.3], "angle": "alpha", "length": 7.2 },
>     { "id": "A", "type": "block", "on": "s", "pos": "u", "size": [1.4, 0.8], "mass": 2, "mu": 0.6,
>       "forces": "auto", "override": { "*": { "hidden": true } }, "drag": "u" },
>     { "type": "decompose", "vector": "A.P", "frame": "s", "hidden": true },
>     { "id": "R", "type": "resultant", "on": "A", "hidden": true },
>     { "type": "angle", "of": "s", "label": "\\alpha" },
>     { "type": "fbd", "of": "A", "label": "Corpo libero del blocco" }
>   ]
> }
> ```

## 16. Blocchi impilati: azione e reazione

Il blocco $m$ è appoggiato su $M$: $M$ riceve da $m$ la spinta $\vec N'_B$, e `pairs` colora allo stesso modo le due forze della coppia. Nella scena le forze sono nascoste; ogni diagramma di corpo libero ha il suo pulsante (`"button": true`) e mostra tutte le forze del corpo (`"forces": "all"`), con la sua forma (`"shape": true`).

```physics
{
  "xlim": [0, 8], "ylim": [0, 3.6], "forceScale": 0.035,
  "objects": [
    { "id": "g", "type": "ground", "y": 0.3 },
    { "id": "A", "type": "block", "on": "g", "pos": 0.45, "size": [2.6, 1], "mass": 5, "label": "$M$",
      "forces": "auto", "override": { "*": { "hidden": true } } },
    { "id": "B", "type": "block", "on": "A", "size": [1.2, 0.7], "mass": 2, "label": "$m$",
      "forces": "auto", "override": { "*": { "hidden": true } } },
    { "type": "pairs", "between": ["A", "B"] },
    { "type": "fbd", "of": "A", "shape": true, "forces": "all", "button": true, "label": "Corpo libero di M" },
    { "type": "fbd", "of": "B", "shape": true, "forces": "all", "button": true, "label": "Corpo libero di m" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 8], "ylim": [0, 3.6], "forceScale": 0.035,
>   "objects": [
>     { "id": "g", "type": "ground", "y": 0.3 },
>     { "id": "A", "type": "block", "on": "g", "pos": 0.45, "size": [2.6, 1], "mass": 5, "label": "$M$",
>       "forces": "auto", "override": { "*": { "hidden": true } } },
>     { "id": "B", "type": "block", "on": "A", "size": [1.2, 0.7], "mass": 2, "label": "$m$",
>       "forces": "auto", "override": { "*": { "hidden": true } } },
>     { "type": "pairs", "between": ["A", "B"] },
>     { "type": "fbd", "of": "A", "shape": true, "forces": "all", "button": true, "label": "Corpo libero di M" },
>     { "type": "fbd", "of": "B", "shape": true, "forces": "all", "button": true, "label": "Corpo libero di m" }
>   ]
> }
> ```

## 17. Pendolo trascinabile e risultante

Si trascina la massa: `"drag": "theta"` cambia l'angolo come lo slider. Peso e tensione sono automatici; la risultante è tangente alla traiettoria e vale $mg\sin\theta$.

```physics
{
  "xlim": [0, 8], "ylim": [0, 5],
  "params": { "theta": { "min": -60, "max": 60, "step": 1, "val": 35, "unit": "deg", "label": "θ" } },
  "objects": [
    { "id": "p", "type": "pendulum", "pivot": [4, 4.7], "length": 3, "theta": "theta", "angleLabel": "\\theta",
      "mass": 1, "forces": "auto", "drag": "theta" },
    { "type": "resultant", "on": "p", "showValue": true }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 8], "ylim": [0, 5],
>   "params": { "theta": { "min": -60, "max": 60, "step": 1, "val": 35, "unit": "deg", "label": "θ" } },
>   "objects": [
>     { "id": "p", "type": "pendulum", "pivot": [4, 4.7], "length": 3, "theta": "theta", "angleLabel": "\\theta",
>       "mass": 1, "forces": "auto", "drag": "theta" },
>     { "type": "resultant", "on": "p", "showValue": true }
>   ]
> }
> ```

## 18. Molla con forza automatica e pulsante

La forza elastica è generata dalla molla (`k` e `rest`). Il blocco si trascina lungo il suolo; il pulsante cambia la costante elastica.

```physics
{
  "xlim": [0, 7], "ylim": [0, 2.6],
  "params": {
    "x": { "min": -1.2, "max": 1.2, "step": 0.05, "val": 0.8, "unit": "m" },
    "k": { "min": 5, "max": 25, "val": 8, "unit": "N/m" }
  },
  "controls": [ { "type": "toggle", "label": "Molla rigida", "param": "k", "on": 20, "off": 8 } ],
  "objects": [
    { "id": "g", "type": "ground", "from": [0.5, 0.5], "to": [7, 0.5] },
    { "id": "w", "type": "wall", "at": [0.5, 0.5], "height": 1.8 },
    { "id": "A", "type": "block", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [0.8, 0.6], "label": "$m$",
      "forces": "auto", "exclude": ["P", "N"], "override": { "Fel": { "showValue": true } }, "drag": "x" },
    { "type": "spring", "from": [0.5, 0.8], "to": "A.left", "coils": 9, "k": "k", "rest": 2.6 },
    { "type": "path", "points": [[3.5, 0.5], [3.5, 2.2]], "dash": "4 4" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 7], "ylim": [0, 2.6],
>   "params": {
>     "x": { "min": -1.2, "max": 1.2, "step": 0.05, "val": 0.8, "unit": "m" },
>     "k": { "min": 5, "max": 25, "val": 8, "unit": "N/m" }
>   },
>   "controls": [ { "type": "toggle", "label": "Molla rigida", "param": "k", "on": 20, "off": 8 } ],
>   "objects": [
>     { "id": "g", "type": "ground", "from": [0.5, 0.5], "to": [7, 0.5] },
>     { "id": "w", "type": "wall", "at": [0.5, 0.5], "height": 1.8 },
>     { "id": "A", "type": "block", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [0.8, 0.6], "label": "$m$",
>       "forces": "auto", "exclude": ["P", "N"], "override": { "Fel": { "showValue": true } }, "drag": "x" },
>     { "type": "spring", "from": [0.5, 0.8], "to": "A.left", "coils": 9, "k": "k", "rest": 2.6 },
>     { "type": "path", "points": [[3.5, 0.5], [3.5, 2.2]], "dash": "4 4" }
>   ]
> }
> ```

## 19. Tavolo e carrucola con forze automatiche

Le tensioni seguono la fune e valgono, in modo indicativo, il peso della massa appesa; con `"applyAt": "center"` le forze partono tutte dal centro dei blocchi.

```physics
{
  "xlim": [0, 7], "ylim": [0, 4], "applyAt": "center", "forceScale": 0.025,
  "objects": [
    { "type": "ground", "y": 0.2 },
    { "id": "t", "type": "table", "at": [0.5, 2.5], "width": 4.5, "height": 2.3 },
    { "id": "A", "type": "block", "on": "t", "pos": 0.45, "size": [1, 0.6], "mass": 3, "label": "$m_1$", "forces": "auto" },
    { "id": "p", "type": "pulley", "at": { "from": "t.edge", "offset": [0.3, 0] }, "radius": 0.3, "hangFrom": "t.edge" },
    { "id": "B", "type": "block", "at": [5.6, 1.5], "size": [0.6, 0.6], "mass": 2, "label": "$m_2$", "forces": "auto" },
    { "type": "rope", "from": "A.right", "to": "B.top", "over": ["p"] }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 7], "ylim": [0, 4], "applyAt": "center", "forceScale": 0.025,
>   "objects": [
>     { "type": "ground", "y": 0.2 },
>     { "id": "t", "type": "table", "at": [0.5, 2.5], "width": 4.5, "height": 2.3 },
>     { "id": "A", "type": "block", "on": "t", "pos": 0.45, "size": [1, 0.6], "mass": 3, "label": "$m_1$", "forces": "auto" },
>     { "id": "p", "type": "pulley", "at": { "from": "t.edge", "offset": [0.3, 0] }, "radius": 0.3, "hangFrom": "t.edge" },
>     { "id": "B", "type": "block", "at": [5.6, 1.5], "size": [0.6, 0.6], "mass": 2, "label": "$m_2$", "forces": "auto" },
>     { "type": "rope", "from": "A.right", "to": "B.top", "over": ["p"] }
>   ]
> }
> ```

## 20. Moto parabolico con orologio

Moto analitico in $t$; velocità e accelerazione della pallina sono calcolate dal suo moto, la traccia compare man mano. `stopWhen` ferma il moto quando la pallina torna al suolo.

```physics
{
  "xlim": [0, 10], "ylim": [0, 4.5], "grid": true,
  "params": {
    "v0": { "min": 5, "max": 10, "val": 8, "unit": "m/s", "label": "v₀" },
    "a": { "min": 15, "max": 75, "val": 50, "unit": "deg", "label": "α" }
  },
  "time": { "max": 3, "stopWhen": "v0*sin(a)*t - g*t^2/2 < 0" },
  "objects": [
    { "type": "ground", "from": [0, 0], "to": [10, 0] },
    { "id": "B", "type": "ball", "radius": 0.15, "at": ["v0*cos(a)*t", "v0*sin(a)*t - g*t^2/2"] },
    { "type": "trace", "of": "B" },
    { "type": "velocity", "on": "B", "label": "\\vec v", "decompose": true },
    { "type": "acceleration", "on": "B", "label": "\\vec g" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 10], "ylim": [0, 4.5], "grid": true,
>   "params": {
>     "v0": { "min": 5, "max": 10, "val": 8, "unit": "m/s", "label": "v₀" },
>     "a": { "min": 15, "max": 75, "val": 50, "unit": "deg", "label": "α" }
>   },
>   "time": { "max": 3, "stopWhen": "v0*sin(a)*t - g*t^2/2 < 0" },
>   "objects": [
>     { "type": "ground", "from": [0, 0], "to": [10, 0] },
>     { "id": "B", "type": "ball", "radius": 0.15, "at": ["v0*cos(a)*t", "v0*sin(a)*t - g*t^2/2"] },
>     { "type": "trace", "of": "B" },
>     { "type": "velocity", "on": "B", "label": "\\vec v", "decompose": true },
>     { "type": "acceleration", "on": "B", "label": "\\vec g" }
>   ]
> }
> ```

## 21. Pallina che rimbalza (equazioni del moto ed eventi)

Lo stato è integrato numericamente; l'evento inverte la velocità verticale, moltiplicata per il coefficiente di restituzione $e$, nell'istante esatto dell'urto.

```physics
{
  "xlim": [0, 6], "ylim": [0, 4],
  "params": { "e": { "min": 0.75, "max": 1, "step": 0.05, "val": 0.85 } },
  "state": { "x": 0.5, "y": 3.5, "vx": 1.1, "vy": 0 },
  "ode": { "x": "vx", "y": "vy", "vx": "0", "vy": "-g" },
  "events": [ { "when": "y < 0.2", "set": { "vy": "-e*vy" } } ],
  "time": { "max": 4.5, "loop": true },
  "objects": [
    { "type": "ground", "from": [0, 0], "to": [6, 0] },
    { "id": "B", "type": "ball", "radius": 0.2, "at": ["x", "y"] },
    { "type": "trace", "of": "B" },
    { "type": "velocity", "on": "B", "label": "\\vec v" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 6], "ylim": [0, 4],
>   "params": { "e": { "min": 0.75, "max": 1, "step": 0.05, "val": 0.85 } },
>   "state": { "x": 0.5, "y": 3.5, "vx": 1.1, "vy": 0 },
>   "ode": { "x": "vx", "y": "vy", "vx": "0", "vy": "-g" },
>   "events": [ { "when": "y < 0.2", "set": { "vy": "-e*vy" } } ],
>   "time": { "max": 4.5, "loop": true },
>   "objects": [
>     { "type": "ground", "from": [0, 0], "to": [6, 0] },
>     { "id": "B", "type": "ball", "radius": 0.2, "at": ["x", "y"] },
>     { "type": "trace", "of": "B" },
>     { "type": "velocity", "on": "B", "label": "\\vec v" }
>   ]
> }
> ```

## 22. Pendolo: grandi oscillazioni e approssimazione

Il pendolo pieno segue l'equazione $\ddot\theta = -\frac{g}{L}\sin\theta$; quello trasparente l'approssimazione delle piccole oscillazioni $\theta_0\cos(\sqrt{g/L}\,t)$. Con un angolo iniziale grande si separano.

```physics
{
  "xlim": [0, 8], "ylim": [0, 5],
  "params": {
    "th0": { "min": 5, "max": 170, "step": 5, "val": 60, "unit": "deg", "label": "θ₀" },
    "L": { "min": 1, "max": 3.5, "step": 0.1, "val": 3, "unit": "m" }
  },
  "state": { "theta": "th0", "omega": 0 },
  "ode": { "theta": "omega", "omega": "-g/L*sin(theta)" },
  "time": { "max": 12, "loop": true },
  "objects": [
    { "type": "pendulum", "pivot": [4, 4.6], "length": "L", "theta": "th0*cos(sqrt(g/L)*t)", "opacity": 0.35, "showVertical": false },
    { "id": "p", "type": "pendulum", "pivot": [4, 4.6], "length": "L", "theta": "theta" },
    { "type": "velocity", "on": "p", "label": "\\vec v" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 8], "ylim": [0, 5],
>   "params": {
>     "th0": { "min": 5, "max": 170, "step": 5, "val": 60, "unit": "deg", "label": "θ₀" },
>     "L": { "min": 1, "max": 3.5, "step": 0.1, "val": 3, "unit": "m" }
>   },
>   "state": { "theta": "th0", "omega": 0 },
>   "ode": { "theta": "omega", "omega": "-g/L*sin(theta)" },
>   "time": { "max": 12, "loop": true },
>   "objects": [
>     { "type": "pendulum", "pivot": [4, 4.6], "length": "L", "theta": "th0*cos(sqrt(g/L)*t)", "opacity": 0.35, "showVertical": false },
>     { "id": "p", "type": "pendulum", "pivot": [4, 4.6], "length": "L", "theta": "theta" },
>     { "type": "velocity", "on": "p", "label": "\\vec v" }
>   ]
> }
> ```

## 23. Moto circolare uniforme

Velocità tangente e accelerazione centripeta, calcolate dal moto; la durata è un periodo.

```physics
{
  "xlim": [-3, 3], "ylim": [-3, 3], "aspectRatio": "1:1",
  "params": { "w": { "min": 0.5, "max": 3, "step": 0.1, "val": 1.2, "unit": "rad/s", "label": "ω" }, "R": { "min": 1, "max": 2.5, "val": 2, "unit": "m" } },
  "time": { "max": "2*pi/w", "loop": true },
  "objects": [
    { "type": "path", "arc": { "center": [0, 0], "radius": "R" }, "dash": "3 5" },
    { "type": "particle", "at": [0, 0], "radius": 3 },
    { "id": "P", "type": "ball", "radius": 0.12, "at": ["R*cos(w*t)", "R*sin(w*t)"] },
    { "type": "velocity", "on": "P", "label": "\\vec v" },
    { "type": "acceleration", "on": "P", "label": "\\vec a_c" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [-3, 3], "ylim": [-3, 3], "aspectRatio": "1:1",
>   "params": { "w": { "min": 0.5, "max": 3, "step": 0.1, "val": 1.2, "unit": "rad/s", "label": "ω" }, "R": { "min": 1, "max": 2.5, "val": 2, "unit": "m" } },
>   "time": { "max": "2*pi/w", "loop": true },
>   "objects": [
>     { "type": "path", "arc": { "center": [0, 0], "radius": "R" }, "dash": "3 5" },
>     { "type": "particle", "at": [0, 0], "radius": 3 },
>     { "id": "P", "type": "ball", "radius": 0.12, "at": ["R*cos(w*t)", "R*sin(w*t)"] },
>     { "type": "velocity", "on": "P", "label": "\\vec v" },
>     { "type": "acceleration", "on": "P", "label": "\\vec a_c" }
>   ]
> }
> ```

## 24. Diagramma del moto (statico)

Senza `"time"` la scena è una figura: le copie del carrello ogni 0.5 s mostrano un moto uniformemente accelerato: gli spostamenti crescono ogni volta della stessa quantità, e così la velocità. Il carrello stesso è nascosto.

```physics
{
  "xlim": [0, 10], "ylim": [0, 2.5],
  "objects": [
    { "id": "g", "type": "ground", "from": [0, 0.3], "to": [10, 0.3] },
    { "id": "C", "type": "cart", "on": "g", "pos": "0.6 + 1.2*t + 0.8*t^2", "posUnit": "m", "size": [0.6, 0.3], "hidden": true },
    { "type": "ghosts", "of": "C", "every": 0.5, "from": 0, "to": 2.5, "vectors": ["velocity"], "labels": "t", "opacity": 0.7 }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 10], "ylim": [0, 2.5],
>   "objects": [
>     { "id": "g", "type": "ground", "from": [0, 0.3], "to": [10, 0.3] },
>     { "id": "C", "type": "cart", "on": "g", "pos": "0.6 + 1.2*t + 0.8*t^2", "posUnit": "m", "size": [0.6, 0.3], "hidden": true },
>     { "type": "ghosts", "of": "C", "every": 0.5, "from": 0, "to": 2.5, "vectors": ["velocity"], "labels": "t", "opacity": 0.7 }
>   ]
> }
> ```

## 25. Oscillatore smorzato

Molla con attrito viscoso: $\ddot x = -\frac{k}{m}x - \frac{b}{m}\dot x$. La forza elastica è automatica e segue il moto.

```physics
{
  "xlim": [0, 7], "ylim": [0, 2.4],
  "params": {
    "k": { "min": 5, "max": 30, "val": 12, "unit": "N/m" },
    "b": { "min": 0, "max": 3, "step": 0.1, "val": 0.6, "unit": "kg/s" },
    "m": { "min": 0.5, "max": 3, "val": 1, "unit": "kg" }
  },
  "state": { "x": 1, "v": 0 },
  "ode": { "x": "v", "v": "-k/m*x - b/m*v" },
  "time": { "max": 15 },
  "objects": [
    { "id": "g", "type": "ground", "from": [0.5, 0.5], "to": [7, 0.5] },
    { "id": "w", "type": "wall", "at": [0.5, 0.5], "height": 1.6 },
    { "id": "A", "type": "block", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [0.8, 0.6], "mass": "m",
      "forces": "auto", "exclude": ["P", "N"] },
    { "type": "spring", "from": [0.5, 0.8], "to": "A.left", "coils": 9, "k": "k", "rest": 2.6 },
    { "type": "velocity", "on": "A", "label": "\\vec v" },
    { "type": "path", "points": [[3.5, 0.5], [3.5, 2.1]], "dash": "4 4" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 7], "ylim": [0, 2.4],
>   "params": {
>     "k": { "min": 5, "max": 30, "val": 12, "unit": "N/m" },
>     "b": { "min": 0, "max": 3, "step": 0.1, "val": 0.6, "unit": "kg/s" },
>     "m": { "min": 0.5, "max": 3, "val": 1, "unit": "kg" }
>   },
>   "state": { "x": 1, "v": 0 },
>   "ode": { "x": "v", "v": "-k/m*x - b/m*v" },
>   "time": { "max": 15 },
>   "objects": [
>     { "id": "g", "type": "ground", "from": [0.5, 0.5], "to": [7, 0.5] },
>     { "id": "w", "type": "wall", "at": [0.5, 0.5], "height": 1.6 },
>     { "id": "A", "type": "block", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [0.8, 0.6], "mass": "m",
>       "forces": "auto", "exclude": ["P", "N"] },
>     { "type": "spring", "from": [0.5, 0.8], "to": "A.left", "coils": 9, "k": "k", "rest": 2.6 },
>     { "type": "velocity", "on": "A", "label": "\\vec v" },
>     { "type": "path", "points": [[3.5, 0.5], [3.5, 2.1]], "dash": "4 4" }
>   ]
> }
> ```

## 26. Oscillatore: grafici, energia e valori

Massa e molla senza attrito. Il grafico della posizione è a destra della scena (sotto, su schermi stretti); energie e piano delle fasi sono in schede. Sotto la scena: i valori del momento e le barre dell'energia, con la stessa scala per tutto il moto. Il cursore dei grafici segue il tempo.

```physics
{
  "xlim": [0, 7], "ylim": [0, 1.8],
  "params": {
    "k": { "min": 5, "max": 30, "val": 12, "unit": "N/m" },
    "m": { "min": 0.5, "max": 3, "val": 1, "unit": "kg" }
  },
  "state": { "x": 1, "v": 0 },
  "ode": { "x": "v", "v": "-k/m*x" },
  "time": { "max": 8, "loop": true },
  "objects": [
    { "id": "g", "type": "ground", "from": [0.5, 0.4], "to": [7, 0.4] },
    { "type": "wall", "at": [0.5, 0.4], "height": 1.2 },
    { "id": "A", "type": "block", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [0.8, 0.6], "mass": "m" },
    { "type": "spring", "from": [0.5, 0.7], "to": "A.left", "coils": 9, "k": "k", "rest": 2.6 },
    { "type": "energy", "of": "A", "bars": ["K", "Uel"], "total": true }
  ],
  "readouts": ["t", { "label": "x", "value": "x", "unit": "m" }, { "label": "v", "value": "v", "unit": "m/s" }],
  "graphs": [
    { "y": "x", "label": "Posizione", "axisLabels": ["t (s)", "x (m)"], "position": "right" },
    { "y": ["0.5*m*v^2", "0.5*k*x^2", "0.5*m*v^2 + 0.5*k*x^2"], "legend": ["K", "U", "E"],
      "label": "Energie", "axisLabels": ["t (s)", "E (J)"], "position": "tabs" },
    { "x": "x", "y": "v", "label": "Piano delle fasi", "axisLabels": ["x (m)", "v (m/s)"], "aspectRatio": 1.6, "position": "tabs" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 7], "ylim": [0, 1.8],
>   "params": {
>     "k": { "min": 5, "max": 30, "val": 12, "unit": "N/m" },
>     "m": { "min": 0.5, "max": 3, "val": 1, "unit": "kg" }
>   },
>   "state": { "x": 1, "v": 0 },
>   "ode": { "x": "v", "v": "-k/m*x" },
>   "time": { "max": 8, "loop": true },
>   "objects": [
>     { "id": "g", "type": "ground", "from": [0.5, 0.4], "to": [7, 0.4] },
>     { "type": "wall", "at": [0.5, 0.4], "height": 1.2 },
>     { "id": "A", "type": "block", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [0.8, 0.6], "mass": "m" },
>     { "type": "spring", "from": [0.5, 0.7], "to": "A.left", "coils": 9, "k": "k", "rest": 2.6 },
>     { "type": "energy", "of": "A", "bars": ["K", "Uel"], "total": true }
>   ],
>   "readouts": ["t", { "label": "x", "value": "x", "unit": "m" }, { "label": "v", "value": "v", "unit": "m/s" }],
>   "graphs": [
>     { "y": "x", "label": "Posizione", "axisLabels": ["t (s)", "x (m)"], "position": "right" },
>     { "y": ["0.5*m*v^2", "0.5*k*x^2", "0.5*m*v^2 + 0.5*k*x^2"], "legend": ["K", "U", "E"],
>       "label": "Energie", "axisLabels": ["t (s)", "E (J)"], "position": "tabs" },
>     { "x": "x", "y": "v", "label": "Piano delle fasi", "axisLabels": ["x (m)", "v (m/s)"], "aspectRatio": 1.6, "position": "tabs" }
>   ]
> }
> ```

## 27. Lancio verso l'alto con attrito dell'aria

Con l'attrito dell'aria l'energia meccanica diminuisce: la barra $Q$ è l'energia persa. Il livello zero di $U_g$ (linea tratteggiata) si trascina con il mouse: cambia $U_g$ ma non le differenze.

```physics
{
  "xlim": [0, 6], "ylim": [0, 4.5], "aspectRatio": "4:3",
  "params": {
    "v0": { "min": 4, "max": 10, "step": 0.5, "val": 8, "unit": "m/s" },
    "c": { "min": 0, "max": 0.1, "step": 0.005, "val": 0.03, "unit": "kg/m", "label": "attrito dell'aria" },
    "h0": { "min": 0, "max": 4, "step": 0.1, "val": 0, "unit": "m", "label": "livello zero" }
  },
  "state": { "y": 0.2, "v": "v0" },
  "ode": { "y": "v", "v": "-g - c/0.5*v*abs(v)" },
  "time": { "max": 4, "stopWhen": "y < 0.2" },
  "objects": [
    { "type": "ground", "y": 0 },
    { "id": "A", "type": "ball", "at": [2, "y"], "radius": 0.2, "mass": 0.5 },
    { "type": "velocity", "on": "A", "label": "\\vec v" },
    { "type": "trace", "of": "A", "dash": "2 4" },
    { "type": "energy", "of": "A", "bars": ["K", "Ug", "Q"], "total": true, "drag": "h0" }
  ],
  "readouts": ["t", { "label": "v", "value": "A.speed", "digits": 1 }, { "label": "h", "value": "A.y", "unit": "m", "digits": 2 }]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 6], "ylim": [0, 4.5], "aspectRatio": "4:3",
>   "params": {
>     "v0": { "min": 4, "max": 10, "step": 0.5, "val": 8, "unit": "m/s" },
>     "c": { "min": 0, "max": 0.1, "step": 0.005, "val": 0.03, "unit": "kg/m", "label": "attrito dell'aria" },
>     "h0": { "min": 0, "max": 4, "step": 0.1, "val": 0, "unit": "m", "label": "livello zero" }
>   },
>   "state": { "y": 0.2, "v": "v0" },
>   "ode": { "y": "v", "v": "-g - c/0.5*v*abs(v)" },
>   "time": { "max": 4, "stopWhen": "y < 0.2" },
>   "objects": [
>     { "type": "ground", "y": 0 },
>     { "id": "A", "type": "ball", "at": [2, "y"], "radius": 0.2, "mass": 0.5 },
>     { "type": "velocity", "on": "A", "label": "\\vec v" },
>     { "type": "trace", "of": "A", "dash": "2 4" },
>     { "type": "energy", "of": "A", "bars": ["K", "Ug", "Q"], "total": true, "drag": "h0" }
>   ],
>   "readouts": ["t", { "label": "v", "value": "A.speed", "digits": 1 }, { "label": "h", "value": "A.y", "unit": "m", "digits": 2 }]
> }
> ```

## 28. Moto lungo una curva (`follow`)

Il blocco segue la circonferenza con $s = v_0 t + \tfrac12 a t^2$ e ruota con la curva. L'accelerazione, scomposta nel riferimento del blocco, ha una parte tangenziale costante e una centripeta $v^2/R$ che cresce: il grafico si disegna man mano.

```physics
{
  "xlim": [-3.2, 3.2], "ylim": [-2.7, 2.7], "aspectRatio": "4:3",
  "params": {
    "v0": { "min": 0, "max": 3, "step": 0.1, "val": 0.5, "unit": "m/s" },
    "a": { "min": 0, "max": 1, "step": 0.05, "val": 0.4, "unit": "m/s²", "label": "a tangenziale" }
  },
  "time": { "max": 4, "loop": true },
  "objects": [
    { "id": "r", "type": "path", "arc": { "center": [0, 0], "radius": 2.2 }, "dash": "3 5" },
    { "type": "particle", "at": [0, 0], "radius": 3 },
    { "id": "C", "type": "block", "size": [0.6, 0.35], "follow": "r", "s": "v0*t + a*t^2/2", "orient": "tangent" },
    { "type": "velocity", "on": "C", "label": "\\vec v" },
    { "id": "ac", "type": "acceleration", "on": "C", "label": "\\vec a" },
    { "type": "decompose", "vector": "ac", "frame": "C", "labels": ["$a_t$", "$a_c$"] }
  ],
  "readouts": [{ "label": "v", "value": "C.speed", "digits": 2 }, { "label": "a", "value": "C.acc", "digits": 2 }],
  "graphs": [
    { "y": ["C.speed^2/2.2", "a"], "legend": ["a_c = v²/R", "a_t"], "label": "Accelerazione", "axisLabels": ["t (s)", "a (m/s²)"], "progressive": true, "position": "right" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [-3.2, 3.2], "ylim": [-2.7, 2.7], "aspectRatio": "4:3",
>   "params": {
>     "v0": { "min": 0, "max": 3, "step": 0.1, "val": 0.5, "unit": "m/s" },
>     "a": { "min": 0, "max": 1, "step": 0.05, "val": 0.4, "unit": "m/s²", "label": "a tangenziale" }
>   },
>   "time": { "max": 4, "loop": true },
>   "objects": [
>     { "id": "r", "type": "path", "arc": { "center": [0, 0], "radius": 2.2 }, "dash": "3 5" },
>     { "type": "particle", "at": [0, 0], "radius": 3 },
>     { "id": "C", "type": "block", "size": [0.6, 0.35], "follow": "r", "s": "v0*t + a*t^2/2", "orient": "tangent" },
>     { "type": "velocity", "on": "C", "label": "\\vec v" },
>     { "id": "ac", "type": "acceleration", "on": "C", "label": "\\vec a" },
>     { "type": "decompose", "vector": "ac", "frame": "C", "labels": ["$a_t$", "$a_c$"] }
>   ],
>   "readouts": [{ "label": "v", "value": "C.speed", "digits": 2 }, { "label": "a", "value": "C.acc", "digits": 2 }],
>   "graphs": [
>     { "y": ["C.speed^2/2.2", "a"], "legend": ["a_c = v²/R", "a_t"], "label": "Accelerazione", "axisLabels": ["t (s)", "a (m/s²)"], "progressive": true, "position": "right" }
>   ]
> }
> ```

## 29. Valori delle forze nelle espressioni

Le forze automatiche si leggono nelle espressioni: `A.N.mag` è il modulo della normale su `A`, `A.f.mag` quello dell'attrito. I valori partono nascosti e compaiono con il pulsante.

```physics
{
  "xlim": [0, 9], "ylim": [0, 5], "forceScale": 0.09,
  "params": { "alpha": { "min": 5, "max": 40, "val": 20, "unit": "deg", "label": "α" } },
  "controls": [{ "type": "reveal", "label": "Mostra i valori", "targets": ["type:readout"] }],
  "objects": [
    { "type": "ground", "y": 0.3 },
    { "id": "s", "type": "slope", "at": [0.4, 0.3], "angle": "alpha", "length": 7.2 },
    { "id": "A", "type": "block", "on": "s", "pos": 0.5, "size": [1.4, 0.8], "mass": 2, "mu": 0.6, "forces": "auto" },
    { "type": "angle", "of": "s", "label": "\\alpha" }
  ],
  "readouts": [
    { "label": "P", "value": "A.P.mag", "unit": "N", "digits": 1, "hidden": true },
    { "label": "N", "value": "A.N.mag", "unit": "N", "digits": 1, "hidden": true },
    { "label": "f", "value": "A.f.mag", "unit": "N", "digits": 1, "hidden": true }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 9], "ylim": [0, 5], "forceScale": 0.09,
>   "params": { "alpha": { "min": 5, "max": 40, "val": 20, "unit": "deg", "label": "α" } },
>   "controls": [{ "type": "reveal", "label": "Mostra i valori", "targets": ["type:readout"] }],
>   "objects": [
>     { "type": "ground", "y": 0.3 },
>     { "id": "s", "type": "slope", "at": [0.4, 0.3], "angle": "alpha", "length": 7.2 },
>     { "id": "A", "type": "block", "on": "s", "pos": 0.5, "size": [1.4, 0.8], "mass": 2, "mu": 0.6, "forces": "auto" },
>     { "type": "angle", "of": "s", "label": "\\alpha" }
>   ],
>   "readouts": [
>     { "label": "P", "value": "A.P.mag", "unit": "N", "digits": 1, "hidden": true },
>     { "label": "N", "value": "A.N.mag", "unit": "N", "digits": 1, "hidden": true },
>     { "label": "f", "value": "A.f.mag", "unit": "N", "digits": 1, "hidden": true }
>   ]
> }
> ```

## 30. Auto in curva vista dall'alto

Con `"plane": "horizontal"` la scena è vista dall'alto: peso e normale sono perpendicolari al foglio (⊗ entra, ⊙ esce) e l'attrito è la forza centripeta che serve per curvare, $m v^2/R$. Aumentando la velocità o diminuendo $\mu$ la forza necessaria supera $\mu m g$.

```physics
{
  "plane": "horizontal",
  "xlim": [-18, 18], "ylim": [-18, 18], "aspectRatio": "1:1",
  "params": {
    "v": { "min": 5, "max": 20, "step": 0.5, "val": 10, "unit": "m/s" },
    "mu": { "min": 0.2, "max": 1, "step": 0.05, "val": 0.8, "label": "μ" }
  },
  "time": { "max": 12, "loop": true },
  "objects": [
    { "id": "r", "type": "road", "width": 7, "lanes": 2, "mu": "mu", "path": { "arc": { "center": [0, 0], "radius": 12 } } },
    { "type": "particle", "at": [0, 0], "radius": 3 },
    { "id": "C", "type": "car", "follow": "r", "s": "v*t", "orient": "tangent", "offset": -1.75, "mass": 1200, "forces": "auto" },
    { "type": "velocity", "on": "C", "label": "\\vec v" },
    { "type": "label", "at": [0, -3], "text": "La macchina sbanda: serve più attrito di μmg", "show": "C.f.mag > mu*1200*g", "color": "red" }
  ],
  "readouts": [
    { "label": "f (necessaria)", "value": "C.f.mag", "unit": "N", "digits": 0 },
    { "label": "μmg (massima)", "value": "mu*1200*g", "unit": "N", "digits": 0 }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "plane": "horizontal",
>   "xlim": [-18, 18], "ylim": [-18, 18], "aspectRatio": "1:1",
>   "params": {
>     "v": { "min": 5, "max": 20, "step": 0.5, "val": 10, "unit": "m/s" },
>     "mu": { "min": 0.2, "max": 1, "step": 0.05, "val": 0.8, "label": "μ" }
>   },
>   "time": { "max": 12, "loop": true },
>   "objects": [
>     { "id": "r", "type": "road", "width": 7, "lanes": 2, "mu": "mu", "path": { "arc": { "center": [0, 0], "radius": 12 } } },
>     { "type": "particle", "at": [0, 0], "radius": 3 },
>     { "id": "C", "type": "car", "follow": "r", "s": "v*t", "orient": "tangent", "offset": -1.75, "mass": 1200, "forces": "auto" },
>     { "type": "velocity", "on": "C", "label": "\\vec v" },
>     { "type": "label", "at": [0, -3], "text": "La macchina sbanda: serve più attrito di μmg", "show": "C.f.mag > mu*1200*g", "color": "red" }
>   ],
>   "readouts": [
>     { "label": "f (necessaria)", "value": "C.f.mag", "unit": "N", "digits": 0 },
>     { "label": "μmg (massima)", "value": "mu*1200*g", "unit": "N", "digits": 0 }
>   ]
> }
> ```

## 31. Blocco tirato su un tavolo, visto dall'alto

L'attrito statico bilancia la forza $\vec F$ nel piano del tavolo. Con `"outOfPlane": "note"` peso e normale non sono disegnati ma elencati sotto la scena.

```physics
{
  "plane": "horizontal", "outOfPlane": "note",
  "xlim": [0, 8], "ylim": [0, 4.5], "forceScale": 0.12,
  "params": { "F": { "min": 0, "max": 15, "val": 8, "unit": "N" } },
  "objects": [
    { "type": "path", "points": [[0.5, 0.5], [7.5, 0.5], [7.5, 4], [0.5, 4], [0.5, 0.5]], "dash": "2 4" },
    { "id": "A", "type": "block", "at": [4, 2.2], "size": [1.4, 1], "mass": 2, "mu": 0.5, "forces": "auto",
      "add": [{ "id": "F", "dir": 30, "mag": "F", "label": "\\vec F" }] }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "plane": "horizontal", "outOfPlane": "note",
>   "xlim": [0, 8], "ylim": [0, 4.5], "forceScale": 0.12,
>   "params": { "F": { "min": 0, "max": 15, "val": 8, "unit": "N" } },
>   "objects": [
>     { "type": "path", "points": [[0.5, 0.5], [7.5, 0.5], [7.5, 4], [0.5, 4], [0.5, 0.5]], "dash": "2 4" },
>     { "id": "A", "type": "block", "at": [4, 2.2], "size": [1.4, 1], "mass": 2, "mu": 0.5, "forces": "auto",
>       "add": [{ "id": "F", "dir": 30, "mag": "F", "label": "\\vec F" }] }
>   ]
> }
> ```

## 32. Confronto: con e senza attrito dell'aria

`"compare"` ridisegna la scena, sbiadita, con altri valori dei parametri e lo stesso orologio: qui la traiettoria senza attrito dell'aria.

```physics
{
  "xlim": [0, 22], "ylim": [0, 9],
  "params": {
    "v0": { "min": 10, "max": 20, "step": 0.5, "val": 16, "unit": "m/s" },
    "a": { "min": 20, "max": 70, "val": 50, "unit": "deg", "label": "α" },
    "c": { "min": 0, "max": 0.03, "step": 0.001, "val": 0.012, "unit": "kg/m", "label": "attrito dell'aria" }
  },
  "state": { "x": 0.5, "y": 0.2, "vx": "v0*cos(a)", "vy": "v0*sin(a)" },
  "ode": { "x": "vx", "y": "vy", "vx": "-c/0.4*vx*sqrt(vx^2 + vy^2)", "vy": "-g - c/0.4*vy*sqrt(vx^2 + vy^2)" },
  "time": { "max": 4, "stopWhen": "y < 0.2" },
  "compare": [{ "c": 0, "label": "senza attrito dell'aria" }],
  "objects": [
    { "type": "ground", "y": 0 },
    { "id": "B", "type": "ball", "at": ["x", "y"], "radius": 0.2 },
    { "type": "trace", "of": "B" },
    { "type": "velocity", "on": "B", "label": "\\vec v" }
  ]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 22], "ylim": [0, 9],
>   "params": {
>     "v0": { "min": 10, "max": 20, "step": 0.5, "val": 16, "unit": "m/s" },
>     "a": { "min": 20, "max": 70, "val": 50, "unit": "deg", "label": "α" },
>     "c": { "min": 0, "max": 0.03, "step": 0.001, "val": 0.012, "unit": "kg/m", "label": "attrito dell'aria" }
>   },
>   "state": { "x": 0.5, "y": 0.2, "vx": "v0*cos(a)", "vy": "v0*sin(a)" },
>   "ode": { "x": "vx", "y": "vy", "vx": "-c/0.4*vx*sqrt(vx^2 + vy^2)", "vy": "-g - c/0.4*vy*sqrt(vx^2 + vy^2)" },
>   "time": { "max": 4, "stopWhen": "y < 0.2" },
>   "compare": [{ "c": 0, "label": "senza attrito dell'aria" }],
>   "objects": [
>     { "type": "ground", "y": 0 },
>     { "id": "B", "type": "ball", "at": ["x", "y"], "radius": 0.2 },
>     { "type": "trace", "of": "B" },
>     { "type": "velocity", "on": "B", "label": "\\vec v" }
>   ]
> }
> ```

## 33. Spazio di frenata: asciutto e bagnato

Due frenate con la stessa velocità iniziale: la macchina sbiadita frena su strada bagnata. Lo spazio di frenata è $v_0^2/(2\mu g)$.

```physics
{
  "xlim": [0, 46], "ylim": [0, 8],
  "params": {
    "v0": { "min": 10, "max": 18, "step": 1, "val": 15, "unit": "m/s" },
    "mu": { "min": 0.5, "max": 1, "step": 0.05, "val": 0.8, "label": "μ (asciutto)" }
  },
  "state": { "x": 0, "v": "v0" },
  "ode": { "x": "v", "v": "-mu*g" },
  "time": { "max": 8, "stopWhen": "v < 0" },
  "compare": [{ "mu": 0.4, "label": "strada bagnata, μ = 0.4" }],
  "objects": [
    { "id": "g", "type": "ground", "from": [0, 1], "to": [46, 1] },
    { "id": "C", "type": "car", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [4.2, 1.3] },
    { "type": "velocity", "on": "C", "label": "\\vec v" }
  ],
  "readouts": [{ "label": "spazio di frenata", "value": "x", "unit": "m", "digits": 1 }, { "label": "v", "value": "v", "unit": "m/s", "digits": 1 }]
}
```

> [!DETAILS] Codice JSON
> ```json
> {
>   "xlim": [0, 46], "ylim": [0, 8],
>   "params": {
>     "v0": { "min": 10, "max": 18, "step": 1, "val": 15, "unit": "m/s" },
>     "mu": { "min": 0.5, "max": 1, "step": 0.05, "val": 0.8, "label": "μ (asciutto)" }
>   },
>   "state": { "x": 0, "v": "v0" },
>   "ode": { "x": "v", "v": "-mu*g" },
>   "time": { "max": 8, "stopWhen": "v < 0" },
>   "compare": [{ "mu": 0.4, "label": "strada bagnata, μ = 0.4" }],
>   "objects": [
>     { "id": "g", "type": "ground", "from": [0, 1], "to": [46, 1] },
>     { "id": "C", "type": "car", "on": "g", "pos": "3 + x", "posUnit": "m", "size": [4.2, 1.3] },
>     { "type": "velocity", "on": "C", "label": "\\vec v" }
>   ],
>   "readouts": [{ "label": "spazio di frenata", "value": "x", "unit": "m", "digits": 1 }, { "label": "v", "value": "v", "unit": "m/s", "digits": 1 }]
> }
> ```

## 34. Avvisi

Chiavi scritte male (con suggerimento), opzioni e tipi non ancora implementati, riferimenti e ancoraggi inesistenti e angoli sospetti finiscono nel riquadro sotto il diagramma.

```physics
{
  "xlin": [0, 10],
  "seed": 42,
  "params": { "theta": { "min": 0, "max": 90, "val": 30 } },
  "objects": [
    { "type": "partcle", "at": [1, 1] },
    { "type": "moment", "of": "s" },
    { "id": "A", "type": "block", "at": [3, 1] },
    { "type": "label", "at": "A.tpo", "text": "?" },
    { "type": "particle", "at": [5, 2], "raduis": 4 },
    { "type": "label", "at": "Z", "text": "?" }
  ]
}
```

## 35. Errore nel JSON

Un JSON non valido mostra un errore al posto del diagramma.

```physics
{
  "xlim": [0, 10],
  "objects": [ { "type": "particle", "at": [1, 1] }, ]
}
```
