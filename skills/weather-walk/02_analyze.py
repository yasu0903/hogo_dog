#!/usr/bin/env python3
"""ステップ2: 確定ロジックで犬の散歩向けの時間帯を抽出。

out/01_raw.json の1時間予報から、都道府県ごとに以下をコードで確定的に算出する
(Gemini は使わない = 数値判定は毎日ブレない)。

- rain_windows   : 雨の時間帯(precip >= 0.1mm または 降水確率 >= 50%)
- pavement       : 路面高温リスク(気温+日射から推定。肉球やけど回避の avoid_until)
- walk_windows   : 散歩◎時間帯(日中・雨なし・体感快適・強風でない・路面リスク帯でない)
- avoid_windows  : 回避時間帯(heat / cold / wind)
- summary        : 最高/最低気温・最大降水確率・天気概況
- hourly         : グラフ化用に整形した1時間データ

結果は out/02_analysis.json。

usage: python3 skills/weather-walk/02_analyze.py
"""

from collections import Counter

from common import OUT_DIR, load_json, save_json

# --- しきい値(初期値はヒューリスティック。実データ確認後に微調整) ---
RAIN_PRECIP_MM = 0.1        # これ以上の降水量は「雨」
RAIN_PROB_PCT = 50          # これ以上の降水確率は「雨」
WALK_HOUR_START = 5         # 散歩候補にする日中の開始時刻
WALK_HOUR_END = 19          # 〃 終了時刻(この時刻の手前まで)
COMFORT_FEELS_MIN = 3       # 体感温度の快適下限(℃)
COMFORT_FEELS_MAX = 28      # 〃 上限(℃)。犬は暑さに弱いので低め
STRONG_WIND_MS = 8          # 強風とみなす風速(m/s)
HEAT_FEELS = 30             # 高温回避の体感しきい値(℃)
COLD_FEELS = 2              # 低温回避の体感しきい値(℃)
PAVEMENT_TEMP_C = 25        # 路面高温リスクの気温しきい値(℃)
PAVEMENT_COOLDOWN_H = 2     # 日射が消えてから路面が冷めるまでの残熱時間

# WMO weather code → (日本語ラベル, カテゴリ)
WMO = {
    0: ("快晴", "clear"),
    1: ("晴れ", "clear"),
    2: ("晴れ時々曇り", "cloud"),
    3: ("曇り", "cloud"),
    45: ("霧", "fog"), 48: ("霧", "fog"),
    51: ("霧雨", "rain"), 53: ("霧雨", "rain"), 55: ("霧雨", "rain"),
    56: ("着氷性の霧雨", "rain"), 57: ("着氷性の霧雨", "rain"),
    61: ("弱い雨", "rain"), 63: ("雨", "rain"), 65: ("強い雨", "rain"),
    66: ("みぞれ", "rain"), 67: ("みぞれ", "rain"),
    71: ("弱い雪", "snow"), 73: ("雪", "snow"), 75: ("強い雪", "snow"),
    77: ("霧雪", "snow"),
    80: ("にわか雨", "rain"), 81: ("にわか雨", "rain"), 82: ("激しいにわか雨", "rain"),
    85: ("にわか雪", "snow"), 86: ("にわか雪", "snow"),
    95: ("雷雨", "thunder"), 96: ("雷雨", "thunder"), 99: ("雷雨", "thunder"),
}

CAT_LABEL = {
    "clear": "晴れ", "cloud": "曇り", "fog": "霧",
    "rain": "雨", "snow": "雪", "thunder": "雷雨",
}


def fmt(h):
    return f"{h:02d}:00"


def wmo_label(code):
    return WMO.get(code, ("不明", "cloud"))[0]


def wmo_cat(code):
    return WMO.get(code, ("不明", "cloud"))[1]


def parse_hours(raw):
    """Open-Meteo の hourly 配列 → 時刻順の dict リストに整形。"""
    h = raw["hourly"]
    times = h["time"]
    rows = []
    for i, t in enumerate(times):
        hour = int(t[11:13])  # "2026-07-20T05:00" → 5

        def g(key):
            v = h.get(key)
            return v[i] if v is not None and i < len(v) else None

        rows.append({
            "hour": hour,
            "time": fmt(hour),
            "temp_c": g("temperature_2m"),
            "feels_c": g("apparent_temperature"),
            "humidity": g("relativehumidity_2m"),
            "precip_mm": g("precipitation"),
            "precip_prob": g("precipitation_probability"),
            "code": g("weathercode"),
            "wind_ms": g("windspeed_10m"),
            "uv": g("uv_index"),
            "is_day": g("is_day"),
        })
    return rows


def group_blocks(rows, predicate):
    """predicate(row) が真の連続ブロックを [(rows,), ...] で返す。"""
    blocks, cur = [], []
    for r in rows:
        if predicate(r):
            cur.append(r)
        elif cur:
            blocks.append(cur)
            cur = []
    if cur:
        blocks.append(cur)
    return blocks


def block_range(block):
    """ブロック → (start, end)。end は最終時刻の1時間後。"""
    start = block[0]["hour"]
    end = block[-1]["hour"] + 1
    return fmt(start), fmt(min(end, 24))


def is_rain(r):
    return (r["precip_mm"] or 0) >= RAIN_PRECIP_MM or \
           (r["precip_prob"] or 0) >= RAIN_PROB_PCT


def is_pavement_hot(r):
    """日中の晴れ〜薄曇りで気温が高い時間 = 路面が熱い。"""
    return bool(r["is_day"]) and (r["temp_c"] or 0) >= PAVEMENT_TEMP_C and \
        wmo_cat(r["code"]) in ("clear", "cloud", "fog")


