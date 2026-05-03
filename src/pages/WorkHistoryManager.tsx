import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star,
  Target,
  Mail,
  FileText,
  AlertCircle,
  X,
  ChevronDown,
  Plus,
  Search,
  Clock,
  Edit2,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Upload,
  Check,
  Grid,
  List,
  Zap,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { WorkflowTracking } from '../lib/workflowTracking';
import { supabase } from '../lib/supabase';
import {
  WorkHistoryStorage,
  type WorkHistoryDocument,
} from '../lib/workHistoryDocuments';
import FirstTimeEntryCard from '../components/workflows/FirstTimeEntryCard';
import JobsHistoryList from '../components/workhistory/JobsHistoryList';

interface DocumentStats {
  resumes: number;
  tailored: number;
  coverLetters: number;
  drafts: number;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

function applyVaultDocumentToWorkflowContext(doc: WorkHistoryDocument) {
  const existing = WorkflowTracking.getWorkflowContext() ?? {};
  const applicationDate = doc.updatedAt
    ? doc.updatedAt.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  WorkflowTracking.setWorkflowContext({
    ...existing,
    jobTitle: doc.jobTitle || doc.title || (existing as { jobTitle?: string }).jobTitle,
    applicationDate,
  });
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'resume':
      return <Star className="w-5 h-5" />;
    case 'tailored-resume':
    case 'application-tailor':
      return <Target className="w-5 h-5" />;
    case 'cover-letter':
      return <Mail className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'resume':
      return 'Master Resume';
    case 'tailored-resume':
      return 'Tailored Resume';
    case 'application-tailor':
      return 'Application Tailor';
    case 'cover-letter':
      return 'Cover Letter';
    default:
      return 'Document';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'resume':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'tailored-resume':
    case 'application-tailor':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'cover-letter':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-slate-400';
  if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
  return 'text-red-500 bg-red-50 border-red-100';
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Invalid Date';
  }
};

const sanitizeFilename = (filename: string) => filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();

