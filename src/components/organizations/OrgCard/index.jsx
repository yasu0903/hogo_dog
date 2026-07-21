// src/components/organizations/OrgCard/index.jsx
// 団体1件分のカード。全国横断検索ページと県別ページで共用する。
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import styles from './OrgCard.module.css';
import { ORGANIZATION_DETAIL_MESSAGES } from '../../../constants/locales/ja';
import { getSnsIcon } from '../../../utils/snsIcon';
import { isStale } from '../../../utils/freshness';
import { useIsHydrated } from '../../../hooks/useIsHydrated';
import FavoriteButton from '../FavoriteButton';

// typeKey → CSSクラスの対応
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

// 距離チップの表示文言（geoLevel が pref なら精度をぼかす）
const distanceLabel = (distanceKm, geoLevel) => {
  if (distanceKm == null) return null;
  if (geoLevel === 'pref') return ORGANIZATION_DETAIL_MESSAGES.DISTANCE_APPROX;
  if (distanceKm < 1) return ORGANIZATION_DETAIL_MESSAGES.DISTANCE_NEAR;
  return ORGANIZATION_DETAIL_MESSAGES.DISTANCE(Math.round(distanceKm));
};

const OrgCard = ({ org, detailPath, showPrefecture = false, prefectureId, distanceKm, geoLevel }) => {
  // 鮮度バッジは現在時刻依存 → hydration mismatch を避けるためマウント後のみ表示。
  const hydrated = useIsHydrated();
  const stale = hydrated && !org.linkBroken && isStale(org.lastVerified);
  const distance = distanceLabel(distanceKm, geoLevel);

  return (
    <div className={styles.card}>
      <div className={styles.nameRow}>
        <h2 className={styles.name}>
          {detailPath ? <Link to={detailPath} className={styles.nameLink}>{org.name}</Link> : org.name}
        </h2>
        {prefectureId != null && (
          <FavoriteButton prefectureId={prefectureId} orgId={org.id} name={org.name} />
        )}
      </div>

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
        {distance && (
          <span className={`${styles.badge} ${styles.badgeDistance}`}>{distance}</span>
        )}
      </div>

      <p className={styles.area}>
        {ORGANIZATION_DETAIL_MESSAGES.ACTIVITY_AREA}:{' '}
        {showPrefecture && org.prefectureName ? `${org.prefectureName} / ` : ''}
        {org.area}{org.city ? `・${org.city}` : ''}
      </p>

      <div className={styles.linkRow}>
        {org.website && !org.linkBroken && (
          <a
            href={org.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.websiteChip}
          >
            <FontAwesomeIcon icon={faGlobe} />
            <span>{ORGANIZATION_DETAIL_MESSAGES.WEBSITE}</span>
          </a>
        )}
        {org.linkBroken && (
          <span className={styles.linkBroken}>{ORGANIZATION_DETAIL_MESSAGES.LINK_BROKEN}</span>
        )}

        {org.sns && org.sns.map((snsItem, index) => {
          const { icon, typeKey } = getSnsIcon(snsItem.type);
          return (
            <a
              key={index}
              href={snsItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.snsChip} ${styles[snsClassMap[typeKey]]}`}
              title={snsItem.name}
              aria-label={snsItem.name}
            >
              {icon}
            </a>
          );
        })}
      </div>

      {org.caution && <p className={styles.caution}>{org.caution}</p>}

      {org.note && <p className={styles.note}>{org.note}</p>}

      <div className={styles.cardFooter}>
        {org.lastVerified && (
          <span className={styles.lastVerified}>
            {ORGANIZATION_DETAIL_MESSAGES.LAST_VERIFIED(org.lastVerified)}
          </span>
        )}
        {detailPath && (
          <Link to={detailPath} className={styles.detailLink}>
            {ORGANIZATION_DETAIL_MESSAGES.VIEW_DETAIL}
          </Link>
        )}
      </div>
    </div>
  );
};

export default OrgCard;
