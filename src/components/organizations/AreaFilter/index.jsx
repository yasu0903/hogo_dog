// src/components/organizations/AreaFilter.jsx
import styles from './AreaFilter.module.css';
import { FILTER_MESSAGES } from '../../../constants/locales/ja';

const AreaFilter = ({ areas, selectedArea, onFilterChange }) => {
  return (
    <div className={styles.filterContainer}>
      <span className={styles.filterLabel}>{FILTER_MESSAGES.AREA.LABEL}</span>
      <div className={styles.chips} role="group" aria-label={FILTER_MESSAGES.AREA.LABEL}>
        <button
          type="button"
          className={`${styles.chip} ${selectedArea === '' ? styles.chipActive : ''}`}
          aria-pressed={selectedArea === ''}
          onClick={() => onFilterChange('')}
        >
          {FILTER_MESSAGES.AREA.ALL_AREA}
        </button>
        {areas.map((area) => (
          <button
            key={area}
            type="button"
            className={`${styles.chip} ${selectedArea === area ? styles.chipActive : ''}`}
            aria-pressed={selectedArea === area}
            onClick={() => onFilterChange(area)}
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AreaFilter;
