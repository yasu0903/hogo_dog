// src/services/api.js
import axios from 'axios';

// API設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// axios インスタンス作成
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// apiClientをエクスポート
export const api = apiClient;

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// =============================================================================
// 静的組織データ関数（既存機能 - 情報提供団体）
// =============================================================================

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

export const fetchPrefectureiById = async (prefectureId) => {
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

// =============================================================================
// 動的組織データ関数（新機能 - 運営団体・動物管理）
// =============================================================================

// 認証トークンを設定
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// ユーザー削除（退会）
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('ユーザー削除API呼び出しエラー:', error);
    throw error;
  }
};

// 運営団体一覧を取得
export const fetchShelters = async () => {
  try {
    const response = await apiClient.get('/organizations');
    return response.data;
  } catch (error) {
    console.error('Error fetching shelters:', error);
    throw error;
  }
};

// 特定の運営団体を取得
export const fetchShelterById = async (shelterId) => {
  try {
    const response = await apiClient.get(`/organizations/${shelterId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching shelter ${shelterId}:`, error);
    throw error;
  }
};

// 動物一覧を取得
export const fetchAnimals = async (params = {}) => {
  try {
    const response = await apiClient.get('/animals', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching animals:', error);
    throw error;
  }
};

// 特定の動物を取得
export const fetchAnimalById = async (animalId) => {
  try {
    const response = await apiClient.get(`/animals/${animalId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching animal ${animalId}:`, error);
    throw error;
  }
};

// 動物の写真一覧を取得
export const fetchAnimalPhotos = async (animalId) => {
  try {
    const response = await apiClient.get(`/animals/${animalId}/photos`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching photos for animal ${animalId}:`, error);
    throw error;
  }
};

// 里親申請を作成
export const createApplication = async (applicationData) => {
  try {
    const response = await apiClient.post('/applications', applicationData);
    return response.data;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

// ユーザー登録
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// ユーザー情報を取得
export const fetchUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// 全ユーザー一覧を取得（管理者機能用）
export const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// ユーザー存在確認（認証ユーザーIDで検索）
export const checkUserExists = async (cognitoUserId) => {
  try {
    const response = await apiClient.get(`/users/search?cognito_user_id=${cognitoUserId}`);
    return {
      exists: true,
      user: response.data.data
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { exists: false, user: null };
    }
    console.error('Error checking user existence:', error);
    throw error;
  }
};

// 初回ログイン時の自動ユーザー登録
export const registerUserIfNotExists = async (authUser) => {
  try {
    // まずユーザーの存在確認
    const checkResult = await checkUserExists(authUser.userId);
    
    if (checkResult.exists) {
      console.log('既存ユーザー:', checkResult.user);
      return { isNewUser: false, user: checkResult.user };
    }
    
    // 新規ユーザーの場合は登録
    const userData = {
      cognito_user_id: authUser.userId,
      display_name: authUser.name || authUser.username || '',
      email: authUser.email || authUser.signInDetails?.loginId || '',
      timezone: 'Asia/Tokyo',
      language: 'ja',
      status: 'active'
    };
    
    console.log('新規ユーザー登録:', userData);
    const newUser = await createUser(userData);
    
    return { isNewUser: true, user: newUser.data };
  } catch (error) {
    console.error('Error in user registration process:', error);
    throw error;
  }
};