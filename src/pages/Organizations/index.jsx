// src/pages/Organizations/index.jsx
// 全国横断の団体検索ページ。
// フィルタ状態（q / area / pref / species / view / page）はURLクエリに同期し、
// 共有・ブラウザバックで状態が再現できる。
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Pagination from '../../components/common/Pagination';
import AreaFilter from '../../components/organizations/AreaFilter';
import PrefectureFilter from '../../components/organizations/PrefectureFilter';
import CityFilter from '../../components/organizations/CityFilter';
import OrgCard from '../../components/organizations/OrgCard';
import JapanTileMap from '../../components/organizations/JapanTileMap';
import { fetchSearchIndex, fetchPrefectures, getAreas } from '../../services/api';
import { COMMON_MESSAGES, ORGANIZATIONS_MESSAGES, ORGANIZATION_DETAIL_MESSAGES } from '../../constants/locales/ja';
import { PAGINATION_CONSTANT } from '../../constants/pagination';
import styles from './Organizations.module.css';

const Organizations = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // フィルタ状態はURLクエリを唯一の情報源にする
  const query = searchParams.get('q') ?? '';
  const selectedArea = searchParams.get('area') ?? '';
  const selectedPrefecture = searchParams.get('pref') ?? '';
  const selectedCity = searchParams.get('city') ?? '';
  const speciesFilter = searchParams.get('species') ?? 'all';
  const view = searchParams.get('view') === 'map' ? 'map' : 'list';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [indexData, prefsData] = await Promise.all([
          fetchSearchIndex(),
          fetchPrefectures()
        ]);
        setAllOrganizations(indexData);
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
      if (value === '' || value == null || value === 'all' || (key === 'page' && value === 1) || (key === 'view' && value === 'list')) {
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

  // 掲載団体がある都道府県と、県ごとの団体数
  const countsByPrefecture = useMemo(() => {
    const counts = {};
    for (const org of allOrganizations) {
      counts[org.prefectureId] = (counts[org.prefectureId] ?? 0) + 1;
    }
    return counts;
  }, [allOrganizations]);

  const visiblePrefectures = useMemo(
    () => prefectures.filter(pref => countsByPrefecture[pref.id]),
    [prefectures, countsByPrefecture]
  );

  const areas = useMemo(() => getAreas(visiblePrefectures), [visiblePrefectures]);

  // 都道府県セレクタの選択肢（エリア選択時はそのエリア内に絞る）
  const prefectureOptions = selectedArea
    ? visiblePrefectures.filter(pref => pref.area === selectedArea)
    : visiblePrefectures;

  // 市区町村セレクタの選択肢（選択県内に限定。city は「・」区切りで複数を持つことがある）
  const cityOptions = useMemo(() => {
    if (!selectedPrefecture) return [];
    const set = new Set();
    for (const org of allOrganizations) {
      if (org.prefectureId !== selectedPrefecture) continue;
      for (const c of (org.city ?? '').split('・')) {
        const trimmed = c.trim();
        if (trimmed) set.add(trimmed);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [allOrganizations, selectedPrefecture]);

  // 絞り込み
  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allOrganizations.filter(org => {
      if (selectedArea && org.prefectureArea !== selectedArea) return false;
      if (selectedPrefecture && org.prefectureId !== selectedPrefecture) return false;
      if (selectedCity && !(org.city ?? '').split('・').map(s => s.trim()).includes(selectedCity)) return false;
      if (speciesFilter !== 'all' && !(org.species || []).includes(speciesFilter)) return false;
      if (normalizedQuery) {
        const haystack = `${org.name} ${org.city ?? ''} ${org.prefectureName}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [allOrganizations, query, selectedArea, selectedPrefecture, selectedCity, speciesFilter]);

  // ページネーション
  const itemsPerPage = PAGINATION_CONSTANT.SEARCH_NUM_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(filteredOrganizations.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrganizations = filteredOrganizations.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    updateParams({ page: pageNumber });
    window.scrollTo(0, 0);
  };

  const handleAreaChange = (area) => {
    // エリアを切り替えたら、そのエリア外の都道府県選択は解除する（市区町村も連動）
    const keepPref = selectedPrefecture &&
      prefectures.some(pref => pref.id === selectedPrefecture && (!area || pref.area === area));
    updateParams({ area, pref: keepPref ? selectedPrefecture : '', city: keepPref ? selectedCity : '' });
  };

  const hasActiveFilters = Boolean(query || selectedArea || selectedPrefecture || selectedCity || speciesFilter !== 'all');

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
        <h1 className={styles.title}>{ORGANIZATIONS_MESSAGES.TITLE}</h1>

        <div className={styles.filters}>
          <div className={styles.filterRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder={ORGANIZATIONS_MESSAGES.SEARCH_PLACEHOLDER}
              value={query}
              onChange={(e) => updateParams({ q: e.target.value }, { replace: true })}
              aria-label={ORGANIZATIONS_MESSAGES.SEARCH_PLACEHOLDER}
            />
            <div className={styles.speciesFilter} role="group" aria-label={ORGANIZATION_DETAIL_MESSAGES.SPECIES_FILTER_LABEL}>
              {[
                { value: 'all', label: ORGANIZATION_DETAIL_MESSAGES.SPECIES_ALL },
                { value: 'dog', label: ORGANIZATION_DETAIL_MESSAGES.SPECIES_DOG },
                { value: 'cat', label: ORGANIZATION_DETAIL_MESSAGES.SPECIES_CAT }
              ].map(option => (
                <button
                  key={option.value}
                  className={`${styles.speciesButton} ${speciesFilter === option.value ? styles.speciesButtonActive : ''}`}
                  onClick={() => updateParams({ species: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
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
              onFilterChange={(pref) => updateParams({ pref, city: '' })}
            />
            {selectedPrefecture && cityOptions.length > 0 && (
              <CityFilter
                cities={cityOptions}
                selectedCity={selectedCity}
                onFilterChange={(city) => updateParams({ city })}
              />
            )}
            {hasActiveFilters && (
              <button
                className={styles.clearButton}
                onClick={() => updateParams({ q: '', area: '', pref: '', city: '', species: 'all' })}
              >
                {ORGANIZATIONS_MESSAGES.CLEAR_FILTERS}
              </button>
            )}
          </div>
        </div>

        <div className={styles.viewTabs} role="group" aria-label={ORGANIZATIONS_MESSAGES.VIEW_TOGGLE_LABEL}>
          <button
            className={`${styles.viewTab} ${view === 'list' ? styles.viewTabActive : ''}`}
            aria-pressed={view === 'list'}
            onClick={() => updateParams({ view: 'list', page: safePage })}
          >
            {ORGANIZATIONS_MESSAGES.VIEW_LIST}
          </button>
          <button
            className={`${styles.viewTab} ${view === 'map' ? styles.viewTabActive : ''}`}
            aria-pressed={view === 'map'}
            onClick={() => updateParams({ view: 'map', page: safePage })}
          >
            {ORGANIZATIONS_MESSAGES.VIEW_MAP}
          </button>
        </div>

        {view === 'map' ? (
          <JapanTileMap
            prefectures={prefectures}
            counts={countsByPrefecture}
            onSelect={(prefId) => navigate(`/organizations/${prefId}`)}
          />
        ) : (
          <>
            {filteredOrganizations.length > 0 ? (
              <div className={styles.resultsInfo}>
                <p>
                  {ORGANIZATIONS_MESSAGES.RESULT_COUNT(
                    filteredOrganizations.length,
                    indexOfFirstItem + 1,
                    Math.min(indexOfLastItem, filteredOrganizations.length)
                  )}
                </p>
              </div>
            ) : (
              <p className={styles.noResults}>{ORGANIZATIONS_MESSAGES.ERROR_FOR_NO_RESULTS}</p>
            )}

            <div className={styles.organizationsList}>
              {currentOrganizations.map(org => (
                <OrgCard
                  key={`${org.prefectureId}-${org.id}`}
                  org={org}
                  detailPath={`/organizations/${org.prefectureId}/${org.id}`}
                  prefectureId={org.prefectureId}
                  showPrefecture
                />
              ))}
            </div>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Organizations;
