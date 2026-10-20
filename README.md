# Matephis

Matephis è il mio sito di appunti, esercizi e verifiche di matematica e fisica per le scuole superiori. Si trova su [matephis.com](https://matephis.com).

Il materiale è in italiano e nasce dalle lezioni che preparo: teoria, serie di esercizi graduati per difficoltà, simulazioni di verifica, attività guidate. Le pagine sono collegate tra loro con link e backlink, un po' come in un giardino digitale, e hanno una ricerca interna.

Quello che lo distingue da un normale blog di appunti sono i grafici. Funzioni, equazioni implicite, curve parametriche, numeri complessi, diagrammi di fisica e schemi di circuiti non sono immagini: sono SVG disegnati nel browser a partire da un blocco di testo nella nota. Si può zoomare, trascinare, muovere gli slider dei parametri e leggere il valore di un punto o di una tangente.

## Da dove vengono i contenuti

Gli esercizi hanno origini miste, e preferisco dirlo chiaramente:

- molti sono presi o adattati da libri di testo, in particolare *College Physics* di Etkina, e da articoli e paper di didattica;
- tanti, soprattutto quelli di matematica, li ho scritti io;
- alcuni sono generati da LLM, a partire dalle fonti sopra o dai miei esercizi, e poi riletti e sistemati da me.

Non garantisco che siano privi di errori: se ne trovate uno, ditemelo.

## Come è fatto

Il sito è statico, generato con [Jekyll](https://jekyllrb.com/). Le note sono file Markdown in `_notes/Public/`, e la cartella si può aprire direttamente come vault di [Obsidian](https://obsidian.md/): wikilink `[[nota]]`, immagini e blocchi di codice funzionano allo stesso modo in Obsidian e sul sito. Le formule sono in LaTeX, rese da MathJax.

Il sito è partito come un progetto di programmazione all'antica, scritto a mano. Le funzionalità più recenti, e la libreria dei grafici in particolare, sono invece *vibecoddate*: le ho fatte scrivere quasi per intero a Gemini e Claude, guidandole e controllando il risultato a occhio e con i test. Il codice lo riflette, e in alcuni punti si vede.

Sopra Jekyll ci sono due pezzi aggiunti in questo modo:

- Alcuni plugin Ruby (`_plugins/`) che aggiungono sintassi al Markdown: badge di difficoltà per gli esercizi, soluzioni sfocate da rivelare con un click, sezioni `details`, tabelle con scroll orizzontale, grafo dei collegamenti tra note.
- Una piccola libreria JavaScript, in moduli ES, che trasforma i blocchi ```` ```matephis ````, ```` ```physics ```` e simili in grafici. I sorgenti stanno in `assets/js/*-src/` e vengono impacchettati con esbuild nei file `assets/js/matephis-plot.js` e `assets/js/matephis-physics.js`, che sono quelli che il sito carica davvero.

I file JS vengono caricati solo nelle pagine che ne hanno bisogno (se ne occupa `asset_injector.rb`), così le note senza grafici restano leggere.

## Come è nato

Il progetto è cambiato parecchio in un anno. In breve:

**Settembre 2025: il blog.** Parto dal template [Jekyll Garden](https://github.com/Jekyll-Garden/jekyll-garden) (la licenza MIT del repository è la sua), pubblicato su GitHub Pages. Le prime settimane sono tentativi con l'URL, MathJax e i primi appunti ed esercizi sulle funzioni e sulle equazioni di secondo grado.

**Fine 2025: i contenuti crescono.** Aggiungo energia, elettrostatica, limiti, parabola, esponenziali, la serie di Fourier. A novembre arriva il dominio matephis.com. A dicembre un CMS (Sveltia, in `admin/`) per scrivere dal browser, e un restyling completo: sidebar con indice, pagine correlate, sfondo a puntini, lightbox per le immagini.

**Gennaio 2026: i grafici.** Parte come uno script per tracciare funzioni a partire da un blocco JSON e in poche settimane diventa `matephis-plot`: slider, griglia adattiva, zoom e pan, campionamento adattivo per gestire asintoti e discontinuità, legende con MathJax, selezione di punti e tangenti, interpolazione. Funziona anche in anteprima dentro Obsidian.

**Primavera 2026: sempre più strumenti.** Un sistema di slide per le lezioni (marzo), numeri complessi e coordinate polari con parametri animati, schemi di circuiti, una lavagna per disegnare e annotare. Intanto escono molte serie di esercizi su derivate, logaritmi, ottica, onde e circuiti.

**Settembre-ottobre 2026: riordino.** Il codice dei grafici, nato come un unico file, viene diviso in moduli (parser, renderer, interazioni, interfaccia), con una suite di test e il tema scuro. Wikilink e backlink vengono risolti in fase di build. Il deploy su GitHub Pages passa da una GitHub Action che compila anche il JS, e le pull request hanno una CI che esegue test e build. Infine inizia `matephis-physics`, il motore per i diagrammi di fisica, ancora ai primi passi: le fondamenta, una pagina di prova e un playground.

La storia completa, con tutti i commit dai messaggi poco dignitosi, è nel log di git.

## Come farlo partire

Servono Ruby con Bundler e Node.js (consiglio la versione 20 o successiva). Su macOS con Homebrew:

```bash
brew install ruby node
```

Poi, nella cartella del progetto, una volta sola:

```bash
bundle install
npm install
```

### Solo scrivere note

Se devo solo scrivere o correggere note ed esercizi non serve Node:

```bash
bundle exec jekyll serve
```

Il sito è su <http://localhost:4000> e Jekyll ricostruisce le pagine a ogni salvataggio. Se modifico `_config.yml` devo riavviare il server.

### Lavorare sul codice dei grafici

```bash
npm run dev
```

Avvia nello stesso terminale esbuild in modalità watch per `matephis-plot` e `matephis-physics` e il server Jekyll, quindi ogni modifica ai sorgenti JS viene ricompilata subito. Per provare una configurazione mentre la scrivo uso il playground su <http://localhost:4000/playground/>, che mostra l'anteprima dal vivo dei blocchi `matephis` e `physics`, gli avvisi di errore e un pulsante per copiare il blocco.

Ci si ferma con `Ctrl + C`.

### Test e build

```bash
npm test          # test con Vitest: parser, coordinate, campionamento, slider, fisica
npm run build     # ricompila i bundle minificati con sourcemap
```

I bundle `assets/js/matephis-plot.js` e `assets/js/matephis-physics.js` sono generati: non vanno modificati a mano, si cambiano i sorgenti nelle cartelle `-src`.

Stanno comunque nel repository, insieme alle sourcemap, perché servono a chi non compila (`jekyll serve` senza Node, Docker, Obsidian). `npm run dev` e `npm run build` producono file identici, quindi git li mostra modificati solo quando cambio davvero i sorgenti: in quel caso li committo insieme ai sorgenti.

## Struttura del repository

```
_config.yml           configurazione del sito e menu
_layouts/, _includes/ template HTML e componenti (navigazione, ricerca, backlink, lightbox)
_plugins/             plugin Ruby (asset_injector, solution_styler, difficulty_styler, ...)
_notes/Public/        le note: matematica/, fisica/, interdisciplinare/
                      più le pagine di collaudo test-plot.md e test-physics.md
_posts/               il blog
pages/                pagine principali (matematica, fisica, playground, crediti, ...)
admin/                configurazione del CMS
assets/css/           stili del sito, dei grafici e dei diagrammi di fisica
assets/js/
  matephis-plot-src/      sorgenti dei grafici (core, parser, renderers, interactions, ui)
  matephis-physics-src/   sorgenti dei diagrammi di fisica
  matephis-slides.js, matephis-circuit.js, matephis-draw.js, matephis-playground.js
tests/                test Vitest
.github/workflows/    ci.yml (test e build sulle PR), jekyll.yml (deploy)
```

`Dockerfile` e `docker-compose.yml` vengono dal template originale.

## Scrivere un grafico

In una nota basta un blocco di codice con linguaggio `matephis` e un oggetto JSON:

````markdown
```matephis
{
  "xlim": [-5, 5],
  "ylim": [-2, 2],
  "interactive": true,
  "data": [
    { "fn": "a * sin(x)", "color": "red", "label": "f(x) = a sin(x)" }
  ],
  "params": {
    "a": { "val": 1, "min": -2, "max": 2, "step": 0.1 }
  }
}
```
````

Alcune delle cose che si possono fare:

- funzioni esplicite (`"fn": "x^2 - 3*x + 1"`) e implicite (`"implicit": "x^2 + y^2 = 9"`);
- parametri con slider, anche in gradi: `30°` vale 30·π/180 in qualunque espressione e un parametro con `"unit": "deg"` ha lo slider in gradi ma vale in radianti nelle formule;
- selezione di punti, pendenze e rette tangenti (`"tangentSelection": true`, `"traceDerivative": true`);
- LaTeX nelle etichette, ad esempio `"label": "$e^{i\\pi} + 1 = 0$"`.

L'elenco completo delle opzioni, con esempi renderizzati, è nella pagina `/notes/test-plot` del sito in locale. I diagrammi di fisica usano blocchi `physics` con la stessa logica e sono documentati in `/notes/test-physics`.

## Pubblicazione

Ogni push su `main` fa partire la GitHub Action in `jekyll.yml`: installa le dipendenze, esegue `npm run build`, poi `bundle exec jekyll build`, e pubblica il risultato su GitHub Pages. Il sito pubblicato usa quindi sempre bundle ricompilati dai sorgenti.

Sulle pull request gira invece `ci.yml`, che esegue test e build senza pubblicare nulla, e fallisce se i bundle nel repository non corrispondono ai sorgenti (cioè se ho cambiato il JS senza rilanciare `npm run build`).

## Problemi comuni

**La porta 4000 è occupata.** Di solito è un vecchio processo Jekyll rimasto in background:

```bash
kill -9 $(lsof -ti :4000)
```

**Le modifiche ai sorgenti JS non si vedono.** Controllo che `npm run dev` sia attivo (o lancio `npm run build`) e ricarico la pagina senza cache con `Cmd + Shift + R`.

**`bundle exec jekyll` dà errore dopo un aggiornamento di Ruby o macOS.** Di solito basta rilanciare `bundle install`.

---

*"Wir müssen wissen, wir werden wissen."* (D. Hilbert)

Vibecoddato con Gemini e Claude, con &lt;3
