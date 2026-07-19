// src/components/common/Seo/index.jsx
// react-helmet-async でページ別の title / description / OGP を設定する共通コンポーネント
import { Helmet } from 'react-helmet-async';
import { SITE } from '../../../constants/site';

const Seo = ({ title, description, path = '', type = 'website' }) => {
  const fullTitle = title ? `${title}｜${SITE.NAME}` : SITE.NAME;
  const desc = description || SITE.DEFAULT_DESCRIPTION;
  const url = `${SITE.BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE.NAME} />
      <meta name="twitter:card" content="summary" />
    </Helmet>
  );
};

export default Seo;
