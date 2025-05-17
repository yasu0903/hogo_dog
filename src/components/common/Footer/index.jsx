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
        
        <div className={styles.linksContainer}>
          <div className={styles.linkColumn}>
            <div className={styles.linkSection}>
              <h3>{FOOTER_MESSAGES.SITEMAP}</h3>
              <ul>
                <li><Link to="/">{FOOTER_MESSAGES.HOME}</Link></li>
                <li><Link to="/organizations">{FOOTER_MESSAGES.ORGANIZAIONS}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className={styles.linkColumn}>
            <div className={styles.linkSection}>
              <h3>{FOOTER_MESSAGES.LEGAL}</h3>
              <ul>
                <li><Link to="/privacy-policy">{FOOTER_MESSAGES.PRIVACY_POLICY}</Link></li>
                <li><Link to="/terms-of-service">{FOOTER_MESSAGES.TERMS_OF_SERVICE}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <div className={styles.bottomContent}>
          <p className={styles.copyright}>&copy; {currentYear} {FOOTER_MESSAGES.COPYRIGHT}</p>
          
          {/* SNSリンクを右端に配置 */}
          <div className={styles.social}>
            <a href={FOOTER_MESSAGES.X_URL} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
              X
            </a>
            <a href={FOOTER_MESSAGES.INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;