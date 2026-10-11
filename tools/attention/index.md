---
layout: page
title: "注意力资本"
permalink: /tools/attention/
description: "把一天 960 股注意力当资本来配置的 CEO 驾驶舱：晨会排仓、执行追踪、日结复盘。数据只存在你的浏览器里。"
lang: "zh"
css: "/assets/css/attention.css"
noindex: true
sitemap: false
---

每天醒来注资 **960 股**（16 小时 × 60 分钟），午夜清零。你的工作不是「把事做完」，是**最大化长期人生 ROI**——把时间换成建设型资产。

数据只存在这台设备的浏览器里：不上传、不联网、不进统计。换设备前记得导出备份。

<div class="att">
  <div class="att-top">
    <input type="date" id="att-date" aria-label="日期">
    <div class="att-tabs" id="att-tabs" role="tablist">
      <button class="att-tab" type="button" data-view="plan" role="tab">晨会</button>
      <button class="att-tab" type="button" data-view="exec" role="tab">执行</button>
      <button class="att-tab" type="button" data-view="review" role="tab">复盘</button>
    </div>
  </div>

  <div class="att-cap">
    <span class="att-cap__label">可用股本</span>
    <span class="att-cap__num att-cap__num--remain" id="att-cap-remain">960</span>
    <span class="att-cap__label">股 · 已配置 <b id="att-cap-used">0</b> 股</span>
    <div class="att-bar"><div class="att-bar__fill" id="att-bar-fill"></div></div>
    <p class="att-warn" id="att-cap-warn" hidden></p>
  </div>

  <div data-panel="plan">
    <form class="att-form" id="att-task-form" autocomplete="off">
      <input type="text" id="t-content" placeholder="任务：今天必须推进什么" aria-label="任务内容" required>
      <select id="t-category" aria-label="仓位分类"></select>
      <input type="number" id="t-est" placeholder="股数" min="5" step="5" aria-label="预计用时（股）">
      <select id="t-roi" aria-label="预期 ROI"></select>
      <input type="text" id="t-block" placeholder="08:00-11:30" aria-label="时间块">
      <button class="att-form__submit" type="submit">排进今天</button>
    </form>
    <p class="att-hint">物理隔离：设置无聊时间区块（不可编辑），包括早晨散步、午休静坐、睡前无屏幕。这不是浪费，是给注意力留出清算的内存。</p>
    <ul class="att-list" id="att-plan-tasks"></ul>
  </div>

  <div data-panel="exec" hidden>
    <p class="att-sec">执行 · 预计 vs 实际</p>
    <ul class="att-list" id="att-exec-tasks"></ul>
    <p class="att-stat" id="att-exec-stat"></p>
  </div>

  <div data-panel="review" hidden>
    <div class="att-blue">
      <h3>每日必答 · 三问</h3>
      <p>空着不能清算。</p>
      <div class="att-q">
        <label for="q-self">和我作为个体有什么吊关系？（内部-现在）</label>
        <textarea id="q-self" placeholder="一个是没有改善和延长生命自身。"></textarea>
      </div>
      <div class="att-q">
        <label for="q-society">和社会现实有什么关系？（外部-过往）</label>
        <textarea id="q-society" placeholder="一个是没有留下足供自己咀嚼、回味、探索的回忆。"></textarea>
      </div>
      <div class="att-q">
        <label for="q-interest">和实际利益增长有什么吊关系？（外部-未来）</label>
        <textarea id="q-interest" placeholder="一个是没有留下可供他人运用的贡献和遗产。"></textarea>
      </div>
    </div>

    <p class="att-sec">模块 B · ACM 注意力审计表（做账）</p>
    <div class="att-acm" id="att-acm"></div>
    <div class="att-kpi">
      <span>建设型持仓 <b class="is-build" id="att-build-ratio">0.0%</b></span>
      <span>消耗型 <b class="is-drain" id="att-drain-ratio">0.0%</b></span>
      <span>未记账 <b id="att-unaccounted">960 股</b></span>
      <span id="att-acm-sum"></span>
    </div>
    <p class="att-alert" id="att-alert" hidden>触发经营危机警报！消耗型占比已超 60%——今天你在给别人打工，不是在建设自己。</p>

    <p class="att-sec">模块 C · 结构化反思</p>
    <label class="att-label" for="r-focus">专注比反思：今天做到高效了吗？做对了什么，或者哪几个时间块没做好？</label>
    <textarea class="att-ta" id="r-focus"></textarea>
    <label class="att-label" for="r-task">任务完成情况：是否贯彻二八定律？实际与预估是否匹配？没完成的删除还是顺延？</label>
    <textarea class="att-ta" id="r-task"></textarea>
    <label class="att-label" for="r-overall">整体性分析：是否主动进攻了最重要的事？如果重来一次怎么安排？</label>
    <textarea class="att-ta" id="r-overall"></textarea>

    <p class="att-sec">模块 D · 客观评价与改良</p>
    <div class="att-scores" id="att-scores"></div>
    <div class="att-kpi">
      <span>加权总分 <b id="att-score-total">0.0</b> / 100</span>
      <span id="att-score-verdict"></span>
    </div>
    <label class="att-label" for="att-improvement">改良分析 · 明天的进步方向与提升策略</label>
    <textarea class="att-ta" id="att-improvement"></textarea>

    <div class="att-actions">
      <button class="att-btn att-btn--primary" type="button" id="att-settle">清算日结</button>
      <button class="att-btn" type="button" id="att-export-md">导出复盘（Markdown）</button>
      <button class="att-btn" type="button" id="att-export-json">导出备份（JSON）</button>
      <label class="att-import">导入备份<input type="file" id="att-import" accept="application/json,.json"></label>
    </div>

    <div class="att-layer" id="att-settle-layer" hidden>
      <div class="att-layer__box">
        <p>今日 960 股已清零，不可焦虑，明日将重新注资。</p>
        <p class="muted" id="att-settle-date"></p>
        <button class="att-btn" type="button" id="att-settle-close">收下，明天继续</button>
      </div>
    </div>
  </div>
</div>

## 规则

- **仓位语言**：重仓＝技能精进／主业；定投＝认知／运动／关系；配置＝无聊空转；禁止＝信息流／廉价情绪消费。
- **红线**：消耗型（无聊空转、信息流黑洞、廉价情绪消费、无目的社交、伪建设伪装）合计超过 60% 即触发经营危机警报。
- **清算**：三问答完才能清算。清算后股本清零，复利账户（技能／认知／健康／关系／创意）累计记账，不再回撤。

## 数据在哪

| 层 | 位置 | 说明 |
|---|---|---|
| 快取 | 浏览器本地存储 | 随手记，不联网 |
| 真相 | 导出的 JSON 备份 | 建议存进网盘，这是数据所有权所在 |
| 仓库 | 无 | 只有代码，没有你的任何记录 |

「导出复盘（Markdown）」只输出文字部分（三问、反思、明日方向、总分），**不含股数与打分明细**——想公开什么，你自己决定。

<script src="/assets/js/attention-model.js"></script>
<script src="/assets/js/attention-store.js"></script>
<script src="/assets/js/attention-app.js"></script>
