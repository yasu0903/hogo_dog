// src/components/common/Header/index.jsx
import styles from './Header.module.css';
import { Link } from 'react-router-dom';
import { HEADER_MESSAGES } from '../../../constants/locales/ja';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">{HEADER_MESSAGES.TITLE}</Link>
        <span className={styles.tagline}>{HEADER_MESSAGES.TAGLINE}</span>
      </div>
      <nav className={styles.nav}>
        <Link to="/organizations" className={styles.navLink}>{HEADER_MESSAGES.NAV_ORGANIZATIONS}</Link>
        <Link to="/guides" className={styles.navLink}>{HEADER_MESSAGES.NAV_GUIDES}</Link>
        <Link to="/spots" className={styles.navLink}>{HEADER_MESSAGES.NAV_SPOTS}</Link>
        <Link to="/weather" className={styles.navLink}>{HEADER_MESSAGES.NAV_WEATHER}</Link>
        <Link to="/favorites" className={styles.navLink}>{HEADER_MESSAGES.NAV_FAVORITES}</Link>
      </nav>
    </header>
  );
};

export default Header;
