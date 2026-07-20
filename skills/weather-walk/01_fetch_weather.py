#!/usr/bin/env python3
"""ステップ1: Open-Meteo から各都道府県の当日1時間予報を取得。

prefecture_points.json の代表地点(県庁所在地)ごとに forecast API を叩き、
生データを out/01_raw.json にキャッシュする。Open-Meteo は APIキー不要・無料。

- hourly: temperature_2m, apparent_temperature, precipitation,
  precipitation_probability, weathercode, windspeed_10m, uv_index, is_day
- timezone=Asia/Tokyo、当日(JST)ぶんのみ(forecast_days=1)
- 再実行で無駄打ちしないよう、取得済みの地点は --force なしではスキップ

usage:
  python3 skills/weather-walk/01_fetch_weather.py
  python3 skills/weather-walk/01_fetch_weather.py --force   # 全地点を取り直す
"""

import sys
import time

from common import (
    OUT_DIR,
    get_with_retry,
    jst_today_iso,
    load_json,
    load_points,
    save_json,
)

ENDPOINT = "https://api.open-meteo.com/v1/forecast"
HOURLY = [
    "temperature_2m",
    "apparent_temperature",
    "precipitation",
    "precipitation_probability",
    "weathercode",
    "windspeed_10m",
    "uv_index",
    "is_day",
]
INTERVAL = 0.5  # Open-Meteo への配慮(無料枠)


def fetch_point(point):
    params = {
        "latitude": point["lat"],
        "longitude": point["lng"],
        "hourly": ",".join(HOURLY),
        "timezone": "Asia/Tokyo",
        "forecast_days": 1,
        "windspeed_unit": "ms",
    }
    resp = get_with_retry(ENDPOINT, params=params)
    return resp.json()


def main():
    force = "--force" in sys.argv[1:]
    points = load_points()
    today = jst_today_iso()

    out_path = OUT_DIR / "01_raw.json"
    cache = load_json(out_path) if out_path.exists() else {}
    # 日付が変わっていたらキャッシュを破棄(当日分のみ扱う)
    if cache.get("date") != today:
        cache = {"date": today, "points": {}}

    stored = cache["points"]
    todo = [p for p in points if force or p["english_name"] not in stored]
    print(f"取得対象: {len(todo)}地点(取得済み {len(stored)}地点はスキップ)"
          f" / date={today}")

    for i, point in enumerate(todo, 1):
        slug = point["english_name"]
        try:
            raw = fetch_point(point)
            stored[slug] = {"point": point, "raw": raw}
            print(f"  {i}/{len(todo)} {slug}({point['city']}) OK")
        except Exception as e:  # noqa: BLE001 - 1地点の失敗で全体を止めない
            stored[slug] = {"point": point, "error": f"{type(e).__name__}: {e}"}
            print(f"  {i}/{len(todo)} {slug}: ERROR {e}")
        save_json(out_path, cache)
        time.sleep(INTERVAL)

    ok = sum(1 for v in stored.values() if "error" not in v)
    print(f"完了: {ok}地点取得 / エラー {len(stored) - ok}地点 → {out_path}")


if __name__ == "__main__":
    main()
