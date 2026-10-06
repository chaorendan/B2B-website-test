/* 日间 / 夜间主题切换（全站，首页之外也生效）
   初始 data-theme 由 head.html 的内联脚本在首屏绘制前写入，此处只负责交互与广播。 */
(function(){
  var KEY = 'chaorendan-theme';

  function apply(t){
    document.documentElement.setAttribute('data-theme', t === 'night' ? 'night' : 'day');
    var b = document.getElementById('theme-toggle');
    if(b){
      b.textContent = (t === 'night') ? '☀️' : '🌙';
      b.setAttribute('aria-pressed', t === 'night' ? 'true' : 'false');
      b.setAttribute('title', t === 'night' ? '切换到日间模式' : '切换到夜间模式');
    }
    document.dispatchEvent(new CustomEvent('chaorendan:themechange', { detail: t }));
  }
  window.__chaorendanApplyTheme = apply;

  var btn = document.getElementById('theme-toggle');
  if(btn){
    btn.addEventListener('click', function(){
      var cur = document.documentElement.getAttribute('data-theme') || 'day';
      var next = (cur === 'day') ? 'night' : 'day';
      try{ localStorage.setItem(KEY, next); }catch(e){}
      apply(next);
    });
  }

  /* 与 head.html 内联脚本保持一致：把按钮图标同步到当前主题 */
  apply(document.documentElement.getAttribute('data-theme') || 'day');
})();
