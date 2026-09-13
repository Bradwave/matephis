---
title: Matematica
layout: Post
permalink: /matematica/
---

# Matematica

Raccolta di appunti, percorsi teorici ed esercizi guidati di matematica: dall'algebra e geometria analitica fino all'analisi infinitesimale.

<div class="subject-feed">
  <ul class="post-list">
    {%- for note in site.notes -%}
      {%- if note.subject == 'matematica' or note.path contains 'matematica/' or note.tags contains 'matematica' or note.title contains 'Funzioni' or note.title contains 'Parabola' or note.title contains 'Derivata' or note.title contains 'Limiti' or note.title contains 'Equazioni' or note.title contains 'Disequazioni' or note.title contains 'Esponenziale' -%}
        <li class="post-item">
          <div class="post-header">
            <a class="post-link" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
          </div>
          {%- if note.description -%}
            <p class="post-excerpt">{{ note.description }}</p>
          {%- endif -%}
        </li>
      {%- endif -%}
    {%- endfor -%}
  </ul>
</div>
