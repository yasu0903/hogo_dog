export const COMMON_MESSAGES = {
    TITLE: 'わんだーネット',
    LOADING: '読み込み中...',
    ERROR: 'エラーが発生しました',
    ERROR_WHILE_LOADING: 'データの読み込み中にエラーが発生しました',
    FAILED_LOADING_DATA: 'データの読み込みに失敗しました',
    EMPTY_RESULTS: '該当する結果がありません'
}

export const HEADER_MESSAGES = {
    TITLE: 'わんだーネット',
    TAGLINE: '保護犬・保護猫団体の全国検索',
    NAV_ORGANIZATIONS: '団体を探す',
    NAV_GUIDES: 'はじめての里親',
    NAV_SPOTS: 'お出かけスポット',
    NAV_WEATHER: 'おさんぽ予報',
    NAV_FAVORITES: '♥ お気に入り',
    MENU_OPEN: 'メニューを開く',
    MENU_CLOSE: 'メニューを閉じる'
}

export const GUIDES_MESSAGES = {
    TITLE: 'はじめての里親ガイド',
    DESCRIPTION: '保護犬の里親になるまでの流れ、よくある譲渡条件、里親募集の注意点など、はじめて保護犬を迎える方に向けたガイド記事をまとめています。',
    LIST_HEADING: 'はじめての里親ガイド',
    LIST_LEAD: '保護犬を迎えるときに知っておきたいことをまとめました。気になる記事から読んでみてください。',
    BREADCRUMB_HOME: 'ホーム',
    BREADCRUMB_GUIDES: '里親ガイド',
    FAQ_HEADING: 'よくある質問',
    UPDATED: (date) => `最終更新日: ${date}`,
    READ_MORE: '記事を読む →',
    RELATED_HEADING: '関連する記事',
    CTA_HEADING: '保護犬を探してみる',
    CTA_TEXT: '準備ができたら、お住まいの地域の保護団体を探してみましょう。',
    CTA_LINK: '都道府県から団体を探す →',
    NOT_FOUND: '記事が見つかりません',
    BACK_TO_GUIDES: '里親ガイド一覧へ戻る'
}

export const FOOTER_MESSAGES = {
    DESCRIPTION: '行政公表情報をもとに、全国の保護犬・保護猫団体を探せるサイトです。',
    CONTENT: 'コンテンツ',
    ORGANIZATIONS: '団体を探す',
    MAP: '地図から探す',
    SPOTS: 'お出かけスポットを探す',
    WEATHER: 'おさんぽ予報を見る',
    OSM_ATTRIBUTION: '地図・スポットデータ © OpenStreetMap contributors (ODbL)',
    OSM_COPYRIGHT_URL: 'https://www.openstreetmap.org/copyright',
    COPYRIGHT: 'わんだーネット All Rights Reserved.',
    LEGAL: '法的情報',
    PRIVACY_POLICY: 'プライバシーポリシー',
    TERMS_OF_SERVICE: '利用規約',
    X_URL: 'https://x.com/yasuch',
    GITHUB_URL: 'https://github.com/yasu0903',
}

export const HOME_MESSAGES = {
    WELCOME: 'あなたの街の保護犬・保護猫団体を探そう',
    STATS: (prefectureCount, organizationCount) =>
        `掲載 ${prefectureCount}都道府県 / ${organizationCount}団体`,
    HERO_SELECT_LABEL: '都道府県から探す',
    HERO_SELECT_PLACEHOLDER: '都道府県を選択',
    HERO_MAP_LINK: '🗾 地図から探す',
    HERO_ALL_LINK: '全国から探す',
    UPCOMING_TITLE: '今後追加予定',
    UPCOMING_BADGE: '準備中',
    // 予告する機能ができたらここに追加（空配列のときは帯を表示しない）
    UPCOMING_ITEMS: []
}

