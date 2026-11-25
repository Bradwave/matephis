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

Conoscendo il grafico di una funzione $f$, possiamo disegnare senza fare calcoli i grafici di $f(x) + k$, $f(x - h)$, $a \cdot f(x)$, $f(bx)$ e di tutte queste modifiche insieme, $a \cdot f\big(b(x - h)\big) + k$. L'argomento ha una pagina dedicata: [[trasformazioni dei grafici]]. Qui ricordiamo solo il principio e il riepilogo.

> **Una modifica dell'OUT agisce in verticale, così come è scritta. Una modifica dell'IN agisce in orizzontale, con l'operazione inversa.**

| funzione | agisce su | effetto sul grafico | resta fermo |
| :--- | :--- | :--- | :--- |
| $f(x) + k$ | OUT | traslazione verticale di $k$ | — |
| $f(x - h)$ | IN | traslazione orizzontale di $h$ ($h > 0$: destra) | — |
| $a \cdot f(x)$, $a > 0$ | OUT | dilatazione verticale di fattore $a$ | l'asse $x$ |
| $f(bx)$, $b > 0$ | IN | dilatazione orizzontale di fattore $\frac{1}{b}$ | l'asse $y$ |
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
