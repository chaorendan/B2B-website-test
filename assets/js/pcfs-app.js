/* 个人财务工具（自用 MVP）
 * 只做三件事：记一笔 / 看本月汇总 / 导出备份。
 * 数据全部走 PCFS 存储层，不联网、不上传、不推埋点。
 */
(function () {
  'use strict';

  var CATS = ['餐饮', '交通', '居住', '学习', '医疗', '人情', '娱乐', '设备',
              '工资', '副业', '奖学金', '投资', '报销', '其他'];

  var el = {};

  function $(id) { return document.getElementById(id); }

  function money(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (day.length < 2 ? '0' + day : day);
  }

  function thisMonth() {
    return today().slice(0, 7);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render() {
    var rows = window.PCFS.all();
    var month = thisMonth();
    var income = 0, expense = 0;

    rows.forEach(function (r) {
      var amount = Number(r.amount) || 0;
      if (r.date.slice(0, 7) !== month) return;
      if (r.type === 'income') income += amount; else expense += amount;
    });

    el.sumIncome.textContent = money(income);
    el.sumExpense.textContent = money(expense);
    el.sumBalance.textContent = money(income - expense);

    var has = rows.length > 0;
    el.empty.hidden = has;
    el.count.textContent = rows.length;

    el.list.innerHTML = rows.slice(0, 100).map(function (r) {
      var amount = Number(r.amount) || 0;
      var sign = r.type === 'income' ? '+' : '−';
      return '<li class="pcfs-row">' +
        '<span class="pcfs-row__date">' + esc(r.date) + '</span>' +
        '<span class="pcfs-row__cat">' + esc(r.category || '未分类') + '</span>' +
        '<span class="pcfs-row__note">' + esc(r.note || '') + '</span>' +
        '<span class="pcfs-row__amount pcfs-row__amount--' + (r.type === 'income' ? 'in' : 'out') + '">' +
          sign + money(amount) + '</span>' +
        '<button class="pcfs-del" type="button" data-id="' + r.id + '" aria-label="删除这条记录">删除</button>' +
      '</li>';
    }).join('');
  }

  function submit(e) {
    e.preventDefault();
    var amount = parseFloat(el.amount.value);
    if (!amount || amount <= 0) {
      el.amount.focus();
      return;
    }
    window.PCFS.add({
      date: el.date.value || today(),
      type: el.type.value,
      amount: amount,
      category: el.category.value.trim(),
      note: el.note.value.trim()
    });
    el.amount.value = '';
    el.note.value = '';
    el.category.value = '';
    render();
    el.amount.focus();
  }

  function remove(e) {
    var id = e.target && e.target.getAttribute && e.target.getAttribute('data-id');
    if (!id) return;
    if (!window.confirm('删除这条记录？删掉就找不回来了。')) return;
    window.PCFS.remove(id);
    render();
  }

  function exportJSON() {
    var blob = new Blob([window.PCFS.toJSON()], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pcfs-backup-' + today() + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var list = JSON.parse(reader.result);
        if (!window.confirm('导入会替换现在的 ' + window.PCFS.all().length + ' 条记录，继续？')) return;
        window.PCFS.replaceAll(list);
        render();
      } catch (err) {
        window.alert('这个文件读不出来，确认是本工具导出的备份。');
      }
    };
    reader.readAsText(file);
  }

  function init() {
    el.list = $('pcfs-list');
    el.empty = $('pcfs-empty');
    el.count = $('pcfs-count');
    el.date = $('pcfs-date');
    el.type = $('pcfs-type');
    el.amount = $('pcfs-amount');
    el.category = $('pcfs-category');
    el.note = $('pcfs-note');
    el.sumIncome = $('pcfs-sum-income');
    el.sumExpense = $('pcfs-sum-expense');
    el.sumBalance = $('pcfs-sum-balance');

    if (!el.list || !window.PCFS) return;

    var dl = $('pcfs-cats');
    if (dl) {
      dl.innerHTML = CATS.map(function (c) { return '<option value="' + c + '"></option>'; }).join('');
    }

    el.date.value = today();
    $('pcfs-form').addEventListener('submit', submit);
    el.list.addEventListener('click', remove);
    $('pcfs-export').addEventListener('click', exportJSON);
    $('pcfs-import').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
      e.target.value = '';
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
