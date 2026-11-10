---
title: Esercizi sulle funzioni
feed: show
plot: true
tags:
  - esercizi
  - funzioni
---
Esercizi, quesiti, quiz e problemi sulla teoria delle funzioni: definizione di funzione, dominio, codominio e immagine, grafico come sottoinsieme del prodotto cartesiano, funzioni iniettive, suriettive e biiettive, funzione inversa e composta, segno, parità, trasformazioni, contrazioni e punti fissi, confronto tra le "dimensioni" di insiemi infiniti.

Gli **esercizi** sono attività più standard, i **quesiti** richiedono soprattutto ragionamento e argomentazione, le **esplorazioni** usano grafici con slider da manipolare dopo aver fatto una previsione. Molti chiedono di passare da un registro all'altro: dalla descrizione a parole alla formula, dalla formula al grafico, dal grafico alla tabella e viceversa. Per gli esercizi di calcolo più ripetitivi è sufficiente il libro di testo.

Gli esercizi sui problemi di scelta si trovano negli [[esercizi sui problemi di scelta]].

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

> [!DETAILS] Definizioni e notazioni utilizzate
>
> - $f : A \to B$ indica una funzione con **dominio** $A$ e **codominio** $B$. L'**immagine** è l'insieme $f(A) = \lbrace f(x) : x \in A \rbrace \subseteq B$, indicato anche con $\textrm{im}\, f$. Più in generale, se $X \subseteq A$, $f(X) = \lbrace f(x) : x \in X \rbrace$ è l'immagine del sottoinsieme $X$.
> - Il **grafico** di $f$ è l'insieme $G_f = \lbrace (x, f(x)) : x \in A \rbrace \subseteq A \times B$.
> - $f$ è **iniettiva** se $x_1 \neq x_2 \implies f(x_1) \neq f(x_2)$ (equivalentemente, $f(x_1) = f(x_2) \implies x_1 = x_2$); è **suriettiva** se $\forall y \in B \; \exists x \in A : f(x) = y$, cioè se $f(A) = B$; è **biiettiva** se è iniettiva e suriettiva.
> - La **funzione composta** $g \circ f$ è definita da $(g \circ f)(x) = g(f(x))$, per gli $x \in \textrm{dom}\, f$ tali che $f(x) \in \textrm{dom}\, g$.
> - Se $f : A \to B$ è biiettiva, la **funzione inversa** $f^{-1} : B \to A$ associa a ogni $y \in B$ l'unico $x \in A$ tale che $f(x) = y$.
> - $f$ è **pari** se $f(-x) = f(x)$, **dispari** se $f(-x) = -f(x)$, per ogni $x$ del dominio (che deve essere simmetrico rispetto a $0$).
> - $f : A \to A$ è una **contrazione** se esiste un numero $q$, con $0 \leq q < 1$, tale che $\lvert f(x_1) - f(x_2) \rvert \leq q \lvert x_1 - x_2 \rvert$ per ogni $x_1, x_2 \in A$. Un **punto fisso** di $f$ è un numero $\bar x$ tale che $f(\bar x) = \bar x$.

## Esercizi

### Funzioni, dominio, immagine e grafico

1. **[E]** Stabilisci se ciascuna delle seguenti relazioni è una funzione. In caso di risposta affermativa, determina dominio, codominio e immagine della funzione e stabilisci se è iniettiva, suriettiva o biiettiva. Rappresenta la funzione con la corretta notazione.
	1. La relazione tra l'insieme di tutti gli istituti scolastici italiani e l'insieme di tutti i possibili indirizzi, che associa a ogni scuola l'indirizzo della propria sede.
	2. La relazione tra l'insieme di tutti gli istituti scolastici italiani e l'insieme di tutti i possibili indirizzi, che associa a ogni scuola gli indirizzi della propria sede e delle eventuali succursali.
	3. La relazione tra l'insieme dei clienti di un negozio online e l'insieme degli ordini effettuati presso il negozio, che associa a ogni cliente gli ordini effettuati.
	4. La relazione tra l'insieme degli ordini effettuati presso un negozio online e l'insieme di tutti i possibili indirizzi, che associa a ogni ordine l'indirizzo di spedizione.
	5. La relazione tra l'insieme di tutte le specie animali e l'insieme di tutte le famiglie, che associa a ogni specie la propria famiglia.
	6. La relazione tra l'insieme di tutte le famiglie animali e l'insieme di tutte le specie, che associa a ogni famiglia tutte le specie che ne fanno parte.
	7. La relazione tra l'insieme di tutte le specie animali e l'insieme delle nomenclature binomiali attribuite (e.g. *Canis lupus*, *Felis catus*), che associa a ogni specie la propria nomenclatura binomiale.
	8. La relazione tra l'insieme dei punti del piano e se stesso, che associa a ogni punto il punto corrispondente in seguito a una traslazione.
	9. La relazione tra l'insieme dei punti del piano e $\mathbb{R}^2$ (insieme delle coppie ordinate di numeri reali $(x, y)$), che associa a ogni punto del piano le proprie coordinate in un sistema di riferimento fissato.
	10. La relazione tra $\mathbb{R}$ e l'insieme dei punti del piano, che associa a ogni numero reale $x$ i punti che si trovano a una distanza $x$ dall'origine.
	[sol: 1. funzione, non iniettiva (istituti diversi possono avere sede nello stesso edificio), non suriettiva; 2. non è una funzione; 3. non è una funzione (un cliente può aver effettuato più ordini, o nessuno); 4. funzione, non iniettiva, non suriettiva; 5. funzione suriettiva, non iniettiva; 6. non è una funzione; 7. funzione biiettiva; 8. funzione biiettiva; 9. funzione biiettiva; 10. non è una funzione (a un numero negativo non è associato alcun punto, a un numero positivo infiniti punti).]
2. **[E]** Siano $A = \lbrace 1, 2, 3 \rbrace$ e $B = \lbrace a, b, c \rbrace$.
	1. Elenca gli elementi di $A \times B$ e rappresentali in un diagramma cartesiano.
	2. Quali dei seguenti sottoinsiemi di $A \times B$ sono il grafico di una funzione da $A$ a $B$? Per quelli che lo sono, stabilisci se la funzione è iniettiva, suriettiva, biiettiva.
		- $G_1 = \lbrace (1, a), (2, a), (3, b) \rbrace$
		- $G_2 = \lbrace (1, a), (2, b) \rbrace$
		- $G_3 = \lbrace (1, a), (1, b), (2, c), (3, c) \rbrace$
		- $G_4 = \lbrace (1, c), (2, b), (3, a) \rbrace$
	3. Quale proprietà deve avere un sottoinsieme $G \subseteq A \times B$ per essere il grafico di una funzione da $A$ a $B$? Esprimila a parole, con i quantificatori e in termini di "rette verticali" nel diagramma cartesiano.
	[sol: 2. $G_1$: funzione né iniettiva né suriettiva; $G_2$: non è il grafico di una funzione da $A$ a $B$ (a $3$ non è associato nulla); $G_3$: non lo è (a $1$ sono associati due elementi); $G_4$: funzione biiettiva. 3. Per ogni $x \in A$ esiste uno e un solo $y \in B$ tale che $(x, y) \in G$: ogni retta verticale per un elemento di $A$ interseca $G$ in esattamente un punto.]
3. **[EE]** Quali dei seguenti sottoinsiemi del piano cartesiano sono il grafico di una funzione reale di variabile reale? In caso affermativo, determina l'espressione analitica della funzione, il suo dominio e la sua immagine.
	1. $\lbrace (x, y) \in \mathbb{R}^2 : y^2 = x \rbrace$
	2. $\lbrace (x, y) \in \mathbb{R}^2 : y^3 = x \rbrace$
	3. $\lbrace (x, y) \in \mathbb{R}^2 : x^2 + y^2 = 1 \land y \geq 0 \rbrace$
	4. $\lbrace (x, y) \in \mathbb{R}^2 : \lvert y \rvert = x \rbrace$
	5. $\lbrace (x, y) \in \mathbb{R}^2 : y = \lvert x \rvert \rbrace$
	6. $\lbrace (x, y) \in \mathbb{R}^2 : x = 2 \rbrace$
	7. $\lbrace (x, y) \in \mathbb{R}^2 : xy = 1 \rbrace$
	[sol: 1. no; 2. sì, $y = \root 3 \of {x}$, dominio e immagine $\mathbb{R}$; 3. sì, $y = \sqrt{1 - x^2}$, dominio $-1 \leq x \leq 1$, immagine $0 \leq y \leq 1$; 4. no; 5. sì, dominio $\mathbb{R}$, immagine $y \geq 0$; 6. no; 7. sì, $y = 1/x$, dominio e immagine $\mathbb{R} \setminus \lbrace 0 \rbrace$.]
4. **[E]** Per ciascuna delle seguenti funzioni, scrivi la definizione algebrica utilizzando la giusta notazione, determina dominio naturale e immagine, realizza un dynagraph e un grafico cartesiano.
	1. La funzione che associa a ogni numero reale $x$ il numero reale ottenuto addizionando 5 a $x$.
	2. La funzione che associa a ogni numero naturale $n$ il numero naturale doppio di $n$.
	3. La funzione che associa a ogni numero reale $x$ il numero reale ottenuto addizionando 5 al doppio di $x$.
	4. La funzione che associa a ogni numero reale $x$ il quadrato di $x$ aumentato di 1.
	[sol: 1. $f(x) = x + 5$, dominio e immagine $\mathbb{R}$; 2. $f : \mathbb{N} \to \mathbb{N}$, $f(n) = 2n$, immagine: i numeri naturali pari; 3. $f(x) = 2x + 5$, dominio e immagine $\mathbb{R}$; 4. $f(x) = x^2 + 1$, dominio $\mathbb{R}$, immagine $y \geq 1$.]
5. **[EE]** Definisci algebricamente la funzione che associa a ogni numero sulla retta dei numeri reali la sua distanza da zero, scrivendola anche come funzione definita a tratti. Determina dominio, codominio e immagine della funzione. Realizza un dynagraph e un grafico cartesiano.
	[sol: $f : \mathbb{R} \to \mathbb{R}$, $f(x) = \lvert x \rvert$, che vale $x$ se $x \geq 0$ e $-x$ se $x < 0$; immagine: $y \geq 0$.]
6. **[EE/F]** Definisci algebricamente la funzione che associa a ogni punto del piano cartesiano la propria distanza dall'origine. Determina dominio, codominio e immagine della funzione. È possibile realizzare un grafico cartesiano di tale funzione? Che forma avrebbe?
	[sol: $f : \mathbb{R}^2 \to \mathbb{R}$, $f(x, y) = \sqrt{x^2 + y^2}$, immagine: i numeri reali non negativi. Il grafico è un sottoinsieme di $\mathbb{R}^2 \times \mathbb{R}$, cioè dello spazio tridimensionale: è la superficie di un cono con vertice nell'origine.]
7. **[T]** Qual è il dominio della funzione il cui grafico è rappresentato in figura? E l'immagine?
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-1.9, 9.9],
	  "ylim": [-2.9, 2.9],
	  "data": [
	    { "fn": "sqrt(x-2)-1", "domain": [2, 10], "color": "red1" },
	    { "points": [[2, -1]], "radius": 4, "fillColor": "red1" }
	  ]
	}
	```
	[sol: dominio: $x \geq 2$; immagine: $y \geq -1$.]
8. **[EE]** Determina il dominio naturale delle seguenti funzioni, rappresenta sul grafico gli intervalli di definizione, quindi verifica le risposte usando Desmos, GeoGebra o software simili.
	1. $f(x) = \sqrt{x^2 + 1}$
	2. $f(x) = \dfrac{x + 3}{x - 2}$
	3. $f(x) = \dfrac{1}{\sqrt{x + 2}}$
	4. $f(x) = 3\sqrt{x - 2} + \dfrac{1}{x - 5}$
	5. $f(x) = \dfrac{1}{x^2 - 8}$
	6. $f(x) = \dfrac{1}{x^2 + 8}$
	7. $f(x) = \sqrt{2 - 2x^2}$
	8. $f(x) = \sqrt[3]{3 - 3x^3}$
	9. $f(x) = \dfrac{\sqrt{x^3}}{x^2}$
	10. $f(x) = \dfrac{1}{x} + \dfrac{1}{x + 5}$
	11. $f(x) = \dfrac{3}{x(x + 1)(x + 2)}$
	12. $f(x) = \sqrt{7x} - 7$
	13. $f(x) = \dfrac{1}{\sqrt{g(x)}}$, dove $g(x) = \dfrac{1}{x}$
	14. $f(x) = \sqrt{g(x) - 3}$, dove $g(x) = x^3 + 3$
	[sol: 1. $\mathbb{R}$; 2. $x \neq 2$; 3. $x > -2$; 4. $x \geq 2 \land x \neq 5$; 5. $x \neq \pm 2\sqrt{2}$; 6. $\mathbb{R}$; 7. $-1 \leq x \leq 1$; 8. $\mathbb{R}$; 9. $x > 0$; 10. $x \neq 0 \land x \neq -5$; 11. $x \neq 0 \land x \neq -1 \land x \neq -2$; 12. $x \geq 0$; 13. $x > 0$; 14. $x \geq 0$.]
9. **[PD]** Determina il dominio naturale delle seguenti funzioni. Attenzione: in alcuni casi il dominio contiene punti isolati, in altri si riduce a pochissimi punti, in altri ancora è tutto $\mathbb{R}$ anche se non sembra.
	1. $f(x) = \sqrt{\dfrac{x - 1}{x + 3}}$
	2. $f(x) = \dfrac{1}{\sqrt{x^2 - 4x + 3}}$
	3. $f(x) = \sqrt{x^2 (x - 2)}$
	4. $f(x) = \dfrac{\sqrt{4 - x^2}}{\lvert x \rvert - 1}$
	5. $f(x) = \sqrt{1 - \sqrt{x}}$
	6. $f(x) = \sqrt{\lvert x \rvert - x}$
	7. $f(x) = \dfrac{1}{\lvert x - 1 \rvert - \lvert x + 1 \rvert}$
	8. $f(x) = \sqrt{-x^2} + \sqrt{x^3 - x}$
	[sol: 1. $x < -3 \lor x \geq 1$; 2. $x < 1 \lor x > 3$; 3. $x = 0 \lor x \geq 2$; 4. $-2 \leq x \leq 2 \land x \neq \pm 1$; 5. $0 \leq x \leq 1$; 6. $\mathbb{R}$; 7. $x \neq 0$ (le distanze di $x$ da $1$ e da $-1$ coincidono solo per $x = 0$); 8. il solo punto $x = 0$.]
10. **[EE/F]** Determina l'immagine delle seguenti funzioni, giustificando la risposta con un grafico. Attenzione al dominio!
	1. $f : [-1, 3] \to \mathbb{R}$, $f(x) = 2x - 1$
	2. $f : [-2, 3] \to \mathbb{R}$, $f(x) = x^2$
	3. $f : \mathbb{R} \to \mathbb{R}$, $f(x) = x^2 - 4x + 1$
	4. $f(x) = \sqrt{4 - x^2}$
	5. $f(x) = \sqrt{x^2 + 16}$
	6. $f(x) = \dfrac{1}{x^2 + 1}$
	7. $f : (0, 1) \to \mathbb{R}$, $f(x) = \dfrac{1}{x}$
	8. $f : \mathbb{Z} \to \mathbb{Z}$, $f(n) = 2n + 1$
	[sol: 1. $-3 \leq y \leq 5$; 2. $0 \leq y \leq 9$ (non $4 \leq y \leq 9$!); 3. $y \geq -3$; 4. $0 \leq y \leq 2$; 5. $y \geq 4$; 6. $0 < y \leq 1$; 7. $y > 1$; 8. i numeri interi dispari.]
11. **[PD]** Un numero $k$ appartiene all'immagine di $f$ se e solo se l'equazione $f(x) = k$, nell'incognita $x$, ha almeno una soluzione nel dominio di $f$. Usa questa idea per determinare l'immagine delle seguenti funzioni, poi verifica la risposta con un grafico realizzato con un software.
	1. $f(x) = \dfrac{2x + 1}{x - 3}$
	2. $f(x) = \dfrac{x}{x^2 + 1}$
	3. $f(x) = x + \dfrac{1}{x}$
	4. $f(x) = \dfrac{x^2}{x^2 + 1}$
	[sol: 1. $y \neq 2$; 2. $-\frac 1 2 \leq y \leq \frac 1 2$ (per $k \neq 0$ l'equazione $kx^2 - x + k = 0$ ha soluzioni se $1 - 4k^2 \geq 0$); 3. $y \leq -2 \lor y \geq 2$; 4. $0 \leq y < 1$.]
12. **[E]** In figura è rappresentato il grafico della funzione polinomiale $f$.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-3.9, 3.9],
	  "ylim": [-4.9, 4.9],
	  "data": [
	    { "fn": "x^4 - 4x^2", "color": "red1" }
	  ]
	}
	```
	1. **[E]** Quante sono le soluzioni dell'equazione $f(x) = 2$?
	2. **[F]** Quante sono le soluzioni dell'equazione $f(x) = k$, al variare di $k \in \mathbb{R}$?
	3. **[F]** Quante sono le soluzioni dell'equazione $\lvert f(x) \rvert = 2$? E dell'equazione $f(\lvert x \rvert) = -2$?
	[sol: 1. due; 2. nessuna se $k < -4$, due se $k = -4$, quattro se $-4 < k < 0$, tre se $k = 0$, due se $k > 0$; 3. sei; quattro.]
