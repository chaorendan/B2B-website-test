---
layout: page
title: "API Key 配置教程"
seo_title: "API Key 配置完整教程 | Mapbox 百度地图 Google Maps Google Ads"
permalink: /geo/gis-toolkit/api-key-setup/
description: "Mapbox、百度地图、Google Maps、Google Ads API 的 Key 申请、配置与安全存储完整教程。"
lang: "zh"
---

# API Key 配置教程

本教程覆盖 GIS 板块所有需要 API Key 的服务，按免费优先原则排序。

---

## 一、Mapbox API Key 配置（首选）

Mapbox 提供每月 50,000 次免费地图加载和 100,000 次免费地理编码，是零成本启动的最佳选择。

### 1. 注册 Mapbox 账户

1. 访问 [mapbox.com](https://account.mapbox.com/auth/signup/)
2. 使用邮箱注册（支持 GitHub / Google 登录）
3. 验证邮箱

### 2. 获取 Access Token

1. 登录后进入 [Account 页面](https://account.mapbox.com/)
2. 在 **Access tokens** 区域，点击 **Create a token**
3. 配置 Token：
   - **Token name**：`Digital Marketing GIS`（自定义名称）
   - **Token scopes**：勾选以下权限：
     - ✅ `Read` tilesets（读取地图瓦片）
     - ✅ `Read` datasets（读取数据集）
     - ✅ `Read` styles（读取地图样式）
     - ✅ Geocoding（地理编码）
   - **URL restrictions**（可选）：限制只能从你的域名调用
     - `https://chaorendan.github.io/*`
     - `http://localhost:*/*`
4. 点击 **Create token**
5. 复制 Token（格式：`pk.eyJ1Ijoi...`）

### 3. Token 类型说明

| Token 前缀 | 类型 | 用途 | 安全性 |
|------------|------|------|--------|
| `pk.` | Public Token | 前端 JS 使用 | 可公开（配 URL 限制） |
| `sk.` | Secret Token | 服务端 API | 绝不公开 |

### 4. 配置到项目

**前端（JavaScript）**：

```javascript
// 在 HTML 中使用
mapboxgl.accessToken = 'pk.你的token';

// 推荐方式：从环境变量读取（构建时注入）
mapboxgl.accessToken = '{{ site.mapbox_token }}';
```

**后端（Python）**：

```python
import os
from mapbox import Geocoder

# 从环境变量读取
MAPBOX_TOKEN = os.environ.get('MAPBOX_ACCESS_TOKEN')
geocoder = Geocoder(access_token=MAPBOX_TOKEN)

# 地理编码示例
response = geocoder.forward('广州市天河区')
coordinates = response.geojson()['features'][0]['geometry']['coordinates']
print(f"经度: {coordinates[0]}, 纬度: {coordinates[1]}")
```

### 5. 用量监控

1. 进入 [Mapbox Account](https://account.mapbox.com/)
2. 查看 **Usage** 标签页
3. 监控以下指标：
   - Map Loads（地图加载次数）
   - Geocoding（地理编码次数）
   - Directions（路线规划次数）

---

## 二、百度地图 API Key 配置（国内首选）

百度地图提供每日 300,000 次免费配额，国内业务首选。

### 1. 注册百度开发者

1. 访问 [lbsyun.baidu.com](https://lbsyun.baidu.com/)
2. 使用百度账号登录
3. 进入 **控制台** → **应用管理** → **创建应用**

### 2. 创建应用并获取 AK

1. **应用名称**：`数字营销 GIS`
2. **应用类型**：选择 **浏览器端**（前端 JS）或 **服务端**（Python 后端）
3. **启用服务**：勾选以下：
   - ✅ JavaScript API（地图渲染）
   - ✅ 地理编码服务
   - ✅ 逆地理编码服务
   - ✅ 热力图图层
4. **白名单域名**：
   - `chaorendan.github.io/*`（GitHub Pages）
   - `localhost/*`（本地开发）
5. 点击 **提交**，获取 **AK**（Access Key）

### 3. 配置到项目

**前端（JavaScript）**：

```html
<!-- 在 HTML head 中引入 -->
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=你的AK"></script>
```

**后端（Python）**：

```python
import os
import requests

BAIDU_AK = os.environ.get('BAIDU_MAP_AK')

def geocode(address):
    """百度地图地理编码"""
    url = "https://api.map.baidu.com/geocoding/v3/"
    params = {
        'address': address,
        'output': 'json',
        'ak': BAIDU_AK
    }
    response = requests.get(url, params=params)
    result = response.json()
    
    if result['status'] == 0:
        location = result['result']['location']
        return location['lng'], location['lat']
    else:
        return None, None

# 使用
lng, lat = geocode("广州市天河区珠江新城")
print(f"经度: {lng}, 纬度: {lat}")
```

---

## 三、Google Maps API Key 配置（海外备选）

Google Maps 每月提供 $200 免费额度，约可覆盖 28,000 次地图加载。

### 1. 创建 Google Cloud 项目

1. 访问 [console.cloud.google.com](https://console.cloud.google.com)
2. 点击项目下拉 → **新建项目**
3. 项目名称：`Digital Marketing GIS`

### 2. 启用 API

1. 进入 **API 和服务** → **库**
2. 搜索并启用以下 API：
   - ✅ Maps JavaScript API
   - ✅ Geocoding API
   - ✅ Places API
   - ✅ Google Business Profile API

### 3. 创建 API Key

1. 进入 **API 和服务** → **凭据**
2. 点击 **创建凭据** → **API 密钥**
3. 复制生成的 Key
4. **限制 Key**（重要）：
   - 点击 Key 进入编辑页面
   - **应用限制**：
     - HTTP 引荐来源：`chaorendan.github.io/*`
     - IP 地址：你的服务器 IP（后端用）
   - **API 限制**：选择"限制密钥"，仅勾选启用的 API

### 4. 配置到项目

```python
import os
import requests

GOOGLE_MAPS_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

def geocode_google(address):
    """Google Maps 地理编码"""
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': GOOGLE_MAPS_KEY
    }
    response = requests.get(url, params=params)
    result = response.json()
    
    if result['status'] == 'OK':
        location = result['results'][0]['geometry']['location']
        return location['lng'], location['lat']
    return None, None
```

---

## 四、Google Ads API Key 配置

Google Ads API 本身免费，但需要开发者令牌和 OAuth 2.0 配置。

### 1. 获取开发者令牌

详见 [API 概述]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/api-overview/#申请开发者令牌)

### 2. OAuth 2.0 凭据

详见 [API 认证与权限]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/api-authentication/)

### 3. 完整配置文件

创建 `google-ads.yaml`：

```yaml
# Google Ads API 配置
developer_token: "YOUR_DEVELOPER_TOKEN"
login_customer_id: "YOUR_MANAGER_ACCOUNT_ID"

# OAuth 2.0（桌面应用）
client_id: "YOUR_CLIENT_ID.apps.googleusercontent.com"
client_secret: "YOUR_CLIENT_SECRET"
refresh_token: "YOUR_REFRESH_TOKEN"

# 或使用服务账号
# json_key_file_path: "service-account-key.json"
# delegated_account: "user@example.com"
```

### 4. 环境变量配置

```bash
# Windows PowerShell
$env:GOOGLE_ADS_DEVELOPER_TOKEN="your_token"
$env:GOOGLE_ADS_CLIENT_ID="your_client_id"
$env:GOOGLE_ADS_CLIENT_SECRET="your_secret"
$env:GOOGLE_ADS_REFRESH_TOKEN="your_refresh_token"
$env:MAPBOX_ACCESS_TOKEN="pk.your_mapbox_token"
$env:BAIDU_MAP_AK="your_baidu_ak"
$env:GOOGLE_MAPS_API_KEY="your_google_maps_key"
```

```bash
# Linux / macOS
export GOOGLE_ADS_DEVELOPER_TOKEN="your_token"
export MAPBOX_ACCESS_TOKEN="pk.your_mapbox_token"
export BAIDU_MAP_AK="your_baidu_ak"
```

---

## 五、API Key 安全最佳实践

### 绝对不要做的事

| ❌ 错误做法 | 后果 |
|------------|------|
| 把 Key 提交到 Git | 任何人可见，会被盗用 |
| 把 Key 硬编码在代码中 | 代码泄露即 Key 泄露 |
| 在公开网站前端暴露 Secret Key | 即时被盗 |
| 不设置 URL/IP 限制 | 任何人都能用你的额度 |

### 推荐做法

| ✅ 正确做法 | 说明 |
|------------|------|
| 使用环境变量 | `.env` 文件 + `.gitignore` |
| 设置 URL 限制 | 仅允许你的域名调用 |
| 定期轮换 Key | 每 3 个月更换一次 |
| 监控用量 | 设置用量告警 |
| 后端代理 | 敏感 API 通过后端中转 |

### .gitignore 配置

确保以下文件不被提交：

```gitignore
# API Key 和密钥
.env
google-ads.yaml
service-account-key.json
client_secret_*.json
*api_key*.txt
```

---

## 六、免费额度对比汇总

| API 服务 | 免费额度 | 超出费用 | 适合场景 |
|----------|----------|----------|----------|
| Mapbox 地图加载 | 50,000 次/月 | $0.6/1000 | 海外地图渲染 |
| Mapbox 地理编码 | 100,000 次/月 | $0.75/1000 | 海外地址转坐标 |
| 百度地图 JS | 300,000 次/天 | 免费 | 国内地国渲染 |
| 百度地理编码 | 30,000 次/天 | 免费 | 国内地址转坐标 |
| Google Maps | $200/月额度 | 超出按量 | 海外备选 |
| Google Business Profile | 免费 | 免费 | 商户管理 |
| Google Ads API | 免费 | 免费 | 广告操作 |

**零成本启动方案**：Mapbox + 百度地图 + Google Ads API + GBP = $0/月

---

## 相关文档

- [GIS 特色板块]({{ site.baseurl }}/geo/gis-toolkit/)
- [Mapbox 地图可视化]({{ site.baseurl }}/geo/gis-toolkit/mapbox-integration/)
- [提示词模板库]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/)
- [API 认证与权限]({{ site.baseurl }}/knowledge/google-ads/10-api-automation/api-authentication/)

---

*最后更新：2026-06-30*
