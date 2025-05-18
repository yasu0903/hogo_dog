// src/components/organizations/OrganizationCard/index.jsx
import { Link } from 'react-router-dom';
import styles from './OrganizationCard.module.css';
import { ORGANIZAION_CARD_MESSAGES } from '../../../constants/locales/ja';

const OrganizationCard = ({ organization }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{organization.name}</h3>
        <span className={styles.prefecture}>{organization.prefecture}</span>
      </div>
      
      <div className={styles.description}>
        {organization.sourceUrl && (
          <p>
            <a href={organization.sourceUrl} target="_blank" rel="noopener noreferrer">
              {ORGANIZAION_CARD_MESSAGES.SOURCE}
            </a>
          </p>
        )}
        {organization.organizationCount && (
          <p>{ORGANIZAION_CARD_MESSAGES.NUMBER_OF_REGISTERED_ORGANIZATION} {organization.organizationCount}</p>
        )}
      </div>
      
      <div className={styles.cardFooter}>
        <Link to={`/organizations/${organization.id}`} className={styles.link}>
          {ORGANIZAION_CARD_MESSAGES.LINK_TO_ORGANIZAION_DETAIL}
        </Link>
      </div>
    </div>
  );
};

export default OrganizationCard;