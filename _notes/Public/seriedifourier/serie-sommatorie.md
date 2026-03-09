---
title: Serie e sommatorie
feed: hide
slides: true
tags:
  - serie-sommatorie
---

### Obiettivi
- Introdurre il simbolo di **sommatoria**.
- Definire i concetti di **serie** e di **somma parziale**.
- Caratterizzare le **serie convergenti**.

---

## Le sommatorie

La lettera $\Sigma$ indica in matematica una **somma**. Ad esempio:

$$ 1^3 + 2^3 + \dots + 9^3 = \sum_{n = 1}^9 n^3 = 2025 $$

Si legge **sommatoria** per $n$ che va da $1$ a $9$ di $n^3$, dove $n$ è detto *indice della sommatoria*.

---

Si può paragonare a un **loop**:

```javascript
let sum = 0;
for (let n = 1; n <= 9; n++) {
  sum += n ** 3;
}
```

---

### Esempio (progressione geometrica)

Sommatoria delle potenze $n$-esime di $2$ per $n$ da $0$ a $k$:

$$ \sum_{n = 0}^{k} 2^n = 2^0 + 2^1 + 2^2 + \dots + 2^{k} $$

Per alcune sommatorie esiste una **forma chiusa**:

$$ \sum_{n = 0}^k 2^n = 2^{k + 1} - 1 \quad \left( \text{ad es. } \sum_{n=0}^{10} 2^n = 2^{11} - 1 = 2047 \right) $$

---

## Le serie
Una somma con infiniti termini si chiama **serie**.

$$ \sum_{n=0}^{+\infty} x_n = x_0 + x_1 + x_2 + \dots $$

La somma fino al $k$-esimo elemento è detta **somma parziale** $S_k$:

$$ S_k = \sum_{n = 0}^k x_n = x_0 + \dots + x_k $$

---

La somma della serie coincide con il limite della somma parziale per $k \to +\infty$:

$$ \sum_{n = 0}^{+\infty} x_n = \lim_{k \to +\infty} S_k $$

Se il limite è un numero finito, la serie **converge**.

---

### Esempio (serie geometrica)

La serie geometrica di ragione $1/2$ converge a $1$:

$$ \sum_{n = 1}^{+\infty} \frac{1}{2^n} = \frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \dots = 1 $$

---

### Esempio (serie divergente)

La somma dei numeri interi non negativi è una serie **divergente**:

$$ \sum_{n = 0}^{+\infty} n = 0 + 1 + 2 + \dots \to +\infty$$

---

### Esempio (Serie di Grandi)
Anche la seguente serie **non** è convergente (indeterminata):

$$ \sum_{n = 0}^{+\infty} (-1)^n = 1 - 1 + 1 - 1 + \dots $$

La somma parziale $S_k$ vale $1$ se $k$ pari, $0$ se dispari.


---