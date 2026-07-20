// scripts/spots/08_apply.mjs
// spots enrichment ステップ4: 判定結果・死活チェック結果を public/data/spots に反映する
// （enrichment/05_apply.py の移植）。
//
// 反映内容（既存値は上書きしない。空のフィールドのみ埋める）:
//   - conditions.vaccination_cert / size_limit / fee: confidence=high の判定から採用
//   - link_broken: 死活チェックNGのURLに true を付与（復活したら削除）
//   - last_verified: URLをチェックしたスポットに実行日を記録
//   - caution / dog_allowed: LLM判定の生テキストは適用しない。
//     out/08_review.json に出力し、セッションレビュー済みのものを
//     manual_overrides.json に転記（caution 上書き / "exclude": true）して
//     03_build_spots_json.mjs の再実行で反映する
//
// 書き込み前に全ファイルへ電話番号混入チェックを行う（既存方針）。
//
// usage:
//   node scripts/spots/08_apply.mjs          # dry-run
//   node scripts/spots/08_apply.mjs --write  # 書き込み

import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { OUT_DIR, DATA_DIR, readJson, readJsonIfExists, writeJson, today } from './common.mjs';

const SPOTS_DATA_DIR = path.join(DATA_DIR, 'spots');

// 自治体サイトのURL末尾に多い「/0000002556.html」等のページIDを電話番号と
// 誤検知しないよう、直前が "/" のもの（URLパス由来）は除外する
const RE_PHONE = /0\d{1,4}-\d{1,4}-\d{3,4}|(?<![\d/])0\d{9,10}(?!\d)/g;

// スポットのフィールド順を揃えて書き出す（03_build_spots_json.mjs の出力順）
const FIELD_ORDER = [
  'id', 'name', 'category', 'area', 'city', 'lat', 'lng', 'url',
  'conditions', 'caution', 'note', 'sns', 'source', 'osm_id',
  'last_verified', 'link_broken',
];
const orderFields = (spot) =>
  Object.fromEntries(FIELD_ORDER.filter((k) => k in spot).map((k) => [k, spot[k]]));

const main = async () => {
  const write = process.argv.includes('--write');
  const date = today();

  const urlStatus = await readJson(path.join(OUT_DIR, '05_url_status.json'));
  const judgments = (await readJsonIfExists(path.join(OUT_DIR, '07_judgments.json'))) ?? {};

  const stats = { vaccination_cert: 0, size_limit: 0, fee: 0, link_broken: 0, last_verified: 0 };
  const review = [];
  const changedFiles = new Map();

  for (const file of (await readdir(SPOTS_DATA_DIR)).sort()) {
    const filePath = path.join(SPOTS_DATA_DIR, file);
    const data = await readJson(filePath);
    let dirty = false;

    data.spots = (data.spots ?? []).map((spot) => {
      const key = spot.osm_id;
      const st = key ? urlStatus[key] : null;
      const j = (key && judgments[key]) || {};

      // --- 死活チェック結果 ---
      if (st) {
        spot.last_verified = date;
        stats.last_verified++;
        dirty = true;
        if (!st.ok) {
          if (!spot.link_broken) {
            spot.link_broken = true;
            stats.link_broken++;
          }
        } else if (spot.link_broken) {
          delete spot.link_broken; // 復活したので削除
        }
      }

      // --- Gemini判定の反映（highのみ・空フィールドのみ。caution は適用しない）---
      let needsReview = null;
      if (j.error) {
        needsReview = `判定エラー: ${j.error.slice(0, 80)}`;
      } else if (Object.keys(j).length) {
        if (j.confidence === 'high') {
          const cond = spot.conditions ?? { vaccination_cert: null, size_limit: '', fee: '' };
          if (cond.vaccination_cert == null && j.vaccination_cert !== 'unknown') {
            cond.vaccination_cert = j.vaccination_cert === 'required';
            stats.vaccination_cert++;
            dirty = true;
          }
          if (!cond.size_limit && j.size_limit) {
            cond.size_limit = j.size_limit;
            stats.size_limit++;
            dirty = true;
          }
          if (!cond.fee && j.fee) {
            cond.fee = j.fee;
            stats.fee++;
            dirty = true;
          }
          spot.conditions = cond;
        } else {
          needsReview = 'confidence=low';
        }
        // caution・dog_allowed=no はセッションレビュー行き（manual_overrides 経由で反映）
        if (j.caution || j.dog_allowed === 'no' || needsReview) {
          review.push({
            key,
            name: spot.name,
            category: spot.category,
            prefecture: file.replace('.json', ''),
            url: spot.url,
            reason: needsReview ?? (j.dog_allowed === 'no' ? 'dog_allowed=no（掲載除外候補）' : 'caution候補'),
            judgment: j,
          });
        }
      }

      return orderFields(spot);
    });

    if (dirty) changedFiles.set(filePath, data);
  }

  // --- 電話番号検証（既存方針）---
  const errors = [];
  for (const [filePath, data] of changedFiles) {
    for (const m of JSON.stringify(data).matchAll(RE_PHONE)) {
      errors.push(`${path.basename(filePath)}: 電話番号らしき文字列を検出: ${m[0]}`);
    }
  }
  if (errors.length) {
    console.error('検証エラー（書き込み中止）:');
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log('電話番号検証: OK');

  await writeJson(path.join(OUT_DIR, '08_review.json'), review);
  console.log(`反映: ${JSON.stringify(stats)}`);
  console.log(`セッションレビュー行き: ${review.length}件 → ${path.join(OUT_DIR, '08_review.json')}`);

  if (write) {
    for (const [filePath, data] of changedFiles) {
      await writeJson(filePath, data);
    }
    console.log(`書き込み完了: ${changedFiles.size}ファイル`);
  } else {
    console.log(`dry-run: ${changedFiles.size}ファイルが変更対象（--write で書き込み）`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
