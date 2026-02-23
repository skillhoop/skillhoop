import React, { useState, useEffect } from 'react';
import { 
  Bell, X, ArrowRight, Rocket, FileCheck, Activity, Zap, 
  BarChart3, TrendingUp, History, Briefcase, FileText, 
  Search, Globe, Target, Lock, CheckCircle2, Sparkles, Timer
} from 'lucide-react';
import { useDashboardContext } from './DashboardLayout';

// --- Types & Interfaces (Optional but recommended) ---
interface DashboardOverviewProps {
    darkMode?: boolean;
    setActiveTab?: (tab: string) => void;
    stats?: any; // Replace with concrete type in production
}

// --- Mock Data ---

const RECENT_ACTIVITIES = [
  { id: 1, type: "resume", title: "Product Design Resume_v4", time: "2h ago", status: "Edited", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 2, type: "job", title: "Senior Designer at TechCorp", time: "5h ago", status: "Applied", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 3, type: "upskill", title: "Advanced Figma Prototyping", time: "1d ago", status: "Sprint", icon: Timer, color: "text-amber-500", bg: "bg-amber-50" },
];

const DEFAULT_STATS = {
   resumeCount: 1,
   jobCount: 12,
   brandScore: 72,
   dailyLimit: 50,
   usedToday: 18,
   jobsThisWeek: 3,
   atsScore: 85
};

// --- Helper Components ---

