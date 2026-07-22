// src/components/common/Header/index.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import { HEADER_MESSAGES } from '../../../constants/locales/ja';

const NAV_LINKS = [
  { to: '/organizations', label: HEADER_MESSAGES.NAV_ORGANIZATIONS },
  { to: '/guides', label: HEADER_MESSAGES.NAV_GUIDES },
  { to: '/spots', label: HEADER_MESSAGES.NAV_SPOTS },
  { to: '/weather', label: HEADER_MESSAGES.NAV_WEATHER },
  { to: '/favorites', label: HEADER_MESSAGES.NAV_FAVORITES },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // ページ遷移したらモバイルメニューを閉じる
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ドロワー展開中は背面スクロールを止める
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">{HEADER_MESSAGES.TITLE}</Link>
        <span className={styles.tagline}>{HEADER_MESSAGES.TAGLINE}</span>
      </div>

      {/* モバイル: ハンバーガーボタン（PCでは非表示） */}
      <button
        type="button"
        className={styles.menuToggle}
        aria-label={menuOpen ? HEADER_MESSAGES.MENU_CLOSE : HEADER_MESSAGES.MENU_OPEN}
        aria-expanded={menuOpen}
        aria-controls="global-nav"
        onClick={() => setMenuOpen(open => !open)}
      >
        <span className={`${styles.menuIcon} ${menuOpen ? styles.menuIconOpen : ''}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* モバイル: ドロワー背面のオーバーレイ */}
      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        id="global-nav"
        className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
      >
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={styles.navLink}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
