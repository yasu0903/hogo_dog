import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './ShelterDetail.module.css';

const ShelterDetail = () => {
  const { id } = useParams();

  return (
    <div className={styles.container}>
      <h1>運営団体詳細</h1>
      <p>団体ID: {id}</p>
      <p>この機能は開発中です。</p>
    </div>
  );
};

export default ShelterDetail;