---
title: Funzionalità di matephis
feed: hide
tag:
  - test
  - funzionalità
code: true
plot: true
---

Una panoramica di tutte le funzionalità speciali e la sintassi personalizzata disponibile nel blog Matephis.

> [!DETAILS] Indice dei contenuti
>
> 1. [Matematica (MathJax)](#matematica-mathjax)
> 2. [Grafici (Matephis Plot)](#grafici-matephis-plot)
> 3. [Dettagli nascosti](#dettagli-nascosti)
> 4. [Gradi di difficoltà](#gradi-di-difficoltà)
> 5. [Liste opzioni](#liste-opzioni)
> 6. [Tabelle](#tabelle)
> 7. [Link interni](#link-interni)

## Matematica (MathJax)

È possibile scrivere formule matematiche utilizzando la sintassi LaTeX standard.

*   Inline: `$ E = mc^2 $` diventa $ E = mc^2 $
*   Blocco:
    ```latex
    $$
    \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
    $$
    ```
    $$
    \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
    $$

## Grafici (Matephis Plot)

Matephis include un potente motore di plotting grafico basato su JSON. Per inserire un grafico, usa un blocco di codice con linguaggio `matephis`.

### Sintassi base

````markdown
```matephis
{
  "xlim": [-5, 5],
  "ylim": [-1.5, 1.5],
  "legend": true,
  "data": [
    { "fn": "sin(x)", "label": "Seno", "color": "red" },
    { "fn": "cos(x)", "label": "Coseno", "color": "blue", "dash": "5,5" }
  ]
}
```
````

**Risultato:**

```matephis
{
  "xlim": [-5, 5],
  "ylim": [-1.5, 1.5],
  "legend": true,
  "data": [
    { "fn": "sin(x)", "label": "Seno", "color": "red" },
    { "fn": "cos(x)", "label": "Coseno", "color": "blue", "dash": "5,5" }
  ]
}
```

### Opzioni principali

*   `xlim`, `ylim`: Limiti degli assi `[min, max]`.
*   `fullWidth`: `true` per occupare tutta la larghezza disponibile.
*   `aspectRatio`: Stringa (es. `"16:9"`, `"1:1"`) per definire la proporzione.
*   `interactive`: `true` per abilitare zoom e pan.
*   `params`: Oggetto per definire slider interattivi.

## Dettagli nascosti

Per nascondere contenuti lunghi o secondari, puoi usare la sintassi "Callout" per creare un elemento `<details>`.

### Sintassi

```markdown
> [!DETAILS] Clicca per espandere
>
> Questo è il contenuto nascosto.
> Può contenere **testo formattato**, liste e altro.
```

### Risultato

> [!DETAILS] Clicca per espandere
>
> Questo è il contenuto nascosto.
> Può contenere **testo formattato**, liste e altro.

## Gradi di difficoltà

Per le schede di itinerari o esercizi, puoi indicare la difficoltà usando una sintassi specifica all'interno del grassetto: `**[DIFFICOLTÀ]**`.

Il sistema riconosce automaticamente queste etichette, le colora e aggiunge un tooltip con la descrizione completa (scala escursionistica/alpinistica).

### Esempi

*   `**[T]**`: Turistico **[T]**
*   `**[E]**`: Escursionistico **[E]**
*   `**[EE]**`: Escursionisti Esperti **[EE]**
*   `**[F]**`: Facile (alpinismo) **[F]**
*   `**[D+]**`: Difficile superiore **[D+]**

## Liste opzioni

Per creare liste di opzioni (es. parametri di una funzione o menu), usa il grassetto con parentesi tonde all'inizio di un elemento di lista.

### Sintassi

```markdown
* **(Opzione 1)** Descrizione...
* **(Opzione 2)** Descrizione...
```

### Risultato

* **(Opzione 1)** Lo stile viene applicato automaticamente.
* **(Opzione 2)** Il testo tra parentesi diventa in stile "codice".

## Tabelle

Le tabelle vengono automaticamente racchiuse in un wrapper (`matephis-table-wrapper`) che permette lo scroll orizzontale su dispositivi mobili senza rompere il layout della pagina.

| Colonna 1 | Colonna 2 | Colonna 3 |
| :--- | :--- | :--- |
| Dato A | Dato B | Dato C |
| Dato D | Dato E | Dato F |

## Link interni

Usa la sintassi per linkare altre note.

*   Standard Markdown: `[Testo](link)`
