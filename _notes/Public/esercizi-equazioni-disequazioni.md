---
title: Esercizi sulle equazioni e sulle disequazioni
feed: show
plot: true
tags:
  - esercizi
  - equazioni
  - disequazioni
---
Una raccolta di esercizi, quesiti, quiz e problemi sulle equazioni e sulle disequazioni.

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

## Esercizi

1. **[EE]** Risolvi le seguenti equazioni e disequazioni con la tecnica che più ritieni opportuna, anche ricorrendo all'uso della calcolatrice e del computer se necessario.
	1. $\cos(x) > x^3 - 1$
	2. $2^x = x^2$
	3. $\arctan(x) - x = 0$
	4. $\sin(2x) + \cos(x) < 0$, con $x \in [-5, 5]$
	5. $3^x + 4^x = 5^x$
	6. $2^{\lvert x \rvert} \leq \cos(x)$
2. **[E]** Risolvi le seguenti disequazioni di secondo grado con la tecnica che più ritieni opportuna.
	1. $3x^2 - 4 < 0$
	2. $-2x^2 - 4 \geq 0$
	3. $-x^2 + 4x + 2 \leq 0$
	4. $-8x^2 < \frac{1}{2}x^2 + 2$
	5. $x^2 - 5x + 3 \geq -5x + 3$
3. **[E]** Disegna il grafico di una funzione $f(x)$ tale che $f(x) \leq 0$ per $-5 \leq x \leq 4 \lor 5 \leq x < +\infty$.
4. **[F]** Scrivi l'espressione algebrica di una funzione $f(x)$ (ovvero $f(x) = \dotsc$) tale che $f(x) < 0$ esclusivamente per $x \in (-2, 4)$.
5. **[EE]** Determina i valori di $x$ per cui $A(x) > B(x)$. Le due curve sono tangenti in $(2, 2)$.
```matephis
{
  "xlim": [-1.9,2.9],
  "ylim": [-2.9,7.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "x^3-2x^2+2", "label": "A(x)" },
    { "fn": "x^2-2", "color": "black1", "label": "B(x)" }
  ]
}
```
6. **[EE]** Determina approssimativamente gli intervalli per cui $A(x) \geq -0.5$.
```matephis
{
  "xlim": [-1.9,4.9],
  "ylim": [-5.9,5.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "x^3-3x^2+1", "color": "black1", "label": "A(x)" }
  ]
}
```
7. **[E]** In figura è rappresentato il grafico della funzione $f(x)$. Risolvi $x^2 = f(x)$.
```matephis
{
  "xlim": [-2.9,2.9],
  "ylim": [-2.9,2.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "2x-1", "color": "black1", "label": "f(x)" }
  ]
}
```
8. **[F]** Scrivi l'equazione di una funzione polinomiale di secondo grado tangente all'asse $x$ nel punto $(3, 0)$. 
9. **[EE]** Risolvi le seguenti equazioni e disequazioni già fattorizzate.
	1. $(x + 3)(x + 1)(x - 1) < 0$
	2. $(x - 1)^2(x + 5) \geq 0$
	3. $x(x + 2)(x - 2) > 0$
	4. $-x(x + 1)(x - 1) = 0$
	5. $(2x - 1)(x + 1)(x - 1) = 0$
	6. $-5(3x - 2)(2x + 3)^2 \leq 0$
	7. $(1 - x)(x - 2)^2(x - 3)^3 < 0$
