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
  variant: 'red' | 'amber' | 'emerald';
}

const variantStyles = {
  red: {
    border: 'border-red-200/80',
    bg: 'bg-red-50/80',
    bgGlass: 'bg-red-50/40 dark:bg-red-950/30',
    text: 'text-red-900',
    textMuted: 'text-red-700/70',
    label: 'text-red-800/90',
    backBg: 'bg-red-100/90 dark:bg-red-900/40',
    backBorder: 'border-red-200/80',
  },
  amber: {
    border: 'border-amber-200/80',
    bg: 'bg-amber-50/80',
    bgGlass: 'bg-amber-50/40 dark:bg-amber-950/30',
    text: 'text-amber-900',
    textMuted: 'text-amber-700/70',
    label: 'text-amber-800/90',
    backBg: 'bg-amber-100/90 dark:bg-amber-900/40',
    backBorder: 'border-amber-200/80',
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
                  {variant === 'red' ? 'Match from job listing' : variant === 'amber' ? 'Basic alignment' : ''}
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
  /** ATS Match card */
  ats: { initialScore: number | null; title: string; analysisFeatures: string[] };
  /** Hire Probability card */
  hire: { initialScore: number | null; title: string; analysisFeatures: string[] };
  /** Market Value card (no score, description only) */
  market: { title: string; description: string };
}

export function JobInsightCards({ ats, hire, market }: JobInsightCardsProps) {
  return (
    <div className="flex flex-row overflow-x-auto gap-4 pb-2 custom-scrollbar mb-6" style={{ height: '420px' }}>
      <div className="flex items-center gap-4 min-h-0" style={{ height: '420px' }}>
        <InsightCard
          initialScore={ats.initialScore}
          title={ats.title}
          analysisFeatures={ats.analysisFeatures}
          variant="red"
        />
        <InsightCard
          initialScore={hire.initialScore}
          title={hire.title}
          analysisFeatures={hire.analysisFeatures}
          variant="amber"
        />
        <InsightCard
          initialScore={null}
          title={market.title}
          description={market.description}
          variant="emerald"
        />
      </div>
    </div>
  );
}

export default JobInsightCards;
