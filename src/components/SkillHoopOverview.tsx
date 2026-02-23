import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Award, 
  ChevronRight, 
  Users,
  PartyPopper,
  Megaphone,
  ShieldCheck, 
  FileEdit,
  Crosshair,
  Flame,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DashboardBottomSection from './DashboardBottomSection';

// --- Helper Component ---

const AnimatedProgressBar = ({ value, className = "", colorClass = "bg-slate-600" }: { value: number; className?: string; colorClass?: string }) => {
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

// --- Sub-Section: Next Steps ---

const NextStepsSection = () => {
    const handleTaskComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#8b5cf6', '#10b981']
        });
    };

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-600"><CheckCircle2 size={20}/></div>
                    <h3 className="font-bold text-lg text-neutral-900">Next Steps</h3>
                </div>
                <button className="text-slate-600 text-sm font-bold hover:underline">View all tasks</button>
            </div>
            <div className="space-y-3 flex-1">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group hover:border-slate-500/50 hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-50 transition-colors">
                            <FileEdit size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-neutral-900">Tailor your resume for Senior Product Designer</h4>
                            <p className="text-xs text-slate-500">Applied to Stripe • 2 hours ago</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleTaskComplete}
                        className="bg-white border border-slate-200 text-slate-600 hover:text-slate-600 hover:border-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                        Quick Tailor
                    </button>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group hover:border-purple-500/50 hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-purple-600 shadow-sm group-hover:bg-purple-50 transition-colors">
                            <Crosshair size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-neutral-900">Complete your Skill Radar profile</h4>
                            <p className="text-xs text-slate-500">Boost your course recommendations by 40%</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleTaskComplete}
                        className="bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                        Start Assessment
                    </button>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group hover:border-orange-500/50 hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-orange-600 shadow-sm group-hover:bg-orange-50 transition-colors">
                            <Megaphone size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-neutral-900">Optimize your LinkedIn tagline</h4>
                            <p className="text-xs text-slate-500">Current tagline is "Open to Work" (Low impact)</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleTaskComplete}
                        className="bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                        Optimize Now
                    </button>
                </div>
            </div>
        </section>
    );
};

// --- Main Component ---

