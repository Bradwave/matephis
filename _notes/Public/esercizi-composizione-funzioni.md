---
title: Esercizi su composizione di funzioni
feed: show
plot: true
tags:
  - funzioni
---
Esercizi, quesiti, quiz e problemi sulla composizione di funzioni.

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

## Esercizi

1. **[E]** Determina il dominio delle seguenti funzioni composte.
	1. $f(x) = \ln(x^2 - 4)$
	2. $f(x) = \sqrt{1 - e^x}$
	3. $f(x) = e^{\sqrt{x + 2}}$
	4. $f(x) = \dfrac{1}{\ln(x - 1)}$
	5. $f(x) = \ln(\ln x)$
	6. $f(x) = \sqrt{\sin x}$
	7. $f(x) = \arcsin(2x - 1)$
	8. $f(x) = \ln(1 - x^2)$
	9. $f(x) = e^{\frac{1}{x^2 - 1}}$
	10. $f(x) = \dfrac{1}{\sqrt{x^2 - 3x + 2}}$
[sol: 1. $(-\infty, -2) \cup (2, +\infty)$; 2. $(-\infty, 0\]$; 3. $[-2, +\infty)$; 4. $(1, 2) \cup (2, +\infty)$; 5. $(1, +\infty)$; 6. $\bigcup_{k \in \mathbb{Z}} [2k\pi, (2k+1)\pi]$; 7. $[0, 1]$; 8. $(-1, 1)$; 9. $\mathbb{R} \setminus \{-1, 1\}$; 10. $(-\infty, 1) \cup (2, +\infty)$]
2. **[E]** Calcola i seguenti limiti di funzioni composte.
	1. $\lim_{x \to +\infty} \ln\left(\frac{1}{x}\right)$
	2. $\lim_{x \to -\infty} e^{x^3}$
	3. $\lim_{x \to 0^+} \sqrt{-\ln x}$
	4. $\lim_{x \to +\infty} \arctan(e^x)$
	5. $\lim_{x \to 0} e^{-\frac{1}{x^2}}$
	6. $\lim_{x \to +\infty} \sin\left(\frac{1}{x}\right)$
	7. $\lim_{x \to 0} \ln(1 + x^2)$
	8. $\lim_{x \to +\infty} \frac{1}{\ln(x)}$
	9. $\lim_{x \to 1^-} e^{\frac{1}{x-1}}$
	10. $\lim_{x \to +\infty} \sqrt{x^2 - 4x}$
[sol: 1. $-\infty$; 2. $0$; 3. $+\infty$; 4. $\pi/2$; 5. $0$; 6. $0$; 7. $0$; 8. $0^+$; 9. $0$; 10. $+\infty$]
3. **[PD]** Traccia un grafico approssimativo delle seguenti funzioni composte ragionando sul dominio, i limiti e la monotonia, come visto a lezione. Verificare la correttezza delle risposte usando Desmos.
	1. $f(x) = e^{-x^2}$
	2. $f(x) = \ln(x^2 + 1)$
	3. $f(x) = \ln(x^2)$
	4. $f(x) = \ln(x^2 - 1)$
	5. $f(x) = \dfrac{1}{\ln(x)}$
	6. $f(x) = e^{\frac 1  x}$
	7. $f(x) = \sqrt{x^2 - 1}$
	8. $f(x) = \sqrt{x^3 - x}$
	9. $f(x) = (\sin x)^2$ per $x \in (0, 2\pi)$
	10. $f(x) = \sqrt{\sin x}$
	11. $f(x) = \ln(\sin x)$
	12. $f(x) = (\sin x)^3$ per $x \in (0, 2\pi)$
	13. $f(x) = e^{\ln x}$
	14. $f(x) = \ln e^x$
	15. $f(x) = \arctan \frac 1 x$
	16. $f(x) = \arctan x^2$
