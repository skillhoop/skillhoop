/**
 * Smart Job Matcher — Single source of truth for Job Finder.
 * Uses ONLY real APIs: searchJobs (jobService) + predictiveJobMatching.
 * JobFinderModule.tsx is not used; dashboard renders this page.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, Briefcase, MapPin, DollarSign, Calendar, Building2, 
  ExternalLink, BookmarkPlus, Check, ChevronDown, X, Loader2, 
  Star, Clock, FileText, Upload, Sparkles, Target, TrendingUp, 
  AlertCircle, BarChart3, ArrowLeft, Plus, GraduationCap, Globe,
  SlidersHorizontal, Share2, MoreHorizontal, Layers, CheckCircle2, AlertTriangle,
  FolderOpen
} from 'lucide-react';
import {
  getJobRecommendations,
  generateJobAlerts,
  type JobRecommendation,
  type JobListing,
  type ResumeProfile,
  type JobAlert
} from '../lib/predictiveJobMatching';
import { WorkflowTracking } from '../lib/workflowTracking';
import { useWorkflowContext } from '../hooks/useWorkflowContext';
import { useNavigate } from 'react-router-dom';
import FirstTimeEntryCard from '../components/workflows/FirstTimeEntryCard';
import WorkflowBreadcrumb from '../components/workflows/WorkflowBreadcrumb';
import WorkflowPrompt from '../components/workflows/WorkflowPrompt';
import WorkflowCompletion from '../components/workflows/WorkflowCompletion';
import WorkflowTransition from '../components/workflows/WorkflowTransition';
import WorkflowQuickActions from '../components/workflows/WorkflowQuickActions';
import type { Job as JSearchJob } from '../types/job';
import { searchJobs } from '../lib/services/jobService';
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/networkErrorHandler';

// --- Types (aligned with jobService JSearch response + UI) ---
interface Job {
  id: string; // matches job_id from jobService (JSearch)
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string;
  postedDate: string;
  url: string;
  source: string;
  matchScore?: number;
  whyMatch?: string;
  logoInitial?: string;
  logoColor?: string;
  /** Match reasons from AI (for "Why this is a top match") */
  reasons?: string[];
  daysAgo?: string;
  experienceLevel?: string;
}

interface Filters {
  datePosted: string;
  experienceLevel: string;
  remote: string;
  salaryRange: string;
}

interface ResumeFilters {
  workType: string;
  remote: string;
  experienceLevel: string;
  minSalary: string;
  location: string;
}

interface TrackedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  postedDate: string;
  source: string;
  status: string;
  notes: string;
  applicationDate: string;
  interviewDate: string;
  contacts: string;
  url: string;
  whyMatch?: string;
  description?: string;
  addedFrom: string;
  addedAt: string;
}

interface ResumeData {
  personalInfo?: {
    fullName?: string; // Changed from 'name' to 'fullName' for consistency
    name?: string; // Keep for backward compatibility
    title?: string; // Job title when provided by parser
    jobTitle?: string; // Same as title; used by app and Job Finder search
    email?: string;
    location?: string;
  };
  skills?: {
    technical?: string[];
    soft?: string[];
  };
  experience?: Array<{
    position?: string;
    company?: string;
    location?: string;
    duration?: string;
    description?: string;
  }>;
  summary?: string;
}

// --- Job Tracking Utilities ---
const JobTrackingUtils = {
  getAllTrackedJobs(): TrackedJob[] {
    try {
      const stored = localStorage.getItem('tracked_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveTrackedJobs(jobs: TrackedJob[]): boolean {
    try {
      localStorage.setItem('tracked_jobs', JSON.stringify(jobs));
      localStorage.setItem('tracked_jobs_last_updated', Date.now().toString());
      return true;
    } catch {
      return false;
    }
  },

  addJobToTracker(job: Job, source = 'job-finder', status = 'new-leads'): { success: boolean; message: string; duplicate?: boolean; job?: TrackedJob } {
    const trackedJobs = this.getAllTrackedJobs();
    
    const isDuplicate = trackedJobs.some(tracked => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });

    if (isDuplicate) {
      return { success: false, message: 'This job is already being tracked', duplicate: true };
    }

    const trackerJob: TrackedJob = {
      id: Date.now() + Math.random(),
      title: job.title || 'Untitled Position',
      company: job.company || 'Unknown Company',
      location: job.location || 'Not specified',
      salary: job.salary || 'Competitive',
      matchScore: job.matchScore || 0,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0],
      source: job.source || source,
      status: status,
      notes: job.whyMatch ? `Why this matches: ${job.whyMatch}` : '',
      applicationDate: '',
      interviewDate: '',
      contacts: '',
      url: job.url || '#',
      whyMatch: job.whyMatch || '',
      description: job.description,
      addedFrom: source,
      addedAt: new Date().toISOString()
    };

    trackedJobs.push(trackerJob);
    this.saveTrackedJobs(trackedJobs);

    return { success: true, message: 'Job added to tracker!', job: trackerJob };
  },

  isJobTracked(job: Job): boolean {
    const trackedJobs = this.getAllTrackedJobs();
    return trackedJobs.some(tracked => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });
  },

  bulkAddJobs(jobs: Job[], source = 'job-finder', minMatchScore = 0): { total: number; added: number; duplicates: number } {
    const filteredJobs = minMatchScore > 0 ? jobs.filter(job => (job.matchScore || 0) >= minMatchScore) : jobs;
    let added = 0;
    let duplicates = 0;

    filteredJobs.forEach(job => {
      const result = this.addJobToTracker(job, source, 'new-leads');
      if (result.success) added++;
      if (result.duplicate) duplicates++;
    });

    return { total: filteredJobs.length, added, duplicates };
  }
};

// --- Location Database ---
const locationDatabase = [
  'Remote', 'Remote, Worldwide',
  'Hyderabad, Telangana, India', 'Mumbai, Maharashtra, India', 'Delhi, India',
  'Bangalore, Karnataka, India', 'Chennai, Tamil Nadu, India', 'Pune, Maharashtra, India',
  'New York, NY, United States', 'Los Angeles, CA, United States', 'San Francisco, CA, United States',
  'Chicago, IL, United States', 'Boston, MA, United States', 'Seattle, WA, United States',
  'Austin, TX, United States', 'Denver, CO, United States', 'Miami, FL, United States',
  'London, England, United Kingdom', 'Manchester, England, United Kingdom', 'Berlin, Germany',
  'Paris, France', 'Amsterdam, Netherlands', 'Toronto, Ontario, Canada', 'Vancouver, BC, Canada',
  'Sydney, NSW, Australia', 'Melbourne, VIC, Australia', 'Singapore', 'Tokyo, Japan',
  'Dubai, United Arab Emirates'
];

// --- Job Titles Database ---
const jobTitlesDatabase = [
  'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
  'Data Scientist', 'Data Analyst', 'Business Analyst',
  'Product Manager', 'Senior Product Manager', 'Technical Product Manager',
  'Project Manager', 'Program Manager', 'Scrum Master',
  'UX Designer', 'UI Designer', 'Product Designer',
  'Marketing Manager', 'Digital Marketing Manager', 'Content Marketing Manager',
  'Sales Manager', 'Business Development Manager', 'Account Manager',
  'Machine Learning Engineer', 'AI Engineer', 'Cloud Engineer',
  'QA Engineer', 'Test Engineer', 'Security Engineer'
];

