---
layout: page
title: "法语中心转移"
seo_title: "法语中心转移 · 专栏 | 超人蛋 · 彭俊超"
description: "从刚果河到塞纳河：法语的权力中心正在移动，以及移动的代价。一个连载中的地缘观察。"
permalink: /columns/french-center/
column_key: french-center
icon: "🌍"
lang: "zh"
---

# 法语中心转移

马克龙说，法语的中心如今位于刚果河流域，而非塞纳河畔。这句话是真的，但它只说了前半句：使用者的中心挪走了，权力和资本的中心还钉在巴黎。这个专栏写的就是中间那段拉扯——语言怎么流动，红利怎么收租，收租失败之后账单落在谁头上。

{%- assign col_posts = site.posts | where: "lang", "zh" | where: "series", page.column_key %}
{%- if col_posts.size > 0 %}
<div class="post-grid">
  {%- for post in col_posts %}
    {%- include post-card.html post=post %}
  {%- endfor %}
</div>
{%- else %}
<p class="post-empty">这个专栏还在攒稿。</p>
{%- endif %}

<p class="cat-back"><a href="{{ '/columns/' | relative_url }}">&larr; 所有专栏</a></p>
