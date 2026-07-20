// scripts/spots/03_build_spots_json.mjs
// out/02_spots_with_pref.json を県別にグループ化し /public/data/spots/{english_name}.json を出力する。
//
// - id 安定化: 既存 spots ファイルの osm_id → id 対応を引き継ぐ（URL安定性のため）。
//   新規は既存 max+1 から発番。既存にあって今回の抽出に無いものは削除せず維持し、
//   out/03_removed.json に記録してセッションでレビューする
// - manual_overrides.json（osm_id キー）があればフィールド単位で上書き適用
//   （"exclude": true で掲載除外、それ以外のキーはフィールド上書き）
// - スポット 0 件の県はファイルを作らない
//
// 注意: id 以外の全フィールドを毎回作り直すため、08_apply.mjs が書き込んだ
// conditions / caution(自動反映分) / link_broken / last_verified は本スクリプトの
// 再実行で消える。manual_overrides.json 更新後にこれを再実行したら、
// 続けて 08_apply.mjs --write も再実行して enrichment を復元すること
// （正しい順序: 03 → 05〜07 → manual_overrides レビュー → 03 → 08 --write）

import path from 'node:path';
import { SPOTS_DIR, OUT_DIR, DATA_DIR, readJson, readJsonIfExists, writeJson, today } from './common.mjs';

const SPOTS_DATA_DIR = path.join(DATA_DIR, 'spots');

// organizations の area と同義に揃える（都道府県名から 都/府/県 を落とす。北海道はそのまま）
const prefNameToArea = (name) => name.replace(/[都府県]$/, '');

const main = async () => {
  const withPref = await readJson(path.join(OUT_DIR, '02_spots_with_pref.json'));
  const prefData = await readJson(path.join(DATA_DIR, 'prefecture.json'));
  const overrides = (await readJsonIfExists(path.join(SPOTS_DIR, 'manual_overrides.json'))) ?? {};

  const prefByNo = new Map(prefData.prefecture_list.map((p) => [p.no, p]));

  // 県別にグループ化（osm_id 順で処理して発番を決定的にする）
  const byPref = new Map();
  for (const spot of [...withPref].sort((a, b) => a.osm_id.localeCompare(b.osm_id))) {
    if (!byPref.has(spot.pref_no)) byPref.set(spot.pref_no, []);
    byPref.get(spot.pref_no).push(spot);
  }

  const removed = [];
  let total = 0;

  for (const [prefNo, spots] of [...byPref.entries()].sort()) {
    const pref = prefByNo.get(prefNo);
    if (!pref) {
      console.warn(`unknown prefecture no: ${prefNo} (${spots.length} spots) — skipped`);
      continue;
    }

    const outPath = path.join(SPOTS_DATA_DIR, `${pref.english_name}.json`);
    const existing = (await readJsonIfExists(outPath))?.spots ?? [];
    const existingByOsmId = new Map(existing.map((s) => [s.osm_id, s]));
    let nextId = Math.max(0, ...existing.map((s) => s.id)) + 1;

    const currentOsmIds = new Set(spots.map((s) => s.osm_id));
    const built = [];

    for (const spot of spots) {
      const override = overrides[spot.osm_id] ?? {};
      if (override.exclude) continue;

      const prev = existingByOsmId.get(spot.osm_id);
      // reason はレビュー記録用のメモ。出力には含めない
      // eslint-disable-next-line no-unused-vars
      const { exclude, reason, ...fieldOverrides } = override;
      built.push({
        id: prev?.id ?? nextId++,
        name: spot.name,
        // category は 02 が raw の由来（01=dog_run / 04=park）から付与する
        category: spot.category ?? 'dog_run',
        area: prefNameToArea(pref.name),
        city: spot.city,
        lat: spot.lat,
        lng: spot.lng,
        url: spot.url,
        conditions: { vaccination_cert: null, size_limit: '', fee: spot.fee },
        caution: '',
        note: '',
        sns: [],
        source: 'osm',
        osm_id: spot.osm_id,
        last_verified: today(),
        ...fieldOverrides,
      });
    }

    // 既存にあって今回の抽出に無いものは削除せず維持（レビュー用に記録だけ残す）
    for (const prev of existing) {
      if (!currentOsmIds.has(prev.osm_id) && !overrides[prev.osm_id]?.exclude) {
        built.push(prev);
        removed.push({ prefecture: pref.name, ...prev });
      }
    }

    built.sort((a, b) => a.id - b.id);
    await writeJson(outPath, { no: pref.no, pref_name: pref.english_name, spots: built });
    total += built.length;
    console.log(`${pref.english_name}.json: ${built.length} spots`);
  }

  await writeJson(path.join(OUT_DIR, '03_removed.json'), removed);
  console.log(`total: ${total} spots in ${byPref.size} prefectures (removed-from-osm kept: ${removed.length})`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
