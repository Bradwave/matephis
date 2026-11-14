---
title: Le funzioni
feed: show
code: true
tags:
  - funzioni
  - teoria
---

Nel linguaggio di tutti i giorni diciamo che una cosa è *in funzione di* un'altra quando dipende da essa: il prezzo del biglietto è in funzione della distanza, il battito cardiaco è in funzione dello sforzo, il voto è in funzione (si spera) dello studio. La matematica prende questa idea e la rende precisa: una funzione è una **macchina** che riceve un ingresso (IN) e restituisce un'uscita (OUT).

$$\text{IN} \;\longmapsto\; \boxed{\;f\;} \;\longmapsto\; \text{OUT}$$

In questa pagina guardiamo le funzioni in tre modi, che si completano a vicenda:

- **vedere e muovere**: diagrammi a frecce, dynagraph, grafici, punti da trascinare;
- **calcolare**: formule, tabelle IN/OUT, qualche riga di codice;
- **definire e dimostrare**: definizioni precise, con i quantificatori, e brevi dimostrazioni.

Molti diagrammi si possono manipolare. Prima di trascinare un punto o di premere un pulsante, **prova a prevedere** che cosa succederà: è lì che si impara qualcosa.

> [!DETAILS] Richiami: coppie ordinate e prodotto cartesiano
>
> - Una **coppia ordinata** $(a, b)$ è formata da due elementi presi in un certo ordine: $(1, 2) \neq (2, 1)$, mentre gli insiemi $\lbrace 1, 2 \rbrace$ e $\lbrace 2, 1 \rbrace$ coincidono. Due coppie sono uguali se e solo se hanno uguali i primi elementi e uguali i secondi: $(a, b) = (c, d) \iff a = c \land b = d$.
> - Il **prodotto cartesiano** di due insiemi $A$ e $B$ è l'insieme di tutte le coppie con il primo elemento in $A$ e il secondo in $B$:
>   $$A \times B = \lbrace (a, b) : a \in A \land b \in B \rbrace \, .$$
>   Ad esempio, se $A = \lbrace 1, 2 \rbrace$ e $B = \lbrace a, b, c \rbrace$, allora $A \times B = \lbrace (1, a), (1, b), (1, c), (2, a), (2, b), (2, c) \rbrace$. Il piano cartesiano è $\mathbb{R} \times \mathbb{R} = \mathbb{R}^2$.
> - I **quantificatori**: $\forall$ si legge «per ogni», $\exists$ «esiste (almeno un)», $\exists!$ «esiste uno e un solo».

## Che cos'è una funzione

### Relazioni

Durante una gara di corsa campestre, un chip cronometrico associa a ogni atleta il suo tempo di arrivo. Al contrario, possiamo associare a ogni tempo di arrivo gli atleti che lo hanno ottenuto. In entrambi i casi stiamo collegando gli elementi di un insieme agli elementi di un altro: stiamo descrivendo una ***relazione***.

Un modo molto concreto (e molto formale) di descrivere una relazione tra un insieme $A$ e un insieme $B$ è elencare le coppie $(a, b)$ di elementi collegati: una relazione è quindi un sottoinsieme del prodotto cartesiano $A \times B$. Ad esempio, la relazione tra gli atleti $A = \lbrace \text{Anna}, \text{Bruno}, \text{Carla} \rbrace$ e i tempi (in minuti) è l'insieme di coppie

$$\lbrace (\text{Anna}, 12), (\text{Bruno}, 14), (\text{Carla}, 12) \rbrace \subseteq A \times \lbrace 12, 13, 14 \rbrace \, .$$

Non tutte le relazioni si comportano allo stesso modo. Nel diagramma ci sono tre relazioni dallo stesso insieme $A$ allo stesso insieme $B$.

*Prima di premere i pulsanti: in quali relazioni ogni elemento di $A$ ha esattamente una freccia?*

```sets
{
  "mapLabels": false,
  "sets": [
    { "id": "A", "elements": ["a_1", "a_2", "a_3"], "order": "given" },
    { "id": "B", "elements": ["b_1", "b_2", "b_3"], "order": "given" }
  ],
  "maps": [
    { "id": "f", "from": "A", "to": "B", "pairs": { "a_1": "b_1", "a_2": "b_2", "a_3": "b_2" }, "hidden": true },
    { "id": "g", "from": "A", "to": "B", "pairs": { "a_1": "b_1", "a_2": ["b_2", "b_3"], "a_3": "b_3" }, "hidden": true, "color": "blue" },
    { "id": "h", "from": "A", "to": "B", "pairs": { "a_1": "b_2", "a_3": "b_3" }, "hidden": true, "color": "purple" }
  ],
  "controls": [
    { "type": "reveal", "label": "Mostra f", "targets": ["arrows(f)", "properties(f)"] },
    { "type": "reveal", "label": "Mostra g", "targets": ["arrows(g)", "properties(g)"] },
    { "type": "reveal", "label": "Mostra h", "targets": ["arrows(h)", "properties(h)"] }
  ]
}
```

Si nota che:
- in $f$ ogni elemento di $A$ ha una e una sola freccia, anche se $a_2$ e $a_3$ hanno la stessa freccia d'arrivo e $b_3$ non è raggiunto da nessuno;
- in $g$ l'elemento $a_2$ ha due frecce: se lo mettiamo nella macchina, non sappiamo che cosa esce;
- in $h$ l'elemento $a_2$ non ha frecce: se lo mettiamo nella macchina, non esce nulla.

Solo $f$ è una funzione.

### La definizione di funzione

> **Definizione.** Dati due insiemi $A$ e $B$, una ***funzione*** da $A$ in $B$ è una relazione che associa **a ogni** elemento di $A$ **uno e un solo** elemento di $B$.
>
> L'insieme $A$ si chiama ***dominio***, l'insieme $B$ ***codominio***.

Con i quantificatori, una relazione $f \subseteq A \times B$ è una funzione se

$$\forall a \in A \;\; \exists!\, b \in B : (a, b) \in f \, .$$

L'elemento $b$ associato ad $a$ si indica con $f(a)$ e si chiama ***immagine*** di $a$ (è l'OUT corrispondente all'IN $a$). Per indicare una funzione si scrive

$$f \colon A \to B \, , \qquad x \mapsto f(x) \, ,$$

che si legge «$f$ da $A$ in $B$, che associa a $x$ l'elemento $f(x)$». La lettera $x$ è un segnaposto: $x \mapsto x^2$, $t \mapsto t^2$ e $\text{IN} \mapsto \text{IN}^2$ descrivono la stessa funzione.

Le due parti della definizione corrispondono ai due difetti di $h$ e di $g$:
- **a ogni** elemento: nessun IN resta senza OUT (il problema di $h$);
- **uno e un solo**: nessun IN ha due OUT (il problema di $g$).

È altrettanto importante notare che cosa la definizione **non** richiede:
- due IN diversi possono avere lo stesso OUT (in $f$, $a_2$ e $a_3$ vanno entrambi in $b_2$; nella gara, Anna e Carla arrivano entrambe in 12 minuti);
- non tutti gli elementi del codominio devono essere raggiunti (in $f$, nessuno va in $b_3$);
- non serve una formula.

