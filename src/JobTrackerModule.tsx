import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Building2,
  Check,
  MoreHorizontal,
  Eye,
  FileText,
  Trash2,
  MapPin,
  DollarSign,
  Wand2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ListFilter,
  Plus,
  CheckCircle,
  Minus,
  RefreshCw,
  Brain,
  ExternalLink,
  ChevronDown,
  X,
  Loader2,
  Archive,
  XCircle,
  Layout,
  ListTodo,
  Users,
  Linkedin,
  Sparkles,
  PenTool,
} from 'lucide-react';

type JobStatus = 'new-leads' | 'reviewing' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'archived';

type JobContact = {
  id: number;
  name: string;
  role: string;
  url: string;
};

type TrackedJob = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  postedDate: string;
  source: string;
  status: JobStatus;
  notes: string;
  tags: string[];
  applicationDate: string;
  interviewDate: string;
  contacts: JobContact[] | string;
  url: string;
  whyMatch: string;
  missingSkills: string[];
  description: string;
  addedFrom: string;
  addedAt: string;
  updatedAt?: string;
};

type Analytics = {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  averageMatchScore: number;
  totalApplied: number;
  totalInterviews: number;
  totalOffers: number;
};

type Column = {
  id: JobStatus;
  label: string;
  accent: string;
  text: string;
  badge: string;
};

type GenerateApiResponse = {
  text?: string;
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  matchScore?: number | string;
  whyMatch?: string;
  missingSkills?: unknown;
};

const CustomStyles = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
    .animate-fade-in-up { animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

type SelectOption = { value?: string; label: string; type?: 'header' | 'divider' };

type CustomSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
  buttonClassName?: string;
  align?: 'left' | 'right';
};

