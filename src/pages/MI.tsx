import React, { useState, useMemo, useEffect } from 'react';
import {
Briefcase,
Layout,
TrendingUp,
Shield,
CheckCircle2,
Menu,
X,
ArrowRight,
Sparkles,
FileText,
Search,
Crosshair,
MessageSquare,
Globe,
Zap,
Award,
BarChart3,
Bot,
Calendar,
AlertTriangle,
Target,
BookOpen,
Timer,
ChevronDown,
Bell,
Settings,
LogOut,
ChevronRight,
PlayCircle,
Map,
RefreshCw,
LineChart,
FileCheck,
Activity,
Brain
} from 'lucide-react';
import SkillHoopSidebar from '../components/SkillHoopSidebar';
import SmartCoverLetter from '../components/SmartCoverLetter';
import ApplicationTailorKit from '../components/ApplicationTailorKit';
import JobFinderModule from '../JobFinderModule';
import JobTrackerModule from '../JobTrackerModule';
import InterviewPrepModule from './InterviewPrepModule';
import WorkHistoryModule from '../WorkHistoryModule';
import BrandAuditModule from '../BrandAuditModule';
import ContentEngineModule from './ContentEngineModule';
import CareerPortfolioModule from './CareerPortfolioModule';
import CareerEventScoutModule from './CareerEventScoutModule';
import SkillRadarModule from './SkillRadarModule';
import LearningPathModule from './LearningPathModule';
import SprintsModule from './SprintsModule';
import CertificationsModule from './CertificationsModule';
import SkillBenchmarking from './SkillBenchmarking';
import SkillHoopOverview from '../components/SkillHoopOverview';
import SmartResumeStudio from '../components/resume/SmartResumeStudio';

// --- 1. Data Constants ---

/** Feature title and description for header when a menu item is active */
const FEATURE_HEADER_META: Record<string, { title: string; description: string }> = {
  resume: { title: 'Smart Resume Studio', description: 'Create and optimize your professional resume with AI.' },
  'cover-letter': { title: 'Cover Letter Generator', description: 'Generate compelling, tailored cover letters with AI.' },
  tailor: { title: 'Application Tailor', description: 'Tailor each application to match the specific role.' },
  finder: { title: 'Job Finder', description: 'Discover opportunities matching your profile.' },
  tracker: { title: 'Job Tracker', description: 'Manage and track your job applications.' },
  prep: { title: 'Interview Prep Kit', description: 'Practice for interviews with AI feedback and guidance.' },
  history: { title: 'Work History Manager', description: 'Organize and manage your complete work history.' },
  audit: { title: 'AI Personal Brand Audit', description: 'Analyze and improve your personal brand with AI insights.' },
  content: { title: 'Content Engine', description: 'Create engaging professional content.' },
  portfolio: { title: 'AI Career Portfolio', description: 'Showcase your work and achievements with an AI-assisted portfolio.' },
  events: { title: 'Career Event Scout', description: 'Find events and opportunities to grow your career network.' },
  radar: { title: 'Skill Radar', description: 'Visualize your skill strengths and gaps.' },
  learning: { title: 'Learning Path', description: 'Your personalized curriculum for growth.' },
  sprints: { title: 'Sprints', description: 'Focused learning missions to level up fast.' },
  certifications: { title: 'Certifications', description: 'Track and manage your professional certifications.' },
  benchmarking: { title: 'Skill Benchmarking', description: 'Compare your skills against market and role benchmarks.' },
};

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
],
capabilities: ["Tracks applications submitted", "Tracks interviews scheduled"],
benefits: ["Structured search-to-interview process", "Increases application quality"]
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
steps: [],
capabilities: [],
benefits: []
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
steps: [],
capabilities: [],
benefits: []
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
steps: [],
capabilities: [],
benefits: []
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
steps: [],
capabilities: [],
benefits: []
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
steps: [],
capabilities: [],
benefits: []
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
steps: [],
capabilities: [],
benefits: []
}
];

// --- 2. Helper Functions ---

