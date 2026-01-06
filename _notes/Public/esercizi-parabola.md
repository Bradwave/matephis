---
title: Esercizi sulla parabola
feed: show
tags:
  - esercizi
  - parabola
plot: true
---

Esercizi, quesiti, quiz e problemi sulla parabola.

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

## Esercizi

1. **[E]** Disegna il grafico delle seguenti parabole: abbozza innanzitutto il disegno tramite lo studio dei coefficienti, quindi perfeziona il disegno indicando chiaramente l'asse di simmetria della parabola, il vertice e i punti di intersezione con gli assi.
	1. $y = 3x^2 - 3$
	2. $y = -\dfrac{1}{2}x + 1$
	3. $y = x^2 + 5x$
	4. $y = -2x^2 - 10$
	5. $y = \dfrac{1}{2}x^2 + 5x - 5$
	6. $y = -3x^2 - x + 4$
	7. $y = x^2 - 2x - 15$
	8. $y = -x^2 + 2x + 15$
2. Scrivi l'equazione delle parabole che rispettano i seguenti requisiti:
	1. **[E]** il grafico passa per $(0, 3)$, l'asse di simmetria è $x = -\frac 5 4$ e la pendenza della parabola in $(0, 3)$ è $5$;
	2. **[EE/F]** il grafico intercetta l'asse $y$ in $-1$, l'asse di simmetria è $x = 1$ e il vertice della parabola è $(1, -2)$.
	3. **[EE]** l'asse di simmetria è l'asse $y$, la parabola passa per $(0, -2)$ e per $(1, -1)$;
	4. **[PD]** la parabola passa per $(2, 2)$, la pendenza della parabola nel punto $(2, 2)$ è $-2$ e l'asse di simmetria è $x = 5$.
3. **[EE]** Scrivi l'equazione della retta tangente alla parabola di equazione $y = -x^2 + 4x + 2$ nel punto $(0, 2)$. Quindi traccia il grafico della retta e della parabola.
4. **[D]** Scrivi l'equazione della retta tangente alla parabola di equazione $y = -x^2 + 4x + 2$ nel punto $(1, 5)$, appartenente alla parabola. Quindi traccia il grafico della retta e della parabola.

## Quesiti

1. **[E]** Considera la famiglia di parabole descritta dall'equazione $y = ax^2 + c$. Analizza le seguenti affermazioni basate sull'uso di slider in un ambiente dinamico come Desmos. Individua l'affermazione falsa e spiega il perché.
	- **(a)** Al variare di $a$, cambia l'apertura della parabola: se a cresce positivamente la parabola diventa più "piccata" (stretta), se a decresce verso zero diventa più larga.
	- **(b)** Al variare di $c$, la parabola trasla orizzontalmente lungo l'asse $x$.
	- **(c)** L'asse di simmetria rimane sempre l'asse y (ovvero $x = 0$) per qualsiasi valore di $a$ e $c$.
2. **[EE/F]** Considera l'equazione $x = −0.1t^2 + 0.4t − 0.1$ come il grafico tempo-posizione di un oggetto che si muove su una linea retta.
	- **Velocità iniziale.** Nell’istante di tempo iniziale ($t = 0$), quanto misura la velocità dell'oggetto? È positiva o negativa?
	- **Posizione iniziale.** A quale "metro" si trova l'oggetto all'istante $t = 0$?
	- **Accelerazione.** Il moto è accelerato o decelerato? L'accelerazione spinge l'oggetto nel verso positivo o negativo del moto?
	- **Simulazione.** Se dovessi replicare questo moto camminando, come dovresti muoverti? Descrivi i cambi di direzione e velocità.
3. **[F]** Nel grafico sono rappresentati i grafici posizione-tempo di un'auto e di una moto, che si muovono parallelamente lungo una strada rettilinea. La persona che osserva l'auto e la moto è posizionata nel punto $x = 0$.
	- Dopo quanto tempo e in che posizione rispetto all'osservatore auto e moto si trovano affiancate?
	- Descrivi a parole in che modo si muovo l'auto e la moto.
