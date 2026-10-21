#!/usr/bin/env python3
"""素问名片指标快照：打开公开分享页（免登录），抓取渲染后的指标，
重写 _data/card-stats.yml。抓不到关键字段时以非零码退出，让 CI 显式红灯，
但不改动旧数据 —— 站点永远展示「最后一次成功抓取」的值。

用法：
    python growth-lab/sooon-card-snapshot.py

浏览器选择（依次回退）：环境变量 CHROME_BIN → google-chrome → chromium →
chromium-browser → 本机 Edge。依赖仅 websocket-client（CDP 直连，无 Playwright）。
"""
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_data", "card-stats.yml")
SHARE_URL = "https://sooon.ai/s/r/3KVBGlekVOmXSoSaXOP4lK"

CANDIDATES = [
    os.environ.get("CHROME_BIN"),
    shutil.which("google-chrome"),
    shutil.which("chromium"),
    shutil.which("chromium-browser"),
    shutil.which("msedge"),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]

FIELDS = {
    "streak_days":       r"连续打卡\s*([\d,]+)\s*天",
    "total_checkin_days": r"总打卡\s*([\d,]+)\s*天",
    "contribution":      r"总贡献值\s*([\d,]+)",
    "adopted":           r"总采纳率\s*([\d,]+)\s*/\s*[\d,]+",
    "answered":          r"总采纳率\s*[\d,]+\s*/\s*([\d,]+)",
    "quick_answer_days": r"抢答天数\s*([\d,]+)\s*天",
    "subscribed":        r"连续订阅\s*([\d,]+)\s*/\s*[\d,]+",
    "subscribe_total":   r"连续订阅\s*[\d,]+\s*/\s*([\d,]+)",
    "stdev_minutes":     r"打卡标准差\s*([\d,]+)\s*Min",
}
REQUIRED = ["streak_days", "contribution", "adopted", "answered"]


def find_browser():
    for c in CANDIDATES:
        if c and os.path.exists(c):
            return c
    raise SystemExit("找不到 Chrome/Edge，可设 CHROME_BIN 环境变量")


class CDP:
    def __init__(self, port):
        self.proc = subprocess.Popen(
            [find_browser(), "--headless=new", "--disable-gpu", "--no-first-run",
             "--remote-allow-origins=*",
             f"--remote-debugging-port={port}", "--user-data-dir=" + tempfile.mkdtemp(),
             "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.port = port
        for _ in range(60):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=2) as r:
                    ws_url = json.load(r)["webSocketDebuggerUrl"]
                break
            except Exception:
                time.sleep(0.5)
        else:
            raise SystemExit("浏览器调试端口未就绪")
        import websocket
        self.ws = websocket.create_connection(ws_url, timeout=30)
        self._id = 0
        info = json.load(urllib.request.urlopen(
            urllib.request.Request(f"http://127.0.0.1:{port}/json/new?about:blank", method="PUT"),
            timeout=10))
        self.ws = websocket.create_connection(info["webSocketDebuggerUrl"], timeout=30)

    def send(self, method, params=None):
        self._id += 1
        self.ws.send(json.dumps({"id": self._id, "method": method, "params": params or {}}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self._id:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})

    def goto(self, url):
        self.send("Page.enable")
        self.send("Page.navigate", {"url": url})

    def text(self):
        r = self.send("Runtime.evaluate",
                      {"expression": "document.body.innerText", "returnByValue": True})
        return r.get("result", {}).get("value", "")

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass
        self.proc.terminate()


def scrape():
    port = 9337
    cdp = CDP(port)
    try:
        cdp.goto(SHARE_URL)
        values = {}
        prev = None
        stable = 0
        deadline = time.time() + 40
        while time.time() < deadline:
            txt = cdp.text()
            values["_txt"] = txt
            """SPA 首帧可能先渲染别人的卡片或占位内容：
            1) 等到「我的素问名片」标记出现；
            2) 只在头部区（到「同问贡献」为止）解析，避免误抓 feed 里其他用户；
            3) 连续两次解析结果一致才采信，防止过渡帧。"""
            if "我的素问名片" in txt:
                scope = txt.split("同问贡献", 1)[0] if "同问贡献" in txt else txt[:800]
                cur = {}
                for key, rx in FIELDS.items():
                    m = re.search(rx, scope)
                    if m:
                        cur[key] = m.group(1)
                if cur == prev and all(k in cur for k in REQUIRED):
                    values.update(cur)
                    break
                if cur:
                    prev = cur
                    stable = stable  # noqa
            time.sleep(1.5)
        if prev and all(k in prev for k in REQUIRED):
            values.update(prev)
        return values
    finally:
        cdp.close()


def clean(v):
    return int(v.replace(",", "")) if v is not None else None


def write_yaml(d):
    cst = timezone(timedelta(hours=8))
    today = datetime.now(cst).strftime("%Y-%m-%d")
    body = f"""\
# 素问名片指标快照 —— 由 scripts/sooon-card-snapshot.py 定时刷新（GitHub Actions 每天 10:30）
# 自动化跑不了时，手动改这份文件即可；hero-card 里读不到 streak_days 会整块隐藏（优雅降级）。
fetched_at: "{today}"
source: "{SHARE_URL}"
display_name: "{d.get('name', '水狮子')}"
streak_days: {d['streak_days']}           # 连续打卡（天）
total_checkin_days: {d.get('total_checkin_days', 0)}    # 总打卡（天）
contribution: {d['contribution']}        # 总贡献值
adopted: {d['adopted']}            # 被采纳回答数
answered: {d['answered']}           # 回答总数
quick_answer_days: {d.get('quick_answer_days', 0)}    # 抢答天数
subscribed: {d.get('subscribed', 0)}           # 连续订阅（天）
subscribe_total: {d.get('subscribe_total', 0)}       # 订阅区间总天数
stdev_minutes: {d.get('stdev_minutes', 0)}          # 打卡时间标准差（分钟）
"""
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(body)


def main():
    raw = scrape()
    missing = [k for k in REQUIRED if k not in raw]
    if missing:
        print("MISSING:", missing)
        print("页面文本片段（前 400 字）：", raw.get("_txt", "")[:400])
        sys.exit(2)

    name_m = re.search(r"([^\n]+?)\s*\n我的素问名片", raw.get("_txt", ""))
    data = {k: clean(v) for k, v in raw.items() if k in FIELDS}
    data["name"] = (name_m.group(1).strip() if name_m else "水狮子")

    old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    write_yaml(data)
    new = open(OUT, encoding="utf-8").read()
    print("更新完成：连续打卡 %s 天，贡献 %s（%s）" %
          (data["streak_days"], data["contribution"], "有变化" if old != new else "无变化"))


if __name__ == "__main__":
    main()
