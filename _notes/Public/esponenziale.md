---
title: La funzione esponenziale
feed: show
tags:
  - funzioni
  - esponenziale
plot: true
---

## La coltura batterica

In condizioni ambientali ideali e in presenza di adeguate quantità di ossigeno e micronutrienti, un particolare tipo di batteri si riproduce per *citochinesi* ogni ora, ovvero ogni batterio duplica il proprio materiale genetico e si scinde in due batteri identici tra loro e al batterio progenitore.

In una coltura microbiologica, all'istante temporale $t = 0$, un insieme di tali batteri ha una massa complessiva di $1 \, \text{ng}$. Nella tabella è riporta la massa complessiva dei batteri dopo ogni ora.

| t (h) | m (ng)     |
| ----- | ---------- |
| 0     | $1 = 2^0$  |
| 1     | $2 = 2^1$  |
| 2     | $4 = 2^2$  |
| 3     | $8 = 2^3$  |
| 4     | $16 = 2^4$ |
| 5     | $32 = 2^5$ |

### Crescita esponenziale

Si nota che la massa di batteri dopo $n$ ore vale $2^n$. Possiamo quindi esprimere la massa $m$ di batteri in funzione del tempo $t$:

$$m(t) = 2^t \, .$$

Questo tipo di funzione si dice ***esponenziale***, perché la variabile indipendente $t$ compare ad esponente (a differenza, ad esempio, di $f(t) = t^2$, dove $t$ è la base della potenza). È anche possibile indagare il comportamento della massa di batteri nel passato, prima dell'istante iniziale. Un'ora prima dell'istante iniziale $t = 0$, la massa di batteri — che raddoppia ogni ora e misura inizialmente $1 \, \text{ng}$ — ammontava a $0{,}5 \, \text{ng}$, due ore prima ammontava a $0{,}25 \, text{ng}$, eccetera.

| t (h) | m (ng)     |
| ----- | ---------- |
| 0     | $1 = 2^0$  |
| -1    | $0{,}5 = \frac{1}{2} = 2^{-1}$  |
| -2    | $0{,}25 = \frac{1}{4} = 2^{-2}$  |
| -3    | $0{,}125 = \frac{1}{8} = 2^{-3}$  |
| -4    | $0{,}0625 = \frac{1}{16} = 2^{-4}$ |
| -5    | $0{,}03215 = \frac{1}{32} = 2^{-5}$ |

La funzione $m(t) = 2^t$ continua a descrivere perfettamente il comportamento della massa di batteri, anche nel passato, ovvero per $t < 0$.

Possiamo tracciare un grafico della funzione.

```matephis
{
  "cssWidth": "85%",
  "align": "center",
  "xlim": [-5.9,5.9],
  "ylim": [-0.9,34.9],
  "axisLabels": ["t","m"],
  "axisLabelStyle": "italic",
  "data": [
    { "fn": "2^x", "color": "red1", "dash": [2,2] },
    { "points": [[-5,0.03125],[-4,0.0625],[-3,0.125],[-2,0.25],[-1,0.5],[0,1],[1,2],[2,4],[3,8],[4,16],[5,32]], "color": "red1", "radius": 4 }
  ] 
}
```

Si può notare che:
- il dominio della funzione è $\mathbb{R}$;
- l'immagine della funzione è $\{\forall t \in \mathbb R : t > 0\}$, ovvero l'insieme dei numeri reali positivi;
- la funzione si "appiattisce" sull'asse delle ascisse al decrescere del valore di $t$ — più precisamente, la funzione tende a $0$ per $t$ che tende a $-\infty$;
- la funzione cresce molto rapidamente verso infinito al crescere di $t$, "impenna" — più precisamente, la funzione tende a $+\infty$ per $t$ che tende a $+\infty$.

Di seguito è riportato il grafico *"dezoomato"* della funzione $m(t) = 2^t$.

```matephis
{
  "align": "center",
  "xlim": [-999,999],
  "ylim": [-99,9999],
  "axisLabels": ["t","m"],
  "axisLabelStyle": "italic",
  "data": [
    { "fn": "2^x", "color": "red1" }
  ]
}
```
*Ben si può osservare quanto rapidamente la funzione cresca e come si appiattisce sull'asse delle ascisse, al punto da apparire quasi come un angolo retto.*

### Valore iniziale

Se la massa iniziale di batteri ammontasse a $5 \, \text{ng}$, la massa complessiva di batteri evolverebbe nel modo seguente.

