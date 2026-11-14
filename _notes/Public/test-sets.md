---
title: Matephis Sets System
feed: hide
tags:
  - test
code: true
---

Questa pagina serve come test e documentazione per il sistema di diagrammi di insiemi e funzioni generati via codice (JSON). Tutti i diagrammi sono renderizzati da `matephis-sets.js` a partire da un blocco ```` ```sets ````. Per provare una configurazione mentre la scrivi usa il [playground](/playground/) (motore «sets»).

**Stato: fasi 1 e 2, iterazione e blocchi collegati.** Insiemi finiti con i loro elementi, intervalli, rettangoli e dischi; funzioni date da coppie, da un'espressione, a tratti, come composizione, come inversa o come potenza $f^n$; immagine, controimmagine, collisioni e proprietà calcolate dal motore; punto trascinabile sui domini continui; dynagraph (rette parallele) e, accanto al diagramma, il grafico delle funzioni collegato al punto; orbite passo per passo (con la ragnatela sul grafico); blocchi collegati da `sync`. Diagrammi di Venn ed Eulero, relazioni e partizioni e diagrammi commutativi arrivano nelle fasi successive: le opzioni già previste ma non ancora implementate producono un avviso invece di essere ignorate in silenzio.

## Documentazione opzioni JSON

### Opzioni globali

| Opzione | Tipo | Default | Descrizione |
| :--- | :--- | :--- | :--- |
| `sets` | Array | `[]` | Gli insiemi, da sinistra a destra (o dall'alto in basso con `layout: "column"`). |
| `maps` | Array | `[]` | Le funzioni tra gli insiemi. |
| `show` | Array | | Selettori sempre visibili: `"image(f)"`, `"collisions(f)"`, `"properties(f)"`, … (vedi «Selettori»). |
| `highlights` | Array | | Evidenziazioni con colore ed etichetta propri (vedi sotto). |
| `controls` | Array | | Pulsanti, come nelle scene di fisica: `reveal` mostra selettori o evidenziazioni nascosti, `toggle` cambia un parametro. |
| `probe` | Object/Array | | Punto su un dominio continuo, con la freccia verso la sua immagine (vedi «Domini continui»). |
| `params`, `animate` | | | Slider, come nei grafici. Usabili negli estremi degli intervalli e nelle espressioni. |
| `layout` | `"row"`/`"column"` | `"row"` | Insiemi affiancati (elementi in colonna) o uno sotto l'altro (elementi in riga). |
| `dynagraph` | Boolean/Object | | Dynagraph: gli intervalli diventano rette parallele una sotto l'altra, con la stessa scala, tacche e numeri (vedi «Dynagraph e grafici»). |
| `plot` | Object | | Il grafico delle funzioni accanto (o sotto) al diagramma, collegato al punto (vedi «Dynagraph e grafici»). |
| `iterate` | Object/Array | | Orbita di un punto, un passo alla volta: $x_0, f(x_0), f(f(x_0)), \dots$ (vedi «Iterazione e blocchi collegati»). |
| `sync` | String | | Nome di un gruppo: i blocchi con lo stesso nome nella pagina condividono parametri, evidenziazione al passaggio e passi delle orbite (vedi «Iterazione e blocchi collegati»). |
| `hover` | Boolean | `true` | Passando sopra un elemento (o con Tab) si evidenziano le sue frecce, immagini e controimmagini. |
| `reorder` | Boolean | `true` | Riordina gli elementi del codominio per ridurre gli incroci e tenere l'immagine in un unico blocco. Un insieme con `"order": "given"` mantiene il suo ordine. |
| `mapLabels` | Boolean | `true` | Freccia $A \xrightarrow{f} B$ tra i nomi degli insiemi. |
| `spacing` | Number | | Distanza in px tra due elementi consecutivi. |
| `height` | Number | | Altezza fissa in px (solo `row`). |
| `width`, `fullWidth`, `cssWidth`, `align`, `border`, `caption`, `fontSize`, `labelHalo`, `title`, `ariaLabel` | | | Come nei grafici. |

Le etichette sono formule: `"a_1"` diventa $a_1$, `"\\mathbb{N}"` diventa $\mathbb{N}$. Per mescolare testo e formule si usa `$…$`.

### Insiemi

| Tipo | Opzioni | Disegno |
| :--- | :--- | :--- |
| finito | `elements`: stringhe (`"a_1"`) oppure oggetti `{ id, label, color, value }` | Ovale con un punto per elemento. |
| intervallo | `interval`: `"[0,1]"`, `"(0,1]"`, `"[0,+inf)"`, `"R"`; gli estremi possono essere espressioni (`"[0, a]"`); `window` per la parte disegnata di un intervallo illimitato | Segmento, con pallino pieno (estremo incluso) o vuoto (escluso). |
| rettangolo | `rect`: `["[0,1]", "[0,1]"]` (lati aperti tratteggiati) | Riquadro con la stessa scala sui due assi. |
| disco | `disk`: `{ "center": [0,0], "radius": 1, "open": false }` | Cerchio (tratteggiato se aperto). |

Opzioni comuni: `id`, `label` (default: l'id, o l'intervallo), `color`, `labelSide` (`"before"`/`"after"`: lato delle etichette degli elementi), `endpoints: false` (niente numeri agli estremi), `order: "given"`.

Un elemento con un valore numerico (`"2"`, oppure `{ "id": "a", "value": 2 }`) può essere usato da una funzione data con `expr`.

### Funzioni

| Opzione | Descrizione |
| :--- | :--- |
| `id`, `label` | Nome; l'etichetta di default è l'id. |
| `from`, `to` | Dominio e codominio (id di insiemi). |
| `pairs` | Coppie `{ "a_1": "b_1" }`; un array (`{ "a_1": ["b_1", "b_2"] }`) dà una relazione che non è una funzione, e il motore lo segnala. |
| `expr` | Espressione in `x` (e `y` nel piano); due espressioni `["…", "…"]` per un codominio nel piano. Su insiemi finiti usa i valori numerici degli elementi. Ammette confronti e l'operatore ternario (`x < 0 ? -x : x^2`). |
| `piecewise` | Funzione a tratti: `[{ "on": "(-inf, 0)", "expr": "-x" }, { "on": 0, "expr": "0" }, { "on": "(0, +inf)", "expr": "1" }]`. Ogni tratto vale su un intervallo (`on`, oppure un numero per un solo punto) o dove vale una condizione (`if`: `"x^2 + y^2 < 1"`, anche nel piano); un tratto senza `on` e `if` vale ovunque altrove. Si usa il primo tratto che vale; dove non ne vale nessuno la funzione non è definita (e il motore lo segnala). Immagine, controimmagine e iniettività tengono conto dei salti tra un tratto e l'altro. |
| `compose` | `["f", "g"]` è $g \circ f$: prima `f`, poi `g`. Il motore controlla che il codominio di `f` sia il dominio di `g`. |
| `iterate` | `["f", 3]` è $f^3 = f \circ f \circ f$; il numero può essere un parametro (`["f", "n"]`, intero da 0 a 50) e allora cambia con lo slider. `f` deve andare da un insieme in sé; $f^0$ è l'identità. Etichetta di default $f^{3}$ (con il valore attuale di $n$). Le sue frecce si vedono come quelle di una funzione qualsiasi. |
| `inverse` | `"f"`: l'inversa di `f`, dal codominio al dominio di `f` (non servono `from` e `to`; etichetta di default $f^{-1}$). Ogni valore va nei punti dove `f` lo assume: se `f` non è biiettiva l'inversa è una relazione e il riquadro delle proprietà lo spiega. Le sue frecce si curvano per non coprire quelle di `f`. Per funzioni tra insiemi finiti e intervalli. |
| `samples` | Frecce da un dominio continuo: quanti punti (default 5 su un intervallo, 9 nel piano) oppure la lista dei punti. |
| `image` | Immagine data a mano (`"[1/4, 3/4]"`) invece di quella calcolata. |
| `claims` | `{ "injective": true }`: proprietà dichiarate, quando la verifica numerica non basta. |
| `route` | `"below"` (curva sotto il diagramma), `"direct"`; di default vanno sotto le composizioni e le funzioni tra insiemi non vicini. |
| `arrows` | Per una composizione: `true` disegna anche le frecce elemento per elemento (tratteggiate). |
| `color`, `dash`, `bend`, `hidden` | Aspetto delle frecce; `hidden: true` le nasconde finché un pulsante non le mostra (`"arrows(f)"`). |

### Selettori

Si usano in `show`, in `highlights` (`of`) e come bersagli dei pulsanti `reveal`.

| Selettore | Significato |
| :--- | :--- |
| `image(f)` | Immagine $f(A)$, cerchiata (finita) o evidenziata sul codominio (continua). |
| `image(f, {a_1, a_2})`, `image(h, [0, 1/2])` | Immagine di un sottoinsieme o di un sotto-intervallo. |
| `image(g, image(f))`, `preimage(f, preimage(g, {c}))` | Un'immagine o una controimmagine come argomento di un'altra: $g(f(A))$, $f^{-1}(g^{-1}(\{c\}))$. |
| `preimage(f, b_1)`, `preimage(f, {b_1, b_2})` | Controimmagine di un elemento o di un sottoinsieme. |
| `preimage(h, 1/2)`, `preimage(h, [0, 1/4])` | Punti dove $h = 1/2$; parti del dominio dove $h \in [0, 1/4]$. Anche da un intervallo in un insieme finito (`preimage(sgn, 1)`). |
| `preimage(F, 1)`, `preimage(F, [0, 1/4])` | Da un rettangolo o un disco in un intervallo: la curva di livello $F = 1$; la regione dove $F \in [0, 1/4]$. |
| `collisions(f)` | Elementi con la stessa immagine: frecce e immagine comune in rosso. |
| `properties(f)` | Riquadro sotto il diagramma: $f\colon A \to B$ (in TeX, come le etichette) e iniettiva, suriettiva, biiettiva; e, solo quando non va, «funzione ✗» (un elemento senza immagine o con più immagini, un punto dove non è definita) e «a valori in B ✗». Una relazione che non è una funzione mostra solo «funzione ✗» e «biiettiva ✗»: iniettiva e suriettiva si dicono delle funzioni. Le ragioni sono nel tooltip. |
| `arrows(f)` | Le frecce di `f` (per mostrarle con un pulsante). |

I bersagli dei pulsanti accettano `*`: `"*(f)"` è tutto ciò che riguarda `f`.

### Evidenziazioni

`{ "of": "preimage(f, b_1)", "label": "f^{-1}(b_1)", "color": "blue", "hidden": true, "id": "pre" }`, oppure `{ "set": "A", "elements": ["a_1", "a_2"], "label": "S" }` o `{ "set": "I", "interval": "[0, 1/2]" }`. Colori: `green`, `blue`, `orange`, `red`, `yellow`, `purple`, `gray`, le voci delle palette (`summer3`) o un colore CSS.

### Domini continui

L'immagine di un intervallo è calcolata campionando la funzione, che si suppone continua su ogni tratto: un estremo dell'immagine è incluso se viene raggiunto, escluso se viene solo avvicinato (verso un estremo aperto del dominio o di un tratto). L'immagine di una funzione a tratti può essere un'unione di intervalli. Le proprietà sono quindi **verifiche numeriche**, segnalate come tali nel riquadro; con `claims` si dichiarano:

- da un intervallo in un intervallo: iniettiva se ogni tratto è strettamente monotono e le immagini dei tratti sono disgiunte; non definita dove l'espressione non dà un numero (`sqrt(x)` per $x < 0$) o tra due tratti;
- da un intervallo in un insieme finito: mai iniettiva; suriettiva se ogni elemento è un valore;
- da un intervallo nel piano (una curva): iniettiva se la curva non si incontra mai (attenzione agli estremi: $t \mapsto (\cos t, \sin t)$ è iniettiva su $[0, 2\pi)$ ma non su $[0, 2\pi]$); mai suriettiva;
- dal piano in un intervallo: mai iniettiva;
- dal piano nel piano: iniettiva se lo jacobiano non cambia segno e il bordo va in una curva che non si incontra; suriettiva se l'immagine (per una funzione iniettiva, l'interno del bordo trasformato) arriva vicino a ogni punto del codominio.

Nel piano l'immagine è il bordo trasformato: è corretta per le funzioni continue e iniettive.

`probe`: `{ "map": "h", "at": "p" }` mette un punto in $x = p$ con la freccia verso $h(p)$ e il valore. Se `at` è un parametro il punto si trascina e muove lo slider; nel piano `at` è una coppia (`["p", "q"]`). Su una composizione il punto segue i passaggi, $x \to f(x) \to g(f(x))$, attraverso gli insiemi intermedi. Opzioni: `label`, `color`, `showValue`, `drag`, `trace` (lascia le frecce dei punti già visitati, sbiadite: mostra dove la funzione allunga, ripiega o non arriva).

Il valore va nel disegno, sopra la freccia, oppure in una riga sotto il diagramma (nel piano, verso un insieme finito, per le inverse e le composizioni). La scelta dipende dal tipo di funzione, non dal valore, e la riga resta alta quanto la formula più alta già mostrata: muovendo il punto, quello che sta sotto non salta.

### Dynagraph e grafici

`"dynagraph": true`, oppure un oggetto con:

| Opzione | Default | Descrizione |
| :--- | :--- | :--- |
| `scale` | `"shared"` | `"shared"`: tutte le rette hanno la stessa finestra, così lo stesso numero sta nello stesso punto su ogni retta; `"own"`: ognuna la sua. |
| `ticks` | `true` | Tacche e numeri: `true` (passo automatico), un numero (il passo), `false` (solo gli estremi). |
| `arrows` | `9` | Quante frecce di esempio per funzione (sottili; quella del punto è la più evidente). Una funzione con `samples` usa il suo. |

`"plot"` disegna, con il motore dei grafici, i grafici delle funzioni accanto al diagramma. Le formule sono quelle delle funzioni (scritte una volta sola) e i parametri sono gli stessi: muovendo il punto sul diagramma si muovono i punti sui grafici, e trascinando un punto su un grafico si muove il punto sul diagramma. Le funzioni nel grafico senza un colore ne ricevono uno, che vale anche per le loro frecce.

| Opzione | Default | Descrizione |
| :--- | :--- | :--- |
| `maps` | tutte quelle disegnabili | Le funzioni da disegnare: da numeri a numeri, date da un'espressione, a tratti, da coppie di numeri, composizioni e inverse (come grafico riflesso). |
| `position` | `"right"` | `"right"` (accanto; sotto sugli schermi stretti) o `"below"`. |
| `probe` | `true` | I punti $(x, f(x))$ del punto del diagramma, con la linea tratteggiata fino all'asse $x$. Per $g \circ f$ anche $(f(x), g(f(x)))$ sul grafico di $g$ e $(x, g(f(x)))$ su quello di $g \circ f$. |
| `construction` | `false` | Per una composizione: da $x$ su fino al grafico di $f$, di lato fino alla retta $y = x$, su fino al grafico di $g$ e di nuovo a $x$. Lo stesso percorso delle frecce del dynagraph, sul piano. |
| `identity` | con `construction` | Disegna la retta $y = x$. |

Ogni altra opzione va al grafico (`xlim`, `ylim`, `aspectRatio`, `grid`, …): vedi [Matephis Plotting System](/notes/test-plot).

### Iterazione e blocchi collegati

Una funzione da un insieme in sé ($f\colon A \to A$) si disegna su un solo insieme: le frecce sono archi prima dell'insieme (sopra in colonna, a sinistra in riga) e un punto fisso ha un piccolo cappio. Il nome della funzione sta accanto agli archi. Su un dynagraph con una sola retta gli archi vanno da un punto all'altro della stessa retta.

`"iterate"` mostra un'orbita un passo alla volta, con i pulsanti «Indietro», «Passo successivo» e «Da capo» (senza animazioni). Ogni passo aggiunge una freccia numerata $x_k \to x_{k+1}$; i punti già visitati restano. Più orbite: un array; avanzano insieme.

| Opzione | Default | Descrizione |
| :--- | :--- | :--- |
| `map` | | La funzione, da un insieme in sé (finito o intervallo). |
| `start` | | Il punto di partenza: un elemento, un numero, o un parametro (allora l'orbita segue lo slider). |
| `steps` | `10` | Il numero massimo di passi (al più 100). |
| `step` | `0` | I passi già fatti all'inizio. |
| `label` | `"x"` | Nome dei termini nella riga sotto il diagramma: $x_0, x_1, \dots$ |
| `color` | arancione | Colore dell'orbita. |
| `showValue` | `true` | `false`: niente riga sotto il diagramma. |

La riga sotto il diagramma dice dove si è arrivati: su un insieme finito tutta l'orbita ($5 \mapsto 1 \mapsto 2$), su un intervallo l'ultimo passo ($x_3 = f(x_2) = 0{,}62$). Quando un valore torna l'orbita si ferma e la riga dice «ciclo di periodo $k$» (o «punto fisso»); si ferma anche quando la funzione non è definita o esce dall'insieme. Con `"plot"` l'orbita è anche la ragnatela sul grafico: da $(x_0, 0)$ su fino al grafico, di lato fino alla retta $y = x$, di nuovo al grafico, un passo per volta (la retta $y = x$ si disegna da sola; `"identity": false` la toglie).

`"sync": "es1"` collega i blocchi con lo stesso nome nella pagina:

- un parametro con lo stesso nome ha lo stesso valore in tutti: lo slider (o il punto trascinato) di uno muove gli altri. Per un solo gruppo di slider si mette `"showSliders": false` negli altri blocchi;
- passando su un elemento si evidenzia l'elemento con lo stesso insieme e lo stesso id negli altri blocchi;
- le orbite della stessa funzione (stesso id) avanzano insieme.

Collega i blocchi ```` ```sets ```` tra loro; il grafico di un blocco si collega con `"plot"`.

