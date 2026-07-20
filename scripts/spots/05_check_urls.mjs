// scripts/spots/05_check_urls.mjs
// spots enrichment ステップ1: URL 死活チェック。
// public/data/spots/*.json から url 付きスポット（dog_run + park）を列挙し、
// GET を投げてステータス・最終到達URLを記録する（enrichment/02_check_urls.py の移植）。
//
// - HEAD は拒否するサイトが多いため最初から GET（ボディは読まない）
// - キーは osm_id（スポットの安定キー）
//
// 出力: out/05_url_status.json … { osm_id: { url, status, ok, final_url, redirected } }

import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { OUT_DIR, DATA_DIR, USER_AGENT, readJson, writeJson } from './common.mjs';

const SPOTS_DATA_DIR = path.join(DATA_DIR, 'spots');
const TIMEOUT_MS = 20_000;
const MAX_CONCURRENT = 8;

// 証明書切れ等はサイト自体が生きていることが多いため、検証なしで再試行して
// ssl_error として区別する（enrichment/02_check_urls.py と同じ流儀）
const TLS_ERRORS = new Set([
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'CERT_HAS_EXPIRED', 'ERR_TLS_CERT_ALTNAME_INVALID',
  'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
]);

const check = async (url) => {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': USER_AGENT },
    });
    const result = {
      status: response.status,
      ok: response.status < 400,
      final_url: response.url,
      redirected: response.url.replace(/\/$/, '') !== url.replace(/\/$/, ''),
    };
    await response.body?.cancel();
    return result;
  } catch (error) {
    return { status: null, ok: false, error: error.cause?.code ?? error.name };
  }
};

// TLS 検証エラーだった URL のみ、検証を無効化した2巡目で再チェックする。
// NODE_TLS_REJECT_UNAUTHORIZED はプロセス全体に効くため、通常チェックが
// すべて終わってから直列で行う
const recheckTlsErrors = async (results) => {
  const targets = Object.entries(results).filter(([, v]) => TLS_ERRORS.has(v.error));
  if (!targets.length) return;
  console.log(`TLS検証エラー ${targets.length}件を検証なしで再チェック`);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  for (const [key, v] of targets) {
    const retried = await check(v.url);
    results[key] = { url: v.url, ...retried, ssl_error: true };
  }
  delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
};

const main = async () => {
  const urls = new Map(); // osm_id -> url
  for (const file of (await readdir(SPOTS_DATA_DIR)).sort()) {
    const data = await readJson(path.join(SPOTS_DATA_DIR, file));
    for (const spot of data.spots ?? []) {
      if (spot.url && spot.osm_id) urls.set(spot.osm_id, spot.url);
    }
  }
  console.log(`チェック対象URL: ${urls.size}件`);

  const entries = [...urls.entries()];
  const results = {};
  let done = 0;
  // MAX_CONCURRENT 本のワーカーでキューを消化する
  let cursor = 0;
  const worker = async () => {
    while (cursor < entries.length) {
      const [key, url] = entries[cursor++];
      results[key] = { url, ...(await check(url)) };
      if (++done % 25 === 0) console.log(`  ${done}/${entries.length} 済`);
    }
  };
  await Promise.all(Array.from({ length: MAX_CONCURRENT }, worker));
  await recheckTlsErrors(results);

  const ng = Object.entries(results).filter(([, v]) => !v.ok);
  await writeJson(path.join(OUT_DIR, '05_url_status.json'), results);
  console.log(`NG: ${ng.length}件 / リダイレクト: ${Object.values(results).filter((v) => v.redirected).length}件`);
  for (const [key, v] of ng.sort()) {
    console.log(`  NG ${key}: ${v.url} (${v.status ?? v.error})`);
  }
  console.log(`→ ${path.join(OUT_DIR, '05_url_status.json')}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