| t (h) | m (ng)     |
| ----- | ---------- |
| -3    | $0{,}625 = 5 \cdot 2^{-3}$  |
| -2    | $1{,}25 = 5 \cdot 2^{-2}$ |
| -1    | $2{,}5 = 5 \cdot 2^{-1}$ |
| 0     | $5 = 5 \cdot 2^0$  |
| 1     | $10 = 5 \cdot 2^1$  |
| 2     | $20 = 5 \cdot 2^2$  |
| 3     | $40 = 5 \cdot 2^3$  |

Pertanto, la funzione che descrive l'evoluzione della massa di batteri è $m_2(t) = 5 \cdot 2^t$ (il nome $m_2$ serve a differenziarla dalla massa di batteri descritta in precedenza). Osservando il grafico della funzione, si può che
- il grafico della funzione $m_2$ risulta dilatata verticalmente rispetto al grafico della funzione $m$;
- la funzione $m_2$ cresce con rapidità doppia rispetto a $m$;
- la funzione $m_2$ passa per il punto $(0, 5)$, perché la massa iniziale di batteri ammonta a $5 \, \text{mg}$, al posto del punto $(0, 1)$ in cui passava la funzione $m$;
- entrambe le funzioni si appiattiscono sull'asse delle ascisse;
- entrambe le funzioni crescono rapidamente all'infinito.

```matephis
{
  "cssWidth": "85%",
  "align": "center",
  "xlim": [-5.9,5.9],
  "ylim": [-0.9,34.9],
  "axisLabels": ["t","m"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 140,
  "data": [
    { "fn": "2^x", "color": "red1", "dash": [2,2], "label": "$f(x) = 2^x$" },
    { "points": [[-5,0.03125],[-4,0.0625],[-3,0.125],[-2,0.25],[-1,0.5],[0,1],[1,2],[2,4],[3,8],[4,16],[5,32]], "color": "red1", "radius": 4 },
    { "fn": "5*2^x", "color": "black1", "dash": [2,2], "label": "$f(x) = 5 \\cdot 2^x$" },
    { "points": [[-5,0.15625],[-4,0.3125],[-3,0.625],[-2,1.25],[-1,2.5],[0,5],[1,10],[2,20],[3,40],[4,80],[5,160]], "color": "black1", "radius": 4 }
  ] 
}
```

### Rapidità di crescita

Supponiamo che i batteri, al posto di duplicare ogni ora, triplichino.

| t (h) | m (ng)     |
| ----- | ---------- |
| -3    | $0{,}19 \approx 5 \cdot 3^{-3}$  |
| -2    | $0{,}56 \approx 5 \cdot 3^{-2}$ |
| -1    | $1{,}67 \approx 5 \cdot 3^{-1}$ |
| 0     | $5 = 5 \cdot 3^0$  |
| 1     | $15 = 5 \cdot 3^1$  |
| 2     | $45 = 5 \cdot 3^2$  |
| 3     | $135 = 5 \cdot 3^3$  |

La massa iniziale di batteri continua a valere $5 \, \text{ng}$, pertanto il grafico della funzione passa nel punto $(0, 5)$, ma la funzione cresce più rapidamente.

```matephis
{
  "cssWidth": "85%",
  "align": "center",
  "xlim": [-5.9,5.9],
  "ylim": [-9.9,149.9],
  "axisLabels": ["t","m"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 140,
  "data": [
    { "fn": "5*2^x", "color": "black1", "dash": [2,2], "label": "$f(x) = 5 \\cdot 2^x$" },
    { "points": [[-5,0.15625],[-4,0.3125],[-3,0.625],[-2,1.25],[-1,2.5],[0,5],[1,10],[2,20],[3,40],[4,80],[5,160]], "color": "black1", "radius": 4 },
    { "fn": "5*3^x", "color": "red1", "dash": [2,2], "label": "$f(x) = 5 \\cdot 3^x$" },
    { "points": [[-5,0.02057],[-4,0.06172],[-3,0.18518],[-2,0.55556],[-1,1.666667],[0,5],[1,15],[2,45],[3,135]], "color": "red1", "radius": 4 }
  ]
}
```

### Soglia

Consideriamo nuovamente la massa di batteri che duplica ogni ora, ma supponiamo ora che esista oltre ai $10 \, \text{mg}$ iniziali che duplicano ogni ora, ci siano $3 \, \text{mg}$ di batteri sterili, che non si riproducono.

| t (h) | m (ng)     |
| ----- | ---------- |
| -3    | $10{,}625 = 5 \cdot 2^{-3}$  |
| -2    | $11{,}25 = 5 \cdot 2^{-2}$ |
| -1    | $12{,}5 = 5 \cdot 2^{-1}$ |
| 0     | $15 = 5 \cdot 2^0$  |
| 1     | $20 = 5 \cdot 2^1$  |
| 2     | $30 = 5 \cdot 2^2$  |
| 3     | $50 = 5 \cdot 2^3$  |

