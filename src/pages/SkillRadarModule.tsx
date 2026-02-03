import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Eye,
  GraduationCap,
  Info,
  PieChart,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  StarOff,
  Target,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';

const BriefcaseIcon = Briefcase;

// --- Mocks for Workflow Context ---

const WorkflowTracking = {
  _context: { workflowId: 'skill-development-advancement' },
  getWorkflow: (id: string) => {
    if (id === 'skill-development-advancement') {
      return { steps: [{ id: 'identify-skills', status: 'not-started' }], isActive: true, progress: 10 };
    }
    return { steps: [], isActive: false, progress: 0 };
  },
  updateStepStatus: (workflowId: string, stepId: string, status: string, data: any) => {
    console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
  },
  setWorkflowContext: (context: any) => {
    console.log('Workflow Context Set:', context);
  },
};

const useWorkflowContext = () => {
  const [context, setContext] = useState({ workflowId: 'skill-development-advancement' });
  return {
    workflowContext: context,
    updateContext: (data: any) => {
      console.log('Workflow Context Updated:', data);
      setContext((prev) => ({ ...prev, ...data }));
    },
  };
};

// --- RECHARTS MOCKS (Lightweight SVG Implementations) ---
const RechartsMock = {
  ResponsiveContainer: ({ children, height }: any) => <div style={{ height: height || 300, width: '100%', position: 'relative' }}>{children}</div>,
  RadarChart: ({ children }: any) => (
    <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
      {/* Background Grid */}
      <circle cx="150" cy="150" r="40" stroke="#e2e8f0" fill="none" />
      <circle cx="150" cy="150" r="80" stroke="#e2e8f0" fill="none" />
      <circle cx="150" cy="150" r="120" stroke="#e2e8f0" fill="none" />
      <line x1="150" y1="30" x2="150" y2="270" stroke="#e2e8f0" />
      <line x1="30" y1="150" x2="270" y2="150" stroke="#e2e8f0" />

      {/* Legend Mock */}
      <g transform="translate(0, -20)">
        <rect x="0" y="0" width="10" height="10" fill="#6366f1" opacity="0.4" />
        <text x="15" y="10" fontSize="10" fill="#64748b">
          Current
        </text>
        <rect x="60" y="0" width="10" height="10" fill="#10b981" opacity="0.2" />
        <text x="75" y="10" fontSize="10" fill="#64748b">
          Target
        </text>
        <line x1="120" y1="5" x2="130" y2="5" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
        <text x="135" y="10" fontSize="10" fill="#64748b">
          30 Days Ago
        </text>
      </g>

      {/* Shape 3 (Ghost/Previous Layer) - Dashed Grey */}
      <path d="M150,90 L210,150 L150,210 L90,150 Z" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />

      {/* Shape 1 (Current) */}
      <path d="M150,50 L250,150 L150,250 L50,150 Z" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />

      {/* Shape 2 (Target) */}
      <path d="M150,70 L230,150 L150,230 L70,150 Z" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />

      {/* Demand Weighted Vertices (Mock Visuals) */}
      <circle cx="150" cy="50" r="6" fill="#6366f1" stroke="white" strokeWidth="2" />
      <circle cx="250" cy="150" r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
      <circle cx="150" cy="250" r="5" fill="#6366f1" stroke="white" strokeWidth="2" />
      <circle cx="50" cy="150" r="4" fill="#6366f1" stroke="white" strokeWidth="2" />

      {children}
    </svg>
  ),
  PolarGrid: ((_: any) => null) as any,
  PolarAngleAxis: ((_: any) => null) as any,
  PolarRadiusAxis: ((_: any) => null) as any,
  Radar: ((_: any) => null) as any,
  Line: ((_: any) => null) as any,
  XAxis: ((_: any) => null) as any,
  YAxis: ((_: any) => null) as any,
  CartesianGrid: ((_: any) => null) as any,
  Tooltip: ((_: any) => null) as any,
  Legend: ((_: any) => null) as any,
  Bar: ((_: any) => null) as any,
  Area: ((_: any) => null) as any,
};

const { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } = RechartsMock;

// --- Components ---

const FeatureGate = ({ children }: any) => <>{children}</>;

const UpgradeModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
          <Sparkles size={24} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900">Upgrade to Pro</h3>
        <p className="text-slate-600 mb-6">Unlock advanced features with our Pro plan.</p>
        <button onClick={onClose} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

