---
layout: page
title: "API 常用操作"
seo_title: "Google Ads API 常用操作 | 查询、创建、修改、删除"
description: "Google Ads API 常用操作实战：账户查询、广告系列创建、关键词批量操作、出价调整、报告生成。"
lang: "zh"
---

# API 常用操作

## 账户查询

### 获取账户层级结构

```python
from google.ads.googleads.client import GoogleAdsClient

client = GoogleAdsClient.load_from_storage("google-ads.yaml")
ga_service = client.get_service("GoogleAdsService")

# 查询客户账户列表
query = """
    SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone
    FROM customer
"""

response = ga_service.search(customer_id="1234567890", query=query)
for row in response:
    print(f"账户 ID: {row.customer.id}")
    print(f"账户名称: {row.customer.descriptive_name}")
    print(f"货币: {row.customer.currency_code}")
    print(f"时区: {row.customer.time_zone}")
```

### 获取广告系列列表

```python
query = """
    SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign_budget.amount_micros
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.id
"""

response = ga_service.search(customer_id="1234567890", query=query)
for row in response:
    campaign = row.campaign
    budget = row.campaign_budget
    print(f"{campaign.id}: {campaign.name}")
    print(f"  状态: {campaign.status.name}")
    print(f"  类型: {campaign.advertising_channel_type.name}")
    print(f"  预算: {budget.amount_micros / 1_000_000:.2f}")
```

## 广告系列创建

### 创建搜索广告系列

```python
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.v16.services.types import CampaignOperation

client = GoogleAdsClient.load_from_storage("google-ads.yaml")
campaign_service = client.get_service("CampaignService")
campaign_budget_service = client.get_service("CampaignBudgetService")

# 1. 创建预算
budget_operation = client.get_type("CampaignBudgetOperation")
budget = budget_operation.create
budget.name = "每日预算 500元"
budget.delivery_method = client.enums.BudgetDeliveryMethodEnum.STANDARD
budget.amount_micros = 500_000_000  # 500元 = 500 * 1,000,000 micros

budget_response = campaign_budget_service.mutate_campaign_budgets(
    customer_id="1234567890",
    operations=[budget_operation]
)
budget_resource_name = budget_response.results[0].resource_name

# 2. 创建广告系列
campaign_operation = client.get_type("CampaignOperation")
campaign = campaign_operation.create
campaign.name = "搜索广告系列 - API 测试"
campaign.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH
campaign.status = client.enums.CampaignStatusEnum.PAUSED  # 先暂停，审核后再启用
campaign.campaign_budget = budget_resource_name

# 出价策略
campaign.manual_cpc = client.get_type("ManualCpc")

# 网络设置
campaign.network_settings.target_google_search = True
campaign.network_settings.target_search_network = True
campaign.network_settings.target_content_network = False
campaign.network_settings.target_partner_search_network = False

# 投放时间
campaign.start_date = "20260620"
campaign.end_date = "20261231"

campaign_response = campaign_service.mutate_campaigns(
    customer_id="1234567890",
    operations=[campaign_operation]
)
print(f"创建成功: {campaign_response.results[0].resource_name}")
```

## 关键词批量操作

### 批量添加关键词

```python
from google.ads.googleads.client import GoogleAdsClient

client = GoogleAdsClient.load_from_storage("google-ads.yaml")
ad_group_criterion_service = client.get_service("AdGroupCriterionService")

# 关键词列表（关键词 + 匹配类型）
keywords = [
    ("数字营销服务", "EXACT"),
    ("Google Ads 代理", "PHRASE"),
    ("搜索广告投放", "BROAD"),
    ("B2B 营销方案", "EXACT"),
    ("广告优化技巧", "PHRASE"),
]

operations = []
for keyword_text, match_type in keywords:
    operation = client.get_type("AdGroupCriterionOperation")
    criterion = operation.create
    criterion.ad_group = "customers/1234567890/adGroups/9876543210"
    criterion.keyword.text = keyword_text
    criterion.keyword.match_type = getattr(
        client.enums.KeywordMatchTypeEnum, match_type
    )
    criterion.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
    
    # 设置默认出价
    criterion.cpc_bid_micros = 2_000_000  # 2元
    
    operations.append(operation)

# 批量提交（每次最多 10,000 个）
response = ad_group_criterion_service.mutate_ad_group_criteria(
    customer_id="1234567890",
    operations=operations
)

print(f"成功添加 {len(response.results)} 个关键词")
for result in response.results:
    print(f"  - {result.resource_name}")
```

