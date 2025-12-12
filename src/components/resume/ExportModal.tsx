import { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  File, 
  Code, 
  FileCode,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { exportToPDF, exportToHTML, exportToTXT, exportToDOCX } from '../../lib/resumeExport';
import { resumeToHTML } from '../../lib/resumeToHTML';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
}

export default function ExportModal({ isOpen, onClose, resume }: ExportModalProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'html' | 'docx' | 'txt') => {
    setExporting(format);
    setExported(null);

    try {
      const htmlContent = resumeToHTML(resume);
      const title = resume.title || 'Resume';
      const options = {
        title,
        content: htmlContent,
        fontFamily: resume.settings.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: resume.settings.fontSize || 11,
        lineHeight: resume.settings.lineHeight || 1.5,
        accentColor: resume.settings.accentColor || '#3B82F6',
      };

      switch (format) {
        case 'pdf':
          await exportToPDF(options);
          break;
        case 'html':
          exportToHTML(options);
          break;
        case 'docx':
          await exportToDOCX(options);
          break;
        case 'txt':
          exportToTXT(options);
          break;
      }

      setExported(format);
      setTimeout(() => {
        setExported(null);
        onClose();
      }, 1500);
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(`Failed to export to ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(null);
    }
  };

  if (!isOpen) return null;

  const exportOptions = [
    {
      id: 'pdf' as const,
      name: 'PDF',
      description: 'Best for printing and sharing. Opens print dialog.',
      icon: FileText,
      color: 'bg-red-500',
      popular: true,
    },
    {
      id: 'docx' as const,
      name: 'Microsoft Word',
      description: 'Editable DOCX format. Opens in Microsoft Word.',
      icon: File,
      color: 'bg-blue-500',
      popular: true,
    },
    {
      id: 'html' as const,
      name: 'HTML',
      description: 'Web-friendly format. Can be opened in any browser.',
      icon: Code,
      color: 'bg-orange-500',
      popular: false,
    },
    {
      id: 'txt' as const,
      name: 'Plain Text',
      description: 'Simple text format. ATS-friendly, no formatting.',
      icon: FileCode,
      color: 'bg-gray-500',
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Export Resume</h2>
              <p className="text-sm text-slate-600">Choose your preferred format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isExporting = exporting === option.id;
              const isExported = exported === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleExport(option.id)}
                  disabled={!!exporting}
                  className={`relative p-6 border-2 rounded-xl text-left transition-all ${
                    isExporting
                      ? 'border-indigo-300 bg-indigo-50'
                      : isExported
                      ? 'border-green-300 bg-green-50'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  } ${exporting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {option.popular && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded">
                      Popular
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {isExporting ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : isExported ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{option.name}</h3>
                      <p className="text-sm text-slate-600">{option.description}</p>
                      {isExported && (
                        <p className="text-sm text-green-600 font-medium mt-2">✓ Exported successfully!</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Resume Info */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 space-y-1">
              <div>
                <span className="font-medium">Resume:</span> {resume.title || 'Untitled Resume'}
              </div>
              <div>
                <span className="font-medium">Template:</span> {resume.settings.templateId || 'Classic'}
              </div>
              <div>
                <span className="font-medium">Sections:</span> {resume.sections.filter(s => s.isVisible).length}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={!!exporting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

