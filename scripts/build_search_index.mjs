// scripts/build_search_index.mjs
// 全都道府県の団体JSONを統合し、全国横断検索用のインデックスとsitemap.xmlを生成する。
// npm run dev / build の前に自動実行される（package.json の predev / prebuild）。
//
// 出力:
//   public/data/search_index.json  … 全団体 + 都道府県情報の統合インデックス（gitignore対象）
//   public/data/spots_index.json   … 全お出かけスポットの統合インデックス（gitignore対象）
//   public/sitemap.xml             … 全ページのURL一覧（gitignore対象）

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// ページと同じ文言テンプレを再利用して SSG 用の seo-meta を組み立てる（単一ソース化）。
import {
  ORGANIZATIONS_MESSAGES,
  SPOTS_MESSAGES,
  WEATHER_MESSAGES,
  SPOTS_PREFECTURE_MESSAGES,
  WEATHER_PREFECTURE_MESSAGES,
  GUIDES_MESSAGES,
  FAVORITES_MESSAGES,
} from '../src/constants/locales/ja.js';
import {
  orgListSeoTitle,
  orgListSeoDescription,
  orgSeoTitle,
  orgSeoDescription,
} from '../src/utils/orgSeo.js';
// 里親ガイド記事のメタ（React非依存の定義なので Node からそのまま読める）。
import { GUIDES } from '../src/content/guides/guides.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const ENRICH_DIR = path.join(ROOT, 'scripts', 'enrichment');
const SITE_BASE_URL = 'https://nyantarou.net';

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf-8'));
const readJsonSafe = async (filePath) =>
  existsSync(filePath) ? readJson(filePath) : {};

// city 名から導出した座標（scripts/enrichment/06_geocode.py が生成・コミット対象）。
// 未生成でもビルドは通る（座標なしになるだけ）。優先: manual > city > 県フォールバック。
const resolveGeo = (prefNo, city, cityCoords, prefCentroids, manualCoords) => {
  const key = `${prefNo}/${(city ?? '').trim()}`;
  const cityHit = (city ?? '').trim() && (manualCoords[key] || cityCoords[key]);
  if (cityHit) return { lat: cityHit.lat, lng: cityHit.lng, geo_level: 'city' };
  const pref = prefCentroids[prefNo];
  if (pref) return { lat: pref.lat, lng: pref.lng, geo_level: 'pref' };
  return null;
};