### 批量暂停低效关键词

```python
query = """
    SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        metrics.clicks,
        metrics.impressions,
        metrics.cost_micros,
        metrics.conversions
    FROM ad_group_criterion
    WHERE 
        ad_group_criterion.type = 'KEYWORD'
        AND segments.date DURING LAST_30_DAYS
    ORDER BY metrics.clicks ASC
"""

response = ga_service.search(customer_id="1234567890", query=query)

operations = []
for row in response:
    clicks = row.metrics.clicks
    impressions = row.metrics.impressions
    cost = row.metrics.cost_micros / 1_000_000
    conversions = row.metrics.conversions
    
    # 暂停条件：30天0点击 或 花费>100元但0转化
    if clicks == 0 and impressions > 1000:
        operation = client.get_type("AdGroupCriterionOperation")
        operation.remove = row.ad_group_criterion.resource_name
        operations.append(operation)
        print(f"暂停（无点击）: {row.ad_group_criterion.keyword.text}")
    elif cost > 100 and conversions == 0:
        operation = client.get_type("AdGroupCriterionOperation")
        operation.remove = row.ad_group_criterion.resource_name
        operations.append(operation)
        print(f"暂停（高花费无转化）: {row.ad_group_criterion.keyword.text}")

if operations:
    response = ad_group_criterion_service.mutate_ad_group_criteria(
        customer_id="1234567890",
        operations=operations
    )
    print(f"共暂停 {len(response.results)} 个关键词")
```

## 出价调整

### 基于转化成本自动调整出价

```python
def adjust_bids_based_on_cpa(customer_id, target_cpa=50):
    """
    如果关键词的转化成本低于目标CPA，提高出价20%
    如果高于目标CPA，降低出价20%
    """
    query = """
        SELECT
            ad_group_criterion.criterion_id,
            ad_group_criterion.keyword.text,
            metrics.cost_micros,
            metrics.conversions,
            ad_group_criterion.cpc_bid_micros
        FROM ad_group_criterion
        WHERE 
            ad_group_criterion.type = 'KEYWORD'
            AND segments.date DURING LAST_30_DAYS
            AND metrics.conversions > 0
    """
    
    response = ga_service.search(customer_id=customer_id, query=query)
    
    operations = []
    for row in response:
        cost = row.metrics.cost_micros / 1_000_000
        conversions = row.metrics.conversions
        current_bid = row.ad_group_criterion.cpc_bid_micros
        
        actual_cpa = cost / conversions
        
        operation = client.get_type("AdGroupCriterionOperation")
        criterion = operation.update
        criterion.resource_name = row.ad_group_criterion.resource_name
        
        if actual_cpa < target_cpa * 0.8:
            # CPA 低于目标，提高出价
            new_bid = int(current_bid * 1.2)
            criterion.cpc_bid_micros = new_bid
            print(f"提高出价: {row.ad_group_criterion.keyword.text} "
                  f"({actual_cpa:.2f} < {target_cpa}) "
                  f"{current_bid/1e6:.2f} -> {new_bid/1e6:.2f}")
        elif actual_cpa > target_cpa * 1.2:
            # CPA 高于目标，降低出价
            new_bid = int(current_bid * 0.8)
            criterion.cpc_bid_micros = new_bid
            print(f"降低出价: {row.ad_group_criterion.keyword.text} "
                  f"({actual_cpa:.2f} > {target_cpa}) "
                  f"{current_bid/1e6:.2f} -> {new_bid/1e6:.2f}")
        else:
            continue
        
        # 指定更新字段
        client.copy_from(
            operation.update_mask,
            protobuf_helpers.field_mask(None, criterion._pb)
        )
        operations.append(operation)
    
    if operations:
        response = ad_group_criterion_service.mutate_ad_group_criteria(
            customer_id=customer_id,
            operations=operations
        )
        print(f"共调整 {len(response.results)} 个关键词出价")

# 执行
adjust_bids_based_on_cpa("1234567890", target_cpa=50)
```

