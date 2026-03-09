---
title: Funzioni complesse e polinomi trigonometrici
feed: hide
slides: true
tags:
  - funzioni-complesse
  - polinomi-trigonometrici
---

## Funzioni complesse

### Obiettivi

- Ricordare la definizione generale di **funzione**.
- Definire le **funzioni a valori complessi**.

---

### Il concetto di funzione

Una **funzione** $f$ associa a un elemento $t$ di un **dominio** $X$, uno e un solo elemento $f(t)$ del **codominio** $Y$:

$$ f : t \in X \longmapsto f(t) \in Y $$

---

Il grafico è l'insieme delle coppie ordinate $(t, f(t))$.

<iframe src="https://www.desmos.com/calculator/iolyzymilv?embed" width="100%" height="500px" style="border:0px; border-radius: 8px;"></iframe>

---

### Le funzioni a valori complessi

Una **funzione a variabile reale e valori complessi** è del tipo:

$$ f : t \in \mathbb{R} \longmapsto f(t) \in \mathbb{C} $$

Associa a input reali $t$ dei valori complessi $f(t)$ in output.

---

Il grafico richiederebbe **tre dimensioni** (una per il dominio reale e due per il codominio complesso), ma spesso ci concentriamo sulla sua proiezione sul piano complesso al variare di $t$.

<iframe src="https://www.desmos.com/3d/alwhwlplqq?embed" width="100%" height="500px" style="border:0px; border-radius: 8px;"></iframe>

---

## Polinomi trigonometrici

### Obiettivi
- Definire i **monomi trigonometrici** e interpretarli geometricamente.
- Definire i **polinomi trigonometrici** e interpretarli geometricamente.
- Visualizzare il grafico di un polinomio trigonometrico.

---

### I monomi trigonometrici

Possiamo far variare nel tempo la posizione di un numero complesso $z$ definendolo come funzione:

$$ z(t) = e^{it} $$

Il numero complesso ruoterà a distanza 1 da 0 al variare del tempo $t$.

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
  <iframe src="https://www.desmos.com/3d/wczlgwuj8x?embed" width="100%" height="500px" style="border:0px; border-radius: 8px;"></iframe>
  <iframe src="https://www.desmos.com/calculator/taguxicfeu?embed" width="100%" height="500px" style="border:0px; border-radius: 8px;"></iframe>
</div>

---

Se vogliamo variare la **frequenza** di rotazione (giri nel tempo), moltiplichiamo $t$ per $n$:

$$ z(t) = e^{int} $$

<iframe src="https://www.desmos.com/calculator/v3n9anmmsq?embed" width="100%" height="400px" style="border:0px; border-radius: 8px;"></iframe>

---

Moltiplicandolo poi per un numero complesso costante $c = r e^{i\phi}$ otteniamo un **monomio trigonometrico**:

$$ c \cdot z(t) = r e^{i\phi} \cdot e^{int} = \underbrace{r}_{\text{modulo}} e^{i(\overbrace{nt+\phi}^{\text{fase}})} $$

<iframe src="https://www.desmos.com/calculator/zsoku4dmva?embed" width="100%" height="300px" style="border:0px; border-radius: 8px;"></iframe>

---

**Quiz**

Come posso rappresentare un punto che ruota con **frequenza 2** alla **distanza 3** dall'origine in funzione del tempo $t$?

$$ z(t) = 3e^{i2t} $$

---

### I polinomi trigonometrici

La somma di più monomi trigonometrici è un **polinomio trigonometrico**:

$$ P(t) = \sum_{n = -N}^{N} c_n \cdot e^{int} $$

Associa ad ogni istante $t$ un punto sul piano complesso $P(t)$.

---

Ad esempio, il polinomio $e^{-it} + e^{i \frac{\pi}{2}} + 2 \cdot e^{i(6t)}$ è la somma di tre monomi in rotazione l'uno attorno all'altro.

<iframe src="https://www.desmos.com/calculator/bsjfbb3pym?embed" width="100%" height="500px" style="border:0px; border-radius: 8px;"></iframe>

---

## Serie e trasformata di Fourier

### Obiettivi
- Definire la **serie di Fourier**.
- Definire i coefficienti della serie di Fourier tramite la **trasformata di Fourier**.

---

### La serie di Fourier

Quali figure è possibile "disegnare" attraverso un polinomio trigonometrico?

<iframe src="https://bradwave.github.io/freehandfourier/" width="100%" height="600px" style="border:0px; border-radius: 8px;"></iframe>

---

**Teorema**

Per qualsiasi funzione a valori complessi $f(t)$ periodica di periodo $2\pi$ e a quadrato sommabile su $[0, 2\pi]$ esistono dei coefficienti $c_n$ tali per cui:

$$ f(t) = \underbrace{\sum_{n=-\infty}^{+\infty} c_n \cdot e^{int}}_{\text{serie di Fourier}} $$

---

#### Analizziamo pezzo per pezzo

- La funzione $t \mapsto f(t)$ associa ad ogni istante $t \in \mathbb{R}$ un numero complesso $f(t) \in \mathbb{C}$.
- La funzione è **periodica** di periodo $2\pi$, dunque il suo grafico sul piano complesso è una **curva chiusa** ($f(t) = f(t+2\pi)$).
- La funzione è **a quadrato sommabile**: $\int_0^{2\pi} |f(t)|^2 dt < +\infty$.

In poche parole, **tutte le funzioni il cui grafico sul piano complesso è una curva chiusa che si potrebbe realizzare a mano libera**.

---

### Come sono calcolati i coefficienti

I coefficienti $c_n$ sono calcolati attraverso la **trasformata di Fourier**:

$$ c_n = \widehat{f}_n = \underbrace{\frac{1}{2\pi} \int_0^{2\pi} f(t) \cdot e^{-int} \, dt}_{\text{trasformata di Fourier}} $$

Il coefficiente corrisponde al "centro di massa" della funzione $f(t)$ avvolta intorno a $0$ alla frequenza $-n$.

---

### Trasformata Discreta di Fourier (DFT)

Nella sua versione discreta, per una sequenza di $N$ numeri complessi $\{f_k\}$:
$$ c_n = \underbrace{\frac{1}{N} \sum_{k=0}^{N-1} f_k \cdot e^{-2\pi in \frac{k}{N}}}_{\text{DFT}} $$

---

Esempio di implementazione in JavaScript:
```javascript
function dft(f) {
  const F = [];
  const N = f.length;
  for (let n = 0; n < N; n++) {
    let sum = new ComplexNumber(0, 0);
    for (let k = 0; k < N; k++) {
      const theta = (- 2 * Math.PI * (k / N) * n);
      const c = new ComplexNumber(Math.cos(theta), Math.sin(theta));
      sum.add(c.multiply(f[k]));
    }
    sum = sum.divide(N);
    F.push({
      re: sum.real(), im: sum.imag(), freq: n,
      amp: sum.abs(), phase: sum.phase()
    });
  }
  return F;
}
```
---