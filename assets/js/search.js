/* ==========================================================================
   站内搜索（MVP）
   索引：/search.json —— Jekyll 构建时由 Liquid 生成，无需任何后端或第三方服务
   特性：懒加载 + 会话缓存、中文子串匹配（免分词）、字段加权、结果高亮、URL 可分享
   依赖：无
   ========================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-search]');
  if (!root) { return; }

  var form = root.querySelector('.site-search__form');
  var input = root.querySelector('#site-search-input');
  var statusEl = root.querySelector('.site-search__status');
  var listEl = root.querySelector('[data-results]');
  var emptyEl = root.querySelector('.site-search__empty');
  var chips = Array.prototype.slice.call(root.querySelectorAll('[data-type]'));
  var indexUrl = root.getAttribute('data-index') || '/search.json';
  var cacheKey = 'cr-search-' + (root.getAttribute('data-version') || '0');

  var docs = null;          // 索引数据
  var pending = null;       // 加载中的 Promise
  var loading = false;
  var failed = false;
  var query = '';
  var type = '';
  var terms = [];
  var lastCount = 0;
  var trackedQuery = '';
  var searchTimer = null;
  var trackTimer = null;

  /* ---------- 1. 文本归一化 ---------- */

  // 全角 ASCII → 半角、全角空格 → 空格、转小写；字符数不变，可安全用于 Offset
  function fold(text) {
    return String(text || '')
      .replace(/[\uFF01-\uFF5E]/g, function (ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
      })
      .replace(/\u3000/g, ' ')
      .toLowerCase();
  }

  // 查询串：折叠 + 压缩空白
  function foldQuery(text) {
    return fold(text).replace(/\s+/g, ' ').trim();
  }

  function countHits(haystack, needle) {
    var count = 0;
    var pos = 0;
    while ((pos = haystack.indexOf(needle, pos)) !== -1) {
      count += 1;
      pos += needle.length;
    }
    return count;
  }

  /* ---------- 2. 索引加载（懒加载 + sessionStorage 缓存） ---------- */

  function setStatus(msg) {
    if (statusEl) { statusEl.textContent = msg; }
  }

  function idleStatus() {
    if (!docs) { return; }
    setStatus('已收录 ' + docs.length + ' 篇内容，输入关键词开始搜索。');
  }

  function loadIndex() {
    if (docs) { return Promise.resolve(docs); }
    if (pending) { return pending; }

    var cached = null;
    try { cached = window.sessionStorage.getItem(cacheKey); } catch (e) { /* 隐私模式忽略 */ }
    if (cached) {
      try {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.length) {
          docs = parsed;
          idleStatus();
          return Promise.resolve(docs);
        }
      } catch (e) { /* 缓存损坏则重新拉取 */ }
    }

    loading = true;
    failed = false;
    setStatus('正在加载索引…');

    pending = fetch(indexUrl, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) { throw new Error('HTTP ' + res.status); }
        return res.json();
      })
      .then(function (data) {
        docs = Array.isArray(data) ? data : [];
        loading = false;
        pending = null;
        try { window.sessionStorage.setItem(cacheKey, JSON.stringify(docs)); } catch (e) { /* 超配额忽略 */ }
        idleStatus();
        if (query) { runSearch(); }
        return docs;
      })
      .catch(function (err) {
        loading = false;
        failed = true;
        pending = null;
        setStatus('索引加载失败，请刷新页面重试。');
        throw err;
      });

    return pending;
  }

  // 空闲时预取：不影响首屏
  function prefetch() {
    var run = function () { loadIndex().catch(function () {}); };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      window.setTimeout(run, 1200);
    }
  }

  /* ---------- 3. 检索与打分 ---------- */

  // 每个文档的归一化字段只算一次
  function prep(doc) {
    if (!doc._n) {
      doc._n = {
        t: fold(doc.t),
        d: fold(doc.d),
        g: fold((doc.tg || []).join(' ')),
        tx: fold(doc.tx)
      };
    }
    return doc._n;
  }

  function scoreDoc(doc, phrase) {
    var n = prep(doc);
    var score = 0;
    var matched = 0;

    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var s = 0;

      var ti = n.t.indexOf(term);
      if (ti !== -1) {
        s += 8;
        if (ti === 0) { s += 4; }        // 标题开头命中
      }
      if (n.g.indexOf(term) !== -1) { s += 5; }   // 标签
      if (n.d.indexOf(term) !== -1) { s += 4; }   // 摘要

      var hits = countHits(n.tx, term);
      if (hits) { s += Math.min(hits, 6); }       // 正文命中，次数封顶

      if (s) { matched += 1; score += s; }
    }

    // 多词查询：标题里含完整短语额外加分
    if (terms.length > 1 && n.t.indexOf(phrase) !== -1) { score += 6; }

    return { score: score, matched: matched };
  }

  function runSearch() {
    if (failed) { return; }
    if (!docs) {
      loadIndex().then(runSearch).catch(function () {});
      return;
    }

    var phrase = foldQuery(query);
    terms = phrase ? phrase.split(' ').filter(Boolean) : [];

    if (!terms.length) {
      renderResults([], 0);
      idleStatus();
      lastCount = 0;
      return;
    }

    var results = [];
    for (var i = 0; i < docs.length; i++) {
      var doc = docs[i];
      if (type && doc.g !== type) { continue; }
      var scored = scoreDoc(doc, phrase);
      if (scored.matched > 0) {
        scored.doc = doc;
        results.push(scored);
      }
    }

    results.sort(function (a, b) {
      if (b.matched !== a.matched) { return b.matched - a.matched; }
      if (b.score !== a.score) { return b.score - a.score; }
      return String(b.doc.dt || '').localeCompare(String(a.doc.dt || ''));
    });

    lastCount = results.length;
    renderResults(results.slice(0, 50), results.length);
  }

  /* ---------- 4. 渲染 ---------- */

  function buildRanges(text, words) {
    var haystack = fold(text);
    var ranges = [];

    for (var i = 0; i < words.length; i++) {
      var term = words[i];
      if (!term) { continue; }
      var pos = 0;
      while ((pos = haystack.indexOf(term, pos)) !== -1) {
        ranges.push([pos, pos + term.length]);
        pos += term.length;
      }
    }

    ranges.sort(function (a, b) { return a[0] - b[0]; });

    var merged = [];
    for (var j = 0; j < ranges.length; j++) {
      var last = merged[merged.length - 1];
      if (last && ranges[j][0] <= last[1]) {
        last[1] = Math.max(last[1], ranges[j][1]);
      } else {
        merged.push(ranges[j].slice());
      }
    }
    return merged;
  }

  // 只用 textNode + <mark> 组装，不拼接 HTML，避免把用户输入当标签执行
  function appendHighlighted(el, text, words) {
    text = text || '';
    var ranges = buildRanges(text, words || []);
    if (!ranges.length) {
      el.appendChild(document.createTextNode(text));
      return;
    }

    var pos = 0;
    for (var i = 0; i < ranges.length; i++) {
      var start = ranges[i][0];
      var end = ranges[i][1];
      if (start > pos) { el.appendChild(document.createTextNode(text.slice(pos, start))); }
      var mark = document.createElement('mark');
      mark.textContent = text.slice(start, end);
      el.appendChild(mark);
      pos = end;
    }
    if (pos < text.length) { el.appendChild(document.createTextNode(text.slice(pos))); }
  }

  function makeSnippet(doc) {
    var source = doc.tx || '';
    if (!source) { return doc.d || ''; }

    var haystack = fold(source);
    var best = -1;
    var bestLen = 0;

    for (var i = 0; i < terms.length; i++) {
      var idx = haystack.indexOf(terms[i]);
      if (idx !== -1 && (best === -1 || idx < best)) {
        best = idx;
        bestLen = terms[i].length;
      }
    }
    if (best === -1) { return doc.d || ''; }

    var start = Math.max(0, best - 60);
    var end = Math.min(source.length, best + bestLen + 90);
    var text = source.slice(start, end).replace(/\s+/g, ' ').trim();
    return (start > 0 ? '…' : '') + text + (end < source.length ? '…' : '');
  }

  function addText(parent, tag, className, text) {
    var el = document.createElement(tag);
    el.className = className;
    el.textContent = text;
    parent.appendChild(el);
    return el;
  }

  function buildItem(result) {
    var doc = result.doc;
    var li = document.createElement('li');
    li.className = 'search-result';

    var link = document.createElement('a');
    link.className = 'search-result__link';
    link.href = doc.u;

    var title = document.createElement('span');
    title.className = 'search-result__title';
    appendHighlighted(title, doc.t, terms);
    link.appendChild(title);

    var meta = document.createElement('span');
    meta.className = 'search-result__meta';
    addText(meta, 'span', 'search-result__type', doc.g);
    if (doc.dt) { addText(meta, 'time', 'search-result__date', doc.dt); }
    if (doc.l === 'en') { addText(meta, 'span', 'search-result__lang', 'EN'); }
    if (doc.l === 'fr') { addText(meta, 'span', 'search-result__lang', 'FR'); }
    (doc.tg || []).slice(0, 3).forEach(function (tag) {
      addText(meta, 'span', 'search-result__tag', tag);
    });
    link.appendChild(meta);

    var snippet = document.createElement('span');
    snippet.className = 'search-result__snippet';
    appendHighlighted(snippet, makeSnippet(doc), terms);
    link.appendChild(snippet);

    li.appendChild(link);
    return li;
  }

  function renderResults(results, total) {
    listEl.textContent = '';
    emptyEl.hidden = !terms.length || results.length > 0;

    if (!terms.length) { return; }

    if (!results.length) {
      setStatus('没有找到「' + query.trim() + '」相关的内容。');
      return;
    }

    var suffix = total > results.length ? '（显示前 ' + results.length + ' 条）' : '';
    setStatus('找到 ' + total + ' 条结果' + suffix);

    var frag = document.createDocumentFragment();
    for (var i = 0; i < results.length; i++) {
      frag.appendChild(buildItem(results[i]));
    }
    listEl.appendChild(frag);
  }

  /* ---------- 5. 交互 ---------- */

  function syncUrl() {
    if (!window.history || !window.history.replaceState) { return; }
    var params = [];
    if (query.trim()) { params.push('q=' + encodeURIComponent(query.trim())); }
    if (type) { params.push('type=' + encodeURIComponent(type)); }
    var next = window.location.pathname + (params.length ? '?' + params.join('&') : '');
    window.history.replaceState(null, '', next);
  }

  function track(queryText, count) {
    if (!queryText || queryText === trackedQuery) { return; }
    trackedQuery = queryText;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'site_search',
      search_term: queryText,
      search_results: count
    });
  }

  function scheduleSearch(immediate) {
    window.clearTimeout(searchTimer);
    var delay = immediate ? 0 : 150;
    searchTimer = window.setTimeout(function () {
      query = input.value;
      runSearch();
      syncUrl();

      window.clearTimeout(trackTimer);
      trackTimer = window.setTimeout(function () {
        if (!loading && !failed) { track(query.trim(), lastCount); }
      }, 1000);
    }, delay);
  }

  function setType(next) {
    type = next || '';
    chips.forEach(function (chip) {
      var on = (chip.getAttribute('data-type') || '') === type;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    runSearch();
    syncUrl();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    scheduleSearch(true);
  });

  input.addEventListener('input', function () {
    scheduleSearch(false);
  });

  input.addEventListener('focus', function () {
    loadIndex().catch(function () {});
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setType(chip.getAttribute('data-type') || '');
    });
  });

  document.addEventListener('keydown', function (event) {
    var tag = (event.target && event.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || event.target.isContentEditable;

    if (event.key === '/' && !typing) {
      event.preventDefault();
      input.focus();
      return;
    }
    if (event.key === 'Escape' && event.target === input) {
      input.value = '';
      query = '';
      runSearch();
      syncUrl();
    }
  });

  // 从 URL 恢复查询：/search/?q=GEO&type=知识库
  function init() {
    var params = new URLSearchParams(window.location.search);
    query = params.get('q') || '';
    type = params.get('type') || '';
    input.value = query;

    chips.forEach(function (chip) {
      var on = (chip.getAttribute('data-type') || '') === type;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    if (query) {
      loadIndex().then(runSearch).catch(function () {});
    } else {
      prefetch();
    }
  }

  init();
})();
