import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionContext';

const AdminProtectedRoute = ({ 
  element, 
  systemRole, 
  organizationRole, 
  organizationId, 
  requireAll = false 
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    hasSystemRole, 
    hasOrganizationRole, 
    currentOrgId,
    isLoading: permissionLoading 
  } = usePermissions();
  const location = useLocation();

  // ローディング中は何も表示しない
  if (authLoading || permissionLoading) {
    return <div>Loading...</div>;
  }

  // 未認証の場合はログインページへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 権限チェック
  const hasSystemPermission = systemRole ? hasSystemRole(systemRole) : true;
  const hasOrgPermission = organizationRole ? 
    hasOrganizationRole(organizationId || currentOrgId, organizationRole) : true;

  // requireAll が true の場合、両方の権限が必要
  // requireAll が false の場合、どちらかの権限があればOK
  const hasPermission = requireAll ? 
    (hasSystemPermission && hasOrgPermission) :
    (hasSystemPermission || hasOrgPermission);

  // システムロールのみ指定された場合
  if (systemRole && !organizationRole) {
    if (!hasSystemPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 組織ロールのみ指定された場合
  if (organizationRole && !systemRole) {
    if (!hasOrgPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 両方指定された場合
  if (systemRole && organizationRole) {
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return element;
};

export default AdminProtectedRoute;