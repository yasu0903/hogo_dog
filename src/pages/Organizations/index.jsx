// src/pages/Organizations/index.jsx
import { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import PrefectureFilter from '../../components/organizations/PrefectureFilter';
import AreaFilter from '../../components/organizations/AreaFilter';  // 追加
import OrganizationList from '../../components/organizations/OrganizationList';
import { fetchOrganizations, fetchPrefectures, getAreas } from '../../services/api';  // getAreas を追加
import styles from './Organizations.module.css';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [areas, setAreas] = useState([]);  // エリアの状態を追加
  const [selectedPrefecture, setSelectedPrefecture] = useState('');  // 選択された都道府県
  const [selectedArea, setSelectedArea] = useState('');  // 選択されたエリア
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        // データ取得
        const [prefsData, orgsData] = await Promise.all([
          fetchPrefectures(),
          fetchOrganizations()
        ]);
        
        console.log('Transformed prefecture data:', prefsData);
        console.log('Transformed organizations data:', orgsData);
        
        // エリア一覧を取得
        const areasList = getAreas(prefsData);
        console.log('Areas list:', areasList);
        
        setPrefectures(prefsData);
        setAreas(areasList);
        setOrganizations(orgsData);
        setFilteredOrganizations(orgsData);
      } catch (error) {
        console.error('データの読み込み中にエラーが発生しました:', error);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 都道府県フィルター変更時の処理
  const handlePrefectureChange = (prefectureId) => {
    console.log('都道府県フィルター変更:', prefectureId);
    setSelectedPrefecture(prefectureId);
    
    // フィルター適用
    applyFilters(prefectureId, selectedArea);
  };

  // エリアフィルター変更時の処理
  const handleAreaChange = (area) => {
    console.log('エリアフィルター変更:', area);
    setSelectedArea(area);
    
    // フィルター適用
    applyFilters(selectedPrefecture, area);
  };

  // フィルター適用関数
  const applyFilters = (prefId, area) => {
    let filtered = [...organizations];
    
    // 都道府県フィルター
    if (prefId) {
      filtered = filtered.filter(org => org.prefecture_id === prefId);
    }
    
    // エリアフィルター
    if (area) {
      // 都道府県IDからエリアを判断するために、該当するエリアに所属する都道府県IDのリストを作成
      const prefIdsInArea = prefectures
        .filter(pref => pref.area === area)
        .map(pref => pref.id);
      
      filtered = filtered.filter(org => prefIdsInArea.includes(org.prefecture_id));
    }
    
    console.log('フィルター後のデータ:', filtered);
    setFilteredOrganizations(filtered);
  };

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>団体一覧</h1>
        
        <div className={styles.filters}>
          <AreaFilter
            areas={areas}
            selectedArea={selectedArea}
            onFilterChange={handleAreaChange}
          />
          
          <PrefectureFilter
            prefectures={prefectures}
            selectedPrefecture={selectedPrefecture}
            onFilterChange={handlePrefectureChange}
          />
        </div>
        
        <OrganizationList organizations={filteredOrganizations} />
      </main>
      <Footer />
    </div>
  );
};

export default Organizations;