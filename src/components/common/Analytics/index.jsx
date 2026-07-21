// Google Analytics 4（gtag.js）のロードと、SSG/SPA のルート遷移ごとの page_view 送信。
// - 測定IDは環境変数 VITE_GA_MEASUREMENT_ID（例: G-XXXXXXXXXX）から読む。
//   未設定なら完全に no-op（ローカル開発・プレビューでは解析を送らない）。
// - SSR/ビルド時は window が無いため何もしない。HTMLにタグは焼かず、クライアントのみで動く。
// - gtag スクリプトの挿入はモジュールスコープのフラグで1回だけ。以降はルート遷移のたびに
//   page_view を手動送信する（send_page_view:false で自動送信を止め、二重計上を防ぐ）。
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let injected = false;

function ensureGtag() {
  if (injected || !GA_ID || typeof window === 'undefined') return;
  injected = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  // SPA なので自動 page_view は止め、ルート遷移で自前送信する。
  gtag('config', GA_ID, { send_page_view: false });
}

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID) return;
    ensureGtag();
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
};

export default Analytics;
