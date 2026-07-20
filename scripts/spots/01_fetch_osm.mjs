// scripts/spots/01_fetch_osm.mjs
// Overpass API から日本全国のドッグラン（leisure=dog_park）を一括取得する。
//
// 出力:
//   out/01_osm_raw.json  … Overpass レスポンスそのまま
//   out/01_skipped.json  … 名前が無くスキップした要素（osm_id とタグの記録）
//
// データ更新は手動オペレーション（predev/prebuild には入れない）。

import path from 'node:path';
import { OUT_DIR, writeJson, extractSpot, sleep } from './common.mjs';

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// out center により way/relation も代表点座標が得られる（node はそのまま座標を使う）
const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="JP"][admin_level=2]->.jp;
nwr["leisure"="dog_park"](area.jp);
out center tags;
`;

const MAX_RETRIES = 3;

const fetchOverpass = async () => {
  let lastError;
  for (const endpoint of ENDPOINTS) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`fetching: ${endpoint} (attempt ${attempt + 1}/${MAX_RETRIES})`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // OSMのポリシー上、識別可能なUser-Agentが必須（無いと406/429になる）
            'User-Agent': 'hogo-dog-spots/1.0 (https://nyantarou.net)',
            'Accept': 'application/json',
          },
          body: `data=${encodeURIComponent(QUERY)}`,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        lastError = error;
        const backoff = 5000 * 2 ** attempt;
        console.warn(`failed: ${error.message} — retrying in ${backoff / 1000}s`);
        await sleep(backoff);
      }
    }
    console.warn(`endpoint ${endpoint} exhausted, trying next`);
  }
  throw lastError;
};

const main = async () => {
  const raw = await fetchOverpass();
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
