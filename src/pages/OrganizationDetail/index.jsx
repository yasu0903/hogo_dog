import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { fetchOrganizationDetail, fetchPrefectureById, fetchSourceById } from '../../services/api';
import styles from './OrganizationDetail.module.css';
import { ORGANIZATION_DETAIL_MESSAGES, COMMON_MESSAGES } from '../../constants/locales/ja';
import { PAGINATION_CONSTANT } from '../../constants/pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXTwitter,
  faFacebookF,
  faInstagram,
  faYoutube,
  faLine,
  faTiktok
} from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faLink } from '@fortawesome/free-solid-svg-icons';

// SNSタイプに応じたFont Awesomeアイコンを取得する関数
const getSnsIcon = (type) => {
  const lowerType = type.toLowerCase();

  if (lowerType.includes('twitter') || lowerType.includes('x')) {
    return { icon: <FontAwesomeIcon icon={faXTwitter} />, className: styles.snsIconTwitter };
  } else if (lowerType.includes('facebook') || lowerType.includes('fb')) {
    return { icon: <FontAwesomeIcon icon={faFacebookF} />, className: styles.snsIconFacebook };
  } else if (lowerType.includes('instagram') || lowerType.includes('insta')) {
    return { icon: <FontAwesomeIcon icon={faInstagram} />, className: styles.snsIconInstagram };
  } else if (lowerType.includes('youtube') || lowerType.includes('yt')) {
    return { icon: <FontAwesomeIcon icon={faYoutube} />, className: styles.snsIconYoutube };
  } else if (lowerType.includes('line')) {
    return { icon: <FontAwesomeIcon icon={faLine} />, className: styles.snsIconLine };
  } else if (lowerType.includes('website') || lowerType.includes('site') || lowerType.includes('web') || lowerType.includes('blog')) {
    return { icon: <FontAwesomeIcon icon={faGlobe} />, className: styles.snsIconWebsite };
  } else if (lowerType.includes('tiktok')) {
    return { icon: <FontAwesomeIcon icon={faTiktok} />, className: styles.snsIconTiktok };
  } else {
    return { icon: <FontAwesomeIcon icon={faLink} />, className: styles.snsIconOther };
  }
};

const OrganizationDetail = () => {
  const { id } = useParams();
  const [organizations, setOrganizations] = useState([]);
  const [prefecture, setPrefecture] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ページネーション用の状態を追加
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(PAGINATION_CONSTANT.NUM_PER_PAGE); // 1ページに表示する団体数

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

  // 全ページ数を計算
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);

  // ページ変更ハンドラー
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // ページトップにスクロール
    window.scrollTo(0, 0);
  };

  // 前のページへ
  const goToPrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // 次のページへ
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // ページネーションコンポーネント
  const Pagination = () => {
    const pageNumbers = [];

    // 表示するページ番号を決定
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // 最低5ページ表示するための調整
    if (endPage - startPage < PAGINATION_CONSTANT.NUM_OF_DISPLAY_PAGES) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
          onClick={goToPrevPage}
          disabled={currentPage === 1}
        >
          {ORGANIZATION_DETAIL_MESSAGES.BACK}
        </button>

        {startPage > 1 && (
          <>
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            className={`${styles.pageButton} ${currentPage === number ? styles.active : ''}`}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
        {ORGANIZATION_DETAIL_MESSAGES.NEXT}
        </button>
      </div>
    );
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
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          <Link to="/">{ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_HOME}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link to="/organizations">{ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_ORGANIZATIONS}</Link>
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
        {totalPages > 1 && <Pagination />}

        <div className={styles.organizationsList}>
          {currentOrganizations.map(org => (
            <div key={org.id} className={styles.orgItem}>
              <h2>{org.name}</h2>

              <div className={styles.badgeRow}>
                {org.species?.includes('dog') && (
                  <span className={`${styles.badge} ${styles.badgeDog}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_DOG}</span>
                )}
                {org.species?.includes('cat') && (
                  <span className={`${styles.badge} ${styles.badgeCat}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_CAT}</span>
                )}
                {org.sourceType === 'official' && (
                  <span className={`${styles.badge} ${styles.badgeOfficial}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_OFFICIAL}</span>
                )}
                {org.caution && (
                  <span className={`${styles.badge} ${styles.badgeCaution}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_CAUTION}</span>
                )}
              </div>

              <p className={styles.area}>
                {ORGANIZATION_DETAIL_MESSAGES.ACTIVITY_AREA}: {org.area}{org.city ? `・${org.city}` : ''}
              </p>

              <div className={styles.linkRow}>
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.websiteChip}
                  >
                    <FontAwesomeIcon icon={faGlobe} />
                    <span>{ORGANIZATION_DETAIL_MESSAGES.WEBSITE}</span>
                  </a>
                )}

                {org.sns && org.sns.map((snsItem, index) => {
                  const { icon, className } = getSnsIcon(snsItem.type);
                  return (
                    <a
                      key={index}
                      href={snsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.snsChip} ${className}`}
                      title={snsItem.name}
                      aria-label={snsItem.name}
                    >
                      {icon}
                    </a>
                  );
                })}
              </div>

              {org.caution && <p className={styles.caution}>{org.caution}</p>}

              {org.note && <p className={styles.note}>{org.note}</p>}

            </div>
          ))}
        </div>

        {/* ページネーションを表示（団体が複数ページに分かれる場合のみ） */}
        {totalPages > 1 && <Pagination />}
      </main>
      <Footer />
    </div>
  );
};

export default OrganizationDetail;
