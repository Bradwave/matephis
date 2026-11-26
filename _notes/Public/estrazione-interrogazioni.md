---
title: Estrazione delle domande per le interrogazioni
feed: hide
tags:
  - funzionalità
---
Una pagina di domande può diventare un'estrazione per le interrogazioni: ogni studente riceve, a caso, un gruppo di domande che rispetta tre regole, scritte una volta sola nella pagina. Le domande restano scritte come sempre, con i loro argomenti e i loro gradi di difficoltà (vedi la [[scala di difficoltà degli esercizi]]). Per provarla c'è l'[[Interrogazione di prova]].

## Le regole

Le domande estratte per uno studente:
1. **sono di argomenti diversi**: due domande sotto lo stesso titolo non escono mai insieme;
2. **hanno una difficoltà media nell'intervallo stabilito**: non escono solo domande facili, né solo domande difficili;
3. **non sono appena uscite**: una domanda estratta non può riuscire per un certo numero di studenti successivi.

Fra tutti i gruppi di domande che rispettano le regole, l'estrazione ne sceglie uno a caso, con la stessa probabilità.

## Scrivere la pagina

Basta aggiungere il blocco `exam:` al front matter di una pagina di domande:

```yaml
---
title: Interrogazione sulle funzioni
exam:
  pick: 2          # domande per studente
  level: [EE, F]   # intervallo per la difficoltà media
  cooldown: 1      # per quanti studenti successivi una domanda non può riuscire
---
```

Il resto della pagina non cambia:
- **ogni elemento di primo livello di un elenco numerato è una domanda**. I sottopunti fanno parte della domanda, e così grafici, diagrammi e soluzioni scritti al suo interno;
- **il titolo sopra la domanda (`##` o `###`) è il suo argomento**. Le domande prima del primo titolo sono ciascuna un argomento a sé;
- **il grado (`**[E]**`, `**[F+]**`, ...) all'inizio della domanda è la sua difficoltà**.

```markdown
## Dominio e immagine

1. **[E]** Cos'è il dominio naturale di una funzione?
2. **[F]** Determina dominio e immagine di $f(x) = \frac{1}{x^2 + 1}$.

## Iniettività e inversa

1. **[EE]** Quando una funzione è iniettiva? Come lo riconosci dal grafico?
```

Nella pagina le domande sono numerate di seguito, da un argomento all'altro (qui 1, 2, 3): il numero di una domanda è lo stesso nella pagina, nelle domande estratte e nell'elenco delle estrazioni.

### Le opzioni

| Opzione | Valore predefinito | Significato |
| :--- | :--- | :--- |
| `pick` | `2` | Quante domande per studente. |
| `level` | nessuno | L'intervallo per la media dei gradi, ad esempio `[EE, F]`. Senza `level` la difficoltà non conta. Con `level`, le domande senza grado non escono mai. |
| `cooldown` | `1` | Per quanti studenti successivi una domanda appena uscita resta ferma. Con `0` può riuscire subito. |

### Come si calcola la media

Per fare la media, ogni grado diventa un numero, nell'ordine della scala; `+` e `-` aggiungono o tolgono un terzo di grado.

**[T]** 1 · **[E]** 2 · **[EE]** 3 · **[EE/F]** 4 · **[F]** 5 · **[PD]** 6 · **[AD]** 7 · **[D]** 8 · **[TD]** 9 · **[ED]** 10 · **[ABO]** 11

Con `level: [EE, F]` e due domande per studente, la media deve stare fra 3 e 5:
- **E + PD** (media 4) va bene, e così **EE + F** (media 4) o **EE/F + EE/F**;
- **E + E** (media 2) è troppo facile;
- **PD + PD** (media 6) è troppo difficile.

La regola riguarda solo la media: con tre domande, E + E + AD (media 3,67) va bene.

## In classe

1. **Scrivi il nome** dello studente nel campo in alto (facoltativo: senza nome diventa «Studente 3»).
2. **Premi «Estrai»** (o Invio nel campo del nome). Le domande estratte si aprono a schermo intero, grandi, con il loro numero e argomento, senza le soluzioni. Grafici, slider e diagrammi funzionano come nella pagina, ingranditi quanto il testo.
3. **Chiudi con la ×** (o con Esc). Toccare altrove non chiude nulla, così un tocco sulla lavagna non fa sparire le domande. Il cursore torna nel campo del nome, pronto per lo studente successivo.

Sotto il pulsante una riga dice quante domande, argomenti ed estrazioni valide ci sono. Se le regole non permettono nessuna estrazione, la riga lo spiega e il pulsante si disattiva: servono più domande, un intervallo `level` più largo o un `cooldown` più breve.

### Sulla pagina

- **In fondo a ogni domanda già uscita** compaiono gli studenti che l'hanno avuta.
- **Le domande ferme per il cooldown** appaiono sbiadite.

### L'elenco delle estrazioni

Il pulsante ☰ (con il numero delle estrazioni) apre l'elenco, dalla più recente: per ogni studente, le sue domande con grado, numero e argomento. Toccando una riga si riaprono le sue domande a schermo intero.

### Correggere

- **↶** elimina l'ultima estrazione, ad esempio di uno studente assente;
- **×** in una riga dell'elenco elimina quell'estrazione;
- **il cestino** apre una nuova sessione, cancellando tutte le estrazioni.

Nessuna di queste azioni chiede conferma: sotto i pulsanti compare «Ripristina», che rimette tutto com'era, anche dopo aver ricaricato la pagina, fino all'estrazione successiva. Eliminando un'estrazione gli altri studenti mantengono il loro numero.

## Dove restano i dati

Le estrazioni e i nomi si salvano solo nel browser che le ha fatte, per quella pagina: non vengono inviati da nessuna parte. Su un altro computer, o in un altro browser, la sessione riparte da zero.

Ogni estrazione ricorda le domande dal loro testo. Correggere una domanda durante una sessione la rende, per l'estrazione, una domanda nuova: chi l'aveva già avuta non compare più sotto di essa. Le domande si correggono prima dell'interrogazione, non durante.
