---
title: "L'integrale: sommare infiniti pezzetti"
feed: show
tags:
  - integrale
  - analisi
  - approfondimento
---
In fisica ci siamo imbattuti più volte nello stesso problema: conosciamo una grandezza che **cambia nel tempo** e vogliamo sapere quanto vale il suo «effetto accumulato». Dalla velocità vogliamo lo spostamento, dall'accelerazione la variazione di velocità, dalla forza l'impulso. Se la grandezza fosse costante basterebbe una moltiplicazione; poiché non lo è, si ricorre a un'idea molto antica: **tagliare il problema in tanti pezzetti in cui la grandezza è quasi costante, e sommarli**. Quando i pezzetti diventano infinitamente piccoli, quella somma si chiama **integrale**.

Questa pagina è un approfondimento per chi è curioso: non serve per seguire le lezioni di fisica, ma spiega da dove vengono il simbolo $\int$ che compare nel [[Ripasso essenziale di cinematica]] e nella pagina [[Quantità di moto, impulso e urti]], e che cosa c'è dietro.

## 1. Il problema dell'area

Un carrello si muove con velocità costante $v = 3 \text{ m/s}$ per $\Delta t = 4 \text{ s}$: lo spostamento è $\Delta s = v\,\Delta t = 12 \text{ m}$, l'area di un rettangolo di base $4$ e altezza $3$ sotto il grafico velocità-tempo.

Se la velocità cambia, il grafico non è più un segmento orizzontale e la regione sotto di esso non è un rettangolo. Ma possiamo **dividere l'intervallo di tempo in tanti intervallini**, così brevi che in ciascuno la velocità è quasi costante. In ogni intervallino lo spostamento è circa «velocità per durata», cioè l'area di un rettangolino; sommando i rettangolini otteniamo una stima dello spostamento totale. Più gli intervallini sono stretti, migliore è la stima.

Lo stesso ragionamento vale per qualunque grandezza «accumulata»: l'area sotto il grafico forza-tempo è l'impulso, quella sotto il grafico accelerazione-tempo la variazione di velocità.

## 2. Somme di rettangoli

Prendiamo un caso semplice da controllare: la funzione $f(x) = x^2$ sull'intervallo da $0$ a $1$. Dividiamo l'intervallo in $n$ parti uguali, larghe $\Delta x = \frac1n$, e in ciascuna costruiamo un rettangolo.

- Se l'altezza è il valore di $f$ nell'**estremo sinistro** di ogni intervallino, i rettangoli stanno tutti sotto la curva (che è crescente): la loro somma $s_n$ è un'approssimazione **per difetto** dell'area.
- Se l'altezza è il valore nell'**estremo destro**, i rettangoli sporgono sopra la curva: la somma $S_n$ è un'approssimazione **per eccesso**.

Muovi gli slider e osserva le somme scritte in alto a sinistra.

```matephis
{
  "aspectRatio": "3:2",
  "xlim": [-0.1, 1.15],
  "ylim": [-0.08, 1.15],
  "xStep": 0.25,
  "yStep": 0.25,
  "params": {"n": {"val": 4, "min": 1, "max": 100, "step": 1, "label": "n"}},
  "data": [
    {
      "fn": "x^2",
      "domain": [0, 1.1],
      "color": "blue",
      "riemann": {"n": "n", "range": [0, 1], "rule": "left", "showValue": true, "valueLabel": "s_n", "digits": 4}
    }
  ]
}
```

```matephis
{
  "aspectRatio": "3:2",
  "xlim": [-0.1, 1.15],
  "ylim": [-0.08, 1.15],
  "xStep": 0.25,
  "yStep": 0.25,
  "params": {"n": {"val": 4, "min": 1, "max": 100, "step": 1, "label": "n"}},
  "data": [
    {
      "fn": "x^2",
      "domain": [0, 1.1],
      "color": "blue",
      "riemann": {
        "n": "n",
        "range": [0, 1],
        "rule": "right",
        "showValue": true,
        "valueLabel": "S_n",
        "digits": 4,
        "color": "summer6"
      }
    }
  ]
}
```

