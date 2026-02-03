import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BookOpen,
  Bookmark,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Globe,
  History,
  Info,
  Layers,
  LayoutGrid,
  Lightbulb,
  Linkedin,
  MessageCircle,
  MessageSquare,
  PenTool,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  Twitter,
  X,
  Zap,
} from 'lucide-react';

/**
 * SkillHoop Content Engine (self-contained)
 * Rebuilt to match the richer reference: generator fields, calendar filtering,
 * expanded analytics + templates, plus workflow prompt/wizard mocks.
 */

// -----------------------------
// Recharts mock (lightweight)
// -----------------------------

type AnyProps = Record<string, any>;
type AnyComponent = React.ComponentType<any>;

const RechartsMock = {
  ResponsiveContainer: ({ children, height }: AnyProps) => (
    <div style={{ height: height || 300, width: '100%', position: 'relative' }}>{children}</div>
  ),
  AreaChart: (_props: AnyProps) => (
    <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* grid */}
      <line x1="0" y1="150" x2="400" y2="150" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="0" y1="100" x2="400" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="0" y1="50" x2="400" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
      {/* views */}
      <path d="M0,85 Q60,110 120,70 T240,55 T400,35 V150 H0 Z" fill="url(#colorViews)" />
      <path d="M0,85 Q60,110 120,70 T240,55 T400,35" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
      {/* engagement */}
      <path d="M0,120 Q90,135 180,105 T400,90 V150 H0 Z" fill="url(#colorEngagement)" opacity="0.7" />
      <path d="M0,120 Q90,135 180,105 T400,90" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  CartesianGrid: (_props: AnyProps) => null,
  XAxis: (_props: AnyProps) => null,
  YAxis: (_props: AnyProps) => null,
  Tooltip: (_props: AnyProps) => null,
  Legend: (_props: AnyProps) => null,
  Area: (_props: AnyProps) => null,
};

const ResponsiveContainer = RechartsMock.ResponsiveContainer as AnyComponent;
const AreaChart = RechartsMock.AreaChart as AnyComponent;
const CartesianGrid = RechartsMock.CartesianGrid as AnyComponent;
const XAxis = RechartsMock.XAxis as AnyComponent;
const YAxis = RechartsMock.YAxis as AnyComponent;
const Tooltip = RechartsMock.Tooltip as AnyComponent;
const Legend = RechartsMock.Legend as AnyComponent;
const Area = RechartsMock.Area as AnyComponent;

// -----------------------------
// Workflow mocks
// -----------------------------

const WorkflowTracking = {
  _context: { workflowId: 'personal-brand-job-discovery', brandScore: 65, brandArchetype: 'Innovator' },
  getWorkflow: (_id: string) => ({
    steps: [{ id: 'create-content', status: 'not-started' }],
    isActive: true,
    progress: 30,
  }),
  updateStepStatus: (workflowId: string, stepId: string, status: string, data?: any) => {
    console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
  },
  getWorkflowContext: () => WorkflowTracking._context,
  setWorkflowContext: (context: any) => {
    WorkflowTracking._context = { ...WorkflowTracking._context, ...context };
  },
};

// -----------------------------
// UI helpers (stubs)
// -----------------------------

const FeatureGate = ({ children }: { children: React.ReactNode; requiredTier?: string }) => <>{children}</>;

