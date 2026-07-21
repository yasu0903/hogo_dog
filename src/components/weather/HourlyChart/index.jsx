// src/components/weather/HourlyChart/index.jsx
// 1時間ごとの予報の時系列グラフ（インラインSVG・外部ライブラリ不要）。
// 気温と降水確率は尺度が異なるため二軸(dual-axis)にはせず、時間軸を共有した
// 上下2パネルの small multiples にする（dataviz の「One axis」原則）。
//   上パネル: 気温(℃) の折れ線
//   下パネル: 降水確率(%) の棒 ＋ 湿度(%) の折れ線
//     （降水確率と湿度はどちらも 0–100% で同一スケールのため、同じパネルに
//      重ねてよい＝二軸ではない。棒と線でマーク種を分け、凡例でも区別する）
// ホバー/フォーカスでその時刻の十字線とツールチップ（SVG座標系内）を出す。
import { useState } from 'react';
import { WEATHER_PREFECTURE_MESSAGES as M } from '../../../constants/locales/ja';

// 色（ページ内の気温=赤・降水=シアンと整合。湿度は緑で降水と区別）
const COLOR_TEMP = '#dc2626';
const COLOR_PRECIP = '#0891b2';
const COLOR_HUMIDITY = '#059669';
const COLOR_GRID = '#e2e8f0';
const COLOR_AXIS = '#94a3b8';
const COLOR_CROSSHAIR = '#94a3b8';
const COLOR_TOOLTIP_BG = '#ffffff';
const COLOR_TOOLTIP_BORDER = '#cbd5e1';
const COLOR_INK = '#334155';

// レイアウト（SVGユーザー座標。svg 側で width:100% にして拡縮する）
const LEFT = 44;
const RIGHT = 16;
const COL = 40;
const TOP = 16;
const TEMP_H = 150;
const GAP = 30;
const PRECIP_H = 80;
const XLABEL_H = 22;

const roundTo = (v, n = 0) => (v == null ? null : Number(v).toFixed(n));

