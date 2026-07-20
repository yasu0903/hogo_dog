#!/usr/bin/env python3
"""Phase 2 データ移行スクリプト。

organizations/{prefecture}.json の note に混在している
「出典・活動市町村・犬猫の別・注意事項」を構造化フィールドに分解する。

  note → species / city / source_type / caution / note(残余)

処理の流れ:
  1. note を「。」「/」で分割し、セグメント単位でパターンマッチ
  2. パターンで解決できないセグメントは MANUAL_SEGMENTS で目視振り分け
  3. どちらにも該当しないセグメントを一覧出力(移行漏れの検出)
  4. 電話番号が紛れ込んでいないことを検証(既存方針: 電話番号は掲載しない)

usage:
  python3 scripts/migrate_phase2_notes.py          # dry-run(検証と未解決一覧のみ)
  python3 scripts/migrate_phase2_notes.py --write  # ファイルを書き換える
"""

import json
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "public" / "data"
ORG_DIR = DATA_DIR / "organizations"

# --- セグメント分類パターン ---------------------------------------------

# 出典: 「〜一覧より」「〜名簿より」等 → official
RE_OFFICIAL = re.compile(r"^(県|府|都|道).*(一覧|名簿|紹介ページ)より$")
# 出典: 「県公表の登録団体一覧はないため独自調査で掲載」等 → independent
RE_INDEPENDENT = re.compile(r"^(県|府|都|道)?公表の登録団体一覧はないため独自調査で掲載$")
# 所在都道府県のみの note(area と重複するため削除)
RE_PREF_ONLY = re.compile(r"^[一-龥]+[都道府県](、[一-龥]+[都道府県])*$")
# 活動地域: 「◯◯市」単独 / 「◯◯市で活動」「◯◯市を拠点に活動」等
RE_CITY_ONLY = re.compile(r"^[一-龥々ぁ-んァ-ヶー]+[市町村]$|^(東部|中部|西部)地域$")
RE_CITY_ACT = re.compile(
    r"^(?P<city>[一-龥々ぁ-んァ-ヶー・]+?(市|町|村|地域|地区|地方|エリア))"
    r"(を拠点に|で|を中心に)活動$"
)
RE_CITY_OFFICE = re.compile(r"^(?P<city>[一-龥々ぁ-んァ-ヶー・]+?(市|町|村))に事務局$")
# 注意事項
RE_CAUTION = re.compile(r"引取りは致しません")
# 登録番号(構造化対象外。note に残す)
RE_REG_NO = re.compile(r"^登録番号:")

# 犬猫の別
SPECIES_SEGMENTS = {
    "犬": ["dog"],
    "猫": ["cat"],
    "犬・猫": ["dog", "cat"],
    "犬の保護が中心": ["dog"],
    "保護猫の活動が中心": ["cat"],
}

# パターンで解決できなかったセグメントの目視振り分け。
# 値: 適用するフィールド。"note" は残余 note に残す文言。
MANUAL_SEGMENTS = {
    # 犬種特化の団体(犬種名は note に残す)
    "秋田犬の保護・譲渡が中心": {"species": ["dog"], "note": "秋田犬の保護・譲渡が中心"},
    "ボーダーコリーのみ": {"species": ["dog"], "note": "ボーダーコリーのみ"},
    "イングリッシュ・コッカー": {"species": ["dog"], "note": "イングリッシュ・コッカー"},
    "ゴールデンレトリバー": {"species": ["dog"], "note": "ゴールデンレトリバー"},
    "ラブラドール・ゴールデン等": {"species": ["dog"], "note": "ラブラドール・ゴールデン等"},
    "犬猫譲渡会の企画・運営": {"species": ["dog", "cat"], "note": "犬猫譲渡会の企画・運営"},
    # 犬猫以外(species は空のまま note に残す)
    "爬虫類の保護・譲渡が中心": {"note": "爬虫類の保護・譲渡が中心"},
    # 拠点+補足
    "名古屋市を拠点に東海地方で活動": {"city": "名古屋市", "note": "東海地方で活動"},
    "宜野湾市・うるま市でシェルターを運営": {"city": "宜野湾市・うるま市", "note": "シェルターを運営"},
    "有田町にシェルターを運営": {"city": "有田町", "note": "シェルターを運営"},
    "能勢町で動物保護施設を運営": {"city": "能勢町", "note": "動物保護施設を運営"},
    "県東部・富士五湖エリアで活動": {"city": "県東部・富士五湖エリア"},
    "県西部地区を中心に活動": {"city": "県西部地区"},
    "庄内地区で活動": {"city": "庄内地区"},
    # 活動内容の自由記述(note に残す)
    "行政と合同で譲渡会を開催": {"note": "行政と合同で譲渡会を開催"},
    "動物愛護センター・保健所・保護団体と協力して譲渡会を開催": {
        "note": "動物愛護センター・保健所・保護団体と協力して譲渡会を開催"
    },
    "岡山県動物愛護センターの譲渡事業と協働": {
        "note": "岡山県動物愛護センターの譲渡事業と協働"
    },
}

