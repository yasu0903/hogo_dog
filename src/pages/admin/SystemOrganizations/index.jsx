import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchOrganizations } from '../../../services/api';
import styles from './SystemOrganizations.module.css';

const SystemOrganizations = () => {
  const { currentUser } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchTerm, statusFilter, typeFilter]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrganizations();
      setOrganizations(response.data || []);
    } catch (error) {
      console.error('組織の読み込みに失敗しました:', error);
      setError('組織の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterOrganizations = () => {
    let filtered = [...organizations];

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => org.status === statusFilter);
    }

    // タイプフィルター
    if (typeFilter !== 'all') {
      filtered = filtered.filter(org => org.type === typeFilter);
    }

    setFilteredOrganizations(filtered);
  };

  const handleOrganizationAction = (org, action) => {
    setSelectedOrg(org);
    setActionType(action);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedOrg || !actionType) return;

    try {
      // ここで実際のAPI呼び出しを行う
      console.log(`${actionType} action for organization:`, selectedOrg.id);
      
      // モック実装（実際のAPIが利用可能になったら置き換え）
      const updatedOrgs = organizations.map(org => {
        if (org.id === selectedOrg.id) {
          switch (actionType) {
            case 'approve':
              return { ...org, status: 'active' };
            case 'suspend':
              return { ...org, status: 'suspended' };
            case 'activate':
              return { ...org, status: 'active' };
            default:
              return org;
          }
        }
        return org;
      });
      
      setOrganizations(updatedOrgs);
      setShowActionModal(false);
      setSelectedOrg(null);
      setActionType('');
    } catch (error) {
      console.error('アクションの実行に失敗しました:', error);
      setError('アクションの実行に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: '稼働中', class: 'active' },
      pending: { text: '承認待ち', class: 'pending' },
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

  const getTypeBadge = (type) => {
    const typeConfig = {
      shelter: { text: '保護施設', icon: '🏠' },
      rescue: { text: '保護団体', icon: '🚑' },
      veterinary: { text: '動物病院', icon: '🏥' },
    };
    
    const config = typeConfig[type] || { text: type, icon: '🏢' };
    return (
      <span className={styles.typeBadge}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
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
              <h1>🏢 組織管理</h1>
              <p>システム内の全組織を管理</p>
            </div>
            <Link to="/system-admin" className={styles.backButton}>
              ← システム管理に戻る
            </Link>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={loadOrganizations} className={styles.retryButton}>
              再試行
            </button>
          </div>
        )}

        {/* フィルターセクション */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="組織名、メール、説明で検索..."
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
              <option value="active">稼働中</option>
              <option value="pending">承認待ち</option>
              <option value="suspended">停止中</option>
              <option value="inactive">非活性</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">全てのタイプ</option>
              <option value="shelter">保護施設</option>
              <option value="rescue">保護団体</option>
              <option value="veterinary">動物病院</option>
            </select>
          </div>
        </div>

        {/* 統計情報 */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{organizations.length}</span>
            <span className={styles.statLabel}>全組織</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {organizations.filter(org => org.status === 'active').length}
            </span>
            <span className={styles.statLabel}>稼働中</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {organizations.filter(org => org.status === 'pending').length}
            </span>
            <span className={styles.statLabel}>承認待ち</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {filteredOrganizations.length}
            </span>
            <span className={styles.statLabel}>表示中</span>
          </div>
        </div>

        {/* 組織一覧 */}
        <div className={styles.organizationsSection}>
          <h2>組織一覧 ({filteredOrganizations.length}件)</h2>
          
          {filteredOrganizations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>条件に一致する組織が見つかりません</p>
            </div>
          ) : (
            <div className={styles.organizationsList}>
              {filteredOrganizations.map(org => (
                <div key={org.id} className={styles.organizationCard}>
                  <div className={styles.orgHeader}>
                    <div className={styles.orgTitle}>
                      <h3>{org.name}</h3>
                      <div className={styles.orgBadges}>
                        {getStatusBadge(org.status)}
                        {getTypeBadge(org.type)}
                      </div>
                    </div>
                    <div className={styles.orgActions}>
                      {org.status === 'pending' && (
                        <button
                          onClick={() => handleOrganizationAction(org, 'approve')}
                          className={`${styles.actionButton} ${styles.approve}`}
                        >
                          承認
                        </button>
                      )}
                      {org.status === 'active' && (
                        <button
                          onClick={() => handleOrganizationAction(org, 'suspend')}
                          className={`${styles.actionButton} ${styles.suspend}`}
                        >
                          停止
                        </button>
                      )}
                      {org.status === 'suspended' && (
                        <button
                          onClick={() => handleOrganizationAction(org, 'activate')}
                          className={`${styles.actionButton} ${styles.activate}`}
                        >
                          再開
                        </button>
                      )}
                      <Link
                        to={`/system-admin/organizations/${org.id}`}
                        className={`${styles.actionButton} ${styles.view}`}
                      >
                        詳細
                      </Link>
                    </div>
                  </div>
                  
                  <div className={styles.orgDetails}>
                    <div className={styles.orgInfo}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>📧 メール:</span>
                        <span>{org.email || '未設定'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>📞 電話:</span>
                        <span>{org.phone || '未設定'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>📅 登録日:</span>
                        <span>{formatDate(org.created_at)}</span>
                      </div>
                    </div>
                    
                    {org.description && (
                      <div className={styles.orgDescription}>
                        <p>{org.description}</p>
                      </div>
                    )}
                    
                    {org.address && (
                      <div className={styles.orgAddress}>
                        <span className={styles.infoLabel}>📍 住所:</span>
                        <span>
                          {org.address.prefecture} {org.address.city} {org.address.street}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* アクション確認モーダル */}
        {showActionModal && selectedOrg && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>アクションの確認</h3>
              <p>
                組織「{selectedOrg.name}」を
                {actionType === 'approve' && '承認'}
                {actionType === 'suspend' && '停止'}
                {actionType === 'activate' && '再開'}
                しますか？
              </p>
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
                  {actionType === 'approve' && '承認する'}
                  {actionType === 'suspend' && '停止する'}
                  {actionType === 'activate' && '再開する'}
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

export default SystemOrganizations;