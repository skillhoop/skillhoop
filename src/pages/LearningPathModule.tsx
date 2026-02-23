import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookmarkPlus,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Filter,
  Flame,
  HelpCircle,
  Heart,
  MessageSquare,
  Play,
  PlusCircle,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Video,
  X,
  FileText,
} from 'lucide-react';

// --- Mocks & Utilities (self-contained) ---

const WorkflowTracking = {
  _context: { workflowId: 'skill-development-advancement', currentJob: null as any },
  getWorkflow: (id: string) => {
    if (id === 'skill-development-advancement') {
      return {
        steps: [
          { id: 'identify-skills', status: 'not-started' },
          { id: 'create-learning-path', status: 'not-started' },
        ],
        isActive: true,
        progress: 10,
      };
    }
    return { steps: [], isActive: false, progress: 0 };
  },
  updateStepStatus: (workflowId: string, stepId: string, status: string, data?: any) => {
    console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
  },
  getWorkflowContext: () => WorkflowTracking._context,
  setWorkflowContext: (context: any) => {
    console.log('Workflow Context Set:', context);
    WorkflowTracking._context = { ...WorkflowTracking._context, ...context };
  },
  completeWorkflow: (id: string) => console.log(`Workflow ${id} completed`),
};

const PinIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="17" x2="12" y2="22"></line>
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
  </svg>
);

