import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  fetchPrefectures,
  fetchOrganizations,
  fetchOrganizationDetail,
  fetchAnimals,
  fetchAnimalById,
  createApplication,
  setAuthToken
} from '../api';

// axios のモック
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // axios.create のモック
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.get = vi.fn();
    mockedAxios.post = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Static Data Functions', () => {
    beforeEach(() => {
      // fetch のモック
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('fetchPrefectures が正常に動作する', async () => {
      const mockData = [
        { no: '08', name: '茨城県', english_name: 'ibaraki', area: '関東' },
        { no: '12', name: '千葉県', english_name: 'chiba', area: '関東' }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await fetchPrefectures();

      expect(fetch).toHaveBeenCalledWith('/data/prefecture.json');
      expect(result).toEqual(mockData);
    });

    it('fetchOrganizations が正常に動作する', async () => {
      const mockData = [
        { id: 1, name: 'テスト団体1', area: '関東' },
        { id: 2, name: 'テスト団体2', area: '関東' }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await fetchOrganizations();

      expect(fetch).toHaveBeenCalledWith('/data/source.json');
      expect(result).toEqual(mockData);
    });

    it('fetchOrganizationDetail が正常に動作する', async () => {
      const mockData = {
        organizations: [
          { id: 1, name: 'テスト団体', url: 'https://test.com' }
        ]
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await fetchOrganizationDetail('08');

      expect(fetch).toHaveBeenCalledWith('/data/organizations/ibaraki.json');
      expect(result).toEqual(mockData);
    });

    it('fetch エラー時に適切なエラーを投げる', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      await expect(fetchPrefectures()).rejects.toThrow('データの取得に失敗しました');
    });
  });

  describe('Dynamic API Functions', () => {
    it('fetchAnimals が正常に動作する', async () => {
      const mockData = {
        data: [
          { id: 1, name: 'ポチ', species: 'dog' },
          { id: 2, name: 'ミケ', species: 'cat' }
        ]
      };

      mockedAxios.get.mockResolvedValue(mockData);

      const result = await fetchAnimals();

      expect(mockedAxios.get).toHaveBeenCalledWith('/animals');
      expect(result).toEqual(mockData.data);
    });

    it('fetchAnimalById が正常に動作する', async () => {
      const mockData = {
        data: { id: 1, name: 'ポチ', species: 'dog' }
      };

      mockedAxios.get.mockResolvedValue(mockData);

      const result = await fetchAnimalById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/animals/1');
      expect(result).toEqual(mockData.data);
    });

    it('createApplication が正常に動作する', async () => {
      const mockData = {
        data: { id: 'app-123', status: 'pending' }
      };

      const applicationData = {
        animal_id: '1',
        user_id: 'user-123',
        application_data: {
          reason: 'テスト理由'
        }
      };

      mockedAxios.post.mockResolvedValue(mockData);

      const result = await createApplication(applicationData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/applications', applicationData);
      expect(result).toEqual(mockData.data);
    });

    it('setAuthToken が axios インスタンスにトークンを設定する', () => {
      const token = 'test-token';
      
      setAuthToken(token);

      expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('setAuthToken で null を渡すとトークンが削除される', () => {
      setAuthToken(null);

      expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('API エラー時に適切なエラーを投げる', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(fetchAnimals()).rejects.toThrow();
    });

    it('ネットワークエラー時に適切なエラーを投げる', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(fetchAnimals()).rejects.toThrow('Network Error');
    });
  });

  describe('Error Handling', () => {
    it('axios インスタンスが正しく作成される', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/${import.meta.env.VITE_API_VERSION}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('レスポンスインターセプターがエラーを適切に処理する', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(fetchAnimals()).rejects.toThrow();
    });
  });
});