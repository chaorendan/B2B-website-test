/* 每日一言 · 首页卡片
   取词交给 quotes-core.js（定点优先 → 轮播），本文件只负责渲染。
   数据在 _data/quotes.yml，改内容不要改这里。 */
(function () {
  function render() {
    var textEl = document.getElementById('quote-text');
    if (!textEl || !window.QuoteLib) { return; }

    var r = window.QuoteLib.resolve(new Date());
    if (!r || !r.item) { return; }

    textEl.textContent = r.item.zh;

    var en = document.getElementById('quote-en');
    if (en) { en.textContent = r.item.en; }
    var fr = document.getElementById('quote-fr');
    if (fr) { fr.textContent = r.item.fr; }

    var dateEl = document.getElementById('quote-date');
    if (dateEl) {
      dateEl.textContent = r.date;
      dateEl.setAttribute('datetime', r.date);
    }

    var card = document.querySelector('.daily-quote');
    if (card) { card.setAttribute('data-pinned', r.pinned ? 'true' : 'false'); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
