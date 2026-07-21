// src/main.jsx
// vite-react-ssg のエントリ。ViteReactSSG がビルド時は各ルートを静的HTMLに焼き、
// ブラウザでは同じ routes で自動的に hydrate する。
// head（title / meta / OGP）は Seo コンポーネントの <Head>（vite-react-ssg）が管理する。
import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './index.css';

export const createRoot = ViteReactSSG({ routes });
