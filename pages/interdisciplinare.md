---
title: Interdisciplinare
layout: Post
permalink: /interdisciplinare/
---

# Interdisciplinare

Modelli matematici applicati ai fenomeni fisici, teoria dei segnali, serie di Fourier e percorsi di connessione tra fisica e matematica.

<div class="subject-feed">
  <ul class="post-list">
    {%- for note in site.notes -%}
      {%- if note.subject == 'interdisciplinare' or note.path contains 'interdisciplinare/' or note.path contains 'fourier' or note.path contains 'seriedifourier' or note.tags contains 'interdisciplinare' or note.title contains 'Fourier' or note.title contains 'Complessi' -%}
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