13. **[F-]** In figura è rappresentato il grafico della funzione polinomiale $f$, di secondo grado.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-4.9, 4.9],
	  "ylim": [-4.9, 5.9],
	  "data": [
	    { "fn": "x^2 - 4", "color": "red1" }
	  ]
	}
	```
	1. Determina il dominio di $g(x) = \sqrt{f(x)}$ e di $h(x) = \dfrac{1}{\sqrt{f(x)}}$.
	2. Traccia un grafico indicativo di $g$, individuando dove la radice "gonfia" e dove "sgonfia" i valori di $f$.
	3. Scrivi l'espressione analitica di $f$ e verifica il grafico di $g$ con un software.
	[sol: 1. $\textrm{dom}\, g$: $x \leq -2 \lor x \geq 2$; $\textrm{dom}\, h$: $x < -2 \lor x > 2$. 2. I valori sono "gonfiati" dove $0 < f(x) < 1$, cioè per $2 < \lvert x \rvert < \sqrt 5$, e "sgonfiati" dove $f(x) > 1$, cioè per $\lvert x \rvert > \sqrt 5$. 3. $f(x) = x^2 - 4$.]
14. **[F+]** In figura è rappresentato il grafico della funzione $f$. Determina il dominio di $g(x) = \dfrac{1}{f(x)}$.
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-0.9, 10.9],
	  "ylim": [-3.9, 2.9],
	  "data": [
	    { "fn": "1 - 1/(x-5)^2", "color": "red1" }
	  ]
	}
	```
	[sol: $x \neq 4 \land x \neq 5 \land x \neq 6$: oltre agli zeri di $f$ va escluso $x = 5$, che non appartiene al dominio di $f$.]
15. **[PD]** In figura è rappresentato il grafico di una funzione polinomiale $f$ di quarto grado.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-3.9, 4.9],
	  "ylim": [-5.9, 5.9],
	  "data": [
	    { "fn": "(x+2)(x-1)^2(x-3)/4", "color": "red1" },
	    { "points": [[0, -1.5]], "radius": 4, "fillColor": "red1" }
	  ]
	}
	```
	1. Determina il dominio delle funzioni $\sqrt{f(x)}$, $\sqrt{-f(x)}$, $\dfrac{1}{f(x)}$ e $\dfrac{1}{\sqrt{f(x)}}$.
	2. Traccia un grafico indicativo di $\lvert f(x) \rvert$ e di $\sqrt{f(x)}$.
	3. Sapendo che il grafico passa per il punto $(0; -1{,}5)$, scrivi l'espressione analitica di $f$.
	[sol: 1. $\sqrt{f}$: $x \leq -2 \lor x = 1 \lor x \geq 3$ (attenzione al punto isolato $x = 1$); $\sqrt{-f}$: $-2 \leq x \leq 3$; $1/f$: $x \neq -2 \land x \neq 1 \land x \neq 3$; $1/\sqrt{f}$: $x < -2 \lor x > 3$. 3. $f(x) = \frac 1 4 (x + 2)(x - 1)^2(x - 3)$.]

### Iniettività, suriettività e funzione inversa

1. **[E]** Di seguito sono riportati i grafici cartesiani di alcune relazioni. Identifica quali di queste relazioni sono funzioni e, tra le funzioni, stabilisci quali sono iniettive (considera solo la porzione di grafico rappresentata).
	```matephis
	{
	  "layout": "grid",
	  "columns": 3,
	  "mobileColumns": 2,
	  "labels": "1",
	  "shared": { "xlim": [-2.2, 2.2], "ylim": [-2.2, 2.2], "aspectRatio": 1 },
	  "plots": [
	    { "data": [ { "implicit": "x^2 + y^2 = 1", "color": "red1" } ] },
	    { "data": [ { "fn": "x^2 - 1", "color": "red1" } ] },
	    { "data": [ { "parametric": ["t^3 - t", "t"], "domain": [-2, 2], "color": "red1" } ] },
	    { "data": [
	      { "fn": "1", "domain": [-3, 0], "color": "red1" },
	      { "fn": "-1", "domain": [0, 3], "color": "red1" },
	      { "points": [[0, 1]], "radius": 4, "fillColor": "red1" },
	      { "points": [[0, -1]], "radius": 4, "fillColor": "#fff", "strokeColor": "red1", "strokeWidth": 2 }
	    ] },
	    { "data": [ { "fn": "x^3 + x/3", "color": "red1" } ] },
	    { "data": [ { "fn": "sin(2x)", "color": "red1" } ] }
	  ]
	}
	```
	[sol: sono funzioni le relazioni 2, 4, 5 e 6; tra queste, è iniettiva solo la 5.]
2. **[EE]** Considera la legge $x \mapsto x^2$. Per ciascuna delle seguenti scelte di dominio e codominio stabilisci se la funzione è iniettiva, suriettiva, biiettiva, e nel caso in cui sia biiettiva determinane l'inversa.
	1. $f_1 : \mathbb{R} \to \mathbb{R}$
	2. $f_2 : \mathbb{R} \to [0, +\infty)$
	3. $f_3 : [0, +\infty) \to \mathbb{R}$
	4. $f_4 : [0, +\infty) \to [0, +\infty)$
	5. $f_5 : [-1, 2] \to [0, 4]$
	6. $f_6 : (-\infty, -1] \to [1, +\infty)$
	[sol: 1. né iniettiva né suriettiva; 2. suriettiva, non iniettiva; 3. iniettiva, non suriettiva; 4. biiettiva, inversa $\sqrt{x}$; 5. suriettiva, non iniettiva; 6. biiettiva, inversa $-\sqrt{x}$.]
3. **[EE/F]** Per ciascuna delle seguenti funzioni stabilisci se è invertibile (eventualmente restringendo dominio e codominio), determina l'espressione analitica dell'inversa, il suo dominio e la sua immagine. Rappresenta nello stesso piano cartesiano i grafici di $f$ e di $f^{-1}$.
	1. $f(x) = 3x - 2$
	2. $f(x) = x^3 + 1$
	3. $f(x) = \sqrt{x - 1}$
	4. $f(x) = \dfrac{x + 1}{x - 2}$
	5. $f(x) = x^2 - 2x$, ristretta all'intervallo $[1, +\infty)$. Esiste un'altra restrizione "naturale" che rende $f$ invertibile? Qual è l'inversa in quel caso?
	6. $f(x) = x \lvert x \rvert$
	[sol: 1. $f^{-1}(x) = \frac{x + 2}{3}$; 2. $f^{-1}(x) = \root 3 \of {x - 1}$; 3. $f^{-1}(x) = x^2 + 1$, con dominio $x \geq 0$ e immagine $y \geq 1$; 4. $f^{-1}(x) = \frac{2x + 1}{x - 1}$, dominio $x \neq 1$, immagine $y \neq 2$; 5. $f^{-1}(x) = 1 + \sqrt{x + 1}$, con dominio $x \geq -1$; restringendo a $x \leq 1$ si ottiene $f^{-1}(x) = 1 - \sqrt{x + 1}$; 6. $f^{-1}(x) = \sqrt{x}$ se $x \geq 0$, $-\sqrt{-x}$ se $x < 0$.]
4. **[F]** In figura è rappresentato il grafico della funzione $f$, definita nell'intervallo $[-4, 3]$ e formata da tre segmenti.
	```matephis
	{
	  "aspectRatio": "1:1",
	  "xlim": [-4.9, 4.9],
	  "ylim": [-4.9, 4.9],
	  "data": [
	    { "type": "interpolation", "points": [[-4, -3], [-1, -2], [1, 1], [3, 4]], "smoothness": 0, "color": "red1" },
	    { "points": [[-4, -3], [-1, -2], [1, 1], [3, 4]], "radius": 4, "fillColor": "red1" },
	    { "fn": "x", "color": "black4", "dash": "5,5", "width": 1.5 }
	  ]
	}
	```
	1. Giustifica il fatto che $f$ è invertibile e traccia il grafico di $f^{-1}$. Quali sono dominio e immagine di $f^{-1}$?
	2. Calcola $f^{-1}(-2)$, $f^{-1}(1)$, $f^{-1}(4)$ e $f^{-1}(0)$.
	3. Risolvi la disequazione $f^{-1}(x) \geq 0$.
	4. In quali punti si intersecano i grafici di $f$ e di $f^{-1}$?
	[sol: 1. $f$ è strettamente crescente; dominio di $f^{-1}$: $-3 \leq x \leq 4$, immagine: $-4 \leq y \leq 3$. 2. $-1$; $1$; $3$; $\frac 1 3$. 3. $-\frac 1 2 \leq x \leq 4$, perché $f(0) = -\frac 1 2$. 4. Nei punti fissi di $f$, che stanno sulla bisettrice: $(-\frac 5 2; -\frac 5 2)$ e $(1; 1)$.]
5. **[EE/F]** Siano $A$ e $B$ due insiemi finiti con $3$ e $2$ elementi rispettivamente.
	1. Quante sono le funzioni da $A$ a $B$? Quante di esse sono suriettive? Quante iniettive?
	2. Rispondi alle stesse domande nel caso in cui $A$ e $B$ abbiano entrambi $3$ elementi.
	3. Spiega perché non può esistere una funzione iniettiva da un insieme con $4$ elementi a un insieme con $3$ elementi (*principio dei cassetti*). Che cosa si può dire, in generale, del numero degli elementi di due insiemi finiti tra i quali esiste una biiezione?
	[sol: 1. $2^3 = 8$ funzioni, di cui $6$ suriettive e nessuna iniettiva; 2. $3^3 = 27$ funzioni, di cui $6$ suriettive e $6$ iniettive (tutte biiettive); 3. almeno due elementi del dominio avrebbero la stessa immagine; due insiemi finiti tra i quali esiste una biiezione hanno lo stesso numero di elementi.]

### Composizione di funzioni

1. **[E]** Siano $f(x) = x^2$, $g(x) = x - 3$ e $h(x) = \sqrt{x}$. Determina l'espressione analitica e il dominio delle seguenti funzioni composte.
	1. $f \circ g$ e $g \circ f$
	2. $h \circ f$ e $f \circ h$
	3. $h \circ g \circ f$
	4. $g \circ g \circ g$
	[sol: 1. $(x - 3)^2$, $x^2 - 3$, entrambe con dominio $\mathbb{R}$; 2. $h(f(x)) = \sqrt{x^2} = \lvert x \rvert$ con dominio $\mathbb{R}$, mentre $f(h(x)) = x$ con dominio $x \geq 0$; 3. $\sqrt{x^2 - 3}$, dominio $x \leq -\sqrt 3 \lor x \geq \sqrt 3$; 4. $x - 9$.]
2. **[EE/F]** Composizione "al contrario".
	1. Scrivi ciascuna delle seguenti funzioni come composizione di due o più funzioni più semplici: $F(x) = \sqrt{(x - 1)^2 + 4}$, $G(x) = \dfrac{1}{x^2 - 4}$, $H(x) = \lvert 2x - 1 \rvert^3$.
	2. Sia $f(x) = 2x + 1$. Determina una funzione $g$ tale che $f(g(x)) = 6x - 5$ per ogni $x$.
	3. Sia ancora $f(x) = 2x + 1$. Determina una funzione $k$ tale che $k(f(x)) = 4x^2 + 4x$ per ogni $x$.
	[sol: 1. ad esempio $F = r \circ s \circ t$ con $t(x) = x - 1$, $s(x) = x^2 + 4$, $r(x) = \sqrt x$; $G = u \circ v$ con $v(x) = x^2 - 4$, $u(x) = 1/x$; $H = c \circ a \circ \ell$ con $\ell(x) = 2x - 1$, $a(x) = \lvert x \rvert$, $c(x) = x^3$. 2. $g(x) = 3x - 3$. 3. $k(t) = t^2 - 1$, perché $4x^2 + 4x = (2x + 1)^2 - 1$.]
3. **[F]** Siano $f(x) = \sqrt{x}$ e $g(x) = 1 - x^2$. Determina dominio e immagine di $f \circ g$ e di $g \circ f$. Le funzioni $g \circ f$ e $k(x) = 1 - x$ sono la stessa funzione? Rappresentale entrambe.
	[sol: $f(g(x)) = \sqrt{1 - x^2}$, dominio $-1 \leq x \leq 1$, immagine $0 \leq y \leq 1$; $g(f(x)) = 1 - x$ con dominio $x \geq 0$, immagine $y \leq 1$. Non sono la stessa funzione: hanno la stessa espressione ma domini diversi, e il grafico di $g \circ f$ è solo una semiretta.]
4. **[PD]** In figura sono rappresentati i grafici delle funzioni $f$ e $g$, entrambi formati da segmenti. La funzione $f$ è definita nell'intervallo $[-3, 4]$, la funzione $g$ nell'intervallo $[-2, 3]$.
	```matephis
	{
	  "layout": "row",
	  "mobileColumns": 1,
	  "labels": ["f", "g"],
	  "shared": { "xlim": [-3.9, 4.9], "ylim": [-1.9, 5.9], "aspectRatio": "1:1" },
	  "plots": [
	    { "data": [
	      { "type": "interpolation", "points": [[-3, -1], [-1, 2], [1, 2], [3, 0], [4, -1]], "smoothness": 0, "color": "red1" },
	      { "points": [[-3, -1], [-1, 2], [1, 2], [3, 0], [4, -1]], "radius": 4, "fillColor": "red1" }
	    ] },
	    { "data": [
	      { "type": "interpolation", "points": [[-2, 5], [0, 1], [2, -1], [3, 1]], "smoothness": 0, "color": "black1" },
	      { "points": [[-2, 5], [0, 1], [2, -1], [3, 1]], "radius": 4, "fillColor": "black1" }
	    ] }
	  ]
	}
	```
	1. Calcola $f(g(0))$, $g(f(0))$, $f(f(3))$ e $g(g(3))$.
	2. Determina il dominio di $f \circ g$ e di $g \circ f$.
	3. Risolvi le equazioni $f(g(x)) = 2$ e $f(g(x)) = 0$.
	4. Studia il segno di $g \circ f$.
	[sol: 1. $f(1) = 2$; $g(2) = -1$; $f(0) = 2$; $g(1) = 0$. 2. $f \circ g$: $-\frac 3 2 \leq x \leq 3$ (deve essere $g(x) \leq 4$); $g \circ f$: tutto l'intervallo $-3 \leq x \leq 4$. 3. $f(g(x)) = 2$ per $0 \leq x \leq 3$ (deve essere $-1 \leq g(x) \leq 1$); $f(g(x)) = 0$ solo per $x = -1$ (deve essere $g(x) = -\frac 7 3$, impossibile, oppure $g(x) = 3$). 4. $g$ è negativa per $1 < t < \frac 5 2$, quindi $g(f(x)) < 0$ dove $f(x) > 1$, cioè per $-\frac 5 3 < x < 2$; $g(f(x)) = 0$ per $x = -\frac 5 3$ e $x = 2$; altrove è positiva.]

### Segno, parità e simmetrie

1. **[EE]** Studia il segno delle seguenti funzioni e tracciane un grafico indicativo, usando la tecnica dei "tagli" e dei "rimbalzi" e ragionando sul comportamento per valori di $x$ molto grandi in valore assoluto.
	1. $f(x) = x^3 - 4x$
	2. $f(x) = (x - 1)^2(x + 2)$
	3. $f(x) = -x^2(x - 3)^3(x + 1)$
	4. $f(x) = (x - 2)\sqrt{x^2 - 1}$
	5. $f(x) = (x^2 - 1)(x^2 - 2x + 1)$
	[sol: 1. positiva per $-2 < x < 0 \lor x > 2$; 2. positiva per $x > -2 \land x \neq 1$; 3. positiva per $-1 < x < 0 \lor 0 < x < 3$, negativa per $x < -1 \lor x > 3$; 4. dominio $x \leq -1 \lor x \geq 1$, positiva per $x > 2$, negativa per $x < -1 \lor 1 < x < 2$; 5. $f(x) = (x + 1)(x - 1)^3$, positiva per $x < -1 \lor x > 1$.]
2. **[EE/F]** In ciascuno dei seguenti casi scrivi l'espressione analitica di una funzione polinomiale di grado minimo che rispetti le condizioni date. La funzione è unica? Se no, trovane altre due.
	1. È positiva per $x < -1$, negativa per $-1 < x < 2$ e per $2 < x < 4$, positiva per $x > 4$.
	2. È negativa per ogni $x \neq 0$ e $x \neq 3$.
	3. Si annulla in $-2$, $0$ e $5$, ed è positiva per $x > 5$ e per $x < -2$.
	[sol: 1. ad esempio $(x + 1)(x - 2)^2(x - 4)$; 2. ad esempio $-x^2(x - 3)^2$; 3. ad esempio $x^2(x + 2)(x - 5)$. Nessuna è unica: si può moltiplicare per una costante positiva, aumentare di due la molteplicità di uno zero, moltiplicare per un fattore sempre positivo come $x^2 + 1$.]
3. **[EE]** Stabilisci se le seguenti funzioni sono pari, dispari o né pari né dispari. Giustifica la risposta sia algebricamente sia descrivendo la simmetria del grafico.
	1. $f(x) = x^4 - 3x^2 + 1$
	2. $f(x) = x^3 - x$
	3. $f(x) = x^3 - x + 1$
	4. $f(x) = \sqrt{4 - x^2}$
	5. $f(x) = \dfrac{x}{x^2 + 1}$
	6. $f(x) = \lvert x \rvert - x^2$
	7. $f(x) = \sqrt{x}$
	8. $f(x) = (x - 1)^2$
	9. $f(x) = x \lvert x \rvert$
	10. $f(x) = \dfrac{x^2 - 1}{x - 1}$
	[sol: 1. pari; 2. dispari; 3. né pari né dispari; 4. pari; 5. dispari; 6. pari; 7. né pari né dispari (dominio non simmetrico); 8. né pari né dispari; 9. dispari; 10. né pari né dispari: il dominio $x \neq 1$ non è simmetrico, anche se $f(x) = x + 1$ per $x \neq 1$.]
4. **[EE/F]** In figura sono rappresentate le porzioni dei grafici delle funzioni $f$ e $g$ per $x \geq 0$.
	```matephis
	{
	  "layout": "row",
	  "mobileColumns": 1,
	  "labels": ["f", "g"],
	  "shared": { "xlim": [-4.9, 4.9], "ylim": [-2.9, 2.9], "aspectRatio": "5:3" },
	  "plots": [
	    { "data": [
	      { "type": "interpolation", "points": [[0, 1], [1, 2], [2, 0], [3, -1], [4, 0]], "smoothness": 0, "color": "red1" },
	      { "points": [[0, 1]], "radius": 4, "fillColor": "red1" }
	    ] },
	    { "data": [
	      { "type": "interpolation", "points": [[0, 0], [1, 2], [3, -1], [4, 1]], "smoothness": 0, "color": "black1" },
	      { "points": [[0, 0]], "radius": 4, "fillColor": "black1" }
	    ] }
	  ]
	}
	```
	1. Completa il grafico di $f$ in modo che $f$ sia pari. È possibile completarlo in modo che $f$ sia dispari?
	2. Completa il grafico di $g$ in modo che $g$ sia pari, poi in modo che sia dispari.
	3. Nel caso in cui $g$ sia dispari, calcola $g(-1)$, $g(-3)$ e risolvi l'equazione $g(x) = 0$.
	[sol: 1. Non è possibile: una funzione dispari definita in $0$ deve avere $f(0) = -f(0)$, cioè $f(0) = 0$, mentre $f(0) = 1$. 3. $g(-1) = -2$, $g(-3) = 1$; $g(x) = 0$ per $x = 0$, $x = \pm \frac 7 3$, $x = \pm \frac 7 2$.]

### Trasformazioni, funzioni fratte e funzioni composte

1. **[EE]** In figura è rappresentato il grafico della funzione $f$, definita nell'intervallo $[-3, 3]$.
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-4.9, 4.9],
	  "ylim": [-2.4, 2.9],
	  "data": [
	    { "type": "interpolation", "points": [[-3, 0], [-2, 2], [0, 2], [2, -1], [3, 0]], "smoothness": 0, "color": "red1" },
	    { "points": [[-3, 0], [3, 0]], "radius": 4, "fillColor": "red1" }
	  ]
	}
	```
	Traccia i grafici delle seguenti funzioni, indicandone dominio e immagine.
	1. $f(x) + 2$ e $f(x + 2)$
	2. $-f(x)$ e $f(-x)$
	3. $2f(x)$ e $f(2x)$
	4. $\lvert f(x) \rvert$ e $f(\lvert x \rvert)$
	5. $-f(x - 1) + 1$
	[sol: ad esempio, $f(x + 2)$ ha dominio $-5 \leq x \leq 1$ e immagine $-1 \leq y \leq 2$; $f(2x)$ ha dominio $-\frac 3 2 \leq x \leq \frac 3 2$ e la stessa immagine di $f$; $f(\lvert x \rvert)$ è pari, con dominio $-3 \leq x \leq 3$ e immagine $-1 \leq y \leq 2$; $-f(x - 1) + 1$ ha dominio $-2 \leq x \leq 4$ e immagine $-1 \leq y \leq 2$.]
