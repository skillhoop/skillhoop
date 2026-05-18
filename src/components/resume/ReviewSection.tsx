import React, { useCallback, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Flag,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useResume } from '../../context/ResumeContext';
import type { ResumeData } from '../../types/resume';
import {
  analyzeCompetitorResumes,
  analyzeResumeATS,
  type ATSAnalysisResult,
  type CompetitorAnalysisResult,
} from '../../lib/resumeAI';
import { resumeToHTML } from '../../lib/resumeToHTML';

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ');

interface ReviewSectionProps {
  onNavigateToCopilot?: () => void;
}

const MetricBar = ({
  label,
  score,
  colorClass = 'bg-slate-600',
}: {
  label: string;
  score: number;
  colorClass?: string;
}) => (
  <div className="space-y-1.5 min-w-0">
    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 gap-2">
      <span className="truncate">{label}</span>
      <span className="text-slate-900 shrink-0">{score}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
      />
    </div>
  </div>
);

type AuditCardType = 'error' | 'warning' | 'success';

interface AuditCardProps {
  type: AuditCardType;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}

const ScoreRing = ({
  value,
  label,
  strokeClass = 'text-emerald-500',
}: {
  value: number;
  label: string;
  strokeClass?: string;
}) => {
  const radius = 36;
  const circum = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circum - (clamped / 100) * circum;

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative flex items-center justify-center">
        <svg className="w-20 h-20 -rotate-90">
          <circle className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" r={radius} cx="40" cy="40" />
          <circle
            className={`${strokeClass} transition-all duration-1000 ease-in-out`}
            strokeWidth="6"
            strokeDasharray={circum}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="40"
            cy="40"
          />
        </svg>
        <span className="absolute text-lg font-bold text-slate-900">{clamped}</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">{label}</span>
    </div>
  );
};

