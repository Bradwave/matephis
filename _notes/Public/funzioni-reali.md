---
title: Funzioni reali di variabile reale
feed: show
code: true
tags:
  - funzioni
  - teoria
---

Questa pagina continua [[le funzioni]] e si concentra sulle funzioni $f \colon D \to \mathbb{R}$ con $D \subseteq \mathbb{R}$: IN e OUT sono numeri reali, e la funzione si può disegnare nel piano cartesiano. Vediamo quali proprietà conviene studiare, come si riconoscono con una formula, su un grafico e in un dynagraph, e come si trasforma un grafico quando si modifica la formula.

Come nella pagina precedente, molti diagrammi si possono manipolare: **prima di muovere qualcosa, prova a prevedere** che cosa succederà.

> [!DETAILS] Che cosa sappiamo già disegnare
>
> - **Rette** $y = mx + q$: si parte dall'intersezione $(0, q)$ con l'asse $y$ e ci si sposta di $m$ verso l'alto per ogni passo verso destra.
> - **Parabole** $y = ax^2 + bx + c$: la concavità dipende dal segno di $a$; gli zeri sono le soluzioni di $ax^2 + bx + c = 0$; se ci sono zeri, il vertice ha l'ascissa nel punto medio tra di essi.
> - **Polinomi scomposti** in fattori: in uno zero di molteplicità $1$ il grafico *taglia* l'asse $x$; in uno zero di molteplicità dispari maggiore di $1$ lo taglia diventando tangente all'asse (*taglio tangente*); in uno zero di molteplicità pari *rimbalza* sull'asse. Per IN molto grandi in valore assoluto prevale il termine di grado massimo: conta se mantiene o cambia il segno dell'IN.
> - **Radici quadrate** $y = \sqrt{h(x)}$: il dominio è dove $h(x) \geq 0$; i valori $0$ e $1$ restano uguali, i valori di $h$ compresi tra $0$ e $1$ vengono "gonfiati" e quelli maggiori di $1$ "sgonfiati". La retta $y = 1$ fa da soglia.

## Lo studio di una funzione

Davanti a una funzione reale, ci si pone sempre le stesse domande. Le raccogliamo in un elenco che useremo come guida per tutta la pagina e, alla fine, applicheremo dall'inizio alla fine a un esempio.

1. **Dominio**: per quali IN la funzione è definita?
2. **Intersezioni con gli assi e zeri**: quando l'IN è $0$? Quando l'OUT è $0$?
3. **Segno**: per quali IN l'OUT è positivo, per quali negativo?
4. **Parità**: il grafico ha una simmetria rispetto all'asse $y$ o rispetto all'origine?
5. **Monotonia**: quando l'IN aumenta, l'OUT aumenta o diminuisce?
6. **Immagine, iniettività, suriettività, inversa**: quali OUT si ottengono? Ognuno una volta sola?

Il dominio naturale è già stato trattato in [[le funzioni]]; partiamo dagli zeri.

## Zeri e intersezioni con gli assi

- L'intersezione con l'**asse $y$** si ottiene con IN $= 0$: è il punto $(0, f(0))$, se $0 \in \textrm{dom}\, f$. Una funzione ha **al più una** intersezione con l'asse $y$: è la definizione di funzione.
- Le intersezioni con l'**asse $x$** si ottengono con OUT $= 0$: sono i punti $(x, 0)$ con $f(x) = 0$. Le ascisse di questi punti si chiamano ***zeri*** della funzione, e possono essere nessuno, uno o molti.

Con il linguaggio degli insiemi, l'insieme degli zeri è la controimmagine di $0$:

$$\lbrace x \in \textrm{dom}\, f : f(x) = 0 \rbrace = f^{-1}(\lbrace 0 \rbrace) \, .$$

**Esempio.** Sia $f(x) = \sqrt{x - 2} + 2$. Poiché $0 \notin \textrm{dom}\, f = [2, +\infty)$, non c'è intersezione con l'asse $y$ ($f(0) = \sqrt{-2} + 2$ non è un numero reale). L'equazione $\sqrt{x - 2} + 2 = 0$ equivale a $\sqrt{x - 2} = -2$, che non ha soluzioni perché una radice quadrata non è mai negativa: non ci sono nemmeno zeri.

## Segno

Studiare il ***segno*** di $f$ vuol dire trovare per quali IN l'OUT è positivo e per quali è negativo, cioè risolvere le disequazioni $f(x) > 0$ e $f(x) < 0$. Anche in questo caso si tratta di controimmagini:

$$\lbrace x : f(x) > 0 \rbrace = f^{-1}\big((0, +\infty)\big) \, , \qquad \lbrace x : f(x) < 0 \rbrace = f^{-1}\big((-\infty, 0)\big) \, .$$

Sul grafico: dove $f$ è positiva il grafico sta **sopra** l'asse $x$, dove è negativa sta **sotto**.

**Esempio.** Sia $f(x) = \frac 1 2 (x + 1)(x - 2)^2$. Gli zeri sono $-1$ (molteplicità $1$: taglio) e $2$ (molteplicità $2$: rimbalzo). Per $x$ molto grande prevale $\frac 1 2 x^3$, che mantiene il segno dell'IN: a destra il grafico sta sopra l'asse, a sinistra sotto. Quindi $f(x) > 0$ per $-1 < x < 2$ e per $x > 2$, $f(x) < 0$ per $x < -1$.

