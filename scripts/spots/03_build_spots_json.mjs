// scripts/spots/03_build_spots_json.mjs
// out/02_spots_with_pref.json を県別にグループ化し /public/data/spots/{english_name}.json を出力する。
//
// - id 安定化: 既存 spots ファイルの osm_id → id 対応を引き継ぐ（URL安定性のため）。
//   新規は既存 max+1 から発番。既存にあって今回の抽出に無いものは削除せず維持し、
//   out/03_removed.json に記録してセッションでレビューする
// - manual_overrides.json（osm_id キー）があればフィールド単位で上書き適用
//   （"exclude": true で掲載除外、それ以外のキーはフィールド上書き）
// - manual_additions.json（"user/<slug>" キー）はOSM由来ではないユーザー追加スポット
//   （コントリビューターのPR受け口）。OSM抽出結果とマージして source: "user" で出力する。
//   キーがそのまま osm_id フィールドに入るため、id安定化・enrichment（05〜08）・
//   manual_overrides がOSMスポットと同じ仕組みで機能する。
//   additions から削除されたエントリは（OSM欠落と違い）維持せず削除する
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

// --- 近接重複検知（manual_additions のユーザー追加スポット vs 全スポット） ---
// user/ スポットは osm_id が OSM 側と別キーになるため、同一施設が OSM に（後から）
// 登録されても自動では突き合わせられない。座標距離 + 名前類似で候補を拾い、
// out/03_dup_candidates.json に出してセッションでレビューする。
// 対処は原則「OSM側を manual_overrides で exclude」（id安定・手動データ維持のため）。

const DUP_RADIUS_M = 200; // この距離以内は名前が違っても候補にする
const DUP_NAME_RADIUS_M = 1000; // 名前類似ならこの距離まで候補にする（座標誤差の救済）

const distanceM = (a, b) => {
  const R = 6371e3;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const normName = (s) => s.normalize('NFKC').toLowerCase().replace(/[\s・、。「」()（）~〜-]/g, '');

const bigrams = (s) => {
  const set = new Set();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
};

// 包含 or bigram Dice係数 0.5 以上を「名前類似」とみなす
const nameSimilar = (a, b) => {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return false;
  if (na.includes(nb) || nb.includes(na)) return true;
  const A = bigrams(na);
  const B = bigrams(nb);
  if (!A.size || !B.size) return false;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return (2 * inter) / (A.size + B.size) >= 0.5;
};

const findDupCandidates = (allBuilt) => {
  const isUser = (s) => String(s.osm_id).startsWith('user/');
  const userSpots = allBuilt.filter(({ spot }) => isUser(spot));
  const candidates = [];
  for (const u of userSpots) {
    for (const o of allBuilt) {
      if (o.spot.osm_id === u.spot.osm_id) continue;
      // user同士のペアは片方向だけ記録する
      if (isUser(o.spot) && o.spot.osm_id < u.spot.osm_id) continue;
      const d = distanceM(u.spot, o.spot);
      if (d > DUP_NAME_RADIUS_M) continue;
      const similar = nameSimilar(u.spot.name, o.spot.name);
      if (d <= DUP_RADIUS_M || similar) {
        candidates.push({
          user: { osm_id: u.spot.osm_id, name: u.spot.name, prefecture: u.prefName, category: u.spot.category },
          other: { osm_id: o.spot.osm_id, name: o.spot.name, prefecture: o.prefName, category: o.spot.category, source: o.spot.source },
          distance_m: Math.round(d),
          name_similar: similar,
        });
      }
    }
  }
  return candidates.sort((a, b) => a.distance_m - b.distance_m);
};

const main = async () => {
  const withPref = await readJson(path.join(OUT_DIR, '02_spots_with_pref.json'));
  const prefData = await readJson(path.join(DATA_DIR, 'prefecture.json'));
  const overrides = (await readJsonIfExists(path.join(SPOTS_DIR, 'manual_overrides.json'))) ?? {};
  const additions = (await readJsonIfExists(path.join(SPOTS_DIR, 'manual_additions.json'))) ?? {};

  const prefByNo = new Map(prefData.prefecture_list.map((p) => [p.no, p]));

  // ユーザー追加スポットをOSM抽出結果にマージ（キー "user/<slug>" が osm_id になる）。
  // reason はレビュー記録用メモなので出力に持ち込まない
  for (const [key, add] of Object.entries(additions)) {
    if (key.startsWith('_')) continue; // _meta 等の説明用キー
    // eslint-disable-next-line no-unused-vars
    const { reason, ...fields } = add;
    withPref.push({ ...fields, osm_id: key, source: 'user' });
  }

  // 県別にグループ化（osm_id 順で処理して発番を決定的にする）
  const byPref = new Map();
  for (const spot of [...withPref].sort((a, b) => a.osm_id.localeCompare(b.osm_id))) {
    if (!byPref.has(spot.pref_no)) byPref.set(spot.pref_no, []);
    byPref.get(spot.pref_no).push(spot);
  }

  const removed = [];
  const allBuilt = []; // 近接重複検知用（全県横断。県境またぎのペアも拾う）
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
        city: spot.city ?? '',
        lat: spot.lat,
        lng: spot.lng,
        url: spot.url ?? '',
        // manual_additions は conditions / caution / note / sns を持ち込める（OSM由来は常に既定値）
        conditions: spot.conditions ?? { vaccination_cert: null, size_limit: '', fee: spot.fee ?? '' },
        caution: spot.caution ?? '',
        note: spot.note ?? '',
        sns: spot.sns ?? [],
        source: spot.source ?? 'osm',
        osm_id: spot.osm_id,
        last_verified: today(),
        ...fieldOverrides,
      });
    }

    // 既存にあって今回の抽出に無いものは削除せず維持（レビュー用に記録だけ残す）。
    // ただし source: "user"（manual_additions 由来）はエントリ削除＝掲載取り下げの意思
    // 表示なので維持しない（記録には残す）
    for (const prev of existing) {
      if (currentOsmIds.has(prev.osm_id) || overrides[prev.osm_id]?.exclude) continue;
      const isUserSpot = String(prev.osm_id).startsWith('user/');
      if (!isUserSpot) built.push(prev);
      removed.push({ prefecture: pref.name, dropped: isUserSpot, ...prev });
    }

    built.sort((a, b) => a.id - b.id);
    await writeJson(outPath, { no: pref.no, pref_name: pref.english_name, spots: built });
    total += built.length;
    for (const spot of built) allBuilt.push({ prefName: pref.name, spot });
    console.log(`${pref.english_name}.json: ${built.length} spots`);
  }

  await writeJson(path.join(OUT_DIR, '03_removed.json'), removed);

  // ユーザー追加スポットの近接重複候補（0件でも前回結果を上書きするため常に出力する）
  const dupCandidates = findDupCandidates(allBuilt);
  await writeJson(path.join(OUT_DIR, '03_dup_candidates.json'), dupCandidates);
  if (dupCandidates.length) {
    console.warn(
      `⚠ 近接重複候補: ${dupCandidates.length}件 → out/03_dup_candidates.json をレビューする\n` +
      '  同一施設なら原則OSM側を manual_overrides.json で exclude する（id安定・手動データ維持のため）'
    );
  }

  console.log(`total: ${total} spots in ${byPref.size} prefectures (removed-from-osm kept: ${removed.length})`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
