---
layout: page
title: "博客分类"
seo_title: "博客分类 | 超人蛋 · 彭俊超"
description: "按主题分栏浏览超人蛋的博客：文化观察、读书笔记、语言与表达、增长实验、信仰与行动。"
permalink: /blog/categories/
lang: "zh"
---

# 博客分类

<p class="cat-lead">同一类主题，归到同一个分类下集中展示。想追一个主题，就从这里进。</p>

<nav class="cat-jump" aria-label="分类跳转">
  {%- for cat in site.data.categories %}
  {%- assign cat_posts = site.posts | where: "lang", "zh" | where_exp: "p", "p.categories contains cat.key" %}
  <a href="#{{ cat.key }}">{{ cat.icon }} {{ cat.title }}<span>{{ cat_posts.size }}</span></a>
  {%- endfor %}
</nav>

{%- for cat in site.data.categories %}
{%- assign cat_posts = site.posts | where: "lang", "zh" | where_exp: "p", "p.categories contains cat.key" %}
<section class="cat-block" id="{{ cat.key }}">
  <header class="cat-head">
    <h2 class="cat-title"><span class="cat-icon" aria-hidden="true">{{ cat.icon }}</span>{{ cat.title }}<span class="cat-count">{{ cat_posts.size }} 篇</span></h2>
    <p class="cat-desc">{{ cat.desc }}</p>
  </header>
  {%- if cat_posts.size > 0 %}
  <div class="post-grid">
    {%- for post in cat_posts %}
      {%- include post-card.html post=post %}
    {%- endfor %}
  </div>
  {%- else %}
  <p class="post-empty">这个分类还在攒稿，敬请期待。</p>
  {%- endif %}
</section>
{%- endfor %}

<p class="cat-back"><a href="{{ '/blog/' | relative_url }}">&larr; 回到博客列表</a></p>
