import React, { useState } from 'react';
import { 
  Target, 
  ArrowUpRight, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  ChevronDown, 
  Sparkles, 
  Crosshair, 
  BarChart3, 
  ChevronRight, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  Search,
  Info,
  PieChart,
  Bot,
  MessageSquare,
  Lock,
  AlertCircle,
  Clock,
  Globe,
  Users,
  Building2,
  MapPin
} from 'lucide-react';

// --- Recharts Mock (Lightweight SVG Implementation for Overview Charts) ---
const RechartsMock = {
    ResponsiveContainer: ({ children }: any) => <div style={{ height: '100%', width: '100%', position: 'relative' }}>{children}</div>,
    RadarChart: ({ data }: any) => (
        <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
            <circle cx="150" cy="150" r="40" stroke="#e2e8f0" fill="none" />
            <circle cx="150" cy="150" r="80" stroke="#e2e8f0" fill="none" />
            <circle cx="150" cy="150" r="120" stroke="#e2e8f0" fill="none" />
            <line x1="150" y1="30" x2="150" y2="270" stroke="#e2e8f0" />
            <line x1="30" y1="150" x2="270" y2="150" stroke="#e2e8f0" />
            <path d="M150,50 L250,150 L150,250 L50,150 Z" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
            <path d="M150,70 L230,150 L150,230 L70,150 Z" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4"/>
        </svg>
    ),
    ComposedChart: ({ children }: any) => (
        <div className="w-full h-full flex flex-col justify-around p-4 relative">
            {/* Simple Bar Representation Mock */}
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <div key={i} className="flex items-center gap-2 h-4 w-full">
                    <div className="w-20 text-[10px] text-right text-slate-400">Skill {i+1}</div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full relative">
                        <div className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full" style={{ width: `${60 + Math.random() * 30}%` }}></div>
                        <div className="absolute left-[70%] top-[-2px] h-3 w-0.5 bg-slate-300"></div>
                    </div>
                </div>
            ))}
        </div>
    ),
    AreaChart: ({ data }: any) => (
        <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
             <defs>
                <linearGradient id="colorYourRoleSalary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="150" x2="400" y2="150" stroke="#e2e8f0" />
            <line x1="0" y1="0" x2="0" y2="150" stroke="#e2e8f0" />
            <line x1="0" y1="75" x2="400" y2="75" stroke="#f1f5f9" strokeDasharray="3 3" />

            {/* Area Path (Your Role) */}
            <path d="M0,120 Q100,110 200,90 T400,60 V150 H0 Z" fill="url(#colorYourRoleSalary)" />
            <path d="M0,120 Q100,110 200,90 T400,60" fill="none" stroke="#4f46e5" strokeWidth="3" />
            
            {/* Line Path (Market Avg) */}
            <path d="M0,140 Q100,130 200,110 T400,90" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* X-Axis Labels */}
            <g className="text-[10px] fill-slate-400">
                <text x="0" y="165">2020</text>
                <text x="80" y="165">2021</text>
                <text x="160" y="165">2022</text>
                <text x="240" y="165">2023</text>
                <text x="320" y="165">2024</text>
                <text x="380" y="165">2025</text>
            </g>
        </svg>
    ),
    BarChart: ({ data }: any) => (
        <div className="w-full h-full flex flex-col justify-between p-2">
            {data.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 w-20 text-right">{d.name}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full" 
                            style={{ width: `${d.value * 2}%`, backgroundColor: d.color }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 w-8">{d.value}%</span>
                </div>
            ))}
        </div>
    ),
    // Dummy components to satisfy imports
    PolarGrid: () => null,
    PolarAngleAxis: () => null,
    PolarRadiusAxis: () => null,
    Radar: () => null,
    Legend: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Bar: () => null,
    Line: () => null,
    Area: () => null,
    Cell: () => null
};

const { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ComposedChart, CartesianGrid, XAxis, YAxis, Bar, Line, AreaChart, Area, BarChart, Cell } = RechartsMock;

// --- Mock Data ---

