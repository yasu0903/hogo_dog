// src/components/common/Pagination/index.jsx
// 一覧ページ共通のページネーション
import styles from './Pagination.module.css';
import { ORGANIZATION_DETAIL_MESSAGES } from '../../../constants/locales/ja';
import { PAGINATION_CONSTANT } from '../../../constants/pagination';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const goToPrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

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

  const pageNumbers = [];
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
          <button className={styles.pageButton} onClick={() => onPageChange(1)}>
            1
          </button>
          {startPage > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <button
          key={number}
          className={`${styles.pageButton} ${currentPage === number ? styles.active : ''}`}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
          <button className={styles.pageButton} onClick={() => onPageChange(totalPages)}>
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

export default Pagination;
