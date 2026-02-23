import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Layout,
  Users,
  X,
  ArrowRight,
  Sparkles,
  FileText,
  MessageSquare,
  Github,
  Linkedin,
  Globe,
  Bot,
  Smartphone,
  CheckCircle2,
  Palette,
  Monitor,
  Tablet,
  Mail,
  Rocket,
  Upload,
  Check,
  Edit3,
  Trash2,
  Link2,
  Loader2,
  ChevronRight,
  Share2,
  Copy,
  ExternalLink,
  Settings,
  Eye,
  Plus,
  ImageIcon,
  Twitter,
} from 'lucide-react';

// --- Mocks & Helpers ---

const useNavigate = () => (path: string) => console.log('Navigating to', path);

const WorkflowTracking = {
  _context: { workflowId: 'skill-development-advancement' } as any,
  getWorkflow: (id: string) => {
    if (id === 'skill-development-advancement') {
      return { steps: [{ id: 'showcase-portfolio', status: 'not-started' }], isActive: true, progress: 30 };
    }
    if (id === 'personal-brand-job-discovery') {
      return { steps: [{ id: 'showcase-brand-portfolio', status: 'not-started' }], isActive: true, progress: 30 };
    }
    return { steps: [], isActive: false, progress: 0 };
  },
  updateStepStatus: (workflowId: string, stepId: string, status: string, data?: any) => {
    console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
  },
  getWorkflowContext: () => WorkflowTracking._context,
  setWorkflowContext: (context: any) => {
    console.log('Workflow Context Set:', context);
    WorkflowTracking._context = { ...WorkflowTracking._context, ...context };
  },
  completeWorkflow: (id: string) => console.log(`Workflow ${id} completed`),
};

const UpgradeModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-600">
          <Sparkles size={24} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900">Upgrade to Pro</h3>
        <p className="text-slate-600 mb-6">Unlock AI-powered portfolio generation, custom domains, and unlimited projects.</p>
        <button onClick={onClose} className="w-full bg-slate-600 text-white py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

const FeatureGate = ({ children }: any) => <>{children}</>;

// --- Main Component ---

