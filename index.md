---
layout: default
title: "Alerta Animal — Teste Nova Arquitetura"
description: "Página de teste modular"
---

<!-- Leaflet CSS & JS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

<style>
:root {
  --primary-color: #2563eb;
  --bg-main: #f8fafc;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-main);
  background-color: var(--bg-main);
  margin: 0;
  padding: 0;
}

#mapContentLayout {
  display: flex;
  height: calc(100vh - 60px);
  width: 100vw;
  overflow: hidden;
}

#mapSidebarPanel {
  width: 420px;
  min-width: 300px;
  max-width: 600px;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  overflow-y: auto;
}

#splitResizer {
  width: 6px;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;
  z-index: 20;
}

#splitResizer:hover {
  background: var(--primary-color);
}

#mapMainArea {
  flex: 1;
  height: 100%;
  position: relative;
}

#full-map {
  width: 100%;
  height: 100%;
}

.species-pin {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  border: 2px solid #ffffff;
}

.map-popup-card {
  display: flex;
  gap: 10px;
  width: 220px;
}

.map-popup-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.map-popup-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-pill {
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-pill.active {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
}

.map-card-item img, .map-sidebar-panel img {
  width: 80px !important;
  height: 80px !important;
  min-width: 80px !important;
  object-fit: cover !important;
  border-radius: 8px;
}

@media (max-width: 1023px) {
  #mapContentLayout {
    flex-direction: column;
  }
  #mapSidebarPanel {
    width: 100% !important;
    max-width: 100% !important;
    height: calc(100vh - 120px);
  }
  #splitResizer {
    display: none;
  }
  #mapPageWrapper.show-map #mapSidebarPanel {
    display: none;
  }
  #mapPageWrapper:not(.show-map) #mapMainArea {
    display: none;
  }
}
</style>

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
