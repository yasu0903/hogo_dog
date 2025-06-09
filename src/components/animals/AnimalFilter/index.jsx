import React, { useState } from 'react';
import styles from './AnimalFilter.module.css';

const AnimalFilter = ({ onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    species: '',
    gender: '',
    status: '',
    age_range: '',
    search: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      species: '',
      gender: '',
      status: '',
      age_range: '',
      search: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>絞り込み検索</h3>
        {hasActiveFilters && (
          <button 
            className={styles.clearButton}
            onClick={clearFilters}
            disabled={loading}
          >
            クリア
          </button>
        )}
      </div>

      <div className={styles.filters}>
        {/* 検索キーワード */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>キーワード検索</label>
          <input
            type="text"
            className={styles.input}
            placeholder="名前、品種、説明で検索..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 種類 */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>種類</label>
          <select
            className={styles.select}
            value={filters.species}
            onChange={(e) => handleFilterChange('species', e.target.value)}
            disabled={loading}
          >
            <option value="">すべて</option>
            <option value="dog">犬</option>
            <option value="cat">猫</option>
            <option value="rabbit">うさぎ</option>
            <option value="bird">鳥</option>
            <option value="other">その他</option>
          </select>
        </div>

        {/* 性別 */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>性別</label>
          <select
            className={styles.select}
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            disabled={loading}
          >
            <option value="">すべて</option>
            <option value="male">オス</option>
            <option value="female">メス</option>
            <option value="unknown">不明</option>
          </select>
        </div>

        {/* ステータス */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>ステータス</label>
          <select
            className={styles.select}
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
          >
            <option value="">すべて</option>
            <option value="available">募集中</option>
            <option value="adopted">譲渡済み</option>
            <option value="foster">一時預かり中</option>
            <option value="medical">治療中</option>
            <option value="hold">保留中</option>
            <option value="quarantine">検疫中</option>
          </select>
        </div>

        {/* 年齢範囲 */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>年齢</label>
          <select
            className={styles.select}
            value={filters.age_range}
            onChange={(e) => handleFilterChange('age_range', e.target.value)}
            disabled={loading}
          >
            <option value="">すべて</option>
            <option value="baby">子ども（〜1歳）</option>
            <option value="young">若い（1-3歳）</option>
            <option value="adult">成人（3-7歳）</option>
            <option value="senior">シニア（7歳〜）</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AnimalFilter;