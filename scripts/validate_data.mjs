// scripts/validate_data.mjs
// public/data 配下のデータJSONと scripts/spots/manual_additions.json のスキーマ・整合性検証。
// PR CI（.github/workflows/validate.yaml）と手動（npm run validate:data）で実行する。
//
// 検証内容:
//   - 全データJSONがパース可能
//   - prefecture.json: 必須フィールド・no / english_name の一意性
//   - source.json: listed_num が organizations/{pref}.json の実件数と一致（ファイル無し=0）
//   - organizations/*.json: スキーマ（許可キー・必須キー・型・値域）・id一意性
//   - spots/*.json: 同上 + osm_id 一意性・conditions の形
//   - scripts/spots/manual_additions.json: ユーザー追加スポットのスキーマ
//   - 電話番号らしき文字列の混入チェック（個人情報方針。apply系スクリプトと同方針）
//
// 失敗時は問題を列挙して exit 1（CIを落とす）。

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const SPOTS_SCRIPTS_DIR = path.join(ROOT, 'scripts', 'spots');

// 自治体サイトURLのページID（/0000002556.html や m0306100009.htm 等）を誤検知しないよう、
// ハイフン無し形式は直前が英数字・"/" のものを除外する（scripts/spots/08_apply.mjs の regex の強化版）
const RE_PHONE = /0\d{1,4}-\d{1,4}-\d{3,4}|(?<![\w/])0\d{9,10}(?!\d)/g;
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const RE_OSM_ID = /^(node|way|relation)\/\d+$/;
const RE_USER_KEY = /^user\/[a-z0-9][a-z0-9-]*$/;

const ORG_KEYS = [
  'id', 'name', 'area', 'city', 'species', 'source_type',
  'url', 'caution', 'note', 'sns', 'last_verified', 'link_broken',
];
const ORG_REQUIRED = ['id', 'name', 'area', 'city', 'species', 'source_type', 'url', 'caution', 'note', 'sns'];
const SPOT_KEYS = [
  'id', 'name', 'category', 'area', 'city', 'lat', 'lng', 'url',
  'conditions', 'caution', 'note', 'sns', 'source', 'osm_id',
  'last_verified', 'link_broken',
];
const SPOT_REQUIRED = ['id', 'name', 'category', 'area', 'city', 'lat', 'lng', 'url', 'conditions', 'caution', 'note', 'sns', 'source', 'osm_id'];
const SPECIES = new Set(['dog', 'cat']);
const SOURCE_TYPES = new Set(['official', 'independent']);
const SPOT_CATEGORIES = new Set(['dog_run', 'park', 'cafe']);
const SPOT_SOURCES = new Set(['osm', 'user']);
// manual_additions のエントリに書けるキー（id/area/last_verified 等は 03 が生成するため書かせない）
const ADDITION_KEYS = new Set(['pref_no', 'name', 'category', 'city', 'lat', 'lng', 'url', 'conditions', 'caution', 'note', 'sns', 'reason']);
const ADDITION_REQUIRED = ['pref_no', 'name', 'category', 'city', 'lat', 'lng', 'url'];

const problems = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);

