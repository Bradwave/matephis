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

Un'unica funzione, due formule: per ogni IN si usa **una sola** delle due righe, quella la cui condizione è vera. Le condizioni dividono il dominio in pezzi che non si sovrappongono e lo ricoprono tutto: è proprio quello che serve perché a ogni IN corrisponda esattamente un OUT.

*Prima di trascinare: che cosa fanno le frecce a sinistra di $0$? E a destra?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [
    { "id": "X", "label": "\\mathbb{R}", "interval": "R", "window": [-3, 3] },
    { "id": "Y", "label": "\\mathbb{R}", "interval": "R", "window": [-3, 3] }
  ],
  "maps": [{ "id": "v", "label": "\\lvert \\cdot \\rvert", "from": "X", "to": "Y", "piecewise": [
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
