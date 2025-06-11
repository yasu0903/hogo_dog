import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCurrentUser, signOut, fetchAuthSession, signInWithRedirect } from 'aws-amplify/auth';
import { setAuthToken, registerUserIfNotExists } from '../services/api';

// 認証状態の初期値
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// 認証アクション
const authActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  INIT_COMPLETE: 'INIT_COMPLETE',
};

// 認証リデューサー
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case authActions.INIT_COMPLETE:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

// 認証コンテキスト作成
const AuthContext = createContext();

// 認証プロバイダー
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Google認証でのログイン
  const loginWithGoogle = async () => {
    try {
      dispatch({ type: authActions.LOGIN_START });
      await signInWithRedirect({ provider: 'Google' });
      // リダイレクト後の処理は初期化時に実行される
      return { success: true };
    } catch (error) {
      dispatch({ type: authActions.LOGIN_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // ログアウト関数（Cognito対応）
  const logout = async () => {
    try {
      // 開発モードのクリア
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        localStorage.removeItem('dev-user-mode');
        localStorage.removeItem('dev-current-user');
      }

      await signOut();
      setAuthToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      dispatch({ type: authActions.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
      // ローカルストレージはクリアする
      setAuthToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // 開発モードのクリア
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        localStorage.removeItem('dev-user-mode');
        localStorage.removeItem('dev-current-user');
      }
      
      dispatch({ type: authActions.LOGOUT });
    }
  };

  // 初期化時にCognitoセッションを確認
  useEffect(() => {
    const checkAuthState = async () => {
      // 開発環境での復元チェック
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        const devMode = localStorage.getItem('dev-user-mode');
        const savedUser = localStorage.getItem('dev-current-user');
        
        if (devMode === 'true' && savedUser) {
          try {
            const user = JSON.parse(savedUser);
            const devToken = 'test-token';
            
            setAuthToken(devToken);
            dispatch({ 
              type: authActions.LOGIN_SUCCESS, 
              payload: { 
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  organizationRole: user.organizationRole,
                  organizationId: user.organizationId
                }, 
                token: devToken 
              } 
            });
            console.log('🔧 [DEV] 開発用ユーザー復元:', user.name);
            return;
          } catch (error) {
            console.error('開発用ユーザー復元エラー:', error);
            localStorage.removeItem('dev-user-mode');
            localStorage.removeItem('dev-current-user');
          }
        }
      }

      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (user && session.tokens) {
          const token = session.tokens.accessToken.toString();
          
          // 認証トークンをセット
          setAuthToken(token);
          
          try {
            // バックエンドでユーザー存在確認・自動登録
            const registrationResult = await registerUserIfNotExists(user);
            
            const userData = {
              id: registrationResult.user.id,
              cognitoUserId: user.userId,
              name: registrationResult.user.display_name || user.signInDetails?.loginId || user.username || 'User',
              email: registrationResult.user.email || user.signInDetails?.loginId || user.username || '',
              isNewUser: registrationResult.isNewUser
            };
            
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            dispatch({ type: authActions.LOGIN_SUCCESS, payload: { user: userData, token } });
            
            if (registrationResult.isNewUser) {
              console.log('✅ 新規ユーザーとして登録されました:', userData);
            } else {
              console.log('✅ 既存ユーザーとしてログインしました:', userData);
            }
            
          } catch (backendError) {
            console.error('バックエンドユーザー登録でエラーが発生しました:', backendError);
            
            // バックエンドエラーの場合でも認証情報は保持（フロントエンド機能は使用可能）
            const fallbackUserData = {
              id: user.userId,
              cognitoUserId: user.userId,
              name: user.signInDetails?.loginId || user.username || 'User',
              email: user.signInDetails?.loginId || user.username || '',
              isNewUser: null // バックエンド連携失敗
            };
            
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(fallbackUserData));
            dispatch({ type: authActions.LOGIN_SUCCESS, payload: { user: fallbackUserData, token } });
            
            console.warn('⚠️ バックエンド連携に失敗しましたが、フロントエンド認証は有効です');
          }
        }
      } catch (error) {
        // ユーザーがサインインしていない
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      
      dispatch({ type: authActions.INIT_COMPLETE });
    };
    
    checkAuthState();
  }, []);

  // エラークリア関数
  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  // 開発用のユーザー設定関数
  const setDevUser = (user) => {
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      const devToken = 'test-token';
      setAuthToken(devToken);
      localStorage.setItem('dev-user-mode', 'true');
      localStorage.setItem('dev-current-user', JSON.stringify(user));
      
      dispatch({ 
        type: authActions.LOGIN_SUCCESS, 
        payload: { 
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationRole: user.organizationRole,
            organizationId: user.organizationId
          }, 
          token: devToken 
        } 
      });
    }
  };

  const value = {
    ...state,
    currentUser: state.user, // useAuth().currentUser でアクセス可能にする
    isAuthenticated: state.isAuthenticated,
    loginWithGoogle,
    logout,
    clearError,
    setDevUser, // 開発用
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 認証フック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;