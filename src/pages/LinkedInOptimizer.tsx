import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Linkedin,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Award,
  Users,
  Eye,
  MessageSquare,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Edit,
  Save,
  X,
  Sparkles,
  BarChart3,
  Zap,
} from 'lucide-react';
import { WorkflowTracking } from '../lib/workflowTracking';
import FirstTimeEntryCard from '../components/workflows/FirstTimeEntryCard';
import { 
  fetchLinkedInProfileOAuth, 
  fetchLinkedInProfilePublic,
  validateLinkedInUrl,
  extractLinkedInUsername,
  analyzeLinkedInProfile,
  type LinkedInProfileData 
} from '../lib/linkedinProfileFetcher';
import { isLinkedInAuthenticated, connectLinkedIn, getCachedLinkedInProfile } from '../lib/linkedin';

interface OptimizationRecommendation {
  id: string;
  category: 'headline' | 'summary' | 'experience' | 'skills' | 'profile-completeness' | 'keywords' | 'engagement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  action: string;
  currentValue?: string;
  suggestedValue?: string;
  applied?: boolean;
}

export default function LinkedInOptimizer() {
  const navigate = useNavigate();
  
  // Workflow state (for tracking only; UI lives in dashboard Workflow tab)
  const [workflowContext, setWorkflowContext] = useState<any>(null);

  // LinkedIn state
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<LinkedInProfileData | null>(null);
  const [analysis, setAnalysis] = useState<{ score: number; strengths: string[]; weaknesses: string[] } | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'optimize'>('overview');

  // Check for workflow context on mount
  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    
    // Workflow 3: Personal Brand Building
    if (context?.workflowId === 'personal-brand-job-discovery') {
      setWorkflowContext(context);
      
      // Mark step as in-progress
      const workflow = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
      if (workflow) {
        const optimizeStep = workflow.steps.find(s => s.id === 'optimize-linkedin');
        if (optimizeStep && optimizeStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'optimize-linkedin', 'in-progress');
        }
      }
    }

    // Check if LinkedIn is already connected
    checkLinkedInConnection();
  }, []);

  const checkLinkedInConnection = async () => {
    try {
      const connected = isLinkedInAuthenticated();
      setIsConnected(connected);
      
      if (connected) {
        const cached = getCachedLinkedInProfile();
        if (cached) {
          // Load cached profile
          const profile = await fetchLinkedInProfileOAuth();
          if (profile) {
            setProfileData(profile);
            analyzeProfile(profile);
          }
        }
      }
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error);
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      setIsLoading(true);
      await connectLinkedIn();
      setIsConnected(true);
      
      // Fetch profile after connection
      const profile = await fetchLinkedInProfileOAuth();
      if (profile) {
        setProfileData(profile);
        analyzeProfile(profile);
      }
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      alert('Failed to connect LinkedIn. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchByUrl = async () => {
    if (!validateLinkedInUrl(linkedInUrl)) {
      alert('Please enter a valid LinkedIn URL');
      return;
    }

    try {
      setIsLoading(true);
      const profile = await fetchLinkedInProfilePublic(linkedInUrl);
      setProfileData(profile);
      analyzeProfile(profile);
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      alert('Failed to fetch LinkedIn profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeProfile = (profile: LinkedInProfileData) => {
    const analysisResult = analyzeLinkedInProfile(profile);
    setAnalysis(analysisResult);
    generateRecommendations(profile, analysisResult);
  };

  const generateRecommendations = (profile: LinkedInProfileData, analysis: { score: number; strengths: string[]; weaknesses: string[] }) => {
    const recs: OptimizationRecommendation[] = [];

    // Profile Completeness
    if (profile.profileCompleteness < 80) {
      recs.push({
        id: 'completeness',
        category: 'profile-completeness',
        title: 'Complete Your Profile',
        description: `Your profile is ${profile.profileCompleteness}% complete. Complete all sections to improve visibility.`,
        priority: 'high',
        impact: 'High - Increases profile views by 40%',
        action: 'Add missing sections',
      });
    }

    // Headline
    if (!profile.headline || profile.headline.length < 50) {
      recs.push({
        id: 'headline',
        category: 'headline',
        title: 'Optimize Your Headline',
        description: 'Your headline is too short or missing. A compelling headline increases profile views.',
        priority: 'high',
        impact: 'High - First thing recruiters see',
        action: 'Update headline with keywords',
        currentValue: profile.headline || 'Not set',
        suggestedValue: 'Add your role, expertise, and value proposition',
      });
    }

    // Summary
    if (!profile.summary || profile.summary.length < 200) {
      recs.push({
        id: 'summary',
        category: 'summary',
        title: 'Enhance Your Summary',
        description: 'Your summary is too short. A detailed summary helps you stand out.',
        priority: 'medium',
        impact: 'Medium - Helps with keyword matching',
        action: 'Expand summary with achievements',
        currentValue: profile.summary ? `${profile.summary.length} characters` : 'Not set',
        suggestedValue: 'Write 200+ characters highlighting your achievements',
      });
    }

    // Experience
    if (profile.experienceCount < 3) {
      recs.push({
        id: 'experience',
        category: 'experience',
        title: 'Add More Experience',
        description: `You have ${profile.experienceCount} experience entries. Add more to showcase your career journey.`,
        priority: 'medium',
        impact: 'Medium - Shows career progression',
        action: 'Add missing work experience',
      });
    }

    // Skills
    if (profile.skills.length < 10) {
      recs.push({
        id: 'skills',
        category: 'skills',
        title: 'Add More Skills',
        description: `You have ${profile.skills.length} skills listed. Add more relevant skills to improve discoverability.`,
        priority: 'medium',
        impact: 'Medium - Improves search ranking',
        action: 'Add 10+ relevant skills',
      });
    }

    // Keywords
    recs.push({
      id: 'keywords',
      category: 'keywords',
      title: 'Optimize Keywords',
      description: 'Use industry-relevant keywords in your headline, summary, and experience.',
      priority: 'high',
      impact: 'High - Improves search visibility',
      action: 'Research and add relevant keywords',
    });

    // Engagement
    recs.push({
      id: 'engagement',
      category: 'engagement',
      title: 'Increase Engagement',
      description: 'Regular posts and engagement increase your profile visibility.',
      priority: 'low',
      impact: 'Low - Builds professional network',
      action: 'Post regularly and engage with content',
    });

    setRecommendations(recs);
  };

  const handleApplyRecommendation = (rec: OptimizationRecommendation) => {
    // Mark recommendation as applied
    setRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, applied: true } : r));
    
    // If this completes the workflow step, mark it
    if (workflowContext?.workflowId === 'personal-brand-job-discovery' && profileData) {
      const workflow = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
      if (workflow) {
        WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'optimize-linkedin', 'completed', {
          profileCompleteness: profileData.profileCompleteness,
          optimizationScore: analysis?.score || 0,
          recommendationsApplied: recommendations.filter(r => r.applied).length
        });

        // Store optimization data in workflow context
        WorkflowTracking.setWorkflowContext({
          workflowId: 'personal-brand-job-discovery',
          brandScore: workflowContext?.brandScore,
          brandArchetype: workflowContext?.brandArchetype,
          linkedInOptimized: true,
          linkedInScore: analysis?.score || 0,
          linkedInCompleteness: profileData.profileCompleteness,
          action: 'create-content'
        });
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      {/* First-Time Entry Card */}
      <FirstTimeEntryCard
        featurePath="/dashboard/linkedin-optimizer"
        featureName="LinkedIn Optimizer"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-[#111827] flex items-center justify-center">
              <Linkedin className="w-6 h-6 text-white" />
            </div>
            LinkedIn Optimizer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Optimize your LinkedIn profile to attract recruiters and showcase your expertise
          </p>
        </div>
      </div>

      {/* Connection Section */}
      {!isConnected && !profileData && (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-2xl p-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-[#111827] flex items-center justify-center mx-auto mb-6">
              <Linkedin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Connect Your LinkedIn Profile
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Connect your LinkedIn account to analyze and optimize your profile automatically
            </p>

            <div className="space-y-4">
              <button
                onClick={handleConnectLinkedIn}
                disabled={isLoading}
                className="w-full max-w-md mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-[#111827] text-white rounded-xl font-semibold hover:from-blue-700 hover:to-[#1f2937] transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Linkedin className="w-5 h-5" />
                    Connect with LinkedIn
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-800 text-slate-500">Or</span>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder="Paste your LinkedIn profile URL"
                  className="w-full max-w-md mx-auto px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#111827] focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
                <button
                  onClick={handleFetchByUrl}
                  disabled={isLoading || !linkedInUrl}
                  className="w-full max-w-md mx-auto px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Analyze Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Analysis */}
      {profileData && analysis && (
        <>
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${getScoreBgColor(analysis.score)} rounded-2xl p-6 border-2 border-current`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Optimization Score</h3>
                <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </span>
                <span className="text-slate-600 dark:text-slate-400">/ 100</span>
              </div>
              <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${getScoreColor(analysis.score).replace('text-', 'bg-')}`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Profile Completeness</h3>
                <CheckCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#111827] dark:text-slate-300">
                  {profileData.profileCompleteness}
                </span>
                <span className="text-slate-600 dark:text-slate-400">%</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {profileData.profileCompleteness >= 80 ? 'Excellent!' : 'Needs improvement'}
              </p>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Recommendations</h3>
                <Lightbulb className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {recommendations.length}
                </span>
                <span className="text-slate-600 dark:text-slate-400">suggestions</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {recommendations.filter(r => r.priority === 'high').length} high priority
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 mb-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
                { id: 'optimize', label: 'Optimize', icon: Zap },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#111827] text-[#111827] dark:text-slate-300'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Profile Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Experience</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{profileData.experienceCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Education</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{profileData.educationCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Skills</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{profileData.skills.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{profileData.location || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                {recommendations.map(rec => (
                  <div
                    key={rec.id}
                    className={`border-2 rounded-xl p-6 ${
                      rec.priority === 'high'
                        ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20'
                        : rec.priority === 'medium'
                        ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{rec.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            rec.priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                              : rec.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          }`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mb-2">{rec.description}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          <strong>Impact:</strong> {rec.impact}
                        </p>
                        {rec.currentValue && (
                          <div className="text-sm space-y-1">
                            <p><strong>Current:</strong> {rec.currentValue}</p>
                            {rec.suggestedValue && (
                              <p><strong>Suggested:</strong> {rec.suggestedValue}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplyRecommendation(rec)}
                      className="px-4 py-2 bg-[#111827] text-white rounded-lg font-semibold hover:bg-[#1f2937] transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {rec.action}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Optimize Tab */}
            {activeTab === 'optimize' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Optimization Tips</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Use Industry Keywords</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Include relevant keywords in your headline and summary</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Complete All Sections</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Fill out every section of your profile</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Add Professional Photo</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">A professional photo increases profile views</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Engage Regularly</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Post content and engage with your network</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <a
                    href="https://www.linkedin.com/in/me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open LinkedIn Profile
                  </a>
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}

