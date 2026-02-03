import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Briefcase, Layout, TrendingUp, Shield, Menu, X, Search, 
  Crosshair, MessageSquare, Bot, Calendar, FileText, 
  PenTool, History, Target, BookOpen, Timer, Trophy, 
  Bell, LogOut, ChevronRight, Sparkles, BarChart3, Linkedin, Moon, Sun
} from 'lucide-react';
import SkillHoopLogo from '@/components/ui/SkillHoopLogo';

// Context for sharing darkMode state and view
const DashboardContext = createContext<{ darkMode: boolean; setActiveTab: (tab: string) => void; currentView?: string; setCurrentView?: (view: string) => void } | null>(null);

export const useDashboardContext = () => {
  return useContext(DashboardContext);
};

// --- Constants & Data ---

const MOCK_USER = {
  name: "Alex Designer",
  role: "Product Designer",
  avatar: "https://placehold.co/100x100/171717/FFFFFF?text=AD",
  tier: "Job Seeker (Pro)", 
  credits: { current: 32, max: 50 }
};

const MENU_ITEMS = [
    {
      id: 'career',
      label: 'Career Hub',
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      items: [
        { id: 'resume', label: 'Smart Resume Studio', icon: FileText },
        { id: 'tailor', label: 'Application Tailor', icon: Crosshair },
        { id: 'cover-letter', label: 'Cover Letter Gen', icon: PenTool },
        { id: 'finder', label: 'Job Finder', icon: Search },
        { id: 'tracker', label: 'Job Tracker', icon: Layout },
        { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
        { id: 'history', label: 'Work History Manager', icon: History },
      ]
    },
    {
      id: 'brand',
      label: 'Brand Building',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      items: [
        { id: 'audit', label: 'Brand Audit', icon: BarChart3 },
        { id: 'content', label: 'Content Engine', icon: Bot },
        { id: 'portfolio', label: 'AI Portfolio', icon: Layout },
        { id: 'events', label: 'Event Scout', icon: Calendar },
        { id: 'linkedin', label: 'LinkedIn Optimizer', icon: Linkedin },
      ]
    },
    {
      id: 'upskill',
      label: 'Upskilling',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      items: [
        { id: 'up-dash', label: 'Progress Dashboard', icon: Target },
        { id: 'radar', label: 'Skill Radar', icon: Crosshair },
        { id: 'paths', label: 'Learning Paths', icon: BookOpen },
        { id: 'sprints', label: 'Sprints', icon: Timer },
        { id: 'certs', label: 'Certifications', icon: Trophy },
        { id: 'bench', label: 'Benchmarking', icon: BarChart3 },
      ]
    }
];

// --- Sub-Components ---

const SkillHoopLogoComponent = ({ className = "", darkMode }: { className?: string, darkMode: boolean }) => (
    <div className={className}>
      <SkillHoopLogo width={140} height={32} className="h-8" />
    </div>
);

const ThemeSwitch = ({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (v: boolean) => void }) => {
  return (
    <>
      <style>{`
        .switch {
          display: flex;
          align-items: center;
          --width-of-switch: 3.5em;
          --height-of-switch: 2em;
          --size-of-icon: 1.4em;
          --slider-offset: 0.3em;
          position: relative;
          width: var(--width-of-switch);
          height: var(--height-of-switch);
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #f4f4f5;
          transition: .4s;
          border-radius: 30px;
          border: 1px solid #e4e4e7;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: var(--size-of-icon,1.4em);
          width: var(--size-of-icon,1.4em);
          border-radius: 20px;
          left: var(--slider-offset,0.3em);
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(40deg,#ff0080,#ff8c00 70%);
          transition: .4s;
        }
        .switch input:checked + .slider {
          background-color: #303136;
          border-color: #303136;
        }
        .switch input:checked + .slider:before {
          left: calc(100% - (var(--size-of-icon,1.4em) + var(--slider-offset,0.3em)));
          background: #303136;
          box-shadow: inset -3px -2px 5px -2px #8983f7, inset -10px -4px 0 0 #a3dafb;
        }
      `}</style>
      <label className="switch">
        <input 
            type="checkbox" 
            checked={darkMode} 
            onChange={() => setDarkMode(!darkMode)}
        />
        <span className="slider"></span>
      </label>
    </>
  );
};

const CreditCounter = ({ current, max, darkMode }: { current: number, max: number, darkMode: boolean }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="flex flex-col gap-1 w-32 sm:w-40">
      <div className="flex justify-between text-xs font-bold">
        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Daily AI Credits</span>
        <span className={`${percentage < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
          {current}/{max}
        </span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            percentage < 20 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const UserAvatarMenu = ({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (v: boolean) => void }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
   
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#user-menu') && !target.closest('#user-menu-button')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative">
        <button 
          id="user-menu-button" 
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 p-[2px] bg-transparent hover:bg-gradient-to-r hover:from-yellow-400 hover:via-orange-500 hover:to-pink-500 transition-all group"
        >
          <img 
            id="user-avatar" 
            src={MOCK_USER.avatar} 
            className="w-full h-full rounded-full object-cover border-2 border-transparent group-hover:border-white dark:group-hover:border-neutral-900 transition-colors" 
            alt="User avatar" 
          />
        </button>
        
        {isUserMenuOpen && (
          <div 
              id="user-menu" 
              className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-xl border p-4 z-50 animate-fade-in-down ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
          >
              <div className="flex items-center gap-3 mb-4">
                <img 
                    src={MOCK_USER.avatar} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                    alt="User avatar" 
                />
                <div>
                    <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{MOCK_USER.name}</h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Pro Member</span>
                </div>
              </div>
              
              <div className={`border-t pt-2 space-y-1 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <button className={`w-full text-left text-sm rounded-lg p-2 flex items-center gap-3 transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-indigo-50'}`}>
                    <Bell size={16} />
                    <span className="font-medium">Notifications</span>
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
                </button>
                <button className={`w-full text-left text-sm rounded-lg p-2 flex items-center gap-3 transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-indigo-50'}`}>
                    <Layout size={16} />
                    <span className="font-medium">Customize</span>
                </button>
                <div className={`w-full text-left text-sm rounded-lg p-2 flex items-center justify-between transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-indigo-50'}`}>
                    <div className="flex items-center gap-3">
                        {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                        <span className="font-medium">Light/Dark Mode</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                        <ThemeSwitch darkMode={darkMode} setDarkMode={setDarkMode} />
                    </div>
                </div>
                <button 
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`w-full text-left text-sm rounded-lg p-2 flex items-center gap-3 transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                >
                    <LogOut size={16} />
                    <span className="font-medium">Sign Out</span>
                </button>
              </div>
          </div>
        )}
      </div>
  );
};

// --- Main Layout Component ---

export default function DashboardLayout({ children, headerAction, currentView, setCurrentView }: { children: React.ReactNode; headerAction?: React.ReactNode; currentView?: string; setCurrentView?: (view: string) => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openDropdowns, setOpenDropdowns] = useState<string[]>(['career-hub', 'brand-building', 'upskilling']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize Dark Mode from LocalStorage or System Preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('darkMode');
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(stored === 'true' || (stored === null && system));
    }
  }, []);

  // Apply Dark Mode class to HTML tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDropdown = (menuName: string) => {
    setOpenDropdowns(prev => 
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  // Link style helper
  const getLinkClass = (itemId: string) => {
    const active = activeTab === itemId;
    return `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      active 
        ? (darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-neutral-900')
        : (darkMode ? 'text-slate-500 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-neutral-900 hover:bg-slate-50')
    }`;
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-neutral-900 text-slate-100' : 'bg-slate-50 text-slate-900'} flex overflow-hidden`}>
      
      {/* --- Sidebar --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-neutral-900 border-white/10' : 'bg-[#f0f0f0] border-slate-200'}`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header (Logo + Mobile Close) */}
          <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
            <SkillHoopLogoComponent darkMode={darkMode} />
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
            {/* Overview Section */}
            <div>
              <h3 className={`px-3 mb-3 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Overview</h3>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'dashboard' 
                    ? (darkMode ? 'bg-slate-800 text-white' : 'bg-neutral-900 text-white') 
                    : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100')
                }`}
              >
                <Layout size={18} className="flex-shrink-0" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Category Dropdowns */}
            {MENU_ITEMS.map((category) => {
              const dropdownId = category.id === 'career' ? 'career-hub' : category.id === 'brand' ? 'brand-building' : 'upskilling';
              const isOpen = openDropdowns.includes(dropdownId);
              
              return (
                <div key={category.id}>
                  <button 
                    onClick={() => toggleDropdown(dropdownId)}
                    className="w-full flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-slate-800' : category.bgColor} ${category.color}`}>
                        <category.icon size={16} />
                      </div>
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{category.label}</h3>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className={`${darkMode ? 'text-slate-500' : 'text-slate-500'} transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="pl-4 pt-1 space-y-1">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={getLinkClass(item.id)}
                        >
                          <item.icon size={14} className="opacity-70 flex-shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

           {/* Sidebar Footer (Upgrade Card) */}
           <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="rounded-xl p-4 relative overflow-hidden shadow-lg bg-[#171717] text-white">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-1 rounded bg-white/10">
                      <Sparkles size={12} className="text-yellow-400" />
                   </div>
                   <h4 className="font-bold text-sm text-white">Upgrade to Pro</h4>
                </div>
                <p className="text-[10px] mb-3 leading-tight text-slate-400">
                  Unlock AI resume analysis, unlimited job tracking, and more.
                </p>
                <button className="w-full py-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-orange-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-1">
                  Get Pro Access <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area & Header --- */}
      <div className="flex-1 flex flex-col md:pl-64 h-screen transition-all duration-300 relative">
        
        {/* Top Navigation Header */}
        <header 
          className={`h-16 flex items-center justify-between px-6 z-30 sticky top-0 border-b ${darkMode ? 'bg-neutral-900 border-white/5' : 'bg-[#f0f0f0] border-slate-200'}`}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-500 hover:text-neutral-900">
              <Menu size={24} />
            </button>
            
            {/* Toggle Button for Overview/Workflows */}
            {headerAction && (
              <div>
                {headerAction}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Command Palette Trigger (Static) */}
            <div 
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm'}`}
            >
                <Search size={14} />
                <span className="opacity-70">Search...</span>
                <span className={`text-[10px] ml-4 font-bold px-1.5 py-0.5 rounded border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>⌘K</span>
            </div>

            <div className={`h-8 w-px hidden md:block ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

            <CreditCounter current={MOCK_USER.credits.current} max={MOCK_USER.credits.max} darkMode={darkMode} />

            <UserAvatarMenu darkMode={darkMode} setDarkMode={setDarkMode} />

          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <DashboardContext.Provider value={{ darkMode, setActiveTab, currentView: currentView ?? 'overview', setCurrentView: setCurrentView ?? (() => {}) }}>
              {children}
            </DashboardContext.Provider>
          </div>
        </main>
        
      </div>
    </div>
  );
}

