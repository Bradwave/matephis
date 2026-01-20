---
title: Facsimile di una prova di verifica sull'esponenziale
feed: hide
tags:
  - facsimile
  - esponenziale
plot: true
---

## Quiz

1. Associa ad ognuna delle seguenti funzioni esponenziali il proprio grafico.
	- **(i)** $f(x) = -4 \cdot e^x + 3$
	- **(ii)** $f(x) = 4 \cdot e^x - 3$
	- **(iii)** $f(x) = -4 \cdot \left(\frac 1 e \right)^x - 3$
	- **(iv)** $f(x) = 4 \cdot \left(\frac 1 e \right)^x + 3$
```matephis
{
  "legend": true,
  "data": [
    { "fn": "-4*e^x+3", "color": "red1", "label": "A" },
    { "fn": "-4*(1/e)^x-3", "color": "red1", "dash": [2,2], "label": "B" },
    { "fn": "4*(1/e)^x+3", "color": "black1", "label": "C" },
    { "fn": "4*e^x-3", "color": "black1", "dash": [2,2], "label": "D" }
  ]
}
```
2. Qual è il dominio della funzione esponenziale $g(t) = 2^t - 3$?
	- **(a)** L'insieme di tutti i numeri reali $\mathbb{R}$.
	- **(b)** L'insieme dei numeri reali positivi.
	- **(c)** L'insieme dei numeri reali maggiori o uguali a 1.
	- **(d)** L'insieme dei numeri interi.
3. In figura è rappresentato il grafico della funzione $f$. Il grafico di $g(x) = 2 \cdot f(x) - 1$ è
	- **(a)** crescente, che tende ad avvicinarsi alla soglia.
	- **(b)** decrescente, che tende ad avvicinarsi alla soglia.
	- **(c)** crescente, che tende ad allontanarsi dalla soglia.
	- **(d)** decrescente, che tende ad allontanarsi dalla soglia.
```matephis
{
  "data": [
    { "fn": "-2*0.5^x" }
  ]
}
```
4. Quale delle seguenti funzioni è equivalente a $f(x) = 3 \cdot 2^{-x}$?
	- **(a)** $f(x) = 3 \cdot (-2)^{x}$
	- **(b)** $f(x) = 3 \cdot \left(\frac{1}{2}\right)^x$
	- **(c)** $f(x) = -3 \cdot 2^x$
	- **(d)** $f(x) = 6^{-x}$
5. Nel contesto della fissione nucleare, la relazione $N(t) = N_0 \cdot k^{t / \tau}$ descrive il numero di neutroni. Cosa rappresenta il parametro $N_0$?
	- **(a)** Il tempo di generazione (in secondi).
	- **(b)** Il numero iniziale di neutroni.
	- **(c)** L'energia cinetica dei frammenti.
	- **(d)** Il fattore di moltiplicazione efficace (numero medio di neutroni prodotti che causano nuova fissione).
6. In un reattore nucleare, il numero di elettroni liberi e, quindi, il numero di fissioni nucleari è descritto dalla funzione $N(t) = k^{10^4 \, \cdot \, t}$. Se $k$ è di poco maggiore di $1$,
	- **(a)** il reattore si sta accendendo.
	- **(b)** il reattore si sta spegnendo.
	- **(c)** il numero di reazioni rimane costante nel tempo.
	- **(d)** il numero di reazioni cresce nel tempo, ma non in modo esponenziale.
7. La concentrazione del nitrato $NO_3^-$ (un inquinante) in un fiume ammonta inizialmente a $1 \, \text{mg/L}$ e dimezza ogni giorno. Quale funzione rappresenta la concentrazione del nitrato $N$ dopo $t$ giorni?
	- **(a)** $N(t) = 1 - 0{,}5^t$
	- **(b)** $N(t) = 0{,}5^t$
	- **(c)** $N(t) = \frac 1 2 \cdot 1^t$
	- **(d)** $N(t) = 1 \cdot t^\frac{1}{2}$
8. Si consideri il valore di un'azione $A$ che aumenta del 5% ogni anno. Se $A(t) = a \cdot b^t$, quanto vale la base $b$?
	- **(a)** $1,05$
	- **(b)** $5$
	- **(c)** $1,5$
	- **(d)** $0,95$
9. Con riferimento all'esercizio precedente, quale dei seguenti grafici rappresenta il valore dell'azione $A$ (espresso in euro) in funzione del tempo $t$ (espresso in anni), se inizialmente l'azione vale 50 €?
	- **(a)** Il grafico A
	- **(b)** Il grafico B
	- **(c)** Il grafico C
	- **(d)** Il grafico D
	- **(e)** Non è possibile stabilirlo con certezza, A oppure B.
```matephis
{
  "xlim": [0,5],
  "ylim": [45,85],
  "axisLabels": ["t","A"],
  "axisLabelStyle": "italic",
  "boxPlot": true,
  "showXTicks": true,
  "showYTicks": true,
  "legend": true,
  "padding": 40,
  "data": [
    { "fn": "50*1.05^x", "color": "red1", "label": "A" },
    { "fn": "50*1.5^x", "color": "red1", "dash": [2,2], "label": "B" },
    { "fn": "50*0.95^x", "color": "black1", "label": "C" },
    { "fn": "50-0.95*x", "color": "black1", "dash": [2,2], "label": "D" }
  ]
}
```
10. In figura è rappresentato il grafico della funzione $f$, che descrive il numero di formiche in un formicaio (espresso in milioni) al variare del tempo $t$ (espresso in settimane). Una malattia infettiva mortale per le formiche si sta diffondendo nel formicaio. Quale delle seguenti affermazioni è corretta?
	- **(a)** Le formiche dimezzano ogni 5 settimane.
	- **(b)** Un milione di formiche è immune alla malattia.
	- **(c)** Dopo 30 settimane rimangono poco più di 100 mila formiche.
	- **(d)** La popolazione di formiche decresce costantemente nel tempo.
```matephis
{
  "xlim": [0,50],
  "ylim": [0,4],
  "axisLabels": ["t","f"],
  "axisLabelStyle": "italic",
  "boxPlot": true,
  "showXTicks": true,
  "showYTicks": true,
  "padding": 40,
  "data": [
    { "fn": "2*0.9^x+1", "color": "red1" }
  ] 
}
```

---

## Problema

### Luce negli abissi

L'intensità della luce solare $I$ che penetra nell'acqua oceanica decresce esponenzialmente con la profondità $x$ (in metri) secondo la Legge di Beer-Lambert. In un determinato oceano, si osserva che l'intensità in funzione della profondità è descritta da $I(x) = I_0 \cdot 0{.}75^{x / 10}$.

1.  Qual è il significato di $0{,}75$?
2.  Scrivi la funzione che descrive la percentuale di luce residua rispetto alla superficie $R(x) = \frac{I(x)}{I_0} \cdot 100$ in funzione della profondità.
3. Traccia il grafico approssimativo di $R(x)$.
4.  A quale profondità l'intensità luminosa si riduce al 2% di quella iniziale? Imposta l'equazione necessaria per rispondere a questa domanda e risolvila con il metodo che preferisci.

---

## Domande aperte

1. Spiega perché la funzione $f(t) = 2^t$ viene definita "esponenziale" e in cosa differisce da una funzione potenza come $g(t) = t^2$.
2. Con riferimento al quesito precedente, per quali valori di $t$ si verifica $f(t) = g(t)$?