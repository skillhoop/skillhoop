import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowRightCircle,
  ArrowUp,
  Award,
  BarChart3,
  Bell,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  Download,
  Eye,
  Feather,
  FileText,
  Flag,
  Flame,
  Footprints,
  Github,
  Globe,
  History,
  Lightbulb,
  Linkedin,
  ListTodo,
  Megaphone,
  MessagesSquare,
  RefreshCw,
  Scan,
  Scale,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  Wand2,
  X,
  Zap,
} from 'lucide-react';

/**
 * Brand Audit Module (self-contained)
 * Based on the user's provided "Dashboard Only Mode" snippet, adapted to:
 * - TypeScript
 * - Correct React hooks ordering (AIOptimizerModal)
 * - Lightweight chart mocks (no recharts dependency required for this module)
 */

// --- Mock WorkflowTracking (self-contained) ---
const WorkflowTracking = {
  _context: { workflowId: 'personal-brand-job-discovery' as string },
  getWorkflow: (_id: string) => {
    return {
      steps: [{ id: 'audit-brand', status: 'not-started' as const }],
      isActive: true,
      progress: 30,
    };
  },
  updateStepStatus: (workflowId: string, stepId: string, status: string, data?: unknown) => {
    console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
  },
  getWorkflowContext: () => WorkflowTracking._context,
  setWorkflowContext: (context: Record<string, unknown>) => {
    console.log('Workflow Context Set:', context);
    WorkflowTracking._context = { ...(WorkflowTracking._context as any), ...context };
  },
};

// --- Types ---
type Priority = 'high' | 'medium' | 'low';
type TabId = 'dashboard' | 'analysis' | 'intelligence' | 'insights' | 'goals' | 'achievements';

type BrandScore = {
  overall: number;
  linkedin: number;
  resume: number;
  portfolio: number;
  github: number;
};

type Recommendation = {
  id: string;
  priority: Priority;
  category: 'LinkedIn' | 'Resume' | 'GitHub' | string;
  title: string;
  description: string;
  impact: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  example?: string;
  actionableSteps?: string[];
  canAutoFix?: boolean;
};

type Insight = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  timestamp: string;
  isRead: boolean;
  tags: string[];
  action: string | null;
  metric: string;
  source: string;
};

type Goal = {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'active' | 'completed' | 'paused' | string;
  category: string;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
};