*Prima di guardare: in quali parti della retta degli IN le frecce arrivano sopra lo zero della retta degli OUT?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "\\text{IN}", "interval": "R", "window": [-2, 3] },
    { "id": "Y", "label": "\\text{OUT}", "interval": "R", "window": [-2, 3] }
  ],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "(x + 1)(x - 2)^2/2" }],
  "params": { "p": { "min": -1.5, "max": 3, "step": 0.05, "val": 0.5, "label": "x" } },
  "probe": { "map": "f", "at": "p" },
  "highlights": [
    { "of": "preimage(f, (0, +inf))", "color": "green", "label": "f > 0" },
    { "of": "preimage(f, (-inf, 0))", "color": "red", "label": "f < 0" },
    { "of": "preimage(f, 0)", "color": "blue", "label": "f = 0" }
  ],
  "plot": { "maps": ["f"] }
}
```

In $x = 2$ il segno non cambia: è un rimbalzo. In $x = -1$ cambia: è un taglio.

## Parità

> **Definizione.** Sia $f$ una funzione il cui dominio è simmetrico rispetto a $0$ (cioè $x \in \textrm{dom}\, f \implies -x \in \textrm{dom}\, f$). La funzione $f$ è
> - ***pari*** se $f(-x) = f(x)$ per ogni $x \in \textrm{dom}\, f$;
> - ***dispari*** se $f(-x) = -f(x)$ per ogni $x \in \textrm{dom}\, f$.

In IN/OUT: una funzione è pari se due IN opposti hanno lo **stesso** OUT, dispari se hanno OUT **opposti**. Sul grafico:
- il grafico di una funzione pari è **simmetrico rispetto all'asse $y$**: se $(x, y)$ sta sul grafico, ci sta anche $(-x, y)$;
- il grafico di una funzione dispari è **simmetrico rispetto all'origine**: se $(x, y)$ sta sul grafico, ci sta anche $(-x, -y)$.

**Esempi.**
- $f(x) = x^4 - x^2 - 1$ è pari: $f(-x) = (-x)^4 - (-x)^2 - 1 = x^4 - x^2 - 1 = f(x)$. Lo sono anche $\lvert x \rvert$ e $\cos x$.
- $f(x) = x^3 - x$ è dispari: $f(-x) = (-x)^3 - (-x) = -x^3 + x = -f(x)$. Lo sono anche $\frac 1 x$ e $\sin x$.
- $f(x) = x^3 - x^2$ non è né pari né dispari: $f(-x) = -x^3 - x^2$, che non è uguale né a $f(x)$ né a $-f(x)$. Per dimostrarlo basta un controesempio: $f(-1) = -2$, mentre $f(1) = 0$.
- $\sqrt{x - 2} + 2$ non è né pari né dispari: il suo dominio $[2, +\infty)$ non è nemmeno simmetrico.

Un polinomio con soli esponenti pari è pari, con soli esponenti dispari è dispari: da qui vengono i nomi.

Nel diagramma il punto blu sta sempre in $-p$. Con lo slider $n$ scegli la funzione: $n = 1$ è $x^3 - x$, $n = 2$ è $x^4 - x^2 - 1$, $n = 3$ è $x^3 - x^2$. *Prima di trascinare: per ciascuna funzione, che cosa dirà la riga sotto il diagramma?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "\\mathbb{R}", "interval": "[-1.5, 1.5]" },
    { "id": "Y", "label": "\\mathbb{R}", "interval": "[-2.5, 2.5]" }
  ],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "n == 1 ? x^3 - x : (n == 2 ? x^4 - x^2 - 1 : x^3 - x^2)" }],
  "params": {
    "n": { "min": 1, "max": 3, "step": 1, "val": 1, "label": "n" },
    "p": { "min": -1.5, "max": 1.5, "step": 0.05, "val": 1.2, "label": "x" }
  },
  "probe": [{ "map": "f", "at": "p" }, { "map": "f", "at": "-p", "color": "blue" }],
  "compare": { "probes": [0, 1], "mode": "parity" },
  "plot": { "maps": ["f"] }
}
```

Nel dynagraph di una funzione pari le frecce di $p$ e di $-p$ arrivano nello stesso punto; in quello di una funzione dispari arrivano in punti simmetrici rispetto allo $0$.

### Parità e composizione

Che cosa succede alla parità quando si compongono due funzioni? Calcoliamo $(g \circ f)(-x) = g(f(-x))$.

- **Se $f$ è pari**, allora $g(f(-x)) = g(f(x))$: la composta $g \circ f$ è **pari**, qualunque sia $g$. Ad esempio $\sqrt{x^2 + 1}$, $\dfrac{1}{x^2 + 1}$ e $\cos(x^2)$ sono pari, perché il primo passaggio è $x \mapsto x^2$, che è pari: "IN opposti hanno lo stesso OUT" già dopo il primo passo, e da lì in poi i calcoli sono identici.
- **Se $f$ e $g$ sono dispari**, allora $g(f(-x)) = g(-f(x)) = -g(f(x))$: la composta è **dispari**.
- **Se $f$ è dispari e $g$ è pari**, allora $g(f(-x)) = g(-f(x)) = g(f(x))$: la composta è **pari**. Ad esempio $\lvert x^3 \rvert$, oppure $(\sin x)^2$.
- **Se $f$ è dispari e $g$ non è né pari né dispari**, in generale la composta non è né pari né dispari: $(x^3) + 1$ non lo è.

