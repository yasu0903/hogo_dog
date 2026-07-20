// src/components/spots/SpotCard/index.jsx
// お出かけスポット1件分のカード。
// OrgCard がベースだが表示項目の差が大きいため共用せず新設している。
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import styles from './SpotCard.module.css';
import { SPOTS_MESSAGES, SPOT_CATEGORY_LABELS } from '../../../constants/locales/ja';

// カテゴリ → バッジ配色クラスの対応（dog_run / cafe / park の3色を確保）
const categoryClassMap = {
  dog_run: 'badgeDogRun',
  cafe: 'badgeCafe',
  park: 'badgePark'
};

const SpotCard = ({ spot }) => {
  // 値のある conditions のみ表示する（vaccination_cert は null = 未確認）
  const conditionRows = [
    spot.conditions?.vaccinationCert != null && {
      label: SPOTS_MESSAGES.CONDITIONS_VACCINATION,
      value: spot.conditions.vaccinationCert
        ? SPOTS_MESSAGES.CONDITIONS_VACCINATION_REQUIRED
        : SPOTS_MESSAGES.CONDITIONS_VACCINATION_NOT_REQUIRED
    },
    spot.conditions?.sizeLimit && {
      label: SPOTS_MESSAGES.CONDITIONS_SIZE_LIMIT,
      value: spot.conditions.sizeLimit
    },
    spot.conditions?.fee && {
      label: SPOTS_MESSAGES.CONDITIONS_FEE,
      value: spot.conditions.fee
    }
  ].filter(Boolean);

  return (
    <div className={styles.card}>
      <h2 className={styles.name}>{spot.name}</h2>

      <div className={styles.badgeRow}>
        <span className={`${styles.badge} ${styles[categoryClassMap[spot.category]] ?? ''}`}>
          {SPOT_CATEGORY_LABELS[spot.category] ?? spot.category}
        </span>
      </div>

      <p className={styles.area}>
        {SPOTS_MESSAGES.LOCATION}: {spot.area}{spot.city ? `・${spot.city}` : ''}
      </p>

      {conditionRows.length > 0 && (
        <dl className={styles.conditions}>
          {conditionRows.map((row) => (
            <div key={row.label} className={styles.conditionRow}>
              <dt className={styles.conditionLabel}>{row.label}</dt>
              <dd className={styles.conditionValue}>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {spot.caution && <p className={styles.caution}>{spot.caution}</p>}

      {spot.note && <p className={styles.note}>{spot.note}</p>}

      {spot.website && (
        <div className={styles.linkRow}>
          <a
            href={spot.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.websiteChip}
          >
            <FontAwesomeIcon icon={faGlobe} />
            <span>{SPOTS_MESSAGES.WEBSITE}</span>
          </a>
        </div>
      )}

      <div className={styles.cardFooter}>
        {spot.lastVerified && (
          <span className={styles.lastVerified}>
            {SPOTS_MESSAGES.LAST_VERIFIED(spot.lastVerified)}
          </span>
        )}
      </div>
    </div>
  );
};

export default SpotCard;
