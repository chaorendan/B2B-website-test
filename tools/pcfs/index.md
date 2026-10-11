---
layout: page
title: "财务工具"
permalink: /tools/pcfs/
description: "把个人当一家公司记账的自用工具：记一笔、看本月汇总、导出备份。数据只存在你的浏览器里，不上传、不联网。"
seo_title: "个人财务工具（自用 MVP） | 超人蛋 · 彭俊超"
lang: "zh"
css: "/assets/css/pcfs.css"
---

把个人当成一家一人公司来记账。**数据只存在你这台设备的浏览器里**——不上传、不联网、不进仓库、也不进统计。换设备或清缓存之前，先导出一次备份。

<div class="pcfs">
  <div class="pcfs-sum">
    <div class="pcfs-sum__cell">
      <span class="pcfs-sum__label">本月收入</span>
      <span class="pcfs-sum__value pcfs-sum__value--in" id="pcfs-sum-income">0.00</span>
    </div>
    <div class="pcfs-sum__cell">
      <span class="pcfs-sum__label">本月支出</span>
      <span class="pcfs-sum__value pcfs-sum__value--out" id="pcfs-sum-expense">0.00</span>
    </div>
    <div class="pcfs-sum__cell">
      <span class="pcfs-sum__label">本月结余</span>
      <span class="pcfs-sum__value" id="pcfs-sum-balance">0.00</span>
    </div>
  </div>

  <form class="pcfs-form" id="pcfs-form" autocomplete="off">
    <input type="date" id="pcfs-date" aria-label="日期" required>
    <select id="pcfs-type" aria-label="类型">
      <option value="expense">支出</option>
      <option value="income">收入</option>
    </select>
    <input type="number" id="pcfs-amount" placeholder="金额" step="0.01" min="0.01" aria-label="金额" required>
    <input type="text" id="pcfs-category" list="pcfs-cats" placeholder="分类，如 餐饮" aria-label="分类">
  </form>
  <div class="pcfs-row2">
    <input type="text" id="pcfs-note" placeholder="备注（可留空）" aria-label="备注">
    <button class="pcfs-submit" type="submit" form="pcfs-form">记一笔</button>
  </div>
  <datalist id="pcfs-cats"></datalist>

  <div class="pcfs-toolbar">
    <button class="pcfs-btn" type="button" id="pcfs-export">导出备份</button>
    <label class="pcfs-import-label">导入备份<input type="file" id="pcfs-import" accept="application/json,.json"></label>
    <span class="pcfs-count">共 <span id="pcfs-count">0</span> 条</span>
  </div>

  <ul class="pcfs-list" id="pcfs-list"></ul>
  <p class="pcfs-empty" id="pcfs-empty" hidden>还没有记录。上面记第一笔。</p>
</div>

## 数据在哪，怎么保住

| 层 | 位置 | 说明 |
|---|---|---|
| 快取 | 浏览器本地存储 | 记一笔不用授权，秒开 |
| 真相 | 你导出的 JSON 文件 | 建议存进 OneDrive / 网盘，这是数据所有权所在 |
| 仓库 | 无 | 仓库里只有代码，**永远没有你的数据** |

清浏览器数据、换浏览器、换设备都会让本地记录消失——所以「导出备份」是这个工具唯一的保险。

## 现在能做什么，不做什么

**能做**：记一笔（日期 / 收支 / 金额 / 分类 / 备注）、删除记错的、看本月收入支出结余、导出与导入备份。

**明确不做**：三大报表、图表、多账户、多币种、预算规则、登录和云同步。分类是自由文本 + 建议，不用先配置——想写什么分类直接写。

<script src="/assets/js/pcfs-store.js"></script>
<script src="/assets/js/pcfs-app.js"></script>
