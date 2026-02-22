---
title: Alla scoperta della derivata
feed: show
tags:
- derivata
- attività
- funzioni
plot: true
---
## Roadmap

1. Rapidità di variazione e relazione con la pendenza.
2. Pendenza di una retta.
3. Pendenza di una funzione in un punto tramite linearizzazione via zoom.
4. Pendenza di una funzione in un punto tramite pendenza della retta tangente (surfing).
5. Definizione di derivata come pendenza della tangente, definita come limite della secante (limite del rapporto incrementale).
6. Derivata delle funzioni fondamentali per via grafica e algebrica.
7. Relazione tra derivata e traslazione e dilatazione delle funzioni.

## Inspira... espira...

In figura è rappresentato il grafico del volume d'aria presente nei polmoni di una persona durante una respirazione regolare.

```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "xlim": [0,5],
  "ylim": [2,3],
  "boxPlot": true,
  "boxNumbersInside": true,
  "aspectRatio": "3:2",
  "axisLabels": ["t","V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "showXTicks": true,
  "showYTicks": true,
  "interactive": true,
  "constrainView": true,
  "pointSelection": true,
  "padding": 55,
  "data": [
    { "fn": "0.6*sin(pi*x/2.5)^4+2.2", "color": "red1", "domain": [0,6] },
    { "points": [[0.25,"0.6*sin(pi*0.25/2.5)^4+2.2"],[0.75,"0.6*sin(pi*0.75/2.5)^4+2.2"],[1,"0.6*sin(pi*1/2.5)^4+2.2"],[1.25,"0.6*sin(pi*1.25/2.5)^4+2.2"],[1.5,"0.6*sin(pi*1.5/2.5)^4+2.2"],[1.75,"0.6*sin(pi*1.75/2.5)^4+2.2"],[2,"0.6*sin(pi*2/2.5)^4+2.2"],[2.25,"0.6*sin(pi*2.25/2.5)^4+2.2"]], "fillColor": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

1. Descrivi , a parole, come varia il volume d'aria.
	- Quando aumenta? Quando diminuisce?
	- Quando rimane circa costante?
	- Cosa succede in $t = 1{,}25$?

Si definisce **portata (volumetrica)** $\dot{V}$ la variazione di volume d'aria nel tempo.

{:start="2"}
2. A cosa corrisponde graficamente il portata in un certo istante di tempo?
	- Dove è positiva? Dove è negativa?
	- Dove vale circa zero?
	- Dove è massima?
3. Calcola la portata nei punti indicati (*zooma fino a linearizzare la funzione*), riporta i dati in una tabella e costruisci un grafico della portata. Fai in modo che l'asse $t$ dei tempi nel grafico della portata sia allineato con l'asse $t$ del grafico del volume.
4. Le risposte alle domande precedenti trovano corrispondenza nel grafico della portata?

## C'è del potenziale!

Il grafico rappresenta la variazione del potenziale elettrico $V$ (espresso in volt) lungo una linea retta, in funzione della posizione $x$ sulla retta (espressa in metri) .

```matephis
{
  "cssWidth": "95%",
  "width": 600,
  "height": 400,
  "xlim": [0, 2],
  "ylim": [0, 15],
  "aspectRatio": "3:2",
  "axisLabels": ["x","V"],
  "axisUnitMeasures": ["m", "V"],
  "axisLabelStyle": "italic",
  "showXTicks": true,
  "showYTicks": true,
  "interactive": true,
  "constrainView": true,
  "pointSelection": true,
  "slopeSelection": true,
  "specifySlope": true,
  "slopeLabel": "E",
  "boxPlot": true,
  "boxNumbersInside": true,
  "padding": 55,
  "data": [
    {
      "type": "interpolation",
      "points": [[-1, 10], [0.2, 10], [0.4, 10], [0.6, 4], [0.7, 4], [1,8], [1.2, 8], [1.6, 8], [2.5, 8]],
      "smoothness": 0.4,
      "color": "red1",
      "width": 3,
      "showPoints": false
    }
  ]
}
```

1. Cosa rappresenta fisicamente la variazione del potenziale nello spazio? A cosa corrisponde graficamente?
2. Come varia il potenziale tra $0.4 \, \text{m}$ e $0.6 \, \text{m}$? Come varia il potenziale dopo $1.2 \, \text{m}$?
3. Stima il campo elettrico $E$ in alcuni punti della curva del potenziale e traccia un grafico del campo $E$ in funzione della posizione $x$.
4. Dove è massimo il campo? Dove è minimo? Dove è nullo?

## Derivate delle funzione fondamentali

Considera la funzione quadratica rappresentata nel grafico seguente. Accarezza la funzione con la mano, assicurandoti che le dita siano tese.

1. Traccia un grafico approssimativo della derivata della funzione, studiando la pendenza della mano mentre accarezzi la funzione.
2. Attiva il *"surfing"* della funzione e la traccia della derivata. Percorri la funzione e verifica la correttezza del grafico da te tracciato.
3. Determina la derivata della funzione per $x = 1$ e per $x = -1$.

```matephis
{
  "cssWidth": "95%",
  "aspectRatio": "3:2",
  "xlim": [-4.9, 4.9],
  "tangentSelection": true,
  "slopeSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "legend": true,
  "data": [{ "fn": "x^2", "label": "$f(x) = x^2" }]
}
```

Considera la funzione cubica rappresentata nel grafico seguente.

{:start="4"}
1. Verifica la correttezza del grafico della funzione derivata.

```matephis
{
  "cssWidth": "95%",
  "aspectRatio": "3:2",
  "xlim": [-4.9, 4.9],
  "tangentSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "traceDerivative": true,
  "legend": true,
  "data": [{ "fn": "x^3", "label": "$f(x) = x^2" }]
}
```