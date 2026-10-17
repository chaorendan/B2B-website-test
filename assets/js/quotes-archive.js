/* 每日一言 · 往期日历
   依赖：quotes-data.js（数据）→ quotes-core.js（取词）→ 本文件（界面）
   日期与内容的对应关系全部由 QuoteLib 决定，本文件不做任何取词判断。 */
(function () {
  var L = window.QuoteLib;
  var grid = document.getElementById('qa-grid');
  if (!L || !grid) { return; }

  var titleEl = document.getElementById('qa-title');
  var cardEl = document.getElementById('qa-card');
  var WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];

  var now = new Date();
  var state = { y: now.getFullYear(), m: now.getMonth(), sel: L.today() };

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

  /* 周一为一周之首：0=周一 … 6=周日 */
  function firstWeekday(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7; }

  function keyOf(y, m, d) { return y + '-' + L.pad(m + 1) + '-' + L.pad(d); }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderGrid() {
    titleEl.textContent = state.y + ' 年 ' + (state.m + 1) + ' 月';
    var today = L.today();
    var html = [];
    var lead = firstWeekday(state.y, state.m);
    for (var i = 0; i < lead; i++) {
      html.push('<span class="qa-cell qa-cell--blank" aria-hidden="true"></span>');
    }
    var total = daysInMonth(state.y, state.m);
    for (var d = 1; d <= total; d++) {
      var k = keyOf(state.y, state.m, d);
      var r = L.resolve(k);
      var cls = 'qa-cell';
      if (r && r.pinned) { cls += ' is-pinned'; }
      if (k === today) { cls += ' is-today'; }
      if (k === state.sel) { cls += ' is-selected'; }
      html.push('<button type="button" class="' + cls + '" data-date="' + k + '"' +
        (k === state.sel ? ' aria-current="date"' : '') + '>' + d + '</button>');
    }
    grid.innerHTML = html.join('');
  }

  function renderCard(key) {
    var r = L.resolve(key);
    if (!r) { return; }
    var wd = WEEK_CN[r.day.getDay()];
    var badge = r.pinned ? '当天留档' : '轮播回放';
    cardEl.innerHTML =
      '<p class="qa-card__meta">' +
        '<time class="qa-card__date" datetime="' + key + '">' + key + '　星期' + wd + '</time>' +
        '<span class="qa-card__badge' + (r.pinned ? ' is-pinned' : '') + '">' + badge + '</span>' +
      '</p>' +
      '<blockquote class="qa-card__zh" lang="zh">' + esc(r.item.zh) + '</blockquote>' +
      '<p class="qa-card__tr" lang="en">' + esc(r.item.en) + '</p>' +
      '<p class="qa-card__tr" lang="fr">' + esc(r.item.fr) + '</p>' +
      '<div class="qa-card__nav">' +
        '<button type="button" class="qa-link" data-step="-1">&larr; 前一天</button>' +
        '<button type="button" class="qa-link" data-today>回到今天</button>' +
        '<button type="button" class="qa-link" data-step="1">后一天 &rarr;</button>' +
      '</div>';
  }

  function select(key, silent) {
    var d = L.fromISO(key);
    if (!d) { return; }
    state.sel = key;
    state.y = d.getFullYear();
    state.m = d.getMonth();
    renderGrid();
    renderCard(key);
    if (!silent) {
      try { history.replaceState(null, '', '#' + key); } catch (e) { location.hash = key; }
    }
  }

  function shiftDay(delta) {
    var d = L.fromISO(state.sel);
    if (!d) { return; }
    d.setDate(d.getDate() + delta);
    select(L.iso(d));
  }

  function shiftMonth(delta) {
    state.m += delta;
    if (state.m < 0) { state.m = 11; state.y -= 1; }
    if (state.m > 11) { state.m = 0; state.y += 1; }
    renderGrid();
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-date]') : null;
    if (btn) { select(btn.getAttribute('data-date')); }
  });

  cardEl.addEventListener('click', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-step')) { shiftDay(parseInt(t.getAttribute('data-step'), 10)); }
    else if (t.hasAttribute('data-today')) { select(L.today()); }
  });

  document.getElementById('qa-prev').addEventListener('click', function () { shiftMonth(-1); });
  document.getElementById('qa-next').addEventListener('click', function () { shiftMonth(1); });

  document.addEventListener('keydown', function (e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) { return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); shiftDay(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); shiftDay(1); }
  });

  window.addEventListener('hashchange', function () {
    var k = (location.hash || '').replace('#', '');
    if (L.fromISO(k) && k !== state.sel) { select(k, true); }
  });

  var initial = (location.hash || '').replace('#', '');
  select(L.fromISO(initial) ? initial : L.today());
})();
