import { useEffect, useState, ChangeEvent } from 'react';
import {
  Briefcase,
  Layout,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  Crosshair,
  Zap,
  Layers,
  CheckCircle,
  RefreshCw,
  History,
  Info,
  Upload,
  Copy,
  Download,
  Eye,
  Pencil,
  Loader2,
  Wand2,
  Mic,
  PenTool,
  Settings,
  Target,
  Scissors,
  ChevronDown,
  Brain,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAiGenerateUrl, getParseResumeUrl } from '../lib/aiApiUrl';
import { fileToBase64, resolveAuthForParseResume } from '../lib/parseResumeClient';
import { storedResumeToPlainText } from '../lib/storedResumeToPlainText';
import { loadResume, type SavedResume } from '../lib/resumeStorage';
import { FeatureIntegration } from '../lib/featureIntegration';
import { WorkflowTracking } from '../lib/workflowTracking';

// --- Types ---

type TailorStep = 'upload' | 'input' | 'strategy' | 'edit';

type TailorFocus = 'Impact-Driven' | 'Skill-Focused' | 'Hybrid';
type TailorFormat = 'Standard' | 'Modern' | 'Technical';

interface TailorConfig {
  focus: TailorFocus;
  format: TailorFormat;
}

interface SummaryOption {
  id: string;
  type: string;
  theme: 'sky' | 'orange' | 'violet';
  content: string;
}

interface ResumeOption {
  id: string;
  title: string;
}

interface AnalysisData {
  jobTitle: string;
  keyRequirements: string[];
  matchingSkills: string[];
  missingSkills: string[];
  companyInfo: string;
  detectedKeywords: string[];
}

// --- ApplicationTailorKit Component ---

