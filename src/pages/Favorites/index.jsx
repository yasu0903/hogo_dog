// src/pages/Favorites/index.jsx
// お気に入り登録した団体の一覧（/favorites）。localStorage 由来のためCSRで描画し、
// SEO対象外（seo-meta で noindex、sitemap 非掲載）。
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import OrgCard from '../../components/organizations/OrgCard';
import { useFavorites, favoriteKey } from '../../hooks/useFavorites';
import { fetchSearchIndex } from '../../services/api';
import { FAVORITES_MESSAGES } from '../../constants/locales/ja';
import styles from './Favorites.module.css';

const Favorites = () => {
  const { favorites, count } = useFavorites();
  // 全団体インデックスはクライアントで取得（SSR時は null → ローディング表示で hydrate 一致）
  const [allOrgs, setAllOrgs] = useState(null);

  useEffect(() => {
    let active = true;
    fetchSearchIndex().then((orgs) => {
      if (active) setAllOrgs(orgs);
    });
    return () => {
      active = false;
    };
  }, []);

  // お気に入り登録順を保ちつつ、インデックスから団体データを引く
  const items = allOrgs
    ? favorites
        .map((key) => allOrgs.find((o) => favoriteKey(o.prefectureId, o.id) === key))
        .filter(Boolean)
    : [];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          <Link to="/">{FAVORITES_MESSAGES.BREADCRUMB_HOME}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span>{FAVORITES_MESSAGES.BREADCRUMB_FAVORITES}</span>
        </nav>

        <h1 className={styles.title}>{FAVORITES_MESSAGES.HEADING}</h1>
        <p className={styles.lead}>{FAVORITES_MESSAGES.LEAD}</p>

        {allOrgs === null ? (
          <p className={styles.status}>{FAVORITES_MESSAGES.LOADING}</p>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <p>{FAVORITES_MESSAGES.EMPTY}</p>
            <Link to="/organizations" className={styles.emptyLink}>
              {FAVORITES_MESSAGES.EMPTY_LINK}
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.count}>{FAVORITES_MESSAGES.COUNT(count)}</p>
            <div className={styles.list}>
              {items.map((org) => (
                <OrgCard
                  key={`${org.prefectureId}-${org.id}`}
                  org={org}
                  detailPath={`/organizations/${org.prefectureId}/${org.id}`}
                  prefectureId={org.prefectureId}
                  showPrefecture
                />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
