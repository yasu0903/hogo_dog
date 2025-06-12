import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserById, deleteUser } from '../../services/api';
import styles from './MyPage.module.css';

const MyPage = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isAuthenticated || !currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchUserById(currentUser.id);
        setUserProfile(userData);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('ユーザー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

  const handleDeleteAccount = async () => {
    try {
      const confirmed = confirm('最終確認：本当にアカウントを削除しますか？この操作は取り消すことができません。');
      if (!confirmed) return;

      await deleteUser(currentUser.id);
      
      alert('アカウントが正常に削除されました。ご利用ありがとうございました。');
      setShowDeleteConfirm(false);
      
      logout();
      window.location.href = '/';
      
    } catch (err) {
      console.error('Failed to delete account:', err);
      
      if (err.response?.status === 404) {
        alert('アカウントが見つかりませんでした。');
      } else {
        alert('アカウント削除に失敗しました。管理者にお問い合わせください。');
      }
    }
  };

    loadUserProfile();
  }, [currentUser, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.notAuthenticated}>
          <h2>ログインが必要です</h2>
          <p>マイページを表示するには、ログインしてください。</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>マイページ</h1>
      </div>

      <div className={styles.content}>
        {/* ユーザー基本情報 */}
        <section className={styles.profileSection}>
          <h2>基本情報</h2>
          <div className={styles.profileInfo}>
            <div className={styles.profileItem}>
              <label>お名前:</label>
              <span>{userProfile?.name || currentUser?.name || 'N/A'}</span>
            </div>
            <div className={styles.profileItem}>
              <label>メールアドレス:</label>
              <span>{userProfile?.email || currentUser?.email || 'N/A'}</span>
            </div>
            <div className={styles.profileItem}>
              <label>電話番号:</label>
              <span>{userProfile?.phone || 'N/A'}</span>
            </div>
            <div className={styles.profileItem}>
              <label>住所:</label>
              <div className={styles.address}>
                {userProfile?.address ? (
                  <>
                    <div>〒{userProfile.address.postal_code}</div>
                    <div>{userProfile.address.prefecture} {userProfile.address.city}</div>
                    <div>{userProfile.address.street}</div>
                    {userProfile.address.building && <div>{userProfile.address.building}</div>}
                  </>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 通知設定 */}
        <section className={styles.notificationSection}>
          <h2>通知設定</h2>
          <div className={styles.notificationInfo}>
            {userProfile?.notification_preferences ? (
              <div className={styles.notificationList}>
                <div className={styles.notificationItem}>
                  <label>メール通知:</label>
                  <span>{userProfile.notification_preferences.email_enabled ? '有効' : '無効'}</span>
                </div>
                <div className={styles.notificationItem}>
                  <label>申請提出通知:</label>
                  <span>{userProfile.notification_preferences.application_submitted_enabled ? '有効' : '無効'}</span>
                </div>
                <div className={styles.notificationItem}>
                  <label>申請承認通知:</label>
                  <span>{userProfile.notification_preferences.application_approved_enabled ? '有効' : '無効'}</span>
                </div>
                <div className={styles.notificationItem}>
                  <label>申請却下通知:</label>
                  <span>{userProfile.notification_preferences.application_rejected_enabled ? '有効' : '無効'}</span>
                </div>
              </div>
            ) : (
              <p>通知設定が設定されていません</p>
            )}
          </div>
        </section>

        {/* アクション */}
        <section className={styles.actionsSection}>
          <h2>アカウント管理</h2>
          <div className={styles.actions}>
            <button className={styles.editButton}>
              プロフィールを編集
            </button>
            <button className={styles.notificationButton}>
              通知設定を変更
            </button>
            <button 
              className={styles.deleteButton}
              onClick={() => setShowDeleteConfirm(true)}
            >
              アカウントを削除
            </button>
          </div>
        </section>

        {/* 退会確認ダイアログ */}
        {showDeleteConfirm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>アカウント削除の確認</h3>
              <div className={styles.confirmMessage}>
                <p>アカウントを削除すると、以下のデータが完全に削除されます：</p>
                <ul>
                  <li>プロフィール情報</li>
                  <li>申請履歴</li>
                  <li>通知設定</li>
                  <li>その他のアカウント関連データ</li>
                </ul>
                <p className={styles.warning}>
                  <strong>この操作は取り消すことができません。</strong>
                </p>
                <p>本当にアカウントを削除しますか？</p>
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </button>
                <button 
                  className={styles.confirmDeleteButton}
                  onClick={handleDeleteAccount}
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;