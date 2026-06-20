---
layout: page
title: "Python 自动化"
seo_title: "Google Ads API Python 自动化 | 脚本与工具开发"
description: "使用 google-ads-python 库构建自动化脚本，实现批量操作、数据同步、定时任务和完整工具开发。"
lang: "zh"
---

# Python 自动化

## 环境准备

### 安装依赖

```bash
pip install google-ads pandas openpyxl
```

### 项目结构

```
google-ads-automation/
├── config/
│   └── google-ads.yaml          # API 配置（不提交到 Git）
├── scripts/
│   ├── __init__.py
│   ├── keyword_manager.py       # 关键词管理
│   ├── bid_optimizer.py         # 出价优化
│   ├── report_generator.py      # 报告生成
│   └── campaign_builder.py      # 广告系列构建
├── data/
│   ├── input/                   # 输入数据（关键词列表等）
│   └── output/                  # 输出报告
├── tests/
│   └── test_scripts.py
├── requirements.txt
└── README.md
```

## 第一个查询脚本

### 获取账户基本信息

```python
# scripts/first_query.py
from google.ads.googleads.client import GoogleAdsClient

def get_account_info(customer_id):
    """获取账户基本信息"""
    client = GoogleAdsClient.load_from_storage("config/google-ads.yaml")
    ga_service = client.get_service("GoogleAdsService")
    
    query = """
        SELECT
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone,
            customer.auto_tagging_enabled
        FROM customer
    """
    
    response = ga_service.search(customer_id=customer_id, query=query)
    
    for row in response:
        customer = row.customer
        print("=" * 50)
        print(f"账户 ID: {customer.id}")
        print(f"账户名称: {customer.descriptive_name}")
        print(f"货币: {customer.currency_code}")
        print(f"时区: {customer.time_zone}")
        print(f"自动标记: {'已启用' if customer.auto_tagging_enabled else '未启用'}")
        print("=" * 50)

if __name__ == "__main__":
    get_account_info("1234567890")
```

### 运行脚本

```bash
cd google-ads-automation
python scripts/first_query.py
```

## 完整工具：关键词批量管理器

