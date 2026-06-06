# Google Ads B2B 知识库架构设计

> 设计版本: v1.0
> 创建日期: 2026-05-22
> 状态: 待审查

---

## 1. 目录结构设计

```
_knowledge/
├── google-ads/
│   ├── _ARCHITECTURE_DESIGN.md          # 本设计文档
│   ├── _TEMPLATE.md                     # 文章模板
│   ├── index.md                         # Google Ads 首页
│   │
│   ├── 01-fundamentals/                 # 基础篇
│   │   ├── index.md
│   │   ├── account-structure.md
│   │   ├── campaign-types.md
│   │   ├── billing-budget.md
│   │   └── quality-score.md
│   │
│   ├── 02-search-campaigns/             # 搜索广告
│   │   ├── index.md
│   │   ├── keyword-research.md
│   │   ├── match-types-guide.md
│   │   ├── ad-copywriting.md
│   │   ├── landing-page-optimization.md
│   │   ├── bidding-strategies.md
│   │   ├── negative-keywords.md
│   │   └── search-campaign-basics.md    # 现有文件
│   │
│   ├── 03-display-remarketing/          # 展示与再营销
│   │   ├── index.md
│   │   ├── display-campaigns.md
│   │   ├── remarketing-strategies.md
│   │   ├── audience-targeting.md
│   │   └── responsive-display-ads.md
│   │
│   ├── 04-video-youtube/                # 视频广告
│   │   ├── index.md
│   │   ├── youtube-ads-overview.md
│   │   ├── video-ad-formats.md
│   │   └── video-creation-tips.md
│   │
│   ├── 05-performance-max/              # PMax 广告
│   │   ├── index.md
│   │   ├── pmax-setup-guide.md
│   │   ├── feed-optimization.md
│   │   └── audience-signals.md
│   │
│   ├── 06-b2b-strategies/               # B2B 专项策略
│   │   ├── index.md
│   │   ├── lead-generation-tactics.md
│   │   ├── long-sales-cycle-optimization.md
│   │   ├── account-based-marketing.md
│   │   ├── linkedin-audience-sync.md
│   │   └── crm-integration.md
│   │
│   ├── 07-tracking-analytics/           # 追踪与分析
│   │   ├── index.md
│   │   ├── conversion-tracking-setup.md
│   │   ├── enhanced-conversions.md
│   │   ├── offline-conversion-import.md
│   │   └── attribution-models.md
│   │
│   ├── 08-optimization/                 # 优化技巧
│   │   ├── index.md
│   │   ├── a-b-testing.md
│   │   ├── automated-rules.md
│   │   ├── scripts-automation.md
│   │   └── performance-analysis.md
│   │
│   └── 09-troubleshooting/              # 故障排除
│       ├── index.md
│       ├── low-impression-troubleshoot.md
│       ├── high-cpc-solutions.md
│       └── policy-violations.md
```

### 目录命名规范

| 规则 | 示例 | 说明 |
|------|------|------|
| 序号前缀 | `01-fundamentals/` | 控制导航顺序，两位数 |
| 小写连字符 | `match-types-guide.md` | URL 友好，SEO 友好 |
| 英文命名 | `bidding-strategies.md` | 国际化兼容 |
| index.md | 每个目录必须 | 作为该分类的入口页 |

---

## 2. 首页导航设计

### 2.1 主导航 (_data/navigation.yml)

```yaml
main:
  - title: "Google Ads"
    url: /google-ads/
    children:
      - title: "基础篇"
        url: /knowledge/google-ads/01-fundamentals/
      - title: "搜索广告"
        url: /knowledge/google-ads/02-search-campaigns/
      - title: "展示与再营销"
        url: /knowledge/google-ads/03-display-remarketing/
      - title: "视频广告"
        url: /knowledge/google-ads/04-video-youtube/
      - title: "PMax 广告"
        url: /knowledge/google-ads/05-performance-max/
      - title: "B2B 策略"
        url: /knowledge/google-ads/06-b2b-strategies/
      - title: "追踪分析"
        url: /knowledge/google-ads/07-tracking-analytics/
      - title: "优化技巧"
        url: /knowledge/google-ads/08-optimization/
      - title: "故障排除"
        url: /knowledge/google-ads/09-troubleshooting/

  - title: "GA4"
    url: /ga4/

  - title: "Projects"
    url: /projects/

  - title: "About"
    url: /about/
```

