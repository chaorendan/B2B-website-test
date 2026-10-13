---
layout: page
title: "博客"
seo_title: "博客 | 超人蛋 · 彭俊超 —— GIS × 数字营销 × SEO"
permalink: /blog/
description: "彭俊超的个人博客：独立站运营、SEO / GEO 实操、GIS 空间分析在增长中的应用。记录真实过程、可复用的方法与踩过的坑。"
lang: "zh"
---

# 博客

这里放我的“业余项目”：不用向任何人汇报进度，不用追热点，不用管流量——认真折腾点什么的过程记录。<br>
研究少有人关心的话题、写下我们这个时代的注脚，尝试奇奇怪怪的东西、踩一些千奇百怪的坑……<br>
更新不定期，但每一篇都尽力尽兴。

要找体系化的方法手册，去 [知识库](/kb/)；要看完整项目复盘，去 [项目与案例](/projects/)。

{%- comment -%} 只列中文文章；英文版在 /en/（lang 过滤，避免双语重复出现） {%- endcomment -%}
{%- assign zh_posts = site.posts | where: "lang", "zh" %}
{%- if zh_posts.size > 0 %}
<div class="post-grid">
  {%- for post in zh_posts %}
    {% include post-card.html post=post %}
  {%- endfor %}
</div>
{%- else %}
<p class="post-empty">这里还没有文章。</p>
{%- endif %}
