---
layout: page
title: "GEO 专属投放优化"
seo_title: "GEO 投放优化 | 地理数据分层、预算拆分、区域投放策略"
permalink: /geo/geo-ad-optimization/
description: "基于地理空间数据的广告投放优化：地理数据采集清洗、区域潜力拆解、预算/人群/产品分层投放，用地理分层数据解决流量泛化问题。"
lang: "zh"
---

# GEO 专属投放优化

## 核心逻辑

传统广告投放面临的最大问题是**流量泛化**——预算撒向全国，高价值区域得不到足够曝光，低价值区域浪费预算。GEO 投放优化通过地理数据分层，把预算、人群、产品精确匹配到高价值区域，直接提升广告精准度与转化效率。

```
地理数据采集 → 空间分析 → 区域潜力评分 → 预算/人群/产品分层 → 定向投放 → 数据复盘
```

---

## 一、地理数据采集与清洗

### 数据来源

| 数据类型 | 来源 | 用途 |
|----------|------|------|
| 人口数据 | 统计局、百度人口数据 | 区域市场规模评估 |
| 经济数据 | GDP、人均收入、消费指数 | 购买力评估 |
| 行业数据 | 搜索量分布、竞品密度 | 市场需求与竞争度 |
| 地理数据 | 行政区划、商圈边界、POI | 区域划分与半径投放 |

### 数据清洗流程

```python
import pandas as pd
import geopandas as gpd

# 1. 加载原始数据
population = pd.read_csv("data/city_population.csv")
search_volume = pd.read_csv("data/regional_search_volume.csv")
competitors = pd.read_csv("data/competitor_locations.csv")

# 2. 地理编码标准化（统一行政区编码）
# 去除非标准地名，匹配到标准行政区代码
def standardize_region_name(name):
    """标准化区域名称"""
    replacements = {
        "广州市": "广州", "武汉市": "武汉", "深圳市": "深圳",
        "北京市": "北京", "上海市": "上海"
    }
    return replacements.get(name, name.replace("市", "").replace("省", ""))

population['region'] = population['city'].apply(standardize_region_name)
search_volume['region'] = search_volume['city'].apply(standardize_region_name)

# 3. 合并数据源
merged = population.merge(search_volume, on='region', how='left')
merged = merged.merge(
    competitors.groupby('region').size().reset_index(name='competitor_count'),
    on='region', how='left'
)

# 4. 缺失值处理
merged['competitor_count'] = merged['competitor_count'].fillna(0)
merged['search_volume'] = merged['search_volume'].fillna(0)

print(f"清洗完成: {len(merged)} 个区域")
print(merged[['region', 'population', 'search_volume', 'competitor_count']].head())
```

---

## 二、空间分析与区域潜力拆解

### 区域分层模型

```
国家层级
  └── 省级
       └── 市级
            └── 区/县级
                 └── 商圈/片区
                      └── 半径范围（1km/3km/5km）
```

### 区域潜力评分模型

```python
def calculate_region_potential(df):
    """
    区域投放潜力评分
    评分公式：潜力 = (搜索量 × 人口密度) / (竞争度 + 1)
    """
    # 归一化处理
    df['search_norm'] = df['search_volume'] / df['search_volume'].max()
    df['pop_norm'] = df['population'] / df['population'].max()
    df['comp_norm'] = df['competitor_count'] / (df['competitor_count'].max() + 1)
    
    # 潜力评分（0-100）
    df['potential_score'] = (
        (df['search_norm'] * 0.4 + df['pop_norm'] * 0.3) / 
        (df['comp_norm'] + 0.3)
    ) * 100
    
    # 分级
    df['tier'] = pd.cut(
        df['potential_score'],
        bins=[0, 20, 40, 60, 80, 100],
        labels=['D', 'C', 'B', 'A', 'S']
    )
    
    return df.sort_values('potential_score', ascending=False)

# 执行评分
scored = calculate_region_potential(merged)
print(scored[['region', 'potential_score', 'tier']].head(20))
```

