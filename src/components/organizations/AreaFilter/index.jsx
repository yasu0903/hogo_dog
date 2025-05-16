// src/components/organizations/AreaFilter.jsx
import styles from './AreaFilter.module.css';

const AreaFilter = ({ areas, selectedArea, onFilterChange }) => {
  return (
    <div className={styles.filterContainer}>
      <label htmlFor="area-select" className={styles.filterLabel}>
        エリアで絞り込み
      </label>
      <select
        id="area-select"
        value={selectedArea}
        onChange={(e) => onFilterChange(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="">全エリア</option>
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