### 2.2 面包屑导航

每个文章页自动生成的面包屑：
```
首页 > Google Ads > 搜索广告 > 关键词匹配类型详解
```

### 2.3 侧边栏导航

每个分类页显示该分类下的文章列表：
```
📁 搜索广告
  ├── 关键词研究指南
  ├── 匹配类型详解 ← 当前页
  ├── 广告文案撰写
  └── ...
```

---

## 3. Related Articles 关联系统

### 3.1 关联类型

| 关联类型 | front matter 字段 | 说明 |
|----------|-------------------|------|
| 前置知识 | `prerequisites` | 阅读本文前建议先读 |
| 进阶阅读 | `next_steps` | 读完本文后推荐 |
| 相关内容 | `related` | 同主题其他文章 |
| 工具资源 | `tools` | 相关工具和模板 |

### 3.2 关联图谱示例

```
account-structure.md
    ├── prerequisites: [] (基础篇，无前置)
    ├── next_steps:
    │       ├── campaign-types.md
    │       └── search-campaigns/keyword-research.md
    └── related:
            ├── billing-budget.md
            └── quality-score.md

keyword-research.md
    ├── prerequisites:
    │       ├── account-structure.md
    │       └── campaign-types.md
    ├── next_steps:
    │       ├── match-types-guide.md
    │       └── bidding-strategies.md
    └── related:
            ├── negative-keywords.md
            └── search-campaign-basics.md
```

### 3.3 自动关联规则

1. **同分类自动关联**：同一目录下的文章自动显示在"同系列"区域
2. **标签匹配**：相同标签的文章自动关联
3. **手动优先级**：front matter 中手动指定的关联优先显示

---

## 4. SEO Title 规范

### 4.1 Title 格式模板

```
【B2B 场景】+【核心主题】+【价值/差异化】| 品牌名
```

### 4.2 各分类 Title 示例

| 文章 | SEO Title |
|------|-----------|
| account-structure.md | Google Ads 账户结构搭建指南：B2B 企业最佳实践 2026 |
| keyword-research.md | B2B 关键词研究方法：高意向客户获取策略与工具推荐 |
| match-types-guide.md | Google Ads 匹配类型详解：精确/词组/广泛修饰符用法对比 |
| bidding-strategies.md | B2B 出价策略全解析：从手动 CPC 到智能出价优化 |
| remarketing-strategies.md | B2B 再营销策略：长销售周期客户培育与转化提升 |
| pmax-setup-guide.md | Performance Max 设置教程：B2B 企业 PMax 最佳实践 |
| lead-generation-tactics.md | B2B 潜在客户获取：Google Ads 高转化线索生成策略 |
| conversion-tracking-setup.md | Google Ads 转化追踪设置：B2B 企业完整配置指南 |

### 4.3 Title 长度控制

- **理想长度**: 50-60 个字符
- **最大长度**: 60 个字符（避免截断）
- **关键词位置**: 核心关键词放在前 30 字符内

---

## 5. Markdown Front Matter 模板

### 5.1 完整模板

