// src/services/api.js
// JSONファイルからデータを取得する関数（同型 / isomorphic）。
// - ブラウザ: これまで通り fetch でネットワーク取得
// - SSG(ビルド時 / import.meta.env.SSR): public/ 配下を fs で直接読む
//   → vite-react-ssg の loader から呼ぶと、ビルド時に本文までHTMLへ焼ける
// weather は public に無い（実行時にS3へput）ため、SSGでは読めず null に落ちる（想定どおり）。

const loadJson = async (urlPath) => {
  if (import.meta.env.SSR) {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const rel = urlPath.replace(/^\//, '');
    const abs = join(globalThis.process.cwd(), 'public', rel);
    return JSON.parse(await readFile(abs, 'utf-8'));
  }
  const response = await fetch(urlPath);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// 都道府県データを取得
export const fetchPrefectures = async () => {
  try {
    const data = await loadJson('/data/prefecture.json');

    // {"prefecture_list": [{no: "01", name: "北海道", english_name: "hokkaido"}, ...]}
    if (data && data.prefecture_list && Array.isArray(data.prefecture_list)) {
      return data.prefecture_list.map(pref => ({
        id: pref.no,
        name: pref.name,
        area: pref.area,
        englishName: pref.english_name
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching prefectures:', error);
    return [];
  }
};

export const fetchPrefectureById = async (prefectureId) => {
  try {
    const data = await loadJson('/data/prefecture.json');

    if (data && data.prefecture_list && Array.isArray(data.prefecture_list)) {
      return data.prefecture_list.find(pref => pref.no === prefectureId);
    }

    return [];
  } catch (error) {
    console.error('Error fetching prefectures:', error);
    return [];
  }
};


// エリア一覧を取得する関数
export const getAreas = (prefectures) => {
  // 重複のないエリア一覧を取得
  if (!Array.isArray(prefectures)) return [];

  // 日本の地域区分の標準的な順序
  const areaOrder = [
    '北海道',
    '東北',
    '関東',
    '中部',
    '近畿',
    '中国',
    '四国',
    '九州'
  ];

  // 重複のないエリア一覧を取得
  const uniqueAreas = prefectures
    .map(pref => pref.area)
    .filter((area, index, self) =>
      // 重複を削除
      area && self.indexOf(area) === index
    );

  // areaOrderに存在するエリアを順序に従ってソート
  const sortedAreas = [...uniqueAreas].sort((a, b) => {
    const indexA = areaOrder.indexOf(a);
    const indexB = areaOrder.indexOf(b);

    // areaOrderに含まれないエリアは最後に追加
    if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'ja');
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  return sortedAreas;
};

// 団体一覧（ソース）を取得
export const fetchOrganizations = async () => {
  try {
    const data = await loadJson('/data/source.json');

    // {"source_list": [{no: "01", name: "北海道", source_url: ""}, ...]}
    if (data && data.source_list && Array.isArray(data.source_list)) {
      return data.source_list.map(source => ({
        id: source.no,
        name: source.name,
        prefecture_id: source.no,
        prefecture: source.name,
        sourceUrl: source.source_url,
        fileUrl: source.file_url,
        organizationCount: source.organization_num,
        listedCount: source.listed_num,
        asOf: source.as_of,
        isOfficial: Boolean(source.source_url)
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
};

// 特定の都道府県の情報ソース（自治体公表資料など）を取得
export const fetchSourceById = async (prefectureId) => {
  const sources = await fetchOrganizations();
  return sources.find(source => source.id === prefectureId) || null;
};

// 全国横断検索用の統合インデックスを取得
// （scripts/build_search_index.mjs がビルド時に生成する search_index.json を読む）
export const fetchSearchIndex = async () => {
  try {
    const data = await loadJson('/data/search_index.json');

    if (data && Array.isArray(data.organizations)) {
      return data.organizations.map(org => ({
        prefectureId: org.prefecture_id,
        prefectureName: org.prefecture_name,
        prefectureArea: org.prefecture_area,
        id: org.id,
        name: org.name,
        area: org.area,
        city: org.city,
        species: org.species || [],
        sourceType: org.source_type,
        website: org.url,
        caution: org.caution,
        note: org.note,
        sns: org.sns,
        lastVerified: org.last_verified,
        linkBroken: Boolean(org.link_broken),
        lat: org.lat,
        lng: org.lng,
        geoLevel: org.geo_level
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching search index:', error);
    return [];
  }
};

// スポット1件をJSONの形式からアプリ内の形式に変換する
// （fetchSpotsIndex と fetchSpotsByPrefecture で共用）
const mapSpot = (spot) => ({
  id: spot.id,
  name: spot.name,
  category: spot.category,
  area: spot.area,
  city: spot.city ?? '',
  lat: spot.lat,
  lng: spot.lng,
  website: spot.url ?? '',
  conditions: {
    vaccinationCert: spot.conditions?.vaccination_cert ?? null,
    sizeLimit: spot.conditions?.size_limit ?? '',
    fee: spot.conditions?.fee ?? ''
  },
  caution: spot.caution ?? '',
  note: spot.note ?? '',
  sns: spot.sns ?? [],
  source: spot.source,
  lastVerified: spot.last_verified ?? '',
  linkBroken: Boolean(spot.link_broken)
});

// お出かけスポットの統合インデックスを取得
// （scripts/build_search_index.mjs がビルド時に生成する spots_index.json を読む）
export const fetchSpotsIndex = async () => {
  try {
    const data = await loadJson('/data/spots_index.json');

    if (data && Array.isArray(data.spots)) {
      return data.spots.map(spot => ({
        prefectureId: spot.prefecture_id,
        prefectureName: spot.prefecture_name,
        prefectureArea: spot.prefecture_area,
        ...mapSpot(spot)
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching spots index:', error);
    return [];
  }
};

// 特定の都道府県のお出かけスポット一覧を取得（fetchOrganizationDetail と同型）
export const fetchSpotsByPrefecture = async (prefectureId) => {
  try {
    const prefData = await loadJson('/data/prefecture.json');

    // 都道府県IDから英語名を取得
    let englishName = '';
    if (prefData && prefData.prefecture_list && Array.isArray(prefData.prefecture_list)) {
      const prefecture = prefData.prefecture_list.find(pref => pref.no === prefectureId);
      englishName = prefecture ? prefecture.english_name : '';
    }

    if (!englishName) {
      console.error(`Prefecture with ID ${prefectureId} not found`);
      return [];
    }

    const spotsData = await loadJson(`/data/spots/${englishName}.json`);

    if (spotsData && spotsData.spots && Array.isArray(spotsData.spots)) {
      return spotsData.spots.map(mapSpot);
    }

    return [];
  } catch (error) {
    console.error(`Error fetching spots for ${prefectureId}:`, error);
    return [];
  }
};

// おさんぽ予報の全国サマリを取得
// （skills/weather-walk が S3 に put する weather/index.json を同一オリジンで読む）
// 未生成時（SSGのfs読み込み失敗 / CloudFront の HTML フォールバック等）は null を返し、
// 呼び出し側で「準備中」表示に落とす。
export const fetchWeatherIndex = async () => {
  try {
    const data = await loadJson('/weather/index.json');

    if (data && Array.isArray(data.prefectures)) {
      return {
        date: data.date ?? '',
        generatedAt: data.generated_at ?? '',
        source: data.source ?? '',
        prefectures: data.prefectures.map(pref => ({
          prefectureId: pref.prefecture_id,
          prefecture: pref.prefecture,
          englishName: pref.english_name,
          summary: pref.summary ?? {},
          pavementRisk: Boolean(pref.pavement_risk),
          comment: pref.comment ?? ''
        }))
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching weather index:', error);
    return null;
  }
};

// 特定の都道府県のおさんぽ予報詳細を取得（weather/latest/{englishName}.json）
// fetchSpotsByPrefecture と同型（prefectureId → englishName を解決してから取得）。
// 未生成時は null を返す。
export const fetchWeatherByPrefecture = async (prefectureId) => {
  try {
    const prefData = await loadJson('/data/prefecture.json');

    let englishName = '';
    if (prefData && prefData.prefecture_list && Array.isArray(prefData.prefecture_list)) {
      const prefecture = prefData.prefecture_list.find(pref => pref.no === prefectureId);
      englishName = prefecture ? prefecture.english_name : '';
    }

    if (!englishName) {
      console.error(`Prefecture with ID ${prefectureId} not found`);
      return null;
    }

    const doc = await loadJson(`/weather/latest/${englishName}.json`);

    // 都道府県別 JSON はそのまま返す（フィールド構成は skills/weather-walk の 04_build_json 参照）
    if (doc && doc.english_name) {
      return doc;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching weather for ${prefectureId}:`, error);
    return null;
  }
};

// 特定の都道府県の団体詳細を取得
export const fetchOrganizationDetail = async (prefectureId) => {
  try {
    const prefData = await loadJson('/data/prefecture.json');

    // 都道府県IDから英語名を取得
    let englishName = '';
    if (prefData && prefData.prefecture_list && Array.isArray(prefData.prefecture_list)) {
      const prefecture = prefData.prefecture_list.find(pref => pref.no === prefectureId);
      englishName = prefecture ? prefecture.english_name : '';
    }

    if (!englishName) {
      console.error(`Prefecture with ID ${prefectureId} not found`);
      return [];
    }

    const orgData = await loadJson(`/data/organizations/${englishName}.json`);

    // {no: "08", pref_name: "ibaraki", organizations: [{id: 1, name: "...", ...}]}
    if (orgData && orgData.organizations && Array.isArray(orgData.organizations)) {
      return orgData.organizations.map(org => ({
        id: org.id,
        name: org.name,
        area: org.area,
        city: org.city,
        species: org.species || [],
        sourceType: org.source_type,
        website: org.url,
        caution: org.caution,
        note: org.note,
        sns: org.sns,
        lastVerified: org.last_verified,
        linkBroken: Boolean(org.link_broken)
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching organization detail for ${prefectureId}:`, error);
    return [];
  }
};