## Esempi

### Funzione non iniettiva

Le collisioni sono calcolate dal motore: non serve dire quali frecce colorare. L'immagine si mostra con il pulsante.

```sets
{
  "sets": [
    { "id": "A", "elements": ["a_1", "a_2", "a_3"] },
    { "id": "B", "elements": ["b_1", "b_2", "b_3"] }
  ],
  "maps": [{ "id": "f", "from": "A", "to": "B", "pairs": { "a_1": "b_1", "a_2": "b_3", "a_3": "b_1" } }],
  "show": ["collisions(f)", "properties(f)"],
  "controls": [{ "type": "reveal", "label": "Mostra immagine", "targets": ["image(f)"] }]
}
```

### Immagine e controimmagine

```sets
{
  "sets": [
    { "id": "A", "elements": ["a", "c", "e", "o"] },
    { "id": "B", "elements": ["b", "d", "g"] }
  ],
  "maps": [{ "id": "f", "from": "A", "to": "B", "pairs": { "a": "b", "c": "b", "e": "d", "o": "d" } }],
  "show": ["image(f)"],
  "highlights": [{ "of": "preimage(f, b)", "hidden": true }],
  "controls": [{ "type": "reveal", "label": "Mostra controimmagine di b", "targets": ["preimage(f, b)"] }]
}
```

