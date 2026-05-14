---
title: Esercizi sulle onde e sulle funzioni circolari
feed: show
plot: true
tags:
  - funzioni
  - onde
  - funzioni-circolari
---
Esercizi, quesiti, quiz e problemi sulle onde e sulle funzioni circolari.

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

## Esercizi

1. **[T]** Determina il periodo di un infrasuono con frequenza $20 \, \text{Hz}$.
2. **[E]** Determina la lunghezza d'onda di un'onda radio con frequenza $200 \, \text{MHz}$ che si propaga nel vuoto (tutte le onde elettromagnetiche si propagano alla velocità della luce).
3. **[T]** Determina il periodo di un'onda sismica con lunghezza d'onda di $3 \, \text{km}$ e velocità di propagazione di $6 \, \text{km/s}$.
4. **[T]** Può esistere un'onda con velocità di propagazione $v = 15 \, \text{m/s}$, lunghezza d'onda $20 \, \text{cm}$ e periodo $T = 6 \, \text{s}$?
5. **[E]** Un'onda ha periodo $T = 3 \, \text{ms}$ e lunghezza d'onda di $3 \, \text{cm}$. Può trattarsi di un'onda sonora.
6. **[EE]** Disegna il grafico delle seguenti funzioni d'onda/funzioni circolari. Per ciascuna determina l'ampiezza e la lunghezza d'onda.
	1. $f(x) = \sin x$
	2. $f(x) = \cos x$
	3. $f(x) = \sin x + 1$
	4. $f(x) = -\sin x$
	5. $f(x) = \cos(-x)$
	6. $f(x) = 2\cos x$
	7. $f(x) = \sin(2x)$
	8. $f(x) = \frac 1 2 \sin(2\pi x)$
	9. $f(x) = \sin(4\pi (x + 1))$
	10. $f(x) = 0.3\cos(3\pi x) + 0.1$
7. **[EE]** Disegna il grafico delle seguenti funzioni d'onda/funzioni circolari. Per ciascuna determina l'ampiezza, il periodo e la frequenza.
	1. $f(t) = \sin (2\pi t)$
	2. $f(t) = \sin(4\pi t) - 4$
	3. $f(t) = 3\sin(\pi t)$
	4. $f(t) = -\cos(100\pi t)$
	5. $f(t) = \sin(-2\pi t)$
8. **[EE/F]** Per ciascuna delle seguenti funzioni d'onda determina ampiezza, lunghezza d'onda, periodo, frequenza e velocità di propagazione.
	1. $f(x, t) = 3\sin\left(2\pi\left(\frac{x - 10t}{3}\right)\right)$
	2. $f(x, t) = \sin\left(2\pi\left(\frac{x}{3} - \frac{t}{0.1}\right)\right) + 0.5$
	3. $f(x, t) = \cos\left(0.1 \pi x \right)$
