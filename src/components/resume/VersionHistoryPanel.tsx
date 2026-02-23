import { useState, useEffect } from 'react';
import { X, Clock, RotateCcw, Trash2, Plus, Loader2, FileText } from 'lucide-react';
import Pagination from '../ui/Pagination';
import {
  createVersion,
  getVersions,
  deleteVersion,
  restoreVersion,
  formatVersionDate,
  type ResumeVersion,
} from '../../lib/resumeVersioning';
import { ResumeData } from '../../types/resume';
import { getModalZIndexClass, getModalBackdropZIndexClass } from '../../lib/zIndex';

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  currentResume: ResumeData;
  onRestore: (data: ResumeData) => void;
  position?: 'sidebar' | 'modal';
}

export default function VersionHistoryPanel({
  isOpen,
  onClose,
  resumeId,
  currentResume,
  onRestore,
  position = 'modal',
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [showCreateSnapshot, setShowCreateSnapshot] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (isOpen && resumeId) {
      loadVersions();
      setCurrentPage(1); // Reset to first page when opening
    }
  }, [isOpen, resumeId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const allVersions = await getVersions(resumeId);
      setVersions(allVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
      alert('Failed to load version history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!snapshotName.trim()) {
      alert('Please enter a name for this snapshot');
      return;
    }

    setIsCreatingSnapshot(true);
    try {
      await createVersion(resumeId, currentResume, snapshotName.trim());
      setSnapshotName('');
      setShowCreateSnapshot(false);
      await loadVersions();
    } catch (error: unknown) {
      console.error('Error creating snapshot:', error);
      alert((error instanceof Error ? error.message : 'Failed to create snapshot. Please try again.'));
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleDelete = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(versionId);
    try {
      const success = await deleteVersion(versionId);
      if (success) {
        await loadVersions();
      } else {
        alert('Failed to delete version. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error deleting version:', error);
      alert((error instanceof Error ? error.message : 'Failed to delete version. Please try again.'));
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will replace your current resume.')) {
      return;
    }

    setIsRestoring(versionId);
    try {
      const restoredData = await restoreVersion(versionId);
      if (restoredData) {
        onRestore(restoredData);
        onClose();
      } else {
        alert('Failed to restore version. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error restoring version:', error);
      alert((error instanceof Error ? error.message : 'Failed to restore version. Please try again.'));
    } finally {
      setIsRestoring(null);
    }
  };

  if (!isOpen) return null;

  const isSidebar = position === 'sidebar';

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
            <p className="text-xs text-gray-600">
              {versions.length} {versions.length === 1 ? 'version' : 'versions'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Create Snapshot Button */}
      <div className="p-4 border-b border-gray-200">
        {showCreateSnapshot ? (
          <div className="space-y-2">
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSnapshot();
                if (e.key === 'Escape') {
                  setShowCreateSnapshot(false);
                  setSnapshotName('');
                }
              }}
              placeholder="Enter snapshot name (e.g., 'Before Rewrite')"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateSnapshot}
                disabled={!snapshotName.trim() || isCreatingSnapshot}
                className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingSnapshot ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Save'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCreateSnapshot(false);
                  setSnapshotName('');
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateSnapshot(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Snapshot
          </button>
        )}
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600 mb-2" />
            <p className="text-sm text-gray-600">Loading versions...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-1">No versions yet</p>
            <p className="text-xs text-gray-500">
              Create a snapshot to save the current state
            </p>
          </div>
        ) : (
          <>
            {/* Pagination calculations */}
            {(() => {
              const totalPages = Math.ceil(versions.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedVersions = versions.slice(startIndex, endIndex);

              return (
                <>
                  <div className="space-y-3">
                    {paginatedVersions.map((version, index) => {
                      // Adjust index for pagination (use original index from full array)
                      const originalIndex = startIndex + index;
                      const isLatest = originalIndex === 0;
                      const isDeletingThis = isDeleting === version.id;
                      const isRestoringThis = isRestoring === version.id;

              return (
                <div
                  key={version.id}
                  className={`border rounded-lg p-3 transition-all ${
                    isLatest
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {version.name}
                        </span>
                        {isLatest && (
                          <span className="px-1.5 py-0.5 text-xs font-semibold bg-green-600 text-white rounded flex-shrink-0">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatVersionDate(version.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {!isLatest && (
                      <>
                        <button
                          onClick={() => handleRestore(version.id)}
                          disabled={isRestoringThis || isDeletingThis}
                          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isRestoringThis ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete(version.id)}
                          disabled={isDeletingThis || isRestoringThis}
                          className="px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Delete version"
                        >
                          {isDeletingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                    </div>
                  );
                })}
                  </div>

                  {/* Pagination */}
                  {versions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={versions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        showItemsPerPage={true}
                        itemsPerPageOptions={[5, 10, 20, 50]}
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );

  const backdropZIndex = getModalBackdropZIndexClass(0);
  const modalZIndex = getModalZIndexClass(0);

  if (isSidebar) {
    return (
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl ${modalZIndex} border-l border-gray-200`}>
        {content}
      </div>
    );
  }

  // Modal layout
  return (
    <div className={`fixed inset-0 ${backdropZIndex} flex items-center justify-center bg-black/50 backdrop-blur-sm`}>
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col ${modalZIndex}`}>
        {content}
      </div>
    </div>
  );
}

