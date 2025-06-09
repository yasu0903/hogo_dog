import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // ローディング中は何も表示しない
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.1rem',
        color: '#4a5568'
      }}>
        認証情報を確認中...
      </div>
    );
  }

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 管理者権限が必要で、管理者でない場合はアクセス拒否
  if (requireAdmin && user?.role !== 'admin') {
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
        <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>
          アクセス権限がありません
        </h2>
        <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
          このページにアクセスするには管理者権限が必要です。
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          戻る
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;