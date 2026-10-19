---
layout: page
title: "友链"
seo_title: "友链 | 超人蛋 · 彭俊超"
description: "超人蛋的友链：写作者、开发者，以及认真做内容的人。附本站友链信息，欢迎交换。"
permalink: /links/
lang: "zh"
---

# 友链

<p class="cat-lead">这里放一些我常读的站点——写作者、开发者，以及认真做内容的人。</p>

<div class="link-grid">
  {%- for link in site.data.links %}
  <a class="link-card" href="{{ link.url }}" target="_blank" rel="noopener">
    <img class="link-card__avatar" src="{{ link.avatar | relative_url }}" alt="{{ link.name }} 的头像" width="48" height="48" loading="lazy" decoding="async">
    <span class="link-card__body">
      <b>{{ link.name }}</b>
      <span>{{ link.desc }}</span>
      <em>{{ link.url | remove: "https://" | remove: "http://" | split: "/" | first }}</em>
    </span>
  </a>
  {%- endfor %}
</div>

## 本站信息

想交换友链，直接抄下面这份：

<ul class="link-info">
  <li><b>站点名</b>：超人蛋 · 彭俊超</li>
  <li><b>地址</b>：<a href="https://chaorendan.top/">https://chaorendan.top/</a></li>
  <li><b>描述</b>：GIS 空间分析 × 数字营销 × SEO —— 一个 GIS 学生的增长实验场</li>
  <li><b>头像</b>：<a href="https://chaorendan.top/assets/images/profile/avatar-256.webp">https://chaorendan.top/assets/images/profile/avatar-256.webp</a></li>
</ul>

## 友链原则

- 内容以原创为主，不是纯采集站、纯 SEO 站
- 站点还活着，打得开
- 双向：收到申请我会先去你的站点读几篇，再决定挂不挂

<p class="cat-back">申请方式：邮件到 <a href="mailto:{{ site.email }}">{{ site.email }}</a>，附站点名、地址、一句话描述和头像地址。</p>