const WorkflowBreadcrumb = ({ workflowId }: any) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-xs font-medium text-slate-500 flex items-center gap-2">
    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Active Workflow</span>
    <span>{workflowId === 'job-application-pipeline' ? 'Job Application Pipeline' : workflowId === 'skill-development-advancement' ? 'Skill Development' : 'Career Growth'}</span>
    <div className="w-3 h-3 text-slate-400">
      <ChevronDown size={12} className="-rotate-90" />
    </div>
    <span className="text-neutral-900 font-bold">Current Step</span>
  </div>
);

const WorkflowPrompt = ({ message, actionText, onDismiss, onAction }: any) => (
  <div className="bg-indigo-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-600/20 mb-6 animate-fade-in-up">
    <div className="flex items-center gap-3">
      <div className="bg-white/20 p-2 rounded-full">
        <Sparkles size={20} />
      </div>
      <span className="font-bold text-sm">{message}</span>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => onAction('continue')} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-50 transition-colors">
        {actionText}
      </button>
      <button onClick={onDismiss} className="text-white/60 hover:text-white p-1">
        <X size={18} />
      </button>
    </div>
  </div>
);

// --- Data Constants ---

const radarSkillsData = [
  { subject: 'React', current: 85, target: 95, previous: 70, peerScore: 90, demand: 98, fullMark: 100, verified: true, category: 'Technical' },
  { subject: 'TypeScript', current: 75, target: 90, previous: 60, peerScore: 88, demand: 92, fullMark: 100, verified: false, category: 'Technical' },
  { subject: 'Node.js', current: 70, target: 85, previous: 65, peerScore: 82, demand: 88, fullMark: 100, verified: true, category: 'Technical' },
  { subject: 'Python', current: 60, target: 80, previous: 55, peerScore: 75, demand: 85, fullMark: 100, verified: false, category: 'Technical' },
  { subject: 'AWS', current: 50, target: 75, previous: 40, peerScore: 65, demand: 95, fullMark: 100, verified: false, category: 'Tools' },
  { subject: 'Docker', current: 65, target: 80, previous: 50, peerScore: 70, demand: 82, fullMark: 100, verified: false, category: 'Tools' },
  { subject: 'SQL', current: 80, target: 85, previous: 75, peerScore: 78, demand: 75, fullMark: 100, verified: true, category: 'Technical' },
  { subject: 'GraphQL', current: 55, target: 70, previous: 45, peerScore: 60, demand: 70, fullMark: 100, verified: false, category: 'Technical' },
];

const skillsData = [
  {
    id: 1,
    name: 'AI/ML',
    category: 'technical',
    demandScore: 95,
    growthRate: 45,
    salaryImpact: 25,
    jobCount: 12500,
    trend: 'rising',
    emergingStatus: 'hot',
    isWatched: true,
    learningResources: ['Coursera', 'Fast.ai', 'Kaggle'],
    timeToLearn: '6-12 months',
    relatedSkills: ['Python', 'TensorFlow', 'Data Science'],
    trendHistory: [72, 75, 78, 82, 85, 88, 91, 93, 94, 95],
  },
  {
    id: 2,
    name: 'Kubernetes',
    category: 'tools',
    demandScore: 88,
    growthRate: 32,
    salaryImpact: 20,
    jobCount: 8500,
    trend: 'rising',
    emergingStatus: 'emerging',
    isWatched: false,
    learningResources: ['Kubernetes.io', 'CNCF', 'Linux Academy'],
    timeToLearn: '3-6 months',
    relatedSkills: ['Docker', 'DevOps', 'Cloud'],
    trendHistory: [68, 70, 72, 74, 76, 78, 80, 82, 84, 88],
  },
  // ... (Other skills would go here)
];

