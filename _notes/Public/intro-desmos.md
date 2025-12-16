---
title: Parte 1 — Primi passi con Desmos
feed: hide
tags:
  - attività
  - desmos
---
## Parametri e slider

Su Desmos, $t$ è considerato un parametro. Pertanto, l'input $(2, t + 3)$, ad esempio, consentirà di visualizzare l'insieme dei punti così definiti al variare di $t$, ovvero la traiettoria definita dalle equazioni del moto $x(t) = 2$, $y(t) = t + 3$.

1. Create la traiettoria definita dalle equazioni del moto $x(t) = 2$, $y(t) = t + 3$, per $-2 \leq t \leq 4$.

Per visualizzare un punto che si muove sulla traiettoria, occorre utilizzare un'altra lettera al posto di $t$, ad esempio $T$. L'input $(2, T + 3)$ produce un punto e uno slider, tramite cui si modifica il valore di $T$. Animando $T$ si osserva il punto muoversi lungo la traiettoria precedentemente definita.

{:start="2"}
2. Animate un punto in modo che percorra ripetutamente la traiettoria sopra definita. Giunto al termine della traiettoria, il punto riparte dal punto iniziale.

Per visualizzare sia la traiettoria sia il punto, è possibile definire innanzitutto $A(t) = (2, t + 3)$, quindi utilizzare l'input $A(t)$ per visualizzare la traiettoria per un certo range di $t$ e l'input $A(T)$ per visualizzare il punto animato al variare di $T$.

{:start="3"}
3. Utilizzate la sintassi proposta per visualizzare la traiettoria e il punto animato.

## Un particolare spirografo

Create una nuova pagina Desmos.

1. Disegnate il punto $C = (2, 3)$.
2. Disegnate un punto $P_1$ che ruoti in senso antiorario attorno al punto $C$, alla distanza di $3$ unità, con velocità angolare $2$.
3. Disegnate un punto $P_2$ che ruota in senso orario attorno a $P_2$, alla distanza di $1.5$, con velocità angolare $1$.
4. Visualizzate la traiettoria prodotta da $P_2$.

Fate in modo che i raggi di rotazione di $P_1$ e $P_2$, detti rispettivamente $R_1$ e $R_2$, e le velocità angolari $v_1$ e $v_2$ siano controllabili mediante slider. Assicuratevi che i raggi siano non negativi e che le velocità angolari assumano solo valori discreti (positivi o negativi).

{:start="5"}
5. Fate variare i valori dei raggi e delle velocità angolari. **Cosa notate?**

Le varie figure ottenute sono esempi di **epicicloidi**, un particolare caso di **polinomi trignometrici** (ovvero ciò che si otterrebbe se si aggiungessero più punti rotanti).

Per costruire un polinomio trigonometrico, è possibile ricorrere ai vettori: su Desmos è possibile salvare più valori in un elenco (detto vettore in informatica), digitando, ad esempio, $a = [2, 3, -1, 4]$. Si può accedere al vettore del vettore in una specifica posizione, la seconda ad esempio, digitando $a[2]$: in questo caso si otterrebbe $a[2] = 3$.

{:start="6"}
6. Create un vettore $R$ contenente i raggi per 5 punti rotanti a scelta e un vettore $v$ con le rispettive velocità angolari discrete (sempre a scelta).

Per sommare più punti rotanti, usiamo la somma $\displaystyle\sum_{n = 1}^{5} \dotsc$  (che si ottiene digitando "sum"). Il parametro $n$ è detto indice e varia dal $1$ a 5. Al posto dei puntini si inserisce la definizione dei punti rotanti, usando come raggio e velocità angolari i valori salvati nei vettori $R$ e $v$.