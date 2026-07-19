// src/components/organizations/PrefectureFilter.jsx
import styles from './PrefectureFilter.module.css';
import { FILTER_MESSAGES, ORGANIZATIONS_MESSAGES } from '../../../constants/locales/ja';

const PrefectureFilter = ({ prefectures, selectedPrefecture, onFilterChange }) => {
  return (
    <div className={styles.filterContainer}>
      <label htmlFor="prefecture-select" className={styles.filterLabel}>
        {FILTER_MESSAGES.PREFECTURE.LABEL}
      </label>
      <select
        id="prefecture-select"
        value={selectedPrefecture}
        onChange={(e) => onFilterChange(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="">{ORGANIZATIONS_MESSAGES.ALL_PREFECTURES}</option>
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