9. **[E]** Determina ampiezza e lunghezza d'onda dell'onda rappresentata nel grafico.
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-6.2,6.2],
  "ylim": [-1.45,1.45],
  "axisLabels": ["x",""],
  "data": [
    { "fn": "sin(0.5*pi*x)" }
  ]
}
```
10. **[E]** Determina ampiezza, frequenza e periodo dell'onda rappresentata nel grafico.
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-0.2,2.2],
  "ylim": [-1.45,1.45],
  "axisLabels": ["t",""],
  "data": [
    { "fn": "0.5sin(6*pi*x)" }
  ]
}
```
10. **[EE]** Scrivi la funzione d'onda $\Delta p(t)$ dell'onda rappresentata nel grafico.
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-0.2,3.8],
  "ylim": [-1.45,1.45],
  "axisLabels": ["t","∆p"],
  "data": [
    { "fn": "0.75*sin(4*pi*x)" }
  ]
}
```
11. **[EE/F]** Scrivi la funzione d'onda $\Delta p(x, t)$ dell'onda rappresentata nel grafico, sapendo che si propaga alla velocità $v = 100 \, \text{m/s}$.
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-0.2,3.8],
  "ylim": [-1.45,1.45],
  "axisLabels": ["t","∆p"],
  "data": [
    { "fn": "0.75*sin(4*pi*x)" }
  ]
}
```
12. **[F-]** Scrivi la funzione d'onda $\Delta p(x, t)$ dell'onda rappresentata nel grafico, sapendo che la sua lunghezza d'onda misura $5 \, \text{cm}$.
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-0.2,3.8],
  "ylim": [-1.45,1.45],
  "axisLabels": ["t","∆p"],
  "data": [
    { "fn": "1.2*cos(2*pi*x)" }
  ]
}
```
13. **[EE]** Qual è la lunghezza d'onda del diapason (La4, frequenza $440 \, \text{Hz}$) se il suono si propaga nell'aria (velocità del suono $v \approx 340 \, \text{m/s}$)? E se si propaga nell'acqua ($v \approx 1500 \, \text{m/s}$)?
14. **[F-]** Scrivi la funzione d'onda $\Delta p(t)$ che rappresenta un La4 avente ampiezza massima di $0.2 \, \text{Pa}$. Assumi che per $t=0$ la perturbazione sia nulla e stia aumentando.
15. **[F+]** Calcola la frequenza del suono fondamentale prodotto da una corda di chitarra lunga $65 \, \text{cm}$ in cui l'onda si propaga a $400 \, \text{m/s}$.
16. **[F+]** Calcola la lunghezza minima di un tubo chiuso da un lato (e aperto dall'altro) necessario per produrre una nota con frequenza fondamentale di $100 \, \text{Hz}$ (assumi $v = 340 \, \text{m/s}$).
17. **[F]** Un tubo aperto ad entrambe le estremità è lungo $1.7 \, \text{m}$. Qual è la frequenza fondamentale che produce? E la frequenza della prima armonica successiva?
18. **[EE/F]** Data la funzione d'onda $\Delta p(x) = 2 \sin(\pi x - \frac{\pi}{2}) + 1$, descrivi a parole quali trasformazioni (dilatazioni, traslazioni) devi applicare al grafico elementare di $f(x) = \sin(x)$ per ottenerla.

## Quesiti

1. **[E]** Nel grafico di un'onda sonora, quale grandezza fisica può essere rappresentata sull'asse delle ordinate?
2. **[EE]** Descrivi il significato fisico di periodo, frequenza, lunghezza d'onda e velocità di propagazione.
3. **[EE]** Cos'è il suono? Cosa sta "oscillando"?
4. **[EE/F]** Considera la seguente funzione d'onda sonora:
   $$\Delta p(x, t) = A\sin\left(2\pi\left(\dfrac{x - vt}{\lambda}\right)\right)$$
   Descrivi il significato di tutti i simboli presenti nell'equazione. Spiega se e come questi influiscono sulla nostra percezione del suono.
5. **[F]** Spiega la differenza tra la generazione di un'onda stazionaria su una corda fissata agli estremi e in un tubo chiuso a un'estremità e aperto all'altra. Come cambiano le configurazioni dei nodi?
6. **[F]** Che cos'è il fenomeno dei battimenti? Descrivilo fisicamente e descrivi come può essere prodotto.
7. **[PD]** Osservando lo spettro in frequenza $|\hat p|$ di un segnale sonoro, come fai a distinguere un suono "puro" (come quello di un diapason) da un suono complesso (come una nota suonata da un pianoforte o una vocale pronunciata)?
8. **[PD]** Se applichi la trasformata di Fourier al suono di un accordo suonato con la chitarra, cosa ti aspetti di osservare nel grafico dello spettro?
9. **[EE/F]** Spiega qual è la differenza tra tracciare il grafico dell'onda in funzione della posizione (fissando il tempo) $\Delta p(x)$ e in funzione del tempo (fissando la posizione) $\Delta p(t)$. Che cosa rappresentano fisicamente i due grafici?

## Quiz

1. **[EE]** Associa ogni funzione al suo grafico.
	- **(i)** $f(x) = 2\sin(x)$
	- **(ii)** $f(x) = 2\cos(x)$
	- **(iii)** $f(x) = -\sin(x)$
	- **(iv)** $f(x) = \cos(-x)$
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-6.2,6.2],
  "ylim": [-2.45,2.45],
  "xNumberStep": "pi",
  "legend": true,
  "data": [
    { "fn": "2*sin(x)", "color": "red1", "label": "A" },
    { "fn": "-1*sin(x)", "color": "black1", "label": "B" },
    { "fn": "cos(-x)", "color": "red1", "dash": [4,4], "label": "C" },
    { "fn": "2*cos(x)", "color": "black1", "dash": [4,4], "label": "D" }
  ]
}
```
2. **[EE]** Associa ogni funzione al suo grafico.
	- **(i)** $f(x) = \sin(x) + 1$
	- **(ii)** $f(x) = \cos(x + 1)$
	- **(iii)** $f(x) = \sin(x - 1)$
	- **(iv)** $f(x) = \cos(x) - 1$
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-6.2,6.2],
  "ylim": [-2.45,2.45],
  "xNumberStep": "1",
  "yNumberStep": "1",
  "legend": true,
  "data": [
    { "fn": "cos(x)-1", "color": "red1", "label": "A" },
    { "fn": "sin(x-1)", "color": "black1", "label": "B" },
    { "fn": "sin(x)+1", "color": "red1", "dash": [4,4], "label": "C" },
    { "fn": "cos(x+1)", "color": "black1", "dash": [4,4], "label": "D" }
  ]
}
```
3. **[E]** Qual è la lunghezza dell'onda rappresentata nel grafico?
	- **(a)** 5
	- **(b)** 10
	- **(c)** 15
	- **(d)** Non è possibile determinarla senza conoscere la velocità di propagazione.
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-0.2,17.8],
  "ylim": [-0.8,0.8],
  "axisLabels": ["x",""],
  "data": [
    { "fn": "0.5*sin(0.2*pi*x)" }
  ]
}
```
4. **[E]** Quale dei seguenti grafici descrive qualitativamente lo spettro $|\hat f(f)|$ dell'onda $\Delta p(t) = 3\sin(2\pi \cdot 440 \cdot t)$?
	- **(a)** Un grafico con infiniti picchi a tutte le frequenze multiple di 440 Hz.
	- **(b)** Un grafico piatto (nessun picco).
	- **(c)** Un grafico con un singolo picco in corrispondenza della frequenza di 440 Hz.
	- **(d)** Un grafico con due picchi, a 440 Hz e 880 Hz.