```yaml
---
# ===== 基础信息 =====
layout: knowledge-article          # 使用知识库专用布局
title: "文章标题"                   # H1 标题，SEO 重要
seo_title: "SEO 优化标题 | B2B Growth Knowledge Base"  # <title> 标签
permalink: /knowledge/google-ads/XX-category/article-slug/  # 固定 URL

# ===== 分类与标签 =====
category: "02-search-campaigns"    # 所属分类目录名
tags:                              # 最多 5 个标签
  - keywords
  - b2b-lead-gen
  - search-campaigns
  - optimization
difficulty: "intermediate"         # beginner | intermediate | advanced

# ===== 元信息 =====
author: "Your Name"
date: 2026-05-22                   # 发布日期
last_modified: 2026-05-22          # 最后更新
time_to_read: 8                    # 预计阅读时间（分钟）

# ===== SEO 元数据 =====
description: "文章描述，150-160字符，用于 meta description"
keywords: "关键词1, 关键词2, 关键词3"  # meta keywords（可选）
canonical_url: ""                   # 规范 URL（如有重复内容）

# ===== 关联文章 =====
prerequisites:                     # 前置知识
  - title: "账户结构基础"
    url: /knowledge/google-ads/01-fundamentals/account-structure/
  - title: "广告系列类型"
    url: /knowledge/google-ads/01-fundamentals/campaign-types/

next_steps:                        # 进阶阅读
  - title: "匹配类型详解"
    url: /knowledge/google-ads/02-search-campaigns/match-types-guide/
  - title: "出价策略优化"
    url: /knowledge/google-ads/02-search-campaigns/bidding-strategies/

related:                           # 相关内容
  - title: "否定关键词策略"
    url: /knowledge/google-ads/02-search-campaigns/negative-keywords/

# ===== 资源与工具 =====
tools:                             # 推荐工具/模板
  - name: "关键词规划师"
    url: "https://ads.google.com/home/tools/keyword-planner/"
    description: "Google 官方关键词研究工具"
  - name: "搜索词报告模板"
    url: "/assets/templates/search-terms-report.xlsx"
    description: "Excel 模板，用于分析搜索词"

# ===== 图片配置 =====
featured_image:                    # 特色图片（用于社交媒体分享）
  path: /assets/images/google-ads/keywords-research-og.jpg
  alt: "B2B 关键词研究方法示意图"
  width: 1200
  height: 630

# ===== 状态控制 =====
published: true                    # 是否发布
draft: false                       # 是否为草稿
featured: false                    # 是否推荐到首页
sitemap:                           # 站点地图配置
  changefreq: monthly
  priority: 0.8

# ===== 结构化数据 =====
schema_type: "TechArticle"         # Article | TechArticle | HowTo | FAQPage
---
```

### 5.2 简化模板（快速创建）

```yaml
---
layout: knowledge-article
title: "文章标题"
seo_title: "SEO 标题 | B2B Growth Knowledge Base"
permalink: /knowledge/google-ads/XX-category/article-slug/
category: "02-search-campaigns"
tags: [tag1, tag2, tag3]
difficulty: "intermediate"
description: "文章描述，150-160字符"
date: 2026-05-22
prerequisites: []
next_steps: []
related: []
tools: []
featured_image:
  path: /assets/images/google-ads/default-og.jpg
  alt: "图片描述"
---
```

---

## 6. 图片位置规范

### 6.1 目录结构

```
assets/
├── images/
│   ├── google-ads/                    # Google Ads 知识库图片
│   │   ├── og-images/                 # Open Graph 分享图 (1200x630)
│   │   │   ├── account-structure-og.jpg
│   │   │   ├── keyword-research-og.jpg
│   │   │   └── ...
│   │   ├── diagrams/                  # 流程图/架构图
│   │   │   ├── account-hierarchy.png
│   │   │   ├── campaign-structure.png
│   │   │   └── ...
│   │   ├── screenshots/               # 界面截图
│   │   │   ├── interface/
│   │   │   │   ├── keyword-planner.png
│   │   │   │   └── campaign-settings.png
│   │   │   └── reports/
│   │   │       ├── search-terms-report.png
│   │   │       └── auction-insights.png
│   │   ├── infographics/              # 信息图表
│   │   │   ├── match-types-comparison.png
│   │   │   └── bidding-strategies-flow.png
│   │   └── icons/                     # 分类图标
│   │       ├── icon-fundamentals.svg
│   │       ├── icon-search.svg
│   │       └── ...
│   └── certifications/                # 认证证书（已有）
│
├── templates/                         # 可下载模板
│   ├── keyword-research-template.xlsx
│   ├── campaign-setup-checklist.pdf
│   └── ...
│
└── downloads/                         # 其他下载资源
    └── ...
```

### 6.2 图片命名规范

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| OG 图 | `{slug}-og.jpg` | `keyword-research-og.jpg` |
| 截图 | `{context}-{description}.png` | `interface-keyword-planner.png` |
| 图表 | `{topic}-diagram.png` | `account-hierarchy-diagram.png` |
| 信息图 | `{topic}-infographic.png` | `match-types-infographic.png` |

### 6.3 图片尺寸规范

| 用途 | 尺寸 | 格式 | 大小限制 |
|------|------|------|----------|
| OG 分享图 | 1200x630 | JPG/PNG | < 200KB |
| 文章头图 | 1200x400 | JPG/PNG | < 150KB |
| 内容插图 | 800x600 或自适应 | PNG | < 100KB |
| 截图 | 原始尺寸 | PNG | < 300KB |
| 图标 | 64x64, 128x128 | SVG | - |

