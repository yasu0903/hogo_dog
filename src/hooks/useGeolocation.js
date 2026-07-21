// 現在地を取得するフック。navigator.geolocation をクライアントでのみ呼ぶ。
// 取得した座標は state 保持のみで、外部には一切送信しない（端末内で距離計算に使うだけ）。
// 初期表示では要求しない（request() をユーザー操作起点で呼ぶ）。
import { useState, useCallback } from 'react';

// status: 'idle' | 'prompting' | 'granted' | 'denied' | 'unsupported' | 'error'
export function useGeolocation() {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);

  const request = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus('prompting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      (err) => {
        // 1 = PERMISSION_DENIED
        setStatus(err.code === 1 ? 'denied' : 'error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { status, coords, request };
}
