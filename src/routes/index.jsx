// src/routes/index.jsx
// vite-react-ssg 用のルート定義（react-router-dom data routes 互換の配列）。
// 動的ルートには getStaticPaths を付与し、ビルド時に事前レンダリングするパスを列挙する。
// パス一覧は scripts/build_search_index.mjs が生成する src/generated/ssg-routes.json から読む
// （node:fs をクライアントバンドルに持ち込まないよう dynamic import する）。
// 各 element は withSeo() で <RouteSeo/> を前置し、ページのローディングガードに関係なく
// per-page の <head> メタが SSG のHTMLへ焼かれるようにする。
import RouteSeo from '../components/common/RouteSeo';
import Analytics from '../components/common/Analytics';
import {
  organizationDetailLoader,
  organizationLoader,
  spotsPrefectureLoader,
} from '../services/loaders';
import Home from '../pages/Home';
import Organizations from '../pages/Organizations';
import OrganizationDetail from '../pages/OrganizationDetail';
import Organization from '../pages/Organization';
import Guides from '../pages/Guides';
import Guide from '../pages/Guide';
import Spots from '../pages/Spots';
import SpotsPrefecture from '../pages/SpotsPrefecture';
import Weather from '../pages/Weather';
import WeatherPrefecture from '../pages/WeatherPrefecture';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';

// ビルド時（Node）にのみ呼ばれる。生成JSONを読み、対象キーのパス配列を返す。
const ssgRoutes = () => import('../generated/ssg-routes.json').then((m) => m.default);

// ページ要素に RouteSeo（per-page head）と Analytics（ルート遷移の page_view）を前置する
const withSeo = (element) => (
  <>
    <RouteSeo />
    <Analytics />
    {element}
  </>
);

export const routes = [
  {
    path: '/',
    element: withSeo(<Home />),
  },
  {
    path: '/organizations',
    element: withSeo(<Organizations />),
  },
  {
    path: '/organizations/:id',
    element: withSeo(<OrganizationDetail />),
    loader: organizationDetailLoader,
    getStaticPaths: async () => (await ssgRoutes()).organizationsPrefectures,
  },
  {
    path: '/organizations/:prefectureId/:orgId',
    element: withSeo(<Organization />),
    loader: organizationLoader,
    getStaticPaths: async () => (await ssgRoutes()).organizations,
  },
  {
    path: '/guides',
    element: withSeo(<Guides />),
  },
  {
    path: '/guides/:slug',
    element: withSeo(<Guide />),
    getStaticPaths: async () => (await ssgRoutes()).guides,
  },
  {
    path: '/spots',
    element: withSeo(<Spots />),
  },
  {
    path: '/spots/:prefectureId',
    element: withSeo(<SpotsPrefecture />),
    loader: spotsPrefectureLoader,
    getStaticPaths: async () => (await ssgRoutes()).spotsPrefectures,
  },
  {
    path: '/weather',
    element: withSeo(<Weather />),
  },
  {
    path: '/weather/:prefectureId',
    element: withSeo(<WeatherPrefecture />),
    getStaticPaths: async () => (await ssgRoutes()).weatherPrefectures,
  },
  {
    path: '/privacy-policy',
    element: withSeo(<PrivacyPolicy />),
  },
  {
    path: '/terms-of-service',
    element: withSeo(<TermsOfService />),
  },
];

export default routes;
