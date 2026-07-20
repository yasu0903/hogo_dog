"""お天気お散歩 Skill の共通処理。

パイプライン構成(各ステップは独立して再実行可能):
  01_fetch_weather.py    Open-Meteo hourly 予報を47都道府県ぶん取得 → out/01_raw.json
  02_analyze.py          確定ロジックで散歩◎/雨/高温・路面回避を抽出 → out/02_analysis.json
  03_summarize_gemini.py Gemini でコメント文のみ生成(逐次保存) → out/03_comments.json
  04_build_json.py       最終JSON組み立て → out/weather/{english_name}.json + index.json
  05_upload_s3.py        AWS S3 へ put(latest のみ上書き)

中間成果物はすべて out/ 以下のJSON。天気データ源は Open-Meteo(APIキー不要・無料)。
"""

import json
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT / "public" / "data"
OUT_DIR = Path(__file__).resolve().parent / "out"
POINTS_PATH = Path(__file__).resolve().parent / "prefecture_points.json"

JST = timezone(timedelta(hours=9))

USER_AGENT = (
    "Mozilla/5.0 (compatible; hogo-dog-weather/1.0; "
    "+https://github.com/yasu0903/hogo_dog)"
)


def jst_now():
    return datetime.now(JST)


def jst_today_iso():
    """当日(JST)の YYYY-MM-DD。"""
    return jst_now().strftime("%Y-%m-%d")


def load_points():
    """prefecture_points.json の代表地点リストを返す。"""
    return load_json(POINTS_PATH)["points"]


def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def save_json(path, obj):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )


def get_with_retry(url, params=None, tries=4, backoff=5.0, timeout=30):
    """GET をリトライ付きで実行。429/5xx は待って再試行。"""
    last_exc = None
    for attempt in range(tries):
        try:
            resp = requests.get(
                url,
                params=params,
                headers={"User-Agent": USER_AGENT},
                timeout=timeout,
            )
            if resp.status_code == 429 or resp.status_code >= 500:
                wait = backoff * (attempt + 1)
                print(f"    {resp.status_code} → {wait:.0f}s 待機して再試行")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp
        except requests.RequestException as e:  # noqa: PERF203
            last_exc = e
            wait = backoff * (attempt + 1)
            print(f"    {type(e).__name__} → {wait:.0f}s 待機して再試行")
            time.sleep(wait)
    raise RuntimeError(f"リトライ上限に達しました: {url}") from last_exc