## 报告生成

### 生成自定义性能报告

```python
import pandas as pd
from datetime import datetime, timedelta

def generate_performance_report(customer_id, days=30):
    """生成过去 N 天的广告系列性能报告"""
    
    query = f"""
        SELECT
            segments.date,
            campaign.id,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
        FROM campaign
        WHERE 
            segments.date DURING LAST_{days}_DAYS
            AND campaign.status != 'REMOVED'
        ORDER BY segments.date DESC, metrics.cost_micros DESC
    """
    
    response = ga_service.search(customer_id=customer_id, query=query)
    
    data = []
    for row in response:
        data.append({
            '日期': row.segments.date,
            '广告系列ID': row.campaign.id,
            '广告系列名称': row.campaign.name,
            '展示次数': row.metrics.impressions,
            '点击次数': row.metrics.clicks,
            '花费(元)': row.metrics.cost_micros / 1_000_000,
            '转化次数': row.metrics.conversions,
            '转化价值': row.metrics.conversions_value,
            'CTR': f"{(row.metrics.clicks / row.metrics.impressions * 100):.2f}%" if row.metrics.impressions > 0 else "0%",
            'CPC': f"{(row.metrics.cost_micros / row.metrics.clicks / 1_000_000):.2f}" if row.metrics.clicks > 0 else "0"
        })
    
    df = pd.DataFrame(data)
    
    # 保存为 CSV
    filename = f"google_ads_report_{datetime.now().strftime('%Y%m%d')}.csv"
    df.to_csv(filename, index=False, encoding='utf-8-sig')
    print(f"报告已保存: {filename}")
    
    # 打印汇总
    print("\n=== 汇总数据 ===")
    print(f"总花费: {df['花费(元)'].sum():.2f} 元")
    print(f"总点击: {df['点击次数'].sum()}")
    print(f"总转化: {df['转化次数'].sum():.0f}")
    print(f"平均CPA: {df['花费(元)'].sum() / df['转化次数'].sum():.2f} 元" if df['转化次数'].sum() > 0 else "无转化")
    
    return df

# 生成报告
df = generate_performance_report("1234567890", days=30)
```

### 定时报告（使用 Airflow / Cron）

```python
# daily_report.py - 每日定时执行
import schedule
import time

def job():
    print(f"[{datetime.now()}] 开始生成日报...")
    generate_performance_report("1234567890", days=1)
    print("日报生成完成")

# 每天上午 9 点执行
schedule.every().day.at("09:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(60)
```

## 批量操作最佳实践

### 分批处理

```python
def batch_mutate(service, customer_id, operations, batch_size=1000):
    """分批执行变异操作，避免超出限制"""
    results = []
    for i in range(0, len(operations), batch_size):
        batch = operations[i:i + batch_size]
        response = service.mutate(
            customer_id=customer_id,
            operations=batch
        )
        results.extend(response.results)
        print(f"处理批次 {i//batch_size + 1}/{(len(operations)-1)//batch_size + 1}")
    return results
```

### 错误处理

```python
from google.ads.googleads.errors import GoogleAdsException

try:
    response = campaign_service.mutate_campaigns(
        customer_id="1234567890",
        operations=[campaign_operation]
    )
except GoogleAdsException as ex:
    print(f"请求失败: {ex.request_id}")
    for error in ex.failure.errors:
        print(f"错误码: {error.error_code}")
        print(f"消息: {error.message}")
        if error.location:
            for field_path_element in error.location.field_path_elements:
                print(f"字段: {field_path_element.field_name}")
```

---

## 下一步

- [Python 自动化脚本实战]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/python-automation/)
