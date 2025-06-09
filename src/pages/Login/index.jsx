import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, error: authError, isLoading } = useAuth();
  
  const [localError, setLocalError] = useState('');

  // リダイレクト先を取得（デフォルトはダッシュボード）
  const from = location.state?.from?.pathname || '/dashboard';

  const handleGoogleLogin = async () => {
    setLocalError('');
    try {
      const result = await loginWithGoogle();
      if (!result.success && result.error) {
        setLocalError(result.error);
      }
      // 成功時はリダイレクトで自動的に処理される
    } catch (error) {
      setLocalError('Google認証中にエラーが発生しました');
    }
  };

  const displayError = localError || authError;

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.header}>
              <h1 className={styles.title}>ログイン</h1>
              <p className={styles.subtitle}>
                Googleアカウントでログインしてください
              </p>
            </div>

            {displayError && (
              <div className={styles.errorAlert}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* Googleログインボタン */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={styles.googleButton}
              disabled={isLoading}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'ログイン中...' : 'Googleでログイン'}
            </button>

            <div className={styles.footer}>
              <p className={styles.infoText}>
                個人情報保護のため、このサービスではGoogleアカウントのみを使用しています。
                メールアドレスと名前のみが使用され、その他の個人情報は保存されません。
              </p>
              
              <p className={styles.backLink}>
                <Link to="/">ホームに戻る</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;