import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { usePermissions } from '../../../contexts/PermissionContext';
import { permissionApi, permissionHelpers } from '../../../services/permissionApi';
import styles from './MemberManagement.module.css';

const MemberManagement = () => {
  const { organizationId } = useParams();
  const {
    currentOrgId,
    currentOrgRole,
    canManageMembers,
    setCurrentOrganization
  } = usePermissions();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const targetOrgId = organizationId || currentOrgId;

  useEffect(() => {
    if (organizationId && organizationId !== currentOrgId) {
      setCurrentOrganization(organizationId);
    }
  }, [organizationId, currentOrgId, setCurrentOrganization]);

  useEffect(() => {
    if (targetOrgId) {
      loadMembers();
    }
  }, [targetOrgId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // 実際のAPI呼び出し（現在はモックデータ）
      const mockMembers = [
        {
          id: '1',
          user_id: 'user-1',
          organization_id: targetOrgId,
          organization_role: 'superuser',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            name: '田中太郎',
            email: 'tanaka@example.com',
          }
        },
        {
          id: '2',
          user_id: 'user-2',
          organization_id: targetOrgId,
          organization_role: 'admin',
          status: 'active',
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z',
          user: {
            id: 'user-2',
            name: '佐藤花子',
            email: 'sato@example.com',
          }
        },
        {
          id: '3',
          user_id: 'user-3',
          organization_id: targetOrgId,
          organization_role: 'member',
          status: 'active',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          user: {
            id: 'user-3',
            name: '山田次郎',
            email: 'yamada@example.com',
          }
        },
        {
          id: '4',
          user_id: 'user-4',
          organization_id: targetOrgId,
          organization_role: 'member',
          status: 'pending',
          created_at: '2024-01-20T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z',
          user: {
            id: 'user-4',
            name: '鈴木三郎',
            email: 'suzuki@example.com',
          }
        }
      ];

      setMembers(mockMembers);
    } catch (error) {
      console.error('メンバー一覧の取得に失敗しました:', error);
      setError('メンバー一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setError(null);
      
      // 実際のAPI呼び出し
      // await permissionApi.updateMemberRole(memberId, { organization_role: newRole });
      
      // モック実装：ローカル状態を更新
      setMembers(prevMembers =>
        prevMembers.map(member =>
          member.id === memberId
            ? { ...member, organization_role: newRole, updated_at: new Date().toISOString() }
            : member
        )
      );
      
      setSuccess('メンバーの権限を更新しました。');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('権限更新に失敗しました:', error);
      setError('権限更新に失敗しました。');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('このメンバーを削除してもよろしいですか？')) {
      return;
    }

    try {
      setError(null);
      
      // 実際のAPI呼び出し
      // await permissionApi.removeMember(memberId);
      
      // モック実装：ローカル状態から削除
      setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      
      setSuccess('メンバーを削除しました。');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('メンバー削除に失敗しました:', error);
      setError('メンバー削除に失敗しました。');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.organization_role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const canManageSpecificMember = (memberRole) => {
    return permissionHelpers.canManageUser(currentOrgRole, memberRole);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  if (!targetOrgId) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.error}>
              組織が選択されていません。
            </div>
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
          <div className={styles.header}>
            <h1 className={styles.title}>メンバー管理</h1>
            <p className={styles.subtitle}>組織のメンバーと権限を管理します</p>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              {success}
            </div>
          )}

          <PermissionGuard organizationRole="admin" organizationId={targetOrgId}>
            <div className={styles.actions}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="名前やメールアドレスで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              
              <div className={styles.filterSection}>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">すべての権限</option>
                  <option value="superuser">スーパーユーザー</option>
                  <option value="admin">管理者</option>
                  <option value="member">メンバー</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">すべてのステータス</option>
                  <option value="active">アクティブ</option>
                  <option value="pending">承認待ち</option>
                  <option value="inactive">非アクティブ</option>
                  <option value="suspended">停止中</option>
                </select>
              </div>
              
              <button className={styles.inviteButton}>
                <span>👥</span>
                メンバーを招待
              </button>
            </div>
          </PermissionGuard>

          <div className={styles.membersList}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>メンバー一覧を読み込み中...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <h3>メンバーが見つかりません</h3>
                <p>検索条件を変更するか、新しいメンバーを招待してください。</p>
              </div>
            ) : (
              <table className={styles.membersTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>メンバー</th>
                    <th className={styles.tableHeaderCell}>権限</th>
                    <th className={styles.tableHeaderCell}>ステータス</th>
                    <th className={styles.tableHeaderCell}>参加日</th>
                    <th className={styles.tableHeaderCell}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberAvatar}>
                            {getInitials(member.user.name)}
                          </div>
                          <div className={styles.memberDetails}>
                            <h4>{member.user.name}</h4>
                            <p>{member.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.roleBadge} ${styles[member.organization_role]}`}>
                          {permissionHelpers.getRoleDisplayName(member.organization_role)}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${styles[member.status]}`}>
                          {permissionHelpers.getStatusDisplayName(member.status)}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.joinedDate}>
                          {formatDate(member.created_at)}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <PermissionGuard organizationRole="admin" organizationId={targetOrgId}>
                          <div className={styles.actionButtons}>
                            <button
                              className={`${styles.actionButton} ${styles.editButton}`}
                              disabled={!canManageSpecificMember(member.organization_role)}
                              title="権限を編集"
                            >
                              ✏️
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={!canManageSpecificMember(member.organization_role)}
                              title="メンバーを削除"
                            >
                              🗑️
                            </button>
                          </div>
                        </PermissionGuard>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MemberManagement;