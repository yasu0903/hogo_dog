// src/pages/Weather/index.jsx
// おさんぽ予報の全国一覧ページ（/weather）。
// skills/weather-walk が S3 に put する weather/index.json を同一オリジンで読み、
// 47都道府県の当日サマリ（天気概況・気温・降水確率・路面高温リスク・コメント）を一覧表示する。
// 各カードは /weather/:prefectureId の詳細ページへ遷移する。
import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import AreaFilter from '../../components/organizations/AreaFilter';
import WeatherMap from '../../components/weather/WeatherMap';
import { fetchWeatherIndex, fetchPrefectures, getAreas } from '../../services/api';
import { COMMON_MESSAGES, WEATHER_MESSAGES } from '../../constants/locales/ja';
import styles from './Weather.module.css';

const Weather = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [weather, setWeather] = useState(null);
  const [prefectures, setPrefectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');

  // デフォルトは地図表示。list のときだけ URL に view=list を持たせる
  const view = searchParams.get('view') === 'list' ? 'list' : 'map';

  const setView = (nextView) => {
    const next = new URLSearchParams(searchParams);
    if (nextView === 'list') next.set('view', 'list');
    else next.delete('view');
    setSearchParams(next);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [weatherData, prefsData] = await Promise.all([
          fetchWeatherIndex(),
          fetchPrefectures()
        ]);
        setWeather(weatherData);
        setPrefectures(prefsData);
      } catch (err) {
        console.error(COMMON_MESSAGES.ERROR_WHILE_LOADING, err);
        setError(COMMON_MESSAGES.FAILED_LOADING_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // weather/index.json はエリアを持たないため prefecture.json と突き合わせて area を補う
  const areaById = useMemo(() => {
    const map = {};
    for (const pref of prefectures) map[pref.id] = pref.area;
    return map;
  }, [prefectures]);

  const entries = useMemo(() => {
    if (!weather) return [];
    return weather.prefectures.map(entry => ({
      ...entry,
      area: areaById[entry.prefectureId] ?? ''
    }));
  }, [weather, areaById]);

  const areas = useMemo(() => getAreas(prefectures), [prefectures]);

  const filteredEntries = useMemo(
    () => (selectedArea ? entries.filter(e => e.area === selectedArea) : entries),
    [entries, selectedArea]
  );

  // 地図の塗り分け用：都道府県ID → 当日の最高気温
  const tempsByPrefecture = useMemo(() => {
    const map = {};
    for (const entry of entries) {
      if (entry.summary.max_temp_c != null) map[entry.prefectureId] = entry.summary.max_temp_c;
    }
    return map;
  }, [entries]);

  if (loading) {
    return <div className={styles.loading}>{COMMON_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const hasData = weather && entries.length > 0;

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{WEATHER_MESSAGES.HEADING}</h1>

        {!hasData ? (
          <div className={styles.unavailable}>
            <p className={styles.unavailableTitle}>{WEATHER_MESSAGES.UNAVAILABLE_TITLE}</p>
            <p className={styles.unavailableBody}>{WEATHER_MESSAGES.UNAVAILABLE_BODY}</p>
          </div>
        ) : (
          <>
            <p className={styles.dateLabel}>{WEATHER_MESSAGES.DATE_LABEL(weather.date)}</p>

            <div className={styles.viewTabs} role="group" aria-label={WEATHER_MESSAGES.VIEW_TOGGLE_LABEL}>
              <button
                className={`${styles.viewTab} ${view === 'map' ? styles.viewTabActive : ''}`}
                aria-pressed={view === 'map'}
                onClick={() => setView('map')}
              >
                {WEATHER_MESSAGES.VIEW_MAP}
              </button>
              <button
                className={`${styles.viewTab} ${view === 'list' ? styles.viewTabActive : ''}`}
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
              >
                {WEATHER_MESSAGES.VIEW_LIST}
              </button>
            </div>

            {view === 'map' ? (
              <WeatherMap
                prefectures={prefectures}
                temps={tempsByPrefecture}
                onSelect={(prefId) => navigate(`/weather/${prefId}`)}
              />
            ) : (
              <>
                <div className={styles.filterBar}>
                  <AreaFilter
                    areas={areas}
                    selectedArea={selectedArea}
                    onFilterChange={setSelectedArea}
                  />
                </div>

                <div className={styles.grid}>
                  {filteredEntries.map(entry => (
                    <Link
                      key={entry.prefectureId}
                      to={`/weather/${entry.prefectureId}`}
                      className={styles.card}
                    >
                      <div className={styles.cardHead}>
                        <span className={styles.prefName}>{entry.prefecture}</span>
                        {entry.pavementRisk && (
                          <span className={styles.pavementBadge}>{WEATHER_MESSAGES.PAVEMENT_BADGE}</span>
                        )}
                      </div>

                      <p className={styles.weatherText}>{entry.summary.weather ?? '—'}</p>

                      <div className={styles.metrics}>
                        <span className={styles.metricHot}>
                          {WEATHER_MESSAGES.MAX_TEMP} {entry.summary.max_temp_c ?? '—'}
                          {WEATHER_MESSAGES.SUMMARY_UNIT_TEMP}
                        </span>
                        <span className={styles.metricCold}>
                          {WEATHER_MESSAGES.MIN_TEMP} {entry.summary.min_temp_c ?? '—'}
                          {WEATHER_MESSAGES.SUMMARY_UNIT_TEMP}
                        </span>
                        <span className={styles.metricRain}>
                          {WEATHER_MESSAGES.PRECIP_PROB} {entry.summary.max_precip_prob ?? 0}
                          {WEATHER_MESSAGES.SUMMARY_UNIT_PCT}
                        </span>
                      </div>

                      {entry.comment && <p className={styles.comment}>{entry.comment}</p>}

                      <span className={styles.detailLink}>{WEATHER_MESSAGES.VIEW_DETAIL}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <p className={styles.attribution}>{WEATHER_MESSAGES.SOURCE(weather.source)}</p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Weather;
