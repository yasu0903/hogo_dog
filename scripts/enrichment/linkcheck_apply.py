#!/usr/bin/env python3
"""月次リンクチェック反映: 死活結果の2値だけを org JSON に書き戻す軽量スクリプト。

`02_check_urls.py` が生成した out/url_status.json を読み、各団体の
  - last_verified: チェック実行日(本スクリプト実行日)を記録
  - link_broken:   死活NG→true付与 / 復活→キー削除
**だけ**を書き戻す。species / city / url / caution / note 等には一切触れない
(org JSON は手管理が正)。CIの月次ジョブ用で、Gemini判定(judgments)やスニペット、
species/city 補完は扱わない。それらが必要な本格エンリッチメントは 05_apply.py の担当。

verdict の扱い(02_check_urls.py 参照):
  ok       → link_broken を削除(復活)、last_verified 更新
  broken   → link_broken: true を付与、last_verified 更新
  それ以外 → 何も書かない。blocked/unstable/review は「アクセスできなかった」だけで
             死んでいる証拠ではない。生きているリンクを画面から消す事故を防ぐため、
             link_broken を付けないのはもちろん last_verified も更新しない
             (確認できていないものを「確認済み」にしない)。out/linkcheck_review.json
             に落とすので、人が目視して必要なら manual_overrides.json で確定させる。

manual_overrides.json で link_broken を手動確定している団体は、liveness が ok でも
link_broken を消さない(手動確定は liveness より優先。common.py の方針に合わせる)。

link_broken(真偽) と last_verified(日付文字列) しか書かないため、電話番号など個人情報の
新規混入は構造上起こり得ない(電話番号検証は 05_apply.py の範囲)。

usage:
  python3 scripts/enrichment/linkcheck_apply.py          # dry-run
  python3 scripts/enrichment/linkcheck_apply.py --write  # 書き込み
"""

import json
import sys
from datetime import date

from pathlib import Path

from common import (
    OUT_DIR, iter_org_files, load_json, order_org_fields, org_key, save_json,
)

OVERRIDES_PATH = Path(__file__).resolve().parent / "manual_overrides.json"

# 書き戻して良い判定。これ以外は「確認できなかった」として org JSON に触れない
CONCLUSIVE = ("ok", "broken")


def main():
    write = "--write" in sys.argv
    today = date.today().isoformat()

    url_status = load_json(OUT_DIR / "url_status.json")
    overrides = load_json(OVERRIDES_PATH) if OVERRIDES_PATH.exists() else {}

    stats = {"checked": 0, "conclusive": 0, "newly_broken": 0, "recovered": 0,
             "last_verified": 0, "skipped": 0}
    broken = []
    review = []
    changed_files = {}

    for slug, path, data in iter_org_files():
        dirty = False
        new_orgs = []
        for org in data["organizations"]:
            key = org_key(slug, org["id"])
            st = url_status.get(key)
            if st:
                stats["checked"] += 1
                verdict = st.get("verdict") or ("ok" if st.get("ok") else "broken")

                if verdict not in CONCLUSIVE:
                    # 判定不能。org JSON には一切触れず、目視レビューに回す
                    stats["skipped"] += 1
                    review.append({
                        "key": key, "name": org["name"], "url": org.get("url"),
                        "verdict": verdict, "reason": st.get("reason"),
                        "status": st.get("status"), "error": st.get("error"),
                        "currently_link_broken": bool(org.get("link_broken")),
                    })
                    new_orgs.append(order_org_fields(org))
                    continue

                stats["conclusive"] += 1
                if org.get("last_verified") != today:
                    org["last_verified"] = today
                    stats["last_verified"] += 1
                    dirty = True

                manual_broken = bool(overrides.get(key, {}).get("link_broken"))
                if verdict == "broken":
                    if not org.get("link_broken"):
                        org["link_broken"] = True
                        stats["newly_broken"] += 1
                        dirty = True
                    broken.append((key, org["name"], st.get("reason")))
                elif org.get("link_broken") and not manual_broken:
                    org.pop("link_broken")
                    stats["recovered"] += 1
                    dirty = True

            new_orgs.append(order_org_fields(org))

        if dirty:
            data["organizations"] = new_orgs
            changed_files[path] = data

    print(f"反映: {stats}")
    if broken:
        print(f"\nリンク切れ {len(broken)}件(link_broken: true を付与):")
        for key, name, reason in sorted(broken):
            print(f"  NG {key} ({name}): {reason}")
    if review:
        save_json(OUT_DIR / "linkcheck_review.json", review)
        print(f"\n判定不能 {len(review)}件(org JSON は未変更・要目視):")
        for r in sorted(review, key=lambda r: r["key"]):
            print(f"  {r['verdict'].upper():8} {r['key']} ({r['name']}): "
                  f"{r['url']} ({r['reason']})")
        print(f"→ {OUT_DIR / 'linkcheck_review.json'}")

    if write:
        for path, data in changed_files.items():
            path.write_text(
                json.dumps(data, ensure_ascii=False, indent=4) + "\n",
                encoding="utf-8",
            )
        print(f"\n書き込み完了: {len(changed_files)}ファイル")
    else:
        print(f"\ndry-run: {len(changed_files)}ファイルが変更対象(--write で書き込み)")


if __name__ == "__main__":
    main()