const getWorkflowTheme = (flow: any) => {
switch(flow.category) {
case 'Career Hub': return {
heroBg: 'bg-indigo-50', heroBorder: 'border-indigo-100', iconBg: 'bg-white', iconColor: 'text-indigo-600', badgeBg: 'bg-indigo-100/50', badgeText: 'text-indigo-700', badgeBorder: 'border-indigo-200',
darkHeroBg: 'bg-indigo-900/20', darkHeroBorder: 'border-indigo-800', darkIconBg: 'bg-indigo-900', darkIconColor: 'text-indigo-300', darkBadgeBg: 'bg-indigo-900/40', darkBadgeText: 'text-indigo-300', darkBadgeBorder: 'border-indigo-800',
};
case 'Upskilling': return {
heroBg: 'bg-amber-50', heroBorder: 'border-amber-100', iconBg: 'bg-white', iconColor: 'text-amber-600', badgeBg: 'bg-amber-100/50', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200',
darkHeroBg: 'bg-amber-900/20', darkHeroBorder: 'border-amber-800', darkIconBg: 'bg-amber-900', darkIconColor: 'text-amber-300', darkBadgeBg: 'bg-amber-900/40', darkBadgeText: 'text-amber-300', darkBadgeBorder: 'border-indigo-800',
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

const VideoIcon = ({size}: {size: number}) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<polygon points="23 7 16 12 23 17 23 7"></polygon>
<rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
</svg>
);

// --- 3. Sub-Components for Workflows ---

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
<WorkflowCard key={flow.id} flow={flow} darkMode={darkMode} onSelect={onSelect} />
))}
</div>
)
}

const WorkflowRecommendationsComponent = ({ limit, onDismiss, dismissedWorkflows, onSelect, darkMode, stats }: any) => {
const scoredWorkflows = useMemo(() => {
return WORKFLOWS
.filter(w => w.status === 'Not Started' && !dismissedWorkflows.includes(w.id))
.map(w => {
let score = 50;
let eligible = true;
let reason = "Recommended";
if (w.prerequisites.resume && stats.resumeCount < w.prerequisites.resume) { score -= 40; eligible = false; reason = "Missing Resume"; }
if (w.prerequisites.jobs && stats.jobCount < w.prerequisites.jobs) { score -= 40; eligible = false; reason = "Missing Apps"; }
if (w.dependency === "Job Application Pipeline" && stats.jobCount >= 1) { score += 30; }
return { ...w, relevanceScore: score, eligible, eligibilityReason: reason };
})
.sort((a, b) => b.relevanceScore - a.relevanceScore)
.slice(0, limit);
}, [dismissedWorkflows, stats, limit]);

if (scoredWorkflows.length === 0) return null;

return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
        {scoredWorkflows.map(flow => (
            <div key={flow.id} className="relative group">
                <button onClick={(e) => { e.stopPropagation(); onDismiss(flow.id); }} className="absolute -top-2 -right-2 z-30 p-1.5 rounded-full bg-white dark:bg-slate-700 shadow-md border border-slate-100 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"><X size={14} /></button>
                <WorkflowCard flow={flow} darkMode={darkMode} onSelect={onSelect} />
                {!flow.eligible && (
                    <div className="absolute top-5 left-5 z-20 px-2 py-1 rounded-md bg-amber-50/90 text-amber-700 text-[10px] font-bold border border-amber-100 flex items-center gap-1 shadow-sm backdrop-blur-sm pointer-events-none">
                       <AlertTriangle size={10} /> <span>Missing Prereqs</span>
                   </div>
               )}
            </div>
        ))}
    </div>
)


}

