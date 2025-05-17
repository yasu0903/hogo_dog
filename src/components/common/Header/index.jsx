// src/components/common/Header/index.jsx
import styles from './Header.module.css';
import { Link, NavLink } from 'react-router-dom';
import { HEADER_MESSAGES } from '../../../constants/locales/ja';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">{HEADER_MESSAGES.TITLE}</Link>
      </div>
      <nav className={styles.nav}>
        <ul>
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
        </ul>
      </nav>
    </header>
  );
};

export default Header;