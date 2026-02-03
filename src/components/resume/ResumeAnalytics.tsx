import React, { useMemo, useState, useEffect } from 'react';
import { BarChart3, TrendingUp, FileText, CheckCircle2, AlertCircle, Lightbulb, Target, BookOpen, Loader2, Sparkles, X } from 'lucide-react';
import { 
  calculateResumeAnalytics, 
  getScoreHistory, 
  getSectionCompleteness,
  type ResumeAnalytics,
  type ScoreHistoryPoint,
  type SectionCompleteness,
} from '../../lib/resumeAnalytics';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ResumeAnalyticsProps {
  resumeData: unknown;
  resumeId?: string;
  currentATSScore?: number;
  onClose?: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ResumeAnalytics({ resumeData, resumeId, currentATSScore, onClose }: ResumeAnalyticsProps) {
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sectionCompleteness, setSectionCompleteness] = useState<SectionCompleteness>({
    summary: 0,
    experience: 0,
    education: 0,
    skills: 0,
  });

  // Add keyboard support for closing (Escape key)
  useEffect(() => {
    if (!onClose) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const analytics = useMemo(() => {
    const calculated = calculateResumeAnalytics(resumeData as any);
    calculated.atsScore = currentATSScore ?? (resumeData as any)?.atsScore ?? 0;
    return calculated;
  }, [resumeData, currentATSScore]);

  // Memoize section completeness calculation
  const sectionCompletenessMemo = useMemo(() => {
    return getSectionCompleteness(resumeData as any);
  }, [resumeData]);

  // Update state only when memoized value changes
  useEffect(() => {
    setSectionCompleteness(sectionCompletenessMemo);
  }, [sectionCompletenessMemo]);

  // Load score history from Supabase
  useEffect(() => {
    if (resumeId) {
      loadScoreHistory();
    }
  }, [resumeId]);

  const loadScoreHistory = async () => {
    if (!resumeId) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await getScoreHistory(resumeId);
      setScoreHistory(history);
    } catch (error) {
      console.error('Error loading score history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Memoize section data for chart
  const sectionData = useMemo(() => [
    { name: 'Summary', value: sectionCompleteness.summary },
    { name: 'Experience', value: sectionCompleteness.experience },
    { name: 'Education', value: sectionCompleteness.education },
    { name: 'Skills', value: sectionCompleteness.skills },
  ], [sectionCompleteness]);

  // Generate Quick Wins insights
  const quickWins = useMemo(() => {
    const wins: string[] = [];
    
    if (sectionCompleteness.summary < 100 && sectionCompleteness.summary >= 50) {
      const needed = Math.ceil((100 - sectionCompleteness.summary) / 0.5); // ~1 char per 0.5%
      wins.push(`Add ${needed} more characters to your summary to reach 100%`);
    }
    
    if (sectionCompleteness.skills < 100) {
      const current = Math.round((sectionCompleteness.skills / 100) * 10);
      const needed = 10 - current;
      if (needed > 0) {
        wins.push(`Add ${needed} more skill${needed > 1 ? 's' : ''} to reach 100%`);
      }
    }
    
    if (sectionCompleteness.experience < 100 && sectionCompleteness.experience > 0) {
      const missing = 100 - sectionCompleteness.experience;
      wins.push(`Complete ${Math.round(missing / 25)} more experience field${Math.round(missing / 25) > 1 ? 's' : ''} to reach 100%`);
    }
    
    if (sectionCompleteness.education < 100 && sectionCompleteness.education > 0) {
      const missing = 100 - sectionCompleteness.education;
      wins.push(`Complete ${Math.round(missing / 33)} more education field${Math.round(missing / 33) > 1 ? 's' : ''} to reach 100%`);
    }

    if (analytics.keywordDensity.actionVerbs < 10) {
      const needed = 10 - analytics.keywordDensity.actionVerbs;
      wins.push(`Add ${needed} more action verb${needed > 1 ? 's' : ''} to strengthen your resume`);
    }

    if (analytics.keywordDensity.quantifiableMetrics < 5) {
      const needed = 5 - analytics.keywordDensity.quantifiableMetrics;
      wins.push(`Add ${needed} more quantifiable metric${needed > 1 ? 's' : ''} (numbers, percentages, $ amounts)`);
    }

    return wins;
  }, [sectionCompleteness, analytics]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gray-50 relative">
      {/* Header with Close Button */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Resume Performance</h2>
          <p className="text-sm text-slate-600">
            Track your progress and ATS score improvements over time
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            title="Close analytics panel"
            aria-label="Close analytics panel"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Chart 1: ATS Score Trend */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ATS Score Trend</h3>
          {isLoadingHistory && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
        {scoreHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'ATS Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
                formatter={(value: any) => [`${value}%`, 'ATS Score']}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
            <TrendingUp className="w-12 h-12 mb-2" />
            <p className="text-sm">No version history yet</p>
            <p className="text-xs mt-1">Create versions to track your ATS score over time</p>
          </div>
        )}
      </div>

      {/* Chart 2: Section Completeness */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Completeness</h3>
        <div className="space-y-4">
          {sectionData.map((section) => (
            <div key={section.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{section.name}</span>
                <span className="text-gray-600">{Math.round(section.value)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    section.value >= 80
                      ? 'bg-green-500'
                      : section.value >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${section.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins Insights */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Wins</h3>
        </div>
        {quickWins.length > 0 ? (
          <ul className="space-y-2">
            {quickWins.map((win, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-indigo-600 mt-1">•</span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Great job! Your resume sections are well-completed.</p>
        )}
      </div>

      {/* Additional Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Current ATS Score</span>
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.atsScore}</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${
                analytics.atsScore >= 70 ? 'bg-green-500' :
                analytics.atsScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analytics.atsScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Word Count</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.wordCount}</div>
          <div className="text-xs text-gray-500 mt-1">
            {analytics.wordCount < 300 ? 'Too short' :
             analytics.wordCount > 800 ? 'Too long' : 'Optimal'}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Action Verbs</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.keywordDensity.actionVerbs}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analytics.keywordDensity.actionVerbs >= 10 ? 'Excellent' :
             analytics.keywordDensity.actionVerbs >= 5 ? 'Good' : 'Needs improvement'}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Quantifiable Metrics</span>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.keywordDensity.quantifiableMetrics}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analytics.keywordDensity.quantifiableMetrics >= 5 ? 'Great' :
             analytics.keywordDensity.quantifiableMetrics >= 3 ? 'Good' : 'Add more'}
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
          </div>
          {analytics.strengths.length > 0 ? (
            <ul className="space-y-2">
              {analytics.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No strengths identified yet</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
          </div>
          {analytics.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {analytics.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-600 mt-1">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No weaknesses identified</p>
          )}
        </div>
      </div>
    </div>
  );
}
