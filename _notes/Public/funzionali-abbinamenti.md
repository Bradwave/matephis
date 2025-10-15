---
title: Funzionali abbinamenti
feed: show
tags:
  - attività
  - funzioni
---

Sono elencate di seguito 6 definizioni algebriche di funzioni, 6 grafici, 6 tabelle input/output e 6 fenomeni fisici. Abbina correttamente ogni definizione algebrica al suo grafico, alla sua tabella input/output e al fenomeno che la funzione che modellizza.

Scrivi il risultato nel modo seguente: *"definizione A, grafico B, tabella C, fenomeno D"* dove A, B, C e D sono numeri da 1 a 6.

---

### Definizioni algebriche

1. $f(x) = \dfrac x {3{,}6} + \dfrac{x^2}{100}$
2. $f(x) = 0{,}74(1-x)^3 - 1{,}74x(1-x)^2 + 1{,}8x^2(1-x) + 0{,}34x^3$
3. $f(x) = 20 \cdot \log_{10} \left(\dfrac x {20 \times 10^{-6}}\right)$
4. $f(x) = 10 \cdot e^{-0{,}2 t} \cos t$
5. $f(x) = -75 + 70x$
6. $f(x) = 0{,}21 \cdot 101{,}325 \cdot e^{-\dfrac{x}{8400}}$

---
### Grafici cartesiani e dynagraph

**Grafico 1**
![Grafico 1]({{ site.baseurl }}/images/funzionali_abbinamenti-1-bezier.svg)

**Grafico 2**
![Grafico 2]({{ site.baseurl }}/images/funzionali_abbinamenti-2-spl.svg)

**Grafico 3**
![Grafico 3]({{ site.baseurl }}/images/funzionali_abbinamenti-3-ossigeno.svg)

**Grafico 4**
![Grafico 4]({{ site.baseurl }}/images/funzionali_abbinamenti-4-monza.svg)

**Grafico 5**
![Grafico 5]({{ site.baseurl }}/images/funzionali_abbinamenti-5-arresto.svg)

**Grafico 6**
![Grafico 6]({{ site.baseurl }}/images/funzionali_abbinamenti-6-oscillatore.svg)

---

### Tabelle di input/output

**Tabella 1**

| x    | f(x)   |
| ---- | ------ |
| 0    | 21,278 |
| 1000 | 18,890 |
| 3000 | 14,888 |
| 4500 | 12,453 |
| 8849 | 7,420  |

**Tabella 2**

| x   | f(x) |
| --- | ---- |
| 0   | 0,74 |
| 0,2 | 0,22 |
| 0,4 | 0,10 |
| 0,6 | 0,21 |
| 0,8 | 0,35 |
| 1   | 0,34 |

**Tabella 3**

| x   | f(x) |
| --- | ---- |
| 0   | -75  |
| 1   | -5   |
| 2   | 65   |
| 3   | 135  |
| 4   | 205  |
| 5   | 275  |

**Tabella 4**

| x    | f(x)  |
| ---- | ----- |
| 0    | 10,00 |
| 1,57 | 0,01  |
| 3,14 | -5,34 |
| 4,71 | -0,01 |
| 6,28 | 2,85  |
| 7,85 | 0,01  |

**Tabella 5**

| x        | f(x) |
| -------- | ---- |
| 1,00E-05 | -6   |
| 1,00E-02 | 54   |
| 1,00E+01 | 114  |
| 1,00E+04 | 174  |
| 1,00E+07 | 234  |

**Tabella 6**

| x   | f(x) |
| --- | ---- |
| 36  | 23   |
| 72  | 72   |
| 90  | 106  |
| 108 | 147  |
| 126 | 194  |

---

### Fenomeni modellizzati

**1. La funzione cubica di Bézier**

Una **curva di Bézier cubica** è una curva descritta matematicamente, utilizzata nella *computer graphics* e nell’animazione. Ad esempio, il testo che stai ora leggendo tramite lo schermo del monitor è riprodotto graficamente tramite curve di Bézier.

