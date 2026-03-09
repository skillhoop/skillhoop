/**
 * JobSearchDashboard — Personalized Job Search UI
 * Replaces the post-upload screen in Job Finder with a polished dashboard.
 * Binds to live resumeData and wires to getJobRecommendations.
 */
import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export interface ResumeDataForDashboard {
  personalInfo?: {
    fullName?: string;
    name?: string;
    title?: string;
    jobTitle?: string;
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

export interface ResumeFiltersForDashboard {
  workType: string;
  remote: string;
  experienceLevel: string;
  minSalary: string;
  location: string;
}

export interface JobSearchDashboardProps {
  /** Active resume filename (e.g. "lavanya_cv_2025.pdf") */
  activeResume: string | null;
  /** Parsed resume data from state */
  resumeData: ResumeDataForDashboard | null;
  /** Callback when user clicks Find Personalized Jobs */
  onFindJobs: () => void;
  /** Whether the find-jobs request is in progress */
  isFindingJobs: boolean;
  /** Status message shown below the Find Jobs button */
  findJobsStatus?: string;
  /** Button text (e.g. "Find Personalized Jobs" or "Analyzing matches...") */
  findJobsBtnText?: string;
  /** Resume filters (work type, remote, experience, location) */
  resumeFilters: ResumeFiltersForDashboard;
  onResumeFiltersChange: (filters: Partial<ResumeFiltersForDashboard>) => void;
  /** Selected search strategy id */
  selectedSearchStrategy: string | null;
  onSearchStrategyChange: (strategyId: string | null) => void;
  /** Upload new resume handler */
  onUploadNew: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingResume?: boolean;
  /** Manual entry fallback when title/skills not detected */
  showManualEntry?: boolean;
  manualJobTitle?: string;
  manualTopSkills?: string;
  onManualJobTitleChange?: (v: string) => void;
  onManualTopSkillsChange?: (v: string) => void;
  onApplyManualEntry?: () => void;
  /** Location input (for top bar) */
  locationInput?: string;
  onLocationInputChange?: (v: string) => void;
  onMyLocation?: () => void;
  isLocationLoading?: boolean;
  /** Willing to relocate toggle */
  willingToRelocate?: boolean;
  onWillingToRelocateChange?: (v: boolean) => void;
}

const STRATEGIES = [
  { id: 'background', icon: 'work_history', label: 'Your Background', bg: 'bg-pink-50', hover: 'hover:shadow-pink-100', border: 'border-pink-400', shadow: 'shadow-pink-100', text: 'text-pink-500' },
  { id: 'career_progression', icon: 'trending_up', label: 'Next Career Step', bg: 'bg-purple-50', hover: 'hover:shadow-purple-100', border: 'border-purple-400', shadow: 'shadow-purple-100', text: 'text-purple-500' },
  { id: 'skill_based', icon: 'psychology', label: 'Skill-Based Match', bg: 'bg-blue-50', hover: 'hover:shadow-blue-100', border: 'border-blue-400', shadow: 'shadow-blue-100', text: 'text-blue-500' },
  { id: 'passion_based', icon: 'volunteer_activism', label: 'Passion & Interests', bg: 'bg-green-50', hover: 'hover:shadow-green-100', border: 'border-green-400', shadow: 'shadow-green-100', text: 'text-green-500' },
  { id: 'industry_switch', icon: 'alt_route', label: 'Industry Switch', bg: 'bg-orange-50', hover: 'hover:shadow-orange-100', border: 'border-orange-400', shadow: 'shadow-orange-100', text: 'text-orange-500' },
];

export default function JobSearchDashboard({
  activeResume,
  resumeData,
  onFindJobs,
  isFindingJobs,
  findJobsStatus = 'Our AI will match your background with 10k+ available opportunities.',
  findJobsBtnText = 'Find Personalized Jobs',
  resumeFilters,
  onResumeFiltersChange,
  selectedSearchStrategy,
  onSearchStrategyChange,
  onUploadNew,
  isUploadingResume = false,
  showManualEntry = false,
  manualJobTitle = '',
  manualTopSkills = '',
  onManualJobTitleChange,
  onManualTopSkillsChange,
  onApplyManualEntry,
  locationInput = '',
  onLocationInputChange,
  onMyLocation,
  isLocationLoading = false,
  willingToRelocate = false,
  onWillingToRelocateChange,
}: JobSearchDashboardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const allSkills = [
    ...(resumeData?.skills?.technical ?? []),
    ...(resumeData?.skills?.soft ?? []),
  ];
  const visibleSkills = allSkills.slice(0, 5);
  const hiddenSkills = allSkills.slice(5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    const text = resumeData?.summary ?? '';
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const displayFileName = activeResume ?? 'Resume';
  const displaySummary = resumeData?.summary ?? 'No summary extracted. Upload a resume to get started.';

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-[90rem] mx-auto space-y-6">
        {/* Top Search & Filter Bar */}
        <header className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 card-shadow">
          <div className="flex flex-row items-center gap-2 overflow-x-auto flex-nowrap w-full hide-scrollbar">
            <div className="flex-grow min-w-[220px] relative shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                placeholder="Search by title, skill, or company"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
              />
            </div>
            <div className="w-52 relative shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
              <input
                type="text"
                placeholder="City, state, or zip"
                value={locationInput}
                onChange={(e) => onLocationInputChange?.(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
              />
              <span
                onClick={() => onMyLocation?.()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onMyLocation?.()}
                className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-brand transition-colors ${isLocationLoading ? 'animate-pulse text-brand' : ''}`}
              >
                my_location
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 shrink-0 mx-1" />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onWillingToRelocateChange?.(!willingToRelocate)}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl shrink-0 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => onWillingToRelocateChange?.(!willingToRelocate)}
            >
              <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 flex items-center p-0.5 ${willingToRelocate ? 'bg-brand' : 'bg-slate-200'}`}>
                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${willingToRelocate ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-slate-600 select-none">Relocate</span>
            </div>
          </div>
        </header>

        {/* Main Dashboard Card */}
        <main className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 card-shadow">
          {/* Resumes Section */}
          <section className="mb-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Resumes</h2>
                <p className="text-slate-500 text-sm mt-1">Upload your resumes and choose to rename for your resume.</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  onChange={onUploadNew}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.txt"
                  disabled={isUploadingResume}
                />
                <button
                  type="button"
                  className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all font-medium text-sm pointer-events-none"
                >
                  <span className="material-symbols-outlined text-lg">upload</span>
                  <span>{isUploadingResume ? 'Uploading...' : 'Upload New'}</span>
                </button>
              </div>
            </div>

            {/* Resume Item Card — bound to resumeData */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden relative">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 pr-2">
                  <div className="flex gap-4">
                    <div className="w-12 h-14 bg-white border border-slate-100 rounded-lg shadow-sm flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl text-red-500 filled-icon">description</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-800">{displayFileName}</h3>
                        {activeResume && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">Active</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">Parsed from your upload</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3 max-w-[95%]">
                        {visibleSkills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] font-medium rounded-lg border border-slate-200 whitespace-nowrap">
                            {skill}
                          </span>
                        ))}
                        {hiddenSkills.length > 0 && (
                          <div className="relative inline-block" ref={popoverRef}>
                            <button
                              type="button"
                              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                              className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors focus:outline-none whitespace-nowrap"
                            >
                              +{hiddenSkills.length} more
                            </button>
                            {isPopoverOpen && (
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[220px] bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 p-3 z-20">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Skills</h5>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                  {hiddenSkills.map((skill, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] font-medium rounded-lg border border-slate-200 whitespace-nowrap">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-b border-r border-slate-200 transform rotate-45 rounded-sm" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-800">Resume Summary</h4>
                      <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        className="text-slate-400 hover:text-brand transition-colors p-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-center shadow-sm border border-slate-100"
                        title="Read Full Summary"
                      >
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                      </button>
                    </div>
                    <div className="text-sm text-slate-600 leading-relaxed max-h-24 overflow-y-auto pr-4 custom-scrollbar">
                      <p>{displaySummary}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Customization Section */}
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Customize Your Job Search</h2>
                <p className="text-slate-500 text-sm mt-1">Select a search strategy based on your professional goals.</p>
              </div>
              <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-3.5 flex gap-3 max-w-sm">
                <span className="material-symbols-outlined text-[#d97706] text-xl">lightbulb</span>
                <p className="text-[11px] text-[#92400e] leading-relaxed">
                  <span className="font-bold">Pro Tip:</span> Switching strategies can reveal 20% more jobs.
                </p>
              </div>
            </div>

            {/* Strategy Grid */}
            <div className="space-y-4 mb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Search jobs based on</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {STRATEGIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSearchStrategyChange(selectedSearchStrategy === s.id ? null : s.id)}
                    disabled={isFindingJobs}
                    className={`flex flex-col items-center justify-center p-6 ${s.bg} border-2 rounded-3xl transition-all group hover:-translate-y-1 ${s.hover} ${selectedSearchStrategy === s.id ? `${s.border} shadow-md ${s.shadow}` : 'border-transparent'} ${isFindingJobs ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm">
                      <span className={`material-symbols-outlined ${s.text} filled-icon text-[22px]`}>{s.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight text-center">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Entry fallback */}
            {showManualEntry && (
              <div className="mb-6 p-5 rounded-xl border border-amber-200 bg-amber-50/80">
                <h3 className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Manual Entry
                </h3>
                <p className="text-xs text-amber-800 mb-4">Add your current job title and top skills so recommendations work correctly.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Current Job Title</label>
                    <input
                      type="text"
                      value={manualJobTitle}
                      onChange={(e) => onManualJobTitleChange?.(e.target.value)}
                      placeholder="e.g. Accounts Receivable, Product Manager"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Top Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={manualTopSkills}
                      onChange={(e) => onManualTopSkillsChange?.(e.target.value)}
                      placeholder="e.g. JavaScript, React, Python"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onApplyManualEntry}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-slate-800"
                >
                  <Check className="w-4 h-4" />
                  Apply
                </button>
              </div>
            )}

            {/* Filters Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Work Type</label>
                <div className="relative">
                  <select
                    value={resumeFilters.workType}
                    onChange={(e) => onResumeFiltersChange({ workType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium appearance-none focus:ring-brand/20 outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Remote Preference</label>
                <div className="relative">
                  <select
                    value={resumeFilters.remote}
                    onChange={(e) => onResumeFiltersChange({ remote: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium appearance-none focus:ring-brand/20 outline-none"
                  >
                    <option value="Any">Any</option>
                    <option value="Remote">Remote</option>
                    <option value="Remote Only">Remote Only</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="On-site Only">On-site Only</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Experience Level</label>
                <div className="relative">
                  <select
                    value={resumeFilters.experienceLevel}
                    onChange={(e) => onResumeFiltersChange({ experienceLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium appearance-none focus:ring-brand/20 outline-none"
                  >
                    <option value="Any level">Any Level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={resumeFilters.location}
                    onChange={(e) => onResumeFiltersChange({ location: e.target.value })}
                    placeholder="City, state, or zip"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-brand/20 outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
                </div>
              </div>
            </div>

            {/* Find Jobs Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={onFindJobs}
                disabled={isFindingJobs || !activeResume || !resumeData}
                className={`w-full bg-primary text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 ${isFindingJobs ? 'opacity-90' : ''} ${!activeResume || !resumeData ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className={`material-symbols-outlined text-xl transition-all ${isFindingJobs ? 'animate-spin' : ''}`}>
                  {isFindingJobs ? 'hourglass_empty' : 'auto_awesome'}
                </span>
                <span>{findJobsBtnText}</span>
              </button>
              <p className="text-center text-slate-400 text-[11px] italic">{findJobsStatus}</p>
            </div>
          </section>
        </main>

        {/* Preview Modal */}
        {isPreviewOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-opacity duration-300"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 md:px-8 md:pt-8 pb-4 border-b border-slate-100 bg-gradient-to-r from-green-50/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-sm border border-green-200/50">
                    <span className="material-symbols-outlined filled-icon text-2xl">summarize</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Resume Summary</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Full extracted summary</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <span className="material-symbols-outlined text-lg">content_copy</span>}
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{displaySummary}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