5. **[E]** Il La4 ha una frequenza di $440 \, \text{Hz}$. Sapendo che l'intervallo di un'ottava corrisponde a un raddoppio della frequenza, il La5 (un'ottava sopra) ha una frequenza di:
	- **(a)** $880 \, \text{Hz}$
	- **(b)** $220 \, \text{Hz}$
	- **(c)** $441 \, \text{Hz}$
	- **(d)** $450 \, \text{Hz}$
6. **[EE]** Se sovrapponi due suoni aventi frequenze $f_1 = 300 \, \text{Hz}$ e $f_2 = 305 \, \text{Hz}$, percepirai:
	- **(a)** Un suono continuo di $605 \, \text{Hz}$.
	- **(b)** Un battimento con una frequenza di battimento di $5 \, \text{Hz}$ (l'intensità del suono pulsa 5 volte al secondo).
	- **(c)** Un suono di $302.5 \, \text{Hz}$ costante.
	- **(d)** Due suoni nettamente distinti che non interagiscono tra loro.
7. **[EE]** Una funzione d'onda produce uno spettro con due soli picchi, uno a $100 \, \text{Hz}$ e uno a $150 \, \text{Hz}$. Quale tra le seguenti potrebbe esserne l'espressione?
	- **(a)** $\Delta p(t) = \sin(2\pi \cdot 100 \cdot t) \cdot \sin(2\pi \cdot 150 \cdot t)$
	- **(b)** $\Delta p(t) = \sin(2\pi \cdot 100 \cdot t) + \sin(2\pi \cdot 150 \cdot t)$
	- **(c)** $\Delta p(t) = \sin(2\pi \cdot 250 \cdot t)$
	- **(d)** $\Delta p(t) = 100 \sin(2\pi \cdot 150 \cdot t)$
8. **[F-]** Quale trasformazione devi applicare al grafico di $f(x) = \sin(x)$ per dimezzare il periodo (e quindi raddoppiare la frequenza) dell'onda?
	- **(a)** Moltiplicare l'intera funzione per 2 (es. $2\sin(x)$).
	- **(b)** Dividere l'intera funzione per 2 (es. $\frac{1}{2}\sin(x)$).
	- **(c)** Moltiplicare l'argomento per 2 (es. $\sin(2x)$).
	- **(d)** Dividere l'argomento per 2 (es. $\sin(\frac{x}{2})$).
9. **[F]** Se dimezzi la lunghezza vibrante di una corda di chitarra (premendo il dito al 12° tasto), la lunghezza d'onda dell'armonica fondamentale:
	- **(a)** Raddoppia.
	- **(b)** Dimezza.
	- **(c)** Rimane invariata.
	- **(d)** Diventa un quarto.
10. **[EE]** Quale tra queste funzioni d'onda descrive una perturbazione che oscilla costantemente tra i valori $1$ e $5$?
	- **(a)** $\Delta p(t) = 4\sin(t) + 1$
	- **(b)** $\Delta p(t) = 2\sin(t) + 3$
	- **(c)** $\Delta p(t) = 3\sin(t) + 2$
	- **(d)** $\Delta p(t) = 5\sin(t)$
11. **[EE]** Associa allo spettro $|\hat f(f)|$ la sua funzione d'onda. Lo spettro presenta tre picchi di uguale altezza a $200 \, \text{Hz}$, $400 \, \text{Hz}$ e $600 \, \text{Hz}$.
	- **(a)** $\Delta p(t) = \sin(2\pi \cdot 200 \cdot t) + 2\sin(2\pi \cdot 400 \cdot t) + 3\sin(2\pi \cdot 600 \cdot t)$
	- **(b)** $\Delta p(t) = \sin(2\pi \cdot 200 \cdot t) + \sin(2\pi \cdot 400 \cdot t) + \sin(2\pi \cdot 600 \cdot t)$
	- **(c)** $\Delta p(t) = \sin(2\pi \cdot 1200 \cdot t)$
	- **(d)** $\Delta p(t) = 3\sin(2\pi \cdot 400 \cdot t)$

12. **[E]** Quale delle seguenti funzioni corrisponde al grafico in figura?
	- **(a)** $f(x) = \sin(2x)$
	- **(b)** $f(x) = 2\sin(x)$
	- **(c)** $f(x) = \frac{1}{2}\sin(x)$
	- **(d)** $f(x) = \sin(x) + 2$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-6.2, 6.2],
  "ylim": [-2.5, 2.5],
  "xNumberStep": "pi",
  "data": [
    { "fn": "2*sin(x)" }
  ]
}
```
13. **[E]** Osserva il grafico della funzione d'onda spaziale $\Delta p(x)$. Qual è la sua lunghezza d'onda $\lambda$?
	- **(a)** $2 \, \text{m}$
	- **(b)** $4 \, \text{m}$
	- **(c)** $8 \, \text{m}$
	- **(d)** $10 \, \text{m}$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-1, 9],
  "ylim": [-1.5, 1.5],
  "axisLabels": ["x (m)", "∆p"],
  "data": [
    { "fn": "sin(0.5*pi*x)" }
  ]
}
```
14. **[E]** Osserva il grafico della funzione d'onda nel tempo $\Delta p(t)$. Qual è il suo periodo $T$?
	- **(a)** $0.5 \, \text{s}$
	- **(b)** $1.0 \, \text{s}$
	- **(c)** $1.5 \, \text{s}$
	- **(d)** $2.0 \, \text{s}$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-0.2, 2.2],
  "ylim": [-1.5, 1.5],
  "axisLabels": ["t (s)", "∆p"],
  "data": [
    { "fn": "cos(2*pi*x)" }
  ]
}
```
15. **[E]** Qual è l'ampiezza dell'onda rappresentata nel grafico?
	- **(a)** $1.5$
	- **(b)** $3.0$
	- **(c)** $6.0$
	- **(d)** $0.5$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-3.14, 3.14],
  "ylim": [-4.5, 4.5],
  "data": [
    { "fn": "3*sin(2*x)" }
  ]
}
```
16. **[EE]** Quale funzione ha generato il grafico seguente, sapendo che rappresenta una traslazione verticale?
	- **(a)** $f(x) = \sin(x) + 2$
	- **(b)** $f(x) = \sin(x + 2)$
	- **(c)** $f(x) = 2\sin(x)$
	- **(d)** $f(x) = \sin(x) - 2$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-6.2, 6.2],
  "ylim": [-0.5, 3.5],
  "xNumberStep": "pi",
  "data": [
    { "fn": "sin(x) + 2" }
  ]
}
```
17. **[EE]** Il grafico seguente rappresenta lo spettro delle frequenze $|\hat f(f)|$ di un suono. I punti indicano i picchi dello spettro. Quale funzione d'onda $\Delta p(t)$ corrisponde a questo spettro?
	- **(a)** $\Delta p(t) = 2\sin(2\pi \cdot 100 \cdot t)$
	- **(b)** $\Delta p(t) = \sin(2\pi \cdot 100 \cdot t) + 2$
	- **(c)** $\Delta p(t) = 100\sin(2\pi \cdot 2 \cdot t)$
	- **(d)** $\Delta p(t) = \sin(2\pi \cdot 200 \cdot t)$
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [0, 200],
  "ylim": [0, 3],
  "axisLabels": ["f (Hz)", "|f^|"],
  "data": [
    { "points": [[100, 2]], "radius": 6, "fillColor": "red1" },
    { "points": [[100, 0], [100, 2]], "type": "interpolation", "smoothness": 0, "color": "red1", "dash": "4,4" }
  ]
}
```
18. **[EE]** Il seguente grafico mostra una perturbazione nel tempo. Quale fenomeno fisico vi si può riconoscere?
	- **(a)** Un'onda stazionaria.
	- **(b)** Un battimento.
	- **(c)** L'effetto Doppler.
	- **(d)** Un suono puro (singola frequenza).
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [0, 10],
  "ylim": [-2.5, 2.5],
  "axisLabels": ["t", "∆p"],
  "data": [
    { "fn": "2 * sin(10*x) * cos(0.5*x)" },
    { "fn": "2 * cos(0.5*x)", "color": "red1", "dash": "4,4" },
    { "fn": "-2 * cos(0.5*x)", "color": "red1", "dash": "4,4" }
  ]
}
```
19. **[EE]** Considera lo spettro in figura, che presenta due picchi. Quale tra le seguenti funzioni d'onda lo ha generato?
	- **(a)** $\Delta p(t) = 3\sin(2\pi \cdot 10 \cdot t) + 1.5\sin(2\pi \cdot 30 \cdot t)$
	- **(b)** $\Delta p(t) = 1.5\sin(2\pi \cdot 10 \cdot t) + 3\sin(2\pi \cdot 30 \cdot t)$
	- **(c)** $\Delta p(t) = 10\sin(2\pi \cdot 3 \cdot t) + 30\sin(2\pi \cdot 1.5 \cdot t)$
	- **(d)** $\Delta p(t) = 3\sin(2\pi \cdot 10 \cdot t) \cdot 1.5\sin(2\pi \cdot 30 \cdot t)$
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [0, 40],
  "ylim": [0, 4],
  "axisLabels": ["f (Hz)", "|f^|"],
  "data": [
    { "points": [[10, 3], [30, 1.5]], "radius": 5, "fillColor": "red1" },
    { "points": [[10, 0], [10, 3]], "type": "interpolation", "smoothness": 0, "color": "red1", "dash": "4,4" },
    { "points": [[30, 0], [30, 1.5]], "type": "interpolation", "smoothness": 0, "color": "red1", "dash": "4,4" }
  ]
}
```
20. **[EE]** Trova lunghezza d'onda e ampiezza dal grafico spaziale in figura.
	- **(a)** $\lambda = 6 \, \text{m}$, $A = 1.5$
	- **(b)** $\lambda = 3 \, \text{m}$, $A = 3$
	- **(c)** $\lambda = 6 \, \text{m}$, $A = 3$
	- **(d)** $\lambda = 1.5 \, \text{m}$, $A = 6$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [0, 12],
  "ylim": [-2, 2],
  "axisLabels": ["x (m)", "∆p"],
  "data": [
    { "fn": "1.5 * sin(2*pi/6 * x)" }
  ]
}
```
21. **[F]** Quale funzione corrisponde al grafico seguente? Suggerimento: osserva la traslazione orizzontale (fase).
	- **(a)** $f(x) = \sin(x)$
	- **(b)** $f(x) = \cos(x)$
	- **(c)** $f(x) = -\cos(x)$ oppure $\sin(x - \pi/2)$
	- **(d)** $f(x) = -\sin(x)$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-3.14, 6.28],
  "ylim": [-1.5, 1.5],
  "xNumberStep": "pi",
  "data": [
    { "fn": "-cos(x)" }
  ]
}
```
22. **[F]** Un'onda viaggia a $10 \, \text{m/s}$. Dal grafico spaziale qui sotto deduci la sua lunghezza d'onda, e calcola di conseguenza la sua frequenza.
	- **(a)** $\lambda = 2 \, \text{m}$, $f = 5 \, \text{Hz}$
	- **(b)** $\lambda = 4 \, \text{m}$, $f = 2.5 \, \text{Hz}$
	- **(c)** $\lambda = 2 \, \text{m}$, $f = 20 \, \text{Hz}$
	- **(d)** $\lambda = 4 \, \text{m}$, $f = 40 \, \text{Hz}$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [0, 8],
  "ylim": [-1.5, 1.5],
  "axisLabels": ["x (m)", "∆p"],
  "data": [
    { "fn": "sin(pi * x)" }
  ]
}
```
23. **[EE]** Quale tra i seguenti grafici (A, B, C o D) rappresenta l'onda con la **frequenza maggiore**?
	- **(a)** Grafico A (rosso)
	- **(b)** Grafico B (nero, tratteggiato)
	- **(c)** Grafico C (blu)
	- **(d)** Grafico D (arancione, tratteggiato)
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [0, 4],
  "ylim": [-2.5, 2.5],
  "axisLabels": ["t", "∆p"],
  "legend": true,
  "data": [
    { "fn": "sin(pi * x)", "color": "red1", "label": "A" },
    { "fn": "sin(2*pi * x)", "color": "black1", "dash": "4,4", "label": "B" },
    { "fn": "sin(4*pi * x)", "color": "blue", "label": "C" },
    { "fn": "sin(0.5*pi * x)", "color": "orange", "dash": "4,4", "label": "D" }
  ]
}
```
24. **[F]** Il grafico mostra la forma spaziale di un'onda stazionaria su una corda lunga $L = 10 \, \text{m}$ (fissata agli estremi a $x=0$ e $x=10$). Qual è la lunghezza d'onda $\lambda$ dell'onda che l'ha generata?
	- **(a)** $10 \, \text{m}$
	- **(b)** $5 \, \text{m}$
	- **(c)** $20 \, \text{m}$
	- **(d)** $2.5 \, \text{m}$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [0, 10],
  "ylim": [-1.5, 1.5],
  "axisLabels": ["x (m)", "∆p"],
  "data": [
    { "fn": "sin(pi/10 * x)" },
    { "points": [[0,0], [10,0]], "radius": 5, "fillColor": "black1" }
  ]
}
```
25. **[F+]** Quale dei seguenti spettri (A, B, C o D) corrisponde alla funzione d'onda $\Delta p(t) = 4\sin(2\pi \cdot 20 \cdot t) + 2\sin(2\pi \cdot 40 \cdot t)$?
	- **(a)** Grafico A (rosso)
	- **(b)** Grafico B (nero, tratteggiato)
	- **(c)** Grafico C (blu)
	- **(d)** Grafico D (arancione, tratteggiato)
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [0, 50],
  "ylim": [0, 5],
  "axisLabels": ["f (Hz)", "|f^|"],
  "legend": true,
  "data": [
    { "points": [[20, 4], [40, 2]], "radius": 5, "fillColor": "red1", "label": "A" },
    { "points": [[20, 0], [20, 4]], "type": "interpolation", "smoothness": 0, "color": "red1" },
    { "points": [[40, 0], [40, 2]], "type": "interpolation", "smoothness": 0, "color": "red1" },
    
    { "points": [[20, 2], [40, 4]], "radius": 5, "fillColor": "black1", "label": "B" },
    { "points": [[20, 0], [20, 2]], "type": "interpolation", "smoothness": 0, "color": "black1", "dash": "4,4" },
    { "points": [[40, 0], [40, 4]], "type": "interpolation", "smoothness": 0, "color": "black1", "dash": "4,4" },

    { "points": [[4, 20], [2, 40]], "radius": 5, "fillColor": "blue", "label": "C" },

    { "points": [[10, 4], [20, 2]], "radius": 5, "fillColor": "orange", "label": "D" },
    { "points": [[10, 0], [10, 4]], "type": "interpolation", "smoothness": 0, "color": "orange", "dash": "4,4" },
    { "points": [[20, 0], [20, 2]], "type": "interpolation", "smoothness": 0, "color": "orange", "dash": "4,4" }
  ]
}
```
26. **[EE]** Associa il grafico della funzione d'onda $\Delta p(x)$ alla corretta equazione.
	- **(a)** $\Delta p(x) = \cos(2x)$
	- **(b)** $\Delta p(x) = \sin(2x)$
	- **(c)** $\Delta p(x) = \sin(0.5x)$
	- **(d)** $\Delta p(x) = 2\cos(x)$
