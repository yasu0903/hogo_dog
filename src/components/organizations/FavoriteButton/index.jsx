// 団体をお気に入り登録/解除するハートボタン。OrgCard と団体単体ページで共用する。
// 未登録=♡ / 登録済=♥。初回レンダーは常に未登録表示（SSR一致）で、マウント後に反映される。
import { useFavorites } from '../../../hooks/useFavorites';
import { ORGANIZATION_DETAIL_MESSAGES } from '../../../constants/locales/ja';
import styles from './FavoriteButton.module.css';

const FavoriteButton = ({ prefectureId, orgId, name }) => {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(prefectureId, orgId);
  const label = active
    ? ORGANIZATION_DETAIL_MESSAGES.FAVORITE_REMOVE(name)
    : ORGANIZATION_DETAIL_MESSAGES.FAVORITE_ADD(name);

  return (
    <button
      type="button"
      className={`${styles.button} ${active ? styles.active : ''}`}
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => toggle(prefectureId, orgId)}
    >
      <span className={styles.heart} aria-hidden="true">{active ? '♥' : '♡'}</span>
    </button>
  );
};

export default FavoriteButton;
