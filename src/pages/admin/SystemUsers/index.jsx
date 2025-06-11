import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchUsers } from '../../../services/api';
import styles from './SystemUsers.module.css';

const SystemUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchUsers();
      // モックデータで実際のユーザー権限情報を追加
      const usersWithRoles = (response.data || []).map(user => ({
        ...user,
        systemRole: user.id === currentUser?.id ? 'superuser' : 'user',
        organizationCount: Math.floor(Math.random() * 3),
        lastLoginAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      }));
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('ユーザーの読み込みに失敗しました:', error);
      setError('ユーザーの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cognito_user_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // ロールフィルター
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.systemRole === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      // ここで実際のAPI呼び出しを行う
      console.log(`${actionType} action for user:`, selectedUser.id);
      
      // モック実装（実際のAPIが利用可能になったら置き換え）
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          switch (actionType) {
            case 'suspend':
              return { ...user, status: 'suspended' };
            case 'activate':
              return { ...user, status: 'active' };
            case 'makeAdmin':
              return { ...user, systemRole: 'admin' };
            case 'makeUser':
              return { ...user, systemRole: 'user' };
            default:
              return user;
          }
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setShowActionModal(false);
      setSelectedUser(null);
      setActionType('');
    } catch (error) {
      console.error('アクションの実行に失敗しました:', error);
      setError('アクションの実行に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: '有効', class: 'active' },
      suspended: { text: '停止中', class: 'suspended' },
      inactive: { text: '非活性', class: 'inactive' },
    };
    
    const config = statusConfig[status] || { text: status, class: 'default' };
    return (
      <span className={`${styles.statusBadge} ${styles[config.class]}`}>
        {config.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      superuser: { text: 'スーパーユーザー', class: 'superuser', icon: '👑' },
      admin: { text: 'システム管理者', class: 'admin', icon: '🔧' },
      user: { text: '一般ユーザー', class: 'user', icon: '👤' },
    };
    
    const config = roleConfig[role] || { text: role, class: 'default', icon: '❓' };
    return (
      <span className={`${styles.roleBadge} ${styles[config.class]}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatLastLogin = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今日';
    if (days === 1) return '昨日';
    if (days < 30) return `${days}日前`;
    return formatDate(date);
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
          <div className={styles.headerTop}>
            <div>
              <h1>👥 ユーザー管理</h1>
              <p>システム内の全ユーザーを管理</p>
            </div>
            <Link to="/system-admin" className={styles.backButton}>
              ← システム管理に戻る
            </Link>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={loadUsers} className={styles.retryButton}>
              再試行
            </button>
          </div>
        )}

        {/* フィルターセクション */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="ユーザー名、メール、IDで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filters}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">全てのステータス</option>
              <option value="active">有効</option>
              <option value="suspended">停止中</option>
              <option value="inactive">非活性</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">全てのロール</option>
              <option value="superuser">スーパーユーザー</option>
              <option value="admin">システム管理者</option>
              <option value="user">一般ユーザー</option>
            </select>
          </div>
        </div>

        {/* 統計情報 */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{users.length}</span>
            <span className={styles.statLabel}>全ユーザー</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {users.filter(user => user.status === 'active').length}
            </span>
            <span className={styles.statLabel}>有効</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {users.filter(user => user.systemRole === 'admin' || user.systemRole === 'superuser').length}
            </span>
            <span className={styles.statLabel}>管理者</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {filteredUsers.length}
            </span>
            <span className={styles.statLabel}>表示中</span>
          </div>
        </div>

        {/* ユーザー一覧 */}
        <div className={styles.usersSection}>
          <h2>ユーザー一覧 ({filteredUsers.length}件)</h2>
          
          {filteredUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>条件に一致するユーザーが見つかりません</p>
            </div>
          ) : (
            <div className={styles.usersList}>
              {filteredUsers.map(user => (
                <div key={user.id} className={styles.userCard}>
                  <div className={styles.userHeader}>
                    <div className={styles.userTitle}>
                      <div className={styles.userBasicInfo}>
                        <h3>{user.display_name || 'ユーザー名未設定'}</h3>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                      <div className={styles.userBadges}>
                        {getStatusBadge(user.status)}
                        {getRoleBadge(user.systemRole)}
                      </div>
                    </div>
                    <div className={styles.userActions}>
                      {user.status === 'active' && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleUserAction(user, 'suspend')}
                          className={`${styles.actionButton} ${styles.suspend}`}
                        >
                          停止
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => handleUserAction(user, 'activate')}
                          className={`${styles.actionButton} ${styles.activate}`}
                        >
                          再開
                        </button>
                      )}
                      {user.systemRole === 'user' && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleUserAction(user, 'makeAdmin')}
                          className={`${styles.actionButton} ${styles.promote}`}
                        >
                          管理者化
                        </button>
                      )}
                      {user.systemRole === 'admin' && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleUserAction(user, 'makeUser')}
                          className={`${styles.actionButton} ${styles.demote}`}
                        >
                          一般化
                        </button>
                      )}
                      <Link
                        to={`/system-admin/users/${user.id}`}
                        className={`${styles.actionButton} ${styles.view}`}
                      >
                        詳細
                      </Link>
                    </div>
                  </div>
                  
                  <div className={styles.userDetails}>
                    <div className={styles.userInfo}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>🆔 ユーザーID:</span>
                        <span className={styles.userId}>{user.cognito_user_id || user.id}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>📅 登録日:</span>
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>⏰ 最終ログイン:</span>
                        <span>{formatLastLogin(user.lastLoginAt)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>🏢 所属組織:</span>
                        <span>{user.organizationCount}件</span>
                      </div>
                    </div>
                    
                    <div className={styles.userMeta}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>🌍 タイムゾーン:</span>
                        <span>{user.timezone || 'Asia/Tokyo'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>🌐 言語:</span>
                        <span>{user.language || 'ja'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* アクション確認モーダル */}
        {showActionModal && selectedUser && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>アクションの確認</h3>
              <p>
                ユーザー「{selectedUser.display_name || selectedUser.email}」を
                {actionType === 'suspend' && 'アカウント停止'}
                {actionType === 'activate' && 'アカウント再開'}
                {actionType === 'makeAdmin' && 'システム管理者に昇格'}
                {actionType === 'makeUser' && '一般ユーザーに降格'}
                しますか？
              </p>
              {actionType === 'suspend' && (
                <div className={styles.warningNote}>
                  ⚠️ アカウント停止により、ユーザーはシステムにアクセスできなくなります。
                </div>
              )}
              {actionType === 'makeAdmin' && (
                <div className={styles.warningNote}>
                  ⚠️ システム管理者権限により、ユーザーは重要な管理機能にアクセスできるようになります。
                </div>
              )}
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowActionModal(false)}
                  className={styles.cancelButton}
                >
                  キャンセル
                </button>
                <button
                  onClick={executeAction}
                  className={`${styles.confirmButton} ${styles[actionType]}`}
                >
                  {actionType === 'suspend' && '停止する'}
                  {actionType === 'activate' && '再開する'}
                  {actionType === 'makeAdmin' && '昇格する'}
                  {actionType === 'makeUser' && '降格する'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SystemUsers;