export const ORGANIZATIONS_MESSAGES = {
    TITLE: '全国の団体から探す',
    DESCRIPTION: '全国の保護犬・保護猫団体を団体名・エリア・都道府県・犬猫の別で横断検索できます。',
    ERROR_FOR_DATA_LOADING: 'データが読み込まれていません',
    ERROR_FOR_VALIDATION: 'データの形式が正しくありません',
    ERROR_FOR_NO_RESULTS: '該当する団体が見つかりません',
    SEARCH_PLACEHOLDER: '団体名・市区町村で検索',
    VIEW_LIST: 'リスト',
    VIEW_MAP: '地図',
    VIEW_TOGGLE_LABEL: '表示切替',
    CLEAR_FILTERS: '条件をクリア',
    RESULT_COUNT: (total, from, to) => `全${total}件中 ${from}-${to}件を表示`,
    ALL_PREFECTURES: 'すべての都道府県',
    ALL_CITIES: 'すべての市区町村',
    SORT_LABEL: '並び順',
    SORT_DEFAULT: '標準',
    SORT_NEAREST: '📍 近い順',
    GEO_HINT: '現在地から近い順に並べ替えます（位置情報は端末内でのみ使い、外部に送信しません）',
    GEO_PROMPTING: '現在地を取得中…',
    GEO_DENIED: '位置情報が許可されませんでした。ブラウザの設定で許可すると近い順に並べ替えられます。',
    GEO_UNSUPPORTED: 'お使いのブラウザは位置情報に対応していません。',
    GEO_ERROR: '現在地を取得できませんでした。時間をおいて再度お試しください。'
}

export const JAPAN_MAP_MESSAGES = {
    ARIA_LABEL: '都道府県別の掲載団体数マップ',
    HINT: '都道府県をクリックすると、その県の団体一覧へ移動します',
    COUNT_UNIT: '団体',
    LEGEND_FEW: '少',
    LEGEND_MANY: '多',
    LEGEND_ZERO: '掲載なし'
}

export const ORGANIZATION_CARD_MESSAGES = {
    NUMBER_OF_REGISTERED_ORGANIZATION: '掲載団体数:',
    LINK_TO_ORGANIZAION_DETAIL: '詳細を見る',
}

export const ORGANIZATION_DETAIL_MESSAGES = {
    ERROR_FOR_ORGANIZAION_LOADING: '団体情報の読み込みに失敗しました',
    ERROR_FOR_PREFECTURE_LOADING: '都道府県情報の読み込みに失敗しました',
    NEXT: '次へ',
    BACK: '前へ',
    BACK_TO_ORGANIZATION_LIST: '団体検索へ戻る',
    ORGANIZAION_NOT_FOUND: '団体が見つかりません',
    AREA: 'エリア',
    ACTIVITY_AREA: '活動地域',
    WEBSITE: '公式サイト',
    SNS: 'SNS',
    SOURCE: '情報ソース',
    SOURCE_OFFICIAL: (prefecture, asOf) =>
        `この一覧は${prefecture}公表の登録団体一覧${asOf ? `（${asOf}時点）` : ''}に基づいています。`,
    SOURCE_INDEPENDENT: (prefecture) =>
        `${prefecture}による登録団体一覧の公表がないため、独自調査に基づき掲載しています。`,
    SOURCE_LINK: '出典を見る',
    BADGE_DOG: '🐕 犬',
    BADGE_CAT: '🐈 猫',
    BADGE_OFFICIAL: '✅ 行政公表',
    BADGE_CAUTION: '⚠️ 注意事項あり',
    BREADCRUMB_HOME: 'ホーム',
    BREADCRUMB_ORGANIZATIONS: '団体一覧',
    SEARCH_PLACEHOLDER: '団体名で検索',
    SPECIES_FILTER_LABEL: '扱う動物',
    SPECIES_ALL: 'すべて',
    SPECIES_DOG: '🐕 犬',
    SPECIES_CAT: '🐈 猫',
    NO_MATCHING_ORGANIZATIONS: '条件に一致する団体がありません',
    LINK_BROKEN: '⚠️ サイトのリンク切れを確認',
    LAST_VERIFIED: (date) => `最終確認日: ${date}`,
    BADGE_STALE: '🕒 情報が古い可能性',
    VIEW_DETAIL: '詳細を見る →',
    BREADCRUMB_SEARCH: '団体を探す',
    FAVORITE_ADD: (name) => `${name}をお気に入りに追加`,
    FAVORITE_REMOVE: (name) => `${name}をお気に入りから削除`,
    GUIDE_INLINE_TEXT: 'はじめて保護犬を迎える方へ',
    GUIDE_INLINE_LINK: '里親になるまでの流れを読む →',
    DISTANCE: (km) => `📍 約${km}km`,
    DISTANCE_NEAR: '📍 すぐ近く',
    DISTANCE_APPROX: '📍 おおよその位置'
}

