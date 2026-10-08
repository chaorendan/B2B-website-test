---
layout: page
title: "留言"
seo_title: "留言与联系 | 超人蛋 · 彭俊超"
permalink: /contact/
description: "给彭俊超留言：GIS 空间分析、数字营销与 SEO 方向的项目讨论、内容合作与实习机会。填写表单或直接发邮件都可以。"
lang: "zh"
---

# 留言

项目讨论、实习机会、内容合作，或者只是想聊聊 GIS 与营销的结合点——都可以从这里开始。我一般 **1–2 天内**回复。

<p class="contact-hint">下面的表单会调用你设备上的邮件客户端，把填写的内容生成一封邮件发给我。如果你用的是网页邮箱或手机、点击后没有反应，请直接用页面底部的邮箱地址发信，一样能收到。</p>

<form class="contact-form" action="mailto:{{ site.email }}?subject=%E7%BD%91%E7%AB%99%E7%95%99%E8%A8%80" method="post" enctype="text/plain">
  <div class="field">
    <label for="cf-name">怎么称呼你</label>
    <input type="text" id="cf-name" name="称呼" autocomplete="name" required>
  </div>
  <div class="field">
    <label for="cf-email">你的邮箱（方便我回复）</label>
    <input type="email" id="cf-email" name="你的邮箱" autocomplete="email" required>
    <p class="field-note">只用于回复你这封留言，不会用于其他用途，也不会存进本站。</p>
  </div>
  <div class="field">
    <label for="cf-message">留言内容</label>
    <textarea id="cf-message" name="留言内容" required placeholder="可以简单说说背景、你想解决的问题，或者希望我做什么。"></textarea>
  </div>
  <button type="submit">生成邮件并发送</button>
</form>

<div class="contact-fallback">
  <p><strong>不想用表单？</strong>直接发邮件更快：<a href="mailto:{{ site.email }}">{{ site.email }}</a></p>
  <p>也可以先看看 <a href="{{ '/about/' | relative_url }}">关于我</a> 和 <a href="{{ '/projects/' | relative_url }}">项目与案例</a>，了解我做过什么。</p>
</div>

## 关于这个表单的一个说明

本站是纯静态站点，**没有服务器**，所以表单不做数据落地，而是调用你本地的邮件客户端来发送。这样做的好处是：没有任何第三方会经手你填写的内容，本站也不会保存你的邮箱。

代价是它依赖你设备上配置好的邮件客户端——网页邮箱用户和部分手机浏览器点击后可能没有反应。这也是我在上面同时给出邮箱地址的原因。
