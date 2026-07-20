#!/usr/bin/env python3
"""ステップ4: Gemini によるスニペット判定。

out/snippets.json の各スニペットを gemini-3-flash-preview に投げ、
構造化出力(response_json_schema)で {species, city, caution, confidence}
を判定させる。結果は out/judgments.json に逐次保存(レジューム可能)。

- 環境変数 GEMINI_API_KEY が必要(Google AI Studio で取得)
- SDK不要(REST + requests)。単純分類なので thinking_level は low
- 429(レート制限)は待って再試行。中断してもリランで続きから

usage: python3 scripts/enrichment/04_judge_gemini.py
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
    "properties": {
        "species": {
            "type": "array",
            "items": {"type": "string", "enum": ["dog", "cat", "other"]},
        },
        "city": {"type": ["string", "null"]},
        "caution": {"type": ["string", "null"]},
        "confidence": {"type": "string", "enum": ["high", "low"]},
    },
    "required": ["species", "city", "caution", "confidence"],
    "additionalProperties": False,
}

PROMPT = """\
以下は日本の保護犬猫団体「{name}」({area}県内で活動)の公式サイトからの抜粋です。
この抜粋だけを根拠に、次の3点を判定してください。

1. species: 保護・譲渡の対象動物。犬なら "dog"、猫なら "cat"(両方なら両方)。
   犬猫以外が中心なら "other"。抜粋から判断できない場合は空配列。
2. city: 主な活動地域・拠点の市区町村名(例: "名古屋市")。複数あれば「・」で連結。
   都道府県名だけしか分からない場合や不明な場合は null。
3. caution: 譲渡・引取りに関する注意事項(例: 「飼えなくなった犬・猫の引取りは
   行っていません。」)。明記されている場合のみ50字以内で要約。なければ null。
   電話番号は絶対に含めないこと。

confidence: 上記の判定(特に species)が抜粋に明確な根拠を持つなら "high"、
推測を含むなら "low"。

--- ページタイトル ---
{title}
--- meta description ---
{description}
--- 本文抜粋 ---
{snippet}
"""


def judge(api_key, item, org):
    body = {
        "contents": [{
            "parts": [{
                "text": PROMPT.format(
                    name=org["name"],
                    area=org["area"],
                    title=item.get("title", ""),
                    description=item.get("description", ""),
                    snippet=item.get("snippet", ""),
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
        return json.loads(text)
    raise RuntimeError("リトライ上限に達しました(レート制限)")


def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("環境変数 GEMINI_API_KEY を設定してください")

    targets = {t["key"]: t for t in load_json(OUT_DIR / "targets.json")["targets"]}
    snippets = load_json(OUT_DIR / "snippets.json")
    out_path = OUT_DIR / "judgments.json"
    judgments = load_json(out_path) if out_path.exists() else {}

    todo = [
        (key, item)
        for key, item in sorted(snippets.items())
        if item["status"] == "ok" and key not in judgments
    ]
    print(f"判定対象: {len(todo)}件(判定済み {len(judgments)}件はスキップ)")

    for i, (key, item) in enumerate(todo, 1):
        try:
            result = judge(api_key, item, targets[key])
            judgments[key] = result
            print(f"  {i}/{len(todo)} {key}: {result['species']} "
                  f"city={result['city']} conf={result['confidence']}")
        except Exception as e:  # noqa: BLE001 - 1件の失敗で全体を止めない
            judgments[key] = {"error": f"{type(e).__name__}: {e}"}
            print(f"  {i}/{len(todo)} {key}: ERROR {e}")
        save_json(out_path, judgments)
        time.sleep(INTERVAL)

    ok = sum(1 for v in judgments.values() if "error" not in v)
    low = sum(1 for v in judgments.values() if v.get("confidence") == "low")
    print(f"完了: {ok}件判定 / うち low confidence {low}件 / "
          f"エラー {len(judgments) - ok}件")
    print(f"→ {out_path}")


if __name__ == "__main__":
    main()
