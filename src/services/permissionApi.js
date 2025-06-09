import { api } from './api';

export const permissionApi = {
  // ユーザーの組織権限一覧を取得
  getUserOrganizations: async (userId, filters = {}) => {
    try {
      const params = { user_id: userId, ...filters };
      const response = await api.get('/user-organizations/list', { params });
      return response.data;
    } catch (error) {
      console.error('ユーザー組織権限の取得に失敗しました:', error);
      throw error;
    }
  },

  // 特定組織のメンバー一覧を取得
  getOrganizationMembers: async (organizationId, filters = {}) => {
    try {
      const params = { organization_id: organizationId, ...filters };
      const response = await api.get('/user-organizations/list', { params });
      return response.data;
    } catch (error) {
      console.error('組織メンバーの取得に失敗しました:', error);
      throw error;
    }
  },

  // ユーザーのシステムロールを取得
  getUserRole: async (userId) => {
    try {
      const response = await api.get(`/user-roles/get/${userId}`);
      return response.data;
    } catch (error) {
      console.error('ユーザーロールの取得に失敗しました:', error);
      throw error;
    }
  },

  // システムロール一覧を取得
  getUserRoles: async (filters = {}) => {
    try {
      const response = await api.get('/user-roles/list', { params: filters });
      return response.data;
    } catch (error) {
      console.error('ユーザーロール一覧の取得に失敗しました:', error);
      throw error;
    }
  },

  // 組織メンバーを招待/追加
  inviteUser: async (data) => {
    try {
      const response = await api.post('/user-organizations/create', data);
      return response.data;
    } catch (error) {
      console.error('ユーザー招待に失敗しました:', error);
      throw error;
    }
  },

  // メンバーの権限を更新
  updateMemberRole: async (userOrganizationId, data) => {
    try {
      const response = await api.put(`/user-organizations/update/${userOrganizationId}`, data);
      return response.data;
    } catch (error) {
      console.error('メンバー権限の更新に失敗しました:', error);
      throw error;
    }
  },

  // メンバーを削除
  removeMember: async (userOrganizationId) => {
    try {
      const response = await api.delete(`/user-organizations/delete/${userOrganizationId}`);
      return response.data;
    } catch (error) {
      console.error('メンバー削除に失敗しました:', error);
      throw error;
    }
  },

  // システムロールを作成
  createUserRole: async (data) => {
    try {
      const response = await api.post('/user-roles/create', data);
      return response.data;
    } catch (error) {
      console.error('ユーザーロールの作成に失敗しました:', error);
      throw error;
    }
  },

  // システムロールを更新
  updateUserRole: async (userRoleId, data) => {
    try {
      const response = await api.put(`/user-roles/update/${userRoleId}`, data);
      return response.data;
    } catch (error) {
      console.error('ユーザーロールの更新に失敗しました:', error);
      throw error;
    }
  },

  // システムロールを削除
  deleteUserRole: async (userRoleId) => {
    try {
      const response = await api.delete(`/user-roles/delete/${userRoleId}`);
      return response.data;
    } catch (error) {
      console.error('ユーザーロールの削除に失敗しました:', error);
      throw error;
    }
  },
};

// 権限チェック用ヘルパー関数
export const permissionHelpers = {
  // ユーザーの組織権限を整理
  organizeUserPermissions: (userOrganizations) => {
    const permissions = {};
    userOrganizations.forEach(uo => {
      permissions[uo.organization_id] = {
        id: uo.id,
        organization_id: uo.organization_id,
        organization_role: uo.organization_role,
        status: uo.status,
        created_at: uo.created_at,
        updated_at: uo.updated_at,
      };
    });
    return permissions;
  },

  // 権限レベルを数値に変換
  getRoleLevel: (role, type = 'organization') => {
    if (type === 'organization') {
      const levels = { member: 1, admin: 2, superuser: 3 };
      return levels[role] || 0;
    } else if (type === 'system') {
      const levels = { viewer: 1, moderator: 2, admin: 3 };
      return levels[role] || 0;
    }
    return 0;
  },

  // 権限の比較
  hasRequiredRole: (userRole, requiredRole, type = 'organization') => {
    const userLevel = permissionHelpers.getRoleLevel(userRole, type);
    const requiredLevel = permissionHelpers.getRoleLevel(requiredRole, type);
    return userLevel >= requiredLevel;
  },

  // 組織内でのメンバー管理権限チェック
  canManageUser: (managerRole, targetRole) => {
    // superuser は全て管理可能
    if (managerRole === 'superuser') return true;
    
    // admin は member のみ管理可能
    if (managerRole === 'admin' && targetRole === 'member') return true;
    
    return false;
  },

  // ロール表示名の取得
  getRoleDisplayName: (role, type = 'organization') => {
    if (type === 'organization') {
      const names = {
        member: 'メンバー',
        admin: '管理者',
        superuser: 'スーパーユーザー'
      };
      return names[role] || role;
    } else if (type === 'system') {
      const names = {
        viewer: '閲覧者',
        moderator: 'モデレーター',
        admin: 'システム管理者'
      };
      return names[role] || role;
    }
    return role;
  },

  // ステータス表示名の取得
  getStatusDisplayName: (status) => {
    const names = {
      active: 'アクティブ',
      inactive: '非アクティブ',
      suspended: '停止中',
      pending: '承認待ち'
    };
    return names[status] || status;
  },
};