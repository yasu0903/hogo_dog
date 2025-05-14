// src/pages/Home/index.jsx
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>団体検索サイトへようこそ</h1>
        <p className={styles.description}>
          全国の団体情報を簡単に検索できます。
        </p>
        <Link to="/organizations" className={styles.button}>
          団体一覧を見る
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
