---
title: Numeri complessi
feed: hide
slides: true
plot: true
tags:
  - numeri-complessi
---

### Obiettivi

- Definire l’**unità immaginaria** e i **numeri complessi**.
- Rappresentare un numero complesso con la **notazione cartesiana**, con la **notazione polare** e con la **notazione esponenziale**.
- Definire le operazioni di **addizione e moltiplicazione** tra numeri complessi.

---

## L'unità immaginaria

$\sqrt{-1}$ è detta **unità immaginaria** e si indica con $i$.

Pertanto:
$$ i^2 = \sqrt{-1}^2 = -1 $$

---

## I numeri complessi

Un numero complesso è un numero della forma

$$ z = a + ib \, , $$

dove:
- $a$ è un numero reale, detto **parte reale** di $z$; si indica con $\mathfrak{Re}(z)$;
- $b$ è un numero reale, detto **parte immaginaria** di $z$; si indica con $\mathfrak{Im}(z)$.

L'insieme dei numeri complessi si indica con $\mathbb{C}$.

---

Esistono tre modi per rappresentare un numero complesso.
- Il primo assomiglia alla rappresentazione dei punti sul piano cartesiano. La **rappresentazione cartesiana** consente di definire agevolmente la somma di numeri complessi.
- Il secondo modo, la **rappresentazione polare**, si basa sull’identificazione del numero complesso a partire da un angolo e dalla sua distanza da $0$. Fa da ponte tra la rappresentazione cartesiana e quella successiva…
- Esiste un terzo metodo — il più elegante — per rappresentare i numeri complessi: la **rappresentazione esponenziale** Questo metodo di rappresentazione consente di definire semplicemente la moltiplicazione tra numeri complessi.

---

## Rappresentazione cartesiana

Il numero complesso $z = a + ib$ si può rappresentare su un piano come un punto (o vettore) di coordinate $(a, b)$.

```matephis
{
  "align": "center",
  "aspectRatio": "3:2",
  "xlim": [-5.9, 5.9],
  "ylim": [-3.9, 3.9],
  "gridOpacity": 0.5,
  "secondaryGridOpacity": 0.2,
  "data": [
    {
      "points": [[2, 1, "z = P.x + iP.y"]],
      "freeCoordinates": true,
      "name": "P",
      "fillColor": "sumemr1",
      "radius": 3
    },
    { "vector": [[0, 0], ["P.x", "P.y"]], "color": "summer1", "width": 2 },
    { "vector": [[0, 0], ["P.x", 0]], "color": "summer3", "width": 2, "label": "Re(z) = P.x" },
    { "vector": [[0, 0], [0, "P.y"]], "color": "summer7", "width": 2, "label": "Im(z) = P.y" },
    { "vector": [[0, "P.y"], ["P.x", "P.y"]], "color": "black1", "width": 1, "dash": [4,4], "arrow": false },
    { "vector": [["P.x", 0], ["P.x", "P.y"]], "color": "black1", "width": 1, "dash": [4,4], "arrow": false }
  ]
}
```

---

Con il teorema di Pitagora è possibile calcolare la distanza del punto $(a, b)$ dall'origine. Tale distanza è detta **modulo** del numero complesso $z$ e si indica con $\lvert z \lvert$:

$$ \lvert z \lvert = \sqrt{a^2 + b^2} \, . $$

---

### Addizione

La **somma** di numeri complessi si comporta come la somma di vettori: si sommano per componenti.

La somma di $z_1 = a_1 + ib_1$ e $z_2 = a_2 + ib_2$ è:

$$ z_1 + z_2 = (a_1 + a_2) + i(b_1 + b_2) $$

---

Geometricamente, corrisponde alla **somma vettoriale**.

