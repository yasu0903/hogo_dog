// src/pages/Guides/index.jsx
// 里親ガイドの一覧ページ（/guides）。SEO/OGP はルート側の RouteSeo が seo-meta から設定する。
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import JsonLd from '../../components/common/JsonLd';
import { GUIDES } from '../../content/guides/guides';
import { GUIDES_MESSAGES } from '../../constants/locales/ja';
import { SITE } from '../../constants/site';
import styles from './Guides.module.css';

const Guides = () => {
  // パンくず構造化データ
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: GUIDES_MESSAGES.BREADCRUMB_HOME, item: `${SITE.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: GUIDES_MESSAGES.BREADCRUMB_GUIDES, item: `${SITE.BASE_URL}/guides` },
    ],
  };

  return (
    <div className={styles.container}>
      <JsonLd data={breadcrumbLd} />
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          <Link to="/">{GUIDES_MESSAGES.BREADCRUMB_HOME}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span>{GUIDES_MESSAGES.BREADCRUMB_GUIDES}</span>
        </nav>

        <h1 className={styles.title}>{GUIDES_MESSAGES.LIST_HEADING}</h1>
        <p className={styles.lead}>{GUIDES_MESSAGES.LIST_LEAD}</p>

        <ul className={styles.cardList}>
          {GUIDES.map((guide) => (
            <li key={guide.slug} className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Link to={`/guides/${guide.slug}`} className={styles.cardLink}>{guide.title}</Link>
              </h2>
              <p className={styles.cardDesc}>{guide.description}</p>
              <Link to={`/guides/${guide.slug}`} className={styles.readMore}>
                {GUIDES_MESSAGES.READ_MORE}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default Guides;
