// src/components/common/Footer/index.jsx
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';
import { COMMON_MESSAGES, FOOTER_MESSAGES } from '../../../constants/locales/ja';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXTwitter,
  faGithub,
} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>🐾 {COMMON_MESSAGES.TITLE}</div>
          <p className={styles.tagline}>{FOOTER_MESSAGES.DESCRIPTION}</p>
        </div>

        <div className={styles.linkSection}>
          <h3>{FOOTER_MESSAGES.CONTENT}</h3>
          <ul>
            <li><Link to="/organizations">{FOOTER_MESSAGES.ORGANIZATIONS}</Link></li>
            <li><Link to="/organizations?view=map">{FOOTER_MESSAGES.MAP}</Link></li>
            <li><Link to="/spots">{FOOTER_MESSAGES.SPOTS}</Link></li>
            <li><Link to="/weather">{FOOTER_MESSAGES.WEATHER}</Link></li>
          </ul>
        </div>

        <div className={styles.linkSection}>
          <h3>{FOOTER_MESSAGES.LEGAL}</h3>
          <ul>
            <li><Link to="/privacy-policy">{FOOTER_MESSAGES.PRIVACY_POLICY}</Link></li>
            <li><Link to="/terms-of-service">{FOOTER_MESSAGES.TERMS_OF_SERVICE}</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomContent}>
          <div>
            <p className={styles.copyright}>&copy; {currentYear} {FOOTER_MESSAGES.COPYRIGHT}</p>
            {/* ODbL の帰属要件（© OpenStreetMap contributors）を満たすための表示 */}
            <p className={styles.attribution}>
              <a
                href={FOOTER_MESSAGES.OSM_COPYRIGHT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {FOOTER_MESSAGES.OSM_ATTRIBUTION}
              </a>
            </p>
          </div>

          {/* SNSリンクを右端に配置 */}
          <div className={styles.social}>
            <a href={FOOTER_MESSAGES.X_URL} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            <FontAwesomeIcon icon={faXTwitter} />
            </a>
            <a href={FOOTER_MESSAGES.GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
