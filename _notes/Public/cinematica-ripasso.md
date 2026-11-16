---
title: Ripasso essenziale di cinematica
feed: show
tags:
  - cinematica
  - teoria
---
Prima di affrontare la quantità di moto e l'impulso conviene rimettere in ordine le idee essenziali della cinematica in una dimensione: posizione, spostamento, velocità e accelerazione, i due moti «da manuale» (rettilineo uniforme e uniformemente accelerato) e soprattutto le due letture dei grafici che useremo di continuo, **la pendenza** e **l'area**.

Le scene di questa pagina sono simulazioni: avvia il tempo con ▷, sposta gli slider, trascina gli oggetti. Gli esercizi sono nella pagina [[Esercizi di cinematica in una dimensione]].

## Posizione e spostamento

Per descrivere un moto lungo una retta fissiamo un **sistema di riferimento**: un'origine $O$, un verso positivo e un'unità di misura. La **posizione** $s$ di un corpo è la sua coordinata su questo asse, quindi può essere positiva, negativa o nulla.

Lo **spostamento** $\Delta s$ è la variazione di posizione tra un istante iniziale e uno finale:

$$s = s_0 + \Delta s \qquad\Longleftrightarrow\qquad \Delta s = s - s_0$$

dove $s_0$ è la posizione iniziale e $s$ quella finale. Lo spostamento ha un segno: è negativo se il corpo finisce «indietro» rispetto al verso scelto, come nella figura qui sotto. Trascina le due palline e osserva come cambiano posizioni e spostamento; poi prova a spostare l'origine con la mente: le posizioni cambiano, lo spostamento no.

```physics
{
  "xlim": [-1, 9],
  "ylim": [-0.9, 1.6],
  "aspectRatio": "4:1",
  "params": {
    "s0": {"val": 6, "min": -0.5, "max": 8.5, "step": 0.1, "unit": "m", "label": "s₀"},
    "s": {"val": 1.5, "min": -0.5, "max": 8.5, "step": 0.1, "unit": "m", "label": "s"}
  },
  "objects": [
    {"type": "path", "points": [[-0.8, 0], [8.8, 0]], "arrow": true},
    {"type": "label", "at": [8.75, -0.35], "text": "$x$ (m)"},
    {"type": "particle", "at": [0, 0], "radius": 3, "label": "O"},
    {
      "id": "I",
      "type": "ball",
      "at": ["s0", 0.25],
      "radius": 0.22,
      "color": "gray",
      "opacity": 0.5,
      "drag": {"param": "s0", "axis": "x", "min": -0.5, "max": 8.5}
    },
    {
      "id": "F",
      "type": "ball",
      "at": ["s", 0.25],
      "radius": 0.22,
      "color": "red1",
      "drag": {"param": "s", "axis": "x", "min": -0.5, "max": 8.5}
    },
    {"type": "label", "at": ["s0", 0.8], "text": "posizione iniziale"},
    {"type": "label", "at": ["s", 1.25], "text": "posizione finale", "color": "red1"},
    {
      "type": "vector",
      "at": ["s0", -0.45],
      "vec": ["s - s0", 0],
      "scale": 1,
      "label": "\\Delta s",
      "color": "blue",
      "show": "abs(s - s0) > 0.05"
    }
  ],
  "readouts": [
    {"label": "s₀", "value": "s0", "unit": "m", "digits": 1},
    {"label": "s", "value": "s", "unit": "m", "digits": 1},
    {"label": "Δs = s − s₀", "value": "s - s0", "unit": "m", "digits": 1}
  ]
}
```

> Lo spostamento non è la distanza percorsa. Se vai avanti di $8 \text{ m}$ e torni indietro di $3 \text{ m}$, la distanza percorsa è $11 \text{ m}$, lo spostamento è $+5 \text{ m}$.

## Velocità media e velocità istantanea

La **velocità media** in un intervallo di tempo $\Delta t$ è lo spostamento per unità di tempo:

$$v_m = \frac{\Delta s}{\Delta t} \qquad\Longleftrightarrow\qquad \Delta s = v_m \, \Delta t$$

La seconda forma si legge così: lo spostamento è «quante volte» il corpo si sposta di $v_m$ metri, moltiplicato per «quante unità di tempo» dura il moto. Per esempio, a $v_m = 3 \text{ m/s}$ in $\Delta t = 4 \text{ s}$ lo spostamento è $3 \text{ m} \cdot 4 = 12 \text{ m}$.

