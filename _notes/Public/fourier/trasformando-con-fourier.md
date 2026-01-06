---
title: Parte 3 — Trasformando con Fourier
feed: hide
tags:
  - attività
  - p5js
  - fourier
code: true
---


## Sempre più coefficienti!

Il nostro obiettivo è rappresentare un disegno qualsiasi (realizzato a mano libera e formato da un'unica linea chiusa e continua) attraverso una **serie di Fourier**, ovvero una concatenazione infinita di punti rotanti. Per ragioni tecniche e pratiche, troncheremo la serie di Fourier e concateneremo solamente un numero finito di punti — utilizzeremo, ovvero, un polinomio trigonometrico. Per poter ricostruire il disegno tramite una serie di Fourier è necessario determinare i relativi coefficienti di Fourier, che si calcolano applicando **la trasformata di Fourier** al disegno di partenza.

Create una copia della tela p5.js su cui avete implementato la visualizzazione dei polinomi trigonometrici (vedi [[Parte 2 — In cammino con p5.js!]]).

1. Tramite l'applicazione drawxy.matephis.com, create un disegno a piacere. Nella sezione *DFT Analysis* copiate i corrispondenti valori di `v`, `R` e `phi` (che sono stati calcolati tramite una trasformata di Fourier) e incollateli nell'editor. Selezionate il maggior numero possibile di coefficienti di Fourier.
2. Adattate il codice in modo da visualizzare il polinomio trigonometrico definito da `v`, `R` e `phi`. ***Suggerimento:*** come centro di rotazione si usa il punto di coordinate $(R_0 \cos(\varphi_0), R_0 \sin(\varphi_0))$.

Si può controllare il numero di coefficienti utilizzati direttamente all'interno della nostra applicazione web tramite uno slider.

{:start="3"}
3. Create uno slider di nome `slider` che vari da $0.1$ a $100$ (cercate nella documentazione come crearlo).
4. Concatenate i punti rotanti solo se è rispettata la condizione che segue (che va riportata nel ciclo *for* tramite cui è rappresentata la concatenazione di punti rotanti). Qual è il suo significato?

```javascript
// ciclo for per visualizzare la concatenazione di punti rotanti
const maxSpeed = (slider.value() / 100) * N;
if (Math.abs(v[i]) < maxSpeed + 1) {
	// concatenazione dei punti
}
```

{:start="5"}
5. Fate variare il valore dello slider e verificate come cambia la precisione dell'approssimazione del disegno fornita dal polinomio trigonometrico.

| Avete smarrito il sentiero?                                                |
| -------------------------------------------------------------------------- |
| [Ecco un segnavia](https://editor.p5js.org/bradwave.mb/sketches/mX4Th-OmZ) |

## Dentro l'ingranaggio

Cerchiamo ora di capire come funziona l'applicazione drawxy.matephis.com, implementando noi stessi la trasformata di Fourier.

La procedura generale da seguire è la seguente:
- partiamo dalle coordinate `drawingX` e `drawingY` di una particolare figura;
- applichiamo la funzione `dft(drawingX, drawingY)`, ovvero la **trasformata discreta di Fourier (DFT)**, che restituisce tre vettori `v`, `R` e `phi` (i coefficienti di Fourier).
- Utilizzando i coefficienti di Fourier, rappresentiamo il disegno tramite una concatenazione di punti rotanti con velocità angolare `v`, raggio di rotazione `R` e fase `phi`.

Create una copia della tela p5.js (dopo aver salvato la precedente), di dimensioni 600x600 (almeno).

1. Salvate (in fondo al codice) le [[coordinate del disegno]] (reperibili al link) nelle variabili `drawingX` e `drawingY`, quindi rappresentate la figura. **Cosa si ottiene?**
2. Incollate nell'editor il seguente blocco di codice.

```javascript
/* Calcola la trasformata discreta di Fourier */
function dft(drawingX, drawingY) {
	const v = [];
	const R = [];
	const phi = [];
	
	const N = drawingX.length;
	
	for (let f = 0; f < N; f++) {
		let sum = { re: 0, im: 0 };
		
		for (let m = 0; m < N; m++) {
			const phi = -2 * Math.PI * (m / N) * f;
			const c = multiply(
				{ re: Math.cos(phi), im: Math.sin(phi) },
				{ re: drawingX[m], im: drawingY[m] }
			);
			sum = {
				re: sum.re + c.re / N,
				im: sum.im + c.im / N,
			};
		}
		
		if (f <= N /2 ) {
			v.push(f);
		} else {
			v.push(-(N - f));
		}
		R.push(Math.sqrt(sum.re ** 2 + sum.im ** 2));
		phi.push(Math.atan2(sum.im, sum.re));
	}
	
	return { v, R, phi };
}

/* Moltiplica due numeri complessi */
function multiply(x, y) {
  return {
    re: x.re * y.re - x.im * y.im,
    im: x.re * y.im + x.im * y.re
  }
}
```

{:start="3"}
3. Create i vettori vuoti `v`, `R` e `phi`. Quindi, in `setup()`, applicate la DFT alle coordinate del disegno e salvate il valore dei coefficienti di Fourier ottenuti (`{v, R, phi} = dft(drawingX, drawingY);`).
4. Visualizzate il polinomio trigonometrico definito da `v`, `R` e `phi` e, utilizzando lo slider precedentemente creato, fate variare il numero di coefficienti utilizzati.

| Avete smarrito il sentiero?                                                |
| -------------------------------------------------------------------------- |
| [Ecco un segnavia](https://editor.p5js.org/bradwave.mb/sketches/MhKowFNuU) |