const HourlyChart = ({ hourly }) => {
  const [hover, setHover] = useState(null);

  const rows = Array.isArray(hourly) ? hourly : [];
  if (rows.length === 0) return null;

  const n = rows.length;
  const width = LEFT + n * COL + RIGHT;
  const tempBottom = TOP + TEMP_H;
  const precipTop = tempBottom + GAP;
  const precipBottom = precipTop + PRECIP_H;
  const xLabelY = precipBottom + XLABEL_H - 6;
  const height = precipBottom + XLABEL_H;

  const x = (i) => LEFT + COL * (i + 0.5);

  // 気温スケール（気温・体感の両方から定義域を取り、上下に1℃余白）
  const tvals = [];
  for (const h of rows) {
    if (h.temp_c != null) tvals.push(h.temp_c);
    if (h.feels_c != null) tvals.push(h.feels_c);
  }
  const lo = tvals.length ? Math.floor(Math.min(...tvals) - 1) : 0;
  const hiRaw = tvals.length ? Math.ceil(Math.max(...tvals) + 1) : 1;
  const hi = hiRaw === lo ? lo + 1 : hiRaw;
  const yTemp = (v) => TOP + TEMP_H * (1 - (v - lo) / (hi - lo));
  const yPrecip = (p) => precipTop + PRECIP_H * (1 - Math.max(0, Math.min(100, p)) / 100);

  // 気温軸の目盛り（4本）
  const tempTicks = [0, 1, 2, 3].map((k) => Math.round(lo + ((hi - lo) * k) / 3));
  const precipTicks = [0, 50, 100];

  const linePoints = (key) =>
    rows
      .map((h, i) => (h[key] != null ? `${x(i)},${yTemp(h[key])}` : null))
      .filter(Boolean)
      .join(' ');

  // 湿度は降水確率と同じ 0–100% スケール（yPrecip）で折れ線にする
  const humidityPoints = rows
    .map((h, i) => (h.humidity != null ? `${x(i)},${yPrecip(h.humidity)}` : null))
    .filter(Boolean)
    .join(' ');

  const barW = COL * 0.5;

  // ツールチップ本文（時刻・天気・気温・降水・風）
  const tooltipLines = (h) => {
    const lines = [h.time];
    if (h.weather) lines.push(h.weather);
    if (h.temp_c != null) lines.push(`${M.HOURLY_TEMP} ${h.temp_c}${M.UNIT_TEMP}`);
    if (h.precip_prob != null) lines.push(`${M.HOURLY_PRECIP} ${h.precip_prob}${M.UNIT_PCT}`);
    if (h.humidity != null) lines.push(`${M.HOURLY_HUMIDITY} ${h.humidity}${M.UNIT_PCT}`);
    if (h.wind_ms != null) lines.push(`${M.HOURLY_WIND} ${roundTo(h.wind_ms, 1)}${M.UNIT_WIND}`);
    return lines;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={M.CHART_ARIA}
        style={{ width: '100%', minWidth: Math.min(width, 560), height: 'auto', display: 'block' }}
        onMouseLeave={() => setHover(null)}
      >
        {/* パネル見出し（上=気温 / 下=降水確率・湿度） */}
        <text x={LEFT} y={TOP - 4} fontSize="11" fontWeight="700" fill={COLOR_INK}>{M.CHART_TEMP_AXIS}</text>
        <text x={LEFT} y={precipTop - 6} fontSize="11" fontWeight="700" fill={COLOR_INK}>{M.CHART_PRECIP_AXIS}</text>

        {/* 下パネルの凡例（降水確率=棒 / 湿度=線） */}
        <g fontSize="10" fill={COLOR_INK}>
          <rect x={width - RIGHT - 148} y={precipTop - 14} width={10} height={10} rx={2} fill={COLOR_PRECIP} opacity="0.85" />
          <text x={width - RIGHT - 134} y={precipTop - 6}>{M.HOURLY_PRECIP}</text>
          <line x1={width - RIGHT - 66} y1={precipTop - 9} x2={width - RIGHT - 48} y2={precipTop - 9} stroke={COLOR_HUMIDITY} strokeWidth="2" />
          <text x={width - RIGHT - 44} y={precipTop - 6}>{M.HOURLY_HUMIDITY}</text>
        </g>

        {/* 気温パネルの目盛り・グリッド */}
        {tempTicks.map((t) => (
          <g key={`tt-${t}`}>
            <line x1={LEFT} y1={yTemp(t)} x2={width - RIGHT} y2={yTemp(t)} stroke={COLOR_GRID} strokeWidth="1" />
            <text x={LEFT - 6} y={yTemp(t) + 3} textAnchor="end" fontSize="10" fill={COLOR_AXIS}>{t}</text>
          </g>
        ))}

        {/* 気温の折れ線 */}
        <polyline points={linePoints('temp_c')} fill="none" stroke={COLOR_TEMP} strokeWidth="2" strokeLinejoin="round" />

        {/* 降水確率パネルの目盛り・グリッド */}
        {precipTicks.map((p) => (
          <g key={`pt-${p}`}>
            <line x1={LEFT} y1={yPrecip(p)} x2={width - RIGHT} y2={yPrecip(p)} stroke={COLOR_GRID} strokeWidth="1" />
            <text x={LEFT - 6} y={yPrecip(p) + 3} textAnchor="end" fontSize="10" fill={COLOR_AXIS}>{p}</text>
          </g>
        ))}

        {/* 降水確率の棒 */}
        {rows.map((h, i) =>
          h.precip_prob != null && h.precip_prob > 0 ? (
            <rect
              key={`bar-${i}`}
              x={x(i) - barW / 2}
              y={yPrecip(h.precip_prob)}
              width={barW}
              height={precipBottom - yPrecip(h.precip_prob)}
              rx="2"
              fill={COLOR_PRECIP}
              opacity="0.85"
            />
          ) : null
        )}

        {/* 湿度の折れ線（降水確率と同スケール） */}
        <polyline points={humidityPoints} fill="none" stroke={COLOR_HUMIDITY} strokeWidth="2" strokeLinejoin="round" />

        {/* 軸ラベル（時刻）。混雑を避け3時間おきと末尾に表示 */}
        {rows.map((h, i) =>
          i % 3 === 0 || i === n - 1 ? (
            <text key={`xl-${i}`} x={x(i)} y={xLabelY} textAnchor="middle" fontSize="10" fill={COLOR_AXIS}>
              {String(h.time).slice(0, 2)}
            </text>
          ) : null
        )}

        {/* ホバー時の十字線・点・ツールチップ */}
        {hover != null && rows[hover] && (() => {
          const h = rows[hover];
          const cx = x(hover);
          const lines = tooltipLines(h);
          const boxW = 120;
          const lineH = 15;
          const boxH = 10 + lines.length * lineH;
          const boxX = cx + 12 + boxW > width ? cx - 12 - boxW : cx + 12;
          const boxY = TOP;
          return (
            <g pointerEvents="none">
              <line x1={cx} y1={TOP} x2={cx} y2={precipBottom} stroke={COLOR_CROSSHAIR} strokeWidth="1" strokeDasharray="3 3" />
              {h.temp_c != null && <circle cx={cx} cy={yTemp(h.temp_c)} r="3.5" fill={COLOR_TEMP} />}
              {h.humidity != null && <circle cx={cx} cy={yPrecip(h.humidity)} r="3.5" fill={COLOR_HUMIDITY} />}
              <rect x={boxX} y={boxY} width={boxW} height={boxH} rx="6" fill={COLOR_TOOLTIP_BG} stroke={COLOR_TOOLTIP_BORDER} strokeWidth="1" />
              {lines.map((ln, k) => (
                <text
                  key={k}
                  x={boxX + 10}
                  y={boxY + 16 + k * lineH}
                  fontSize="11"
                  fontWeight={k === 0 ? '700' : '400'}
                  fill={COLOR_INK}
                >
                  {ln}
                </text>
              ))}
            </g>
          );
        })()}

        {/* 各時刻の当たり判定（透明。ホバー/フォーカスで tooltip を出す） */}
        {rows.map((h, i) => (
          <rect
            key={`hit-${i}`}
            x={LEFT + COL * i}
            y={TOP}
            width={COL}
            height={precipBottom - TOP}
            fill="transparent"
            tabIndex={0}
            role="img"
            aria-label={tooltipLines(h).join('、')}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          />
        ))}
      </svg>
    </div>
  );
};

export default HourlyChart;
