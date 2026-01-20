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
	- **(i)** $f(x) = -3 \cdot 2^x + 2$
	- **(ii)** $f(x) = 3 \cdot 2^x - 2$
	- **(iii)** $f(x) = 3 \cdot \left(\frac 1 2\right)^x - 2$
	- **(iv)** $f(x) = -3 \cdot \left(\frac 1 2 \right)^x + 2$
```matephis
{
  "legend": true,
  "data": [
    { "fn": "-3*2^x+2", "color": "red1", "label": "A" },
    { "fn": "-3*0.5^x+2", "color": "red1", "dash": [2,2], "label": "B" },
    { "fn": "3*0.5^x-2", "color": "black1", "label": "C" },
    { "fn": "3*2^x-2", "color": "black1", "dash": [2,2], "label": "D" }
  ]
}
```
2. Qual è l'immagine della funzione esponenziale elementare $m(t) = 2^t$?
	- **(a)** L'insieme di tutti i numeri reali $\mathbb{R}$.
	- **(b)** L'insieme dei numeri reali positivi ($t > 0$).
	- **(c)** L'insieme dei numeri reali maggiori o uguali a 1.
	- **(d)** L'insieme dei numeri interi.
3. In figura è rappresentato il grafico della funzione $f$. Il grafico di $g(x) = -3 \cdot f(x) + 2$ è
	- **(a)** crescente, che tende ad avvicinarsi alla soglia.
	- **(b)** decrescente, che tende ad avvicinarsi alla soglia.
	- **(c)** crescente, che tende ad allontanarsi dalla soglia.
	- **(d)** decrescente, che tende ad allontanarsi dalla soglia.
```matephis
{
  "data": [
    { "fn": "2^x" }
  ]
}
```
4. Quale delle seguenti funzioni è equivalente a $f(x) = 3 \cdot \left(\frac{1}{2}\right)^x$?
	- **(a)** $f(x) = 3 \cdot 2^{-x}$
	- **(b)** $f(x) = \left(\frac{3}{2}\right)^x$
	- **(c)** $f(x) = -3 \cdot 2^x$
	- **(d)** $f(x) = 3 \cdot x^{1/2}$
5. Nella forma generale $f(x) = a \cdot b^x + c$, se $0 < b < 1$, cosa accade al grafico della funzione rispetto alla soglia $c$?
	- **(a)** Si allontana dalla soglia al crescere di $x$.
	- **(b)** Si avvicina alla soglia al crescere di $x$.
	- **(c)** La funzione diventa negativa.
	- **(d)** La funzione oscilla attorno a $c$.
6. Una coltura batterica inizia con 50 batteri e triplica ogni ora. Quale funzione rappresenta il numero di batteri $N$ dopo $t$ ore?
	- **(a)** $N(t) = 50 + 3^t$
	- **(b)** $N(t) = 3 \cdot 50^t$
	- **(c)** $N(t) = 50 \cdot 3^t$
	- **(d)** $N(t) = 50 \cdot t^3$
7. Si consideri il deprezzamento di un'auto che perde il 15% del valore ogni anno. Se $V(t) = A \cdot b^t$, quanto vale la base $b$?
	- **(a)** $0,15$
	- **(b)** $-15$
	- **(c)** $1,15$
	- **(d)** $0,85$
8. Nel contesto della fissione nucleare, la relazione $N(t) = N_0 \cdot k^{t / \tau}$ descrive il numero di neutroni. Cosa rappresenta il parametro $k$?
	- **(a)** Il tempo di generazione (in secondi).
	- **(b)** Il numero iniziale di neutroni.
	- **(c)** L'energia cinetica dei frammenti.
	- **(d)** Il fattore di moltiplicazione efficace (numero medio di neutroni prodotti che causano nuova fissione).
9. Quanto vale $k$ in un reattore nucleare in funzione?
	- **(a)** 0
	- **(b)** 1
	- **(c)** più di 1
	- **(d)** meno di 1
10. In figura è rappresentato il grafico della funzione $m$, che descrive la massa di una coltura batterica (espressa in nanogrammi) al variare del tempo $t$ (espresso in ore). Quale delle seguenti affermazioni è corretta?
	- **(a)** I batteri triplicano ogni ora.
	- **(b)** La massa iniziale della coltura è 5 ng.
	- **(c)** Manca sostanza nutritiva nella coltura, i batteri stanno morendo.
	- **(d)** Alcuni batteri non sono in grado di riprodursi.
```matephis
{
  "xlim": [-5.9,5.9],
  "ylim": [-4.9,54.9],
  "axisLabels": ["t","m"],
  "axisLabelStyle": "italic",
  "data": [
    { "fn": "5*2^x+10", "color": "red1" }
  ] 
}
```

---

## Problema

**Luce negli abissi**

L'intensità della luce solare $I$ che penetra nell'acqua oceanica decresce esponenzialmente con la profondità $x$ (in metri) secondo la Legge di Beer-Lambert: $I(x) = I_0 \cdot k^{x}$. In un determinato oceano, si osserva che l'intensità si dimezza (diventa la metà) ogni 10 metri di profondità.

1.  Determina il corretto coefficiente $k$.
2.  Scrivi la funzione che descrive la percentuale di luce residua rispetto alla superficie $R(x) = \frac{I(x)}{I_0} \cdot 100$ in funzione della profondità.
3. Traccia il grafico approssimativo di $R(x)$.
4.  A quale profondità l'intensità luminosa si riduce all'1% di quella iniziale? Imposta l'equazione necessaria per rispondere a questa domanda e risolvila con il metodo che preferisci.

---

## Domande Aperte

1. Spiega perché la funzione $m(t) = 2^t$ viene definita "esponenziale" e in cosa differisce da una funzione potenza come $f(t) = t^2$. Nella tua spiegazione, descrivi anche il significato della base $b$ in un contesto di crescita o decrescita (ad esempio, cosa indica $b$ rispetto alla quantità presente dopo un'unità di tempo).
2. Considera la scelta tra ricevere *"2 miliardi di euro subito" oppure "1 euro che raddoppia ogni giorno*". Senza effettuare calcoli precisi, descrivi qualitativamente come si comportano le due curve su un grafico cartesiano. Cosa rappresenta il punto di intersezione tra i due grafici e cosa succede "a lungo termine"?