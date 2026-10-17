---
layout: null
---
/* 每日一言运行时数据 —— 由 _data/quotes.yml 经 Liquid 生成，请勿手改本文件。
   修改内容请编辑 _data/quotes.yml 后提交。 */
window.__DAILY_QUOTES__ = {
  cycle: {{ site.data.quotes.cycle | default: 60 }},
  items: [{% for q in site.data.quotes.items %}
    {"zh": {{ q.zh | jsonify }}, "en": {{ q.en | jsonify }}, "fr": {{ q.fr | jsonify }}{% if q.date %}, "date": {{ q.date | jsonify }}{% endif %}}{% unless forloop.last %},{% endunless %}{% endfor %}
  ]
};