def analyze_point(entry):
    rows = parse_hours(entry["raw"])
    point = entry["point"]

    # --- 雨時間帯 ---
    rain_windows = []
    for block in group_blocks(rows, is_rain):
        start, end = block_range(block)
        rain_windows.append({
            "start": start, "end": end,
            "max_precip_prob": max((r["precip_prob"] or 0) for r in block),
        })

    # --- 路面高温リスク ---
    hot_hours = [r for r in rows if is_pavement_hot(r)]
    if hot_hours:
        avoid_from = hot_hours[0]["hour"]
        # 日射が消えてからも残熱があるため、最後の高温時刻+残熱時間まで控える
        avoid_until = min(hot_hours[-1]["hour"] + PAVEMENT_COOLDOWN_H, 20)
        pavement = {
            "risk": True,
            "avoid_from": fmt(avoid_from),
            "avoid_until": fmt(avoid_until),
            "reason": "路面が熱く肉球やけどの恐れ",
        }
    else:
        pavement = {"risk": False}

    def in_pavement_band(r):
        if not pavement["risk"]:
            return False
        f = int(pavement["avoid_from"][:2])
        u = int(pavement["avoid_until"][:2])
        return f <= r["hour"] < u

    # --- 散歩◎時間帯 ---
    def is_good_walk(r):
        if not (WALK_HOUR_START <= r["hour"] < WALK_HOUR_END):
            return False
        if is_rain(r):
            return False
        feels = r["feels_c"]
        if feels is None or not (COMFORT_FEELS_MIN <= feels <= COMFORT_FEELS_MAX):
            return False
        if (r["wind_ms"] or 0) >= STRONG_WIND_MS:
            return False
        if in_pavement_band(r):
            return False
        return True

    walk_windows = []
    for block in group_blocks(rows, is_good_walk):
        start, end = block_range(block)
        walk_windows.append({
            "start": start, "end": end,
            "reason": "涼しく雨の心配なし",
        })

    # --- 回避時間帯(heat / cold / wind) ---
    def classify(r):
        feels = r["feels_c"] or 0
        if feels >= HEAT_FEELS or in_pavement_band(r):
            return "heat"
        if feels <= COLD_FEELS:
            return "cold"
        if (r["wind_ms"] or 0) >= STRONG_WIND_MS:
            return "wind"
        return None

    avoid_windows = []
    for kind, reason in (
        ("heat", "高温・路面熱に注意"),
        ("cold", "冷え込みに注意"),
        ("wind", "強風に注意"),
    ):
        for block in group_blocks(rows, lambda r, k=kind: classify(r) == k):
            start, end = block_range(block)
            avoid_windows.append({
                "start": start, "end": end, "type": kind, "reason": reason,
            })
    avoid_windows.sort(key=lambda w: w["start"])

    # --- サマリ ---
    temps = [r["temp_c"] for r in rows if r["temp_c"] is not None]
    probs = [r["precip_prob"] or 0 for r in rows]
    day_codes = [r["code"] for r in rows if r["is_day"] and r["code"] is not None]
    summary = {
        "max_temp_c": round(max(temps)) if temps else None,
        "min_temp_c": round(min(temps)) if temps else None,
        "max_precip_prob": max(probs) if probs else 0,
        "weather": summarize_weather(day_codes or [r["code"] for r in rows]),
    }

    hourly = [{
        "time": r["time"],
        "temp_c": round(r["temp_c"], 1) if r["temp_c"] is not None else None,
        "feels_c": round(r["feels_c"], 1) if r["feels_c"] is not None else None,
        "humidity": round(r["humidity"]) if r["humidity"] is not None else None,
        "precip_mm": r["precip_mm"],
        "precip_prob": r["precip_prob"],
        "weather": wmo_label(r["code"]) if r["code"] is not None else None,
        "wind_ms": r["wind_ms"],
        "uv": r["uv"],
    } for r in rows]

    return {
        "prefecture_id": point["id"],
        "prefecture": point["name"],
        "english_name": point["english_name"],
        "location": {"point": point["city"], "lat": point["lat"], "lng": point["lng"]},
        "summary": summary,
        "walk_windows": walk_windows,
        "avoid_windows": avoid_windows,
        "rain_windows": rain_windows,
        "pavement": pavement,
        "hourly": hourly,
    }


def summarize_weather(codes):
    """日中の weathercode 群 → "晴れ時々曇り" のような概況テキスト。"""
    cats = [wmo_cat(c) for c in codes if c is not None]
    if not cats:
        return "不明"
    counts = Counter(cats)
    ranked = [cat for cat, _ in counts.most_common()]
    top = ranked[0]
    label = CAT_LABEL.get(top, top)
    # 雨・雪・雷雨が混じるなら明示的に併記
    for severe in ("thunder", "rain", "snow"):
        if severe in counts and severe != top:
            return f"{label}時々{CAT_LABEL[severe]}"
    if len(ranked) >= 2:
        second = CAT_LABEL.get(ranked[1], ranked[1])
        if second != label:
            return f"{label}時々{second}"
    return label


def main():
    raw = load_json(OUT_DIR / "01_raw.json")
    date = raw.get("date")
    results = {}
    skipped = []
    for slug, entry in sorted(raw["points"].items()):
        if "error" in entry:
            skipped.append(slug)
            continue
        results[slug] = analyze_point(entry)

    out = {"date": date, "results": results}
    out_path = OUT_DIR / "02_analysis.json"
    save_json(out_path, out)
    print(f"分析完了: {len(results)}都道府県 / スキップ(取得エラー) {len(skipped)}件"
          f" → {out_path}")
    if skipped:
        print(f"  スキップ: {', '.join(skipped)}")


if __name__ == "__main__":
    main()
