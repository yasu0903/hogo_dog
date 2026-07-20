// src/services/api.js
// JSONファイルからデータを取得する関数

// 都道府県データを取得
export const fetchPrefectures = async () => {
  try {
    const response = await fetch('/data/prefecture.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // データ構造に応じた処理
    // {"prefecture_list": [{no: "01", name: "北海道", english_name: "hokkaido"}, ...]}
    if (data && data.prefecture_list && Array.isArray(data.prefecture_list)) {
      // プロパティ名を変換して返す
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
    const response = await fetch('/data/prefecture.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // データ構造に応じた処理
    // {"prefecture_list": [{no: "01", name: "北海道", english_name: "hokkaido"}, ...]}
    if (data && data.prefecture_list && Array.isArray(data.prefecture_list)) {
      // プロパティ名を変換して返す

      return data.prefecture_list.find(pref => pref.no === prefectureId  );
      
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
    const response = await fetch('/data/source.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // データ構造に応じた処理
    // {"source_list": [{no: "01", name: "北海道", source_url: ""}, ...]}
    if (data && data.source_list && Array.isArray(data.source_list)) {
      // プロパティ名を変換して返す
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
    const response = await fetch('/data/search_index.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

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
        linkBroken: Boolean(org.link_broken)
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching search index:', error);
    return [];
  }
};

// お出かけスポットの統合インデックスを取得
// （scripts/build_search_index.mjs がビルド時に生成する spots_index.json を読む）
export const fetchSpotsIndex = async () => {
  try {
    const response = await fetch('/data/spots_index.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data && Array.isArray(data.spots)) {
      return data.spots.map(spot => ({
        prefectureId: spot.prefecture_id,
        prefectureName: spot.prefecture_name,
        prefectureArea: spot.prefecture_area,
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
        lastVerified: spot.last_verified ?? ''
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching spots index:', error);
    return [];
  }
};

// 特定の都道府県の団体詳細を取得
export const fetchOrganizationDetail = async (prefectureId) => {
  try {
    // 都道府県IDに基づいて該当する都道府県のJSONを取得
    const prefResponse = await fetch('/data/prefecture.json');
    if (!prefResponse.ok) {
      throw new Error(`HTTP error! status: ${prefResponse.status}`);
    }
    const prefData = await prefResponse.json();
    
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
    
    // 英語名を使用して該当する団体データのJSONを取得
    const orgResponse = await fetch(`/data/organizations/${englishName}.json`);
    if (!orgResponse.ok) {
      throw new Error(`HTTP error! status: ${orgResponse.status}`);
    }
    const orgData = await orgResponse.json();
    
    // データ構造に応じた処理
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