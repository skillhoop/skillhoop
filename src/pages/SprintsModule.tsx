import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Flame,
  Lightbulb,
  Play,
  Search,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X,
} from 'lucide-react';

// --- Mocks & Contexts ---

const useNavigate = () => (path: string) => console.log('Navigating to', path);

const WorkflowTracking = {
  _context: { workflowId: 'skill-development-advancement', currentJob: null as any, identifiedSkills: ['React', 'Node.js'] },
  getWorkflowContext: () => WorkflowTracking._context,
  setWorkflowContext: (data: any) => {
    console.log('Workflow Context Set:', data);
    WorkflowTracking._context = { ...WorkflowTracking._context, ...data };
  },
  getWorkflow: (id: string) => {
    if (id === 'skill-development-advancement') {
      return {
        steps: [
          { id: 'identify-skills', status: 'completed' },
          { id: 'create-learning-path', status: 'completed' },
          { id: 'complete-sprints', status: 'not-started' },
        ],
        isActive: true,
        progress: 57,
      };
    }
    return null;
  },
  updateStepStatus: (workflowId: string, stepId: string, status: string, data?: any) => {
    console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
  },
};

const WorkflowBreadcrumb = ({ workflowId }: any) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-xs font-medium text-slate-500 flex items-center gap-2">
    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Active Workflow</span>
    <span>
      {workflowId === 'job-application-pipeline'
        ? 'Job Application Pipeline'
        : workflowId === 'skill-development-advancement'
          ? 'Skill Development'
          : 'Career Growth'}
    </span>
    <ChevronRight size={12} />
    <span className="text-neutral-900 font-bold">Current Step</span>
  </div>
);

// Stubs for these as they are layout specific
const WorkflowQuickActions = (_props: any) => null;
const WorkflowTransition = (_props: any) => null;

// --- Data Constants ---

