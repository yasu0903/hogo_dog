import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../contexts/PermissionContext';
import { fetchOrganizations, fetchUsers } from '../../../services/api';
import styles from './SystemDashboard.module.css';

const SystemDashboard = () => {
  const { currentUser } = useAuth();
  const { systemRole } = usePermissions();
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    pendingOrganizations: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalAnimals: 0,
    availableAnimals: 0,
    adoptedAnimals: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
    loadRecentActivity();
    loadSystemAlerts();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      
      // 組織統計を取得
      const orgResponse = await fetchOrganizations();
      const organizations = orgResponse.data || [];
      
      // ユーザー統計を取得
      const userResponse = await fetchUsers();
      const users = userResponse.data || [];

      // モックデータで動物統計（実際のAPIが利用可能になったら置き換え）
      const animalStats = {
        totalAnimals: 156,
        availableAnimals: 89,
        adoptedAnimals: 67,
      };

      setStats({
        totalOrganizations: organizations.length,
        activeOrganizations: organizations.filter(org => org.status === 'active').length,
        pendingOrganizations: organizations.filter(org => org.status === 'pending').length,
        totalUsers: users.length,
        activeUsers: users.filter(user => user.status === 'active').length,
        ...animalStats,
      });
    } catch (error) {
      console.error('システム統計の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    // モックデータ（実際のAPIが利用可能になったら置き換え）
    const mockActivity = [
      {
        id: 1,
        type: 'organization_created',
        message: '新しい組織「わんにゃん保護センター横浜」が登録されました',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        severity: 'info'
      },
      {
        id: 2,
        type: 'user_suspended',
        message: 'ユーザー「田中太郎」がアカウント停止されました',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'warning'
      },
      {
        id: 3,
        type: 'animal_adopted',
        message: '動物「ポチ」の里親が決定しました',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        severity: 'success'
      },
      {
        id: 4,
        type: 'organization_verified',
        message: '組織「猫の里親会東京」の認証が完了しました',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        severity: 'success'
      },
    ];
    setRecentActivity(mockActivity);
  };

  const loadSystemAlerts = async () => {
    // モックデータ（実際のAPIが利用可能になったら置き換え）
    const mockAlerts = [
      {
        id: 1,
        type: 'warning',
        title: '認証待ち組織',
        message: '3つの組織が認証待ちです。確認してください。',
        action: '/system-admin/organizations?status=pending'
      },
      {
        id: 2,
        type: 'info',
        title: 'システムメンテナンス',
        message: '次回メンテナンスは2025年1月15日 02:00-04:00です。',
        action: null
      },
    ];
    setSystemAlerts(mockAlerts);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}分前`;
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else {
      return `${days}日前`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'organization_created':
        return '🏢';
      case 'user_suspended':
        return '⚠️';
      case 'animal_adopted':
        return '🐕';
      case 'organization_verified':
        return '✅';
      default:
        return '📋';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>読み込み中...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>🔧 システム管理ダッシュボード</h1>
          <p>システム全体の監視と管理</p>
          <div className={styles.userInfo}>
            <span className={styles.welcomeText}>
              ようこそ、{currentUser?.name}さん
            </span>
            <span className={styles.rolebadge}>
              {systemRole === 'superuser' ? 'スーパーユーザー' : 'システム管理者'}
            </span>
          </div>
        </div>

        {/* システムアラート */}
        {systemAlerts.length > 0 && (
          <section className={styles.alertsSection}>
            <h2>🚨 システムアラート</h2>
            <div className={styles.alertList}>
              {systemAlerts.map(alert => (
                <div key={alert.id} className={`${styles.alert} ${styles[alert.type]}`}>
                  <span className={styles.alertIcon}>{getAlertIcon(alert.type)}</span>
                  <div className={styles.alertContent}>
                    <h3>{alert.title}</h3>
                    <p>{alert.message}</p>
                    {alert.action && (
                      <Link to={alert.action} className={styles.alertAction}>
                        確認する
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 統計ダッシュボード */}
        <section className={styles.statsSection}>
          <h2>📊 システム統計</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏢</div>
              <div className={styles.statContent}>
                <h3>組織</h3>
                <div className={styles.statNumber}>{stats.totalOrganizations}</div>
                <div className={styles.statDetails}>
                  <span className={styles.statDetail}>
                    稼働中: {stats.activeOrganizations}
                  </span>
                  <span className={styles.statDetail}>
                    承認待ち: {stats.pendingOrganizations}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3>ユーザー</h3>
                <div className={styles.statNumber}>{stats.totalUsers}</div>
                <div className={styles.statDetails}>
                  <span className={styles.statDetail}>
                    アクティブ: {stats.activeUsers}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🐕</div>
              <div className={styles.statContent}>
                <h3>動物</h3>
                <div className={styles.statNumber}>{stats.totalAnimals}</div>
                <div className={styles.statDetails}>
                  <span className={styles.statDetail}>
                    里親募集中: {stats.availableAnimals}
                  </span>
                  <span className={styles.statDetail}>
                    里親決定済み: {stats.adoptedAnimals}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 管理機能へのクイックアクセス */}
        <section className={styles.quickActionsSection}>
          <h2>⚡ クイックアクション</h2>
          <div className={styles.actionGrid}>
            <Link to="/system-admin/organizations" className={styles.actionCard}>
              <div className={styles.actionIcon}>🏢</div>
              <h3>組織管理</h3>
              <p>全組織の確認・承認・停止</p>
            </Link>

            <Link to="/system-admin/users" className={styles.actionCard}>
              <div className={styles.actionIcon}>👥</div>
              <h3>ユーザー管理</h3>
              <p>全ユーザーの管理・権限設定</p>
            </Link>

            <Link to="/system-admin/settings" className={styles.actionCard}>
              <div className={styles.actionIcon}>⚙️</div>
              <h3>システム設定</h3>
              <p>グローバル設定・ポリシー管理</p>
            </Link>

            <Link to="/system-admin/audit" className={styles.actionCard}>
              <div className={styles.actionIcon}>📋</div>
              <h3>監査ログ</h3>
              <p>システム活動の監視・ログ確認</p>
            </Link>
          </div>
        </section>

        {/* 最近のアクティビティ */}
        <section className={styles.activitySection}>
          <h2>📈 最近のアクティビティ</h2>
          <div className={styles.activityList}>
            {recentActivity.map(activity => (
              <div key={activity.id} className={`${styles.activityItem} ${styles[activity.severity]}`}>
                <span className={styles.activityIcon}>{getActivityIcon(activity.type)}</span>
                <div className={styles.activityContent}>
                  <p>{activity.message}</p>
                  <span className={styles.activityTime}>
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/system-admin/audit" className={styles.viewAllLink}>
            全てのアクティビティを表示 →
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SystemDashboard;