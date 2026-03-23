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
	1. $3x - 2 > 0$ [sol: $x > 2/3$]
	2. $x + \frac 1 5 \leq 3$ [sol: $x \leq 14/5$]
	3. $6x \geq 3$ [sol: $x \geq 1/2$]
	4. $x < 2x - 1$ [sol: $x > 1$]
	5. $x + 1 \geq \frac 2 3 x - 1$ - 1. [sol: $x \geq -6$]
2. **[EE]** Determina i valori di $x$ per cui $A(x) < B(x)$. Approssima la soluzione.
[sol: $-1.5 < x < 1{,}1$ circa]
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
[sol: $x \leq -1 \lor 1 \leq x \leq 3$]
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
[sol: $-2 \leq x \leq 2$]
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
[sol: $x > -1 \land x \neq 2$]
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
[sol: $x < -2 \lor x > 1$]
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
	1. $x^2 + 5x - 6 \leq 0$ [sol: $-6 \leq x \leq 1$]
	2. $2x^2 + 2x - 4 \geq 0$ [sol: $x \leq -2 \lor x \geq 1$]
	3. $4x^2 + x - 2 < 0$ [sol: $\frac{-1-\sqrt{33}}{8} < x < \frac{-1+\sqrt{33}}{8}$]
	4. $x^2 + 4 \geq 0$ [sol: $\forall x \in \mathbb{R}$]
	5. $-3x^2 - 2 > 0$ [sol: $\emptyset$]
	6. $x^2 + 1 \leq 0$ [sol: $\emptyset$]
	7. $(x - 2)(x + 3) < 0$ [sol: $-3 < x < 2$]
	8. $(x + 1)^2 \leq 0$ [sol: $x = -1$]
	9. $-(x - 1)(x - 2) \geq 0$ [sol: $1 \leq x \leq 2$]
	10. $x^2 - 5x + 6 > 0$ [sol: $x < 2 \lor x > 3$]
	11. $2x^2 + 3x - 2 \leq 0$ [sol: $-2 \leq x \leq 1/2$]
	12. $-x^2 + 4x - 3 \geq 0$ [sol: $1 \leq x \leq 3$]
	13. $x^2 - x - 12 < 0$ [sol: $-3 < x < 4$]
	14. $x^2 - 16 \geq 0$ [sol: $x \leq -4 \lor x \geq 4$]
	15. $3x^2 + 12 < 0$ [sol: $\emptyset$]
	16. $x^2 - 7x < 0$ [sol: $0 < x < 7$]
	17. $-2x^2 + 5x \geq 0$ [sol: $0 \leq x \leq 5/2$]
	18. $x^2 - 6x + 9 \leq 0$ [sol: $x = 3$]
	19. $4x^2 + 4x + 1 > 0$ [sol: $x \neq -1/2$]
	20. $x^2 + x + 1 > 0$ [sol: $\forall x \in \mathbb{R}$]
	21. $-2x^2 + 3x - 5 \geq 0$ [sol: $\emptyset$]
	22. $(x - 1)^2 < 2x(x + 1) - 3$ [sol: $x < -2-2\sqrt{2} \lor x > -2+2\sqrt{2}$]
	23. $x(x + 5) \geq 2(x^2 - 3)$ [sol: $-1 \leq x \leq 6$]
	24. $(2x - 1)(x + 3) \leq (x + 2)^2$ [sol: $\frac{-1-\sqrt{29}}{2} \leq x \leq \frac{-1+\sqrt{29}}{2}$]
	25. $\dfrac{x^2}{2} - \dfrac{x - 1}{3} > 1$ [sol: $x < \frac{1-\sqrt{13}}{3} \lor x > \frac{1+\sqrt{13}}{3}$]
	26. $x^2 - 4x + 1 > 0$ [sol: $x < 2 - \sqrt{3} \lor x > 2 + \sqrt{3}$]
	27. $x^2 + 2x - 4 \leq 0$ [sol: $-1 - \sqrt{5} \leq x \leq -1 + \sqrt{5}$]
	28. $-2x^2 + 6x - 1 \geq 0$ [sol: $\frac{3 - \sqrt{7}}{2} \leq x \leq \frac{3 + \sqrt{7}}{2}$]
	29. $3x^2 - 5x - 1 < 0$ [sol: $\frac{5 - \sqrt{37}}{6} < x < \frac{5 + \sqrt{37}}{6}$]
	30. $x^2 - 7x + 5 > 0$ [sol: $x < \frac{7 - \sqrt{29}}{2} \lor x > \frac{7 + \sqrt{29}}{2}$
	31. $\frac{1}{2}x^2 - 3x + 2 \leq 0$ [sol: $3 - \sqrt{5} \leq x \leq 3 + \sqrt{5}$]
7. Determina i valori di $x$ per cui $A(x) / B(x) < 0$.
[sol: $-3 < x < -2 \lor -1 < x < 2 \lor x > 3$]
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
8. **[EE]** Risolvi le seguenti disequazioni di terzo grado, già fattorizzate.
	1. $(x + 3)(x + 1)(x - 1) < 0$ [sol: $x < -3 \lor -1 < x < 1$]
	2. $(x - 1)^2(x + 5) \geq 0$ [sol: $x \geq -5$]
	3. $x(x + 2)(x - 2) > 0$ [sol: $-2 < x < 0 \lor x > 2$]
	4. $-x(x + 1)(x - 1) < 0$ [sol: $-1 < x < 0 \lor x > 1$]
	5. $(2x - 1)(x + 1)(x - 1) \geq 0$ [sol: $-1 \leq x \leq 1/2 \lor x \geq 1$]
	6. $-5(3x - 2)(2x + 3)^2 \leq 0$ [sol: $x \geq 2/3 \lor x = -3/2$]
9. **[EE/F]** Risolvi le seguenti disequazioni fratte.
	1. $\dfrac{x + 1}{x - 2} < 0$ [sol: $x \in (-1, 2)$]
	2. $\dfrac{-x + 1}{3x - 6} \geq 0$ [sol: $1 \leq x < 2$]
	3. $\dfrac{5}{2x + 1} < 0$ [sol: $x < -1/2$]
	4. $\dfrac{3x + 1}{(x + 1)(x + 3)} \geq 0$ [sol: $-3 < x < -1 \lor x \geq -1/3$]
	5. $\dfrac{x - 3}{x + 2} > 0$ [sol: $x < -2 \lor x > 3$]
	6. $\dfrac{x^2 + 4x + 3}{x + 3} > 0$ [sol: $x > -1$]
	7. $\dfrac{-x + 1}{(x + 1)^2} \geq 0$ [sol: $x \leq 1 \land x \neq -1$]
	8. $\dfrac{2x + 5}{4 - x} \leq 0$ [sol: $x \leq -5/2 \lor x > 4$]
	9. $\dfrac{x}{x - 5} < \dfrac{x + 2}{x}$ [sol: $x < -10/3 \lor 0 < x < 5$]
	10. $\dfrac{x^2 - 9}{x + 1} < 0$ [sol: $x < -3 \lor -1 < x < 3$]
	11. $\dfrac{x - 4}{x^2 - 5x + 6} \geq 0$ [sol: $2 < x < 3 \lor x \geq 4$]
	12. $\dfrac{x^2 + 2x + 1}{x^2 - 4x} \leq 0$ [sol: $0 < x < 4 \lor x = -1$]
	13. $\dfrac{-x^2 + 3x - 2}{x^2 + 4} > 0$ [sol: $1 < x < 2$]
	14. $\dfrac{x}{x - 1} \leq \dfrac{2}{x + 1}$ [sol: $-1 < x < 1$]
	15. $\dfrac{1}{x - 2} + \dfrac{1}{x + 2} > \dfrac{4}{x^2 - 4}$ [sol: $x > -2 \land x \neq 2$]
	16. $2 - \dfrac{x + 3}{x - 1} \geq \dfrac{x}{x + 2}$ [sol: $x \leq -5 \lor -2 < x < 1$]
	17. $\dfrac{x^2}{x - 3} - x < \dfrac{9}{x - 3}$[sol: $\emptyset$]
10. **[F-]** Scrivi una disequazione di primo grado che abbia come soluzione $x < -1$.
    [sol: ad esempio $x + 1 < 0$]
11. **[F]** Scrivi l'equazione di una parabola ($y = \dotsc$) tangente all'asse $x$ nel punto $(3, 0)$.
    [sol: ad esempio $y = (x - 3)^2$]
12. **[F]** Disegna il grafico di una parabola $f(x)$ tale che $f(x) > 0$ per $x < -1 \lor x > 3$, quindi scrivi l'equazione della della parabola (ovvero $y = \dotsc$).
    [sol: ad esempio $y = (x + 1)(x - 3)$]
13. **[E]** Disegna il grafico di una funzione $f(x)$ tale che $f(x) \leq 0$ per $x \in [-5, 4] \cup [5, +\infty)$.
    [sol: ad esempio $y = -(x + 5)(x - 4)(x - 5)$]
14. **[AD]** Disegna il grafico di una parabola $A(x)$ tale che $A(x) / (x - 2) < 0$ per $x \in (-3, -1) \cup (2, +\infty)$.
    [sol: parabola con concavità verso il basso e zeri in -3 e -1, ad esempio $y = -(x + 3)(x + 1)$]
15. **[AD]** Disegna il grafico di una funzione $B(x)$ tale che $A(x) \cdot B(x) > 0$ per $x \in (2, 3)$.
[sol: ad esempio $B(x) = x(x - 2)$]
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-4.9,4.9],
  "ylim": [-2.9,2.9],
  "legend": true,
  "data": [
    { "fn": "0.5*x*(x-2)*(x-3)", "color": "red1", "label": "A(x)" }
  ]
}
```
16. **[AD]** Disegna il grafico di una funzione $B(x)$ tale che $A(x) / B(x) < 0$ per $x < -4 \lor 2 < x < 5$.
[sol: ad esempio $B(x) = -(x + 2)(x - 2)(x - 5)$]
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
17. **[EE]** Osservando il grafico, determina per quali valori di $x$ si verifica che $A(x) \geq B(x)$.
[sol: $-2 \leq x \leq 1$]
```matephis
{
  "xlim": [-4.9,4.9],
  "ylim": [-3.9,6.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "-x^2+4", "label": "A(x)" },
    { "fn": "x+2", "color": "black1", "label": "B(x)" }
  ]
}
```
18. **[E]** Utilizzando il grafico sottostante, determina per quali intervalli di $x$ la condizione $A(x) \cdot B(x) < 0$ è soddisfatta.
[sol: $x > -1 \land x \neq 1$]
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
19. **[F]** Disegna il grafico di una funzione $f(x)$ tale che $f(x) < 0$ esclusivamente per $x \in (-2, 4)$, quindi scrivi una possibile equazione per questa funzione (es: $y = \dotsc$).
    [sol: ad esempio $y = (x + 2)(x - 4)$]
20. **[PD]** Scrivi una disequazione fratta la cui soluzione sia esattamente $x < -1 \lor x \geq 2$.
    [sol: ad esempio $\dfrac{x - 2}{x + 1} \geq 0$]
21. **[PD+]** Determina visivamente per quali valori di $x$ è soddisfatta la doppia disequazione $f(x) \leq g(x) \leq h(x)$.
[sol: $x \leq -\sqrt{2} \lor x \geq \sqrt{2}$]
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
22. **[AD+]** Inventa una disequazione fratta (nella forma $\frac{N(x)}{D(x)} \leq 0$) che abbia esattamente come soluzione l'intervallo chiuso $[-2, 5)$ tranne il punto $x = 0$ (ovvero $-2 \leq x < 5$ ma con $x \neq 0$).
    [sol: ad esempio $\dfrac{x + 2}{x^2(x - 5)} \leq 0$]

## Quiz

1. **[EE]** Quale delle seguenti disequazioni ammette come soluzione $-2 \leq x \leq 1$
	- **(a)** $(x + 2)(x - 1) \leq 0$
	- **(b)** $(x - 2)(x + 1) \leq 0$
	- **(c)** $(x + 2)(x - 1) \geq 0$
	- **(d)** $(x - 2)(x + 1) \geq 0$
[sol: (a)]
2. **[F+]** Quale delle seguenti equazioni ha per soluzione qualunque $x$ appartenente all'intervallo rappresentato in figura?
	- **(a)** $-2(x - 4)(x + 1) \leq 0$
	- **(b)** $-2(x - 4)(x + 1) \geq 0$
	- **(d)** $-2(x + 4)(x - 1) \leq 0$
	- **(e)** $-2(x + 4)(x - 1) \geq 0$
[sol: (d)]
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
3. **[AD]** Quali delle seguenti affermazioni relative ai grafici in figura *non* sono corretta?
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
[sol: (a)]
4. **[AD]** Quale delle seguenti affermazioni *non* è corretta?
	- **(a)** $f(x) \cdot (3 - x) < 0$ per $x \in (-\infty, -2) \cup (0, 1) \cup (+3, +\infty)$
	- **(b)** $f(1) = 0$ e $f(2) = 8$
	- **(c)** $f(x) \cdot (3 - x) \geq 0$ per $x \in (-\infty, 0) \cup (+2, +3)$
	- **(d)** $f(1) \cdot (3 - x) = 0$ per $\forall x \in \mathbb{R}$
[sol: (c)]
```matephis
{
  "xlim": [-4.9,4.9],
  "legend": true,
  "data": [
    { "fn": "(x-1)*(x+2)*x", "color": "red1", "label": "f(x)" }
  ]
}
```
5. **[E]** Quale delle seguenti parabole interseca l'asse $x$ in $(-1, 0)$ e $(5, 0)$?
	- **(a)** $y = (x - 1)(x + 5)$
	- **(b)** $y = -(x + 1)(x - 5)$
	- **(c)** $y = x^2 - x + 5$
	- **(d)** $y = -x^2 + x - 5$
[sol: (b)]
6. **[EE]** Quale delle seguenti parabole è tangente all'asse $x$?
	- **(a)** $y = x^2 + 1$
	- **(b)** $y = x^2 + x$
	- **(d)** $y = (x + 1)^2$
	- **(e)** $y = x^2 + x + 1$
[sol: (d)]
7. **[AD]** Quale delle seguenti funzioni $A(x)$ è tale che $A(x) \geq B(x)$ $\forall x \in \mathbb R$?
	- **(a)** $y = x^2 + 2x + 1$
	- **(b)** $y = -x^2 - 2x - 1$
	- **(c)** $y = (x - 1)^2$
	- **(d)** $y = -(x - 1)^2$
[sol: (a)]
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
8. **[EE]** Quale delle seguenti disequazioni ammette come soluzione $x \leq -3 \lor x \geq 3$?
	- **(a)** $x^2 + 9 \geq 0$
	- **(b)** $x^2 - 9 \leq 0$
	- **(c)** $x^2 - 9 \geq 0$
	- **(d)** $(x - 3)^2 \geq 0$
[sol: (c)]
9. **[EE/F]** Quale delle seguenti disequazioni ha per soluzione qualunque $x$ appartenente all'intervallo rappresentato in figura?
	- **(a)** $(x + 3)(x - 2) \leq 0$
	- **(b)** $(x + 3)(x - 2) \geq 0$
	- **(c)** $(x - 3)(x + 2) \leq 0$
	- **(d)** $\dfrac{x - 2}{x + 3} \leq 0$
[sol: (a)]
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
10. **[F]** Osserva la parabola $A(x)$ nel grafico. Quale tra le seguenti affermazioni è **falsa**?
	- **(a)** $A(x) \geq 0$ per $x \in [0, 4]$
	- **(b)** $A(x) / (x - 2) > 0$ per $x \in (2, 4)$
	- **(c)** L'equazione della parabola potrebbe essere $y = -x^2 + 4x$
	- **(d)** $A(x) \cdot (x - 4) > 0$ per $x \in (0, 4)$
[sol: (d)]
```matephis
{
  "aspectRatio": "3:2",
  "xlim": [-2.9,6.9],
  "ylim": [-4.9,4.9],
  "aspectRatio": "1:1",
  "legend": true,
  "data": [
    { "fn": "-x*(x-4)", "color": "red1", "label": "A(x)" }
  ]
}
```
11. **[AD]** Per quale delle seguenti funzioni $f(x)^2 > 0$ per $x \in \mathbb R \setminus \{3\}$?
	- **(a)** $f(x) = x^2 - 6x + 9$
	- **(b)** $f(x) = x - 3$
	- **(c)** $f(x) = 3x + 3$
	- **(d)** $f(x) = x^2 + 9$
[sol: (b)]
12. **[PD]** Per quale delle seguenti funzioni $\dfrac{x^2 + 1}{f(x)} \geq 0$ $\forall x \in \mathbb R$?
	- **(a)** $f(x) = x + 2$
	- **(b)** $f(x) = x^2 + 2$
	- **(c)** $f(x) = x^2$
	- **(d)** $f(x) = x$
[sol: (b)]
13. **[D-]** Per quale delle seguenti funzioni $\dfrac{x - 1}{f(x)} < 0$ per $x \in (1, 2) \cup (3, +\infty)$?
	- **(a)** $f(x) = x^2 - 5x + 6$
	- **(b)** $f(x) = -x^2 + 5x - 6$
	- **(c)** $f(x) = -x^2 + 4x - 3$
	- **(d)** $f(x) = x^2 - x - 2$
[sol: (b)]
14. **[D-]** Quale delle seguenti affermazioni relative alla funzione $g(x)$ rappresentata in figura _non_ è corretta?
	- **(a)** $g(x) \cdot (x + 1) > 0$ per $x \in (-3, -1) \cup (1, 4)$
	- **(b)** $g(2) = 5$ e $g(4) = 0$
	- **(c)** $g(x) \cdot (x + 1) \leq 0$ per $x \in (-\infty, -3] \cup [-1, 4]$
	- **(d)** $g(-3) \cdot (x^2 + 1) = 0$ per $\forall x \in \mathbb{R}$
[sol: (c)]
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

**1. Caccia all'errore** **[F+]** Uno studente risolve la disequazione fratta $\dfrac{x^2 - 4}{x - 2} > 3$ in questo modo:

> "Scompongo il numeratore in $(x - 2)(x + 2)$. Semplifico il fattore $(x - 2)$ sopra e sotto. Mi rimane $x + 2 > 3$, quindi la soluzione è $x > 1$."

Questo procedimento è sbagliato. Spiega a parole perché il ragionamento dello studente è scorretto e fornisci la soluzione esatta.
[sol: Lo studente ha ignorato le condizioni di esistenza. Semplificando $(x-2)$ bisogna imporre $x \neq 2$. La soluzione corretta è $x > 1 \land x \neq 2$.]

**2. Il parametro misterioso** **[D+]** Considera la famiglia di parabole descritte dall'equazione $y = x^2 + kx + 9$, dove $k$ è un numero reale incognito. Trova per quali valori di $k$ l'intera parabola si trova completamente al di sopra dell'asse delle ascisse (ovvero $x^2 + kx + 9 > 0$ per ogni $x \in \mathbb{R}$).
[sol: $-6 < k < 6$]

**3. Il tuffatore** **[F+]** L'altezza $h$ (in metri) rispetto al livello dell'acqua di un tuffatore che si lancia da un trampolino è descritta dalla legge

$$h(t) = -5t^2 + 4t + 12 \, ,$$

dove $t$ è il tempo trascorso in secondi dal momento del salto. Scrivi e risolvi la disequazione che ti permette di scoprire per quale intervallo di tempo il tuffatore si trova a più di 9 metri di altezza.
[sol: $-5t^2 + 4t + 3 > 0$, da cui considerando $t \geq 0$ si ricava $0 \leq t < \frac{2+\sqrt{19}}{5}$]

**4. Reverse engineering grafico** **[PD]** Osserva il grafico qui sotto, che rappresenta i costi $C(n)$ e i ricavi $R(n)$ di una piccola azienda in migliaia di euro, in funzione dei prodotti venduti ($n$). Scrivi le due funzioni, imposta la disequazione per trovare la *zona di utile* (cioè dove i ricavi superano i costi) e indicane la soluzione osservando il grafico.
[sol: $C(x) = x^2+1$, $R(x) = 3x$; $3x > x^2+1 \Rightarrow \frac{3-\sqrt{5}}{2} < x < \frac{3+\sqrt{5}}{2}$]
```matephis
{
  "xlim": [0, 5],
  "ylim": [0, 15],
  "aspectRatio": "3:2",
  "boxPlot": true,
  "axisLabels": ["n","(k€)"],
  "legend": true,
  "padding": 50,
  "data": [
    { "fn": "x^2+1", "color": "red1", "label": "Costi C(x)" },
    { "fn": "3x", "color": "black1", "label": "Ricavi R(x)" }
  ]
}
```
**5. La città ideale** **[D-]** Il governatore di una provincia dell'antichità ha ricevuto dall'imperatore un budget sufficiente per costruire esattamente 4000 metri di mura difensive. Il suo obiettivo è fondare una nuova città e racchiudere all'interno delle mura la *massima area possibile* per ospitare i campi coltivati e le abitazioni.

Il suo capo architetto gli propone di costruire la città a forma di quadrato perfetto, sostenendo che sia la forma più regolare e capiente. Il governatore, però, ha studiato i testi dei matematici greci e conosce la disuguaglianza isoperimetrica, secondo cui per un dato perimetro $L$ e un'area $A$ vale sempre la relazione:

$$L^2 \geq 4\pi A$$

- Calcola l'area della città se venisse costruita a forma di quadrato con i 4000 metri di mura.  
2. Utilizzando la disuguaglianza isoperimetrica, calcola l'area massima assoluta che i 4000 metri di mura potrebbero racchiudere. Quale forma geometrica permette di raggiungere questo limite?
3. Senza usare i dati del problema, dimostra algebricamente tramite la disuguaglianza che, per un **qualsiasi** perimetro $L$ prefissato, l'area di un quadrato ($A_q$) sarà **sempre** strettamente minore dell'area di un cerchio ($A_c$). 