```matephis
{
  "aspectRatio": "3:1",
  "xlim": [-6.28, 6.28],
  "ylim": [-1.5, 1.5],
  "xNumberStep": "pi",
  "data": [
    { "fn": "cos(2*x)" }
  ]
}
```

## Problemi

### 1. La canna dell'organo

**[AD-]** Un organo a canne possiede tubi di diverse lunghezze per riprodurre l'intera gamma delle note musicali. Considera un tubo chiuso a un'estremità.

- Sapendo che la nota musicale più bassa che l'organo può riprodurre è un Do1 (circa $32.7 \, \text{Hz}$), qual è la lunghezza del tubo necessario per riprodurre questa nota? (Assumi $v = 340 \, \text{m/s}$).
- Scrivi la funzione d'onda spaziale $\Delta p(x)$ dell'armonica fondamentale all'interno del tubo, sapendo che nell'estremità aperta ($x = 0$) la variazione di pressione è nulla (nodo di pressione) e nell'estremità chiusa ($x = L$) è massima (antinodo di pressione). Assumi un'ampiezza massima arbitraria $A$.
- Se il tubo fosse aperto da entrambe le parti, quale frequenza fondamentale produrrebbe?

### 2. Sintetizzatore analogico

**[PD]** Stai programmando un sintetizzatore analogico in cui puoi sommare diverse onde sinusoidali pure per creare nuovi timbri.

