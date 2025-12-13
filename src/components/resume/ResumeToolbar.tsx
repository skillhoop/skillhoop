import { useState, useEffect } from 'react';
import { Download, Save, Sparkles, RotateCcw, FileText, CheckCircle2, Clock, BarChart3, X, Target, ChevronDown, Upload } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { INITIAL_RESUME_STATE, type ResumeData } from '../../types/resume';
import { saveResume, getCurrentResumeId, type SavedResume } from '../../lib/resumeStorage';
import { supabase } from '../../lib/supabase';
import SaveResumeModal from './SaveResumeModal';
import ResumeLibrary from './ResumeLibrary';
import ExportModal from './ExportModal';
import VersionHistoryPanel from './VersionHistoryPanel';
import ResumeAnalytics from './ResumeAnalytics';
import ImportModal from './ImportModal';
import ATSScannerPanel from './ATSScannerPanel';

interface JobApplication {
  id: string;
  title: string;
  company: string;
  status?: string;
}

export default function ResumeToolbar() {
  const { state, dispatch } = useResume();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showATSScanner, setShowATSScanner] = useState(false);
  
  // Target Job state
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(state.targetJobId || null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  useEffect(() => {
    setCurrentResumeId(getCurrentResumeId());
    loadJobs();
    // Load target job ID from resume state
    if (state.targetJobId) {
      setSelectedJobId(state.targetJobId);
    }
  }, [state.targetJobId]);

  // Load jobs from Supabase
  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_applications')
        .select('id, title, company, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) {
        setJobs(data as JobApplication[]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Handle job selection
  const handleJobSelect = async (jobId: string | null) => {
    setSelectedJobId(jobId);
    setShowJobDropdown(false);
    
    // Update resume state with target_job_id
    const updatedResume = { ...state, targetJobId: jobId };
    dispatch({
      type: 'SET_RESUME',
      payload: updatedResume,
    });
    
    // If resume is saved, update it in storage
    if (currentResumeId) {
      try {
        saveResume(updatedResume);
      } catch (error) {
        console.error('Error updating resume with target job:', error);
      }
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = (title: string) => {
    try {
      const resumeId = saveResume(state, title);
      setCurrentResumeId(resumeId);
      setShowSaveModal(false);
      setSaveStatus('saved');
      
      // Update resume ID in state
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: {},
      });
      
      // Reset saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    }
  };

  const handleLoadResume = (savedResume: SavedResume) => {
    dispatch({
      type: 'SET_RESUME',
      payload: savedResume.data,
    });
    setCurrentResumeId(savedResume.id);
    setShowLibrary(false);
  };

  const handleRestoreVersion = async (restoredData: ResumeData) => {
    // Create a backup version before restoring (so we can undo)
    if (currentResumeId) {
      try {
        const { createVersion } = await import('../../lib/resumeVersioning');
        await createVersion(currentResumeId, state, 'Backup before restore');
      } catch (error) {
        console.error('Error creating backup before restore:', error);
      }
    }

    // Restore the version
    dispatch({
      type: 'SET_RESUME',
      payload: restoredData,
    });
    
    // Save the restored version (update the existing resume)
    if (currentResumeId) {
      restoredData.id = currentResumeId;
      saveResume(restoredData);
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the resume to initial state? This will clear all your changes.')) {
      dispatch({
        type: 'SET_RESUME',
        payload: INITIAL_RESUME_STATE,
      });
      setCurrentResumeId(null);
    }
  };

  const handleAIAssistant = () => {
    dispatch({ type: 'TOGGLE_AI_SIDEBAR' });
  };

  const handleImport = (importedData: Partial<ResumeData>) => {
    // Merge imported data with current state, preserving settings and other metadata
    const mergedData: ResumeData = {
      ...state,
      // Apply imported data
      ...importedData,
      // Preserve important metadata that shouldn't be overwritten
      id: state.id,
      title: state.title || importedData.title || 'Untitled Resume',
      settings: state.settings, // Keep current formatting settings
      updatedAt: new Date().toISOString(),
      // Use imported sections if available, otherwise keep current
      sections: importedData.sections || state.sections,
      // Merge personal info (imported data takes precedence but fill in missing fields)
      personalInfo: {
        ...state.personalInfo,
        ...(importedData.personalInfo || {}),
      },
    };

    dispatch({
      type: 'SET_RESUME',
      payload: mergedData,
    });
  };

  const isUpdating = currentResumeId !== null;

  return (
    <>
      <div className="flex items-center gap-2 no-print flex-wrap">
        {/* Target Job Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowJobDropdown(!showJobDropdown)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
            title="Select target job for tailoring"
          >
            <Target className="w-4 h-4" />
            <span>{selectedJob ? `${selectedJob.title} at ${selectedJob.company}` : 'Target Job'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showJobDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowJobDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-300 rounded-md shadow-lg min-w-[300px] max-w-md max-h-[400px] overflow-y-auto">
                <div className="p-2">
                  <button
                    onClick={() => handleJobSelect(null)}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm ${
                      !selectedJobId ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700'
                    }`}
                  >
                    No Target Job
                  </button>
                  {isLoadingJobs ? (
                    <div className="px-3 py-2 text-sm text-slate-500">Loading jobs...</div>
                  ) : jobs.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-500">No jobs found. Add jobs in Job Tracker.</div>
                  ) : (
                    jobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => handleJobSelect(job.id)}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm ${
                          selectedJobId === job.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <div className="font-medium">{job.title}</div>
                        <div className="text-xs text-slate-500">{job.company}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Target Job Badge */}
        {selectedJob && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
            <Target className="w-3 h-3" />
            <span>Tailoring for {selectedJob.title} at {selectedJob.company}</span>
            <button
              onClick={() => handleJobSelect(null)}
              className="ml-1 hover:text-indigo-900"
              title="Clear target job"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* My Resumes Button */}
        <button
          onClick={() => setShowLibrary(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>My Resumes</span>
        </button>

        {/* Import Button */}
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
          title="Import resume from text or file"
        >
          <Upload className="w-4 h-4" />
          <span>Import</span>
        </button>

        {/* Version History Button */}
        {currentResumeId && (
          <button
            onClick={() => setShowVersionHistory(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
            title="View version history"
          >
            <Clock className="w-4 h-4" />
            <span>History</span>
          </button>
        )}

        {/* Job Scan Button */}
        <button
          id="ats-scan-btn"
          onClick={() => setShowATSScanner(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            showATSScanner
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
              : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
          title="Scan resume against job description for ATS compatibility"
        >
          <Target className="w-4 h-4" />
          <span>Job Scan</span>
        </button>

        {/* Analytics Button */}
        {currentResumeId && (
          <button
            onClick={() => setShowAnalytics(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              showAnalytics
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
            }`}
            title="View resume analytics"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        )}

        {/* Save Button - Secondary */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            saveStatus === 'saved'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
        >
          {saveStatus === 'saved' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isUpdating ? 'Update' : 'Save'}</span>
            </>
          )}
        </button>

        {/* AI Assistant Button - Secondary */}
        <button
          onClick={handleAIAssistant}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            state.isAISidebarOpen
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
              : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Assistant</span>
        </button>

        {/* Export PDF Button - Primary */}
        <button
          id="export-btn"
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>

        {/* Reset Button - Optional, for testing */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          title="Reset to initial state"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Save Modal */}
      <SaveResumeModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveConfirm}
        currentResume={state}
        isUpdating={isUpdating}
      />

      {/* Resume Library */}
      <ResumeLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onLoad={handleLoadResume}
        currentResumeId={currentResumeId}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resume={state}
      />

      {/* Version History Panel */}
      {currentResumeId && (
        <VersionHistoryPanel
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          resumeId={currentResumeId}
          currentResume={state}
          onRestore={handleRestoreVersion}
          position="modal"
        />
      )}

      {/* Analytics Panel */}
      {showAnalytics && currentResumeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Resume Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ResumeAnalytics
                resumeData={state}
                resumeId={currentResumeId}
                currentATSScore={state.atsScore}
              />
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      {/* ATS Scanner Panel */}
      <ATSScannerPanel
        isOpen={showATSScanner}
        onClose={() => setShowATSScanner(false)}
        resume={state}
      />
    </>
  );
}