```matephis
{
  "align": "center",
  "aspectRatio": "3:2",
  "xlim": [-5.9, 5.9],
  "ylim": [-3.9, 3.9],
  "gridOpacity": 0.5,
  "secondaryGridOpacity": 0.2,
  "data": [
    {
      "points": [[2, 1, "z = P.x + iP.y"]],
      "freeCoordinates": true,
      "name": "P",
      "fillColor": "sumemr1",
      "radius": 3
    },
    {
      "points": [[-3, 0.5, "w = Q.x + iQ.y"]],
      "freeCoordinates": true,
      "name": "Q",
      "fillColor": "sumemr2",
      "radius": 3
    },
    {
      "points": [["P.x + Q.x", "P.y + Q.y", "z + w = R.x + iR.y"]],
      "radius": 3,
      "name": "R",
      "fillColor": "summer6"
    },
    { "vector": [[0, 0], ["P.x", "P.y"]], "color": "summer1", "width": 2 },
    { "vector": [[0, 0], ["P.x", 0]], "color": "summer3", "width": 2 },
    { "vector": [[0, 0], [0, "P.y"]], "color": "summer7", "width": 2 },
    { "vector": [[0, "P.y"], ["P.x", "P.y"]], "color": "black1", "width": 1, "dash": [4,4], "arrow": false },
    { "vector": [["P.x", 0], ["P.x", "P.y"]], "color": "black1", "width": 1, "dash": [4,4], "arrow": false },
    { "vector": [[0,0], ["Q.x", "Q.y"]], "color": "summer2", "width": 2 },
    { "vector": [["P.x", "P.y"], ["P.x + Q.x", "P.y"]], "color": "summer4", "width": 2, "opacity": 0.7 },
    { "vector": [["P.x", "P.y"], ["P.x", "P.y + Q.y"]], "color": "summer8", "width": 2, "opacity": 0.7 },
    { "vector": [["P.x + Q.x", "P.y"], ["P.x + Q.x", "P.y + Q.y"]], "color": "black1", "width": 1, "dash": [4,4], "arrow": false },
    { "vector": [["P.x", "P.y + Q.y"], ["P.x + Q.x", "P.y + Q.y"]], "color": "black1", "width": 1, "dash": [4,4], "arrow": false },
    { "vector": [[0, 0], ["P.x + Q.x", "P.y + Q.y"]], "color": "summer6", "width": 2 }
  ]
}
```

---

## Rappresentazione polare

Possiamo definire un numero complesso in funzione del suo **modulo** $r$ e del suo **argomento** $\theta$ (fase):

$$ z = \underbrace{r \cos \theta}_{a} + i \cdot \underbrace{r \sin \theta}_{b} = r(\cos \theta + i \sin \theta) $$

Possiamo quindi indicarlo come:
$$ z = \underbrace{(r \cos\theta, r \sin\theta)}_\text{forma cartesiana} = \underbrace{(r; \theta)}_\text{forma polare} $$

---

```matephis
{
  "align": "center",
  "xlim": [-4.9, 4.9],
  "ylim": [-4.9, 4.9],
  "polar": true,
  "polarUnits": "rad",
  "data": [
    {
      "points": [[2, 1, "z = P.x + iP.y"]],
      "freeCoordinates": true,
      "name": "P",
      "fillColor": "sumemr1",
      "radius": 3
    },
    { "vector": [[0, 0], ["P.x", "P.y"]], "color": "summer1", "width": 2, "label": "r = P.r, θ = P.theta" }
  ]
}
```
---

## Rappresentazione esponenziale

La funzione esponenziale $e^x$ si può sviluppare in serie di Taylor:

$$ e^x = \sum_{n = 0}^{+\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2} + \frac{x^3}{6} + \dots $$

Sostituendo $ix$ troviamo:

$$ e^{ix} = 1 + ix - \frac{x^2}{2} - \frac{ix^3}{3!} + \frac{x^4}{4!} + \dots $$

---

### Interpretazione geometrica di $e^{ix}$

La somma della serie ruota a distanza 1 dall'origine. Troviamo la relazione:

$$ (1; x) = e^{ix} $$

E se lo moltiplichiamo per un modulo $r$?

$$ r e^{i\theta} = \underbrace{r \cos \theta}_{a} + i \cdot \underbrace{r \sin \theta}_{b} $$

<iframe src="https://bradwave.github.io/complexp/" width="100%" height="500px" style="border:0px; border-radius: 8px;"></iframe>

---

### Moltiplicazione

Se $z_1 = r_1 e^{i\theta_1}$ e $z_2 = r_2 e^{i\theta_2}$:

$$ z_1 \cdot z_2 = r_1 r_2 \cdot e^{i(\theta_1 + \theta_2)} $$

La moltiplicazione corrisponde a una **dilatazione** e a una **rotazione** geometrica.

---