**Esempi.**
- La relazione che associa a ogni giocatrice di una squadra di pallavolo il suo numero di maglia è una funzione. Anche quella che associa a ogni numero di maglia *indossato* la giocatrice che lo indossa è una funzione, perché in una squadra non ci sono due maglie uguali.
- La relazione che associa a ogni studente di una classe il gruppo di lavoro di cui fa parte è una funzione. Quella che associa a ogni gruppo i suoi componenti, invece, non lo è: un gruppo ha di solito più componenti.
- La relazione che associa a ogni cliente di un negozio online gli ordini che ha effettuato non è una funzione: un cliente può aver fatto più ordini, o nessuno. Nelle basi di dati si chiama relazione *uno a molti*.
- La relazione che associa a ogni istante $t$ la posizione $s(t)$ di un corpo è una funzione: un corpo non può trovarsi in due posti nello stesso istante.
- La relazione che associa a ogni numero reale $x$ il suo quadrato è una funzione, $f \colon \mathbb{R} \to \mathbb{R}$, $x \mapsto x^2$. Quella che associa a ogni numero reale $x \geq 0$ i numeri $y$ tali che $y^2 = x$ non lo è: a $4$ sono associati sia $2$ sia $-2$.

### Una funzione non è (necessariamente) una formula

Spesso si pensa a una funzione come a una formula, come $f(x) = x^2 - 3x$, oppure come a una curva "bella", senza salti. Molte funzioni importanti però non sono di questo tipo: il numero di maglia, il tempo di arrivo, la tariffa di un parcheggio che si paga per ogni ora iniziata. La definizione chiede solo che a ogni IN corrisponda esattamente un OUT, non importa come.

> [!DETAILS] Un po' di storia
>
> Per Eulero (*Introductio in analysin infinitorum*, 1748) una funzione era un'*espressione analitica*: una formula costruita con numeri, variabili e operazioni. Nel corso dell'Ottocento, studiando le serie di Fourier, i matematici si accorsero che servivano funzioni molto più generali. Dirichlet propose di considerare funzione qualunque corrispondenza che associ a ogni $x$ un solo valore $y$, anche senza una formula, e costruì un esempio che nessuno avrebbe saputo disegnare: la funzione che vale $1$ sui numeri razionali e $0$ sugli irrazionali. Nel Novecento, con la teoria degli insiemi, si arrivò alla definizione che usiamo oggi: una funzione *è* un insieme di coppie, con la proprietà che ogni elemento del dominio compare come primo elemento di una e una sola coppia.

### Funzioni e codice

Nei linguaggi di programmazione si parla di *funzioni*, ma non sempre sono funzioni nel senso matematico. In Python:

```python
def f(x):
    return x**2

f(3)    # 9, e ogni volta che scrivo f(3) ottengo 9
```

Questa è una funzione anche per un matematico: lo stesso IN dà sempre lo stesso OUT. Invece

```python
import random
random.random()    # 0.8444..., poi 0.7579..., poi 0.4205...
```

non lo è: con lo stesso IN (nessun argomento) restituisce ogni volta un OUT diverso.

Un *dizionario* di Python, invece, è proprio una funzione da un insieme finito (le chiavi) in un altro:

```python
maglia = {"Anna": 7, "Bea": 10, "Carla": 4}
maglia["Bea"]      # 10
maglia["Bea"] = 12 # la chiave "Bea" non può avere due valori: 10 viene sostituito
```

Un dizionario non può associare due valori alla stessa chiave: la condizione «uno e un solo» è scritta nella struttura dei dati. E una relazione *uno a molti*, come cliente → ordini? In Python si scrive `{"Anna": [101, 107], "Bruno": []}`: ora a ogni cliente è associato un solo oggetto, la *lista* dei suoi ordini (eventualmente vuota). La relazione è diventata una funzione cambiando il codominio: non più gli ordini, ma gli *insiemi* di ordini.

## Dominio, codominio, immagine, controimmagine

### Immagine di un elemento e di un insieme

Data $f \colon A \to B$, abbiamo già chiamato $f(a)$ l'immagine di $a$. Se $b = f(a)$, si dice anche che $a$ è una ***controimmagine*** di $b$.

$$a \;\xmapsto{\;\; f \;\;}\; b = f(a) \qquad \begin{array}{l} b \text{ è l'immagine di } a \\ a \text{ è una controimmagine di } b \end{array}$$

Un elemento ha **una sola** immagine (è la definizione di funzione), ma può avere **nessuna, una o più** controimmagini.

Possiamo mettere nella macchina anche un intero sottoinsieme $X \subseteq A$ e raccogliere tutte le uscite:

$$f(X) \triangleq \lbrace f(x) : x \in X \rbrace = \lbrace b \in B : \exists\, x \in X : f(x) = b \rbrace \, .$$

Il simbolo $\triangleq$ si legge «è uguale per definizione». Quando $X$ è tutto il dominio si ottiene l'insieme di tutti gli OUT possibili.

> **Definizione.** L'***immagine*** (o insieme immagine) di $f \colon A \to B$ è l'insieme
> $$f(A) = \textrm{im}\, f \triangleq \lbrace b \in B : \exists\, a \in A : f(a) = b \rbrace \subseteq B \, .$$

Il **codominio** e l'**immagine** sono due cose diverse:
- il codominio $B$ è l'insieme degli OUT *ammessi*, che scegliamo noi quando definiamo la funzione;
- l'immagine $f(A)$ è l'insieme degli OUT *effettivamente ottenuti*, che dipende da $f$ e va calcolata.

Ad esempio, se $f$ associa a ogni persona di un gruppo la sua data di nascita, il codominio può essere l'insieme di tutte le date del calendario; l'immagine è l'insieme delle date in cui è effettivamente nato qualcuno del gruppo.

### Controimmagine di un elemento e di un insieme

Il percorso inverso: partiamo da un OUT, o da un insieme di OUT, e cerchiamo gli IN che li producono.

> **Definizione.** La ***controimmagine*** di un sottoinsieme $Y \subseteq B$ è l'insieme
> $$f^{-1}(Y) \triangleq \lbrace a \in A : f(a) \in Y \rbrace \subseteq A \, .$$
> La controimmagine di un elemento $b$ è $f^{-1}(\lbrace b \rbrace) = \lbrace a \in A : f(a) = b \rbrace$, che si scrive spesso $f^{-1}(b)$.

La controimmagine è sempre un **insieme**, eventualmente vuoto. Attenzione al simbolo: $f^{-1}(Y)$ ha senso per **ogni** funzione $f$. Non vuol dire $\frac{1}{f}$, e non presuppone che esista la funzione inversa, che incontreremo più avanti.

*Prima di premere i pulsanti: qual è l'immagine di $f$? Qual è la controimmagine di $b$? E quella di $g$?*

```sets
{
  "sets": [
    { "id": "A", "elements": ["a", "c", "e", "o"], "order": "given" },
    { "id": "B", "elements": ["b", "d", "g"], "order": "given" }
  ],
  "maps": [{ "id": "f", "from": "A", "to": "B", "pairs": { "a": "b", "c": "b", "e": "d", "o": "d" } }],
  "highlights": [
    { "of": "image(f)", "label": "f(A)", "hidden": true, "id": "im" },
    { "of": "preimage(f, b)", "label": "f^{-1}(b)", "color": "blue", "hidden": true, "id": "pb" },
    { "of": "preimage(f, g)", "label": "f^{-1}(g)", "color": "purple", "hidden": true, "id": "pg" },
    { "of": "image(f, {a, e})", "label": "f(\\lbrace a, e \\rbrace)", "color": "orange", "hidden": true, "id": "iae" }
  ],
  "controls": [
    { "type": "reveal", "label": "Immagine f(A)", "targets": ["im"] },
    { "type": "reveal", "label": "Immagine di {a, e}", "targets": ["iae"] },
    { "type": "reveal", "label": "Controimmagine di b", "targets": ["pb"] },
    { "type": "reveal", "label": "Controimmagine di g", "targets": ["pg"] }
  ]
}
```

Si nota che $f(A) = \lbrace b, d \rbrace \neq B$, che $f^{-1}(b) = \lbrace a, c \rbrace$ ha due elementi e che $f^{-1}(g) = \emptyset$: $g$ è nel codominio ma non nell'immagine.

### Immagine e controimmagine sulla retta reale

Lo stesso accade con insiemi infiniti. Consideriamo $f(x) = x^2$ dall'intervallo $[-2, 2]$ all'intervallo $[-1, 4]$. Con lo slider $k$ scegli un OUT: la retta orizzontale $y = k$ taglia il grafico nei punti che hanno OUT uguale a $k$, cioè nella controimmagine di $k$. Con $a$ e $b$ scegli un intervallo di IN: in viola c'è la sua immagine.

*Prima di muovere gli slider: per quali $k$ la controimmagine è vuota? Per quali ha un solo elemento? E qual è l'immagine di $[-1, 2]$?*

```sets
{
  "layout": "column",
  "sets": [{ "id": "X", "interval": "[-2, 2]" }, { "id": "Y", "interval": "[-1, 4]" }],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "x^2" }],
  "params": {
    "k": { "min": -1, "max": 4, "step": 0.05, "val": 1 },
    "a": { "min": -2, "max": 2, "step": 0.1, "val": -1 },
    "b": { "min": -2, "max": 2, "step": 0.1, "val": 2 }
  },
  "show": ["preimage(f, k)"],
  "highlights": [{ "of": "image(f, [a, b])", "color": "purple", "label": "f([a, b])" }],
  "plot": { "maps": ["f"], "lines": [{ "y": "k" }] }
}
```

Si nota che:
- per $k < 0$ la controimmagine è vuota, per $k = 0$ ha un solo elemento, per $0 < k \leq 4$ ne ha due;
- l'immagine di tutto il dominio è $f([-2, 2]) = [0, 4]$, che non coincide con il codominio $[-1, 4]$;
- l'immagine di $[-1, 2]$ è $[0, 4]$, e non $[1, 4]$: il minimo non si trova necessariamente in un estremo dell'intervallo, ma dove la funzione "gira", cioè in $x = 0$.

L'ultima osservazione dice una cosa importante: per trovare l'immagine di un intervallo non basta calcolare la funzione negli estremi.

## Funzioni reali di variabile reale

> **Definizione.** Una funzione $f \colon D \to \mathbb{R}$, con $D \subseteq \mathbb{R}$, si chiama ***funzione reale di variabile reale***: IN e OUT sono numeri reali.

Sono le funzioni che si studiano in fisica (la posizione in funzione del tempo, la temperatura in funzione della quota) e quelle che si possono rappresentare nel piano cartesiano. Spesso sono date con un'espressione, come $f(x) = \sqrt{x - 2} + 2$, senza dire qual è il dominio.

### Il dominio naturale

Quando il dominio non è indicato, si intende il più grande sottoinsieme di $\mathbb{R}$ in cui l'espressione ha senso, cioè produce un numero reale: il ***dominio naturale*** (o *insieme di esistenza*). Per determinarlo si scrivono le **condizioni di esistenza** (C.E.):

| nell'espressione compare… | condizione |
| :--- | :--- |
| una frazione $\dfrac{N(x)}{D(x)}$ | $D(x) \neq 0$ |
| una radice di indice pari $\sqrt[2n]{R(x)}$ | $R(x) \geq 0$ |
| un logaritmo $\log_a A(x)$ | $A(x) > 0$ |

**Esempio.** Sia $f(x) = \sqrt{x - 2} + 2$. L'unica condizione riguarda la radice: $x - 2 \geq 0$, cioè $x \geq 2$. Quindi $\textrm{dom}\, f = [2, +\infty)$. Nel diagramma il dominio naturale è evidenziato sulla retta degli IN e sull'asse $x$ del grafico: trascina il punto fuori dal dominio e osserva che cosa succede.

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "\\mathbb{R}", "interval": "R", "window": [-2, 8] },
    { "id": "Y", "label": "\\mathbb{R}", "interval": "R", "window": [-2, 8] }
  ],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "sqrt(x - 2) + 2" }],
  "params": { "p": { "min": -2, "max": 8, "step": 0.05, "val": 4, "label": "x" } },
  "probe": { "map": "f", "at": "p" },
  "show": ["domain(f)"],
  "plot": { "maps": ["f"] }
}
```

Lo stesso accade in Python: la funzione esiste solo dove ha senso calcolarla.

```python
from math import sqrt

