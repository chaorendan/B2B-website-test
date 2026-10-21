/* 点击粒子爆裂（P1 约束下的粒子实践）
 *
 * 与原「彩球」的区别：不是把一整颗 150px 的实心球放大，而是在落点炸开一簇
 * 直径 1.5–3px 的小点 + 一圈细冲击波。小点之间有大量空隙，压在文字上也不会
 * 形成遮挡；总时长 0.55s，落点周围 60–80px 内结束。
 *
 * 硬约束（全部可测）：
 *   1. 单 canvas、懒创建、空闲时 rAF 完全停止（不空转）；
 *   2. 全局粒子上限 360，连续狂点也不会堆栈；
 *   3. 正文/表格/代码/图片/链接/一切表单控件不触发；
 *   4. 拖选（位移 > 8px）或有选区不触发；
 *   5. 触屏（any-pointer: coarse）与「减少动效」直接退出；
 *   6. canvas pointer-events:none、z-index 20，不拦截点击、不覆盖页头下拉。
 *
 * 作用范围：只在 front matter 写了 js 的页面加载（当前 /tools/ 三个操作页）。
 */
(function () {
  'use strict';

  if (!document.body) return;

  var mqReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqCoarse = window.matchMedia && window.matchMedia('(any-pointer: coarse)');
  if ((mqReduce && mqReduce.matches) || (mqCoarse && mqCoarse.matches)) return;

  var SKIP = [
    'a', 'button', 'input', 'select', 'textarea', 'label', 'summary', 'option',
    '[contenteditable="true"]', '[role="button"]', '[role="tab"]', '[role="link"]',
    'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
    'td', 'th', 'dl', 'dt', 'dd', 'figcaption',
    'pre', 'code', 'table', 'img', 'svg', 'video', 'iframe', 'canvas',
    '.post-body', '.post-summary', '.tools-menu', '.lang-menu', '.theme-toggle'
  ].join(',');

  var MAX_PARTS = 360;      /* 全局粒子上限 */
  var PER_CLICK = 14;       /* 每次爆裂粒子数 */
  var LIFE = 0.55;          /* 秒 */
  var SPEED_MIN = 70;
  var SPEED_MAX = 190;
  var GRAVITY = 210;        /* px/s²，轻微下坠，避免「烟花」感 */
  var RING_MS = 0.4;

  var canvas = null, ctx = null, dpr = 1, vw = 0, vh = 0;
  var parts = [], rings = [];
  var raf = 0, lastT = 0;

  function ensureCanvas() {
    if (canvas && canvas.isConnected) return;
    canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize, { passive: true });
  }

  function resize() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function colors() {
    var cs = getComputedStyle(document.documentElement);
    var a = (cs.getPropertyValue('--accent') || '#e8593c').trim();
    var b = (cs.getPropertyValue('--accent2') || '#2f6db3').trim();
    return [a, b, a, b];   /* 主色权重高一倍，避免变成彩虹 */
  }

  function burst(x, y) {
    ensureCanvas();

    var pal = colors();
    for (var i = 0; i < PER_CLICK; i++) {
      if (parts.length >= MAX_PARTS) break;
      /* 角度均分 + 抖动：分布均匀但不机械 */
      var ang = (Math.PI * 2 * i) / PER_CLICK + (Math.random() - 0.5) * 0.55;
      var sp = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      parts.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 18,
        r: 1.5 + Math.random() * 1.5,
        c: pal[i % pal.length],
        t: 0,
        max: LIFE * (0.82 + Math.random() * 0.36)
      });
    }

    if (rings.length < 8) {
      rings.push({ x: x, y: y, t: 0, max: RING_MS });
    }

    if (!raf) {
      lastT = 0;
      raf = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    if (!lastT) lastT = now;
    var dt = Math.min((now - lastT) / 1000, 0.05);   /* 切标签页回来不跳帧 */
    lastT = now;

    ctx.clearRect(0, 0, vw, vh);

    var alive = 0;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.t += dt;
      if (p.t >= p.max) continue;

      var drag = Math.pow(0.9, dt * 60);
      p.vx *= drag;
      p.vy = p.vy * drag + GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      var k = 1 - p.t / p.max;
      ctx.globalAlpha = k * k;                      /* 二次淡出，尾巴不拖泥 */
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.45 + 0.55 * k), 0, 6.2832);
      ctx.fill();

      parts[alive++] = p;
    }
    parts.length = alive;

    var aliveRings = 0;
    for (var j = 0; j < rings.length; j++) {
      var g = rings[j];
      g.t += dt;
      if (g.t >= g.max) continue;
      var kk = g.t / g.max;
      ctx.globalAlpha = 0.42 * (1 - kk);
      ctx.strokeStyle = pal0();
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 4 + 34 * easeOut(kk), 0, 6.2832);
      ctx.stroke();
      rings[aliveRings++] = g;
    }
    rings.length = aliveRings;

    ctx.globalAlpha = 1;

    if (alive || aliveRings) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      lastT = 0;
      ctx.clearRect(0, 0, vw, vh);                  /* 收尾：画布必须回到全透明 */
    }
  }

  function pal0() {
    var cs = getComputedStyle(document.documentElement);
    return (cs.getPropertyValue('--accent') || '#e8593c').trim();
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  var down = null;

  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || !e.isPrimary) { down = null; return; }
    down = { x: e.clientX, y: e.clientY, target: e.target };
  }, true);

  document.addEventListener('pointerup', function (e) {
    if (!down) return;
    var dx = Math.abs(e.clientX - down.x);
    var dy = Math.abs(e.clientY - down.y);
    var target = down.target;
    down = null;

    if (dx > 8 || dy > 8) return;                    /* 拖拽 / 划选 */
    if (!target || typeof target.closest !== 'function') return;
    if (target.closest(SKIP)) return;                /* 正文与控件 */
    var sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;           /* 已有选区 */

    burst(e.clientX, e.clientY);
  }, true);
})();
