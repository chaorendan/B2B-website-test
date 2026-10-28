---
layout: page
title: "搜索"
seo_title: "站内搜索 | 超人蛋 · 彭俊超"
description: "站内搜索：跨博客、知识库、GEO 教程、专栏与项目，按标题、摘要、标签与正文检索。"
permalink: /search/
lang: "zh"
noindex: true
sitemap: false
css: "/assets/css/search.css"
js: "/assets/js/search.js"
---

<p class="search-lead">跨博客、知识库、GEO 教程、专栏与项目检索。支持中文与英文关键词，多个词用空格分开，命中越集中排得越前。</p>

<div class="site-search" data-search
     data-index="{{ '/search.json' | relative_url }}"
     data-version="{{ site.time | date_to_xmlschema }}">
  <form class="site-search__form" role="search" action="{{ '/search/' | relative_url }}" method="get">
    <label class="site-search__label" for="site-search-input">关键词</label>
    <div class="site-search__field">
      <svg class="site-search__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>
      <input class="site-search__input" id="site-search-input" type="search" name="q"
             placeholder="如：地域定向、质量得分、龟苓膏、GEO"
             autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">
      <button class="site-search__submit" type="submit">搜索</button>
    </div>
  </form>

  <div class="site-search__filters" role="group" aria-label="按内容类型筛选">
    <button class="site-search__chip is-active" type="button" data-type="" aria-pressed="true">全部</button>
    <button class="site-search__chip" type="button" data-type="博客" aria-pressed="false">博客</button>
    <button class="site-search__chip" type="button" data-type="知识库" aria-pressed="false">知识库</button>
    <button class="site-search__chip" type="button" data-type="GEO" aria-pressed="false">GEO</button>
    <button class="site-search__chip" type="button" data-type="专栏" aria-pressed="false">专栏</button>
    <button class="site-search__chip" type="button" data-type="项目" aria-pressed="false">项目</button>
    <button class="site-search__chip" type="button" data-type="页面" aria-pressed="false">站内页</button>
  </div>

  <p class="site-search__status" role="status" aria-live="polite"></p>

  <ol class="site-search__results" data-results></ol>

  <div class="site-search__empty" hidden>
    <p>没有找到匹配内容。试试更短的关键词、换个说法，或按类型筛选。</p>
    <p class="site-search__empty-links">
      也可以直接浏览：<a href="{{ '/blog/' | relative_url }}">博客</a> ·
      <a href="{{ '/kb/' | relative_url }}">知识库</a> ·
      <a href="{{ '/geo/' | relative_url }}">GEO</a> ·
      <a href="{{ '/columns/' | relative_url }}">专栏</a> ·
      <a href="{{ '/projects/' | relative_url }}">项目</a>
    </p>
  </div>

  <noscript>
    <p class="site-search__noscript">搜索需要启用 JavaScript。你也可以直接浏览
      <a href="{{ '/blog/' | relative_url }}">博客</a> 或 <a href="{{ '/kb/' | relative_url }}">知识库</a>。</p>
  </noscript>
</div>
