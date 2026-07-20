#!/usr/bin/env python3
"""ステップ3: Gemini で散歩コメント文のみ生成。

out/02_analysis.json の構造化結果を gemini-3-flash-preview に渡し、
飼い主向けの短いコメント(1〜2文)だけを書かせる。数値判定はコード側で
確定済みなので、Gemini は自然文の生成のみに使う(出力が毎日ブレず低コスト)。

- 環境変数 GEMINI_API_KEY が必要(Google AI Studio で取得)
- SDK不要(REST + requests)。4秒間隔・429リトライ・out/03_comments.json に逐次保存
- 路面高温リスク(pavement.risk)が真ならコメントにも「◯時頃まで路面が熱い」を反映
- 電話番号等の個人情報は扱わない

usage: python3 skills/weather-walk/03_summarize_gemini.py
"""

import json
import os
import sys
import time

import requests

from common import OUT_DIR, load_json, save_json

MODEL = "gemini-3-flash-preview"
ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
)
INTERVAL = 4.0  # 15 RPM 以内(無料枠を想定)

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {"comment": {"type": "string"}},
    "required": ["comment"],
    "additionalProperties": False,
}

PROMPT = """\
あなたは犬の飼い主向けに「今日のお散歩アドバイス」を書くアシスタントです。
以下は{prefecture}({point})の本日の天気分析(コードで確定済み)です。
これを根拠に、散歩の飼い主向けコメントを日本語で1〜2文だけ書いてください。

トーンは「親しみやすさ」と「具体的な実用情報」の中間。ポエム調も、
機能説明のような硬い文章も避けること。おすすめ時間帯や注意点を具体的に。
路面が熱いリスク(pavement.risk が true)がある場合は、何時頃まで散歩を
控えると安心かを必ず一言添えること。天気が良く終日問題ない日は前向きに。
電話番号など個人情報は絶対に含めないこと。

--- 天気分析(JSON) ---
{analysis}
"""


def summarize(api_key, result):
    # コメント生成に必要な要素だけ渡す(hourly 全量は冗長なので省く)
    payload = {
        "summary": result["summary"],
        "walk_windows": result["walk_windows"],
        "avoid_windows": result["avoid_windows"],
        "rain_windows": result["rain_windows"],
        "pavement": result["pavement"],
    }
    body = {
        "contents": [{
            "parts": [{
                "text": PROMPT.format(
                    prefecture=result["prefecture"],
                    point=result["location"]["point"],
                    analysis=json.dumps(payload, ensure_ascii=False),
                )
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseJsonSchema": RESPONSE_SCHEMA,
            "thinkingConfig": {"thinkingLevel": "low"},
        },
    }
    for attempt in range(5):
        resp = requests.post(
            ENDPOINT,
            headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
            json=body,
            timeout=60,
        )
        if resp.status_code == 429:
            wait = 30 * (attempt + 1)
            print(f"    429 rate limit → {wait}s 待機")
            time.sleep(wait)
            continue
        if resp.status_code == 400 and "thinking" in resp.text.lower():
            body["generationConfig"].pop("thinkingConfig", None)
            continue
        resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)["comment"].strip()
    raise RuntimeError("リトライ上限に達しました(レート制限)")


def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("環境変数 GEMINI_API_KEY を設定してください")

    analysis = load_json(OUT_DIR / "02_analysis.json")
    results = analysis["results"]
    out_path = OUT_DIR / "03_comments.json"
    comments = load_json(out_path) if out_path.exists() else {}
    # 日付が変わっていたらコメントを作り直す
    if comments.get("date") != analysis.get("date"):
        comments = {"date": analysis.get("date"), "comments": {}}
    store = comments["comments"]

    todo = [(slug, r) for slug, r in sorted(results.items()) if slug not in store]
    print(f"コメント生成対象: {len(todo)}件(生成済み {len(store)}件はスキップ)")

    for i, (slug, result) in enumerate(todo, 1):
        try:
            store[slug] = {"comment": summarize(api_key, result)}
            print(f"  {i}/{len(todo)} {slug}: {store[slug]['comment']}")
        except Exception as e:  # noqa: BLE001 - 1件の失敗で全体を止めない
            store[slug] = {"error": f"{type(e).__name__}: {e}"}
            print(f"  {i}/{len(todo)} {slug}: ERROR {e}")
        save_json(out_path, comments)
        time.sleep(INTERVAL)

    ok = sum(1 for v in store.values() if "error" not in v)
    print(f"完了: {ok}件生成 / エラー {len(store) - ok}件 → {out_path}")


if __name__ == "__main__":
    main()