2. **[EE/F]** Studia il segno delle seguenti funzioni fratte e tracciane un grafico indicativo. Come cambia il grafico vicino a uno zero del denominatore di molteplicità dispari rispetto a uno di molteplicità pari?
	1. $f(x) = \dfrac{1}{x - 1}$
	2. $f(x) = \dfrac{1}{(x - 1)^2}$
	3. $f(x) = \dfrac{x + 1}{x - 2}$
	4. $f(x) = \dfrac{x}{(x - 1)^2}$
	5. $f(x) = \dfrac{x^2 - 4}{x^2 - 1}$
	[sol: 1. positiva per $x > 1$; 2. positiva per $x \neq 1$; 3. positiva per $x < -1 \lor x > 2$; 4. positiva per $x > 0 \land x \neq 1$; 5. positiva per $x < -2 \lor -1 < x < 1 \lor x > 2$. Vicino a uno zero del denominatore di molteplicità dispari la funzione cambia segno ("salto" da un estremo all'altro dell'asse $y$), di molteplicità pari no.]
3. **[PD]** In figura è rappresentato il grafico di una funzione fratta $f$, il cui numeratore e il cui denominatore sono polinomi di grado non superiore a $2$. Scrivi una possibile espressione analitica di $f$, motivando ogni scelta.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-5.9, 5.9],
	  "ylim": [-2.9, 5.9],
	  "data": [
	    { "fn": "(x+2)/(x-1)^2", "color": "red1" },
	    { "x": 1, "color": "black4", "dash": "5,5", "width": 1.5 },
	    { "points": [[0, 2], [-2, 0]], "radius": 4, "fillColor": "red1" }
	  ]
	}
	```
	[sol: $f(x) = \frac{x + 2}{(x - 1)^2}$: zero semplice in $x = -2$ (la funzione cambia segno), zero doppio del denominatore in $x = 1$ (la funzione non cambia segno vicino all'asintoto), $f(0) = 2$; il grado del denominatore è maggiore di quello del numeratore, quindi per $x$ molto grande in valore assoluto la funzione si avvicina a $0$.]
4. **[PD]** In figura è rappresentato il grafico della funzione polinomiale $f(x) = \frac 1 4 (x + 2)(x - 1)(x - 3)$. Traccia un grafico indicativo della funzione $g(x) = \dfrac{1}{f(x)}$, ragionando come per la radice quadrata: quali punti del grafico di $f$ restano fissi? Dove i valori vengono "ingranditi" e dove "rimpiccioliti"? Che cosa succede vicino agli zeri di $f$?
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-3.9, 4.9],
	  "ylim": [-3.9, 3.9],
	  "data": [
	    { "fn": "(x+2)(x-1)(x-3)/4", "color": "red1" },
	    { "fn": "1", "color": "black4", "dash": "5,5", "width": 1.5 },
	    { "fn": "-1", "color": "black4", "dash": "5,5", "width": 1.5 }
	  ]
	}
	```
	[sol: restano fissi i punti in cui $f(x) = 1$ o $f(x) = -1$; dove $0 < \lvert f(x) \rvert < 1$ i valori vengono ingranditi in valore assoluto, dove $\lvert f(x) \rvert > 1$ rimpiccioliti; il segno non cambia; gli zeri di $f$ ($-2$, $1$, $3$) diventano asintoti verticali di $g$, e per $x$ molto grande in valore assoluto $g$ si avvicina a $0$.]
5. **[F]** Traccia un grafico indicativo delle seguenti funzioni, partendo dal grafico della funzione "interna" e ragionando su dominio, segno, crescenza e decrescenza. Verifica i grafici con un software.
	1. $f(x) = \sqrt{\lvert x^2 - 4 \rvert}$
	2. $f(x) = \lvert \sqrt{x} - 1 \rvert$
	3. $f(x) = \sqrt{x^2 - 2x + 1}$
	4. $f(x) = \dfrac{1}{x^2 + 1}$
	5. $f(x) = \sqrt{\dfrac 1 x}$
	6. $f(x) = \dfrac{1}{\lvert x \rvert - 2}$
	[sol: in particolare, la funzione 3 coincide con $\lvert x - 1 \rvert$; la 4 è pari, ha un massimo in $(0; 1)$ e si avvicina a $0$ per $x$ grandi in valore assoluto; la 6 è pari, con asintoti verticali $x = \pm 2$.]

### Contrazioni e punti fissi

1. **[EE]** Considera la funzione $f(x) = \frac 1 2 x + 3$.
	1. Verifica che $f$ è una contrazione su $\mathbb{R}$, determinando un valore di $q$.
	2. Partendo da $x_0 = 0$, calcola i numeri $x_1 = f(x_0)$, $x_2 = f(x_1)$, $x_3 = f(x_2)$, … fino a $x_6$ e riportali in una tabella. A quale numero sembrano avvicinarsi? Ripeti partendo da $x_0 = 20$.
	3. Rappresenta la successione nel piano cartesiano con il metodo "a ragnatela": parti dal punto $(x_0; 0)$, sali verticalmente fino al grafico di $f$, spostati orizzontalmente fino alla bisettrice $y = x$, poi di nuovo verticalmente fino al grafico, e così via.
	4. Determina algebricamente il punto fisso di $f$.
	```matephis
	{
	  "aspectRatio": "1:1",
	  "xlim": [-0.9, 9.9],
	  "ylim": [-0.9, 9.9],
	  "legend": true,
	  "data": [
	    { "fn": "x/2 + 3", "color": "red1", "label": "y = f(x)" },
	    { "fn": "x", "color": "black3", "dash": "5,5", "label": "y = x" }
	  ]
	}
	```
	[sol: 1. $\lvert f(x_1) - f(x_2) \rvert = \frac 1 2 \lvert x_1 - x_2 \rvert$, quindi $q = \frac 1 2$. 2. $0$; $3$; $4{,}5$; $5{,}25$; $5{,}625$; $5{,}8125$; $5{,}90625$: i valori si avvicinano a $6$ (anche partendo da $20$). 4. $\bar x = 6$.]
2. **[F]** Stabilisci quali delle seguenti funzioni sono contrazioni sull'insieme indicato. Per ciascuna, verifica anche che le immagini dei punti dell'insieme appartengano ancora all'insieme.
	1. $f(x) = 2x$ su $\mathbb{R}$
	2. $f(x) = x + 1$ su $\mathbb{R}$
	3. $f(x) = -0{,}9x + 1$ su $\mathbb{R}$
	4. $f(x) = \frac 1 3 \lvert x \rvert$ su $\mathbb{R}$
	5. $f(x) = x^2$ su $[0, \frac 1 3]$ e su $[0, 1]$
	6. $f(x) = \sqrt{x}$ su $[1, +\infty)$
	[hint: per la 5 scomponi $x_1^2 - x_2^2$; per la 6 razionalizza $\sqrt{x_1} - \sqrt{x_2}$.]
	[sol: 1. no; 2. no (conserva le distanze); 3. sì, $q = 0{,}9$; 4. sì, $q = \frac 1 3$, perché $\lvert \lvert x_1 \rvert - \lvert x_2 \rvert \rvert \leq \lvert x_1 - x_2 \rvert$; 5. su $\lbrack 0, \frac 1 3 \rbrack$ sì, con $q = \frac 2 3$, perché $\lvert x_1^2 - x_2^2 \rvert = \lvert x_1 + x_2 \rvert \cdot \lvert x_1 - x_2 \rvert$; su $\lbrack 0, 1 \rbrack$ no (prova con $x_1 = 1$ e $x_2 = 0{,}9$); 6. sì, $q = \frac 1 2$, perché $\lvert \sqrt{x_1} - \sqrt{x_2} \rvert = \frac{\lvert x_1 - x_2 \rvert}{\sqrt{x_1} + \sqrt{x_2}}$ e il denominatore è almeno $2$; il punto fisso è $1$.]
