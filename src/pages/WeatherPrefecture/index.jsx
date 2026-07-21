// src/pages/WeatherPrefecture/index.jsx
// 都道府県別のおさんぽ予報詳細ページ（/weather/:prefectureId）。
// weather/latest/{englishName}.json を読み、散歩◎の時間帯・雨の時間帯・注意時間帯・
// 路面高温リスク・1時間ごとの予報・コメントを表示する。
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import HourlyChart from '../../components/weather/HourlyChart';
import { fetchWeatherByPrefecture } from '../../services/api';
import { COMMON_MESSAGES, WEATHER_PREFECTURE_MESSAGES as M } from '../../constants/locales/ja';
import styles from './WeatherPrefecture.module.css';

const WeatherPrefecture = () => {
  const { prefectureId } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchWeatherByPrefecture(prefectureId);
        setDoc(data);
      } catch (err) {
        console.error(COMMON_MESSAGES.ERROR_WHILE_LOADING, err);
        setError(COMMON_MESSAGES.FAILED_LOADING_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [prefectureId]);

  if (loading) {
    return <div className={styles.loading}>{COMMON_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <Header />
        <main className={styles.main}>
          <h1>{COMMON_MESSAGES.ERROR}</h1>
          <p>{error}</p>
          <Link to="/weather">{M.BACK_TO_WEATHER}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  // データ未生成・取得失敗時は「準備中」表示に落とす
  if (!doc) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.unavailable}>
            <p className={styles.unavailableTitle}>{M.UNAVAILABLE_TITLE}</p>
            <p className={styles.unavailableBody}>{M.UNAVAILABLE_BODY}</p>
            <div className={styles.backLink}>
              <Link to="/weather">{M.BACK_TO_WEATHER}</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const prefectureName = doc.prefecture ?? '';
  const summary = doc.summary ?? {};
  const pavement = doc.pavement ?? { risk: false };
  const walkWindows = doc.walk_windows ?? [];
  const rainWindows = doc.rain_windows ?? [];
  const avoidWindows = doc.avoid_windows ?? [];
  const hourly = doc.hourly ?? [];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          <Link to="/">{M.BREADCRUMB_HOME}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link to="/weather">{M.BREADCRUMB_WEATHER}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span>{prefectureName}</span>
        </nav>

        <h1 className={styles.title}>{M.TITLE(prefectureName)}</h1>
        <p className={styles.dateLocation}>{M.DATE_LOCATION(doc.date, doc.location?.point)}</p>

        <div className={styles.backLink}>
          <Link to="/weather">{M.BACK_TO_WEATHER}</Link>
        </div>

        {doc.comment && <p className={styles.comment}>{doc.comment}</p>}

        {/* 今日の天気サマリ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{M.SUMMARY_TITLE}</h2>
          <div className={styles.summaryRow}>
            <span className={styles.summaryWeather}>{summary.weather ?? '—'}</span>
            <span className={styles.summaryMetric}>
              <span className={styles.summaryLabel}>{M.MAX_TEMP}</span>
              <span className={styles.metricHot}>{summary.max_temp_c ?? '—'}{M.UNIT_TEMP}</span>
            </span>
            <span className={styles.summaryMetric}>
              <span className={styles.summaryLabel}>{M.MIN_TEMP}</span>
              <span className={styles.metricCold}>{summary.min_temp_c ?? '—'}{M.UNIT_TEMP}</span>
            </span>
            <span className={styles.summaryMetric}>
              <span className={styles.summaryLabel}>{M.PRECIP_PROB}</span>
              <span className={styles.metricRain}>{summary.max_precip_prob ?? 0}{M.UNIT_PCT}</span>
            </span>
          </div>
        </section>

        {/* 路面高温の警告（risk 時のみ） */}
        {pavement.risk && (
          <div className={styles.pavementBox}>
            <p className={styles.pavementTitle}>{M.PAVEMENT_TITLE}</p>
            <p className={styles.pavementBody}>
              {M.PAVEMENT_BODY(pavement.avoid_from, pavement.avoid_until, pavement.reason)}
            </p>
          </div>
        )}

        {/* お散歩◎の時間帯 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{M.WALK_TITLE}</h2>
          {walkWindows.length > 0 ? (
            <ul className={styles.windowList}>
              {walkWindows.map((w, i) => (
                <li key={i} className={`${styles.windowItem} ${styles.windowWalk}`}>
                  <span className={styles.windowTime}>{w.start}〜{w.end}</span>
                  {w.reason && <span className={styles.windowReason}>{w.reason}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyText}>{M.WALK_EMPTY}</p>
          )}
        </section>

        {/* 雨の時間帯 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{M.RAIN_TITLE}</h2>
          {rainWindows.length > 0 ? (
            <ul className={styles.windowList}>
              {rainWindows.map((w, i) => (
                <li key={i} className={`${styles.windowItem} ${styles.windowRain}`}>
                  <span className={styles.windowTime}>{w.start}〜{w.end}</span>
                  <span className={styles.windowReason}>{M.RAIN_PROB(w.max_precip_prob ?? 0)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyText}>{M.RAIN_EMPTY}</p>
          )}
        </section>

        {/* 注意したい時間帯 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{M.AVOID_TITLE}</h2>
          {avoidWindows.length > 0 ? (
            <ul className={styles.windowList}>
              {avoidWindows.map((w, i) => (
                <li key={i} className={`${styles.windowItem} ${styles.windowAvoid}`}>
                  <span className={styles.windowType}>{M.AVOID_TYPE[w.type] ?? w.type}</span>
                  <span className={styles.windowTime}>{w.start}〜{w.end}</span>
                  {w.reason && <span className={styles.windowReason}>{w.reason}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyText}>{M.AVOID_EMPTY}</p>
          )}
        </section>

        {/* 1時間ごとの予報（時系列グラフ。数値は表でも参照できる） */}
        {hourly.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{M.HOURLY_TITLE}</h2>
            <HourlyChart hourly={hourly} />
            <details className={styles.tableDetails}>
              <summary className={styles.tableToggle}>{M.CHART_TABLE_TOGGLE}</summary>
              <div className={styles.tableWrap}>
                <table className={styles.hourlyTable}>
                <thead>
                  <tr>
                    <th>{M.HOURLY_TIME}</th>
                    <th>{M.HOURLY_WEATHER}</th>
                    <th>{M.HOURLY_TEMP}</th>
                    <th>{M.HOURLY_FEELS}</th>
                    <th>{M.HOURLY_PRECIP}</th>
                    <th>{M.HOURLY_HUMIDITY}</th>
                    <th>{M.HOURLY_WIND}</th>
                  </tr>
                </thead>
                <tbody>
                  {hourly.map((h, i) => (
                    <tr key={i}>
                      <td className={styles.cellTime}>{h.time}</td>
                      <td>{h.weather ?? '—'}</td>
                      <td>{h.temp_c != null ? `${h.temp_c}${M.UNIT_TEMP}` : '—'}</td>
                      <td>{h.feels_c != null ? `${h.feels_c}${M.UNIT_TEMP}` : '—'}</td>
                      <td>{h.precip_prob != null ? `${h.precip_prob}${M.UNIT_PCT}` : '—'}</td>
                      <td>{h.humidity != null ? `${h.humidity}${M.UNIT_PCT}` : '—'}</td>
                      <td>{h.wind_ms != null ? `${h.wind_ms}${M.UNIT_WIND}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </details>
          </section>
        )}

        <p className={styles.attribution}>{M.SOURCE(doc.source)}</p>
      </main>
      <Footer />
    </div>
  );
};

export default WeatherPrefecture;
