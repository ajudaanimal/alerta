let mapInstance;
  let allMarkersLayerGroup;
  let allMarkersData = [];
  let itemsBySlug = {};
  let activeColorFilter = 'all';
  let activeSpeciesFilter = 'all';
  let currentActiveCircle = null;
  let currentSelectedSlug = null;
  var portugalBounds = [[36.95, -9.56], [42.15, -6.19]];

  const ocorrenciasData = [
    {% for item in sorted_scored %}
      {% assign parts = item | split: "___" %}
      {% assign original_index = parts[1] | times: 1 %}
      {% assign post = sorted_posts[original_index] %}

      {% assign t = post.triagem | strip | downcase %}
      {% assign est_caso = post.estado_caso | strip | downcase %}
      {% assign est_fisico = post.estado_fisico | strip | downcase %}
      {% assign theme_color = "#2563eb" %}
      {% assign color_key = "default" %}
      {% assign banner_class = "banner-red" %}
      {% assign badge_class = "badge-default" %}

      {% if est_caso contains 'resolvido' %}
        {% assign theme_color = "#16a34a" %}
        {% assign color_key = "azul" %}
        {% assign banner_class = "banner-resolved" %}
        {% assign badge_class = "badge-azul" %}
      {% elsif t contains 'vermelho' or est_fisico contains 'ferido' or est_fisico contains 'crítico' or est_fisico contains 'critico' %}
        {% assign theme_color = "#dc2626" %}
        {% assign color_key = "vermelho" %}
        {% assign banner_class = "banner-red" %}
        {% assign badge_class = "badge-vermelho" %}
      {% elsif t contains 'laranja' or est_fisico contains 'urgente' %}
        {% assign theme_color = "#f97316" %}
        {% assign color_key = "laranja" %}
        {% assign banner_class = "banner-orange" %}
        {% assign badge_class = "badge-laranja" %}
      {% elsif t contains 'amarelo' %}
        {% assign theme_color = "#d97706" %}
        {% assign color_key = "amarelo" %}
        {% assign banner_class = "banner-yellow" %}
        {% assign badge_class = "badge-amarelo" %}
      {% endif %}

      {
        slug: {{ post.slug | jsonify }},
        id: {{ post.id | default: "N/D" | jsonify }},
        especie: {{ post.especie | default: "Animal" | jsonify }},
        concelho: {{ post.concelho | default: post.localidade | default: post.distrito | default: '' | jsonify }},
        freguesia: {{ post.freguesia | default: post.localidade | default: '' | jsonify }},
        distrito: {{ post.distrito | default: '' | jsonify }},
        estado_fisico: {{ post.estado_fisico | default: "Estado N/D" | jsonify }},
        estado_caso: {{ post.estado_caso | default: "N/D" | jsonify }},
        triagem: {{ post.triagem | default: "N/D" | jsonify }},
        situacao: {{ post.situacao | default: "N/D" | jsonify }},
        idade: {{ post.idade | default: "Não indicada" | jsonify }},
        dateRaw: {{ post.date | date: "%s" | default: 0 | jsonify }},
        data: {{ post.date | date: "%d/%m/%Y" | jsonify }},
        observacoes: {{ post.observacoes | default: "Sem observações adicionais registadas." | jsonify }},
        url: {{ post.url | relative_url | jsonify }},
        color: {{ theme_color | jsonify }},
        colorKey: {{ color_key | jsonify }},
        bannerClass: {{ banner_class | jsonify }},
        badgeClass: {{ badge_class | jsonify }},
        imagem: {{ post.imagem | relative_url | default: 'https://raw.githubusercontent.com/ajudaanimal/alerta/main/_assets/img/animal.jpeg' | jsonify }},
        lat: {{ post.lat | default: "" | jsonify }},
        lon: {{ post.lon | default: "" | jsonify }}
      }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];

  document.addEventListener("DOMContentLoaded", function() {
    initMap();
    handleInitialRoute();
    
    window.addEventListener('popstate', function() {
      handleInitialRoute();
    });
    
    if (window.innerWidth <= 992) {
      const backBtn = document.querySelector('.mobile-back-btn');
      if (backBtn) backBtn.style.display = 'flex';
    }
  });

  // SPA Router Handler for seamless transitions between main page and ficha pages
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href && link.href.startsWith(window.location.origin)) {
      if (link.classList.contains('btn-open-ficha') || link.dataset.spa === "true" || link.pathname.includes('/ocorrencias/')) {
        e.preventDefault();
        navigateToSpaUrl(link.href);
      }
    }
  });

  function navigateToSpaUrl(url) {
    history.pushState({ path: url }, '', url);
    loadContentViaSpa(url, true);
  }

  function loadContentViaSpa(url, pushHistory = false) {
    const wrapper = document.getElementById('appLayoutWrapper');
    if (!wrapper) {
      window.location.href = url;
      return;
    }

    wrapper.style.opacity = '0.7';

    fetch(url)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMainContent = doc.querySelector('#appLayoutWrapper') || doc.querySelector('main');
        
        if (newMainContent) {
          wrapper.innerHTML = newMainContent.innerHTML;
          wrapper.style.opacity = '1';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          if (document.getElementById('full-map')) {
            mapInstance = null;
            initMap();
            handleHashOnLoad();
          }
        } else {
          window.location.href = url;
        }
      })
      .catch(err => {
        console.warn('SPA navigation error, falling back:', err);
        window.location.href = url;
      });
  }

  function handleInitialRoute() {
    const path = window.location.pathname;
    const hash = window.location.hash.replace('#', '');
    
    if (hash && ocorrenciasData.some(i => i.slug === hash)) {
      selectOccurrence(hash, false);
    }
  }

  window.addEventListener('resize', function() {
    const backBtn = document.querySelector('.mobile-back-btn');
    if (backBtn) {
      backBtn.style.display = (window.innerWidth <= 992) ? 'flex' : 'none';
    }
  });

  function getSpeciesEmoji(especieStr) {
    const esp = especieStr ? especieStr.toLowerCase() : '';
    if (esp.includes('gato') || esp.includes('felino')) return '🐱';
    if (esp.includes('cão') || esp.includes('cao') || esp.includes('canídeo')) return '🐶';
    if (esp.includes('ave') || esp.includes('pássaro') || esp.includes('gaivota')) return '🐦';
    return '🐾';
  }

  function getSpeciesCategory(especieStr) {
    const esp = especieStr ? especieStr.toLowerCase() : '';
    if (esp.includes('gato') || esp.includes('felino')) return 'felino';
    if (esp.includes('cão') || esp.includes('cao') || esp.includes('canídeo')) return 'canideo';
    if (esp.includes('ave') || esp.includes('pássaro') || esp.includes('gaivota')) return 'ave';
    return 'outro';
  }

  function initMap() {
    if (mapInstance) return;
    const mapElement = document.getElementById('full-map');
    if (!mapElement) return;

    mapInstance = L.map('full-map', { 
      attributionControl: false,
      tap: false,
      touchZoom: true,
      scrollWheelZoom: true
    });

    mapInstance.fitBounds(portugalBounds);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_3494_1_8eeb09fcfa7dbb0a9063b727', {
      maxZoom: 19,
      subdomains: 'abcd',
      updateWhenIdle: true,
      keepBuffer: 6
    }).addTo(mapInstance);

    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 250);

    allMarkersLayerGroup = L.layerGroup().addTo(mapInstance);

    ocorrenciasData.forEach(function(item) {
      var lat = parseFloat(item.lat);
      var lon = parseFloat(item.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        criarMarcador(lat, lon, item);
      }
    });
  }

  function criarMarcador(lat, lon, item) {
    var radiusMeters = 1200;

    var circleArea = L.circle([lat, lon], {
      radius: radiusMeters,
      color: '#dc2626',
      weight: 2,
      opacity: 0.9,
      fill: false,
      fillOpacity: 0,
      dashArray: '4, 4'
    });

    var emojiIcon = getSpeciesEmoji(item.especie);
    var iconHtml = '<div class="species-pin" style="background-color: ' + item.color + ';">' + emojiIcon + '</div>';

    var customIcon = L.divIcon({
      className: '',
      html: iconHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    var marker = L.marker([lat, lon], { icon: customIcon });

    marker.on('click', function() {
      selectOccurrence(item.slug, true);
      if (window.innerWidth <= 992) {
        switchMobileTab('ficha');
      }
    });

    var mapObj = {
      marker: marker,
      circle: circleArea,
      colorKey: item.colorKey,
      speciesKey: getSpeciesCategory(item.especie),
      slug: item.slug
    };

    allMarkersData.push(mapObj);
    itemsBySlug[item.slug] = mapObj;

    if ((activeColorFilter === 'all' || item.colorKey === activeColorFilter) && 
        (activeSpeciesFilter === 'all' || getSpeciesCategory(item.especie) === activeSpeciesFilter)) {
      allMarkersLayerGroup.addLayer(marker);
    }
  }

  function handleListItemClick(slug) {
    selectOccurrence(slug, true);
    if (window.innerWidth <= 992) {
      switchMobileTab('map');
    }
  }

  function selectOccurrence(slug, updateHash = true) {
    const item = ocorrenciasData.find(i => i.slug === slug);
    if (!item) return;

    currentSelectedSlug = slug;

    if (updateHash) {
      history.pushState(null, null, '#' + slug);
    }

    document.querySelectorAll('.map-card-item').forEach(el => el.classList.remove('selected'));
    const cardEl = document.getElementById('card-item-' + slug);
    if (cardEl) {
      cardEl.classList.add('selected');
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const mapObj = itemsBySlug[slug];
    if (mapObj && mapInstance) {
      var latLng = mapObj.marker.getLatLng();
      
      if (currentActiveCircle && mapInstance.hasLayer(currentActiveCircle)) {
        mapInstance.removeLayer(currentActiveCircle);
      }
      
      mapObj.circle.addTo(mapInstance);
      currentActiveCircle = mapObj.circle;

      mapInstance.setView(latLng, 14, { animate: true });
    }

     const previewCard = document.getElementById('mapPreviewCard');
     if (previewCard) {
     previewCard.innerHTML = `
      <div style="position: absolute; top: 6px; right: 6px; z-index: 5;">
        <a href="${item.url}" class="btn-open-ficha" title="Ver Ficha Completa" style="background: var(--primary-color, #2563eb); color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; box-sizing: border-box; height: 24px;">Ver Ficha ↗</a>
      </div>
      <img id="mapPreviewImg" src="${item.imagem}" alt="Animal">
      <div class="map-preview-info" style="padding-top: 14px;">
        <div class="map-preview-title">
          <span id="mapPreviewSpecies">${item.especie}</span>
          <span id="mapPreviewBadge" class="map-badge ${item.badgeClass}">${item.triagem}</span>
        </div>
        <div class="map-preview-loc" id="mapPreviewLocality">📍 ${item.concelho || item.distrito || ''}</div>
      </div>
    `;
    previewCard.style.display = 'flex';
    }

    const headerExpandBtn = document.getElementById('panelHeaderExpandBtn');
    if (headerExpandBtn) {
      headerExpandBtn.href = item.url;
      headerExpandBtn.style.display = 'inline-flex';
    }

    const rightPanelInner = document.getElementById('appRightPanelInner');
    if (rightPanelInner) {
      rightPanelInner.innerHTML = `
        <div class="ficha-wrapper">
          <header class="report-header" style="background-color: ${item.color};">
            <div>
              <h1>${item.especie}</h1>
              <div style="font-size:10.5px; opacity:0.9;">📍 ${item.concelho || item.distrito || ''}</div>
            </div>
            <div style="text-align:right; font-size:10.5px;">
              <div>${item.data}</div>
              <strong>ID: ${item.id}</strong>
            </div>
          </header>

          <div class="status-banner ${item.bannerClass}">
            ${item.triagem} — ${item.estado_fisico}
          </div>

          <div class="ficha-img-container">
            <img src="${item.imagem}" alt="Fotografia do animal">
          </div>

          <div class="details-grid">
            <div class="detail-item"><strong>Localidade</strong><span>${item.freguesia || 'Não indicada'}</span></div>
            <div class="detail-item"><strong>Concelho</strong><span>${item.concelho || 'Não indicado'}</span></div>
            <div class="detail-item"><strong>Distrito</strong><span>${item.distrito || 'Não indicado'}</span></div>
            <div class="detail-item"><strong>Idade</strong><span>${item.idade}</span></div>
            <div class="detail-item"><strong>Situação</strong><span>${item.situacao}</span></div>
            <div class="detail-item"><strong>Estado Caso</strong><span>${item.estado_caso}</span></div>
          </div>

          <h2 class="section-title">🩺 Observações</h2>
          <div class="content-box">
            ${item.observacoes}
          </div>
        </div>
      `;
    }

    if (window.innerWidth > 992) {
      document.getElementById('appLayoutWrapper').classList.remove('hide-right');
      if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 300);
    }
  }

  function unexpandOccurrence() {
    history.pushState(null, null, window.location.pathname);
    if (currentActiveCircle && mapInstance && mapInstance.hasLayer(currentActiveCircle)) {
      mapInstance.removeLayer(currentActiveCircle);
    }
    const previewCard = document.getElementById('mapPreviewCard');
    if (previewCard) previewCard.style.display = 'none';
    
    document.querySelectorAll('.map-card-item').forEach(el => el.classList.remove('selected'));
    currentSelectedSlug = null;
    
    const headerExpandBtn = document.getElementById('panelHeaderExpandBtn');
    if (headerExpandBtn) {
      headerExpandBtn.style.display = 'none';
      headerExpandBtn.href = '#';
    }

    const rightPanelInner = document.getElementById('appRightPanelInner');
    if (rightPanelInner) {
      rightPanelInner.innerHTML = `
        <div class="ficha-placeholder">
          <span style="font-size: 28px;">🐾</span>
          <strong>Selecione uma ocorrência</strong>
          <p style="margin: 0; font-size: 11px;">Clique num registo da lista ou num marcador no mapa para inspecionar os detalhes.</p>
        </div>
      `;
    }
    if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 300);
  }

  function handleHashOnLoad() {
    const hash = window.location.hash.replace('#', '');
    if (hash && ocorrenciasData.some(i => i.slug === hash)) {
      selectOccurrence(hash, false);
    }
  }

  function toggleLeftPanel() {
    const wrapper = document.getElementById('appLayoutWrapper');
    wrapper.classList.toggle('hide-left');
    if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 300);
  }

  function toggleRightPanel() {
    const wrapper = document.getElementById('appLayoutWrapper');
    wrapper.classList.toggle('hide-right');
    if (wrapper.classList.contains('hide-right')) {
      unexpandOccurrence();
    }
    if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 300);
  }

  function switchMobileTab(tabName) {
    const wrapper = document.getElementById('appLayoutWrapper');
    if (!wrapper) return;
    wrapper.classList.remove('mobile-view-list', 'mobile-view-map', 'mobile-view-ficha');
    wrapper.classList.add('mobile-view-' + tabName);

    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    if (tabName === 'list') document.getElementById('navBtnList')?.classList.add('active');
    if (tabName === 'map') {
      document.getElementById('navBtnMap')?.classList.add('active');
      if (mapInstance) {
        setTimeout(() => {
          mapInstance.invalidateSize();
          if (!currentActiveCircle) {
            mapInstance.fitBounds(portugalBounds);
          }
        }, 200);
      }
    }
    if (tabName === 'ficha') document.getElementById('navBtnFicha')?.classList.add('active');
  }

  function filterMapByColor(colorKey, btnElement) {
    if (btnElement.classList.contains('active')) {
      btnElement.classList.remove('active');
      activeColorFilter = 'all';
    } else {
      document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
      btnElement.classList.add('active');
      activeColorFilter = colorKey;
    }
    applyCombinedFilters();
  }

  function filterMapBySpecies(speciesKey, btnElement) {
    if (btnElement.classList.contains('active')) {
      btnElement.classList.remove('active');
      activeSpeciesFilter = 'all';
    } else {
      document.querySelectorAll('.species-pill').forEach(function(p) { p.classList.remove('active'); });
      btnElement.classList.add('active');
      activeSpeciesFilter = speciesKey;
    }
    applyCombinedFilters();
  }

  function applyCombinedFilters() {
    var searchQuery = normalizeText(document.getElementById('mapSearchInput') ? document.getElementById('mapSearchInput').value : '');
    
    if (mapInstance && allMarkersLayerGroup) {
      allMarkersLayerGroup.clearLayers();
      allMarkersData.forEach(function(itemObj) {
        var matchesColor = (activeColorFilter === 'all' || itemObj.colorKey === activeColorFilter);
        var matchesSpecies = (activeSpeciesFilter === 'all' || itemObj.speciesKey === activeSpeciesFilter);
        if (matchesColor && matchesSpecies) {
          allMarkersLayerGroup.addLayer(itemObj.marker);
        }
      });
    }

    var rows = document.querySelectorAll('.map-card-item');
    rows.forEach(function(row) {
      var rColor = row.getAttribute('data-color');
      var rSpecies = row.getAttribute('data-species');
      var tags = normalizeText(row.getAttribute('data-search-tags') || '') + " " + normalizeText(row.innerText);
      
      var matchesColor = (activeColorFilter === 'all' || rColor === activeColorFilter);
      var matchesSpecies = (activeSpeciesFilter === 'all' || rSpecies === activeSpeciesFilter);
      var matchesSearch = tags.includes(searchQuery);

      row.style.display = (matchesColor && matchesSpecies && matchesSearch) ? "flex" : "none";
    });
  }

  function normalizeText(text) {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  }

  function filterMapManifest() {
    applyCombinedFilters();
  }