| $n$ | $s_n$ (sinistra) | $S_n$ (destra) | punto medio |
| ---: | ---: | ---: | ---: |
| 1 | 0 | 1 | 0,25 |
| 2 | 0,125 | 0,625 | 0,3125 |
| 4 | 0,21875 | 0,46875 | 0,328125 |
| 10 | 0,285 | 0,385 | 0,3325 |
| 100 | 0,32835 | 0,33835 | 0,333325 |
| 1000 | 0,332834 | 0,333834 | 0,333333 |

L'area cercata è sempre compresa tra $s_n$ e $S_n$. Ma la differenza tra le due somme è l'area di un solo rettangolo, quello più alto, largo $\frac1n$ e alto $1$: $S_n - s_n = \frac1n$, che diventa piccola quanto vogliamo. Le due somme si stringono quindi attorno a un unico numero, che dalla tabella sembra proprio $\frac13$. Lo **definiamo** come l'area sotto la curva.

Scegliere l'altezza a metà di ogni intervallino (**punto medio**) o sostituire i rettangoli con dei trapezi dà approssimazioni molto migliori già con pochi intervallini. Nel grafico qui sotto la funzione è più complicata e non si sa calcolare l'area «a mano»; con il punto medio, però, bastano pochi rettangoli per avvicinarsi molto al valore esatto, che è circa $3{,}3230$.

```matephis
{
  "aspectRatio": "3:2",
  "xlim": [-0.3, 3.4],
  "ylim": [-0.2, 2.7],
  "xStep": 0.5,
  "yStep": 0.5,
  "params": {"n": {"val": 3, "min": 1, "max": 60, "step": 1, "label": "n"}},
  "data": [
    {
      "fn": "1 + sin(2*x)*exp(-x/3)",
      "domain": [0, 3.3],
      "color": "blue",
      "riemann": {
        "n": "n",
        "range": [0, 3],
        "rule": "mid",
        "showValue": true,
        "valueLabel": "\\text{punto medio}",
        "digits": 4,
        "color": "summer4"
      }
    },
    {
      "fn": "1 + sin(2*x)*exp(-x/3)",
      "domain": [0, 3.3],
      "color": "blue",
      "opacity": 0,
      "riemann": {
        "n": "n",
        "range": [0, 3],
        "rule": "trapezoid",
        "showValue": true,
        "valueLabel": "\\text{trapezi}",
        "digits": 4,
        "color": "summer6",
        "opacity": 0.08
      }
    }
  ]
}
```

## 3. Un calcolo esatto: l'area sotto la parabola

Per $f(x) = x^2$ si può fare il conto fino in fondo. Con $n$ intervallini e gli estremi destri, i rettangoli hanno base $\frac1n$ e altezze $\left(\frac1n\right)^2, \left(\frac2n\right)^2, \dots, \left(\frac nn\right)^2$:

$$S_n = \frac1n\left[\left(\frac1n\right)^2 + \left(\frac2n\right)^2 + \dots + \left(\frac nn\right)^2\right] = \frac{1^2 + 2^2 + \dots + n^2}{n^3}$$

La somma dei primi $n$ quadrati ha una formula (si dimostra per induzione):

$$1^2 + 2^2 + \dots + n^2 = \frac{n(n+1)(2n+1)}{6}$$

quindi

$$S_n = \frac{n(n+1)(2n+1)}{6n^3} = \frac16\left(1 + \frac1n\right)\left(2 + \frac1n\right)$$

Quando $n$ diventa grandissimo, $\frac1n$ diventa piccolissimo e $S_n$ si avvicina a $\frac16 \cdot 1 \cdot 2 = \frac13$. Con lo stesso conto, sull'intervallo da $0$ a $b$ l'area è $\frac{b^3}{3}$.

Lo stesso risultato, in forma geometrica, era già noto ad **Archimede** nel III secolo a.C.: l'area del segmento di parabola è $\frac43$ di quella del triangolo inscritto. Archimede lo dimostrò proprio sommando infiniti pezzi (triangoli sempre più piccoli), con un metodo che anticipa di quasi duemila anni quello che stiamo vedendo.

## 4. Il simbolo di integrale

L'area sotto il grafico di $f$ tra $a$ e $b$, ottenuta come valore a cui si avvicinano le somme di rettangoli quando i rettangoli diventano infinitamente stretti, si chiama **integrale definito** di $f$ tra $a$ e $b$ e si scrive

