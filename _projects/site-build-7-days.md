---
layout: page
title: "本站从 0 到被 Google 收录的 7 天"
seo_title: "案例：本站从 0 到被 Google 收录的 7 天 | 彭俊超"
description: "一个从零搭建的独立站实操案例：域名解析、HTTPS、Search Console 验证、sitemap 提交、GTM/GA4 单通道埋点、两次 CI 构建事故复盘，以及 39 条站内断链的治理过程。"
date: 2026-10-08
lang: "zh"
tags:
  - SEO
  - GA4
  - GTM
  - GitHub Pages
  - 独立站
featured: true
---

# 案例 ①：本站从 0 到被 Google 收录的 7 天

> 一句话结论：一套**零预算**的独立站基础设施，可以在 7 天内从零走到「搜索引擎可发现 + 行为可测量」，并且每一步都能回滚、失败损失为零。

**涉及技能**：DNS / HTTPS · GitHub Pages + Jekyll · Google Search Console · Google Tag Manager + GA4 · sitemap / robots.txt · CI（GitHub Actions）故障排查

---

## 一、问题（Context）

起点是一个尴尬的状态：

- 站点还挂在 `chaorendan.github.io/B2B-website-test/` 的子路径下，**URL 不是自己的**
- 没有任何搜索基础设施：没有 Search Console 属性、没有 sitemap 提交、没有分析工具
- 内容里有一批**已声明但从未写出来**的子页面（导航指向了 404）

对求职目标（数字营销 / SEO / 增长分析）来说，这不是「有个博客」，而是「**必须能拿出一个自己全程做过、且能讲出指标的独立站**」。

**要回答的三个问题**：域名和 HTTPS 能不能自己搞定？搜索引擎能不能找到并收录？用户行为能不能被测量且不重复计数？

---

## 二、做法（What I did）

### 固定顺序：域名 → 网站 → GSC → GTM → GA4 → 真实数据

顺序不能乱。原因很简单：**先配 GSC/GA4 再换域名，所有 URL 都会变**，属性和 sitemap 要全部重配，还会在 GA4 里留下两个主机名混杂的数据。所以先把域名一次性切干净，后面的配置一次到位。

| 阶段 | 动作 | 交付物 |
|---|---|---|
| D0 | 仓库与本地环境就绪，确立「每一步可回滚、失败零损失」原则 | 可构建的基线仓库 |
| D3 | 域名 `chaorendan.top` 解析到 GitHub Pages；绑定自定义域 + 强制 HTTPS | 带锁的 `https://chaorendan.top/` |
| D3 | 单 commit 切换 `baseurl`、修正 `robots.txt` 的 Sitemap 地址 | 全站内链无子路径残留 |
| D3 | GSC 用 **Domain Property**（DNS TXT 验证）；Bing 从 GSC 一键导入 | 属性已验证 + sitemap 已提交 |
| D4 | GTM 建 GA4 标签（`G-` 衡量 ID），`head.html` 一行不改 | 单通道埋点 |
| D5 | GA4 衡量 ID 三方比对、GSC sitemap「无法读取」逐项排除 | 排障结论 + 留档 |
| D7 | 清理已声明的空子页面，清掉站内断链 | 站内断链归零 |

### 关键技术决策

1. **不用 Frp / 自建隧道**：静态站用 GitHub Pages，SSL 自动签发续期、全球 CDN、成本为零；自建隧道要一台 VPS、手动续证书，且 IP 信誉与宕机会直接影响抓取。
2. **埋点只走 GTM，绝不硬编码 `gtag.js`**：GA4 配置标签只存在于 GTM 容器内，否则 `page_view` 会双通道重复上报。
3. **改一个变量就验证一次**：任何配置变更都遵循「单 commit → 验证 → 回滚预案」。
4. **只链接真实存在的页面**：导航里不做「占位链接」，避免把 404 直接暴露给爬虫和访客。

---

## 三、数据（Measurable results）

