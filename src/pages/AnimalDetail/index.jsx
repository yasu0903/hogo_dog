import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import AnimalGallery from '../../components/animals/AnimalGallery';
import { fetchAnimalById, fetchAnimalPhotos } from '../../services/api';
import styles from './AnimalDetail.module.css';

const AnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnimalData = async () => {
      try {
        setLoading(true);
        setError(null);

        // API呼び出し（エラーの場合はモックデータを使用）
        let animalData, photoData;
        try {
          animalData = await fetchAnimalById(id);
          photoData = await fetchAnimalPhotos(id);
        } catch (apiError) {
          console.warn('API接続に失敗しました。モックデータを使用します:', apiError);
          
          // モックデータ
          animalData = {
            id: id,
            name: 'ポチ',
            species: 'dog',
            breed: '柴犬',
            gender: 'male',
            birth_date: '2022-03-15',
            status: 'available',
            description: '人懐っこく元気な男の子です。散歩が大好きで、子供とも仲良くできます。新しい環境にもすぐに慣れるタイプで、初めて犬を飼う方にもおすすめです。基本的なしつけはできており、お座り、待て、おいでなどのコマンドを理解します。',
            weight: 12.5,
            health_status: '良好',
            vaccination_status: '済み',
            spay_neuter_status: '済み',
            medical_notes: '特記事項なし',
            behavior_notes: '他の犬とも仲良くできます。猫は未確認です。',
            special_needs: 'なし',
            adoption_fee: 30000,
            contact_info: {
              phone: '090-1234-5678',
              email: 'contact@example.com'
            },
            organization: {
              id: '1',
              name: 'わんわん保護団体',
              address: '東京都渋谷区...'
            }
          };
          
          photoData = [
            { id: '1', url: '/images/dog1.jpg', is_primary: true, caption: 'メイン写真' },
            { id: '2', url: '/images/dog1-2.jpg', is_primary: false, caption: '横顔' },
            { id: '3', url: '/images/dog1-3.jpg', is_primary: false, caption: '遊んでいる様子' }
          ];
        }

        setAnimal(animalData);
        setPhotos(photoData);
      } catch (err) {
        setError(err.message || '動物データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAnimalData();
    }
  }, [id]);

  // ユーティリティ関数
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

  const getGenderText = (gender) => {
    const genderMap = {
      'male': 'オス',
      'female': 'メス',
      'unknown': '不明'
    };
    return genderMap[gender] || gender;
  };

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

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>動物情報を読み込み中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <h2>エラーが発生しました</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/animals')} className={styles.backButton}>
              動物一覧に戻る
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <h2>動物が見つかりませんでした</h2>
            <button onClick={() => navigate('/animals')} className={styles.backButton}>
              動物一覧に戻る
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.content}>
          {/* パンくずリスト */}
          <nav className={styles.breadcrumb}>
            <Link to="/animals">動物一覧</Link>
            <span className={styles.separator}>›</span>
            <span>{animal.name}</span>
          </nav>

          {/* メインコンテンツ */}
          <div className={styles.animalDetail}>
            {/* 左側: 写真ギャラリー */}
            <div className={styles.gallerySection}>
              <AnimalGallery photos={photos} />
            </div>

            {/* 右側: 動物情報 */}
            <div className={styles.infoSection}>
              <div className={styles.header}>
                <h1 className={styles.name}>{animal.name}</h1>
                <span className={`${styles.status} ${styles[animal.status]}`}>
                  {getStatusText(animal.status)}
                </span>
              </div>

              {/* 基本情報 */}
              <div className={styles.basicInfo}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>種類</span>
                    <span className={styles.value}>{getSpeciesText(animal.species)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>品種</span>
                    <span className={styles.value}>{animal.breed || '不明'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>性別</span>
                    <span className={styles.value}>{getGenderText(animal.gender)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>年齢</span>
                    <span className={styles.value}>{calculateAge(animal.birth_date)}</span>
                  </div>
                  {animal.weight && (
                    <div className={styles.infoItem}>
                      <span className={styles.label}>体重</span>
                      <span className={styles.value}>{animal.weight}kg</span>
                    </div>
                  )}
                  {animal.adoption_fee && (
                    <div className={styles.infoItem}>
                      <span className={styles.label}>譲渡費用</span>
                      <span className={styles.value}>¥{animal.adoption_fee.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 説明 */}
              {animal.description && (
                <div className={styles.description}>
                  <h3>この子について</h3>
                  <p>{animal.description}</p>
                </div>
              )}

              {/* 健康・医療情報 */}
              <div className={styles.healthInfo}>
                <h3>健康・医療情報</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>健康状態</span>
                    <span className={styles.value}>{animal.health_status || '不明'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>ワクチン接種</span>
                    <span className={styles.value}>{animal.vaccination_status || '不明'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>去勢・避妊手術</span>
                    <span className={styles.value}>{animal.spay_neuter_status || '不明'}</span>
                  </div>
                </div>
                {animal.medical_notes && (
                  <div className={styles.notes}>
                    <span className={styles.label}>医療に関する特記事項</span>
                    <p>{animal.medical_notes}</p>
                  </div>
                )}
              </div>

              {/* 行動・性格 */}
              {animal.behavior_notes && (
                <div className={styles.behaviorInfo}>
                  <h3>性格・行動</h3>
                  <p>{animal.behavior_notes}</p>
                </div>
              )}

              {/* 特別なケア */}
              {animal.special_needs && animal.special_needs !== 'なし' && (
                <div className={styles.specialNeeds}>
                  <h3>特別なケア</h3>
                  <p>{animal.special_needs}</p>
                </div>
              )}

              {/* アクション */}
              <div className={styles.actions}>
                {animal.status === 'available' && (
                  <Link 
                    to={`/adopt/${animal.id}`}
                    className={styles.adoptButton}
                  >
                    この子の里親になる
                  </Link>
                )}
                <Link to="/animals" className={styles.backToListButton}>
                  動物一覧に戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AnimalDetail;