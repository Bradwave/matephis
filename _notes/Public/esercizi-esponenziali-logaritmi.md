---
title: Esercizi sulla funzione esponenziale
feed: show
tags:
  - esercizi
  - esponenziale
  - logaritmo
plot: true
---
Esercizi, quesiti, quiz e problemi sulle funzioni esponenziale e logaritmo.

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

## Esercizi

1. **[EE]** Disegna il grafico approssimativo delle seguenti funzioni esponenziali.
	1. $f(x) = 4^x$
	2. $f(x) = -\dfrac 1 2 4^x$
	3. $f(x) = 3 \cdot 2^x - 4$
	4. $f(x) = - \left(\frac 1 2 \right)^x + 1$
	5. $f(x) = 2 \cdot 2^x - 1$
	6. $f(x) = -2 + \left(\dfrac 1 3\right)^x - 2$
	7. $f(x) = +5 - 3^x$
2. **[F]** Quanti sono i punti di intersezione tra il grafico di $f(x) = e^x - 2$ e il grafico di $f(x) = x - 2$?
3. **[PD-]** Determina, in modo approssimativo, la soluzione o le soluzioni di $e^x -2 = x - 2$.
4. **[D]** Riscrivi le seguenti funzioni esponenziali nella forma $f(x) = a \cdot e^{\lambda x} + c$.
	1. $f(x) = 4 \cdot 1{,}2^x$
	2. $f(x) = 2 \cdot 0{,}8^x - 1$
	3. $f(x) = -3^x$
	4. $f(x) = \left(\frac 1 2 \right)^x + \frac 1 2$
	5. $f(x) = 0{,}1^x - 10$
	6. $f(x) = 2^{-x} + 1$
5. **[PD-]** Determina le definizioni algebriche ($f(x) = \dotsc$) delle funzioni il cui grafico è rappresentato in figura.
```matephis
{
  "xlim": [-6.9,6.9],
  "ylim": [-6.9,6.9],
  "legend": true,
  "data": [
    { "fn": "2^x + 1", "color": "red1", "label": "f" },
    { "fn": "-(0.75^x) - 1", "color": "red1", "label": "g", "dash": "2,2" },
    { "fn": "-(2^x) + 2", "color": "black1", "label": "h" }
  ]
}
```
6. **[PD]** In figura è rappresentato il grafico della funzione $f$. Rappresenta il grafico della funzione $g(x) = -2 \cdot f(x) - 1$.
```matephis
{
  "xlim": [-4.9,4.9],
  "ylim": [-4.9,4.9],
  "legend": true,
  "data": [
    { "fn": "2^x", "color": "red1", "label": "f" }
  ]
}
```
6. **[AD-]** In figura è rappresentato il grafico della funzione $f$. Rappresenta il grafico della funzione $g(x) = 3 \cdot f(x)$.
```matephis
{
  "xlim": [-4.9,4.9],
  "ylim": [-4.9,4.9],
  "legend": true,
  "data": [
    { "fn": "-(2^x)+1", "color": "red1", "label": "f" }
  ]
}
```

## Quesiti

1. **[F+]** Spiega perché il grafico della funzione esponenziale $f(x) = e^x$ non interseca l'asse $x$.
2. **[F]** Spiega perché
	- il grafico di $f(x) + c$ risulta traslato di $c$ rispetto al grafico di $f(x)$;
	- il grafico di $a \cdot f(x)$ risulta dilatata verticalmente se $a > 1$, compresso verticalmente se $0 < a < 1$, riflesso verticalmente e dilatato/compresso se $a < 0$;
	- il grafico di $b^x$ è crescente se $b > 1$ ed è decrescente se $0 < b < 1$.
3. **[F-]** Per quale valore di $b$ la funzione $f(x) = b^x$ è costante?

## Quiz

1. **[F+]** Quale dei seguenti è il grafico di $f(x) = 2^x - 1$?
	- **(a)** Grafico A
	- **(b)** Grafico B
	- **(c)** Grafico C
	- **(d)** Non è possibile scegliere tra (a) e (b)
```matephis
{
  "legend": true,
  "data": [
    { "fn": "3^x - 1", "color": "red1", "label": "A" },
    { "fn": "2^x - 1", "color": "red1", "label": "B", "dash": "2,2" },
    { "fn": "-(2^x) + 2", "color": "black1", "label": "C" }
  ]
}
```
2. **[F-]** Associa a ciascuna delle seguenti funzioni il proprio grafico.
	- **(i)** $f(x) = \frac 1 2 4^x - 1$
	- **(ii)** $f(x) = -\frac 1 2 4^x + 1$
	- **(iii)** $f(x) = 4 \left(\frac 1 2\right)^x + 1$
	- **(iv)** $f(x) = -4 \left(\frac 1 2\right)^x - 1$
