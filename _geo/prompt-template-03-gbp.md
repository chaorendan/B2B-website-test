---
layout: page
title: "模板3：Google Business Profile 管理"
permalink: /geo/gis-toolkit/prompt-templates/03-gbp-management/
description: "API 接入提示词模板 - Google Business Profile 商户信息批量管理"
lang: "zh"
---

# 提示词模板：Google Business Profile 管理

> 复制以下内容，粘贴给 AI 工具使用。

---

## 提示词正文

```
你是一个本地 SEO 工程师，擅长 Google Business Profile（GBP）运营。
请编写 Python 脚本，通过 GBP API 实现多门店信息批量管理。

## 任务
管理 12 家门店的 Google Business Profile 信息，实现批量查询、更新和数据导出。

## 输入
门店列表 CSV：【input/stores.csv】
字段：store_id, store_name, address, phone, website, category, service_radius_km

## 认证方式
OAuth 2.0 服务账号（Service Account）
- 凭据文件：service-account-key.json
- 配置教程参考：https://developers.google.com/my-business/content/setup

## 功能要求

### 1. 批量查询门店信息
查询所有门店的当前信息：
- 门店名称、地址、营业时间
- 电话、网站、类别
- 评分、评论数、照片数
- 服务区域（半径设定）

### 2. 批量更新门店信息
- 统一更新营业时间（支持节假日特殊时间）
- 批量上传门店照片（从指定文件夹读取）
- 更新服务区域半径
- 更新门店描述（SEO 优化文案）

### 3. 数据导出
- 导出所有门店信息到 Excel（多 Sheet 分类）
  - Sheet1: 基本信息
  - Sheet2: 营业时间
  - Sheet3: 评分与评论
  - Sheet4: 照片统计
- 生成门店覆盖范围 KML 文件（可在 Google Earth 打开）

### 4. 监控报告
- 评分低于 4.0 的门店预警
- 30 天内无新评论的门店预警
- 照片数少于 10 张的门店预警

## 代码要求
1. 依赖：google-api-python-client, openpyxl, simplekml, pandas
2. 限流：每秒最多 5 个请求
3. 错误处理：记录失败门店到 error_log.csv
4. 日志：记录所有操作到 gbp_operations.log
5. Dry-run 模式：--dry-run 参数，只预览不实际执行

## 命令行接口
python gbp_manager.py --action query --input stores.csv --output report.xlsx
python gbp_manager.py --action update-hours --input stores.csv --hours "9:00-18:00"
python gbp_manager.py --action update-photos --input stores.csv --photos-dir ./photos/
python gbp_manager.py --action export-kml --input stores.csv --output stores.kml
python gbp_manager.py --action monitor --input stores.csv --output monitor_report.xlsx

## 输出示例（Excel Sheet1）
store_id, store_name, address, phone, rating, review_count, photo_count, last_review_date
001, 广州珠江新城店, 广州市天河区..., 020-12345678, 4.5, 128, 35, 2026-06-15
002, 深圳科技园店, 深圳市南山区..., 0755-87654321, 3.8, 45, 8, 2026-05-20

## KML 输出结构
- 每个 Placemark 包含：门店名、地址、坐标、服务区域圆形

请提供完整代码，包含详细注释和配置说明。
```

---

## 使用说明

### 1. 前置准备

- 拥有 Google Business Profile 账户
- 拥有 Google Cloud 项目并启用 Business Profile API
- 创建服务账号并下载 JSON 密钥

### 2. 配置认证

```bash
# 设置环境变量
set GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

### 3. 执行

```bash
# 查询所有门店信息
python gbp_manager.py --action query --input stores.csv --output report.xlsx

# 批量更新营业时间
python gbp_manager.py --action update-hours --input stores.csv --hours "9:00-18:00"

# 生成覆盖范围 KML
python gbp_manager.py --action export-kml --input stores.csv --output stores.kml
```

---

## 相关模板

- [模板1：地理编码批量转换]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/01-geocoding/)
- [模板4：GEO × Google Ads 协同]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/04-geo-ads-integration/)
- [API Key 配置教程]({{ site.baseurl }}/geo/gis-toolkit/api-key-setup/)
