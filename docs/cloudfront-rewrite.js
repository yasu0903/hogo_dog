// CloudFront Function (event type: viewer-request)
//
// 目的: SSG(vite-react-ssg)が出力する「フラットな .html」を、きれいなURLで配信する。
//   出力ファイル例:
//     /                       -> dist/index.html
//     /organizations          -> dist/organizations.html
//     /organizations/08       -> dist/organizations/08.html
//     /organizations/08/1     -> dist/organizations/08/1.html
//
// 適用手順:
//   1) CloudFront コンソール → Functions → Create function（ランタイム cloudfront-js-2.0）
//   2) このコードを貼り付けて Publish
//   3) 対象ディストリビューションの Default (*) behavior に
//      「Viewer request」関数として関連付け
//   4) 既存のSPAフォールバック（403/404 → /index.html の Custom Error Response）があれば削除
//
// 注意: 拡張子付きのパス（/assets/app.js, *.css, /data/*.json, /weather/*.json,
//       /sitemap.xml, /robots.txt, /favicon.ico 等）はそのまま素通しする。

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // ルートは index.html へ
  if (uri === '/') {
    request.uri = '/index.html';
    return request;
  }

  // 末尾スラッシュを除去（/organizations/ -> /organizations）
  if (uri.length > 1 && uri.endsWith('/')) {
    uri = uri.slice(0, -1);
  }

  // 最後のパスセグメントに「.」が無ければ拡張子なし = ページ扱い → .html を付与
  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = uri + '.html';
  } else {
    request.uri = uri;
  }

  return request;
}