const targetRoles = [
  { id: 'senior-dev', title: 'Senior Developer', level: 'Senior', avgSalary: 145000, demandScore: 85, growthRate: 12 },
  { id: 'tech-lead', title: 'Tech Lead', level: 'Lead', avgSalary: 175000, demandScore: 78, growthRate: 15 },
  { id: 'staff-engineer', title: 'Staff Engineer', level: 'Staff', avgSalary: 205000, demandScore: 65, growthRate: 18 },
];

const skillComparisonData = [
  { skill: 'React', yourLevel: 85, marketAvg: 70, topPerformers: 95, gap: 10, importance: 'critical', trend: 'rising' },
  { skill: 'TypeScript', yourLevel: 75, marketAvg: 65, topPerformers: 90, gap: 15, importance: 'critical', trend: 'rising' },
  { skill: 'Node.js', yourLevel: 70, marketAvg: 72, topPerformers: 88, gap: 18, importance: 'important', trend: 'stable' },
  { skill: 'System Design', yourLevel: 55, marketAvg: 68, topPerformers: 92, gap: 37, importance: 'critical', trend: 'rising' },
  { skill: 'AWS', yourLevel: 60, marketAvg: 70, topPerformers: 90, gap: 30, importance: 'important', trend: 'rising' },
  { skill: 'Docker/K8s', yourLevel: 65, marketAvg: 68, topPerformers: 85, gap: 20, importance: 'important', trend: 'rising' },
  { skill: 'SQL', yourLevel: 80, marketAvg: 75, topPerformers: 88, gap: 8, importance: 'important', trend: 'stable' },
  { skill: 'Leadership', yourLevel: 50, marketAvg: 72, topPerformers: 95, gap: 45, importance: 'critical', trend: 'rising' }
];

const radarData = skillComparisonData.map(s => ({
  skill: s.skill,
  You: s.yourLevel,
  'Market Avg': s.marketAvg,
  'Top Performers': s.topPerformers
}));

const salaryTrendData = [
  { year: '2020', yourRole: 95000, targetRole: 130000, marketAvg: 85000 },
  { year: '2021', yourRole: 105000, targetRole: 140000, marketAvg: 92000 },
  { year: '2022', yourRole: 118000, targetRole: 155000, marketAvg: 100000 },
  { year: '2023', yourRole: 128000, targetRole: 165000, marketAvg: 108000 },
  { year: '2024', yourRole: 135000, targetRole: 175000, marketAvg: 115000 },
  { year: '2025', yourRole: 145000, targetRole: 190000, marketAvg: 125000 }
];

const salaryCompositionData = [
  { component: 'Base Salary', yourValue: 135000, marketValue: 145000, gap: -10000, color: 'bg-indigo-500' },
  { component: 'Equity / RSUs', yourValue: 25000, marketValue: 45000, gap: -20000, color: 'bg-purple-500' },
  { component: 'Annual Bonus', yourValue: 15000, marketValue: 20000, gap: -5000, color: 'bg-emerald-500' },
];

const demandTrendData = [
    { month: 'May', jobs: 320, applicants: 15 },
    { month: 'Jun', jobs: 350, applicants: 18 },
    { month: 'Jul', jobs: 310, applicants: 22 },
    { month: 'Aug', jobs: 410, applicants: 16 }, // Surge
    { month: 'Sep', jobs: 480, applicants: 14 },
    { month: 'Oct', jobs: 520, applicants: 12 },
];

const hiringCompanies = [
    { name: 'TechFlow', roles: 12, match: '98%', logo: 'TF', type: 'FinTech', location: 'Remote' },
    { name: 'CloudScale', roles: 8, match: '92%', logo: 'CS', type: 'SaaS', location: 'Hybrid' },
    { name: 'DataSystems', roles: 5, match: '88%', logo: 'DS', type: 'Data', location: 'New York' },
];

const regionalDemand = [
    { name: 'Remote', value: 45, color: '#6366f1' },
    { name: 'SF Bay Area', value: 20, color: '#8b5cf6' },
    { name: 'NYC', value: 15, color: '#10b981' },
    { name: 'Austin', value: 10, color: '#f59e0b' },
    { name: 'Other', value: 10, color: '#94a3b8' },
];