const sprintsData = [
  {
    id: 1,
    title: 'Modern E-commerce Platform',
    description: 'Build a full-stack e-commerce platform with React, Node.js, and MongoDB',
    technology: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    difficulty: 'intermediate',
    duration: '3 weeks',
    participants: 1240,
    rating: 4.8,
    deliverable: 'Complete e-commerce website with payment integration',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Authentication', 'Payment Processing'],
    prerequisites: ['JavaScript', 'HTML/CSS', 'Basic React'],
    category: 'fullstack',
    featured: true,
    completionRate: 78,
    estimatedHours: 40,
    industry: 'E-commerce',
    thumbnail: '🛒',
  },
  {
    id: 2,
    title: 'AI-Powered Chat Application',
    description: 'Create an intelligent chat application with OpenAI integration',
    technology: ['React', 'TypeScript', 'OpenAI', 'WebSocket'],
    difficulty: 'advanced',
    duration: '2 weeks',
    participants: 890,
    rating: 4.9,
    deliverable: 'Real-time chat app with AI responses',
    skills: ['React', 'TypeScript', 'OpenAI API', 'WebSocket', 'Real-time Communication'],
    prerequisites: ['React', 'TypeScript', 'API Integration'],
    category: 'ai',
    featured: true,
    completionRate: 65,
    estimatedHours: 30,
    industry: 'AI/ML',
    thumbnail: '🤖',
  },
  {
    id: 3,
    title: 'Mobile-First Dashboard Design',
    description: 'Design and build a responsive dashboard with modern UI/UX',
    technology: ['React', 'Tailwind CSS', 'Chart.js', 'Framer Motion'],
    difficulty: 'beginner',
    duration: '2 weeks',
    participants: 2100,
    rating: 4.7,
    deliverable: 'Responsive dashboard with data visualization',
    skills: ['React', 'Tailwind CSS', 'Chart.js', 'Responsive Design', 'UI/UX'],
    prerequisites: ['HTML/CSS', 'JavaScript', 'Basic React'],
    category: 'frontend',
    featured: false,
    completionRate: 85,
    estimatedHours: 25,
    industry: 'SaaS',
    thumbnail: '📊',
  },
  {
    id: 4,
    title: 'DevOps Pipeline Mastery',
    description: 'Master CI/CD pipelines with Docker, GitHub Actions, and AWS',
    technology: ['Docker', 'GitHub Actions', 'AWS', 'Kubernetes'],
    difficulty: 'advanced',
    duration: '3 weeks',
    participants: 650,
    rating: 4.6,
    deliverable: 'Complete DevOps pipeline with automated deployment',
    skills: ['Docker', 'CI/CD', 'AWS', 'Kubernetes', 'Infrastructure as Code'],
    prerequisites: ['Linux', 'Git', 'Basic Cloud Knowledge'],
    category: 'devops',
    featured: false,
    completionRate: 70,
    estimatedHours: 45,
    industry: 'DevOps',
    thumbnail: '⚙️',
  },
  {
    id: 5,
    title: 'React Native Mobile App',
    description: 'Build a cross-platform mobile app with React Native and Expo',
    technology: ['React Native', 'Expo', 'Firebase', 'Redux'],
    difficulty: 'intermediate',
    duration: '3 weeks',
    participants: 980,
    rating: 4.5,
    deliverable: 'Cross-platform mobile application',
    skills: ['React Native', 'Expo', 'Firebase', 'Redux', 'Mobile Development'],
    prerequisites: ['React', 'JavaScript', 'Mobile Development Basics'],
    category: 'mobile',
    featured: false,
    completionRate: 75,
    estimatedHours: 35,
    industry: 'Mobile',
    thumbnail: '📱',
  },
  {
    id: 6,
    title: 'Microservices Architecture Sprint',
    description: 'Design and implement a microservices architecture with Node.js',
    technology: ['Node.js', 'Docker', 'Redis', 'PostgreSQL', 'API Gateway'],
    difficulty: 'advanced',
    duration: '4 weeks',
    participants: 420,
    rating: 4.8,
    deliverable: 'Scalable microservices system',
    skills: ['Node.js', 'Microservices', 'Docker', 'Redis', 'PostgreSQL', 'API Design'],
    prerequisites: ['Node.js', 'Database Knowledge', 'System Design'],
    category: 'backend',
    featured: false,
    completionRate: 60,
    estimatedHours: 50,
    industry: 'Enterprise',
    thumbnail: '🏗️',
  },
];

const userProgress = [
  { sprintId: 1, progress: 65, currentMilestone: 3, totalMilestones: 5, timeSpent: 26, startDate: '2024-01-15', status: 'in_progress' },
  { sprintId: 3, progress: 100, currentMilestone: 5, totalMilestones: 5, timeSpent: 25, startDate: '2024-01-01', status: 'completed' },
];

const achievementsData = [
  { id: 1, title: 'First Sprint Complete', description: 'Completed your first learning sprint', icon: '🏆', earned: true, earnedDate: '2024-01-20' },
  { id: 2, title: 'Frontend Master', description: 'Completed 3 frontend sprints', icon: '🎨', earned: true, earnedDate: '2024-01-25' },
  { id: 3, title: 'Full-Stack Developer', description: 'Completed both frontend and backend sprints', icon: '💻', earned: false, earnedDate: null },
  { id: 4, title: 'Sprint Streak', description: 'Completed 5 sprints in a row', icon: '🔥', earned: false, earnedDate: null },
  { id: 5, title: 'Advanced Learner', description: 'Completed 3 advanced difficulty sprints', icon: '🚀', earned: false, earnedDate: null },
  { id: 6, title: 'Community Helper', description: 'Helped 10 other learners in sprint discussions', icon: '🤝', earned: false, earnedDate: null },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-600 bg-green-100';
    case 'intermediate':
      return 'text-yellow-600 bg-yellow-100';
    case 'advanced':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-slate-600 bg-slate-100';
  }
};

