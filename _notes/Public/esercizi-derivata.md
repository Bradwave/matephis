---
title: Esercizi sulla derivata
feed: show
plot: true
tags:
  - funzioni
  - derivata
---
Una raccolta di quesiti, quiz e problemi sulla derivata.

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

## Esercizi

1. **[EE/F]** Traccia il grafico approssimativo della derivata delle seguenti funzioni.

```matephis
{
  "padding": 10,
  "marginBottom": 5,
  "aspectRatio": "2:1",
  "xlim": [-3.9,3.9],
  "ylim": [-2.3, 2.3],
  "derivativeToggle": true,
  "data": [
    { "fn": "0.5*sin(0.5*pi*x)^2+0.5*cos(0.75*pi*x)" }
  ]
}
```
```matephis
{
  "padding": 10,
  "marginBottom": 5,
  "aspectRatio": "2:1",
  "xlim": [-2.9,2.9],
  "ylim": [-1.9,2.9],
  "derivativeToggle": true,
  "data": [
    { "fn": "x^2-x" }
  ]
}
```
```matephis
{
  "padding": 10,
  "marginBottom": 5,
  "aspectRatio": "2:1",
  "xlim": [-1.4,1.4],
  "ylim": [-3.4,3.4],
  "derivativeToggle": true,
  "data": [
    { "fn": "0.5*x + 0.4*cos(2*pi*x)" }
  ]
}
```
```matephis
{
  "padding": 10,
  "marginBottom": 5,
  "aspectRatio": "2:1",
  "xlim": [-2.9,2.9],
  "ylim": [-3.4,3.4],
  "derivativeToggle": true,
  "data": [
    { "type": "interpolation", "points": [[-4, -1], [-2,-1], [-1,1], [0,1], [2,-1.5], [4,-1.5]], "smoothness": 0, "color": "red1", "showPoints": false }
  ]
}
```
```matephis
{
  "padding": 10,
  "marginBottom": 5,
  "aspectRatio": "2:1",
  "xlim": [-0.1,2.9],
  "ylim": [-3.9,3.9],
  "derivativeToggle": true,
  "data": [
    { "fn": "log(x)" }
  ]
}
```
```matephis
{
  "padding": 10,
  "marginBottom": 5,
  "aspectRatio": "2:1",
  "xlim": [-3.4,3.4],
  "ylim": [-0.4,1.4],
  "derivativeToggle": true,
  "data": [
    { "fn": "e^(-x^2)" }
  ]
}
```
2. Calcola la derivata delle seguenti funzioni.
	1. $f(x) = x^2 + 3$
	2. $f(x) = x - \sin x$
	3. $f(x) = 3x^3 - 2x + 1$
	4. $f(x) = e^x + 5$
	5. $f(x) = \ln x$
	6. $f(x) = \cos x + x^2$
	7. $f(x) = 4x - 3$
	8. $f(x) = k$, dove $k$ è un numero reale.
	9. $f(x) = 5x^4 - 4x^3 + 3x^2 - x$
	10. $f(x) = \sin x + \cos x$
	11. $f(x) = ax^2 + bx$
	12. $f(x) = 3
	13. $f(x) = e^x - x$
