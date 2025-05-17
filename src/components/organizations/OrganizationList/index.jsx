// src/components/organizations/OrganizationList/index.jsx
import styles from './OrganizationList.module.css';
import OrganizationCard from '../OrganizationCard';
import { ORGANIZAIONS_MESSAGES } from '../../../constants/locales/ja';

const OrganizationList = ({ organizations }) => {
  // 追加: organizations が undefined または null の場合の対処
  if (!organizations) {
    return <p className={styles.noResults}>{ORGANIZAIONS_MESSAGES.ERROR_FOR_DATA_LOADING}</p>;
  }

  // 追加: 配列であることを確認
  if (!Array.isArray(organizations)) {
    console.error('organizations は配列ではありません:', organizations);
    return <p className={styles.noResults}>{ORGANIZAIONS_MESSAGES.ERROR_FOR_VALIDATION}</p>;
  }

  if (organizations.length === 0) {
    return <p className={styles.noResults}>{ORGANIZAIONS_MESSAGES.ERROR_FOR_NO_RESULTS}</p>;
  }

  return (
    <div className={styles.list}>
      {organizations.map((org) => (
        <OrganizationCard key={org.id} organization={org} />
      ))}
    </div>
  );
};

export default OrganizationList;