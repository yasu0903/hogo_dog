import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { setAuthToken } from '../../../services/api';
import styles from './UserSwitcher.module.css';

const UserSwitcher = () => {
  const { currentUser, logout: authLogout, setDevUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const mockUsers = [
    { 
      id: 'dev-user-normal', 
      name: '田中太郎', 
      email: 'user@example.com',
      role: 'user',
      description: '一般ユーザー',
      organizationId: null,
      organizationRole: null,
      backendToken: 'dev-token-user'
    },
    { 
      id: 'dev-user-member', 
      name: '佐藤花子', 
      email: 'member@example.com',
      role: 'user',
      description: 'メンバー',
      organizationId: 'dev-org-123',
      organizationRole: 'member',
      backendToken: 'dev-token-member'
    },
    { 
      id: 'dev-user-admin', 
      name: '鈴木次郎', 
      email: 'admin@example.com',
      role: 'user',
      description: '管理者',
      organizationId: 'dev-org-123',
      organizationRole: 'admin',
      backendToken: 'dev-token-admin'
    },
    { 
      id: 'dev-user-superuser', 
      name: '管理太郎', 
      email: 'superuser@example.com',
      role: 'superuser',
      description: 'スーパーユーザー',
      organizationId: 'dev-org-123',
      organizationRole: 'superuser',
      backendToken: 'dev-token-superuser'
    }
  ];

  const switchUser = (user) => {
    // AuthContext の開発用関数を使用
    setDevUser(user);
    
    // バックエンドのトークンも設定
    setAuthToken(user.backendToken);
    
    console.log(`🔧 [DEV] ユーザー切り替え: ${user.name} (${user.description})`);
    console.log(`🔑 [DEV] バックエンドトークン: ${user.backendToken}`);
    console.log(`🏢 [DEV] 組織ID: ${user.organizationId || '組織なし'}`);
    console.log(`👤 [DEV] 組織ロール: ${user.organizationRole || 'ロールなし'}`);
    
    setIsExpanded(false);
  };

  const logout = () => {
    authLogout();
    console.log('🔧 [DEV] ログアウト完了');
  };

  const testApiCall = async () => {
    if (!currentUser?.backendToken) {
      console.log('❌ ユーザーが選択されていません');
      return;
    }

    const tests = [
      {
        name: '動物一覧取得',
        url: '/api/v1/animals',
        method: 'GET',
        expectedForUser: '全ユーザー可能',
        requiresAuth: true
      },
      {
        name: '組織作成',
        url: '/api/v1/organizations',
        method: 'POST',
        body: { name: 'テスト組織', description: 'テスト用' },
        expectedForUser: '管理者以上',
        requiresAuth: true
      },
      {
        name: '動物写真アップロードURL取得',
        url: '/api/v1/animals/test-animal-id/photos/upload-url',
        method: 'POST',
        body: { file_name: 'test.jpg' },
        expectedForUser: 'メンバー以上',
        requiresAuth: true
      },
      {
        name: '組織メンバー一覧',
        url: '/api/v1/user-organizations',
        method: 'GET',
        expectedForUser: 'メンバー以上',
        requiresAuth: true
      }
    ];

    console.log(`🧪 [DEV] ${currentUser?.name} (${currentUser?.description}) でAPI権限テスト開始`);
    console.log(`🔑 [DEV] 使用トークン: ${currentUser.backendToken}`);
    
    for (const test of tests) {
      try {
        const options = {
          method: test.method,
          headers: {
            'Authorization': `Bearer ${currentUser.backendToken}`,
            'Content-Type': 'application/json'
          }
        };

        if (test.body) {
          options.body = JSON.stringify(test.body);
        }

        const response = await fetch(test.url, options);
        
        if (response.ok) {
          console.log(`✅ ${test.name}: 成功 (${response.status}) - 期待: ${test.expectedForUser}`);
        } else {
          const errorText = await response.text();
          console.log(`❌ ${test.name}: 失敗 (${response.status}) - 期待: ${test.expectedForUser}`);
          console.log(`   エラー詳細: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ネットワークエラー - ${error.message}`);
      }
    }

    console.log('🧪 [DEV] API権限テスト完了');
  };

  // 本番環境では表示しない
  if (import.meta.env.VITE_NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={styles.container}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
        title="開発用ユーザー切り替え"
      >
        🔧 {currentUser ? currentUser.name.slice(0, 3) : 'DEV'}
      </button>

      {isExpanded && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h4>🔧 開発用ユーザー切り替え</h4>
            <p>バックエンド権限も含めてテスト可能</p>
          </div>
          
          {currentUser && (
            <div className={styles.currentUser}>
              <div className={styles.label}>現在のユーザー:</div>
              <div className={styles.userInfo}>
                <strong>{currentUser.name}</strong>
                <span>{currentUser.email}</span>
                <span className={styles.role}>
                  {currentUser.organizationRole || currentUser.role}
                </span>
              </div>
            </div>
          )}

          <div className={styles.userList}>
            <div className={styles.label}>ユーザーを選択:</div>
            {mockUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => switchUser(user)}
                className={`${styles.userButton} ${
                  currentUser?.id === user.id ? styles.active : ''
                }`}
              >
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userDesc}>{user.description}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <button onClick={testApiCall} className={styles.testButton}>
              🧪 API テスト
            </button>
            <button onClick={logout} className={styles.logoutButton}>
              🚪 ログアウト
            </button>
          </div>

          <div className={styles.info}>
            <small>
              💡 このツールは開発環境でのみ表示されます<br/>
              バックエンドの権限も含めてテスト可能です
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;