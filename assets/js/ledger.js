/* 个人资本「统一账本」层（v2）
 *
 * 把两本账组装成一个 JSON 备份：
 *   金钱资本（PCFS）   → localStorage 键 pcfs.ledger.v1      （数组）
 *   注意力资本（Attention）→ attention.{plans,reviews,accounts}.v1（对象）
 *
 * 为什么这里直接读写 localStorage，而不是调用对方的 store 对象：
 *   两个工具是**两个不同页面**，对方的脚本不会在自己页面上加载——
 *   在 /tools/attention/ 里 window.PCFS 恒为 undefined，
 *   「导出统一备份」在过去因此从未真正带上 money。
 *   localStorage 同源共享，是唯一可靠的跨页数据通道。
 *
 * 隐私红线：本文件不联网、不上传、不推 dataLayer；备份文件去向由用户自己决定。
 */
(function (global) {
  'use strict';

  var K_MONEY    = 'pcfs.ledger.v1';
  var K_PLANS    = 'attention.plans.v1';
  var K_REVIEWS  = 'attention.reviews.v1';
  var K_ACCOUNTS = 'attention.accounts.v1';

  function readKey(key, fallback) {
    try {
      var v = JSON.parse(global.localStorage.getItem(key) || 'null');
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function writeKey(key, value) {
    global.localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  var Ledger = {
    VERSION: 2,
    KEYS: { money: K_MONEY, plans: K_PLANS, reviews: K_REVIEWS, accounts: K_ACCOUNTS },

    /* ---- 单本账读取 ---- */
    money:    function () { return readKey(K_MONEY, []); },
    plans:    function () { return readKey(K_PLANS, {}); },
    reviews:  function () { return readKey(K_REVIEWS, {}); },
    accounts: function () { return readKey(K_ACCOUNTS, {}); },

    /* 金钱流水条数（用于「有无数据」判断，不泄露内容） */
    moneyCount: function () {
      var m = this.money();
      return Array.isArray(m) ? m.length : 0;
    },
    attentionCount: function () {
      return Object.keys(this.plans()).length + Object.keys(this.reviews()).length;
    },

    /* ---- 组装：只写入真正有数据的账本，避免备份里塞空壳 ---- */
    build: function () {
      var out = {
        exportedAt: new Date().toISOString(),
        app: 'chaorendan-personal-ledger',
        version: this.VERSION
      };

      var money = this.money();
      if (Array.isArray(money) && money.length) out.money = money;

      var plans = this.plans(), reviews = this.reviews(), accounts = this.accounts();
      if (Object.keys(plans).length || Object.keys(reviews).length) {
        out.attention = { plans: plans, reviews: reviews, accounts: accounts };
      }
      return out;
    },

    toJSON: function () { return JSON.stringify(this.build(), null, 2); },

    /* ---- 还原：兼容三种历史格式 ---- */
    /*   1) v2 统一账本（money + attention）
     *   2) 旧 PCFS 备份（纯数组，只有金钱）
     *   3) 旧 attention 备份（只有 attention 对象）
     */
    restore: function (text) {
      var data = JSON.parse(text);
      var done = { money: false, attention: false };

      if (Array.isArray(data)) {                      // 旧 PCFS 数组备份
        writeKey(K_MONEY, data);
        done.money = true;
        return done;
      }

      var money = data.money;
      if (money) {
        var list = Array.isArray(money) ? money : money.list;
        if (Array.isArray(list)) { writeKey(K_MONEY, list); done.money = true; }
      }

      var a = data.attention ||
              ((data.plans || data.reviews || data.accounts) ? data : null);
      if (a) {
        if (a.plans)    writeKey(K_PLANS, a.plans);
        if (a.reviews)  writeKey(K_REVIEWS, a.reviews);
        if (a.accounts) writeKey(K_ACCOUNTS, a.accounts);
        done.attention = true;
      }
      return done;
    }
  };

  global.Ledger = Ledger;
})(window);
