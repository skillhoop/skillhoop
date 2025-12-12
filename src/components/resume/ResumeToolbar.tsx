import { useState, useEffect } from 'react';
import { Download, Save, Sparkles, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { INITIAL_RESUME_STATE } from '../../types/resume';
import { saveResume, getCurrentResumeId, type SavedResume } from '../../lib/resumeStorage';
import SaveResumeModal from './SaveResumeModal';
import ResumeLibrary from './ResumeLibrary';
import ExportModal from './ExportModal';

export default function ResumeToolbar() {
  const { state, dispatch } = useResume();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    setCurrentResumeId(getCurrentResumeId());
  }, []);

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

  const isUpdating = currentResumeId !== null;

  return (
    <>
      <div className="flex items-center gap-2 no-print">
        {/* My Resumes Button */}
        <button
          onClick={() => setShowLibrary(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>My Resumes</span>
        </button>

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
    </>
  );
}