```python
# scripts/keyword_manager.py
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
import pandas as pd

class KeywordManager:
    def __init__(self, config_path="config/google-ads.yaml"):
        self.client = GoogleAdsClient.load_from_storage(config_path)
        self.ga_service = self.client.get_service("GoogleAdsService")
        self.criterion_service = self.client.get_service("AdGroupCriterionService")
    
    def add_keywords_from_csv(self, customer_id, ad_group_id, csv_path):
        """从 CSV 文件批量添加关键词
        
        CSV 格式:
        keyword,match_type,bid
        数字营销,EXACT,2.5
        广告投放,PHRASE,1.8
        """
        df = pd.read_csv(csv_path)
        
        operations = []
        for _, row in df.iterrows():
            operation = self.client.get_type("AdGroupCriterionOperation")
            criterion = operation.create
            criterion.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
            criterion.keyword.text = row['keyword']
            criterion.keyword.match_type = getattr(
                self.client.enums.KeywordMatchTypeEnum, 
                row['match_type'].upper()
            )
            criterion.cpc_bid_micros = int(row['bid'] * 1_000_000)
            criterion.status = self.client.enums.AdGroupCriterionStatusEnum.ENABLED
            operations.append(operation)
        
        try:
            response = self.criterion_service.mutate_ad_group_criteria(
                customer_id=customer_id,
                operations=operations
            )
            print(f"成功添加 {len(response.results)} 个关键词")
            return response.results
        except GoogleAdsException as ex:
            self._handle_error(ex)
            return []
    
    def get_keyword_performance(self, customer_id, days=30):
        """获取关键词性能报告"""
        query = f"""
            SELECT
                ad_group_criterion.criterion_id,
                ad_group_criterion.keyword.text,
                ad_group_criterion.keyword.match_type,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.conversions_value,
                ad_group_criterion.cpc_bid_micros
            FROM ad_group_criterion
            WHERE 
                ad_group_criterion.type = 'KEYWORD'
                AND segments.date DURING LAST_{days}_DAYS
            ORDER BY metrics.cost_micros DESC
        """
        
        response = self.ga_service.search(customer_id=customer_id, query=query)
        
        data = []
        for row in response:
            metrics = row.metrics
            criterion = row.ad_group_criterion
            data.append({
                'criterion_id': criterion.criterion_id,
                'keyword': criterion.keyword.text,
                'match_type': criterion.keyword.match_type.name,
                'impressions': metrics.impressions,
                'clicks': metrics.clicks,
                'cost': metrics.cost_micros / 1_000_000,
                'conversions': metrics.conversions,
                'conversion_value': metrics.conversions_value,
                'current_bid': criterion.cpc_bid_micros / 1_000_000,
                'ctr': metrics.clicks / metrics.impressions if metrics.impressions > 0 else 0,
                'cpc': metrics.cost_micros / metrics.clicks / 1_000_000 if metrics.clicks > 0 else 0,
                'cpa': metrics.cost_micros / metrics.conversions / 1_000_000 if metrics.conversions > 0 else float('inf')
            })
        
        return pd.DataFrame(data)
    
    def pause_underperforming_keywords(self, customer_id, min_clicks=0, min_cpa=100):
        """暂停低效关键词
        
        暂停条件:
        - 30天内0点击且展示>1000
        - CPA超过设定阈值
        """
        df = self.get_keyword_performance(customer_id, days=30)
        
        to_pause = df[
            ((df['clicks'] == 0) & (df['impressions'] > 1000)) |
            ((df['conversions'] > 0) & (df['cpa'] > min_cpa))
        ]
        
        if to_pause.empty:
            print("没有需要暂停的关键词")
            return
        
        operations = []
        for _, row in to_pause.iterrows():
            operation = self.client.get_type("AdGroupCriterionOperation")
            operation.remove = f"customers/{customer_id}/adGroupCriteria/{row['criterion_id']}"
            operations.append(operation)
        
        response = self.criterion_service.mutate_ad_group_criteria(
            customer_id=customer_id,
            operations=operations
        )
        print(f"已暂停 {len(response.results)} 个低效关键词")
        return to_pause[['keyword', 'match_type', 'clicks', 'cost', 'conversions', 'cpa']]
    
    def export_keyword_report(self, customer_id, output_path, days=30):
        """导出关键词报告到 Excel"""
        df = self.get_keyword_performance(customer_id, days=days)
        
        # 添加分析列
        df['status'] = df.apply(self._get_status, axis=1)
        df['recommendation'] = df.apply(self._get_recommendation, axis=1)
        
        # 保存到 Excel
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='关键词报告', index=False)
            
            # 创建汇总表
            summary = pd.DataFrame({
                '指标': ['总花费', '总点击', '总转化', '平均CPA', '平均CPC', '总CTR'],
                '数值': [
                    f"{df['cost'].sum():.2f} 元",
                    f"{df['clicks'].sum()}",
                    f"{df['conversions'].sum():.0f}",
                    f"{df['cost'].sum() / df['conversions'].sum():.2f} 元" if df['conversions'].sum() > 0 else "N/A",
                    f"{df['cost'].sum() / df['clicks'].sum():.2f} 元" if df['clicks'].sum() > 0 else "N/A",
                    f"{df['clicks'].sum() / df['impressions'].sum() * 100:.2f}%" if df['impressions'].sum() > 0 else "N/A"
                ]
            })
            summary.to_excel(writer, sheet_name='汇总', index=False)
        
        print(f"报告已导出: {output_path}")
        return df
    
    def _get_status(self, row):
        """判断关键词状态"""
        if row['clicks'] == 0 and row['impressions'] > 500:
            return '需优化'
        elif row['conversions'] > 0 and row['cpa'] < 50:
            return '表现优秀'
        elif row['conversions'] > 0 and row['cpa'] > 100:
            return '成本过高'
        else:
            return '观察中'
    
    def _get_recommendation(self, row):
        """给出优化建议"""
        if row['status'] == '需优化':
            return '考虑暂停或修改匹配类型'
        elif row['status'] == '表现优秀':
            return '可适当提高出价扩大流量'
        elif row['status'] == '成本过高':
            return '降低出价或优化落地页'
        else:
            return '继续观察数据'
    
    def _handle_error(self, ex):
        """处理 API 错误"""
        print(f"请求失败 (Request ID: {ex.request_id})")
        for error in ex.failure.errors:
            print(f"  错误: {error.message}")

# 使用示例
if __name__ == "__main__":
    manager = KeywordManager()
    
    # 导出报告
    manager.export_keyword_report(
        customer_id="1234567890",
        output_path="data/output/keyword_report.xlsx",
        days=30
    )
    
    # 暂停低效关键词
    manager.pause_underperforming_keywords(
        customer_id="1234567890",
        min_cpa=100
    )
```