$$\int_a^b f(x)\,dx$$

La notazione, inventata da Leibniz alla fine del Seicento, racconta la costruzione:

- $\int$ è una «S» allungata, l'iniziale di *summa*: è una somma;
- $f(x)\,dx$ è l'area di un rettangolino di altezza $f(x)$ e base $dx$, un $\Delta x$ «infinitamente piccolo»;
- $a$ e $b$ sono gli estremi dell'intervallo su cui si somma.

Confronta con la somma di rettangoli: $\sum_i f(x_i)\,\Delta x_i$ diventa $\int f(x)\,dx$. Per esempio $\int_0^1 x^2\,dx = \frac13$.

In fisica la variabile è spesso il tempo, e le relazioni che conosciamo si scrivono così:

$$\Delta s = \int_{t_1}^{t_2} v(t)\,dt \qquad \Delta v = \int_{t_1}^{t_2} a(t)\,dt \qquad J = \int_{t_1}^{t_2} F(t)\,dt$$

## 5. Area con segno

Se la funzione è negativa, i rettangoli hanno «altezza» negativa e contano con il segno meno: le parti di area **sotto l'asse** si sottraggono a quelle sopra. È esattamente quello che serve in fisica: se la velocità è negativa il corpo torna indietro e lo spostamento diminuisce.

Sposta l'estremo $b$: per quale valore l'integrale di $\sin x$ da $0$ a $b$ torna a zero? (Il valore esatto è $1 - \cos b$, ma non serve saperlo: guarda le aree.)

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-0.3, 7],
  "ylim": [-1.4, 1.4],
  "xStep": 1,
  "yStep": 0.5,
  "params": {"b": {"val": 4, "min": 0, "max": 6.8, "step": 0.05, "label": "b"}},
  "data": [
    {
      "fn": "sin(x)",
      "domain": [0, 7],
      "color": "blue",
      "fill": {"range": [0, "b"], "signed": true, "color": "summer4"}
    },
    {"x": "b", "color": "gray", "dash": "4,4", "width": 1}
  ]
}
```

## 6. La funzione integrale e il legame con la derivata

Fissiamo l'estremo sinistro e lasciamo variare quello destro: l'area da $0$ a $t$ diventa una funzione di $t$. Se $v(t)$ è una velocità, questa funzione è la posizione: $s(t) = s(0) + \int_0^t v\,dt$. Nel grafico la curva azzurra è la velocità e la curva rossa è l'area da $0$ a $t$, cioè la posizione (con $s(0) = 0$). Sposta $t$ e osserva la retta tangente alla curva rossa.

```matephis
{
  "aspectRatio": "3:2",
  "xlim": [-0.3, 6.3],
  "ylim": [-1.2, 4.2],
  "xStep": 1,
  "yStep": 1,
  "axisLabels": ["t", ""],
  "legend": true,
  "params": {"X": {"val": 2, "min": 0, "max": 6, "step": 0.05, "label": "t"}},
  "data": [
    {
      "fn": "1.2 - 0.4*x + 0.6*sin(1.5*x)",
      "domain": [0, 6.2],
      "color": "summer4",
      "label": "v(t)",
      "fill": {"range": [0, "X"], "signed": true, "hatch": true}
    },
    {
      "fn": "1.2*x - 0.2*x^2 + 0.4*(1 - cos(1.5*x))",
      "domain": [0, 6.2],
      "color": "red1",
      "label": "s(t) = area da 0 a t"
    },
    {
      "fn": "(1.2 - 0.4*X + 0.6*sin(1.5*X))*(x - X) + 1.2*X - 0.2*X^2 + 0.4*(1 - cos(1.5*X))",
      "color": "gray",
      "dash": "5,5",
      "width": 1.5,
      "label": "tangente"
    },
    {"points": [["X", "1.2*X - 0.2*X^2 + 0.4*(1 - cos(1.5*X))"]], "color": "red1"},
    {"points": [["X", "1.2 - 0.4*X + 0.6*sin(1.5*X)"]], "color": "summer4"}
  ]
}
```

La pendenza della curva rossa in ogni punto è uguale al valore della curva azzurra in quel punto. Dove la velocità è positiva la posizione cresce, dove è nulla la posizione ha un massimo o un minimo, dove è negativa la posizione cala. Il motivo è semplice: se spostiamo l'estremo da $t$ a $t + \Delta t$ l'area aumenta di una striscia sottile, quasi un rettangolo di base $\Delta t$ e altezza $v(t)$; quindi

$$\frac{\Delta(\text{area})}{\Delta t} \approx v(t)$$

e diventa esattamente $v(t)$ quando $\Delta t$ è piccolissimo. È il **teorema fondamentale del calcolo integrale**: *la derivata della funzione integrale di $v$ è $v$*. Derivare e integrare sono operazioni inverse, come velocità e posizione: dalla posizione si ottiene la velocità con la pendenza, dalla velocità si torna alla posizione con l'area (vedi anche [[Alla scoperta della derivata]]).

Questo teorema trasforma il calcolo delle aree in un gioco a ritroso: per calcolare $\int_a^b f(x)\,dx$ basta trovare una funzione $F$ la cui derivata sia $f$ (una **primitiva**) e calcolare $F(b) - F(a)$. Per esempio la derivata di $\frac{x^3}{3}$ è $x^2$, quindi

$$\int_0^1 x^2\,dx = \frac{1^3}{3} - \frac{0^3}{3} = \frac13$$

senza sommare nessun rettangolo.

### La legge oraria del moto uniformemente accelerato

Con il teorema fondamentale si ritrova subito una formula che conosciamo. Se l'accelerazione è costante, $v(t) = v_0 + a\,t$ e lo spostamento è l'area sotto questa retta:

$$\Delta s = \int_0^t (v_0 + a\,\tau)\,d\tau = v_0\,t + \frac12\,a\,t^2$$

perché la derivata di $v_0\,\tau + \frac12 a\,\tau^2$ è proprio $v_0 + a\,\tau$. Geometricamente è il rettangolo di altezza $v_0$ più il triangolo sopra di esso.

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-0.3, 5.3],
  "ylim": [-0.5, 5],
  "xStep": 1,
  "yStep": 1,
  "axisLabels": ["t (s)", "v (m/s)"],
  "params": {
    "v0": {"val": 1, "min": 0, "max": 3, "step": 0.1, "label": "v₀"},
    "a": {"val": 0.6, "min": -1, "max": 1, "step": 0.1, "label": "a"},
    "T": {"val": 3, "min": 0, "max": 5, "step": 0.1, "label": "t"}
  },
  "data": [
    {"fn": "v0 + a*x", "domain": [0, 5], "color": "summer4", "fill": {"range": [0, "T"], "signed": true}},
    {"fn": "v0", "domain": [0, "T"], "color": "gray", "dash": "4,4", "width": 1}
  ]
}
```

