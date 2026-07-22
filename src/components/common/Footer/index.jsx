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
      {/* コンテンツリンクはヘッダーnavと重複するため置かない（リーガルのみ） */}
      <div className={styles.content}>
        <div className={styles.logo}>🐾 {COMMON_MESSAGES.TITLE}</div>

        <div className={styles.links}>
          <Link to="/privacy-policy">{FOOTER_MESSAGES.PRIVACY_POLICY}</Link>
          <Link to="/terms-of-service">{FOOTER_MESSAGES.TERMS_OF_SERVICE}</Link>
        </div>

        <div className={styles.social}>
          <a href={FOOTER_MESSAGES.X_URL} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
          <a href={FOOTER_MESSAGES.GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </div>

      <div className={styles.meta}>
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
    </footer>
  );
};

export default Footer;