```matephis
{
  "legend": true,
  "data": [
    { "fn": "4*0.5^x+1", "color": "red1", "label": "A" },
    { "fn": "-4*0.5^x-1", "color": "red1", "dash": "2,2", "label": "B" },
    { "fn": "-0.5*4^x+1", "color": "black1", "label": "C" },
    { "fn": "0.5*4^x-1", "color": "black1", "dash": "2,2", "label": "D" }
  ]
}
```
3. **[F-]** Quale funzione è rappresentata in figura?
	- **(a)** $f(x) = e^{x} + 1$
	- **(b)** $f(x) = -e^{x} + 1$
	- **(c)** $f(x) = e^{x} - 1$
	- **(d)** $f(x) = -e^{x} - 1$
```matephis
{
  "legend": true,
  "data": [
    { "fn": "-exp(x) - 1", "color": "red1" }
  ] 
}
```
4. **[F+]** Una delle seguenti funzioni è equivalente a $f(x) = 5 \cdot \left(\frac 1 2\right)^x +2$. Quale?
	- **(a)** $f(x) = 5 \cdot 2^{-x} + 2$
	- **(b)** $f(x) = \left(\frac 5 2\right)^x + 2$
	- **(c)** $f(x) = \left(\frac 5 2 \right)^x + 10$
	- **(d)** $f(x) = 7 \cdot 2^x$
5. **[F-]** Associa a ciascuno dei seguenti fenomeni il grafico più opportuno.
	- **(i)** 

## Problemi

### 1. Diramazioni

**[PD-]** Nei primi anni di vita, una pianta cresce nel modo seguente: ogni anno da ogni ramo spuntano 3 nuovi rami; inizialmente la pianta ha 2 rami.

- Quale funzione descrive il numero di rami terminali $r$ in funzione del tempo $t$?
- Se la pianta continuasse a crescere nel modo descritto, quanti rami terminali avrebbe dopo 20 anni?
- Traccia un grafico approssimativo della funzione $r(t)$.
- Dopo quanto tempo la pianta avrà 4374 rami terminali? Scrivi un'equazione per rispondere a questa domanda: prova a risolverla, quindi verifica la correttezza usando [WolframAlpha](https://www.wolframalpha.com/).

### 2. Ardua scelta

**[AD-]** Scrollando su un qualche social, ti imbatti nel seguente post (pensato per fare *engagement-baiting*):

> Preferisci 2 miliardi di euro subito oppure 1 euro che raddoppia ogni giorno?

