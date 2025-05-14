// src/components/organizations/OrganizationCard/index.jsx
import { Link } from 'react-router-dom';
import styles from './OrganizationCard.module.css';

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
              公式情報
            </a>
          </p>
        )}
        {organization.organizationCount && (
          <p>登録団体数: {organization.organizationCount}</p>
        )}
      </div>
      
      <div className={styles.cardFooter}>
        <Link to={`/organizations/${organization.id}`} className={styles.link}>
          詳細を見る
        </Link>
      </div>
    </div>
  );
};

export default OrganizationCard;