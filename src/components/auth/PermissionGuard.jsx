import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';

const PermissionGuard = ({ 
  children, 
  systemRole, 
  organizationRole, 
  organizationId, 
  fallback = null,
  requireAll = false 
}) => {
  const {
    hasSystemRole,
    hasOrganizationRole,
    currentOrgId,
    isLoading
  } = usePermissions();

  // ローディング中は何も表示しない
  if (isLoading) {
    return null;
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
    return hasSystemPermission ? children : fallback;
  }

  // 組織ロールのみ指定された場合
  if (organizationRole && !systemRole) {
    return hasOrgPermission ? children : fallback;
  }

  // 両方指定された場合
  if (systemRole && organizationRole) {
    return hasPermission ? children : fallback;
  }

  // 何も指定されていない場合はそのまま表示
  return children;
};

export default PermissionGuard;