const CustomSelect = ({
  value,
  onChange,
  options,
  icon: Icon,
  className,
  buttonClassName,
  align = 'left',
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={dropdownRef} className={`relative group ${className || ''}`}>
      {Icon && (
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          buttonClassName ||
          `w-full sm:w-auto ${Icon ? 'pl-8' : 'pl-4'} pr-8 py-2 bg-white border border-slate-200/70 hover:border-slate-300 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-400/10 transition-all shadow-sm flex items-center justify-between gap-2 text-left`
        }
      >
        <span className="truncate">{selectedOption?.label}</span>
      </button>
      <ChevronDown
        size={14}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`}
      />
      {isOpen && (
        <div
          className={`absolute ${alignClass} top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)] z-[100] p-1.5 animate-fade-in-up origin-top`}
        >
          {options.map((opt, idx) => {
            if (opt.type === 'header') {
              return (
                <div key={`h-${idx}`} className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 mb-0.5">
                  {opt.label}
                </div>
              );
            }
            if (opt.type === 'divider') return <div key={`d-${idx}`} className="h-px bg-slate-100 my-1 mx-2" />;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value || '');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between ${
                  value === opt.value
                    ? 'bg-slate-100 text-neutral-900 font-bold'
                    : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-neutral-900'
                }`}
              >
                {opt.label}
                {value === opt.value && <Check size={14} className="text-neutral-900" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const JOB_TAGS = [
  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'referral', label: 'Referral', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'cold-app', label: 'Cold App', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'relocation', label: 'Relocation', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

const JobTrackingUtils = {
  getAllTrackedJobs(): TrackedJob[] {
    try {
      const stored = localStorage.getItem('tracked_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  saveTrackedJobs(jobs: TrackedJob[]) {
    try {
      const stringifiedData = JSON.stringify(jobs);
      if (stringifiedData.length > 4000000) {
        console.warn('LocalStorage approaching limit. Consider migrating to database.');
      }
      localStorage.setItem('tracked_jobs', stringifiedData);
      localStorage.setItem('tracked_jobs_last_updated', Date.now().toString());
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch {
      return false;
    }
  },
  addJobToTracker(job: Partial<TrackedJob>, source = 'manual', status: JobStatus = 'new-leads') {
    const trackedJobs = this.getAllTrackedJobs();
    const isDuplicate = trackedJobs.some((tracked) => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });
    if (isDuplicate) return { success: false, message: 'This job is already being tracked', duplicate: true };

    const trackerJob: TrackedJob = {
      id: Date.now() + Math.random(),
      title: job.title || 'Untitled Position',
      company: job.company || 'Unknown Company',
      location: job.location || 'Not specified',
      salary: job.salary || '',
      matchScore: job.matchScore || 0,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0],
      source: job.source || source,
      status,
      notes: job.notes || '',
      tags: job.tags || [],
      applicationDate: status === 'applied' ? new Date().toISOString().split('T')[0] : '',
      interviewDate: '',
      contacts: Array.isArray(job.contacts) ? job.contacts : [],
      url: job.url || '',
      whyMatch: job.whyMatch || '',
      missingSkills: job.missingSkills || [],
      description: job.description || '',
      addedFrom: source,
      addedAt: new Date().toISOString(),
    };
    trackedJobs.push(trackerJob);
    this.saveTrackedJobs(trackedJobs);
    return { success: true, message: 'Job added to tracker!', job: trackerJob };
  },
  updateJob(updatedJob: TrackedJob) {
    const jobs = this.getAllTrackedJobs();
    const index = jobs.findIndex((j) => j.id === updatedJob.id);
    if (index !== -1) {
      updatedJob.updatedAt = new Date().toISOString();
      jobs[index] = updatedJob;
      this.saveTrackedJobs(jobs);
      return true;
    }
    return false;
  },
  deleteJob(jobId: number) {
    const jobs = this.getAllTrackedJobs();
    this.saveTrackedJobs(jobs.filter((j) => j.id !== jobId));
    return true;
  },
  bulkUpdateStatus(jobIds: number[], newStatus: JobStatus) {
    const jobs = this.getAllTrackedJobs();
    let updated = false;
    const newJobs = jobs.map((j) => {
      if (jobIds.includes(j.id)) {
        updated = true;
        return { ...j, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return j;
    });
    if (updated) this.saveTrackedJobs(newJobs);
    return updated;
  },
  bulkDelete(jobIds: number[]) {
    const jobs = this.getAllTrackedJobs();
    const filtered = jobs.filter((j) => !jobIds.includes(j.id));
    if (jobs.length !== filtered.length) {
      this.saveTrackedJobs(filtered);
      return true;
    }
    return false;
  },
  getAnalytics(): Analytics {
    const jobs = this.getAllTrackedJobs();
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let totalMatchScore = 0;
    let matchScoreCount = 0;
    jobs.forEach((job) => {
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;
      bySource[job.source] = (bySource[job.source] || 0) + 1;
      if (job.matchScore > 0) {
        totalMatchScore += job.matchScore;
        matchScoreCount++;
      }
    });
    const averageMatchScore = matchScoreCount > 0 ? Math.round(totalMatchScore / matchScoreCount) : 0;
    const totalApplied = jobs.filter((j) => ['applied', 'interviewing', 'offer'].includes(j.status) || j.applicationDate).length;
    const totalInterviews = jobs.filter((j) => ['interviewing', 'offer'].includes(j.status) || j.interviewDate).length;
    const totalOffers = jobs.filter((j) => j.status === 'offer').length;
    return { total: jobs.length, byStatus, bySource, averageMatchScore, totalApplied, totalInterviews, totalOffers };
  },
};

type ManualAddModalProps = {
  setShowManualAdd: (value: boolean) => void;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  setSelectedJob: (job: TrackedJob | null) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
};

const ManualAddModal = ({ setShowManualAdd, setRefreshTrigger, setSelectedJob, showNotification }: ManualAddModalProps) => {
  const [activeTab, setActiveTab] = useState<'smart' | 'manual'>('smart');
  const [smartInput, setSmartInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    url: '',
    notes: '',
    description: '',
  });

  const handleParse = async () => {
    if (!smartInput.trim()) return;
    setIsParsing(true);
    try {
      const fetchWithBackoff = async (retries = 5) => {
        const delays = [1000, 2000, 4000, 8000, 16000];
        for (let i = 0; i < retries; i += 1) {
          try {
            const res = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt:
                  "Extract job details from the following text or URL. Find the job title, company name, location, and salary. Also provide a concise 2-sentence summary for the 'description' field, and a bulleted list of 3-5 key skills for the 'notes' field.",
                task: 'parsing',
                data: smartInput,
              }),
            });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return res.json();
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, delays[i]));
          }
        }
        return {};
      };

      const result = (await fetchWithBackoff()) as GenerateApiResponse;
      let parsedText = '';
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        parsedText = result.candidates[0].content.parts[0].text || '';
      } else if (result?.text) {
        parsedText = result.text;
      } else if (typeof result === 'string') {
        parsedText = result;
      } else {
        parsedText = JSON.stringify(result);
      }

      const parsed =
        typeof parsedText === 'string' && parsedText.startsWith('{')
          ? JSON.parse(parsedText)
          : typeof result === 'object'
            ? result
            : {};

      if (Object.keys(parsed as Record<string, unknown>).length > 0) {
        const payload = parsed as Record<string, string>;
        setFormData((prev) => ({
          ...prev,
          title: payload.title || prev.title,
          company: payload.company || prev.company,
          location: payload.location || prev.location,
          salary: payload.salary || prev.salary,
          description: payload.description || prev.description,
          notes: payload.notes || prev.notes,
          url: smartInput.startsWith('http') ? smartInput : prev.url,
        }));
        showNotification('Job details extracted successfully!', 'success');
        setShowReview(true);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('AI Parsing failed:', error);
      setFormData((prev) => ({
        ...prev,
        title: 'Senior Product Engineer',
        company: 'Acme Corp',
        location: 'Remote',
        salary: '$120k - $150k',
        description:
          "Join our core product team to build scalable web applications. You'll work with a modern stack including React, TypeScript, and Node.js.",
        notes: '- React & TypeScript\n- 4+ years experience\n- Strong UI/UX fundamentals',
        url: smartInput.startsWith('http') ? smartInput : prev.url,
      }));
      showNotification('Demo Mode: Using mock data for workflow (proxy failed)', 'info');
      setShowReview(true);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = JobTrackingUtils.addJobToTracker({
      title: formData.title,
      company: formData.company,
      location: formData.location,
      salary: formData.salary,
      url: formData.url,
      notes: formData.notes,
      description: formData.description,
      source: activeTab === 'smart' ? 'Smart Parse' : 'Manual Entry',
    });
    if (result.success) {
      showNotification('Job added successfully!', 'success');
      setShowManualAdd(false);
      setRefreshTrigger((prev) => prev + 1);
      setSelectedJob(result.job as TrackedJob);
    } else {
      showNotification(result.message as string, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-fade-in-up flex flex-col max-h-[90vh] border border-slate-200/70">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold text-neutral-900">Add New Job</h3>
          <button onClick={() => setShowManualAdd(false)} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('smart')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'smart' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={16} /> Smart Parse
          </button>
          <button
            onClick={() => {
              setActiveTab('manual');
              setShowReview(false);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'manual' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PenTool size={16} /> Manual Entry
          </button>
        </div>
        <div className="overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2 pb-2">
          {activeTab === 'smart' ? (
            showReview ? (
              <div className="space-y-4 animate-fade-in-up">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600 shrink-0 mt-0.5">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Job Parsed Successfully!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">Review details before adding to your tracker.</p>
                  </div>
                </div>
                <div className="border border-slate-200/70 rounded-xl p-4 bg-white shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-slate-400 to-slate-600" />
                  <div className="flex items-center gap-3 mb-2 pl-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200/70 text-slate-400 shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-[15px] text-slate-900 leading-tight truncate">{formData.company || 'Unknown Company'}</div>
                      <div className="text-xs font-medium text-slate-500 truncate">{formData.title || 'Untitled Position'}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 pl-2">
                    {formData.location && (
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <MapPin size={12} /> {formData.location}
                      </span>
                    )}
                    {formData.salary && (
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <DollarSign size={12} /> {formData.salary}
                      </span>
                    )}
                  </div>
                  {formData.notes && (
                    <div className="pt-3 border-t border-slate-50 pl-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Extracted Skills</span>
                      <div className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{formData.notes}</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
                  <button
                    onClick={() => {
                      setShowReview(false);
                      setActiveTab('manual');
                    }}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Add to Tracker
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 font-medium">
                  Paste a job link or raw job description and AI will extract details automatically.
                </div>
                <textarea
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="Paste URL or Job Description here..."
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 resize-none transition-all"
                />
                <button
                  onClick={handleParse}
                  disabled={isParsing || !smartInput.trim()}
                  className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isParsing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Parsing with AI...
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} /> Auto-Fill Details
                    </>
                  )}
                </button>
              </div>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Company *</label>
                <input
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Salary</label>
                  <input
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Extracted Notes / Skills</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900 resize-none"
                />
              </div>
              <div className="pt-2 flex gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowManualAdd(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-sm">
                  Save Job
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

type JobDetailsModalProps = {
  selectedJob: TrackedJob | null;
  setSelectedJob: (job: TrackedJob | null) => void;
  handleJobUpdate: (fields: Partial<TrackedJob>) => void;
  handleDeleteJob: () => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  columns: Column[];
};

const JobDetailsModal = ({
  selectedJob,
  setSelectedJob,
  handleJobUpdate,
  handleDeleteJob,
  showNotification,
  columns,
}: JobDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', role: '', url: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeMatch = async () => {
    if (!selectedJob) return;
    setIsAnalyzing(true);
    try {
      const mockResume =
        'Experienced Product Designer and Developer with 5 years in UI/UX, React, Tailwind CSS, Figma, User Research, and Prototyping. Strong background in creating scalable design systems and working in fast-paced agile environments.';
      const jobContext = `Title: ${selectedJob.title}\nCompany: ${selectedJob.company}\nDescription: ${selectedJob.description}\nNotes: ${selectedJob.notes}`;

      const fetchWithBackoff = async (retries = 5) => {
        const delays = [1000, 2000, 4000, 8000, 16000];
        for (let i = 0; i < retries; i += 1) {
          try {
            const res = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt:
                  "Compare this Job to my Resume. Return a JSON object with 'matchScore' (number 0-100), 'whyMatch' (2 concise sentences on why it fits), and 'missingSkills' (array of up to 4 string skill names I lack).",
                task: 'analysis',
                data: `Resume: ${mockResume}\n\nJob:\n${jobContext}`,
              }),
            });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return res.json();
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, delays[i]));
          }
        }
        return {};
      };

      const result = (await fetchWithBackoff()) as GenerateApiResponse;
      let parsedText = '';
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        parsedText = result.candidates[0].content.parts[0].text || '';
      } else if (result?.text) {
        parsedText = result.text;
      } else if (typeof result === 'string') {
        parsedText = result;
      } else {
        parsedText = JSON.stringify(result);
      }
      const parsed =
        typeof parsedText === 'string' && parsedText.startsWith('{')
          ? JSON.parse(parsedText)
          : typeof result === 'object'
            ? result
            : {};
      const parsedRecord = parsed as GenerateApiResponse;
      if (parsedRecord && typeof parsedRecord.matchScore !== 'undefined') {
        handleJobUpdate({
          matchScore: parseInt(String(parsedRecord.matchScore), 10) || 0,
          whyMatch: parsedRecord.whyMatch || 'Match analysis complete.',
          missingSkills: Array.isArray(parsedRecord.missingSkills)
            ? (parsedRecord.missingSkills as string[])
            : [],
        });
      } else {
        throw new Error('Missing match score in response');
      }
    } catch (error) {
      console.error('Match Analysis failed:', error);
      showNotification('Failed to analyze match. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!selectedJob) return null;
  const statusOptions: SelectOption[] = columns.map((col) => ({ value: col.id, label: col.label }));

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-fade-in-up border border-slate-200/70 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-neutral-900">{selectedJob.title}</h2>
              {selectedJob.matchScore > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{selectedJob.matchScore}% Match</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Building2 size={14} /> {selectedJob.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {selectedJob.location}
              </span>
            </div>
          </div>
          <div className="relative z-20 flex items-center gap-2">
            <CustomSelect
              value={selectedJob.status}
              onChange={(val) => handleJobUpdate({ status: val as JobStatus })}
              options={statusOptions}
              align="right"
              buttonClassName="bg-slate-50 border border-slate-200 text-sm font-bold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-neutral-900 transition-colors w-full sm:w-auto flex items-center justify-between gap-4"
            />
            <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex border-b border-slate-100 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'notes' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Notes & Activity
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'details' ? (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TAGS.map((tag) => {
                    const isSelected = selectedJob.tags?.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const currentTags = selectedJob.tags || [];
                          const newTags = isSelected ? currentTags.filter((t) => t !== tag.id) : [...currentTags, tag.id];
                          handleJobUpdate({ tags: newTags });
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                          isSelected ? tag.color : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag.label}
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Salary</label>
                  <div className="font-medium text-slate-800">{selectedJob.salary || 'Not specified'}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Source</label>
                  <div className="font-medium text-slate-800">{selectedJob.source}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Added Date</label>
                  <div className="font-medium text-slate-800">{new Date(selectedJob.addedAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Job Link</label>
                  {selectedJob.url ? (
                    <a href={selectedJob.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                      View Posting <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="text-slate-400">No URL</span>
                  )}
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-neutral-900 font-bold text-sm flex items-center gap-2">
                    <Brain size={16} /> Smart Match Analysis
                  </h4>
                  {selectedJob.matchScore > 0 && (
                    <button
                      onClick={handleAnalyzeMatch}
                      disabled={isAnalyzing}
                      className="text-slate-700 hover:text-neutral-900 text-xs font-bold flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw size={12} className={isAnalyzing ? 'animate-spin' : ''} /> {isAnalyzing ? 'Analyzing...' : 'Recalculate'}
                    </button>
                  )}
                </div>
                {selectedJob.matchScore > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path className={selectedJob.matchScore >= 80 ? 'text-emerald-500' : selectedJob.matchScore >= 60 ? 'text-amber-500' : 'text-red-500'} strokeDasharray={`${selectedJob.matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <span className="absolute text-sm font-extrabold text-neutral-900">{selectedJob.matchScore}%</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{selectedJob.whyMatch}</p>
                    </div>
                    {selectedJob.missingSkills?.length > 0 && (
                      <div className="pt-3 border-t border-slate-200">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">Gap Analysis (Missing Skills)</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedJob.missingSkills.map((skill, idx) => (
                            <span key={`${skill}-${idx}`} className="bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                              <Minus size={10} className="text-red-400" /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-700 mb-3">Compare this job description against your master resume to generate a match score and skill gaps.</p>
                    <button
                      onClick={handleAnalyzeMatch}
                      disabled={isAnalyzing}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 mx-auto disabled:opacity-70"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Analyze Match
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Description</label>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedJob.description || 'No description available.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">My Notes</label>
                <textarea
                  className="w-full h-32 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-yellow-400 resize-none placeholder-yellow-700/50"
                  placeholder="Add notes about this job..."
                  value={selectedJob.notes}
                  onChange={(e) => handleJobUpdate({ notes: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Application Date</label>
                  <input type="date" value={selectedJob.applicationDate} onChange={(e) => handleJobUpdate({ applicationDate: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Interview Date</label>
                  <input type="date" value={selectedJob.interviewDate} onChange={(e) => handleJobUpdate({ interviewDate: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Network & Contacts</label>
                  {!isAddingContact && (
                    <button onClick={() => setIsAddingContact(true)} className="text-xs font-bold text-slate-700 flex items-center gap-1 hover:text-neutral-900 transition-colors">
                      <Plus size={14} /> Add Contact
                    </button>
                  )}
                </div>
                {typeof selectedJob.contacts === 'string' && selectedJob.contacts.trim() !== '' && (
                  <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 whitespace-pre-wrap shadow-sm">
                    <div className="text-xs font-bold text-slate-400 mb-1 uppercase">Legacy Notes</div>
                    {selectedJob.contacts}
                  </div>
                )}
                <div className="space-y-3">
                  {Array.isArray(selectedJob.contacts) &&
                    selectedJob.contacts.map((contact, idx) => (
                      <div key={contact.id || idx} className="flex items-center justify-between p-3 border border-slate-200/70 rounded-xl bg-white shadow-sm group hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                            {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 leading-tight">{contact.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{contact.role || 'No role specified'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.url && (
                            <a href={contact.url} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shrink-0">
                              <Linkedin size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              const newContacts = (selectedJob.contacts as JobContact[]).filter((c) => c.id !== contact.id);
                              handleJobUpdate({ contacts: newContacts });
                            }}
                            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  {(!Array.isArray(selectedJob.contacts) || selectedJob.contacts.length === 0) &&
                    !isAddingContact &&
                    (typeof selectedJob.contacts !== 'string' || selectedJob.contacts.trim() === '') && (
                      <div className="text-center py-6 border-2 border-dashed border-slate-200/70 rounded-xl bg-slate-50/50">
                        <Users size={20} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-500 text-sm font-medium">No network contacts added.</p>
                      </div>
                    )}
                </div>
                {isAddingContact && (
                  <div className="mt-3 p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3 animate-fade-in-up">
                    <input
                      type="text"
                      placeholder="Contact Name *"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-500 font-medium"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Role (e.g. Recruiter)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-500 font-medium"
                        value={newContact.role}
                        onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                      />
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-500 font-medium"
                        value={newContact.url}
                        onChange={(e) => setNewContact({ ...newContact, url: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          setIsAddingContact(false);
                          setNewContact({ name: '', role: '', url: '' });
                        }}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!newContact.name) return;
                          const currentContacts = Array.isArray(selectedJob.contacts) ? selectedJob.contacts : [];
                          const updatedContacts = [...currentContacts, { id: Date.now(), ...newContact }];
                          handleJobUpdate({ contacts: updatedContacts });
                          setNewContact({ name: '', role: '', url: '' });
                          setIsAddingContact(false);
                        }}
                        className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 shadow-sm transition-colors"
                      >
                        Save Contact
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between rounded-b-3xl">
          <button onClick={handleDeleteJob} className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
            <Trash2 size={16} /> Delete Job
          </button>
          <div className="flex gap-3">
            <button className="px-5 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm">Tailor Resume</button>
            <button onClick={() => setSelectedJob(null)} className="px-6 py-2 bg-neutral-900 text-white font-bold text-sm rounded-lg hover:bg-neutral-800 transition-colors shadow-lg">
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobTracker = () => {
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedJob, setSelectedJob] = useState<TrackedJob | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const columns: Column[] = [
    { id: 'new-leads', label: 'New Leads', accent: 'bg-blue-500', text: 'text-neutral-900', badge: 'bg-blue-100 text-blue-700' },
    { id: 'reviewing', label: 'Reviewing', accent: 'bg-amber-500', text: 'text-neutral-900', badge: 'bg-amber-100 text-amber-700' },
    { id: 'applied', label: 'Applied', accent: 'bg-purple-500', text: 'text-neutral-900', badge: 'bg-purple-100 text-purple-700' },
    { id: 'interviewing', label: 'Interviewing', accent: 'bg-orange-500', text: 'text-neutral-900', badge: 'bg-orange-100 text-orange-700' },
    { id: 'offer', label: 'Offer', accent: 'bg-emerald-500', text: 'text-neutral-900', badge: 'bg-emerald-100 text-emerald-700' },
    { id: 'rejected', label: 'Rejected', accent: 'bg-red-500', text: 'text-neutral-900', badge: 'bg-red-100 text-red-700' },
    { id: 'archived', label: 'Archived', accent: 'bg-slate-500', text: 'text-neutral-900', badge: 'bg-slate-100 text-slate-700' },
  ];

  const filterOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'all', label: 'All Jobs' },
      { value: 'remote', label: 'Remote Only' },
      { value: 'high-match', label: 'High Match (>80%)' },
      { type: 'divider', label: '' },
      { type: 'header', label: 'Tags' },
      ...JOB_TAGS.map((tag) => ({ value: `tag-${tag.id}`, label: tag.label })),
    ],
    [],
  );
  const sortOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'date-desc', label: 'Newest First' },
      { value: 'date-asc', label: 'Oldest First' },
      { value: 'score-desc', label: 'Match Score' },
      { value: 'company-asc', label: 'Company (A-Z)' },
    ],
    [],
  );

  const loadData = useCallback(() => {
    setJobs(JobTrackingUtils.getAllTrackedJobs());
    setAnalytics(JobTrackingUtils.getAnalytics());
  }, []);

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadData, refreshTrigger]);

  useEffect(() => {
    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((job) => job.company?.toLowerCase().includes(lowerTerm) || job.title?.toLowerCase().includes(lowerTerm));
    }
    if (filterBy === 'remote') {
      result = result.filter((job) => job.location?.toLowerCase().includes('remote'));
    } else if (filterBy === 'high-match') {
      result = result.filter((job) => (job.matchScore || 0) >= 80);
    } else if (filterBy.startsWith('tag-')) {
      const tagId = filterBy.replace('tag-', '');
      result = result.filter((job) => job.tags?.includes(tagId));
    }
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
      if (sortBy === 'date-asc') return new Date(a.addedAt || 0).getTime() - new Date(b.addedAt || 0).getTime();
      if (sortBy === 'score-desc') return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === 'company-asc') return (a.company || '').localeCompare(b.company || '');
      return 0;
    });
    return result;
  }, [jobs, searchTerm, filterBy, sortBy]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDragStart = (e: React.DragEvent, jobId: number) => {
    setIsDragging(true);
    e.dataTransfer.setData('jobId', String(jobId));
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    setIsDragging(false);
    const jobId = Number(e.dataTransfer.getData('jobId'));
    const job = jobs.find((j) => j.id === jobId);
    if (job && job.status !== status) {
      const updatedJob: TrackedJob = { ...job, status };
      if (status === 'applied' && !updatedJob.applicationDate) updatedJob.applicationDate = new Date().toISOString().split('T')[0];
      if (status === 'interviewing') showNotification(`Congrats on the interview for ${job.company}!`, 'success');
      JobTrackingUtils.updateJob(updatedJob);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleJobUpdate = (updatedFields: Partial<TrackedJob>) => {
    if (!selectedJob) return;
    let finalFields = { ...updatedFields };
    if (updatedFields.interviewDate && updatedFields.interviewDate !== selectedJob.interviewDate && !['interviewing', 'offer', 'rejected'].includes(selectedJob.status)) {
      if (window.confirm("You set an interview date. Move this job to 'Interviewing'?")) {
        finalFields = { ...finalFields, status: 'interviewing' };
      }
    }
    const updatedJob = { ...selectedJob, ...finalFields } as TrackedJob;
    JobTrackingUtils.updateJob(updatedJob);
    setSelectedJob(updatedJob);
    setRefreshTrigger((prev) => prev + 1);
    if (finalFields.status === 'interviewing' && selectedJob.status !== 'interviewing') {
      showNotification('Job moved to Interviewing! Good luck!', 'success');
    } else if (!updatedFields.tags) {
      showNotification('Job updated', 'success');
    }
  };

  const handleDeleteJob = () => {
    if (selectedJob && window.confirm('Are you sure you want to delete this job?')) {
      JobTrackingUtils.deleteJob(selectedJob.id);
      setSelectedJob(null);
      setRefreshTrigger((prev) => prev + 1);
      showNotification('Job deleted', 'info');
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedJobIds((prev) => (prev.includes(id) ? prev.filter((jId) => jId !== id) : [...prev, id]));
  };

  const handleBulkAction = (action: 'archived' | 'rejected' | 'delete') => {
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedJobIds.length} jobs?`)) {
        JobTrackingUtils.bulkDelete(selectedJobIds);
        showNotification(`Deleted ${selectedJobIds.length} jobs`, 'info');
        setSelectedJobIds([]);
        setRefreshTrigger((prev) => prev + 1);
      }
    } else {
      JobTrackingUtils.bulkUpdateStatus(selectedJobIds, action);
      showNotification(`Moved ${selectedJobIds.length} jobs to ${action === 'archived' ? 'Archive' : 'Rejected'}`, 'success');
      setSelectedJobIds([]);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const formatDateStr = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const renderJobCard = (job: TrackedJob) => {
    const isSelected = selectedJobIds.includes(job.id);
    const isMultiSelectMode = selectedJobIds.length > 0;
    const now = new Date();
    const lastActivity = new Date(job.updatedAt || job.applicationDate || job.addedAt || now.toISOString());
    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    const isActiveStatus = ['new-leads', 'reviewing', 'applied', 'interviewing'].includes(job.status);
    const isGhosted = isActiveStatus && daysSinceActivity > 30;

    return (
      <div
        key={job.id}
        draggable
        onDragStart={(e) => handleDragStart(e, job.id)}
        onClick={() => (isMultiSelectMode ? toggleSelection(job.id) : setSelectedJob(job))}
        className={`group relative overflow-hidden bg-white p-4 rounded-2xl border border-slate-200/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-grab active:cursor-grabbing flex flex-col animate-fade-in-up shrink-0 ${
          viewMode === 'list' ? 'w-full sm:w-[296px]' : 'w-full'
        } min-h-[128px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] ${
          isSelected ? 'ring-2 ring-slate-500 border-slate-500 bg-slate-100/40' : 'hover:border-slate-300/80'
        } ${isGhosted ? 'opacity-60 hover:opacity-100 grayscale-[40%]' : ''}`}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-50 border border-slate-200/70 text-slate-400 shrink-0">
                <Building2 size={12} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">{job.company}</h4>
            </div>
            <div className="text-xs font-medium text-slate-500 line-clamp-2 leading-snug pl-1">{job.title}</div>
          </div>
          <div className="relative flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSelection(job.id);
              }}
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                isSelected
                  ? 'bg-neutral-900 border-neutral-900 text-white opacity-100'
                  : isMultiSelectMode
                    ? 'border-slate-300 bg-white opacity-100'
                    : 'border-slate-300 bg-white opacity-0 group-hover:opacity-100 hover:border-slate-500'
              }`}
            >
              {isSelected && <Check size={12} strokeWidth={3} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(openDropdownId === job.id ? null : job.id);
              }}
              className={`text-slate-400 hover:text-neutral-900 hover:bg-slate-100 p-1 rounded-md transition-all shrink-0 ${
                openDropdownId === job.id ? 'opacity-100 bg-slate-100 text-neutral-900' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <MoreHorizontal size={14} />
            </button>
            {openDropdownId === job.id && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-[60] animate-fade-in-up origin-top-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                    setOpenDropdownId(null);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-neutral-900 flex items-center gap-2 transition-colors"
                >
                  <Eye size={14} /> Open Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(null);
                    showNotification('Tailor Resume feature coming soon!', 'info');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-neutral-900 flex items-center gap-2 transition-colors"
                >
                  <FileText size={14} /> Tailor Resume
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this job?')) {
                      JobTrackingUtils.deleteJob(job.id);
                      setRefreshTrigger((prev) => prev + 1);
                      showNotification('Job deleted', 'info');
                    }
                    setOpenDropdownId(null);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-auto pl-1 pb-1">
          {job.location && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
              <MapPin size={10} /> {job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
              <DollarSign size={10} /> {job.salary}
            </span>
          )}
          {job.tags?.map((tagId) => {
            const tagInfo = JOB_TAGS.find((t) => t.id === tagId);
            if (!tagInfo) return null;
            return (
              <span key={tagId} className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${tagInfo.color}`}>
                {tagInfo.label}
              </span>
            );
          })}
        </div>
        {job.status === 'interviewing' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              showNotification('Interview prep workflow is available in Interview Prep.', 'info');
            }}
            className="w-full mt-1.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-100/50 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Wand2 size={12} /> Generate Prep Kit
          </button>
        )}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-50 shrink-0">
          {job.matchScore > 0 ? (
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 36 36" className="w-3.5 h-3.5">
                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className={job.matchScore >= 80 ? 'text-emerald-500' : job.matchScore >= 60 ? 'text-amber-500' : 'text-red-500'} strokeDasharray={`${job.matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
              <span className="text-[10px] font-bold text-slate-700">{job.matchScore}%</span>
            </div>
          ) : (
            <span className="text-[10px] font-medium text-slate-400">No score</span>
          )}
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            {isGhosted ? (
              <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100" title={`No activity for ${daysSinceActivity} days`}>
                <AlertTriangle size={10} /> Ghosted?
              </span>
            ) : (
              <>
                <Clock size={10} /> {formatDateStr(job.updatedAt || job.addedAt || job.postedDate)}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col w-full min-w-0 font-sans text-slate-900">
      <CustomStyles />
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-xl shadow-2xl ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white animate-fade-in-up`}>
          <div className="flex items-center gap-3">
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Tracked</span>
            <span className="text-2xl font-bold text-neutral-900">{analytics.total}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">New Leads</span>
            <span className="text-2xl font-bold text-blue-600">{analytics.byStatus['new-leads'] || 0}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Applied</span>
            <span className="text-2xl font-bold text-purple-600">{analytics.totalApplied}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Interviews</span>
            <span className="text-2xl font-bold text-orange-600">{analytics.totalInterviews}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Offers</span>
            <span className="text-2xl font-bold text-emerald-600">{analytics.totalOffers}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between lg:col-span-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg Match Score</span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-neutral-900">{analytics.averageMatchScore}%</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full mb-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-slate-600" style={{ width: `${analytics.averageMatchScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="relative z-30 flex flex-col lg:flex-row items-center gap-4 w-full bg-white p-4 rounded-3xl border border-slate-200/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] mb-6 animate-fade-in-up">
        <div className="flex p-1 bg-slate-100/80 border border-slate-200/50 shadow-inner rounded-xl shrink-0 w-full lg:w-auto">
          <button
            onClick={() => setViewMode('board')}
            className={`flex-1 lg:flex-none px-3 py-1.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${viewMode === 'board' ? 'bg-white text-neutral-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <Layout size={16} /> <span className="hidden xl:inline">Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 lg:flex-none px-3 py-1.5 rounded-md text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <ListTodo size={16} /> <span className="hidden xl:inline">List</span>
          </button>
        </div>
        <div className="relative flex-1 w-full lg:w-auto min-w-[200px] group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/70 hover:border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-400/10 transition-all shadow-sm"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <CustomSelect value={filterBy} onChange={setFilterBy} options={filterOptions} icon={Filter} className="flex-1 sm:flex-none" />
          <CustomSelect value={sortBy} onChange={setSortBy} options={sortOptions} icon={ListFilter} className="flex-1 sm:flex-none" />
          <button onClick={() => setShowManualAdd(true)} className="w-full sm:w-auto px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-bold hover:bg-neutral-800 hover:shadow-md transition-all flex items-center justify-center gap-2 shadow-sm shrink-0">
            <Plus size={16} /> <span className="hidden sm:inline">Add Job</span>
          </button>
        </div>
      </div>
      {viewMode === 'board' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar w-full min-w-0">
          <div className="flex gap-6 h-[calc(100vh-180px)] min-h-[500px] items-stretch px-1 w-max">
            {columns.map((column) => {
              const columnJobs = filteredAndSortedJobs.filter((j) => j.status === column.id);
              return (
                <div
                  key={column.id}
                  className={`w-[320px] shrink-0 flex flex-col rounded-3xl bg-slate-50/50 border transition-all duration-300 ${isDragging ? 'border-dashed border-slate-400 bg-slate-100 ring-4 ring-slate-500/10' : 'border-slate-200/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.04)]'}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="p-4 flex justify-between items-center border-b border-slate-200/60 bg-white/40 rounded-t-3xl sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${column.accent}`} />
                      <h3 className={`font-bold text-sm ${column.text} tracking-wide`}>{column.label}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${column.badge}`}>{columnJobs.length}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar h-full min-h-[150px]">
                    {columnJobs.length > 0 ? (
                      columnJobs.map((job) => renderJobCard(job))
                    ) : (
                      <div className={`w-full h-24 border-2 border-dashed rounded-2xl flex items-center justify-center text-xs font-medium transition-colors duration-300 ${isDragging ? 'border-slate-300 text-slate-500 bg-slate-100' : 'border-slate-200/70 text-slate-400 bg-white/40'}`}>
                        Drop here to move
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar w-full min-w-0">
          <div className="flex flex-col gap-6 pb-6">
            {columns.map((column) => {
              const columnJobs = filteredAndSortedJobs.filter((j) => j.status === column.id);
              return (
                <div
                  key={column.id}
                  className={`w-full flex flex-col rounded-3xl bg-slate-50/50 border transition-all duration-300 ${isDragging ? 'border-dashed border-slate-400 bg-slate-100 ring-4 ring-slate-500/10' : 'border-slate-200/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.04)]'}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="p-4 flex justify-between items-center border-b border-slate-200/60 bg-white/40 rounded-t-3xl sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${column.accent}`} />
                      <h3 className={`font-bold text-sm ${column.text} tracking-wide`}>{column.label}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${column.badge}`}>{columnJobs.length}</span>
                  </div>
                  <div className="p-4 flex flex-wrap gap-4">
                    {columnJobs.length > 0 ? (
                      columnJobs.map((job) => renderJobCard(job))
                    ) : (
                      <div className={`w-full h-24 border-2 border-dashed rounded-2xl flex items-center justify-center text-xs font-medium transition-colors duration-300 ${isDragging ? 'border-slate-300 text-slate-500 bg-slate-100' : 'border-slate-200/70 text-slate-400 bg-white/40'}`}>
                        Drop here to move
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showManualAdd && <ManualAddModal setShowManualAdd={setShowManualAdd} setRefreshTrigger={setRefreshTrigger} setSelectedJob={setSelectedJob} showNotification={showNotification} />}
      {selectedJob && <JobDetailsModal selectedJob={selectedJob} setSelectedJob={setSelectedJob} handleJobUpdate={handleJobUpdate} handleDeleteJob={handleDeleteJob} showNotification={showNotification} columns={columns} />}
      {selectedJobIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-neutral-900/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-6 animate-fade-in-up border border-white/10">
          <div className="flex items-center gap-2 text-sm font-bold shrink-0">
            <span className="bg-slate-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-inner">{selectedJobIds.length}</span>
            Selected
          </div>
          <div className="w-px h-6 bg-white/20 shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => handleBulkAction('archived')} className="px-3 py-1.5 text-xs font-bold hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5">
              <Archive size={14} /> Archive
            </button>
            <button onClick={() => handleBulkAction('rejected')} className="px-3 py-1.5 text-xs font-bold hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5">
              <XCircle size={14} /> Reject
            </button>
            <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors flex items-center gap-1.5">
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <div className="w-px h-6 bg-white/20 shrink-0" />
          <button onClick={() => setSelectedJobIds([])} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white shrink-0" title="Cancel selection">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default JobTracker;
