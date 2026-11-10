---
title: Quantità di moto, impulso e urti
feed: show
tags:
  - quantità di moto
  - impulso
  - urti
  - teoria
---
In questa pagina mettiamo in ordine quello che abbiamo scoperto in laboratorio facendo urtare dei carrelli, e lo usiamo per capire che cosa fa una forza alla quantità di moto di un corpo, come si analizza un urto e come si muove il centro di massa di un sistema. L'impostazione segue quella di *College Physics: Explore and Apply* di E. Etkina, G. Planinsic e A. Van Heuvelen (capitolo 6 e paragrafo 7.7).

Prima di cominciare può essere utile il [[Ripasso essenziale di cinematica]], in particolare la lettura dell'area sotto un grafico. Gli esercizi sono nella pagina [[Esercizi su quantità di moto, impulso e urti]].

Le scene sono simulazioni: avvia il tempo con ▷, cambia i valori con gli slider, scegli il grafico con le schede.

## 1. Che cosa si conserva negli urti?

In laboratorio abbiamo lanciato due carrelli uno contro l'altro su una rotaia orizzontale, misurando con due sensori di posizione le velocità subito prima e subito dopo l'urto. Abbiamo cercato una grandezza che avesse **lo stesso valore prima e dopo l'urto**.

La simulazione qui sotto riproduce l'esperimento. Come in laboratorio, ci sono soltanto i dati dei sensori (posizioni e velocità): ripeti i tre esperimenti della scheda (A contro B fermo; lo stesso con una massa aggiunta su uno dei due; carrelli con il velcro lanciati uno contro l'altro) e cerca di nuovo la regola.

```physics
{
  "xlim": [0, 4],
  "ylim": [0, 1.0],
  "aspectRatio": "4:1",
  "params": {
    "m1": {"val": 0.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_A"},
    "m2": {"val": 0.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_B"},
    "u1": {"val": 0.45, "min": -0.6, "max": 0.8, "step": 0.05, "unit": "m/s", "label": "v_A iniziale"},
    "u2": {"val": 0.0, "min": -0.8, "max": 0.6, "step": 0.05, "unit": "m/s", "label": "v_B iniziale"},
    "e": {"val": 1.0, "min": 0, "max": 1, "step": 0.05, "label": "elasticità dei respingenti", "slider": false},
    "k": {
      "val": 120,
      "min": 40,
      "max": 600,
      "step": 10,
      "unit": "N/m",
      "label": "rigidità dei respingenti",
      "slider": false
    },
    "vel": {"val": 0, "min": 0, "max": 1, "step": 1, "slider": false}
  },
  "state": {"x1": 1.0, "v1": "u1", "x2": 2.6, "v2": "u2", "s": 0},
  "ode": {
    "x1": "v1",
    "v1": "-(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m1",
    "x2": "v2",
    "v2": "(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m2",
    "s": "0"
  },
  "events": [{"when": "x1 - x2 + 0.5 > 0", "set": {"s": 1}, "once": true}],
  "time": {"max": 6, "stopWhen": "x1 < 0.3 || x2 > 3.7 || x1 > 3.7 || x2 < 0.3"},
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
    {
      "id": "A",
      "type": "cart",
      "on": "g",
      "pos": "x1",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m1",
      "label": "A",
      "color": "red1"
    },
    {
      "id": "B",
      "type": "cart",
      "on": "g",
      "pos": "x2",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m2",
      "label": "B",
      "color": "blue"
    },
    {"type": "block", "at": [0.12, 0.42], "size": [0.14, 0.24], "fill": "#999", "label": ""},
    {"type": "block", "at": [3.88, 0.42], "size": [0.14, 0.24], "fill": "#999", "label": ""}
  ],
  "graphs": [
    {
      "y": ["x1", "x2"],
      "legend": ["A", "B"],
      "colors": ["red1", "blue"],
      "label": "Posizione",
      "axisLabels": ["t (s)", "x (m)"],
      "position": "tabs"
    },
    {
      "y": ["v1", "v2"],
      "legend": ["A", "B"],
      "colors": ["red1", "blue"],
      "label": "Velocità",
      "axisLabels": ["t (s)", "v (m/s)"],
      "position": "tabs"
    }
  ],
  "readouts": [
    {"label": "v_A", "value": "v1", "unit": "m/s", "digits": 3},
    {"label": "v_B", "value": "v2", "unit": "m/s", "digits": 3}
  ],
  "controls": [{"type": "toggle", "label": "Velcro", "param": "vel", "on": 1, "off": 0}]
}
```

