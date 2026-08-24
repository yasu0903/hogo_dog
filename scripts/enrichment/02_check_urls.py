#!/usr/bin/env python3
"""ステップ2: URL死活チェック(トークンゼロ)。

全団体のURL(species/city が埋まっている団体も含む)に GET を投げ、判定結果を
out/url_status.json に記録する。

判定は verdict の5値。**「アクセスできなかった」と「死んでいる」は別物**として扱う。

  ok       2xx/3xx。生存を確認
  broken   404/410 等、または名前解決失敗。死んでいると確定してよい
  blocked  401/403/429。ボット遮断・レート制限の疑い。link_broken は付けない
  unstable 5xx / タイムアウト / 接続エラー。一時障害の疑い。link_broken は付けない
  review   ボット遮断が常態のプラットフォーム(BOT_HOSTILE_HOSTS)で 404 等。
           自動判定せず人が目視する

`link_broken` を自動で付けてよいのは broken だけ(linkcheck_apply.py / 05_apply.py)。
リンク切れは掲載団体のリンクを画面から消す破壊的な変更なので、迷ったら付けない側に倒す。

- HEAD は拒否するサイトが多いため最初から GET(stream=True でボディは読まない)
- 同一ホストへの並行アクセスはレート制限(429)を誘発するため、ホスト単位で直列化+間隔を空ける
- 一時的な失敗(429/5xx/timeout/接続エラー)はバックオフして最大 MAX_ATTEMPTS 回まで再試行
- SSL証明書エラーは「切れかけ」として broken 扱いにせず ssl_error で区別

usage: python3 scripts/enrichment/02_check_urls.py
"""

import concurrent.futures as futures
import time
from collections import defaultdict
from urllib.parse import urlsplit

import requests
import urllib3

from common import OUT_DIR, USER_AGENT, iter_org_files, org_key, save_json

TIMEOUT = 20
MAX_WORKERS = 8          # 同時に処理するホスト数(ホスト内は直列)
HOST_DELAY = 1.5         # 同一ホストへの連続アクセス間隔(秒)
MAX_ATTEMPTS = 3
BACKOFF = (3, 8)         # 再試行前の待機(秒)

# ボット遮断・ログインウォールが常態のプラットフォーム。
# ここのホストは HTTP ステータスから broken を自動判定しない(名前解決失敗のみ broken)。
BOT_HOSTILE_HOSTS = {
    "instagram.com", "facebook.com", "twitter.com", "x.com",
    "youtube.com", "youtu.be", "tiktok.com", "threads.net", "threads.com",
    "note.com", "ameblo.jp", "line.me", "linktr.ee", "lit.link",
}

# ブラウザが必ず送るヘッダ。これが無いだけで 403 を返す CDN があるため添える
# (User-Agent は素性を明かしたまま変えない)。
BASE_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ja,en;q=0.8",
}

BLOCKED_STATUSES = {401, 403, 429}
BROKEN_STATUSES = {404, 410}

DNS_MARKERS = (
    "NameResolutionError", "Name or service not known",
    "nodename nor servname", "getaddrinfo failed", "Temporary failure in name resolution",
)


# co.jp / or.jp のような2階層の公開接尾辞。ここを1ドメイン扱いすると無関係な
# サイト同士が同じレート制限グループにまとめられてしまうため、1ラベル余分に取る。
MULTI_LABEL_SUFFIXES = {
    "co.jp", "or.jp", "ne.jp", "ac.jp", "go.jp", "lg.jp", "gr.jp", "ed.jp",
    "com.jp", "net.jp", "org.jp", "co.uk", "org.uk", "com.au", "co.kr", "com.cn",
}


def registrable_host(url):
    """登録可能ドメイン(www 等を除いたまとまり)。レート制限のグループ化と
    BOT_HOSTILE_HOSTS の判定に使う簡易版。"""
    host = (urlsplit(url).hostname or "").lower()
    parts = host.split(".")
    if len(parts) < 2:
        return host
    if len(parts) >= 3 and ".".join(parts[-2:]) in MULTI_LABEL_SUFFIXES:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


