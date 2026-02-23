import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  ChevronDown, 
  Sparkles, 
  Target, 
  BookmarkPlus, 
  ExternalLink, 
  Loader2, 
  X, 
  Building2, 
  Check, 
  FileText, 
  History, 
  Upload, 
  Star, 
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { searchJobs } from './lib/services/jobService';
import type { Job } from './types/job';
import { getMarketValueEstimate } from './lib/probabilityEngine';

// --- Mocks & Utilities ---

// Mocking the predictiveJobMatching library logic
const getJobRecommendations = async (_profile: any, listings: any[], limit: number) => {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return listings.map(job => ({
        job,
        matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
        salaryPrediction: { predictedMin: 90, predictedMax: 140 },
        reasons: ['Skills match your profile', 'Experience level aligns', 'Industry fit']
    })).sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
};

const predictSalary = async (_profile: any, _job: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        predictedMin: 95,
        predictedMax: 145,
        predictedMedian: 120,
        confidence: 85,
        marketComparison: { percentile: 75, industryAverage: 110 },
        factors: ['High demand skill set', 'Location premium', 'Company tier']
    };
};

const calculateSuccessProbability = async (_profile: any, _job: any) => {
     await new Promise(resolve => setTimeout(resolve, 1000));
     return {
         overallProbability: 78,
         breakdown: { qualifications: 85, experience: 70, skills: 90, location: 100 },
         riskFactors: ['Years of experience slightly below average'],
         improvementSuggestions: ['Highlight leadership experience', 'Add a portfolio link']
     };
};

// Mocking WorkflowContext
const useWorkflowContext = () => {
    const [context, setContext] = useState({ workflowId: 'job-application-pipeline', currentJob: null });
    return {
        workflowContext: context,
        updateContext: (data: any) => {
            console.log('Workflow Context Updated:', data);
            setContext(prev => ({...prev, ...data}));
        }
    };
};

// Mocking WorkflowTracking
const WorkflowTracking = {
    getWorkflow: (_id: string) => {
        return { steps: [{id: 'find-jobs', status: 'not-started'}], isActive: true, progress: 30 };
    },
    updateStepStatus: (workflowId: string, stepId: string, status: string, data?: any) => {
        console.log(`Workflow ${workflowId} step ${stepId} updated to ${status}`, data);
    }
};

const WorkflowPrompt = ({ message, onDismiss, onAction, actionText }: any) => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-fade-in-up border border-white/10">
    <span className="font-medium text-sm">{message}</span>
    <div className="flex gap-2">
        <button onClick={() => onAction('continue')} className="bg-white text-neutral-900 hover:bg-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">{actionText}</button>
        <button onClick={onDismiss} className="text-slate-400 hover:text-white transition-colors"><X size={16}/></button>
    </div>
  </div>
);

