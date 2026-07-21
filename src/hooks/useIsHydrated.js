import { useEffect, useState } from 'react';

// SSG/SSR 済みHTMLとクライアント初回レンダーを一致させるためのフラグ。
// 「現在時刻に依存する表示」（例: 鮮度バッジ）や localStorage 依存の表示は、
// SSRで焼いたHTMLと hydrate 直後が食い違うと hydration mismatch 警告になる。
// マウント後にだけ true を返すことで、初回は必ずサーバHTMLと一致させ、
// 時刻・ブラウザ依存の表示はマウント後の再レンダーで反映する。
export const useIsHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
};
