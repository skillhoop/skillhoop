/**
 * Job Insight Cards — Liquid Glass flip-card module for ATS Score, Hire Probability, and Market Value.
 * Cards flip on hover to reveal detailed AI insights.
 */

import React from 'react';

export interface InsightCardProps {
  /** Score 0–100 or null (e.g. for Market Value) */
  initialScore: number | null;
  title: string;
  /** Bullet list shown on card back (ATS match reasons, hire factors) */
  analysisFeatures?: string[];
  /** Shown on back when no score (e.g. Market Value text) */
  description?: string;
  /** Visual variant for border and accent */
  variant: 'violet' | 'emerald' | 'sky';
}

const variantStyles = {
  violet: {
    border: 'border-violet-200/80',
    bg: 'bg-violet-50/80',
    bgGlass: 'bg-violet-50/40 dark:bg-violet-950/30',
    text: 'text-violet-900',
    textMuted: 'text-violet-700/70',
    label: 'text-violet-800/90',
    backBg: 'bg-violet-100/90 dark:bg-violet-900/40',
    backBorder: 'border-violet-200/80',
  },
  emerald: {
    border: 'border-emerald-200/80',
    bg: 'bg-emerald-50/80',
    bgGlass: 'bg-emerald-50/40 dark:bg-emerald-950/30',
    text: 'text-emerald-900',
    textMuted: 'text-emerald-700/70',
    label: 'text-emerald-800/90',
    backBg: 'bg-emerald-100/90 dark:bg-emerald-900/40',
    backBorder: 'border-emerald-200/80',
  },
  sky: {
    border: 'border-sky-200/80',
    bg: 'bg-sky-50/80',
    bgGlass: 'bg-sky-50/40 dark:bg-sky-950/30',
    text: 'text-sky-900',
    textMuted: 'text-sky-700/70',
    label: 'text-sky-800/90',
    backBg: 'bg-sky-100/90 dark:bg-sky-900/40',
    backBorder: 'border-sky-200/80',
  },
};

function InsightCard({ initialScore, title, analysisFeatures, description, variant }: InsightCardProps) {
  const styles = variantStyles[variant];
  const hasBackContent = (analysisFeatures?.length ?? 0) > 0 || (description?.trim() ?? '') !== '';

  return (
    <div
      className="relative w-[280px] min-w-[280px] h-[380px] shrink-0 group cursor-pointer"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ${hasBackContent ? 'group-hover:[transform:rotateY(180deg)]' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front: Liquid Glass face */}
        <div
          className={`absolute inset-0 rounded-2xl border ${styles.border} ${styles.bgGlass} backdrop-blur-xl shadow-lg overflow-hidden`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.03] animate-shimmer pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div className="relative z-10 p-6 h-full flex flex-col justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${styles.label}`}>{title}</p>
            <div className="flex flex-col gap-1">
              {initialScore != null ? (
                <span className={`text-4xl font-bold ${styles.text}`}>{initialScore}%</span>
              ) : (
                <span className={`text-2xl font-bold text-slate-700 dark:text-slate-200`}>
                  {description ?? '—'}
                </span>
              )}
              {initialScore != null && (
                <p className={`text-xs ${styles.textMuted}`}>
                  {variant === 'violet' ? 'Match from job listing' : variant === 'emerald' ? 'Basic alignment' : ''}
                </p>
              )}
            </div>
            {hasBackContent && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Hover to see details</p>
            )}
          </div>
        </div>

        {/* Back: Analysis / description */}
        {hasBackContent && (
          <div
            className={`absolute inset-0 rounded-2xl border ${styles.backBorder} ${styles.backBg} backdrop-blur-xl shadow-lg overflow-hidden`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="p-6 h-full flex flex-col">
              <p className={`text-xs font-semibold uppercase tracking-wider ${styles.label} mb-3`}>{title}</p>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                {analysisFeatures && analysisFeatures.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisFeatures.map((feature, i) => (
                      <li key={i} className={`text-sm ${styles.text} flex items-start gap-2`}>
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : description ? (
                  <p className={`text-sm ${styles.text} leading-relaxed`}>{description}</p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export interface JobInsightCardsProps {
  /** ATS Match score 0–100 */
  matchScore: number | null;
  /** Hire Probability score 0–100 */
  hireProbability: number | null;
  /** Market value string (e.g. from Adzuna) or null for "Competitive" */
  salaryData: string | null;
  /** Optional ATS match reasons shown on card back */
  atsReasons?: string[];
}

export function JobInsightCards({ matchScore, hireProbability, salaryData, atsReasons = [] }: JobInsightCardsProps) {
  const marketDisplay = salaryData?.trim() ?? 'Competitive';
  return (
    <>
      <InsightCard
        initialScore={matchScore}
        title="ATS Match"
        analysisFeatures={atsReasons}
        variant="violet"
      />
      <InsightCard
        initialScore={hireProbability}
        title="Hire Probability"
        analysisFeatures={['High Demand', 'Skill Alignment']}
        variant="emerald"
      />
      <InsightCard
        initialScore={null}
        title="Market Value"
        description={marketDisplay}
        variant="sky"
      />
    </>
  );
}

export default JobInsightCards;
