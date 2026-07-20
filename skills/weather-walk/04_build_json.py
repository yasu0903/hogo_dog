#!/usr/bin/env python3
"""ステップ4: 最終JSONと一覧用 index.json を組み立てる。

out/02_analysis.json(確定ロジックの結果)と out/03_comments.json(Gemini コメント)
をマージし、都道府県ごとの最終JSONと全国サマリの index.json を出力する。

出力:
  out/weather/{english_name}.json  … 1都道府県ぶん(S3 の weather/latest/ に対応)
  out/weather/index.json           … 全都道府県のサマリ配列

コメント未生成(03 未実行/失敗)の都道府県は comment を空文字で出力する。

usage: python3 skills/weather-walk/04_build_json.py
"""

from common import OUT_DIR, jst_now, load_json, save_json


def main():
    analysis = load_json(OUT_DIR / "02_analysis.json")
    date = analysis["date"]
    results = analysis["results"]

    comments_path = OUT_DIR / "03_comments.json"
    comments = {}
    if comments_path.exists():
        data = load_json(comments_path)
        if data.get("date") == date:
            comments = data.get("comments", {})
        else:
            print("警告: 03_comments.json の日付が分析と不一致。コメントは空にします")
    else:
        print("警告: 03_comments.json がありません。コメントは空で出力します")

    generated_at = jst_now().replace(microsecond=0).isoformat()
    out_dir = OUT_DIR / "weather"
    index = []

    for slug, result in sorted(results.items()):
        comment = comments.get(slug, {}).get("comment", "")
        doc = {
            "prefecture_id": result["prefecture_id"],
            "prefecture": result["prefecture"],
            "english_name": slug,
            "date": date,
            "generated_at": generated_at,
            "source": "Open-Meteo",
            "location": result["location"],
            "summary": result["summary"],
            "walk_windows": result["walk_windows"],
            "avoid_windows": result["avoid_windows"],
            "rain_windows": result["rain_windows"],
            "pavement": result["pavement"],
            "hourly": result["hourly"],
            "comment": comment,
        }
        save_json(out_dir / f"{slug}.json", doc)

        index.append({
            "prefecture_id": result["prefecture_id"],
            "prefecture": result["prefecture"],
            "english_name": slug,
            "summary": result["summary"],
            "pavement_risk": result["pavement"]["risk"],
            "comment": comment,
        })

    index_doc = {
        "date": date,
        "generated_at": generated_at,
        "source": "Open-Meteo",
        "count": len(index),
        "prefectures": index,
    }
    save_json(out_dir / "index.json", index_doc)

    with_comment = sum(1 for e in index if e["comment"])
    print(f"組み立て完了: {len(index)}都道府県 "
          f"(コメント付き {with_comment}件) → {out_dir}/")
    print(f"  index.json / {{english_name}}.json ×{len(index)}")


if __name__ == "__main__":
    main()
