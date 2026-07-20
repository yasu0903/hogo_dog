# お天気お散歩 Skill 実装計画

各都道府県のお天気を収集し、「犬の散歩に行くべき時間帯・雨の時間帯・路面が熱くて避けるべき時間帯」
が分かる JSON を生成して AWS S3 に転送する Skill。要約コメントは Gemini 3 flash preview を使う。

## 決定事項（確定）

| 項目 | 決定 |
| --- | --- |
| 天気データ源 | **Open-Meteo**（APIキー不要・無料・1時間ごとの予報） |
| 実装言語 | **Python**（`scripts/enrichment/` の作法に合わせる。`requests` で REST 直叩き） |
| 実行形態 | **手動起動の Skill**（`.claude/skills/weather-walk/`）。将来 cron 化の土台 |
| Gemini の役割 | **自然文コメント生成のみ**。時間帯判定はコードで確定的に算出 |
| 代表地点 | 各都道府県=**県庁所在地1点**で開始（将来 複数地点へ拡張可能） |
| S3 キー配置 | `weather/latest/{english_name}.json` + `weather/index.json`。**日付別保存はしない**（当日分のみ） |
| hourly 生データ | 最終 JSON に**含める**（フロントでのグラフ化に備える） |
| 路面温度の観点 | 気温・日射から路面リスクを推定し「何時まで控えるか(`avoid_until`)」を算出。Gemini コメントにも反映 |

## 全体像

```
Open-Meteo（1時間予報）
   ↓ 01_fetch_weather      47都道府県ぶん取得（キーなし・無料）
生データ out/01_raw.json
   ↓ 02_analyze            コードで確定的に判定
                           （散歩◎時間帯 / 雨時間帯 / 高温・路面回避）
構造化データ out/02_analysis.json
   ↓ 03_summarize_gemini   Gemini 3 flash preview で自然文コメントのみ生成（resumable）
   ↓ 04_build_json         最終JSON組み立て → out/weather/{english_name}.json + index.json
   ↓ 05_upload_s3          AWS S3 へ転送（latest のみ）
S3: weather/latest/{english_name}.json, weather/index.json
```

Gemini は数値判定に使わず**コメント文だけ**を書かせるため、出力が毎日ブレず低コスト。
散歩の良い時間帯・雨時間帯・路面高温回避はすべてコードで確定的に決定する。

## ファイル構成

```
scripts/weather/
  common.py                 # ROOT/OUT_DIR, load/save_json, JST日付, fetch retry, 都道府県読み込み
  prefecture_points.json    # 47都道府県の代表地点（県庁所在地）{ id, name, english_name, city, lat, lng }
  requirements.txt          # requests, boto3
  01_fetch_weather.py       # Open-Meteo hourly → out/01_raw.json（キャッシュ・再実行安全）
  02_analyze.py             # 確定ロジックで時間帯・路面リスク抽出 → out/02_analysis.json
  03_summarize_gemini.py    # コメント生成（GEMINI_API_KEY, 4秒間隔・429リトライ・逐次保存）→ out/03_comments.json
  04_build_json.py          # 最終JSON → out/weather/{english_name}.json + index.json
  05_upload_s3.py           # S3 へ put（boto3）

.claude/skills/weather-walk/SKILL.md   # 手動起動の手順書（env・実行順・レビュー観点）
```

`scripts/enrichment/` と同様、npm スクリプトには載せず `python3 scripts/weather/NN_*.py` で直接実行する。

## 各ステップ詳細

### 01_fetch_weather.py
`prefecture_points.json` の各地点で Open-Meteo forecast API を叩く。
- 取得項目（hourly）: `temperature_2m, apparent_temperature, precipitation,
  precipitation_probability, weathercode, windspeed_10m, uv_index, is_day`
- `timezone=Asia/Tokyo`、当日（JST）ぶん
- 生データを `out/01_raw.json` にキャッシュ（再実行で無駄打ちしない）

### 02_analyze.py（確定ロジック・犬の散歩向け）
- **雨時間帯 `rain_windows`**: `precipitation ≥ 0.1mm` または `precipitation_probability ≥ 50%` の連続ブロック
- **路面高温リスク `pavement`（追加要望）**:
  推定路面温度 ≒ 気温 + 日射補正（`weathercode` の晴れ/曇り・`uv_index`・`is_day` から係数）。
  肉球やけど目安として 気温25℃以上の晴天日中を危険域とし、
  「何時まで散歩を控えるべきか」を `avoid_until`（午後のピーク後に路面が冷めると推定される時刻）で表現。
  `{ "risk": true, "avoid_from": "10:00", "avoid_until": "18:00", "reason": "路面が熱く肉球やけどの恐れ" }`
