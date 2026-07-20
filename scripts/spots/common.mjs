// scripts/spots/common.mjs
// spots 収集パイプライン共通処理。
// 中間出力は out/ に置く（再生成可能・手編集禁止・gitignore対象）。

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SPOTS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const OUT_DIR = path.join(SPOTS_DIR, 'out');
export const ROOT = path.resolve(SPOTS_DIR, '..', '..');
export const DATA_DIR = path.join(ROOT, 'public', 'data');

export const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf-8'));

export const readJsonIfExists = async (filePath) =>
  existsSync(filePath) ? readJson(filePath) : null;

export const writeJson = async (filePath, data) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
};

export const today = () => new Date().toISOString().slice(0, 10);

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const USER_AGENT = 'hogo-dog-spots/1.0 (https://nyantarou.net)';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const OVERPASS_MAX_RETRIES = 3;

// Overpass API へのクエリ実行（エンドポイント切替 + 指数バックオフ付き）
export const fetchOverpass = async (query) => {
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < OVERPASS_MAX_RETRIES; attempt++) {
      try {
        console.log(`fetching: ${endpoint} (attempt ${attempt + 1}/${OVERPASS_MAX_RETRIES})`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // OSMのポリシー上、識別可能なUser-Agentが必須（無いと406/429になる）
            'User-Agent': USER_AGENT,
            'Accept': 'application/json',
          },
          body: `data=${encodeURIComponent(query)}`,
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

// 座標は小数第4位で丸める（約10m精度で十分、ファイルサイズ抑制）
const roundCoord = (value) => Math.round(value * 10000) / 10000;

// OSM の website タグはスキーム欠落（"city.example.jp" 等）があるため補う
const normalizeUrl = (url) => {
  if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  return `https://${url}`;
};

// Overpass の要素1件からスポット候補を抽出する。
// 名前が無い要素は掲載価値・検索価値がないため null を返す（呼び出し側でスキップ記録）。
// phone / contact:phone は個人情報方針により読まない。
export const extractSpot = (element) => {
  const tags = element.tags ?? {};
  const name = tags['name:ja'] || tags.name || '';
  if (!name) return null;

  const lat = element.type === 'node' ? element.lat : element.center?.lat;
  const lng = element.type === 'node' ? element.lon : element.center?.lon;
  if (lat == null || lng == null) return null;

  // fee=no → 無料 / fee=yes → charge の値があればそれ、なければ 有料 / タグ無し → 未確認(空文字)
  let fee = '';
  if (tags.fee === 'no') fee = '無料';
  else if (tags.fee === 'yes') fee = tags.charge || '有料';

  return {
    osm_id: `${element.type}/${element.id}`,
    name,
    lat: roundCoord(lat),
    lng: roundCoord(lng),
    url: normalizeUrl(tags.website || tags['contact:website'] || ''),
    fee,
  };
};
