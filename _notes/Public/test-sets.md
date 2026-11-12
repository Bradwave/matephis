---
title: Matephis Sets System
feed: hide
tags:
  - test
code: true
---

Questa pagina serve come test e documentazione per il sistema di diagrammi di insiemi e funzioni generati via codice (JSON). Tutti i diagrammi sono renderizzati da `matephis-sets.js` a partire da un blocco ```` ```sets ````. Per provare una configurazione mentre la scrivi usa il [playground](/playground/) (motore «sets»).

**Stato: fase 1 (insiemi e funzioni).** Insiemi finiti con i loro elementi, intervalli, rettangoli e dischi; funzioni date da coppie, da un'espressione o come composizione; immagine, controimmagine, collisioni e proprietà calcolate dal motore; punto trascinabile sui domini continui. Diagrammi di Venn ed Eulero, relazioni e partizioni, contrazioni iterate, dynagraph e diagrammi commutativi arrivano nelle fasi successive: le opzioni già previste ma non ancora implementate producono un avviso invece di essere ignorate in silenzio.

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
| `expr` | Espressione in `x` (e `y` nel piano); due espressioni `["…", "…"]` per un codominio nel piano. Su insiemi finiti usa i valori numerici degli elementi. |
| `compose` | `["f", "g"]` è $g \circ f$: prima `f`, poi `g`. Il motore controlla che il codominio di `f` sia il dominio di `g`. |
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
| `preimage(f, b_1)`, `preimage(f, {b_1, b_2})` | Controimmagine di un elemento o di un sottoinsieme. |
| `preimage(h, 1/2)`, `preimage(h, [0, 1/4])` | Punti dove $h = 1/2$; parti del dominio dove $h \in [0, 1/4]$. |
| `collisions(f)` | Elementi con la stessa immagine: frecce e immagine comune in rosso. |
| `properties(f)` | Riquadro sotto il diagramma: iniettiva, suriettiva, biiettiva (e se è una funzione a valori nel codominio). |
| `arrows(f)` | Le frecce di `f` (per mostrarle con un pulsante). |

I bersagli dei pulsanti accettano `*`: `"*(f)"` è tutto ciò che riguarda `f`.

### Evidenziazioni

`{ "of": "preimage(f, b_1)", "label": "f^{-1}(b_1)", "color": "blue", "hidden": true, "id": "pre" }`, oppure `{ "set": "A", "elements": ["a_1", "a_2"], "label": "S" }` o `{ "set": "I", "interval": "[0, 1/2]" }`. Colori: `green`, `blue`, `orange`, `red`, `yellow`, `purple`, `gray`, le voci delle palette (`summer3`) o un colore CSS.

### Domini continui

L'immagine di un intervallo è calcolata campionando la funzione, che si suppone continua: un estremo dell'immagine è incluso se viene raggiunto, escluso se viene solo avvicinato (verso un estremo aperto del dominio). Iniettività (monotonia stretta) e suriettività sono quindi **verifiche numeriche**, segnalate come tali nel riquadro; con `claims` si dichiarano. Nel piano l'immagine è il bordo trasformato: è corretta per le trasformazioni affini e, in generale, per le funzioni continue e iniettive.

`probe`: `{ "map": "h", "at": "p" }` mette un punto in $x = p$ con la freccia verso $h(p)$ e il valore. Se `at` è un parametro il punto si trascina e muove lo slider; nel piano `at` è una coppia (`["p", "q"]`). Opzioni: `label`, `color`, `showValue`, `drag`.

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
