// src/components/common/RouteSeo/index.jsx
// 現在のパスに対応する SEO メタ（title / description / type）を
// src/generated/seo-meta.json（ビルド時生成）から引いて <Head> を出力する。
// 各ルートの element にラップして使うため、ページ側のローディングガードに関係なく
// 常に描画される＝SSGのHTML <head> に per-page meta が必ず焼かれる。
import { useLocation } from 'react-router-dom';
import Seo from '../Seo';
import seoMeta from '../../../generated/seo-meta.json';

const RouteSeo = () => {
  const { pathname } = useLocation();
  // 末尾スラッシュを正規化（/organizations/ → /organizations）
  const key = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const meta = seoMeta[key] ?? {};

  return (
    <Seo title={meta.title} description={meta.description} path={key} type={meta.type} noindex={meta.noindex} />
  );
};

export default RouteSeo;
