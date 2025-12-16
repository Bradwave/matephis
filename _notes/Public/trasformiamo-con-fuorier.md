---
title: Parte 3 — Trasformiamo con Fourier
feed: hide
tags:
  - attività
  - p5js
  - fourier
---
<link rel="stylesheet" href="{{ '/assets/css/syntax.css' | relative_url }}">

Il nostro obiettivo è rappresentare uno specifico disegno attraverso una concatenazione di punti rotanti, ovvero un **polinomio trigonometrico**. Matematicamente parlando, il disegno è descritto da una funzione del tipo

\\[f : t \in \mathbb{R} \longmapsto (x, y) \in \mathbb{R}^2\\]

Tutte le funzioni il cui disegno è chiuso e può essere realizzato a mano libera possono essere rappresentate da una **serie di Fourier**, ovvero un polinomio trigonometrico composto da un'infinità di punti rotanti:

\\[f(t) = \sum_{n = 0}^{+\infty} \underbrace{(R_n \cos (n t + \varphi_n), R_n \sin(n t + \varphi_n))}_{\text{punto rotante} \; (x_n(t), \, y_n(t))}\\]

(con abuso di notazione...) dove
- $n$ è la velocità angolare dei punti rotanti (assume solo valori discreti);
- $R_n$ è il raggio di rotazione dei punti;
- $\varphi_n$ è la fase (ovvero l'angolo di partenza).

$R_n$ e $\varphi_n$ sono calcolati tramite la **trasformata di Fourier**, che consente di estrarre le "frequenze" del disegno originale, ovvero le informazioni utili per ricostruire il disegno utilizzando dei punti rotanti.

Sul piano informatico, la procedura da seguire è la seguente:
- partiamo dalle coordinate `drawingX` e `drawingY` di una particolare figura;
- applichiamo la funzione `dft(drawingX, drawingY)`, ovvero la **trasformata discreta di Fourier (DFT)**, che tre vettori `n`, `r` e `phi` (insieme formano i cosiddetti **coefficienti di Fourier**).
- Utilizzando i coefficienti di Fourier, rappresentiamo il disegno tramite una concatenazione di punti rotanti con velocità angolare `n`, raggio di rotazione `r` e fase `phi`.

Partiamo da una nuova tela p5.js (dopo aver salvato la precedente), di dimensioni 600x600 almeno.

1. Salvate (in fondo al codice) le [[coordinate del disegno]] nelle variabili `drawingX` e `drawingY`, quindi rappresentate la figura.
2. Incollate nell'editor il seguente blocco di codice.

```javascript
/* Calcola la trasformata discreta di Fourier */
function dft(drawingX, drawingY) {
	const n = [];
	const r = [];
	const phi = []
	
	for(let f = 0; f < N; f++) {
		let sum = {re: 0, im: 0};
		
		for(let m = 0; m < N; m++) {
			const phi = (- 2 * Math.PI * (m / N) * f);
			const c = multiply(
				{re: Math.cos(phi), im: Math.sin(phi)},
				{re: drawingX[m], im: drawingY[m]}
			);
			sum = {
				re: sum.re + c.re / N,
				im: sum.im + c.im / N
			}
		}
		
		n.push(f);
		r.push(Math.sqrt(sum.re ** 2 + sum.im ** 2));
		phi.push(Math.atan2(sum.im, sum.re));
	}
	
	return {r, n, phi};
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
3. Create i vettori vuoti `n`, `r` e `phi`. Quindi, in `setup()`, applicate la DFT alle coordinate del disegno `({let n, r, phi} = dft(drawingX, drawingY));`.
4. Reintroducete il codice necessario per rappresentare i polinomi trigonometrici precedentemente creato.
   ***Nota:*** è importante che il valore di `T` venga incrementato ad ogni frame di `2 * Math.PI / N`, dove `N` è il numero di elementi di `n`, `r` e `phi`.
   ***Suggerimento:*** come centro di rotazione usa il punto di coordinate $(R_0 \cos(\varphi_0), R_0 \sin(\varphi_0))$; ricorda che l'asse $y$ in informatica è orientato verso il basso.

Si può controllare il numero di coefficienti utilizzati tramite uno slider.

{:start="5"}
5. Create uno slider che vari da 0.1 a 100.
6. Concatenate i punti rotanti solo è rispettata la condizione che segue. Qual è il suo significato?

```javascript
for (let i = 1; i < N; i++) {
	const maxSpeed = (slider.value() / 100) * N;
	if (n[i] < maxSpeed + 1 || n[i] > N - maxSpeed - 1) {
		// concatenazione dei punti
	}
}
```


| Hai smarrito il sentiero?                                                  |
| -------------------------------------------------------------------------- |
| [Ecco un segnavia](https://editor.p5js.org/bradwave.mb/sketches/MhKowFNuU) |
