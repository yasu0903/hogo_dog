// src/pages/OrganizationDetail/index.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { fetchOrganizationDetail, fetchPrefectureiById } from '../../services/api';
import styles from './OrganizationDetail.module.css';
import { ORGANIZAION_DETAIL_MESSAGES, COMMON_MESSAGES } from '../../constants/locales/ja';
import { PAGINAION_CONSTANT } from '../../constants/pagination';

// SNSタイプに応じたアイコンを取得する関数
const getSnsIcon = (type) => {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('twitter') || lowerType.includes('x')) {
    return { icon: '𝕏', className: styles.snsIconTwitter };
  } else if (lowerType.includes('facebook') || lowerType.includes('fb')) {
    return { icon: 'ⓕ', className: styles.snsIconFacebook };
  } else if (lowerType.includes('instagram') || lowerType.includes('insta')) {
    return { icon: '📷', className: styles.snsIconInstagram };
  } else if (lowerType.includes('youtube') || lowerType.includes('yt')) {
    return { icon: '▶️', className: styles.snsIconYoutube };
  } else if (lowerType.includes('line')) {
    return { icon: '💬', className: styles.snsIconLine };
  } else if (lowerType.includes('website') || lowerType.includes('site') || lowerType.includes('web') || lowerType.includes('blog'))   {
    return { icon: '📃', className: styles.snsIconWebsite };
  } else if (lowerType.includes('tiktok'))   {
    return { icon: '🎵', className: styles.snsIconTiktok };
  } else {
    return { icon: '🔗', className: styles.snsIconOther };
  }
};

const OrganizationDetail = () => {
  const { id } = useParams();
  const [organizations, setOrganizations] = useState([]);
  const [prefecture, setPrefecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ページネーション用の状態を追加
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(PAGINAION_CONSTANT.NUM_PER_PAGE); // 1ページに表示する団体数
  
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const data = await fetchOrganizationDetail(id);
        setOrganizations(data);
      } catch (error) {
        console.error('Error loading organization:', error);
        setError(ORGANIZAION_DETAIL_MESSAGES.ERROR_FOR_ORGANIZAION_LOADING);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrganization();

    const loadPrefecture = async () => {
      try {
        const data = await fetchPrefectureiById(id);
        setPrefecture(data);
      } catch (error) {
        console.error('Error loading prefectures:', error);
        setError(ORGANIZAION_DETAIL_MESSAGES.ERROR_FOR_PREFECTURE_LOADING);
      } finally {
        setLoading(false);
      }
    };
    
    loadPrefecture();

  }, [id]);
  
  // 表示すべき団体のインデックス計算
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrganizations = organizations.slice(indexOfFirstItem, indexOfLastItem);
  
  // 全ページ数を計算
  const totalPages = Math.ceil(organizations.length / itemsPerPage);
  
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
    if (endPage - startPage < PAGINAION_CONSTANT.NUM_OF_DISPLAY_PAGES) {
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
          {ORGANIZAION_DETAIL_MESSAGES.BACK}
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
        {ORGANIZAION_DETAIL_MESSAGES.NEXT}
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
          <Link to="/organizations">{ORGANIZAION_DETAIL_MESSAGES.BACK_TO_ORGANIZATION_LIST}</Link>
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
          <h1>{ORGANIZAION_DETAIL_MESSAGES.ORGANIZAION_NOT_FOUND}</h1>
          <Link to="/organizations">{ORGANIZAION_DETAIL_MESSAGES.BACK_TO_ORGANIZATION_LIST}</Link>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{`${prefecture.name}の団体一覧`}</h1>
        
        <div className={styles.backLink}>
          <Link to="/organizations">{ORGANIZAION_DETAIL_MESSAGES.BACK_TO_ORGANIZATION_LIST}</Link>
        </div>
        
        {organizations.length > 0 && (
          <div className={styles.resultsInfo}>
            <p>全{organizations.length}件中 {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, organizations.length)}件を表示</p>
          </div>
        )}
        {totalPages > 1 && <Pagination />} 

        <div className={styles.organizationsList}>
          {currentOrganizations.map(org => (
            <div key={org.id} className={styles.orgItem}>
              <h2>{org.name}</h2>
              <p className={styles.area}>{ORGANIZAION_DETAIL_MESSAGES.AREA}: {org.area}</p>
              
              {org.website && (
                <p className={styles.website}>
                  <a href={org.website} target="_blank" rel="noopener noreferrer">
                    {ORGANIZAION_DETAIL_MESSAGES.WEBSITE} 
                  </a>
                </p>
              )}
              
              {org.note && <p className={styles.note}>{org.note}</p>}
              
              {org.sns && org.sns.length > 0 && (
                <div className={styles.snsLinks}>
                  <h3>{ORGANIZAION_DETAIL_MESSAGES.SNS}</h3>
                  <ul>
                    {org.sns.map((snsItem, index) => {
                      const { icon, className } = getSnsIcon(snsItem.type);
                      return (
                        <li key={index}>
                          <span className={`${styles.snsIcon} ${className}`}>{icon}</span>
                          <a href={snsItem.url} target="_blank" rel="noopener noreferrer">
                            {snsItem.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
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