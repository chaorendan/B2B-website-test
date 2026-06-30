---
layout: page
title: "模板2：热力图可视化"
permalink: /geo/gis-toolkit/prompt-templates/02-heatmap/
description: "API 接入提示词模板 - 投放数据热力图可视化"
lang: "zh"
---

# 提示词模板：热力图可视化

> 复制以下内容，粘贴给 AI 工具使用。

---

## 提示词正文

```
你是一个数据可视化工程师，擅长 GIS + 数字营销数据展示。
请编写代码，创建广告投放数据的交互式热力图。

## 任务
将 Google Ads 地域投放数据可视化为交互式热力图，用颜色梯度展示不同城市的投放效果。

## 输入
CSV 文件路径：【input/geo_performance.csv】
字段：city, lng, lat, impressions, clicks, cost, conversions, conversion_value, cpa, roi

## 输出
独立的 HTML 文件，可直接在浏览器打开，无需服务器。

## 技术栈
- 地图库：Mapbox GL JS（免费 50k 次/月）
- 数据处理：内嵌 JavaScript（无需后端）

## 功能要求

### 1. 热力图渲染
- 圆形标记表示每个城市
- 颜色梯度表示效果：
  - 绿色：CPA < 80（优秀）
  - 黄色：CPA 80-150（一般）
  - 红色：CPA > 150（需优化）
- 圆的大小表示花费金额（花费越大圆越大）

### 2. 交互功能
- 点击城市标记，弹出详细数据弹窗：
  - 城市名、花费、展示、点击、转化、CPA、ROI
- 鼠标悬停时高亮该城市
- 支持缩放和平移

### 3. 指标切换
- 顶部控制面板，支持切换显示指标：
  - CPA（获客成本）
  - 转化数
  - ROI
  - 花费
- 切换时颜色梯度自动重新计算

### 4. 图例
- 右下角显示颜色图例
- 图例标题随指标切换更新
- 标注"优秀（低）"到"需优化（高）"

### 5. 区域分级标注
- 在每个城市标记旁显示 S/A/B/C/D 等级
- 等级标准：S(>80分) A(60-80) B(40-60) C(20-40) D(<20)
- 评分公式：score = (conversions / cost) * 1000（转化性价比）

## 设计要求
- 背景：Mapbox light-v11 样式
- 字体：系统默认无衬线字体
- 颜色：专业商务风格
- 布局：全屏地图 + 左上角控制面板 + 右下角图例

## 代码结构
- 单一 HTML 文件，CSS 和 JS 内嵌
- Token 通过变量配置：mapboxgl.accessToken = 'pk.你的Token'
- 数据内嵌为 JavaScript 数组（避免跨域问题）
- 代码注释完整

## 示例数据（用于测试）
const geoData = [
    {city:'广州',lng:113.2644,lat:23.1291,cost:15200,conversions:156,cpa:97.4,roi:4.5},
    {city:'深圳',lng:114.0579,lat:22.5431,cost:18500,conversions:203,cpa:91.1,roi:5.2},
    {city:'杭州',lng:120.1551,lat:30.2741,cost:12800,conversions:98,cpa:130.6,roi:3.1},
    {city:'武汉',lng:114.3055,lat:30.5928,cost:8200,conversions:45,cpa:182.2,roi:1.8},
    {city:'成都',lng:104.0668,lat:30.5728,cost:6500,conversions:28,cpa:232.1,roi:1.2},
];

请提供完整的 HTML 代码，确保替换 Token 后可直接在浏览器打开运行。
```

---

## 使用说明

### 1. 准备数据

创建 `input/geo_performance.csv`：

```csv
city,lng,lat,impressions,clicks,cost,conversions,conversion_value,cpa,roi
广州,113.2644,23.1291,12500,480,15200,156,68400,97.4,4.5
深圳,114.0579,22.5431,15800,620,18500,203,96100,91.1,5.2
杭州,120.1551,30.2741,9800,350,12800,98,39680,130.6,3.1
```

### 2. 获取 Mapbox Token

参考 [API Key 配置教程]({{ site.baseurl }}/geo/gis-toolkit/api-key-setup/) 获取免费 Token。

### 3. 生成热力图

将提示词粘贴给 AI，获得 HTML 代码后：

```bash
# 替换 Token
# 将代码中的 pk.你的Token 替换为你的 Mapbox Token

# 直接在浏览器打开
start heatmap.html
```

---

## 相关模板

- [模板1：地理编码批量转换]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/01-geocoding/)
- [模板4：GEO × Google Ads 协同]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/04-geo-ads-integration/)
- [Mapbox 地图可视化]({{ site.baseurl }}/geo/gis-toolkit/mapbox-integration/)
