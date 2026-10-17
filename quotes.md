---
layout: page
title: "每日一言 · 往期"
seo_title: "每日一言 · 往期日历 | 超人蛋"
description: "按日历回看每日一言：点任意日期，就能看到那天的中文、English 与 Français。共 60 条轮播，可按月翻阅。"
permalink: /quotes/
lang: "zh"
css: "/assets/css/quotes.css"
---

# 每日一言 · 往期

<p class="qa-lead">点日历上的任意一天，就能看到那一天的一句话——中文、英文、法文三语对照。键盘 <kbd>←</kbd> <kbd>→</kbd> 可逐日翻看。</p>

<div class="qa" id="qa">
  <div class="qa-cal">
    <div class="qa-cal__bar">
      <button class="qa-btn" type="button" id="qa-prev" aria-label="上个月">&larr;</button>
      <h2 class="qa-cal__title" id="qa-title" aria-live="polite"></h2>
      <button class="qa-btn" type="button" id="qa-next" aria-label="下个月">&rarr;</button>
    </div>
    <div class="qa-cal__week" aria-hidden="true">
      <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
    </div>
    <div class="qa-cal__grid" id="qa-grid" role="grid" aria-label="日期"></div>
    <p class="qa-cal__hint"><i class="qa-dot" aria-hidden="true"></i>带圆点的是「当天留档」，其余按轮播规则回放</p>
  </div>

  <div class="qa-card" id="qa-card" aria-live="polite">
    <noscript><p class="qa-card__empty">日历需要开启 JavaScript。下方向下滚动可直接阅读全部 60 条。</p></noscript>
  </div>
</div>

<h2>全部 <span id="qa-total">{{ site.data.quotes.items | size }}</span> 条</h2>

<details class="qa-all">
  <summary>展开完整列表（三语对照）</summary>
  <ol class="qa-list">
    {%- for q in site.data.quotes.items %}
    <li class="qa-item">
      <p class="qa-item__zh" lang="zh">{{ q.zh }}</p>
      <p class="qa-item__tr" lang="en">{{ q.en }}</p>
      <p class="qa-item__tr" lang="fr">{{ q.fr }}</p>
    </li>
    {%- endfor %}
  </ol>
</details>

<script src="{{ '/assets/js/quotes-data.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/quotes-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/quotes-archive.js' | relative_url }}" defer></script>