| 指标 | 结果 | 验证方式 |
|---|---|---|
| 自定义域 HTTPS | 生效，证书自动签发 | `curl -I` 返回 `HTTP/2 200`，颁发者 Let's Encrypt |
| DNS 记录 | apex A 记录 ×4（`185.199.108–111.153`）+ `www` CNAME | `Resolve-DnsName` 返回 GitHub 官方 IP |
| 域名成本 | **¥14 / 首年**（`.top`） | 注册商账单 |
| GSC 属性 | **Domain Property** 验证通过 | DNS TXT 生效后验证为绿色 |
| sitemap | `200` / `application/xml` / **0 次重定向 / 无 BOM / XML 解析通过 / 36 条 URL** | `curl -sI` + Python `ElementTree` 解析 |
| sitemap 瘦身 | 42 条（含 6 个退役页面）→ **36 条** | 对比两次构建的 URL 数 |
| 埋点通道 | 线上 HTML 中 `gtag/js` 出现 **0 次**，只有 `gtm.js` + `ns.html` | 抓取线上 HTML 计数 |
| GA4 采集 | `collect` 请求返回 **204**（采集成功） | 浏览器 Network 面板 |
| **站内断链** | **39 条 → 0 条** | 自写脚本全量扫描（先按 `permalink` 建「已存在路径」集合，再逐个链接比对） |
| CI 构建事故 | **2 次**（退出码 17、19），均已定位并修复 | GitHub Actions check-runs annotations |

> 一个细节：本站 sitemap 在浏览器里打开是「没有样式的 XML 树」——这是**正常现象**（未关联 XSL 样式表时的内置查看器），恰恰是 XML 有效的证据，与 GSC 报错是两件独立的事。

---

## 四、两次 CI 构建事故复盘

这是这个案例里**最有复用价值**的部分：站点能打开 ≠ 你的提交上线了，必须看 Actions 的结论。

### 事故 1：退出码 17 —— `Bundler::HTTPError`

- **现象**：Actions 步骤 `bundle install` 失败，退出码 17；站点仍是上一次成功部署的版本。
- **根因**：仓库里提交了 `.bundle/config`，指向一个已不可用的中国 gem 镜像（TLS 握手被服务端拒绝）。GitHub 的美国 runner 抓不到它。
- **为什么「以前一直是好的」**：`bundler-cache` 命中缓存时，`Gemfile.lock` 没变就完全不访问网络；**缓存过期后第一次真去下载才炸**。
- **修法**：`git rm --cached .bundle/config`，`.gitignore` 加 `.bundle/`；本机文件保留，CI 回到官方源。**改一处，单 commit，再复核。**

### 事故 2：退出码 19 —— `SecurityError`

- **现象**：网络修通后紧接着报校验失败。
- **根因**：`Gemfile.lock` 的 `BUNDLED WITH` 版本被手工改过，但 `CHECKSUMS` 里 `bundler` 那一行的 sha256 没跟着改；Bundler 2.6+ 会**逐条校验**，于是校验不通过。
- **修法**：不是删掉校验（那会降低安全性），而是从官方索引取正确摘要写回。
- **沉淀成规则**：**改 `BUNDLED WITH` 必须同步改 `CHECKSUMS` 里对应的 bundler 行。**

### 一个不装 `gh` 也能排障的技巧

本机没装 `gh`，而 job 日志接口需要认证（匿名 403）。但 **check-runs 的 annotations 是公开可读的**：

```
GET /repos/{owner}/{repo}/check-runs/{job_id}/annotations
```

里面就有失败步骤的报错正文（`annotation_level: failure` 那一行才是原因）。

---

## 五、可迁移的方法（Reusable method）

1. **顺序即策略**：域名 → 站点 → GSC → 埋点 → 数据。任何一个前置搞错，后面全部返工。
2. **单通道原则**：一个数据源只允许一条采集路径（GA4 只走 GTM），否则数据不可信。
3. **「以前能过、突然挂了」优先怀疑缓存**：缓存缺失只是一层窗户纸，被它掩盖的旧隐患才是真因。
4. **失败成本表**：动手前先写下每一步失败的损失与回滚方式。当每步损失都 ≈ 0 时，决策速度会显著变快。
5. **只链接真实存在的页面**：空洞的「占位链接」是把 404 主动交给搜索引擎。

---

## 六、下一步

- 把仅有的 `page_view` 埋点扩展到**转化事件**（名片点击 / 邮件点击），让「增长分析」这件事本身可被数据说明
- 把「站内断链治理」与「埋点方案」写成可复用的 SOP
- 持续观察 GSC 索引覆盖与关键词表现，建立可见性基线

---

*本案例基于本站的真实构建与运维记录整理，数据均为实测。*
