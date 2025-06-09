import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import InviteMemberModal from '../../../components/admin/InviteMemberModal';
import EditMemberModal from '../../../components/admin/EditMemberModal';
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

      // 実際のAPI呼び出し
      const membersData = await permissionApi.getOrganizationMembers(targetOrgId);
      setMembers(membersData);
    } catch (error) {
      console.error('メンバー一覧の取得に失敗しました:', error);
      setError('メンバー一覧の取得に失敗しました。再度お試しください。');
      
      // エラー時のフォールバック（開発用）
      if (process.env.NODE_ENV === 'development') {
        const fallbackMembers = [];
        setMembers(fallbackMembers);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setError(null);
      
      // 実際のAPI呼び出し
      await permissionApi.updateMemberRole(memberId, { organization_role: newRole });
      
      // 成功時はメンバー一覧を再読み込み
      await loadMembers();
      
      setSuccess('メンバーの権限を更新しました。');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('権限更新に失敗しました:', error);
      setError('権限更新に失敗しました。再度お試しください。');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('このメンバーを削除してもよろしいですか？')) {
      return;
    }

    try {
      setError(null);
      
      // 実際のAPI呼び出し
      await permissionApi.removeMember(memberId);
      
      // 成功時はメンバー一覧を再読み込み
      await loadMembers();
      
      setSuccess('メンバーを削除しました。');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('メンバー削除に失敗しました:', error);
      setError('メンバー削除に失敗しました。再度お試しください。');
    }
  };

  const handleInviteSuccess = (inviteResult) => {
    setSuccess(`${inviteResult.user.name}さんを${permissionHelpers.getRoleDisplayName(inviteResult.role)}として${inviteResult.type === 'email' ? '招待しました' : '追加しました'}。`);
    setTimeout(() => setSuccess(null), 5000);
    
    // メンバー一覧を更新
    loadMembers();
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingMember(null);
    setSuccess('メンバーの権限を更新しました。');
    setTimeout(() => setSuccess(null), 3000);
    
    // メンバー一覧を更新
    loadMembers();
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
              
              <button 
                className={styles.inviteButton}
                onClick={() => setShowInviteModal(true)}
              >
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
                              onClick={() => handleEditMember(member)}
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

      {/* 招待モーダル */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        organizationId={targetOrgId}
        onSuccess={handleInviteSuccess}
      />

      {/* 編集モーダル */}
      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={editingMember}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default MemberManagement;