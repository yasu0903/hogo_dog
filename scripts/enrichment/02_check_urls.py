#!/usr/bin/env python3
"""ステップ2: URL死活チェック(トークンゼロ)。

全団体のURL(species/city が埋まっている団体も含む)に GET を投げ、
ステータス・最終到達URL(リダイレクト先)を out/url_status.json に記録する。

- HEAD は拒否するサイトが多いため最初から GET(stream=True でボディは読まない)
- ホスト単位では直列になるよう並列度は控えめ(実データはほぼ全て別ホスト)
- SSL証明書エラーは「切れかけ」として broken 扱いにせず ssl_error で区別

usage: python3 scripts/enrichment/02_check_urls.py
"""

import concurrent.futures as futures

import requests
import urllib3

from common import OUT_DIR, USER_AGENT, iter_org_files, org_key, save_json

TIMEOUT = 20
MAX_WORKERS = 12


def check(url):
    try:
        resp = requests.get(
            url,
            timeout=TIMEOUT,
            allow_redirects=True,
            stream=True,
            headers={"User-Agent": USER_AGENT},
        )
        result = {
            "status": resp.status_code,
            "ok": resp.status_code < 400,
            "final_url": resp.url,
            "redirected": resp.url.rstrip("/") != url.rstrip("/"),
        }
        resp.close()
        return result
    except requests.exceptions.SSLError:
        # 証明書切れ等。サイト自体は生きていることが多いので検証なしで再試行
        try:
            urllib3.disable_warnings()
            resp = requests.get(
                url,
                timeout=TIMEOUT,
                allow_redirects=True,
                stream=True,
                verify=False,
                headers={"User-Agent": USER_AGENT},
            )
            result = {
                "status": resp.status_code,
                "ok": resp.status_code < 400,
                "final_url": resp.url,
                "redirected": resp.url.rstrip("/") != url.rstrip("/"),
                "ssl_error": True,
            }
            resp.close()
            return result
        except requests.exceptions.RequestException as e:
            return {"status": None, "ok": False, "error": type(e).__name__}
    except requests.exceptions.RequestException as e:
        return {"status": None, "ok": False, "error": type(e).__name__}


def main():
    urls = {}  # key -> url
    for slug, _path, data in iter_org_files():
        for org in data["organizations"]:
            if org.get("url"):
                urls[org_key(slug, org["id"])] = org["url"]

    print(f"チェック対象URL: {len(urls)}件")
    results = {}
    with futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futs = {pool.submit(check, url): key for key, url in urls.items()}
        for i, fut in enumerate(futures.as_completed(futs), 1):
            key = futs[fut]
            results[key] = {"url": urls[key], **fut.result()}
            if i % 25 == 0:
                print(f"  {i}/{len(urls)} 済")

    ng = {k: v for k, v in results.items() if not v["ok"]}
    redirected = {k: v for k, v in results.items() if v.get("redirected")}
    save_json(OUT_DIR / "url_status.json", results)
    print(f"NG: {len(ng)}件 / リダイレクト: {len(redirected)}件")
    for k, v in sorted(ng.items()):
        print(f"  NG {k}: {v['url']} ({v.get('status') or v.get('error')})")
    print(f"→ {OUT_DIR / 'url_status.json'}")


if __name__ == "__main__":
    main()
