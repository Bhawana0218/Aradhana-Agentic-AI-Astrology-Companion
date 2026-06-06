import { memo, useMemo } from 'react';
import type { PlanetData, HouseData, ChartPoint } from '../types';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PLANET_COLORS: Record<string, string> = {
  Sun: '#f4a236',
  Moon: '#e8d5a3',
  Mercury: '#9d93f8',
  Venus: '#f9a8d4',
  Mars: '#fb7185',
  Jupiter: '#fbbf24',
  Saturn: '#d4a373',
  Uranus: '#7dd3fc',
  Neptune: '#818cf8',
  Pluto: '#c084fc',
  'North Node': '#34d399',
  Chiron: '#a78bfa',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  'North Node': '☊',
  Chiron: '⚷',
};

interface Props {
  planets: PlanetData[];
  houses: HouseData[];
  ascendant: ChartPoint;
  midheaven: ChartPoint;
}

export const BirthChartWheel = memo(function BirthChartWheel({ planets, houses, ascendant }: Props) {
  const cx = 200, cy = 200, r = 170, innerR = 50;

  const segments = useMemo(() => {
    return houses.map((h, i) => {
      const startAngle = (h.cusp - 90) * (Math.PI / 180);
      const endAngle = startAngle + 30 * (Math.PI / 180);
      const midAngle = startAngle + 15 * (Math.PI / 180);
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const x3 = cx + innerR * Math.cos(endAngle);
      const y3 = cy + innerR * Math.sin(endAngle);
      const x4 = cx + innerR * Math.cos(startAngle);
      const y4 = cy + innerR * Math.sin(startAngle);
      const largeArc = 30 > 180 ? 1 : 0;

      const path = [
        `M ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z',
      ].join(' ');

      const labelR = r - 25;
      const labelX = cx + labelR * Math.cos(midAngle);
      const labelY = cy + labelR * Math.sin(midAngle);

      const signR = r - 10;
      const signX = cx + signR * Math.cos(midAngle);
      const signY = cy + signR * Math.sin(midAngle);

      const signIndex = SIGNS.indexOf(h.sign);
      return {
        path,
        houseNum: h.house,
        signSymbol: signIndex >= 0 ? SIGN_SYMBOLS[signIndex] : '?',
        signName: h.sign,
        labelX,
        labelY,
        signX,
        signY,
        color: signIndex % 2 === 0 ? 'rgba(123,110,246,0.08)' : 'rgba(123,110,246,0.15)',
      };
    });
  }, [houses]);

  const planetPositions = useMemo(() => {
    return planets.map((p) => {
      const angle = (p.longitude - 90) * (Math.PI / 180);
      const dist = 70 + ((SIGNS.indexOf(p.sign) % 3) * 20);
      return {
        ...p,
        x: cx + dist * Math.cos(angle),
        y: cy + dist * Math.sin(angle),
        color: PLANET_COLORS[p.name] ?? '#e8d5a3',
        symbol: PLANET_SYMBOLS[p.name] ?? p.name[0],
      };
    });
  }, [planets]);

  const ascAngle = ascendant ? (ascendant.longitude - 90) * (Math.PI / 180) : 0;
  const ascX = cx + (r - 5) * Math.cos(ascAngle);
  const ascY = cy + (r - 5) * Math.sin(ascAngle);

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto drop-shadow-aurora">
      <defs>
        <radialGradient id="wheel-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2235" stopOpacity="0" />
          <stop offset="70%" stopColor="#1a2235" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0a0e1a" stopOpacity="0.8" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(123,110,246,0.15)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(123,110,246,0.1)" strokeWidth="1" />

      {/* House segments */}
      {segments.map((seg) => (
        <g key={seg.houseNum}>
          <path d={seg.path} fill={seg.color} stroke="rgba(123,110,246,0.2)" strokeWidth="0.5" />
          {/* House number */}
          <text
            x={seg.labelX} y={seg.labelY}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(232,213,163,0.25)"
            fontSize="8"
            fontFamily="Inter, sans-serif"
          >
            {seg.houseNum}
          </text>
          {/* Sign (rashi) symbol */}
          <text
            x={seg.signX} y={seg.signY}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(232,213,163,0.7)"
            fontSize="18"
            fontFamily="serif"
            filter="url(#glow)"
          >
            {seg.signSymbol}
          </text>
          {/* Sign name text (small, below symbol) */}
          <text
            x={seg.signX} y={seg.signY + 14}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(232,213,163,0.35)"
            fontSize="6"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
          >
            {seg.signName.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Inner circle decorative */}
      <circle cx={cx} cy={cy} r={innerR} fill="rgba(123,110,246,0.05)" stroke="rgba(123,110,246,0.08)" strokeWidth="0.5" />
      <text
        x={cx} y={cy - 6}
        textAnchor="middle" dominantBaseline="central"
        fill="rgba(232,213,163,0.3)"
        fontSize="9"
        fontFamily="Cinzel, serif"
        letterSpacing="3"
      >
        ARADHANA
      </text>
      <text
        x={cx} y={cy + 10}
        textAnchor="middle" dominantBaseline="central"
        fill="rgba(232,213,163,0.15)"
        fontSize="6"
        fontFamily="serif"
      >
        ✦ BIRTH CHART ✦
      </text>

      {/* Ascendant marker (AS) */}
      <g>
        <line
          x1={cx} y1={cy}
          x2={ascX} y2={ascY}
          stroke="rgba(244,162,54,0.3)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <text
          x={ascX} y={ascY - 8}
          textAnchor="middle" dominantBaseline="central"
          fill="#f4a236"
          fontSize="10"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
          filter="url(#glow)"
        >
          AS
        </text>
      </g>

      {/* Planets */}
      {planetPositions.map((p) => (
        <g key={p.name}>
          <circle
            cx={p.x} cy={p.y}
            r="10"
            fill={`${p.color}20`}
            stroke={p.color}
            strokeWidth="1.5"
            filter="url(#glow)"
          />
          <text
            x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="central"
            fill={p.color}
            fontSize="12"
            fontFamily="serif"
            fontWeight="bold"
          >
            {p.symbol}
          </text>
          <text
            x={p.x} y={p.y + 14}
            textAnchor="middle" dominantBaseline="central"
            fill={p.color}
            fontSize="5"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
            opacity="0.8"
          >
            {p.name.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Degree markings */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const x1 = cx + (r + 8) * Math.cos(a);
        const y1 = cy + (r + 8) * Math.sin(a);
        const x2 = cx + (r + 14) * Math.cos(a);
        const y2 = cy + (r + 14) * Math.sin(a);
        return (
          <line
            key={i}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke="rgba(232,213,163,0.15)"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
});
