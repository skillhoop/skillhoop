import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Search, 
  Crosshair, 
  MessageSquare, 
  Zap, 
  BookOpen, 
  Loader2,
  CheckCircle,
  Copy,
  Download,
  Eye,
  Pencil,
  Upload,
  Settings,
  ChevronDown,
  Mic,
  Heart,
  Feather,
  ListFilter,
  Target,
  RefreshCw,
  History,
  Info,
  Brain
} from 'lucide-react';

// --- Mocks for External Libraries (Supabase) ---

const supabase = {
  auth: {
    getUser: async () => ({ data: { user: { id: 'mock-user-id' } } })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({
            data: [
              { id: '1', title: 'Senior Product Designer Resume', content: { personalInfo: { name: 'Alex Morgan' } } },
              { id: '2', title: 'Frontend Developer Resume', content: { personalInfo: { name: 'Alex Morgan' } } }
            ],
            error: null
          })
        }),
        single: () => ({
           data: { id: '1', title: 'Senior Product Designer Resume', resume_data: "Mock Resume Content: Experienced Product Designer..." },
           error: null
        })
      })
    })
  })
};

// --- Inline Sub-Components ---

const WorkflowPrompt = ({ message, onDismiss, onAction, actionText }: { message: string, onDismiss: () => void, onAction: (a: string) => void, actionText: string }) => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-fade-in-up border border-white/10">
    <span className="font-medium text-sm">{message}</span>
    <div className="flex gap-2">
        <button onClick={() => onAction('continue')} className="bg-white text-neutral-900 hover:bg-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">{actionText}</button>
        <button onClick={onDismiss} className="text-slate-400 hover:text-white transition-colors"><X size={16}/></button>
    </div>
  </div>
);

// --- SmartCoverLetter Component ---

