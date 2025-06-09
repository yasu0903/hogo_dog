import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');

  // リダイレクト先を取得（デフォルトはダッシュボード）
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // エラーをクリア
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // バリデーション
    if (!formData.email || !formData.password) {
      setLocalError('メールアドレスとパスワードを入力してください');
      return;
    }

    if (!formData.email.includes('@')) {
      setLocalError('有効なメールアドレスを入力してください');
      return;
    }

    try {
      // 実際のAPIコールの代わりにモック認証を使用
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUser = {
        id: '1',
        email: formData.email,
        name: 'テストユーザー',
        role: 'user'
      };

      const result = await login(mockToken, mockUser);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setLocalError(result.error || 'ログインに失敗しました');
      }
    } catch (error) {
      setLocalError('ログイン処理中にエラーが発生しました');
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
              <p className={styles.subtitle}>アカウントにログインしてください</p>
            </div>

            {displayError && (
              <div className={styles.errorAlert}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="example@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  パスワード
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="パスワードを入力"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    ログイン中...
                  </>
                ) : (
                  'ログイン'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p className={styles.signupPrompt}>
                アカウントをお持ちでない方は{' '}
                <Link to="/register" className={styles.signupLink}>
                  新規登録
                </Link>
              </p>
              
              <div className={styles.demoInfo}>
                <h4>デモ用アカウント</h4>
                <p>任意のメールアドレスとパスワードでログインできます</p>
                <div className={styles.demoCredentials}>
                  <p><strong>例:</strong></p>
                  <p>メール: demo@example.com</p>
                  <p>パスワード: password</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;