[sol: Omissis. Si consiglia di verificare i grafici qualitativi con l'uso di software (es. GeoGebra o Desmos), prestando attenzione in particolare a come il codominio della funzione interna definisca l'input della funzione esterna.]
4. **[D]** Siano $g(x) = x^2 + k$ e $f(x) = \ln(x)$. Spiega a parole come varia il grafico di $h(x) = f(g(x))$ al variare di $k$.
[sol: L'argomento del logaritmo deve essere positivo, quindi $x^2 + k > 0$. Se $k > 0$, il dominio è tutto $\mathbb{R}$, c'è un minimo in $x=0$ di valore $\ln(k)$ e per $|x| \to \infty$ diverge a $+\infty$. Se $k = 0$, c'è un asintoto verticale in $x=0$. Se $k < 0$, il dominio è diviso in due rami separati (per $|x| > \sqrt{-k}$) e ci sono due asintoti verticali.]
5. **[F]** Data la composizione $f(x) = e^{g(x)}$, traccia il grafico approssimato di $f$ se il grafico della funzione interna $g(x)$ è una retta decrescente che passa per l'origine.
[sol: Essendo $g(x) = -mx$ (con $m>0$), per $x \to -\infty$, $g \to +\infty \implies f \to +\infty$. Per $x=0$, $g(0)=0 \implies f(0)=1$. Per $x \to +\infty$, $g \to -\infty \implies f \to 0$ (asintoto orizzontale). L'esponenziale preserva la monotonia, quindi la funzione composta $f(x)$ sarà sempre decrescente.]
6. **[E]** Utilizzando la regola di derivazione delle funzioni composte (chain rule), calcola la derivata prima delle seguenti funzioni.
	1. $f(x) = (3x^2 + 1)^4$
	2. $f(x) = e^{-2x}$
	3. $f(x) = \ln(\sin x)$
	4. $f(x) = \sqrt{x^2 + 1}$
[sol: 1. $24x(3x^2 + 1)^3$; 2. $-2e^{-2x}$; 3. $\cot x$; 4. $\frac{x}{\sqrt{x^2 + 1}}$]
7. **[EE]** Data $f(x) = \ln(x^2 + 4)$, calcola $f'(x)$ e studia il segno della derivata per determinare gli intervalli di crescenza e decrescenza.
[sol: $f'(x) = \frac{2x}{x^2 + 4}$. Poiché il denominatore è sempre positivo, il segno della derivata dipende solo dal numeratore. $f'(x) > 0$ per $x > 0$. La funzione è decrescente per $x \in (-\infty, 0)$ e crescente per $x \in (0, +\infty)$, con un minimo locale in $x = 0$.]
8. **[E]** Date le funzioni $f(x) = x^2 - 1$ e $g(x) = 2x + 3$, calcola:
	1. $f(g(1))$
	2. $g(f(1))$
	3. $f(f(-1))$
	4. $g(g(0))$
[sol: 1. $g(1) = 5 \implies f(5) = 24$; 2. $f(1) = 0 \implies g(0) = 3$; 3. $f(-1) = 0 \implies f(0) = -1$; 4. $g(0) = 3 \implies g(3) = 9$]

## Quesiti

1. **[AD]** Ipotizza di star lavorando con un software di elaborazione di segnali a blocchi in cui ogni "blocco" riceve un segnale, lo trasforma matematicamente e lo passa al successivo. Hai un blocco *"Oscillatore"* che produce nel tempo valori compresi tra $-1$ e $+1$ (ad esempio una sinusoide). Colleghi la sua uscita all'ingresso di un blocco *"Valore Assoluto"* ($\mid x \mid$), e l'uscita di quest'ultimo all'ingresso di un blocco "Esponenziale" (che calcola $e^{\text{input}}$). Quali saranno i valori minimi e massimi del segnale in uscita dall'intero sistema?
[sol: poiché $e^x$ è crescente, il valore minimo in uscita sarà $e^0 = 1$ (quando l'oscillatore passa per zero) e il valore massimo sarà $e^1 = e \approx 2{,}71$ (quando l'oscillatore raggiunge $+1$ o $-1$); l'output finale oscillerà quindi in modo continuo tra $1$ ed $e$.]
2. **[F]** Considera una funzione composta $h(x) = f(g(x))$. Ragionando sugli input e gli output, spiega in modo intuitivo perché se la funzione esterna $f$ è sempre decrescente, allora $h$ sarà decrescente dove $g$ è crescente, e $h$ sarà crescente dove $g$ è decrescente (ovvero, "inverte" la monotonia della funzione interna).
[sol: Se $g$ cresce (all'aumentare di $x$, aumenta il suo output), la funzione esterna $f$ riceverà un input via via sempre più grande. Poiché $f$ è decrescente, restituirà un output finale sempre più piccolo, rendendo $h$ decrescente. Viceversa, dove $g$ decresce, fornisce input più piccoli ad $f$, che reagirà restituendo output più grandi, rendendo $h$ crescente.]
3. **[PD]** Spiega a parole perché il dominio della funzione composta $h(x) = \sqrt{\ln(x)}$ non è semplicemente l'intervallo $(0, +\infty)$, nonostante la funzione $\ln(x)$ accetti regolarmente in ingresso tutti i numeri reali positivi.
[sol: $\ln(x)$ accetta certamente valori in ingresso $x > 0$; tuttavia, se l'output generato da questa funzione diventa negativo, non sarà possibile calcolare $\sqrt{\text{input}}$. L'output di $\ln(x)$ è negativo ogni volta che diamo in ingresso un numero $0 < x < 1$. Per questo il dominio finale è $[1, +\infty)$.]
4. **[T]** Spiega con un esempio numerico o algebrico perché la composizione di funzioni non è in generale commutativa, ovvero perché $f(g(x)) \neq g(f(x))$.
[sol: Siano $f(x) = x^2$ e $g(x) = x + 1$. Componendo si ha $f(g(x)) = (x+1)^2 = x^2 + 2x + 1$, mentre invertendo l'ordine si ottiene $g(f(x)) = x^2 + 1$. Le due espressioni sono evidentemente diverse.]
5. **[F]** Se sai che una funzione $f$ è sempre crescente e una funzione $g$ è sempre decrescente, cosa puoi dedurre sul grafico della funzione composta $h(x) = f(g(x))$? Motiva la risposta.
[sol: Siano $x_1 < x_2$. Poiché $g$ decresce, si ha $g(x_1) > g(x_2)$. Poiché $f$ cresce (e quindi preserva l'ordinamento), applicandola si ottiene $f(g(x_1)) > f(g(x_2))$, ovvero $h(x_1) > h(x_2)$. Quindi la funzione composta è sempre decrescente.]
6. **[PD]** Una funzione composta $h(x) = f(g(x))$ presenta un asintoto verticale in $x = x_0$. Questo può essere causato da due situazioni distinte che coinvolgono il comportamento di $g$ e di $f$. Quali sono? Fornisci un esempio concreto per ciascun caso.
[sol: Caso 1: La funzione interna ha un asintoto verticale in $x_0$ e la funzione esterna lo preserva. Esempio: $h(x) = e^{1/x}$ in $x_0=0$. Caso 2: La funzione interna assume un valore finito in $x_0$, ma la funzione esterna non è definita e presenta un asintoto verticale per tale valore di input. Esempio: $h(x) = \ln(x - 2)$ in $x_0=2$, dove $g(2)=0$ e $\ln(0^+)$ diverge a $-\infty$.]

## Quiz

1. **[F+]** Nel grafico è rappresentata la funzione $f$. Sull'intervallo $x \in (1, 2)$ la funzione composta $g(x) = \dfrac{1}{f(x)}$ è
	- **(a)** crescente.
	- **(b)** decrescente.
	- **(c)** prima crescente, poi decrescente.
	- **(d)** prima decrescente, poi crescente.
	- **(e)** costante.
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-1.9,3.9],
  "ylim": [-1.45,1.45],
  "data": [
    { "fn": "sin(pi*x)", "domain": [-2,4] }
  ]
}
```
[sol: (c)]
2. **[PD-]** Quale delle seguenti affermazioni relative a $f(x) = \sqrt{e^{-x}}$ è corretta?
	- **(a)** $\lim_{x \to +\infty} f(x) = 0$
	- **(b)** $\lim_{x \to +\infty} f(x) = -\infty$
	- **(c)** È crescente.
	- **(d)** $\textrm{dom} f = (0, +\infty)$
[sol: (a)]
3. **[EE]** Hai una catena di due funzioni $f(g(x))$. Sai che per $x \to +\infty$, $g(x)$ tende a $-\infty$. Sai inoltre che $\lim_{y \to -\infty} f(y) = 5$ e $\lim_{y \to +\infty} f(y) = -5$. Quale sarà il limite per $x \to +\infty$ della funzione composta complessiva $f(g(x))$?
	- **(a)** $-\infty$
	- **(b)** $+\infty$
	- **(c)** $5$
	- **(d)** $-5$
	- **(e)** Non ci sono dati sufficienti per determinarlo.
[sol: (c)]
4. **[F+]** La funzione esterna di una composizione è un elevamento al quadrato, cioè $f(y) = y^2$. Come si comporterà il grafico della funzione composta $h(x) = f(g(x))$ se la funzione interna $g(x)$ passa gradualmente da valori positivi a valori negativi (ad esempio attraversando lo zero nel punto $x=0$)?
	- **(a)** La funzione composta assumerà valori negativi, attraversando anch'essa l'asse $x$.
	- **(b)** La funzione composta toccherà l'asse $x$ formando un minimo locale in $x=0$, assumendo solo valori positivi.
	- **(c)** La funzione composta si trasformerà in una retta.
	- **(d)** La funzione composta non sarà definita per i valori negativi prodotti da $g(x)$.
[sol: (b)]
5. **[EE]** Date $f(x) = e^x$ e $g(x) = -x$, la funzione composta $h(x) = f(g(x))$ è:
	- **(a)** Sempre crescente
	- **(b)** Sempre decrescente
	- **(c)** Pari
	- **(d)** Non ammette limiti
[sol: (b)]
6. **[F]** Considera le funzioni $f$ e $g$ i cui grafici sono mostrati in figura. Quanto vale la composizione $f(g(0))$?
	- **(a)** $0$
	- **(b)** $1$
	- **(c)** $2$
	- **(d)** $-1$
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-2.9, 2.9],
  "ylim": [-1.9, 2.9],
  "legend": true,
  "labelStyle": "italic",
  "data": [
    { "fn": "x+1", "color": "red1", "domain": [-3, 3], "label": "f" },
    { "fn": "x^2", "color": "black1", "domain": [-3, 3], "label": "g" }
  ]
}
```
[sol: (b)]
7. **[T]** Siano $f(x)$ e $g(x)$ entrambe funzioni strettamente decrescenti su tutto $\mathbb{R}$. La funzione composta $h(x) = f(g(x))$ sarà:
	- **(a)** Sempre decrescente
	- **(b)** Sempre crescente
	- **(c)** Costante
	- **(d)** Può essere sia crescente che decrescente a tratti
[sol: (b)]
8. **[F]** Se $f(x) = \ln(x)$ e $g(x) = x^2 + 1$, quale affermazione riguardante $h(x) = f(g(x))$ è falsa?
	- **(a)** Il suo dominio è tutto $\mathbb{R}$
	- **(b)** È una funzione pari
	- **(c)** $h(0) = 0$
	- **(d)** $\lim_{x \to -\infty} h(x) = -\infty$
[sol: (d)]
9. **[PD-]** Dal grafico della funzione interna $f(x)$ in figura, deduci quale delle seguenti funzioni composte presenta un asintoto verticale in $x=0$.
	- **(a)** $e^{f(x)}$
	- **(b)** $\ln(f(x))$
	- **(c)** $\sqrt{f(x)}$
	- **(d)** $\sin(f(x))$
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-2.9, 2.9],
  "ylim": [-1.9, 2.9],
  "legend": true,
  "labelStyle": "italic",
  "data": [
    { "fn": "x^2", "color": "black1", "domain": [-3, 3], "label": "f" }
  ]
}
```
[sol: (b)]
10. **[F+]** Data $h(x) = f(g(x))$, sai che in un punto $x=2$ la derivata interna vale $g'(2) = 0$ e la derivata esterna vale $f'(g(2)) = 4$. Quanto vale la derivata della composizione $h'(2)$?
	- **(a)** $4$
	- **(b)** $2$
	- **(c)** $0$
	- **(d)** Non si può stabilire con questi soli dati
[sol: (c)]
11. **[F]** La funzione $f(x)$ ha come dominio l'intervallo $(-\infty, 0]$. Qual è il dominio della funzione traslata $f(x-2)$?
	- **(a)** $(-\infty, 2]$
	- **(b)** $(-\infty, -2]$
	- **(c)** $[-2, 0]$
	- **(d)** Nessuna delle precedenti
[sol: (a)]
12. **[F+]** Siano $f(x) = \sqrt{x}$ e $g(x) = \sin(x)$. Qual è il dominio della composizione $f(g(x))$ se ci si restringe all'intervallo originario $[0, 2\pi]$?
	- **(a)** $[0, 2\pi]$
	- **(b)** $[0, \pi]$
	- **(c)** $[\pi, 2\pi]$
	- **(d)** Solo i punti isolati $0$, $\pi$ e $2\pi$
[sol: (b)]
13. **[F+]** Nel grafico sono rappresentate le funzioni derivate prime $f'(x)$ e $g'(x)$. In $x=1$, cosa possiamo dedurre per la funzione composta $h(x) = f(g(x))$, sapendo che $g(1) = -2$?
	- **(a)** $h(x)$ ha un punto stazionario (ad es. un picco massimo o minimo)
	- **(b)** $h(x)$ è strettamente crescente
	- **(c)** $h(x)$ è strettamente decrescente
	- **(d)** $h(x)$ presenta un punto di non derivabilità
```matephis
{
  "aspectRatio": "2:1",
  "xlim": [-3.9, 3.9],
  "ylim": [-1.9, 1.9],
  "legend": true,
  "labelStyle": "italic",
  "data": [
    { "fn": "-0.5*x", "color": "red1", "domain": [-4, 4], "label": "f'" },
    { "fn": "x^2-1", "color": "black1", "domain": [-4, 4], "label": "g'" }
  ]
}
```
[sol: (a)]
14. **[PD-]** Sia $h(x) = \ln(x^2+a)$. Affinché il dominio di $h(x)$ risulti esteso a tutto $\mathbb{R}$, quale condizione deve soddisfare il parametro reale $a$?
	- **(a)** $a \ge 0$
	- **(b)** $a > 0$
	- **(c)** $a < 0$
	- **(d)** Nessun valore di $a$ lo permette
[sol: (b)]

## Problemi

**Il Processore di Segnale** **[PD]** Stai progettando l'algoritmo per un modulo di elaborazione digitale del segnale. Il segnale in ingresso al sistema è il tempo $x$ (in millisecondi, con $x \geq 0$). Il segnale attraversa in sequenza due stadi operativi:
1. Il primo stadio è un *inviluppo* che modula un valore nel tempo seguendo la legge $g(x) = \dfrac{100}{x + 10}$.
2. Il secondo stadio è una *distorsione logaritmica* che riceve il segnale dallo stadio precedente e vi applica la funzione $f(y) = \ln(y)$.

Rispondi ai seguenti quesiti.
- Scrivi l'espressione analitica della funzione composta $h(x) = f(g(x))$ che modella il segnale in uscita dall'intero processore.
- Qual è il valore del segnale in uscita all'istante iniziale $x=0$?
- Usando il concetto di composizione tra funzioni, e senza calcolare alcuna derivata, stabilisci se l'uscita $h(x)$ è via via crescente o decrescente al trascorrere del tempo.
- Quanto vale il segnale a lunghissimo termine (calcola il limite per $x \to +\infty$)? Spiega il risultato ottenuto ragionando stadio per stadio.
[sol: $h(x) = \ln\left(\frac{100}{x + 10}\right)$. Per $x=0$, $h(0) = \ln(10) \approx 2{,}3$. Poiché $g(x)$ decresce e $\ln(y)$ è crescente (preserva l'ordine), $h(x)$ risulta decrescente. Per $x \to +\infty$, $g \to 0^+$, quindi $h(x) \to -\infty$.]

**Grafico in due step** **[PD+]** Considera la composizione $h(x) = f(g(x))$, ottenuta concatenando la funzione interna polinomiale $g(x) = x^2 - 4x + 3$ e la funzione esterna iperbolica $f(y) = \dfrac{1}{y}$. Traccia il grafico approssimativo di $h(x)$ (focalizzandoti su dominio, limiti e crescenza) ragionando *esclusivamente per stadi* e seguendo questa scaletta logica:
- Individua la forma di $g(x)$ (una parabola): trovane le intersezioni con gli assi e il vertice.
- Considera i punti in cui l'output di $g(x)$ si annulla: cosa comporteranno questi valori nulli quando verranno immessi nella funzione esterna $f(y)$? Quale sarà, di conseguenza, il dominio finale di $h$?
- Studia i limiti per $x \to \pm\infty$ e i limiti in prossimità dei punti di discontinuità.
- Deduci la crescenza e la decrescenza della funzione composta $h(x)$ a partire dalle sole pendenze della parabola $g(x)$ combinandole con il comportamento di $f(y)$.
[sol: 1) $g(x)$ è una parabola verso l'alto: zeri in $x=1,3$, vertice $V(2,-1)$. 2) Essendo $f(y)=1/y$, gli zeri di $g$ diventano asintoti verticali per $h$. Dominio: $\mathbb{R} \setminus \{1, 3\}$. 3) Per $x \to \pm\infty$, $g \to +\infty \implies h \to 0^+$. Per $x \to 1^-$, $g \to 0^+ \implies h \to +\infty$; per $x \to 1^+$, $g \to 0^- \implies h \to -\infty$ (simile per $x=3$). 4) $g$ decresce per $x<2$ e cresce per $x>2$. Essendo $f(y)$ decrescente (inverte l'ordine), $h$ cresce per $x<2$ e decresce per $x>2$. In $x=2$ c'è un massimo locale pari a $-1$.]