---
layout: page
title: "地域定向投放策略"
seo_title: "Google Ads 地域定向投放策略 | 区域出价调整与优化"
permalink: /knowledge/google-ads/geo-targeting/
description: "Google Ads 地域定向投放完整策略：地域设置、区域出价调整、地域报告分析、GEO 与 SEM 协同优化。"
lang: "zh"
---

# 地域定向投放策略

## 概述

地域定向（Geo Targeting）是 Google Ads 中最直接有效的投放优化手段之一。通过精确设定广告展示的地理位置，并针对不同区域调整出价，可以显著降低获客成本、提升转化率。

本文是 [GEO 专属投放优化]({{ site.baseurl }}/geo/geo-ad-optimization/) 的实操配套，聚焦 Google Ads 平台的具体操作。

---

## 一、地域设置

### 1. 地域定位层级

Google Ads 支持以下地域粒度：

| 层级 | 示例 | 适用场景 |
|------|------|----------|
| 国家 | 中国、美国 | 跨国投放 |
| 省级 | 广东省、加利福尼亚州 | 区域市场测试 |
| 市级 | 广州市、旧金山 | 精准城市投放 |
| 半径 | 某坐标 5km 范围 | 本地商圈/门店 |
| 邮编 | 510000 | 精准到区 |

### 2. 定位方式

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| **兴趣定位** | 用户在目标区域，或对该区域感兴趣 | 旅游、房地产 |
| ** presence 定位** | 用户当前在目标区域 | 本地服务、到店 |
| **兴趣 + presence** | 两者取并集 | 默认推荐 |

**B2B 建议**：使用"兴趣 + presence"，覆盖更多潜在客户。

### 3. 排除地域

```python
# 通过 API 排除低效区域
def exclude_locations(customer_id, campaign_id, location_ids):
    """排除指定地域"""
    operations = []
    for loc_id in location_ids:
        operation = client.get_type("CampaignCriterionOperation")
        criterion = operation.create
        criterion.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
        criterion.negative_location.geo_target_constant = (
            f"geoTargetConstants/{loc_id}"
        )
        operations.append(operation)
    
    response = campaign_criterion_service.mutate_campaign_criteria(
        customer_id=customer_id,
        operations=operations
    )
    print(f"已排除 {len(response.results)} 个地域")
```

---

## 二、区域出价调整

### 1. 出价调整原理

地域出价调整（Bid Adjustment）是在基础出价上按区域增减百分比：

```
实际出价 = 基础出价 × (1 + 区域调整系数)
```

### 2. 调整策略矩阵

| 区域表现 | CPA 表现 | 出价调整 | 操作建议 |
|----------|----------|----------|----------|
| 高转化低成本 | CPA < 目标 50% | +20% ~ +50% | 加大投放 |
| 高转化高成本 | CPA ≈ 目标 | 0% ~ +10% | 维持优化 |
| 低转化低成本 | CPA 未知 | 0% | 观察测试 |
| 低转化高成本 | CPA > 目标 150% | -20% ~ -30% | 降低出价 |
| 无转化有花费 | CPA = ∞ | -50% 或排除 | 暂停/排除 |

### 3. 批量设置出价调整

```python
def set_bid_adjustments(customer_id, adjustments):
    """
    批量设置地域出价调整
    
    Args:
        adjustments: [{location_id, multiplier}, ...]
                     multiplier: 1.2 = +20%, 0.8 = -20%
    """
    operations = []
    for adj in adjustments:
        operation = client.get_type("CampaignCriterionOperation")
        criterion = operation.update
        criterion.resource_name = (
            f"customers/{customer_id}/campaignCriteria/"
            f"{adj['location_id']}"
        )
        criterion.location.bid_multiplier = adj['multiplier']
        
        # 更新掩码
        field_mask = client.get_type("FieldMask")
        field_mask.paths.append("location.bid_multiplier")
        operation.update_mask.CopyFrom(field_mask)
        operations.append(operation)
    
    response = campaign_criterion_service.mutate_campaign_criteria(
        customer_id=customer_id,
        operations=operations
    )
    print(f"已更新 {len(response.results)} 个地域出价")

# 示例：S级城市 +20%，C级城市 -30%
adjustments = [
    {"location_id": "2151814", "multiplier": 1.2},  # 广州 +20%
    {"location_id": "2151845", "multiplier": 1.2},  # 深圳 +20%
    {"location_id": "2151830", "multiplier": 1.1},  # 杭州 +10%
    {"location_id": "2151874", "multiplier": 0.8},  # 武汉 -20%
    {"location_id": "2151730", "multiplier": 0.7},  # 成都 -30%
]
set_bid_adjustments("1234567890", adjustments)
```

