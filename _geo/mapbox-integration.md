---
layout: page
title: "Mapbox 地图可视化"
seo_title: "Mapbox GL JS 地图可视化 | 投放数据热力图与商圈分析"
permalink: /geo/gis-toolkit/mapbox-integration/
description: "使用 Mapbox GL JS（每月 50,000 次免费）实现广告投放数据热力图、商圈半径分析、区域分层可视化，含完整可运行代码。"
lang: "zh"
---

# Mapbox 地图可视化

Mapbox GL JS 是一个开源的 JavaScript 地图库，支持矢量瓦片渲染、自定义样式、交互式图层。每月 50,000 次免费加载，是数字营销地理可视化的最佳免费方案。

---

## 一、环境搭建

### CDN 引入

```html
<!-- Mapbox GL JS CSS -->
<link href="https://api.mapbox.com/mapbox-gl-js/v3.5.2/mapbox-gl.css" rel="stylesheet">

<!-- Mapbox GL JS JS -->
<script src="https://api.mapbox.com/mapbox-gl-js/v3.5.2/mapbox-gl.js"></script>
```

### Python 环境安装

```bash
pip install mapboxgl pandas
```

---

## 二、投放数据热力图

### 场景：8 城市广告投放效果热力图

将 Google Ads 地域投放数据可视化为热力图，颜色按 CPA 渐变。

### 完整代码

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>广告投放地域热力图</title>
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.5.2/mapbox-gl.css" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; }
        #map { position: absolute; top: 0; bottom: 0; width: 100%; }
        #legend {
            position: absolute;
            bottom: 30px;
            right: 30px;
            background: rgba(255,255,255,0.9);
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
        }
        .legend-bar {
            width: 200px;
            height: 20px;
            background: linear-gradient(to right, #00ff00, #ffff00, #ff0000);
            border-radius: 3px;
        }
        .legend-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-top: 5px;
        }
        #controls {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255,255,255,0.9);
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
        }
        button {
            margin: 3px;
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background: #4285f4;
            color: white;
        }
        button:hover { background: #3367d6; }
    </style>
</head>
<body>

<div id="map"></div>

<div id="controls">
    <h3>指标切换</h3>
    <button onclick="switchMetric('cpa')">CPA（获客成本）</button>
    <button onclick="switchMetric('conversions')">转化数</button>
    <button onclick="switchMetric('roi')">ROI</button>
    <button onclick="switchMetric('cost')">花费</button>
</div>

<div id="legend">
    <div id="legend-title">CPA（元）</div>
    <div class="legend-bar"></div>
    <div class="legend-labels">
        <span>优秀 (低)</span>
        <span>需优化 (高)</span>
    </div>
</div>

<script src="https://api.mapbox.com/mapbox-gl-js/v3.5.2/mapbox-gl.js"></script>
<script>
// 配置 Token（从环境变量或配置读取）
mapboxgl.accessToken = 'pk.你的Mapbox_Token';

// 投放数据（模拟数据，实际从 CSV/API 获取）
const geoData = [
    { city: '广州', lng: 113.2644, lat: 23.1291, cost: 15200, conversions: 156, cpa: 97.4, roi: 4.5 },
    { city: '深圳', lng: 114.0579, lat: 22.5431, cost: 18500, conversions: 203, cpa: 91.1, roi: 5.2 },
    { city: '杭州', lng: 120.1551, lat: 30.2741, cost: 12800, conversions: 98, cpa: 130.6, roi: 3.1 },
    { city: '武汉', lng: 114.3055, lat: 30.5928, cost: 8200, conversions: 45, cpa: 182.2, roi: 1.8 },
    { city: '成都', lng: 104.0668, lat: 30.5728, cost: 6500, conversions: 28, cpa: 232.1, roi: 1.2 },
    { city: '南京', lng: 118.7969, lat: 32.0603, cost: 9800, conversions: 72, cpa: 136.1, roi: 2.8 },
    { city: '苏州', lng: 120.5853, lat: 31.2989, cost: 7600, conversions: 61, cpa: 124.6, roi: 3.0 },
    { city: '青岛', lng: 120.3826, lat: 36.0671, cost: 5400, conversions: 22, cpa: 245.5, roi: 0.9 }
];

// 当前指标
let currentMetric = 'cpa';
const metricLabels = {
    cpa: 'CPA（元）',
    conversions: '转化数',
    roi: 'ROI',
    cost: '花费（元）'
};

// 计算颜色（绿→黄→红渐变）
function getColor(value, min, max, reverse = false) {
    let ratio = (value - min) / (max - min);
    if (reverse) ratio = 1 - ratio; // CPA 越低越好，反转
    
    if (ratio < 0.5) {
        // 绿到黄
        const g = 255;
        const r = Math.round(ratio * 2 * 255);
        return `rgb(${r}, ${g}, 0)`;
    } else {
        // 黄到红
        const r = 255;
        const g = Math.round((1 - (ratio - 0.5) * 2) * 255);
        return `rgb(${r}, ${g}, 0)`;
    }
}

// 初始化地图
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [113, 28],  // 中国中心
    zoom: 3.5
});

