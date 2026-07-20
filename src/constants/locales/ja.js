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
    NAV_SPOTS: 'お出かけ'
}

export const FOOTER_MESSAGES = {
    DESCRIPTION: '行政公表情報をもとに、全国の保護犬・保護猫団体を探せるサイトです。',
    CONTENT: 'コンテンツ',
    ORGANIZATIONS: '団体を探す',
    MAP: '地図から探す',
    SPOTS: 'お出かけスポットを探す',
    UPCOMING: '今後追加予定: お散歩お天気（準備中）',
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
    SPOTS_SECTION_TITLE: 'ペットお出かけ情報',
    SPOTS_SECTION_ICON: '🐾',
    SPOTS_SECTION_LINK: 'お出かけスポットを探す',
    UPCOMING_TITLE: '今後追加予定',
    UPCOMING_BADGE: '準備中',
    UPCOMING_ITEMS: [
        {
            ICON: '☀️',
            TITLE: 'お散歩お天気',
        }
    ]
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
    ALL_PREFECTURES: 'すべての都道府県'
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
    VIEW_DETAIL: '詳細を見る →',
    BREADCRUMB_SEARCH: '団体を探す'
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

export const FILTER_MESSAGES = {
    AREA: {
        LABEL: 'エリアで絞り込み',
        ALL_AREA: '全エリア'
    },
    PREFECTURE: {
        LABEL: '都道府県で絞り込む'
    }
}
