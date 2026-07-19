// src/components/organizations/JapanTileMap/index.jsx
// タイル型の日本地図（静的SVG・外部ライブラリ不要）。
// 県ごとの掲載団体数を単色（青）の濃淡+数字で表示するコロプレスマップ。
import styles from './JapanTileMap.module.css';
import { JAPAN_MAP_MESSAGES } from '../../../constants/locales/ja';

// 都道府県番号 → タイル座標 [x, y]（地理的な位置関係を格子に近似したもの）
const TILE_POSITIONS = {
  '01': [12, 0],                                                    // 北海道
  '02': [12, 1],                                                    // 青森
  '05': [11, 2], '03': [12, 2],                                     // 秋田・岩手
  '06': [11, 3], '04': [12, 3],                                     // 山形・宮城
  '17': [8, 4], '16': [9, 4], '15': [10, 4], '07': [11, 4],         // 石川・富山・新潟・福島
  '18': [8, 5], '20': [9, 5], '10': [10, 5], '09': [11, 5], '08': [12, 5], // 福井・長野・群馬・栃木・茨城
  '32': [3, 6], '31': [4, 6], '28': [5, 6], '26': [6, 6], '25': [7, 6],
  '21': [8, 6], '19': [9, 6], '11': [10, 6], '13': [11, 6], '12': [12, 6], // 島根〜千葉
  '35': [2, 7], '34': [3, 7], '33': [4, 7], '27': [6, 7], '29': [7, 7],
  '24': [8, 7], '23': [9, 7], '22': [10, 7], '14': [11, 7],         // 山口〜神奈川
  '41': [0, 8], '40': [1, 8], '44': [2, 8], '38': [3, 8], '37': [4, 8],
  '36': [5, 8], '30': [6, 8],                                       // 佐賀〜和歌山
  '42': [0, 9], '43': [1, 9], '45': [2, 9], '39': [4, 9],           // 長崎・熊本・宮崎・高知
  '46': [1, 10],                                                    // 鹿児島
  '47': [0, 11],                                                    // 沖縄
};

// 単色（青）のシーケンシャルランプ（薄い→濃い = 少ない→多い）
const FILL_STEPS = ['#cde2fb', '#86b6ef', '#3987e5', '#1c5cab', '#0d366b'];
// 濃い塗り（後半2段階）の上では白文字、それ以外は濃紺文字
const INK_ON_LIGHT = '#0b2545';
const INK_ON_DARK = '#ffffff';
const FILL_ZERO = '#f0efec';
const INK_ZERO = '#898781';

const CELL = 60;
const SIZE = 56;
const COLS = 13;
const ROWS = 12;

// 「東京都」→「東京」のように末尾の都・府・県だけ落とす（北海道はそのまま）
const shortName = (name) => name.replace(/[都府県]$/, '');

const binIndex = (count, max) => {
  if (max <= 0) return 0;
  return Math.min(FILL_STEPS.length - 1, Math.ceil((count / max) * FILL_STEPS.length) - 1);
};

const JapanTileMap = ({ prefectures, counts, onSelect }) => {
  const max = Math.max(0, ...Object.values(counts));

  return (
    <div className={styles.mapContainer}>
      <p className={styles.mapHint}>{JAPAN_MAP_MESSAGES.HINT}</p>
      <svg
        className={styles.mapSvg}
        viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
        role="img"
        aria-label={JAPAN_MAP_MESSAGES.ARIA_LABEL}
      >
        {prefectures.map((pref) => {
          const pos = TILE_POSITIONS[pref.id];
          if (!pos) return null;
          const [col, row] = pos;
          const x = col * CELL + (CELL - SIZE) / 2;
          const y = row * CELL + (CELL - SIZE) / 2;
          const count = counts[pref.id] ?? 0;
          const clickable = count > 0;
          const bin = binIndex(count, max);
          const fill = clickable ? FILL_STEPS[bin] : FILL_ZERO;
          const ink = clickable ? (bin >= 3 ? INK_ON_DARK : INK_ON_LIGHT) : INK_ZERO;

          const tile = (
            <>
              <title>{`${pref.name}: ${count}${JAPAN_MAP_MESSAGES.COUNT_UNIT}`}</title>
              <rect
                x={x}
                y={y}
                width={SIZE}
                height={SIZE}
                rx={8}
                fill={fill}
                className={clickable ? styles.tileRect : undefined}
              />
              <text
                x={x + SIZE / 2}
                y={y + SIZE / 2 - 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={ink}
              >
                {shortName(pref.name)}
              </text>
              <text
                x={x + SIZE / 2}
                y={y + SIZE / 2 + 14}
                textAnchor="middle"
                fontSize="13"
                fill={ink}
              >
                {count}
              </text>
            </>
          );

          if (!clickable) {
            return <g key={pref.id}>{tile}</g>;
          }

          return (
            <g
              key={pref.id}
              className={styles.tile}
              role="link"
              tabIndex={0}
              aria-label={`${pref.name}（${count}${JAPAN_MAP_MESSAGES.COUNT_UNIT}）`}
              onClick={() => onSelect(pref.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(pref.id);
                }
              }}
            >
              {tile}
            </g>
          );
        })}
      </svg>

      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendLabel}>{JAPAN_MAP_MESSAGES.LEGEND_FEW}</span>
        {FILL_STEPS.map((color) => (
          <span key={color} className={styles.legendSwatch} style={{ backgroundColor: color }} />
        ))}
        <span className={styles.legendLabel}>{JAPAN_MAP_MESSAGES.LEGEND_MANY}</span>
        <span className={styles.legendZero}>
          <span className={styles.legendSwatch} style={{ backgroundColor: FILL_ZERO }} />
          {JAPAN_MAP_MESSAGES.LEGEND_ZERO}
        </span>
      </div>
    </div>
  );
};

export default JapanTileMap;
