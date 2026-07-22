# コントリビューションガイド

わんだーネットへの貢献ありがとうございます。掲載データ（保護団体・お出かけスポット）の
追加・修正のPRを歓迎しています。このガイドは主に**データ貢献**の手順を説明します
（コードの貢献は通常のfork → branch → PRフローで、`npm run lint` が通ればOKです）。

> 💡 **PRを作るのが難しい場合**は、[Issueフォーム](https://github.com/yasu0903/hogo_dog/issues/new/choose)
> または X [@yasuch](https://x.com/yasuch) への連絡でも情報提供を受け付けています
> （サイトの[情報提供・修正依頼ページ](https://nyantarou.net/feedback)参照）。

> ⚠️ **重要**: 団体データとスポットデータでは編集してよいファイルが違います。
> - 団体: `public/data/organizations/` を**直接編集してOK**
> - スポット: `public/data/spots/` は**直接編集しない**（メンテナンス用パイプラインが
>   再生成するため、直接の編集は次回のデータ更新で消えます）。後述の
>   `scripts/spots/manual_additions.json` / `manual_overrides.json` を編集してください

## 全データ共通のルール

- **電話番号は絶対に載せない**（個人情報方針）。CIが検出するとPRは失敗します
- **出典を確認できる情報だけ**を載せる（公式サイト・自治体公表資料など）。
  伝聞・SNSのコメント等を根拠にした `caution`（注意事項）は掲載できません
- 送信前にローカルで検証できます:

```bash
npm run validate:data   # スキーマ・件数整合・電話番号チェック
npm run lint
npm run build
```

同じチェックがPRのCI（`.github/workflows/validate.yaml`）でも自動実行されます。

## 保護団体の追加・修正

### 追加手順

1. `public/data/organizations/{都道府県english_name}.json` の `organizations` 配列に追記する
   （english_name は `public/data/prefecture.json` を参照。例: 茨城県 → `ibaraki.json`）
2. **`public/data/source.json` の該当都道府県の `listed_num` を実件数に合わせて更新する**
   （忘れるとCIが失敗します。`listed_num: 0` の県は一覧・全国検索に表示されないため、
   その県への最初の団体追加では特に重要です）

### 団体エントリのフォーマット

```json
{
    "id": 99,
    "name": "団体名",
    "area": "茨城",
    "city": "取手市",
    "species": ["dog"],
    "source_type": "independent",
    "url": "https://example.com/",
    "caution": "",
    "note": "",
    "sns": [
        { "type": "instagram", "url": "https://www.instagram.com/...", "name": "表示名" }
    ]
}
```

- `id`: そのファイル内で一意の整数（既存の最大値+1を推奨。**既存のidは変更しない**。
  団体ページのURLとお気に入り機能のキーになっています）
- `species`: `"dog"` / `"cat"` の配列。**わからなければ空配列 `[]` でOK**
  （後日メンテナンスの自動調査で補完されます。推測で埋めないでください）
- `city`: 活動市区町村。わからなければ `""` でOK（同上）
- `source_type`: 都道府県の公表一覧に掲載されている団体は `"official"`、
  独自調査で見つけた団体は `"independent"`
- `caution`: 引取り不可などの注意事項。**公式サイトに明記されているものだけ**
- `note`: 自由記述。出典・地域・犬猫の別はここではなく上の構造化フィールドへ
- **上記以外のキーは追加しない**（メンテナンススクリプトが許可キー以外を削除します。
  CIでも検出されます）
- `last_verified` / `link_broken` はメンテナンスが自動付与するため、追加時は不要です

### リンク切れの修正・復活報告

サイトが復活している・URLが変わっている場合は、該当団体の `url` を修正し
`link_broken` を削除するPRを出してください。その際、**PR本文に確認した日付と
確認方法を書いてください**。メンテナ側の手動確定リスト
（`scripts/enrichment/manual_overrides.json`）に古い `link_broken` が残っていると
次回メンテナンスで復活してしまうため、メンテナがマージ時に突き合わせて解除します。

## お出かけスポットの追加・修正

スポットデータはOpenStreetMapからの自動収集パイプラインが
`public/data/spots/*.json` を**丸ごと再生成**します。そのため:

### 新しいスポットを追加したい

`scripts/spots/manual_additions.json` にエントリを追加してください
（`public/data/spots/` は編集しない）。フォーマットと記入例はファイル内の
`_meta` に書いてあります。最低限必要なのは:

```json
"user/setagaya-example-dog-run": {
    "pref_no": "13",
    "name": "サンプルドッグラン",
    "category": "dog_run",
    "city": "世田谷区",
    "lat": 35.6462,
    "lng": 139.6532,
    "url": "https://example.com/",
    "reason": "公式サイトで営業確認（2026-07-22）"
}
```

- キーは `user/` + 半角小文字英数とハイフンのslug（一意になるように）
- `category` は `dog_run` / `park` / `cafe`
- `reason` に出典（公式サイトURL・確認日）を書いてください（サイトには表示されません）
- そのスポットがOpenStreetMapに既に登録されていそうな場合（大きな公園・有名施設）は、
  重複を避けるため先にissueで相談してください（万一重複しても、データ更新時に
  近接重複として自動検知されメンテナがレビューするので、致命的ではありません）

追加エントリは次回のデータ更新時に `public/data/spots/` へ反映され、サイトに掲載されます
（メンテナがマージ時にパイプラインを実行して即時反映する場合もあります）。

### 既存スポットの情報を修正したい

`scripts/spots/manual_overrides.json` に、対象スポットの `osm_id`
（`public/data/spots/*.json` の各スポットにある `"osm_id"` フィールドの値）を
キーとしてエントリを追加してください:

```json
"way/123456789": { "name": "正しい施設名", "reason": "公式サイトの表記に合わせて修正" }
```

- `"exclude": true` で掲載除外（閉業・重複など。`reason` に根拠を必ず書く）
- それ以外のキー（`name` / `caution` / `url` など）はフィールド上書きになります

### スポットデータのライセンス

スポットデータの大部分はOpenStreetMap由来（© OpenStreetMap contributors, ODbL）です。
追加するデータも、出典が明確でライセンス上問題のないものに限ります
（他のマップサービスからの転載は不可です）。

## PRチェックリスト

- [ ] `npm run validate:data` が通る
- [ ] `npm run lint` / `npm run build` が通る
- [ ] 電話番号を含めていない
- [ ] `caution` は公式情報で確認できる内容のみ
- [ ] 団体を追加・削除した場合、`source.json` の `listed_num` を更新した
- [ ] スポットは `public/data/spots/` ではなく `manual_additions.json` /
      `manual_overrides.json` を編集した
- [ ] PR本文に出典（確認したページのURL・確認日）を書いた
