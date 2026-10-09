---
layout: page
title: "博客"
seo_title: "博客 | 超人蛋 · 彭俊超 —— GIS × 数字营销 × SEO"
permalink: /blog/
description: "彭俊超的个人博客：独立站运营、SEO / GEO 实操、GIS 空间分析在增长中的应用。记录真实过程、可复用的方法与踩过的坑。"
lang: "zh"
---

# 博客

这里放**过程性**的内容——正在做的事、踩过的坑、验证过的结论。

要找体系化的方法手册，去 [知识库](/kb/)；要看完整项目复盘，去 [项目与案例](/projects/)。

{%- if site.posts.size > 0 %}
<div class="post-grid">
  {%- for post in site.posts %}
    {% include post-card.html post=post %}
  {%- endfor %}
</div>
{%- else %}
<p class="post-empty">还没有发布文章。第一篇正在路上。</p>
{%- endif %}
