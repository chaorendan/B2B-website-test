/* ============================================================
   首页 Hero：实时晨昏线世界地图
   - 太阳直射点：NOAA 低精度太阳位置方程（赤纬 + 时差 EoT）
   - 夜半球：以反日点 antisolar 为圆心、半径 90° 的球面圆（物理正确）
   - 地图数据：自托管 land-110m（Natural Earth 陆地轮廓，不画国界/行政区界）
   依赖：assets/js/lib/d3.min.js、assets/js/lib/topojson-client.min.js
   ============================================================ */
(function(){
  var canvas = document.getElementById('map');
  if(!canvas || typeof d3 === 'undefined' || typeof topojson === 'undefined') return;
  var ctx = canvas.getContext('2d');

  var BEIJING = [116.40, 39.90];
  /* 'physical' = 反日点（物理正确）；'inverted' = 以直射点为暗区中心（风格化，物理错误） */
  var NIGHT_STYLE = 'physical';
  var LAND_URL = '/assets/data/land-110m.json';

  var world = null, projection = null, path = null;

  function currentTheme(){
    return document.documentElement.getAttribute('data-theme') || 'day';
  }
  function palette(){
    if(currentTheme() === 'night'){
      return {
        ocean:'#0f1c30', land:'#24384f', stroke:'rgba(255,255,255,.22)',
        tz:'rgba(255,255,255,.14)', nightFill:'rgba(3,8,18,.46)', term:'rgba(150,180,215,.22)',
        sunCore:'#f5b942', sunGlow0:'rgba(255,216,130,.85)',
        sunGlow1:'rgba(255,202,105,.35)', utc:'#7f93ad',
        utcStroke:'rgba(15,28,48,.9)', markerStroke:'#0d1626', label:'#dce6f2'
      };
    }
    return {
      ocean:'#cfe3f4', land:'#a9bfd3', stroke:'rgba(255,255,255,.7)',
      tz:'rgba(255,255,255,.6)', nightFill:'rgba(30,47,74,.46)', term:'rgba(255,255,255,.55)',
      sunCore:'#f5b942', sunGlow0:'rgba(255,216,130,.95)',
      sunGlow1:'rgba(255,202,105,.45)', utc:'#6b7f97',
      utcStroke:'rgba(255,255,255,.9)', markerStroke:'#fff', label:'#1c2b3a'
    };
  }

  /* ---------- NOAA 太阳直射点 ---------- */
  function subsolarPoint(date){
    var start = Date.UTC(date.getUTCFullYear(), 0, 1);
    var N = (date - start) / 86400000;
    var g = 2 * Math.PI * N / 365.24;
    var eot = 229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
    var dr = 0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
    var utcH = date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600;
    var lon = -15*(utcH-12+eot/60); lon = ((lon+540)%360)-180;
    return { lat: dr*180/Math.PI, lon: lon };
  }

  function resize(){
    var r = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    projection = d3.geoEquirectangular()
      .fitExtent([[-r.width*0.06, -r.height*0.35],[r.width*1.06, r.height*1.35]], {type:'Sphere'});
    path = d3.geoPath(projection, ctx);
    draw();
  }

  function drawMarker(coord, label, P){
    var p = projection(coord); if(!p) return;
    ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 2*Math.PI);
    ctx.fillStyle = '#e8593c'; ctx.fill();
    ctx.strokeStyle = P.markerStroke; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.font = '600 12px sans-serif';
    ctx.strokeStyle = P.markerStroke; ctx.lineWidth = 3;
    ctx.strokeText(label, p[0] + 9, p[1] - 7);
    ctx.fillStyle = P.label;
    ctx.fillText(label, p[0] + 9, p[1] - 7);
  }

  function draw(){
    if(!projection) return;
    var r = canvas.parentElement.getBoundingClientRect();
    var now = new Date();
    var sun = subsolarPoint(now);
    var P = palette();
    ctx.clearRect(0, 0, r.width, r.height);

    /* 海洋 */
    ctx.beginPath(); path({type:'Sphere'}); ctx.fillStyle = P.ocean; ctx.fill();

    /* 时区线：每 15° 虚线 */
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    for(var lon = -180; lon <= 180; lon += 15){
      var a = projection([lon, 89]), b = projection([lon, -89]);
      if(a && b){ ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    }
    ctx.strokeStyle = P.tz; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.restore();

    /* 陆地 */
    if(world){
      ctx.beginPath(); path(world);
      ctx.fillStyle = P.land; ctx.fill();
      ctx.strokeStyle = P.stroke; ctx.lineWidth = 0.7; ctx.stroke();
    }

    /* 暗区（夜半球）中心：反日点 antisolar —— 经度必须 +180° 后再规范到 ±180 */
    var darkCenter = (NIGHT_STYLE === 'inverted')
      ? [sun.lon, sun.lat]
      : [((sun.lon + 180 + 540) % 360) - 180, -sun.lat];
    var night = d3.geoCircle().center(darkCenter).radius(90)();
    ctx.save();
    if('filter' in ctx) ctx.filter = 'blur(7px)';
    ctx.beginPath(); path(night); ctx.fillStyle = P.nightFill; ctx.fill();
    ctx.restore();
    /* 晨昏线描边 */
    ctx.beginPath(); path(night);
    ctx.strokeStyle = P.term; ctx.lineWidth = 1; ctx.stroke();

    /* 太阳直射点：暖黄光晕 */
    var s = projection([sun.lon, sun.lat]);
    if(s){
      var g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], 52);
      g.addColorStop(0, P.sunGlow0);
      g.addColorStop(.35, P.sunGlow1);
      g.addColorStop(1, 'rgba(255,202,105,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s[0], s[1], 52, 0, 2*Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(s[0], s[1], 4.5, 0, 2*Math.PI);
      ctx.fillStyle = P.sunCore; ctx.fill();
    }

    drawMarker(BEIJING, '北京', P);

    /* 底轴：UTC 偏移刻度 */
    ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    for(var off = -11; off <= 11; off++){
      var p = projection([off*15, 0]);
      if(!p) continue;
      var label = off > 0 ? '+'+off : ''+off;
      ctx.strokeStyle = P.utcStroke; ctx.lineWidth = 3;
      ctx.strokeText(label, p[0], r.height - 10);
      ctx.fillStyle = P.utc;
      ctx.fillText(label, p[0], r.height - 35);
    }
    ctx.textAlign = 'start';
  }

  window.addEventListener('resize', resize);
  document.addEventListener('chaorendan:themechange', draw);

  d3.json(LAND_URL)
    .then(function(t){ world = topojson.feature(t, t.objects.land); resize(); })
    .catch(function(){ resize(); });

  resize();
  setInterval(draw, 30000);
})();
