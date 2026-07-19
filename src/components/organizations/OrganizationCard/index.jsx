// src/components/organizations/OrganizationCard/index.jsx
import { Link } from 'react-router-dom';
import styles from './OrganizationCard.module.css';
import { ORGANIZATION_CARD_MESSAGES } from '../../../constants/locales/ja';

const OrganizationCard = ({ organization }) => {
  const listedCount = organization.listedCount ?? organization.organizationCount;

  return (
    <Link to={`/organizations/${organization.id}`} className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{organization.prefecture}</h3>
      </div>

      <div className={styles.description}>
        {listedCount != null && (
          <p className={styles.count}>
            {ORGANIZATION_CARD_MESSAGES.NUMBER_OF_REGISTERED_ORGANIZATION} {listedCount}
          </p>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.link}>
          {ORGANIZATION_CARD_MESSAGES.LINK_TO_ORGANIZAION_DETAIL} →
        </span>
      </div>
    </Link>
  );
};

export default OrganizationCard;