> **Attenzione.** La formula $v = \dfrac{s}{t}$ è corretta solo in un caso particolare: $v = \dfrac{s - s_0}{t - t_0}$ si riduce a $\dfrac{s}{t}$ soltanto se $s_0 = 0$ e $t_0 = 0$. Ragiona sempre con le variazioni, $\Delta s$ e $\Delta t$.

Nel grafico posizione-tempo la velocità media tra due istanti è la **pendenza della secante** che unisce i due punti del grafico. Riduci $\Delta t$ con lo slider: la secante ruota attorno ad $A$ e si avvicina sempre di più alla retta tangente. La pendenza della tangente è la **velocità istantanea**, la velocità «in quell'istante»:

```matephis
{
  "aspectRatio": "3:2",
  "xlim": [-0.3, 6.3],
  "ylim": [-0.5, 4.5],
  "xStep": 1,
  "yStep": 1,
  "axisLabels": ["t (s)", "s (m)"],
  "params": {
    "t1": {"val": 1, "min": 0, "max": 5, "step": 0.1, "label": "t₁"},
    "dt": {"val": 3, "min": 0.05, "max": 4, "step": 0.05, "label": "Δt"}
  },
  "data": [
    {"fn": "0.5 + 1.6*x - 0.25*x^2", "domain": [0, 6], "color": "blue", "label": "s(t)"},
    {
      "fn": "(0.5 + 1.6*(t1+dt) - 0.25*(t1+dt)^2 - (0.5 + 1.6*t1 - 0.25*t1^2))/dt*(x - t1) + 0.5 + 1.6*t1 - 0.25*t1^2",
      "color": "red1",
      "width": 2,
      "label": "secante"
    },
    {
      "fn": "(1.6 - 0.5*t1)*(x - t1) + 0.5 + 1.6*t1 - 0.25*t1^2",
      "color": "gray",
      "dash": "5,5",
      "width": 1.5,
      "label": "tangente"
    },
    {
      "points": [["t1", "0.5 + 1.6*t1 - 0.25*t1^2", "A"], ["t1+dt", "0.5 + 1.6*(t1+dt) - 0.25*(t1+dt)^2", "B"]],
      "color": "red1"
    }
  ],
  "legend": true
}
```

In simboli, la velocità istantanea è il valore a cui si avvicina $\frac{\Delta s}{\Delta t}$ quando $\Delta t$ diventa piccolissimo, e si scrive

$$v(t) = \frac{ds}{dt}$$

dove $ds$ e $dt$ ricordano che si tratta di variazioni «infinitamente piccole». È la *derivata* della posizione rispetto al tempo (vedi [[Alla scoperta della derivata]]).

## Accelerazione media

Allo stesso modo, l'**accelerazione media** è la variazione di velocità per unità di tempo:

$$a_m = \frac{\Delta v}{\Delta t} \qquad\Longleftrightarrow\qquad \Delta v = v - v_0 = a_m \, \Delta t$$

Un'accelerazione di $-2 \text{ m/s}^2$ significa che, ogni secondo, la velocità diminuisce di $2 \text{ m/s}$. Il corpo non sta necessariamente rallentando: se la velocità è negativa, aumenta in modulo. Si rallenta quando velocità e accelerazione hanno verso opposto.

Nel grafico velocità-tempo l'accelerazione media è la pendenza della secante, l'accelerazione istantanea quella della tangente: $a(t) = \dfrac{dv}{dt}$.

## Due letture dei grafici: pendenza e area

| Grafico | La **pendenza** è... | L'**area** sotto il grafico (con segno) è... |
| :--- | :--- | :--- |
| posizione-tempo, $s$-$t$ | la velocità | (non ha un significato utile) |
| velocità-tempo, $v$-$t$ | l'accelerazione | lo spostamento $\Delta s$ |
| accelerazione-tempo, $a$-$t$ | (non ci serve) | la variazione di velocità $\Delta v$ |

Perché l'area? Se la velocità è costante, $\Delta s = v\,\Delta t$ è l'area di un rettangolo di base $\Delta t$ e altezza $v$. Se non lo è, si divide l'intervallo in tanti pezzetti in cui è quasi costante e si sommano i rettangoli (vedi più sotto, *Moto vario*). L'area si conta **con segno**: le parti sotto l'asse dei tempi corrispondono a spostamenti nel verso negativo.

