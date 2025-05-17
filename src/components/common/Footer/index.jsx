// src/components/common/Footer/index.jsx
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';
import { COMMON_MESSAGES, FOOTER_MESSAGES, ORGANIZAIONS_MESSAGES } from '../../../constants/locales/ja';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>{COMMON_MESSAGES.TITLE}</div>
          <p className={styles.tagline}>{FOOTER_MESSAGES.DESCRIPTION}</p>
        </div>
        
        <div className={styles.links}>
          <div className={styles.linkSection}>
            <h3>{FOOTER_MESSAGES.SITEMAP}</h3>
            <ul>
              <li><Link to="/">{FOOTER_MESSAGES.HOME}</Link></li>
              <li><Link to="/organizations">{FOOTER_MESSAGES.ORGANIZAIONS}</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <p className={styles.copyright}>&copy; {currentYear} {FOOTER_MESSAGES.COPYRIGHT}</p>
      </div>
    </footer>
  );
};

export default Footer;