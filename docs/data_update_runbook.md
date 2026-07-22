# データ定期更新 運用ノウハウ

団体情報（`public/data/organizations/`）とお出かけスポット情報（`public/data/spots/`）を
最新の状態に保つための定期運用手順。2系統は完全に独立したパイプラインで、
別々のタイミングで実行してよい。

| | 団体情報 | スポット情報 |
|---|---|---|
| 実装言語 | Python (`scripts/enrichment/`) | Node.js (`scripts/spots/`) |
| データ収集元 | 手動（都道府県公表資料） | OpenStreetMap Overpass API |
| 対象 | 既存掲載団体の鮮度確認・欠損補完 | 新規スポット収集 + 既存スポットの鮮度確認 |
| 推奨頻度 | 3〜6ヶ月ごと | 6ヶ月〜1年ごと（OSMデータの更新頻度が緩やか） |

共通方針（両パイプラインとも厳守）:

- **caution はLLM判定結果をそのまま自動適用しない**。必ずセッション内で人間が内容を
  読み、事実確認できたものだけ `manual_overrides.json` に転記して適用する
  （個人の伝聞・不正確な情報が掲載されるリスクを避けるため）
- **電話番号は絶対に載せない**。apply系スクリプトは書き込み前に電話番号らしき文字列を
  正規表現で検出し、見つかったら書き込みを中止する（`--write` なしのdry-runで先に
  差分を確認する運用を徹底する）
- 各ステップの中間出力は `scripts/*/out/` 配下のJSON（gitignore対象・再生成可能）。
  コミット対象になるのは最終的な `public/data/**/*.json` のみ
- **実行前に develop を最新化する**。外部コントリビューターのデータPR
  （CONTRIBUTING.md 参照）がマージされている可能性があるため、古い作業ツリーで
  パイプラインを回すとユーザー貢献分を巻き戻すことになる
- 反映後は `npm run validate:data` も実行する（PR CI と同じスキーマ・整合性検証）

### manual_overrides の手動確定値に関する規約（特に link_broken）

- `scripts/enrichment/manual_overrides.json` に `link_broken` 等の手動確定値を書くときは、
  同じエントリに **`"reason"` キーで確認日と根拠をメモする**
  （例: `"link_broken": true, "reason": "2026-07-22 ドメイン失効を確認。復活したらこのエントリを削除"`）。
  apply スクリプトは未知キーを無視するため安全に書ける
- 手動確定値は**自動処理に常に勝ち続ける**（ユーザーが「サイト復活した」とPRで
  `link_broken` を消しても、override が残っていれば次回applyで再付与される）。
  リンク復活報告のPR・issueを受けたら、**マージ前に manual_overrides の該当エントリを
  突き合わせて削除する**こと

---

## 1. 団体情報の更新（`scripts/enrichment/`）

事前準備:

```bash
python3 -c "import requests, bs4, urllib3"  # 未インストールなら pip install requests beautifulsoup4 urllib3
export GEMINI_API_KEY=...  # Google AI Studio で取得
```

手順（各ステップは独立して再実行可能・中断してもレジューム可能）:

```bash
cd scripts/enrichment
python3 01_inventory.py       # species/city 欠損団体を棚卸し → out/targets.json
python3 02_check_urls.py      # 全団体URLの死活チェック（欠損の有無に関わらず全件）→ out/url_status.json
python3 03_fetch_extract.py   # 棚卸し対象のHTML取得+キーワード抽出 → out/snippets.json
python3 04_judge_gemini.py    # Gemini構造化判定 → out/judgments.json（要 GEMINI_API_KEY）
python3 05_apply.py           # dry-run（差分と反映件数だけ表示。書き込みなし）
```

`05_apply.py` の dry-run 出力を確認する:

- `反映: {...}` の件数が想定と大きくズレていないか
- `個別レビュー行き: N件 → out/review_needed.json` — species/city が
  confidence=low や判定不能で埋まらなかった団体の一覧。**このファイルを開いて
  目視確認する**。特に `caution` 候補（team側で拾った文言）は真偽を確認し、
  掲載すべきものだけ `manual_overrides.json` に `"caution": "..."` として追記する
  （キーは `{都道府県english_name}#{団体id}`。既存エントリを参考にする）