export const FAVORITES_MESSAGES = {
    TITLE: 'お気に入りの団体',
    HEADING: 'お気に入りの団体',
    LEAD: '気になる団体をお気に入り登録して見比べられます（この端末のブラウザに保存されます）。',
    EMPTY: 'まだお気に入りに登録した団体はありません。',
    EMPTY_LINK: '団体を探しにいく →',
    LOADING: '読み込み中…',
    BREADCRUMB_HOME: 'ホーム',
    BREADCRUMB_FAVORITES: 'お気に入り',
    COUNT: (n) => `${n}件のお気に入り`
}

export const SPOTS_MESSAGES = {
    TITLE: '犬とお出かけスポット検索',
    DESCRIPTION: '全国のドッグランなど、犬とお出かけできるスポットを名称・エリア・都道府県・カテゴリで横断検索できます。',
    SEARCH_PLACEHOLDER: 'スポット名・市区町村で検索',
    CATEGORY_LABEL: 'カテゴリ',
    CATEGORY_ALL: 'すべて',
    CATEGORY_DOG_RUN: '🐕 ドッグラン',
    CATEGORY_CAFE: '☕ カフェ',
    CATEGORY_PARK: '🌳 公園',
    RESULT_COUNT: (total, from, to) => `全${total}件中 ${from}-${to}件を表示`,
    ERROR_FOR_NO_RESULTS: '該当するスポットが見つかりません',
    CLEAR_FILTERS: '条件をクリア',
    LOCATION: '所在地',
    WEBSITE: 'ウェブサイト',
    CONDITIONS_FEE: '料金',
    CONDITIONS_SIZE_LIMIT: '体格制限',
    CONDITIONS_VACCINATION: 'ワクチン証明',
    CONDITIONS_VACCINATION_REQUIRED: '必要',
    CONDITIONS_VACCINATION_NOT_REQUIRED: '不要',
    LAST_VERIFIED: (date) => `最終確認日: ${date}`,
    LINK_BROKEN: '⚠️ サイトのリンク切れを確認',
    VIEW_LIST: 'リスト',
    VIEW_MAP: '地図',
    VIEW_TOGGLE_LABEL: '表示切替',
    MAP_ARIA_LABEL: '都道府県別の掲載スポット数マップ',
    MAP_HINT: '都道府県をクリックすると、その県のスポット一覧へ移動します',
    MAP_COUNT_UNIT: '件',
    OSM_ATTRIBUTION: 'スポットデータは OpenStreetMap をもとに掲載しています。最新の営業状況・利用条件は公式情報をご確認ください。'
}

export const SPOTS_PREFECTURE_MESSAGES = {
    TITLE: (prefectureName, count) => `${prefectureName}の犬とお出かけスポット（${count}件）`,
    SEO_TITLE: (prefectureName) => `${prefectureName}の犬とお出かけスポット`,
    SEO_DESCRIPTION: (prefectureName, count) =>
        `${prefectureName}のドッグラン・公園など、犬とお出かけできるスポット${count}件の一覧。`,
    SPOTS_NOT_FOUND: 'スポットが見つかりません',
    NO_MATCHING_SPOTS: '条件に一致するスポットがありません',
    BACK_TO_SPOTS: 'スポット検索へ戻る',
    BREADCRUMB_HOME: 'ホーム',
    BREADCRUMB_SEARCH: 'お出かけスポット'
}

// カテゴリ値 → 表示ラベル（CategoryFilter と SpotCard で共用）
export const SPOT_CATEGORY_LABELS = {
    dog_run: SPOTS_MESSAGES.CATEGORY_DOG_RUN,
    cafe: SPOTS_MESSAGES.CATEGORY_CAFE,
    park: SPOTS_MESSAGES.CATEGORY_PARK
}

// 日付文字列 "2026-07-21" → "2026年7月21日"（お天気ページ用）
const formatWeatherDate = (dateStr) => {
    if (!dateStr) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!m) return dateStr;
    return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
};

export const WEATHER_MESSAGES = {
    TITLE: 'おさんぽ予報',
    DESCRIPTION: '全国47都道府県の当日のお天気から、犬の散歩に◎な時間帯・雨の時間帯・路面が熱くて避けたい時間帯がひと目で分かります。',
    HEADING: '全国のおさんぽ予報',
    DATE_LABEL: (dateStr) => `${formatWeatherDate(dateStr)}のお天気`,
    UNAVAILABLE_TITLE: 'お天気データは準備中です',
    UNAVAILABLE_BODY: '当日のお天気データがまだ生成されていません。しばらくたってから再度お試しください。',
    AREA_ALL: '全エリア',
    MAX_TEMP: '最高',
    MIN_TEMP: '最低',
    PRECIP_PROB: '降水確率',
    PAVEMENT_BADGE: '⚠️ 路面高温注意',
    SUMMARY_UNIT_TEMP: '℃',
    SUMMARY_UNIT_PCT: '%',
    VIEW_DETAIL: '詳しく見る →',
    VIEW_LIST: 'リスト',
    VIEW_MAP: '地図',
    VIEW_TOGGLE_LABEL: '表示切替',
    SOURCE: (source) => `天気データ提供: ${source || 'Open-Meteo'}`
}

