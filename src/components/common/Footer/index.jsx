// src/components/common/Footer/index.jsx
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} 団体検索サイト</p>
    </footer>
  );
};

export default Footer;
