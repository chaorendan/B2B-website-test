---
layout: page
title: "模板1：地理编码批量转换"
permalink: /geo/gis-toolkit/prompt-templates/01-geocoding/
description: "API 接入提示词模板 - 地理编码批量转换"
lang: "zh"
---

# 提示词模板：地理编码批量转换

> 复制以下内容，粘贴给 AI 工具使用。替换 `【】` 中的占位符。

---

## 提示词正文

```
你是一个 GIS + 数字营销工程师。
请编写 Python 脚本，实现以下功能：

## 任务
将客户地址批量转换为经纬度坐标，用于半径投放和热力图可视化。

## 输入
CSV 文件路径：【input/addresses.csv】
字段：store_id, store_name, address, city

## 输出
1. CSV 文件：store_id, store_name, address, lat, lng, accuracy, api_source
2. GeoJSON 文件：可直接用于 Mapbox/百度地图渲染

## API 选型逻辑
- 地址包含中国城市名（北京/上海/广州/深圳/杭州/武汉/成都/南京/苏州/青岛等）→ 百度地图地理编码 API
- 其他地址 → Mapbox Geocoding API
- 两个 API 都失败 → 记录到 error_log.csv

## API 配置
- 百度地图 AK：从环境变量 BAIDU_MAP_AK 读取
- Mapbox Token：从环境变量 MAPBOX_ACCESS_TOKEN 读取
- 如果环境变量不存在，提示用户先配置（参考 API Key 配置教程）

## 代码要求
1. 依赖管理：提供 requirements.txt
2. 限流控制：每次请求间隔 200ms（百度）/ 100ms（Mapbox）
3. 重试机制：失败自动重试 2 次，间隔 1 秒
4. 进度显示：使用 tqdm 显示处理进度
5. 结果验证：检查坐标是否在合理范围内（经度 73-136，纬度 18-54 为中国范围）
6. 地理编码精度：记录 accuracy（精确匹配/模糊匹配）

## 输出示例
CSV:
store_id,store_name,address,lat,lng,accuracy,api_source
001,广州珠江新城店,广州市天河区珠江新城,23.1208,113.3245,精确匹配,百度地图
002,深圳科技园店,深圳市南山区科技园,22.5400,113.9500,精确匹配,百度地图

GeoJSON:
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [113.3245, 23.1208]},
      "properties": {"store_id": "001", "store_name": "广州珠江新城店"}
    }
  ]
}

## 额外功能
1. 自动检测输入 CSV 编码（UTF-8 / GBK）
2. 支持命令行参数：--input, --output-csv, --output-geojson
3. 生成处理报告：总数/成功数/失败数/平均耗时

请提供完整可运行的 Python 代码，包含详细注释。
```

---

## 使用说明

### 1. 准备输入文件

创建 `input/addresses.csv`：

```csv
store_id,store_name,address,city
001,广州珠江新城店,广州市天河区珠江新城花城大道,广州
002,深圳科技园店,深圳市南山区科苑南路,深圳
003,杭州未来科技城店,杭州市余杭区文一西路,杭州
```

### 2. 配置环境变量

```bash
# Windows
set BAIDU_MAP_AK=你的百度AK
set MAPBOX_ACCESS_TOKEN=pk.你的MapboxToken

# Linux/Mac
export BAIDU_MAP_AK=你的百度AK
export MAPBOX_ACCESS_TOKEN=pk.你的MapboxToken
```

### 3. 执行

将提示词粘贴给 AI，获得代码后运行：

```bash
python geocoding_batch.py --input input/addresses.csv --output-csv output/geocoded.csv --output-geojson output/geocoded.geojson
```

---

## 相关模板

- [模板2：热力图可视化]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/02-heatmap/)
- [模板4：GEO × Google Ads 协同]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/04-geo-ads-integration/)
- [API Key 配置教程]({{ site.baseurl }}/geo/gis-toolkit/api-key-setup/)
