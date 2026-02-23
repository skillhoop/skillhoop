import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flame,
  Heart,
  Lightbulb,
  Loader2,
  MessageSquare,
  MicOff,
  Pencil,
  PenTool,
  Plus,
  Save,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Video,
  VideoOff,
  X,
  Zap,
} from 'lucide-react';
import LoadingScreen from '../components/ui/LoadingScreen';

// --- Mocks & Generators ---

const generateQuestionsForRole = (role: string, company: string) => [
  { id: 1, question: 'Tell me about yourself.', category: 'General', difficulty: 'Easy' },
  {
    id: 2,
    question: `Why do you want to work at ${company || 'our company'}?`,
    category: 'General',
    difficulty: 'Medium',
  },
  {
    id: 3,
    question: 'Describe a challenging project you worked on.',
    category: 'Behavioral',
    difficulty: 'Hard',
  },
  {
    id: 4,
    question: `What are your strengths as a ${role || 'candidate'}?`,
    category: 'Role-Specific',
    difficulty: 'Medium',
  },
  { id: 5, question: 'How do you handle conflict in a team?', category: 'Behavioral', difficulty: 'Medium' },
  {
    id: 6,
    question: 'Explain a complex technical concept to a non-technical person.',
    category: 'Technical',
    difficulty: 'Hard',
  },
];

// --- Helper Components ---

const FeatureGate = ({
  children,
}: {
  children: React.ReactNode;
  requiredTier?: string;
}) => <>{children}</>;