const readJsonChecked = async (filePath, label) => {
  const raw = await readFile(filePath, 'utf-8');
  // 電話番号チェックは raw テキスト全体に対して行う（フィールドを問わず検出する）
  for (const m of raw.matchAll(RE_PHONE)) {
    fail(label, `電話番号らしき文字列を検出: ${m[0]}（個人情報方針により掲載不可）`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    fail(label, `JSONパースエラー: ${err.message}`);
    return null;
  }
};

const checkSns = (sns, label, itemLabel) => {
  if (!Array.isArray(sns)) {
    fail(label, `${itemLabel}: sns が配列ではない`);
    return;
  }
  sns.forEach((s, i) => {
    for (const k of ['type', 'url', 'name']) {
      if (typeof s?.[k] !== 'string' || !s[k]) {
        fail(label, `${itemLabel}: sns[${i}].${k} が空または文字列ではない`);
      }
    }
  });
};

const checkConditions = (cond, label, itemLabel) => {
  if (typeof cond !== 'object' || cond === null || Array.isArray(cond)) {
    fail(label, `${itemLabel}: conditions がオブジェクトではない`);
    return;
  }
  for (const k of Object.keys(cond)) {
    if (!['vaccination_cert', 'size_limit', 'fee'].includes(k)) {
      fail(label, `${itemLabel}: conditions に未知のキー "${k}"`);
    }
  }
  if (!(cond.vaccination_cert === null || typeof cond.vaccination_cert === 'boolean')) {
    fail(label, `${itemLabel}: conditions.vaccination_cert は null か boolean`);
  }
  if (typeof cond.size_limit !== 'string') fail(label, `${itemLabel}: conditions.size_limit は文字列`);
  if (typeof cond.fee !== 'string') fail(label, `${itemLabel}: conditions.fee は文字列`);
};

// 団体・スポット共通のフィールド検証
const checkCommonItem = (item, allowedKeys, required, label, itemLabel) => {
  for (const k of Object.keys(item)) {
    if (!allowedKeys.includes(k)) {
      fail(label, `${itemLabel}: 未知のキー "${k}"（apply系スクリプトが許可キー以外を削除するため追加不可）`);
    }
  }
  for (const k of required) {
    if (!(k in item)) fail(label, `${itemLabel}: 必須キー "${k}" が無い`);
  }
  if (typeof item.id !== 'number' || !Number.isInteger(item.id)) {
    fail(label, `${itemLabel}: id は整数`);
  }
  if (typeof item.name !== 'string' || !item.name.trim()) fail(label, `${itemLabel}: name が空`);
  for (const k of ['area', 'city', 'url', 'caution', 'note']) {
    if (k in item && typeof item[k] !== 'string') fail(label, `${itemLabel}: ${k} は文字列`);
  }
  if ('url' in item && item.url && !/^https?:\/\//.test(item.url)) {
    fail(label, `${itemLabel}: url は http(s):// で始めるか空文字列にする`);
  }
  if ('last_verified' in item && !RE_DATE.test(item.last_verified)) {
    fail(label, `${itemLabel}: last_verified は "YYYY-MM-DD" 形式`);
  }
  if ('link_broken' in item && item.link_broken !== true) {
    fail(label, `${itemLabel}: link_broken は true のみ（falseは付けず省略する）`);
  }
  if ('sns' in item) checkSns(item.sns, label, itemLabel);
};

const main = async () => {
  // --- prefecture.json ---
  const prefData = await readJsonChecked(path.join(DATA_DIR, 'prefecture.json'), 'prefecture.json');
  const prefList = prefData?.prefecture_list ?? [];
  const prefByNo = new Map();
  const engNames = new Set();
  for (const p of prefList) {
    for (const k of ['no', 'name', 'english_name', 'area']) {
      if (typeof p[k] !== 'string' || !p[k]) fail('prefecture.json', `no=${p.no}: ${k} が空`);
    }
    if (prefByNo.has(p.no)) fail('prefecture.json', `no=${p.no} が重複`);
    if (engNames.has(p.english_name)) fail('prefecture.json', `english_name=${p.english_name} が重複`);
    prefByNo.set(p.no, p);
    engNames.add(p.english_name);
  }

  // --- source.json ---
  const sourceData = await readJsonChecked(path.join(DATA_DIR, 'source.json'), 'source.json');
  const sourceByNo = new Map((sourceData?.source_list ?? []).map((s) => [s.no, s]));
  for (const s of sourceData?.source_list ?? []) {
    if (!prefByNo.has(s.no)) fail('source.json', `no=${s.no}: prefecture.json に存在しない都道府県`);
    if (typeof s.listed_num !== 'number') fail('source.json', `no=${s.no}: listed_num が数値ではない`);
  }

  // --- organizations/*.json ---
  const orgDir = path.join(DATA_DIR, 'organizations');
  const orgCounts = new Map(); // pref_no -> 実件数
  for (const file of (await readdir(orgDir)).sort()) {
    const label = `organizations/${file}`;
    const slug = file.replace(/\.json$/, '');
    if (!engNames.has(slug)) {
      fail(label, 'ファイル名が prefecture.json のどの english_name にも一致しない');
      continue;
    }
    const data = await readJsonChecked(path.join(orgDir, file), label);
    if (!data) continue;
    if (data.pref_name !== slug) fail(label, `pref_name="${data.pref_name}" がファイル名と不一致`);
    const pref = prefList.find((p) => p.english_name === slug);
    if (pref && data.no !== pref.no) fail(label, `no="${data.no}" が prefecture.json の "${pref.no}" と不一致`);

    const orgs = data.organizations ?? [];
    if (pref) orgCounts.set(pref.no, orgs.length);
    const ids = new Set();
    for (const org of orgs) {
      const itemLabel = `id=${org.id} (${org.name ?? '?'})`;
      if (ids.has(org.id)) fail(label, `${itemLabel}: id が重複（団体単体ページURL・お気に入りのキーになるため一意必須）`);
      ids.add(org.id);
      checkCommonItem(org, ORG_KEYS, ORG_REQUIRED, label, itemLabel);
      if (!Array.isArray(org.species) || org.species.some((sp) => !SPECIES.has(sp))) {
        fail(label, `${itemLabel}: species は "dog" / "cat" の配列（未確認なら空配列）`);
      }
      if (!SOURCE_TYPES.has(org.source_type)) {
        fail(label, `${itemLabel}: source_type は "official" か "independent"`);
      }
    }
  }

  // --- source.json listed_num と実件数の突き合わせ ---
  for (const [no, pref] of prefByNo) {
    const actual = orgCounts.get(no) ?? 0;
    const listed = sourceByNo.get(no)?.listed_num;
    if (listed !== undefined && listed !== actual) {
      fail('source.json', `${pref.name} (no=${no}): listed_num=${listed} だが organizations/${pref.english_name}.json の実件数は ${actual}` +
        '（団体を追加・削除したら listed_num も更新する。0のままだと一覧・全国検索に表示されない）');
    }
  }

  // --- spots/*.json ---
  const spotDir = path.join(DATA_DIR, 'spots');
  if (existsSync(spotDir)) {
    for (const file of (await readdir(spotDir)).sort()) {
      const label = `spots/${file}`;
      const slug = file.replace(/\.json$/, '');
      if (!engNames.has(slug)) {
        fail(label, 'ファイル名が prefecture.json のどの english_name にも一致しない');
        continue;
      }
      const data = await readJsonChecked(path.join(spotDir, file), label);
      if (!data) continue;
      if (data.pref_name !== slug) fail(label, `pref_name="${data.pref_name}" がファイル名と不一致`);

      const ids = new Set();
      const osmIds = new Set();
      for (const spot of data.spots ?? []) {
        const itemLabel = `id=${spot.id} (${spot.name ?? '?'})`;
        if (ids.has(spot.id)) fail(label, `${itemLabel}: id が重複`);
        ids.add(spot.id);
        checkCommonItem(spot, SPOT_KEYS, SPOT_REQUIRED, label, itemLabel);
        if (!SPOT_CATEGORIES.has(spot.category)) {
          fail(label, `${itemLabel}: category は ${[...SPOT_CATEGORIES].join(' / ')}`);
        }
        if (!SPOT_SOURCES.has(spot.source)) {
          fail(label, `${itemLabel}: source は "osm" か "user"`);
        }
        if (typeof spot.lat !== 'number' || typeof spot.lng !== 'number') {
          fail(label, `${itemLabel}: lat / lng は数値`);
        }
        if ('conditions' in spot) checkConditions(spot.conditions, label, itemLabel);
        if (typeof spot.osm_id === 'string') {
          if (!RE_OSM_ID.test(spot.osm_id) && !RE_USER_KEY.test(spot.osm_id)) {
            fail(label, `${itemLabel}: osm_id は "node|way|relation/<数字>" か "user/<slug>" 形式`);
          }
          if (osmIds.has(spot.osm_id)) fail(label, `${itemLabel}: osm_id "${spot.osm_id}" が重複`);
          osmIds.add(spot.osm_id);
        } else {
          fail(label, `${itemLabel}: osm_id が文字列ではない`);
        }
        if (spot.source === 'user' && !RE_USER_KEY.test(spot.osm_id ?? '')) {
          fail(label, `${itemLabel}: source="user" のスポットは osm_id を "user/<slug>" にする`);
        }
      }
    }
  }

  // --- scripts/spots/manual_additions.json（ユーザー追加スポット） ---
  const additionsPath = path.join(SPOTS_SCRIPTS_DIR, 'manual_additions.json');
  if (existsSync(additionsPath)) {
    const label = 'scripts/spots/manual_additions.json';
    const additions = await readJsonChecked(additionsPath, label);
    for (const [key, add] of Object.entries(additions ?? {})) {
      if (key.startsWith('_')) continue; // _meta 等の説明用キー
      if (!RE_USER_KEY.test(key)) {
        fail(label, `キー "${key}" は "user/<半角小文字英数とハイフンのslug>" 形式にする`);
        continue;
      }
      const itemLabel = key;
      for (const k of Object.keys(add)) {
        if (!ADDITION_KEYS.has(k)) fail(label, `${itemLabel}: 未知のキー "${k}"`);
      }
      for (const k of ADDITION_REQUIRED) {
        if (!(k in add)) fail(label, `${itemLabel}: 必須キー "${k}" が無い`);
      }
      if (add.pref_no !== undefined && !prefByNo.has(add.pref_no)) {
        fail(label, `${itemLabel}: pref_no="${add.pref_no}" が prefecture.json に存在しない（例: 東京都は "13"）`);
      }
      if (add.category !== undefined && !SPOT_CATEGORIES.has(add.category)) {
        fail(label, `${itemLabel}: category は ${[...SPOT_CATEGORIES].join(' / ')}`);
      }
      if (typeof add.lat !== 'number' || typeof add.lng !== 'number') {
        fail(label, `${itemLabel}: lat / lng は数値`);
      }
      if (typeof add.url !== 'string') fail(label, `${itemLabel}: url は文字列（無ければ ""）`);
      if ('conditions' in add) checkConditions(add.conditions, label, itemLabel);
      if ('sns' in add) checkSns(add.sns, label, itemLabel);
    }
  }

  // --- manual_overrides（パース + 電話番号チェックのみ） ---
  for (const p of [
    path.join(SPOTS_SCRIPTS_DIR, 'manual_overrides.json'),
    path.join(ROOT, 'scripts', 'enrichment', 'manual_overrides.json'),
  ]) {
    if (existsSync(p)) await readJsonChecked(p, path.relative(ROOT, p));
  }

  if (problems.length) {
    console.error(`データ検証エラー: ${problems.length}件\n`);
    for (const p of problems) console.error(`  ✗ ${p}`);
    process.exit(1);
  }
  const totalOrgs = [...orgCounts.values()].reduce((a, b) => a + b, 0);
  console.log(`データ検証: OK（団体 ${totalOrgs}件 / ${orgCounts.size}都道府県）`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
