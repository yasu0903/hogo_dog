// src/pages/OrganizationDetail/index.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { fetchOrganizationDetail, fetchPrefectureiById } from '../../services/api';
import styles from './OrganizationDetail.module.css';

// SNSタイプに応じたアイコンを取得する関数
const getSnsIcon = (type) => {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('twitter') || lowerType.includes('x')) {
    return { icon: '𝕏', className: styles.snsIconTwitter };
  } else if (lowerType.includes('facebook') || lowerType.includes('fb')) {
    return { icon: 'ⓕ', className: styles.snsIconFacebook };
  } else if (lowerType.includes('instagram') || lowerType.includes('insta')) {
    return { icon: '📷', className: styles.snsIconInstagram };
  } else if (lowerType.includes('youtube') || lowerType.includes('yt')) {
    return { icon: '▶️', className: styles.snsIconYoutube };
  } else if (lowerType.includes('line')) {
    return { icon: '💬', className: styles.snsIconLine };
  } else if (lowerType.includes('website') || lowerType.includes('site') || lowerType.includes('web') || lowerType.includes('blog'))   {
    return { icon: '📃', className: styles.snsIconWebsite };
  } else if (lowerType.includes('tiktok'))   {
    return { icon: '🎵', className: styles.snsIconTiktok };
  } else {
    return { icon: '🔗', className: styles.snsIconOther };
  }
};

const OrganizationDetail = () => {
  const { id } = useParams();
  const [organizations, setOrganizations] = useState([]);
  const [prefecture, setPrefecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const data = await fetchOrganizationDetail(id);
        console.log('取得した団体詳細データ:', data);
        setOrganizations(data);
      } catch (error) {
        console.error('Error loading organization:', error);
        setError('団体情報の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrganization();

    const loadPrefecture = async () => {
      try {
        const data = await fetchPrefectureiById(id);
        console.log('取得した都道府県データ:', data);
        setPrefecture(data);
      } catch (error) {
        console.error('Error loading prefectures:', error);
        setError('都道府県情報の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    loadPrefecture();

  }, [id]);
  
  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }
  
  if (error) {
    return (
      <div className={styles.error}>
        <Header />
        <main className={styles.main}>
          <h1>エラー</h1>
          <p>{error}</p>
          <Link to="/organizations">団体一覧に戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!organizations || organizations.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1>団体が見つかりません</h1>
          <Link to="/organizations">団体一覧に戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{`${prefecture.name}の団体一覧`}</h1>
        
        <div className={styles.backLink}>
          <Link to="/organizations">団体一覧に戻る</Link>
        </div>
        
        <div className={styles.organizationsList}>
          {organizations.map(org => (
            <div key={org.id} className={styles.orgItem}>
              <h2>{org.name}</h2>
              <p className={styles.area}>エリア: {org.area}</p>
              
              {org.website && (
                <p className={styles.website}>
                  <a href={org.website} target="_blank" rel="noopener noreferrer">
                    ウェブサイト
                  </a>
                </p>
              )}
              
              {org.note && <p className={styles.note}>{org.note}</p>}
              
              {org.sns && org.sns.length > 0 && (
                <div className={styles.snsLinks}>
                  <h3>SNS</h3>
                  <ul>
                    {org.sns.map((snsItem, index) => {
                      const { icon, className } = getSnsIcon(snsItem.type);
                      return (
                        <li key={index}>
                          <span className={`${styles.snsIcon} ${className}`}>{icon}</span>
                          <a href={snsItem.url} target="_blank" rel="noopener noreferrer">
                            {snsItem.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrganizationDetail;