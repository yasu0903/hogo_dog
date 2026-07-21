#!/usr/bin/env python3
"""ステップ6: 団体の市区町村を前方ジオコーディングして座標を用意する（近い団体機能の基盤）。

各団体の `city`（市区町村）を国土地理院 AddressSearch API で座標化し、
`city_coords.json`（コミット対象のキャッシュ）に貯める。city が空の団体向けに
都道府県代表点 `pref_centroids.json`（同じくコミット対象）も生成する。
**org JSON には書き戻さない**（座標は city 名からの派生値。手管理ファイルを汚さない）。

- 出典: 国土地理院 AddressSearch API
  (https://msearch.gsi.go.jp/address-search/AddressSearch?q=県名+市区町村)
- 1req/秒に絞る（GSIへの負荷配慮）。既にキャッシュ済みのキーは再取得しない（差分のみ）。
- 半年ごとのデータ更新で `05_apply.py --write` の**後**に実行する想定（確定した city を読む）。

生成/更新するファイル（すべて scripts/enrichment/ 直下・**コミット対象**。out/ ではない。
理由: CIビルド(prebuild)が座標を search_index に注入するため、ビルド経路から外部APIを排除する）:
  city_coords.json      "{prefNo}/{city}" -> {lat,lng}   … 市区町村レベルの座標
  pref_centroids.json   "{prefNo}"        -> {lat,lng}   … city空団体のフォールバック
  manual_coords.json    "{prefNo}/{city}" -> {lat,lng}   … 手動上書き（本スクリプトは読むだけ）
  out/geocode_unresolved.json                             … 解決できなかった city（要レビュー）

usage:
  python3 scripts/enrichment/06_geocode.py            # 未キャッシュの city/県 を取得してキャッシュ更新
  python3 scripts/enrichment/06_geocode.py --dry-run  # API を叩かず、取得予定の件数だけ表示
"""

import sys
import time

import requests

from pathlib import Path

from common import DATA_DIR, OUT_DIR, iter_org_files, load_json, save_json

HERE = Path(__file__).resolve().parent
CITY_COORDS_PATH = HERE / "city_coords.json"
PREF_CENTROIDS_PATH = HERE / "pref_centroids.json"
MANUAL_COORDS_PATH = HERE / "manual_coords.json"

GEOCODER_URL = "https://msearch.gsi.go.jp/address-search/AddressSearch"
REQUEST_INTERVAL_SEC = 1.0  # 1秒1件
TIMEOUT = 20
USER_AGENT = (
    "Mozilla/5.0 (compatible; hogo-dog-geocoder/1.0; "
    "+https://github.com/yasu0903/hogo_dog)"
)


def geocode(query):
    """住所文字列 → {lat,lng}。解決できなければ None。"""
    resp = requests.get(
        GEOCODER_URL,
        params={"q": query},
        timeout=TIMEOUT,
        headers={"User-Agent": USER_AGENT},
    )
    resp.raise_for_status()
    results = resp.json()
    if not results:
        return None
    lng, lat = results[0]["geometry"]["coordinates"]
    return {"lat": round(lat, 6), "lng": round(lng, 6)}


def geocode_any(queries):
    """候補（複数市の各要素）を順に試し、最初に解決したものを返す。各試行が1API呼び出し。"""
    for q in queries:
        coord = geocode(q)
        time.sleep(REQUEST_INTERVAL_SEC)
        if coord:
            return coord
    return None


def load_if_exists(path):
    return load_json(path) if path.exists() else {}