manual_overrides.json を更新したら、反映して本番データに書き込む:

```bash
python3 05_apply.py --write
```

電話番号検出でエラー終了した場合は、該当ファイルを直接確認し、本物の電話番号か
（URLのページID等の）誤検知かを判断する。誤検知が疑わしい場合は `05_apply.py` の
`RE_PHONE` の精度を疑い、直さずに書き込みを強行しない。

### 座標のジオコーディング（近い団体機能の基盤）

`05_apply.py --write` で city が確定した**後**に実行する（確定した市区町村を読むため）。

```bash
python3 06_geocode.py --dry-run   # 取得予定の新規 city/県の件数だけ確認（API未使用）
python3 06_geocode.py             # 未キャッシュ分だけ GSI で取得（1req/秒・差分のみ）
```

- 座標は **org JSON に書き戻さない**（city 名からの派生値）。`city_coords.json` /
  `pref_centroids.json` / `manual_coords.json` に持つ。**この3ファイルはコミット対象**
  （`out/` 配下ではない例外。CIビルドが座標を search_index に注入するため、ビルド経路から
  外部APIを排除する）。
- `out/geocode_unresolved.json` が出たら中身を確認する。「中央区」「◯◯地区」など
  市区町村として解決できない表記は、正しい座標を `manual_coords.json` に
  `"{prefNo}/{city}": {"lat":..,"lng":..}` で手当てして再実行する（キーは org の city 文字列そのまま）。
- カバレッジ出力（市区町村レベル / 県レベルフォールバック / 未解決の件数）を確認し、
  県レベルのままの団体が多ければ enrichment で city 補完を検討する。

最後に `npm run lint` / `npm run build` を実行し、`git diff --stat public/data/organizations/`
で変更範囲を確認してからコミットする（団体JSON に加え `city_coords.json` /
`pref_centroids.json` / `manual_coords.json` の更新も一緒にコミットする）。

---

## 2. スポット情報の更新（`scripts/spots/`）

### 2.1 新規スポットの取り込み・全件リフレッシュ

事前準備:

```bash
export GEMINI_API_KEY=...
```

**重要な実行順序**（`03_build_spots_json.mjs` は `id` 以外の全フィールドを
毎回ゼロから組み立てるため、enrichment（`08_apply.mjs`）の結果より後に `03` を
実行すると enrichment の結果が消える。**必ず 03 → 08 の順で終える**こと。
`manual_overrides.json` を更新して `03` を再実行した場合も同様に `08 --write` の
再実行が必要）:

```bash
cd scripts/spots

# 1. OSMから収集（ドッグラン・公園）
node 01_fetch_osm.mjs
node 04_fetch_osm_parks.mjs        # PARK_AREA_MIN_M2 で面積閾値を調整可（既定20万m²=20ha）
                                    # out/04_list_raw.json・04_geom_cache.json にキャッシュされるため
                                    # 閾値だけ変えて再実行しても再取得は走らない（--refetch で強制再取得）

# 2. 逆ジオコーディング（1秒1件・GSI APIへの負荷配慮。中断してもキャッシュから再開できる）
node 02_assign_prefecture.mjs
# out/02_unresolved.json が出たら海上・境界誤差等の座標。個別に manual_overrides.json で
# 修正するか、レビューして無視する

# 3. 都道府県別JSONを生成（manual_overrides.json の exclude/フィールド上書き、
#    manual_additions.json のユーザー追加スポット（source: "user"）もここで適用）
node 03_build_spots_json.mjs
# out/03_removed.json … 前回あって今回のOSM抽出に無くなったスポット（削除はせず維持される。
# 施設の実際の廃止か、OSM側の一時的な欠落かをレビューする）。
# "dropped": true の行は manual_additions から削除されたユーザー追加スポットで、
# こちらは維持されず掲載から外れる（意図した取り下げかだけ確認する）
# out/03_dup_candidates.json … ユーザー追加スポット（user/）と他スポットの近接重複候補
# （200m以内、または名前類似かつ1km以内）。手動追加した施設が後からOSMに登録されると
# osm_id が別キーになり二重掲載になるため、ここで検知する。同一施設と確認できたら
# 原則 OSM 側を manual_overrides.json で exclude する（id安定・手動データ維持のため。
# 逆に OSM 側へ一本化したい場合は manual_additions のエントリを削除するが、id が変わり
# 手動entryの caution/sns 等は引き継がれない点に注意）

# 4. enrichment（URL死活 → スニペット抽出 → Gemini判定 → 反映）
node 05_check_urls.mjs
node 06_fetch_extract.mjs
node 07_judge_gemini.mjs
node 08_apply.mjs                  # dry-run。反映件数と out/08_review.json を確認
```

