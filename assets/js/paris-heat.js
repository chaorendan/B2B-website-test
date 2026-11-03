/* 巴黎热浪应急空间 WebGIS · 成果展示页
 * 设计要点：
 * 1) 首屏不加载 Leaflet（约 140KB JS + 15KB CSS），滚动接近地图才注入；
 * 2) 所有几何/统计已离线预处理，前端只做分级设色与点击交互；
 * 3) 语义纪律：这里的指标叫「空间关注度」，不做「热浪风险预测」的表述。
 */
(function () {
  'use strict';

  var ROOT = document.getElementById('phw');
  if (!ROOT) return;

  var DATA_URL = {
    districts: '/assets/data/paris/districts.geojson',
    facilities: '/assets/data/paris/facilities.geojson'
  };
  var LEAFLET = {
    css: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
    js: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
  };
  // 设施分组配色与源项目 facilities.js 保持同源，避免同一设施在两个页面里换颜色
  var GROUP_COLOR = {
    '游泳': '#2980b9',
    '开放凉爽空间': '#27ae60',
    '博物馆': '#8e44ad',
    '图书馆': '#6d4c41',
    '淋浴浴室': '#00bcd4',
    '区政府': '#e67e22',
    '其它避暑相关': '#9e9e9e'
  };

  // 分级设色：breaks 为 4 个断点 → 5 个等级；色带两端色取自源项目 thematicStyle.js
  var VARS = {
    pct65: {
      label: '65+ 人口占比',
      field: 'pct65',
      ramp: [[254, 230, 206], [166, 54, 3]],
      breaks: [14, 17, 20, 23, 26],
      unit: '%',
      digits: 2,
      note: '按 15 岁以上常住人口中 65 岁及以上占比分级。'
    },
    density65: {
      label: '65+ 人口密度',
      field: 'density65',
      ramp: [[254, 230, 206], [166, 54, 3]],
      breaks: [1500, 2500, 3500, 4500, 5500],
      unit: ' 人/km²',
      digits: 0,
      note: '用 65+ 人口数除以行政区面积（含所属公园绿地）。'
    },
    facDensity: {
      label: '降温设施密度',
      field: 'facDensity',
      ramp: [[229, 245, 227], [27, 94, 32]],
      breaks: [3, 5, 7, 9, 11],
      unit: ' 个/km²',
      digits: 1,
      note: '公共降温设施按登记区码归集后除以面积，越高代表步行可达的点位越密。'
    }
  };

  var state = { variable: 'facDensity', facilities: true, selected: null };
  var map, districtLayer, facilityLayer, legendEl, cardEl;
  var districts = null;
  var city = null;
  var booted = false;

  function lerpColor(a, b, t) {
    return '#' + a.map(function (v, i) {
      return Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0');
    }).join('');
  }
  function classColor(spec, idx) {
    return lerpColor(spec.ramp[0], spec.ramp[1], idx === 4 ? 1 : (idx + 0.5) / 5 * 0.92);
  }
  function classOf(spec, v) {
    if (!Number.isFinite(v)) return -1;
    for (var i = 0; i < spec.breaks.length; i++) {
      if (v < spec.breaks[i]) return i;
    }
    return spec.breaks.length;
  }
  function rangeLabel(spec, idx) {
    var u = spec.unit;
    var b = spec.breaks;
    if (idx === 0) return '< ' + b[0] + u;
    if (idx === b.length) return '≥ ' + b[b.length - 1] + u;
    return b[idx - 1] + ' – ' + b[idx] + u;
  }
  function fmt(v, digits) {
    if (!Number.isFinite(v)) return '—';
    return v.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  // ---------- 资源懒加载 ----------
  function loadCss(href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  function loadJs(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function fetchJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }
  function setLoadMsg(text) {
    var el = ROOT.querySelector('.phw-load');
    if (el) el.innerHTML = text;
  }

  function boot() {
    if (booted) return;
    booted = true;
    loadCss(LEAFLET.css);
    Promise.all([loadJs(LEAFLET.js), fetchJson(DATA_URL.districts), fetchJson(DATA_URL.facilities)])
      .then(function (res) {
        districts = res[1];
        initMap(res[2]);
      })
      .catch(function (err) {
        setLoadMsg('地图资源加载失败：' + esc(err.message) +
          '<span class="phw-load__hint">数据与统计表仍可在下方查看；Leaflet 与底图需要联网加载。</span>');
      });
  }

  // ---------- 初始化 ----------
  function initMap(facilities) {
    var loadEl = ROOT.querySelector('.phw-load');
    if (loadEl) loadEl.remove();

    map = L.map('phw-map', {
      center: [48.8566, 2.3522],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      scrollWheelZoom: false,   // 避免读者滚动页面时被地图劫持
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      detectRetina: true,
      attribution: '底图 © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 贡献者 · © <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    districtLayer = L.geoJSON(districts, {
      style: function (f) { return districtStyle(f); },
      onEachFeature: function (f, layer) {
        layer.on({
          click: function () { selectDistrict(f.properties.num); },
          mouseover: function () { if (state.selected !== f.properties.num) layer.setStyle({ weight: 2, color: '#3d2c1c' }); },
          mouseout: function () {
            if (state.selected === f.properties.num) layer.setStyle({ weight: 2.4, color: '#2b2118' });
            else districtLayer.resetStyle(layer);
          }
        });
      }
    }).addTo(map);

    facilityLayer = L.geoJSON(facilities, {
      pointToLayer: function (f, latlng) {
        return L.circleMarker(latlng, {
          radius: 4.2,
          weight: 1,
          color: '#fffdf9',
          opacity: 0.85,
          fillColor: GROUP_COLOR[f.properties.g] || '#9e9e9e',
          fillOpacity: 0.9
        });
      },
      onEachFeature: function (f, layer) {
        var p = f.properties;
        layer.bindPopup(
          '<b>' + esc(p.n || '未命名设施') + '</b>' +
          esc(p.t) + ' · ' + esc(p.g) + '<br>' +
          esc(p.a || '地址未登记') + '<br>' +
          '登记区码 ' + esc(p.d || '—') + ' · ' + (p.p === 'Oui' ? '收费' : p.p === 'Non' ? '免费' : '收费信息未登记')
        );
      }
    });
    if (state.facilities) facilityLayer.addTo(map);

    buildLegend();
    buildCityCard();

    // 城市范围：所有行政区的外接框
    map.fitBounds(districtLayer.getBounds(), { padding: [6, 6] });

    // 变量切换
    ROOT.querySelectorAll('.phw-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { setVariable(btn.getAttribute('data-var')); });
    });
    var sw = ROOT.querySelector('#phw-fac-toggle');
    if (sw) sw.addEventListener('change', function () {
      state.facilities = sw.checked;
      if (state.facilities) { facilityLayer.addTo(map); if (facilityLayer.bringToFront) facilityLayer.bringToFront(); }
      else map.removeLayer(facilityLayer);
      buildLegend();
    });

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) map.flyTo([48.8566, 2.3522], 12, { duration: 0.6 });
  }

  function districtStyle(f) {
    var spec = VARS[state.variable];
    var v = Number(f.properties[spec.field]);
    var idx = classOf(spec, v);
    return {
      color: '#6b5a44',
      weight: 0.9,
      fillColor: idx < 0 ? '#cccccc' : classColor(spec, idx),
      fillOpacity: 0.8
    };
  }

  function setVariable(key) {
    if (!VARS[key] || key === state.variable) return;
    state.variable = key;
    ROOT.querySelectorAll('.phw-tab').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-var') === key ? 'true' : 'false');
    });
    if (districtLayer) {
      districtLayer.setStyle(districtStyle);
      if (state.selected) {
        // 重新选中高亮，避免 setStyle 把边框重置掉
        districtLayer.eachLayer(function (l) {
          if (l.feature.properties.num === state.selected) l.setStyle({ weight: 2.4, color: '#2b2118' });
        });
      }
    }
    buildLegend();
    if (state.selected) renderCard(state.selected);
  }

  function selectDistrict(num) {
    state.selected = num;
    districtLayer.eachLayer(function (l) {
      var on = l.feature.properties.num === num;
      l.setStyle(on ? { weight: 2.4, color: '#2b2118' } : districtStyle(l.feature));
      if (on && l.bringToFront) l.bringToFront();
    });
    if (facilityLayer && state.facilities && facilityLayer.bringToFront) facilityLayer.bringToFront();
    renderCard(num);
  }

  // ---------- 图例 ----------
  function buildLegend() {
    legendEl = legendEl || ROOT.querySelector('.phw-legend');
    if (!legendEl) return;
    var spec = VARS[state.variable];
    var rows = '';
    for (var i = 0; i <= spec.breaks.length; i++) {
      rows += '<div class="phw-legend__row"><i class="phw-legend__sw" style="background:' +
        classColor(spec, i) + '"></i><span>' + esc(rangeLabel(spec, i)) + '</span></div>';
    }
    var dots = '';
    if (state.facilities) {
      dots = '<div class="phw-legend__dots">' + Object.keys(GROUP_COLOR).map(function (g) {
        return '<span class="phw-legend__dot"><i style="background:' + GROUP_COLOR[g] + '"></i>' + esc(g) + '</span>';
      }).join('') + '</div>';
    }
    legendEl.innerHTML = '<p class="phw-legend__title">' + esc(spec.label) + '</p>' + rows + dots;
  }

  // ---------- 侧栏 ----------
  function buildCityCard() {
    var f = districts.features;
    city = f.reduce(function (a, x) {
      var p = x.properties;
      a.pop65 += p.pop65; a.pop15 += p.pop15; a.fac += p.fac; a.area += p.area;
      a.free += p.free; return a;
    }, { pop65: 0, pop15: 0, fac: 0, area: 0, free: 0 });
    city.pct = city.pop65 / city.pop15 * 100;
    city.density = city.fac / city.area;

    cardEl = ROOT.querySelector('.phw-card');
    cardEl.innerHTML =
      '<p class="phw-card__eyebrow">20 个行政区 · 汇总</p>' +
      '<h3 class="phw-card__title">巴黎全市</h3>' +
      '<p class="phw-card__sub">点击地图上任意一个区，查看该区明细</p>' +
      '<div class="phw-stats">' +
        stat('65+ 人口', fmt(city.pop65, 0), ' 人') +
        stat('65+ 占比', fmt(city.pct, 2), '%') +
        stat('降温设施', fmt(city.fac, 0), ' 个') +
        stat('设施密度', fmt(city.density, 2), ' 个/km²') +
      '</div>' +
      '<p class="phw-delta">全市 15+ 人口 <b>' + fmt(city.pop15, 0) + '</b> 人，行政区面积合计 <b>' +
        fmt(city.area, 1) + ' km²</b>（含所属公园绿地）。</p>' +
      '<p class="phw-card__note">指标口径：人口字段来自行政区 GeoJSON 的 2020 年人口摘要；设施按登记区码归集，未做空间叠置。当前展示为「空间关注度」，不等同于热浪风险预测。</p>';
  }

  function stat(k, v, unit) {
    return '<div class="phw-stat"><span class="phw-stat__k">' + esc(k) + '</span>' +
      '<span class="phw-stat__v">' + v + '<small>' + esc(unit) + '</small></span></div>';
  }

  function renderCard(num) {
    var feat = districts.features.filter(function (f) { return f.properties.num === num; })[0];
    if (!feat || !city) return;
    var p = feat.properties;
    var diffPct = p.pct65 - city.pct;
    var diffDensity = p.facDensity - city.density;
    var sign = function (v) { return (v > 0 ? '+' : '') + fmt(v, 2); };

    var groups = Object.keys(p.facGroups).sort(function (a, b) { return p.facGroups[b] - p.facGroups[a]; });
    var maxG = groups.length ? p.facGroups[groups[0]] : 1;
    var bars = groups.map(function (g) {
      return '<li><div class="phw-bars__top"><span>' + esc(g) + '</span><span>' + p.facGroups[g] + '</span></div>' +
        '<div class="phw-bars__track"><div class="phw-bars__fill" style="width:' +
        Math.max(6, Math.round(p.facGroups[g] / maxG * 100)) + '%;background:' + (GROUP_COLOR[g] || '#9e9e9e') +
        '"></div></div></li>';
    }).join('');

    cardEl.innerHTML =
      '<p class="phw-card__eyebrow">第 ' + p.num + ' 区 · ' + esc(p.commune) + '</p>' +
      '<h3 class="phw-card__title">' + esc(p.name) + '</h3>' +
      '<p class="phw-card__sub">面积 ' + fmt(p.area, 2) + ' km² · 15+ 人口 ' + fmt(p.pop15, 0) + ' 人</p>' +
      '<div class="phw-stats">' +
        stat('65+ 人口', fmt(p.pop65, 0), ' 人') +
        stat('65+ 占比', fmt(p.pct65, 2), '%') +
        stat('降温设施', fmt(p.fac, 0), ' 个') +
        stat('设施密度', fmt(p.facDensity, 1), ' 个/km²') +
      '</div>' +
      '<p class="phw-delta">与全市均值相比：占比 <b>' + sign(diffPct) + '</b> 个百分点；设施密度 <b>' +
        sign(diffDensity) + '</b> 个/km²。免费设施 <b>' + p.free + '</b> 个，收费 <b>' + p.paid + '</b> 个。</p>' +
      '<ul class="phw-bars">' + (bars || '<li>该区未登记降温设施。</li>') + '</ul>' +
      '<p class="phw-card__note">设施归属以名录中的登记区码为准，可能与设施的几何位置略有偏差。</p>';
  }

  // ---------- 懒启动 ----------
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        boot();
      }
    }, { rootMargin: '250px 0px' });
    io.observe(ROOT);
  } else {
    boot();
  }
})();
