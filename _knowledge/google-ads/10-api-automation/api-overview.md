---
layout: page
title: "Google Ads API 概述"
seo_title: "Google Ads API 概述 | 版本演进与核心能力"
description: "Google Ads API 与 AdWords API 的区别、版本演进、适用场景与核心能力介绍。"
lang: "zh"
---

# Google Ads API 概述

## 什么是 Google Ads API

Google Ads API 是 Google 提供的官方程序化接口，允许开发者通过代码直接操作 Google Ads 账户。相比传统的界面操作，API 提供了更高的效率、更强的灵活性和更深度的数据访问能力。

## 版本演进

| 版本 | 状态 | 说明 |
|------|------|------|
| AdWords API | 已停用 (2022) | 旧版 SOAP 接口 |
| Google Ads API v13-v16 | 已弃用 | 早期 REST/gRPC 版本 |
| **Google Ads API v17+** | **当前稳定版** | 推荐使用 |

## 核心能力

### 账户管理
- 多账户层级查询（MCC → 客户账户 → 广告系列）
- 账户设置批量修改
- 预算与出价策略管理

### 广告操作
- 广告系列/广告组/关键词的 CRUD
- 广告文案批量创建与 A/B 测试
- 受众与定位条件管理

### 数据报告
- 实时性能数据查询
- 自定义字段与维度组合
- 历史数据回溯（最长 3 年）

### 转化追踪
- 转化操作配置
- 增强型转化上传
- 离线转化导入

## 适用场景

**推荐使用 API：**
- 管理 5 个以上账户
- 需要每日生成自定义报告
- 关键词数量超过 1000
- 需要与内部系统（CRM/ERP）集成
- 实时出价策略（如基于库存动态调整）

**界面操作足够：**
- 仅管理 1-2 个账户
- 关键词数量少于 500
- 不需要与外部系统集成
- 预算调整频率低于每周一次

## 申请开发者令牌

### 前提条件
1. 拥有 Google Ads 账户（非经理账户也可）
2. 账户历史消费 > $0（已产生至少一笔费用）
3. 完成账户设置（时区、货币已配置）

### 申请流程

1. **登录 Google Ads 账户**
   - 访问 [ads.google.com](https://ads.google.com)
   - 使用管理员权限账户登录

2. **进入 API 中心**
   - 点击右上角 **工具与设置**（扳手图标）
   - 选择 **已关联账户** → **API 中心**

3. **申请开发者令牌**
   - 点击 **申请开发者令牌**
   - 填写申请表单：
     - **用途**：选择"管理我自己的 Google Ads 账户"
     - **工具名称**：填写你的应用/工具名称
     - **描述**：简要说明使用场景

4. **等待审核**
   - 基础权限：即时获批（测试层级）
   - 标准权限：1-2 个工作日审核
   - 基本权限：可访问生产数据，但有每日操作限额

### 权限层级

| 层级 | 每日操作限额 | 适用场景 |
|------|-------------|----------|
| 测试 | 15,000 | 开发测试阶段 |
| 基本 | 10,000 | 小规模账户管理 |
| 标准 | 100,000+ | 大规模自动化运营 |

## API 架构

### 协议
- **gRPC**：高性能二进制协议，推荐用于生产环境
- **REST**：基于 HTTP/JSON，调试更方便

### 客户端库
| 语言 | 库名称 | 安装命令 |
|------|--------|----------|
| Python | `google-ads` | `pip install google-ads` |
| Java | `google-ads` | Maven/Gradle 依赖 |
| PHP | `google-ads-php` | `composer require googleads/google-ads-php` |
| .NET | `Google.Ads.GoogleAds` | NuGet 包 |
| Ruby | `google-ads-googleads` | `gem install google-ads-googleads` |

## 速率限制

| 限制类型 | 默认值 | 说明 |
|----------|--------|------|
| 每日操作数 | 15,000 (测试) / 10,000+ (基本) | 所有 API 调用累计 |
| 每秒请求数 | 100 | 突发流量控制 |
| 每个请求资源数 | 10,000 | 单次请求返回/操作的最大资源数 |

## 费用

Google Ads API **本身免费**，但：
- API 操作产生的广告费用正常计费
- 大规模数据查询可能产生 Cloud 费用（如使用 BigQuery 导出）

---

## 下一步

- [配置 OAuth 2.0 认证]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/api-authentication/)
- [运行第一个 Python 脚本]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/python-automation/)
