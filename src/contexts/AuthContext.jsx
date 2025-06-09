import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCurrentUser, signOut, fetchAuthSession, signInWithRedirect } from 'aws-amplify/auth';
import { setAuthToken } from '../services/api';

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
      dispatch({ type: authActions.LOGOUT });
    }
  };

  // 初期化時にCognitoセッションを確認
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (user && session.tokens) {
          const token = session.tokens.accessToken.toString();
          const userData = {
            id: user.userId,
            name: user.signInDetails?.loginId || user.username || 'User',
            email: user.signInDetails?.loginId || user.username || ''
          };
          
          setAuthToken(token);
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(userData));
          dispatch({ type: authActions.LOGIN_SUCCESS, payload: { user: userData, token } });
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

  const value = {
    ...state,
    loginWithGoogle,
    logout,
    clearError,
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