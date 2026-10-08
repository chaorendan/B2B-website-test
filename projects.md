---
layout: page
title: 项目
seo_title: "项目与案例 | 彭俊超"
description: "彭俊超的项目与作品集：独立站 SEO 实操、GIS 空间分析、Web 分析与增长实验。每个案例按「问题 → 做法 → 数据 → 结论」组织，尽量给出可验证的真实数字。"
permalink: /projects/
lang: "zh"
---

# 项目与案例

这里是我做过的项目。每个案例都按 **问题 → 做法 → 数据 → 结论** 组织，尽量给出可验证的真实数字——测不到的会标「整理中」，不编。

---

## 案例

{% assign projects = site.projects | sort: "date" | reverse %}
{% for project in projects %}
- **[{{ project.title }}]({{ project.url | relative_url }})** — {{ project.description | truncate: 100 }}
{% endfor %}

---

## 规划中的案例

以下案例正在整理，完成后会补上链接：

- **巴黎历史街区热浪脆弱性 WebGIS**（本科毕业设计）—— PostGIS 空间分析 + 多维脆弱性建模 + 可视化
- **注采系统知识图谱构建及智能预警诊断**（科研横向项目）—— MySQL / PostgreSQL + Vue 前端 + 技术文档

---

## 关于案例的组织方式

每个案例的阅读顺序固定：

1. **问题**：当时面对的具体处境是什么
2. **做法**：做了哪些判断与动作（含被否决的方案）
3. **数据**：可核对的结果数字
4. **结论**：可迁移的方法与下一步

这样写的目的，是让「我做过什么」可以被验证，而不是只能被相信。
