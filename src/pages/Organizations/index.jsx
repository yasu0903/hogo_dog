// src/pages/Organizations/index.jsx
import { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import AreaFilter from '../../components/organizations/AreaFilter';
import OrganizationList from '../../components/organizations/OrganizationList';
import { fetchOrganizations, fetchPrefectures, getAreas } from '../../services/api';
import { COMMON_MESSAGES, ORGANIZAIONS_MESSAGES } from '../../constants/locales/ja';
import styles from './Organizations.module.css';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
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
        
        // エリア一覧を取得
        const areasList = getAreas(prefsData);
        
        setPrefectures(prefsData);
        setAreas(areasList);
        setOrganizations(orgsData);
        setFilteredOrganizations(orgsData);
      } catch (error) {
        console.error(COMMON_MESSAGES.ERROR_WHILE_LOADING, error);
        setError(COMMON_MESSAGES.FAILED_LOADING_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // エリアフィルター変更時の処理
  const handleAreaChange = (area) => {
    setSelectedArea(area);
    applyFilters(area);
  };

  // フィルター適用関数
  const applyFilters = (area) => {
    let filtered = [...organizations];

    // エリアフィルター
    if (area) {
      // 都道府県IDからエリアを判断するために、該当するエリアに所属する都道府県IDのリストを作成
      const prefIdsInArea = prefectures
        .filter(pref => pref.area === area)
        .map(pref => pref.id);
      
      filtered = filtered.filter(org => prefIdsInArea.includes(org.prefecture_id));
    }
    
    setFilteredOrganizations(filtered);
  };

  if (loading) {
    return <div className={styles.loading}>{COMMON_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{ORGANIZAIONS_MESSAGES.TITLE}</h1>
        
        <div className={styles.filters}>
          <AreaFilter
            areas={areas}
            selectedArea={selectedArea}
            onFilterChange={handleAreaChange}
          />
        </div>
        
        <OrganizationList organizations={filteredOrganizations} />
      </main>
      <Footer />
    </div>
  );
};

export default Organizations;