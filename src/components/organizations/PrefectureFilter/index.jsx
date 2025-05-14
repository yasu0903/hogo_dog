// src/components/organizations/PrefectureFilter/index.jsx
import styles from './PrefectureFilter.module.css';

const PrefectureFilter = ({ prefectures, selectedPrefecture, onFilterChange }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    console.log('Selected prefecture:', value);
    onFilterChange(value);
  };

  // prefecturesが配列でない場合のバックアップ
  const validPrefectures = Array.isArray(prefectures) ? prefectures : [];

  return (
    <div className={styles.filter}>
      <label htmlFor="prefecture">都道府県で絞り込み:</label>
      <select
        id="prefecture"
        value={selectedPrefecture}
        onChange={handleChange}
        className={styles.select}
      >
        <option value="">すべて</option>
        {validPrefectures.map((pref) => (
          <option key={pref.id} value={pref.id}>
            {pref.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PrefectureFilter;