import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  X,
  Building2,
  MoreHorizontal,
  MapPin,
  ExternalLink,
  Sparkles,
  Trash2,
} from 'lucide-react';

/**
 * SkillHoop Job Tracker Module
 * A Kanban-style board for tracking job applications.
 */

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
      // Dispatch a storage event to sync across tabs/components
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch {
      return false;
    }
  },

  addJobToTracker(job: any, source = 'manual', status = 'new-leads') {
    const trackedJobs = this.getAllTrackedJobs();

    // Duplicate detection
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
      salary: job.salary || '',
      matchScore: job.matchScore || 0,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0],
      source: job.source || source,
      status: status,
      notes: job.notes || '',
      applicationDate: status === 'applied' ? new Date().toISOString().split('T')[0] : '',
      interviewDate: '',
      contacts: '',
      url: job.url || '',
      whyMatch: job.whyMatch || '',
      description: job.description || '',
      addedFrom: source,
      addedAt: new Date().toISOString(),
    };

    trackedJobs.push(trackerJob);
    this.saveTrackedJobs(trackedJobs);

    return { success: true, message: 'Job added to tracker!', job: trackerJob };
  },

  updateJob(updatedJob: any) {
    const jobs = this.getAllTrackedJobs();
    const index = jobs.findIndex((j: any) => j.id === updatedJob.id);
    if (index !== -1) {
      jobs[index] = updatedJob;
      this.saveTrackedJobs(jobs);
      return true;
    }
    return false;
  },

  deleteJob(jobId: number) {
    const jobs = this.getAllTrackedJobs();
    const filtered = jobs.filter((j: any) => j.id !== jobId);
    this.saveTrackedJobs(filtered);
    return true;
  },

  getAnalytics() {
    const jobs = this.getAllTrackedJobs();
    const total = jobs.length;
    const byStatus: any = {};
    const bySource: any = {};
    let totalMatchScore = 0;
    let matchScoreCount = 0;

    jobs.forEach((job: any) => {
      // Status count
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;
      // Source count
      bySource[job.source] = (bySource[job.source] || 0) + 1;
      // Match score
      if (job.matchScore > 0) {
        totalMatchScore += job.matchScore;
        matchScoreCount++;
      }
    });

    const averageMatchScore = matchScoreCount > 0 ? Math.round(totalMatchScore / matchScoreCount) : 0;

    // Calculated totals
    const totalApplied = jobs.filter((j: any) => ['applied', 'interviewing', 'offer'].includes(j.status) || j.applicationDate)
      .length;
    const totalInterviews = jobs.filter((j: any) => ['interviewing', 'offer'].includes(j.status) || j.interviewDate).length;
    const totalOffers = jobs.filter((j: any) => j.status === 'offer').length;

    return {
      total,
      byStatus,
      bySource,
      averageMatchScore,
      totalApplied,
      totalInterviews,
      totalOffers,
    };
  },
};