const SmartCoverLetter = () => {
  const [step, setStep] = useState<'upload' | 'input' | 'strategy' | 'edit'>('upload');
  
  // Workflow state
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvContent, setCvContent] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [editedCoverLetter, setEditedCoverLetter] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  
  // New State for Enhancements
  const [coverLetterConfig, setCoverLetterConfig] = useState({
    tone: 'Professional', // Professional, Casual, Confident, Storyteller
    length: 'Concise'     // Concise, Detailed, Bullet-point
  });
  const [activeDropdown, setActiveDropdown] = useState<'tone' | 'length' | null>(null);

  const [jdKeywords, setJdKeywords] = useState<string[]>([]);
  const [generatedHooks, setGeneratedHooks] = useState<any[]>([]);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  
  // Feature Additions: Brand Voice & Tracker Sync
  const [useBrandVoice, setUseBrandVoice] = useState(false);
  const [isSavingToTracker, setIsSavingToTracker] = useState(false);

  // Dropdown Options Data
  const toneOptions = [
    { value: 'Professional', icon: Briefcase, desc: 'Standard corporate style', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    { value: 'Casual', icon: MessageSquare, desc: 'Modern startup vibe', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    { value: 'Confident', icon: Zap, desc: 'Direct and value-focused', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    { value: 'Storyteller', icon: BookOpen, desc: 'Narrative & personal', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' }
  ];

  const lengthOptions = [
    { value: 'Concise', icon: Feather, desc: 'Short & sweet (< 200 words)', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
    { value: 'Detailed', icon: FileText, desc: 'In-depth explanation', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    { value: 'Bullet-point', icon: ListFilter, desc: 'Scannable lists', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' }
  ];

  // Source Resume state
  const [availableResumes, setAvailableResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

  // Load available resumes
  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setIsLoadingResumes(true);
    try {
      // Mock: in production, fetch user resumes from Supabase
      setAvailableResumes([]);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handleResumeSelect = async (resumeId: string | null) => {
    setSelectedResumeId(resumeId);
    if (!resumeId) {
      setResumeContent('');
      return;
    }
    // Mock resume content setting
    const content = "ALEX MORGAN\nProduct Designer\n\nEXPERIENCE\nSenior Product Designer at TechCorp...";
    setCvContent(content);
  };

  // Mock setResumeContent for logic consistency
  const setResumeContent = (content: string) => {
     // placeholder
  };

  const handleFetchJobDescription = async () => {
    if (!companyUrl.trim()) {
      alert('Please enter a URL first');
      return;
    }
    setIsFetchingUrl(true);
    setTimeout(() => {
        const jd = "JOB TITLE: Senior Product Designer\nCOMPANY: Linear\n\nREQUIREMENTS:\n- 5+ years experience in product design\n- Proficiency in Figma and React\n- Strong understanding of design systems\n\nRESPONSIBILITIES:\n- Lead design initiatives\n- Collaborate with engineering teams...";
        setJobDescription(jd);
        handleSmartPaste(jd); // Trigger smart paste on fetch
        setIsFetchingUrl(false);
    }, 1500);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvContent("Mock content from uploaded file...");
      setStep('input');
    }
  };

  const handleSmartPaste = (text: string) => {
    // Mock extraction logic
    const potentialKeywords = ['React', 'Figma', 'Design Systems', 'Product Strategy', 'Leadership', 'UX Research', 'Agile'];
    const found = potentialKeywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
    setJdKeywords([...new Set(found)]);
  };

  const handleJDChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJobDescription(text);
    // Debounce this in a real app
    handleSmartPaste(text);
  };

  const handleAnalysis = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    
    // Simulate API call to generate analysis AND hooks
    setTimeout(() => {
        // Mock "Deep Dive" Analysis
        const isLinear = companyUrl.toLowerCase().includes('linear') || jobDescription.toLowerCase().includes('linear');
        const detectedValues = isLinear 
            ? ['Craftsmanship', 'Speed', 'Direction'] 
            : ['Innovation', 'User Obsession', 'Integrity'];
            
        // Create the "Deep Dive" connection paragraph
        const valuesDeepDiveDraft = `I see that ${isLinear ? 'Linear' : 'your team'} places a high value on "${detectedValues[0]}". This resonates deeply with me, as I believe that software quality is defined by the attention to detail in the last 10% of execution—a principle I applied relentlessly when redesigning our core navigation system to reduce latency by 150ms.`;

        setAnalysisData({
            jobTitle: 'Senior Product Designer',
            keyRequirements: ['5+ years experience', 'Figma', 'React', 'Design Systems'],
            matchingSkills: ['Product Design', 'Figma', 'React'],
            gaps: ['Design Systems leadership'],
            companyInfo: isLinear ? 'Linear' : 'Target Company',
            companyValues: detectedValues,
            valuesConnection: valuesDeepDiveDraft
        });

        // Generate Hooks based on Tone
        // If Brand Voice is active, prepend a note or modify the hooks slightly to reflect "authenticity"
        const tonePrefix = coverLetterConfig.tone === 'Casual' ? "Hey team," : "Dear Hiring Manager,";
        
        setGeneratedHooks([
            {
                id: 'passion',
                type: useBrandVoice ? 'Brand Voice: Authentic Story' : 'Passion & Story',
                theme: 'orange', // Changed to Orange for Passion
                content: `${tonePrefix} I've been following Linear's journey since the early days. ${useBrandVoice ? "As someone who constantly posts about 'designing for speed' on LinkedIn" : "As a designer who obsesses over craft"}, seeing your commitment to streamlined tools has deeply inspired my own work.`
            },
            {
                id: 'metrics',
                type: 'Impact & Metrics',
                theme: 'sky', 
                content: `${tonePrefix} In my last role, I led a design initiative that boosted user engagement by 20%. I'm writing to bring that same data-driven design focus to Linear's product team.`
            },
            {
                id: 'culture',
                type: 'Culture & Values',
                theme: 'violet', 
                content: `${tonePrefix} "Build for the builders." This core value of Linear resonates with me because I believe the best tools disappear and let the user focus on their work.`
            }
        ]);
        
        setIsAnalyzing(false);
        setStep('strategy');
    }, 1500);
  };

  const handleGenerate = async () => {
    if (!selectedHook) return;
    setIsGenerating(true);
    
    setTimeout(() => {
        // Combine Hook with Body (Mock)
        const hookText = generatedHooks.find(h => h.id === selectedHook)?.content || "";
        
        // Insert Deep Dive Values Paragraph if available
        const valuesSection = analysisData?.valuesConnection 
            ? `\n\n${analysisData.valuesConnection}` 
            : "";

        const bodyText = `\n\nWith over 5 years of experience in product design and a deep proficiency in Figma and React, I am confident in my ability to contribute effectively to your design team.${valuesSection}

In my previous role, I led several design initiatives that resulted in a 20% increase in user engagement. I admire ${analysisData?.companyInfo || 'the company'}'s commitment to streamlined project management and would love to bring my expertise in creating intuitive user interfaces to your company.

Thank you for considering my application. I look forward to the possibility of discussing how my skills align with your team's needs.

Sincerely,
Alex Morgan`;

        const fullLetter = hookText + bodyText;

        setGeneratedCoverLetter(fullLetter);
        setEditedCoverLetter(fullLetter);
        setStep('edit');
        setIsGenerating(false);
        setShowWorkflowPrompt(true);
    }, 1500);
  };

  const handleSaveToTracker = () => {
      setIsSavingToTracker(true);
      setTimeout(() => {
          setIsSavingToTracker(false);
          alert(`Successfully linked this cover letter to your '${analysisData?.jobTitle || 'New Application'}' card in the Job Tracker!`);
      }, 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedCoverLetter);
      alert('Cover letter copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setCvFile(null);
    setCvContent('');
    setCompanyUrl('');
    setJobDescription('');
    setJdKeywords([]);
    setAnalysisData(null);
    setGeneratedCoverLetter('');
    setEditedCoverLetter('');
    setGeneratedHooks([]);
    setSelectedHook(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up p-6 max-w-7xl mx-auto">
      {showWorkflowPrompt && generatedCoverLetter && (
        <WorkflowPrompt
          message="🎉 Cover Letter Generated! Ready to archive?"
          actionText="Archive Documents"
          onDismiss={() => setShowWorkflowPrompt(false)}
          onAction={() => setShowWorkflowPrompt(false)}
        />
      )}

      {/* Main Header Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            
            {/* Source Selection Panel */}
            {step === 'upload' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900">Source Material</h3>
                        <p className="text-sm text-slate-500">Choose the base resume for your cover letter.</p>
                    </div>
                    {selectedResumeId && (
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                            <CheckCircle size={12} /> Active
                        </span>
                    )}
                </div>
                
                <div className="relative">
                     <select
                        value={selectedResumeId || ''}
                        onChange={(e) => handleResumeSelect(e.target.value || null)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all font-medium"
                        disabled={isLoadingResumes}
                    >
                        <option value="">Select a resume from your library...</option>
                        {availableResumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                            {resume.title}
                        </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>
            )}

            {/* Step Wizard Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Progress Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 'upload' ? 'bg-neutral-900 text-white' : 'bg-emerald-500 text-white'}`}>
                            {step === 'upload' ? '1' : <CheckCircle size={14} />}
                        </span>
                        <div className={`h-1 w-8 rounded-full ${step !== 'upload' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 'input' ? 'bg-neutral-900 text-white' : (step === 'strategy' || step === 'edit') ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {step === 'input' ? '2' : (step === 'strategy' || step === 'edit') ? <CheckCircle size={14} /> : '2'}
                        </span>
                        <div className={`h-1 w-8 rounded-full ${step === 'strategy' || step === 'edit' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 'strategy' ? 'bg-neutral-900 text-white' : step === 'edit' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {step === 'strategy' ? '3' : step === 'edit' ? <CheckCircle size={14} /> : '3'}
                        </span>
                         <div className={`h-1 w-8 rounded-full ${step === 'edit' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 'edit' ? 'bg-neutral-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            4
                        </span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {step === 'upload' ? 'Upload' : step === 'input' ? 'Details' : step === 'strategy' ? 'Strategy' : 'Editor'}
                    </span>
                </div>

                <div className="p-8">
                    {/* Step 1: CV Upload */}
                    {step === 'upload' && (
                        <div className="animate-fade-in-up">
                            <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">Let's start with your resume</h3>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-neutral-900/30 hover:bg-slate-50 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.doc,.txt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="cv-upload"
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 group-hover:shadow-md transition-all">
                                        <Upload className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-neutral-900 mb-1">
                                            {cvFile ? cvFile.name : 'Click to upload or drag and drop'}
                                        </h4>
                                        <p className="text-slate-500 text-sm">
                                            PDF, DOCX, DOC, or TXT (Max 10MB)
                                        </p>
                                    </div>
                                    <label
                                        htmlFor="cv-upload"
                                        className="mt-4 bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-neutral-900/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                                    >
                                        {cvFile ? 'Change File' : 'Select Resume'}
                                    </label>
                                </div>
                            </div>
                            {cvFile && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => setStep('input')}
                                    className="bg-neutral-900 text-white px-8 py-3.5 rounded-xl font-bold transition-all hover:bg-slate-800 hover:-translate-y-0.5 inline-flex items-center gap-2 shadow-lg shadow-neutral-900/20"
                                >
                                    Continue to Job Details <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Input */}
                    {step === 'input' && (
                        <div className="animate-fade-in-up space-y-8">
                            {/* Tone & Length Config */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                {/* Header with Dashboard Icon Style */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
                                        <Settings size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-neutral-900">Configuration</h3>
                                        <p className="text-sm text-slate-500">Customize the output style.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Tone Dropdown */}
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            Tone of Voice
                                        </label>
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === 'tone' ? null : 'tone')}
                                            className={`w-full text-left bg-slate-50 border ${activeDropdown === 'tone' ? 'border-neutral-900 ring-1 ring-neutral-900 bg-white' : 'border-slate-200'} text-slate-700 py-3.5 px-4 rounded-xl focus:outline-none transition-all font-medium text-sm flex items-center justify-between group hover:border-slate-300`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const opt = toneOptions.find(o => o.value === coverLetterConfig.tone);
                                                    const Icon = opt?.icon || MessageSquare;
                                                    // Dynamic Color Application
                                                    const colorClass = opt?.text || 'text-slate-500';
                                                    return <Icon size={18} className={`${colorClass} transition-colors`} />;
                                                })()}
                                                <span className="text-slate-900">{coverLetterConfig.tone}</span>
                                            </div>
                                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'tone' ? 'rotate-180 text-neutral-900' : ''}`} />
                                        </button>
                                        
                                        {activeDropdown === 'tone' && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up origin-top">
                                                    {toneOptions.map((opt) => (
                                                        <div 
                                                            key={opt.value}
                                                            onClick={() => {
                                                                setCoverLetterConfig({...coverLetterConfig, tone: opt.value});
                                                                setActiveDropdown(null);
                                                            }}
                                                            className={`p-3 px-4 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 ${coverLetterConfig.tone === opt.value ? 'bg-slate-50' : ''}`}
                                                        >
                                                            <div className={`p-2 rounded-lg ${opt.bg} ${opt.text}`}>
                                                                <opt.icon size={16} />
                                                            </div>
                                                            <div>
                                                                <div className={`font-bold text-sm ${coverLetterConfig.tone === opt.value ? 'text-neutral-900' : 'text-slate-700'}`}>{opt.value}</div>
                                                                <div className="text-xs text-slate-500">{opt.desc}</div>
                                                            </div>
                                                            {coverLetterConfig.tone === opt.value && <CheckCircle2 size={16} className="ml-auto text-neutral-900" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Length Dropdown */}
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            Length & Format
                                        </label>
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === 'length' ? null : 'length')}
                                            className={`w-full text-left bg-slate-50 border ${activeDropdown === 'length' ? 'border-neutral-900 ring-1 ring-neutral-900 bg-white' : 'border-slate-200'} text-slate-700 py-3.5 px-4 rounded-xl focus:outline-none transition-all font-medium text-sm flex items-center justify-between group hover:border-slate-300`}
                                        >
                                            <div className="flex items-center gap-2">
                                                 {(() => {
                                                    const opt = lengthOptions.find(o => o.value === coverLetterConfig.length);
                                                    const Icon = opt?.icon || FileText;
                                                    // Dynamic Color Application
                                                    const colorClass = opt?.text || 'text-slate-500';
                                                    return <Icon size={18} className={`${colorClass} transition-colors`} />;
                                                })()}
                                                <span className="text-slate-900">{coverLetterConfig.length}</span>
                                            </div>
                                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'length' ? 'rotate-180 text-neutral-900' : ''}`} />
                                        </button>
                                        
                                        {activeDropdown === 'length' && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up origin-top">
                                                    {lengthOptions.map((opt) => (
                                                        <div 
                                                            key={opt.value}
                                                            onClick={() => {
                                                                setCoverLetterConfig({...coverLetterConfig, length: opt.value});
                                                                setActiveDropdown(null);
                                                            }}
                                                            className={`p-3 px-4 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 ${coverLetterConfig.length === opt.value ? 'bg-slate-50' : ''}`}
                                                        >
                                                            <div className={`p-2 rounded-lg ${opt.bg} ${opt.text}`}>
                                                                <opt.icon size={16} />
                                                            </div>
                                                            <div>
                                                                <div className={`font-bold text-sm ${coverLetterConfig.length === opt.value ? 'text-neutral-900' : 'text-slate-700'}`}>{opt.value}</div>
                                                                <div className="text-xs text-slate-500">{opt.desc}</div>
                                                            </div>
                                                            {coverLetterConfig.length === opt.value && <CheckCircle2 size={16} className="ml-auto text-neutral-900" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Brand Voice Sync Module (Enhanced) */}
                                <div className={`p-5 rounded-2xl border transition-all ${useBrandVoice ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-start gap-4">
                                        {/* Dashboard Icon Style for Mic - Matches "Brand Score" widget aesthetic */}
                                        <div className={`p-2.5 rounded-xl transition-colors ${useBrandVoice ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                            <Mic size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`font-bold text-base ${useBrandVoice ? 'text-indigo-900' : 'text-slate-900'}`}>Brand Voice Sync</h4>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={useBrandVoice} 
                                                        onChange={(e) => setUseBrandVoice(e.target.checked)} 
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                                                </label>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${useBrandVoice ? 'text-indigo-700' : 'text-slate-500'}`}>
                                                Allow AI to analyze your recent LinkedIn posts and Personal Brand module to write in your authentic voice, rather than a generic robotic tone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 mb-2">Company Website or Job URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={companyUrl}
                                            onChange={(e) => setCompanyUrl(e.target.value)}
                                            placeholder="https://company.com/careers/role"
                                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all"
                                        />
                                        <button
                                            onClick={handleFetchJobDescription}
                                            disabled={!companyUrl.trim() || isFetchingUrl}
                                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            {isFetchingUrl ? <Loader2 className="animate-spin w-4 h-4"/> : <Search className="w-4 h-4"/>}
                                            <span className="hidden sm:inline">Fetch</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold text-neutral-900">Job Description</label>
                                        {jdKeywords.length > 0 && (
                                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <Sparkles size={10} /> Smart Paste Active
                                            </span>
                                        )}
                                    </div>
                                    <textarea
                                        value={jobDescription}
                                        onChange={handleJDChange}
                                        placeholder="Paste the full job description here..."
                                        rows={8}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none resize-none transition-all text-sm leading-relaxed"
                                    />
                                    
                                    {/* Smart Paste Keywords Display */}
                                    {jdKeywords.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2 animate-fade-in-up">
                                            <span className="text-xs font-bold text-slate-400 py-1">Detected Keywords:</span>
                                            {jdKeywords.map((kw, i) => (
                                                <span key={i} className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium border border-teal-100">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleAnalysis}
                                disabled={!jobDescription.trim() || isAnalyzing}
                                className="w-full bg-neutral-900 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/20"
                            >
                                {isAnalyzing ? <><Loader2 className="animate-spin w-4 h-4"/> Analyzing & Generating Strategies...</> : <><Brain className="w-4 h-4"/> Analyze & Select Strategy</>}
                            </button>
                        </div>
                    )}

                    {/* Step 3: Strategy (Hooks) */}
                    {step === 'strategy' && (
                        <div className="animate-fade-in-up space-y-8">
                            {/* Analysis Summary */}
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 min-w-[200px] flex-1">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-700">
                                        <Target size={16} />
                                        <span className="text-xs font-bold uppercase">Role Match</span>
                                    </div>
                                    <div className="font-bold text-neutral-900">{analysisData?.jobTitle}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 min-w-[200px] flex-1">
                                    <div className="flex items-center gap-2 mb-2 text-blue-700">
                                        <Crosshair size={16} />
                                        <span className="text-xs font-bold uppercase">Top Skills</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {analysisData?.matchingSkills?.slice(0,3).map((s: string, i: number) => (
                                            <span key={i} className="text-xs bg-white/60 px-2 py-1 rounded text-blue-800 font-medium">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                {/* NEW: Deep Dive Values Card */}
                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 min-w-[200px] flex-1">
                                    <div className="flex items-center gap-2 mb-2 text-purple-700">
                                        <Heart size={16} />
                                        <span className="text-xs font-bold uppercase">Values Detected</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-1">
                                        {analysisData?.companyValues?.map((v: string, i: number) => (
                                            <span key={i} className="text-xs bg-white/60 px-2 py-1 rounded text-purple-800 font-medium">{v}</span>
                                        ))}
                                    </div>
                                    <div className="text-[10px] text-purple-600/70 italic flex items-center gap-1">
                                        <Sparkles size={10} /> "Deep Dive" enabled
                                    </div>
                                </div>
                            </div>

                            {/* Hook Selection */}
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-4 text-center">Choose Your Opening Strategy</h3>
                                <p className="text-slate-500 text-sm text-center mb-8 max-w-lg mx-auto">
                                    We've generated three different opening hooks based on your {coverLetterConfig.tone.toLowerCase()} tone preference. Select the one that fits best.
                                </p>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {generatedHooks.map((hook) => {
                                        // Pastel Theme Logic for Hooks
                                        let themeClasses = 'bg-white border-slate-100 hover:bg-slate-50';
                                        let badgeClasses = 'bg-slate-100 text-slate-500';
                                        
                                        if (hook.theme === 'orange') { // Updated to orange
                                            themeClasses = selectedHook === hook.id 
                                                ? 'bg-orange-50 border-orange-500 shadow-md' 
                                                : 'bg-white border-orange-100 hover:bg-orange-50';
                                            badgeClasses = 'bg-orange-100 text-orange-700';
                                        } else if (hook.theme === 'sky') {
                                             themeClasses = selectedHook === hook.id 
                                                ? 'bg-sky-50 border-sky-500 shadow-md' 
                                                : 'bg-white border-sky-100 hover:bg-sky-50';
                                            badgeClasses = 'bg-sky-100 text-sky-700';
                                        } else if (hook.theme === 'violet') {
                                             themeClasses = selectedHook === hook.id 
                                                ? 'bg-violet-50 border-violet-500 shadow-md' 
                                                : 'bg-white border-violet-100 hover:bg-violet-50';
                                            badgeClasses = 'bg-violet-100 text-violet-700';
                                        }

                                        return (
                                        <div 
                                            key={hook.id}
                                            onClick={() => setSelectedHook(hook.id)}
                                            className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer group ${themeClasses}`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${badgeClasses}`}>
                                                    {hook.type}
                                                </div>
                                                {selectedHook === hook.id && <CheckCircle size={20} className="text-neutral-900" />}
                                            </div>
                                            <p className={`text-sm leading-relaxed font-serif ${selectedHook === hook.id ? 'text-neutral-900 font-medium' : 'text-slate-600'}`}>
                                                "{hook.content}"
                                            </p>
                                        </div>
                                    )})}
                                </div>
                            </div>

                             <button
                                onClick={handleGenerate}
                                disabled={!selectedHook || isGenerating}
                                className="w-full bg-neutral-900 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/20"
                            >
                                {isGenerating ? <><Loader2 className="animate-spin w-4 h-4"/> writing Full Draft...</> : <><Pencil className="w-4 h-4"/> Generate Full Cover Letter</>}
                            </button>
                        </div>
                    )}

                    {/* Step 4: Editor */}
                    {step === 'edit' && (
                        <div className="animate-fade-in-up space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-neutral-900">Review & Edit</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="text-slate-500 hover:text-neutral-900 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        {showPreview ? <><Pencil size={14}/> Edit</> : <><Eye size={14}/> Preview</>}
                                    </button>
                                </div>
                            </div>

                            {showPreview ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm min-h-[400px] prose prose-slate max-w-none">
                                    <div className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed">
                                        {editedCoverLetter}
                                    </div>
                                </div>
                            ) : (
                                <textarea
                                    value={editedCoverLetter}
                                    onChange={(e) => setEditedCoverLetter(e.target.value)}
                                    className="w-full h-[400px] p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-serif leading-relaxed focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all resize-y"
                                />
                            )}

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button 
                                    onClick={handleSaveToTracker}
                                    disabled={isSavingToTracker}
                                    className="flex-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSavingToTracker ? <Loader2 className="animate-spin w-4 h-4"/> : <Briefcase size={16} />} 
                                    Save to Tracker
                                </button>
                                <button onClick={handleCopy} className="flex-1 bg-neutral-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                    <Copy size={16} /> Copy Text
                                </button>
                                <button className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <Download size={16} /> Download
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Sidebar: Context & Actions */}
        <div className="space-y-6">
            {/* Context Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Info size={16} className="text-slate-400"/> Context
                </h4>
                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Resume</span>
                        <div className="font-medium text-sm text-slate-700 truncate">{cvFile ? cvFile.name : selectedResumeId ? 'Library Resume' : 'Not selected'}</div>
                    </div>
                     <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Job Role</span>
                        <div className="font-medium text-sm text-slate-700 truncate">{analysisData?.jobTitle || 'Pending Analysis...'}</div>
                    </div>
                </div>
            </div>

            {/* Quality Score Widget (Visible on Edit) */}
            {step === 'edit' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-neutral-900">Match Score</h4>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-sm">94/100</span>
                    </div>
                    <div className="space-y-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Tone</span>
                            <span className="text-slate-900 font-medium">{coverLetterConfig.tone}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 w-[95%] h-full rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Keywords</span>
                            <span className="text-slate-900 font-medium">High Match</span>
                        </div>
                         <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 w-[88%] h-full rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h4 className="font-bold text-neutral-900 mb-4">Actions</h4>
                <div className="space-y-2">
                    <button onClick={handleReset} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-neutral-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2">
                        <RefreshCw size={14} /> Start New
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-neutral-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2">
                        <History size={14} /> View History
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCoverLetter;

