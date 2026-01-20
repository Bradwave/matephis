---
title: Alla scoperta della derivata
feed: show
tags:
- derivata
- attività
- funzioni
plot: true
---

In figura è rappresentato il grafico del volume d'aria presente nei polmoni di una persona durante una respirazione regolare.

```matephis
{
  "cssWidth": "90%",
  "align": "center",
  "xlim": [0,5],
  "ylim": [2,3],
  "boxPlot": true,
  "aspectRatio": "3:2",
  "axisLabels": ["t (s)","V (L)"],
  "axisLabelStyle": "italic",
  "showXTicks": true,
  "showYTicks": true,
  "padding": 55,
  "interactive": true,
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
3. Calcola la portata nei punti indicati, riporta i dati nella tabella e costruisci un grafico della portata. Fai in modo che l'asse $t$ dei tempi nel grafico della portata sia allineato con l'asse $t$ del grafico del volume.
4. Le risposte alle domande precedenti trovano corrispondenza nel grafico della portata?