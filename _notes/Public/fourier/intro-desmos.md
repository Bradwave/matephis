---
title: Parte 1 — Primi passi con Desmos
feed: hide
tags:
  - attività
  - desmos
---
w## Disegni e moti in 2D

Vogliamo descrivere matematicamente, attraverso una funzione, un disegno realizzato a mano libera, senza staccare la matita dal foglio e composto da una singola linea chiusa.

1. Perché il grafico di una funzione reale del tipo $f : x \in \mathbb{R} \longmapsto y \in \mathbb{R}$ non è adeguato per rappresentare un tale disegno?
2. È invece possibile rappresentare il disegno tramite una funzione del tipo $f : t \in \mathbb{R} \longmapsto (x, y) \in \mathbb{R}^2$, perché?
3. Il disegno corrisponde al grafico di $f : t \longmapsto (x, y)$ oppure alla sua immagine?

<details>
	<summary>Suggerimento</summary>
	<p>
		Si può pensare che la funzione $f : t \longmapsto (x, y)$ associ ad ogni istante di tempo $t$ un punto del piano $(x, y)$. L'immagine di $f$ corrisponde a un "disegno" sul piano: è la traiettoria del moto descritto da $f$.
	</p>
</details>

Notate che $f(t)$ può essere costruita a partire dalle due equazioni del moto $x = x(t)$ e $y = y(t)$, che descrivono il moto del punto $(x, y)$ in funzione del tempo $t$. In sintesi, $f(t) = (x(t), y(t))$.

{:start="4"}
4. Che disegno produce $f(t) = (2, t + 3)$ per $-2 \leq t \leq 4$? Formulate una congettura, quindi verificatela su Desmos.

**Nota:** su Desmos, prima definite $f(t) = (x(t), y(t))$, quindi, per visualizzare l'immagine di $f$, digitate semplicemente $f(t)$ e stabilite il range di $t$.

{:start="5"}
5. Visualizzate il punto $f(T)$, dove $T$ è un numero, controllato da uno slider, che varia tra $-2$ e $4$.
6. Animate il punto $f(T)$ in modo che percorra ripetutamente la traiettoria definita da $f$. Fate in modo che, giunto al termine del percorso, il punto riparta dal punto iniziale.

## Uno spirografo matematico

Create una nuova pagina Desmos.

1. Quale funzione del tipo $f(t) = \left(x(t), y(t)\right)$ descrive una circonferenza di raggio $3$, centrata nell'origine, percorsa in senso antiorario con velocità angolare $1$? Formulate una congettura, quindi verificatela su Desmos.
2. Rappresentate sia la traiettoria circolare definita da $f$ sia il punto $P_1 = f(T)$ che percorre la circonferenza nel modo descritto.
3. Che disegno produce la funzione $g(t) = f(t) + 2 \cdot (\cos(-2t), \sin(-2t))$? Formulate una congettura, quindi verificatela su Desmos.
4. Rappresentate anche il punto $P_2 = g(T)$ che percorre la traiettoria descritta da $g$. Spiegate a parole il moto del punto $P_2$.
5. Sfasate la rotazione di $P_2$ di un angolo $\pi$ (ovvero $180^\circ$), detto **fase**. Come cambia il disegno?

A questo punto, fate in modo che i raggi di rotazione $R_1$ e $R_2$ dei punti rotanti $P_1$ e $P_2$, le velocità angolari $v_1$ e $v_2$ e le fasi $\phi_1$ e $\phi_2$ siano controllabili mediante slider. Assicuratevi che i raggi siano non negativi e che le velocità angolari assumano solo valori discreti (positivi o negativi).

{:start="6"}
6. Fate variare i valori dei raggi, delle velocità angolari e delle fasi. **Cosa notate?**

Le varie figure ottenute sono esempi di **polinomi trigonometrici** con solo due termini (i due punti rotanti). Figure analoghe si possono ottenere tramite uno **spirografo**.

In poche parole, i polinomi trigonometrici sono somme o concatenazioni di punti rotanti.

## Punti rotanti attorno a punti rotanti, e così via

Per costruire un polinomio trigonometrico con un maggior numero di termini, è possibile ricorrere ai **vettori**: su Desmos è possibile salvare più valori in un elenco (detto appunto vettore in informatica) digitando, ad esempio, $a = [2, 3, -1, 4]$. Si può accedere al valore del vettore in una specifica posizione, la seconda ad esempio, digitando $a[2]$; in questo caso si otterrebbe $a[2] = 3$.

Create una nuova pagina Desmos.

1. Create su Desmos i vettori $R = [5, 8, 7, 4, 1]$, $v = [0, 1, -1, 2, -2]$, $\phi = [0, \frac{\pi}{2}, -\frac{\pi}{2}, 0, 0]$ (per ottenere $\phi$ digitare `phi`).

Per sommare più punti rotanti, usiamo la somma $\displaystyle\sum_{n = 1}^{5} \dotsc$ (che si ottiene su Desmos digitando `sum`). Il parametro $n$ è detto indice e varia da $1$ a $5$. Al posto dei puntini si inserisce la definizione dei punti rotanti, usando come raggio, velocità angolari e fasi i valori salvati nei vettori $R$, $v$ e $\phi$ rispettivamente.