map.on('load', function() {
    addDataLayer();
});

function addDataLayer() {
    // 移除旧图层
    if (map.getSource('geo-points')) {
        map.removeLayer('geo-points');
        map.removeSource('geo-points');
    }
    
    // 计算当前指标范围
    const values = geoData.map(d => d[currentMetric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // CPA 和 cost 越低越好，反转颜色
    const reverse = ['cpa', 'cost'].includes(currentMetric);
    
    // 构建 GeoJSON
    const geojson = {
        type: 'FeatureCollection',
        features: geoData.map(d => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
            properties: {
                city: d.city,
                cost: d.cost,
                conversions: d.conversions,
                cpa: d.cpa,
                roi: d.roi,
                color: getColor(d[currentMetric], min, max, reverse),
                radius: Math.max(15, Math.sqrt(d.cost) / 3)
            }
        }))
    };
    
    // 添加数据源
    map.addSource('geo-points', { type: 'geojson', data: geojson });
    
    // 添加圆形图层
    map.addLayer({
        id: 'geo-points',
        type: 'circle',
        source: 'geo-points',
        paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#333'
        }
    });
    
    // 弹窗
    const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true });
    
    map.on('click', 'geo-points', function(e) {
        const p = e.features[0].properties;
        popup
            .setLngLat(e.features[0].geometry.coordinates.slice())
            .setHTML(`
                <h3>${p.city}</h3>
                <table style="font-size:14px;">
                    <tr><td>花费:</td><td>¥${p.cost.toLocaleString()}</td></tr>
                    <tr><td>转化:</td><td>${p.conversions}</td></tr>
                    <tr><td>CPA:</td><td>¥${p.cpa.toFixed(1)}</td></tr>
                    <tr><td>ROI:</td><td>${p.roi.toFixed(1)}x</td></tr>
                </table>
            `)
            .addTo(map);
    });
    
    // 更新图例标题
    document.getElementById('legend-title').textContent = metricLabels[currentMetric];
}

// 切换指标
function switchMetric(metric) {
    currentMetric = metric;
    addDataLayer();
}
</script>

</body>
</html>
```

### 使用方法

1. 替换 `pk.你的Mapbox_Token` 为你的 Token
2. 将 `geoData` 替换为真实的 Google Ads 数据
3. 保存为 `heatmap.html`，浏览器直接打开

---

## 三、商圈半径分析

### 场景：门店 3km/5km/10km 覆盖范围可视化

```javascript
// 商圈半径分析图层
map.on('load', function() {
    const store = { lng: 113.3245, lat: 23.1066 }; // 珠江新城坐标
    
    // 添加 3 个同心圆
    const radii = [
        { km: 3, color: '#00ff00', opacity: 0.1 },
        { km: 5, color: '#ffff00', opacity: 0.08 },
        { km: 10, color: '#ff0000', opacity: 0.05 }
    ];
    
    radii.forEach((r, i) => {
        const circle = createCircle(store.lng, store.lat, r.km);
        map.addSource(`radius-${i}`, { type: 'geojson', data: circle });
        map.addLayer({
            id: `radius-fill-${i}`,
            type: 'fill',
            source: `radius-${i}`,
            paint: {
                'fill-color': r.color,
                'fill-opacity': r.opacity
            }
        });
        map.addLayer({
            id: `radius-line-${i}`,
            type: 'line',
            source: `radius-${i}`,
            paint: {
                'line-color': r.color,
                'line-width': 2,
                'line-dasharray': [4, 2]
            }
        });
    });
});

// 创建圆形多边形（GeoJSON）
function createCircle(lng, lat, radiusKm, segments = 64) {
    const coords = [];
    const radiusRad = radiusKm / 6378.1; // 地球半径 km
    
    for (let i = 0; i <= segments; i++) {
        const bearing = (i / segments) * 2 * Math.PI;
        const lat2 = Math.asin(
            Math.sin(lat * Math.PI / 180) * Math.cos(radiusRad) +
            Math.cos(lat * Math.PI / 180) * Math.sin(radiusRad) * Math.cos(bearing)
        );
        const lng2 = lng + Math.atan2(
            Math.sin(bearing) * Math.sin(radiusRad) * Math.cos(lat * Math.PI / 180),
            Math.cos(radiusRad) - Math.sin(lat * Math.PI / 180) * Math.sin(lat2)
        ) * 180 / Math.PI;
        
        coords.push([lng2, lat2 * 180 / Math.PI]);
    }
    
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [coords]
        }
    };
}
```

---

## 四、Python 自动化生成地图

### 使用 mapboxgl 库生成热力图

```python
import pandas as pd
from mapboxgl.utils import create_color_stops, create_radius_stops
from mapboxgl.viz import CircleViz

