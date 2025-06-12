import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchShelterById, fetchAnimals } from '../../services/api';
import AnimalCard from '../../components/animals/AnimalCard';
import styles from './ShelterDetail.module.css';

const ShelterDetail = () => {
  const { id } = useParams();
  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animalsLoading, setAnimalsLoading] = useState(false);

  useEffect(() => {
    const loadShelterData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // シェルター詳細データを取得
        let shelterData;
        try {
          shelterData = await fetchShelterById(id);
        } catch (apiError) {
          console.warn('シェルター詳細API接続に失敗しました。モックデータを使用します:', apiError);
          // モックデータ
          shelterData = {
            id: id,
            name: id === '1' ? 'わんわん保護団体' : 'にゃんにゃん救済センター',
            description: id === '1' 
              ? '犬を中心とした動物保護活動を行っている団体です。地域に根ざした活動を通じて、多くの動物たちに新しい家族を見つけています。'
              : '猫の保護・里親探しを専門に行っています。TNR活動や野良猫の保護にも積極的に取り組んでいます。',
            address: id === '1' ? '東京都渋谷区渋谷1-1-1' : '神奈川県横浜市青葉区青葉台2-2-2',
            phone: id === '1' ? '03-1234-5678' : '045-987-6543',
            email: id === '1' ? 'info@wanwan.org' : 'contact@nyan-center.jp',
            website: id === '1' ? 'https://wanwan.org' : 'https://nyan-center.jp',
            animal_count: id === '1' ? 15 : 23,
            established_date: id === '1' ? '2015-04-01' : '2018-06-15',
            organization_type: 'npo',
            features: id === '1' 
              ? ['犬専門', '24時間サポート', '医療費サポート', 'トレーニング支援']
              : ['猫専門', 'TNR活動', '野良猫保護', '医療サポート'],
            adoption_policy: id === '1'
              ? '当団体では、動物との相性を重視し、事前の面談と試し飼いを行っています。'
              : '猫の性格と飼い主様のライフスタイルのマッチングを大切にしています。'
          };
        }
        
        setShelter(shelterData);
        
        // 関連する動物データを取得
        await loadShelterAnimals(id);
        
      } catch (err) {
        console.error('シェルター詳細の読み込みに失敗しました:', err);
        setError('シェルター詳細情報の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    const loadShelterAnimals = async (shelterId) => {
      try {
        setAnimalsLoading(true);
        
        let animalData;
        try {
          animalData = await fetchAnimals({ shelter_id: shelterId });
        } catch (apiError) {
          console.warn('動物データAPI接続に失敗しました。モックデータを使用します:', apiError);
          // モックデータ
          animalData = shelterId === '1' ? [
            {
              id: '1',
              name: 'ポチ',
              species: 'dog',
              breed: '柴犬',
              age: 3,
              gender: 'male',
              size: 'medium',
              personality: ['人懐っこい', '活発', '散歩好き'],
              health_status: 'healthy',
              vaccination_status: 'complete',
              spay_neuter_status: 'done',
              primary_photo_url: '/images/mock-dog1.jpg',
              shelter_id: '1',
              created_at: '2024-01-15'
            },
            {
              id: '2',
              name: 'ハナ',
              species: 'dog', 
              breed: 'ゴールデンレトリバー',
              age: 5,
              gender: 'female',
              size: 'large',
              personality: ['優しい', '子供好き', '穏やか'],
              health_status: 'healthy',
              vaccination_status: 'complete',
              spay_neuter_status: 'done',
              primary_photo_url: '/images/mock-dog2.jpg',
              shelter_id: '1',
              created_at: '2024-02-01'
            }
          ] : [
            {
              id: '3',
              name: 'ミケ',
              species: 'cat',
              breed: '三毛猫',
              age: 2,
              gender: 'female',
              size: 'small',
              personality: ['甘えん坊', '静か', '人懐っこい'],
              health_status: 'healthy',
              vaccination_status: 'complete',
              spay_neuter_status: 'done',
              primary_photo_url: '/images/mock-cat1.jpg',
              shelter_id: '2',
              created_at: '2024-01-20'
            },
            {
              id: '4',
              name: 'クロ',
              species: 'cat',
              breed: '黒猫',
              age: 1,
              gender: 'male',
              size: 'small',
              personality: ['活発', '好奇心旺盛', '遊び好き'],
              health_status: 'healthy',
              vaccination_status: 'complete',
              spay_neuter_status: 'done',
              primary_photo_url: '/images/mock-cat2.jpg',
              shelter_id: '2',
              created_at: '2024-02-10'
            }
          ];
        }
        
        setAnimals(animalData || []);
        
      } catch (err) {
        console.error('動物データの読み込みに失敗しました:', err);
      } finally {
        setAnimalsLoading(false);
      }
    };

    if (id) {
      loadShelterData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>エラーが発生しました</h2>
          <p>{error}</p>
          <Link to="/shelters" className={styles.backLink}>
            運営団体一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>運営団体が見つかりませんでした</h2>
          <Link to="/shelters" className={styles.backLink}>
            運営団体一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ヘッダーエリア */}
      <div className={styles.header}>
        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>ホーム</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link to="/shelters" className={styles.breadcrumbLink}>運営団体</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.breadcrumbCurrent}>{shelter.name}</span>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* 団体基本情報 */}
        <section className={styles.shelterInfo}>
          <div className={styles.shelterHeader}>
            <h1 className={styles.shelterName}>{shelter.name}</h1>
            <div className={styles.shelterMeta}>
              <span className={styles.animalCount}>保護動物数: {shelter.animal_count}匹</span>
              <span className={styles.establishedDate}>設立: {new Date(shelter.established_date).getFullYear()}年</span>
            </div>
          </div>
          
          <div className={styles.shelterDetails}>
            <div className={styles.description}>
              <h3>団体について</h3>
              <p>{shelter.description}</p>
            </div>
            
            <div className={styles.infoGrid}>
              <div className={styles.contactInfo}>
                <h3>連絡先</h3>
                <div className={styles.contactItem}>
                  <strong>住所:</strong> {shelter.address}
                </div>
                <div className={styles.contactItem}>
                  <strong>電話:</strong> {shelter.phone}
                </div>
                <div className={styles.contactItem}>
                  <strong>メール:</strong> 
                  <a href={`mailto:${shelter.email}`} className={styles.emailLink}>
                    {shelter.email}
                  </a>
                </div>
                {shelter.website && (
                  <div className={styles.contactItem}>
                    <strong>ウェブサイト:</strong> 
                    <a href={shelter.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                      {shelter.website}
                    </a>
                  </div>
                )}
              </div>
              
              {shelter.features && (
                <div className={styles.features}>
                  <h3>特徴・サービス</h3>
                  <div className={styles.featureList}>
                    {shelter.features.map((feature, index) => (
                      <span key={index} className={styles.featureTag}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {shelter.adoption_policy && (
              <div className={styles.adoptionPolicy}>
                <h3>譲渡方針</h3>
                <p>{shelter.adoption_policy}</p>
              </div>
            )}
          </div>
        </section>

        {/* 保護動物一覧 */}
        <section className={styles.animalsSection}>
          <div className={styles.animalsHeader}>
            <h2>この団体の保護動物</h2>
            {animals.length > 0 && (
              <span className={styles.animalsCount}>({animals.length}匹)</span>
            )}
          </div>
          
          {animalsLoading ? (
            <div className={styles.animalsLoading}>動物データを読み込み中...</div>
          ) : animals.length > 0 ? (
            <div className={styles.animalsList}>
              {animals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <div className={styles.noAnimals}>
              <p>現在、この団体に登録されている動物はいません。</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShelterDetail;