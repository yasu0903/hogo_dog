// src/components/common/Header/index.jsx
import styles from './Header.module.css';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">団体検索サイト</Link>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li><Link to="/">ホーム</Link></li>
          <li><Link to="/organizations">団体一覧</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
