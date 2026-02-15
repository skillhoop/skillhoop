import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Search, 
  MessageSquare, 
  BarChart3, 
  PenTool, 
  Globe, 
  Crosshair, 
  BookOpen, 
  Timer, 
  ChevronDown, 
  Sparkles,
  Calendar,
  History,
  Trophy,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import SkillHoopLogo from '@/components/ui/SkillHoopLogo';

/** True when the given item id matches the current route (e.g. resume matches /dashboard/resume). */
function isActiveRoute(pathname: string, itemId: string): boolean {
  const base = '/dashboard/';
  const segment = pathname.startsWith(base) ? pathname.slice(base.length).replace(/\/.*$/, '') : '';
  return segment === itemId;
}

const SkillHoopSidebar = ({ 
  collapsed = false,
  onToggleCollapse,
  dragMode = false,
}: { 
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  dragMode?: boolean;
}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const sidebarStructure = [
    {
      category: "Dashboard",
      items: []
    },
    {
      category: "Career Hub",
      items: [
        { id: 'resume', label: 'Smart Resume Studio', icon: FileText, description: "Create and optimize your professional resume with AI." },
        { id: 'cover-letter', label: 'Cover Letter Generator', icon: PenTool, description: "Generate compelling, tailored cover letters with AI." },
        { id: 'tailor', label: 'Application Tailor', icon: Crosshair, description: "Tailor each application to match the specific role." },
        { id: 'finder', label: 'Job Finder', icon: Search, description: "Discover opportunities matching your profile." },
        { id: 'tracker', label: 'Job Tracker', icon: Briefcase, description: "Manage and track your job applications." },
        { id: 'prep', label: 'Interview Prep Kit', icon: MessageSquare, description: "Practice for interviews with AI feedback and guidance." },
        { id: 'history', label: 'Work History Manager', icon: History, description: "Organize and manage your complete work history." },
      ]
    },
    {
      category: "Brand Building",
      items: [
        { id: 'audit', label: 'AI Personal Brand Audit', icon: BarChart3, description: "Analyze and improve your personal brand with AI insights." },
        { id: 'content', label: 'Content Engine', icon: PenTool, description: "Create engaging professional content." },
        { id: 'portfolio', label: 'AI Career Portfolio', icon: Globe, description: "Showcase your work and achievements with an AI-assisted portfolio." },
        { id: 'events', label: 'Career Event Scout', icon: Calendar, description: "Find events and opportunities to grow your career network." },
      ]
    },
    {
      category: "Upskilling",
      items: [
        { id: 'radar', label: 'Skill Radar', icon: Crosshair, description: "Visualize your skill strengths and gaps." },
        { id: 'learning', label: 'Learning Path', icon: BookOpen, description: "Your personalized curriculum for growth." },
        { id: 'sprints', label: 'Sprints', icon: Timer, description: "Focused learning missions to level up fast." },
        { id: 'certifications', label: 'Certifications', icon: Trophy, description: "Track and manage your professional certifications." },
        { id: 'benchmarking', label: 'Skill Benchmarking', icon: BarChart3, description: "Compare your skills against market and role benchmarks." },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-white border-r border-slate-200 fixed h-full z-30 flex flex-col overflow-y-auto custom-scrollbar font-sans transition-[width] duration-200 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Header / Logo */}
      <div className={`sticky top-0 bg-white z-10 flex ${collapsed ? 'p-3 flex-col items-center gap-2' : 'items-center p-6'}`}>
        <NavLink 
          to="/dashboard"
          className={`flex items-center overflow-hidden ${collapsed ? 'justify-center w-8' : ''}`}
        >
          <SkillHoopLogo 
            width={collapsed ? 32 : 140} 
            height={collapsed ? 32 : 32} 
            className={collapsed ? 'h-8 w-8' : 'h-8'} 
            iconOnly={collapsed}
          />
        </NavLink>
        {collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className={`pb-4 ${collapsed ? 'px-0 space-y-1 flex flex-col items-center' : 'px-4 space-y-6'}`}>
        {collapsed ? (
          /* Collapsed: only icons — Dashboard first, then all menu items in order */
          <>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `p-2.5 rounded-xl transition-colors block ${isActive ? 'bg-neutral-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
              title="Dashboard"
            >
              <BarChart3 size={18} />
            </NavLink>
            {sidebarStructure.filter(s => s.category !== 'Dashboard').flatMap(section => section.items).map((item) => (
              <NavLink
                key={item.id}
                to={`/dashboard/${item.id}`}
                draggable={dragMode}
                onDragStart={dragMode ? (e) => { e.dataTransfer.setData('text/plain', item.id); e.dataTransfer.effectAllowed = 'copy'; } : undefined}
                className={({ isActive }) => `p-2.5 rounded-xl transition-colors block ${isActive ? 'bg-neutral-900 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'} ${dragMode ? 'cursor-grab active:cursor-grabbing hover:border hover:border-dashed hover:border-slate-400 dark:hover:border-slate-500' : ''}`}
                title={item.label}
              >
                <item.icon size={18} />
              </NavLink>
            ))}
          </>
        ) : (
          sidebarStructure.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.category === "Dashboard" ? (
                <div className="mb-2 flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) => `flex-1 cursor-pointer transition-colors ${isActive ? 'text-neutral-900' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {section.category}
                  </NavLink>
                  {onToggleCollapse && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
                      title="Collapse sidebar"
                    >
                      <PanelLeftClose size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div 
                    className="px-2 mb-2 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={() => toggleCategory(section.category)}
                  >
                    {section.category}
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${collapsedCategories[section.category] ? '-rotate-90' : ''}`}
                    />
                  </div>
                  <div className={`space-y-1 ${collapsedCategories[section.category] ? 'hidden' : 'block'}`}>
                    {section.items.map((item) => {
                      const active = isActiveRoute(pathname, item.id);
                      return (
                        <NavLink
                          key={item.id}
                          to={`/dashboard/${item.id}`}
                          draggable={dragMode}
                          onDragStart={dragMode ? (e) => { e.dataTransfer.setData('text/plain', item.id); e.dataTransfer.effectAllowed = 'copy'; } : undefined}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                            active
                              ? 'bg-neutral-900 text-white shadow-md'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-neutral-900'
                          } ${dragMode ? 'cursor-grab active:cursor-grabbing hover:border hover:border-dashed hover:border-slate-400 dark:hover:border-slate-500' : ''}`}
                        >
                          <item.icon size={18} className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                          {item.label}
                        </NavLink>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer / Pro Plan Card */}
      {!collapsed && (
      <div className="mt-auto p-4 border-t border-slate-100">
         <div className="bg-neutral-900 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg w-full">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Sparkles size={14} className="text-white"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Pro Plan</h4>
                        <p className="text-[10px] text-slate-300">Unlimited AI Generation</p>
                    </div>
                </div>
                
                <div className="w-full bg-white/20 h-1.5 rounded-full mb-2 overflow-hidden">
                   <div className="w-3/4 bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                </div>
                <div className="text-xs text-slate-300 flex justify-between mb-4">
                    <span>Credits</span>
                    <span className="font-bold text-white">75/100</span>
                </div>

                <button className="w-full py-2 bg-white text-neutral-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors">
                    View Plans
                </button>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl opacity-20 -mr-10 -mt-10"></div>
         </div>
      </div>
      )}
    </aside>
  );
};

export default SkillHoopSidebar;
