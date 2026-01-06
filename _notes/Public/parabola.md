---
title: Un recap (da bar) sulla parabola
feed: show
tags:
  - parabola
plot: true
---

## Il coefficiente a

Nel grafico è rappresentata la parabola di equazione $y = ax^2$. Fai variare il valore di $a$.

```matephis
{
  "padding": 5,
  "align": "center",
  "marginBottom": "20px",
  "params": {
    "a": { "val": 1, "min": -5, "max": 5, "step": 0.1 }
  },
  "data": [
    { "fn": "ax^2" }
  ]
}
```

Il coefficiente $a$ determina la **forma della parabola**.

- Se $a$ è positivo, la parabola sorride; se $a$ è negativo, la parabola è triste.
- Più $a$ è distante da zero, più la parabola è piccata (stretta); più è vicino a zero, meno la parabola è piccata (ovvero, è larga).
- Dal punto di vista fisico, se la parabola è un grafico tempo-posizione, $a$ è associato all'**accelerazione** dell'oggetto in movimento. L'accelerazione descrive come varia la velocità: immaginate che l'oggetto in movimento sia tirato verso l'alto se $a$ è positivo, verso il basso se $a$ è negativo. *Nota*: il fatto che l'oggetto sia tirato in una direzione non significa necessariamente che si muova sempre in quella direzione: ad esempio, se corri in avanti, ma qualcuno ti tira per la maglia all'indietro, continuerai a correre in avanti per un po', poi ti fermerai, poi inizierai a cadere all'indietro.

```matephis
{
  "padding": 5,
  "align": "center",
  "legend": true,
  "legendWidth": 110,
  "labelStyle": "italic",
  "data": [
    { "fn": "x^2", "color": "red1", "label": "$y = x^2$" },
    { "fn": "2x^2", "color": "red1", "dash": "2,2", "label": "$y = 2x^2$" },
    { "fn": "0.5x^2", "color": "red1", "dash": "3,3", "label": "$y = \\frac{1}{2}x^2$" },
    { "fn": "-x^2", "color": "black1", "label": "$y = -x^2$" }
  ]
}
```

## Il coefficiente b

Nel grafico è rappresentata la parabola di equazione $y = ax^2 + bx$ e la retta di equazione $y = bx$. Fai variare il valore di $b$. Prova a zoomare sull'origine.

```matephis
{
  "padding": 5,
  "align": "center",
  "marginBottom": "20px",
  "interactive": true,
  "params": {
    "a": { "val": 1, "min": -5, "max": 5, "step": 0.1 },
    "b": { "val": 1, "min": -5, "max": 5, "step": 0.1 }
  },
  "data": [
    { "fn": "ax^2 + bx" },
    { "fn": "bx", "color": "black1", "dash": "3,3" },
    { "points": [[0, 0]], "radius": 4, "fillColor": "#fff", "strokeColor": "#000", "strokeWidth": 2 }
  ]
}
```

Il coefficiente $b$ è la **pendenza iniziale della parabola**, ovvero la sua pendenza nel punto di intersezione con l'asse $y$.

- Se $b$ è positivo, la parabola inizialmente cresce; se $a$ è negativa la parabola inizialmente decresce.
- Il valore di $b$ è la pendenza della retta tangente alla parabola nel punto di intersezione con l'asse $y$, che avrà equazione $y = bx + c$.
- Variando $b$, la parabola è spostata a destra o a sinistra. Se $a$ e $b$ sono concordi, l'asse di simmetria della parabola è spostato a sinistra dell'asse $y$, se $a$ e $b$ sono discordi, l'asse di simmetria è spostato a destra.
- Dal punto di vista fisico, se la parabola è un grafico tempo-posizione, $b$ è la **velocità iniziale** dell'oggetto in movimento.

```matephis
{
  "xlim": [-4.9,4.9],
  "ylim": [-1.9,7.9],
  "padding": 5,
  "align": "center",
  "legend": true,
  "legendWidth": 120,
  "labelStyle": "italic",
  "renderOrder": "numbers-top",
  "data": [
    { "fn": "x^2 + x", "color": "red1", "label": "$y = x^2 + x$" },
    { "fn": "x", "domain": [-1, 1], "color": "red1", "dash": "3,3", "label": "$y = x$" },
    { "fn": "x^2 - x", "color": "black1", "label": "$y = x^2 - x$" },
    { "fn": "-x", "domain": [-1, 1], "color": "black1", "dash": "3,3", "label": "$y = -x$" },
    { "points": [[0, 0]], "radius": 4, "fillColor": "#fff", "strokeColor": "#000", "strokeWidth": 2 }
  ]
}
```
*Osservare come la parabola di equazione $y = x^2 + x$ ha pendenza 1 (positiva) nell'origine e la parabola di equazione $y = x^2 - x$ ha pendenza -1 (negativa) nell'origine.*

## Il coefficiente c



Il coefficiente $c$ è l'**intercetta, il "punto iniziale", della parabola**.

- La parabola interseca l'asse $y$ nel punto $(0, c)$.
- Variando $c$, la parabola è traslata in verticale: verso l'alto se $c$ cresce; verso il basso se $c$ decresce.
- Dal punto di vista fisico, se la parabola è un grafico tempo-posizione, $c$ la **posizione di partenza** dell'oggetto in movimento.

## Le intersezioni con l'asse x

Le intersezioni con l'asse $x$ della parabola, se esistono, hanno come coordinate $x$ le soluzioni di $ax^2 + bx + c = 0$. Quindi,

- non esistono punti di intersezione se $\Delta = b^2 - 4ac < 0$;
- esiste un punto di intersezione/tangenza se $\Delta = 0$;
- esistono due punti di intersezione se $\Delta > 0$.

Nel caso più generale, l'equazione si può risolvere con la formula quadratica (se altre tecniche più immediate non sono possibili): $x = -\dfrac{b}{2a} \pm \dfrac{\sqrt \Delta}{2a}$.

## L'asse di simmetria

L'asse di simmetria della parabola ha equazione $x = -\dfrac{b}{2a}$, perché, se la parabola interseca l'asse $x$, sta tra i due punti di intersezione — che si trovano rispettivamente prima e dopo l'asse, alla distanza di $\dfrac{\sqrt{\Delta}}{2a}$.

## Il vertice

Il vertice è il punto più alto, se la parabola è triste, o più basso, se la parabola è felice, della parabola. È l'intersezione tra la parabola e l'asse.

Per trovare le coordinate del vertice, basta sostituire nella parabola la coordinata $x$ dell'asse di simmetria e ricavare così la coordinata $y$.