const WorkflowsView = ({ darkMode, onSelectWorkflow, dismissedSuggestions, handleDismissSuggestion, stats }: any) => {
const [activeSection, setActiveSection] = useState('active');
const exploreWorkflows = WORKFLOWS.filter(w => w.status !== 'In Progress');
const sections = [
{ id: 'active', label: 'Active Workflows', icon: PlayCircle },
{ id: 'recommended', label: 'Recommended For You', icon: Sparkles },
{ id: 'explore', label: 'Explore Paths', icon: Map }
];

return (
    <div className="space-y-6 animate-fade-in-up">
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            {sections.map((section) => (
                <button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${activeSection === section.id ? (darkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-neutral-900')}`}>
                    <section.icon size={16} /><span className="hidden sm:inline">{section.label}</span>
                </button>
            ))}
        </div>
        <div className="min-h-[400px]">
            {activeSection === 'active' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2"><div><h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Your Ongoing Progress</h2></div></div>
                    <ActiveWorkflowsCards workflows={WORKFLOWS} onSelect={onSelectWorkflow} darkMode={darkMode} />
                </div>
            )}
            {activeSection === 'recommended' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2"><div><h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Smart Suggestions</h2></div></div>
                    {stats.jobCount > 0 && stats.jobCount < 5 && (
                         <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-500 text-white rounded-xl"><Brain size={24} /></div>
                            <div className="flex-1"><h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Strategic Recommendation</h3><p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Interview Preparation Ecosystem.</p></div>
                            <button onClick={() => onSelectWorkflow(WORKFLOWS.find(w => w.id === 4))} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors">Start Prep</button>
                        </div>
                    )}
                    <WorkflowRecommendationsComponent limit={6} onDismiss={handleDismissSuggestion} dismissedWorkflows={dismissedSuggestions} onSelect={onSelectWorkflow} darkMode={darkMode} stats={stats} />
                </div>
            )}
            {activeSection === 'explore' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2"><div><h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Discover All Paths</h2></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {exploreWorkflows.map(flow => <WorkflowCard key={flow.id} flow={flow} darkMode={darkMode} onSelect={onSelectWorkflow} />)}
                    </div>
                </div>
            )}
        </div>
    </div>
);


};

// --- 4. Main Dashboard Component ---

