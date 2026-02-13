import { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  X, 
  Clock, 
  Users, 
  DollarSign, 
  Sparkles, 
  Target, 
  BookmarkPlus, 
  ExternalLink, 
  FileText, 
  History, 
  Upload, 
  Loader2, 
  Star, 
  Check, 
  Building2, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  ChevronDown
} from 'lucide-react';
import { searchJobs } from './lib/services/jobService';
import type { Job } from './types/job';

// --- Mocks for External Libraries ---

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

// --- Databases & Generators ---
const locationDatabase = [
  'Remote', 'Remote, Worldwide',
  'New York, NY, United States', 'San Francisco, CA, United States',
  'London, England, United Kingdom', 'Berlin, Germany',
  'Toronto, Ontario, Canada', 'Sydney, NSW, Australia', 'Singapore'
];

const jobTitlesDatabase = [
  'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer', 'Product Manager', 
  'UX Designer', 'Product Designer', 'Data Scientist'
];

/** Map JSearch Job to the display shape used by the UI (no mock data). */
function jsearchToDisplayJob(job: Job, index: number): Record<string, unknown> {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  const location = parts.length > 0 ? parts.join(', ') : 'Remote';
  const salaryStr =
    job.job_min_salary != null && job.job_max_salary != null
      ? `$${Math.round(job.job_min_salary / 1000)}k - $${Math.round(job.job_max_salary / 1000)}k`
      : 'Competitive';
  return {
    id: index + 1,
    title: job.job_title,
    company: job.employer_name,
    location,
    salary: salaryStr,
    type: 'Full-time',
    description: job.job_description,
    requirements: '',
    postedDate: job.job_posted_at_datetime_utc?.split('T')[0] ?? '',
    url: job.job_apply_link,
    source: 'JSearch',
    matchScore: 0,
    whyMatch: '',
  };
}

// --- Main Component ---