### Una relazione che non è una funzione

```sets
{
  "sets": [
    { "id": "A", "elements": ["1", "2", "3"] },
    { "id": "B", "elements": ["x", "y"] }
  ],
  "maps": [{ "id": "r", "from": "A", "to": "B", "pairs": { "1": ["x", "y"], "2": "y" } }],
  "show": ["properties(r)"]
}
```

### Espressione su elementi numerici

$q(x) = x^2$ da $\\{-1, 0, 1, 2\\}$ in $\\{0, 1, 2\\}$: $q(2) = 4$ non sta nel codominio.

```sets
{
  "sets": [
    { "id": "A", "elements": ["-1", "0", "1", "2"] },
    { "id": "B", "elements": ["0", "1", "2"] }
  ],
  "maps": [{ "id": "q", "from": "A", "to": "B", "expr": "x^2" }],
  "show": ["collisions(q)", "properties(q)"]
}
```

### Composizione

```sets
{
  "sets": [
    { "id": "A", "elements": ["1", "2", "3"] },
    { "id": "B", "elements": ["x", "y", "z"] },
    { "id": "C", "elements": ["p", "q"] }
  ],
  "maps": [
    { "id": "f", "from": "A", "to": "B", "pairs": { "1": "x", "2": "y", "3": "z" } },
    { "id": "g", "from": "B", "to": "C", "pairs": { "x": "p", "y": "q", "z": "q" } },
    { "id": "gf", "compose": ["f", "g"] }
  ],
  "show": ["properties(f)", "properties(g)", "properties(gf)"],
  "controls": [{ "type": "reveal", "label": "Mostra le frecce di g ∘ f", "targets": ["arrows(gf)"] }]
}
```

