// src/utils/orgSeo.js
// 団体ページの SEO title / description を組み立てる純関数。
// アプリ（ページ）とビルド時の seo-meta 生成（scripts/build_search_index.mjs）の
// 両方から import して、文言の単一ソースにする。JSX やブラウザAPIは使わない。

// 県別団体一覧ページ（/organizations/:id）
export const orgListSeoTitle = (prefectureName) => `${prefectureName}の保護犬団体`;

export const orgListSeoDescription = (prefectureName, count) =>
  `${prefectureName}で活動する保護犬・保護猫団体${count}件の一覧。行政公表情報に基づき掲載しています。`;

// 団体単体ページ（/organizations/:prefectureId/:orgId）
export const orgSeoTitle = (org) => org.name;

export const orgSeoDescription = (org, prefectureName) => {
  const parts = [];
  const species = [];
  if (org.species?.includes('dog')) species.push('犬');
  if (org.species?.includes('cat')) species.push('猫');
  parts.push(
    `${prefectureName}で活動する${species.length ? `保護${species.join('・')}` : '動物保護'}団体「${org.name}」の情報。`
  );
  parts.push(`活動地域: ${org.area}${org.city ? `・${org.city}` : ''}。`);
  if (org.sourceType === 'official' || org.source_type === 'official') {
    parts.push('行政公表の登録団体一覧に掲載されています。');
  }
  return parts.join('');
};
