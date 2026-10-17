---
layout: page
title: "专栏"
seo_title: "专栏 | 超人蛋 · 彭俊超"
description: "超人蛋的博客专栏：读书笔记等系列内容的集中入口。比分类更进一步的连载。"
permalink: /columns/
lang: "zh"
---

# 专栏

<p class="cat-lead">专栏是比分类更进一步的「连载」：同一个主题长期写下去，文章集中归档，持续更新。</p>

<div class="col-grid">
  {%- for col in site.columns %}
  {%- assign col_posts = site.posts | where: "lang", "zh" | where: "series", col.column_key %}
  {%- if col_posts.size > 0 %}
  <a class="col-card" href="{{ col.url | relative_url }}">
    <b><span class="col-icon" aria-hidden="true">{{ col.icon }}</span>{{ col.title }}</b>
    <span>{{ col.description }}</span>
    <em>{{ col_posts.size }} 篇 · 持续更新</em>
  </a>
  {%- else %}
  <div class="col-card col-card--empty">
    <b><span class="col-icon" aria-hidden="true">{{ col.icon }}</span>{{ col.title }}</b>
    <span>{{ col.description }}</span>
    <em>筹备中</em>
  </div>
  {%- endif %}
  {%- endfor %}
</div>

<p class="cat-back"><a href="{{ '/blog/' | relative_url }}">&larr; 回到博客列表</a></p>