def f(x):
    return sqrt(x - 2) + 2

f(6)    # 4.0
f(1)    # ValueError: math domain error
```

**Il dominio fa parte della funzione.** Le funzioni $f(x) = x$ e $g(x) = \dfrac{x^2}{x}$ danno lo stesso OUT per ogni $x \neq 0$, ma non sono la stessa funzione: $\textrm{dom}\, f = \mathbb{R}$, mentre $\textrm{dom}\, g = \mathbb{R} \setminus \lbrace 0 \rbrace$. Il grafico di $g$ è una retta "bucata" nell'origine. Due funzioni sono uguali quando hanno lo stesso dominio e lo stesso OUT per ogni IN.

### Funzioni definite a tratti

Una funzione può usare formule diverse su parti diverse del dominio. La conosciamo già: il valore assoluto, cioè la distanza di $x$ da $0$,

$$\lvert x \rvert = \begin{cases} x & \text{se } x \geq 0 \\ -x & \text{se } x < 0 \end{cases}$$

Nel diagramma la chiamiamo $v$, cioè $v(x) = \lvert x \rvert$. Un'unica funzione, due formule: per ogni IN si usa **una sola** delle due righe, quella la cui condizione è vera. Le condizioni dividono il dominio in pezzi che non si sovrappongono e lo ricoprono tutto: è proprio quello che serve perché a ogni IN corrisponda esattamente un OUT.

*Prima di trascinare: che cosa fanno le frecce a sinistra di $0$? E a destra?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "\\mathbb{R}", "interval": "R", "window": [-3, 3] },
    { "id": "Y", "label": "\\mathbb{R}", "interval": "R", "window": [-3, 3] }
  ],
  "maps": [{ "id": "v", "from": "X", "to": "Y", "piecewise": [
    { "on": "[0, +inf)", "expr": "x" },
    { "on": "(-inf, 0)", "expr": "-x" }
  ] }],
  "params": { "p": { "min": -3, "max": 3, "step": 0.05, "val": -1.5, "label": "x" } },
  "probe": { "map": "v", "at": "p", "trace": true },
  "plot": { "maps": ["v"] }
}
```

Per $x \geq 0$ le frecce scendono dritte (l'OUT è uguale all'IN), per $x < 0 $ si incrociano e vanno dall'altra parte dello zero (l'OUT è l'opposto dell'IN).

I pezzi non devono necessariamente "attaccarsi". La funzione ***segno*** dice soltanto se un numero è positivo, negativo o nullo:

$$\operatorname{sgn}(x) = \begin{cases} -1 & \text{se } x < 0 \\ 0 & \text{se } x = 0 \\ 1 & \text{se } x > 0 \end{cases}$$

Il suo grafico è fatto di due semirette e di un punto isolato. I pallini vuoti indicano i punti che **non** appartengono al grafico, quello pieno il punto che vi appartiene: in $x = 0$ l'OUT è $0$, non $1$ né $-1$.

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
  "highlights": [{ "of": "preimage(sgn, 1)", "label": "\\operatorname{sgn}^{-1}(1)", "hidden": true, "id": "p1" }],
  "controls": [{ "type": "reveal", "label": "Controimmagine di 1", "targets": ["p1"] }],
  "plot": { "maps": ["sgn"], "xlim": [-3, 3], "ylim": [-2, 2] }
}
```

In Python una funzione definita a tratti è un `if`: per ogni IN si esegue un solo ramo.

```python
def sgn(x):
    if x < 0:
        return -1
    elif x == 0:
        return 0
    else:
        return 1
