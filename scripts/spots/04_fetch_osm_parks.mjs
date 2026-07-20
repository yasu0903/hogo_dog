// scripts/spots/04_fetch_osm_parks.mjs
// Overpass API から日本全国の公園（leisure=park + name）を取得し、
// 「犬とお出かけする目的地になる規模」の公園だけに絞り込む。
//
// 絞り込み（全国の公園は膨大なため必須）:
//   1. name あり（クエリ側で担保）
//   2. wikipedia / wikidata タグあり、または 測地面積 ≥ PARK_AREA_MIN_M2（既定 10ha）
//      - 全要素は out tags bb（タグ + バウンディングボックス）で軽量取得し、
//        bbox 面積 ≥ 閾値のもの（実面積はbbox面積以下なので必要条件）だけを
//        out geom で再取得して実面積を計算する
//      - OSMのマルチポリゴン公園は面積計算が壊れやすいため wikipedia/wikidata 優先、
//        面積計算はフォールバック（outer リングの合計で近似）
//
// 出力:
//   out/04_osm_parks_raw.json … 採用候補のみ。02_assign_prefecture.mjs が読める
//                               Overpass 互換形式（way/relation には center を付与）
//   out/04_stats.json         … 絞り込みの内訳（閾値調整のレビュー用）
//   out/04_list_raw.json      … 全国公園一覧のキャッシュ（閾値調整の再実行用。
//                               既定で再利用し、--refetch 指定時のみ取り直す）
//   out/04_geom_cache.json    … osm_id → 測地面積のキャッシュ（run をまたいで蓄積）
//
// 閾値は環境変数 PARK_AREA_MIN_M2 で調整できる。
// データ更新は手動オペレーション（predev/prebuild には入れない）。

import path from 'node:path';
import { OUT_DIR, writeJson, readJsonIfExists, fetchOverpass, sleep } from './common.mjs';

const PARK_AREA_MIN_M2 = Number(process.env.PARK_AREA_MIN_M2 ?? 100_000);
const GEOM_CHUNK_SIZE = 200; // out geom 再取得の1リクエストあたり要素数
const GEOM_REQUEST_INTERVAL_MS = 2000;

const LIST_QUERY = `
[out:json][timeout:300];
area["ISO3166-1"="JP"][admin_level=2]->.jp;
(
  way["leisure"="park"]["name"](area.jp);
  relation["leisure"="park"]["name"](area.jp);
);
out tags bb;
`;

const METERS_PER_DEG_LAT = 111_320;
const toRad = (deg) => (deg * Math.PI) / 180;

// bbox の測地面積（m²）。equirectangular 近似（日本の緯度帯では十分）
const bboxAreaM2 = (bounds) => {
  if (!bounds) return 0;
  const midLat = (bounds.minlat + bounds.maxlat) / 2;
  const dy = (bounds.maxlat - bounds.minlat) * METERS_PER_DEG_LAT;
  const dx = (bounds.maxlon - bounds.minlon) * METERS_PER_DEG_LAT * Math.cos(toRad(midLat));
  return dx * dy;
};

// 座標列（[{lat, lon}, ...]）の閉リング面積（m²、shoelace + equirectangular 投影）
const ringAreaM2 = (points) => {
  if (!points || points.length < 3) return 0;
  const midLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const cosLat = Math.cos(toRad(midLat));
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const ax = a.lon * METERS_PER_DEG_LAT * cosLat;
    const ay = a.lat * METERS_PER_DEG_LAT;
    const bx = b.lon * METERS_PER_DEG_LAT * cosLat;
    const by = b.lat * METERS_PER_DEG_LAT;
    area += ax * by - bx * ay;
  }
  return Math.abs(area / 2);
};

// out geom の要素1件から実面積を計算する。
// way はそのままリング、relation は outer メンバーのリング面積の合計で近似
const geomAreaM2 = (element) => {
  if (element.type === 'way') return ringAreaM2(element.geometry);
  if (element.type === 'relation') {
    return (element.members ?? [])
      .filter((m) => m.type === 'way' && (m.role === 'outer' || m.role === ''))
      .reduce((sum, m) => sum + ringAreaM2(m.geometry), 0);
  }
  return 0;
};

