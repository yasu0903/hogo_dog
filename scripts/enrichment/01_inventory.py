#!/usr/bin/env python3
"""ステップ1: 棚卸し。

Phase 2 移行後のデータから species / city が埋まっていない団体を抽出し、
out/targets.json に出力する。URLの無い団体はサイト調査ができないため
targets とは別に no_url として記録する(掲載品質の把握用)。

usage: python3 scripts/enrichment/01_inventory.py
"""

from common import OUT_DIR, iter_org_files, org_key, save_json


def main():
    targets = []
    no_url = []
    total = 0

    for slug, _path, data in iter_org_files():
        for org in data["organizations"]:
            total += 1
            missing = []
            if not org.get("species"):
                missing.append("species")
            if not org.get("city"):
                missing.append("city")
            if not missing:
                continue
            entry = {
                "key": org_key(slug, org["id"]),
                "name": org["name"],
                "area": org["area"],
                "url": org.get("url", ""),
                "missing": missing,
            }
            if entry["url"]:
                targets.append(entry)
            else:
                no_url.append(entry)

    save_json(OUT_DIR / "targets.json", {"targets": targets, "no_url": no_url})
    print(f"全団体: {total}")
    print(f"調査対象(species/city欠 かつ URLあり): {len(targets)}")
    print(f"URLなしで調査不能: {len(no_url)}")
    print(f"→ {OUT_DIR / 'targets.json'}")


if __name__ == "__main__":
    main()
