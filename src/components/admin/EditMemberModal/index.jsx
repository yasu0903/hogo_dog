import React, { useState, useEffect } from 'react';
import { permissionApi, permissionHelpers } from '../../../services/permissionApi';
import { usePermissions } from '../../../contexts/PermissionContext';
import styles from './EditMemberModal.module.css';

const EditMemberModal = ({ isOpen, onClose, member, onSuccess }) => {
  const { currentOrgRole } = usePermissions();
  const [selectedRole, setSelectedRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (member && isOpen) {
      setSelectedRole(member.organization_role);
      setError(null);
    }
  }, [member, isOpen]);

  const handleSave = async () => {
    if (!member || selectedRole === member.organization_role) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await permissionApi.updateMemberRole(member.id, { 
        organization_role: selectedRole 
      });

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('権限更新エラー:', error);
      setError('権限の更新に失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRoles = () => {
    const allRoles = [
      { value: 'member', label: 'メンバー', description: '基本的な動物管理機能にアクセス' },
      { value: 'admin', label: '管理者', description: 'メンバー管理と組織設定にアクセス' },
      { value: 'superuser', label: 'スーパーユーザー', description: '組織の完全な管理権限' }
    ];

    // 現在のユーザーが管理できる権限のみを表示
    return allRoles.filter(role => {
      // 現在の権限以下または管理可能な権限のみ
      return permissionHelpers.canManageUser(currentOrgRole, role.value) || 
             role.value === member?.organization_role;
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isOpen || !member) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>メンバー権限の編集</h2>
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

          {/* メンバー情報表示 */}
          <div className={styles.memberInfo}>
            <div className={styles.memberAvatar}>
              {getInitials(member.user.name)}
            </div>
            <div className={styles.memberDetails}>
              <h3>{member.user.name}</h3>
              <p>{member.user.email}</p>
              <span className={styles.currentRole}>
                現在の権限: {permissionHelpers.getRoleDisplayName(member.organization_role)}
              </span>
            </div>
          </div>

          {/* 権限選択 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>新しい権限レベル</h3>
            <div className={styles.roleOptions}>
              {getAvailableRoles().map(role => (
                <div 
                  key={role.value}
                  className={`${styles.roleOption} ${selectedRole === role.value ? styles.selected : ''}`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <div className={styles.roleHeader}>
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={() => setSelectedRole(role.value)}
                      className={styles.roleRadio}
                    />
                    <label className={styles.roleLabel}>{role.label}</label>
                  </div>
                  <p className={styles.roleDescription}>{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedRole !== member.organization_role && (
            <div className={styles.changeWarning}>
              <div className={styles.warningIcon}>⚠️</div>
              <div className={styles.warningText}>
                <strong>{member.user.name}さん</strong>の権限を
                <strong>{permissionHelpers.getRoleDisplayName(member.organization_role)}</strong>から
                <strong>{permissionHelpers.getRoleDisplayName(selectedRole)}</strong>に変更します。
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            キャンセル
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSave}
            disabled={loading || selectedRole === member.organization_role}
          >
            {loading && <div className={styles.spinner}></div>}
            {selectedRole === member.organization_role ? '変更なし' : '権限を更新'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;