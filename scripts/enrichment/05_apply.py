#!/usr/bin/env python3
"""ステップ5: 判定結果・死活チェック結果を public/data に反映する。

反映内容(既存値は上書きしない。空のフィールドのみ埋める):
  - species: confidence=high の判定から dog / cat のみ採用("other" は除外)
  - city:    confidence=high の判定から採用(妥当性チェックを通ったもののみ)
  - caution / note: LLM判定の生テキストは使わず、セッション内レビューで選別した
    manual_overrides.json のみ反映(活動紹介文・メタ記述の混入を防ぐ)
  - manual_overrides.json は species / city / link_broken の手動確定値も持てる
    (個別レビューでSNSプロフィール等から確認したもの。死活チェックより優先)
  - link_broken: 死活チェックNGのURLに true を付与(復活したら削除)
  - url:     http→https 等スキームのみのリダイレクトは final_url に更新
  - last_verified: URLをチェックした団体に収集日を記録(Phase 3 の鮮度表示の下地)

confidence=low・判定不能・cityが妥当性チェック落ちのものは out/review_needed.json
に出力し、セッション内の個別レビューに回す。

書き込み前に全ファイルへ電話番号混入チェックを行う(既存方針)。

usage:
  python3 scripts/enrichment/05_apply.py          # dry-run
  python3 scripts/enrichment/05_apply.py --write  # 書き込み
"""

import json
import re
import sys
from datetime import date
from urllib.parse import urlparse

from pathlib import Path

from common import (
    OUT_DIR, iter_org_files, load_json, order_org_fields, org_key, save_json,
)

OVERRIDES_PATH = Path(__file__).resolve().parent / "manual_overrides.json"

RE_PHONE = re.compile(r"0\d{1,4}-\d{1,4}-\d{3,4}|(?<!\d)0\d{9,10}(?!\d)")
# 「◯◯市」「◯◯町・△△市」等。区切りは「・」のみ許容
RE_CITY = re.compile(r"^[一-龥々ぁ-んァ-ヶー]{1,8}[市町村区郡](・[一-龥々ぁ-んァ-ヶー]{1,8}[市町村区郡])*$")


def scheme_only_redirect(url, final_url):
    a, b = urlparse(url), urlparse(final_url)
    return (
        a.scheme == "http" and b.scheme == "https"
        and a.netloc == b.netloc
        and a.path.rstrip("/") == b.path.rstrip("/")
        and not b.query
    )


def main():
    write = "--write" in sys.argv
    today = date.today().isoformat()

    url_status = load_json(OUT_DIR / "url_status.json")
    judgments_path = OUT_DIR / "judgments.json"
    judgments = load_json(judgments_path) if judgments_path.exists() else {}
    snippets_path = OUT_DIR / "snippets.json"
    snippets = load_json(snippets_path) if snippets_path.exists() else {}
    overrides = load_json(OVERRIDES_PATH) if OVERRIDES_PATH.exists() else {}

    stats = {"species": 0, "city": 0, "caution": 0, "note": 0, "link_broken": 0,
             "url_https": 0, "last_verified": 0}
    review = []
    changed_files = {}

    for slug, path, data in iter_org_files():
        dirty = False
        new_orgs = []
        for org in data["organizations"]:
            key = org_key(slug, org["id"])
            st = url_status.get(key)
            j = judgments.get(key, {})

            # --- 死活チェック結果 ---
            if st:
                org["last_verified"] = today
                stats["last_verified"] += 1
                dirty = True
                if not st["ok"]:
                    if not org.get("link_broken"):
                        org["link_broken"] = True
                        stats["link_broken"] += 1
                elif org.pop("link_broken", None):
                    pass  # 復活したので削除
                if st["ok"] and st.get("redirected") and \
                        scheme_only_redirect(org["url"], st["final_url"]):
                    org["url"] = st["final_url"].rstrip("/") + (
                        "/" if org["url"].endswith("/") else "")
                    stats["url_https"] += 1

            # --- Gemini判定の反映(highのみ・空フィールドのみ) ---
            needs_review = None
            if j and "error" not in j:
                if j.get("confidence") == "high":
                    species = [s for s in j.get("species", []) if s in ("dog", "cat")]
                    if species and not org.get("species"):
                        org["species"] = species
                        stats["species"] += 1
                        dirty = True
                    city = (j.get("city") or "").strip()
                    if city and not org.get("city"):
                        if RE_CITY.match(city):
                            org["city"] = city
                            stats["city"] += 1
                            dirty = True
                        else:
                            needs_review = f"city候補が形式チェック落ち: {city}"
                else:
                    needs_review = "confidence=low"
            elif "error" in j:
                needs_review = f"判定エラー: {j['error'][:80]}"

            # --- レビュー済み手動確定値の反映 ---
            ov = overrides.get(key, {})
            if ov.get("species") and not org.get("species"):
                org["species"] = ov["species"]
                stats["species"] += 1
                dirty = True
            if ov.get("city") and not org.get("city"):
                org["city"] = ov["city"]
                stats["city"] += 1
                dirty = True
            if ov.get("link_broken"):
                if not org.get("link_broken"):
                    org["link_broken"] = True
                    stats["link_broken"] += 1
                    dirty = True
            if ov.get("caution") and not org.get("caution"):
                org["caution"] = ov["caution"]
                stats["caution"] += 1
                dirty = True
            if ov.get("note") and ov["note"] not in (org.get("note") or ""):
                org["note"] = "。".join(
                    filter(None, [org.get("note", ""), ov["note"]]))
                stats["note"] += 1
                dirty = True

            # 反映後もまだ埋まっていない調査対象は個別レビューへ
            if org.get("url") and not org.get("link_broken") and \
                    (not org.get("species") or not org.get("city")):
                sn = snippets.get(key, {})
                review.append({
                    "key": key,
                    "name": org["name"],
                    "url": org["url"],
                    "missing": [f for f in ("species", "city") if not org.get(f)],
                    "reason": needs_review or f"snippet={sn.get('status', 'なし')}",
                    "judgment": j or None,
                })

            new_orgs.append(order_org_fields(org))

        if dirty:
            data["organizations"] = new_orgs
            changed_files[path] = data

    # --- 電話番号検証(既存方針) ---
    errors = []
    for path, data in changed_files.items():
        for m in RE_PHONE.finditer(json.dumps(data, ensure_ascii=False)):
            errors.append(f"{path.name}: 電話番号らしき文字列を検出: {m.group(0)}")
    if errors:
        print("検証エラー(書き込み中止):")
        for e in errors:
            print(f"  {e}")
        sys.exit(1)
    print("電話番号検証: OK")

    save_json(OUT_DIR / "review_needed.json", review)
    print(f"反映: {stats}")
    print(f"個別レビュー行き: {len(review)}件 → {OUT_DIR / 'review_needed.json'}")

    if write:
        for path, data in changed_files.items():
            path.write_text(
                json.dumps(data, ensure_ascii=False, indent=4) + "\n",
                encoding="utf-8",
            )
        print(f"書き込み完了: {len(changed_files)}ファイル")
    else:
        print(f"dry-run: {len(changed_files)}ファイルが変更対象(--write で書き込み)")


if __name__ == "__main__":
    main()
