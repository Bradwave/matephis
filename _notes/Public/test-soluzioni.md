---
title: Suggerimenti, soluzioni e svolgimento
feed: hide
tags:
  - test
---
Come si scrivono gli aiuti negli esercizi e come li vedono gli studenti: soluzioni, suggerimenti, svolgimento, blocchi a scomparsa e note. Ogni sezione mostra prima il risultato e poi il Markdown che lo produce.

> [!NOTA] Su telefono, tablet, computer e lavagna funziona tutto allo stesso modo: si tocca per scoprire, si tocca di nuovo per nascondere.

## Soluzioni

Una soluzione si scrive `[sol: …]` (oppure `[solution: …]`) alla fine dell'esercizio. Resta sfocata finché non la tocchi e poi resta scoperta finché non la tocchi di nuovo.

- **Breve** (fino a circa 48 caratteri visibili): sta sull'ultima riga dell'esercizio, a destra. Se lo spazio non basta, per esempio su un telefono, va subito sotto, sempre a destra.
- **Lunga**: diventa un blocco allineato a sinistra, più facile da leggere. Il filetto a sinistra diventa rosso quando la soluzione è scoperta.

Le parentesi dentro la soluzione non sono un problema: intervalli come $[0, 1)$ o $]0, 1[$ dentro una formula non chiudono il tag.

1. **[E]** Calcola l'area del triangolo rettangolo isoscele con cateti di lunghezza $b$.
	[sol: $\frac{b^2}{2}$]
2. **[E]** Trova dominio e immagine di $f(x) = \sqrt{1 - x^2}$.
	[sol: dominio $[-1, 1]$, immagine $[0, 1]$]
3. **[E]** Un camion viaggia a velocità costante quando una sbarra cade nel cassone. Il camion rallenta?
	[sol: Se la sbarra cade verticalmente rispetto alla strada, il sistema camion più sbarra conserva la quantità di moto orizzontale e il camion rallenta. Se cade verticalmente rispetto al camion (per esempio da un carico del camion stesso), la velocità non cambia.]

```markdown
1. **[E]** Calcola l'area del triangolo rettangolo isoscele con cateti di lunghezza $b$.
    [sol: $\frac{b^2}{2}$]
```

### Una risposta per sottopunto

Se l'esercizio ha più punti, conviene dare a ogni punto la sua risposta invece di una sola soluzione «1. …; 2. …; 3. …». Accanto a un sottopunto l'etichetta «Soluzione» non compare: basta la posizione.

1. **[E]** **Dalle parole alla formula.** Scrivi la formula usando il respiro di riferimento $f$.
	1. A fine espirazione restano $2$ litri. [sol: $f(x) + 2$]
	2. Un compagno inizia $3$ secondi dopo. [sol: $f(x - 3)$]
	3. Un respiro tre volte più profondo, con lo stesso ritmo. [sol: $3 f(x)$]
	4. Due volte più veloce, inizia $1$ secondo dopo. [sol: $f\big(2(x - 1)\big)$]

```markdown
    1. A fine espirazione restano $2$ litri. [sol: $f(x) + 2$]
    2. Un compagno inizia $3$ secondi dopo. [sol: $f(x - 3)$]
```

## Suggerimenti

Un suggerimento si scrive `[hint: …]`. Più suggerimenti di seguito formano un gruppo: un solo pulsante li scopre uno alla volta e il contatore dice quanti ne restano. Toccare un suggerimento già scoperto lo nasconde, insieme a quelli che lo seguono. Si scrivono prima della soluzione, nell'ordine in cui vanno letti.

1. **[F]** Il grafico di $g(x) = -2 f(3x + 6) + 1$ si ottiene da quello di $f$. Descrivi le trasformazioni nell'ordine in cui avvengono e trova dove va il punto $(x_0, y_0)$.
	[hint: Raccogli il $3$ dentro l'argomento: $3x + 6 = 3(\dots)$.]
	[hint: Leggi prima ciò che agisce su $x$ (dentro), poi ciò che agisce su $f$ (fuori).]
	[sol: $\left(\frac{x_0}{3} - 2,\; -2 y_0 + 1\right)$]

	> [!SVOLGIMENTO]
	> 1. Raccogli: $3x + 6 = 3(x + 2)$, quindi $g(x) = -2 f\big(3(x + 2)\big) + 1$.
	> 2. Dentro: compressione orizzontale di fattore $\frac 1 3$, poi traslazione di $2$ verso sinistra, quindi $x_0 \mapsto \frac{x_0}{3} - 2$.
	> 3. Fuori: dilatazione verticale di fattore $2$, simmetria rispetto all'asse $x$, traslazione di $1$ verso l'alto, quindi $y_0 \mapsto -2 y_0 + 1$.

```markdown
1. **[F]** Il grafico di $g(x) = -2 f(3x + 6) + 1$ …
    [hint: Raccogli il $3$ dentro l'argomento: $3x + 6 = 3(\dots)$.]
    [hint: Leggi prima ciò che agisce su $x$ (dentro), poi ciò che agisce su $f$ (fuori).]
    [sol: $\left(\frac{x_0}{3} - 2,\; -2 y_0 + 1\right)$]
```

## Svolgimento

La soluzione serve a controllare il risultato; lo svolgimento mostra come ci si arriva. Si scrive come un riquadro `> [!SVOLGIMENTO]` dentro l'esercizio, rientrato come il resto dell'esercizio e separato da una riga vuota. Resta chiuso sotto l'esercizio (come nell'esempio qui sopra) e si apre solo se serve. Una lista numerata dentro lo svolgimento diventa la sequenza dei passaggi.

```markdown
    [sol: …]

    > [!SVOLGIMENTO]
    > 1. Raccogli: $3x + 6 = 3(x + 2)$ …
    > 2. Dentro: …
    > 3. Fuori: …
```

## Blocchi a scomparsa

Per la teoria e gli approfondimenti, non per gli esercizi. Il blocco sta tra due parentesi quadre orizzontali, una sopra e una sotto, con un $+$ rosso per aprirlo. Un'etichetta facoltativa dice che cosa contiene: `[!DIMOSTRAZIONE]` e `[!APPROFONDIMENTO]` la mostrano, `[!DETAILS]` no.

> [!DIMOSTRAZIONE] Perché $f(x - h)$ trasla il grafico verso destra
> Il punto $(x_0, y_0)$ sta sul grafico di $f$. La funzione $g(x) = f(x - h)$ assume lo stesso valore $y_0$ quando $x - h = x_0$, cioè in $x = x_0 + h$:
>
> $$g(x_0 + h) = f(x_0) = y_0$$
>
> Ogni punto si sposta quindi di $h$ verso destra.

> [!APPROFONDIMENTO] Trasformazioni e composizione di funzioni
> Ogni trasformazione è una composizione: $f(x - h)$ è $f \circ t$ con $t(x) = x - h$, mentre $f(x) + k$ è $s \circ f$ con $s(y) = y + k$.

> [!DETAILS] Un blocco senza etichetta
> Il titolo è il resto della prima riga; tutto il resto è il contenuto.

```markdown
> [!DIMOSTRAZIONE] Perché $f(x - h)$ trasla il grafico verso destra
> Il punto $(x_0, y_0)$ sta sul grafico di $f$. …
```

## Note

Una nota è un'osservazione breve, scritta nel carattere dei grafici: istruzioni per un gruppo di esercizi, prerequisiti, un errore frequente. È visibile a tutti, anche sulla lavagna, quindi va scritta per gli studenti. Una o due righe al massimo: se serve di più, va nel testo.

> [!NOTA] Esercizi 1–5: usano il respiro di riferimento definito sopra. Serve la calcolatrice.

> [!NOTA] **Errore frequente:** $f(x - h)$ trasla il grafico a destra, non a sinistra.

```markdown
> [!NOTA] Esercizi 1–5: usano il respiro di riferimento definito sopra.
```

## Sulla lavagna

Quando inserisci un esercizio sulla lavagna, la scheda ha un pulsante per ogni passo: ogni suggerimento, poi la soluzione, poi lo svolgimento. Toccare un passo scopre tutto fino a quel punto; toccarlo di nuovo lo richiude. Così in classe ci si può fermare a un suggerimento prima di mostrare la soluzione. Con «Nascondi soluzione» nel selettore degli esercizi la scheda parte con tutto nascosto; le lavagne salvate prima continuano a funzionare.
