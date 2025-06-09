import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { createUser } from '../../services/api';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 名前
    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください';
    }

    // メールアドレス
    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!formData.email.includes('@')) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    // パスワード
    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    // パスワード確認
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワード（確認）を入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    // 電話番号（任意）
    if (formData.phone && !/^[\d\-\(\)\s]+$/.test(formData.phone)) {
      newErrors.phone = '有効な電話番号を入力してください';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // 実際のAPIコールの代わりにモック処理
      try {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address
        });
      } catch (apiError) {
        console.warn('API接続に失敗しました。モック処理を続行します:', apiError);
      }

      // モック認証情報を生成
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUser = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        role: 'user'
      };

      // 自動ログイン
      const result = await login(mockToken, mockUser);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ submit: 'アカウント作成後のログインに失敗しました' });
      }
    } catch (error) {
      setErrors({ submit: 'アカウント作成中にエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.registerContainer}>
          <div className={styles.registerCard}>
            <div className={styles.header}>
              <h1 className={styles.title}>新規登録</h1>
              <p className={styles.subtitle}>新しいアカウントを作成してください</p>
            </div>

            {errors.submit && (
              <div className={styles.errorAlert}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  お名前 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="山田太郎"
                  required
                  disabled={isLoading}
                />
                {errors.name && (
                  <div className={styles.fieldError}>{errors.name}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  メールアドレス <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="example@email.com"
                  required
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className={styles.fieldError}>{errors.email}</div>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    パスワード <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    placeholder="6文字以上"
                    required
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <div className={styles.fieldError}>{errors.password}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    パスワード（確認） <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                    placeholder="パスワードを再入力"
                    required
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <div className={styles.fieldError}>{errors.confirmPassword}</div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  placeholder="090-1234-5678"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <div className={styles.fieldError}>{errors.phone}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address" className={styles.label}>
                  住所
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="東京都渋谷区..."
                  rows={3}
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
                    アカウント作成中...
                  </>
                ) : (
                  'アカウントを作成'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p className={styles.loginPrompt}>
                すでにアカウントをお持ちの方は{' '}
                <Link to="/login" className={styles.loginLink}>
                  ログイン
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;