```

Le funzioni definite a tratti torneranno più avanti, quando studieremo come si trasforma un grafico: $\lvert f(x) \rvert$ e $f(\lvert x \rvert)$ sono a loro volta funzioni definite a tratti.

## Il grafico di una funzione

All'inizio abbiamo descritto una relazione elencando le coppie di elementi collegati. Una funzione è una relazione particolare, quindi anche lei è un insieme di coppie: le coppie (IN, OUT).

> **Definizione.** Il ***grafico*** di una funzione $f \colon A \to B$ è l'insieme
> $$G_f \triangleq \lbrace (x, f(x)) : x \in A \rbrace = \lbrace (x, y) \in A \times B : y = f(x) \rbrace \subseteq A \times B \, .$$

Possiamo disegnare il prodotto cartesiano $A \times B$ come una griglia: gli elementi di $A$ in orizzontale, quelli di $B$ in verticale, un puntino per ogni coppia. Il grafico è l'insieme dei punti evidenziati. I due diagrammi descrivono la stessa funzione: passa con il mouse sugli elementi di $A$, nell'uno o nell'altro.

```sets
{
  "sync": "grafico",
  "sets": [
    { "id": "A", "elements": ["1", "2", "3", "4"], "order": "given" },
    { "id": "B", "elements": ["a", "b", "c"], "order": "given" }
  ],
  "maps": [{ "id": "f", "from": "A", "to": "B", "pairs": { "1": "b", "2": "a", "3": "b", "4": "c" } }]
}
```

```sets
{
  "sync": "grafico",
  "layout": "product",
  "sets": [
    { "id": "A", "elements": ["1", "2", "3", "4"], "order": "given" },
    { "id": "B", "elements": ["a", "b", "c"], "order": "given" }
  ],
  "maps": [{ "id": "f", "from": "A", "to": "B", "pairs": { "1": "b", "2": "a", "3": "b", "4": "c" } }],
  "product": { "map": "f" }
}
```

La condizione «a ogni elemento di $A$ uno e un solo elemento di $B$» diventa una condizione sulle **colonne** della griglia: **in ogni colonna c'è esattamente un punto**. Ecco invece una relazione che non è una funzione. *Prima di passare sulle colonne: quali colonne non vanno bene, e perché?*

```sets
{
  "layout": "product",
  "sets": [
    { "id": "A", "elements": ["1", "2", "3", "4"], "order": "given" },
    { "id": "B", "elements": ["a", "b", "c"], "order": "given" }
  ],
  "maps": [{ "id": "r", "from": "A", "to": "B", "pairs": { "1": "b", "2": ["a", "c"], "4": "c" } }],
  "product": { "map": "r" },
  "show": ["properties(r)"]
}
```

La colonna di $2$ ha due punti (due OUT per lo stesso IN), quella di $3$ nessuno (un IN senza OUT).

### Il grafico di una funzione reale

Per una funzione reale di variabile reale il prodotto cartesiano è $\mathbb{R} \times \mathbb{R} = \mathbb{R}^2$, il piano cartesiano, e il grafico è l'insieme dei punti $(x, f(x))$: il ***grafico cartesiano*** che conosciamo. Le colonne della griglia diventano le rette verticali.

**Test della retta verticale.** Un sottoinsieme del piano è il grafico di una funzione (definita sull'insieme delle ascisse dei suoi punti) se e solo se **ogni retta verticale lo interseca al più in un punto**.

La parabola "coricata" $x = y^2$ non è il grafico di una funzione: a ogni $x > 0$ corrispondono due valori, $y = \sqrt{x}$ e $y = -\sqrt{x}$. *Prima di trascinare: in quanti punti la retta $x = p$ taglia la curva per $p > 0$? E per $p = 0$?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "x", "interval": "[0, 4]" },
    { "id": "Y", "label": "y", "interval": "[-2, 2]" }
  ],
  "maps": [
    { "id": "s", "from": "Y", "to": "X", "expr": "x^2", "hidden": true },
    { "id": "r", "label": "r", "inverse": "s", "samples": 5 }
  ],
  "params": { "p": { "min": 0, "max": 4, "step": 0.05, "val": 1, "label": "p" } },
  "probe": { "map": "r", "at": "p" },
  "show": ["properties(r)"],
  "plot": { "maps": ["r"], "lines": [{ "x": "p" }] }
}
```

Nel dynagraph si vede la stessa cosa da un altro punto di vista: da ogni $x > 0$ partono **due** frecce.

## Rappresentare una funzione

Una stessa funzione si può rappresentare in molti modi diversi, che si chiamano anche *registri*. Prendiamo $f(x) = x^2 - 2x$.

- **A parole**: la funzione che associa a ogni numero reale la differenza tra il suo quadrato e il suo doppio.
- **Con una formula**: $f \colon \mathbb{R} \to \mathbb{R}$, $f(x) = x^2 - 2x = x(x - 2)$.
- **Con una tabella IN/OUT**, che elenca alcune coppie (IN, OUT).
- **Con un diagramma a frecce** o con un ***dynagraph***: due rette parallele, la retta degli IN e la retta degli OUT, con una freccia da ogni IN al suo OUT.
- **Con il grafico cartesiano**: gli stessi IN e OUT, ma su due rette perpendicolari, con un punto $(x, f(x))$ per ogni coppia.
- **Con il codice**: `def f(x): return x**2 - 2*x`.

Nel diagramma trovi la tabella, il dynagraph e il grafico insieme. Passa con il mouse su una riga della tabella: si accendono la sua freccia e il suo punto. L'ultima riga segue il punto arancione.

