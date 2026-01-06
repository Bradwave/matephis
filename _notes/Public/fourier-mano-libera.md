---
title: Parte 4 — Fourier a mano libera
feed: hide
tags:
  - attività
  - p5js
  - fourier
code: true
---
Vorremmo implementare direttamente all'interno della nostra applicazione la possibilità di creare un disegno e rappresentarlo attraverso una serie di Fourier.

Si propone il seguente piano di implementazione:
- l'utente disegna sulla tela tenendo premuto il tasto sinistro del mouse e vengono salvate le coordinate $x$ e $y$ del mouse in due vettori `drawingX` e `drawingY`;
- quando il tasto sinistro è rilasciato, si applica la trasformata di Fourier;
- quando il tasto sinistro è nuovamente premuto si resettano i valori di `drawingX`, `drawingY`, `v`, `R`, `phi`, `pathX` e `pathY` (che contengono le coordinate $x$ e $y$ dell'ultimo punto rotante, ovvero quello che traccia l'immagine del polinomio trigonometrico che approssima la serie di Fourier).

È necessario implementare dei *listener*, delle funzioni "in ascolto", che vengono eseguite quando si verifica un particolare evento, come l'interazione dell'utente con l'applicazione. Occorre che questi *listener* agiscano solo sulla tela e non sullo slider che controlla il numero di coefficienti impiegati.

1. Per implementare le feature desiderate, considerate il seguente spunto.

```javascript
let canvas; // salviamo la tela in una variabile

/* true se il tasto sinistro è premuto, falso altrimenti */
let isMousePressed = true;


function setup() {
  canvas = createCanvas(600, 600);

  canvas.mousePressed(canvasMousePressed);
  canvas.mouseReleased(canvasMouseReleased);

  /* ... */
}

/* ... */

function mouseDragged() {
  if (isMousePressed) {
    /* vengono salvate le coordinate del mouse */
  }
}

function canvasMousePressed() {
  isMousePressed = true;
  
  /* ... */
}

function canvasMouseReleased() {
  isMousePressed = false;
  
  /* ... */
}

```

Create una copia dell'ultima tela p5.js.

{:start="2"}
2. Modificate il codice scritto in precedenza in modo da consentire all'utente di creare un disegno e ricostruirlo tramite una serie di Fourier.

| Avete smarrito il sentiero?                                                |
| -------------------------------------------------------------------------- |
| [Ecco un segnavia](https://editor.p5js.org/bradwave.mb/sketches/PkSBX542-) |
