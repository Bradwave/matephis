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
5. **[PD-]** Se la distanza di Manhattan tra due punti è nulla, cosa si può dire della loro distanza euclidea? Motiva la tua risposta. [sol: È nulla, poiché se $\mid x_1-x_2 \mid+\mid y_1-y_2 \mid=0$ allora necessariamente $x_1=x_2$ e $y_1=y_2$, quindi i punti coincidono.]
6. **[PD]** Spiega intuitivamente perché la distanza di Manhattan è sempre maggiore o uguale alla distanza euclidea tra due punti. In quali casi coincidono? [sol: Il percorso più breve tra due punti è il segmento di retta (distanza euclidea). La distanza di Manhattan vincola i movimenti agli assi, descrivendo i cateti di un triangolo rettangolo di cui la retta è ipotenusa. Coincidono solo se i punti sono allineati orizzontalmente o verticalmente.]
7. **[EE/F]** Considera l'equazione $x^2+y^2=k$. Cosa rappresenta questa curva nel piano cartesiano reale quando $k > 0$, $k = 0$ e $k < 0$? [sol: Per $k>0$ è una circonferenza centrata nell'origine; per $k=0$ è il solo punto $(0,0)$; per $k<0$ rappresenta l'insieme vuoto (nessun punto reale).]
8. **[AD]** È possibile trovare tre punti $A$, $B$ e $C$ distinti e non allineati tali che la somma delle distanze di Manhattan $d_M(A,B) + d_M(B,C)$ sia uguale a $d_M(A,C)$? Come cambia la situazione se si usa la distanza euclidea? [sol: Sì con la distanza Manhattan, se $B$ si trova all'interno del rettangolo di vertici opposti $A$ e $C$. Con la distanza euclidea, l'uguaglianza vale rigorosamente solo se i tre punti sono perfettamente allineati sul medesimo segmento.]
9. **[T]** Qual è la definizione di asse di un segmento? [sol: Il luogo geometrico dei punti del piano equidistanti dagli estremi del segmento. È la retta perpendicolare al segmento nel suo punto medio.]

## Quiz

1. **[E]** Quale delle seguenti coppie di punti dista esattamente $5$ secondo la distanza euclidea?
	- **(a)** $A(1, 1)$, $B(4, 5)$
	- **(b)** $C(-2, 0)$, $D(0, 3)$
	- **(c)** $E(1, 4)$, $F(4, 1)$
	- **(d)** $G(0, -2)$, $H(0, 2)$
[sol: (a)]
2. **[EE]** Quale delle seguenti coppie di punti dista esattamente $7$ secondo la distanza di Manhattan?
	- **(a)** $A(1, 2)$, $B(4, -1)$
	- **(b)** $C(-2, 5)$, $D(3, 5)$
	- **(c)** $E(0, -1)$, $F(3, 3)$
	- **(d)** $G(2, 2)$, $H(-2, -2)$
[sol: (a)]
3. **[E]** Quale tra le seguenti equazioni rappresenta una circonferenza centrata nell'origine e di raggio $4$?
	- **(a)** $x^2 + y^2 = 4$
	- **(b)** $x^2 + y^2 = 16$
	- **(c)** $(x-4)^2 + (y-4)^2 = 0$
	- **(d)** $x^2 - y^2 = 16$
[sol: (b)]
4. **[F+]** Dati due punti nel piano cartesiano, se la loro distanza della scacchiera è esattamente $5$, quale delle seguenti affermazioni è sicuramente vera?
	- **(a)** La loro distanza euclidea vale al minimo $5$ e al massimo $5\sqrt{2}$.
	- **(b)** La loro distanza di Manhattan è sempre $10$.
	- **(c)** La loro distanza euclidea vale al minimo $\sqrt{5}$ e al massimo $5$.
	- **(d)** La loro distanza euclidea è pari a $25$.
[sol: (a)]
5. **[PD-]** L'insieme dei punti del piano tali per cui la somma dei quadrati delle distanze dai punti $A(-1, 0)$ e $B(1, 0)$ è pari a $10$ corrisponde a:
	- **(a)** Un'iperbole.
	- **(b)** Una circonferenza centrata nell'origine di raggio $2$.
	- **(c)** Una parabola passante per l'origine.
	- **(d)** Due punti isolati.