| $f$ (si applica per prima) | $g$ | $g \circ f$ |
| :--- | :--- | :--- |
| pari | qualunque | pari |
| dispari | pari | pari |
| dispari | dispari | dispari |
| dispari | né pari né dispari | in generale nessuna delle due |

## Monotonia

### Crescente e decrescente

> **Definizione.** Sia $f$ una funzione e sia $I \subseteq \textrm{dom}\, f$. La funzione $f$ è, su $I$,
> - ***crescente*** se $\forall x_1, x_2 \in I : x_1 < x_2 \implies f(x_1) \leq f(x_2)$;
> - ***strettamente crescente*** se $\forall x_1, x_2 \in I : x_1 < x_2 \implies f(x_1) < f(x_2)$;
> - ***decrescente*** se $\forall x_1, x_2 \in I : x_1 < x_2 \implies f(x_1) \geq f(x_2)$;
> - ***strettamente decrescente*** se $\forall x_1, x_2 \in I : x_1 < x_2 \implies f(x_1) > f(x_2)$.
>
> Una funzione con una di queste proprietà si dice ***monotona*** su $I$.

Detto con gli IN e gli OUT: una funzione strettamente crescente **conserva l'ordine** (l'IN più grande dà l'OUT più grande), una strettamente decrescente lo **inverte**. Nel dynagraph lo si vede subito:
- se $f$ è strettamente crescente, le frecce **non si incrociano** mai;
- se $f$ è strettamente decrescente, **ogni coppia** di frecce si incrocia.

*Prima di trascinare: con $f(x) = x^2$ su $[-2, 2]$, dove devi mettere $p$ e $q$ perché l'ordine si conservi? E perché si inverta?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [{ "id": "X", "interval": "[-2, 2]" }, { "id": "Y", "interval": "[0, 4]" }],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "x^2" }],
  "params": {
    "p": { "min": -2, "max": 2, "step": 0.05, "val": 0.5 },
    "q": { "min": -2, "max": 2, "step": 0.05, "val": 1.5 }
  },
  "probe": [{ "map": "f", "at": "p" }, { "map": "f", "at": "q", "color": "blue" }],
  "compare": [0, 1],
  "plot": { "maps": ["f"] }
}
```

$x^2$ è strettamente decrescente su $(-\infty, 0]$ e strettamente crescente su $[0, +\infty)$, ma non è monotona su $\mathbb{R}$. La monotonia si studia **su un insieme**, e conviene dire sempre quale. Attenzione: $\dfrac 1 x$ è strettamente decrescente su $(-\infty, 0)$ e su $(0, +\infty)$, ma **non** sul suo dominio $\mathbb{R} \setminus \lbrace 0 \rbrace$: $-1 < 1$ e $\frac{1}{-1} < \frac 1 1$.

### Monotonia e iniettività

> **Proposizione.** Se $f$ è strettamente monotona su $I$, allora è iniettiva su $I$.

*Dimostrazione* (per $f$ strettamente crescente). Siano $x_1, x_2 \in I$ con $x_1 \neq x_2$; ad esempio $x_1 < x_2$. Allora $f(x_1) < f(x_2)$, quindi $f(x_1) \neq f(x_2)$. $\square$

Il viceversa è falso: una funzione può essere iniettiva senza essere monotona. Ad esempio $\dfrac 1 x$ è iniettiva sul suo dominio, ma non è monotona su di esso; lo stesso vale per la funzione definita a tratti che vale $x$ su $[0, 1)$ e $3 - x$ su $[1, 2]$.

### Monotonia e composizione

Se componiamo due funzioni monotone, l'ordine viene conservato o invertito due volte. Come nella regola dei segni, due inversioni si annullano.

| $f$ | $g$ | $g \circ f$ |
| :--- | :--- | :--- |
| crescente ($+$) | crescente ($+$) | crescente ($+$) |
| crescente ($+$) | decrescente ($-$) | decrescente ($-$) |
| decrescente ($-$) | crescente ($+$) | decrescente ($-$) |
| decrescente ($-$) | decrescente ($-$) | crescente ($+$) |

*Dimostrazione* (dell'ultima riga, nel caso stretto). Siano $x_1 < x_2$. Poiché $f$ è strettamente decrescente, $f(x_1) > f(x_2)$. Poiché $g$ è strettamente decrescente e $f(x_2) < f(x_1)$, si ha $g(f(x_2)) > g(f(x_1))$. Quindi $g(f(x_1)) < g(f(x_2))$: $g \circ f$ è strettamente crescente. $\square$

**Esempi.**
- $\sqrt{x - 2} + 2$ è strettamente crescente: è la composizione di $x \mapsto x - 2$, $t \mapsto \sqrt t$ e $u \mapsto u + 2$, tutte strettamente crescenti.
- $\dfrac{1}{x^2 + 1}$ è strettamente decrescente su $[0, +\infty)$: $x \mapsto x^2$ e $t \mapsto t + 1$ sono crescenti su quegli insiemi ($+$, $+$), mentre $u \mapsto \frac 1 u$ è decrescente per $u > 0$ ($-$).

Nel dynagraph, $f(x) = x^2$ su $[0, 2]$ (crescente) e poi $g(t) = 4 - t$ (decrescente). *Prima di trascinare: tra la prima e la seconda retta le frecce di $p$ e $q$ si incrociano? E tra la seconda e la terza?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "interval": "[0, 2]" },
    { "id": "Y", "interval": "[0, 4]" },
    { "id": "Z", "interval": "[0, 4]" }
  ],
  "maps": [
    { "id": "f", "label": "x^2", "name": "f", "from": "X", "to": "Y", "expr": "x^2" },
    { "id": "g", "label": "4 - x", "name": "g", "from": "Y", "to": "Z", "expr": "4 - x", "color": "blue" },
    { "id": "gf", "compose": ["f", "g"] }
  ],
  "params": {
    "p": { "min": 0, "max": 2, "step": 0.05, "val": 0.5 },
    "q": { "min": 0, "max": 2, "step": 0.05, "val": 1.5 }
  },
  "probe": [{ "map": "gf", "at": "p" }, { "map": "gf", "at": "q", "color": "blue" }],
  "compare": [0, 1]
}
```

