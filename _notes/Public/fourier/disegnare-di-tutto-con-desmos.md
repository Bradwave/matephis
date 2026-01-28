---
title: Parte 2 — Disegnare DI TUTTO con Desmos
feed: hide
tags:
  - attività
  - desmos
  - fourier
---
## La matematica per disegnare di tutto

Ci chiediamo: *quali disegni si possono ottenere tramite concatenazioni di punti rotanti?*

Tutti i disegni realizzabili a mano libera, senza staccare la matita dal foglio e formati da una sola curva chiusa possono essere costruiti tramite una concatenazione infinita di punti rotanti. Tale concatenazione è detta **serie di Fourier**, un polinomio trigonometrico con infiniti termini.

Più formalmente, data la funzione $P(t) = (x, y)$, la cui immagine rappresenta un disegno realizzabile a mano libera, formato da una sola linea chiusa e continua, allora

\\[P(t) = \sum_{n = 0}^{+\infty} \underbrace{R_n \cdot (\cos (v_n t + \phi_n), \sin(v_n t + \phi_n))}_{\text{punto rotante} \; (x_n(t), \, y_n(t))}\\]

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
		Usando i numeri complessi (che, con le dovute precauzioni, si possono far corrispondere ai punti del piano), la serie di Fourier diventa $f(t) = \sum_{n = -\infty}^{+\infty} \hat{f}(n) \cdot e^{i n t}$, dove $e^{int}$ corrisponde a un punto rotante con frequenza di rotazione $n$.
	</p>
	<p>
		<i>Perché la serie converge a qualsiasi figura chiusa disegnabile a mano libera?</i>
	</p>
	<p>
		Perché i punti rotanti formano una base (infinita e ortonormale) per lo spazio definito di tutte le possibili figure. Così come i vettori bidimensionali possono essere costruiti a partire da due vettori ortonormali di base, $v = (1, 0)$ e $u = (0, 1)$ — ad esempio $(5, 3) = 5v + 3u$ — anche le figure disegnate possono essere costruite a partire dalla somma (o concatenazione) di punti rotanti. A differenza dello spazio dei vettori bidimensionali, che ha dimensione 2, lo spazio dei disegni ha dimensione infinita e, pertanto, richiede una base infinita.
	</p>
</details>

Quindi, per rappresentare un qualsiasi disegno (che rispetti i requisiti sopra descritti) è importante conoscere gli opportuni valori di $R_n$, $v_n$, $\phi_n$.

L'applicazione [drawxy.matephis.com](https://drawxy.matephis.com) consente di creare dei disegni e di ricavare i corrispondenti coefficienti di Fourier. Per ovvie ragioni di carattere tecnico, non sarà possibile rappresentare su Desmos delle somme infinite, quindi ci dovremmo accontentare di approssimare i disegni usando un numero finito (ma comunque considerevole) di punti rotanti.

1. Tramite l'applicazione [drawxy.matephis.com](https://drawxy.matephis.com), create dei disegni a piacere. Nella sezione *DFT Analysis* copiate i corrispondenti valori di $R_n$, $v_n$ e $\phi_n$ e incollateli su Desmos.
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

## Perché Fourier?

Sarebbe possibile rappresentare il disegno semplicemente elencando una serie di punti appartenenti ad esso e congiungendoli, perché ricorrere allora alla serie di Fourier?

Su [drawxy.matephis.com](https://drawxy.matephis.com), copiate l'elenco di punti che costituiscono il disegno precedentemente realizzato (cercate `(x, y) - Desmos format`) e incollateli su Desmos, quindi congiungete i punti tramite l'apposita funzione.

Tramite l'apposito slider sull'app *drawxy*, riducete drasticamente il numero di punti utilizzati per approssimare il disegno e importateli su Desmos. Confrontate il disegno ottenuto congiungendo i punti con quello che si ottiene tramite la serie di Fourier, con numero di coefficienti pari al numero di punti.

1. **Cosa notate?**
2. Quali sono, secondo voi, vantaggi e svantaggi della rappresentazione tramite la serie di Fourier?

---

Abbiamo visto come la serie di Fourier consenta di rappresentare qualsiasi disegno chiuso tramite una concatenazione di punti rotanti. Tuttavia, Desmos non è lo strumento ideale per visualizzare animazioni più complesse. Nella prossima parte, se deciderete di proseguire lungo il sentiero, esploreremo **p5.js**, una libreria JavaScript per la programmazione creativa, che ci permetterà di costruire applicazioni web interattive.