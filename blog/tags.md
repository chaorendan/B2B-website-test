---
layout: page
title: "标签图谱"
seo_title: "标签图谱 | 超人蛋 · 彭俊超"
description: "四套关系视角重新聚类文章：与地方、与文明、与技术、与意义。同一篇文章，允许同时活在几个视角里。"
permalink: /blog/tags/
lang: "zh"
---

# 标签图谱

<p class="cat-lead">分类是固定的抽屉，标签是生长的关系。四套「与……」的视角各自聚一次类——同一篇文章，允许同时活在几个视角里。想按主题抽屉找，去 <a href="{{ '/blog/categories/' | relative_url }}">分类归档</a>。</p>

<nav class="cat-jump" aria-label="视角跳转">
  {%- for set in site.data.tagsets %}
  <a href="#{{ set.key }}">{{ set.title }}</a>
  {%- endfor %}
</nav>

{%- assign zh_posts = site.posts | where: "lang", "zh" %}
{%- for set in site.data.tagsets %}
{%- assign set_posts = "" | split: "" %}
{%- for p in zh_posts %}
  {%- assign hit = false %}
  {%- for tg in set.tags %}
    {%- if p.tags contains tg %}{%- assign hit = true %}{% endif %}
  {%- endfor %}
  {%- if hit %}{%- assign set_posts = set_posts | push: p %}{% endif %}
{%- endfor %}
<section class="cat-block" id="{{ set.key }}">
  <header class="cat-head">
    <h2 class="cat-title">{{ set.title }}<span class="cat-count">{{ set_posts.size }} 篇</span></h2>
    <p class="cat-desc">{{ set.desc }}</p>
    <p class="tagset-chips">
      {%- for tg in set.tags %}
      {%- assign n = 0 %}
      {%- for p in zh_posts %}
        {%- if p.tags contains tg %}{%- assign n = n | plus: 1 %}{% endif %}
      {%- endfor %}
      {%- if n > 0 %}<span class="tagset-chip">{{ tg }}<i>{{ n }}</i></span>{% endif %}
      {%- endfor %}
    </p>
  </header>
  {%- if set_posts.size > 0 %}
  <div class="post-grid">
    {%- for post in set_posts %}
      {%- include post-card.html post=post %}
    {%- endfor %}
  </div>
  {%- else %}
  <p class="post-empty">这一簇还没有文章。</p>
  {%- endif %}
</section>
{%- endfor %}

<p class="cat-back"><a href="{{ '/blog/' | relative_url }}">&larr; 回到博客列表</a></p>
