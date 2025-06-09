import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';

// AuthContext のモック
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// テスト用コンポーネント
const TestProtectedComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithRouter = (component, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('認証済みユーザーの場合、保護されたコンテンツを表示する', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' }
    });

    renderWithRouter(
      <ProtectedRoute element={<TestProtectedComponent />} />
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('未認証ユーザーの場合、ログインページにリダイレクトする', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });

    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/protected' }),
      };
    });

    renderWithRouter(
      <ProtectedRoute element={<TestProtectedComponent />} />
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('ローディング中の場合、ローディング表示を行う', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null
    });

    renderWithRouter(
      <ProtectedRoute element={<TestProtectedComponent />} />
    );

    expect(screen.getByText('認証状態を確認中...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('管理者権限が必要な場合、一般ユーザーはアクセスできない', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User', role: 'user' }
    });

    renderWithRouter(
      <ProtectedRoute 
        element={<TestProtectedComponent />} 
        requireAdmin={true} 
      />
    );

    expect(screen.getByText('管理者権限が必要です')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('管理者ユーザーは管理者限定コンテンツにアクセスできる', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Admin User', role: 'admin' }
    });

    renderWithRouter(
      <ProtectedRoute 
        element={<TestProtectedComponent />} 
        requireAdmin={true} 
      />
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});