### Un'iniezione da [0, 1] in (0, 1)

$h(x) = \frac{x}{2} + \frac14$ è iniettiva ma non suriettiva: la sua immagine $\left[\frac14, \frac34\right]$ non arriva vicino a $0$ e a $1$. Trascina il punto arancione.

```sets
{
  "sets": [{ "id": "I", "interval": "[0,1]" }, { "id": "J", "interval": "(0,1)" }],
  "maps": [{ "id": "h", "from": "I", "to": "J", "expr": "x/2 + 1/4", "samples": 5 }],
  "params": { "p": { "min": 0, "max": 1, "step": 0.01, "val": 0.3, "label": "x" } },
  "probe": { "map": "h", "at": "p" },
  "show": ["image(h)", "properties(h)"]
}
```

### Immagine con un estremo escluso

$x^2$ su $(-1, 1)$ ha immagine $[0, 1)$: $0$ è raggiunto, $1$ no. La controimmagine di $\frac14$ è fatta di due punti.

```sets
{
  "layout": "column",
  "sets": [{ "id": "I", "interval": "(-1,1)" }, { "id": "J", "interval": "[0,1]" }],
  "maps": [{ "id": "s", "from": "I", "to": "J", "expr": "x^2", "samples": 7 }],
  "show": ["image(s)", "properties(s)"],
  "highlights": [{ "of": "preimage(s, 1/4)", "label": "s^{-1}(\\tfrac14)" }]
}
```

