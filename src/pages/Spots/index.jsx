// src/pages/Spots/index.jsx
// 犬とお出かけできるスポットの全国横断検索ページ。
// フィルタ状態（q / area / pref / category / page）はURLクエリに同期し、
// 共有・ブラウザバックで状態が再現できる（view は W2 の地図ビューで追加予定）。
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Seo from '../../components/common/Seo';
import Pagination from '../../components/common/Pagination';
import AreaFilter from '../../components/organizations/AreaFilter';
import PrefectureFilter from '../../components/organizations/PrefectureFilter';
import SpotCard from '../../components/spots/SpotCard';
import CategoryFilter from '../../components/spots/CategoryFilter';
import { fetchSpotsIndex, fetchPrefectures, getAreas } from '../../services/api';
import { COMMON_MESSAGES, SPOTS_MESSAGES } from '../../constants/locales/ja';
import { PAGINATION_CONSTANT } from '../../constants/pagination';
import styles from './Spots.module.css';

const Spots = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allSpots, setAllSpots] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // フィルタ状態はURLクエリを唯一の情報源にする
  const query = searchParams.get('q') ?? '';
  const selectedArea = searchParams.get('area') ?? '';
  const selectedPrefecture = searchParams.get('pref') ?? '';
  const categoryFilter = searchParams.get('category') ?? 'all';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [spotsData, prefsData] = await Promise.all([
          fetchSpotsIndex(),
          fetchPrefectures()
        ]);
        setAllSpots(spotsData);
        setPrefectures(prefsData);
      } catch (error) {
        console.error(COMMON_MESSAGES.ERROR_WHILE_LOADING, error);
        setError(COMMON_MESSAGES.FAILED_LOADING_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // URLクエリの更新。フィルタ変更時はページ番号をリセットする
  const updateParams = (patch, { replace = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === '' || value == null || value === 'all' || (key === 'page' && value === 1)) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }
    if (!('page' in patch)) {
      next.delete('page');
    }
    setSearchParams(next, { replace });
  };

  // 掲載スポットがある都道府県と、県ごとのスポット数
  const countsByPrefecture = useMemo(() => {
    const counts = {};
    for (const spot of allSpots) {
      counts[spot.prefectureId] = (counts[spot.prefectureId] ?? 0) + 1;
    }
    return counts;
  }, [allSpots]);

  const visiblePrefectures = useMemo(
    () => prefectures.filter(pref => countsByPrefecture[pref.id]),
    [prefectures, countsByPrefecture]
  );

  const areas = useMemo(() => getAreas(visiblePrefectures), [visiblePrefectures]);

  // データ中に存在するカテゴリのみフィルタに出す（0件カテゴリは非表示）
  const categories = useMemo(
    () => ['dog_run', 'cafe', 'park'].filter(c => allSpots.some(spot => spot.category === c)),
    [allSpots]
  );

  // 都道府県セレクタの選択肢（エリア選択時はそのエリア内に絞る）
  const prefectureOptions = selectedArea
    ? visiblePrefectures.filter(pref => pref.area === selectedArea)
    : visiblePrefectures;

  // 絞り込み
  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allSpots.filter(spot => {
      if (selectedArea && spot.prefectureArea !== selectedArea) return false;
      if (selectedPrefecture && spot.prefectureId !== selectedPrefecture) return false;
      if (categoryFilter !== 'all' && spot.category !== categoryFilter) return false;
      if (normalizedQuery) {
        const haystack = `${spot.name} ${spot.city ?? ''} ${spot.prefectureName}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [allSpots, query, selectedArea, selectedPrefecture, categoryFilter]);

  // ページネーション
  const itemsPerPage = PAGINATION_CONSTANT.SEARCH_NUM_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(filteredSpots.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpots = filteredSpots.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    updateParams({ page: pageNumber });
    window.scrollTo(0, 0);
  };

  const handleAreaChange = (area) => {
    // エリアを切り替えたら、そのエリア外の都道府県選択は解除する
    const keepPref = selectedPrefecture &&
      prefectures.some(pref => pref.id === selectedPrefecture && (!area || pref.area === area));
    updateParams({ area, pref: keepPref ? selectedPrefecture : '' });
  };

  const hasActiveFilters = Boolean(query || selectedArea || selectedPrefecture || categoryFilter !== 'all');

  if (loading) {
    return <div className={styles.loading}>{COMMON_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <Seo
        title={SPOTS_MESSAGES.TITLE}
        description={SPOTS_MESSAGES.DESCRIPTION}
        path="/spots"
      />
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{SPOTS_MESSAGES.TITLE}</h1>

        <div className={styles.filters}>
          <div className={styles.filterRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder={SPOTS_MESSAGES.SEARCH_PLACEHOLDER}
              value={query}
              onChange={(e) => updateParams({ q: e.target.value }, { replace: true })}
              aria-label={SPOTS_MESSAGES.SEARCH_PLACEHOLDER}
            />
            <CategoryFilter
              categories={categories}
              selectedCategory={categoryFilter}
              onFilterChange={(category) => updateParams({ category })}
            />
          </div>

          <div className={styles.filterRow}>
            <AreaFilter
              areas={areas}
              selectedArea={selectedArea}
              onFilterChange={handleAreaChange}
            />
          </div>

          <div className={styles.filterRow}>
            <PrefectureFilter
              prefectures={prefectureOptions}
              selectedPrefecture={selectedPrefecture}
              onFilterChange={(pref) => updateParams({ pref })}
            />
            {hasActiveFilters && (
              <button
                className={styles.clearButton}
                onClick={() => updateParams({ q: '', area: '', pref: '', category: 'all' })}
              >
                {SPOTS_MESSAGES.CLEAR_FILTERS}
              </button>
            )}
          </div>
        </div>

        {filteredSpots.length > 0 ? (
          <div className={styles.resultsInfo}>
            <p>
              {SPOTS_MESSAGES.RESULT_COUNT(
                filteredSpots.length,
                indexOfFirstItem + 1,
                Math.min(indexOfLastItem, filteredSpots.length)
              )}
            </p>
          </div>
        ) : (
          <p className={styles.noResults}>{SPOTS_MESSAGES.ERROR_FOR_NO_RESULTS}</p>
        )}

        <div className={styles.spotsList}>
          {currentSpots.map(spot => (
            <SpotCard key={`${spot.prefectureId}-${spot.id}`} spot={spot} />
          ))}
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        <p className={styles.attribution}>{SPOTS_MESSAGES.OSM_ATTRIBUTION}</p>
      </main>
      <Footer />
    </div>
  );
};

export default Spots;
