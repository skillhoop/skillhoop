/**
 * Compact flip cards for Job Finder results (workspace) â€” reference job-board visuals,
 * ATS arc, hire bell curve, salary band. Data-only props; no API calls.
 */
import { useCallback, useEffect, useId, useState, type MouseEvent, type ReactNode } from 'react';
import { CheckCircle2, ClipboardList, TrendingUp, DollarSign, X, AlertTriangle, Info } from 'lucide-react';

/** Primary status greens (tailwind emerald/amber/red-500 family). */
const STATUS_GREEN = '#10b981';
const STATUS_AMBER = '#f59e0b';
const STATUS_RED = '#ef4444';

/** Light pastel face backgrounds keyed by primary status color. */
const PASTEL_BY_PRIMARY: Record<string, string> = {
  [STATUS_GREEN.toLowerCase()]: '#f0fdf4',
  [STATUS_AMBER.toLowerCase()]: '#fffbeb',
  [STATUS_RED.toLowerCase()]: '#fef2f2',
};

/** Maps ATS / Hire / Market primary color to a full-card pastel for .mc-front. */
function pastelFromPrimary(primaryHex: string): string {
  const key = primaryHex.trim().toLowerCase();
  return PASTEL_BY_PRIMARY[key] ?? '#ffffff';
}

function atsColor(v: number) {
  return v >= 70 ? STATUS_GREEN : v >= 55 ? STATUS_AMBER : STATUS_RED;
}
function atsStatus(v: number): [string, string] {
  return v >= 70
    ? ['Solid match', 'mc-status mc-status-strong']
    : v >= 55
      ? ['Partial match', 'mc-status mc-status-likely']
      : ['Weak match', 'mc-status mc-status-weak'];
}
function hireStatus(v: number) {
  return v >= 75 ? 'Very likely' : v >= 60 ? 'Likely' : 'Moderate';
}
function hireColor(v: number) {
  return v >= 75 ? STATUS_GREEN : v >= 60 ? STATUS_AMBER : STATUS_RED;
}

function useArcAnimation(score: number, arcLen: number, dashOffset: number) {
  const pathRef = useCallback(
    (el: SVGPathElement | null) => {
      if (!el) return;
      el.style.strokeDasharray = String(arcLen);
      el.style.strokeDashoffset = String(arcLen);
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) 0.15s';
        requestAnimationFrame(() => {
          el.style.strokeDashoffset = String(dashOffset);
        });
      });
    },
    [arcLen, dashOffset, score]
  );
  return pathRef;
}

