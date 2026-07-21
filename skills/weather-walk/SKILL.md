---
name: weather-walk
description: 各都道府県の当日天気を Open-Meteo から収集し、犬の散歩に最適な時間帯・雨の時間帯・路面が熱く避けるべき時間帯を判定した JSON を生成して AWS S3 に転送する。要約コメントは Gemini で生成。手動起動(半自動)で結果を確認しながら回す。
---

# お天気お散歩(weather-walk)

各都道府県の代表地点(県庁所在地)の当日天気を収集し、飼い主向けに
「散歩◎の時間帯 / 雨の時間帯 / 路面が熱くて避けるべき時間帯」が分かる JSON を
生成して AWS S3 に転送する。時間帯判定はコードで確定的に算出し、Gemini は
自然文コメントの生成のみに使う(数値がブレず低コスト)。

スクリプト一式はこのディレクトリ(`skills/weather-walk/`)にある。
中間成果物はすべて `skills/weather-walk/out/` 以下の JSON。

## パイプライン

```
Open-Meteo(1時間予報・APIキー不要)
  ↓ 01_fetch_weather.py     47都道府県ぶん取得 → out/01_raw.json
  ↓ 02_analyze.py           確定ロジックで判定 → out/02_analysis.json
  ↓ 03_summarize_gemini.py  Gemini でコメント文のみ生成 → out/03_comments.json
  ↓ 04_build_json.py        最終JSON組み立て → out/weather/{english_name}.json + index.json
  ↓ 05_upload_s3.py         S3 へ put(latest のみ上書き)
S3: weather/latest/{english_name}.json, weather/index.json
```

`scripts/enrichment/` と同様、npm スクリプトには載せず `python3` で直接実行する。
各ステップは再実行安全(01・03 は取得/生成済みをスキップしてレジューム可)。

## 事前準備

- 依存インストール: `pip install -r skills/weather-walk/requirements.txt`
  (`requests` は 01/03、`boto3` は 05 で使用)
- 環境変数
  - `GEMINI_API_KEY` … 03 で必須(Google AI Studio)
  - `WEATHER_S3_BUCKET` … 05 で必須(転送先バケット)
  - `AWS_REGION` … 05 で任意(未設定なら boto3 デフォルト)
  - `WEATHER_S3_PREFIX` … 任意(既定 `weather`)
  - AWS 認証は boto3 の標準 credential chain(環境変数 / `~/.aws` / IAM ロール)に委ねる

## 実行手順(手動・半自動)

作業ディレクトリはリポジトリルート。スクリプトは `skills/weather-walk/` から相対で
`out/` を作るため、下記のように直接パス指定で実行する。

1. **天気取得**
   ```bash
   python3 skills/weather-walk/01_fetch_weather.py
   # 全地点を取り直す場合: --force
   ```
2. **確定ロジックで分析**
   ```bash
   python3 skills/weather-walk/02_analyze.py
   ```
3. **コメント生成(Gemini)**
   ```bash
   GEMINI_API_KEY=... python3 skills/weather-walk/03_summarize_gemini.py
   ```
4. **最終JSON組み立て**
   ```bash
   python3 skills/weather-walk/04_build_json.py
   ```
   → `out/weather/` を**目視レビュー**する(下記の観点)。
5. **S3 へ転送**(レビューOKなら)
   ```bash
   # まず対象確認
   python3 skills/weather-walk/05_upload_s3.py --dry-run
   # 問題なければ転送(latest を上書き)
   WEATHER_S3_BUCKET=... AWS_REGION=... python3 skills/weather-walk/05_upload_s3.py
   ```

## レビュー観点(04 実行後 / 転送前)

- `pavement.risk` と `avoid_from`/`avoid_until` が妥当か(夏の高温日に路面回避が
  出ているか、冬・雨天日に誤検知していないか)
- `walk_windows` が現実的か(早朝・夕方など涼しい時間帯に出ているか)
- `comment` のトーン(親しみ×具体の中間)と内容が分析と矛盾していないか、
  路面リスク時に「◯時頃まで控える」旨が入っているか
- 電話番号など個人情報が混入していないこと
- `03` が途中失敗した都道府県は `comment` が空になる。必要なら `03` を再実行
  (生成済みはスキップされる)してから `04` をやり直す

## データ源・ライセンス

- 天気: **Open-Meteo**(APIキー不要・無料)。`source` フィールドに明記
- コメント: **gemini-3.1-flash-lite**(自然文のみ。数値判定には使わない)

## 拡張の余地

- 代表地点は各都道府県=県庁所在地1点。将来 複数地点へ拡張可能
  (`prefecture_points.json` を配列拡張し、集約ロジックを追加)
- 現状は手動起動。安定後に cron 化する土台
- 路面温度の日射補正しきい値(`02_analyze.py` 冒頭の定数)は初期ヒューリスティック。
  実データ確認後に微調整する
