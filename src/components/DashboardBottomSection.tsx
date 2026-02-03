import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  BarChart3, 
  PenTool, 
  Timer, 
  Sparkles, 
  ArrowRight, 
  Award, 
  PlayCircle, 
  TrendingUp, 
  LineChart, 
  Activity,
  Users,
  Megaphone,
  ShieldCheck, 
  FileEdit,
  DraftingCompass,
  Compass,
  Info,
  Lightbulb,
  Terminal,
  Hourglass,
  Download,
  PlusCircle,
  Wand2,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// --- Data Constants ---

const ANALYTICS_DATA = {
  pipeline: {
    funnel: [
      { label: "Applications", value: 45, color: "bg-blue-500", change: "+12%" },
      { label: "Screenings", value: 18, color: "bg-indigo-500", change: "+5%" },
      { label: "Interviews", value: 8, color: "bg-purple-500", change: "+2%" },
      { label: "Offers", value: 2, color: "bg-emerald-500", change: "1 Pending" }
    ],
    metrics: [
      { label: "Avg. Response Time", value: "4.5 Days", icon: Timer },
      { label: "App Quality Score", value: "92/100", icon: Award },
      { label: "Interview Rate", value: "18%", icon: TrendingUp }
    ]
  },
  skills: {
    growth: [
      { month: "Aug", value: 65 },
      { month: "Sep", value: 72 },
      { month: "Oct", value: 85 },
      { month: "Nov", value: 82 },
      { month: "Dec", value: 94 },
    ],
    topSkills: [
      { name: "System Design", level: "Advanced", progress: 85 },
      { name: "React / Next.js", level: "Expert", progress: 95 },
      { name: "GraphQL", level: "Intermediate", progress: 60 }
    ],
    hoursLearned: 42
  },
  brand: {
    score: 780,
    history: [
      { label: "Profile Views", value: "+145%", trend: "up" },
      { label: "Post Engagement", value: "+60%", trend: "up" },
      { label: "Search Appearances", value: "2.1k", trend: "up" }
    ]
  }
};

// --- Helper Component ---

