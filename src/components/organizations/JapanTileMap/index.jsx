// src/components/organizations/JapanTileMap/index.jsx
// タイル型の日本地図（静的SVG・外部ライブラリ不要）。
// 県ごとの掲載団体数を単色（青）の濃淡+数字で表示するコロプレスマップ。
import styles from './JapanTileMap.module.css';
import { JAPAN_MAP_MESSAGES } from '../../../constants/locales/ja';
import { TILE_POSITIONS, CELL, SIZE, COLS, ROWS, shortName } from './tiles';

// 単色（青）のシーケンシャルランプ（薄い→濃い = 少ない→多い）
const FILL_STEPS = ['#cde2fb', '#86b6ef', '#3987e5', '#1c5cab', '#0d366b'];
// 濃い塗り（後半2段階）の上では白文字、それ以外は濃紺文字
const INK_ON_LIGHT = '#0b2545';
const INK_ON_DARK = '#ffffff';
const FILL_ZERO = '#f0efec';
const INK_ZERO = '#898781';

const binIndex = (count, max) => {
  if (max <= 0) return 0;
  return Math.min(FILL_STEPS.length - 1, Math.ceil((count / max) * FILL_STEPS.length) - 1);
};

// ラベル類は団体検索向けが既定。スポット検索など他用途では props で差し替える
const JapanTileMap = ({
  prefectures,
  counts,
  onSelect,
  ariaLabel = JAPAN_MAP_MESSAGES.ARIA_LABEL,
  hint = JAPAN_MAP_MESSAGES.HINT,
  countUnit = JAPAN_MAP_MESSAGES.COUNT_UNIT
}) => {
  const max = Math.max(0, ...Object.values(counts));

  return (
    <div className={styles.mapContainer}>
      <p className={styles.mapHint}>{hint}</p>
      <svg
        className={styles.mapSvg}
        viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
        role="img"
        aria-label={ariaLabel}
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
              <title>{`${pref.name}: ${count}${countUnit}`}</title>
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
              aria-label={`${pref.name}（${count}${countUnit}）`}
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
