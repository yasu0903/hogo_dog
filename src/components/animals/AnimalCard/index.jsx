import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AnimalCard.module.css';

const AnimalCard = ({ animal }) => {
  // デフォルト画像のURL
  const defaultImage = '/images/default-animal.jpg';
  
  // 動物の主要写真を取得（複数写真がある場合は最初の写真を使用）
  const primaryImage = animal.photos && animal.photos.length > 0 
    ? animal.photos.find(photo => photo.is_primary) || animal.photos[0]
    : null;

  // 年齢を計算
  const calculateAge = (birthDate) => {
    if (!birthDate) return '不明';
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths}ヶ月`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}歳${months}ヶ月` : `${years}歳`;
    }
  };

  // ステータスの日本語表示
  const getStatusText = (status) => {
    const statusMap = {
      'available': '募集中',
      'adopted': '譲渡済み',
      'foster': '一時預かり中',
      'medical': '治療中',
      'hold': '保留中',
      'quarantine': '検疫中'
    };
    return statusMap[status] || status;
  };

  // 性別の日本語表示
  const getGenderText = (gender) => {
    const genderMap = {
      'male': 'オス',
      'female': 'メス',
      'unknown': '不明'
    };
    return genderMap[gender] || gender;
  };

  // 種類の日本語表示
  const getSpeciesText = (species) => {
    const speciesMap = {
      'dog': '犬',
      'cat': '猫',
      'rabbit': 'うさぎ',
      'bird': '鳥',
      'other': 'その他'
    };
    return speciesMap[species] || species;
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={primaryImage?.url || defaultImage} 
          alt={animal.name}
          className={styles.image}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className={`${styles.status} ${styles[animal.status]}`}>
          {getStatusText(animal.status)}
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.name}>{animal.name}</h3>
        
        <div className={styles.details}>
          <div className={styles.basicInfo}>
            <span className={styles.species}>{getSpeciesText(animal.species)}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.gender}>{getGenderText(animal.gender)}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.age}>{calculateAge(animal.birth_date)}</span>
          </div>
          
          {animal.breed && (
            <div className={styles.breed}>{animal.breed}</div>
          )}
          
          {animal.description && (
            <p className={styles.description}>
              {animal.description.length > 100 
                ? `${animal.description.substring(0, 100)}...` 
                : animal.description
              }
            </p>
          )}
        </div>
        
        <div className={styles.actions}>
          <Link 
            to={`/animals/${animal.id}`} 
            className={styles.detailLink}
          >
            詳細を見る
          </Link>
          {animal.status === 'available' && (
            <Link 
              to={`/adopt/${animal.id}`} 
              className={styles.adoptLink}
            >
              里親申請
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;