// src/pages/OrganizationDetail/index.jsx
// 県別の団体一覧ページ（/organizations/:id）
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Seo from '../../components/common/Seo';
import Pagination from '../../components/common/Pagination';
import OrgCard from '../../components/organizations/OrgCard';
import { fetchOrganizationDetail, fetchPrefectureById, fetchSourceById } from '../../services/api';
import styles from './OrganizationDetail.module.css';
import { ORGANIZATION_DETAIL_MESSAGES, COMMON_MESSAGES } from '../../constants/locales/ja';
import { PAGINATION_CONSTANT } from '../../constants/pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

const OrganizationDetail = () => {
  const { id } = useParams();
  const [organizations, setOrganizations] = useState([]);
  const [prefecture, setPrefecture] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(PAGINATION_CONSTANT.NUM_PER_PAGE);

  // 絞り込み用の状態
  const [speciesFilter, setSpeciesFilter] = useState('all'); // 'all' | 'dog' | 'cat'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgsData, prefData, sourceData] = await Promise.all([
          fetchOrganizationDetail(id),
          fetchPrefectureById(id),
          fetchSourceById(id)
        ]);
        setOrganizations(orgsData);
        setPrefecture(prefData);
        setSource(sourceData);
      } catch (error) {
        console.error('Error loading organization detail:', error);
        setError(ORGANIZATION_DETAIL_MESSAGES.ERROR_FOR_ORGANIZAION_LOADING);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // 絞り込み(犬/猫フィルタ + 団体名の部分一致検索)
  const filteredOrganizations = organizations.filter(org => {
    if (speciesFilter !== 'all' && !(org.species || []).includes(speciesFilter)) {
      return false;
    }
    const query = searchQuery.trim().toLowerCase();
    if (query && !org.name.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });

  // 絞り込み条件が変わったら1ページ目に戻す
  const handleSpeciesFilterChange = (value) => {
    setSpeciesFilter(value);
    setCurrentPage(1);
  };

  const handleSearchQueryChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // 表示すべき団体のインデックス計算
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrganizations = filteredOrganizations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

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
          <Link to="/organizations">{ORGANIZATION_DETAIL_MESSAGES.BACK_TO_ORGANIZATION_LIST}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1>{ORGANIZATION_DETAIL_MESSAGES.ORGANIZAION_NOT_FOUND}</h1>
          <Link to="/organizations">{ORGANIZATION_DETAIL_MESSAGES.BACK_TO_ORGANIZATION_LIST}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const prefectureName = prefecture?.name ?? '';

  return (
    <div className={styles.container}>
      <Seo
        title={`${prefectureName}の保護犬団体`}
        description={`${prefectureName}で活動する保護犬・保護猫団体${organizations.length}件の一覧。行政公表情報に基づき掲載しています。`}
        path={`/organizations/${id}`}
      />
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          <Link to="/">{ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_HOME}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link to="/organizations">{ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_SEARCH}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span>{prefectureName}</span>
        </nav>

        <h1 className={styles.title}>{`${prefectureName}の保護犬団体（${organizations.length}件）`}</h1>

        {source && (
          <div className={styles.sourceBanner}>
            <p>
              {source.isOfficial
                ? ORGANIZATION_DETAIL_MESSAGES.SOURCE_OFFICIAL(prefectureName, source.asOf)
                : ORGANIZATION_DETAIL_MESSAGES.SOURCE_INDEPENDENT(prefectureName)}
            </p>
            {source.sourceUrl && (
              <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLink} /> {ORGANIZATION_DETAIL_MESSAGES.SOURCE_LINK}
              </a>
            )}
          </div>
        )}

        <div className={styles.backLink}>
          <Link to="/organizations">{ORGANIZATION_DETAIL_MESSAGES.BACK_TO_ORGANIZATION_LIST}</Link>
        </div>

        <div className={styles.filterBar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder={ORGANIZATION_DETAIL_MESSAGES.SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            aria-label={ORGANIZATION_DETAIL_MESSAGES.SEARCH_PLACEHOLDER}
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
                onClick={() => handleSpeciesFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrganizations.length > 0 ? (
          <div className={styles.resultsInfo}>
            <p>全{filteredOrganizations.length}件中 {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrganizations.length)}件を表示</p>
          </div>
        ) : (
          <p className={styles.noResults}>{ORGANIZATION_DETAIL_MESSAGES.NO_MATCHING_ORGANIZATIONS}</p>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

        <div className={styles.organizationsList}>
          {currentOrganizations.map(org => (
            <OrgCard
              key={org.id}
              org={org}
              detailPath={`/organizations/${id}/${org.id}`}
            />
          ))}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>
      <Footer />
    </div>
  );
};

export default OrganizationDetail;