## Immagine, iniettività e inversa

Le definizioni di iniettività, suriettività e funzione inversa sono in [[le funzioni]]. Per le funzioni reali si usano soprattutto tre strumenti.

- **Il test della retta orizzontale.** $f$ è iniettiva se ogni retta orizzontale taglia il grafico al più una volta; l'immagine è l'insieme dei $k$ per cui la retta $y = k$ taglia il grafico almeno una volta.
- **L'equazione $f(x) = k$.** Un numero $k$ appartiene all'immagine se e solo se l'equazione $f(x) = k$, nell'incognita $x$, ha almeno una soluzione nel dominio. Se la soluzione è unica per ogni $k$ dell'immagine, $f$ è iniettiva, e la soluzione, scritta in funzione di $k$, è proprio l'inversa.
- **La monotonia.** Una funzione strettamente monotona è iniettiva. Per rendere invertibile una funzione che non lo è, si restringe il dominio a un intervallo su cui è strettamente monotona, e il codominio all'immagine di quell'intervallo.

**Esempio.** Sia $f(x) = x^2 - 2x$, una parabola con zeri $0$ e $2$ e vertice in $(1, -1)$. Non è iniettiva su $\mathbb{R}$: $f(0) = f(2)$. È strettamente crescente su $[1, +\infty)$, e l'immagine di $[1, +\infty)$ è $[-1, +\infty)$. Quindi $f \colon [1, +\infty) \to [-1, +\infty)$ è biiettiva. Per l'inversa ricaviamo l'IN da $\text{OUT} = \text{IN}^2 - 2\,\text{IN}$, completando il quadrato:

$$\text{OUT} + 1 = (\text{IN} - 1)^2 \implies \text{IN} - 1 = \sqrt{\text{OUT} + 1} \implies \text{IN} = 1 + \sqrt{\text{OUT} + 1} \, ,$$

