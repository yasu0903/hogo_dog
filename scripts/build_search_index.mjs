// scripts/build_search_index.mjs
// 全都道府県の団体JSONを統合し、全国横断検索用のインデックスとsitemap.xmlを生成する。
// npm run dev / build の前に自動実行される（package.json の predev / prebuild）。
//
// 出力:
//   public/data/search_index.json  … 全団体 + 都道府県情報の統合インデックス（gitignore対象）
//   public/sitemap.xml             … 全ページのURL一覧（gitignore対象）

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const SITE_BASE_URL = 'https://nyantarou.net';

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf-8'));

const main = async () => {
  const prefData = await readJson(path.join(DATA_DIR, 'prefecture.json'));
  const sourceData = await readJson(path.join(DATA_DIR, 'source.json'));

  const sourceByNo = new Map(sourceData.source_list.map((s) => [s.no, s]));

  const organizations = [];
  for (const pref of prefData.prefecture_list) {
    const orgFile = path.join(DATA_DIR, 'organizations', `${pref.english_name}.json`);
    if (!existsSync(orgFile)) continue;

    const source = sourceByNo.get(pref.no);
    // listed_num: 0 の県は一覧ページに出さない方針に合わせ、インデックスからも除外する
    if (source && source.listed_num === 0) continue;

    const orgData = await readJson(orgFile);
    for (const org of orgData.organizations ?? []) {
      organizations.push({
        prefecture_id: pref.no,
        prefecture_name: pref.name,
        prefecture_area: pref.area,
        id: org.id,
        name: org.name,
        area: org.area,
        city: org.city ?? '',
        species: org.species ?? [],
        source_type: org.source_type ?? '',
        url: org.url ?? '',
        caution: org.caution ?? '',
        note: org.note ?? '',
        sns: org.sns ?? [],
        last_verified: org.last_verified ?? '',
        ...(org.link_broken ? { link_broken: true } : {}),
      });
    }
  }

  const index = {
    generated_at: new Date().toISOString().slice(0, 10),
    total: organizations.length,
    organizations,
  };
  const indexPath = path.join(DATA_DIR, 'search_index.json');
  await writeFile(indexPath, JSON.stringify(index), 'utf-8');

  // sitemap.xml: 静的ページ + 県別ページ + 団体単体ページ
  const urls = ['/', '/organizations', '/privacy-policy', '/terms-of-service'];
  const prefIds = [...new Set(organizations.map((o) => o.prefecture_id))].sort();
  for (const prefId of prefIds) {
    urls.push(`/organizations/${prefId}`);
  }
  for (const org of organizations) {
    urls.push(`/organizations/${org.prefecture_id}/${org.id}`);
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${SITE_BASE_URL}${u}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  const sitemapPath = path.join(ROOT, 'public', 'sitemap.xml');
  await writeFile(sitemapPath, sitemap, 'utf-8');

  // robots.txt（sitemapの場所をクローラに知らせる）
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_BASE_URL}/sitemap.xml\n`;
  await writeFile(path.join(ROOT, 'public', 'robots.txt'), robots, 'utf-8');

  console.log(`search_index.json: ${organizations.length} organizations (${prefIds.length} prefectures)`);
  console.log(`sitemap.xml: ${urls.length} urls`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
