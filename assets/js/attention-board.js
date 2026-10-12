/* 注意力资本 · 周度看板（M2）
 *
 * 纯手写 SVG，不引入任何图表库：
 *   ① 近 7 日建设 vs 消耗 —— 堆叠柱 + 60% 消耗红线
 *   ② 股本使用率 —— 面积折线
 *   ③ 五维得分 —— 雷达图（仅统计有复盘的天）
 *   ④ 复利账户 —— 纯 CSS 进度条
 *   ⑤ 知识期货 —— 表格：项目投入小时 × PCFS 同名收入 → 折算时薪
 *
 * 依赖：attention-model.js（聚合）、attention-store.js（数据）、ledger.js（读金钱账）
 * 隐私：只读本地数据，不联网、不上传、不推埋点。
 */
(function (global) {
  'use strict';

  var W = 640;   // 统一 viewBox 宽度，高度随图表类型变化

  function M() { return global.AttentionModel; }
  function S() { return global.AttentionStore; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function chart(inner, h, label) {
    return '<svg class="att-chart" viewBox="0 0 ' + W + ' ' + h + '" preserveAspectRatio="xMidYMid meet" ' +
           'role="img" aria-label="' + esc(label) + '">' + inner + '</svg>';
  }

  /* ---------- ① 建设 / 消耗堆叠柱 ---------- */
  function stackedBars(days) {
    var h = 210, pad = { l: 32, r: 12, t: 18, b: 24 };
    var iw = W - pad.l - pad.r, ih = h - pad.t - pad.b;
    var model = M();

    var peak = days.reduce(function (m, d) { return Math.max(m, d.build + d.drain); }, 0);
    var cap = Math.max(model.DAY_CAPITAL, peak);
    var n = days.length;
    var slot = iw / n;
    var bw = Math.min(34, slot * 0.52);
    var out = [];

    [0, 0.5, 1].forEach(function (r) {
      var y = pad.t + ih - ih * r;
      out.push('<line class="att-chart__grid" x1="' + pad.l + '" y1="' + y + '" x2="' + (W - pad.r) + '" y2="' + y + '"/>');
      out.push('<text class="att-chart__tick" x="' + (pad.l - 6) + '" y="' + (y + 3.5) + '" text-anchor="end">' + Math.round(cap * r) + '</text>');
    });

    var y60 = pad.t + ih - ih * (model.DAY_CAPITAL * model.DRAIN_ALERT / cap);
    out.push('<line class="att-chart__rule" x1="' + pad.l + '" y1="' + y60 + '" x2="' + (W - pad.r) + '" y2="' + y60 + '"/>');
    out.push('<text class="att-chart__tick att-chart__tick--warn" x="' + (W - pad.r) + '" y="' + (y60 - 5) + '" text-anchor="end">消耗红线 60%</text>');

    days.forEach(function (d, i) {
      var cx = pad.l + slot * (i + 0.5);
      var x = cx - bw / 2;
      var hb = (d.build / cap) * ih;
      var hd = (d.drain / cap) * ih;
      if (hb > 0) {
        out.push('<rect x="' + x + '" y="' + (pad.t + ih - hb) + '" width="' + bw + '" height="' + hb + '" rx="3" fill="var(--c-build)"/>');
      }
      if (hd > 0) {
        out.push('<rect x="' + x + '" y="' + (pad.t + ih - hb - hd) + '" width="' + bw + '" height="' + hd + '" rx="3" fill="var(--c-drain)"/>');
      }
      out.push('<text class="att-chart__tick" x="' + cx + '" y="' + (h - 8) + '">' + d.date.slice(5) + '</text>');
    });

    return chart(out.join(''), h, '近七日建设与消耗股数堆叠柱状图，含六成消耗红线');
  }

  /* ---------- ② 股本使用率折线 ---------- */
  function trendLine(days) {
    var h = 180, pad = { l: 38, r: 14, t: 16, b: 24 };
    var iw = W - pad.l - pad.r, ih = h - pad.t - pad.b;
    var model = M();
    var n = days.length;

    var peak = days.reduce(function (m, d) {
      return Math.max(m, d.allocated / (d.capacity || model.DAY_CAPITAL));
    }, 0);
    var ymax = Math.max(0.5, Math.ceil(peak * 4) / 4);       // 至少 50%，按 25% 取整

    var pts = days.map(function (d, i) {
      var rate = d.allocated / (d.capacity || model.DAY_CAPITAL);
      var x = pad.l + (n === 1 ? iw / 2 : iw * i / (n - 1));
      var y = pad.t + ih - ih * (rate / ymax);
      return { x: x, y: y, rate: rate, d: d };
    });

    var out = [];
    [0, 0.5, 1].forEach(function (r) {
      var y = pad.t + ih - ih * r;
      out.push('<line class="att-chart__grid" x1="' + pad.l + '" y1="' + y + '" x2="' + (W - pad.r) + '" y2="' + y + '"/>');
      out.push('<text class="att-chart__tick" x="' + (pad.l - 6) + '" y="' + (y + 3.5) + '" text-anchor="end">' + Math.round(ymax * r * 100) + '%</text>');
    });

    var line = pts.map(function (p) { return p.x + ',' + p.y; }).join(' ');
    var area = pad.l + ',' + (pad.t + ih) + ' ' + line + ' ' + (W - pad.r) + ',' + (pad.t + ih);
    out.push('<polygon class="att-chart__area" points="' + area + '"/>');
    out.push('<polyline class="att-chart__line" points="' + line + '"/>');

    pts.forEach(function (p, i) {
      out.push('<circle class="att-chart__dot" cx="' + p.x + '" cy="' + p.y + '" r="3"/>');
      /* 两端标签向内收，避免溢出 viewBox 被裁 */
      var anchor = 'middle', tx = p.x;
      if (i === 0) { anchor = 'start'; tx = p.x + 2; }
      if (i === pts.length - 1) { anchor = 'end'; tx = p.x - 2; }
      out.push('<text class="att-chart__tick" x="' + tx + '" y="' + (h - 8) + '" text-anchor="' + anchor + '">' + p.d.date.slice(5) + '</text>');
      if (p.rate > 0) {
        out.push('<text class="att-chart__val" x="' + tx + '" y="' + (p.y - 8) + '" text-anchor="' + anchor + '">' + Math.round(p.rate * 100) + '%</text>');
      }
    });

    return chart(out.join(''), h, '近七日本日排仓股本使用率折线图');
  }

  /* ---------- ③ 五维雷达 ---------- */
  function radar(avg) {
    var h = 240, cx = W / 2, cy = h / 2 + 6, R = 76;
    var dims = M().SCORE_DIMS, n = dims.length;
    var out = [];

    function pt(i, ratio) {
      var a = -Math.PI / 2 + (Math.PI * 2 * i / n);
      return { x: cx + Math.cos(a) * R * ratio, y: cy + Math.sin(a) * R * ratio, a: a };
    }

    /* 环形网格（25/50/75/100） */
    [0.25, 0.5, 0.75, 1].forEach(function (r) {
      var poly = dims.map(function (_, i) { var p = pt(i, r); return p.x + ',' + p.y; }).join(' ');
      out.push('<polygon class="att-chart__gridp" points="' + poly + '"/>');
    });
    /* 轴线 */
    dims.forEach(function (_, i) {
      var p = pt(i, 1);
      out.push('<line class="att-chart__grid" x1="' + cx + '" y1="' + cy + '" x2="' + p.x + '" y2="' + p.y + '"/>');
    });
    /* 数据多边形 */
    var dataPoly = dims.map(function (d, i) {
      var v = Math.max(0, Math.min(100, Number(avg[d.key]) || 0)) / 100;
      var p = pt(i, v);
      return p.x + ',' + p.y;
    }).join(' ');
    out.push('<polygon class="att-chart__radar" points="' + dataPoly + '"/>');
    dims.forEach(function (d, i) {
      var v = Math.max(0, Math.min(100, Number(avg[d.key]) || 0)) / 100;
      var p = pt(i, v);
      out.push('<circle class="att-chart__dot" cx="' + p.x + '" cy="' + p.y + '" r="3"/>');
      var lp = pt(i, 1.22);
      out.push('<text class="att-chart__tick" x="' + lp.x + '" y="' + (lp.y + 3.5) + '" text-anchor="middle">' + esc(d.label) + '</text>');
      out.push('<text class="att-chart__val att-chart__val--dim" x="' + lp.x + '" y="' + (lp.y + 15) + '" text-anchor="middle">' + (Number(avg[d.key]) || 0) + '</text>');
    });

    return chart(out.join(''), h, '近七日五维得分均值雷达图');
  }

  /* ---------- ④ 复利账户进度条（纯 CSS） ---------- */
  function compound(accounts) {
    var accs = M().COMPOUND_ACCOUNTS;
    var peak = accs.reduce(function (m, a) { return Math.max(m, Number(accounts[a.key]) || 0); }, 1);
    return accs.map(function (a) {
      var v = Number(accounts[a.key]) || 0;
      return '<div class="att-comp__row">' +
        '<span class="att-comp__label">' + esc(a.label) + '</span>' +
        '<span class="att-comp__bar"><i style="width:' + Math.round(v / peak * 100) + '%"></i></span>' +
        '<span class="att-comp__val">' + v + '</span>' +
      '</div>';
    }).join('');
  }

  /* ---------- ⑤ 知识期货 · 投入 vs 收入 ---------- */
  function money(n) {
    var v = Math.round((Number(n) || 0) * 100) / 100;
    var s = (v % 1 === 0) ? String(v) : v.toFixed(2);
    return '¥' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function rateCell(r) {
    if (r.rate == null) return '<span class="att-fut__rate--na">未记工时</span>';
    if (r.rate === 0) return '<span class="att-fut__rate--na">¥0/h</span>';
    return '<span class="att-fut__rate">' + money(r.rate) + '/h</span>';
  }
  function futuresCard(res) {
    if (!res.rows.length) {
      return '<p class="att-empty">还没有关联项目。在「晨会」给任务填上「关联项目」，并在财务工具里用同名分类记录收入，这里就会算出每投入一小时换回多少钱。</p>';
    }
    var rows = res.rows.map(function (r) {
      return '<tr>' +
        '<td class="att-fut__name" title="' + esc(r.name) + '">' + esc(r.name) + '</td>' +
        '<td>' + r.hours + '</td>' +
        '<td>' + r.tasks + '</td>' +
        '<td>' + (r.income ? money(r.income) : '<span class="att-fut__rate--na">—</span>') + '</td>' +
        '<td>' + rateCell(r) + '</td>' +
      '</tr>';
    }).join('');
    var t = res.total;
    var foot = '<tfoot><tr>' +
      '<td>合计 · ' + t.projects + ' 个项目</td>' +
      '<td>' + t.hours + '</td>' +
      '<td></td>' +
      '<td>' + money(t.income) + '</td>' +
      '<td>' + (t.rate == null ? '—' : money(t.rate) + '/h') + '</td>' +
    '</tr></tfoot>';
    return '<div class="att-fut__wrap"><table class="att-fut">' +
      '<thead><tr><th>项目</th><th>投入(h)</th><th>任务</th><th>收入</th><th>折算时薪</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' + foot + '</table></div>';
  }

  /* ---------- 顶部 KPI ---------- */
  function kpi(days, sum) {
    var model = M();
    var li = function (label, value, cls) {
      return '<div class="att-kpi__cell"><span class="att-kpi__label">' + label + '</span>' +
             '<span class="att-kpi__num' + (cls ? ' ' + cls : '') + '">' + value + '</span></div>';
    };
    var cells = [];
    cells.push(li('复盘天数', sum.filled + ' / ' + days.length));
    cells.push(li('平均得分', sum.avgScore.toFixed(1), sum.avgScore >= 70 ? 'is-build' : ''));
    cells.push(li('建设占比', (sum.buildRatio * 100).toFixed(1) + '%', 'is-build'));
    cells.push(li('消耗占比', (sum.drainRatio * 100).toFixed(1) + '%', sum.drainRatio > model.DRAIN_ALERT ? 'is-drain' : ''));
    cells.push(li('股本使用率', Math.round(sum.utilization * 100) + '%'));
    cells.push(li('任务完成', sum.done + ' / ' + sum.tasks));
    return cells.join('');
  }

  var Board = {
    /* 渲染整块看板；date 为终点日期（含当天向前 7 天） */
    render: function (date, opts) {
      var host = document.getElementById('att-board');
      if (!host) return;
      var model = M();
      var store = S();
      if (!model || !store) return;

      var n = (opts && opts.days) || 7;
      var dates = model.recentDates(date, n);
      var days = model.dailyStats(
        dates,
        function (d) { return store.getPlan(d); },
        function (d) { return store.getReview(d); }
      );
      var sum = model.summarize(days);
      var avg = model.avgScores(days);
      var accounts = store.accounts();
      /* 知识期货要读金钱账：注意力页不加载 PCFS，走 Ledger 直读 localStorage */
      var moneyList = (global.Ledger && typeof global.Ledger.money === 'function')
        ? global.Ledger.money() : [];
      var moneyPlans = (global.Ledger && typeof global.Ledger.plans === 'function')
        ? global.Ledger.plans() : store.allPlans();
      var fut = model.futuresROI(moneyPlans, moneyList);

      var hasAny = days.some(function (d) { return d.hasReview || d.allocated > 0; }) || fut.rows.length > 0;

      var html = '';
      html += '<div class="att-kpi att-kpi--board">' + kpi(days, sum) + '</div>';

      if (!hasAny) {
        html += '<p class="att-empty">这一周还没有数据。回「晨会」排仓、「复盘」做账，这里就会长出图来。</p>';
      }

      html += '<div class="att-board">';
      html += '<section class="att-card att-card--wide"><h3 class="att-card__title">建设 vs 消耗 · 近 ' + n + ' 日</h3>' + stackedBars(days) + '</section>';
      html += '<section class="att-card att-card--wide"><h3 class="att-card__title">股本使用率 · 排仓占当日 960 股的比例</h3>' + trendLine(days) + '</section>';
      html += '<section class="att-card"><h3 class="att-card__title">五维得分 · 近 ' + avg.n + ' 次复盘均值</h3>' + radar(avg) + '</section>';
      html += '<section class="att-card"><h3 class="att-card__title">复利账户 · 累计不清零</h3><div class="att-comp">' + compound(accounts) + '</div></section>';
      html += '<section class="att-card att-card--wide"><h3 class="att-card__title">知识期货 · 注意力投入 × 金钱收入（折算时薪）</h3>' + futuresCard(fut) + '</section>';
      html += '</div>';

      host.innerHTML = html;
    }
  };

  global.AttentionBoard = Board;
})(window);
