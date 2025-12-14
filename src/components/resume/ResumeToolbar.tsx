import { useState, useEffect } from 'react';
import { Download, Sparkles, RotateCcw, FileText, CheckCircle2, Clock, BarChart3, X, Target, ChevronDown, Upload, Undo2, Redo2, Bookmark } from 'lucide-react';
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
import RequiredFieldsModal from './RequiredFieldsModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { showErrorToUser, ErrorContexts } from '../../lib/errorMessages';
import { validateRequiredFields } from '../../lib/requiredFieldsValidation';

interface JobApplication {
  id: string;
  title: string;
  company: string;
  status?: string;
  description?: string;
}

export default function ResumeToolbar() {
  const { state, dispatch, isSaving, canUndo, canRedo, undo, redo } = useResume();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showATSScanner, setShowATSScanner] = useState(false);
  const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
  const [requiredFieldsErrors, setRequiredFieldsErrors] = useState<Array<{ field: string; label: string; section: string; message: string }>>([]);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Partial<ResumeData> | null>(null);
  
  // Loading states
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [isLoadingRestore, setIsLoadingRestore] = useState(false);
  
  // Target Job state
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(state.targetJobId || null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  // Sync local saveStatus with isSaving from context to ensure re-renders
  useEffect(() => {
    // Debug: Log when isSaving changes
    if (isSaving !== undefined) {
      console.log('ResumeToolbar: isSaving changed to', isSaving);
    }
    
    if (isSaving) {
      setSaveStatus('saving');
    } else if (saveStatus === 'saving') {
      // When saving completes, show saved status briefly
      setSaveStatus('saved');
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCurrentResumeId(getCurrentResumeId());
    loadJobs();
  }, []);

  // Sync selectedJobId with state.targetJobId
  useEffect(() => {
    if (state.targetJobId !== selectedJobId) {
      setSelectedJobId(state.targetJobId || null);
    }
  }, [state.targetJobId, selectedJobId]);

  // When jobs are loaded and we have a targetJobId, ensure targetJob is populated
  useEffect(() => {
    if (jobs.length > 0 && state.targetJobId && (!state.targetJob.title || state.targetJob.title === '')) {
      const job = jobs.find(j => j.id === state.targetJobId);
      if (job) {
        dispatch({
          type: 'UPDATE_TARGET_JOB',
          payload: {
            title: job.title || '',
            description: job.description || state.targetJob.description || '',
            industry: job.company || state.targetJob.industry || '',
          },
        });
      }
    }
  }, [jobs, state.targetJobId, state.targetJob.title, dispatch]);

  // When targetJob is updated but we don't have a targetJobId, try to find matching job
  useEffect(() => {
    if (jobs.length > 0 && !state.targetJobId && state.targetJob.title) {
      // Try to find a job that matches the target job title
      const matchingJob = jobs.find(j => 
        j.title === state.targetJob.title
      );
      
      if (matchingJob) {
        // Found a matching job, sync the targetJobId
        dispatch({
          type: 'SET_RESUME',
          payload: {
            ...state,
            targetJobId: matchingJob.id,
          },
        });
        setSelectedJobId(matchingJob.id);
      }
    }
  }, [jobs, state.targetJob.title, state.targetJobId, dispatch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Z or Cmd+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }
      // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z to redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUndo, canRedo, undo, redo]);

  // Load jobs from Supabase
  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_applications')
        .select('id, title, company, status, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) {
        setJobs(data as JobApplication[]);
        
        // If we have a targetJobId but no targetJob title, populate it
        if (state.targetJobId && (!state.targetJob.title || state.targetJob.title === '')) {
          const job = data.find((j: JobApplication) => j.id === state.targetJobId);
          if (job) {
            dispatch({
              type: 'UPDATE_TARGET_JOB',
              payload: {
                title: job.title || '',
                description: job.description || state.targetJob.description || '',
                industry: job.company || state.targetJob.industry || '',
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Show user-friendly error message
      showErrorToUser(error, ErrorContexts.LOAD_JOBS);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Handle job selection
  const handleJobSelect = async (jobId: string | null) => {
    setSelectedJobId(jobId);
    setShowJobDropdown(false);
    
    // Find the selected job to get its details
    const selectedJob = jobs.find(j => j.id === jobId);
    
    // Update targetJobId first
    dispatch({
      type: 'SET_RESUME',
      payload: {
        ...state,
        targetJobId: jobId,
      },
    });
    
    // Then update targetJob details if a job is selected
    if (selectedJob) {
      dispatch({
        type: 'UPDATE_TARGET_JOB',
        payload: {
          title: selectedJob.title || '',
          description: selectedJob.description || state.targetJob.description || '',
          industry: selectedJob.company || state.targetJob.industry || '',
        },
      });
    } else if (!jobId) {
      // Clear target job if no job is selected
      dispatch({
        type: 'UPDATE_TARGET_JOB',
        payload: {
          title: '',
          description: '',
          industry: '',
        },
      });
    }
    
    // Create updated resume for saving
    const updatedResume = { 
      ...state, 
      targetJobId: jobId,
      targetJob: selectedJob ? {
        title: selectedJob.title || '',
        description: selectedJob.description || state.targetJob.description || '',
        industry: selectedJob.company || state.targetJob.industry || '',
      } : (jobId ? state.targetJob : { title: '', description: '', industry: '' }),
    };
    
    // If resume is saved, update it in storage
    if (currentResumeId) {
      try {
        await saveResume(updatedResume);
      } catch (error) {
        console.error('Error updating resume with target job:', error);
        showErrorToUser(error, ErrorContexts.UPDATE_TARGET_JOB);
      }
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleSave = () => {
    // Validate required fields before showing save modal
    const validation = validateRequiredFields(state);
    
    if (!validation.isValid) {
      // Show required fields modal
      setRequiredFieldsErrors(validation.errors);
      setShowRequiredFieldsModal(true);
      return;
    }
    
    // All required fields are filled, show save modal
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async (title: string) => {
    setIsLoadingSave(true);
    try {
      const resumeId = await saveResume(state, title);
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
      showErrorToUser(error, ErrorContexts.SAVE_RESUME);
    } finally {
      setIsLoadingSave(false);
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
      await saveResume(restoredData);
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const handleResetConfirm = () => {
    dispatch({
      type: 'SET_RESUME',
      payload: INITIAL_RESUME_STATE,
    });
    setCurrentResumeId(null);
    setShowResetConfirmation(false);
  };

  const handleAIAssistant = () => {
    dispatch({ type: 'TOGGLE_AI_SIDEBAR' });
  };

  /**
   * Check if the current resume has meaningful content (not just initial/empty state)
   */
  const hasExistingContent = (): boolean => {
    // Check if resume has a saved ID
    if (currentResumeId) return true;
    
    // Check if personal info has meaningful content
    const hasPersonalInfo = Boolean(
      state.personalInfo.fullName?.trim() ||
      state.personalInfo.email?.trim() ||
      state.personalInfo.phone?.trim() ||
      state.personalInfo.summary?.trim()
    );
    
    // Check if any sections have items
    const hasSectionContent = state.sections.some(section => 
      section.items && section.items.length > 0
    );
    
    // Check if title is more than just "Untitled Resume"
    const hasCustomTitle = Boolean(
      state.title && 
      state.title !== 'Untitled Resume' && 
      state.title.trim().length > 0
    );
    
    return hasPersonalInfo || hasSectionContent || hasCustomTitle;
  };

  const handleImport = async (importedData: Partial<ResumeData>) => {
    // Check if there's existing content that would be overwritten
    if (hasExistingContent()) {
      // Store the imported data and show confirmation
      setPendingImportData(importedData);
      setShowImportConfirmation(true);
      return;
    }
    
    // No existing content, proceed with import directly
    await performImport(importedData);
  };

  const performImport = async (importedData: Partial<ResumeData>) => {
    // Validate imported data before merging
    const { validateImportedResume } = await import('../../lib/importValidation');
    const validation = validateImportedResume(importedData);
    
    if (!validation.isValid) {
      // Show validation errors to user
      const errorMessage = validation.errors.join('\n');
      alert(`Import validation failed:\n\n${errorMessage}\n\nPlease check your import data and try again.`);
      return;
    }
    
    // Use validated data if available
    const validatedData = validation.validatedData || importedData;
    
    // Merge imported data with current state, preserving settings and other metadata
    const mergedData: ResumeData = {
      ...state,
      // Apply validated imported data
      ...validatedData,
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
    
    // Close import modal
    setShowImportModal(false);
  };

  const handleConfirmImport = () => {
    if (pendingImportData) {
      performImport(pendingImportData);
      setPendingImportData(null);
      setShowImportConfirmation(false);
    }
  };

  const handleCancelImport = () => {
    setPendingImportData(null);
    setShowImportConfirmation(false);
  };

  const isUpdating = currentResumeId !== null;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 no-print">
        {/* Target Job Dropdown */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowJobDropdown(!showJobDropdown)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors w-full sm:w-auto"
            title="Select target job for tailoring"
          >
            <Target className="w-4 h-4 flex-shrink-0" />
            <span className="truncate hidden sm:inline">{selectedJob ? `${selectedJob.title} at ${selectedJob.company}` : 'Target Job'}</span>
            <span className="truncate sm:hidden">{selectedJob ? 'Target Job' : 'Target Job'}</span>
            <ChevronDown className="w-4 h-4 flex-shrink-0 ml-auto sm:ml-0" />
          </button>
          
          {showJobDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowJobDropdown(false)}
              />
              <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 z-20 bg-white border border-slate-300 rounded-md shadow-lg min-w-[300px] sm:min-w-[300px] max-w-full sm:max-w-md max-h-[400px] overflow-y-auto">
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
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium w-full sm:w-auto">
            <Target className="w-3 h-3 flex-shrink-0" />
            <span className="truncate hidden sm:inline">Tailoring for {selectedJob.title} at {selectedJob.company}</span>
            <span className="truncate sm:hidden">Tailoring</span>
            <button
              onClick={() => handleJobSelect(null)}
              className="ml-auto sm:ml-1 hover:text-indigo-900 flex-shrink-0"
              title="Clear target job"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1 border-r-0 sm:border-r border-slate-300 pr-0 sm:pr-2 mr-0 sm:mr-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-1 px-3 py-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center gap-1 px-3 py-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* My Resumes Button */}
        <button
          onClick={() => setShowLibrary(true)}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors w-full sm:w-auto"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">My Resumes</span>
        </button>

        {/* Import Button */}
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors w-full sm:w-auto"
          title="Import resume from text or file"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Version History Button */}
        {currentResumeId && (
          <button
            onClick={() => setShowVersionHistory(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors w-full sm:w-auto"
            title="View version history"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
        )}

        {/* Job Scan Button */}
        <button
          id="ats-scan-btn"
          onClick={() => setShowATSScanner(true)}
          className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors w-full sm:w-auto ${
            showATSScanner
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
              : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
          title="Scan resume against job description for ATS compatibility"
        >
          <Target className="w-4 h-4" />
          <span className="hidden sm:inline">Job Scan</span>
        </button>

        {/* Analytics Button */}
        {currentResumeId && (
          <button
            onClick={() => setShowAnalytics(true)}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors w-full sm:w-auto ${
              showAnalytics
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
            }`}
            title="View resume analytics"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </button>
        )}

        {/* Auto-Save Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md w-full sm:w-auto justify-center sm:justify-start">
          {isSaving ? (
            <>
              <Clock className="w-3 h-3 animate-spin text-indigo-600" />
              <span>Auto-saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span>Auto-saved</span>
            </>
          )}
        </div>

        {/* Save to Library Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isSaving
              ? 'bg-slate-100 text-slate-500 border border-slate-300 cursor-not-allowed'
              : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
          title={isUpdating ? 'Update resume name in library' : 'Save resume to library with a custom name'}
        >
          <Bookmark className="w-4 h-4" />
          <span>{isUpdating ? 'Rename' : 'Save to Library'}</span>
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
        onClose={() => {
          setShowImportModal(false);
          setPendingImportData(null);
        }}
        onImport={handleImport}
      />

      {/* Import Confirmation Modal */}
      <ConfirmationModal
        isOpen={showImportConfirmation}
        onClose={handleCancelImport}
        onConfirm={handleConfirmImport}
        title="Overwrite Current Resume?"
        message={`You have existing resume content that will be replaced by the imported data. This action cannot be undone. Are you sure you want to continue?`}
        confirmText="Yes, Overwrite"
        cancelText="Cancel"
        variant="warning"
        stackLevel={1} // Stacked on top of import modal
      />

      {/* ATS Scanner Panel */}
      <ATSScannerPanel
        isOpen={showATSScanner}
        onClose={() => setShowATSScanner(false)}
        resume={state}
      />

      {/* Required Fields Modal */}
      <RequiredFieldsModal
        isOpen={showRequiredFieldsModal}
        onClose={() => setShowRequiredFieldsModal(false)}
        errors={requiredFieldsErrors}
      />

      <ConfirmationModal
        isOpen={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={handleResetConfirm}
        title="Reset Resume"
        message="Are you sure you want to reset the resume to its initial state? This will clear all your changes and cannot be undone."
        confirmText="Reset Resume"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