const AICareerPortfolio = () => {
  const navigate = useNavigate();

  // Workflow state (for tracking only; UI lives in dashboard Workflow tab)
  const [workflowContext, setWorkflowContext] = useState<any>(null);

  const [step, setStep] = useState<'onboarding' | 'import' | 'template' | 'editor' | 'preview' | 'publish'>('onboarding');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [portfolioBlocks, setPortfolioBlocks] = useState<any[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'uploading' | 'processing' | 'success' | ''>('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [seoSettings, setSeoSettings] = useState({ title: '', description: '', keywords: '' });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check for workflow context on mount
  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    setWorkflowContext(context);

    // Simulate pre-populating data based on workflow context
    if (context?.workflowId === 'skill-development-advancement') {
      if (context.certifications && context.certifications.length > 0) {
        const certBlock = {
          id: Date.now(),
          type: 'certifications',
          title: 'Certifications',
          content: context.certifications.map((c: any) => `${c.name} - ${c.issuer}`).join('\n'),
          position: portfolioBlocks.length,
          visible: true,
        };
        setPortfolioBlocks((prev) => [...prev, certBlock]);
      }
    }
  }, []);

  // Track workflow completion when portfolio is published
  useEffect(() => {
    if (portfolioUrl && workflowContext) {
      if (['skill-development-advancement', 'personal-brand-job-discovery'].includes(workflowContext.workflowId)) {
        WorkflowTracking.updateStepStatus(workflowContext.workflowId, 'showcase-portfolio', 'completed', {
          portfolioUrl: portfolioUrl,
        });
      }
    }
  }, [portfolioUrl, workflowContext]);

  const templates = [
    { id: 1, name: 'Executive Professional', category: 'Corporate', description: 'Perfect for executives and senior professionals', gradient: 'from-blue-500 to-slate-600' },
    { id: 2, name: 'Developer Portfolio', category: 'Tech', description: 'Ideal for software developers and engineers', gradient: 'from-gray-600 to-gray-800' },
    { id: 3, name: 'Creative Showcase', category: 'Creative', description: 'Great for designers and creative professionals', gradient: 'from-purple-500 to-pink-500' },
    { id: 4, name: 'Clean Minimal', category: 'Minimalist', description: 'Simple and clean for any professional', gradient: 'from-gray-400 to-gray-600' },
  ];

  const blockLibrary = [
    { id: 'header', type: 'Header', icon: <Users className="w-5 h-5" />, description: 'Name, title, and hero image' },
    { id: 'about', type: 'About', icon: <FileText className="w-5 h-5" />, description: 'Professional summary and bio' },
    { id: 'projects', type: 'Projects', icon: <Briefcase className="w-5 h-5" />, description: 'Portfolio showcase' },
    { id: 'skills', type: 'Skills', icon: <Rocket className="w-5 h-5" />, description: 'Technical and soft skills' },
    { id: 'experience', type: 'Experience', icon: <Briefcase className="w-5 h-5" />, description: 'Work history and achievements' },
    { id: 'testimonials', type: 'Testimonials', icon: <MessageSquare className="w-5 h-5" />, description: 'Client recommendations' },
    { id: 'contact', type: 'Contact', icon: <Mail className="w-5 h-5" />, description: 'Contact information' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setImportStatus('uploading');
      setTimeout(() => {
        setImportStatus('processing');
        setTimeout(() => {
          setImportStatus('success');
        }, 2000);
      }, 1000);
    }
  };

  const handleGeneratePortfolio = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPortfolioBlocks(
        blockLibrary.map((block, index) => ({
          id: Date.now() + index,
          type: block.type,
          title: block.type,
          content: `Sample ${block.type} content`,
          position: index,
          visible: true,
        })),
      );
      setPortfolioUrl('https://portfolio.skillhoop.com/johndoe');
      setIsGenerating(false);
      setStep('editor');
    }, 3000);
  };

  const handleAddBlock = (block: any) => {
    const newBlock = {
      id: Date.now(),
      type: block.type,
      title: block.type,
      content: `Sample ${block.type} content`,
      position: portfolioBlocks.length,
      visible: true,
    };
    setPortfolioBlocks([...portfolioBlocks, newBlock]);
  };

  const handlePublish = () => {
    setStep('publish');
    if (!portfolioUrl) setPortfolioUrl(`https://portfolio.skillhoop.com/${Date.now()}`);
  };

  const getDeviceSize = () => (previewDevice === 'mobile' ? 'max-w-xs' : previewDevice === 'tablet' ? 'max-w-md' : 'max-w-4xl');

  const getProgressWidth = () => {
    switch (step) {
      case 'onboarding':
        return '16.67%';
      case 'import':
        return '33.33%';
      case 'template':
        return '50%';
      case 'editor':
        return '66.67%';
      case 'preview':
        return '83.33%';
      case 'publish':
        return '100%';
      default:
        return '0%';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portfolioUrl);
    alert('Copied to clipboard!');
  };

  const onboardingCards = [
    { icon: Upload, title: 'Import Data', desc: 'Upload resume or connect LinkedIn', bg: 'bg-blue-50', fg: 'text-blue-600' },
    { icon: Palette, title: 'Choose Style', desc: 'Professional templates', bg: 'bg-purple-50', fg: 'text-purple-600' },
    { icon: Sparkles, title: 'AI Generation', desc: 'Auto-write bio & projects', bg: 'bg-emerald-50', fg: 'text-emerald-600' },
  ];

  return (
    <FeatureGate requiredTier="ultimate">
      <div className="space-y-8 animate-fade-in-up">
        {/* Progress Indicator */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Portfolio Creation Progress</h2>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-neutral-700 to-neutral-900 h-2 rounded-full transition-all duration-500" style={{ width: getProgressWidth() }} />
          </div>
        </div>

        {step === 'onboarding' && (
          <div className="max-w-5xl mx-auto py-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm mb-8">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                <Globe size={24} />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-6 tracking-tight">Build Your Professional Portfolio in Minutes</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
              Our AI analyzes your resume and professional data to create a stunning, personalized portfolio website.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
              {onboardingCards.map((card, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-6 ${card.fg}`}>
                    <card.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{card.title}</h3>
                  <p className="text-slate-500">{card.desc}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setStep('import')} className="bg-neutral-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto">
              Start Building Portfolio <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 'import' && (
          <div className="max-w-5xl mx-auto py-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4 text-center">Import Your Professional Data</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Upload Resume</h3>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50/10 transition-all h-[320px] flex flex-col justify-center items-center">
                  <FileText size={32} className="text-slate-400 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Drop your resume here</h3>
                  <input type="file" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                  <label htmlFor="resume-upload" className="bg-white border border-slate-200 px-6 py-2.5 rounded-lg font-bold cursor-pointer shadow-sm mb-4">
                    Choose File
                  </label>
                  {importStatus === 'uploading' && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <Loader2 className="animate-spin" /> Uploading...
                    </div>
                  )}
                  {importStatus === 'processing' && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Bot className="animate-bounce" /> Analyzing...
                    </div>
                  )}
                  {importStatus === 'success' && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 /> Done!
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-center gap-4">
                <h3 className="text-xl font-bold mb-4">Connect Profiles</h3>
                <button className="w-full bg-[#0077b5] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3">
                  <Linkedin size={20} /> Import from LinkedIn
                </button>
                <button className="w-full bg-[#24292e] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3">
                  <Github size={20} /> Import from GitHub
                </button>
                <div className="relative py-4">
                  <span className="bg-white px-2 text-xs font-bold text-slate-400 uppercase relative z-10">Or link manually</span>
                  <div className="absolute inset-0 flex items-center border-t border-slate-200" />
                </div>
                <div className="relative">
                  <input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="https://yourportfolio.com" />
                  <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                </div>
              </div>
            </div>
            <div className="flex justify-center pt-8">
              <button onClick={() => setStep('template')} className="bg-neutral-900 text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3">
                Continue to Templates <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'template' && (
          <div className="max-w-6xl mx-auto py-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">Choose Your Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`bg-white rounded-2xl p-4 cursor-pointer border transition-all ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-neutral-900 scale-105 shadow-lg' : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`aspect-[4/3] bg-gradient-to-br ${template.gradient} rounded-xl mb-4 flex items-center justify-center relative`}>
                    <Layout className="w-8 h-8 text-white/80" />
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 bg-neutral-900 text-white p-1 rounded-full">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">{template.category}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-8">
              <button
                onClick={handleGeneratePortfolio}
                disabled={isGenerating || !selectedTemplate}
                className={`px-10 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center gap-3 ${!selectedTemplate ? 'bg-slate-100 text-slate-400' : 'bg-neutral-900 text-white'}`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles /> Generate My Portfolio
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm">
              <div className="p-4 border-b border-slate-100 font-bold bg-slate-50 rounded-t-2xl">Blocks</div>
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {blockLibrary.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => handleAddBlock(block)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 hover:border-neutral-900 hover:shadow-md transition-all flex items-center gap-3 text-left"
                  >
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">{block.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{block.type}</h4>
                    </div>
                    <Plus className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900">
                  <Sparkles size={14} /> AI Copilot
                </div>
                <button className="w-full bg-white text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-50">Auto-Generate Content</button>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-2 flex justify-center gap-2 shadow-sm">
                {[
                  { id: 'mobile', icon: Smartphone },
                  { id: 'tablet', icon: Tablet },
                  { id: 'desktop', icon: Monitor },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setPreviewDevice(d.id as any)}
                    className={`p-2 rounded-md ${previewDevice === d.id ? 'bg-slate-100 text-neutral-900' : 'text-slate-400'}`}
                  >
                    <d.icon size={16} />
                  </button>
                ))}
              </div>
              <div className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden relative shadow-inner flex flex-col items-center p-8 overflow-y-auto">
                <div className={`bg-white shadow-2xl min-h-[800px] w-full transition-all duration-300 ${getDeviceSize()} flex flex-col`}>
                  <div className="w-full h-48 bg-gradient-to-r from-neutral-900 to-slate-800 flex items-center justify-center text-white text-center">
                    <div>
                      <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 border-4 border-white/20" />
                      <h1 className="text-2xl font-bold">John Doe</h1>
                    </div>
                  </div>
                  <div className="p-8 space-y-4 flex-1">
                    {portfolioBlocks.length === 0 ? (
                      <p className="text-center text-slate-400 mt-10">Add blocks to start...</p>
                    ) : (
                      portfolioBlocks.map((block) => (
                        <div key={block.id} className="group border border-transparent hover:border-slate-200 hover:bg-slate-50/30 rounded-lg p-4 relative">
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                            <Edit3 size={14} className="cursor-pointer" />
                            <Trash2 size={14} className="cursor-pointer text-red-500" />
                          </div>
                          <h3 className="font-bold text-lg mb-2">{block.title}</h3>
                          <div className="text-slate-600 text-sm whitespace-pre-wrap">{block.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Settings size={20} /> Settings
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">URL</label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <span className="px-3 py-2 text-sm text-slate-500 bg-slate-100 border-r">skillhoop.com/</span>
                    <input className="bg-transparent px-2 text-sm w-full" value="johndoe" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">SEO Title</label>
                  <input className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Page Title" />
                </div>
                <div className="mt-auto pt-6 space-y-3">
                  <button onClick={() => setStep('preview')} className="w-full bg-white border border-slate-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Eye size={16} /> Preview
                  </button>
                  <button onClick={handlePublish} className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Rocket size={16} /> Publish Live
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold">Ready to Publish?</h2>
              <div className="flex gap-3">
                <button onClick={() => setStep('editor')} className="bg-white border px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                  <Edit3 size={16} /> Edit
                </button>
                <button onClick={handlePublish} className="bg-neutral-900 text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2">
                  <Rocket size={16} /> Publish Now
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 border rounded-2xl overflow-hidden p-8 flex justify-center overflow-y-auto">
              <div className="bg-white shadow-2xl w-full max-w-4xl min-h-full">
                <div className="bg-neutral-900 text-white py-16 text-center">
                  <h1 className="text-4xl font-bold mb-2">Alex Morgan</h1>
                  <p className="text-xl opacity-80">Senior Product Designer</p>
                </div>
                <div className="p-12 space-y-12">
                  <section>
                    <h2 className="text-2xl font-bold mb-4">About Me</h2>
                    <p>Passionate designer focused on user-centered experiences.</p>
                  </section>
                  <section>
                    <h2 className="text-2xl font-bold mb-4">Work</h2>
                    <div className="grid grid-cols-2 gap-6">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-slate-100 aspect-video rounded-xl flex items-center justify-center">
                          <ImageIcon size={32} className="text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'publish' && (
          <div className="max-w-3xl mx-auto py-16 text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-blob">
              <Check size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Portfolio Published!</h2>
            <div className="bg-white rounded-2xl border p-8 shadow-sm mb-12 flex items-center gap-3 flex-wrap">
              <Globe className="text-slate-400" />
              <input value={portfolioUrl} readOnly className="flex-1 text-lg font-medium outline-none min-w-[240px]" />
              <button onClick={copyToClipboard} className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-sm flex gap-2">
                <Copy size={16} /> Copy
              </button>
              <a href={portfolioUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-bold text-sm flex gap-2">
                <ExternalLink size={16} /> Open
              </a>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={() => setStep('editor')} className="px-6 py-4 border rounded-xl font-bold flex gap-2">
                <Edit3 size={18} /> Back to Editor
              </button>
              <button className="px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold flex gap-2">
                <Share2 size={18} /> Share on LinkedIn
              </button>
            </div>
          </div>
        )}

        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </div>
    </FeatureGate>
  );
};

// --- Export Wrapper ---

const CareerPortfolioModule = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <AICareerPortfolio />
    </div>
  );
};

export default CareerPortfolioModule;