function CreateDocumentModal({
  onClose,
  onSave,
  error,
}: {
  onClose: () => void;
  onSave: (doc: Partial<WorkHistoryDocument>) => void;
  error: string | null;
}) {
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: 'resume' as WorkHistoryDocument['type'],
    content: '',
    jobTitle: '',
    company: '',
    status: 'draft' as 'draft' | 'completed',
    atsScore: null as number | null,
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-0 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">New Document</h2>
            <p className="text-sm text-slate-500">Add a new file to your career vault</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-wide">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                maxLength={200}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all placeholder:text-slate-300 font-medium"
                placeholder="e.g. Senior Product Designer - Airbnb"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-wide">Type</label>
                <div className="relative">
                  <select
                    value={newDoc.type}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, type: e.target.value as WorkHistoryDocument['type'] })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent appearance-none transition-all font-medium"
                  >
                    <option value="resume">Master Resume</option>
                    <option value="tailored-resume">Tailored Resume</option>
                    <option value="application-tailor">Application Tailor</option>
                    <option value="cover-letter">Cover Letter</option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-wide">Status</label>
                <div className="relative">
                  <select
                    value={newDoc.status}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, status: e.target.value as 'draft' | 'completed' })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent appearance-none transition-all font-medium"
                  >
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Context (Optional)</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    value={newDoc.jobTitle}
                    onChange={(e) => setNewDoc({ ...newDoc, jobTitle: e.target.value })}
                    maxLength={100}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-neutral-900 transition-all"
                    placeholder="Target Role"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newDoc.company}
                    onChange={(e) => setNewDoc({ ...newDoc, company: e.target.value })}
                    maxLength={100}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-neutral-900 transition-all"
                    placeholder="Target Company"
                  />
                </div>
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newDoc.atsScore ?? ''}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, atsScore: e.target.value ? parseInt(e.target.value, 10) : null })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-neutral-900 transition-all"
                  placeholder="ATS Score (0-100)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-wide">
                Initial Content
              </label>
              <textarea
                value={newDoc.content}
                onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                maxLength={50000}
                rows={6}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all font-mono text-xs leading-relaxed"
                placeholder="Paste text here..."
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(newDoc)}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 flex items-center gap-2"
          >
            <Plus size={16} /> Create Document
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkHistoryManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [librarySection, setLibrarySection] = useState<'documents' | 'jobs-history'>('documents');
  const [documents, setDocuments] = useState<WorkHistoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'resumes' | 'tailored' | 'cover-letters'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const [viewingDoc, setViewingDoc] = useState<WorkHistoryDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<WorkHistoryDocument | null>(null);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const DOCUMENTS_PER_PAGE = viewMode === 'list' ? 15 : 12;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (searchParams.get('tab') === 'jobs-history') {
      setLibrarySection('jobs-history');
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      setUserId(data.user?.id ?? null);
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshDocuments = useCallback(async () => {
    if (!userId) return;
    const loaded = await WorkHistoryStorage.getAllDocuments(userId);
    setDocuments(loaded);
    setSelectedDocs([]);
  }, [userId]);

  useEffect(() => {
    if (!authReady) return;

    if (!userId) {
      setIsLoading(false);
      setDocuments([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const context = WorkflowTracking.getWorkflowContext();

        if (context?.workflowId === 'job-application-pipeline') {
          if (context.tailoredResume) {
            await WorkHistoryStorage.saveDocument(userId, {
              title: `Tailored Resume - ${(context as { currentJob?: { title?: string } }).currentJob?.title || 'Application'}`,
              type: 'tailored-resume',
              content: context.tailoredResume as string,
              jobTitle: (context as { currentJob?: { title?: string } }).currentJob?.title || '',
              company: (context as { currentJob?: { company?: string } }).currentJob?.company || '',
              status: 'completed',
            });
          }

          if (context.coverLetter) {
            await WorkHistoryStorage.saveDocument(userId, {
              title: `Cover Letter - ${(context as { currentJob?: { title?: string } }).currentJob?.title || 'Application'}`,
              type: 'cover-letter',
              content: context.coverLetter as string,
              jobTitle: (context as { currentJob?: { title?: string } }).currentJob?.title || '',
              company: (context as { currentJob?: { company?: string } }).currentJob?.company || '',
              status: 'completed',
            });
          }

          const workflow = WorkflowTracking.getWorkflow('job-application-pipeline');
          if (workflow) {
            const archiveStep = workflow.steps.find((s) => s.id === 'archive-documents');
            if (archiveStep && archiveStep.status === 'not-started') {
              WorkflowTracking.updateStepStatus('job-application-pipeline', 'archive-documents', 'in-progress');
            }
          }
        }

        if (context?.workflowId === 'document-consistency-version-control') {
          const workflow = WorkflowTracking.getWorkflow('document-consistency-version-control');
          if (workflow) {
            const archiveStep = workflow.steps.find((s) => s.id === 'archive-versions');
            if (archiveStep && archiveStep.status === 'not-started') {
              WorkflowTracking.updateStepStatus(
                'document-consistency-version-control',
                'archive-versions',
                'in-progress',
              );
            }
          }

          if (context.resumeData) {
            await WorkHistoryStorage.saveDocument(userId, {
              title: `Resume - Consistent Version`,
              type: 'resume',
              content: JSON.stringify(context.resumeData),
              jobTitle: '',
              company: '',
              status: 'completed',
            });
          }

          if (context.coverLetter) {
            await WorkHistoryStorage.saveDocument(userId, {
              title: `Cover Letter - Synced Version`,
              type: 'cover-letter',
              content: context.coverLetter as string,
              jobTitle: '',
              company: '',
              status: 'completed',
            });
          }
        }

        if (cancelled) return;

        const loaded = await WorkHistoryStorage.getAllDocuments(userId);
        if (cancelled) return;

        setDocuments(loaded);

        const workflow1 = WorkflowTracking.getWorkflow('job-application-pipeline');
        if (
          workflow1 &&
          workflow1.isActive &&
          (context as { workflowId?: string } | null)?.workflowId === 'job-application-pipeline' &&
          loaded.length > 0
        ) {
          const hasWorkflowDocs = loaded.some(
            (doc) => doc.type === 'tailored-resume' || doc.type === 'cover-letter',
          );
          if (hasWorkflowDocs) {
            WorkflowTracking.updateStepStatus('job-application-pipeline', 'archive-documents', 'completed', {
              documentsArchived: loaded.length,
            });
          }
        }

        const workflow6 = WorkflowTracking.getWorkflow('document-consistency-version-control');
        if (
          workflow6 &&
          workflow6.isActive &&
          (context as { workflowId?: string } | null)?.workflowId === 'document-consistency-version-control' &&
          loaded.length > 0
        ) {
          const hasConsistentDocs = loaded.some(
            (doc) => doc.type === 'resume' || doc.type === 'cover-letter',
          );
          if (hasConsistentDocs) {
            WorkflowTracking.updateStepStatus('document-consistency-version-control', 'archive-versions', 'completed', {
              documentsArchived: loaded.length,
              versionsTracked: loaded.filter((d) => d.type === 'resume' || d.type === 'cover-letter').length,
            });

            const wfAfter = WorkflowTracking.getWorkflow('document-consistency-version-control');
            if (wfAfter?.progress === 100) {
              WorkflowTracking.completeWorkflow('document-consistency-version-control');
            }
          }
        }
      } catch (err) {
        console.error('Error loading work history vault:', err);
        if (!cancelled) setError('Failed to load documents');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, userId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !e.ctrlKey &&
        !e.metaKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search files"]');
        if (searchInput) (searchInput as HTMLElement).focus();
      }

      if (e.key === 'Escape') {
        if (viewingDoc) setViewingDoc(null);
        else if (editingDoc) {
          setEditingDoc(null);
          setSaveError(null);
        } else if (creatingDoc) {
          setCreatingDoc(false);
          setSaveError(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingDoc, editingDoc, creatingDoc]);

  const stats: DocumentStats = useMemo(
    () => ({
      resumes: documents.filter((d) => d.type === 'resume').length,
      tailored: documents.filter((d) => d.type === 'tailored-resume' || d.type === 'application-tailor').length,
      coverLetters: documents.filter((d) => d.type === 'cover-letter').length,
      drafts: documents.filter((d) => d.status === 'draft').length,
    }),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'resumes' && doc.type === 'resume') ||
        (activeTab === 'tailored' && (doc.type === 'tailored-resume' || doc.type === 'application-tailor')) ||
        (activeTab === 'cover-letters' && doc.type === 'cover-letter');

      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch =
        !debouncedSearch ||
        doc.title.toLowerCase().includes(searchLower) ||
        doc.jobTitle?.toLowerCase().includes(searchLower) ||
        doc.company?.toLowerCase().includes(searchLower) ||
        doc.content?.toLowerCase().includes(searchLower);

      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;

      return matchesTab && matchesSearch && matchesStatus;
    });
  }, [documents, activeTab, debouncedSearch, filterStatus]);

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [filteredDocuments, sortBy]);

  const totalPages = Math.ceil(sortedDocuments.length / DOCUMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * DOCUMENTS_PER_PAGE;
  const paginatedDocuments = sortedDocuments.slice(startIndex, startIndex + DOCUMENTS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleView = (doc: WorkHistoryDocument) => {
    const fullDoc = documents.find((d) => d.id === doc.id) ?? doc;
    applyVaultDocumentToWorkflowContext(fullDoc);
    setViewingDoc(fullDoc);
  };

  const handleEdit = (doc: WorkHistoryDocument) => {
    const fullDoc = documents.find((d) => d.id === doc.id) ?? doc;
    applyVaultDocumentToWorkflowContext(fullDoc);
    setEditingDoc({ ...fullDoc });
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingDoc || !userId) return;

    if (!editingDoc.title.trim()) {
      setSaveError('Title is required');
      return;
    }

    try {
      const saved = await WorkHistoryStorage.saveDocument(userId, editingDoc);
      applyVaultDocumentToWorkflowContext(saved);
      await refreshDocuments();
      setEditingDoc(null);
      setSaveError(null);
      showToast('Document saved successfully!');
    } catch (err) {
      console.error('Error saving document:', err);
      setSaveError('Failed to save document');
    }
  };

  const handleDownload = (doc: WorkHistoryDocument) => {
    try {
      if (!doc.content) {
        showToast('No content to download', 'error');
        return;
      }
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(doc.title) || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      showToast('Failed to download document', 'error');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!userId) return;
    const doc = documents.find((d) => d.id === docId);
    const label = doc?.title ?? 'this document';
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;

    try {
      const ok = await WorkHistoryStorage.deleteDocument(userId, docId);
      if (!ok) throw new Error('delete failed');
      await refreshDocuments();
      showToast('Document deleted successfully!');
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  const handleBulkDelete = async () => {
    if (!userId || selectedDocs.length === 0) return;
    if (!window.confirm(`Delete ${selectedDocs.length} selected items?`)) return;

    try {
      const ok = await WorkHistoryStorage.bulkDeleteDocuments(userId, selectedDocs);
      if (!ok) throw new Error('bulk delete failed');
      await refreshDocuments();
      showToast(`${selectedDocs.length} documents deleted.`);
    } catch (err) {
      console.error(err);
      showToast('Bulk delete failed', 'error');
    }
  };

  const handleCreate = () => {
    setCreatingDoc(true);
    setSaveError(null);
  };

  const handleSaveCreate = async (newDoc: Partial<WorkHistoryDocument>) => {
    if (!userId) {
      setSaveError('You must be signed in to save documents.');
      return;
    }
    if (!newDoc.title?.trim()) {
      setSaveError('Title is required');
      return;
    }

    try {
      await WorkHistoryStorage.saveDocument(userId, newDoc);
      await refreshDocuments();
      setCreatingDoc(false);
      setSaveError(null);
      showToast('Document created successfully!');
    } catch (err) {
      console.error('Error creating document:', err);
      setSaveError('Failed to create document');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedDocs((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const selectAll = () => {
    if (selectedDocs.length === paginatedDocuments.length && paginatedDocuments.length > 0) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(paginatedDocuments.map((d) => d.id));
    }
  };

  if (authReady && !userId) {
    return (
      <div className="space-y-8">
        <FirstTimeEntryCard featurePath="/dashboard/work-history" featureName="Work History Manager" />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 text-sm">
          Sign in to sync your career vault to the cloud.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up flex flex-col h-full">
      <FirstTimeEntryCard featurePath="/dashboard/work-history" featureName="Work History Manager" />

      {toast && (
        <div
          className={`fixed bottom-8 right-8 z-[10002] ${toast.type === 'success' ? 'bg-neutral-900' : 'bg-red-600'} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-white/10`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-2 text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-neutral-900 text-white p-5 rounded-2xl shadow-lg shadow-neutral-900/20">
            <h3 className="font-bold text-lg mb-1">Career Vault</h3>
            <p className="text-white/60 text-xs mb-4">Manage your professional docs.</p>
            <button
              type="button"
              onClick={handleCreate}
              className="w-full py-2.5 bg-white text-neutral-900 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Document
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide px-3 mb-2">Library</div>
            {(
              [
                { id: 'all' as const, label: 'All Items', icon: FolderOpen, count: documents.length },
                { id: 'resumes' as const, label: 'Master Resumes', icon: Star, count: stats.resumes },
                { id: 'tailored' as const, label: 'Tailored Docs', icon: Target, count: stats.tailored },
                { id: 'cover-letters' as const, label: 'Cover Letters', icon: Mail, count: stats.coverLetters },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setLibrarySection('documents');
                  setActiveTab(item.id);
                  setCurrentPage(1);
                  const next = new URLSearchParams(searchParams);
                  next.delete('tab');
                  setSearchParams(next, { replace: true });
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  librarySection === 'documents' && activeTab === item.id
                    ? 'bg-slate-50 text-slate-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={16}
                    className={
                      librarySection === 'documents' && activeTab === item.id ? 'text-slate-600' : 'text-slate-400'
                    }
                  />
                  {item.label}
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    librarySection === 'documents' && activeTab === item.id
                      ? 'bg-white text-slate-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setLibrarySection('jobs-history');
                const next = new URLSearchParams(searchParams);
                next.set('tab', 'jobs-history');
                setSearchParams(next, { replace: true });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                librarySection === 'jobs-history'
                  ? 'bg-slate-50 text-slate-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase size={16} className={librarySection === 'jobs-history' ? 'text-slate-600' : 'text-slate-400'} />
                Jobs History
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  librarySection === 'jobs-history' ? 'bg-white text-slate-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                —
              </span>
            </button>
          </div>

          {librarySection === 'documents' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Status</div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as typeof filterStatus);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
              >
                <option value="all">Any Status</option>
                <option value="completed">Completed</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          )}
        </div>

        {librarySection === 'jobs-history' ? (
          <div className="flex-1 flex flex-col min-h-[500px]">
            <JobsHistoryList />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-[500px]">
            <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap items-center gap-2 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search files... (Press / to focus)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="h-6 w-px bg-slate-200 mx-1" />

              {selectedDocs.length > 0 && (
                <div className="flex items-center gap-2 animate-fade-in px-2">
                  <span className="text-xs font-bold text-slate-500">{selectedDocs.length} selected</span>
                  <button
                    type="button"
                    onClick={() => void handleBulkDelete()}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Selected"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                </div>
              )}

              <div className="flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-2 py-1.5 bg-transparent text-xs font-bold text-slate-500 focus:outline-none cursor-pointer hover:text-neutral-900 mr-2"
                >
                  <option value="date">Newest First</option>
                  <option value="title">Alphabetical</option>
                  <option value="type">Type</option>
                </select>

                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-neutral-100 text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-neutral-100 text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl h-48 animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && !error && (
              <>
                {paginatedDocuments.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {paginatedDocuments.map((doc) => {
                        const isSelected = selectedDocs.includes(doc.id);
                        const preview = (doc.content || '').slice(0, 150);
                        return (
                          <div
                            key={doc.id}
                            role="button"
                            tabIndex={0}
                            className={`relative bg-white border rounded-2xl p-5 hover:shadow-lg transition-all duration-200 group flex flex-col h-full cursor-pointer
                                    ${
                                      isSelected
                                        ? 'border-slate-500 ring-1 ring-slate-500 bg-slate-50/10'
                                        : 'border-slate-200 hover:border-slate-200'
                                    }`}
                            onClick={() => handleView(doc)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleView(doc);
                              }
                            }}
                          >
                            <div
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(doc.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleSelection(doc.id);
                                }
                              }}
                              className={`absolute top-4 right-4 z-10 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer
                                        ${
                                          isSelected
                                            ? 'bg-slate-600 border-slate-600 text-white'
                                            : 'bg-white border-slate-200 text-transparent opacity-0 group-hover:opacity-100'
                                        }`}
                            >
                              <Check size={12} strokeWidth={3} />
                            </div>

                            <div className="flex items-start justify-between mb-4">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getTypeColor(doc.type)}`}
                              >
                                {getTypeIcon(doc.type)}
                              </div>
                            </div>

                            <div className="flex-1 mb-4">
                              <h3
                                className="text-base font-bold text-neutral-900 line-clamp-1 mb-1 group-hover:text-slate-600 transition-colors"
                                title={doc.title}
                              >
                                {doc.title}
                              </h3>
                              <p className="text-xs text-slate-500 mb-2">{getTypeLabel(doc.type)}</p>

                              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 h-20 overflow-hidden relative">
                                <p className="text-[10px] text-slate-400 font-mono leading-relaxed opacity-70">
                                  {preview}...
                                </p>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} />
                                {formatDate(doc.updatedAt)}
                              </div>
                              {doc.atsScore !== null && (
                                <div className={`px-2 py-0.5 rounded-md border ${getScoreColor(doc.atsScore)} text-[10px]`}>
                                  {doc.atsScore}% Score
                                </div>
                              )}
                            </div>

                            <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(doc);
                                }}
                                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-slate-600 hover:border-slate-200 shadow-sm"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(doc);
                                }}
                                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-slate-600 hover:border-slate-200 shadow-sm"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wide">
                          <tr>
                            <th className="px-6 py-3 w-10">
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={selectAll}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    selectAll();
                                  }
                                }}
                                className="w-4 h-4 border border-slate-300 rounded cursor-pointer hover:border-slate-500 flex items-center justify-center"
                              >
                                {selectedDocs.length === paginatedDocuments.length && selectedDocs.length > 0 && (
                                  <div className="w-2 h-2 bg-slate-600 rounded-sm" />
                                )}
                              </div>
                            </th>
                            <th className="px-6 py-3">Document Name</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Last Modified</th>
                            <th className="px-6 py-3">Score</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedDocuments.map((doc) => {
                            const isSelected = selectedDocs.includes(doc.id);
                            return (
                              <tr
                                key={doc.id}
                                className={`hover:bg-slate-50 group cursor-pointer ${isSelected ? 'bg-slate-50/30' : ''}`}
                                onClick={() => handleView(doc)}
                              >
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleSelection(doc.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleSelection(doc.id);
                                      }
                                    }}
                                    className={`w-4 h-4 border rounded cursor-pointer flex items-center justify-center transition-colors ${
                                      isSelected ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-300'
                                    }`}
                                  >
                                    {isSelected && <Check size={10} strokeWidth={3} />}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-bold text-neutral-900 group-hover:text-slate-600 transition-colors">
                                    {doc.title}
                                  </div>
                                  {doc.company && <div className="text-xs text-slate-400">{doc.company}</div>}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                                    {getTypeIcon(doc.type)} {getTypeLabel(doc.type)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(doc.updatedAt)}</td>
                                <td className="px-6 py-4">
                                  {doc.atsScore != null ? (
                                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${getScoreColor(doc.atsScore)}`}>
                                      {doc.atsScore}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(doc);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(doc);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                                    >
                                      <Download size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void handleDelete(doc.id);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="col-span-full py-20 bg-white border-2 border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <FolderOpen className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {searchQuery ? 'No matches found' : 'Your vault is empty'}
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-sm">
                      {searchQuery
                        ? 'Try adjusting your search terms or filters.'
                        : 'Start building your career history by uploading or creating your first document.'}
                    </p>
                    <div className="flex gap-4">
                      {searchQuery ? (
                        <button
                          type="button"
                          onClick={() => void refreshDocuments()}
                          className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                          Refresh
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCreate}
                          className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-neutral-900/20 flex items-center gap-2"
                        >
                          <Plus size={18} /> Create Document
                        </button>
                      )}
                    </div>

                    {!searchQuery && (
                      <div className="mt-8 pt-8 border-t border-slate-100 w-full max-w-md">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                          Or
                        </div>
                        <div className="border-2 border-slate-100 rounded-xl p-4 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50/30 transition-all border-dashed group">
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                            <span className="text-sm font-medium text-slate-500 group-hover:text-slate-600 transition-colors">
                              Import existing resume (PDF/Docx)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {librarySection === 'documents' && !isLoading && !error && paginatedDocuments.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-auto pt-6">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-bold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {viewingDoc && (
        <div
          className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-[10001] flex items-center justify-center p-4 lg:p-8"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="bg-slate-100 rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getTypeColor(viewingDoc.type)}`}>
                  {getTypeIcon(viewingDoc.type)}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-neutral-900">{viewingDoc.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Last edited {formatDate(viewingDoc.updatedAt)}</span>
                    <span>•</span>
                    <span className="capitalize">{viewingDoc.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(viewingDoc)}
                  className="p-2 text-slate-500 hover:bg-slate-50 hover:text-neutral-900 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Edit2 size={16} /> <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(viewingDoc)}
                  className="p-2 text-slate-500 hover:bg-slate-50 hover:text-neutral-900 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Download size={16} /> <span className="hidden sm:inline">Export</span>
                </button>
                <div className="h-6 w-px bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100/50">
              <div className="bg-white shadow-xl w-full max-w-[800px] min-h-[800px] p-12 md:p-16 relative">
                {(viewingDoc.jobTitle || viewingDoc.company) && (
                  <div className="mb-8 pb-8 border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        {viewingDoc.personalInfo?.name || 'Candidate Name'}
                      </h1>
                      <p className="text-slate-500 text-lg">{viewingDoc.jobTitle || 'Job Title'}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p>{viewingDoc.company}</p>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                <div className="prose prose-slate max-w-none font-serif leading-relaxed text-slate-800">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{viewingDoc.content}</pre>
                </div>
              </div>
            </div>

            {viewingDoc.atsScore !== null && (
              <div className="bg-white border-t border-slate-200 p-3 flex justify-center shrink-0">
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                  <Zap size={12} className="fill-emerald-700" />
                  ATS Compatibility: {viewingDoc.atsScore}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {editingDoc && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
          onClick={() => {
            setEditingDoc(null);
            setSaveError(null);
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-neutral-900">Edit Document</h2>
              <button
                type="button"
                onClick={() => {
                  setEditingDoc(null);
                  setSaveError(null);
                }}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-neutral-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-6">
              {saveError && (
                <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-2">
                  <AlertCircle size={18} />
                  {saveError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase">Title</label>
                    <input
                      type="text"
                      value={editingDoc.title}
                      onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase">Job Title</label>
                      <input
                        type="text"
                        value={editingDoc.jobTitle}
                        onChange={(e) => {
                          const next = { ...editingDoc, jobTitle: e.target.value };
                          setEditingDoc(next);
                          applyVaultDocumentToWorkflowContext(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-neutral-900 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase">Company</label>
                      <input
                        type="text"
                        value={editingDoc.company}
                        onChange={(e) => setEditingDoc({ ...editingDoc, company: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-neutral-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase">Status</label>
                      <select
                        value={editingDoc.status}
                        onChange={(e) =>
                          setEditingDoc({ ...editingDoc, status: e.target.value as 'draft' | 'completed' })
                        }
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
                      >
                        <option value="draft">Draft</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase">ATS Score</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editingDoc.atsScore ?? ''}
                        onChange={(e) =>
                          setEditingDoc({
                            ...editingDoc,
                            atsScore: e.target.value ? parseInt(e.target.value, 10) : null,
                          })
                        }
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Content Editor</label>
                  <span className="text-xs text-slate-400">Markdown supported</span>
                </div>
                <textarea
                  value={editingDoc.content}
                  onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all font-mono text-sm leading-relaxed min-h-[300px]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoc(null);
                    setSaveError(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveEdit()}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-neutral-900/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {creatingDoc && (
        <CreateDocumentModal
          onClose={() => {
            setCreatingDoc(false);
            setSaveError(null);
          }}
          onSave={(d) => void handleSaveCreate(d)}
          error={saveError}
        />
      )}
    </div>
  );
}