- Vuoi creare un suono che abbia un'onda fondamentale a $440 \, \text{Hz}$ con ampiezza $1$, la prima armonica superiore (il doppio della frequenza) con ampiezza $0.5$ e la seconda armonica superiore (il triplo della frequenza) con ampiezza $0.25$. Scrivi la funzione d'onda $\Delta p(t)$ risultante.
- Traccia un grafico approssimativo (a mano o con la mente) dello spettro delle frequenze $|\hat f(f)|$ che ti aspetti di vedere per questo suono. Dove si trovano i picchi e quanto sono alti?
- Come cambierebbe lo spettro se raddoppiassi il volume di tutte le componenti? E se traslassi il grafico della funzione d'onda verticalmente aggiungendo una costante? (Cosa rappresenterebbe fisicamente la costante?)
- Se aggiungi al tuo sintetizzatore un'ulteriore onda pura avente frequenza di $442 \, \text{Hz}$ e ampiezza $1$, cosa percepirà un ascoltatore nel tempo? Descrivi il fenomeno dal punto di vista fisico.

### 3. Effetto serra... o accordatore?

**[PD]** L'accordatore della tua chitarra rileva le frequenze analizzando il suono prodotto. La sesta corda (Mi basso) suona a $82.4 \, \text{Hz}$. La lunghezza della corda dal ponte al capotasto è di $648 \, \text{mm}$.