### 6.4 Markdown 图片引用

```markdown
<!-- 基础图片 -->
![图片描述](/assets/images/google-ads/diagrams/account-hierarchy.png)

<!-- 带说明的图片 -->
<figure>
  <img src="/assets/images/google-ads/screenshots/interface/keyword-planner.png" 
       alt="Google Ads 关键词规划师界面" 
       loading="lazy">
  <figcaption>图 1: 关键词规划师 - 发现新关键词界面</figcaption>
</figure>

<!-- 响应式图片 -->
<img src="/assets/images/google-ads/diagrams/campaign-structure.png" 
     alt="广告系列结构图" 
     class="img-responsive"
     loading="lazy">
```

---

## 7. 内链结构策略

### 7.1 内链类型

| 类型 | 目的 | 示例 |
|------|------|------|
| **导航链接** | 分类/层级导航 | 面包屑、侧边栏 |
| **上下文链接** | 概念解释、深入阅读 | 文中关键词链接 |
| **相关推荐** | 延伸阅读 | 文末 Related Articles |
| **工具资源** | 实用工具/模板 | 工具箱区域 |

### 7.2 内链锚文本规范

```markdown
<!-- ✅ 好的锚文本 - 描述性强 -->
[关键词匹配类型](/knowledge/google-ads/02-search-campaigns/match-types-guide/)
[设置转化追踪](/knowledge/google-ads/07-tracking-analytics/conversion-tracking-setup/)

<!-- ❌ 避免的锚文本 -->
[点击这里](#)
[了解更多](#)
[这篇文章](#)
```

### 7.3 内链密度建议

- **每 500 字**: 3-5 个内链
- **每篇文章**: 至少 2 个前置链接 + 2 个进阶链接
- **避免**: 过度链接（影响阅读体验）

### 7.4 内链检查清单

创建新文章时，确保：
- [ ] 链接到 2-3 篇前置知识文章
- [ ] 链接到 2-3 篇进阶阅读文章
- [ ] 文中关键概念首次出现时添加链接
- [ ] 检查所有链接可正常访问
- [ ] 使用相对路径 `/knowledge/...` 而非绝对 URL

---

## 8. 实施步骤（谨慎修改策略）

### Phase 1: 设计审查（当前）
- [x] 创建架构设计文档
- [ ] 用户审查并确认
- [ ] 根据反馈调整

### Phase 2: 基础设施
- [ ] 更新 `_config.yml`（添加 collections 配置）
- [ ] 更新 `_data/navigation.yml`
- [ ] 创建目录结构
- [ ] 创建 `_TEMPLATE.md`

### Phase 3: 内容迁移
- [ ] 更新现有文章 `search-campaign-basics.md`
- [ ] 创建分类首页 (index.md)
- [ ] 逐步创建新文章

### Phase 4: 验证测试
- [ ] 本地 Jekyll 构建测试
- [ ] 链接有效性检查
- [ ] SEO 元数据验证

---

## 9. 回滚计划

如需回滚，以下文件将被修改：

| 文件 | 修改类型 | 备份建议 |
|------|----------|----------|
| `_config.yml` | 追加配置 | 复制原文件为 `_config.yml.backup` |
| `_data/navigation.yml` | 重写 | 复制原文件为 `navigation.yml.backup` |
| `_knowledge/google-ads/` | 新增目录和文件 | Git 版本控制自动备份 |
| `google-ads.md` | 重写 | 复制原文件为 `google-ads.md.backup` |

### 回滚命令

```bash
# 如果使用了 Git
git checkout -- _config.yml
git checkout -- _data/navigation.yml
git checkout -- google-ads.md

# 删除新增目录（如需完全回滚）
rm -rf _knowledge/google-ads/02-search-campaigns/
rm -rf _knowledge/google-ads/03-display-remarketing/
# ... 其他新增目录
```

---

## 10. 下一步行动

请审查以上设计，确认以下事项：

1. **目录结构** - 9 个分类是否满足需求？是否需要增删？
2. **导航深度** - 二级导航是否足够？是否需要三级？
3. **Front Matter** - 字段是否过多？是否需要简化？
4. **实施优先级** - 希望先实施哪些分类？

确认后，我将开始 Phase 2 的基础设施实施。
