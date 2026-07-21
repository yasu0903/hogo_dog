// 団体情報の鮮度判定。last_verified が STALE_MONTHS より古ければ true。
import { STALE_MONTHS } from '../constants/freshness';

// lastVerified: "2026-07-19" 形式の日付文字列（api.js の camelCase 済み）。
// now を引数化しておくとテスト・SSGビルド時の基準日固定がしやすい。
export const isStale = (lastVerified, now = new Date()) => {
  if (!lastVerified) return false;
  const verified = new Date(lastVerified);
  if (Number.isNaN(verified.getTime())) return false;
  const threshold = new Date(now);
  threshold.setMonth(threshold.getMonth() - STALE_MONTHS);
  return verified < threshold;
};
