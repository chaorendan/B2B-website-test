/* 注意力资本账本 · 存储层
 *
 * 与 PCFS 同构：本地优先、零后端、可整体导出。
 * 三个集合：plans（按日期）、reviews（按日期）、accounts（复利账户累计）。
 *
 * 隐私红线：不联网、不上传、不推 dataLayer。导出内容由用户自己决定去向。
 */
(function (global) {
  'use strict';

  var M = global.AttentionModel;
  var K = M.STORE_KEYS;

  function read(key, fallback) {
    try {
      var v = JSON.parse(global.localStorage.getItem(key) || 'null');
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    global.localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  var Store = {
    /* ---- 计划 ---- */
    allPlans: function () { return read(K.plans, {}); },
    getPlan: function (date) {
      var p = this.allPlans()[date];
      return p || M.createPlan(date);
    },
    savePlan: function (plan) {
      var all = this.allPlans();
      all[plan.date] = plan;
      return write(K.plans, all);
    },

    /* ---- 复盘 ---- */
    allReviews: function () { return read(K.reviews, {}); },
    getReview: function (date) {
      var r = this.allReviews()[date];
      return r || M.createReview(date);
    },
    saveReview: function (review) {
      var all = this.allReviews();
      all[review.date] = review;
      return write(K.reviews, all);
    },

    /* ---- 复利账户（日结时累加） ---- */
    accounts: function () {
      var acc = read(K.accounts, {});
      M.COMPOUND_ACCOUNTS.forEach(function (a) {
        if (typeof acc[a.key] !== 'number') acc[a.key] = 0;
      });
      return acc;
    },
    compound: function (acm) {
      var acc = this.accounts();
      M.COMPOUND_ACCOUNTS.forEach(function (a) {
        a.from.forEach(function (src) {
          acc[a.key] += (Number(acm[src]) || 0);
        });
      });
      return write(K.accounts, acc);
    },

    /* 清算日结：复利账户**只累加一次**（错账不可逆，防重下沉到存储层） */
    settle: function (date) {
      var r = this.getReview(date);
      if (r.settled) return r;
      this.compound(r.acm);
      r.settled = true;
      return this.saveReview(r);
    },

    /* ---- 导出 ---- */

    /* 统一备份：金钱 + 注意力两本账
     * 委托给 Ledger（直读 localStorage，跨页可靠）；
     * Ledger 未加载时退回只导注意力账（不静默丢数据，但会少 money）。 */
    exportJSON: function () {
      if (global.Ledger && typeof global.Ledger.toJSON === 'function') {
        return global.Ledger.toJSON();
      }
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        app: 'chaorendan-personal-ledger',
        attention: {
          plans: this.allPlans(),
          reviews: this.allReviews(),
          accounts: this.accounts()
        }
      }, null, 2);
    },

    /* 复盘心得（脱敏 Markdown）：只含文字，不含股数与打分明细 */
    exportMarkdown: function (date) {
      var r = this.getReview(date);
      var lines = [];
      lines.push('## ' + date + ' · 每日复盘');
      lines.push('');
      lines.push('### 三问');
      lines.push('');
      lines.push('- 和我作为个体有什么吊关系？（内部-现在）');
      lines.push('  ' + (r.threeQs.self || '（未填）'));
      lines.push('- 和社会现实有什么关系？（外部-过往）');
      lines.push('  ' + (r.threeQs.society || '（未填）'));
      lines.push('- 和实际利益增长有什么吊关系？（外部-未来）');
      lines.push('  ' + (r.threeQs.interest || '（未填）'));
      lines.push('');
      lines.push('### 反思');
      lines.push('');
      if (r.reflection.focus)   { lines.push('**专注比**：' + r.reflection.focus); lines.push(''); }
      if (r.reflection.task)    { lines.push('**任务完成**：' + r.reflection.task); lines.push(''); }
      if (r.reflection.overall) { lines.push('**整体性**：' + r.reflection.overall); lines.push(''); }
      lines.push('### 明日方向');
      lines.push('');
      lines.push(r.improvement || '（未填）');
      lines.push('');
      lines.push('> 综合得分：' + M.weightedScore(r.scores) + ' / 100');
      return lines.join('\n');
    },

    /* 还原备份：统一账本（两本账）或旧格式（任一单本账）都吃 */
    importJSON: function (text) {
      if (global.Ledger && typeof global.Ledger.restore === 'function') {
        global.Ledger.restore(text);
        return true;
      }
      var data = JSON.parse(text);
      var a = data.attention || data;
      if (a.plans)    write(K.plans, a.plans);
      if (a.reviews)  write(K.reviews, a.reviews);
      if (a.accounts) write(K.accounts, a.accounts);
      return true;
    }
  };

  global.AttentionStore = Store;
})(window);