### Una contrazione del quadrato

```sets
{
  "sets": [
    { "id": "Q", "label": "[0,1]^2", "rect": ["[0,1]", "[0,1]"] },
    { "id": "R", "label": "[0,1]^2", "rect": ["[0,1]", "[0,1]"] }
  ],
  "maps": [{ "id": "c", "from": "Q", "to": "R", "expr": ["x/2 + 1/4", "y/2 + 1/4"], "samples": 4 }],
  "params": { "a": { "min": 0, "max": 1, "step": 0.01, "val": 0.8 }, "b": { "min": 0, "max": 1, "step": 0.01, "val": 0.7 } },
  "probe": { "map": "c", "at": ["a", "b"] },
  "show": ["image(c)", "properties(c)"]
}
```

### Funzione segno

Una funzione a tratti da $\mathbb{R}$ in un insieme finito. La controimmagine di $1$ è l'intervallo $(0, +\infty)$.

```sets
{
  "sets": [
    { "id": "R", "label": "\\mathbb{R}", "interval": "R", "window": [-3, 3] },
    { "id": "S", "elements": ["-1", "0", "1"] }
  ],
  "maps": [{
    "id": "sgn", "label": "\\operatorname{sgn}", "from": "R", "to": "S", "samples": 7,
    "piecewise": [
      { "on": "(-inf, 0)", "expr": "-1" },
      { "on": 0, "expr": "0" },
      { "on": "(0, +inf)", "expr": "1" }
    ]
  }],
  "show": ["properties(sgn)"],
  "highlights": [{ "of": "preimage(sgn, 1)", "hidden": true }],
  "controls": [{ "type": "reveal", "label": "Mostra la controimmagine di 1", "targets": ["preimage(sgn, 1)"] }]
}
```