10. **[EE]** Determina i valori di $x$ per cui $A(x) \cdot B(x) < 0$.
```matephis
{
  "xlim": [-3.9,3.9],
  "legend": true,
  "data": [
	{ "fn": "-.25*(x+2)*(x+1)*(x-3)", "color": "red1", "label": "A(x)" },
	{ "fn": "(x+3)*(x-2)", "color": "black1", "label": "B(x)" }
  ]
}
```
11. **[PD-]** *Completa gli spazi vuoti:* $(\dotsc)^2(\dotsc)(x+1)(x-3)^3 < 0$ per $x < -4 \lor -1 < x < \dots$
12. **[D-]** Sia $A(x) = (x+3)^2(x-2)$. Determina l'espressione analitica di una funzione polinomiale $B(x)$ tale che $A(x) \cdot B(x) < 0$ per $x \in (-\infty, -1) \setminus \{-3\} \cup (2, 4)$.
13. **[EE]** Risolvi le seguenti equazioni e disequazioni di grado superiore al secondo.
	1. $-4x^4 \geq 0$
	2. $16x^4 - 625 < 0$
	3. $27x^3 = -1$
	4. $-x^5 - 10^5 \leq 0$
	5. $-2x^2 < x^6 + 2$
	6. $x^5 - 5x^3 + 4x = 0$
	7. $2x^3 = 4x$
	8. $x^3 - 4x^2 + x + 6 = 0$
	9. $2x^3 - 3x^2 - 11x + 6 \leq 0$
	10. $x^4 - 2x^3 - x + 2 > 0$
	11. $(x^2 + x)^2 - 8(x^2 + x) + 12 = 0$
	12. $2x^4 - 5x^3 + 5x - 2 = 0$
	13. $x^6 - 9x^3 + 8 < 0$
	14. $(x^2 - 3x + 1)^3 = -1$