def main():
    dry_run = "--dry-run" in sys.argv

    pref_list = load_json(DATA_DIR / "prefecture.json")["prefecture_list"]
    # english_name(slug) -> {no, name}
    pref_by_slug = {p["english_name"]: p for p in pref_list}

    city_coords = load_if_exists(CITY_COORDS_PATH)
    pref_centroids = load_if_exists(PREF_CENTROIDS_PATH)
    manual_coords = load_if_exists(MANUAL_COORDS_PATH)

    # 団体を走査し、ユニークな (prefNo, city) と、登場する prefNo を集める
    city_targets = {}  # "prefNo/city" -> query(県名+先頭市区町村)
    pref_nos = set()
    orgs_total = 0
    orgs_city = 0
    for slug, _path, data in iter_org_files():
        pref = pref_by_slug.get(slug)
        if not pref:
            continue
        pref_no, pref_name = pref["no"], pref["name"]
        pref_nos.add(pref_no)
        for org in data["organizations"]:
            orgs_total += 1
            city = (org.get("city") or "").strip()
            if not city:
                continue
            orgs_city += 1
            key = f"{pref_no}/{city}"
            # 複数市区町村（A市・B市）は各要素を順に候補にする（先頭が郡等で失敗しても次を試す）
            parts = [p.strip() for p in city.split("・") if p.strip()]
            city_targets.setdefault(key, [f"{pref_name}{p}" for p in parts])

    # 取得が必要なもの（キャッシュ・手動上書きに無いキーだけ）
    new_cities = {
        k: q for k, q in city_targets.items()
        if k not in city_coords and k not in manual_coords
    }
    new_prefs = {
        p["no"]: p["name"] for p in pref_list
        if p["no"] in pref_nos and p["no"] not in pref_centroids
    }

    print(f"団体総数={orgs_total}, city有={orgs_city}, ユニークcity={len(city_targets)}")
    print(f"新規ジオコーディング対象: city={len(new_cities)}件 / 県={len(new_prefs)}件")

    if dry_run:
        for k in sorted(new_cities):
            print(f"  [city] {k} ← {' / '.join(new_cities[k])}")
        for no in sorted(new_prefs):
            print(f"  [pref] {no} ← {new_prefs[no]}")
        print("dry-run: API は呼んでいません（--dry-run なしで実行すると取得します）")
        return

    unresolved = {}
    done = 0
    total = len(new_cities) + len(new_prefs)

    def flush():
        save_json(CITY_COORDS_PATH, city_coords)
        save_json(PREF_CENTROIDS_PATH, pref_centroids)

    try:
        for key, queries in new_cities.items():
            coord = geocode_any(queries)
            if coord:
                city_coords[key] = coord
            else:
                unresolved[key] = " / ".join(queries)
            done += 1
            if done % 20 == 0:
                print(f"  {done}/{total} 済")
                flush()

        for no, name in new_prefs.items():
            coord = geocode(name)
            time.sleep(REQUEST_INTERVAL_SEC)
            if coord:
                pref_centroids[no] = coord
            else:
                unresolved[f"pref:{no}"] = name
            done += 1
    except KeyboardInterrupt:
        print("\n中断されました。ここまでの結果を保存します（再実行でレジューム可能）。")
    finally:
        flush()

    if unresolved:
        save_json(OUT_DIR / "geocode_unresolved.json", unresolved)

    # カバレッジ計測（manual > city > pref のどのレベルで解決するか）
    city_level = pref_level = none_level = 0
    for slug, _path, data in iter_org_files():
        pref = pref_by_slug.get(slug)
        if not pref:
            continue
        pref_no = pref["no"]
        for org in data["organizations"]:
            city = (org.get("city") or "").strip()
            key = f"{pref_no}/{city}"
            if city and (key in manual_coords or key in city_coords):
                city_level += 1
            elif pref_no in pref_centroids:
                pref_level += 1
            else:
                none_level += 1

    print(
        f"カバレッジ: 市区町村レベル={city_level} / 県レベル(フォールバック)={pref_level}"
        f" / 未解決={none_level}"
    )
    if unresolved:
        print(f"未解決 {len(unresolved)}件 → {OUT_DIR / 'geocode_unresolved.json'}"
              f"（manual_coords.json で手当て可能）")
    print(f"→ {CITY_COORDS_PATH.name} / {PREF_CENTROIDS_PATH.name} を更新")


if __name__ == "__main__":
    main()