3. **[EE/F]** Considera la funzione $f(x) = \dfrac{1}{2}x^2 + 2x - 1$.
	- Calcola la derivata della funzione $f$.
	  [sol: $f^\prime = x + 2$]
	- Traccia il grafico della derivata $f^\prime$.
	  [sol: retta con pendenza positiva $1$, che interseca l'asse delle ordinate in $2$]
	- Per quale valore di $x$ la derivata è nulla?
	  [sol: $x = -2$]
	- Determina le coordinate del minimo di $f$.
	  [sol: $(-2, -3)$]
	- Traccia un grafico approssimativo di $f$.
	  [sol: parabola con concavità rivolta verso l'alto, passante per $(0, -1)$ e per il minimo $(-2, -3)$]
	- Calcola la derivata seconda di $f$ e tracciane un grafico.
	  [sol: $f^{\prime\prime} = 1$]
	- Cosa si può affermare in merito alla concavità della funzione $f$?
	  [sol: Essendo la derivata seconda positiva e costante, la concavità di $f$ è sempre rivolta verso l'alto (è "felice").]

## Quesiti


## Quiz

1. **[PD-]** Quale delle seguenti affermazioni in merito alla derivata di $f(x) = x^3 - 3$ **non** è corretta?
	- **(a)** È sempre positiva.
	- **(b)** È decrescente per $x < 0$, crescente per $x > 0$.
	- **(c)** È una parabola.
	- **(d)** Nessuna, tutte le affermazioni sono corrette.
2. **[F]** Associa a ciascuna delle seguenti funzioni la propria derivata.
	- **(i)** $f_1(x) = x^2 - 3$
	- **(ii)** $f_2(x) = -3x + 1$
	- **(iii)** $f_3(x) = e^x - 1$
	- **(iv)** $f_4(x) = -x^3 + x$
```matephis
{
  "xlim": [-4.9,4.9],
  "ylim": [-4.9,4.9],
  "legend": "true",
  "data": [
    { "fn": "2x^2", "color": "red1", "label": "A" },
    { "fn": "-3", "color": "black1", "label": "B" },
    { "fn": "e^x", "color": "red1", "dash": [4,4], "label": "C" },
	{ "fn": "-3x^2+1", "color": "black1", "dash": [4,4], "label": "D" }
  ]
}
```
3. Quale delle seguenti è la derivata della funzione $f$ rappresentata nel grafico.
	- **(a)** $f^\prime(x) = 3x^2 - 14x + 14$
	- **(b)** $f^\prime(x) = -3x^2 + 14x - 14$
	- **(c)** $f^\prime(x) = 3x^3 + 14x^2 - 14$
	- **(d)** $f^\prime(x) = -3\sin(x) - 14$
```matephis
{
  "aspectRatio": "3:2",
  "xlim": [-1.9,5.9],
  "ylim": [-2.4,2.4],
  "legend": true,
  "data": [
    { "fn": "(x-1)*(x-2)*(x-4)" }
  ]
}
```
4. Per q

## Problemi

**Campo e potenziale** **[PD]** Nel grafico è rappresentato il potenziale elettrico $V$ (espresso in volt) in funzione della posizione $x$ (espressa in metri) lungo un cavo. Si ricorda che il campo elettrico $E$ (espresso in volt al metro) è la derivata del potenziale.
```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "xlim": [0, 2],
  "ylim": [0, 15],
  "aspectRatio": "3:2",
  "axisLabels": ["x","V"],
  "axisUnitMeasures": ["m", "V"],
  "slopeLabel": "E",
  "slopeUnitMeasure": "V/m",
  "axisLabelStyle": "italic",
  "showXTicks": true,
  "showYTicks": true,
  "derivativeToggle": true,
  "addDerivativePlot": true,
  "showDerivativeFunction": false,
  "derivativeYLim": [-40,20],
  "boxPlot": true,
  "boxNumbersInside": true,
  "padding": "auto",
  "marginBottom": 0,
  "data": [
    {
      "type": "interpolation",
      "points": [[-1, 10], [0.2, 10], [0.4, 10], [0.6, 4], [0.9, 4], [1.2,8], [1.4, 8], [1.8, 8], [2.5, 8]],
      "smoothness": 0,
      "color": "red1",
      "width": 3,
      "showPoints": false
    }
  ]
}
```
Spiega se sei d'accordo con le seguenti affermazioni.
- La derivata di $V$ è massima per $0 < x < 0.4$.
- La derivata di $V$ crescente per $0.9 < x < 1.2$.
- La derivata di $V$ per $0 < x < 0.4$ assume lo stesso valore della derivata di $V$ per $x > 1.2$.

Rispondi ai seguenti quesiti.
- Calcola la derivata di $V$ per $x \in (0.4, 0.6)$ e per $x \in (0.9, 1.2)$.
- Traccia un grafico approssimativo della derivata di $V$.
- Per quali valori di $x$ il campo $E$ è massimo? Per quali valori di $x$ è minimo?
- Per quali valori di $x$ il campo $E$ è costante?