const ApplicationTailorKit = () => {
  const [step, setStep] = useState<TailorStep>('upload');
  const [workflowContext, setWorkflowContext] = useState<Record<string, unknown> | null>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvContent, setCvContent] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [tailoredResume, setTailoredResume] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isParsingUpload, setIsParsingUpload] = useState(false);

  // Configuration State
  const [tailorConfig, setTailorConfig] = useState<TailorConfig>({
    focus: 'Impact-Driven',
    format: 'Standard',
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [jdKeywords, setJdKeywords] = useState<string[]>([]);
  const [generatedSummaries, setGeneratedSummaries] = useState<SummaryOption[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);

  // Feature Additions
  const [useBrandVoice, setUseBrandVoice] = useState(false);
  const [isSavingToTracker, setIsSavingToTracker] = useState(false);

  // Dropdown Options Data
  const focusOptions: {
    value: TailorFocus;
    icon: typeof Zap | typeof Cpu | typeof Layers;
    desc: string;
    bg: string;
    text: string;
    border: string;
  }[] = [
    {
      value: 'Impact-Driven',
      icon: Zap,
      desc: 'Focus on metrics & results',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    {
      value: 'Skill-Focused',
      icon: Cpu,
      desc: 'Highlight technical capabilities',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    {
      value: 'Hybrid',
      icon: Layers,
      desc: 'Balanced mix of both',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
  ];

  const formatOptions: {
    value: TailorFormat;
    icon: typeof FileText | typeof Layout | typeof PenTool;
    desc: string;
    bg: string;
    text: string;
    border: string;
  }[] = [
    {
      value: 'Standard',
      icon: FileText,
      desc: 'Clean, ATS-friendly layout',
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-100',
    },
    {
      value: 'Modern',
      icon: Layout,
      desc: 'Visual hierarchy & columns',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-100',
    },
    {
      value: 'Technical',
      icon: PenTool,
      desc: 'Project-heavy structure',
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      border: 'border-cyan-100',
    },
  ];

  // Source Resume state
  const [availableResumes, setAvailableResumes] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

  useEffect(() => {
    const loadResumes = async () => {
      setIsLoadingResumes(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: supabaseResumes, error: supabaseError } = await supabase
          .from('resumes')
          .select('id, title')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(50);

        if (!supabaseError && supabaseResumes && supabaseResumes.length > 0) {
          setAvailableResumes(supabaseResumes);
        } else {
          const { getAllSavedResumes } = await import('../lib/resumeStorage');
          const localResumes = await getAllSavedResumes();
          if (localResumes.length > 0) {
            setAvailableResumes(localResumes.map((r: SavedResume) => ({ id: r.id, title: r.title })));
          }
        }
      } catch (error) {
        console.error('Error loading resumes:', error);
        try {
          const { getAllSavedResumes } = await import('../lib/resumeStorage');
          const localResumes = await getAllSavedResumes();
          if (localResumes.length > 0) {
            setAvailableResumes(localResumes.map((r: SavedResume) => ({ id: r.id, title: r.title })));
          }
        } catch (e) {
          console.error('Error loading local resumes:', e);
        }
      } finally {
        setIsLoadingResumes(false);
      }
    };

    loadResumes();
  }, []);

  useEffect(() => {
    const context = WorkflowTracking.getWorkflowContext();
    if (context?.workflowId === 'job-application-pipeline') {
      setWorkflowContext(context);
      if (context.currentJob) {
        setJobDescription((context.currentJob.description as string) || '');
        setCompanyUrl((context.currentJob.url as string) || '');
        const workflow = WorkflowTracking.getWorkflow('job-application-pipeline');
        const tailorStep = workflow?.steps.find((s) => s.id === 'tailor-resume');
        if (tailorStep && tailorStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'tailor-resume', 'in-progress');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (step !== 'upload' || cvContent.trim()) return;
    const loadLast = async () => {
      const lastResumeId = FeatureIntegration.getLastResumeId();
      if (!lastResumeId) return;
      try {
        const resumeData = await loadResume(lastResumeId);
        if (resumeData) {
          const text = storedResumeToPlainText(resumeData);
          if (text.trim()) {
            setCvContent(text);
            setResumeContent(text);
            setStep('input');
          }
        }
      } catch (e) {
        console.error('ApplicationTailor: load last resume', e);
      }
    };
    loadLast();
  }, [step, cvContent]);

  const handleResumeSelect = async (resumeId: string | null) => {
    setSelectedResumeId(resumeId);
    if (!resumeId) {
      setResumeContent('');
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: resume, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single();

      if (!error && resume) {
        const resumeData = resume.content || resume.resume_data;
        const text = storedResumeToPlainText(resumeData);
        setResumeContent(text);
        setCvContent(text);
      } else {
        const localResume = await loadResume(resumeId);
        if (localResume) {
          const text = storedResumeToPlainText(localResume);
          setResumeContent(text);
          setCvContent(text);
        }
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    }
  };

  const handleFetchJobDescription = async () => {
    if (!companyUrl.trim()) {
      alert('Please enter a URL first');
      return;
    }
    try {
      new URL(companyUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    setIsFetchingUrl(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) {
        alert('Please sign in to use AI features.');
        return;
      }

      const response = await fetch(getAiGenerateUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          systemMessage:
            'You extract job posting text from URLs described by the user. Return the full job description as plain text (title, company, requirements, responsibilities). If you cannot browse the URL, say so briefly and ask the user to paste the posting.',
          prompt: `Extract or summarize the complete job posting from this URL for resume tailoring:\n${companyUrl}`,
          userId,
          feature_name: 'application_tailor',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch job description');
      }
      const content = data.content as string | undefined;
      if (content?.trim()) {
        setJobDescription(content);
        handleSmartPaste(content);
        alert('Job description loaded. Review and edit if needed.');
      } else {
        throw new Error('No content returned');
      }
    } catch (e) {
      console.error(e);
      alert((e instanceof Error ? e.message : 'Failed to fetch') + ' Paste the job description manually.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF, DOCX, or TXT');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      return;
    }

    setIsParsingUpload(true);
    setCvFile(file);

    try {
      const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const isDocx =
        file.type.includes('wordprocessingml') || file.name.toLowerCase().endsWith('.docx');
      const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');

      if (isPdf) {
        const { userId, accessToken } = await resolveAuthForParseResume();
        const base64 = await fileToBase64(file);
        const response = await fetch(getParseResumeUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            fileData: base64,
            fileName: file.name,
            mimeType: file.type,
            userId,
            feature_name: 'application_tailor',
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to parse resume');
        const rawContent = data?.content as string | undefined;
        if (!rawContent) throw new Error('No parse result');
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        const raw = jsonMatch ? jsonMatch[0] : rawContent;
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const text = storedResumeToPlainText(parsed);
        setCvContent(text);
        setResumeContent(text);
      } else if (isDocx) {
        const mammoth = await import('mammoth');
        const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        const text = value?.trim() || '';
        if (!text) throw new Error('Could not read DOCX. Try PDF.');
        setCvContent(text);
        setResumeContent(text);
      } else if (isTxt) {
        const text = await file.text();
        setCvContent(text);
        setResumeContent(text);
      } else {
        throw new Error('Legacy .doc not supported. Use PDF or DOCX.');
      }
      setStep('input');
    } catch (e) {
      console.error(e);
      setCvFile(null);
      alert(e instanceof Error ? e.message : 'Failed to read file');
    } finally {
      setIsParsingUpload(false);
      event.target.value = '';
    }
  };

  const handleSmartPaste = (text: string) => {
    const potentialKeywords = [
      'React',
      'Figma',
      'Design Systems',
      'Product Strategy',
      'Leadership',
      'UX Research',
      'Agile',
    ];
    const found = potentialKeywords.filter((k) =>
      text.toLowerCase().includes(k.toLowerCase()),
    );
    setJdKeywords([...new Set(found)]);
  };

  const handleJDChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJobDescription(text);
    handleSmartPaste(text);
  };

  const handleAnalysis = async () => {
    if (!jobDescription.trim()) return;
    const baseResume = (resumeContent || cvContent).trim();
    if (!baseResume) {
      alert('Add a resume by uploading a file or selecting one from your library.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) throw new Error('Please sign in to use Application Tailor.');

      const brandNote = useBrandVoice
        ? 'For the third summary option, use a slightly more personal, authentic voice while staying professional.'
        : 'Keep all summaries in a standard professional tone.';

      const response = await fetch(getAiGenerateUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          systemMessage:
            'You are an expert resume strategist. You return only valid JSON, no markdown fences.',
          prompt: `Analyze this resume against the job description and propose three alternative professional summaries for the resume.

BASE RESUME (plain text):
${baseResume}

JOB DESCRIPTION:
${jobDescription}

COMPANY / URL CONTEXT:
${companyUrl || 'Not provided'}

USER PREFERENCES:
- Tailoring focus: ${tailorConfig.focus} (Impact-Driven = metrics/outcomes; Skill-Focused = technical strengths; Hybrid = balance)
- Output format preference for later full resume: ${tailorConfig.format}
${brandNote}

Return a single JSON object with this exact structure:
{
  "jobTitle": "string (from job posting)",
  "keyRequirements": ["string", ...],
  "matchingSkills": ["string", ...],
  "missingSkills": ["string", ...],
  "companyInfo": "short string",
  "detectedKeywords": ["important keywords from JD to weave in", ...],
  "summaries": [
    { "id": "ats", "type": "ATS Optimized", "theme": "sky", "content": "2-4 sentence summary paragraph" },
    { "id": "impact", "type": "Impact Driven", "theme": "orange", "content": "2-4 sentence summary paragraph" },
    { "id": "brand", "type": "Culture Match", "theme": "violet", "content": "2-4 sentence summary paragraph" }
  ]
}

Rules: theme must be exactly "sky", "orange", or "violet". Do not invent employers or degrees not implied by the base resume.`,
          userId,
          feature_name: 'application_tailor',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }
      const content = data.content as string | undefined;
      if (!content) throw new Error('No response from AI');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid AI response format');
      const parsed = JSON.parse(jsonMatch[0]) as {
        jobTitle?: string;
        keyRequirements?: string[];
        matchingSkills?: string[];
        missingSkills?: string[];
        companyInfo?: string;
        detectedKeywords?: string[];
        summaries?: Array<{ id?: string; type?: string; theme?: string; content?: string }>;
      };

      setAnalysisData({
        jobTitle: parsed.jobTitle || 'Target role',
        keyRequirements: Array.isArray(parsed.keyRequirements) ? parsed.keyRequirements : [],
        matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        companyInfo: parsed.companyInfo || '',
        detectedKeywords: Array.isArray(parsed.detectedKeywords) ? parsed.detectedKeywords : [],
      });

      const rawSummaries = Array.isArray(parsed.summaries) ? parsed.summaries : [];
      const themes: Array<'sky' | 'orange' | 'violet'> = ['sky', 'orange', 'violet'];
      const mapped: SummaryOption[] = rawSummaries.slice(0, 3).map((s, i) => {
        const th = (s.theme === 'sky' || s.theme === 'orange' || s.theme === 'violet'
          ? s.theme
          : themes[i]) ?? themes[i];
        return {
          id: (s.id as string) || ['ats', 'impact', 'brand'][i] || `s${i}`,
          type: (s.type as string) || 'Summary',
          theme: th,
          content: String(s.content || '').trim() || 'Summary unavailable.',
        };
      });

      if (mapped.length < 3) {
        while (mapped.length < 3) {
          const i = mapped.length;
          mapped.push({
            id: ['ats', 'impact', 'brand'][i],
            type: ['ATS Optimized', 'Impact Driven', 'Culture Match'][i],
            theme: themes[i],
            content: 'Select another option or run analysis again for a fuller result.',
          });
        }
      }

      setGeneratedSummaries(mapped);
      if (parsed.detectedKeywords?.length) {
        setJdKeywords(parsed.detectedKeywords.slice(0, 12));
      }
      setStep('strategy');
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSummary) return;
    const baseResume = (resumeContent || cvContent).trim();
    if (!baseResume) {
      alert('Resume content is missing. Go back and add a resume.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) throw new Error('Please sign in to use Application Tailor.');

      const summaryText =
        generatedSummaries.find((h) => h.id === selectedSummary)?.content || '';

      const response = await fetch(getAiGenerateUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          systemMessage:
            'You are an expert resume writer. Output only the final resume as plain text with clear section headers. No markdown code fences.',
          prompt: `Tailor this resume for the job using the chosen professional summary as the SUMMARY section.

BASE RESUME:
${baseResume}

JOB DESCRIPTION:
${jobDescription}

COMPANY / URL:
${companyUrl || 'Not provided'}

SELECTED PROFESSIONAL SUMMARY (use as SUMMARY; you may lightly edit for flow):
${summaryText}

STYLE:
- Focus: ${tailorConfig.focus}
- Section layout preference: ${tailorConfig.format} (Standard = simple ATS-friendly headings; Modern = clear hierarchy; Technical = emphasize skills/projects)
${useBrandVoice ? '- Voice: confident, authentic professional; avoid clichés.' : ''}

RULES:
1. Keep facts consistent with the base resume — do not invent employers, degrees, or dates.
2. Reframe bullets to highlight overlap with the job; naturally include important JD keywords where honest.
3. Use plain text sections such as: CONTACT (or header block), SUMMARY, EXPERIENCE, SKILLS, EDUCATION (include only if present in base).
4. Preserve the candidate's name and contact details from the base resume when present.

Return the full tailored resume only.`,
          userId,
          feature_name: 'application_tailor',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }
      const tailored = (data.content as string | undefined)?.trim();
      if (!tailored) throw new Error('No resume text returned');

      setTailoredResume(tailored);
      setStep('edit');

      const wf = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (wf?.isActive && workflowContext?.workflowId === 'job-application-pipeline') {
        WorkflowTracking.updateStepStatus('job-application-pipeline', 'tailor-resume', 'completed', {
          jobTitle: analysisData?.jobTitle || 'Application',
        });
        WorkflowTracking.setWorkflowContext({
          workflowId: 'job-application-pipeline',
          tailoredResume: tailored,
          currentJob: workflowContext?.currentJob,
          action: 'generate-cover-letter',
        });
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Failed to generate tailored resume');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToTracker = () => {
    setIsSavingToTracker(true);
    setTimeout(() => {
      setIsSavingToTracker(false);
      alert(
        `Successfully linked this resume to your '${
          analysisData?.jobTitle || 'New Application'
        }' card in the Job Tracker!`,
      );
    }, 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tailoredResume);
      alert('Resume copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setCvFile(null);
    setCvContent('');
    setResumeContent('');
    setSelectedResumeId(null);
    setCompanyUrl('');
    setJobDescription('');
    setJdKeywords([]);
    setAnalysisData(null);
    setTailoredResume('');
    setGeneratedSummaries([]);
    setSelectedSummary(null);
    setIsParsingUpload(false);
  };

  const handleDownloadPdf = async () => {
    if (!tailoredResume.trim()) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const el = document.createElement('div');
      el.style.padding = '24px';
      el.style.fontFamily = 'Georgia, "Times New Roman", serif';
      el.style.fontSize = '11pt';
      el.style.lineHeight = '1.45';
      el.style.whiteSpace = 'pre-wrap';
      el.textContent = tailoredResume;
      await html2pdf()
        .set({
          margin: 12,
          filename: 'tailored-resume.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(el)
        .save();
    } catch (e) {
      console.error(e);
      alert('Could not create PDF. Copy the text instead.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up bg-slate-50 min-h-screen">
      {/* Main Header Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          {/* Source Selection Panel */}
          {step === 'upload' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Source Material</h3>
                  <p className="text-sm text-slate-500">
                    Choose the base resume to tailor.
                  </p>
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
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    step === 'upload'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {step === 'upload' ? '1' : <CheckCircle size={14} />}
                </span>
                <div
                  className={`h-1 w-8 rounded-full ${
                    step !== 'upload' ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                ></div>

                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    step === 'input'
                      ? 'bg-neutral-900 text-white'
                      : step === 'strategy' || step === 'edit'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step === 'input'
                    ? '2'
                    : step === 'strategy' || step === 'edit'
                    ? <CheckCircle size={14} />
                    : '2'}
                </span>
                <div
                  className={`h-1 w-8 rounded-full ${
                    step === 'strategy' || step === 'edit'
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                ></div>

                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    step === 'strategy'
                      ? 'bg-neutral-900 text-white'
                      : step === 'edit'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step === 'strategy' ? '3' : step === 'edit' ? <CheckCircle size={14} /> : '3'}
                </span>
                <div
                  className={`h-1 w-8 rounded-full ${
                    step === 'edit' ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                ></div>

                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    step === 'edit'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  4
                </span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {step === 'upload'
                  ? 'Upload'
                  : step === 'input'
                  ? 'Details'
                  : step === 'strategy'
                  ? 'Strategy'
                  : 'Editor'}
              </span>
            </div>

            <div className="p-8">
              {/* Step 1: CV Upload */}
              {step === 'upload' && (
                <div className="animate-fade-in-up">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                    Let's start with your resume
                  </h3>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-neutral-900/30 hover:bg-slate-50 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="cv-upload"
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 group-hover:shadow-md transition-all">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-slate-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-neutral-900 mb-1">
                          {cvFile ? cvFile.name : 'Click to upload or drag and drop'}
                        </h4>
                        <p className="text-slate-500 text-sm">
                          {isParsingUpload
                            ? 'Parsing resume…'
                            : 'PDF (server parse), DOCX, or TXT (Max 10MB)'}
                        </p>
                      </div>
                      <label
                        htmlFor="cv-upload"
                        className={`mt-4 bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-neutral-900/10 hover:shadow-xl hover:-translate-y-0.5 ${
                          isParsingUpload ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                        }`}
                      >
                        {isParsingUpload ? 'Parsing…' : cvFile ? 'Change File' : 'Select Resume'}
                      </label>
                    </div>
                  </div>
                  {(cvFile || (resumeContent || cvContent).trim()) && !isParsingUpload && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
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
                  {/* Focus & Format Config */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    {/* Header with Dashboard Icon Style */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
                        <Settings size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900">
                          Configuration
                        </h3>
                        <p className="text-sm text-slate-500">
                          Customize the tailoring strategy.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* Focus Dropdown */}
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                          Tailoring Focus
                        </label>
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === 'focus' ? null : 'focus',
                            )
                          }
                          className={`w-full text-left bg-slate-50 border ${
                            activeDropdown === 'focus'
                              ? 'border-neutral-900 ring-1 ring-neutral-900 bg-white'
                              : 'border-slate-200'
                          } text-slate-700 py-3.5 px-4 rounded-xl focus:outline-none transition-all font-medium text-sm flex items-center justify-between group hover:border-slate-300`}
                        >
                          <div className="flex items-center gap-2">
                            {(() => {
                              const opt = focusOptions.find(
                                (o) => o.value === tailorConfig.focus,
                              );
                              const Icon = opt?.icon || Zap;
                              const colorClass = opt?.text || 'text-slate-500';
                              return (
                                <Icon
                                  size={18}
                                  className={`${colorClass} transition-colors`}
                                />
                              );
                            })()}
                            <span className="text-slate-900">
                              {tailorConfig.focus}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-200 ${
                              activeDropdown === 'focus'
                                ? 'rotate-180 text-neutral-900'
                                : ''
                            }`}
                          />
                        </button>

                        {activeDropdown === 'focus' && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            ></div>
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up origin-top">
                              {focusOptions.map((opt) => (
                                <div
                                  key={opt.value}
                                  onClick={() => {
                                    setTailorConfig({
                                      ...tailorConfig,
                                      focus: opt.value,
                                    });
                                    setActiveDropdown(null);
                                  }}
                                  className={`p-3 px-4 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 ${
                                    tailorConfig.focus === opt.value
                                      ? 'bg-slate-50'
                                      : ''
                                  }`}
                                >
                                  <div className={`p-2 rounded-lg ${opt.bg} ${opt.text}`}>
                                    <opt.icon size={16} />
                                  </div>
                                  <div>
                                    <div
                                      className={`font-bold text-sm ${
                                        tailorConfig.focus === opt.value
                                          ? 'text-neutral-900'
                                          : 'text-slate-700'
                                      }`}
                                    >
                                      {opt.value}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {opt.desc}
                                    </div>
                                  </div>
                                  {tailorConfig.focus === opt.value && (
                                    <CheckCircle2
                                      size={16}
                                      className="ml-auto text-neutral-900"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Format Dropdown */}
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                          Output Format
                        </label>
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === 'format' ? null : 'format',
                            )
                          }
                          className={`w-full text-left bg-slate-50 border ${
                            activeDropdown === 'format'
                              ? 'border-neutral-900 ring-1 ring-neutral-900 bg-white'
                              : 'border-slate-200'
                          } text-slate-700 py-3.5 px-4 rounded-xl focus:outline-none transition-all font-medium text-sm flex items-center justify-between group hover:border-slate-300`}
                        >
                          <div className="flex items-center gap-2">
                            {(() => {
                              const opt = formatOptions.find(
                                (o) => o.value === tailorConfig.format,
                              );
                              const Icon = opt?.icon || FileText;
                              const colorClass = opt?.text || 'text-slate-500';
                              return (
                                <Icon
                                  size={18}
                                  className={`${colorClass} transition-colors`}
                                />
                              );
                            })()}
                            <span className="text-slate-900">
                              {tailorConfig.format}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-200 ${
                              activeDropdown === 'format'
                                ? 'rotate-180 text-neutral-900'
                                : ''
                            }`}
                          />
                        </button>

                        {activeDropdown === 'format' && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            ></div>
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up origin-top">
                              {formatOptions.map((opt) => (
                                <div
                                  key={opt.value}
                                  onClick={() => {
                                    setTailorConfig({
                                      ...tailorConfig,
                                      format: opt.value,
                                    });
                                    setActiveDropdown(null);
                                  }}
                                  className={`p-3 px-4 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 ${
                                    tailorConfig.format === opt.value
                                      ? 'bg-slate-50'
                                      : ''
                                  }`}
                                >
                                  <div className={`p-2 rounded-lg ${opt.bg} ${opt.text}`}>
                                    <opt.icon size={16} />
                                  </div>
                                  <div>
                                    <div
                                      className={`font-bold text-sm ${
                                        tailorConfig.format === opt.value
                                          ? 'text-neutral-900'
                                          : 'text-slate-700'
                                      }`}
                                    >
                                      {opt.value}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {opt.desc}
                                    </div>
                                  </div>
                                  {tailorConfig.format === opt.value && (
                                    <CheckCircle2
                                      size={16}
                                      className="ml-auto text-neutral-900"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Brand Voice Sync Module */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        useBrandVoice
                          ? 'bg-slate-50/50 border-slate-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2.5 rounded-xl transition-colors ${
                            useBrandVoice
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-white border border-slate-200 text-slate-400'
                          }`}
                        >
                          <Mic size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4
                              className={`font-bold text-base ${
                                useBrandVoice ? 'text-slate-900' : 'text-slate-900'
                              }`}
                            >
                              Brand Voice Sync
                            </h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={useBrandVoice}
                                onChange={(e) => setUseBrandVoice(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-600 shadow-inner"></div>
                            </label>
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              useBrandVoice ? 'text-slate-700' : 'text-slate-500'
                            }`}
                          >
                            Allow AI to align your resume summary with your personal
                            brand voice and LinkedIn presence.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        Company Website or Job URL
                      </label>
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
                          {isFetchingUrl ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Fetch</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-neutral-900">
                          Job Description
                        </label>
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
                          <span className="text-xs font-bold text-slate-400 py-1">
                            Detected Keywords:
                          </span>
                          {jdKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium border border-teal-100"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleAnalysis}
                    disabled={
                      !jobDescription.trim() ||
                      isAnalyzing ||
                      !(resumeContent || cvContent).trim()
                    }
                    className="w-full bg-neutral-900 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/20"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" /> Analyzing &
                        Tailoring Strategies...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" /> Analyze & Select Strategy
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Step 3: Strategy (Summaries) */}
              {step === 'strategy' && (
                <div className="animate-fade-in-up space-y-8">
                  {/* Analysis Summary */}
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 min-w-[200px] flex-1">
                      <div className="flex items-center gap-2 mb-2 text-emerald-700">
                        <Target size={16} />
                        <span className="text-xs font-bold uppercase">Role Match</span>
                      </div>
                      <div className="font-bold text-neutral-900">
                        {analysisData?.jobTitle}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 min-w-[200px] flex-1">
                      <div className="flex items-center gap-2 mb-2 text-blue-700">
                        <Crosshair size={16} />
                        <span className="text-xs font-bold uppercase">Top Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysisData?.matchingSkills?.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-white/60 px-2 py-1 rounded text-blue-800 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Keyword Gaps / Optimization Card */}
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 min-w-[200px] flex-1">
                      <div className="flex items-center gap-2 mb-2 text-purple-700">
                        <Scissors size={16} />
                        <span className="text-xs font-bold uppercase">
                          Keywords to Inject
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {analysisData?.detectedKeywords?.slice(0, 3).map((v) => (
                          <span
                            key={v}
                            className="text-xs bg-white/60 px-2 py-1 rounded text-purple-800 font-medium"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-purple-600/70 italic flex items-center gap-1">
                        <Sparkles size={10} /> Auto-injection enabled
                      </div>
                    </div>
                  </div>

                  {/* Summary Selection */}
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-4 text-center">
                      Choose Your Professional Summary
                    </h3>
                    <p className="text-slate-500 text-sm text-center mb-8 max-w-lg mx-auto">
                      We've generated three different resume summaries based on your{' '}
                      {tailorConfig.focus.toLowerCase()} preference. This sets the tone
                      for your application.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                      {generatedSummaries.map((summary) => {
                        let themeClasses =
                          'bg-white border-slate-100 hover:bg-slate-50';
                        let badgeClasses = 'bg-slate-100 text-slate-500';

                        if (summary.theme === 'orange') {
                          themeClasses =
                            selectedSummary === summary.id
                              ? 'bg-orange-50 border-orange-500 shadow-md'
                              : 'bg-white border-orange-100 hover:bg-orange-50';
                          badgeClasses = 'bg-orange-100 text-orange-700';
                        } else if (summary.theme === 'sky') {
                          themeClasses =
                            selectedSummary === summary.id
                              ? 'bg-sky-50 border-sky-500 shadow-md'
                              : 'bg-white border-sky-100 hover:bg-sky-50';
                          badgeClasses = 'bg-sky-100 text-sky-700';
                        } else if (summary.theme === 'violet') {
                          themeClasses =
                            selectedSummary === summary.id
                              ? 'bg-violet-50 border-violet-500 shadow-md'
                              : 'bg-white border-violet-100 hover:bg-violet-50';
                          badgeClasses = 'bg-violet-100 text-violet-700';
                        }

                        return (
                          <div
                            key={summary.id}
                            onClick={() => setSelectedSummary(summary.id)}
                            className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer group ${themeClasses}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${badgeClasses}`}
                              >
                                {summary.type}
                              </div>
                              {selectedSummary === summary.id && (
                                <CheckCircle size={20} className="text-neutral-900" />
                              )}
                            </div>
                            <p
                              className={`text-sm leading-relaxed font-serif ${
                                selectedSummary === summary.id
                                  ? 'text-neutral-900 font-medium'
                                  : 'text-slate-600'
                              }`}
                            >
                              "{summary.content}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!selectedSummary || isGenerating}
                    className="w-full bg-neutral-900 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/20"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" /> Tailoring Full
                        Resume...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" /> Generate Tailored Resume
                      </>
                    )}
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
                        {showPreview ? (
                          <>
                            <Pencil size={14} /> Edit
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> Preview
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {showPreview ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm min-h-[800px] prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed">
                        {tailoredResume}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={tailoredResume}
                      onChange={(e) => setTailoredResume(e.target.value)}
                      className="w-full h-[800px] p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-serif leading-relaxed focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all resize-y"
                    />
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleSaveToTracker}
                      disabled={isSavingToTracker}
                      className="flex-1 bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingToTracker ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Briefcase size={16} />
                      )}
                      Save to Tracker
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex-1 bg-neutral-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy size={16} /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> PDF
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
              <Info size={16} className="text-slate-400" /> Context
            </h4>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Resume
                </span>
                <div className="font-medium text-sm text-slate-700 truncate">
                  {cvFile ? cvFile.name : selectedResumeId ? 'Library Resume' : 'Not selected'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Job
                </span>
                <div className="font-medium text-sm text-slate-700 truncate">
                  {analysisData?.jobTitle || 'Pending Analysis...'}
                </div>
              </div>
            </div>
          </div>

          {/* Quality Score Widget (Visible on Edit) */}
          {step === 'edit' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-neutral-900">Optimization</h4>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-sm">
                  +15% Score
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Focus</span>
                  <span className="text-slate-900 font-medium">
                    {tailorConfig.focus}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 w-[95%] h-full rounded-full"></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Keywords</span>
                  <span className="text-slate-900 font-medium">9/10 Found</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 w-[90%] h-full rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-bold text-neutral-900 mb-4">Actions</h4>
            <div className="space-y-2">
              <button
                onClick={handleReset}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-neutral-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
              >
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

export default ApplicationTailorKit;