// --- Job Tracking Utilities ---
const JobTrackingUtils = {
  getAllTrackedJobs() {
    try {
      const stored = localStorage.getItem('tracked_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveTrackedJobs(jobs: any[]) {
    try {
      localStorage.setItem('tracked_jobs', JSON.stringify(jobs));
      localStorage.setItem('tracked_jobs_last_updated', Date.now().toString());
      return true;
    } catch {
      return false;
    }
  },

  addJobToTracker(job: any, source = 'job-finder', status = 'new-leads') {
    const trackedJobs = this.getAllTrackedJobs();
    
    const isDuplicate = trackedJobs.some((tracked: any) => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });

    if (isDuplicate) {
      return { success: false, message: 'This job is already being tracked', duplicate: true };
    }

    const trackerJob = {
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

  isJobTracked(job: any) {
    const trackedJobs = this.getAllTrackedJobs();
    return trackedJobs.some((tracked: any) => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });
  },

  bulkAddJobs(jobs: any[], source = 'job-finder', minMatchScore = 0) {
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

// --- Databases ---
const locationDatabase = [
  'Remote', 'Remote, Worldwide',
  'New York, NY, United States', 'San Francisco, CA, United States',
  'London, England, United Kingdom', 'Berlin, Germany',
  'Toronto, Ontario, Canada', 'Sydney, NSW, Australia', 'Singapore'
];

const jobTitlesDatabase = [
  'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
  'Product Manager', 'UX Designer', 'Product Designer',
  'Data Scientist', 'Marketing Manager', 'Sales Manager'
];

/** Format salary for display: India → ₹XL - ₹YL (Lakhs/Crores); never append 'k' to Lakhs. */
function formatJobSalary(
  minSal: number,
  maxSal: number,
  location: string
): string {
  const isIndia = (location || '').toLowerCase().includes('india');
  if (isIndia) {
    const fmt = (n: number) =>
      n >= 10000000 ? `₹${(n / 10000000).toFixed(1).replace(/\.0$/, '')}Cr` : `₹${Math.round(n / 100000)}L`;
    return `${fmt(minSal)} - ${fmt(maxSal)}`;
  }
  const minK = Math.round(minSal / 1000);
  const maxK = Math.round(maxSal / 1000);
  return `$${minK}k - $${maxK}k`;
}

/** Map JSearch Job to the display shape used by the UI (no mock data). */
function jsearchToDisplayJob(job: Job, index: number): Record<string, unknown> {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  const location = parts.length > 0 ? parts.join(', ') : 'Remote';
  const salaryStr =
    job.job_min_salary != null && job.job_max_salary != null
      ? formatJobSalary(job.job_min_salary, job.job_max_salary, location)
      : 'Competitive';
  return {
    id: index + 1,
    title: job.job_title,
    company: job.employer_name,
    location,
    salary: salaryStr,
    type: 'Full-time',
    description: job.job_description || job.job_highlights?.Qualifications?.join(' ') || '',
    requirements: job.job_highlights?.Responsibilities?.join(' ') || job.job_highlights?.Qualifications?.join(' ') || '',
    postedDate: job.job_posted_at_datetime_utc?.split('T')[0] ?? '',
    url: job.job_apply_link,
    source: 'JSearch',
    matchScore: 0,
    whyMatch: '',
    job_min_salary: job.job_min_salary ?? undefined,
    job_max_salary: job.job_max_salary ?? undefined,
  };
}

// --- Main Component ---

interface JobFinderProps {
  onViewChange?: (view: string) => void;
  initialSearchTerm?: string;
}

const JobFinder: React.FC<JobFinderProps> = ({ onViewChange, initialSearchTerm }) => {
  // Navigation
  const navigateTo = (path: string) => {
      console.log('Navigate to:', path);
      if (onViewChange && path.includes('tracker')) {
          onViewChange('tracker');
      }
  };
  
  // Tab state
  const [activeTab, setActiveTab] = useState('search');
  
  // Workflow state
  const { workflowContext, updateContext } = useWorkflowContext();
  const [showWorkflowPrompt, setShowWorkflowPrompt] = useState(false);
  
  // Quick Search state
  const [quickSearchJobTitle, setQuickSearchJobTitle] = useState(initialSearchTerm || '');
  const [quickSearchLocation, setQuickSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [jobResults, setJobResults] = useState<any[]>([]);

  useEffect(() => {
    if (!initialSearchTerm?.trim()) return;
    setQuickSearchJobTitle(initialSearchTerm);
    setIsSearching(true);
    searchJobs(initialSearchTerm.trim())
      .then((result) => setJobResults(result.jobs.map((j, i) => jsearchToDisplayJob(j, i))))
      .finally(() => setIsSearching(false));
  }, [initialSearchTerm]);
  
  // Personalized Search state
  const [personalizedJobResults, setPersonalizedJobResults] = useState<any[]>([]);
  const [isSearchingPersonalized, setIsSearchingPersonalized] = useState(false);
  
  // Resume state
  const [uploadedResumes, setUploadedResumes] = useState<any>({});
  const [activeResume, setActiveResume] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  
  // Suggestions state
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    datePosted: 'Any time',
    experienceLevel: 'Any level',
    remote: 'Any',
    salaryRange: 'Any'
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState<any>({});
  
  // Resume filters
  const [resumeFilters] = useState({
    workType: 'Full-time',
    remote: 'Any',
    experienceLevel: 'Any level',
    minSalary: 'Any',
    location: ''
  });
  
  // Tracking & Notifications
  const [trackedJobIds, setTrackedJobIds] = useState(new Set());
  const [notification, setNotification] = useState<any>(null);
  
  // Predictive matching
  const [, setPredictiveRecommendations] = useState<any[]>([]);
  const [, setIsGeneratingRecommendations] = useState(false);
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState<any>(null);
  const [salaryPrediction, setSalaryPrediction] = useState<any>(null);
  const [successProbability, setSuccessProbability] = useState<any>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);

  // Workflow context checks
  useEffect(() => {
    if (workflowContext?.workflowId === 'job-application-pipeline') {
      const workflow = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (workflow) {
        const findJobsStep = workflow.steps.find((s: any) => s.id === 'find-jobs');
        if (findJobsStep && findJobsStep.status === 'not-started') {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'find-jobs', 'in-progress');
        }
      }
    }
  }, [workflowContext]);

  // Load data
  useEffect(() => {
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map((j: any) => j.url)));
    
    const savedResumes = localStorage.getItem('parsed_resumes');
    if (savedResumes) {
      const resumes = JSON.parse(savedResumes);
      setUploadedResumes(resumes);
      const activeName = localStorage.getItem('active_resume_for_job_search');
      if (activeName && resumes[activeName]) {
        setActiveResume(activeName);
        setResumeData(resumes[activeName]);
      } else if (Object.keys(resumes).length > 0) {
        const first = Object.keys(resumes)[0];
        setActiveResume(first);
        setResumeData(resumes[first]);
      }
    }
  }, []);

  const showNotification = useCallback((message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

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

  const handleToggleFilter = (filterType: string) => {
    setShowFilterDropdown((prev: any) => ({
      ...Object.keys(prev).reduce((acc: any, key) => ({ ...acc, [key]: false }), {}),
      [filterType]: !prev[filterType]
    }));
  };

  const handleSelectFilter = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setShowFilterDropdown({});
  };

  const handleQuickSearch = async () => {
    if (!quickSearchJobTitle.trim()) {
      showNotification('Please enter a job title', 'error');
      return;
    }
    setIsSearching(true);
    const query = [quickSearchJobTitle.trim(), quickSearchLocation.trim()].filter(Boolean).join(' ');
    try {
      const result = await searchJobs(query);
      setJobResults(result.jobs.map((j, i) => jsearchToDisplayJob(j, i)));
    } finally {
      setIsSearching(false);
    }
  };

  const convertToResumeProfile = (data: any) => {
    if (!data) return null;
    return {
      skills: [...(data.skills?.technical || []), ...(data.skills?.soft || [])],
      experience: (data.experience || []).map((exp: any) => ({
        title: exp.position || 'Unknown',
        company: exp.company || 'Unknown',
        duration: 'Not specified',
        description: exp.description || ''
      })),
      education: [],
      location: data.personalInfo?.location,
      yearsOfExperience: data.experience?.length || 0,
    };
  };

  const handlePersonalizedSearch = async () => {
    if (!activeResume || !resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }

    setIsSearchingPersonalized(true);
    setIsGeneratingRecommendations(true);
    
    try {
      const recentJob = resumeData.experience?.[0]?.position || 'Software Engineer';
      const locationPart = resumeFilters.location?.trim() ? ` ${resumeFilters.location.trim()}` : '';
      const result = await searchJobs(`${recentJob}${locationPart}`);
      const jobs = result.jobs;
      if (jobs.length === 0) {
        setPersonalizedJobResults([]);
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('No jobs found for this criteria. Try a different role or location.', 'info');
        return;
      }
      const loc = (j: typeof jobs[0]) => [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', ') || 'Remote';
      const jobListings = jobs.map((j) => ({
        id: j.job_id,
        title: j.job_title,
        company: j.employer_name,
        location: loc(j),
        description: j.job_description || j.job_highlights?.Qualifications?.join(' ') || '',
        requirements: j.job_highlights?.Responsibilities?.join(' ') || j.job_highlights?.Qualifications?.join(' ') || '',
        salaryRange: j.job_min_salary != null && j.job_max_salary != null
          ? formatJobSalary(j.job_min_salary, j.job_max_salary, loc(j))
          : undefined,
        postedDate: j.job_posted_at_datetime_utc?.split('T')[0] ?? '',
        source: 'JSearch',
        url: j.job_apply_link,
        experienceLevel: filters.experienceLevel !== 'Any level' ? filters.experienceLevel : undefined
      }));

      const profile = convertToResumeProfile(resumeData);
      const recommendations = await getJobRecommendations(profile, jobListings, 20);
      setPredictiveRecommendations(recommendations);

      const enhancedResults = recommendations.map((rec: any) => ({
        id: parseInt(rec.job.id, 10) || Date.now(),
        title: rec.job.title,
        company: rec.job.company,
        location: rec.job.location,
        salary: rec.salaryPrediction 
          ? `$${rec.salaryPrediction.predictedMin}k - $${rec.salaryPrediction.predictedMax}k`
          : rec.job.salaryRange || 'Competitive',
        type: 'Full-time',
        description: rec.job.description,
        requirements: rec.job.requirements || '',
        postedDate: rec.job.postedDate,
        url: rec.job.url || '#',
        source: rec.job.source,
        matchScore: rec.matchScore,
        whyMatch: Array.isArray(rec.reasons) ? rec.reasons.join(' | ') : ''
      }));

      setPersonalizedJobResults(enhancedResults);
      showNotification('Found personalized job matches!', 'success');
    } catch (error) {
      console.error(error);
      setPersonalizedJobResults([]);
      showNotification('Search failed. Please try again.', 'error');
    } finally {
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
    }
  };

  const handleAnalyzeJob = async (job: any) => {
    if (!resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }
    setSelectedJobForAnalysis(job);
    setIsAnalyzingJob(true);

    try {
      const profile = convertToResumeProfile(resumeData);
      const jobListing = {
        id: job.id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        salaryRange: job.salary,
        postedDate: job.postedDate,
        source: job.source
      };

      const [salaryPred, successProb] = await Promise.all([
        predictSalary(profile, jobListing),
        calculateSuccessProbability(profile, jobListing)
      ]);

      setSalaryPrediction(salaryPred);
      setSuccessProbability(successProb);
    } catch (error) {
      showNotification('Failed to analyze job.', 'error');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  const handleResumeUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    try {
      // Mock parsing logic
      const parsedData = {
        personalInfo: { fullName: 'Alex Morgan', email: '', location: 'Remote' },
        skills: { technical: ['React', 'TypeScript', 'Tailwind'], soft: ['Leadership'] },
        experience: [{ position: 'Product Designer', company: 'Previous Employer' }],
        summary: 'Experienced professional...'
      };

      const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
      savedResumes[file.name] = parsedData;
      localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));

      setUploadedResumes(savedResumes);
      setActiveResume(file.name);
      setResumeData(parsedData);
      localStorage.setItem('active_resume_for_job_search', file.name);
      showNotification('Resume uploaded successfully!', 'success');
    } catch (error) {
      showNotification('Failed to upload resume.', 'error');
    } finally {
      setIsUploadingResume(false);
      event.target.value = '';
    }
  };

  const handleTrackJob = (job: any) => {
    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'new-leads');
    if (result.success) {
      showNotification(`"${job.title}" added to Job Tracker!`, 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map((j: any) => j.url)));
      
      const workflow = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (workflow && workflowContext?.workflowId === 'job-application-pipeline') {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'find-jobs', 'completed', { jobsFound: tracked.length });
          setShowWorkflowPrompt(true);
          updateContext({
            workflowId: 'job-application-pipeline',
            currentJob: { ...job },
          });
      }
    } else if (result.duplicate) {
      showNotification('This job is already in your tracker', 'info');
    }
  };

  const handleApplyAndTrack = (job: any) => {
    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'applied');
    if (result.success || result.duplicate) {
      window.open(job.url, '_blank');
      showNotification('Opening application page...', 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map((j: any) => j.url)));
    }
  };

  const handleBulkTrack = (jobs: any[], minScore = 80) => {
    const result = JobTrackingUtils.bulkAddJobs(jobs, 'job-finder', minScore);
    showNotification(`Added ${result.added} jobs to tracker`, result.added > 0 ? 'success' : 'info');
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map((j: any) => j.url)));
  };

  const handleExportCSV = (jobs: any[]) => {
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

  const isJobTracked = (job: any) => trackedJobIds.has(job.url);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
    if (score >= 80) return 'text-blue-700 bg-blue-50 border border-blue-100';
    if (score >= 70) return 'text-amber-700 bg-amber-50 border border-amber-100';
    return 'text-red-700 bg-red-50 border border-red-100';
  };

  // Render Helper
  const renderJobCard = (job: any, index: number) => (
    <div key={index} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
            {job.matchScore > 0 && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getMatchScoreColor(job.matchScore)}`}>
                {job.matchScore}% match
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium mb-4 flex-wrap">
            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" />{job.company}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{job.location}</span>
            <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-400" />{job.salary}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" />{job.postedDate}</span>
          </div>
          <p className="text-slate-600 mb-4 leading-relaxed text-sm">{job.description}</p>
          {job.whyMatch && (
            <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-900"><span className="font-bold text-blue-700">Why this matches:</span> {job.whyMatch}</p>
            </div>
          )}
          {isJobTracked(job) && (
            <div className="mb-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2">
              <div className="bg-emerald-100 p-1 rounded-full"><Check className="w-3 h-3 text-emerald-700" /></div>
              <p className="text-sm text-emerald-900 font-bold">Already tracked</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            {isJobTracked(job) ? (
              <button className="px-4 py-2 bg-slate-50 text-[#111827] border border-slate-100 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
                <Check className="w-4 h-4" /> View in Tracker
              </button>
            ) : (
              <>
                <button onClick={(e) => { e.stopPropagation(); handleTrackJob(job); }} className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-neutral-900 transition-all flex items-center gap-2">
                  <BookmarkPlus className="w-4 h-4" /> Track This Job
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleApplyAndTrack(job); }} className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-neutral-900 transition-all flex items-center gap-2">
                  <Check className="w-4 h-4" /> Apply & Track
                </button>
              </>
            )}
            <button onClick={(e) => { e.stopPropagation(); handleAnalyzeJob(job); }} disabled={isAnalyzingJob || !resumeData} className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-neutral-900 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isAnalyzingJob && selectedJobForAnalysis?.id === job.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><BarChart3 className="w-4 h-4" /> Analyze Match</>}
            </button>
            <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-auto px-6 py-2 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm">
              <ExternalLink className="w-4 h-4" /> Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white animate-slide-in`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ️'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {showWorkflowPrompt && workflowContext?.workflowId === 'job-application-pipeline' && (
        <WorkflowPrompt
          message="🎉 Job Saved to Tracker! You're making great progress in your Job Application Pipeline workflow."
          actionText="View Tracker"
          onDismiss={() => setShowWorkflowPrompt(false)}
          onAction={(action: string) => {
            if (action === 'continue') {
               updateContext({ workflowId: 'job-application-pipeline', currentJob: workflowContext.currentJob, action: 'view-tracker' });
               navigateTo('/dashboard/tracker');
            }
          }}
        />
      )}

      <div className="flex items-center gap-2 p-2 rounded-2xl border bg-white border-slate-200 shadow-sm overflow-x-auto">
        {[
          { id: 'search', label: 'Quick Search', icon: Search },
          { id: 'resumes', label: 'Personalized Jobs', icon: FileText },
          { id: 'history', label: 'History', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' : 'text-slate-500 hover:text-neutral-900 hover:bg-slate-50'}`}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'search' && (
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 relative shadow-sm">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Find Your Dream Job</h2>
            <p className="text-slate-500 mb-8">Enter your job title and location to get AI-powered job recommendations</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={quickSearchJobTitle}
                    onChange={(e) => handleJobTitleChange(e.target.value)}
                    onFocus={() => quickSearchJobTitle.trim() && setShowJobTitleSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowJobTitleSuggestions(false), 200)}
                    placeholder="e.g., Software Engineer, Product Manager"
                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all font-medium"
                  />
                  {quickSearchJobTitle && <button onClick={() => { setQuickSearchJobTitle(''); setShowJobTitleSuggestions(false); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
                </div>
                {showJobTitleSuggestions && jobTitleSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {jobTitleSuggestions.map((suggestion, index) => (
                      <button key={index} onClick={() => { setQuickSearchJobTitle(suggestion); setShowJobTitleSuggestions(false); }} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 font-medium">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-2">Location (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={quickSearchLocation}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => quickSearchLocation.trim() && setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    placeholder="City, State"
                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all font-medium"
                  />
                  {quickSearchLocation && <button onClick={() => { setQuickSearchLocation(''); setShowLocationSuggestions(false); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
                </div>
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <button key={index} onClick={() => { setQuickSearchLocation(suggestion); setShowLocationSuggestions(false); }} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 font-medium">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleQuickSearch}
              disabled={!quickSearchJobTitle.trim() || isSearching}
              className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md active:scale-[0.99] ${quickSearchJobTitle.trim() && !isSearching ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isSearching ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching for jobs...</> : <><Search className="w-5 h-5" /> Search Jobs</>}
            </button>
            
            {/* Filter Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {['datePosted', 'experienceLevel', 'remote', 'salaryRange'].map((filterKey) => (
                <div key={filterKey} className="relative">
                  <button onClick={() => handleToggleFilter(filterKey)} className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors flex items-center gap-2 ${filters[filterKey as keyof typeof filters] !== (filterKey === 'remote' ? 'Any' : (filterKey === 'salaryRange' ? 'Any' : (filterKey === 'datePosted' ? 'Any time' : 'Any level'))) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                    {filterKey === 'salaryRange' ? <DollarSign className="w-4 h-4" /> : filterKey === 'remote' ? <MapPin className="w-4 h-4" /> : filterKey === 'datePosted' ? <Calendar className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    {filters[filterKey as keyof typeof filters]}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showFilterDropdown[filterKey] && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                       {/* Mock Options for Demo */}
                       {['Any', 'Option 1', 'Option 2'].map(opt => (
                         <button key={opt} onClick={() => handleSelectFilter(filterKey, opt)} className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-50 text-slate-700">{opt}</button>
                       ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {jobResults.length > 0 ? (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between flex-wrap gap-4 px-2">
                <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><Target className="w-5 h-5 text-blue-600"/> Search Results ({jobResults.length})</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleBulkTrack(jobResults, 80)} className="px-4 py-2 bg-white text-purple-700 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm border border-purple-200 shadow-sm"><BookmarkPlus className="w-4 h-4" /> Track All 80%+</button>
                  <button onClick={() => handleExportCSV(jobResults)} className="px-4 py-2 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition-colors flex items-center gap-2 text-sm border border-green-200 shadow-sm"><ExternalLink className="w-4 h-4" /> Export CSV</button>
                </div>
              </div>
              <div className="space-y-4">{jobResults.map((job, index) => renderJobCard(job, index))}</div>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4"><Search className="w-6 h-6 text-blue-600" /></div><h3 className="text-lg font-bold text-slate-800 mb-2">AI Search</h3><p className="text-sm text-slate-600 leading-relaxed">Our AI searches across multiple job boards.</p></div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4"><Sparkles className="w-6 h-6 text-green-600" /></div><h3 className="text-lg font-bold text-slate-800 mb-2">Smart Matching</h3><p className="text-sm text-slate-600 leading-relaxed">Jobs are matched against your resume.</p></div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4"><Target className="w-6 h-6 text-purple-600" /></div><h3 className="text-lg font-bold text-slate-800 mb-2">Quick Actions</h3><p className="text-sm text-slate-600 leading-relaxed">Track jobs, tailor resume, or apply with one click.</p></div>
             </div>
          )}
        </div>
      )}

      {activeTab === 'resumes' && (
        <div className="space-y-6">
          {Object.keys(uploadedResumes).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"><Upload className="w-8 h-8 text-slate-400" /></div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Upload Your Resume</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload your CV to get AI-powered job recommendations.</p>
              <label className="cursor-pointer inline-flex flex-col items-center">
                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeUpload} className="hidden" disabled={isUploadingResume} />
                  <div className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${isUploadingResume ? 'bg-slate-200 text-slate-400' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}>
                    {isUploadingResume ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : <><Upload className="w-5 h-5" /> Upload Resume</>}
                  </div>
              </label>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between mb-4"><h2 className="text-2xl font-bold text-neutral-900">Personalized Jobs</h2></div>
                <button onClick={handlePersonalizedSearch} disabled={isSearchingPersonalized} className={`w-full px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-md ${!isSearchingPersonalized ? 'bg-neutral-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  {isSearchingPersonalized ? <><Loader2 className="w-5 h-5 animate-spin" /> Finding jobs...</> : <><Sparkles className="w-5 h-5" /> Find Personalized Jobs</>}
                </button>
                {personalizedJobResults.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {personalizedJobResults.map((job, index) => renderJobCard(job, index))}
                  </div>
                )}
            </div>
          )}
        </div>
      )}
      
      {/* Analysis Modal */}
      {selectedJobForAnalysis && (salaryPrediction || successProbability) && (() => {
        const localProfile = resumeData ? {
          skills: [...(resumeData.skills?.technical || []), ...(resumeData.skills?.soft || [])],
          experience: (resumeData.experience || []).map((e: any) => ({
            title: e.position || 'Unknown',
            company: e.company || 'Unknown',
            duration: 'Not specified',
            description: e.description || ''
          })),
          personalInfo: {
            jobTitle: resumeData.personalInfo?.jobTitle || resumeData.experience?.[0]?.position,
            location: resumeData.personalInfo?.location
          },
          summary: resumeData.summary
        } : null;
        const marketValue = localProfile ? getMarketValueEstimate(
          {
            title: selectedJobForAnalysis.title,
            location: selectedJobForAnalysis.location,
            salaryRange: selectedJobForAnalysis.salary,
            job_min_salary: selectedJobForAnalysis.job_min_salary,
            job_max_salary: selectedJobForAnalysis.job_max_salary
          },
          localProfile
        ) : { displayValue: 'Competitive', isCompetitive: true, showBlunderDisclaimer: false };
        return (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Job Match Analysis</h3>
                <button onClick={() => { setSelectedJobForAnalysis(null); setSalaryPrediction(null); setSuccessProbability(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl mb-6">
                <h4 className="text-lg font-bold text-slate-800">{selectedJobForAnalysis.title}</h4>
                <p className="text-sm text-slate-500">{selectedJobForAnalysis.company} • {selectedJobForAnalysis.location}</p>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                {successProbability && (
                  <div className="flex-1 min-w-[240px] p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      <h4 className="text-xl font-bold text-slate-800">Hire Probability</h4>
                    </div>
                    <p className={`text-3xl font-bold ${
                      successProbability.overallProbability >= 70 ? 'text-green-600' :
                      successProbability.overallProbability >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {successProbability.overallProbability}%
                    </p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2" style={{ maxWidth: 200 }}>
                      <div
                        className={`h-2 rounded-full ${
                          successProbability.overallProbability >= 70 ? 'bg-green-500' :
                          successProbability.overallProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${successProbability.overallProbability}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-[240px] p-6 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                    <h4 className="text-xl font-bold text-slate-800">Market Value</h4>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{marketValue.displayValue}</p>
                  {marketValue.showBlunderDisclaimer && (
                    <p className="text-sm text-amber-700 mt-2">Estimates vary based on total compensation packages.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => { setSelectedJobForAnalysis(null); setSalaryPrediction(null); setSuccessProbability(null); }} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default JobFinder;

