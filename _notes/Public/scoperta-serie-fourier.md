---
title: Alla scoperta della serie di Fourier
feed: hide
tags:
  - attività
  - fourier
---
# Riscaldamento su Desmos

Su Desmos, $t$ è considerato un parametro. Pertanto, l'input $(2, t + 3)$, ad esempio, consentirà di visualizzare l'insieme dei punti così definiti al variare di $t$, ovvero la traiettoria definita dalle equazioni del moto $x(t) = 2$, $y(t) = t + 3$.

1. Crea la traiettoria definita dalle equazioni del moto $x(t) = 2$, $y(t) = t + 3$, per $-2 \leq t \leq 4$.

Per visualizzare un punto che si muove sulla traiettoria, occorre utilizzare un'altra lettera al posto di $t$, ad esempio $T$. L'input $(2, T + 3)$ produce un punto e uno slider, tramite cui si modifica il valore di $T$. Animando $T$ si osserva il punto muoversi lungo la traiettoria precedentemente definita.

{:start="2"}
2. Anima un punto in modo che percorra ripetutamente la traiettoria sopra definita. Giunto al termine della traiettoria, il punto riparte dal punto iniziale.

Per visualizzare sia la traiettoria sia il punto, è possibile definire innanzitutto $A(t) = (2, t + 3)$, quindi utilizzare l'input $A(t)$ per visualizzare la traiettoria per un certo range di $t$ e l'input $A(T)$ per visualizzare il punto animato al variare di $T$.

{:start="3"}
3. Utilizza la sintassi proposta per visualizzare la traiettoria e il punto animato.

# Un particolare spirografo

Crea una nuova pagina Desmos.

1. Disegna il punto $C = (2, 3)$.
2. Disegna un punto $P_1$ che ruoti in senso antiorario attorno al punto $C$, alla distanza di $3$ unità, con velocità angolare $2$.
3. Disegna un punto $P_2$ che ruota in senso orario attorno a $P_2$, alla distanza di $1.5$, con velocità angolare $1$.
4. Visualizza la traiettoria prodotta da $P_2$.

Fai in modo che i raggi di rotazione di $P_1$ e $P_2$, detti rispettivamente $R_1$ e $R_2$, e le velocità angolari $v_1$ e $v_2$ siano controllabili mediante slider. Assicurati che i raggi siano non negativi e che le velocità angolari assumano solo valori discreti (positivi o negativi).

{:start="5"}
5. Fai variare i valori dei raggi e delle velocità angolari. **Cosa noti?**

Le varie figure ottenute sono esempi di **epicicloidi**, un particolare caso di **polinomi trignometrici** (ovvero ciò che si otterrebbe se si aggiungessero più punti rotanti).

Per costruire un polinomio trigonometrico, è possibile ricorrere ai vettori: su Desmos è possibile salvare più valori in un elenco (detto vettore in informatica), digitando, ad esempio, $a = [2, 3, -1, 4]$. Si può accedere al vettore del vettore in una specifica posizione, la seconda ad esempio, digitando $a[2]$: in questo caso si otterrebbe $a[2] = 3$.

{:start="6"}
6. Crea un vettore $R$ contenente i raggi per 5 punti rotanti a scelta e un vettore $v$ con le rispettive velocità angolari discrete (sempre a scelta).

Per sommare più punti rotanti, usiamo la somma $\displaystyle\sum_{n = 1}^{5} \dotsc$  (che si ottiene digitando "sum"). Il parametro $n$ è detto indice e varia dal $1$ a 5. Al posto dei puntini si inserisce la definizione dei punti rotanti, usando come raggio e velocità angolari i valori salvati nei vettori $R$ e $v$.

# Punti rotanti su p5.js

[p5.js](p5js.org) è una **libreria** open-source **JavaScript per la programmazione creativa** e l'esplorazione di idee. Semplifica notevolmente la scrittura di web-app interattive e con focus sugli aspetti grafici.