{:start="2"}
2. Rappresentate su Desmos il polinomio trigonometrico definito come la concatenazione dei punti rotanti sopra definiti.
3. Provate a modificare il numero e il valore degli elementi di $R$, $v$ e $\phi$.

## La matematica per disegnare di tutto

Ci chiediamo: *quali disegni si possono ottenere tramite concatenazioni di punti rotanti?*

Tutti i disegni realizzabili a mano libera, senza staccare la matita dal foglio e formati da una sola linea chiusa possono essere costruiti tramite una concatenazione infinita di punti rotanti. Tale concatenazione è detta **serie di Fourier**, un polinomio trigonometrico con infiniti termini.

Più formalmente, data la funzione $f : t \in \mathbb{R} \longmapsto (x, y) \in \mathbb{R}^2$, la cui immagine rappresenta un disegno realizzabile a mano libera, formato da una sola linea chiusa e continua, allora

\\[f(t) = \sum_{n = 0}^{+\infty} \underbrace{R_n \cdot (\cos (v_n t + \phi_n), \sin(v_n t + \phi_n))}_{\text{punto rotante} \; (x_n(t), \, y_n(t))}\\]

dove:
- $v_n$ è la velocità angolare del punto rotante $(x_n(t), y_n(t))$, che assume solo valori discreti;
- $R_n$ è il raggio di rotazione;
- $\phi_n$ è la fase (ovvero l'angolo di partenza).

La tripletta di valori $v_n$, $R_n$, $\phi_n$ è detta **coefficiente di Fourier**. I coefficienti di Fourier sono calcolati attraverso la **trasformata di Fourier**, che si denota con $\hat f$:

\\[\hat{f}(n) : f \longmapsto (v_n, R_n, \phi_n).\\]

<details>
	<summary>Approfondimento</summary>
	<p>
		Ogni coefficiente di Fourier può essere riassunto in un unico oggetto matematico, un numero complesso, $\hat{f}(n) = r_n \cdot e^{i\phi_n}$.
		Usando i numeri complessi (che, con le dovute precauzioni, si possono far corrispondere ai punti del piano), la serie di Fourier diventa $f(t) = \sum_{n = 0}^{+\infty} \hat{f}(n) \cdot e^{i n t}$, dove $e^{int}$ corrisponde a un punto rotante con frequenza di rotazione $n$.
	</p>
	<p>
		<i>Perché la serie converge a qualsiasi figura chiusa disegnabile a mano libera?</i>
	</p>
	<p>
		Perché i punti rotanti formano una base (infinita e ortonormale) per lo spazio definito di tutte le possibili figure. Così come i vettori bidimensionali possono essere costruiti a partire da due vettori ortonormali di base, $v = (1, 0)$ e $u = (0, 1)$ — ad esempio $(5, 3) = 5v + 3u$ — anche le figure disegnate possono essere costruite a partire dalla somma (o concatenazione) di punti rotanti. A differenza dello spazio dei vettori bidimensionali, che ha dimensione 2, lo spazio dei disegni ha dimensione infinita e, pertanto, richiede una base infinita.
	</p>
</details>

Quindi, per rappresentare un qualsiasi disegno (che rispetti i requisiti sopra descritti) è importante conoscere gli opportuni valori di $R_n$, $v_n$, $\phi_n$.

L'applicazione [drawxy.matephis.com](drawxy.matephis.com) consente di creare dei disegni e di ricavare i corrispondenti coefficienti di Fourier. Per ovvie ragioni di carattere tecnico, non sarà possibile rappresentare su Desmos delle somme infinite, quindi ci dovremmo accontentare di approssimare i disegni usando un numero finito (ma comunque considerevole) di punti rotanti.

1. Tramite l'applicazione [drawxy.matephis.com](drawxy.matephis.com), create dei disegni a piacere. Nella sezione *DFT Analysis* copiate i corrispondenti valori di $R_n$, $v_n$ e $\phi_n$ e incollateli su Desmos.
2. Come variano i raggi di rotazione all'aumentare della velocità angolare?
3. Tramite uno slider $N$ controllate il numero di punti rotanti sommati. Fate variare $N$. **Cosa notate?** Servono molti punti rotanti per approssimare il disegno?
4. Provate a realizzare dei disegni con degli spigoli. **Cosa notate?**

## Da far girare la testa! (Bonus)

 La funzionalità *list comprehension* di Desmos consente di creare nuove liste a partire da liste esistenti. Ciò permette anche di ripetere una certa operazione per un certo numero di volte, come se fosse una sorta di *ciclo for* (per le intenditrici e gli intenditori di informatica). Consulta la [documentazione](https://help.desmos.com/hc/en-us/articles/4407889068557-Lists) di Desmos per capire meglio il funzionamento della *list comprehension*.

1. Oltre a disegnare l'ultimo punto della concatenazione di punti rotanti, disegnate — sfruttando una *list comprehension* — tutti i punti rotanti "intermedi" e congiungeteli.
2. Sempre utilizzando una *list comprehension*, rappresentare le circonferenze lungo cui i vari punti ruotano.

| Avete smarrito il sentiero?                                      |
| ---------------------------------------------------------------- |
| [Ecco un segnavia](https://www.desmos.com/calculator/dqd4zpm2id) |
