/* PCFS 存储层（MVP）
 *
 * 约定（隐私红线）：
 *   1. 数据只存在浏览器本地（localStorage），不上传任何服务器；
 *   2. 不进 git 仓库（仓库里只有代码，永远没有数据）；
 *   3. 不推 dataLayer / GA4（金额与个人备注属敏感信息）。
 *
 * 接口按「记录集合」抽象，UI 只依赖这些方法的**语义**。
 * 将来数据量 >2000 条要切 IndexedDB 时：只改本文件内部实现（改为异步），
 * UI 侧在调用处加 await 即可，不动结构。
 */
(function (global) {
  'use strict';

  var KEY = 'pcfs.ledger.v1';

  function read() {
    try {
      var list = JSON.parse(global.localStorage.getItem(KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    global.localStorage.setItem(KEY, JSON.stringify(list));
    return list;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  global.PCFS = {
    KEY: KEY,

    /* 全部记录，按日期倒序 */
    all: function () {
      return read().slice().sort(function (a, b) {
        if (a.date === b.date) return (a.createdAt < b.createdAt ? 1 : -1);
        return a.date < b.date ? 1 : -1;
      });
    },

    /* 新增一条；返回全量 */
    add: function (rec) {
      var list = read();
      rec.id = rec.id || uid();
      rec.createdAt = rec.createdAt || new Date().toISOString();
      list.push(rec);
      return write(list);
    },

    /* 按 id 删除 */
    remove: function (id) {
      return write(read().filter(function (r) { return r.id !== id; }));
    },

    /* 整体替换（导入备份用） */
    replaceAll: function (list) {
      if (!Array.isArray(list)) throw new Error('备份格式不对：应为数组');
      return write(list);
    },

    /* 导出为 JSON 文本 */
    toJSON: function () {
      return JSON.stringify(read(), null, 2);
    },

    /* 从 JSON 文本恢复 */
    fromJSON: function (text) {
      return this.replaceAll(JSON.parse(text));
    }
  };
})(window);
