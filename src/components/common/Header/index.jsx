// src/components/common/Header/index.jsx
import styles from './Header.module.css';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">団体検索サイト</Link>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? styles.active : undefined}
              end
            >
              ホーム
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/organizations"
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              団体一覧
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;