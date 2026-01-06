---
title: Parte 2 — In cammino con p5.js!
feed: hide
tags:
  - attività
  - p5js
code: true
---


[p5.js](p5js.org) è una **libreria** open-source **JavaScript per la programmazione creativa** e l'esplorazione di idee. Semplifica notevolmente la scrittura di web-app interattive e con focus sugli aspetti grafici.

È possibile consultare tutte le funzioni di p5.js alla pagina web della **documentazione**: [p5js.org/reference](https://p5js.org/reference/).

All'apertura dell'[editor online](https://editor.p5js.org/), ci si trova di fronte al codice seguente.

```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
```

Il contenuto della funzione [`setup()`](https://p5js.org/reference/p5/setup/) è eseguito una sola volta all'avvio della web-app. La funzione [`draw()`](https://p5js.org/reference/p5/draw/) viene eseguita 60 volte al secondo (compatibilmente con il livello di performance della macchina su cui la web-app viene eseguita). Il risultato di ogni esecuzione della funzione `draw()` è detto **frame**. Si riportano di seguito alcune indicazioni utili per iniziare a programmare.

- [`createCanvas()`](https://p5js.org/reference/p5/createCanvas/) crea una tela su cui possono essere visualizzati elementi grafici; le dimensioni della tela (larghezza e altezza, espresse in pixel) sono indicate tra parentesi — si dice che questi valori sono "passati" alla funzione `createCanvas()`.
- Una volta creata, le dimensioni della tela sono accessibili tramite le variabili `width` e `height`.
- [`background()`](https://p5js.org/reference/p5/createCanvas/) colora la tela (in questo caso, 220 corrisponde a un grigio chiaro).
- È possibile indicare il colore desiderato usando vari sistemi (RGB, HSB, scala di grigi): il più semplice consiste nel digitare il nome del colore tra virgolette, ad esempio `"red"`; un elenco di colori è disponibile al [seguente link](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/named-color).

## Punti, cerchi, line... *from scratch*

Provate a modificare il codice nell'editor online.

1. Visualizzate una tela 500x600, di colore blu scuro, e un grande punto giallo al centro della tela. Cercate nella documentazione come disegnare un punto, come colorarlo e come variare la dimensione del punto (suggerimento: cercate *stroke*...).
2. Disegnate due punti più piccoli: un punto rosso nell'angolo in alto a sinistra della tela e uno verde nell'angolo in basso a destra. Quindi congiungete i due punti con una linea sottile di colore rosa.
3. Modificate il codice in modo che il punto rosso segua il mouse.

Iniziamo a disegnare qualche circonferenza.

{:start="4"}
4. Modificate il codice in modo da visualizzare una circonferenza di raggio $100$ centrata nel centro della tela. Cercate nella documentazione come disegnare una circonferenza.
5. Rappresentate una circonferenza gialla di raggio $50$ con centro nel mouse.

## Troppe variabili!

In JavaScript, è possibile costruire delle variabili — ovvero degli oggetti che possono mantenere in memoria delle informazioni oppure comportarsi come degli slider Desmos — nel modo seguente.

```javascript
let a = 5;

// oppure
var b = 5;
```

Le parale chiave `let` e `var` consentono di **creare una variabile**. Ponendo il nome della variabile uguale a un certo valore, si assegna questo valore alla variabile. Si consideri il codice seguente:

```javascript
let a; // crea la variabile a, ma non la inizializza

a = 2; // assegna ad a il valore 2
a = 3; // assegna ad a il valore 3

a++; // incrementa di 1 il valore di a

a += 3; // incrementa di 3 il valore di a
a -= 2; // decrementa di 2 il valore di a

// esegue il codice compreso nella prima coppia di parentesi graffe
// se a è uguale a 5 (notare il doppio segno di uguaglianza!)
if (a == 5) {
	a = a * 2 - 1; // moltiplica a per 2 e sottrae 1 
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
5. Prevedete il valore di `a` al termine delle operazioni, quindi verificalo usando l'editor online (utilizza `console.log()` per visualizzare il valore di *a* nella console). Potete scrivere il codice "al di fuori" delle funzioni `setup()` e `draw()` — ovvero nel *global scope*, per gli intenditori e le intenditrici.

Introduciamo una variabile che descriverà lo scorrere del tempo, la chiamiamo *T*.

{:start="6"}
6. Create la variabile `T` "al di fuori" di `setup()` e `draw()`, in questo modo sarà accessibile in tutte le parti del programma, quindi assegnate a `T` valore $0$ all'avvio dell'app e incrementate di $0.01$ il valore di *`T`* ad ogni frame.
7. Create un punto di colore rosa che, partendo dall'angolo in alto a destra dello schermo si muova diagonalmente verso l'angolo in basso a sinistra. La velocità verticale di movimento deve essere doppia rispetto alla velocità di movimento orizzontale.

## Uno spirografo matematico, di nuovo

Ripartiamo da una tela pulita. Da ora in avanti scegliete liberamente i colori per i vari elementi grafici. Mantenete l'implementazione della variabile `T` che incrementa di 0.01 ad ogni frame.

{:start="8"}
8. Poiché siamo interessati/e a rappresentare fenomeni di rotazione con periodo $2\pi$, fate in modo che `T` vari tra 0 e $2\pi$, tornando a valere $0$ ogni qualvolta supera $2\pi$.
9. Rappresentate un punto $P_1$ che ruota in senso antiorario a distanza $100$ dal centro della tela, con velocità angolare $1$. ***Nota:*** per utilizzare seno e coseno occorre digitare `Math.sin()` e `Math.cos()` rispettivamente.
10. Provate a variare la velocità angolare del punto $P_1$.
11. Rappresentate, al di sotto del punto $P_1$, la circonferenza (senza riempimento) lungo cui il punto si muove e un segmento che congiunge il centro della tela con il punto. Per non scrivere troppe volte lo stesso codice e renderlo più leggibile, salvate le coordinate del punto in due variabili `x1` e `y1` (all'interno della funzione `draw()`).
12. Rappresentate un secondo punto $P_2$ che ruota a velocità angolare $-2$ alla distanza di $50$ dal punto $P_1$. Salvate le coordinate del punto $P_2$ nelle variabili `x2` e `y2`.

Vorremmo ora rappresentare il percorso tracciato da $P_2$. Per farlo, occorre utilizzare i *vettori*, che funzionano in modo del tutto analogo alle liste di Desmos.

```javascript
let v = [1, 1, 2, 3, 5, 8]; // viene creato il vettore v
console.log(v[4]); // viene stampato il valore del vettore nella posizione 4
// in questo caso v[4] = 5 (la prima posizione è la posizione 0)

v.push(13); // aggiunge 13 in fondo al vettore
// il vettore diventa [1, 1, 2, 3, 5, 8, 13]

v.pop(); // rimuove l'ultimo elemento del vettore
// il vettore diventa [1, 1, 2, 3, 5, 8]

v.unshift(0); // aggiunge 0 all'inizio del vettore
// il vettore diventa [0, 1, 1, 2, 3, 5, 8]

v.shift() // rimuove il primo elemento del vettore
// il vettore diventa [1, 1, 2, 3, 5, 8]

// ripete l'operazione console.log(...) per ogni elemento del vettore
for(let i = 0; i < v.length; i++) {
	console.log(v[i]); // stampa
}

v = []; // svuota il vettore
```

L'ultima parte del codice `for(...) { ... }` si chiama *ciclo for* e consente di ripetere delle linee di codice un certo numero di volte. La variabile `i` si chiama *indice* e, in questo caso, parte dal valore 0 e incrementa di 1 ad ogni ripetizione del ciclo fino a quando raggiunge il valore `v.length`, ovvero la lunghezza del vettore `v`.

{:start="13"}
13. Create, al di fuori di `setup()` e `draw()`, due vettori vuoti `pathX` e `pathY`, che conterranno rispettivamente le coordinate `x2` e `y2` del punto $P_2$. Ad ogni frame aggiungi `x2` al fondo di `pathX` e `y2` al fondo `pathY`. Fai in modo che i due vettori vengano svuotati ogni volta che la variabile `T` torna a valere 0.
14. Utilizzando un ciclo for, rappresentate il tracciato del punto $P_2$. Per farlo, potrebbero essere utili i seguenti comandi.

```javascript
beginShape(); // inizia la costruzione di una figura geometrica
vertex(a, b); // definisce il vertice (a, b) della figura
vertex(c, d); // definisce il vertice (c, d)
vertex(e, f); // definisce il vertice (e, f)
// ecc.
endShape(); // chiude la costruzione della figura
```

| Avete smarrito il sentiero?                                                |
| -------------------------------------------------------------------------- |
| [Ecco un segnavia](https://editor.p5js.org/bradwave.mb/sketches/dbI6naCjo) |

{:start="15"}
15. Create ora una sequenza di punti che ruotano uno attorno all'altro utilizzando come raggi di rotazione e velocità angolari i valori contenuti nei vettori `r` e `v` che seguono (il primo punto ruota intorno al centro della tela). Congiungete i punti con dei segmenti e mostrate le circonferenze lungo cui i punti ruotano. Infine, rappresentate la traccia percorsa dall'ultimo punto.

```javascript
let R = [100, 50, 40, 20, 10, 20];
let v = [1, 2, 3, -1, -2, -3];
```

{:start="16"}
16. Provate a modificare i valori di `R` e `v`.
17. Sfasate la rotazione dei punti dei seguenti valori.

```javascript
let phi = [0.1, 0, 0, 2, 3.14, 4];
```

{:start="18"}
18. Variate i valori di `R`, `v` e `phi` e il numero di elementi dei vettori.

| Avete smarrito il sentiero?                                                |
| -------------------------------------------------------------------------- |
| [Ecco un segnavia](https://editor.p5js.org/bradwave.mb/sketches/GRaOal4a-) |
