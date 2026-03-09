---
title: Implementazione informatica
---

## Implementazione informatica
Il software interattivo per ricostruire disegni, come la Mole Antonelliana o pinguini, è strutturato nei seguenti passaggi:
1. Disegno vettoriale tramite **curve di Bézier cubiche**.
2. Estrazione delle coordinate dal file **SVG**.
3. **Campionamento** dei punti lungo le curve.
4. Calcolo della **DFT** (Trasformata Discreta di Fourier).

### 1. Curve di Bézier cubiche
Ogni curva è definita da due punti $P_0$ e $P_3$ (iniziale e finale) e due punti di controllo $P_1$ e $P_2$.

Parametrizzazione della curva per $t \in [0, 1]$:
$$ B(t) = P_0(1-t)^3 + 3P_1 t(1-t)^2 + 3P_2 t^2(1-t) + P_3 t^3 $$

In JavaScript:
```javascript
getPoint(p0, p1, p2, p3, t) {
  let x = p0.x * Math.pow(1 - t, 3) + 3 * p1.x * t * Math.pow(1 - t, 2)
    + 3 * p2.x * Math.pow(t, 2) * (1 - t) + p3.x * Math.pow(t, 3);
  let y = p0.y * Math.pow(1 - t, 3) + 3 * p1.y * t * Math.pow(1 - t, 2)
    + 3 * p2.y * Math.pow(t, 2) * (1 - t) + p3.y * Math.pow(t, 3);
  return new ComplexNumber(x, y);
}
```

### 2. Dall'SVG al codice
Si utilizza un software come Inkscape per esportare il disegno in coordinate assolute, e si converte la stringa in lista di punti:
```javascript
importAbsCoord(inputCoord) {
  inputCoord = inputCoord.replace(/ C /g, " ");
  let splitCoord = inputCoord.split(" ");
  let points = [];
  for (let k = 0; k < splitCoord.length; k++) {
    let xy = splitCoord[k].split(",")
    points[k] = { x: parseFloat(xy[0]), y: - parseFloat(xy[1]) };
  }
  return points;
}
```

### 3. Campionamento
Campioni uniformi di $N$ punti lungo la curva:
```javascript
samplePoints(N) {
  const s = 1.000000 / N;
  const M = this.points.length / 3;
  let sampledPoints = [];
  for (let j = 0; j < M; j++) {
    let p = {
      p0: this.points[3*j], p1: this.points[1+3*j],
      p2: this.points[2+3*j], p3: this.points[(3+3*j)%this.points.length]
    };
    for (let k = 0; k < N; k++) {
      sampledPoints[k+j*N] = this.getPoint(p.p0, p.p1, p.p2, p.p3, k*s);
    }
  }
  return sampledPoints;
}
```

### 4. Trasformata di Fourier
La Trasformata Discreta di Fourier (DFT) calcolata precedentemente, si applica su questo array di punti `sampledPoints` producendo l'array dei coefficienti $c_n$.

<iframe src="https://bradwave.github.io/freehandfourier/" width="100%" height="500px" style="border:0px; border-radius: 8px;"></iframe>
