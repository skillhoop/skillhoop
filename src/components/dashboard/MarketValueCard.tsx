/**
 * Market Value Card — 3D Estimated Salary Range Card
 * Uses Supabase `get_market_insights` via `/api/auth-proxy` to power a 3D card
 * that flips to show negotiation leverage vs. the market.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  X,
  TrendingUp,
  DollarSign,
  ArrowUp,
  Database,
  Zap,
  Info,
  Loader2,
  MapPin,
  Globe,
} from 'lucide-react';

// --- Types for existing Supabase market insights flow ---

export interface ActiveJob {
  title: string;
  location: string;
}

export interface MarketInsightsRow {
  avg_min_salary?: number | null;
  avg_max_salary?: number | null;
  [key: string]: unknown;
}

// --- Utility function for Tailwind classes ---

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- Optional helpers for INR formatting (used for footer range text) ---

export function formatSalaryINR(amount: number): string {
  if (amount >= 1_00_00_000) {
    const cr = amount / 1_00_00_000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(1).replace(/\.0$/, '')} Cr`;
  }
  if (amount >= 1_00_000) {
    const lakhs = amount / 1_00_000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1).replace(/\.0$/, '')} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatMarketRangeINR(minSalary: number, maxSalary: number): string {
  return `${formatSalaryINR(minSalary)} – ${formatSalaryINR(maxSalary)}`;
}

// --- Shared Graphic Layers ---

const GridLayer = ({ color }: { color: string }) => {
  return (
    <div
      style={{ '--grid-color': color } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 z-[4] h-full w-full bg-transparent bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:20px_20px] bg-center opacity-70 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"
    />
  );
};

const EllipseGradient = ({ color, id }: { color: string; id: string }) => {
  return (
    <div className="absolute inset-0 z-[5] flex h-full w-full items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 356 180"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="356" height="180" fill={`url(#${id})`} />
        <defs>
          <radialGradient
            id={id}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(178 98) rotate(90) scale(98 178)"
          >
            <stop stopColor={color} stopOpacity="0.25" />
            <stop offset="0.34" stopColor={color} stopOpacity="0.15" />
            <stop offset="1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

// --- Market Value Chart Components ---

const MarketLayer1 = ({ color, secondaryColor }: { color: string; secondaryColor: string }) => {
  return (
    <div
      className="absolute top-4 right-4 z-[8] flex items-center gap-1.5"
      style={{ '--color': color, '--secondary-color': secondaryColor } as React.CSSProperties}
    >
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-1 backdrop-blur-md transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 shadow-sm">
        <TrendingUp size={10} className="text-[var(--color)] stroke-[3]" />
        <span className="text-[10px] font-bold text-slate-800 leading-none">+12% vs Avg</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-1 backdrop-blur-md transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 shadow-sm">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--secondary-color)] shadow-[0_0_4px_var(--secondary-color)]" />
        <span className="text-[10px] font-bold text-slate-800 leading-none">Top 25%</span>
      </div>
    </div>
  );
};

const MarketLayer3 = ({ color }: { color: string }) => {
  return (
    <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[6] flex translate-y-full items-center justify-center opacity-0 transition-all duration-500 group-hover/animated-card:translate-y-0 group-hover/animated-card:opacity-100">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 356 180"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="356" height="180" fill="url(#paint0_linear_market)" />
        <defs>
          <linearGradient
            id="paint0_linear_market"
            x1="178"
            y1="0"
            x2="178"
            y2="180"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.35" stopColor={color} stopOpacity="0" />
            <stop offset="1" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const MarketLayer4 = ({
  color,
  secondaryColor,
  hovered,
  minSalary,
  maxSalary,
  percentile,
  isLoading,
}: {
  color: string;
  secondaryColor: string;
  hovered: boolean;
  minSalary?: number | null;
  maxSalary?: number | null;
  percentile?: number;
  isLoading: boolean;
}) => {
  const userPercentile = percentile || 75;

  const formatSal = (val: number) =>
    val ? `₹${Number(val).toFixed(1).replace(/\.0$/, '')}L` : '';

  let points = [
    { x: 60, y: 130, p: 10 },
    { x: 120, y: 115, p: 25 },
    { x: 180, y: 85, p: 50 },
    { x: 240, y: 45, p: 75 },
    { x: 300, y: 25, p: 90 },
  ];

  let gridLabels = { top: 'HIGH', mid: 'MED', bot: 'LOW' as string };
  let calculatedUserSal = maxSalary ? formatSal(maxSalary) : 'MAX';

  // Procedural Graph Engine — map Supabase avg_min_salary/avg_max_salary to SVG curve
  if (!isLoading && minSalary && maxSalary) {
    const range = maxSalary - minSalary;
    const variance = ((minSalary + maxSalary) % 5) * 0.03;

    const s10 = minSalary - range * 0.15;
    const s25 = minSalary + range * (0.2 + variance);
    const s50 = minSalary + range * (0.45 - variance);
    const s75 = minSalary + range * (0.75 + variance);
    const s90 = maxSalary + range * 0.15;

    const chartMin = s10 * 0.9;
    const chartMax = s90 * 1.1;
    const ySpan = chartMax - chartMin;

    const mapY = (val: number) => 150 - ((val - chartMin) / ySpan) * 130;

    points = [
      { x: 60, y: mapY(s10), p: 10 },
      { x: 120, y: mapY(s25), p: 25 },
      { x: 180, y: mapY(s50), p: 50 },
      { x: 240, y: mapY(s75), p: 75 },
      { x: 300, y: mapY(s90), p: 90 },
    ];

    const valAtY = (y: number) => chartMin + ((150 - y) / 130) * ySpan;
    gridLabels = {
      top: formatSal(valAtY(45)),
      mid: formatSal(valAtY(85)),
      bot: formatSal(valAtY(130)),
    };
  }

  // Linear Interpolation for "You" Crosshair
  const getMarkerPos = (p: number) => {
    const clampedP = Math.max(10, Math.min(90, p));
    for (let i = 0; i < points.length - 1; i++) {
      if (clampedP >= points[i].p && clampedP <= points[i + 1].p) {
        const ratio = (clampedP - points[i].p) / (points[i + 1].p - points[i].p);
        return {
          x: points[i].x + ratio * (points[i + 1].x - points[i].x),
          y: points[i].y + ratio * (points[i + 1].y - points[i].y),
        };
      }
    }
    return points[3];
  };

  const markerPos = getMarkerPos(userPercentile);

  if (!isLoading && minSalary && maxSalary) {
    const range = maxSalary - minSalary;
    const chartMin = (minSalary - range * 0.15) * 0.9;
    const ySpan = (maxSalary + range * 0.15) * 1.1 - chartMin;
    const userSalNum = chartMin + ((150 - markerPos.y) / 130) * ySpan;
    calculatedUserSal = formatSal(userSalNum);
  }

  const medianLine = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[8] flex h-full w-full items-center justify-center transition-transform duration-700 group-hover/animated-card:scale-[1.03]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 356 180"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'transition-opacity duration-1000',
          isLoading ? 'opacity-30 grayscale' : 'opacity-100',
        )}
      >
        <defs>
          <pattern id="tech-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>
        </defs>

        <rect x="40" y="20" width="290" height="130" fill="url(#tech-grid)" />

        <g stroke={color} opacity="0.4" strokeWidth="1.5">
          <line x1="40" y1="20" x2="40" y2="150" />
          <line x1="40" y1="150" x2="330" y2="150" />
        </g>

        <g stroke={color} opacity="0.5" strokeWidth="1.5">
          {points.map((p, i) => (
            <line key={`x-${i}`} x1={p.x} y1="150" x2={p.x} y2="154" />
          ))}
          <line x1="36" y1="130" x2="40" y2="130" />
          <line x1="36" y1="85" x2="40" y2="85" />
          <line x1="36" y1="45" x2="40" y2="45" />
        </g>

        <g stroke={color} opacity="0.15" strokeWidth="1" strokeDasharray="4 4">
          <line x1="40" y1="130" x2="330" y2="130" />
          <line x1="40" y1="85" x2="330" y2="85" />
          <line x1="40" y1="45" x2="330" y2="45" />
        </g>

        {!isLoading && (
          <g
            className="ease-[cubic-bezier(0.6,0.6,0,1)] transition-all duration-700"
            style={{
              transformOrigin: 'center',
              transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <polyline
              points={medianLine}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinejoin="bevel"
              className="drop-shadow-sm"
            />

            {points.map((p, i) => (
              <rect
                key={i}
                x={p.x - (hovered ? 3.5 : 2.5)}
                y={p.y - (hovered ? 3.5 : 2.5)}
                width={hovered ? 7 : 5}
                height={hovered ? 7 : 5}
                fill={p.p === userPercentile && !hovered ? secondaryColor : '#fff'}
                stroke={p.p === userPercentile || i === 3 ? secondaryColor : color}
                strokeWidth="2"
                className="ease-[cubic-bezier(0.6,0.6,0,1)] transition-all duration-700"
              />
            ))}

            <g
              className={cn(
                'ease-out transition-all duration-500',
                hovered ? 'opacity-100' : 'opacity-0',
              )}
            >
              <line
                x1="40"
                y1={markerPos.y}
                x2="330"
                y2={markerPos.y}
                stroke={secondaryColor}
                strokeWidth="1"
                opacity="0.8"
              />
              <line
                x1={markerPos.x}
                y1="20"
                x2={markerPos.x}
                y2="150"
                stroke={secondaryColor}
                strokeWidth="1"
                opacity="0.8"
              />

              <rect
                x={markerPos.x - 6}
                y={markerPos.y - 6}
                width="12"
                height="12"
                fill="none"
                stroke={secondaryColor}
                strokeWidth="1.5"
              />
              <circle cx={markerPos.x} cy={markerPos.y} r="1.5" fill={secondaryColor} />

              <g
                transform={`translate(${
                  markerPos.x > 260 ? markerPos.x - 65 : markerPos.x
                }, ${markerPos.y - 21})`}
              >
                <rect x="0" y="0" width="56" height="14" rx="2" fill={secondaryColor} />
                <text
                  x="28"
                  y="10"
                  fill="#fff"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                  letterSpacing="0.5"
                >
                  P{userPercentile}:{calculatedUserSal}
                </text>
              </g>
            </g>
          </g>
        )}

        <text
          x="32"
          y="48"
          fill={color}
          opacity="0.7"
          fontSize="7"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="end"
        >
          {gridLabels.top}
        </text>
        <text
          x="32"
          y="88"
          fill={color}
          opacity="0.7"
          fontSize="7"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="end"
        >
          {gridLabels.mid}
        </text>
        <text
          x="32"
          y="133"
          fill={color}
          opacity="0.7"
          fontSize="7"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="end"
        >
          {gridLabels.bot}
        </text>

        <text
          x="60"
          y="162"
          fill={color}
          opacity="0.7"
          fontSize="7"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          P10
        </text>
        <text
          x="120"
          y="162"
          fill={color}
          opacity="0.7"
          fontSize="7"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          P25
        </text>
        <text
          x="180"
          y="162"
          fill={color}
          opacity="0.7"
          fontSize="7"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          P50
        </text>
        <text
          x="240"
          y="162"
          fill={color}
          opacity="0.7"
          fontSize="7"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          P75
        </text>
        <text
          x="300"
          y="162"
          fill={color}
          opacity="0.7"
          fontSize="7"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          P90
        </text>
      </svg>
    </div>
  );
};

function MarketValueVisual({
  mainColor = '#10b981',
  secondaryColor = '#34d399',
  gridColor = '#10b98120',
  minSalary,
  maxSalary,
  percentile,
  isLoading,
}: {
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  percentile?: number;
  isLoading: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        className="absolute inset-0 z-20"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ '--color': mainColor, '--secondary-color': secondaryColor } as React.CSSProperties}
      />
      <div className="relative h-full w-full overflow-hidden rounded-t-xl">
        <MarketLayer4
          color={mainColor}
          secondaryColor={secondaryColor}
          hovered={hovered}
          minSalary={minSalary}
          maxSalary={maxSalary}
          percentile={percentile}
          isLoading={isLoading}
        />
        <MarketLayer3 color={mainColor} />
        {!isLoading && <MarketLayer1 color={mainColor} secondaryColor={secondaryColor} />}
        <EllipseGradient id="market-ellipse" color={mainColor} />
        <GridLayer color={gridColor} />
      </div>
    </>
  );
}

// --- Market state shape for Supabase data ---

interface MarketStateData {
  min: number | null;
  max: number | null;
  source: 'local' | 'global';
  sourceLabel: string;
  raw: MarketInsightsRow | null;
}

interface MarketState {
  isLoading: boolean;
  data: MarketStateData | null;
  error: string | null;
}

// --- Helper: derive percentile & leverage based on user vs market ---

function computeMarketPosition(
  minSalary: number | null,
  maxSalary: number | null,
  userAnnualBaseInINR?: number | null,
): { percentile: number; leverage: 'Weak' | 'Fair' | 'Strong' } {
  if (!minSalary || !maxSalary || minSalary <= 0 || maxSalary <= 0 || maxSalary <= minSalary) {
    return { percentile: 60, leverage: 'Fair' };
  }

  const range = maxSalary - minSalary;
  const target =
    typeof userAnnualBaseInINR === 'number' && userAnnualBaseInINR > 0
      ? userAnnualBaseInINR
      : minSalary + range * 0.6;

  const position = (target - minSalary) / range;
  const clamped = Math.max(0, Math.min(1, position));

  const percentile = Math.round(10 + clamped * 80); // map [0,1] -> [10,90]

  let leverage: 'Weak' | 'Fair' | 'Strong';
  if (clamped < 0.33) leverage = 'Weak';
  else if (clamped < 0.66) leverage = 'Fair';
  else leverage = 'Strong';

  return { percentile, leverage };
}

export interface MarketValueCardProps {
  /** Active job whose title and location are used to fetch market insights */
  activeJob: ActiveJob | null;
  /** Optional class name for the card container */
  className?: string;
  /** Optional user annual base compensation in INR (for more precise percentile/leverage) */
  userAnnualBaseInINR?: number | null;
}

