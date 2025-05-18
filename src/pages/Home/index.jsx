// src/pages/Home/index.jsx
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import styles from './Home.module.css';
import { HOME_MESSAGES } from '../../constants/locales/ja';

const Home = () => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{HOME_MESSAGES.WELCOME}</h1>
        <p className={styles.description}>
          {HOME_MESSAGES.DESCRIPTION1}
           <br></br>
          {HOME_MESSAGES.DESCRIPTION2}
        </p>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>{HOME_MESSAGES.FEATURES[0].FEATURE}</h3>
            <p>{HOME_MESSAGES.FEATURES[0].DESCRIPTION}</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📋</div>
            <h3>{HOME_MESSAGES.FEATURES[1].FEATURE}</h3>
            <p>{HOME_MESSAGES.FEATURES[1].DESCRIPTION}</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🌐</div>
            <h3>{HOME_MESSAGES.FEATURES[2].FEATURE}</h3>
            <p>{HOME_MESSAGES.FEATURES[1].DESCRIPTION}</p>
          </div>
        </div>
        
        <Link to="/organizations" className={styles.button}>
          {HOME_MESSAGES.LINK_TO_ORGANIZATIONS}
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