3. **[F]** Per una funzione reale di variabile reale, la condizione $\lvert f(x_1) - f(x_2) \rvert \leq q \lvert x_1 - x_2 \rvert$ ha un significato geometrico: tutte le corde del grafico hanno pendenza compresa tra $-q$ e $q$. Nel grafico interattivo è rappresentata $f(x) = \frac 1 4 x^2$ per $0 \leq x \leq 3$: usa lo strumento "pendenza" per misurare la pendenza di alcune corde.
	```matephis
	{
	  "aspectRatio": "1:1",
	  "xlim": [-0.4, 3.4],
	  "ylim": [-0.4, 3.4],
	  "interactive": true,
	  "slopeSelection": true,
	  "data": [
	    { "fn": "x^2/4", "domain": [0, 3], "color": "red1" },
	    { "fn": "x", "color": "black4", "dash": "5,5", "width": 1.5 }
	  ]
	}
	```
	1. $f$ è una contrazione sull'intervallo $[0, 1]$? E sull'intervallo $[0, 3]$? Giustifica la risposta sia algebricamente sia con il grafico.
	2. Quali sono i punti fissi di $f$? Uno di questi non appartiene all'intervallo $[0, 1]$: è in contraddizione con il fatto che una contrazione ha al più un punto fisso?
	[sol: 1. su $\lbrack 0, 1 \rbrack$ sì, con $q = \frac 1 2$, perché $\frac 1 4 \lvert x_1 + x_2 \rvert \leq \frac 1 2$; su $\lbrack 0, 3 \rbrack$ no: la funzione porta l'intervallo in sé, ma le corde con estremi vicini a $x = 3$ hanno pendenza maggiore di $1$ (la pendenza della corda vale $\frac{x_1 + x_2}{4}$). 2. $0$ e $4$; non c'è contraddizione, perché su un intervallo che contiene sia $0$ sia $4$ la funzione non è una contrazione.]
4. **[AD]** Considera la funzione $f(x) = \dfrac x 2 + \dfrac 1 x$ sull'intervallo $[1, 2]$.
	1. Verifica che $f(x_1) - f(x_2) = (x_1 - x_2)\left(\dfrac 1 2 - \dfrac{1}{x_1 x_2}\right)$ e deduci che $f$ è una contrazione su $[1, 2]$.
	2. Verifica che le immagini dei punti di $[1, 2]$ appartengono ancora a $[1, 2]$.
	3. Partendo da $x_0 = 1$, calcola i primi quattro termini della successione $x_{n+1} = f(x_n)$. Quale numero stai approssimando? Confronta il risultato con quello della calcolatrice.
	[sol: 1. se $1 \leq x_1, x_2 \leq 2$ allora $1 \leq x_1 x_2 \leq 4$ e il fattore in parentesi è compreso tra $-\frac 1 2$ e $\frac 1 4$: $q = \frac 1 2$. 2. per $x \geq 1$ si ha $f(x) - \sqrt 2 = \frac{(x - \sqrt 2)^2}{2x} \geq 0$, e $f(1) = f(2) = \frac 3 2$, quindi le immagini sono comprese tra $\sqrt 2$ e $\frac 3 2$. 3. $1{,}5$; $1{,}41\overline{6}$; $1{,}414215\ldots$; $1{,}41421356\ldots$: si approssima $\sqrt 2$, il punto fisso di $f$.]

## Quesiti

### Ragionare sulle definizioni

1. **[F]** Una funzione strettamente crescente sul suo dominio è invertibile?
	[sol: sì, se il codominio coincide con l'immagine: una funzione strettamente crescente è iniettiva.]
2. **[F+]** Una funzione invertibile è strettamente crescente sul suo dominio?
	[sol: no: ad esempio $f(x) = -x$, $f(x) = 1/x$ con dominio $x \neq 0$, oppure una funzione definita a tratti che "salta" (ad esempio $f(x) = x$ per $x \leq 0$ e $f(x) = 1/x$ per $x > 0$, che è biiettiva da $\mathbb{R}$ a $\mathbb{R}$).]
3. **[F]** Scrivi, usando i quantificatori, le negazioni delle proposizioni "$f$ è iniettiva" e "$f$ è suriettiva". Poi usale per dimostrare che $f : \mathbb{R} \to \mathbb{R}$, $f(x) = x^2 - 2x$ non è né iniettiva né suriettiva.
	[sol: "$f$ non è iniettiva": esistono $x_1 \neq x_2$ tali che $f(x_1) = f(x_2)$, ad esempio $f(0) = f(2) = 0$. "$f$ non è suriettiva": esiste $y \in B$ tale che, per ogni $x \in A$, $f(x) \neq y$, ad esempio $y = -2$, perché $x^2 - 2x = (x - 1)^2 - 1 \geq -1$.]
4. **[PD]** Stabilisci se ciascuna delle seguenti affermazioni è vera o falsa. Se è vera, dimostrala; se è falsa, trova un controesempio, possibilmente rappresentandolo con un grafico o un diagramma.
	1. La composizione di due funzioni iniettive è iniettiva.
	2. La somma di due funzioni iniettive è iniettiva.
	3. La somma di due funzioni crescenti è crescente.
	4. Il prodotto di due funzioni crescenti è crescente.
	5. Se $g \circ f$ è iniettiva, allora $f$ è iniettiva.
	6. Se $g \circ f$ è iniettiva, allora $g$ è iniettiva.
	7. Se $g \circ f$ è suriettiva, allora $g$ è suriettiva.
	8. Il prodotto di due funzioni dispari è dispari.
	9. La composizione di una funzione pari con una funzione qualsiasi è pari.
	[sol: 1. V; 2. F, ad esempio $x$ e $-x$; 3. V; 4. F, ad esempio $x \cdot x$ su $\mathbb{R}$; 5. V; 6. F, ad esempio $f(x) = \sqrt x$ e $g(x) = x^2$; 7. V; 8. F, è pari; 9. F: $g \circ f$ è pari se $f$ è pari (ad esempio $\sqrt{x^2 + 1}$), ma non necessariamente se è pari solo $g$ (ad esempio $g(x) = x^2$, $f(x) = x + 1$).]
5. **[PD]** Rispondi giustificando.
	1. Esiste una funzione $f : \mathbb{R} \to \mathbb{R}$ che sia sia pari sia dispari?
	2. Se $f$ è dispari ed è definita in $0$, quanto vale $f(0)$?
	3. Una funzione pari può essere iniettiva?
	4. **[AD]** Dimostra che ogni funzione $f : \mathbb{R} \to \mathbb{R}$ si può scrivere come somma di una funzione pari e di una funzione dispari.
	[hint: per la 4 considera $p(x) = \frac{f(x) + f(-x)}{2}$.]
	[sol: 1. solo la funzione nulla, perché $f(x) = f(-x) = -f(x)$; 2. $f(0) = 0$; 3. solo se il dominio è $\lbrace 0 \rbrace$; 4. $f(x) = \frac{f(x) + f(-x)}{2} + \frac{f(x) - f(-x)}{2}$, dove il primo addendo è pari e il secondo dispari.]
6. **[F]** Disegna, se possibile, il grafico di una funzione $f : [0, 4] \to [0, 2]$ che sia:
	1. suriettiva ma non iniettiva;
	2. iniettiva ma non suriettiva;
	3. biiettiva ma non monotona;
	4. né iniettiva né suriettiva.
	5. **[D]** È possibile disegnare il grafico di una funzione come quella del punto 3 senza mai staccare la matita dal foglio? Prova a spiegare perché.
	[sol: 3. ad esempio una funzione definita a tratti, che salta; 5. no: una funzione disegnata "senza staccare la matita" che cresce e poi decresce (o viceversa) assume due volte qualche valore, quindi non è iniettiva.]
7. **[AD]** Sia $f : A \to B$ e siano $X$, $Y$ due sottoinsiemi di $A$.
	1. Dimostra che $f(X \cup Y) = f(X) \cup f(Y)$.
	2. Dimostra che $f(X \cap Y) \subseteq f(X) \cap f(Y)$ e mostra, con $f(x) = x^2$, che l'inclusione può essere stretta.
	3. Per quali funzioni vale sempre $f(X \cap Y) = f(X) \cap f(Y)$?
	[sol: 2. ad esempio $X = \lbrace -1 \rbrace$, $Y = \lbrace 1 \rbrace$: $f(X \cap Y)$ è vuoto, mentre $f(X) \cap f(Y) = \lbrace 1 \rbrace$; 3. per le funzioni iniettive.]
8. **[AD]** Una funzione $f : \mathbb{R} \to \mathbb{R}$ tale che $f(f(x)) = x$ per ogni $x$ si dice *involuzione*.
	1. Dimostra che un'involuzione è biiettiva e coincide con la propria inversa.
	2. Che simmetria possiede il grafico di un'involuzione?
	3. Trova almeno quattro involuzioni diverse, di cui almeno una definita a tratti.
	[sol: 1. se $f(x_1) = f(x_2)$ allora $x_1 = f(f(x_1)) = f(f(x_2)) = x_2$; ogni $y$ è immagine di $f(y)$. 2. È simmetrico rispetto alla bisettrice $y = x$. 3. Ad esempio $x$, $-x$, $5 - x$ e, con dominio $x \neq 0$, $1/x$; definita a tratti: $f(x) = x + 1$ per $0 \leq x < 1$, $f(x) = x - 1$ per $1 \leq x < 2$, $f(x) = x$ altrove (scambia due intervalli).]
9. **[EE]** Scrivi due verità e una menzogna in merito alla funzione $f$ il cui grafico è rappresentato in figura. Scambia le tue affermazioni con quelle di un compagno: riesci a individuare la sua menzogna?
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-4.9, 4.9],
	  "ylim": [-0.9, 3.9],
	  "data": [
	    { "fn": "sqrt(x^2-4)", "domain": [-5, -2], "color": "red1" },
	    { "fn": "sqrt(x^2-4)", "domain": [2, 5], "color": "red1" },
	    { "fn": "sqrt(2-x^2)", "domain": [-1.41421356, 1.41421356], "color": "red1" }
	  ]
	}
	```
	[sol: risposta aperta; ad esempio, sono vere "$f$ è pari" e "$f(0) = \sqrt 2$", è falsa "$f$ è iniettiva".]
10. **[EE]** Scrivi due verità e una menzogna in merito alla funzione $f(x) = \dfrac{\sqrt{x^2 + 1}}{x^2 + 1}$.
	[sol: risposta aperta; ad esempio, sono vere "$f(x) = \frac{1}{\sqrt{x^2 + 1}}$" e "l'immagine di $f$ è $0 < y \leq 1$", è falsa "$f$ è dispari".]

### Funzioni e realtà

1. **[E]** Per ciascuna delle seguenti funzioni, descrivi un fenomeno da esse modellizzato, precisando il significato delle variabili e le unità di misura:
	1. $f(x) = -2x + 3$;
	2. $f(t) = 4{,}9\,t^2$;
	3. $f(x) = \dfrac{120}{x}$, con $x > 0$;
	4. $f(n) = 2n + 0{,}50$, con $n$ numero naturale.
2. **[E]** Descrivi un fenomeno che possa essere modellizzato dalla funzione il cui grafico è rappresentato in figura. Che cosa rappresentano le variabili? Che significato hanno i tratti quasi orizzontali?
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-50, 260],
	  "ylim": [-20, 120],
	  "data": [
	    { "fn": "100/(1 + exp(-(x - 50)/10))", "color": "red1" }
	  ]
	}
	```

### Infiniti a confronto

1. **[EE]** Costruisci una funzione iniettiva da $(0, 1)$ a $[0, 1]$ e una funzione iniettiva da $[0, 1]$ a $(0, 1)$. Rappresentale con un grafico. Sono suriettive?
	[sol: ad esempio $f(x) = x$ (inclusione) e $g(x) = \frac 1 2 x + \frac 1 4$; nessuna delle due è suriettiva.]
2. **[PD-]** Costruisci una biiezione tra $[1, 2]$ e $[1, 100]$. Poi costruisci una biiezione tra $(0, 1)$ e $(1, +\infty)$ e una tra $(0, 1)$ e $(0, +\infty)$.
	[sol: ad esempio $f(x) = 99x - 98$; $g(x) = \frac 1 x$; $h(x) = \frac{x}{1 - x}$.]
3. **[AD]** Costruisci una biiezione tra $(0, 1)$ e $\mathbb{R}$.
	[hint: considera la funzione $\frac{1}{1 - x} - \frac 1 x$: è la somma di due funzioni crescenti…]
	[sol: ad esempio $f(x) = \frac{1}{1 - x} - \frac 1 x$: è strettamente crescente (somma di due funzioni strettamente crescenti), assume valori arbitrariamente grandi in valore assoluto vicino a $0$ e vicino a $1$ e il suo grafico non ha "salti".]
4. **[EE/F]** Costruisci una biiezione tra $\mathbb{N}$ e l'insieme dei numeri pari, e una tra $\mathbb{N}$ e $\mathbb{Z}$. Rappresentale con un grafico (che sarà formato da punti isolati). Che cosa hanno di "strano" questi risultati, rispetto a quanto accade per gli insiemi finiti?
	[sol: ad esempio $n \mapsto 2n$; $n \mapsto \frac n 2$ se $n$ è pari, $n \mapsto -\frac{n + 1}{2}$ se $n$ è dispari. Un insieme infinito può essere messo in corrispondenza biunivoca con una sua parte propria, cosa impossibile per gli insiemi finiti.]
