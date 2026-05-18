import React, { useCallback, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useResume } from '../../context/ResumeContext';
import { analyzeResumeATS, type ATSAnalysisResult } from '../../lib/resumeAI';
import { resumeToHTML } from '../../lib/resumeToHTML';

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ');

const MetricBar = ({
  label,
  score,
  colorClass = 'bg-slate-600',
}: {
  label: string;
  score: number;
  colorClass?: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
      <span>{label}</span>
      <span className="text-slate-900">{score}%</span>
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
    <div className="flex flex-col items-center gap-2">
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
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
};

const AuditCard = ({ type, title, description, action, onAction }: AuditCardProps) => {
  const styles: Record<AuditCardType, { icon: React.ReactNode; bg: string; border: string }> = {
    error: { icon: <XCircle className="text-red-500" />, bg: 'bg-red-50/50', border: 'border-red-100' },
    warning: { icon: <AlertTriangle className="text-amber-500" />, bg: 'bg-amber-50/50', border: 'border-amber-100' },
    success: { icon: <CheckCircle2 className="text-emerald-500" />, bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
  };
  const style = styles[type];

  return (
    <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${style.bg} ${style.border}`}>
      <div className="flex gap-3">
        <div className="mt-0.5">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
          {action && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 text-xs font-bold text-slate-600 hover:text-slate-700 flex items-center gap-1 group"
            >
              {action} <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SCAN_STEPS = [
  'Parsing sections...',
  'Analyzing semantic structure...',
  'Checking ATS keywords...',
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

export default function ReviewSection() {
  const { state } = useResume();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);

  const handleRunScan = useCallback(async () => {
    setIsScanning(true);
    setScanComplete(false);
    setAnalysisResult(null);
    setScanStep(0);

    let step = 0;
    const stepInterval = window.setInterval(() => {
      step = Math.min(step + 1, SCAN_STEPS.length - 1);
      setScanStep(step);
    }, 900);

    try {
      const resumeHTML = resumeToHTML(state);
      const targetJobDescription = buildTargetJobDescription(state.targetJob);
      const result = await analyzeResumeATS(resumeHTML, targetJobDescription);
      setAnalysisResult(result);
      setScanComplete(true);
    } catch (error) {
      console.error('ATS analysis failed:', error);
      toast.error('ATS analysis failed or timed out. Please try again.');
      setScanComplete(false);
      setAnalysisResult(null);
    } finally {
      window.clearInterval(stepInterval);
      setIsScanning(false);
      setScanStep(0);
    }
  }, [state]);

  const auditCards = useMemo(
    () => (analysisResult ? buildAuditCards(analysisResult) : []),
    [analysisResult],
  );

  const issueCount = auditCards.filter((c) => c.type === 'error' || c.type === 'warning').length;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/30 border-r border-slate-200 overflow-x-hidden">
      {!scanComplete && !isScanning ? (
        <div className="p-6 flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
            <ShieldCheck size={32} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Resume Quality Audit</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-[220px]">Get a comprehensive score and actionable feedback to beat the ATS.</p>
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
          <h4 className="text-sm font-bold text-slate-800 animate-pulse">{SCAN_STEPS[scanStep]}</h4>
          <div className="w-48 h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-slate-600 transition-all duration-300"
              style={{ width: `${(scanStep / (SCAN_STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      ) : analysisResult ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 bg-white border-b border-slate-200 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Audit Score</h3>
              <span
                className={cn(
                  'px-2 py-1 text-[10px] font-bold rounded uppercase',
                  getScoreBadgeClass(analysisResult.overallScore),
                )}
              >
                {getScoreLabel(analysisResult.overallScore)}
              </span>
            </div>

            <div className="flex justify-around mb-8">
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

            <div className="space-y-4">
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar overflow-x-hidden">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {issueCount === 0 ? 'No Critical Issues' : `Found ${issueCount} Issue${issueCount === 1 ? '' : 's'}`}
              </span>
              <button
                type="button"
                onClick={() => void handleRunScan()}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
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

          <div className="p-4 bg-white border-t border-slate-200">
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