dove abbiamo scelto la radice positiva perché $\text{IN} \geq 1$. Quindi $f^{-1} \colon [-1, +\infty) \to [1, +\infty)$, $f^{-1}(x) = 1 + \sqrt{x + 1}$. Restringendo invece il dominio a $(-\infty, 1]$ si ottiene l'altra inversa, $1 - \sqrt{x + 1}$.

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "interval": "[1, 4]" },
    { "id": "Y", "interval": "[-1, 8]" }
  ],
  "maps": [
    { "id": "f", "from": "X", "to": "Y", "expr": "x^2 - 2x" },
    { "id": "finv", "label": "f^{-1}", "inverse": "f", "hidden": true }
  ],
  "params": { "p": { "min": 1, "max": 4, "step": 0.05, "val": 3.5, "label": "x" } },
  "probe": [{ "map": "f", "at": "p", "color": "blue" }, { "map": "finv", "at": "p^2 - 2p", "color": "orange" }],
  "plot": { "maps": ["f", "finv"], "identity": true, "xlim": [-1.5, 8], "ylim": [-1.5, 8] }
}
```

## Trasformazioni del grafico

Conoscendo il grafico di una funzione $f$, possiamo disegnare senza fare calcoli i grafici di $f(x) + k$, $f(x - h)$, $a \cdot f(x)$, $f(\omega x)$, $-f(x)$, $f(-x)$, $\lvert f(x) \rvert$, $f(\lvert x \rvert)$. Tutte queste funzioni sono **composizioni** di $f$ con una funzione molto semplice, che agisce:
- **sull'OUT**, cioè **dopo** $f$: $f(x) + k$, $a \cdot f(x)$, $-f(x)$, $\lvert f(x) \rvert$;
- **sull'IN**, cioè **prima** di $f$: $f(x - h)$, $f(\omega x)$, $f(-x)$, $f(\lvert x \rvert)$.

Tutta questa sezione si riassume in un principio:

> **Una modifica dell'OUT agisce in verticale, così come è scritta. Una modifica dell'IN agisce in orizzontale, con l'operazione inversa.**

Il motivo della seconda frase è questo. Il grafico di $f$ contiene i punti $(x_0, f(x_0))$. La nuova funzione modifica l'IN prima di passarlo a $f$; perché a $f$ arrivi ancora $x_0$, cioè perché esca lo stesso OUT, bisogna dare in ingresso un IN diverso, quello che la modifica trasforma in $x_0$. Lo si trova **disfacendo** la modifica: con l'operazione inversa.

Negli esempi usiamo la parabola $f(x) = (x - 1)(x - 3)$, che ha gli zeri $1$ e $3$, il vertice $V = (2, -1)$ e l'intersezione con l'asse $y$ in $(0, 3)$: tre punti facili da seguire. Il grafico di $f$ è sempre tratteggiato, quello trasformato è rosso.

### Traslazioni

- $g(x) = f(x) + k$: a ogni OUT si aggiunge $k$. Il grafico si sposta **in verticale di $k$**: verso l'alto se $k > 0$, verso il basso se $k < 0$. Il punto $(x_0, y_0)$ va in $(x_0, y_0 + k)$.
- $g(x) = f(x - h)$: all'IN si sottrae $h$ prima di passarlo a $f$. Il grafico si sposta **in orizzontale di $h$**: verso **destra** se $h > 0$, verso sinistra se $h < 0$. Infatti $g(x_0 + h) = f(x_0 + h - h) = f(x_0)$: l'OUT che $f$ dava in $x_0$, $g$ lo dà in $x_0 + h$. Il punto $(x_0, y_0)$ va in $(x_0 + h, y_0)$.

*Prima di muovere gli slider: con $h = 2$, dove va il vertice? Il grafico di $f(x - 2)$ sta a destra o a sinistra di quello di $f$?*

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-3, 7],
  "ylim": [-4, 6],
  "legend": true,
  "legendWidth": 150,
  "params": {
    "h": { "min": -3, "max": 3, "step": 0.5, "val": 2, "label": "$h$" },
    "k": { "min": -3, "max": 3, "step": 0.5, "val": 1, "label": "$k$" }
  },
  "data": [
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "(x - h - 1)(x - h - 3) + k", "color": "red1", "label": "$f(x - h) + k$" },
    { "points": [[2, -1, "V"]], "radius": 4, "fillColor": "black1" },
    { "points": [["2 + h", "-1 + k", "V'"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

La traslazione orizzontale va "al contrario" rispetto al segno che si legge: in $f(x - 2)$ c'è un meno, ma il grafico va a destra. Non è un'eccezione da memorizzare, è il principio: l'IN viene modificato **prima** di $f$, e per ottenere lo stesso OUT bisogna "arrivare in anticipo" di $2$.

### Dilatazioni: c'è sempre un asse fisso

- $g(x) = a \cdot f(x)$, con $a > 0$: ogni OUT viene moltiplicato per $a$. È una ***dilatazione verticale*** (se $a > 1$) o una ***compressione verticale*** (se $0 < a < 1$). Il punto $(x_0, y_0)$ va in $(x_0, a y_0)$.
- $g(x) = f(\omega x)$, con $\omega > 0$: l'IN viene moltiplicato per $\omega$ prima di passarlo a $f$. Con l'operazione inversa, il grafico si dilata in orizzontale di un fattore $\frac{1}{\omega}$: si **comprime** se $\omega > 1$, si **allarga** se $0 < \omega < 1$. Infatti $g\!\left(\frac{x_0}{\omega}\right) = f(x_0)$: il punto $(x_0, y_0)$ va in $\left(\frac{x_0}{\omega}, y_0\right)$.

Qui c'è il punto che crea più confusione. Moltiplicare per $a$ non "allunga il grafico attorno al suo centro" o "attorno al vertice": allunga ogni punto **a partire dall'asse $x$**. La distanza dall'asse $x$ diventa $a$ volte più grande, quindi i punti **sull'asse $x$**, che hanno distanza $0$, **restano fermi**. Allo stesso modo, $f(\omega x)$ divide per $\omega$ la distanza di ogni punto dall'asse $y$, e i punti **sull'asse $y$** restano fermi.

| trasformazione | ogni punto $(x_0, y_0)$ va in | resta fermo |
| :--- | :--- | :--- |
| $a \cdot f(x)$ | $(x_0,\; a\, y_0)$ | l'asse $x$: gli **zeri** non cambiano |
| $f(\omega x)$ | $\left(\frac{x_0}{\omega},\; y_0\right)$ | l'asse $y$: l'**intersezione con l'asse $y$** non cambia |

*Prima di muovere lo slider: con $a = 2$, dove vanno gli zeri? Dove va il vertice? La parabola diventa "più stretta"?*

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-2, 7],
  "ylim": [-4, 7],
  "legend": true,
  "legendWidth": 150,
  "params": { "a": { "min": 0.25, "max": 3, "step": 0.25, "val": 2, "label": "$a$" } },
  "data": [
    { "fn": "0", "color": "summer7", "width": 6, "opacity": 0.35, "label": "asse fisso" },
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "a(x - 1)(x - 3)", "color": "red1", "label": "$a \\cdot f(x)$" },
    { "points": [[1, 0], [3, 0]], "radius": 4, "fillColor": "summer7" },
    { "points": [[2, -1, "V"]], "radius": 4, "fillColor": "black1" },
    { "points": [["2", "-a", "V'"], ["0", "3a"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

Gli zeri $1$ e $3$ non si muovono; il vertice va da $(2, -1)$ a $(2, -a)$; l'intersezione con l'asse $y$ va da $(0, 3)$ a $(0, 3a)$. La parabola sembra "più stretta", ma non si è stretta attorno al vertice: si è allungata in verticale a partire dall'asse $x$.

*Prima di muovere lo slider: con $\omega = 2$, dove vanno gli zeri? E l'intersezione con l'asse $y$?*

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-2, 6],
  "ylim": [-4, 5],
  "legend": true,
  "legendWidth": 150,
  "params": { "w": { "min": 0.25, "max": 3, "step": 0.25, "val": 2, "label": "$\\omega$" } },
  "data": [
    { "parametric": ["0", "t"], "domain": [-4, 5], "color": "summer7", "width": 6, "opacity": 0.35, "label": "asse fisso" },
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "(w x - 1)(w x - 3)", "color": "red1", "label": "$f(\\omega x)$" },
    { "points": [[0, 3]], "radius": 4, "fillColor": "summer7" },
    { "points": [[2, -1, "V"]], "radius": 4, "fillColor": "black1" },
    { "points": [["2/w", "-1", "V'"], ["1/w", "0"], ["3/w", "0"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

Con $\omega = 2$ gli zeri vanno in $\frac 1 2$ e $\frac 3 2$, il vertice in $(1, -1)$: il grafico si è compresso verso l'asse $y$, non attorno al vertice. L'intersezione $(0, 3)$ resta ferma.

Lo stesso si vede con una sola retta: la dilatazione $d(x) = a x$ manda ogni numero in un numero $a$ volte più lontano da $0$, e l'unico numero che non si muove, il ***punto fisso*** di $d$, è $0$. Più in generale, $d(x) = c + a(x - c)$ dilata le distanze da $c$, e il suo punto fisso è $c$: il **centro** della dilatazione.

*Prima di muovere gli slider: dove si trova il punto fisso? Che cosa succede con $a = 1$? E con $a$ negativo?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [{ "id": "X", "interval": "[-3, 3]" }, { "id": "Y", "interval": "[-3, 3]" }],
  "maps": [{ "id": "d", "label": "c + a(x - c)", "name": "d", "from": "X", "to": "Y", "expr": "c + a*(x - c)" }],
  "params": {
    "a": { "min": -2, "max": 2, "step": 0.1, "val": 2 },
    "c": { "min": -2, "max": 2, "step": 0.1, "val": 0 }
  },
  "show": ["fixed(d)"]
}
```