### Una biiezione non continua

$f(x) = x$ su $[0, 1)$ e $f(x) = 3 - x$ su $[1, 2]$: l'immagine è $[0, 1) \cup [1, 2] = [0, 2]$ e i due tratti non si sovrappongono, quindi $f$ è biiettiva.

```sets
{
  "sets": [{ "id": "I", "interval": "[0,2]" }, { "id": "J", "interval": "[0,2]" }],
  "maps": [{ "id": "f", "from": "I", "to": "J", "samples": 9, "piecewise": [
    { "on": "[0, 1)", "expr": "x" },
    { "on": "[1, 2]", "expr": "3 - x" }
  ] }],
  "params": { "p": { "min": 0, "max": 2, "step": 0.01, "val": 1.4, "label": "x" } },
  "probe": { "map": "f", "at": "p" },
  "show": ["image(f)", "properties(f)"]
}
```

### Un minimo all'interno del dominio

$f_1(x) = x^2$ da $[-1, 2]$ in $[0, 4]$: il minimo $0$ è preso in $x = 0$, dentro il dominio, e $f_1$ è suriettiva (ma non iniettiva).

```sets
{
  "layout": "column",
  "sets": [{ "id": "D", "interval": "[-1, 2]" }, { "id": "C", "interval": "[0, 4]" }],
  "maps": [{ "id": "f", "label": "f_1", "from": "D", "to": "C", "expr": "x^2" }],
  "show": ["image(f)", "properties(f)"]
}
```

### L'inversa di una funzione non iniettiva

L'inversa di $f$ manda $1$ in due elementi e $3$ in nessuno: è una relazione, non una funzione.

```sets
{
  "sets": [
    { "id": "A", "elements": ["a", "b", "c"] },
    { "id": "B", "elements": ["1", "2", "3"] }
  ],
  "maps": [
    { "id": "f", "from": "A", "to": "B", "pairs": { "a": "1", "b": "1", "c": "2" } },
    { "id": "finv", "inverse": "f", "hidden": true, "color": "blue" }
  ],
  "show": ["properties(f)"],
  "controls": [{ "type": "reveal", "label": "Mostra l'inversa", "targets": ["arrows(finv)", "properties(finv)"] }]
}
```

### L'inversa di $x^2$

Su $[-1, 1]$ ogni valore positivo ha due controimmagini: trascina il punto su $[0, 1]$.

```sets
{
  "layout": "column",
  "sets": [{ "id": "J", "interval": "[0,1]" }, { "id": "I", "interval": "[-1,1]" }],
  "maps": [
    { "id": "s", "from": "I", "to": "J", "expr": "x^2", "hidden": true },
    { "id": "r", "label": "s^{-1}", "inverse": "s", "samples": 5 }
  ],
  "params": { "q": { "min": 0, "max": 1, "step": 0.01, "val": 0.25, "label": "y" } },
  "probe": { "map": "r", "at": "q" },
  "show": ["properties(r)"]
}
```

### Curve di livello

$F(x, y) = x^2 + y^2$ dal quadrato in $[0, 2]$: la controimmagine di $1$ è un arco di circonferenza, quella di $[0, \tfrac14]$ un quarto di disco.

```sets
{
  "sets": [
    { "id": "Q", "label": "[0,1]^2", "rect": ["[0,1]", "[0,1]"] },
    { "id": "L", "interval": "[0,2]" }
  ],
  "maps": [{ "id": "F", "from": "Q", "to": "L", "expr": "x^2 + y^2", "samples": 4 }],
  "show": ["properties(F)"],
  "highlights": [
    { "of": "preimage(F, 1)", "label": "F^{-1}(1)" },
    { "of": "preimage(F, [0, 1/4])", "color": "blue", "label": "F^{-1}([0, \\tfrac14])" }
  ]
}
```