# 1. 读取投放数据
df = pd.read_csv('geo_performance.csv')

# 2. 配置 Token
import os
os.environ['MAPBOX_ACCESS_TOKEN'] = 'pk.你的Token'

# 3. 转换为 GeoJSON 格式
df['lng'] = df['lng'].astype(float)
df['lat'] = df['lat'].astype(float)

# 4. 定义颜色梯度（CPA 越低越绿）
color_stops = create_color_stops(
    [0, 50, 100, 150, 200, 300],
    colors=['#00ff00', '#80ff00', '#ffff00', '#ff8000', '#ff4000', '#ff0000']
)

# 5. 定义半径梯度（花费越多圆越大）
radius_stops = create_radius_stops(
    [0, 5000, 10000, 15000, 20000],
    [10, 15, 20, 25, 30]
)

# 6. 创建可视化
viz = CircleViz(
    data=df.to_dict('records'),
    access_token=os.environ['MAPBOX_ACCESS_TOKEN'],
    color_property='cpa',
    color_stops=color_stops,
    radius_property='cost',
    radius_stops=radius_stops,
    center=[113, 28],
    zoom=3.5,
    below_layer='waterway-label'
)

# 7. 添加弹窗
viz.tooltip = {
    'city': '城市',
    'cost': '花费',
    'conversions': '转化数',
    'cpa': 'CPA',
    'roi': 'ROI'
}

# 8. 生成 HTML
viz.create_html('geo_heatmap.html')
print("热力图已生成: geo_heatmap.html")
```

---

## 五、区域分层可视化

### S/A/B/C/D 级区域标注

```python
import json
from mapboxgl.viz import ChoroplethViz

# 区域分级数据
region_data = [
    {"region": "广州", "tier": "S", "score": 92, "budget_ratio": 0.18},
    {"region": "深圳", "tier": "S", "score": 88, "budget_ratio": 0.16},
    {"region": "杭州", "tier": "A", "score": 72, "budget_ratio": 0.12},
    {"region": "南京", "tier": "A", "score": 68, "budget_ratio": 0.10},
    {"region": "苏州", "tier": "B", "score": 55, "budget_ratio": 0.08},
    {"region": "武汉", "tier": "C", "score": 35, "budget_ratio": 0.05},
    {"region": "成都", "tier": "C", "score": 28, "budget_ratio": 0.03},
    {"region": "青岛", "tier": "D", "score": 15, "budget_ratio": 0.01},
]

# 颜色映射
tier_colors = {
    'S': '#e74c3c',  # 红色 - 最高优先级
    'A': '#e67e22',  # 橙色
    'B': '#f1c40f',  # 黄色
    'C': '#2ecc71',  # 绿色
    'D': '#95a5a6'   # 灰色 - 最低
}

# 生成分级地图
viz = ChoroplethViz(
    data=geojson_data,
    access_token='pk.你的Token',
    color_property='score',
    color_stops=create_color_stops([0, 20, 40, 60, 80, 100], 
        ['#95a5a6', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#c0392b']),
    color_function_type='match',
    center=[113, 28],
    zoom=3.5
)

viz.create_html('tier_map.html')
```

---

## 六、Jekyll 集成方案

### 在知识库中嵌入地图

在文章中使用 Mapbox 时，直接在 Markdown 中嵌入 HTML：

```html
<div id="geo-map" style="width: 100%; height: 500px;"></div>
<script src="https://api.mapbox.com/mapbox-gl-js/v3.5.2/mapbox-gl.js"></script>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.5.2/mapbox-gl.css" rel="stylesheet">
<script>
mapboxgl.accessToken = '你的Token';
const map = new mapboxgl.Map({
    container: 'geo-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [113, 23],
    zoom: 4
});
</script>
```

---

## 相关文档

- [GIS 特色板块]({{ site.baseurl }}/geo/gis-toolkit/)
- [API Key 配置教程]({{ site.baseurl }}/geo/gis-toolkit/api-key-setup/)
- [提示词模板库]({{ site.baseurl }}/geo/gis-toolkit/prompt-templates/)
- [GEO 专属投放优化]({{ site.baseurl }}/geo/geo-ad-optimization/)

---

*最后更新：2026-06-30*
