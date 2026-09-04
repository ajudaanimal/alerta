let mapInstance;
  let allMarkersLayerGroup = [];
  let allMarkersData = [];
  let markersByIndex = {};
  let activeColorFilter = 'all';
  let cardClickTimer = null;

  document.addEventListener("DOMContentLoaded", function() {
    initMap();
    initSplitPane();
    setTimeout(function() {
      if (mapInstance) mapInstance.invalidateSize();
    }, 400);
  });

  function handleCardClick(event, originalIndex, url) {
    if (event.target.tagName === 'A') return;
    if (cardClickTimer === null) {
      cardClickTimer = setTimeout(function() {
        cardClickTimer = null;
        focusOnMarker(originalIndex);
      }, 300);
    } else {
      clearTimeout(cardClickTimer);
      cardClickTimer = null;
      window.location.href = url;
    }
  }

  function switchMobileTab(tab) {
    const wrapper = document.getElementById('mapPageWrapper');
    const btnList = document.getElementById('tabBtnList');
    const btnMap = document.getElementById('tabBtnMap');
    if (tab === 'map') {
      wrapper.classList.add('show-map');
      btnMap.classList.add('active');
      btnList.classList.remove('active');
      setTimeout(function() { if (mapInstance) mapInstance.invalidateSize(); }, 200);
    } else {
      wrapper.classList.remove('show-map');
      btnList.classList.add('active');
      btnMap.classList.remove('active');
    }
  }

  function initSplitPane() {
    const resizer = document.getElementById('splitResizer');
    const sidebar = document.getElementById('mapSidebarPanel');
    const container = document.getElementById('mapContentLayout');
    if (!resizer) return;
    let isResizing = false;
    resizer.addEventListener('mousedown', function(e) {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
    window.addEventListener('mousemove', function(e) {
      if (!isResizing) return;
      const containerRect = container.getBoundingClientRect();
      let newWidth = e.clientX - containerRect.left;
      if (newWidth > 300 && newWidth < containerRect.width - 300) {
        sidebar.style.width = newWidth + 'px';
        sidebar.style.maxWidth = 'none';
        if (mapInstance) mapInstance.invalidateSize();
      }
    });
    window.addEventListener('mouseup', function() {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        if (mapInstance) mapInstance.invalidateSize();
      }
    });
  }

  function getSpeciesEmoji(especieStr) {
    const esp = especieStr ? especieStr.toLowerCase() : '';
    if (esp.includes('gato') || esp.includes('felino')) return '🐱';
    if (esp.includes('cão') || esp.includes('cao') || esp.includes('canídeo')) return '🐶';
    if (esp.includes('ave') || esp.includes('pássaro') || esp.includes('passaro') || esp.includes('gaivota')) return '🐦';
    return '🐾';
  }

  function initMap() {
    if (mapInstance) return;
    mapInstance = L.map('full-map', { attributionControl: false, tap: false, touchZoom: true });
    var portugalBounds = [[36.95, -9.56], [42.15, -6.19]];
    mapInstance.fitBounds(portugalBounds);
    L.control.attribution({ prefix: false }).addAttribution('&copy; OpenStreetMap').addTo(mapInstance);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance);
    allMarkersLayerGroup = L.layerGroup().addTo(mapInstance);

    var ocorrencias = window.ocorrenciasData || [];

    var locaisValidos = ocorrencias.filter(function(item) {
      return item.concelho && item.concelho !== "Não indicada" && item.concelho.trim() !== "";
    });

    var indexFila = 0;
    function processarProximoLocal() {
      if (indexFila >= locaisValidos.length) return;
      var item = locaisValidos[indexFila];
      var cacheKey = "geo_" + item.concelho.toLowerCase().trim();
      var cachedCoords = localStorage.getItem(cacheKey);

      if (cachedCoords) {
        var coords = JSON.parse(cachedCoords);
        var m = criarMarcador(coords.lat, coords.lon, item);
        allMarkersData.push(m);
        allMarkersLayerGroup.addLayer(m);
        indexFila++;
        processarProximoLocal();
      } else {
        var query = encodeURIComponent(item.concelho + ", Portugal");
        fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + query + '&limit=1')
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data && data.length > 0) {
              var lat = parseFloat(data[0].lat);
              var lon = parseFloat(data[0].lon);
              localStorage.setItem(cacheKey, JSON.stringify({ lat: lat, lon: lon }));
              var m = criarMarcador(lat, lon, item);
              allMarkersData.push(m);
              allMarkersLayerGroup.addLayer(m);
            }
          })
          .catch(function(err) { console.error(err); })
          .finally(function() { indexFila++; setTimeout(processarProximoLocal, 600); });
      }
    }
    if (locaisValidos.length > 0) processarProximoLocal();
  }

  function criarMarcador(lat, lon, item) {
    var emojiIcon = getSpeciesEmoji(item.especie);
    var iconHtml = '<div class="species-pin" style="background-color: ' + item.color + ';">' + emojiIcon + '</div>';
    var customIcon = L.divIcon({ className: '', html: iconHtml, iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15] });
    var marker = L.marker([lat, lon], { icon: customIcon });
    marker.options.colorKey = item.colorKey;
    marker.options.originalIndex = item.index;

    marker.bindPopup(
      '<div class="map-popup-card">' +
        '<img src="' + (item.imagem || 'https://raw.githubusercontent.com/ajudaanimal/alerta/main/_assets/img/animal.jpeg') + '" class="map-popup-img" alt="">' +
        '<div class="map-popup-body">' +
          '<strong style="color: ' + item.color + '; font-size: 14px;">' + (item.especie || 'Animal') + '</strong>' +
          '<span style="font-size: 12px; color: var(--text-main);">🩺 ' + item.estado_fisico + '</span>' +
          '<span style="font-size: 12px; color: var(--text-muted);">📍 ' + (item.concelho || 'Local N/D') + '</span>' +
          '<a href="' + item.url + '" style="color: ' + item.color + '; font-weight:700; font-size: 12px; margin-top: 4px; text-decoration: none;">Ver Ficha Completa →</a>' +
        '</div>' +
      '</div>',
      { autoPan: true, autoPanPadding: [40, 40] }
    );
    markersByIndex[item.index] = marker;
    return marker;
  }

  function focusOnMarker(originalIndex) {
    var marker = markersByIndex[originalIndex];
    if (marker) {
      if (window.innerWidth < 1024) switchMobileTab('map');
      setTimeout(function() {
        if (mapInstance) {
          mapInstance.invalidateSize();
          mapInstance.setView(marker.getLatLng(), 12, { animate: true });
          mapInstance.once('moveend', function() { marker.openPopup(); });
        }
      }, 150);
    }
  }

  function filterMapByColor(colorKey, btnElement) {
    document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
    btnElement.classList.add('active');
    activeColorFilter = colorKey;
    applyCombinedFilters();
  }

  function applyCombinedFilters() {
    var searchQuery = normalizeText(document.getElementById('mapSearchInput').value);
    if (mapInstance) {
      allMarkersLayerGroup.clearLayers();
      allMarkersData.forEach(function5 => {
        // ...
      });
      allMarkersData.forEach(function(marker) {
        if (activeColorFilter === 'all' || marker.options.colorKey === activeColorFilter) {
          allMarkersLayerGroup.addLayer(marker);
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
