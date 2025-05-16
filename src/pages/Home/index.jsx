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
          全国の団体情報を簡単に検索できます。エリアごとに分類された団体を見つけて、活動内容や連絡先などの詳細情報を確認できます。
        </p>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>簡単検索</h3>
            <p>エリアや地域で絞り込み検索ができます</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📋</div>
            <h3>情報充実</h3>
            <p>各団体の詳細情報やSNSリンクを確認できます</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🌐</div>
            <h3>全国対応</h3>
            <p>日本全国の団体情報を網羅しています</p>
          </div>
        </div>
        
        <Link to="/organizations" className={styles.button}>
          団体一覧を見る
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
