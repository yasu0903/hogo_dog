// src/App.jsx
import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { useAuth } from './contexts/AuthContext';
import UserSwitcher from './components/dev/UserSwitcher';
import WelcomeModal from './components/auth/WelcomeModal';
import router from './routes';

// アプリのメインコンテンツ（認証コンテキスト内）
const AppContent = () => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // 認証完了後、新規ユーザーの場合はウェルカムモーダルを表示
    if (isAuthenticated && !isLoading && currentUser?.isNewUser === true) {
      // セッションストレージで今回のセッションで既に表示したかチェック
      const welcomeShown = sessionStorage.getItem('welcome-shown');
      if (!welcomeShown) {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated, isLoading, currentUser]);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // 今回のセッションでは再表示しない
    sessionStorage.setItem('welcome-shown', 'true');
  };

  return (
    <>
      <RouterProvider router={router} />
      <UserSwitcher />
      <WelcomeModal 
        user={currentUser}
        isVisible={showWelcome}
        onClose={handleWelcomeClose}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <AppContent />
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
