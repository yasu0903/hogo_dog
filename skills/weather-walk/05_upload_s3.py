#!/usr/bin/env python3
"""ステップ5: 最終JSONを AWS S3 へ転送(latest のみ上書き)。

out/weather/ の各JSONを S3 に put する。日付別保存はせず、当日分で上書きする。

キー配置:
  weather/latest/{english_name}.json
  weather/index.json

認証は boto3 の標準 credential chain(環境変数 / ~/.aws / IAM ロール)に委ねる。

env:
  WEATHER_S3_BUCKET   転送先バケット名(必須)
  AWS_REGION          リージョン(任意。未設定なら boto3 のデフォルト)
  WEATHER_S3_PREFIX   キーの接頭辞(任意。既定 "weather")
  WEATHER_CACHE_MAX_AGE  Cache-Control の max-age 秒(任意。既定 1800)

usage:
  python3 skills/weather-walk/05_upload_s3.py            # 目視レビュー後に実行
  python3 skills/weather-walk/05_upload_s3.py --dry-run  # 転送せず対象を表示
"""

import os
import sys

from common import OUT_DIR, load_json


def main():
    dry_run = "--dry-run" in sys.argv[1:]

    bucket = os.environ.get("WEATHER_S3_BUCKET")
    if not bucket and not dry_run:
        sys.exit("環境変数 WEATHER_S3_BUCKET を設定してください")

    prefix = os.environ.get("WEATHER_S3_PREFIX", "weather").strip("/")
    max_age = int(os.environ.get("WEATHER_CACHE_MAX_AGE", "1800"))
    cache_control = f"public, max-age={max_age}"

    weather_dir = OUT_DIR / "weather"
    index_path = weather_dir / "index.json"
    if not index_path.exists():
        sys.exit("out/weather/index.json がありません。先に 04_build_json.py を実行してください")

    # 転送対象: index.json は weather/index.json、各都道府県は weather/latest/{slug}.json
    jobs = []
    jobs.append((index_path, f"{prefix}/index.json"))
    for path in sorted(weather_dir.glob("*.json")):
        if path.name == "index.json":
            continue
        jobs.append((path, f"{prefix}/latest/{path.name}"))

    date = load_json(index_path).get("date")
    print(f"転送対象: {len(jobs)}ファイル / date={date} / bucket={bucket or '(dry-run)'}")

    if dry_run:
        for path, key in jobs:
            print(f"  DRY s3://{bucket or '<BUCKET>'}/{key}")
        print("dry-run のため転送しませんでした")
        return

    import boto3  # 遅延インポート(dry-run では boto3 不要)

    region = os.environ.get("AWS_REGION")
    s3 = boto3.client("s3", region_name=region) if region else boto3.client("s3")

    for i, (path, key) in enumerate(jobs, 1):
        s3.put_object(
            Bucket=bucket,
            Key=key,
            Body=path.read_bytes(),
            ContentType="application/json",
            CacheControl=cache_control,
        )
        print(f"  {i}/{len(jobs)} s3://{bucket}/{key}")

    print(f"完了: {len(jobs)}ファイルを s3://{bucket}/{prefix}/ に転送しました")


if __name__ == "__main__":
    main()