### 区域分级策略

| 等级 | 潜力评分 | 投放策略 | 预算占比 |
|------|----------|----------|----------|
| **S 级** | 80-100 | 集中投放，最高出价 | 40% |
| **A 级** | 60-80 | 重点投放，高出价 | 30% |
| **B 级** | 40-60 | 均衡投放，标准出价 | 20% |
| **C 级** | 20-40 | 测试投放，低出价 | 8% |
| **D 级** | 0-20 | 暂停投放 | 2% |

---

## 三、基于地理数据的投放方案

### 1. 预算拆分

```python
def allocate_budget(total_budget, scored_df):
    """基于区域潜力评分分配预算"""
    budget_allocation = {
        'S': 0.40, 'A': 0.30, 'B': 0.20, 'C': 0.08, 'D': 0.02
    }
    
    scored_df['budget'] = 0.0
    for tier, ratio in budget_allocation.items():
        tier_regions = scored_df[scored_df['tier'] == tier]
        tier_budget = total_budget * ratio
        # 区域内按潜力评分等比分配
        if len(tier_regions) > 0:
            per_region = tier_budget / tier_regions['potential_score'].sum()
            scored_df.loc[scored_df['tier'] == tier, 'budget'] = \
                tier_regions['potential_score'] * per_region
    
    return scored_df

# 分配 100,000 元月预算
result = allocate_budget(100000, scored)
print(result[['region', 'tier', 'potential_score', 'budget']].head(15))
```

### 2. 人群拆分

不同区域的用户需求存在差异，需要差异化受众定位：

| 区域类型 | 受众特征 | 受众策略 |
|----------|----------|----------|
| 一线城市 | 高收入、品牌敏感 | 品牌词 + 高端产品受众 |
| 二线城市 | 性价比导向 | 通用词 + 促销受众 |
| 产业聚集区 | B2B 采购需求 | 行业词 + 决策者受众 |
| 本地商圈 | 到店转化 | 半径定位 + 本地居民受众 |

### 3. 产品拆分

```python
# 基于区域需求匹配产品线
product_region_matrix = {
    '高端产品': ['S', 'A'],     # 仅在高潜力区域投放
    '标准产品': ['S', 'A', 'B'], # 中高潜力区域投放
    '入门产品': ['B', 'C'],      # 测试区域投放
    '清仓产品': ['C', 'D'],      # 低潜力区域清库存
}

def get_product_strategy(tier):
    """根据区域等级返回产品策略"""
    products = []
    for product, tiers in product_region_matrix.items():
        if tier in tiers:
            products.append(product)
    return products

# 示例
for tier in ['S', 'A', 'B', 'C', 'D']:
    print(f"{tier}级区域产品: {get_product_strategy(tier)}")
```

---

## 四、Google Ads 地域定位实操

### 地域设置

```python
from google.ads.googleads.client import GoogleAdsClient

client = GoogleAdsClient.load_from_storage("google-ads.yaml")
campaign_criterion_service = client.get_service("CampaignCriterionService")

def set_geo_targeting(customer_id, campaign_id, location_ids, bid_adjustment=1.0):
    """设置广告系列地域定位
    
    Args:
        location_ids: Google Ads 地域 ID 列表
        bid_adjustment: 出价调整系数（1.2 = +20%）
    """
    operations = []
    
    for loc_id in location_ids:
        operation = client.get_type("CampaignCriterionOperation")
        criterion = operation.create
        criterion.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
        criterion.location.geo_target_constant = (
            f"geoTargetConstants/{loc_id}"
        )
        criterion.location.bid_multiplier = bid_adjustment
        operations.append(operation)
    
    response = campaign_criterion_service.mutate_campaign_criteria(
        customer_id=customer_id,
        operations=operations
    )
    print(f"已设置 {len(response.results)} 个地域定位")

# 中国主要城市 Google Ads 地域 ID
CITY_LOCATION_IDS = {
    "北京": 2151577,
    "上海": 2151849,
    "广州": 2151814,
    "深圳": 2151845,
    "杭州": 2151830,
    "武汉": 2151874,
    "成都": 2151730,
}

# S级城市出价 +20%，A级 +10%
set_geo_targeting("1234567890", "campaign_1", 
                  [CITY_LOCATION_IDS["广州"], CITY_LOCATION_IDS["深圳"]], 
                  bid_adjustment=1.2)
```

