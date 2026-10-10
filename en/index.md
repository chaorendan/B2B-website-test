---
layout: page
title: "Blog"
seo_title: "Blog | Chaorendan · Peng Junchao — GIS × Digital Marketing × SEO"
permalink: /en/
description: "English posts by Peng Junchao: independent-site SEO, GIS spatial analysis applied to growth, and notes from building chaorendan.top in public."
lang: "en"
---

# Blog (English)

Working notes in English — what I am building, what broke, and what actually worked.

For the structured method library, see the [Chinese knowledge base](/kb/); for full project write-ups, see [Projects](/projects/).

{%- assign en_posts = site.posts | where: "lang", "en" %}
{%- if en_posts.size > 0 %}
<div class="post-grid">
  {%- for post in en_posts %}
    {% include post-card.html post=post %}
  {%- endfor %}
</div>
{%- else %}
<p class="post-empty">No posts here yet.</p>
{%- endif %}

---

中文内容为主站主体：[回到中文首页](/) · [博客（中文）](/blog/)
