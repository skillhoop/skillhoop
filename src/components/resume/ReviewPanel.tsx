import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { auditResume, type AuditWarning } from '../../lib/resumeAuditor';

interface ReviewPanelProps {
  resumeData: unknown;
  onNavigateToSection?: (sectionId: string, field?: string) => void;
}

export default function ReviewPanel({ resumeData, onNavigateToSection }: ReviewPanelProps) {
  const warnings = useMemo(() => auditResume(resumeData as any), [resumeData]);

  const handleIssueClick = (warning: AuditWarning) => {
    if (onNavigateToSection && warning.field) {
      // Try to navigate to the section
      onNavigateToSection(warning.section.toLowerCase(), warning.field);
    }
  };

  // Group warnings by severity
  const errors = warnings.filter((w) => w.severity === 'error');
  const warningIssues = warnings.filter((w) => w.severity === 'warning');

  if (warnings.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Export!</h3>
          <p className="text-gray-600 text-sm max-w-md">
            Your resume looks great! No issues detected. You're all set to export your resume.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quality Review</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Total Issues:</span>
            <span className="font-semibold text-gray-900">{warnings.length}</span>
          </div>
          {errors.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600 font-medium">{errors.length} Error{errors.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {warningIssues.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-600 font-medium">{warningIssues.length} Warning{warningIssues.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Errors ({errors.length})
          </h4>
          <div className="space-y-2">
            {errors.map((warning) => (
              <div
                key={warning.id}
                onClick={() => handleIssueClick(warning)}
                className={`bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors ${
                  onNavigateToSection ? 'hover:shadow-sm' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                        {warning.section}
                      </span>
                      {onNavigateToSection && (
                        <ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-800">{warning.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings Section */}
      {warningIssues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Warnings ({warningIssues.length})
          </h4>
          <div className="space-y-2">
            {warningIssues.map((warning) => (
              <div
                key={warning.id}
                onClick={() => handleIssueClick(warning)}
                className={`bg-amber-50 border border-amber-200 rounded-lg p-4 cursor-pointer hover:bg-amber-100 transition-colors ${
                  onNavigateToSection ? 'hover:shadow-sm' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                        {warning.section}
                      </span>
                      {onNavigateToSection && (
                        <ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-800">{warning.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Click on any issue to navigate to that section in the editor (if available).
          Fix errors first, then address warnings to improve your resume quality.
        </p>
      </div>
    </div>
  );
}


