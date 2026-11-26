---
title: Interrogazione di prova
feed: hide
tags:
  - test
exam:
  pick: 2
  level: [EE, F]
  cooldown: 1
---
Pagina di prova per l'estrazione delle domande delle interrogazioni: vedi le [[Funzionalità di matephis]].

## Dominio e immagine

1. **[E]** Cos'è il dominio naturale di una funzione? Fai un esempio con $f(x) = \sqrt{x - 2}$.
	[sol: l'insieme degli IN per cui l'espressione ha senso; per $f$ è $x \geq 2$.]
2. **[F]** Determina dominio e immagine di $f(x) = \frac{1}{x^2 + 1}$, spiegando il ragionamento.

## Iniettività e inversa

1. **[EE]** Quando una funzione è iniettiva? Come lo riconosci dal grafico?
2. **[PD]** Mostra che $f(x) = x^3 + x$ è invertibile su $\mathbb{R}$ senza calcolare l'inversa.
3. **[F]** La funzione in figura è iniettiva? È suriettiva su $B$? Che cosa cambia se togli $a_3$?
	```sets
	{
	  "sets": [
	    { "id": "A", "elements": ["a_1", "a_2", "a_3"] },
	    { "id": "B", "elements": ["b_1", "b_2", "b_3"] }
	  ],
	  "maps": [{ "id": "f", "from": "A", "to": "B", "pairs": { "a_1": "b_1", "a_2": "b_3", "a_3": "b_1" } }],
	  "controls": [{ "type": "reveal", "label": "Mostra immagine", "targets": ["image(f)"] }]
	}
	```

## Trasformazioni dei grafici

1. **[E]** Il grafico tratteggiato è $f(x) = x^2$. Muovi gli slider e rispondi.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-5, 5],
	  "ylim": [-3, 7],
	  "params": {
	    "h": { "min": -3, "max": 3, "step": 0.5, "val": 1, "label": "$h$" },
	    "k": { "min": -3, "max": 3, "step": 0.5, "val": 1, "label": "$k$" }
	  },
	  "data": [
	    { "fn": "x^2", "color": "black1", "dash": "4,4" },
	    { "fn": "(x - h)^2 + k", "color": "red1" }
	  ]
	}
	```
	1. Come cambia il grafico passando a $f(x) + 2$?
	2. E a $f(x - 2)$?
	3. Dove va il vertice di $f(x - h) + k$?
2. **[EE/F]** Spiega perché una modifica dell'IN agisce in orizzontale con l'operazione inversa.
3. **[F+]** Scrivi $g(x) = 2x^2 - 8x + 3$ come trasformazione di $f(x) = x^2$ e descrivi le trasformazioni.

## Composizione

1. **[EE]** Date $f(x) = x + 1$ e $g(x) = x^2$, calcola $f \circ g$ e $g \circ f$. Sono uguali?
2. **[PD-]** Trova due funzioni $f$ e $g$, diverse dall'identità, tali che $f \circ g = g \circ f$.
