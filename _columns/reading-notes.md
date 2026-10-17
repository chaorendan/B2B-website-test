---
layout: page
title: "读书笔记"
seo_title: "读书笔记 · 专栏 | 超人蛋 · 彭俊超"
description: "读过的书，和书里带出来的问题——不是书评，是读书时真正卡住我的地方。"
permalink: /columns/reading-notes/
column_key: reading-notes
icon: "📖"
lang: "zh"
---

# 读书笔记

不是书评。是读书时真正卡住我的地方——一个问题、一个反常识的结论、一段想不明白的历史。写下来，才算真的读过。

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