const main = async () => {
  const prefData = await readJson(path.join(DATA_DIR, 'prefecture.json'));
  const sourceData = await readJson(path.join(DATA_DIR, 'source.json'));

  // ジオコーディング結果（近い団体機能。未生成なら座標なしで続行）
  const cityCoords = await readJsonSafe(path.join(ENRICH_DIR, 'city_coords.json'));
  const prefCentroids = await readJsonSafe(path.join(ENRICH_DIR, 'pref_centroids.json'));
  const manualCoords = await readJsonSafe(path.join(ENRICH_DIR, 'manual_coords.json'));

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
      const geo = resolveGeo(pref.no, org.city, cityCoords, prefCentroids, manualCoords);
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
        ...(geo ? { lat: geo.lat, lng: geo.lng, geo_level: geo.geo_level } : {}),
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

  // spots_index.json: 全都道府県のお出かけスポットを統合（/spots 全国ページが読む）
  const spots = [];
  for (const pref of prefData.prefecture_list) {
    const spotFile = path.join(DATA_DIR, 'spots', `${pref.english_name}.json`);
    if (!existsSync(spotFile)) continue;

    const spotData = await readJson(spotFile);
    for (const spot of spotData.spots ?? []) {
      spots.push({
        prefecture_id: pref.no,
        prefecture_name: pref.name,
        prefecture_area: pref.area,
        ...spot,
      });
    }
  }
  const spotsIndex = {
    generated_at: new Date().toISOString().slice(0, 10),
    total: spots.length,
    spots,
  };
  await writeFile(path.join(DATA_DIR, 'spots_index.json'), JSON.stringify(spotsIndex), 'utf-8');

  // sitemap.xml: 静的ページ + 県別ページ + 団体単体ページ + スポットページ
  // （スポット単体ページは設けない方針のため、spots 系は全国 + 県別まで）
  const urls = ['/', '/organizations', '/guides', '/privacy-policy', '/terms-of-service'];
  const prefIds = [...new Set(organizations.map((o) => o.prefecture_id))].sort();
  for (const prefId of prefIds) {
    urls.push(`/organizations/${prefId}`);
  }
  for (const org of organizations) {
    urls.push(`/organizations/${org.prefecture_id}/${org.id}`);
  }
  for (const guide of GUIDES) {
    urls.push(`/guides/${guide.slug}`);
  }
  urls.push('/spots');
  const spotPrefIds = [...new Set(spots.map((s) => s.prefecture_id))].sort();
  for (const prefId of spotPrefIds) {
    urls.push(`/spots/${prefId}`);
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

  // src/generated/ssg-routes.json:
  //   vite-react-ssg の getStaticPaths が読む「事前レンダリング対象の動的パス一覧」。
  //   src/routes/index.jsx から dyanmic import され、node:fs をクライアントバンドルに
  //   持ち込まずに全ルートを列挙するために使う（gitignore対象・再生成可）。
  //   weather は毎日更新の動的データだが、meta/canonical を焼くため全県のシェルを対象にする。
  const ssgRoutes = {
    organizationsPrefectures: prefIds.map((id) => `/organizations/${id}`),
    organizations: organizations.map((o) => `/organizations/${o.prefecture_id}/${o.id}`),
    guides: GUIDES.map((g) => `/guides/${g.slug}`),
    spotsPrefectures: spotPrefIds.map((id) => `/spots/${id}`),
    weatherPrefectures: prefData.prefecture_list.map((p) => `/weather/${p.no}`),
  };
  const generatedDir = path.join(ROOT, 'src', 'generated');
  await mkdir(generatedDir, { recursive: true });
  await writeFile(path.join(generatedDir, 'ssg-routes.json'), JSON.stringify(ssgRoutes), 'utf-8');

  // src/generated/seo-meta.json:
  //   全ルートの { title, description, type } を path キーで持つ。RouteSeo がビルド時/実行時に
  //   これを引いて <head> を出力するため、SSGのHTMLに正しい per-page meta が焼かれる。
  //   文言はページと同じテンプレ関数を使い単一ソース化（count 等はビルド時データで実値になる）。
  const prefNameById = new Map(prefData.prefecture_list.map((p) => [p.no, p.name]));
  const orgCountByPref = new Map();
  for (const o of organizations) {
    orgCountByPref.set(o.prefecture_id, (orgCountByPref.get(o.prefecture_id) ?? 0) + 1);
  }
  const spotCountByPref = new Map();
  for (const s of spots) {
    spotCountByPref.set(s.prefecture_id, (spotCountByPref.get(s.prefecture_id) ?? 0) + 1);
  }

  const seoMeta = {
    '/': {},
    '/organizations': { title: ORGANIZATIONS_MESSAGES.TITLE, description: ORGANIZATIONS_MESSAGES.DESCRIPTION },
    '/guides': { title: GUIDES_MESSAGES.TITLE, description: GUIDES_MESSAGES.DESCRIPTION },
    // /favorites は localStorage 由来のCSRページ。検索対象外にする（sitemap にも載せない）。
    '/favorites': { title: FAVORITES_MESSAGES.TITLE, noindex: true },
    '/spots': { title: SPOTS_MESSAGES.TITLE, description: SPOTS_MESSAGES.DESCRIPTION },
    '/weather': { title: WEATHER_MESSAGES.TITLE, description: WEATHER_MESSAGES.DESCRIPTION },
    '/privacy-policy': { title: 'プライバシーポリシー' },
    '/terms-of-service': { title: '利用規約' },
  };
  for (const prefId of prefIds) {
    const name = prefNameById.get(prefId) ?? '';
    seoMeta[`/organizations/${prefId}`] = {
      title: orgListSeoTitle(name),
      description: orgListSeoDescription(name, orgCountByPref.get(prefId) ?? 0),
    };
  }
  for (const org of organizations) {
    seoMeta[`/organizations/${org.prefecture_id}/${org.id}`] = {
      title: orgSeoTitle(org),
      description: orgSeoDescription(org, org.prefecture_name),
      type: 'article',
    };
  }
  for (const guide of GUIDES) {
    seoMeta[`/guides/${guide.slug}`] = {
      title: guide.title,
      description: guide.description,
      type: 'article',
    };
  }
  for (const prefId of spotPrefIds) {
    const name = prefNameById.get(prefId) ?? '';
    seoMeta[`/spots/${prefId}`] = {
      title: SPOTS_PREFECTURE_MESSAGES.SEO_TITLE(name),
      description: SPOTS_PREFECTURE_MESSAGES.SEO_DESCRIPTION(name, spotCountByPref.get(prefId) ?? 0),
    };
  }
  for (const pref of prefData.prefecture_list) {
    seoMeta[`/weather/${pref.no}`] = {
      title: WEATHER_PREFECTURE_MESSAGES.SEO_TITLE(pref.name),
      description: WEATHER_PREFECTURE_MESSAGES.SEO_DESCRIPTION(pref.name),
    };
  }
  await writeFile(path.join(generatedDir, 'seo-meta.json'), JSON.stringify(seoMeta), 'utf-8');

  console.log(`search_index.json: ${organizations.length} organizations (${prefIds.length} prefectures)`);
  console.log(`spots_index.json: ${spots.length} spots`);
  console.log(`sitemap.xml: ${urls.length} urls`);
  console.log(
    `ssg-routes.json: ${ssgRoutes.organizationsPrefectures.length} pref + ${ssgRoutes.organizations.length} org + ${ssgRoutes.spotsPrefectures.length} spot-pref + ${ssgRoutes.weatherPrefectures.length} weather-pref`
  );
  console.log(`seo-meta.json: ${Object.keys(seoMeta).length} routes`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