14. **[F]** Scrivi un'equazione di sesto grado avente per sole soluzioni reali $-1$, $+1$, $+2$.
15. **[PD-]** Completa $-3x^4 + \dotsc < \dotsc$ in modo da ottenere una disequazione di quarto grado senza soluzioni reali.
16. **[PD-]** In quanti punti $x \in \mathbb{R}$ la funzione $f(x) = 2x^4 + x^3 - 6x^2 - 7x - 2$ cambia segno? Ovvero, quante volte il grafico della funzione attraversa l'asse delle ascisse passando da una regione all'altra del piano cartesiano?
17. **[AD-]** In figura è rappresentato il grafico della funzione $f(x)$. Risolvi $f(x) \cdot (x-1)(x+3)^3 < 0$.
```matephis
{
  "xlim": [-3.9,1.9],
  "ylim": [-4.9,1.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "(x+2)^2*(x-1)", "label": "f(x)" }
  ]
}
```
18. **[PD-]** Per quali valori di $k \in \mathbb{R}$ l'equazione $x^4 + k = 1$ non presenta soluzioni reali?
19. **[ED]** Quali condizioni devono rispettare i parametri $p, q \in \mathbb{R}$ affinché la funzione $f(x) = x^3 + px + q$ presenti tre zeri reali distinti?
20. **[E]** Utilizzando il grafico sottostante, determina per quali intervalli di $x$ la condizione $A(x) / B(x) < 0$ è soddisfatta.
```matephis
{
  "xlim": [-3.9,3.9],
  "ylim": [-4.9,4.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "x^2-1", "color": "red1", "label": "A(x)" },
    { "fn": "-x+1", "color": "black1", "label": "B(x)" }
  ]
}
```
21. **[AD]** Disegna il grafico di una funzione $B(x)$ tale che $A(x) / B(x) < 0$ per $x < -4 \lor 2 < x < 5$. Quindi determinane l'espressione analitica (ovvero $B(x) = \dots$).
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-6.9,6.9],
  "ylim": [-2.9,2.9],
  "legend": true,
  "data": [
    { "fn": "-0.5*(x+4)*(x+2)", "color": "red1", "label": "A(x)" }
  ]
}
```
22. **[EE]** Risolvi le seguenti equazioni e disequazioni fratte.
	1. $2 - \dfrac{x + 3}{x - 1} \geq \dfrac{x}{x + 2}$
	2. $\dfrac{x^2}{x - 3} - x < \dfrac{9}{x - 3}$
	3. $\dfrac{x^3 - 8}{x^2 - 4} = 3$
	4. $\dfrac{x^4 - 10x^2 + 9}{x^2 - 2x - 3} \leq 0$
	5. $\dfrac{x^3 + 1}{x + 1} - \dfrac{x^3 - 1}{x - 1} = x$
	6. $\dfrac{x^2 + 1}{x} + \dfrac{x}{x^2 + 1} = \dfrac{5}{2}$
	7. $\dfrac{x^3 - 3x^2 + 4}{x^2 - 4x + 4} \geq 0$
23. **[PD]** Inventa una disequazione fratta (nella forma $\frac{N(x)}{D(x)} \leq 0$) che abbia esattamente come soluzione l'intervallo $[-2, 5)$ tranne il punto $x = 0$ (ovvero $-2 \leq x < 5$ ma con $x \neq 0$).
24. **[EE]** Risolvi le seguenti equazioni e disequazioni irrazionali.
	1. $\sqrt{2x + 5} = x - 5$
	2. $\sqrt[3]{x^3 - 7} = x - 1$
	3. $\sqrt[3]{x^3 - 3x^2 + 5x - 3} = x - 1$
	4. $\sqrt{x^2 - 9} < x + 3$
	5. $\sqrt[3]{x^3 - 8} < x - 2$
	6. $\sqrt{x^2 - 4x} \geq x - 2$
	7. $\sqrt{x + 1} + \sqrt{2x + 3} = 1$
	8. $\sqrt{x + 3} - \sqrt{x - 2} = 5$
	9. $\sqrt{x^2 - 16} \leq -x^2 + 4x - 5$
	10. $\sqrt{\dfrac{x - 1}{x + 2}} > 1$
	11. $\sqrt{x + 2} + \sqrt{x - 1} > \sqrt{2x + 3}$
	12. $\sqrt{x^2 - 2x + 1} + \sqrt{x^2 - 6x + 9} = 2$
25. **[PD+]** In figura è rappresentato il grafico della funzione $f(x)$. Quante sono le soluzioni dell'equazione $\sqrt{f(x)} = k$ al variare del parametro $k \in \mathbb{R}$?
```matephis
{
  "xlim": [-3.9,3.9],
  "ylim": [-1.9,5.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "-x^2+4", "label": "f(x)" }
  ]
}
```
26. **[D]** Per quali valori reali del parametro $k$ la disequazione $\sqrt{x^2 + 1} - kx > 0$ è verificata per ogni $x \in \mathbb{R}$?
27. **[AD-]** In figura è rappresentato il grafico della funzione $f(x)$. Individua in modo approssimativo le soluzioni dell'equazione $\sqrt{f(x)} = 0.5x$.
```matephis
{
  "xlim": [-1.9,1.9],
  "ylim": [-3.9,3.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "x^3-x", "label": "f(x)" }
  ]
}
```
28. **[F+]** Determina graficamente per quali valori di $x$ è soddisfatta la doppia disequazione $f(x) \leq g(x) \leq h(x)$.
```matephis
{
  "xlim": [-3.9, 3.9],
  "ylim": [-1.9, 5.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "x^2", "color": "red1", "label": "h(x)" },
    { "fn": "2", "color": "black1", "label": "g(x)" },
    { "fn": "-x^2+3", "color": "black1", "dash": [4,4], "label": "f(x)" }
  ]
}
```
29. **[EE]** Risolvi le seguenti equazioni e disequazioni con il valore assoluto.
	1. $\lvert 2x - 3 \rvert = 5$
	2. $\lvert x^2 - 4 \rvert = 3x$
	3. $\lvert x - 2 \rvert = \lvert 3 - 2x \rvert$
	4. $\lvert x^2 - 5x + 6 \rvert \leq 2$
	5. $\lvert x + 1 \rvert + \lvert x - 3 \rvert > 6$
	6. $\left\lvert\dfrac{2x - 1}{x + 2}\right\rvert < 1$
	7. $\lvert x^3 - x \rvert = x^3 - x$
	8. $\lvert x^2 - 4 \rvert + \lvert 9 - x^2 \rvert = 5$
	9. $\lvert x^3 - 3x^2 + 2x \rvert > x^3 - 3x^2 + 2x$
	10. $\lvert x^2 - 1 \rvert + \lvert x^2 - 4 \rvert = x^2 + 1$
30. **[AD]** Quante soluzioni ammette l'equazione $\lvert x^2 - 2x \rvert = k$ al variare del parametro $k \in \mathbb{R}$?
31. **[PD-]** In figura è rappresentato il grafico della funzione $f(x) = x^2 - 2x - 1$. Risolvi graficamente e algebricamente la disequazione $\lvert f(x) \rvert \leq 2$.
```matephis
{
  "xlim": [-2.9, 4.9],
  "ylim": [-3.9, 4.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "x^2-2x-1", "color": "red1", "label": "f(x)" }
  ]
}
```
32. **[F+]** In figura è rappresentato il grafico della funzione $f(x) = x^3 - 3x$. Traccia il grafico della funzione $g(x) = \lvert f(x) \rvert$, quindi determina per quali valori del parametro $k \in \mathbb{R}$ l'equazione $\lvert f(x) \rvert = k$ ammette esattamente 4 soluzioni reali distinte.
```matephis
{
  "xlim": [-2.9, 2.9],
  "ylim": [-3.9, 3.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "x^3-3x", "color": "red1", "label": "f(x)" }
  ]
}
```
33. **[AD]** Risolvi la disequazione fratta con valori assoluti:
$$\dfrac{\lvert x^2 - 1 \rvert - 3}{\lvert x \rvert - 2} \leq 0$$

## Quesiti

1. **[PD-]** Esistono disequazioni di terzo grado binomie aventi per soluzione qualunque numero reale? Motiva la risposta.
2. **[D+]** Considera un'equazione polinomiale di grado $n$. Spiega perché il suo numero massimo di soluzioni reali è $n$, mentre il numero minimo è $0$ se $n$ è pari e $1$ se $n$ è dispari.
3. **[F]** Spiega perché l'equazione con valore assoluto $\lvert A(x) \rvert = B(x)$ è logicamente equivalente al sistema $\begin{cases} B(x) \geq 0 \\ A(x) = B(x) \lor A(x) = -B(x) \end{cases}$, illustrando i vantaggi operativi di questo schema rispetto allo studio del segno di $A(x)$.
4. **[PD]** È vero che per qualsiasi polinomio $P(x)$, la disequazione $[P(x)]^2 > 0$ ha come soluzione l'insieme $\mathbb{R} \setminus \{x \in \mathbb{R} \mid P(x) = 0\}$? Cosa si può affermare invece per la disequazione $\sqrt{P(x)} \geq 0$? Spiega le differenze teoriche tra i due insiemi di soluzioni.
5. **[D-]** Considera un polinomio $P(x)$ a coefficienti reali di grado $n \geq 1$. Supponi che $P(x)$ sia una funzione strettamente crescente su tutto $\mathbb{R}$. Dimostra che l'equazione $P(x) = 0$ ammette al più una soluzione reale. Spiega inoltre perché se $n$ è dispari deve esistere esattamente uno zero reale, mentre non può esistere alcun polinomio di grado $n$ pari strettamente crescente su tutto $\mathbb{R}$.

## Quiz

1. **[T]** Quale delle seguenti equazioni ha per soluzione $x = 2$?
	- **(a)** $2^{x+1} + 2^{x-1} = 10$
	- **(b)** $\log(x + 6) = \log(x)$
	- **(c)** $x^2 - 2x - 3 = 0$
	- **(d)** $\sqrt{5x - 1} = x + 2$
2. **[F]** Quale delle seguenti disequazioni **non** ammette alcuna soluzione reale?
	- **(a)** $\lvert x - 1 \rvert + \lvert x + 2 \rvert < 2$
	- **(b)** $\lvert x - 1 \rvert + \lvert x + 2 \rvert \geq 3$
	- **(c)** $\lvert x^2 - 4 \rvert \leq 0$
	- **(d)** $\lvert x - 5 \rvert > -1$
3. **[E]** In figura è rappresentato il grafico della funzione $f(x)$. Quale tra le seguenti è una soluzione di $f(x) = 0.5x + 1$?
	- **(a)** $x = 1$
	- **(b)** $x = 0.5$
	- **(c)** $x = 0$
	- **(d)** $x = -0.5$
```matephis
{
  "xlim": [-2.4,3.4],
  "ylim": [-0.9,2.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "x^2+0.5*x+cos(2*pi*x/2)", "label": "f(x)" }
  ]
}
```
4. **[E]** Gli output della funzione $f(x)$ sono compresi tra $-1$ e $+1$. Quante sono le soluzioni dell'equazione $f(x) = 2$?
	- **(a)** Nessuna
	- **(b)** 1
	- **(c)** 2
	- **(d)** Non è possibile determinarlo
5. **[F]** Quale delle seguenti equazioni irrazionali **non** ammette alcuna soluzione reale?
	- **(a)** $\sqrt{x + 2} = x$
	- **(b)** $\sqrt{x^2 + 5} = -2$
	- **(c)** $\sqrt[3]{x - 1} = -2$
	- **(d)** $\sqrt{2x + 1} = 3$
6. **[E]** Quale delle seguenti è la corretta definizione della funzione il cui grafico è rappresentato in figura?
	- **(a)** $f(x) = \frac{1}{10}(x-2)(x-3)$
	- **(b)** $f(x) = \frac{1}{10}(x+2)(x-3)(x-4)$
	- **(c)** $f(x) = \frac{1}{10}(x-2)(x+3)(x+4)$
	- **(d)** $f(x) = \frac{1}{10}x(x-2)(x+3)(x+4)$
```matephis
{
  "xlim": [-4.9,4.9],
  "ylim": [-2.9,2.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "0.1*(x-2)*(x+3)*(x+4)", "label": "f(x)" }
  ]
}
```
7. **[T]** Quale delle seguenti disequazioni ammette come soluzione $-2 \leq x \leq 1$?
	- **(a)** $(x + 2)(x - 1) \leq 0$
	- **(b)** $(x - 2)(x + 1) \leq 0$
	- **(c)** $(x + 2)(x - 1) \geq 0$
	- **(d)** $(x - 2)(x + 1) \geq 0$
8. **[PD]** Quale delle seguenti disequazioni ha come insieme delle soluzioni lo stesso insieme delle soluzioni dell'equazione $\sqrt[3]{x^3} = x$?
	- **(a)** $\sqrt[3]{x^3 - 1} < x$
	- **(b)** $\sqrt[3]{x^3 + 1} > 0$
	- **(c)** $\sqrt[3]{x} \geq 0$
	- **(d)** $\sqrt[3]{x^2 - 1} \geq 0$
9. **[E]** Quale delle seguenti disequazioni ha per soluzione qualunque $x$ appartenente all'intervallo rappresentato in figura?
	- **(a)** $-2(x - 4)(x + 1) \leq 0$
	- **(b)** $-2(x - 4)(x + 1) \geq 0$
	- **(c)** $-2(x + 4)(x - 1) \leq 0$
	- **(d)** $-2(x + 4)(x - 1) \geq 0$
```matephis
{
  "xlim": [-10,10],
  "ylim": [-0.5,0.5],
  "aspectRatio": "5:1",
  "showGrid": false,
  "showXTicks": true,
  "gridOpacity": 0,
  "showYAxis": false,
  "showYNumbers": false,
  "data": [
    { "fn": "0", "domain": ["-1*Infinity",-4], "color": "red1" },
    { "fn": "0", "domain": [1,"Infinity"], "color": "red1" },
    { "points": [[-4,0],[1,0]], "color": "red1" }
  ]
}
```
10. **[PD-]** Quale delle seguenti affermazioni relative ai grafici in figura *non* è corretta?
	- **(a)** $A(x) < 0$ per $x \in \mathbb{R} \setminus [-1, 1]$
	- **(b)** $A(x) \cdot B(x) > 0$ per $x \in (-2, -1) \cup (2, +\infty)$
	- **(c)** $B(x) > 0$ per $x \in (-2, 1) \cup (2, +\infty)$
	- **(d)** $A(x) \cdot B(x) = 0$ ammette esattamente 4 soluzioni reali distinte
```matephis
{
  "xlim": [-4.9,4.9],
  "legend": true,
  "legendPosition": "bottom-right",
  "data": [
    { "fn": "(x-1)*(x+1)", "color": "red1", "label": "A(x)" },
    { "fn": "(x-1)*(x-2)*(x+2)", "color": "black1", "label": "B(x)" }
  ]
}
```
11. **[E]** Quale tra i seguenti insiemi coincide con l'insieme delle soluzioni dell'equazione $\lvert x - 3 \rvert = 3 - x$?
	- **(a)** $x \leq 3$
	- **(b)** $x \geq 3$
	- **(c)** $x = 3$
	- **(d)** $\mathbb{R}$
12. **[PD]** Quale delle seguenti affermazioni *non* è corretta?
	- **(a)** $f(x) \cdot (3 - x) < 0$ per $x \in (-\infty, -2) \cup (0, 1) \cup (+3, +\infty)$
	- **(b)** $f(1) = 0$ e $f(2) = 8$
	- **(c)** $f(x) \cdot (3 - x) \geq 0$ per $x \in (-\infty, 0) \cup (+2, +3)$
	- **(d)** $f(1) \cdot (3 - x) = 0$ per ogni $x \in \mathbb{R}$
```matephis
{
  "xlim": [-4.9,4.9],
  "legend": true,
  "data": [
    { "fn": "(x-1)*(x+2)*x", "color": "red1", "label": "f(x)" }
  ]
}
```
13. **[E]** Quale delle seguenti equazioni ha come insieme di definizione (C.E.) l'intervallo rappresentato in figura?
	- **(a)** $\sqrt{4 - x^2} = x + 1$
	- **(b)** $\sqrt{x^2 - 4} = x + 1$
	- **(c)** $\sqrt[3]{4 - x^2} = x + 1$
	- **(d)** $\dfrac{1}{\sqrt{4 - x^2}} = x + 1$
```matephis
{
  "xlim": [-5,5],
  "ylim": [-0.5,0.5],
  "aspectRatio": "5:1",
  "showGrid": false,
  "showXTicks": true,
  "gridOpacity": 0,
  "showYAxis": false,
  "showYNumbers": false,
  "data": [
    { "fn": "0", "domain": [-2,2], "color": "red1" },
    { "points": [[-2,0],[2,0]], "color": "red1" }
  ]
}
```
14. **[E]** Quale delle seguenti parabole interseca l'asse $x$ in $(-1, 0)$ e $(5, 0)$?
	- **(a)** $y = (x - 1)(x + 5)$
	- **(b)** $y = -(x + 1)(x - 5)$
	- **(c)** $y = x^2 - x + 5$
	- **(d)** $y = -x^2 + x - 5$
15. **[EE]** Quale delle seguenti funzioni polinomiali è tangente all'asse $x$?
	- **(a)** $f(x) = x^3 + 1$
	- **(b)** $f(x) = x^2 + x$
	- **(c)** $f(x) = (x + 1)^2(x-1)$
	- **(d)** $f(x) = x^3 + x^2 + x$
16. **[PD]** Per quale delle seguenti funzioni si ha $\sqrt{f(x)} > 0$ per ogni $x \in \mathbb R \setminus \{3\}$?
	- **(a)** $f(x) = x^2 - 6x + 9$
	- **(b)** $f(x) = x^3 - 3$
	- **(c)** $f(x) = 3x - 9$
	- **(d)** $f(x) = x^2 + 9$
17. **[AD]** Quale delle seguenti funzioni $A(x)$ è tale che $A(x) \geq B(x)$ per ogni $x \in \mathbb R$?
	- **(a)** $A(x) = x^2 + 2x + 1$
	- **(b)** $A(x) = -x^2 - 2x - 1$
	- **(c)** $A(x) = (x - 1)^2$
	- **(d)** $A(x) = -(x - 1)^2$
```matephis
{
  "xlim": [-3.9,3.9],
  "ylim": [-3.9,3.9],
  "legend": true,
  "data": [
    { "fn": "2x+1", "color": "red1", "label": "B(x)" }
  ]
}
```
18. **[EE]** Quale delle seguenti disequazioni ammette come soluzione $x \leq -3 \lor x \geq 3$?
	- **(a)** $x^4 + 81 \geq 0$
	- **(b)** $x^4 - 81 \leq 0$
	- **(c)** $x^4 - 81 \geq 0$
	- **(d)** $(x - 3)^4 \geq 0$
19. **[EE]** In figura è rappresentato il grafico della funzione $f(x) = x^2 - 1$. Per quali valori di $x$ l'equazione $\sqrt{f(x)} = 0$ è verificata?
	- **(a)** $x = 0$
	- **(b)** $x = 1$
	- **(c)** $x = -1 \lor x = 1$
	- **(d)** Per nessun valore di $x$
```matephis
{
  "xlim": [-2.9, 2.9],
  "ylim": [-1.9, 3.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "x^2-1", "color": "red1", "label": "f(x)" }
  ]
}
```
20. **[EE]** Quale delle seguenti disequazioni ha per soluzione qualunque $x$ appartenente all'intervallo rappresentato in figura?
	- **(a)** $(x + 3)(x - 2)(x^2 + 1) \leq 0$
	- **(b)** $(x + 3)(x - 2)(x^2 + 1) \geq 0$
	- **(c)** $(x - 3)(x + 2)(x + 1)^2 \leq 0$
	- **(d)** $\dfrac{(x - 2)(x^2 + 1)}{x + 3} \leq 0$
```matephis
{
  "xlim": [-10,10],
  "ylim": [-0.5,0.5],
  "aspectRatio": "5:1",
  "showGrid": false,
  "showXTicks": true,
  "gridOpacity": 0,
  "showYAxis": false,
  "showYNumbers": false,
  "data": [
    { "fn": "0", "domain": [-3,2], "color": "red1" },
    { "points": [[-3,0],[2,0]], "color": "red1" }
  ]
}
```
21. **[AD]** Per quale delle seguenti funzioni l'equazione $\lvert f(x) \rvert = 4$ ammette esattamente 3 soluzioni reali distinte?
	- **(a)** $f(x) = x^2 - 4$
	- **(b)** $f(x) = x^2 - 2$
	- **(c)** $f(x) = x^2 - 5$
	- **(d)** $f(x) = x^2 + 4$
22. **[F]** Osserva la funzione $A(x)$ nel grafico. Quale tra le seguenti affermazioni è **falsa**?
	- **(a)** $A(x) \geq 0$ per $x \in [0, 4]$
	- **(b)** $A(x) / (x - 2) > 0$ per $x \in (2, 4)$
	- **(c)** L'equazione della parabola potrebbe essere $y = -x^2 + 4x$
	- **(d)** $A(x) \cdot (x - 4) > 0$ per $x \in (0, 4)$
```matephis
{
  "xlim": [-2.9,6.9],
  "ylim": [-4.9,4.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "-x*(x-4)", "color": "red1", "label": "A(x)" }
  ]
}
```
23. **[PD]** Per quale delle seguenti funzioni $\dfrac{x^2 + 1}{f(x)} \geq 0$ per ogni $x \in \mathbb R$?
	- **(a)** $f(x) = x + 2$
	- **(b)** $f(x) = x^2 + 2$
	- **(c)** $f(x) = x^2$
	- **(d)** $f(x) = x$
24. **[AD]** Per quale delle seguenti funzioni $\dfrac{f(x)}{g(x)} < 0$ per $x \in (1, 2) \cup (3, +\infty)$?
	- **(a)** $g(x) = x^2 - 5x + 6$
	- **(b)** $g(x) = -x^2 + 5x - 6$
	- **(c)** $g(x) = -x^2 + 4x - 3$
	- **(d)** $g(x) = x^2 - x - 2$
```matephis
{
  "xlim": [-0.9, 3.9],
  "ylim": [-4.9, 4.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "(x-1)^3", "label": "f(x)" }
  ]
}
```
25. **[AD]** Quale delle seguenti affermazioni relative alla funzione $g(x)$ rappresentata in figura *non* è corretta?
	- **(a)** $g(x) \cdot (x + 1) > 0$ per $x \in (-3, -1) \cup (1, 4)$
	- **(b)** $g(2) = 5$ e $g(4) = 0$
	- **(c)** $g(x) \cdot (x + 1)^3 \leq 0$ per $x \in (-\infty, -3] \cup [-1, 4]$
	- **(d)** $g(-3) \cdot (x^2 + 1) = 0$ per ogni $x \in \mathbb{R}$
```matephis
{
  "xlim": [-4.9, 5.9],
  "ylim": [-14.9, 9.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "-0.5*(x+3)*(x-1)*(x-4)", "color": "red1", "label": "g(x)" }
  ]
}
```

## Problemi

1. **[F+] Caccia all'errore** Uno studente risolve la disequazione fratta $\dfrac{x^2 - 4}{x - 2} > 3$ in questo modo:

> "Scompongo il numeratore in $(x - 2)(x + 2)$. Semplifico il fattore $(x - 2)$ sopra e sotto. Mi rimane $x + 2 > 3$, quindi la soluzione è $x > 1$."

Questo procedimento è sbagliato. Spiega a parole perché il ragionamento dello studente è scorretto e fornisci la soluzione esatta.