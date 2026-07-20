// scripts/spots/06_fetch_extract.mjs
// spots enrichment ステップ2: HTML取得 + 犬・ペット関連キーワード周辺抽出。
// 05_url_status.json で ok だった URL から HTML を取得し、タグ除去 →
// キーワード周辺のみ抜き出して1スポットあたり最大2,000字のスニペットに圧縮する
// （enrichment/03_fetch_extract.py の移植。キーワードはお出かけスポット向け）。
//
// - robots.txt を尊重（取得不可なら fetch せず robots_disallow として記録）
// - 全体で1秒の間隔を空ける。取得済みスポットはスキップ（レジューム可能）
//
// 出力: out/06_snippets.json … { osm_id: { url, status, title, description, snippet } }

import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { OUT_DIR, DATA_DIR, USER_AGENT, readJson, readJsonIfExists, writeJson, sleep } from './common.mjs';

const SPOTS_DATA_DIR = path.join(DATA_DIR, 'spots');
const TIMEOUT_MS = 20_000;
const INTERVAL_MS = 1000;
const MAX_SNIPPET = 2000;
const WINDOW = 80; // キーワード前後の文字数

const RE_KEYWORD = new RegExp(
  'ペット|犬|いぬ|イヌ|ドッグ|わんちゃん|ワンちゃん|' +
  'リード|同伴|入場|入園|入館|立入|立ち入り|' +
  'ワクチン|狂犬病|予防接種|鑑札|注射|' +
  '料金|無料|有料|営業時間|利用時間|定休日|休園|' +
  '小型犬|中型犬|大型犬|体重|' +
  '注意|禁止|マナー|条件|お願い',
  'g'
);

const robotsCache = new Map();

// 簡易 robots.txt 判定（User-agent: * / 前方一致 Disallow のみ解釈。
// Allow の優先解決はせず、Disallow に一致したら不可とする保守的な実装）
const robotsAllows = async (url) => {
  const origin = new URL(url).origin;
  if (!robotsCache.has(origin)) {
    let disallows = [];
    try {
      const response = await fetch(`${origin}/robots.txt`, {
        signal: AbortSignal.timeout(10_000),
        headers: { 'User-Agent': USER_AGENT },
      });
      if (response.ok) {
        let applies = false;
        for (const line of (await response.text()).split(/\r?\n/)) {
          const [field, ...rest] = line.split(':');
          const value = rest.join(':').split('#')[0].trim();
          const key = field.trim().toLowerCase();
          if (key === 'user-agent') applies = value === '*';
          else if (key === 'disallow' && applies && value) disallows.push(value);
        }
      }
    } catch {
      disallows = []; // robots.txt 取得失敗 → 許可扱い（本文取得側で改めて失敗し得る）
    }
    robotsCache.set(origin, disallows);
  }
  const pathName = new URL(url).pathname || '/';
  return !robotsCache.get(origin).some((prefix) => pathName.startsWith(prefix));
};

// Content-Type ヘッダ / meta タグから文字コードを推定してデコードする
// （日本の観光・自治体サイトは Shift_JIS / EUC-JP が残っているため必須）
const decodeHtml = (buffer, contentType) => {
  const head = new TextDecoder('latin1').decode(buffer.slice(0, 2048));
  const charset =
    /charset=["']?([\w-]+)/i.exec(contentType ?? '')?.[1] ??
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ??
    'utf-8';
  try {
    return new TextDecoder(charset.toLowerCase()).decode(buffer);
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  }
};

const ENTITY_MAP = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decodeEntities = (text) =>
  text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code) => {
    if (code.startsWith('#x') || code.startsWith('#X')) return String.fromCodePoint(parseInt(code.slice(2), 16));
    if (code.startsWith('#')) return String.fromCodePoint(parseInt(code.slice(1), 10));
    return ENTITY_MAP[code.toLowerCase()] ?? m;
  });

const htmlToText = (html) => {
  const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').trim();
  const description = decodeEntities(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(html)?.[1] ??
    /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i.exec(html)?.[1] ?? ''
  ).trim();
  const body = decodeEntities(
    html
      .replace(/<(script|style|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
  return { title, description, body };
};

// キーワード周辺のウィンドウを重複マージしながら抜き出す
const extractSnippet = (text) => {
  const spans = [];
  for (const m of text.matchAll(RE_KEYWORD)) {
    const start = Math.max(0, m.index - WINDOW);
    const end = Math.min(text.length, m.index + m[0].length + WINDOW);
    if (spans.length && start <= spans[spans.length - 1][1]) {
      spans[spans.length - 1][1] = end;
    } else {
      spans.push([start, end]);
    }
  }
  return spans.map(([s, e]) => text.slice(s, e)).join(' … ').slice(0, MAX_SNIPPET);
};

const main = async () => {
  const urlStatus = await readJson(path.join(OUT_DIR, '05_url_status.json'));
  const outPath = path.join(OUT_DIR, '06_snippets.json');
  const snippets = (await readJsonIfExists(outPath)) ?? {};

  const spotsByKey = new Map();
  for (const file of (await readdir(SPOTS_DATA_DIR)).sort()) {
    const data = await readJson(path.join(SPOTS_DATA_DIR, file));
    for (const spot of data.spots ?? []) {
      if (spot.url && spot.osm_id) spotsByKey.set(spot.osm_id, spot);
    }
  }

  const todo = [...spotsByKey.keys()]
    .sort()
    .filter((key) => urlStatus[key]?.ok && !(key in snippets))
    .map((key) => [key, urlStatus[key].final_url]);
  console.log(`取得対象: ${todo.length}件（取得済み ${Object.keys(snippets).length}件はスキップ）`);

  let i = 0;
  for (const [key, url] of todo) {
    i++;
    try {
      if (!(await robotsAllows(url))) {
        snippets[key] = { url, status: 'robots_disallow' };
      } else {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(TIMEOUT_MS),
          headers: { 'User-Agent': USER_AGENT },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = new Uint8Array(await response.arrayBuffer());
        const { title, description, body } = htmlToText(
          decodeHtml(buffer, response.headers.get('content-type'))
        );
        const snippet = extractSnippet(body);
        snippets[key] = {
          url,
          status: snippet || title ? 'ok' : 'empty',
          title,
          description: description.slice(0, 300),
          snippet,
        };
      }
    } catch (error) {
      snippets[key] = { url, status: 'fetch_error', error: error.cause?.code ?? error.message };
    }
    if (i % 10 === 0 || i === todo.length) {
      await writeJson(outPath, snippets);
      console.log(`  ${i}/${todo.length} 済`);
    }
    await sleep(INTERVAL_MS);
  }

  await writeJson(outPath, snippets);
  const counts = {};
  for (const v of Object.values(snippets)) counts[v.status] = (counts[v.status] ?? 0) + 1;
  console.log(`内訳: ${JSON.stringify(counts)}`);
  console.log(`→ ${outPath}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
