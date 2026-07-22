// src/pages/Home/index.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import JapanTileMap from '../../components/organizations/JapanTileMap';
import styles from './Home.module.css';
import { HOME_MESSAGES } from '../../constants/locales/ja';
import { fetchPrefectures, fetchOrganizations, getAreas } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [prefectures, setPrefectures] = useState([]);
  // タイルマップは掲載0の県もグレー表示するため、セレクタ用と別に全県を保持する
  const [allPrefectures, setAllPrefectures] = useState([]);
  const [counts, setCounts] = useState({});
  const [areas, setAreas] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prefsData, orgsData] = await Promise.all([
          fetchPrefectures(),
          fetchOrganizations()
        ]);

        // 掲載団体が1件もない都道府県（listed_num: 0）はセレクタに表示しない
        const listedPrefs = orgsData.filter(org => (org.listedCount || 0) > 0);
        const visibleIds = new Set(listedPrefs.map(org => org.id));
        const visiblePrefs = prefsData.filter(pref => visibleIds.has(pref.id));

        setPrefectures(visiblePrefs);
        setAllPrefectures(prefsData);
        setCounts(Object.fromEntries(
          orgsData.map(org => [org.id, org.listedCount || 0])
        ));
        setAreas(getAreas(visiblePrefs));
        setStats({
          prefectureCount: listedPrefs.length,
          organizationCount: listedPrefs.reduce(
            (sum, org) => sum + (org.listedCount || 0), 0
          )
        });
      } catch (error) {
        // セレクタが出せなくても「団体を探す」ボタンから遷移できるため画面は維持する
        console.error('Error loading prefectures for hero selector:', error);
      }
    };

    loadData();
  }, []);

  const handlePrefectureSelect = (e) => {
    const prefectureId = e.target.value;
    if (prefectureId) {
      navigate(`/organizations/${prefectureId}`);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        {/* 1. ヒーロー */}
        <section className={styles.hero}>
          <h1 className={styles.title}>{HOME_MESSAGES.WELCOME}</h1>

          {prefectures.length > 0 && (
            <div className={styles.heroSearch}>
              <select
                id="hero-prefecture-select"
                className={styles.heroSearchSelect}
                defaultValue=""
                onChange={handlePrefectureSelect}
                aria-label={HOME_MESSAGES.HERO_SELECT_LABEL}
              >
                <option value="" disabled>{HOME_MESSAGES.HERO_SELECT_PLACEHOLDER}</option>
                {areas.map(area => (
                  <optgroup key={area} label={area}>
                    {prefectures
                      .filter(pref => pref.area === area)
                      .map(pref => (
                        <option key={pref.id} value={pref.id}>
                          {pref.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <div className={styles.heroLinks}>
                <Link to="/organizations" className={styles.heroAllLink}>
                  {HOME_MESSAGES.HERO_ALL_LINK}
                </Link>
              </div>
            </div>
          )}

          {stats && (
            <p className={styles.stats}>
              {HOME_MESSAGES.STATS(stats.prefectureCount, stats.organizationCount)}
            </p>
          )}
        </section>

        {/* 2. 都道府県タイルマップ（クリックで県別一覧へ。地図から探すリンクの実物置き換え） */}
        {allPrefectures.length > 0 && (
          <section className={styles.section}>
            <JapanTileMap
              prefectures={allPrefectures}
              counts={counts}
              onSelect={(prefId) => navigate(`/organizations/${prefId}`)}
            />
          </section>
        )}

        {/* 3. 今後追加予定（準備中: リンクは置かない。予告項目が無いときは非表示）
            ※お出かけ・おさんぽ導線はヘッダーnavに集約（ホームの重複タイルは削除） */}
        {HOME_MESSAGES.UPCOMING_ITEMS.length > 0 && (
          <section className={styles.section}>
            <div className={styles.upcomingStrip}>
              <span className={styles.upcomingHeading}>{HOME_MESSAGES.UPCOMING_TITLE}</span>
              {HOME_MESSAGES.UPCOMING_ITEMS.map(item => (
                <span key={item.TITLE} className={styles.upcomingItem}>
                  <span className={styles.upcomingIcon}>{item.ICON}</span>
                  {item.TITLE}
                  <span className={styles.upcomingBadge}>{HOME_MESSAGES.UPCOMING_BADGE}</span>
                </span>
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Home;
