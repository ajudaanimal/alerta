---
layout: default
title: "Alerta Animal — Teste Nova Arquitetura"
description: "Página de teste modular"
---

<!-- Leaflet CSS & JS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

<!-- Mantemos temporariamente os estilos para validação rápida -->
<style>
  .site-main-content { max-width: 100% !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
  :root { --bg-main: #f8fafc; --card-bg: #ffffff; --text-main: #0f172a; --text-muted: #64748b; --border-color: #cbd5e1; --header-bg: #f1f5f9; --primary-color: #0284c7; }
  html.dark-mode, body.dark-mode, [data-theme="dark"] { --bg-main: #090d16; --card-bg: #111827; --text-main: #f8fafc; --text-muted: #94a3b8; --border-color: #1f2937; --header-bg: #1f2937; --primary-color: #38bdf8; }
  .map-page-wrapper { width: 100%; background: var(--bg-main); box-sizing: border-box; padding: 12px; }
  .map-content-layout { display: flex; flex-direction: column; gap: 12px; width: 100%; }
  .map-display-container { display: flex; flex-direction: column; gap: 8px; width: 100%; flex: 1; min-width: 0; }
  .map-external-filter { background: var(--card-bg); border: 1px solid var(--border-color); padding: 10px 14px; border-radius: 8px; display: flex; flex-direction: column; gap: 8px; }
  .map-filter-header { font-size: 10px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px; }
  .map-filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-pill { font-size: 11px; padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); cursor: pointer; font-weight: 600; color: var(--text-main); }
  .filter-pill.active { background: var(--primary-color); color: #ffffff; border-color: var(--primary-color); }
  .map-display-panel { position: relative; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; width: 100%; flex: 1; }
  #full-map { width: 100%; height: 100%; touch-action: pan-x pan-y; }
  .map-sidebar-panel { display: flex; flex-direction: column; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; width: 50%; min-width: 320px; max-width: calc(100% - 300px); }
  .map-search-bar { padding: 10px; background: var(--header-bg); border-bottom: 1px solid var(--border-color); }
  .map-search-input { width: 100%; padding: 8px 12px; background: var(--card-bg); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; box-sizing: border-box; outline: none; }
  .map-list-wrapper { width: 100%; overflow-y: auto; flex: 1; }
  .map-card-item { display: flex; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--border-color); background: var(--card-bg); transition: background 0.15s ease; align-items: center; cursor: pointer; user-select: none; }
  .map-card-item:hover { background: var(--header-bg); }
  .map-card-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); flex-shrink: 0; }
  .map-card-body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
  .map-card-top-row { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
  .map-card-title { font-size: 14px; font-weight: 800; color: var(--text-main); margin: 0; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .map-card-tags { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }
  .priority-badge { font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 3px; background: var(--header-bg); color: var(--text-muted); }
  .map-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 1px 5px; border-radius: 3px; }
  .badge-vermelho { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
  .badge-laranja  { background: rgba(249, 115, 22, 0.15); color: #ea580c; }
  .badge-amarelo  { background: rgba(217, 119, 6, 0.2); color: #d97706; }
  .badge-azul     { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
  .badge-default  { background: rgba(100, 116, 139, 0.15); color: #64748b; }
  .map-card-details-row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); gap: 8px; }
  .map-card-sub { font-weight: 600; color: var(--text-main); }
  .map-card-location { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .map-card-actions { display: flex; gap: 6px; align-items: center; font-size: 10px; font-weight: 700; color: var(--primary-color); margin-top: 2px; }
  .split-resizer { width: 6px; background: var(--border-color); cursor: col-resize; border-radius: 3px; transition: background 0.2s; display: none; }
  .split-resizer:hover { background: var(--primary-color); }
  .mobile-tab-nav { display: none; background: var(--card-bg); border-bottom: 1px solid var(--border-color); padding: 6px 10px; gap: 6px; }
  .mobile-tab-btn { flex: 1; padding: 7px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--header-bg); color: var(--text-main); font-weight: 700; font-size: 12px; cursor: pointer; text-align: center; }
  .mobile-tab-btn.active { background: var(--primary-color); color: #ffffff; border-color: var(--primary-color); }
  @media (min-width: 1024px) {
    .map-page-wrapper { height: calc(100vh - 75px); overflow: hidden; }
    .map-content-layout { display: flex; flex-direction: row; height: 100%; }
    .split-resizer { display: block; }
    .map-sidebar-panel { height: 100%; }
    .map-display-container { height: 100%; }
    .mobile-tab-nav { display: none !important; }
  }
  @media (max-width: 1023px) {
    .map-page-wrapper { height: calc(100vh - 60px); display: flex; flex-direction: column; padding: 0; }
    .mobile-tab-nav { display: flex; }
    .map-content-layout { flex: 1; display: flex; flex-direction: column; height: calc(100% - 44px); overflow: hidden; position: relative; }
    .split-resizer { display: none !important; }
    .map-sidebar-panel, .map-display-container { position: absolute; top: 0; left: 0; width: 100% !important; height: 100%; background: var(--bg-main); transition: opacity 0.2s ease; max-width: 100% !important; }
    .map-sidebar-panel { display: flex; z-index: 2; }
    .map-display-container { display: flex; z-index: 1; opacity: 0; pointer-events: none; }
    .map-page-wrapper.show-map .map-sidebar-panel { opacity: 0; pointer-events: none; z-index: 1; }
    .map-page-wrapper.show-map .map-display-container { opacity: 1; pointer-events: auto; z-index: 2; }
    .map-display-container { padding: 8px; box-sizing: border-box; }
  }
  .species-pin { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.3); border: 2px solid #ffffff; }
  .leaflet-popup-content-wrapper { background: var(--card-bg) !important; color: var(--text-main) !important; border: 1px solid var(--border-color); border-radius: 10px; padding: 0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
  .leaflet-popup-tip { background: var(--card-bg) !important; border: 1px solid var(--border-color); }
  .leaflet-popup-content { margin: 0 !important; line-height: normal; }
  .map-popup-card { display: flex; flex-direction: column; width: 240px; background: var(--card-bg); }
  .map-popup-img { width: 100%; height: 140px; object-fit: contain; object-position: center; background: var(--header-bg); border-bottom: 1px solid var(--border-color); }
  .map-popup-body { padding: 10px; display: flex; flex-direction: column; gap: 4px; }
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