const AnimatedProgressBar = ({ value, className = "", colorClass = "bg-indigo-600" }: { value: number; className?: string; colorClass?: string }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass} ${className}`} style={{ width: `${width}%` }}></div>
  );
};

// --- Section Components ---

const LearningPathSection = () => (
    <section>
        <div className="flex items-end justify-between mb-6">
            <div>
                <h2 className="text-2xl font-black tracking-tight text-neutral-900">Learning Path &amp; Sprints</h2>
                <p className="text-slate-500 text-sm">Your personalized upskilling journey based on market gaps.</p>
            </div>
            <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                View Syllabus <ArrowRight size={16} />
            </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                    <DraftingCompass size={96} className="text-indigo-500" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase rounded">Current Sprint</span>
                        <span className="text-slate-500 text-[10px] font-bold">ENDS IN 4 DAYS</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">Advanced System Design</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-md">Master scalable architectures, load balancing, and distributed databases for senior-level interviews.</p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Overall Progress</span>
                            <span className="font-bold text-white">68%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                            <AnimatedProgressBar value={68} colorClass="bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 hover:bg-slate-800 transition-colors">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Lessons</p>
                                <p className="text-lg font-bold text-white">12/18</p>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 hover:bg-slate-800 transition-colors">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Projects</p>
                                <p className="text-lg font-bold text-white">2/3</p>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 hover:bg-slate-800 transition-colors">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Quizzes</p>
                                <p className="text-lg font-bold text-white">5/5</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-purple-200 transition-colors">
                <div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                        <PlayCircle size={32} />
                    </div>
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Recommended Next</p>
                    <h4 className="text-lg font-bold leading-tight mb-2 text-neutral-900">Microservices vs. Monoliths: A Deep Dive</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">Duration: 45 mins • Includes Interactive Lab</p>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
                     Resume Learning
                </button>
            </div>
        </div>
    </section>
);

const ContentEventGrid = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <section className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
                    <Sparkles className="text-indigo-600" size={24} />
                     Content Engine
                </h3>
                <button className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
                     Generate New Post
                </button>
            </div>
            <div className="space-y-4 flex-1 flex flex-col">
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <PenTool className="text-slate-400" size={16} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">LinkedIn Draft • AI Generated</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">High Engagement Potential</span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-3 mb-4 leading-relaxed">
                         "Just wrapped up a deep dive into System Design scalability! 🚀 One key takeaway: choosing between SQL and NoSQL isn't just about the data structure, it's about the growth trajectory of your..."
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex -space-x-2">
                             <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px]">👍</div>
                             <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px]">💡</div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors">
                                <FileEdit size={14} />
                            </button>
                            <button className="px-3 py-1 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors">Post Now</button>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400/40 transition-all cursor-pointer group opacity-60 hover:opacity-100 shadow-sm flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                        <PenTool className="text-slate-400" size={16} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">LinkedIn Draft • Career Pivot</span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                         "Transitioning into Product Design taught me that empathy isn't just a soft skill, it's a technical requirement..."
                    </p>
                </div>
            </div>
        </section>

        <section className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
                    <Compass className="text-purple-500" size={24} />
                     Event Scout
                </h3>
                <button className="text-slate-500 text-xs font-bold hover:text-neutral-900">Filter</button>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
                <div className="divide-y divide-slate-100 flex-1 flex flex-col">
                    <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group flex-1 items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex flex-col items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <span className="text-[10px] font-black text-indigo-600 uppercase">Oct</span>
                            <span className="text-xl font-black text-neutral-900">24</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-neutral-900 leading-tight mb-1">Tech Networking: Design in the Era of AI</h4>
                            <p className="text-xs text-slate-500 mb-2">Virtual • Hosted by Interaction Design Assoc.</p>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                    <Users size={14} /> 42 attending
                                 </span>
                                <button className="text-[10px] font-black text-indigo-600 hover:underline">Register Now</button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group flex-1 items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex flex-col items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <span className="text-[10px] font-black text-indigo-600 uppercase">Oct</span>
                            <span className="text-xl font-black text-neutral-900">27</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-neutral-900 leading-tight mb-1">Mock Interview Workshop: Senior Roles</h4>
                            <p className="text-xs text-slate-500 mb-2">In-person • San Francisco, CA</p>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                    <Users size={14} /> 12 spots left
                                 </span>
                                <button className="text-[10px] font-black text-indigo-600 hover:underline">Join Waitlist</button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group flex-1 items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex flex-col items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <span className="text-[10px] font-black text-indigo-600 uppercase">Nov</span>
                            <span className="text-xl font-black text-neutral-900">02</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-neutral-900 leading-tight mb-1">Portfolio Review with FAANG Leads</h4>
                            <p className="text-xs text-slate-500 mb-2">Virtual • Group Mentorship Session</p>
                            <button className="text-[10px] font-black text-indigo-600 hover:underline">Apply to participate</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

const SkillBenchmarkingSection = () => (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900">
                    <BarChart3 className="text-indigo-600" size={20} />
                    Skill Benchmarking
                </h3>
                <p className="text-sm text-slate-500 mt-1">Comparing your profile against <span className="font-bold text-slate-900">Senior Product Designer</span> averages.</p>
            </div>
             <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md shadow-sm border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    <span className="text-[10px] font-bold text-slate-700">You</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <span className="text-[10px] font-bold text-slate-500">Market Avg</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <PenTool size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900">Visual Design</h4>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto inline-block mt-0.5">Top 15%</span>
                        </div>
                    </div>
                    <span className="text-lg font-black text-slate-900">90<span className="text-xs text-slate-400 font-medium">/100</span></span>
                </div>
                
                <div className="relative h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                    <div className="absolute h-full w-1 bg-slate-400 z-10" style={{ left: '75%' }}></div>
                    <AnimatedProgressBar value={90} colorClass="bg-indigo-600" />
                </div>
                <div className="flex justify-between text-[10px] font-medium text-slate-400">
                    <span>0</span>
                    <span className="pl-12">Market Avg: 75%</span>
                    <span>100</span>
                </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Search size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900">User Research</h4>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-auto inline-block mt-0.5">On Track</span>
                        </div>
                    </div>
                     <span className="text-lg font-black text-slate-900">65<span className="text-xs text-slate-400 font-medium">/100</span></span>
                </div>
                
                <div className="relative h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                    <div className="absolute h-full w-1 bg-slate-400 z-10" style={{ left: '65%' }}></div>
                    <AnimatedProgressBar value={65} colorClass="bg-indigo-600" />
                </div>
                 <div className="flex justify-between text-[10px] font-medium text-slate-400">
                    <span>0</span>
                    <span>Market Avg: 65%</span>
                    <span>100</span>
                </div>
            </div>

             <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Layers size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900">Prototyping</h4>
                             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto inline-block mt-0.5">+5% Lead</span>
                        </div>
                    </div>
                     <span className="text-lg font-black text-slate-900">85<span className="text-xs text-slate-400 font-medium">/100</span></span>
                </div>
                
                <div className="relative h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                    <div className="absolute h-full w-1 bg-slate-400 z-10" style={{ left: '80%' }}></div>
                    <AnimatedProgressBar value={85} colorClass="bg-indigo-600" />
                </div>
                 <div className="flex justify-between text-[10px] font-medium text-slate-400">
                    <span>0</span>
                    <span className="pl-8">Market Avg: 80%</span>
                    <span>100</span>
                </div>
            </div>

             <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full -mr-8 -mt-8 z-0 opacity-50"></div>
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900">Strategy</h4>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-auto inline-block mt-0.5">20% Gap</span>
                        </div>
                    </div>
                     <span className="text-lg font-black text-slate-900">50<span className="text-xs text-slate-400 font-medium">/100</span></span>
                </div>
                
                <div className="relative h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div className="absolute h-full w-1 bg-slate-400 z-10" style={{ left: '70%' }}></div>
                    <AnimatedProgressBar value={50} colorClass="bg-amber-500" />
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-100/50">
                    <Sparkles size={12} className="text-amber-500" />
                    <p className="text-[10px] font-medium text-slate-600">
                        <span className="font-bold text-amber-600">Fix:</span> Take "Product Strategy 101" course.
                    </p>
                    <button className="ml-auto text-[10px] font-bold text-indigo-600 hover:underline">View</button>
                </div>
            </div>
        </div>
    </section>
);

const CertificationsSection = () => (
    <section>
        <div className="flex items-end justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Certifications</h2>
                <p className="text-slate-500 text-sm">Validating your expertise through recognized credentials.</p>
            </div>
            <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                Manage All <ArrowRight size={16} />
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                </div>
                <h4 className="font-bold text-sm mb-1 text-neutral-900">AWS Solutions Architect</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-4">Earned: Sep 2023</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ACTIVE</span>
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Download size={16} /></button>
                </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                    <Terminal size={28} />
                </div>
                <h4 className="font-bold text-sm mb-1 text-neutral-900">Google UX Design</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-4">Earned: Jul 2023</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ACTIVE</span>
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Download size={16} /></button>
                </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Hourglass size={20} />
                    </div>
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">IN PROGRESS</span>
                </div>
                <h4 className="font-bold text-sm mb-2 text-neutral-900">Meta Front-End Prof.</h4>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
                    <AnimatedProgressBar value={45} colorClass="bg-indigo-600" />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">45% Complete</p>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all h-full min-h-[180px]">
                <PlusCircle size={24} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Add Certificate</span>
            </div>
        </div>
    </section>
);

const CareerPerformanceWidget = () => {
    const [activeTab, setActiveTab] = useState('pipeline');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <section className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
                            <Briefcase className="text-blue-500" size={24} />
                            LinkedIn Optimizer
                        </h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center py-6 text-center border-b border-slate-100 mb-6">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle className="text-slate-100" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                                <circle className="text-indigo-600" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="65" strokeLinecap="round" strokeWidth="8"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-neutral-900">82%</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Strength</span>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-700">Your profile is "Strong"</p>
                        <p className="text-xs text-slate-500">Reach "All-Star" by completing suggested edits.</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Suggestions</p>
                        <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-400/40 transition-all">
                            <Lightbulb className="text-indigo-600 mt-0.5" size={16} />
                            <div>
                                <p className="text-xs font-bold mb-1 text-neutral-900">Update your headline for ATS</p>
                                <p className="text-[10px] text-slate-500">Add "Distributed Systems" and "Cloud Architecture" to appear in more recruiter searches.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-400/40 transition-all">
                            <Wand2 className="text-purple-500 mt-0.5" size={16} />
                            <div>
                                <p className="text-xs font-bold mb-1 text-neutral-900">Rewrite your 'About' section</p>
                                <p className="text-[10px] text-slate-500">Use our AI to draft a narrative that highlights your leadership transition.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            <div className="lg:col-span-3">
                 <section className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col shadow-sm transition-all relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
                            <LineChart className="text-indigo-600" size={24} />
                            Career Performance Analytics
                        </h3>
                         <div className="flex bg-slate-100 rounded-lg p-1">
                            {['pipeline', 'skills', 'brand'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${
                                        activeTab === tab 
                                        ? 'bg-white text-indigo-600 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 h-[380px]">
                        
                        {activeTab === 'pipeline' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {ANALYTICS_DATA.pipeline.funnel.map((stage, i) => (
                                        <div key={i} className="text-center group">
                                            <div className={`h-24 ${stage.color} rounded-t-lg bg-opacity-20 group-hover:bg-opacity-30 transition-all relative flex flex-col justify-end pb-2`}>
                                                <div className={`absolute bottom-0 left-0 right-0 ${stage.color} rounded-t-lg transition-all`} style={{ height: `${(stage.value / 50) * 100}%` }}></div>
                                                <span className="relative z-10 font-black text-lg text-slate-800">{stage.value}</span>
                                            </div>
                                            <div className="p-2 bg-slate-50 border-t border-slate-200 rounded-b-lg">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">{stage.label}</p>
                                                <p className="text-[9px] font-bold text-emerald-500">{stage.change}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {ANALYTICS_DATA.pipeline.metrics.map((metric, i) => (
                                        <div key={i} className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-50 text-indigo-600">
                                                <metric.icon size={16}/>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{metric.label}</p>
                                                <p className="text-sm font-black text-neutral-900">{metric.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex gap-3 items-start">
                                    <Info className="text-indigo-600 shrink-0 mt-0.5" size={16}/>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-900 mb-1">Pipeline Insight</p>
                                        <p className="text-[10px] text-slate-600 leading-relaxed">Your "Screening to Interview" conversion rate is 44%, which is <span className="font-bold text-emerald-600">12% higher</span> than the market average for Senior Product Designers. Keep tailoring your resumes!</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <div className="space-y-6 animate-fade-in-up h-full flex flex-col">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-900">Skill Acquisition Velocity</h4>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{ANALYTICS_DATA.skills.hoursLearned} Learning Hours</span>
                                </div>
                                
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={ANALYTICS_DATA.skills.growth}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis 
                                                dataKey="month" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} 
                                                dy={10} 
                                            />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                                cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke="#10b981" 
                                                strokeWidth={3} 
                                                fillOpacity={1} 
                                                fill="url(#colorValue)" 
                                                activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Skills Progress</p>
                                    {ANALYTICS_DATA.skills.topSkills.map((skill, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs font-bold text-slate-700">{skill.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{skill.level}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <AnimatedProgressBar value={skill.progress} colorClass="bg-indigo-600" />
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 w-8 text-right">{skill.progress}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'brand' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="flex items-center justify-center py-6">
                                    <div className="relative w-40 h-40">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path
                                                className="text-slate-100"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                            <path
                                                className="text-purple-500 transition-all duration-1000 ease-out"
                                                strokeDasharray={`${(ANALYTICS_DATA.brand.score / 850) * 100}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-neutral-900">{ANALYTICS_DATA.brand.score}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Brand Score</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {ANALYTICS_DATA.brand.history.map((item, i) => (
                                        <div key={i} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-purple-200 transition-colors">
                                            <p className="text-lg font-black text-purple-600 mb-1">{item.value}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                    <Megaphone size={14}/> Boost Visibility
                                </button>
                            </div>
                        )}

                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                         <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Activity size={14} className="text-emerald-500" />
                            <span>Real-time tracking active</span>
                         </div>
                         <button className="text-xs font-bold text-indigo-600 hover:underline">
                            Download full report
                         </button>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-full blur-3xl opacity-50 -z-0 pointer-events-none"></div>
                </section>
            </div>
        </div>
    );
};

// --- Main Wrapper Component ---

const DashboardBottomSection = () => {
    return (
        <div className="-mx-6 -mb-6 px-6 pb-6 pt-0 bg-slate-50">
            <div className="space-y-10 pt-6">
                <LearningPathSection />
                <ContentEventGrid />
                <SkillBenchmarkingSection />
                <CertificationsSection />
                <CareerPerformanceWidget />
            </div>
        </div>
    );
};

export default DashboardBottomSection;