---

## 三、地域报告分析

### 1. 关键指标

| 指标 | 公式 | 意义 |
|------|------|------|
| 区域 CTR | 点击/展示 | 广告在该区域的吸引力 |
| 区域 CPC | 花费/点击 | 该区域的流量成本 |
| 区域转化率 | 转化/点击 | 该区域用户的质量 |
| 区域 CPA | 花费/转化 | 该区域的获客成本 |
| 区域 ROI | 转化价值/花费 | 该区域的投入产出比 |

### 2. 生成地域报告

```python
def generate_geo_report(customer_id, days=30):
    """生成地域性能报告"""
    query = f"""
        SELECT
            segments.geo_target_city,
            segments.geo_target_country,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.average_cpc
        FROM campaign
        WHERE segments.date DURING LAST_{days}_DAYS
        ORDER BY metrics.cost_micros DESC
    """
    
    response = ga_service.search(customer_id=customer_id, query=query)
    
    data = []
    for row in response:
        m = row.metrics
        s = row.segments
        clicks = m.clicks
        cost = m.cost_micros / 1_000_000
        conversions = m.conversions
        
        data.append({
            'city_id': s.geo_target_city,
            'impressions': m.impressions,
            'clicks': clicks,
            'cost': cost,
            'conversions': conversions,
            'conversion_value': m.conversions_value,
            'ctr': f"{clicks/m.impressions*100:.2f}%" if m.impressions > 0 else "0%",
            'cpc': f"{cost/clicks:.2f}" if clicks > 0 else "0",
            'conv_rate': f"{conversions/clicks*100:.2f}%" if clicks > 0 else "0",
            'cpa': f"{cost/conversions:.2f}" if conversions > 0 else "∞",
            'roi': f"{m.conversions_value/cost:.2f}" if cost > 0 else "0"
        })
    
    df = pd.DataFrame(data)
    return df

# 生成报告
report = generate_geo_report("1234567890", days=30)
print(report.to_string(index=False))
```

### 3. 优化决策树

```
区域数据分析
    │
    ├── CPA < 目标 50% 且转化数 > 5
    │   └── ✅ 提高出价 +20%~+50%，扩大流量
    │
    ├── CPA ≈ 目标 且转化数 > 3
    │   └── ⚠️ 维持出价，优化广告文案
    │
    ├── CPA > 目标 150% 且转化数 > 0
    │   └── ⬇️ 降低出价 -20%~-30%，观察2周
    │
    ├── 花费 > 200元 且转化数 = 0
    │   └── ❌ 暂停该地域或排除
    │
    └── 展示 > 1000 且点击 = 0
        └── ❌ 检查广告文案/落地页，可能不匹配
```

---

## 四、GEO × SEM 协同

### 协同模型

| 渠道 | 作用 | GEO 联动 |
|------|------|----------|
| **SEM（广告）** | 快速获取地域流量 | 区域出价调整、半径投放 |
| **SEO（自然）** | 长期积累地域排名 | 地域关键词优化、本地落地页 |
| **GEO（地图）** | 本地搜索曝光 | Google Business Profile |

### 数据闭环

```
SEM 地域报告 → 识别高价值区域
    ↓
SEO 加大该区域关键词优化
    ↓
GEO 完善 Google Business Profile
    ↓
自然流量 + 地图流量增长
    ↓
降低 SEM 依赖，整体 CPA 下降
```

---

## 五、常见问题

### Q: 半径投放精度如何？

Google Ads 半径投放最小 1km，最大 800km。建议：
- 本地服务：3-5km
- 商圈覆盖：5-10km
- 城市覆盖：20-50km

### Q: 如何处理"人在A城，搜B城"的情况？

使用"兴趣 + presence"定位方式，可以覆盖：
- 当前在 B 城的用户
- 近期搜索过 B 城相关内容的用户
- 表达过对 B 城感兴趣的用户

### Q: 地域出价调整和受众出价调整叠加吗？

是的，两者相乘：
```
实际出价 = 基础出价 × 地域调整 × 受众调整
```
例如：地域 +20%，受众 +30%，则实际出价 = 基础 × 1.2 × 1.3 = 基础 × 1.56

---

## 相关文档

- [GEO 地理本地化概述]({{ site.baseurl }}/geo/)
- [GEO 专属投放优化]({{ site.baseurl }}/geo/geo-ad-optimization/)
- [关键词本地化优化]({{ site.baseurl }}/geo/keyword-localization/)
- [API 常用操作]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/api-common-operations/)

---

*本板块持续更新中，最后更新：2026-06-29*
