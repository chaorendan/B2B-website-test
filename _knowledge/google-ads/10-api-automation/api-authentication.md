---
layout: page
title: "API 认证与权限"
seo_title: "Google Ads API 认证 | OAuth 2.0 与服务账号配置"
description: "Google Ads API 开发者令牌申请、OAuth 2.0 配置、服务账号设置、权限管理最佳实践。"
lang: "zh"
---

# API 认证与权限

Google Ads API 使用 OAuth 2.0 进行身份验证。正确配置认证是安全使用 API 的第一步。

## 认证流程概览

```
你的应用 → OAuth 2.0 授权 → 获取 Access Token → 调用 Google Ads API
```

## 前置准备

1. **Google Cloud 项目**
   - 访问 [console.cloud.google.com](https://console.cloud.google.com)
   - 创建新项目或选择现有项目

2. **启用 Google Ads API**
   - 进入 **API 和服务** → **库**
   - 搜索 "Google Ads API"
   - 点击 **启用**

3. **开发者令牌**
   - 确保已在 Google Ads 账户中申请（参见 [API 概述](api-overview/)）

## OAuth 2.0 配置

### 步骤 1：创建 OAuth 2.0 凭据

1. 在 Google Cloud Console 中，进入 **API 和服务** → **凭据**
2. 点击 **创建凭据** → **OAuth 客户端 ID**
3. 选择应用类型：
   - **桌面应用**：用于本地脚本/工具
   - **Web 应用**：用于服务器端应用
   - **服务账号**：用于无人值守自动化（推荐用于生产）

### 步骤 2：配置同意屏幕

1. 进入 **OAuth 同意屏幕**
2. 选择用户类型：
   - **内部**：仅限 Google Workspace 组织内使用
   - **外部**：面向所有 Google 用户
3. 填写应用信息：
   - 应用名称
   - 用户支持邮箱
   - 开发者联系信息
4. 添加范围：
   - `https://www.googleapis.com/auth/adwords`（完整访问）
   - 或 `https://www.googleapis.com/auth/adwords.readonly`（只读）

### 步骤 3：下载客户端密钥

1. 在凭据列表中，找到创建的 OAuth 客户端 ID
2. 点击下载 JSON（文件名为 `client_secret_xxx.json`）
3. 保存到安全位置，**不要提交到代码仓库**

## 服务账号配置（推荐用于自动化）

服务账号适合无人值守的服务器端自动化，无需人工交互授权。

### 创建服务账号

1. Google Cloud Console → **IAM 和管理** → **服务账号**
2. 点击 **创建服务账号**
3. 填写名称和描述
4. 授予角色：
   - `Google Ads API 用户`（或自定义最小权限）
5. 创建密钥：
   - 密钥类型：**JSON**
   - 下载保存（文件名为 `service-account-key.json`）

### 关联 Google Ads 账户

1. 登录 Google Ads 账户
2. 进入 **工具与设置** → **已关联账户**
3. 找到服务账号邮箱（格式：`xxx@yyy.iam.gserviceaccount.com`）
4. 在 Google Ads 中授予该邮箱 **标准访问权限**

### 使用服务账号调用 API

```python
from google.ads.googleads.client import GoogleAdsClient

# 使用服务账号密钥文件
client = GoogleAdsClient.load_from_storage(
    path="service-account-key.json",
    developer_token="YOUR_DEVELOPER_TOKEN",
    login_customer_id="YOUR_MANAGER_ACCOUNT_ID"  # MCC ID，可选
)
```

## 开发者令牌配置

### 在代码中使用

所有 API 调用都需要提供开发者令牌：

```python
client = GoogleAdsClient.load_from_storage(
    path="google-ads.yaml",
    developer_token="YOUR_DEVELOPER_TOKEN"
)
```

### google-ads.yaml 配置模板

```yaml
developer_token: "YOUR_DEVELOPER_TOKEN"
login_customer_id: "YOUR_MANAGER_ACCOUNT_ID"  # 可选，MCC ID

# OAuth 2.0 配置（桌面应用）
client_id: "YOUR_CLIENT_ID"
client_secret: "YOUR_CLIENT_SECRET"
refresh_token: "YOUR_REFRESH_TOKEN"

# 或使用服务账号
# path_to_private_key_file: "service-account-key.json"
# delegated_account: "user@example.com"
```

## 获取 Refresh Token

### 桌面应用流程

1. **首次授权**
   ```python
   from google.ads.googleads.client import GoogleAdsClient
   
   client = GoogleAdsClient.load_from_storage("google-ads.yaml")
   # 会自动打开浏览器，要求用户授权
   ```

2. **保存 Refresh Token**
   授权成功后，库会自动将 `refresh_token` 保存到 `google-ads.yaml`

3. **后续使用**
   直接使用保存的 `refresh_token`，无需再次授权

### 使用 OAuth Playground（手动获取）

1. 访问 [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. 点击设置图标，勾选 **Use your own OAuth credentials**
3. 输入 `client_id` 和 `client_secret`
4. 选择范围：`https://www.googleapis.com/auth/adwords`
5. 点击 **Authorize APIs** → 登录并授权
6. 点击 **Exchange authorization code for tokens**
7. 复制 `refresh_token`

## 权限管理最佳实践

### 最小权限原则

| 场景 | 推荐范围 | 说明 |
|------|----------|------|
| 只读报告 | `adwords.readonly` | 无法修改任何数据 |
| 标准管理 | `adwords` | 完整读写权限 |
| 离线转化 | `adwords` | 需要写入权限上传转化 |

### 安全存储

**不要：**
- 将 `client_secret` 或 `refresh_token` 提交到 Git
- 在日志中打印令牌信息
- 通过邮件/聊天发送密钥文件

**推荐：**
- 使用环境变量存储敏感信息
- 使用密钥管理服务（AWS Secrets Manager / Azure Key Vault / GCP Secret Manager）
- 定期轮换 refresh token

### 环境变量方案

```python
import os
from google.ads.googleads.client import GoogleAdsClient

# 从环境变量读取
developer_token = os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN")
client_id = os.environ.get("GOOGLE_ADS_CLIENT_ID")
client_secret = os.environ.get("GOOGLE_ADS_CLIENT_SECRET")
refresh_token = os.environ.get("GOOGLE_ADS_REFRESH_TOKEN")

client = GoogleAdsClient.load_from_dict({
    "developer_token": developer_token,
    "client_id": client_id,
    "client_secret": client_secret,
    "refresh_token": refresh_token,
    "login_customer_id": os.environ.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID")
})
```

## 常见问题

### "Developer token is not approved"
- 检查令牌是否已通过审核（测试/基本/标准）
- 确认账户已产生至少一笔消费

### "User in the cookie is not a valid Ads user"
- 授权的 Google 账户没有 Google Ads 账户权限
- 确保使用与 Google Ads 账户关联的 Google 账号授权

### "AuthenticationError.NOT_ADS_USER"
- 服务账号未在 Google Ads 账户中授予权限
- 检查服务账号邮箱是否已添加为账户用户

---

## 下一步

- [常用 API 操作示例]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/api-common-operations/)
- [Python 自动化脚本]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/python-automation/)