*Prima di trascinare: due IN diversi possono avere lo stesso OUT? Quali? Dove "si ripiegano" le frecce?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "\\text{IN}", "interval": "R", "window": [-2, 4] },
    { "id": "Y", "label": "\\text{OUT}", "interval": "R", "window": [-2, 4] }
  ],
  "maps": [{ "id": "f", "from": "X", "to": "Y", "expr": "x^2 - 2x", "samples": [] }],
  "params": { "p": { "min": -1.5, "max": 3.5, "step": 0.05, "val": 2.5, "label": "x" } },
  "probe": { "map": "f", "at": "p", "trace": true },
  "table": { "maps": ["f"], "in": [-1, 0, 1, 2, 3], "probe": true, "headers": ["\\text{IN}", "\\text{OUT}"], "position": "below" },
  "plot": { "maps": ["f"], "position": "right", "xlim": [-2, 4], "ylim": [-2, 4] }
}
```

Le frecce di $-1$ e di $3$ arrivano nello stesso punto, $3$; lo stesso fanno quelle di $0$ e di $2$, che arrivano in $0$. Il dynagraph "si ripiega" attorno a $x = 1$: è il punto medio tra gli zeri $0$ e $2$, l'ascissa del vertice della parabola, e il suo OUT, $f(1) = -1$, è il più piccolo.

Nessun registro dice tutto. Ognuno mette in evidenza alcune proprietà e ne nasconde altre, e capire una funzione vuol dire soprattutto **saper passare da un registro all'altro**.

| registro | che cosa si vede bene | che cosa si vede male (o non si vede) |
| :--- | :--- | :--- |
| parole | il significato, il contesto | i valori precisi |
| formula | come calcolare qualunque OUT; il dominio naturale; gli zeri, se si sa scomporre | l'andamento complessivo |
| tabella IN/OUT | i valori esatti di alcuni IN | che cosa succede tra un IN e l'altro: una tabella non dice nulla sugli IN che non elenca |
| frecce, dynagraph | IN e OUT separati; come si muove l'OUT quando si muove l'IN; due IN con lo stesso OUT; dove le frecce si ripiegano o si allargano | la forma complessiva, quando le frecce sono tante |
| grafico cartesiano | l'andamento complessivo: zeri, segno, minimi e massimi, crescenza | i valori esatti; che cosa succede fuori dalla finestra disegnata |
| codice | calcolare molti valori, automaticamente | le proprietà generali |

Attenzione al passaggio dalla tabella al grafico: unendo i punti della tabella con una linea si fa un'**ipotesi** su che cosa succede tra un IN e l'altro. Con i valori della tabella qui sopra, una spezzata e la parabola passano per gli stessi punti.

## Funzioni iniettive, suriettive, biiettive

Una funzione associa a ogni IN un solo OUT, ma non dice nulla su quante volte un OUT viene raggiunto. Contare le **controimmagini** degli elementi del codominio porta a tre definizioni.

### Iniettività

> **Definizione.** Una funzione $f \colon A \to B$ è ***iniettiva*** (o è un'***iniezione***) se a IN diversi corrispondono OUT diversi:
> $$\forall a_1, a_2 \in A : \; a_1 \neq a_2 \implies f(a_1) \neq f(a_2) \, .$$

In modo equivalente (con la *contronominale*: $p \implies q$ equivale a $\lnot q \implies \lnot p$):

$$\forall a_1, a_2 \in A : \; f(a_1) = f(a_2) \implies a_1 = a_2 \, ,$$

cioè: se due IN hanno lo stesso OUT, allora sono lo stesso IN. Ogni elemento del codominio ha **al più una** controimmagine. La seconda forma è quella che si usa per dimostrare che una funzione è iniettiva.

**Esempio.** $f \colon \mathbb{R} \to \mathbb{R}$, $f(x) = 2x + 5$, è iniettiva. Infatti, se $f(x_1) = f(x_2)$, allora $2x_1 + 5 = 2x_2 + 5$, quindi $2x_1 = 2x_2$ e $x_1 = x_2$.

Per dimostrare che una funzione **non** è iniettiva basta la negazione della definizione: esistono due IN diversi con lo stesso OUT,

$$\exists\, a_1, a_2 \in A : \; a_1 \neq a_2 \land f(a_1) = f(a_2) \, .$$

Basta quindi un controesempio: $g(x) = x^2$ non è iniettiva su $\mathbb{R}$, perché $g(-1) = g(1)$.

### Suriettività

> **Definizione.** Una funzione $f \colon A \to B$ è ***suriettiva*** (o è una ***suriezione***) se ogni elemento del codominio è un OUT:
> $$\forall b \in B \;\; \exists\, a \in A : f(a) = b \, ,$$
> cioè se $f(A) = B$.

Ogni elemento del codominio ha **almeno una** controimmagine. Detto con le equazioni: $f$ è suriettiva se l'equazione $f(x) = k$, nell'incognita $x$, ha almeno una soluzione **per ogni** $k \in B$.

**Esempio.** $f \colon \mathbb{R} \to \mathbb{R}$, $f(x) = 2x + 5$, è suriettiva: per ogni $k \in \mathbb{R}$ l'equazione $2x + 5 = k$ ha la soluzione $x = \frac{k - 5}{2}$. Invece $g \colon \mathbb{R} \to \mathbb{R}$, $g(x) = x^2$, non è suriettiva: $x^2 = -1$ non ha soluzioni reali, cioè $-1$ non ha controimmagini.

### Biiettività

> **Definizione.** Una funzione è ***biiettiva*** (o è una ***biiezione***, o una *corrispondenza biunivoca*) se è sia iniettiva sia suriettiva:
> $$\forall b \in B \;\; \exists!\, a \in A : f(a) = b \, .$$

Ogni elemento del codominio ha **esattamente una** controimmagine. Riassumendo:

| $f$ è… | ogni $b \in B$ ha… | la retta $y = k$, per ogni $k \in B$, taglia il grafico… |
| :--- | :--- | :--- |
| iniettiva | al più una controimmagine | al più una volta |
| suriettiva | almeno una controimmagine | almeno una volta |
| biiettiva | esattamente una controimmagine | esattamente una volta |

L'ultima colonna è il ***test della retta orizzontale***: le controimmagini di $k$ sono le ascisse dei punti in cui la retta $y = k$ taglia il grafico. È il "gemello" del test della retta verticale: quello controlla gli IN (è una funzione?), questo controlla gli OUT.

Nel diagramma, $f$ è iniettiva ma non suriettiva, $g$ è suriettiva ma non iniettiva. *Prima di guardare il riquadro delle proprietà: si potrebbe costruire una funzione suriettiva da $A$ (tre elementi) in $B$ (quattro elementi)? E una iniettiva da $B$ in $C$?*

```sets
{
  "sets": [
    { "id": "A", "elements": ["1", "2", "3"], "order": "given" },
    { "id": "B", "elements": ["a", "b", "c", "d"], "order": "given" },
    { "id": "C", "elements": ["x", "y", "z"], "order": "given" }
  ],
  "maps": [
    { "id": "f", "from": "A", "to": "B", "pairs": { "1": "a", "2": "b", "3": "d" } },
    { "id": "g", "from": "B", "to": "C", "pairs": { "a": "x", "b": "y", "c": "y", "d": "z" }, "color": "blue" }
  ],
  "show": ["properties(f)", "properties(g)", "collisions(g)"]
}
```

### Dipende dal dominio e dal codominio

La stessa legge $x \mapsto x^2$ può dare funzioni iniettive o no, suriettive o no: dipende da dove prendiamo gli IN e da quali OUT ammettiamo. Con gli slider scegli il dominio $[a, 2]$ e il codominio $[c, 4]$; con $k$ muovi la retta orizzontale.

*Prima di muovere gli slider: come devi scegliere $a$ perché $f$ sia iniettiva? E $c$, perché sia suriettiva?*

```sets
{
  "layout": "column",
  "sets": [{ "id": "D", "interval": "[a, 2]" }, { "id": "C", "interval": "[c, 4]" }],
  "maps": [{ "id": "f", "from": "D", "to": "C", "expr": "x^2" }],
  "params": {
    "a": { "min": -2, "max": 1.5, "step": 0.1, "val": -1 },
    "c": { "min": -1, "max": 3, "step": 0.1, "val": -1 },
    "k": { "min": -1, "max": 4, "step": 0.05, "val": 0.5 }
  },
  "show": ["image(f)", "properties(f)", "preimage(f, k)"],
  "plot": { "maps": ["f"], "lines": [{ "y": "k" }, { "y": "c", "dash": false, "color": "gray" }], "xlim": [-2.2, 2.2], "ylim": [-1.2, 4.4] }
}
```

Si nota che:
- $f$ è iniettiva quando il dominio non contiene numeri opposti, cioè per $a \geq 0$;
- $f$ è suriettiva quando il codominio coincide con l'immagine: per $a \leq 0$ l'immagine è $[0, 4]$, e serve $c = 0$;
- con $a = 0$ e $c = 0$, cioè $f \colon [0, 2] \to [0, 4]$, la funzione è biiettiva.

L'iniettività dipende dalla legge e dal dominio. La suriettività dipende **anche dal codominio**: ogni funzione diventa suriettiva se restringiamo il codominio alla sua immagine, cioè se la consideriamo come $f \colon A \to f(A)$.

> [!DETAILS] Ma allora perché non si sceglie sempre l'immagine come codominio?
>
> Per due ragioni. La prima è che spesso l'immagine non si conosce, o è molto difficile da determinare. Pensiamo alla funzione che associa a ogni istante la posizione di una particella di gas in un contenitore: il codominio naturale è l'insieme dei punti del contenitore, mentre l'immagine, cioè l'insieme dei punti in cui la particella è effettivamente passata, è praticamente impossibile da calcolare.
>
> La seconda ragione è che la domanda «$f \colon A \to B$ è suriettiva?» è interessante proprio perché il codominio è fissato: vuol dire «l'equazione $f(x) = k$ ha sempre soluzione, qualunque sia $k \in B$?». Ad esempio, chiedersi se $x \mapsto x^3 + x$ è suriettiva da $\mathbb{R}$ in $\mathbb{R}$ vuol dire chiedersi se ogni equazione di terzo grado della forma $x^3 + x = k$ ha una soluzione reale.

## Biiezioni e cardinalità

### Contare è costruire una biiezione

Quando contiamo i banchi di un'aula, indichiamo il primo e diciamo «uno», il secondo e diciamo «due», e così via, senza saltarne nessuno e senza contarne uno due volte. Stiamo costruendo una biiezione tra l'insieme dei banchi e l'insieme $\lbrace 1, 2, \ldots, n \rbrace$: se l'ultimo numero pronunciato è $24$, i banchi sono $24$.

Due insiemi finiti hanno lo stesso numero di elementi se e solo se esiste una biiezione tra di essi. E se il numero è diverso?

- Se $A$ ha **più** elementi di $B$, nessuna funzione $A \to B$ è iniettiva: almeno due elementi di $A$ devono avere la stessa immagine. È il ***principio dei cassetti*** (o *della piccionaia*): se si mettono $11$ calzini in $10$ cassetti, almeno un cassetto contiene due calzini.
- Se $A$ ha **meno** elementi di $B$, nessuna funzione $A \to B$ è suriettiva: qualche elemento di $B$ resta senza controimmagine.

È quello che abbiamo visto nel diagramma con gli insiemi $A$, $B$ e $C$: con tre elementi non si raggiungono tutti e quattro gli elementi di $B$, e quattro elementi non possono andare in tre senza che due si "scontrino". Ne segue anche che, tra due insiemi finiti con lo stesso numero di elementi, una funzione è iniettiva se e solo se è suriettiva.

### Insiemi infiniti

Con gli insiemi infiniti non possiamo contare fino all'ultimo elemento, ma possiamo ancora chiederci se esiste una biiezione. È l'idea di Georg Cantor (seconda metà dell'Ottocento):

> **Definizione.** Due insiemi $A$ e $B$ hanno la stessa ***cardinalità*** (lo stesso "numero di elementi", anche se infinito) se esiste una biiezione $f \colon A \to B$.

Le conseguenze sono sorprendenti. Già Galileo, nel 1638, aveva notato che i quadrati perfetti $0, 1, 4, 9, 16, \ldots$ si possono mettere in corrispondenza uno a uno con i numeri naturali ($n \mapsto n^2$), anche se "sembrano" molti meno. Lo stesso accade con i numeri pari: $n \mapsto 2n$ è una biiezione da $\mathbb{N}$ all'insieme $2\mathbb{N}$ dei pari. *Prima di trascinare: c'è un numero pari che non viene raggiunto?*

```sets
{
  "dynagraph": true,
  "sets": [
    { "id": "N", "integers": "N", "window": [0, 10] },
    { "id": "P", "integers": "2N", "window": [0, 20] }
  ],
  "maps": [{ "id": "d", "from": "N", "to": "P", "expr": "2x", "claims": { "surjective": true } }],
  "params": { "n": { "min": 0, "max": 10, "step": 1, "val": 3, "label": "n" } },
  "probe": { "map": "d", "at": "n" },
  "show": ["properties(d)"]
}
```

L'insieme dei pari è una **parte** di $\mathbb{N}$, eppure ha la stessa cardinalità di $\mathbb{N}$. Per gli insiemi finiti è impossibile: una parte propria ha sempre meno elementi del tutto. Per gli insiemi infiniti, invece, il tutto non è necessariamente "più grande" di una sua parte.

Il cosiddetto ***albergo di Hilbert*** ha infinite stanze, numerate $0, 1, 2, \ldots$, tutte occupate. Arriva un nuovo ospite: il portiere chiede a ogni cliente di spostarsi dalla stanza $n$ alla stanza $n + 1$, e la stanza $0$ si libera. La funzione $n \mapsto n + 1$ è iniettiva (nessuno finisce nella stessa stanza di un altro) ma non suriettiva (nessuno va nella stanza $0$). Al contrario, $n \mapsto \lfloor n/2 \rfloor$ (la parte intera di $n/2$) è suriettiva ma non iniettiva: ogni naturale è raggiunto, due volte.

```sets
{
  "dynagraph": true,
  "sets": [
    { "id": "A", "integers": "N", "window": [0, 10] },
    { "id": "B", "integers": "N", "window": [0, 10] },
    { "id": "C", "integers": "N", "window": [0, 10] }
  ],
  "maps": [
    { "id": "s", "from": "A", "to": "B", "expr": "x + 1", "claims": { "surjective": false } },
    { "id": "h", "from": "B", "to": "C", "expr": "floor(x/2)", "color": "orange", "claims": { "surjective": true } }
  ],
  "show": ["properties(s)", "properties(h)", "preimage(s, 0)"]
}
```

Anche gli interi relativi, che "sembrano" il doppio dei naturali, hanno la stessa cardinalità di $\mathbb{N}$. Basta metterli in fila così: $0, -1, 1, -2, 2, -3, \ldots$, cioè mandare i non negativi nei pari e i negativi nei dispari.

$$z(n) = \begin{cases} 2n & \text{se } n \geq 0 \\ -2n - 1 & \text{se } n < 0 \end{cases}$$

*Prima di trascinare: dove va $-3$? Quale intero va in $7$?*

```sets
{
  "dynagraph": true,
  "sets": [
    { "id": "Z", "integers": "Z", "window": [-5, 5] },
    { "id": "N", "integers": "N", "window": [0, 10] }
  ],
  "maps": [{ "id": "z", "from": "Z", "to": "N", "piecewise": [{ "if": "x >= 0", "expr": "2x" }, { "expr": "-2x - 1" }], "claims": { "surjective": true } }],
  "params": { "n": { "min": -5, "max": 5, "step": 1, "val": -2, "label": "n" } },
  "probe": { "map": "z", "at": "n" },
  "show": ["properties(z)"]
}
```

Gli insiemi che hanno la stessa cardinalità di $\mathbb{N}$, cioè i cui elementi si possono "mettere in fila", si dicono ***numerabili***. Sono numerabili $2\mathbb{N}$, $\mathbb{Z}$ e, con un po' più di ingegno, anche $\mathbb{Q}$. Cantor dimostrò invece che $\mathbb{R}$ **non** è numerabile: esistono infiniti "più grandi" di altri.

Anche un segmento ha "tanti punti quanti" un'intera retta. La funzione

$$g \colon (0, 1) \to \mathbb{R} \, , \qquad g(x) = \frac{2x - 1}{x(1 - x)}$$

è una biiezione: quando $x$ si avvicina a $0$ l'OUT diventa negativo e grandissimo in valore assoluto, quando si avvicina a $1$ diventa grandissimo e positivo, e nel mezzo cresce senza mai tornare indietro.

```sets
{
  "dynagraph": { "scale": "own" },
  "sets": [
    { "id": "I", "interval": "(0, 1)" },
    { "id": "R", "label": "\\mathbb{R}", "interval": "R", "window": [-10, 10] }
  ],
  "maps": [{ "id": "g", "from": "I", "to": "R", "expr": "(2x - 1)/(x*(1 - x))", "claims": { "injective": true, "surjective": true } }],
  "params": { "p": { "min": 0.02, "max": 0.98, "step": 0.01, "val": 0.7, "label": "x" } },
  "probe": { "map": "g", "at": "p", "trace": true },
  "plot": { "maps": ["g"], "xlim": [-0.2, 1.2], "ylim": [-10, 10] }
}
```

Altre domande di questo tipo (ad esempio: $[0, 1]$ e $(0, 1)$ hanno la stessa cardinalità?) si trovano negli esercizi.

## La funzione inversa

### La definizione

Se una funzione è biiettiva, ogni OUT proviene da esattamente un IN. Possiamo quindi far funzionare la macchina "al contrario": inserire l'OUT e risalire all'IN.

> **Definizione.** Sia $f \colon A \to B$ biiettiva. La ***funzione inversa*** di $f$ è la funzione $f^{-1} \colon B \to A$ che associa a ogni $b \in B$ l'unico $a \in A$ tale che $f(a) = b$:
> $$f^{-1}(b) = a \iff f(a) = b \, .$$
> Una funzione che ha l'inversa si dice ***invertibile***.

Servono entrambe le proprietà:
- **iniettiva**, perché ogni $b$ abbia **una sola** controimmagine (altrimenti $f^{-1}$ avrebbe due OUT per lo stesso IN e non sarebbe una funzione);
- **suriettiva**, perché ogni $b$ abbia **almeno una** controimmagine (altrimenti $f^{-1}$ non sarebbe definita su tutto $B$).

L'inversa scambia i ruoli: gli OUT di $f$ diventano gli IN di $f^{-1}$, e viceversa:

$$\textrm{dom}\, f^{-1} = B = \textrm{im}\, f \, , \qquad \textrm{im}\, f^{-1} = A = \textrm{dom}\, f \, .$$

Il diagramma a frecce dell'inversa si ottiene **invertendo il verso delle frecce**. Se $f$ non è biiettiva, le frecce invertite non formano una funzione. *Prima di premere il pulsante: che cosa succede a $1$ e a $3$ quando si invertono le frecce?*

```sets
{
  "sets": [
    { "id": "A", "elements": ["a", "b", "c"], "order": "given" },
    { "id": "B", "elements": ["1", "2", "3"], "order": "given" }
  ],
  "maps": [
    { "id": "f", "from": "A", "to": "B", "pairs": { "a": "1", "b": "1", "c": "2" } },
    { "id": "finv", "inverse": "f", "hidden": true, "color": "blue" }
  ],
  "show": ["properties(f)"],
  "controls": [{ "type": "reveal", "label": "Inverti le frecce", "targets": ["arrows(finv)", "properties(finv)"] }]
}
```

Al numero $1$ arrivano due frecce di $f$, quindi da $1$ ne partono due "all'indietro"; a $3$ non arriva nessuna freccia, quindi da $3$ non ne parte nessuna.

**Attenzione ai simboli.** In $f^{-1}$ l'esponente $-1$ non indica una potenza: $f^{-1}(x)$ non è $\dfrac{1}{f(x)}$. Inoltre $f^{-1}(b)$, l'IN che corrisponde a $b$, va distinto dalla controimmagine $f^{-1}(\lbrace b \rbrace)$, che è un insieme ed esiste sempre. Quando $f$ è invertibile, la controimmagine di $b$ è l'insieme con il solo elemento $f^{-1}(b)$.

### Tornare al punto di partenza

Che cosa succede se applichiamo $f$ e poi $f^{-1}$? Partiamo da $a$, arriviamo in $b = f(a)$ e torniamo in $a$:

$$f^{-1}(f(a)) = a \quad \forall a \in A \, , \qquad f(f^{-1}(b)) = b \quad \forall b \in B \, .$$

La funzione che lascia ogni elemento dov'è, $\operatorname{id}_A \colon A \to A$, $x \mapsto x$, si chiama ***funzione identità***. Quindi applicare $f$ e poi $f^{-1}$ (o viceversa) equivale all'identità. Inoltre, anche $f^{-1}$ è biiettiva, e la sua inversa è $f$: $(f^{-1})^{-1} = f$.

### Allargare la definizione

La definizione richiede la biiettività, ma spesso si può "aggiustare" una funzione per renderla invertibile.

- **Se $f$ è iniettiva ma non suriettiva**, basta restringere il codominio all'immagine: $f \colon A \to f(A)$ è biiettiva, e la sua inversa è $f^{-1} \colon f(A) \to A$. Per questo molti libri chiamano "invertibili" tutte le funzioni iniettive, sottintendendo che l'inversa è definita sull'immagine.
- **Se $f$ non è iniettiva**, si può restringere il dominio a una parte in cui lo è. La funzione $x \mapsto x^2$ non è iniettiva su $\mathbb{R}$, ma lo è su $[0, +\infty)$; da $[0, +\infty)$ in $[0, +\infty)$ è biiettiva, e la sua inversa è la radice quadrata, $x \mapsto \sqrt{x}$. Restringendo invece a $(-\infty, 0]$ si ottiene un'altra inversa, $x \mapsto -\sqrt{x}$.

### Come si trova l'inversa di una funzione reale

**Esempio.** Sia $f(x) = \sqrt{x - 2} + 2$. Abbiamo visto che $\textrm{dom}\, f = [2, +\infty)$; l'immagine è $[2, +\infty)$, perché la radice assume tutti i valori $\geq 0$. La funzione è iniettiva (vedremo che è strettamente crescente), ma non è suriettiva come funzione in $\mathbb{R}$: per renderla biiettiva restringiamo il codominio all'immagine, $f \colon [2, +\infty) \to [2, +\infty)$.

Per trovare l'inversa scriviamo l'uguaglianza tra OUT e IN e **ricaviamo l'IN**:

$$\begin{aligned} \text{OUT} &= \sqrt{\text{IN} - 2} + 2 \\ \text{OUT} - 2 &= \sqrt{\text{IN} - 2} \qquad (\text{con } \text{OUT} \geq 2) \\ (\text{OUT} - 2)^2 &= \text{IN} - 2 \\ \text{IN} &= (\text{OUT} - 2)^2 + 2 \end{aligned}$$

La formula ottenuta trasforma un OUT di $f$ nell'IN corrispondente: è l'inversa. Il nome della variabile è un segnaposto, quindi possiamo chiamarla di nuovo $x$:

$$f^{-1} \colon [2, +\infty) \to [2, +\infty) \, , \qquad f^{-1}(x) = (x - 2)^2 + 2 \, .$$

Attenzione al dominio: la formula $(x - 2)^2 + 2$ descrive una parabola intera, ma l'inversa ne è solo il ramo con $x \geq 2$. Il passaggio «con OUT $\geq 2$» non è un dettaglio: elevando al quadrato abbiamo perso l'informazione che $\sqrt{\text{IN} - 2}$ è positiva o nulla.

### Il grafico dell'inversa

Se $(a, b)$ è un punto del grafico di $f$, cioè $f(a) = b$, allora $f^{-1}(b) = a$, cioè $(b, a)$ è un punto del grafico di $f^{-1}$:

$$G_{f^{-1}} = \lbrace (b, a) : (a, b) \in G_f \rbrace \, .$$

Il grafico dell'inversa si ottiene **scambiando le coordinate** di ogni punto, cioè con la **simmetria rispetto alla bisettrice** $y = x$ del primo e del terzo quadrante. Si può fare anche con le mani: disegna il grafico su un foglio trasparente (o in controluce), afferra il foglio per due angoli sulla bisettrice e giralo, facendolo ruotare attorno alla bisettrice. In alternativa: ruota il foglio di $90°$ in senso antiorario, poi capovolgilo come la pagina di un libro, attorno all'asse verticale.

*Prima di trascinare: se il punto sul grafico di $f$ è $(6, 4)$, dove si trova il punto corrispondente sul grafico dell'inversa?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "interval": "[2, 8]" },
    { "id": "Y", "interval": "[2, 8]" }
  ],
  "maps": [
    { "id": "f", "from": "X", "to": "Y", "expr": "sqrt(x - 2) + 2" },
    { "id": "finv", "label": "f^{-1}", "inverse": "f", "hidden": true }
  ],
  "params": { "p": { "min": 2, "max": 8, "step": 0.05, "val": 6, "label": "x" } },
  "probe": [{ "map": "f", "at": "p" }, { "map": "finv", "at": "sqrt(p - 2) + 2", "color": "blue" }],
  "plot": { "maps": ["f", "finv"], "identity": true, "xlim": [0, 9], "ylim": [0, 9] }
}
```

