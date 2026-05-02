---
title: Esercizi su distanza e coniche
feed: show
plot: true
tags:
  - distanza
  - coniche
---
Esercizi, quesiti, quiz e problemi sul concetto di distanza e sulle coniche. Dove non diversamente specificato, si usi la distanza euclidea. Si noti che la distanza della scacchiera è anche nota come distanza di Čebyšëv, distanza di Lagrange o distanza della regina

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

## Esercizi

1. **[T]** Calcola la distanza euclidea tra le seguenti coppie di punti. Rappresenta i punti sul piano cartesiano e verifica la ragionevolezza delle risposte.
	1. $A = (0, 3)$, $B = (0, 5)$ [sol: $d(A, B) = 2$]
	2. $C = (3, 0)$, $D = (-2, 0)$ [sol: $d(C, D) = 5$]
	3. $O = (0, 0)$, $E = (3, 4)$ [sol: $d(O, E) = 5$]
	4. $F = (-2, 3)$, $G = (4, -5)$ [sol: $d(F, G) = 10$]
	5. $H = (-1, -1)$, $I = (1, 1)$ [sol: $d(H, I) = 2\\sqrt{2}$]
	6. $J = (3, 2)$, $K = (0, -5)$ [sol: $d(J, K) = \\sqrt{58}$]
2. **[EE]** Ripeti l'esercizio precedente utilizzando la distanza Manhattan e la distanza della scacchiera. [sol: 1. $d_M=2, d_S=2$; 2. $d_M=5, d_S=5$; 3. $d_M=7, d_S=4$; 4. $d_M=14, d_S=8$; 5. $d_M=4, d_S=2$; 6. $d_M=10, d_S=7$]
3. **[T]** Determina la distanza tra i punti $A$ e $B$ rappresentati nel grafico, utilizzando la distanza euclidea.
```matephis
{
  "xlim": [-1.9,1.9],
  "ylim": [0.9,3.9],
  "data": [
    { "points": [[1,2,"A"],[-1,3,"B"]] }
  ]
}
```
[sol: $d(A, B) = \sqrt{5}$]
4. **[E]** Scrivi l'equazione della circonferenza avente per centro il punto $C$ e raggio $r$, per ciascuna delle seguenti combinazioni di coordinate di $C$ e valori di $r$. Verifica la correttezza delle soluzioni usando Desmos o GeoGebra.
	1. $C = (0, 0)$, $r = 1$ [sol: $x^2 + y^2 = 1$]
	2. $C = (1, 0)$, $r = 2$ [sol: $(x - 1)^2 + y^2 = 4$]
	3. $C = (1, 1.5)$, $r = 3$ [sol: $(x - 1)^2 + (y - \frac 3 2)^2 = 9$]
	4. $C = (-2, 3)$, $r = 2.5$ [sol: $(x + 2)^2 + (y - 3)^2 = \frac{25}{4}$]
	5. $C = (\frac 3 2, -1)$, $r = \frac 1 2$ [sol: $(x - \frac 3 2)^2 + (y + 1)^2 = \frac 1 4$]
	6. $C = (-2, -2)$, $r = 1$ [sol: $(x + 2)^2 + (y + 2)^2 = 1$]
5. **[EE/F]** Disegna la circonferenza avente per centro il punto $C$ e raggio $r$, per ciascuna delle seguenti combinazioni di coordinate di $C$ e valori di $r$, utilizzando la distanza Manhattan e la distanza della scacchiera.
	1. $C = (0, 0)$, $r = 3$
	2. $C = (-1, 2)$, $r = 2$
	3. $C = (-2, 0)$, $r = 1$