function FeatureQuickStartWizard({
  isOpen,
  onClose,
  steps,
  storageKey = 'content_engine_quick_start_dismissed',
}: {
  isOpen: boolean;
  onClose: () => void;
  steps: Array<{ title: string; description: string; tips?: string[]; actionLabel?: string }>;
  storageKey?: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  if (!isOpen) return null;
  const step = steps[currentStep];

  const handleClose = () => {
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">Quick Start Guide</h3>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-slate-50">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-neutral-200">
              {currentStep + 1}
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">{step.title}</h2>
          </div>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">{step.description}</p>
          {step.tips && (
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Lightbulb size={18} /> Pro Tips
              </h4>
              <ul className="space-y-3">
                {step.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-indigo-800 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-2xl">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-neutral-900' : 'bg-slate-300'}`} />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-2"
          >
            {step.actionLabel || (currentStep === steps.length - 1 ? 'Get Started' : 'Next Step')} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowBreadcrumb({ workflowId }: { workflowId: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-xs font-medium text-slate-500 flex items-center gap-2">
      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Active Workflow</span>
      <span>{workflowId === 'personal-brand-job-discovery' ? 'Personal Brand Building' : 'Workflow'}</span>
      <ChevronRight size={12} />
      <span className="text-neutral-900 font-bold">Current Step</span>
    </div>
  );
}

function WorkflowPrompt({
  message,
  actionText,
  onDismiss,
  onAction,
}: {
  message: string;
  actionText: string;
  onDismiss: () => void;
  onAction: (action: 'continue') => void;
}) {
  return (
    <div className="bg-indigo-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-600/20 mb-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Sparkles size={20} />
        </div>
        <span className="font-bold text-sm">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onAction('continue')}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-50 transition-colors"
        >
          {actionText}
        </button>
        <button onClick={onDismiss} className="text-white/60 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <Sparkles size={48} className="mx-auto text-indigo-600 mb-4" />
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Upgrade to Pro</h3>
        <p className="text-slate-500 mb-6">Unlock unlimited AI generations and premium features.</p>
        <button onClick={onClose} className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold">
          Maybe Later
        </button>
      </div>
    </div>
  );
}

// -----------------------------
// Data + storage
// -----------------------------

type ContentItem = {
  id: number;
  type: string;
  title: string;
  content: string;
  metadata: {
    timestamp?: number;
    topic?: string;
    platforms?: string[];
    tone?: string;
    targetAudience?: string;
    contentLength?: string;
  };
};

type ScheduledPost = {
  id: number;
  title: string;
  platform: string;
  scheduledDate: string; // ISO
  status: 'draft' | 'scheduled' | 'published' | 'failed';
};

type ExpertiseArea = {
  id: number;
  name: string;
  level: string;
  authorityScore: number;
  contentCount: number;
  lastUpdated: number;
  createdAt: number;
};

const CONTENT_STORAGE_KEY = 'content_engine_generated_content';
const SCHEDULED_POSTS_STORAGE_KEY = 'content_engine_scheduled_posts';
const EXPERTISE_STORAGE_KEY = 'content_engine_expertise_areas';

const trendingTopics = [
  { id: 1, title: 'AI Ethics in Software Development', competitionLevel: 'Medium', timeframe: 'This Week', category: 'Technology' },
  { id: 2, title: 'Remote Work Culture Evolution', competitionLevel: 'High', timeframe: 'This Month', category: 'Workplace' },
  { id: 3, title: 'Sustainable Tech Practices', competitionLevel: 'Low', timeframe: 'Next Week', category: 'Sustainability' },
];

const contentSuggestions = [
  { id: 1, topic: 'The Future of AI in Healthcare', angle: 'Personal experience with AI diagnostics', contentType: 'LinkedIn Post', estimatedEngagement: 450, difficulty: 'Medium', timeToCreate: '15 min', platforms: ['LinkedIn', 'Twitter'] },
  { id: 2, topic: 'Building Inclusive Tech Teams', angle: 'Data-driven approach to diversity', contentType: 'Article', estimatedEngagement: 320, difficulty: 'Easy', timeToCreate: '25 min', platforms: ['LinkedIn', 'Medium'] },
  { id: 3, topic: 'Cybersecurity Best Practices', angle: 'Lessons from recent breaches', contentType: 'Thread', estimatedEngagement: 280, difficulty: 'Hard', timeToCreate: '20 min', platforms: ['Twitter', 'LinkedIn'] },
];

const defaultExpertiseAreas: ExpertiseArea[] = [
  { id: 1, name: 'Software Architecture', level: 'Expert', authorityScore: 85, contentCount: 24, lastUpdated: Date.now() - 2 * 86400000, createdAt: Date.now() - 30 * 86400000 },
  { id: 2, name: 'AI & Machine Learning', level: 'Advanced', authorityScore: 72, contentCount: 18, lastUpdated: Date.now() - 7 * 86400000, createdAt: Date.now() - 25 * 86400000 },
  { id: 3, name: 'DevOps & Infrastructure', level: 'Intermediate', authorityScore: 58, contentCount: 12, lastUpdated: Date.now() - 14 * 86400000, createdAt: Date.now() - 20 * 86400000 },
];

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const formatNumber = (num: number) => (num >= 1000000 ? `${(num / 1000000).toFixed(1)}M` : num >= 1000 ? `${(num / 1000).toFixed(1)}K` : String(num));
const formatPercentage = (num: number) => `${num.toFixed(1)}%`;
const getTimeAgo = (timestamp?: number) => {
  const d = new Date(timestamp || Date.now());
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// -----------------------------
// Main module
// -----------------------------

const ContentEngine = () => {
  // workflow
  const [workflowContext, setWorkflowContext] = useState<any>(null);
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);
  const [showQuickStartWizard, setShowQuickStartWizard] = useState(false);

  // tabs + data
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'calendar' | 'analytics' | 'templates'>('dashboard');
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null);
  const [contentHistory, setContentHistory] = useState<ContentItem[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseArea[]>([]);

  // generator state
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // calendar state
  const [calendarPlatformFilter, setCalendarPlatformFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeCalendarDay, setActiveCalendarDay] = useState(new Date().getDate());

  // analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    setContentHistory(loadJson<ContentItem[]>(CONTENT_STORAGE_KEY, []));
    setScheduledPosts(loadJson<ScheduledPost[]>(SCHEDULED_POSTS_STORAGE_KEY, []));
    setExpertiseAreas(loadJson<ExpertiseArea[]>(EXPERTISE_STORAGE_KEY, defaultExpertiseAreas));

    const context = WorkflowTracking.getWorkflowContext();
    if (context?.workflowId === 'personal-brand-job-discovery') {
      setWorkflowContext(context);
      const wf = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
      if (wf) WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'create-content', 'in-progress');
    }
  }, []);

  useEffect(() => {
    setActiveCalendarDay(1);
  }, [selectedDate]);

  useEffect(() => {
    const dismissed = loadJson<string | null>('content_engine_quick_start_dismissed', null);
    if (!dismissed && activeTab === 'dashboard' && contentHistory.length === 0) {
      const t = setTimeout(() => setShowQuickStartWizard(true), 700);
      return () => clearTimeout(t);
    }
  }, [activeTab, contentHistory.length]);

  const dashboardMetrics = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
    const contentThisWeek = contentHistory.filter((c) => new Date(c.metadata?.timestamp || 0) >= oneWeekAgo).length;
    const publishedThisWeek = scheduledPosts.filter((p) => new Date(p.scheduledDate) >= oneWeekAgo && p.status === 'published').length;
    const scheduledCount = scheduledPosts.filter((p) => p.status === 'scheduled').length;
    const avgAuthorityScore = expertiseAreas.length ? Math.round(expertiseAreas.reduce((s, a) => s + a.authorityScore, 0) / expertiseAreas.length) : 0;
    return { contentThisWeek, publishedThisWeek, scheduledCount, avgAuthorityScore };
  }, [contentHistory, scheduledPosts, expertiseAreas]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const getTypeFromGenerator = (genId: string | null) => {
    if (!genId) return 'post';
    if (genId.includes('article')) return 'article';
    if (genId.includes('thread')) return 'thread';
    if (genId.includes('carousel')) return 'carousel';
    return 'post';
  };

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const topic = formData.topic || 'professional development';
      const tone = formData.tone || 'professional';
      const targetAudience = formData.targetAudience || 'professionals';
      const contentLength = formData.contentLength || 'medium';
      const platforms: string[] = formData.platforms?.length ? formData.platforms : ['LinkedIn'];

      await new Promise((r) => setTimeout(r, 1400));

      const type = getTypeFromGenerator(activeGenerator);
      const mockContent = `**${topic}**: A Strategic Approach\n\nIn today's fast-paced environment, prioritizing ${topic} is crucial for ${targetAudience}.\n\nTone: ${tone} • Length: ${contentLength}\n\n1. Focus on fundamentals\n2. Iterate quickly\n3. Value feedback\n\nWhat are your thoughts on this? 👇\n#${topic.replace(/\s+/g, '')} #ProfessionalGrowth`;

      setGeneratedContent(mockContent);

      const saved: ContentItem = {
        id: Date.now(),
        type,
        title: topic,
        content: mockContent,
        metadata: { timestamp: Date.now(), topic, tone, targetAudience, contentLength, platforms },
      };
      const nextHistory = [saved, ...contentHistory].slice(0, 100);
      setContentHistory(nextHistory);
      saveJson(CONTENT_STORAGE_KEY, nextHistory);

      if (workflowContext?.workflowId === 'personal-brand-job-discovery') {
        WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'create-content', 'completed', { type, topic, platforms });
        setShowWorkflowPrompt(true);
        WorkflowTracking.setWorkflowContext({ contentCreated: true, action: 'showcase-portfolio' });
      }
    } catch (e) {
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'analytics') return;
    setAnalyticsLoading(true);
    const t = setTimeout(() => {
      const totalLikes = 892;
      const totalComments = 234;
      const totalShares = 156;
      setAnalyticsData({
        totalContent: contentHistory.length || 42,
        totalViews: 15420,
        totalLikes,
        totalComments,
        totalShares,
        averageEngagementRate: 4.8,
        trends: { totalContent: 12.5, totalViews: 24.8, engagementRate: 5.2, totalEngagement: 18.3 },
        insights: [
          { type: 'positive', title: 'LinkedIn Dominance', text: 'LinkedIn posts are driving 75% of your total engagement this week.' },
          { type: 'neutral', title: 'Optimal Timing', text: 'Your audience is most active on Tuesdays at 10:00 AM EST.' },
          { type: 'negative', title: 'Article Drop-off', text: 'Long-form article views are down 15%. Consider shorter paragraphs.' },
        ],
        audienceDemographics: [
          { label: 'Senior Engineers', value: 45, color: 'bg-indigo-500' },
          { label: 'CTOs / VPs', value: 25, color: 'bg-purple-500' },
          { label: 'Recruiters', value: 20, color: 'bg-pink-500' },
          { label: 'Other', value: 10, color: 'bg-slate-300' },
        ],
        contentByPlatform: { LinkedIn: 28, Twitter: 12, Medium: 2, Instagram: 4 },
        topPerformingContent: [
          { id: '1', title: 'AI in Modern Development', platform: 'LinkedIn', views: 2450, engagement_rate: 8.2 },
          { id: '2', title: 'Remote Work Best Practices', platform: 'LinkedIn', views: 1890, engagement_rate: 6.5 },
          { id: '3', title: 'Building Effective Teams', platform: 'Twitter', views: 1560, engagement_rate: 5.8 },
        ],
        timeSeriesData: Array.from({ length: timeRange }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (timeRange - 1 - i));
          return {
            date: d.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 500) + 100,
            engagement: Math.floor(Math.random() * 50) + 10,
          };
        }),
      });
      setAnalyticsLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, [activeTab, timeRange, contentHistory.length]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'generator', label: 'Create', icon: <PenTool className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <Bookmark className="w-4 h-4" /> },
  ] as const;

  const generators = [
    { id: 'post-generator', name: 'Post Generator', icon: <FileText className="w-5 h-5" />, description: 'Create engaging social media posts' },
    { id: 'article-generator', name: 'Article Writer', icon: <BookOpen className="w-5 h-5" />, description: 'Write long-form articles and blog posts' },
    { id: 'thread-generator', name: 'Thread Maker', icon: <MessageSquare className="w-5 h-5" />, description: 'Create Twitter/X threads' },
    { id: 'carousel-maker', name: 'Carousel Maker', icon: <Layers className="w-5 h-5" />, description: 'Design carousel slide content' },
  ];

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Content Generated', value: dashboardMetrics.contentThisWeek, sub: 'This Week', icon: FileText, color: 'text-pink-600', bg: 'bg-pink-50', subColor: 'text-green-600 bg-green-100' },
          { label: 'Posts This Week', value: dashboardMetrics.publishedThisWeek, sub: 'Published', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50', subColor: 'text-blue-600 bg-blue-100' },
          { label: 'Scheduled Posts', value: dashboardMetrics.scheduledCount, sub: 'Queued', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', subColor: 'text-amber-600 bg-amber-100' },
          { label: 'Average Authority', value: `${dashboardMetrics.avgAuthorityScore}%`, sub: 'Authority', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', subColor: 'text-emerald-600 bg-emerald-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.subColor}`}>{stat.sub}</span>
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center shadow-lg shadow-neutral-900/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Quick Create</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {generators.map((gen) => (
              <button
                key={gen.id}
                onClick={() => {
                  setActiveTab('generator');
                  setActiveGenerator(gen.id);
                }}
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200 hover:shadow-sm group"
              >
                <div className="w-12 h-12 bg-white border border-slate-200 group-hover:border-pink-200 group-hover:bg-pink-50 rounded-xl flex items-center justify-center transition-colors">
                  {React.cloneElement(gen.icon as any, { className: 'w-5 h-5 text-slate-600 group-hover:text-pink-600' })}
                </div>
                <span className="text-sm font-medium text-slate-700">{gen.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Trending Topics</h2>
          </div>
          <div className="space-y-4">
            {trendingTopics.map((topic) => (
              <div key={topic.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all duration-200">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{topic.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{topic.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{topic.timeframe}</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    topic.competitionLevel === 'Low'
                      ? 'text-green-600 bg-green-100'
                      : topic.competitionLevel === 'Medium'
                        ? 'text-yellow-600 bg-yellow-100'
                        : 'text-red-600 bg-red-100'
                  }`}
                >
                  {topic.competitionLevel}
                </span>
                <button
                  onClick={() => {
                    setFormData({ topic: topic.title, platforms: ['LinkedIn'] });
                    setActiveTab('generator');
                    setActiveGenerator('post-generator');
                  }}
                  className="p-2 text-neutral-900 hover:bg-slate-200 rounded-lg transition-colors ml-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Content Suggestions</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contentSuggestions.map((s) => (
            <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    s.difficulty === 'Easy'
                      ? 'text-green-600 bg-green-100'
                      : s.difficulty === 'Medium'
                        ? 'text-yellow-600 bg-yellow-100'
                        : 'text-red-600 bg-red-100'
                  }`}
                >
                  {s.difficulty}
                </span>
                <span className="text-xs text-slate-500">{s.timeToCreate}</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-pink-600 transition-colors">{s.topic}</h3>
              <p className="text-sm text-slate-600 mb-4">{s.angle}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span>~{s.estimatedEngagement}</span>
                </div>
                <button
                  onClick={() => {
                    setFormData({ topic: s.topic, platforms: s.platforms });
                    setActiveTab('generator');
                    setActiveGenerator('post-generator');
                  }}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGenerator = () => (
    <div className="space-y-8 animate-fade-in-up">
      {!activeGenerator ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center shadow-lg shadow-neutral-900/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Content Generators</h2>
          </div>
          <p className="text-slate-600 mb-8">Choose a generator to create professional content for your brand.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {generators.map((gen) => (
              <button
                key={gen.id}
                onClick={() => setActiveGenerator(gen.id)}
                className="flex flex-col items-center gap-4 p-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all duration-200 hover:shadow-lg group text-left"
              >
                <div className="w-14 h-14 bg-white border border-slate-200 group-hover:border-pink-200 group-hover:bg-pink-50 rounded-2xl flex items-center justify-center shadow-sm transition-all">
                  {React.cloneElement(gen.icon as any, { className: 'w-6 h-6 text-slate-600 group-hover:text-pink-600' })}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-neutral-900 mb-1">{gen.name}</h3>
                  <p className="text-sm text-slate-500">{gen.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveGenerator(null);
                  setGeneratedContent(null);
                  setError(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center shadow-lg shadow-neutral-900/20">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">{generators.find((g) => g.id === activeGenerator)?.name || 'Generator'}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">Topic / Theme</label>
                <input
                  value={formData.topic || ''}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="e.g., AI in Healthcare, Remote Work Tips"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">Target Audience</label>
                <select
                  value={formData.targetAudience || 'professionals'}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-neutral-900/10"
                >
                  <option value="professionals">Professionals</option>
                  <option value="executives">Executives & Leaders</option>
                  <option value="developers">Developers & Engineers</option>
                  <option value="entrepreneurs">Entrepreneurs</option>
                  <option value="students">Students & New Grads</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {['professional', 'conversational', 'inspiring', 'educational', 'humorous'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setFormData({ ...formData, tone })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.tone === tone ? 'bg-neutral-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Medium'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        const current: string[] = formData.platforms || [];
                        const next = current.includes(platform) ? current.filter((p) => p !== platform) : [...current, platform];
                        setFormData({ ...formData, platforms: next });
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        formData.platforms?.includes(platform) ? 'bg-neutral-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {platform === 'LinkedIn' && <Linkedin className="w-4 h-4" />}
                      {platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                      {(platform === 'Facebook' || platform === 'Instagram') && <Globe className="w-4 h-4" />}
                      {platform === 'Medium' && <BookOpen className="w-4 h-4" />}
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">Content Length</label>
                <div className="flex gap-2">
                  {['short', 'medium', 'long'].map((len) => (
                    <button
                      key={len}
                      onClick={() => setFormData({ ...formData, contentLength: len })}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.contentLength === len ? 'bg-neutral-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {len.charAt(0).toUpperCase() + len.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateContent}
                disabled={isLoading || !formData.topic}
                className="w-full py-4 bg-neutral-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Generate Content
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-neutral-900">Preview</h3>
                {generatedContent && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyToClipboard(generatedContent)} className="p-2 text-slate-500 hover:bg-white rounded-lg transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-white rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 bg-white rounded-xl border border-slate-100 shadow-sm min-h-[400px] overflow-auto">
                {generatedContent ? (
                  <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap">{generatedContent}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                    <p>Your generated content will appear here</p>
                  </div>
                )}
              </div>
              {generatedContent && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-500">{generatedContent.split(/\s+/).length} words</span>
                  <span className="text-sm text-slate-500">{generatedContent.length} characters</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {contentHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Content History</h2>
          </div>
          <div className="space-y-4">
            {contentHistory.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-start justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all duration-200 group">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bold">{item.type}</span>
                    {item.metadata?.platforms?.map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                        {p}
                      </span>
                    ))}
                    <span className="text-xs text-slate-400">{getTimeAgo(item.metadata?.timestamp)}</span>
                  </div>
                </div>
                <button onClick={() => copyToClipboard(item.content)} className="p-2 text-slate-400 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    const safeActiveDay = Math.min(activeCalendarDay, daysInMonth);
    const selectedFullDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), safeActiveDay);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const filteredPosts = scheduledPosts.filter((p) => calendarPlatformFilter === 'All' || p.platform === calendarPlatformFilter);
    const getPostsForDay = (day: number) => {
      const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
      return filteredPosts.filter((p) => p.scheduledDate.split('T')[0] === dateStr);
    };
    const selectedDayPosts = getPostsForDay(safeActiveDay);

    return (
      <div className="animate-fade-in-up h-[calc(100vh-200px)] flex flex-col">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} className="p-1 hover:bg-white rounded-md shadow-sm transition-all">
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 font-bold min-w-[140px] text-center">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} className="p-1 hover:bg-white rounded-md shadow-sm transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setActiveCalendarDay(new Date().getDate());
              }}
              className="text-sm font-bold text-slate-600 hover:text-neutral-900"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
            {['All', 'LinkedIn', 'Twitter', 'Instagram', 'Medium'].map((p) => (
              <button
                key={p}
                onClick={() => setCalendarPlatformFilter(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  calendarPlatformFilter === p ? 'bg-neutral-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 gap-px bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex-1">
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="bg-slate-50/50" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const posts = getPostsForDay(day);
                const isSelected = day === safeActiveDay;
                const isToday = new Date().toDateString() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString();
                return (
                  <div
                    key={day}
                    onClick={() => setActiveCalendarDay(day)}
                    className={`bg-white p-2 min-h-[80px] cursor-pointer transition-all relative group hover:bg-slate-50 ${isSelected ? 'ring-2 ring-inset ring-neutral-900 z-10' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-neutral-900 text-white' : 'text-slate-700'}`}>
                        {day}
                      </span>
                      {posts.length > 0 && <span className="text-[10px] font-bold text-slate-400">{posts.length}</span>}
                    </div>
                    <div className="space-y-1">
                      {posts.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          className={`h-1.5 rounded-full w-full ${
                            post.platform === 'LinkedIn' ? 'bg-blue-500' : post.platform === 'Twitter' ? 'bg-sky-400' : post.platform === 'Instagram' ? 'bg-pink-500' : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-neutral-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus size={16} className="text-neutral-900" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-neutral-900">{selectedFullDate.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                <p className="text-sm text-slate-500">{selectedFullDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
              </div>
              <button className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg shadow-neutral-900/20">
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {selectedDayPosts.length > 0 ? (
                selectedDayPosts.map((post) => (
                  <div key={post.id} className="group p-3 border border-slate-100 rounded-xl hover:border-slate-300 transition-all bg-slate-50 hover:bg-white hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`p-1.5 rounded-lg text-white ${
                          post.platform === 'LinkedIn' ? 'bg-blue-600' : post.platform === 'Twitter' ? 'bg-sky-500' : post.platform === 'Instagram' ? 'bg-pink-500' : 'bg-slate-500'
                        }`}
                      >
                        {post.platform === 'LinkedIn' && <Linkedin size={12} />}
                        {post.platform === 'Twitter' && <Twitter size={12} />}
                        {(post.platform === 'Instagram' || post.platform === 'Medium') && <Globe size={12} />}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' : post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-neutral-900 mb-1 line-clamp-2">{post.title}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {new Date(post.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <Calendar size={18} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">No posts scheduled</p>
                  <p className="text-xs text-slate-300">Tap + to add content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Content Analytics</h2>
              <p className="text-slate-500 text-sm">Track your content performance and audience growth.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAnalyticsLoading(true)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium">
              <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))} className="px-4 py-2 border border-slate-300 rounded-lg bg-white font-medium">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading analytics...</p>
            </div>
          </div>
        ) : analyticsData ? (
          <>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyticsData.insights?.map((insight: any, i: number) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    insight.type === 'positive' ? 'bg-green-50 border-green-100' : insight.type === 'negative' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className={`mt-0.5 ${insight.type === 'positive' ? 'text-green-600' : insight.type === 'negative' ? 'text-red-600' : 'text-blue-600'}`}>
                    {insight.type === 'positive' ? <TrendingUp size={16} /> : insight.type === 'negative' ? <TrendingUp size={16} className="rotate-180" /> : <Info size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1">{insight.title}</p>
                    <p className="text-xs leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Content', val: analyticsData.totalContent, trend: analyticsData.trends?.totalContent },
                { label: 'Total Views', val: formatNumber(analyticsData.totalViews), trend: analyticsData.trends?.totalViews },
                { label: 'Engagement Rate', val: formatPercentage(analyticsData.averageEngagementRate), trend: analyticsData.trends?.engagementRate },
                { label: 'Total Engagement', val: formatNumber(analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares), trend: analyticsData.trends?.totalEngagement },
              ].map((m, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{m.label}</div>
                    {m.trend && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ArrowUp size={10} /> {m.trend}%
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">{m.val}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-slate-600">Start generating content to see your analytics here.</p>
          </div>
        )}
      </div>

      {analyticsData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Content Performance Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="views" stroke="#8b5cf6" fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="engagement" stroke="#10b981" fill="url(#colorEngagement)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Audience Breakdown</h3>
              <div className="space-y-6">
                {analyticsData.audienceDemographics?.map((seg: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2 font-bold text-slate-700">
                      <span>{seg.label}</span>
                      <span>{seg.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className={`h-3 rounded-full ${seg.color}`} style={{ width: `${seg.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Content by Platform</h3>
              <div className="space-y-5">
                {Object.entries(analyticsData.contentByPlatform).map(([platform, count]: any) => {
                  const max = Math.max(...(Object.values(analyticsData.contentByPlatform) as number[]));
                  return (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">{platform}</span>
                        <span className="text-sm font-bold text-neutral-900">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Posting Consistency</h3>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Active Streak: 5 Days</span>
              </div>
              <div className="flex gap-1.5 justify-center overflow-x-auto pb-2">
                {Array.from({ length: 16 }).map((_, w) => (
                  <div key={w} className="grid grid-rows-7 gap-1.5">
                    {Array.from({ length: 7 }).map((_, d) => {
                      const op = Math.random() > 0.6 ? Math.random() : 0.05;
                      return (
                        <div
                          key={d}
                          className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 ${
                            op <= 0.05 ? 'bg-slate-100' : op < 0.4 ? 'bg-green-200' : op < 0.7 ? 'bg-green-400' : 'bg-green-600'
                          }`}
                          title={`Activity: ${Math.round(op * 100)}%`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-center items-center gap-2 mt-4 text-xs text-slate-400">
                <span>Less</span>
                <div className="w-3 h-3 bg-slate-100 rounded-sm" />
                <div className="w-3 h-3 bg-green-200 rounded-sm" />
                <div className="w-3 h-3 bg-green-400 rounded-sm" />
                <div className="w-3 h-3 bg-green-600 rounded-sm" />
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Top Performing Content</h3>
            <div className="space-y-4">
              {analyticsData.topPerformingContent.map((c: any, idx: number) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-110 ${
                        idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 'bg-gradient-to-br from-orange-400 to-red-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 text-lg">{c.title}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className={`w-2 h-2 rounded-full ${c.platform === 'LinkedIn' ? 'bg-blue-600' : c.platform === 'Twitter' ? 'bg-sky-500' : 'bg-slate-400'}`} />
                        {c.platform}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-neutral-900">
                      {formatNumber(c.views)} <span className="text-sm font-normal text-slate-500">views</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded border border-slate-200 inline-block mt-1">
                      {formatPercentage(c.engagement_rate)} engagement
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Content Templates</h2>
          </div>
          <button className="px-4 py-2 bg-neutral-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Thought Leadership Post', type: 'post', platform: 'LinkedIn', description: 'Share insights and establish authority' },
            { name: 'Product Launch Announcement', type: 'post', platform: 'All', description: 'Announce new products or features' },
            { name: 'Weekly Tips Thread', type: 'thread', platform: 'Twitter', description: 'Share weekly tips and tricks' },
            { name: 'Case Study Article', type: 'article', platform: 'Medium', description: 'Deep-dive case studies' },
            { name: 'Behind the Scenes', type: 'post', platform: 'Instagram', description: 'Show your work process' },
            { name: 'Industry News Carousel', type: 'carousel', platform: 'LinkedIn', description: 'Curate and share news' },
          ].map((t, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  {t.type === 'post' && <FileText className="w-5 h-5 text-slate-600" />}
                  {t.type === 'thread' && <MessageSquare className="w-5 h-5 text-slate-600" />}
                  {t.type === 'article' && <BookOpen className="w-5 h-5 text-slate-600" />}
                  {t.type === 'carousel' && <Layers className="w-5 h-5 text-slate-600" />}
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">{t.platform}</span>
              </div>
              <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-pink-600 transition-colors">{t.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{t.description}</p>
              <button
                onClick={() => {
                  setActiveTab('generator');
                  setActiveGenerator(t.type === 'carousel' ? 'carousel-maker' : `${t.type}-generator`);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-neutral-900 hover:text-white text-slate-700 font-bold rounded-lg transition-colors"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <FeatureGate requiredTier="ultimate">
      <div className="space-y-8 animate-fade-in-up">
        <FeatureQuickStartWizard
          isOpen={showQuickStartWizard}
          onClose={() => setShowQuickStartWizard(false)}
          steps={[
            { title: 'Choose Content Type', description: 'Select what you want to create (post, article, thread, carousel).', tips: ['Start with posts for consistency', 'Use threads for quick tips'], actionLabel: 'Got it!' },
            { title: 'Define Your Topic', description: 'Pick a topic, audience and tone for stronger results.', tips: ['Be specific', 'Match your audience'], actionLabel: 'Continue' },
            { title: 'Generate & Refine', description: 'Generate content, then edit to match your voice.', tips: ['Add personal examples', 'Try a different tone'], actionLabel: 'Continue' },
            { title: 'Schedule or Publish', description: 'Use the calendar to plan publishing and track performance in analytics.', tips: ['Schedule consistently', 'Review analytics weekly'], actionLabel: 'Get Started!' },
          ]}
        />

        {showWorkflowPrompt && workflowContext?.workflowId === 'personal-brand-job-discovery' && (
          <WorkflowPrompt
            message="✅ Content Created! Your brand content has been generated. Showcase it in your portfolio!"
            actionText="Showcase Portfolio"
            onDismiss={() => setShowWorkflowPrompt(false)}
            onAction={() => setShowWorkflowPrompt(false)}
          />
        )}

        <div className="mb-2">
          <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.id ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-neutral-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'generator' && renderGenerator()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'templates' && renderTemplates()}

        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </div>
    </FeatureGate>
  );
};

const ContentEngineModule = () => <ContentEngine />;

export default ContentEngineModule;