// --- RECHARTS MOCKS (Lightweight) ---
const RechartsMock = {
  ResponsiveContainer: ({ children, height }: any) => (
    <div style={{ height: height || 300, width: '100%', position: 'relative' }}>{children}</div>
  ),
  BarChart: ({ data }: any) => (
    <div className="w-full h-full flex items-end justify-around p-4 gap-2 border-l border-b border-slate-100">
      {data.map((d: any, i: number) => (
        <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
          <div
            className="w-full max-w-[40px] bg-[#111827] rounded-t-sm transition-all relative hover:opacity-80"
            style={{ height: `${(d.hours / 12) * 100}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {d.hours} hrs
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">{d.name}</div>
        </div>
      ))}
    </div>
  ),
  CartesianGrid: ((_: any) => null) as any,
  XAxis: ((_: any) => null) as any,
  YAxis: ((_: any) => null) as any,
  Tooltip: ((_: any) => null) as any,
  Bar: ((_: any) => null) as any,
};

const { ResponsiveContainer, BarChart } = RechartsMock;

// --- Data Constants ---

const learningPaths = [
  {
    id: 1,
    title: 'Full-Stack React Development',
    description: 'Master React, Node.js, and MongoDB for complete web development',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express'],
    duration: 90,
    estimatedHours: 120,
    progress: 65,
    difficulty: 'intermediate',
    status: 'in-progress',
    projects: 4,
    streak: 12,
    nextActivity: 'Complete Authentication Module',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    title: 'Cloud Architecture Fundamentals',
    description: 'Learn AWS services and cloud deployment strategies',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    duration: 60,
    estimatedHours: 80,
    progress: 100,
    difficulty: 'advanced',
    status: 'completed',
    projects: 6,
    streak: 0,
    nextActivity: 'Certificate Available',
    createdAt: '2023-11-20',
  },
  {
    id: 3,
    title: 'Python for Data Science',
    description: 'Master Python, pandas, and machine learning basics',
    skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'],
    duration: 75,
    estimatedHours: 100,
    progress: 0,
    difficulty: 'beginner',
    status: 'not-started',
    projects: 5,
    streak: 0,
    nextActivity: 'Start Introduction to Python',
    createdAt: '2024-02-01',
  },
];

const weeklySprints = [
  {
    week: 1,
    title: 'React Fundamentals',
    objectives: ['Understand React components and JSX', 'Learn state management with useState', 'Practice event handling'],
    activities: [
      { id: 1, title: 'Introduction to React', type: 'video', duration: 45, completed: true },
      { id: 2, title: 'JSX and Components', type: 'reading', duration: 30, completed: true },
      { id: 3, title: 'State and Props', type: 'practice', duration: 60, completed: true },
      { id: 4, title: 'Week 1 Quiz', type: 'quiz', duration: 15, completed: true },
    ],
    project: { title: 'Hello World Component', estimatedTime: '2 hours', completed: true },
    completed: true,
  },
  {
    week: 2,
    title: 'Hooks and State Management',
    objectives: ['Master React Hooks (useState, useEffect)', 'Learn custom hooks', 'Understand state lifting'],
    activities: [
      { id: 5, title: 'useState Hook Deep Dive', type: 'video', duration: 50, completed: true },
      { id: 6, title: 'useEffect Hook', type: 'reading', duration: 40, completed: true },
      { id: 7, title: 'Custom Hooks', type: 'practice', duration: 90, completed: false },
      { id: 8, title: 'Week 2 Quiz', type: 'quiz', duration: 15, completed: false },
    ],
    project: { title: 'Counter App with Hooks', estimatedTime: '3 hours', completed: false },
    completed: false,
  },
  {
    week: 3,
    title: 'Advanced Patterns',
    objectives: ['Context API for global state', 'Performance optimization', 'Error boundaries'],
    activities: [
      { id: 9, title: 'Context API Tutorial', type: 'video', duration: 55, completed: false },
      { id: 10, title: 'React.memo & useMemo', type: 'reading', duration: 35, completed: false },
      { id: 11, title: 'Optimization Practice', type: 'practice', duration: 75, completed: false },
      { id: 12, title: 'Week 3 Quiz', type: 'quiz', duration: 15, completed: false },
    ],
    project: { title: 'Theme Switcher App', estimatedTime: '4 hours', completed: false },
    completed: false,
  },
  {
    week: 4,
    title: 'Backend Integration',
    objectives: ['REST API communication', 'Async/await patterns', 'Data fetching best practices'],
    activities: [
      { id: 13, title: 'Fetch API & Axios', type: 'video', duration: 45, completed: false },
      { id: 14, title: 'Error Handling', type: 'reading', duration: 30, completed: false },
      { id: 15, title: 'API Integration Project', type: 'project', duration: 120, completed: false },
    ],
    project: { title: 'Weather App with API', estimatedTime: '5 hours', completed: false },
    completed: false,
  },
];

const recentAchievements = [
  { id: 1, title: 'Week 1 Complete', description: 'Finished React Fundamentals', icon: '🏆', date: '2024-03-10' },
  { id: 2, title: 'Streak Milestone', description: '10 days in a row!', icon: '🔥', date: '2024-03-08' },
  { id: 3, title: 'Project Complete', description: 'Todo App with Hooks', icon: '💻', date: '2024-03-05' },
];

const progressData = [
  { name: 'Week 1', hours: 12, progress: 100 },
  { name: 'Week 2', hours: 10, progress: 75 },
  { name: 'Week 3', hours: 8, progress: 40 },
  { name: 'Week 4', hours: 6, progress: 20 },
];

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'paths', label: 'My Learning Paths', icon: BookOpen },
  { id: 'discover', label: 'Discover Paths', icon: TrendingUp },
  { id: 'community', label: 'Community', icon: Users },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'reading':
      return <FileText className="w-4 h-4" />;
    case 'practice':
      return <Code className="w-4 h-4" />;
    case 'quiz':
      return <HelpCircle className="w-4 h-4" />;
    case 'project':
      return <Target className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const LearningPath = ({ onNavigate }: { onNavigate?: (path: string) => void }) => {
  const navigate = onNavigate || ((p: string) => console.log('Navigating to', p));

  const [workflowContext, setWorkflowContext] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedWeek, setExpandedWeek] = useState<number | null>(2);

  const currentPath = useMemo(() => learningPaths.find((p) => p.status === 'in-progress'), []);

  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    if (context?.workflowId === 'skill-development-advancement') {
      setWorkflowContext(context);
      const workflow = WorkflowTracking.getWorkflow('skill-development-advancement');
      const step = workflow?.steps?.find((s: any) => s.id === 'create-learning-path');
      if (step && step.status === 'not-started') {
        WorkflowTracking.updateStepStatus('skill-development-advancement', 'create-learning-path', 'in-progress');
      }
      if (currentPath) {
        WorkflowTracking.updateStepStatus('skill-development-advancement', 'create-learning-path', 'completed', {
          learningPathTitle: currentPath.title,
          progress: currentPath.progress,
        });
      }
    }
  }, [currentPath]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Tabs + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-white border-slate-200 shadow-sm overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' : 'text-slate-500 hover:text-neutral-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <button className="w-full bg-[#111827] hover:bg-[#1f2937] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#111827]/20">
            <PlusCircle size={18} />
            <span>Create Learning Path</span>
          </button>
        </div>
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Current Learning Path */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-slate-50 w-10 h-10 flex items-center justify-center rounded-lg text-[#111827]">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Current Learning Path</h2>
              </div>

              {currentPath ? (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-neutral-900">{currentPath.title}</h3>
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-amber-50 text-amber-600 border-amber-100">
                          {currentPath.difficulty}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4 text-sm font-medium">{currentPath.description}</p>
                      <div className="flex items-center gap-6 mb-4 text-sm">
                        <span className="font-bold text-slate-700">{currentPath.progress}% Complete</span>
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {currentPath.streak} day streak
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
                        <div className="bg-[#111827] h-2 rounded-full transition-all duration-300" style={{ width: `${currentPath.progress}%` }} />
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="font-bold text-slate-700">Next Up:</span> {currentPath.nextActivity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                    <button className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm">
                      <Play className="w-4 h-4" />
                      Continue Learning
                    </button>
                    <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                      View Syllabus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">No Active Learning Path</h3>
                  <p className="text-slate-500 mb-6 text-sm">Start a new learning journey to begin your skill development</p>
                  <button className="bg-[#111827] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1f2937] transition-all">Create Learning Path</button>
                </div>
              )}
            </div>

            {/* Weekly Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-50 w-10 h-10 flex items-center justify-center rounded-lg text-emerald-600">
                  <Calendar size={20} />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Weekly Timeline</h2>
              </div>

              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
                <div className="space-y-6">
                  {weeklySprints.map((sprint) => (
                    <div key={sprint.week} className="relative pl-16">
                      <div
                        className={`absolute left-4 w-5 h-5 rounded-full border-4 z-10 ${
                          sprint.completed ? 'bg-emerald-500 border-emerald-100' : sprint.week === expandedWeek ? 'bg-[#111827] border-slate-100' : 'bg-slate-300 border-slate-100'
                        }`}
                      />
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-slate-200">
                        <button
                          onClick={() => setExpandedWeek(expandedWeek === sprint.week ? null : sprint.week)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${sprint.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-900 text-white'}`}>
                              {sprint.completed ? <CheckCircle2 className="w-5 h-5" /> : <span>{sprint.week}</span>}
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-neutral-900 text-sm">Week {sprint.week}: {sprint.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{sprint.objectives.length} objectives • {sprint.activities.length} activities</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {sprint.completed && <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">Completed</span>}
                            {expandedWeek === sprint.week ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>

                        {expandedWeek === sprint.week && (
                          <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
                            <div className="mt-4 mb-6">
                              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Learning Objectives</h5>
                              <ul className="space-y-2">
                                {sprint.objectives.map((objective: string, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                    <div className="w-1.5 h-1.5 bg-[#111827] rounded-full" />
                                    {objective}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="mb-6">
                              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Activities</h5>
                              <div className="space-y-2">
                                {sprint.activities.map((activity: any) => (
                                  <div key={activity.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-[#111827]'}`}>
                                        {getActivityIcon(activity.type)}
                                      </div>
                                      <div>
                                        <p className={`text-sm font-bold ${activity.completed ? 'text-slate-500 line-through' : 'text-neutral-900'}`}>{activity.title}</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{activity.duration} min • {activity.type}</p>
                                      </div>
                                    </div>
                                    {activity.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                      <button className="px-3 py-1 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors">Start</button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-[#111827] rounded-lg flex items-center justify-center shadow-sm shadow-slate-200">
                                    <Target className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-neutral-900 text-sm">Week Project: {sprint.project.title}</p>
                                    <p className="text-xs text-slate-500 font-medium">Estimated: {sprint.project.estimatedTime}</p>
                                  </div>
                                </div>
                                {sprint.project.completed ? (
                                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded uppercase">Completed</span>
                                ) : (
                                  <button className="px-4 py-2 bg-slate-50 text-[#111827] border border-slate-100 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all">Start Project</button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-50 w-10 h-10 flex items-center justify-center rounded-lg text-purple-600">
                  <BarChart3 size={20} />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Learning Activity</h2>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData} />
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-slate-400" /> Stats
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Streak', val: '12 days', icon: Flame, cls: 'bg-orange-100 text-orange-600' },
                  { label: 'Weekly Goal', val: '8/10 hrs', icon: Target, cls: 'bg-slate-100 text-[#111827]' },
                  { label: 'Total Time', val: '156 hrs', icon: Clock, cls: 'bg-blue-100 text-blue-600' },
                  { label: 'Projects', val: '8 done', icon: Code, cls: 'bg-emerald-100 text-emerald-600' },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${s.cls}`}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-neutral-900">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-neutral-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                  <Play className="w-4 h-4" />
                  Continue Session
                </button>
                <button className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Code className="w-4 h-4 text-slate-500" />
                  Review Projects
                </button>
                <button className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  Join Study Group
                </button>
                <button className="w-full bg-slate-50 text-[#111827] border border-slate-100 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Ask AI Tutor
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {recentAchievements.map((a) => (
                  <div key={a.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition-colors cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl bg-white w-10 h-10 flex items-center justify-center rounded-lg shadow-sm border border-slate-100">{a.icon}</div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{a.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{a.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Paths */}
      {activeTab === 'paths' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-slate-50 w-10 h-10 flex items-center justify-center rounded-lg text-[#111827]">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">My Learning Paths</h2>
              </div>
              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div key={path.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-200 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#111827] transition-colors">{path.title}</h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-slate-50 text-slate-600 border-slate-200">
                            {path.status.replace('-', ' ')}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-slate-50 text-slate-600 border-slate-200">
                            {path.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-4 text-sm font-medium">{path.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {path.skills.map((s) => (
                            <span key={s} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-md border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                          <div className="bg-neutral-900 h-1.5 rounded-full transition-all duration-300" style={{ width: `${path.progress}%` }} />
                        </div>
                        <div className="text-right text-[10px] font-bold text-slate-400 mt-1">{path.progress}% Complete</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <button className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm">
                        <Play className="w-4 h-4" />
                        {path.status === 'completed' ? 'Review' : path.status === 'not-started' ? 'Start' : 'Continue'}
                      </button>
                      {path.status === 'completed' && (
                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
                          <Trophy className="w-4 h-4" />
                          View Certificate
                        </button>
                      )}
                      <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-slate-400" /> Overall Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Paths Started</span>
                  <span className="text-sm font-bold text-neutral-900">{learningPaths.filter((p) => p.status !== 'not-started').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Paths Completed</span>
                  <span className="text-sm font-bold text-green-600">{learningPaths.filter((p) => p.status === 'completed').length}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-slate-400" /> Recommended
              </h3>
              <div className="space-y-3">
                {[
                  { t: 'Advanced React Patterns', d: 'Master advanced concepts like Compound Components and State Reducers.' },
                  { t: 'Full-Stack TypeScript', d: 'End-to-end type safety with tRPC, Prisma, and Next.js.' },
                ].map((r) => (
                  <div key={r.t} className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-neutral-900 text-sm group-hover:text-[#111827] transition-colors">{r.t}</h4>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{r.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discover */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Explore Paths</h2>
                  <p className="text-sm text-slate-500">Find the perfect curriculum for your next career move.</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Search for skills, roles, or technologies..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all placeholder:text-slate-400" />
              </div>
            </div>

            <div className="space-y-4">
              {[
                { id: 101, title: 'Machine Learning A-Z', description: 'Hands-on Python & R in Data Science. Build real models.', skills: ['Python', 'ML', 'Data Science'], duration: 45, difficulty: 'advanced', rating: 4.8, learners: '1.2k' },
                { id: 102, title: 'UX Design Masterclass', description: 'Complete guide to user experience design and research.', skills: ['Figma', 'Prototyping', 'User Research'], duration: 30, difficulty: 'beginner', rating: 4.9, learners: '850' },
                { id: 103, title: 'DevOps Engineering', description: 'Master Docker, Kubernetes, Jenkins and CI/CD pipelines.', skills: ['Docker', 'K8s', 'CI/CD'], duration: 90, difficulty: 'intermediate', rating: 4.7, learners: '2.1k' },
              ].map((path) => (
                <div key={path.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-200 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#111827] transition-colors">{path.title}</h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-slate-50 text-slate-600 border-slate-200">
                          {path.difficulty}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4 text-sm font-medium">{path.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {path.skills.map((s) => (
                          <span key={s} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-md border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {path.duration} days
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {path.rating}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {path.learners} learners
                        </span>
                      </div>
                    </div>
                    <button className="bg-white border border-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-50 hover:text-[#111827] transition-colors">
                      <BookmarkPlus size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <button className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-colors shadow-sm flex-1">Enroll Now</button>
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex-1">View Syllabus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Filter size={18} className="text-slate-400" /> Categories
              </h3>
              <div className="space-y-2">
                {['Web Development', 'Data Science', 'Mobile Dev', 'Cloud Computing', 'UI/UX Design', 'Product Management'].map((cat) => (
                  <div key={cat} className="flex justify-between items-center p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors">
                    <span className="text-sm font-medium text-slate-600 group-hover:text-neutral-900 transition-colors">{cat}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-neutral-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Pro Mentorship</h3>
                <p className="text-slate-300 text-sm mb-4">Get 1-on-1 guidance from industry experts on your learning journey.</p>
                <button className="w-full bg-white text-neutral-900 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">Find a Mentor</button>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl opacity-20 -mr-10 -mt-10"></div>
            </div>
          </div>
        </div>
      )}

      {/* Community */}
      {activeTab === 'community' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Community Hub</h2>
                  <p className="text-sm text-slate-500">Connect, share, and grow with fellow learners.</p>
                </div>
                <button className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm">
                  <MessageSquare size={16} />
                  Start Discussion
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['All Topics', 'General', 'React Ecosystem', 'Career Advice', 'Showcase', 'System Design'].map((f, i) => (
                  <button key={f} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${i === 0 ? 'bg-slate-50 text-[#111827] border-slate-100' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-200 hover:text-[#111827]'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[
                { id: 1, author: 'Sarah Jenks', role: 'Frontend Dev', title: 'Best resources for learning React Server Components in 2024?', tag: 'React Ecosystem', replies: 24, likes: 156, time: '2h ago', avatar: 'SJ', pinned: true },
                { id: 2, author: 'Mike Chen', role: 'Product Designer', title: 'Critique my portfolio: Transitioning from Graphic Design to UX', tag: 'Career Advice', replies: 18, likes: 89, time: '4h ago', avatar: 'MC', pinned: false },
                { id: 3, author: 'Jessica Wu', role: 'Data Scientist', title: 'Study Group: Machine Learning A-Z - Week 4 check-in', tag: 'General', replies: 42, likes: 203, time: '5h ago', avatar: 'JW', pinned: false },
                { id: 4, author: 'David Kim', role: 'Full Stack Dev', title: 'How to handle auth state persistence with NextAuth v5?', tag: 'React Ecosystem', replies: 8, likes: 34, time: '6h ago', avatar: 'DK', pinned: false },
              ].map((post) => (
                <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                  {post.pinned && (
                    <div className="absolute top-0 right-0 bg-slate-100 px-2 py-1 rounded-bl-lg">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <PinIcon size={10} className="rotate-45" /> Pinned
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#111827] to-slate-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">{post.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-neutral-900">{post.author}</span>
                        <span className="text-xs text-slate-500 font-medium">• {post.role}</span>
                        <span className="text-xs text-slate-400">• {post.time}</span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 mb-3 group-hover:text-[#111827] transition-colors leading-snug">{post.title}</h3>
                      <div className="flex items-center gap-4">
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wide">{post.tag}</span>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1.5 hover:text-[#111827] transition-colors bg-slate-50 px-2 py-1 rounded-md">
                            <MessageSquare size={14} /> {post.replies} Replies
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors bg-slate-50 px-2 py-1 rounded-md">
                            <Heart size={14} /> {post.likes} Likes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-slate-400" /> Active Study Groups
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'React Beginners', members: 120, active: true },
                  { name: 'System Design Prep', members: 85, active: true },
                  { name: 'UI/UX Daily Challenge', members: 240, active: false },
                ].map((g) => (
                  <div key={g.name} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-200 transition-colors group cursor-pointer">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 group-hover:text-[#111827] transition-colors">{g.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 font-medium">{g.members} members</span>
                        {g.active && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-[#111827] transition-colors">
                      <PlusCircle size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm font-bold text-[#111827] hover:text-[#111827] transition-colors flex items-center justify-center gap-1">
                View All Groups <ArrowRight size={14} />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" /> Upcoming Events
              </h3>
              <div className="space-y-4">
                {[
                  { m: 'Oct', d: '25', title: 'AMA with Senior Eng from Netflix', sub: '4:00 PM • Live Stream', icon: Video },
                  { m: 'Oct', d: '28', title: 'Portfolio Review Session', sub: '11:00 AM • Workshop', icon: Users },
                ].map((e) => (
                  <div key={e.title} className="flex gap-3 group cursor-pointer">
                    <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-2 text-center min-w-[56px] h-fit group-hover:border-slate-200 group-hover:bg-slate-50 group-hover:text-[#111827] transition-colors">
                      <div className="text-[10px] font-bold uppercase">{e.m}</div>
                      <div className="text-lg font-bold">{e.d}</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 leading-tight group-hover:text-[#111827] transition-colors">{e.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                        <e.icon size={12} /> {e.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LearningPathModule = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <LearningPath />
    </div>
  );
};

export default LearningPathModule;

