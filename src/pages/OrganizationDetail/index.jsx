// src/pages/OrganizationDetail/index.jsx
// 県別の団体一覧ページ（/organizations/:id）
import { useState, useMemo } from 'react';
import { useParams, useLoaderData, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Pagination from '../../components/common/Pagination';
import OrgCard from '../../components/organizations/OrgCard';
import CityFilter from '../../components/organizations/CityFilter';
import JsonLd from '../../components/common/JsonLd';
import styles from './OrganizationDetail.module.css';
import { ORGANIZATION_DETAIL_MESSAGES } from '../../constants/locales/ja';
import { PAGINATION_CONSTANT } from '../../constants/pagination';
import { SITE } from '../../constants/site';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

const OrganizationDetail = () => {
  const { id } = useParams();
  // データは loader（services/loaders.js の organizationDetailLoader）が供給する。
  // SSG時はビルド時に fs 経由で解決されるため、本文までHTMLに焼かれる。
  const { organizations, prefecture, source } = useLoaderData();

  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(PAGINATION_CONSTANT.NUM_PER_PAGE);

  // 絞り込み用の状態
  const [speciesFilter, setSpeciesFilter] = useState('all'); // 'all' | 'dog' | 'cat'
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 市区町村セレクタの選択肢（city は「・」区切りで複数を持つことがある）
  const cityOptions = useMemo(() => {
    const set = new Set();
    for (const org of organizations) {
      for (const c of (org.city ?? '').split('・')) {
        const trimmed = c.trim();
        if (trimmed) set.add(trimmed);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [organizations]);

  // 絞り込み(犬/猫フィルタ + 市区町村 + 団体名の部分一致検索)
  const filteredOrganizations = organizations.filter(org => {
    if (speciesFilter !== 'all' && !(org.species || []).includes(speciesFilter)) {
      return false;
    }
    if (cityFilter !== 'all' && !(org.city ?? '').split('・').map(s => s.trim()).includes(cityFilter)) {
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

  const handleCityFilterChange = (value) => {
    setCityFilter(value === '' ? 'all' : value);
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

  // 構造化データ（パンくず）
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_HOME, item: `${SITE.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_SEARCH, item: `${SITE.BASE_URL}/organizations` },
      { '@type': 'ListItem', position: 3, name: prefectureName, item: `${SITE.BASE_URL}/organizations/${id}` },
    ],
  };

  return (
    <div className={styles.container}>
      <JsonLd data={breadcrumbLd} />
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

        <p style={{ margin: '0 0 20px', color: '#555', lineHeight: 1.8, fontSize: '0.95rem' }}>
          {`${prefectureName}で活動する保護犬・保護猫団体を${organizations.length}件掲載しています。`}
          里親募集・譲渡会・預かりボランティアなどの最新情報は、各団体の公式サイト・SNSからご確認ください。
          {source?.isOfficial ? `この一覧は${prefectureName}が公表する資料に基づいています。` : ''}
        </p>

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

        {cityOptions.length > 0 && (
          <div className={styles.filterBar}>
            <CityFilter
              cities={cityOptions}
              selectedCity={cityFilter === 'all' ? '' : cityFilter}
              onFilterChange={handleCityFilterChange}
            />
          </div>
        )}

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