export const OverviewWorkflowsToggle = ({ view, setView, darkMode }: { view: string, setView: (v: string) => void, darkMode: boolean }) => (
    <div className={`flex items-center p-1 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
        <button 
            onClick={() => setView('overview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'overview' ? (darkMode ? 'bg-slate-600 text-white shadow-sm' : 'bg-white text-neutral-900 shadow-sm') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-neutral-900')}`}
        >
            Overview
        </button>
        <button 
            onClick={() => setView('workflows')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'workflows' ? (darkMode ? 'bg-slate-600 text-white shadow-sm' : 'bg-white text-neutral-900 shadow-sm') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-neutral-900')}`}
        >
            Workflows
        </button>
    </div>
);

const PersistentNotificationBanner = () => (
    <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-md mb-6 border border-slate-500/50">
        <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
                <Bell size={14} />
            </span>
            <p className="text-sm font-medium">Welcome to your new dashboard! Complete your profile to unlock all features.</p>
        </div>
        <button className="text-white/80 hover:text-white transition-colors"><X size={18} /></button>
    </div>
);

const MissionCard = ({ title, description, actionLink, isLocked, isCompleted, icon, count, onClick }: any) => {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center text-slate-600 dark:text-slate-400">
          {icon}
        </div>
        {isLocked && (
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-800">
            <Lock className="w-3 h-3" />
            <span>Locked</span>
          </div>
        )}
        {!isLocked && isCompleted && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </div>
        )}
        {!isLocked && !isCompleted && (
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 dark:bg-slate-900/30 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800">
            <Sparkles className="w-3 h-3" />
            <span>Start</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 h-10">{description}</p>
      {isCompleted && count !== undefined && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">{count}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {count === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      )}
      <button
        onClick={onClick}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 border ${
          isLocked
            ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
            : isCompleted
            ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'
            : 'bg-slate-600 text-white border-slate-600 hover:bg-slate-700'
        }`}
      >
        {isLocked ? 'Upgrade to Unlock' : isCompleted ? 'Manage' : 'Create New'}
      </button>
    </div>
  );
};

const ActivityChart = ({ darkMode }: { darkMode: boolean }) => {
    const dataPoints = [20, 45, 30, 60, 55, 80, 70];
    const width = 600;
    const height = 150;
    const padding = 20;

    const getX = (index: number) => (index / (dataPoints.length - 1)) * (width - 2 * padding) + padding;
    const getY = (val: number) => height - padding - (val / 100) * (height - 2 * padding);

    let pathD = `M ${getX(0)} ${getY(dataPoints[0])}`;
    for (let i = 0; i < dataPoints.length - 1; i++) {
        const x_mid = (getX(i) + getX(i + 1)) / 2;
        const y_mid = (getY(dataPoints[i]) + getY(dataPoints[i + 1])) / 2;
        const cp_x1 = (x_mid + getX(i)) / 2;
        const cp_x2 = (x_mid + getX(i + 1)) / 2;
        pathD += ` Q ${cp_x1} ${getY(dataPoints[i])}, ${x_mid} ${y_mid}`;
        pathD += ` Q ${cp_x2} ${getY(dataPoints[i + 1])}, ${getX(i + 1)} ${getY(dataPoints[i + 1])}`;
    }

    const fillPath = `${pathD} L ${width - padding} ${height} L ${padding} ${height} Z`;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
             <div className="relative w-full h-full" style={{ minHeight: '160px' }}>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {[0.25, 0.5, 0.75].map((tick) => (
                         <line 
                            key={tick}
                            x1={padding} 
                            y1={height - (tick * (height - 2*padding)) - padding} 
                            x2={width - padding} 
                            y2={height - (tick * (height - 2*padding)) - padding} 
                            stroke={darkMode ? "#334155" : "#e2e8f0"} 
                            strokeDasharray="4 4" 
                        />
                    ))}

                    <path d={fillPath} fill="url(#chartGradient)" />
                    <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {dataPoints.map((val, i) => (
                         <circle 
                            key={i}
                            cx={getX(i)} 
                            cy={getY(val)} 
                            r="4" 
                            className="fill-slate-600 dark:fill-slate-400 stroke-white dark:stroke-slate-800 stroke-2 hover:r-6 transition-all duration-300 cursor-pointer"
                        />
                    ))}
                </svg>
                
                <div className="absolute top-0 right-0 bg-slate-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg transform -translate-y-1/2">
                    Last 7 Days
                </div>
             </div>
        </div>
    );
};

const StatsOverview = ({ atsScore, jobCount, jobsThisWeek, creditsLeft, dailyLimit, usedToday }: any) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Resume Health</h3>
            </div>
          </div>
          {atsScore !== null ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{atsScore}%</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">+5%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${atsScore >= 80 ? 'bg-green-500' : atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${atsScore}%` }} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Based on Master Resume</p>
            </div>
          ) : (
            <div className="text-emerald-600 dark:text-emerald-400">
              <p className="text-lg font-medium">Ready to Build</p>
              <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Create your first resume to see your ATS score</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200">App Velocity</h3>
            </div>
          </div>
          <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{jobsThisWeek}</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">new this week</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Total {jobCount} applications tracked</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200">AI Credits</h3>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{creditsLeft}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">remaining</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-purple-500 to-slate-500 h-2 rounded-full transition-all" style={{ width: `${dailyLimit > 0 ? (usedToday / dailyLimit) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{usedToday} / {dailyLimit} used today</p>
          </div>
        </div>
      </div>
    );
};

const WorkflowAnalytics = ({ darkMode }: { darkMode: boolean }) => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-full flex flex-col">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-slate-500"/> Activity Overview
        </h3>
        <div className="flex-1 w-full flex items-center justify-center">
            <ActivityChart darkMode={darkMode} />
        </div>
    </div>
);

const WorkflowPerformanceDashboard = () => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-full">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500"/> Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
             <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Avg. Completion</p>
                 <p className="text-2xl font-bold text-slate-900 dark:text-white">4.2 <span className="text-sm font-medium text-slate-500">Days</span></p>
             </div>
             <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Success Rate</p>
                 <p className="text-2xl font-bold text-slate-900 dark:text-white">88% <span className="text-sm font-medium text-emerald-500">High</span></p>
             </div>
             <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 col-span-2">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Weekly Goal</p>
                    <span className="text-xs font-bold text-slate-600">3/5 Tasks</span>
                 </div>
                 <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full rounded-full" style={{ width: '60%' }}></div>
                 </div>
             </div>
        </div>
    </div>
);

const RecentActivity = () => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><History size={18} className="text-slate-500"/> Recent Activity</h3>
            <button className="text-xs font-bold text-slate-600 hover:text-slate-700">View All</button>
        </div>
        <div className="space-y-3">
            {RECENT_ACTIVITIES.map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${activity.bg} ${activity.color}`}>
                            <activity.icon size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                        activity.status === 'Applied' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        activity.status === 'Edited' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{activity.status}</span>
                </div>
            ))}
        </div>
    </div>
);