## 7. Altre aree in fisica

**L'impulso di una forza variabile.** Un carrello da $0{,}50 \text{ kg}$ riceve una spinta che cresce e poi diminuisce come un arco di seno: $F(t) = F_0 \sin\left(\pi\,\frac{t - t_0}{\tau}\right)$ per una durata $\tau$. L'impulso è l'area sotto l'arco, che vale esattamente $\frac{2}{\pi}F_0\,\tau$: circa due terzi del rettangolo di altezza $F_0$ e base $\tau$. Nella simulazione l'integrale è calcolato numericamente, sommando rettangoli piccolissimi (un passo di $1/240 \text{ s}$), e coincide con la quantità di moto finale del carrello.

```physics
{
  "xlim": [0, 5],
  "ylim": [0, 1.0],
  "aspectRatio": "4:1",
  "params": {
    "F0": {"val": 1.0, "min": 0.2, "max": 2, "step": 0.1, "unit": "N", "label": "forza massima"},
    "tau": {"val": 0.6, "min": 0.1, "max": 1.5, "step": 0.05, "unit": "s", "label": "durata"}
  },
  "state": {"x": 0.8, "v": 0, "J": 0},
  "ode": {
    "x": "v",
    "v": "(t > 0.5 && t < 0.5 + tau ? F0*sin(pi*(t - 0.5)/tau) : 0)/0.5",
    "J": "t > 0.5 && t < 0.5 + tau ? F0*sin(pi*(t - 0.5)/tau) : 0"
  },
  "time": {"max": 3.5, "stopWhen": "x > 4.6"},
  "objects": [
    {"id": "g", "type": "ground", "y": 0.3},
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
    {"type": "momentum", "on": "A", "vec": ["0.5*v", 0], "label": "\\vec p", "color": "red1"}
  ],
  "readouts": [
    {"label": "∫F dt (finora)", "value": "J", "unit": "N·s", "digits": 3},
    {"label": "2F₀τ/π", "value": "2*F0*tau/pi", "unit": "N·s", "digits": 3},
    {"label": "p", "value": "0.5*v", "unit": "kg·m/s", "digits": 3}
  ],
  "graphs": [
    {
      "y": "t > 0.5 && t < 0.5 + tau ? F0*sin(pi*(t - 0.5)/tau) : 0",
      "label": "Forza",
      "axisLabels": ["t (s)", "F (N)"],
      "colors": ["summer6"],
      "fill": {"upTo": "now", "hatch": true}
    }
  ]
}
```

