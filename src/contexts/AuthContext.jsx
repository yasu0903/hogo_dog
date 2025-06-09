import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
    default:
      return state;
  }
};

// 認証コンテキスト作成
const AuthContext = createContext();

// 認証プロバイダー
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ローカルストレージからトークンを復元
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          setAuthToken(storedToken);
          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: { user, token: storedToken },
          });
        } else {
          dispatch({ type: authActions.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error restoring auth:', error);
        logout();
      }
    };

    restoreAuth();
  }, []);

  // ログイン関数
  const login = async (token, user) => {
    try {
      dispatch({ type: authActions.LOGIN_START });

      // トークンをAPIクライアントに設定
      setAuthToken(token);

      // ローカルストレージに保存
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: error.message || 'ログインに失敗しました',
      });
      return { success: false, error: error.message };
    }
  };

  // ログアウト関数
  const logout = () => {
    // ローカルストレージから削除
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // APIクライアントからトークンを削除
    setAuthToken(null);

    dispatch({ type: authActions.LOGOUT });
  };

  // エラークリア関数
  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
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