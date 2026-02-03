import { useState } from 'react';
import { X, Target, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { analyzeResumeATS, type ATSAnalysisResult } from '../../lib/resumeAI';
import { resumeToHTML } from '../../lib/resumeToHTML';
import { showNetworkError } from '../../lib/networkErrorHandler';
import { getModalZIndexClass, getModalBackdropZIndexClass } from '../../lib/zIndex';

interface ATSScannerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
}

export default function ATSScannerPanel({ isOpen, onClose, resume }: ATSScannerPanelProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [scanResult, setScanResult] = useState<ATSAnalysisResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to scan');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      // Convert ResumeData to HTML for AI analysis
      const resumeHTML = resumeToHTML(resume);
      
      // Use AI-powered ATS analysis
      const result = await analyzeResumeATS(resumeHTML, jobDescription);
      setScanResult(result);
    } catch (error) {
      console.error('Error scanning resume:', error);
      
      // Handle network errors with user-friendly messages
      if (error instanceof Error && 'type' in error) {
        showNetworkError(error as any, 'scanning your resume');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to scan resume. Please try again.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setJobDescription('');
    setScanResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Get overall score from ATS analysis result
  const overallScore = scanResult?.overallScore || 0;

  const backdropZIndex = getModalBackdropZIndexClass(0);
  const modalZIndex = getModalZIndexClass(0);

  return (
    <div className={`fixed inset-0 ${backdropZIndex} flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm`}>
      <div className={`bg-white rounded-t-3xl sm:rounded-lg shadow-xl w-full max-w-4xl mx-0 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col ${modalZIndex}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">ATS Resume Scanner</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close scanner"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Job Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
              />
              <button
                onClick={handleScan}
                disabled={isScanning || !jobDescription.trim()}
                className="mt-3 flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Scan Now</span>
                  </>
                )}
              </button>
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Results */}
            {scanResult && (
              <div className="space-y-6">
                {/* Score Gauge */}
                <div className={`p-6 rounded-lg border-2 ${getScoreBgColor(overallScore)}`}>
                  <div className="flex items-center justify-center">
                    <div className="relative w-64 h-32">
                      {/* Gauge Background (Semi-circle) */}
                      <svg className="w-64 h-32 overflow-hidden" viewBox="0 0 200 100">
                        {/* Background arc */}
                        <path
                          d="M 20 80 A 80 80 0 0 1 180 80"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                        />
                        {/* Score arc */}
                        <path
                          d="M 20 80 A 80 80 0 0 1 180 80"
                          stroke={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(overallScore / 100) * 502.65} 502.65`}
                          transform="rotate(180 100 100)"
                        />
                      </svg>
                      {/* Score Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                          {overallScore}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">ATS Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Breakdown Scores */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(scanResult.breakdown).map(([key, value]) => (
                    <div key={key} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <span className={`text-lg font-bold ${getScoreColor(value.score)}`}>
                          {value.score}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{value.feedback}</p>
                      {'suggestions' in value && Array.isArray((value as any).suggestions) && (value as any).suggestions.length > 0 && (
                        <ul className="text-xs text-gray-500 space-y-1">
                          {((value as any).suggestions as string[]).slice(0, 2).map((suggestion: string, idx: number) => (
                            <li key={idx}>• {suggestion}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* Top Improvements */}
                {scanResult.topImprovements && scanResult.topImprovements.length > 0 && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-900">
                        Top Improvements
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {scanResult.topImprovements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Industry Keywords */}
                {scanResult.industryKeywords && scanResult.industryKeywords.length > 0 && (
                  <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-purple-900">
                        Industry Keywords
                      </h3>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">
                      Consider incorporating these industry-relevant keywords:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.industryKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score Interpretation */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-2">Score Interpretation</h4>
                  <p className="text-sm text-indigo-700">
                    {overallScore >= 80 
                      ? 'Excellent! Your resume is well-optimized for ATS systems and aligns well with the job description.'
                      : overallScore >= 60
                      ? 'Good match. Review the suggestions above to further improve your ATS compatibility and keyword alignment.'
                      : 'Your resume needs improvement. Focus on the top improvements and missing keywords to enhance your ATS compatibility.'
                    }
                  </p>
                </div>
              </div>
            )}

            {!scanResult && !isScanning && (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">Paste a job description above and click "Scan Resume" to see how well your resume matches.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

