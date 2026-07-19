// src/pages/Home/index.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import styles from './Home.module.css';
import { HOME_MESSAGES } from '../../constants/locales/ja';
import { fetchPrefectures, fetchOrganizations, getAreas } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [prefectures, setPrefectures] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prefsData, orgsData] = await Promise.all([
          fetchPrefectures(),
          fetchOrganizations()
        ]);

        // 掲載団体が1件もない都道府県（listed_num: 0）はセレクタに表示しない
        const visibleIds = new Set(
          orgsData.filter(org => org.listedCount !== 0).map(org => org.id)
        );
        const visiblePrefs = prefsData.filter(pref => visibleIds.has(pref.id));

        setPrefectures(visiblePrefs);
        setAreas(getAreas(visiblePrefs));
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
        <h1 className={styles.title}>{HOME_MESSAGES.WELCOME}</h1>
        <p className={styles.description}>
          {HOME_MESSAGES.DESCRIPTION1}
           <br></br>
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
          </div>
        )}

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>{HOME_MESSAGES.FEATURES[0].FEATURE}</h3>
            <p>{HOME_MESSAGES.FEATURES[0].DESCRIPTION}</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>📋</div>
            <h3>{HOME_MESSAGES.FEATURES[1].FEATURE}</h3>
            <p>{HOME_MESSAGES.FEATURES[1].DESCRIPTION}</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>🌐</div>
            <h3>{HOME_MESSAGES.FEATURES[2].FEATURE}</h3>
            <p>{HOME_MESSAGES.FEATURES[2].DESCRIPTION}</p>
          </div>
        </div>

        <Link to="/organizations" className={styles.button}>
          {HOME_MESSAGES.LINK_TO_ORGANIZATIONS}
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