const boundsCenter = (bounds) => ({
  lat: (bounds.minlat + bounds.maxlat) / 2,
  lon: (bounds.minlon + bounds.maxlon) / 2,
});

// bbox 足切りを通過した非 wiki 要素の実面積を out geom で計算する
// （計算済みは out/04_geom_cache.json から引き、再取得しない）
const geomCachePath = path.join(OUT_DIR, '04_geom_cache.json');

const fetchGeomAreas = async (allElements) => {
  const areas = new Map(Object.entries((await readJsonIfExists(geomCachePath)) ?? {}));
  const elements = allElements.filter((el) => !areas.has(`${el.type}/${el.id}`));
  if (allElements.length > elements.length) {
    console.log(`geometry cache hit: ${allElements.length - elements.length}/${allElements.length}`);
  }
  for (let i = 0; i < elements.length; i += GEOM_CHUNK_SIZE) {
    const chunk = elements.slice(i, i + GEOM_CHUNK_SIZE);
    const wayIds = chunk.filter((el) => el.type === 'way').map((el) => el.id);
    const relIds = chunk.filter((el) => el.type === 'relation').map((el) => el.id);
    const parts = [];
    if (wayIds.length) parts.push(`way(id:${wayIds.join(',')});`);
    if (relIds.length) parts.push(`relation(id:${relIds.join(',')});`);
    const query = `[out:json][timeout:300];(${parts.join('')});out geom;`;

    console.log(`geometry chunk ${Math.floor(i / GEOM_CHUNK_SIZE) + 1}/${Math.ceil(elements.length / GEOM_CHUNK_SIZE)} (${chunk.length} elements)`);
    const geom = await fetchOverpass(query);
    for (const el of geom.elements ?? []) {
      areas.set(`${el.type}/${el.id}`, geomAreaM2(el));
    }
    // 中断してもやり直しが効くよう、都度キャッシュを書き出す
    await writeJson(geomCachePath, Object.fromEntries(areas));
    await sleep(GEOM_REQUEST_INTERVAL_MS);
  }
  return areas;
};

const main = async () => {
  console.log(`threshold: PARK_AREA_MIN_M2 = ${PARK_AREA_MIN_M2}`);

  const listCachePath = path.join(OUT_DIR, '04_list_raw.json');
  let raw = process.argv.includes('--refetch') ? null : await readJsonIfExists(listCachePath);
  if (raw) {
    console.log('using cached park list (pass --refetch to re-download)');
  } else {
    raw = await fetchOverpass(LIST_QUERY);
    await writeJson(listCachePath, raw);
  }
  const elements = raw.elements ?? [];
  console.log(`fetched: ${elements.length} named parks`);

  const wiki = [];
  const needGeom = [];
  let belowBbox = 0;
  for (const el of elements) {
    const tags = el.tags ?? {};
    if (tags.wikipedia || tags.wikidata) {
      wiki.push(el);
    } else if (bboxAreaM2(el.bounds) >= PARK_AREA_MIN_M2) {
      needGeom.push(el);
    } else {
      belowBbox++;
    }
  }
  console.log(`wiki-tagged: ${wiki.length}, bbox-pass (needs geometry): ${needGeom.length}, below bbox threshold: ${belowBbox}`);

  const geomAreas = await fetchGeomAreas(needGeom);
  const byArea = needGeom.filter(
    (el) => (geomAreas.get(`${el.type}/${el.id}`) ?? 0) >= PARK_AREA_MIN_M2
  );

  // 02 の extractSpot が座標を読めるよう way/relation に center を付与する
  const candidates = [...wiki, ...byArea].map((el) => ({
    ...el,
    ...(el.type === 'node' ? {} : { center: boundsCenter(el.bounds) }),
  }));

  await writeJson(path.join(OUT_DIR, '04_osm_parks_raw.json'), { elements: candidates });
  await writeJson(path.join(OUT_DIR, '04_stats.json'), {
    threshold_m2: PARK_AREA_MIN_M2,
    fetched: elements.length,
    wiki_tagged: wiki.length,
    bbox_pass: needGeom.length,
    area_pass: byArea.length,
    below_bbox_threshold: belowBbox,
    candidates: candidates.length,
  });

  console.log(`candidates: ${candidates.length} (wiki: ${wiki.length}, by area: ${byArea.length})`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
