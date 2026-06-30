---
layout: page
title: "模板4：GEO × Google Ads 协同"
permalink: /geo/gis-toolkit/prompt-templates/04-geo-ads-integration/
description: "API 接入提示词模板 - GEO 地理数据与 Google Ads 出价自动协同"
lang: "zh"
---

# 提示词模板：GEO × Google Ads 协同

> 复制以下内容，粘贴给 AI 工具使用。

---

## 提示词正文

```
你是一个 GEO + SEM 自动化工程师。
请编写 Python 脚本，实现地理空间数据与 Google Ads 投放的自动协同。

## 任务
基于区域潜力评分，自动调整 Google Ads 地域出价，实现"高价值区域加预算、低效区域降出价"的自动化闭环。

## 输入
CSV 文件：【input/region_potential_score.csv】
字段：region, location_id, potential_score, tier, current_bid_multiplier, current_cost, current_conversions

## 输出
1. bid_adjustment_log.csv（操作日志）
2. bid_preview.html（可视化预览报告）
3. dry_run_report.txt（预览模式报告）

## 决策逻辑

### 出价调整规则
| 区域等级 | 评分范围 | 当前出价 | 调整目标 | 操作 |
|----------|----------|----------|----------|------|
| S 级 | 80-100 | < 1.3 | 1.3 | 提高出价 |
| S 级 | 80-100 | >= 1.3 | 不变 | 维持 |
| A 级 | 60-80 | < 1.1 | 1.1 | 提高出价 |
| A 级 | 60-80 | >= 1.1 | 不变 | 维持 |
| B 级 | 40-60 | > 1.0 | 1.0 | 降至标准 |
| B 级 | 40-60 | <= 1.0 | 不变 | 维持 |
| C 级 | 20-40 | > 0.8 | 0.8 | 降低出价 |
| C 级 | 20-40 | <= 0.8 | 不变 | 维持 |
| D 级 | 0-20 | 任意 | 排除 | 暂停地域 |

### 安全机制
1. 每次最多调整 10 个地域（防止批量操作风险）
2. 单次调整幅度不超过 ±30%
3. D 级区域暂停前确认该区域 7 天内是否有转化（有则保留观察）
4. 生成预览报告，用户确认后才执行（除非 --force 参数）

## API 调用
使用 google-ads-python 库：
1. 查询当前地域出价设置（CampaignCriterion）
2. 构建出价调整操作（bid_multiplier 字段）
3. 执行 mutate 操作
4. 记录操作结果

## 配置
- google-ads.yaml 配置文件路径：【config/google-ads.yaml】
- 客户 ID：【1234567890】
- 广告系列 ID：【campaigns/123456】

## 代码要求
1. 依赖：google-ads, pandas, jinja2（HTML 报告模板）
2. Dry-run 模式（默认）：只生成预览，不实际执行
3. Force 模式（--force）：跳过确认，直接执行
4. 操作日志：记录每个地域的调整前后值、时间戳、操作结果
5. 预览报告：HTML 格式，包含调整前后对比表格和地图

## 预览报告（HTML）内容
1. 标题：GEO × Google Ads 出价调整预览
2. 汇总卡片：总调整数、提高出价数、降低出价数、排除数
3. 明细表格：区域 | 等级 | 评分 | 调整前 | 调整后 | 变化 | 操作
4. 风险提示：列出调整幅度超过 ±20% 的地域
5. 确认按钮：点击后生成确认文件（confirm.txt），脚本检测到后执行

## 操作日志格式（CSV）
timestamp, region, location_id, tier, score, old_multiplier, new_multiplier, change_percent, action, status, message

## 示例输出
timestamp,region,location_id,tier,score,old_multiplier,new_multiplier,change_percent,action,status,message
2026-06-30 10:00:00,广州,2151814,S,92,1.0,1.3,+30%,提高出价,成功,
2026-06-30 10:00:01,深圳,2151845,S,88,1.1,1.3,+18%,提高出价,成功,
2026-06-30 10:00:02,成都,2151730,C,28,1.0,0.8,-20%,降低出价,成功,
2026-06-30 10:00:03,青岛,2151830,D,15,1.0,0,排除,成功,7天内无转化

请提供完整代码，包含：
1. 主脚本 geo_ads_optimizer.py
2. HTML 报告模板 report_template.html（Jinja2）
3. requirements.txt
4. 配置说明
```

---

## 使用说明

### 1. 准备区域评分数据

创建 `input/region_potential_score.csv`：

```csv
region,location_id,potential_score,tier,current_bid_multiplier,current_cost,current_conversions
广州,2151814,92,S,1.0,15200,156
深圳,2151845,88,S,1.1,18500,203
杭州,2151830,72,A,1.0,12800,98
武汉,2151874,35,C,1.0,8200,45
成都,2151730,28,C,1.0,6500,28
青岛,2151830,15,D,1.0,5400,22
```

### 2. 配置 Google Ads API

参考 [API 认证与权限]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/api-authentication/)。

### 3. 执行

```bash
# 预览模式（默认，只生成报告不执行）
python geo_ads_optimizer.py --input region_potential_score.csv --customer-id 1234567890

# 确认后执行
python geo_ads_optimizer.py --input region_potential_score.csv --customer-id 1234567890 --force
```

---

## 相关模板

- [模板1：地理编码批量转换]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/01-geocoding/)
- [模板2：热力图可视化]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/02-heatmap/)
- [GEO 专属投放优化]({{ site.baseurl }}/geo/geo-ad-optimization/)
- [API 常用操作]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/api-common-operations/)