### Una curva chiusa non è iniettiva

```sets
{
  "sets": [
    { "id": "T", "label": "[0, 2\\pi]", "interval": "[0, 2*pi]" },
    { "id": "D", "label": "D", "disk": { "center": [0, 0], "radius": 1 } }
  ],
  "maps": [{ "id": "c", "from": "T", "to": "D", "expr": ["cos(x)", "sin(x)"], "samples": 6 }],
  "show": ["image(c)", "properties(c)"]
}
```

### $z \mapsto z^2$ sul disco

Lo jacobiano non cambia segno, ma il bordo fa due giri: la funzione non è iniettiva.

```sets
{
  "sets": [
    { "id": "D", "label": "D", "disk": { "center": [0, 0], "radius": 1 } },
    { "id": "E", "label": "D", "disk": { "center": [0, 0], "radius": 1 } }
  ],
  "maps": [{ "id": "q", "from": "D", "to": "E", "expr": ["x^2 - y^2", "2*x*y"], "samples": 7 }],
  "show": ["image(q)", "properties(q)"]
}
```

### Un dynagraph

$f(x) = x^2 - 1$: trascina il punto. Le frecce sbiadite restano dove sei passato: a sinistra e a destra di $0$ arrivano negli stessi punti, perché $f$ non è iniettiva.

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "\\mathbb{R}", "interval": "R", "window": [-3, 3] },
    { "id": "Y", "label": "\\mathbb{R}", "interval": "R", "window": [-3, 3] }
  ],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "x^2 - 1" }],
  "params": { "p": { "min": -3, "max": 3, "step": 0.01, "val": 1.5, "label": "x" } },
  "probe": { "map": "f", "at": "p", "trace": true }
}
```

### Composizione su un dynagraph

Il punto passa da $X$ a $Y$ con $f$ e da $Y$ a $Z$ con $g$; il pulsante mostra $g \circ f$ in un passo solo. L'immagine di $g \circ f$ è $g(f(X))$.

```sets
{
  "dynagraph": true,
  "sets": [
    { "id": "X", "label": "X", "interval": "[-2, 2]" },
    { "id": "Y", "label": "Y", "interval": "[-2, 2]" },
    { "id": "Z", "label": "Z", "interval": "[-2, 2]" }
  ],
  "maps": [
    { "id": "f", "from": "X", "to": "Y", "expr": "x/2 + 1/2", "color": "blue" },
    { "id": "g", "from": "Y", "to": "Z", "expr": "x^2 - 1", "color": "orange" },
    { "id": "gf", "compose": ["f", "g"] }
  ],
  "params": { "p": { "min": -2, "max": 2, "step": 0.01, "val": 1, "label": "x" } },
  "probe": { "map": "gf", "at": "p" },
  "highlights": [{ "of": "image(g, image(f))", "hidden": true }],
  "show": ["properties(gf)"],
  "controls": [
    { "type": "reveal", "label": "Mostra g ∘ f", "targets": ["arrows(gf)"] },
    { "type": "reveal", "label": "Mostra g(f(X))", "targets": ["image(g, image(f))"] }
  ]
}
```

### Dynagraph e grafico

Lo stesso punto sul dynagraph e sul grafico: trascina l'uno o l'altro.

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "X", "interval": "[-2, 2]" },
    { "id": "Y", "label": "Y", "interval": "[-2, 2]" }
  ],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "piecewise": [
    { "on": "[-2, 0)", "expr": "-x - 1" },
    { "on": "[0, 2]", "expr": "x^2 / 2" }
  ] }],
  "params": { "p": { "min": -2, "max": 2, "step": 0.01, "val": 1.2, "label": "x" } },
  "probe": { "map": "f", "at": "p" },
  "plot": { "maps": ["f"] },
  "show": ["properties(f)"]
}
```

### Composizione: dynagraph e costruzione sul grafico

