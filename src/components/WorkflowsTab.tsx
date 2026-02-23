import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  Search, 
  MessageSquare, 
  Zap, 
  Award,
  BarChart3,
  Star,
  Clock,
  List,
  PlayCircle,
  Map,
  RefreshCw,
  LineChart,
  FileCheck,
  ChevronLeft,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  X,
  Brain,
  Layout,
  Activity,
  Timer,
  FileText,
  Crosshair,
  PenTool,
  History,
  Bot,
  Calendar,
  Linkedin
} from 'lucide-react';

// --- 1. Data Constants (Extracted for Isolation) ---

const WORKFLOWS = [
  {
    id: 1,
    title: "Job Application Pipeline",
    category: "Career Hub",
    icon: Briefcase,
    time: "2–3 weeks",
    description: "End-to-end job application process from discovery to interview.",
    progress: 42,
    status: "In Progress",
    prerequisites: { resume: 1 },
    steps: [
      { name: "Find Jobs", tool: "Job Finder", status: "completed", desc: "Search jobs matching your profile or import from LinkedIn." },
      { name: "Track Applications", tool: "Job Tracker", status: "completed", desc: "Save applications, set reminders, and add notes." },
      { name: "Tailor Resume", tool: "Application Tailor", status: "active", desc: "Upload resume and review AI suggestions for specific roles." },
      { name: "Prepare Base Resume", tool: "Smart Resume Studio", status: "pending", desc: "Optimize your master resume for ATS standards." },
      { name: "Generate Cover Letter", tool: "Cover Letter Generator", status: "pending", desc: "Create personalized, high-converting cover letters." },
      { name: "Archive Documents", tool: "Work History Manager", status: "pending", desc: "Store tailored versions and export your history." },
      { name: "Interview Prep", tool: "Interview Prep Kit", status: "pending", desc: "Practice with AI-generated questions and mock sessions." }
    ],
    capabilities: ["Tracks applications submitted", "Tracks interviews scheduled", "Calculates match score", "Measures time to completion"],
    benefits: ["Structured search-to-interview process", "Reduces missed steps", "Increases application quality"]
  },
  {
    id: 2,
    title: "Skill Development to Career Advancement",
    category: "Upskilling",
    icon: TrendingUp,
    time: "4–6 weeks",
    description: "Identify skill gaps, learn new skills, and showcase achievements.",
    progress: 15,
    status: "In Progress",
    prerequisites: {},
    steps: [
      { name: "Identify Skills", tool: "Skill Radar", status: "completed", desc: "Identify trending skills and see market demand." },
      { name: "Benchmark Skills", tool: "Skill Benchmarking", status: "active", desc: "Compare levels against industry standards." },
      { name: "Create Learning Path", tool: "Learning Path", status: "pending", desc: "Build a personalized roadmap with milestones." },
      { name: "Complete Sprints", tool: "Sprints", status: "pending", desc: "Focused 2-week missions to track completion." },
      { name: "Earn Certifications", tool: "Certifications", status: "pending", desc: "Plan and validate skills with verified badges." },
      { name: "Update Resume", tool: "Smart Resume Studio", status: "pending", desc: "Add new skills and updated certifications." },
      { name: "Showcase Portfolio", tool: "AI Career Portfolio", status: "pending", desc: "Showcase projects on your personal website." }
    ],
    capabilities: ["Tracks skills improved", "Tracks certifications earned", "Measures learning hours", "Career advancement score"],
    benefits: ["Identifies market-relevant skills", "Systematic development", "Validates progress"]
  },
  {
    id: 3,
    title: "Personal Brand Building",
    category: "Brand Building",
    icon: Shield,
    time: "3–4 weeks",
    description: "Build your brand, create content, and discover opportunities.",
    progress: 0,
    status: "Not Started",
    prerequisites: {},
    steps: [
      { name: "Audit Personal Brand", tool: "Personal Brand Audit", status: "pending", desc: "Analyze brand across platforms and get recommendations." },
      { name: "Create Brand Content", tool: "Content Engine", status: "pending", desc: "Generate LinkedIn posts and build authority content." },
      { name: "Showcase Brand Portfolio", tool: "AI Career Portfolio", status: "pending", desc: "Create portfolio website to showcase work." },
      { name: "Scout Career Events", tool: "Career Event Scout", status: "pending", desc: "Find networking events and connect with pros." },
      { name: "Find Brand-Matched Jobs", tool: "Job Finder", status: "pending", desc: "Discover opportunities aligned with your brand." }
    ],
    capabilities: ["Tracks brand score increase", "Measures content engagement", "Portfolio views tracking"],
    benefits: ["Builds expert authority", "Increases recruiter visibility", "Connects brand to discovery"]
  },
  {
    id: 4,
    title: "Interview Preparation Ecosystem",
    category: "Career Hub",
    icon: MessageSquare,
    time: "1–2 weeks",
    description: "Prepare for interviews using job requirements and your experience.",
    progress: 0,
    status: "Not Started",
    prerequisites: { jobs: 1 },
    dependency: "Job Application Pipeline",
    steps: [
      { name: "Review Job Details", tool: "Job Tracker", status: "pending", desc: "Analyze role expectations and company culture." },
      { name: "Prepare for Interview", tool: "Interview Prep Kit", status: "pending", desc: "Practice AI questions and get feedback." },
      { name: "Extract Experience Stories", tool: "Smart Resume Studio", status: "pending", desc: "Prepare STAR stories aligned with job requirements." },
      { name: "Store Interview Outcomes", tool: "Work History Manager", status: "pending", desc: "Document results and track feedback." }
    ],
    capabilities: ["Tracks practice sessions", "Measures preparation time", "Outcome improvement over time"],
    benefits: ["Builds role-specific confidence", "Improves performance feedback", "Increases success rate"]
  },
  {
    id: 5,
    title: "Continuous Improvement Loop",
    category: "Cross-Category",
    icon: RefreshCw,
    time: "Ongoing",
    description: "Learn from application outcomes and improve your skills.",
    progress: 0,
    status: "Not Started",
    prerequisites: { jobs: 5 },
    dependency: "Job Application Pipeline",
    steps: [
      { name: "Review Application Outcomes", tool: "Job Tracker", status: "pending", desc: "Analyze rejection patterns and identify feedback." },
      { name: "Benchmark Skill Gaps", tool: "Skill Benchmarking", status: "pending", desc: "Compare skills to job requirements." },
      { name: "Identify Skills to Prioritize", tool: "Skill Radar", status: "pending", desc: "Focus on high-impact, trending skills." },
      { name: "Create Learning Plan", tool: "Learning Path", status: "pending", desc: "Build an improvement plan with clear goals." },
      { name: "Track Overall Progress", tool: "Upskilling Dashboard", status: "pending", desc: "Monitor improvements and ROI of learning." }
    ],
    capabilities: ["Tracks application success rate", "ROI calculation", "Learning investment tracking"],
    benefits: ["Turns failures into lessons", "Focused learning plans", "Continuous growth habit"]
  },
  {
    id: 6,
    title: "Document Consistency Control",
    category: "Career Hub",
    icon: FileCheck,
    time: "1 week",
    description: "Maintain consistency across all professional documents.",
    progress: 0,
    status: "Not Started",
    prerequisites: { resume: 1 },
    dependency: "Job Application Pipeline",
    steps: [
      { name: "Update Resume for Consistency", tool: "Smart Resume Studio", status: "pending", desc: "Ensure master resume accuracy." },
      { name: "Create Job-Specific Versions", tool: "Application Tailor", status: "pending", desc: "Track variations while maintaining master copy." },
      { name: "Sync Cover Letters", tool: "Cover Letter Generator", status: "pending", desc: "Ensure messaging matches resume tone." },
      { name: "Archive Document Versions", tool: "Work History Manager", status: "pending", desc: "Maintain a complete history of changes." },
      { name: "Sync Portfolio Updates", tool: "AI Career Portfolio", status: "pending", desc: "Update portfolio to sync with resume." }
    ],
    capabilities: ["Tracks document versions", "Consistency score calculation", "Version history maintenance"],
    benefits: ["Prevents document errors", "Organizes variations", "Saves time on updates"]
  },
  {
    id: 7,
    title: "Market Intelligence Strategy",
    category: "Cross-Category",
    icon: LineChart,
    time: "2–3 weeks",
    description: "Use market data to inform your career strategy and content.",
    progress: 0,
    status: "Not Started",
    prerequisites: {},
    steps: [
      { name: "Identify Trending Skills", tool: "Skill Radar", status: "pending", desc: "Understand market demand and opportunities." },
      { name: "Analyze Job Demand", tool: "Job Finder", status: "pending", desc: "Analyze the job market for trends." },
      { name: "Benchmark Skills Against Market", tool: "Skill Benchmarking", status: "pending", desc: "Identify gaps relative to opportunities." },
      { name: "Suggest Brand Positioning", tool: "Personal Brand Audit", status: "pending", desc: "Get market-aligned brand recommendations." },
      { name: "Create Strategic Content", tool: "Content Engine", status: "pending", desc: "Build authority with market-aligned content." }
    ],
    capabilities: ["Tracks market trends identified", "Strategic decision logging", "Strategic ROI calculation"],
    benefits: ["Data-driven career decisions", "Market-aligned brand strategy", "Maximizes opportunities"]
  }
];