const DashboardTopSection = () => {
  // Mock Data
  const stats = [
    { label: "Active Applications", value: "12", change: "+2 this week", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", category: "Career Hub" },
    { label: "Interview Rate", value: "24%", change: "+5% from last month", icon: Users, color: "text-purple-600", bg: "bg-purple-50", category: "Career Hub" },
    { label: "Resume Strength", value: "85/100", change: "Optimized for ATS", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50", category: "Career Hub" },
    { label: "Personal Brand", value: "A-", change: "Top 10% in your field", icon: Award, color: "text-amber-600", bg: "bg-amber-50", category: "Brand" },
  ];

  const aiActions = [
      { id: 1, type: 'urgent', text: "Your interview with Linear is tomorrow. Review the AI prep sheet.", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
      { id: 2, type: 'opportunity', text: "New role at Airbnb matches your 'Design Systems' skill set (98% match).", icon: Sparkles, color: "text-slate-600", bg: "bg-slate-50" },
      { id: 3, type: 'task', text: "Complete 'React Hooks' quiz to finish your weekly sprint.", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" }
  ];

  const recentJobs = [
    { title: "Senior Product Designer", company: "Linear", status: "Interview", date: "2d ago", logo: "L" },
    { title: "Frontend Developer", company: "Vercel", status: "Applied", date: "4d ago", logo: "V" },
  ];

  const jobTrackerData = [
    { code: 'STR', company: 'Stripe', role: 'Senior Product Designer', status: 'Applied', lastActivity: '2h ago', statusColor: 'bg-blue-100 text-blue-600' },
    { code: 'GGL', company: 'Google', role: 'UX Researcher', status: 'Interviewing', lastActivity: 'Yesterday', statusColor: 'bg-emerald-100 text-emerald-600' },
    { code: 'FMA', company: 'Figma', role: 'Visual Designer', status: 'Screening', lastActivity: '3 days ago', statusColor: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up p-6 bg-slate-50">
        
        {/* Daily Briefing / AI Action Items */}
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Good afternoon, Alex.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiActions.map((action) => (
                    <div key={action.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 group cursor-pointer hover:border-slate-200">
                        <div className={`p-2.5 rounded-lg shrink-0 ${action.bg} ${action.color}`}>
                            <action.icon size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 leading-snug group-hover:text-neutral-900 transition-colors">{action.text}</p>
                            <div className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                                Take Action <ArrowRight size={12} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.category}</span>
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 mb-1 relative z-10">{stat.value}</div>
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">{stat.change}</span>
                    </div>
                        {stat.label === "Personal Brand" && (
                        <div className="absolute -right-4 -bottom-4 opacity-10 z-0">
                            <ShieldCheck size={100} />
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* ALIGNED GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- ROW 1 --- */}
            {/* Left: Next Steps */}
            <div className="lg:col-span-2 h-full">
                <NextStepsSection />
            </div>
            
            {/* Right: Brand Meter */}
            <div className="lg:col-span-1 h-full">
                <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-4 text-white">AI Personal Brand</h3>
                        <div className="flex justify-center my-6">
                            {/* Simple semi-circle representation */}
                            <div className="relative w-40 h-20 overflow-hidden">
                                <div className="absolute w-40 h-40 border-[12px] border-neutral-800 rounded-full"></div>
                                <div 
                                    className="absolute w-40 h-40 border-[12px] border-slate-500 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(150deg)' }}
                                ></div>
                                <div className="absolute inset-x-0 bottom-0 text-center">
                                    <p className="text-3xl font-black text-white">84%</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-slate-400 mb-6 px-4">Your brand strength increased by 12% after the LinkedIn summary update.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Profile Completeness</span>
                                <span className="font-bold text-white">92%</span>
                            </div>
                            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                <AnimatedProgressBar value={92} colorClass="bg-emerald-500" />
                            </div>
                            <div className="flex items-center justify-between text-xs mt-2">
                                <span className="text-slate-400 font-medium">Market Relevance</span>
                                <span className="font-bold text-white">64%</span>
                            </div>
                            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                <AnimatedProgressBar value={64} colorClass="bg-amber-500" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-8 -top-8 bg-slate-500/10 w-32 h-32 rounded-full blur-3xl"></div>
                </section>
            </div>

            {/* --- ROW 2 --- */}
            {/* Left: Pipeline Visuals */}
            <div className="lg:col-span-2 h-full">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Briefcase size={20}/></div>
                            <h3 className="font-bold text-lg text-neutral-900">Application Pipeline</h3>
                        </div>
                        <button className="text-sm font-bold text-slate-500 hover:text-neutral-900 flex items-center gap-1">View Board <ChevronRight size={16}/></button>
                    </div>
                    
                    {/* Visual Pipeline Bar */}
                    <div className="flex gap-2 mb-6 h-12">
                        <div className="flex-1 bg-slate-100 rounded-lg relative group cursor-pointer hover:bg-slate-200 transition-colors flex items-center justify-center">
                            <span className="font-bold text-slate-600 text-sm">Applied (8)</span>
                            <div className="absolute top-full mt-2 hidden group-hover:block z-10 bg-neutral-900 text-white text-xs px-2 py-1 rounded">8 Active Applications</div>
                        </div>
                        <div className="w-16 flex items-center justify-center text-slate-300"><ArrowRight size={16}/></div>
                        <div className="flex-1 bg-purple-100 rounded-lg relative group cursor-pointer hover:bg-purple-200 transition-colors flex items-center justify-center border border-purple-200">
                            <span className="font-bold text-purple-700 text-sm">Interview (3)</span>
                        </div>
                        <div className="w-16 flex items-center justify-center text-slate-300"><ArrowRight size={16}/></div>
                        <div className="flex-1 bg-emerald-100 rounded-lg relative group cursor-pointer hover:bg-emerald-200 transition-colors flex items-center justify-center border border-emerald-200">
                            <span className="font-bold text-emerald-700 text-sm">Offer (1)</span>
                        </div>
                    </div>

                    {/* Quick List for Pipeline */}
                    <div className="space-y-3 flex-1">
                        {recentJobs.map((job, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${job.company === 'Linear' ? 'bg-white text-neutral-900 border-slate-200' : 'bg-neutral-900 text-white border-neutral-900'}`}>
                                        {job.logo}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-neutral-900">{job.company}</div>
                                        <div className="text-xs text-slate-500">{job.title}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${job.status === 'Interview' ? 'text-purple-700 bg-purple-100' : 'text-blue-700 bg-blue-100'}`}>
                                        {job.status === 'Interview' ? 'Interview: Tomorrow' : 'Applied: 2d ago'}
                                    </span>
                                    <ChevronRight size={16} className="text-slate-400 group-hover:text-neutral-900"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Skill Radar */}
            <div className="lg:col-span-1 h-full">
                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-neutral-900">Skill Radar</h3>
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                            <p className="text-sm font-medium flex-1 text-slate-700">UI/UX Design</p>
                            <p className="text-sm font-bold text-neutral-900">Expert</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <p className="text-sm font-medium flex-1 text-slate-700">Prototyping</p>
                            <p className="text-sm font-bold text-neutral-900">Advanced</p>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            <p className="text-sm font-medium flex-1 text-slate-700">React/Frontend</p>
                            <p className="text-sm font-bold text-neutral-900">No Data</p>
                        </div>
                    </div>
                        <button className="w-full py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors mt-auto text-slate-600">
                        Take Skill Assessment
                    </button>
                </section>
            </div>

            {/* --- ROW 3 --- */}
            {/* Left: Job Tracker Table */}
            <div className="lg:col-span-2 h-full">
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
                        <div className="p-6 pb-0 flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-neutral-900">Job Tracker</h3>
                        <button className="text-slate-600 text-sm font-bold hover:underline">Go to tracker</button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Position</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {jobTrackerData.map((job, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold flex items-center gap-3 text-neutral-900">
                                            <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {job.code}
                                            </div>
                                            {job.company}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{job.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${job.statusColor}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{job.lastActivity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right: Referral + Streak (Combined to match height of Tracker) */}
            <div className="lg:col-span-1 flex flex-col gap-8 h-full">
                    {/* Referral Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300 flex-1 flex flex-col justify-between">
                    <div>
                        <PartyPopper className="mb-2 h-6 w-6 text-slate-400" />
                        <h4 className="font-bold text-lg leading-tight mb-2">Invite your colleagues</h4>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">Refer a friend and get 5 free AI credits each. Start building together.</p>
                    </div>
                    <button className="w-full bg-white text-neutral-900 font-black text-xs py-2.5 rounded-lg uppercase tracking-wider hover:bg-slate-200 transition-colors">Get Invite Link</button>
                </div>

                    {/* Daily Streak Widget */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                            <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={20} />
                            Daily Streak
                        </h3>
                        <span className="text-2xl font-black text-neutral-900">4</span>
                    </div>
                    
                    <div className="flex justify-between items-end h-12 mb-4 gap-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                            const active = i < 4; // Mock active for Mon-Thu
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group/day">
                                    <div className={`w-full rounded-t-sm transition-all duration-500 ${active ? 'h-8 bg-orange-500' : 'h-2 bg-slate-100 group-hover/day:bg-slate-200'}`}></div>
                                    <span className={`text-[9px] font-bold uppercase ${active ? 'text-orange-600' : 'text-slate-300'}`}>{day}</span>
                                </div>
                            )
                        })}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed relative z-10">
                        Keep your <span className="font-bold text-orange-600">2x Multiplier</span> active.
                    </p>
                    
                        {/* Background decoration */}
                        <div className="absolute -right-4 -bottom-4 text-orange-50 opacity-50 z-0">
                        <Flame size={80} />
                    </div>
                </div>
            </div>
        </div>
        
        {/* Bottom Section: Learning Path, Content Engine, Skill Benchmarking, etc. */}
        <DashboardBottomSection />
    </div>
  );
};

export default DashboardTopSection;
