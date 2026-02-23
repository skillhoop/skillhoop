import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Linkedin, Loader2, CheckCircle2, AlertCircle, File } from 'lucide-react';
import { parseResumeWithAI } from '../../lib/resumeParser';
import { extractTextFromFile } from '../../lib/resumeParser';
import { getLinkedInProfile, isLinkedInAuthenticated, initiateLinkedInLogin } from '../../lib/linkedin';
import { convertParsedToEditorFormat } from '../../lib/resumeImportConverter';

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (resumeData: any) => void; // ResumeEditorPage format
}

type ImportSource = 'file' | 'linkedin';

export default function ImportResumeModal({ isOpen, onClose, onImport }: ImportResumeModalProps) {
  const [activeTab, setActiveTab] = useState<ImportSource>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkedInUrl, setLinkedInUrl] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Extract text from file
      let resumeText: string;
      
      // Extract text from file (handles PDF, DOCX, TXT)
      resumeText = await extractTextFromFile(file);

      if (!resumeText || resumeText.trim().length < 50) {
        throw new Error('Could not extract sufficient text from file. Please ensure the file is readable.');
      }

      // Parse with AI
      const parsedData = await parseResumeWithAI(resumeText);

      // Convert to ResumeEditorPage format
      const editorData = convertParsedToEditorFormat(parsedData);

      setSuccess(true);
      setTimeout(() => {
        onImport(editorData);
        handleClose();
      }, 1000);
    } catch (err: any) {
      console.error('Error importing resume:', err);
      setError(err.message || 'Failed to import resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLinkedInImport = async () => {
    if (!linkedInUrl.trim()) {
      setError('Please enter a LinkedIn profile URL');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if user is authenticated with LinkedIn
      if (!isLinkedInAuthenticated()) {
        // Initiate OAuth flow
        initiateLinkedInLogin();
        return;
      }

      // Fetch LinkedIn profile
      const profile = await getLinkedInProfile();
      
      // Convert LinkedIn profile to resume format
      // Note: LinkedIn API has limited data, so we'll create a basic structure
      const editorData = convertLinkedInToEditorFormat(profile, linkedInUrl);

      setSuccess(true);
      setTimeout(() => {
        onImport(editorData);
        handleClose();
      }, 1000);
    } catch (err: any) {
      console.error('Error importing from LinkedIn:', err);
      setError(err.message || 'Failed to import from LinkedIn. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setLinkedInUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Import Resume</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('file');
              setError(null);
            }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'file'
                ? 'text-slate-600 border-b-2 border-slate-600 bg-slate-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>From File</span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('linkedin');
              setError(null);
            }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'linkedin'
                ? 'text-slate-600 border-b-2 border-slate-600 bg-slate-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Linkedin className="w-5 h-5" />
              <span>From LinkedIn</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your resume file (PDF, DOCX, or TXT). We'll extract and parse the content automatically.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-file-input"
                />
                <label
                  htmlFor="resume-file-input"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-sm font-medium text-gray-700 mb-2">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    PDF, DOCX, DOC, or TXT (Max 10MB)
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'linkedin' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Import your profile data from LinkedIn. You'll need to authenticate with LinkedIn first.
                </p>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile URL (optional)
                    </label>
                    <input
                      type="text"
                      id="linkedin-url"
                      value={linkedInUrl}
                      onChange={(e) => setLinkedInUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <button
                    onClick={handleLinkedInImport}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Linkedin className="w-5 h-5" />
                        <span>Import from LinkedIn</span>
                      </>
                    )}
                  </button>
                  {!isLinkedInAuthenticated() && (
                    <p className="text-xs text-gray-500 text-center">
                      You'll be redirected to LinkedIn to authenticate
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Import Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Import Successful!</p>
                <p className="text-sm text-green-700 mt-1">Your resume data has been imported.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Convert LinkedIn profile to ResumeEditorPage format
 */
function convertLinkedInToEditorFormat(profile: any, url: string): any {
  // LinkedIn API returns limited data, so we create a basic structure
  return {
    personalInfo: {
      fullName: profile.localizedName || profile.firstName?.localized?.[Object.keys(profile.firstName.localized)[0]] + ' ' + profile.lastName?.localized?.[Object.keys(profile.lastName.localized)[0]] || '',
      jobTitle: profile.headline || profile.localizedHeadline || '',
      email: '',
      phone: '',
      location: profile.location?.name || '',
    },
    summary: profile.summary || profile.localizedSummary || '',
    experience: [],
    education: [],
    skills: [],
  };
}

