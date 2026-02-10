import React from 'react';
import {
  Layout,
  Briefcase,
  FileText,
  Search,
  MessageSquare,
  BarChart3,
  Globe,
  Crosshair,
  BookOpen,
  Timer,
  PenTool,
  Calendar,
  Trophy,
  X,
  Plus,
} from 'lucide-react';

// --- Types & Constants ---

export type Shortcut = {
  id: string;
  label: string;
  icon: React.ElementType;
};

// Tools for shortcuts — ids must match DashboardShell activeView values
const SHORTCUT_TOOLS: Shortcut[] = [
  { id: 'resume', label: 'Resume Studio', icon: FileText },
  { id: 'cover-letter', label: 'Cover Letter', icon: FileText },
  { id: 'tailor', label: 'App Tailor', icon: Crosshair },
  { id: 'finder', label: 'Job Finder', icon: Search },
  { id: 'tracker', label: 'Job Tracker', icon: Briefcase },
  { id: 'prep', label: 'Interview Prep', icon: MessageSquare },
  { id: 'history', label: 'Work History', icon: BarChart3 },
  { id: 'audit', label: 'Brand Audit', icon: BarChart3 },
  { id: 'content', label: 'Content Engine', icon: PenTool },
  { id: 'portfolio', label: 'Portfolio', icon: Globe },
  { id: 'events', label: 'Event Scout', icon: Calendar },
  { id: 'radar', label: 'Skill Radar', icon: Crosshair },
  { id: 'learning', label: 'Learning Path', icon: BookOpen },
  { id: 'sprints', label: 'Sprints', icon: Timer },
  { id: 'certifications', label: 'Certifications', icon: Trophy },
  { id: 'benchmarking', label: 'Benchmarking', icon: BarChart3 },
];

export function findToolById(id: string): Shortcut | undefined {
  return SHORTCUT_TOOLS.find((t) => t.id === id);
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  findToolById('resume')!,
  findToolById('finder')!,
  findToolById('audit')!,
].filter(Boolean);

const MAX_SHORTCUTS = 5;

// --- ShortcutsBar Component ---

export const ShortcutsBar = ({
  shortcuts,
  isCustomizing,
  onRemove,
  onDrop,
  onNavigate,
}: {
  shortcuts: Shortcut[];
  isCustomizing: boolean;
  onRemove: (id: string) => void;
  onDrop: (toolId: string) => void;
  onNavigate: (id: string) => void;
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isCustomizing) {
      const el = e.currentTarget;
      el.classList.add('bg-slate-50/50', 'border-slate-400', 'dark:bg-slate-700/50', 'dark:border-slate-500');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const el = e.currentTarget;
    el.classList.remove('bg-slate-50/50', 'border-slate-400', 'dark:bg-slate-700/50', 'dark:border-slate-500');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const el = e.currentTarget;
    el.classList.remove('bg-slate-50/50', 'border-slate-400', 'dark:bg-slate-700/50', 'dark:border-slate-500');
    if (!isCustomizing) return;
    const toolId = e.dataTransfer.getData('text/plain');
    if (toolId) onDrop(toolId);
  };

  return (
    <div className="flex items-center gap-4 relative">
      <div
        id="shortcuts-container"
        className={`relative flex items-center gap-2 flex-row-reverse justify-start transition-all duration-300 ${
          isCustomizing
            ? 'rounded-full min-w-[200px] min-h-[64px] py-3 pl-5 pr-5'
            : 'w-auto'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isCustomizing && shortcuts.length === 0 && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 pointer-events-none whitespace-nowrap">
            Drag tools here
          </span>
        )}

        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            onClick={() => !isCustomizing && onNavigate(shortcut.id)}
            className={`shortcut-item relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 flex-shrink-0 ${
              isCustomizing ? 'animate-pulse cursor-grab' : ''
            }`}
            title={shortcut.label}
          >
            <shortcut.icon size={18} className="shrink-0" />
            {isCustomizing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(shortcut.id);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] hover:bg-red-600 border-2 border-white dark:border-slate-800 z-10"
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}

        {isCustomizing && shortcuts.length < MAX_SHORTCUTS && (
          <div className="shortcut-placeholder w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 flex-shrink-0">
            <Plus size={18} />
          </div>
        )}
      </div>
    </div>
  );
};

