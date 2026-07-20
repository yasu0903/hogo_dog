// scripts/spots/02_assign_prefecture.mjs
// 各スポットの座標を国土地理院の逆ジオコーディングAPIに投げ、都道府県・市区町村を割り当てる。
// 出典: 国土地理院 逆ジオコーダAPI (https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress)
// muniCd → 市区町村名の変換は muni_codes.json（地理院地図 muni.js 由来、生成方法は同ファイル参照）。
//
// 入力:  out/01_osm_raw.json       … ドッグラン（category: dog_run）
//        out/04_osm_parks_raw.json … 公園（category: park。存在する場合のみ）
// 出力:  out/02_spots_with_pref.json … 都道府県コード・市区町村名・category を付与したスポット一覧
//        out/02_geocode_cache.json  … 座標→逆ジオコーディング結果のキャッシュ（再実行時はAPI再呼び出ししない）
//        out/02_unresolved.json     … 都道府県を解決できなかったスポット（海上・コード不明など）

import path from 'node:path';
import { SPOTS_DIR, OUT_DIR, readJson, readJsonIfExists, writeJson, extractSpot, sleep } from './common.mjs';

const GEOCODER_URL = 'https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress';
const REQUEST_INTERVAL_MS = 1000; // 1秒1件に絞る（GSIへの負荷配慮）

const cachePath = path.join(OUT_DIR, '02_geocode_cache.json');

// カテゴリ別の raw ファイル（04 が未実行なら dog_run のみ処理する）
const SOURCES = [
  { file: '01_osm_raw.json', category: 'dog_run', required: true },
  { file: '04_osm_parks_raw.json', category: 'park', required: false },
];

const main = async () => {
  const muniCodes = await readJson(path.join(SPOTS_DIR, 'muni_codes.json'));
  const cache = (await readJsonIfExists(cachePath)) ?? {};

  const spots = [];
  for (const { file, category, required } of SOURCES) {
    const raw = required
      ? await readJson(path.join(OUT_DIR, file))
      : await readJsonIfExists(path.join(OUT_DIR, file));
    if (!raw) {
      console.warn(`${file} not found — skipping ${category}`);
      continue;
    }
    for (const element of raw.elements ?? []) {
      const spot = extractSpot(element);
      if (spot) spots.push({ ...spot, category });
    }
  }

  const results = [];
  const unresolved = [];
  let apiCalls = 0;

  for (const spot of spots) {
    const cacheKey = `${spot.lat},${spot.lng}`;
    if (!(cacheKey in cache)) {
      const url = `${GEOCODER_URL}?lat=${spot.lat}&lon=${spot.lng}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`geocoder HTTP ${response.status} for ${spot.osm_id} (${cacheKey})`);
      }
      const data = await response.json();
      cache[cacheKey] = data.results?.muniCd ?? null;
      apiCalls++;
      // 中断してもやり直しが効くよう、都度キャッシュを書き出す
      await writeJson(cachePath, cache);
      await sleep(REQUEST_INTERVAL_MS);
    }

    const muniCd = cache[cacheKey] ? String(cache[cacheKey]).padStart(5, '0') : null;
    const muni = muniCd ? muniCodes[muniCd] : null;
    if (!muni) {
      unresolved.push({ ...spot, muni_cd: muniCd });
      continue;
    }
    results.push({ ...spot, pref_no: muni.pref, city: muni.city });
  }

  await writeJson(path.join(OUT_DIR, '02_spots_with_pref.json'), results);
  await writeJson(path.join(OUT_DIR, '02_unresolved.json'), unresolved);

  console.log(`geocoded: ${results.length} spots (api calls: ${apiCalls}, cached: ${spots.length - apiCalls}, unresolved: ${unresolved.length})`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
