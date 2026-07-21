// src/pages/Organization/index.jsx
// 団体単体ページ（/organizations/:prefectureId/:orgId）。
// 構造化済みの全情報を表示する。SEO/OGP はルート側の RouteSeo が seo-meta から設定する。
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { fetchOrganizationDetail, fetchPrefectureById, fetchSourceById } from '../../services/api';
import { ORGANIZATION_DETAIL_MESSAGES, COMMON_MESSAGES } from '../../constants/locales/ja';
import { getSnsIcon } from '../../utils/snsIcon';
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
  const { prefectureId, orgId } = useParams();
  const [organization, setOrganization] = useState(null);
  const [prefecture, setPrefecture] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgsData, prefData, sourceData] = await Promise.all([
          fetchOrganizationDetail(prefectureId),
          fetchPrefectureById(prefectureId),
          fetchSourceById(prefectureId)
        ]);
        setOrganization(orgsData.find(org => String(org.id) === orgId) ?? null);
        setPrefecture(prefData);
        setSource(sourceData);
      } catch (error) {
        console.error('Error loading organization:', error);
        setError(ORGANIZATION_DETAIL_MESSAGES.ERROR_FOR_ORGANIZAION_LOADING);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [prefectureId, orgId]);

  if (loading) {
    return <div className={styles.loading}>{COMMON_MESSAGES.LOADING}</div>;
  }

  if (error || !organization) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1>{error ? COMMON_MESSAGES.ERROR : ORGANIZATION_DETAIL_MESSAGES.ORGANIZAION_NOT_FOUND}</h1>
          {error && <p>{error}</p>}
          <Link to="/organizations">{ORGANIZATION_DETAIL_MESSAGES.BACK_TO_ORGANIZATION_LIST}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const prefectureName = prefecture?.name ?? '';
  const org = organization;

  return (
    <div className={styles.container}>
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
