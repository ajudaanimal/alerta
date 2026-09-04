---
layout: default
title: "Alerta Animal — Teste Nova Arquitetura"
description: "Página de teste modular"
---

<!-- Leaflet CSS & JS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

<!-- Mantemos temporariamente os estilos para validação rápida -->
<link rel="stylesheet" href="{{ '/map-styles.css' | relative_url }}?v=2">

<div class="map-page-wrapper" id="mapPageWrapper">
  <div class="mobile-tab-nav">
    <button type="button" class="mobile-tab-btn active" id="tabBtnList" onclick="switchMobileTab('list')">📋 Lista & Fichas</button>
    <button type="button" class="mobile-tab-btn" id="tabBtnMap" onclick="switchMobileTab('map')">🗺️ Ver no Mapa</button>
  </div>

  <div class="map-content-layout" id="mapContentLayout">
    <!-- Inclusão Modular da Barra Lateral (Lista) -->
    <div class="map-sidebar-panel" id="mapSidebarPanel">
      {% include map-sidebar.html %}
    </div>

    <div class="split-resizer" id="splitResizer"></div>

    <!-- Inclusão Modular do Display do Mapa -->
    {% include map-display.html %}
  </div>
</div>

<script>
  window.ocorrenciasData = [
    {% assign sorted_posts = site.ocorrencias | sort: 'date' | reverse %}
    {% for post in sorted_posts %}
      {% assign t = post.triagem | strip | downcase %}
      {% assign est_caso = post.estado_caso | strip | downcase %}
      {% assign est_fisico = post.estado_fisico | strip | downcase %}
      {% assign theme_color = "#2563eb" %}
      {% assign color_key = "default" %}
      {% if est_caso contains 'resolvido' %}{% assign theme_color = "#16a34a" %}{% assign color_key = "azul" %}
      {% elsif t contains 'vermelho' or est_fisico contains 'ferido' or est_fisico contains 'crítico' or est_fisico contains 'critico' %}{% assign theme_color = "#dc2626" %}{% assign color_key = "vermelho" %}
      {% elsif t contains 'laranja' or est_fisico contains 'urgente' %}{% assign theme_color = "#f97316" %}{% assign color_key = "laranja" %}
      {% elsif t contains 'amarelo' %}{% assign theme_color = "#d97706" %}{% assign color_key = "amarelo" %}
      {% endif %}
      {
        index: {{ forloop.index0 }},
        especie: {{ post.especie | default: "Animal" | jsonify }},
        concelho: {{ post.concelho | default: post.localidade | default: post.distrito | default: '' | jsonify }},
        estado_fisico: {{ post.estado_fisico | default: "Estado N/D" | jsonify }},
        url: {{ post.url | relative_url | jsonify }},
        color: {{ theme_color | jsonify }},
        colorKey: {{ color_key | jsonify }},
        imagem: {{ post.imagem | default: '' | jsonify }}
      }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];
</script>
<script src="{{ '/map-app.js' | relative_url }}"></script>