[sol: (b)]
6. **[PD+]** Se la distanza euclidea tra due punti $A$ e $B$ è $d_E$, e la loro distanza di Manhattan è $d_M$, quale delle seguenti relazioni è sempre vera per qualsiasi coppia di punti nel piano?
	- **(a)** $d_E \leq d_M \leq d_E \sqrt{2}$
	- **(b)** $d_E \leq d_M \leq 2d_E$
	- **(c)** $d_M \leq d_E \leq d_M \sqrt{2}$
	- **(d)** Le due distanze coincidono sempre.
[sol: (a)]
7. **[EE]** Quale tra i seguenti punti **non** appartiene alla circonferenza di centro $C(-2, 3)$ e raggio $5$? Procedi per esclusione calcolando le distanze dal centro.
	- **(a)** $A(3, 3)$
	- **(b)** $B(-2, 8)$
	- **(c)** $P(2, 6)$
	- **(d)** $D(-6, 1)$
[sol: (d)]
8. **[F+]** Si considerino tre punti $A$, $B$ e $C$ nel piano cartesiano. Sapendo che $d_E(A, B) = 3$ e $d_E(B, C) = 4$, cosa si può dedurre con certezza sulla distanza euclidea $d_E(A, C)$?
	- **(a)** $d_E(A, C) = 5$ (il triangolo è necessariamente rettangolo).
	- **(b)** $1 \leq d_E(A, C) \leq 7$
	- **(c)** $d_E(A, C) > 7$
	- **(d)** Non si può stabilire alcun limite teorico alla distanza.
[sol: (b)]
9. **[EE]** Quale tra queste equazioni descrive l'insieme dei punti aventi distanza euclidea pari a $3$ dal punto $P(1, -2)$? (Suggerimento: espandi l'equazione canonica).
	- **(a)** $x^2 + y^2 - 2x + 4y - 4 = 0$
	- **(b)** $x^2 + y^2 + 2x - 4y - 4 = 0$
	- **(c)** $x^2 + y^2 - 2x + 4y + 4 = 0$
	- **(d)** $x^2 + y^2 - 2x + 4y - 9 = 0$
[sol: (a)]
10. **[EE]** Qual è l'equazione della sfera nello spazio 3D avente centro in $C(1, 2, -1)$ e raggio $3$?
	- **(a)** $(x-1)^2 + (y-2)^2 + (z+1)^2 = 3$
	- **(b)** $(x+1)^2 + (y+2)^2 + (z-1)^2 = 9$
	- **(c)** $(x-1)^2 + (y-2)^2 + (z+1)^2 = 9$
	- **(d)** $x^2 + y^2 + z^2 - 2x - 4y + 2z - 3 = 0$
[sol: (c)]
11. **[EE]** Qual è la relazione tra le due circonferenze rappresentate in figura e come si relazionano i loro raggi $r_1, r_2$ con la distanza $d$ tra i centri?
	- **(a)** Esterne tangenti, $d = r_1 + r_2$
	- **(b)** Esterne non secanti, $d > r_1 + r_2$
	- **(c)** Interne tangenti, $d = \mid r_1 - r_2 \mid$
	- **(d)** Secanti, $\mid r_1 - r_2 \mid < d < r_1 + r_2$
```matephis
{
  "xlim": [-1.9, 5.9],
  "ylim": [-3.9, 3.9],
  "data": [
    { "implicit": "(x-1)^2+y^2=4", "color": "red1" },
    { "implicit": "(x-4)^2+y^2=1", "color": "black1" }
  ]
}
```
[sol: (a)]
13. **[T]** Quale tra i punti contrassegnati in figura è chiaramente esterno alla circonferenza rappresentata in figura?
	- **(a)** $A = (4, 1)$
	- **(b)** $B = (1, -2)$
	- **(c)** $C = (-2, 4)$
	- **(d)** Tutti i punti sono esterni
```matephis
{
  "xlim": [-3.9, 5.9],
  "ylim": [-3.9, 5.9],
  "data": [
    { "implicit": "(x-1)^2+(y-1)^2=9", "color": "red1" }
  ]
}
```
[sol: (c)]
14. **[EE]** Quale tra i seguenti punti ha una distanza euclidea dall'origine strettamente maggiore di $10$?
	- **(a)** $(6, 8)$
	- **(b)** $(0, -10)$
	- **(c)** $(-5, 9)$
	- **(d)** $(7, -7)$