### 常用地域 ID 查询

```python
def search_location_ids(customer_id, search_term):
    """搜索 Google Ads 地域 ID"""
    geo_service = client.get_service("GeoTargetConstantService")
    
    request = client.get_type("SearchGeoTargetConstantsRequest")
    request.query = search_term
    request.country_codes = ["CN"]  # 限定中国
    
    response = geo_service.search_geo_target_constants(request=request)
    
    for geo_target in response:
        print(f"{geo_target.geo_target_constant.id}: "
              f"{geo_target.geo_target_constant.name} "
              f"({geo_target.geo_target_constant.target_type})")

# 搜索广东省下的城市
search_location_ids("1234567890", "广东")
```

### 区域出价调整策略

| 区域等级 | 出价调整 | 说明 |
|----------|----------|------|
| S 级（核心商圈） | +20% ~ +50% | 集中获取高价值流量 |
| A 级（重点城市） | +10% ~ +20% | 稳定获取优质流量 |
| B 级（潜力城市） | 0%（标准） | 保持基准出价 |
| C 级（测试城市） | -20% ~ -30% | 低成本测试 |
| D 级（低效城市） | -50% 或排除 | 减少浪费 |

---

## 五、数据复盘与迭代

### 地域报告分析

```python
def analyze_geo_performance(customer_id, days=30):
    """分析地域投放效果"""
    query = f"""
        SELECT
            segments.geo_target_city,
            segments.geo_target_country,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
        FROM campaign
        WHERE segments.date DURING LAST_{days}_DAYS
        ORDER BY metrics.cost_micros DESC
    """
    
    response = ga_service.search(customer_id=customer_id, query=query)
    
    data = []
    for row in response:
        data.append({
            'city_id': row.segments.geo_target_city,
            'impressions': row.metrics.impressions,
            'clicks': row.metrics.clicks,
            'cost': row.metrics.cost_micros / 1_000_000,
            'conversions': row.metrics.conversions,
            'cpa': row.metrics.cost_micros / row.metrics.conversions / 1_000_000 if row.metrics.conversions > 0 else float('inf')
        })
    
    df = pd.DataFrame(data)
    
    # 标记优化建议
    df['action'] = df.apply(lambda r: 
        '加预算' if r['cpa'] < 30 and r['conversions'] > 0
        else '降出价' if r['cpa'] > 100 and r['conversions'] > 0
        else '暂停' if r['clicks'] == 0 and r['impressions'] > 500
        else '观察', axis=1
    )
    
    return df

# 生成地域复盘报告
geo_report = analyze_geo_performance("1234567890", days=30)
print(geo_report.to_string(index=False))
```

### 迭代节奏

| 频率 | 动作 |
|------|------|
| 每日 | 监控 S/A 级区域花费与转化 |
| 每周 | 调整区域出价系数（±10%） |
| 每月 | 全面地域复盘，更新潜力评分 |
| 每季度 | 重新评估区域分层，调整预算分配 |

---

## 相关文档

- [GEO 地理本地化概述]({{ site.baseurl }}/geo/)
- [关键词本地化优化]({{ site.baseurl }}/geo/keyword-localization/)
- [地域定向投放策略]({{ site.baseurl }}/knowledge/google-ads/geo-targeting/)

---

*本板块持续更新中，最后更新：2026-06-29*