const MI = () => {
const [activeView, setActiveView] = useState('overview');
const [dashboardMode, setDashboardMode] = useState('overview'); // 'overview' | 'workflow'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);
const [isProfileOpen, setIsProfileOpen] = useState(false);

// Mock stats
const mockStats = { resumeCount: 2, jobCount: 4, brandScore: 72, dailyLimit: 50, usedToday: 18, jobsThisWeek: 3, atsScore: 85 };
const stats = [
{ label: "Active Applications", value: "12", change: "+2 this week", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", category: "Career Hub" },
{ label: "Brand Score", value: "84/100", change: "Top 10%", icon: Award, color: "text-purple-600", bg: "bg-purple-50", category: "Brand" },
{ label: "Skill Velocity", value: "High", change: "+4 skills/mo", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50", category: "Upskilling" },
{ label: "Avg ATS Score", value: "92%", change: "+5% vs avg", icon: FileText, color: "text-amber-600", bg: "bg-amber-50", category: "Career Hub" },
];
const aiActions = [
{ id: 1, type: 'urgent', text: "Your interview with Linear is tomorrow. Review the AI prep sheet.", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
{ id: 2, type: 'opportunity', text: "New role at Airbnb matches your 'Design Systems' skill set (98% match).", icon: Sparkles, color: "text-indigo-600", bg: "bg-indigo-50" },
{ id: 3, type: 'task', text: "Complete 'React Hooks' quiz to finish your weekly sprint.", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" }
];
const recentJobs = [
{ title: "Senior Product Designer", company: "Linear", status: "Interview", date: "2d ago", logo: "L" },
{ title: "Frontend Developer", company: "Vercel", status: "Applied", date: "4d ago", logo: "V" },
];

const handleSelectWorkflow = (workflow: any) => console.log(`Selected: ${workflow.title}`);
const handleDismissSuggestion = (id: number) => setDismissedSuggestions(prev => [...prev, id]);

return (
<div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
<style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }`}</style>

  {/* Sidebar */}
  <div className="hidden lg:flex">
    <SkillHoopSidebar
      activeView={activeView}
      onNavigate={setActiveView}
      collapsed={sidebarCollapsed}
      onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
    />
  </div>

  {/* Main Content Area */}
  <main className={`flex-1 min-h-screen flex flex-col transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
    {/* Header */}
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:hidden"><div className="bg-neutral-900 p-1.5 rounded-lg shadow-sm"><div className="h-4 w-4 bg-white rounded-sm" /></div></div>
        <div className="flex flex-col gap-1 min-w-0">
           {activeView === 'overview' ? (
             <div className="flex p-1 bg-slate-100 rounded-lg">
                <button onClick={() => setDashboardMode('overview')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${dashboardMode === 'overview' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Overview</button>
                <button onClick={() => setDashboardMode('workflow')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${dashboardMode === 'workflow' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Workflow</button>
             </div>
           ) : FEATURE_HEADER_META[activeView] ? (
             <>
               <h1 className="text-lg font-bold text-neutral-900 truncate">{FEATURE_HEADER_META[activeView].title}</h1>
               <p className="text-sm text-slate-500 truncate max-w-xl">{FEATURE_HEADER_META[activeView].description}</p>
             </>
           ) : null}
        </div>
        <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-neutral-900 transition-colors" size={16} />
                <input type="text" placeholder="Search jobs, skills..." className="bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all w-64 text-slate-700"/>
            </div>
            <button className="relative text-slate-500 hover:text-neutral-900 transition-colors p-2 hover:bg-slate-50 rounded-full"><Bell size={20} /><span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
            <div className="relative">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 pl-4 border-l border-slate-200 focus:outline-none">
                    <div className="text-right hidden md:block"><div className="text-sm font-bold text-neutral-900">Alex Morgan</div><div className="text-xs text-slate-500">Product Designer</div></div>
                    <div className="relative">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-200 shadow-sm hover:border-neutral-900 transition-all"/>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in-up origin-top-right">
                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-neutral-900 flex items-center gap-3 transition-colors"><Settings size={16} /> Account Settings</button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"><LogOut size={16} /> Sign Out</button>
                    </div>
                )}
            </div>
        </div>
    </header>

    {/* View Content */}
    <div
      className={`${
        activeView === 'resume' ||
        activeView === 'cover-letter' ||
        activeView === 'tailor' ||
        activeView === 'finder' ||
        activeView === 'history' ||
        activeView === 'tracker' ||
        activeView === 'prep' ||
        activeView === 'audit' ||
        activeView === 'content' ||
        activeView === 'portfolio' ||
        activeView === 'events' ||
        activeView === 'radar' ||
        activeView === 'learning' ||
        activeView === 'sprints' ||
        activeView === 'certifications' ||
        activeView === 'benchmarking'
          ? ''
          : 'p-6 lg:p-8'
      } ${activeView === 'audit' ? 'w-full max-w-none' : 'max-w-7xl mx-auto w-full space-y-8'}`}
    >
        {activeView === 'resume' ? (
          <SmartResumeStudio />
        ) : activeView === 'cover-letter' ? (
          <SmartCoverLetter />
        ) : activeView === 'tailor' ? (
          <ApplicationTailorKit />
        ) : activeView === 'finder' ? (
          <JobFinderModule />
        ) : activeView === 'history' ? (
          <WorkHistoryModule />
        ) : activeView === 'tracker' ? (
          <JobTrackerModule />
        ) : activeView === 'prep' ? (
          <InterviewPrepModule />
        ) : activeView === 'audit' ? (
          <BrandAuditModule />
        ) : activeView === 'content' ? (
          <ContentEngineModule />
        ) : activeView === 'portfolio' ? (
          <CareerPortfolioModule />
        ) : activeView === 'events' ? (
          <CareerEventScoutModule />
        ) : activeView === 'radar' ? (
          <SkillRadarModule />
        ) : activeView === 'learning' ? (
          <LearningPathModule />
        ) : activeView === 'sprints' ? (
          <SprintsModule />
        ) : activeView === 'certifications' ? (
          <CertificationsModule />
        ) : activeView === 'benchmarking' ? (
          <SkillBenchmarking />
        ) : activeView === 'overview' && dashboardMode === 'overview' ? (
          <div className="w-full">
            <SkillHoopOverview />
            </div>
        ) : activeView === 'overview' && dashboardMode === 'workflow' ? (
          <WorkflowsView darkMode={false} onSelectWorkflow={handleSelectWorkflow} dismissedSuggestions={dismissedSuggestions} handleDismissSuggestion={handleDismissSuggestion} stats={mockStats} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">View coming soon...</p>
          </div>
        )}
    </div>
  </main>
</div>


);
};

export default MI;