La funzione non si appiattisce più sull'asse delle ascisse, ma sulla retta orizzontale di equazione $m = 10$: risulta ovvero traslata verticalmente verso l'alto di 10.

```matephis
{
  "cssWidth": "85%",
  "align": "center",
  "xlim": [-5.9,5.9],
  "ylim": [-4.9,54.9],
  "axisLabels": ["t","m"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 170,
  "data": [
    { "fn": "5*2^x", "color": "black1", "dash": [2,2], "label": "$m_2(t) = 5 \\cdot 2^t$" },
    { "points": [[-5,0.15625],[-4,0.3125],[-3,0.625],[-2,1.25],[-1,2.5],[0,5],[1,10],[2,20],[3,40]], "color": "black1", "radius": 4 },
    { "fn": "5*2^x+10", "color": "red1", "dash": [2,2], "label": "$m_2(t) = 5 \\cdot 2^t + 3$" },
    { "points": [[-5,10.15625],[-4,10.3125],[-3,10.625],[-2,11.25],[-1,12.5],[0,15],[1,20],[2,30],[3,50]], "color": "red1", "radius": 4 }
  ] 
}
```

### Decrescita esponenziale

Se volessimo rappresentare una massa di batteri, inizialmente di $1 \, \text{ng}$ che dimezza ogni ora, la funzione corretta sarebbe invece $m(t) = \left(\frac 1 2\right)^t$.

La base dell'esponenziale rappresenta la percentuale di batteri presenti dopo un'unità temporale rispetto all'istante considerato: ad esempio, la massa iniziale misura $1 \, \text{ng}$ e dopo un'unità temporale (un'ora) misura il $50 \%$ di $1 \, \text{ng}$, ovvero $\frac 1 2 \cdot 1 \, \text{ng} = 0{,}5 \, \text{ng}$.

```matephis
{
  "cssWidth": "85%",
  "align": "center",
  "xlim": [-5.9,5.9],
  "ylim": [-0.9,34.9],
  "axisLabels": ["t","m"],
  "axisLabelStyle": "italic",
  "data": [
    { "fn": "0.5^x", "color": "red1", "dash": [2,2] },
    { "points": [[5,0.03125],[4,0.0625],[3,0.125],[2,0.25],[1,0.5],[0,1],[-1,2],[-2,4],[-3,8],[-4,16],[-5,32]], "color": "red1", "radius": 4 }
  ] 
}
```

## Ricapitolando

La funzione esponenziale è utile per rappresentare fenomeni di **crescita** o **decrescita**, dove la quantità $f$ che cresce o decresce diventa una certa percentuale di se stessa dopo ogni unità di tempo $x$. Una funzione esponenziale può essere descritta algebricamente nel modo seguente:

$$f(x) = a \cdot b^x + c$$

dove
- $c$ è la **soglia**, il valore della traslazione verticale della funzione $a \cdot b^x$;
- $a$ è la **distanza iniziale** (con segno) dalla soglia, ovvero la distanza tra $(0, c)$ e l'intersezione della funzione esponenziale con l'asse delle ordinate — moltiplicando $b^x$ per $a$ si effettua una dilatazione ($a > 1$), compressione ($0 < a < 1$) o riflessione ($a < 1$) della funzione di partenza $b^x$;
- $b$ è la percentuale della quantità presente dopo ogni unità temporale rispetto all'instante considerato — il grafico della funzione si **allontana** alla soglia se $b > 1$ e si **avvicina** alla soglia se $0 < b < 1$.

Prova di seguito a modificare il valore dei parametri $a$, $b$ e $c$. Nota che $b > 0$, altrimenti l'output della funzione potrebbe non essere reale (ad esempio, $(-1)^{1/2} = \sqrt{-1} \not\in \mathbb{R}$).

```matephis
{
  "cssWidth": "85%",
  "align": "center",
  "legend": true,
  "legendWidth": 160,
  "params": {
    "a": { "val": 1, "min": -5, "max": 5, "step": 0.1 },
    "b": { "val": 2, "min": 0, "max": 5, "step": 0.01 },
    "c": { "val": 0, "min": -5, "max": 5, "step": 0.1 }
  },
  "data": [
    { "fn": "a*b^x+c", "color": "red1", "label": "$f(x) = a \\cdot b^x + c$" },
    { "fn": "c", "color": "black1", "dash": [3,3], "label": "soglia" },
    { "points": [[0,"a+c"]], "fillColor": "red1", "radius": 3, "strokeColor": "#fff", "strokeWidth": 2 }
  ]
}
```