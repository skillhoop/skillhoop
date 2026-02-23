import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { validateRequiredFields } from '../../lib/requiredFieldsValidation';

interface SaveResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  currentResume: ResumeData;
  isUpdating?: boolean;
  isLoading?: boolean;
}

export default function SaveResumeModal({
  isOpen,
  onClose,
  onSave,
  currentResume,
  isUpdating = false,
}: SaveResumeModalProps) {
  const [title, setTitle] = useState(currentResume.title || 'Untitled Resume');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(currentResume.title || 'Untitled Resume');
      setError('');
    }
  }, [isOpen, currentResume.title]);

  const handleSave = () => {
    // Validate title
    if (!title.trim()) {
      setError('Please enter a resume title');
      return;
    }

    if (title.length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }

    // Validate required fields
    const requiredValidation = validateRequiredFields({
      ...currentResume,
      title: title.trim(),
    });

    if (!requiredValidation.isValid) {
      // Show error with missing fields
      const missingFields = requiredValidation.errors
        .filter(e => e.field !== 'title') // Title error is already shown
        .map(e => e.label)
        .join(', ');
      
      if (missingFields) {
        setError(`Please fill in: ${missingFields}`);
      } else {
        setError('Please fill in all required fields');
      }
      return;
    }

    onSave(title.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Save className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isUpdating ? 'Update Resume Name' : 'Save to Library'}
              </h2>
              <p className="text-sm text-slate-600">
                {isUpdating 
                  ? 'Change the name of this resume in your library'
                  : 'Save this resume to your library with a custom name. Your changes are already auto-saved.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="resume-title" className="block text-sm font-medium text-slate-700 mb-2">
              Resume Title
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="resume-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Software Engineer Resume"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
              autoFocus
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {title.length}/100 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  {isUpdating ? 'About Updating' : 'About Saving'}
                </p>
                <p className="text-xs text-blue-800">
                  {isUpdating 
                    ? 'This will update the name of your resume in your library. All your changes are already saved automatically.'
                    : 'Your resume is automatically saved as you type. This saves it to your library with a custom name so you can easily find it later.'}
                </p>
              </div>
            </div>
          </div>

          {/* Resume Info Preview */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="text-slate-600">Template: </span>
              <span className="font-medium text-slate-900">
                {currentResume.settings.templateId || 'Classic'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-600">Sections: </span>
              <span className="font-medium text-slate-900">
                {currentResume.sections.filter(s => s.isVisible).length}
              </span>
            </div>
            {currentResume.atsScore > 0 && (
              <div className="text-sm">
                <span className="text-slate-600">ATS Score: </span>
                <span className="font-medium text-slate-900">
                  {currentResume.atsScore}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isUpdating ? 'Update Name' : 'Save to Library'}
          </button>
        </div>
      </div>
    </div>
  );
}