6. **[E]** Determina l'equazione della circonferenza rappresentata in figura. Verifica la correttezza delle soluzioni usando Desmos o GeoGebra.
```matephis
{
  "xlim": [-3.9,3.9],
  "ylim": [-3.9,3.9],
  "data": [
    { "implicit": "(x-1)^2+(y+1)^2=4" }
  ]
}
```
[sol: $(x - 1)^2 + (y + 1)^2 = 4$]
7. **[EE]** Determina centro e raggio della circonferenza rappresentata in figura, utilizzando la distanza Manhattan.
```matephis
{
  "xlim": [-3.9,3.9],
  "ylim": [-3.9,3.9],
  "data": [
    { "points": [[3,1],[1,3],[-1,1],[1,-1],[3,1]], "type": "interpolation", "showPoints": false, "smoothness": 0 }
  ]
}
```
[sol: $C = (1, 1)$, $r = 2$]
8. **[EE]** Determina centro e raggio della circonferenza rappresentata in figura, utilizzando la distanza della scacchiera.
```matephis
{
  "xlim": [-4.9,4.9],
  "ylim": [-4.9,4.9],
  "data": [
    { "points": [[3,-4],[3,2],[-3,2],[-3,-4],[3,-4]], "type": "interpolation", "showPoints": false, "smoothness": 0 }
  ]
}
```
[sol: $C = (0, -1)$, $r = 3$]
9. **[E]** Scrivi l'equazione della circonferenza avente per centro il punto $C$ e passante per il punto $P$, per ciascuna delle seguenti combinazioni di coordinate di $C$ e $P$. Verifica la correttezza delle soluzioni usando Desmos o GeoGebra.
	1. $C = (0, 0)$, $P = (1, 0)$ [sol: $x^2 + y^2 = 1$]
	2. $C = (0, 0)$, $P = (1, 1)$ [sol: $x^2 + y^2 = 2$]
	3. $C = (-1, 0)$, $P = (-2, 3)$ [sol: $(x + 1)^2 + y^2 = 10$]
	4. $C = (2, 3)$, $P = (-1, 0)$ [sol: $(x - 2)^2 + (y - 3)^2 = 18$]
	5. $C = (\frac 1 2, -1)$, $P = (\frac 1 2, 0)$ [sol: $(x - \frac 1 2)^2 + (y + 1)^2 = 1$]
	6. $C = (1.75, -0.25)$, $P = (2, 2)$ [sol: $(x - 1.75)^2 + (y + 0.25)^2 = 5.125$]
10. **[E]** Scrivi l'equazione della circonferenza avente per centro il punto $C$ e passante per il punto $P$, rappresentanti in figura. Verifica la correttezza delle soluzioni usando Desmos o GeoGebra.
```matephis
{
  "xlim": [-3.9,3.9],
  "ylim": [-3.9,3.9],
  "data": [
    { "points": [[-2,1,"C"],[1,-1,"P"]] }
  ]
}
```
[sol: $(x + 2)^2 + (y - 1)^2 = 13$]
11. **[EE]** Determina se i seguenti appartengono alla circonferenza di equazione $(x -1)^2 + (y + 2)^2 = 10$. Se non appartengono alla circonferenza, determina se sono interni o esterni. Verifica la correttezza delle soluzioni usando Desmos o GeoGebra.
	1. $(0, -5)$ [sol: sì]
	2. $(1, -2)$ [sol: no, è il centro della circonferenza]
	3. $(0, 0)$ [sol: no, è interno]
	4. $(\sqrt{6} + 1, 0)$ [sol: sì]
	5. $(2, 2)$ [sol: no, è esterno]
	6. $(0, 1)$ [sol: sì]
12. **[EE]** Determina se i seguenti appartengono alla circonferenza di centro $(3, 2)$ e raggio $1$. Se non appartengono alla circonferenza, determina se sono interni o esterni. Verifica la correttezza delle soluzioni usando Desmos o GeoGebra.
	1. $(2, 2)$ [sol: sì]
	2. $(2.5, 1.5)$ [sol: no, è interno]
	3. $(3.5, 3)$ [sol: no, è esterno]
	4. **Bonus:** $\left(\frac{6 + \sqrt{2}}{2},\frac{4 + \sqrt{2}}{2}\right)$ [sol: sì]