## Moto rettilineo uniforme

Velocità costante, accelerazione nulla:

$$s = s_0 + \Delta s, \qquad \Delta s = v \, \Delta t, \qquad v = \text{costante}, \qquad a = 0$$

- Grafico $s$-$t$: una retta, la cui **pendenza** è la velocità; l'intercetta è $s_0$.
- Grafico $v$-$t$: una retta orizzontale; l'**area** del rettangolo è lo spostamento.
- Grafico $a$-$t$: coincide con l'asse dei tempi.

Avvia la simulazione e guarda le schede dei grafici: l'area sotto il grafico velocità-tempo cresce insieme allo spostamento letto sotto la scena. Le copie sbiadite del carrello, una ogni secondo, formano il **diagramma del moto**: sono equidistanti.

```physics
{
  "xlim": [-0.5, 10.5],
  "ylim": [0, 1.8],
  "aspectRatio": "5:1",
  "params": {
    "s0": {"val": 1, "min": 0, "max": 4, "step": 0.5, "unit": "m", "label": "s₀"},
    "v": {"val": 1.5, "min": -1, "max": 2, "step": 0.1, "unit": "m/s", "label": "v"}
  },
  "time": {"max": 4},
  "objects": [
    {"id": "g", "type": "ground", "from": [0, 0.3], "to": [10.5, 0.3]},
    {"type": "particle", "at": [0, 0.3], "radius": 3, "label": "O"},
    {"id": "C", "type": "cart", "on": "g", "pos": "s0 + v*t", "posUnit": "m", "size": [0.8, 0.35]},
    {"type": "velocity", "on": "C", "label": "\\vec v"},
    {"type": "ghosts", "of": "C", "every": 1, "opacity": 0.35, "labels": "t"}
  ],
  "readouts": [
    "t",
    {"label": "s", "value": "s0 + v*t", "unit": "m", "digits": 2},
    {"label": "Δs", "value": "v*t", "unit": "m", "digits": 2}
  ],
  "graphs": [
    {"y": "s0 + v*t", "label": "Posizione", "axisLabels": ["t (s)", "s (m)"], "position": "tabs"},
    {
      "y": "v",
      "label": "Velocità",
      "axisLabels": ["t (s)", "v (m/s)"],
      "position": "tabs",
      "colors": ["summer4"],
      "fill": {"upTo": "now", "hatch": true, "signed": true},
      "ylim": [-1.2, 2.2]
    },
    {
      "y": "0",
      "label": "Accelerazione",
      "axisLabels": ["t (s)", "a (m/s²)"],
      "position": "tabs",
      "colors": ["red1"],
      "ylim": [-1, 1]
    }
  ]
}
```

Prova a mettere una velocità negativa: che cosa succede alla pendenza del grafico $s$-$t$? E all'area sotto il grafico $v$-$t$?

## Moto rettilineo uniformemente accelerato

Accelerazione costante:

$$\Delta v = a \, \Delta t \quad\Longrightarrow\quad v = v_0 + a\,t$$

$$\Delta s = v_0\,\Delta t + \frac12\, a\,\Delta t^2 = \frac{v_0 + v}{2}\,\Delta t$$

(qui e nel seguito $t_0 = 0$, quindi $\Delta t = t$). Le due espressioni di $\Delta s$ sono la stessa area sotto il grafico $v$-$t$, vista in due modi: un rettangolo di altezza $v_0$ più un triangolo di altezza $a\,\Delta t$, oppure un trapezio di basi $v_0$ e $v$.

- Grafico $s$-$t$: un arco di parabola. La pendenza della tangente in un punto è la velocità in quell'istante; nel vertice la tangente è orizzontale e il corpo è fermo, per un istante.
- Grafico $v$-$t$: una retta di pendenza $a$. L'area (con segno) è lo spostamento.
- Grafico $a$-$t$: una retta orizzontale; l'area è $\Delta v = a\,\Delta t$.

La scena riproduce il caso disegnato alla lavagna: il carrello parte verso destra, rallenta, si ferma e torna indietro. Osserva nel grafico velocità-tempo l'area che diventa negativa dopo l'inversione del moto, e confrontala con lo spostamento: quando le due aree sono uguali e opposte, il carrello è tornato al punto di partenza.