```matephis
{
  "xlim": [-0.9, 12.9],
  "ylim": [-19.9, 249.9],
  "axisLabels": ["t","x"],
  "axisLabelStyle": "italic",
  "aspectRatio": "3:2",
  "legend": true,
  "legendWidth": 80,
  "data": [
    { "fn": "5x^2", "color": "red1", "domain": [0, 10], "label": "Moto" },
    { "fn": "30x", "color": "black1", "domain": [0, 10], "label": "Auto" }
  ]
}
```
4. **[AD-]** Fai riferimento al quesito precedente.
	- Scrivi le equazioni della retta e della parabola, che descrivono il moto di auto e moto rispettivamente. La moto parte da ferma.
	- Verifica per via algebrica l'istante di tempo e la posizione in cui i due veicoli sono affiancati, identificati precedentemente per via grafica.
5. **[D]** Considera la generica parabola di equazione $y = ax^2 + bx + c$. Verifica che la retta di equazione $y = bx + c$, tangente alla parabola, interseca la parabola in un solo punto, di coordinate $(0, c)$.
6. **[PD-]** Spiega tramite controesempi la retta tangente a una curva **non** è la retta che interseca la curva in un solo punto: con un primo controesempio presenta una retta tangente che interseca la curva in più punti; con un secondo controesempio, presenta una retta non tangente che interseca la curva in un solo punto.
7. **Una "nuova" equazione per la parabola [PD]** Nel grafico è rappresentata la parabola di equazione $y = a(x - h)^2$. Fai variare il valore di $a$ e $h$, utilizzando gli slider, e spiega cosa osservi.
	- Cosa varia la forma della parabola al variare di $a$?
	- Come varia l'asse di simmetria della parabola al variare di $h$? Qual è l'equazione dell'asse di simmetria?
	- Costruisci la parabola avente asse di simmetria $x = -2$ e passante per il punto $(0, 2)$. Riscrivi l'equazione della parabola nella forma $y = ax^2 + bx + c$.
```matephis
{
  "params": {
    "a": {"val": 1, "min": -5, "max": 5, "step": 0.1},
    "h": {"val": 1, "min": -5, "max": 5, "step": 0.1}
  },
  "data": [
    { "fn": "a(x-h)^2", "color": "#B01A00" }
  ]
}
```
8. **[PD+]** Fai riferimento all'esercizio precedente. Considera ora la parabola di equazione $y = a(x - h)^2 + k$. Fai variare il valore di $k$, utilizzando lo slider, e spiega cosa osservi.
	- Come varia il vertice della parabola al variare di $k$?
	- Quali sono le coordinate del vertice?
	- Costruisci la parabola avente vertice $(2, -3)$ e $a = 0{,}2$.
	- Costruisci la parabola avente vertice $(-2, 3)$ e passante per $(0, 5)$. Riscrivi l'equazione nella forma $y = ax^2 + bx + c$.
```matephis
{
  "params": {
    "a": {"val": 1, "min": -5, "max": 5, "step": 0.1},
    "h": {"val": 1, "min": -5, "max": 5, "step": 0.1},
    "k": {"val": 0, "min": -5, "max": 5, "step": 0.1}
  },
  "data": [
    { "fn": "a(x-h)^2+k", "color": "#B01A00" }
  ]
}
```
9. **[AD]** Riscrivi l'equazione di una generica parabola $y = a(x - h)^2 + k$ nella forma $y = ax^2 + bx + c$.
	- A cosa equivalgono $b$ e $c$?
	- I risultati ottenuti in merito ad asse di simmetria e vertice della parabola di equazione $y = a(x - h)^2 + k$ sono compatibili con quelli noti in merito alla parabola di equazione $y = ax^2 + bx + c$?
10. **[ABO]** Scrivi l'equazione della retta tangente a una generica parabola di equazione $y = ax^2 + bx + c$ nel generico punto $(x_0, y_0)$, appartenente alla parabola. Come varia la pendenza della parabola al variare di $x_0$?

## Quiz

1. **[E]** Abbina le quattro parabole alle rispettive equazioni.
	- **(i)** $y = -x^2 + 3x - 2$
	- **(ii)** $y = x^2 + 3x - 2$
	- **(iii)** $y = -x^2 - 3x - 2$
	- **(iv)** $y = x^2 - 3x + 2$   