È possibile consultare tutte le funzioni di p5.js alla pagina web dell **documentazione**: [p5js.org/reference](https://p5js.org/reference/).

All'apertura dell'[editor online](https://editor.p5js.org/), ci si trova di fronte al codice seguente.

```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
```

In contenuto della funzione [*setup()*](https://p5js.org/reference/p5/setup/) è eseguito una sola volta all'avvio della web-app. La funzione [*draw()*](https://p5js.org/reference/p5/draw/) viene eseguita 60 volte al secondo (compatibilmente con il livello di performance della macchina su cui la web-app viene eseguita). Il risultato di ogni esecuzione della funzione *draw()* è detto **frame**. Si riportano di seguito alcune indicazioni utili per iniziare a programmare.

- [*createCanvas*()](https://p5js.org/reference/p5/createCanvas/) crea una tela su cui possono essere visualizzati elementi grafica; le dimensioni della tela (larghezza e altezza, espresse in pixel) sono indicati tra parentesi — si dice che questi valori sono "passati" alla funzione *createCanvas()*.
- Una volta creata, le dimensioni della tela sono accessibili tramite le variabili *width* e *height*.
- [*background()*](https://p5js.org/reference/p5/createCanvas/) colora la tela (in questo caso, 220 corrisponde a un grigio chiaro).
- È possibile indicare il colore desiderato usando vari sistemi (RGB, HSB, scala di grigi): il più semplice consiste nel digitare il nome del colore tra virgolette, ad esempio *"red"*; un elenco di colori disponibili è disponibile al [seguente link](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/named-color).

Prova a modificare il codice.

1. Visualizza una tela 500x600, di colore blu scuro, e un grande punto giallo al centro della tela. Cerca nella documentazione come disegnare un punto, come colorarlo e come variare la dimensione del punto (suggerimento: *stroke*...).
2. Disegna due punti più piccoli: un punto rosso nell'angolo in alto a sinistra della tela e uno verde nell'angolo in basso a destra.
3. Modifica il codice in modo che il punto giallo segua il mouse.

Iniziamo a disegnare qualche circonferenza.

{:start="4"}
4. Modifica il codice in modo da visualizzare una circonferenza di raggio 100 centrata nella tela. Cerca nella documentazione come disegnare una circonferenza.

In JavaScript, è possibile costruire delle variabili, ovvero degli oggetti che possono mantenere in memoria delle informazioni oppure comportarsi come degli slider Desmos, nel modo seguente.

```javascript
let a = 5;

// oppure
var b = 5;
```

Le parale chiave *let* e *var* consentono di **creare una variabile**. Ponendo il nome della variabile uguale a un certo valore, si assegna questo valore alla variabile. Si consideri il codice seguente:

```javascript
let a; // la variabile viene creata, ma non inizializzata

a = 2; // a assume valore 2
a = 3; // a assume valore 2

a++; // il valore di a incrementa di 1

a += 3; // il valore di a incrementa di 3
a -= 2; // il valore di a decrementa di 2

// se a è uguale a 5, notare il doppio segno di uguaglianza,
// il codice compreso nella prima coppia di parentesi quadre viene eseguito
if (a == 5) {
	a = a * 2 - 1; // a è moltiplicato per 2 e diminuito di 1 
} else {
	// il codice seguente viene eseguito solo se a è diverso da 5
	a = -a; // a diventa uguale al suo opposto;
}
```

Per visualizzare il valore di una variabile è possibile "stamparlo" sulla console:

```javascript
console.log(a);
```

Osserva il seguente codice.

```javascript
let x = 0;

x--;

if(x < 0) {
	x += x;
} else {
	x -= 2; 
}

x = x / 2 + 3;
x++;
x = -x;
```

{:start="5"}
5. Prevedi il valore di *a* al termine delle operazioni, quindi verificalo usando l'editor online (utilizza *console.log()* per visualizzare il valore di *a* nella console). Puoi scrivere il codice "al di fuori" delle funzioni *setup()* e *draw()* — ovvero nel *global scope*, per gli intenditori e le intenditrici.

Introduciamo una variabile che descriverà lo scorrere del tempo, la chiamiamo *T*.

{:start="6"}
6. Crea la variabile *T* "al di fuori" di *setup()* e *draw()*, in questo modo sarà visibile a tutto il programma, quindi assegna a *T* valore 0 all'avvio dell'app e incrementa di 1 il valore di *T* ad ogni frame.
7. Crea un punto di colore rosa che, partendo dall'angolo in alto a destra dello schermo si muova diagonalmente verso l'angolo in basso a sinistra. La velocità verticale di movimento deve essere doppia rispetto alla velocità di movimento orizzontale.

Ripartiamo da una tela pulita, di colore azzurro chiaro.

{:start="8"}
8. Rappresenta un punto che ruota in senso antiorario a distanza 100 dal centro della tela, con velocità angolare 1.