5. **[D]** Si può costruire una biiezione tra $[0, 1]$ e $(0, 1)$? Ovvero, $[0, 1]$ e $(0, 1)$ hanno la stessa cardinalità? Se sì, come? Se no, perché?
	[hint: pensa all'albergo di Hilbert: considera i numeri $0$, $1$, $\frac 1 2$, $\frac 1 3$, $\frac 1 4$, … e "fai spazio" spostando ciascuno di due posti.]
	[sol: sì: ad esempio $f(0) = \frac 1 2$, $f(1) = \frac 1 3$, $f(\frac 1 n) = \frac{1}{n + 2}$ per ogni intero $n \geq 2$, e $f(x) = x$ per tutti gli altri numeri.]
6. **[D]** È possibile disegnare il grafico di una biiezione tra $[0, 1]$ e $(0, 1)$ senza staccare la matita dal foglio? Prova a spiegare perché.
	[sol: no: il grafico di una funzione disegnata senza staccare la matita su un intervallo chiuso ha un punto più alto, il cui valore $M$ appartiene a $(0, 1)$; allora i valori compresi tra $M$ e $1$ non sono assunti.]
7. **[PD]** Costruisci una funzione iniettiva da $(0, 1)$ al quadrato $[0, 1] \times [0, 1]$. Rappresentala nel piano.
	[sol: ad esempio $x \mapsto (x, x)$, la cui immagine è una diagonale del quadrato privata degli estremi.]
8. **[D]** Vogliamo costruire una funzione iniettiva dal quadrato $[0, 1] \times [0, 1]$ all'intervallo $(0, 1)$. Proviamo ad "alternare le cifre": alla coppia $(0{,}a_1 a_2 a_3 \ldots; \; 0{,}b_1 b_2 b_3 \ldots)$ associamo il numero $0{,}a_1 b_1 a_2 b_2 a_3 b_3 \ldots$
	1. Calcola l'immagine delle coppie $(0{,}5; 0{,}25)$ e $(0{,}\overline{3}; 0{,}1)$.
	2. Il numero $0{,}1$ si può scrivere anche come $0{,}0\overline{9}$. Perché questo crea un problema? Come si può risolvere?
	3. Come si deve trattare il numero $1 = 0{,}\overline{9}$? E la coppia $(0; 0)$, che ha immagine $0 \notin (0, 1)$? Modifica la costruzione, eventualmente componendola con una delle funzioni dei quesiti precedenti, in modo da ottenere una funzione iniettiva da $[0, 1] \times [0, 1]$ a $(0, 1)$.
	4. La funzione costruita è suriettiva?
	[sol: 1. $0{,}5205$ e $0{,}31\overline{30}$, cioè $0{,}31303030\ldots$ 2. Una stessa coppia avrebbe due immagini diverse: si sceglie sempre la scrittura che non termina con infiniti $9$, tranne che per il numero $1$, scritto $0{,}\overline{9}$. 3. Si compone con $t \mapsto \frac 1 2 t + \frac 1 4$, che è iniettiva da $\lbrack 0, 1 \rbrack$ a $(0, 1)$. 4. No: dopo la composizione le immagini sono comprese tra $\frac 1 4$ e $\frac 3 4$; ma anche prima, ad esempio, il numero $0{,}00\overline{90}$ non è immagine di alcuna coppia, perché richiederebbe di scrivere la prima coordinata come $0{,}0\overline{9}$.]

### Contrazioni e punti fissi

1. **[PD]** Dimostra che una contrazione ha al più un punto fisso.
	[hint: supponi per assurdo che ce ne siano due distinti, $a$ e $b$, e confronta $\lvert f(a) - f(b) \rvert$ con $\lvert a - b \rvert$.]
	[sol: se $f(a) = a$ e $f(b) = b$ con $a \neq b$, allora $\lvert a - b \rvert = \lvert f(a) - f(b) \rvert \leq q \lvert a - b \rvert < \lvert a - b \rvert$, assurdo.]
2. **[PD]** Rispondi giustificando.
	1. Una contrazione è necessariamente iniettiva? È necessariamente monotona?
	2. Una contrazione $f : [0, 1] \to [0, 1]$ può essere suriettiva?
	3. Una contrazione $f : \mathbb{R} \to \mathbb{R}$ può essere suriettiva?
	[sol: 1. no in entrambi i casi, ad esempio $f(x) = \frac 1 2 \lvert x \rvert$; 2. no: per ogni $x_1, x_2$ dell'intervallo si ha $\lvert f(x_1) - f(x_2) \rvert \leq q \lvert x_1 - x_2 \rvert \leq q < 1$, quindi $0$ e $1$ non possono essere entrambi immagini; 3. sì, ad esempio $f(x) = \frac x 2$.]
3. **[PD]** La funzione $f(x) = \frac x 2$, definita sull'intervallo $(0, 1]$, è una contrazione da $(0, 1]$ in $(0, 1]$? Ha un punto fisso? Quale ipotesi del teorema delle contrazioni non è soddisfatta?
	[sol: è una contrazione con $q = \frac 1 2$, ma non ha punti fissi in quell'intervallo: le iterazioni si avvicinano a $0$, che non appartiene all'insieme. Il teorema richiede un insieme "senza buchi", come un intervallo chiuso o tutto $\mathbb{R}$.]
4. **[F]** Appoggi sul banco una cartina di Torino, nella tua aula a Torino. Spiega perché c'è esattamente un punto della cartina che si trova esattamente sopra il punto della città che rappresenta. Vale ancora se la cartina è ruotata? E se la cartina è di Cuneo?
	[sol: la funzione che associa a ogni punto della città il punto corrispondente della cartina (pensata come porzione di città) è una contrazione dalla città in sé, quindi ha esattamente un punto fisso, anche se la cartina è ruotata. Se la cartina rappresenta un'altra città, non è più una funzione dalla città in sé e il ragionamento non si applica.]
5. **[D]** La funzione $f(x) = x + \dfrac 1 x$, sull'intervallo $[1, +\infty)$, soddisfa la condizione $\lvert f(x_1) - f(x_2) \rvert < \lvert x_1 - x_2 \rvert$ per ogni $x_1 \neq x_2$. Ha punti fissi? Perché non contraddice il teorema delle contrazioni?
	[sol: nessun punto fisso, perché $x + \frac 1 x = x$ è impossibile. Non è una contrazione: $f(x_1) - f(x_2) = (x_1 - x_2)\left(1 - \frac{1}{x_1 x_2}\right)$ e il fattore in parentesi si avvicina a $1$ quanto si vuole, quindi non esiste un $q < 1$ che vada bene per tutte le coppie.]

### Sfida

1. **[TD]** Esiste una funzione $f : \mathbb{R} \to \mathbb{R}$ tale che $f(f(x)) = -x$ per ogni $x$? Se sì, costruiscine una e rappresentane il grafico; se no, spiega perché.
	[hint: poni $f(0) = 0$ e cerca di "far girare" i numeri a gruppi di quattro: $x \mapsto y \mapsto -x \mapsto -y \mapsto x$. Prova ad associare tra loro gli intervalli $0 < x \leq 1$, $1 < x \leq 2$ e i loro opposti.]
	[sol: sì, ma non si può disegnare senza staccare la matita. Ad esempio $f(0) = 0$; per $0 < x \leq 1$, $f(x) = x + 1$; per $1 < x \leq 2$, $f(x) = 1 - x$; per $-1 \leq x < 0$, $f(x) = x - 1$; per $-2 \leq x < -1$, $f(x) = -x - 1$; e analogamente sugli intervalli successivi, di ampiezza $2$.]

## Esplorazioni

In queste attività i grafici hanno uno o più **slider**. Prima di muoverli, segui sempre tre passi: **prevedi** (scrivi o disegna che cosa ti aspetti, senza toccare lo slider), **verifica** (muovi lo slider e confronta con la tua previsione), **giustifica** (spiega il risultato con il ragionamento o con l'algebra, soprattutto quando la previsione era sbagliata). Se lavori in gruppo, uno muove lo slider solo dopo che tutti hanno dichiarato la propria previsione.

1. **[EE/F] Quante soluzioni?** Nei grafici sono rappresentate le funzioni $f(x) = x^3 - 3x$ e $g(x) = \lvert x^2 - 4 \rvert$, insieme alla retta $y = k$, comandata da uno slider.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-3.9, 3.9],
	  "ylim": [-3.9, 3.9],
	  "sliderBorder": true,
	  "params": {
	    "k": {"min": -3.5, "max": 3.5, "step": 0.1, "val": 3}
	  },
	  "data": [
	    {"fn": "x^3 - 3x", "color": "red1"},
	    {"fn": "k", "color": "black1", "dash": "6,4", "width": 2}
	  ]
	}
	```
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-3.9, 3.9],
	  "ylim": [-1.9, 5.9],
	  "sliderBorder": true,
	  "params": {
	    "k": {"min": -1.5, "max": 5.5, "step": 0.1, "val": 5}
	  },
	  "data": [
	    {"fn": "|x^2 - 4|", "color": "red1"},
	    {"fn": "k", "color": "black1", "dash": "6,4", "width": 2}
	  ]
	}
	```
	1. **Prevedi.** Per quali valori di $k$ l'equazione $f(x) = k$ ha $0$, $1$, $2$, $3$ soluzioni? E l'equazione $g(x) = k$? Riporta le previsioni in una tabella.
	2. **Verifica** con lo slider, correggendo la tabella dove necessario.
	3. Il numero di soluzioni dell'equazione è a sua volta una funzione di $k$: chiamala $N(k)$. Traccia il grafico di $N$ per ciascuna delle due funzioni. Quali sono dominio e immagine di $N$?
	4. **Giustifica.** Che cosa deve accadere al grafico di $N$ perché la funzione di partenza sia iniettiva? E perché sia suriettiva su $\mathbb{R}$? Applica la risposta a $f$ e a $g$.
	[sol: per $f$: una soluzione se $\lvert k \rvert > 2$, due se $\lvert k \rvert = 2$, tre se $\lvert k \rvert < 2$; per $g$: nessuna se $k < 0$, due se $k = 0$, quattro se $0 < k < 4$, tre se $k = 4$, due se $k > 4$. Una funzione è iniettiva se e solo se $N(k) \leq 1$ per ogni $k$, suriettiva su $\mathbb{R}$ se e solo se $N(k) \geq 1$ per ogni $k$: $f$ è suriettiva ma non iniettiva, $g$ né l'una né l'altra.]
2. **[F] La ragnatela.** Nel grafico è rappresentata la funzione $f(x) = mx + q$, con $m$ e $q$ comandati da slider. Partendo dal numero $x_0$ (anch'esso su uno slider), la spezzata azzurra costruisce i numeri $x_1 = f(x_0)$, $x_2 = f(x_1)$, … con il metodo "a ragnatela": su in verticale fino al grafico, poi in orizzontale fino alla bisettrice, e così via.
	```matephis
	{
	  "aspectRatio": "1:1",
	  "xlim": [-6.9, 6.9],
	  "ylim": [-6.9, 6.9],
	  "legend": true,
	  "sliderBorder": true,
	  "params": {
	    "m": {"min": -1.5, "max": 1.5, "step": 0.05, "val": 0.5},
	    "q": {"min": -3, "max": 3, "step": 0.5, "val": 2},
	    "s": {"label": "x₀", "min": -6, "max": 6, "step": 0.5, "val": -5}
	  },
	  "data": [
	    {"fn": "m*x + q", "color": "red1", "label": "y = f(x)"},
	    {"fn": "x", "color": "black3", "dash": "5,5", "width": 1.5, "label": "y = x"},
	    {"vector": [["s", 0], ["s", "m*(s) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["s", "m*(s) + q"], ["m*(s) + q", "m*(s) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(s) + q", "m*(s) + q"], ["m*(s) + q", "m*(m*(s) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(s) + q", "m*(m*(s) + q) + q"], ["m*(m*(s) + q) + q", "m*(m*(s) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(s) + q) + q", "m*(m*(s) + q) + q"], ["m*(m*(s) + q) + q", "m*(m*(m*(s) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(s) + q) + q", "m*(m*(m*(s) + q) + q) + q"], ["m*(m*(m*(s) + q) + q) + q", "m*(m*(m*(s) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(s) + q) + q) + q", "m*(m*(m*(s) + q) + q) + q"], ["m*(m*(m*(s) + q) + q) + q", "m*(m*(m*(m*(s) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(s) + q) + q) + q", "m*(m*(m*(m*(s) + q) + q) + q) + q"], ["m*(m*(m*(m*(s) + q) + q) + q) + q", "m*(m*(m*(m*(s) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(m*(s) + q) + q) + q) + q", "m*(m*(m*(m*(s) + q) + q) + q) + q"], ["m*(m*(m*(m*(s) + q) + q) + q) + q", "m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(m*(s) + q) + q) + q) + q", "m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q"], ["m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q"], ["m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q"], ["m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q"], ["m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q) + q"], ["m*(m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"vector": [["m*(m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q) + q"], ["m*(m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q) + q", "m*(m*(m*(m*(m*(m*(m*(m*(s) + q) + q) + q) + q) + q) + q) + q) + q"]], "arrow": false, "color": "summer2", "width": 1.5},
	    {"points": [["s", 0]], "radius": 4, "fillColor": "summer2"}
	  ]
	}
	```
	1. **Prevedi**, disegnando a mano la ragnatela, che cosa accade ai numeri $x_n$ nei seguenti casi: $m = 0{,}5$, $q = 2$; $m = -0{,}5$, $q = 2$; $m = 1$, $q = 1$; $m = -1$, $q = 2$; $m = 1{,}2$, $q = -1$.
	2. **Verifica** con gli slider, provando diversi valori di partenza $x_0$. In quali casi i numeri si avvicinano sempre allo stesso valore, qualunque sia $x_0$? In quali casi si allontanano? Che cosa succede per $m = -1$?
	3. **Giustifica.** Per quali valori di $m$ la funzione $f$ è una contrazione? Determina il punto fisso $p$ di $f$ (quando esiste) e dimostra che $x_{n+1} - p = m\,(x_n - p)$. Che cosa dice questa uguaglianza sulla distanza di $x_n$ dal punto fisso?
	4. Quando $m < 0$ la ragnatela diventa una "spirale". Perché?
	[sol: $f$ è una contrazione se e solo se $\lvert m \rvert < 1$: allora i numeri $x_n$ si avvicinano al punto fisso $p = \frac{q}{1 - m}$ ($4$ nel primo caso, $\frac 4 3$ nel secondo). Per $m = 1$ e $q \neq 0$ non ci sono punti fissi e i numeri crescono (o decrescono) di $q$ a ogni passo; per $m = -1$ i numeri si alternano tra due valori, perché $f(f(x)) = x$; per $\lvert m \rvert > 1$ si allontanano dal punto fisso (a meno di partire proprio da esso). Dall'uguaglianza segue $\lvert x_n - p \rvert = \lvert m \rvert^n \lvert x_0 - p \rvert$. Se $m < 0$ la differenza $x_n - p$ cambia segno a ogni passo, quindi i numeri stanno alternativamente a destra e a sinistra del punto fisso.]
3. **[EE] Trasformazioni.** Nel grafico è rappresentata (tratteggiata) la funzione $f(x) = \sqrt{x}$ e, in rosso, la funzione $g(x) = a\,f(b(x - h)) + k$, i cui parametri sono comandati da slider.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-6.9, 6.9],
	  "ylim": [-4.9, 5.4],
	  "legend": true,
	  "sliderBorder": true,
	  "params": {
	    "a": {"min": -3, "max": 3, "step": 0.5, "val": 1},
	    "b": {"min": -3, "max": 3, "step": 0.5, "val": 1},
	    "h": {"min": -5, "max": 5, "step": 0.5, "val": 0},
	    "k": {"min": -4, "max": 4, "step": 0.5, "val": 0}
	  },
	  "data": [
	    {"fn": "sqrt(x)", "color": "black4", "dash": "5,5", "width": 2, "label": "y = f(x)"},
	    {"fn": "a*sqrt(b*(x - h)) + k", "color": "red1", "label": "y = g(x)"},
	    {"points": [["h", "k"]], "radius": 4, "fillColor": "red1"}
	  ]
	}
	```
	1. **Prevedi**, disegnando i grafici a mano, come si ottengono dal grafico di $f$ i grafici di $f(x - 2)$, $f(x) - 2$, $-f(x)$, $f(-x)$, $2f(x)$ e $f(2x)$.
	2. **Verifica** con gli slider: per ciascuna funzione, quali valori devi dare ai parametri?
	3. Il grafico di $f(2x - 4)$ si ottiene da quello di $f(2x)$ con una traslazione di $4$ o di $2$ unità? Prevedi, poi verifica.
	4. **Giustifica.** Come cambiano il dominio e l'immagine di $g$ al variare dei parametri? Che ruolo ha il punto evidenziato?
	5. Scegli i parametri in modo che il grafico di $g$ passi per i punti $(1; 0)$ e $(5; 4)$. La soluzione è unica?
	[sol: $f(x - 2)$ si sposta a destra di $2$ ($h = 2$), $f(x) - 2$ in basso ($k = -2$), $-f(x)$ si riflette rispetto all'asse $x$ ($a = -1$), $f(-x)$ rispetto all'asse $y$ ($b = -1$), $2f(x)$ si dilata verticalmente ($a = 2$), $f(2x)$ si comprime orizzontalmente ($b = 2$). Poiché $f(2x - 4) = f(2(x - 2))$, la traslazione è di $2$ unità. Il punto evidenziato $(h; k)$ è l'immagine dell'origine: il dominio di $g$ è $x \geq h$ se $b > 0$, $x \leq h$ se $b < 0$; l'immagine è $y \geq k$ se $a > 0$, $y \leq k$ se $a < 0$. Al punto 5, ad esempio $a = 2$, $b = 1$, $h = 1$, $k = 0$; la soluzione non è unica, perché conta solo il prodotto $a\sqrt{b}$: va bene anche $a = 1$, $b = 4$, valore che però lo slider non permette di raggiungere.]
4. **[F] Restrizioni.** Nel grafico è rappresentata la funzione $f(x) = x^2 - 2x$ ristretta all'intervallo $[a, b]$ (in rosso), con $a$ e $b$ comandati da slider ($a < b$). Il segmento verde sull'asse $y$ rappresenta l'immagine della restrizione.
	```matephis
	{
	  "aspectRatio": "1:1",
	  "xlim": [-3.4, 5.4],
	  "ylim": [-2.4, 6.4],
	  "sliderBorder": true,
	  "params": {
	    "a": {"min": -3, "max": 5, "step": 0.5, "val": -1},
	    "b": {"min": -3, "max": 5, "step": 0.5, "val": 3}
	  },
	  "data": [
	    {"fn": "x^2 - 2x", "color": "black4", "dash": "5,5", "width": 1.5},
	    {"fn": "x^2 - 2x", "domain": ["a", "b"], "color": "red1", "width": 3.5},
	    {"points": [["a", "((a)^2 - 2*(a))"], ["b", "((b)^2 - 2*(b))"]], "radius": 4, "fillColor": "red1"},
	    {"vector": [[0, "a > 1 ? ((a)^2 - 2*(a)) : (b < 1 ? ((b)^2 - 2*(b)) : -1)"], [0, "max(((a)^2 - 2*(a)), ((b)^2 - 2*(b)))"]], "arrow": false, "color": "summer7", "width": 7, "opacity": 0.7}
	  ]
	}
	```
	1. **Prevedi** l'immagine della restrizione agli intervalli $[-1, 3]$, $[2, 3]$, $[-1, 0]$, $[0, 4]$, poi **verifica**.
	2. Per quali intervalli $[a, b]$ la restrizione è iniettiva? Formula la condizione su $a$ e $b$.
	3. Trova due intervalli diversi in cui la restrizione ha immagine $[0, 3]$. Esiste un intervallo in cui la restrizione ha immagine $[0, 3]$ e non è iniettiva?
	4. **Giustifica.** Qual è la più grande restrizione invertibile di $f$ che contiene $x = 3$? Determinane l'inversa.
	[sol: 1. $\lbrack -1, 3 \rbrack$; $\lbrack 0, 3 \rbrack$; $\lbrack 0, 3 \rbrack$; $\lbrack -1, 8 \rbrack$. 2. Se $a \geq 1$ oppure $b \leq 1$. 3. $\lbrack 2, 3 \rbrack$ e $\lbrack -1, 0 \rbrack$, con inverse $1 + \sqrt{x + 1}$ e $1 - \sqrt{x + 1}$. Non esiste: se l'intervallo contiene $1$, l'immagine contiene $-1$; se non lo contiene, la restrizione è iniettiva. 4. $[1, +\infty)$, con inversa $1 + \sqrt{x + 1}$.]
5. **[F] Una famiglia di composte.** Nel grafico sono rappresentate le funzioni $x^2 + c$ (tratteggiata), $\sqrt{x^2 + c}$ e $\dfrac{1}{x^2 + c}$, con $c$ comandato da uno slider. La retta punteggiata è $y = 1$.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-4.9, 4.9],
	  "ylim": [-3.9, 4.9],
	  "legend": true,
	  "sliderBorder": true,
	  "params": {
	    "c": {"min": -4, "max": 4, "step": 0.25, "val": 1}
	  },
	  "data": [
	    {"fn": "x^2 + c", "color": "black4", "dash": "5,5", "width": 2, "label": "y = x² + c"},
	    {"fn": "sqrt(x^2 + c)", "color": "red1", "label": "y = √(x² + c)"},
	    {"fn": "1/(x^2 + c)", "color": "summer2", "label": "y = 1/(x² + c)"},
	    {"fn": "1", "color": "black5", "dash": "2,4", "width": 1}
	  ]
	}
	```
	1. **Prevedi** come cambiano i grafici delle due funzioni composte quando $c$ passa da $1$ a $4$, a $0{,}25$, a $0$, a $-1$, a $-4$: in particolare, come cambiano i domini? Compaiono asintoti?
	2. **Verifica** con lo slider.
	3. **Giustifica**, ragionando con le tecniche del "gonfia e sgonfia" e del reciproco: perché per $c = 1$ i tre grafici passano per lo stesso punto? Qual è il massimo di $\frac{1}{x^2 + c}$ per $c > 0$? Che cosa accade alle due funzioni composte quando $c = 0$?
	[sol: per $c > 0$ entrambe sono definite su $\mathbb{R}$, con minimo $\sqrt c$ e massimo $\frac 1 c$ in $x = 0$; per $c = 0$ si ottengono $\lvert x \rvert$ e $\frac{1}{x^2}$, con asintoto verticale $x = 0$; per $c < 0$ la radice è definita per $\lvert x \rvert \geq \sqrt{-c}$ e il reciproco per $x \neq \pm\sqrt{-c}$, con due asintoti verticali e valori negativi tra di essi. Per $c = 1$ il punto $(0; 1)$ resta fisso, perché $\sqrt 1 = \frac 1 1 = 1$.]
6. **[PD] Quando una fratta non è una fratta.** Nel grafico è rappresentata la funzione $f(x) = \dfrac{x - a}{x - b}$, con $a$ e $b$ comandati da slider. Le rette tratteggiate sono $x = b$ e $y = 1$.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-5.9, 5.9],
	  "ylim": [-4.9, 5.9],
	  "sliderBorder": true,
	  "params": {
	    "a": {"min": -4, "max": 4, "step": 0.5, "val": -2},
	    "b": {"min": -4, "max": 4, "step": 0.5, "val": 1}
	  },
	  "data": [
	    {"fn": "(x - a)/(x - b)", "color": "red1"},
	    {"x": "b", "color": "black4", "dash": "5,5", "width": 1.5},
	    {"fn": "1", "color": "black4", "dash": "5,5", "width": 1.5},
	    {"points": [["b", "abs(a - b) < 0.01 ? 1 : 0/0"]], "radius": 4.5, "fillColor": "#fff", "strokeColor": "red1", "strokeWidth": 2}
	  ]
	}
	```
	1. **Prevedi** come cambiano lo zero, l'asintoto verticale e il segno di $f$ al variare di $a$ e $b$, poi **verifica**.
	2. In alcuni casi i rami del grafico "scendono", in altri "salgono". Da che cosa dipende?
	3. Che cosa accade quando $a = b$? Il grafico è davvero la retta $y = 1$?
	4. **Giustifica.** Verifica che $f(x) = 1 + \dfrac{b - a}{x - b}$ e spiega come si ottiene il grafico di $f$ da quello di $\frac 1 x$ con dilatazioni, riflessioni e traslazioni.
	[sol: lo zero è $x = a$, l'asintoto verticale $x = b$, l'asintoto orizzontale $y = 1$; i rami scendono se $b > a$ e salgono se $b < a$. Per $a = b$ si ottiene $f(x) = 1$ per $x \neq b$: il grafico è la retta $y = 1$ privata del punto $(b; 1)$, perché $b$ non appartiene al dominio. Il grafico di $f$ si ottiene da quello di $\frac 1 x$ con una dilatazione verticale di fattore $\lvert b - a \rvert$ (preceduta da una riflessione se $b - a < 0$), una traslazione orizzontale di $b$ e una verticale di $1$.]

## Quiz

1. **[F]** La funzione $f$ è strettamente decrescente sull'intervallo $[0, 5]$. Allora...
	- **(a)** $f(2) = 5$, $f(4) = 1$.
	- **(b)** $f(0) = 0$, $f(5) = 1$.
	- **(c)** $f(2) = -5$, $f(4) = -1$.
	- **(d)** $f(0) = -5$, $f(5) = 1$.
	[sol: (a)]
2. **[F]** La funzione $f : \mathbb{R} \to \mathbb{R}$ è monotona sul suo insieme di definizione. Inoltre, $f(-2) = -4$ e $f(-1) = 3$. Allora...
	- **(a)** la funzione è crescente.
	- **(b)** la funzione è decrescente.
	- **(c)** la funzione è costante.
	- **(d)** non si può determinare se la funzione sia crescente o decrescente.
	[sol: (a)]
3. **[F]** La funzione $f : \mathbb{R} \to \mathbb{R}$ è tale che $f(-1) = 0$ e $f(1) = 0$. Allora, sull'intervallo $[-1, 0]$, ...
	- **(a)** la funzione è crescente.
	- **(b)** la funzione è decrescente.
	- **(c)** la funzione è costante.
	- **(d)** non si può determinare se la funzione sia crescente o decrescente.
	[sol: (d)]
4. **[F+]** In figura è rappresentato il grafico della funzione $f$, che prosegue allo stesso modo oltre la porzione rappresentata, oscillando tra $-1$ e $1$. Quante soluzioni ha l'equazione $f(x) = \frac 1 2 x$?
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-7, 7],
	  "ylim": [-3.5, 3.5],
	  "data": [
	    { "fn": "cos(x)", "color": "red1" }
	  ]
	}
	```
	- **(a)** 0
	- **(b)** 1
	- **(c)** 2
	- **(d)** Infinite
	[sol: (b)]
