import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../../contexts/PermissionContext';
import { permissionApi, permissionHelpers } from '../../../services/permissionApi';
import styles from './InviteMemberModal.module.css';

const InviteMemberModal = ({ isOpen, onClose, organizationId, onSuccess }) => {
  const { currentOrgId } = usePermissions();
  const [inviteType, setInviteType] = useState('search'); // 'search' | 'email'
  const [searchTerm, setSearchTerm] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const targetOrgId = organizationId || currentOrgId;

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setInviteType('search');
    setSearchTerm('');
    setEmailAddress('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedRole('member');
    setLoading(false);
    setSearching(false);
    setError(null);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      setError(null);

      // 実際のAPI呼び出し
      const results = await permissionApi.searchUsers(searchTerm, targetOrgId);
      
      setSearchResults(results);
      setSelectedUser(null);

    } catch (error) {
      console.error('ユーザー検索エラー:', error);
      setError('ユーザー検索に失敗しました。再度お試しください。');
      
      // エラー時のフォールバック（開発用）
      if (process.env.NODE_ENV === 'development') {
        setSearchResults([]);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleEmailSearch = async () => {
    if (!emailAddress.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // 実際のAPI呼び出し
      const user = await permissionApi.getUserByEmail(emailAddress);
      
      setSelectedUser(user);

    } catch (error) {
      console.error('ユーザー検索エラー:', error);
      setError('指定されたメールアドレスのユーザーが見つかりません。');
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (inviteType === 'search' && !selectedUser) {
      setError('招待するユーザーを選択してください。');
      return;
    }

    if (inviteType === 'email' && (!emailAddress.trim() || !selectedUser)) {
      setError('有効なメールアドレスを入力し、ユーザーを検索してください。');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const inviteData = {
        user_id: selectedUser.id,
        organization_id: targetOrgId,
        organization_role: selectedRole,
        invite_type: inviteType
      };

      let result;
      
      // 実際のAPI呼び出し
      if (inviteType === 'email') {
        result = await permissionApi.sendInviteEmail({
          ...inviteData,
          user_email: selectedUser.email
        });
      } else {
        result = await permissionApi.addMemberDirectly(inviteData);
      }
      
      // 成功時の処理
      onSuccess && onSuccess({
        user: selectedUser,
        role: selectedRole,
        type: inviteType,
        result
      });
      
      onClose();

    } catch (error) {
      console.error('招待送信エラー:', error);
      setError('招待の送信に失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      member: '基本的な動物管理機能にアクセスできます。',
      admin: 'メンバー管理と組織設定にアクセスできます。',
      superuser: '組織の完全な管理権限を持ちます。他のスーパーユーザーの管理も可能です。'
    };
    return descriptions[role] || '';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>メンバーを招待</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* 招待方式選択 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>招待方式</h3>
            <div className={styles.inviteTypeOptions}>
              <div 
                className={`${styles.inviteTypeOption} ${inviteType === 'search' ? styles.selected : ''}`}
                onClick={() => setInviteType('search')}
              >
                <div className={styles.inviteTypeIcon}>🔍</div>
                <div className={styles.inviteTypeTitle}>ユーザー検索</div>
                <div className={styles.inviteTypeDesc}>既存ユーザーを検索して直接追加</div>
              </div>
              <div 
                className={`${styles.inviteTypeOption} ${inviteType === 'email' ? styles.selected : ''}`}
                onClick={() => setInviteType('email')}
              >
                <div className={styles.inviteTypeIcon}>📧</div>
                <div className={styles.inviteTypeTitle}>メール招待</div>
                <div className={styles.inviteTypeDesc}>メールアドレスで招待を送信</div>
              </div>
            </div>
          </div>

          {/* ユーザー検索方式 */}
          {inviteType === 'search' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>ユーザーを検索</h3>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="名前またはメールアドレスで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={styles.searchInput}
                />
                <button 
                  className={styles.searchButton}
                  onClick={handleSearch}
                  disabled={searching || !searchTerm.trim()}
                >
                  {searching ? '検索中...' : '検索'}
                </button>
              </div>

              {/* 検索結果 */}
              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map((user) => (
                    <div 
                      key={user.id}
                      className={`${styles.searchResult} ${selectedUser?.id === user.id ? styles.selected : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className={styles.userAvatar}>
                        {getInitials(user.name)}
                      </div>
                      <div className={styles.userInfo}>
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm && searchResults.length === 0 && !searching && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <p>該当するユーザーが見つかりません</p>
                </div>
              )}
            </div>
          )}

          {/* メール招待方式 */}
          {inviteType === 'email' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>メールアドレス</h3>
              <input
                type="email"
                placeholder="招待するユーザーのメールアドレス"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailSearch()}
                className={styles.emailInput}
              />
              <div className={styles.emailHint}>
                既存ユーザーのメールアドレスを入力してください
              </div>
              
              {emailAddress && (
                <button 
                  className={styles.searchButton}
                  onClick={handleEmailSearch}
                  disabled={loading}
                  style={{ marginTop: '0.5rem' }}
                >
                  {loading ? '検索中...' : 'ユーザーを検索'}
                </button>
              )}

              {/* 検索されたユーザー表示 */}
              {selectedUser && inviteType === 'email' && (
                <div className={styles.searchResults} style={{ marginTop: '1rem' }}>
                  <div className={`${styles.searchResult} ${styles.selected}`}>
                    <div className={styles.userAvatar}>
                      {getInitials(selectedUser.name)}
                    </div>
                    <div className={styles.userInfo}>
                      <h4>{selectedUser.name}</h4>
                      <p>{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 権限選択 */}
          {selectedUser && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>権限レベル</h3>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={styles.roleSelect}
              >
                <option value="member">メンバー</option>
                <option value="admin">管理者</option>
                <option value="superuser">スーパーユーザー</option>
              </select>
              <div className={styles.roleDescription}>
                {getRoleDescription(selectedRole)}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            キャンセル
          </button>
          <button 
            className={styles.inviteButton}
            onClick={handleInvite}
            disabled={loading || !selectedUser}
          >
            {loading && <div className={styles.spinner}></div>}
            {inviteType === 'email' ? '招待を送信' : 'メンバーを追加'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;