function AtsRadialChart({ score, color }: { score: number; color: string }) {
  const uid = useId().replace(/:/g, '');
  const W = 160;
  const H = 100;
  const cx = W / 2;
  const cy = 60;
  const R = 50;
  const startDeg = 150;
  const sweepDeg = 240;
  const toRad = (d: number) => (d * Math.PI) / 180;

  function arcPath(start: number, sweep: number) {
    const pts: string[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const deg = start + (sweep * i) / steps;
      const r = toRad(deg);
      pts.push(`${(cx + R * Math.cos(r)).toFixed(1)},${(cy + R * Math.sin(r)).toFixed(1)}`);
    }
    return 'M' + pts.join(' L');
  }

  const trackPath = arcPath(startDeg, sweepDeg);
  const fillSweep = (sweepDeg * score) / 100;
  const fillPath = arcPath(startDeg, fillSweep);
  const arcLen = Number(((2 * Math.PI * R * sweepDeg) / 360).toFixed(1));
  const dashOffset = Number((arcLen * (1 - score / 100)).toFixed(1));
  const pathRef = useArcAnimation(score, arcLen, dashOffset);

  const ticks = [0, 25, 50, 75, 100]
    .map((t) => {
      const deg = startDeg + (sweepDeg * t) / 100;
      const r = toRad(deg);
      const inner = R - 6;
      const outer = R + 2;
      return (
        <line
          key={t}
          x1={(cx + inner * Math.cos(r)).toFixed(1)}
          y1={(cy + inner * Math.sin(r)).toFixed(1)}
          x2={(cx + outer * Math.cos(r)).toFixed(1)}
          y2={(cy + outer * Math.sin(r)).toFixed(1)}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
      );
    });

  const arcStartX = cx + R * Math.cos(toRad(startDeg));
  const arcStartY = cy + R * Math.sin(toRad(startDeg));
  const arcEndX = cx + R * Math.cos(toRad(startDeg + sweepDeg));
  const arcEndY = cy + R * Math.sin(toRad(startDeg + sweepDeg));

  return (
    <svg className="mc-viz mx-auto block h-auto w-full max-w-[160px]" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`arcGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <path d={trackPath} fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
      <path
        ref={pathRef}
        d={fillPath}
        fill="none"
        stroke={`url(#arcGrad-${uid})`}
        strokeWidth="8"
        strokeLinecap="round"
      />
      {ticks}
      <text x={cx} y={cy + 2} textAnchor="middle" className="fill-current text-[22px] font-bold" style={{ fill: color }}>
        {score}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        className="text-[9px] fill-slate-500"
        style={{ letterSpacing: '0.05em' }}
      >
        ATS SCORE
      </text>
      <text x={arcStartX - 6} y={arcStartY + 14} textAnchor="middle" className="text-[8px] fill-slate-500">
        0
      </text>
      <text x={arcEndX + 6} y={arcEndY + 14} textAnchor="middle" className="text-[8px] fill-slate-500">
        100
      </text>
    </svg>
  );
}

function HireBellChart({ hire, color }: { hire: number; color: string }) {
  const uid = useId().replace(/:/g, '');
  const W = 180;
  const H = 110;
  const baseY = 105;
  const curveH = 80;
  const mu = 65;
  const sigma = 18;
  const gauss = (x: number) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2);

  const pts: string[] = [];
  for (let x = 0; x <= 100; x += 1.5) {
    const px = (x / 100) * (W - 20) + 10;
    const py = baseY - gauss(x) * curveH;
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const curvePath = 'M' + pts.join(' L');

  const fillPts: string[] = [];
  for (let x = 0; x <= hire; x += 1.5) {
    const px = (x / 100) * (W - 20) + 10;
    const py = baseY - gauss(x) * curveH;
    fillPts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const hireX = Number(((hire / 100) * (W - 20) + 10).toFixed(1));
  const fillPath = `M10,${baseY} L${fillPts.join(' L')} L${hireX},${baseY} Z`;

  const avg = 65;
  const avgX = Number(((avg / 100) * (W - 20) + 10).toFixed(1));
  const avgY = Number((baseY - gauss(avg) * curveH).toFixed(1));
  const candY = Number((baseY - gauss(hire) * curveH).toFixed(1));
  const gradId = `bellGrad-${uid}`;
  const clipId = `bellClip-${uid}`;

  return (
    <svg className="mc-viz mx-auto block h-auto w-full max-w-[180px]" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="0" height={H}>
            <animate
              attributeName="width"
              from="0"
              to={String(W)}
              dur="1s"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
              fill="freeze"
              begin="0.2s"
            />
          </rect>
        </clipPath>
      </defs>
      <line x1="10" y1={baseY} x2={W - 10} y2={baseY} stroke="#e2e8f0" strokeWidth="1" />
      <path d={fillPath} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
      <path d={curvePath} fill="none" stroke="#cbd5e1" strokeWidth="1.2" className="job-board-curve-line" />
      <line x1={avgX} y1={baseY} x2={avgX} y2={avgY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
      <text x={avgX - 4} y={baseY - 20} textAnchor="end" className="text-[9px] fill-slate-500" style={{ fontFamily: 'system-ui, sans-serif' }}>
        avg
      </text>
      <circle cx={hireX} cy={candY} r="4.5" fill={color} opacity={0.9} />
      <circle cx={hireX} cy={candY} r="2" fill="white" />
      <text x={hireX} y={candY - 14} textAnchor="middle" className="text-[11px] font-bold" style={{ fill: color, fontFamily: 'system-ui, sans-serif' }}>
        {hire}%
      </text>
      <text x={hireX} y={candY - 5} textAnchor="middle" className="text-[9px] font-semibold" style={{ fill: color, fontFamily: 'system-ui, sans-serif' }}>
        you
      </text>
    </svg>
  );
}

function SalaryPercentileChart({ salaryStr, color }: { salaryStr: string; color: string }) {
  const uid = useId().replace(/:/g, '');
  const W = 180;
  const H = 94;
  const nums = (salaryStr.match(/\d+/g) || []).map(Number);
  const hasSalary = nums.length > 0;
  let lo = nums[0] || 10;
  let hi = nums.length === 1 ? nums[0] : nums[1] || 15;

  let p10 = 4;
  let p90 = 28;
  if (hasSalary) {
    if (hi <= 7) {
      p10 = 1;
      p90 = 7;
    } else if (hi <= 14) {
      p10 = 2;
      p90 = 14;
    } else if (hi <= 28) {
      p10 = 4;
      p90 = 28;
    } else if (hi <= 50) {
      p10 = 10;
      p90 = 50;
    } else {
      p10 = 20;
      p90 = 80;
    }
    if (lo < p10) {
      if (lo <= 2) p10 = 1;
      else if (lo <= 4) p10 = 2;
      else p10 = Math.floor(lo);
    }
  }

  const toX = (v: number) => 12 + ((Math.min(Math.max(v, p10), p90) - p10) / (p90 - p10)) * (W - 24);

  const midVal = (lo + hi) / 2;
  const loX = toX(lo).toFixed(1);
  const hiX = toX(hi).toFixed(1);
  const midX = toX(midVal).toFixed(1);
  const bandY = 62;
  const bandH = 12;
  const salGradId = `salGrad-${uid}`;
  const salClipId = `salClip-${uid}`;

  const pctLabels = Array.from({ length: 5 }, (_, i) => {
    const v = p10 + (p90 - p10) * (i / 4);
    const vStr = Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, '');
    const plus = i === 4 ? '+' : '';
    return { label: `₹${vStr}L${plus}`, v };
  });

  return (
    <svg className="mc-viz mx-auto block h-auto w-full max-w-[180px]" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={salGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BBF7D0" />
          <stop offset="40%" stopColor="#4ADE80" />
          <stop offset="70%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <clipPath id={salClipId}>
          <rect x="0" y="0" width="0" height={H}>
            <animate
              attributeName="width"
              from="0"
              to={String(W)}
              dur="0.9s"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
              fill="freeze"
              begin="0.15s"
            />
          </rect>
        </clipPath>
      </defs>
      <text x={W / 2} y="30" textAnchor="middle" className="fill-slate-900 text-xs font-semibold" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {hasSalary ? salaryStr : 'Salary not disclosed'}
      </text>
      <text x={W / 2} y="42" textAnchor="middle" className="text-[8px] fill-slate-500" style={{ fontFamily: 'system-ui, sans-serif' }}>
        company offer
      </text>
      <rect x="12" y={bandY} width={W - 24} height={bandH} rx="4" fill="#f1f5f9" />
      <rect
        x="12"
        y={bandY}
        width={W - 24}
        height={bandH}
        rx="4"
        fill={`url(#${salGradId})`}
        opacity={0.7}
        clipPath={`url(#${salClipId})`}
      />
      {pctLabels.map((p) => {
        const tx = toX(p.v).toFixed(1);
        return (
          <g key={p.label}>
            <line x1={tx} y1={bandY + bandH} x2={tx} y2={bandY + bandH + 3} stroke="#e2e8f0" strokeWidth="1" />
            <text x={tx} y={bandY + bandH + 13} textAnchor="middle" className="text-[9px] font-medium fill-slate-500" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {p.label}
            </text>
          </g>
        );
      })}
      {hasSalary ? (
        <>
          {lo !== hi ? (
            <>
              <line
                x1={loX}
                y1={bandY - 4}
                x2={hiX}
                y2={bandY - 4}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                className="job-board-pct-marker"
              />
              <line x1={loX} y1={bandY - 7} x2={loX} y2={bandY} stroke={color} strokeWidth="1.5" className="job-board-pct-marker" />
              <line x1={hiX} y1={bandY - 7} x2={hiX} y2={bandY} stroke={color} strokeWidth="1.5" className="job-board-pct-marker" />
            </>
          ) : null}
          <polygon
            className="job-board-pct-marker"
            points={`${midX},${bandY - 8} ${Number(midX) + 4},${bandY - 4} ${midX},${bandY} ${Number(midX) - 4},${bandY - 4}`}
            fill={color}
          />
        </>
      ) : null}
    </svg>
  );
}

export type WorkspaceJobBoardMatchCardsProps = {
  atsScore: number;
  hireProbability: number;
  salaryRangeLabel: string;
  foundKeywordTags: string[];
  missingSkillNames: string[];
  userYearsExperience: number;
  roleAvgYears: number;
  /** When true, back of salary card shows market estimate copy */
  salaryDisclosed: boolean;
  /** Shown on back of market card when salary is missing */
  marketEstimateRange: string;
};

export function WorkspaceJobBoardMatchCards({
  atsScore,
  hireProbability,
  salaryRangeLabel,
  foundKeywordTags,
  missingSkillNames,
  userYearsExperience,
  roleAvgYears,
  salaryDisclosed,
  marketEstimateRange,
}: WorkspaceJobBoardMatchCardsProps) {
  const [flipped, setFlipped] = useState({ ats: false, hire: false, val: false });
  const ac = atsColor(atsScore);
  const hc = hireColor(hireProbability);
  const atsPastelBg = pastelFromPrimary(ac);
  const hirePastelBg = pastelFromPrimary(hc);
  const marketPastelBg = '#f0fdf4';
  const [atsL, atsCls] = atsStatus(atsScore);
  const hireLbl = hireStatus(hireProbability);
  const hCls =
    hireProbability >= 75
      ? 'mc-status mc-status-strong'
      : hireProbability >= 60
        ? 'mc-status mc-status-likely'
        : 'mc-status mc-status-weak';

  const youPct = Math.min((userYearsExperience / 10) * 100, 100);
  const rolePct = Math.min((roleAvgYears / 10) * 100, 100);

  const salRange = salaryDisclosed ? salaryRangeLabel : marketEstimateRange || '₹12L - ₹18L';
  const isTBD = !salaryDisclosed;
  const salaryLabel = isTBD ? 'Market Estimate' : 'Estimated Range';
  const leverageLevel = hireProbability >= 75 ? 'Strong' : hireProbability >= 60 ? 'Moderate' : 'Low';
  const leverageColor = hireProbability >= 75 ? '#15803d' : hireProbability >= 60 ? '#ca8a04' : '#b91c1c';

  let leverageBars: ReactNode;
  if (hireProbability >= 75) {
    leverageBars = (
      <>
        <div className="bc-lev-bar active-1" />
        <div className="bc-lev-bar active-2" />
        <div className="bc-lev-bar active-3" />
        <div className="bc-lev-bar active-4" />
      </>
    );
  } else if (hireProbability >= 60) {
    leverageBars = (
      <>
        <div className="bc-lev-bar active-1" />
        <div className="bc-lev-bar active-2" />
        <div className="bc-lev-bar" style={{ background: '#ca8a04' }} />
        <div className="bc-lev-bar" />
      </>
    );
  } else {
    leverageBars = (
      <>
        <div className="bc-lev-bar" style={{ background: '#fca5a5' }} />
        <div className="bc-lev-bar" style={{ background: '#b91c1c' }} />
        <div className="bc-lev-bar" />
        <div className="bc-lev-bar" />
      </>
    );
  }

  const toggle = (key: keyof typeof flipped) => {
    if (typeof window !== 'undefined' && window.getSelection()?.toString()) return;
    setFlipped((p) => ({ ...p, [key]: !p[key] }));
  };

  const found = foundKeywordTags.slice(0, 3);
  const missing =
    missingSkillNames.length > 0 ? missingSkillNames.slice(0, 2) : ['Cloud Infrastructure'];

  useEffect(() => {
    setFlipped({ ats: false, hire: false, val: false });
  }, [atsScore, hireProbability, salaryRangeLabel]);

  const flipInner = (isFlipped: boolean) =>
    `relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`;

  const faceFrontBase =
    'mc-front absolute inset-0 flex h-full w-full flex-col rounded-xl border-[0.5px] border-slate-200 p-3 shadow-sm [backface-visibility:hidden]';
  const faceBack =
    'absolute inset-0 flex h-full w-full flex-col rounded-xl border-[0.5px] border-slate-200 bg-white p-3 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]';

  return (
    <div className="match-cards mb-3.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
      {/* ATS */}
      <div className="group relative h-[175px] cursor-pointer [perspective:1000px]" onClick={() => toggle('ats')}>
        <div className={flipInner(flipped.ats)}>
          <div className={faceFrontBase} style={{ backgroundColor: atsPastelBg }}>
            <div className="mc-header mb-2 flex items-center justify-between">
              <span className="mc-label-text text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">ATS Match</span>
              <span className="text-[9px] text-slate-500" style={{ fontFamily: 'system-ui, sans-serif' }}>
                keyword fit
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <AtsRadialChart score={Math.round(atsScore)} color={ac} />
            </div>
            <div className="mc-footer-row mt-auto flex items-center justify-between border-t border-slate-200 pt-2">
              <span className={atsCls}>{atsL}</span>
              <span className="mc-cta text-[10.5px] font-semibold text-slate-800 hover:underline">Gap analysis {'\u2192'}</span>
            </div>
          </div>
          <div className={faceBack}>
            <div className="relative mb-2 flex shrink-0 items-start gap-2">
              <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-600">
                <ClipboardList className="h-3 w-3" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-[11.5px] font-bold text-slate-900">Gap Analysis</p>
                <p className="text-[8.5px] text-slate-500">ATS Compatibility Report</p>
              </div>
              <button
                type="button"
                className="bc-close absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-[0.5px] border-slate-300 bg-[#e2e8f0] p-0 leading-none text-slate-900 transition-all hover:scale-110 hover:bg-slate-300"
                aria-label="Close"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  setFlipped((p) => ({ ...p, ats: false }));
                }}
              >
                <X className="h-[9px] w-[9px]" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <span className="mb-1 block text-[9.5px] font-semibold text-slate-900">Found Keywords</span>
              <div className="mb-2 flex flex-wrap gap-1">
                {found.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                  >
                    <CheckCircle2 className="h-2.5 w-2.5 text-orange-600" strokeWidth={2.5} />
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex min-h-0 flex-1 flex-col rounded-md border border-red-200 bg-red-50 p-1.5">
                <div className="mb-1 flex items-center gap-1 text-[9px] font-bold text-red-700">
                  <AlertTriangle className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} />
                  Missing Critical Skills
                </div>
                <div className="max-h-[52px] overflow-y-auto pr-0.5">
                  <div className="flex flex-wrap gap-1">
                    {missing.map((s, i) => (
                      <span
                        key={`${s}-${i}`}
                        className="inline-flex rounded border border-red-300 bg-white px-1.5 py-0.5 text-[9px] font-medium text-red-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hire */}
      <div className="group relative h-[175px] cursor-pointer [perspective:1000px]" onClick={() => toggle('hire')}>
        <div className={flipInner(flipped.hire)}>
          <div className={faceFrontBase} style={{ backgroundColor: hirePastelBg }}>
            <div className="mc-header mb-2 flex w-full items-center">
              <span className="mc-label-text shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Hire Probability
              </span>
              <span
                className="mx-1 flex-1 text-center text-[8.5px] italic text-slate-500 opacity-60"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                vs
              </span>
              <span className="shrink-0 text-[9px] text-slate-500" style={{ fontFamily: 'system-ui, sans-serif' }}>
                applicant pool
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <HireBellChart hire={Math.min(100, Math.max(0, hireProbability))} color={hc} />
            </div>
            <div className="mc-footer-row mt-auto flex items-center justify-between border-t border-slate-200 pt-2">
              <span className={hCls}>{hireLbl}</span>
              <span className="mc-cta text-[10.5px] font-semibold text-slate-800 hover:underline">View insights {'\u2192'}</span>
            </div>
          </div>
          <div className={faceBack}>
            <div className="relative mb-2 flex shrink-0 items-start gap-2">
              <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-yellow-100 text-amber-600">
                <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
              </div>
              <div className="leading-tight">
                <p className="text-[11.5px] font-bold text-slate-900">Probability Insights</p>
                <p className="text-[8.5px] text-slate-500">Why you stand out</p>
              </div>
              <button
                type="button"
                className="bc-close absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-[0.5px] border-slate-300 bg-[#e2e8f0] p-0 leading-none text-slate-900 transition-all hover:scale-110 hover:bg-slate-300"
                aria-label="Close"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  setFlipped((p) => ({ ...p, hire: false }));
                }}
              >
                <X className="h-[9px] w-[9px]" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-0.5">
              <span className="mb-1 block text-[9.5px] font-semibold text-slate-900">Experience Benchmark</span>
              <div className="bc-bar-row mb-2 flex flex-col gap-1">
                <span className="bc-bar-lbl text-[8.5px] font-bold text-slate-900">
                  You ({userYearsExperience} Yrs)
                </span>
                <div className="bc-bar-track flex h-1 w-full overflow-hidden rounded-sm bg-slate-200">
                  <div className="bc-bar-fill h-full rounded-sm bg-amber-400 transition-all" style={{ width: `${youPct}%` }} />
                </div>
              </div>
              <div className="bc-bar-row mb-0 flex flex-col gap-1">
                <span className="bc-bar-lbl text-[8.5px] font-medium text-slate-600">
                  Role Avg ({roleAvgYears} Yrs)
                </span>
                <div className="bc-bar-track flex h-1 w-full overflow-hidden rounded-sm bg-slate-200">
                  <div className="bc-bar-fill h-full rounded-sm bg-slate-300 transition-all" style={{ width: `${rolePct}%` }} />
                </div>
              </div>
              <div className="bc-alert-box mt-auto mb-0 flex items-start gap-1.5 rounded-md border border-yellow-200 bg-yellow-50 p-1.5">
                <span className="bc-alert-dot mt-0.5 h-1 w-1 shrink-0 rounded-full bg-yellow-500" />
                <div className="bc-alert-content flex flex-col gap-0.5">
                  <span className="bc-alert-title text-[9px] font-bold text-slate-900">High Demand Alert</span>
                  <span className="bc-alert-desc text-[8px] leading-snug text-slate-600">
                    Roles are up 24% YoY in your region.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market */}
      <div className="group relative h-[175px] cursor-pointer [perspective:1000px]" onClick={() => toggle('val')}>
        <div className={flipInner(flipped.val)}>
          <div className={faceFrontBase} style={{ backgroundColor: marketPastelBg }}>
            <div className="mc-header mb-2 flex w-full items-center">
              <span className="mc-label-text shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Market Value
              </span>
              <span
                className="mr-1 flex-1 text-right text-[9px] text-slate-500"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                company{' '}
                <span className="text-[8.5px] italic opacity-60" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  vs
                </span>
              </span>
              <span className="shrink-0 text-[9px] text-slate-500" style={{ fontFamily: 'system-ui, sans-serif' }}>
                market
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <SalaryPercentileChart salaryStr={salaryDisclosed ? salaryRangeLabel : 'Not listed'} color={STATUS_GREEN} />
            </div>
            <div className="mc-footer-row mt-auto flex items-center justify-between border-t border-slate-200 pt-2">
              <span className="mc-status text-[11px] font-medium" style={{ background: '#EAF3DE', color: '#27500A' }}>
                Market rate
              </span>
              <span className="mc-cta text-[10.5px] font-semibold text-slate-800 hover:underline">Negotiate {'\u2197'}</span>
            </div>
          </div>
          <div className={faceBack}>
            <div className="relative mb-2 flex shrink-0 items-start gap-2">
              <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-emerald-100 text-green-700">
                <DollarSign className="h-3 w-3" strokeWidth={2.5} />
              </div>
              <div className="leading-tight">
                <p className="text-[11.5px] font-bold text-slate-900">Benchmarking</p>
                <p className="text-[8.5px] text-slate-500">Base Compensation</p>
              </div>
              <button
                type="button"
                className="bc-close absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-[0.5px] border-slate-300 bg-[#e2e8f0] p-0 leading-none text-slate-900 transition-all hover:scale-110 hover:bg-slate-300"
                aria-label="Close"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  setFlipped((p) => ({ ...p, val: false }));
                }}
              >
                <X className="h-[9px] w-[9px]" strokeWidth={2.5} />
              </button>
            </div>
            <div className="bc-body flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="bc-salary-wrapper mb-2 flex flex-col items-center rounded-md bg-slate-50 px-2 py-2">
                <span className="bc-salary-lbl text-[8px] font-bold uppercase tracking-wider text-slate-500">{salaryLabel}</span>
                <span className="bc-salary-val text-base font-extrabold text-slate-900">{salRange}</span>
                {isTBD ? (
                  <span
                    className="bc-salary-pill mt-1 inline-flex items-center gap-0.5 rounded-[10px] border px-1.5 py-0.5 text-[8.5px] font-semibold"
                    style={{ color: '#ca8a04', borderColor: '#fef08a', background: '#fefce8' }}
                  >
                    <Info className="h-2 w-2 shrink-0" strokeWidth={2.5} aria-hidden />
                    Co. did not disclose
                  </span>
                ) : (
                  <span className="bc-salary-pill mt-1 inline-flex items-center gap-0.5 rounded-[10px] border border-emerald-200 bg-white px-1.5 py-0.5 text-[8.5px] font-semibold text-green-800">
                    <TrendingUp className="h-2 w-2 shrink-0" strokeWidth={3} aria-hidden />
                    +12% above average
                  </span>
                )}
              </div>
              <div className="bc-lev-row mb-1 flex items-center justify-between">
                <span className="bc-label m-0 text-[9.5px] font-semibold text-slate-900">Negotiation Leverage</span>
                <span className="bc-lev-val text-[9px] font-bold" style={{ color: leverageColor }}>
                  {leverageLevel}
                </span>
              </div>
              <div className="bc-lev-bars mb-2 flex h-[5px] w-full gap-[3px] overflow-hidden rounded-sm">{leverageBars}</div>
            </div>
            <div className="bc-footer mt-auto flex shrink-0 items-center justify-between border-t border-slate-200 pt-1.5">
              <span className="bc-footer-text text-[7.5px] font-bold uppercase tracking-wider text-slate-500">
                Data Sources
              </span>
              <div className="flex items-center gap-2 text-[8px] font-medium text-slate-600">
                <span className="inline-flex items-center gap-0.5">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                  Levels
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Market
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