13. **[EE]** Determina se il punto di coordinate $(\frac 1 3, \frac{\sqrt{11}}{3})$ appartiene alla circonferenza in figura. Verifica la correttezza delle soluzioni usando Desmos o GeoGebra.
```matephis
{
  "xlim": [-0.9,4.9],
  "ylim": [-2.9,2.9],
  "data": [
    { "implicit": "(x-2)^2+y^2=4" }
  ]
}
```
[sol: sì]
14. **[EE]** Per ciascuna delle seguenti equazioni, determina quali rappresentano una circonferenza e, se possibile, determina centro e raggio della circonferenza. Verifica la correttezza delle risposte usando Desmos o GeoGebra.
	1. $x^2 + y^2 = -1$ [sol: nessun punto del piano cartesiano reale soddisfa questa equazione.]
	2. $(x - 2)^2 + (y + 1)^2 = 2$ [sol: circonferenza di raggio $\\sqrt{2}$ e centro $(2, -1)$.]
	3. $x^2 + (y - \frac 1 2)^2 = 1$ [sol: circonferenza di raggio $1$ e centro $(0, \frac 1 2)$.]
	4. $x^2 - y^2 = 9$ [sol: non rappresenta una circonferenza (è un'iperbole).]
	5. $x^2 + 2y^2 = 4$ [sol: non rappresenta una circonferenza (è un'ellisse).]
	6. $x^2 + 2x + 1 + y^2 = 9$ [sol: circonferenza di raggio $3$ e centro $(-1, 0)$.]
15. **[EE]** Per ciascuna delle seguenti equazioni o disequazioni nelle incognite $x$ e $y$, determina l'insieme di punti del piano cartesiano reale di coordinate $(x, y)$ che rispettano tale condizione. Verifica la correttezza delle risposte usando Desmos o GeoGebra.
	1. $(x - 2)^2 + (y + 1)^2 = 3$ [sol: circonferenza di raggio $\sqrt{3}$ e centro $(2, -1)$.]
	2. $x^2 + y^2 < 3$ [sol: punti interni alla circonferenza di raggio $\sqrt{3}$ e centro $(0, 0)$.]
	3. $x^2 + y^2 \leq 0$ [sol: la sola origine del piano $(0, 0)$.]
	4. $1 < (x - 1)^2 + (y + 1)^2 < 4$ [sol: punti della regione compresa tra la circonferenza di raggio $1$ e centro $(1, -1)$ e la circonferenza concentrica di raggio $2$.]
	5. $(x + 2)^2 + y^2 \leq 9$ [sol: punti interni alla circonferenza di centro $(-2, 0)$ e raggio $3$ (circonferenza compresa).]
	6. $x^2 + y^2 \neq 1$ [sol: tutto il piano ad eccezione della circonferenza di raggio $1$ e centro l'origine.]
	7. $x = 2$ [sol: retta parallela all'asse $y$ passante per $(2, 0)$.]
	8. $y = 2x - 1$ [sol: retta di pendenza $2$ passante per $(0, -1)$.]
	9. $y = -1$ [sol: retta parallela all'asse $x$ passante per $(0, -1)$.]
16. **[EE]** Scrivi un'equazione o una disequazione che descriva lo spazio compreso tra le due circonferenze concentriche aventi per centro l'origine del piano e raggio $2$ e $4$ rispettivamente. [sol: $4 < x^2 + y^2 < 16$]
17. **[T]** Calcola la distanza tra i seguenti punti dello spazio.
	1. $O = (0, 0, 0)$, $A = (1, 3, 4)$ [sol: $d(O, A) = \sqrt{26}$]
	2. $O = (0, 0, 0)$, $B = (1, -3, 4)$ [sol: $d(O, B) = \sqrt{26}$]
	3. $C = (1, 2, 0)$, $D = (1, 2, 4)$ [sol: $d(C, D) = 4$]
	4. $E = (0, 0, 4)$, $F = (0, 3, -2)$ [sol: $d(E, F) = 3\sqrt{5}$]
	5. $G = (1, -2, 3)$, $H = (3, 6, -2)$ [sol: $d(G, H) = \sqrt{93}$]
	6. $I = (1, 1, 1)$, $J = (-1, -1, -1)$ [sol: $d(I, J) = 2\sqrt{3}$]
18. **[E]** Scrivi l'equazione della sfera avente per centro il punto $C$ e raggio $r$, per ciascuna delle seguenti combinazioni di coordinate di $C$ e valori di $r$. Verifica la correttezza delle soluzioni usando Desmos o GeoGebra.
	1. $C = (0, 0, 0)$, $r = 1$ [sol: $x^2 + y^2 + z^2 = 1$]
	2. $C = (1, -1, 0)$, $r = 2$ [sol: $(x - 1)^2 + (y + 1)^2 + z^2 = 4$]
	3. $C = (2, -2, 3)$, $r = \frac 1 2$ [sol: $(x - 2)^2 + (y + 2)^2 + (z - 3)^2 = \frac 1 4$]
19. **[EE/F]** Per ciascuna delle seguenti equazioni o disequazioni nelle incognite $x$, $y$ e $z$, determina l'insieme di punti del spazio di coordinate reali $(x, y, z)$ che rispettano tale condizione. Verifica la correttezza delle risposte usando Desmos o GeoGebra.
	1. $x^2 + y^2 + z^2 < -1$ [sol: nessun punto di coordinate reali dello spazio rispetta tale condizione.]
	2. $(x - 1)^2 + (y + 1)^2 + (z - 1)^2 > 4$ [sol: punti esterni alla sfera di raggio $2$ e centro $(1, -1, 1)$.]
	3. $x = 2$ [sol: piano parallelo al piano $yz$, passante per $(2, 0, 0)$.]
	4. $z = 2y - 1$ [sol: piano passante in $(0, 0, -1)$, secante il piano $xy$ lungo la retta parallela all'asse $x$ e passante per $(0, \frac 1 2, 0)$.]
	5. $x^2 + y^2 = z^2$ [sol: cono.]
	6. $z = -1$ [sol: piano parallelo al piano $xy$ e passante per $(0, 0, -1)$.]
	7. **Bonus:** $x^2 + y^2 = z$ [sol: paraboloide.]
	8. **Bonus:** $x^2 - y^2 = z$ [sol: paraboloide iperbolico.]
20. **[EE/F]** Scrivi l'equazione dei seguenti piani. Verifica la correttezza delle risposte usando Desmos o GeoGebra.
	1. Piano parallelo al piano $xy$ passante per $(1, 2, 3)$. [sol: $z = 3$]
	2. Piano parallelo al piano $xz$ passante per $(-1, \frac 3 4, 2)$ [sol: $y = 0.75$]
	3. Piano passante per $(0, 0, 2)$, secante il piano $xy$ lungo l'asse $x$. [sol: $y = 0$]
	4. Piano passante per $(1, 0, 0)$, secante il piano $yz$ lungo la retta parallela all'asse $z$ e passante per $(0, -2, 0)$. [sol: $y = 2x - 2$]
21. **[EE]** Scrivi l'equazione dei tre piani passanti per $(2, 3, -1)$ e paralleli rispettivamente ai piani $xy$, $yz$ e $xz$. [sol: $z = -1$, $x = 2$, $y = 3$]
22. **[EE/F]** Determina l'intersezione tra il cono di equazione $x^2 + y^2 = z^2$ e il piano di equazione $y = z + 2$. [sol: $y = 1 - \frac 1 4 x^2$, $z = -1 - \frac 1 4 x^2$]

## Quesiti

1. **[T]** Qual è la definizione di circonferenza? [sol: Il luogo geometrico dei punti del piano equidistanti da un punto fisso detto centro.]
2. **[F]** Che forma ha una circonferenza secondo la geometria del taxi (ovvero secondo la distanza Manhattan)? [sol: Un quadrato con le diagonali parallele agli assi cartesiani.]
3. **[F]** Che forma ha una circonferenza secondo la distanza della regina? [sol: Un quadrato con i lati paralleli agli assi cartesiani.]
4. **[PD-]** Disegna una circonferenza di raggio $3$ e una circonferenza di raggio $6$ secondo la distanza del cavallo.

## Quiz