Questi sono alcuni dei dati raccolti in classe da un gruppo (masse in kg, velocità in m/s, con il verso positivo da A verso B; nell'ultimo urto i carrelli avevano il velcro):

| Esperimento | $m_A$ | $m_B$ | $v_{A,i}$ | $v_{B,i}$ | $v_{A,f}$ | $v_{B,f}$ |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0,512 | 0,510 | 0,515 | 0 | 0 | 0,491 |
| 2 (massa su A) | 1,508 | 0,510 | 0,445 | 0 | 0,228 | 0,679 |
| 2 (massa su B) | 0,512 | 1,508 | 0,516 | 0 | −0,264 | 0,264 |
| 3 (velcro) | 0,512 | 0,510 | 0,370 | −0,338 | 0 | 0 |

Ed ecco le grandezze che abbiamo provato a confrontare prima e dopo l'urto (somme delle velocità in m/s, somme dei prodotti $m\,v$ in kg·m/s):

| Esperimento | $v_A + v_B$ prima | $v_A + v_B$ dopo | $m_Av_A + m_Bv_B$ prima | $m_Av_A + m_Bv_B$ dopo | $K_{\text{dopo}} / K_{\text{prima}}$ |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1 | 0,515 | 0,491 | 0,264 | 0,250 | 0,91 |
| 2 (massa su A) | 0,445 | 0,907 | 0,671 | 0,690 | 1,05 |
| 2 (massa su B) | 0,516 | 0 | 0,264 | 0,263 | 1,03 |
| 3 (velcro) | 0,032 | 0 | 0,017 | 0 | 0 |

- La somma delle velocità «funziona» nell'esperimento 1, con carrelli uguali, ma non regge quando le masse sono diverse.
- La somma dei prodotti $m\,v$ ha lo stesso valore prima e dopo l'urto in tutti gli esperimenti, entro le incertezze di misura, anche quando i carrelli restano attaccati. Il segno delle velocità è essenziale: nell'esperimento 3 i due prodotti, di segno opposto, quasi si annullano già prima dell'urto.
- L'energia cinetica totale, invece, a volte resta la stessa (urti con i respingenti) e a volte no: con il velcro sparisce tutta.

## 2. La quantità di moto

> La **quantità di moto** di un corpo di massa $m$ che si muove con velocità $\vec v$ è il vettore
>
> $$\vec p = m\,\vec v$$
>
> Si misura in $\text{kg}\cdot\text{m/s}$. La quantità di moto di un **sistema** di più corpi è la somma vettoriale delle quantità di moto dei corpi: $\vec p_{\text{tot}} = m_A\vec v_A + m_B\vec v_B + \dots$

Alcune osservazioni.

- $\vec p$ è un vettore con la stessa direzione e lo stesso verso della velocità. In una dimensione è un numero con segno, e il segno dipende dal verso positivo scelto.
- Come la velocità, la quantità di moto dipende dal sistema di riferimento: un carrello fermo rispetto alla rotaia ha quantità di moto nulla per chi sta fermo in laboratorio, ma non per chi gli passa accanto camminando. Bisogna sempre dire rispetto a che cosa si misura.
- Per parlare di conservazione bisogna scegliere un **sistema**: i corpi di cui teniamo la contabilità. Tutto il resto è l'**ambiente**. Un sistema è **isolato** se la somma delle forze esterne che agiscono su di esso è nulla (o trascurabile).

Il risultato del laboratorio si può allora enunciare così.

> **Conservazione della quantità di moto.** La quantità di moto totale di un sistema isolato resta costante:
>
> $$m_A\vec v_{A,i} + m_B\vec v_{B,i} = m_A\vec v_{A,f} + m_B\vec v_{B,f}$$

**Costante o conservata?** Le due parole non sono sinonimi. Durante l'urto la quantità di moto del solo carrello A cambia, quindi per il sistema «A» non è costante; ma quella che A perde la ritroviamo, identica, in B. Una grandezza si dice **conservata** se, quando cambia in un sistema, è perché è passata da o verso l'esterno: non nasce e non sparisce. Scegliendo un sistema abbastanza grande da contenere tutti i corpi che interagiscono, la quantità di moto è costante. La massa è un'altra grandezza conservata; l'energia cinetica, come abbiamo visto con il velcro, no.

## 3. Conservazione della quantità di moto e terzo principio

La conservazione della quantità di moto è un fatto sperimentale, ma non è indipendente da quello che sappiamo della dinamica. Supponiamo che

- i due carrelli si possano trattare come **punti materiali**;
- valga il **secondo principio**, $\vec F = m\vec a$ (quindi ci troviamo in un sistema di riferimento inerziale);
- durante l'urto, che dura $\Delta t$, ciascun carrello eserciti sull'altro una **forza costante** e le forze esterne si bilancino (peso e reazione della rotaia).

Allora l'accelerazione di ciascun carrello è costante, $\vec a = \Delta\vec v/\Delta t$, e il secondo principio dà

$$\vec F_{B\to A} = m_A\,\frac{\Delta\vec v_A}{\Delta t} \qquad\qquad \vec F_{A\to B} = m_B\,\frac{\Delta\vec v_B}{\Delta t}$$

Per il **terzo principio** le due forze sono opposte, $\vec F_{A\to B} = -\vec F_{B\to A}$, quindi

$$m_B\,\frac{\Delta\vec v_B}{\Delta t} = -\,m_A\,\frac{\Delta\vec v_A}{\Delta t} \quad\Longrightarrow\quad m_A\,\Delta\vec v_A + m_B\,\Delta\vec v_B = \vec 0$$

cioè $\Delta\vec p_A + \Delta\vec p_B = \vec 0$: la variazione della quantità di moto totale è nulla. Il ragionamento si può anche percorrere al contrario: se la quantità di moto totale non cambia, in ogni intervallo di tempo $m_A\Delta\vec v_A = -m_B\Delta\vec v_B$, e dividendo per $\Delta t$ si ritrova $\vec F_{A\to B} = -\vec F_{B\to A}$. Nelle condizioni dette, **terzo principio e conservazione della quantità di moto sono equivalenti**.

L'ipotesi della forza costante è la più discutibile: durante l'urto la forza cresce mentre i respingenti si comprimono e poi diminuisce. Ma possiamo dividere l'urto in tanti intervalli brevissimi in cui la forza è quasi costante e applicare il ragionamento a ciascuno: in ogni intervallo la quantità di moto che A perde è quella che B guadagna. Nella simulazione i due grafici delle forze sono uno l'opposto dell'altro, e le due aree tratteggiate, che come vedremo sono le variazioni di quantità di moto dei carrelli, sono uguali e di segno opposto.

```physics
{
  "xlim": [0, 4],
  "ylim": [0, 1.0],
  "aspectRatio": "4:1",
  "params": {
    "m1": {"val": 1.0, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_A"},
    "m2": {"val": 0.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_B"},
    "u1": {"val": 0.5, "min": -0.6, "max": 0.8, "step": 0.05, "unit": "m/s", "label": "v_A iniziale"},
    "u2": {"val": -0.2, "min": -0.8, "max": 0.6, "step": 0.05, "unit": "m/s", "label": "v_B iniziale"},
    "e": {"val": 1.0, "min": 0, "max": 1, "step": 0.05, "label": "elasticità dei respingenti", "slider": false},
    "k": {"val": 50, "min": 40, "max": 600, "step": 10, "unit": "N/m", "label": "rigidità dei respingenti"},
    "vel": {"val": 0, "min": 0, "max": 1, "step": 1, "slider": false}
  },
  "state": {"x1": 1.0, "v1": "u1", "x2": 2.6, "v2": "u2", "s": 0},
  "ode": {
    "x1": "v1",
    "v1": "-(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m1",
    "x2": "v2",
    "v2": "(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m2",
    "s": "0"
  },
  "events": [{"when": "x1 - x2 + 0.5 > 0", "set": {"s": 1}, "once": true}],
  "time": {"max": 5, "stopWhen": "x1 < 0.3 || x2 > 3.7 || x1 > 3.7 || x2 < 0.3"},
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
    {
      "id": "A",
      "type": "cart",
      "on": "g",
      "pos": "x1",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m1",
      "label": "A",
      "color": "red1"
    },
    {
      "id": "B",
      "type": "cart",
      "on": "g",
      "pos": "x2",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m2",
      "label": "B",
      "color": "blue"
    },
    {"type": "momentum", "on": "A", "vec": ["m1*v1", 0], "label": "\\vec p_A", "color": "red1"},
    {"type": "momentum", "on": "B", "vec": ["m2*v2", 0], "label": "\\vec p_B", "color": "blue"},
    {
      "type": "energy",
      "of": ["A", "B"],
      "label": "Quantità di moto",
      "unit": "kg·m/s",
      "digits": 2,
      "bars": [
        {"label": "p_A", "value": "m1*v1", "color": "red1"},
        {"label": "p_B", "value": "m2*v2", "color": "blue"},
        {"label": "p_A+p_B", "value": "m1*v1 + m2*v2", "color": "black"}
      ]
    }
  ],
  "graphs": [
    {
      "y": [
        "(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))",
        "-(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))"
      ],
      "legend": ["forza di A su B", "forza di B su A"],
      "colors": ["blue", "red1"],
      "label": "Forze",
      "axisLabels": ["t (s)", "F (N)"],
      "position": "tabs",
      "fill": [{"curve": 0, "upTo": "now", "hatch": true}, {"curve": 1, "upTo": "now", "hatch": true}]
    },
    {
      "y": ["m1*v1", "m2*v2", "m1*v1 + m2*v2"],
      "legend": ["p_A", "p_B", "p_A + p_B"],
      "colors": ["red1", "blue", "black"],
      "label": "Quantità di moto",
      "axisLabels": ["t (s)", "p (kg·m/s)"],
      "position": "tabs"
    },
    {
      "y": ["v1", "v2"],
      "legend": ["A", "B"],
      "colors": ["red1", "blue"],
      "label": "Velocità",
      "axisLabels": ["t (s)", "v (m/s)"],
      "position": "tabs"
    }
  ],
  "readouts": [{"label": "p_A + p_B", "value": "m1*v1 + m2*v2", "unit": "kg·m/s", "digits": 3}]
}
```

Cambia le masse e le velocità: le forze restano opposte istante per istante, le variazioni di velocità no (il carrello con più massa cambia meno velocità), la quantità di moto totale resta costante anche **durante** l'urto. Rendi i respingenti più rigidi: l'urto dura meno e le forze sono più intense, ma il risultato finale non cambia.

## 4. Forze esterne e impulso

Se sul sistema agisce una forza esterna, la sua quantità di moto cambia. Di quanto?

### Forza costante

Una forza costante $\vec F$ agisce per un intervallo di tempo $\Delta t$ su un corpo di massa $m$, che rispetto a un osservatore si muove con velocità $\vec v_i$. Se $\vec F$ è la somma di tutte le forze sul corpo, per il secondo principio

$$\vec F = m\,\vec a = m\,\frac{\Delta\vec v}{\Delta t} \quad\Longrightarrow\quad \vec F\,\Delta t = m\,\Delta\vec v = \Delta\vec p$$

> L'**impulso** di una forza costante $\vec F$ che agisce per un intervallo di tempo $\Delta t$ è
>
> $$\vec J = \vec F\,\Delta t$$
>
> e coincide con la variazione di quantità di moto che la forza (risultante) produce: $\vec J = \Delta\vec p$. Si misura in $\text{N}\cdot\text{s}$, che equivale a $\text{kg}\cdot\text{m/s}$.

L'impulso dice quanto una forza esterna modifica la quantità di moto del sistema. Conta il prodotto: una forza piccola che agisce a lungo può avere lo stesso effetto di una forza grande che agisce per poco tempo. Nella simulazione l'area tratteggiata nel grafico forza-tempo è l'impulso fino a quell'istante; confrontala con la variazione di quantità di moto.

```physics
{
  "xlim": [0, 6],
  "ylim": [0, 1.3],
  "aspectRatio": "4:1",
  "params": {
    "m": {"val": 0.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m"},
    "F": {"val": 0.4, "min": -0.6, "max": 0.8, "step": 0.05, "unit": "N", "label": "F"},
    "T": {"val": 1.5, "min": 0.25, "max": 3, "step": 0.25, "unit": "s", "label": "Δt (durata della spinta)"},
    "v0": {"val": 0.2, "min": -0.3, "max": 0.5, "step": 0.05, "unit": "m/s", "label": "v iniziale"}
  },
  "state": {"x": 1.5, "v": "v0", "J": 0},
  "ode": {"x": "v", "v": "(t < T ? F : 0)/m", "J": "t < T ? F : 0"},
  "time": {"max": 4, "stopWhen": "x < 0.4 || x > 5.6"},
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
    {
      "id": "A",
      "type": "cart",
      "on": "g",
      "pos": "x",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m",
      "color": "red1"
    },
    {"type": "force", "on": "A", "vec": ["F", 0], "label": "\\vec F", "show": "t < T", "scale": 1.2},
    {
      "type": "momentum",
      "on": "A",
      "vec": ["m*v", 0],
      "at": {"from": "A", "offset": [0, 0.35]},
      "label": "\\vec p",
      "color": "red1",
      "scale": 2.5
    }
  ],
  "readouts": [
    "t",
    {"label": "J = F·Δt (finora)", "value": "J", "unit": "N·s", "digits": 3},
    {"label": "Δp = p − p₀", "value": "m*v - m*v0", "unit": "kg·m/s", "digits": 3}
  ],
  "graphs": [
    {
      "y": "t < T ? F : 0",
      "label": "Forza",
      "axisLabels": ["t (s)", "F (N)"],
      "colors": ["summer6"],
      "position": "tabs",
      "fill": {"upTo": "now", "hatch": true, "signed": true}
    },
    {
      "y": "m*v",
      "label": "Quantità di moto",
      "axisLabels": ["t (s)", "p (kg·m/s)"],
      "colors": ["red1"],
      "position": "tabs"
    }
  ]
}
```

Prova con una forza opposta alla velocità iniziale: l'impulso è negativo e il carrello rallenta. Con quale combinazione di $F$ e $\Delta t$ il carrello si ferma esattamente?

### Forza variabile

Nella maggior parte delle situazioni reali (un urto, un calcio, un salto) la forza cambia durante l'interazione. Si divide allora l'intervallo in tanti intervallini $\Delta t_i$, abbastanza brevi da considerare la forza costante in ciascuno: in ogni intervallino l'impulso è $F_i\,\Delta t_i$, l'area di un rettangolino sotto il grafico forza-tempo. Sommando:

$$J = \sum_i F_i\,\Delta t_i = \text{area sotto il grafico } F\text{-}t$$

esattamente come lo spostamento è l'area sotto il grafico velocità-tempo. La **forza media** è la forza costante che, nello stesso intervallo di tempo, darebbe lo stesso impulso: è l'altezza del rettangolo che ha la stessa area della curva.

$$\vec J = \Delta\vec p = \vec F_{\text{media}}\,\Delta t$$

> [!DETAILS] Per i curiosi: la notazione integrale
> Quando gli intervallini diventano infinitamente piccoli la somma si scrive come un integrale:
>
> $$\vec J = \int_{\Delta t} \vec F(t)\,dt$$
>
> Vedi [[L'integrale: sommare infiniti pezzetti]].

Un carrello va a sbattere contro un respingente a molla fissato a una parete. Il carrello sbiadito ha un respingente molto più rigido. La variazione di quantità di moto è la stessa nei due casi (il carrello torna indietro con la stessa velocità, in modulo), quindi le aree sotto i due grafici sono uguali; con il respingente rigido però l'urto dura meno e la forza massima è molto più grande.

```physics
{
  "xlim": [0, 5],
  "ylim": [0, 1.2],
  "aspectRatio": "4:1",
  "params": {
    "k": {"val": 60, "min": 20, "max": 1000, "step": 10, "unit": "N/m", "label": "rigidità del respingente"},
    "v0": {"val": 0.6, "min": 0.2, "max": 1, "step": 0.05, "unit": "m/s", "label": "v iniziale"}
  },
  "state": {"x": 1.5, "v": "v0"},
  "ode": {"x": "v", "v": "-k*max(0, x - 3.75)/0.5"},
  "time": {"max": 6, "stopWhen": "x < 0.4"},
  "compare": [{"k": 600, "label": "respingente rigido, k = 600 N/m"}],
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
    {"type": "wall", "at": [4.6, 0.3], "height": 0.8, "side": "right"},
    {"type": "spring", "from": [4.6, 0.43], "to": ["max(x + 0.25, 4.0)", 0.43], "coils": 6, "width": 0.12},
    {
      "id": "A",
      "type": "cart",
      "on": "g",
      "pos": "x",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": 0.5,
      "color": "red1"
    },
    {"type": "velocity", "on": "A", "label": "\\vec v"}
  ],
  "readouts": [
    {"label": "F del respingente", "value": "k*max(0, x - 3.75)", "unit": "N", "digits": 2},
    {"label": "p", "value": "0.5*v", "unit": "kg·m/s", "digits": 3}
  ],
  "graphs": [
    {
      "y": "k*max(0, x - 3.75)",
      "label": "Forza del respingente",
      "axisLabels": ["t (s)", "F (N)"],
      "colors": ["summer6"],
      "fill": {"upTo": "now", "hatch": true}
    }
  ]
}
```

È il principio su cui si basano airbag, caschi, scarpe da corsa, materassi per il salto in alto, e il gesto di «accompagnare» una palla mentre la si afferra: a parità di variazione di quantità di moto, allungare la durata dell'interazione riduce la forza.

### Il principio impulso-quantità di moto

Mettendo insieme quanto visto finora otteniamo un unico principio, che vale per un sistema qualsiasi, isolato oppure no.

> **Principio impulso-quantità di moto.** La quantità di moto iniziale di un sistema più l'impulso delle forze esterne che agiscono su di esso è uguale alla quantità di moto finale del sistema:
>
> $$\left(m_A\vec v_{A,i} + m_B\vec v_{B,i} + \dots\right) + \vec F_{\text{est}}\,\Delta t = \left(m_A\vec v_{A,f} + m_B\vec v_{B,f} + \dots\right)$$

Se il sistema è isolato l'impulso esterno è nullo e si ritrova la conservazione. Se una componente dell'impulso esterno è nulla, è costante la componente corrispondente della quantità di moto.

### Diagrammi a barre impulso-quantità di moto

Per tenere la contabilità della quantità di moto senza perdersi nei segni, l'Etkina propone un diagramma a barre:

1. **disegna** la situazione nello stato iniziale e in quello finale, scegli il sistema e un asse con il verso positivo;
2. disegna una **barra per la quantità di moto iniziale** di ogni corpo del sistema (verso l'alto se è positiva, verso il basso se è negativa) e una per quella **finale**; le lunghezze sono solo indicative;
3. se ci sono forze esterne con impulso non nullo, aggiungi una **barra per l'impulso** nella colonna centrale;
4. la somma delle barre a sinistra più quella dell'impulso deve essere uguale alla somma delle barre a destra; **ogni barra diventa un termine dell'equazione**, con il suo segno.

Ecco il diagramma per due carrelli con il velcro che si scontrano e restano attaccati. Il sistema è formato da entrambi i carrelli: non c'è impulso esterno.

```physics
{
  "xlim": [0, 8],
  "ylim": [0, 2.2],
  "aspectRatio": "4:1.1",
  "objects": [
    {"type": "label", "at": [0.2, 2.0], "text": "Prima", "anchor": "left"},
    {"type": "label", "at": [0.2, 0.85], "text": "Dopo", "anchor": "left"},
    {"id": "g1", "type": "ground", "from": [0, 1.2], "to": [8, 1.2]},
    {"id": "g2", "type": "ground", "from": [0, 0.15], "to": [8, 0.15]},
    {
      "id": "A",
      "type": "cart",
      "on": "g1",
      "pos": 2,
      "posUnit": "m",
      "size": [0.9, 0.35],
      "label": "A",
      "color": "red1"
    },
    {"type": "velocity", "on": "A", "vec": [2, 0], "scale": 0.5, "label": ""},
    {
      "id": "B",
      "type": "cart",
      "on": "g1",
      "pos": 5.5,
      "posUnit": "m",
      "size": [0.9, 0.35],
      "label": "B",
      "color": "blue"
    },
    {"type": "velocity", "on": "B", "vec": [-1.4, 0], "scale": 0.5, "label": ""},
    {
      "id": "A2",
      "type": "cart",
      "on": "g2",
      "pos": 3.6,
      "posUnit": "m",
      "size": [0.9, 0.35],
      "label": "A",
      "color": "red1"
    },
    {"type": "velocity", "on": "A2", "vec": [0.3, 0], "scale": 0.5, "label": ""},
    {
      "id": "B2",
      "type": "cart",
      "on": "g2",
      "pos": 4.5,
      "posUnit": "m",
      "size": [0.9, 0.35],
      "label": "B",
      "color": "blue"
    },
    {"type": "velocity", "on": "B2", "vec": [0.3, 0], "scale": 0.5, "label": ""},
    {
      "type": "energy",
      "of": ["A"],
      "label": "Diagramma a barre impulso-quantità di moto (sistema A + B)",
      "unit": "kg·m/s",
      "digits": 1,
      "bars": [
        {"label": "p_{A,i}", "value": 2, "color": "red1"},
        {"label": "p_{B,i}", "value": -1.4, "color": "blue"},
        {"label": "J", "value": 0, "color": "gray"},
        {"label": "p_{A,f}", "value": 0.3, "color": "red1"},
        {"label": "p_{B,f}", "value": 0.3, "color": "blue"}
      ]
    }
  ]
}
```

$$m_A v_{A,i} + m_B v_{B,i} + 0 = m_A v_{A,f} + m_B v_{B,f} \qquad \text{(con } v_{B,i} < 0\text{)}$$

Se invece scegliamo come sistema il solo carrello A, il carrello B fa parte dell'ambiente e il suo effetto compare come impulso (negativo) nella colonna centrale:

```physics
{
  "xlim": [0, 8],
  "ylim": [0, 2.2],
  "aspectRatio": "4:1.1",
  "objects": [
    {"type": "label", "at": [0.2, 2.0], "text": "Prima", "anchor": "left"},
    {"type": "label", "at": [0.2, 0.85], "text": "Dopo", "anchor": "left"},
    {"id": "g1", "type": "ground", "from": [0, 1.2], "to": [8, 1.2]},
    {"id": "g2", "type": "ground", "from": [0, 0.15], "to": [8, 0.15]},
    {
      "id": "A",
      "type": "cart",
      "on": "g1",
      "pos": 2,
      "posUnit": "m",
      "size": [0.9, 0.35],
      "label": "A",
      "color": "red1"
    },
    {"type": "velocity", "on": "A", "vec": [2, 0], "scale": 0.5, "label": ""},
    {
      "id": "B",
      "type": "cart",
      "on": "g1",
      "pos": 5.5,
      "posUnit": "m",
      "size": [0.9, 0.35],
      "label": "B",
      "color": "blue"
    },
    {"type": "velocity", "on": "B", "vec": [-1.4, 0], "scale": 0.5, "label": ""},
    {
      "id": "A2",
      "type": "cart",
      "on": "g2",
      "pos": 3.6,
      "posUnit": "m",
      "size": [0.9, 0.35],
      "label": "A",
      "color": "red1"
    },
    {"type": "velocity", "on": "A2", "vec": [0.3, 0], "scale": 0.5, "label": ""},
    {
      "id": "B2",
      "type": "cart",
      "on": "g2",
      "pos": 4.5,
      "posUnit": "m",
      "size": [0.9, 0.35],
      "label": "B",
      "color": "blue"
    },
    {"type": "velocity", "on": "B2", "vec": [0.3, 0], "scale": 0.5, "label": ""},
    {
      "type": "energy",
      "of": ["A"],
      "label": "Diagramma a barre impulso-quantità di moto (sistema: solo A)",
      "unit": "kg·m/s",
      "digits": 1,
      "bars": [
        {"label": "p_{A,i}", "value": 2, "color": "red1"},
        {"label": "J_{B\\to A}", "value": -1.7, "color": "gray"},
        {"label": "p_{A,f}", "value": 0.3, "color": "red1"}
      ]
    }
  ]
}
```

Lo stesso processo si descrive bene con entrambe le scelte; quale conviene dipende dalla domanda. Se ci interessa la forza tra i carrelli serve il secondo sistema; se vogliamo la velocità finale, il primo, in cui non compaiono forze sconosciute.

## 5. Gli urti

Un **urto** è un'interazione molto breve tra due (o più) corpi a contatto. Durante l'urto le forze che i corpi si scambiano sono molto intense, di solito molto più delle forze esterne (peso non bilanciato, attriti). Poiché l'impulso è il prodotto della forza per la durata, nel brevissimo intervallo dell'urto l'impulso delle forze esterne è trascurabile rispetto alle quantità di moto in gioco.

> Negli urti la quantità di moto totale del sistema dei corpi che si urtano **subito prima** è uguale a quella **subito dopo**, anche se il sistema non è perfettamente isolato, purché le forze esterne siano piccole rispetto a quelle dell'urto.

Una palla da biliardo che urta un'altra palla, con l'attrito del tavolo: nel millesimo di secondo dell'urto l'attrito non fa in tempo a cambiare la quantità di moto in modo apprezzabile. Due automobili che si scontrano: l'attrito delle ruote sull'asfalto conta nei secondi successivi, mentre le auto strisciano, non nei centesimi di secondo dell'impatto.

### Tipi di urti

La quantità di moto si conserva in tutti gli urti; l'energia cinetica no. Gli urti si classificano proprio in base a che cosa succede all'energia cinetica del sistema.

| Urto | Energia cinetica | Che cosa succede | Esempi |
| :--- | :--- | :--- | :--- |
| **elastico** | resta la stessa | i corpi si deformano e poi tornano esattamente come prima | carrelli con respingenti magnetici, palle da biliardo (quasi) |
| **anelastico** | diminuisce | parte dell'energia cinetica diventa energia interna: deformazioni permanenti, riscaldamento, suono | una palla che rimbalza, due auto che si urtano e rimbalzano |
| **completamente anelastico** | diminuisce il più possibile | i corpi restano attaccati e si muovono insieme | carrelli con il velcro, un proiettile che si conficca in un blocco |

Nella simulazione puoi cambiare l'elasticità dei respingenti o attivare il velcro. Il primo riquadro sotto la scena mostra le quantità di moto, il secondo l'energia: $K$ è l'energia cinetica dei due carrelli, $U_{el}$ l'energia immagazzinata nei respingenti compressi, $E_{\text{int}}$ l'energia diventata interna. Durante un urto elastico l'energia cinetica cala per un istante, ma poi i respingenti la restituiscono tutta.

```physics
{
  "xlim": [0, 4],
  "ylim": [0, 1.0],
  "aspectRatio": "4:1",
  "params": {
    "m1": {"val": 0.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_A"},
    "m2": {"val": 1.0, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_B"},
    "u1": {"val": 0.6, "min": -0.6, "max": 0.8, "step": 0.05, "unit": "m/s", "label": "v_A iniziale"},
    "u2": {"val": 0.0, "min": -0.8, "max": 0.6, "step": 0.05, "unit": "m/s", "label": "v_B iniziale"},
    "e": {"val": 1.0, "min": 0, "max": 1, "step": 0.05, "label": "elasticità dei respingenti"},
    "k": {
      "val": 120,
      "min": 40,
      "max": 600,
      "step": 10,
      "unit": "N/m",
      "label": "rigidità dei respingenti",
      "slider": false
    },
    "vel": {"val": 0, "min": 0, "max": 1, "step": 1, "slider": false}
  },
  "state": {"x1": 1.0, "v1": "u1", "x2": 2.6, "v2": "u2", "s": 0},
  "ode": {
    "x1": "v1",
    "v1": "-(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m1",
    "x2": "v2",
    "v2": "(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m2",
    "s": "0"
  },
  "events": [{"when": "x1 - x2 + 0.5 > 0", "set": {"s": 1}, "once": true}],
  "time": {"max": 5, "stopWhen": "x1 < 0.3 || x2 > 3.7 || x1 > 3.7 || x2 < 0.3"},
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
    {
      "id": "A",
      "type": "cart",
      "on": "g",
      "pos": "x1",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m1",
      "label": "A",
      "color": "red1"
    },
    {
      "id": "B",
      "type": "cart",
      "on": "g",
      "pos": "x2",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m2",
      "label": "B",
      "color": "blue"
    },
    {"type": "momentum", "on": "A", "vec": ["m1*v1", 0], "label": "\\vec p_A", "color": "red1"},
    {"type": "momentum", "on": "B", "vec": ["m2*v2", 0], "label": "\\vec p_B", "color": "blue"},
    {
      "type": "energy",
      "of": ["A", "B"],
      "label": "Quantità di moto",
      "unit": "kg·m/s",
      "digits": 2,
      "bars": [
        {"label": "p_A", "value": "m1*v1", "color": "red1"},
        {"label": "p_B", "value": "m2*v2", "color": "blue"},
        {"label": "p_A+p_B", "value": "m1*v1 + m2*v2", "color": "black"}
      ]
    },
    {
      "type": "energy",
      "of": ["A", "B"],
      "label": "Energia",
      "unit": "J",
      "digits": 3,
      "bars": [
        {"label": "K", "value": "0.5*m1*v1^2 + 0.5*m2*v2^2", "color": "summer2"},
        {"label": "U_{el}", "value": "(x1 - x2 + 0.5 > 0 ? 0.5*k*(x1 - x2 + 0.5)^2 : 0)", "color": "summer4"},
        {
          "label": "E_{int}",
          "value": "max(0, 0.5*m1*u1^2 + 0.5*m2*u2^2 - (0.5*m1*v1^2 + 0.5*m2*v2^2) - (x1 - x2 + 0.5 > 0 ? 0.5*k*(x1 - x2 + 0.5)^2 : 0))",
          "color": "summer6"
        }
      ]
    }
  ],
  "graphs": [
    {
      "y": ["v1", "v2"],
      "legend": ["A", "B"],
      "colors": ["red1", "blue"],
      "label": "Velocità",
      "axisLabels": ["t (s)", "v (m/s)"],
      "position": "tabs"
    },
    {
      "y": ["m1*v1", "m2*v2", "m1*v1 + m2*v2"],
      "legend": ["p_A", "p_B", "p_A + p_B"],
      "colors": ["red1", "blue", "black"],
      "label": "Quantità di moto",
      "axisLabels": ["t (s)", "p (kg·m/s)"],
      "position": "tabs"
    }
  ],
  "readouts": [{"label": "K dopo / K prima", "value": "(m1*v1^2 + m2*v2^2)/(m1*u1^2 + m2*u2^2)", "digits": 2}],
  "controls": [{"type": "toggle", "label": "Velcro", "param": "vel", "on": 1, "off": 0}]
}
```

Perché si dice che nell'urto completamente anelastico l'energia cinetica diminuisce «il più possibile»? Dopo l'urto la quantità di moto del sistema deve essere quella di prima, quindi i corpi non possono fermarsi entrambi (a meno che la quantità di moto totale fosse nulla). Il modo di avere quella quantità di moto con la minima energia cinetica è che si muovano insieme, con la stessa velocità.

### Come affrontare un problema sugli urti

Non servono formule speciali per gli urti: bastano il principio impulso-quantità di moto e, se serve, l'energia. Conviene procedere per passi.

1. **Schizzo e traduzione.** Disegna lo stato iniziale (subito prima dell'urto) e lo stato finale (subito dopo), scegli il sistema, il riferimento e il verso positivo. Scrivi i dati con il loro segno.
2. **Semplifica e rappresenta.** Decidi se le forze esterne si possono trascurare. Disegna il diagramma a barre della quantità di moto; se il problema riguarda l'energia, anche quello dell'energia.
3. **Rappresentazione matematica.** Trasforma ogni barra in un termine dell'equazione.
4. **Risolvi e valuta.** Controlla unità, segni e casi limite: il risultato ha senso? Che cosa succede se una delle masse è molto grande?

**Esempio: un urto con il velcro.** Il carrello A ($m_A = 1{,}0 \text{ kg}$) si muove a $0{,}40 \text{ m/s}$ verso destra, il carrello B ($m_B = 0{,}50 \text{ kg}$) a $0{,}20 \text{ m/s}$ verso sinistra. Si urtano e restano attaccati. Con il verso positivo verso destra e il sistema A + B, il diagramma a barre ha una barra iniziale positiva (A), una negativa più corta (B), nessun impulso, e due barre finali positive con lo stesso rapporto delle masse (stessa velocità finale). L'equazione è

$$m_A v_{A,i} + m_B v_{B,i} = (m_A + m_B)\,v_f \quad\Longrightarrow\quad v_f = \frac{(1{,}0)(0{,}40) + (0{,}50)(-0{,}20)}{1{,}5} \text{ m/s} = 0{,}20 \text{ m/s}$$

verso destra. L'energia cinetica passa da $0{,}090 \text{ J}$ a $0{,}030 \text{ J}$: due terzi sono diventati energia interna. Controllo: se $m_A$ fosse enorme, $v_f$ si avvicinerebbe a $v_{A,i}$, come ci si aspetta.

### Gli urti elastici e il riferimento del centro di massa

In un urto elastico le incognite sono due (le velocità finali) e le equazioni pure: conservazione della quantità di moto e conservazione dell'energia cinetica. Risolvere il sistema è laborioso, ma c'è un modo molto più elegante di guardare le cose: cambiare sistema di riferimento.

Il **centro di massa** dei due carrelli (lo studieremo nel paragrafo 7) si muove con la velocità

$$v_{CM} = \frac{m_A v_A + m_B v_B}{m_A + m_B} = \frac{p_{\text{tot}}}{m_A + m_B}$$

che in un urto non cambia, perché non cambia $p_{\text{tot}}$. Nel riferimento che si muove insieme al centro di massa la quantità di moto totale è nulla: i due carrelli si vengono incontro con quantità di moto opposte e, dopo l'urto, si allontanano con quantità di moto ancora opposte. Se l'urto è elastico l'energia cinetica deve restare la stessa, e l'unica possibilità è che **ogni carrello rimbalzi con la stessa velocità, in modulo, con cui era arrivato**: nel riferimento del centro di massa un urto elastico si limita a invertire le velocità.

Prova con il pulsante «Riferimento»: nel riferimento del centro di massa il punto CM resta fermo e i due carrelli rimbalzano come contro un muro.

```physics
{
  "xlim": [0, 6],
  "ylim": [0, 1.0],
  "aspectRatio": "5:1",
  "params": {
    "m1": {"val": 1.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_A"},
    "m2": {"val": 0.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_B"},
    "u1": {"val": 0.5, "min": -0.6, "max": 0.8, "step": 0.05, "unit": "m/s", "label": "v_A iniziale"},
    "u2": {"val": -0.2, "min": -0.8, "max": 0.6, "step": 0.05, "unit": "m/s", "label": "v_B iniziale"},
    "e": {"val": 1.0, "min": 0, "max": 1, "step": 0.05, "label": "elasticità dei respingenti"},
    "k": {
      "val": 120,
      "min": 40,
      "max": 600,
      "step": 10,
      "unit": "N/m",
      "label": "rigidità dei respingenti",
      "slider": false
    },
    "vel": {"val": 0, "min": 0, "max": 1, "step": 1, "slider": false}
  },
  "state": {"x1": 1.0, "v1": "u1", "x2": 2.6, "v2": "u2", "s": 0},
  "ode": {
    "x1": "v1",
    "v1": "-(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m1",
    "x2": "v2",
    "v2": "(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m2",
    "s": "0"
  },
  "events": [{"when": "x1 - x2 + 0.5 > 0", "set": {"s": 1}, "once": true}],
  "time": {"max": 6, "stopWhen": "x1 < 0.3 || x2 > 5.7 || x1 > 5.7 || x2 < 0.3"},
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
    {
      "id": "A",
      "type": "cart",
      "on": "g",
      "pos": "x1",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m1",
      "label": "A",
      "color": "red1"
    },
    {
      "id": "B",
      "type": "cart",
      "on": "g",
      "pos": "x2",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m2",
      "label": "B",
      "color": "blue"
    },
    {
      "id": "G",
      "type": "particle",
      "at": ["(m1*x1 + m2*x2)/(m1 + m2)", 0.75],
      "radius": 4,
      "label": "CM",
      "color": "black"
    },
    {"type": "path", "points": [[0, 0.75], [6, 0.75]], "dash": "2 5", "opacity": 0.4},
    {"type": "velocity", "on": "A", "label": "\\vec v_A", "color": "red1"},
    {"type": "velocity", "on": "B", "label": "\\vec v_B", "color": "blue"}
  ],
  "readouts": [{"label": "v_CM", "value": "(m1*v1 + m2*v2)/(m1 + m2)", "unit": "m/s", "digits": 3}],
  "controls": [{"type": "frame-toggle", "label": "Riferimento"}],
  "frames": {"laboratorio": null, "centro di massa": "G"}
}
```

Da qui si ricavano le velocità finali in tre passi, senza formule da ricordare.

1. Calcola $v_{CM}$.
2. Passa al riferimento del centro di massa: $u_A = v_{A,i} - v_{CM}$ (e lo stesso per B).
3. Inverti e torna indietro: $v_{A,f} = v_{CM} - u_A = 2\,v_{CM} - v_{A,i}$.

Per esempio, con $m_A = 0{,}50 \text{ kg}$ a $0{,}60 \text{ m/s}$ contro $m_B = 1{,}0 \text{ kg}$ fermo: $v_{CM} = 0{,}20 \text{ m/s}$, quindi $v_{A,f} = 0{,}40 - 0{,}60 = -0{,}20 \text{ m/s}$ (A torna indietro) e $v_{B,f} = 0{,}40 - 0 = 0{,}40 \text{ m/s}$. Verifica: la quantità di moto è $0{,}30 \text{ kg}\cdot\text{m/s}$ prima e dopo, l'energia cinetica $0{,}090 \text{ J}$ prima e dopo.

> [!DETAILS] Approfondimento: urti né elastici né completamente anelastici
> Nel riferimento del centro di massa un urto qualunque riduce le velocità dei due corpi, invertendole, sempre dello stesso fattore $e$ (il **coefficiente di restituzione**), compreso tra $0$ e $1$: $e = 1$ è l'urto elastico, $e = 0$ quello completamente anelastico. Tornando nel riferimento del laboratorio:
>
> $$v_{A,f} = v_{CM} - e\,(v_{A,i} - v_{CM}) \qquad v_{B,f} = v_{CM} - e\,(v_{B,i} - v_{CM})$$
>
> Per una palla che rimbalza sul pavimento (che ha massa enorme e resta ferma) $e$ è il rapporto tra le velocità subito dopo e subito prima del rimbalzo, e l'altezza raggiunta dopo ogni rimbalzo si riduce del fattore $e^2$.

## 6. Urti in due dimensioni

La quantità di moto è un vettore, e la sua conservazione vale per il vettore: quindi per ciascuna componente separatamente.

$$p_{x,\text{prima}} = p_{x,\text{dopo}} \qquad\qquad p_{y,\text{prima}} = p_{y,\text{dopo}}$$

Nella simulazione due dischi scivolano senza attrito su un piano (come su un tavolo ad aria), visti dall'alto. Il disco A colpisce B, fermo, non al centro: il **parametro d'urto** è la distanza tra la retta su cui si muove A e il centro di B. In basso a destra le quantità di moto dei due dischi sono disegnate una dopo l'altra (punta-coda): la loro somma, in nero, non cambia mai.

```physics
{
  "plane": "horizontal",
  "xlim": [-1.6, 1.6],
  "ylim": [-0.8, 0.8],
  "aspectRatio": "2:1",
  "params": {
    "m1": {"val": 0.2, "min": 0.1, "max": 0.6, "step": 0.05, "unit": "kg", "label": "m_A"},
    "m2": {"val": 0.2, "min": 0.1, "max": 0.6, "step": 0.05, "unit": "kg", "label": "m_B"},
    "u": {"val": 0.8, "min": 0.2, "max": 1, "step": 0.05, "unit": "m/s", "label": "v_A iniziale"},
    "b": {"val": 0.12, "min": 0, "max": 0.3, "step": 0.01, "unit": "m", "label": "parametro d'urto"},
    "e": {"val": 1.0, "min": 0, "max": 1, "step": 0.05, "label": "elasticità"},
    "k": {"val": 400, "min": 100, "max": 2000, "step": 50, "slider": false}
  },
  "state": {"x1": -1.2, "y1": "-b", "vx1": "u", "vy1": 0, "x2": 0, "y2": 0, "vx2": 0, "vy2": 0},
  "ode": {
    "x1": "vx1",
    "y1": "vy1",
    "x2": "vx2",
    "y2": "vy2",
    "vx1": "-((2*0.15 - sqrt((x2 - x1)^2 + (y2 - y1)^2)) > 0 ? max(0, k*(2*0.15 - sqrt((x2 - x1)^2 + (y2 - y1)^2)) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*((vx1 - vx2)*(x2 - x1) + (vy1 - vy2)*(y2 - y1))/sqrt((x2 - x1)^2 + (y2 - y1)^2)) : 0)*(x2 - x1)/sqrt((x2 - x1)^2 + (y2 - y1)^2)/m1",
    "vy1": "-((2*0.15 - sqrt((x2 - x1)^2 + (y2 - y1)^2)) > 0 ? max(0, k*(2*0.15 - sqrt((x2 - x1)^2 + (y2 - y1)^2)) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*((vx1 - vx2)*(x2 - x1) + (vy1 - vy2)*(y2 - y1))/sqrt((x2 - x1)^2 + (y2 - y1)^2)) : 0)*(y2 - y1)/sqrt((x2 - x1)^2 + (y2 - y1)^2)/m1",
    "vx2": "((2*0.15 - sqrt((x2 - x1)^2 + (y2 - y1)^2)) > 0 ? max(0, k*(2*0.15 - sqrt((x2 - x1)^2 + (y2 - y1)^2)) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*((vx1 - vx2)*(x2 - x1) + (vy1 - vy2)*(y2 - y1))/sqrt((x2 - x1)^2 + (y2 - y1)^2)) : 0)*(x2 - x1)/sqrt((x2 - x1)^2 + (y2 - y1)^2)/m2",
    "vy2": "((2*0.15 - sqrt((x2 - x1)^2 + (y2 - y1)^2)) > 0 ? max(0, k*(2*0.15 - sqrt((x2 - x1)^2 + (y2 - y1)^2)) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*((vx1 - vx2)*(x2 - x1) + (vy1 - vy2)*(y2 - y1))/sqrt((x2 - x1)^2 + (y2 - y1)^2)) : 0)*(y2 - y1)/sqrt((x2 - x1)^2 + (y2 - y1)^2)/m2"
  },
  "time": {"max": 4, "stopWhen": "abs(x1) > 1.6 || abs(y1) > 0.8 || abs(x2) > 1.6 || abs(y2) > 0.8"},
  "objects": [
    {
      "id": "A",
      "type": "ball",
      "at": ["x1", "y1"],
      "radius": 0.15,
      "mass": "m1",
      "label": "A",
      "color": "red1"
    },
    {
      "id": "B",
      "type": "ball",
      "at": ["x2", "y2"],
      "radius": 0.15,
      "mass": "m2",
      "label": "B",
      "color": "blue"
    },
    {"type": "trace", "of": "A", "dash": "2 4"},
    {"type": "trace", "of": "B", "dash": "2 4"},
    {
      "id": "pA",
      "type": "momentum",
      "on": "A",
      "vec": ["m1*vx1", "m1*vy1"],
      "label": "\\vec p_A",
      "color": "red1",
      "scale": 1.5
    },
    {
      "id": "pB",
      "type": "momentum",
      "on": "B",
      "vec": ["m2*vx2", "m2*vy2"],
      "label": "\\vec p_B",
      "color": "blue",
      "scale": 1.5
    },
    {"type": "label", "at": [1.0, -0.42], "text": "somma"},
    {
      "id": "sA",
      "type": "momentum",
      "at": [0.8, -0.65],
      "vec": ["m1*vx1", "m1*vy1"],
      "color": "red1",
      "scale": 1.5,
      "label": ""
    },
    {
      "type": "momentum",
      "at": "sA.tip",
      "vec": ["m2*vx2", "m2*vy2"],
      "color": "blue",
      "scale": 1.5,
      "label": ""
    },
    {
      "type": "momentum",
      "at": [0.8, -0.65],
      "vec": ["m1*vx1 + m2*vx2", "m1*vy1 + m2*vy2"],
      "color": "black",
      "scale": 1.5,
      "width": 1.5,
      "label": "\\vec p_{tot}"
    }
  ],
  "readouts": [
    {"label": "p_x totale", "value": "m1*vx1 + m2*vx2", "unit": "kg·m/s", "digits": 3},
    {"label": "p_y totale", "value": "m1*vy1 + m2*vy2", "unit": "kg·m/s", "digits": 3},
    {"label": "K dopo / K prima", "value": "(m1*(vx1^2 + vy1^2) + m2*(vx2^2 + vy2^2))/(m1*u^2)", "digits": 2}
  ]
}
```

Due cose da osservare.

- Le componenti $p_x$ e $p_y$ totali restano costanti; in particolare $p_y$ resta nullo: le componenti verticali delle quantità di moto finali sono opposte.
- Con masse uguali e urto elastico, i due dischi si allontanano lungo direzioni **perpendicolari** (prova a dimostrarlo: le tre quantità di moto formano un triangolo, e la conservazione dell'energia cinetica diventa il teorema di Pitagora). Con l'urto anelastico l'angolo è minore di $90°$.

Per un urto in due dimensioni il diagramma a barre si fa separatamente per le componenti $x$ e $y$. Oppure si può disegnare il triangolo delle quantità di moto: nel grafico qui sotto la quantità di moto iniziale di A (nera) è fissa; trascina il punto rosso per scegliere la quantità di moto finale di A, e il grafico disegna quella di B che serve per conservare la quantità di moto totale.

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-0.5, 3.9],
  "ylim": [-1.5, 1.8],
  "xStep": 1,
  "yStep": 1,
  "axisLabels": ["px", "py"],
  "data": [
    {"points": [[0, 0]], "name": "O", "radius": 3, "color": "black"},
    {"points": [[3, 0]], "name": "E", "radius": 3, "color": "black"},
    {"vector": ["O", "E"], "color": "black", "width": 2, "label": "$\\vec p_{A,i}$", "labelAt": [2.5, -0.3]},
    {"points": [[1.6, 1.2]], "freeCoordinates": true, "name": "Q", "radius": 7, "snap": 0.1, "color": "red1"},
    {"vector": ["O", "Q"], "name": "a", "color": "red1", "label": "$\\vec p_{A,f}$"},
    {"vector": ["Q", "E"], "name": "c", "color": "blue", "label": "$\\vec p_{B,f}$"}
  ]
}
```

## 7. Il centro di massa

Per un sistema di due corpi su una retta, il **centro di massa** è il punto di coordinata

$$x_{CM} = \frac{m_A\,x_A + m_B\,x_B}{m_A + m_B}$$

cioè la media delle posizioni, pesata con le masse. È più vicino al corpo con massa maggiore; se le masse sono uguali è nel punto medio. Nel piano si fa lo stesso per entrambe le coordinate, e con più corpi si sommano tutti i termini: $x_{CM} = \dfrac{\sum_i m_i x_i}{\sum_i m_i}$.

### Il centro di massa di un sistema isolato si muove a velocità costante

**Dimostrazione.** In un intervallo di tempo $\Delta t$ i due corpi si spostano di $\Delta x_A$ e $\Delta x_B$; le masse non cambiano, quindi il centro di massa si sposta di

$$\Delta x_{CM} = \frac{m_A\,\Delta x_A + m_B\,\Delta x_B}{m_A + m_B}$$

Dividendo per $\Delta t$ (e prendendo $\Delta t$ piccolissimo, per avere le velocità istantanee):

$$v_{CM} = \frac{m_A\,v_A + m_B\,v_B}{m_A + m_B} = \frac{p_{\text{tot}}}{M}$$

dove $M = m_A + m_B$ è la massa totale. **La quantità di moto totale di un sistema è quella che avrebbe un unico corpo, con tutta la massa del sistema, che si muovesse insieme al centro di massa:** $p_{\text{tot}} = M\,v_{CM}$. Se il sistema è isolato $p_{\text{tot}}$ è costante, e $M$ pure: quindi $v_{CM}$ è costante. $\blacksquare$

Il centro di massa di un sistema isolato si muove di moto rettilineo uniforme, qualunque cosa succeda all'interno del sistema: urti elastici o anelastici, esplosioni, molle che si distendono. Nella simulazione le copie del centro di massa, una ogni mezzo secondo, sono equidistanti prima, durante e dopo l'urto, e nel grafico la posizione del centro di massa è una retta.

```physics
{
  "xlim": [0, 6],
  "ylim": [0, 1.0],
  "aspectRatio": "5:1",
  "params": {
    "m1": {"val": 0.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_A"},
    "m2": {"val": 1.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_B"},
    "u1": {"val": 0.7, "min": -0.6, "max": 0.8, "step": 0.05, "unit": "m/s", "label": "v_A iniziale"},
    "u2": {"val": -0.1, "min": -0.8, "max": 0.6, "step": 0.05, "unit": "m/s", "label": "v_B iniziale"},
    "e": {"val": 0.6, "min": 0, "max": 1, "step": 0.05, "label": "elasticità dei respingenti"},
    "k": {
      "val": 120,
      "min": 40,
      "max": 600,
      "step": 10,
      "unit": "N/m",
      "label": "rigidità dei respingenti",
      "slider": false
    },
    "vel": {"val": 0, "min": 0, "max": 1, "step": 1, "slider": false}
  },
  "state": {"x1": 1.0, "v1": "u1", "x2": 2.6, "v2": "u2", "s": 0},
  "ode": {
    "x1": "v1",
    "v1": "-(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m1",
    "x2": "v2",
    "v2": "(s*vel > 0.5 ? k*(x1 - x2 + 0.5) + 2*sqrt(k*m1*m2/(m1+m2))*(v1 - v2) : ((x1 - x2 + 0.5) > 0 ? max(0, k*(x1 - x2 + 0.5) + 2*(-ln(max(e,0.001))/sqrt(pi^2 + ln(max(e,0.001))^2))*sqrt(k*m1*m2/(m1+m2))*(v1 - v2)) : 0))/m2",
    "s": "0"
  },
  "events": [{"when": "x1 - x2 + 0.5 > 0", "set": {"s": 1}, "once": true}],
  "time": {"max": 6, "stopWhen": "x1 < 0.3 || x2 > 5.7 || x1 > 5.7 || x2 < 0.3"},
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
    {
      "id": "A",
      "type": "cart",
      "on": "g",
      "pos": "x1",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m1",
      "label": "A",
      "color": "red1"
    },
    {
      "id": "B",
      "type": "cart",
      "on": "g",
      "pos": "x2",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m2",
      "label": "B",
      "color": "blue"
    },
    {"type": "momentum", "on": "A", "vec": ["m1*v1", 0], "label": "\\vec p_A", "color": "red1"},
    {"type": "momentum", "on": "B", "vec": ["m2*v2", 0], "label": "\\vec p_B", "color": "blue"},
    {
      "id": "G",
      "type": "particle",
      "at": ["(m1*x1 + m2*x2)/(m1 + m2)", 0.75],
      "radius": 4,
      "label": "CM",
      "color": "black"
    },
    {"type": "path", "points": [[0, 0.75], [6, 0.75]], "dash": "2 5", "opacity": 0.4},
    {"type": "ghosts", "of": "G", "every": 0.5, "opacity": 0.5}
  ],
  "graphs": [
    {
      "y": ["x1", "x2", "(m1*x1 + m2*x2)/(m1 + m2)"],
      "legend": ["A", "B", "centro di massa"],
      "colors": ["red1", "blue", "black"],
      "label": "Posizione",
      "axisLabels": ["t (s)", "x (m)"]
    }
  ],
  "controls": [{"type": "toggle", "label": "Velcro", "param": "vel", "on": 1, "off": 0}]
}
```

Un caso particolare: due carrelli fermi, spinti in versi opposti da una molla compressa tra loro (un'«esplosione»). La quantità di moto totale è nulla prima e resta nulla dopo, quindi il centro di massa resta fermo, anche se i carrelli si allontanano con velocità diverse.

```physics
{
  "xlim": [0, 6],
  "ylim": [0, 1.2],
  "aspectRatio": "5:1",
  "params": {
    "m1": {"val": 0.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_A"},
    "m2": {"val": 1.5, "min": 0.25, "max": 2, "step": 0.25, "unit": "kg", "label": "m_B"}
  },
  "state": {"x1": 2.8, "v1": 0, "x2": 3.4, "v2": 0},
  "ode": {
    "x1": "v1",
    "x2": "v2",
    "v1": "-(x2 - x1 < 0.7 ? 60*(0.7 - (x2 - x1)) : 0)/m1",
    "v2": "(x2 - x1 < 0.7 ? 60*(0.7 - (x2 - x1)) : 0)/m2"
  },
  "time": {"max": 5, "stopWhen": "x1 < 0.4 || x2 > 5.6"},
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
    {
      "id": "A",
      "type": "cart",
      "on": "g",
      "pos": "x1",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m1",
      "label": "A",
      "color": "red1"
    },
    {
      "id": "B",
      "type": "cart",
      "on": "g",
      "pos": "x2",
      "posUnit": "m",
      "size": [0.5, 0.25],
      "mass": "m2",
      "label": "B",
      "color": "blue"
    },
    {
      "type": "spring",
      "from": ["x1 + 0.25", 0.43],
      "to": ["x2 - 0.25", 0.43],
      "coils": 5,
      "width": 0.1,
      "show": "x2 - x1 < 0.7"
    },
    {"type": "momentum", "on": "A", "vec": ["m1*v1", 0], "label": "\\vec p_A", "color": "red1"},
    {"type": "momentum", "on": "B", "vec": ["m2*v2", 0], "label": "\\vec p_B", "color": "blue"},
    {
      "id": "G",
      "type": "particle",
      "at": ["(m1*x1 + m2*x2)/(m1 + m2)", 0.8],
      "radius": 4,
      "label": "CM",
      "color": "black"
    },
    {"type": "ghosts", "of": "A", "every": 0.5, "opacity": 0.25},
    {"type": "ghosts", "of": "B", "every": 0.5, "opacity": 0.25}
  ],
  "readouts": [
    {"label": "p_A + p_B", "value": "m1*v1 + m2*v2", "unit": "kg·m/s", "digits": 3},
    {"label": "x_CM", "value": "(m1*x1 + m2*x2)/(m1 + m2)", "unit": "m", "digits": 3}
  ]
}
```

> **E se il sistema non è isolato?** Il principio impulso-quantità di moto dice che $\vec F_{\text{est}}\,\Delta t = \Delta\vec p_{\text{tot}} = M\,\Delta\vec v_{CM}$, cioè $\vec F_{\text{est}} = M\,\vec a_{CM}$: il centro di massa si muove come un punto materiale con tutta la massa del sistema, sottoposto alla somma delle sole forze esterne. Per questo il centro di massa di un tuffatore descrive una parabola, per quanto il tuffatore si contorca durante il salto, e quello dei frammenti di un fuoco d'artificio continua sulla parabola del razzo anche dopo l'esplosione.

## Riepilogo

| Concetto | Espressione | Note |
| :--- | :--- | :--- |
| quantità di moto | $\vec p = m\,\vec v$ | vettore; dipende dal riferimento |
| impulso (forza costante) | $\vec J = \vec F\,\Delta t$ | si misura in $\text{N}\cdot\text{s} = \text{kg}\cdot\text{m/s}$ |
| impulso (forza variabile) | $J$ = area sotto il grafico $F$-$t$ $= F_{\text{media}}\,\Delta t$ | |
| principio impulso-quantità di moto | $\vec p_i + \vec J_{\text{est}} = \vec p_f$ | per qualunque sistema |
| conservazione | $\vec p_i = \vec p_f$ | sistema isolato, oppure urti (forze esterne trascurabili) |
| urto elastico | $K_i = K_f$ | nel riferimento del CM le velocità si invertono |
| urto completamente anelastico | velocità finale comune | massima perdita di energia cinetica |
| centro di massa | $x_{CM} = \dfrac{\sum m_i x_i}{\sum m_i}$, $\quad \vec p_{\text{tot}} = M\vec v_{CM}$ | velocità costante se il sistema è isolato |
