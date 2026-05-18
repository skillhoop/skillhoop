import React, { useState, useEffect, useRef, createContext, useContext, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useResume } from '../../context/ResumeContext';
import type { ResumeData, SmartStudioFormatting } from '../../types/resume';
import {
  mergeImportedResume,
  overwriteWithImportedResume,
  parseResumeImportFile,
} from '../../lib/smartResumeStudioImport';
import { generateSectionItemId } from '../../lib/sectionItemHelpers';
import ReviewSection from './ReviewSection';
import CopilotSidebar from './CopilotSidebar';
import {
  buildSmartResumeStudioView,
  mergeSmartStudioFormatting,
  DEFAULT_SMART_STUDIO_FORMATTING,
  ensureStudioResumeSection,
  legacyPatchToSectionItemData,
  educationYearsToDate,
  newLegacyItemToSectionItem,
  isStudioChromeOnlySection,
  type SmartResumeStudioViewData,
  type StudioLegacyListItem,
} from '../../lib/smartResumeStudioState';
import { 
  Layout, 
  FileText, 
  Palette, 
  Bot, 
  CheckSquare, 
  Folder, 
  Download, 
  PanelLeft, 
  Eye, 
  EyeOff, 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  User, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Award, 
  Globe, 
  Heart, 
  Trophy, 
  Quote, 
  Coffee, 
  Wand2, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Loader2, 
  XCircle, 
  RefreshCw, 
  MousePointerClick, 
  Share2, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Type, 
  LayoutTemplate, 
  Sparkles, 
  ArrowUp,
  Upload,
  Save,
  Zap,
  Check,
  Copy,
  AlertTriangle,
  Activity,
  Wand,
  Target,
  Languages,
  FileSearch,
  Eraser,
  Cpu,
  BrainCircuit,
  Maximize2,
  Minimize2,
  Columns,
  AlignJustify,
  Sidebar,
  PaintBucket,
  AlignLeft,
  Grid,
  MoveVertical,
  CaseUpper,
  List,
  Pilcrow,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  Info,
  BookOpen,
  Lightbulb,
  Mic,
  Users,
  BadgeCheck,
  Brain,
  Bike,
  PenTool,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  X,
  ExternalLink,
  Image as ImageIcon // Added for Photo category icon if needed
} from 'lucide-react';

// --- Utility Functions ---
const cn = (...classes) => classes.filter(Boolean).join(" ");


// --- Helper Components ---

const NavTab = ({ icon, label, active, onClick, bgClass }) => (
  <button
    onClick={onClick}
    className={`group h-full px-3 flex items-center justify-center border-b-2 transition-all text-sm font-medium
      ${active 
        ? 'border-neutral-900 text-neutral-900 bg-slate-50' 
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-sm ${bgClass || 'bg-slate-100'}`}>
      {icon}
    </div>
    <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap">
      {label}
    </span>
  </button>
);

const SectionCard = ({ label, icon, isVisible, isExpanded, onToggleExpand, onToggleVisibility, onOpenModal, isComplete, children }) => (
  <div className={`bg-white border rounded-lg transition-all duration-200 ${isExpanded ? 'ring-1 ring-neutral-900 border-neutral-900 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
    <div className="flex items-center p-3">
      {/* Drag Handle */}
      <div className="cursor-move text-slate-300 hover:text-slate-500 mr-2">
        <GripVertical size={16} />
      </div>

      {/* Title with Icon */}
      <div 
        className="flex-1 flex items-center font-bold text-slate-700 text-sm cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        {icon && <span className="mr-2 text-slate-400">{icon}</span>}
        <span className="mr-2">{label}</span>
        {isComplete && (
           <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center animate-fade-in">
              <Check size={10} className="text-emerald-600" strokeWidth={3} />
           </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
         {/* NEW: Open Modal Button */}
         <button 
          onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
          className="p-1.5 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          title="Open in popup editor"
        >
          <ExternalLink size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          title="Remove section"
        >
          <Trash2 size={16} />
        </button>
        <button 
          onClick={onToggleExpand}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>

    {/* Expanded Content (Form) */}
    {isExpanded && (
      <div className="px-4 pb-4 animate-fade-in-up">
        <div className="border-t border-slate-100 pt-3">
          {children}
        </div>
      </div>
    )}
  </div>
);

const AddSectionButton = ({ label, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md hover:bg-slate-50/30 transition-all group"
  >
    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
        {icon}
    </div>
    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide group-hover:text-slate-900">{label}</span>
    <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium flex items-center gap-1">
        <Plus size={10} /> Add
    </span>
  </button>
);

const SkillTag = ({ label }) => (
  <div className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-sm text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition-colors cursor-default">
    {label}
  </div>
);

const FloatingLabelInput = ({ label, value, onChange, placeholder, className, type = "text" }) => (
    <div className={`relative group ${className}`}>
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            className="peer w-full px-3 pt-5 pb-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all placeholder-transparent" 
            placeholder={placeholder}
        />
        <label className="absolute left-3 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-slate-400 peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-neutral-900 pointer-events-none">
            {label}
        </label>
    </div>
);

// --- New Component: Visual Template Mockup ---
const TemplateThumbnail = ({ id }) => {
  // Helper for text lines
  const Lines = ({ count = 3, w = "w-full", color="bg-slate-200", className = "" }) => (
    <div className={`space-y-1 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`h-1 rounded-full ${color} ${w} ${i === count-1 ? 'w-2/3' : ''}`} />
      ))}
    </div>
  );

  switch(id) {
    case 'Modern': // Sidebar Left
      return (
         <div className="flex h-full w-full bg-white shadow-sm overflow-hidden border border-slate-100">
            <div className="w-[30%] h-full bg-slate-800 p-1.5 flex flex-col gap-1.5 pt-3">
               <div className="w-6 h-6 rounded-full bg-white/20 mx-auto mb-1"></div>
               <div className="w-full h-1 bg-white/20 rounded-full"></div>
               <div className="w-2/3 h-1 bg-white/10 rounded-full mx-auto"></div>
               <div className="mt-2 space-y-1 opacity-50">
                  <div className="w-full h-0.5 bg-white"></div>
                  <div className="w-full h-0.5 bg-white"></div>
               </div>
            </div>
            <div className="flex-1 p-2 space-y-2">
               <div className="w-1/3 h-2 bg-slate-200 rounded-full mb-2"></div>
               <Lines count={4} />
               <div className="w-1/4 h-1.5 bg-slate-200 rounded-full mt-2"></div>
               <Lines count={3} />
            </div>
         </div>
      );
    case 'Classic': // Top Down
      return (
          <div className="h-full w-full bg-white p-2 flex flex-col gap-2 shadow-sm border border-slate-100">
              <div className="flex flex-col items-center border-b border-slate-100 pb-2">
                  <div className="w-24 h-2 bg-slate-800 rounded-full mb-1"></div>
                  <div className="w-16 h-1 bg-slate-400 rounded-full"></div>
              </div>
              <div className="space-y-2 px-1">
                  <div className="flex gap-2 mb-1">
                      <div className="flex-1 h-1 bg-slate-100"></div>
                      <div className="flex-1 h-1 bg-slate-100"></div>
                  </div>
                  <Lines count={2} />
                  <Lines count={3} />
                  <Lines count={2} />
              </div>
          </div>
      );
    case 'Technical': // Sidebar Right, Dense
       return (
          <div className="flex h-full w-full bg-white shadow-sm overflow-hidden border border-slate-100">
              <div className="flex-1 p-2 space-y-1.5">
                  <div className="w-20 h-2 bg-slate-800 rounded-full mb-1"></div>
                  <Lines count={5} w="w-full" />
                  <Lines count={4} w="w-full" />
              </div>
              <div className="w-[25%] h-full bg-slate-100 border-l border-slate-200 p-1.5 flex flex-col gap-1">
                  <div className="w-full h-1.5 bg-slate-300 rounded-full mb-1"></div>
                  <Lines count={6} color="bg-slate-300" />
              </div>
          </div>
       );
    case 'Minimal': // Clean, whitespace
       return (
           <div className="h-full w-full bg-white p-3 flex flex-col gap-3 shadow-sm border border-slate-100">
              <div className="flex justify-between items-end">
                  <div className="w-16 h-4 bg-slate-900 rounded-sm"></div>
              </div>
              <div className="space-y-3">
                  <Lines count={2} />
                  <div className="w-10 h-1 bg-slate-900 rounded-full"></div>
                  <Lines count={3} />
              </div>
           </div>
       );
     case 'Creative': // Sidebar Left, Accent Header
       return (
           <div className="flex h-full w-full bg-white shadow-sm overflow-hidden border border-slate-100">
               <div className="w-[30%] h-full bg-slate-600 p-1.5 flex flex-col items-center gap-1 pt-3">
                   <div className="w-8 h-8 rounded-full border-2 border-white/30 bg-white/10 mb-1"></div>
                   <div className="w-3/4 h-1 bg-white/40 rounded-full"></div>
               </div>
               <div className="flex-1 p-2 flex flex-col gap-2">
                   <div className="w-full h-8 bg-slate-50 rounded-lg mb-1"></div>
                   <Lines count={3} />
                   <Lines count={3} />
               </div>
           </div>
       );
     case 'Executive': // Sidebar Right, Heavy Header
        return (
            <div className="h-full w-full bg-white flex flex-col shadow-sm border border-slate-100 overflow-hidden">
                <div className="h-10 w-full bg-slate-800 flex items-center px-3 gap-2">
                    <div className="w-6 h-6 rounded bg-white/20"></div>
                    <div className="flex-1">
                        <div className="w-16 h-1.5 bg-white/80 rounded-full mb-1"></div>
                        <div className="w-10 h-1 bg-white/40 rounded-full"></div>
                    </div>
                </div>
                <div className="flex flex-1">
                     <div className="flex-1 p-2 space-y-2">
                         <Lines count={3} />
                         <Lines count={3} />
                     </div>
                     <div className="w-[25%] bg-slate-50 border-l border-slate-100 p-1.5">
                         <Lines count={5} color="bg-slate-300" />
                     </div>
                </div>
            </div>
        );
    default: return null;
  }
};

type SmartStudioTemplateMeta = {
  id: string;
  label: string;
  desc: string;
  category: string;
  tags: string[];
  layout: string;
};

type ResumePageBlock =
  | { type: 'section-title'; content: string }
  | { type: 'summary'; content: string }
  | { type: 'item'; section: string; data: StudioLegacyListItem };

type ResumePageState = {
  id: number;
  rightColumn: ResumePageBlock[];
  currentHeight: number;
};

// --- Main Smart Resume Studio Component ---