- Qual è la lunghezza d'onda dell'armonica fondamentale che si instaura sulla corda?
- A quale velocità si propagano le onde lungo la corda per produrre questa specifica nota?
- Premi la corda al 12° tasto, dimezzandone esattamente la lunghezza vibrante. Qual è la nuova frequenza prodotta? (Ricorda che la velocità di propagazione dipende solo dalle proprietà fisiche della corda, non dalla sua lunghezza).
- Sapendo che due note distano un semitono se il rapporto tra le loro frequenze è $2^{1/12} \approx 1.059$, quante note (semitoni) hai "saltato" dimezzando la lunghezza della corda? Come si chiama questa relazione musicale tra le due note?

### 4. Il sonar e gli ostacoli sottomarini

**[D-]** Un sottomarino emette un segnale sonar (un'onda sonora nell'acqua) con una frequenza di $30 \, \text{kHz}$. Il segnale è definito dalla funzione $\Delta p(t) = A\sin(2\pi \cdot 30000 \cdot t)$.

- Qual è il periodo di questa onda in secondi e in millisecondi?
- L'onda sonora viaggia nell'acqua a circa $1500 \, \text{m/s}$. Qual è la lunghezza d'onda di questo segnale?
- C'è un motivo fisico (o pratico) per cui i sonar utilizzano frequenze così elevate (ultrasuoni) rispetto alle normali basse frequenze udibili? Fai riferimento alla lunghezza d'onda appena calcolata e pensa alla capacità dell'onda di "distinguere" piccoli ostacoli.
- Scrivi la funzione d'onda spaziale $\Delta p(x)$ che descrive il segnale in un determinato istante di tempo, assumendo un'ampiezza $A = 100 \, \text{Pa}$.