```physics
{
  "xlim": [-0.5, 10.5],
  "ylim": [0, 1.8],
  "aspectRatio": "5:1",
  "params": {
    "s0": {"val": 1, "min": 0, "max": 4, "step": 0.5, "unit": "m", "label": "s₀"},
    "v0": {"val": 3, "min": -2, "max": 4, "step": 0.1, "unit": "m/s", "label": "v₀"},
    "a": {"val": -1, "min": -2, "max": 2, "step": 0.1, "unit": "m/s²", "label": "a"}
  },
  "time": {"max": 5, "stopWhen": "s0 + v0*t + a*t^2/2 < -0.2 || s0 + v0*t + a*t^2/2 > 10.2"},
  "objects": [
    {"id": "g", "type": "ground", "from": [0, 0.3], "to": [10.5, 0.3]},
    {"type": "particle", "at": [0, 0.3], "radius": 3, "label": "O"},
    {"id": "C", "type": "cart", "on": "g", "pos": "s0 + v0*t + a*t^2/2", "posUnit": "m", "size": [0.8, 0.35]},
    {"type": "velocity", "on": "C", "label": "\\vec v"},
    {"type": "acceleration", "on": "C", "label": "\\vec a"},
    {"type": "ghosts", "of": "C", "every": 0.5, "opacity": 0.3}
  ],
  "readouts": [
    "t",
    {"label": "s", "value": "s0 + v0*t + a*t^2/2", "unit": "m", "digits": 2},
    {"label": "v", "value": "v0 + a*t", "unit": "m/s", "digits": 2},
    {"label": "Δs", "value": "v0*t + a*t^2/2", "unit": "m", "digits": 2}
  ],
  "graphs": [
    {"y": "s0 + v0*t + a*t^2/2", "label": "Posizione", "axisLabels": ["t (s)", "s (m)"], "position": "tabs"},
    {
      "y": "v0 + a*t",
      "label": "Velocità",
      "axisLabels": ["t (s)", "v (m/s)"],
      "position": "tabs",
      "colors": ["summer4"],
      "fill": {"upTo": "now", "hatch": true, "signed": true}
    },
    {
      "y": "a",
      "label": "Accelerazione",
      "axisLabels": ["t (s)", "a (m/s²)"],
      "position": "tabs",
      "colors": ["red1"],
      "fill": {"upTo": "now", "hatch": true, "signed": true, "color": "summer4"},
      "ylim": [-2.2, 2.2]
    }
  ]
}
```

> Nel diagramma del moto le copie del carrello (ogni $0{,}5 \text{ s}$) si avvicinano mentre rallenta, si accavallano dove si ferma e si allontanano mentre accelera nel verso opposto. Velocità e accelerazione hanno verso opposto mentre il carrello rallenta, lo stesso verso mentre accelera.

## Moto vario

Quando la velocità cambia in modo qualunque non abbiamo formule pronte, ma restano vere le due letture dei grafici:

$$\Delta s = v_m \, \Delta t = \text{area sottesa al grafico } v\text{-}t \text{ (con segno)}$$

$$\Delta v = a_m \, \Delta t = \text{area sottesa al grafico } a\text{-}t \text{ (con segno)}$$

```physics
{
  "xlim": [-0.5, 6.5],
  "ylim": [0, 1.4],
  "aspectRatio": "5:1",
  "time": {"max": 6},
  "objects": [
    {"id": "g", "type": "ground", "from": [0, 0.3], "to": [6.5, 0.3]},
    {"type": "particle", "at": [0, 0.3], "radius": 3, "label": "O"},
    {
      "id": "C",
      "type": "cart",
      "on": "g",
      "pos": "1 - 0.9/1.3*cos(1.3*t) + 0.9/1.3 + 0.125*t^2 - 0.15*t",
      "posUnit": "m",
      "size": [0.6, 0.3]
    },
    {"type": "velocity", "on": "C", "label": "\\vec v"},
    {"type": "trace", "of": "C", "dash": "2 4"}
  ],
  "readouts": [
    "t",
    {"label": "v", "value": "0.9*sin(1.3*t) + 0.25*t - 0.15", "unit": "m/s", "digits": 2},
    {
      "label": "Δs",
      "value": "1 - 0.9/1.3*cos(1.3*t) + 0.9/1.3 + 0.125*t^2 - 0.15*t - 1",
      "unit": "m",
      "digits": 2
    }
  ],
  "graphs": [
    {
      "y": "0.9*sin(1.3*t) + 0.25*t - 0.15",
      "label": "Velocità",
      "axisLabels": ["t (s)", "v (m/s)"],
      "colors": ["summer4"],
      "fill": {"upTo": "now", "hatch": true, "signed": true},
      "position": "right"
    }
  ]
}
```

