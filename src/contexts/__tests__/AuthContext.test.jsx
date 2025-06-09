import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { getCurrentUser, fetchAuthSession, signInWithRedirect, signOut } from 'aws-amplify/auth';

// テスト用コンポーネント
const TestComponent = () => {
  const { isAuthenticated, user, loginWithGoogle, logout, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      {user && <div data-testid="user-name">{user.name}</div>}
      <button onClick={loginWithGoogle} data-testid="login-button">
        Login with Google
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
};

const renderWithAuthProvider = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('初期状態では未認証状態である', async () => {
    getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
    
    renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });
  });

  it('認証済みユーザーがいる場合、認証状態を表示する', async () => {
    const mockUser = {
      userId: 'user-123',
      username: 'test@example.com'
    };
    const mockSession = {
      tokens: {
        accessToken: {
          toString: () => 'mock-token'
        }
      }
    };

    getCurrentUser.mockResolvedValue(mockUser);
    fetchAuthSession.mockResolvedValue(mockSession);

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
  });

  it('Googleログインが正常に動作する', async () => {
    getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
    signInWithRedirect.mockResolvedValue(undefined);

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    const loginButton = screen.getByTestId('login-button');
    loginButton.click();

    await waitFor(() => {
      expect(signInWithRedirect).toHaveBeenCalledWith({ provider: 'Google' });
    });
  });

  it('ログアウトが正常に動作する', async () => {
    const mockUser = {
      userId: 'user-123',
      username: 'test@example.com'
    };
    const mockSession = {
      tokens: {
        accessToken: {
          toString: () => 'mock-token'
        }
      }
    };

    getCurrentUser.mockResolvedValue(mockUser);
    fetchAuthSession.mockResolvedValue(mockSession);
    signOut.mockResolvedValue(undefined);

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    const logoutButton = screen.getByTestId('logout-button');
    logoutButton.click();

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  it('認証エラー時にローカルストレージをクリアする', async () => {
    localStorage.setItem('auth_token', 'old-token');
    localStorage.setItem('auth_user', JSON.stringify({ name: 'Old User' }));
    
    getCurrentUser.mockRejectedValue(new Error('Authentication failed'));

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });
});