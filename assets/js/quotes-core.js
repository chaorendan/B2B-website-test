/* 每日一言 · 解析内核（首页卡片与 /quotes/ 归档页共用）
   数据来源：quotes-data.js 提供的 window.__DAILY_QUOTES__
   取词规则：① 当天有 date 定点 → 用它；② 否则 dayNumber % cycle 轮播。
   cycle 冻结在 60：新增条目只追加、不重排，历史日期的对应关系才不会漂移。 */
(function () {
  var DATA = window.__DAILY_QUOTES__ || {};
  var ITEMS = DATA.items || [];
  var CYCLE = DATA.cycle || ITEMS.length || 1;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  /* 本地年月日折算成连续天序号，跨月跨年都不跳变 */
  function dayNumber(d) {
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  /* 严格解析 YYYY-MM-DD；非法日期（如 2026-02-30）返回 null */
  function fromISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) { return null; }
    var y = +m[1], mo = +m[2] - 1, da = +m[3];
    var d = new Date(y, mo, da);
    if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) { return null; }
    return d;
  }

  function pinnedIndex(key) {
    for (var i = 0; i < ITEMS.length; i++) {
      if (ITEMS[i].date === key) { return i; }
    }
    return -1;
  }

  function resolve(dateLike) {
    /* 鸭子类型判断 Date，避免跨 realm（iframe/测试环境）下 instanceof 失效 */
    var d = (dateLike && typeof dateLike.getFullYear === 'function') ? dateLike : fromISO(dateLike);
    if (!d || !ITEMS.length) { return null; }
    var key = iso(d);
    var pi = pinnedIndex(key);
    if (pi >= 0) {
      return { date: key, index: pi, item: ITEMS[pi], pinned: true, day: d };
    }
    var n = dayNumber(d) % CYCLE;
    if (n < 0) { n += CYCLE; }
    var i = n % ITEMS.length;
    return { date: key, index: i, item: ITEMS[i], pinned: false, day: d };
  }

  window.QuoteLib = {
    items: ITEMS,
    cycle: CYCLE,
    iso: iso,
    pad: pad,
    fromISO: fromISO,
    dayNumber: dayNumber,
    resolve: resolve,
    today: function () { return iso(new Date()); },
    hasPinned: function () {
      for (var i = 0; i < ITEMS.length; i++) { if (ITEMS[i].date) { return true; } }
      return false;
    }
  };
})();
