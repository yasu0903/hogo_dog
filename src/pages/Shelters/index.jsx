import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { fetchShelters } from '../../services/api';
import styles from './Shelters.module.css';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadShelters = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API呼び出し（エラーの場合はモックデータを使用）
        let shelterData;
        try {
          shelterData = await fetchShelters();
        } catch (apiError) {
          console.warn('API接続に失敗しました。モックデータを使用します:', apiError);
          // モックデータ
          shelterData = [
            {
              id: '1',
              name: 'わんわん保護団体',
              description: '犬を中心とした動物保護活動を行っている団体です。',
              address: '東京都渋谷区渋谷1-1-1',
              phone: '03-1234-5678',
              email: 'info@wanwan.org',
              website: 'https://wanwan.org',
              animal_count: 15,
              established_date: '2015-04-01',
              organization_type: 'npo'
            },
            {
              id: '2', 
              name: 'にゃんにゃん救済センター',
              description: '猫の保護・里親探しを専門に行っています。',
              address: '神奈川県横浜市青葉区青葉台2-2-2',
              phone: '045-987-6543',
              email: 'contact@nyan-center.jp',
              website: 'https://nyan-center.jp',
              animal_count: 23,
              established_date: '2018-06-15',
              organization_type: 'npo'
            },
            {
              id: '3',
              name: 'みんなのペット動物病院',
              description: '治療と保護活動を両立している動物病院です。',
              address: '千葉県千葉市中央区中央3-3-3',
              phone: '043-555-0123',
              email: 'info@minna-pet.com',
              website: 'https://minna-pet.com',
              animal_count: 8,
              established_date: '2010-02-20',
              organization_type: 'clinic'
            }
          ];
        }
        
        setShelters(shelterData);
      } catch (err) {
        setError(err.message || '運営団体データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadShelters();
  }, []);

  const getOrganizationTypeText = (type) => {
    const typeMap = {
      'npo': 'NPO法人',
      'volunteer': 'ボランティア団体',
      'clinic': '動物病院',
      'government': '自治体',
      'other': 'その他'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>運営団体データを読み込み中...</p>
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
            <p>エラーが発生しました: {error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              再試行
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
        <div className={styles.hero}>
          <h1 className={styles.title}>運営団体一覧</h1>
          <p className={styles.subtitle}>
            動物保護活動を行っている団体をご紹介します
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.stats}>
            <p>{shelters.length}の団体が登録されています</p>
          </div>
          
          <div className={styles.shelterGrid}>
            {shelters.map((shelter) => (
              <div key={shelter.id} className={styles.shelterCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.shelterName}>{shelter.name}</h3>
                  <span className={styles.organizationType}>
                    {getOrganizationTypeText(shelter.organization_type)}
                  </span>
                </div>
                
                <div className={styles.cardContent}>
                  {shelter.description && (
                    <p className={styles.description}>
                      {shelter.description.length > 120 
                        ? `${shelter.description.substring(0, 120)}...` 
                        : shelter.description
                      }
                    </p>
                  )}
                  
                  <div className={styles.shelterInfo}>
                    {shelter.address && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>所在地</span>
                        <span className={styles.infoValue}>{shelter.address}</span>
                      </div>
                    )}
                    
                    {shelter.animal_count !== undefined && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>保護動物数</span>
                        <span className={styles.infoValue}>{shelter.animal_count}匹</span>
                      </div>
                    )}
                    
                    {shelter.established_date && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>設立</span>
                        <span className={styles.infoValue}>
                          {new Date(shelter.established_date).getFullYear()}年
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.contactInfo}>
                    {shelter.phone && (
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>📞</span>
                        <span className={styles.contactValue}>{shelter.phone}</span>
                      </div>
                    )}
                    
                    {shelter.email && (
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>✉️</span>
                        <span className={styles.contactValue}>{shelter.email}</span>
                      </div>
                    )}
                    
                    {shelter.website && (
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>🌐</span>
                        <a 
                          href={shelter.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.websiteLink}
                        >
                          公式サイト
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <Link 
                    to={`/shelters/${shelter.id}`} 
                    className={styles.detailButton}
                  >
                    詳細を見る
                  </Link>
                  <Link 
                    to={`/animals?shelter_id=${shelter.id}`} 
                    className={styles.animalsButton}
                  >
                    保護動物一覧
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shelters;