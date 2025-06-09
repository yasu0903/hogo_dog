import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const initialState = {
  userPermissions: {},
  currentOrgId: null,
  currentOrgRole: null,
  systemRole: null,
  isLoading: false,
  error: null,
};

const permissionActions = {
  SET_LOADING: 'SET_LOADING',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  SET_CURRENT_ORG: 'SET_CURRENT_ORG',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET: 'RESET',
};

const permissionReducer = (state, action) => {
  switch (action.type) {
    case permissionActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    case permissionActions.SET_PERMISSIONS:
      return {
        ...state,
        userPermissions: action.payload.userPermissions,
        systemRole: action.payload.systemRole,
        isLoading: false,
        error: null,
      };
    case permissionActions.SET_CURRENT_ORG:
      const orgRole = state.userPermissions[action.payload]?.organization_role || null;
      return {
        ...state,
        currentOrgId: action.payload,
        currentOrgRole: orgRole,
      };
    case permissionActions.SET_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case permissionActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case permissionActions.RESET:
      return initialState;
    default:
      return state;
  }
};

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(permissionReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  const fetchUserPermissions = async () => {
    if (!user?.id) return;

    try {
      dispatch({ type: permissionActions.SET_LOADING, payload: true });

      // バックエンドAPIから権限情報を取得
      // TODO: 実際のAPI実装時に置き換え
      const mockPermissions = {
        userPermissions: {
          'org-1': {
            organization_id: 'org-1',
            organization_role: 'admin',
            status: 'active'
          },
          'org-2': {
            organization_id: 'org-2', 
            organization_role: 'member',
            status: 'active'
          }
        },
        systemRole: 'moderator'
      };

      dispatch({ 
        type: permissionActions.SET_PERMISSIONS, 
        payload: mockPermissions 
      });

    } catch (error) {
      console.error('権限情報の取得に失敗しました:', error);
      dispatch({ 
        type: permissionActions.SET_ERROR, 
        payload: '権限情報の取得に失敗しました' 
      });
    }
  };

  const setCurrentOrganization = (organizationId) => {
    dispatch({ 
      type: permissionActions.SET_CURRENT_ORG, 
      payload: organizationId 
    });
  };

  const refreshPermissions = async () => {
    await fetchUserPermissions();
  };

  const clearError = () => {
    dispatch({ type: permissionActions.CLEAR_ERROR });
  };

  const reset = () => {
    dispatch({ type: permissionActions.RESET });
  };

  // 権限チェック用ヘルパー関数
  const hasSystemRole = (requiredRole) => {
    const roleHierarchy = { viewer: 1, moderator: 2, admin: 3 };
    const userRoleLevel = roleHierarchy[state.systemRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    return userRoleLevel >= requiredRoleLevel;
  };

  const hasOrganizationRole = (organizationId, requiredRole) => {
    if (!organizationId) return false;
    
    const orgPermission = state.userPermissions[organizationId];
    if (!orgPermission || orgPermission.status !== 'active') return false;

    const roleHierarchy = { member: 1, admin: 2, superuser: 3 };
    const userRoleLevel = roleHierarchy[orgPermission.organization_role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    return userRoleLevel >= requiredRoleLevel;
  };

  const canManageMembers = (organizationId = state.currentOrgId) => {
    return hasOrganizationRole(organizationId, 'admin');
  };

  const canManageSuperusers = (organizationId = state.currentOrgId) => {
    return hasOrganizationRole(organizationId, 'superuser');
  };

  const canManageOrganizations = () => {
    return hasSystemRole('moderator');
  };

  const canAccessSystemAdmin = () => {
    return hasSystemRole('admin');
  };

  const getUserOrganizations = () => {
    return Object.values(state.userPermissions).filter(
      perm => perm.status === 'active'
    );
  };

  const getCurrentOrgPermission = () => {
    return state.currentOrgId ? state.userPermissions[state.currentOrgId] : null;
  };

  // 認証状態が変わった時に権限情報を取得
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserPermissions();
    } else {
      reset();
    }
  }, [isAuthenticated, user?.id]);

  const value = {
    ...state,
    // アクション
    setCurrentOrganization,
    refreshPermissions,
    clearError,
    reset,
    // 権限チェック関数
    hasSystemRole,
    hasOrganizationRole,
    canManageMembers,
    canManageSuperusers,
    canManageOrganizations,
    canAccessSystemAdmin,
    // ユーティリティ関数
    getUserOrganizations,
    getCurrentOrgPermission,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export default PermissionContext;