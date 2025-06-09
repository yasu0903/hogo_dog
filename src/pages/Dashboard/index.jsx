import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // 成功メッセージの表示（リダイレクト時）
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // メッセージを3秒後に非表示
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  // 申請データの取得
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        
        // API呼び出し（エラーの場合はモックデータを使用）
        let applicationsData;
        try {
          // 実際のAPI呼び出し（未実装のためモックデータ使用）
          applicationsData = [];
        } catch (apiError) {
          console.warn('API接続に失敗しました。モックデータを使用します:', apiError);
        }
        
        // モックデータ
        applicationsData = [
          {
            id: '1',
            animal_id: '1',
            animal_name: 'ポチ',
            animal_species: 'dog',
            animal_breed: '柴犬',
            status: 'pending',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            organization_name: 'わんわん保護団体'
          },
          {
            id: '2',
            animal_id: '2',
            animal_name: 'みけ',
            animal_species: 'cat',
            animal_breed: '三毛猫',
            status: 'approved',
            created_at: '2024-01-10T14:20:00Z',
            updated_at: '2024-01-12T09:15:00Z',
            organization_name: 'にゃんにゃん救済センター'
          },
          {
            id: '3',
            animal_id: '3',
            animal_name: 'チョコ',
            animal_species: 'dog',
            animal_breed: 'トイプードル',
            status: 'rejected',
            created_at: '2024-01-05T16:45:00Z',
            updated_at: '2024-01-08T11:30:00Z',
            organization_name: 'みんなのペット動物病院'
          }
        ];
        
        setApplications(applicationsData);
      } catch (error) {
        console.error('申請データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '審査中',
      'approved': '承認済み',
      'rejected': '却下',
      'interview': '面談予定',
      'adopted': '譲渡完了'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'pending',
      'approved': 'approved',
      'rejected': 'rejected',
      'interview': 'interview',
      'adopted': 'adopted'
    };
    return classMap[status] || 'pending';
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getApplicationStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    return stats;
  };

  const stats = getApplicationStats();

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.content}>
          {/* ヘッダーセクション */}
          <div className={styles.dashboardHeader}>
            <h1 className={styles.title}>ダッシュボード</h1>
            <p className={styles.welcome}>
              こんにちは、{user?.name}さん
            </p>
          </div>

          {/* 成功メッセージ */}
          {successMessage && (
            <div className={styles.successAlert}>
              <span className={styles.successIcon}>✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* 統計カード */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>総申請数</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.pending}</div>
              <div className={styles.statLabel}>審査中</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.approved}</div>
              <div className={styles.statLabel}>承認済み</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.rejected}</div>
              <div className={styles.statLabel}>却下</div>
            </div>
          </div>

          {/* 申請一覧 */}
          <div className={styles.applicationsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>里親申請一覧</h2>
              <Link to="/animals" className={styles.newApplicationButton}>
                新しい申請をする
              </Link>
            </div>

            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>申請データを読み込み中...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <h3>まだ申請がありません</h3>
                <p>気になる動物を見つけて、里親申請をしてみましょう。</p>
                <Link to="/animals" className={styles.browseAnimalsButton}>
                  動物を探す
                </Link>
              </div>
            ) : (
              <div className={styles.applicationsList}>
                {applications.map((application) => (
                  <div key={application.id} className={styles.applicationCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.animalInfo}>
                        <h3 className={styles.animalName}>
                          {application.animal_name}
                        </h3>
                        <div className={styles.animalDetails}>
                          <span className={styles.species}>
                            {getSpeciesText(application.animal_species)}
                          </span>
                          {application.animal_breed && (
                            <>
                              <span className={styles.separator}>•</span>
                              <span className={styles.breed}>
                                {application.animal_breed}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={`${styles.status} ${styles[getStatusClass(application.status)]}`}>
                        {getStatusText(application.status)}
                      </div>
                    </div>
                    
                    <div className={styles.cardContent}>
                      <div className={styles.organizationInfo}>
                        <span className={styles.organizationLabel}>申請先:</span>
                        <span className={styles.organizationName}>
                          {application.organization_name}
                        </span>
                      </div>
                      
                      <div className={styles.dateInfo}>
                        <div className={styles.dateItem}>
                          <span className={styles.dateLabel}>申請日:</span>
                          <span className={styles.dateValue}>
                            {formatDate(application.created_at)}
                          </span>
                        </div>
                        <div className={styles.dateItem}>
                          <span className={styles.dateLabel}>更新日:</span>
                          <span className={styles.dateValue}>
                            {formatDate(application.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.cardActions}>
                      <Link 
                        to={`/animals/${application.animal_id}`}
                        className={styles.viewAnimalButton}
                      >
                        動物を見る
                      </Link>
                      {application.status === 'approved' && (
                        <span className={styles.nextStep}>
                          団体からの連絡をお待ちください
                        </span>
                      )}
                      {application.status === 'pending' && (
                        <span className={styles.nextStep}>
                          審査中です。しばらくお待ちください
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* クイックアクション */}
          <div className={styles.quickActions}>
            <h3 className={styles.quickActionsTitle}>クイックアクション</h3>
            <div className={styles.actionsGrid}>
              <Link to="/animals" className={styles.actionCard}>
                <div className={styles.actionIcon}>🐕</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>動物を探す</div>
                  <div className={styles.actionDescription}>
                    新しい家族を見つけましょう
                  </div>
                </div>
              </Link>
              
              <Link to="/shelters" className={styles.actionCard}>
                <div className={styles.actionIcon}>🏠</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>運営団体を見る</div>
                  <div className={styles.actionDescription}>
                    保護活動を行っている団体を探す
                  </div>
                </div>
              </Link>
              
              <Link to="/organizations" className={styles.actionCard}>
                <div className={styles.actionIcon}>ℹ️</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>団体情報を調べる</div>
                  <div className={styles.actionDescription}>
                    地域の愛護団体情報を確認
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;