5. **[F-]** Una funzione $f(x)$ è definita in $\mathbb{R}$ e ha come insieme immagine l'intervallo $[0, 1]$. Quale delle seguenti equazioni non ha soluzione?
	- **(a)** $f(x) = \dfrac 1 2$
	- **(b)** $f(x) = 2$
	- **(c)** $f(x) = 0$
	- **(d)** $f(x) = 1$
	[sol: (b)]
6. **[PD]** Considera la funzione reale di variabile reale $f(x) = \sqrt{x^2 + 16}$. L'equazione $f(x) = k$ ha...
	- **(a)** zero soluzioni per qualsiasi valore di $k$.
	- **(b)** una soluzione se $k = 5$.
	- **(c)** una soluzione se $k = 4$.
	- **(d)** zero soluzioni se $k = 5$.
	[sol: (c)]
7. **[PD+]** Le due funzioni $f(x)$ e $g(x)$ rappresentano due parabole nel piano cartesiano. Sappiamo che $f(x) \geq 0$ per $x \leq 2 \lor x \geq 8$, mentre $g(x) \geq 0$ per $x \leq -1 \lor x \geq 5$. Qual è il dominio della funzione $h(x) = \dfrac{\sqrt{f(x)}}{g(x)}$?
	- **(a)** $x < -1 \lor x \geq 8$
	- **(b)** $x < -1 \lor -1 < x \leq 2 \lor x \geq 8$
	- **(c)** $x < -1 \lor -1 < x < 2 \lor x > 8$
	- **(d)** $x \neq -1 \land x \neq 5$
	[sol: (b)]
8. **[F]** La funzione $f : \mathbb{R} \to \mathbb{R}$ **non** è strettamente crescente. Allora...
	- **(a)** $f$ è decrescente.
	- **(b)** esistono $x_1 < x_2$ tali che $f(x_1) \geq f(x_2)$.
	- **(c)** per ogni $x_1 < x_2$ si ha $f(x_1) \geq f(x_2)$.
	- **(d)** $f$ è costante in almeno un intervallo.
	[sol: (b)]
9. **[F+]** Il polinomio $x^3 + x^2 - 2x$ si può scomporre nella forma $x(x - 1)(x + 2)$. Quante sono le intersezioni del grafico della funzione $f(x) = x^3 + x^2 - 2x$ con l'asse delle ascisse?
	- **(a)** 1
	- **(b)** 2
	- **(c)** 3
	- **(d)** Nessuna
	[sol: (c)]
10. **[EE/F]** In figura sono rappresentati i grafici di $f$ (in rosso) e $g$ (in nero). Quali tra le seguenti affermazioni sono corrette? Più di una può essere corretta.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-24.9, 24.9],
	  "ylim": [-39.9, 79.9],
	  "legend": true,
	  "data": [
	    { "fn": "0.02x^2(100 - x^2)", "color": "red1", "label": "f" },
	    { "fn": "x^2/5 - 20", "color": "black1", "label": "g" }
	  ]
	}
	```
	- **(a)** $f(x) > g(x)$ se $-10 < x < 10$.
	- **(b)** $f(-10) + g(10) = 0$.
	- **(c)** $f(0) + g(0) > 0$.
	- **(d)** $f(x) \cdot g(x) \leq 0$ se $-15 < x < 15$.
	[sol: (a), (b), (d)]
11. **[EE]** Quale dei seguenti grafici indicativi rappresenta la funzione $f(x) = (x + 1)(x - 2)^2$?
	```matephis
	{
	  "layout": "grid",
	  "columns": 4,
	  "mobileColumns": 2,
	  "labels": "a",
	  "shared": { "xlim": [-3.9, 3.9], "ylim": [-4.9, 4.9], "aspectRatio": 1, "showYNumbers": false },
	  "plots": [
	    { "data": [ { "fn": "-(x+1)(x-2)^2/2", "color": "red1" } ] },
	    { "data": [ { "fn": "(x+1)^2(x-2)/2", "color": "red1" } ] },
	    { "data": [ { "fn": "(x+1)(x-2)^2/2", "color": "red1" } ] },
	    { "data": [ { "fn": "-(x+1)^2(x-2)/2", "color": "red1" } ] }
	  ]
	}
	```
	[sol: (c)]
12. **[F]** In figura è rappresentato il grafico della funzione $f$.
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-3.9, 3.9],
	  "ylim": [-1.9, 2.4],
	  "data": [
	    { "fn": "2 - x^2/2", "color": "red1" },
	    { "fn": "1", "color": "black4", "dash": "5,5", "width": 1.5 }
	  ]
	}
	```
	Quale dei seguenti grafici rappresenta la funzione $g(x) = \sqrt{f(x)}$?
	```matephis
	{
	  "layout": "grid",
	  "columns": 4,
	  "mobileColumns": 2,
	  "labels": "a",
	  "shared": { "xlim": [-3.4, 3.4], "ylim": [-1.4, 2.4], "aspectRatio": 1 },
	  "plots": [
	    { "data": [
	      { "fn": "0.7(2 - x^2/2)", "domain": [-2, 2], "color": "red1" },
	      { "fn": "1", "color": "black4", "dash": "5,5", "width": 1.5 }
	    ] },
	    { "data": [
	      { "fn": "(2 - x^2/2)^2/2", "domain": [-2, 2], "color": "red1" },
	      { "fn": "1", "color": "black4", "dash": "5,5", "width": 1.5 }
	    ] },
	    { "data": [
	      { "fn": "sqrt(2 - x^2/2)", "domain": [-2, 2], "color": "red1" },
	      { "fn": "1", "color": "black4", "dash": "5,5", "width": 1.5 }
	    ] },
	    { "data": [
	      { "fn": "|2 - x^2/2|", "color": "red1" },
	      { "fn": "1", "color": "black4", "dash": "5,5", "width": 1.5 }
	    ] }
	  ]
	}
	```
	[sol: (c): i punti con $f(x) = 0$ e $f(x) = 1$ restano fissi, i valori compresi tra $0$ e $1$ vengono "gonfiati", quelli maggiori di $1$ "sgonfiati".]
13. **[F]** Sia $f : A \to B$. Quale delle seguenti affermazioni equivale a "$f$ non è suriettiva"?
	- **(a)** Per ogni $y \in B$ esiste $x \in A$ tale che $f(x) \neq y$.
	- **(b)** Esiste $y \in B$ tale che, per ogni $x \in A$, $f(x) \neq y$.
	- **(c)** Esistono $x_1, x_2 \in A$, con $x_1 \neq x_2$, tali che $f(x_1) = f(x_2)$.
	- **(d)** Esiste $x \in A$ tale che $f(x) \notin B$.
	[sol: (b)]
