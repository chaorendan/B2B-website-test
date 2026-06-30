---
layout: page
title: "提示词模板库"
seo_title: "API 接入提示词模板库 | 地理编码 热力图 商户管理 GEO协同"
permalink: /geo/gis-toolkit/prompt-templates/
description: "可下载的 API 接入提示词模板，覆盖地理编码、热力图可视化、商户管理、GEO × Google Ads 协同等场景。"
lang: "zh"
---

# 提示词模板库

借鉴"圆装百知模型"思维框架的分轮深挖方法，每个模板聚焦一个 API 能力维度，可直接复制粘贴给 AI 工具使用。

---

## 模板清单

| # | 模板 | 能力维度 | 输入 | 输出 | 下载 |
|---|------|----------|------|------|------|
| 1 | 地理编码批量转换 | A3 | 地址 CSV | 坐标 CSV + GeoJSON | [下载]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/01-geocoding.md) |
| 2 | 热力图可视化 | A4 | 投放数据 CSV | 交互式 HTML | [下载]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/02-heatmap.md) |
| 3 | Google Business Profile 管理 | A6 | 门店列表 | 更新报告 + KML | [下载]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/03-gbp-management.md) |
| 4 | GEO × Google Ads 协同 | A3+A2 | 区域评分 CSV | 出价调整日志 | [下载]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/04-geo-ads-integration.md) |

---

## 使用方法

1. 点击上方"下载"链接，获取模板内容
2. 替换模板中的占位符（如 `你的_API_KEY`）
3. 将模板粘贴给 AI 工具（ChatGPT / Claude / GitHub Copilot）
4. AI 生成的代码可直接运行

---

## 能力维度框架

| 编号 | 维度 | 本质需求 | 需要什么类型的 API |
|------|------|----------|-------------------|
| A1 | 广告数据获取 | 结构化查询 | Google Ads API |
| A2 | 广告操作执行 | 变异操作 | Google Ads API mutate |
| A3 | 地理数据采集 | 空间数据获取 | Mapbox / 百度地图 Geocoding |
| A4 | 地理可视化 | 空间数据渲染 | Mapbox GL JS |
| A5 | 地域关键词 | 搜索热度分布 | Google Trends API |
| A6 | 商户信息管理 | 本地信息运维 | Google Business Profile API |
| A7 | 流量分析 | 用户行为数据 | GA4 Data API |
| A8 | 转化追踪 | 转化数据回传 | Enhanced Conversions |
| A9 | 报告自动化 | 数据聚合输出 | Google Ads Reporting + pandas |
| A10 | 竞品分析 | 市场情报 | SEMrush API |

---

## 维度缺口分析

| 维度 | 当前覆盖 | 判断 | 模板补充 |
|------|----------|------|----------|
| A1 广告数据获取 | ✅ 已有 | 充裕 | — |
| A2 广告操作执行 | ✅ 已有 | 充裕 | — |
| A3 地理数据采集 | ❌ 缺失 | 严重不足 | ✅ 模板 1 |
| A4 地理可视化 | ❌ 缺失 | 严重不足 | ✅ 模板 2 |
| A5 地域关键词 | ⚠️ 有方法无 API | 不足 | 后续补充 |
| A6 商户信息管理 | ❌ 缺失 | 严重不足 | ✅ 模板 3 |
| A7 流量分析 | ⚠️ GTM 已部署 | 基本够 | — |
| A8 转化追踪 | ⚠️ 有设计 | 不足 | 后续补充 |
| A9 报告自动化 | ✅ 已有 | 充裕 | — |
| A10 竞品分析 | ❌ 缺失 | 不足 | 后续补充 |

---

## 相关文档

- [GIS 特色板块]({{ site.baseurl }}/geo/gis-toolkit/)
- [API Key 配置教程]({{ site.baseurl }}/geo/gis-toolkit/api-key-setup/)
- [Mapbox 地图可视化]({{ site.baseurl }}/geo/gis-toolkit/mapbox-integration/)

---

*最后更新：2026-06-30*
