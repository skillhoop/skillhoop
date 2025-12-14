import { useState, useEffect } from 'react';
import {
  X,
  History,
  RotateCcw,
  Trash2,
  Tag,
  Calendar,
  FileText,
  GitCompare,
  Loader2,
} from 'lucide-react';
import { ResumeVersion, getResumeVersions, deleteVersion, labelVersion, compareVersions, formatVersionDate, saveVersion, type VersionSaveResult } from '../../lib/resumeVersionHistory';
import { getModalZIndexClass, getModalBackdropZIndexClass } from '../../lib/zIndex';
import { getErrorMessage, ErrorContexts } from '../../lib/errorMessages';
import { ResumeData } from '../../types/resume';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  currentResume: ResumeData;
  onRestore: (version: ResumeVersion) => void;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  resumeId,
  currentResume,
  onRestore,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);
  const [comparingVersions, setComparingVersions] = useState<{ v1: ResumeVersion | null; v2: ResumeVersion | null }>({ v1: null, v2: null });
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelValue, setLabelValue] = useState('');
  const [showCreateSnapshot, setShowCreateSnapshot] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadVersions = () => {
    const allVersions = getResumeVersions(resumeId);
    setVersions(allVersions);
  };

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, resumeId, loadVersions]);

  const handleDelete = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(versionId);
    try {
      const success = deleteVersion(versionId);
      if (success) {
        loadVersions();
        if (selectedVersion?.id === versionId) {
          setSelectedVersion(null);
        }
      }
    } catch (error) {
      console.error('Error deleting version:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRestore = async (version: ResumeVersion) => {
    if (!confirm(`Are you sure you want to restore version ${version.versionNumber}? This will replace your current resume.`)) {
      return;
    }

    setIsRestoring(version.id);
    try {
      await onRestore(version);
      onClose();
    } catch (error) {
      console.error('Error restoring version:', error);
    } finally {
      setIsRestoring(null);
    }
  };

  const handleStartLabelEdit = (version: ResumeVersion) => {
    setEditingLabel(version.id);
    setLabelValue(version.label || '');
  };

  const handleSaveLabel = (versionId: string) => {
    labelVersion(versionId, labelValue.trim());
    setEditingLabel(null);
    setLabelValue('');
    loadVersions();
  };

  const handleCompare = (version: ResumeVersion) => {
    if (!comparingVersions.v1) {
      setComparingVersions({ v1: version, v2: null });
    } else if (!comparingVersions.v2) {
      setComparingVersions({ v1: comparingVersions.v1, v2: version });
    } else {
      setComparingVersions({ v1: version, v2: null });
    }
  };

  const getComparison = () => {
    if (!comparingVersions.v1 || !comparingVersions.v2) return null;
    return compareVersions(comparingVersions.v1, comparingVersions.v2);
  };

  const comparison = getComparison();

  const handleCreateSnapshot = () => {
    if (!snapshotLabel.trim()) {
      alert('Please enter a label for this snapshot');
      return;
    }

    const result: VersionSaveResult = saveVersion(resumeId, currentResume, {
      createdBy: 'manual',
      label: snapshotLabel.trim(),
      changeSummary: `Snapshot: ${snapshotLabel.trim()}`,
    });
    
    if (result.success) {
      loadVersions();
      setShowCreateSnapshot(false);
      setSnapshotLabel('');
    } else {
      // Show user-friendly error message
      const errorMessage = getErrorMessage(result.error || 'Unknown error', ErrorContexts.SAVE_VERSION);
      alert(`Failed to Create Snapshot\n\n${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  const backdropZIndex = getModalBackdropZIndexClass(0);
  const modalZIndex = getModalZIndexClass(0);

  return (
    <div className={`fixed inset-0 ${backdropZIndex} flex items-center justify-center bg-black/50 backdrop-blur-sm`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col ${modalZIndex}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Version History</h2>
              <p className="text-sm text-slate-600">
                {versions.length} {versions.length === 1 ? 'version' : 'versions'} saved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateSnapshot(true)}
              className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Create Snapshot
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Snapshot Input */}
        {showCreateSnapshot && (
          <div className="p-4 bg-indigo-50 border-b border-indigo-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSnapshot();
                  if (e.key === 'Escape') {
                    setShowCreateSnapshot(false);
                    setSnapshotLabel('');
                  }
                }}
                placeholder="Enter snapshot label (e.g., 'Before major changes')"
                className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleCreateSnapshot}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowCreateSnapshot(false);
                  setSnapshotLabel('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Comparison Banner */}
        {comparison && comparingVersions.v1 && comparingVersions.v2 && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-start gap-3">
              <GitCompare className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Comparing Versions</h3>
                <p className="text-sm text-blue-700">{comparison.summary}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setComparingVersions({ v1: null, v2: null })}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Clear Comparison
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-2">No version history yet</p>
              <p className="text-sm text-slate-500">
                Versions are automatically saved when you save your resume
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => {
                const isCurrent = index === 0; // Newest version is considered current
                const isSelected = selectedVersion?.id === version.id;
                const isComparing = comparingVersions.v1?.id === version.id || comparingVersions.v2?.id === version.id;

                return (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isCurrent
                        ? 'border-green-300 bg-green-50'
                        : isSelected
                        ? 'border-indigo-300 bg-indigo-50'
                        : isComparing
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span className="font-semibold text-slate-900">
                              Version {version.versionNumber}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-green-600 text-white rounded">
                                Current
                              </span>
                            )}
                            {isComparing && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded">
                                Comparing
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Label */}
                        {editingLabel === version.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={labelValue}
                              onChange={(e) => setLabelValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveLabel(version.id);
                                if (e.key === 'Escape') {
                                  setEditingLabel(null);
                                  setLabelValue('');
                                }
                              }}
                              placeholder="Add a label..."
                              className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveLabel(version.id)}
                              className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingLabel(null);
                                setLabelValue('');
                              }}
                              className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          version.label && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded">
                                <Tag className="w-3 h-3" />
                                {version.label}
                              </span>
                            </div>
                          )
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatVersionDate(version.createdAt)}
                          </div>
                          {version.createdBy && (
                            <span className="capitalize">{version.createdBy}</span>
                          )}
                          {version.changeSummary && (
                            <span className="text-slate-500">{version.changeSummary}</span>
                          )}
                        </div>

                        {/* Preview Info */}
                        <div className="text-xs text-slate-500 space-y-1">
                          <div>
                            Template: <span className="font-medium">{version.data.settings.templateId || 'Classic'}</span>
                          </div>
                          <div>
                            Sections: <span className="font-medium">{version.data.sections.filter(s => s.isVisible).length}</span>
                          </div>
                          {version.data.atsScore > 0 && (
                            <div>
                              ATS Score: <span className="font-medium">{version.data.atsScore}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                         {!isCurrent && (
                           <>
                             <button
                               onClick={() => handleRestore(version)}
                               disabled={isRestoring === version.id || !!isRestoring}
                               className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                               title="Restore this version"
                             >
                               {isRestoring === version.id ? (
                                 <Loader2 className="w-4 h-4 animate-spin" />
                               ) : (
                                 <RotateCcw className="w-4 h-4" />
                               )}
                             </button>
                            <button
                              onClick={() => handleCompare(version)}
                              className={`p-2 rounded-lg transition-colors ${
                                isComparing
                                  ? 'text-blue-600 bg-blue-100'
                                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                              }`}
                              title="Compare with another version"
                            >
                              <GitCompare className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleStartLabelEdit(version)}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Add/edit label"
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                         {!isCurrent && (
                           <button
                             onClick={() => handleDelete(version.id)}
                             disabled={isDeleting === version.id || !!isDeleting}
                             className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                             title="Delete version"
                           >
                             {isDeleting === version.id ? (
                               <Loader2 className="w-4 h-4 animate-spin" />
                             ) : (
                               <Trash2 className="w-4 h-4" />
                             )}
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Versions are automatically saved when you save your resume
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

