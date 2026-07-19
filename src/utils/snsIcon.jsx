// SNSタイプ文字列からFont Awesomeアイコンとタイプキーを解決する共通ユーティリティ
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXTwitter,
  faFacebookF,
  faInstagram,
  faYoutube,
  faLine,
  faTiktok
} from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faLink } from '@fortawesome/free-solid-svg-icons';

// SNSタイプに応じたFont Awesomeアイコンとタイプキー（CSSクラス解決用）を取得する
export const getSnsIcon = (type) => {
  const lowerType = (type || '').toLowerCase();

  if (lowerType.includes('twitter') || lowerType.includes('x')) {
    return { icon: <FontAwesomeIcon icon={faXTwitter} />, typeKey: 'twitter' };
  } else if (lowerType.includes('facebook') || lowerType.includes('fb')) {
    return { icon: <FontAwesomeIcon icon={faFacebookF} />, typeKey: 'facebook' };
  } else if (lowerType.includes('instagram') || lowerType.includes('insta')) {
    return { icon: <FontAwesomeIcon icon={faInstagram} />, typeKey: 'instagram' };
  } else if (lowerType.includes('youtube') || lowerType.includes('yt')) {
    return { icon: <FontAwesomeIcon icon={faYoutube} />, typeKey: 'youtube' };
  } else if (lowerType.includes('line')) {
    return { icon: <FontAwesomeIcon icon={faLine} />, typeKey: 'line' };
  } else if (lowerType.includes('website') || lowerType.includes('site') || lowerType.includes('web') || lowerType.includes('blog')) {
    return { icon: <FontAwesomeIcon icon={faGlobe} />, typeKey: 'website' };
  } else if (lowerType.includes('tiktok')) {
    return { icon: <FontAwesomeIcon icon={faTiktok} />, typeKey: 'tiktok' };
  } else {
    return { icon: <FontAwesomeIcon icon={faLink} />, typeKey: 'other' };
  }
};