def classify(url, status, error_kind):
    """(verdict, reason) を返す。"""
    hostile = registrable_host(url) in BOT_HOSTILE_HOSTS

    if error_kind:
        if any(m in error_kind for m in DNS_MARKERS):
            return "broken", "dns_failure"
        if "Timeout" in error_kind:
            return "unstable", "timeout"
        return "unstable", "connection_error"

    if status < 400:
        return "ok", f"http_{status}"
    if status in BLOCKED_STATUSES:
        return "blocked", f"http_{status}"
    if status >= 500:
        return "unstable", f"http_{status}"
    if hostile:
        # プラットフォーム側の都合で 404 相当を返すことがある(未ログイン時など)。
        # 自動でリンク切れにはせず、人の目視に回す。
        return "review", f"http_{status}_on_{registrable_host(url)}"
    if status in BROKEN_STATUSES:
        return "broken", f"http_{status}"
    return "broken", f"http_{status}"


def request_once(url, verify=True):
    """(status, final_url, error_kind, ssl_error) を返す。例外は投げない。"""
    try:
        resp = requests.get(
            url, timeout=TIMEOUT, allow_redirects=True, stream=True,
            headers=BASE_HEADERS, verify=verify,
        )
        status, final_url = resp.status_code, resp.url
        resp.close()
        return status, final_url, None, not verify
    except requests.exceptions.SSLError:
        if verify:
            # 証明書切れ等。サイト自体は生きていることが多いので検証なしで再試行
            urllib3.disable_warnings()
            return request_once(url, verify=False)
        return None, None, "SSLError", True
    except requests.exceptions.RequestException as e:
        return None, None, f"{type(e).__name__}: {e}", not verify


def check(url):
    """再試行込みで1URLを判定する。"""
    result = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        status, final_url, error_kind, ssl_error = request_once(url)
        verdict, reason = classify(url, status, error_kind)
        result = {
            "status": status,
            "ok": verdict == "ok",
            "verdict": verdict,
            "reason": reason,
            "final_url": final_url,
            "redirected": bool(final_url) and final_url.rstrip("/") != url.rstrip("/"),
            "attempts": attempt,
        }
        if error_kind:
            result["error"] = error_kind
        if ssl_error:
            result["ssl_error"] = True

        # 一時障害の疑いがあるものだけ再試行する(ok / broken / review は確定)
        if verdict not in ("unstable", "blocked") or attempt == MAX_ATTEMPTS:
            break
        time.sleep(BACKOFF[min(attempt - 1, len(BACKOFF) - 1)])
    return result


def check_host_group(items):
    """同一ホストのURL群を間隔を空けて直列に処理する。"""
    out = {}
    for i, (key, url) in enumerate(items):
        if i:
            time.sleep(HOST_DELAY)
        out[key] = {"url": url, **check(url)}
    return out


def main():
    urls = {}  # key -> url
    for slug, _path, data in iter_org_files():
        for org in data["organizations"]:
            if org.get("url"):
                urls[org_key(slug, org["id"])] = org["url"]

    by_host = defaultdict(list)
    for key, url in urls.items():
        by_host[registrable_host(url)].append((key, url))

    print(f"チェック対象URL: {len(urls)}件 / {len(by_host)}ホスト")
    results = {}
    done = 0
    with futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futs = [pool.submit(check_host_group, items) for items in by_host.values()]
        for fut in futures.as_completed(futs):
            group = fut.result()
            results.update(group)
            done += len(group)
            print(f"  {done}/{len(urls)} 済")

    save_json(OUT_DIR / "url_status.json", results)

    buckets = defaultdict(list)
    for k, v in results.items():
        buckets[v["verdict"]].append((k, v))

    print(
        "判定: "
        + " / ".join(f"{v} {len(buckets.get(v, []))}件"
                     for v in ("ok", "broken", "blocked", "unstable", "review"))
    )
    for verdict, label in (
        ("broken", "リンク切れ(link_broken を自動付与)"),
        ("blocked", "アクセス拒否の疑い(自動付与しない・要目視)"),
        ("unstable", "一時障害の疑い(自動付与しない・要目視)"),
        ("review", "プラットフォーム都合の応答(自動付与しない・要目視)"),
    ):
        rows = buckets.get(verdict, [])
        if not rows:
            continue
        print(f"\n{label} {len(rows)}件:")
        for k, v in sorted(rows):
            print(f"  {verdict.upper():8} {k}: {v['url']} ({v['reason']})")

    print(f"\n→ {OUT_DIR / 'url_status.json'}")


if __name__ == "__main__":
    main()
