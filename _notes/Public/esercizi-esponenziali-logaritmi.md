---
title: Esercizi su esponenziali e logaritmi
feed: show
tags:
  - esercizi
  - esponenziale
  - logaritmo
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

## Quesiti

1. **[EE]** Spiega perché il grafico della funzione esponenziale $f(x) = e^x$ non interseca l'asse $x$.

## Problemi

### 1. Diramazioni

Nei primi anni di vita, una pianta cresce nel modo seguente: ogni anno da ogni ramo spuntano 3 nuovi rami; inizialmente la pianta ha 2 rami.

- Quale funzione descrive il numero di rami terminali $r$ in funzione del tempo $t$?
- Se la pianta continuasse a crescere nel modo descritto, quanti rami terminali avrebbe dopo 20 anni?
- Traccia un grafico approssimativo della funzione $r(t)$.
- Dopo quanto tempo la pianta avrà 4374 rami terminali? Scrivi un'equazione per rispondere a questa domanda: prova a risolverla, quindi verifica la correttezza usando [WolframAlpha](https://www.wolframalpha.com/).

### 2. Ardua scelta

Scrollando su un qualche social, ti imbatti nel seguente post (pensato per fare *engagement-baiting*):

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

$C(t) = 30 \cdot 0.7^t$ descrive la concentrazione nel sangue del paracetamolo (espressa in µg/mL — ovvero microgrammi per millilitro) in funzione del tempo (espresso in ore).  L'istante di tempo $t = 0$ corrisponde al momento, successivo all'assunzione, in cui la concentrazione è massima.

- Qual è la concentrazione iniziale del farmaco?
- Come varia ogni ora la concentrazione del farmaco?
- Traccia un grafico approssimativo di $C(t)$.

### 4. Chill out!

Quando un oggetto a temperatura $T_0 = 85^\circ$ — posto in un ambiente a temperatura $T_\text{amb} = 20^\circ$ — si raffredda, la sua temperatura decresce esponenzialmente. Dopo ogni minuto, la temperatura diventa il 75% della temperatura precedente.

- Quale funzione descrive la temperatura dell'oggetto $T$ in funzione del tempo $t$?
- Qual è la temperatura dell'oggetto dopo un'ora? Dopo due ore?
- Traccia un grafico approssimativo della funzione $T(t)$.
- Dopo quanto tempo la concentrazione diventa 0.7% del valore iniziale?

### 5. Problemi di memoria

Lo psicologo Ebbinghaus studiò, alla fine dell'Ottocento, il declino della memoria nel tempo. In un certo soggetto, la capacità di recuperare certe informazioni acquisite dalla memoria $R$ è descritta, al variare del tempo $t$ (dove $t = 0$ è corrisponde al momento di acquisizione dell'informazione) dalla funzione $R(t)$ il cui grafico è sotto riportato (*curva dell'oblio*). Il tempo è espresso in giorni e $R$ in percentuale rispetto alla capacità iniziale (100%).

![esponenziale-1]({{ site.baseurl }}/images/esponenziale-1.svg)

- Qual è la capacità di recuperare informazioni al momento dell'acquisizione delle informazioni? Quanto vale $R$ dopo un giorno dall'acquisizione dell'informazione?
- $R$ non scende mai sotto quale valore?
- Scrivi la definizione algebrica di $R(t)$.
- Dopo quanto tempo la capacità di recuperare informazione scende al di sotto del 30% della capacità iniziale?