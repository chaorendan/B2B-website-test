---
layout: page
title: "标签图谱"
seo_title: "标签图谱 | 超人蛋 · 彭俊超"
description: "六套关系视角重新聚类文章：与地方、与器物、与文本、与工具、与意义、与创作。同一篇文章，允许同时活在几个视角里。"
permalink: /blog/tags/
lang: "zh"
---

# 标签图谱

<p class="cat-lead">分类是固定的抽屉，标签是生长的关系。六套「与……」的视角各自聚一次类——同一篇文章，允许同时活在几个视角里。想按主题抽屉找，去 <a href="{{ '/blog/categories/' | relative_url }}">分类归档</a>。</p>

<nav class="cat-jump" aria-label="视角跳转">
  {%- for set in site.data.tagsets %}
  <a href="#{{ set.key }}">{{ set.title }}</a>
  {%- endfor %}
</nav>

{%- assign zh_posts = site.posts | where: "lang", "zh" %}
{%- for set in site.data.tagsets %}
{%- comment -%} 带 layers 的簇：成员标签由各层汇总，避免两处维护 {%- endcomment -%}
{%- assign cluster_tags = set.tags %}
{%- if set.layers %}
  {%- assign cluster_tags = "" | split: "" %}
  {%- for layer in set.layers %}
    {%- assign cluster_tags = cluster_tags | concat: layer.tags %}
  {%- endfor %}
{%- endif %}

{%- assign set_posts = "" | split: "" %}
{%- for p in zh_posts %}
  {%- assign hit = false %}
  {%- for tg in cluster_tags %}
    {%- if p.tags contains tg %}{%- assign hit = true %}{% endif %}
  {%- endfor %}
  {%- if hit %}{%- assign set_posts = set_posts | push: p %}{% endif %}
{%- endfor %}
<section class="cat-block" id="{{ set.key }}">
  <header class="cat-head">
    <h2 class="cat-title">{{ set.title }}<span class="cat-count">{{ set_posts.size }} 篇</span></h2>
    {%- if set.question %}
    <p class="cat-q">{{ set.question }}</p>
    {%- endif %}
    <p class="cat-desc">{{ set.desc }}</p>
  </header>

  {%- if set.layers %}
  <div class="tagset-ladder">
    {%- for layer in set.layers %}
    <div class="tagset-rung">
      <h3 class="tagset-rung__title">{{ layer.title }}</h3>
      <p class="tagset-chips">
        {%- for tg in layer.tags %}
        {%- assign n = 0 %}
        {%- for p in zh_posts %}
          {%- if p.tags contains tg %}{%- assign n = n | plus: 1 %}{% endif %}
        {%- endfor %}
        {%- if n > 0 %}<span class="tagset-chip">{{ tg }}<i>{{ n }}</i></span>{% endif %}
        {%- endfor %}
      </p>
    </div>
    {%- endfor %}
  </div>
  {%- else %}
  <p class="tagset-chips">
    {%- for tg in set.tags %}
    {%- assign n = 0 %}
    {%- for p in zh_posts %}
      {%- if p.tags contains tg %}{%- assign n = n | plus: 1 %}{% endif %}
    {%- endfor %}
    {%- if n > 0 %}<span class="tagset-chip">{{ tg }}<i>{{ n }}</i></span>{% endif %}
    {%- endfor %}
  </p>
  {%- endif %}

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
