// src/components/organizations/AreaFilter/index.jsx
import styles from './AreaFilter.module.css';

const AreaFilter = ({ areas, selectedArea, onFilterChange }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    console.log('Selected area:', value);
    onFilterChange(value);
  };

  return (
    <div className={styles.filter}>
      <label htmlFor="area">エリアで絞り込み:</label>
      <select
        id="area"
        value={selectedArea}
        onChange={handleChange}
        className={styles.select}
      >
        <option value="">すべて</option>
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