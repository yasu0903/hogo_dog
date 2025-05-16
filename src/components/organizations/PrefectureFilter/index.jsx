// src/components/organizations/PrefectureFilter.jsx
import styles from './PrefectureFilter.module.css';

const PrefectureFilter = ({ prefectures, selectedPrefecture, onFilterChange }) => {
  return (
    <div className={styles.filterContainer}>
      <label htmlFor="prefecture-select" className={styles.filterLabel}>
        都道府県で絞り込み
      </label>
      <select
        id="prefecture-select"
        value={selectedPrefecture}
        onChange={(e) => onFilterChange(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="">すべての都道府県</option>
        {prefectures.map((prefecture) => (
          <option key={prefecture.id} value={prefecture.id}>
            {prefecture.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PrefectureFilter;