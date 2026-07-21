// src/pages/Organization/index.jsx
// 団体単体ページ（/organizations/:prefectureId/:orgId）。
// 構造化済みの全情報を表示する。SEO/OGP はルート側の RouteSeo が seo-meta から設定する。
import { useParams, useLoaderData, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import JsonLd from '../../components/common/JsonLd';
import { ORGANIZATION_DETAIL_MESSAGES } from '../../constants/locales/ja';
import { SITE } from '../../constants/site';
import { getSnsIcon } from '../../utils/snsIcon';
import { isStale } from '../../utils/freshness';
import { useIsHydrated } from '../../hooks/useIsHydrated';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faLink } from '@fortawesome/free-solid-svg-icons';
import styles from './Organization.module.css';

const snsClassMap = {
  twitter: 'snsIconTwitter',
  facebook: 'snsIconFacebook',
  instagram: 'snsIconInstagram',
  youtube: 'snsIconYoutube',
  line: 'snsIconLine',
  website: 'snsIconWebsite',
  tiktok: 'snsIconTiktok',
  other: 'snsIconOther'
};

const Organization = () => {
  const { prefectureId } = useParams();
  // データは loader（services/loaders.js の organizationLoader）が供給する。
  const { organization, prefecture, source } = useLoaderData();
  // 鮮度バッジは現在時刻依存 → hydration mismatch を避けるためマウント後のみ表示。
  const hydrated = useIsHydrated();

  if (!organization) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1>{ORGANIZATION_DETAIL_MESSAGES.ORGANIZAION_NOT_FOUND}</h1>
          <Link to="/organizations">{ORGANIZATION_DETAIL_MESSAGES.BACK_TO_ORGANIZATION_LIST}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const prefectureName = prefecture?.name ?? '';
  const org = organization;
  const stale = hydrated && !org.linkBroken && isStale(org.lastVerified);

  // 構造化データ（団体 + パンくず）
  const sameAs = [org.website, ...(org.sns?.map((s) => s.url) ?? [])].filter(Boolean);
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: `${SITE.BASE_URL}/organizations/${prefectureId}/${org.id}`,
    ...(sameAs.length ? { sameAs } : {}),
    ...(org.website ? { mainEntityOfPage: org.website } : {}),
    areaServed: [prefectureName, org.area, org.city].filter(Boolean).join('・'),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_HOME, item: `${SITE.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_SEARCH, item: `${SITE.BASE_URL}/organizations` },
      { '@type': 'ListItem', position: 3, name: prefectureName, item: `${SITE.BASE_URL}/organizations/${prefectureId}` },
      { '@type': 'ListItem', position: 4, name: org.name, item: `${SITE.BASE_URL}/organizations/${prefectureId}/${org.id}` },
    ],
  };

  return (
    <div className={styles.container}>
      <JsonLd data={orgLd} />
      <JsonLd data={breadcrumbLd} />
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          <Link to="/">{ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_HOME}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link to="/organizations">{ORGANIZATION_DETAIL_MESSAGES.BREADCRUMB_SEARCH}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link to={`/organizations/${prefectureId}`}>{prefectureName}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span>{org.name}</span>
        </nav>

        <h1 className={styles.title}>{org.name}</h1>

        <div className={styles.badgeRow}>
          {org.species?.includes('dog') && (
            <span className={`${styles.badge} ${styles.badgeDog}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_DOG}</span>
          )}
          {org.species?.includes('cat') && (
            <span className={`${styles.badge} ${styles.badgeCat}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_CAT}</span>
          )}
          {org.sourceType === 'official' && (
            <span className={`${styles.badge} ${styles.badgeOfficial}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_OFFICIAL}</span>
          )}
          {org.caution && (
            <span className={`${styles.badge} ${styles.badgeCaution}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_CAUTION}</span>
          )}
          {stale && (
            <span className={`${styles.badge} ${styles.badgeStale}`}>{ORGANIZATION_DETAIL_MESSAGES.BADGE_STALE}</span>
          )}
        </div>

        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt>{ORGANIZATION_DETAIL_MESSAGES.ACTIVITY_AREA}</dt>
            <dd>{prefectureName} / {org.area}{org.city ? `・${org.city}` : ''}</dd>
          </div>

          <div className={styles.infoRow}>
            <dt>{ORGANIZATION_DETAIL_MESSAGES.WEBSITE}</dt>
            <dd>
              {org.linkBroken ? (
                <span className={styles.linkBroken}>{ORGANIZATION_DETAIL_MESSAGES.LINK_BROKEN}</span>
              ) : org.website ? (
                <a href={org.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                  <FontAwesomeIcon icon={faGlobe} /> {org.website}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>

          {org.sns && org.sns.length > 0 && (
            <div className={styles.infoRow}>
              <dt>{ORGANIZATION_DETAIL_MESSAGES.SNS}</dt>
              <dd>
                <div className={styles.snsList}>
                  {org.sns.map((snsItem, index) => {
                    const { icon, typeKey } = getSnsIcon(snsItem.type);
                    return (
                      <a
                        key={index}
                        href={snsItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.snsLink} ${styles[snsClassMap[typeKey]]}`}
                      >
                        {icon}
                        <span>{snsItem.name}</span>
                      </a>
                    );
                  })}
                </div>
              </dd>
            </div>
          )}

          <div className={styles.infoRow}>
            <dt>{ORGANIZATION_DETAIL_MESSAGES.SOURCE}</dt>
            <dd>
              {source?.isOfficial
                ? ORGANIZATION_DETAIL_MESSAGES.SOURCE_OFFICIAL(prefectureName, source.asOf)
                : ORGANIZATION_DETAIL_MESSAGES.SOURCE_INDEPENDENT(prefectureName)}
              {source?.sourceUrl && (
                <>
                  {' '}
                  <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                    <FontAwesomeIcon icon={faLink} /> {ORGANIZATION_DETAIL_MESSAGES.SOURCE_LINK}
                  </a>
                </>
              )}
            </dd>
          </div>
        </dl>

        {org.caution && <p className={styles.caution}>{org.caution}</p>}

        {org.note && <p className={styles.note}>{org.note}</p>}

        {org.lastVerified && (
          <p className={styles.lastVerified}>
            {ORGANIZATION_DETAIL_MESSAGES.LAST_VERIFIED(org.lastVerified)}
          </p>
        )}

        <div className={styles.backLink}>
          <Link to={`/organizations/${prefectureId}`}>
            {`${prefectureName}の団体一覧へ戻る`}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Organization;
