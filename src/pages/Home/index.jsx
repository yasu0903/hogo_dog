// src/pages/Home/index.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Seo from '../../components/common/Seo';
import styles from './Home.module.css';
import { HOME_MESSAGES } from '../../constants/locales/ja';
import { fetchPrefectures, fetchOrganizations, getAreas } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [prefectures, setPrefectures] = useState([]);
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
      <Seo path="/" />
      <Header />
      <main className={styles.main}>
        {/* 1. ヒーロー */}
        <section className={styles.hero}>
          <h1 className={styles.title}>{HOME_MESSAGES.WELCOME}</h1>
          <p className={styles.description}>
            {HOME_MESSAGES.DESCRIPTION1}
            <br />
            {HOME_MESSAGES.DESCRIPTION2}
          </p>

          {prefectures.length > 0 && (
            <div className={styles.heroSearch}>
              <label htmlFor="hero-prefecture-select" className={styles.heroSearchLabel}>
                {HOME_MESSAGES.HERO_SELECT_LABEL}
              </label>
              <select
                id="hero-prefecture-select"
                className={styles.heroSearchSelect}
                defaultValue=""
                onChange={handlePrefectureSelect}
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
                <Link to="/organizations?view=map" className={styles.heroMapLink}>
                  {HOME_MESSAGES.HERO_MAP_LINK}
                </Link>
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

        {/* 2. サイトの特徴 */}
        <section className={styles.section}>
          <div className={styles.features}>
            {HOME_MESSAGES.FEATURES.map(feature => (
              <div key={feature.FEATURE} className={styles.feature}>
                <div className={styles.featureIcon}>{feature.ICON}</div>
                <h3>{feature.FEATURE}</h3>
                <p>{feature.DESCRIPTION}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. エリアから探す */}
        {areas.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{HOME_MESSAGES.AREA_SECTION_TITLE}</h2>
            <p className={styles.sectionDescription}>{HOME_MESSAGES.AREA_SECTION_DESCRIPTION}</p>
            <div className={styles.areaChips}>
              {areas.map(area => (
                <Link
                  key={area}
                  to={`/organizations?area=${encodeURIComponent(area)}`}
                  className={styles.areaChip}
                >
                  {area}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. 今後追加予定のコンテンツ（準備中: リンクは置かない） */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{HOME_MESSAGES.UPCOMING_TITLE}</h2>
          <div className={styles.upcomingCards}>
            {HOME_MESSAGES.UPCOMING_ITEMS.map(item => (
              <div key={item.TITLE} className={styles.upcomingCard}>
                <span className={styles.upcomingBadge}>{HOME_MESSAGES.UPCOMING_BADGE}</span>
                <div className={styles.upcomingIcon}>{item.ICON}</div>
                <h3>{item.TITLE}</h3>
                <p>{item.DESCRIPTION}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Home;