- Qual è la scelta migliore a lungo termine?
- Dopo quanti giorni la seconda opzione diventa più vantaggiosa della prima? Scrivi una disequazione per rispondere alla domanda: prova a risolverla, quindi verifica la correttezza con [WolframAlpha](https://www.wolframalpha.com/).
- Scrivi due funzioni $S_1$ e $S_2$ per rappresentare le due scelte al variare del tempo $t$ (espresso in giorni). 
- Rappresenta la situazione con un grafico cartesiano. A cosa corrisponde il punto di intersezione tra i due grafici?

Una altro post — decisamente più sofisticato — recita invece quanto segue:

> Preferisci un investimento di 2000€ a capitalizzazione semplice con un interesse del 10% annuo oppure un investimento di 2000€ a capitalizzazione composta con un interesse del 2% annuo?

- Scrivi due funzioni per rappresentare i montanti $M_1$ e $M_2$ al variare del tempo $t$ (espresso in anni), quindi rappresentale.
- Qual è l'investimento più vantaggioso nel breve termine? E nel lungo termine?
- Dopo quanti anni il secondo investimento diventa più vantaggioso? Scrivi una disequazione per rispondere alla domanda: prova a risolverla, quindi verifica la correttezza con [WolframAlpha](https://www.wolframalpha.com/). Cosa noti? È semplice risolvere algebricamente la disequazione? Come puoi risolverla graficamente?

### 3. Deconcentrazioni farmaceutiche

**[PD]** $C(t) = 30 \cdot 0.7^t$ descrive la concentrazione nel sangue del paracetamolo (espressa in µg/mL — ovvero microgrammi per millilitro) in funzione del tempo (espresso in ore).  L'istante di tempo $t = 0$ corrisponde al momento, successivo all'assunzione, in cui la concentrazione è massima.

- Qual è la concentrazione iniziale del farmaco?
- Come varia ogni ora la concentrazione del farmaco?
- Traccia un grafico approssimativo di $C(t)$.

### 4. Chill out!

**[PD+]** Quando un oggetto a temperatura $T_0 = 85^\circ$ — posto in un ambiente a temperatura $T_\text{amb} = 20^\circ$ — si raffredda, la sua temperatura decresce esponenzialmente. Dopo ogni minuto, la temperatura diventa il 75% della temperatura precedente.

- Quale funzione descrive la temperatura dell'oggetto $T$ in funzione del tempo $t$?
- Qual è la temperatura dell'oggetto dopo un'ora? Dopo due ore?
- Traccia un grafico approssimativo della funzione $T(t)$.
- Dopo quanto tempo la concentrazione diventa 0.7% del valore iniziale?

### 5. Problemi di memoria

**[PD]** Lo psicologo Ebbinghaus studiò, alla fine dell'Ottocento, il declino della memoria nel tempo. In un certo soggetto, la capacità di recuperare certe informazioni acquisite dalla memoria $R$ è descritta, al variare del tempo $t$ (dove $t = 0$ è corrisponde al momento di acquisizione dell'informazione) dalla funzione $R(t)$ il cui grafico è sotto riportato (*curva dell'oblio*). Il tempo è espresso in giorni e $R$ in percentuale rispetto alla capacità iniziale (100%).

![esponenziale-1]({{ site.baseurl }}/images/esponenziale-1.svg)

- Qual è la capacità di recuperare informazioni al momento dell'acquisizione delle informazioni? Quanto vale $R$ dopo un giorno dall'acquisizione dell'informazione?
- $R$ non scende mai sotto quale valore?
- Scrivi la definizione algebrica di $R(t)$.
- Dopo quanto tempo la capacità di recuperare informazione scende al di sotto del 30% della capacità iniziale?

### 6. Bomba o reattore?

La reazione di *fissione nucleare* dell'uranio-235, un isotopo fissile dell'uranio, consiste nell'assorbimento di un neutrone da parte di un nucleo di uranio-235 e la successiva scissione del nucleo. Tramite tale processo è liberata una grande quantità di energia, principalmente sotto forma di energia cinetica dei frammenti in cui il nucleo è stato scisso (i prodotti di fissione), e l'emissione di alcuni neutroni veloci, in media 2,43. Tali neutroni possono causare altre reazioni di fissione, innescando un procedimento a catena. La probabilità che un neutrone venga assorbito da un nucleo di uranio-235 aumenta se i neutroni sono lenti (tali neutroni sono detti *termici*).

In una bomba o in un reattore nucleare, il numero di neutroni liberi $N$ al tempo $t$ (misurato in secondi) può essere descritto dalla seguente funzione esponenziale:

\[[N(t) = N_0 \cdot k^{t / \tau}, \]]

dove
- $N_0$ è il numero iniziale di neutroni;
- $k$ è il *fattore di moltiplicazione efficace*, ovvero il numero medio di neutroni prodotti da una fissione che riescono a causare una nuova fissione;
- $\tau$ è il *tempo di generazione* (in secondi), ovvero il tempo medio che intercorre tra l'emissione di un neutrone e la fissione successiva che esso provoca.

Rispondi ai seguenti quesiti.
- Quale parametro, tra $N_0$, $k$ e $tau$, è cruciale nella distinzione tra una bomba e un reattore nucleare? Quanto deve valere tale fattore in una bomba? Quanto deve valere in un reattore?
- Sostituisci $N_0 = 1$, $\tau = 10^{-8}$ e $k = 2{,}1$ nella funzione $N(t)$. La funzione descrive una bomba oppure un reattore nucleare? Traccia un grafico approssimativo della funzione.
- Quante reazioni di fissioni avvengono dopo 1 millesimo di secondo?
- Se l'energia liberata da ogni fissione vale, in media, $200 \, \text{MeV$ (nota $1 \, \text{Mev} \approx 1{,}6 \times 10^{-13} \, \text{J}$), quanta energia è prodotto al tempo $t = 0{,}001$ (non è richiesto il calcolo dell'energia prodotta *fino* al tempo $t = 0{,}001$, ma solo l'energia prodotta in quell'istante di tempo).
- Dopo quanto tempo il numero di neutroni liberi supera i mille miliardi?