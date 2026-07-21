// お気に入り団体を localStorage に永続化するフック。
// useSyncExternalStore でモジュール単一ストアを購読するため、複数コンポーネント
// （各カードのハート・お気に入りページ）が同じ状態を共有し、トグルが即時に反映される。
//
// SSR/hydration 安全策:
//   - getServerSnapshot は常に空配列（サーバHTML=未登録）を返す。
//   - クライアントの初回レンダーも同じく空 → hydration mismatch を出さない。
//   - マウント後（subscribe＝effect フェーズ）に localStorage を読み込み、
//     変化があれば購読者へ通知して再レンダーで反映する。
import { useSyncExternalStore } from 'react';

const KEY = 'wnet:favorites';
const EMPTY = [];

let snapshot = EMPTY; // 現在のスナップショット（参照が安定するよう変更時のみ差し替える）
let hydrated = false;
const listeners = new Set();

const emit = () => listeners.forEach((l) => l());

function readStorage() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function subscribe(listener) {
  listeners.add(listener);

  // 最初の購読時にだけ localStorage から初期値を読み込む（マウント後なので mismatch なし）。
  if (!hydrated) {
    hydrated = true;
    const loaded = readStorage();
    if (loaded.length) {
      snapshot = loaded;
      emit();
    }
  }

  // 別タブでの変更を反映する。
  const onStorage = (e) => {
    if (e.key === KEY) {
      const loaded = readStorage();
      snapshot = loaded.length ? loaded : EMPTY;
      emit();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

function setFavorites(next) {
  snapshot = next.length ? next : EMPTY;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage 不可（プライベートモード等）でもアプリは動かす。
  }
  emit();
}

export const favoriteKey = (prefectureId, orgId) => `${prefectureId}/${orgId}`;

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = (prefectureId, orgId) =>
    favorites.includes(favoriteKey(prefectureId, orgId));

  const toggle = (prefectureId, orgId) => {
    const key = favoriteKey(prefectureId, orgId);
    setFavorites(
      snapshot.includes(key) ? snapshot.filter((k) => k !== key) : [...snapshot, key]
    );
  };

  const remove = (key) => setFavorites(snapshot.filter((k) => k !== key));

  return { favorites, isFavorite, toggle, remove, count: favorites.length };
}
