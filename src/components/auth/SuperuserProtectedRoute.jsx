import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionContext';

const SuperuserProtectedRoute = ({ element, requireSuperuser = true }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const { systemRole, canAccessSystemAdmin } = usePermissions();
  const location = useLocation();

  // ローディング中は何も表示しない
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.25rem',
        color: '#4a5568'
      }}>
        認証確認中...
      </div>
    );
  }

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 開発環境では特別な処理
  if (import.meta.env.VITE_NODE_ENV === 'development') {
    // 開発環境のユーザー切り替えでスーパーユーザーロールをチェック
    if (currentUser?.role === 'superuser' || currentUser?.organizationRole === 'superuser') {
      return element;
    }
  }

  // スーパーユーザー権限が必要な場合
  if (requireSuperuser) {
    // システムロールがスーパーユーザーまたはシステム管理者権限をチェック
    const hasSuperuserAccess = 
      systemRole === 'superuser' || 
      systemRole === 'admin' || 
      canAccessSystemAdmin();

    if (!hasSuperuserAccess) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{ color: '#e53e3e', marginBottom: '1rem' }}>
            🚫 アクセス権限がありません
          </h1>
          <p style={{ color: '#4a5568', marginBottom: '2rem', lineHeight: 1.6 }}>
            このページにアクセスするには、システム管理者権限が必要です。<br/>
            アクセス権限についてご質問がある場合は、システム管理者にお問い合わせください。
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => window.history.back()}
              style={{
                background: '#4299e1',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              前のページに戻る
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                background: '#edf2f7',
                color: '#4a5568',
                border: '1px solid #d1d5db',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ホームに戻る
            </button>
          </div>
        </div>
      );
    }
  }

  return element;
};

export default SuperuserProtectedRoute;