const targetRoles = [
  {
    id: 'senior-frontend',
    title: 'Senior Frontend Engineer',
    description: 'Lead frontend development and architecture',
    requiredSkills: [
      { name: 'React', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Node.js', level: 75 },
      { name: 'GraphQL', level: 70 },
      { name: 'AWS', level: 60 },
    ],
  },
  {
    id: 'fullstack-lead',
    title: 'Full Stack Tech Lead',
    description: 'Lead full stack development teams',
    requiredSkills: [
      { name: 'React', level: 85 },
      { name: 'Node.js', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'AWS', level: 80 },
      { name: 'Docker', level: 85 },
    ],
  },
];

// Helper functions
const getDemandColor = (score: number) => {
  if (score >= 90) return 'text-red-600 bg-red-100';
  if (score >= 80) return 'text-orange-600 bg-orange-100';
  if (score >= 70) return 'text-yellow-600 bg-yellow-100';
  if (score >= 60) return 'text-blue-600 bg-blue-100';
  return 'text-slate-600 bg-slate-100';
};

const getGrowthColor = (rate: number) => {
  if (rate > 0) return 'text-green-600';
  if (rate < 0) return 'text-red-600';
  return 'text-slate-600';
};

const getEmergingColor = (status: string) => {
  switch (status) {
    case 'hot':
      return 'text-red-600 bg-red-100';
    case 'emerging':
      return 'text-orange-600 bg-orange-100';
    case 'established':
      return 'text-blue-600 bg-blue-100';
    case 'declining':
      return 'text-slate-600 bg-slate-100';
    default:
      return 'text-slate-600 bg-slate-100';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'rising':
      return '📈';
    case 'falling':
      return '📉';
    case 'stable':
      return '➡️';
    default:
      return '➡️';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'technical':
      return 'text-blue-600 bg-blue-100';
    case 'soft':
      return 'text-green-600 bg-green-100';
    case 'tools':
      return 'text-orange-600 bg-orange-100';
    case 'industry':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-slate-600 bg-slate-100';
  }
};

const views = [
  { id: 'radar', label: 'Skill Radar', icon: '🎯' },
  { id: 'trending', label: 'Trending Skills', icon: '📈' },
  { id: 'watchlist', label: 'My Watchlist', icon: '⭐' },
];

const categories = [
  { id: 'all', label: 'All Categories' },
  { id: 'technical', label: 'Technical' },
  { id: 'soft', label: 'Soft Skills' },
  { id: 'tools', label: 'Tools & Platforms' },
  { id: 'industry', label: 'Industry Knowledge' },
];

const CustomRadarDot = (props: any) => {
  const { cx, cy, payload } = props;
  const radius = (payload.demand / 100) * 4 + 2;
  return <circle cx={cx} cy={cy} r={radius} stroke={props.stroke} strokeWidth={2} fill="white" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))', cursor: 'pointer' }} />;
};