$f(x) = \frac{x + 1}{2}$ e $g(x) = \frac{x^2}{2}$ su $[0, 2]$. Sul grafico il punto sale fino al grafico di $f$, va di lato fino alla retta $y = x$ (così $f(x)$ diventa un'ascissa), sale fino al grafico di $g$ e torna sopra $x$: lì sta il grafico di $g \circ f$.

```sets
{
  "dynagraph": { "ticks": 0.5 },
  "sets": [
    { "id": "X", "label": "X", "interval": "[0, 2]" },
    { "id": "Y", "label": "Y", "interval": "[0, 2]" },
    { "id": "Z", "label": "Z", "interval": "[0, 2]" }
  ],
  "maps": [
    { "id": "f", "from": "X", "to": "Y", "expr": "(x + 1)/2" },
    { "id": "g", "from": "Y", "to": "Z", "expr": "x^2/2" },
    { "id": "gf", "compose": ["f", "g"], "arrows": true }
  ],
  "params": { "p": { "min": 0, "max": 2, "step": 0.01, "val": 1.4, "label": "x" } },
  "probe": { "map": "gf", "at": "p" },
  "plot": { "maps": ["f", "g", "gf"], "construction": true }
}
```

### Un'orbita in un insieme finito

$f$ manda $A$ in sé. Premi «Passo successivo»: da $5$ si arriva in $1$, poi si gira per sempre tra $1$, $2$ e $3$.

```sets
{
  "sets": [{ "id": "A", "elements": ["1", "2", "3", "4", "5"] }],
  "maps": [{ "id": "f", "from": "A", "to": "A", "pairs": { "1": "2", "2": "3", "3": "1", "4": "4", "5": "1" } }],
  "iterate": { "map": "f", "start": "5", "steps": 8 }
}
```

### Le potenze di una funzione

$f^n = f \circ f \circ \dots \circ f$ ($n$ volte). Con lo slider cambia $n$: le frecce mostrano dove va ogni elemento dopo $n$ passi.

```sets
{
  "sets": [{ "id": "A", "elements": ["1", "2", "3", "4", "5"] }],
  "maps": [
    { "id": "f", "from": "A", "to": "A", "pairs": { "1": "2", "2": "3", "3": "1", "4": "4", "5": "1" }, "hidden": true },
    { "id": "fn", "iterate": ["f", "n"], "color": "blue" }
  ],
  "params": { "n": { "min": 0, "max": 6, "step": 1, "val": 2 } },
  "show": ["properties(fn)"]
}
```

### Iterare il coseno

Su una sola retta: ogni passo va da $x_k$ a $x_{k+1} = \cos x_k$. Sul grafico la stessa orbita è la ragnatela tra $y = \cos x$ e $y = x$; i punti si avvicinano al punto fisso $\cos x = x$.

```sets
{
  "dynagraph": { "ticks": 0.5 },
  "sets": [{ "id": "I", "label": "I", "interval": "[0, 1.5]" }],
  "maps": [{ "id": "c", "label": "\\cos", "from": "I", "to": "I", "expr": "cos(x)", "hidden": true }],
  "params": { "p": { "min": 0, "max": 1.5, "step": 0.01, "val": 0.2, "label": "$x_0$" } },
  "iterate": { "map": "c", "start": "p", "steps": 40 },
  "plot": { "maps": ["c"] }
}
```

### Due diagrammi, uno slider

I due blocchi hanno `"sync": "sq"`: lo slider del primo muove il punto in entrambi, e si può trascinare il punto in tutti e due.

```sets
{
  "sync": "sq",
  "layout": "column",
  "sets": [{ "id": "X", "interval": "[-2, 2]" }, { "id": "Y", "interval": "[0, 4]" }],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "x^2" }],
  "params": { "p": { "min": -2, "max": 2, "step": 0.01, "val": 1.5, "label": "x" } },
  "probe": { "map": "f", "at": "p" }
}
```

```sets
{
  "sync": "sq",
  "dynagraph": { "ticks": 1 },
  "sets": [{ "id": "X", "interval": "[-2, 2]" }, { "id": "Y", "interval": "[0, 4]" }],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "x^2" }],
  "params": { "p": { "min": -2, "max": 2, "step": 0.01, "val": 1.5 } },
  "showSliders": false,
  "probe": { "map": "f", "at": "p", "trace": true }
}
```

### Evidenziazione e orbite collegate

La stessa funzione in riga e in colonna. Passa sopra un elemento: si evidenzia anche nell'altro diagramma. «Passo successivo» fa avanzare insieme l'orbita di $f$ in tutti e due.

```sets
{
  "sync": "orb",
  "sets": [{ "id": "A", "elements": ["1", "2", "3", "4"] }],
  "maps": [{ "id": "f", "from": "A", "to": "A", "pairs": { "1": "2", "2": "4", "3": "3", "4": "1" } }],
  "iterate": { "map": "f", "start": "1", "steps": 5 }
}
```

```sets
{
  "sync": "orb",
  "layout": "column",
  "sets": [{ "id": "A", "elements": ["1", "2", "3", "4"] }],
  "maps": [{ "id": "f", "from": "A", "to": "A", "pairs": { "1": "2", "2": "4", "3": "3", "4": "1" } }],
  "iterate": { "map": "f", "start": "1", "steps": 5, "showValue": false }
}
```