## La composizione di funzioni

### La definizione

Possiamo collegare due macchine in serie: l'OUT della prima diventa l'IN della seconda.

$$x \;\xmapsto{\;\; f \;\;}\; f(x) \;\xmapsto{\;\; g \;\;}\; g(f(x))$$

> **Definizione.** Siano $f \colon A \to B$ e $g \colon C \to D$, con $\textrm{im}\, f \subseteq C$. La ***funzione composta*** $g \circ f$ (si legge «$g$ composto $f$») è la funzione
> $$g \circ f \colon A \to D \, , \qquad x \mapsto g(f(x)) \, .$$

La condizione $\textrm{im}\, f \subseteq C$ garantisce che ogni OUT di $f$ sia un IN accettabile per $g$. Attenzione all'ordine: in $g \circ f$ si applica **prima** $f$ e **poi** $g$, cioè si legge da destra a sinistra, come in $g(f(x))$.

**Esempio.** Siano $f(x) = \lvert x \rvert$ e $g(x) = x - 1$, entrambe da $\mathbb{R}$ in $\mathbb{R}$. Calcoliamo le due composte con le tabelle IN/OUT: nella prima si applica prima $f$, nella seconda prima $g$. I due diagrammi sono collegati: lo slider muove il punto in entrambi.

$$(g \circ f)(x) = g(f(x)) = g(\lvert x \rvert) = \lvert x \rvert - 1$$