## 定时任务：Airflow DAG

```python
# dags/google_ads_daily.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import sys
sys.path.append('/opt/airflow/scripts')

from keyword_manager import KeywordManager
from report_generator import ReportGenerator

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email': ['your-email@example.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'google_ads_daily_tasks',
    default_args=default_args,
    description='Google Ads 每日自动化任务',
    schedule_interval='0 9 * * *',  # 每天上午 9 点
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:

    def generate_daily_report():
        generator = ReportGenerator()
        generator.generate_daily_report("1234567890")
    
    def optimize_bids():
        manager = KeywordManager()
        manager.optimize_bids("1234567890", target_cpa=50)
    
    def pause_underperforming():
        manager = KeywordManager()
        manager.pause_underperforming_keywords("1234567890")
    
    # 任务定义
    task_report = PythonOperator(
        task_id='generate_daily_report',
        python_callable=generate_daily_report,
    )
    
    task_optimize = PythonOperator(
        task_id='optimize_bids',
        python_callable=optimize_bids,
    )
    
    task_pause = PythonOperator(
        task_id='pause_underperforming_keywords',
        python_callable=pause_underperforming,
    )
    
    # 任务依赖
    task_report >> task_optimize >> task_pause
```

## 安全最佳实践

### 配置管理

```python
# config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DEVELOPER_TOKEN = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")
    CLIENT_ID = os.getenv("GOOGLE_ADS_CLIENT_ID")
    CLIENT_SECRET = os.getenv("GOOGLE_ADS_CLIENT_SECRET")
    REFRESH_TOKEN = os.getenv("GOOGLE_ADS_REFRESH_TOKEN")
    LOGIN_CUSTOMER_ID = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")
    
    @classmethod
    def validate(cls):
        required = [cls.DEVELOPER_TOKEN, cls.CLIENT_ID, cls.CLIENT_SECRET, cls.REFRESH_TOKEN]
        missing = [name for name, value in zip(
            ['DEVELOPER_TOKEN', 'CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN'],
            required
        ) if not value]
        if missing:
            raise ValueError(f"缺少环境变量: {', '.join(missing)}")

# .env 文件（不提交到 Git）
# GOOGLE_ADS_DEVELOPER_TOKEN=your_token
# GOOGLE_ADS_CLIENT_ID=your_client_id
# GOOGLE_ADS_CLIENT_SECRET=your_client_secret
# GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
```

### 日志记录

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/google_ads_automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 使用
logger.info("开始执行关键词优化")
logger.warning("发现低效关键词，准备暂停")
logger.error("API 调用失败", exc_info=True)
```

---

## 完整项目 GitHub 模板

```markdown
# Google Ads 自动化工具

## 功能
- 关键词批量管理
- 自动出价优化
- 定时报告生成
- 低效关键词自动暂停

## 安装
```bash
git clone https://github.com/yourusername/google-ads-automation.git
cd google-ads-automation
pip install -r requirements.txt
```

## 配置
1. 复制 `.env.example` 为 `.env`
2. 填写你的 API 凭据
3. 运行 `python scripts/first_query.py` 测试连接

## 使用
```bash
# 导出关键词报告
python scripts/keyword_manager.py --action export --customer-id 1234567890

# 优化出价
python scripts/bid_optimizer.py --customer-id 1234567890 --target-cpa 50
```

## 定时任务
使用 Airflow 或 Cron 配置定时执行，详见 `dags/` 目录。
```

---

*本板块持续更新中，最后更新：2026-06-20*
