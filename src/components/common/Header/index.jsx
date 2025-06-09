// src/components/common/Header/index.jsx
import styles from './Header.module.css';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { HEADER_MESSAGES } from '../../../constants/locales/ja';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

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
              <span className={styles.username}>こんにちは、{user?.name}さん</span>
              <NavLink 
                to="/dashboard"
                className={({ isActive }) => isActive ? styles.active : undefined}
              >
                ダッシュボード
              </NavLink>
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