[sol: (c)]
15. **[F+]** Qual è il luogo geometrico dei punti nel piano cartesiano per cui la distanza dall'asse $x$ è uguale alla distanza dall'asse $y$?
	- **(a)** L'origine $(0,0)$.
	- **(b)** Le bisettrici dei quadranti (rette $y = x$ e $y = -x$).
	- **(c)** Una circonferenza di raggio $1$ centrata nell'origine.
	- **(d)** L'unione di tutti i punti degli assi cartesiani.
[sol: (b)]
16. **[PD]** Considera la circonferenza di equazione $x^2 + y^2 - 6x + 8y = 0$. Quale delle seguenti affermazioni è vera?
	- **(a)** Passa per l'origine degli assi.
	- **(b)** Il suo centro è l'origine degli assi.
	- **(c)** Non interseca mai gli assi cartesiani.
	- **(d)** Passa per il punto $(6, -8)$.
[sol: (a)]
17. **[F-]** Quale delle seguenti equazioni rappresenta una circonferenza di raggio nullo, ed equivale quindi a un singolo punto nel piano cartesiano reale?
	- **(a)** $x^2 + y^2 + 4 = 0$
	- **(b)** $(x-2)^2 + (y+3)^2 = 0$
	- **(c)** $x^2 + y^2 = 1$
	- **(d)** $x^2 - y^2 = 0$
[sol: (b)]
18. **[F+]** Qual è il numero di punti in comune tra la circonferenza rappresentata in figura e quella di equazione $(x -1 )^2 + y^2 = 9$?
	- **(a)** $0$
	- **(b)** $1$
	- **(c)** $2$
	- **(d)** Infiniti
```matephis
{
  "xlim": [-1.9, 6.9],
  "ylim": [-3.9, 4.9],
  "data": [
    { "implicit": "(x-4)^2+y^2=4", "color": "red1" }
  ]
}
```
[sol: (c)]

## Problemi

**Questione di distanze** **[F+]** Alice, Bob e Charlie sono allineati come in figura. Alice si trova a 2 metri da Bob e Bob si trova a 6 metri da Charlie. Daniel dista esattamente 8 metri sia da Bob sia da Charlie. Quanto dista da Alice?
```matephis
{
  "aspectRatio": "3:2",
  "xlim": [-1,10],
  "ylim": [-1,6],
  "gridOpacity": 0,
  "showXAxis": false,
  "showYAxis": false,
  "showXNumbers": false,
  "showYNumbers": false,
  "data": [
    { "points": [[0,0,"A"],["2*cos(pi/6)","2*sin(pi/6)","B"],["10*cos(pi/6)","10*sin(pi/6)","C"]] }
  ]
}
```
[sol: $4\sqrt{5} \, \text{m} \approx 8{,}94 \, \text{m}$]