// --- Job Tracker Component ---
const JobTracker = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Kanban Columns Configuration
  const columns = [
    { id: 'new-leads', label: 'New Leads', accent: 'bg-blue-500', text: 'text-neutral-900', badge: 'bg-blue-100 text-blue-700' },
    { id: 'reviewing', label: 'Reviewing', accent: 'bg-amber-500', text: 'text-neutral-900', badge: 'bg-amber-100 text-amber-700' },
    { id: 'applied', label: 'Applied', accent: 'bg-purple-500', text: 'text-neutral-900', badge: 'bg-purple-100 text-purple-700' },
    { id: 'interviewing', label: 'Interviewing', accent: 'bg-orange-500', text: 'text-neutral-900', badge: 'bg-orange-100 text-orange-700' },
    { id: 'offer', label: 'Offer', accent: 'bg-emerald-500', text: 'text-neutral-900', badge: 'bg-emerald-100 text-emerald-700' },
    { id: 'rejected', label: 'Rejected', accent: 'bg-red-500', text: 'text-neutral-900', badge: 'bg-red-100 text-red-700' },
    { id: 'archived', label: 'Archived', accent: 'bg-slate-500', text: 'text-neutral-900', badge: 'bg-slate-100 text-slate-700' },
  ];

  // Load Data
  const loadData = useCallback(() => {
    const allJobs = JobTrackingUtils.getAllTrackedJobs();
    setJobs(allJobs);
    setAnalytics(JobTrackingUtils.getAnalytics());
  }, []);

  useEffect(() => {
    loadData();
    // Listen for storage events (updates from other components/tabs)
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadData, refreshTrigger]);

  // Notifications
  const showNotification = (message: string, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, jobId: number) => {
    setIsDragging(true);
    e.dataTransfer.setData('jobId', jobId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setIsDragging(false);
    const jobId = Number(e.dataTransfer.getData('jobId'));
    const job = jobs.find((j) => j.id === jobId);

    if (job && job.status !== status) {
      const updatedJob = { ...job, status };

      // Auto-set dates based on status
      if (status === 'applied' && !updatedJob.applicationDate) {
        updatedJob.applicationDate = new Date().toISOString().split('T')[0];
      }
      if (status === 'interviewing') {
        showNotification(`Congrats on the interview for ${job.company}!`, 'success');
      }

      JobTrackingUtils.updateJob(updatedJob);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  // Manual Add
  const handleManualAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newJob = {
      title: formData.get('title'),
      company: formData.get('company'),
      location: formData.get('location'),
      salary: formData.get('salary'),
      url: formData.get('url'),
      notes: formData.get('notes'),
      source: 'Manual Entry',
    };

    const result = JobTrackingUtils.addJobToTracker(newJob);
    if (result.success) {
      showNotification('Job added successfully!', 'success');
      setShowManualAdd(false);
      setRefreshTrigger((prev) => prev + 1);
    } else {
      showNotification(result.message as string, 'error');
    }
  };

  // Job Details Update
  const handleJobUpdate = (updatedFields: any) => {
    if (!selectedJob) return;
    const updatedJob = { ...selectedJob, ...updatedFields };
    JobTrackingUtils.updateJob(updatedJob);
    setSelectedJob(updatedJob);
    setRefreshTrigger((prev) => prev + 1);
    showNotification('Job updated', 'success');
  };

  const handleDeleteJob = () => {
    if (selectedJob && confirm('Are you sure you want to delete this job?')) {
      JobTrackingUtils.deleteJob(selectedJob.id);
      setSelectedJob(null);
      setRefreshTrigger((prev) => prev + 1);
      showNotification('Job deleted', 'info');
    }
  };

  // Render Job Card
  const renderJobCard = (job: any) => {
    const matchColor =
      job.matchScore >= 90
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
        : job.matchScore >= 80
          ? 'bg-blue-100 text-blue-700 border-blue-200'
          : job.matchScore >= 70
            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
            : 'bg-red-100 text-red-700 border-red-200';

    return (
      <div
        key={job.id}
        draggable
        onDragStart={(e) => handleDragStart(e, job.id)}
        onClick={() => setSelectedJob(job)}
        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-slate-300 cursor-grab active:cursor-grabbing transition-all group relative animate-fade-in-up h-full flex flex-col"
      >
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="font-bold text-sm text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h4>
          <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-3 text-slate-500">
          <Building2 size={12} className="shrink-0" />
          <span className="text-xs font-medium truncate">{job.company}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
          <div className="flex items-center gap-2">
            {job.matchScore > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${matchColor}`}>
                {job.matchScore}% Match
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{job.postedDate}</span>
        </div>
      </div>
    );
  };

  // Manual Add Modal
  const ManualAddModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-neutral-900">Add Job Manually</h3>
          <button onClick={() => setShowManualAdd(false)} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleManualAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Job Title *</label>
            <input
              name="title"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Company *</label>
            <input
              name="company"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
              <input
                name="location"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Salary</label>
              <input
                name="salary"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">URL</label>
            <input
              name="url"
              type="url"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Initial Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
            ></textarea>
          </div>
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setShowManualAdd(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors"
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Job Details Modal
  const JobDetailsModal = () => {
    const [activeTab, setActiveTab] = useState('details');
    if (!selectedJob) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-fade-in-up">
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-neutral-900">{selectedJob.title}</h2>
                {selectedJob.matchScore > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedJob.matchScore}% Match
                  </span>
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
            <div className="flex items-center gap-2">
              <select
                value={selectedJob.status}
                onChange={(e) => handleJobUpdate({ status: e.target.value })}
                className="bg-slate-50 border border-slate-200 text-sm font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-neutral-900"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Notes & Activity
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
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
                    <div className="font-medium text-slate-800">
                      {new Date(selectedJob.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Job Link</label>
                    {selectedJob.url ? (
                      <a
                        href={selectedJob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        View Posting <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-slate-400">No URL</span>
                    )}
                  </div>
                </div>

                {selectedJob.whyMatch && (
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                    <h4 className="text-indigo-900 font-bold text-sm mb-2 flex items-center gap-2">
                      <Sparkles size={16} /> Why it matches
                    </h4>
                    <p className="text-indigo-800 text-sm leading-relaxed">{selectedJob.whyMatch}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Description</label>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedJob.description || 'No description available.'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6">
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                      Application Date
                    </label>
                    <input
                      type="date"
                      value={selectedJob.applicationDate}
                      onChange={(e) => handleJobUpdate({ applicationDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                      Interview Date
                    </label>
                    <input
                      type="date"
                      value={selectedJob.interviewDate}
                      onChange={(e) => handleJobUpdate({ interviewDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Contacts</label>
                  <textarea
                    className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-neutral-900 resize-none"
                    placeholder="Name, Email, Role..."
                    value={selectedJob.contacts}
                    onChange={(e) => handleJobUpdate({ contacts: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between rounded-b-2xl">
            <button
              onClick={handleDeleteJob}
              className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete Job
            </button>
            <div className="flex gap-3">
              <button className="px-5 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                Tailor Resume
              </button>
              <button
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2 bg-neutral-900 text-white font-bold text-sm rounded-lg hover:bg-neutral-800 transition-colors shadow-lg"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 h-[calc(100vh-4rem)] flex flex-col">
        {notification && (
          <div
            className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-xl shadow-2xl ${
              notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white animate-fade-in-up`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Analytics Header */}
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
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${analytics.averageMatchScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowManualAdd(true)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add New Job
          </button>
        </div>

        {/* Kanban Board - Vertical Layout */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col gap-6 pb-6">
            {columns.map((column) => {
              const columnJobs = jobs.filter((j) => j.status === column.id);
              return (
                <div
                  key={column.id}
                  className={`w-full flex flex-col rounded-xl bg-white border border-slate-200 transition-all ${
                    isDragging ? 'ring-2 ring-blue-100' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${column.accent}`}></span>
                      <h3 className={`font-bold text-sm ${column.text}`}>{column.label}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.badge}`}>{columnJobs.length}</span>
                  </div>

                  {/* Drop Area - Grid Layout */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {columnJobs.length > 0 ? (
                      columnJobs.map((job) => renderJobCard(job))
                    ) : (
                      <div className="col-span-full h-16 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                        Drop here to move to {column.label}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showManualAdd && <ManualAddModal />}
        {selectedJob && <JobDetailsModal />}
      </div>
    </div>
  );
};

export default JobTracker;

