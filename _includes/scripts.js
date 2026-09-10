let mapInstance;
  let allMarkersLayerGroup;
  let allMarkersData = [];
  let itemsBySlug = {};
  let activeColorFilter = 'all';
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
    handleHashOnLoad();
    window.addEventListener('hashchange', handleHashOnLoad);
    
    if (window.innerWidth <= 992) {
      const backBtn = document.querySelector('.mobile-back-btn');
      if (backBtn) backBtn.style.display = 'flex';
    }
  });

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

  function initMap() {
    if (mapInstance) return;

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
      slug: item.slug
    };

    allMarkersData.push(mapObj);
    itemsBySlug[item.slug] = mapObj;

    if (activeColorFilter === 'all' || item.colorKey === activeColorFilter) {
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
    document.getElementById('mapPreviewImg').src = item.imagem;
    document.getElementById('mapPreviewSpecies').textContent = item.especie;
    document.getElementById('mapPreviewLocality').textContent = '📍 ' + (item.concelho || 'Localização aproximada');
    
    const badgeEl = document.getElementById('mapPreviewBadge');
    badgeEl.className = 'map-badge ' + item.badgeClass;
    badgeEl.textContent = item.triagem;
    
    previewCard.style.display = 'flex';

    const rightPanelInner = document.getElementById('appRightPanelInner');
    rightPanelInner.innerHTML = `
      <div class="ficha-wrapper">
        <header class="report-header" style="background-color: ${item.color};">
          <div>
            <h1>${item.especie}</h1>
            <div style="font-size:10.5px; opacity:0.9;">📍 ${item.concelho} (Localização aproximada)</div>
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

        <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
          <a href="${item.url}" target="_blank" style="background: ${item.color}; color: #ffffff; padding: 7px 12px; border-radius: 6px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 11px;">Abrir Ficha Completa ↗</a>
        </div>
      </div>
    `;

    if (window.innerWidth > 992) {
      document.getElementById('appLayoutWrapper').classList.remove('hide-right');
      if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 300);
    }
  }

  function openActiveFicha() {
    if (currentSelectedSlug) {
      if (window.innerWidth <= 992) {
        switchMobileTab('ficha');
      } else {
        const wrapper = document.getElementById('appLayoutWrapper');
        wrapper.classList.remove('hide-right');
        if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 300);
      }
    }
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
      history.pushState(null, null, window.location.pathname);
      if (currentActiveCircle && mapInstance && mapInstance.hasLayer(currentActiveCircle)) {
        mapInstance.removeLayer(currentActiveCircle);
      }
      const previewCard = document.getElementById('mapPreviewCard');
      if (previewCard) previewCard.style.display = 'none';
      currentSelectedSlug = null;
    }
    if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 300);
  }

  function switchMobileTab(tabName) {
    const wrapper = document.getElementById('appLayoutWrapper');
    wrapper.classList.remove('mobile-view-list', 'mobile-view-map', 'mobile-view-ficha');
    wrapper.classList.add('mobile-view-' + tabName);

    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    if (tabName === 'list') document.getElementById('navBtnList').classList.add('active');
    if (tabName === 'map') {
      document.getElementById('navBtnMap').classList.add('active');
      if (mapInstance) {
        setTimeout(() => {
          mapInstance.invalidateSize();
          if (!currentActiveCircle) {
            mapInstance.fitBounds(portugalBounds);
          }
        }, 200);
      }
    }
    if (tabName === 'ficha') document.getElementById('navBtnFicha').classList.add('active');
  }

  function filterMapByColor(colorKey, btnElement) {
    document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
    btnElement.classList.add('active');
    activeColorFilter = colorKey;
    applyCombinedFilters();
  }

  function applyCombinedFilters() {
    var searchQuery = normalizeText(document.getElementById('mapSearchInput').value);
    
    if (mapInstance && allMarkersLayerGroup) {
      allMarkersLayerGroup.clearLayers();
      allMarkersData.forEach(function(itemObj) {
        var matchesColor = (activeColorFilter === 'all' || itemObj.colorKey === activeColorFilter);
        if (matchesColor) {
          allMarkersLayerGroup.addLayer(itemObj.marker);
        }
      });
    }

    var rows = document.querySelectorAll('.map-card-item');
    rows.forEach(function(row) {
      var rColor = row.getAttribute('data-color');
      var tags = normalizeText(row.getAttribute('data-search-tags') || '') + " " + normalizeText(row.innerText);
      var matchesColor = (activeColorFilter === 'all' || rColor === activeColorFilter);
      var matchesSearch = tags.includes(searchQuery);

      row.style.display = (matchesColor && matchesSearch) ? "flex" : "none";
    });
  }

  function normalizeText(text) {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  }

  function filterMapManifest() {
    applyCombinedFilters();
  }
