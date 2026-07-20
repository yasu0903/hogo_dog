// scripts/spots/07_judge_gemini.mjs
// spots enrichment ステップ3: Gemini によるスニペット判定。
// out/06_snippets.json の各スニペットを gemini-3-flash-preview に投げ、
// 構造化出力で { dog_allowed, vaccination_cert, size_limit, fee, caution, confidence }
// を判定させる（enrichment/04_judge_gemini.py の移植）。
//
// - 環境変数 GEMINI_API_KEY が必要（Google AI Studio で取得）
// - 結果は out/07_judgments.json に逐次保存（レジューム可能）
// - 429（レート制限）は待って再試行
//
// 判定結果のうち conditions は 08_apply.mjs がそのまま適用するが、
// caution はセッションレビューなしで適用しない（manual_overrides.json 経由）。

import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { OUT_DIR, DATA_DIR, readJson, readJsonIfExists, writeJson, sleep } from './common.mjs';

const MODEL = 'gemini-3-flash-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const INTERVAL_MS = 4000; // 15 RPM 以内（無料枠を想定）

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    dog_allowed: { type: 'string', enum: ['yes', 'no', 'unknown'] },
    vaccination_cert: { type: 'string', enum: ['required', 'not_required', 'unknown'] },
    size_limit: { type: ['string', 'null'] },
    fee: { type: ['string', 'null'] },
    caution: { type: ['string', 'null'] },
    confidence: { type: 'string', enum: ['high', 'low'] },
  },
  required: ['dog_allowed', 'vaccination_cert', 'size_limit', 'fee', 'caution', 'confidence'],
  additionalProperties: false,
};

const CATEGORY_LABELS = { dog_run: 'ドッグラン', park: '公園', cafe: 'カフェ' };

const buildPrompt = (spot, item) => `\
以下は日本の${CATEGORY_LABELS[spot.category] ?? 'スポット'}「${spot.name}」（${spot.area}）の\
関連サイトからの抜粋です。この抜粋だけを根拠に、犬連れ利用の条件を判定してください。

1. dog_allowed: 犬を連れて利用できるか。可なら "yes"、施設全体で犬の同伴が
   禁止されていることが明記されていれば "no"、抜粋から判断できなければ "unknown"。
   園内の一部エリアのみ立入禁止の場合は "yes" とし、caution に書くこと。
2. vaccination_cert: ワクチン接種証明（狂犬病予防注射済票等）の提示が必要なら
   "required"、不要と明記されていれば "not_required"、不明なら "unknown"。
3. size_limit: 犬の体格制限（例: "小型犬のみ"）。明記されている場合のみ。なければ null。
4. fee: 犬連れ利用にかかる料金（例: "無料", "500円/頭"）。明記されている場合のみ簡潔に。
   なければ null。
5. caution: 犬連れ利用者向けの注意事項（例: リード必須・立入禁止区域あり・時間制限）。
   明記されている場合のみ50字以内で要約。なければ null。電話番号は絶対に含めないこと。

confidence: 上記の判定が抜粋に明確な根拠を持つなら "high"、推測を含むなら "low"。
抜粋がこのスポットと無関係な内容の場合はすべて unknown / null とし "low" とすること。

--- ページタイトル ---
${item.title ?? ''}
--- meta description ---
${item.description ?? ''}
--- 本文抜粋 ---
${item.snippet ?? ''}
`;

const judge = async (apiKey, spot, item) => {
  const body = {
    contents: [{ parts: [{ text: buildPrompt(spot, item) }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseJsonSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingLevel: 'low' },
    },
  };
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });
    if (response.status === 429) {
      const wait = 30_000 * (attempt + 1);
      console.log(`    429 rate limit → ${wait / 1000}s 待機`);
      await sleep(wait);
      continue;
    }
    if (response.status === 400 && (await response.clone().text()).toLowerCase().includes('thinking')) {
      delete body.generationConfig.thinkingConfig;
      continue;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status} ${await response.text()}`);
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  }
  throw new Error('リトライ上限に達しました（レート制限）');
};

const main = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('環境変数 GEMINI_API_KEY を設定してください');
    process.exit(1);
  }

  // spots_index.json ではなく元データを直接読む（predev 生成物に依存しない）
  const spotsByKey = new Map();
  for (const file of (await readdir(path.join(DATA_DIR, 'spots'))).sort()) {
    const data = await readJson(path.join(DATA_DIR, 'spots', file));
    for (const spot of data.spots ?? []) {
      if (spot.osm_id) spotsByKey.set(spot.osm_id, spot);
    }
  }

  const snippets = await readJson(path.join(OUT_DIR, '06_snippets.json'));
  const outPath = path.join(OUT_DIR, '07_judgments.json');
  const judgments = (await readJsonIfExists(outPath)) ?? {};

  const todo = Object.entries(snippets)
    .filter(([key, item]) => item.status === 'ok' && !(key in judgments) && spotsByKey.has(key))
    .sort(([a], [b]) => a.localeCompare(b));
  console.log(`判定対象: ${todo.length}件（判定済み ${Object.keys(judgments).length}件はスキップ）`);

  let i = 0;
  for (const [key, item] of todo) {
    i++;
    try {
      const result = await judge(apiKey, spotsByKey.get(key), item);
      judgments[key] = result;
      console.log(`  ${i}/${todo.length} ${key}: dog_allowed=${result.dog_allowed} vaccination=${result.vaccination_cert} conf=${result.confidence}`);
    } catch (error) {
      // 1件の失敗で全体を止めない
      judgments[key] = { error: String(error.message ?? error).slice(0, 200) };
      console.log(`  ${i}/${todo.length} ${key}: ERROR ${error.message}`);
    }
    await writeJson(outPath, judgments);
    await sleep(INTERVAL_MS);
  }

  const values = Object.values(judgments);
  const ok = values.filter((v) => !v.error).length;
  const low = values.filter((v) => v.confidence === 'low').length;
  console.log(`完了: ${ok}件判定 / うち low confidence ${low}件 / エラー ${values.length - ok}件`);
  console.log(`→ ${outPath}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
