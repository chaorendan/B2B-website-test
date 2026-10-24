---
layout: page
title: "博物馆漫记"
seo_title: "博物馆漫记 · 专栏 | 超人蛋 · 彭俊超"
description: "从湖北省博到荆州博物馆：把展厅当成观察社会的切片，看文物怎么回答今天的焦虑。一个持续更新的看展系列。"
permalink: /columns/museum-notes/
column_key: museum-notes
icon: "🏛️"
lang: "zh"
---

# 博物馆漫记

这个系列记录我看过的博物馆：湖北省博、荆州博物馆……不追「镇馆之宝」的打卡清单，而是把展厅当成一个观察社会的切片——一件瓷器压着多少时间，一座坞堡留下什么地名，一块墓葬展板如何剧透几千年后的分化。文物的答案，常常比宣讲会上任何一句话都更让人安心。

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