**Antenne** **[PD-]** Determina le coordinate di una terza antenna che disti esattamente 8 kilometri dalle due già presenti e rappresentate in figura.
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-9.9,9.9],
  "ylim": [-4.9,4.9],
  "data": [
    { "points": [[-2,-2,"A1"],[6,0,"A2"]] }
  ]
}
```
[sol: Vi sono due posizioni possibili: $(2 - \sqrt{\frac{47}{17}}, -1 + 4\sqrt{\frac{47}{17}})$ e $(2 + \sqrt{\frac{47}{17}}, -1 - 4\sqrt{\frac{47}{17}})$, ovvero circa $(0{,}34; 5{,}65)$ e $(3{,}66; -7{,}65)$]

```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-9.9,9.9],
  "ylim": [-4.9,4.9],
  "data": [
    { "points": [[-2,-2,"A1"],[6,0,"A2"]] }
  ],
  "interactive": true
}
```

**Il radar di navigazione** **[PD]** Un radar navale è posizionato nell'origine di un sistema di riferimento cartesiano in cui $1$ unità corrisponde a $1 \, \text{km}$. Una nave si trova nel punto $A(-3, 4)$ e si sposta in linea retta fino al punto $B(5, -2)$.
- A che distanza si trova la nave dal radar quando è nel punto $A$? E quando è nel punto $B$?
- Supponi che il radar possa rilevare navi fino a una distanza massima di $6 \text{ km}$. L'area coperta dal radar è descritta da una disequazione. Qual è questa disequazione?
- La nave esce dall'area di copertura del radar durante il suo tragitto da $A$ a $B$? Traccia un grafico per giustificare la tua risposta.
[sol: $d_A = 5 \, \text{km}$, $d_B = \sqrt{29} \approx 5{,}39 \, \text{km}$. L'area è descritta da $x^2 + y^2 \leq 36$. No, non esce: le estremità si trovano a distanze inferiori a 6 km e il punto più vicino sul segmento è ancora più interno, per cui l'intero percorso è coperto dal radar.]

**L'area del parco** **[PD-]** Un architetto deve progettare un parco recintato di forma circolare. Le coordinate del centro del parco sulla mappa del progetto sono $C(4, 3)$ (in centinaia di metri) e il cancello principale si trova nel punto $P(8, 6)$.
- Scrivi l'equazione della circonferenza che delimita il parco.
- Quanto misurano il raggio (in metri) e l'area del parco?
- Il punto d'interesse storico $M(1, 7)$ si trova all'interno o all'esterno del parco?
- L'architetto vuole costruire un sentiero rettilineo passante per $M$ e tangente al parco. Spiega a parole e/o tramite l'algebra come si determinerebbe l'equazione di tale sentiero.
[sol: Equazione $(x - 4)^2 + (y - 3)^2 = 25$. Il raggio sulla mappa è $5$ (cioè $500 \, \text{m}$), l'area è $250.000\pi \approx 785.398 \, \text{m}^2$. Il punto $M$ dista esattamente $\sqrt{9+16} = 5$ unità da $C$, quindi si trova esattamente *sul bordo* della recinzione. Essendo $M$ sulla circonferenza, il sentiero tangente sarà dato semplicemente dalla retta perpendicolare al raggio $CM$ passante per $M$.]

**Consegne in città** **[F+]** Un corriere deve effettuare una consegna partendo dal magazzino situato alle coordinate $M(2, 2)$ per raggiungere il cliente situato in $C(7, 5)$. Le strade della città formano una griglia rettangolare perfetta (i palazzi sono blocchi quadrati paralleli agli assi).
- Calcola la distanza in linea d'aria tra il magazzino e il cliente (distanza euclidea).
- Sapendo che il corriere deve muoversi seguendo le strade, calcola la minima distanza effettiva che percorrerà (distanza Manhattan).
- Se sulla mappa l'unità corrisponde a $150 \, \text{m}$ (ovvero la lunghezza di un isolato) e il furgone consuma $0{,}1 \, \text{L}$ di carburante per chilometro, quanto carburante consumerà per questo tragitto?
[sol: La distanza in linea d'aria è $d_E = \sqrt{25+9} = \sqrt{34} \approx 5{,}83$ unità, ovvero $\approx 875 \, \text{m}$. La distanza percorsa sulle strade è $d_M = 5 + 3 = 8$ unità, ovvero $1200 \text{ m}$ ($1{,}2 \text{ km}$). Il consumo è $1{,}2 \times 0{,}1 = 0{,}12 \text{ L}$ di carburante.]

**Epicentro del terremoto** **[AD-]** Tre stazioni sismiche $S_1$, $S_2$ e $S_3$ si trovano rispettivamente nei punti del piano cartesiano di coordinate $(0, 0)$, $(10, 0)$ e $(0, 10)$ (unità espresse in km). Durante un terremoto, i dati mostrano che l'epicentro si trova a $5 \text{ km}$ da $S_1$, a $\sqrt{65} \text{ km}$ da $S_2$ e a $3\sqrt{5} \text{ km}$ da $S_3$.
- Scrivi le equazioni delle tre circonferenze corrispondenti alle rilevazioni delle stazioni.
- Trova le coordinate esatte dell'epicentro risolvendo il sistema.
[sol: Le equazioni sono $x^2+y^2=25$, $(x-10)^2+y^2=65$, $x^2+(y-10)^2=45$. Il punto in comune (l'epicentro) si trova nel punto di coordinate $(3, 4)$.]