// --- Main Overview Component ---

export default function DashboardOverview({ darkMode: darkModeProp, setActiveTab: setActiveTabProp, stats = DEFAULT_STATS }: DashboardOverviewProps) {
   // Get darkMode from context, fallback to prop or document
   const context = useDashboardContext();
   const darkMode = context?.darkMode ?? darkModeProp ?? (typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false);
   const setActiveTab = context?.setActiveTab ?? setActiveTabProp ?? (() => {});
   
   
   const focusWidget = {
       title: 'Audit your Personal Brand',
       description: 'Analyze your brand across LinkedIn, GitHub, and portfolio',
       link: 'brand',
       icon: <Target className="w-8 h-8" />,
       gradient: 'from-slate-600 to-purple-600',
       buttonText: 'Run Brand Audit'
   };

   const creditsLeft = stats.dailyLimit - stats.usedToday;

   return (
    <div className="space-y-8 animate-fade-in-up pb-12">
        <PersistentNotificationBanner />

        {/* Hero Section */}
        <div 
            className={`bg-gradient-to-r ${focusWidget.gradient} rounded-2xl p-8 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
            onClick={() => setActiveTab(focusWidget.link)}
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/20 transition-colors"></div>
            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <h1 className="text-3xl font-extrabold mb-2">Good morning, Alex.</h1>
                    <div className="mt-6">
                        <div className="flex items-center gap-3 mb-2">
                            {focusWidget.icon}
                            <h2 className="text-2xl font-bold">{focusWidget.title}</h2>
                        </div>
                        <p className="text-white/90 text-lg mb-6 max-w-xl">{focusWidget.description}</p>
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-md">
                            {focusWidget.buttonText}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="hidden lg:block opacity-90 transform group-hover:scale-105 transition-transform duration-500">
                    <Rocket size={140} className="text-white/20" />
                </div>
            </div>
        </div>

        {/* Stats Row */}
        <StatsOverview {...stats} creditsLeft={creditsLeft} />

        {/* Tools Grid */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MissionCard
                    title="Resume Studio"
                    description="Create and manage professional resumes"
                    actionLink="resume"
                    isLocked={false}
                    isCompleted={stats.resumeCount > 0}
                    icon={<FileText className="w-6 h-6" />}
                    count={stats.resumeCount}
                    onClick={() => setActiveTab('resume')}
                />
                <MissionCard
                    title="Job Finder"
                    description="Discover opportunities that match your skill profile"
                    actionLink="finder"
                    isLocked={false}
                    isCompleted={stats.jobCount > 0}
                    icon={<Search className="w-6 h-6" />}
                    count={stats.jobCount}
                    onClick={() => setActiveTab('finder')}
                />
                <MissionCard
                    title="Brand Audit"
                    description="Analyze your professional online presence"
                    actionLink="audit"
                    isLocked={true}
                    isCompleted={false}
                    icon={<Globe className="w-6 h-6" />}
                    onClick={() => setActiveTab('audit')}
                />
            </div>
        </div>

        {/* Analytics & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <WorkflowAnalytics darkMode={darkMode} />
            <WorkflowPerformanceDashboard />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
            <RecentActivity />
        </div>
    </div>
   );
};