- **散歩◎時間帯 `walk_windows`**: 日中(概ね5–19時)で「雨なし・体感温度が快適・強風でない・路面リスク帯でない」連続ブロック
- **回避時間帯 `avoid_windows`**: 高温(`type:"heat"`)・低温(`type:"cold"`)・強風(`type:"wind"`)の時間帯。冬の早朝低温も対象
- サマリ `summary`: 最高/最低気温、最大降水確率、天気概況

### 03_summarize_gemini.py
02 の構造化結果を渡し、`gemini-3-flash-preview` に**コメント1〜2文だけ**生成させる。
- 構造化出力 `response_json_schema`: `{ "comment": string }`
- 呼び出し・レート制御は `scripts/enrichment/04_judge_gemini.py` を踏襲（4秒間隔・429リトライ・`out/03_comments.json` に逐次保存でレジューム可）
- トーンは「親しみ×具体的の中間」をプロンプトで指定（ポエム調も機能説明調もNG）
- **路面温度の観点をコメントにも反映**: `pavement.risk` が真なら「◯時頃までは路面が熱いので散歩は控えめに」を含めるようプロンプト指示
- 電話番号等の個人情報は扱わない

### 04_build_json.py
都道府県ごとの最終 JSON と一覧用 `index.json` を生成（下記スキーマ）。

### 05_upload_s3.py
boto3 で S3 へ put。当日分のみ上書き。
- キー: `weather/latest/{english_name}.json`、`weather/index.json`
- `ContentType=application/json`、`CacheControl` を付与
- env: `WEATHER_S3_BUCKET`, `AWS_REGION`（認証は標準の credential chain / 環境変数）

## 出力 JSON スキーマ（1都道府県）

```json
{
  "prefecture_id": "13",
  "prefecture": "東京都",
  "english_name": "tokyo",
  "date": "2026-07-20",
  "generated_at": "2026-07-20T05:00:00+09:00",
  "source": "Open-Meteo",
  "location": { "point": "千代田区", "lat": 35.69, "lng": 139.75 },
  "summary": { "max_temp_c": 34, "min_temp_c": 26, "max_precip_prob": 60, "weather": "晴れ時々曇り" },
  "walk_windows":  [ { "start": "05:00", "end": "07:00", "reason": "涼しく雨の心配なし" } ],
  "avoid_windows": [ { "start": "11:00", "end": "15:00", "type": "heat", "reason": "高温・路面熱に注意" } ],
  "rain_windows":  [ { "start": "16:00", "end": "18:00", "max_precip_prob": 70 } ],
  "pavement": { "risk": true, "avoid_from": "10:00", "avoid_until": "18:00", "reason": "路面が熱く肉球やけどの恐れ" },
  "hourly": [
    { "time": "05:00", "temp_c": 26, "feels_c": 27, "precip_mm": 0, "precip_prob": 10, "weather": "晴れ", "wind_ms": 2, "uv": 0 }
  ],
  "comment": "朝の涼しいうちがおすすめ。日中は路面が熱くなるので18時頃まで待つと安心です。"
}
```

`index.json` は全都道府県のサマリ（`prefecture`, `english_name`, `summary`, `pavement.risk`, `comment` 抜粋）配列。

## 依存

- Python: `requests`（HTTP）, `boto3`（S3）→ `scripts/weather/requirements.txt`
- Open-Meteo はキー不要
- Gemini は既存の `GEMINI_API_KEY` を流用（Google AI Studio）
- S3 env: `WEATHER_S3_BUCKET`, `AWS_REGION`（認証済み前提）

## Skill（`.claude/skills/weather-walk/SKILL.md`）

手動起動の手順書。中身:
1. 必要 env の確認（`GEMINI_API_KEY`, `WEATHER_S3_BUCKET`, `AWS_REGION`）
2. `python3 scripts/weather/01_fetch_weather.py`
3. `02_analyze.py` → `03_summarize_gemini.py`
4. `04_build_json.py` 後、`out/weather/` を目視レビュー（コメント・路面判定の妥当性）
5. 問題なければ `05_upload_s3.py`

半自動で結果を確認しながら回し、将来の cron 化の土台にする。

## 未確定・実装時に詰める点

- `prefecture_points.json` の47都道府県の緯度経度（県庁所在地）を用意する
- 推定路面温度の係数（日射補正）の初期値はヒューリスティックで置き、実データ確認後に微調整
- 実際の S3 バケット名（env `WEATHER_S3_BUCKET` で受ける想定）
