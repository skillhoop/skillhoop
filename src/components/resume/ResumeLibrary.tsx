import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Trash2, 
  Copy, 
  Edit2, 
  Search, 
  X, 
  Calendar,
  TrendingUp,
  LayoutTemplate,
  Loader2
} from 'lucide-react';
import { SavedResume, getAllSavedResumes, deleteResume, duplicateResume, renameResume } from '../../lib/resumeStorage';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';
import { getModalZIndexClass, getModalBackdropZIndexClass } from '../../lib/zIndex';

interface ResumeLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (resume: SavedResume) => void;
  currentResumeId?: string | null;
}

export default function ResumeLibrary({
  isOpen,
  onClose,
  onLoad,
  currentResumeId,
}: ResumeLibraryProps) {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (isOpen) {
      loadResumes();
    }
  }, [isOpen]);

  const loadResumes = async () => {
    setIsLoading(true);
    try {
      const savedResumes = await getAllSavedResumes();
      setResumes(savedResumes);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    const success = await deleteResume(id);
    setDeletingId(null);

    if (success) {
      loadResumes();
    }
  };

  const handleDuplicate = async (id: string) => {
    const newId = await duplicateResume(id);
    if (newId) {
      loadResumes();
    }
  };

  const handleStartEdit = (resume: SavedResume) => {
    setEditingId(resume.id);
    setEditTitle(resume.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    const success = await renameResume(id, editTitle.trim());
    if (success) {
      setEditingId(null);
      setEditTitle('');
      loadResumes();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const filteredResumes = useMemo(() => {
    return resumes.filter(resume =>
      resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [resumes, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredResumes.length / itemsPerPage);
  const paginatedResumes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredResumes.slice(startIndex, endIndex);
  }, [filteredResumes, currentPage, itemsPerPage]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  const backdropZIndex = getModalBackdropZIndexClass(0);
  const modalZIndex = getModalZIndexClass(0);

  return (
    <div className={`fixed inset-0 ${backdropZIndex} flex items-center justify-center bg-black/50 backdrop-blur-sm`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col ${modalZIndex}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">My Resumes</h2>
              <p className="text-sm text-slate-600">
                {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} saved
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

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Resume List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading resumes..." />
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-2">
                {searchQuery ? 'No resumes found' : 'No resumes saved yet'}
              </p>
              <p className="text-sm text-slate-500">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Create and save your first resume to get started'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedResumes.map((resume) => {
                const isCurrent = resume.id === currentResumeId;
                const isEditing = editingId === resume.id;

                return (
                  <div
                    key={resume.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(resume.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(resume.id)}
                            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Resume Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                              {resume.title}
                              {isCurrent && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-600 text-white rounded">
                                  Current
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(resume.updatedAt)}
                              </div>
                              {resume.templateId && (
                                <div className="flex items-center gap-1">
                                  <LayoutTemplate className="w-3 h-3" />
                                  {resume.templateId}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Resume Stats */}
                        <div className="flex items-center gap-4 mb-3 text-sm">
                          {resume.atsScore !== undefined && resume.atsScore > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                              <span className="text-slate-700">
                                ATS: <span className="font-medium">{resume.atsScore}%</span>
                              </span>
                            </div>
                          )}
                          <div className="text-slate-600">
                            {resume.data.sections.filter(s => s.isVisible).length} sections
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                          <button
                            onClick={() => onLoad(resume)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            {isCurrent ? 'Continue Editing' : 'Load'}
                          </button>
                          <button
                            onClick={() => handleStartEdit(resume)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(resume.id)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(resume.id)}
                            disabled={deletingId === resume.id || !!deletingId}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingId === resume.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              </div>

              {/* Pagination */}
              {filteredResumes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredResumes.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                    showItemsPerPage={true}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

