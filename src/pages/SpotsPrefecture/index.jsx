// src/pages/SpotsPrefecture/index.jsx
// 県別のお出かけスポット一覧ページ（/spots/:prefectureId）。
// OrganizationDetail（県別団体一覧）と対称の構成。
// ページ内フィルタは category のみ（県はすでに確定しているため）。
import { useState, useMemo } from 'react';
import { useParams, useLoaderData, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Pagination from '../../components/common/Pagination';
import SpotCard from '../../components/spots/SpotCard';
import CategoryFilter from '../../components/spots/CategoryFilter';
import CityFilter from '../../components/organizations/CityFilter';
import JsonLd from '../../components/common/JsonLd';
import { SPOTS_MESSAGES, SPOTS_PREFECTURE_MESSAGES } from '../../constants/locales/ja';
import { PAGINATION_CONSTANT } from '../../constants/pagination';
import { SITE } from '../../constants/site';
import styles from './SpotsPrefecture.module.css';

const SpotsPrefecture = () => {
  const { prefectureId } = useParams();
  // データは loader（services/loaders.js の spotsPrefectureLoader）が供給する。
  const { spots, prefecture } = useLoaderData();

  // ページ内フィルタ・ページネーション
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = PAGINATION_CONSTANT.NUM_PER_PAGE;

  // データ中に存在するカテゴリのみフィルタに出す（0件カテゴリは非表示）
  const categories = useMemo(
    () => ['dog_run', 'cafe', 'park'].filter(c => spots.some(spot => spot.category === c)),
    [spots]
  );

  // 市区町村セレクタの選択肢（spot.city は単一の市区町村名）
  const cityOptions = useMemo(() => {
    const set = new Set();
    for (const spot of spots) {
      if (spot.city) set.add(spot.city);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [spots]);

  const filteredSpots = spots.filter(spot =>
    (categoryFilter === 'all' || spot.category === categoryFilter) &&
    (cityFilter === 'all' || spot.city === cityFilter));

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleCityChange = (value) => {
    setCityFilter(value === '' ? 'all' : value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredSpots.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpots = filteredSpots.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (!spots || spots.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1>{SPOTS_PREFECTURE_MESSAGES.SPOTS_NOT_FOUND}</h1>
          <Link to="/spots">{SPOTS_PREFECTURE_MESSAGES.BACK_TO_SPOTS}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const prefectureName = prefecture?.name ?? '';

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SPOTS_MESSAGES.BREADCRUMB_HOME ?? 'ホーム', item: `${SITE.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: SPOTS_MESSAGES.TITLE, item: `${SITE.BASE_URL}/spots` },
      { '@type': 'ListItem', position: 3, name: prefectureName, item: `${SITE.BASE_URL}/spots/${prefectureId}` },
    ],
  };

  return (
    <div className={styles.container}>
      <JsonLd data={breadcrumbLd} />
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          <Link to="/">{SPOTS_PREFECTURE_MESSAGES.BREADCRUMB_HOME}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link to="/spots">{SPOTS_PREFECTURE_MESSAGES.BREADCRUMB_SEARCH}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span>{prefectureName}</span>
        </nav>

        <h1 className={styles.title}>
          {SPOTS_PREFECTURE_MESSAGES.TITLE(prefectureName, spots.length)}
        </h1>

        <div className={styles.backLink}>
          <Link to="/spots">{SPOTS_PREFECTURE_MESSAGES.BACK_TO_SPOTS}</Link>
        </div>

        <div className={styles.filterBar}>
          <CategoryFilter
            categories={categories}
            selectedCategory={categoryFilter}
            onFilterChange={handleCategoryChange}
          />
          {cityOptions.length > 0 && (
            <CityFilter
              cities={cityOptions}
              selectedCity={cityFilter === 'all' ? '' : cityFilter}
              onFilterChange={handleCityChange}
            />
          )}
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
          <p className={styles.noResults}>{SPOTS_PREFECTURE_MESSAGES.NO_MATCHING_SPOTS}</p>
        )}

        <div className={styles.spotsList}>
          {currentSpots.map(spot => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        <p className={styles.attribution}>{SPOTS_MESSAGES.OSM_ATTRIBUTION}</p>
      </main>
      <Footer />
    </div>
  );
};

export default SpotsPrefecture;
