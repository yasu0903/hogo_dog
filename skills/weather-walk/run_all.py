#!/usr/bin/env python3
"""weather-walk パイプライン一括実行(GitHub Actions / 手動 共通エントリ)。

01→05 を順に実行する。無人運用のため、05(S3 転送)の前に検証ゲートを挟む
(旧・目視レビューの代替):
  - out/weather/index.json の date が当日(JST)であること
  - comment 空の都道府県が閾値(WEATHER_MAX_EMPTY_COMMENTS, 既定 5)以下であること
検証に落ちたら 05 を実行せず非ゼロ終了する(= CI を fail させ、古い/欠損データを
本番へ put しない)。

各ステップは自身のディレクトリ基準で out/ に読み書きするため、実行時の cwd は問わない。

usage:
  python3 skills/weather-walk/run_all.py                # 01→05(本番: S3 put まで)
  python3 skills/weather-walk/run_all.py --dry-run      # 05 を --dry-run(put しない)
  python3 skills/weather-walk/run_all.py --skip-upload  # 05 を実行しない(生成のみ)
  python3 skills/weather-walk/run_all.py --no-comment   # 一言コメント(03/Gemini)を止める
  python3 skills/weather-walk/run_all.py --force        # 01 を --force(全地点取り直し)

env:
  GEMINI_API_KEY              03 で必須(--no-comment / WEATHER_SKIP_COMMENT=1 時は不要)
  WEATHER_S3_BUCKET           05 で必須(--dry-run/--skip-upload 時は不要)
  AWS_REGION / WEATHER_S3_PREFIX / WEATHER_CACHE_MAX_AGE   05 で任意
  WEATHER_MAX_EMPTY_COMMENTS  検証ゲートの空コメント許容数(既定 5)
  WEATHER_SKIP_COMMENT        "1" で一言コメントをスキップ(--no-comment と等価)
"""

import os
import subprocess
import sys

from common import OUT_DIR, jst_today_iso, load_json

HERE = os.path.dirname(os.path.abspath(__file__))


def run_step(script, *args):
    path = os.path.join(HERE, script)
    label = " ".join([script, *args]).strip()
    print(f"\n=== {label} ===", flush=True)
    subprocess.run([sys.executable, path, *args], check=True)


def validate_before_upload(require_comments=True):
    """05 前の検証ゲート。問題があれば理由文字列を、OK なら None を返す。

    require_comments=False(コメント意図的スキップ時)は空コメント判定を行わない。
    """
    index_path = OUT_DIR / "weather" / "index.json"
    if not index_path.exists():
        return "out/weather/index.json が生成されていません(04 失敗?)"
    index = load_json(index_path)

    today = jst_today_iso()
    if index.get("date") != today:
        return f"index.json の date={index.get('date')} が当日({today})と不一致"

    prefectures = index.get("prefectures", [])
    if not prefectures:
        return "index.json に都道府県が1件もありません"

    if require_comments:
        empty = [p["english_name"] for p in prefectures if not p.get("comment")]
        max_empty = int(os.environ.get("WEATHER_MAX_EMPTY_COMMENTS", "5"))
        if len(empty) > max_empty:
            return (f"comment 空の都道府県が {len(empty)}件で許容 {max_empty}件を超過"
                    f": {', '.join(empty)}")
        if empty:
            print(f"注意: comment 空 {len(empty)}件(許容内): {', '.join(empty)}")
    return None


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    skip_upload = "--skip-upload" in args
    force = "--force" in args
    skip_comment = "--no-comment" in args or os.environ.get("WEATHER_SKIP_COMMENT") == "1"

    run_step("01_fetch_weather.py", *(["--force"] if force else []))
    run_step("02_analyze.py")
    if skip_comment:
        print("\n一言コメント生成(03)をスキップ(--no-comment / WEATHER_SKIP_COMMENT=1)")
    else:
        run_step("03_summarize_gemini.py")
    run_step("04_build_json.py")

    reason = validate_before_upload(require_comments=not skip_comment)
    if reason:
        sys.exit(f"検証ゲート NG → S3 転送を中止します: {reason}")
    print("\n検証ゲート OK")

    if skip_upload:
        print("--skip-upload 指定のため 05(S3 転送)は実行しません")
        return

    run_step("05_upload_s3.py", *(["--dry-run"] if dry_run else []))
    print("\nパイプライン完了")


if __name__ == "__main__":
    main()
