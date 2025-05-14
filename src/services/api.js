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
    console.log('Fetched prefectures raw:', data);
    
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
    console.log('Fetched sources raw:', data);
    
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
        pdfUrl: source.pdf_url,
        organizationCount: source.organization_num
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
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
    console.log('Fetched organization details raw:', orgData);
    
    // データ構造に応じた処理
    // {no: "08", pref_name: "ibaraki", organizations: [{id: 1, name: "...", ...}]}
    if (orgData && orgData.organizations && Array.isArray(orgData.organizations)) {
      return orgData.organizations.map(org => ({
        id: org.id,
        name: org.name,
        area: org.area,
        website: org.url,
        note: org.note,
        sns: org.sns
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching organization detail for ${prefectureId}:`, error);
    return [];
  }
};