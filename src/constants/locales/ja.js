export const COMMON_MESSAGES = {
    TITLE: 'わんだーネット',
    LOADING: '読み込み中...',
    ERROR: 'エラーが発生しました',
    ERROR_WHILE_LOADING: 'データの読み込み中にエラーが発生しました',
    FAILED_LOADING_DATA: 'データの読み込みに失敗しました',
    EMPTY_RESULTS: '該当する結果がありません'
}

export const HEADER_MESSAGES = {
    HOME: 'ホーム',
    ORGANIZATIONS: '団体を探す',
    TITLE: 'わんだーネット'
}

export const FOOTER_MESSAGES = {
    DESCRIPTION: 'エリア毎の動物愛護団体情報を簡単検索',
    SITEMAP: 'サイトマップ',
    HOME: 'ホーム',
    ORGANIZAIONS: '動物愛護団体一覧',
    COPYRIGHT: 'わんだーネット All Rights Reserved.',
    LEGAL: '法的情報',
    PRIVACY_POLICY: 'プライバシーポリシー',
    TERMS_OF_SERVICE: '利用規約',
    X_URL: 'https://x.com/yasuch',
    INSTAGRAM_URL: 'https://www.instagram.com/yasuyuki.chida/',
    GITHUB_URL: 'https://github.com/yasu0903',
}

export const HOME_MESSAGES = {
    WELCOME: 'わんだーネットへようこそ',
    DESCRIPTION1: '全国の動物愛護団体情報を簡単に検索できます。',
    DESCRIPTION2: '活動内容や連絡先などの詳細情報を確認できます。',
    FEATURES: [
        {
            FEATURE: '簡単検索',
            DESCRIPTION: 'エリアや地域で絞り込み検索ができます',
        },
        {
            FEATURE: '情報充実',
            DESCRIPTION: '各団体の詳細情報やSNSリンクを確認できます',
        },
        {
            FEATURE: '全国対応',
            DESCRIPTION: '日本全国の団体情報を網羅しています',
        }
    ],
    HERO_SELECT_LABEL: 'お住まいの都道府県から探す',
    HERO_SELECT_PLACEHOLDER: '都道府県を選択',
    HERO_MAP_LINK: '🗾 地図から探す',
    LINK_TO_ORGANIZATIONS: '団体を探す'
}

export const ORGANIZATIONS_MESSAGES = {
    TITLE: '団体を探す',
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

export const FILTER_MESSAGES = {
    AREA: {
        LABEL: 'エリアで絞り込み',
        ALL_AREA: '全エリア'
    },
    PREFECTURE: {
        LABEL: '都道府県で絞り込む'
    }
}
