// scripts/spots/01_fetch_osm.mjs
// Overpass API から日本全国のドッグラン（leisure=dog_park）を一括取得する。
//
// 出力:
//   out/01_osm_raw.json  … Overpass レスポンスそのまま
//   out/01_skipped.json  … 名前が無くスキップした要素（osm_id とタグの記録）
//
// データ更新は手動オペレーション（predev/prebuild には入れない）。

import path from 'node:path';
import { OUT_DIR, writeJson, extractSpot, fetchOverpass } from './common.mjs';

// out center により way/relation も代表点座標が得られる（node はそのまま座標を使う）
const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="JP"][admin_level=2]->.jp;
nwr["leisure"="dog_park"](area.jp);
out center tags;
`;

const main = async () => {
  const raw = await fetchOverpass(QUERY);
  await writeJson(path.join(OUT_DIR, '01_osm_raw.json'), raw);

  const elements = raw.elements ?? [];
  const skipped = elements
    .filter((el) => !extractSpot(el))
    .map((el) => ({ osm_id: `${el.type}/${el.id}`, tags: el.tags ?? {} }));
  await writeJson(path.join(OUT_DIR, '01_skipped.json'), skipped);

  console.log(`fetched: ${elements.length} elements (named: ${elements.length - skipped.length}, skipped: ${skipped.length})`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
