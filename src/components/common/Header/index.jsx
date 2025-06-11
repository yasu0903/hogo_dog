// src/components/common/Header/index.jsx
import styles from './Header.module.css';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../contexts/PermissionContext';
import { HEADER_MESSAGES } from '../../../constants/locales/ja';

const Header = () => {
  const { isAuthenticated, user, currentUser, logout } = useAuth();
  const { systemRole, canAccessSystemAdmin } = usePermissions();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">{HEADER_MESSAGES.TITLE}</Link>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.mainNav}>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? styles.active : undefined}
              end
            >
              {HEADER_MESSAGES.HOME}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/organizations"
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              {HEADER_MESSAGES.ORGANIZATIONS}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/animals"
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              {HEADER_MESSAGES.ANIMALS}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/shelters"
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              {HEADER_MESSAGES.SHELTERS}
            </NavLink>
          </li>
        </ul>
        
        <div className={styles.authSection}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <span className={styles.username}>こんにちは、{user?.name || currentUser?.name}さん</span>
              
              {/* ユーザーマイページリンク */}
              <NavLink 
                to="/mypage"
                className={({ isActive }) => isActive ? styles.active : undefined}
              >
                マイページ
              </NavLink>

              {/* 管理者用ダッシュボードリンク */}
              {(currentUser?.organizationRole === 'admin' || currentUser?.organizationRole === 'superuser') && (
                <NavLink 
                  to="/admin"
                  className={({ isActive }) => isActive ? styles.active : undefined}
                >
                  管理者
                </NavLink>
              )}

              {/* スーパーユーザー用システム管理リンク */}
              {(currentUser?.role === 'superuser' || currentUser?.organizationRole === 'superuser' || 
                systemRole === 'superuser' || systemRole === 'admin' || canAccessSystemAdmin()) && (
                <NavLink 
                  to="/system-admin"
                  className={({ isActive }) => isActive ? styles.active : undefined}
                  style={{
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  🔧 システム管理
                </NavLink>
              )}

              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginButton}>
                ログイン
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;