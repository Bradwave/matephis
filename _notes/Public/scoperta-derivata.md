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
  "align": "center",
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
3. Stima il campo elettrico $E$ in alcuni punti della curva del potenziale (utilizzando l'apposita *feature*) e traccia un grafico del campo $E$ in funzione della posizione $x$.
4. Dove è massimo il campo? Dove è minimo? Dove è nullo?

## Oh no, non un'altra volta!

Di seguito è riportato il grafico della posizione verticale $y$ in funzione del tempo $t$ di un vaso di petunie che viene lasciato cadere dal quinto piano di un palazzo.

```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "xlim": [0, 2.4],
  "ylim": [-2, 20],
  "aspectRatio": "3:2",
  "axisLabels": ["t","y"],
  "axisUnitMeasures": ["s", "m"],
  "axisLabelStyle": "italic",
  "showXTicks": true,
  "showYTicks": true,
  "interactive": true,
  "constrainView": true,
  "pointSelection": true,
  "slopeSelection": true,
  "tangentSelection": true,
  "specifySlope": true,
  "slopeLabel": "v",
  "boxPlot": false,
  "boxNumbersInside": true,
  "padding": 55,
  "data": [
    {
      "fn": "17 - 9.81/2*x^2",
      "domain": [0,1.86168],
      "color": "red1",
      "width": 3
    }
  ]
}
```

1. Cosa rappresenta fisicamente la pendenza della curva?
2. Qual è la velocità iniziale del vaso di petunie?
3. La velocità aumenta o diminuisce all'aumentare del tempo?
4. Quale sarà il grafico della funzione derivata? Formula una congettura, quindi verificala tramite l'ausilio dell'apposita *feature*, che consente di calcolare la pendenza della curva in un punto.
5. Se il vaso continuasse a cadere all'infinito, quanto misurerebbe la velocità per $t \to +\infty$?

## In moto

L'applicazione [Motus operandi](https://motus.matephis.com) consente di visualizzare i grafici posizione-tempo e velocità-tempo di una pallina, che può essere mossa lungo una rotaia retta. Per registrare il moto della pallina occorre tenere premuto il tasto `R` oppure il pulsante circolare posto a lato della rotaia.

<iframe width="100%" height="600px" src="https://motus.matephis.com" style="border: 0px; margin-bottom: 20px"></iframe>

1. Come occorre muovere la pallina affinché il grafico della posizione sia una retta orizzontale? In questo caso, quale sarà il grafico della velocità?
2. Muovi la pallina in modo che il grafico della velocità sia la retta orizzontale $v = 0.5$. Visualizza ora il grafico della velocità (premendo il pulsante con il simbolo del tachimetro) e verifica la correttezza del moto effettuato. Cosa noti? 
3. Che tipo di moto descrive l'equazione $x = 0.6 - 0.3t$ per $t \in [0, 4]$? Quale sarà il grafico della derivata?
4. Scrivi un'equazione che descriva un moto tale per cui il suo grafico posizione tempo risultati parallelo (ma non coincidente) al grafico precedente, quindi riproduci il moto. Il grafico della derivata cambia? Cosa rimane invariato per entrambi i moti?
5. Descrivi a parole come devi muovere la pallina al fine di ottenere il seguente grafico velocità-tempo, quindi registra il moto e verifica la risposta.

```matephis
{
   "align": "center",
   "aspectRatio": "3:2",
   "xlim": [0,4],
   "ylim": [-1,1],
   "axisLabels": ["t","v"],
  "axisUnitMeasures": ["s", ""],
   "boxPlot": false,
   "data": [
     {
       "fn": "0.5 - 0.25x",
       "domain": [0,4],
       "color": "#5084df",
       "width": 3
     }
   ]
}
```

{:start="6"}
6. Facendo riferimento al quesito precedente, quanto misura le velocità dopo 2 secondi dall'inizio della misurazione? Utilizzando la funzionalità che consente di misurare la pendenza del grafico (tasto "surfer"), verifica la risposta.

## x, x², x³, eccetera...

Abbiamo appreso che $D(\text{costante}) = 0$ e che $D(mx + q) = m$.

Considera ora la funzione quadratica rappresentata nel grafico seguente. Accarezza la funzione con la mano, assicurandoti che le dita siano tese.

1. Traccia un grafico approssimativo della derivata della funzione, studiando la pendenza della mano mentre accarezzi la funzione.
2. Attiva il *"surfing"* della funzione e la traccia della derivata. Percorri la funzione e verifica la correttezza del grafico da te tracciato. Scrivi la definizione algebrica della funzione derivata.

```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "aspectRatio": "3:2",
  "xlim": [-4.9, 4.9],
  "tangentSelection": true,
  "addDerivativePlot": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "legend": true,
  "data": [{ "fn": "x^2", "label": "$f(x) = x^2" }]
}
```

{:start:"3"}
3. Riesci a sviluppare una congettura in merito alla relazione tra il grado di una funzione polinomiale e il grafico della sua derivata?

Di seguito è rappresentato il grafico della funzione $f(x) = x^3$ e della funzione $g(x) = ax^2$.

{:start="4"}
4. Prevedi la forma approssimativa del grafico della derivata $f^\prime(x)$, quindi costruiscilo con l'apposita funzionalità. 
5. Fai variare il valore di $a$, controllabile tramite lo slider, in modo che il grafico di $g(x)$ coincida con quello di $f^\prime(x)$. Qual è il valore di $a$?

```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "aspectRatio": "3:2",
  "xlim": [-4.9, 4.9],
  "tangentSelection": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "legend": true,
  "params": {
    "a": { "min": -5, "max": 5, "step": 0.1, "val": 0 }
  },
  "data": [
    { "fn": "x^3", "label": "$f(x) = x^3$" },
    { "fn": "a*x^2", "label": "$g(x) = ax^2$", "color": "#5084df" }
  ]
}
```

{:start="5"}
5. Ripeti la procedura descritta nei due punti precedenti per $f(x) = x^4$, $g(x) = ax^3$ e per $f(x) = x^5$, $g(x) = ax^4$ (in quest'ultimo caso la derivata è già visibile, tratteggiata). Cosa osservi? Ipotizza una regola che leghi la funzione alla sua derivata.

```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "aspectRatio": "3:2",
  "xlim": [-4.9, 4.9],
  "tangentSelection": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "legend": true,
  "params": {
    "a": { "min": -5, "max": 5, "step": 0.1, "val": 0 }
  },
  "data": [
    { "fn": "x^4", "label": "$f(x) = x^4$" },
    { "fn": "ax^3", "label": "$g(x) = ax^3$", "color": "#5084df" }
  ]
}
```

```matephis
{
  "cssWidth": "95%",
  "align": "center",
  "aspectRatio": "3:2",
  "xlim": [-4.9, 4.9],
  "tangentSelection": true,
  "showDerivative": false,
  "showDerivativeFunction": false,
  "traceDerivative": true,
  "legend": true,
  "params": {
    "a": { "min": -5, "max": 5, "step": 0.1, "val": 0 }
  },
  "data": [
    { "fn": "x^5", "label": "$f(x) = x^5$" },
    { "fn": "5x^4", "label": "$f^\\prime(x)$", "color": "red1", "dash": [4,4], "opacity": 0.4 },
    { "fn": "ax^4", "label": "$g(x) = ax^4$", "color": "#5084df" }
  ]
}
```