`08_apply.mjs` の dry-run 確認ポイント:

- `out/08_review.json` を開き、`dog_allowed=no` 候補（掲載除外の可能性）と
  `caution` 候補を目視レビューする
- `dog_allowed=no` は**公式サイトの本文を直接確認**してから
  `manual_overrides.json` に `"exclude": true` を追記する（Gemini判定だけを
  根拠にしない。ページ全文取得やURLの直接確認で裏取りする）
- `caution` は実質的な制限・注意情報があるものだけ選び、簡潔な日本語に要約して
  `manual_overrides.json` に `"caution": "..."` として追記する。
  「ドッグランあり」等の**設備紹介文はcautionではない**ので載せない

manual_overrides.json（または manual_additions.json — ユーザー追加スポットの受け口。
CONTRIBUTING.md 参照）を更新したら、**03 → 08 --write の順で反映し直す**:

```bash
node 03_build_spots_json.mjs       # exclude/caution を反映（既存の08結果は消える）
node 08_apply.mjs --write          # conditions/link_broken/last_verified を書き込みで復元
```

最後に `npm run lint` / `npm run build` を実行し、`git diff --stat public/data/spots/`
で変更範囲を確認してからコミットする。

### 2.2 死活チェック・条件情報だけを最新化したい場合（新規収集なし）

`01`〜`04`（OSM再取得）をスキップし、`05`〜`08` だけを回せば既存スポットの
URL死活・conditions・last_verified だけを更新できる。この場合も
「manual_overrides更新 → 03再実行 → 08 --write」の順序は変わらない
（03を経由しないと manual_overrides の変更が反映されないため）。

### 2.3 新しいスポットカテゴリを追加する場合（例: W3のカフェ）

1. `scripts/spots/0N_fetch_osm_XXX.mjs` を新設し、Overpassクエリ + 絞り込みロジックを書く
   （`04_fetch_osm_parks.mjs` を雛形にする）
2. `02_assign_prefecture.mjs` の `SOURCES` 配列に `{ file: '0N_osm_XXX_raw.json', category: 'XXX' }`
   を追加する
3. `03_build_spots_json.mjs` は `spot.category` をそのまま使うため変更不要
4. 該当カテゴリのラベルを `src/constants/locales/ja.js` の `SPOT_CATEGORY_LABELS` /
   `SPOTS_MESSAGES.CATEGORY_*` に追加し、`src/components/spots/SpotCard/SpotCard.module.css`
   にバッジ色クラスを追加する

---

## 3. コミット前チェックリスト（両パイプライン共通）

- [ ] apply系スクリプトは `--write` なしのdry-runを先に実行し、反映件数・レビュー行きの
      件数が妥当か確認した
- [ ] `caution` は目視で内容を確認したものだけを `manual_overrides.json` 経由で適用した
      （LLMの生テキストを直接書き込んでいない）
- [ ] 除外（`exclude: true` / delisting）は公式情報で裏取りした
- [ ] 電話番号検証でエラーが出ていない（出た場合は誤検知かどうかを個別に確認した）
- [ ] `npm run lint` / `npm run build` が通る
- [ ] `git diff --stat` で変更ファイル数・行数が想定の範囲内
- [ ] `scripts/*/out/` 配下の中間出力をコミットに含めていない（gitignore対象のはず）
