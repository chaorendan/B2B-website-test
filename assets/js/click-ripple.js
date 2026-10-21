/* 点击涟漪（P1：装饰不得干扰正文阅读与排版）
 *
 * 设计约束（来自对电子礼簿「彩球」实现的复盘）：
 *   1. 环形而非实心 —— 中心透明，压在字上也不挡字；
 *   2. 小且短 —— 直径 56px、0.42s，远小于原来 150px / 0.7s；
 *   3. 只打「空白」—— 正文、表格、代码、图片、链接与一切表单控件都不触发；
 *   4. 拖选不触发 —— pointerup 位移 > 8px 或存在选区就放弃；
 *   5. 触屏与「减少动效」直接退出 —— 手指挡住球心等于无反馈；
 *   6. 层级 20 —— 低于页头下拉(60)与弹层，不覆盖任何内容层。
 *
 * 作用范围：只在 front matter 写了 js 的页面加载（当前是 /tools/ 三个操作型页面）。
 * 阅读页不放装饰，这是本方案对「不影响正文」的最终答案。
 */
(function () {
  'use strict';

  if (!document.body) return;

  var mqReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqCoarse = window.matchMedia && window.matchMedia('(any-pointer: coarse)');
  if ((mqReduce && mqReduce.matches) || (mqCoarse && mqCoarse.matches)) return;

  /* 不触发的区域：正文与一切可交互/可选中元素 */
  var SKIP = [
    'a', 'button', 'input', 'select', 'textarea', 'label', 'summary', 'option',
    '[contenteditable="true"]', '[role="button"]', '[role="tab"]', '[role="link"]',
    'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
    'td', 'th', 'dl', 'dt', 'dd', 'figcaption',
    'pre', 'code', 'table', 'img', 'svg', 'video', 'iframe', 'canvas',
    '.post-body', '.post-summary', '.tools-menu', '.lang-menu', '.theme-toggle'
  ].join(',');

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

    if (dx > 8 || dy > 8) return;                                  /* 拖拽、划选 */
    if (typeof target.closest !== 'function') return;
    if (target.closest(SKIP)) return;                              /* 正文/控件 */
    var sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;                         /* 已有选区 */

    spawn(e.clientX, e.clientY);
  }, true);

  function spawn(x, y) {
    var ring = document.createElement('span');
    ring.className = 'click-ripple';
    ring.setAttribute('aria-hidden', 'true');
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    document.body.appendChild(ring);

    var done = false;
    function drop() {
      if (done) return;
      done = true;
      ring.remove();
    }
    ring.addEventListener('animationend', drop, { once: true });
    setTimeout(drop, 800);                                         /* 兜底清理 */
  }
})();
