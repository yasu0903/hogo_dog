// src/components/common/Seo/index.jsx
// vite-react-ssg の <Head> でページ別の title / description / OGP を設定する共通コンポーネント。
// SSG時はビルド出力のHTML <head> に静的に焼かれ、ブラウザでは通常どおり反映される。
import { Head } from 'vite-react-ssg';
import { SITE } from '../../../constants/site';

const Seo = ({ title, description, path = '', type = 'website' }) => {
  const fullTitle = title ? `${title}｜${SITE.NAME}` : SITE.NAME;
  const desc = description || SITE.DEFAULT_DESCRIPTION;
  const url = `${SITE.BASE_URL}${path}`;
  const image = `${SITE.BASE_URL}${SITE.OGP_IMAGE_PATH}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE.NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(SITE.OGP_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(SITE.OGP_IMAGE_HEIGHT)} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={image} />
    </Head>
  );
};

export default Seo;