const formatSalary = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const getImportanceColor = (importance: string) => {
  switch (importance) {
    case 'critical': return 'text-red-600 bg-red-100 border-red-200';
    case 'important': return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'nice-to-have': return 'text-blue-600 bg-blue-100 border-blue-200';
    default: return 'text-slate-600 bg-slate-100 border-slate-200';
  }
};

// --- Component ---

const SkillBenchmarking = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRole, setSelectedRole] = useState(targetRoles[0]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [comparisonView, setComparisonView] = useState('bar');
  const [skillsFilter, setSkillsFilter] = useState('all');

  // Static metrics for display
  const overallMatch = 78;
  const salaryPotential = 35;
  const criticalGap = 15;

  return (
    <div className="space-y-6 font-sans text-slate-900 w-full">
      {/* Skill Benchmarking Component Loaded */}
      
      {/* 1. KEY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                 <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Target size={20} />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Match</span>
             </div>
             <div className="text-3xl font-bold text-slate-900 mb-1">{overallMatch}%</div>
             <div className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                 <ArrowUpRight size={12} /> +5% this month
             </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                 <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Zap size={20} />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Gap</span>
             </div>
             <div className="text-3xl font-bold text-slate-900 mb-1">{criticalGap}%</div>
             <div className="text-xs font-medium text-slate-500">Avg gap in top skills</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                 <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Upside</span>
             </div>
             <div className="text-3xl font-bold text-slate-900 mb-1">+{salaryPotential}%</div>
             <div className="text-xs font-medium text-slate-500">{formatSalary(selectedRole.avgSalary)} target</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demand</span>
             </div>
             <div className="text-3xl font-bold text-slate-900 mb-1">{selectedRole.demandScore}</div>
             <div className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                 <ArrowUpRight size={12} /> +{selectedRole.growthRate}% YoY
             </div>
          </div>
      </div>

      {/* 2. NAVIGATION BAR & CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nav Tabs */}
        <div className="lg:col-span-2">
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex w-full">
                {['overview', 'skills', 'salary', 'demand'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap text-center ${
                            activeTab === tab 
                            ? 'bg-neutral-900 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Target Role Dropdown */}
        <div className="relative z-20 w-full">
            <button 
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-3 px-4 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group w-full h-full"
            >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shrink-0">
                    <Briefcase size={18} />
                </div>
                <div className="text-left flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Target Role</div>
                    <div className="text-sm font-bold text-slate-900 leading-none truncate">{selectedRole.title}</div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ${showRoleDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up">
                  <div className="p-3 bg-slate-50 border-b border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase">Select Target Role</p>
                  </div>
                  {targetRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => { setSelectedRole(role); setShowRoleDropdown(false); }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${selectedRole.id === role.id ? 'bg-indigo-50/50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{role.title}</div>
                          <div className="text-xs text-slate-500">{formatSalary(role.avgSalary)} avg</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-green-600">+{role.growthRate}%</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
            )}
         </div>
      </div>

      {/* 3. OVERVIEW TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* Hero Section: Readiness & Insight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Readiness Score */}
                <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-slate-300 mb-4">
                            <Target size={18} />
                            <span className="text-sm font-bold uppercase tracking-wider">Role Readiness</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-bold">{overallMatch}%</span>
                            <span className="text-sm font-medium text-emerald-400 mb-2">+5% this month</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">You are a strong candidate for <span className="text-white font-bold">{selectedRole.title}</span> roles.</p>
                    </div>
                     {/* Decorative Elements */}
                     <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                     <div className="absolute top-0 right-0 p-6 opacity-50">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-l-transparent transform rotate-45"></div>
                        </div>
                     </div>
                </div>

                {/* AI Insight / Action */}
                <div className="md:col-span-2 bg-gradient-to-r from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 flex flex-col justify-between relative">
                    <div className="flex items-start gap-4">
                         <div className="bg-white p-2.5 rounded-xl shadow-sm border border-indigo-50 text-indigo-600">
                            <Sparkles size={24} />
                         </div>
                         <div>
                             <h3 className="text-lg font-bold text-slate-900 mb-1">Strategic Advantage</h3>
                             <p className="text-sm text-slate-600 leading-relaxed">
                                 Your <span className="font-bold text-indigo-700">React</span> and <span className="font-bold text-indigo-700">SQL</span> skills place you in the top 15% of applicants. However, most Senior roles in this bracket heavily weight <span className="font-bold text-red-600">System Design</span>.
                             </p>
                         </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-4 sm:pl-[3.25rem]">
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm shadow-indigo-200">
                            Start System Design Track
                        </button>
                        <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors">
                            View Gap Analysis
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Col: Skill Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Skill Competency Map</h3>
                            <p className="text-sm text-slate-500">Visualizing your profile vs. market requirements</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setComparisonView('radar')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${comparisonView === 'radar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                            >
                                <Crosshair size={14} /> Radar
                            </button>
                             <button 
                                onClick={() => setComparisonView('bar')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${comparisonView === 'bar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                            >
                                <BarChart3 size={14} /> Bar
                            </button>
                        </div>
                    </div>
                    
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            {comparisonView === 'bar' ? (
                                <ComposedChart data={skillComparisonData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis type="category" dataKey="skill" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                    />
                                    <Bar dataKey="yourLevel" name="You" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12} background={{ fill: '#f1f5f9', radius: [0, 4, 4, 0] }} />
                                    <Line type="monotone" dataKey="marketAvg" name="Market Avg" stroke="#94a3b8" strokeWidth={2} dot={{r:3}} />
                                    <Line type="monotone" dataKey="topPerformers" name="Target" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                                </ComposedChart>
                            ) : (
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="You" dataKey="You" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                    <Radar name="Market" dataKey="Market Avg" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.2} />
                                    <Legend />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </RadarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Col: Priority Stack (1/3 width) */}
                <div className="space-y-6">
                    {/* Critical Gaps Widget */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" /> Critical Attention
                        </h3>
                        <div className="space-y-3">
                             {skillComparisonData.filter(s => s.gap > 15).slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs border border-red-100 shrink-0">
                                        -{item.gap}%
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-900 text-sm truncate">{item.skill}</div>
                                        <div className="text-xs text-slate-500">High Impact Skill</div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Salary Teaser */}
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-emerald-800 uppercase">Salary Potential</span>
                            <TrendingUp size={16} className="text-emerald-600" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-900 mb-1">$175k</div>
                        <div className="text-xs text-emerald-700 mb-3">Median for top performers</div>
                        <div className="w-full bg-emerald-200/50 h-1.5 rounded-full overflow-hidden mb-1">
                            <div className="bg-emerald-500 h-full w-3/4 rounded-full"></div>
                        </div>
                        <div className="text-[10px] text-emerald-600 text-right font-medium">You are here ($145k)</div>
                    </div>
                </div>
            </div>

            {/* Bottom Banner: Demand Pulse */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Activity size={20} />
                     </div>
                     <div>
                         <h4 className="font-bold text-slate-900 text-sm">Market Demand is High</h4>
                         <p className="text-xs text-slate-500">Openings for {selectedRole.title} are up 12% this month.</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-6">
                     <div className="hidden sm:block text-right">
                         <div className="text-xs text-slate-400 font-bold uppercase">Active Roles</div>
                         <div className="font-bold text-slate-900">~520 Openings</div>
                     </div>
                     <button 
                        onClick={() => setActiveTab('demand')}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                     >
                         View Market Data <ArrowRight size={16} />
                     </button>
                 </div>
            </div>
        </div>
      )}

      {/* Skills Tab Content */}
      {activeTab === 'skills' && (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* Filters & Summary Header */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto relative">
                    <Search size={16} className="text-slate-400 absolute left-3" />
                    <input 
                        type="text" 
                        placeholder="Search skills..." 
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 placeholder:text-slate-400 w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                    {['all', 'critical', 'important', 'strengths'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setSkillsFilter(filter)}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-bold capitalize whitespace-nowrap transition-all ${
                                skillsFilter === filter 
                                ? 'bg-white text-neutral-900 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Skills List */}
            <div className="grid grid-cols-1 gap-4">
                {skillComparisonData
                    .filter(s => {
                        if (skillsFilter === 'critical') return s.importance === 'critical' && s.gap > 0;
                        if (skillsFilter === 'important') return s.importance === 'important';
                        if (skillsFilter === 'strengths') return s.gap <= 0;
                        return true;
                    })
                    .map((skill, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        {/* Decorative background element for critical items with large gaps */}
                        {skill.importance === 'critical' && skill.gap > 15 && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        )}

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pl-2">
                            
                            {/* Skill Info */}
                            <div className="w-full md:w-1/4">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-slate-900 text-lg">{skill.skill}</h4>
                                    {skill.trend === 'rising' && <div className="bg-green-50 text-green-600 p-1 rounded-full" title="Trending Skill"><TrendingUp size={12}/></div>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`capitalize px-2 py-0.5 rounded-md border ${getImportanceColor(skill.importance)} text-[10px] font-bold`}>
                                        {skill.importance}
                                    </span>
                                </div>
                            </div>

                            {/* Comparison Visualization */}
                            <div className="w-full md:w-2/5 flex flex-col justify-center">
                                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                                        <span>Your Level</span>
                                        <span className="text-slate-400">Market Avg ({skill.marketAvg}%)</span>
                                        <span className="text-emerald-600 font-bold">Target ({skill.topPerformers}%)</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full relative overflow-hidden">
                                        {/* Market Marker Line */}
                                        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-300 z-10" style={{ left: `${skill.marketAvg}%` }}></div>
                                        
                                        {/* Target Background (The gap to fill) */}
                                        <div className="absolute top-0 bottom-0 left-0 bg-emerald-100" style={{ width: `${skill.topPerformers}%` }}></div>
                                        
                                        {/* User Progress */}
                                        <div 
                                        className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000 ${skill.gap > 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
                                        style={{ width: `${skill.yourLevel}%` }}
                                        ></div>
                                </div>
                            </div>

                            {/* Gap & Action */}
                            <div className="w-full md:w-1/4 flex items-center justify-between md:justify-end gap-6">
                                <div className="text-right">
                                    <div className={`text-xl font-bold ${skill.gap > 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                                        {skill.gap > 0 ? `-${skill.gap}%` : <CheckCircle2 size={24} />}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        {skill.gap > 0 ? 'Gap to Top 10%' : 'Skill Mastered'}
                                    </div>
                                </div>
                                
                                <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                        
                        {/* Dynamic Insight Footer */}
                        {skill.gap > 10 && (
                                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50/50 -mx-5 -mb-5 px-5 py-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                    <Sparkles size={14} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-600">
                                        <span className="font-bold text-indigo-700">AI Recommendation:</span> 
                                        To reach Senior level in {skill.skill}, focus on <span className="underline decoration-indigo-200 decoration-2">System Design patterns</span> and <span className="underline decoration-indigo-200 decoration-2">performance optimization</span>.
                                    </p>
                                </div>
                                <button className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                    Generate Plan
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Salary Tab Content */}
      {activeTab === 'salary' && (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* Top Cards: Compensation Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign size={64} />
                        </div>
                        <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-slate-300">
                            <span className="text-xs font-bold uppercase tracking-wider">Total Compensation</span>
                            <Info size={12} />
                        </div>
                        <div className="text-3xl font-bold mb-1">$175,000</div>
                        <div className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded inline-block">
                            +12% vs last year
                        </div>
                        </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Salary</span>
                        <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600"><Briefcase size={16}/></div>
                        </div>
                        <div>
                        <div className="text-2xl font-bold text-slate-900">$135,000</div>
                        <div className="text-xs text-slate-500">77% of Total Comp</div>
                        </div>
                </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Equity & Bonus</span>
                        <div className="bg-purple-50 p-1.5 rounded-lg text-purple-600"><PieChart size={16}/></div>
                        </div>
                        <div>
                        <div className="text-2xl font-bold text-slate-900">$40,000</div>
                        <div className="text-xs text-slate-500">Vesting over 4 years</div>
                        </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Column: Trends & Percentiles */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Market Percentile Visualization */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Market Positioning</h3>
                                <p className="text-sm text-slate-500">Where you stand vs. {selectedRole.title} roles in your area</p>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                                Filter by Location
                            </button>
                        </div>
                        
                        <div className="relative pt-8 pb-4 px-4">
                            {/* The Bar */}
                            <div className="h-4 bg-gradient-to-r from-slate-200 via-indigo-100 to-emerald-100 rounded-full w-full relative"></div>
                            
                            {/* Markers */}
                            <div className="absolute top-0 w-full flex justify-between px-4 text-xs font-medium text-slate-400 mt-2">
                                <div className="flex flex-col items-center -ml-4">
                                    <span>$120k</span>
                                    <div className="h-2 w-0.5 bg-slate-300 mt-1"></div>
                                    <span className="mt-2">10th</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span>$160k</span>
                                    <div className="h-2 w-0.5 bg-slate-300 mt-1"></div>
                                    <span className="mt-2 font-bold text-slate-600">Median</span>
                                </div>
                                <div className="flex flex-col items-center -mr-4">
                                    <span>$210k</span>
                                    <div className="h-2 w-0.5 bg-slate-300 mt-1"></div>
                                    <span className="mt-2">90th</span>
                                </div>
                            </div>

                            {/* User Position Pin */}
                            <div className="absolute top-2 left-[35%] -translate-x-1/2 flex flex-col items-center group cursor-pointer">
                                <div className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 rounded mb-1 shadow-lg transform group-hover:-translate-y-1 transition-transform">
                                    You ($145k)
                                </div>
                                <div className="w-4 h-4 bg-neutral-900 rounded-full border-4 border-white shadow-md"></div>
                            </div>

                                {/* Target Position Pin (Ghost) */}
                                <div className="absolute top-2 left-[75%] -translate-x-1/2 flex flex-col items-center group cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded mb-1 shadow-lg">
                                    Goal ($185k)
                                </div>
                                <div className="w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-md border-dashed"></div>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 flex gap-3 items-start">
                                <div className="mt-0.5 text-indigo-600"><TrendingUp size={16} /></div>
                                <p>You are currently in the <span className="font-bold text-slate-900">38th percentile</span>. Improving your <span className="font-bold text-slate-900">System Design</span> skills could move you to the 65th percentile ($172k) within 12 months.</p>
                        </div>
                    </div>

                    {/* Salary Evolution Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Compensation Evolution</h3>
                            <p className="text-sm text-slate-500">Your growth trajectory vs market inflation</p>
                        </div>
                        <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salaryTrendData}>
                                    <defs>
                                        <linearGradient id="colorYourRoleSalary" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v: any) => `$${v/1000}k`} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val: any) => formatSalary(val)} 
                                    />
                                    <Area type="monotone" dataKey="yourRole" stroke="#4f46e5" strokeWidth={3} fill="url(#colorYourRoleSalary)" />
                                    <Line type="monotone" dataKey="marketAvg" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Market Avg" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Side Stats Column */}
                <div className="space-y-6">
                    {/* Component Breakdown */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Pay Mix Analysis</h3>
                        <div className="space-y-5">
                            {salaryCompositionData.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm font-bold text-slate-700">{item.component}</span>
                                        <span className="text-xs font-medium text-slate-500">Target: {formatSalary(item.marketValue)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${item.color}`} 
                                                style={{ width: `${(item.yourValue / item.marketValue) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 min-w-[60px] text-right">{formatSalary(item.yourValue)}</span>
                                    </div>
                                    {item.gap < 0 && (
                                        <div className="text-[10px] text-amber-600 mt-1 font-medium flex items-center gap-1">
                                            <AlertCircle size={10} /> Gap: {formatSalary(Math.abs(item.gap))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Negotiation Coach */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <h3 className="font-bold text-lg">Negotiation Coach</h3>
                            </div>
                            
                            <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                                "Your equity package is <span className="font-bold text-white">45% below market</span> for Senior roles. In your next review, leverage your recent React 19 migration project to request a stock refresher."
                            </p>

                            <button className="w-full bg-white text-indigo-600 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                <MessageSquare size={16} /> Draft Negotiation Script
                            </button>
                        </div>
                        
                        {/* Background Decoration */}
                        <div className="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Unlocked Potential */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                            <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">Unlocked Potential</div>
                                <div className="text-2xl font-bold text-slate-900">$25,000</div>
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                                <Lock size={16} />
                            </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">Estimated additional income available by closing your top 2 skill gaps.</p>
                            <button className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1">
                            View Skill Gaps <ArrowRight size={12} />
                            </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Demand Tab Content */}
      {activeTab === 'demand' && (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* Market Pulse Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Activity size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Market Heat</div>
                            <div className="text-xl font-bold text-slate-900">Very Hot</div>
                            <div className="text-xs font-medium text-emerald-600">+22% vs Q2</div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time to Hire</div>
                            <div className="text-xl font-bold text-slate-900">14 Days</div>
                            <div className="text-xs font-medium text-emerald-600">Faster than avg</div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Globe size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remote Ops</div>
                            <div className="text-xl font-bold text-slate-900">45%</div>
                            <div className="text-xs font-medium text-slate-500">of open roles</div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applicants/Role</div>
                            <div className="text-xl font-bold text-slate-900">12</div>
                            <div className="text-xs font-medium text-emerald-600">Low competition</div>
                        </div>
                    </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hiring Velocity Trend */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Job Volume Trend</h3>
                                <p className="text-sm text-slate-500">New {selectedRole.title} openings (Last 6 Months)</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Openings
                                </span>
                            </div>
                        </div>
                        <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={demandTrendData}>
                                    <defs>
                                        <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="jobs" stroke="#6366f1" strokeWidth={3} fill="url(#colorJobs)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                            <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
                                <TrendingUp size={16} className="text-indigo-600 mt-0.5" />
                                <p className="text-sm text-indigo-900">
                                    <strong>Analyst Insight:</strong> October shows a <span className="text-indigo-700 font-bold">12% surge</span> in openings for Senior roles. Companies are rushing to fill budget headcount before Q4 freeze.
                                </p>
                            </div>
                    </div>

                    {/* Top Companies List */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Who's Hiring Now</h3>
                        <div className="space-y-4">
                            {hiringCompanies.map((company, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-sm">
                                            {company.logo}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{company.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Building2 size={12} /> {company.type}
                                                <span className="text-slate-300">•</span>
                                                <MapPin size={12} /> {company.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-sm font-bold text-slate-900">{company.roles} Roles</div>
                                            <div className="text-xs text-slate-500">Active now</div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">{company.match} Match</div>
                                                <button className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">View Roles →</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Geography & Insights */}
                <div className="space-y-6">
                    {/* Geographic Distribution */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Location Hotspots</h3>
                        <div className="h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={regionalDemand} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16}>
                                        {regionalDemand.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">Remote roles account for nearly 50% of the market demand.</p>
                    </div>

                    {/* Skill Keywords */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Trending Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {['React 19', 'Next.js', 'System Design', 'GraphQL', 'AWS', 'Accessibility', 'Mentorship'].map((tag, i) => (
                                <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${i < 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500 mb-2">Resume Optimization:</p>
                                <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    Your resume matches 5/7 top keywords.
                                </div>
                                <button className="text-indigo-600 text-xs font-bold mt-2 hover:underline">Fix "Accessibility" Gap</button>
                            </div>
                    </div>
                    
                    {/* Strategy Card */}
                    <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles size={20} className="text-yellow-400" />
                            <h3 className="font-bold">Winning Strategy</h3>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">
                            Demand is surging in <strong>FinTech</strong>. Your background in data visualization makes you a prime candidate for dashboard-heavy roles at companies like <strong>TechFlow</strong>.
                        </p>
                        <button className="w-full bg-white text-neutral-900 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
                            Apply to FinTech Roles
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SkillBenchmarking;