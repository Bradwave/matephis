---
title: Alla scoperta della derivata
feed: show
tags:
- derivata
- attività
- funzioni
plot: true
---

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
  "padding": 55,
  "data": [
    { "fn": "0.6*sin(pi*x/2.5)^4+2.2", "color": "red1", "domain": [0,6] },
    { "points": [[0.25,"0.6*sin(pi*0.25/2.5)^4+2.2"],[0.75,"0.6*sin(pi*0.75/2.5)^4+2.2"],[1,"0.6*sin(pi*1/2.5)^4+2.2"],[1.25,"0.6*sin(pi*1.25/2.5)^4+2.2"],[1.5,"0.6*sin(pi*1.5/2.5)^4+2.2"],[1.75,"0.6*sin(pi*1.75/2.5)^4+2.2"],[2,"0.6*sin(pi*2/2.5)^4+2.2"],[2.25,"0.6*sin(pi*2.25/2.5)^4+2.2"]], "fillColor": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```

---

1. Descrivi , a parole, come varia il volume d'aria.
	- Quando aumenta? Quando diminuisce?
	- Quando rimane circa costante?
	- Cosa succede in $t = 1{,}25$?

Si definisce ***portata (volumetrica)*** $\dot{V}$ la variazione di volume d'aria nel tempo.

{:start="2"}
2. A cosa corrisponde graficamente il portata in un certo istante di tempo?
	- Dove è positiva? Dove è negativa?
	- Dove vale circa zero?
	- Dove è massima?
3. Calcola la portata nei punti indicati (*zooma fino a linearizzare la funzione*), riporta i dati in una tabella e costruisci un grafico della portata. Fai in modo che l'asse $t$ dei tempi nel grafico della portata sia allineato con l'asse $t$ del grafico del volume.
4. Le risposte alle domande precedenti trovano corrispondenza nel grafico della portata?

### C'è del potenziale!

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

---

1. Cosa rappresenta fisicamente la variazione del potenziale nello spazio? A cosa corrisponde graficamente?
2. Stima il campo elettrico $E$ in alcuni punti della curva del potenziale, raccogli i risultati in una tabella e realizza un grafico del campo $E$ in funzione della posizione $x$.
3. Dove è massimo il campo? Dove è minimo? Dove è nullo?