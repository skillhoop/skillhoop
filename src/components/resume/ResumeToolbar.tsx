import { Download, Save, Sparkles, RotateCcw } from '../ui/Icons';
import { useResume } from '../../context/ResumeContext';
import { INITIAL_RESUME_STATE } from '../../types/resume';

export default function ResumeToolbar() {
  const { dispatch } = useResume();

  const handleSave = () => {
    console.log('Saving...');
    // TODO: Implement actual save functionality
  };

  const handleExport = () => {
    window.print();
    // Alternative: console.log('Exporting');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the resume to initial state? This will clear all your changes.')) {
      dispatch({
        type: 'SET_RESUME',
        payload: INITIAL_RESUME_STATE,
      });
    }
  };

  const handleAIAssistant = () => {
    console.log('AI Assistant activated');
    // TODO: Implement AI assistant functionality
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save Button - Secondary */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
      >
        <Save className="w-4 h-4" />
        <span>Save</span>
      </button>

      {/* AI Assistant Button - Secondary */}
      <button
        onClick={handleAIAssistant}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
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
  );
}
