#!/usr/bin/env python3
"""月次リンクチェック反映: 死活結果の2値だけを org JSON に書き戻す軽量スクリプト。

`02_check_urls.py` が生成した out/url_status.json を読み、各団体の
  - last_verified: チェック実行日(本スクリプト実行日)を記録
  - link_broken:   死活NG→true付与 / 復活→キー削除
**だけ**を書き戻す。species / city / url / caution / note 等には一切触れない
(org JSON は手管理が正)。CIの月次ジョブ用で、Gemini判定(judgments)やスニペット、
species/city 補完は扱わない。それらが必要な本格エンリッチメントは 05_apply.py の担当。

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
    OUT_DIR, iter_org_files, load_json, order_org_fields, org_key,
)

OVERRIDES_PATH = Path(__file__).resolve().parent / "manual_overrides.json"


def main():
    write = "--write" in sys.argv
    today = date.today().isoformat()

    url_status = load_json(OUT_DIR / "url_status.json")
    overrides = load_json(OVERRIDES_PATH) if OVERRIDES_PATH.exists() else {}

    stats = {"checked": 0, "newly_broken": 0, "recovered": 0, "last_verified": 0}
    broken = []
    changed_files = {}

    for slug, path, data in iter_org_files():
        dirty = False
        new_orgs = []
        for org in data["organizations"]:
            key = org_key(slug, org["id"])
            st = url_status.get(key)
            if st:
                stats["checked"] += 1
                if org.get("last_verified") != today:
                    org["last_verified"] = today
                    stats["last_verified"] += 1
                    dirty = True

                manual_broken = bool(overrides.get(key, {}).get("link_broken"))
                if not st["ok"]:
                    if not org.get("link_broken"):
                        org["link_broken"] = True
                        stats["newly_broken"] += 1
                        dirty = True
                    broken.append((key, org["name"], st.get("status") or st.get("error")))
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
        print(f"リンク切れ {len(broken)}件:")
        for key, name, reason in sorted(broken):
            print(f"  NG {key} ({name}): {reason}")

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
