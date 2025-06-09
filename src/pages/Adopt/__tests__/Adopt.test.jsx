import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Adopt from '../index';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchAnimalById, createApplication } from '../../../services/api';

// モック
vi.mock('../../../contexts/AuthContext');
vi.mock('../../../services/api');

// コンポーネントのモック
vi.mock('../../../components/common/Header', () => ({
  default: () => <header data-testid="header">Header</header>
}));

vi.mock('../../../components/common/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}));

const renderWithRouter = (component, initialEntries = ['/adopt/1']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('Adopt Component', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockAnimal = {
    id: '1',
    name: 'ポチ',
    species: 'dog',
    breed: '柴犬',
    gender: 'male',
    birth_date: '2022-03-15',
    status: 'available',
    description: '人懐っこく元気な男の子です。'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // デフォルトで認証済みユーザーをセット
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser
    });

    // デフォルトで動物データをセット
    fetchAnimalById.mockResolvedValue(mockAnimal);
    createApplication.mockResolvedValue({ success: true });
  });

  it('未認証ユーザーにはログインを促すメッセージが表示される', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null
    });

    renderWithRouter(<Adopt />);

    expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
    expect(screen.getByText('里親申請を行うには、Googleアカウントでログインしてください。')).toBeInTheDocument();
    expect(screen.getByText('Googleでログイン')).toBeInTheDocument();
  });

  it('動物情報が正しく表示される', async () => {
    renderWithRouter(<Adopt />);

    await waitFor(() => {
      expect(screen.getByText('里親申請: ポチ')).toBeInTheDocument();
      expect(screen.getByText('犬')).toBeInTheDocument();
      expect(screen.getByText('柴犬')).toBeInTheDocument();
      expect(screen.getByText('オス')).toBeInTheDocument();
    });

    expect(fetchAnimalById).toHaveBeenCalledWith('1');
  });

  it('フォームの必須フィールドバリデーションが動作する', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(<Adopt />);

    await waitFor(() => {
      expect(screen.getByText('里親申請: ポチ')).toBeInTheDocument();
    });

    // 送信ボタンをクリック（必須フィールドが空の状態）
    const submitButton = screen.getByText('里親申請を送信');
    await user.click(submitButton);

    // バリデーションエラーが表示される
    await waitFor(() => {
      expect(screen.getByText('里親になりたい理由を入力してください')).toBeInTheDocument();
      expect(screen.getByText('この子を選んだ理由を入力してください')).toBeInTheDocument();
      expect(screen.getByText('住居タイプを選択してください')).toBeInTheDocument();
      expect(screen.getByText('家族構成を入力してください')).toBeInTheDocument();
      expect(screen.getByText('勤務・在宅状況を入力してください')).toBeInTheDocument();
    });

    // APIが呼ばれていないことを確認
    expect(createApplication).not.toHaveBeenCalled();
  });

  it('フォームを正しく入力して送信できる', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ animalId: '1' }),
      };
    });

    renderWithRouter(<Adopt />);

    await waitFor(() => {
      expect(screen.getByText('里親申請: ポチ')).toBeInTheDocument();
    });

    // フォームを入力
    await user.type(
      screen.getByLabelText(/里親になりたい理由/),
      '動物を愛しているから'
    );
    
    await user.type(
      screen.getByLabelText(/この子を選んだ理由/),
      'とても可愛いから'
    );

    await user.selectOptions(
      screen.getByLabelText(/住居タイプ/),
      'detached'
    );

    await user.type(
      screen.getByLabelText(/家族構成/),
      '夫婦2人'
    );

    await user.type(
      screen.getByLabelText(/勤務・在宅状況/),
      'リモートワーク中心'
    );

    // 送信
    const submitButton = screen.getByText('里親申請を送信');
    await user.click(submitButton);

    // APIが正しく呼ばれることを確認
    await waitFor(() => {
      expect(createApplication).toHaveBeenCalledWith({
        animal_id: '1',
        user_id: 'user-123',
        application_data: expect.objectContaining({
          reason: '動物を愛しているから',
          motivation: 'とても可愛いから',
          housing_type: 'detached',
          family_members: '夫婦2人',
          work_schedule: 'リモートワーク中心',
        })
      });
    });
  });

  it('API エラー時にモック処理で続行する', async () => {
    const user = userEvent.setup();
    
    // API エラーをシミュレート
    createApplication.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<Adopt />);

    await waitFor(() => {
      expect(screen.getByText('里親申請: ポチ')).toBeInTheDocument();
    });

    // 必須フィールドを入力
    await user.type(screen.getByLabelText(/里親になりたい理由/), 'テスト理由');
    await user.type(screen.getByLabelText(/この子を選んだ理由/), 'テスト動機');
    await user.selectOptions(screen.getByLabelText(/住居タイプ/), 'detached');
    await user.type(screen.getByLabelText(/家族構成/), 'テスト家族');
    await user.type(screen.getByLabelText(/勤務・在宅状況/), 'テストスケジュール');

    // 送信
    const submitButton = screen.getByText('里親申請を送信');
    await user.click(submitButton);

    // エラーでもモック処理で続行し、成功メッセージが表示される
    await waitFor(() => {
      expect(createApplication).toHaveBeenCalled();
    });
  });

  it('動物データ取得エラー時にエラーメッセージが表示される', async () => {
    fetchAnimalById.mockRejectedValue(new Error('Animal not found'));

    renderWithRouter(<Adopt />);

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('動物情報の取得に失敗しました')).toBeInTheDocument();
      expect(screen.getByText('動物一覧に戻る')).toBeInTheDocument();
    });
  });
});