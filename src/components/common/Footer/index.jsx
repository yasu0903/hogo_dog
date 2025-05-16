// src/components/common/Footer/index.jsx
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>団体検索サイト</div>
          <p className={styles.tagline}>エリアごとの団体情報をかんたん検索</p>
        </div>
        
        <div className={styles.links}>
          <div className={styles.linkSection}>
            <h3>サイトマップ</h3>
            <ul>
              <li><Link to="/">ホーム</Link></li>
              <li><Link to="/organizations">団体一覧</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <p className={styles.copyright}>&copy; {currentYear} 団体検索サイト All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;