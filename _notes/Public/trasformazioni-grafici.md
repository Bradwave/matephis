---
title: Trasformazioni dei grafici
feed: show
code: true
tags:
  - funzioni
  - teoria
---

Conoscendo il grafico di una funzione $f$, possiamo disegnare senza fare calcoli i grafici di $f(x) + k$, $f(x - h)$, $a \cdot f(x)$, $f(bx)$, e anche quello di tutte queste modifiche insieme:

$$a \cdot f\big(b(x - h)\big) + k \, .$$

In questa pagina partiamo da un grafico che possiamo *vivere* con il corpo, quello del nostro respiro, e lo modifichiamo un parametro alla volta. Ogni modifica ha un significato concreto: più aria nei polmoni, un respiro che arriva dopo, più profondo, più veloce. Poi astraiamo, e osserviamo le stesse modifiche su grafici che con il respiro non hanno nulla a che fare. La pagina continua [[funzioni reali di variabile reale]]. Gli esercizi sono negli [[esercizi sulle trasformazioni dei grafici]].

Come nelle altre pagine, molti grafici si possono manipolare: **prima di muovere uno slider, prova a prevedere** che cosa succederà.

## Il grafico del respiro

Respira normalmente e fai attenzione al volume d'aria nei polmoni. Indichiamo con $f(x)$ il volume d'aria che hai **inspirato** a partire dalla fine dell'ultima espirazione, misurato in litri, e con $x$ il tempo, in secondi. Usiamo $x$ e non $t$ perché, alla fine, quello che scopriremo varrà per qualsiasi funzione.

