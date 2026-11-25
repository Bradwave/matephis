---
title: Esercizi sulle trasformazioni dei grafici
feed: show
plot: true
tags:
  - esercizi
  - funzioni
---
Esercizi, quesiti ed esplorazioni sulle trasformazioni dei grafici: traslazioni, dilatazioni, riflessioni e la forma $a \cdot f\big(b(x - h)\big) + k$. La teoria è nella pagina sulle [[trasformazioni dei grafici]].

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

**Il respiro di riferimento.** In diversi esercizi $f(x)$ rappresenta il volume d'aria (in litri) *inspirato a partire dalla fine dell'ultima espirazione*, all'istante $x$ (in secondi), con $x \geq 0$. Ogni respiro dura $4$ secondi: $1{,}5$ secondi di inspirazione, $2$ di espirazione, $0{,}5$ di pausa. Il massimo, $0{,}5$ litri, si raggiunge all'istante $1{,}5$; in un minuto si fanno $15$ respiri.

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-1, 13],
  "ylim": [-0.2, 0.8],
  "xStep": 1,
  "yStep": 0.25,
  "axisLabels": ["x", "V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "data": [
    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "red1" },
    { "points": [[1.5, 0.5]], "radius": 4, "fillColor": "red1" }
  ]
}
```

## Esercizi

1. **[E]** **Dalle parole alla formula.** Per ciascun respiro, scrivi la formula usando il respiro di riferimento $f$.
	1. Il volume d'aria nei polmoni, sapendo che a fine espirazione restano $2$ litri.
	2. Il respiro di un compagno che respira come te, ma inizia $3$ secondi dopo.
	3. Un respiro tre volte più profondo, con lo stesso ritmo.
	4. Un respiro con la stessa profondità, ma con $20$ respiri al minuto invece di $15$.
	5. Un respiro con la stessa profondità, due volte più veloce, che inizia $1$ secondo dopo.
	[sol: 1. $f(x) + 2$; 2. $f(x - 3)$; 3. $3 f(x)$; 4. $f\left(\frac 4 3 x\right)$, perché la frequenza si moltiplica per $b = \frac{20}{15}$, e un respiro dura $3$ secondi; 5. $f\big(2(x - 1)\big)$.]
2. **[E]** **Dalla formula alle parole.** Descrivi a parole ciascun respiro e trova le coordinate del primo massimo, la durata di un respiro e il numero di respiri al minuto.
	1. $\frac 1 2 f(x) + 3$
	2. $f\left(\frac x 2\right)$
	3. $2 f\big(3(x - 2)\big) + 2{,}5$
	4. $f(2x - 4)$
	[sol: 1. respiro superficiale (metà aria), con $3$ litri sempre nei polmoni: massimo in $(1{,}5;\ 3{,}25)$, $4$ secondi, $15$ respiri al minuto; 2. respiro lento: massimo in $(3;\ 0{,}5)$, $8$ secondi, $7{,}5$ respiri al minuto; 3. respiro doppio, tre volte più veloce, che inizia dopo $2$ secondi, con $2{,}5$ litri sempre nei polmoni: massimo in $(2{,}5;\ 3{,}5)$, $\frac 4 3$ secondi, $45$ respiri al minuto; 4. $f(2x - 4) = f\big(2(x - 2)\big)$: respiro due volte più veloce che inizia dopo $2$ secondi (non $4$): massimo in $(2{,}75;\ 0{,}5)$, $2$ secondi, $30$ respiri al minuto.]
3. **[EE]** **Riconoscere il respiro.** In figura è rappresentato, tratteggiato, il respiro di riferimento $f$ e, in rosso, il volume d'aria nei polmoni di un'altra persona. Scrivi il grafico rosso nella forma $a \cdot f\big(b(x - h)\big) + k$, spiegando come hai ricavato ciascun parametro.
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-1, 14],
	  "ylim": [-0.5, 3.5],
	  "xStep": 1,
	  "yStep": 0.5,
	  "axisLabels": ["x", "V"],
	  "axisUnitMeasures": ["s", "L"],
	  "axisLabelStyle": "italic",
	  "data": [
	    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "black1", "dash": "4,4" },
	    { "fn": "1.5*(mod(0.5*(x - 1), 4) < 1.5 ? 0.25*(1 - cos(pi*mod(0.5*(x - 1), 4)/1.5)) : (mod(0.5*(x - 1), 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(0.5*(x - 1), 4) - 1.5)/2)) : 0)) + 2", "domain": [1, 13], "color": "red1" },
	    { "points": [[1, 2], [4, 2.75]], "radius": 4, "fillColor": "red1" }
	  ]
	}
	```
	[sol: $1{,}5 \cdot f\left(\frac 1 2 (x - 1)\right) + 2$. Il respiro inizia all'istante $1$ ($h = 1$) con $2$ litri nei polmoni ($k = 2$); un respiro dura $8$ secondi invece di $4$ ($b = \frac 1 2$); il massimo è $2{,}75 - 2 = 0{,}75$ litri sopra il livello di riposo invece di $0{,}5$ ($a = 1{,}5$).]
4. **[EE]** Il punto $P = (2, 5)$ appartiene al grafico di una funzione $f$. Trova il punto corrispondente sul grafico di ciascuna delle seguenti funzioni.
	1. $f(x) + 3$ e $f(x + 2)$
	2. $3 f(x)$ e $f(2x)$
	3. $-f(x)$ e $f(-x)$
	4. $2 f(x - 1) - 3$
	5. $f(2x - 4)$ e $f\big(2(x - 4)\big)$
	[sol: 1. $(2, 8)$ e $(0, 5)$; 2. $(2, 15)$ e $(1, 5)$; 3. $(2, -5)$ e $(-2, 5)$; 4. $(3, 7)$; 5. $(3, 5)$ e $(5, 5)$.]
5. **[EE]** In figura è rappresentato il grafico della funzione $f$, definita nell'intervallo $[-2, 4]$.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-4.9, 4.9],
	  "ylim": [-1.9, 2.9],
	  "data": [
	    { "type": "interpolation", "points": [[-2, 0], [0, 2], [2, 2], [4, -1]], "smoothness": 0, "color": "red1" },
	    { "points": [[-2, 0], [0, 2], [2, 2], [4, -1]], "radius": 4, "fillColor": "red1" }
	  ]
	}
	```
	Traccia i grafici delle seguenti funzioni, indicandone dominio e immagine.
	1. $2 f(x) - 1$
	2. $f\left(\frac x 2\right)$
	3. $f(-x) + 1$
	4. $-f\big(2(x - 1)\big)$
	5. $f(2x + 2)$
	[sol: 1. dominio $[-2, 4]$, immagine $[-3, 3]$; 2. dominio $[-4, 8]$, immagine $[-1, 2]$; 3. dominio $[-4, 2]$, immagine $[0, 3]$; 4. il punto $(x_0, y_0)$ va in $\left(\frac{x_0}{2} + 1, -y_0\right)$: dominio $[0, 3]$, immagine $[-2, 1]$; 5. $f(2x + 2) = f\big(2(x + 1)\big)$, il punto $(x_0, y_0)$ va in $\left(\frac{x_0}{2} - 1, y_0\right)$: dominio $[-2, 1]$, immagine $[-1, 2]$.]
6. **[F]** **In ordine.** Descrivi, nell'ordine corretto, le trasformazioni che portano dal grafico di $f$ a quello di $g(x) = -2 f(3x + 6) + 1$, e trova il punto in cui va il punto $(x_0, y_0)$ del grafico di $f$.
	[sol: $g(x) = -2 f\big(3(x + 2)\big) + 1$: dilatazione orizzontale di fattore $\frac 1 3$ rispetto all'asse $y$, traslazione di $2$ verso sinistra, dilatazione verticale di fattore $2$ rispetto all'asse $x$ seguita dalla simmetria rispetto all'asse $x$, traslazione di $1$ verso l'alto. Il punto va in $\left(\frac{x_0}{3} - 2,\; -2 y_0 + 1\right)$.]
7. **[F]** **Cambiare l'asse fisso.** Sia $p(x) = (x - 1)(x - 3) = (x - 2)^2 - 1$.
	1. Scrivi la formula della funzione il cui grafico si ottiene da quello di $p$ con una dilatazione verticale di fattore $2$ che lascia ferma la retta $y = -1$. Dove vanno gli zeri?
	2. Scrivi la formula della funzione il cui grafico si ottiene da quello di $p$ con una dilatazione orizzontale di fattore $\frac 1 2$ che lascia ferma la retta $x = 2$. Dove vanno gli zeri?
	3. Le due trasformazioni danno lo stesso grafico? Quale dilatazione verticale, sempre rispetto alla retta $y = -1$, dà lo stesso grafico della seconda?
	[sol: 1. $2\big(p(x) + 1\big) - 1 = 2(x - 2)^2 - 1$, zeri $2 \pm \frac{\sqrt 2}{2}$; 2. $p\big(2(x - 2) + 2\big) = 4(x - 2)^2 - 1$, zeri $2 \pm \frac 1 2$; 3. no; serve una dilatazione verticale di fattore $4$: per questa parabola, comprimere in orizzontale di un fattore $\frac 1 2$ equivale a dilatare in verticale di un fattore $4$.]
8. **[PD]** **Onde.** Considera la funzione $g(x) = 3 \sin\left(2x - \frac{\pi}{3}\right) + 1$.
	1. Scrivila nella forma $a \cdot \sin\big(b(x - h)\big) + k$ e descrivi come si ottiene il suo grafico da quello di $\sin x$.
	2. Trova il periodo, il valore massimo e il valore minimo di $g$.
	3. Trova il primo punto di massimo con $x > 0$.
	[sol: 1. $3 \sin\left(2\left(x - \frac{\pi}{6}\right)\right) + 1$: compressione orizzontale di fattore $\frac 1 2$, traslazione di $\frac{\pi}{6}$ verso destra, dilatazione verticale di fattore $3$, traslazione di $1$ verso l'alto; 2. periodo $\pi$, massimo $4$, minimo $-2$; 3. il massimo di $\sin x$ in $\frac{\pi}{2}$ va in $\frac{\pi}{4} + \frac{\pi}{6} = \frac{5\pi}{12}$: il punto è $\left(\frac{5\pi}{12}, 4\right)$.]

## Quesiti

1. **[F]** Sara dice: "Il grafico di $f(2x)$ è il grafico di $f$ più stretto, quindi per una parabola tutti i punti si avvicinano al vertice". Ha ragione? Rispondi con un esempio.
	[sol: no: la dilatazione orizzontale avvicina i punti all'asse $y$, non al vertice. Ad esempio, con $p(x) = (x - 1)(x - 3)$ il vertice $(2, -1)$ va in $(1, -1)$, gli zeri vanno in $\frac 1 2$ e $\frac 3 2$, e resta ferma l'intersezione $(0, 3)$ con l'asse $y$. Il vertice rimane fermo solo se si trova sull'asse $y$.]
2. **[F]** Le funzioni $2 f(x) + 4$ e $2\big(f(x) + 4\big)$ hanno lo stesso grafico? Scrivi $3 f(x) - 6$ nella forma $a\big(f(x) + k\big)$ e $2\big(f(x) + 4\big)$ nella forma $a \cdot f(x) + k$.
	[sol: no: $2\big(f(x) + 4\big) = 2 f(x) + 8$, la dilatazione "allunga" anche la traslazione. $3 f(x) - 6 = 3\big(f(x) - 2\big)$.]
3. **[F+]** **Pendenza e flusso.** La pendenza del grafico del respiro è il flusso d'aria, in litri al secondo.
	1. Come cambia la pendenza tra due punti del grafico passando da $f(x)$ a $f(x) + k$? E a $f(x - h)$, $a \cdot f(x)$, $f(bx)$?
	2. Un compagno respira due volte più a fondo e due volte più in fretta di te. Di quanto cambia il flusso massimo di aria durante l'inspirazione?
	3. Se $f$ è periodica di periodo $T$, qual è il periodo di $f(bx)$, con $b > 0$? E quello di $a \cdot f(x - h) + k$?
	[sol: 1. le traslazioni non cambiano la pendenza; con $a \cdot f(x)$ le differenze verticali si moltiplicano per $a$, quindi la pendenza si moltiplica per $a$; con $f(bx)$ le differenze orizzontali si dividono per $b$, quindi la pendenza si moltiplica per $b$. 2. il grafico è $2 f(2x)$: la pendenza si moltiplica per $2 \cdot 2 = 4$, il flusso massimo diventa $4$ volte più grande. 3. $\frac{T}{b}$; il periodo resta $T$.]

## Esplorazioni

Prima di muovere gli slider, segui sempre tre passi: **prevedi** (scrivi che cosa ti aspetti, senza toccare lo slider), **verifica** (muovi lo slider e confronta con la tua previsione), **giustifica** (spiega il risultato, soprattutto quando la previsione era sbagliata).

1. **[EE/F] Respira come me.** Il grafico azzurro è il respiro di un compagno; quello rosso è $a \cdot f\big(b(x - h)\big) + k$, dove $f$ è il respiro di riferimento.
	1. **Prevedi.** Leggendo il grafico azzurro, scrivi i valori di $a$, $b$, $h$ e $k$.
	2. **Verifica** con gli slider: il grafico rosso deve sovrapporsi a quello azzurro.
	3. **Giustifica.** Quale parametro è stato più difficile da leggere? Perché?
	4. Prova a respirare come il compagno: è più facile o più difficile del respiro di riferimento?
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [-1, 14],
	  "ylim": [-0.5, 3.5],
	  "xStep": 1,
	  "yStep": 0.5,
	  "axisLabels": ["x", "V"],
	  "axisUnitMeasures": ["s", "L"],
	  "axisLabelStyle": "italic",
	  "sliderBorder": true,
	  "params": {
	    "a": { "min": 0.25, "max": 3, "step": 0.25, "val": 1, "label": "$a$" },
	    "b": { "min": 0.25, "max": 3, "step": 0.25, "val": 1, "label": "$b$" },
	    "h": { "min": -2, "max": 4, "step": 0.5, "val": 0, "label": "$h$" },
	    "k": { "min": 0, "max": 3, "step": 0.25, "val": 0, "label": "$k$" }
	  },
	  "data": [
	    { "fn": "2*(mod(0.75*(x - 2), 4) < 1.5 ? 0.25*(1 - cos(pi*mod(0.75*(x - 2), 4)/1.5)) : (mod(0.75*(x - 2), 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(0.75*(x - 2), 4) - 1.5)/2)) : 0)) + 1", "domain": [2, 14], "color": "summer3", "width": 5, "opacity": 0.6 },
	    { "fn": "a*(mod(b*(x - h), 4) < 1.5 ? 0.25*(1 - cos(pi*mod(b*(x - h), 4)/1.5)) : (mod(b*(x - h), 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(b*(x - h), 4) - 1.5)/2)) : 0)) + k", "domain": ["h", 14], "color": "red1" }
	  ]
	}
	```
	[sol: $a = 2$, $b = 0{,}75$, $h = 2$, $k = 1$. Il respiro inizia all'istante $2$ con $1$ litro nei polmoni; il massimo è $1$ litro sopra il livello di riposo; un respiro dura $\frac{4}{0{,}75} = \frac{16}{3} \approx 5{,}3$ secondi.]