14. **[EE/F]** L'immagine della funzione $f : [-1, 2] \to \mathbb{R}$, $f(x) = x^2$, è...
	- **(a)** $[1, 4]$
	- **(b)** $[0, 4]$
	- **(c)** $[-1, 4]$
	- **(d)** $[0, 2]$
	[sol: (b)]
15. **[F]** Quale delle seguenti funzioni è una contrazione su $\mathbb{R}$?
	- **(a)** $f(x) = 2x$
	- **(b)** $f(x) = x + 1$
	- **(c)** $f(x) = -\frac 1 3 x + 5$
	- **(d)** $f(x) = \frac 1 4 x^2$
	[sol: (c)]
16. **[PD]** L'inversa della funzione $f(x) = \dfrac{x + 1}{x - 2}$ è...
	- **(a)** $f^{-1}(x) = \dfrac{x - 2}{x + 1}$
	- **(b)** $f^{-1}(x) = \dfrac{2x + 1}{x - 1}$
	- **(c)** $f^{-1}(x) = \dfrac{x - 1}{2x + 1}$
	- **(d)** $f$ non è invertibile.
	[sol: (b)]
17. **[EE]** Siano $A = \lbrace 1, 2, 3 \rbrace$ e $B = \lbrace 0, 1 \rbrace$. Quale dei seguenti sottoinsiemi di $A \times B$ è il grafico di una funzione suriettiva da $A$ a $B$?
	- **(a)** $\lbrace (1, 0), (2, 0), (3, 0) \rbrace$
	- **(b)** $\lbrace (1, 0), (1, 1), (2, 0), (3, 1) \rbrace$
	- **(c)** $\lbrace (1, 1), (2, 0), (3, 1) \rbrace$
	- **(d)** $\lbrace (1, 0), (2, 1) \rbrace$
	[sol: (c)]
18. **[F]** La funzione $f : \mathbb{R} \to \mathbb{R}$ è iniettiva. Quale delle seguenti affermazioni è necessariamente vera?
	- **(a)** $f$ è strettamente crescente oppure strettamente decrescente.
	- **(b)** L'equazione $f(x) = 0$ ha al più una soluzione.
	- **(c)** $f$ è suriettiva.
	- **(d)** L'equazione $f(x) = 0$ ha esattamente una soluzione.
	[sol: (b)]
19. **[F]** Le funzioni $f$ e $g$, definite sull'insieme $\lbrace 1, 2, 3, 4 \rbrace$ e a valori nello stesso insieme, sono descritte dalle seguenti associazioni: $f$: $1 \mapsto 3$, $2 \mapsto 4$, $3 \mapsto 1$, $4 \mapsto 2$; $g$: $1 \mapsto 2$, $2 \mapsto 2$, $3 \mapsto 4$, $4 \mapsto 1$. Quale delle seguenti affermazioni è vera?
	- **(a)** $f \circ g$ è iniettiva.
	- **(b)** $g \circ f$ è iniettiva.
	- **(c)** $f \circ g$ assume il valore $1$.
	- **(d)** $f$ coincide con la propria inversa.
	[sol: (d)]
20. **[PD]** In figura è rappresentato il grafico della funzione invertibile $f$ (la retta tratteggiata è la bisettrice $y = x$).
	```matephis
	{
	  "aspectRatio": "1:1",
	  "xlim": [-3.9, 3.9],
	  "ylim": [-3.9, 3.9],
	  "data": [
	    { "fn": "x^3/4 + 1", "color": "red1" },
	    { "fn": "x", "color": "black4", "dash": "5,5", "width": 1.5 }
	  ]
	}
	```
	Quale dei seguenti è il grafico di $f^{-1}$?
	```matephis
	{
	  "layout": "grid",
	  "columns": 4,
	  "mobileColumns": 2,
	  "labels": "a",
	  "shared": { "xlim": [-3.9, 3.9], "ylim": [-3.9, 3.9], "aspectRatio": 1 },
	  "plots": [
	    { "data": [ { "fn": "-(x^3)/4 - 1", "color": "red1" }, { "fn": "x", "color": "black4", "dash": "5,5", "width": 1.5 } ] },
	    { "data": [ { "fn": "1 - x^3/4", "color": "red1" }, { "fn": "x", "color": "black4", "dash": "5,5", "width": 1.5 } ] },
	    { "data": [ { "fn": "cbrt(4(x - 1))", "color": "red1" }, { "fn": "x", "color": "black4", "dash": "5,5", "width": 1.5 } ] },
	    { "data": [ { "fn": "cbrt(4(x + 1))", "color": "red1" }, { "fn": "x", "color": "black4", "dash": "5,5", "width": 1.5 } ] }
	  ]
	}
	```
	[sol: (c): è il simmetrico del grafico di $f$ rispetto alla bisettrice; ad esempio, $f(0) = 1$, quindi $f^{-1}(1) = 0$.]
21. **[EE/F]** Quale dei seguenti grafici rappresenta una funzione dispari?
	```matephis
	{
	  "layout": "grid",
	  "columns": 4,
	  "mobileColumns": 2,
	  "labels": "a",
	  "shared": { "xlim": [-3.9, 3.9], "ylim": [-3.9, 3.9], "aspectRatio": 1 },
	  "plots": [
	    { "data": [ { "fn": "x^2/2 - 2", "color": "red1" } ] },
	    { "data": [ { "fn": "x^3/4 - x", "color": "red1" } ] },
	    { "data": [ { "fn": "(x - 1)^3/2", "color": "red1" } ] },
	    { "data": [ { "fn": "x^3/4 - x + 1", "color": "red1" } ] }
	  ]
	}
	```
	[sol: (b): il grafico è simmetrico rispetto all'origine. Il grafico (c) è simmetrico rispetto al punto $(1; 0)$, il grafico (d) non passa per l'origine.]
22. **[F]** Quale delle seguenti funzioni, definite sull'intervallo $[0, 4]$ e a valori nello stesso intervallo, è una contrazione?
	```matephis
	{
	  "layout": "grid",
	  "columns": 4,
	  "mobileColumns": 2,
	  "labels": "a",
	  "shared": { "xlim": [-0.4, 4.4], "ylim": [-0.4, 4.4], "aspectRatio": 1 },
	  "plots": [
	    { "data": [ { "fn": "4 - x", "domain": [0, 4], "color": "red1" } ] },
	    { "data": [ { "fn": "x^2/4", "domain": [0, 4], "color": "red1" } ] },
	    { "data": [ { "fn": "sqrt(4x)", "domain": [0, 4], "color": "red1" } ] },
	    { "data": [ { "fn": "x/2 + 1", "domain": [0, 4], "color": "red1" } ] }
	  ]
	}
	```
	[sol: (d): tutte le corde hanno pendenza $\frac 1 2$. La (a) conserva le distanze; la (b) ha corde di pendenza vicina a $2$ vicino a $x = 4$; la (c) ha corde molto ripide vicino a $x = 0$.]
23. **[EE]** In figura sono rappresentati i grafici delle funzioni $f$ e $g$. Quale relazione lega $g$ a $f$?
	```matephis
	{
	  "layout": "row",
	  "mobileColumns": 1,
	  "labels": ["f", "g"],
	  "shared": { "xlim": [-4.9, 5.9], "ylim": [-1.9, 3.9], "aspectRatio": "5:3" },
	  "plots": [
	    { "data": [ { "type": "interpolation", "points": [[-3, 0], [-2, 2], [0, 2], [2, -1], [3, 0]], "smoothness": 0, "color": "red1" } ] },
	    { "data": [ { "type": "interpolation", "points": [[-1, 1], [0, 3], [2, 3], [4, 0], [5, 1]], "smoothness": 0, "color": "black1" } ] }
	  ]
	}
	```
	- **(a)** $g(x) = f(x - 2) + 1$
	- **(b)** $g(x) = f(x + 2) + 1$
	- **(c)** $g(x) = f(x - 2) - 1$
	- **(d)** $g(x) = f(x + 2) - 1$
	[sol: (a)]
24. **[PD]** Quale delle seguenti funzioni può avere il grafico rappresentato in figura?
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-5.9, 5.9],
	  "ylim": [-5.9, 2.9],
	  "data": [
	    { "fn": "(x-2)/(x+1)^2", "color": "red1" },
	    { "x": -1, "color": "black4", "dash": "5,5", "width": 1.5 }
	  ]
	}
	```
	- **(a)** $f(x) = \dfrac{x - 2}{x + 1}$
	- **(b)** $f(x) = \dfrac{x + 2}{(x - 1)^2}$
	- **(c)** $f(x) = \dfrac{x - 2}{(x + 1)^2}$
	- **(d)** $f(x) = \dfrac{x + 1}{(x - 2)^2}$
	[sol: (c): zero in $x = 2$, asintoto verticale $x = -1$ senza cambio di segno, valori negativi vicino all'asintoto.]
25. **[PD]** L'immagine della funzione $f(x) = x^2 - 2\lvert x \rvert$ è...
	- **(a)** $[0, +\infty)$
	- **(b)** $[-1, +\infty)$
	- **(c)** $\mathbb{R}$
	- **(d)** $[-2, +\infty)$
	[sol: (b): $f(x) = (\lvert x \rvert - 1)^2 - 1$.]
26. **[PD]** In figura è rappresentato il grafico della funzione $f$, formato da tre segmenti. Quante sono le soluzioni dell'equazione $f(f(x)) = 0$?
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-3.9, 3.9],
	  "ylim": [-2.9, 2.9],
	  "data": [
	    { "type": "interpolation", "points": [[-3, 2], [-1, -2], [1, 2], [3, 0]], "smoothness": 0, "color": "red1" },
	    { "points": [[-3, 2], [-1, -2], [1, 2], [3, 0]], "radius": 4, "fillColor": "red1" }
	  ]
	}
	```
	- **(a)** 3
	- **(b)** 4
	- **(c)** 5
	- **(d)** 6
	[sol: (b): gli zeri di $f$ sono $-2$, $0$ e $3$, quindi deve essere $f(x) = -2$ (una soluzione, $x = -1$), $f(x) = 0$ (tre soluzioni) oppure $f(x) = 3$ (nessuna soluzione).]
27. **[AD]** Alla coppia $(0{,}a_1 a_2 a_3 \ldots; \; 0{,}b_1 b_2 b_3 \ldots)$ si associa il numero $0{,}a_1 b_1 a_2 b_2 a_3 b_3 \ldots$ ottenuto alternando le cifre. Quale coppia ha come immagine il numero $0{,}1234$?
	- **(a)** $(0{,}12; \; 0{,}34)$
	- **(b)** $(0{,}13; \; 0{,}24)$
	- **(c)** $(0{,}24; \; 0{,}13)$
	- **(d)** $(0{,}1; \; 0{,}234)$
	[sol: (b)]