![Lettera e renderizzata tramite curve di Bézier](https://rfong.github.io/creative-coding/bezier/images/jdhao_example_e.png)

Un particolare tipo di curva di Bézier cubica è la **funzione cubica di Bézier**, che trova applicazione nell'**animazione**, nel design delle interfacce utente e per rendere più fluida la traiettoria del cursore nelle interfacce controllate dallo sguardo. Ad esempio, una funzione cubica di Bézier può essere utilizzata per s**pecificare la posizione nel tempo di un oggetto** — come un’icona che si sposta da A a B — invece di farlo muovere semplicemente a un numero fisso di pixel per passo. Questo vale anche per la robotica, dove il movimento di un braccio di saldatura, ad esempio, deve essere fluido per evitare usura inutile.

**2. La distanza di sicurezza**

La **distanza di visibilità per l'arresto** — più comunemente detta distanza di sicurezza — è definita dal Decreto Ministeriale protocollo 6792 del 05/11/2001 (Ministero delle Infrastrutture e dei Trasporti) come

> *spazio minimo necessario perché un conducente possa arrestare il veicolo in condizione di sicurezza davanti ad un ostacolo imprevisto.*

La distanza di sicurezza per l'arresto è data dalla somma della **distanza percorsa nel tempo complessivo di reazione** (percezione, riflessione, reazione, attuazione e lo **spazio di frenatura**. I testi per la studio in preparazione all'esame della patente suggeriscono di approssimare lo spazio percorso durante il tempo di reazione — mediamente 1 secondo — dividendo la propria velocità (espressa in km/h) per 10 e moltiplicando per 3 il risultato ottenuto. Prevedono inoltre di approssimare lo spazio di frenatura dividendo la propria velocità (sempre espressa in km/h) per 10 ed elevare al quadrato il risultato ottenuto.

**3. Il livello sonoro**

Il **livello di pressione sonora** (**SPL**) o livello sonoro $L$ è una misura della pressione sonora efficace di un'onda sonora rispetto a una sorgente sonora di riferimento. Il livello sonoro è misurato confrontando la pressione dell'onda $p$ con una sonora di riferimento $p_0$, comunemente fatta corrispondere alla soglia uditiva di $20 \;\mu\text{Pa}$ (il suono di un moscerino che vola a 3 metri di distanza). Quando la pressione dell'onda raddoppia, quadruplica, diventa otto volte tanto ecc., l'intensità percepita dall'orecchio incrementa invece in modo lineare. 

**4. Ligne Droite des Hunaudières**

L'Hunaudières, in francese *"Ligne Droite des Hunaudières"*, è nel panorama dell'automobilismo sportivo uno fra i più famosi rettilinei al mondo, si tratta di una porzione del Circuit des 24 Heures du Mans. Un prototipo LMH *(Le Mans Hypercar)* si trova inizialmente a 75 metri prima della postazione di un commissario di gara e procede alla **velocità costante** di 252 km/h lungo il rettilineo. Il commissario di gara descrive con una funzione la **posizione** $s$ dell'auto **in funzione del tempo** $t$.

**5. Manca come l'aria...**

All’aumentare dell’altitudine, la concentrazione di ossigeno nell’aria rimane circa costante al 21%, ma la pressione atmosferica diminuisce, riducendo la **pressione parziale dell’ossigeno** disponibile per la respirazione. Di conseguenza, l’organismo riceve meno ossigeno, causando effetti come affaticamento e ipossia alle quote elevate. La pressione parziale dell'ossigeno è data dal prodotto della pressione atmosferica (101,325 kPa) per la percentuale d'ossigeno nell'aria.

**6. L'oscillatore armonico smorzato**

In fisica, il **moto armonico** è il particolare moto vario descritto da un **oscillatore armonico**, cioè un sistema meccanico che reagisce ad una perturbazione dell'equilibrio con una accelerazione di richiamo proporzionale allo spostamento subito — ad esempio, una massa appesa ad una molla, che oscilla all'allungarsi e al contrarsi della molla.

![Moto armonico semplice](https://upload.wikimedia.org/wikipedia/commons/0/07/Easy_harmonic_oscillator.gif)

Nello studio di fenomeni fisici reali i corpi in movimento sono di solito **soggetti a smorzamento**, di solito direttamente proporzionali alla velocità. In questo caso, il moto armonico è detto **armonizzatpo** o **smorzato**.

![Moto armonico smorzato](https://upload.wikimedia.org/wikipedia/commons/2/2b/Damped_spring.gif)
