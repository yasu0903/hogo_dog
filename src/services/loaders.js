// src/services/loaders.js
// vite-react-ssg / react-router のルート loader。
// ビルド時(SSG)は api.js が fs で public/ を読むため、本文までHTMLに焼ける。
// クライアント遷移時は通常の fetch 経由。ページは useLoaderData() で同期的にデータを受け取る。
import {
  fetchOrganizationDetail,
  fetchPrefectureById,
  fetchSourceById,
  fetchSpotsByPrefecture,
} from './api';

// fetchPrefectureById はエラー時に [] を返すことがあるので null に正規化する
const normalizePrefecture = (pref) => (pref && !Array.isArray(pref) ? pref : null);

export async function organizationDetailLoader({ params }) {
  const { id } = params;
  const [organizations, prefecture, source] = await Promise.all([
    fetchOrganizationDetail(id),
    fetchPrefectureById(id),
    fetchSourceById(id),
  ]);
  return { organizations, prefecture: normalizePrefecture(prefecture), source };
}

export async function organizationLoader({ params }) {
  const { prefectureId, orgId } = params;
  const [orgs, prefecture, source] = await Promise.all([
    fetchOrganizationDetail(prefectureId),
    fetchPrefectureById(prefectureId),
    fetchSourceById(prefectureId),
  ]);
  const organization = orgs.find((o) => String(o.id) === orgId) ?? null;
  return { organization, prefecture: normalizePrefecture(prefecture), source };
}

export async function spotsPrefectureLoader({ params }) {
  const { prefectureId } = params;
  const [spots, prefecture] = await Promise.all([
    fetchSpotsByPrefecture(prefectureId),
    fetchPrefectureById(prefectureId),
  ]);
  return { spots, prefecture: normalizePrefecture(prefecture) };
}