const JobFinder = ({ onViewChange, initialSearchTerm }: any) => {
  // Navigation handling
  const navigateTo = (path: string) => {
      console.log('Navigate to:', path);
      if (onViewChange && path.includes('tracker')) {
          onViewChange('tracker');
      }
  };
  
  // Tab state
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'resumes' | 'history'
  const [historySubTab, setHistorySubTab] = useState('search-results'); 
  
  // Workflow state (for tracking only; UI lives in dashboard Workflow tab)
  const { workflowContext, updateContext } = useWorkflowContext();

  // Quick Search state
  const [quickSearchJobTitle, setQuickSearchJobTitle] = useState(initialSearchTerm || '');
  const [quickSearchLocation, setQuickSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [jobResults, setJobResults] = useState<any[]>([]);

  // Effect to handle initial search term from props (real API only)
  useEffect(() => {
    if (!initialSearchTerm?.trim()) return;
    setQuickSearchJobTitle(initialSearchTerm);
    setIsSearching(true);
    searchJobs(initialSearchTerm.trim())
      .then((jobs) => setJobResults(jobs.map((j, i) => jsearchToDisplayJob(j, i))))
      .finally(() => setIsSearching(false));
  }, [initialSearchTerm]);
  
  // Personalized Search state
  const [personalizedJobResults, setPersonalizedJobResults] = useState<any[]>([]);
  const [isSearchingPersonalized, setIsSearchingPersonalized] = useState(false);
  const [selectedSearchStrategy, setSelectedSearchStrategy] = useState<string | null>(null);
  
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
  
  // Resume filters state
  const [resumeFilters, setResumeFilters] = useState({
    workType: 'Full-time',
    remote: 'Any',
    experienceLevel: 'Any level',
    minSalary: 'Any',
    location: ''
  });
  
  // Tracking state
  const [trackedJobIds, setTrackedJobIds] = useState(new Set());
  const [notification, setNotification] = useState<any>(null);
  
  // Predictive matching state
  const [, setPredictiveRecommendations] = useState<any[]>([]);
  const [, setIsGeneratingRecommendations] = useState(false);
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState<any>(null);
  const [salaryPrediction, setSalaryPrediction] = useState<any>(null);
  const [successProbability, setSuccessProbability] = useState<any>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);

  // Check for workflow context changes
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

  // Load data on mount
  useEffect(() => {
    // Load tracked jobs
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map((j: any) => j.url)));
    
    // Load saved resumes
    const savedResumes = localStorage.getItem('parsed_resumes');
    if (savedResumes) {
      const resumes = JSON.parse(savedResumes);
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
    }
  }, []);

  // Show notification
  const showNotification = useCallback((message: string, type: string) => {
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
    setShowFilterDropdown((prev: any) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [filterType]: !prev[filterType]
    }));
  };

  // Handle filter selection
  const handleSelectFilter = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setShowFilterDropdown({});
  };

  // Quick search
  const handleQuickSearch = async () => {
    if (!quickSearchJobTitle.trim()) {
      showNotification('Please enter a job title', 'error');
      return;
    }

    setIsSearching(true);
    const query = [quickSearchJobTitle.trim(), quickSearchLocation.trim()].filter(Boolean).join(' ');
    try {
      const jobs = await searchJobs(query);
      setJobResults(jobs.map((j, i) => jsearchToDisplayJob(j, i)));
    } finally {
      setIsSearching(false);
    }
  };

  // Convert ResumeData to ResumeProfile
  const convertToResumeProfile = (data: any) => {
    if (!data) return null;
    
    return {
      skills: [
        ...(data.skills?.technical || []),
        ...(data.skills?.soft || [])
      ],
      experience: (data.experience || []).map((exp: any) => ({
        title: exp.position || 'Unknown',
        company: exp.company || 'Unknown',
        duration: 'Not specified',
        description: exp.description || ''
      })),
      education: [],
      location: data.personalInfo?.location,
      yearsOfExperience: data.experience?.length || 0,
      industry: undefined,
      currentSalary: undefined
    };
  };

  // Personalized search with predictive matching
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
      const jobs = await searchJobs(`${recentJob}${locationPart}`);
      if (jobs.length === 0) {
        setPersonalizedJobResults([]);
        setIsSearchingPersonalized(false);
        setIsGeneratingRecommendations(false);
        showNotification('No jobs found for this criteria. Try a different role or location.', 'info');
        return;
      }
      const jobListings = jobs.map((j) => ({
        id: j.job_id,
        title: j.job_title,
        company: j.employer_name,
        location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', ') || 'Remote',
        description: j.job_description,
        requirements: '',
        salaryRange: j.job_min_salary != null && j.job_max_salary != null
          ? `$${Math.round(j.job_min_salary / 1000)}k - $${Math.round(j.job_max_salary / 1000)}k`
          : undefined,
        postedDate: j.job_posted_at_datetime_utc?.split('T')[0] ?? '',
        source: 'JSearch',
        url: j.job_apply_link,
        experienceLevel: filters.experienceLevel !== 'Any level' ? filters.experienceLevel : undefined
      }));

      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        throw new Error('Failed to convert resume to profile');
      }

      // Get AI-powered recommendations
      const recommendations = await getJobRecommendations(profile, jobListings, 20);
      setPredictiveRecommendations(recommendations as any);

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
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
      showNotification('Found personalized job matches!', 'success');
    } catch (error) {
      console.error('Error in personalized search:', error);
      setPersonalizedJobResults([]);
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
      showNotification('Search failed. Please try again.', 'error');
    }
  };

  // Analyze job
  const handleAnalyzeJob = async (job: any) => {
    if (!resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }

    setSelectedJobForAnalysis(job);
    setIsAnalyzingJob(true);

    try {
      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        throw new Error('Failed to convert resume to profile');
      }

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
      console.error('Error analyzing job:', error);
      showNotification('Failed to analyze job. Please check your API key.', 'error');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('text') && !file.name.endsWith('.docx')) {
      showNotification('Please upload a PDF, DOCX, or TXT file', 'error');
      return;
    }

    setIsUploadingResume(true);

    try {
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      const parsedData = {
        personalInfo: { fullName: '', email: '', location: '' },
        skills: { technical: [] as string[], soft: [] as string[] },
        experience: [],
        summary: fileContent.substring(0, 500)
      };

      const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Git'];
      parsedData.skills.technical = commonSkills.filter(skill => 
        fileContent.toLowerCase().includes(skill.toLowerCase())
      );

      const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
      savedResumes[file.name] = parsedData;
      localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));

      setUploadedResumes(savedResumes);
      setActiveResume(file.name);
      setResumeData(parsedData);
      localStorage.setItem('active_resume_for_job_search', file.name);

      showNotification('Resume uploaded successfully!', 'success');
    } catch (error) {
      showNotification('Failed to upload resume. Please try again.', 'error');
    } finally {
      setIsUploadingResume(false);
      event.target.value = '';
    }
  };

  const handleSelectResume = (resumeName: string) => {
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    if (savedResumes[resumeName]) {
      setActiveResume(resumeName);
      setResumeData(savedResumes[resumeName]);
      localStorage.setItem('active_resume_for_job_search', resumeName);
    }
  };

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
        localStorage.removeItem('active_resume_for_job_search');
      }
    }
  };

  const handleTrackJob = (job: any) => {
    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'new-leads');
    
    if (result.success) {
      showNotification(`"${job.title}" added to Job Tracker!`, 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map((j: any) => j.url)));
      
      const workflow1 = WorkflowTracking.getWorkflow('job-application-pipeline');
      if (workflow1 && workflowContext?.workflowId === 'job-application-pipeline') {
        if (tracked.length > 0) {
          WorkflowTracking.updateStepStatus('job-application-pipeline', 'find-jobs', 'completed', {
            jobsFound: tracked.length
          });
        }
        
        if (workflow1.isActive) {
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
    showNotification(
      `Added ${result.added} jobs to tracker${result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ''}`,
      result.added > 0 ? 'success' : 'info'
    );
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
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              {job.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-slate-400" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {job.postedDate}
            </span>
          </div>
          
          <p className="text-slate-600 mb-4 leading-relaxed text-sm">{job.description}</p>
          
          {job.whyMatch && (
            <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-900">
                <span className="font-bold text-blue-700">Why this matches:</span> {job.whyMatch}
              </p>
            </div>
          )}

          {isJobTracked(job) && (
            <div className="mb-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2">
              <div className="bg-emerald-100 p-1 rounded-full">
                <Check className="w-3 h-3 text-emerald-700" />
              </div>
              <p className="text-sm text-emerald-900 font-bold">
                Already tracked
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            {isJobTracked(job) ? (
              <button className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all flex items-center gap-2">
                <Check className="w-4 h-4" />
                View in Tracker
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleTrackJob(job); }}
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-neutral-900 transition-all flex items-center gap-2"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Track This Job
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleApplyAndTrack(job); }}
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-neutral-900 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply & Track
                </button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleAnalyzeJob(job); }}
              disabled={isAnalyzingJob || !resumeData}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-neutral-900 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="ml-auto px-6 py-2 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
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

      <div className="flex items-center gap-2 p-2 rounded-2xl border bg-white border-slate-200 shadow-sm overflow-x-auto">
        {[
          { id: 'search', label: 'Quick Search', icon: Search },
          { id: 'resumes', label: 'Personalized Jobs', icon: FileText },
          { id: 'history', label: 'History', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20'
                : 'text-slate-500 hover:text-neutral-900 hover:bg-slate-50'
            }`}
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
                    placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all font-medium"
                  />
                  {quickSearchJobTitle && (
                    <button
                      onClick={() => { setQuickSearchJobTitle(''); setShowJobTitleSuggestions(false); }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {showJobTitleSuggestions && jobTitleSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {jobTitleSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => { setQuickSearchJobTitle(suggestion); setShowJobTitleSuggestions(false); }}
                        className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 font-medium"
                      >
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
                  {quickSearchLocation && (
                    <button
                      onClick={() => { setQuickSearchLocation(''); setShowLocationSuggestions(false); }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => { setQuickSearchLocation(suggestion); setShowLocationSuggestions(false); }}
                        className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 font-medium"
                      >
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
              className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md active:scale-[0.99] ${
                quickSearchJobTitle.trim() && !isSearching
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching for jobs...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Jobs
                </>
              )}
            </button>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="relative">
                <button
                  onClick={() => handleToggleFilter('datePosted')}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors flex items-center gap-2 ${
                    filters.datePosted !== 'Any time'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {filters.datePosted}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown.datePosted && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                    {['Any time', 'Past 24 hours', 'Past week', 'Past month'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectFilter('datePosted', option)}
                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-50 ${
                          filters.datePosted === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => handleToggleFilter('experienceLevel')}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors flex items-center gap-2 ${
                    filters.experienceLevel !== 'Any level'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {filters.experienceLevel}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown.experienceLevel && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                    {['Any level', 'Intern', 'Entry level', 'Mid-Senior level', 'Executive', 'Director'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectFilter('experienceLevel', option)}
                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-50 ${
                          filters.experienceLevel === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => handleToggleFilter('remote')}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors flex items-center gap-2 ${
                    filters.remote !== 'Any'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {filters.remote}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown.remote && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                    {['Any', 'Remote', 'On-site', 'Hybrid'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectFilter('remote', option)}
                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-50 ${
                          filters.remote === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => handleToggleFilter('salaryRange')}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors flex items-center gap-2 ${
                    filters.salaryRange !== 'Any'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  {filters.salaryRange}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown.salaryRange && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                    {['Any', '$50k - $80k', '$80k - $120k', '$120k+', '$150k+'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectFilter('salaryRange', option)}
                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-50 ${
                          filters.salaryRange === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {resumeData && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm text-indigo-800 font-medium">
                    <strong>Resume detected!</strong> We'll match jobs to your skills and experience for better results.
                  </p>
                </div>
              </div>
            )}
          </div>

          {jobResults.length > 0 ? (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between flex-wrap gap-4 px-2">
                <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                   <Target className="w-5 h-5 text-blue-600"/>
                   Search Results ({jobResults.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkTrack(jobResults, 80)}
                    className="px-4 py-2 bg-white text-purple-700 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm border border-purple-200 shadow-sm"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    Track All 80%+
                  </button>
                  <button
                    onClick={() => handleExportCSV(jobResults)}
                    className="px-4 py-2 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition-colors flex items-center gap-2 text-sm border border-green-200 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {jobResults.map((job, index) => renderJobCard(job, index))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">AI Search</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Our AI searches across multiple job boards and generates job listings tailored to you</p>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Smart Matching</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Jobs are matched against your resume to show relevance and fit</p>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Quick Actions</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Track jobs, tailor your resume, or apply with one click</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'resumes' && (
        <div className="space-y-6">
          {Object.keys(uploadedResumes).length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Upload Your Resume</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload your CV/resume and get AI-powered job recommendations tailored to your skills.</p>
              
              <div className="flex flex-col items-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={isUploadingResume}
                  />
                  <div className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
                    isUploadingResume
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}>
                    {isUploadingResume ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Resume
                      </>
                    )}
                  </div>
                </label>
                <span className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-wide">Supports PDF, DOCX, and TXT</span>
              </div>
            </div>
          )}

          {Object.keys(uploadedResumes).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Your Resumes</h2>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={isUploadingResume}
                  />
                  <div className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload New
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(uploadedResumes).map(([name, data]: any) => (
                  <div
                    key={name}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                      activeResume === name
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={() => handleSelectResume(name)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${activeResume === name ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`font-bold text-sm truncate max-w-[200px] ${activeResume === name ? 'text-indigo-900' : 'text-slate-800'}`}>{name}</h3>
                          {activeResume === name && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">Active</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteResume(name); }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    {data.skills?.technical && data.skills.technical.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {data.skills.technical.slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md">
                            {skill}
                          </span>
                        ))}
                        {data.skills.technical.length > 3 && (
                          <span className="px-2 py-1 text-xs text-slate-400 font-medium">+{data.skills.technical.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeResume && uploadedResumes[activeResume] && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Customize Your Job Search</h2>
              <p className="text-slate-500 mb-8">Select a search strategy based on your goals</p>
              
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Search jobs based on</label>
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
                      onClick={() => setSelectedSearchStrategy(selectedSearchStrategy === strategy.id ? null : strategy.id)}
                      disabled={isSearchingPersonalized}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        selectedSearchStrategy === strategy.id
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 ring-offset-1'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                      } ${isSearchingPersonalized ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {strategy.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Work Type</label>
                  <select
                    value={resumeFilters.workType}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, workType: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none font-medium"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Remote Preference</label>
                  <select
                    value={resumeFilters.remote}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, remote: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none font-medium"
                  >
                    <option value="Any">Any</option>
                    <option value="Remote">Remote Only</option>
                    <option value="On-site">On-site Only</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Experience Level</label>
                  <select
                    value={resumeFilters.experienceLevel}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none font-medium"
                  >
                    <option value="Any level">Any Level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeFilters.location}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State or Remote"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handlePersonalizedSearch}
                disabled={isSearchingPersonalized}
                className={`w-full px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-md active:scale-95 ${
                  !isSearchingPersonalized
                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSearchingPersonalized ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finding personalized jobs...
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

          {personalizedJobResults.length > 0 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between flex-wrap gap-4 px-2">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    Personalized Job Matches ({personalizedJobResults.length})
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">Jobs matched to your resume: {activeResume}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleBulkTrack(personalizedJobResults, 85)}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold hover:bg-purple-100 transition-colors flex items-center gap-2 text-sm border border-purple-100"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    Track All 85%+
                  </button>
                  <button
                    onClick={() => handleExportCSV(personalizedJobResults)}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition-colors flex items-center gap-2 text-sm border border-green-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {personalizedJobResults.map((job, index) => renderJobCard(job, index))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
               <div>
                 <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                   <History className="w-6 h-6 text-slate-400" />
                   Search History
                 </h2>
                 <p className="text-slate-500 text-sm mt-1">Review your recent job search results and personalized matches.</p>
               </div>
               <div className="flex p-1.5 bg-slate-100 rounded-xl self-stretch md:self-auto">
                 <button
                   onClick={() => setHistorySubTab('search-results')}
                   className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                     historySubTab === 'search-results'
                       ? 'bg-white shadow-sm text-neutral-900'
                       : 'text-slate-500 hover:text-slate-700'
                   }`}
                 >
                   Search Results ({jobResults.length})
                 </button>
                 <button
                   onClick={() => setHistorySubTab('personalized-results')}
                   className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                     historySubTab === 'personalized-results'
                       ? 'bg-white shadow-sm text-neutral-900'
                       : 'text-slate-500 hover:text-slate-700'
                   }`}
                 >
                   Personalized Results ({personalizedJobResults.length})
                 </button>
               </div>
            </div>
          </div>

          {historySubTab === 'search-results' && (
            <div className="space-y-6">
              {jobResults.length > 0 ? (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-4 px-2">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <Target className="w-6 h-6 text-blue-600" />
                        Search Results ({jobResults.length})
                      </h2>
                      <p className="text-slate-500 font-medium mt-1">Searching for: "{quickSearchJobTitle}"</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleBulkTrack(jobResults, 80)}
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold hover:bg-purple-100 transition-colors flex items-center gap-2 text-sm border border-purple-100"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        Track All 80%+
                      </button>
                      <button
                        onClick={() => handleExportCSV(jobResults)}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition-colors flex items-center gap-2 text-sm border border-green-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {jobResults.map((job, index) => renderJobCard(job, index))}
                  </div>
                </>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Target className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">No search results in history</h3>
                  <p className="text-slate-500 mb-8">Perform a quick search to populate this list.</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-md active:scale-95"
                  >
                    Start Searching
                  </button>
                </div>
              )}
            </div>
          )}

          {historySubTab === 'personalized-results' && (
            <div className="space-y-6">
              {personalizedJobResults.length > 0 ? (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-4 px-2">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500" />
                        Personalized Job Matches ({personalizedJobResults.length})
                      </h2>
                      <p className="text-slate-500 font-medium mt-1">Jobs matched to your resume: {activeResume}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleBulkTrack(personalizedJobResults, 85)}
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold hover:bg-purple-100 transition-colors flex items-center gap-2 text-sm border border-purple-100"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        Track All 85%+
                      </button>
                      <button
                        onClick={() => handleExportCSV(personalizedJobResults)}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition-colors flex items-center gap-2 text-sm border border-green-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {personalizedJobResults.map((job, index) => renderJobCard(job, index))}
                  </div>
                </>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">No personalized results in history</h3>
                  <p className="text-slate-500 mb-8">Upload a resume and run a personalized search to see history.</p>
                  <button
                    onClick={() => setActiveTab('resumes')}
                    className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-md active:scale-95"
                  >
                    Get Personalized Jobs
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedJobForAnalysis && (salaryPrediction || successProbability) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Job Match Analysis</h3>
              <button
                onClick={() => {
                  setSelectedJobForAnalysis(null);
                  setSalaryPrediction(null);
                  setSuccessProbability(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">{selectedJobForAnalysis.title}</h4>
              <p className="text-slate-600">{selectedJobForAnalysis.company} • {selectedJobForAnalysis.location}</p>
            </div>

            {salaryPrediction && (
              <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <h4 className="text-xl font-bold text-slate-800">Salary Prediction</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Minimum</p>
                    <p className="text-2xl font-bold text-green-700">${salaryPrediction.predictedMin}k</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Median</p>
                    <p className="text-2xl font-bold text-green-700">${salaryPrediction.predictedMedian}k</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Maximum</p>
                    <p className="text-2xl font-bold text-green-700">${salaryPrediction.predictedMax}k</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Confidence</span>
                    <span className="text-sm font-bold text-green-700">{salaryPrediction.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${salaryPrediction.confidence}%` }}
                    />
                  </div>
                </div>
                {salaryPrediction.marketComparison && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Market Percentile:</span>
                      <span className="font-semibold text-slate-800">{salaryPrediction.marketComparison.percentile}th</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Industry Average:</span>
                      <span className="font-semibold text-slate-800">${salaryPrediction.marketComparison.industryAverage}k</span>
                    </div>
                  </div>
                )}
                {salaryPrediction.factors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Key Factors:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {salaryPrediction.factors.map((factor: string, idx: number) => (
                        <li key={idx}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {successProbability && (
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h4 className="text-xl font-bold text-slate-800">Application Success Probability</h4>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-slate-700">Overall Probability</span>
                    <span className={`text-3xl font-bold ${
                      successProbability.overallProbability >= 70 ? 'text-green-600' :
                      successProbability.overallProbability >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {successProbability.overallProbability}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        successProbability.overallProbability >= 70 ? 'bg-green-500' :
                        successProbability.overallProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${successProbability.overallProbability}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Qualifications</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${successProbability.breakdown.qualifications}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{successProbability.breakdown.qualifications}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Experience</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${successProbability.breakdown.experience}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{successProbability.breakdown.experience}%</span>
                    </div>
                  </div>
                </div>
                {successProbability.riskFactors.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900 mb-2">Risk Factors:</p>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {successProbability.riskFactors.map((risk: string, idx: number) => (
                        <li key={idx}>⚠️ {risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedJobForAnalysis(null);
                  setSalaryPrediction(null);
                  setSuccessProbability(null);
                }}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (selectedJobForAnalysis) {
                    handleTrackJob(selectedJobForAnalysis);
                    setSelectedJobForAnalysis(null);
                    setSalaryPrediction(null);
                    setSuccessProbability(null);
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                Track This Job
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

// --- Export Wrapper ---

const JobFinderModule = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            <JobFinder />
        </div>
    );
};

export default JobFinderModule;