# 電話番号検出(市外局番始まりのハイフン区切り / 連続10-11桁)
RE_PHONE = re.compile(r"0\d{1,4}-\d{1,4}-\d{3,4}|(?<!\d)0\d{9,10}(?!\d)")


def split_segments(note):
    segs = []
    for part in re.split(r"[。/]", note.replace("／", "/")):
        part = part.strip()
        if part:
            segs.append(part)
    return segs


def merge_species(current, add):
    for s in add:
        if s not in current:
            current.append(s)
    return current


def migrate_org(org, default_source_type, unresolved, location):
    note = (org.get("note") or "").strip()
    result = {
        "species": [],
        "city": "",
        "source_type": default_source_type,
        "caution": "",
        "note": "",
    }
    leftover = []

    for seg in split_segments(note):
        if RE_INDEPENDENT.match(seg):
            result["source_type"] = "independent"
        elif RE_OFFICIAL.match(seg):
            result["source_type"] = "official"
        elif RE_PREF_ONLY.match(seg):
            pass  # 所在都道府県は area と重複するため破棄
        elif seg in SPECIES_SEGMENTS:
            merge_species(result["species"], SPECIES_SEGMENTS[seg])
        elif RE_CAUTION.search(seg):
            result["caution"] = seg if seg.endswith("。") else seg + "。"
        elif RE_REG_NO.match(seg):
            leftover.append(seg)
        elif RE_CITY_ONLY.match(seg):
            result["city"] = seg
        elif RE_CITY_ACT.match(seg):
            result["city"] = RE_CITY_ACT.match(seg).group("city")
        elif RE_CITY_OFFICE.match(seg):
            result["city"] = RE_CITY_OFFICE.match(seg).group("city")
        elif seg in MANUAL_SEGMENTS:
            rule = MANUAL_SEGMENTS[seg]
            if "species" in rule:
                merge_species(result["species"], rule["species"])
            if "city" in rule:
                result["city"] = rule["city"]
            if "note" in rule:
                leftover.append(rule["note"])
        else:
            unresolved.append((location, seg))
            leftover.append(seg)

    result["note"] = "。".join(leftover)
    return result


def migrate_file(path, source_by_no, unresolved):
    data = json.loads(path.read_text(encoding="utf-8"))
    source = source_by_no.get(data["no"], {})
    default_source_type = "official" if source.get("source_url") else "independent"

    new_orgs = []
    for org in data["organizations"]:
        fields = migrate_org(
            org, default_source_type, unresolved, f"{path.name}#{org['id']}"
        )
        new_orgs.append(
            {
                "id": org["id"],
                "name": org["name"],
                "area": org["area"],
                "city": fields["city"],
                "species": fields["species"],
                "source_type": fields["source_type"],
                "url": org.get("url", ""),
                "caution": fields["caution"],
                "note": fields["note"],
                "sns": org.get("sns", []),
            }
        )
    data["organizations"] = new_orgs
    return data


def verify_no_phone_numbers(data, path, errors):
    text = json.dumps(data, ensure_ascii=False)
    for m in RE_PHONE.finditer(text):
        errors.append(f"{path.name}: 電話番号らしき文字列を検出: {m.group(0)}")


def main():
    write = "--write" in sys.argv
    source_data = json.loads((DATA_DIR / "source.json").read_text(encoding="utf-8"))
    source_by_no = {s["no"]: s for s in source_data["source_list"]}

    unresolved = []
    errors = []
    migrated = {}
    total = 0

    for path in sorted(ORG_DIR.glob("*.json")):
        data = migrate_file(path, source_by_no, unresolved)
        verify_no_phone_numbers(data, path, errors)
        migrated[path] = data
        total += len(data["organizations"])

    print(f"対象: {len(migrated)}ファイル / {total}団体")

    if unresolved:
        print(f"\n未解決セグメント({len(unresolved)}件) → note に残しています:")
        for loc, seg in unresolved:
            print(f"  {loc}: {seg}")

    if errors:
        print("\n検証エラー:")
        for e in errors:
            print(f"  {e}")
        sys.exit(1)

    print("電話番号検証: OK")

    if write:
        for path, data in migrated.items():
            path.write_text(
                json.dumps(data, ensure_ascii=False, indent=4) + "\n",
                encoding="utf-8",
            )
        print("書き込み完了")
    else:
        print("dry-run(書き込みには --write を指定)")


if __name__ == "__main__":
    main()
