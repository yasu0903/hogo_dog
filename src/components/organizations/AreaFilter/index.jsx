// src/components/organizations/AreaFilter.jsx
import styles from './AreaFilter.module.css';
import { FILTER_MESSAGES } from '../../../constants/locales/ja';

const AreaFilter = ({ areas, selectedArea, onFilterChange }) => {
  return (
    <div className={styles.filterContainer}>
      <label htmlFor="area-select" className={styles.filterLabel}>
        {FILTER_MESSAGES.AREA.LABEL}
      </label>
      <select
        id="area-select"
        value={selectedArea}
        onChange={(e) => onFilterChange(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="">{FILTER_MESSAGES.AREA.ALL_AREA}</option>
        {areas.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AreaFilter;