28. **[AD]** Quante sono le funzioni biiettive dall'insieme $\lbrace 1, 2, 3, 4 \rbrace$ in sé che coincidono con la propria inversa?
	- **(a)** 4
	- **(b)** 6
	- **(c)** 10
	- **(d)** 24
	[sol: (c): l'identità, le $6$ funzioni che scambiano due elementi e lasciano fissi gli altri, le $3$ che scambiano gli elementi a coppie.]

---

## Problemi

**Speriamo in bene... [EE]** Realizza un grafico della speranza di vita in Italia a partire dal 1900 (il sito [Our world in data](https://ourworldindata.org/) è un'ottima fonte per reperire i dati necessari). Scegli ogni quanti anni campionare il valore della speranza di vita, motivando tale scelta.
1. Il grafico ottenuto rappresenta quale funzione? Quali sono dominio, codominio e immagine?
2. Quali sono le caratteristiche del grafico (crescenza, decrescenza, massimi e minimi)?
3. Cosa si può dedurre dal grafico?

**Tanti fagiani [F]** In una riserva naturale è stata programmata un'azione di ripopolamento di fagiani. Il grafico rappresenta il numero di fagiani $f(t)$ presenti nella riserva in funzione del numero $t$ di mesi trascorsi dall'inizio del ripopolamento.
```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-0.4, 3.4],
  "ylim": [-10, 110],
  "axisArrows": true,
  "axisLabels": ["t", "f"],
  "data": [
    { "fn": "10*3^x", "domain": [0, 3], "color": "red1" }
  ]
}
```
1. Quanti fagiani erano presenti inizialmente?
2. Dopo quanti mesi i fagiani hanno raggiunto le 90 unità?
3. Di quanto aumenta il numero di fagiani nel primo mese? E nel secondo? La crescita è lineare? Che cosa rimane costante, mese per mese?
4. Stima, se il modello resta valido, quanti fagiani ci saranno dopo 3 mesi.
[sol: 1. $10$; 2. dopo $2$ mesi; 3. di $20$ nel primo mese e di $60$ nel secondo: la crescita non è lineare, ma ogni mese il numero di fagiani triplica; 4. circa $270$.]

**Il serbatoio [E]** Per svuotare un serbatoio d'acqua inizialmente pieno si apre un rubinetto. Il grafico mostra l'andamento della quantità d'acqua nel serbatoio in funzione del tempo $t$ (in minuti) dal momento dell'apertura del rubinetto; il volume $V$ è misurato in litri.
```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-0.9, 10.4],
  "ylim": [-4, 46],
  "axisArrows": true,
  "axisLabels": ["t", "V"],
  "data": [
    { "fn": "40 - 5x", "domain": [0, 8], "color": "red1" },
    { "points": [[0, 40], [8, 0]], "radius": 4, "fillColor": "red1" },
    { "vector": [[2, 0], [2, 30]], "arrow": false, "dash": "3,3", "color": "black1", "width": 1.5 },
    { "vector": [[0, 30], [2, 30]], "arrow": false, "dash": "3,3", "color": "black1", "width": 1.5 },
    { "points": [[2, 30], [2, 0], [0, 30]], "radius": 4, "fillColor": "black1" }
  ]
}
```
1. Quanti litri d'acqua ci sono nel serbatoio dopo 2 minuti?
2. Quanti minuti sono necessari per svuotare metà del serbatoio?
3. Quanti minuti sono necessari per svuotare completamente il serbatoio?
4. Scrivi l'espressione analitica della funzione, specificandone dominio e immagine.
[sol: 1. $30 \text{ L}$; 2. $4 \text{ min}$; 3. $8 \text{ min}$; 4. $V(t) = 40 - 5t$, con $0 \leq t \leq 8$ e $0 \leq V \leq 40$.]

**Bel tempo in vista [EE]** È lunedì. Le previsioni meteo per i prossimi martedì e mercoledì recitano: "giornate prevalentemente soleggiate, senza sbalzi di temperatura; la massima (22 °C) si registrerà mercoledì alle 12:00, mentre la minima (8 °C) nella notte tra martedì e mercoledì, alle 4:00". Traccia un grafico della temperatura che rispetti la descrizione.

**Incontri montani [EE/F]** Alice inizia la propria camminata verso il rifugio Questa (2388 m s.l.m.) dalle terme di Valdieri (1400 m s.l.m.). Alice percorre un dislivello di 380 metri ogni ora in salita. Nello stesso istante in cui Alice inizia la salita, Bob, che si trova sul monte Malinvern (2931 m s.l.m.), inizia la propria discesa, diretto alle terme di Valdieri, ricoprendo un dislivello di 500 metri ogni ora sullo stesso sentiero percorso da Alice.
1. Rappresenta l'altitudine di Alice e di Bob con delle funzioni del tempo e tracciane i grafici.
2. Dopo quanto tempo e a che altitudine Alice e Bob si incontrano?
3. Dopo quanto tempo Alice e Bob raggiungono rispettivamente la propria destinazione?
[sol: 1. $h_A(t) = 1400 + 380t$, $h_B(t) = 2931 - 500t$ ($t$ in ore); 2. dopo circa $1{,}74 \text{ h}$ (circa 1 h 44 min), a circa $2061 \text{ m}$; 3. Alice dopo $2{,}6 \text{ h}$ (2 h 36 min), Bob dopo circa $3{,}06 \text{ h}$ (circa 3 h 4 min).]

**Luminosità variabile [EE/F]** La luminosità dello schermo di uno smartphone varia da 5 nit, in una stanza buia (da 0,1 a 5 lux registrati dal sensore di luminosità), fino a 1000 nit, in caso di illuminazione diretta da parte del sole (circa 100 000 lux registrati dal sensore di luminosità).
1. Modellizza con un grafico la funzione che associa all'illuminamento dell'ambiente $A$ (misurato in lux) la luminosità dello schermo $L$ (misurata in nit).
2. Si tratta di una funzione crescente o decrescente?

**Mezzi di trasporto analitici [E]** Descrivi tramite una funzione un fenomeno che riguarda il trasporto ferroviario. Specifica dominio, codominio e significato delle variabili.

**Oro nero [EE]** Leggi il seguente passo, tratto da un articolo riguardante il prezzo del petrolio, quindi rappresenta il grafico cartesiano della funzione che descrive il fenomeno, specificandone dominio e codominio.
> Durante la pandemia da COVID-19 il consumo di petrolio si è notevolmente ridotto, causando un crollo del prezzo del greggio, che ha raggiunto il valore minimo di 18 € al barile nell'aprile 2020. Al termine della pandemia, la ripresa economica e il conseguente aumento della domanda hanno viceversa provocato una crescita del prezzo, fino al valore massimo di 114 € al barile nel maggio 2022. La crescita è stata più rapida tra novembre 2021 e febbraio 2022. Dopo una serie di oscillazioni, che comunque non hanno mai fatto scendere il prezzo sotto i 55 € al barile, il prezzo del petrolio è giunto a valere 60 € nell'ottobre 2025.

**Pericolo abbronzature [EE]** Il radiometro dell'ARPA posizionato nei pressi della diga del Chiotas (in località Entracque) misura la radiazione solare. La radiazione solare si misura in W/m² (watt al metro quadro) e può valere da 0 fino a circa 1000 W/m². Rappresenta il grafico cartesiano della funzione che modellizza la variazione della radiazione nel corso di martedì 21 ottobre 2025, tenendo conto dei seguenti fatti:
- il sole sorge alle 08:00 e tramonta alle 18:30. La radiazione è nulla in assenza di luce;
- la radiazione cresce al crescere dell'altezza del sole sull'orizzonte e decresce al decrescere;
- il massimo valore di radiazione si registra alle 13:00 (275 W/m²);
- tra le 09:00 e le 11:00 una nuvola copre il sole e rallenta l'aumento della radiazione misurata.

**Fuga nello spazio [EE/F]** La velocità di fuga $v_f$, cioè la velocità minima necessaria per sfuggire all'attrazione gravitazionale di un corpo celeste, è descritta dalla seguente funzione:

$$
v_f(M) = \sqrt{\frac{2\,GM}{R}},
$$

dove
- $M$ è la massa del corpo celeste (in kg);
- $R$ è il raggio del corpo celeste (in m);
- $G$ è la costante di gravitazione universale $(G = 6{,}67 \times 10^{-11} \, \textrm{N} \cdot \textrm{m}^2/\textrm{kg}^2)$.

Prendiamo in considerazione un corpo celeste con raggio analogo a quello terrestre, $R = 6{,}4 \times 10^6 \text{ m}$.
1. Qual è il dominio della funzione $v_f(M)$? Quale dominio ha senso dal punto di vista fisico?
2. Ti aspetti che la funzione $v_f(M)$ sia crescente, decrescente o costante?
3. Completa la seguente tabella di input-output, infine traccia un grafico approssimativo di $v_f(M)$.
4. Se la massa quadruplica, come varia la velocità di fuga?

| M (kg)             | Velocità di fuga (m/s) |
| ------------------ | ---------------------- |
| $1 \times 10^{23}$ |                        |
| $5 \times 10^{23}$ |                        |
| $1 \times 10^{24}$ |                        |
| $5 \times 10^{24}$ |                        |
| $1 \times 10^{25}$ |                        |

[sol: 1. $M \geq 0$ (fisicamente $M > 0$); 2. crescente; 3. circa $1444$, $3228$, $4565$, $10\,209$, $14\,437$ m/s; 4. raddoppia.]

**Occhio alla scossa [EE/F]** Un generatore con forza elettromotrice $\varepsilon = 12 \text{ V}$ e resistenza interna $r = 0{,}5 \ \Omega$ è collegato a un resistore di resistenza $R$, che possiamo scegliere. L'intensità di corrente che circola nel circuito è descritta dalla funzione
$$
I(R) = \frac{\varepsilon}{R + r},
$$
dove $I$ è misurata in ampere (A) e $R$ in ohm ($\Omega$).
1. Qual è il dominio naturale della funzione $I(R)$? Quale dominio ha senso dal punto di vista fisico?
2. Ti aspetti che la funzione $I(R)$ sia crescente, decrescente o costante?
3. Completa la tabella input-output, infine traccia un grafico approssimativo di $I(R)$. Che cosa succede alla corrente quando $R$ diventa molto grande?
4. Quanto vale la corrente massima che può circolare nel circuito (corrente di *cortocircuito*)?
5. Per quali valori di $R$ la corrente è minore di $1 \text{ A}$?

| Resistenza ($\Omega$) | Intensità di corrente (A) |
| --------------------- | ------------------------- |
| 0                     |                           |
| 1                     |                           |
| 2                     |                           |
| 5                     |                           |
| 10                    |                           |
| 20                    |                           |

[sol: 1. $R \neq -0{,}5$; fisicamente $R \geq 0$; 2. decrescente; 3. $24$; $8$; $4{,}8$; circa $2{,}18$; circa $1{,}14$; circa $0{,}59$ A: la corrente si avvicina a zero; 4. $24 \text{ A}$, per $R = 0$; 5. $R > 11{,}5 \ \Omega$.]

**In giro per l'Europa! [EE]** Nella tabella sono riportate le capitali europee visitate da Alice negli ultimi anni. Rappresenta con almeno due funzioni diverse i dati della tabella (ad esempio il numero di capitali visitate in ciascun anno e il numero totale di capitali visitate fino a quell'anno). Specifica dominio e codominio delle funzioni e rappresentale con un grafico. Quale delle due funzioni è sicuramente crescente (in senso lato)? Perché?

| Anno | Città                           |
| ---- | ------------------------------- |
| 2017 | Roma                            |
| 2018 | Parigi, Helsinki                |
| 2019 | Reykjavík                       |
| 2020 | Berlino                         |
| 2022 | Vienna, Bucarest, Riga, Tallinn |
| 2023 | Madrid                          |
| 2024 | La Valletta, Varsavia           |
| 2025 | Lisbona, Londra                 |

[sol: il numero totale di capitali visitate fino a un certo anno non può diminuire; attenzione al 2021, in cui Alice non ha visitato nuove capitali.]

**Riempire i contenitori [EE/F]** Quattro contenitori, alti ciascuno 20 cm, vengono riempiti con un rubinetto che versa sempre la stessa quantità d'acqua al secondo: (1) un cilindro; (2) un cono con il vertice in basso, come un bicchiere da cocktail; (3) un cono con il vertice in alto, come un imbuto capovolto; (4) una sfera. I grafici rappresentano il livello dell'acqua in funzione del tempo, fino al riempimento.
```matephis
{
  "layout": "grid",
  "columns": 4,
  "mobileColumns": 2,
  "labels": "A",
  "shared": { "xlim": [-0.4, 4.4], "ylim": [-0.2, 2.3], "aspectRatio": 1, "showXNumbers": false, "showYNumbers": false, "axisLabels": ["t", "h"] },
  "plots": [
    { "data": [ { "parametric": ["t^2*(3 - t)", "t"], "domain": [0, 2], "color": "red1" } ] },
    { "data": [ { "parametric": ["(8 - (2 - t)^3)/2", "t"], "domain": [0, 2], "color": "red1" } ] },
    { "data": [ { "fn": "x/2", "domain": [0, 4], "color": "red1" } ] },
    { "data": [ { "parametric": ["t^3/2", "t"], "domain": [0, 2], "color": "red1" } ] }
  ]
}
```
1. Abbina ciascun contenitore al suo grafico, motivando le scelte: dove il livello sale più rapidamente? Dove più lentamente?
2. Disegna il grafico del livello in funzione del tempo per una bottiglia formata da un cilindro largo sormontato da un collo cilindrico stretto.
3. Disegna un contenitore il cui grafico sia formato da due segmenti, il secondo più ripido del primo.
4. Il livello è una funzione iniettiva del tempo? E il tempo è una funzione del livello? Che cosa rappresenterebbe la funzione inversa?
[sol: 1. 1-C, 2-D, 3-B, 4-A: il livello sale rapidamente dove il contenitore è stretto e lentamente dove è largo. 4. Sì, finché il contenitore si riempie il livello è strettamente crescente; la funzione inversa associa a ogni livello l'istante in cui viene raggiunto.]

**L'ombra del lampione [F]** Lucia, alta 1,80 m, si allontana da un lampione alto 5,0 m camminando in linea retta alla velocità costante di 1,2 m/s, partendo dalla base del lampione.
1. Esprimi la lunghezza $s$ dell'ombra di Lucia in funzione della sua distanza $d$ dalla base del lampione.
2. Esprimi la distanza $d$ in funzione del tempo $t$, quindi la lunghezza dell'ombra in funzione del tempo: quale composizione di funzioni hai usato?
3. Con quale velocità si allunga l'ombra? Con quale velocità si muove la punta dell'ombra?
4. A quale distanza dal lampione si trova Lucia quando la sua ombra è lunga 3,0 m? Quale funzione inversa hai usato?
[sol: 1. per similitudine $\frac{s}{1{,}8} = \frac{d + s}{5}$, quindi $s(d) = \frac{9}{16} d \approx 0{,}56\,d$; 2. $d(t) = 1{,}2\,t$ e $s(d(t)) = 0{,}675\,t$; 3. l'ombra si allunga a $0{,}675 \text{ m/s}$, la punta si muove a $1{,}875 \text{ m/s}$; 4. $d = \frac{16}{9} s \approx 5{,}3 \text{ m}$.]

**Gradi su gradi [F]** La temperatura in gradi Fahrenheit si ottiene da quella in gradi Celsius con la funzione $F(c) = \frac 9 5 c + 32$, quella in kelvin con la funzione $K(c) = c + 273{,}15$.
1. Determina la funzione inversa di $F$ e interpretala.
2. Esprimi la temperatura in gradi Fahrenheit in funzione di quella in kelvin. Quali composizioni hai usato?
3. Esiste una temperatura che ha lo stesso valore numerico in gradi Celsius e in gradi Fahrenheit? E in gradi Celsius e in kelvin? Interpreta graficamente le risposte.
4. Una tra $F$ e $F^{-1}$ è una contrazione: quale? Partendo da $100$, applica ripetutamente la funzione $F^{-1}$: a quale numero ti avvicini?
[sol: 1. $F^{-1}(f) = \frac 5 9 (f - 32)$, che converte da Fahrenheit a Celsius; 2. $F(K^{-1}(k)) = \frac 9 5 (k - 273{,}15) + 32$; 3. $-40$ gradi (il punto fisso di $F$, intersezione con la bisettrice); nessuna in Celsius e kelvin (rette parallele); 4. $F^{-1}$, con $q = \frac 5 9$: $37{,}8$; $3{,}2$; $-16{,}0$; $-26{,}7$; … ci si avvicina a $-40$.]

**Sconti e coupon [EE]** In un negozio online un paio di scarpe costa $p$ euro. Durante i saldi c'è uno sconto del 20% e Marta ha anche un coupon da 10 €.
1. Esprimi con due funzioni l'effetto dello sconto e quello del coupon.
2. Il sito può applicare prima lo sconto e poi il coupon, oppure prima il coupon e poi lo sconto. Scrivi le due funzioni composte: quale conviene a Marta? La differenza dipende dal prezzo?
3. Marta ha pagato 70 € e il sito ha applicato prima lo sconto e poi il coupon. Qual era il prezzo iniziale?
4. Lo sconto del 20% e un aumento del 20% si "annullano"? Qual è la funzione inversa dello sconto del 20%?
[sol: 1. $s(p) = 0{,}8p$, $c(p) = p - 10$; 2. $c(s(p)) = 0{,}8p - 10$ e $s(c(p)) = 0{,}8p - 8$: a Marta conviene applicare prima lo sconto, risparmia sempre $2$ €; 3. $100$ €; 4. no: l'inversa di $s$ è $p \mapsto 1{,}25p$, cioè un aumento del 25%.]

**Il cifrario [PD]** Numeriamo le 26 lettere dell'alfabeto inglese da 0 (A) a 25 (Z). Il cifrario di Cesare sostituisce ogni lettera con quella che si trova tre posti dopo, ricominciando dall'inizio dopo la Z: $f(n) = $ resto della divisione di $n + 3$ per $26$.
1. Cifra la parola FUNZIONE. Determina la funzione inversa di $f$ e usala per decifrare la parola HQFRGHU.
2. Perché ogni cifrario deve essere una funzione iniettiva?
3. Considera il cifrario $g(n) = $ resto della divisione di $2n + 1$ per $26$. È iniettivo? Trova due lettere che vengono cifrate allo stesso modo.
4. Per quali valori di $a$, tra $1$ e $25$, il cifrario $n \mapsto$ resto della divisione di $an + 1$ per $26$ è biiettivo?
[sol: 1. IXQCLRQH; l'inversa sposta ogni lettera tre posti indietro; HQFRGHU diventa ENCODER. 2. Altrimenti due lettere diverse avrebbero lo stesso cifrato e non si potrebbe decifrare. 3. No: ad esempio A ($0$) e N ($13$) diventano entrambe B ($1$). 4. Per $a$ dispari e diverso da $13$, cioè privo di fattori comuni con $26$: $12$ valori.]

**Il gioco di Collatz [F]** Sull'insieme dei numeri naturali positivi è definita la funzione $f(n) = \frac n 2$ se $n$ è pari, $f(n) = 3n + 1$ se $n$ è dispari.
1. Partendo da $n = 7$, applica ripetutamente $f$ finché non ottieni $1$. Quanti passaggi servono? Rappresenta la sequenza con un grafico.
2. $f$ è iniettiva? È suriettiva?
3. Quali numeri hanno come immagine $16$? E $5$? E $6$?
4. Nessuno è mai riuscito a dimostrare che, partendo da qualsiasi numero, si arriva sempre a $1$ (*congettura di Collatz*). Verificalo per tutti i numeri da $1$ a $10$.
[sol: 1. $7$, $22$, $11$, $34$, $17$, $52$, $26$, $13$, $40$, $20$, $10$, $5$, $16$, $8$, $4$, $2$, $1$: $16$ passaggi. 2. Non è iniettiva ($f(3) = f(20) = 10$), è suriettiva ($k = f(2k)$). 3. $16$: $32$ e $5$; $5$: solo $10$; $6$: solo $12$.]