const SmartResumeStudio = () => {
  const [activeTab, setActiveTab] = useState('Sections'); 
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeSectionModal, setActiveSectionModal] = useState<string | null>(null); // New state for popup editor
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('Modern');
  const [previewingTemplate, setPreviewingTemplate] = useState<SmartStudioTemplateMeta | null>(null); 
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fontScrollRef = useRef<HTMLDivElement | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement | null>(null); // Added ref for category scrolling
  const [activeTemplateCategory, setActiveTemplateCategory] = useState('All'); // New state for template filtering

  const { state, dispatch, undo, redo, canUndo, canRedo, isSaving, saveError } = useResume();
  const resumeData: SmartResumeStudioViewData = useMemo(() => buildSmartResumeStudioView(state), [state]);
  const formatting = useMemo(() => mergeSmartStudioFormatting(state.settings), [state.settings]);

  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [isImportParsing, setIsImportParsing] = useState(false);
  const [pendingImportResume, setPendingImportResume] = useState<ResumeData | null>(null);
  const [showImportStrategyModal, setShowImportStrategyModal] = useState(false);
  const [isDragOverImport, setIsDragOverImport] = useState(false);

  const resetImportFlow = useCallback(() => {
    setPendingImportResume(null);
    setShowImportStrategyModal(false);
    setIsImportParsing(false);
    setIsDragOverImport(false);
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
  }, []);

  const processImportFile = useCallback(async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isJson =
      file.type === 'application/json' || lowerName.endsWith('.json');
    const isPdf = file.type.includes('pdf') || lowerName.endsWith('.pdf');

    if (!isJson && !isPdf) {
      toast.error('Please upload a PDF or JSON resume file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB.');
      return;
    }

    setIsImportParsing(true);
    try {
      const imported = await parseResumeImportFile(file);
      setPendingImportResume(imported);
      setShowImportStrategyModal(true);
    } catch (err) {
      console.error('Resume import failed:', err);
      const message = err instanceof Error ? err.message : '';
      if (message === 'JSON_PARSE') {
        toast.error('Unable to parse file template structure.');
      } else if (message === 'UNSUPPORTED_TYPE') {
        toast.error('Please upload a PDF or JSON resume file.');
      } else if (message === 'FILE_TOO_LARGE') {
        toast.error('File must be under 10MB.');
      } else if (message === 'INVALID_IMPORT') {
        toast.error('Unable to parse file template structure.');
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to import resume file.');
      }
    } finally {
      setIsImportParsing(false);
      if (importFileInputRef.current) {
        importFileInputRef.current.value = '';
      }
    }
  }, []);

  const handleImportFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void processImportFile(file);
    },
    [processImportFile],
  );

  const handleImportDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOverImport(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void processImportFile(file);
    },
    [processImportFile],
  );

  const handleImportOverwrite = useCallback(() => {
    if (!pendingImportResume) return;
    dispatch({
      type: 'SET_RESUME',
      payload: overwriteWithImportedResume(state, pendingImportResume),
    });
    resetImportFlow();
    toast.success('Resume data successfully ingested!');
  }, [dispatch, pendingImportResume, resetImportFlow, state]);

  const handleImportMerge = useCallback(() => {
    if (!pendingImportResume) return;
    dispatch({
      type: 'SET_RESUME',
      payload: mergeImportedResume(state, pendingImportResume),
    });
    resetImportFlow();
    toast.success('Resume data successfully ingested!');
  }, [dispatch, pendingImportResume, resetImportFlow, state]);

  const patchStudioFormatting = useCallback((partial: Partial<SmartStudioFormatting>) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        studioFormatting: { ...(state.settings.studioFormatting ?? {}), ...partial },
      },
    });
  }, [dispatch, state.settings.studioFormatting]);

  // Template Data with Categories
  const templateCategories = ['All', 'Modern', 'Classic', 'Photo', 'Minimal', 'Professional'];
  
  const allTemplates: SmartStudioTemplateMeta[] = [
    { id: 'Modern', label: 'Modern', desc: 'Split layout with sidebar', category: 'Modern', tags: ['Popular', 'ATS'], layout: 'sidebar-left' },
    { id: 'Classic', label: 'Classic', desc: 'Traditional top-down flow', category: 'Classic', tags: ['Formal'], layout: 'top-down' },
    { id: 'Technical', label: 'Technical', desc: 'Dense, skill-focused', category: 'Professional', tags: ['Dev'], layout: 'sidebar-right' },
    { id: 'Minimal', label: 'Minimal', desc: 'Clean typography only', category: 'Minimal', tags: ['Clean'], layout: 'minimal' },
    { id: 'Creative', label: 'Creative', desc: 'Bold headers & colors', category: 'Photo', tags: ['Design'], layout: 'creative' },
    { id: 'Executive', label: 'Executive', desc: 'High-level summary focus', category: 'Professional', tags: ['Senior'], layout: 'executive' },
  ];

  const filteredTemplates = activeTemplateCategory === 'All' 
    ? allTemplates 
    : allTemplates.filter(t => t.category === activeTemplateCategory);


  // Helper to determine layout classes based on selected template
  const getLayoutClasses = () => {
    // Map template IDs to layout structures
    const layouts = {
        'Modern': 'flex-row', // Sidebar Left
        'Classic': 'flex-col', // Top-down
        'Technical': 'flex-row-reverse', // Sidebar Right
        'Minimal': 'flex-col', // Top-down simple
        'Creative': 'flex-row', // Sidebar Left
        'Executive': 'flex-row-reverse', // Sidebar Right
    };
    
    const layout = layouts[selectedTemplate as keyof typeof layouts] || 'flex-row';
    
    return {
        container: `flex ${layout}`,
        sidebarWidth: layout.includes('col') ? 'w-full h-auto min-h-[200px]' : 'w-[35%]',
        mainWidth: layout.includes('col') ? 'w-full' : 'w-[65%]',
        sidebarBorder: layout === 'flex-col' ? 'border-b' : layout === 'flex-row-reverse' ? 'border-l' : 'border-r',
        footer: layout.includes('col') ? 'hidden' : 'flex' // Hide footer splitter in column mode
    };
  };

  const layoutStyles = getLayoutClasses();

  const scrollFonts = (direction) => {
    if (fontScrollRef.current) {
      const scrollAmount = 200;
      fontScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 150;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleFullScreen = () => {
    if (!isFullscreen) {
      // Attempt Native Fullscreen first
      if (previewRef.current && previewRef.current.requestFullscreen) {
        previewRef.current.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch((err) => {
            console.warn("Native fullscreen failed, falling back to CSS fullscreen", err);
            // Fallback to CSS fullscreen
            setIsFullscreen(true);
          });
      } else {
        // Fallback for browsers without API support
        setIsFullscreen(true);
      }
    } else {
      // Exit Fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      // Sync state if user exits via Esc key in native mode
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e) => {
        // Handle Esc key for CSS fallback mode
        if (e.key === 'Escape' && isFullscreen) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(console.error);
            }
            setIsFullscreen(false);
        }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const [isStrengthExpanded, setIsStrengthExpanded] = useState(false);

  const handleInputChange = (section, field, value) => {
    if (section === 'personalInfo') {
      dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [field]: value } });
    }
  };

  const handleSectionLabelChange = (section, value) => {
    if (section === 'custom') {
      ensureStudioResumeSection(dispatch, state, 'custom');
      dispatch({ type: 'UPDATE_SECTION', payload: { id: 'custom', updates: { title: value } } });
      return;
    }
    const meta = { ...(state.settings.smartStudioSectionMeta ?? {}) };
    const cur = meta[section] ?? {
      visible: resumeData.sections[section]?.visible ?? true,
      label: String(resumeData.sections[section]?.label ?? section),
    };
    meta[section] = { ...cur, label: value };
    dispatch({ type: 'UPDATE_SETTINGS', payload: { smartStudioSectionMeta: meta } });
  };

  const getThemeColorClass = (type: 'text' | 'bg' | 'border' | 'ring' | 'bgSoft' | 'textDark' | 'sidebar') => {
    const colors = {
      blue: { text: 'text-blue-600', bg: 'bg-blue-600', border: 'border-blue-600', ring: 'ring-blue-600', bgSoft: 'bg-blue-50', textDark: 'text-blue-900', sidebar: 'bg-blue-600' },
      purple: { text: 'text-purple-600', bg: 'bg-purple-600', border: 'border-purple-600', ring: 'ring-purple-600', bgSoft: 'bg-purple-50', textDark: 'text-purple-900', sidebar: 'bg-purple-600' },
      green: { text: 'text-emerald-600', bg: 'bg-emerald-600', border: 'border-emerald-600', ring: 'ring-emerald-600', bgSoft: 'bg-emerald-50', textDark: 'text-emerald-900', sidebar: 'bg-emerald-600' },
      red: { text: 'text-rose-600', bg: 'bg-rose-600', border: 'border-rose-600', ring: 'ring-rose-600', bgSoft: 'bg-rose-50', textDark: 'text-rose-900', sidebar: 'bg-rose-600' },
      orange: { text: 'text-orange-600', bg: 'bg-orange-600', border: 'border-orange-600', ring: 'ring-orange-600', bgSoft: 'bg-orange-50', textDark: 'text-orange-900', sidebar: 'bg-orange-600' },
      slate: { text: 'text-slate-800', bg: 'bg-slate-800', border: 'border-slate-800', ring: 'ring-slate-800', bgSoft: 'bg-slate-50', textDark: 'text-slate-900', sidebar: 'bg-slate-900' },
    } as const;
    const key = formatting.themeColor as keyof typeof colors;
    const palette = colors[key] ?? colors.slate;
    return palette[type];
  };

  const getSidebarClass = () => {
      if (formatting.sidebarStyle === 'light') return 'bg-slate-50 text-slate-900 border-r border-slate-200';
      if (formatting.sidebarStyle === 'colored') return `${getThemeColorClass('sidebar')} text-white`;
      return 'bg-slate-900 text-white'; // Default Dark
  };

  const getSidebarTextClass = (baseClass) => {
      if (formatting.sidebarStyle === 'light') return baseClass.replace('text-slate-300', 'text-slate-500').replace('text-slate-400', 'text-slate-600').replace('text-white', 'text-slate-900');
      return baseClass; // Dark/Colored usually work with white/slate-300
  };

  const getFontClass = () => {
    const fonts = {
      sans: 'font-sans',
      serif: 'font-serif',
      mono: 'font-mono',
      geometric: 'font-sans tracking-wide',
      slab: 'font-serif font-medium',
      clean: 'font-sans font-light'
    };
    return fonts[formatting.fontFamily as keyof typeof fonts] || 'font-sans';
  };

  const getSpacingClass = () => {
    const spacings = {
      compact: 'gap-3 mb-4',
      comfortable: 'gap-5 mb-7',
      spacious: 'gap-8 mb-10'
    };
    return spacings[formatting.layoutDensity];
  };

  const getLayoutSpacing = () => {
    switch (formatting.layoutDensity) {
      case 'compact':
        return { 
          sectionMt: 'mt-4', 
          sectionMb: 'mb-2', 
          itemMb: 'mb-3', 
          listSpace: 'space-y-0.5',
          summaryMb: 'mb-3'
        };
      case 'spacious':
        return { 
          sectionMt: 'mt-8', 
          sectionMb: 'mb-6', 
          itemMb: 'mb-8', 
          listSpace: 'space-y-3',
          summaryMb: 'mb-8'
        };
      default: // comfortable
        return { 
          sectionMt: 'mt-6', 
          sectionMb: 'mb-4', 
          itemMb: 'mb-6', 
          listSpace: 'space-y-1.5',
          summaryMb: 'mb-6'
        };
    }
  };

  const getMarginClass = (side) => {
    const margins = {
      narrow: side === 'left' ? 'p-6' : 'p-6',
      normal: side === 'left' ? 'p-8' : 'p-10',
      wide: side === 'left' ? 'p-10' : 'p-14',
    };
    return margins[formatting.pageMargins] || margins.normal;
  };

  const getLineHeightClass = () => {
    const heights = {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed'
    };
    return heights[formatting.lineHeight] || 'leading-relaxed';
  };

  const getTextAlignClass = () => {
    switch (formatting.textAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      default: return 'text-left';
    }
  };

  const getListStyleClass = () => {
    const styles = {
      disc: 'list-disc',
      circle: 'list-circle', // Tailwind might need utility, defaulting to custom
      square: 'list-[square]'
    };
    return styles[formatting.bulletStyle] || 'list-disc';
  };

  const toggleSectionVisibility = (sectionKey) => {
    if (isStudioChromeOnlySection(sectionKey)) {
      const meta = { ...(state.settings.smartStudioSectionMeta ?? {}) };
      const cur = meta[sectionKey] ?? {
        visible: resumeData.sections[sectionKey]?.visible ?? true,
        label: String(resumeData.sections[sectionKey]?.label ?? sectionKey),
      };
      meta[sectionKey] = { ...cur, visible: !cur.visible };
      dispatch({ type: 'UPDATE_SETTINGS', payload: { smartStudioSectionMeta: meta } });
      return;
    }

    const row = state.sections.find((s) => s.id === sectionKey);
    if (row) {
      dispatch({
        type: 'UPDATE_SECTION',
        payload: { id: sectionKey, updates: { isVisible: !row.isVisible } },
      });
      return;
    }

    const meta = { ...(state.settings.smartStudioSectionMeta ?? {}) };
    const cur = meta[sectionKey] ?? {
      visible: false,
      label: String(resumeData.sections[sectionKey]?.label ?? sectionKey),
    };
    const nextVis = !cur.visible;
    meta[sectionKey] = { ...cur, visible: nextVis };
    dispatch({ type: 'UPDATE_SETTINGS', payload: { smartStudioSectionMeta: meta } });
    if (nextVis) {
      ensureStudioResumeSection(dispatch, state, sectionKey);
    }
  };

  const removeItem = (section, index) => {
    const row = state.sections.find((s) => s.id === section);
    const item = row?.items[index];
    if (!item) return;
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { sectionId: section, itemId: item.id } });
  };

  const handleSimpleChange = (field, value) => {
    if (field === 'summary') {
      dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { summary: value } });
      return;
    }
    if (field === 'hobbies') {
      dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { hobbies: value } });
    }
  };

  const handleArrayChange = (section, index, field, value) => {
    const row = state.sections.find((s) => s.id === section);
    const item = row?.items[index];
    if (!item) return;

    if (section === 'education' && (field === 'startYear' || field === 'endYear')) {
      const newDate = educationYearsToDate(item, field, value);
      dispatch({
        type: 'UPDATE_SECTION_ITEM',
        payload: { sectionId: section, itemId: item.id, data: { date: newDate } },
      });
      return;
    }

    const data = legacyPatchToSectionItemData(section, field, value);
    if (Object.keys(data).length > 0) {
      dispatch({
        type: 'UPDATE_SECTION_ITEM',
        payload: { sectionId: section, itemId: item.id, data },
      });
    }
  };

  const handleDescriptionChange = (section, index, value) => {
    const row = state.sections.find((s) => s.id === section);
    const item = row?.items[index];
    if (!item) return;
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { sectionId: section, itemId: item.id, data: { description: value } },
    });
  };

  const handleSkillChange = (value) => {
    const skills = value.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
    const items = skills.map((skill) => ({
      id: generateSectionItemId('skill'),
      title: skill,
      subtitle: '',
      date: '',
      description: '',
    }));
    ensureStudioResumeSection(dispatch, state, 'skills');
    dispatch({ type: 'UPDATE_SECTION', payload: { id: 'skills', updates: { items } } });
  };

  const handleAddItem = (section) => {
    let newItem: Record<string, unknown> = {};

    switch (section) {
      case 'experience':
        newItem = { role: 'Role', company: 'Company', location: '', period: '', description: [] };
        break;
      case 'education':
        newItem = { degree: 'Degree', location: 'School', startYear: '', endYear: '' };
        break;
      case 'languages':
        newItem = { language: 'New Language', proficiency: 'Basic' };
        break;
      case 'references':
        newItem = { name: 'New Referee', role: 'Role', company: 'Company', contact: 'Contact Info' };
        break;
      case 'publications':
        newItem = { title: 'Publication Title', publisher: 'Publisher', date: 'Year' };
        break;
      case 'patents':
        newItem = { title: 'Patent Title', number: 'Patent #', date: 'Year' };
        break;
      case 'speaking':
        newItem = { event: 'Event Name', topic: 'Topic', date: 'Date' };
        break;
      case 'memberships':
        newItem = { organization: 'Organization', role: 'Role', date: 'Member Since' };
        break;
      case 'licenses':
        newItem = { name: 'License Name', issuer: 'Issuer', date: 'Date' };
        break;
      case 'training':
        newItem = { name: 'Training Course', institution: 'Institution', date: 'Year' };
        break;
      case 'extracurricular':
        newItem = { role: 'Role/Activity', organization: 'Organization', date: 'Period' };
        break;
      case 'awards':
        newItem = { title: 'Award Title', issuer: 'Issuer', date: 'Year' };
        break;
      case 'volunteer':
        newItem = { role: 'Role', organization: 'Organization', period: 'Date', description: [] };
        break;
      case 'certifications':
        newItem = { name: 'Certification', issuer: 'Issuer', date: 'Year' };
        break;
      case 'projects':
        newItem = { title: 'Project Title', link: 'Link', description: [] };
        break;
      case 'custom':
        newItem = { title: 'Item Title', subtitle: 'Detail', date: 'Date', description: [] };
        break;
      default:
        newItem = { title: 'New Item', description: [] };
    }

    ensureStudioResumeSection(dispatch, state, section);
    const item = newLegacyItemToSectionItem(section, { ...newItem, id: generateSectionItemId(section) });
    dispatch({ type: 'ADD_SECTION_ITEM', payload: { sectionId: section, item: item } });
  };

  const handleApplyAction = (actionType: string, content: string) => {
    if (actionType === 'UPDATE_SUMMARY') {
      handleSimpleChange('summary', content);
      return;
    }
    if (actionType === 'UPDATE_EXPERIENCE_DESCRIPTION') {
      const expSection = state.sections.find((s) => s.id === 'experience' || s.type === 'experience');
      const firstItem = expSection?.items?.[0];
      if (firstItem) {
        dispatch({
          type: 'UPDATE_SECTION_ITEM',
          payload: { sectionId: 'experience', itemId: firstItem.id, data: { description: content } },
        });
      }
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canUndo, canRedo, undo, redo]);

  const calculateSectionHealth = (section) => {
      switch(section) {
          case 'heading': return resumeData.personalInfo.fullName && resumeData.personalInfo.email && resumeData.personalInfo.jobTitle;
          case 'summary': return resumeData.summary.length > 20;
          case 'hobbies': return resumeData.hobbies && resumeData.hobbies.length > 10;
          case 'experience': return resumeData.experience.length > 0;
          case 'education': return resumeData.education.length > 0;
          case 'skills': return resumeData.skills.length > 0;
          case 'projects': return resumeData.projects && resumeData.projects.length > 0;
          case 'certifications': return resumeData.certifications && resumeData.certifications.length > 0;
          case 'languages': return resumeData.languages && resumeData.languages.length > 0;
          default: {
            const list = (resumeData as unknown as Record<string, unknown>)[section];
            return Array.isArray(list) && list.length > 0;
          }
      }
  };

  const calculateResumeScore = () => {
    let score = 0;
    const tasks = [];

    // Weights & Core Section Checks
    if (calculateSectionHealth('heading')) { 
        score += 20; 
    } else { 
        tasks.push({id: 'heading', text: 'Complete Personal Heading', points: 20}); 
    }

    if (calculateSectionHealth('summary')) { 
        score += 15; 
    } else { 
        tasks.push({id: 'summary', text: 'Add Professional Summary', points: 15}); 
    }

    if (calculateSectionHealth('experience')) { 
        score += 25; 
    } else { 
        tasks.push({id: 'experience', text: 'Add Work Experience', points: 25}); 
    }

    if (calculateSectionHealth('education')) { 
        score += 15; 
    } else { 
        tasks.push({id: 'education', text: 'Add Education', points: 15}); 
    }

    if (calculateSectionHealth('skills')) { 
        score += 15; 
    } else { 
        tasks.push({id: 'skills', text: 'Add Core Skills', points: 15}); 
    }

    // Bonus for optional sections (max 10 points)
    let extraCount = 0;
    const optionalSections = ['projects', 'certifications', 'languages', 'volunteer', 'awards', 'publications', 'patents', 'speaking', 'memberships', 'licenses', 'training', 'extracurricular', 'references'];
    optionalSections.forEach(sec => {
        if (calculateSectionHealth(sec)) extraCount++;
    });

    const bonus = Math.min(10, extraCount * 5);
    score += bonus;

    // Add bonus task if not maxed out
    if (bonus < 10) {
        const missingBonus = 10 - bonus;
        const sectionsNeeded = Math.ceil(missingBonus / 5);
        tasks.push({
            id: 'bonus', 
            text: `Add ${sectionsNeeded} Optional Section${sectionsNeeded > 1 ? 's' : ''} (Projects, Awards, etc.)`, 
            points: missingBonus
        });
    }

    if (score > 100) score = 100;
    
    // Dynamic Message
    let message = "";
    if (score === 100) message = "Perfect! Your resume is ready.";
    else if (score >= 80) message = "Great job! Just a few touches left.";
    else if (score >= 50) message = "Good start. Keep building!";
    else message = "Let's start filling in your details.";

    return { score, message, tasks };
  };

  const scoreData = calculateResumeScore();

  // --- Helper Function: Render Section Content ---
  // This extracts the form logic so it can be used in both the accordion AND the popup modal
  const renderSectionContent = (key: string) => {
    const listBySection = resumeData as unknown as Record<string, StudioLegacyListItem[] | undefined>;
    return (
        <div className="space-y-4 pt-2">
            {key === 'heading' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FloatingLabelInput label="Full Name" value={resumeData.personalInfo.fullName} onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)} placeholder="e.g. Jane Doe" className="col-span-2"/>
                        <FloatingLabelInput label="Job Title" value={resumeData.personalInfo.jobTitle} onChange={(e) => handleInputChange('personalInfo', 'jobTitle', e.target.value)} placeholder="e.g. Senior Product Designer" className="col-span-2"/>
                        <FloatingLabelInput label="Email" type="email" value={resumeData.personalInfo.email} onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)} placeholder="jane@example.com"/>
                        <FloatingLabelInput label="Phone" value={resumeData.personalInfo.phone} onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)} placeholder="+1 234 567 890"/>
                        <FloatingLabelInput label="City, State" value={resumeData.personalInfo.location} onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)} placeholder="San Francisco, CA" className="col-span-2"/>
                    </div>
                </div>
            )}

            {key === 'summary' && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Professional Summary</label>
                        <span className={`text-[10px] font-bold ${resumeData.summary.length > 150 ? 'text-emerald-500' : 'text-amber-500'}`}>{resumeData.summary.length} chars</span>
                    </div>
                    <textarea value={resumeData.summary} onChange={(e) => handleSimpleChange('summary', e.target.value)} className="w-full h-32 px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all placeholder:text-slate-400 resize-none leading-relaxed" placeholder="Write a short summary..."/>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <button className="shrink-0 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold hover:bg-slate-100 transition-colors flex items-center gap-1"><Wand2 size={10} /> Auto-Write</button>
                        <button className="shrink-0 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold hover:bg-slate-200 transition-colors">Shorten</button>
                    </div>
                </div>
            )}

            {key === 'hobbies' && (
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Interests & Hobbies</label>
                    <textarea value={resumeData.hobbies} onChange={(e) => handleSimpleChange('hobbies', e.target.value)} className="w-full h-24 px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all resize-none mb-3" placeholder="Photography, Hiking, Chess..."/>
                </div>
            )}

            {key === 'skills' && (
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Core Competencies</label>
                    <textarea value={resumeData.skills.join(', ')} onChange={(e) => handleSkillChange(e.target.value)} className="w-full h-24 px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all resize-none mb-3" placeholder="React, Node.js, Design Systems..."/>
                    <div className="flex flex-wrap gap-2">{resumeData.skills.map((skill, i) => skill.trim() && (<span key={i} className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-bold">{skill}</span>))}</div>
                </div>
            )}

            {/* Generic List Items (Experience, Education, Projects, etc.) */}
            {(['experience', 'education', 'projects', 'certifications', 'languages', 'volunteer', 'awards', 'publications', 'patents', 'speaking', 'memberships', 'licenses', 'training', 'extracurricular', 'references', 'custom'].includes(key)) && (
                <div className="space-y-4">
                    {key === 'custom' && (
                        <div className="mb-4">
                            <FloatingLabelInput 
                                label="Section Heading" 
                                value={resumeData.sections.custom.label} 
                                onChange={(e) => handleSectionLabelChange('custom', e.target.value)} 
                                placeholder="e.g. Portfolio, Projects, etc."
                            />
                        </div>
                    )}
                    {listBySection[key]?.map((item, index) => (
                        <div key={String(item.id ?? index)} className="relative group border border-slate-200 rounded-xl bg-slate-50 overflow-hidden hover:border-slate-300 transition-colors">
                            <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center cursor-pointer" onClick={() => {
                                const el = document.getElementById(`${key}-details-${String(item.id ?? index)}`);
                                if(el) el.classList.toggle('hidden');
                            }}>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">{String(item.role ?? item.degree ?? item.title ?? item.name ?? item.language ?? item.event ?? item.organization ?? 'New Item')}</h4>
                                    <p className="text-[10px] text-slate-400">{String(item.company ?? item.location ?? item.issuer ?? item.institution ?? item.organization ?? item.proficiency ?? 'Details')}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); removeItem(key, index); }} className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            {/* Note: The ID here needs to be unique if multiple instances exist, but for now we assume simple DOM */}
                            <div id={`${key}-details-${String(item.id ?? index)}`} className="p-4 space-y-3">
                                {/* DYNAMIC FIELDS BASED ON TYPE */}
                                {key === 'experience' && (
                                   <>
                                     <FloatingLabelInput label="Role Title" value={String(item.role ?? '')} onChange={(e) => handleArrayChange(key, index, 'role', e.target.value)} placeholder="e.g. Product Manager"/>
                                     <div className="grid grid-cols-2 gap-3"><FloatingLabelInput label="Company" value={String(item.company ?? '')} onChange={(e) => handleArrayChange(key, index, 'company', e.target.value)} placeholder="e.g. Google"/><FloatingLabelInput label="Location" value={String(item.location ?? '')} onChange={(e) => handleArrayChange(key, index, 'location', e.target.value)} placeholder="e.g. New York, NY"/></div>
                                     <FloatingLabelInput label="Dates" value={String(item.period ?? '')} onChange={(e) => handleArrayChange(key, index, 'period', e.target.value)} placeholder="e.g. 2020 - Present"/>
                                     <textarea value={Array.isArray(item.description) ? item.description.join('\n') : String(item.description ?? '')} onChange={(e) => handleDescriptionChange(key, index, e.target.value)} className="w-full h-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900 resize-none leading-normal placeholder:text-slate-300" placeholder="• Achievements..."/>
                                   </>
                                )}
                                {key === 'education' && (
                                   <>
                                     <FloatingLabelInput label="Degree" value={String(item.degree ?? '')} onChange={(e) => handleArrayChange(key, index, 'degree', e.target.value)} placeholder="e.g. BS Computer Science"/>
                                     <FloatingLabelInput label="School" value={String(item.location ?? '')} onChange={(e) => handleArrayChange(key, index, 'location', e.target.value)} placeholder="e.g. MIT"/>
                                     <div className="grid grid-cols-2 gap-3"><FloatingLabelInput label="Start" value={String(item.startYear ?? '')} onChange={(e) => handleArrayChange(key, index, 'startYear', e.target.value)} placeholder="2018"/><FloatingLabelInput label="End" value={String(item.endYear ?? '')} onChange={(e) => handleArrayChange(key, index, 'endYear', e.target.value)} placeholder="2022"/></div>
                                   </>
                                )}
                                {key === 'references' && (
                                   <>
                                     <FloatingLabelInput label="Referee Name" value={String(item.name ?? '')} onChange={(e) => handleArrayChange(key, index, 'name', e.target.value)} placeholder="e.g. Jane Smith"/>
                                     <div className="grid grid-cols-2 gap-3">
                                         <FloatingLabelInput label="Role" value={String(item.role ?? '')} onChange={(e) => handleArrayChange(key, index, 'role', e.target.value)} placeholder="e.g. CTO"/>
                                         <FloatingLabelInput label="Company" value={String(item.company ?? '')} onChange={(e) => handleArrayChange(key, index, 'company', e.target.value)} placeholder="e.g. Tech Corp"/>
                                     </div>
                                     <FloatingLabelInput label="Contact Email/Phone" value={String(item.contact ?? '')} onChange={(e) => handleArrayChange(key, index, 'contact', e.target.value)} placeholder="jane@example.com"/>
                                   </>
                                )}
                                {/* Fallback for other generic sections */}
                                {(!['experience', 'education', 'references'].includes(key)) && (
                                   <>
                                     <FloatingLabelInput label="Title / Name / Role" value={String(item.title ?? item.name ?? item.role ?? item.language ?? item.event ?? item.organization ?? '')} onChange={(e) => handleArrayChange(key, index, item.title !== undefined ? 'title' : item.name !== undefined ? 'name' : item.language !== undefined ? 'language' : item.event !== undefined ? 'event' : item.organization !== undefined ? 'organization' : 'role', e.target.value)} placeholder="Name"/>
                                     <FloatingLabelInput label="Subtitle / Issuer / Detail" value={String(item.company ?? item.issuer ?? item.organization ?? item.institution ?? item.proficiency ?? item.publisher ?? item.topic ?? item.number ?? item.link ?? item.subtitle ?? '')} onChange={(e) => handleArrayChange(key, index, item.company !== undefined ? 'company' : item.issuer !== undefined ? 'issuer' : item.organization !== undefined ? 'organization' : item.institution !== undefined ? 'institution' : item.publisher !== undefined ? 'publisher' : item.topic !== undefined ? 'topic' : item.number !== undefined ? 'number' : item.link !== undefined ? 'link' : item.subtitle !== undefined ? 'subtitle' : 'proficiency', e.target.value)} placeholder="Detail"/>
                                     <FloatingLabelInput label="Date / Period" value={String(item.date ?? item.period ?? '')} onChange={(e) => handleArrayChange(key, index, item.date !== undefined ? 'date' : 'period', e.target.value)} placeholder="Date"/>
                                   </>
                                )}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => handleAddItem(key)} className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-500 hover:text-neutral-900 hover:border-neutral-300 hover:bg-slate-50 transition-all flex items-center justify-center"><Plus size={14} className="mr-1.5" /> Add Item</button>
                </div>
            )}
        </div>
    );
  };

  // --- Pagination Logic ---
  const calculatePages = (): ResumePageState[] => {
    const MAX_PAGE_HEIGHT = 1050;
    const pages: ResumePageState[] = [];

    let currentPage: ResumePageState = {
      id: 1,
      rightColumn: [],
      currentHeight: 0,
    };

    const getEstimatedHeight = (type: string, item: StudioLegacyListItem | null) => {
      let h = 30;
      if (type === 'summary') {
        h += Math.ceil(resumeData.summary.length / 90) * 24 + 40;
      } else if (type === 'skills') {
        h += 100;
      } else if (item) {
        h += 30;
        const desc = item.description;
        if (desc && Array.isArray(desc)) {
          h += desc.length * 20;
        }
        h += 20;
      }
      return h;
    };

    const rightSections = [
      'summary',
      'experience',
      'education',
      'projects',
      'certifications',
      'volunteer',
      'awards',
      'publications',
      'patents',
      'speaking',
      'memberships',
      'licenses',
      'training',
      'extracurricular',
      'custom',
    ] as const;

    const viewLists = resumeData as unknown as Record<string, unknown>;

    rightSections.forEach((section) => {
      if (!resumeData.sections[section]?.visible) return;

      const rows = viewLists[section];
      if (Array.isArray(rows)) {
        currentPage.currentHeight += 40;
        currentPage.rightColumn.push({
          type: 'section-title',
          content: resumeData.sections[section].label,
        });

        rows.forEach((raw) => {
          const item = raw as StudioLegacyListItem;
          const itemHeight = getEstimatedHeight(section, item);

          if (currentPage.currentHeight + itemHeight > MAX_PAGE_HEIGHT) {
            pages.push(currentPage);
            currentPage = {
              id: pages.length + 1,
              rightColumn: [],
              currentHeight: 40,
            };
          }

          currentPage.rightColumn.push({ type: 'item', section, data: item });
          currentPage.currentHeight += itemHeight;
        });
      } else if (section === 'summary') {
        const height = getEstimatedHeight('summary', null);
        if (currentPage.currentHeight + height > MAX_PAGE_HEIGHT) {
          pages.push(currentPage);
          currentPage = { id: pages.length + 1, rightColumn: [], currentHeight: 40 };
        }
        currentPage.rightColumn.push({ type: 'summary', content: resumeData.summary });
        currentPage.currentHeight += height;
      }
    });

    pages.push(currentPage);
    return pages;
  };

  const pages = calculatePages();

  return (
    <div className="flex flex-col h-[calc(100vh-1.25rem)] bg-slate-50 font-sans text-slate-900 overflow-hidden rounded-2xl border border-slate-200 shadow-sm relative">
      
      {/* --- NEW POPUP EDITOR MODAL --- */}
      {activeSectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in border border-slate-100">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                             {resumeData.sections[activeSectionModal].icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-800">{resumeData.sections[activeSectionModal].label} Editor</h3>
                            <p className="text-xs text-slate-500">Edit your details in expanded view.</p>
                          </div>
                      </div>
                      <button onClick={() => setActiveSectionModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Modal Body - Reuses the same renderSectionContent logic */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                         {renderSectionContent(activeSectionModal)}
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                      <button 
                          onClick={() => setActiveSectionModal(null)}
                          className="px-6 py-2.5 bg-slate-600 text-white rounded-xl text-sm font-bold hover:bg-slate-700 shadow-md shadow-slate-200 transition-all transform hover:-translate-y-0.5"
                      >
                          Done Editing
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Tool Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 relative">
        <div className="flex items-center h-full space-x-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-all duration-200 mr-2 ${isSidebarOpen ? 'bg-slate-100 text-neutral-900' : 'text-slate-400 hover:text-neutral-900'}`}
            >
              <PanelLeft size={18} />
            </button>
            <NavTab 
              icon={<Layout size={16} className="text-slate-600" />} 
              label="Sections" 
              active={activeTab === 'Sections'} 
              bgClass="bg-slate-50"
              onClick={() => { setActiveTab('Sections'); setIsSidebarOpen(true); }} 
            />
            {/* ... existing tabs ... */}
            <NavTab 
              icon={<FileText size={16} className="text-pink-500" />} 
              label="Templates" 
              active={activeTab === 'Templates'} 
              bgClass="bg-pink-50"
              onClick={() => { setActiveTab('Templates'); setIsSidebarOpen(true); }} 
            />
            <NavTab 
              icon={<Palette size={16} className="text-fuchsia-500" />} 
              label="Formatting" 
              active={activeTab === 'Formatting'} 
              bgClass="bg-fuchsia-50"
              onClick={() => { setActiveTab('Formatting'); setIsSidebarOpen(true); }} 
            />
            <NavTab 
              icon={<Bot size={16} className="text-sky-500" />} 
              label="AI Copilot" 
              active={activeTab === 'AI Copilot'} 
              bgClass="bg-sky-50"
              onClick={() => { setActiveTab('AI Copilot'); setIsSidebarOpen(true); }} 
            />
            <NavTab 
              icon={<CheckSquare size={16} className="text-emerald-500" />} 
              label="Review" 
              active={activeTab === 'Review'} 
              bgClass="bg-emerald-50"
              onClick={() => { setActiveTab('Review'); setIsSidebarOpen(true); }} 
            />
            <NavTab 
              icon={<Folder size={16} className="text-amber-500" />} 
              label="Manage" 
              active={activeTab === 'Manage'} 
              bgClass="bg-amber-50"
              onClick={() => { setActiveTab('Manage'); setIsSidebarOpen(true); }} 
            />
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-3 px-4">
            <button 
                onClick={toggleFullScreen}
                className="group h-full px-2 flex items-center justify-center border-b-2 border-transparent transition-all"
            >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-sm bg-violet-50 hover:bg-violet-100 text-violet-600">
                    {isFullscreen ? (
                        <Minimize size={18} />
                    ) : (
                        <Maximize size={18} />
                    )}
                </div>
                <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap text-sm font-medium text-slate-600">
                    {isFullscreen ? "Exit Full Screen" : "View Full Screen"}
                </span>
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Secondary Panel (Dynamic Content) */}
        <aside className={`${isSidebarOpen ? 'w-96 border-r' : 'w-0 border-none'} bg-white border-slate-200 flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="w-full h-full flex flex-col overflow-y-auto">
            <div className="flex-1 flex flex-col">
            {activeTab === 'Templates' ? (
              <div className="p-6 bg-slate-50/50 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-4 mb-6">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="text-lg font-bold text-slate-800">Choose Template</h3>
                       <p className="text-xs text-slate-500 mt-1">Select a layout that fits your industry.</p>
                     </div>
                     <span className="text-[10px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded-full">{filteredTemplates.length} Available</span>
                   </div>

                   {/* Template Category Filter with Navigation Arrows */}
                   <div className="relative group/cat-carousel px-1">
                      <button 
                          onClick={() => scrollCategories('left')}
                          className="absolute -left-1 top-1/2 -translate-y-1/2 -mt-1 z-10 w-6 h-6 bg-white shadow-md border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all opacity-0 group-hover/cat-carousel:opacity-100"
                      >
                          <ChevronLeft size={14} />
                      </button>
                      
                      <div 
                          ref={categoryScrollRef}
                          className="flex gap-2 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden" 
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                          {templateCategories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => setActiveTemplateCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0
                                    ${activeTemplateCategory === cat 
                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' 
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                              >
                                {cat}
                              </button>
                          ))}
                      </div>

                      <button 
                          onClick={() => scrollCategories('right')}
                          className="absolute -right-1 top-1/2 -translate-y-1/2 -mt-1 z-10 w-6 h-6 bg-white shadow-md border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all opacity-0 group-hover/cat-carousel:opacity-100"
                      >
                          <ChevronRight size={14} />
                      </button>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10 animate-fade-in-up">
                  {filteredTemplates.map((template) => (
                    <div 
                      key={template.id} 
                      className={`relative flex flex-col p-3 rounded-xl border-2 transition-all duration-300 group text-left
                        ${selectedTemplate === template.id 
                          ? 'border-slate-600 bg-white shadow-lg shadow-slate-100 scale-[1.02] ring-1 ring-slate-600' 
                          : 'border-white bg-white shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-1'}`}
                    >
                      {/* Click Handler Wrapper */}
                      <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => setSelectedTemplate(template.id)}></div>

                      {/* Selection Indicator */}
                      <div className={`absolute top-3 right-3 z-10 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${selectedTemplate === template.id ? 'bg-slate-600 scale-100' : 'bg-slate-100 scale-0 group-hover:scale-100'}`}>
                         <Check size={12} className={`text-white ${selectedTemplate === template.id ? 'opacity-100' : 'opacity-0'}`} />
                      </div>

                      {/* Thumbnail Area with Detailed Mockup */}
                      <div className={`w-full aspect-[4/3] rounded-lg mb-3 overflow-hidden border border-slate-100 relative bg-slate-50 group-preview`}>
                          <div className="absolute inset-2 group-hover:scale-[1.02] transition-transform duration-500 origin-top">
                              <TemplateThumbnail id={template.id} />
                          </div>
                          
                          {/* Preview Button Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPreviewingTemplate(template); }}
                                className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-1.5 hover:bg-slate-600 hover:text-white"
                              >
                                <Eye size={12} /> Preview
                              </button>
                          </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-0 pointer-events-none">
                        <div className="flex justify-between items-start">
                           <h4 className={`text-sm font-bold ${selectedTemplate === template.id ? 'text-slate-900' : 'text-slate-700'}`}>{template.label}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mb-2">{template.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map(tag => (
                            <span key={tag} className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${selectedTemplate === template.id ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-500'}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTemplates.length === 0 && (
                      <div className="col-span-2 text-center py-10 opacity-50">
                          <p className="text-xs font-medium text-slate-500">No templates found for this category.</p>
                      </div>
                  )}
                </div>

                {/* --- PREVIEW MODAL --- */}
                {previewingTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-scale-in">
                            {/* Modal Header */}
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg text-slate-800">{previewingTemplate.label} Preview</h3>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded tracking-wider">
                                        {previewingTemplate.layout.replace('-', ' ')}
                                    </span>
                                </div>
                                <button onClick={() => setPreviewingTemplate(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body - Big Layout Simulation */}
                            <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex justify-center">
                                <div className={`w-[500px] h-[700px] bg-white shadow-xl flex shrink-0 transition-all duration-300 transform scale-100 origin-top 
                                    ${previewingTemplate.layout === 'sidebar-left' ? 'flex-row' : 
                                      previewingTemplate.layout === 'sidebar-right' ? 'flex-row-reverse' : 
                                      'flex-col'}`}
                                >
                                    {/* Simulated Sidebar */}
                                    <div className={`${previewingTemplate.layout.includes('col') ? 'w-full h-40 border-b' : 'w-[35%] h-full'} bg-slate-800 p-6 flex flex-col`}>
                                        <div className="w-20 h-20 bg-white/20 rounded-full mb-4"></div>
                                        <div className="w-3/4 h-4 bg-white/20 rounded mb-2"></div>
                                        <div className="w-1/2 h-3 bg-white/10 rounded mb-8"></div>
                                        <div className="space-y-3 mt-auto">
                                            <div className="w-full h-2 bg-white/10 rounded"></div>
                                            <div className="w-full h-2 bg-white/10 rounded"></div>
                                            <div className="w-2/3 h-2 bg-white/10 rounded"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Simulated Main Content */}
                                    <div className="flex-1 p-8 space-y-6 bg-white">
                                        <div className="space-y-2 mb-8">
                                            <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                                            <div className="w-full h-24 bg-slate-50 rounded border border-slate-100"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
                                            <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                                                <div className="w-full h-16 bg-slate-50 rounded"></div>
                                                <div className="w-full h-16 bg-slate-50 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 z-10">
                                <button 
                                    onClick={() => setPreviewingTemplate(null)}
                                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => { setSelectedTemplate(previewingTemplate.id); setPreviewingTemplate(null); }}
                                    className="px-6 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold hover:bg-slate-700 shadow-md shadow-slate-200 transition-all transform hover:-translate-y-0.5"
                                >
                                    Apply Template
                                </button>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            ) : activeTab === 'Manage' ? (
              <div className="p-6 bg-slate-50/50 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  {/* ... Existing Manage Tab Content ... */}
                  {/* Header Section */}
                  <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Manage Document</h3>
                        <p className="text-xs text-slate-500">Control file settings, versions, and exports.</p>
                    </div>
                    <span
                      role="status"
                      aria-live="polite"
                      className={cn(
                        'text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shrink-0 whitespace-nowrap',
                        saveError
                          ? 'text-red-600 bg-red-50'
                          : isSaving === true
                            ? 'text-sky-700 bg-sky-50 animate-pulse'
                            : 'text-emerald-600 bg-emerald-50',
                      )}
                    >
                        {saveError ? (
                          <>
                            <XCircle size={10} className="shrink-0" /> Sync Issue
                          </>
                        ) : isSaving === true ? (
                          <>
                            <Loader2 size={10} className="animate-spin shrink-0" /> Saving to Cloud...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={10} className="shrink-0" /> Cloud Synced
                          </>
                        )}
                    </span>
                  </div>

                  {/* File Name & Rename */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Resume Name</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          defaultValue="Alex_Morgan_Senior_Product_Designer_2025"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                        />
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors shadow-sm">
                        Rename
                      </button>
                    </div>
                  </div>
                  {/* ... Rest of Manage Tab ... */}
                  <div className="grid grid-cols-2 gap-4">
                     <div
                       role="button"
                       tabIndex={0}
                       onClick={() => !isImportParsing && importFileInputRef.current?.click()}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                           e.preventDefault();
                           if (!isImportParsing) importFileInputRef.current?.click();
                         }
                       }}
                       onDragOver={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         if (!isImportParsing) setIsDragOverImport(true);
                       }}
                       onDragLeave={(e) => {
                         e.preventDefault();
                         setIsDragOverImport(false);
                       }}
                       onDrop={handleImportDrop}
                       className={cn(
                         'col-span-2 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group bg-slate-50/50 relative',
                         isDragOverImport
                           ? 'border-slate-500 bg-slate-100/80'
                           : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/30',
                         isImportParsing && 'pointer-events-none opacity-80',
                       )}
                     >
                        <input
                          ref={importFileInputRef}
                          type="file"
                          accept=".pdf,.json,application/pdf,application/json"
                          className="hidden"
                          onChange={handleImportFileChange}
                        />
                        {isImportParsing ? (
                          <>
                            <Loader2 size={28} className="animate-spin text-slate-600 mb-3" />
                            <h4 className="text-sm font-bold text-slate-700">Parsing resume…</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">Extracting structured content from your file.</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                              <Upload size={20} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-700">Import Resume</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Drag & drop PDF or JSON here, or click to browse.</p>
                          </>
                        )}
                     </div>
                     <button className="p-4 bg-white border border-slate-200 rounded-xl hover:border-red-200 hover:shadow-md transition-all text-left group relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText size={48} className="text-red-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                           <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileText size={16}/></div>
                           <span className="text-sm font-bold text-slate-700">Export PDF</span>
                        </div>
                        <p className="text-[10px] text-slate-400 relative z-10">Standard format for applications.</p>
                     </button>
                     <button className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-md transition-all text-left group relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Code2 size={48} className="text-blue-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Code2 size={16}/></div>
                           <span className="text-sm font-bold text-slate-700">Export JSON</span>
                        </div>
                        <p className="text-[10px] text-slate-400 relative z-10">Machine readable data format.</p>
                     </button>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                       <RefreshCw size={12} /> Version History
                    </h4>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                       {[
                         { time: 'Just now', label: 'Current Version', active: true, size: '4.2 KB' },
                         { time: '2 hours ago', label: 'Auto-save', active: false, size: '4.1 KB' },
                         { time: 'Yesterday', label: 'Manual Save', active: false, size: '3.8 KB' },
                       ].map((ver, i) => (
                         <div key={i} className={`p-3 flex items-center justify-between border-b border-slate-100 last:border-0 ${ver.active ? 'bg-slate-50/30' : 'hover:bg-slate-50'}`}>
                            <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${ver.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                               <div>
                                  <div className="flex items-center gap-2">
                                    <p className={`text-xs font-bold ${ver.active ? 'text-slate-900' : 'text-slate-700'}`}>{ver.label}</p>
                                    {ver.active && <span className="text-[8px] bg-slate-100 text-slate-700 px-1.5 rounded uppercase font-bold">Live</span>}
                                  </div>
                                  <p className="text-[10px] text-slate-400">{ver.time} • {ver.size}</p>
                               </div>
                            </div>
                            <button className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${ver.active ? 'border-transparent text-slate-400 cursor-default' : 'border-slate-200 text-slate-500 hover:text-slate-600 hover:border-slate-200 hover:bg-white'}`}>
                               {ver.active ? 'Active' : 'Restore'}
                            </button>
                         </div>
                       ))}
                       <button className="w-full py-2 bg-slate-50 text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                           View All History
                       </button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200">
                    <button className="w-full py-3 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 hover:border-red-300 transition-colors flex items-center justify-center gap-2">
                       <Trash2 size={14} /> Delete Resume
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'Sections' ? (
              <div className="p-4 bg-slate-50 flex-1 space-y-3 pb-20 overflow-y-auto">
                {/* Resume Health Progress - Collapsible & Functional */}
                <div 
                  className={`bg-white rounded-xl border p-4 mb-4 shadow-sm transition-all cursor-pointer group ${isStrengthExpanded ? 'ring-1 ring-slate-500 border-slate-500' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => setIsStrengthExpanded(!isStrengthExpanded)}
                >
                   <div className="flex justify-between items-end mb-2">
                      <div>
                         <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                            Resume Strength
                            {isStrengthExpanded ? <ChevronDown size={14} className="text-slate-500"/> : <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-500"/>}
                         </h4>
                         <p className="text-[10px] text-slate-500 mt-0.5">{scoreData.message}</p>
                      </div>
                      <span className={`text-lg font-bold ${scoreData.score === 100 ? 'text-emerald-600' : 'text-slate-600'}`}>{scoreData.score}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                         className={`h-full rounded-full transition-all duration-700 ${scoreData.score === 100 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-slate-500 to-purple-500'}`} 
                         style={{ width: `${scoreData.score}%` }}
                      ></div>
                   </div>
                   
                   {/* Expanded Action Items */}
                   {isStrengthExpanded && (
                       <div className="mt-4 pt-3 border-t border-slate-100 animate-fade-in-up">
                           <div className="flex items-center justify-between mb-2">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To-Do List</span>
                               <span className="text-[10px] font-medium text-slate-400">{scoreData.tasks.length} tasks pending</span>
                           </div>
                           
                           {scoreData.tasks.length === 0 ? (
                               <div className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                                   <CheckCircle2 size={16} /> All sections complete!
                               </div>
                           ) : (
                               <div className="space-y-1.5">
                                   {scoreData.tasks.map((task) => (
                                       <button 
                                          key={task.id}
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              // Auto-navigate to section if it exists
                                              if (task.id !== 'bonus' && resumeData.sections[task.id]) {
                                                  // Ensure it's visible first
                                                  if (!resumeData.sections[task.id].visible) {
                                                      toggleSectionVisibility(task.id);
                                                  }
                                                  // Then expand it
                                                  setExpandedSection(resumeData.sections[task.id].label);
                                              }
                                          }}
                                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group/task"
                                       >
                                           <div className="flex items-center gap-2.5">
                                               <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${task.id === 'bonus' ? 'border-amber-300 bg-amber-50' : 'border-slate-100 group-hover/task:border-slate-400'}`}>
                                                   {task.id === 'bonus' && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                                               </div>
                                               <span className="text-xs font-medium text-slate-600 group-hover/task:text-slate-900">{task.text}</span>
                                           </div>
                                           <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{task.points}%</span>
                                       </button>
                                   ))}
                               </div>
                           )}
                       </div>
                   )}
                </div>

                {/* --- ACTIVE SECTIONS LIST --- */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2">Your Sections</h4>
                    {Object.entries(resumeData.sections).filter(([_, conf]) => conf.visible).map(([key, conf]) => (
                        <SectionCard 
                            key={key}
                            label={conf.label} 
                            icon={conf.icon} 
                            isVisible={conf.visible} 
                            isExpanded={expandedSection === conf.label} 
                            isComplete={calculateSectionHealth(key)}
                            onToggleExpand={() => setExpandedSection(expandedSection === conf.label ? null : conf.label)} 
                            onToggleVisibility={() => toggleSectionVisibility(key)}
                            onOpenModal={() => setActiveSectionModal(key)}
                        >
                            {renderSectionContent(key)}
                        </SectionCard>
                    ))}
                </div>

                {/* --- ADD MORE SECTIONS (LIBRARY) --- */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-4">Add to Resume</h4>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(resumeData.sections).filter(([_, conf]) => !conf.visible).map(([key, conf]) => (
                            <AddSectionButton 
                                key={key}
                                label={conf.label}
                                icon={conf.icon}
                                onClick={() => toggleSectionVisibility(key)}
                            />
                        ))}
                    </div>
                </div>

              </div>
            ) : activeTab === 'Formatting' ? (
              <div className="p-6 bg-slate-50/50 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-8 pb-10">
                  {/* ... Existing Formatting Tab Content ... */}
                   {/* Header */}
                   <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Palette size={20} className="text-fuchsia-500"/> Formatting</h3>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Customize your resume's visual style</p>
                      </div>
                      <button 
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_SETTINGS',
                            payload: { studioFormatting: { ...DEFAULT_SMART_STUDIO_FORMATTING } },
                          })
                        }
                        className="p-2 text-slate-400 hover:text-neutral-900 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw size={14} /> <span className="text-xs font-semibold">Reset</span>
                      </button>
                   </div>
                  {/* ... Rest of Formatting Tab controls ... */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 px-1">
                        <MoveVertical size={14} /> Text Styling
                     </h4>
                     <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm space-y-2">
                         <div className="flex items-center gap-2 p-1">
                             <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                <button 
                                  onClick={() => patchStudioFormatting({ boldTitles: !formatting.boldTitles })} 
                                  className={`p-2 rounded hover:bg-white hover:shadow-sm transition-all ${formatting.boldTitles ? 'bg-white shadow-sm text-slate-600' : 'text-slate-500'}`}
                                  title="Bold Titles"
                                >
                                    <Bold size={16} />
                                </button>
                                <button 
                                  onClick={() => patchStudioFormatting({ italicDetails: !formatting.italicDetails })} 
                                  className={`p-2 rounded hover:bg-white hover:shadow-sm transition-all ${formatting.italicDetails ? 'bg-white shadow-sm text-slate-600' : 'text-slate-500'}`}
                                  title="Italic Details"
                                >
                                    <Italic size={16} />
                                </button>
                                <button 
                                  onClick={() => patchStudioFormatting({ underlineHeaders: !formatting.underlineHeaders })} 
                                  className={`p-2 rounded hover:bg-white hover:shadow-sm transition-all ${formatting.underlineHeaders ? 'bg-white shadow-sm text-slate-600' : 'text-slate-500'}`}
                                  title="Underline Headers"
                                >
                                    <Underline size={16} />
                                </button>
                             </div>
                             <div className="w-px h-6 bg-slate-200 mx-1"></div>
                             <div className="flex bg-slate-100 rounded-lg p-1 gap-1 flex-1 justify-between">
                               {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                                 const IconMap = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify } as const;
                                 const Icon = IconMap[align];
                                 return (
                                   <button 
                                     key={align}
                                     onClick={() => patchStudioFormatting({ textAlign: align })} 
                                     className={`p-2 rounded hover:bg-white hover:shadow-sm transition-all flex-1 flex justify-center ${formatting.textAlign === align ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                                   >
                                     <Icon size={16} />
                                   </button>
                                 )
                               })}
                             </div>
                         </div>
                         <div className="h-px bg-slate-100 mx-2"></div>
                         <div className="flex items-center gap-2 p-1">
                            <button 
                                onClick={() => patchStudioFormatting({ uppercaseHeaders: !formatting.uppercaseHeaders })}
                                className={`px-3 py-2 border rounded-md text-xs font-bold flex items-center gap-2 transition-all ${formatting.uppercaseHeaders ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <CaseUpper size={14} /> {formatting.uppercaseHeaders ? 'ALL CAPS' : 'Title Case'}
                            </button>
                            <div className="w-px h-6 bg-slate-200 mx-1"></div>
                             <div className="flex bg-slate-100 rounded-lg p-1 gap-1 flex-1">
                                {(['disc', 'circle', 'square'] as const).map((style) => (
                                    <button 
                                        key={style}
                                        onClick={() => patchStudioFormatting({ bulletStyle: style })}
                                        className={`flex-1 py-1.5 rounded flex items-center justify-center hover:bg-white hover:shadow-sm transition-all ${formatting.bulletStyle === style ? 'bg-white shadow-sm text-slate-600' : 'text-slate-400'}`}
                                        title={`${style} bullets`}
                                    >
                                        <div className={`w-1.5 h-1.5 bg-current ${style === 'disc' ? 'rounded-full' : style === 'circle' ? 'rounded-full ring-1 ring-inset ring-current bg-transparent' : 'rounded-sm'}`} />
                                    </button>
                                ))}
                             </div>
                         </div>
                         <div className="p-1 pt-0">
                            <div className="flex gap-2 mt-1">
                                {(['tight', 'normal', 'relaxed'] as const).map((h) => (
                                    <button key={h} onClick={() => patchStudioFormatting({ lineHeight: h })} className={`flex-1 py-1.5 border rounded-md text-[10px] font-bold uppercase flex items-center justify-center gap-1 hover:bg-slate-50 ${formatting.lineHeight === h ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                                        <MoveVertical size={10} className={h === 'tight' ? 'scale-75' : h === 'relaxed' ? 'scale-125' : 'scale-100'}/> {h}
                                    </button>
                                ))}
                            </div>
                         </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 px-1">
                        <Type size={14} /> Typography
                    </h4>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                       <div className="relative group/carousel">
                            <button 
                                onClick={() => scrollFonts('left')}
                                className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div 
                                ref={fontScrollRef}
                                className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {[
                                    { id: 'sans', label: 'Modern', font: 'font-sans', sample: 'Aa' },
                                    { id: 'serif', label: 'Classic', font: 'font-serif', sample: 'Aa' },
                                    { id: 'mono', label: 'Tech', font: 'font-mono', sample: 'Aa' },
                                    { id: 'geometric', label: 'Geometric', font: 'font-sans tracking-wide', sample: 'Ag' },
                                    { id: 'slab', label: 'Slab', font: 'font-serif font-medium', sample: 'Ab' },
                                    { id: 'clean', label: 'Clean', font: 'font-sans font-light', sample: 'Ac' }
                                ].map((font) => (
                                    <button 
                                    key={font.id}
                                    onClick={() => patchStudioFormatting({ fontFamily: font.id })} 
                                    className={`shrink-0 w-24 aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-200 group border-2 snap-center
                                        ${formatting.fontFamily === font.id 
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}
                                    >
                                    <span className={`text-3xl font-bold ${font.font}`}>{font.sample}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${formatting.fontFamily === font.id ? 'text-slate-400' : 'text-slate-400'}`}>{font.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => scrollFonts('right')}
                                className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100"
                            >
                                <ChevronRight size={16} />
                            </button>
                       </div>
                       <div className="pt-2 border-t border-slate-100">
                           <div className="flex justify-between items-center mb-4 pt-2">
                              <span className="text-sm font-bold text-slate-700">Font Scale</span>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-bold uppercase">{formatting.fontSize}</span>
                           </div>
                           <div className="relative h-2 bg-slate-100 rounded-full mb-1 mx-1">
                              <input 
                                 type="range" min="0" max="2" step="1" 
                                 value={['small', 'medium', 'large'].indexOf(formatting.fontSize)}
                                 onChange={(e) =>
                                   patchStudioFormatting({
                                     fontSize: ['small', 'medium', 'large'][Number(e.target.value)] as SmartStudioFormatting['fontSize'],
                                   })
                                 }
                                 className="absolute w-full h-full opacity-0 cursor-pointer z-10" 
                              />
                              <div className="absolute top-0 left-0 h-full bg-slate-900 rounded-full transition-all duration-200" 
                                   style={{ width: ['0%', '50%', '100%'][['small', 'medium', 'large'].indexOf(formatting.fontSize)] }}></div>
                              <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-slate-900 rounded-full shadow-md transition-all duration-200 pointer-events-none"
                                   style={{ left: ['0%', '50%', '100%'][['small', 'medium', 'large'].indexOf(formatting.fontSize)], transform: 'translate(-50%, -50%)' }}></div>
                           </div>
                           <div className="flex justify-between mt-3 text-slate-400">
                               <span className="text-[10px] font-bold uppercase">Small</span>
                               <span className="text-[10px] font-bold uppercase">Large</span>
                           </div>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 px-1">
                        <PaintBucket size={14} /> Appearance
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <label className="text-xs font-semibold text-slate-700 block mb-3">Accent Color</label>
                        <div className="flex flex-wrap gap-3">
                        {(['slate', 'blue', 'purple', 'green', 'red', 'orange'] as const).map((color) => {
                            const isSelected = formatting.themeColor === color;
                            const colorMap = {
                            slate: 'bg-slate-800', blue: 'bg-blue-600', purple: 'bg-purple-600', 
                            green: 'bg-emerald-600', red: 'bg-rose-600', orange: 'bg-orange-600'
                            } as const;
                            return (
                            <button 
                                key={color} 
                                onClick={() => patchStudioFormatting({ themeColor: color })} 
                                className={`group relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                                ${colorMap[color]} 
                                ${isSelected ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110 shadow-md' : 'opacity-70 hover:opacity-100 hover:scale-105'}`
                                }
                                title={color.charAt(0).toUpperCase() + color.slice(1)}
                            >
                                {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                            </button>
                            );
                        })}
                        </div>
                    </div>
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <label className="text-xs font-semibold text-slate-700 block mb-3">Sidebar Style</label>
                        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
                           {[
                               { id: 'dark', label: 'Dark', class: 'bg-slate-800 text-slate-300' },
                               { id: 'light', label: 'Light', class: 'bg-white text-slate-500 border border-slate-200' },
                               { id: 'colored', label: 'Color', class: `${getThemeColorClass('bg')} text-white` }
                           ].map((style) => (
                               <button
                                   key={style.id}
                                   onClick={() =>
                                     patchStudioFormatting({
                                       sidebarStyle: style.id as SmartStudioFormatting['sidebarStyle'],
                                     })
                                   }
                                   className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-md text-[10px] font-bold uppercase transition-all relative overflow-hidden
                                   ${formatting.sidebarStyle === style.id 
                                       ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                                       : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                               >
                                   <div className={`w-4 h-4 rounded-full ${style.class} shadow-sm border border-black/5`}></div>
                                   {style.label}
                               </button>
                           ))}
                        </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 px-1">
                        <LayoutTemplate size={14} /> Page Layout
                    </h4>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-700">Page Density</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatting.layoutDensity}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                                    <button
                                        key={density}
                                        onClick={() => patchStudioFormatting({ layoutDensity: density })}
                                        className={`py-2.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                                        ${formatting.layoutDensity === density 
                                            ? 'bg-slate-50 border-slate-200 text-slate-700 shadow-sm ring-1 ring-slate-200' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        {density}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700">Margins</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatting.pageMargins}</span>
                        </div>
                        <div className="bg-slate-100 p-1.5 rounded-xl flex items-center justify-between">
                            {[
                                { id: 'narrow', label: 'Narrow', icon: Maximize2 },
                                { id: 'normal', label: 'Normal', icon: Columns },
                                { id: 'wide', label: 'Wide', icon: Minimize2 }
                            ].map((margin) => (
                                <button
                                key={margin.id}
                                onClick={() =>
                                  patchStudioFormatting({
                                    pageMargins: margin.id as SmartStudioFormatting['pageMargins'],
                                  })
                                }
                                className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all text-slate-500 relative
                                    ${formatting.pageMargins === margin.id 
                                    ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.02]' 
                                    : 'hover:text-slate-700'}`}
                                title={margin.label}
                                >
                                <margin.icon size={18} strokeWidth={2} /> 
                                </button>
                            ))}
                        </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'AI Copilot' ? (
                <div className="h-full">
                    <CopilotSidebar onApplyChanges={handleApplyAction} />
                </div>
            ) : activeTab === 'Review' ? (
              <ReviewSection onNavigateToCopilot={() => setActiveTab('AI Copilot')} />
            ) : null}
            </div>
          </div>
        </aside>

        {/* Editor Canvas (Dynamic Preview) */}
        <main className="flex-1 bg-slate-100 relative flex flex-col overflow-hidden">
          <div 
            ref={previewRef}
            className={`flex-1 overflow-y-auto p-8 flex flex-col items-center gap-8 custom-scrollbar transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[100] bg-slate-100 h-screen w-screen' : ''}`}
          >
            {/* Floating Exit Button (Visible only in Full Screen) */}
            {isFullscreen && (
                <button 
                    onClick={toggleFullScreen}
                    className="fixed top-6 right-6 z-[110] p-3 bg-white/90 backdrop-blur rounded-full shadow-xl text-slate-800 hover:bg-white hover:text-red-500 border border-slate-200 transition-all animate-fade-in group"
                    title="Exit Full Screen (Esc)"
                >
                    <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            )}

            {pages.map((page, pageIndex) => (
              <div 
                key={page.id}
                className={`w-[800px] h-[1123px] bg-white shadow-lg shrink-0 overflow-hidden relative transition-all duration-500 ease-in-out ${getFontClass()} ${getLineHeightClass()} ${layoutStyles.container}`}
              >
                {/* Visual Page Indicator */}
                <div className="absolute top-0 right-0 bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-bl opacity-50 z-10">
                   Page {pageIndex + 1} of {pages.length}
                </div>

                {/* Sidebar Column (Dynamically Positioned) */}
                <div className={`${layoutStyles.sidebarWidth} ${getSidebarClass()} ${getMarginClass('left')} flex flex-col transition-all duration-500 ${layoutStyles.sidebarBorder}`}>
                  {pageIndex === 0 ? (
                    <>
                      {/* Avatar & Header Area - Layout Responsive */}
                      <div className={`flex ${layoutStyles.container.includes('col') ? 'flex-row items-center gap-6 mb-8' : 'flex-col items-center mb-8'}`}>
                          <div className={`shrink-0 rounded-full border-4 flex items-center justify-center text-xl font-medium relative overflow-hidden 
                              ${layoutStyles.container.includes('col') ? 'w-24 h-24' : 'w-32 h-32'}
                              ${formatting.sidebarStyle === 'light' ? 'bg-slate-100 border-white shadow-lg text-slate-400' : 'bg-white/10 border-white/20 text-white/80'}`}
                          >
                            {resumeData.personalInfo.avatar}
                            {formatting.sidebarStyle !== 'light' && <div className="absolute inset-0 rounded-full border border-white/20 opacity-50 transform scale-105"></div>}
                          </div>
                          
                          <div className={`${layoutStyles.container.includes('col') ? 'text-left' : 'text-center'}`}>
                            <h1 className="text-2xl font-bold mb-2 break-words">{resumeData.personalInfo.fullName}</h1>
                            <p className={`font-medium text-sm tracking-wide uppercase break-words ${getSidebarTextClass('text-slate-400')}`}>{resumeData.personalInfo.jobTitle}</p>
                          </div>
                      </div>

                      {/* Contact Info */}
                      <div className={`space-y-3 mb-12 text-sm ${getSidebarTextClass('text-slate-300')} ${layoutStyles.container.includes('col') ? 'grid grid-cols-3 gap-4 space-y-0' : ''}`}>
                        <div className="flex items-center"><Mail className="w-4 h-4 mr-3 opacity-70 shrink-0" /><span className="break-all">{resumeData.personalInfo.email}</span></div>
                        <div className="flex items-center"><Phone className="w-4 h-4 mr-3 opacity-70 shrink-0" /><span>{resumeData.personalInfo.phone}</span></div>
                        <div className="flex items-center"><MapPin className="w-4 h-4 mr-3 opacity-70 shrink-0" /><span>{resumeData.personalInfo.location}</span></div>
                      </div>

                      {/* Skills Section */}
                      {resumeData.sections.skills.visible && (
                        <div className={`${layoutStyles.container.includes('col') ? 'mb-8' : 'mt-auto mb-12'}`}>
                          <h3 className={`text-sm font-bold tracking-widest ${formatting.uppercaseHeaders ? 'uppercase' : ''} mb-6 border-b pb-2 ${formatting.sidebarStyle === 'light' ? 'text-slate-800 border-slate-200' : 'text-slate-100 border-white/20'} ${formatting.underlineHeaders ? 'underline decoration-2 underline-offset-4' : ''}`}>Core Skills</h3>
                          <div className={`gap-3 ${layoutStyles.container.includes('col') ? 'flex flex-wrap' : 'space-y-3'}`}>
                              {resumeData.skills.map(skill => (
                                  <div key={skill} className={`px-4 py-2 text-sm font-medium rounded transition-colors cursor-default ${formatting.sidebarStyle === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                      {skill}
                                  </div>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Sidebar Content continues for Page 1 */}
                      {resumeData.sections.languages.visible && (
                         <div className="mt-8">
                           <h3 className={`text-sm font-bold tracking-widest ${formatting.uppercaseHeaders ? 'uppercase' : ''} mb-6 border-b pb-2 ${formatting.sidebarStyle === 'light' ? 'text-slate-800 border-slate-200' : 'text-slate-100 border-white/20'} ${formatting.underlineHeaders ? 'underline decoration-2 underline-offset-4' : ''}`}>Languages</h3>
                           <div className={`space-y-2 ${layoutStyles.container.includes('col') ? 'grid grid-cols-2 gap-4 space-y-0' : ''}`}>
                               {resumeData.languages.map((lang, li) => (
                                   <div key={String(lang.id ?? li)} className="flex justify-between text-sm">
                                       <span className="font-medium">{String(lang.language ?? '')}</span>
                                       <span className="opacity-70">{String(lang.proficiency ?? '')}</span>
                                   </div>
                               ))}
                           </div>
                         </div>
                      )}
                      {resumeData.sections.references.visible && (
                         <div className="mt-8">
                           <h3 className={`text-sm font-bold tracking-widest ${formatting.uppercaseHeaders ? 'uppercase' : ''} mb-6 border-b pb-2 ${formatting.sidebarStyle === 'light' ? 'text-slate-800 border-slate-200' : 'text-slate-100 border-white/20'} ${formatting.underlineHeaders ? 'underline decoration-2 underline-offset-4' : ''}`}>References</h3>
                           <div className={`space-y-4 ${layoutStyles.container.includes('col') ? 'grid grid-cols-2 gap-4 space-y-0' : ''}`}>
                               {resumeData.references.map((ref, ri) => (
                                   <div key={String(ref.id ?? ri)} className="text-sm">
                                       <div className="font-bold">{String(ref.name ?? '')}</div>
                                       <div className="opacity-80 text-xs">{String(ref.role ?? '')} at {String(ref.company ?? '')}</div>
                                       <div className="opacity-60 text-xs mt-1">{String(ref.contact ?? '')}</div>
                                   </div>
                               ))}
                           </div>
                         </div>
                      )}
                      {resumeData.sections.hobbies.visible && (
                         <div className="mt-8">
                           <h3 className={`text-sm font-bold tracking-widest ${formatting.uppercaseHeaders ? 'uppercase' : ''} mb-6 border-b pb-2 ${formatting.sidebarStyle === 'light' ? 'text-slate-800 border-slate-200' : 'text-slate-100 border-white/20'} ${formatting.underlineHeaders ? 'underline decoration-2 underline-offset-4' : ''}`}>Interests</h3>
                           <p className={`text-sm leading-relaxed ${formatting.sidebarStyle === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                               {resumeData.hobbies}
                           </p>
                         </div>
                      )}
                    </>
                  ) : (
                    // Empty sidebar for subsequent pages to maintain visual layout ("sidebar continues")
                    <div className="h-full w-full opacity-10 flex items-end justify-center pb-10">
                        {/* Optional decorative element */}
                    </div>
                  )}
                </div>

                {/* Main Content Column */}
                <div className={`${layoutStyles.mainWidth} ${getMarginClass('right')} bg-white text-slate-800 transition-all duration-500`}>
                    {page.rightColumn.map((block, idx) => {
                        const spacing = getLayoutSpacing();

                        if (block.type === 'section-title') {
                            return (
                                <h3 key={idx} className={`font-bold tracking-wider text-sm ${spacing.sectionMb} ${spacing.sectionMt} ${formatting.uppercaseHeaders ? 'uppercase' : ''} transition-colors ${getThemeColorClass('text')} ${formatting.underlineHeaders ? 'underline decoration-2 underline-offset-4' : ''}`}>
                                    {block.content}
                                </h3>
                            );
                        } else if (block.type === 'summary') {
                            return (
                                <p key={idx} className={`text-sm ${getLineHeightClass()} text-slate-600 ${spacing.summaryMb} ${getTextAlignClass()}`}>{block.content}</p>
                            );
                        } else if (block.type === 'item') {
                            const item = block.data;
                            const dateStr =
                              String(item.period ?? '') ||
                              (item.startYear != null || item.endYear != null
                                ? `${String(item.startYear ?? '')} - ${String(item.endYear ?? '')}`.trim()
                                : String(item.date ?? ''));
                            const subtitle = String(
                              item.company ?? item.location ?? item.institution ?? item.issuer ?? item.publisher ?? item.subtitle ?? '',
                            );
                            return (
                                <div key={idx} className={`${spacing.itemMb} last:mb-0`}>
                                     <div className="flex justify-between items-baseline mb-1">
                                       <h4 className={`${formatting.boldTitles ? 'font-bold' : 'font-medium'} text-slate-900 text-lg`}>{String(item.role ?? item.degree ?? item.title ?? item.name ?? item.event ?? item.organization ?? '')}</h4>
                                       <span className="text-sm text-slate-500 font-medium">{dateStr}</span>
                                     </div>
                                     <div className={`text-sm text-slate-500 font-medium mb-2 ${formatting.italicDetails ? 'italic' : ''}`}>
                                        {subtitle}
                                        {item.location && item.company ? ` • ${String(item.location)}` : ''}
                                     </div>
                                     {Array.isArray(item.description) ? (
                                         <ul className={`${getListStyleClass()} ml-4 ${spacing.listSpace} text-sm text-slate-600 ${getTextAlignClass()} ${getLineHeightClass()}`}>
                                             {item.description.map((desc, dIdx) => (
                                                 <li key={dIdx}>{String(desc)}</li>
                                             ))}
                                         </ul>
                                     ) : null}
                                     {item.link ? <p className="text-xs text-slate-500 mt-1">{String(item.link)}</p> : null}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

                {/* Page Footer - Dynamic Visibility */}
                <div className={`absolute bottom-0 left-0 w-full h-14 z-20 ${layoutStyles.footer}`}>
                    <div className={`w-[35%] h-full ${getSidebarClass()} border-t ${formatting.sidebarStyle === 'light' ? 'border-slate-200' : 'border-white/10'}`}></div>
                    <div className="w-[65%] h-full bg-white border-t border-slate-50"></div>
                </div>

              </div>
            ))}
          </div>
        </main>
      </div>

      {showImportStrategyModal && pendingImportResume && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-strategy-title"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-3">
              <div>
                <h3 id="import-strategy-title" className="text-lg font-bold text-slate-800">
                  Import Strategy
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  We found structured resume content. How would you like to apply this to your current studio profile?
                </p>
              </div>
              <button
                type="button"
                onClick={resetImportFlow}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                aria-label="Close import dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleImportOverwrite}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-left hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <span className="block text-sm font-bold text-slate-800 group-hover:text-slate-900">
                  Overwrite Everything (Start Fresh)
                </span>
                <span className="block text-xs text-slate-500 mt-1">
                  Replace your current profile with the imported resume data.
                </span>
              </button>
              <button
                type="button"
                onClick={handleImportMerge}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-600 text-left hover:bg-slate-700 hover:border-slate-700 transition-all group"
              >
                <span className="block text-sm font-bold text-white">
                  Merge Content (Append Layout)
                </span>
                <span className="block text-xs text-slate-200 mt-1">
                  Append experience, education, skills, and certifications with new unique IDs.
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartResumeStudio;
