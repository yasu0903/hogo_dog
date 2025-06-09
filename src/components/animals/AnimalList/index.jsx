import React from 'react';
import AnimalCard from '../AnimalCard';
import styles from './AnimalList.module.css';

const AnimalList = ({ animals, loading, error }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>動物データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>エラーが発生しました: {error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!animals || animals.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🐕</div>
          <h3>動物が見つかりませんでした</h3>
          <p>条件を変更して再度検索してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <p>{animals.length}匹の動物が見つかりました</p>
      </div>
      
      <div className={styles.grid}>
        {animals.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </div>
    </div>
  );
};

export default AnimalList;