// --- Lightweight “Recharts” mocks (SVG / div only) ---
const RechartsMock = {
  ResponsiveContainer: ({ children, height }: { children: React.ReactNode; height?: number | string }) => (
    <div style={{ height: height ?? 300, width: '100%', position: 'relative' }}>{children}</div>
  ),
  RadarChart: ({ data }: { data: Array<{ metric: string }> }) => (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      <polygon points="100,20 176,64 176,152 100,196 24,152 24,64" fill="#f8fafc" stroke="#e2e8f0" />
      <polygon
        points="100,50 150,80 150,130 100,160 50,130 50,80"
        fill="#e0e7ff"
        stroke="#6366f1"
        fillOpacity="0.25"
      />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
      {data.map((d, i) => {
        const angle = (i * 60 - 90) * (Math.PI / 180);
        const x = 100 + 95 * Math.cos(angle);
        const y = 100 + 95 * Math.sin(angle);
        return (
          <text key={i} x={x} y={y + 5} textAnchor="middle" className="text-[8px] fill-slate-500 uppercase font-bold">
            {d.metric}
          </text>
        );
      })}
    </svg>
  ),
  AreaChart: ({ children }: { children?: React.ReactNode }) => {
    const defs = React.Children.toArray(children).find((child: any) => child?.type === 'defs');
    return (
      <svg viewBox="0 0 400 150" className="w-full h-full">
        {defs}
        <path d="M0,80 Q100,100 200,50 T400,30 V150 H0 Z" fill="url(#colorScore)" />
        <path d="M0,80 Q100,100 200,50 T400,30" fill="none" stroke="#6366f1" strokeWidth="3" />
        <line x1="0" y1="150" x2="400" y2="150" stroke="#e2e8f0" strokeWidth="1" />
        <text x="10" y="145" className="text-[10px] fill-slate-400">
          Now
        </text>
        <text x="380" y="145" className="text-[10px] fill-slate-400">
          W4
        </text>
      </svg>
    );
  },
  BarChart: ({ data }: { data: Array<{ name: string; score: number }> }) => (
    <div className="w-full h-full flex items-end justify-around p-4 gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
          <div
            className={`w-full max-w-[40px] rounded-t-sm transition-all relative ${d.name === 'You' ? 'bg-indigo-500' : 'bg-slate-200'}`}
            style={{ height: `${Math.max(5, Math.min(100, d.score))}%` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.score}
            </div>
          </div>
          <span className={`text-[10px] mt-2 truncate max-w-full ${d.name === 'You' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
            {d.name}
          </span>
        </div>
      ))}
    </div>
  ),
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  Radar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Line: () => null,
  Bar: () => null,
  Area: () => null,
};

const { RadarChart, ResponsiveContainer, AreaChart, BarChart } = RechartsMock as any;

// --- Workflow UI (self-contained) ---
const WorkflowBreadcrumb = ({ workflowId }: { workflowId: string }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-xs font-medium text-slate-500 flex items-center gap-2">
    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Active Workflow</span>
    <span>Personal Brand Discovery</span>
    <ChevronRight size={12} />
    <span className="text-neutral-900 font-bold">Brand Audit</span>
  </div>
);

const WorkflowPrompt = ({
  message,
  actionText,
  onDismiss,
  onAction,
}: {
  message: string;
  actionText: string;
  onDismiss: () => void;
  onAction: (action: 'continue') => void;
}) => (
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

// --- Helper Components ---
const ScanningOverlay = ({
  isScanning,
  progress,
  currentTask,
}: {
  isScanning: boolean;
  progress: number;
  currentTask: string;
}) => {
  if (!isScanning) return null;
  return (
    <div className="absolute inset-0 z-50 bg-neutral-900/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 animate-fade-in-up text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <Scan size={32} className="animate-pulse" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Analyzing Brand Footprint</h3>
      <p className="text-indigo-300 font-mono text-sm mb-8">{currentTask}</p>
      <div className="w-full max-w-xs bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-indigo-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex gap-2 text-xs font-mono text-slate-500">
        <span className={progress > 20 ? 'text-green-400' : 'text-slate-600'}>HEADLINE</span>
        <span>•</span>
        <span className={progress > 40 ? 'text-green-400' : 'text-slate-600'}>KEYWORDS</span>
        <span>•</span>
        <span className={progress > 60 ? 'text-green-400' : 'text-slate-600'}>IMAGES</span>
        <span>•</span>
        <span className={progress > 80 ? 'text-green-400' : 'text-slate-600'}>ACTIVITY</span>
      </div>
    </div>
  );
};

// NOTE: Hooks must run unconditionally; do NOT early-return before useState/useEffect.
const AIOptimizerModal = ({
  isOpen,
  onClose,
  recommendation,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  onApply: (optionId: number | null) => void;
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedOption(null);
      setIsApplying(false);
    }
  }, [isOpen]);

  if (!isOpen || !recommendation) return null;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      onApply(selectedOption);
      setIsApplying(false);
      onClose();
    }, 1500);
  };

  const options = [
    { id: 1, text: 'Senior Product Designer | UX Strategy | Design Systems Expert | 8+ Years Experience', tags: ['Professional', 'Keyword-Rich'] },
    { id: 2, text: 'Helping SaaS Companies Scale through User-Centric Product Design 🚀', tags: ['Impact-Focused', 'Engaging'] },
    { id: 3, text: 'Product Designer @ TechFlow | Building Future of FinTech', tags: ['Role-Specific', 'Clean'] },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10002] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh] animate-fade-in-up shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Wand2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900">AI Optimization</h3>
              <p className="text-xs text-slate-500">Fixing: {recommendation.title}</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <span className="text-xs font-bold text-red-500 uppercase mb-1 block">Current Version</span>
            <p className="text-slate-700 font-medium">"Product Designer"</p>
            <p className="text-xs text-red-400 mt-2">Problem: Too generic, missing high-value keywords.</p>
          </div>

          <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" />
            Select an optimized version:
          </h4>

          <div className="space-y-3">
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative group ${
                  selectedOption === opt.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    {opt.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 bg-white rounded text-slate-500 border border-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {selectedOption === opt.id && <CheckCircle2 size={20} className="text-indigo-600" />}
                </div>
                <p className={`font-medium text-lg ${selectedOption === opt.id ? 'text-indigo-900' : 'text-slate-700'}`}>{opt.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedOption || isApplying}
            className="px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Applying Fix...
              </>
            ) : (
              <>
                <Zap size={16} /> Apply Optimization
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Mock Data Generators ---
const generateMockInsights = (): Insight[] => [
  {
    id: '1',
    title: 'LinkedIn Engagement Spiking',
    description:
      'Your recent post about "Design Systems" is outperforming your average by 2.4x. This is a prime moment to connect with the 45 new viewers.',
    category: 'engagement',
    priority: 'high',
    timestamp: '2 hours ago',
    isRead: false,
    tags: ['linkedin', 'growth'],
    action: 'View Interactions',
    metric: '+240% vs avg',
    source: 'brand-audit',
  },
  {
    id: '2',
    title: 'Profile Conversion Alert',
    description: 'While views are up, connection requests are flat. Our analysis suggests your "About" section lacks a clear call-to-action.',
    category: 'optimization',
    priority: 'high',
    timestamp: '5 hours ago',
    isRead: false,
    tags: ['profile', 'conversion'],
    action: 'Fix "About" Section',
    metric: '40% Drop-off',
    source: 'brand-audit',
  },
  {
    id: '3',
    title: 'New Skill Demand Detected',
    description: '3 recruiters who viewed your profile also searched for "Figma Variables". Adding this skill could boost relevance.',
    category: 'skills',
    priority: 'medium',
    timestamp: '1 day ago',
    isRead: true,
    tags: ['skills', 'market'],
    action: 'Add Skill',
    metric: 'High Demand',
    source: 'brand-audit',
  },
  {
    id: '4',
    title: 'Weekly Consistency Badge',
    description: 'You hit your goal of 3 engagements this week. Consistency is the #1 driver of long-term brand equity.',
    category: 'milestone',
    priority: 'low',
    timestamp: '2 days ago',
    isRead: true,
    tags: ['habit', 'consistency'],
    action: null,
    metric: 'Goal Met',
    source: 'brand-audit',
  },
];

const generateMockGoals = (): Goal[] => [
  {
    id: '1',
    title: 'Reach 500 LinkedIn Connections',
    description: 'Expand your professional network',
    targetValue: 500,
    currentValue: 385,
    deadline: '2025-03-01',
    status: 'active',
    category: 'network',
  },
  {
    id: '2',
    title: 'Complete Profile to 100%',
    description: 'Fill out all LinkedIn profile sections',
    targetValue: 100,
    currentValue: 85,
    deadline: '2025-02-15',
    status: 'active',
    category: 'profile',
  },
  {
    id: '3',
    title: 'Post Weekly Content',
    description: 'Share valuable insights regularly',
    targetValue: 12,
    currentValue: 4,
    deadline: '2025-04-01',
    status: 'active',
    category: 'content',
  },
];

const generateMockAchievements = (): Achievement[] => [
  { id: '1', title: 'First Steps', description: 'Complete your first brand audit', icon: '🎯', unlockedAt: '2025-01-15', category: 'milestones', rarity: 'common' },
  { id: '2', title: 'Rising Star', description: 'Reach a brand score of 70+', icon: '⭐', unlockedAt: '2025-01-20', category: 'score', rarity: 'rare' },
  { id: '3', title: 'Network Builder', description: 'Connect with 250+ professionals', icon: '🤝', unlockedAt: null, category: 'network', rarity: 'rare' },
  { id: '4', title: 'Thought Leader', description: 'Receive 100+ engagements on a post', icon: '💡', unlockedAt: null, category: 'content', rarity: 'epic' },
  { id: '5', title: 'Brand Master', description: 'Achieve a perfect brand score of 100', icon: '👑', unlockedAt: null, category: 'score', rarity: 'legendary' },
];

const generateScoreHistory = () => {
  const history: Array<{ date: string; score: number; visibility: number; engagement: number }> = [];
  const baseScore = 55;
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.min(100, baseScore + Math.floor(Math.random() * 10) + (6 - i) * 3),
      visibility: Math.min(100, 60 + Math.floor(Math.random() * 15) + (6 - i) * 2),
      engagement: Math.min(100, 50 + Math.floor(Math.random() * 12) + (6 - i) * 3),
    });
  }
  return history;
};

// --- BrandAudit Component ---
const BrandAudit = () => {
  const [workflowContext, setWorkflowContext] = useState<{ workflowId?: string } | null>(null);
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTask, setScanTask] = useState('');
  const [forecastMode, setForecastMode] = useState<'current' | 'accelerated'>('current');

  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [selectedFixRecommendation, setSelectedFixRecommendation] = useState<Recommendation | null>(null);

  const [brandScore, setBrandScore] = useState<BrandScore>({
    overall: 78,
    linkedin: 82,
    resume: 75,
    portfolio: 70,
    github: 68,
  });

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      priority: 'high',
      category: 'LinkedIn',
      title: 'Fix "Headline" Impact',
      description: 'Your headline is too generic. "Product Designer" gets 40% less clicks than benefit-driven headlines.',
      impact: 'High impact',
      difficulty: 'easy',
      example: 'Add a professional headline and about section.',
      actionableSteps: ['Update headline', 'Write summary', 'Add experience details'],
      canAutoFix: true,
    },
    {
      id: '2',
      priority: 'medium',
      category: 'Resume',
      title: 'Add Quantifiable Achievements',
      description: 'Include metrics and numbers to demonstrate your impact.',
      impact: 'Medium impact',
      difficulty: 'medium',
      example: 'Changed "Improved sales" to "Increased sales by 35% in Q2 2024"',
      actionableSteps: ['Review each role', 'Add numbers/percentages', 'Quantify impact'],
      canAutoFix: false,
    },
    {
      id: '3',
      priority: 'medium',
      category: 'GitHub',
      title: 'Improve Repository Documentation',
      description: 'Add README files to your repositories for better visibility.',
      impact: 'Medium impact',
      difficulty: 'easy',
      example: 'Include project description, setup instructions, and screenshots.',
      actionableSteps: ['Create README template', 'Add to each repo', 'Include screenshots'],
      canAutoFix: false,
    },
  ]);

  const [insights, setInsights] = useState<Insight[]>(generateMockInsights());
  const [goals, setGoals] = useState<Goal[]>(generateMockGoals());
  const [achievements, setAchievements] = useState<Achievement[]>(generateMockAchievements());
  const [scoreHistory] = useState(generateScoreHistory());
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [linkedinConnected] = useState(true);

  const [insightFilter, setInsightFilter] = useState<'all' | 'LinkedIn' | 'Resume'>('all');
  const [insightView] = useState<'grid' | 'list'>('grid');

  const radarData = useMemo(
    () => [
      { metric: 'Visibility', value: brandScore.linkedin, fullMark: 100 },
      { metric: 'Engagement', value: 75, fullMark: 100 },
      { metric: 'Presence', value: brandScore.portfolio, fullMark: 100 },
      { metric: 'Network', value: 70, fullMark: 100 },
      { metric: 'Content', value: brandScore.github, fullMark: 100 },
      { metric: 'Skills', value: brandScore.resume, fullMark: 100 },
    ],
    [brandScore],
  );

  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    if (context?.workflowId === 'personal-brand-job-discovery') {
      setWorkflowContext(context);
      const workflow = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
      const auditStep = workflow.steps.find((s) => s.id === 'audit-brand');
      if (auditStep && auditStep.status === 'not-started') {
        WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'audit-brand', 'in-progress');
      }

      if (analysisStatus === 'complete') {
        WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'audit-brand', 'completed', {
          brandScore: brandScore.overall,
          recommendations: recommendations.length,
        });
        setShowWorkflowPrompt(true);
      }
    }
  }, [analysisStatus, brandScore, recommendations.length]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'from-slate-400 to-slate-500';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const runBrandAnalysis = useCallback(async () => {
    setAnalysisStatus('analyzing');
    setScanProgress(0);

    const tasks = [
      { msg: 'Connecting to LinkedIn Graph API...', time: 800 },
      { msg: 'Analyzing Profile Picture Biometrics...', time: 1000 },
      { msg: 'Evaluating Headline SEO & Keywords...', time: 1200 },
      { msg: 'Scanning Activity & Engagement Rates...', time: 1000 },
      { msg: 'Comparing against Industry Leaders...', time: 800 },
      { msg: 'Synthesizing Brand Score...', time: 600 },
    ];

    for (let i = 0; i < tasks.length; i++) {
      setScanTask(tasks[i].msg);
      setScanProgress((i / tasks.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, tasks[i].time));
    }
    setScanProgress(100);

    const newScore: BrandScore = {
      overall: Math.min(100, brandScore.overall + Math.floor(Math.random() * 5)),
      linkedin: Math.min(100, brandScore.linkedin + Math.floor(Math.random() * 3)),
      resume: Math.min(100, brandScore.resume + Math.floor(Math.random() * 4)),
      portfolio: Math.min(100, brandScore.portfolio + Math.floor(Math.random() * 3)),
      github: Math.min(100, brandScore.github + Math.floor(Math.random() * 3)),
    };

    setBrandScore(newScore);
    setLastUpdated(new Date().toLocaleString());
    setAnalysisStatus('complete');

    const workflow = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
    if (workflow && workflow.isActive) {
      WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'audit-brand', 'completed', {
        brandScore: newScore.overall,
        recommendations: recommendations.length,
      });
      WorkflowTracking.setWorkflowContext({
        workflowId: 'personal-brand-job-discovery',
        brandScore: newScore,
        recommendations,
        action: 'optimize-linkedin',
      });
      setShowWorkflowPrompt(true);
    }

    const newInsight: Insight = {
      id: Date.now().toString(),
      title: 'Brand Re-analysis Complete! 🎉',
      description: `Your brand score is now ${newScore.overall}/100. Great progress!`,
      category: 'review',
      priority: 'high',
      timestamp: 'Just now',
      isRead: false,
      tags: ['analysis', 'update'],
      action: null,
      metric: 'Score Updated',
      source: 'brand-audit',
    };
    setInsights((prev) => [newInsight, ...prev]);
  }, [brandScore, recommendations]);

  const handleFixClick = (rec: Recommendation) => {
    setSelectedFixRecommendation(rec);
    setOptimizerOpen(true);
  };

  const handleApplyFix = (_optionId: number | null) => {
    if (!selectedFixRecommendation) return;
    setRecommendations((prev) => prev.filter((r) => r.id !== selectedFixRecommendation.id));
    setBrandScore((prev) => ({
      ...prev,
      overall: Math.min(100, prev.overall + 5),
      linkedin: Math.min(100, prev.linkedin + 8),
    }));

    const hasOptimized = achievements.find((a) => a.id === 'optimized-1');
    if (!hasOptimized) {
      const newAch: Achievement = {
        id: 'optimized-1',
        title: 'Quick Fixer',
        description: 'Used AI to optimize your profile instantly.',
        icon: '⚡',
        unlockedAt: new Date().toISOString(),
        category: 'tools',
        rarity: 'rare',
      };
      setAchievements((prev) => [newAch, ...prev]);
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analysis', label: 'Analysis', icon: <Scan className="w-4 h-4" /> },
    { id: 'intelligence', label: 'Intelligence', icon: <Brain className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
  ];

  const renderDashboardTab = () => (
    <div className="w-full space-y-8 animate-fade-in-up relative">
      <ScanningOverlay isScanning={analysisStatus === 'analyzing'} progress={scanProgress} currentTask={scanTask} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-full">
          <div className="bg-neutral-900 border border-neutral-800 shadow-sm rounded-2xl p-6 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg text-indigo-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                Your Overall Brand Score
              </h3>
              <button
                onClick={runBrandAnalysis}
                disabled={analysisStatus === 'analyzing'}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 border border-neutral-700 text-slate-300 rounded-lg text-sm font-bold hover:bg-neutral-700 hover:text-white transition-all disabled:opacity-50"
              >
                {analysisStatus === 'analyzing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scan className="w-3.5 h-3.5" />
                    Run Deep Scan
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 flex-1">
              <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 relative z-10">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#262626" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeDasharray={`${brandScore.overall * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <span className={`text-5xl font-bold ${getScoreColor(brandScore.overall)}`}>{brandScore.overall}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">/ 100</span>
                </div>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: 'Visibility', value: 85, color: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
                  { label: 'Impact', value: 72, color: 'bg-blue-500', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
                  { label: 'Consistency', value: 90, color: 'bg-purple-500', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]' },
                  { label: 'Network Health', value: 65, color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
                ].map((m) => (
                  <div key={m.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="text-white font-bold">{m.value}/100</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} rounded-full ${m.shadow}`} style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">AI Insight</div>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                    Your profile is trending up. <span className="font-bold text-white">Headline optimization</span> is your highest leverage action right now (
                    <span className="text-emerald-400 font-bold">+12% visibility</span>).
                  </p>
                </div>
                <div className="hidden sm:block w-32 h-12">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,35 Q10,32 20,25 T40,20 T60,15 T80,10 T100,5" fill="none" stroke="#6366f1" strokeWidth="2" />
                    <path d="M0,35 Q10,32 20,25 T40,20 T60,15 T80,10 T100,5 V40 H0 Z" fill="url(#miniGradient)" stroke="none" />
                    <circle cx="100" cy="5" r="3" fill="#fff" stroke="#6366f1" strokeWidth="2" />
                  </svg>
                  <div className="text-[10px] text-right text-slate-500 mt-1">Last 7 Days</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full shadow-sm flex flex-col relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <Eye size={18} />
                </div>
                Market Pulse
              </h3>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1 border border-green-100">
                <TrendingUp size={12} /> +12%
              </span>
            </div>

            <div className="mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-neutral-900">1,240</div>
                <span className="text-xs font-bold text-slate-400">impressions</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Recruiters found you via:</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Product Design', 'SaaS', 'Design Systems'].map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 flex items-center gap-1">
                    <Search size={10} className="text-slate-400" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Who's Viewing</span>
                  <span className="text-indigo-600 cursor-pointer hover:underline">See all</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Airbnb', type: 'Technology', time: '2h ago', logo: 'A' },
                    { name: 'Stripe', type: 'Fintech', time: '5h ago', logo: 'S' },
                  ].map((company, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">{company.logo}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-neutral-900">{company.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {company.type} • {company.time}
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-full">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Channel Ecosystem</h3>
                <p className="text-xs text-slate-500">Real-time sync status and performance.</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                <RefreshCw size={12} /> Sync All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {[
                { label: 'LinkedIn', score: brandScore.linkedin, status: 'Synced', lastSync: '2m ago', icon: <Linkedin className="w-5 h-5" />, bg: 'bg-[#0077b5]/10', color: 'text-[#0077b5]' },
                { label: 'Resume', score: brandScore.resume, status: 'Attention', lastSync: '4d ago', icon: <FileText className="w-5 h-5" />, bg: 'bg-orange-50', color: 'text-orange-600' },
                { label: 'Portfolio', score: brandScore.portfolio, status: 'Synced', lastSync: '1h ago', icon: <Globe className="w-5 h-5" />, bg: 'bg-pink-50', color: 'text-pink-600' },
                { label: 'GitHub', score: brandScore.github, status: 'Synced', lastSync: '5h ago', icon: <Github className="w-5 h-5" />, bg: 'bg-slate-100', color: 'text-slate-700' },
              ].map((metric) => (
                <div key={metric.label} className="group p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white relative">
                  {metric.status === 'Attention' && <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>{metric.icon}</div>
                    <div className={`text-xl font-bold ${getScoreColor(metric.score)}`}>{metric.score}</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">{metric.label}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${metric.status === 'Synced' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {metric.status}
                      </span>
                      <span className="text-[10px] text-slate-400">• {metric.lastSync}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-full">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Weekly Sprint</div>
                  <h3 className="text-lg font-bold">Focus Area</h3>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <Target size={18} className="text-indigo-300" />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Sprint Progress</span>
                  <span className="text-white">65%</span>
                </div>
                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden border border-white/10">
                  <div className="bg-indigo-400 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 border border-white/5">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-400 bg-indigo-400 flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                  <span className="text-xs text-slate-300 line-through">Update Resume</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 border border-white/5">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center" />
                  <span className="text-xs font-bold text-white">Fix LinkedIn Headline</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 opacity-60">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-500 flex items-center justify-center" />
                  <span className="text-xs text-slate-400">Post Case Study</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('goals')}
                className="w-full mt-6 py-2.5 bg-white text-indigo-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                View Sprint Board <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-full">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" /> High-Leverage Fixes
              </h3>
              <div className="text-xs font-bold text-slate-400">Sorted by Impact</div>
            </div>

            <div className="space-y-3 flex-1">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={rec.id} className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white relative overflow-hidden">
                  {index === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                          rec.category === 'LinkedIn'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : rec.category === 'Resume'
                              ? 'bg-orange-50 text-orange-700 border-orange-100'
                              : 'bg-slate-50 text-slate-700 border-slate-100'
                        }`}
                      >
                        {rec.category}
                      </span>
                      {rec.canAutoFix && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          <Sparkles size={10} /> Auto-Fix
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-neutral-900 mb-1">{rec.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{rec.description}</p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:justify-center gap-2 sm:min-w-[100px]">
                    {rec.canAutoFix ? (
                      <button
                        onClick={() => handleFixClick(rec)}
                        className="w-full py-2 px-3 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Zap size={14} /> Fix Now
                      </button>
                    ) : (
                      <button className="w-full py-2 px-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-full">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900">Trophy Case</h3>
              <Award size={18} className="text-orange-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 content-start">
              {achievements
                .filter((a) => a.unlockedAt)
                .slice(0, 4)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="aspect-square rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center p-2 text-center group hover:bg-indigo-50 hover:border-indigo-100 transition-colors"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{achievement.icon}</div>
                    <div className="text-[10px] font-bold text-slate-700 line-clamp-1">{achievement.title}</div>
                    <div className="text-[9px] text-slate-400">
                      {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }) : ''}
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setActiveTab('achievements')}
              className="w-full mt-auto py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors border-t border-slate-100 pt-3"
            >
              View Hall of Fame
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="w-full space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Brand Deep Dive</h2>
          <p className="text-slate-500 text-sm mt-1">Comprehensive audit of your cross-platform presence.</p>
        </div>
        <button
          onClick={runBrandAnalysis}
          disabled={analysisStatus === 'analyzing'}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
        >
          {analysisStatus === 'analyzing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
          Re-Scan All Channels
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-purple-600 font-bold uppercase tracking-wider text-xs mb-2">
                <Sparkles size={14} /> Brand Identity
              </div>
              <h3 className="text-xl font-bold text-neutral-900">The Innovator</h3>
              <p className="text-slate-500 text-sm mt-1">You position yourself as a forward-thinking problem solver.</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Sparkles size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Tone', value: 'Technical & Direct', bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Key Themes', value: 'UX, Systems, Growth', bg: 'bg-emerald-50', text: 'text-emerald-700' },
              { label: 'Perceived Seniority', value: 'Mid-Senior Level', bg: 'bg-amber-50', text: 'text-amber-700' },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-xl border border-slate-100 ${item.bg}`}>
                <div className="text-[10px] font-bold opacity-60 uppercase mb-1">{item.label}</div>
                <div className={`text-sm font-bold ${item.text}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs mb-4">
              <MessagesSquare size={14} /> Voice Consistency
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-neutral-900">94%</span>
              <span className="text-sm font-bold text-green-600 mb-1">Excellent</span>
            </div>
            <p className="text-xs text-slate-500">Your messaging is highly consistent across LinkedIn and your Resume.</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Bio Match</span>
              <span className="text-neutral-900">100%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full">
              <div className="bg-indigo-600 h-full w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Brand Dimensions</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer height="100%">
              <RadarChart data={radarData} />
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-slate-50 rounded-lg p-3 text-xs text-slate-600 text-center">
            <strong>Insight:</strong> High technical visibility, but low content output.
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'LinkedIn', score: 82, icon: <Linkedin size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', metrics: [{ l: 'Headline', v: '90%' }, { l: 'About', v: '70%' }, { l: 'Activity', v: 'High' }] },
            { name: 'Resume', score: 75, icon: <FileText size={18} />, color: 'text-orange-600', bg: 'bg-orange-50', metrics: [{ l: 'ATS Parse', v: '95%' }, { l: 'Keywords', v: 'Low' }, { l: 'Formatting', v: 'Good' }] },
            { name: 'Portfolio', score: 70, icon: <Globe size={18} />, color: 'text-pink-600', bg: 'bg-pink-50', metrics: [{ l: 'UX', v: '85%' }, { l: 'Case Studies', v: 'Needs Work' }, { l: 'Mobile', v: '100%' }] },
            { name: 'GitHub', score: 68, icon: <Github size={18} />, color: 'text-slate-700', bg: 'bg-slate-100', metrics: [{ l: 'Readmes', v: 'Missing' }, { l: 'Activity', v: 'Medium' }, { l: 'Pinned', v: 'Good' }] },
          ].map((channel) => (
            <div key={channel.name} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${channel.bg} ${channel.color}`}>{channel.icon}</div>
                  <span className="font-bold text-neutral-900">{channel.name}</span>
                </div>
                <div className={`text-xl font-bold ${getScoreColor(channel.score)}`}>{channel.score}</div>
              </div>
              <div className="space-y-2">
                {channel.metrics.map((m, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">{m.l}</span>
                    <span className={`font-bold ${m.v.includes('Low') || m.v.includes('Missing') || m.v.includes('Work') ? 'text-red-500' : 'text-slate-700'}`}>
                      {m.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded text-amber-600">
                <Lightbulb size={18} />
              </div>
              Optimization Opportunities
            </h3>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'LinkedIn', 'Resume'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setInsightFilter(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  insightFilter === cat ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations
            .filter((rec) => insightFilter === 'all' || rec.category === insightFilter)
            .map((rec) => (
              <div key={rec.id} className="bg-white rounded-xl p-5 border border-slate-200 hover:border-amber-300 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getPriorityColor(rec.priority)}`}>{rec.priority}</span>
                  <span className="text-slate-300 group-hover:text-amber-500 transition-colors">
                    <ArrowRight size={16} />
                  </span>
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">{rec.title}</h4>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{rec.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">{rec.category}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">{rec.difficulty}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderIntelligenceTab = () => (
    <div className="w-full space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Brand Intelligence</h2>
        <p className="text-slate-500 text-sm mt-1">Predictive market value and competitive benchmarking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />

          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs mb-2">
                <Coins size={14} /> Market Value Estimation
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                $115k – $135k<span className="text-lg text-slate-400 font-normal">/yr</span>
              </h3>
              <p className="text-slate-400 text-sm">
                Estimated salary range for <strong>Product Designer</strong> with Brand Score <strong>{brandScore.overall}</strong>.
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase">Premium</div>
                <div className="text-emerald-400 font-bold">+12%</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-200 leading-snug">
                Increasing your score to <span className="font-bold text-white">85+</span> (Top 10%) correlates with a market value ceiling of{' '}
                <span className="font-bold text-emerald-400">$148k</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Scale size={18} className="text-indigo-600" /> Opportunity Index
            </h4>
            <div className="space-y-4">
              {[
                { label: 'Inbound Leads', value: 35, status: 'Low', color: 'bg-yellow-500' },
                { label: 'Application Success', value: 78, status: 'High', color: 'bg-green-500' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>{row.label}</span>
                    <span className="text-neutral-900">{row.status}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${row.color} h-full rounded-full`} style={{ width: `${row.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              Your profile is optimized for <span className="font-bold text-neutral-900">active applying</span> but needs work for{' '}
              <span className="font-bold text-neutral-900">passive discovery</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Growth Simulator
            </h3>
            <p className="text-sm text-slate-500">Project your brand growth based on activity levels.</p>
          </div>

          <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setForecastMode('current')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                forecastMode === 'current' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Current Pace
            </button>
            <button
              onClick={() => setForecastMode('accelerated')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                forecastMode === 'accelerated' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Zap size={12} className={forecastMode === 'accelerated' ? 'text-yellow-300' : ''} /> Accelerated
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-[220px]">
            <ResponsiveContainer height="100%">
              <AreaChart>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-xl p-4 border ${forecastMode === 'accelerated' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
            <h4 className={`font-bold text-sm mb-3 ${forecastMode === 'accelerated' ? 'text-indigo-900' : 'text-slate-700'}`}>
              {forecastMode === 'accelerated' ? '🚀 To Reach 93/100:' : '🐢 On Current Path:'}
            </h4>
            <ul className="space-y-3">
              {forecastMode === 'accelerated' ? (
                <>
                  <li className="flex items-start gap-2 text-xs text-indigo-800">
                    <div className="mt-0.5 min-w-[16px]">
                      <CheckCircle2 size={14} className="text-indigo-600" />
                    </div>
                    <span>Post 2x weekly on LinkedIn (currently 0.5x)</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-indigo-800">
                    <div className="mt-0.5 min-w-[16px]">
                      <CheckCircle2 size={14} className="text-indigo-600" />
                    </div>
                    <span>Get 3 new Skill Endorsements</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-indigo-800">
                    <div className="mt-0.5 min-w-[16px]">
                      <CheckCircle2 size={14} className="text-indigo-600" />
                    </div>
                    <span>Add "Case Study" to Portfolio</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2 text-xs text-slate-600">
                    <div className="mt-0.5 min-w-[16px]">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />
                    </div>
                    <span>Maintain current profile status</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-600">
                    <div className="mt-0.5 min-w-[16px]">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />
                    </div>
                    <span>Wait for organic views (slow growth)</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Competitive Gap Analysis
          </h3>
          <span className="text-xs font-bold text-slate-500">
            Comparing against <span className="text-indigo-600">Top 10% Talent</span>
          </span>
        </div>

        <div className="h-[260px]">
          <ResponsiveContainer height="100%">
            <BarChart
              data={[
                { name: 'You', score: brandScore.overall },
                { name: 'Industry Avg', score: 66 },
                { name: 'Top 25%', score: 75 },
                { name: 'Top 10%', score: 86 },
                { name: 'Top 1%', score: 95 },
              ]}
            />
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center justify-center gap-2">
            View Full Competitor Report <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="w-full space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Strategic Insights</h2>
          <p className="text-slate-500 text-sm mt-1">AI-driven synthesis of your brand performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Report
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300 border border-white/10 shrink-0">
            <Brain size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                Weekly Executive Brief
              </span>
              <span className="text-slate-400 text-xs">Generated 2m ago</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">High Visibility, Low Conversion</h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              You're successfully driving traffic through your recent "Design Systems" content (+240% reach), but you have a <strong>40% drop-off rate</strong>{' '}
              at your profile's "About" section.
              <br />
              <br />
              <strong>Strategic Move:</strong> Add a clear Call to Action in your bio immediately.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-[140px]">
            <button className="px-4 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
              Fix Bio Now <ArrowRight size={14} />
            </button>
            <button className="px-4 py-2 bg-transparent border border-white/20 text-slate-300 rounded-lg text-sm font-bold hover:bg-white/5 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Actions', val: '3', icon: <ListTodo size={16} />, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'New Alerts', val: '2', icon: <Bell size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Opportunities', val: '5', icon: <Lightbulb size={16} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Resolved', val: '12', icon: <CheckCircle2 size={16} />, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="text-xl font-bold text-neutral-900 leading-none mb-1">{stat.val}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Today
        </h4>
        <div className="space-y-4">
          {insights
            .filter((i) => !i.isRead)
            .map((insight) => (
              <div key={insight.id} className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />

                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div
                      className={`mt-1 p-2 rounded-lg shrink-0 ${
                        insight.category === 'engagement' ? 'bg-blue-50 text-blue-600' : insight.category === 'optimization' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {insight.category === 'engagement' ? <Megaphone size={20} /> : <Sparkles size={20} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-neutral-900 text-lg">{insight.title}</h4>
                        {insight.metric ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              insight.metric.includes('+') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}
                          >
                            {insight.metric}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-3">{insight.description}</p>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${getPriorityColor(insight.priority)}`}>
                          {insight.priority} Priority
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} /> {insight.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {insight.action ? (
                    <button className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 shadow-sm">
                      {insight.action} <ArrowRightCircle size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-8">Earlier This Week</h4>
        <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
          {insights
            .filter((i) => i.isRead)
            .map((insight) => (
              <div key={insight.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                  <History size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-700">{insight.title}</h4>
                  <p className="text-xs text-slate-500">{insight.description}</p>
                </div>
                <div className="text-right">
                  {insight.metric ? <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded mb-1 inline-block">{insight.metric}</div> : null}
                  <div className="text-[10px] text-slate-400">{insight.timestamp}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderGoalsTab = () => {
    const enrichedGoals = goals.map((g) => ({
      ...g,
      nextStep:
        g.category === 'network'
          ? 'Connect with 5 alumni from your university'
          : g.category === 'profile'
            ? 'Add "Featured" section with your portfolio'
            : 'Draft a post about "React Performance"',
    }));

    return (
      <div className="w-full space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Growth Roadmap</h2>
            <p className="text-slate-500 text-sm mt-1">
              Strategic milestones to achieve your <span className="text-indigo-600 font-bold">North Star</span>.
            </p>
          </div>
          <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-neutral-900/20">
            <X className="hidden" />
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-white/10">
                <span className="text-white text-[10px]">+</span>
              </span>
              Set New Goal
            </span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-1 shadow-lg overflow-hidden">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider text-xs mb-3">
                  <Flag size={14} /> Primary Career Objective
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Senior Product Designer Role</h3>
                <p className="text-slate-300 text-sm mb-6 max-w-lg">
                  Secure a senior role at a Tier-1 Fintech company by <span className="text-white font-bold">Q4 2025</span>.
                </p>

                <div className="flex gap-4">
                  {[
                    { label: 'Brand Score', val: '80+', current: `${brandScore.overall}`, status: 'Near' },
                    { label: 'Case Studies', val: '3', current: '2', status: 'Gap' },
                    { label: 'Referrals', val: '5', current: '1', status: 'Gap' },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/10 border border-white/10 rounded-lg px-4 py-2">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">{m.label}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-white font-bold">{m.current}</span>
                        <span className="text-slate-500 text-xs">/ {m.val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4 border border-white/10 backdrop-blur-md">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#818cf8" strokeWidth="8" strokeDasharray="180 283" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm">65%</div>
                </div>
                <div>
                  <div className="font-bold text-white text-sm">On Track</div>
                  <div className="text-xs text-indigo-300">Target: Oct 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2">
              <Target size={18} className="text-indigo-600" /> Active Focus
            </h3>

            {enrichedGoals.map((goal) => {
              const progress = (goal.currentValue / goal.targetValue) * 100;
              const icon =
                goal.category === 'network' ? <Users size={20} /> : goal.category === 'content' ? <Feather size={20} /> : <User size={20} />;

              const accent =
                goal.category === 'network'
                  ? 'bg-blue-50 border-blue-100 text-blue-600'
                  : goal.category === 'content'
                    ? 'bg-purple-50 border-purple-100 text-purple-600'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-600';

              return (
                <div key={goal.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-300 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${accent}`}>{icon}</div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-lg">{goal.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase tracking-wide">{goal.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> Due {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-900">{Math.round(progress)}%</div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>
                        {goal.currentValue} / {goal.targetValue}
                      </span>
                      <span>{Math.max(0, goal.targetValue - goal.currentValue)} to go</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-indigo-600 shadow-sm">
                        <Footprints size={14} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Step</div>
                        <div className="text-sm font-bold text-slate-700">{goal.nextStep}</div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2 mb-4">
                <Flame size={18} className="text-orange-500" /> Habit Streaks
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Daily Login', streak: 12 },
                  { name: 'Weekly Post', streak: 3 },
                ].map((habit) => (
                  <div key={habit.name}>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-slate-700">{habit.name}</span>
                      <span className="text-orange-600 flex items-center gap-1">
                        <Flame size={12} /> {habit.streak} Days
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(7)].map((_, d) => (
                        <div key={d} className={`h-2 flex-1 rounded-full ${d < (habit.streak % 7) ? 'bg-orange-500' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-4">
                <Sparkles size={18} /> Recommended for You
              </h3>
              <p className="text-xs text-indigo-700/80 mb-4">Based on your audit gaps, we suggest focusing on these areas:</p>
              <div className="space-y-3">
                {[
                  { title: 'Publish 2 Case Studies', desc: 'Fixes "Low Evidence" gap in Portfolio.' },
                  { title: 'Get 3 Recommendations', desc: 'Boosts "Social Proof" score on LinkedIn.' },
                ].map((s) => (
                  <div key={s.title} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm cursor-pointer hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-indigo-900">{s.title}</span>
                      <span className="text-indigo-400 text-lg leading-none">+</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAchievementsTab = () => {
    const currentLevel = 4;
    const currentXP = 850;
    const nextLevelXP = 1000;
    const progress = (currentXP / nextLevelXP) * 100;

    return (
      <div className="w-full space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Hall of Fame</h2>
            <p className="text-slate-500 text-sm mt-1">Track your professional milestones and level up.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-sm font-bold text-slate-700">
              <span className="text-neutral-900">{achievements.filter((a) => a.unlockedAt).length}</span> Badges Earned
            </span>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-8 relative overflow-hidden shadow-xl text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg border border-white/10">
                <Crown size={48} className="text-white" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center border-2 border-neutral-800 text-sm font-bold">
                {currentLevel}
              </div>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <h3 className="text-2xl font-bold mb-1">Brand Architect</h3>
              <p className="text-slate-400 text-sm mb-4">
                You are in the top 10% of brand builders. Keep consistent to reach "Thought Leader" status.
              </p>

              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <span>Level {currentLevel}</span>
                <span className="ml-auto">
                  {currentXP} / {nextLevelXP} XP
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2">
              <Target size={18} className="text-indigo-600" /> Next to Unlock
            </h3>

            <div className="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <div className="bg-gradient-to-r from-indigo-50 to-white rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-3xl shadow-sm grayscale opacity-50">
                    🤝
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-neutral-900 text-lg">Network Builder</h4>
                        <p className="text-slate-600 text-sm">Connect with 250+ professionals</p>
                      </div>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded">Rare</span>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="text-indigo-600">215 / 250</span>
                      </div>
                      <div className="w-full bg-white h-2 rounded-full border border-indigo-100">
                        <div className="h-full bg-indigo-500 rounded-full w-[86%]" />
                      </div>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Zap size={12} className="text-yellow-500" /> Reward: +500 XP & Profile Badge
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-neutral-900 flex items-center gap-2 pt-2">
              <Award size={18} className="text-orange-500" /> Collection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`group relative bg-white border ${
                    achievement.unlockedAt ? 'border-slate-200' : 'border-slate-100 bg-slate-50/50'
                  } rounded-xl p-4 transition-all hover:shadow-md hover:border-indigo-200`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                        achievement.unlockedAt ? 'bg-indigo-50 text-neutral-900' : 'bg-slate-100 grayscale opacity-40'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-sm ${achievement.unlockedAt ? 'text-neutral-900' : 'text-slate-400'}`}>{achievement.title}</h4>
                        {achievement.unlockedAt ? <CheckCircle2 size={12} className="text-green-500" /> : null}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{achievement.description}</p>
                      {achievement.unlockedAt ? (
                        <div className="text-[10px] text-slate-400 mt-1">Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className={`absolute left-0 top-0 h-1 w-full rounded-t-xl bg-gradient-to-r ${getRarityColor(achievement.rarity)}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-4">Badge Stats</h3>
              <div className="space-y-4">
                {(['common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
                  <div key={rarity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className={`w-2 h-2 rounded-full ${rarity === 'common' ? 'bg-slate-400' : rarity === 'rare' ? 'bg-blue-500' : rarity === 'epic' ? 'bg-purple-500' : 'bg-yellow-500'}`} />
                      {rarity[0].toUpperCase() + rarity.slice(1)}
                    </div>
                    <span className="font-bold">{achievements.filter((a) => a.rarity === rarity && a.unlockedAt).length}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-2">Total Completion</div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-neutral-900 rounded-full" />
                  </div>
                  <div className="text-right text-xs font-bold mt-1">30%</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-400" /> Top Builders
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 border border-white/5">
                    <div className="font-bold text-yellow-400 w-4">1</div>
                    <div className="w-6 h-6 rounded-full bg-blue-500" />
                    <div className="flex-1 text-sm font-bold">Sarah J.</div>
                    <div className="text-xs text-slate-400">Lvl 8</div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="font-bold text-slate-400 w-4">2</div>
                    <div className="w-6 h-6 rounded-full bg-purple-500" />
                    <div className="flex-1 text-sm font-bold">Mike T.</div>
                    <div className="text-xs text-slate-400">Lvl 7</div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/50">
                    <div className="font-bold text-indigo-300 w-4">3</div>
                    <div className="w-6 h-6 rounded-full bg-indigo-500" />
                    <div className="flex-1 text-sm font-bold">You</div>
                    <div className="text-xs text-indigo-300">Lvl 4</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'analysis':
        return renderAnalysisTab();
      case 'intelligence':
        return renderIntelligenceTab();
      case 'insights':
        return renderInsightsTab();
      case 'goals':
        return renderGoalsTab();
      case 'achievements':
        return renderAchievementsTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up flex flex-col relative">
      <AIOptimizerModal isOpen={optimizerOpen} onClose={() => setOptimizerOpen(false)} recommendation={selectedFixRecommendation} onApply={handleApplyFix} />

      <div className="pt-6 w-full flex-1">
        {showWorkflowPrompt && workflowContext?.workflowId === 'personal-brand-job-discovery' && analysisStatus === 'complete' ? (
          <div className="mb-6">
            <WorkflowPrompt
              message={`✅ Brand Audit Complete! Your brand score is ${brandScore.overall}/100.`}
              actionText="Optimize LinkedIn"
              onDismiss={() => setShowWorkflowPrompt(false)}
              onAction={() => {
                WorkflowTracking.setWorkflowContext({
                  workflowId: 'personal-brand-job-discovery',
                  brandScore,
                  recommendations,
                  action: 'optimize-linkedin',
                });
              }}
            />
          </div>
        ) : null}

        <div className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-1 grid grid-cols-3 md:grid-cols-6 gap-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeTab === tab.id ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' : 'text-slate-500 hover:text-neutral-900 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 min-h-[600px] w-full">{renderTabContent()}</div>
      </div>
    </div>
  );
};

// --- Export Wrapper (used by MI page) ---
const BrandAuditModule = () => (
  <div className="bg-slate-50 min-h-screen">
    <BrandAudit />
  </div>
);

export default BrandAuditModule;

