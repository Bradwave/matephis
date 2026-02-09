---
title: Esercizi sulle disequazioni
feed: show
plot: true
tags:
  - esercizi
  - disequazioni
---
## Esercizi

1. **[E]** Risolvi le seguenti disequazioni di primo grado con metodo algebrico e metodo grafico.
	1. $3x - 2 > 0$
	2. $x + \frac 1 5 \leq 3$
	3. $6x \geq 3$
	4. $x < 2x - 1$
	5. $x + 1 \geq \frac 2 3 x - 1$
2. **[EE]** Determina i valori di $x$ per cui $A(x) < B(x)$. Approssima la soluzione.
```matephis
{
  "xlim": [-2.4,3.4],
  "ylim": [-0.9,2.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "x^2+0.5*x+cos(2*pi*x/2)", "label": "A(x)" },
    { "fn": "-0.1*x^2+0.2*x+2", "color": "black1", "label": "B(x)" }
  ]
}
```
3. **[EE]** Determina i valori di $x$ per cui $A(x) \geq B(x)$.
```matephis
{
  "xlim": [-1.9,4.9],
  "ylim": [-5.9,5.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "x-2", "label": "A(x)" },
    { "fn": "x^3-3x^2+1", "color": "black1", "label": "B(x)" }
  ]
}
```
4. **[EE]** Determina i valori di $x$ per cui $A(x) \leq B(x)$.
```matephis
{
  "xlim": [-5.9,5.9],
  "ylim": [-1.9,4.9],
  "aspectRatio": "2:1",
  "legend": true,
  "data": [
    { "fn": "x^2-1", "label": "A(x)" },
    { "fn": "3", "color": "black1", "label": "B(x)" }
  ]
}
```
5. **[EE/F]** Determina i valori di $x$ per cui $A(x) > B(x)$. Le due curve sono tangenti in $(2, 2)$.
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
6. **[E]** Per quali valori di $x$ la parabola rappresentata in figura è positiva?
```matephis
{
  "xlim": [-2.9,2.9],
  "ylim": [-2.4,2.9],
  "aspectRatio": "2:1",
  "data": [
    { "fn": "(x-1)*(x+2)" }
  ]
}
```
6. **[EE]** Risolvi le seguenti disequazioni di secondo grado.
	1. $x^2 + 5x - 6 \leq 0$
	2. $2x^2 + 2x - 4 \geq 0$
	3. $4x^2 + x - 2 < 0$
	4. $x^2 + 4 \geq 0$
	5. $-3x^2 - 2 > 0$
	6. $x^2 + 1 \leq 0$
	7. $(x - 2)(x + 3) < 0$
	8. $(x + 1)^2 \leq 0$
	9. $-(x - 1)(x - 2) \geq 0$

## Quiz

1. Quale delle seguenti disequazioni ammette come soluzione $-2 \leq x \leq 1$
	- **(a)** $(x + 2)(x - 1) \leq 0$
	- **(b)** $(x - 2)(x + 1) \leq 0$
	- **(c)** $(x + 2)(x - 1) \geq 0$
	- **(d)** $(x - 2)(x + 1) \geq 0$
2. Quale delle seguenti equazioni ha per soluzione qualunque $x$ appartenente all'intervallo rappresentato in figura?
	- **(a)** $-2(x - 4)(x + 1) \leq 0$
	- **(b)** $-2(x - 4)(x + 1) \geq 0$
	- **(d)** $-2(x + 4)(x - 1) \leq 0$
	- **(e)** $-2(x + 4)(x - 1) \geq 0$
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
1. Quale delle seguenti affermazioni relative ai grafici in figura non è corretta?
	- **(a)** $A(x) < 0$ per $x \in \mathbb{R} \setminus [-1, 1]$
	- **(b)** $A(x) \cdot B(x) > 0$ per $x \in (-2, -1) \cup (2, +\infty)$
	- **(d)** $A(x) > B(x)$ per $x < -1 \lor x > 1$
	- **(e)** $A(x) \cdot B(x) = 0$ per $x = -2 \lor x = 1 \lor x = 2$
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