Il grafico qui sotto è un respiro tranquillo (i valori sono indicativi): ogni $4$ secondi si inspira per $1{,}5$ secondi, si espira per $2$ secondi e si fa una breve pausa di mezzo secondo. In ogni respiro entra ed esce circa mezzo litro d'aria.

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-1, 13],
  "ylim": [-0.2, 0.8],
  "xStep": 1,
  "yStep": 0.25,
  "axisLabels": ["x", "V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "slopeSelection": true,
  "tangentSelection": true,
  "slopeLabel": "pendenza",
  "slopeUnitMeasure": "L/s",
  "data": [
    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "red1", "label": "$f(x)$" }
  ]
}
```

Il grafico **non è simmetrico**: la salita (inspirazione) è più ripida della discesa (espirazione). È proprio la **pendenza** a raccontare il respiro:

- pendenza **positiva**: l'aria entra, stai inspirando;
- pendenza **negativa**: l'aria esce, stai espirando;
- pendenza **nulla**: l'aria è ferma, nella pausa e nell'istante in cui passi da inspirare a espirare;
- pendenza **grande in valore assoluto**: l'aria entra o esce in fretta.

La pendenza si misura in litri al secondo: è il ***flusso*** d'aria. Con gli strumenti "pendenza" e "tangente" del grafico puoi misurarla: dove l'inspirazione è più veloce? E l'espirazione?

> [!DETAILS] In classe: tre esperimenti
>
> 1. **Il proprio respiro.** Ognuno traccia il grafico del proprio respiro, mentre respira, facendo attenzione a dove la curva sale ripida, dove scende piano, dove è orizzontale.
> 2. **Il respiro di un compagno.** Ognuno osserva un compagno che respira e traccia il grafico del suo respiro.
> 3. **Dal grafico al respiro.** Ognuno riceve il grafico tracciato da un compagno e prova a respirare come dice il grafico: dove è ripido bisogna inspirare o espirare in fretta, dove è orizzontale bisogna trattenere il respiro.
>
> Nel terzo esperimento la pendenza smette di essere un numero e diventa una sensazione: *quanto velocemente* sta entrando o uscendo l'aria.

Che cosa cambia nel grafico se abbiamo più aria nei polmoni, se respiriamo più tardi, più a fondo, più in fretta? Ogni domanda corrisponde a una trasformazione del grafico.

Tutte queste trasformazioni sono **composizioni** di $f$ con una funzione molto semplice, che agisce:
- **sull'OUT**, cioè **dopo** $f$: $f(x) + k$, $a \cdot f(x)$;
- **sull'IN**, cioè **prima** di $f$: $f(x - h)$, $f(bx)$.

E tutta la pagina si riassume in un principio:

> **Una modifica dell'OUT agisce in verticale, così come è scritta. Una modifica dell'IN agisce in orizzontale, con l'operazione inversa.**

Negli esempi astratti useremo la parabola $p(x) = (x - 1)(x - 3)$, che ha gli zeri $1$ e $3$, il vertice $V = (2, -1)$ e l'intersezione con l'asse $y$ in $(0, 3)$: tre punti facili da seguire. Il grafico di partenza è sempre tratteggiato, quello trasformato è rosso.

## Traslazioni verticali: $f(x) + k$

**Nel respiro.** Anche alla fine di un'espirazione i polmoni non sono vuoti: resta sempre una certa quantità d'aria, circa $2{,}5$ litri a riposo. Il volume d'aria **nei polmoni** non è quindi $f(x)$, ma

$$f(x) + k \, ,$$

dove $k$ è l'aria sempre presente. A ogni OUT si aggiunge $k$: il respiro è lo stesso, ma tutto il grafico sale di $k$.

*Prima di muovere lo slider: con $k = 2{,}5$, a che altezza si trova il punto più alto del respiro? La pendenza nei vari istanti cambia?*

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-1, 13],
  "ylim": [-0.5, 3.5],
  "xStep": 1,
  "yStep": 0.5,
  "axisLabels": ["x", "V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 150,
  "params": { "k": { "min": 0, "max": 3, "step": 0.25, "val": 2.5, "label": "$k$" } },
  "data": [
    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0)) + k", "domain": [0, 12], "color": "red1", "label": "$f(x) + k$" },
    { "points": [[1.5, 0.5]], "radius": 4, "fillColor": "black1" },
    { "points": [["1.5", "0.5 + k"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

La pendenza non cambia: traslare il grafico non cambia il modo in cui l'aria entra ed esce.

**In astratto.** Il grafico di $f(x) + k$ si ottiene traslando il grafico di $f$ **in verticale di $k$**: verso l'alto se $k > 0$, verso il basso se $k < 0$. Il punto $(x_0, y_0)$ va in $(x_0, y_0 + k)$. Qui $k$ può essere anche negativo, cosa che nel respiro non ha senso: non si può avere meno di zero aria nei polmoni.

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-2, 6],
  "ylim": [-4, 6],
  "legend": true,
  "legendWidth": 150,
  "params": { "k": { "min": -3, "max": 3, "step": 0.5, "val": -2, "label": "$k$" } },
  "data": [
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$p(x)$" },
    { "fn": "(x - 1)(x - 3) + k", "color": "red1", "label": "$p(x) + k$" },
    { "points": [[2, -1, "V"]], "radius": 4, "fillColor": "black1" },
    { "points": [["2", "-1 + k", "V'"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

## Traslazioni orizzontali: $f(x - h)$

**Nel respiro.** Un compagno respira esattamente come te, ma comincia $h$ secondi dopo. Quello che tu fai all'istante $x_0$, lui lo fa all'istante $x_0 + h$. Il suo grafico è il tuo, spostato di $h$ verso **destra**, e la sua formula è

$$f(x - h) \, .$$

*Prima di muovere lo slider: con $h = 2$, quando inizia il respiro del compagno? Quando raggiunge il massimo?*

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-3, 15],
  "ylim": [-0.2, 0.8],
  "xStep": 1,
  "yStep": 0.25,
  "axisLabels": ["x", "V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 150,
  "params": { "h": { "min": -2, "max": 3, "step": 0.25, "val": 2, "label": "$h$" } },
  "data": [
    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "(mod(x - h, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x - h, 4)/1.5)) : (mod(x - h, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x - h, 4) - 1.5)/2)) : 0))", "domain": ["h", "12 + h"], "color": "red1", "label": "$f(x - h)$" },
    { "points": [[0, 0], [1.5, 0.5]], "radius": 4, "fillColor": "black1" },
    { "points": [["h", "0"], ["1.5 + h", "0.5"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

**Perché $-h$ e non $+h$?** Il segno meno sembra andare "al contrario": in $f(x - 2)$ c'è un meno, ma il grafico va a destra. Ci sono due modi di vederlo.

- **Arrivare allo stesso OUT.** L'IN viene modificato **prima** di arrivare a $f$. Perché a $f$ arrivi $x_0$, e quindi esca lo stesso OUT $f(x_0)$, bisogna dare in ingresso $x_0 + h$: infatti $(x_0 + h) - h = x_0$. Il punto che era in $x_0$ si trova ora in $x_0 + h$: per ottenere lo stesso OUT occorre **aggiungere** $h$, e il grafico si sposta nel verso di $h$. È il compagno che "arriva in ritardo" di $h$ secondi.
- **Spostare l'asse invece del grafico.** Chiamiamo $x' = x - h$ il tempo misurato dal compagno, che fa partire il cronometro quando inizia a respirare. Rispetto al suo cronometro il respiro è $f(x')$, lo stesso di sempre. Ma il suo istante $x' = 0$ corrisponde al nostro istante $x = h$: è come se l'asse $y$ si fosse spostato in $x = h$ e il grafico, rispetto a quel nuovo asse, fosse rimasto uguale.

**In astratto.** Il grafico di $f(x - h)$ si ottiene traslando il grafico di $f$ **in orizzontale di $h$**: verso **destra** se $h > 0$, verso sinistra se $h < 0$. Il punto $(x_0, y_0)$ va in $(x_0 + h, y_0)$, perché $f\big((x_0 + h) - h\big) = f(x_0)$.

Le due traslazioni si possono combinare: $f(x - h) + k$ sposta il grafico di $h$ in orizzontale e di $k$ in verticale.

*Prima di muovere gli slider: con $h = 2$ e $k = 1$, dove va il vertice? Il grafico di $p(x - 2)$ sta a destra o a sinistra di quello di $p$?*

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-3, 7],
  "ylim": [-4, 6],
  "legend": true,
  "legendWidth": 150,
  "params": {
    "h": { "min": -3, "max": 3, "step": 0.5, "val": 2, "label": "$h$" },
    "k": { "min": -3, "max": 3, "step": 0.5, "val": 1, "label": "$k$" }
  },
  "data": [
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$p(x)$" },
    { "fn": "(x - h - 1)(x - h - 3) + k", "color": "red1", "label": "$p(x - h) + k$" },
    { "points": [[2, -1, "V"]], "radius": 4, "fillColor": "black1" },
    { "points": [["2 + h", "-1 + k", "V'"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

## Dilatazioni verticali: $a \cdot f(x)$

**Nel respiro.** Respira più a fondo, senza cambiare il ritmo: in ogni istante il volume inspirato è, ad esempio, il doppio. Il grafico è

$$a \cdot f(x) \, ,$$

con $a = 2$. Ogni OUT viene moltiplicato per $a$: cambia la **quantità d'aria** inspirata ed espirata, ma **non la frequenza** del respiro. Con $a > 1$ il respiro è più profondo e il grafico si ***dilata*** in verticale; con $0 < a < 1$ il respiro è più superficiale e il grafico si ***comprime***. La compressione non è una trasformazione diversa: è una dilatazione con un fattore minore di $1$.

*Prima di muovere lo slider: con $a = 2$, quanto vale il massimo? In quali istanti il grafico non si muove?*

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-1, 13],
  "ylim": [-0.2, 1.6],
  "xStep": 1,
  "yStep": 0.25,
  "axisLabels": ["x", "V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 150,
  "params": { "a": { "min": 0.25, "max": 3, "step": 0.25, "val": 2, "label": "$a$" } },
  "data": [
    { "fn": "0", "color": "summer7", "width": 6, "opacity": 0.35, "label": "asse fisso" },
    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "a*(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "red1", "label": "$a \\cdot f(x)$" },
    { "points": [[1.5, 0.5]], "radius": 4, "fillColor": "black1" },
    { "points": [["1.5", "0.5a"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

Il massimo passa da $0{,}5$ a $0{,}5 \cdot a$ litri, ma arriva sempre dopo $1{,}5$ secondi. Nella pausa, quando $f(x) = 0$, il grafico non si muove: $a \cdot 0 = 0$.

**In astratto: c'è sempre un asse fisso.** Il punto $(x_0, y_0)$ va in $(x_0, a\,y_0)$. Moltiplicare per $a$ non "allunga il grafico attorno al suo centro" o "attorno al vertice": allunga ogni punto **a partire dall'asse $x$**. La distanza dall'asse $x$ diventa $a$ volte più grande, quindi i punti **sull'asse $x$**, che hanno distanza $0$, **restano fermi**: gli zeri non cambiano.

*Prima di muovere lo slider: con $a = 2$, dove vanno gli zeri? Dove va il vertice? La parabola diventa "più stretta"? E che cosa succede se $a$ è negativo?*

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-2, 7],
  "ylim": [-4, 7],
  "legend": true,
  "legendWidth": 150,
  "params": { "a": { "min": -2, "max": 3, "step": 0.25, "val": 2, "label": "$a$" } },
  "data": [
    { "fn": "0", "color": "summer7", "width": 6, "opacity": 0.35, "label": "asse fisso" },
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$p(x)$" },
    { "fn": "a(x - 1)(x - 3)", "color": "red1", "label": "$a \\cdot p(x)$" },
    { "points": [[1, 0], [3, 0]], "radius": 4, "fillColor": "summer7" },
    { "points": [[2, -1, "V"]], "radius": 4, "fillColor": "black1" },
    { "points": [["2", "-a", "V'"], ["0", "3a"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

Gli zeri $1$ e $3$ non si muovono; il vertice va da $(2, -1)$ a $(2, -a)$; l'intersezione con l'asse $y$ va da $(0, 3)$ a $(0, 3a)$. La parabola sembra "più stretta", ma non si è stretta attorno al vertice: si è allungata in verticale a partire dall'asse $x$. Con $a < 0$ il grafico si dilata e si **ribalta** dall'altra parte dell'asse $x$: ne parliamo nelle [riflessioni](#riflessioni).

## Dilatazioni orizzontali: $f(bx)$

**Nel respiro.** Respira più in fretta, senza cambiare la profondità: ad esempio due volte più veloce. Quello che prima facevi in $2$ secondi ora lo fai in $1$: all'istante $x$ sei già al punto in cui saresti stato all'istante $2x$. Il grafico è

$$f(bx) \, ,$$

con $b = 2$. Cambia la **frequenza** del respiro, ma **non la quantità d'aria** inspirata ed espirata. Con $b = 2$ un respiro dura $\frac{4}{2} = 2$ secondi invece di $4$, e in un minuto si fanno $30$ respiri invece di $15$: la durata di un respiro si divide per $b$, la frequenza si moltiplica per $b$.

*Prima di muovere lo slider: con $b = 2$, quando si raggiunge il primo massimo? Quanti respiri ci sono in $12$ secondi?*

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-1, 13],
  "ylim": [-0.2, 0.8],
  "xStep": 1,
  "yStep": 0.25,
  "axisLabels": ["x", "V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 150,
  "params": { "b": { "min": 0.5, "max": 3, "step": 0.25, "val": 2, "label": "$b$" } },
  "data": [
    { "parametric": ["0", "t"], "domain": [-0.2, 0.8], "color": "summer7", "width": 6, "opacity": 0.35, "label": "asse fisso" },
    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "(mod(b*x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(b*x, 4)/1.5)) : (mod(b*x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(b*x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "red1", "label": "$f(bx)$" },
    { "points": [[1.5, 0.5]], "radius": 4, "fillColor": "black1" },
    { "points": [["1.5/b", "0.5"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

Il primo massimo arriva dopo $\frac{1{,}5}{b}$ secondi invece che dopo $1{,}5$, ma è sempre alto $0{,}5$ litri. Con $b > 1$ il respiro è più veloce e il grafico si ***comprime*** in orizzontale; con $0 < b < 1$ è più lento e il grafico si ***dilata***.

**Perché $\frac{1}{b}$ e non $b$?** È lo stesso ragionamento delle traslazioni: l'IN viene modificato **prima** di arrivare a $f$. Perché a $f$ arrivi $x_0$, bisogna dare in ingresso $\frac{x_0}{b}$, perché $b \cdot \frac{x_0}{b} = x_0$. Il punto che era in $x_0$ si trova ora in $\frac{x_0}{b}$: la modifica dell'IN è "moltiplica per $b$", il grafico subisce l'operazione inversa, "dividi per $b$". Nel respiro: se il tempo scorre $b$ volte più veloce, ogni cosa succede in un tempo $b$ volte più breve.

**In astratto.** Il grafico di $f(bx)$, con $b > 0$, si ottiene dilatando il grafico di $f$ in orizzontale di un fattore $\frac{1}{b}$. Il punto $(x_0, y_0)$ va in $\left(\frac{x_0}{b}, y_0\right)$. Ogni punto si avvicina o si allontana **dall'asse $y$**: la sua distanza dall'asse $y$ si divide per $b$, e i punti **sull'asse $y$**, che hanno distanza $0$, **restano fermi**. Nel respiro, l'istante $x = 0$ in cui inizia l'inspirazione non si sposta.

*Prima di muovere lo slider: con $b = 2$, dove vanno gli zeri? E l'intersezione con l'asse $y$?*

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-2, 6],
  "ylim": [-4, 5],
  "legend": true,
  "legendWidth": 150,
  "params": { "b": { "min": 0.25, "max": 3, "step": 0.25, "val": 2, "label": "$b$" } },
  "data": [
    { "parametric": ["0", "t"], "domain": [-4, 5], "color": "summer7", "width": 6, "opacity": 0.35, "label": "asse fisso" },
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$p(x)$" },
    { "fn": "(b x - 1)(b x - 3)", "color": "red1", "label": "$p(bx)$" },
    { "points": [[0, 3]], "radius": 4, "fillColor": "summer7" },
    { "points": [[2, -1, "V"]], "radius": 4, "fillColor": "black1" },
    { "points": [["2/b", "-1", "V'"], ["1/b", "0"], ["3/b", "0"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

Con $b = 2$ gli zeri vanno in $\frac 1 2$ e $\frac 3 2$, il vertice in $(1, -1)$: il grafico si è compresso verso l'asse $y$, non attorno al vertice. L'intersezione $(0, 3)$ resta ferma.

| trasformazione | ogni punto $(x_0, y_0)$ va in | resta fermo | nel respiro |
| :--- | :--- | :--- | :--- |
| $a \cdot f(x)$ | $(x_0,\; a\, y_0)$ | l'asse $x$: gli **zeri** | cambia la profondità, non la frequenza |
| $f(bx)$ | $\left(\frac{x_0}{b},\; y_0\right)$ | l'asse $y$: l'**intersezione con l'asse $y$** | cambia la frequenza, non la profondità |

## Riflessioni

Le riflessioni sono dilatazioni di fattore $-1$:
- $-f(x)$ (cioè $a = -1$) cambia segno all'OUT: il grafico si riflette **rispetto all'asse $x$**, che resta fermo;
- $f(-x)$ (cioè $b = -1$) cambia segno all'IN: il grafico si riflette **rispetto all'asse $y$**, che resta fermo.

**Nel respiro** la prima non ha un significato fisico, perché il volume inspirato diventerebbe negativo. La seconda invece sì: $f(-x)$ è il respiro **riavvolto**, come un video riprodotto al contrario. Proprio perché il grafico del respiro non è simmetrico, il riavvolgimento si riconosce: l'inspirazione diventa lenta e l'espirazione rapida.

```matephis
{
  "layout": "row",
  "mobileColumns": 1,
  "labels": ["-f(x)", "f(-x)"],
  "shared": { "xlim": [-13, 13], "ylim": [-0.8, 0.8], "aspectRatio": "2:1", "xStep": 2, "yStep": 0.25 },
  "plots": [
    { "data": [
      { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "black1", "dash": "4,4" },
      { "fn": "-(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "red1" }
    ] },
    { "data": [
      { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "black1", "dash": "4,4" },
      { "fn": "(mod(-x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(-x, 4)/1.5)) : (mod(-x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(-x, 4) - 1.5)/2)) : 0))", "domain": [-12, 0], "color": "red1" }
    ] }
  ]
}
```

**In astratto**, una dilatazione con $a < 0$ o $b < 0$ è una dilatazione seguita da una riflessione: ad esempio $-2 f(x)$ dilata di un fattore $2$ e poi riflette rispetto all'asse $x$. E si ritrova la parità: $f$ è pari se il suo grafico coincide con quello di $f(-x)$, è dispari se il grafico di $f(-x)$ coincide con quello di $-f(x)$, cioè se riflettere rispetto all'asse $y$ e rispetto all'asse $x$ dà lo stesso risultato.

```matephis
{
  "layout": "row",
  "mobileColumns": 1,
  "labels": ["-p(x)", "p(-x)"],
  "shared": { "xlim": [-4, 4], "ylim": [-4, 4], "aspectRatio": "4:3" },
  "plots": [
    { "data": [
      { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4" },
      { "fn": "-(x - 1)(x - 3)", "color": "red1" }
    ] },
    { "data": [
      { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4" },
      { "fn": "(-x - 1)(-x - 3)", "color": "red1" }
    ] }
  ]
}
```

## Cambiare l'asse fisso

**Nel respiro.** Il volume d'aria nei polmoni è $f(x) + k$. Se moltiplichiamo *tutto* per $a = 2$, otteniamo $2\big(f(x) + k\big)$: il respiro è più profondo, ma raddoppia anche l'aria che resta sempre nei polmoni, e questo non è quello che succede quando respiriamo a fondo. Vogliamo dilatare **lasciando ferma la retta $y = k$**, cioè il volume a riposo. Si fa in tre passi: si **trasla** in modo che la retta $y = k$ vada sull'asse $x$ (sottraendo $k$), si **dilata** (ora l'asse fisso è quello giusto), si **trasla indietro** (aggiungendo $k$):

$$a \cdot \big((f(x) + k) - k\big) + k = a \cdot f(x) + k \, .$$

Il risultato è proprio $a \cdot f(x) + k$: per questo conviene misurare con $f$ l'aria **inspirata** e non quella totale.

Lo stesso vale in orizzontale. Per accelerare il respiro lasciando fermo l'istante $x = c$, invece dell'istante $0$, si trasla in modo che $x = c$ vada sull'asse $y$, si dilata, si trasla indietro: $f\big(b(x - c) + c\big)$.

**In astratto.** Per stringere la parabola **attorno al suo vertice**, cioè in orizzontale lasciando ferma la retta $x = 2$:

$$g(x) = p\big(b (x - 2) + 2\big) \, .$$

Allo stesso modo, $a \cdot \big(f(x) - k\big) + k$ dilata in verticale lasciando ferma la retta $y = k$.

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-1, 5],
  "ylim": [-2, 5],
  "legend": true,
  "legendWidth": 190,
  "params": { "b": { "min": 0.25, "max": 3, "step": 0.25, "val": 2, "label": "$b$" } },
  "data": [
    { "parametric": ["2", "t"], "domain": [-2, 5], "color": "summer7", "width": 6, "opacity": 0.35, "label": "$x = 2$" },
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$p(x)$" },
    { "fn": "(b(x - 2) + 2 - 1)(b(x - 2) + 2 - 3)", "color": "red1", "label": "$p(b(x - 2) + 2)$" },
    { "points": [[2, -1, "V"]], "radius": 5, "fillColor": "summer7" },
    { "points": [["2 - 1/b", "0"], ["2 + 1/b", "0"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

Lo stesso si vede con una sola retta: la dilatazione $d(x) = a x$ manda ogni numero in un numero $a$ volte più lontano da $0$, e l'unico numero che non si muove, il ***punto fisso*** di $d$, è $0$. Più in generale, $d(x) = c + a(x - c)$ dilata le distanze da $c$, e il suo punto fisso è $c$: il **centro** della dilatazione.

*Prima di muovere gli slider: dove si trova il punto fisso? Che cosa succede con $a = 1$? E con $a$ negativo?*

```sets
{
  "dynagraph": { "ticks": 1 },
  "sets": [{ "id": "X", "interval": "[-3, 3]" }, { "id": "Y", "interval": "[-3, 3]" }],
  "maps": [{ "id": "d", "label": "c + a(x - c)", "name": "d", "from": "X", "to": "Y", "expr": "c + a*(x - c)" }],
  "params": {
    "a": { "min": -2, "max": 2, "step": 0.1, "val": 2 },
    "c": { "min": -2, "max": 2, "step": 0.1, "val": 0 }
  },
  "show": ["fixed(d)"]
}
```

## L'ordine delle operazioni

Quando si combinano più trasformazioni, l'ordine conta, perché si tratta di composizioni.

**Sull'OUT.** $a \cdot f(x) + k$ e $a \cdot \big(f(x) + k\big)$ sono diverse: nella prima si dilata e poi si trasla, nella seconda si trasla e poi si dilata, e la dilatazione "allunga" anche la traslazione, che diventa $a k$. È quello che abbiamo visto con l'aria sempre presente nei polmoni. Nei due dynagraph (collegati: gli slider del primo muovono anche il secondo) $f(x) = x^2$, $s(y) = a y$ e $t(z) = z + k$. *Prima di trascinare: con $a = 2$, $k = 1$ e $x = 1{,}5$, quali OUT ti aspetti?*

```sets
{
  "sync": "ordine",
  "dynagraph": { "scale": "own" },
  "sets": [
    { "id": "X", "interval": "[-2, 2]" }, { "id": "Y", "interval": "[0, 4]" },
    { "id": "Z", "interval": "[-8, 8]" }, { "id": "W", "interval": "[-10, 10]" }
  ],
  "maps": [
    { "id": "f", "label": "x^2", "name": "f", "from": "X", "to": "Y", "expr": "x^2" },
    { "id": "s", "label": "\\cdot a", "name": "s", "from": "Y", "to": "Z", "expr": "a*x", "color": "blue" },
    { "id": "t", "label": "+ k", "name": "t", "from": "Z", "to": "W", "expr": "x + k", "color": "green" },
    { "id": "T", "label": "a f(x) + k", "name": "T_1", "compose": ["f", "s", "t"] }
  ],
  "params": {
    "a": { "min": -2, "max": 2, "step": 0.5, "val": 2 },
    "k": { "min": -2, "max": 2, "step": 0.5, "val": 1 },
    "p": { "min": -2, "max": 2, "step": 0.1, "val": 1.5, "label": "x" }
  },
  "probe": { "map": "T", "at": "p" }
}
```

```sets
{
  "sync": "ordine",
  "dynagraph": { "scale": "own" },
  "sets": [
    { "id": "X", "interval": "[-2, 2]" }, { "id": "Y", "interval": "[0, 4]" },
    { "id": "Z", "interval": "[-2, 6]" }, { "id": "W", "interval": "[-12, 12]" }
  ],
  "maps": [
    { "id": "f", "label": "x^2", "name": "f", "from": "X", "to": "Y", "expr": "x^2" },
    { "id": "t", "label": "+ k", "name": "t", "from": "Y", "to": "Z", "expr": "x + k", "color": "green" },
    { "id": "s", "label": "\\cdot a", "name": "s", "from": "Z", "to": "W", "expr": "a*x", "color": "blue" },
    { "id": "T", "label": "a(f(x) + k)", "name": "T_2", "compose": ["f", "t", "s"] }
  ],
  "params": {
    "a": { "min": -2, "max": 2, "step": 0.5, "val": 2 },
    "k": { "min": -2, "max": 2, "step": 0.5, "val": 1 },
    "p": { "min": -2, "max": 2, "step": 0.1, "val": 1.5 }
  },
  "showSliders": false,
  "probe": { "map": "T", "at": "p" }
}
```

**Sull'IN.** Anche qui l'ordine conta, e in più va letto **al contrario**, perché il grafico subisce le operazioni inverse. Confrontiamo $f\big(b(x - h)\big)$ e $f(bx - h)$.

- In $f\big(b(x - h)\big)$ all'IN si sottrae $h$ e poi si moltiplica per $b$. Il grafico subisce le operazioni inverse in ordine inverso: prima si **dilata** di un fattore $\frac{1}{b}$ (rispetto all'asse $y$), poi si **trasla** di $h$. Il respiro, più veloce, inizia all'istante $h$.
- In $f(bx - h)$ all'IN si moltiplica per $b$ e poi si sottrae $h$. Il grafico prima si **trasla** di $h$, poi si **dilata** di un fattore $\frac{1}{b}$, e la dilatazione "accorcia" anche la traslazione, che diventa $\frac{h}{b}$. Il respiro inizia all'istante $\frac{h}{b}$.

Per leggere un grafico conviene sempre **raccogliere $b$**:

$$f(bx - h) = f\left(b \left(x - \frac{h}{b}\right)\right) \, .$$

Ad esempio, il grafico di $f(2x - 4) = f\big(2(x - 2)\big)$ è quello di $f(2x)$ traslato di $2$ verso destra, non di $4$.

*Prima di muovere gli slider: con $b = 2$ e $h = 3$, quando inizia ciascuno dei due respiri?*

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-1, 13],
  "ylim": [-0.2, 0.8],
  "xStep": 1,
  "yStep": 0.25,
  "axisLabels": ["x", "V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 170,
  "params": {
    "b": { "min": 0.5, "max": 3, "step": 0.25, "val": 2, "label": "$b$" },
    "h": { "min": 0, "max": 6, "step": 0.5, "val": 3, "label": "$h$" }
  },
  "data": [
    { "fn": "(mod(b*(x - h), 4) < 1.5 ? 0.25*(1 - cos(pi*mod(b*(x - h), 4)/1.5)) : (mod(b*(x - h), 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(b*(x - h), 4) - 1.5)/2)) : 0))", "domain": ["h", 12], "color": "red1", "label": "$f(b(x - h))$" },
    { "fn": "(mod(b*x - h, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(b*x - h, 4)/1.5)) : (mod(b*x - h, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(b*x - h, 4) - 1.5)/2)) : 0))", "domain": ["h/b", 12], "color": "summer3", "label": "$f(bx - h)$" },
    { "points": [["h", "0"]], "radius": 5, "fillColor": "red1" },
    { "points": [["h/b", "0"]], "radius": 5, "fillColor": "summer3" }
  ]
}
```

## La forma $a \cdot f\big(b(x - h)\big) + k$

Mettendo tutto insieme si ottiene la forma

$$a \cdot f\big(b(x - h)\big) + k \, ,$$

che descrive la maggior parte delle trasformazioni che incontreremo. Ogni parametro ha un significato preciso.

| parametro | agisce su | effetto sul grafico | nel respiro |
| :--- | :--- | :--- | :--- |
| $b$ | IN | dilatazione orizzontale di fattore $\frac{1}{b}$, rispetto all'asse $y$ | frequenza moltiplicata per $b$ |
| $h$ | IN | traslazione orizzontale di $h$ | il respiro inizia $h$ secondi dopo |
| $a$ | OUT | dilatazione verticale di fattore $a$, rispetto all'asse $x$ | aria inspirata moltiplicata per $a$ |
| $k$ | OUT | traslazione verticale di $k$ | aria sempre presente nei polmoni |

Per disegnare il grafico partendo da quello di $f$ si seguono le operazioni nell'ordine della tabella:

1. si dilata in orizzontale di un fattore $\frac{1}{b}$: $f(bx)$;
2. si trasla in orizzontale di $h$: $f\big(b(x - h)\big)$;
3. si dilata in verticale di un fattore $a$: $a \cdot f\big(b(x - h)\big)$;
4. si trasla in verticale di $k$: $a \cdot f\big(b(x - h)\big) + k$.

L'ordine tra 1 e 2 conta, e anche quello tra 3 e 4; invece le operazioni sull'IN e quelle sull'OUT non si disturbano, perché agiscono una in orizzontale e l'altra in verticale. In una formula sola, il punto $(x_0, y_0)$ del grafico di $f$ va in

$$\left(\frac{x_0}{b} + h,\; a\,y_0 + k\right) \, .$$

*Prima di muovere gli slider: un compagno ha $2{,}5$ litri d'aria sempre nei polmoni, respira una volta e mezza più a fondo di te, due volte più in fretta e comincia $1$ secondo dopo. Quali sono i parametri? Dove si trova il suo primo massimo?*

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-1, 13],
  "ylim": [-0.5, 4],
  "xStep": 1,
  "yStep": 0.5,
  "axisLabels": ["x", "V"],
  "axisUnitMeasures": ["s", "L"],
  "axisLabelStyle": "italic",
  "legend": true,
  "legendWidth": 200,
  "params": {
    "a": { "min": 0.25, "max": 3, "step": 0.25, "val": 1, "label": "$a$" },
    "b": { "min": 0.5, "max": 3, "step": 0.25, "val": 1, "label": "$b$" },
    "h": { "min": -2, "max": 4, "step": 0.25, "val": 0, "label": "$h$" },
    "k": { "min": 0, "max": 3, "step": 0.25, "val": 0, "label": "$k$" }
  },
  "data": [
    { "fn": "(mod(x, 4) < 1.5 ? 0.25*(1 - cos(pi*mod(x, 4)/1.5)) : (mod(x, 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(x, 4) - 1.5)/2)) : 0))", "domain": [0, 12], "color": "black1", "dash": "4,4", "label": "$f(x)$" },
    { "fn": "a*(mod(b*(x - h), 4) < 1.5 ? 0.25*(1 - cos(pi*mod(b*(x - h), 4)/1.5)) : (mod(b*(x - h), 4) < 3.5 ? 0.25*(1 + cos(pi*(mod(b*(x - h), 4) - 1.5)/2)) : 0)) + k", "domain": ["h", 13], "color": "red1", "label": "$a \\cdot f(b(x - h)) + k$" },
    { "points": [[1.5, 0.5]], "radius": 4, "fillColor": "black1" },
    { "points": [["1.5/b + h", "0.5a + k"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

> [!DETAILS] Soluzione
>
> $k = 2{,}5$, $a = 1{,}5$, $b = 2$, $h = 1$: il volume nei polmoni è $1{,}5 \cdot f\big(2(x - 1)\big) + 2{,}5$. Il massimo di $f$ è in $(1{,}5;\ 0{,}5)$ e va in $\left(\frac{1{,}5}{2} + 1;\ 1{,}5 \cdot 0{,}5 + 2{,}5\right) = (1{,}75;\ 3{,}25)$.

**In astratto**, con tutti i parametri liberi, anche negativi. *Prima di muovere gli slider: dove va il vertice con $a = -1$, $b = 2$, $h = 1$, $k = 2$?*

```matephis
{
  "aspectRatio": "4:3",
  "xlim": [-3, 7],
  "ylim": [-5, 6],
  "legend": true,
  "legendWidth": 200,
  "params": {
    "a": { "min": -2, "max": 2, "step": 0.25, "val": -1, "label": "$a$" },
    "b": { "min": -2, "max": 2, "step": 0.25, "val": 2, "label": "$b$" },
    "h": { "min": -3, "max": 3, "step": 0.5, "val": 1, "label": "$h$" },
    "k": { "min": -3, "max": 3, "step": 0.5, "val": 2, "label": "$k$" }
  },
  "data": [
    { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4", "label": "$p(x)$" },
    { "fn": "a(b(x - h) - 1)(b(x - h) - 3) + k", "color": "red1", "label": "$a \\cdot p(b(x - h)) + k$" },
    { "points": [[2, -1, "V"]], "radius": 4, "fillColor": "black1" },
    { "points": [["2/b + h", "-a + k", "V'"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

> [!DETAILS] Soluzione
>
> $V = (2, -1)$ va in $\left(\frac{2}{2} + 1,\; -1 \cdot (-1) + 2\right) = (2, 3)$. La parabola è rivolta verso il basso ($a < 0$) e più stretta in orizzontale ($b = 2$).

## Valore assoluto: tagliare e riflettere

Le due trasformazioni con il valore assoluto non rientrano nella forma $a \cdot f\big(b(x - h)\big) + k$: sono funzioni definite a tratti.

**$\lvert f(x) \rvert$ agisce sull'OUT**: dove $f(x) \geq 0$ non cambia nulla, dove $f(x) < 0$ l'OUT cambia segno.

$$\lvert f(x) \rvert = \begin{cases} f(x) & \text{se } f(x) \geq 0 \\ -f(x) & \text{se } f(x) < 0 \end{cases}$$

Le parti del grafico **sotto** l'asse $x$ vengono **riflesse sopra**; il resto non cambia.

**$f(\lvert x \rvert)$ agisce sull'IN**: per $x \geq 0$ è $f(x)$, per $x < 0$ è $f(-x)$.

$$f(\lvert x \rvert) = \begin{cases} f(x) & \text{se } x \geq 0 \\ f(-x) & \text{se } x < 0 \end{cases}$$

La parte del grafico con $x \geq 0$ resta, quella con $x < 0$ viene **buttata via** e sostituita dalla riflessione della parte destra rispetto all'asse $y$. Il risultato è sempre una funzione **pari**: è il caso "$f$ pari" della composizione, con $\lvert x \rvert$ come primo passaggio.

```matephis
{
  "layout": "row",
  "mobileColumns": 1,
  "labels": ["|p(x)|", "p(|x|)"],
  "shared": { "xlim": [-4, 4], "ylim": [-2, 4], "aspectRatio": "4:3" },
  "plots": [
    { "data": [
      { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4" },
      { "fn": "|(x - 1)(x - 3)|", "color": "red1" }
    ] },
    { "data": [
      { "fn": "(x - 1)(x - 3)", "color": "black1", "dash": "4,4" },
      { "fn": "(|x| - 1)(|x| - 3)", "color": "red1" }
    ] }
  ]
}
```

## La notazione delle onde: $\omega$ e $\varphi$

Nello studio delle onde e delle funzioni periodiche si trova spesso un'altra notazione:

$$A \sin(\omega x + \varphi) + k \, .$$

Qui $A$ è l'***ampiezza*** (il nostro $a$), $\omega$ è la ***pulsazione*** e $\varphi$ è la ***fase iniziale***. Il parametro $\omega$ moltiplica l'IN come il nostro $b$, ma $\varphi$ viene aggiunto **dopo** la moltiplicazione, come in $f(bx - h)$: come abbiamo visto, per leggere la traslazione bisogna raccogliere $\omega$.

$$\sin(\omega x + \varphi) = \sin\left(\omega \left(x + \frac{\varphi}{\omega}\right)\right) \, , \qquad \text{quindi} \qquad b = \omega \, , \quad h = -\frac{\varphi}{\omega} \, .$$

Il grafico è traslato di $\frac{\varphi}{\omega}$ verso **sinistra** se $\varphi > 0$, e **non** di $\varphi$. Ad esempio $\sin\left(2x + \frac{\pi}{2}\right) = \sin\left(2\left(x + \frac{\pi}{4}\right)\right)$ è il grafico di $\sin(2x)$ traslato di $\frac{\pi}{4}$ verso sinistra.

Anche $\omega$ va letto con attenzione: non è la frequenza. Il seno ha periodo $2\pi$, quindi $\sin(\omega x)$ ha periodo $T = \frac{2\pi}{\omega}$ (dilatazione di fattore $\frac{1}{\omega}$) e frequenza $\frac{1}{T} = \frac{\omega}{2\pi}$. Come nel respiro, moltiplicare $\omega$ per $2$ raddoppia la frequenza e dimezza il periodo.

*Prima di muovere gli slider: con $\omega = 2$ e $\varphi = \frac{\pi}{2} \approx 1{,}57$, dove si trova il punto evidenziato, che corrisponde all'origine del grafico di $\sin x$?*

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-4, 8],
  "ylim": [-2.5, 2.5],
  "legend": true,
  "legendWidth": 200,
  "params": {
    "A": { "min": 0.5, "max": 2, "step": 0.25, "val": 1, "label": "$A$" },
    "w": { "min": 0.5, "max": 3, "step": 0.25, "val": 2, "label": "$\\omega$" },
    "p": { "min": -3.14, "max": 3.14, "step": 0.01, "val": 1.57, "label": "$\\varphi$" }
  },
  "data": [
    { "fn": "sin(x)", "color": "black1", "dash": "4,4", "label": "$\\sin x$" },
    { "fn": "A sin(w x + p)", "color": "red1", "label": "$A \\sin(\\omega x + \\varphi)$" },
    { "points": [[0, 0]], "radius": 4, "fillColor": "black1" },
    { "points": [["-p/w", "0"]], "radius": 5, "fillColor": "red1" }
  ]
}
```

## Riepilogo

| funzione | agisce su | effetto sul grafico | resta fermo |
| :--- | :--- | :--- | :--- |
| $f(x) + k$ | OUT | traslazione verticale di $k$ | — |
| $f(x - h)$ | IN | traslazione orizzontale di $h$ ($h > 0$: destra) | — |
| $a \cdot f(x)$, $a > 0$ | OUT | dilatazione verticale di fattore $a$ | l'asse $x$ |
| $f(bx)$, $b > 0$ | IN | dilatazione orizzontale di fattore $\frac{1}{b}$ | l'asse $y$ |
| $-f(x)$ | OUT | simmetria rispetto all'asse $x$ | l'asse $x$ |
| $f(-x)$ | IN | simmetria rispetto all'asse $y$ | l'asse $y$ |
| $a \cdot f\big(b(x - h)\big) + k$ | IN e OUT | $(x_0, y_0) \mapsto \left(\frac{x_0}{b} + h,\; a\,y_0 + k\right)$ | — |
| $\lvert f(x) \rvert$ | OUT | le parti sotto l'asse $x$ vengono riflesse sopra | le parti sopra l'asse $x$ |
| $f(\lvert x \rvert)$ | IN | la parte con $x \geq 0$ viene riflessa a sinistra | la parte con $x \geq 0$ |