const AuditCard = ({ type, title, description, action, onAction }: AuditCardProps) => {
  const styles: Record<AuditCardType, { icon: React.ReactNode; bg: string; border: string }> = {
    error: { icon: <XCircle className="text-red-500 shrink-0" />, bg: 'bg-red-50/50', border: 'border-red-100' },
    warning: { icon: <AlertTriangle className="text-amber-500 shrink-0" />, bg: 'bg-amber-50/50', border: 'border-amber-100' },
    success: { icon: <CheckCircle2 className="text-emerald-500 shrink-0" />, bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
  };
  const style = styles[type];

  return (
    <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${style.bg} ${style.border}`}>
      <div className="flex gap-3">
        <div className="mt-0.5">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 break-words">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed break-words">{description}</p>
          {action && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 text-xs font-bold text-slate-600 hover:text-slate-700 flex items-center gap-1 group"
            >
              {action} <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface BenchmarkMarkerProps {
  score: number;
  label: string;
  sublabel: string;
  pinClass: string;
  flagClass: string;
}

const BenchmarkMarker = ({ score, label, sublabel, pinClass, flagClass }: BenchmarkMarkerProps) => {
  const left = Math.max(4, Math.min(96, score));

  return (
    <div
      className="absolute top-0 flex flex-col items-center -translate-x-1/2 z-10"
      style={{ left: `${left}%` }}
      title={`${label}: ${score}`}
    >
      <div className={cn('flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold whitespace-nowrap shadow-sm border', flagClass)}>
        <Flag size={8} className="shrink-0" />
        <span>{score}</span>
      </div>
      <div className={cn('w-0.5 h-6 mt-0.5', pinClass)} />
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide mt-1 text-center max-w-[72px] leading-tight break-words">
        {label}
      </span>
      <span className="text-[7px] text-slate-400 text-center max-w-[72px] leading-tight">{sublabel}</span>
    </div>
  );
};

const MarketPositioningCard = ({
  data,
  roleLabel,
  showPrecisionHint,
}: {
  data: CompetitorAnalysisResult;
  roleLabel: string;
  showPrecisionHint: boolean;
}) => {
  const clampedPercentile = Math.max(0, Math.min(100, Math.round(data.percentileRank)));

  return (
    <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50/80">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Market Positioning</h4>
          {roleLabel ? (
            <p className="text-[10px] text-slate-500 mt-1 truncate">Benchmarked for: {roleLabel}</p>
          ) : null}
          {showPrecisionHint && (
            <p className="text-[10px] text-amber-600 mt-1 leading-snug">
              Add a target job title in the Sections tab for precision market benchmarking.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-100 rounded-lg shadow-sm shrink-0">
          <TrendingUp size={16} className="text-emerald-600 shrink-0" />
          <p className="text-[10px] font-bold text-slate-700 leading-snug">
            Your resume ranks in the <span className="text-emerald-600">{clampedPercentile}th percentile</span> of applicants
            {roleLabel ? ` for ${roleLabel}` : ' in this role'}.
          </p>
        </div>
      </div>

      <div className="relative pt-2 pb-14 px-1">
        <div className="h-3 w-full rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-emerald-100 border border-slate-200" />
        <div className="absolute top-5 left-0 right-0 h-8">
          <BenchmarkMarker
            score={data.industryAverage}
            label="Industry Avg"
            sublabel="Baseline"
            pinClass="bg-slate-400"
            flagClass="bg-white border-slate-200 text-slate-600"
          />
          <BenchmarkMarker
            score={data.topPerformersAverage}
            label="Top 10%"
            sublabel="Elite peers"
            pinClass="bg-emerald-500"
            flagClass="bg-emerald-50 border-emerald-200 text-emerald-700"
          />
          <BenchmarkMarker
            score={data.yourScore}
            label="You"
            sublabel="Your profile"
            pinClass="bg-slate-700"
            flagClass="bg-slate-700 border-slate-800 text-white"
          />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

const PeerInsightsPanel = ({
  data,
  onNavigateToCopilot,
}: {
  data: CompetitorAnalysisResult;
  onNavigateToCopilot?: () => void;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
    <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 min-w-0">
      <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <CheckCircle2 size={12} className="shrink-0" /> Market Advantages
      </h4>
      <ul className="space-y-2">
        {data.strengths.length > 0 ? (
          data.strengths.map((item, i) => (
            <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2 break-words">
              <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-xs text-slate-500 italic">No distinct advantages identified yet.</li>
        )}
      </ul>
    </div>
    <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 min-w-0">
      <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <AlertTriangle size={12} className="shrink-0" /> Competitive Vulnerabilities
      </h4>
      <ul className="space-y-2 mb-3">
        {data.weaknesses.length > 0 ? (
          data.weaknesses.map((item, i) => (
            <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2 break-words">
              <span className="text-amber-500 shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-xs text-slate-500 italic">No critical gaps vs. top peers detected.</li>
        )}
      </ul>
      {onNavigateToCopilot && (
        <button
          type="button"
          onClick={onNavigateToCopilot}
          className="w-full text-left text-[10px] font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 group border-t border-amber-200/80 pt-3"
        >
          <Bot size={12} className="shrink-0" />
          <span className="break-words">Remediate gaps with AI Copilot</span>
          <ChevronRight size={12} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  </div>
);

const SCAN_STEPS = [
  'Parsing sections...',
  'Analyzing semantic structure...',
  'Checking ATS keywords...',
  'Benchmarking against industry peers...',
  'Measuring quantifiable impact...',
  'Validating readability...',
] as const;

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Work';
}

function getScoreBadgeClass(score: number): string {
  if (score >= 85) return 'bg-emerald-100 text-emerald-700';
  if (score >= 70) return 'bg-sky-100 text-sky-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function getRingStrokeClass(score: number): string {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

function getMetricBarColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function buildTargetJobDescription(targetJob: { title: string; description: string; industry: string }): string | undefined {
  const parts = [targetJob.title, targetJob.description, targetJob.industry].filter((p) => p.trim().length > 0);
  return parts.length > 0 ? parts.join('\n\n') : undefined;
}

function resolveBenchmarkContext(state: ResumeData) {
  const hasExplicitTarget = Boolean(state.targetJob.title?.trim() || state.targetJob.industry?.trim());
  const industry = state.targetJob.industry?.trim() || 'Technology';
  const jobTitle =
    state.targetJob.title?.trim() ||
    state.personalInfo.jobTitle?.trim() ||
    'Product Designer';
  const roleLabel =
    state.targetJob.title?.trim() ||
    state.personalInfo.jobTitle?.trim() ||
    '';

  return { industry, jobTitle, roleLabel, hasExplicitTarget };
}

function buildAuditCards(result: ATSAnalysisResult): AuditCardProps[] {
  const cards: AuditCardProps[] = [];

  result.breakdown.sectionCompleteness.missingSections.forEach((section) => {
    cards.push({
      type: 'error',
      title: `Missing Section: ${section}`,
      description:
        result.breakdown.sectionCompleteness.feedback ||
        `Your resume is missing a "${section}" section. Add it to improve ATS completeness.`,
    });
  });

  result.breakdown.actionVerbs.weakVerbs.forEach((verb) => {
    const alternatives = result.breakdown.actionVerbs.strongAlternatives.slice(0, 3).join(', ');
    cards.push({
      type: 'warning',
      title: `Weak Action Verb: "${verb}"`,
      description: alternatives
        ? `${result.breakdown.actionVerbs.feedback} Try: ${alternatives}.`
        : result.breakdown.actionVerbs.feedback,
    });
  });

  result.topImprovements.forEach((improvement, index) => {
    cards.push({
      type: 'warning',
      title: `Top Improvement ${index + 1}`,
      description: improvement,
    });
  });

  const strongMetrics: { label: string; score: number; feedback: string }[] = [
    { label: 'Keyword Optimization', score: result.breakdown.keywordOptimization.score, feedback: result.breakdown.keywordOptimization.feedback },
    { label: 'Formatting', score: result.breakdown.formatting.score, feedback: result.breakdown.formatting.feedback },
    { label: 'Section Completeness', score: result.breakdown.sectionCompleteness.score, feedback: result.breakdown.sectionCompleteness.feedback },
    { label: 'Action Verbs', score: result.breakdown.actionVerbs.score, feedback: result.breakdown.actionVerbs.feedback },
    { label: 'Quantifiable Achievements', score: result.breakdown.quantifiableAchievements.score, feedback: result.breakdown.quantifiableAchievements.feedback },
    { label: 'Readability', score: result.breakdown.readability.score, feedback: result.breakdown.readability.feedback },
  ];

  strongMetrics.forEach((metric) => {
    if (metric.score >= 85) {
      cards.push({
        type: 'success',
        title: `Strong ${metric.label}`,
        description: metric.feedback,
      });
    }
  });

  if (cards.length === 0) {
    cards.push({
      type: 'success',
      title: 'Analysis Complete',
      description: 'No critical issues detected. Review the score breakdown above for fine-tuning opportunities.',
    });
  }

  return cards;
}

export default function ReviewSection({ onNavigateToCopilot }: ReviewSectionProps) {
  const { state } = useResume();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [competitorResult, setCompetitorResult] = useState<CompetitorAnalysisResult | null>(null);

  const benchmarkContext = useMemo(() => resolveBenchmarkContext(state), [state]);

  const handleRunScan = useCallback(async () => {
    setIsScanning(true);
    setScanComplete(false);
    setAnalysisResult(null);
    setCompetitorResult(null);
    setScanStep(0);

    let step = 0;
    const stepInterval = window.setInterval(() => {
      step = Math.min(step + 1, SCAN_STEPS.length - 1);
      setScanStep(step);
    }, 900);

    try {
      const resumeHTML = resumeToHTML(state);
      const targetJobDescription = buildTargetJobDescription(state.targetJob);
      const { industry, jobTitle } = benchmarkContext;

      const [atsResult, competitorAnalysis] = await Promise.all([
        analyzeResumeATS(resumeHTML, targetJobDescription),
        analyzeCompetitorResumes(resumeHTML, industry, jobTitle),
      ]);

      setAnalysisResult(atsResult);
      setCompetitorResult(competitorAnalysis);
      setScanComplete(true);
    } catch (error) {
      console.error('Resume analysis failed:', error);
      toast.error('ATS analysis failed or timed out. Please try again.');
      setScanComplete(false);
      setAnalysisResult(null);
      setCompetitorResult(null);
    } finally {
      window.clearInterval(stepInterval);
      setIsScanning(false);
      setScanStep(0);
    }
  }, [state, benchmarkContext]);

  const auditCards = useMemo(
    () => (analysisResult ? buildAuditCards(analysisResult) : []),
    [analysisResult],
  );

  const issueCount = auditCards.filter((c) => c.type === 'error' || c.type === 'warning').length;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/30 border-r border-slate-200 overflow-x-hidden min-w-0">
      {!scanComplete && !isScanning ? (
        <div className="p-6 flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
            <ShieldCheck size={32} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Resume Quality Audit</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-[220px]">
            Get ATS scoring plus industry benchmarks against peers in your target role.
          </p>
          <button
            type="button"
            onClick={() => void handleRunScan()}
            className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Activity size={18} /> Analyze Resume
          </button>
        </div>
      ) : isScanning ? (
        <div className="p-6 flex flex-col items-center justify-center h-full text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-slate-600 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search size={24} className="text-slate-600 animate-pulse" />
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-800 animate-pulse px-2">{SCAN_STEPS[scanStep]}</h4>
          <div className="w-48 h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-slate-600 transition-all duration-300"
              style={{ width: `${(scanStep / (SCAN_STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      ) : analysisResult ? (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="p-5 bg-white border-b border-slate-200 shrink-0 overflow-x-hidden">
            <div className="flex items-center justify-between mb-6 gap-2 min-w-0">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shrink-0">Audit Score</h3>
              <span
                className={cn(
                  'px-2 py-1 text-[10px] font-bold rounded uppercase shrink-0',
                  getScoreBadgeClass(analysisResult.overallScore),
                )}
              >
                {getScoreLabel(analysisResult.overallScore)}
              </span>
            </div>

            <div className="flex justify-around mb-2 gap-1 flex-wrap">
              <ScoreRing
                value={analysisResult.breakdown.quantifiableAchievements.score}
                label="Impact"
                strokeClass={getRingStrokeClass(analysisResult.breakdown.quantifiableAchievements.score)}
              />
              <ScoreRing
                value={analysisResult.overallScore}
                label="ATS"
                strokeClass={getRingStrokeClass(analysisResult.overallScore)}
              />
              <ScoreRing
                value={analysisResult.breakdown.formatting.score}
                label="Style"
                strokeClass={getRingStrokeClass(analysisResult.breakdown.formatting.score)}
              />
            </div>

            {competitorResult && (
              <MarketPositioningCard
                data={competitorResult}
                roleLabel={benchmarkContext.roleLabel}
                showPrecisionHint={!benchmarkContext.hasExplicitTarget}
              />
            )}

            <div className="space-y-4 mt-6">
              <MetricBar
                label="Action Verbs"
                score={analysisResult.breakdown.actionVerbs.score}
                colorClass={getMetricBarColor(analysisResult.breakdown.actionVerbs.score)}
              />
              <MetricBar
                label="Quantifiable Results"
                score={analysisResult.breakdown.quantifiableAchievements.score}
                colorClass={getMetricBarColor(analysisResult.breakdown.quantifiableAchievements.score)}
              />
              <MetricBar
                label="Keyword Match"
                score={analysisResult.breakdown.keywordOptimization.score}
                colorClass={getMetricBarColor(analysisResult.breakdown.keywordOptimization.score)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar overflow-x-hidden min-w-0">
            {competitorResult && (
              <PeerInsightsPanel data={competitorResult} onNavigateToCopilot={onNavigateToCopilot} />
            )}

            <div className="flex items-center justify-between px-1 gap-2 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {issueCount === 0 ? 'No Critical Issues' : `Found ${issueCount} Issue${issueCount === 1 ? '' : 's'}`}
              </span>
              <button
                type="button"
                onClick={() => void handleRunScan()}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 shrink-0"
              >
                <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} /> Re-scan
              </button>
            </div>

            {auditCards.map((card, index) => (
              <AuditCard
                key={`${card.type}-${card.title}-${index}`}
                type={card.type}
                title={card.title}
                description={card.description}
                action={card.action}
                onAction={card.onAction}
              />
            ))}
          </div>

          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => void handleRunScan()}
              disabled={isScanning}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Zap size={16} /> {isScanning ? 'Re-scanning…' : 'Re-scan Resume'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
