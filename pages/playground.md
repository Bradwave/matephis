---
title: Playground
layout: Post
permalink: /playground/
content-type: static
plot: true
physics: true
---

<link href="{{ site.baseurl }}/assets/css/matephis-playground.css?v=0.1" rel="stylesheet" />

<div class="playground" id="playground">
<div class="playground-bar">
<label>Motore <select id="pg-engine"><option value="physics">physics</option><option value="matephis">matephis (grafici)</option></select></label>
<label>Esempio <select id="pg-example"></select></label>
<button type="button" id="pg-copy">Copia blocco</button>
<span class="playground-status" id="pg-status" role="status"></span>
</div>
<div class="playground-panes">
<div class="playground-preview" id="pg-preview"></div>
<textarea id="pg-source" spellcheck="false" autocomplete="off" aria-label="Configurazione JSON"></textarea>
</div>
</div>

<script src="{{ site.baseurl }}/assets/js/matephis-playground.js?v=0.6"></script>
