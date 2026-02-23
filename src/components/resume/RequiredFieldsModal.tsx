/**
 * Required Fields Validation Modal
 * Shows missing required fields before save
 */

import { X, AlertCircle, ArrowRight } from 'lucide-react';
import { RequiredFieldError } from '../../lib/requiredFieldsValidation';
import { useResume } from '../../context/ResumeContext';
import { getModalZIndexClass, getModalBackdropZIndexClass } from '../../lib/zIndex';

interface RequiredFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: RequiredFieldError[];
  onNavigateToField?: (field: string) => void;
}

export default function RequiredFieldsModal({
  isOpen,
  onClose,
  errors,
  onNavigateToField,
}: RequiredFieldsModalProps) {
  const { dispatch } = useResume();

  if (!isOpen) return null;

  const handleNavigateToField = (field: string) => {
    // Map field to section ID for focusing
    const sectionMap: Record<string, string> = {
      fullName: 'personal',
      title: 'personal', // Title is in save modal, but we can focus personal section
      hasContent: 'experience', // Default to experience section for content
    };
    
    const sectionId = sectionMap[field] || 'personal';
    
    // Focus the section
    dispatch({ type: 'SET_FOCUSED_SECTION', payload: sectionId });
    
    // Scroll to section after a brief delay
    setTimeout(() => {
      const section = document.getElementById(`section-${sectionId}`);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    if (onNavigateToField) {
      onNavigateToField(field);
    }
    
    onClose();
  };

  const backdropZIndex = getModalBackdropZIndexClass(1); // Stacked on top of save modal
  const modalZIndex = getModalZIndexClass(1);

  return (
    <div className={`fixed inset-0 ${backdropZIndex} flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm`}>
      <div className={`bg-white rounded-t-3xl sm:rounded-xl shadow-2xl w-full max-w-md mx-0 sm:mx-4 max-h-[95vh] sm:max-h-auto overflow-y-auto ${modalZIndex}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Required Fields Missing</h2>
              <p className="text-sm text-slate-500">Please fill in the required fields before saving</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{error.label}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{error.section}</p>
                    </div>
                    <button
                      onClick={() => handleNavigateToField(error.field)}
                      className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700 font-medium"
                    >
                      Go to field
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{error.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Fill in all required fields to save your resume. You can click "Go to field" to quickly navigate to each missing field.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            I'll fix these later
          </button>
          <button
            onClick={() => {
              if (errors.length > 0) {
                handleNavigateToField(errors[0].field);
              }
            }}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            Go to first field
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