**Il lavoro di una forza variabile.** Il lavoro di una forza costante parallela allo spostamento è $F\,\Delta x$; se la forza cambia con la posizione, il lavoro è l'area sotto il grafico forza-posizione, $W = \int F(x)\,dx$. Per allungare una molla di costante elastica $k$ serve una forza $F = kx$ che cresce con l'allungamento: l'area è un triangolo, e il lavoro necessario per allungarla di $x$ è $\frac12 k x^2$, l'energia potenziale elastica.

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-0.02, 0.32],
  "ylim": [-2, 32],
  "xStep": 0.05,
  "yStep": 5,
  "axisLabels": ["x", "F"],
  "axisUnitMeasures": ["m", "N"],
  "axisLabelStyle": "italic",
  "params": {"X": {"val": 0.2, "min": 0, "max": 0.3, "step": 0.01, "label": "allungamento"}},
  "data": [{"fn": "100*x", "domain": [0, 0.3], "color": "summer6", "fill": {"range": [0, "X"], "hatch": true}}]
}
```

Altri esempi: la massa di una sbarra con densità variabile è l'integrale della densità lungo la sbarra; il volume d'acqua entrato in una vasca è l'integrale della portata nel tempo; l'energia consumata da un elettrodomestico è l'integrale della potenza nel tempo (per questo si paga in kilowattora, cioè kilowatt per ora).

## 8. Qualche esercizio per il curioso

1. **[EE]** Approssima $\int_0^2 x^2\,dx$ con quattro rettangoli usando gli estremi sinistri, poi quelli destri. Confronta con il valore esatto $\frac83$.
	[sol: $s_4 = 1{,}75$, $S_4 = 3{,}75$; il valore esatto $\approx 2{,}67$ è compreso tra i due.]
2. **[EE]** Senza fare calcoli, ma guardando le aree, determina $\int_{-1}^{1} x^3\,dx$ e $\int_0^{2\pi} \sin x\,dx$.
	[sol: Entrambi valgono $0$: le aree sopra e sotto l'asse sono uguali.]
3. **[F]** Usa la formula della somma dei quadrati per dimostrare che $\int_0^b x^2\,dx = \frac{b^3}{3}$.
4. **[F]** La somma dei primi $n$ numeri naturali è $\frac{n(n+1)}{2}$. Usala per calcolare $\int_0^b x\,dx$ con le somme di rettangoli, e verifica il risultato con l'area di un triangolo.
	[sol: $\frac{b^2}{2}$.]
5. **[F]** Un'auto parte da ferma con accelerazione $a(t) = 2 - 0{,}5\,t$ (unità del SI) per $4 \text{ s}$. Calcola con le aree la velocità dopo $4 \text{ s}$; poi trova una funzione $v(t)$ la cui derivata sia $a(t)$ e calcola lo spostamento con il teorema fondamentale.
	[sol: $v(4) = 4 \text{ m/s}$; $v(t) = 2t - 0{,}25\,t^2$; lo spostamento è $t^2 - \frac{t^3}{12}$, cioè circa $10{,}7 \text{ m}$ dopo $4 \text{ s}$.]
6. **[PD]** Per una molla «reale» la forza non è proporzionale all'allungamento: $F = kx + cx^3$. Quanto lavoro serve per allungarla di $x$? Confronta con il caso $c = 0$.
	[sol: $\frac12 kx^2 + \frac14 cx^4$.]
