import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../contexts/PermissionContext';
import { fetchAnimals, fetchShelters, api } from '../../../services/api';
import { permissionApi } from '../../../services/permissionApi';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { currentOrgId, currentOrgRole, canManageMembers } = usePermissions();
  const [stats, setStats] = useState({
    totalAnimals: 0,
    availableAnimals: 0,
    adoptedAnimals: 0,
    totalMembers: 0,
    pendingApplications: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [currentOrgId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 統計情報を並行して取得
      const [animalsResult, membersResult] = await Promise.allSettled([
        loadAnimalsStats(),
        loadMembersStats()
      ]);

      // エラーがあってもダッシュボードは表示
      if (animalsResult.status === 'rejected') {
        console.error('動物統計の取得に失敗:', animalsResult.reason);
      }
      if (membersResult.status === 'rejected') {
        console.error('メンバー統計の取得に失敗:', membersResult.reason);
      }

      // 最近のアクティビティを取得
      await loadRecentActivities();

    } catch (error) {
      console.error('ダッシュボードデータの取得に失敗しました:', error);
      setError('ダッシュボードデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadAnimalsStats = async () => {
    try {
      const animalsData = await fetchAnimals({ 
        organization_id: currentOrgId,
        limit: 1000 // 統計用なので多めに取得
      });
      
      const animals = animalsData.animals || [];
      const totalAnimals = animals.length;
      const availableAnimals = animals.filter(animal => animal.status === 'available').length;
      const adoptedAnimals = animals.filter(animal => animal.status === 'adopted').length;

      setStats(prev => ({
        ...prev,
        totalAnimals,
        availableAnimals,
        adoptedAnimals
      }));
    } catch (error) {
      console.error('動物統計の取得に失敗:', error);
      // エラー時はデフォルト値を使用
      setStats(prev => ({
        ...prev,
        totalAnimals: 0,
        availableAnimals: 0,
        adoptedAnimals: 0
      }));
    }
  };

  const loadMembersStats = async () => {
    try {
      if (!currentOrgId || !canManageMembers) {
        return;
      }

      const membersData = await permissionApi.getOrganizationMembers(currentOrgId);
      const totalMembers = membersData.length;

      setStats(prev => ({
        ...prev,
        totalMembers
      }));
    } catch (error) {
      console.error('メンバー統計の取得に失敗:', error);
      setStats(prev => ({
        ...prev,
        totalMembers: 0
      }));
    }
  };

  const loadRecentActivities = async () => {
    try {
      // 最近のアクティビティを模擬的に生成
      // 実際のAPIができたら置き換える
      const mockActivities = [
        {
          id: 1,
          type: 'animal_added',
          description: '新しい動物「ポチ」が登録されました',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'システム'
        },
        {
          id: 2,
          type: 'member_joined',
          description: '新しいメンバーが参加しました',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'システム'
        },
        {
          id: 3,
          type: 'application_submitted',
          description: '新しい里親申請が提出されました',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          user: 'システム'
        }
      ];

      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('最近のアクティビティの取得に失敗:', error);
      setRecentActivities([]);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}時間前`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}日前`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'animal_added': return '🐕';
      case 'member_joined': return '👥';
      case 'application_submitted': return '📋';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>ダッシュボードを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>管理者ダッシュボード</h1>
        <p>ようこそ、{currentUser?.name}さん</p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* 統計カード */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🐕</div>
          <div className={styles.statContent}>
            <h3>登録動物数</h3>
            <p className={styles.statNumber}>{stats.totalAnimals}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3>譲渡可能</h3>
            <p className={styles.statNumber}>{stats.availableAnimals}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>❤️</div>
          <div className={styles.statContent}>
            <h3>譲渡済み</h3>
            <p className={styles.statNumber}>{stats.adoptedAnimals}</p>
          </div>
        </div>

        {canManageMembers && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>メンバー数</h3>
              <p className={styles.statNumber}>{stats.totalMembers}</p>
            </div>
          </div>
        )}
      </div>

      {/* クイックアクション */}
      <div className={styles.quickActions}>
        <h2>クイックアクション</h2>
        <div className={styles.actionsGrid}>
          <Link to="/animals" className={styles.actionCard}>
            <div className={styles.actionIcon}>🐕</div>
            <h3>動物管理</h3>
            <p>動物の登録・編集・削除</p>
          </Link>

          {canManageMembers && (
            <Link to="/admin/members" className={styles.actionCard}>
              <div className={styles.actionIcon}>👥</div>
              <h3>メンバー管理</h3>
              <p>メンバーの招待・権限管理</p>
            </Link>
          )}

          <Link to="/shelters" className={styles.actionCard}>
            <div className={styles.actionIcon}>🏠</div>
            <h3>団体管理</h3>
            <p>団体情報の管理</p>
          </Link>

          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>📊</div>
            <h3>レポート</h3>
            <p>統計とレポートの確認</p>
          </div>
        </div>
      </div>

      {/* 最近のアクティビティ */}
      <div className={styles.recentActivities}>
        <h2>最近のアクティビティ</h2>
        <div className={styles.activitiesList}>
          {recentActivities.length === 0 ? (
            <div className={styles.noActivities}>
              <p>最近のアクティビティはありません</p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityDescription}>
                    {activity.description}
                  </p>
                  <p className={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;