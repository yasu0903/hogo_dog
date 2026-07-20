// src/components/spots/CategoryFilter/index.jsx
// スポットのカテゴリ絞り込みボタン群（Organizations ページの species フィルタと同型）。
// categories にはデータ中に存在するカテゴリのみ渡す（0件カテゴリは非表示にする）。
import styles from './CategoryFilter.module.css';
import { SPOTS_MESSAGES, SPOT_CATEGORY_LABELS } from '../../../constants/locales/ja';

const CategoryFilter = ({ categories, selectedCategory, onFilterChange }) => {
  const options = [
    { value: 'all', label: SPOTS_MESSAGES.CATEGORY_ALL },
    ...categories.map((category) => ({
      value: category,
      label: SPOT_CATEGORY_LABELS[category] ?? category
    }))
  ];

  return (
    <div className={styles.categoryFilter} role="group" aria-label={SPOTS_MESSAGES.CATEGORY_LABEL}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.categoryButton} ${selectedCategory === option.value ? styles.categoryButtonActive : ''}`}
          aria-pressed={selectedCategory === option.value}
          onClick={() => onFilterChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
