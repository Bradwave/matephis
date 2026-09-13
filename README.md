# Matephis 📐⚡

> **Matephis** è una piattaforma scolastica e digitale garden per lo studio e la didattica della matematica e della fisica, basata su **Jekyll**, file **Markdown** (compatibile con Obsidian) e una suite di **widget vettoriali interattivi (SVG)** per grafici cartesiani, schemi circuitali e presentazioni.

---

## Indice della Guida

1. [Architettura del Progetto](#1-architettura-del-progetto)
2. [Prerequisiti di Sistema](#2-prerequisiti-di-sistema)
3. [Installazione Iniziale](#3-installazione-iniziale)
4. [Flusso di Lavoro Quotidiano](#4-flusso-di-lavoro-quotidiano)
   - [A. Scrivere e Modificare Appunti (Solo Jekyll)](#a-scrivere-e-modificare-appunti-markdown)
   - [B. Sviluppare e Modificare i Grafici JS (Jekyll + esbuild)](#b-sviluppare-il-codice-dei-grafici-js)
   - [C. Eseguire i Test Matematici](#c-eseguire-i-test-matematici)
   - [D. Compilazione Manuale del Bundle](#d-compilazione-manuale-del-bundle)
5. [Mappa del Repository](#5-mappa-del-repository)
6. [Guida all'Uso dei Grafici (`matephis-plot`)](#6-guida-alluso-dei-grafici-matephis-plot)
7. [Deploy Automatico su GitHub Pages](#7-deploy-automatico-su-github-pages)
8. [Risoluzione Problemi Frequenti (Troubleshooting)](#8-risoluzione-problemi-frequenti)

---

## 1. Architettura del Progetto

Il progetto è strutturato su tre livelli integrati:
- **Contenuti (Markdown + Obsidian)**: tutti gli appunti risiedono in `_notes/Public/` e possono essere modificati direttamente tramite [Obsidian](https://obsidian.md/) o qualunque editor di testo.
- **Generatore Statico (Jekyll / Ruby)**: converte le note Markdown in pagine HTML, processa le formule matematiche con **MathJax** e applica i layout.
- **Motore Interattivo (JavaScript ES6 / esbuild)**: i sorgenti modulari di `matephis-plot` si trovano in `assets/js/matephis-plot-src/` e vengono compilati in un unico file ottimizzato `assets/js/matephis-plot.js` tramite `esbuild`.

---

## 2. Prerequisiti di Sistema

Su macOS assicurati di avere installati:
- **Ruby & Bundler** (gestione dipendenze Jekyll):
  ```bash
  ruby -v
  bundle -v
  ```
- **Node.js & npm** (per il compilatore dei grafici e i test matematici):
  ```bash
  node -v   # v20+ raccomandata
  npm -v
  ```
  *Se non presente, installalo con Homebrew: `brew install node`.*

---

## 3. Installazione Iniziale

Se cloni il repository su un nuovo computer, esegui questi comandi una sola volta nella cartella radice:

```bash
# 1. Installa le dipendenze Ruby di Jekyll
bundle install

# 2. Installa le dipendenze npm per il bundler e i test
npm install
```

---

## 4. Flusso di Lavoro Quotidiano

### A. Scrivere e Modificare Appunti (Markdown)
Se devi solo scrivere o correggere lezioni, esercizi o formule matematiche, **non serve toccare Node**:
```bash
bundle exec jekyll serve
```
Apri il browser su **`http://localhost:4000`**. Ogni volta che salvi una nota in `_notes/Public/`, Jekyll ricarica automaticamente la pagina.

---

### B. Sviluppare il Codice dei Grafici JS
Quando modifichi i file JavaScript dentro `assets/js/matephis-plot-src/`:
```bash
npm run dev
```
Questo comando avvia **contemporaneamente** nello stesso terminale:
1. `esbuild --watch`: ricompila istantaneamente i sorgenti JS in `assets/js/matephis-plot.js` (in ~30 ms ad ogni salvataggio).
2. `bundle exec jekyll serve`: serve il sito locale su `http://localhost:4000`.

*Per uscire: premi `Ctrl + C`.*

---

### C. Eseguire i Test Matematici
Per verificare che il parser algebrico, le coordinate e le formule complesse non abbiano subito regressioni:
```bash
npm test
```
I test vengono eseguiti con **Vitest** in ambiente isolato headless (in meno di 1 secondo).

---

### D. Compilazione Manuale del Bundle
Per ricompilare il file finale `assets/js/matephis-plot.js` compresso e con sourcemap:
```bash
npm run build
```

---

## 5. Mappa del Repository

```
matephis/
├── _config.yml                     # Configurazione generale del sito e menu
├── _layouts/                       # Template HTML delle pagine (Post.html)
├── _includes/                      # Componenti riutilizzabili (Nav.html, Lightbox.html, ecc.)
├── _plugins/                       # Plugin Ruby custom per Jekyll:
│   ├── asset_injector.rb           # Inietta script JS/CSS se la pagina contiene grafici
│   ├── wikilinks_converter.rb      # Risolve i collegamenti [[nota]] a build-time
│   ├── difficulty_styler.rb        # Badge difficoltà esercizi (E, M, D)
│   ├── solution_styler.rb          # Soluzioni sfocate [sol: ...]
│   └── table_wrapper.rb            # Tabelle responsive con scroll
├── _notes/Public/                  # IL TUO MATERIALE SCOLASTICO (Markdown / Obsidian)
│   ├── matematica/                 # Appunti ed esercizi di matematica
│   ├── fisica/                     # Appunti ed esercizi di fisica
│   ├── interdisciplinare/          # Argomenti ponte e complementi
│   └── test-plot.md                # Pagina completa di collaudo visivo dei grafici
├── pages/                          # Pagine principali del sito (matematica.md, fisica.md, ecc.)
├── assets/
│   ├── css/
│   │   ├── style.css               # Stili globali, tipografia, dark mode e stampa (@media print)
│   │   └── matephis-plot.css       # Stili dei grafici, toolbar, slider e tooltip
│   └── js/
│       ├── matephis-plot.js        # File finale generato da esbuild (NON modificare a mano)
│       ├── matephis-circuit.js     # Schemi circuitali SVG
│       ├── matephis-draw.js        # Lavagna interattiva a mano libera
│       └── matephis-plot-src/      # SORGENTI MODULARI DI MATEPHIS-PLOT (Modifica qui!)
│           ├── core/               # CoordinateSystem.js, Plot.js, Config.js
│           ├── parser/             # ExpressionParser.js, ComplexParser.js
│           ├── renderers/          # GridRenderer, FunctionRenderer, ImplicitRenderer, ecc.
│           ├── interactions/       # PanZoom, SnappingEngine, AnalysisTools
│           └── ui/                 # Toolbar, SliderManager, LightboxBridge
├── package.json                    # Script di build (esbuild, vitest, concurrently)
└── .github/workflows/jekyll.yml    # Pipeline CI/CD di pubblicazione automatica su GitHub Pages
```

---

## 6. Guida all'Uso dei Grafici (`matephis-plot`)

Per inserire un grafico all'interno di qualsiasi nota Markdown, scrivi un blocco con linguaggio `matephis`:

````markdown
```matephis
{
  "xlim": [-5, 5],
  "ylim": [-2, 2],
  "interactive": true,
  "grid": true,
  "data": [
    { "fn": "sin(x)", "color": "red", "label": "f(x) = sin(x)" }
  ]
}
```
````

### Funzionalità Principali Supportate:
- **Funzioni esplicite**: `"fn": "x^2 - 3*x + 1"`
- **Equazioni implicite**: `"implicit": "x^2 + y^2 = 9"`
- **Parametri & Slider**:
  ```json
  "params": {
    "a": { "val": 1, "min": -3, "max": 3, "step": 0.1 }
  },
  "data": [{ "fn": "a * x^2" }]
  ```
- **Rette tangenti e derivate**: `"tangentSelection": true`, `"traceDerivative": true`.
- **Formule LaTeX nelle etichette**: accetta sintassi MathJax, es. `"label": "$e^{i\\pi} + 1 = 0$"`.

Per una panoramica esaustiva di tutte le opzioni con esempi visivi, visita la pagina locale `/notes/test-plot`.

---

## 7. Deploy Automatico su GitHub Pages

Ogni volta che effettui un `git push` sul branch `main`:
1. **GitHub Actions** riceve il codice.
2. Esegue in automatico `npm ci && npm run build` compilando i file JavaScript.
3. Esegue `bundle exec jekyll build` assemblando l'intero sito statico.
4. Pubblica il risultato sul dominio del sito.

Non devi compilare i file a mano prima di ogni commit: la pipeline fa tutto in automatico.

---

## 8. Risoluzione Problemi Frequenti

### La porta 4000 è già occupata
Se Jekyll segnala `Address already in use - bind(2) for 127.0.0.1:4000`:
```bash
# Trova e termina il processo Jekyll rimasto aperto in background
kill -9 $(lsof -ti :4000)
```

### Le modifiche a `matephis-plot-src` non si vedono nel browser
Assicurati di aver compilato il file con `npm run build` o di avere attivo `npm run dev` mentre sviluppi. Se necessario, forza il ricaricamento del browser con `Cmd + Shift + R` per pulire la cache.

### Errore `bundle exec jekyll` dopo aggiornamenti di sistema
Se Ruby o macOS hanno aggiornato librerie di sistema:
```bash
bundle install
```

---

*Matephis — "Dobbiamo sapere, sapremo!" (D. Hilbert)*