const FeatureQuickStartWizard = ({
  isOpen,
  onClose,
  steps,
  featureName,
}: {
  isOpen: boolean;
  onClose: () => void;
  steps: Array<{ number?: number; title: string; description: string; tips?: string[] }>;
  featureName: string;
  featureDescription?: string;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  if (!isOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">Quick Start Guide: {featureName}</h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-slate-200">
              {step.number || currentStep + 1}
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">{step.title}</h2>
          </div>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">{step.description}</p>

          {step.tips && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb size={18} /> Pro Tips
              </h4>
              <ul className="space-y-3">
                {step.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-800 text-sm">
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
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-slate-600' : 'bg-slate-300'}`}
              ></div>
            ))}
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const InterviewPrep = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickStartWizard, setShowQuickStartWizard] = useState(false);

  // Workflow state
  const [workflowContext, setWorkflowContext] = useState<any>(null);

  // Job & Questions state
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Question interaction state
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showSampleAnswer] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [aiHint, setAiHint] = useState<number | null>(null);

  // Mock interview state
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [mockInterviewState, setMockInterviewState] = useState({
    active: false,
    transcript: [] as any[],
    currentSpeaker: 'ai',
    isRecording: false,
    duration: 0,
  });

  // Filter state
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Progress state
  const [questionProgress, setQuestionProgress] = useState<any>({});
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [readinessScore] = useState(42);

  // STAR mode state
  const [userStories, setUserStories] = useState([
    {
      id: '1',
      title: 'Led Q4 Project',
      situation: 'We were behind schedule on the Q4 roadmap.',
      task: 'I needed to reorganize the team priorities.',
      action: 'Implemented a daily standup and cut scope.',
      result: 'We shipped on time and increased velocity by 20%.',
      tags: ['Leadership', 'Project Management'],
    },
    {
      id: '2',
      title: 'Conflict Resolution',
      situation: 'Two developers disagreed on architecture.',
      task: 'I had to mediate and find a solution.',
      action: 'Facilitated a whiteboard session.',
      result: 'They agreed on a hybrid approach.',
      tags: ['Conflict', 'Communication'],
    },
  ]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);

  // Wellness state
  const [breathingActive, setBreathingActive] = useState(false);

  // Company research state
  const [showCompanyResearch, setShowCompanyResearch] = useState(false);
  const [companyResearch, setCompanyResearch] = useState<any>(null);

  // Source Resume state
  const [availableResumes, setAvailableResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'practice', label: 'Practice', icon: Target },
    { id: 'questions', label: 'Question Bank', icon: MessageSquare },
    { id: 'stories', label: 'Story Bank', icon: BookOpen },
    { id: 'wellness', label: 'Wellness', icon: Heart },
  ];

  const features = [
    {
      icon: '🧠',
      title: 'AI Mock Interviews',
      description: 'Practice with AI-powered interviewers that adapt to your responses and provide real-time feedback.',
      color: 'bg-slate-50 text-slate-600',
      action: () => setActiveTab('practice'),
    },
    {
      icon: '💬',
      title: 'Question Bank',
      description: 'Access thousands of interview questions organized by role, company, and difficulty level.',
      color: 'bg-emerald-50 text-emerald-600',
      action: () => setActiveTab('questions'),
    },
    {
      icon: '📖',
      title: 'Story Bank',
      description: 'Build and refine your STAR stories to nail behavioral questions every time.',
      color: 'bg-blue-50 text-blue-600',
      action: () => setActiveTab('stories'),
    },
    {
      icon: '🧘',
      title: 'Wellness Center',
      description: 'Tools to manage anxiety and boost confidence before your big moment.',
      color: 'bg-pink-50 text-pink-600',
      action: () => setActiveTab('wellness'),
    },
  ];

  const quickStartSteps = [
    {
      number: 1,
      title: 'Set Your Goals',
      description: 'Define your target role and company preferences to personalize your preparation.',
    },
    {
      number: 2,
      title: 'Practice Sessions',
      description: 'Start with AI mock interviews tailored to your specific role and industry.',
    },
    {
      number: 3,
      title: 'Track Progress',
      description: 'Monitor your improvement and refine your approach based on detailed analytics.',
    },
  ];

  const loadResumes = async () => {
    setIsLoadingResumes(true);
    try {
      // Mock loading resumes
      setTimeout(() => {
        setAvailableResumes([
          { id: '1', title: 'Senior Product Designer' },
          { id: '2', title: 'UX Researcher' },
        ]);
        setIsLoadingResumes(false);
      }, 500);
    } catch (error) {
      console.error('Error loading resumes:', error);
      setIsLoadingResumes(false);
    }
  };

  // Load available resumes
  useEffect(() => {
    void loadResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResumeSelect = async (resumeId: string) => {
    setSelectedResumeId(resumeId);
  };

  // Check for quick start wizard on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('interview_prep_quick_start_dismissed');
    if (!dismissed && !currentJob) {
      const timer = setTimeout(() => {
        setShowQuickStartWizard(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentJob]);

  // Check for workflow context on mount
  useEffect(() => {
    // Mocking context load
    const context = {
      workflowId: 'job-application-pipeline',
      currentJob: { title: 'Product Designer', company: 'Linear', id: '123' },
    };
    setWorkflowContext(context);
    if (context.currentJob) {
      setCurrentJob({
        jobId: context.currentJob.id,
        jobTitle: context.currentJob.title,
        company: context.currentJob.company,
        interviewDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      });
    }
  }, []);

  // Initial load of questions if job exists
  useEffect(() => {
    if (currentJob) {
      const qs = generateQuestionsForRole(currentJob.jobTitle, currentJob.company);
      setInterviewQuestions(qs);
    }
  }, [currentJob]);

  const saveAnswer = (questionId: number, answer: string) => {
    setUserAnswers((prev: any) => ({
      ...prev,
      [questionId]: {
        answer,
        savedAt: new Date().toISOString(),
        version: (prev[questionId]?.version || 0) + 1,
      },
    }));
  };

  const updateProgress = (questionId: number, field: string, value: any) => {
    setQuestionProgress((prev: any) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value },
    }));
  };

  const markInterviewPrepared = () => {
    alert('Interview prep completed and saved!');
  };

  const filteredQuestions = useMemo(() => {
    return interviewQuestions.filter(q => {
      if (filterCategory !== 'all' && q.category !== filterCategory) return false;
      if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
      return true;
    });
  }, [interviewQuestions, filterCategory, filterDifficulty]);

  const fetchCompanyResearch = async (company: string) => {
    setLoading(true);
    setTimeout(() => {
      setCompanyResearch({
        culture: `${company} values innovation and speed.`,
        values: ['Quality', 'Speed', 'Craftsmanship'],
        tips: ['Be ready to show portfolio', 'Ask about process'],
      });
      setLoading(false);
    }, 1000);
  };

  const handleSaveStory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStory = {
      id: editingStory ? editingStory.id : Date.now().toString(),
      title: formData.get('title'),
      situation: formData.get('situation'),
      task: formData.get('task'),
      action: formData.get('action'),
      result: formData.get('result'),
      tags: ['New'],
    };

    if (editingStory) {
      setUserStories((prev: any[]) => prev.map(s => (s.id === editingStory.id ? newStory : s)));
    } else {
      setUserStories((prev: any[]) => [...prev, newStory]);
    }
    setShowStoryModal(false);
    setEditingStory(null);
  };

  const startBreathing = () => {
    setBreathingActive(true);
    setTimeout(() => setBreathingActive(false), 30000);
  };

  return (
    <FeatureGate requiredTier="pro">
      <div className="space-y-6 animate-fade-in-up">
        {/* Quick Start Wizard */}
        <FeatureQuickStartWizard
          featureName="Interview Prep Kit"
          featureDescription="Master your interview preparation with AI-powered practice questions and personalized guidance"
          steps={quickStartSteps}
          isOpen={showQuickStartWizard}
          onClose={() => setShowQuickStartWizard(false)}
        />

        {/* Top Controls Area */}
        <div className="flex flex-col gap-4">
          {/* Resume Selector - Moved above tabs for cleaner layout */}
          <div className="flex justify-end">
            <div className="relative group min-w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText size={16} className="text-slate-400 group-hover:text-neutral-900 transition-colors" />
              </div>
              <select
                value={selectedResumeId || ''}
                onChange={e => void handleResumeSelect(e.target.value || '')}
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none appearance-none transition-all cursor-pointer hover:border-slate-300 shadow-sm"
                disabled={isLoadingResumes}
              >
                <option value="">Select context resume...</option>
                {availableResumes.map(resume => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Tabs - Matching Job Finder Style */}
          <div className="flex items-center gap-2 p-2 rounded-2xl border bg-white border-slate-200 shadow-sm overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20'
                      : 'text-slate-500 hover:text-neutral-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && !showSampleAnswer && !showPracticeModal && !showCompanyResearch && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <LoadingScreen
              message="Just a moment..."
              subMessage="Loading prep data..."
              fullScreen={false}
              logoSize={80}
            />
          </div>
        )}

        {/* Job Info Banner with Integrated Stats */}
        {currentJob && !loading && (
          <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-start gap-5 relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
                <Briefcase size={28} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    Interview Prep
                  </span>
                  <span className="text-slate-400 text-xs font-medium">• 3 days remaining</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{currentJob.jobTitle}</h3>
                <p className="text-slate-300 text-sm flex items-center gap-2 font-medium">
                  <Building2 size={14} /> {currentJob.company}
                </p>
              </div>
            </div>

            {/* Prep Stats */}
            <div className="flex gap-6 relative z-10 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="text-center px-2">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Readiness</div>
                <div className="text-xl font-bold text-emerald-400">{readinessScore}%</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center px-2">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Questions</div>
                <div className="text-xl font-bold text-white">
                  {Object.keys(userAnswers).length}{' '}
                  <span className="text-xs text-slate-500 font-normal">/ {interviewQuestions.length}</span>
                </div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center px-2">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Stories</div>
                <div className="text-xl font-bold text-amber-400 flex items-center justify-center gap-1">
                  {userStories.length}
                </div>
              </div>
            </div>

            <div className="flex gap-2 relative z-10">
              <button
                onClick={() => {
                  setShowCompanyResearch(true);
                  void fetchCompanyResearch(currentJob.company);
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl transition-all text-sm font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm"
              >
                <Search size={16} /> Research
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="min-h-[500px] relative">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Your Toolkit</h2>
                    <p className="text-slate-500 mt-1">
                      Recommended tools to boost your {currentJob?.company || 'interview'} readiness.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      onClick={feature.action}
                      className="group p-6 rounded-2xl border border-slate-200 transition-all duration-300 cursor-pointer bg-white hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform ${feature.color}`}
                        >
                          {feature.icon}
                        </div>
                        <h3 className="text-base font-bold text-neutral-900 leading-tight">{feature.title}</h3>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4">{feature.description}</p>
                      <div className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300 text-neutral-900">
                        Open Tool <ArrowRight size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity / Quick Start */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-neutral-900 mb-4">Recent Progress</h2>
                  <div className="bg-slate-50 rounded-2xl p-1 border border-slate-200">
                    {[1, 2].map(i => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 hover:bg-white rounded-xl transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-600 group-hover:border-slate-200 transition-colors">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-neutral-900">Completed "Tell me about yourself"</h4>
                          <p className="text-xs text-slate-500">Self-Practice • 2 hours ago</p>
                        </div>
                        <div className="text-slate-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          Review Answer
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-neutral-900 mb-4">Quick Tips</h2>
                  <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-600 shrink-0">
                        <Lightbulb size={18} />
                      </div>
                      <p className="text-sm text-slate-900 font-medium italic">
                        "Research the interviewer on LinkedIn before the call to find common ground."
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-600 shrink-0">
                        <TrendingUp size={18} />
                      </div>
                      <p className="text-sm text-slate-900 font-medium italic">
                        "Prepare 2-3 questions for the end of the interview to show engagement."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Practice Tab */}
          {activeTab === 'practice' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-neutral-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
                <div className="relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200 text-xs font-bold mb-6 backdrop-blur-md">
                    <Sparkles size={12} className="text-white" /> AI Powered Simulation
                  </div>
                  <h3 className="text-3xl font-bold mb-3 tracking-tight">Mock Interview Session</h3>
                  <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                    Enter a realistic voice or text-based interview environment. Our AI agent adapts to your
                    responses, testing your depth and clarity in real-time.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowMockInterview(true);
                        setMockInterviewState({
                          active: true,
                          transcript: [
                            {
                              sender: 'ai',
                              text: `Hi there! I'm your AI interviewer. To get started, could you tell me a little bit about yourself and your background?`,
                            },
                          ],
                          currentSpeaker: 'ai',
                          isRecording: false,
                          duration: 0,
                        });
                      }}
                      className="bg-white text-neutral-900 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Bot size={20} /> Start Simulation
                    </button>
                  </div>
                </div>

                <div className="relative z-10 w-full max-w-xs h-64 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <div className="flex items-center gap-1 h-32">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-4 bg-slate-500 rounded-full animate-pulse"
                        style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Agent Ready
                  </div>
                </div>

                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-slate-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setActiveTab('questions')}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-50 p-3 rounded-xl text-orange-600 group-hover:bg-orange-100 transition-colors">
                      <Flame size={24} />
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-slate-300 group-hover:text-slate-600 transition-colors transform group-hover:translate-x-1"
                    />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-lg mb-2">Drill Mode</h4>
                  <p className="text-sm text-slate-500">
                    Rapid-fire questions to test your quick thinking and conciseness.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('stories')}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <BookOpen size={24} />
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-slate-300 group-hover:text-slate-600 transition-colors transform group-hover:translate-x-1"
                    />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-lg mb-2">STAR Builder</h4>
                  <p className="text-sm text-slate-500">
                    Craft perfect behavioral stories using the Situation-Task-Action-Result framework.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stories Tab */}
          {activeTab === 'stories' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">STAR Story Bank</h2>
                  <p className="text-sm text-slate-500">Prepare anecdotes using the Situation-Task-Action-Result method.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingStory(null);
                    setShowStoryModal(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
                >
                  <Plus size={16} /> New Story
                </button>
              </div>

              {userStories.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No stories yet</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Documenting your achievements is key to answering behavioral questions.
                  </p>
                  <button onClick={() => setShowStoryModal(true)} className="text-slate-600 font-bold text-sm hover:underline">
                    Create your first story
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userStories.map((story: any) => (
                    <div
                      key={story.id}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all group relative"
                    >
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingStory(story);
                            setShowStoryModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                      <h3 className="font-bold text-lg text-neutral-900 mb-3">{story.title}</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Situation
                          </span>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{story.situation}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Result
                          </span>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{story.result}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                        {story.tags.map((tag: string) => (
                          <span key={tag} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wellness Tab */}
          {activeTab === 'wellness' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Box Breathing</h3>
                    <p className="text-slate-200 mb-8 max-w-xs mx-auto">Calm your nerves before the interview. Follow the circle.</p>

                    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                      <div
                        className={`absolute inset-0 rounded-full border-4 border-slate-400/30 ${
                          breathingActive ? 'animate-[ping_4s_ease-in-out_infinite]' : ''
                        }`}
                      ></div>
                      <div
                        className={`w-32 h-32 bg-slate-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all duration-[4000ms] ${
                          breathingActive ? 'scale-125' : 'scale-100'
                        }`}
                      >
                        <span className="font-bold text-lg">{breathingActive ? 'Breathe' : 'Ready?'}</span>
                      </div>
                    </div>

                    <button
                      onClick={startBreathing}
                      className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                      {breathingActive ? 'Stop' : 'Start Exercise'}
                    </button>
                  </div>

                  <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-500 rounded-full blur-[120px]"></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-50 p-2 rounded-lg text-green-600">
                        <CheckCircle2 size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-neutral-900">Pre-Interview Checklist</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        'Researched the interviewers on LinkedIn',
                        'Prepared 3 intelligent questions to ask',
                        'Checked camera and microphone setup',
                        'Have water and a notebook ready',
                        'Reviewed the job description one last time',
                      ].map((item, i) => (
                        <label
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                          <div className="relative flex items-center mt-0.5">
                            <input
                              type="checkbox"
                              className="peer w-5 h-5 rounded-md border-2 border-slate-300 checked:bg-green-500 checked:border-green-500 appearance-none transition-colors cursor-pointer"
                            />
                            <Check
                              size={12}
                              className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                            />
                          </div>
                          <span className="text-sm text-slate-600 group-hover:text-neutral-900 font-medium select-none">
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold">
                      <Zap size={18} /> Power Tip
                    </div>
                    <p className="text-amber-900 text-sm italic leading-relaxed">
                      "Stand in a 'Power Pose' (hands on hips, feet wide) for 2 minutes before your call. Studies show this
                      increases testosterone and lowers cortisol, making you feel more confident."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Question Bank</h3>
                  <p className="text-sm text-slate-500 mt-1">Curated questions for {currentJob?.jobTitle || 'this role'}.</p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  {['all', 'General', 'Behavioral', 'Technical'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        filterCategory === cat
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredQuestions.map((q: any) => {
                  const progress = questionProgress[q.id] || {};
                  const savedAnswer = userAnswers[q.id];
                  const isReviewed = progress.reviewed;
                  const borderColor =
                    q.difficulty === 'Hard'
                      ? 'border-l-orange-500'
                      : q.difficulty === 'Medium'
                        ? 'border-l-amber-500'
                        : 'border-l-emerald-500';

                  return (
                    <div
                      key={q.id}
                      className={`group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden ${borderColor} border-l-4`}
                    >
                      <div className="flex items-start justify-between gap-4 relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                q.difficulty === 'Hard'
                                  ? 'bg-orange-50 text-orange-700'
                                  : q.difficulty === 'Medium'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{q.category}</span>

                            {savedAnswer && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                <CheckCircle2 size={10} /> Answered
                              </span>
                            )}
                          </div>

                          <h4 className={`text-base font-bold text-neutral-900 mb-3 leading-snug ${isReviewed ? 'opacity-50' : ''}`}>
                            {q.question}
                          </h4>

                          {savedAnswer && (
                            <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs text-slate-600 italic border border-slate-100 line-clamp-2">
                              "{savedAnswer.answer}"
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedQuestion(q);
                                setPracticeAnswer(savedAnswer?.answer || '');
                                setShowPracticeModal(true);
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                savedAnswer
                                  ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                                  : 'text-white bg-slate-600 hover:bg-slate-700 shadow-sm'
                              }`}
                            >
                              <PenTool size={12} /> {savedAnswer ? 'Edit Answer' : 'Draft Answer'}
                            </button>

                            <button
                              onClick={() => setAiHint(q.id === aiHint ? null : q.id)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-slate-100"
                            >
                              <Lightbulb size={12} /> AI Hint
                            </button>

                            <div className="flex-1"></div>

                            <button
                              onClick={() => updateProgress(q.id, 'reviewed', !isReviewed)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                isReviewed
                                  ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {isReviewed ? <CheckCircle2 size={14} /> : <Check size={14} />}
                              {isReviewed ? 'Reviewed' : 'Mark Reviewed'}
                            </button>
                          </div>

                          {aiHint === q.id && (
                            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-800 animate-fade-in-up">
                              <span className="font-bold block mb-1">AI Tip:</span>
                              For this question, focus on relating your answer back to the company's core value of "
                              {companyResearch?.values[0] || 'innovation'}". Use a specific example where you demonstrated this.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MOCK INTERVIEW OVERLAY */}
          {showMockInterview && (
            <div className="absolute inset-0 bg-neutral-900 z-50 rounded-2xl flex flex-col overflow-hidden animate-fade-in-up">
              <div className="p-4 bg-neutral-800 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-white font-mono text-sm">REC 00:14</span>
                </div>
                <span className="text-white font-bold">Mock Session: Behavioral Fit</span>
                <button
                  onClick={() => setShowMockInterview(false)}
                  className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  End Session
                </button>
              </div>

              <div className="flex-1 p-6 flex flex-col gap-6 relative">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-slate-500 to-purple-500 p-1 mb-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] relative">
                    <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center relative overflow-hidden">
                      <div className="flex gap-1 items-center h-12">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-slate-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
                            style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-neutral-900 rounded-full"></div>
                  </div>

                  <div className="max-w-xl text-center">
                    {mockInterviewState.transcript.map((msg: any, i: number) => (
                      <p
                        key={i}
                        className={`text-lg font-medium leading-relaxed ${msg.sender === 'ai' ? 'text-white' : 'text-slate-400'}`}
                      >
                        "{msg.text}"
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                      <MicOff size={20} />
                    </button>
                    <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                      <VideoOff size={20} />
                    </button>
                  </div>

                  <div className="flex-1 mx-6 h-12 bg-black/30 rounded-xl flex items-center justify-center px-4">
                    <div className="text-slate-500 text-sm font-mono">Listening...</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors">
                      Next Question
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute top-20 right-6 w-48 h-32 bg-neutral-800 rounded-xl border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center group">
                <span className="text-slate-500 text-xs font-bold">You</span>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <Video size={24} className="text-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        {currentJob && (
          <div className="fixed bottom-8 right-8 z-[50]">
            <button
              onClick={markInterviewPrepared}
              className="bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-full shadow-xl shadow-neutral-900/20 transition-all duration-300 flex items-center gap-3 font-bold hover:scale-105 active:scale-95 border border-white/10"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark Prepared</span>
            </button>
          </div>
        )}

        {/* Modals */}
        {showCompanyResearch && companyResearch && (
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-600">
                    <Building2 size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-neutral-900">Company Research</h3>
                </div>
                <button onClick={() => setShowCompanyResearch(false)} className="text-slate-400 hover:text-neutral-900">
                  <X />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Culture Snapshot</h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {companyResearch.culture}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Core Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyResearch.values.map((v: string) => (
                      <span
                        key={v}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Lightbulb size={16} /> Insider Tips
                  </h4>
                  <ul className="space-y-2">
                    {companyResearch.tips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-800">
                        <Check size={14} className="mt-0.5 shrink-0" /> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPracticeModal && selectedQuestion && (
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold text-slate-600 mb-1 block">PRACTICE MODE</span>
                  <h3 className="font-bold text-lg text-neutral-900">{selectedQuestion.question}</h3>
                </div>
                <button onClick={() => setShowPracticeModal(false)} className="text-slate-400 hover:text-neutral-900">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <textarea
                  className="w-full border border-slate-200 rounded-xl p-4 h-64 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50 text-slate-700 leading-relaxed resize-none font-medium"
                  value={practiceAnswer}
                  onChange={e => setPracticeAnswer(e.target.value)}
                  placeholder="Draft your answer here... (Tip: Use the STAR method for behavioral questions)"
                ></textarea>
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-xs text-slate-400 font-bold">Thinking of examples? Check your Story Bank.</span>
                  <span className="text-xs text-slate-400">{practiceAnswer.length} chars</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveAnswer(selectedQuestion.id, practiceAnswer);
                    setShowPracticeModal(false);
                  }}
                  className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-bold hover:bg-black transition-colors shadow-lg shadow-neutral-900/20 flex items-center gap-2"
                >
                  <Save size={16} /> Save Answer
                </button>
              </div>
            </div>
          </div>
        )}

        {showStoryModal && (
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-neutral-900">{editingStory ? 'Edit Story' : 'New STAR Story'}</h3>
                <button onClick={() => setShowStoryModal(false)} className="text-slate-400 hover:text-neutral-900">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveStory} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Story Title</label>
                  <input
                    name="title"
                    defaultValue={editingStory?.title}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
                    placeholder="e.g. Led Q4 Project"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Situation</label>
                    <textarea
                      name="situation"
                      defaultValue={editingStory?.situation}
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                      placeholder="What was the context?"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Task</label>
                    <textarea
                      name="task"
                      defaultValue={editingStory?.task}
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                      placeholder="What was your responsibility?"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Action</label>
                    <textarea
                      name="action"
                      defaultValue={editingStory?.action}
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                      placeholder="What steps did you take?"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Result</label>
                    <textarea
                      name="result"
                      defaultValue={editingStory?.result}
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                      placeholder="What was the outcome?"
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowStoryModal(false)}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-bold hover:bg-black">
                    Save Story
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
};

// --- Export Wrapper ---

const InterviewPrepModule = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <InterviewPrep />
    </div>
  );
};

export default InterviewPrepModule;

