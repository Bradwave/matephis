---
title: Board · Benchmark
layout: BoardBench
permalink: /board/bench/
---

<style>
  .bench-body { margin: 0; background: var(--bg, #fff); color: var(--text, #111); font-family: var(--font, sans-serif); }
  .bench-page { max-width: 960px; margin: 0 auto; padding: 24px 16px 48px; }
  .bench-page h1 { font-size: 1.6rem; margin: 0 0 4px; }
  .bench-page p { margin: 6px 0 14px; line-height: 1.45; }
  .bench-page table { width: 100%; border-collapse: collapse; margin: 8px 0 20px; font-size: 0.95rem; }
  .bench-page th, .bench-page td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--border, #ddd); }
  .bench-page th { width: 34%; font-weight: 600; }
  .bench-page th small { display: block; font-weight: 400; opacity: 0.7; margin-top: 2px; }
  .bench-page td { font-family: "Space Mono", monospace; font-size: 0.85rem; word-break: break-word; }
  .bench-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 12px 0; }
  .bench-actions button { font: inherit; font-size: 1.05rem; padding: 12px 18px; min-height: 48px; border: 1px solid var(--title, #111); background: var(--bg, #fff); color: var(--title, #111); cursor: pointer; }
  .bench-actions button[data-start] { background: var(--title, #111); color: var(--bg, #fff); }
  .bench-actions button:disabled { opacity: 0.4; }
  .bench-page textarea { width: 100%; min-height: 160px; font-family: "Space Mono", monospace; font-size: 0.75rem; box-sizing: border-box; }
  [data-status] { font-weight: 600; min-height: 1.4em; }
  .bench-running { overflow: hidden; }
  .bench-stage { z-index: 50; background: #fff; }
  .bench-fill { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 50; background: #fff; }
</style>

<div id="matephis-bench" class="bench-page">
  <h1>Lavagna · prova delle prestazioni</h1>
  <p>Misura quanto questo dispositivo è veloce con la lavagna: scrittura, spostamento e zoom, grafici e fisica. Dura circa un minuto; durante la prova lo schermo mostra la lavagna in movimento, non toccarlo. Per un risultato fedele usa lo schermo intero. Non salva nulla e non tocca le lavagne salvate.</p>
  <div class="bench-actions">
    <button type="button" data-fullscreen>Schermo intero</button>
    <button type="button" data-start>Avvia la prova</button>
    <button type="button" data-copy>Copia i risultati</button>
    <button type="button" data-download>Scarica i risultati</button>
  </div>
  <p data-status></p>
  <h2>Dispositivo</h2>
  <table><tbody data-device></tbody></table>
  <h2>Risultati</h2>
  <table><tbody data-results></tbody></table>
  <textarea data-json readonly placeholder="I risultati completi compaiono qui."></textarea>
  <div id="bench-host"></div>
</div>
