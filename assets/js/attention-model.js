/* 注意力资本账本 · 数据模型（框架无关）
 *
 * 与 PCFS（金钱资本账本）同构：
 *   金钱：期初余额 → 流水（收入/支出）→ 月结余 → 储蓄率
 *   注意：期初股本 → 流水（任务实际用时）→ 日结 → 建设型持仓比率
 *
 * 隐私：本模块不联网、不上传、不推 dataLayer；数据只存本地。
 */

(function (global) {
  'use strict';

  var DAY_CAPITAL = 960;              // 16h × 60min，午夜清零
  var DRAIN_ALERT = 0.6;              // 消耗型占比红线 60%

  /* 任务分类：仓位语言 */
  var CATEGORIES = [
    { key: 'heavy',     label: '重仓', desc: '技能精进 / 主业',       side: 'build' },
    { key: 'dca',       label: '定投', desc: '认知 / 运动 / 关系',     side: 'build' },
    { key: 'idle',      label: '配置', desc: '无聊空转',              side: 'drain' },
    { key: 'forbidden', label: '禁止', desc: '信息流 / 廉价情绪消费',  side: 'drain' }
  ];

  /* ACM 注意力审计科目 */
  var ACM_ITEMS = [
    { key: 'skill',     label: '技能精进',     side: 'build' },
    { key: 'cognition', label: '认知升级',     side: 'build' },
    { key: 'relation',  label: '关系建设',     side: 'build' },
    { key: 'body',      label: '体能储备',     side: 'build' },
    { key: 'idle',      label: '无聊空转',     side: 'drain' },
    { key: 'feed',      label: '信息流黑洞',   side: 'drain' },
    { key: 'emotion',   label: '廉价情绪消费', side: 'drain' },
    { key: 'social',    label: '无目的社交',   side: 'drain' },
    { key: 'fake',      label: '伪建设伪装',   side: 'drain' }
  ];

  var ROI_LEVELS = [
    { key: 'high', label: '高' },
    { key: 'mid',  label: '中' },
    { key: 'low',  label: '低' },
    { key: 'neg',  label: '负' },
    { key: 'na',   label: '不可量化' }
  ];

  /* 五维打分 */
  var SCORE_DIMS = [
    { key: 'method',   label: '方法习惯' },
    { key: 'attitude', label: '学习态度' },
    { key: 'focus',    label: '专注高效' },
    { key: 'mastery',  label: '知识掌握' },
    { key: 'time',     label: '时间管理' }
  ];

  /* 复利账户（跨天累计） */
  var COMPOUND_ACCOUNTS = [
    { key: 'skill',       label: '技能精进', from: ['skill'] },
    { key: 'cognition',   label: '认知升级', from: ['cognition'] },
    { key: 'health',      label: '健康',     from: ['body'] },
    { key: 'relation',    label: '关系',     from: ['relation'] },
    { key: 'creativity',  label: '创意',     from: ['skill', 'cognition'] }
  ];

  var STORE_KEYS = {
    plans:   'attention.plans.v1',
    reviews: 'attention.reviews.v1',
    accounts:'attention.accounts.v1'
  };

  function buildKeys() {
    return ACM_ITEMS.filter(function (i) { return i.side === 'build'; })
                    .map(function (i) { return i.key; });
  }
  function drainKeys() {
    return ACM_ITEMS.filter(function (i) { return i.side === 'drain'; })
                    .map(function (i) { return i.key; });
  }

  function emptyACM() {
    var o = {};
    ACM_ITEMS.forEach(function (i) { o[i.key] = 0; });
    return o;
  }

  function createTask(fields) {
    return {
      id: (fields && fields.id) || ('t' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
      content: (fields && fields.content) || '',
      category: (fields && fields.category) || 'heavy',
      estMin: Number((fields && fields.estMin) || 0),
      actMin: Number((fields && fields.actMin) || 0),
      roi: (fields && fields.roi) || 'mid',
      block: (fields && fields.block) || '',
      done: !!(fields && fields.done),
      futures: (fields && fields.futures) || ''      // 关联的知识期货项目（与 PCFS 打通的关键字段）
    };
  }

  function createPlan(date) {
    return { date: date, capital: DAY_CAPITAL, tasks: [], boringBlocks: [] };
  }

  function createReview(date) {
    return {
      date: date,
      threeQs: { self: '', society: '', interest: '' },
      acm: emptyACM(),
      reflection: { focus: '', task: '', overall: '' },
      scores: { method: 0, attitude: 0, focus: 0, mastery: 0, time: 0 },
      improvement: '',
      settled: false
    };
  }

  /* 股本分配：已排时间块的预计用时之和 */
  function allocated(plan) {
    return (plan.tasks || []).reduce(function (s, t) { return s + (Number(t.estMin) || 0); }, 0);
  }
  function remaining(plan) {
    return (plan.capital || DAY_CAPITAL) - allocated(plan);
  }
  function overspent(plan) {
    return allocated(plan) > (plan.capital || DAY_CAPITAL);
  }

  /* ACM 审计计算 */
  function audit(acm) {
    var a = acm || emptyACM();
    var build = buildKeys().reduce(function (s, k) { return s + (Number(a[k]) || 0); }, 0);
    var drain = drainKeys().reduce(function (s, k) { return s + (Number(a[k]) || 0); }, 0);
    var total = build + drain;
    return {
      build: build,
      drain: drain,
      total: total,
      buildRatio: build / DAY_CAPITAL,
      drainRatio: drain / DAY_CAPITAL,
      unaccounted: DAY_CAPITAL - total,
      alert: total > 0 && (drain / DAY_CAPITAL) > DRAIN_ALERT
    };
  }

  /* 五维加权总分（各占 20%） */
  function weightedScore(scores) {
    var s = scores || {};
    var sum = SCORE_DIMS.reduce(function (acc, d) { return acc + (Number(s[d.key]) || 0); }, 0);
    return Math.round((sum / SCORE_DIMS.length) * 100) / 100;
  }

  global.AttentionModel = {
    DAY_CAPITAL: DAY_CAPITAL,
    DRAIN_ALERT: DRAIN_ALERT,
    CATEGORIES: CATEGORIES,
    ACM_ITEMS: ACM_ITEMS,
    ROI_LEVELS: ROI_LEVELS,
    SCORE_DIMS: SCORE_DIMS,
    COMPOUND_ACCOUNTS: COMPOUND_ACCOUNTS,
    STORE_KEYS: STORE_KEYS,
    emptyACM: emptyACM,
    createTask: createTask,
    createPlan: createPlan,
    createReview: createReview,
    allocated: allocated,
    remaining: remaining,
    overspent: overspent,
    audit: audit,
    weightedScore: weightedScore
  };
})(window);
