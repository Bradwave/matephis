---
title: Fisica
layout: Post
permalink: /fisica/
---

# Fisica

Raccolta di appunti, simulazioni vettoriali ed esercizi di fisica: meccanica classica, termodinamica, onde, ottica ed elettromagnetismo.

<div class="subject-feed">
  <ul class="post-list">
    {%- for note in site.notes -%}
      {%- if note.subject == 'fisica' or note.path contains 'fisica/' or note.tags contains 'fisica' or note.title contains 'Dinamica' or note.title contains 'Energia' or note.title contains 'Calore' or note.title contains 'Elettrostatica' or note.title contains 'Circuiti' or note.title contains 'Onde' or note.title contains 'Ottica' -%}
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