```matephis
{
  "xStep": 5,
  "yStep": 5,
  "legend": true,
  "legendWidth": 50,
  "data": [
    { "fn": "-x^2+3x-2", "color": "red1", "label": "A" },
    { "fn": "x^2+3x-2", "color": "black1", "label": "B" },
    { "fn": "-x^2-3x-2", "color": "red1", "opacity": 0.6, "label": "C", "dash": "2,2" },
    { "fn": "x^2-3x+2", "color": "black1", "opacity": 0.6, "label": "D", "dash": "2,2" }
  ]
}
```
 2. **[F]** Abbina ognuna delle quattro parabole al fenomeno che descrivono. **Nota:** nel grafico del fenomeno *"A che varia in funzione di B"*, A è tipicamente rappresentato sull'asse delle ordinate e B sull'asse delle ascisse.
	- **(i)** La posizione verticale (espressa in m) di un pallone lanciato verso l'alto in funzione del tempo (espresso in s).
	- **(i)** La posizione verticale (espressa in m) di un pallone lasciato cadere da fermo in funzione del tempo (espresso in s).
	- **(iii)** Il costo mensile di produzione di un'azienda (espresso in migliaia di euro) in funzione del numero di unità prodotte (espresso in migliaia di unità).
	- **(iv)** Lo spazio di frenata di un'automobile (espresso in m) in funzione della velocità (espressa in m/s).
```matephis
{
  "xlim": [-0.5,6.9],
  "ylim": [-0.5,6.9],
  "xStep": 5,
  "yStep": 5,
  "legend": true,
  "legendWidth": 50,
  "data": [
    { "fn": "-4.905x^2+3", "domain": [0,7], "color": "red1", "label": "A" },
    { "fn": "-4.905x^2+3x+3", "domain": [0,7], "color": "red1", "opacity": 0.6, "label": "B", "dash": "2,2" },
    { "fn": "0.05*(x-5)^2+1.5", "domain": [0,7], "color": "black1", "label": "C" },
    { "fn": "x+0.05x^2", "domain": [0,7], "color": "black1", "opacity": 0.4, "label": "D", "dash": "2,2" }
  ]
}
```
3. **[E]** Considera la parabola di equazione $y=ax^2 + bx + c.$ Sappiamo che il coefficiente$ b$ rappresenta la pendenza della retta tangente alla parabola nel punto di intersezione con l’asse $y$. Se osserviamo una parabola che passa per l'origine e in quel punto è decrescente, cosa possiamo dire dei suoi coefficienti?
	- **(a)** $c = 0$ e $b > 0$.
	- **(b)** $c \neq 0$ e $b < 0$.
	- **(c)** $c = 0$ e $b < 0$.
	- **(d)** $c = 0$ e $a < 0$.
4. **[F]** Immagina che la parabola $y = ax^2 + bx + c$ rappresenti il grafico tempo-posizione di un oggetto che si muove su una linea retta. Se il coefficiente $a$ è negativo, cosa sta succedendo fisicamente all'oggetto?
	- **(a)** L'oggetto sta rallentando fino a fermarsi.
	- **(b)** L'oggetto si muove all'indietro.
	- **(c)** L'oggetto subisce un'accelerazione che lo "tira" verso il basso (o indietro), come se qualcuno lo tirasse per la maglia.
	- **(d)** La velocità iniziale dell'oggetto è negativa.
5. **[T]** Data una parabola con equazione $y = ax^2 + bx + c$, quale condizione deve verificarsi affinché la parabola sia tangente all'asse delle ascisse (asse x)?
	- **(a)** $b^2 − 4ac > 0$
	- **(b)** $b^2 − 4ac = 0$
	- **(c)** $c = 0$
	- **(d)** $−2ab ​ =0$
6. **[F]** Quale delle seguenti rette è tangente alla parabola di equazione $y = 4x^2 - 3x + 2$ nel punto $(0, 2)$?
	- **(a)** $y = 4x - 3$
	- **(b)** $y = -3x + 2$
	- **(c)** $y = +2$
	- **(d)** $x = - 3/2$
7. **[AD-]** Quale delle seguenti parabole è tangente alla parabola di equazione $y = 4x^2 - 3x + 2$ nel punto $(0, 2)$?
	- **(a)** $y = \frac 1 4 x^2 - \frac 1 3 x + \dfrac 1 2$
	- **(b)** $y = 4x^2$
	- **(c)** $y = 5x^2 - 3x + 2$
	- **(d)** $x = -4x^2 + 3x - 2$

## Problemi