// 最高気温マップ（WeatherMap）用のラベル
export const WEATHER_MAP_MESSAGES = {
    ARIA_LABEL: '都道府県別の当日の最高気温マップ',
    HINT: '都道府県をクリックすると、その県の詳しいお天気へ移動します',
    TEMP: (temp) => `${temp}℃`,
    NO_DATA: 'データなし',
    LEGEND_COOL: '涼',
    LEGEND_HOT: '暑'
}

export const WEATHER_PREFECTURE_MESSAGES = {
    SEO_TITLE: (prefectureName) => `${prefectureName}のおさんぽ予報`,
    SEO_DESCRIPTION: (prefectureName) =>
        `${prefectureName}の当日のお天気と、犬の散歩に◎な時間帯・雨の時間帯・路面高温に注意すべき時間帯。`,
    TITLE: (prefectureName) => `${prefectureName}のおさんぽ予報`,
    DATE_LOCATION: (dateStr, point) =>
        `${formatWeatherDate(dateStr)}${point ? `・${point}周辺` : ''}`,
    UNAVAILABLE_TITLE: 'お天気データが見つかりません',
    UNAVAILABLE_BODY: 'この都道府県の当日のお天気データがまだ生成されていないか、取得できませんでした。',
    BACK_TO_WEATHER: 'おさんぽ予報へ戻る',
    BREADCRUMB_HOME: 'ホーム',
    BREADCRUMB_WEATHER: 'おさんぽ予報',
    SUMMARY_TITLE: '今日の天気',
    MAX_TEMP: '最高気温',
    MIN_TEMP: '最低気温',
    PRECIP_PROB: '最大降水確率',
    WALK_TITLE: '🐕 お散歩◎の時間帯',
    WALK_EMPTY: '今日は快適に散歩できる時間帯が少なめです。気温や天候をこまめに確認してください。',
    RAIN_TITLE: '☔ 雨の時間帯',
    RAIN_EMPTY: '今日はまとまった雨の予報はありません。',
    RAIN_PROB: (prob) => `降水確率 最大${prob}%`,
    AVOID_TITLE: '⚠️ 注意したい時間帯',
    AVOID_EMPTY: '大きな注意ポイントはありません。',
    AVOID_TYPE: {
        heat: '🔥 高温・路面熱',
        cold: '❄️ 冷え込み',
        wind: '💨 強風'
    },
    PAVEMENT_TITLE: '🐾 路面の高温に注意',
    PAVEMENT_BODY: (from, until, reason) =>
        `${from}〜${until}頃は${reason || '路面が熱く肉球やけどの恐れ'}があります。この時間帯の散歩は控えめに。`,
    HOURLY_TITLE: '⏰ 1時間ごとの予報',
    HOURLY_TIME: '時刻',
    HOURLY_WEATHER: '天気',
    HOURLY_TEMP: '気温',
    HOURLY_FEELS: '体感',
    HOURLY_HUMIDITY: '湿度',
    HOURLY_PRECIP: '降水確率',
    HOURLY_WIND: '風速',
    UNIT_TEMP: '℃',
    UNIT_PCT: '%',
    UNIT_WIND: 'm/s',
    CHART_ARIA: '1時間ごとの気温の折れ線と、降水確率の棒・湿度の折れ線（時系列）',
    CHART_TEMP_AXIS: '気温(℃)',
    CHART_PRECIP_AXIS: '降水確率・湿度(%)',
    CHART_TABLE_TOGGLE: '数値を表で見る',
    SOURCE: (source) => `天気データ提供: ${source || 'Open-Meteo'}`
}

export const FILTER_MESSAGES = {
    AREA: {
        LABEL: 'エリアで絞り込み',
        ALL_AREA: '全エリア'
    },
    PREFECTURE: {
        LABEL: '都道府県で絞り込む'
    },
    CITY: {
        LABEL: '市区町村で絞り込む'
    }
}
