// src/components/common/JsonLd/index.jsx
// 構造化データ（JSON-LD）を <head> に出力する。vite-react-ssg の Head 経由なので
// SSGのHTMLに静的に焼かれ、検索エンジンのリッチリザルト対象になる。
import { Head } from 'vite-react-ssg';

const JsonLd = ({ data }) => (
  <Head>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Head>
);

export default JsonLd;
