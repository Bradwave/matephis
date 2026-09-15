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
	1. $\cos(x) > x^3 -1$
	2. $2^x = x^2$
2. **[E]** Risolvi le seguenti disequazioni di secondo grado con la tecnica che più ritieni opportuna.
	1. $3x^2 - 4 < 0$
	2. $-2x^2 - 4 \geq 0$
	3. $-x^2 + 4x + 2 \leq 0$
	4. $-8x^2 < \frac{1}{2}x^2 + 2$
	5. $x^2 - 5x + 3 \geq -5x + 3$
3. **[E]** Disegna il grafico di una funzione $f(x)$ tale che $f(x) \leq 0$ per $-5 \leq x \leq 4 \lor 5 \leq x < +\infty$.
4. **[EE]** Determina i valori di $x$ per cui $A(x) > B(x)$. Le due curve sono tangenti in $(2, 2)$.
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

## Quiz

1. **[EE]** Quale delle seguenti equazioni ha per soluzione $x = 2$?
	- **(a)** $2^{x+1} + 2^{x-1} = 10$
	- **(b)** $\log(x + 6) = \log(x)$
	- **(c)** $x^2 - 2x - 3 = 0$
	- **(d)** $\sqrt{5x - 1} = x + 2$
2. **[F-]** In figura è rappresentato il grafico della funzione $f(x)$. Quale tra la seguenti è una soluzione di $f(x) = 0.5x + 1$?
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
3. **[E]** Gli output della funzione $f(x)$ sono compresi tra $-1$ e $+1$. Quante sono le soluzioni dell'equazione $f(x) = 2$?
	- **(a)** Nessuna
	- **(b)** 1
	- **(c)** 2
	- **(d)** Non è possibile determinarlo