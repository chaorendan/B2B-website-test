/* 注意力资本 · CEO 驾驶舱（晨会 / 执行 / 复盘）
 * 依赖：attention-model.js（模型与计算）、attention-store.js（本地存储）
 * 不联网、不上传、不推埋点。
 */
(function () {
  'use strict';

  var M = window.AttentionModel;
  var S = window.AttentionStore;
  var el = {};
  var date = '';

  function $(id) { return document.getElementById(id); }

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1), day = String(d.getDate());
    return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (day.length < 2 ? '0' + day : day);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function catLabel(key) {
    var c = M.CATEGORIES.filter(function (x) { return x.key === key; })[0];
    return c ? c.label : key;
  }

  function roiLabel(key) {
    var r = M.ROI_LEVELS.filter(function (x) { return x.key === key; })[0];
    return r ? r.label : key;
  }

  /* ---------- 视图切换 ---------- */
  var currentView = 'plan';

  function setView(name) {
    currentView = name;
    ['plan', 'exec', 'review', 'board'].forEach(function (v) {
      var sec = document.querySelector('[data-panel="' + v + '"]');
      var tab = document.querySelector('[data-view="' + v + '"]');
      if (sec) sec.hidden = (v !== name);
      if (tab) tab.setAttribute('aria-selected', v === name ? 'true' : 'false');
    });
    if (name === 'review') { syncACMInputs(); syncScoreInputs(); renderAudit(); renderScore(); }
    if (name === 'board' && window.AttentionBoard) window.AttentionBoard.render(date);
  }

  /* ---------- 股本条 ---------- */
  function renderCapital() {
    var plan = S.getPlan(date);
    var used = M.allocated(plan);
    var remain = M.remaining(plan);
    var pct = Math.min(100, Math.round(used / plan.capital * 100));
    el.capUsed.textContent = used;
    el.capRemain.textContent = remain;
    el.barFill.style.width = pct + '%';
    var over = M.overspent(plan);
    el.barFill.className = 'att-bar__fill' + (over ? ' att-bar__fill--over' : '');
    el.capWarn.hidden = !over;
    if (over) el.capWarn.textContent = '超额配置 ' + (-remain) + ' 股 —— 今天的时间已经透支，砍掉低 ROI 任务。';
  }

  /* ---------- 晨会：任务 ---------- */
  function renderPlanTasks() {
    var plan = S.getPlan(date);
    el.planTasks.innerHTML = plan.tasks.map(function (t) {
      return '<li class="att-task">' +
        '<span class="att-task__cat att-task__cat--' + t.category + '">' + esc(catLabel(t.category)) + '</span>' +
        '<span class="att-task__body">' + esc(t.content) + '</span>' +
        '<span class="att-task__meta">' + esc(t.block || '未排块') + ' · ' + t.estMin + ' 股 · ROI ' + esc(roiLabel(t.roi)) + '</span>' +
        '<button class="att-task__del" data-id="' + t.id + '" type="button" aria-label="删除任务">删除</button>' +
      '</li>';
    }).join('') || '<li class="att-empty">今天还没有排任务。先在上面开晨会。</li>';
  }

  function addTask(e) {
    e.preventDefault();
    var content = el.tContent.value.trim();
    if (!content) { el.tContent.focus(); return; }
    var plan = S.getPlan(date);
    plan.tasks.push(M.createTask({
      content: content,
      category: el.tCategory.value,
      estMin: parseFloat(el.tEst.value) || 0,
      roi: el.tRoi.value,
      block: el.tBlock.value.trim()
    }));
    S.savePlan(plan);
    el.tContent.value = '';
    el.tEst.value = '';
    el.tBlock.value = '';
    renderCapital();
    renderPlanTasks();
    renderExecTasks();
    el.tContent.focus();
  }

  function delTask(e) {
    var id = e.target.getAttribute && e.target.getAttribute('data-id');
    if (!id) return;
    var plan = S.getPlan(date);
    plan.tasks = plan.tasks.filter(function (t) { return t.id !== id; });
    S.savePlan(plan);
    renderCapital();
    renderPlanTasks();
    renderExecTasks();
  }

  /* ---------- 执行：勾选与实耗 ---------- */
  function renderExecTasks() {
    var plan = S.getPlan(date);
    var done = 0;
    el.execTasks.innerHTML = plan.tasks.map(function (t) {
      if (t.done) done++;
      return '<li class="att-task att-task--exec' + (t.done ? ' is-done' : '') + '">' +
        '<label class="att-check"><input type="checkbox" data-id="' + t.id + '" data-act="done"' + (t.done ? ' checked' : '') + '> 完成</label>' +
        '<span class="att-task__body">' + esc(t.content) + '</span>' +
        '<span class="att-task__meta">预计 ' + t.estMin + ' 股</span>' +
        '<input class="att-act" type="number" min="0" step="5" placeholder="实际" value="' + (t.actMin || '') + '" data-id="' + t.id + '" data-act="act" aria-label="实际用时（股）">' +
      '</li>';
    }).join('') || '<li class="att-empty">没有任务。回晨会排一下今天。</li>';
    el.execStat.textContent = done + ' / ' + plan.tasks.length + ' 已完成';
  }

  function execChange(e) {
    var id = e.target.getAttribute('data-id');
    var act = e.target.getAttribute('data-act');
    if (!id || !act) return;
    var plan = S.getPlan(date);
    plan.tasks.forEach(function (t) {
      if (t.id !== id) return;
      if (act === 'done') t.done = e.target.checked;
      if (act === 'act') t.actMin = parseFloat(e.target.value) || 0;
    });
    S.savePlan(plan);
    if (act === 'done') renderExecTasks();
  }

  /* ---------- 复盘：ACM 审计表 ---------- */
  function buildACMInputs() {
    el.acm.innerHTML = M.ACM_ITEMS.map(function (i) {
      return '<div class="att-acm__row att-acm__row--' + i.side + '">' +
        '<label for="acm-' + i.key + '">' + esc(i.label) + '</label>' +
        '<input id="acm-' + i.key + '" type="number" min="0" max="960" step="10" value="0" data-acm="' + i.key + '" aria-label="' + esc(i.label) + ' 股数">' +
        '<span class="att-acm__side">' + (i.side === 'build' ? '建设' : '消耗') + '</span>' +
      '</div>';
    }).join('');
    el.acm.addEventListener('input', function () { collectACM(); renderAudit(); });
  }

  function collectACM() {
    var review = S.getReview(date);
    M.ACM_ITEMS.forEach(function (i) {
      var input = $('acm-' + i.key);
      review.acm[i.key] = parseFloat(input.value) || 0;
    });
    S.saveReview(review);
  }

  function syncACMInputs() {
    var review = S.getReview(date);
    M.ACM_ITEMS.forEach(function (i) {
      var input = $('acm-' + i.key);
      if (input) input.value = review.acm[i.key] || 0;
    });
  }

  function renderAudit() {
    var review = S.getReview(date);
    var a = M.audit(review.acm);
    el.buildRatio.textContent = (a.buildRatio * 100).toFixed(1) + '%';
    el.drainRatio.textContent = (a.drainRatio * 100).toFixed(1) + '%';
    el.unaccounted.textContent = a.unaccounted + ' 股';
    el.alert.hidden = !a.alert;
    el.acmSum.textContent = a.build + ' 建设 / ' + a.drain + ' 消耗';
  }

  /* ---------- 复盘：五维打分 ---------- */
  function buildScoreInputs() {
    el.scores.innerHTML = M.SCORE_DIMS.map(function (d) {
      return '<div class="att-score__row">' +
        '<label for="sc-' + d.key + '">' + esc(d.label) + '</label>' +
        '<input id="sc-' + d.key + '" type="range" min="0" max="100" step="5" value="0" data-score="' + d.key + '" aria-label="' + esc(d.label) + ' 评分">' +
        '<output id="out-' + d.key + '">0</output>' +
      '</div>';
    }).join('');
    el.scores.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-score');
      if (k) $('out-' + k).textContent = e.target.value;
      collectScores();
      renderScore();
    });
  }

  function collectScores() {
    var review = S.getReview(date);
    M.SCORE_DIMS.forEach(function (d) {
      var input = $('sc-' + d.key);
      review.scores[d.key] = parseFloat(input.value) || 0;
    });
    S.saveReview(review);
  }

  function syncScoreInputs() {
    var review = S.getReview(date);
    M.SCORE_DIMS.forEach(function (d) {
      var input = $('sc-' + d.key);
      if (input) {
        input.value = review.scores[d.key] || 0;
        $('out-' + d.key).textContent = review.scores[d.key] || 0;
      }
    });
  }

  function renderScore() {
    var review = S.getReview(date);
    var total = M.weightedScore(review.scores);
    el.scoreTotal.textContent = total.toFixed(1);
    el.scoreVerdict.textContent =
      total >= 85 ? '优秀。保持仓位。' :
      total >= 70 ? '合格。还有仓位可优化。' :
      total >= 50 ? '及格线附近。明天必须砍掉一个消耗项。' :
      '不合格。今天大概率被消耗型吃掉了，回看 ACM 表。';
  }

  /* ---------- 复盘：文字部分 ---------- */
  function collectText() {
    var review = S.getReview(date);
    review.threeQs.self = el.qSelf.value;
    review.threeQs.society = el.qSociety.value;
    review.threeQs.interest = el.qInterest.value;
    review.reflection.focus = el.rFocus.value;
    review.reflection.task = el.rTask.value;
    review.reflection.overall = el.rOverall.value;
    review.improvement = el.improvement.value;
    S.saveReview(review);
  }

  function syncText() {
    var r = S.getReview(date);
    el.qSelf.value = r.threeQs.self || '';
    el.qSociety.value = r.threeQs.society || '';
    el.qInterest.value = r.threeQs.interest || '';
    el.rFocus.value = r.reflection.focus || '';
    el.rTask.value = r.reflection.task || '';
    el.rOverall.value = r.reflection.overall || '';
    el.improvement.value = r.improvement || '';
  }

  /* ---------- 清算日结 ---------- */
  function settle() {
    collectText();
    collectACM();
    collectScores();
    var review = S.getReview(date);
    if (!review.threeQs.self && !review.threeQs.society && !review.threeQs.interest) {
      window.alert('三问是每日必答。空着不能清算。');
      setView('review');
      el.qSelf.focus();
      return;
    }
    S.settle(date);               // 复利账户累加由存储层保证只做一次
    el.settleLayer.hidden = false;
    el.settleDate.textContent = date;
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function init() {
    var need = ['att-date', 'att-tabs'];
    if (!window.AttentionModel || !window.AttentionStore) return;
    for (var i = 0; i < need.length; i++) { if (!$(need[i])) return; }

    el = {
      date: $('att-date'),
      tabs: $('att-tabs'),
      capUsed: $('att-cap-used'), capRemain: $('att-cap-remain'),
      barFill: $('att-bar-fill'), capWarn: $('att-cap-warn'),
      tContent: $('t-content'), tCategory: $('t-category'), tEst: $('t-est'),
      tRoi: $('t-roi'), tBlock: $('t-block'),
      planTasks: $('att-plan-tasks'), execTasks: $('att-exec-tasks'), execStat: $('att-exec-stat'),
      acm: $('att-acm'), acmSum: $('att-acm-sum'),
      buildRatio: $('att-build-ratio'), drainRatio: $('att-drain-ratio'),
      unaccounted: $('att-unaccounted'), alert: $('att-alert'),
      scores: $('att-scores'), scoreTotal: $('att-score-total'), scoreVerdict: $('att-score-verdict'),
      qSelf: $('q-self'), qSociety: $('q-society'), qInterest: $('q-interest'),
      rFocus: $('r-focus'), rTask: $('r-task'), rOverall: $('r-overall'),
      improvement: $('att-improvement'),
      settleLayer: $('att-settle-layer'), settleDate: $('att-settle-date')
    };

    date = el.date.value || todayStr();
    el.date.value = date;

    /* 下拉选项由模型生成，保证 UI 与数据模型同源 */
    el.tCategory.innerHTML = M.CATEGORIES.map(function (c) {
      return '<option value="' + c.key + '">' + c.label + ' · ' + c.desc + '</option>';
    }).join('');
    el.tRoi.innerHTML = M.ROI_LEVELS.map(function (r) {
      return '<option value="' + r.key + '">ROI ' + r.label + '</option>';
    }).join('');

    buildACMInputs();
    buildScoreInputs();

    el.tabs.addEventListener('click', function (e) {
      var v = e.target.getAttribute('data-view');
      if (v) setView(v);
    });
    $('att-task-form').addEventListener('submit', addTask);
    el.planTasks.addEventListener('click', delTask);
    el.execTasks.addEventListener('change', execChange);
    el.date.addEventListener('change', function () {
      date = el.date.value || todayStr();
      syncAll();
      if (currentView === 'board' && window.AttentionBoard) window.AttentionBoard.render(date);
    });

    ['qSelf', 'qSociety', 'qInterest', 'rFocus', 'rTask', 'rOverall', 'improvement'].forEach(function (k) {
      el[k].addEventListener('change', collectText);
    });

    $('att-settle').addEventListener('click', settle);
    $('att-settle-close').addEventListener('click', function () { el.settleLayer.hidden = true; });
    $('att-export-md').addEventListener('click', function () {
      download('复盘-' + date + '.md', S.exportMarkdown(date), 'text/markdown');
    });
    $('att-export-json').addEventListener('click', function () {
      download('attention-backup-' + todayStr() + '.json', S.exportJSON(), 'application/json');
    });
    $('att-import').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          S.importJSON(reader.result);
          syncAll();
          window.alert('导入完成。');
        } catch (err) {
          window.alert('这个文件读不出来，确认是本工具导出的备份。');
        }
      };
      reader.readAsText(f);
      e.target.value = '';
    });

    syncAll();
    setView('plan');
  }

  function syncAll() {
    renderCapital();
    renderPlanTasks();
    renderExecTasks();
    syncACMInputs();
    syncScoreInputs();
    syncText();
    renderAudit();
    renderScore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