// --- 2. Helper Functions ---

const getWorkflowTheme = (flow: any) => {
    switch(flow.category) {
        case 'Career Hub': return {
            heroBg: 'bg-slate-50', heroBorder: 'border-slate-100', iconBg: 'bg-white', iconColor: 'text-slate-600', badgeBg: 'bg-slate-100/50', badgeText: 'text-slate-700', badgeBorder: 'border-slate-200',
            darkHeroBg: 'bg-slate-900/20', darkHeroBorder: 'border-slate-800', darkIconBg: 'bg-slate-900', darkIconColor: 'text-slate-300', darkBadgeBg: 'bg-slate-900/40', darkBadgeText: 'text-slate-300', darkBadgeBorder: 'border-slate-800',
        };
        case 'Upskilling': return {
            heroBg: 'bg-amber-50', heroBorder: 'border-amber-100', iconBg: 'bg-white', iconColor: 'text-amber-600', badgeBg: 'bg-amber-100/50', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200',
            darkHeroBg: 'bg-amber-900/20', darkHeroBorder: 'border-amber-800', darkIconBg: 'bg-amber-900', darkIconColor: 'text-amber-300', darkBadgeBg: 'bg-amber-900/40', darkBadgeText: 'text-amber-300', darkBadgeBorder: 'border-slate-800',
        };
        case 'Brand Building': return {
            heroBg: 'bg-purple-50', heroBorder: 'border-purple-100', iconBg: 'bg-white', iconColor: 'text-purple-600', badgeBg: 'bg-purple-100/50', badgeText: 'text-purple-700', badgeBorder: 'border-purple-200',
            darkHeroBg: 'bg-purple-900/20', darkHeroBorder: 'border-purple-800', darkIconBg: 'bg-purple-900', darkIconColor: 'text-purple-300', darkBadgeBg: 'bg-purple-900/40', darkBadgeText: 'text-purple-300', darkBadgeBorder: 'border-purple-800',
        };
        default: return {
            heroBg: 'bg-emerald-50', heroBorder: 'border-emerald-100', iconBg: 'bg-white', iconColor: 'text-emerald-600', badgeBg: 'bg-emerald-100/50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200',
            darkHeroBg: 'bg-emerald-900/20', darkHeroBorder: 'border-emerald-800', darkIconBg: 'bg-emerald-900', darkIconColor: 'text-emerald-300', darkBadgeBg: 'bg-emerald-900/40', darkBadgeText: 'text-emerald-300', darkBadgeBorder: 'border-emerald-800',
        };
    }
};

