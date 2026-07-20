#!/usr/bin/env python3
"""ステップ3: HTML取得+キーワード周辺抽出。

targets.json のうち url_status.json で ok だったURLからHTMLを取得し、
タグ除去 → キーワード周辺のみ抜き出して 1団体あたり最大2,000字程度の
スニペットに圧縮する。結果は out/snippets.json。

- robots.txt を尊重(取得不可なら fetch せず robots_disallow として記録)
- 同一ホストへの連続アクセスにならないよう全体で1秒の間隔を空ける
- 取得済みの団体はスキップ(レジューム可能)

usage: python3 scripts/enrichment/03_fetch_extract.py
"""

import re
import time
import urllib.robotparser
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

from common import OUT_DIR, USER_AGENT, load_json, save_json

TIMEOUT = 20
INTERVAL = 1.0
MAX_SNIPPET = 2000
WINDOW = 80  # キーワード前後の文字数

RE_KEYWORD = re.compile(
    r"犬|いぬ|イヌ|猫|ねこ|ネコ|わんこ|ワンちゃん|にゃん|"
    r"保護|譲渡|里親|レスキュー|"
    r"活動|拠点|所在地|事務所|シェルター|"
    r"[一-龥々ぁ-んァ-ヶ]{2,6}[市町村区]|"
    r"注意|条件|引き?取り?|お願い"
)

_robots_cache = {}


def robots_allows(url):
    origin = "{0.scheme}://{0.netloc}".format(urlparse(url))
    if origin not in _robots_cache:
        rp = urllib.robotparser.RobotFileParser()
        try:
            resp = requests.get(
                origin + "/robots.txt",
                timeout=10,
                headers={"User-Agent": USER_AGENT},
            )
            if resp.status_code == 200:
                rp.parse(resp.text.splitlines())
            else:
                rp = None  # robots.txt なし → 許可扱い
        except requests.exceptions.RequestException:
            rp = None
        _robots_cache[origin] = rp
    rp = _robots_cache[origin]
    return rp is None or rp.can_fetch(USER_AGENT, url)


def html_to_text(html):
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "iframe"]):
        tag.decompose()
    title = soup.title.get_text(" ", strip=True) if soup.title else ""
    desc = ""
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and meta.get("content"):
        desc = meta["content"]
    body = re.sub(r"\s+", " ", soup.get_text(" ", strip=True))
    return title, desc, body


def extract_snippet(text):
    """キーワード周辺のウィンドウを重複マージしながら抜き出す。"""
    spans = []
    for m in RE_KEYWORD.finditer(text):
        start, end = max(0, m.start() - WINDOW), min(len(text), m.end() + WINDOW)
        if spans and start <= spans[-1][1]:
            spans[-1] = (spans[-1][0], end)
        else:
            spans.append((start, end))
    snippet = " … ".join(text[s:e] for s, e in spans)
    return snippet[:MAX_SNIPPET]


def fetch(url):
    resp = requests.get(
        url, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT}
    )
    resp.raise_for_status()
    if resp.encoding == "ISO-8859-1":  # 宣言なし → 推定に切り替え
        resp.encoding = resp.apparent_encoding
    return resp.text


def main():
    targets = load_json(OUT_DIR / "targets.json")["targets"]
    url_status = load_json(OUT_DIR / "url_status.json")
    out_path = OUT_DIR / "snippets.json"
    snippets = load_json(out_path) if out_path.exists() else {}

    todo = []
    for t in targets:
        st = url_status.get(t["key"])
        if not st or not st["ok"]:
            continue  # リンク切れは対象外(url_status.json 側で管理)
        if t["key"] in snippets:
            continue
        todo.append((t, st["final_url"]))

    print(f"取得対象: {len(todo)}件(取得済み {len(snippets)}件はスキップ)")
    for i, (t, url) in enumerate(todo, 1):
        key = t["key"]
        try:
            if not robots_allows(url):
                snippets[key] = {"url": url, "status": "robots_disallow"}
            else:
                title, desc, body = html_to_text(fetch(url))
                snippet = extract_snippet(body)
                snippets[key] = {
                    "url": url,
                    "status": "ok" if (snippet or title) else "empty",
                    "title": title,
                    "description": desc[:300],
                    "snippet": snippet,
                }
        except requests.exceptions.RequestException as e:
            snippets[key] = {"url": url, "status": "fetch_error",
                             "error": type(e).__name__}
        if i % 10 == 0 or i == len(todo):
            save_json(out_path, snippets)
            print(f"  {i}/{len(todo)} 済")
        time.sleep(INTERVAL)

    save_json(out_path, snippets)
    counts = {}
    for v in snippets.values():
        counts[v["status"]] = counts.get(v["status"], 0) + 1
    print(f"内訳: {counts}")
    print(f"→ {out_path}")


if __name__ == "__main__":
    main()
