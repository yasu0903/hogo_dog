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

  // === 新しい招待機能API（モック実装） ===
  
  // ユーザー検索（組織管理者向け）
  searchUsers: async (searchTerm, organizationId) => {
    try {
      // TODO: 実際のAPI実装時に置き換え
      // const response = await api.get(`/organizations/${organizationId}/users/search`, {
      //   params: { q: searchTerm }
      // });
      
      // モック実装
      const mockUsers = [
        {
          id: 'user-1',
          name: '山田太郎',
          email: 'yamada.taro@example.com',
          created_at: '2024-01-01T00:00:00Z',
          last_login: '2024-01-20T10:30:00Z'
        },
        {
          id: 'user-2',
          name: '佐藤花子',
          email: 'sato.hanako@example.com',
          created_at: '2024-01-05T00:00:00Z',
          last_login: '2024-01-19T15:45:00Z'
        },
        {
          id: 'user-3',
          name: '田中次郎',
          email: 'tanaka.jiro@example.com',
          created_at: '2024-01-10T00:00:00Z',
          last_login: '2024-01-18T09:15:00Z'
        }
      ];

      // 検索フィルター適用
      const filteredUsers = mockUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredUsers;
    } catch (error) {
      console.error('ユーザー検索に失敗しました:', error);
      throw error;
    }
  },

  // メールアドレスでユーザー検索
  getUserByEmail: async (email) => {
    try {
      // TODO: 実際のAPI実装時に置き換え
      // const response = await api.get(`/users/search`, {
      //   params: { email }
      // });
      
      // モック実装
      const mockUser = {
        id: 'user-email-' + Date.now(),
        name: 'メール太郎',
        email: email,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      return mockUser;
    } catch (error) {
      console.error('メールでのユーザー検索に失敗しました:', error);
      throw error;
    }
  },

  // 招待メール送信
  sendInviteEmail: async (inviteData) => {
    try {
      // TODO: 実際のAPI実装時に置き換え
      // const response = await api.post('/user-organizations/invite', inviteData);
      
      // モック実装
      const mockResponse = {
        id: 'invite-' + Date.now(),
        user_id: inviteData.user_id,
        organization_id: inviteData.organization_id,
        organization_role: inviteData.organization_role,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7日後
        created_at: new Date().toISOString()
      };

      // 実際の実装では、ここでメール送信も行われる
      console.log('招待メール送信（モック）:', {
        to: inviteData.user_email,
        organization: inviteData.organization_name,
        role: inviteData.organization_role
      });

      return mockResponse;
    } catch (error) {
      console.error('招待メール送信に失敗しました:', error);
      throw error;
    }
  },

  // 直接メンバー追加（既存のcreateを拡張）
  addMemberDirectly: async (memberData) => {
    try {
      // TODO: 実際のAPI実装時に置き換え
      // const response = await api.post('/user-organizations/create', memberData);
      
      // モック実装
      const mockResponse = {
        id: 'member-' + Date.now(),
        user_id: memberData.user_id,
        organization_id: memberData.organization_id,
        organization_role: memberData.organization_role,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return mockResponse;
    } catch (error) {
      console.error('メンバー直接追加に失敗しました:', error);
      throw error;
    }
  },

  // 招待ステータス一覧取得
  getPendingInvites: async (organizationId) => {
    try {
      // TODO: 実際のAPI実装時に置き換え
      // const response = await api.get(`/user-organizations/pending`, {
      //   params: { organization_id: organizationId }
      // });
      
      // モック実装
      const mockInvites = [
        {
          id: 'invite-1',
          user: {
            id: 'user-pending-1',
            name: '招待中太郎',
            email: 'pending.taro@example.com'
          },
          organization_id: organizationId,
          organization_role: 'member',
          status: 'pending',
          expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: '2024-01-20T10:00:00Z'
        }
      ];

      return mockInvites;
    } catch (error) {
      console.error('保留中招待の取得に失敗しました:', error);
      throw error;
    }
  },

  // 招待取り消し
  cancelInvite: async (inviteId) => {
    try {
      // TODO: 実際のAPI実装時に置き換え
      // const response = await api.delete(`/user-organizations/invite/${inviteId}`);
      
      // モック実装
      console.log('招待取り消し（モック）:', inviteId);
      return { success: true };
    } catch (error) {
      console.error('招待取り消しに失敗しました:', error);
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