### Dilatare attorno a un'altra retta

E se vogliamo davvero stringere la parabola **attorno al suo vertice**, cioè in orizzontale lasciando ferma la retta $x = 2$? Si usa una composizione in tre passi: si **trasla** in modo che la retta $x = 2$ vada sull'asse $y$, si **dilata** (ora l'asse fisso è quello giusto), si **trasla indietro**:

$$g(x) = f\big(\omega (x - 2) + 2\big) \, .$$

Allo stesso modo, $a \cdot \big(f(x) - k\big) + k$ dilata in verticale lasciando ferma la retta $y = k$.

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-1, 5],
  "ylim": [-2, 5],
  "legend": true,
  "legendWidth": 190,
  "params": { "w": { "min": 0.25, "max": 3, "step": 0.25, "val": 2, "label": "$\\omega$" } },
  "data": [
    { "parametric": ["2", "t"], "domain": [-2, 5], "color": "summer7", "width": 6, "opacity": 0.35, "label": "$x = 2$" },
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "(w(x - 2) + 2 - 1)(w(x - 2) + 2 - 3)", "color": "red1", "label": "$f(\\omega(x - 2) + 2)$" },
    { "points": [[2, -1, "V"]], "radius": 5, "fillColor": "summer7" },
    { "points": [["2 - 1/w", "0"], ["2 + 1/w", "0"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

### L'ordine delle operazioni

Quando si combinano più trasformazioni, l'ordine conta, perché si tratta di composizioni.

**Sull'OUT.** $a \cdot f(x) + k$ e $a \cdot \big(f(x) + k\big)$ sono diverse: nella prima si dilata e poi si trasla, nella seconda si trasla e poi si dilata, e la dilatazione "allunga" anche la traslazione, che diventa $a k$. Nei due dynagraph (collegati: gli slider del primo muovono anche il secondo) $f(x) = x^2$, $s(y) = a y$ e $t(z) = z + k$. *Prima di trascinare: con $a = 2$, $k = 1$ e $x = 1{,}5$, quali OUT ti aspetti?*

```sets
{
  "sync": "ordine",
  "dynagraph": { "scale": "own" },
  "sets": [
    { "id": "X", "interval": "[-2, 2]" }, { "id": "Y", "interval": "[0, 4]" },
    { "id": "Z", "interval": "[-8, 8]" }, { "id": "W", "interval": "[-10, 10]" }
  ],
  "maps": [
    { "id": "f", "label": "x^2", "name": "f", "from": "X", "to": "Y", "expr": "x^2" },
    { "id": "s", "label": "\\cdot a", "name": "s", "from": "Y", "to": "Z", "expr": "a*x", "color": "blue" },
    { "id": "t", "label": "+ k", "name": "t", "from": "Z", "to": "W", "expr": "x + k", "color": "green" },
    { "id": "T", "label": "a f(x) + k", "name": "T_1", "compose": ["f", "s", "t"] }
  ],
  "params": {
    "a": { "min": -2, "max": 2, "step": 0.5, "val": 2 },
    "k": { "min": -2, "max": 2, "step": 0.5, "val": 1 },
    "p": { "min": -2, "max": 2, "step": 0.1, "val": 1.5, "label": "x" }
  },
  "probe": { "map": "T", "at": "p" }
}
```

```sets
{
  "sync": "ordine",
  "dynagraph": { "scale": "own" },
  "sets": [
    { "id": "X", "interval": "[-2, 2]" }, { "id": "Y", "interval": "[0, 4]" },
    { "id": "Z", "interval": "[-2, 6]" }, { "id": "W", "interval": "[-12, 12]" }
  ],
  "maps": [
    { "id": "f", "label": "x^2", "name": "f", "from": "X", "to": "Y", "expr": "x^2" },
    { "id": "t", "label": "+ k", "name": "t", "from": "Y", "to": "Z", "expr": "x + k", "color": "green" },
    { "id": "s", "label": "\\cdot a", "name": "s", "from": "Z", "to": "W", "expr": "a*x", "color": "blue" },
    { "id": "T", "label": "a(f(x) + k)", "name": "T_2", "compose": ["f", "t", "s"] }
  ],
  "params": {
    "a": { "min": -2, "max": 2, "step": 0.5, "val": 2 },
    "k": { "min": -2, "max": 2, "step": 0.5, "val": 1 },
    "p": { "min": -2, "max": 2, "step": 0.1, "val": 1.5 }
  },
  "showSliders": false,
  "probe": { "map": "T", "at": "p" }
}
```

**Sull'IN.** Anche qui l'ordine conta, e in più va letto al contrario. In $f(\omega x + c)$ si moltiplica per $\omega$ e poi si aggiunge $c$; per capire il grafico conviene raccogliere $\omega$:

$$f(\omega x + c) = f\!\left(\omega \left(x + \frac{c}{\omega}\right)\right) \, .$$

Rispetto a $f(\omega x)$, il grafico è traslato di $\frac{c}{\omega}$ (verso sinistra se $\frac{c}{\omega} > 0$), **non** di $c$. Ad esempio, il grafico di $f(2x - 4) = f\big(2(x - 2)\big)$ è quello di $f(2x)$ traslato di $2$ verso destra, non di $4$.

### Riflessioni

Le riflessioni sono dilatazioni di fattore $-1$:
- $-f(x)$ (cioè $a = -1$) cambia segno all'OUT: il grafico si riflette **rispetto all'asse $x$**, che resta fermo;
- $f(-x)$ (cioè $\omega = -1$) cambia segno all'IN: il grafico si riflette **rispetto all'asse $y$**, che resta fermo.

Ne segue anche il significato delle trasformazioni con $a < 0$ o $\omega < 0$: una dilatazione seguita da una riflessione. E si ritrova la parità: $f$ è pari se il suo grafico coincide con quello di $f(-x)$, è dispari se il grafico di $f(-x)$ coincide con quello di $-f(x)$, cioè se riflettere rispetto all'asse $y$ e rispetto all'asse $x$ dà lo stesso risultato.

### Valore assoluto: tagliare e riflettere

Le due trasformazioni con il valore assoluto sono funzioni definite a tratti.

**$\lvert f(x) \rvert$ agisce sull'OUT**: dove $f(x) \geq 0$ non cambia nulla, dove $f(x) < 0$ l'OUT cambia segno.

$$\lvert f(x) \rvert = \begin{cases} f(x) & \text{se } f(x) \geq 0 \\ -f(x) & \text{se } f(x) < 0 \end{cases}$$

Le parti del grafico **sotto** l'asse $x$ vengono **riflesse sopra**; il resto non cambia.

**$f(\lvert x \rvert)$ agisce sull'IN**: per $x \geq 0$ è $f(x)$, per $x < 0$ è $f(-x)$.

$$f(\lvert x \rvert) = \begin{cases} f(x) & \text{se } x \geq 0 \\ f(-x) & \text{se } x < 0 \end{cases}$$

La parte del grafico con $x \geq 0$ resta, quella con $x < 0$ viene **buttata via** e sostituita dalla riflessione della parte destra rispetto all'asse $y$. Il risultato è sempre una funzione **pari**: è il caso "$f$ pari" della composizione, con $\lvert x \rvert$ come primo passaggio.

```matephis
{
  "layout": "row",
  "mobileColumns": 1,
  "labels": ["|f(x)|", "f(|x|)"],
  "shared": { "xlim": [-4, 4], "ylim": [-2, 4], "aspectRatio": "4:3" },
  "plots": [
    { "data": [
      { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4" },
      { "fn": "|(x - 1)(x - 3)|", "color": "red1" }
    ] },
    { "data": [
      { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4" },
      { "fn": "(|x| - 1)(|x| - 3)", "color": "red1" }
    ] }
  ]
}
```

### Riepilogo

| funzione | agisce su | effetto sul grafico | resta fermo |
| :--- | :--- | :--- | :--- |
| $f(x) + k$ | OUT | traslazione verticale di $k$ | — |
| $f(x - h)$ | IN | traslazione orizzontale di $h$ ($h > 0$: destra) | — |
| $a \cdot f(x)$, $a > 0$ | OUT | dilatazione verticale di fattore $a$ | l'asse $x$ |
| $f(\omega x)$, $\omega > 0$ | IN | dilatazione orizzontale di fattore $\frac{1}{\omega}$ | l'asse $y$ |
| $-f(x)$ | OUT | simmetria rispetto all'asse $x$ | l'asse $x$ |
| $f(-x)$ | IN | simmetria rispetto all'asse $y$ | l'asse $y$ |
| $\lvert f(x) \rvert$ | OUT | le parti sotto l'asse $x$ vengono riflesse sopra | le parti sopra l'asse $x$ |
| $f(\lvert x \rvert)$ | IN | la parte con $x \geq 0$ viene riflessa a sinistra | la parte con $x \geq 0$ |

## Funzioni definite a tratti

Una funzione definita a tratti usa formule diverse su parti diverse del dominio. Le condizioni devono dividere il dominio in pezzi **disgiunti** che lo ricoprono tutto: così a ogni IN si applica una e una sola formula. Per disegnarla si disegna ogni pezzo solo sulla sua parte di dominio, facendo attenzione agli estremi: un pallino pieno indica un punto che appartiene al grafico, un pallino vuoto un punto che non gli appartiene.

Le abbiamo già incontrate: il valore assoluto, la funzione segno, e ora $\lvert f(x) \rvert$ e $f(\lvert x \rvert)$. Sono molto comuni nei modelli: un parcheggio che costa $2$ € l'ora, ma al massimo $10$ € al giorno; una tariffa telefonica con una soglia; le tasse a scaglioni.

**Esempio.** Un parcheggio fa pagare $2$ € per ogni ora **iniziata**. Il costo in funzione del tempo di sosta $t$ (in ore, $t > 0$) è

$$C(t) = \begin{cases} 2 & \text{se } 0 < t \leq 1 \\ 4 & \text{se } 1 < t \leq 2 \\ 6 & \text{se } 2 < t \leq 3 \\ \ldots \end{cases}$$

cioè $C(t) = 2 \lceil t \rceil$, dove $\lceil t \rceil$ è il più piccolo intero maggiore o uguale a $t$. Il grafico è "a gradini". *Prima di trascinare: quanto si paga per una sosta di esattamente $2$ ore? E di $2$ ore e un minuto?*

```sets
{
  "sets": [
    { "id": "T", "label": "t", "interval": "(0, 4]" },
    { "id": "C", "label": "C", "elements": ["2", "4", "6", "8"], "order": "given" }
  ],
  "maps": [{
    "id": "c", "label": "C", "name": "C", "from": "T", "to": "C", "samples": 8,
    "piecewise": [
      { "on": "(0, 1]", "expr": "2" },
      { "on": "(1, 2]", "expr": "4" },
      { "on": "(2, 3]", "expr": "6" },
      { "on": "(3, 4]", "expr": "8" }
    ]
  }],
  "params": { "p": { "min": 0.05, "max": 4, "step": 0.05, "val": 2, "label": "t" } },
  "probe": { "map": "c", "at": "p" },
  "plot": { "maps": ["c"], "xlim": [-0.5, 4.5], "ylim": [-1, 9] }
}
```

In Python:

```python
from math import ceil

def costo(t):
    return 2 * ceil(t)

costo(2)       # 4
costo(2.02)    # 6
```

## Ricapitolando: uno studio completo

Applichiamo tutto l'elenco a $f(x) = \sqrt{x - 2} + 2$.

1. **Dominio.** $x - 2 \geq 0$, quindi $\textrm{dom}\, f = [2, +\infty)$.
2. **Intersezioni con gli assi.** $0 \notin \textrm{dom}\, f$: nessuna intersezione con l'asse $y$. $\sqrt{x - 2} + 2 = 0$ non ha soluzioni: nessuno zero.
3. **Segno.** $\sqrt{x - 2} + 2 \geq 2 > 0$ per ogni $x$ del dominio: la funzione è sempre positiva.
4. **Parità.** Il dominio non è simmetrico: né pari né dispari.
5. **Monotonia.** È la composizione di tre funzioni strettamente crescenti ($x \mapsto x - 2$, $t \mapsto \sqrt t$, $u \mapsto u + 2$): è strettamente crescente.
6. **Grafico.** È il grafico di $\sqrt{x}$ traslato di $2$ verso destra (modifica dell'IN: $x - 2$) e di $2$ verso l'alto (modifica dell'OUT: $+2$). Il punto di partenza $(0, 0)$ di $\sqrt x$ va in $(2, 2)$.
7. **Immagine.** $\sqrt{x - 2}$ assume tutti i valori $\geq 0$, quindi $\textrm{im}\, f = [2, +\infty)$. Come funzione in $\mathbb{R}$, $f$ non è suriettiva.
8. **Iniettività e inversa.** È strettamente crescente, quindi iniettiva. Restringendo il codominio all'immagine, $f \colon [2, +\infty) \to [2, +\infty)$ è biiettiva, e la sua inversa (calcolata in [[le funzioni]]) è $f^{-1}(x) = (x - 2)^2 + 2$, con $x \geq 2$.

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "\\mathbb{R}", "interval": "R", "window": [-1, 8] },
    { "id": "Y", "label": "\\mathbb{R}", "interval": "R", "window": [-1, 8] }
  ],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "sqrt(x - 2) + 2" }],
  "params": { "p": { "min": 2, "max": 8, "step": 0.05, "val": 3, "label": "x" } },
  "probe": { "map": "f", "at": "p", "trace": true },
  "show": ["domain(f)", "image(f)"],
  "plot": { "maps": ["f"], "xlim": [-1, 8], "ylim": [-1, 6] }
}
```
