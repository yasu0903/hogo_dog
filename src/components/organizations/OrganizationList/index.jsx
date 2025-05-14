// src/components/organizations/OrganizationList/index.jsx
import styles from './OrganizationList.module.css';
import OrganizationCard from '../OrganizationCard';

const OrganizationList = ({ organizations }) => {
  // 追加: organizations が undefined または null の場合の対処
  if (!organizations) {
    return <p className={styles.noResults}>データが読み込まれていません</p>;
  }

  // 追加: 配列であることを確認
  if (!Array.isArray(organizations)) {
    console.error('organizations は配列ではありません:', organizations);
    return <p className={styles.noResults}>データの形式が正しくありません</p>;
  }

  if (organizations.length === 0) {
    return <p className={styles.noResults}>該当する団体が見つかりません</p>;
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