Per calcolare l'area si divide l'intervallo di tempo in $n$ intervallini $\Delta t_i$; in ciascuno la velocità è quasi costante e vale circa $v_i$, quindi lo spostamento è circa $v_i\,\Delta t_i$, l'area di un rettangolino. Sommando:

$$\Delta s \approx \sum_i v_i \, \Delta t_i$$

Aumenta il numero di intervalli: la somma dei rettangoli (scritta in alto a sinistra) si stabilizza su un valore, che è lo spostamento esatto tra $0$ e $6 \text{ s}$ (confrontalo con il valore di $\Delta s$ letto nella simulazione alla fine del moto).

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-0.3, 6.3],
  "ylim": [-1.1, 2.6],
  "xStep": 1,
  "yStep": 0.5,
  "axisLabels": ["t (s)", "v (m/s)"],
  "params": {"n": {"val": 6, "min": 1, "max": 120, "step": 1, "label": "numero di intervalli"}},
  "data": [
    {
      "fn": "0.9*sin(1.3*x) + 0.25*x - 0.15",
      "domain": [0, 6],
      "color": "summer4",
      "riemann": {"n": "n", "range": [0, 6], "rule": "left", "showValue": true, "valueLabel": "\\sum v_i\\,\\Delta t_i"}
    }
  ]
}
```

Lo stesso vale per l'accelerazione: l'area sotto il grafico accelerazione-tempo dall'istante iniziale fino a $t$ è la variazione di velocità $\Delta v$ in quell'intervallo. Il grafico qui sotto è l'accelerazione del carrello della simulazione precedente: sposta l'estremo destro e confronta l'area con il grafico della velocità.

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-0.3, 6.3],
  "ylim": [-1.6, 1.6],
  "xStep": 1,
  "yStep": 0.5,
  "axisLabels": ["t (s)", "a (m/s²)"],
  "params": {"T": {"val": 3, "min": 0, "max": 6, "step": 0.1, "label": "fino a t"}},
  "data": [
    {
      "fn": "1.17*cos(1.3*x) + 0.25",
      "domain": [0, 6],
      "color": "red1",
      "fill": {"range": [0, "T"], "signed": true, "hatch": true, "color": "summer4"}
    }
  ]
}
```

> [!DETAILS] Per i curiosi: la notazione integrale
> Quando gli intervallini diventano infinitamente piccoli, la somma $\sum_i v_i\,\Delta t_i$ si scrive con una «S» allungata, il simbolo di **integrale**:
>
> $$\Delta s = \int_{\Delta t} v(t)\,dt \qquad\qquad \Delta v = \int_{\Delta t} a(t)\,dt$$
>
> Il simbolo $dt$ ricorda il $\Delta t_i$ piccolissimo di ogni rettangolino. Per saperne di più c'è la pagina [[L'integrale: sommare infiniti pezzetti]].

## Riassunto

| | Moto rettilineo uniforme | Moto uniformemente accelerato | Moto vario |
| :--- | :--- | :--- | :--- |
| posizione | $s = s_0 + \Delta s$ | $s = s_0 + \Delta s$ | $s = s_0 + \Delta s$ |
| spostamento | $\Delta s = v\,\Delta t$ | $\Delta s = v_0\,\Delta t + \frac12 a\,\Delta t^2 = \frac{v_0+v}{2}\,\Delta t$ | $\Delta s = v_m\,\Delta t$ = area sotto $v$-$t$ |
| velocità | costante | $v = v_0 + a\,\Delta t$ | $\Delta v = a_m\,\Delta t$ = area sotto $a$-$t$ |
| accelerazione | $a = 0$ | costante | variabile |
| grafico $s$-$t$ | retta, pendenza $v$ | parabola, pendenza della tangente $v$ | curva, pendenza della tangente $v$ |