```sets
{
  "sync": "comp",
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "interval": "[-3, 3]" },
    { "id": "Y", "interval": "[-3, 3]" },
    { "id": "Z", "interval": "[-3, 3]" }
  ],
  "maps": [
    { "id": "f", "from": "X", "to": "Y", "expr": "abs(x)", "samples": [] },
    { "id": "g", "from": "Y", "to": "Z", "expr": "x - 1", "color": "blue", "samples": [] },
    { "id": "gf", "label": "g \\circ f", "compose": ["f", "g"] }
  ],
  "params": { "p": { "min": -2, "max": 2, "step": 0.1, "val": -1.5, "label": "x" } },
  "probe": { "map": "gf", "at": "p" },
  "table": { "maps": ["f", "g"], "in": [-2, -1, 0, 1, 2], "probe": true, "headers": ["\\text{IN}", "\\text{OUT} = f(\\text{IN})", "g(\\text{OUT})"] },
  "plot": { "maps": ["gf"], "position": "below", "xlim": [-3, 3], "ylim": [-3, 3], "aspectRatio": "2:1" }
}
```

$$(f \circ g)(x) = f(g(x)) = f(x - 1) = \lvert x - 1 \rvert$$

```sets
{
  "sync": "comp",
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "interval": "[-3, 3]" },
    { "id": "Y", "interval": "[-4, 2]" },
    { "id": "Z", "interval": "[-3, 3]" }
  ],
  "maps": [
    { "id": "g", "from": "X", "to": "Y", "expr": "x - 1", "color": "blue", "samples": [] },
    { "id": "f", "from": "Y", "to": "Z", "expr": "abs(x)", "samples": [] },
    { "id": "fg", "label": "f \\circ g", "compose": ["g", "f"] }
  ],
  "params": { "p": { "min": -2, "max": 2, "step": 0.1, "val": -1.5 } },
  "showSliders": false,
  "probe": { "map": "fg", "at": "p" },
  "table": { "maps": ["g", "f"], "in": [-2, -1, 0, 1, 2], "probe": true, "headers": ["\\text{IN}", "\\text{OUT} = g(\\text{IN})", "f(\\text{OUT})"] },
  "plot": { "maps": ["fg"], "position": "below", "xlim": [-3, 3], "ylim": [-3, 3], "aspectRatio": "2:1" }
}
```

