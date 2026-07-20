// src/components/organizations/CityFilter/index.jsx
// 市区町村での絞り込みセレクタ。PrefectureFilter と同構造。
// 団体検索・お出かけスポット検索の両方で共用する（都道府県選択時にのみ表示）。
import styles from './CityFilter.module.css';
import { FILTER_MESSAGES, ORGANIZATIONS_MESSAGES } from '../../../constants/locales/ja';

const CityFilter = ({ cities, selectedCity, onFilterChange }) => {
  return (
    <div className={styles.filterContainer}>
      <label htmlFor="city-select" className={styles.filterLabel}>
        {FILTER_MESSAGES.CITY.LABEL}
      </label>
      <select
        id="city-select"
        value={selectedCity}
        onChange={(e) => onFilterChange(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="">{ORGANIZATIONS_MESSAGES.ALL_CITIES}</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CityFilter;