const SimpleBarChart = ({ data, dataKey, targetKey, isSimulationMode }: any) => {
  return (
    <div className="w-full h-full flex flex-col justify-end px-4 pb-8 pt-4 space-y-3 overflow-y-auto custom-scrollbar">
      {data.map((item: any) => (
        <div key={item.subject} className="relative group">
          <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
            <span>{item.subject}</span>
            <div className="flex gap-2">
              <span className={isSimulationMode ? 'text-indigo-400' : 'text-slate-400'}>{item[dataKey]}%</span>
              <span className="text-slate-300">/</span>
              <span className="text-emerald-500">{item[targetKey]}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-10 opacity-60" style={{ left: `${item[targetKey]}%` }}></div>
            <div className={`h-full rounded-full transition-all duration-500 ${isSimulationMode ? 'bg-indigo-500' : 'bg-slate-800'}`} style={{ width: `${item[dataKey]}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SkillDetailPanel = ({ skill, onClose, onBoost, isBoosted }: any) => {
  if (!skill) return null;

  const companies = [
    { name: 'Netflix', logo: 'N', color: 'bg-red-600' },
    { name: 'Airbnb', logo: 'A', color: 'bg-rose-500' },
    { name: 'Linear', logo: 'L', color: 'bg-indigo-600' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-indigo-100 shadow-xl overflow-hidden animate-fade-in-up">
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white relative overflow-hidden">
        <div className="relative z-10">
          <button onClick={onClose} className="absolute top-0 right-0 p-2 text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Zap size={20} className="text-yellow-300 fill-yellow-300" />
            </div>
            <span className="font-bold text-indigo-100 uppercase tracking-wider text-xs">Skill Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{skill.name}</h2>
          <p className="text-indigo-200 text-sm">
            {skill.category} • {skill.demand}% Demand Score
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-2xl font-bold text-emerald-600">+${skill.salaryImpact}k</div>
            <div className="text-xs text-slate-500 font-bold uppercase mt-1">Salary Premium</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-2xl font-bold text-neutral-900">{skill.jobCount?.toLocaleString() || '12.5k'}</div>
            <div className="text-xs text-slate-500 font-bold uppercase mt-1">Open Roles</div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <Building2 size={16} /> Top Employers
          </h3>
          <div className="flex gap-3">
            {companies.map((co, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${co.color}`}>{co.logo}</div>
                <span className="text-sm font-medium">{co.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <GraduationCap size={16} /> Recommended Learning
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">Advanced {skill.name} Patterns</div>
                  <div className="text-xs text-slate-500">Frontend Masters • 4h 30m</div>
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={() => onBoost(skill.name)}
          disabled={isBoosted}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            isBoosted ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-900/20'
          }`}
        >
          {isBoosted ? (
            <>
              <CheckCircle2 size={18} />
              In Active Sprint
            </>
          ) : (
            <>
              <Zap size={18} className="text-yellow-400 fill-yellow-400" />
              Start {skill.name} Sprint
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- Main SkillRadar Component ---

function SkillRadar({ onNavigate }: any) {
  const navigate = (path: string) => {
    console.log('Navigate to:', path);
    if (onNavigate) onNavigate(path);
  };

  const { workflowContext } = useWorkflowContext();
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);
  const [activeView, setActiveView] = useState('radar');
  const [selectedRole, setSelectedRole] = useState(targetRoles[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [skills, setSkills] = useState(skillsData);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [chartView, setChartView] = useState('radar'); // 'radar' | 'bar'

  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulatedValues, setSimulatedValues] = useState<any>({});
  const [comparisonMode, setComparisonMode] = useState('role'); // 'role' | 'peers'
  const [boostedSkills, setBoostedSkills] = useState<string[]>([]);
  const [notification, setNotification] = useState<any>(null);
  const [selectedSkillDetail, setSelectedSkillDetail] = useState<any>(null);

  const handleBoost = (skillName: string) => {
    if (boostedSkills.includes(skillName)) return;
    setBoostedSkills((prev) => [...prev, skillName]);
    setNotification({
      title: 'Sprint Activated 🚀',
      message: `Your custom "${skillName} Accelerator" plan has been added to your dashboard.`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const initialValues: any = {};
    radarSkillsData.forEach((skill) => {
      initialValues[skill.subject] = skill.current;
    });
    setSimulatedValues(initialValues);
  }, [selectedRole]);

  const handleSimulationChange = (skillName: string, value: string) => {
    setSimulatedValues((prev: any) => ({
      ...prev,
      [skillName]: parseInt(value),
    }));
  };

  const currentStats = useMemo(() => {
    const values = isSimulationMode ? simulatedValues : {};
    let totalMatch = 0;
    let count = 0;
    selectedRole.requiredSkills.forEach((req: any) => {
      const current = isSimulationMode ? values[req.name] || 0 : radarSkillsData.find((s) => s.subject === req.name)?.current || 0;
      const match = Math.min(current, req.level) / req.level;
      totalMatch += match;
      count++;
    });
    const roleMatch = Math.round((totalMatch / count) * 100);
    let salaryPotential = 18;
    if (isSimulationMode) {
      let totalGrowth = 0;
      radarSkillsData.forEach((s) => {
        const simVal = values[s.subject] || s.current;
        if (simVal > s.current) totalGrowth += simVal - s.current;
      });
      salaryPotential += Math.floor(totalGrowth / 5);
    }
    const estTime = roleMatch > 90 ? 'Ready' : roleMatch > 80 ? '2w' : '6mo';
    return { roleMatch, salaryPotential, estTime };
  }, [isSimulationMode, simulatedValues, selectedRole]);

  const chartData = useMemo(() => {
    if (!isSimulationMode) return radarSkillsData;
    return radarSkillsData.map((item) => ({
      ...item,
      current: simulatedValues[item.subject] || item.current,
    }));
  }, [isSimulationMode, simulatedValues]);

  const aiInsight = useMemo(() => {
    const biggestGap = radarSkillsData.reduce((prev, current) => {
      const gap = current.target - current.current;
      return gap > prev.target - prev.current ? current : prev;
    }, radarSkillsData[0]);

    if (isSimulationMode) {
      if (currentStats.roleMatch > 90) return `🚀 Excellent! This skill profile makes you a **Top 5% Candidate** for ${selectedRole.title} roles.`;
      return `💡 Increasing **${biggestGap.subject}** to 80% is your fastest path to a 90% Role Match.`;
    }
    return `💡 **AI Insight:** Focusing on **${biggestGap.subject}** will yield the highest ROI for this role, potentially increasing your salary offer by 8%.`;
  }, [isSimulationMode, currentStats.roleMatch, selectedRole]);

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const toggleWatchlist = (skillId: number) => {
    const updatedSkills = skills.map((skill: any) => (skill.id === skillId ? { ...skill, isWatched: !skill.isWatched } : skill));
    setSkills(updatedSkills);
    const watchedCount = updatedSkills.filter((s: any) => s.isWatched).length;
    if (watchedCount > 0) setShowWorkflowPrompt(true);
  };

  const filteredSkills = skills.filter((skill: any) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || skill.relatedSkills.some((rs: string) => rs.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const watchlistSkills = skills.filter((skill: any) => skill.isWatched);

  const renderSparkline = (data: number[], color: string) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 80;
        const y = 20 - ((value - min) / range) * 20;
        return `${x},${y}`;
      })
      .join(' ');
    return (
      <svg width="80" height="20" className="inline-block">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const categoryMastery = useMemo(() => {
    const stats: any = { Technical: { total: 0, count: 0 }, Tools: { total: 0, count: 0 }, Soft: { total: 0, count: 0 } };
    chartData.forEach((s: any) => {
      const cat = s.category || 'Technical';
      if (stats[cat]) {
        stats[cat].total += s.current;
        stats[cat].count += 1;
      } else {
        stats.Technical.total += s.current;
        stats.Technical.count += 1;
      }
    });
    return Object.entries(stats)
      .map(([key, val]: any) => ({
        name: key,
        score: val.count > 0 ? Math.round(val.total / val.count) : 0,
      }))
      .filter((c) => c.score > 0);
  }, [chartData]);

  return (
    <FeatureGate requiredTier="ultimate">
      <div className="space-y-8 animate-fade-in-up p-4 lg:p-8 bg-slate-50 min-h-screen">
        {workflowContext?.workflowId === 'skill-development-advancement' && <WorkflowBreadcrumb workflowId={workflowContext.workflowId} />}

        {notification && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-neutral-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up border border-white/10 w-[90%] max-w-md">
            <div className="bg-emerald-500 rounded-full p-2 shrink-0">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">{notification.title}</h4>
              <p className="text-xs text-slate-300 leading-snug">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-auto text-white/50 hover:text-white">
              <X size={18} />
            </button>
          </div>
        )}

        {showWorkflowPrompt && (
          <WorkflowPrompt
            message={`✅ Skills Identified! You've identified ${watchlistSkills.length} skill${watchlistSkills.length !== 1 ? 's' : ''} to develop. Ready to benchmark them?`}
            actionText="Benchmark Skills"
            onDismiss={() => setShowWorkflowPrompt(false)}
            onAction={(action: string) => {
              if (action === 'continue') navigate('/dashboard/benchmarking');
            }}
          />
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 self-start shadow-sm">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  activeView === view.id ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' : 'text-slate-500 hover:text-neutral-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg leading-none">{view.icon}</span>
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {activeView === 'radar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 flex items-start gap-4 relative overflow-hidden">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                  <Sparkles size={24} className="text-yellow-300" />
                </div>
                <div className="relative z-10">
                  <div
                    dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    className="text-sm leading-relaxed"
                  />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              </div>

              <div className={`border rounded-2xl p-8 shadow-sm h-full flex flex-col transition-all duration-500 ${isSimulationMode ? 'bg-white border-indigo-100 ring-4 ring-indigo-50/50' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSimulationMode ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' : 'bg-slate-50 border border-slate-100 text-neutral-900'}`}>
                      <span className="text-2xl">{isSimulationMode ? '🚀' : '🎯'}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{isSimulationMode ? 'Growth Simulator' : 'Skills Comparison'}</h2>
                      <p className="text-sm text-slate-500 font-medium">{isSimulationMode ? 'Adjust skills to see impact' : 'Your skills vs Target Role'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button onClick={() => setChartView('radar')} className={`p-1.5 rounded-md transition-all ${chartView === 'radar' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-neutral-900'}`} title="Radar View">
                        <Target size={14} />
                      </button>
                      <button onClick={() => setChartView('bar')} className={`p-1.5 rounded-md transition-all ${chartView === 'bar' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-neutral-900'}`} title="Bar View">
                        <BarChart2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button onClick={() => setComparisonMode('role')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${comparisonMode === 'role' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-500 hover:text-neutral-900'}`}>
                        vs Role
                      </button>
                      <button onClick={() => setComparisonMode('peers')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${comparisonMode === 'peers' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-purple-600'}`}>
                        vs Peers
                      </button>
                    </div>
                    <div className="relative">
                      <button onClick={() => setShowRoleDropdown(!showRoleDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 shadow-sm">
                        <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                        <span className="hidden sm:inline max-w-[150px] truncate">{selectedRole.title}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showRoleDropdown && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up">
                          {targetRoles.map((role: any) => (
                            <button
                              key={role.id}
                              onClick={() => {
                                setSelectedRole(role);
                                setShowRoleDropdown(false);
                              }}
                              className={`w-full text-left px-5 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors ${selectedRole.id === role.id ? 'bg-indigo-50/50' : ''}`}
                            >
                              <div className={`font-bold text-sm mb-0.5 ${selectedRole.id === role.id ? 'text-indigo-900' : 'text-slate-900'}`}>{role.title}</div>
                              <div className="text-xs text-slate-500 line-clamp-1">{role.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-80 w-full mb-8 relative rounded-xl border border-slate-50 bg-slate-50/30">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                  {isSimulationMode && (
                    <div className="absolute top-2 right-2 bg-neutral-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg z-10 animate-pulse flex items-center gap-1.5 border border-white/10">
                      <Sparkles size={10} className="text-yellow-400" /> SIMULATION ACTIVE
                    </div>
                  )}

                  {chartView === 'radar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        {!isSimulationMode && <Radar name="30 Days Ago" dataKey="previous" stroke="#94a3b8" fill="none" strokeDasharray="3 3" strokeWidth={1.5} />}
                        <Radar name={isSimulationMode ? 'Simulated Skills' : 'Current Skills'} dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={isSimulationMode ? 0.6 : 0.4} strokeWidth={isSimulationMode ? 3 : 2} dot={<CustomRadarDot />} isAnimationActive={false} />
                        <Radar name={comparisonMode === 'role' ? 'Target Role' : 'Top 10% Peers'} dataKey={comparisonMode === 'role' ? 'target' : 'peerScore'} stroke={comparisonMode === 'role' ? '#10b981' : '#9333ea'} fill={comparisonMode === 'role' ? '#10b981' : '#9333ea'} fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} iconType="circle" />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <SimpleBarChart data={chartData} dataKey="current" targetKey={comparisonMode === 'role' ? 'target' : 'peerScore'} isSimulationMode={isSimulationMode} />
                  )}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-lg">⚠️</span> {comparisonMode === 'role' ? 'Priority Gaps to Address' : 'Competitive Gaps (vs Top 10%)'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {chartData
                      .map((skill: any) => {
                        const targetValue = comparisonMode === 'role' ? skill.target : skill.peerScore;
                        return { ...skill, targetValue, gap: targetValue - skill.current, name: skill.subject, category: skill.category || 'Technical', demand: skill.demand, salaryImpact: 15, jobCount: 12500 };
                      })
                      .sort((a: any, b: any) => b.gap - a.gap)
                      .slice(0, 4)
                      .map((skill: any) => {
                        let impactLabel = 'Standard';
                        let impactColor = 'bg-slate-100 text-slate-500';
                        if (skill.demand > 90) {
                          impactLabel = 'High Impact';
                          impactColor = 'bg-orange-100 text-orange-700';
                        } else if (skill.salaryImpact > 20) {
                          impactLabel = 'Salary Driver';
                          impactColor = 'bg-green-100 text-green-700';
                        }
                        return (
                          <div key={skill.subject} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-full group hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all relative overflow-hidden cursor-pointer" onClick={() => setSelectedSkillDetail(skill)}>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowUpRight size={14} className="text-indigo-500" />
                            </div>
                            <div className="mb-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-slate-900 truncate max-w-[80px] sm:max-w-none">{skill.subject}</span>
                                  {skill.verified && <ShieldCheck size={12} className="text-blue-500 fill-blue-500/10 shrink-0" />}
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${skill.gap > 0 ? 'text-red-500 bg-red-50 border-red-100' : 'text-emerald-500 bg-emerald-50 border-emerald-100'}`}>
                                    {skill.gap > 0 ? `-${skill.gap}%` : 'Top 10%'}
                                  </div>
                                </div>
                              </div>
                              {skill.gap > 0 && !isSimulationMode && <div className={`inline-flex mb-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${impactColor}`}>{impactLabel}</div>}
                              <div className="space-y-1.5 mb-2">
                                <div className="flex justify-between text-xs font-medium">
                                  <span className="text-slate-500">{isSimulationMode ? 'Simulated' : 'Current'}</span>
                                  <span className="text-slate-700">{skill.current}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${getProgressColor(skill.current)}`} style={{ width: `${skill.current}%` }}></div>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-medium">
                                  <span className="text-slate-500">{comparisonMode === 'role' ? 'Target' : 'Peer Avg'}</span>
                                  <span className={comparisonMode === 'role' ? 'text-indigo-600' : 'text-purple-600'}>{skill.targetValue}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div className={`${comparisonMode === 'role' ? 'bg-neutral-900' : 'bg-purple-600'} h-full rounded-full`} style={{ width: `${skill.targetValue}%` }}></div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-auto">
                              {skill.gap > 0 && !isSimulationMode ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBoost(skill.subject);
                                  }}
                                  disabled={boostedSkills.includes(skill.subject)}
                                  className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                    boostedSkills.includes(skill.subject) ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200' : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-md hover:shadow-lg shadow-neutral-900/10'
                                  }`}
                                >
                                  {boostedSkills.includes(skill.subject) ? (
                                    <>
                                      <CheckCircle2 size={12} /> Started
                                    </>
                                  ) : (
                                    <>
                                      <Zap size={12} className="text-yellow-400 fill-yellow-400" /> Boost Skill
                                    </>
                                  )}
                                </button>
                              ) : (
                                <div className="w-full py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 text-xs font-bold text-center flex items-center justify-center gap-1">
                                  <CheckCircle2 size={12} /> On Track
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {selectedSkillDetail ? (
                <SkillDetailPanel skill={selectedSkillDetail} onClose={() => setSelectedSkillDetail(null)} onBoost={handleBoost} isBoosted={boostedSkills.includes(selectedSkillDetail.name)} />
              ) : (
                <>
                  <div className={`border rounded-2xl p-6 shadow-sm transition-colors duration-300 ${isSimulationMode ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${isSimulationMode ? 'text-white' : 'text-slate-900'}`}>
                        <span className="text-xl">💼</span> Role Requirements
                      </h3>
                      <div className="flex items-center gap-1 bg-slate-100/10 p-1 rounded-lg border border-slate-200/20">
                        <button onClick={() => setIsSimulationMode(false)} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${!isSimulationMode ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                          View
                        </button>
                        <button onClick={() => setIsSimulationMode(true)} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 ${isSimulationMode ? 'bg-indigo-500 text-white shadow-sm ring-1 ring-indigo-400' : 'text-slate-500 hover:text-neutral-900'}`}>
                          <Sparkles size={10} /> Simulate
                        </button>
                      </div>
                    </div>
                    <p className={`text-xs font-medium mb-6 leading-relaxed ${isSimulationMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedRole.description}</p>
                    <div className="space-y-4">
                      {selectedRole.requiredSkills.map((skill: any) => {
                        const skillData = radarSkillsData.find((s) => s.subject === skill.name);
                        const currentValue = isSimulationMode ? simulatedValues[skill.name] || 0 : skillData?.current || 0;
                        const isVerified = skillData?.verified;
                        return (
                          <div key={skill.name} className={`${isSimulationMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} p-3 rounded-xl border transition-colors`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold ${isSimulationMode ? 'text-white' : 'text-slate-700'}`}>{skill.name}</span>
                                {isVerified && <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10 cursor-help" />}
                              </div>
                              <div className="flex items-center gap-2">
                                {isSimulationMode && <span className="text-[10px] font-bold text-indigo-300">Target: {skill.level}%</span>}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isSimulationMode ? 'bg-indigo-500 text-white shadow-sm ring-1 ring-white/20' : 'text-indigo-600 bg-indigo-50'}`}>{currentValue}%</span>
                              </div>
                            </div>
                            {isSimulationMode ? (
                              <div className="relative group pt-1 pb-1">
                                <input type="range" min="0" max="100" value={currentValue} onChange={(e) => handleSimulationChange(skill.name, e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white" />
                                <div className="absolute top-1 bottom-1 w-0.5 bg-green-400 z-10 pointer-events-none opacity-50" style={{ left: `${skill.level}%` }} title="Target Level"></div>
                              </div>
                            ) : (
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-neutral-900 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${skill.level}%` }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {isSimulationMode && (
                      <div className="mt-6 pt-6 border-t border-slate-800">
                        <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                          <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-300">Drag sliders to see how learning specific skills impacts your role match score and earning potential.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isSimulationMode && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <PieChart size={16} /> Category Mastery
                      </h3>
                      <div className="space-y-4">
                        {categoryMastery.map((cat: any) => (
                          <div key={cat.name}>
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                              <span>{cat.name}</span>
                              <span className="text-slate-900">{cat.score}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className={`h-full rounded-full ${cat.name === 'Technical' ? 'bg-indigo-500' : cat.name === 'Tools' ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${cat.score}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`border rounded-2xl p-6 shadow-sm transition-all duration-300 ${isSimulationMode ? 'bg-white border-indigo-200 ring-2 ring-indigo-50' : 'bg-white border-slate-200'}`}>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex justify-between items-center">
                      <span>{isSimulationMode ? 'Simulated Outcome' : 'Your Progress'}</span>
                      {isSimulationMode && <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded uppercase">Projected</span>}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`text-center p-4 rounded-xl border transition-colors ${isSimulationMode ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`text-2xl font-bold transition-all ${isSimulationMode ? 'text-indigo-700 scale-110' : 'text-indigo-600'}`}>{currentStats.roleMatch}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Role Match</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-2xl font-bold text-slate-900">4</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Skills to Improve</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-2xl font-bold text-slate-900">{currentStats.estTime}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Est. Time</div>
                      </div>
                      <div className={`text-center p-4 rounded-xl border transition-colors ${isSimulationMode ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`text-2xl font-bold text-green-600 transition-all ${isSimulationMode ? 'scale-110' : ''}`}>+{currentStats.salaryPotential}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Salary Potential</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeView === 'trending' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {categories.map((category) => (
                    <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all duration-200 text-sm border ${selectedCategory === category.id ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-neutral-900'}`}>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill: any) => (
                <div key={skill.id} className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">{skill.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(skill.category)}`}>{skill.category}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getEmergingColor(skill.emergingStatus)}`}>{skill.emergingStatus}</span>
                      </div>
                    </div>
                    <button onClick={() => toggleWatchlist(skill.id)} className={`p-2.5 rounded-xl transition-all ${skill.isWatched ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-600'}`}>
                      {skill.isWatched ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Demand</div>
                      <div className="text-xl font-bold text-indigo-600">{skill.demandScore}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Growth</div>
                      <div className={`text-xl font-bold ${getGrowthColor(skill.growthRate)}`}>{skill.growthRate > 0 ? '+' : ''}{skill.growthRate}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Salary</div>
                      <div className="text-xl font-bold text-green-600">+{skill.salaryImpact}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Openings</div>
                      <div className="text-xl font-bold text-slate-900">{skill.jobCount.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500">30-Day Trend</div>
                    <div className="flex items-center gap-3">
                      {renderSparkline(skill.trendHistory, skill.trend === 'rising' ? '#10b981' : skill.trend === 'falling' ? '#ef4444' : '#64748b')}
                      <span className="text-lg">{getTrendIcon(skill.trend)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium mb-6 px-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="font-bold">⏱</span>
                      {skill.timeToLearn}
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-600">
                      <BookOpen className="w-3.5 h-3.5" />
                      {skill.learningResources.length} resources
                    </div>
                  </div>
                  <div className="mb-6 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Related Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.relatedSkills.map((related: string) => (
                        <span key={related} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200">
                          {related}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <button className="flex-1 bg-neutral-900 text-white py-2.5 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10 text-sm flex items-center justify-center gap-2 active:scale-[0.98]">
                      <Eye className="w-4 h-4" /> Details
                    </button>
                    <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" /> Learn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'watchlist' && (
          <div className="space-y-6">
            {watchlistSkills.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No skills in your watchlist</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start tracking skills by clicking the star icon on any skill card in the Trending view.</p>
                <button onClick={() => setActiveView('trending')} className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10 flex items-center gap-2">
                  <span className="text-lg">📈</span> Browse Trending Skills
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {watchlistSkills.map((skill: any) => (
                  <div key={skill.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{skill.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(skill.category)}`}>{skill.category}</span>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getEmergingColor(skill.emergingStatus)}`}>{skill.emergingStatus}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleWatchlist(skill.id)} className="p-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 hover:bg-amber-100 transition-colors">
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-lg font-bold text-indigo-600">{skill.demandScore}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demand</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className={`text-lg font-bold ${getGrowthColor(skill.growthRate)}`}>{skill.growthRate > 0 ? '+' : ''}{skill.growthRate}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-lg font-bold text-green-600">+{skill.salaryImpact}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="text-lg font-bold text-slate-900">{(skill.jobCount / 1000).toFixed(1)}k</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jobs</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 bg-neutral-900 text-white py-2.5 rounded-xl font-bold hover:bg-neutral-800 transition-all text-sm shadow-lg shadow-neutral-900/10">Start Learning</button>
                      <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Set Goal</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </div>
    </FeatureGate>
  );
}

// --- Export Wrapper ---

const SkillRadarModule = () => {
  return <SkillRadar />;
};

export default SkillRadarModule;

