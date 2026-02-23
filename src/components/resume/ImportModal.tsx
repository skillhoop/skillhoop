import { useState } from 'react';
import { X, Loader2, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { parseResumeFromText } from '../../lib/resumeParser';
import type { ResumeData } from '../../types/resume';
import { getModalZIndexClass, getModalBackdropZIndexClass } from '../../lib/zIndex';
import { validateImportedResume, formatValidationErrors } from '../../lib/importValidation';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Partial<ResumeData>) => void;
}

type TabType = 'paste' | 'upload';

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('paste');
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[]; warnings: string[] } | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!pastedText.trim()) {
      setError('Please paste your resume text');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsedData = await parseResumeFromText(pastedText);
      
      // Validate imported data
      const validation = validateImportedResume(parsedData);
      setValidationResult({
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
      });
      
      if (!validation.isValid) {
        setError(formatValidationErrors(validation));
        setIsLoading(false);
        return;
      }
      
      // Use validated data if available, otherwise use original
      const dataToImport = validation.validatedData || parsedData;
      onImport(dataToImport);
      
      // Reset form
      setPastedText('');
      setValidationResult(null);
      onClose();
    } catch (err: unknown) {
      console.error('Error parsing resume:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse resume. Please try again.';
      setError(errorMessage);
      setValidationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB. Please choose a smaller file.');
      return;
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    const isValidFileType = 
      fileType === 'application/pdf' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileType === 'text/plain' ||
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.txt');

    if (!isValidFileType) {
      setError('Unsupported file type. Please upload a PDF, DOCX, DOC, or TXT file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Import the extractTextFromFile function
      const { extractTextFromFile } = await import('../../lib/resumeParser');
      
      // Extract text from file (supports PDF, DOCX, TXT)
      const text = await extractTextFromFile(file);
      
      if (text && text.trim().length > 50) {
        // Auto-parse after reading
        const parsedData = await parseResumeFromText(text);
        
        // Validate imported data
        const validation = validateImportedResume(parsedData);
        setValidationResult({
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
        });
        
        if (!validation.isValid) {
          setError(formatValidationErrors(validation));
          setIsLoading(false);
          return;
        }
        
        // Use validated data if available, otherwise use original
        const dataToImport = validation.validatedData || parsedData;
        onImport(dataToImport);
        setPastedText('');
        setValidationResult(null);
        onClose();
      } else {
        setError('Could not extract sufficient text from the file. The file may be image-based, corrupted, or empty. Please try a different file.');
      }
    } catch (err: unknown) {
      console.error('Error reading file:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to read file. Please ensure the file is a valid PDF, DOCX, or TXT file.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const backdropZIndex = getModalBackdropZIndexClass(0);
  const modalZIndex = getModalZIndexClass(0);

  return (
    <div className={`fixed inset-0 ${backdropZIndex} flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm`}>
      <div className={`bg-white rounded-t-3xl sm:rounded-lg shadow-xl w-full max-w-2xl mx-0 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col ${modalZIndex}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Import Resume</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'paste'
                ? 'text-slate-600 border-b-2 border-slate-600 bg-slate-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Paste Text</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-slate-600 border-b-2 border-slate-600 bg-slate-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'paste' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your resume text or LinkedIn profile
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your resume content here... You can copy from Word, PDF, or LinkedIn profile."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none font-mono text-sm"
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  The AI will extract your personal information, experience, education, skills, and more.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload a resume file
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-slate-600 hover:text-slate-700 font-medium">
                      Choose a file
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    Supports PDF, DOCX, DOC, and TXT files (Max 10MB)
                  </p>
                  {isLoading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Extracting text from file...</span>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-gray-400 space-y-1">
                    <p>• PDF files: Advanced text extraction from all pages</p>
                    <p>• DOCX files: Preserves formatting and structure</p>
                    <p>• DOC files: Basic text extraction (DOCX recommended)</p>
                    <p>• TXT files: Direct text parsing</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div className={`mt-4 p-4 rounded-md border ${
              validationResult.isValid
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2">
                {validationResult.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {validationResult.isValid ? (
                    <p className="text-sm font-medium text-green-800 mb-2">
                      Import data validated successfully!
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Validation failed. Please fix the following issues:
                    </p>
                  )}
                  {validationResult.errors.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 mb-2">
                      {validationResult.errors.map((err, idx) => (
                        <li key={idx} className="text-sm text-red-700">{err}</li>
                      ))}
                    </ul>
                  )}
                  {validationResult.warnings.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-amber-800 mb-1">Warnings:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-amber-700">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !validationResult && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          {activeTab === 'paste' && (
            <button
              onClick={handleParse}
              disabled={isLoading || !pastedText.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing resume...</span>
                </>
              ) : (
                <span>Parse & Import</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

