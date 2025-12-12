import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, FileText, CheckCircle2, AlertCircle, Lightbulb, Target, BookOpen } from 'lucide-react';
import { calculateResumeAnalytics, getAnalyticsHistory, type ResumeAnalytics } from '../../lib/resumeAnalytics';
import { ResumeData } from './ResumeControlPanel';
import { calculateATSScore } from '../../utils/atsScorer';
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
  resumeData: ResumeData;
  resumeId?: string;
  currentATSScore?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ResumeAnalytics({ resumeData, resumeId, currentATSScore }: ResumeAnalyticsProps) {
  const analytics = useMemo(() => {
    const calculated = calculateResumeAnalytics(resumeData);
    // Use provided ATS score or calculate it
    calculated.atsScore = currentATSScore ?? calculateATSScore(resumeData).score;
    return calculated;
  }, [resumeData, currentATSScore]);
  
  const history = resumeId ? getAnalyticsHistory(resumeId) : [];
  const recentHistory = history.slice(-7); // Last 7 snapshots

  // Prepare section completeness data
  const sectionData = [
    { name: 'Personal Info', value: analytics.sectionCompleteness.personalInfo },
    { name: 'Summary', value: analytics.sectionCompleteness.summary },
    { name: 'Experience', value: analytics.sectionCompleteness.experience },
    { name: 'Education', value: analytics.sectionCompleteness.education },
    { name: 'Skills', value: analytics.sectionCompleteness.skills },
    { name: 'Certifications', value: analytics.sectionCompleteness.certifications },
    { name: 'Projects', value: analytics.sectionCompleteness.projects },
    { name: 'Languages', value: analytics.sectionCompleteness.languages },
  ].filter(item => item.value > 0);

  // Prepare keyword density data
  const keywordData = [
    { name: 'Action Verbs', value: analytics.keywordDensity.actionVerbs },
    { name: 'Quantifiable Metrics', value: analytics.keywordDensity.quantifiableMetrics },
    { name: 'Technical Terms', value: analytics.keywordDensity.technicalTerms },
  ];

  // Prepare history chart data
  const historyChartData = recentHistory.map((item: any, index: number) => ({
    name: `Day ${index + 1}`,
    score: item.atsScore || 0,
    wordCount: item.wordCount || 0,
  }));

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Resume Analytics</h2>
        <p className="text-sm text-slate-600">
          Comprehensive insights and metrics for your resume
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">ATS Score</span>
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

        <div className="bg-white border border-gray-200 rounded-lg p-4">
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

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Readability</span>
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.readability.fleschReadingEase > 0
              ? Math.round(analytics.readability.fleschReadingEase)
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analytics.readability.fleschReadingEase > 60 ? 'Easy to read' :
             analytics.readability.fleschReadingEase > 30 ? 'Moderate' : 'Difficult'}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
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
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Completeness Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Completeness</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Keyword Density Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Density</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={keywordData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {keywordData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Trend (if available) */}
      {historyChartData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
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

        {/* Weaknesses */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
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

      {/* Recommendations */}
      {analytics.recommendations.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {analytics.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-indigo-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