/** Format "days ago" from JSearch posted date */
function getDaysAgo(postedDate: string): string {
  if (!postedDate) return 'Recently';
  const d = new Date(postedDate);
  if (isNaN(d.getTime())) return 'Recently';
  const diff = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

const LOGO_COLORS = ['bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-slate-800'];
function getLogoColor(companyName: string): string {
  let n = 0;
  for (let i = 0; i < (companyName || '').length; i++) n += (companyName as string).charCodeAt(i);
  return LOGO_COLORS[Math.abs(n) % LOGO_COLORS.length];
}

// --- Filter Panel Component ---
const FilterPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col border-l border-indigo-100 animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-indigo-100 shrink-0 bg-indigo-50/30">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="text-indigo-600 w-6 h-6" />
            All Filters
          </h2>
          <button type="button" onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Salary Range</h3>
              <span className="text-sm font-medium text-indigo-600">$80k - $220k+</span>
            </div>
            <div className="relative h-2 bg-indigo-100 rounded-full">
              <div className="absolute left-[20%] right-[10%] h-full bg-indigo-500 rounded-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>$0k</span>
                <span>$300k+</span>
              </div>
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Date Posted
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['Any time', 'Past 24 hours', 'Past week', 'Past month'].map((time) => (
                <button key={time} type="button" className="py-2 px-3 rounded-lg text-sm font-medium border transition-all bg-indigo-50/50 border-indigo-200 text-gray-700 hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-800">
                  {time}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Experience Level</h3>
            <div className="space-y-2">
              {['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'].map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{level}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Job Type</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input defaultChecked className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Full-time</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Contract</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                <span className="text-gray-700 group-hover:text-gray-900">Part-time</span>
              </label>
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Education
            </h3>
            <div className="space-y-2">
              {["Bachelor's Degree", "Master's Degree", "Doctorate", "High School or equivalent"].map((edu) => (
                <label key={edu} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{edu}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="h-px bg-indigo-100" />
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              Industry
            </h3>
            <div className="space-y-2">
              {['Technology', 'Financial Services', 'Healthcare', 'E-commerce', 'Entertainment'].map((ind) => (
                <label key={ind} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                  <span className="text-gray-700 group-hover:text-gray-900">{ind}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-indigo-100 bg-indigo-50/30 shrink-0 flex items-center gap-4">
          <button type="button" onClick={onClose} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Reset all</button>
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white font-semibold rounded-lg shadow-sm transition-all">Show results</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
/** Format location from JSearch job city/state/country */
function formatJSearchLocation(job: JSearchJob): string {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Location not specified';
}

/**
 * Sanitize location for JSearch query: strip text after hyphen, remove digits.
 * Broaden to metro: Secundrabad/Secunderabad/Lalpet -> Hyderabad for better JSearch results.
 */
function sanitizeLocationForQuery(loc: string): string {
  if (!loc?.trim()) return '';
  let s = loc.trim();
  const hyphenIdx = s.indexOf(' - ');
  if (hyphenIdx !== -1) s = s.slice(0, hyphenIdx).trim();
  const hyphenIdx2 = s.indexOf('-');
  if (hyphenIdx2 !== -1) s = s.slice(0, hyphenIdx2).trim();
  s = s.replace(/\d+/g, '').trim();
  s = s.replace(/\s+/g, ' ').trim();
  const lower = s.toLowerCase();
  if (lower === 'secundrabad' || lower === 'secunderabad' || lower === 'lalpet') return 'Hyderabad';
  return s;
}

/**
 * Sanitize job title for JSearch query: strip special chars (/ - etc.), take first two words.
 * e.g. "Accounts Receivable / Collector" -> "Accounts Receivable"
 */
function sanitizeTitleForQuery(title: string): string {
  if (!title?.trim()) return '';
  const stripped = title.replace(/[/\-–—,|&]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = stripped.split(/\s+/).filter(Boolean);
  return words.slice(0, 2).join(' ');
}

/** Convert JSearch job (jobService) to display Job for UI/tracking */
function jsearchToJob(j: JSearchJob): Job {
  const salaryStr =
    j.job_min_salary != null && j.job_max_salary != null
      ? `$${Math.round(j.job_min_salary / 1000)}k - $${Math.round(j.job_max_salary / 1000)}k`
      : 'Competitive';
  return {
    id: j.job_id,
    title: j.job_title,
    company: j.employer_name,
    location: formatJSearchLocation(j),
    salary: salaryStr,
    type: 'Full-time',
    description: j.job_description || j.job_highlights?.Qualifications?.join(' ') || '',
    requirements: j.job_highlights?.Responsibilities?.join(' ') || j.job_highlights?.Qualifications?.join(' ') || '',
    postedDate: j.job_posted_at_datetime_utc?.split('T')[0] ?? '',
    url: j.job_apply_link,
    source: 'JSearch',
    matchScore: 0,
  };
}

// --- JobCompanyLogo Component ---
interface JobCompanyLogoProps {
  logoUrl: string | null | undefined;
  companyName: string;
}

const JobCompanyLogo: React.FC<JobCompanyLogoProps> = ({ logoUrl, companyName }) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state when logoUrl changes
  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

  // If no logo URL provided or image failed to load, show fallback icon
  if (!logoUrl || imageError) {
    return (
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
        <Building2 className="w-6 h-6 text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

interface JobFinderProps {
  onViewChange?: (view: string) => void;
  initialSearchTerm?: string;
}

const JobFinder = ({ onViewChange, initialSearchTerm }: JobFinderProps = {}) => {
  const navigate = useNavigate();

  // Tab state (Quick Search removed — only Personalized Jobs + History)
  const [activeTab, setActiveTab] = useState<'resumes' | 'history'>('resumes');

  // Workflow state
  const { workflowContext, updateContext } = useWorkflowContext();
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);

  // Workspace view (split pane) state
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [selectedWorkspaceJobId, setSelectedWorkspaceJobId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search bar state (used in workspace header; optional initial from props)
  const [quickSearchJobTitle, setQuickSearchJobTitle] = useState(initialSearchTerm ?? '');
  const [quickSearchLocation, setQuickSearchLocation] = useState('');
  const [jobResults, setJobResults] = useState<Job[]>([]);
  
  // Personalized Search state
  const [personalizedJobResults, setPersonalizedJobResults] = useState<Job[]>([]);
  const [isSearchingPersonalized, setIsSearchingPersonalized] = useState(false);
  const personalizedSearchInFlightRef = useRef(false); // Guard against double call (e.g. Strict Mode)
  const [selectedSearchStrategy, setSelectedSearchStrategy] = useState<string | null>(null);
  
  // Resume state
  const [uploadedResumes, setUploadedResumes] = useState<Record<string, ResumeData>>({});
  const [activeResume, setActiveResume] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  // Manual Entry fallback when title/skills weren't detected from resume
  const [manualJobTitle, setManualJobTitle] = useState('');
  const [manualTopSkills, setManualTopSkills] = useState('');
  
  // Suggestions state
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    datePosted: 'Any time',
    experienceLevel: 'Any level',
    remote: 'Any',
    salaryRange: 'Any'
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState<Record<string, boolean>>({});
  const [showResumeDataDebug, setShowResumeDataDebug] = useState(false);

  // Resume filters state
  const [resumeFilters, setResumeFilters] = useState<ResumeFilters>({
    workType: 'Full-time',
    remote: 'Any',
    experienceLevel: 'Any level',
    minSalary: 'Any',
    location: ''
  });
  
  // Tracking state
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Predictive matching state
  const [predictiveRecommendations, setPredictiveRecommendations] = useState<JobRecommendation[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);

  // Sync initialSearchTerm into search bar
  useEffect(() => {
    if (initialSearchTerm != null) setQuickSearchJobTitle(initialSearchTerm);
  }, [initialSearchTerm]);

  // Keep selected job in sync with personalized results (e.g. after new search: select first if current id not in list)
  useEffect(() => {
    if (!showWorkspace || personalizedJobResults.length === 0) return;
    const exists = selectedWorkspaceJobId && personalizedJobResults.some(j => j.id === selectedWorkspaceJobId);
    if (!exists) setSelectedWorkspaceJobId(personalizedJobResults[0].id);
  }, [showWorkspace, personalizedJobResults, selectedWorkspaceJobId]);

  // Check for workflow context changes
  useEffect(() => {
    if (workflowContext?.workflowId === 'job-application-pipeline') {
      const workflow = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (workflow) {
        const findJobsStep = workflow.steps.find(s => s.id === 'find-jobs');
        if (findJobsStep && findJobsStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'find-jobs', 'in-progress');
        }
      }
    }
  }, [workflowContext]);

  // Load data on mount
  useEffect(() => {
    // Load tracked jobs
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map(j => j.url)));
    
    // Load saved resumes from localStorage (full data)
    const savedResumes = localStorage.getItem('parsed_resumes');
    if (savedResumes) {
      try {
        const resumes = JSON.parse(savedResumes) as Record<string, ResumeData>;
        setUploadedResumes(resumes);
        const activeResumeName = localStorage.getItem('active_resume_for_job_search');
        if (activeResumeName && resumes[activeResumeName]) {
          setActiveResume(activeResumeName);
          setResumeData(resumes[activeResumeName]);
        } else if (Object.keys(resumes).length > 0) {
          const firstResume = Object.keys(resumes)[0];
          setActiveResume(firstResume);
          setResumeData(resumes[firstResume]);
        }
      } catch {
        setUploadedResumes({});
      }
    }
  }, []);

  // Sync manual entry fields when active resume changes so form reflects current resume
  useEffect(() => {
    if (!resumeData) {
      setManualJobTitle('');
      setManualTopSkills('');
      return;
    }
    const title =
      resumeData.personalInfo?.jobTitle ??
      resumeData.personalInfo?.title ??
      resumeData.experience?.[0]?.position ??
      '';
    setManualJobTitle(title);
    setManualTopSkills((resumeData.skills?.technical ?? []).join(', '));
  }, [activeResume, resumeData]);

  // When resumes tab is active, re-sync from localStorage so list always has full parsed_resumes data
  useEffect(() => {
    if (activeTab !== 'resumes') return;
    const raw = localStorage.getItem('parsed_resumes');
    if (!raw) return;
    try {
      const resumes = JSON.parse(raw) as Record<string, ResumeData>;
      setUploadedResumes(resumes);
      const currentActive = activeResume;
      if (currentActive && resumes[currentActive]) {
        setResumeData(resumes[currentActive]);
      } else if (Object.keys(resumes).length > 0 && !resumes[currentActive ?? '']) {
        const first = Object.keys(resumes)[0];
        setActiveResume(first);
        setResumeData(resumes[first]);
      }
    } catch {
      // ignore parse errors
    }
  }, [activeTab]);

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Handle job title input
  const handleJobTitleChange = (value: string) => {
    setQuickSearchJobTitle(value);
    if (value.trim().length > 0) {
      const filtered = jobTitlesDatabase.filter(title =>
        title.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setJobTitleSuggestions(filtered);
      setShowJobTitleSuggestions(true);
    } else {
      setJobTitleSuggestions([]);
      setShowJobTitleSuggestions(false);
    }
  };

  // Handle location input
  const handleLocationChange = (value: string) => {
    setQuickSearchLocation(value);
    if (value.trim().length > 0) {
      const filtered = locationDatabase.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  // Handle filter toggle
  const handleToggleFilter = (filterType: string) => {
    setShowFilterDropdown(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [filterType]: !prev[filterType]
    }));
  };

  // Handle filter selection
  const handleSelectFilter = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setShowFilterDropdown({});
  };

  // Parse duration string to approximate years (e.g. "2 years", "2020 - 2023", "Jan 2020 - Present") for ATS tenure. Role-agnostic: 5 years "Freelance Illustration" counts the same as 5 years "Accounts Receivable".
  const parseDurationToYears = (duration: string | undefined): number | null => {
    if (!duration || !duration.trim()) return null;
    const d = duration.trim().toLowerCase();
    const yearsMatch = d.match(/(\d+)\+?\s*(?:years?|yrs?)/);
    if (yearsMatch) return parseInt(yearsMatch[1], 10);
    const rangeMatch = d.match(/(\d{4})\s*[-–]\s*(?:present|now|current|\d{4})/i) || d.match(/(\d{4})\s*[-–]\s*(\d{4})/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : new Date().getFullYear();
      return Math.max(0, end - start);
    }
    return null;
  };

  // Convert ResumeData to ResumeProfile (uses Manual Entry fallbacks so AI always gets valid title/skills)
  const convertToResumeProfile = (data: ResumeData | null): ResumeProfile | null => {
    if (!data) return null;
    const manualSkillsList = manualTopSkills.trim()
      ? manualTopSkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const skillsFromData = data.skills?.technical || [];
    const experienceList = data.experience?.length
      ? (data.experience || []).map((exp, i) => ({
          title: (i === 0 && !exp.position && manualJobTitle.trim()) ? manualJobTitle.trim() : (exp.position || 'Unknown'),
          company: exp.company || 'Unknown',
          duration: exp.duration || 'Not specified',
          description: exp.description || ''
        }))
      : (manualJobTitle.trim() ? [{
          title: manualJobTitle.trim(),
          company: 'Unknown',
          duration: 'Not specified',
          description: ''
        }] : []);
    const yearsFromDurations = (data.experience || [])
      .map((e) => parseDurationToYears(e.duration))
      .filter((y): y is number => y != null);
    const totalYears = yearsFromDurations.length > 0
      ? yearsFromDurations.reduce((a, b) => a + b, 0)
      : null;
    return {
      skills: skillsFromData.length > 0 ? [...skillsFromData, ...(data.skills?.soft || [])] : [...manualSkillsList, ...(data.skills?.soft || [])],
      experience: experienceList.length > 0 ? experienceList : [{ title: 'Unknown', company: 'Unknown', duration: 'Not specified', description: '' }],
      education: [],
      location: data.personalInfo?.location,
      yearsOfExperience: totalYears ?? data.experience?.length ?? (manualJobTitle.trim() ? 1 : 0),
      industry: undefined,
      currentSalary: undefined
    };
  };

  // Build search query and goal description from selected strategy + resume.
  // Uses actual title/location from resume (no hardcoded tech or US city defaults).
  const buildStrategicQuery = (): { query: string; searchGoal: string } => {
    const extractedTitle = (
      resumeData?.personalInfo?.jobTitle?.trim() ||
      resumeData?.personalInfo?.title?.trim() ||
      resumeData?.experience?.[0]?.position?.trim() ||
      manualJobTitle.trim() ||
      ''
    ).trim();
    const fromResumeSkills = resumeData?.skills?.technical || [];
    const manualSkillsList = manualTopSkills.trim()
      ? manualTopSkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const skills = fromResumeSkills.length > 0 ? fromResumeSkills : manualSkillsList;
    // If no title from resume/manual, use first 2-3 words of first technical skill (never long summary sentences)
    const recentJob = extractedTitle
      ? extractedTitle
      : (skills[0] ? skills[0].split(/\s+/).slice(0, 3).join(' ') : '');
    console.log('Source Title for Query:', extractedTitle || (recentJob ? `(fallback: ${recentJob})` : '(empty)'));
    const rawLocation = (
      resumeFilters.location?.trim() ||
      resumeData?.personalInfo?.location?.trim() ||
      ''
    ).trim();
    const location = sanitizeLocationForQuery(rawLocation);

    const careerProgressionTitles: Record<string, string[]> = {
      'software engineer': ['Senior Software Engineer', 'Staff Engineer', 'Principal Engineer'],
      'product designer': ['Senior Product Designer', 'Product Manager', 'Lead Product Designer'],
      'data scientist': ['Senior Data Scientist', 'Lead Data Scientist', 'ML Engineer'],
      'product manager': ['Senior Product Manager', 'Director of Product', 'VP Product'],
      'frontend developer': ['Senior Frontend Developer', 'Staff Frontend Engineer'],
      'backend developer': ['Senior Backend Developer', 'Staff Backend Engineer'],
      'full stack': ['Senior Full Stack Engineer', 'Staff Engineer'],
      'ux designer': ['Senior UX Designer', 'Lead UX Designer', 'Product Designer'],
      'project manager': ['Senior Project Manager', 'Program Manager', 'Delivery Manager'],
      'analyst': ['Senior Analyst', 'Lead Analyst', 'Manager']
    };

    const industryTerms = ['SaaS', 'Fintech', 'Healthtech'];
    const industryKeywords = ['fintech', 'finance', 'banking', 'healthcare', 'healthtech', 'saas', 'edtech', 'ecommerce', 'retail', 'insurance', 'consulting'];

    let queryParts: string[] = [];
    let searchGoal = 'Match jobs to your background and skills';

    switch (selectedSearchStrategy) {
      case 'career_progression': {
        if (!recentJob) {
          queryParts = [];
          searchGoal = 'Career progression: next-step roles. Add a job title (resume or manual) for better results.';
          break;
        }
        const lower = recentJob.toLowerCase();
        if (lower.includes('junior')) {
          const seniorTitle = recentJob.replace(/junior/gi, 'Senior').trim();
          queryParts = [seniorTitle];
        } else {
          const matchedKey = Object.keys(careerProgressionTitles).find(k => lower.includes(k));
          if (matchedKey && careerProgressionTitles[matchedKey]) {
            queryParts = careerProgressionTitles[matchedKey].slice(0, 2);
          } else {
            queryParts = [`${recentJob} Manager`, `${recentJob} Lead`];
          }
        }
        searchGoal = `Career progression: next-step roles (e.g. ${queryParts[0]}) based on current title "${recentJob}". Weight match scores for growth fit.`;
        break;
      }
      case 'industry_switch': {
        const roleWithoutIndustry = recentJob
          ? industryKeywords.reduce((acc, kw) => acc.replace(new RegExp(kw, 'gi'), ''), recentJob).replace(/\s+/g, ' ').trim() || recentJob
          : '';
        queryParts = roleWithoutIndustry ? [roleWithoutIndustry, ...industryTerms] : industryTerms;
        searchGoal = `Industry switch: same role in different industry (e.g. ${industryTerms.join(', ')}). Weight transferable skills and cultural fit.`;
        break;
      }
      case 'skill_based': {
        if (skills.length > 0) {
          queryParts = skills.slice(0, 5);
          searchGoal = `Skill-based match: prioritize jobs that require these skills (${queryParts.join(', ')}). Weight technical fit over title.`;
        } else {
          queryParts = recentJob ? [recentJob] : [];
          searchGoal = recentJob ? 'Match jobs to your background.' : 'Match jobs to your skills. Add title or skills for better results.';
        }
        break;
      }
      case 'passion_based':
        searchGoal = 'Match jobs to interests and passion areas. Weight motivation and culture fit.';
        queryParts = recentJob ? [recentJob, ...skills.slice(0, 2)] : skills.slice(0, 3);
        break;
      case 'background':
      default:
        queryParts = recentJob ? [recentJob] : [];
        if (skills.length > 0) queryParts.push(...skills.slice(0, 3));
        break;
    }

    // Elastic JSearch query: [Simplified Title] [City] only — no skills (AI matches skills after results).
    const titleForQuery = extractedTitle || recentJob || '';
    const simplifiedTitle = sanitizeTitleForQuery(titleForQuery);
    const queryPartsShort = [simplifiedTitle, location].filter(Boolean);
    let query = queryPartsShort.join(' ').replace(/"/g, '');
    console.log('JSearch Final Query:', query);
    console.log('[AI_AUDIT] Strategic query', {
      strategy: selectedSearchStrategy,
      inputTitle: recentJob,
      transformedQuery: query,
      searchGoal
    });
    return { query, searchGoal };
  };

  // Personalized search: searchJobs(query) -> getJobRecommendations(resume, jobs) -> showWorkspace
  // Uses the selected Existing CV (resumeData) and selectedSearchStrategy to build the query and for AI matching.
  const handlePersonalizedSearch = async () => {
    if (!activeResume || !resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }
    if (personalizedSearchInFlightRef.current) return; // Prevent double invocation (Strict Mode / double click)
    personalizedSearchInFlightRef.current = true;

    setIsSearchingPersonalized(true);
    setIsGeneratingRecommendations(true);

    const jobUrlMap = new Map<string, string>();

    try {
      const { query, searchGoal } = buildStrategicQuery();

      // Step 1: Fetch real jobs from JSearch
      const jsearchJobs = await searchJobs(query);

      if (jsearchJobs.length === 0) {
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('No real jobs found in your area to match.', 'error');
        return;
      }

      // Convert JSearch jobs to JobListing for AI
      const jobListings = jsearchJobs.map(job => {
        jobUrlMap.set(job.job_id, job.job_apply_link);
        return {
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: formatJSearchLocation(job),
          description: job.job_description || job.job_highlights?.Qualifications?.join(' ') || '',
          requirements: job.job_highlights?.Responsibilities?.join(' ') || job.job_highlights?.Qualifications?.join(' ') || '',
          salaryRange: job.job_min_salary != null && job.job_max_salary != null
            ? `$${Math.round(job.job_min_salary / 1000)}k - $${Math.round(job.job_max_salary / 1000)}k`
            : undefined,
          postedDate: job.job_posted_at_datetime_utc?.split('T')[0] ?? '',
          source: 'JSearch',
          experienceLevel: resumeFilters.experienceLevel !== 'Any level' ? resumeFilters.experienceLevel : undefined
        };
      });

      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('Failed to convert resume to profile.', 'error');
        return;
      }

      const topForAi = jobListings.slice(0, 15);
      if (topForAi.length === 0) {
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('No jobs to rank. Try a different search.', 'info');
        return;
      }

      let recommendations: JobRecommendation[];
      try {
        recommendations = await getJobRecommendations(profile, topForAi, 15, searchGoal);
      } catch (aiError) {
        console.error('[JobFinder] getJobRecommendations failed:', aiError);
        const fallbackJobs: Job[] = jsearchJobs.slice(0, 15).map(j => {
          const g = jsearchToJob(j);
          return {
            ...g,
            matchScore: 0,
            whyMatch: '',
            reasons: [],
            logoInitial: (g.company || 'U').substring(0, 1),
            logoColor: getLogoColor(g.company || 'Unknown'),
            daysAgo: getDaysAgo(g.postedDate),
            experienceLevel: resumeFilters.experienceLevel !== 'Any level' ? resumeFilters.experienceLevel : undefined
          };
        });
        setPersonalizedJobResults(fallbackJobs);
        setPredictiveRecommendations([]);
        if (fallbackJobs.length > 0) {
          setSelectedWorkspaceJobId(fallbackJobs[0].id);
          setShowWorkspace(true);
        }
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('AI ranking failed. Showing job list without scores.', 'info');
        return;
      }

      setPredictiveRecommendations(recommendations);

      const enhancedResults: Job[] = recommendations.map(rec => {
        const company = rec.job.company || 'Unknown';
        return {
          ...rec.job,
          id: rec.job.id,
          title: rec.job.title,
          company,
          location: rec.job.location,
          salary: rec.job.salaryRange || 'Competitive',
          type: 'Full-time',
          description: rec.job.description ?? '',
          requirements: rec.job.requirements ?? '',
          postedDate: rec.job.postedDate ?? '',
          url: jobUrlMap.get(rec.job.id) || '#',
          source: rec.job.source ?? 'JSearch',
          matchScore: rec.matchScore,
          whyMatch: rec.whyMatch ?? (Array.isArray(rec.reasons) ? rec.reasons.join(' | ') : ''),
          reasons: rec.reasons ?? [],
          logoInitial: company.substring(0, 1),
          logoColor: getLogoColor(company),
          daysAgo: getDaysAgo(rec.job.postedDate),
          experienceLevel: resumeFilters.experienceLevel !== 'Any level' ? resumeFilters.experienceLevel : undefined
        };
      });

      setPersonalizedJobResults(enhancedResults);
      if (enhancedResults.length > 0) {
        setSelectedWorkspaceJobId(enhancedResults[0].id);
        setShowWorkspace(true);
      }
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
      showNotification('Found personalized job matches!', 'success');
    } catch (error) {
      console.error('Error in personalized search:', error);
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
      showNotification(
        error instanceof Error ? error.message : 'Failed to search jobs. Please try again.',
        'error'
      );
    } finally {
      personalizedSearchInFlightRef.current = false;
    }
  };

  // Generate job alerts
  const handleGenerateJobAlerts = async () => {
    if (!resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }

    try {
      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        throw new Error('Failed to convert resume to profile');
      }

      const alerts = await generateJobAlerts(profile);
      setJobAlerts(alerts);
      showNotification(`Generated ${alerts.length} job alerts!`, 'success');
    } catch (error) {
      console.error('Error generating job alerts:', error);
      showNotification('Failed to generate alerts. Please check your API key.', 'error');
    }
  };

  // Strip PDF metadata / binary artifacts that can leak into text (e.g. /Type /Catalog)
  const stripPdfMetadataFromText = (text: string): string => {
    return text
      .split(/\r?\n/)
      .filter(line => {
        const t = line.trim();
        if (!t) return true;
        // Drop lines that look like PDF object metadata
        if (/^\s*\/[\w#]+\s+(\/[\w#]+|\d+)\s*$/.test(t)) return false;
        if (/^\s*\/[\w#]+\s*$/.test(t)) return false;
        if (/^\[[\s\d]+\]\s*[<>]/.test(t)) return false;
        return true;
      })
      .join('\n');
  };

  // Convert File to Base64 string (raw base64, no data URL prefix)
  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix if present (e.g. "data:application/pdf;base64,")
        const base64 = result.includes(',') ? result.split(',')[1] ?? result : result;
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(f);
    });

  // Handle resume upload — AI-first: send Base64 to backend for vision-based parsing (works for Canva/complex PDFs)
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('text') && !file.name.endsWith('.docx')) {
      showNotification('Please upload a PDF, DOCX, or TXT file', 'error');
      return;
    }

    setIsUploadingResume(true);

    try {
      const base64 = await fileToBase64(file);
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) {
        showNotification('Please sign in to upload and parse your resume.', 'error');
        return;
      }

      const apiUrl = typeof window !== 'undefined' && window.location?.hostname === 'localhost'
        ? 'http://localhost:3000/api/generate'
        : '/api/generate';

      const payload = {
        fileData: base64,
        fileName: file.name,
        mimeType: file.type,
        userId,
        feature_name: 'job_finder',
      };

      const data = await apiFetch<{ content: string }>(apiUrl, {
        method: 'POST',
        body: payload,
        timeout: 90000,
        retries: 2,
      });

      const content = data?.content;
      if (!content) {
        showNotification('No data returned from resume analysis. Please try again.', 'error');
        return;
      }

      // Extract JSON from response (model may wrap in markdown or extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const raw = jsonMatch ? jsonMatch[0] : content;
      type AIParsed = {
        personalInfo?: {
          fullName?: string;
          name?: string;
          email?: string;
          location?: string;
          jobTitle?: string;
          title?: string;
        };
        skills?: { technical?: string[]; soft?: string[] };
        'technical skills'?: string[];
        technicalSkills?: string[];
        'soft skills'?: string[];
        softSkills?: string[];
        experience?: Array<{ position?: string; company?: string; location?: string; duration?: string; description?: string }>;
        'professional experience'?: Array<{ position?: string; company?: string; location?: string; duration?: string; description?: string }>;
        summary?: string;
      };
      const parsed = JSON.parse(raw) as AIParsed;

      const skillsObj = parsed.skills;
      const technical = Array.isArray(skillsObj?.technical)
        ? skillsObj.technical
        : parsed['technical skills'] ?? parsed.technicalSkills ?? [];
      const soft = Array.isArray(skillsObj?.soft)
        ? skillsObj.soft
        : parsed['soft skills'] ?? parsed.softSkills ?? [];
      const experienceList = parsed.experience ?? parsed['professional experience'] ?? [];

      const jobTitleFromApi =
        (parsed.personalInfo?.jobTitle ?? parsed.personalInfo?.title ?? '').trim();

      const parsedData: ResumeData = {
        personalInfo: {
          fullName: parsed.personalInfo?.fullName ?? parsed.personalInfo?.name ?? '',
          email: parsed.personalInfo?.email ?? '',
          location: parsed.personalInfo?.location ?? '',
          title: jobTitleFromApi || undefined,
          jobTitle: jobTitleFromApi || undefined,
        },
        skills: {
          technical: Array.isArray(technical) ? technical : [],
          soft: Array.isArray(soft) ? soft : [],
        },
        experience: Array.isArray(experienceList)
          ? experienceList.map(
              (e: {
                position?: string;
                company?: string;
                location?: string;
                duration?: string;
                description?: string;
              }) => ({
                position: e.position ?? '',
                company: e.company ?? '',
                location: e.location ?? '',
                duration: e.duration ?? '',
                description: e.description ?? '',
              })
            )
          : [],
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      };

      const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
      savedResumes[file.name] = parsedData;
      localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));

      setUploadedResumes(savedResumes);
      setActiveResume(file.name);
      setResumeData(parsedData);
      localStorage.setItem('active_resume_for_job_search', file.name);

      showNotification('Resume uploaded and analyzed successfully!', 'success');
    } catch (error) {
      console.warn('Resume upload/parse error:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to upload or parse resume. Please try again.',
        'error'
      );
    } finally {
      setIsUploadingResume(false);
      event.target.value = '';
    }
  };

  // Select resume
  const handleSelectResume = (resumeName: string) => {
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    if (savedResumes[resumeName]) {
      setActiveResume(resumeName);
      setResumeData(savedResumes[resumeName]);
      localStorage.setItem('active_resume_for_job_search', resumeName);
    }
  };

  // Delete resume
  const handleDeleteResume = (resumeName: string) => {
    if (!confirm(`Are you sure you want to delete "${resumeName}"?`)) return;
    
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    delete savedResumes[resumeName];
    localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
    setUploadedResumes(savedResumes);
    
    if (activeResume === resumeName) {
      const remaining = Object.keys(savedResumes);
      if (remaining.length > 0) {
        handleSelectResume(remaining[0]);
      } else {
        setActiveResume(null);
        setResumeData(null);
        setManualJobTitle('');
        setManualTopSkills('');
        localStorage.removeItem('active_resume_for_job_search');
      }
    }
  };

  // Apply Manual Entry: merge current job title and top skills into resumeData and persist
  const applyManualEntry = () => {
    if (!activeResume || !resumeData) return;
    const title = manualJobTitle.trim();
    const skillsList = manualTopSkills.trim()
      ? manualTopSkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const updated: ResumeData = {
      ...resumeData,
      experience: title
        ? [{ position: title, company: resumeData.experience?.[0]?.company ?? '', description: resumeData.experience?.[0]?.description ?? '' }, ...(resumeData.experience?.slice(1) || [])]
        : resumeData.experience || [],
      skills: {
        ...resumeData.skills,
        technical: skillsList.length > 0 ? skillsList : (resumeData.skills?.technical || [])
      }
    };
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    savedResumes[activeResume] = updated;
    localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
    setUploadedResumes(savedResumes);
    setResumeData(updated);
    showNotification('Manual entry applied. Search will use your job title and skills.', 'success');
  };

  // Track job
  const handleTrackJob = (job: Job) => {
    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'new-leads');
    
    if (result.success) {
      showNotification(`"${job.title}" added to Job Tracker!`, 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map(j => j.url)));
      
      // Update workflow progress - Workflow 1
      const workflow1 = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (workflow1 && workflowContext?.workflowId === 'job-application-pipeline') {
        // Mark find-jobs as completed if we have jobs
        if (tracked.length > 0) {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'find-jobs', 'completed', {
            jobsFound: tracked.length
          });
        }
        
        // Show workflow prompt if in workflow
        if (workflow1.isActive) {
          setShowWorkflowPrompt(true);
          // Store job data in workflow context for next step
          updateContext({
            workflowId: 'job-application-pipeline',
            currentJob: {
              id: result.job?.id,
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              url: job.url
            }
          });
        }
      }
      
      // Update workflow progress - Workflow 3
      const workflow3 = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
      if (workflow3 && workflowContext?.workflowId === 'personal-brand-job-discovery') {
        // Mark find-brand-matched-jobs as completed
        WorkflowTracking.updateStepStatus('personal-brand-job-discovery', 'find-brand-matched-jobs', 'completed', {
          jobsFound: tracked.length,
          brandMatch: true
        });
        
        // Complete the workflow if all steps are done
        if (workflow3.progress === 100) {
          WorkflowTracking.completeWorkflow('personal-brand-job-discovery');
        }
      }
    } else if (result.duplicate) {
      showNotification('This job is already in your tracker', 'info');
    }
  };

  // Apply and track
  const handleApplyAndTrack = (job: Job) => {
    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'applied');
    
    if (result.success || result.duplicate) {
      window.open(job.url, '_blank');
      showNotification('Opening application page...', 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map(j => j.url)));
    }
  };

  // Bulk track
  const handleBulkTrack = (jobs: Job[], minScore = 80) => {
    const result = JobTrackingUtils.bulkAddJobs(jobs, 'job-finder', minScore);
    showNotification(
      `Added ${result.added} jobs to tracker${result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ''}`,
      result.added > 0 ? 'success' : 'info'
    );
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map(j => j.url)));
  };

  // Export CSV
  const handleExportCSV = (jobs: Job[]) => {
    const csv = jobs.map(job =>
      `"${job.title}","${job.company}","${job.location}","${job.salary}","${job.type}","${job.url}"`
    ).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Title,Company,Location,Salary,Type,URL\n' + csv);
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `job-search-results-${Date.now()}.csv`;
    link.click();
    showNotification('Results exported to CSV', 'success');
  };

  // Check if tracked
  const isJobTracked = (job: Job): boolean => trackedJobIds.has(job.url);

  // Match score color
  const getMatchScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Render job card
  const renderJobCard = (job: Job, index: number) => (
    <div key={index} className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
            {job.matchScore > 0 && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(job.matchScore)}`}>
                {job.matchScore}% match
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {job.postedDate}
            </span>
          </div>
          
          <p className="text-slate-700 mb-4">{job.description}</p>
          
          {job.whyMatch && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Why this matches:</strong> {job.whyMatch}
              </p>
            </div>
          )}

          {isJobTracked(job) && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                Already tracked
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {isJobTracked(job) ? (
              <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-all flex items-center gap-1">
                <Check className="w-4 h-4" />
                View in Tracker
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleTrackJob(job); }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-all flex items-center gap-1"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Track This Job
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleApplyAndTrack(job); }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-all flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Apply & Track
                </button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleAnalyzeJob(job); }}
              disabled={isAnalyzingJob || !resumeData}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzingJob && selectedJobForAnalysis?.id === job.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  Analyze Match
                </>
              )}
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // JSearch API job card (title, logo/fallback, location, Apply Now)
  const renderJSearchJobCard = (job: JSearchJob) => {
    const locationStr = formatJSearchLocation(job);
    const internalJob = jsearchToJob(job);
    const isTracked = isJobTracked(internalJob);
    return (
      <div key={job.job_id} className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-start gap-4">
          <JobCompanyLogo logoUrl={job.employer_logo} companyName={job.employer_name} />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-800 mb-1">{job.job_title}</h3>
            <p className="text-slate-600 font-medium mb-2">{job.employer_name}</p>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{locationStr}</span>
            </div>
            <p className="text-slate-700 text-sm line-clamp-3 mb-4">{internalJob.description || '—'}</p>
            <div className="flex flex-wrap gap-2">
              {!isTracked && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleTrackJob(internalJob); }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-all flex items-center gap-1"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Track
                </button>
              )}
              <a
                href={job.job_apply_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-1 inline-flex"
              >
                <ExternalLink className="w-4 h-4" />
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const selectedJob = personalizedJobResults.find(j => j.id === selectedWorkspaceJobId);

  // --- Workspace View (split pane) when user has run personalized search ---
  if (showWorkspace) {
    return (
      <div className="flex flex-col h-[calc(100vh-3rem)] overflow-hidden text-gray-900 font-sans transition-colors duration-200 bg-indigo-50/30">
        <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
        {/* Search bar + filters — pastel border */}
        <div className="shrink-0 p-4 pb-0">
          <div className="w-full bg-white border border-indigo-100 shadow-sm rounded-xl p-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <button onClick={() => setShowWorkspace(false)} className="self-start p-2 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors" aria-label="Back">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-1 w-full gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                    placeholder="Search by title, skill, or company"
                    type="text"
                    value={quickSearchJobTitle}
                    onChange={(e) => setQuickSearchJobTitle(e.target.value)}
                  />
                </div>
                <div className="relative flex-1 min-w-0 hidden sm:block">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                    placeholder="City, state, or zip code"
                    type="text"
                    value={quickSearchLocation || resumeFilters.location}
                    onChange={(e) => setQuickSearchLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0 flex-wrap md:flex-nowrap">
                <button type="button" className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 transition-colors whitespace-nowrap">
                  Date posted
                </button>
                <button type="button" className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 transition-colors whitespace-nowrap">
                  Experience level
                </button>
                <button type="button" className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 transition-colors whitespace-nowrap inline-flex items-center gap-1.5">
                  Remote <X className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-6 bg-indigo-200 mx-1 hidden md:block" />
                <button type="button" onClick={() => setShowFilters(true)} className="px-4 py-2 border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 transition-colors whitespace-nowrap inline-flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                <button type="button" className="md:ml-2 px-4 py-2 text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap" title="Search History">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:inline">History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-hidden flex flex-col min-h-0 pt-4">
          {/* Results header */}
          <div className="flex items-center justify-between mb-3 shrink-0 px-1">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{personalizedJobResults.length} results</span>
              {quickSearchJobTitle ? ` for "${quickSearchJobTitle}"` : ''}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">AI Sorting:</span>
              <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg border border-indigo-100 transition-colors">
                Relevance <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {/* Split: job list + detail */}
          <div className="flex-1 bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden flex min-h-0">
            <div className="w-full md:w-[40%] lg:w-[35%] xl:w-[30%] border-r border-indigo-100 flex flex-col bg-white overflow-y-auto custom-scrollbar">
              {personalizedJobResults.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedWorkspaceJobId(job.id)}
                  className={`p-4 border-b border-indigo-50 cursor-pointer transition-colors relative ${selectedWorkspaceJobId === job.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-indigo-50/50 border-l-2 border-l-transparent'}`}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center p-1 shrink-0">
                      {job.logoInitial ? (
                        <div className={`w-full h-full rounded-md flex items-center justify-center text-white text-sm font-bold ${job.logoColor || 'bg-gray-500'}`}>{job.logoInitial}</div>
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-[15px] leading-tight mb-0.5 truncate ${selectedWorkspaceJobId === job.id ? 'text-indigo-700' : 'text-gray-900'}`}>{job.title}</h3>
                      <p className="text-[13px] text-gray-700 mb-0.5 truncate">{job.company}</p>
                      <p className="text-[12px] text-gray-500 truncate">{job.location}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${job.matchScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{job.matchScore}% Match</span>
                        {job.matchScore >= 95 && <span className="text-[10px] text-indigo-600 flex items-center gap-0.5"><Sparkles className="w-3 h-3 text-indigo-500" /> Top Pick</span>}
                        <span className="text-[11px] text-gray-400 ml-auto">{job.daysAgo || getDaysAgo(job.postedDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedJob ? (
              <div className="hidden md:flex flex-1 flex-col bg-white overflow-hidden relative">
                {/* Sticky header: title, meta, tags, actions */}
                <div className="p-6 border-b border-indigo-100 bg-white shrink-0 z-10 sticky top-0 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{selectedJob.title}</h1>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600 items-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                          <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                          {selectedJob.company}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {selectedJob.location}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-600 font-medium">Be an early applicant</span>
                        <span className="text-gray-400">•</span>
                        <span>Posted {selectedJob.daysAgo || getDaysAgo(selectedJob.postedDate)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-medium text-blue-800">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                          {selectedJob.type || 'Full-time'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg text-xs font-medium text-purple-800">
                          <Layers className="w-3.5 h-3.5 text-purple-600" />
                          {selectedJob.experienceLevel || 'Mid-Senior Level'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => handleTrackJob(selectedJob)} className="p-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors" title="Save">
                        <BookmarkPlus className="w-5 h-5" />
                      </button>
                      <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all">
                        Apply Now <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                  {/* Why this is a top match */}
                  <div className="rounded-xl border border-indigo-100 bg-[#F8F8FC] p-5">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Why this is a top match
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {selectedJob.whyMatch || 'This role aligns with your skills and experience.'}
                    </p>
                    {selectedJob.reasons && selectedJob.reasons.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedJob.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {/* Role Overview / Content */}
                  <div className="space-y-4 pb-12">
                    <h3 className="font-bold text-gray-900 text-lg">Role Overview</h3>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      {selectedJob.description && <p>{selectedJob.description}</p>}
                      {selectedJob.requirements && (
                        <>
                          <h4 className="font-bold text-gray-900 mt-4 mb-2">Requirements</h4>
                          <p>{selectedJob.requirements}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center bg-indigo-50/30 text-indigo-600 border-l border-indigo-100">
                <p className="text-sm font-medium">Select a job to view details</p>
              </div>
            )}
          </div>
        </main>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
          .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
          @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // --- Default view: Personalized Jobs + History tabs (no Quick Search) ---
  return (
    <div className="space-y-6 bg-gradient-to-b from-indigo-50/40 to-transparent rounded-2xl p-1 -m-1">
      {/* First-Time Entry Card */}
      <FirstTimeEntryCard
        featurePath="/dashboard/job-finder"
        featureName="Job Finder"
      />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`} style={{ animation: 'slideIn 0.3s ease-out' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ️'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Workflow Breadcrumb - Workflow 3 */}
      {workflowContext?.workflowId === 'personal-brand-job-discovery' && (
        <WorkflowBreadcrumb
          workflowId="personal-brand-job-discovery"
          currentFeaturePath="/dashboard/job-finder"
        />
      )}

      {/* Workflow Breadcrumb - Workflow 7 */}
      {workflowContext?.workflowId === 'market-intelligence-career-strategy' && (
        <WorkflowBreadcrumb
          workflowId="market-intelligence-career-strategy"
          currentFeaturePath="/dashboard/job-finder"
        />
      )}

      {/* Workflow Prompt - Workflow 1 */}
      {showWorkflowPrompt && workflowContext?.workflowId === 'job-application-pipeline' && (
        <WorkflowPrompt
          workflowId="job-application-pipeline"
          currentFeaturePath="/dashboard/job-finder"
          message="🎉 Job Saved to Tracker! You're making great progress in your Job Application Pipeline workflow."
          actionText="Tailor Resume"
          actionUrl="/dashboard/application-tailor"
          onDismiss={() => setShowWorkflowPrompt(false)}
          onAction={(action) => {
            if (action === 'continue') {
              const context = WorkflowTracking.getWorkflowContext();
              if (workflowContext?.currentJob) {
                updateContext({
                  workflowId: 'job-application-pipeline',
                  currentJob: workflowContext.currentJob,
                  action: 'tailor-resume'
                });
              }
            }
          }}
        />
      )}

      {/* Workflow Breadcrumb - Workflow 1 */}
      {workflowContext?.workflowId === 'job-application-pipeline' && (
        <WorkflowBreadcrumb
          workflowId="job-application-pipeline"
          currentFeaturePath="/dashboard/job-finder"
        />
      )}

      {/* Workflow Quick Actions - Workflow 1 */}
      {workflowContext?.workflowId === 'job-application-pipeline' && (
        <WorkflowQuickActions
          workflowId="job-application-pipeline"
          currentFeaturePath="/dashboard/job-finder"
        />
      )}

      {/* Workflow Transition - Workflow 1 (after job saved) */}
      {workflowContext?.workflowId === 'job-application-pipeline' && trackedJobIds.size > 0 && (
        <WorkflowTransition
          workflowId="job-application-pipeline"
          currentFeaturePath="/dashboard/job-finder"
          compact={true}
        />
      )}

      {/* Workflow Completion - Workflow 3 */}
      {workflowContext?.workflowId === 'personal-brand-job-discovery' && (() => {
        const workflow = WorkflowTracking.getWorkflow('personal-brand-job-discovery');
        return workflow?.completedAt ? (
          <WorkflowCompletion
            workflowId="personal-brand-job-discovery"
            onDismiss={() => {}}
          />
        ) : null;
      })()}

      {/* Resume data debug modal (temporary — verify parsed CV) */}
      {showResumeDataDebug && resumeData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Resume data debug">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowResumeDataDebug(false)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Resume data (selected CV)</h2>
              <button
                type="button"
                onClick={() => setShowResumeDataDebug(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="p-4 overflow-auto text-left text-sm text-gray-800 bg-gray-50 flex-1 rounded-b-xl font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Tab Navigation — pastel-inspired like workflow tabs */}
      <nav className="w-full bg-white rounded-xl shadow-sm border border-indigo-100 p-1.5 flex items-center">
        <button
          onClick={() => setActiveTab('resumes')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'resumes' ? 'bg-[#111827] text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
        >
          <FileText size={18} />
          <span>Personalized Jobs</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'history' ? 'bg-[#111827] text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
        >
          <Clock size={18} />
          <span>History</span>
        </button>
      </nav>

      {/* Personalized Jobs tab: upload resume + customize search + Find Personalized Jobs */}
      {activeTab === 'resumes' && (
        <div className="space-y-6">
          {/* Central content card — separate white card, rounded-2xl (reference) */}
          {Object.keys(uploadedResumes).length === 0 && (
            <>
              <section className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 md:py-20 flex flex-col items-center text-center">
                <div className="mb-6 p-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500">
                  <Upload size={48} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Upload Your Resume</h1>
                <p className="text-gray-500 max-w-md mx-auto mb-8">Upload your CV/resume and get AI-powered job recommendations tailored to your skills.</p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg">
                  <label className="cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto">
                    <input
                      id="resume-upload-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={isUploadingResume}
                    />
                    <span
                      className={`inline-flex items-center justify-center gap-2 py-3 px-8 rounded-lg font-medium transition-all w-full sm:w-auto ${
                        isUploadingResume
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#111827] hover:bg-[#1f2937] text-white shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {isUploadingResume ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload Resume
                        </>
                      )}
                    </span>
                  </label>
                  <label
                    htmlFor="resume-upload-input"
                    className={`inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 font-medium py-3 px-8 rounded-lg shadow-sm transition-all hover:bg-gray-100 hover:-translate-y-0.5 w-full sm:w-auto cursor-pointer ${
                      isUploadingResume ? 'pointer-events-none opacity-60' : ''
                    }`}
                  >
                    <FolderOpen size={18} />
                    Select Your Resume
                  </label>
                </div>
                <p className="mt-6 text-xs font-semibold text-indigo-500/80 uppercase tracking-wide">SUPPORTS PDF, DOCX, AND TXT</p>
              </section>
              {/* Feature cards — pastel backgrounds like dashboard stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 shadow-sm">
                  <Search className="text-blue-600 mb-4" size={24} />
                  <h3 className="font-bold text-gray-900">AI Search</h3>
                  <p className="text-sm text-gray-600">Tailored job listings searched across multiple boards.</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6 shadow-sm">
                  <Sparkles className="text-emerald-600 mb-4" size={24} />
                  <h3 className="font-bold text-gray-900">Smart Matching</h3>
                  <p className="text-sm text-gray-600">Matching against your resume for relevance and fit.</p>
                </div>
                <div className="bg-purple-50 rounded-xl border border-purple-100 p-6 shadow-sm">
                  <Target className="text-purple-600 mb-4" size={24} />
                  <h3 className="font-bold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Track jobs, tailor your resume, or apply with one click.</p>
                </div>
              </div>
            </>
          )}

          {/* Uploaded Resumes — inside white card when has resumes (aligned with reference) */}
          {Object.keys(uploadedResumes).length > 0 && (
            <div className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 md:p-10">
            <div className="border-b border-indigo-100 pb-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Resumes</h1>
                <div className="flex items-center gap-2">
                  {resumeData && (
                    <button
                      type="button"
                      onClick={() => setShowResumeDataDebug(true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 font-medium"
                    >
                      Resume View (debug)
                    </button>
                  )}
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium py-2.5 px-5 rounded-lg shadow-sm transition-all hover:bg-indigo-100">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={isUploadingResume}
                    />
                    <Upload className="w-4 h-4" />
                    Upload New
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(uploadedResumes).map(([name, data]) => (
                  <div
                    key={name}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      activeResume === name
                        ? 'border-indigo-300 bg-indigo-50 shadow-sm ring-1 ring-indigo-200'
                        : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 shadow-sm'
                    }`}
                    onClick={() => handleSelectResume(name)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                          {activeResume === name && (
                            <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">Active</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteResume(name); }}
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Remove resume"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {data.skills?.technical && data.skills.technical.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {data.skills.technical.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-xs rounded-md">
                            {skill}
                          </span>
                        ))}
                        {data.skills.technical.length > 3 && (
                          <span className="text-xs text-gray-500">+{data.skills.technical.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          {/* Customize Your Job Search — aligned with reference */}
          {activeResume && uploadedResumes[activeResume] && (
            <div className="border-t border-indigo-100 pt-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Customize Your Job Search</h1>
              <p className="text-gray-500 mb-6">Select a search strategy based on your goals</p>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Search jobs based on</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'background', label: 'Your Background' },
                    { id: 'career_progression', label: 'Next Career Step' },
                    { id: 'skill_based', label: 'Skill-Based Match' },
                    { id: 'passion_based', label: 'Passion & Interests' },
                    { id: 'industry_switch', label: 'Industry Switch' }
                  ].map(strategy => (
                    <button
                      key={strategy.id}
                      type="button"
                      onClick={() => setSelectedSearchStrategy(selectedSearchStrategy === strategy.id ? null : strategy.id)}
                      disabled={isSearchingPersonalized}
                      className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                        selectedSearchStrategy === strategy.id
                          ? 'bg-[#111827] text-white shadow-lg'
                          : 'bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                      } ${isSearchingPersonalized ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {strategy.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Entry fallback when job title or skills weren't detected — ensures buildStrategicQuery has valid data */}
              {(resumeData && (!resumeData.experience?.[0]?.position || !(resumeData.skills?.technical?.length))) && (
                <div className="mb-6 p-5 rounded-xl border border-amber-200 bg-amber-50/80">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Manual Entry
                  </h3>
                  <p className="text-xs text-amber-800 mb-4">Add your current job title and top skills so recommendations and search work correctly.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Current Job Title</label>
                      <input
                        type="text"
                        value={manualJobTitle}
                        onChange={(e) => setManualJobTitle(e.target.value)}
                        placeholder="e.g. Accounts Receivable, Product Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Top Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={manualTopSkills}
                        onChange={(e) => setManualTopSkills(e.target.value)}
                        placeholder="e.g. JavaScript, React, Python"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={applyManualEntry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#1f2937]"
                  >
                    <Check className="w-4 h-4" />
                    Apply
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Work Type</label>
                  <select
                    value={resumeFilters.workType}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, workType: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remote Preference</label>
                  <select
                    value={resumeFilters.remote}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, remote: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                  >
                    <option value="Any">Any</option>
                    <option value="Remote">Remote Only</option>
                    <option value="On-site">On-site Only</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={resumeFilters.experienceLevel}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                  >
                    <option value="Any level">Any Level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeFilters.location}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State or Remote"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePersonalizedSearch}
                disabled={isSearchingPersonalized}
                className={`w-full flex items-center justify-center gap-2 py-3 px-8 rounded-lg font-medium transition-all ${
                  !isSearchingPersonalized
                    ? 'bg-[#111827] hover:bg-[#1f2937] text-white shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSearchingPersonalized ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI is calculating your next career move...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Find Personalized Jobs
                  </>
                )}
              </button>
            </div>
          )}
            </div>
          )}
        </div>
      )}

      {/* History tab — pastel empty state */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white border border-indigo-100 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Search History</h3>
            <p className="text-slate-500 mb-8">Your past personalized searches will appear here.</p>
            <button
              onClick={() => setActiveTab('resumes')}
              className="px-8 py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-[#1f2937] transition-all shadow-lg active:scale-95"
            >
              Start New Search
            </button>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default JobFinder;