export function MarketValueCard({
  activeJob,
  className = '',
  userAnnualBaseInINR,
}: MarketValueCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [marketState, setMarketState] = useState<MarketState>({
    isLoading: false,
    data: null,
    error: null,
  });

  const toggleFlip = () => setIsFlipped((prev) => !prev);

  // --- Supabase market insights fetch via /api/auth-proxy ---
  useEffect(() => {
    if (!activeJob?.title?.trim()) {
      setMarketState({ isLoading: false, data: null, error: null });
      return;
    }

    let cancelled = false;

    const fetchMarketValue = async () => {
      setMarketState({ isLoading: true, data: null, error: null });
      try {
        const res = await fetch('/api/auth-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_market_insights',
            title: activeJob.title.trim(),
            location: (activeJob.location || '').trim() || undefined,
          }),
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          const message =
            res.status === 500
              ? 'Benchmark data currently unavailable for this role'
              : ((json.error as string) || 'Failed to load market insights');
          setMarketState({ isLoading: false, data: null, error: message });
          return;
        }

        const data = json.data;
        const row = (Array.isArray(data) ? data[0] : data) as MarketInsightsRow | null;

        if (row && (row.avg_min_salary != null || row.avg_max_salary != null)) {
          const min =
            row.avg_min_salary != null && !Number.isNaN(Number(row.avg_min_salary))
              ? Number(row.avg_min_salary)
              : null;
          const max =
            row.avg_max_salary != null && !Number.isNaN(Number(row.avg_max_salary))
              ? Number(row.avg_max_salary)
              : null;

          const source: 'local' | 'global' =
            activeJob.location && activeJob.location.trim().length > 0 ? 'local' : 'global';
          const sourceLabel =
            source === 'local' && activeJob.location
              ? `Local ${activeJob.location} Data`
              : 'Global Market Data';

          setMarketState({
            isLoading: false,
            data: { min, max, source, sourceLabel, raw: row },
            error: null,
          });
        } else {
          setMarketState({ isLoading: false, data: null, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setMarketState({
            isLoading: false,
            data: null,
            error: err instanceof Error ? err.message : 'Failed to load market insights',
          });
        }
      }
    };

    fetchMarketValue();

    return () => {
      cancelled = true;
    };
  }, [activeJob?.title, activeJob?.location]);

  const rawMin = marketState.data?.min ?? null;
  const rawMax = marketState.data?.max ?? null;
  const hasSalary = marketState.data && (rawMin != null || rawMax != null);

  // Treat 0 as "still analyzing" — keep the 3D card in an "Analyzing Market..." state
  const isZeroMinFromDb = hasSalary && rawMin === 0;
  const isAnalyzingMarket =
    !marketState.isLoading && !marketState.error && Boolean(hasSalary && isZeroMinFromDb);
  const cardIsLoading = marketState.isLoading || isAnalyzingMarket;

  // Only treat positive values as a real range for display / percentile computation
  const minPositive = rawMin != null && rawMin > 0 ? rawMin : null;
  const maxPositive = rawMax != null && rawMax > 0 ? rawMax : null;

  // Convert to Lakhs for the SVG chart (while keeping INR for labels/tooltips)
  const minInLakhs = minPositive != null ? minPositive / 1_00_000 : null;
  const maxInLakhs = maxPositive != null ? maxPositive / 1_00_000 : null;

  const hasPositiveRange = minPositive != null || maxPositive != null;

  const displayRange =
    minPositive != null && maxPositive != null
      ? formatMarketRangeINR(minPositive, maxPositive)
      : minPositive != null
      ? `${formatSalaryINR(minPositive)}+`
      : maxPositive != null
      ? `Up to ${formatSalaryINR(maxPositive)}`
      : null;

  const showAnalyzingText = cardIsLoading && !marketState.error;

  const { percentile, leverage } = computeMarketPosition(
    minPositive,
    maxPositive,
    userAnnualBaseInINR,
  );

  const breakdown = { base: 60, bonus: 15, equity: 25 };

  const p = percentile;
  const lev = leverage.toLowerCase();

  let badgeText = 'Emerging Earner';
  let BadgeIcon: typeof TrendingUp | typeof ArrowUp = TrendingUp;
  let badgeColor = 'text-blue-700';
  let badgeIconColor = 'text-blue-600';
  let badgeBorder = 'border-blue-100';

  if (p >= 75) {
    badgeText = `Top ${100 - p}% Earner`;
    BadgeIcon = ArrowUp;
    badgeColor = 'text-emerald-700';
    badgeIconColor = 'text-emerald-600';
    badgeBorder = 'border-emerald-100';
  } else if (p >= 50) {
    badgeText = 'Above Average';
    BadgeIcon = ArrowUp;
    badgeColor = 'text-emerald-700';
    badgeIconColor = 'text-emerald-600';
    badgeBorder = 'border-emerald-100';
  } else if (p >= 25) {
    badgeText = 'Market Average';
    BadgeIcon = TrendingUp;
    badgeColor = 'text-amber-700';
    badgeIconColor = 'text-amber-600';
    badgeBorder = 'border-amber-100';
  }

  const tooltipPText = `This estimated salary is higher than ${p}% of similar roles in the market. This means ${
    100 - p
  }% of companies pay more for this position.`;
  const tooltipLText =
    lev === 'strong'
      ? 'Your exact skill match gives you strong leverage to negotiate near the top of this range.'
      : lev === 'fair'
      ? 'Your solid skills give you fair leverage to negotiate a mid-to-high offer within this range.'
      : 'Focus on highlighting your unique past achievements to build better negotiation leverage.';

  const bar1 = lev === 'weak' ? 'bg-amber-400' : 'bg-emerald-400';
  const bar2 =
    lev === 'strong' || lev === 'fair' ? 'bg-emerald-500' : 'bg-slate-200';
  const bar3 = lev === 'strong' ? 'bg-emerald-600' : 'bg-slate-200';
  const leverageColorText =
    lev === 'strong'
      ? 'text-emerald-600'
      : lev === 'fair'
      ? 'text-emerald-500'
      : 'text-amber-500';

  const canFlipToLeverage = !cardIsLoading && hasPositiveRange && !marketState.error;

  // If no active job, fall back to a simple info message
  if (!activeJob?.title?.trim()) {
    return (
      <div
        className={cn(
          'rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-500',
          className,
        )}
        data-testid="market-value-card"
      >
        Select a job to see market value.
      </div>
    );
  }

  return (
    <div
      className={cn('text-[#1e293b] w-full font-sans', className)}
      data-testid="market-value-card"
    >
      <div
        className="group relative h-full w-full [perspective:2000px] cursor-pointer"
        onClick={() => !isFlipped && canFlipToLeverage && toggleFlip()}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          className="relative h-full w-full [transform-style:preserve-3d]"
        >
          {/* FRONT FACE */}
          <div
            className={cn(
              'absolute inset-0 h-full w-full [backface-visibility:hidden] bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all overflow-hidden flex flex-col',
              isFlipped ? 'pointer-events-none' : '',
            )}
          >
            <div className="group/animated-card relative flex-1 bg-slate-50/80 overflow-hidden">
              <MarketValueVisual
                mainColor="#10b981"
                secondaryColor="#34d399"
                gridColor="#10b98120"
                minSalary={minInLakhs}
                maxSalary={maxInLakhs}
                percentile={percentile}
                isLoading={cardIsLoading}
              />
            </div>
            <div className="relative h-[100px] bg-white p-4 flex flex-col justify-between border-t border-slate-100 z-30">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 leading-tight">
                    Estimated Salary Range
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Base compensation • {activeJob.title}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-start justify-end text-slate-900">
                    {marketState.error ? (
                      <span className="text-[12px] font-semibold text-red-500 mt-1">
                        Market data unavailable
                      </span>
                    ) : showAnalyzingText ? (
                      <span className="text-[12px] font-semibold text-slate-400 animate-pulse flex items-center gap-1.5 mt-1">
                        <Loader2 size={12} className="animate-spin" /> Analyzing Market...
                      </span>
                    ) : displayRange ? (
                      <span className="text-[15px] font-black leading-none tracking-tight mt-1">
                        {displayRange}
                      </span>
                    ) : hasSalary ? (
                      <span className="text-[13px] font-semibold text-slate-400 mt-1">
                        No salary data
                      </span>
                    ) : (
                      <span className="text-[13px] font-semibold text-slate-400 mt-1">
                        No salary data
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Annual Base
                  </span>
                  {!cardIsLoading && marketState.data && (
                    <span
                      className={cn(
                        'flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border',
                        marketState.data.source === 'local'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100',
                      )}
                    >
                      {marketState.data.source === 'local' ? (
                        <MapPin size={8} />
                      ) : (
                        <Globe size={8} />
                      )}
                      {marketState.data.sourceLabel}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    if (!canFlipToLeverage) return;
                    e.stopPropagation();
                    toggleFlip();
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 text-[10px] font-semibold transition-colors',
                    !canFlipToLeverage
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:text-slate-900',
                  )}
                >
                  Check Leverage <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className={cn(
              'absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-slate-200 shadow-xl border rounded-xl p-4 pb-3 flex flex-col overflow-hidden',
              !isFlipped ? 'pointer-events-none' : '',
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFlip();
              }}
              className="absolute z-10 top-2.5 right-2.5 text-slate-400 hover:text-slate-700 transition-colors p-1 bg-slate-50 rounded-full hover:bg-slate-100"
            >
              <X size={14} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600">
                <DollarSign size={14} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-[13px] font-extrabold text-slate-900 leading-tight">
                    Compensation Insights
                  </h3>
                  <div className="relative group/tooltip flex items-center">
                    <Info
                      size={12}
                      className="text-slate-400 hover:text-emerald-500 cursor-help transition-colors"
                    />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-64 p-3.5 bg-slate-800 text-slate-200 text-[10.5px] leading-relaxed font-medium rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-left shadow-xl pointer-events-none">
                      <p className="mb-2">
                        <strong className="text-white">What this means:</strong> {tooltipPText}
                      </p>
                      <p>
                        <strong className="text-white">Your Leverage:</strong> {tooltipLText}
                      </p>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-slate-800" />
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                  Market &amp; Leverage Analysis
                </p>
              </div>
            </div>

            {/* Percentile Stat */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-3">
              <div>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                  Market Position
                </p>
                <div
                  className={cn(
                    'mt-1 flex items-center gap-1 rounded-full bg-white border px-1.5 py-0.5 shadow-sm w-fit',
                    badgeBorder,
                  )}
                >
                  <BadgeIcon size={8} className={cn('stroke-[3]', badgeIconColor)} />
                  <span className={cn('text-[9px] font-bold', badgeColor)}>{badgeText}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-0.5 pr-2">
                <span className="text-2xl font-black text-slate-900 tracking-tighter">{p}</span>
                <span className="text-xs font-bold text-slate-400">th</span>
              </div>
            </div>

            {/* Comp Breakdown */}
            <div className="mb-3">
              <div className="flex justify-between items-end mb-1">
                <p className="text-[10px] font-bold text-slate-700">Standard Breakdown</p>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${breakdown.base}%` }}
                  title="Base"
                />
                <div
                  className="h-full bg-emerald-300"
                  style={{ width: `${breakdown.bonus}%` }}
                  title="Bonus"
                />
                <div
                  className="h-full bg-emerald-100"
                  style={{ width: `${breakdown.equity}%` }}
                  title="Equity"
                />
              </div>
              <div className="flex justify-between mt-1 px-0.5">
                <span className="text-[8px] font-bold text-slate-500">
                  Base ({breakdown.base}%)
                </span>
                <span className="text-[8px] font-bold text-slate-500">
                  Bonus ({breakdown.bonus}%)
                </span>
                <span className="text-[8px] font-bold text-slate-500">
                  Equity ({breakdown.equity}%)
                </span>
              </div>
            </div>

            {/* Leverage */}
            <div className="space-y-1 flex-1">
              <div className="flex justify-between items-end mb-1">
                <p className="text-[10px] font-bold text-slate-700">Negotiation Power</p>
                <span
                  className={cn(
                    'text-[10px] font-black uppercase tracking-wide',
                    leverageColorText,
                  )}
                >
                  {leverage}
                </span>
              </div>
              <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className={cn(
                    'h-full w-1/3 border-r border-white transition-colors duration-500',
                    bar1,
                  )}
                />
                <div
                  className={cn(
                    'h-full w-1/3 border-r border-white transition-colors duration-500',
                    bar2,
                  )}
                />
                <div
                  className={cn('h-full w-1/3 transition-colors duration-500', bar3)}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                Verified Sources
              </span>
              <div className="flex gap-2.5 text-slate-400">
                <div className="flex items-center gap-1">
                  <Database size={10} />
                  <span className="text-[9px]">Supabase</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={10} />
                  <span className="text-[9px]">Market</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default MarketValueCard;
