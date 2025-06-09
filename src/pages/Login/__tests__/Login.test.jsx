import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../index';
import { useAuth } from '../../../contexts/AuthContext';

// モック
vi.mock('../../../contexts/AuthContext');
vi.mock('../../../components/common/Header', () => ({
  default: () => <header data-testid="header">Header</header>
}));
vi.mock('../../../components/common/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}));

const renderWithRouter = (component, initialEntries = ['/login']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('Login Component', () => {
  const mockLoginWithGoogle = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth.mockReturnValue({
      loginWithGoogle: mockLoginWithGoogle,
      error: null,
      isLoading: false
    });
  });

  it('ログインページが正しく表示される', () => {
    renderWithRouter(<Login />);

    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByText('Googleアカウントでログインしてください')).toBeInTheDocument();
    expect(screen.getByText('Googleでログイン')).toBeInTheDocument();
  });

  it('プライバシー保護に関するメッセージが表示される', () => {
    renderWithRouter(<Login />);

    expect(screen.getByText(/個人情報保護のため/)).toBeInTheDocument();
    expect(screen.getByText(/メールアドレスと名前のみが使用され/)).toBeInTheDocument();
  });

  it('Googleログインボタンをクリックすると認証処理が開始される', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValue({ success: true });

    renderWithRouter(<Login />);

    const googleButton = screen.getByText('Googleでログイン');
    await user.click(googleButton);

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('認証エラー時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Google認証に失敗しました';
    mockLoginWithGoogle.mockResolvedValue({ 
      success: false, 
      error: errorMessage 
    });

    renderWithRouter(<Login />);

    const googleButton = screen.getByText('Googleでログイン');
    await user.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('AuthContextからのエラーが表示される', () => {
    useAuth.mockReturnValue({
      loginWithGoogle: mockLoginWithGoogle,
      error: 'Context Error',
      isLoading: false
    });

    renderWithRouter(<Login />);

    expect(screen.getByText('Context Error')).toBeInTheDocument();
  });

  it('ローディング中はボタンが無効化される', () => {
    useAuth.mockReturnValue({
      loginWithGoogle: mockLoginWithGoogle,
      error: null,
      isLoading: true
    });

    renderWithRouter(<Login />);

    const googleButton = screen.getByText('ログイン中...');
    expect(googleButton).toBeDisabled();
  });

  it('例外発生時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockRejectedValue(new Error('Network Error'));

    renderWithRouter(<Login />);

    const googleButton = screen.getByText('Googleでログイン');
    await user.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Google認証中にエラーが発生しました')).toBeInTheDocument();
    });
  });

  it('ホームに戻るリンクが正しく表示される', () => {
    renderWithRouter(<Login />);

    const homeLink = screen.getByText('ホームに戻る');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('Googleアイコンが正しく表示される', () => {
    renderWithRouter(<Login />);

    const googleButton = screen.getByText('Googleでログイン');
    const svg = googleButton.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('エラーアイコンが正しく表示される', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValue({ 
      success: false, 
      error: 'Test Error' 
    });

    renderWithRouter(<Login />);

    const googleButton = screen.getByText('Googleでログイン');
    await user.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });
});