Si nota che:
- $g \circ f \neq f \circ g$: la composizione **non è commutativa**, l'ordine conta;
- il grafico di $\lvert x \rvert - 1$ è la "V" di $\lvert x \rvert$ abbassata di $1$: abbiamo modificato l'**OUT**, e il grafico si è spostato in **verticale**;
- il grafico di $\lvert x - 1 \rvert$ è la "V" spostata di $1$ verso **destra**: abbiamo modificato l'**IN**, e il grafico si è spostato in **orizzontale**, e per di più "al contrario" (sottraendo $1$ si va a destra).

Le ultime due osservazioni sono il punto di partenza per studiare le trasformazioni dei grafici.

### Il dominio della funzione composta

Che cosa succede se non tutti gli OUT di $f$ sono IN accettabili per $g$? Siano $f(x) = x - 1$ e $g(x) = \sqrt{x}$. La composta $(g \circ f)(x) = \sqrt{x - 1}$ è definita solo per gli $x$ il cui OUT $f(x)$ sta nel dominio di $g$:

$$\textrm{dom}\,(g \circ f) = \lbrace x \in \textrm{dom}\, f : f(x) \in \textrm{dom}\, g \rbrace = f^{-1}(\textrm{dom}\, g) \, .$$

In questo caso $x - 1 \geq 0$, cioè $\textrm{dom}\,(g \circ f) = [1, +\infty)$. *Prima di guardare: per quali IN la catena si interrompe, e dove?*

```sets
{
  "dynagraph": true,
  "sets": [
    { "id": "X", "label": "\\mathbb{R}", "interval": "R", "window": [-2, 4] },
    { "id": "Y", "label": "\\mathbb{R}", "interval": "R", "window": [-2, 4] },
    { "id": "Z", "label": "\\mathbb{R}", "interval": "R", "window": [-2, 4] }
  ],
  "maps": [
    { "id": "f", "from": "X", "to": "Y", "expr": "x - 1" },
    { "id": "g", "from": "Y", "to": "Z", "expr": "sqrt(x)", "color": "blue" },
    { "id": "gf", "label": "g \\circ f", "compose": ["f", "g"] }
  ],
  "params": { "p": { "min": -2, "max": 4, "step": 0.1, "val": 0, "label": "x" } },
  "probe": { "map": "gf", "at": "p" },
  "show": ["domain(gf)"]
}
```

### Proprietà della composizione

- La composizione è ***associativa***: $h \circ (g \circ f) = (h \circ g) \circ f$. In entrambi i casi si applica prima $f$, poi $g$, poi $h$.
- L'identità non cambia nulla: $f \circ \operatorname{id}_A = f$ e $\operatorname{id}_B \circ f = f$.
- Se $f$ è invertibile, $f^{-1} \circ f = \operatorname{id}_A$ e $f \circ f^{-1} = \operatorname{id}_B$.
- **La composta di due funzioni iniettive è iniettiva.** Infatti, se $g(f(a_1)) = g(f(a_2))$, allora $f(a_1) = f(a_2)$ perché $g$ è iniettiva, e quindi $a_1 = a_2$ perché $f$ è iniettiva. In modo simile si dimostra che la composta di due funzioni suriettive è suriettiva, e quindi che la composta di due biiezioni è una biiezione.
- L'inversa di una composta si ottiene invertendo i passaggi **in ordine inverso**: $(g \circ f)^{-1} = f^{-1} \circ g^{-1}$. Al mattino si mettono prima le calze e poi le scarpe; la sera si tolgono prima le scarpe e poi le calze.

In Python la composizione è una funzione che riceve due funzioni e ne restituisce una terza:

```python
def componi(g, f):
    return lambda x: g(f(x))   # prima f, poi g

f = abs
g = lambda x: x - 1
componi(g, f)(-2)   # g(f(-2)) = g(2) = 1
componi(f, g)(-2)   # f(g(-2)) = f(-3) = 3
```