// --- 3. Sub-Components ---

const WorkflowCard = ({ flow, darkMode, onSelect }: any) => {
    const colors = getWorkflowTheme(flow);
    const Icon = flow.icon;
    
    return (
        <article className={`w-full rounded-2xl p-1.5 transition-all hover:shadow-xl flex flex-col ${darkMode ? 'bg-slate-800 shadow-lg' : 'bg-white shadow-md border border-slate-100'}`}>
            <section className={`rounded-xl border p-5 flex flex-col h-[280px] relative overflow-hidden ${darkMode ? `${colors.darkHeroBg} ${colors.darkHeroBorder}` : `${colors.heroBg} ${colors.heroBorder}`}`}>
                <header className="flex justify-between items-start z-10">
                    <div className={`w-12 h-12 flex justify-center items-center rounded-xl shadow-sm ${darkMode ? `${colors.darkIconBg} ${colors.darkIconColor}` : `${colors.iconBg} ${colors.iconColor}`}`}>
                        <Icon size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${darkMode ? `${colors.darkBadgeBg} ${colors.darkBadgeText} ${colors.darkBadgeBorder}` : `${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`}`}>
                           {flow.category}
                        </span>
                        {flow.status === 'In Progress' && (
                            <div className={`px-2.5 py-1 rounded-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5`}>
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                Active
                            </div>
                        )}
                    </div>
                </header>
                <div className="z-10 mt-6">
                    <h3 className={`text-xl font-bold leading-tight mb-3 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{flow.title}</h3>
                    <p className={`text-sm line-clamp-3 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{flow.description}</p>
                </div>
                {flow.progress > 0 && (
                    <div className="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-auto">
                        <div className={`h-full ${darkMode ? 'bg-white' : 'bg-neutral-900'}`} style={{ width: `${flow.progress}%` }}></div>
                    </div>
                )}
            </section>
            <footer className="flex items-center justify-between px-4 py-5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold text-base">
                         <span className={darkMode ? 'text-white' : 'text-neutral-900'}>{flow.time}</span>
                    </div>
                    <div className={`text-xs font-medium flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span>{flow.steps.length} Steps</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onSelect(flow)}
                        className={`bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-sm active:scale-[0.98] flex items-center gap-1.5 ${darkMode ? 'bg-white text-neutral-900 hover:bg-slate-200' : ''}`}
                    >
                        {flow.progress > 0 ? 'Continue' : 'View'} 
                    </button>
                </div>
            </footer>
        </article>
    );
};

