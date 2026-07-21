// src/components/weather/WeatherMap/index.jsx
// タイル型の日本地図で「当日の最高気温」を暖色の濃淡で塗り分けるコロプレスマップ。
// 静的SVG・外部ライブラリ不要。タイル配置は JapanTileMap と共有する。
// 色分けは連続量（気温）の sequential 表現：単一色相オレンジ、淡→濃 = 涼→暑。
import {
  TILE_POSITIONS,
  shortName,
  CELL,
  SIZE,
  COLS,
  ROWS
} from '../../organizations/JapanTileMap/tiles';
import styles from '../../organizations/JapanTileMap/JapanTileMap.module.css';
import { WEATHER_MAP_MESSAGES } from '../../../constants/locales/ja';

// 単一色相（オレンジ）の sequential ランプ（淡→濃 = 涼しい→暑い）
// dataviz の validator で単調・単一色相を確認済み。淡色端はタイル枠線で視認性を担保。
const FILL_STEPS = ['#ffd0a3', '#ffb072', '#f78a42', '#e0601b', '#a8380c'];
const INK_ON_LIGHT = '#42210b';
const INK_ON_DARK = '#ffffff';
const FILL_NA = '#f0efec';
const INK_NA = '#898781';
const TILE_STROKE = 'rgba(11, 11, 11, 0.12)';

// 気温 → 塗り段階。全県の [min, max] を定義域にして濃淡を割り当てる。
const binIndex = (temp, min, max) => {
  if (max <= min) return Math.floor(FILL_STEPS.length / 2);
  const frac = (temp - min) / (max - min);
  return Math.max(0, Math.min(FILL_STEPS.length - 1, Math.floor(frac * FILL_STEPS.length)));
};

const WeatherMap = ({
  prefectures,
  temps,
  onSelect,
  ariaLabel = WEATHER_MAP_MESSAGES.ARIA_LABEL,
  hint = WEATHER_MAP_MESSAGES.HINT
}) => {
  const values = Object.values(temps).filter((v) => v != null);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

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
          const temp = temps[pref.id];
          const hasData = temp != null;
          const bin = hasData ? binIndex(temp, min, max) : 0;
          const fill = hasData ? FILL_STEPS[bin] : FILL_NA;
          const ink = hasData ? (bin >= 3 ? INK_ON_DARK : INK_ON_LIGHT) : INK_NA;
          const label = hasData
            ? `${pref.name}: ${WEATHER_MAP_MESSAGES.TEMP(temp)}`
            : `${pref.name}: ${WEATHER_MAP_MESSAGES.NO_DATA}`;

          const tile = (
            <>
              <title>{label}</title>
              <rect
                x={x}
                y={y}
                width={SIZE}
                height={SIZE}
                rx={8}
                fill={fill}
                stroke={TILE_STROKE}
                strokeWidth={1}
                className={hasData ? styles.tileRect : undefined}
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
                {hasData ? WEATHER_MAP_MESSAGES.TEMP(temp) : '—'}
              </text>
            </>
          );

          if (!hasData) {
            return <g key={pref.id}>{tile}</g>;
          }

          return (
            <g
              key={pref.id}
              className={styles.tile}
              role="link"
              tabIndex={0}
              aria-label={label}
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
        <span className={styles.legendLabel}>{WEATHER_MAP_MESSAGES.LEGEND_COOL}</span>
        {FILL_STEPS.map((color) => (
          <span key={color} className={styles.legendSwatch} style={{ backgroundColor: color }} />
        ))}
        <span className={styles.legendLabel}>{WEATHER_MAP_MESSAGES.LEGEND_HOT}</span>
      </div>
    </div>
  );
};

export default WeatherMap;