const tabs = [
  { id: 'browse', label: 'Browse Sprints', icon: Search },
  { id: 'my-sprints', label: 'My Sprints', icon: BookOpen },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

const Sprints = () => {
  const navigate = useNavigate();

  const [workflowContext, setWorkflowContext] = useState<any>(null);
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTechnology, setFilterTechnology] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [enrolledSprints, setEnrolledSprints] = useState<number[]>([1, 3]);
  const [selectedSprint, setSelectedSprint] = useState<any>(null);
  const [showSprintDetail, setShowSprintDetail] = useState(false);

  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    if (context?.workflowId === 'skill-development-advancement') {
      setWorkflowContext(context);
      const workflow = WorkflowTracking.getWorkflow('skill-development-advancement');
      if (workflow) {
        const sprintStep = workflow.steps.find((s: any) => s.id === 'complete-sprints');
        if (sprintStep && sprintStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('skill-development-advancement', 'complete-sprints', 'in-progress');
        }
      }

      if (enrolledSprints.length > 0) {
        WorkflowTracking.updateStepStatus('skill-development-advancement', 'complete-sprints', 'completed', {
          sprintsEnrolled: enrolledSprints.length,
        });
        setShowWorkflowPrompt(true);
      }
    }
  }, [enrolledSprints]);

  const handleEnrollSprint = (sprintId: number) => {
    const updated = enrolledSprints.includes(sprintId) ? enrolledSprints.filter((id) => id !== sprintId) : [...enrolledSprints, sprintId];
    setEnrolledSprints(updated);

    const workflow = WorkflowTracking.getWorkflow('skill-development-advancement');
    if (workflow && workflow.isActive && updated.length > 0) {
      WorkflowTracking.updateStepStatus('skill-development-advancement', 'complete-sprints', 'completed', {
        sprintsEnrolled: updated.length,
      });
      setShowWorkflowPrompt(true);
    }
  };

  const filteredSprints = sprintsData.filter((sprint) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      sprint.title.toLowerCase().includes(q) ||
      sprint.description.toLowerCase().includes(q) ||
      sprint.technology.some((tech) => tech.toLowerCase().includes(q));
    const matchesTechnology = filterTechnology === 'all' || sprint.technology.includes(filterTechnology);
    const matchesDifficulty = filterDifficulty === 'all' || sprint.difficulty === filterDifficulty;
    const matchesDuration =
      filterDuration === 'all' ||
      (filterDuration === '1-2' && sprint.duration.includes('2 weeks')) ||
      (filterDuration === '2-3' && sprint.duration.includes('3 weeks')) ||
      (filterDuration === '3+' && sprint.duration.includes('4 weeks'));

    return matchesSearch && matchesTechnology && matchesDifficulty && matchesDuration;
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      {workflowContext?.workflowId === 'skill-development-advancement' && <WorkflowBreadcrumb workflowId="skill-development-advancement" currentFeaturePath="/dashboard/sprints" />}

      {workflowContext?.workflowId === 'skill-development-advancement' && <WorkflowQuickActions workflowId="skill-development-advancement" currentFeaturePath="/dashboard/sprints" />}

      {workflowContext?.workflowId === 'skill-development-advancement' && <WorkflowTransition workflowId="skill-development-advancement" currentFeaturePath="/dashboard/sprints" />}

      {showWorkflowPrompt && workflowContext && enrolledSprints.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">✅ Sprints Enrolled!</h3>
              <p className="text-white/90 mb-4">
                You've enrolled in {enrolledSprints.length} sprint{enrolledSprints.length !== 1 ? 's' : ''}. Keep learning and earn certifications!
              </p>
              <div className="bg-white/20 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold mb-2">Next steps in your workflow:</p>
                <div className="space-y-2 text-sm">
                  {['Identified Skills', 'Benchmarked Skills', 'Created Learning Path', 'Completed Sprints'].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>✓ {t}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-white/80">
                    <ArrowRight className="w-4 h-4" />
                    <span>→ Earn Certifications (Recommended next)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    WorkflowTracking.setWorkflowContext({
                      workflowId: 'skill-development-advancement',
                      identifiedSkills: workflowContext?.identifiedSkills,
                      sprintsCompleted: enrolledSprints.length,
                      action: 'earn-certifications',
                    });
                    navigate('/dashboard/certifications');
                  }}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
                >
                  View Certifications
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setShowWorkflowPrompt(false)} className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                  Continue Later
                </button>
              </div>
            </div>
            <button onClick={() => setShowWorkflowPrompt(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {workflowContext && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-indigo-900">Skill Development to Career Advancement</p>
                <p className="text-xs text-indigo-600">Step 4 of 7: Complete Sprints</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-600">
              <div className="w-24 bg-indigo-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '57%' }} />
              </div>
              <span>57%</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search sprints..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Technology</label>
                  <select value={filterTechnology} onChange={(e) => setFilterTechnology(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-white">
                    <option value="all">All Technologies</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Docker">Docker</option>
                    <option value="AWS">AWS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Difficulty</label>
                  <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-white">
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Duration</label>
                  <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm bg-white">
                    <option value="all">All Durations</option>
                    <option value="1-2">1-2 weeks</option>
                    <option value="2-3">2-3 weeks</option>
                    <option value="3+">3+ weeks</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Featured Sprints
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sprintsData.filter((s) => s.featured).map((sprint) => (
                  <div key={sprint.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{sprint.thumbnail}</span>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{sprint.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{sprint.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {sprint.technology.slice(0, 3).map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200">
                            {tech}
                          </span>
                        ))}
                        {sprint.technology.length > 3 && (
                          <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-medium rounded-md border border-slate-200">+{sprint.technology.length - 3}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {sprint.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {sprint.participants.toLocaleString()}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${getDifficultyColor(sprint.difficulty)}`}>{sprint.difficulty}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-auto">
                      {enrolledSprints.includes(sprint.id) ? (
                        <button className="flex-1 bg-neutral-900 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                          <Play className="w-4 h-4" />
                          Continue
                        </button>
                      ) : (
                        <button onClick={() => handleEnrollSprint(sprint.id)} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm">
                          Start Sprint
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSprint(sprint);
                          setShowSprintDetail(true);
                        }}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">All Sprints</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSprints.filter((s) => !s.featured).map((sprint) => (
                  <div key={sprint.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xl">{sprint.thumbnail}</span>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{sprint.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-2">{sprint.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border border-transparent ${getDifficultyColor(sprint.difficulty)}`}>{sprint.difficulty}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">{sprint.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-3 border-t border-slate-50">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {sprint.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {sprint.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      <button onClick={() => handleEnrollSprint(sprint.id)} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${enrolledSprints.includes(sprint.id) ? 'bg-neutral-900 text-white hover:bg-slate-800' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-neutral-900'}`}>
                        {enrolledSprints.includes(sprint.id) ? 'Continue' : 'Start'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-500">Active Sprints</span>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{enrolledSprints.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-500">Completed</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">1</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-500">Total Hours</span>
                  <span className="text-sm font-bold text-slate-900">51h</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-500">Achievements</span>
                  <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">2</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Trending This Week
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '⚛️', title: 'React', sub: '+340 learners', box: 'bg-blue-50 border-blue-100' },
                  { icon: '🐍', title: 'Python', sub: '+280 learners', box: 'bg-green-50 border-green-100' },
                  { icon: '⚡', title: 'TypeScript', sub: '+190 learners', box: 'bg-purple-50 border-purple-100' },
                ].map((t) => (
                  <div key={t.title} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                    <div className={`w-10 h-10 ${t.box} border rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <span className="text-lg">{t.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{t.title}</h4>
                      <p className="text-xs text-slate-500 font-medium text-emerald-600">{t.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-lg text-white">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-300" />
                Pro Tips
              </h3>
              <div className="space-y-4">
                {[
                  'Set aside 2-3 hours daily for consistent progress.',
                  'Join the community discussions for help.',
                  'Complete the deliverable for maximum learning.',
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2" />
                    <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Your Achievements
                </h2>
                <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last updated: Just now</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsData.map((a) => (
                  <div key={a.id} className={`border rounded-xl p-5 transition-all duration-300 ${a.earned ? 'bg-yellow-50/50 border-yellow-200 hover:shadow-md hover:border-yellow-300' : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${a.earned ? 'bg-white text-yellow-600' : 'bg-white text-slate-300 grayscale'}`}>{a.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`text-base font-bold mb-1 ${a.earned ? 'text-slate-900' : 'text-slate-500'}`}>{a.title}</h3>
                          {a.earned && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Earned</span>}
                        </div>
                        <p className={`text-xs mb-3 line-clamp-2 ${a.earned ? 'text-slate-600' : 'text-slate-400'}`}>{a.description}</p>
                        {a.earned ? (
                          <div className="flex items-center gap-1 text-[10px] text-yellow-700 font-medium">
                            <Clock className="w-3 h-3" />
                            Earned on {a.earnedDate}
                          </div>
                        ) : (
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-slate-300 h-full w-1/3 rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Achievement Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-500">Earned</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-yellow-600">2</span>
                    <span className="text-xs text-slate-400">/ 6</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-500">Completion Rate</span>
                  <span className="text-sm font-bold text-slate-900">33%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                  <span className="text-xs text-slate-500 block mb-1">Next Achievement</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm text-xs">💻</div>
                    <span className="text-sm font-bold text-slate-900">Full-Stack Developer</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full w-2/3 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Skill Progress</h3>
              <div className="space-y-4">
                {[
                  { k: 'React', v: 85, cls: 'bg-emerald-500', tcls: 'text-emerald-600' },
                  { k: 'Node.js', v: 70, cls: 'bg-blue-500', tcls: 'text-blue-600' },
                  { k: 'TypeScript', v: 60, cls: 'bg-amber-500', tcls: 'text-amber-600' },
                ].map((s) => (
                  <div key={s.k}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700">{s.k}</span>
                      <span className={`text-xs font-bold ${s.tcls}`}>{s.v}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`${s.cls} h-full rounded-full transition-all duration-500`} style={{ width: `${s.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">View Full Skill Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Sprint Detail Modal */}
      {showSprintDetail && selectedSprint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{selectedSprint.title}</h2>
              <button onClick={() => setShowSprintDetail(false)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors duration-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Sprint Details</h3>
                  <p className="text-slate-600 mb-4">{selectedSprint.description}</p>
                  <div className="space-y-3">
                    {[
                      { k: 'Deliverable', v: selectedSprint.deliverable },
                      { k: 'Duration', v: selectedSprint.duration },
                      { k: 'Estimated Hours', v: `${selectedSprint.estimatedHours} hours` },
                      { k: 'Industry', v: selectedSprint.industry },
                    ].map((r: any) => (
                      <div key={r.k} className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{r.k}:</span>
                        <span className="text-sm text-slate-900">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSprint.technology.map((tech: string) => (
                      <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills You'll Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSprint.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Prerequisites</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSprint.prerequisites.map((prereq: string) => (
                      <span key={prereq} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Sprint Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Participants</span>
                      <span className="text-sm font-medium text-slate-900">{selectedSprint.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Rating</span>
                      <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {selectedSprint.rating}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Completion Rate</span>
                      <span className="text-sm font-medium text-slate-900">{selectedSprint.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Difficulty</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getDifficultyColor(selectedSprint.difficulty)}`}>{selectedSprint.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {enrolledSprints.includes(selectedSprint.id) ? (
                    <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" />
                      Continue Sprint
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleEnrollSprint(selectedSprint.id);
                        setShowSprintDetail(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                    >
                      Start Sprint
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SprintsModule = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Sprints />
    </div>
  );
};

export default SprintsModule;