const ActiveWorkflowsCards = ({ workflows, onSelect, darkMode }: any) => {
    const activeWorkflows = workflows.filter((w: any) => w.status === 'In Progress');
    if (activeWorkflows.length === 0) {
        return (
            <div className={`p-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                    <Activity size={24} />
                </div>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No active workflows. Pick a path to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {activeWorkflows.map((flow: any) => (
                <WorkflowCard 
                    key={flow.id}
                    flow={flow}
                    darkMode={darkMode}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}

const WorkflowRecommendationsComponent = ({ limit, onDismiss, dismissedWorkflows, onSelect, darkMode, stats }: any) => {
    // Scoring logic based on the official Prerequisites
    const scoredWorkflows = useMemo(() => {
        return WORKFLOWS
            .filter(w => w.status === 'Not Started' && !dismissedWorkflows.includes(w.id))
            .map(w => {
                let score = 50; // Base score
                let eligible = true;
                let reason = "Recommended for your current level";

                // Prerequisite Checks
                if (w.prerequisites.resume && stats.resumeCount < w.prerequisites.resume) {
                    score -= 40;
                    eligible = false;
                    reason = `Requires ${w.prerequisites.resume}+ Resume(s)`;
                }
                if (w.prerequisites.jobs && stats.jobCount < w.prerequisites.jobs) {
                    score -= 40;
                    eligible = false;
                    reason = `Requires ${w.prerequisites.jobs}+ Job Applications`;
                }

                // Dependency Bonus
                if (w.dependency === "Job Application Pipeline" && stats.jobCount >= 1) {
                    score += 30;
                }

                return { ...w, relevanceScore: score, eligible, eligibilityReason: reason };
            })
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }, [dismissedWorkflows, stats, limit]);

    if (scoredWorkflows.length === 0) {
        return (
             <div className={`p-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No new recommendations at this time.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {scoredWorkflows.map(flow => {
                return (
                    <div key={flow.id} className="relative group">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDismiss(flow.id); }} 
                            className="absolute -top-2 -right-2 z-30 p-1.5 rounded-full bg-white dark:bg-slate-700 shadow-md border border-slate-100 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                            title="Dismiss Recommendation"
                        >
                            <X size={14} />
                        </button>
                        
                        <WorkflowCard 
                            flow={flow} 
                            darkMode={darkMode} 
                            onSelect={onSelect} 
                        />
                         
                         {/* Eligibility Badge Overlay */}
                         {!flow.eligible && (
                             <div className="absolute top-5 left-5 z-20 px-2 py-1 rounded-md bg-amber-50/90 text-amber-700 text-[10px] font-bold border border-amber-100 flex items-center gap-1 shadow-sm backdrop-blur-sm pointer-events-none">
                                <AlertTriangle size={10} />
                                <span>Missing Prereqs</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    )
}

// --- 4. Main Component (WorkflowsView) ---

const WorkflowsTab = () => {
    // Local state for demonstration purposes (would usually come from parent/API)
    const [darkMode, setDarkMode] = useState(false);
    const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);
    const [stats] = useState({ resumeCount: 1, jobCount: 3 }); // Mock Stats
    const [activeSection, setActiveSection] = useState('active');
    
    // Mock handler for selection
    const onSelectWorkflow = (flow: any) => {
        console.log("Selected workflow:", flow.title);
        // Navigate or open modal here
    };

    const handleDismissSuggestion = (id: number) => {
        setDismissedSuggestions(prev => [...prev, id]);
    };

    const exploreWorkflows = WORKFLOWS.filter(w => w.status !== 'In Progress');

    const sections = [
        { id: 'active', label: 'Active Workflows', icon: PlayCircle },
        { id: 'recommended', label: 'Recommended For You', icon: Sparkles },
        { id: 'explore', label: 'Explore Paths', icon: Map }
    ];

    return (
        <div className={`p-6 min-h-screen ${darkMode ? 'bg-neutral-900' : 'bg-slate-50'}`}>
            {/* Theme Toggle for Demo */}
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`px-3 py-1 text-xs rounded border ${darkMode ? 'text-white border-slate-700' : 'text-black border-slate-300'}`}
                >
                    Toggle {darkMode ? 'Light' : 'Dark'} Mode
                </button>
            </div>

            <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto">
                {/* Navigation Bar */}
                <div className={`flex items-center gap-1 p-1 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                                activeSection === section.id
                                    ? (darkMode ? 'bg-slate-600 text-white shadow-lg' : 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20')
                                    : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-neutral-900')
                            }`}
                        >
                            <section.icon size={16} />
                            <span className="hidden sm:inline">{section.label}</span>
                            <span className="sm:hidden">{section.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>

                {/* Section Content */}
                <div className="min-h-[400px]">
                    {activeSection === 'active' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Your Ongoing Progress</h2>
                                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Track and continue your current career missions.</p>
                                </div>
                            </div>
                            <ActiveWorkflowsCards workflows={WORKFLOWS} onSelect={onSelectWorkflow} darkMode={darkMode} />
                        </div>
                    )}

                    {activeSection === 'recommended' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Smart Suggestions</h2>
                                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>AI-curated workflows based on your goals and activity.</p>
                                </div>
                            </div>
                            
                            {/* Dynamic Hero recommendation based on documented dependencies */}
                            {stats.jobCount > 0 && stats.jobCount < 5 && (
                                <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-slate-500/10 border border-slate-500/20 rounded-2xl p-6 flex items-center gap-4">
                                    <div className="p-3 bg-blue-500 text-white rounded-xl">
                                        <Brain size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Strategic Recommendation</h3>
                                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Since you have active job applications, we recommend the <strong>Interview Preparation Ecosystem</strong> to maximize your success rate.</p>
                                    </div>
                                    <button 
                                        onClick={() => onSelectWorkflow(WORKFLOWS.find(w => w.id === 4))}
                                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold text-xs transition-colors"
                                    >
                                        Start Prep
                                    </button>
                                </div>
                            )}

                            <WorkflowRecommendationsComponent 
                                limit={6} 
                                onDismiss={handleDismissSuggestion} 
                                dismissedWorkflows={dismissedSuggestions} 
                                onSelect={onSelectWorkflow}
                                darkMode={darkMode}
                                stats={stats}
                            />
                        </div>
                    )}

                    {activeSection === 'explore' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Discover All Paths</h2>
                                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Browse the full library of career development workflows.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                                {exploreWorkflows.map(flow => (
                                    <WorkflowCard 
                                        key={flow.id}
                                        flow={flow}
                                        darkMode={darkMode}
                                        onSelect={onSelectWorkflow}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkflowsTab;














